// Utility helpers to call Netlify Functions in both production and local dev

// Returns the origin to use for Netlify Functions
// Priority order:
// 1) Explicit override via REACT_APP_FUNCTIONS_ORIGIN (env)
// 2) LocalStorage override 'functions_origin' (handy for testing)
// 3) If on localhost → http://localhost:8888 (default `netlify dev` origin)
// 4) Otherwise → current window origin (production)
export const getFunctionsOrigin = () => {
  try {
    const envOverride = process.env.REACT_APP_FUNCTIONS_ORIGIN;
    if (envOverride && envOverride.trim()) {
      try { console.log('[Netlify] Using REACT_APP_FUNCTIONS_ORIGIN:', envOverride.trim()); } catch (_) {}
      return envOverride.trim();
    }

    const lsOverride = typeof window !== 'undefined'
      ? window.localStorage.getItem('functions_origin')
      : null;
    if (lsOverride && lsOverride.trim()) {
      try { console.log('[Netlify] Using localStorage functions_origin:', lsOverride.trim()); } catch (_) {}
      return lsOverride.trim();
    }

    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        try { console.log('[Netlify] Detected localhost, defaulting functions origin to http://localhost:8888'); } catch (_) {}
        return 'http://localhost:8888';
      }
      try { console.log('[Netlify] Using window.location.origin as functions origin:', window.location.origin); } catch (_) {}
      return window.location.origin;
    }
  } catch (_) {
    // fallthrough
  }
  return '';
};

// Helper to call a Netlify Function with a path like '/exchangeGmailToken'
export const functionsFetch = (fnPath, options) => {
  const normalizedPath = fnPath.startsWith('/') ? fnPath : `/${fnPath}`;
  const origin = getFunctionsOrigin();
  const url = `${origin}/.netlify/functions${normalizedPath}`;
  try {
    console.log('[Netlify] functionsFetch →', {
      url,
      method: options?.method || 'GET',
      hasBody: Boolean(options?.body),
      origin
    });
  } catch (_) {}
  const doFetch = async () => {
    try {
      return await fetch(url, options);
    } catch (err) {
      console.warn('[Netlify] Primary fetch failed, attempting Firebase Functions fallback...', err?.message || err);
      // Fallback to Firebase Functions origin
      const fbOrigin = (typeof window !== 'undefined' && window.localStorage.getItem('firebase_functions_origin'))
        || process.env.REACT_APP_FIREBASE_FUNCTIONS_ORIGIN
        || 'https://us-central1-drafted-6c302.cloudfunctions.net';
      const fbUrl = `${fbOrigin}${normalizedPath}`;
      try { console.log('[Netlify] Fallback fetch →', { fbUrl, method: options?.method || 'GET' }); } catch (_) {}
      return await fetch(fbUrl, options);
    }
  };
  return doFetch();
};

// Firebase Functions direct caller (bypasses Netlify entirely)
export const getFirebaseFunctionsOrigin = () => {
  try {
    const ls = typeof window !== 'undefined' ? window.localStorage.getItem('firebase_functions_origin') : null;
    if (ls && ls.trim()) {
      try { console.log('[Firebase] Using localStorage firebase_functions_origin:', ls.trim()); } catch (_) {}
      return ls.trim();
    }
    const env = process.env.REACT_APP_FIREBASE_FUNCTIONS_ORIGIN;
    if (env && env.trim()) {
      try { console.log('[Firebase] Using REACT_APP_FIREBASE_FUNCTIONS_ORIGIN:', env.trim()); } catch (_) {}
      return env.trim();
    }
  } catch (_) {}
  const fallback = 'https://us-central1-drafted-6c302.cloudfunctions.net';
  try { console.log('[Firebase] Using default Firebase Functions origin:', fallback); } catch (_) {}
  return fallback;
};

export const firebaseFunctionsFetch = (fnName, options) => {
  const origin = getFirebaseFunctionsOrigin();
  const normalized = fnName.startsWith('/') ? fnName.slice(1) : fnName;
  const url = `${origin}/${normalized}`;
  try {
    console.log('[Firebase] functionsFetch →', {
      url,
      method: options?.method || 'GET',
      hasBody: Boolean(options?.body),
      origin
    });
  } catch (_) {}
  return fetch(url, options);
};


