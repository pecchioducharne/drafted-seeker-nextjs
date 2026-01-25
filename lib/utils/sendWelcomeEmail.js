/**
 * Utility to send a welcome email using EmailJS
 * 
 * Can be used as:
 * 1. Module import: const sendWelcomeEmail = require('./utils/sendWelcomeEmail');
 * 2. Standalone script: node utils/sendWelcomeEmail.js <recipientEmail> <recipientName>
 * 
 * The template can use the following parameters:
 * - to_name: Recipient's first name
 * - to_email: Recipient's email address
 * - last_name: Recipient's last name (if provided)
 * - university: Recipient's university (if provided)
 * - major: Recipient's major (if provided)
 * - signup_date: Date of signup in local format (if provided)
 * - dashboard_url: URL to the dashboard (if provided)
 */

// Import the sendEmail utility
const sendEmail = require('./sendEmail');

/**
 * Sends a welcome email to a new user
 * @param {string} recipientEmail - The recipient's email address
 * @param {string} recipientName - The recipient's name
 * @param {Object} [additionalParams={}] - Any additional template parameters
 * @returns {Promise<Object>} - Response object with success status
 */
async function sendWelcomeEmail(recipientEmail, recipientName, additionalParams = {}) {
  if (!recipientEmail) {
    throw new Error('Recipient email is required');
  }
  
  // Default name if not provided
  const name = recipientName || 'New User';
  
  console.log(`Preparing welcome email for ${name} (${recipientEmail})...`);
  
  try {
    // Log the template parameters being used
    console.log('Using template parameters:', {
      to_name: name,
      to_email: recipientEmail,
      ...additionalParams
    });
    
    const result = await sendEmail({
      templateId: 'drafted_welcome_template',
      to: recipientEmail,
      templateParams: {
        to_name: name,
        to_email: recipientEmail,
        ...additionalParams
      }
    });
    
    console.log(`Welcome email sent successfully to ${recipientEmail}`);
    return { success: true, recipient: recipientEmail };
  } catch (error) {
    console.error(`Failed to send welcome email to ${recipientEmail}:`, error.message);
    throw error;
  }
}

// If this script is run directly (not imported)
if (require.main === module) {
  // Get command line arguments
  const args = process.argv.slice(2);
  const email = args[0];
  const name = args[1];
  
  // Validate input
  if (!email) {
    console.error('Error: Recipient email is required');
    console.log('Usage: node sendWelcomeEmail.js <recipientEmail> <recipientName>');
    process.exit(1);
  }
  
  if (!email.includes('@')) {
    console.error('Error: Invalid email format');
    process.exit(1);
  }
  
  // Execute the function when run as a script
  sendWelcomeEmail(email, name)
    .then(result => {
      console.log('✅ Welcome email processed successfully!');
      process.exit(0);
    })
    .catch(err => {
      console.error('❌ Error:', err.message);
      process.exit(1);
    });
}

// Export the function for use as a module
module.exports = sendWelcomeEmail; 