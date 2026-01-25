import { CLIENT_ID, SCOPE, EMAIL_LIMITS, AUTH_CONFIG } from './constants';
import { firebaseFunctionsFetch } from './netlify';
import { prepareGmailApiEmail, validateEmailContent } from './emailUtils';
import { recordNudgeForUser } from '../backend/firebaseUtils';
import { isUnsubscribed } from './unsubscribe';

// =============================================================================
// BULLETPROOF GMAIL OAUTH - LocalStorage-Based Token Transfer
// =============================================================================
// This implementation uses:
// - Standard OAuth 2.0 popup flow with your existing redirect_uri
// - LocalStorage for reliable token transfer (no cross-origin issues)
// - Polling mechanism that NEVER falsely detects "cancelled"
// - Works with your existing Google Cloud Console configuration
// =============================================================================

// Token storage keys - shared between main app and callback page
const TOKEN_KEY = 'gmail_access_token';  // Must match Oauth2Callback.jsx
const TOKEN_EXPIRY_KEY = 'gmail_token_expiry';
const AUTH_IN_PROGRESS_KEY = 'gmail_auth_in_progress';
const AUTH_SUCCESS_KEY = 'gmail_auth_success';
const AUTH_ERROR_KEY = 'gmail_auth_error';

// Token management class
class GmailTokenManager {
  constructor() {
    this.tokenKey = TOKEN_KEY;
    this.expiryKey = TOKEN_EXPIRY_KEY;
  }

  getAccessToken() {
    try {
      const token = localStorage.getItem(this.tokenKey);
      const expiry = parseInt(localStorage.getItem(this.expiryKey) || '0');
      
      // Check if token exists and isn't expired (with 5min buffer)
      if (!token || Date.now() >= expiry - AUTH_CONFIG.TOKEN_REFRESH_BUFFER_MS) {
        console.log('[GmailTokenManager] No valid access token in storage or token expired');
        return null;
      }
      
      console.log('[GmailTokenManager] Valid access token found, expiresAt:', new Date(expiry).toISOString());
      return token;
    } catch (error) {
      console.error('[GmailTokenManager] Error retrieving token:', error);
      return null;
    }
  }

  storeToken(accessToken, expiresIn = 3600) {
    try {
      const expiryTime = Date.now() + (expiresIn * 1000);
      localStorage.setItem(this.tokenKey, accessToken);
      localStorage.setItem(this.expiryKey, expiryTime.toString());
      console.log('[GmailTokenManager] Token stored, expires:', new Date(expiryTime).toISOString());
    } catch (error) {
      console.error('[GmailTokenManager] Error storing token:', error);
    }
  }

  // Legacy method for compatibility
  storeTokens({ access_token, expires_in }) {
    this.storeToken(access_token, expires_in || 3600);
  }

  clearTokens() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.expiryKey);
    console.log('[GmailTokenManager] Tokens cleared');
  }

  hasValidTokens() {
    return !!this.getAccessToken();
  }
}

const tokenManager = new GmailTokenManager();

// =============================================================================
// Clear auth state (for fresh start)
// =============================================================================
const clearAuthState = () => {
  localStorage.removeItem(AUTH_IN_PROGRESS_KEY);
  localStorage.removeItem(AUTH_SUCCESS_KEY);
  localStorage.removeItem(AUTH_ERROR_KEY);
};

// =============================================================================
// Main Authentication Function - Bulletproof Popup + LocalStorage
// =============================================================================
export const authenticateGmail = async () => {
  const debugId = `AUTH_${Date.now()}`;
  console.log(`[DEBUG][${debugId}] ========== GMAIL AUTHENTICATION START ==========`);
  console.log(`[DEBUG][${debugId}] Timestamp: ${new Date().toISOString()}`);
  console.log(`[DEBUG][${debugId}] User Agent: ${navigator.userAgent}`);
  
  try {
    // 1. First check for existing valid token
    console.log(`[DEBUG][${debugId}] Checking for existing token in localStorage...`);
    const existingToken = tokenManager.getAccessToken();
    
    if (existingToken) {
      console.log(`[DEBUG][${debugId}] Valid token found in localStorage`);
      console.log(`[DEBUG][${debugId}] Token length: ${existingToken.length}`);
      console.log(`[DEBUG][${debugId}] Token prefix: ${existingToken.substring(0, 20)}...`);
      console.log(`[DEBUG][${debugId}] ========== AUTHENTICATION SUCCESS (CACHED) ==========`);
      return existingToken;
    }

    console.log(`[DEBUG][${debugId}] No valid token found, starting OAuth popup flow...`);
    console.log(`[DEBUG][${debugId}] Window location: ${window.location.href}`);

    // 2. Clear any previous auth state
    console.log(`[DEBUG][${debugId}] Clearing previous auth state...`);
    clearAuthState();

    // 3. Set auth in progress flag
    const authStartTime = Date.now();
    localStorage.setItem(AUTH_IN_PROGRESS_KEY, authStartTime.toString());
    console.log(`[DEBUG][${debugId}] Auth in progress flag set: ${authStartTime}`);

    // 4. Build OAuth URL - use your existing redirect_uri
    const redirectUri = window.location.hostname === 'localhost' 
      ? 'http://localhost:3000/oauth2callback'
      : `${window.location.origin}/oauth2callback`;

    const state = Math.random().toString(36).substring(2, 15);
    
    console.log(`[DEBUG][${debugId}] Building OAuth URL...`);
    console.log(`[DEBUG][${debugId}] Client ID: ${CLIENT_ID}`);
    console.log(`[DEBUG][${debugId}] Redirect URI: ${redirectUri}`);
    console.log(`[DEBUG][${debugId}] Scope: ${SCOPE}`);
    console.log(`[DEBUG][${debugId}] State: ${state}`);
    
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'token');
    authUrl.searchParams.set('scope', SCOPE);
    authUrl.searchParams.set('prompt', 'consent');
    authUrl.searchParams.set('include_granted_scopes', 'true');
    authUrl.searchParams.set('state', state);

    console.log(`[DEBUG][${debugId}] Full OAuth URL: ${authUrl.toString()}`);

    // 5. Open popup
    const width = AUTH_CONFIG.POPUP_WIDTH || 500;
    const height = AUTH_CONFIG.POPUP_HEIGHT || 600;
    const left = Math.max(0, (window.innerWidth - width) / 2 + window.screenX);
    const top = Math.max(0, (window.innerHeight - height) / 2 + window.screenY);
    
    console.log(`[DEBUG][${debugId}] Opening popup window...`);
    console.log(`[DEBUG][${debugId}] Popup dimensions: ${width}x${height}`);
    console.log(`[DEBUG][${debugId}] Popup position: left=${left}, top=${top}`);
    
    const popup = window.open(
      authUrl.toString(),
      'GmailAuth',
      `width=${width},height=${height},left=${left},top=${top},popup=1,scrollbars=yes,resizable=yes`
    );

    if (!popup) {
      console.error(`[DEBUG][${debugId}] ERROR: Popup was blocked by browser`);
      console.error(`[DEBUG][${debugId}] ========== AUTHENTICATION FAILED (POPUP BLOCKED) ==========`);
      clearAuthState();
      throw new Error('Popup was blocked. Please allow popups for this site and try again.');
    }

    console.log(`[DEBUG][${debugId}] Popup opened successfully`);
    console.log(`[DEBUG][${debugId}] Popup object:`, popup);

    // 6. Poll for token in localStorage (set by callback page)
    console.log(`[DEBUG][${debugId}] Starting localStorage polling for token...`);
    
    return new Promise((resolve, reject) => {
      const maxWaitTime = 5 * 60 * 1000; // 5 minutes max
      const pollInterval = 500; // Check every 500ms
      const startTime = Date.now();
      let hasResolved = false;
      let pollCount = 0;
      let popupClosedDetected = false;
      let popupClosedTime = null;

      const checkForToken = () => {
        pollCount++;
        const elapsed = Date.now() - startTime;
        
        if (pollCount % 10 === 0) { // Log every 5 seconds
          console.log(`[DEBUG][${debugId}] Polling... (${Math.round(elapsed / 1000)}s elapsed, poll #${pollCount})`);
        }

        // Check if we've been waiting too long
        if (elapsed > maxWaitTime) {
          console.error(`[DEBUG][${debugId}] ERROR: Authentication timeout after ${Math.round(elapsed / 1000)}s`);
          console.error(`[DEBUG][${debugId}] Total polls: ${pollCount}`);
          console.error(`[DEBUG][${debugId}] ========== AUTHENTICATION FAILED (TIMEOUT) ==========`);
          cleanup();
          reject(new Error('Authentication timed out. Please try again.'));
          return;
        }

        // Check for success (token in localStorage)
        const successFlag = localStorage.getItem(AUTH_SUCCESS_KEY);
        if (successFlag) {
          console.log(`[DEBUG][${debugId}] Success flag found in localStorage: ${successFlag}`);
          const token = tokenManager.getAccessToken();
          if (token) {
            console.log(`[DEBUG][${debugId}] Token retrieved from localStorage`);
            console.log(`[DEBUG][${debugId}] Token length: ${token.length}`);
            console.log(`[DEBUG][${debugId}] Token prefix: ${token.substring(0, 20)}...`);
            console.log(`[DEBUG][${debugId}] Total time: ${Math.round(elapsed / 1000)}s`);
            console.log(`[DEBUG][${debugId}] Total polls: ${pollCount}`);
            console.log(`[DEBUG][${debugId}] ========== AUTHENTICATION SUCCESS ==========`);
            cleanup();
            resolve(token);
            return;
          } else {
            console.warn(`[DEBUG][${debugId}] WARNING: Success flag set but no token found`);
          }
        }

        // Check for error
        const errorFlag = localStorage.getItem(AUTH_ERROR_KEY);
        if (errorFlag) {
          console.error(`[DEBUG][${debugId}] ERROR: Error flag found in localStorage: ${errorFlag}`);
          console.error(`[DEBUG][${debugId}] Total time: ${Math.round(elapsed / 1000)}s`);
          console.error(`[DEBUG][${debugId}] ========== AUTHENTICATION FAILED (ERROR) ==========`);
          cleanup();
          reject(new Error(errorFlag));
          return;
        }

        // Check if popup is closed AND we haven't received token
        // IMPORTANT: Wait at least 10 seconds before checking popup.closed
        // This prevents false "closed" detection when popup navigates to Google's domain
        // The cross-origin navigation can briefly make popup.closed appear true
        if (elapsed > 10000) { // Wait at least 10 seconds before checking
          try {
            if (popup.closed && !popupClosedDetected) {
              popupClosedDetected = true;
              popupClosedTime = Date.now();
              console.log(`[DEBUG][${debugId}] Popup detected as closed after ${Math.round(elapsed / 1000)}s`);
              console.log(`[DEBUG][${debugId}] Starting 15-second grace period for token to arrive...`);
            }
            
            // If popup was detected as closed, give it a 15-second grace period
            if (popupClosedDetected) {
              const timeSinceClose = Date.now() - popupClosedTime;
              
              // Keep checking for token during grace period
              const finalToken = tokenManager.getAccessToken();
              if (finalToken) {
                console.log(`[DEBUG][${debugId}] Token found ${Math.round(timeSinceClose / 1000)}s after popup closed!`);
                console.log(`[DEBUG][${debugId}] ========== AUTHENTICATION SUCCESS (LATE) ==========`);
                cleanup();
                resolve(finalToken);
                return;
              }
              
              const finalSuccess = localStorage.getItem(AUTH_SUCCESS_KEY);
              if (finalSuccess) {
                const token = tokenManager.getAccessToken();
                if (token) {
                  console.log(`[DEBUG][${debugId}] Token found via success flag ${Math.round(timeSinceClose / 1000)}s after popup closed!`);
                  console.log(`[DEBUG][${debugId}] ========== AUTHENTICATION SUCCESS (LATE) ==========`);
                  cleanup();
                  resolve(token);
                  return;
                }
              }

              // Only give up after 15-second grace period
              if (timeSinceClose > 15000) {
                console.warn(`[DEBUG][${debugId}] WARNING: No token after 15s grace period`);
                console.warn(`[DEBUG][${debugId}] Total time: ${Math.round(elapsed / 1000)}s`);
                console.warn(`[DEBUG][${debugId}] Total polls: ${pollCount}`);
                console.warn(`[DEBUG][${debugId}] ========== AUTHENTICATION CANCELLED ==========`);
                cleanup();
                reject(new Error('Sign-in was cancelled. Please try again and complete the Google sign-in.'));
                return;
              }
            }
          } catch (e) {
            // Cross-origin error means popup is on Google's domain - still authenticating
            // This is expected, keep polling
            if (pollCount % 20 === 0) { // Log every 10 seconds
              console.log(`[DEBUG][${debugId}] Popup on different origin (expected during auth)`);
            }
          }
        }

        // Keep polling
        setTimeout(checkForToken, pollInterval);
      };

      const cleanup = () => {
        if (hasResolved) return;
        hasResolved = true;
        console.log(`[DEBUG][${debugId}] Cleaning up auth state...`);
        clearAuthState();
        try {
          if (popup && !popup.closed) {
            console.log(`[DEBUG][${debugId}] Closing popup window...`);
            popup.close();
          }
        } catch (e) {
          console.warn(`[DEBUG][${debugId}] WARNING: Could not close popup:`, e.message);
        }
      };

      // Start polling
      console.log(`[DEBUG][${debugId}] Polling started (interval: ${pollInterval}ms, max wait: ${maxWaitTime}ms)`);
      setTimeout(checkForToken, pollInterval);
    });
  } catch (error) {
    console.error(`[DEBUG][${debugId}] EXCEPTION in authenticateGmail:`, error);
    console.error(`[DEBUG][${debugId}] Error name: ${error.name}`);
    console.error(`[DEBUG][${debugId}] Error message: ${error.message}`);
    console.error(`[DEBUG][${debugId}] Error stack:`, error.stack);
    console.error(`[DEBUG][${debugId}] ========== AUTHENTICATION FAILED (EXCEPTION) ==========`);
    throw error;
  }
};

// =============================================================================
// Legacy exports for backward compatibility
// =============================================================================
export const openOAuthPopup = (url, name = 'GmailAuth') => {
  console.warn('[GmailAuth] openOAuthPopup is deprecated.');
  return null;
};

// Daily quota manager for Gmail limits
class GmailQuotaManager {
  constructor() {
    this.dailyQuotaKey = 'gmail_daily_quota';
    this.lastResetKey = 'gmail_quota_reset';
  }

  getTodayKey() {
    return new Date().toISOString().split('T')[0];
  }

  getDailyUsage() {
    const today = this.getTodayKey();
    const lastReset = localStorage.getItem(this.lastResetKey);
    
    // Reset if it's a new day
    if (lastReset !== today) {
      this.resetDailyQuota();
      return 0;
    }
    
    return parseInt(localStorage.getItem(this.dailyQuotaKey) || '0');
  }

  incrementUsage(count = 1) {
    const today = this.getTodayKey();
    const currentUsage = this.getDailyUsage();
    const newUsage = currentUsage + count;
    
    localStorage.setItem(this.dailyQuotaKey, newUsage.toString());
    localStorage.setItem(this.lastResetKey, today);
    
    return newUsage;
  }

  resetDailyQuota() {
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

const quotaManager = new GmailQuotaManager();

// Enhanced email sending with comprehensive error handling and retry logic
export const sendGmailEmail = async ({ 
  recipient, 
  subject, 
  body, 
  setSendingState, 
  company,
  retryCount = 0,
  maxRetries = EMAIL_LIMITS.MAX_RETRIES,
  onSuccess = null,
  onError = null
}) => {
  const sendId = `SEND_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  console.log(`[DEBUG][${sendId}] ========== EMAIL SEND START ==========`);
  console.log(`[DEBUG][${sendId}] Timestamp: ${new Date().toISOString()}`);
  console.log(`[DEBUG][${sendId}] Company: ${company}`);
  console.log(`[DEBUG][${sendId}] Recipient: ${recipient}`);
  console.log(`[DEBUG][${sendId}] Subject: ${subject}`);
  console.log(`[DEBUG][${sendId}] Body length: ${body?.length || 0} chars`);
  console.log(`[DEBUG][${sendId}] Body preview: ${body?.substring(0, 200)}...`);
  console.log(`[DEBUG][${sendId}] Is HTML: ${body?.includes('<') || body?.includes('</div>')}`);
  console.log(`[DEBUG][${sendId}] Retry count: ${retryCount}/${maxRetries}`);
  
  // CRITICAL: Validate body is not empty or too short
  if (!body || body.length < 50) {
    console.error(`[DEBUG][${sendId}] CRITICAL ERROR: Email body is too short or empty!`);
    console.error(`[DEBUG][${sendId}] Body length: ${body?.length || 0}`);
    console.error(`[DEBUG][${sendId}] ========== EMAIL SEND FAILED (EMPTY BODY) ==========`);
    
    const errorResult = {
      success: false,
      error: 'Email body is empty or too short. Please check email generation.',
      errorType: 'empty_body'
    };
    
    if (onError) {
      onError(new Error(errorResult.error));
    }
    
    return errorResult;
  }
  
  try {
    // Validate inputs
    console.log(`[DEBUG][${sendId}] Validating email content...`);
    const validation = validateEmailContent({ recipient, subject, body, company });
    if (!validation.isValid) {
      console.error(`[DEBUG][${sendId}] ERROR: Validation failed`);
      console.error(`[DEBUG][${sendId}] Validation errors:`, validation.errors);
      console.error(`[DEBUG][${sendId}] ========== EMAIL SEND FAILED (VALIDATION) ==========`);
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }
    console.log(`[DEBUG][${sendId}] Validation passed`);

    // Check daily quota
    const currentQuota = quotaManager.getDailyUsage();
    const quotaLimit = EMAIL_LIMITS.MAX_DAILY_EMAILS;
    console.log(`[DEBUG][${sendId}] Checking quota: ${currentQuota}/${quotaLimit}`);
    
    if (!quotaManager.canSendEmail()) {
      console.warn(`[DEBUG][${sendId}] WARNING: Daily quota exceeded`);
      console.warn(`[DEBUG][${sendId}] Current usage: ${currentQuota}`);
      console.warn(`[DEBUG][${sendId}] Limit: ${quotaLimit}`);
      console.warn(`[DEBUG][${sendId}] ========== EMAIL SEND SKIPPED (QUOTA) ==========`);
      return { 
        success: false, 
        reason: 'quota_exceeded',
        message: `Daily sending limit reached (${EMAIL_LIMITS.MAX_DAILY_EMAILS} emails). Will retry tomorrow.`,
        retryAfter: new Date(Date.now() + 24 * 60 * 60 * 1000) // Tomorrow
      };
    }
    console.log(`[DEBUG][${sendId}] Quota check passed, remaining: ${quotaLimit - currentQuota}`);

    // Check unsubscribe status
    console.log(`[DEBUG][${sendId}] Checking unsubscribe status...`);
    const isUnsubscribedResult = await isUnsubscribed(recipient);
    if (isUnsubscribedResult) {
      console.warn(`[DEBUG][${sendId}] WARNING: Recipient is unsubscribed`);
      console.warn(`[DEBUG][${sendId}] ========== EMAIL SEND SKIPPED (UNSUBSCRIBED) ==========`);
      return { success: false, reason: 'unsubscribed' };
    }
    console.log(`[DEBUG][${sendId}] Unsubscribe check passed`);

    // Get or refresh token
    console.log(`[DEBUG][${sendId}] Getting access token...`);
    let token = tokenManager.getAccessToken();
    
    if (!token) {
      console.log(`[DEBUG][${sendId}] No access token found, initiating authentication...`);
      setSendingState?.('authenticating');
      
      try {
        token = await authenticateGmail();
        console.log(`[DEBUG][${sendId}] Authentication successful, token received`);
        console.log(`[DEBUG][${sendId}] Token length: ${token?.length || 0}`);
      } catch (authError) {
        console.error(`[DEBUG][${sendId}] ERROR: Authentication failed`);
        console.error(`[DEBUG][${sendId}] Auth error:`, authError);
        console.error(`[DEBUG][${sendId}] Auth error stack:`, authError.stack);
        console.error(`[DEBUG][${sendId}] ========== EMAIL SEND FAILED (AUTH) ==========`);
        throw authError;
      }
    } else {
      console.log(`[DEBUG][${sendId}] Using existing access token`);
      console.log(`[DEBUG][${sendId}] Token length: ${token.length}`);
    }

    // Prepare email for Gmail API
    console.log(`[DEBUG][${sendId}] Preparing email for Gmail API...`);
    let utf8Encoded;
    try {
      utf8Encoded = prepareGmailApiEmail(recipient, subject, body, company);
      console.log(`[DEBUG][${sendId}] Email prepared, encoded length: ${utf8Encoded?.length || 0}`);
    } catch (prepError) {
      console.error(`[DEBUG][${sendId}] ERROR: Email preparation failed`);
      console.error(`[DEBUG][${sendId}] Prep error:`, prepError);
      console.error(`[DEBUG][${sendId}] Prep error stack:`, prepError.stack);
      console.error(`[DEBUG][${sendId}] ========== EMAIL SEND FAILED (PREP) ==========`);
      throw prepError;
    }

    setSendingState?.('sending');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.error(`[DEBUG][${sendId}] ERROR: Request timeout after ${EMAIL_LIMITS.TIMEOUT_MS}ms`);
      controller.abort();
    }, EMAIL_LIMITS.TIMEOUT_MS);

    // Use the official Gmail API endpoint directly
    const apiUrl = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send';
    console.log(`[DEBUG][${sendId}] Sending Gmail API request...`);
    console.log(`[DEBUG][${sendId}] API URL: ${apiUrl}`);
    console.log(`[DEBUG][${sendId}] Method: POST`);
    console.log(`[DEBUG][${sendId}] Authorization: Bearer ${token.substring(0, 20)}...`);
    console.log(`[DEBUG][${sendId}] Timeout: ${EMAIL_LIMITS.TIMEOUT_MS}ms`);
    
    let response;
    const requestStartTime = Date.now();
    
    try {
      response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ raw: utf8Encoded }),
        signal: controller.signal
      });
      
      const requestDuration = Date.now() - requestStartTime;
      console.log(`[DEBUG][${sendId}] Gmail API response received in ${requestDuration}ms`);
      console.log(`[DEBUG][${sendId}] Response status: ${response.status} ${response.statusText}`);
      console.log(`[DEBUG][${sendId}] Response headers:`, Object.fromEntries(response.headers.entries()));
      
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error(`[DEBUG][${sendId}] ERROR: Fetch request failed`);
      console.error(`[DEBUG][${sendId}] Fetch error name: ${fetchError.name}`);
      console.error(`[DEBUG][${sendId}] Fetch error message: ${fetchError.message}`);
      console.error(`[DEBUG][${sendId}] Fetch error stack:`, fetchError.stack);
      console.error(`[DEBUG][${sendId}] Request duration: ${Date.now() - requestStartTime}ms`);
      console.error(`[DEBUG][${sendId}] ========== EMAIL SEND FAILED (NETWORK) ==========`);
      throw fetchError;
    }

    clearTimeout(timeoutId);
    if (response.ok) {
      console.log(`[DEBUG][${sendId}] Response OK, parsing JSON...`);
      let result;
      try {
        result = await response.json();
        console.log(`[DEBUG][${sendId}] Response parsed:`, result);
      } catch (jsonError) {
        console.error(`[DEBUG][${sendId}] ERROR: Failed to parse response JSON`);
        console.error(`[DEBUG][${sendId}] JSON error:`, jsonError);
        console.error(`[DEBUG][${sendId}] ========== EMAIL SEND FAILED (JSON PARSE) ==========`);
        throw jsonError;
      }
      
      // Record success
      console.log(`[DEBUG][${sendId}] Recording nudge in Firebase...`);
      try {
        await recordNudgeForUser(company);
        console.log(`[DEBUG][${sendId}] Nudge recorded successfully`);
      } catch (recordError) {
        console.warn(`[DEBUG][${sendId}] WARNING: Failed to record nudge in Firebase`);
        console.warn(`[DEBUG][${sendId}] Record error:`, recordError);
        // Don't fail the send if recording fails
      }
      
      const newQuota = quotaManager.incrementUsage(1);
      console.log(`[DEBUG][${sendId}] Quota incremented, new usage: ${newQuota}/${EMAIL_LIMITS.MAX_DAILY_EMAILS}`);
      
      console.log(`[DEBUG][${sendId}] Email sent successfully!`);
      console.log(`[DEBUG][${sendId}] Message ID: ${result.id}`);
      console.log(`[DEBUG][${sendId}] ========== EMAIL SEND SUCCESS ==========`);
      
      setSendingState?.('sent');
      
      const successResult = { 
        success: true, 
        messageId: result.id,
        company,
        recipient,
        timestamp: new Date().toISOString(),
        quotaUsed: quotaManager.getDailyUsage(),
        quotaRemaining: quotaManager.getRemainingQuota()
      };

      if (onSuccess) {
        try {
          onSuccess(successResult);
        } catch (callbackError) {
          console.warn(`[DEBUG][${sendId}] WARNING: onSuccess callback failed`);
          console.warn(`[DEBUG][${sendId}] Callback error:`, callbackError);
        }
      }

      return successResult;
    }

    // Handle errors
    console.error(`[DEBUG][${sendId}] ERROR: Response not OK (status ${response.status})`);
    console.log(`[DEBUG][${sendId}] Reading error response body...`);
    
    let errorText;
    try {
      errorText = await response.text();
      console.error(`[DEBUG][${sendId}] Error response body:`, errorText);
    } catch (textError) {
      console.error(`[DEBUG][${sendId}] ERROR: Could not read error response body`);
      console.error(`[DEBUG][${sendId}] Text error:`, textError);
      errorText = 'Could not read error response';
    }

    // Check for specific error types
    const isAuthError = response.status === 401;
    const isRateLimitError = response.status === 429;
    const isQuotaError = response.status === 403 && errorText.includes('quota');
    
    console.error(`[DEBUG][${sendId}] Error classification:`);
    console.error(`[DEBUG][${sendId}]   - Auth error (401): ${isAuthError}`);
    console.error(`[DEBUG][${sendId}]   - Rate limit (429): ${isRateLimitError}`);
    console.error(`[DEBUG][${sendId}]   - Quota error (403): ${isQuotaError}`);
    
    // Handle auth errors (token expired)
    if (isAuthError && retryCount < maxRetries) {
      console.log(`[DEBUG][${sendId}] Token expired, clearing and retrying...`);
      console.log(`[DEBUG][${sendId}] Retry ${retryCount + 1}/${maxRetries}`);
      tokenManager.clearTokens();
      return sendGmailEmail({
        recipient, subject, body, setSendingState, company,
        retryCount: retryCount + 1, maxRetries, onSuccess, onError
      });
    } else if (isAuthError) {
      console.error(`[DEBUG][${sendId}] ERROR: Max retries reached for auth error`);
      console.error(`[DEBUG][${sendId}] ========== EMAIL SEND FAILED (AUTH 401) ==========`);
    }

    // Handle rate limit errors
    if (isRateLimitError && retryCount < maxRetries) {
      const backoffMs = EMAIL_LIMITS.RATE_LIMIT_BACKOFF_MS;
      console.log(`[DEBUG][${sendId}] Rate limited, waiting ${backoffMs}ms before retry...`);
      console.log(`[DEBUG][${sendId}] Retry ${retryCount + 1}/${maxRetries}`);
      await new Promise(resolve => setTimeout(resolve, backoffMs));
      return sendGmailEmail({
        recipient, subject, body, setSendingState, company,
        retryCount: retryCount + 1, maxRetries, onSuccess, onError
      });
    } else if (isRateLimitError) {
      console.error(`[DEBUG][${sendId}] ERROR: Max retries reached for rate limit`);
      console.error(`[DEBUG][${sendId}] ========== EMAIL SEND FAILED (RATE LIMIT 429) ==========`);
    }

    // Handle quota errors
    if (isQuotaError) {
      console.error(`[DEBUG][${sendId}] ERROR: API quota exceeded`);
      console.error(`[DEBUG][${sendId}] ========== EMAIL SEND FAILED (QUOTA 403) ==========`);
      return { 
        success: false, 
        reason: 'api_quota_exceeded',
        message: 'Gmail API quota exceeded. Please try again later.',
        retryAfter: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
      };
    }

    console.error(`[DEBUG][${sendId}] ERROR: Unhandled API error`);
    console.error(`[DEBUG][${sendId}] Status: ${response.status}`);
    console.error(`[DEBUG][${sendId}] Error text: ${errorText}`);
    console.error(`[DEBUG][${sendId}] ========== EMAIL SEND FAILED (API ERROR ${response.status}) ==========`);
    throw new Error(`Gmail API error (${response.status}): ${errorText}`);

  } catch (error) {
    console.error(`[DEBUG][${sendId}] EXCEPTION in sendGmailEmail`);
    console.error(`[DEBUG][${sendId}] Error name: ${error.name}`);
    console.error(`[DEBUG][${sendId}] Error message: ${error.message}`);
    console.error(`[DEBUG][${sendId}] Error stack:`, error.stack);
    console.error(`[DEBUG][${sendId}] Company: ${company}`);
    console.error(`[DEBUG][${sendId}] Recipient: ${recipient}`);
    console.error(`[DEBUG][${sendId}] Retry count: ${retryCount}/${maxRetries}`);
    console.error(`[DEBUG][${sendId}] ========== EMAIL SEND FAILED (EXCEPTION) ==========`);
    
    setSendingState?.('error');
    
    const errorResult = {
      success: false,
      error: error.message,
      errorName: error.name,
      errorStack: error.stack,
      company,
      recipient,
      timestamp: new Date().toISOString(),
      retryCount
    };

    if (onError) {
      try {
        onError(error);
      } catch (callbackError) {
        console.warn(`[DEBUG][${sendId}] WARNING: onError callback failed`);
        console.warn(`[DEBUG][${sendId}] Callback error:`, callbackError);
      }
    }

    return errorResult;
  }
};

// Mass email sending with batching, rate limiting, and progress tracking
export const sendGmailMassNudge = async ({ 
  companiesToEmail, 
  filteredCompanies, 
  userData, 
  onProgress,
  onComplete,
  generateSubject,
  generateBody
}) => {
  const massId = `MASS_${Date.now()}`;
  console.log(`[DEBUG][${massId}] ========== MASS NUDGE START ==========`);
  console.log(`[DEBUG][${massId}] Timestamp: ${new Date().toISOString()}`);
  console.log(`[DEBUG][${massId}] Total companies: ${companiesToEmail.length}`);
  console.log(`[DEBUG][${massId}] Companies:`, companiesToEmail);
  console.log(`[DEBUG][${massId}] User data:`, {
    email: userData?.email,
    firstName: userData?.firstName,
    lastName: userData?.lastName
  });
  console.log(`[DEBUG][${massId}] Current quota: ${quotaManager.getDailyUsage()}/${EMAIL_LIMITS.MAX_DAILY_EMAILS}`);

  // Pre-authenticate before starting mass nudge
  console.log(`[DEBUG][${massId}] Starting pre-authentication...`);
  try {
    await authenticateGmail();
    console.log(`[DEBUG][${massId}] Pre-authentication successful`);
  } catch (error) {
    console.error(`[DEBUG][${massId}] ERROR: Pre-authentication failed`);
    console.error(`[DEBUG][${massId}] Auth error:`, error);
    console.error(`[DEBUG][${massId}] Auth error stack:`, error.stack);
    
    const errorMessage = error.message.includes('cancelled') || error.message.includes('closed')
      ? `Gmail authentication was cancelled.\n\n⚠️ To send emails via Gmail:\n1. Click "Send via Gmail" again\n2. Complete the sign-in in the popup window\n3. Grant permission to send emails\n\nThe popup should appear automatically. If you don't see it, check if your browser blocked it.`
      : `Gmail authentication failed: ${error.message}`;
    
    console.error(`[DEBUG][${massId}] ========== MASS NUDGE FAILED (AUTH) ==========`);
    return {
      success: false,
      error: errorMessage,
      processedCount: 0,
      successCount: 0,
      failureCount: 0,
      skippedCount: 0,
      successRate: 0,
      errors: [{ error: errorMessage, company: 'Authentication' }],
      quotaUsed: quotaManager.getDailyUsage(),
      quotaRemaining: quotaManager.getRemainingQuota()
    };
  }

  // Dynamic batch sizing based on quota and recent success rate
  let currentBatchSize = Math.min(
    EMAIL_LIMITS.BATCH_SIZE_DEFAULT,
    quotaManager.getRemainingQuota()
  );
  let adaptiveDelay = EMAIL_LIMITS.DELAY_BETWEEN_EMAILS_DEFAULT;

  console.log(`[DEBUG][${massId}] Initial batch size: ${currentBatchSize}`);
  console.log(`[DEBUG][${massId}] Initial delay: ${adaptiveDelay}ms`);

  // Ensure we don't exceed daily quota
  const maxEmails = Math.min(companiesToEmail.length, quotaManager.getRemainingQuota());
  const effectiveCompanies = companiesToEmail.slice(0, maxEmails);
  
  if (effectiveCompanies.length < companiesToEmail.length) {
    console.warn(`[DEBUG][${massId}] WARNING: Limiting to ${effectiveCompanies.length} emails due to daily quota`);
    console.warn(`[DEBUG][${massId}] Requested: ${companiesToEmail.length}, Available quota: ${quotaManager.getRemainingQuota()}`);
  }

  const results = {
    processedCount: 0,
    successCount: 0,
    failureCount: 0,
    skippedCount: 0,
    errors: [],
    successes: []
  };

  const retryQueue = [];
  const massStartTime = Date.now();

  console.log(`[DEBUG][${massId}] Starting to process ${effectiveCompanies.length} companies...`);

  // Process companies in batches
  for (let i = 0; i < effectiveCompanies.length; i += currentBatchSize) {
    const batch = effectiveCompanies.slice(i, i + currentBatchSize);
    const batchNum = Math.floor(i / currentBatchSize) + 1;
    const totalBatches = Math.ceil(effectiveCompanies.length / currentBatchSize);
    
    console.log(`[DEBUG][${massId}] ========== BATCH ${batchNum}/${totalBatches} START ==========`);
    console.log(`[DEBUG][${massId}] Batch size: ${batch.length}`);
    console.log(`[DEBUG][${massId}] Companies in batch:`, batch);
    
    // Check if we still have quota
    if (!quotaManager.canSendEmail()) {
      console.warn(`[DEBUG][${massId}] WARNING: Daily quota reached, stopping mass nudge`);
      console.warn(`[DEBUG][${massId}] Processed: ${results.processedCount}/${effectiveCompanies.length}`);
      break;
    }

    let batchSuccessCount = 0;
    const batchStartTime = Date.now();
    
    for (let j = 0; j < batch.length; j++) {
      const companyName = batch[j];
      const emailNum = i + j + 1;
      
      console.log(`[DEBUG][${massId}] Processing ${emailNum}/${effectiveCompanies.length}: ${companyName}`);
      
      // Check quota before each email
      if (!quotaManager.canSendEmail()) {
        console.warn(`[DEBUG][${massId}] WARNING: Daily quota reached during batch processing`);
        break;
      }

      const companyData = filteredCompanies.find(c => c.Company === companyName);
      if (!companyData) {
        console.warn(`[DEBUG][${massId}] WARNING: Company data not found for ${companyName}`);
        results.skippedCount++;
        results.processedCount++;
        continue;
      }

      const email = companyData.Email?.split(',')[0]?.trim();
      if (!email || !email.includes('@')) {
        console.warn(`[DEBUG][${massId}] WARNING: Invalid email for ${companyName}: ${email}`);
        results.skippedCount++;
        results.processedCount++;
        continue;
      }

      try {
        const subject = generateSubject ? generateSubject(userData) : `${userData?.firstName || 'Candidate'} - Interested in opportunities at ${companyName}`;
        const body = generateBody ? generateBody(companyName, userData) : `Hi,\n\nI'm interested in opportunities at ${companyName}.\n\nBest regards,\n${userData?.firstName || 'Candidate'}`;

        console.log(`[DEBUG][${massId}] Sending email to ${companyName} (${email})...`);
        
        const result = await sendGmailEmail({
          recipient: email,
          subject,
          body,
          company: companyName,
          onSuccess: () => {
            batchSuccessCount++;
          }
        });

        results.processedCount++;

        if (result.success) {
          console.log(`[DEBUG][${massId}] SUCCESS: Email sent to ${companyName}`);
          results.successCount++;
          results.successes.push({ company: companyName, email, messageId: result.messageId });
          
          // Report progress with live feed data
          if (onProgress) {
            try {
              onProgress({
                ...results,
                currentCompany: effectiveCompanies[j + 1]?.companyName, // Next company
                lastCompany: companyName,  // Just completed
                lastCompanyStatus: 'success',
                quotaRemaining: quotaManager.getRemainingQuota()
              });
            } catch (progressError) {
              console.warn(`[DEBUG][${massId}] WARNING: onProgress callback failed:`, progressError);
            }
          }

          // Adaptive delay based on success rate and quota
          if (results.successCount > 5) {
            const successRate = results.successCount / results.processedCount;
            if (successRate > 0.95) {
              adaptiveDelay = Math.max(EMAIL_LIMITS.DELAY_BETWEEN_EMAILS_MIN, adaptiveDelay * 0.9);
              console.log(`[DEBUG][${massId}] Adaptive delay reduced to ${adaptiveDelay}ms (high success rate)`);
            } else if (quotaManager.getRemainingQuota() < 10) {
              adaptiveDelay *= 2;
              console.log(`[DEBUG][${massId}] Adaptive delay increased to ${adaptiveDelay}ms (low quota)`);
            }
          }
        } else {
          console.error(`[DEBUG][${massId}] FAILURE: Email failed for ${companyName}: ${result.error || result.reason}`);
          results.failureCount++;
          results.errors.push({ company: companyName, error: result.error || result.reason });

          // Report progress for failed company
          if (onProgress) {
            try {
              onProgress({
                ...results,
                currentCompany: effectiveCompanies[j + 1]?.companyName,
                lastCompany: companyName,
                lastCompanyStatus: 'failed',
                quotaRemaining: quotaManager.getRemainingQuota()
              });
            } catch (progressError) {
              console.warn(`[DEBUG][${massId}] WARNING: onProgress callback failed:`, progressError);
            }
          }

          // Add to retry queue for transient errors
          if (result.reason === 'rate_limited' || result.reason === 'timeout') {
            console.log(`[DEBUG][${massId}] Adding ${companyName} to retry queue (${result.reason})`);
            retryQueue.push({ companyName, email, subject, body });
          }
        }

        // Delay between emails
        if (j < batch.length - 1) { // Don't delay after last email in batch
          console.log(`[DEBUG][${massId}] Waiting ${adaptiveDelay}ms before next email...`);
          await new Promise(resolve => setTimeout(resolve, adaptiveDelay));
        }
      } catch (error) {
        console.error(`[DEBUG][${massId}] EXCEPTION sending to ${companyName}:`, error);
        console.error(`[DEBUG][${massId}] Exception stack:`, error.stack);
        results.failureCount++;
        results.processedCount++;
        results.errors.push({ company: companyName, error: error.message, stack: error.stack });
      }
    }
    
    const batchDuration = Date.now() - batchStartTime;
    console.log(`[DEBUG][${massId}] ========== BATCH ${batchNum}/${totalBatches} COMPLETE ==========`);
    console.log(`[DEBUG][${massId}] Batch duration: ${Math.round(batchDuration / 1000)}s`);
    console.log(`[DEBUG][${massId}] Batch success: ${batchSuccessCount}/${batch.length}`);
    console.log(`[DEBUG][${massId}] Total progress: ${results.successCount}/${effectiveCompanies.length} successful`);

    // Adaptive batch sizing based on success rate
    const batchSuccessRate = batchSuccessCount / batch.length;
    if (batchSuccessRate > 0.9 && quotaManager.getRemainingQuota() > 20) {
      currentBatchSize = Math.min(currentBatchSize + 2, EMAIL_LIMITS.BATCH_SIZE_MAX);
    } else if (batchSuccessRate < 0.7) {
      currentBatchSize = Math.max(currentBatchSize - 2, EMAIL_LIMITS.BATCH_SIZE_MIN);
    }

    // Delay between batches (skip if last batch)
    if (i + currentBatchSize < effectiveCompanies.length && quotaManager.canSendEmail()) {
      console.log(`[Gmail Mass] Waiting ${EMAIL_LIMITS.DELAY_BETWEEN_BATCHES / 1000}s before next batch...`);
      await new Promise(resolve => setTimeout(resolve, EMAIL_LIMITS.DELAY_BETWEEN_BATCHES));
    }
  }

  // Process retry queue if we have quota left
  if (retryQueue.length > 0 && quotaManager.canSendEmail()) {
    console.log(`[Gmail Mass] Processing ${retryQueue.length} retries...`);
    
    for (const retryItem of retryQueue.slice(0, quotaManager.getRemainingQuota())) {
      try {
        const result = await sendGmailEmail({
          recipient: retryItem.email,
          subject: retryItem.subject,
          body: retryItem.body,
          company: retryItem.companyName
        });

        if (result.success) {
          results.successCount++;
          results.failureCount--;
        }

        await new Promise(resolve => setTimeout(resolve, adaptiveDelay * 2));
      } catch (error) {
        console.error(`[Gmail Mass] Retry failed for ${retryItem.companyName}:`, error);
      }
    }
  }

  const massDuration = Date.now() - massStartTime;
  const finalReport = {
    success: results.successCount > 0,
    ...results,
    successRate: results.processedCount > 0 
      ? ((results.successCount / results.processedCount) * 100).toFixed(1)
      : 0,
    quotaUsed: quotaManager.getDailyUsage(),
    quotaRemaining: quotaManager.getRemainingQuota(),
    completedAt: new Date().toISOString(),
    duration: massDuration
  };

  console.log(`[DEBUG][${massId}] ========== MASS NUDGE COMPLETE ==========`);
  console.log(`[DEBUG][${massId}] Total duration: ${Math.round(massDuration / 1000)}s`);
  console.log(`[DEBUG][${massId}] Processed: ${results.processedCount}/${effectiveCompanies.length}`);
  console.log(`[DEBUG][${massId}] Successful: ${results.successCount}`);
  console.log(`[DEBUG][${massId}] Failed: ${results.failureCount}`);
  console.log(`[DEBUG][${massId}] Skipped: ${results.skippedCount}`);
  console.log(`[DEBUG][${massId}] Success rate: ${finalReport.successRate}%`);
  console.log(`[DEBUG][${massId}] Quota used: ${finalReport.quotaUsed}/${EMAIL_LIMITS.MAX_DAILY_EMAILS}`);
  console.log(`[DEBUG][${massId}] Final report:`, finalReport);

  if (onComplete) {
    try {
      onComplete(finalReport);
    } catch (completeError) {
      console.warn(`[DEBUG][${massId}] WARNING: onComplete callback failed:`, completeError);
    }
  }

  return finalReport;
};

// Export token and quota managers for external use
export { tokenManager, quotaManager };

// Export a function to get current quota status
export const getGmailQuotaStatus = () => ({
  used: quotaManager.getDailyUsage(),
  remaining: quotaManager.getRemainingQuota(),
  limit: EMAIL_LIMITS.MAX_DAILY_EMAILS,
  canSend: quotaManager.canSendEmail()
});
