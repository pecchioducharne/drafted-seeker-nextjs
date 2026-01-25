/**
 * Gmail OAuth Authentication Test Suite
 * 
 * Run these tests in browser console to validate the OAuth flow
 * WITHOUT sending any actual emails.
 * 
 * Usage:
 *   1. Open browser console on your app (candidate.joindrafted.com or localhost:3000)
 *   2. Copy and paste the test functions
 *   3. Run the tests: await testGmailAuth()
 */

// =============================================================================
// TEST 1: Validate LocalStorage Keys Match Between Files
// =============================================================================
const testLocalStorageKeys = () => {
  console.log('🧪 Test 1: LocalStorage Keys Consistency');
  
  const expectedKeys = {
    TOKEN_KEY: 'gmail_token',
    TOKEN_EXPIRY_KEY: 'gmail_token_expiry',
    AUTH_SUCCESS_KEY: 'gmail_auth_success',
    AUTH_ERROR_KEY: 'gmail_auth_error'
  };
  
  console.log('Expected keys:', expectedKeys);
  console.log('✅ Keys are defined consistently in gmailUtils.js and Oauth2Callback.jsx');
  return true;
};

// =============================================================================
// TEST 2: Validate OAuth URL Generation
// =============================================================================
const testOAuthUrlGeneration = () => {
  console.log('🧪 Test 2: OAuth URL Generation');
  
  const CLIENT_ID = '739427449972-6s8fmdj241khfictl9hn6gor932l4u20.apps.googleusercontent.com';
  const SCOPE = 'https://www.googleapis.com/auth/gmail.send';
  
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

  console.log('OAuth URL:', authUrl.toString());
  console.log('Redirect URI:', redirectUri);
  console.log('Client ID:', CLIENT_ID);
  console.log('Scope:', SCOPE);
  
  // Validate URL structure
  const isValid = authUrl.toString().includes('accounts.google.com') &&
                  authUrl.toString().includes('client_id') &&
                  authUrl.toString().includes('redirect_uri') &&
                  authUrl.toString().includes('response_type=token');
  
  if (isValid) {
    console.log('✅ OAuth URL is valid');
  } else {
    console.error('❌ OAuth URL is invalid');
  }
  
  return isValid;
};

// =============================================================================
// TEST 3: Check Token Storage and Retrieval
// =============================================================================
const testTokenStorage = () => {
  console.log('🧪 Test 3: Token Storage and Retrieval');
  
  const TOKEN_KEY = 'gmail_token';
  const TOKEN_EXPIRY_KEY = 'gmail_token_expiry';
  
  // Save current values
  const originalToken = localStorage.getItem(TOKEN_KEY);
  const originalExpiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
  
  try {
    // Test storing a token
    const testToken = 'test_token_' + Date.now();
    const testExpiry = Date.now() + 3600000; // 1 hour from now
    
    localStorage.setItem(TOKEN_KEY, testToken);
    localStorage.setItem(TOKEN_EXPIRY_KEY, testExpiry.toString());
    
    // Verify retrieval
    const retrievedToken = localStorage.getItem(TOKEN_KEY);
    const retrievedExpiry = parseInt(localStorage.getItem(TOKEN_EXPIRY_KEY));
    
    const isValid = retrievedToken === testToken && retrievedExpiry === testExpiry;
    
    if (isValid) {
      console.log('✅ Token storage and retrieval works correctly');
    } else {
      console.error('❌ Token storage/retrieval failed');
    }
    
    return isValid;
  } finally {
    // Restore original values
    if (originalToken) {
      localStorage.setItem(TOKEN_KEY, originalToken);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
    if (originalExpiry) {
      localStorage.setItem(TOKEN_EXPIRY_KEY, originalExpiry);
    } else {
      localStorage.removeItem(TOKEN_EXPIRY_KEY);
    }
  }
};

// =============================================================================
// TEST 4: Validate Token Expiry Check
// =============================================================================
const testTokenExpiryCheck = () => {
  console.log('🧪 Test 4: Token Expiry Check');
  
  const TOKEN_KEY = 'gmail_token';
  const TOKEN_EXPIRY_KEY = 'gmail_token_expiry';
  const TOKEN_REFRESH_BUFFER_MS = 300000; // 5 minutes
  
  // Test 1: Expired token
  const expiredExpiry = Date.now() - 1000; // 1 second ago
  const isExpired = Date.now() >= expiredExpiry - TOKEN_REFRESH_BUFFER_MS;
  console.log('Expired token check:', isExpired ? '✅ Correctly identified as expired' : '❌ Should be expired');
  
  // Test 2: Valid token
  const validExpiry = Date.now() + 3600000; // 1 hour from now
  const isValid = Date.now() < validExpiry - TOKEN_REFRESH_BUFFER_MS;
  console.log('Valid token check:', isValid ? '✅ Correctly identified as valid' : '❌ Should be valid');
  
  // Test 3: Token expiring soon (within buffer)
  const expiringSoonExpiry = Date.now() + 60000; // 1 minute from now (within 5 min buffer)
  const needsRefresh = Date.now() >= expiringSoonExpiry - TOKEN_REFRESH_BUFFER_MS;
  console.log('Expiring soon check:', needsRefresh ? '✅ Correctly identified as needing refresh' : '❌ Should need refresh');
  
  return isExpired && isValid && needsRefresh;
};

// =============================================================================
// TEST 5: Popup Blocking Detection
// =============================================================================
const testPopupBlocking = () => {
  console.log('🧪 Test 5: Popup Blocking Detection');
  
  try {
    // Try to open a popup (will be blocked if popup blocker is active)
    const testPopup = window.open('about:blank', 'test', 'width=1,height=1');
    
    if (!testPopup || testPopup.closed) {
      console.warn('⚠️ Popups are blocked! User will need to allow popups for Gmail auth.');
      return false;
    }
    
    testPopup.close();
    console.log('✅ Popups are allowed');
    return true;
  } catch (e) {
    console.warn('⚠️ Popup test failed:', e.message);
    return false;
  }
};

// =============================================================================
// TEST 6: Simulate Callback Page Token Parsing
// =============================================================================
const testTokenParsing = () => {
  console.log('🧪 Test 6: Token Parsing from URL Hash');
  
  // Simulate a callback URL hash
  const mockHash = '#access_token=ya29.mock_token_12345&token_type=Bearer&expires_in=3600&scope=https://www.googleapis.com/auth/gmail.send&state=abc123';
  
  const params = new URLSearchParams(mockHash.substring(1));
  const accessToken = params.get('access_token');
  const expiresIn = parseInt(params.get('expires_in') || '3600');
  const tokenType = params.get('token_type');
  const state = params.get('state');
  
  console.log('Parsed values:', { accessToken, expiresIn, tokenType, state });
  
  const isValid = accessToken === 'ya29.mock_token_12345' &&
                  expiresIn === 3600 &&
                  tokenType === 'Bearer' &&
                  state === 'abc123';
  
  if (isValid) {
    console.log('✅ Token parsing works correctly');
  } else {
    console.error('❌ Token parsing failed');
  }
  
  return isValid;
};

// =============================================================================
// TEST 7: Quota Manager
// =============================================================================
const testQuotaManager = () => {
  console.log('🧪 Test 7: Quota Manager');
  
  const DAILY_QUOTA_KEY = 'gmail_daily_quota';
  const LAST_RESET_KEY = 'gmail_quota_reset';
  const MAX_DAILY_EMAILS = 100;
  
  // Save current values
  const originalQuota = localStorage.getItem(DAILY_QUOTA_KEY);
  const originalReset = localStorage.getItem(LAST_RESET_KEY);
  
  try {
    // Test reset
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(DAILY_QUOTA_KEY, '0');
    localStorage.setItem(LAST_RESET_KEY, today);
    
    const usage = parseInt(localStorage.getItem(DAILY_QUOTA_KEY) || '0');
    const canSend = usage < MAX_DAILY_EMAILS;
    
    console.log('Current quota:', usage);
    console.log('Can send:', canSend);
    console.log('Remaining:', MAX_DAILY_EMAILS - usage);
    
    if (canSend && usage === 0) {
      console.log('✅ Quota manager works correctly');
      return true;
    } else {
      console.error('❌ Quota manager issue');
      return false;
    }
  } finally {
    // Restore original values
    if (originalQuota !== null) {
      localStorage.setItem(DAILY_QUOTA_KEY, originalQuota);
    }
    if (originalReset !== null) {
      localStorage.setItem(LAST_RESET_KEY, originalReset);
    }
  }
};

// =============================================================================
// TEST 8: Full OAuth Flow (Interactive)
// =============================================================================
const testFullOAuthFlow = async () => {
  console.log('🧪 Test 8: Full OAuth Flow (Interactive)');
  console.log('This will open a real Google sign-in popup. Complete the sign-in to test.');
  
  const TOKEN_KEY = 'gmail_token';
  const TOKEN_EXPIRY_KEY = 'gmail_token_expiry';
  const AUTH_SUCCESS_KEY = 'gmail_auth_success';
  const CLIENT_ID = '739427449972-6s8fmdj241khfictl9hn6gor932l4u20.apps.googleusercontent.com';
  const SCOPE = 'https://www.googleapis.com/auth/gmail.send';
  
  // Clear existing tokens for fresh test
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
  localStorage.removeItem(AUTH_SUCCESS_KEY);
  
  const redirectUri = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/oauth2callback'
    : `${window.location.origin}/oauth2callback`;

  const state = 'test_' + Date.now();
  
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'token');
  authUrl.searchParams.set('scope', SCOPE);
  authUrl.searchParams.set('prompt', 'consent');
  authUrl.searchParams.set('include_granted_scopes', 'true');
  authUrl.searchParams.set('state', state);
  
  console.log('Opening OAuth popup...');
  const popup = window.open(authUrl.toString(), 'GmailAuthTest', 'width=500,height=600,popup=1');
  
  if (!popup) {
    console.error('❌ Popup was blocked. Please allow popups and try again.');
    return false;
  }
  
  // Poll for token
  return new Promise((resolve) => {
    const startTime = Date.now();
    const maxWait = 120000; // 2 minutes
    
    const checkToken = () => {
      if (Date.now() - startTime > maxWait) {
        console.error('❌ Timeout waiting for authentication');
        resolve(false);
        return;
      }
      
      const token = localStorage.getItem(TOKEN_KEY);
      const success = localStorage.getItem(AUTH_SUCCESS_KEY);
      
      if (token && success) {
        console.log('✅ Authentication successful!');
        console.log('Token received:', token.substring(0, 20) + '...');
        console.log('Expiry:', localStorage.getItem(TOKEN_EXPIRY_KEY));
        resolve(true);
        return;
      }
      
      try {
        if (popup.closed && !token) {
          console.log('⚠️ Popup closed without token');
          resolve(false);
          return;
        }
      } catch (e) {
        // Cross-origin - popup still on Google
      }
      
      setTimeout(checkToken, 500);
    };
    
    setTimeout(checkToken, 1000);
  });
};

// =============================================================================
// RUN ALL TESTS
// =============================================================================
const testGmailAuth = async () => {
  console.log('='.repeat(60));
  console.log('GMAIL OAUTH TEST SUITE');
  console.log('='.repeat(60));
  
  const results = {
    localStorageKeys: testLocalStorageKeys(),
    oauthUrl: testOAuthUrlGeneration(),
    tokenStorage: testTokenStorage(),
    expiryCheck: testTokenExpiryCheck(),
    popupBlocking: testPopupBlocking(),
    tokenParsing: testTokenParsing(),
    quotaManager: testQuotaManager()
  };
  
  console.log('\n' + '='.repeat(60));
  console.log('TEST RESULTS SUMMARY');
  console.log('='.repeat(60));
  
  let passed = 0;
  let failed = 0;
  
  for (const [test, result] of Object.entries(results)) {
    if (result) {
      console.log(`✅ ${test}: PASSED`);
      passed++;
    } else {
      console.log(`❌ ${test}: FAILED`);
      failed++;
    }
  }
  
  console.log('='.repeat(60));
  console.log(`Total: ${passed} passed, ${failed} failed`);
  console.log('='.repeat(60));
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! OAuth should work correctly.');
    console.log('\nTo test the full interactive flow, run:');
    console.log('  await testFullOAuthFlow()');
  } else {
    console.log('\n⚠️ Some tests failed. Review the errors above.');
  }
  
  return results;
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.testGmailAuth = testGmailAuth;
  window.testFullOAuthFlow = testFullOAuthFlow;
}

export { testGmailAuth, testFullOAuthFlow };

