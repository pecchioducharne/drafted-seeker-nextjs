/**
 * Email Service Client
 * 
 * Client-side utilities for sending emails through Netlify functions.
 * This keeps the Resend API key secure on the server side.
 * 
 * IMPORTANT: Always use this service for client-side email sending.
 * Do NOT import ResendClient, resendConfig, or 'resend' directly in client code.
 */

/**
 * Send a welcome email to a new job seeker
 * 
 * @param {Object} params
 * @param {string} params.email - User email address
 * @param {string} params.firstName - User's first name
 * @returns {Promise<Object>} Response from the server
 * 
 * @example
 * try {
 *   const result = await sendWelcomeEmail({
 *     email: 'user@example.com',
 *     firstName: 'John'
 *   });
 *   console.log('Welcome email sent!', result);
 * } catch (error) {
 *   console.error('Failed to send welcome email:', error);
 * }
 */
export async function sendWelcomeEmail({ email, firstName }) {
  try {
    const response = await fetch('/.netlify/functions/sendWelcomeEmail', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        firstName
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Server error: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    throw error;
  }
}

/**
 * Generic function to call any email-related Netlify function
 * 
 * @param {string} functionName - Name of the Netlify function (without path)
 * @param {Object} data - Data to send to the function
 * @returns {Promise<Object>} Response from the server
 */
export async function callEmailFunction(functionName, data) {
  try {
    const response = await fetch(`/.netlify/functions/${functionName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || `Server error: ${response.status}`);
    }

    return result;
  } catch (error) {
    console.error(`Failed to call ${functionName}:`, error);
    throw error;
  }
}

/**
 * Example usage in a React component:
 * 
 * import { sendWelcomeEmail } from 'domains/shared/lib/emailService';
 * 
 * // In your signup handler:
 * const handleSignup = async (userData) => {
 *   try {
 *     // ... create user account ...
 *     
 *     // Send welcome email
 *     await sendWelcomeEmail({
 *       email: userData.email,
 *       firstName: userData.firstName
 *     });
 *     
 *     console.log('User created and welcome email sent!');
 *   } catch (error) {
 *     console.error('Error:', error);
 *   }
 * };
 */

export default {
  sendWelcomeEmail,
  callEmailFunction
};
