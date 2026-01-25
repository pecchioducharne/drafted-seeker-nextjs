/**
 * ResendClient Usage Examples
 * 
 * This file demonstrates how to use the ResendClient class for sending emails.
 * For production use, make sure to:
 * 1. Store API keys in environment variables (not hardcoded)
 * 2. Set up a verified domain in Resend dashboard
 * 3. Handle errors appropriately
 */

const ResendClient = require('./ResendClient');

// Initialize the client (use environment variable in production)
const client = new ResendClient(process.env.RESEND_API_KEY);

// ============================================================
// Example 1: Simple Email
// ============================================================
async function sendSimpleEmail() {
  try {
    const result = await client.sendEmail({
      from: 'Your Name <you@yourdomain.com>',
      to: 'recipient@example.com',
      subject: 'Hello from Drafted!',
      html: '<h1>Welcome!</h1><p>This is a simple email.</p>',
      text: 'Welcome! This is a simple email.',
    });
    
    console.log('Email sent:', result.id);
  } catch (error) {
    console.error('Failed to send email:', error.message);
  }
}

// ============================================================
// Example 2: Email with Template
// ============================================================
async function sendTemplatedEmail() {
  const htmlContent = ResendClient.createSimpleTemplate({
    title: 'Welcome to Drafted',
    content: `
      <h2>Hello there!</h2>
      <p>Thank you for joining Drafted.</p>
      <p>Here are your next steps:</p>
      <ol>
        <li>Complete your profile</li>
        <li>Upload your resume</li>
        <li>Start applying to jobs</li>
      </ol>
    `,
    footer: 'Drafted Team | 2025',
    primaryColor: '#6366f1',
  });

  try {
    const result = await client.sendEmail({
      from: 'Drafted <hello@yourdomain.com>',
      to: 'newuser@example.com',
      subject: 'Welcome to Drafted!',
      html: htmlContent,
    });
    
    console.log('Welcome email sent:', result.id);
  } catch (error) {
    console.error('Failed to send welcome email:', error.message);
  }
}

// ============================================================
// Example 3: Email with CC, BCC, and Reply-To
// ============================================================
async function sendEmailWithCCBCC() {
  try {
    const result = await client.sendEmail({
      from: 'Sales <sales@yourdomain.com>',
      to: 'client@example.com',
      cc: ['manager@yourdomain.com'],
      bcc: ['archive@yourdomain.com'],
      replyTo: 'support@yourdomain.com',
      subject: 'Meeting Follow-up',
      html: '<p>Thank you for the meeting today!</p>',
    });
    
    console.log('Follow-up email sent:', result.id);
  } catch (error) {
    console.error('Failed to send follow-up:', error.message);
  }
}

// ============================================================
// Example 4: Batch Email Sending
// ============================================================
async function sendBatchEmails() {
  const recipients = [
    { email: 'user1@example.com', name: 'Alice' },
    { email: 'user2@example.com', name: 'Bob' },
    { email: 'user3@example.com', name: 'Charlie' },
  ];

  const emails = recipients.map(recipient => ({
    from: 'Drafted <hello@yourdomain.com>',
    to: recipient.email,
    subject: `Hi ${recipient.name}!`,
    html: `<p>Hello ${recipient.name}, this is a personalized message just for you!</p>`,
  }));

  try {
    const result = await client.sendBatch(emails);
    console.log(`Sent ${emails.length} emails successfully`);
  } catch (error) {
    console.error('Failed to send batch emails:', error.message);
  }
}

// ============================================================
// Example 5: Retrieve Email Status
// ============================================================
async function checkEmailStatus(emailId) {
  try {
    const email = await client.getEmail(emailId);
    console.log('Email status:', {
      to: email.to,
      subject: email.subject,
      status: email.last_event,
      created: email.created_at,
    });
  } catch (error) {
    console.error('Failed to retrieve email:', error.message);
  }
}

// ============================================================
// Example 6: Recruiter Outreach Email
// ============================================================
async function sendRecruiterOutreach(candidateData, recruiterEmail) {
  const { firstName, linkedInURL, gitHubURL, resume, university, major } = candidateData;
  
  const htmlContent = ResendClient.createSimpleTemplate({
    title: `${firstName} - Full-time Software Engineer`,
    content: `
      <h2>Hello!</h2>
      <p>My name is ${firstName}, and I'm a ${major} student at ${university} looking for full-time opportunities.</p>
      
      <h3>Quick Links</h3>
      <ul>
        <li><a href="${linkedInURL}">LinkedIn Profile</a></li>
        <li><a href="${gitHubURL}">GitHub Profile</a></li>
        <li><a href="${resume}">Resume</a></li>
      </ul>
      
      <p>I'd love to chat about opportunities at your company!</p>
      
      <p>Best regards,<br>${firstName}</p>
    `,
    footer: 'Sent via Drafted',
    primaryColor: '#6366f1',
  });

  try {
    const result = await client.sendEmail({
      from: `${firstName} <${candidateData.email}>`,
      to: recruiterEmail,
      subject: `${firstName} - Interested in Full-time Opportunities`,
      html: htmlContent,
      replyTo: candidateData.email,
    });
    
    console.log('Recruiter outreach sent:', result.id);
    return result;
  } catch (error) {
    console.error('Failed to send recruiter outreach:', error.message);
    throw error;
  }
}

// ============================================================
// Example 7: Error Handling with Retry Logic
// ============================================================
async function sendEmailWithRetry(emailOptions, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await client.sendEmail(emailOptions);
      console.log(`Email sent on attempt ${attempt}`);
      return result;
    } catch (error) {
      if (error.statusCode === 429) {
        // Rate limit - wait before retry
        const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff
        console.log(`Rate limited. Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else if (attempt === maxRetries) {
        throw error; // Final attempt failed
      }
    }
  }
}

// ============================================================
// Usage in Express.js API
// ============================================================
/*
const express = require('express');
const app = express();

app.post('/api/send-email', async (req, res) => {
  const { to, subject, message } = req.body;
  
  try {
    const result = await client.sendEmail({
      from: 'Drafted <hello@yourdomain.com>',
      to: to,
      subject: subject,
      html: message,
    });
    
    res.json({ success: true, emailId: result.id });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});
*/

// ============================================================
// Usage in Firebase Cloud Functions
// ============================================================
/*
const functions = require('firebase-functions');

exports.sendWelcomeEmail = functions.auth.user().onCreate(async (user) => {
  const htmlContent = ResendClient.createSimpleTemplate({
    title: 'Welcome to Drafted!',
    content: '<h2>Thanks for signing up!</h2>',
    footer: 'Drafted Team',
  });

  try {
    await client.sendEmail({
      from: 'Drafted <hello@yourdomain.com>',
      to: user.email,
      subject: 'Welcome!',
      html: htmlContent,
    });
    console.log('Welcome email sent to', user.email);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }
});
*/

module.exports = {
  sendSimpleEmail,
  sendTemplatedEmail,
  sendEmailWithCCBCC,
  sendBatchEmails,
  checkEmailStatus,
  sendRecruiterOutreach,
  sendEmailWithRetry,
};

