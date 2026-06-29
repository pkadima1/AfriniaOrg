/**
 * firebase-admin.js — shared Firebase Admin SDK singleton for all Netlify functions.
 *
 * WHY this exists: each Netlify function file imports this module. The singleton
 * pattern (check getApps() before initializeApp) ensures only one Admin app is
 * created per warm Lambda invocation, preventing "app already exists" errors.
 *
 * Reads FIREBASE_SERVICE_ACCOUNT from environment — the full service account
 * JSON string generated from Firebase Console → Project Settings → Service Accounts.
 * Set this in Netlify UI → Site → Environment variables (never commit the value).
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Named Firestore database — must match VITE_FIRESTORE_DATABASE_ID in the frontend .env
const DB_NAME = 'afrinia';

let _db = null;
let _auth = null;

function initAdmin() {
  if (getApps().length > 0) return;

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) {
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT env var is missing. ' +
      'Generate a service account key from Firebase Console → Project Settings → Service Accounts.'
    );
  }

  // Accept both raw JSON string and base64-encoded JSON.
  let serviceAccount;
  try {
    serviceAccount = JSON.parse(raw);
  } catch {
    serviceAccount = JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));
  }

  initializeApp({ credential: cert(serviceAccount) });
}

/** Returns the shared Firestore Admin instance (named "afrinia" database). */
export function getAdminDb() {
  if (_db) return _db;
  initAdmin();
  _db = getFirestore(DB_NAME);
  return _db;
}

/** Returns the shared Firebase Auth Admin instance (for ID token verification). */
export function getAdminAuth() {
  if (_auth) return _auth;
  initAdmin();
  _auth = getAuth();
  return _auth;
}
