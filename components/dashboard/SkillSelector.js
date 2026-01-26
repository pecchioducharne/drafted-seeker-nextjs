'use client';

import React, { useState, useEffect } from 'react';
import ReactModal from 'react-modal';
import { X, Check, ChevronDown } from 'lucide-react';

// Set app element for react-modal
if (typeof window !== 'undefined') {
  ReactModal.setAppElement('#root');
}

// Skills data structure - same as original
const skillsData = [
  {
    name: "Programming",
    branches: ["Python", "JavaScript", "Java", "C++", "C#", "TypeScript", "Swift", "Go", "PHP", "Dart", "Rust"]
  },
  {
    name: "Data Analysis",
    branches: ["Excel", "Google Sheets", "SQL", "Tableau", "Python (Pandas)", "Data Cleaning"]
  },
  {
    name: "Marketing",
    branches: ["Social Media Marketing", "Content Creation", "Email Marketing", "SEO Basics", "Canva", "Analytics (Google/Facebook)"]
  },
  {
    name: "Project Management",
    branches: ["Trello", "Notion", "Google Workspace", "Time Management", "Team Coordination"]
  },
  {
    name: "Sales",
    branches: ["Outreach", "CRM Tools (e.g. HubSpot)", "Demand Generation", "Customer Relationship"]
  },
  {
    name: "Communication"
  },
  {
    name: "Graphic Design",
    branches: ["Canva", "Figma", "Photoshop", "Visual Storytelling"]
  },
  {
    name: "Web Development",
    branches: ["HTML/CSS", "JavaScript", "WordPress", "Responsive Design"]
  },
  {
    name: "Social Media Management",
    branches: ["Instagram", "TikTok", "LinkedIn", "Copywriting"]
  },
  {
    name: "Customer Service"
  },
  {
    name: "Research",
    branches: ["Market Research", "Competitive Research", "User Surveys", "Google Search Mastery"]
  },
  {
    name: "Excel",
    branches: ["Formulas", "Pivot Tables", "Waterfall", "Data Entry", "Formatting"]
  },
  {
    name: "Finance",
    branches: ["Budgeting", "Expense Tracking", "Financial Literacy"]
  },
  {
    name: "Accounting"
  },
  {
    name: "Technical Support",
    branches: ["Troubleshooting", "Helpdesk Tools", "Basic IT Support", "Clear Communication"]
  },
  {
    name: "UX/UI Design",
    branches: ["Figma", "Wireframing", "User Feedback", "Prototyping (Basic)"]
  },
  {
    name: "Video Editing",
    branches: ["CapCut", "iMovie", "Adobe Premiere (Basic)", "TikTok Editing"]
  },
  {
    name: "Organization",
    branches: ["Club Leadership", "Event Planning", "Team Leading", "Initiative Taking"]
  }
];

export default function SkillSelector({ onSave, initialSkills = [], isOpen, onClose }) {
  const [selectedItems, setSelectedItems] = useState([]);
  const [expandedSkills, setExpandedSkills] = useState(new Set());

  // Helper functions
  const getAllBranches = (skillName) => {
    const skill = skillsData.find(s => s.name === skillName);
    return skill?.branches || [];
  };

  const findParentSkill = (item) => {
    for (const skill of skillsData) {
      if (skill.branches && skill.branches.includes(item)) {
        return skill.name;
      }
    }
    return null;
  };

  // Initialize with existing skills
  useEffect(() => {
    if (initialSkills.length > 0) {
      const newExpandedSkills = new Set();
      
      initialSkills.forEach(skill => {
        const parentSkill = findParentSkill(skill);
        if (parentSkill) {
          newExpandedSkills.add(parentSkill);
        }
        const branches = getAllBranches(skill);
        if (branches.length > 0) {
          const hasBranchSelected = branches.some(branch => initialSkills.includes(branch));
          if (hasBranchSelected) {
            newExpandedSkills.add(skill);
          }
        }
      });
      
      setExpandedSkills(newExpandedSkills);
      setSelectedItems(initialSkills);
    }
  }, [initialSkills]);

  const handleSkillClick = (skillName) => {
    const skill = skillsData.find(s => s.name === skillName);
    
    if (skill?.branches && skill.branches.length > 0) {
      // Toggle expansion (only one open at a time)
      const newExpanded = new Set();
      if (!expandedSkills.has(skillName)) {
        newExpanded.add(skillName);
      }
      setExpandedSkills(newExpanded);
    } else {
      // No branches - toggle selection
      handleItemSelection(skillName);
    }
  };

  const handleItemSelection = (item) => {
    if (selectedItems.includes(item)) {
      setSelectedItems(selectedItems.filter(selectedItem => selectedItem !== item));
    } else if (selectedItems.length < 5) {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const isSelectionDisabled = (item) => {
    return !selectedItems.includes(item) && selectedItems.length >= 5;
  };

  const handleSave = () => {
    onSave(selectedItems);
    onClose();
  };

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="max-w-2xl mx-auto mt-10 bg-gray-900/95 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
      overlayClassName="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 overflow-y-auto pt-10 pb-10"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/5 transition-colors"
      >
        <X className="w-5 h-5 text-gray-400" />
      </button>

      <h2 className="text-2xl font-bold text-white mb-2">
        Select Your Skills ({selectedItems.length}/5)
      </h2>
      <p className="text-sm text-gray-400 mb-6">
        Choose up to 5 skills that best represent your abilities
      </p>

      <div className="space-y-2 mb-6">
        {skillsData.map((skill) => (
          <div key={skill.name}>
            {/* Main skill button */}
            <button
              onClick={() => handleSkillClick(skill.name)}
              disabled={isSelectionDisabled(skill.name)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-all ${
                selectedItems.includes(skill.name)
                  ? 'bg-drafted-green/10 border-drafted-green/30 text-drafted-green'
                  : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
              } ${isSelectionDisabled(skill.name) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className="font-medium">{skill.name}</span>
              <div className="flex items-center gap-2">
                {selectedItems.includes(skill.name) && (
                  <Check className="w-4 h-4" />
                )}
                {skill.branches && skill.branches.length > 0 && (
                  <ChevronDown 
                    className={`w-4 h-4 transition-transform ${
                      expandedSkills.has(skill.name) ? 'rotate-180' : ''
                    }`}
                  />
                )}
              </div>
            </button>

            {/* Branches section */}
            {skill.branches && skill.branches.length > 0 && expandedSkills.has(skill.name) && (
              <div className="mt-2 ml-4 space-y-2 pb-2">
                <p className="text-xs text-gray-400 mb-2">
                  Choose specific {skill.name.toLowerCase()} skills:
                </p>
                
                {/* General option */}
                <button
                  onClick={() => handleItemSelection(skill.name)}
                  disabled={isSelectionDisabled(skill.name)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-sm transition-all ${
                    selectedItems.includes(skill.name)
                      ? 'bg-drafted-green/10 border-drafted-green/30 text-drafted-green'
                      : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                  } ${isSelectionDisabled(skill.name) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span>{skill.name} (General)</span>
                  {selectedItems.includes(skill.name) && (
                    <Check className="w-3 h-3" />
                  )}
                </button>

                {/* Branch options */}
                <div className="grid grid-cols-2 gap-2">
                  {skill.branches.map((branch) => (
                    <button
                      key={branch}
                      onClick={() => handleItemSelection(branch)}
                      disabled={isSelectionDisabled(branch)}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg border text-sm transition-all ${
                        selectedItems.includes(branch)
                          ? 'bg-drafted-green/10 border-drafted-green/30 text-drafted-green'
                          : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                      } ${isSelectionDisabled(branch) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span className="truncate">{branch}</span>
                      {selectedItems.includes(branch) && (
                        <Check className="w-3 h-3 flex-shrink-0 ml-1" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Selected skills preview */}
      {selectedItems.length > 0 && (
        <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
          <p className="text-sm text-gray-400 mb-2">Selected:</p>
          <div className="flex flex-wrap gap-2">
            {selectedItems.map((item) => (
              <span
                key={item}
                className="px-3 py-1 bg-drafted-green/10 text-drafted-green text-sm rounded-lg border border-drafted-green/20 flex items-center gap-2"
              >
                {item}
                <button
                  onClick={() => handleItemSelection(item)}
                  className="hover:text-drafted-emerald"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 drafted-btn drafted-btn-glass py-3"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="flex-1 drafted-btn drafted-btn-primary py-3"
        >
          Save Skills
        </button>
      </div>
    </ReactModal>
  );
}
