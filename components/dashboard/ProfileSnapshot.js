'use client';

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LinkedIn, GitHub, Language, Email, Check } from '@mui/icons-material';
import { Briefcase, GraduationCap, MapPin, Calendar, Edit2, X, Copy, Check as LucideCheck } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import toast from 'react-hot-toast';
import SkillSelector from './SkillSelector';
import RoleSelector from './RoleSelector';
import MajorAutocomplete from '../onboarding/MajorAutocomplete';
import YearAutocomplete from '../onboarding/YearAutocomplete';
import ResumeUploadModal from './ResumeUploadModal';
import CultureTags from './CultureTags';
import { FileText } from 'lucide-react';

// Get university favicon
const getUniversityFavicon = (universityName) => {
  if (!universityName) return null;
  
  // Map of common universities to their domains
  const universityDomains = {
    'stanford': 'stanford.edu',
    'harvard': 'harvard.edu',
    'mit': 'mit.edu',
    'berkeley': 'berkeley.edu',
    'yale': 'yale.edu',
    'princeton': 'princeton.edu',
    'columbia': 'columbia.edu',
    'upenn': 'upenn.edu',
    'penn': 'upenn.edu',
    'cornell': 'cornell.edu',
    'brown': 'brown.edu',
    'dartmouth': 'dartmouth.edu',
    'duke': 'duke.edu',
    'northwestern': 'northwestern.edu',
    'uchicago': 'uchicago.edu',
    'caltech': 'caltech.edu'
  };
  
  const nameLower = universityName.toLowerCase();
  
  // Try to find matching domain
  for (const [key, domain] of Object.entries(universityDomains)) {
    if (nameLower.includes(key)) {
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    }
  }
  
  // Try to construct domain from university name
  const cleanName = universityName.toLowerCase()
    .replace(/university of /gi, '')
    .replace(/the /gi, '')
    .replace(/ /g, '')
    .replace(/[^a-z]/g, '');
  
  return `https://www.google.com/s2/favicons?domain=${cleanName}.edu&sz=32`;
};

export default function ProfileSnapshot() {
  const { profileData, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showSkillSelector, setShowSkillSelector] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [editedData, setEditedData] = useState(profileData || {});
  const [profileUrlCopied, setProfileUrlCopied] = useState(false);

  if (!profileData) return null;

  const handleEditClick = () => {
    if (isEditing) {
      handleSave();
    } else {
      setEditedData(profileData);
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, 'drafted-accounts', user.email.toLowerCase());
        const dataToUpdate = { ...editedData };
        if (dataToUpdate.personalWebsite && !dataToUpdate.websiteURL) {
          dataToUpdate.websiteURL = dataToUpdate.personalWebsite;
          delete dataToUpdate.personalWebsite;
        }
        await updateDoc(userDocRef, dataToUpdate);
        setIsEditing(false);
        toast.success('Profile looking sharp! Now go show it off.', { duration: 4000 });
        if (refreshProfile) await refreshProfile();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Hmm, that didn\'t work. Give it another shot?');
    }
  };

  const handleCancel = () => {
    setEditedData(profileData);
    setIsEditing(false);
  };

  const handleSaveSkills = async (skills) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, 'drafted-accounts', user.email.toLowerCase());
        await updateDoc(userDocRef, { skills });
        toast.success('Skills locked in! Recruiters are gonna eat this up.', { duration: 4000 });
        if (refreshProfile) await refreshProfile();
      }
    } catch (error) {
      console.error('Error updating skills:', error);
      toast.error('Oops, something went wrong. Try again?');
    }
  };

  return (
    <>
      <div className="liquid-glass rounded-2xl p-4 sm:p-6 lg:p-8">
        {/* Header with Edit Button */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white truncate">
                {profileData.firstName} {profileData.lastName}
              </h1>
              <button
                onClick={() => {
                  const profileUrl = `https://candidate.joindrafted.com/candidate/${profileData.email}`;
                  navigator.clipboard.writeText(profileUrl);
                  setProfileUrlCopied(true);
                  setTimeout(() => setProfileUrlCopied(false), 2000);
                }}
                className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
                title="Copy profile URL"
              >
                {profileUrlCopied ? <LucideCheck className="w-4 h-4 text-drafted-green" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-base sm:text-lg text-gray-300">
                {profileData.major || 'Your Major'}
                {profileData.university && (
                  <>
                    {' @ '}
                    {profileData.university}
                  </>
                )}
                {profileData.graduationYear && (
                  <span className="text-gray-400"> • Class of {profileData.graduationYear}</span>
                )}
              </p>
              {profileData.university && (
                <img 
                  src={getUniversityFavicon(profileData.university)} 
                  alt={profileData.university}
                  className="w-4 h-4 rounded-sm"
                  onError={(e) => e.target.style.display = 'none'}
                />
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleEditClick}
              className={`px-4 py-2 rounded-lg transition-all text-sm font-medium whitespace-nowrap flex items-center gap-2 ${
                isEditing 
                  ? 'bg-drafted-green text-white hover:bg-drafted-emerald' 
                  : 'bg-drafted-green/10 hover:bg-drafted-green/20 border border-drafted-green/30 text-drafted-green'
              }`}
            >
              {isEditing ? (
                <>
                  <Check sx={{ fontSize: 18 }} />
                  Save
                </>
              ) : (
                <>
                  <Edit2 className="w-4 h-4" />
                  Edit
                </>
              )}
            </button>
            {isEditing && (
              <button
                onClick={handleCancel}
                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 transition-all text-sm font-medium whitespace-nowrap flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Two-Column Layout: Identity + Job Preferences */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-6">
          {/* Left: Contact & Education */}
          <div className="space-y-4">
            {/* Contact */}
            <div className="flex items-center gap-2 text-gray-300">
              <Email sx={{ fontSize: 18 }} className="text-gray-400" />
              <span className="text-sm">{profileData.email}</span>
            </div>

            {/* Education */}
            {isEditing ? (
              <div className="space-y-3 p-4 bg-white/5 rounded-lg border border-white/10">
                <MajorAutocomplete
                  value={editedData.major || ''}
                  onChange={(major) => setEditedData({...editedData, major})}
                  onCustomMajor={(major) => setEditedData({...editedData, major})}
                  error=""
                />
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={editedData.graduationMonth || ''}
                    onChange={(e) => setEditedData({...editedData, graduationMonth: e.target.value})}
                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-drafted-green/50"
                  >
                    <option value="" className="bg-slate-800">Month</option>
                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
                      <option key={month} value={month} className="bg-slate-800">{month}</option>
                    ))}
                  </select>
                  <YearAutocomplete
                    value={editedData.graduationYear || ''}
                    onChange={(year) => setEditedData({...editedData, graduationYear: year})}
                    error=""
                    label=""
                  />
                </div>
              </div>
            ) : (
              <>
                {profileData.graduationMonth && profileData.graduationYear && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">Graduating {profileData.graduationMonth} {profileData.graduationYear}</span>
                  </div>
                )}
              </>
            )}

            {/* Links */}
            {isEditing ? (
              <div className="space-y-2 p-4 bg-white/5 rounded-lg border border-white/10">
                <input
                  type="url"
                  value={editedData.linkedInURL || ''}
                  onChange={(e) => setEditedData({...editedData, linkedInURL: e.target.value})}
                  placeholder="LinkedIn URL"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-drafted-green/50"
                />
                <input
                  type="url"
                  value={editedData.gitHubURL || ''}
                  onChange={(e) => setEditedData({...editedData, gitHubURL: e.target.value})}
                  placeholder="GitHub URL"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-drafted-green/50"
                />
                <input
                  type="url"
                  value={editedData.websiteURL || editedData.personalWebsite || ''}
                  onChange={(e) => setEditedData({...editedData, websiteURL: e.target.value})}
                  placeholder="Personal Website"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-drafted-green/50"
                />
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                {profileData.linkedInURL && (
                  <a
                    href={profileData.linkedInURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 border border-[#0A66C2]/30 rounded-lg text-[#0A66C2] text-sm font-medium transition-all"
                  >
                    <LinkedIn sx={{ fontSize: 16 }} />
                    LinkedIn
                  </a>
                )}
                {profileData.gitHubURL && (
                  <a
                    href={profileData.gitHubURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-sm font-medium transition-all"
                  >
                    <GitHub sx={{ fontSize: 16 }} />
                    GitHub
                  </a>
                )}
                {(profileData.websiteURL || profileData.personalWebsite) && (
                  <a
                    href={profileData.websiteURL || profileData.personalWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-drafted-green/10 hover:bg-drafted-green/20 border border-drafted-green/30 rounded-lg text-drafted-green text-sm font-medium transition-all"
                  >
                    <Language sx={{ fontSize: 16 }} />
                    Website
                  </a>
                )}
              </div>
            )}

            {/* Resume Section */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Resume
              </h3>
              {profileData.resume ? (
                <div className="flex items-center gap-2">
                  <a 
                    href={profileData.resume} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="drafted-btn drafted-btn-glass flex items-center gap-2 flex-1 justify-center"
                  >
                    <FileText className="w-4 h-4" />
                    View Resume
                  </a>
                  <button 
                    onClick={() => setShowResumeModal(true)}
                    className="drafted-btn drafted-btn-ghost text-sm px-4"
                  >
                    Replace
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setShowResumeModal(true)}
                  className="drafted-btn drafted-btn-primary w-full flex items-center gap-2 justify-center"
                >
                  <FileText className="w-4 h-4" />
                  Upload Resume
                </button>
              )}
            </div>
          </div>

          {/* Right: Job Preferences & Role */}
          <div className="space-y-4">
            {/* Open To */}
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Open To
              </h3>
              {isEditing ? (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      const current = editedData.jobType || 'Both';
                      let newType;
                      if (current === 'Full-time') newType = 'Both';
                      else if (current === 'Both') newType = 'Internship';
                      else newType = 'Full-time';
                      setEditedData({...editedData, jobType: newType});
                    }}
                    className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${
                      editedData.jobType === 'Full-time' || editedData.jobType === 'Both'
                        ? 'bg-drafted-green/10 border-drafted-green/30 text-drafted-green'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                    }`}>
                    <Briefcase className="w-4 h-4 inline mr-1" />
                    Full-time
                  </button>
                  <button
                    onClick={() => {
                      const current = editedData.jobType || 'Both';
                      let newType;
                      if (current === 'Internship') newType = 'Both';
                      else if (current === 'Both') newType = 'Full-time';
                      else newType = 'Internship';
                      setEditedData({...editedData, jobType: newType});
                    }}
                    className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${
                      editedData.jobType === 'Internship' || editedData.jobType === 'Both'
                        ? 'bg-drafted-green/10 border-drafted-green/30 text-drafted-green'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                    }`}>
                    <GraduationCap className="w-4 h-4 inline mr-1" />
                    Internship
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <div className={`px-3 py-1.5 rounded-lg border text-sm font-medium ${
                    profileData.jobType === 'Full-time' || profileData.jobType === 'Both'
                      ? 'bg-drafted-green/10 border-drafted-green/30 text-drafted-green'
                      : 'bg-white/5 border-white/10 text-gray-400'
                  }`}>
                    <Briefcase className="w-4 h-4 inline mr-1" />
                    Full-time
                  </div>
                  <div className={`px-3 py-1.5 rounded-lg border text-sm font-medium ${
                    profileData.jobType === 'Internship' || profileData.jobType === 'Both'
                      ? 'bg-drafted-green/10 border-drafted-green/30 text-drafted-green'
                      : 'bg-white/5 border-white/10 text-gray-400'
                  }`}>
                    <GraduationCap className="w-4 h-4 inline mr-1" />
                    Internship
                  </div>
                </div>
              )}
            </div>
            
            {/* Role Selector */}
            {!isEditing && (
              <RoleSelector onRoleChange={async () => {
                if (refreshProfile) await refreshProfile();
              }} />
            )}

            {/* Skills */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
                  Top Skills
                </h3>
                {!isEditing && (
                  <button
                    onClick={() => setShowSkillSelector(true)}
                    className="text-xs text-drafted-green hover:text-drafted-emerald transition-colors font-medium"
                  >
                    Edit Skills
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {profileData.skills && profileData.skills.length > 0 ? (
                  profileData.skills.slice(0, 5).map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-white text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <button
                    onClick={() => setShowSkillSelector(true)}
                    className="px-4 py-2 bg-drafted-green/10 hover:bg-drafted-green/20 border border-drafted-green/30 rounded-lg text-drafted-green text-sm font-medium transition-all"
                  >
                    Add Skills
                  </button>
                )}
              </div>
            </div>

            {/* Culture Tags */}
            {profileData?.culture?.cultureTags && profileData.culture.cultureTags.length > 0 && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
                    Culture Tags
                  </h3>
                  <button
                    onClick={async () => {
                      const hasAllVideos = profileData.video1 && profileData.video2 && profileData.video3;
                      if (!hasAllVideos) {
                        toast.error('Complete all 3 videos to generate culture tags');
                        return;
                      }
                      
                      const loadingToast = toast.loading('Regenerating culture tags...');
                      try {
                        const { default: generateCultureTags } = await import('../../lib/services/CultureTagService');
                        await generateCultureTags(auth.currentUser.email.toLowerCase());
                        await refreshProfile();
                        toast.success('Culture tags regenerated!', { id: loadingToast });
                      } catch (error) {
                        console.error('Failed to regenerate culture tags:', error);
                        toast.error('Failed to regenerate culture tags', { id: loadingToast });
                      }
                    }}
                    className="text-xs text-drafted-green hover:text-drafted-emerald transition-colors font-medium"
                  >
                    Regenerate
                  </button>
                </div>
                <CultureTags
                  tags={profileData.culture.cultureTags}
                  descriptions={profileData.culture.cultureDescriptions}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Skill Selector Modal */}
      <SkillSelector
        isOpen={showSkillSelector}
        onClose={() => setShowSkillSelector(false)}
        initialSkills={profileData.skills || []}
        onSave={handleSaveSkills}
      />

      {/* Resume Upload Modal */}
      <ResumeUploadModal
        isOpen={showResumeModal}
        onClose={() => setShowResumeModal(false)}
        onUploadComplete={refreshProfile}
      />
    </>
  );
}
