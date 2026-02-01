/**
 * Resend Email Service Configuration - SERVER-SIDE ONLY
 * 
 * IMPORTANT: This file should ONLY be used in server-side code (API routes, server components, server actions).
 * DO NOT import this in client components - use /lib/utils/emailService.js instead.
 * 
 * For production, the API key is set via Netlify environment variables.
 */

import ResendClient from './ResendClient';

// Resend API Key - SERVER-SIDE ONLY
// This should only be accessed from Netlify Functions or Next.js API routes
const RESEND_API_KEY = process.env.RESEND_API_KEY;

// Initialize singleton instance
let resendClient = null;

/**
 * Get the Resend client instance (singleton pattern)
 * @returns {ResendClient} Configured Resend client
 */
export function getResendClient() {
  if (!resendClient) {
    resendClient = new ResendClient(RESEND_API_KEY);
  }
  return resendClient;
}

/**
 * Default sender configuration
 * Using verified gotdrafted.com domain
 */
const DEFAULT_SENDER = {
  name: 'Ashley from Drafted',
  email: 'ashley@gotdrafted.com',
  replyTo: 'ashley@gotdrafted.com',
};

/**
 * Helper function to send an email with default configuration
 * 
 * @param {Object} options - Email options
 * @param {string|string[]} options.to - Recipient email(s)
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} [options.text] - Plain text content
 * @param {string} [options.from] - Override default sender
 * @param {string|string[]} [options.cc] - CC recipients
 * @param {string|string[]} [options.bcc] - BCC recipients
 * @param {string} [options.replyTo] - Override default reply-to
 * @returns {Promise<Object>} Send result
 */
export async function sendDraftedEmail(options) {
  const client = getResendClient();
  
  return client.sendEmail({
    from: options.from || `${DEFAULT_SENDER.name} <${DEFAULT_SENDER.email}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
    cc: options.cc,
    bcc: options.bcc,
    replyTo: options.replyTo || DEFAULT_SENDER.replyTo,
  });
}

export {
  DEFAULT_SENDER,
  RESEND_API_KEY, // Export for direct access if needed
};
