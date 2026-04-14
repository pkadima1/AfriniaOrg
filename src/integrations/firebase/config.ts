// Firebase configuration and initialization
// Matches the "Afrinia" web app in Firebase Console (Project settings > Your apps).
// Project: wiofly (modified-hull-203004). App ID ensures this app uses the right project/Firestore.
import { initializeApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

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

// Firestore: set VITE_FIRESTORE_DATABASE_ID to the database id if using a named database.
// Leave unset to use the (default) Firestore database.
// For Afrinia, the (default) database is used — ensure .env does not override this.
const firestoreDatabaseId =
  typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIRESTORE_DATABASE_ID;
export const db: Firestore = firestoreDatabaseId
  ? getFirestore(firebaseApp, firestoreDatabaseId)
  : getFirestore(firebaseApp);

if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
  console.info(
    '[Firebase] Firestore database:',
    firestoreDatabaseId || '(default)',
    '| Project:',
    firebaseConfig.projectId
  );
}
// Use project default bucket (matches Console: modified-hull-203004.firebasestorage.app).
// Rules are deployed to both .appspot.com and .firebasestorage.app so blog images load from either.
export const storage: FirebaseStorage = getStorage(firebaseApp);

// Initialize Analytics
try {
  getAnalytics(firebaseApp);
} catch (error) {
  console.warn('Analytics initialization error (may be expected in test environments):', error);
}

export default firebaseApp;
