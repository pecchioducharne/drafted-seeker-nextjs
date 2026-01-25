'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import posthog from 'posthog-js';

const PostHogContext = createContext();

export function PostHogProvider({ children }) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if (!isInitialized) {
      const apiKey = 'phc_LndLN4b8o0tES8TMi5og8jYHf32uSNCfGi8aVd8eKwK';
      const apiHost = 'https://us.i.posthog.com';
      
      posthog.init(apiKey, {
        api_host: apiHost,
        capture_pageview: true,
        autocapture: true,
        loaded: (posthog) => {
          if (process.env.NODE_ENV === 'development') posthog.debug();
        }
      });
      
      setIsInitialized(true);
      console.log('PostHog initialized');
    }
    
    return () => {
      // Clean up if needed
    };
  }, [isInitialized]);

  return (
    <PostHogContext.Provider value={{ posthog, isInitialized }}>
      {children}
    </PostHogContext.Provider>
  );
}

export function usePostHog() {
  const context = useContext(PostHogContext);
  if (context === undefined) {
    throw new Error('usePostHog must be used within a PostHogProvider');
  }
  return context.posthog;
}
