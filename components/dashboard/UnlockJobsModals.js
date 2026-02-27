'use client';

import React, { useEffect, useState } from 'react';
import ReactModal from 'react-modal';
import Image from 'next/image';
import { FaCheck, FaCopy } from 'react-icons/fa';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import toast from 'react-hot-toast';
import { auth, db } from '../../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import linkedinWhite from '../../public/linkedin-white.png';

 const VIEW_NONE = null;
 const VIEW_NUDGE = 'nudge';
 const VIEW_LINKEDIN = 'linkedin';

 export default function UnlockJobsModals({
   view = VIEW_NONE,
   onClose,
   hasFirstVideo,
   hasSharedOnLinkedIn,
   onLinkedInVerified,
   onRecordVideo,
 }) {
   const [localView, setLocalView] = useState(view);
   const [linkedInPostUrl, setLinkedInPostUrl] = useState('');
   const [isValidatingUrl, setIsValidatingUrl] = useState(false);
   const [urlValidationError, setUrlValidationError] = useState('');
   const [urlValidationSuccess, setUrlValidationSuccess] = useState(false);
   const [profileUrlCopied, setProfileUrlCopied] = useState(false);

   useEffect(() => {
     setLocalView(view);
   }, [view]);

   const closeAll = () => {
     setLocalView(VIEW_NONE);
     setLinkedInPostUrl('');
     setUrlValidationError('');
     setUrlValidationSuccess(false);
     onClose?.();
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

   const extractLinkedInActivityId = (url) => {
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
       await setDoc(
         userDocRef,
         {
           sharedOnLinkedIn: true,
           linkedInPostUrl: linkedInPostUrl,
           linkedInActivityId: activityId,
           linkedInShareDate: new Date().toISOString(),
         },
         { merge: true }
       );

       setUrlValidationSuccess(true);
       toast.success('LinkedIn share verified!');
       onLinkedInVerified?.();

       setTimeout(() => {
         closeAll();
       }, 1200);
     } catch (error) {
       console.error('Error verifying LinkedIn share:', error);
       setUrlValidationError('Failed to verify. Please try again.');
     } finally {
       setIsValidatingUrl(false);
     }
   };

   return (
     <>
       <ReactModal
         isOpen={localView === VIEW_NUDGE}
         onRequestClose={closeAll}
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
               closeAll();
               onRecordVideo?.();
             }}
             className="w-full drafted-btn drafted-btn-primary"
           >
             Record Video
           </button>
         ) : !hasSharedOnLinkedIn ? (
           <button
             onClick={() => setLocalView(VIEW_LINKEDIN)}
             className="w-full drafted-btn drafted-btn-primary flex items-center justify-center gap-2"
           >
             <Image src={linkedinWhite} alt="LinkedIn" width={16} height={16} />
             Share on LinkedIn
           </button>
         ) : (
           <button onClick={closeAll} className="w-full drafted-btn drafted-btn-primary">
             Got it!
           </button>
         )}
       </ReactModal>

       <ReactModal
         isOpen={localView === VIEW_LINKEDIN}
         onRequestClose={closeAll}
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
             if (!email) return;
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
           <button onClick={closeAll} className="flex-1 drafted-btn drafted-btn-glass">
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
     </>
   );
 }
