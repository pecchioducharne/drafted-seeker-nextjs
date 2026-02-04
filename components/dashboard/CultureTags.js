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
                bg-gradient-to-r from-[#8B5CF6] to-[#6366F1]
                text-white px-4 py-2 rounded-full
                text-sm font-semibold cursor-pointer
                transition-all duration-300
                hover:translate-y-[-2px]
                hover:brightness-110
                hover:shadow-lg
                active:scale-95
              "
              style={{
                boxShadow: '0 4px 14px 0 rgba(139, 92, 246, 0.4)'
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
