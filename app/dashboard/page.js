'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import LoadingScreen from '../../components/shared/LoadingScreen';
import SideMenu from '../../components/dashboard/SideMenu';
import VideoHero from '../../components/dashboard/VideoHero';
import ProfileSnapshot from '../../components/dashboard/ProfileSnapshot';
import ReactModal from 'react-modal';
import { deleteUser } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const router = useRouter();
  const { user, profileData, loading, hasVideo, hasSharedOnLinkedIn } = useAuth();
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showManageAccount, setShowManageAccount] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const user = auth.currentUser;
      if (user) {
        await deleteDoc(doc(db, 'drafted-accounts', user.email.toLowerCase()));
        await deleteUser(user);
        toast.success('Account deleted successfully');
        router.push('/');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account. Please try again or contact support.');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirmation(false);
    }
  };

  if (loading || !user) {
    return <LoadingScreen message="Loading your dashboard..." />;
  }

  const isProfileLaunchable = hasVideo && hasSharedOnLinkedIn;

  return (
    <div className="drafted-background min-h-screen">
      <div className="drafted-bg-animated"></div>
      
      <div className="relative z-10 flex flex-col lg:flex-row min-h-screen">
        {/* Side Menu - Hidden on mobile, sidebar on desktop */}
        <div className="hidden lg:block lg:w-64 lg:flex-shrink-0">
          <SideMenu
            isProfileLaunchable={isProfileLaunchable}
            onShowHowItWorks={() => setShowHowItWorks(true)}
            onShareOnLinkedIn={() => {}}
            hasFirstVideo={hasVideo}
            hasSharedOnLinkedIn={hasSharedOnLinkedIn}
            onDeleteAccount={() => setShowManageAccount(true)}
          />
        </div>

        {/* Main Content - Full width, mobile-first */}
        <main className="flex-1 w-full">
          {/* Mobile Menu Bar */}
          <div className="lg:hidden sticky top-0 z-20 bg-gray-900/95 backdrop-blur-lg border-b border-white/10 px-4 py-3">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--font-poppins), Poppins, sans-serif', fontWeight: 700 }}>
                drafted<span className="text-drafted-green">.</span>
              </h1>
              <button 
                onClick={() => router.push('/recruiter')}
                className="px-4 py-2 bg-drafted-green/10 hover:bg-drafted-green/20 border border-drafted-green/30 rounded-lg text-drafted-green text-sm font-medium transition-all"
              >
                Find Jobs
              </button>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            {/* Video Hero - Full width, primary focus */}
            <VideoHero major={profileData?.major} />

            {/* Profile Snapshot - Compact, scannable */}
            <div className="mt-6 lg:mt-8">
              <ProfileSnapshot />
            </div>

            {/* Optional Deep Dive - Collapsible sections */}
            <div className="mt-8 space-y-4">
              <details className="group">
                <summary className="cursor-pointer liquid-glass rounded-xl p-4 flex items-center justify-between hover:bg-white/10 transition-all">
                  <span className="text-lg font-semibold text-white">Experience & Projects</span>
                  <svg className="w-5 h-5 text-gray-400 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="mt-4 liquid-glass rounded-xl p-6">
                  <p className="text-gray-400 text-sm">Add your experience, projects, and achievements here.</p>
                </div>
              </details>
            </div>
          </div>

          {/* Mobile Bottom Navigation */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-gray-900/95 backdrop-blur-lg border-t border-white/10 px-4 py-3 safe-bottom">
            <div className="flex items-center justify-around max-w-md mx-auto">
              <button onClick={() => router.push('/dashboard')} className="flex flex-col items-center gap-1 text-drafted-green">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="text-xs font-medium">Home</span>
              </button>
              <button onClick={() => router.push('/recruiter')} className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="text-xs font-medium">Jobs</span>
              </button>
              <button onClick={() => setShowHowItWorks(true)} className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs font-medium">Help</span>
              </button>
              <button onClick={() => setShowManageAccount(true)} className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-xs font-medium">Settings</span>
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* How It Works Modal */}
      <ReactModal
        isOpen={showHowItWorks}
        onRequestClose={() => setShowHowItWorks(false)}
        className="max-w-2xl mx-auto mt-10 bg-gray-900/95 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-xl max-h-[90vh] overflow-y-auto"
        overlayClassName="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[99999999] overflow-y-auto p-5"
      >
        <h2 className="text-3xl font-bold text-white mb-6">How Drafted Works</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-drafted-green mb-2">1. Create Your Video Resume</h3>
            <p className="text-gray-300">Record three short videos showcasing your skills, experiences, and personality. Stand out from traditional resumes.</p>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-drafted-green mb-2">2. Browse Companies</h3>
            <p className="text-gray-300">Explore thousands of companies hiring for full-time positions and internships. Filter by industry, location, and more.</p>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-drafted-green mb-2">3. Send Personalized Nudges</h3>
            <p className="text-gray-300">Reach out directly to recruiters with personalized emails and your video profile. Get noticed faster.</p>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-drafted-green mb-2">4. Land Your Dream Job</h3>
            <p className="text-gray-300">Connect with recruiters who value your unique skills and personality. Get hired based on who you are, not just your resume.</p>
          </div>
        </div>

        <button
          onClick={() => setShowHowItWorks(false)}
          className="mt-8 w-full drafted-btn drafted-btn-primary py-3"
        >
          Got it!
        </button>
      </ReactModal>

      {/* Manage Account Modal */}
      <ReactModal
        isOpen={showManageAccount}
        onRequestClose={() => setShowManageAccount(false)}
        className="max-w-md mx-auto mt-10 bg-gray-900/95 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-xl"
        overlayClassName="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[99999999] p-5"
      >
        <h2 className="text-2xl font-bold text-white mb-6">Manage Account</h2>
        
        <div className="space-y-4">
          <button
            onClick={() => {
              setShowManageAccount(false);
              setShowDeleteConfirmation(true);
            }}
            className="w-full px-4 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 font-medium transition-all"
          >
            Delete Account
          </button>
          
          <button
            onClick={() => setShowManageAccount(false)}
            className="w-full drafted-btn drafted-btn-glass py-3"
          >
            Cancel
          </button>
        </div>
      </ReactModal>

      {/* Delete Confirmation Modal */}
      <ReactModal
        isOpen={showDeleteConfirmation}
        onRequestClose={() => !isDeleting && setShowDeleteConfirmation(false)}
        className="max-w-md mx-auto mt-10 bg-gray-900/95 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-xl"
        overlayClassName="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[99999999] p-5"
      >
        <h2 className="text-2xl font-bold text-white mb-4">Delete Account?</h2>
        <p className="text-gray-300 mb-6">This action cannot be undone. All your data, videos, and profile information will be permanently deleted.</p>
        
        <div className="space-y-3">
          <button
            onClick={handleDeleteAccount}
            disabled={isDeleting}
            className="w-full px-4 py-3 bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 rounded-lg text-white font-medium transition-all flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Deleting...
              </>
            ) : 'Yes, Delete My Account'}
          </button>
          
          <button
            onClick={() => setShowDeleteConfirmation(false)}
            disabled={isDeleting}
            className="w-full drafted-btn drafted-btn-glass py-3"
          >
            Cancel
          </button>
        </div>
      </ReactModal>
    </div>
  );
}
