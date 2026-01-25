'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import LoadingScreen from '../../components/shared/LoadingScreen';
import DraftedVideoRecorder from '../../components/video/DraftedVideoRecorder';
import VideoGallery from '../../components/video/VideoGallery';
import ScriptTipsPanel from '../../components/video/ScriptTipsPanel';
import { ChevronRight, Sparkles, Play, ArrowLeft, Check } from 'lucide-react';

const QUESTION_NUMBER = 1;
const TIME_LIMIT = 60000; // 60 seconds
const QUESTION_TEXT = "What makes you stand out?";
const QUESTION_TIPS = "Focus on your unique strengths, achievements, and what sets you apart from other candidates. Be specific with examples.";

export default function VideoRecorder1() {
  const router = useRouter();
  const { user, loading, profileData } = useAuth();
  const [showScriptPanel, setShowScriptPanel] = useState(false);
  const [videoRecorded, setVideoRecorded] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Check for existing video
  useEffect(() => {
    if (profileData?.video1) {
      setVideoUrl(profileData.video1);
      setVideoRecorded(true);
    }
  }, [profileData]);

  if (loading || !user) {
    return <LoadingScreen message="Loading video recorder..." />;
  }

  const handleVideoRecorded = (blob) => {
    console.log('Video recorded:', blob);
    setVideoRecorded(true);
  };

  const handleVideoUploaded = (url) => {
    console.log('Video uploaded:', url);
    setVideoUrl(url);
  };

  return (
    <div className="drafted-background min-h-screen">
      <div className="drafted-bg-animated"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </button>
            
            {/* Progress Steps */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-drafted-green flex items-center justify-center">
                  {videoRecorded ? <Check className="w-4 h-4 text-white" /> : <span className="text-white text-sm font-bold">1</span>}
                </div>
                <span className="text-white font-medium">Stand Out</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-600" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <span className="text-gray-400 text-sm font-bold">2</span>
                </div>
                <span className="text-gray-400">Your Story</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-600" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <span className="text-gray-400 text-sm font-bold">3</span>
                </div>
                <span className="text-gray-400">Challenges</span>
              </div>
            </div>
            
            <div className="w-32" /> {/* Spacer for alignment */}
          </div>
        </div>
        
        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-6 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Question & Recorder */}
            <div className="lg:col-span-2 space-y-8">
              {/* Question */}
              <div className="text-center lg:text-left">
                <span className="inline-block px-3 py-1 rounded-full bg-drafted-green/10 text-drafted-green text-sm font-medium mb-4">
                  Question 1 of 3
                </span>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  {QUESTION_TEXT}
                </h1>
                <p className="text-lg text-gray-400 max-w-2xl">
                  {QUESTION_TIPS}
                </p>
              </div>
              
              {/* Video Recorder */}
              <div className="drafted-card">
                <DraftedVideoRecorder
                  timeLimit={TIME_LIMIT}
                  videoNumber={QUESTION_NUMBER}
                  onVideoRecorded={handleVideoRecorded}
                  onVideoUploaded={handleVideoUploaded}
                  existingVideoUrl={videoUrl}
                />
              </div>
              
              {/* Example Videos */}
              <div className="drafted-card">
                <VideoGallery 
                  questionNumber={QUESTION_NUMBER}
                  onVideoClick={(url) => console.log('Playing example:', url)}
                />
              </div>
            </div>
            
            {/* Right Column - Script Tips & Actions */}
            <div className="space-y-6">
              {/* Generate Script Tips Button */}
              <button
                onClick={() => setShowScriptPanel(true)}
                className="w-full drafted-card hover:bg-white/10 transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-drafted-green to-drafted-emerald flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-white">Generate Script Tips</h3>
                    <p className="text-sm text-gray-400">AI-powered talking points</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 ml-auto group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
              
              {/* Tips Card */}
              <div className="drafted-card">
                <h3 className="text-lg font-semibold text-white mb-4">Recording Tips</h3>
                <ul className="space-y-3 text-sm text-gray-400">
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-drafted-green mt-2" />
                    <span>Look directly at the camera, not at yourself</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-drafted-green mt-2" />
                    <span>Find a quiet space with good lighting</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-drafted-green mt-2" />
                    <span>Speak clearly and at a natural pace</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-drafted-green mt-2" />
                    <span>Be specific with examples from your experience</span>
                  </li>
                </ul>
              </div>
              
              {/* Navigation */}
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/video-recorder2')}
                  className="w-full drafted-btn drafted-btn-primary py-4 flex items-center justify-center gap-2"
                >
                  Next Question
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="w-full drafted-btn drafted-btn-glass py-4"
                >
                  Save & Exit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Script Tips Panel */}
      <ScriptTipsPanel
        isOpen={showScriptPanel}
        onClose={() => setShowScriptPanel(false)}
        userData={profileData}
        questionNumber={QUESTION_NUMBER}
        questionText={QUESTION_TEXT}
        questionTips={QUESTION_TIPS}
      />
    </div>
  );
}
