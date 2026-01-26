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

  const handleEditClick = () => {
    if (isEditing) {
      // Save changes
      handleSave();
    } else {
      // Enter edit mode
      setIsEditing(true);
    }
  };

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

  const handleCancel = () => {
    setEditedData(authProfileData);
    setIsEditing(false);
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
                onClick={handleEditClick}
                className={`px-4 py-2 rounded-lg transition-all ${
                  isEditing 
                    ? 'bg-drafted-green text-white hover:bg-drafted-emerald' 
                    : 'bg-drafted-green/8 hover:bg-drafted-green/15 border border-drafted-green/20 text-drafted-green'
                }`}
              >
                {isEditing ? 'Save' : 'Edit'}
              </button>
              {isEditing && (
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 transition-all"
                >
                  Cancel
                </button>
              )}
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
            {profileData.university && !isEditing && (
              <Image
                src={getUniversityLogo(profileData.university)}
                alt={profileData.university}
                width={48}
                height={48}
                className="rounded-lg"
                onError={(e) => e.target.style.display = 'none'}
              />
            )}
            <div className="flex-1">
              <div className="text-white font-semibold">{profileData.university}</div>
              {isEditing ? (
                <div className="space-y-2 mt-2">
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
                <div className="text-gray-400 text-sm">
                  {profileData.major}
                  {profileData.graduationMonth && profileData.graduationYear && (
                    <span className="ml-2">• Graduating {profileData.graduationMonth} {profileData.graduationYear}</span>
                  )}
                </div>
              )}
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
          {isEditing ? (
            <div className="space-y-2">
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
                placeholder="Personal Website URL"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-drafted-green/50"
              />
            </div>
          ) : (
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
          )}
        </div>
      </div>

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
