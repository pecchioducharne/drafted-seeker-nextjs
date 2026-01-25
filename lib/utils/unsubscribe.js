import { db } from '../backend/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Check if an email is unsubscribed
export const isUnsubscribed = async (email) => {
  try {
    const unsubscribeRef = doc(db, 'unsubscribed', email.toLowerCase());
    const docSnap = await getDoc(unsubscribeRef);
    return docSnap.exists();
  } catch (error) {
    console.error('Error checking unsubscribe status:', error);
    return false;
  }
};

// Add email to unsubscribed list
export const addToUnsubscribed = async (email) => {
  try {
    const unsubscribeRef = doc(db, 'unsubscribed', email.toLowerCase());
    await setDoc(unsubscribeRef, {
      email: email.toLowerCase(),
      timestamp: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error adding to unsubscribed:', error);
    return false;
  }
}; 