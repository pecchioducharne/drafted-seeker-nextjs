// src/utils/roleAssignment.js

import React from 'react';
import { askOpenAI } from './openai';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../backend/firebase';
import { Zap, Rocket, Palette, TrendingUp, Briefcase, Settings } from 'lucide-react';

export const ROLE_CATEGORIES = [
  {
    id: 'engineering',
    name: 'Engineering',
    icon: <Zap size={28} strokeWidth={2} color="white" fill="none" />,
    color: '#3B82F6',
    gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
    description: 'Build the future with code',
    keywords: ['developer', 'programmer', 'software', 'tech', 'coding']
  },
  {
    id: 'product',
    name: 'Product',
    icon: <Rocket size={28} strokeWidth={2} color="white" fill="none" />,
    color: '#8B5CF6',
    gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
    description: 'Shape products users love',
    keywords: ['product manager', 'pm', 'strategy', 'roadmap']
  },
  {
    id: 'design',
    name: 'Design',
    icon: <Palette size={28} strokeWidth={2} color="white" fill="none" />,
    color: '#EC4899',
    gradient: 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)',
    description: 'Create beautiful experiences',
    keywords: ['designer', 'ux', 'ui', 'creative', 'visual']
  },
  {
    id: 'marketing',
    name: 'Marketing',
    icon: <TrendingUp size={28} strokeWidth={2} color="white" fill="none" />,
    color: '#10B981',
    gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    description: 'Tell compelling stories',
    keywords: ['marketing', 'growth', 'content', 'brand', 'campaigns']
  },
  {
    id: 'sales',
    name: 'Sales',
    icon: <Briefcase size={28} strokeWidth={2} color="white" fill="none" />,
    color: '#F59E0B',
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    description: 'Drive revenue and growth',
    keywords: ['sales', 'business development', 'account', 'revenue']
  },
  {
    id: 'operations',
    name: 'Operations',
    icon: <Settings size={28} strokeWidth={2} color="white" fill="none" />,
    color: '#6B7280',
    gradient: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
    description: 'Keep everything running smoothly',
    keywords: ['operations', 'finance', 'hr', 'admin', 'business']
  }
];

// Major/field to role mappings for preset assignments
const MAJOR_TO_ROLE_MAPPING = {
  // Engineering
  'Computer Science': 'engineering',
  'Software Engineering': 'engineering',
  'Computer Engineering': 'engineering',
  'Electrical Engineering': 'engineering',
  'Mechanical Engineering': 'engineering',
  'Civil Engineering': 'engineering',
  'Biomedical Engineering': 'engineering',
  'Industrial Engineering': 'engineering',
  'Aerospace Engineering': 'engineering',
  'Chemical Engineering': 'engineering',
  'Data Science': 'engineering',
  'Information Technology': 'engineering',
  'Cybersecurity': 'engineering',
  'Mathematics': 'engineering',
  'Physics': 'engineering',
  'Statistics': 'engineering',
  
  // Product
  'Product Management': 'product',
  'Information Systems': 'product',
  'Business Information Systems': 'product',
  'Human-Computer Interaction': 'product',
  'Management Information Systems': 'product',
  
  // Design
  'Graphic Design': 'design',
  'Visual Design': 'design',
  'Industrial Design': 'design',
  'User Experience Design': 'design',
  'User Interface Design': 'design',
  'UX Design': 'design',
  'UI Design': 'design',
  'Fine Arts': 'design',
  'Art': 'design',
  'Digital Media': 'design',
  'Visual Arts': 'design',
  
  // Marketing
  'Marketing': 'marketing',
  'Digital Marketing': 'marketing',
  'Communications': 'marketing',
  'Public Relations': 'marketing',
  'Advertising': 'marketing',
  'Media Studies': 'marketing',
  'Journalism': 'marketing',
  'English': 'marketing',
  'Creative Writing': 'marketing',
  
  // Sales
  'Sales': 'sales',
  'Business Development': 'sales',
  
  // Operations
  'Business Administration': 'operations',
  'Management': 'operations',
  'Operations Management': 'operations',
  'Supply Chain Management': 'operations',
  'Logistics': 'operations',
  'Economics': 'operations',
  'Finance': 'operations',
  'Accounting': 'operations',
  'Human Resources': 'operations',
  'Psychology': 'operations',
  'Sociology': 'operations',
  'International Business': 'operations',
  'Business': 'operations',
  'Political Science': 'operations',
  'History': 'operations'
};

/**
 * Get role info by ID
 */
export const getRoleById = (roleId) => {
  return ROLE_CATEGORIES.find(role => role.id === roleId) || ROLE_CATEGORIES[5]; // Default to operations
};

/**
 * Assigns a role category based on major using preset mapping
 */
export const assignRoleBasedOnMajor = (major) => {
  if (!major) return 'operations';
  
  // Direct mapping first
  const directMatch = MAJOR_TO_ROLE_MAPPING[major];
  if (directMatch) return directMatch;
  
  // Fuzzy matching for similar terms
  const majorLower = major.toLowerCase();
  
  // Engineering keywords
  if (majorLower.includes('engineer') || 
      majorLower.includes('computer') || 
      majorLower.includes('software') ||
      majorLower.includes('tech') ||
      majorLower.includes('programming') ||
      majorLower.includes('coding') ||
      majorLower.includes('data') ||
      majorLower.includes('cyber') ||
      majorLower.includes('math') ||
      majorLower.includes('physics')) {
    return 'engineering';
  }
  
  // Design keywords
  if (majorLower.includes('design') || 
      majorLower.includes('art') || 
      majorLower.includes('visual') ||
      majorLower.includes('graphic') ||
      majorLower.includes('ux') ||
      majorLower.includes('ui') ||
      majorLower.includes('creative')) {
    return 'design';
  }
  
  // Marketing keywords
  if (majorLower.includes('marketing') || 
      majorLower.includes('communication') || 
      majorLower.includes('media') ||
      majorLower.includes('advertising') ||
      majorLower.includes('pr') ||
      majorLower.includes('journalism') ||
      majorLower.includes('english') ||
      majorLower.includes('writing')) {
    return 'marketing';
  }
  
  // Sales keywords
  if (majorLower.includes('sales') || 
      majorLower.includes('business development')) {
    return 'sales';
  }
  
  // Product keywords
  if (majorLower.includes('product') || 
      majorLower.includes('human-computer') ||
      majorLower.includes('information systems')) {
    return 'product';
  }
  
  // Default to Operations for business/general majors
  return 'operations';
};

/**
 * Enhanced role assignment using OpenAI API
 */
export const assignRoleWithLLM = async (candidateData) => {
  const { major, resumeURL, linkedInURL, gitHubURL, firstName, lastName } = candidateData;
  
  // Fallback role in case of API failure
  const fallbackRole = assignRoleBasedOnMajor(major);
  
  try {
    const roleOptions = ROLE_CATEGORIES.map(role => 
      `${role.name}: ${role.description} (${role.keywords.join(', ')})`
    ).join('\n');

    const messages = [
      {
        role: "system",
        content: `You are a career counselor that assigns candidates to one of these 6 role categories based on their background:

${roleOptions}

Rules:
- Engineering: Technical majors, developers, data scientists, engineers
- Product: Product management, strategy, user research, business-tech hybrid
- Design: Visual design, UX/UI, creative roles, user experience
- Marketing: Marketing, communications, content, brand, growth
- Sales: Sales, business development, account management, revenue roles
- Operations: Business admin, finance, HR, general business, support functions

Respond with ONLY the lowercase role ID: engineering, product, design, marketing, sales, or operations`
      },
      {
        role: "user", 
        content: `Assign a role for this candidate:

Name: ${firstName} ${lastName}
Major: ${major}
Has Resume: ${resumeURL ? 'Yes' : 'No'}
Has LinkedIn: ${linkedInURL ? 'Yes' : 'No'}  
Has GitHub: ${gitHubURL ? 'Yes' : 'No'}

Role ID:`
      }
    ];

    const response = await askOpenAI(messages, "gpt-4o-mini");
    const assignedRole = response.choices[0].message.content.trim().toLowerCase();
    
    // Validate the response is one of our role IDs
    const validRoles = ROLE_CATEGORIES.map(r => r.id);
    if (validRoles.includes(assignedRole)) {
      console.log(`✅ LLM assigned role '${assignedRole}' for ${firstName} ${lastName} (${major})`);
      return assignedRole;
    } else {
      console.warn(`⚠️ LLM returned invalid role '${assignedRole}', using fallback '${fallbackRole}'`);
      return fallbackRole;
    }
    
  } catch (error) {
    console.error('❌ LLM role assignment failed, using fallback:', error);
    return fallbackRole;
  }
};

/**
 * Updates a candidate's role in Firestore
 */
export const updateCandidateRole = async (email, roleId) => {
  try {
    const userDocRef = doc(db, "drafted-accounts", email.toLowerCase());
    await updateDoc(userDocRef, {
      assignedRole: roleId,
      roleAssignedAt: new Date(),
      roleAssignedBy: 'system'
    });
    
    console.log(`✅ Role '${roleId}' assigned to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to update candidate role:', error);
    return false;
  }
};

/**
 * Updates a candidate's role manually (user-initiated)
 */
export const updateCandidateRoleManual = async (email, roleId) => {
  try {
    const userDocRef = doc(db, "drafted-accounts", email.toLowerCase());
    await updateDoc(userDocRef, {
      assignedRole: roleId,
      roleAssignedAt: new Date(),
      roleAssignedBy: 'user'
    });
    
    console.log(`✅ Role manually updated to '${roleId}' for ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to manually update candidate role:', error);
    return false;
  }
};

/**
 * Gets the current role for a candidate
 */
export const getCandidateRole = async (email) => {
  try {
    const userDocRef = doc(db, "drafted-accounts", email.toLowerCase());
    const docSnap = await getDoc(userDocRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return data.assignedRole || 'operations'; // Default fallback
    }
    
    return 'operations';
  } catch (error) {
    console.error('❌ Failed to get candidate role:', error);
    return 'operations';
  }
};

/**
 * Main function to assign and save role during signup
 */
export const assignAndSaveRole = async (candidateData, email) => {
  try {
    // Use LLM for more accurate assignment, fallback to major-based
    const assignedRole = await assignRoleWithLLM(candidateData);
    
    // Update the role in Firestore
    await updateCandidateRole(email, assignedRole);
    
    return assignedRole;
  } catch (error) {
    console.error('❌ Role assignment process failed:', error);
    // Return fallback role even if save failed
    return assignRoleBasedOnMajor(candidateData.major);
  }
};
