import { MESSAGE_VARIATIONS, EMAIL_QUALITY } from './constants';

/**
 * ROBUST EMAIL GENERATION SYSTEM
 * 
 * This module provides bulletproof email generation for mass nudge operations.
 * All functions include validation and fallbacks to ensure emails are never empty.
 */

// Generate email subject based on user data
export const generateEmailSubject = (userData) => {
  const firstName = userData?.firstName || 'Candidate';
  const position = userData?.position === 'fulltime' ? 'Full-time' : 'Internship';
  return `Hey, ${firstName} here! (${position} Candidate)`;
};

/**
 * Generate complete email content with validation
 * This function NEVER returns an empty message
 */
export const generateEmailContent = (userData, company) => {
  // Validate and extract user data with fallbacks
  const firstName = userData?.firstName || 'Candidate';
  const lastName = userData?.lastName || '';
  const major = userData?.major || 'their field';
  const university = userData?.university || 'their university';
  const email = userData?.email || '';
  const linkedInURL = userData?.linkedInURL || '';
  const gitHubURL = userData?.gitHubURL || '';
  const resume = userData?.resume || '';
  const position = userData?.position === 'fulltime' ? 'full-time' : 'internship';
  
  // Build profile URL
  const profileUrl = email ? `https://candidate.joindrafted.com/candidate/${email}` : '';
  
  // Company name with fallback
  const companyName = company || 'your company';

  // Start building the message
  let message = `Hi,\n\n`;
  message += `My name is ${firstName}${lastName ? ' ' + lastName : ''}, and I am a ${major} grad from ${university}.\n\n`;
  message += `I'm reaching out because I'm excited to explore ${position} opportunities at ${companyName} and share how I can contribute.\n\n`;
  message += `To introduce myself in a more engaging way, I've created a brief video resume that includes AI-generated culture tags—these tags highlight my values and work style, making it easy to see if there's a strong culture fit between us. Along with my video profile, I've included my resume and relevant links to provide a complete picture of my background and capabilities.\n\n`;
  
  // Profile link section
  if (profileUrl) {
  message += `View my full profile & video resume here: ${profileUrl}\n\n`;
  }
  
  // Credentials section - only show header if we have at least one credential
  const hasCredentials = linkedInURL || gitHubURL || resume;
  
  if (hasCredentials) {
  message += `Quick access to my credentials:\n\n`;

    if (linkedInURL) {
      message += `🔗 LinkedIn: ${linkedInURL}\n\n`;
    }
    if (gitHubURL) {
      message += `💻 GitHub: ${gitHubURL}\n\n`;
    }
    if (resume) {
      message += `📄 Resume: ${resume}\n\n`;
    }
  }

  // Closing section
  message += `I'm particularly drawn to ${companyName}'s vision and the opportunity to work with such a talented team. I believe my skills and enthusiasm for creating impact would make me a great fit for your dynamic environment.\n\n`;
  message += `Looking forward to potentially discussing how I can contribute to ${companyName}'s exciting journey.\n\n`;
  message += `Best regards,\n\n`;
  message += `${firstName}\n\n`;
  message += `_I was able to find ${companyName} and send this message through joindrafted.com, a platform that connects driven candidates like me with companies like yours._`;

  // VALIDATION: Ensure message is never too short
  if (message.length < 200) {
    console.error('[EmailUtils] WARNING: Generated message is suspiciously short', { length: message.length, userData, company });
  }

  return { message };
};

/**
 * Generate HTML email with professional styling
 * This is the MAIN function for mass nudge emails
 */
export const generateHtmlEmail = (userData, company) => {
  // Get validated data
  const firstName = userData?.firstName || 'Candidate';
  const lastName = userData?.lastName || '';
  const major = userData?.major || 'their field';
  const university = userData?.university || 'their university';
  const email = userData?.email || '';
  const linkedInURL = userData?.linkedInURL || '';
  const gitHubURL = userData?.gitHubURL || '';
  const resume = userData?.resume || '';
  const position = userData?.position === 'fulltime' ? 'full-time' : 'internship';
  
  const profileUrl = email ? `https://candidate.joindrafted.com/candidate/${email}` : '';
  const companyName = company || 'your company';

  // Build HTML email with inline styles
  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" cellspacing="0" cellpadding="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <tr>
      <td style="padding: 32px 24px;">
        
        <!-- Greeting -->
        <p style="margin: 0 0 16px 0; font-size: 16px; color: #333333; line-height: 1.6;">
          Hi,
        </p>
        
        <!-- Introduction -->
        <p style="margin: 0 0 16px 0; font-size: 16px; color: #333333; line-height: 1.6;">
          My name is <strong>${firstName}${lastName ? ' ' + lastName : ''}</strong>, and I am a <strong>${major}</strong> grad from <strong>${university}</strong>.
        </p>
        
        <p style="margin: 0 0 16px 0; font-size: 16px; color: #333333; line-height: 1.6;">
          I'm reaching out because I'm excited to explore ${position} opportunities at <strong>${companyName}</strong> and share how I can contribute.
        </p>
        
        <p style="margin: 0 0 24px 0; font-size: 16px; color: #333333; line-height: 1.6;">
          To introduce myself in a more engaging way, I've created a brief video resume that includes AI-generated culture tags—these tags highlight my values and work style, making it easy to see if there's a strong culture fit between us.
        </p>`;

  // Profile CTA Button
  if (profileUrl) {
    html += `
        <!-- Profile CTA -->
        <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 24px 0; width: 100%;">
          <tr>
            <td style="background: linear-gradient(135deg, #f0f7f4 0%, #e8f5e9 100%); border-left: 4px solid #00875A; padding: 20px; border-radius: 8px;">
              <p style="margin: 0 0 12px 0; font-weight: 600; color: #00875A; font-size: 16px;">
                🎥 View my full profile &amp; video resume:
              </p>
              <a href="${profileUrl}" style="display: inline-block; background-color: #00875A; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">
                Open My Drafted Profile →
              </a>
            </td>
          </tr>
        </table>`;
  }

  // Credentials section - only include if there are credentials
  const hasCredentials = linkedInURL || gitHubURL || resume;
  
  if (hasCredentials) {
    html += `
        <!-- Credentials -->
        <div style="margin: 24px 0; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
          <p style="margin: 0 0 16px 0; font-weight: 600; color: #333333; font-size: 16px;">
            📋 Quick access to my credentials:
          </p>
          <table role="presentation" cellspacing="0" cellpadding="0" style="width: 100%;">`;
    
    if (linkedInURL) {
      html += `
            <tr>
              <td style="padding: 8px 0;">
                <span style="margin-right: 8px;">💼</span>
                <a href="${linkedInURL}" style="color: #0A66C2; text-decoration: none; font-weight: 500;">LinkedIn Profile</a>
              </td>
            </tr>`;
    }
    
    if (gitHubURL) {
      html += `
            <tr>
              <td style="padding: 8px 0;">
                <span style="margin-right: 8px;">💻</span>
                <a href="${gitHubURL}" style="color: #24292F; text-decoration: none; font-weight: 500;">GitHub Portfolio</a>
              </td>
            </tr>`;
    }
    
    if (resume) {
      html += `
            <tr>
              <td style="padding: 8px 0;">
                <span style="margin-right: 8px;">📄</span>
                <a href="${resume}" style="color: #00875A; text-decoration: none; font-weight: 500;">Download Resume</a>
              </td>
            </tr>`;
    }
    
    html += `
          </table>
        </div>`;
  }

  // Closing section
  html += `
        <!-- Closing -->
        <p style="margin: 24px 0 16px 0; font-size: 16px; color: #333333; line-height: 1.6;">
          I'm particularly drawn to ${companyName}'s vision and the opportunity to work with such a talented team. I believe my skills and enthusiasm for creating impact would make me a great fit for your dynamic environment.
        </p>
        
        <p style="margin: 0 0 24px 0; font-size: 16px; color: #333333; line-height: 1.6;">
          Looking forward to potentially discussing how I can contribute to ${companyName}'s exciting journey.
        </p>
        
        <!-- Signature -->
        <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; margin-top: 24px;">
          <p style="margin: 0 0 4px 0; color: #666666; font-size: 15px;">Best regards,</p>
          <p style="margin: 0; color: #00875A; font-weight: 600; font-size: 16px;">${firstName}</p>
        </div>
        
        <!-- Footer -->
        <div style="margin-top: 24px; padding: 16px; background-color: #f8f9fa; border-radius: 8px; border-left: 3px solid #00875A;">
          <p style="margin: 0; font-style: italic; font-size: 13px; color: #666666;">
            I was able to find ${companyName} and send this message through 
            <a href="https://joindrafted.com" style="color: #00875A; text-decoration: none; font-weight: 600;">joindrafted.com</a>, 
            a platform that connects driven candidates like me with companies like yours.
          </p>
        </div>
        
      </td>
    </tr>
  </table>
</body>
</html>`;

  return html;
};

/**
 * Generate a personalized email with variation
 * Uses the base email but swaps out the footer message
 */
export const generatePersonalizedEmail = (userData, company) => {
  // Get base email content
  const { message } = generateEmailContent(userData, company);
  
  // Select a random variation 
  const randomVariation = MESSAGE_VARIATIONS[Math.floor(Math.random() * MESSAGE_VARIATIONS.length)];
  
  // Replace {company} with actual company name
  const personalizedVariation = randomVariation.replace("{company}", company || 'your company');
  
  // Replace the standard footer with personalized variation
  const standardFooter = `_I was able to find ${company || 'your company'} and send this message through joindrafted.com, a platform that connects driven candidates like me with companies like yours._`;
  const customizedBody = message.replace(standardFooter, `_${personalizedVariation}_`);
  
  return customizedBody;
};

/**
 * Generate LinkedIn DM format (shorter)
 */
export const generateLinkedInDM = (userData, company) => {
  const firstName = userData?.firstName || 'Candidate';
  const major = userData?.major || 'their field';
  const university = userData?.university || 'their university';
  const email = userData?.email || '';
  const linkedInURL = userData?.linkedInURL || '';
  const gitHubURL = userData?.gitHubURL || '';
  const resume = userData?.resume || '';
  
  const profileUrl = email ? `https://candidate.joindrafted.com/candidate/${email}` : '';
  const companyName = company || 'your company';

  let linkedInDM = `Hi! I'm ${firstName}, a ${major} grad from ${university}. I'm interested in opportunities at ${companyName}.\n\n`;
  linkedInDM += `I've created a brief video resume with AI-generated culture tags showing how I might fit at ${companyName}. Please check out my Drafted profile: ${profileUrl}\n\n`;

  // Add links section (only if available)
  if (linkedInURL || gitHubURL || resume) {
    linkedInDM += `Quick links: \n`;
    if (linkedInURL) {
      linkedInDM += `LinkedIn: ${linkedInURL}\n`;
    }
    if (gitHubURL) {
      linkedInDM += `GitHub: ${gitHubURL}\n`;
    }
    if (resume) {
      linkedInDM += `Resume: ${resume}\n`;
    }
    linkedInDM += `\n`;
  }

  linkedInDM += `Looking forward to connecting about how I can contribute to ${companyName}!\n`;
  linkedInDM += `${firstName}`;

  return linkedInDM;
};

/**
 * Convert plain text email to HTML with styling
 * DEPRECATED: Use generateHtmlEmail instead for new code
 */
export const convertEmailToHtml = (textEmail, companyName) => {
  if (!textEmail || textEmail.length < 50) {
    console.error('[EmailUtils] convertEmailToHtml received invalid input:', { 
      length: textEmail?.length, 
      companyName 
    });
    // Return a fallback HTML
    return generateHtmlEmail({ firstName: 'Candidate' }, companyName);
  }

  try {
    // Simple line-by-line HTML conversion
    const lines = textEmail.split('\n').filter(line => line.trim());
    
    let html = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 20px;">`;

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Skip empty lines
      if (!trimmedLine) continue;
      
      // Handle URLs - make them clickable
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const lineWithLinks = trimmedLine.replace(urlRegex, '<a href="$1" style="color: #00875A; text-decoration: none;">$1</a>');
      
      // Handle italic markers
      let processedLine = lineWithLinks;
      if (trimmedLine.startsWith('_') && trimmedLine.endsWith('_')) {
        processedLine = `<em style="color: #666;">${lineWithLinks.slice(1, -1)}</em>`;
      }
      
      // Handle section headers with emojis
      if (trimmedLine.includes('Quick access to my credentials:')) {
        html += `<p style="margin: 20px 0 12px 0; font-weight: 600; color: #333; font-size: 16px;">${processedLine}</p>`;
      } else if (trimmedLine.includes('View my full profile')) {
        html += `<div style="margin: 20px 0; padding: 16px; background: linear-gradient(135deg, #f0f7f4 0%, #e8f5e9 100%); border-left: 4px solid #00875A; border-radius: 8px;"><p style="margin: 0; font-weight: 600; color: #00875A;">${processedLine}</p></div>`;
      } else if (trimmedLine === 'Best regards,') {
        html += `<div style="border-top: 1px solid #e0e0e0; padding-top: 16px; margin-top: 24px;"><p style="margin: 0 0 8px 0; color: #666;">${processedLine}</p>`;
      } else if (trimmedLine.startsWith('🔗') || trimmedLine.startsWith('💻') || trimmedLine.startsWith('📄')) {
        html += `<p style="margin: 8px 0;">${processedLine}</p>`;
      } else {
        html += `<p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6;">${processedLine}</p>`;
      }
    }

    html += '</div>';
    return html;

  } catch (error) {
    console.error('[EmailUtils] Error converting email to HTML:', error);
    // Return fallback HTML
    return `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px;">
              ${textEmail.replace(/\n/g, '<br>')}
            </div>`;
  }
};

/**
 * Prepare email for Gmail API sending
 * Returns base64url encoded email
 */
export const prepareGmailApiEmail = (recipient, subject, body, company) => {
  try {
    // Validate inputs
    if (!recipient) {
      throw new Error('Missing recipient email');
    }
    if (!subject) {
      throw new Error('Missing subject');
    }
    if (!body || body.length < 50) {
      console.error('[EmailUtils] Body too short, length:', body?.length);
      throw new Error('Email body is too short or missing');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipient)) {
      throw new Error('Invalid recipient email format');
    }

    // Determine if body is already HTML or plain text
    const isHtml = body.trim().startsWith('<') || body.includes('<div') || body.includes('<p');
    
    let htmlBody;
    if (isHtml) {
      htmlBody = body;
    } else {
      // Convert plain text to HTML
      htmlBody = convertEmailToHtml(body, company);
    }
    
    // Create properly formatted email
    const emailContent = [
      `To: ${recipient}`,
      `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=utf-8',
      '',
      htmlBody
    ].join('\r\n');
    
    // Base64url encode for Gmail API
    const utf8Encoded = btoa(unescape(encodeURIComponent(emailContent)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    
    return utf8Encoded;
  } catch (error) {
    console.error('[EmailUtils] Error preparing email for Gmail API:', error);
    throw new Error(`Failed to prepare email: ${error.message}`);
  }
};

/**
 * Validate email content before sending
 * Returns validation result with detailed feedback
 */
export const validateEmailContent = ({ recipient, subject, body, company }) => {
  const errors = [];
  const warnings = [];

  // Required field validation
  if (!recipient) errors.push('Recipient email is required');
  if (!subject) errors.push('Subject is required');
  if (!body) errors.push('Email body is required');
  if (!company) warnings.push('Company name is missing');

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (recipient && !emailRegex.test(recipient)) {
    errors.push('Invalid email format');
  }

  // Content length validation
  if (subject && subject.length > EMAIL_QUALITY.MAX_SUBJECT_LENGTH) {
    errors.push(`Subject line too long (max ${EMAIL_QUALITY.MAX_SUBJECT_LENGTH} characters)`);
  }

  if (subject && subject.length < EMAIL_QUALITY.MIN_SUBJECT_LENGTH) {
    errors.push(`Subject line too short (min ${EMAIL_QUALITY.MIN_SUBJECT_LENGTH} characters)`);
  }

  if (body && body.length > EMAIL_QUALITY.MAX_BODY_LENGTH) {
    errors.push(`Email body too long (max ${EMAIL_QUALITY.MAX_BODY_LENGTH} characters)`);
  }

  if (body && body.length < EMAIL_QUALITY.MIN_BODY_LENGTH) {
    errors.push(`Email body too short (min ${EMAIL_QUALITY.MIN_BODY_LENGTH} characters)`);
  }

  // Check for suspicious spam content
  let spamScore = 0;
  const suspiciousPatterns = [
    /\b(urgent|immediate|act now|limited time)\b/gi,
    /\b(click here|download now|claim now)\b/gi,
    /\$+\d+/g,
    /\b(free|winner|congratulations|prize)\b/gi,
    /\b(viagra|casino|lottery|investment)\b/gi
  ];

  if (body) {
    spamScore = suspiciousPatterns.reduce((score, pattern) => {
      return score + (pattern.test(body) ? 1 : 0);
    }, 0);
  }

  if (spamScore > EMAIL_QUALITY.MAX_SPAM_SCORE) {
    warnings.push('Content may be flagged as spam - consider revising language');
  }

  // Check for all caps
  if (subject && subject === subject.toUpperCase() && subject.length > 10) {
    warnings.push('Avoid using all caps in subject line');
  }

  // Check for excessive punctuation
  if (subject && /[!?]{2,}/.test(subject)) {
    warnings.push('Avoid excessive punctuation in subject line');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    spamScore
  };
};

/**
 * Generate email for mass nudge - main entry point
 * This combines all the validation and generation logic
 */
export const generateMassNudgeEmail = (userData, company) => {
  console.log('[EmailUtils] Generating mass nudge email for:', company);
  console.log('[EmailUtils] User data:', {
    firstName: userData?.firstName,
    lastName: userData?.lastName,
    email: userData?.email,
    hasLinkedIn: !!userData?.linkedInURL,
    hasGitHub: !!userData?.gitHubURL,
    hasResume: !!userData?.resume
  });

  // Generate HTML email
  const htmlBody = generateHtmlEmail(userData, company);
  
  // Generate subject
  const subject = generateEmailSubject(userData);
  
  // Validate the output
  if (htmlBody.length < 200) {
    console.error('[EmailUtils] CRITICAL: Generated email is too short!');
  }

  return {
    subject,
    body: htmlBody,
    isHtml: true
  };
};
