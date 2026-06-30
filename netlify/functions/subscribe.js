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

  let email, language, source, country;
  try {
    const body = JSON.parse(event.body ?? '{}');
    email    = (body.email  ?? '').trim().toLowerCase();
    language = body.lang === 'fr' ? 'fr' : 'en';
    source   = (body.source ?? 'homepage').slice(0, 64);
    // Netlify CDN injects x-country on every request in production (empty in local dev).
    country  = (event.headers['x-country'] ?? '').toUpperCase().slice(0, 2);
  } catch {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'invalid_json' }) };
  }

  // Server-side email validation — never trust the browser.
  if (!email || !EMAIL_RE.test(email)) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'invalid_email' }) };
  }

  // All Firestore operations in one try/catch — catches bad service account JSON too.
  let unsubscribeToken;
  try {
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
    unsubscribeToken = crypto.randomUUID();

    await db.collection('newsletter_subscribers').add({
      email,
      language,
      source,
      country,
      status: 'active',
      unsubscribeToken,
      subscribedAt: new Date(),
    });
  } catch (err) {
    console.error('[subscribe] Firestore error:', err.message);
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'server_error' }) };
  }

  // Send welcome email — if it fails, the subscriber is still saved.
  const unsubscribeUrl =
    `${SITE_URL()}/.netlify/functions/unsubscribe?token=${unsubscribeToken}&lang=${language}`;

  try {
    await sendEmail({
      event: 'newsletter.welcome',
      to: email,
      lang: language,
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
