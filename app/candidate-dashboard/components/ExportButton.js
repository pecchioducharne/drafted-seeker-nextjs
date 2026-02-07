import { useState } from 'react';

/**
 * ExportButton Component
 * Exports filtered candidates to CSV format
 */

export default function ExportButton({ candidates, filteredCount, disabled = false }) {
  const [isExporting, setIsExporting] = useState(false);

  const exportToCSV = () => {
    if (candidates.length === 0) {
      alert('No candidates to export');
      return;
    }

    setIsExporting(true);

    try {
      // Define CSV headers
      const headers = [
        'First Name',
        'Last Name',
        'Email',
        'University',
        'Major',
        'Graduation Year',
        'Videos Completed',
        'Has Video 1',
        'Has Video 2',
        'Has Video 3',
        'Skills',
        'Culture Tags',
        'LinkedIn URL',
        'GitHub URL',
        'Resume URL'
      ];

      // Convert candidates to CSV rows
      const rows = candidates.map(c => {
        const videoCount = [c.video1, c.video2, c.video3].filter(Boolean).length;

        return [
          c.firstName || '',
          c.lastName || '',
          c.email || '',
          c.university || '',
          c.major || '',
          c.graduationYear || '',
          videoCount,
          c.video1 ? 'Yes' : 'No',
          c.video2 ? 'Yes' : 'No',
          c.video3 ? 'Yes' : 'No',
          c.skills?.join('; ') || '',
          c.culture?.cultureTags?.join('; ') || '',
          c.linkedInURL || '',
          c.gitHubURL || '',
          c.resume || ''
        ];
      });

      // Escape CSV values (handle commas, quotes, newlines)
      const escapeCSV = (value) => {
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      };

      // Build CSV string
      const csvContent = [
        headers.map(escapeCSV).join(','),
        ...rows.map(row => row.map(escapeCSV).join(','))
      ].join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `drafted-candidates-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log(`Exported ${candidates.length} candidates to CSV`);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export CSV. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={exportToCSV}
      disabled={disabled || isExporting || candidates.length === 0}
      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg
               transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed
               flex items-center gap-2"
      title={candidates.length === 0 ? 'No candidates to export' : `Export ${filteredCount} candidates`}
    >
      {isExporting ? (
        <>
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Exporting...</span>
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span>Export CSV</span>
        </>
      )}
    </button>
  );
}
