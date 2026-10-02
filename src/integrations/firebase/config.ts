// Firebase configuration and initialization
// Matches the "Afrinia" web app in Firebase Console (Project settings > Your apps).
// Project: wiofly (modified-hull-203004). App ID ensures this app uses the right project/Firestore.
import { initializeApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAnalytics, Analytics } from 'firebase/analytics';

import { FIREBASE_WEB_CONFIG, FIRESTORE_DATABASE_ID } from './publicConfig';

// Initialize Firebase
const firebaseApp = initializeApp(FIREBASE_WEB_CONFIG);

// Initialize Firebase services
export const auth: Auth = getAuth(firebaseApp);

// Firestore: the named database (see publicConfig.ts for why it is hardcoded).
export const db: Firestore = getFirestore(firebaseApp, FIRESTORE_DATABASE_ID);

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
