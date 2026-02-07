import { useState } from 'react';

/**
 * BulkActionsBar Component
 * Displays bulk action buttons when candidates are selected
 */
export default function BulkActionsBar({
  selectedCount,
  onCopyEmails,
  onExportSelected,
  onDeselectAll,
  onSelectAllFiltered,
  filteredCount
}) {
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleCopyEmails = async () => {
    try {
      setCopied(false);
      await onCopyEmails();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying emails:', error);
      alert('Failed to copy emails to clipboard');
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      await onExportSelected();
    } catch (error) {
      console.error('Error exporting:', error);
      alert('Failed to export selected candidates');
    } finally {
      setExporting(false);
    }
  };

  if (selectedCount === 0) return null;

  return (
    <div className="liquid-glass border-b border-white/10 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Selection Info */}
          <div className="flex items-center gap-4">
            <div className="text-white font-medium">
              {selectedCount} candidate{selectedCount !== 1 ? 's' : ''} selected
            </div>

            {selectedCount < filteredCount && (
              <button
                onClick={onSelectAllFiltered}
                className="text-purple-400 hover:text-purple-300 text-sm underline"
              >
                Select all {filteredCount} filtered
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Copy Emails Button */}
            <button
              onClick={handleCopyEmails}
              disabled={copied}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg
                       transition-colors font-medium disabled:bg-blue-800 flex items-center gap-2"
            >
              {copied ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>Copy Emails</span>
                </>
              )}
            </button>

            {/* Export Selected Button */}
            <button
              onClick={handleExport}
              disabled={exporting}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg
                       transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
            >
              {exporting ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Export CSV</span>
                </>
              )}
            </button>

            {/* Deselect All Button */}
            <button
              onClick={onDeselectAll}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg
                       transition-colors font-medium"
            >
              Deselect All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
