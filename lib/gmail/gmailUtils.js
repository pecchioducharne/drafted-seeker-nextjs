/**
 * Gmail API Integration Utilities
 * Handles OAuth flow, token management, and email sending
 */

import { CLIENT_ID, SCOPE, EMAIL_LIMITS, AUTH_CONFIG } from './constants';

// Token storage keys
const TOKEN_KEY = 'gmail_access_token';
const TOKEN_EXPIRY_KEY = 'gmail_token_expiry';
const AUTH_IN_PROGRESS_KEY = 'gmail_auth_in_progress';
const AUTH_SUCCESS_KEY = 'gmail_auth_success';
const AUTH_ERROR_KEY = 'gmail_auth_error';

/**
 * Token Manager - handles localStorage token operations
 */
class GmailTokenManager {
  constructor() {
    this.tokenKey = TOKEN_KEY;
    this.expiryKey = TOKEN_EXPIRY_KEY;
  }

  getAccessToken() {
    try {
      if (typeof window === 'undefined') return null;
      
      const token = localStorage.getItem(this.tokenKey);
      const expiry = parseInt(localStorage.getItem(this.expiryKey) || '0');
      
      // Check if token exists and isn't expired (with 5min buffer)
      if (!token || Date.now() >= expiry - AUTH_CONFIG.TOKEN_REFRESH_BUFFER_MS) {
        return null;
      }
      
      return token;
    } catch (error) {
      console.error('[GmailTokenManager] Error retrieving token:', error);
      return null;
    }
  }

  storeToken(accessToken, expiresIn = 3600) {
    try {
      if (typeof window === 'undefined') return;
      
      const expiryTime = Date.now() + (expiresIn * 1000);
      localStorage.setItem(this.tokenKey, accessToken);
      localStorage.setItem(this.expiryKey, expiryTime.toString());
    } catch (error) {
      console.error('[GmailTokenManager] Error storing token:', error);
    }
  }

  clearTokens() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.expiryKey);
  }

  hasValidTokens() {
    return !!this.getAccessToken();
  }
}

export const tokenManager = new GmailTokenManager();

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

/**
 * Clear auth state for fresh start
 */
const clearAuthState = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_IN_PROGRESS_KEY);
  localStorage.removeItem(AUTH_SUCCESS_KEY);
  localStorage.removeItem(AUTH_ERROR_KEY);
};

/**
 * Authenticate with Gmail via OAuth popup
 * @returns {Promise<string>} Access token
 */
export const authenticateGmail = async () => {
  // Check for existing valid token
  const existingToken = tokenManager.getAccessToken();
  if (existingToken) {
    return existingToken;
  }

  // Clear any previous auth state
  clearAuthState();

  const authStartTime = Date.now();
  localStorage.setItem(AUTH_IN_PROGRESS_KEY, authStartTime.toString());

  // Build OAuth URL
  const redirectUri = typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:3000/oauth2callback'
    : `${window.location.origin}/oauth2callback`;

  const state = Math.random().toString(36).substring(2, 15);

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'token');
  authUrl.searchParams.set('scope', SCOPE);
  authUrl.searchParams.set('prompt', 'consent');
  authUrl.searchParams.set('include_granted_scopes', 'true');
  authUrl.searchParams.set('state', state);

  // Open popup
  const width = AUTH_CONFIG.POPUP_WIDTH || 500;
  const height = AUTH_CONFIG.POPUP_HEIGHT || 600;
  const left = Math.max(0, (window.innerWidth - width) / 2 + window.screenX);
  const top = Math.max(0, (window.innerHeight - height) / 2 + window.screenY);

  const popup = window.open(
    authUrl.toString(),
    'GmailAuth',
    `width=${width},height=${height},left=${left},top=${top},popup=1,scrollbars=yes,resizable=yes`
  );

  if (!popup) {
    clearAuthState();
    throw new Error('Popup was blocked. Please allow popups for this site and try again.');
  }

  // Poll for token in localStorage
  return new Promise((resolve, reject) => {
    const maxWaitTime = 5 * 60 * 1000; // 5 minutes
    const pollInterval = 500;
    const startTime = Date.now();
    let hasResolved = false;
    let popupClosedDetected = false;
    let popupClosedTime = null;

    const checkForToken = () => {
      const elapsed = Date.now() - startTime;

      if (elapsed > maxWaitTime) {
        cleanup();
        reject(new Error('Authentication timed out. Please try again.'));
        return;
      }

      // Check for success
      const successFlag = localStorage.getItem(AUTH_SUCCESS_KEY);
      if (successFlag) {
        const token = tokenManager.getAccessToken();
        if (token) {
          cleanup();
          resolve(token);
          return;
        }
      }

      // Check for error
      const errorFlag = localStorage.getItem(AUTH_ERROR_KEY);
      if (errorFlag) {
        cleanup();
        reject(new Error(errorFlag));
        return;
      }

      // Check if popup closed
      if (elapsed > 10000) {
        try {
          if (popup.closed && !popupClosedDetected) {
            popupClosedDetected = true;
            popupClosedTime = Date.now();
          }

          if (popupClosedDetected) {
            const timeSinceClose = Date.now() - popupClosedTime;

            const finalToken = tokenManager.getAccessToken();
            if (finalToken) {
              cleanup();
              resolve(finalToken);
              return;
            }

            if (timeSinceClose > 15000) {
              cleanup();
              reject(new Error('Sign-in was cancelled. Please try again.'));
              return;
            }
          }
        } catch (e) {
          // Cross-origin error - popup is on Google's domain, keep polling
        }
      }

      setTimeout(checkForToken, pollInterval);
    };

    const cleanup = () => {
      if (hasResolved) return;
      hasResolved = true;
      clearAuthState();
      try {
        if (popup && !popup.closed) {
          popup.close();
        }
      } catch (e) {
        // Ignore
      }
    };

    setTimeout(checkForToken, pollInterval);
  });
};

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
