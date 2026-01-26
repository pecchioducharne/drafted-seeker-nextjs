/**
 * Gmail OAuth 2.0 Authentication Module
 * Handles popup-based OAuth flow with BroadcastChannel and localStorage fallback
 */

import { CLIENT_ID, SCOPE } from './constants';

// LocalStorage keys (must match oauth2callback page)
export const TOKEN_KEY = 'gmail_access_token';
export const TOKEN_EXPIRY_KEY = 'gmail_token_expiry';
export const AUTH_SUCCESS_KEY = 'gmail_auth_success';
export const AUTH_ERROR_KEY = 'gmail_auth_error';
export const AUTH_READY_KEY = 'gmail_auth_ready';

// BroadcastChannel for cross-tab communication
const BROADCAST_CHANNEL_NAME = 'gmail_auth_channel';

// Configuration
const CONFIG = {
  POPUP_WIDTH: 500,
  POPUP_HEIGHT: 600,
  POLL_INTERVAL_MS: 300,           // Check every 300ms
  MAX_WAIT_TIME_MS: 5 * 60 * 1000, // 5 minutes max
  MIN_AUTH_TIME_MS: 10000,         // Don't check popup.closed for first 10 seconds
  GRACE_PERIOD_AFTER_CLOSE_MS: 15000, // 15 seconds after popup closes to find token
  TOKEN_BUFFER_MS: 5 * 60 * 1000,  // Consider token expired 5 min before actual expiry
};

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
      const expiry = parseInt(localStorage.getItem(this.expiryKey) || '0', 10);
      
      if (!token) {
        return null;
      }
      
      // Check expiry with buffer
      const now = Date.now();
      const effectiveExpiry = expiry - CONFIG.TOKEN_BUFFER_MS;
      
      if (now >= effectiveExpiry) {
        this.clearTokens();
        return null;
      }
      
      return token;
    } catch (error) {
      console.error('[GmailTokenManager] Error reading token:', error);
      return null;
    }
  }

  storeToken(accessToken, expiresInSeconds = 3600) {
    try {
      if (typeof window === 'undefined') return;
      
      const expiryTime = Date.now() + (expiresInSeconds * 1000);
      localStorage.setItem(this.tokenKey, accessToken);
      localStorage.setItem(this.expiryKey, expiryTime.toString());
      console.log('[GmailTokenManager] Token stored, expires:', new Date(expiryTime).toISOString());
    } catch (error) {
      console.error('[GmailTokenManager] Error storing token:', error);
    }
  }

  clearTokens() {
    if (typeof window === 'undefined') return;
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

  hasValidToken() {
    return this.getAccessToken() !== null;
  }
}

export const tokenManager = new GmailTokenManager();

/**
 * Clear authentication state
 */
function clearAuthState() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_SUCCESS_KEY);
  localStorage.removeItem(AUTH_ERROR_KEY);
  localStorage.removeItem(AUTH_READY_KEY);
}

/**
 * Authenticate with Gmail using OAuth 2.0 popup flow
 * @returns {Promise<string>} Access token
 * @throws {Error} If authentication fails or is cancelled
 */
export async function authenticateGmail() {
  const authId = `AUTH_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  
  console.log(`[GmailAuth][${authId}] Starting authentication...`);
  
  // Check for existing valid token
  const existingToken = tokenManager.getAccessToken();
  if (existingToken) {
    console.log(`[GmailAuth][${authId}] Valid cached token found`);
    return existingToken;
  }

  console.log(`[GmailAuth][${authId}] No cached token, starting OAuth flow...`);

  // Clear previous auth state
  clearAuthState();

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

  console.log(`[GmailAuth][${authId}] Redirect URI: ${redirectUri}`);

  // Calculate popup position
  const left = Math.max(0, (window.innerWidth - CONFIG.POPUP_WIDTH) / 2 + window.screenX);
  const top = Math.max(0, (window.innerHeight - CONFIG.POPUP_HEIGHT) / 2 + window.screenY);

  // Open popup
  const popup = window.open(
    authUrl.toString(),
    'GmailAuth',
    `width=${CONFIG.POPUP_WIDTH},height=${CONFIG.POPUP_HEIGHT},left=${left},top=${top},popup=1,scrollbars=yes,resizable=yes`
  );

  if (!popup) {
    throw new Error('Popup was blocked by the browser. Please allow popups for this site and try again.');
  }

  console.log(`[GmailAuth][${authId}] Popup opened`);

  // Wait for authentication
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
      console.log(`[GmailAuth][${authId}] Success via ${source} (${elapsed}ms)`);
      
      cleanup();
      resolve(token);
    };

    // Error handler  
    const handleError = (message, source) => {
      if (resolved) return;
      
      const elapsed = Date.now() - startTime;
      console.error(`[GmailAuth][${authId}] Failed via ${source} (${elapsed}ms): ${message}`);
      
      cleanup();
      reject(new Error(message));
    };

    // Set up BroadcastChannel for real-time notification
    try {
      broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      broadcastChannel.onmessage = (event) => {
        console.log(`[GmailAuth][${authId}] BroadcastChannel message:`, event.data);
        
        if (event.data.type === 'AUTH_SUCCESS' && event.data.accessToken) {
          handleSuccess(event.data.accessToken, 'BroadcastChannel');
        } else if (event.data.type === 'AUTH_ERROR') {
          handleError(event.data.error || 'Authentication failed', 'BroadcastChannel');
        }
      };
      console.log(`[GmailAuth][${authId}] BroadcastChannel set up`);
    } catch (e) {
      console.log(`[GmailAuth][${authId}] BroadcastChannel not available, using localStorage polling only`);
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
      if (elapsed > CONFIG.MIN_AUTH_TIME_MS) {
        try {
          if (popup.closed && !popupClosed) {
            popupClosed = true;
            popupCloseTime = Date.now();
            console.log(`[GmailAuth][${authId}] Popup closed at ${elapsed}ms`);
          }
        } catch (e) {
          // Cross-origin error - popup is on Google's domain, still authenticating
        }

        // If popup closed, wait grace period then check for token
        if (popupClosed && popupCloseTime) {
          const timeSinceClose = Date.now() - popupCloseTime;
          
          if (timeSinceClose > CONFIG.GRACE_PERIOD_AFTER_CLOSE_MS) {
            // Grace period expired, check one last time
            const token = tokenManager.getAccessToken();
            if (token) {
              handleSuccess(token, 'localStorage (after popup close)');
            } else {
              handleError('Authentication was cancelled or failed', 'popup closed');
            }
          }
        }
      }
    };

    // Start polling
    pollInterval = setInterval(checkAuth, CONFIG.POLL_INTERVAL_MS);
    
    // Initial check
    checkAuth();
  });
}

export default {
  authenticateGmail,
  tokenManager
};
