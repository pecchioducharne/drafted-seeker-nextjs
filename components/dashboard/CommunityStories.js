'use client';

import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import ReactModal from 'react-modal';

const TOP_15_UNIVERSITIES = [
  'Princeton University', 'MIT', 'Harvard University', 'Stanford University',
  'Yale University', 'University of Pennsylvania', 'Duke University',
  'Brown University', 'Johns Hopkins University', 'Northwestern University',
  'Columbia University', 'University of Chicago', 'Cornell University',
  'University of Southern California', 'USC',
];

const getShortUniversity = (university) => {
  const shorts = {
    'Massachusetts Institute of Technology': 'MIT',
    'University of Pennsylvania': 'UPenn',
    'University of Southern California': 'USC',
    'University of California, Los Angeles': 'UCLA',
  };
  return shorts[university] || university;
};

const CommunityStories = ({ showJasonsStory = true, maxStories = 5 }) => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);

  useEffect(() => {
    fetchStories();
  }, []);

  useEffect(() => {
    if (stories.length > 1) {
      const interval = setInterval(() => {
        setCurrentStoryIndex(prev => (prev + 1) % stories.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [stories.length]);

  const fetchStories = async () => {
    try {
      const candidatesRef = collection(db, 'drafted-accounts');
      const snapshot = await getDocs(candidatesRef);
      
      const candidatesWithStories = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.storyLine && data.storyLine.trim() && data.university) {
          candidatesWithStories.push({
            story: data.storyLine,
            university: data.university,
            firstName: data.firstName,
            isTop15: TOP_15_UNIVERSITIES.some(top => 
              data.university?.toLowerCase().includes(top.toLowerCase())
            )
          });
        }
      });

      const top15Stories = candidatesWithStories.filter(c => c.isTop15);
      const otherStories = candidatesWithStories.filter(c => !c.isTop15);
      
      const shuffledTop15 = top15Stories.sort(() => Math.random() - 0.5);
      const shuffledOthers = otherStories.sort(() => Math.random() - 0.5);
      
      const finalStories = [...shuffledTop15, ...shuffledOthers].slice(0, maxStories);
      setStories(finalStories);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stories:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="drafted-card animate-pulse">
        <div className="h-32 bg-white/5 rounded-lg"></div>
      </div>
    );
  }

  const currentStory = stories[currentStoryIndex];

  return (
    <>
      <div className="drafted-card">
        {showJasonsStory && (
          <div className="mb-6 pb-6 border-b border-white/10">
            <h3 className="text-lg font-semibold text-white mb-3">Success Story</h3>
            <div
              onClick={() => setShowVideoModal(true)}
              className="relative aspect-video bg-black/50 rounded-xl overflow-hidden cursor-pointer group"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent group-hover:from-black/40 transition-all"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-drafted-green/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-white border-b-8 border-b-transparent ml-1"></div>
                </div>
              </div>
              <p className="absolute bottom-4 left-4 text-white font-semibold">
                How Jason got hired at Google
              </p>
            </div>
          </div>
        )}

        {stories.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Students on Drafted</h3>
            <div className="p-4 bg-white/5 rounded-lg border border-white/10 min-h-[100px]">
              <p className="text-gray-300 text-sm leading-relaxed mb-3">
                "{currentStory?.story}"
              </p>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  {currentStory?.firstName} • {getShortUniversity(currentStory?.university)}
                </p>
                <div className="flex gap-1">
                  {stories.map((_, index) => (
                    <div
                      key={index}
                      className={`w-1 h-1 rounded-full transition-all ${
                        index === currentStoryIndex ? 'bg-drafted-green w-1.5 h-1.5' : 'bg-white/25'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Jason's Story Video Modal */}
      <ReactModal
        isOpen={showVideoModal}
        onRequestClose={() => setShowVideoModal(false)}
        className="max-w-4xl mx-auto mt-10 bg-black rounded-2xl overflow-hidden shadow-2xl"
        overlayClassName="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[99999999] overflow-y-auto p-5"
      >
        <div className="relative aspect-video">
          <iframe
            width="100%"
            height="100%"
            src="https://www.youtube.com/embed/dQw4w9WgXcQ"
            title="Jason's Success Story"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          ></iframe>
        </div>
        <button
          onClick={() => setShowVideoModal(false)}
          className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all"
        >
          ✕
        </button>
      </ReactModal>
    </>
  );
};

export default CommunityStories;
