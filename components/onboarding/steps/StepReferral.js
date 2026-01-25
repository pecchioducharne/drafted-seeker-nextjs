'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronLeft, Users, Instagram, Music, Newspaper, Mail, MessageSquare } from 'lucide-react';

const REFERRAL_OPTIONS = [
  { value: 'word_of_mouth', label: 'Word of Mouth', icon: Users },
  { value: 'instagram', label: 'Instagram', icon: Instagram },
  { value: 'tiktok', label: 'TikTok', icon: Music },
  { value: 'news', label: 'News / Article', icon: Newspaper },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'other', label: 'Other', icon: MessageSquare }
];

export default function StepReferral({ data, onNext, onBack, isCreatingAccount, setIsCreatingAccount }) {
  const [referralSource, setReferralSource] = useState(data.referralSource || '');
  const [referralDetail, setReferralDetail] = useState(data.referralDetail || '');
  const [error, setError] = useState('');
  const detailInputRef = useRef(null);

  useEffect(() => {
    if (referralSource === 'other' && detailInputRef.current) {
      detailInputRef.current.focus();
    }
  }, [referralSource]);

  const handleSelect = (value) => {
    setReferralSource(value);
    setError('');
    if (value !== 'other') {
      setReferralDetail('');
    }
  };

  const handleNext = async () => {
    if (!referralSource) {
      setError('Please select an option');
      return;
    }

    if (referralSource === 'other' && !referralDetail.trim()) {
      setError('Please tell us how you heard about us');
      return;
    }

    setIsCreatingAccount(true);
    
    // Proceed to create account (handled by StepSuccess)
    onNext({ 
      referralSource,
      referralDetail: referralDetail.trim()
    });
  };

  return (
    <div className="text-center">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl md:text-6xl font-bold text-white mb-4"
      >
        How did you hear about us? 🎯
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-gray-400 text-lg mb-12"
      >
        Help us understand how you found Drafted
      </motion.p>

      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {REFERRAL_OPTIONS.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`p-6 rounded-xl text-left transition-all duration-300 ${
                  referralSource === option.value
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-[0_0_30px_rgba(74,222,128,0.4)] scale-105'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:scale-102'
                }`}
              >
                <Icon className={`w-8 h-8 mb-3 ${
                  referralSource === option.value ? 'text-white' : 'text-green-400'
                }`} />
                <p className="font-semibold text-lg">{option.label}</p>
              </button>
            );
          })}
        </motion.div>

        {referralSource === 'other' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative mt-6"
          >
            <label className="block text-gray-400 text-sm mb-2 ml-10 text-left">Tell us more</label>
            <div className="flex items-center text-xl text-white">
              <span className="text-green-400 mr-4 font-mono flex-shrink-0">{'>'}</span>
              <input
                ref={detailInputRef}
                type="text"
                value={referralDetail}
                onChange={(e) => {
                  setReferralDetail(e.target.value);
                  setError('');
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && referralDetail.trim()) {
                    handleNext();
                  }
                }}
                placeholder="How did you hear about us?"
                className="bg-transparent border-none outline-none flex-1 placeholder-gray-500 font-light"
                style={{ caretColor: '#4ade80' }}
              />
            </div>
          </motion.div>
        )}

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-400 text-sm"
          >
            {error}
          </motion.p>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-12 space-y-4 flex items-center justify-center gap-4"
      >
        <button
          onClick={onBack}
          disabled={isCreatingAccount}
          className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-4 rounded-xl text-lg transition-all duration-200 inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>
        
        <button
          onClick={handleNext}
          disabled={!referralSource || (referralSource === 'other' && !referralDetail.trim()) || isCreatingAccount}
          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold px-8 py-4 rounded-xl text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 inline-flex items-center gap-2"
        >
          {isCreatingAccount ? 'Creating your account...' : 'Create Account'}
          <ChevronRight className="w-5 h-5" />
        </button>
      </motion.div>
    </div>
  );
}
