'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronLeft, Eye, EyeOff, Check, X } from 'lucide-react';

export default function StepPassword({ data, onNext, onBack }) {
  const [password, setPassword] = useState(data.password || '');
  const [confirmPassword, setConfirmPassword] = useState(data.confirmPassword || '');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const passwordRef = useRef(null);

  useEffect(() => {
    passwordRef.current?.focus();
  }, []);

  const passwordRequirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Contains lowercase letter', met: /[a-z]/.test(password) },
    { label: 'Contains number', met: /[0-9]/.test(password) },
    { label: 'Passwords match', met: password && confirmPassword && password === confirmPassword }
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = 'Password must contain at least one uppercase letter';
    } else if (!/[a-z]/.test(password)) {
      newErrors.password = 'Password must contain at least one lowercase letter';
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = 'Password must contain at least one number';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext({ password, confirmPassword });
    }
  };

  const isPasswordValid = () => {
    return password.length >= 8 && 
           /[A-Z]/.test(password) && 
           /[a-z]/.test(password) && 
           /[0-9]/.test(password);
  };

  const handleKeyPress = (e, field) => {
    if (e.key === 'Enter') {
      if (field === 'password' && isPasswordValid()) {
        document.querySelector('[data-confirm-password]')?.focus();
      } else if (field === 'confirm' && password === confirmPassword && isPasswordValid()) {
        handleNext();
      }
    }
  };

  return (
    <div className="text-center">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl md:text-6xl font-bold text-white mb-4"
      >
        Secure your account
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-gray-400 text-lg mb-12"
      >
        Create a strong password to protect your profile
      </motion.p>

      <div className="space-y-6">
        {/* Password Input */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <label className="block text-gray-400 text-sm mb-2 ml-10 text-left">Password</label>
          <div className="flex items-center text-xl text-white">
            <span className="text-green-400 mr-4 font-mono flex-shrink-0">{'>'}</span>
            <input
              ref={passwordRef}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors({});
              }}
              onKeyPress={(e) => handleKeyPress(e, 'password')}
              placeholder="Enter your password"
              className="bg-transparent border-none outline-none flex-1 placeholder-gray-500 font-light"
              style={{ caretColor: '#4ade80' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="ml-2 text-gray-400 hover:text-green-400 transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-sm mt-2 ml-10 text-left"
            >
              {errors.password}
            </motion.p>
          )}
        </motion.div>

        {/* Confirm Password Input */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="relative"
        >
          <label className="block text-gray-400 text-sm mb-2 ml-10 text-left">Confirm Password</label>
          <div className="flex items-center text-xl text-white">
            <span className="text-green-400 mr-4 font-mono flex-shrink-0">{'>'}</span>
            <input
              data-confirm-password
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setErrors({});
              }}
              onKeyPress={(e) => handleKeyPress(e, 'confirm')}
              placeholder="Confirm your password"
              className="bg-transparent border-none outline-none flex-1 placeholder-gray-500 font-light"
              style={{ caretColor: '#4ade80' }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="ml-2 text-gray-400 hover:text-green-400 transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-sm mt-2 ml-10 text-left"
            >
              {errors.confirmPassword}
            </motion.p>
          )}
        </motion.div>

        {/* Password Requirements */}
        {password && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 rounded-lg p-4 ml-10 text-left"
          >
            <p className="text-gray-400 text-sm mb-2">Password requirements:</p>
            <div className="space-y-1">
              {passwordRequirements.map((req, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  {req.met ? (
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                  ) : (
                    <X className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  )}
                  <span className={req.met ? 'text-green-400' : 'text-gray-500'}>
                    {req.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-12 space-y-4 flex items-center justify-center gap-4"
      >
        <button
          onClick={onBack}
          className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-4 rounded-xl text-lg transition-all duration-200 inline-flex items-center gap-2"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>
        
        <button
          onClick={handleNext}
          disabled={!password || !confirmPassword || !isPasswordValid() || password !== confirmPassword}
          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold px-8 py-4 rounded-xl text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 inline-flex items-center gap-2"
        >
          Continue
          <ChevronRight className="w-5 h-5" />
        </button>
      </motion.div>
    </div>
  );
}
