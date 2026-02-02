'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import LoadingScreen from '../../components/shared/LoadingScreen';
import DraftedVideoRecorder from '../../components/video/DraftedVideoRecorder';
import VideoGallery from '../../components/video/VideoGallery';
import ScriptTipsPanel from '../../components/video/ScriptTipsPanel';
import QuestionExplainedModal from '../../components/video/QuestionExplainedModal';
import useScreenRecorder from '../../hooks/useScreenRecorder';
import { 
  ChevronRight, ChevronLeft, Sparkles, ArrowLeft, Check, 
  Video, Monitor, Link2, Upload, HelpCircle 
} from 'lucide-react';
import toast from 'react-hot-toast';

const QUESTION_NUMBER = 3;
const TIME_LIMIT = 90000; // 90 seconds
const QUESTION_OPTIONS = [
  "Talk about a challenge you've overcome",
  "Walk us through something you've built"
];
const QUESTION_TIPS = [
  "Share a specific challenge - technical, personal, or academic. Explain the situation, what you did, and what you learned.",
  "Describe a project you've created. Explain your process, the technologies used, and the impact it had."
];

export default function VideoRecorder3() {
  const router = useRouter();
  const { user, loading, profileData } = useAuth();
  const [showScriptPanel, setShowScriptPanel] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [videoRecorded, setVideoRecorded] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [recordingMode, setRecordingMode] = useState('camera'); // 'camera', 'screen', 'link'
  const [externalLink, setExternalLink] = useState('');
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0); // Toggle between two questions

  // Screen recording hook
  const screenRecorder = useScreenRecorder({
    timeLimit: 180000, // 3 minutes for screen recordings
    onRecordingComplete: (blob) => {
      console.log('Screen recording complete:', blob);
      setVideoRecorded(true);
    }
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Check for existing video
  useEffect(() => {
    if (profileData?.video3) {
      setVideoUrl(profileData.video3);
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
    console.log('Video uploaded:', url);
    setVideoUrl(url);
    
    // Show transcription status if started
    if (transcriptionStarted) {
      toast.success('Video uploaded! Transcription started in background...', {
        duration: 4000,
        icon: '🎤'
      });
    }
  };

  // Check completion status
  const video1Complete = !!profileData?.video1;
  const video2Complete = !!profileData?.video2;

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
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${video1Complete ? 'bg-drafted-green' : 'bg-white/10'}`}>
                  {video1Complete ? <Check className="w-4 h-4 text-white" /> : <span className="text-gray-400 text-sm font-bold">1</span>}
                </div>
                <span className={video1Complete ? 'text-white' : 'text-gray-400'}>Stand Out</span>
              </button>
              <ChevronRight className="w-5 h-5 text-gray-600" />
              <button 
                onClick={() => router.push('/video-recorder2')}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${video2Complete ? 'bg-drafted-green' : 'bg-white/10'}`}>
                  {video2Complete ? <Check className="w-4 h-4 text-white" /> : <span className="text-gray-400 text-sm font-bold">2</span>}
                </div>
                <span className={video2Complete ? 'text-white' : 'text-gray-400'}>Your Story</span>
              </button>
              <ChevronRight className="w-5 h-5 text-gray-600" />
              <button 
                onClick={() => router.push('/video-recorder3')}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <div className="w-8 h-8 rounded-full bg-drafted-green flex items-center justify-center">
                  {videoRecorded ? <Check className="w-4 h-4 text-white" /> : <span className="text-white text-sm font-bold">3</span>}
                </div>
                <span className="text-white font-medium">Challenges</span>
              </button>
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
                  Question 3 of 3 - Final Question
                </span>
                
                {/* Question Toggle */}
                <div className="flex gap-2 mb-4 justify-center lg:justify-start">
                  {QUESTION_OPTIONS.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedQuestionIndex(index)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedQuestionIndex === index
                          ? 'bg-drafted-green text-white'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {index === 0 ? 'Challenge' : 'Project'}
                    </button>
                  ))}
                </div>

                <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-emerald-400 to-green-500 bg-clip-text text-transparent">
                  {QUESTION_OPTIONS[selectedQuestionIndex]}
                </h1>
                <p className="text-lg text-gray-400 max-w-2xl">
                  {QUESTION_TIPS[selectedQuestionIndex]}
                </p>
              </div>
              
              {/* Recording Mode Selector */}
              <div className="drafted-card">
                <h3 className="text-lg font-semibold text-white mb-4">Recording Type</h3>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setRecordingMode('camera')}
                    className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                      recordingMode === 'camera'
                        ? 'bg-drafted-green/10 border-drafted-green/30 text-drafted-green'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    <Video className="w-6 h-6" />
                    <span className="text-sm font-medium">Camera</span>
                  </button>
                  <button
                    onClick={() => setRecordingMode('screen')}
                    className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                      recordingMode === 'screen'
                        ? 'bg-drafted-green/10 border-drafted-green/30 text-drafted-green'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    <Monitor className="w-6 h-6" />
                    <span className="text-sm font-medium">Screen</span>
                  </button>
                  <button
                    onClick={() => setRecordingMode('link')}
                    className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                      recordingMode === 'link'
                        ? 'bg-drafted-green/10 border-drafted-green/30 text-drafted-green'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    <Link2 className="w-6 h-6" />
                    <span className="text-sm font-medium">External Link</span>
                  </button>
                </div>
              </div>
              
              {/* Video Recorder / Screen Recorder / Link Input */}
              <div className="drafted-card">
                {recordingMode === 'camera' && (
                  <DraftedVideoRecorder
                    timeLimit={TIME_LIMIT}
                    videoNumber={QUESTION_NUMBER}
                    userEmail={user.email.toLowerCase()}
                    onVideoRecorded={handleVideoRecorded}
                    onVideoUploaded={handleVideoUploaded}
                    existingVideoUrl={videoUrl}
                  />
                )}
                
                {recordingMode === 'screen' && (
                  <div className="space-y-6">
                    {/* Screen recording preview */}
                    <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-white/10 aspect-video flex items-center justify-center">
                      {screenRecorder.isPreviewActive ? (
                        <video
                          ref={screenRecorder.videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="text-center p-8">
                          <Monitor className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                          <p className="text-gray-400 mb-2">Share your screen to demo a project or walk through a challenge</p>
                          <p className="text-sm text-gray-500 mb-4">Recording will start automatically once you share</p>
                          <button
                            onClick={screenRecorder.startPreview}
                            className="drafted-btn drafted-btn-primary px-6 py-2"
                          >
                            Share Screen & Start Recording
                          </button>
                        </div>
                      )}
                      
                      {/* Recording indicator */}
                      {screenRecorder.isRecording && (
                        <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/30 animate-pulse">
                          <div className="w-3 h-3 rounded-full bg-red-500" />
                          <span className="text-sm text-red-400 font-medium">
                            Recording {screenRecorder.formattedTime}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Screen recording controls - only show stop button while recording */}
                    {screenRecorder.isRecording && !screenRecorder.recordedBlob && (
                      <div className="flex flex-col items-center gap-3">
                        <button
                          onClick={screenRecorder.stopRecording}
                          className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 flex items-center justify-center shadow-lg shadow-red-500/30 animate-pulse"
                        >
                          <div className="w-6 h-6 rounded bg-white" />
                        </button>
                        <p className="text-sm text-gray-400">Click to stop recording</p>
                      </div>
                    )}
                    
                    {/* Screen recording preview */}
                    {screenRecorder.recordedBlob && (
                      <div className="space-y-4">
                        <video
                          src={URL.createObjectURL(screenRecorder.recordedBlob)}
                          controls
                          className="w-full rounded-xl"
                        />
                        <div className="flex gap-4">
                          <button
                            onClick={screenRecorder.resetRecording}
                            className="flex-1 drafted-btn drafted-btn-glass py-3"
                          >
                            Re-record
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                const { uploadScreenRecording } = await import('../../lib/video/uploadService');
                                const result = await uploadScreenRecording(screenRecorder.recordedBlob, user.email.toLowerCase());
                                if (result?.url) {
                                  handleVideoUploaded(result.url);
                                }
                              } catch (err) {
                                console.error('Screen recording upload failed:', err);
                              }
                            }}
                            className="flex-1 drafted-btn drafted-btn-primary py-3 flex items-center justify-center gap-2"
                          >
                            <Upload className="w-5 h-5" />
                            Save & Upload
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {recordingMode === 'link' && (
                  <div className="space-y-6">
                    <div className="text-center p-8 border border-dashed border-white/10 rounded-xl">
                      <Link2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400 mb-6">
                        Paste a link to your Loom, YouTube, or other video
                      </p>
                      <input
                        type="url"
                        value={externalLink}
                        onChange={(e) => setExternalLink(e.target.value)}
                        placeholder="https://www.loom.com/share/..."
                        className="w-full max-w-md px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-drafted-green/50"
                      />
                    </div>
                    {externalLink && (
                      <button
                        onClick={async () => {
                          try {
                            const { doc, updateDoc } = await import('firebase/firestore');
                            const { db } = await import('../../lib/firebase');
                            const userDocRef = doc(db, 'drafted-accounts', user.email.toLowerCase());
                            await updateDoc(userDocRef, {
                              video3: externalLink,
                              video3IsExternalLink: true
                            });
                            handleVideoUploaded(externalLink);
                          } catch (err) {
                            console.error('Failed to save external link:', err);
                          }
                        }}
                        className="w-full drafted-btn drafted-btn-primary py-3"
                      >
                        Save Link
                      </button>
                    )}
                  </div>
                )}
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
                  className="w-full drafted-btn drafted-btn-glass py-4 flex items-center justify-center gap-2"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Previous Question
                </button>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="w-full drafted-btn drafted-btn-primary py-4 flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Complete & Return to Dashboard
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
        selectedOption={selectedQuestionIndex}
      />

      {/* Script Tips Panel */}
      <ScriptTipsPanel
        isOpen={showScriptPanel}
        onClose={() => setShowScriptPanel(false)}
        userData={profileData}
        questionNumber={QUESTION_NUMBER}
        questionText={QUESTION_OPTIONS[selectedQuestionIndex]}
        questionTips={QUESTION_TIPS[selectedQuestionIndex]}
      />
    </div>
  );
}
