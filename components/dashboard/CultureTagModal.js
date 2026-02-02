'use client';

import { useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CultureTagModal({ isOpen, tag, description, onClose }) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="relative w-full max-w-lg bg-gradient-to-br from-slate-900/95 to-slate-800/95 rounded-2xl shadow-2xl border border-white/10 pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Content */}
              <div className="p-8">
                {/* Purple gradient header with tag */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600/20 to-purple-500/20 border border-purple-600/30 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-purple-400" />
                    </div>
                    <h2 
                      className="text-3xl font-bold bg-gradient-to-br from-purple-400 via-purple-300 to-purple-500 bg-clip-text text-transparent"
                      style={{
                        textShadow: '0 0 20px rgba(168, 85, 247, 0.3)'
                      }}
                    >
                      {tag}
                    </h2>
                  </div>
                  
                  {/* Decorative line */}
                  <div className="h-1 w-full bg-gradient-to-r from-transparent via-purple-500/50 to-transparent rounded-full" />
                </div>

                {/* Description */}
                <div className="space-y-4">
                  <p className="text-gray-300 text-lg leading-relaxed">
                    {description}
                  </p>
                </div>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-white/10">
                  <button
                    onClick={onClose}
                    className="w-full drafted-btn drafted-btn-primary py-3"
                  >
                    Got it
                  </button>
                </div>
              </div>

              {/* Decorative glow effect */}
              <div 
                className="absolute -inset-[1px] bg-gradient-to-br from-purple-600/20 via-transparent to-purple-500/20 rounded-2xl -z-10 blur-xl"
                style={{
                  filter: 'blur(20px)'
                }}
              />
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
