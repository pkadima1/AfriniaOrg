// Firebase configuration and initialization
// Matches the "nodematics" web app in Firebase Console (Project settings > Your apps).
// Project: wizify (modified-hull-203004). App ID ensures this app uses the right project/Firestore.
import { initializeApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

/** Nodematics web app config – keep in sync with Firebase Console > Project settings > nodematics app */
const firebaseConfig = {
  apiKey: "AIzaSyC_xgX1_IrpJ8UKNWyfmW4q0-PKuRvM-8g",
  authDomain: "modified-hull-203004.firebaseapp.com",
  projectId: "modified-hull-203004",
  storageBucket: "modified-hull-203004.firebasestorage.app",
  messagingSenderId: "17223733952",
  appId: "1:17223733952:web:667fdced9a261555b65325", // nodematics web app App ID
  measurementId: "G-S614G0MXZD"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth: Auth = getAuth(firebaseApp);

// Firestore: when the project has multiple databases, set VITE_FIRESTORE_DATABASE_ID to the
// database id of the one you use in Console (e.g. "nodematics"). Unset = (default) database.
// Without this, documents are created in (default) while you may be viewing another DB in Console.
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
