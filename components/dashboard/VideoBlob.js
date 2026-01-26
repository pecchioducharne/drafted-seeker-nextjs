'use client';

import React, { useState, useEffect } from "react";
import ReactPlayer from "react-player";
import { useRouter } from "next/navigation";
import { db, auth } from "../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Videocam, CheckCircle, ChevronLeft, ChevronRight } from "@mui/icons-material";
import Image from "next/image";

const VideoBlob = ({ major }) => {
  const router = useRouter();
  const [currentVideo, setCurrentVideo] = useState(0);
  const [videoUrls, setVideoUrls] = useState({
    video1: "",
    video2: "",
    video3: "",
  });
  const [videoMetadata, setVideoMetadata] = useState({
    video1: { isExternalLink: false },
    video2: { isExternalLink: false },
    video3: { isExternalLink: false },
  });

  const videoData = [
    { field: "video1", title: "What makes you stand out?", duration: "(30 seconds)" },
    { field: "video2", title: "What's your story?", duration: "(1 minute)" },
    { field: "video3", title: "Talk about a challenge or project", duration: "(1 minute)" },
  ];

  useEffect(() => {
    const fetchVideoData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, "drafted-accounts", user.email.toLowerCase());
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setVideoUrls({
            video1: userData.video1 || "",
            video2: userData.video2 || "",
            video3: userData.video3 || "",
          });
          
          setVideoMetadata({
            video1: { isExternalLink: userData.video1IsExternalLink || false },
            video2: { isExternalLink: userData.video2IsExternalLink || false },
            video3: { isExternalLink: userData.video3IsExternalLink || userData.isScreenRecordingLink || false },
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
    <div className="drafted-card liquid-glass">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Video Resume</h2>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span>{currentVideo + 1} / 3</span>
        </div>
      </div>

      {/* Video Player or Record Prompt */}
      <div className="relative aspect-video bg-black/50 rounded-xl overflow-hidden mb-6">
        {currentVideoUrl ? (
          isExternalLink ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <a
                href={currentVideoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="drafted-btn drafted-btn-primary"
              >
                View External Video
              </a>
            </div>
          ) : (
            <ReactPlayer
              url={currentVideoUrl}
              controls
              width="100%"
              height="100%"
              style={{ position: 'absolute', top: 0, left: 0 }}
            />
          )
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <Videocam sx={{ fontSize: 64, color: '#6b7280' }} />
            <p className="text-gray-400 text-center px-4">
              No video recorded yet
            </p>
          </div>
        )}
      </div>

      {/* Video Title */}
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-white mb-1">
          {currentVideoData.title}
        </h3>
        <p className="text-sm text-gray-400">{currentVideoData.duration}</p>
      </div>

      {/* Navigation & Actions */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => setCurrentVideo(Math.max(0, currentVideo - 1))}
          disabled={currentVideo === 0}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft />
        </button>

        <button
          onClick={() => handleRecordClick(currentVideo + 1)}
          className="flex-1 drafted-btn drafted-btn-primary flex items-center justify-center gap-2"
        >
          <Videocam />
          <span>{currentVideoUrl ? 'Re-record' : 'Record'} Video</span>
        </button>

        <button
          onClick={() => setCurrentVideo(Math.min(2, currentVideo + 1))}
          disabled={currentVideo === 2}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight />
        </button>
      </div>

      {/* Progress Indicators */}
      <div className="flex justify-center gap-2 mt-6">
        {[0, 1, 2].map((index) => (
          <button
            key={index}
            onClick={() => setCurrentVideo(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentVideo
                ? 'bg-drafted-green w-8'
                : videoUrls[videoData[index].field]
                ? 'bg-drafted-green/50'
                : 'bg-white/20'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default VideoBlob;
