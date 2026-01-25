'use client';

import React from 'react';

const LoadingSpinner = ({ message = "Loading..." }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-bg-slate-900 to-bg-slate-800">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="text-5xl font-bold">
            <span className="text-white">drafted</span>
            <span className="text-drafted-green">.</span>
          </div>
        </div>
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-drafted-green rounded-full animate-spin"></div>
        </div>
        <p className="text-gray-300 text-sm font-medium">{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
