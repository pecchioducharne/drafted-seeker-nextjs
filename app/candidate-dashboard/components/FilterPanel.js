import { useState, useEffect, useMemo } from 'react';
import { getProgrammingLanguages, getCultureTags, getSupportedLanguages } from '@/lib/utils/languageExtractor';
import { getUniversityOptions, getMajorOptions } from '@/lib/services/candidateService';

/**
 * FilterPanel Component
 * Comprehensive filtering controls for the candidate dashboard
 */

export default function FilterPanel({
  // Filter state
  searchQuery,
  setSearchQuery,
  selectedProgrammingLangs,
  setSelectedProgrammingLangs,
  selectedSpokenLangs,
  setSelectedSpokenLangs,
  selectedUniversities,
  setSelectedUniversities,
  selectedMajors,
  setSelectedMajors,
  selectedGradYears,
  setSelectedGradYears,
  selectedCultureTags,
  setSelectedCultureTags,
  videoFilter,
  setVideoFilter,
  hasActiveFilters,
  clearFilters,
  // Data for dropdowns
  allCandidates
}) {
  // Dropdown open states
  const [openDropdown, setOpenDropdown] = useState(null);

  // Debounced search
  const [searchInput, setSearchInput] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchInput, setSearchQuery]);

  // Generate filter options from candidates
  const universityOptions = useMemo(() =>
    getUniversityOptions(allCandidates).slice(0, 50),
    [allCandidates]
  );

  const majorOptions = useMemo(() =>
    getMajorOptions(allCandidates).slice(0, 30),
    [allCandidates]
  );

  const programmingLanguages = getProgrammingLanguages();
  const spokenLanguages = getSupportedLanguages();
  const cultureTags = getCultureTags();

  const gradYearOptions = useMemo(() => {
    const years = [];
    for (let year = 2024; year <= 2029; year++) {
      years.push(year.toString());
    }
    return years;
  }, []);

  // Toggle dropdown
  const toggleDropdown = (dropdownName) => {
    setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenDropdown(null);
    if (openDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openDropdown]);

  // Multi-select toggle helper
  const toggleSelection = (value, selected, setSelected) => {
    if (selected.includes(value)) {
      setSelected(selected.filter(v => v !== value));
    } else {
      setSelected([...selected, value]);
    }
  };

  return (
    <div className="liquid-glass rounded-xl p-6 sticky top-6 max-h-[calc(100vh-8rem)] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Filters</h2>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Search
        </label>
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Name, email, major, university..."
          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg
                   text-white placeholder-gray-500 focus:outline-none focus:border-purple-500
                   transition-colors"
        />
        {searchInput && (
          <div className="text-xs text-gray-400 mt-1">
            Searching: "{searchInput}"
          </div>
        )}
      </div>

      {/* Video Completion Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Video Completion
        </label>
        <div className="space-y-2">
          {[
            { value: 'any', label: 'Any Video Status' },
            { value: 'has1', label: 'Has Video 1' },
            { value: 'has2+', label: 'Has 2+ Videos' },
            { value: 'has3', label: 'All 3 Videos' }
          ].map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <input
                type="radio"
                name="videoFilter"
                value={option.value}
                checked={videoFilter === option.value}
                onChange={(e) => setVideoFilter(e.target.value)}
                className="w-4 h-4 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-gray-300 group-hover:text-white transition-colors">
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Programming Languages Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Programming Languages
        </label>
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => toggleDropdown('programmingLangs')}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg
                     text-left text-white hover:bg-white/10 transition-colors
                     flex items-center justify-between"
          >
            <span className={selectedProgrammingLangs.length === 0 ? 'text-gray-400' : ''}>
              {selectedProgrammingLangs.length === 0
                ? 'Select languages...'
                : `${selectedProgrammingLangs.length} selected`}
            </span>
            <span className="text-gray-400">▼</span>
          </button>

          {openDropdown === 'programmingLangs' && (
            <div className="absolute z-10 mt-1 w-full max-h-60 overflow-y-auto
                          bg-slate-800 border border-white/20 rounded-lg shadow-xl">
              {programmingLanguages.map((lang) => (
                <label
                  key={lang}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-white/10
                           cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedProgrammingLangs.includes(lang)}
                    onChange={() =>
                      toggleSelection(lang, selectedProgrammingLangs, setSelectedProgrammingLangs)
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-white">{lang}</span>
                </label>
              ))}
            </div>
          )}
        </div>
        {selectedProgrammingLangs.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedProgrammingLangs.map((lang) => (
              <span
                key={lang}
                className="px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded-full
                         flex items-center gap-1"
              >
                {lang}
                <button
                  onClick={() =>
                    toggleSelection(lang, selectedProgrammingLangs, setSelectedProgrammingLangs)
                  }
                  className="hover:text-purple-100"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Spoken Languages Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Spoken Languages
        </label>
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => toggleDropdown('spokenLangs')}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg
                     text-left text-white hover:bg-white/10 transition-colors
                     flex items-center justify-between"
          >
            <span className={selectedSpokenLangs.length === 0 ? 'text-gray-400' : ''}>
              {selectedSpokenLangs.length === 0
                ? 'Select languages...'
                : `${selectedSpokenLangs.length} selected`}
            </span>
            <span className="text-gray-400">▼</span>
          </button>

          {openDropdown === 'spokenLangs' && (
            <div className="absolute z-10 mt-1 w-full max-h-60 overflow-y-auto
                          bg-slate-800 border border-white/20 rounded-lg shadow-xl">
              {spokenLanguages.map((lang) => (
                <label
                  key={lang}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-white/10
                           cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedSpokenLangs.includes(lang)}
                    onChange={() =>
                      toggleSelection(lang, selectedSpokenLangs, setSelectedSpokenLangs)
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-white">{lang}</span>
                </label>
              ))}
            </div>
          )}
        </div>
        {selectedSpokenLangs.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedSpokenLangs.map((lang) => (
              <span
                key={lang}
                className="px-2 py-1 text-xs bg-blue-500/20 text-blue-300 rounded-full
                         flex items-center gap-1"
              >
                {lang}
                <button
                  onClick={() =>
                    toggleSelection(lang, selectedSpokenLangs, setSelectedSpokenLangs)
                  }
                  className="hover:text-blue-100"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Universities Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Universities
        </label>
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => toggleDropdown('universities')}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg
                     text-left text-white hover:bg-white/10 transition-colors
                     flex items-center justify-between"
          >
            <span className={selectedUniversities.length === 0 ? 'text-gray-400' : ''}>
              {selectedUniversities.length === 0
                ? 'Select universities...'
                : `${selectedUniversities.length} selected`}
            </span>
            <span className="text-gray-400">▼</span>
          </button>

          {openDropdown === 'universities' && (
            <div className="absolute z-10 mt-1 w-full max-h-60 overflow-y-auto
                          bg-slate-800 border border-white/20 rounded-lg shadow-xl">
              {universityOptions.map(({ university, count }) => (
                <label
                  key={university}
                  className="flex items-center justify-between gap-2 px-3 py-2 hover:bg-white/10
                           cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={selectedUniversities.includes(university)}
                      onChange={() =>
                        toggleSelection(university, selectedUniversities, setSelectedUniversities)
                      }
                      className="w-4 h-4 shrink-0"
                    />
                    <span className="text-white truncate">{university}</span>
                  </div>
                  <span className="text-gray-400 text-sm shrink-0">({count})</span>
                </label>
              ))}
            </div>
          )}
        </div>
        {selectedUniversities.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedUniversities.map((uni) => (
              <span
                key={uni}
                className="px-2 py-1 text-xs bg-green-500/20 text-green-300 rounded-full
                         flex items-center gap-1 max-w-[200px]"
              >
                <span className="truncate">{uni}</span>
                <button
                  onClick={() =>
                    toggleSelection(uni, selectedUniversities, setSelectedUniversities)
                  }
                  className="hover:text-green-100 shrink-0"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Majors Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Majors
        </label>
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => toggleDropdown('majors')}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg
                     text-left text-white hover:bg-white/10 transition-colors
                     flex items-center justify-between"
          >
            <span className={selectedMajors.length === 0 ? 'text-gray-400' : ''}>
              {selectedMajors.length === 0
                ? 'Select majors...'
                : `${selectedMajors.length} selected`}
            </span>
            <span className="text-gray-400">▼</span>
          </button>

          {openDropdown === 'majors' && (
            <div className="absolute z-10 mt-1 w-full max-h-60 overflow-y-auto
                          bg-slate-800 border border-white/20 rounded-lg shadow-xl">
              {majorOptions.map(({ major, count }) => (
                <label
                  key={major}
                  className="flex items-center justify-between gap-2 px-3 py-2 hover:bg-white/10
                           cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={selectedMajors.includes(major)}
                      onChange={() =>
                        toggleSelection(major, selectedMajors, setSelectedMajors)
                      }
                      className="w-4 h-4 shrink-0"
                    />
                    <span className="text-white truncate">{major}</span>
                  </div>
                  <span className="text-gray-400 text-sm shrink-0">({count})</span>
                </label>
              ))}
            </div>
          )}
        </div>
        {selectedMajors.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedMajors.map((major) => (
              <span
                key={major}
                className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-300 rounded-full
                         flex items-center gap-1 max-w-[200px]"
              >
                <span className="truncate">{major}</span>
                <button
                  onClick={() =>
                    toggleSelection(major, selectedMajors, setSelectedMajors)
                  }
                  className="hover:text-yellow-100 shrink-0"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Graduation Years Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Graduation Year
        </label>
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => toggleDropdown('gradYears')}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg
                     text-left text-white hover:bg-white/10 transition-colors
                     flex items-center justify-between"
          >
            <span className={selectedGradYears.length === 0 ? 'text-gray-400' : ''}>
              {selectedGradYears.length === 0
                ? 'Select years...'
                : selectedGradYears.join(', ')}
            </span>
            <span className="text-gray-400">▼</span>
          </button>

          {openDropdown === 'gradYears' && (
            <div className="absolute z-10 mt-1 w-full bg-slate-800 border border-white/20 rounded-lg shadow-xl">
              {gradYearOptions.map((year) => (
                <label
                  key={year}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-white/10
                           cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedGradYears.includes(year)}
                    onChange={() =>
                      toggleSelection(year, selectedGradYears, setSelectedGradYears)
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-white">{year}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Culture Tags Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Culture Tags
        </label>
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => toggleDropdown('cultureTags')}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg
                     text-left text-white hover:bg-white/10 transition-colors
                     flex items-center justify-between"
          >
            <span className={selectedCultureTags.length === 0 ? 'text-gray-400' : ''}>
              {selectedCultureTags.length === 0
                ? 'Select tags...'
                : `${selectedCultureTags.length} selected`}
            </span>
            <span className="text-gray-400">▼</span>
          </button>

          {openDropdown === 'cultureTags' && (
            <div className="absolute z-10 mt-1 w-full max-h-60 overflow-y-auto
                          bg-slate-800 border border-white/20 rounded-lg shadow-xl">
              {cultureTags.map((tag) => (
                <label
                  key={tag}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-white/10
                           cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedCultureTags.includes(tag)}
                    onChange={() =>
                      toggleSelection(tag, selectedCultureTags, setSelectedCultureTags)
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-white">{tag}</span>
                </label>
              ))}
            </div>
          )}
        </div>
        {selectedCultureTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedCultureTags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs bg-pink-500/20 text-pink-300 rounded-full
                         flex items-center gap-1"
              >
                {tag}
                <button
                  onClick={() =>
                    toggleSelection(tag, selectedCultureTags, setSelectedCultureTags)
                  }
                  className="hover:text-pink-100"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Active Filter Count */}
      {hasActiveFilters && (
        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="text-center">
            <div className="text-sm text-gray-400 mb-2">
              {[
                searchQuery && 'Search',
                selectedProgrammingLangs.length > 0 && `${selectedProgrammingLangs.length} Languages`,
                selectedSpokenLangs.length > 0 && `${selectedSpokenLangs.length} Spoken`,
                selectedUniversities.length > 0 && `${selectedUniversities.length} Universities`,
                selectedMajors.length > 0 && `${selectedMajors.length} Majors`,
                selectedGradYears.length > 0 && `${selectedGradYears.length} Years`,
                selectedCultureTags.length > 0 && `${selectedCultureTags.length} Tags`,
                videoFilter !== 'any' && 'Video Filter'
              ].filter(Boolean).join(' • ')}
            </div>
            <button
              onClick={clearFilters}
              className="text-sm text-purple-400 hover:text-purple-300 underline"
            >
              Clear all filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
