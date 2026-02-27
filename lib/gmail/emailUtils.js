/**
 * Email Template Generation Utilities
 * Generates professional HTML emails for recruiter outreach
 */

/**
 * Generate email subject based on user data
 */
export const generateEmailSubject = (userData) => {
  const firstName = userData?.firstName || 'Candidate';
  const position = userData?.jobType === 'Full-time' ? 'Full-time' : 'Internship';
  return `Hey, ${firstName} here! (${position} Candidate)`;
};

/**
 * Generate HTML email with professional styling
 */
export const generateHtmlEmail = (userData, company) => {
  // Get validated data with fallbacks
  const firstName = userData?.firstName || 'Candidate';
  const lastName = userData?.lastName || '';
  const major = userData?.major || 'their field';
  const university = userData?.university || 'their university';
  const email = userData?.email || '';
  const linkedInURL = userData?.linkedInURL || '';
  const gitHubURL = userData?.gitHubURL || '';
  const resume = userData?.resume || '';
  const position = userData?.jobType === 'Full-time' ? 'full-time' : 'internship';
  
  const profileUrl = email ? `https://recruiter.joindrafted.com/profile/${email}` : '';
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

  // Credentials section
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
        
        <p style="margin: 0 0 16px 0; font-size: 16px; color: #333333; line-height: 1.6;">
          Looking forward to potentially discussing how I can contribute to ${companyName}'s exciting journey.
        </p>
        
        <p style="margin: 0 0 8px 0; font-size: 16px; color: #333333; line-height: 1.6;">
          Best regards,
        </p>
        
        <p style="margin: 0 0 24px 0; font-size: 16px; color: #333333; font-weight: 600; line-height: 1.6;">
          ${firstName}
        </p>
        
        <!-- Footer -->
        <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e0e0e0;">
          <p style="margin: 0; font-size: 12px; color: #666666; line-height: 1.5; font-style: italic;">
            I was able to find ${companyName} and send this message through <a href="https://joindrafted.com" style="color: #00875A; text-decoration: none;">joindrafted.com</a>, a platform that connects driven candidates like me with companies like yours.
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
 * Generate plain text email (fallback)
 */
export const generatePlainTextEmail = (userData, company) => {
  const firstName = userData?.firstName || 'Candidate';
  const lastName = userData?.lastName || '';
  const major = userData?.major || 'their field';
  const university = userData?.university || 'their university';
  const email = userData?.email || '';
  const linkedInURL = userData?.linkedInURL || '';
  const gitHubURL = userData?.gitHubURL || '';
  const resume = userData?.resume || '';
  const position = userData?.jobType === 'Full-time' ? 'full-time' : 'internship';
  
  const profileUrl = email ? `https://recruiter.joindrafted.com/profile/${email}` : '';
  const companyName = company || 'your company';

  let message = `Hi,\n\n`;
  message += `My name is ${firstName}${lastName ? ' ' + lastName : ''}, and I am a ${major} grad from ${university}.\n\n`;
  message += `I'm reaching out because I'm excited to explore ${position} opportunities at ${companyName} and share how I can contribute.\n\n`;
  message += `To introduce myself in a more engaging way, I've created a brief video resume that includes AI-generated culture tags—these tags highlight my values and work style, making it easy to see if there's a strong culture fit between us. Along with my video profile, I've included my resume and relevant links to provide a complete picture of my background and capabilities.\n\n`;
  
  if (profileUrl) {
    message += `View my full profile & video resume here: ${profileUrl}\n\n`;
  }
  
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

  message += `I'm particularly drawn to ${companyName}'s vision and the opportunity to work with such a talented team. I believe my skills and enthusiasm for creating impact would make me a great fit for your dynamic environment.\n\n`;
  message += `Looking forward to potentially discussing how I can contribute to ${companyName}'s exciting journey.\n\n`;
  message += `Best regards,\n\n`;
  message += `${firstName}\n\n`;
  message += `_I was able to find ${companyName} and send this message through joindrafted.com, a platform that connects driven candidates like me with companies like yours._`;

  return message;
};

/**
 * Validate email content
 */
export const validateEmailContent = (subject, body) => {
  if (!subject || subject.trim().length === 0) {
    throw new Error('Email subject cannot be empty');
  }
  
  if (!body || body.trim().length < 50) {
    throw new Error('Email body is too short or empty');
  }
  
  return true;
};

export default {
  generateEmailSubject,
  generateHtmlEmail,
  generatePlainTextEmail,
  validateEmailContent
};
