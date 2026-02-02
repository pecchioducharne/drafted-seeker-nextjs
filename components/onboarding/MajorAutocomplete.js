'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X, Check } from 'lucide-react';

// Comprehensive list of majors from drafted-seeker
const COMMON_MAJORS = [
  "Accounting",
  "Aerospace Engineering",
  "Agriculture",
  "Anthropology",
  "Applied Mathematics",
  "Architecture",
  "Art History",
  "Astronomy",
  "Biochemistry",
  "Biology",
  "Biomedical Engineering",
  "Business Administration",
  "Chemical Engineering",
  "Chemistry",
  "Civil Engineering",
  "Communications",
  "Computer Science",
  "Criminal Justice",
  "Dance",
  "Data Science",
  "Dentistry",
  "Early Childhood Education",
  "Economics",
  "Electrical Engineering",
  "Elementary Education",
  "English",
  "Environmental Science",
  "Fashion Design",
  "Film Studies",
  "Finance",
  "Fine Arts",
  "Forestry",
  "Geography",
  "Geology",
  "Graphic Design",
  "Health Administration",
  "History",
  "Hospitality Management",
  "Human Resources",
  "Industrial Engineering",
  "Information Systems",
  "Interior Design",
  "International Relations",
  "Journalism",
  "Kinesiology",
  "Landscape Architecture",
  "Law",
  "Legal Studies",
  "Library Science",
  "Linguistics",
  "Management",
  "Marine Biology",
  "Marketing",
  "Materials Science",
  "Mathematics",
  "Mechanical Engineering",
  "Medicine",
  "Microbiology",
  "Music",
  "Neuroscience",
  "Nursing",
  "Nutrition",
  "Occupational Therapy",
  "Pharmacy",
  "Philosophy",
  "Physical Education",
  "Physics",
  "Political Science",
  "Psychology",
  "Public Administration",
  "Public Health",
  "Public Relations",
  "Product Design",
  "Product Management",
  "Real Estate",
  "Religious Studies",
  "Social Work",
  "Sociology",
  "Software Engineering",
  "Spanish",
  "Special Education",
  "Speech Pathology",
  "Statistics",
  "Supply Chain Management",
  "Sustainable Agriculture",
  "Theatre",
  "Undecided",
  "Urban Planning",
  "Veterinary Medicine",
  "Visual Arts",
  "Web Development",
  "Wildlife Management",
  "Women's Studies",
  "Zoology",
  "Cybersecurity",
  "Digital Media",
  "Environmental Engineering",
  "Game Design",
  "Industrial Design",
  "Information Technology",
  "International Business",
  "Media Studies",
  "Neurosurgery",
  "Robotics",
];

export default function MajorAutocomplete({ value, onChange, onCustomMajor, error }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredMajors, setFilteredMajors] = useState(COMMON_MAJORS);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Filter majors based on search term
  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = COMMON_MAJORS.filter((major) =>
        major.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMajors(filtered);
      setHighlightedIndex(-1);
    } else {
      setFilteredMajors(COMMON_MAJORS);
    }
  }, [searchTerm]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredMajors.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredMajors.length) {
          handleSelectMajor(filteredMajors[highlightedIndex]);
        } else if (searchTerm.trim()) {
          // Allow custom major if no match or nothing highlighted
          handleCustomMajor();
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
      default:
        break;
    }
  };

  const handleSelectMajor = (major) => {
    onChange(major);
    setSearchTerm('');
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleCustomMajor = () => {
    if (searchTerm.trim()) {
      onCustomMajor(searchTerm.trim());
      setSearchTerm('');
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const handleClear = () => {
    onChange('');
    setSearchTerm('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
  };

  const displayValue = value || searchTerm;

  return (
    <div className="relative">
      {/* Input Field */}
      <div className="relative">
        <div
          className={`flex items-center bg-white/5 border ${
            error ? 'border-red-400' : 'border-white/10'
          } rounded-lg px-4 py-3 focus-within:border-green-400 focus-within:ring-1 focus-within:ring-green-400 transition-all`}
        >
          <Search className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={displayValue}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search or type your major..."
            className="bg-transparent border-none outline-none flex-1 text-white placeholder-gray-500"
            style={{ caretColor: '#4ade80' }}
          />
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="ml-2 p-1 hover:bg-white/10 rounded transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div
            ref={dropdownRef}
            className="absolute z-50 w-full mt-2 bg-slate-800 border border-white/10 rounded-lg shadow-2xl max-h-64 overflow-y-auto"
          >
            {filteredMajors.length > 0 ? (
              <ul className="py-1">
                {filteredMajors.map((major, index) => (
                  <li key={major}>
                    <button
                      type="button"
                      onClick={() => handleSelectMajor(major)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={`w-full text-left px-4 py-2.5 transition-colors flex items-center justify-between ${
                        index === highlightedIndex
                          ? 'bg-green-500/20 text-green-400'
                          : 'text-gray-300 hover:bg-white/5'
                      } ${value === major ? 'text-green-400' : ''}`}
                    >
                      <span>{major}</span>
                      {value === major && <Check className="w-4 h-4" />}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-8 text-center">
                <p className="text-gray-400 mb-3">No majors found</p>
                {searchTerm.trim() && (
                  <button
                    type="button"
                    onClick={handleCustomMajor}
                    className="text-green-400 hover:text-green-300 text-sm font-medium"
                  >
                    Add "{searchTerm}" as custom major
                  </button>
                )}
              </div>
            )}

            {/* Custom major option at bottom */}
            {searchTerm.trim() && filteredMajors.length > 0 && (
              <div className="border-t border-white/10 py-1">
                <button
                  type="button"
                  onClick={handleCustomMajor}
                  className="w-full text-left px-4 py-2.5 text-gray-400 hover:bg-white/5 hover:text-green-400 transition-colors text-sm"
                >
                  Can't find your major? Add "{searchTerm}" as custom
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && <p className="text-red-400 text-sm mt-1 ml-4">{error}</p>}

      {/* Helper Text */}
      {!error && !value && (
        <p className="text-gray-500 text-xs mt-1 ml-4">
          Start typing to search, or enter a custom major
        </p>
      )}
    </div>
  );
}
