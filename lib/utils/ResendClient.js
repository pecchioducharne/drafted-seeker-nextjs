/**
 * ResendClient - A versatile email client for the Resend API
 * 
 * This class provides a clean interface for sending emails using Resend's API.
 * It supports all major email features including HTML/text content, CC, BCC, 
 * reply-to addresses, and attachments.
 * 
 * @see https://resend.com/docs/api-reference/introduction
 */

import { Resend } from 'resend';

class ResendClient {
  /**
   * Initialize the Resend client
   * @param {string} apiKey - Your Resend API key (starts with 're_')
   */
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('Resend API key is required');
    }
    if (!apiKey.startsWith('re_')) {
      console.warn('Warning: Resend API keys typically start with "re_"');
    }
    
    this.resend = new Resend(apiKey);
    this.apiKey = apiKey;
  }

  /**
   * Send an email using Resend
   * 
   * @param {Object} options - Email options
   * @param {string} options.from - Sender email address (e.g., "Your Name <sender@example.com>")
   * @param {string|string[]} options.to - Recipient email address(es)
   * @param {string} options.subject - Email subject line
   * @param {string} [options.html] - HTML content of the email
   * @param {string} [options.text] - Plain text content of the email
   * @param {string|string[]} [options.cc] - CC email address(es)
   * @param {string|string[]} [options.bcc] - BCC email address(es)
   * @param {string} [options.replyTo] - Reply-to email address
   * @param {Array<Object>} [options.attachments] - Array of attachment objects
   * @param {Object} [options.tags] - Custom tags for email tracking
   * @param {Object} [options.headers] - Custom email headers
   * 
   * @returns {Promise<Object>} Response from Resend API including message ID
   * 
   * @example
   * const response = await client.sendEmail({
   *   from: 'Your Name <you@example.com>',
   *   to: 'recipient@example.com',
   *   subject: 'Hello World',
   *   html: '<p>This is a test email</p>',
   *   text: 'This is a test email'
   * });
   */
  async sendEmail(options) {
    try {
      // Validate required fields
      this._validateEmailOptions(options);

      // Prepare email data
      const emailData = {
        from: options.from,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
      };

      // Add optional HTML content
      if (options.html) {
        emailData.html = options.html;
      }

      // Add optional plain text content
      if (options.text) {
        emailData.text = options.text;
      }

      // Add optional CC
      if (options.cc) {
        emailData.cc = Array.isArray(options.cc) ? options.cc : [options.cc];
      }

      // Add optional BCC
      if (options.bcc) {
        emailData.bcc = Array.isArray(options.bcc) ? options.bcc : [options.bcc];
      }

      // Add optional reply-to
      if (options.replyTo) {
        emailData.reply_to = options.replyTo;
      }

      // Add optional attachments
      if (options.attachments && options.attachments.length > 0) {
        emailData.attachments = options.attachments;
      }

      // Add optional tags
      if (options.tags) {
        emailData.tags = options.tags;
      }

      // Add optional headers
      if (options.headers) {
        emailData.headers = options.headers;
      }

      // Send email via Resend
      const response = await this.resend.emails.send(emailData);

      // Handle both success response formats
      const emailId = response.data?.id || response.id;
      
      console.log('✅ Email sent successfully:', {
        id: emailId,
        to: emailData.to,
        subject: emailData.subject,
      });

      return {
        success: true,
        id: emailId,
        data: response.data,
        error: response.error,
      };

    } catch (error) {
      console.error('❌ Failed to send email:', error);
      
      // Handle specific Resend errors
      if (error.statusCode === 401) {
        throw new Error('Invalid Resend API key');
      } else if (error.statusCode === 403) {
        throw new Error('Forbidden: API key does not have permission');
      } else if (error.statusCode === 429) {
        throw new Error('Rate limit exceeded: Too many requests');
      } else if (error.statusCode === 400) {
        throw new Error(`Bad request: ${error.message}`);
      }

      throw error;
    }
  }

  /**
   * Send a batch of emails (up to 100 emails at once)
   * 
   * @param {Array<Object>} emails - Array of email objects (same format as sendEmail options)
   * @returns {Promise<Object>} Response with batch results
   * 
   * @example
   * const response = await client.sendBatch([
   *   { from: 'you@example.com', to: 'user1@example.com', subject: 'Hi', html: '<p>Hello</p>' },
   *   { from: 'you@example.com', to: 'user2@example.com', subject: 'Hi', html: '<p>Hello</p>' }
   * ]);
   */
  async sendBatch(emails) {
    try {
      if (!Array.isArray(emails) || emails.length === 0) {
        throw new Error('Emails must be a non-empty array');
      }

      if (emails.length > 100) {
        throw new Error('Batch size cannot exceed 100 emails');
      }

      // Validate all emails
      emails.forEach((email, index) => {
        try {
          this._validateEmailOptions(email);
        } catch (error) {
          throw new Error(`Invalid email at index ${index}: ${error.message}`);
        }
      });

      // Format emails for batch sending
      const formattedEmails = emails.map(email => ({
        from: email.from,
        to: Array.isArray(email.to) ? email.to : [email.to],
        subject: email.subject,
        html: email.html,
        text: email.text,
        cc: email.cc ? (Array.isArray(email.cc) ? email.cc : [email.cc]) : undefined,
        bcc: email.bcc ? (Array.isArray(email.bcc) ? email.bcc : [email.bcc]) : undefined,
        reply_to: email.replyTo,
        attachments: email.attachments,
        tags: email.tags,
        headers: email.headers,
      }));

      const response = await this.resend.batch.send(formattedEmails);

      console.log(`✅ Batch of ${emails.length} emails sent successfully`);

      return {
        success: true,
        data: response.data,
      };

    } catch (error) {
      console.error('❌ Failed to send batch emails:', error);
      throw error;
    }
  }

  /**
   * Retrieve email details by ID
   * 
   * @param {string} emailId - The email ID returned from sendEmail
   * @returns {Promise<Object>} Email details
   */
  async getEmail(emailId) {
    try {
      if (!emailId) {
        throw new Error('Email ID is required');
      }

      const response = await this.resend.emails.get(emailId);
      
      // Return the data portion or full response
      return response.data || response;

    } catch (error) {
      console.error(`❌ Failed to retrieve email ${emailId}:`, error);
      throw error;
    }
  }

  /**
   * Validate email options
   * @private
   */
  _validateEmailOptions(options) {
    if (!options) {
      throw new Error('Email options are required');
    }

    if (!options.from) {
      throw new Error('Sender email (from) is required');
    }

    if (!options.to) {
      throw new Error('Recipient email (to) is required');
    }

    if (!options.subject) {
      throw new Error('Email subject is required');
    }

    if (!options.html && !options.text) {
      throw new Error('Either HTML or text content is required');
    }

    // Validate email format (basic check)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const extractEmail = (email) => {
      const match = email.match(/<([^>]+)>/);
      return match ? match[1] : email;
    };

    const fromEmail = extractEmail(options.from);
    if (!emailRegex.test(fromEmail)) {
      throw new Error(`Invalid sender email format: ${options.from}`);
    }

    // Validate recipient emails
    const recipients = Array.isArray(options.to) ? options.to : [options.to];
    recipients.forEach(email => {
      const cleanEmail = extractEmail(email);
      if (!emailRegex.test(cleanEmail)) {
        throw new Error(`Invalid recipient email format: ${email}`);
      }
    });
  }

  /**
   * Create a simple HTML email template
   * @param {Object} options - Template options
   * @param {string} options.title - Email title/heading
   * @param {string} options.content - Main content (supports HTML)
   * @param {string} [options.footer] - Optional footer text
   * @param {string} [options.primaryColor] - Primary color for branding
   * @returns {string} HTML email template
   */
  static createSimpleTemplate({ title, content, footer, primaryColor = '#007bff' }) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: ${primaryColor};
      color: white;
      padding: 20px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .content {
      background-color: #f9f9f9;
      padding: 30px;
      border-radius: 0 0 8px 8px;
    }
    .footer {
      text-align: center;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      color: #666;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${title}</h1>
  </div>
  <div class="content">
    ${content}
  </div>
  ${footer ? `<div class="footer">${footer}</div>` : ''}
</body>
</html>
    `.trim();
  }
}

export default ResendClient;

