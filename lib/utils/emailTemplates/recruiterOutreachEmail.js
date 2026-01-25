/**
 * Recruiter Outreach Email Template
 * Sent when a candidate reaches out to a company
 * 
 * NOTE: This file only contains the email HTML template generation.
 * For sending emails, use the appropriate Netlify function or emailService.
 */

import {
  createDraftedEmailTemplate,
  createHeading,
  createTextSection,
  createButton,
  createDivider,
  createCard,
  createList,
  createBadge,
} from './baseTemplate';

/**
 * Generate recruiter outreach email HTML content
 */
function getRecruiterOutreachContent({ 
  candidate, 
  company, 
  customMessage,
  includeResume = true,
  includeLinkedIn = true,
  includeGitHub = true,
}) {
  const { firstName, lastName, university, major, position, linkedInURL, gitHubURL, resume, email } = candidate;
  const positionType = position === 'fulltime' ? 'Full-time' : 'Internship';
  
  // Build profile highlights
  const highlights = [];
  if (university && major) {
    highlights.push(`<strong>Education:</strong> ${major} at ${university}`);
  }
  if (position) {
    highlights.push(`<strong>Seeking:</strong> ${positionType} opportunities`);
  }
  
  // Build links section
  const links = [];
  if (includeLinkedIn && linkedInURL) {
    links.push(`<a href="${linkedInURL}" style="color: #22c55e; text-decoration: none; font-weight: 500;">LinkedIn Profile →</a>`);
  }
  if (includeGitHub && gitHubURL) {
    links.push(`<a href="${gitHubURL}" style="color: #22c55e; text-decoration: none; font-weight: 500;">GitHub Profile →</a>`);
  }
  if (includeResume && resume) {
    links.push(`<a href="${resume}" style="color: #22c55e; text-decoration: none; font-weight: 500;">View Resume →</a>`);
  }
  
  return `
    ${createHeading(`${firstName} ${lastName}`, 1)}
    ${createTextSection(`
      <span style="color: #6b7280; font-size: 15px;">${positionType} Candidate interested in ${company || 'your company'}</span>
    `)}
    
    ${createDivider()}
    
    ${customMessage ? `
      ${createTextSection(customMessage)}
      ${createDivider()}
    ` : ''}
    
    ${highlights.length > 0 ? `
      ${createCard(`
        ${createHeading('Profile Highlights', 3)}
        ${createList(highlights)}
      `)}
    ` : ''}
    
    ${links.length > 0 ? `
      ${createTextSection('<strong>Learn More:</strong>')}
      <div style="margin: 16px 0;">
        ${links.map(link => `<div style="margin: 8px 0;">${link}</div>`).join('')}
      </div>
    ` : ''}
    
    ${createButton('View Full Profile on Drafted', `https://candidate.joindrafted.com/profile/${email}`)}
    
    ${createDivider()}
    
    ${createTextSection(`
      <span style="color: #6b7280; font-size: 14px;">
        This email was sent via Drafted, a platform connecting talented candidates with forward-thinking companies.
        ${firstName} is genuinely interested in opportunities at your company.
      </span>
    `)}
  `;
}

/**
 * Get recruiter outreach email subject line
 */
function getRecruiterOutreachSubject({ candidate, company }) {
  const { firstName, lastName, position } = candidate;
  const positionType = position === 'fulltime' ? 'Full-time' : 'Internship';
  
  if (company) {
    return `${firstName} ${lastName} — Interested in ${positionType} Opportunities at ${company}`;
  }
  return `${firstName} ${lastName} — ${positionType} Candidate`;
}

/**
 * Generate complete recruiter outreach email HTML
 * @param {Object} params
 * @param {Object} params.candidate - Candidate data
 * @param {string} params.recruiterName - Recruiter name (optional)
 * @param {string} params.company - Company name (optional)
 * @param {string} params.customMessage - Custom message from candidate
 * @returns {string} Complete HTML email
 */
export function generateRecruiterOutreachEmailHTML({ 
  candidate, 
  recruiterName = null,
  company = null,
  customMessage = null,
}) {
  const defaultMessage = `Hi${recruiterName ? ` ${recruiterName}` : ''},\n\nI'm ${candidate.firstName}, and I'm very interested in ${candidate.position === 'fulltime' ? 'full-time' : 'internship'} opportunities at ${company || 'your company'}. I believe my background in ${candidate.major} would be a great fit for your team.\n\nI'd love to discuss how I can contribute to your company's success!`;
  
  const content = getRecruiterOutreachContent({ 
    candidate, 
    company,
    customMessage: customMessage || defaultMessage,
  });
  
  return createDraftedEmailTemplate({
    content,
    preheader: `${candidate.firstName} ${candidate.lastName} is interested in opportunities at your company`,
  });
}

/**
 * Export all functions for use by server-side code
 */
export default {
  getRecruiterOutreachContent,
  getRecruiterOutreachSubject,
  generateRecruiterOutreachEmailHTML
};

