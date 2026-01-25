'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, Zap, RefreshCw, CheckCircle, Loader2, ChevronRight, PenLine } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

/**
 * ScriptTipsPanel - AI-powered personalized script generation
 * Generates talking points based on user profile and question
 */
export default function ScriptTipsPanel({
  isOpen,
  onClose,
  userData,
  questionNumber,
  questionText,
  questionTips
}) {
  const [scriptTips, setScriptTips] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userNotes, setUserNotes] = useState('');
  const textareaRef = useRef(null);

  // Format experience data for the prompt
  const formatExperienceForPrompt = (experience) => {
    if (!experience || !Array.isArray(experience) || experience.length === 0) {
      return "No prior experience listed.";
    }

    return experience.map((exp, index) => (
      `Experience ${index + 1}:
      - Company: ${exp.companyName || 'Unknown'}
      - Role: ${exp.role || 'Unknown'}
      - Date: ${exp.date || 'Unknown'}
      - Description: ${exp.jobDescription || 'No description provided'}`
    )).join('\n\n');
  };

  // Generate personalized script tips via OpenAI
  const generateScriptTips = useCallback(async () => {
    if (!userData) return;

    setIsLoading(true);
    setError(null);

    try {
      const experienceText = formatExperienceForPrompt(userData.experience);
      const hasExperience = experienceText !== "No prior experience listed.";

      const systemMessage = hasExperience
        ? "You are a career coach who creates concise, specific talking points for video interviews. Format with bullet points (•). Create two sections: directive-style overview bullets and detailed script bullets. Never include headers or section titles in your response."
        : "You are a career coach who creates concise, specific talking points for video interviews. Since this candidate has limited professional experience, focus heavily on their academic background, major, and university. Format with bullet points (•). Create two sections: directive-style overview bullets and detailed script bullets. Never include headers or section titles in your response.";

      const prompt = `
      Create script points for a student to use when recording a 90-second video answer to: "${questionText}"

      I need two sections:
      
      1. First, provide 4 concise, directive-style bullet points that tell the candidate what to highlight from their background.
      
      2. Then, provide 4 detailed script bullet points that expand on those key points and could be used verbatim in the video.
      
      Format each point with a bullet (•) at the start of each line.
      
      After the first section, include the text "===SCRIPT BULLETS===" as a section divider.

      Candidate Information:
      - Name: ${userData.firstName || ''} ${userData.lastName || ''}
      - University: ${userData.university || 'Unknown'}
      - Major: ${userData.major || 'Unknown'}
      - Graduation: ${userData.graduationMonth || ''} ${userData.graduationYear || ''}
      
      ${experienceText}

      Question Tips from the platform:
      ${questionTips || 'Be authentic and highlight your unique experiences.'}

      IMPORTANT: Do NOT include any headings, labels, or titles. Each section should start directly with the bullet points.
      `;

      // Call Netlify function for OpenAI
      const response = await fetch('/.netlify/functions/askOpenAI', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemMessage,
          prompt,
          model: "gpt-3.5-turbo"
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate script tips');
      }

      const result = await response.json();
      const content = result.content;

      // Parse response
      let cleanResponse = content
        .replace(/^['"]|['"]$/g, '')
        .replace(/\\n/g, '\n')
        .replace(/["""]/g, '');

      const sections = cleanResponse.split("===SCRIPT BULLETS===");

      if (sections.length !== 2) {
        throw new Error("Invalid response format");
      }

      const [directiveSection, scriptSection] = sections;

      const directives = directiveSection
        .split("•")
        .map(b => b.trim())
        .filter(b => b.length);

      const scriptBullets = scriptSection
        .split("•")
        .map(b => b.trim())
        .filter(b => b.length);

      // Cache in Firestore
      if (userData.email) {
        const docRef = doc(db, "drafted-accounts", userData.email);
        await setDoc(docRef, {
          scripts: {
            [`video${questionNumber}`]: { directives, scriptBullets }
          }
        }, { merge: true });
      }

      // Format for display
      const formatted = `
        <div class="space-y-1 mb-6">
          ${directives.map(d => `<div class="text-white font-medium">• ${d}</div>`).join('')}
        </div>
        <div class="text-sm text-gray-400 mb-2">Script Bullets:</div>
        <div class="space-y-2">
          ${scriptBullets.map(b => `<div class="text-gray-300">• ${b}</div>`).join('')}
        </div>
      `;
      setScriptTips(formatted);

    } catch (err) {
      console.error("Error generating script tips:", err);
      setError("Failed to generate personalized tips. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [userData, questionNumber, questionText, questionTips]);

  // Fetch cached tips or generate new ones
  useEffect(() => {
    const fetchCachedTips = async () => {
      if (!isOpen || !userData || isLoading || scriptTips) return;

      if (userData.email) {
        const docRef = doc(db, "drafted-accounts", userData.email);
        const docSnap = await getDoc(docRef);
        const scriptData = docSnap.exists() && docSnap.data().scripts?.[`video${questionNumber}`];

        if (scriptData) {
          const formatted = `
            <div class="space-y-1 mb-6">
              ${scriptData.directives.map(d => `<div class="text-white font-medium">• ${d}</div>`).join('')}
            </div>
            <div class="text-sm text-gray-400 mb-2">Script Bullets:</div>
            <div class="space-y-2">
              ${scriptData.scriptBullets.map(b => `<div class="text-gray-300">• ${b}</div>`).join('')}
            </div>
          `;
          setScriptTips(formatted);
        } else {
          generateScriptTips();
        }
      } else {
        generateScriptTips();
      }
    };

    fetchCachedTips();
  }, [isOpen, userData, questionNumber, isLoading, scriptTips, generateScriptTips]);

  // Load saved notes
  useEffect(() => {
    if (isOpen) {
      const savedNotes = localStorage.getItem(`notes_q${questionNumber}`);
      if (savedNotes) {
        setUserNotes(savedNotes);
      }
    }
  }, [isOpen, questionNumber]);

  // Save notes when they change
  useEffect(() => {
    if (userNotes.trim() !== '') {
      localStorage.setItem(`notes_q${questionNumber}`, userNotes);
    }
  }, [userNotes, questionNumber]);

  // Focus textarea when tips load
  useEffect(() => {
    if (scriptTips && !isLoading && textareaRef.current) {
      setTimeout(() => textareaRef.current.focus(), 500);
    }
  }, [scriptTips, isLoading]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-slate-900 border-l border-white/10 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-drafted-green to-drafted-emerald flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Script Ideas</h2>
            <p className="text-sm text-gray-400">Personalized for you</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 text-drafted-green animate-spin mb-4" />
            <p className="text-gray-400">Creating personalized script points...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={generateScriptTips}
              className="drafted-btn drafted-btn-primary px-6 py-2"
            >
              Try Again
            </button>
          </div>
        ) : scriptTips ? (
          <div className="space-y-6">
            <div 
              className="prose prose-invert prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: scriptTips }} 
            />

            {/* User notes */}
            <div className="pt-6 border-t border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <PenLine className="w-4 h-4 text-drafted-green" />
                <h3 className="text-sm font-semibold text-white">Your Notes</h3>
              </div>
              <textarea
                ref={textareaRef}
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                placeholder="Add your own talking points..."
                rows={4}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-drafted-green/50 resize-none"
              />
            </div>
          </div>
        ) : null}
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <CheckCircle className="w-4 h-4 text-drafted-green" />
            <span>For {userData?.firstName || 'you'}</span>
          </div>
          <button
            onClick={generateScriptTips}
            disabled={isLoading}
            className="flex items-center gap-2 text-sm text-drafted-green hover:text-drafted-emerald transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Generate New
          </button>
        </div>
      </div>
    </div>
  );
}
