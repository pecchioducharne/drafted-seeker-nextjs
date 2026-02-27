'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { FaLock, FaInfoCircle, FaSignOutAlt, FaHome, FaCopy, FaCheck } from 'react-icons/fa';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { getDoc, setDoc, doc } from 'firebase/firestore';
import ReactModal from 'react-modal';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import linkedinWhite from '../../public/linkedin-white.png';
import Image from 'next/image';
import toast from 'react-hot-toast';

// Extract LinkedIn activity ID from URL
function extractLinkedInActivityId(url) {
  const pattern = new RegExp(
    '^https?://(?:www\\.)?linkedin\\.com/' +
    '(?:feed/update/urn:li:activity:|posts/[^/]*activity-)' +
    '(\\d{9,20})' +
    '(?:-[\\w-]+)?' +
    '(?:[/?].*)?$',
    'i'
  );
  const match = pattern.exec(url);
  return match ? match[1] : null;
}

const SideMenu = ({
  isProfileLaunchable,
  onShowHowItWorks,
  onShareOnLinkedIn,
  hasFirstVideo,
  hasSharedOnLinkedIn,
  onDeleteAccount,
  onLinkedInVerified
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [andrewCopied, setAndrewCopied] = useState(false);
  const [rodrigoCopied, setRodrigoCopied] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [isUS, setIsUS] = useState(false);
  const [showNudgeModal, setShowNudgeModal] = useState(false);
  const [showLinkedInVerificationModal, setShowLinkedInVerificationModal] = useState(false);
  const [linkedInPostUrl, setLinkedInPostUrl] = useState('');
  const [isValidatingUrl, setIsValidatingUrl] = useState(false);
  const [urlValidationError, setUrlValidationError] = useState('');
  const [urlValidationSuccess, setUrlValidationSuccess] = useState(false);
  const [profileUrlCopied, setProfileUrlCopied] = useState(false);

  // Check if user is in the US
  useEffect(() => {
    const checkUserCountry = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        const countryCode = data.country_code || data.countryCode;
        setIsUS(countryCode === 'US');
      } catch (error) {
        console.error("Error detecting user's country:", error);
        setIsUS(true);
      }
    };
    checkUserCountry();
  }, []);

  const handleEventsClick = (e) => {
    if (!isProfileLaunchable) {
      e.preventDefault();
      if (!hasFirstVideo) {
        setPopupMessage("Record your first 30-second video to start unlocking events!");
      } else if (!hasSharedOnLinkedIn) {
        setPopupMessage("Share your profile on LinkedIn to complete unlock and access events!");
      }
      setShowPopup(true);
    }
  };

  const handleHowItWorksClick = (e) => {
    e.preventDefault();
    if (onShowHowItWorks) {
      onShowHowItWorks();
    }
  };

  const handleSignOut = async (e) => {
    e.preventDefault();
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSupportClick = (e) => {
    e.preventDefault();
    setShowSupportModal(true);
  };

  const handleNudgeClick = (e) => {
    e.preventDefault();
    
    if (hasFirstVideo && hasSharedOnLinkedIn) {
      router.push('/recruiter');
      return;
    }
    
    setShowNudgeModal(true);
  };

  const openLinkedInShare = () => {
    const email = auth.currentUser?.email?.toLowerCase();
    if (!email) return;
    const profileLink = `https://recruiter.joindrafted.com/profile/${email}`;
    const message =
      `Hi everyone! 👋\n\n` +
      `I'm excited to share my Drafted profile, a platform where I created a video resume to showcase my skills, experiences, and personality in a whole new way.\n\n` +
      `🎥 One engaging video highlighting my journey\n` +
      `💼 Links to my LinkedIn, GitHub, and more\n\n` +
      `Check it out here: ${profileLink}\n\n` +
      `Drafted is changing how we connect with recruiters by making hiring more personal. Let's connect and redefine how we present ourselves professionally!\n\n` +
      `#VideoResume #Drafted`;
    const linkedinShareUrl =
      `https://www.linkedin.com/shareArticle?mini=true` +
      `&url=${encodeURIComponent(profileLink)}` +
      `&title=${encodeURIComponent('My Drafted Video Profile')}` +
      `&summary=${encodeURIComponent(message)}` +
      `&source=Drafted`;
    window.open(linkedinShareUrl, '_blank');
  };

  const handleLinkedInVerification = async () => {
    if (!linkedInPostUrl.trim()) {
      setUrlValidationError('Please enter a LinkedIn post URL');
      return;
    }

    setIsValidatingUrl(true);
    setUrlValidationError('');
    setUrlValidationSuccess(false);

    const activityId = extractLinkedInActivityId(linkedInPostUrl);
    
    if (!activityId) {
      setUrlValidationError('Invalid LinkedIn post URL. Please paste the full URL from your post.');
      setIsValidatingUrl(false);
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user?.email) {
        throw new Error('No user logged in');
      }

      const userDocRef = doc(db, 'drafted-accounts', user.email.toLowerCase());
      await setDoc(userDocRef, {
        sharedOnLinkedIn: true,
        linkedInPostUrl: linkedInPostUrl,
        linkedInActivityId: activityId,
        linkedInShareDate: new Date().toISOString()
      }, { merge: true });

      setUrlValidationSuccess(true);
      toast.success('LinkedIn share verified!');
      onLinkedInVerified?.();

      setTimeout(() => {
        setShowLinkedInVerificationModal(false);
        setShowNudgeModal(false);
        setLinkedInPostUrl('');
      }, 1500);
    } catch (error) {
      console.error('Error verifying LinkedIn share:', error);
      setUrlValidationError('Failed to verify. Please try again.');
    } finally {
      setIsValidatingUrl(false);
    }
  };

  const copyToClipboard = (text, setCopied) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isActive = (path) => pathname === path;

  return (
    <>
      <div className="w-64 bg-white/5 backdrop-blur-lg border-r border-white/10 min-h-screen p-6 flex flex-col">
        {/* Navigation Links */}
        <nav className="space-y-2 flex-1">
          <button
            onClick={() => router.push('/dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              isActive('/dashboard')
                ? 'bg-drafted-green/10 text-drafted-green border-l-4 border-drafted-green'
                : 'text-gray-300 hover:bg-white/10'
            }`}
          >
            <FaHome />
            <span>Home</span>
          </button>

          <button
            onClick={handleNudgeClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              isActive('/recruiter')
                ? 'bg-drafted-green/10 text-drafted-green border-l-4 border-drafted-green'
                : 'text-gray-300 hover:bg-white/10'
            }`}
          >
            {(hasFirstVideo && hasSharedOnLinkedIn) ? (
              <CheckCircleIcon className="text-drafted-green" sx={{ fontSize: 20 }} />
            ) : (
              <FaLock />
            )}
            <span>Find jobs</span>
          </button>

          <button
            onClick={handleHowItWorksClick}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-white/10 transition-all"
          >
            <FaInfoCircle />
            <span>How it works</span>
          </button>

          <button
            onClick={handleSupportClick}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-white/10 transition-all"
          >
            <FaInfoCircle />
            <span>Support</span>
          </button>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-white/10 transition-all"
          >
            <FaSignOutAlt />
            <span>Sign out</span>
          </button>
        </nav>

        {/* LinkedIn Share Button */}
        {hasFirstVideo && !hasSharedOnLinkedIn && (
          <div className="mt-6 p-4 bg-drafted-green/10 border border-drafted-green/20 rounded-lg">
            <p className="text-sm text-gray-300 mb-3">
              Share your profile on LinkedIn to unlock more features!
            </p>
            <button
              onClick={() => setShowLinkedInVerificationModal(true)}
              className="w-full drafted-btn drafted-btn-primary text-sm py-2 flex items-center justify-center gap-2"
            >
              <Image src={linkedinWhite} alt="LinkedIn" width={16} height={16} />
              <span>Share on LinkedIn</span>
            </button>
          </div>
        )}

        {/* Unlock Progress */}
        <div className="mt-4 p-4 bg-white/5 rounded-lg">
          <p className="text-xs text-gray-400 mb-2">Unlock Progress</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {hasFirstVideo ? (
                <CheckCircleIcon className="text-drafted-green" sx={{ fontSize: 16 }} />
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-gray-600" />
              )}
              <span className="text-xs text-gray-300">Record video</span>
            </div>
            <div className="flex items-center gap-2">
              {hasSharedOnLinkedIn ? (
                <CheckCircleIcon className="text-drafted-green" sx={{ fontSize: 16 }} />
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-gray-600" />
              )}
              <span className="text-xs text-gray-300">Share on LinkedIn</span>
            </div>
          </div>
        </div>
      </div>

      {/* Support Modal */}
      <ReactModal
        isOpen={showSupportModal}
        onRequestClose={() => setShowSupportModal(false)}
        className="max-w-md mx-auto mt-20 bg-gray-900/95 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-xl"
        overlayClassName="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 overflow-y-auto"
      >
        <h2 className="text-2xl font-bold text-white mb-4">Contact Support</h2>
        <p className="text-gray-300 mb-6">
          Need help? Reach out to our support team:
        </p>
        <div className="space-y-4">
          <div className="p-4 bg-white/5 rounded-lg">
            <p className="text-sm text-gray-400 mb-2">Support Team</p>
            <div className="flex items-center gap-2">
              <p className="text-white font-mono text-sm">support@gotdrafted.com</p>
              <button
                onClick={() => copyToClipboard('support@gotdrafted.com', setAndrewCopied)}
                className="text-drafted-green hover:text-drafted-emerald transition-colors"
              >
                {andrewCopied ? <FaCheck /> : <FaCopy />}
              </button>
            </div>
          </div>
          <a 
            href="mailto:support@gotdrafted.com" 
            className="block w-full drafted-btn drafted-btn-primary text-center py-3"
          >
            Send Email
          </a>
        </div>
        <button
          onClick={() => setShowSupportModal(false)}
          className="mt-4 w-full drafted-btn drafted-btn-glass"
        >
          Close
        </button>
      </ReactModal>

      {/* LinkedIn Verification Modal */}
      <ReactModal
        isOpen={showLinkedInVerificationModal}
        onRequestClose={() => setShowLinkedInVerificationModal(false)}
        className="max-w-md mx-auto mt-20 bg-gray-900/95 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-xl"
        overlayClassName="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 overflow-y-auto"
      >
        <h2 className="text-2xl font-bold text-white mb-4">Share on LinkedIn</h2>
        <p className="text-gray-300 mb-4">
          Click below to share your profile, then paste the post URL here to verify.
        </p>
        <button
          onClick={openLinkedInShare}
          className="w-full drafted-btn drafted-btn-primary text-sm py-2.5 flex items-center justify-center gap-2 mb-3"
        >
          <Image src={linkedinWhite} alt="LinkedIn" width={16} height={16} />
          <span>Open LinkedIn Share</span>
        </button>
        <button
          onClick={() => {
            const email = auth.currentUser?.email?.toLowerCase();
            const profileUrl = `https://recruiter.joindrafted.com/profile/${email}`;
            navigator.clipboard.writeText(profileUrl);
            setProfileUrlCopied(true);
            setTimeout(() => setProfileUrlCopied(false), 2000);
          }}
          className="w-full text-sm py-2 flex items-center justify-center gap-2 text-gray-400 hover:text-white border border-white/10 hover:border-white/20 rounded-lg transition-all mb-4"
        >
          {profileUrlCopied ? (
            <>
              <FaCheck className="text-drafted-green" />
              <span className="text-drafted-green">Copied!</span>
            </>
          ) : (
            <>
              <FaCopy />
              <span>Copy Profile URL</span>
            </>
          )}
        </button>
        <input
          type="text"
          value={linkedInPostUrl}
          onChange={(e) => setLinkedInPostUrl(e.target.value)}
          placeholder="Paste LinkedIn post URL..."
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-drafted-green/50 mb-4"
        />
        {urlValidationError && (
          <p className="text-red-400 text-sm mb-4">{urlValidationError}</p>
        )}
        {urlValidationSuccess && (
          <p className="text-drafted-green text-sm mb-4">✓ Verified successfully!</p>
        )}
        <div className="flex gap-3">
          <button
            onClick={() => setShowLinkedInVerificationModal(false)}
            className="flex-1 drafted-btn drafted-btn-glass"
          >
            Cancel
          </button>
          <button
            onClick={handleLinkedInVerification}
            disabled={isValidatingUrl}
            className="flex-1 drafted-btn drafted-btn-primary"
          >
            {isValidatingUrl ? 'Verifying...' : 'Verify'}
          </button>
        </div>
      </ReactModal>

      {/* Nudge Unlock Modal */}
      <ReactModal
        isOpen={showNudgeModal}
        onRequestClose={() => setShowNudgeModal(false)}
        className="max-w-md mx-auto mt-20 bg-gray-900/95 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-xl"
        overlayClassName="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 overflow-y-auto"
      >
        <h2 className="text-2xl font-bold text-white mb-4">Unlock Job Search</h2>
        <p className="text-gray-300 mb-6">
          Complete these steps to unlock access to 3,000+ companies:
        </p>
        <div className="space-y-3 mb-6">
          <div className={`flex items-center gap-3 p-3 rounded-lg ${hasFirstVideo ? 'bg-drafted-green/10' : 'bg-white/5'}`}>
            {hasFirstVideo ? (
              <CheckCircleIcon className="text-drafted-green" />
            ) : (
              <div className="w-6 h-6 rounded-full border-2 border-gray-600" />
            )}
            <span className="text-white">Record your 30-second video</span>
          </div>
          <div className={`flex items-center gap-3 p-3 rounded-lg ${hasSharedOnLinkedIn ? 'bg-drafted-green/10' : 'bg-white/5'}`}>
            {hasSharedOnLinkedIn ? (
              <CheckCircleIcon className="text-drafted-green" />
            ) : (
              <div className="w-6 h-6 rounded-full border-2 border-gray-600" />
            )}
            <span className="text-white">Share your profile on LinkedIn</span>
          </div>
        </div>
        {!hasFirstVideo ? (
          <button
            onClick={() => {
              setShowNudgeModal(false);
              router.push('/video-recorder1');
            }}
            className="w-full drafted-btn drafted-btn-primary"
          >
            Record Video
          </button>
        ) : !hasSharedOnLinkedIn ? (
          <button
            onClick={() => {
              setShowNudgeModal(false);
              setShowLinkedInVerificationModal(true);
            }}
            className="w-full drafted-btn drafted-btn-primary flex items-center justify-center gap-2"
          >
            <Image src={linkedinWhite} alt="LinkedIn" width={16} height={16} />
            Share on LinkedIn
          </button>
        ) : (
          <button
            onClick={() => setShowNudgeModal(false)}
            className="w-full drafted-btn drafted-btn-primary"
          >
            Got it!
          </button>
        )}
      </ReactModal>

      {/* Generic Popup */}
      <ReactModal
        isOpen={showPopup}
        onRequestClose={() => setShowPopup(false)}
        className="max-w-md mx-auto mt-20 bg-gray-900/95 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-xl"
        overlayClassName="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 overflow-y-auto"
      >
        <p className="text-white text-center mb-6">{popupMessage}</p>
        <button
          onClick={() => setShowPopup(false)}
          className="w-full drafted-btn drafted-btn-primary"
        >
          OK
        </button>
      </ReactModal>
    </>
  );
};

export default SideMenu;
