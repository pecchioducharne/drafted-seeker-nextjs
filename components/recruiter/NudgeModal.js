'use client';
import React, { useState, useEffect } from 'react';
import ReactModal from 'react-modal';
import { X, Mail, Send, Loader2, Check, AlertCircle, Clock, Clipboard, Copy, ExternalLink } from 'lucide-react';
import { LinkedIn, ContentCopy } from '@mui/icons-material';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { sendSingleNudge, canNudgeCompany } from '../../lib/services/nudgeService';
import { getGmailQuotaStatus } from '../../lib/gmail/gmailUtils';
import { generateEmailSubject, generateHtmlEmail, generatePlainTextEmail } from '../../lib/gmail/emailUtils';

if (typeof window !== 'undefined') {
  ReactModal.setAppElement('#root');
}

/**
 * Generate LinkedIn DM template
 */
const generateLinkedInDM = (userData, companyName) => {
  const firstName = userData?.firstName || 'Candidate';
  const major = userData?.major || 'their field';
  const university = userData?.university || 'their university';
  const email = userData?.email || '';
  const linkedInURL = userData?.linkedInURL || '';
  const gitHubURL = userData?.gitHubURL || '';
  const resume = userData?.resume || '';
  
  const profileUrl = email ? `https://candidate.joindrafted.com/candidate/${email}` : '';

  let linkedInDM = `Hi! I'm ${firstName}, a ${major} grad from ${university}. I'm interested in opportunities at ${companyName}.\n\n`;
  linkedInDM += `I've created a brief video resume with AI-generated culture tags showing how I might fit at ${companyName}. Please check out my Drafted profile: ${profileUrl}\n\n`;

  if (linkedInURL || gitHubURL || resume) {
    linkedInDM += `Quick links: \n`;
    if (linkedInURL) linkedInDM += `LinkedIn: ${linkedInURL}\n`;
    if (gitHubURL) linkedInDM += `GitHub: ${gitHubURL}\n`;
    if (resume) linkedInDM += `Resume: ${resume}\n`;
    linkedInDM += `\n`;
  }

  linkedInDM += `Looking forward to connecting about how I can contribute to ${companyName}!\n`;
  return linkedInDM;
};

export default function NudgeModal({ isOpen, onClose, company, userData, onEmailSent }) {
  const [sendStatus, setSendStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [quotaStatus, setQuotaStatus] = useState(null);
  const [cooldownWarning, setCooldownWarning] = useState(null);
  
  // Copy states
  const [showEmailCopied, setShowEmailCopied] = useState(false);
  const [showProfileCopied, setShowProfileCopied] = useState(false);
  const [showMessageCopied, setShowMessageCopied] = useState(false);
  const [showDMCopied, setShowDMCopied] = useState(false);

  const companyName = company?.Company || company?.name || 'Company';
  const companyEmail = company?.Email ? (typeof company.Email === 'string' ? company.Email : String(company.Email)).split(',')[0].trim() : null;
  const isYC = company?.['Y Combinator'] === 'Yes' || company?.yc === 'Yes';

  useEffect(() => {
    if (isOpen && company && userData) {
      setQuotaStatus(getGmailQuotaStatus());
      checkCooldown();
      setSendStatus('idle');
      setError(null);
    }
  }, [isOpen, company, userData]);

  const checkCooldown = async () => {
    if (!company || !userData) return;
    const cooldownCheck = await canNudgeCompany(userData.email, companyName);
    setCooldownWarning(cooldownCheck.canNudge ? null : cooldownCheck.reason);
  };

  const handleCopyEmail = () => {
    if (!companyEmail) return;
    navigator.clipboard.writeText(companyEmail);
    setShowEmailCopied(true);
    setTimeout(() => setShowEmailCopied(false), 2000);
    toast.success('Copied company email!');
  };

  const handleCopyProfile = () => {
    const profileLink = `https://candidate.joindrafted.com/candidate/${userData.email}`;
    navigator.clipboard.writeText(profileLink);
    setShowProfileCopied(true);
    setTimeout(() => setShowProfileCopied(false), 2000);
    toast.success('Copied profile link!');
  };

  const handleCopyMessage = () => {
    const plainText = generatePlainTextEmail(userData, companyName);
    navigator.clipboard.writeText(plainText);
    setShowMessageCopied(true);
    setTimeout(() => setShowMessageCopied(false), 2000);
    toast.success('Copied email message!');
  };

  const handleCopyLinkedInDM = () => {
    const dm = generateLinkedInDM(userData, companyName);
    navigator.clipboard.writeText(dm);
    setShowDMCopied(true);
    setTimeout(() => setShowDMCopied(false), 2000);
    toast.success('Copied LinkedIn DM!');
  };

  const handleLinkedInSearch = () => {
    const encodedCompanyName = encodeURIComponent(companyName);
    const linkedInSearchUrl = `https://www.linkedin.com/search/results/companies/?keywords=${encodedCompanyName}&origin=SWITCH_SEARCH_VERTICAL`;
    window.open(linkedInSearchUrl, '_blank', 'noopener,noreferrer');
  };

  const handleYCSearch = () => {
    const encodedCompanyName = encodeURIComponent(companyName);
    const ycSearchUrl = `https://www.ycombinator.com/companies?query=${encodedCompanyName}`;
    window.open(ycSearchUrl, '_blank', 'noopener,noreferrer');
  };

  const handleSend = async () => {
    if (!companyEmail) {
      setError('No email address available for this company');
      return;
    }

    setError(null);

    const result = await sendSingleNudge({
      company: { Company: companyName, Email: companyEmail },
      recipientEmail: companyEmail,
      userData,
      onProgress: (status) => setSendStatus(status),
      onSuccess: (result) => {
        setSendStatus('sent');
        setQuotaStatus(getGmailQuotaStatus());
        toast.success(`Nudge sent to ${companyName}!`);
        onEmailSent?.({ ...result, company: companyName });
        
        setTimeout(() => {
          onClose();
          setSendStatus('idle');
          setError(null);
          setCooldownWarning(null);
        }, 2000);
      },
      onError: (error) => {
        setSendStatus('error');
        setError(error);
        toast.error(`Failed to send: ${error}`);
      }
    });

    if (!result.success && result.error) {
      setSendStatus('error');
      setError(result.error);
    }
  };

  const subject = generateEmailSubject(userData);
  const plainTextBody = generatePlainTextEmail(userData, companyName);

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="max-w-4xl mx-auto mt-10 liquid-glass rounded-2xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
      overlayClassName="fixed inset-0 bg-black/60 backdrop-blur-md flex items-start justify-center z-50 overflow-y-auto pt-10 pb-10"
      style={{
        content: {
          background: 'linear-gradient(135deg, rgba(31, 41, 55, 0.95) 0%, rgba(17, 24, 39, 0.95) 50%, rgba(31, 41, 55, 0.95) 100%)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.15)',
        }
      }}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        disabled={sendStatus === 'authenticating' || sendStatus === 'sending'}
        className="absolute top-6 right-6 p-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all disabled:opacity-50 group"
      >
        <X className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
      </button>

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          Send nudge to {companyName}
        </h2>
        <p className="text-sm text-gray-400">
          Reach out with a personalized message and your video profile
        </p>
      </div>

      {/* Success State */}
      {sendStatus === 'sent' && (
        <div className="flex flex-col items-center justify-center py-12 mb-6">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4 animate-bounce">
            <Check className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Nudge Sent!</h3>
          <p className="text-gray-400 text-center">
            Your message has been sent to {companyName}
          </p>
        </div>
      )}

      {sendStatus !== 'sent' && (
        <>
          {/* Cooldown Warning */}
          {cooldownWarning && (
            <div className="mb-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-400 font-medium">Cooldown Active</p>
                <p className="text-sm text-yellow-400/80 mt-1">{cooldownWarning}</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {sendStatus === 'error' && error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-400 font-medium">Failed to send</p>
                <p className="text-sm text-red-400/80 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* LinkedIn & YC Search Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={handleLinkedInSearch}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 border border-[#0A66C2]/30 rounded-xl transition-all group"
            >
              <LinkedIn className="text-[#0A66C2]" />
              <span className="text-white font-medium">Search on LinkedIn</span>
              <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
            </button>

            {isYC && (
              <button
                onClick={handleYCSearch}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 rounded-xl transition-all group"
              >
                <Image src="/ycLogo.png" alt="YC" width={20} height={20} />
                <span className="text-white font-medium">Search on YC</span>
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
              </button>
            )}
          </div>

          {/* Email Preview */}
          <div className="mb-6 p-6 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm">
            <div className="mb-4">
              <div className="text-sm font-medium text-gray-400 mb-2">Subject</div>
              <div className="text-white font-medium">{subject}</div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-400">Message</div>
                <button
                  onClick={handleCopyMessage}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all group"
                >
                  <ContentCopy className="text-gray-400 group-hover:text-white transition-colors" style={{ fontSize: 16 }} />
                  <span className="text-sm text-gray-400 group-hover:text-white transition-colors">
                    {showMessageCopied ? 'Copied!' : 'Copy'}
                  </span>
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto p-4 bg-black/20 rounded-lg border border-white/5">
                <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">
                  {plainTextBody}
                </pre>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={handleCopyEmail}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group"
            >
              <Mail className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
              <span className="text-white font-medium">
                {showEmailCopied ? 'Copied!' : 'Copy Recruiter Email'}
              </span>
            </button>

            <button
              onClick={handleCopyProfile}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group"
            >
              <Clipboard className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
              <span className="text-white font-medium">
                {showProfileCopied ? 'Copied!' : 'Copy Drafted Profile'}
              </span>
            </button>

            <button
              onClick={handleCopyLinkedInDM}
              className="col-span-2 flex items-center justify-center gap-2 px-4 py-3 bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 border border-[#0A66C2]/30 rounded-xl transition-all group"
            >
              <LinkedIn className="text-[#0A66C2]" />
              <span className="text-white font-medium">
                {showDMCopied ? 'Copied!' : 'Copy Personalized LinkedIn DM'}
              </span>
            </button>
          </div>

          {/* Quota Info */}
          {quotaStatus && (
            <div className="mb-6 flex items-center justify-center gap-2 text-sm text-gray-400">
              <Clock className="w-4 h-4" />
              <span>
                Daily quota: <span className="text-white font-medium">{quotaStatus.used}/{quotaStatus.limit}</span> emails sent
              </span>
            </div>
          )}

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={sendStatus === 'checking' || sendStatus === 'authenticating' || sendStatus === 'sending' || !companyEmail || cooldownWarning}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-drafted-green to-drafted-emerald hover:from-drafted-emerald hover:to-drafted-green disabled:from-gray-600 disabled:to-gray-700 rounded-xl font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-drafted-green/25 hover:shadow-xl hover:shadow-drafted-green/40 hover:-translate-y-0.5"
          >
            {sendStatus === 'checking' && (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Checking...
              </>
            )}
            {sendStatus === 'authenticating' && (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Authenticating with Gmail...
              </>
            )}
            {sendStatus === 'sending' && (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Sending via Gmail...
              </>
            )}
            {sendStatus === 'idle' && (
              <>
                <Send className="w-5 h-5" />
                {cooldownWarning ? 'Cooldown Active' : 'Send via Gmail'}
              </>
            )}
            {sendStatus === 'error' && (
              <>
                <AlertCircle className="w-5 h-5" />
                Try Again
              </>
            )}
          </button>
        </>
      )}
    </ReactModal>
  );
}
