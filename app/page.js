'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import LoadingScreen from '../components/shared/LoadingScreen';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // If logged in, redirect to dashboard
        router.push('/dashboard');
      } else {
        // If not logged in, redirect to onboarding
        router.push('/onboarding');
      }
    }
  }, [user, loading, router]);

  return <LoadingScreen message="Welcome to Drafted..." />;
}
