/**
 * Sends an email using the EmailJS service
 * @param {Object} params - Email parameters
 * @param {string} params.templateId - The ID of the template to use
 * @param {string} params.to - Recipient email address
 * @param {Object} [params.templateParams] - Dynamic parameters for the template
 * @param {string} [params.fromName] - Optional sender name
 * @param {string} [params.fromEmail] - Optional sender email
 * @returns {Promise<Object>} - Response from the EmailJS API
 */
async function sendEmail({ templateId, to, templateParams = {}, fromName, fromEmail }) {
  const EMAILJS_USER_ID = 'RfdLlpPTsLae8Wd_j';
  const EMAILJS_SERVICE_ID = 'drafted_service';
  
  // Merge recipient email into template params
  const params = {
    ...templateParams,
    to_email: to,
    from_name: fromName || 'Drafted',
    from_email: fromEmail || 'draftednotification@gmail.com'
  };
  
  try {
    const url = 'https://api.emailjs.com/api/v1.0/email/send';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: templateId,
        user_id: EMAILJS_USER_ID,
        template_params: params
      })
    });
    
    if (!response.ok) {
      let errorText = await response.text();
      try {
        const errorData = JSON.parse(errorText);
        errorText = errorData.error || errorText;
      } catch (e) {
        // If parsing fails, use the raw error text
      }
      throw new Error(`EmailJS error: ${errorText}`);
    }
    console.log('Email sent successfully');
    return { success: true };
  } catch (error) {
    console.error('Error sending email via EmailJS:', error);
    throw error;
  }
}

module.exports = sendEmail;
