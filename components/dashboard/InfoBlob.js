'use client';

import React, { useState, useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../../lib/firebase";
import { getUniversityLogo } from "../../lib/UniversityLogoMap";
import EditIcon from "../shared/EditIcon";
import Image from "next/image";
import { Language, Email } from "@mui/icons-material";
import ReactModal from 'react-modal';
import toast from 'react-hot-toast';
import { useAuth } from "../../contexts/AuthContext";
import SkillSelector from "./SkillSelector";

// Set app element for react-modal
if (typeof window !== 'undefined') {
  ReactModal.setAppElement('#root');
}

const InfoBlob = ({ onProfileUpdate }) => {
  const { profileData: authProfileData, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [showSkillSelector, setShowSkillSelector] = useState(false);

  useEffect(() => {
    if (authProfileData) {
      setEditedData(authProfileData);
    }
  }, [authProfileData]);

  const handleSave = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, "drafted-accounts", user.email.toLowerCase());
        await updateDoc(userDocRef, editedData);
        setIsEditing(false);
        toast.success('Profile updated successfully!');
        if (refreshProfile) await refreshProfile();
        if (onProfileUpdate) onProfileUpdate();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  if (!authProfileData) {
    return <div className="drafted-card animate-pulse">Loading profile...</div>;
  }

  const profileData = authProfileData;

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="drafted-card">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl font-bold text-white">
                {profileData.firstName} {profileData.lastName}
              </h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="p-2.5 rounded-lg bg-drafted-green/8 hover:bg-drafted-green/15 border border-drafted-green/20 transition-all"
              >
                <EditIcon />
              </button>
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Email sx={{ fontSize: 16 }} />
              <span>{profileData.email}</span>
            </div>
          </div>
          
          {/* Job Type Toggle */}
          <div className="flex gap-2">
            <label className={`px-3 py-1.5 text-xs rounded-md border cursor-pointer transition-all ${
              profileData.jobType === 'Full-time' 
                ? 'bg-drafted-green/10 border-drafted-green text-drafted-green' 
                : 'bg-white/5 border-white/10 text-gray-400'
            }`}>
              <input
                type="radio"
                name="jobType"
                value="Full-time"
                checked={profileData.jobType === 'Full-time'}
                onChange={(e) => {
                  setEditedData({...editedData, jobType: e.target.value});
                  if (!isEditing) {
                    const user = auth.currentUser;
                    if (user) {
                      updateDoc(doc(db, "drafted-accounts", user.email.toLowerCase()), {
                        jobType: e.target.value
                      });
                    }
                  }
                }}
                className="mr-1.5 w-2.5 h-2.5"
              />
              Full-time
            </label>
            <label className={`px-3 py-1.5 text-xs rounded-md border cursor-pointer transition-all ${
              profileData.jobType === 'Internship' 
                ? 'bg-drafted-green/10 border-drafted-green text-drafted-green' 
                : 'bg-white/5 border-white/10 text-gray-400'
            }`}>
              <input
                type="radio"
                name="jobType"
                value="Internship"
                checked={profileData.jobType === 'Internship'}
                onChange={(e) => {
                  setEditedData({...editedData, jobType: e.target.value});
                  if (!isEditing) {
                    const user = auth.currentUser;
                    if (user) {
                      updateDoc(doc(db, "drafted-accounts", user.email.toLowerCase()), {
                        jobType: e.target.value
                      });
                    }
                  }
                }}
                className="mr-1.5 w-2.5 h-2.5"
              />
              Internship
            </label>
          </div>
        </div>

        {/* Education */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">Education</h3>
          <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
            {profileData.university && (
              <Image
                src={getUniversityLogo(profileData.university)}
                alt={profileData.university}
                width={48}
                height={48}
                className="rounded-lg"
                onError={(e) => e.target.style.display = 'none'}
              />
            )}
            <div>
              <div className="text-white font-semibold">{profileData.university}</div>
              <div className="text-gray-400 text-sm">{profileData.major}</div>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Skills</h3>
            <button
              onClick={() => setShowSkillSelector(true)}
              className="text-xs text-drafted-green hover:text-drafted-emerald transition-colors"
            >
              Edit Skills
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {profileData.skills && profileData.skills.length > 0 ? (
              profileData.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-drafted-green/10 text-drafted-green text-sm rounded-lg border border-drafted-green/20"
                >
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No skills added yet</p>
            )}
          </div>
        </div>

        {/* Culture Tags */}
        {profileData.cultureTags && profileData.cultureTags.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">Culture Match</h3>
            <p className="text-xs text-gray-500 mb-3">AI-generated based on your video responses</p>
            <div className="flex flex-wrap gap-2">
              {profileData.cultureTags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-blue-500/10 text-blue-400 text-sm rounded-lg border border-blue-500/20"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Social Links */}
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">Links</h3>
          <div className="space-y-2">
            {profileData.linkedInURL && (
              <a
                href={profileData.linkedInURL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all group"
              >
                <Image src="/linkedin-white.png" alt="LinkedIn" width={20} height={20} />
                <span className="text-gray-300 group-hover:text-white transition-colors">LinkedIn Profile</span>
              </a>
            )}
            {profileData.gitHubURL && (
              <a
                href={profileData.gitHubURL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all group"
              >
                <Image src="/github.svg" alt="GitHub" width={20} height={20} />
                <span className="text-gray-300 group-hover:text-white transition-colors">GitHub Profile</span>
              </a>
            )}
            {(profileData.websiteURL || profileData.personalWebsite) && (
              <a
                href={profileData.websiteURL || profileData.personalWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all group"
              >
                <Language sx={{ fontSize: 20 }} />
                <span className="text-gray-300 group-hover:text-white transition-colors">Personal Website</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <ReactModal
        isOpen={isEditing}
        onRequestClose={() => setIsEditing(false)}
        className="max-w-2xl mx-auto mt-10 bg-gray-900/95 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto"
        overlayClassName="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 overflow-y-auto pt-10 pb-10"
      >
        <h2 className="text-2xl font-bold text-white mb-6">Edit Profile</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
            <input
              type="text"
              value={editedData.firstName || ''}
              onChange={(e) => setEditedData({...editedData, firstName: e.target.value})}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-drafted-green/50"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
            <input
              type="text"
              value={editedData.lastName || ''}
              onChange={(e) => setEditedData({...editedData, lastName: e.target.value})}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-drafted-green/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">LinkedIn URL</label>
            <input
              type="url"
              value={editedData.linkedInURL || ''}
              onChange={(e) => setEditedData({...editedData, linkedInURL: e.target.value})}
              placeholder="https://linkedin.com/in/yourprofile"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-drafted-green/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">GitHub URL</label>
            <input
              type="url"
              value={editedData.gitHubURL || ''}
              onChange={(e) => setEditedData({...editedData, gitHubURL: e.target.value})}
              placeholder="https://github.com/yourusername"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-drafted-green/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Personal Website</label>
            <input
              type="url"
              value={editedData.websiteURL || editedData.personalWebsite || ''}
              onChange={(e) => setEditedData({...editedData, websiteURL: e.target.value})}
              placeholder="https://yourwebsite.com"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-drafted-green/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Major</label>
            <input
              type="text"
              value={editedData.major || ''}
              onChange={(e) => setEditedData({...editedData, major: e.target.value})}
              placeholder="Computer Science"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-drafted-green/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Graduation Month</label>
              <select
                value={editedData.graduationMonth || ''}
                onChange={(e) => setEditedData({...editedData, graduationMonth: e.target.value})}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-drafted-green/50"
              >
                <option value="" className="bg-slate-800">Select Month</option>
                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
                  <option key={month} value={month} className="bg-slate-800">{month}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Graduation Year</label>
              <select
                value={editedData.graduationYear || ''}
                onChange={(e) => setEditedData({...editedData, graduationYear: parseInt(e.target.value)})}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-drafted-green/50"
              >
                <option value="" className="bg-slate-800">Select Year</option>
                {Array.from({ length: 8 }, (_, i) => new Date().getFullYear() + i - 2).map(year => (
                  <option key={year} value={year} className="bg-slate-800">{year}</option>
                ))}
              </select>
            </div>
          </div>

        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setIsEditing(false)}
            className="flex-1 drafted-btn drafted-btn-glass"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 drafted-btn drafted-btn-primary"
          >
            Save Changes
          </button>
        </div>
      </ReactModal>

      {/* Skill Selector Modal */}
      <SkillSelector
        isOpen={showSkillSelector}
        onClose={() => setShowSkillSelector(false)}
        initialSkills={profileData.skills || []}
        onSave={async (skills) => {
          try {
            const user = auth.currentUser;
            if (user) {
              const userDocRef = doc(db, "drafted-accounts", user.email.toLowerCase());
              await updateDoc(userDocRef, { skills });
              toast.success('Skills updated successfully!');
              if (refreshProfile) await refreshProfile();
              if (onProfileUpdate) onProfileUpdate();
            }
          } catch (error) {
            console.error('Error updating skills:', error);
            toast.error('Failed to update skills');
          }
        }}
      />
    </div>
  );
};

export default InfoBlob;
