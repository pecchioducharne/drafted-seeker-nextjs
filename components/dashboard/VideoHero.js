'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { PlayCircle, Video } from 'lucide-react';

const videoData = [
  {
    id: 1,
    question: 'What makes you stand out?',
    description: 'Focus on your unique strengths and achievements',
    duration: '30 seconds',
    field: 'video1'
  },
  {
    id: 2,
    question: 'Tell us about a technical challenge',
    description: 'Share a specific example of problem-solving',
    duration: '60 seconds',
    field: 'video2'
  },
  {
    id: 3,
    question: 'Describe a project you\'re proud of',
    description: 'Highlight your best work and impact',
    duration: '60 seconds',
    field: 'video3'
  }
];

export default function VideoHero({ major }) {
  const router = useRouter();
  const [currentVideo, setCurrentVideo] = useState(0);
  const [videoUrls, setVideoUrls] = useState({
    video1: '',
    video2: '',
    video3: ''
  });
  const [videoMetadata, setVideoMetadata] = useState({
    video1: { isExternalLink: false },
    video2: { isExternalLink: false },
    video3: { isExternalLink: false }
  });

  useEffect(() => {
    const fetchVideoData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, 'drafted-accounts', user.email.toLowerCase());
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setVideoUrls({
            video1: userData.video1 || '',
            video2: userData.video2 || '',
            video3: userData.video3 || ''
          });
          
          setVideoMetadata({
            video1: { isExternalLink: userData.video1IsExternalLink || false },
            video2: { isExternalLink: userData.video2IsExternalLink || false },
            video3: { isExternalLink: userData.video3IsExternalLink || userData.isScreenRecordingLink || false }
          });
        }
      }
    };
    fetchVideoData();
  }, []);

  const handleRecordClick = (videoNumber) => {
    router.push(`/video-recorder${videoNumber}`);
  };

  const currentVideoData = videoData[currentVideo];
  const currentVideoUrl = videoUrls[currentVideoData.field];
  const isExternalLink = videoMetadata[currentVideoData.field]?.isExternalLink;

  return (
    <div className="liquid-glass rounded-2xl overflow-hidden">
      {/* Video Player - Full Width Hero */}
      <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-gray-800">
        {currentVideoUrl ? (
          isExternalLink ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <a
                href={currentVideoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-4 p-8 text-center hover:scale-105 transition-transform"
              >
                <PlayCircle className="w-20 h-20 text-drafted-green" />
                <div>
                  <p className="text-white font-semibold text-lg mb-2">
                    {currentVideoData.question}
                  </p>
                  <p className="text-drafted-green font-medium">
                    View External Video →
                  </p>
                </div>
              </a>
            </div>
          ) : (
            <video
              src={currentVideoUrl}
              controls
              className="w-full h-full object-cover"
              poster="/video-poster.jpg"
            >
              Your browser does not support the video tag.
            </video>
          )
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <Video className="w-16 h-16 sm:w-20 sm:h-20 text-gray-600 mb-4" />
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
              {currentVideoData.question}
            </h3>
            <p className="text-gray-400 text-sm sm:text-base mb-4">
              {currentVideoData.description}
            </p>
            <p className="text-gray-500 text-sm mb-6">
              {currentVideoData.duration}
            </p>
            <button
              onClick={() => handleRecordClick(currentVideo + 1)}
              className="drafted-btn drafted-btn-primary px-6 sm:px-8 py-3 flex items-center gap-2"
            >
              <Video className="w-5 h-5" />
              Record Video
            </button>
          </div>
        )}
      </div>

      {/* Video Controls & Info */}
      <div className="p-4 sm:p-6 bg-white/5 border-t border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-1">
              {currentVideoData.question}
            </h3>
            <p className="text-sm text-gray-400">
              {currentVideoData.description} • {currentVideoData.duration}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {currentVideoUrl ? (
              <button
                onClick={() => handleRecordClick(currentVideo + 1)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white text-sm font-medium transition-all whitespace-nowrap"
              >
                Re-record
              </button>
            ) : null}
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">
                {currentVideo + 1} / {videoData.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Video List - Stack View */}
      <div className="p-4 sm:p-6 pt-0">
        <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Video Resume
        </h4>
        <div className="space-y-2">
          {videoData.map((video, index) => {
            const hasVideo = videoUrls[video.field];
            const isActive = currentVideo === index;
            
            return (
              <button
                key={video.id}
                onClick={() => setCurrentVideo(index)}
                className={`w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-drafted-green/10 border border-drafted-green/30' 
                    : 'bg-white/5 hover:bg-white/10 border border-white/10'
                }`}
              >
                <div className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center ${
                  hasVideo ? 'bg-drafted-green/20' : 'bg-gray-700'
                }`}>
                  {hasVideo ? (
                    <PlayCircle className={`w-5 h-5 sm:w-6 sm:h-6 ${isActive ? 'text-drafted-green' : 'text-white'}`} />
                  ) : (
                    <Video className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
                  )}
                </div>
                
                <div className="flex-1 text-left min-w-0">
                  <p className={`font-medium text-sm sm:text-base truncate ${
                    isActive ? 'text-white' : 'text-gray-300'
                  }`}>
                    {video.question}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {hasVideo ? `Recorded • ${video.duration}` : `Not recorded • ${video.duration}`}
                  </p>
                </div>

                {hasVideo && isActive && (
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-drafted-green"></div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
