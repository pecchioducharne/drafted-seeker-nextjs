import CandidateRow from './CandidateRow';

/**
 * CandidateTable Component
 * Displays a list of candidates with pagination controls
 */

export default function CandidateTable({
  candidates,
  filteredCount,
  currentPage,
  totalPages,
  hasPrevPage,
  hasNextPage,
  onPageChange,
  pageSize,
  isLoading,
  hasActiveFilters,
  onClearFilters,
  onCandidateSelect
}) {
  // Calculate display range
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, filteredCount);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="liquid-glass rounded-xl p-6">
        <div className="h-6 bg-white/10 rounded w-48 mb-6 animate-pulse"></div>
        <div className="space-y-4">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="h-32 bg-gradient-to-r from-white/5 via-white/10 to-white/5
                       rounded-lg animate-[shimmer_2s_ease-in-out_infinite]"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="liquid-glass rounded-xl p-6">
      {/* Results Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-gray-300">
          {filteredCount > 0 ? (
            <>
              Showing {startIndex.toLocaleString()} - {endIndex.toLocaleString()} of{' '}
              <span className="font-semibold text-white">
                {filteredCount.toLocaleString()}
              </span>{' '}
              candidate{filteredCount !== 1 ? 's' : ''}
            </>
          ) : (
            <span className="text-gray-400">No candidates found</span>
          )}
        </div>
      </div>

      {/* Empty State */}
      {candidates.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-xl text-gray-300 mb-2">No candidates found</p>
          <p className="text-gray-400 mb-6">
            {hasActiveFilters
              ? 'Try adjusting your filters to see more results'
              : 'No candidates match your search criteria'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg
                       transition-colors font-medium"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}

      {/* Candidates List */}
      {candidates.length > 0 && (
        <>
          <div className="space-y-3 mb-6">
            {candidates.map((candidate) => (
              <CandidateRow
                key={candidate.id}
                candidate={candidate}
                onSelect={onCandidateSelect}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/10">
              {/* Previous Button */}
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={!hasPrevPage}
                className="w-full sm:w-auto px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg
                         transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                         disabled:hover:bg-white/10 font-medium"
              >
                ← Previous
              </button>

              {/* Page Numbers */}
              <div className="flex items-center gap-2">
                {/* First page */}
                {currentPage > 3 && (
                  <>
                    <button
                      onClick={() => onPageChange(1)}
                      className="w-10 h-10 flex items-center justify-center rounded-lg
                               bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                      1
                    </button>
                    {currentPage > 4 && (
                      <span className="text-gray-400">...</span>
                    )}
                  </>
                )}

                {/* Surrounding pages */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  if (pageNum < 1 || pageNum > totalPages) return null;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum)}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg
                               transition-colors font-medium
                               ${pageNum === currentPage
                                 ? 'bg-purple-600 text-white'
                                 : 'bg-white/10 hover:bg-white/20 text-white'
                               }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {/* Last page */}
                {currentPage < totalPages - 2 && (
                  <>
                    {currentPage < totalPages - 3 && (
                      <span className="text-gray-400">...</span>
                    )}
                    <button
                      onClick={() => onPageChange(totalPages)}
                      className="w-10 h-10 flex items-center justify-center rounded-lg
                               bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>

              {/* Next Button */}
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={!hasNextPage}
                className="w-full sm:w-auto px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg
                         transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                         disabled:hover:bg-white/10 font-medium"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
