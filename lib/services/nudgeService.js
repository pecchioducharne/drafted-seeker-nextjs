/**
 * Nudge Service - Handles email nudge operations with cooldown tracking
 */

import { collection, doc, getDoc, setDoc, updateDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { sendGmailEmail } from '../gmail/gmailUtils';
import { generateEmailSubject, generateHtmlEmail } from '../gmail/emailUtils';

// Cooldown period: 14 days
const NUDGE_COOLDOWN_DAYS = 14;
const COOLDOWN_MS = NUDGE_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;

/**
 * Check if user can nudge a company (14-day cooldown)
 */
export async function canNudgeCompany(userEmail, companyName) {
  try {
    const nudgeRef = doc(db, 'nudges', `${userEmail}_${companyName}`);
    const nudgeDoc = await getDoc(nudgeRef);
    
    if (!nudgeDoc.exists()) {
      return { canNudge: true, reason: null };
    }
    
    const lastNudge = nudgeDoc.data().lastNudgeTime?.toMillis() || 0;
    const timeSinceLastNudge = Date.now() - lastNudge;
    
    if (timeSinceLastNudge < COOLDOWN_MS) {
      const daysRemaining = Math.ceil((COOLDOWN_MS - timeSinceLastNudge) / (24 * 60 * 60 * 1000));
      return {
        canNudge: false,
        reason: `You can nudge ${companyName} again in ${daysRemaining} day${daysRemaining > 1 ? 's' : ''}`,
        lastNudgeTime: lastNudge
      };
    }
    
    return { canNudge: true, reason: null };
  } catch (error) {
    console.error('Error checking nudge cooldown:', error);
    // On error, allow the nudge (fail open)
    return { canNudge: true, reason: null };
  }
}

/**
 * Record a nudge in Firestore
 */
export async function recordNudge(userEmail, companyName, recipientEmail) {
  try {
    const nudgeRef = doc(db, 'nudges', `${userEmail}_${companyName}`);
    
    await setDoc(nudgeRef, {
      userEmail,
      companyName,
      recipientEmail,
      lastNudgeTime: Timestamp.now(),
      nudgeCount: 1
    }, { merge: true });
    
    console.log(`[NudgeService] Recorded nudge: ${userEmail} → ${companyName}`);
  } catch (error) {
    console.error('Error recording nudge:', error);
    // Don't throw - recording failure shouldn't block the nudge
  }
}

/**
 * Get nudge history for a user
 */
export async function getNudgeHistory(userEmail) {
  try {
    const nudgesRef = collection(db, 'nudges');
    const q = query(nudgesRef, where('userEmail', '==', userEmail));
    const snapshot = await getDocs(q);
    
    const history = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      history.push({
        id: doc.id,
        companyName: data.companyName,
        recipientEmail: data.recipientEmail,
        lastNudgeTime: data.lastNudgeTime?.toMillis() || 0,
        nudgeCount: data.nudgeCount || 1
      });
    });
    
    return history;
  } catch (error) {
    console.error('Error fetching nudge history:', error);
    return [];
  }
}

/**
 * Check if an email is unsubscribed
 */
export async function isUnsubscribed(email) {
  try {
    const unsubscribeRef = doc(db, 'unsubscribed', email.toLowerCase());
    const unsubscribeDoc = await getDoc(unsubscribeRef);
    
    return unsubscribeDoc.exists();
  } catch (error) {
    console.error('Error checking unsubscribe status:', error);
    // On error, assume not unsubscribed (fail open)
    return false;
  }
}

/**
 * Send a single nudge with all validations
 */
export async function sendSingleNudge({
  company,
  recipientEmail,
  userData,
  onProgress,
  onSuccess,
  onError
}) {
  const companyName = company.Company || company.name || 'Company';
  
  try {
    console.log(`[NudgeService] Starting nudge to ${companyName}`);
    
    // Check if email is unsubscribed
    onProgress?.('checking');
    const unsubscribed = await isUnsubscribed(recipientEmail);
    if (unsubscribed) {
      const error = `${recipientEmail} has unsubscribed from Drafted emails`;
      console.warn(`[NudgeService] ${error}`);
      onError?.(error);
      return { success: false, error };
    }
    
    // Check cooldown
    const cooldownCheck = await canNudgeCompany(userData.email, companyName);
    if (!cooldownCheck.canNudge) {
      console.warn(`[NudgeService] Cooldown active: ${cooldownCheck.reason}`);
      onError?.(cooldownCheck.reason);
      return { success: false, error: cooldownCheck.reason };
    }
    
    // Generate email content
    const subject = generateEmailSubject(userData);
    const body = generateHtmlEmail(userData, companyName);
    
    // Send email
    onProgress?.('sending');
    const result = await sendGmailEmail({
      recipient: recipientEmail,
      subject,
      body,
      company: companyName,
      onProgress
    });
    
    if (result.success) {
      // Record nudge
      await recordNudge(userData.email, companyName, recipientEmail);
      console.log(`[NudgeService] Nudge sent successfully to ${companyName}`);
      onSuccess?.(result);
    } else {
      console.error(`[NudgeService] Nudge failed:`, result.error);
      onError?.(result.error);
    }
    
    return result;
  } catch (error) {
    console.error(`[NudgeService] Error sending nudge:`, error);
    onError?.(error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send mass nudges with progress tracking
 */
export async function sendMassNudge({
  companies,
  userData,
  onProgress,
  onComplete,
  onError
}) {
  const results = {
    total: companies.length,
    sent: 0,
    failed: 0,
    skipped: 0,
    errors: []
  };
  
  console.log(`[NudgeService] Starting mass nudge to ${companies.length} companies`);
  
  for (let i = 0; i < companies.length; i++) {
    const company = companies[i];
    const companyName = company.Company || company.name || 'Company';
    
    onProgress?.({
      current: i + 1,
      total: companies.length,
      company: companyName,
      status: 'processing'
    });
    
    try {
      const recipientEmail = company.Email?.split(',')[0]?.trim();
      
      if (!recipientEmail) {
        results.skipped++;
        results.errors.push({ company: companyName, error: 'No email address' });
        continue;
      }
      
      // Check unsubscribe
      const unsubscribed = await isUnsubscribed(recipientEmail);
      if (unsubscribed) {
        results.skipped++;
        results.errors.push({ company: companyName, error: 'Unsubscribed' });
        continue;
      }
      
      // Check cooldown
      const cooldownCheck = await canNudgeCompany(userData.email, companyName);
      if (!cooldownCheck.canNudge) {
        results.skipped++;
        results.errors.push({ company: companyName, error: 'Cooldown active' });
        continue;
      }
      
      // Send email
      const result = await sendSingleNudge({
        company,
        recipientEmail,
        userData,
        onProgress: (status) => onProgress?.({
          current: i + 1,
          total: companies.length,
          company: companyName,
          status
        })
      });
      
      if (result.success) {
        results.sent++;
      } else {
        results.failed++;
        results.errors.push({ company: companyName, error: result.error });
      }
      
      // Delay between emails to avoid rate limiting
      if (i < companies.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
    } catch (error) {
      results.failed++;
      results.errors.push({ company: companyName, error: error.message });
    }
  }
  
  console.log(`[NudgeService] Mass nudge complete:`, results);
  onComplete?.(results);
  
  return results;
}

export default {
  sendSingleNudge,
  sendMassNudge,
  canNudgeCompany,
  recordNudge,
  getNudgeHistory,
  isUnsubscribed
};
