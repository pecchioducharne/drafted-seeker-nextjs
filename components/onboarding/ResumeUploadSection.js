'use client';

import React, { useRef, useState } from 'react';
import { parseResume, calculateDataCompleteness } from '../../lib/utils/resumeParser';
import toast from 'react-hot-toast';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';

const ResumeUploadSection = ({ 
    onResumeProcessed, 
    resumeFile,
    setResumeFile 
}) => {
    const fileInputRef = useRef(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [completeness, setCompleteness] = useState(0);

    const handleUploadClick = () => {
        fileInputRef.current.click();
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsProcessing(true);
        setResumeFile(file);

        const processingToast = toast.loading('Parsing resume... This may take 10-30 seconds');

        try {
            const parsedData = await parseResume(file);
            const score = calculateDataCompleteness(parsedData);
            setCompleteness(score);

            if (score > 0) {
                toast.success('Resume parsed successfully!', { id: processingToast });
                onResumeProcessed(parsedData, file, score);
            } else {
                toast.warning('Could not extract enough information from your resume. Please fill in the form manually.', { id: processingToast });
            }
        } catch (error) {
            console.error('Error processing resume:', error);
            toast.error(error.message || 'Could not process resume. Please try again or fill in the form manually.', { id: processingToast });
            setResumeFile(null);
            setCompleteness(0);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRemoveFile = () => {
        setResumeFile(null);
        setCompleteness(0);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-4">
            <div className="text-center">
                <h3 className="text-xl font-semibold text-white mb-2">
                    Quick Apply with Resume
                </h3>
                <p className="text-sm text-gray-400">
                    Skip manual form filling by uploading your resume. We'll automatically extract your information.
                </p>
            </div>

            <div 
                className={`
                    relative border-2 border-dashed rounded-xl p-8
                    transition-all duration-300
                    ${isProcessing 
                        ? 'border-drafted-green bg-drafted-green/5' 
                        : resumeFile 
                            ? 'border-green-500 bg-green-500/5' 
                            : 'border-white/20 bg-white/5 hover:border-drafted-green/50 hover:bg-drafted-green/5'
                    }
                `}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileUpload}
                    disabled={isProcessing}
                />

                {!resumeFile ? (
                    <div className="text-center space-y-4">
                        <div className="flex justify-center">
                            <div className={`
                                w-16 h-16 rounded-full flex items-center justify-center
                                ${isProcessing 
                                    ? 'bg-drafted-green/20 animate-pulse' 
                                    : 'bg-white/10'
                                }
                            `}>
                                <Upload className={`w-8 h-8 ${isProcessing ? 'text-drafted-green' : 'text-gray-400'}`} />
                            </div>
                        </div>

                        <div>
                            <button 
                                type="button" 
                                onClick={handleUploadClick}
                                disabled={isProcessing}
                                className="drafted-btn drafted-btn-primary px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? (
                                    <>
                                        <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
                                        Processing Resume...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-4 h-4 mr-2" />
                                        Upload Resume
                                    </>
                                )}
                            </button>
                        </div>

                        <p className="text-xs text-gray-500">
                            Supported formats: PDF, DOCX, TXT
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                <FileText className="w-6 h-6 text-green-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="text-white font-medium truncate">
                                        {resumeFile.name}
                                    </p>
                                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                </div>
                                <p className="text-sm text-gray-400 mt-1">
                                    {(resumeFile.size / 1024).toFixed(1)} KB
                                </p>
                                {completeness > 0 && (
                                    <div className="mt-3">
                                        <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                                            <span>Data extracted</span>
                                            <span>{Math.round(completeness * 100)}%</span>
                                        </div>
                                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-gradient-to-r from-drafted-green to-emerald-500 transition-all duration-500"
                                                style={{ width: `${completeness * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button 
                                type="button"
                                onClick={handleUploadClick}
                                disabled={isProcessing}
                                className="flex-1 drafted-btn drafted-btn-glass py-2 text-sm disabled:opacity-50"
                            >
                                Replace
                            </button>
                            <button 
                                type="button"
                                onClick={handleRemoveFile}
                                disabled={isProcessing}
                                className="flex-1 drafted-btn drafted-btn-ghost py-2 text-sm disabled:opacity-50"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResumeUploadSection;
