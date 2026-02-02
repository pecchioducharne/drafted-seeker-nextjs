'use client';

import { useState, useRef, useEffect } from 'react';
import { Calendar, X, Check } from 'lucide-react';

// Generate year range: 10 years in the past to 10 years in the future
const currentYear = new Date().getFullYear();
const ALL_YEARS = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);

// Default visible years (2026-2031)
const DEFAULT_YEARS = [2026, 2027, 2028, 2029, 2030, 2031];

export default function YearAutocomplete({ value, onChange, error, label = "Graduation Year" }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredYears, setFilteredYears] = useState(DEFAULT_YEARS);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Filter years based on search term
  useEffect(() => {
    if (searchTerm.trim()) {
      const searchNum = searchTerm.trim();
      const filtered = ALL_YEARS.filter((year) =>
        year.toString().includes(searchNum)
      );
      setFilteredYears(filtered);
      setHighlightedIndex(-1);
    } else {
      setFilteredYears(DEFAULT_YEARS);
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
          prev < filteredYears.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredYears.length) {
          handleSelectYear(filteredYears[highlightedIndex]);
        } else if (searchTerm.trim()) {
          // Allow custom year if valid
          const customYear = parseInt(searchTerm.trim());
          if (!isNaN(customYear) && customYear >= 1900 && customYear <= 2100) {
            handleSelectYear(customYear);
          }
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

  const handleSelectYear = (year) => {
    onChange(year);
    setSearchTerm('');
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleClear = () => {
    onChange('');
    setSearchTerm('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleInputChange = (e) => {
    const input = e.target.value;
    // Only allow numbers
    if (input === '' || /^\d+$/.test(input)) {
      setSearchTerm(input);
      setIsOpen(true);
    }
  };

  const displayValue = value || searchTerm;

  return (
    <div className="relative">
      {/* Label */}
      {label && (
        <label className="block text-gray-400 text-sm mb-2">{label}</label>
      )}

      {/* Input Field */}
      <div className="relative">
        <div
          className={`flex items-center bg-white/5 border ${
            error ? 'border-red-400' : 'border-white/10'
          } rounded-lg px-4 py-3 focus-within:border-green-400 focus-within:ring-1 focus-within:ring-green-400 transition-all`}
        >
          <Calendar className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            value={displayValue}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Select or type year..."
            maxLength={4}
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
            className="absolute z-50 w-full mt-2 bg-slate-800 border border-white/10 rounded-lg shadow-2xl overflow-hidden"
          >
            {/* Common Years Section */}
            {!searchTerm && (
              <div className="py-1">
                <div className="px-4 py-2 text-xs text-gray-500 font-medium uppercase tracking-wider">
                  Common Graduation Years
                </div>
                <ul>
                  {DEFAULT_YEARS.map((year, index) => (
                    <li key={year}>
                      <button
                        type="button"
                        onClick={() => handleSelectYear(year)}
                        onMouseEnter={() => setHighlightedIndex(index)}
                        className={`w-full text-left px-4 py-2.5 transition-colors flex items-center justify-between ${
                          index === highlightedIndex
                            ? 'bg-green-500/20 text-green-400'
                            : 'text-gray-300 hover:bg-white/5'
                        } ${value === year ? 'text-green-400' : ''}`}
                      >
                        <span className="font-medium">{year}</span>
                        {value === year && <Check className="w-4 h-4" />}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Search Results */}
            {searchTerm && filteredYears.length > 0 && (
              <div className="py-1">
                <div className="px-4 py-2 text-xs text-gray-500 font-medium uppercase tracking-wider">
                  Matching Years
                </div>
                <ul className="max-h-48 overflow-y-auto">
                  {filteredYears.map((year, index) => (
                    <li key={year}>
                      <button
                        type="button"
                        onClick={() => handleSelectYear(year)}
                        onMouseEnter={() => setHighlightedIndex(index)}
                        className={`w-full text-left px-4 py-2.5 transition-colors flex items-center justify-between ${
                          index === highlightedIndex
                            ? 'bg-green-500/20 text-green-400'
                            : 'text-gray-300 hover:bg-white/5'
                        } ${value === year ? 'text-green-400' : ''}`}
                      >
                        <span>{year}</span>
                        {value === year && <Check className="w-4 h-4" />}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* No Results / Custom Year */}
            {searchTerm && filteredYears.length === 0 && (
              <div className="px-4 py-8 text-center">
                <p className="text-gray-400 mb-3">No years found</p>
                {searchTerm.length === 4 && (
                  <button
                    type="button"
                    onClick={() => {
                      const customYear = parseInt(searchTerm);
                      if (!isNaN(customYear) && customYear >= 1900 && customYear <= 2100) {
                        handleSelectYear(customYear);
                      }
                    }}
                    className="text-green-400 hover:text-green-300 text-sm font-medium"
                  >
                    Use {searchTerm}
                  </button>
                )}
              </div>
            )}

            {/* Helper Text */}
            {!searchTerm && (
              <div className="border-t border-white/10 px-4 py-2.5 bg-slate-900/50">
                <p className="text-xs text-gray-500">
                  💡 Type any year to search (e.g., 2024, 2032)
                </p>
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
          Select from common years or type a custom year
        </p>
      )}
    </div>
  );
}
