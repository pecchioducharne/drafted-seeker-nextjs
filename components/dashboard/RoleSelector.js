'use client';

import React, { useState, useEffect } from 'react';
import { Zap, Rocket, Palette, TrendingUp, Briefcase, Settings, Check, Edit2 } from 'lucide-react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import toast from 'react-hot-toast';

export const ROLE_CATEGORIES = [
  {
    id: 'engineering',
    name: 'Engineering',
    icon: Zap,
    color: '#3B82F6',
    gradient: 'from-blue-500 to-blue-700',
    description: 'Build the future with code'
  },
  {
    id: 'product',
    name: 'Product',
    icon: Rocket,
    color: '#8B5CF6',
    gradient: 'from-purple-500 to-purple-700',
    description: 'Shape products users love'
  },
  {
    id: 'design',
    name: 'Design',
    icon: Palette,
    color: '#EC4899',
    gradient: 'from-pink-500 to-pink-700',
    description: 'Create beautiful experiences'
  },
  {
    id: 'marketing',
    name: 'Marketing',
    icon: TrendingUp,
    color: '#10B981',
    gradient: 'from-green-500 to-emerald-700',
    description: 'Tell compelling stories'
  },
  {
    id: 'sales',
    name: 'Sales',
    icon: Briefcase,
    color: '#F59E0B',
    gradient: 'from-amber-500 to-orange-700',
    description: 'Drive revenue and growth'
  },
  {
    id: 'operations',
    name: 'Operations',
    icon: Settings,
    color: '#6B7280',
    gradient: 'from-gray-500 to-gray-700',
    description: 'Keep everything running smoothly'
  }
];

export default function RoleSelector({ onRoleChange }) {
  const [currentRole, setCurrentRole] = useState('operations');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchCurrentRole = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userDocRef = doc(db, 'drafted-accounts', user.email.toLowerCase());
          const docSnap = await getDoc(userDocRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            setCurrentRole(data.assignedRole || 'operations');
          }
        } catch (error) {
          console.error('Failed to fetch current role:', error);
        }
      }
      setIsLoading(false);
    };

    fetchCurrentRole();
  }, []);

  const handleRoleSelect = async (roleId) => {
    if (roleId === currentRole) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    const user = auth.currentUser;
    
    if (user) {
      try {
        const userDocRef = doc(db, 'drafted-accounts', user.email.toLowerCase());
        await updateDoc(userDocRef, {
          assignedRole: roleId,
          roleAssignedAt: new Date(),
          roleAssignedBy: 'user'
        });
        
        setCurrentRole(roleId);
        setIsEditing(false);
        toast.success('Role updated successfully!', { duration: 3000 });

        if (onRoleChange) {
          onRoleChange(roleId);
        }
        
      } catch (error) {
        console.error('Failed to update role:', error);
        toast.error('Failed to update role. Please try again.');
      }
    }
    
    setIsSaving(false);
  };

  const currentRoleData = ROLE_CATEGORIES.find(r => r.id === currentRole) || ROLE_CATEGORIES[5];
  const IconComponent = currentRoleData.icon;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="w-5 h-5 border-2 border-drafted-green/30 border-t-drafted-green rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
          Your Role
        </h3>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-xs text-drafted-green hover:text-drafted-emerald transition-colors font-medium flex items-center gap-1"
          >
            <Edit2 className="w-3 h-3" />
            Edit
          </button>
        )}
      </div>

      {!isEditing ? (
        <button
          onClick={() => setIsEditing(true)}
          className={`w-full p-4 rounded-xl bg-gradient-to-br ${currentRoleData.gradient} hover:scale-[1.02] transition-all flex items-center gap-3 shadow-lg`}
          style={{ boxShadow: `0 8px 24px ${currentRoleData.color}30` }}
        >
          <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
            <IconComponent className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 text-left">
            <div className="text-white font-semibold">{currentRoleData.name}</div>
            <div className="text-white/80 text-xs">{currentRoleData.description}</div>
          </div>
          <Edit2 className="w-4 h-4 text-white/60" />
        </button>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-400">Choose your primary role</p>
            <button
              onClick={() => setIsEditing(false)}
              className="text-xs text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {ROLE_CATEGORIES.map((role) => {
              const RoleIcon = role.icon;
              const isSelected = role.id === currentRole;
              
              return (
                <button
                  key={role.id}
                  onClick={() => !isSaving && handleRoleSelect(role.id)}
                  disabled={isSaving}
                  className={`p-3 rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-drafted-green/10 border-drafted-green/30'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${role.gradient} flex items-center justify-center`}>
                      <RoleIcon className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-xs font-medium text-white">{role.name}</div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-drafted-green absolute top-2 right-2" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
