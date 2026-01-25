'use client';

import React from 'react';

const LoadingScreen = ({ message = "Loading your profile..." }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-drafted-main">
      <div className="drafted-bg-animated"></div>
      <div className="relative z-10 flex flex-col items-center gap-8">
        <div className="relative">
          <div className="absolute inset-0 bg-drafted-green/20 blur-3xl rounded-full"></div>
          <div className="relative text-6xl font-bold">
            <span className="text-white">drafted</span>
            <span className="text-drafted-green">.</span>
          </div>
        </div>
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-drafted-green border-r-drafted-green rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-300 text-base font-medium animate-pulse">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
