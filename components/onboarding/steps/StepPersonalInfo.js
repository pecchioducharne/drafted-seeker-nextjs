'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const MAJORS = [
  'Computer Science',
  'Business Administration',
  'Engineering',
  'Psychology',
  'Biology',
  'Economics',
  'Mathematics',
  'Political Science',
  'Communications',
  'English',
  'Nursing',
  'Marketing',
  'Finance',
  'Accounting',
  'Data Science',
  'Mechanical Engineering',
  'Electrical Engineering',
  'Other'
];

const COMPANY_PREFERENCES = [
  'Fortune 500',
  'Y Combinator',
  'AI Startups',
  'Social Impact',
  'Healthcare Tech',
  'Fintech',
  'Consumer Tech'
];

const currentYear = new Date().getFullYear();
const GRADUATION_YEARS = Array.from({ length: 6 }, (_, i) => currentYear + i);
const GRADUATION_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function StepPersonalInfo({ data, onNext, onBack }) {
  const [formData, setFormData] = useState({
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    major: data.major || '',
    customMajor: data.customMajor || '',
    graduationMonth: data.graduationMonth || 'May',
    graduationYear: data.graduationYear || currentYear + 1,
    linkedInURL: data.linkedInURL || '',
    gitHubURL: data.gitHubURL || '',
    websiteURL: data.websiteURL || '',
    companyOptions: data.companyOptions || []
  });
  
  const [errors, setErrors] = useState({});
  const [showCustomMajor, setShowCustomMajor] = useState(false);
  const firstNameRef = useRef(null);

  useEffect(() => {
    firstNameRef.current?.focus();
  }, []);

  const capitalizeFirstLetter = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.major && !formData.customMajor.trim()) {
      newErrors.major = 'Please select or enter your major';
    }
    
    // GitHub required for CS majors
    if ((formData.major === 'Computer Science' || formData.customMajor.toLowerCase().includes('computer')) 
        && !formData.gitHubURL.trim()) {
      newErrors.gitHubURL = 'GitHub URL is required for Computer Science majors';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleMajorSelect = (major) => {
    if (major === 'Other') {
      setShowCustomMajor(true);
      handleChange('major', '');
    } else {
      setShowCustomMajor(false);
      handleChange('major', major);
      handleChange('customMajor', '');
    }
  };

  const toggleCompanyPreference = (company) => {
    setFormData(prev => ({
      ...prev,
      companyOptions: prev.companyOptions.includes(company)
        ? prev.companyOptions.filter(c => c !== company)
        : [...prev.companyOptions, company]
    }));
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext({
        ...formData,
        firstName: capitalizeFirstLetter(formData.firstName.trim()),
        lastName: capitalizeFirstLetter(formData.lastName.trim()),
        major: showCustomMajor ? formData.customMajor.trim() : formData.major
      });
    }
  };

  return (
    <div className="text-center max-w-4xl mx-auto">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl md:text-5xl font-bold text-white mb-4"
      >
        Tell us about yourself
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-gray-400 text-lg mb-10"
      >
        This helps us match you with the perfect opportunities
      </motion.p>

      <div className="space-y-6 text-left">
        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label className="block text-gray-400 text-sm mb-2 ml-10">First Name</label>
            <div className="flex items-center text-xl text-white">
              <span className="text-green-400 mr-4 font-mono flex-shrink-0">{'>'}</span>
              <input
                ref={firstNameRef}
                type="text"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', capitalizeFirstLetter(e.target.value))}
                placeholder="John"
                className="bg-transparent border-none outline-none flex-1 placeholder-gray-500 font-light"
                style={{ caretColor: '#4ade80' }}
              />
            </div>
            {errors.firstName && (
              <p className="text-red-400 text-sm mt-1 ml-10">{errors.firstName}</p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
          >
            <label className="block text-gray-400 text-sm mb-2 ml-10">Last Name</label>
            <div className="flex items-center text-xl text-white">
              <span className="text-green-400 mr-4 font-mono flex-shrink-0">{'>'}</span>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', capitalizeFirstLetter(e.target.value))}
                placeholder="Doe"
                className="bg-transparent border-none outline-none flex-1 placeholder-gray-500 font-light"
                style={{ caretColor: '#4ade80' }}
              />
            </div>
            {errors.lastName && (
              <p className="text-red-400 text-sm mt-1 ml-10">{errors.lastName}</p>
            )}
          </motion.div>
        </div>

        {/* Major Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <label className="block text-gray-400 text-sm mb-3">Major</label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {MAJORS.map((major) => (
              <button
                key={major}
                onClick={() => handleMajorSelect(major)}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  formData.major === major
                    ? 'bg-green-500 text-white shadow-[0_0_20px_rgba(74,222,128,0.4)]'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10'
                }`}
              >
                {major}
              </button>
            ))}
          </div>
          {showCustomMajor && (
            <div className="flex items-center text-xl text-white mt-3">
              <span className="text-green-400 mr-4 font-mono flex-shrink-0">{'>'}</span>
              <input
                type="text"
                value={formData.customMajor}
                onChange={(e) => handleChange('customMajor', e.target.value)}
                placeholder="Enter your major"
                className="bg-transparent border-none outline-none flex-1 placeholder-gray-500 font-light"
                style={{ caretColor: '#4ade80' }}
                autoFocus
              />
            </div>
          )}
          {errors.major && (
            <p className="text-red-400 text-sm mt-1">{errors.major}</p>
          )}
        </motion.div>

        {/* Graduation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
          >
            <label className="block text-gray-400 text-sm mb-2">Graduation Month</label>
            <select
              value={formData.graduationMonth}
              onChange={(e) => handleChange('graduationMonth', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-green-400 focus:ring-1 focus:ring-green-400 outline-none"
            >
              {GRADUATION_MONTHS.map((month) => (
                <option key={month} value={month} className="bg-slate-800">{month}</option>
              ))}
            </select>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <label className="block text-gray-400 text-sm mb-2">Graduation Year</label>
            <select
              value={formData.graduationYear}
              onChange={(e) => handleChange('graduationYear', parseInt(e.target.value))}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-green-400 focus:ring-1 focus:ring-green-400 outline-none"
            >
              {GRADUATION_YEARS.map((year) => (
                <option key={year} value={year} className="bg-slate-800">{year}</option>
              ))}
            </select>
          </motion.div>
        </div>

        {/* Social Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="space-y-4"
        >
          <label className="block text-gray-400 text-sm">Social Links (Optional)</label>
          
          <div className="flex items-center text-lg text-white">
            <span className="text-green-400 mr-4 font-mono flex-shrink-0">{'>'}</span>
            <input
              type="url"
              value={formData.linkedInURL}
              onChange={(e) => handleChange('linkedInURL', e.target.value)}
              placeholder="LinkedIn URL"
              className="bg-transparent border-none outline-none flex-1 placeholder-gray-500 font-light"
              style={{ caretColor: '#4ade80' }}
            />
          </div>

          <div className="flex items-center text-lg text-white">
            <span className="text-green-400 mr-4 font-mono flex-shrink-0">{'>'}</span>
            <input
              type="url"
              value={formData.gitHubURL}
              onChange={(e) => handleChange('gitHubURL', e.target.value)}
              placeholder={formData.major === 'Computer Science' ? 'GitHub URL (Required for CS)' : 'GitHub URL'}
              className="bg-transparent border-none outline-none flex-1 placeholder-gray-500 font-light"
              style={{ caretColor: '#4ade80' }}
            />
          </div>
          {errors.gitHubURL && (
            <p className="text-red-400 text-sm ml-10">{errors.gitHubURL}</p>
          )}

          <div className="flex items-center text-lg text-white">
            <span className="text-green-400 mr-4 font-mono flex-shrink-0">{'>'}</span>
            <input
              type="url"
              value={formData.websiteURL}
              onChange={(e) => handleChange('websiteURL', e.target.value)}
              placeholder="Personal Website"
              className="bg-transparent border-none outline-none flex-1 placeholder-gray-500 font-light"
              style={{ caretColor: '#4ade80' }}
            />
          </div>
        </motion.div>

        {/* Company Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <label className="block text-gray-400 text-sm mb-3">Company Preferences (Optional)</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {COMPANY_PREFERENCES.map((company) => (
              <button
                key={company}
                onClick={() => toggleCompanyPreference(company)}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  formData.companyOptions.includes(company)
                    ? 'bg-green-500 text-white shadow-[0_0_15px_rgba(74,222,128,0.3)]'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10'
                }`}
              >
                {company}
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
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
          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all duration-200 inline-flex items-center gap-2"
        >
          Continue
          <ChevronRight className="w-5 h-5" />
        </button>
      </motion.div>
    </div>
  );
}
