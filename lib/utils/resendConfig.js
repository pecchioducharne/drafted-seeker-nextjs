/**
 * Resend Email Service Configuration
 * 
 * Centralized configuration for the Resend email client.
 * 
 * IMPORTANT: For production, the API key is set via Netlify environment variables.
 */

import ResendClient from './ResendClient';

// Resend API Key
// For local testing, you can set the key directly here
// In production, this will use the VITE_RESEND_API_KEY from Netlify environment variables
const RESEND_API_KEY = process.env.VITE_RESEND_API_KEY || import.meta.env.VITE_RESEND_API_KEY || 're_9uD4exak_6oRNwTvP8JYCW3Uqwv5gRqu9';

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
