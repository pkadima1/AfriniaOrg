/**
 * send-newsletter.js — Admin-authenticated newsletter broadcast.
 *
 * Only admins can call this endpoint. The caller must include a valid Firebase
 * ID token in the Authorization header, and the corresponding user profile
 * must have role === 'admin' in Firestore.
 *
 * POST /.netlify/functions/send-newsletter
 * Headers: { Authorization: 'Bearer {firebaseIdToken}' }
 * Body (JSON): {
 *   subject_en: string,   subject_fr: string,
 *   body_en:    string,   body_fr:    string,
 *   lang_filter: 'en' | 'fr' | 'all'
 * }
 *
 * Responses:
 *   200  { sent: N, failed: M, errors: string[] }
 *   400  { error: 'missing_fields' }
 *   401  { error: 'unauthorized' }
 *   403  { error: 'forbidden' }
 *   500  { error: 'server_error' }
 */

import { getAdminDb, getAdminAuth } from './lib/firebase-admin.js';
import { sendBatch } from './lib/email-dispatcher.js';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SITE_URL = () => process.env.SITE_URL || 'https://afrinia.org';

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'method_not_allowed' }) };
  }

  // ── 1. Verify Firebase ID token ────────────────────────────────────────────
  const authHeader = event.headers?.authorization ?? event.headers?.Authorization ?? '';
  const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!idToken) {
    return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: 'unauthorized' }) };
  }

  let uid;
  try {
    const decoded = await getAdminAuth().verifyIdToken(idToken);
    uid = decoded.uid;
  } catch (err) {
    console.error('[send-newsletter] Token verification failed:', err.message);
    return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: 'unauthorized' }) };
  }

  // ── 2. Verify the user is an admin in Firestore ────────────────────────────
  const db = getAdminDb();
  const profileSnap = await db.collection('user_profiles').doc(uid).get();
  if (!profileSnap.exists || profileSnap.data()?.role !== 'admin') {
    return { statusCode: 403, headers: CORS, body: JSON.stringify({ error: 'forbidden' }) };
  }

  // ── 3. Parse and validate the request body ─────────────────────────────────
  let subject_en, subject_fr, body_en, body_fr, lang_filter;
  try {
    const body = JSON.parse(event.body ?? '{}');
    subject_en  = (body.subject_en  ?? '').trim();
    subject_fr  = (body.subject_fr  ?? '').trim();
    body_en     = (body.body_en     ?? '').trim();
    body_fr     = (body.body_fr     ?? '').trim();
    lang_filter = ['en', 'fr', 'all'].includes(body.lang_filter) ? body.lang_filter : 'all';
  } catch {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'invalid_json' }) };
  }

  if (!subject_en || !body_en) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'missing_fields' }) };
  }
  // French content falls back to English if not provided.
  const effectiveSubjectFr = subject_fr || subject_en;
  const effectiveBodyFr    = body_fr    || body_en;

  // ── 4. Fetch active subscribers ────────────────────────────────────────────
  let subsSnap;
  try {
    subsSnap = await db.collection('newsletter_subscribers').get();
  } catch (err) {
    console.error('[send-newsletter] Firestore read failed:', err.message);
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'server_error' }) };
  }

  const siteUrl = SITE_URL();

  // Filter: active status + language filter.
  // Legacy docs without a status field are treated as active.
  const recipients = subsSnap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(s => !s.status || s.status === 'active')
    .filter(s => {
      if (lang_filter === 'all') return true;
      return (s.lang ?? s.language ?? 'en') === lang_filter;
    });

  if (recipients.length === 0) {
    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ sent: 0, failed: 0, errors: [], message: 'no_active_subscribers' }),
    };
  }

  // ── 5. Batch send ──────────────────────────────────────────────────────────
  const sends = recipients.map(sub => {
    const subLang = (sub.lang ?? sub.language ?? 'en') === 'fr' ? 'fr' : 'en';
    const unsubscribeUrl = sub.unsubscribeToken
      ? `${siteUrl}/.netlify/functions/unsubscribe?token=${sub.unsubscribeToken}&lang=${subLang}`
      : siteUrl; // Legacy subscribers without token get the site URL as fallback.

    return {
      event: 'newsletter.broadcast',
      to: sub.email,
      lang: subLang,
      payload: {
        subject:      subLang === 'fr' ? effectiveSubjectFr : subject_en,
        bodyHtml:     subLang === 'fr' ? effectiveBodyFr    : body_en,
        unsubscribeUrl,
      },
    };
  });

  const result = await sendBatch(sends);

  return {
    statusCode: 200,
    headers: CORS,
    body: JSON.stringify(result),
  };
};
