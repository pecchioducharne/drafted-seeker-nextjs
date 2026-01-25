/**
 * Welcome Email Template
 * Sent when a new user signs up for Drafted
 * 
 * NOTE: This file only contains the email HTML template generation.
 * To send emails from the client, use: src/domains/shared/lib/emailService.js
 * This template is primarily used by Netlify functions server-side.
 */

import {
  createDraftedEmailTemplate,
  createHeading,
  createTextSection,
  createButton,
  createDivider,
  createCard,
  createList,
} from './baseTemplate';

/**
 * Generate welcome email HTML content
 */
function getWelcomeEmailContent({ firstName }) {
  return `
    ${createHeading(`Hi ${firstName ? firstName : 'there'},`, 1)}
    
    ${createTextSection(`
      Welcome to Drafted. You've just joined a community where startups and emerging talent actually connect — no endless applications or waiting to hear back. Just real opportunities, faster.
    `)}
    
    ${createCard(`
      ${createHeading('Your next steps (takes about 5 minutes):', 3)}
      ${createList([
        '<strong>Record your 30-second video</strong> — The first part of your video resume. Let companies see who you are beyond the paper.',
        '<strong>Share your profile on LinkedIn</strong> — Unlock your account and start getting discovered by recruiters.',
        '<strong>Click "Mass Apply"</strong> — Automatically apply to multiple companies with your complete profile.'
      ])}
    `, '#f0fdf4')}
    
    ${createButton('Complete Your Profile', 'https://joindrafted.com/dashboard')}
    
    ${createDivider()}
    
    ${createHeading('Why record a video?', 3)}
    ${createTextSection(`
      Recruiters spend about 6 seconds on a resume — but they'll watch a 30-second video.<br>
      It's your chance to show your energy, curiosity, and what drives you — the things that don't fit on a PDF.
    `)}
    
    ${createCard(`
      ${createHeading('Tips for your video:', 3)}
      ${createList([
        "You'll see tailored talking points to help spark ideas — they're just there to guide you if you need them",
        "Share what you're looking for and what excites you",
        "Highlight your strengths or one or two things you're proud of",
        "Most importantly, be yourself — use your personal stories, challenges, and voice to stand out. Be creative and have fun with it."
      ])}
    `, '#eff6ff')}
    
    ${createTextSection(`
      Candidates with video resumes get 3× more recruiter interest. Once you record your video, share it on LinkedIn, and hit Mass Apply, you'll be ready to start getting interviews.
    `)}
    
    ${createDivider()}
    
    ${createTextSection(`
      Questions? Just reply — we actually read and respond to every message.
    `)}
    
    ${createTextSection(`
      Let's get you hired,<br>
      <br />
      Ashley<br />
      <span style="color: #6b7280;">Head of Community @ Drafted</span>
    `)}
  `;
}

/**
 * Get welcome email subject line
 */
function getWelcomeEmailSubject({ firstName }) {
  return `Welcome to Drafted, ${firstName}! Let's get you hired 🚀`;
}

/**
 * Generate complete welcome email HTML
 * @param {Object} params
 * @param {string} params.firstName - User's first name
 * @returns {string} Complete HTML email
 */
export function generateWelcomeEmailHTML({ firstName }) {
  const content = getWelcomeEmailContent({ firstName });
  return createDraftedEmailTemplate({
    content,
    preheader: 'Get started with Drafted and connect with top companies',
  });
}

/**
 * Export the functions that can be used by Netlify functions or other server-side code
 */
export default {
  getWelcomeEmailContent,
  getWelcomeEmailSubject,
  generateWelcomeEmailHTML
};
