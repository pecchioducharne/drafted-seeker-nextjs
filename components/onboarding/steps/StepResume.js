'use client';

import React, { useState } from 'react';
import { ArrowRight, SkipForward } from 'lucide-react';
import ResumeUploadSection from '../ResumeUploadSection';

export default function StepResume({ data, onNext, onBack }) {
  const [resumeFile, setResumeFile] = useState(data.resumeFile || null);
  const [parsedData, setParsedData] = useState(null);

  const handleResumeProcessed = (parsed, file, completeness) => {
    setParsedData(parsed);
    setResumeFile(file);
    console.log('Resume parsed:', { parsed, completeness });
  };

  const handleNext = () => {
    onNext({
      resumeFile: resumeFile,
      experience: parsedData?.experience || data.experience || [],
      // Optionally merge other parsed fields if not already set
      ...(parsedData?.firstName && !data.firstName && { firstName: parsedData.firstName }),
      ...(parsedData?.lastName && !data.lastName && { lastName: parsedData.lastName }),
      ...(parsedData?.university && !data.university && { university: parsedData.university }),
      ...(parsedData?.major && !data.major && { major: parsedData.major }),
      ...(parsedData?.graduationMonth && !data.graduationMonth && { graduationMonth: parsedData.graduationMonth }),
      ...(parsedData?.graduationYear && !data.graduationYear && { graduationYear: parsedData.graduationYear }),
      ...(parsedData?.linkedInURL && !data.linkedInURL && { linkedInURL: parsedData.linkedInURL }),
      ...(parsedData?.gitHubURL && !data.gitHubURL && { gitHubURL: parsedData.gitHubURL }),
    });
  };

  const handleSkip = () => {
    onNext({
      resumeFile: null,
      experience: data.experience || [],
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-block px-3 py-1 rounded-full bg-drafted-green/10 text-drafted-green text-sm font-medium mb-2">
          Step 4 of 6 - Optional
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white">
          Upload Your Resume
        </h1>
        <p className="text-gray-400 text-lg">
          Let us auto-fill your information (optional)
        </p>
      </div>

      <ResumeUploadSection
        onResumeProcessed={handleResumeProcessed}
        resumeFile={resumeFile}
        setResumeFile={setResumeFile}
      />

      {parsedData && (
        <div className="drafted-card p-4">
          <h4 className="text-sm font-semibold text-white mb-3">
            Information Extracted
          </h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {parsedData.firstName && (
              <div>
                <span className="text-gray-400">First Name:</span>
                <span className="text-white ml-2">{parsedData.firstName}</span>
              </div>
            )}
            {parsedData.lastName && (
              <div>
                <span className="text-gray-400">Last Name:</span>
                <span className="text-white ml-2">{parsedData.lastName}</span>
              </div>
            )}
            {parsedData.university && (
              <div className="col-span-2">
                <span className="text-gray-400">University:</span>
                <span className="text-white ml-2">{parsedData.university}</span>
              </div>
            )}
            {parsedData.major && (
              <div className="col-span-2">
                <span className="text-gray-400">Major:</span>
                <span className="text-white ml-2">{parsedData.major}</span>
              </div>
            )}
            {parsedData.experience && parsedData.experience.length > 0 && (
              <div className="col-span-2">
                <span className="text-gray-400">Experience:</span>
                <span className="text-white ml-2">{parsedData.experience.length} position(s)</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 drafted-btn drafted-btn-ghost py-3"
        >
          Back
        </button>
        <button
          onClick={handleSkip}
          className="flex-1 drafted-btn drafted-btn-glass py-3 flex items-center justify-center gap-2"
        >
          <SkipForward className="w-4 h-4" />
          Skip
        </button>
        <button
          onClick={handleNext}
          className="flex-1 drafted-btn drafted-btn-primary py-3 flex items-center justify-center gap-2"
        >
          Continue
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
