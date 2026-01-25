'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Custom hook for screen recording with audio
 * Used for Video 3 (project/challenge demo)
 */
const useScreenRecorder = ({
  timeLimit = 180000, // Default 3 minutes for screen recordings
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

  // Cleanup function
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

  // Start screen capture preview
  const startPreview = useCallback(async () => {
    try {
      setError(null);

      // Get screen capture stream
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 },
          frameRate: { ideal: 30, max: 60 }
        },
        audio: true // Capture system audio if available
      });

      // Get microphone audio stream
      let audioStream = null;
      try {
        audioStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          },
          video: false
        });
      } catch (audioErr) {
        console.warn('Microphone access denied, recording without mic audio');
      }

      // Combine streams - screen video + mic audio
      const tracks = [
        ...displayStream.getVideoTracks(),
        ...(audioStream ? audioStream.getAudioTracks() : []),
        ...displayStream.getAudioTracks() // System audio if available
      ];

      const combinedStream = new MediaStream(tracks);
      
      streamRef.current = combinedStream;
      setStream(combinedStream);

      if (videoRef.current) {
        videoRef.current.srcObject = combinedStream;
      }

      setIsPreviewActive(true);

      // Handle when user stops sharing screen
      displayStream.getVideoTracks()[0].onended = () => {
        if (mediaRecorderRef.current?.state === 'recording') {
          stopRecording();
        } else {
          cleanup();
        }
      };

    } catch (err) {
      console.error('Screen capture failed:', err);

      let errorMessage = 'Unable to capture screen.';

      if (err.name === 'NotAllowedError') {
        errorMessage = 'Screen sharing was denied. Please allow screen capture.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No screen found to capture.';
      } else if (err.name === 'NotSupportedError') {
        errorMessage = 'Screen capture is not supported on this browser.';
      } else if (err.name === 'AbortError') {
        errorMessage = 'Screen capture was cancelled.';
      }

      setError(errorMessage);
      onError?.(errorMessage);
    }
  }, [onError, cleanup]);

  // Start screen recording
  const startRecording = useCallback(async () => {
    try {
      setError(null);

      // Use existing stream from preview, or get new one
      let mediaStream = streamRef.current;

      if (!mediaStream) {
        await startPreview();
        mediaStream = streamRef.current;
        
        if (!mediaStream) {
          throw new Error('Failed to initialize screen capture');
        }
      }

      // WebM works best for screen recordings
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
        ? 'video/webm;codecs=vp9,opus'
        : MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')
          ? 'video/webm;codecs=vp8,opus'
          : 'video/webm';

      const recorderOptions = {
        mimeType,
        videoBitsPerSecond: 2500000, // 2.5 Mbps for good quality screen recording
        audioBitsPerSecond: 128000
      };

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
      console.error('Screen recording failed:', err);
      
      let errorMessage = err.message || 'Failed to start screen recording.';
      setError(errorMessage);
      onError?.(errorMessage);
      cleanup();
    }
  }, [timeLimit, onRecordingComplete, onStartRecording, onError, cleanup, startTimer, startPreview]);

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
    videoRef
  };
};

export default useScreenRecorder;
