import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../backend/firebase";
import githubAnalysisService from "./GitHubAnalysisService";

/**
 * Validate a GitHub profile URL and return the username.
 * Accepts forms like:
 *   - https://github.com/<user>
 *   - http://github.com/<user>/
 *   - github.com/<user>
 *   - https://www.github.com/<user>
 *   - @username
 *   - username
 */
function extractUsernameFromUrl(url) {
  const trimmed = url.trim();

  // Handle @username format
  if (trimmed.startsWith('@')) {
    const username = trimmed.slice(1);
    if (/^[A-Za-z0-9-_]+$/.test(username)) return username;
    throw new Error("Invalid username after @");
  }

  // Allow bare usernames (including underscores)
  if (/^[A-Za-z0-9-_]+$/.test(trimmed)) return trimmed;

  // Ensure protocol for URL parsing
  const normalized = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  let u;
  try {
    u = new URL(normalized);
  } catch {
    throw new Error("Invalid URL.");
  }

  const host = u.hostname.toLowerCase();
  if (!host.endsWith("github.com")) {
    throw new Error("URL is not a github.com profile URL.");
  }

  const parts = u.pathname.split("/").filter(Boolean);
  if (parts.length < 1) {
    throw new Error("No username found in the URL path.");
  }

  const username = parts[0];
  if (!/^[A-Za-z0-9-_]+$/.test(username)) {
    throw new Error("Extracted username has invalid characters.");
  }
  return username;
}

/**
 * Analyze a GitHub profile and update the user's Firebase record
 * @param {string} userEmail - The user's email (Firebase document ID)
 * @param {string} githubUrl - The GitHub profile URL
 * @param {string} firstName - User's first name for logging
 * @returns {Promise<Object>} The analysis results
 */
export async function handleGitHubURLUpdate(userEmail, githubUrl, firstName = '') {
  try {
    console.log(`🚀 Starting GitHub analysis for ${firstName} (${userEmail})`);
    
    // Extract username from URL
    const username = extractUsernameFromUrl(githubUrl);
    console.log(`📊 Extracted GitHub username: ${username}`);

    // Use the existing GitHub Actions service to trigger analysis
    const result = await githubAnalysisService.triggerAnalysis(githubUrl, userEmail, firstName);
    console.log(`✅ GitHub analysis workflow triggered for ${username}`);

    // Update the user's Firebase record with GitHub URL and trigger info
    const userDocRef = doc(db, "drafted-accounts", userEmail.toLowerCase().trim());
    await updateDoc(userDocRef, {
      gitHubURL: githubUrl, // Make sure the URL is saved
      gitHubAnalysis: {
        profileUrl: githubUrl,
        username: username,
        lastTriggered: serverTimestamp(),
        status: 'analysis_triggered',
        workflowMessage: result.message
      }
    });

    console.log(`🔥 Firebase record updated for ${userEmail} with GitHub trigger info`);

    // Track the successful trigger
    if (window.posthog) {
      window.posthog.capture('github_analysis_triggered', {
        email: userEmail,
        github_username: username,
        github_url: githubUrl,
        success: true
      });
    }

    return {
      success: true,
      username: username,
      message: result.message,
      status: 'triggered'
    };

  } catch (error) {
    console.error(`❌ GitHub analysis failed for ${userEmail}:`, error);

    // Track the error
    if (window.posthog) {
      window.posthog.capture('github_analysis_error', {
        email: userEmail,
        github_url: githubUrl,
        error: error.message,
        success: false
      });
    }

    // Don't throw the error - we don't want to block user flows
    // Just log it and continue
    console.warn(`GitHub analysis failed but continuing with user flow: ${error.message}`);
    return null;
  }
}

/**
 * Check if a GitHub URL has changed and needs re-analysis
 * @param {string} currentUrl - Current GitHub URL in Firebase
 * @param {string} newUrl - New GitHub URL being set
 * @returns {boolean} Whether the URL has meaningfully changed
 */
export function hasGitHubUrlChanged(currentUrl, newUrl) {
  if (!currentUrl && !newUrl) return false;
  if (!currentUrl && newUrl) return true;
  if (currentUrl && !newUrl) return false;

  try {
    const currentUsername = githubAnalysisService.extractUsername(currentUrl);
    const newUsername = githubAnalysisService.extractUsername(newUrl);
    return currentUsername !== newUsername;
  } catch (error) {
    // If we can't extract usernames, assume they're different
    return true;
  }
}

export default {
  handleGitHubURLUpdate,
  hasGitHubUrlChanged,
  extractUsernameFromUrl
};