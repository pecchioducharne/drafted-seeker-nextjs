'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { usePostHog } from '@/contexts/PostHogContext';
import LoadingScreen from '@/components/shared/LoadingScreen';
import StepEmail from '@/components/onboarding/steps/StepEmail';
import StepUniversity from '@/components/onboarding/steps/StepUniversity';
import StepPersonalInfo from '@/components/onboarding/steps/StepPersonalInfo';
import StepPassword from '@/components/onboarding/steps/StepPassword';
import StepReferral from '@/components/onboarding/steps/StepReferral';
import StepSuccess from '@/components/onboarding/steps/StepSuccess';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { captureEvent } = usePostHog();
  const [currentStep, setCurrentStep] = useState(0);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  
  const [data, setData] = useState({
    email: '',
    university: null,
    customUniversity: '',
    firstName: '',
    lastName: '',
    major: '',
    customMajor: '',
    graduationMonth: '',
    graduationYear: new Date().getFullYear() + 1,
    linkedInURL: '',
    gitHubURL: '',
    websiteURL: '',
    companyOptions: [],
    password: '',
    confirmPassword: '',
    referralSource: '',
    referralDetail: '',
    resumeFile: null,
    experience: []
  });

  const steps = [
    { component: StepEmail, field: 'email', title: 'Email' },
    { component: StepUniversity, field: 'university', title: 'University' },
    { component: StepPersonalInfo, field: 'personalInfo', title: 'Personal Info' },
    { component: StepPassword, field: 'password', title: 'Password' },
    { component: StepReferral, field: 'referralSource', title: 'How did you hear about us?' },
    { component: StepSuccess, field: 'success', title: 'Success' },
  ];

  const CurrentStepComponent = steps[currentStep].component;

  const handleNext = (stepData) => {
    const newData = { ...data, ...stepData };
    setData(newData);
    
    captureEvent('onboarding_step_completed', { 
      step: currentStep + 1,
      field: steps[currentStep].field 
    });

    // Move to next step
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkipToStep = (stepIndex) => {
    if (stepIndex < currentStep) {
      setCurrentStep(stepIndex);
    }
  };

  // Redirect if already logged in
  if (authLoading) {
    return <LoadingScreen />;
  }

  if (user) {
    router.push('/dashboard');
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-teal-500/10 to-green-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 z-10">
        <motion.div
          className="h-full bg-gradient-to-r from-green-400 to-emerald-400"
          initial={{ width: '0%' }}
          animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-3xl mx-auto"
          >
            <CurrentStepComponent
              data={data}
              onNext={handleNext}
              onBack={handleBack}
              isCreatingAccount={isCreatingAccount}
              setIsCreatingAccount={setIsCreatingAccount}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Step indicator dots */}
      <div className="hidden md:fixed md:flex bottom-8 left-1/2 transform -translate-x-1/2 gap-2 z-30">
        {steps.map((step, index) => (
          <motion.button
            key={index}
            type="button"
            onClick={() => handleSkipToStep(index)}
            className={`transition-all duration-300 relative ${
              index === currentStep
                ? 'w-8 h-2 bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.6)]'
                : index < currentStep
                ? 'w-2 h-2 bg-green-400/50 hover:bg-green-400/70 cursor-pointer'
                : 'w-2 h-2 bg-white/20 hover:bg-white/40 cursor-not-allowed'
            } rounded-full`}
            whileHover={{ scale: index <= currentStep ? 1.2 : 1 }}
            whileTap={{ scale: index < currentStep ? 0.9 : 1 }}
            aria-label={`${index < currentStep ? 'Go to' : ''} step ${index + 1}: ${step.title}`}
            disabled={index > currentStep}
          />
        ))}
      </div>
    </div>
  );
}
