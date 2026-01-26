'use client';

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LinkedIn, GitHub, Language, Email, Check } from '@mui/icons-material';
import { Briefcase, GraduationCap, MapPin, Calendar, Edit2, X } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import toast from 'react-hot-toast';
import SkillSelector from './SkillSelector';

export default function ProfileSnapshot() {
  const { profileData, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showSkillSelector, setShowSkillSelector] = useState(false);
  const [editedData, setEditedData] = useState(profileData || {});

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
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 truncate">
              {profileData.firstName} {profileData.lastName}
            </h1>
            <p className="text-base sm:text-lg text-gray-300">
              {profileData.major || 'Your Major'} {profileData.university && `@ ${profileData.university}`}
              {profileData.graduationYear && (
                <span className="text-gray-400"> • Class of {profileData.graduationYear}</span>
              )}
            </p>
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
                <input
                  type="text"
                  value={editedData.major || ''}
                  onChange={(e) => setEditedData({...editedData, major: e.target.value})}
                  placeholder="Major"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-drafted-green/50"
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
                  <select
                    value={editedData.graduationYear || ''}
                    onChange={(e) => setEditedData({...editedData, graduationYear: parseInt(e.target.value)})}
                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-drafted-green/50"
                  >
                    <option value="" className="bg-slate-800">Year</option>
                    {Array.from({ length: 8 }, (_, i) => new Date().getFullYear() + i - 2).map(year => (
                      <option key={year} value={year} className="bg-slate-800">{year}</option>
                    ))}
                  </select>
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
          </div>

          {/* Right: Job Preferences */}
          <div className="space-y-4">
            {/* Open To */}
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Open To
              </h3>
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
            </div>

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
    </>
  );
}
