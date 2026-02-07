import { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchCandidates, getCandidateStats } from '@/lib/services/candidateService';
import { extractLanguagesFromTranscript, extractProgrammingLanguages } from '@/lib/utils/languageExtractor';

/**
 * Custom hook for managing candidate data and filtering
 * Provides efficient filtering with memoization
 */
export function useCandidates() {
  // Data state
  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProgrammingLangs, setSelectedProgrammingLangs] = useState([]);
  const [selectedSpokenLangs, setSelectedSpokenLangs] = useState([]);
  const [selectedUniversities, setSelectedUniversities] = useState([]);
  const [selectedMajors, setSelectedMajors] = useState([]);
  const [selectedGradYears, setSelectedGradYears] = useState([]);
  const [selectedCultureTags, setSelectedCultureTags] = useState([]);
  const [videoFilter, setVideoFilter] = useState('any'); // 'any', 'has1', 'has2+', 'has3'

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Selection state
  const [selectedCandidates, setSelectedCandidates] = useState(new Set());

  // Fetch candidates on mount
  useEffect(() => {
    async function loadCandidates() {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch with basic Firestore filters
        const filters = {
          hasVideo1: videoFilter !== 'any' // Only filter at Firestore level if specific video filter
        };

        const data = await fetchCandidates(filters);
        setCandidates(data);

        // Calculate stats
        const statsData = await getCandidateStats(data);
        setStats(statsData);
      } catch (err) {
        console.error('Error loading candidates:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadCandidates();
  }, [videoFilter]);

  // Add language extraction to candidates (lazy - only when needed)
  const candidatesWithLanguages = useMemo(() => {
    // Only extract languages if spoken language filter is active
    if (selectedSpokenLangs.length === 0) {
      return candidates;
    }

    return candidates.map(c => ({
      ...c,
      spokenLanguages: extractLanguagesFromTranscript(c.transcripts || [])
    }));
  }, [candidates, selectedSpokenLangs.length]);

  // Apply client-side filters
  const filteredCandidates = useMemo(() => {
    let results = candidatesWithLanguages;

    // Search filter (across multiple fields)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(c =>
        c.firstName?.toLowerCase().includes(query) ||
        c.lastName?.toLowerCase().includes(query) ||
        c.email?.toLowerCase().includes(query) ||
        c.major?.toLowerCase().includes(query) ||
        c.university?.toLowerCase().includes(query)
      );
    }

    // Programming languages filter
    if (selectedProgrammingLangs.length > 0) {
      results = results.filter(c => {
        const langs = extractProgrammingLanguages(c.skills || []);
        return selectedProgrammingLangs.some(lang => langs.includes(lang));
      });
    }

    // Spoken languages filter
    if (selectedSpokenLangs.length > 0) {
      results = results.filter(c => {
        const langs = c.spokenLanguages || [];
        return selectedSpokenLangs.some(lang => langs.includes(lang));
      });
    }

    // Universities filter
    if (selectedUniversities.length > 0) {
      results = results.filter(c =>
        selectedUniversities.includes(c.university)
      );
    }

    // Majors filter
    if (selectedMajors.length > 0) {
      results = results.filter(c =>
        selectedMajors.includes(c.major)
      );
    }

    // Graduation years filter
    if (selectedGradYears.length > 0) {
      results = results.filter(c =>
        selectedGradYears.includes(String(c.graduationYear))
      );
    }

    // Culture tags filter
    if (selectedCultureTags.length > 0) {
      results = results.filter(c =>
        c.culture?.cultureTags?.some(tag => selectedCultureTags.includes(tag))
      );
    }

    // Video completion filter
    if (videoFilter === 'has1') {
      results = results.filter(c => c.video1);
    } else if (videoFilter === 'has2+') {
      results = results.filter(c => c.video1 && c.video2);
    } else if (videoFilter === 'has3') {
      results = results.filter(c => c.video1 && c.video2 && c.video3);
    }

    return results;
  }, [
    candidatesWithLanguages,
    searchQuery,
    selectedProgrammingLangs,
    selectedSpokenLangs,
    selectedUniversities,
    selectedMajors,
    selectedGradYears,
    selectedCultureTags,
    videoFilter
  ]);

  // Paginated results
  const paginatedCandidates = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredCandidates.slice(startIndex, startIndex + pageSize);
  }, [filteredCandidates, currentPage, pageSize]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    selectedProgrammingLangs,
    selectedSpokenLangs,
    selectedUniversities,
    selectedMajors,
    selectedGradYears,
    selectedCultureTags,
    videoFilter
  ]);

  // Refresh data
  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchCandidates({}, 10000, true); // Force refresh - fetch ALL
      setCandidates(data);
      const statsData = await getCandidateStats(data);
      setStats(statsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Selection handlers
  const toggleCandidateSelection = useCallback((candidateId) => {
    setSelectedCandidates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(candidateId)) {
        newSet.delete(candidateId);
      } else {
        newSet.add(candidateId);
      }
      return newSet;
    });
  }, []);

  const selectAllFiltered = useCallback(() => {
    const allIds = new Set(filteredCandidates.map(c => c.id));
    setSelectedCandidates(allIds);
  }, [filteredCandidates]);

  const deselectAll = useCallback(() => {
    setSelectedCandidates(new Set());
  }, []);

  const getSelectedCandidatesList = useCallback(() => {
    return filteredCandidates.filter(c => selectedCandidates.has(c.id));
  }, [filteredCandidates, selectedCandidates]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedProgrammingLangs([]);
    setSelectedSpokenLangs([]);
    setSelectedUniversities([]);
    setSelectedMajors([]);
    setSelectedGradYears([]);
    setSelectedCultureTags([]);
    setVideoFilter('any');
    setCurrentPage(1);
  }, []);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      searchQuery.trim() !== '' ||
      selectedProgrammingLangs.length > 0 ||
      selectedSpokenLangs.length > 0 ||
      selectedUniversities.length > 0 ||
      selectedMajors.length > 0 ||
      selectedGradYears.length > 0 ||
      selectedCultureTags.length > 0 ||
      videoFilter !== 'any'
    );
  }, [
    searchQuery,
    selectedProgrammingLangs,
    selectedSpokenLangs,
    selectedUniversities,
    selectedMajors,
    selectedGradYears,
    selectedCultureTags,
    videoFilter
  ]);

  // Pagination helpers
  const totalPages = Math.ceil(filteredCandidates.length / pageSize);
  const hasPrevPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  return {
    // Data
    candidates: paginatedCandidates,
    allCandidates: candidates,
    filteredCandidates,
    filteredCount: filteredCandidates.length,
    totalCount: candidates.length,
    stats,
    isLoading,
    error,

    // Filters
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
    clearFilters,
    hasActiveFilters,

    // Pagination
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    hasPrevPage,
    hasNextPage,

    // Selection
    selectedCandidates,
    toggleCandidateSelection,
    selectAllFiltered,
    deselectAll,
    getSelectedCandidatesList,

    // Actions
    refresh
  };
}
