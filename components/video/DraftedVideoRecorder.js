'use client';

import React, { useEffect, useState } from 'react';
import { 
  Video, VideoOff, Mic, MicOff, Circle, Square, 
  RefreshCw, Upload, Check, AlertCircle, Play, Loader2 
} from 'lucide-react';
import useVideoRecorder from '../../hooks/useVideoRecorder';

/**
 * DraftedVideoRecorder - Beautiful video recording component
 * Features camera preview, recording controls, and upload functionality
 */
export default function DraftedVideoRecorder({
  timeLimit = 60000, // in milliseconds
  videoNumber = 1,
  onVideoRecorded,
  onVideoUploaded,
  existingVideoUrl = null
}) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [showExistingVideo, setShowExistingVideo] = useState(!!existingVideoUrl);

  const {
    isRecording,
    recordedBlob,
    error,
    timeRemaining,
    formattedTime,
    stream,
    isPreviewActive,
    startPreview,
    startRecording,
    stopRecording,
    resetRecording,
    videoRef
  } = useVideoRecorder({
    timeLimit,
    onRecordingComplete: (blob) => {
      onVideoRecorded?.(blob);
    },
    onError: (err) => {
      console.error('Recording error:', err);
    }
  });

  // Auto-start preview when component mounts
  useEffect(() => {
    if (!recordedBlob && !existingVideoUrl) {
      startPreview();
    }
  }, []);

  // Calculate progress percentage for timer ring
  const progressPercent = ((timeLimit - timeRemaining) / timeLimit) * 100;

  // Handle upload
  const handleUpload = async () => {
    if (!recordedBlob) return;
    
    setIsUploading(true);
    setUploadError(null);
    
    try {
      // Dynamically import upload service to avoid SSR issues
      const { uploadVideoAndSave } = await import('../../lib/video/uploadService');
      const result = await uploadVideoAndSave(
        recordedBlob,
        // User email will be passed from parent
        'user@example.com', // This should come from auth context
        videoNumber,
        (progress) => setUploadProgress(progress)
      );
      
      onVideoUploaded?.(result.url);
      setIsUploading(false);
    } catch (err) {
      console.error('Upload failed:', err);
      setUploadError(err.message);
      setIsUploading(false);
    }
  };

  // Render recorded video preview
  if (recordedBlob) {
    const videoUrl = URL.createObjectURL(recordedBlob);
    
    return (
      <div className="space-y-6">
        {/* Recorded video preview */}
        <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-white/10">
          <video
            src={videoUrl}
            controls
            className="w-full aspect-video"
          />
          
          {/* Success badge */}
          <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/20 border border-green-500/30">
            <Check className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-400 font-medium">Recording complete</span>
          </div>
        </div>
        
        {/* Upload progress */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Uploading...</span>
              <span className="text-drafted-green font-medium">{uploadProgress}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-drafted-green to-drafted-emerald transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
        
        {/* Upload error */}
        {uploadError && (
          <div className="flex items-center gap-2 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-sm text-red-400">{uploadError}</span>
          </div>
        )}
        
        {/* Action buttons */}
        <div className="flex gap-4">
          <button
            onClick={resetRecording}
            className="flex-1 drafted-btn drafted-btn-glass py-4 flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Re-record
          </button>
          
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="flex-1 drafted-btn drafted-btn-primary py-4 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Save & Upload
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Render existing video if available
  if (showExistingVideo && existingVideoUrl) {
    return (
      <div className="space-y-6">
        <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-white/10">
          <video
            src={existingVideoUrl}
            controls
            className="w-full aspect-video"
          />
          
          <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-drafted-green/20 border border-drafted-green/30">
            <Check className="w-4 h-4 text-drafted-green" />
            <span className="text-sm text-drafted-green font-medium">Video saved</span>
          </div>
        </div>
        
        <button
          onClick={() => {
            setShowExistingVideo(false);
            startPreview();
          }}
          className="w-full drafted-btn drafted-btn-glass py-4 flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-5 h-5" />
          Record New Video
        </button>
      </div>
    );
  }

  // Render camera preview and recording controls
  return (
    <div className="space-y-6">
      {/* Video preview container */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-white/10">
        {/* Camera preview */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full aspect-video object-cover mirror-video"
          style={{ transform: 'scaleX(-1)' }} // Mirror for selfie view
        />
        
        {/* No camera overlay */}
        {!isPreviewActive && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900">
            <VideoOff className="w-16 h-16 text-gray-600 mb-4" />
            <p className="text-gray-400 mb-4">Camera not active</p>
            <button
              onClick={startPreview}
              className="drafted-btn drafted-btn-primary px-6 py-2"
            >
              Start Camera
            </button>
          </div>
        )}
        
        {/* Error overlay */}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 p-6">
            <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
            <p className="text-red-400 text-center mb-4">{error}</p>
            <button
              onClick={startPreview}
              className="drafted-btn drafted-btn-primary px-6 py-2"
            >
              Try Again
            </button>
          </div>
        )}
        
        {/* Recording indicator */}
        {isRecording && (
          <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/30 animate-pulse">
            <Circle className="w-3 h-3 text-red-500 fill-red-500" />
            <span className="text-sm text-red-400 font-medium">Recording</span>
          </div>
        )}
        
        {/* Timer display */}
        {isPreviewActive && (
          <div className="absolute top-4 right-4">
            <div className="relative w-20 h-20">
              {/* Background ring */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="4"
                />
                {/* Progress ring */}
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  fill="none"
                  stroke={isRecording ? '#ef4444' : '#4ade80'}
                  strokeWidth="4"
                  strokeDasharray={`${2 * Math.PI * 36}`}
                  strokeDashoffset={`${2 * Math.PI * 36 * (1 - progressPercent / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-100"
                />
              </svg>
              {/* Time display */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-lg font-bold ${isRecording ? 'text-red-400' : 'text-white'}`}>
                  {formattedTime}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Controls */}
      <div className="flex items-center justify-center gap-6">
        {!isRecording ? (
          <button
            onClick={startRecording}
            disabled={!isPreviewActive}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-red-500/30 transition-all hover:scale-105"
          >
            <Circle className="w-8 h-8 text-white fill-white" />
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 flex items-center justify-center shadow-lg shadow-red-500/30 transition-all hover:scale-105 animate-pulse"
          >
            <Square className="w-8 h-8 text-white fill-white" />
          </button>
        )}
      </div>
      
      {/* Instructions */}
      <div className="text-center">
        {!isRecording ? (
          <p className="text-gray-400">
            Click the red button to start recording. You have {Math.ceil(timeLimit / 1000)} seconds.
          </p>
        ) : (
          <p className="text-red-400">
            Recording... Click the stop button when you're done.
          </p>
        )}
      </div>
    </div>
  );
}
