'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { usePostHog } from '@/contexts/PostHogContext';
import toast from 'react-hot-toast';
import { Sparkles, CheckCircle2, Loader2 } from 'lucide-react';

export default function StepSuccess({ data, isCreatingAccount, setIsCreatingAccount }) {
  const router = useRouter();
  const { captureEvent, identify } = usePostHog();
  const [status, setStatus] = useState('creating'); // creating, success, error
  const [error, setError] = useState('');

  useEffect(() => {
    if (isCreatingAccount) {
      createAccount();
    }
  }, [isCreatingAccount]);

  const createAccount = async () => {
    try {
      setStatus('creating');
      
      // Create Firebase Auth account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      const user = userCredential.user;
      const lowercaseEmail = data.email.toLowerCase();

      // Prepare user data for Firestore
      const userData = {
        firstName: data.firstName,
        lastName: data.lastName,
        university: typeof data.university === 'object' ? data.university.label : data.university,
        major: data.major || data.customMajor,
        graduationMonth: data.graduationMonth,
        graduationYear: data.graduationYear,
        email: lowercaseEmail,
        linkedInURL: data.linkedInURL || '',
        gitHubURL: data.gitHubURL || '',
        websiteURL: data.websiteURL || '',
        companyOptions: data.companyOptions || [],
        video1: '',
        video2: '',
        video3: '',
        resume: '',
        experience: data.experience || [],
        referralInfo: data.referralSource === 'other' 
          ? `${data.referralSource}: ${data.referralDetail}` 
          : data.referralSource || 'Not specified',
        createdAt: serverTimestamp(),
        uid: user.uid
      };

      // Save to Firestore
      const userDocRef = doc(db, 'drafted-accounts', lowercaseEmail);
      await setDoc(userDocRef, userData);

      // Analytics
      identify(user.uid, {
        email: lowercaseEmail,
        firstName: data.firstName,
        lastName: data.lastName,
        university: userData.university,
        major: userData.major,
        graduationYear: data.graduationYear
      });

      captureEvent('account_created', {
        email: lowercaseEmail,
        university: userData.university,
        major: userData.major,
        referralSource: data.referralSource
      });

      console.log('✅ Account created successfully:', lowercaseEmail);
      
      setStatus('success');
      
      // Show success toast
      toast.success('Account created successfully! 🎉', {
        duration: 3000,
      });

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);

    } catch (error) {
      console.error('❌ Account creation error:', error);
      setStatus('error');
      
      let errorMessage = 'Failed to create account. Please try again.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please sign in instead.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use a stronger password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      setError(errorMessage);
      toast.error(errorMessage, {
        duration: 5000,
      });

      setIsCreatingAccount(false);
    }
  };

  const handleRetry = () => {
    setStatus('creating');
    setError('');
    createAccount();
  };

  return (
    <div className="text-center">
      {status === 'creating' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-8"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-24 h-24 mx-auto"
          >
            <Sparkles className="w-full h-full text-green-400" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold text-white"
          >
            Creating your account...
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-lg"
          >
            This will only take a moment
          </motion.p>

          <motion.div
            className="flex justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-3 h-3 bg-green-400 rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}

      {status === 'success' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="w-24 h-24 mx-auto"
          >
            <CheckCircle2 className="w-full h-full text-green-400" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-6xl font-bold text-white"
          >
            Welcome to Drafted! 🎉
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-400 text-lg"
          >
            Your account has been created successfully
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-green-400 text-sm"
          >
            Redirecting to your dashboard...
          </motion.p>
        </motion.div>
      )}

      {status === 'error' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="w-24 h-24 mx-auto text-red-400"
          >
            <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold text-white"
          >
            Something went wrong
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-red-400 text-lg"
          >
            {error}
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={handleRetry}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all duration-200 inline-flex items-center gap-2"
          >
            <Loader2 className="w-5 h-5" />
            Try Again
          </motion.button>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-gray-400 text-sm"
          >
            or{' '}
            <a href="/login" className="text-green-400 hover:text-green-300 font-medium">
              go to login
            </a>
          </motion.p>
        </motion.div>
      )}
    </div>
  );
}
