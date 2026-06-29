/**
 * subscribe.js — Newsletter subscription endpoint.
 *
 * Replaces the browser-side Firestore addDoc() call so the unsubscribeToken
 * is generated server-side and the welcome email is sent atomically with the
 * subscriber write. The browser never touches Firestore for subscriptions.
 *
 * POST /.netlify/functions/subscribe
 * Body (JSON): { email: string, lang: 'en'|'fr', source: string }
 *
 * Responses:
 *   200  { success: true }                      — subscribed + welcome sent
 *   200  { success: true, emailFailed: true }   — subscribed, but Resend failed
 *   400  { error: 'invalid_email' }             — bad email format
 *   409  { error: 'already_subscribed' }        — email already active
 *   500  { error: 'server_error' }              — Firestore write failed
 */

import { getAdminDb } from './lib/firebase-admin.js';
import { sendEmail } from './lib/email-dispatcher.js';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SITE_URL = () => process.env.SITE_URL || 'https://afrinia.org';

export const handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'method_not_allowed' }) };
  }

  let email, lang, source;
  try {
    const body = JSON.parse(event.body ?? '{}');
    email  = (body.email  ?? '').trim().toLowerCase();
    lang   = body.lang === 'fr' ? 'fr' : 'en';
    source = (body.source ?? 'homepage').slice(0, 64);
  } catch {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'invalid_json' }) };
  }

  // Server-side email validation — never trust the browser.
  if (!email || !EMAIL_RE.test(email)) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'invalid_email' }) };
  }

  const db = getAdminDb();

  // Check for duplicate — query by email field.
  const existing = await db.collection('newsletter_subscribers')
    .where('email', '==', email)
    .where('status', '!=', 'unsubscribed')
    .limit(1)
    .get();

  if (!existing.empty) {
    return { statusCode: 409, headers: CORS, body: JSON.stringify({ error: 'already_subscribed' }) };
  }

  // Generate a cryptographically random unsubscribe token.
  const unsubscribeToken = crypto.randomUUID();

  // Write subscriber to Firestore via Admin SDK.
  try {
    await db.collection('newsletter_subscribers').add({
      email,
      lang,
      source,
      status: 'active',
      unsubscribeToken,
      subscribedAt: new Date(),
    });
  } catch (err) {
    console.error('[subscribe] Firestore write failed:', err.message);
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'server_error' }) };
  }

  // Send welcome email — if it fails, the subscriber is still saved.
  const unsubscribeUrl =
    `${SITE_URL()}/.netlify/functions/unsubscribe?token=${unsubscribeToken}&lang=${lang}`;

  try {
    await sendEmail({
      event: 'newsletter.welcome',
      to: email,
      lang,
      payload: { unsubscribeUrl },
    });
  } catch (err) {
    console.error('[subscribe] Resend welcome email failed:', err.message);
    // Return success with a flag — subscriber is captured even if email failed.
    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ success: true, emailFailed: true }),
    };
  }

  return {
    statusCode: 200,
    headers: CORS,
    body: JSON.stringify({ success: true }),
  };
};
