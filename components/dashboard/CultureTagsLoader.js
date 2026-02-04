'use client';

import { motion } from 'framer-motion';

export default function CultureTagsLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      {/* Spinning gradient disc */}
      <motion.div
        className="relative w-16 h-16"
        animate={{ rotate: 360 }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        {/* Outer glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-600/30 to-purple-500/30 blur-xl"></div>
        
        {/* Spinning disc */}
        <div className="relative w-full h-full rounded-full bg-gradient-to-br from-purple-600 to-purple-500 shadow-[0_0_20px_rgba(147,51,234,0.6)]">
          {/* Inner highlight */}
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-purple-400/40 to-transparent"></div>
          
          {/* Cut-out section to make it look like it's loading */}
          <div className="absolute top-0 right-0 w-4 h-4 bg-gray-900 rounded-full transform translate-x-1 -translate-y-1"></div>
        </div>
      </motion.div>

      {/* Animated text */}
      <div className="text-center">
        <motion.h3
          className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          Generating Culture Tags...
        </motion.h3>
        <p className="text-sm text-gray-400 mt-2">
          Analyzing your video transcripts
        </p>
      </div>

      {/* Animated dots */}
      <div className="flex gap-2">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-gradient-to-br from-purple-600 to-purple-500"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 1, 0.3]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden mt-2">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-600 via-purple-500 to-purple-400"
          animate={{
            x: ['-100%', '100%']
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ width: '50%' }}
        />
      </div>
    </div>
  );
}
