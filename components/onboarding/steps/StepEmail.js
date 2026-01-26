'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Upload, Loader2 } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import toast from 'react-hot-toast';

export default function StepEmail({ data, onNext }) {
  const [email, setEmail] = useState(data.email);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState('');
  const emailRef = useRef(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email) && email.includes('@') && email.split('@')[1].includes('.');
  };

  const checkEmailExists = async (email) => {
    try {
      const lowercaseEmail = email.toLowerCase();
      const userDocRef = doc(db, 'drafted-accounts', lowercaseEmail);
      const docSnap = await getDoc(userDocRef);
      return docSnap.exists();
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  };

  const handleNext = async () => {
    setError('');
    
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsChecking(true);
    
    try {
      const exists = await checkEmailExists(email);
      
      if (exists) {
        setError('This email is already registered. Please sign in instead.');
        toast.error('Account already exists. Please sign in.', {
          duration: 4000,
        });
        setIsChecking(false);
        return;
      }

      // Email is valid and doesn't exist - proceed
      onNext({ email: email.toLowerCase() });
    } catch (error) {
      console.error('Error:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsChecking(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && email.trim() && !isChecking) {
      handleNext();
    }
  };

  return (
    <div className="text-center">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl md:text-6xl font-bold text-white mb-4"
      >
        Let's get you hired.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-gray-400 text-lg mb-12"
      >
        Rock 'n' roll.
      </motion.p>

      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <div className="flex items-center text-2xl md:text-3xl text-white">
            <span className="text-green-400 mr-4 font-mono flex-shrink-0">{'>'}</span>
            <input
              ref={emailRef}
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              onKeyPress={handleKeyPress}
              placeholder="your.email@university.edu"
              className="bg-transparent border-none outline-none flex-1 placeholder-gray-500 font-light"
              style={{ caretColor: '#4ade80' }}
              disabled={isChecking}
            />
          </div>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-sm mt-2 ml-10"
            >
              {error}
            </motion.p>
          )}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-12 space-y-4"
      >
        {!email.trim() && !error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gray-400 text-sm mb-4"
          >
            Enter your email to begin your journey
          </motion.p>
        )}
        
        <button
          onClick={handleNext}
          disabled={!email.trim() || isChecking}
          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold px-8 py-6 rounded-xl text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 inline-flex items-center gap-2"
        >
          {isChecking ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              Continue
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>

        <div className="text-gray-400 text-sm">
          <span>Already have an account? </span>
          <a
            href="/login"
            className="text-green-400 hover:text-green-300 font-medium transition-colors"
          >
            Sign in
          </a>
        </div>

        {/* Optional: Resume upload for auto-fill - can add later */}
        {/* <div className="pt-8 border-t border-white/10 mt-8">
          <p className="text-gray-400 text-sm mb-4">Have a resume? Upload it to skip ahead</p>
          <button className="text-green-400 hover:text-green-300 text-sm inline-flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload Resume
          </button>
        </div> */}
      </motion.div>
    </div>
  );
}
