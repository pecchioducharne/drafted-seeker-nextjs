'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

const PostHogContext = createContext();

// Disable PostHog entirely to avoid rrweb errors
const DISABLE_POSTHOG = true;

export function PostHogProvider({ children }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [posthogInstance, setPosthogInstance] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined' || DISABLE_POSTHOG) return;
    
    if (!isInitialized) {
      // Dynamic import to avoid loading PostHog if disabled
      import('posthog-js').then((module) => {
        const posthog = module.default;
        const apiKey = 'phc_LndLN4b8o0tES8TMi5og8jYHf32uSNCfGi8aVd8eKwK';
        const apiHost = 'https://us.i.posthog.com';
        
        try {
          posthog.init(apiKey, {
            api_host: apiHost,
            capture_pageview: true,
            autocapture: false,
            disable_session_recording: true,
            loaded: (posthog) => {
              if (process.env.NODE_ENV === 'development') posthog.debug();
            }
          });
          
          setPosthogInstance(posthog);
          setIsInitialized(true);
          console.log('PostHog initialized');
        } catch (error) {
          console.warn('PostHog initialization error:', error);
          setIsInitialized(false);
        }
      }).catch((error) => {
        console.warn('PostHog import error:', error);
        setIsInitialized(false);
      });
    }
    
    return () => {
      // Clean up if needed
    };
  }, [isInitialized]);

  return (
    <PostHogContext.Provider value={{ posthog: posthogInstance, isInitialized }}>
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
  // These will be no-ops if PostHog is disabled
  return {
    posthog: context.posthog,
    isInitialized: context.isInitialized && !DISABLE_POSTHOG,
    captureEvent: (eventName, properties) => {
      if (DISABLE_POSTHOG) {
        console.log('[PostHog Disabled] Would capture:', eventName, properties);
        return;
      }
      if (context.posthog && context.isInitialized) {
        try {
          context.posthog.capture(eventName, properties);
        } catch (error) {
          console.warn('PostHog capture error:', error);
        }
      }
    },
    identify: (userId, properties) => {
      if (DISABLE_POSTHOG) {
        console.log('[PostHog Disabled] Would identify:', userId, properties);
        return;
      }
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
