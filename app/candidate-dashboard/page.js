'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCandidates } from '@/hooks/useCandidates';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import StatCards from './components/StatCards';
import CandidateTable from './components/CandidateTable';
import FilterPanel from './components/FilterPanel';
import ExportButton from './components/ExportButton';

export default function CandidateDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const {
    candidates,
    allCandidates,
    filteredCount,
    totalCount,
    stats,
    isLoading,
    error,
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
    currentPage,
    setCurrentPage,
    totalPages,
    hasPrevPage,
    hasNextPage,
    refresh
  } = useCandidates();

  // Protect route - redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Show loading spinner while checking auth
  if (authLoading) {
    return <LoadingSpinner message="Loading..." />;
  }

  // Redirect if not authenticated
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="liquid-glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">
                Candidate Dashboard
              </h1>
              <p className="text-gray-300 mt-1">
                Browse and filter {totalCount.toLocaleString()} candidates
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={refresh}
                disabled={isLoading}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg
                         transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Refreshing...' : 'Refresh'}
              </button>

              <ExportButton
                candidates={candidates}
                filteredCount={filteredCount}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
            <p className="text-red-200">Error loading candidates: {error}</p>
            <button
              onClick={refresh}
              className="mt-2 text-red-300 hover:text-red-100 underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <StatCards stats={stats} isLoading={isLoading} />

        {/* Filters & Results */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filter Panel (left sidebar) */}
          <div className="lg:col-span-1">
            <FilterPanel
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedProgrammingLangs={selectedProgrammingLangs}
              setSelectedProgrammingLangs={setSelectedProgrammingLangs}
              selectedSpokenLangs={selectedSpokenLangs}
              setSelectedSpokenLangs={setSelectedSpokenLangs}
              selectedUniversities={selectedUniversities}
              setSelectedUniversities={setSelectedUniversities}
              selectedMajors={selectedMajors}
              setSelectedMajors={setSelectedMajors}
              selectedGradYears={selectedGradYears}
              setSelectedGradYears={setSelectedGradYears}
              selectedCultureTags={selectedCultureTags}
              setSelectedCultureTags={setSelectedCultureTags}
              videoFilter={videoFilter}
              setVideoFilter={setVideoFilter}
              hasActiveFilters={hasActiveFilters}
              clearFilters={clearFilters}
              allCandidates={allCandidates}
            />
          </div>

          {/* Results Table (right side) */}
          <div className="lg:col-span-3">
            <CandidateTable
              candidates={candidates}
              filteredCount={filteredCount}
              currentPage={currentPage}
              totalPages={totalPages}
              hasPrevPage={hasPrevPage}
              hasNextPage={hasNextPage}
              onPageChange={setCurrentPage}
              pageSize={20}
              isLoading={isLoading}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={clearFilters}
              onCandidateSelect={(candidate) => {
                console.log('Selected candidate:', candidate);
                // TODO: Open candidate detail modal
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
