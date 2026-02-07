import { memo, useState } from 'react';

/**
 * CandidateRow Component
 * Displays individual candidate information in a card format
 * Memoized for performance
 */

function CandidateRow({ candidate, onSelect, isSelected, onToggleSelect }) {
  const [emailCopied, setEmailCopied] = useState(false);
  const hasVideo1 = Boolean(candidate.video1);
  const hasVideo2 = Boolean(candidate.video2);
  const hasVideo3 = Boolean(candidate.video3);
  const videoCount = [hasVideo1, hasVideo2, hasVideo3].filter(Boolean).length;

  const handleCheckboxClick = (e) => {
    e.stopPropagation();
    onToggleSelect?.(candidate.id);
  };

  const handleCopyEmail = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(candidate.email);
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy email:', error);
    }
  };

  return (
    <div
      className={`p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-all
                 border border-white/10 hover:border-purple-500/50 cursor-pointer
                 ${isSelected ? 'ring-2 ring-purple-500 bg-purple-500/10' : ''}`}
      onClick={() => onSelect?.(candidate)}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Checkbox */}
        <div className="flex items-start pt-1 shrink-0">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleCheckboxClick}
            onClick={handleCheckboxClick}
            className="w-5 h-5 rounded border-gray-600 bg-white/10 text-purple-600
                     focus:ring-2 focus:ring-purple-500 focus:ring-offset-0 cursor-pointer"
          />
        </div>

        {/* Left side: Main info */}
        <div className="flex-1 min-w-0">
          {/* Name */}
          <h3 className="text-lg font-semibold text-white mb-1 truncate">
            {candidate.firstName} {candidate.lastName}
          </h3>

          {/* Email with Copy Button */}
          <div className="flex items-center gap-2 mb-3">
            <p className="text-gray-400 text-sm truncate">
              {candidate.email}
            </p>
            <button
              onClick={handleCopyEmail}
              className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded"
              title="Copy email"
            >
              {emailCopied ? (
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2 text-gray-300">
              <span className="text-purple-400">🎓</span>
              <span className="truncate">{candidate.university || 'N/A'}</span>
            </div>

            <div className="flex items-center gap-2 text-gray-300">
              <span className="text-purple-400">📚</span>
              <span className="truncate">{candidate.major || 'N/A'}</span>
            </div>

            <div className="flex items-center gap-2 text-gray-300">
              <span className="text-purple-400">🗓️</span>
              <span>Grad: {candidate.graduationYear || 'N/A'}</span>
            </div>

            <div className="flex items-center gap-2 text-gray-300">
              <span className="text-purple-400">🎥</span>
              <span>{videoCount} video{videoCount !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Skills (if available) */}
          {candidate.skills && candidate.skills.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {candidate.skills.slice(0, 5).map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded-full"
                >
                  {skill}
                </span>
              ))}
              {candidate.skills.length > 5 && (
                <span className="px-2 py-1 text-xs text-gray-400">
                  +{candidate.skills.length - 5} more
                </span>
              )}
            </div>
          )}

          {/* Culture Tags (if available) */}
          {candidate.culture?.cultureTags && candidate.culture.cultureTags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {candidate.culture.cultureTags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs bg-blue-500/20 text-blue-300 rounded-full"
                >
                  {tag}
                </span>
              ))}
              {candidate.culture.cultureTags.length > 3 && (
                <span className="px-2 py-1 text-xs text-gray-400">
                  +{candidate.culture.cultureTags.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right side: Video indicators */}
        <div className="flex flex-col items-center gap-2 shrink-0">
          <div className="flex gap-2">
            {hasVideo1 ? (
              <div className="w-3 h-3 bg-green-500 rounded-full" title="Video 1 Complete" />
            ) : (
              <div className="w-3 h-3 bg-gray-600 rounded-full" title="No Video 1" />
            )}
            {hasVideo2 ? (
              <div className="w-3 h-3 bg-green-500 rounded-full" title="Video 2 Complete" />
            ) : (
              <div className="w-3 h-3 bg-gray-600 rounded-full" title="No Video 2" />
            )}
            {hasVideo3 ? (
              <div className="w-3 h-3 bg-green-500 rounded-full" title="Video 3 Complete" />
            ) : (
              <div className="w-3 h-3 bg-gray-600 rounded-full" title="No Video 3" />
            )}
          </div>

          {/* External Links */}
          <div className="flex gap-2 mt-2">
            {candidate.linkedInURL && (
              <a
                href={candidate.linkedInURL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-blue-400 hover:text-blue-300 transition-colors"
                title="LinkedIn Profile"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
            )}

            {candidate.gitHubURL && (
              <a
                href={candidate.gitHubURL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-gray-400 hover:text-gray-300 transition-colors"
                title="GitHub Profile"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
            )}

            {candidate.resume && (
              <a
                href={candidate.resume}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-gray-400 hover:text-gray-300 transition-colors"
                title="View Resume"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Memoize to prevent unnecessary re-renders
export default memo(CandidateRow);
