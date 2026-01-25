/**
 * ============================================================================
 * BULLETPROOF GMAIL AUTHENTICATION MODULE
 * ============================================================================
 * 
 * This module handles Gmail OAuth 2.0 authentication with:
 * - Standard OAuth 2.0 popup flow
 * - localStorage-based token transfer (bulletproof, no cross-origin issues)
 * - BroadcastChannel backup for real-time communication
 * - Extended retry logic to eliminate race conditions
 * - Comprehensive debug logging
 * 
 * Architecture:
 * 1. Main window opens popup to Google OAuth
 * 2. User authenticates with Google
 * 3. Google redirects to /oauth2callback with token in URL hash
 * 4. Callback page extracts token, stores in localStorage, notifies via BroadcastChannel
 * 5. Main window detects token via BroadcastChannel OR localStorage polling
 * 
 * ============================================================================
 */

import { CLIENT_ID, SCOPE } from './constants';

// =============================================================================
// CONSTANTS
// =============================================================================

// LocalStorage keys (shared with Oauth2Callback.jsx)
export const TOKEN_KEY = 'gmail_access_token';
export const TOKEN_EXPIRY_KEY = 'gmail_token_expiry';
export const AUTH_SUCCESS_KEY = 'gmail_auth_success';
export const AUTH_ERROR_KEY = 'gmail_auth_error';
export const AUTH_READY_KEY = 'gmail_auth_ready';

// BroadcastChannel for cross-tab communication
const BROADCAST_CHANNEL_NAME = 'gmail_auth_channel';

// Timing configuration
const CONFIG = {
  POPUP_WIDTH: 500,
  POPUP_HEIGHT: 600,
  POLL_INTERVAL_MS: 300,           // Check every 300ms
  MAX_WAIT_TIME_MS: 5 * 60 * 1000, // 5 minutes max
  MIN_AUTH_TIME_MS: 10000,         // Don't check popup.closed for first 10 seconds
  GRACE_PERIOD_AFTER_CLOSE_MS: 15000, // 15 seconds after popup closes to find token
  TOKEN_BUFFER_MS: 5 * 60 * 1000,  // Consider token expired 5 min before actual expiry
};

// =============================================================================
// TOKEN MANAGER
// =============================================================================

class GmailTokenManager {
  constructor() {
    this.tokenKey = TOKEN_KEY;
    this.expiryKey = TOKEN_EXPIRY_KEY;
  }

  /**
   * Get valid access token from localStorage
   * @returns {string|null} Access token or null if expired/missing
   */
  getAccessToken() {
    try {
      const token = localStorage.getItem(this.tokenKey);
      const expiry = parseInt(localStorage.getItem(this.expiryKey) || '0', 10);
      
      if (!token) {
        console.log('[GmailTokenManager] No token in storage');
        return null;
      }
      
      // Check expiry with buffer
      const now = Date.now();
      const effectiveExpiry = expiry - CONFIG.TOKEN_BUFFER_MS;
      
      if (now >= effectiveExpiry) {
        console.log('[GmailTokenManager] Token expired or expiring soon');
        this.clearTokens();
        return null;
      }
      
      const minutesLeft = Math.round((expiry - now) / 60000);
      console.log(`[GmailTokenManager] Valid token found, expires in ${minutesLeft} minutes`);
      return token;
    } catch (error) {
      console.error('[GmailTokenManager] Error reading token:', error);
      return null;
    }
  }

  /**
   * Store access token in localStorage
   */
  storeToken(accessToken, expiresInSeconds = 3600) {
    try {
      const expiryTime = Date.now() + (expiresInSeconds * 1000);
      localStorage.setItem(this.tokenKey, accessToken);
      localStorage.setItem(this.expiryKey, expiryTime.toString());
      console.log('[GmailTokenManager] Token stored, expires:', new Date(expiryTime).toISOString());
    } catch (error) {
      console.error('[GmailTokenManager] Error storing token:', error);
    }
  }

  /**
   * Clear all tokens from localStorage
   */
  clearTokens() {
    try {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.expiryKey);
      localStorage.removeItem(AUTH_SUCCESS_KEY);
      localStorage.removeItem(AUTH_ERROR_KEY);
      localStorage.removeItem(AUTH_READY_KEY);
      console.log('[GmailTokenManager] Tokens cleared');
    } catch (error) {
      console.error('[GmailTokenManager] Error clearing tokens:', error);
    }
  }

  /**
   * Check if we have a valid token
   */
  hasValidToken() {
    return this.getAccessToken() !== null;
  }
}

export const tokenManager = new GmailTokenManager();

// =============================================================================
// CLEAR AUTH STATE
// =============================================================================

function clearAuthState() {
  localStorage.removeItem(AUTH_SUCCESS_KEY);
  localStorage.removeItem(AUTH_ERROR_KEY);
  localStorage.removeItem(AUTH_READY_KEY);
}

// =============================================================================
// MAIN AUTHENTICATION FUNCTION
// =============================================================================

/**
 * Authenticate with Gmail using OAuth 2.0 popup flow
 * @returns {Promise<string>} Access token
 * @throws {Error} If authentication fails or is cancelled
 */
export async function authenticateGmail() {
  const authId = `AUTH_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  
  console.log(`[DEBUG][${authId}] ========================================`);
  console.log(`[DEBUG][${authId}] GMAIL AUTHENTICATION START`);
  console.log(`[DEBUG][${authId}] ========================================`);
  console.log(`[DEBUG][${authId}] Timestamp: ${new Date().toISOString()}`);
  
  // Step 1: Check for existing valid token
  console.log(`[DEBUG][${authId}] Checking for existing token...`);
  const existingToken = tokenManager.getAccessToken();
  
  if (existingToken) {
    console.log(`[DEBUG][${authId}] Valid cached token found!`);
    console.log(`[DEBUG][${authId}] Token length: ${existingToken.length}`);
    console.log(`[DEBUG][${authId}] ========================================`);
    console.log(`[DEBUG][${authId}] AUTH SUCCESS (CACHED)`);
    console.log(`[DEBUG][${authId}] ========================================`);
    return existingToken;
  }

  console.log(`[DEBUG][${authId}] No cached token, starting OAuth flow...`);

  // Step 2: Clear previous auth state
  console.log(`[DEBUG][${authId}] Clearing previous auth state...`);
  clearAuthState();

  // Step 3: Build OAuth URL
  const redirectUri = window.location.hostname === 'localhost' 
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

  console.log(`[DEBUG][${authId}] OAuth URL built:`);
  console.log(`[DEBUG][${authId}]   Client ID: ${CLIENT_ID.substring(0, 20)}...`);
  console.log(`[DEBUG][${authId}]   Redirect URI: ${redirectUri}`);
  console.log(`[DEBUG][${authId}]   State: ${state}`);

  // Step 4: Calculate popup position
  const left = Math.max(0, (window.innerWidth - CONFIG.POPUP_WIDTH) / 2 + window.screenX);
  const top = Math.max(0, (window.innerHeight - CONFIG.POPUP_HEIGHT) / 2 + window.screenY);

  console.log(`[DEBUG][${authId}] Opening popup at (${left}, ${top})...`);

  // Step 5: Open popup
  const popup = window.open(
    authUrl.toString(),
    'GmailAuth',
    `width=${CONFIG.POPUP_WIDTH},height=${CONFIG.POPUP_HEIGHT},left=${left},top=${top},popup=1,scrollbars=yes,resizable=yes`
  );

  if (!popup) {
    console.error(`[DEBUG][${authId}] POPUP BLOCKED!`);
    throw new Error('Popup was blocked by the browser. Please allow popups for this site and try again.');
  }

  console.log(`[DEBUG][${authId}] Popup opened successfully`);

  // Step 6: Wait for authentication
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    let resolved = false;
    let popupClosed = false;
    let popupCloseTime = null;
    let broadcastChannel = null;
    let pollInterval = null;

    // Cleanup function
    const cleanup = () => {
      if (resolved) return;
      resolved = true;
      
      if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
      }
      
      if (broadcastChannel) {
        try {
          broadcastChannel.close();
        } catch (e) {
          // Ignore
        }
        broadcastChannel = null;
      }
      
      try {
        if (popup && !popup.closed) {
          popup.close();
        }
      } catch (e) {
        // Ignore cross-origin errors
      }
    };

    // Success handler
    const handleSuccess = (token, source) => {
      if (resolved) return;
      
      const elapsed = Date.now() - startTime;
      console.log(`[DEBUG][${authId}] ========================================`);
      console.log(`[DEBUG][${authId}] AUTH SUCCESS via ${source}`);
      console.log(`[DEBUG][${authId}] Time: ${elapsed}ms`);
      console.log(`[DEBUG][${authId}] Token length: ${token.length}`);
      console.log(`[DEBUG][${authId}] ========================================`);
      
      cleanup();
      resolve(token);
    };

    // Error handler  
    const handleError = (message, source) => {
      if (resolved) return;
      
      const elapsed = Date.now() - startTime;
      console.error(`[DEBUG][${authId}] ========================================`);
      console.error(`[DEBUG][${authId}] AUTH FAILED via ${source}`);
      console.error(`[DEBUG][${authId}] Time: ${elapsed}ms`);
      console.error(`[DEBUG][${authId}] Error: ${message}`);
      console.error(`[DEBUG][${authId}] ========================================`);
      
      cleanup();
      reject(new Error(message));
    };

    // Set up BroadcastChannel for real-time notification
    try {
      broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      broadcastChannel.onmessage = (event) => {
        console.log(`[DEBUG][${authId}] BroadcastChannel message:`, event.data);
        
        if (event.data.type === 'AUTH_SUCCESS' && event.data.token) {
          handleSuccess(event.data.token, 'BroadcastChannel');
        } else if (event.data.type === 'AUTH_ERROR') {
          handleError(event.data.error || 'Authentication failed', 'BroadcastChannel');
        }
      };
      console.log(`[DEBUG][${authId}] BroadcastChannel set up`);
    } catch (e) {
      console.log(`[DEBUG][${authId}] BroadcastChannel not available, using localStorage polling only`);
    }

    // Polling function to check localStorage and popup status
    const checkAuth = () => {
      if (resolved) return;
      
      const elapsed = Date.now() - startTime;

      // Check for timeout
      if (elapsed > CONFIG.MAX_WAIT_TIME_MS) {
        handleError('Authentication timed out. Please try again.', 'timeout');
        return;
      }

      // Check localStorage for success
      const successFlag = localStorage.getItem(AUTH_SUCCESS_KEY);
      if (successFlag) {
        const token = tokenManager.getAccessToken();
        if (token) {
          handleSuccess(token, 'localStorage');
          return;
        }
      }

      // Check localStorage for error
      const errorFlag = localStorage.getItem(AUTH_ERROR_KEY);
      if (errorFlag) {
        handleError(errorFlag, 'localStorage');
        return;
      }

      // Check if popup is closed (but NOT in the first MIN_AUTH_TIME_MS)
      // This prevents false "closed" detection when popup navigates to Google
      if (elapsed > CONFIG.MIN_AUTH_TIME_MS) {
        try {
          if (popup.closed && !popupClosed) {
            popupClosed = true;
            popupCloseTime = Date.now();
            console.log(`[DEBUG][${authId}] Popup closed at ${elapsed}ms`);
          }
        } catch (e) {
          // Cross-origin error - popup is on Google's domain, still authenticating
        }
      }

      // If popup is closed, give it extra time for token to appear
      if (popupClosed && popupCloseTime) {
        const timeSinceClose = Date.now() - popupCloseTime;
        
        // Keep checking for a grace period after popup closes
        if (timeSinceClose > CONFIG.GRACE_PERIOD_AFTER_CLOSE_MS) {
          // Final check
          const finalToken = tokenManager.getAccessToken();
          if (finalToken) {
            handleSuccess(finalToken, 'localStorage-late');
            return;
          }
          
          const finalSuccess = localStorage.getItem(AUTH_SUCCESS_KEY);
          if (finalSuccess) {
            const token = tokenManager.getAccessToken();
            if (token) {
              handleSuccess(token, 'localStorage-late');
              return;
            }
          }

          // No token after grace period - user cancelled
          handleError(
            'Authentication was cancelled. Please complete the Google sign-in next time.',
            'popup-closed'
          );
          return;
        }
      }
    };

    // Start polling
    console.log(`[DEBUG][${authId}] Starting auth polling (every ${CONFIG.POLL_INTERVAL_MS}ms)...`);
    pollInterval = setInterval(checkAuth, CONFIG.POLL_INTERVAL_MS);
    
    // Also check immediately
    checkAuth();
  });
}

// =============================================================================
// SEND EMAIL VIA GMAIL API
// =============================================================================

/**
 * Send an email via Gmail API
 * @param {Object} options - Email options
 * @param {string} options.recipient - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.body - Email body (HTML supported)
 * @param {string} options.company - Company name (for logging)
 * @returns {Promise<Object>} Result with success status and message ID
 */
export async function sendGmailEmail({ recipient, subject, body, company }) {
  const sendId = `SEND_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  
  console.log(`[DEBUG][${sendId}] ========================================`);
  console.log(`[DEBUG][${sendId}] EMAIL SEND START`);
  console.log(`[DEBUG][${sendId}] ========================================`);
  console.log(`[DEBUG][${sendId}] Company: ${company}`);
  console.log(`[DEBUG][${sendId}] Recipient: ${recipient}`);
  console.log(`[DEBUG][${sendId}] Subject: ${subject}`);
  console.log(`[DEBUG][${sendId}] Body length: ${body?.length || 0} chars`);

  try {
    // Validate inputs
    if (!recipient || !recipient.includes('@')) {
      throw new Error('Invalid recipient email');
    }
    if (!subject) {
      throw new Error('Subject is required');
    }
    if (!body || body.length < 50) {
      throw new Error(`Email body too short (${body?.length || 0} chars, min 50)`);
    }

    // Get access token (will authenticate if needed)
    console.log(`[DEBUG][${sendId}] Getting access token...`);
    let accessToken = tokenManager.getAccessToken();
    
    if (!accessToken) {
      console.log(`[DEBUG][${sendId}] No token, authenticating...`);
      accessToken = await authenticateGmail();
    }
    
    console.log(`[DEBUG][${sendId}] Token acquired, preparing email...`);

    // Build email in RFC 2822 format
    const fromEmail = 'me'; // Gmail API uses 'me' for authenticated user
    const emailLines = [
      `To: ${recipient}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=UTF-8',
      '',
      body
    ];
    const email = emailLines.join('\r\n');
    
    // Base64url encode
    const encodedEmail = btoa(unescape(encodeURIComponent(email)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    console.log(`[DEBUG][${sendId}] Email encoded, sending via Gmail API...`);

    // Send via Gmail API
    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ raw: encodedEmail })
    });

    console.log(`[DEBUG][${sendId}] Response status: ${response.status}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `HTTP ${response.status}`;
      
      // Check for auth errors
      if (response.status === 401 || response.status === 403) {
        console.log(`[DEBUG][${sendId}] Token expired, clearing...`);
        tokenManager.clearTokens();
        throw new Error('Gmail authentication expired. Please try again.');
      }
      
      throw new Error(`Gmail API error: ${errorMessage}`);
    }

    const result = await response.json();
    
    console.log(`[DEBUG][${sendId}] ========================================`);
    console.log(`[DEBUG][${sendId}] EMAIL SEND SUCCESS`);
    console.log(`[DEBUG][${sendId}] Message ID: ${result.id}`);
    console.log(`[DEBUG][${sendId}] ========================================`);

    return {
      success: true,
      messageId: result.id,
      threadId: result.threadId
    };

  } catch (error) {
    console.error(`[DEBUG][${sendId}] ========================================`);
    console.error(`[DEBUG][${sendId}] EMAIL SEND FAILED`);
    console.error(`[DEBUG][${sendId}] Error: ${error.message}`);
    console.error(`[DEBUG][${sendId}] Stack: ${error.stack}`);
    console.error(`[DEBUG][${sendId}] ========================================`);

    return {
      success: false,
      error: error.message
    };
  }
}

// =============================================================================
// MASS NUDGE FUNCTION
// =============================================================================

/**
 * Send emails to multiple companies
 * @param {Object} options - Mass nudge options
 * @param {Array} options.companies - Array of { name, email } objects
 * @param {Object} options.userData - User data for email template
 * @param {Function} options.generateSubject - Function to generate subject
 * @param {Function} options.generateBody - Function to generate body
 * @param {Function} options.onProgress - Progress callback
 * @returns {Promise<Object>} Results summary
 */
export async function sendMassNudge({
  companies,
  userData,
  generateSubject,
  generateBody,
  onProgress
}) {
  const nudgeId = `MASS_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  
  console.log(`[DEBUG][${nudgeId}] ========================================`);
  console.log(`[DEBUG][${nudgeId}] MASS NUDGE START`);
  console.log(`[DEBUG][${nudgeId}] ========================================`);
  console.log(`[DEBUG][${nudgeId}] Total companies: ${companies.length}`);
  console.log(`[DEBUG][${nudgeId}] User: ${userData?.email}`);

  const results = {
    total: companies.length,
    sent: 0,
    failed: 0,
    skipped: 0,
    errors: []
  };

  try {
    // Pre-authenticate
    console.log(`[DEBUG][${nudgeId}] Pre-authenticating...`);
    await authenticateGmail();
    console.log(`[DEBUG][${nudgeId}] Pre-authentication successful`);

    // Process each company
    for (let i = 0; i < companies.length; i++) {
      const company = companies[i];
      const companyName = company.name || company.companyName;
      const email = company.email || company.recruiterEmail;

      console.log(`[DEBUG][${nudgeId}] Processing ${i + 1}/${companies.length}: ${companyName}`);

      // Report progress
      if (onProgress) {
        onProgress({
          current: i + 1,
          total: companies.length,
          company: companyName,
          sent: results.sent,
          failed: results.failed
        });
      }

      // Validate email
      if (!email || !email.includes('@')) {
        console.log(`[DEBUG][${nudgeId}] Skipping ${companyName}: invalid email`);
        results.skipped++;
        continue;
      }

      try {
        // Generate email content
        const subject = generateSubject(userData);
        const body = generateBody(companyName, userData);

        // Send email
        const sendResult = await sendGmailEmail({
          recipient: email,
          subject,
          body,
          company: companyName
        });

        if (sendResult.success) {
          results.sent++;
          console.log(`[DEBUG][${nudgeId}] Sent to ${companyName}`);
        } else {
          results.failed++;
          results.errors.push({ company: companyName, error: sendResult.error });
          console.log(`[DEBUG][${nudgeId}] Failed for ${companyName}: ${sendResult.error}`);
        }

        // Rate limiting: wait between emails
        if (i < companies.length - 1) {
          const delay = 1000 + Math.random() * 500; // 1-1.5 seconds
          await new Promise(resolve => setTimeout(resolve, delay));
        }

      } catch (error) {
        results.failed++;
        results.errors.push({ company: companyName, error: error.message });
        console.error(`[DEBUG][${nudgeId}] Error for ${companyName}:`, error);
      }
    }

    console.log(`[DEBUG][${nudgeId}] ========================================`);
    console.log(`[DEBUG][${nudgeId}] MASS NUDGE COMPLETE`);
    console.log(`[DEBUG][${nudgeId}] Sent: ${results.sent}/${results.total}`);
    console.log(`[DEBUG][${nudgeId}] Failed: ${results.failed}`);
    console.log(`[DEBUG][${nudgeId}] Skipped: ${results.skipped}`);
    console.log(`[DEBUG][${nudgeId}] ========================================`);

    return {
      success: true,
      ...results
    };

  } catch (error) {
    console.error(`[DEBUG][${nudgeId}] MASS NUDGE FAILED:`, error);
    
    return {
      success: false,
      error: error.message,
      ...results
    };
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  authenticateGmail,
  sendGmailEmail,
  sendMassNudge,
  tokenManager,
  TOKEN_KEY,
  TOKEN_EXPIRY_KEY,
  AUTH_SUCCESS_KEY,
  AUTH_ERROR_KEY,
  BROADCAST_CHANNEL_NAME
};

