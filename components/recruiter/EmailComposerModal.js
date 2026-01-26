'use client';

import React, { useState, useEffect } from 'react';
import { X, Mail, Send, Loader2, Check, AlertCircle } from 'lucide-react';
import ReactModal from 'react-modal';
import { getGmailQuotaStatus } from '../../lib/gmail/gmailUtils';
import { generateEmailSubject, generateHtmlEmail } from '../../lib/gmail/emailUtils';
import { sendSingleNudge, canNudgeCompany } from '../../lib/services/nudgeService';

// Set app element for react-modal accessibility
if (typeof window !== 'undefined') {
  ReactModal.setAppElement('#root');
}

/**
 * EmailComposerModal - Email composition for recruiter outreach
 * Pre-fills email with candidate info and company context
 */
export default function EmailComposerModal({
  isOpen,
  onClose,
  company,
  userData,
  onEmailSent
}) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sendStatus, setSendStatus] = useState('idle'); // idle, checking, authenticating, sending, sent, error
  const [error, setError] = useState(null);
  const [quotaStatus, setQuotaStatus] = useState(null);
  const [cooldownWarning, setCooldownWarning] = useState(null);

  // Generate email content and check cooldown when modal opens
  useEffect(() => {
    if (isOpen && company && userData) {
      generateEmailContent();
      setQuotaStatus(getGmailQuotaStatus());
      checkCooldown();
    }
  }, [isOpen, company, userData]);

  const checkCooldown = async () => {
    if (!company || !userData) return;
    
    const companyName = company.Company || company.name || 'Company';
    const cooldownCheck = await canNudgeCompany(userData.email, companyName);
    
    if (!cooldownCheck.canNudge) {
      setCooldownWarning(cooldownCheck.reason);
    } else {
      setCooldownWarning(null);
    }
  };

  const generateEmailContent = () => {
    if (!userData || !company) return;

    // Use the professional email template generation
    const companyName = company.Company || company.name || 'your company';
    
    const generatedSubject = generateEmailSubject(userData);
    const generatedBody = generateHtmlEmail(userData, companyName);

    setSubject(generatedSubject);
    setBody(generatedBody);
  };

  const handleSend = async () => {
    if (!company?.Email) {
      setError('No email address available for this company');
      return;
    }

    setError(null);
    
    // Handle Email as string or array
    const emailStr = typeof company.Email === 'string' ? company.Email : String(company.Email);
    const recipientEmail = emailStr.split(',')[0].trim();
    const companyName = company.Company || company.name || 'Company';

    // Use the nudge service which handles cooldown, unsubscribe, and recording
    const result = await sendSingleNudge({
      company: { Company: companyName, Email: recipientEmail },
      recipientEmail,
      userData,
      onProgress: (status) => setSendStatus(status),
      onSuccess: (result) => {
        setSendStatus('sent');
        setQuotaStatus(getGmailQuotaStatus());
        onEmailSent?.({ ...result, company: companyName });
        
        // Close modal after short delay
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
      }
    });

    if (!result.success && result.error) {
      setSendStatus('error');
      setError(result.error);
    }
  };

  const handleClose = () => {
    if (sendStatus !== 'authenticating' && sendStatus !== 'sending') {
      onClose();
      setSendStatus('idle');
      setError(null);
    }
  };

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={handleClose}
      className="max-w-2xl mx-auto mt-10 bg-gray-900/95 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto"
      overlayClassName="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 overflow-y-auto pt-10 pb-10"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-drafted-green to-drafted-emerald flex items-center justify-center">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Send Nudge Email</h2>
            <p className="text-sm text-gray-400">to {company?.Company}</p>
          </div>
        </div>
        <button
          onClick={handleClose}
          disabled={sendStatus === 'authenticating' || sendStatus === 'sending'}
          className="p-2 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Success State */}
      {sendStatus === 'sent' && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
            <Check className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Email Sent!</h3>
          <p className="text-gray-400 text-center">
            Your nudge has been sent to {company?.Company}
          </p>
        </div>
      )}

      {/* Cooldown Warning */}
      {cooldownWarning && sendStatus !== 'sent' && (
        <div className="mb-6 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-yellow-400 font-medium">Cooldown Active</p>
            <p className="text-sm text-yellow-400/80 mt-1">{cooldownWarning}</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {sendStatus === 'error' && (
        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-400 font-medium">Failed to send email</p>
            <p className="text-sm text-red-400/80 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Email Form */}
      {sendStatus !== 'sent' && (
        <>
          {/* Recipient */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-2">To</label>
            <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-gray-300">
              {company?.Email?.split(',')[0]?.trim() || 'No email available'}
            </div>
          </div>

          {/* Subject */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-2">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-drafted-green/50"
            />
          </div>

          {/* Body */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-400 mb-2">Message</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={12}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-drafted-green/50 resize-none font-mono text-sm"
            />
          </div>

          {/* Quota Info */}
          {quotaStatus && (
            <div className="mb-6 text-sm text-gray-400">
              Daily quota: {quotaStatus.used}/{quotaStatus.limit} emails sent
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              disabled={sendStatus === 'authenticating' || sendStatus === 'sending'}
              className="flex-1 drafted-btn drafted-btn-glass py-3 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={sendStatus === 'checking' || sendStatus === 'authenticating' || sendStatus === 'sending' || !company?.Email || cooldownWarning}
              className="flex-1 drafted-btn drafted-btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50"
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
                  Authenticating...
                </>
              )}
              {sendStatus === 'sending' && (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              )}
              {(sendStatus === 'idle' || sendStatus === 'error') && (
                <>
                  <Send className="w-5 h-5" />
                  {cooldownWarning ? 'Cooldown Active' : 'Send Email'}
                </>
              )}
            </button>
          </div>
        </>
      )}
    </ReactModal>
  );
}
