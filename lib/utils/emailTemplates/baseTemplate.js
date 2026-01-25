/**
 * Beautiful Email Template System
 * Inspired by Anthropic's clean design
 * Using Inter font and Drafted green branding (#22c55e)
 */

/**
 * Creates a beautiful base email template with Drafted branding
 * @param {Object} options - Template options
 * @param {string} options.content - Main email content (HTML)
 * @param {string} [options.preheader] - Preview text shown in email clients
 * @param {string} [options.footerText] - Custom footer text
 * @returns {string} Complete HTML email
 */
export function createDraftedEmailTemplate({ content, preheader = '', footerText = null }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Drafted</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    /* Import Inter font */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    /* Reset styles */
    body, table, td, a { 
      -webkit-text-size-adjust: 100%; 
      -ms-text-size-adjust: 100%; 
    }
    table, td { 
      mso-table-lspace: 0pt; 
      mso-table-rspace: 0pt; 
    }
    img { 
      -ms-interpolation-mode: bicubic; 
      border: 0; 
      height: auto; 
      line-height: 100%; 
      outline: none; 
      text-decoration: none; 
    }
    
    /* Base styles */
    body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      background-color: #f9fafb;
    }
    
    /* Typography */
    h1, h2, h3, h4, h5, h6 {
      margin: 0;
      padding: 0;
      font-weight: 600;
      line-height: 1.3;
      color: #111827;
    }
    
    h1 { font-size: 28px; margin-bottom: 16px; }
    h2 { font-size: 24px; margin-bottom: 14px; }
    h3 { font-size: 20px; margin-bottom: 12px; }
    
    p {
      margin: 0 0 16px 0;
      font-size: 16px;
      line-height: 1.6;
      color: #374151;
    }
    
    a {
      color: #22c55e;
      text-decoration: none;
      font-weight: 500;
    }
    
    a:hover {
      color: #16a34a;
      text-decoration: underline;
    }
    
    /* Button styles */
    .button {
      display: inline-block;
      padding: 14px 28px;
      background: linear-gradient(135deg, #22c55e 0%, #10b981 100%);
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      text-align: center;
      transition: all 0.2s ease;
      box-shadow: 0 4px 6px rgba(34, 197, 94, 0.2);
    }
    
    .button:hover {
      background: linear-gradient(135deg, #16a34a 0%, #059669 100%);
      box-shadow: 0 6px 8px rgba(34, 197, 94, 0.3);
      text-decoration: none;
    }
    
    .button-secondary {
      background: #ffffff;
      color: #22c55e !important;
      border: 2px solid #22c55e;
      box-shadow: none;
    }
    
    .button-secondary:hover {
      background: #f0fdf4;
      border-color: #16a34a;
    }
    
    /* Card styles */
    .card {
      background: #ffffff;
      border-radius: 12px;
      padding: 32px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    /* Divider */
    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, #e5e7eb, transparent);
      margin: 24px 0;
    }
    
    /* Badge */
    .badge {
      display: inline-block;
      padding: 4px 12px;
      background: #dcfce7;
      color: #166534;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
      margin: 4px;
    }
    
    /* List styles */
    ul, ol {
      margin: 0 0 16px 0;
      padding-left: 24px;
    }
    
    li {
      margin-bottom: 8px;
      line-height: 1.6;
      color: #374151;
    }
    
    /* Responsive */
    @media only screen and (max-width: 600px) {
      .container {
        width: 100% !important;
        padding: 16px !important;
      }
      
      .card {
        padding: 24px !important;
      }
      
      h1 { font-size: 24px !important; }
      h2 { font-size: 20px !important; }
      h3 { font-size: 18px !important; }
      
      .button {
        display: block !important;
        width: 100% !important;
        padding: 12px 20px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f9fafb;">
  ${preheader ? `
  <!-- Preheader text -->
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
    ${preheader}
  </div>
  ` : ''}
  
  <!-- Main container -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f9fafb;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" align="center" class="container" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 32px 40px; text-align: center; border-bottom: 1px solid #f3f4f6;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center;">
                    <!-- Drafted Logo -->
                    <div style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #22c55e 0%, #10b981 100%); border-radius: 8px; margin-bottom: 8px;">
                      <span style="font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">Drafted</span>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 32px 40px; background-color: #f9fafb; border-top: 1px solid #f3f4f6; border-radius: 0 0 16px 16px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center; font-size: 14px; color: #6b7280; line-height: 1.6;">
                    ${footerText || `
                      <p style="margin: 0 0 12px 0; font-size: 14px; color: #6b7280;">
                        <strong style="color: #374151;">Drafted</strong> — Connecting talent with opportunity
                      </p>
                      <p style="margin: 0 0 12px 0; font-size: 13px; color: #9ca3af;">
                        Questions? Reply to this email or contact us at 
                        <a href="mailto:rodrigo@gotdrafted.com" style="color: #22c55e; text-decoration: none;">rodrigo@gotdrafted.com</a>
                      </p>
                      <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                        © ${new Date().getFullYear()} Drafted. All rights reserved.
                      </p>
                    `}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Creates a simple text section
 */
export function createTextSection(text) {
  return `<p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #374151;">${text}</p>`;
}

/**
 * Creates a heading
 */
export function createHeading(text, level = 2) {
  const sizes = { 1: '28px', 2: '24px', 3: '20px' };
  const margins = { 1: '16px', 2: '14px', 3: '12px' };
  
  return `<h${level} style="margin: 0 0 ${margins[level]} 0; font-size: ${sizes[level]}; font-weight: 600; line-height: 1.3; color: #111827;">${text}</h${level}>`;
}

/**
 * Creates a primary button
 */
export function createButton(text, url, secondary = false) {
  const style = secondary
    ? 'display: inline-block; padding: 14px 28px; background: #ffffff; color: #22c55e !important; border: 2px solid #22c55e; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; text-align: center;'
    : 'display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #22c55e 0%, #10b981 100%); color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; text-align: center; box-shadow: 0 4px 6px rgba(34, 197, 94, 0.2);';
  
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 24px 0;">
      <tr>
        <td style="text-align: center;">
          <a href="${url}" style="${style}">${text}</a>
        </td>
      </tr>
    </table>
  `;
}

/**
 * Creates a divider
 */
export function createDivider() {
  return `<div style="height: 1px; background: linear-gradient(90deg, transparent, #e5e7eb, transparent); margin: 24px 0;"></div>`;
}

/**
 * Creates a card/box
 */
export function createCard(content, backgroundColor = '#f9fafb') {
  return `
    <div style="background: ${backgroundColor}; border-radius: 12px; padding: 24px; margin: 20px 0; border: 1px solid #e5e7eb;">
      ${content}
    </div>
  `;
}

/**
 * Creates a list
 */
export function createList(items, ordered = false) {
  const tag = ordered ? 'ol' : 'ul';
  const listItems = items.map(item => `<li style="margin-bottom: 8px; line-height: 1.6; color: #374151;">${item}</li>`).join('');
  
  return `<${tag} style="margin: 0 0 16px 0; padding-left: 24px;">${listItems}</${tag}>`;
}

/**
 * Creates a badge
 */
export function createBadge(text, color = 'green') {
  const colors = {
    green: { bg: '#dcfce7', text: '#166534' },
    blue: { bg: '#dbeafe', text: '#1e40af' },
    yellow: { bg: '#fef3c7', text: '#92400e' },
    red: { bg: '#fee2e2', text: '#991b1b' },
  };
  
  const { bg, text: textColor } = colors[color] || colors.green;
  
  return `<span style="display: inline-block; padding: 4px 12px; background: ${bg}; color: ${textColor}; border-radius: 20px; font-size: 13px; font-weight: 600; margin: 4px;">${text}</span>`;
}

export default {
  createDraftedEmailTemplate,
  createTextSection,
  createHeading,
  createButton,
  createDivider,
  createCard,
  createList,
  createBadge,
};

