'use client';

import { useEffect, useState } from 'react';

// LocalStorage keys (must match gmailAuth.js)
const TOKEN_KEY = 'gmail_access_token';
const TOKEN_EXPIRY_KEY = 'gmail_token_expiry';
const AUTH_SUCCESS_KEY = 'gmail_auth_success';
const AUTH_ERROR_KEY = 'gmail_auth_error';
const AUTH_READY_KEY = 'gmail_auth_ready';
const BROADCAST_CHANNEL_NAME = 'gmail_auth_channel';

export default function OAuth2Callback() {
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      console.log('[OAuth2Callback] Page loaded');
      console.log('[OAuth2Callback] Full URL:', window.location.href);
      console.log('[OAuth2Callback] Hash:', window.location.hash);

      // Parse hash parameters
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);

      console.log('[OAuth2Callback] Parsed params:', Object.fromEntries(params));

      const accessToken = params.get('access_token');
      const expiresIn = params.get('expires_in');
      const error = params.get('error');

      if (error) {
        console.error('[OAuth2Callback] OAuth error:', error);
        localStorage.setItem(AUTH_ERROR_KEY, error);
        setError(error);
        setStatus('error');

        // Notify via BroadcastChannel
        try {
          const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
          channel.postMessage({ type: 'AUTH_ERROR', error });
          channel.close();
        } catch (e) {
          console.warn('[OAuth2Callback] BroadcastChannel not available:', e);
        }

        // Close window after showing error
        setTimeout(() => {
          window.close();
        }, 3000);
        return;
      }

      if (!accessToken) {
        console.error('[OAuth2Callback] No access token in URL');
        const errorMsg = 'No access token received';
        localStorage.setItem(AUTH_ERROR_KEY, errorMsg);
        setError(errorMsg);
        setStatus('error');

        // Notify via BroadcastChannel
        try {
          const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
          channel.postMessage({ type: 'AUTH_ERROR', error: errorMsg });
          channel.close();
        } catch (e) {
          console.warn('[OAuth2Callback] BroadcastChannel not available:', e);
        }

        setTimeout(() => {
          window.close();
        }, 3000);
        return;
      }

      // Store token in localStorage
      const expiryTime = Date.now() + (parseInt(expiresIn || '3600') * 1000);
      localStorage.setItem(TOKEN_KEY, accessToken);
      localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
      localStorage.setItem(AUTH_SUCCESS_KEY, 'true');
      localStorage.setItem(AUTH_READY_KEY, Date.now().toString());

      console.log('[OAuth2Callback] Token stored successfully');
      console.log('[OAuth2Callback] Expires at:', new Date(expiryTime).toISOString());

      setStatus('success');

      // Notify main window via BroadcastChannel
      try {
        const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        channel.postMessage({
          type: 'AUTH_SUCCESS',
          accessToken,
          expiresIn: parseInt(expiresIn || '3600')
        });
        console.log('[OAuth2Callback] Sent AUTH_SUCCESS via BroadcastChannel');
        channel.close();
      } catch (e) {
        console.warn('[OAuth2Callback] BroadcastChannel not available, relying on localStorage:', e);
      }

      // Close window after a short delay
      setTimeout(() => {
        console.log('[OAuth2Callback] Closing window');
        window.close();
      }, 1000);

    } catch (err) {
      console.error('[OAuth2Callback] Unexpected error:', err);
      const errorMsg = err.message || 'Authentication failed';
      localStorage.setItem(AUTH_ERROR_KEY, errorMsg);
      setError(errorMsg);
      setStatus('error');

      setTimeout(() => {
        window.close();
      }, 3000);
    }
  }, []);

  return (
    <div className="min-h-screen drafted-background flex items-center justify-center p-4">
      <div className="max-w-md w-full drafted-card text-center">
        {status === 'processing' && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-drafted-green border-t-transparent rounded-full animate-spin"></div>
            <h1 className="text-2xl font-bold text-white mb-2">Authenticating...</h1>
            <p className="text-gray-400">Processing Gmail authentication</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 bg-drafted-green/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-drafted-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Success!</h1>
            <p className="text-gray-400">Gmail authenticated successfully</p>
            <p className="text-sm text-gray-500 mt-2">This window will close automatically...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Authentication Failed</h1>
            <p className="text-red-400">{error}</p>
            <p className="text-sm text-gray-500 mt-2">This window will close automatically...</p>
          </>
        )}
      </div>
    </div>
  );
}
