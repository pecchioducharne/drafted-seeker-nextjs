/**
 * Gmail API Integration Utilities
 * Handles email sending with proper authentication and quota management
 */

import { EMAIL_LIMITS } from './constants';
import { authenticateGmail, tokenManager } from './gmailAuth';
import { generateEmailSubject, generateHtmlEmail, validateEmailContent } from './emailUtils';

/**
 * Quota Manager - tracks daily email sending limits
 */
class GmailQuotaManager {
  constructor() {
    this.dailyQuotaKey = 'gmail_daily_quota';
    this.lastResetKey = 'gmail_quota_reset';
  }

  getTodayKey() {
    return new Date().toISOString().split('T')[0];
  }

  getDailyUsage() {
    if (typeof window === 'undefined') return 0;
    
    const today = this.getTodayKey();
    const lastReset = localStorage.getItem(this.lastResetKey);
    
    if (lastReset !== today) {
      this.resetDailyQuota();
      return 0;
    }
    
    return parseInt(localStorage.getItem(this.dailyQuotaKey) || '0');
  }

  incrementUsage(count = 1) {
    if (typeof window === 'undefined') return 0;
    
    const today = this.getTodayKey();
    const currentUsage = this.getDailyUsage();
    const newUsage = currentUsage + count;
    
    localStorage.setItem(this.dailyQuotaKey, newUsage.toString());
    localStorage.setItem(this.lastResetKey, today);
    
    return newUsage;
  }

  resetDailyQuota() {
    if (typeof window === 'undefined') return;
    
    const today = this.getTodayKey();
    localStorage.setItem(this.dailyQuotaKey, '0');
    localStorage.setItem(this.lastResetKey, today);
  }

  canSendEmail() {
    return this.getDailyUsage() < EMAIL_LIMITS.MAX_DAILY_EMAILS;
  }

  getRemainingQuota() {
    return Math.max(0, EMAIL_LIMITS.MAX_DAILY_EMAILS - this.getDailyUsage());
  }
}

export const quotaManager = new GmailQuotaManager();

// authenticateGmail is imported from gmailAuth.js - no need to redefine it here

/**
 * Prepare email for Gmail API (RFC 2822 format)
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} body - Email body (HTML or plain text)
 * @param {string} fromName - Sender name
 * @returns {string} Base64 encoded email
 */
export const prepareGmailEmail = (to, subject, body, fromName = 'Drafted User') => {
  // Determine if body is HTML
  const isHTML = body.includes('<') && body.includes('>');
  
  const emailLines = [
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    `Content-Type: ${isHTML ? 'text/html' : 'text/plain'}; charset=UTF-8`,
    '',
    body
  ];

  const email = emailLines.join('\r\n');
  
  // Base64 URL-safe encoding
  const base64 = btoa(unescape(encodeURIComponent(email)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return base64;
};

/**
 * Send email via Gmail API
 * @param {Object} options - Email options
 * @returns {Promise<Object>} Result with success status
 */
export const sendGmailEmail = async ({
  recipient,
  subject,
  body,
  company,
  onProgress
}) => {
  // Validate inputs
  if (!recipient || !subject || !body) {
    return { success: false, error: 'Missing required email fields' };
  }

  // Check quota
  if (!quotaManager.canSendEmail()) {
    return {
      success: false,
      reason: 'quota_exceeded',
      message: `Daily sending limit reached (${EMAIL_LIMITS.MAX_DAILY_EMAILS} emails).`
    };
  }

  // Get token
  let token = tokenManager.getAccessToken();
  if (!token) {
    onProgress?.('authenticating');
    try {
      token = await authenticateGmail();
    } catch (authError) {
      return { success: false, error: authError.message };
    }
  }

  onProgress?.('sending');

  // Prepare email
  const encodedEmail = prepareGmailEmail(recipient, subject, body);

  // Send via Gmail API
  try {
    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ raw: encodedEmail })
    });

    if (response.ok) {
      const result = await response.json();
      quotaManager.incrementUsage(1);
      
      return {
        success: true,
        messageId: result.id,
        company,
        recipient,
        quotaRemaining: quotaManager.getRemainingQuota()
      };
    }

    // Handle errors
    if (response.status === 401) {
      tokenManager.clearTokens();
      return { success: false, error: 'Authentication expired. Please try again.' };
    }

    const errorText = await response.text();
    return { success: false, error: `Gmail API error: ${errorText}` };

  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Get current quota status
 */
export const getGmailQuotaStatus = () => ({
  used: quotaManager.getDailyUsage(),
  remaining: quotaManager.getRemainingQuota(),
  limit: EMAIL_LIMITS.MAX_DAILY_EMAILS,
  canSend: quotaManager.canSendEmail()
});

export default {
  authenticateGmail,
  sendGmailEmail,
  tokenManager,
  quotaManager,
  getGmailQuotaStatus,
  prepareGmailEmail
};
