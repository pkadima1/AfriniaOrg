/**
 * subscribe.js — Newsletter subscription endpoint.
 *
 * Replaces the browser-side Firestore addDoc() call so the unsubscribeToken
 * is generated server-side and the welcome email is sent atomically with the
 * subscriber write. The browser never touches Firestore for subscriptions.
 *
 * POST /.netlify/functions/subscribe
 * Body (JSON): { email: string, lang: 'en'|'fr', source: string, signals?: string[] }
 *
 * signals — optional array of PostCategory keys the subscriber wants to follow.
 *   []                          = generic subscriber (receives all newsletter sends)
 *   ['investment', 'builder']   = follows specific signal types only
 *   Invalid values are silently filtered out server-side.
 *
 * Responses:
 *   200  { success: true }                      — subscribed + welcome sent
 *   200  { success: true, emailFailed: true }   — subscribed, but Resend failed
 *   400  { error: 'invalid_email' }             — bad email format
 *   409  { error: 'already_subscribed' }        — email already active
 *   500  { error: 'server_error' }              — Firestore write failed
 *
 * Runtime: Netlify Functions v2 (export default — no Lambda 4KB env var limit)
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

// Canonical signal keys — mirrors PostCategory in src/integrations/firebase/types.ts
const VALID_SIGNALS = new Set(['opportunity', 'analysis', 'investment', 'technote', 'builder']);

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });

export default async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }

  if (req.method !== 'POST') {
    return json({ error: 'method_not_allowed' }, 405);
  }

  let email, language, source, country, signals;
  try {
    const body = JSON.parse(await req.text() || '{}');
    email    = (body.email  ?? '').trim().toLowerCase();
    language = body.lang === 'fr' ? 'fr' : 'en';
    source   = (body.source ?? 'homepage').slice(0, 64);
    // Netlify CDN injects x-country on every request in production (empty in local dev).
    country  = (req.headers.get('x-country') ?? '').toUpperCase().slice(0, 2);

    // signals: optional array of PostCategory keys. Invalid values are filtered server-side.
    const rawSignals = Array.isArray(body.signals) ? body.signals : [];
    signals = rawSignals.filter(s => VALID_SIGNALS.has(s));
    if (rawSignals.length !== signals.length) {
      console.warn('[subscribe] Filtered invalid signal values:', rawSignals.filter(s => !VALID_SIGNALS.has(s)));
    }
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }

  // Server-side email validation — never trust the browser.
  if (!email || !EMAIL_RE.test(email)) {
    return json({ error: 'invalid_email' }, 400);
  }

  let unsubscribeToken;
  try {
    const db = getAdminDb();

    const existing = await db.collection('newsletter_subscribers')
      .where('email', '==', email)
      .where('status', '!=', 'unsubscribed')
      .limit(1)
      .get();

    if (!existing.empty) {
      return json({ error: 'already_subscribed' }, 409);
    }

    unsubscribeToken = crypto.randomUUID();

    await db.collection('newsletter_subscribers').add({
      email,
      language,
      source,
      country,
      signals,
      status: 'active',
      unsubscribeToken,
      subscribedAt: new Date(),
    });
  } catch (err) {
    console.error('[subscribe] Firestore error:', err.message);
    return json({ error: 'server_error' }, 500);
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
    return json({ success: true, emailFailed: true });
  }

  return json({ success: true });
};
