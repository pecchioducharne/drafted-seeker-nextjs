'use client';

import { useEffect, useState } from 'react';
import { X, Download, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ResumeViewerModal({ isOpen, resumeUrl, onClose }) {
  const [resumeType, setResumeType] = useState(null);
  const [textContent, setTextContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !resumeUrl) return;

    const loadResume = async () => {
      setLoading(true);
      setError(null);

      try {
        // Detect file type from URL
        const urlLower = resumeUrl.toLowerCase();
        if (urlLower.includes('.pdf')) {
          setResumeType('pdf');
        } else if (urlLower.includes('.docx') || urlLower.includes('.doc')) {
          setResumeType('docx');
          await loadDocxAsText(resumeUrl);
        } else if (urlLower.includes('.txt')) {
          setResumeType('txt');
          await loadTextFile(resumeUrl);
        } else {
          setResumeType('pdf'); // Default to PDF
        }
      } catch (err) {
        console.error('Error loading resume:', err);
        setError('Failed to load resume. Please try downloading it instead.');
      } finally {
        setLoading(false);
      }
    };

    loadResume();
  }, [isOpen, resumeUrl]);

  const loadTextFile = async (url) => {
    const response = await fetch(url);
    const text = await response.text();
    setTextContent(text);
  };

  const loadDocxAsText = async (url) => {
    // For DOCX, we'll show a message that it's being displayed as a download link
    // since rendering DOCX in-browser requires additional libraries
    setTextContent('DOCX files are best viewed by downloading. Click the download button above.');
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!resumeUrl) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="relative w-full max-w-4xl h-[90vh] bg-white rounded-2xl shadow-2xl pointer-events-auto overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="absolute top-0 left-0 right-0 z-10 bg-gray-900 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-drafted-green" />
                  <h2 className="text-lg font-semibold text-white">Resume Preview</h2>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={resumeUrl}
                    download
                    className="px-4 py-2 bg-drafted-green/10 hover:bg-drafted-green/20 border border-drafted-green/30 rounded-lg text-drafted-green text-sm font-medium transition-all flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="pt-20 pb-6 px-6 h-full overflow-hidden">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-drafted-green/20 border-t-drafted-green rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading resume...</p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center max-w-md">
                      <p className="text-red-600 mb-4">{error}</p>
                      <a
                        href={resumeUrl}
                        download
                        className="drafted-btn drafted-btn-primary inline-flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download Resume
                      </a>
                    </div>
                  </div>
                ) : resumeType === 'pdf' ? (
                  <iframe
                    src={resumeUrl}
                    className="w-full h-full rounded-lg border border-gray-200"
                    title="Resume Preview"
                  />
                ) : resumeType === 'txt' ? (
                  <div className="w-full h-full overflow-auto bg-gray-50 rounded-lg border border-gray-200 p-6">
                    <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800">
                      {textContent}
                    </pre>
                  </div>
                ) : resumeType === 'docx' ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center max-w-md">
                      <FileText className="w-16 h-16 text-drafted-green mx-auto mb-4" />
                      <p className="text-gray-700 mb-4">
                        DOCX files are best viewed by downloading them.
                      </p>
                      <a
                        href={resumeUrl}
                        download
                        className="drafted-btn drafted-btn-primary inline-flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download Resume
                      </a>
                    </div>
                  </div>
                ) : null}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
