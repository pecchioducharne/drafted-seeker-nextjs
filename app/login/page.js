'use client';

import React, { useState, useEffect } from "react";
import { auth } from "../../lib/firebase";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import Lottie from "react-lottie";
import astronautAnimation from "../../public/astronaut.json";
import { useUploadingContext } from "../../contexts/UploadingContext";
import LoadingScreen from "../../components/shared/LoadingScreen";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

// Helper function to convert Firebase error codes to user-friendly messages
const getFirebaseErrorMessage = (errorCode) => {
  switch (errorCode) {
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password. Please try again.';
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    default:
      return 'An error occurred. Please try again.';
  }
};

function DraftedLogo() {
  return (
    <div className="mt-0 ml-5">
      <h1 className="text-4xl font-bold text-white" style={{ fontFamily: 'var(--font-poppins), Poppins, sans-serif', fontWeight: 700 }}>
        drafted<span className="text-drafted-green">.</span>
      </h1>
    </div>
  );
}

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { updateUserCredentials } = useUploadingContext();

  const welcomeBack = {
    loop: false, 
    autoplay: true,
    animationData: astronautAnimation,
  };

  // Pre-fill email from URL parameter (safe - no sensitive data)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get("email");

    if (emailParam) {
      setEmail(emailParam);
      // Clear the URL params after reading them
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const navigateToCandidateSignup = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      router.push("/");
    }, 700);
  };

  const navigateToRecruiterSignup = () => {
    window.open("https://recruiter.joindrafted.com/", "_blank");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      updateUserCredentials(email);
      router.push("/dashboard");
    } catch (error) {
      console.error("Error signing in:", error);
      toast.error(getFirebaseErrorMessage(error.code));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      toast.error("Please enter your email address to reset your password.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset email sent! Please check your inbox.");
    } catch (error) {
      console.error("Error sending password reset email:", error);
      toast.error(getFirebaseErrorMessage(error.code));
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Signing you in..." />;
  }

  return (
    <div className="drafted-background relative min-h-screen">
      <div className="drafted-bg-animated"></div>
      
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8">
            <DraftedLogo />
          </div>
          
          {/* Form Card */}
          <form onSubmit={handleSubmit} className="drafted-card">
            {/* Animation */}
            <div className="flex justify-center mb-6" style={{ filter: 'brightness(0) invert(1)' }}>
              <Lottie options={welcomeBack} height={140} width={140} />
            </div>
            
            {/* Heading */}
            <h2 className="text-3xl font-bold text-white text-center mb-2">
              Welcome back.
            </h2>
            <p className="text-gray-400 text-center mb-8">
              Let's find your next job
            </p>
            
            {/* Email Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-drafted-green/50 focus:border-drafted-green transition-all"
                required
              />
            </div>
            
            {/* Password Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-drafted-green/50 focus:border-drafted-green transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  tabIndex={0}
                >
                  {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
            </div>
            
            {/* Buttons */}
            <div className="space-y-3 mb-6">
              <button
                type="submit"
                className="w-full drafted-btn drafted-btn-primary drafted-btn-lg font-bold"
              >
                Login
              </button>
              
              <button
                type="button"
                onClick={handlePasswordReset}
                className="w-full text-sm text-drafted-green hover:text-drafted-emerald transition-colors font-medium"
              >
                Forgot Password?
              </button>
            </div>
            
            {/* Footer Links */}
            <div className="space-y-3 pt-6 border-t border-white/10">
              <p className="text-gray-400 text-sm text-center">
                Don't have an account?
              </p>
              <button 
                type="button"
                onClick={navigateToCandidateSignup} 
                className="w-full drafted-btn drafted-btn-glass text-sm py-3"
              >
                Create Candidate Account
              </button>
              <p className="text-gray-400 text-sm text-center mt-4">
                Looking to hire?
              </p>
              <button 
                type="button"
                onClick={navigateToRecruiterSignup} 
                className="w-full drafted-btn drafted-btn-glass text-sm py-3"
              >
                Create Recruiter Account
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Page Transition Overlay */}
      {isTransitioning && (
        <div className="fixed inset-0 bg-drafted-green z-50 animate-[slideIn_0.7s_ease-in-out]"></div>
      )}
    </div>
  );
};

export default Login;
