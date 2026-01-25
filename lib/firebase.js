'use client';

import { initializeApp, getApps } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSyCmQRXoSyXy5rGm8JjF5JGH_eFQibKW_0g",
  authDomain: "drafted-6c302.firebaseapp.com",
  projectId: "drafted-6c302",
  storageBucket: "drafted-6c302.appspot.com",
  messagingSenderId: "739427449972",
  appId: "1:739427449972:web:c02c6a8cdf544c30e52521",
  measurementId: "G-2C3DWJC6W6",
  functionsRegion: 'us-central1'
};

// Initialize Firebase only if it hasn't been initialized yet
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);

let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

// Enable auth persistence for mobile browsers
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence)
    .then(() => {
      console.log('[Firebase] Auth persistence enabled (browserLocalPersistence)');
    })
    .catch((error) => {
      console.error('[Firebase] Error setting persistence:', error);
    });

  // Enable Firestore persistence
  try {
    enableIndexedDbPersistence(db);
  } catch (err) {
    if (err.code === 'failed-precondition') {
      console.log('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.log('The current browser does not support all of the features required to enable persistence.');
    }
  }
}

// Connect to emulator when in development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  connectFunctionsEmulator(functions, "localhost", 5001);
}

export { app, auth, db, analytics, storage, functions };
