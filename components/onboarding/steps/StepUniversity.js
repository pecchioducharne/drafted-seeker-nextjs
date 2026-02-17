'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronLeft, Search, Loader2 } from 'lucide-react';
import AsyncSelect from 'react-select/async';
import axios from 'axios';
import Levenshtein from 'fast-levenshtein';

const customStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: 'transparent',
    border: 'none',
    boxShadow: 'none',
    fontSize: '1.5rem',
    color: 'white',
    minHeight: '60px',
    '&:hover': {
      border: 'none',
    },
  }),
  input: (provided) => ({
    ...provided,
    color: 'white',
    fontSize: '1.5rem',
    caretColor: '#4ade80',
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#6b7280',
    fontSize: '1.5rem',
  }),
  singleValue: (provided) => ({
    ...provided,
    color: 'white',
    fontSize: '1.5rem',
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: '#1e293b',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    overflow: 'hidden',
  }),
  menuList: (provided) => ({
    ...provided,
    padding: '8px',
    maxHeight: '300px',
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused ? 'rgba(74, 222, 128, 0.1)' : 'transparent',
    color: state.isFocused ? '#4ade80' : 'white',
    fontSize: '1rem',
    padding: '12px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: 'rgba(74, 222, 128, 0.15)',
      color: '#4ade80',
    },
  }),
  noOptionsMessage: (provided) => ({
    ...provided,
    color: '#9ca3af',
    fontSize: '0.875rem',
    padding: '12px',
  }),
  loadingMessage: (provided) => ({
    ...provided,
    color: '#4ade80',
    fontSize: '0.875rem',
    padding: '12px',
  }),
};

export default function StepUniversity({ data, onNext, onBack }) {
  const [university, setUniversity] = useState(data.university);
  const [customUniversity, setCustomUniversity] = useState(data.customUniversity || '');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [error, setError] = useState('');
  const [isAutoFilled, setIsAutoFilled] = useState(false);
  const customInputRef = useRef(null);

  useEffect(() => {
    if (showCustomInput) {
      customInputRef.current?.focus();
    }
  }, [showCustomInput]);

  useEffect(() => {
    if (data.matchedUniversity && !university) {
      const autoFilledUniversity = {
        value: data.matchedUniversity.name,
        label: data.matchedUniversity.name
      };
      setUniversity(autoFilledUniversity);
      setIsAutoFilled(true);
    }
  }, [data.matchedUniversity]);

  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      return new Promise((resolve) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          resolve(func(...args));
        }, wait);
      });
    };
  };

  const fetchUniversities = async (inputValue) => {
    if (!inputValue || inputValue.length < 2) {
      return [];
    }

    try {
      const response = await axios.post('/api/searchUniversities', {
        query: inputValue
      });

      const universities = response.data.results.map((university) => ({
        value: university.id,
        label: university.school.name,
      }));

      universities.sort((a, b) => {
        const distanceA = Levenshtein.get(a.label.toLowerCase(), inputValue.toLowerCase());
        const distanceB = Levenshtein.get(b.label.toLowerCase(), inputValue.toLowerCase());
        return distanceA - distanceB;
      });

      return universities;
    } catch (error) {
      console.error('Error fetching universities:', error);
      return [
        { value: 'other', label: `Can't find your school? Type to enter custom...` }
      ];
    }
  };

  const loadUniversities = useCallback(
    debounce(fetchUniversities, 500),
    []
  );

  const handleNext = () => {
    setError('');
    
    if (!university && !customUniversity.trim()) {
      setError('Please select or enter your university');
      return;
    }

    onNext({
      university: university || customUniversity,
      customUniversity: customUniversity.trim()
    });
  };

  const handleUniversityChange = (selectedOption) => {
    if (selectedOption?.value === 'other') {
      setShowCustomInput(true);
      setUniversity(null);
    } else {
      setUniversity(selectedOption);
      setShowCustomInput(false);
      setCustomUniversity('');
      setError('');
    }
  };

  return (
    <div className="text-center">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl md:text-6xl font-bold text-white mb-4"
      >
        Where do you study?
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-gray-400 text-lg mb-12"
      >
        {isAutoFilled ? 'We found your university from your email' : 'Start typing your university name'}
      </motion.p>

      <div className="space-y-6">
        {!showCustomInput ? (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <div className="flex items-start text-2xl md:text-3xl text-white">
              <span className="text-green-400 mr-4 font-mono flex-shrink-0 mt-4">{'>'}</span>
              <div className="flex-1">
                <AsyncSelect
                  cacheOptions
                  loadOptions={loadUniversities}
                  defaultOptions={false}
                  value={university}
                  onChange={handleUniversityChange}
                  placeholder="Search for your university..."
                  styles={customStyles}
                  loadingMessage={() => "Searching..."}
                  noOptionsMessage={({ inputValue }) => 
                    inputValue.length < 2 
                      ? "Type at least 2 characters..." 
                      : "No universities found. Try a different search or enter manually."
                  }
                />
              </div>
            </div>
            {isAutoFilled && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-green-400 text-sm mt-2 ml-10"
              >
                Pre-filled from your email domain. You can change it if needed.
              </motion.p>
            )}
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
        ) : (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative"
          >
            <div className="flex items-center text-2xl md:text-3xl text-white">
              <span className="text-green-400 mr-4 font-mono flex-shrink-0">{'>'}</span>
              <input
                ref={customInputRef}
                type="text"
                value={customUniversity}
                onChange={(e) => {
                  setCustomUniversity(e.target.value);
                  setError('');
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && customUniversity.trim()) {
                    handleNext();
                  }
                }}
                placeholder="Enter your university name"
                className="bg-transparent border-none outline-none flex-1 placeholder-gray-500 font-light"
                style={{ caretColor: '#4ade80' }}
              />
            </div>
            <button
              onClick={() => {
                setShowCustomInput(false);
                setCustomUniversity('');
              }}
              className="text-sm text-gray-400 hover:text-green-400 mt-2 ml-10 transition-colors"
            >
              ← Back to search
            </button>
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
        )}

        {!showCustomInput && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            onClick={() => setShowCustomInput(true)}
            className="text-sm text-gray-400 hover:text-green-400 transition-colors inline-flex items-center gap-2"
          >
            Can't find your university? Enter it manually
          </motion.button>
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
          disabled={!university && !customUniversity.trim()}
          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold px-8 py-4 rounded-xl text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 inline-flex items-center gap-2"
        >
          Continue
          <ChevronRight className="w-5 h-5" />
        </button>
      </motion.div>
    </div>
  );
}
