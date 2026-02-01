'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

// Cache key for localStorage
const PROFILE_CACHE_KEY = 'drafted_user_profile';
const PROFILE_CACHE_EXPIRY_KEY = 'drafted_user_profile_expiry';
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes cache

export function useAuth() {
  return useContext(AuthContext);
}

/**
 * Enhanced AuthProvider with profile data prefetching
 *
 * Best practices implemented:
 * 1. Prefetch profile data when user authenticates
 * 2. Cache profile data in memory and localStorage
 * 3. Provide loading states for optimistic UI
 * 4. Allow manual refresh of profile data
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);

  // Try to load cached profile data from localStorage
  const loadCachedProfile = useCallback(() => {
    if (typeof window === 'undefined') return null;
    
    try {
      const cachedData = localStorage.getItem(PROFILE_CACHE_KEY);
      const cacheExpiry = localStorage.getItem(PROFILE_CACHE_EXPIRY_KEY);

      if (cachedData && cacheExpiry) {
        const expiryTime = parseInt(cacheExpiry, 10);
        if (Date.now() < expiryTime) {
          return JSON.parse(cachedData);
        }
      }
    } catch (error) {
      console.warn('[AuthContext] Failed to load cached profile:', error);
    }
    return null;
  }, []);

  // Save profile data to localStorage cache
  const cacheProfile = useCallback((data) => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(data));
      localStorage.setItem(PROFILE_CACHE_EXPIRY_KEY, (Date.now() + CACHE_DURATION_MS).toString());
    } catch (error) {
      console.warn('[AuthContext] Failed to cache profile:', error);
    }
  }, []);

  // Clear profile cache
  const clearProfileCache = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(PROFILE_CACHE_KEY);
      localStorage.removeItem(PROFILE_CACHE_EXPIRY_KEY);
    } catch (error) {
      console.warn('[AuthContext] Failed to clear profile cache:', error);
    }
  }, []);

  // Fetch profile data from Firestore
  const fetchProfile = useCallback(async (email, forceRefresh = false) => {
    if (!email) return null;

    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = loadCachedProfile();
      if (cached && cached.email === email.toLowerCase()) {
        setProfileData(cached);
        return cached;
      }
    }

    setProfileLoading(true);
    setProfileError(null);

    try {
      const lowercaseEmail = email.toLowerCase().trim();
      const userDocRef = doc(db, "drafted-accounts", lowercaseEmail);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const data = { ...docSnap.data(), email: lowercaseEmail };
        setProfileData(data);
        cacheProfile(data);
        return data;
      } else {
        console.warn('[AuthContext] No profile found for:', lowercaseEmail);
        setProfileData(null);
        return null;
      }
    } catch (error) {
      console.error('[AuthContext] Error fetching profile:', error);
      setProfileError(error.message);
      return null;
    } finally {
      setProfileLoading(false);
    }
  }, [loadCachedProfile, cacheProfile]);

  // Refresh profile data (for manual refresh or after updates)
  const refreshProfile = useCallback(async () => {
    if (user?.email) {
      return fetchProfile(user.email, true);
    }
    return null;
  }, [user, fetchProfile]);

  // Update profile data locally (for optimistic updates)
  const updateProfileLocally = useCallback((updates) => {
    setProfileData(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      cacheProfile(updated);
      return updated;
    });
  }, [cacheProfile]);

  // Monitor authentication state and prefetch profile
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      console.log('[AuthContext] Auth state changed:', currentUser?.email || 'signed out');
      setUser(currentUser);

      if (currentUser?.email) {
        const normalizedEmail = currentUser.email.toLowerCase().trim();
        console.log('[AuthContext] Fetching profile for:', normalizedEmail);
        
        // Immediately try to load cached profile (instant)
        const cached = loadCachedProfile();
        if (cached && cached.email === normalizedEmail) {
          console.log('[AuthContext] Using cached profile');
          setProfileData(cached);
        }

        // Then fetch fresh data in background (force past the cache)
        try {
          const profile = await fetchProfile(currentUser.email, true);
          console.log('[AuthContext] Profile fetched:', profile ? 'success' : 'not found');
        } catch (err) {
          console.error('[AuthContext] Background profile fetch failed:', err);
        }
      } else {
        // User signed out - clear profile
        console.log('[AuthContext] User signed out, clearing profile');
        setProfileData(null);
        clearProfileCache();
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchProfile, loadCachedProfile, clearProfileCache]);

  const value = {
    // Auth state
    user,
    loading,

    // Profile state
    profileData,
    profileLoading,
    profileError,

    // Profile methods
    refreshProfile,
    updateProfileLocally,

    // Computed helpers
    isAuthenticated: !!user,
    hasProfile: !!profileData,
    hasVideo: !!profileData?.video1,
    hasSharedOnLinkedIn: !!profileData?.sharedOnLinkedIn,
    isProfileComplete: !!profileData?.video1 && !!profileData?.sharedOnLinkedIn
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export { AuthContext };
