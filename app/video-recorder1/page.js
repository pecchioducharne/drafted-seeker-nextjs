'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import LoadingScreen from '../../components/shared/LoadingScreen';
import DraftedVideoRecorder from '../../components/video/DraftedVideoRecorder';
import VideoGallery from '../../components/video/VideoGallery';
import ScriptTipsPanel from '../../components/video/ScriptTipsPanel';
import QuestionExplainedModal from '../../components/video/QuestionExplainedModal';
import { ChevronRight, Sparkles, Play, ArrowLeft, Check, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const QUESTION_NUMBER = 1;
const TIME_LIMIT = 60000; // 60 seconds
const QUESTION_TEXT = "What makes you stand out?";
const QUESTION_TIPS = "Focus on your unique strengths, achievements, and what sets you apart from other candidates. Be specific with examples.";

export default function VideoRecorder1() {
  const router = useRouter();
  const { user, loading, profileData, updateProfileLocally } = useAuth();
  const [showScriptPanel, setShowScriptPanel] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
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

  const handleVideoUploaded = (url, transcriptionStarted = false) => {
    setVideoUrl(url);
    updateProfileLocally({ video1: url });

    // Show transcription status if started
    if (transcriptionStarted) {
      toast.success('Video uploaded! Transcription started in background...', {
        duration: 4000,
        icon: '🎤'
      });
    }

    if (profileData?.sharedOnLinkedIn) return;

    const email = user.email.toLowerCase();
    const profileLink = `https://recruiter.joindrafted.com/profile/${email}`;
    const message =
      `Hi everyone! 👋\n\n` +
      `I'm excited to share my Drafted profile, a platform where I created a video resume to showcase my skills, experiences, and personality in a whole new way.\n\n` +
      `🎥 One engaging video highlighting my journey\n` +
      `💼 Links to my LinkedIn, GitHub, and more\n\n` +
      `Check it out here: ${profileLink}\n\n` +
      `Drafted is changing how we connect with recruiters by making hiring more personal. Let's connect and redefine how we present ourselves professionally!\n\n` +
      `#VideoResume #Drafted`;
    const linkedinShareUrl =
      `https://www.linkedin.com/shareArticle?mini=true` +
      `&url=${encodeURIComponent(profileLink)}` +
      `&title=${encodeURIComponent('My Drafted Video Profile')}` +
      `&summary=${encodeURIComponent(message)}` +
      `&source=Drafted`;

    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-gray-900 border border-white/10 rounded-xl shadow-lg p-4 flex items-start gap-3`}>
        <Sparkles className="w-6 h-6 text-white flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white">Video saved!</p>
          <p className="text-sm text-gray-400 mt-0.5">Share your profile on LinkedIn to unlock recruiter access.</p>
          {transcriptionStarted && (
            <p className="text-xs text-gray-500 mt-1">🎤 Transcription in progress...</p>
          )}
          <button
            onClick={() => {
              window.open(linkedinShareUrl, '_blank');
              toast.dismiss(t.id);
            }}
            className="mt-3 text-sm font-medium text-drafted-green hover:text-drafted-emerald transition-colors"
          >
            Share on LinkedIn →
          </button>
        </div>
        <button onClick={() => toast.dismiss(t.id)} className="text-gray-500 hover:text-gray-300 flex-shrink-0">✕</button>
      </div>
    ), { duration: 8000 });
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
            
            {/* Progress Steps - Clickable Navigation */}
            <div className="hidden md:flex items-center gap-4">
              <button 
                onClick={() => router.push('/video-recorder1')}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <div className="w-8 h-8 rounded-full bg-drafted-green flex items-center justify-center">
                  {videoRecorded ? <Check className="w-4 h-4 text-white" /> : <span className="text-white text-sm font-bold">1</span>}
                </div>
                <span className="text-white font-medium">Stand Out</span>
              </button>
              <ChevronRight className="w-5 h-5 text-gray-600" />
              <button 
                onClick={() => router.push('/video-recorder2')}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <span className="text-gray-400 text-sm font-bold">2</span>
                </div>
                <span className="text-gray-400">Your Story</span>
              </button>
              <ChevronRight className="w-5 h-5 text-gray-600" />
              <button 
                onClick={() => router.push('/video-recorder3')}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <span className="text-gray-400 text-sm font-bold">3</span>
                </div>
                <span className="text-gray-400">Challenges</span>
              </button>
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
                <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-emerald-400 to-green-500 bg-clip-text text-transparent">
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
                  userEmail={user.email.toLowerCase()}
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
              {/* Question Explained Button */}
              <button
                onClick={() => setShowQuestionModal(true)}
                className="w-full drafted-card hover:bg-white/10 transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <HelpCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-white">Question Explained</h3>
                    <p className="text-sm text-gray-400">Pro tips for answering</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 ml-auto group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

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
      
      {/* Question Explained Modal */}
      <QuestionExplainedModal
        isOpen={showQuestionModal}
        onClose={() => setShowQuestionModal(false)}
        questionNumber={QUESTION_NUMBER}
      />

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
