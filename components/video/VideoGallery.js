'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Play, Loader2 } from 'lucide-react';

// Example videos library - Firebase URLs for each question
const VIDEO_LIBRARY = {
  1: [
    {
      url: "https://firebasestorage.googleapis.com/v0/b/drafted-6c302.appspot.com/o/compressed_1731194584976.mp4?alt=media&token=3969100b-c055-4ef3-8a90-9b73f6e0c55d",
      title: "Leadership & Impact"
    },
    {
      url: "https://firebasestorage.googleapis.com/v0/b/drafted-6c302.appspot.com/o/qcho1.mp4?alt=media&token=0d8d02cc-c4e1-4158-8b35-85e76fc35773",
      title: "Creative Problem Solving"
    },
    {
      url: "https://firebasestorage.googleapis.com/v0/b/drafted-6c302.appspot.com/o/compressed_1726599845815.mp4?alt=media&token=80403126-6ec1-4246-af95-2882d67403e8",
      title: "Technical Excellence"
    },
    {
      url: "https://firebasestorage.googleapis.com/v0/b/drafted-6c302.appspot.com/o/user_recorded_video_1731551514302.mp4?alt=media&token=1e6273ac-93d3-40d2-971b-528a6440835d",
      title: "Team Collaboration"
    },
    {
      url: "https://firebasestorage.googleapis.com/v0/b/drafted-6c302.appspot.com/o/csaunde1.mp4?alt=media&token=b4d42ab6-9278-4ff6-aa88-382f74f45aef",
      title: "Innovation & Vision"
    }
  ],
  2: [
    {
      url: "https://firebasestorage.googleapis.com/v0/b/drafted-6c302.appspot.com/o/videos%2FHZ4DggpY5Yair95wb9PT3fYoGVh2%2Fvideo_1750280718350.mp4?alt=media&token=fb754a27-7d55-4663-a69e-77c37cf9d2fd",
      title: "Academic Journey"
    },
    {
      url: "https://firebasestorage.googleapis.com/v0/b/drafted-6c302.appspot.com/o/videos%2Femhstrong%2Fcompressed_1748466671194.mp4?alt=media&token=dfe03039-782e-4661-8645-aed1449edde4",
      title: "Career Transition"
    },
    {
      url: "https://firebasestorage.googleapis.com/v0/b/drafted-6c302.appspot.com/o/videos%2FJzPEAirmUVTPUojMEhoqdEH5q5x2%2Fvideo_1749065267235.mp4?alt=media&token=42feda4d-79c9-42d7-9dfa-571b0277f679",
      title: "Skills Development"
    },
    {
      url: "https://firebasestorage.googleapis.com/v0/b/drafted-6c302.appspot.com/o/videos%2FYzyBaI2Js4QquCQWu14vbIF0GAo2%2Fvideo_1749056515049.mp4?alt=media&token=dd3200ab-3b52-420a-9a67-c6ddb77bdd50",
      title: "Personal Growth"
    },
    {
      url: "https://firebasestorage.googleapis.com/v0/b/drafted-6c302.appspot.com/o/compressed_1747840868833.mp4?alt=media&token=9da3f740-6ce3-4d8f-9992-6ec3b1c3a227",
      title: "Professional Experience"
    }
  ],
  3: [
    {
      url: "https://firebasestorage.googleapis.com/v0/b/drafted-6c302.appspot.com/o/videos%2FxVtmHrNlqNSwW35wgKZVYBuHsha2%2Fvideo_1747940980820.mp4?alt=media&token=d38acd0e-64eb-4a4c-aa1d-795744a9528f",
      title: "Technical Challenge"
    },
    {
      url: "https://firebasestorage.googleapis.com/v0/b/drafted-6c302.appspot.com/o/user_recorded_video_1741792861178.mp4?alt=media&token=a7a4dcb6-580b-4150-8d6f-2467199e8236",
      title: "Leadership Under Pressure"
    },
    {
      url: "https://firebasestorage.googleapis.com/v0/b/drafted-6c302.appspot.com/o/videos%2FwgxR7uD4FDRG3dSn9HoRPq8pRd32%2Fvideo_1749055277450.mp4?alt=media&token=972aa325-eb41-4fac-85d3-1efd5f71878a",
      title: "Complex Problem Solving"
    },
    {
      url: "https://firebasestorage.googleapis.com/v0/b/drafted-6c302.appspot.com/o/user_recorded_video_1747833177747.mp4?alt=media&token=91bf4d37-9509-478f-95b9-4e645a1f71d4",
      title: "Team Conflict Resolution"
    },
    {
      url: "https://firebasestorage.googleapis.com/v0/b/drafted-6c302.appspot.com/o/videos%2FGQYF8kzU30ejWmJKvBoiuJUu8JV2%2Fvideo_1755250699549.mp4?alt=media&token=b13d785b-ca64-41ff-9506-9ceee9d450b9",
      title: "Innovation Project"
    }
  ]
};

// Video thumbnail component
const VideoThumbnail = ({ videoUrl, title, index, onVideoClick }) => {
  const [animated, setAnimated] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    const delay = (0.1 + (index * 0.1)) * 1000;
    const timer = setTimeout(() => setAnimated(true), delay);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <button
      onClick={onVideoClick}
      className={`relative aspect-video rounded-xl overflow-hidden bg-white/5 border border-white/10 transition-all duration-500 hover:scale-105 hover:border-drafted-green/50 group ${
        animated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      {/* Video thumbnail preview */}
      <video
        src={videoUrl}
        className="w-full h-full object-cover"
        muted
        playsInline
        preload="metadata"
        onLoadedMetadata={() => setVideoLoaded(true)}
      />
      
      {/* Loading state */}
      {!videoLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
          <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
        </div>
      )}
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-white text-sm font-medium truncate">{title}</p>
        </div>
      </div>
      
      {/* Play button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-drafted-green/90 flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-lg shadow-drafted-green/30">
          <Play className="w-5 h-5 text-white ml-0.5" fill="currentColor" />
        </div>
      </div>
    </button>
  );
};

// Main VideoGallery component
export default function VideoGallery({ questionNumber, onVideoClick }) {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const videos = VIDEO_LIBRARY[questionNumber] || [];

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleVideoClick = (video) => {
    onVideoClick?.(video.url);
    setSelectedVideo(video);
    setVideoLoading(true);
  };

  const handleClose = useCallback(() => {
    setSelectedVideo(null);
    setVideoLoading(false);
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && selectedVideo) {
        handleClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [selectedVideo, handleClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedVideo) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedVideo]);

  // Modal overlay
  const modal = mounted && selectedVideo ? createPortal(
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
      onClick={handleClose}
    >
      <div 
        className="relative w-full max-w-4xl rounded-2xl overflow-hidden bg-slate-900 border border-white/10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        {/* Loading state */}
        {videoLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900">
            <Loader2 className="w-10 h-10 text-drafted-green animate-spin mb-4" />
            <p className="text-gray-400">Loading video...</p>
          </div>
        )}
        
        {/* Video player */}
        <video
          src={selectedVideo.url}
          controls
          autoPlay
          className="w-full aspect-video"
          onCanPlay={() => setVideoLoading(false)}
          onError={() => setVideoLoading(false)}
        />
        
        {/* Video title */}
        <div className="p-4 bg-slate-900">
          <h3 className="text-lg font-semibold text-white">{selectedVideo.title}</h3>
          <p className="text-sm text-gray-400">Example video for Question {questionNumber}</p>
        </div>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <Play className="w-5 h-5 text-drafted-green" />
        Example Videos
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {videos.map((video, index) => (
          <VideoThumbnail
            key={`${questionNumber}-${index}`}
            videoUrl={video.url}
            title={video.title}
            index={index}
            onVideoClick={() => handleVideoClick(video)}
          />
        ))}
      </div>
      
      {modal}
    </div>
  );
}
