// Firebase configuration and initialization
// Matches the "Afrinia" web app in Firebase Console (Project settings > Your apps).
// Project: wiofly (modified-hull-203004). App ID ensures this app uses the right project/Firestore.
import { initializeApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAnalytics, Analytics } from 'firebase/analytics';

/** Afrinia web app config – keep in sync with Firebase Console > Project settings > Afrinia app */
const firebaseConfig = {
  apiKey: "AIzaSyCibUT3NtqVG-vJjjgkuGFZZBA-1bXiGVg",
  authDomain: "modified-hull-203004.firebaseapp.com",
  projectId: "modified-hull-203004",
  storageBucket: "modified-hull-203004.firebasestorage.app",
  messagingSenderId: "17223733952",
  appId: "1:17223733952:web:b10b841c6642161ab65325",
  measurementId: "G-E21VHKPP97"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth: Auth = getAuth(firebaseApp);

// Firestore: this project uses a named database called "afrinia" (not the default database).
// Hardcoded to match what the Netlify backend functions (sitemap.js, firebase-admin.js) use.
// NEVER rely on an env var here — if the var is missing in production, the app silently
// connects to the default (empty) database and shows no content.
export const db: Firestore = getFirestore(firebaseApp, 'afrinia');

// Use project default bucket (matches Console: modified-hull-203004.firebasestorage.app).
// Rules are deployed to both .appspot.com and .firebasestorage.app so blog images load from either.
export const storage: FirebaseStorage = getStorage(firebaseApp);

// Initialize Analytics — exported so route-change tracking can call logEvent
// without re-initializing. Firebase returns the same singleton if called
// twice, but exporting here makes the dependency explicit and avoids hidden
// coupling between modules.
export let analytics: Analytics | null = null;
try {
  analytics = getAnalytics(firebaseApp);
} catch (error) {
  // Expected in test environments or when blocked by an ad-blocker.
  console.warn('Analytics initialization error:', error);
}

export default firebaseApp;
