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
        // Disable session recording to avoid rrweb errors
        disable_session_recording: true,
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
  
  // Return a safe wrapper object with common methods
  return {
    posthog: context.posthog,
    isInitialized: context.isInitialized,
    captureEvent: (eventName, properties) => {
      if (context.posthog && context.isInitialized) {
        try {
          context.posthog.capture(eventName, properties);
        } catch (error) {
          console.warn('PostHog capture error:', error);
        }
      }
    },
    identify: (userId, properties) => {
      if (context.posthog && context.isInitialized) {
        try {
          context.posthog.identify(userId, properties);
        } catch (error) {
          console.warn('PostHog identify error:', error);
        }
      }
    }
  };
}
