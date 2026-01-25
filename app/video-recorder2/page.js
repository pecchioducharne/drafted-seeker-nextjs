'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import LoadingScreen from '../../components/shared/LoadingScreen';
import DraftedVideoRecorder from '../../components/video/DraftedVideoRecorder';
import VideoGallery from '../../components/video/VideoGallery';
import ScriptTipsPanel from '../../components/video/ScriptTipsPanel';
import { ChevronRight, ChevronLeft, Sparkles, ArrowLeft, Check } from 'lucide-react';

const QUESTION_NUMBER = 2;
const TIME_LIMIT = 90000; // 90 seconds
const QUESTION_TEXT = "What's your story?";
const QUESTION_TIPS = "Share your journey - where you came from, what drives you, and where you're headed. Be authentic and personal.";

export default function VideoRecorder2() {
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
    if (profileData?.video2) {
      setVideoUrl(profileData.video2);
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

  // Check if video 1 is completed
  const video1Complete = !!profileData?.video1;

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
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${video1Complete ? 'bg-drafted-green' : 'bg-white/10'}`}>
                  {video1Complete ? <Check className="w-4 h-4 text-white" /> : <span className="text-gray-400 text-sm font-bold">1</span>}
                </div>
                <span className={video1Complete ? 'text-white' : 'text-gray-400'}>Stand Out</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-600" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-drafted-green flex items-center justify-center">
                  {videoRecorded ? <Check className="w-4 h-4 text-white" /> : <span className="text-white text-sm font-bold">2</span>}
                </div>
                <span className="text-white font-medium">Your Story</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-600" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <span className="text-gray-400 text-sm font-bold">3</span>
                </div>
                <span className="text-gray-400">Challenges</span>
              </div>
            </div>
            
            <div className="w-32" />
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
                  Question 2 of 3
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
                <h3 className="text-lg font-semibold text-white mb-4">Story Structure</h3>
                <ul className="space-y-3 text-sm text-gray-400">
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-drafted-green mt-2" />
                    <span><strong className="text-white">Beginning:</strong> Where you started, your background</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-drafted-green mt-2" />
                    <span><strong className="text-white">Middle:</strong> Key experiences that shaped you</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-drafted-green mt-2" />
                    <span><strong className="text-white">Now:</strong> Where you are today</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-drafted-green mt-2" />
                    <span><strong className="text-white">Future:</strong> Where you're headed</span>
                  </li>
                </ul>
              </div>
              
              {/* Navigation */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => router.push('/video-recorder1')}
                    className="drafted-btn drafted-btn-glass py-4 flex items-center justify-center gap-2"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Previous
                  </button>
                  <button
                    onClick={() => router.push('/video-recorder3')}
                    className="drafted-btn drafted-btn-primary py-4 flex items-center justify-center gap-2"
                  >
                    Next
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
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
