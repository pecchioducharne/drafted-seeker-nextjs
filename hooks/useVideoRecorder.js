'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Custom hook for video recording with camera preview
 * Handles camera stream, MediaRecorder, and timer functionality
 */
const useVideoRecorder = ({ 
  timeLimit = 60000, // Default 60 seconds in ms
  onRecordingComplete, 
  onStartRecording, 
  onStopRecording,
  onError 
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [error, setError] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [stream, setStream] = useState(null);
  const [isPreviewActive, setIsPreviewActive] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const videoRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  // Cleanup function - stops all tracks and clears timers
  const cleanup = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setStream(null);
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsPreviewActive(false);
  }, []);

  // Browser and device detection for optimal settings
  const getBrowserInfo = () => {
    const userAgent = navigator.userAgent;
    const isIOSSafari = /iPad|iPhone|iPod/.test(userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
    const isChrome = /Chrome/.test(userAgent);
    const isFirefox = /Firefox/.test(userAgent);
    
    return { isIOSSafari, isSafari, isChrome, isFirefox };
  };

  // Get optimal codec - prioritize MP4 for better recruiter playback
  const getOptimalCodec = () => {
    // Try MP4 first for maximum compatibility
    const mp4Codecs = [
      'video/mp4;codecs=h264,aac',
      'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
      'video/mp4;codecs="avc1.42E01E, mp4a.40.2"',
      'video/mp4'
    ];

    for (const codec of mp4Codecs) {
      if (MediaRecorder.isTypeSupported(codec)) {
        return codec;
      }
    }

    // Fallback to WebM
    const webmCodecs = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=h264,opus',
      'video/webm'
    ];

    for (const codec of webmCodecs) {
      if (MediaRecorder.isTypeSupported(codec)) {
        return codec;
      }
    }

    return 'video/webm';
  };

  // Get optimal camera constraints based on device
  const getOptimalConstraints = () => {
    const { isIOSSafari } = getBrowserInfo();
    
    return {
      video: {
        width: { ideal: isIOSSafari ? 720 : 1280, max: 1920 },
        height: { ideal: isIOSSafari ? 480 : 720, max: 1080 },
        frameRate: { ideal: isIOSSafari ? 24 : 30, max: 60 },
        facingMode: 'user'
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 44100
      }
    };
  };

  // Start countdown timer
  const startTimer = useCallback(() => {
    setTimeRemaining(timeLimit);
    
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 100;
        if (newTime <= 0) {
          clearInterval(timerRef.current);
          return 0;
        }
        return newTime;
      });
    }, 100);
  }, [timeLimit]);

  // Start camera preview without recording
  const startPreview = useCallback(async () => {
    try {
      setError(null);
      
      // Only get new stream if we don't have one
      if (!streamRef.current) {
        const constraints = getOptimalConstraints();
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        
        streamRef.current = mediaStream;
        setStream(mediaStream);
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }
      
      setIsPreviewActive(true);
      
    } catch (err) {
      console.error('Preview failed:', err);
      
      let errorMessage = 'Unable to access camera/microphone.';
      
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Please allow camera and microphone access to record.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No camera or microphone found on this device.';
      } else if (err.name === 'NotSupportedError') {
        errorMessage = 'Camera access is not supported on this browser.';
      } else if (err.name === 'OverconstrainedError') {
        // Try fallback with minimal constraints
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
          });
          streamRef.current = fallbackStream;
          setStream(fallbackStream);
          setIsPreviewActive(true);
          
          if (videoRef.current) {
            videoRef.current.srcObject = fallbackStream;
          }
          return;
        } catch (fallbackErr) {
          errorMessage = 'Camera access failed. Please check your device settings.';
        }
      }
      
      setError(errorMessage);
      onError?.(errorMessage);
    }
  }, [onError]);

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      setError(null);
      
      // Use existing stream from preview, or get new one
      let mediaStream = streamRef.current;
      
      if (!mediaStream) {
        const constraints = getOptimalConstraints();
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        
        streamRef.current = mediaStream;
        setStream(mediaStream);
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }

      // Get optimal codec
      const mimeType = getOptimalCodec();
      const { isSafari, isIOSSafari } = getBrowserInfo();
      const isMP4 = mimeType.includes('mp4');
      
      const recorderOptions = {
        mimeType,
        ...(isMP4 ? {
          videoBitsPerSecond: isIOSSafari ? 2000000 : 3000000,
          audioBitsPerSecond: 128000
        } : {
          videoBitsPerSecond: isSafari ? 1500000 : 2500000,
          audioBitsPerSecond: 128000
        })
      };

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(mediaStream, recorderOptions);
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setRecordedBlob(blob);
        setIsRecording(false);
        onRecordingComplete?.(blob);
        cleanup();
      };

      mediaRecorder.onerror = (event) => {
        const errorMsg = `Recording error: ${event.error?.message || 'Unknown error'}`;
        setError(errorMsg);
        onError?.(errorMsg);
        setIsRecording(false);
        cleanup();
      };

      mediaRecorderRef.current = mediaRecorder;
      
      // Start recording with 1 second chunks
      mediaRecorder.start(1000);
      setIsRecording(true);
      startTimer();
      onStartRecording?.();

      // Auto-stop after time limit
      if (timeLimit) {
        setTimeout(() => {
          if (mediaRecorder.state === 'recording') {
            stopRecording();
          }
        }, timeLimit);
      }

    } catch (err) {
      console.error('Recording failed:', err);
      
      let errorMessage = 'Unable to access camera/microphone.';
      
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Please allow camera and microphone access to record.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No camera or microphone found on this device.';
      } else if (err.name === 'NotSupportedError') {
        errorMessage = 'Video recording is not supported on this browser.';
      }
      
      setError(errorMessage);
      onError?.(errorMessage);
      cleanup();
    }
  }, [timeLimit, onRecordingComplete, onStartRecording, onError, cleanup, startTimer]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      onStopRecording?.();
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [onStopRecording]);

  // Reset recording state
  const resetRecording = useCallback(() => {
    setRecordedBlob(null);
    setError(null);
    setTimeRemaining(timeLimit);
    cleanup();
  }, [timeLimit, cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  // Format time for display (mm:ss)
  const formatTime = (ms) => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return {
    // State
    isRecording,
    recordedBlob,
    error,
    timeRemaining,
    formattedTime: formatTime(timeRemaining),
    stream,
    isPreviewActive,
    
    // Actions
    startPreview,
    startRecording,
    stopRecording,
    resetRecording,
    
    // Refs
    videoRef,
    
    // Utilities
    getCodecInfo: () => {
      const mimeType = getOptimalCodec();
      return {
        mimeType,
        isMP4: mimeType.includes('mp4'),
        isWebM: mimeType.includes('webm')
      };
    }
  };
};

export default useVideoRecorder;
