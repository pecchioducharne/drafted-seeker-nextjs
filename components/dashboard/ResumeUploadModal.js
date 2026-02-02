'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { storage, db, auth } from '../../lib/firebase';
import { parseResume } from '../../lib/utils/resumeParser';
import toast from 'react-hot-toast';
import ResumeUploadSection from '../onboarding/ResumeUploadSection';

export default function ResumeUploadModal({ isOpen, onClose, onUploadComplete }) {
  const [resumeFile, setResumeFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleResumeProcessed = (parsed, file, completeness) => {
    setParsedData(parsed);
    setResumeFile(file);
    console.log('Resume parsed:', { parsed, completeness });
  };

  const handleUpload = async () => {
    if (!resumeFile) {
      toast.error('Please select a resume file');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      toast.error('You must be logged in to upload a resume');
      return;
    }

    setIsUploading(true);
    const uploadingToast = toast.loading('Uploading resume...');

    try {
      // Upload resume to Firebase Storage
      const timestamp = Date.now();
      const fileName = `${timestamp}_${resumeFile.name}`;
      const storageRef = ref(storage, `resumes/${user.uid}/${fileName}`);
      await uploadBytes(storageRef, resumeFile);
      const downloadURL = await getDownloadURL(storageRef);

      console.log('✅ Resume uploaded to Storage:', downloadURL);

      // Update Firestore with new resume URL and experience data
      const userDocRef = doc(db, 'drafted-accounts', user.email.toLowerCase());
      const updateData = {
        resume: downloadURL,
      };

      // Add experience array if parsed from resume
      if (parsedData?.experience && parsedData.experience.length > 0) {
        updateData.experience = parsedData.experience;
      }

      await updateDoc(userDocRef, updateData);

      console.log('✅ Firestore updated with resume data');

      toast.success('Resume uploaded successfully!', { id: uploadingToast });
      
      // Call the callback to refresh profile data
      if (onUploadComplete) {
        await onUploadComplete();
      }

      // Close modal
      onClose();

    } catch (error) {
      console.error('❌ Resume upload failed:', error);
      toast.error('Failed to upload resume. Please try again.', { id: uploadingToast });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setResumeFile(null);
    setParsedData(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={handleCancel}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="relative w-full max-w-2xl bg-gradient-to-br from-slate-900/95 to-slate-800/95 rounded-2xl shadow-2xl border border-white/10 animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={handleCancel}
            disabled={isUploading}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Content */}
          <div className="p-8">
            <h2 className="text-3xl font-bold text-white mb-6">
              Upload Resume
            </h2>

            <ResumeUploadSection
              onResumeProcessed={handleResumeProcessed}
              resumeFile={resumeFile}
              setResumeFile={setResumeFile}
            />

            {parsedData && parsedData.experience && parsedData.experience.length > 0 && (
              <div className="mt-6 drafted-card p-4">
                <h4 className="text-sm font-semibold text-white mb-3">
                  Experience Found ({parsedData.experience.length})
                </h4>
                <div className="space-y-3">
                  {parsedData.experience.map((exp, index) => (
                    <div key={index} className="text-sm border-l-2 border-drafted-green pl-3">
                      <div className="text-white font-medium">
                        {exp.role || 'Position'} at {exp.companyName || 'Company'}
                      </div>
                      {exp.date && (
                        <div className="text-gray-400 text-xs mt-1">{exp.date}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCancel}
                disabled={isUploading}
                className="flex-1 drafted-btn drafted-btn-ghost py-3 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!resumeFile || isUploading}
                className="flex-1 drafted-btn drafted-btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
                    Uploading...
                  </>
                ) : (
                  'Upload Resume'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
