'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import LoadingScreen from '../../components/shared/LoadingScreen';
import SideMenu from '../../components/dashboard/SideMenu';
import InfoBlob from '../../components/dashboard/InfoBlob';
import VideoBlob from '../../components/dashboard/VideoBlob';
import CommunityStories from '../../components/dashboard/CommunityStories';
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
        // Delete Firestore document
        await deleteDoc(doc(db, 'drafted-accounts', user.email.toLowerCase()));
        
        // Delete Firebase Auth user
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
      
      <div className="relative z-10 flex">
        {/* Side Menu */}
        <SideMenu
          isProfileLaunchable={isProfileLaunchable}
          onShowHowItWorks={() => setShowHowItWorks(true)}
          onShareOnLinkedIn={() => {}}
          hasFirstVideo={hasVideo}
          hasSharedOnLinkedIn={hasSharedOnLinkedIn}
          onDeleteAccount={() => setShowManageAccount(true)}
        />

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {/* Left Column */}
            <div className="space-y-4 sm:space-y-6">
              <InfoBlob />
            </div>

            {/* Right Column */}
            <div className="space-y-4 sm:space-y-6">
              <VideoBlob major={profileData?.major} />
              <CommunityStories />
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
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-drafted-green/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-drafted-green font-bold">1</span>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Record Your Videos</h3>
              <p className="text-gray-300">
                Answer 3 simple questions in short video format. Show recruiters who you are beyond your resume.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-10 h-10 bg-drafted-green/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-drafted-green font-bold">2</span>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Share on LinkedIn</h3>
              <p className="text-gray-300">
                Share your Drafted profile on LinkedIn to unlock access to 3,000+ companies.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-10 h-10 bg-drafted-green/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-drafted-green font-bold">3</span>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Connect with Recruiters</h3>
              <p className="text-gray-300">
                Browse companies, reach out to recruiters, and land your dream job or internship.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowHowItWorks(false)}
          className="mt-8 w-full drafted-btn drafted-btn-primary"
        >
          Got it!
        </button>
      </ReactModal>

      {/* Manage Account Modal */}
      <ReactModal
        isOpen={showManageAccount}
        onRequestClose={() => setShowManageAccount(false)}
        className="max-w-md mx-auto mt-20 bg-gray-900/95 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-xl"
        overlayClassName="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[99999999] overflow-y-auto p-5"
      >
        <h2 className="text-2xl font-bold text-white mb-4">Manage Account</h2>
        <p className="text-gray-300 mb-6">
          Account settings and preferences
        </p>
        
        <div className="space-y-3">
          <button
            onClick={() => {
              setShowManageAccount(false);
              setShowDeleteConfirmation(true);
            }}
            className="w-full px-4 py-3 bg-red-500/10 text-red-400 rounded-lg border border-red-500/20 hover:bg-red-500/20 transition-all"
          >
            Delete Account
          </button>
          
          <button
            onClick={() => setShowManageAccount(false)}
            className="w-full drafted-btn drafted-btn-glass"
          >
            Close
          </button>
        </div>
      </ReactModal>

      {/* Delete Confirmation Modal */}
      <ReactModal
        isOpen={showDeleteConfirmation}
        onRequestClose={() => setShowDeleteConfirmation(false)}
        className="max-w-md mx-auto mt-20 bg-gray-900/95 backdrop-blur-lg border border-red-500/20 rounded-2xl p-6 shadow-xl"
        overlayClassName="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[99999999] overflow-y-auto p-5"
      >
        <h2 className="text-2xl font-bold text-red-400 mb-4">⚠️ Delete Account?</h2>
        <p className="text-gray-300 mb-6">
          This will permanently delete your account, videos, and all data. This action cannot be undone.
        </p>
        
        <div className="flex gap-3">
          <button
            onClick={() => setShowDeleteConfirmation(false)}
            disabled={isDeleting}
            className="flex-1 drafted-btn drafted-btn-glass"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteAccount}
            disabled={isDeleting}
            className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all font-semibold"
          >
            {isDeleting ? 'Deleting...' : 'Delete Forever'}
          </button>
        </div>
      </ReactModal>
    </div>
  );
}
