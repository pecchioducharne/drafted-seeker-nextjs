'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CultureTagModal from './CultureTagModal';

export default function CultureTags({ tags = [], descriptions = [] }) {
  const [selectedTag, setSelectedTag] = useState(null);
  const [selectedDescription, setSelectedDescription] = useState('');

  const handleTagClick = (tag, description) => {
    setSelectedTag(tag);
    setSelectedDescription(description);
  };

  const handleCloseModal = () => {
    setSelectedTag(null);
    setSelectedDescription('');
  };

  if (!tags || tags.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-sm">No culture tags yet. Complete your video profile to generate tags!</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap gap-3">
        <AnimatePresence mode="popLayout">
          {tags.map((tag, index) => (
            <motion.button
              key={tag}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              onClick={() => handleTagClick(tag, descriptions[index])}
              className="
                bg-gradient-to-br from-purple-600/90 to-purple-500/90
                text-white px-4 py-2 rounded-2xl
                text-sm font-semibold cursor-pointer
                transition-all duration-300
                border border-purple-600/40
                hover:translate-y-[-2px]
                hover:brightness-110
                shadow-[0_0_10px_rgba(147,51,234,0.3),inset_0_0_5px_rgba(255,255,255,0.2)]
                hover:shadow-[0_0_15px_rgba(147,51,234,0.6),0_0_30px_rgba(168,85,247,0.4)]
                active:scale-95
              "
              style={{
                textShadow: '0 0 5px rgba(255, 255, 255, 0.5)'
              }}
            >
              {tag}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      <CultureTagModal
        isOpen={!!selectedTag}
        tag={selectedTag}
        description={selectedDescription}
        onClose={handleCloseModal}
      />
    </>
  );
}
