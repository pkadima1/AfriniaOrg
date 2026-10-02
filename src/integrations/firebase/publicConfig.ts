/**
 * publicConfig.ts — the Firebase project identifiers, defined once.
 * WHY: the browser SDK (config.ts) and the server readers
 * (src/server/content/*) must talk to the same project, bucket and named
 * database. These are public identifiers, not secrets — access is enforced by
 * firestore.rules and storage.rules.
 */

/** Afrinia web app — keep in sync with Firebase Console > Project settings > Afrinia app. */
export const FIREBASE_WEB_CONFIG = {
  apiKey: 'AIzaSyCibUT3NtqVG-vJjjgkuGFZZBA-1bXiGVg',
  authDomain: 'modified-hull-203004.firebaseapp.com',
  projectId: 'modified-hull-203004',
  storageBucket: 'modified-hull-203004.firebasestorage.app',
  messagingSenderId: '17223733952',
  appId: '1:17223733952:web:b10b841c6642161ab65325',
  measurementId: 'G-E21VHKPP97',
} as const;

/**
 * The named Firestore database that holds all content (not "(default)").
 * Hardcoded on purpose: if an env var were missing in production, the site
 * would silently read the empty default database (a past outage).
 */
export const FIRESTORE_DATABASE_ID = 'afrinia';
