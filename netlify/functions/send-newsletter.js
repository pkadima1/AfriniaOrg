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
 *   subject_en:      string,
 *   subject_fr:      string,
 *   body_en:         string,
 *   body_fr:         string,
 *   lang_filter:     'en' | 'fr' | 'all',
 *   signal?:         PostCategory | null,   — when set, only signal followers receive
 *   includeGeneric?: boolean                — when true, also send to signals:[] subscribers
 * }
 *
 * Signal targeting rules:
 *   signal absent or null  → all active subscribers (existing behaviour)
 *   signal = 'investment'  → only subscribers where signals array-contains 'investment'
 *   signal + includeGeneric → same as above PLUS subscribers where signals = []
 *
 * Responses:
 *   200  { sent: N, failed: M, errors: string[] }
 *   400  { error: 'missing_fields' }
 *   401  { error: 'unauthorized' }
 *   403  { error: 'forbidden' }
 *   500  { error: 'server_error' }
 *
 * Runtime: Netlify Functions v2 (export default — no Lambda 4KB env var limit)
 */

import { getAdminDb, getAdminAuth } from './lib/firebase-admin.js';
import { sendBatch } from './lib/email-dispatcher.js';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SITE_URL = () => process.env.SITE_URL || 'https://afrinia.org';

// Canonical signal keys — mirrors PostCategory / VALID_SIGNALS in subscribe.js
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

  // ── 1. Verify Firebase ID token ────────────────────────────────────────────
  const authHeader = req.headers.get('authorization') ?? '';
  const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!idToken) {
    return json({ error: 'unauthorized' }, 401);
  }

  let uid;
  try {
    const decoded = await getAdminAuth().verifyIdToken(idToken);
    uid = decoded.uid;
  } catch (err) {
    console.error('[send-newsletter] Token verification failed:', err.message);
    return json({ error: 'unauthorized' }, 401);
  }

  // ── 2. Verify the user is an admin in Firestore ────────────────────────────
  const db = getAdminDb();
  const profileSnap = await db.collection('user_profiles').doc(uid).get();
  if (!profileSnap.exists || profileSnap.data()?.role !== 'admin') {
    return json({ error: 'forbidden' }, 403);
  }

  // ── 3. Parse and validate the request body ─────────────────────────────────
  let subject_en, subject_fr, body_en, body_fr, lang_filter, signal, includeGeneric;
  try {
    const body = JSON.parse(await req.text() || '{}');
    subject_en     = (body.subject_en  ?? '').trim();
    subject_fr     = (body.subject_fr  ?? '').trim();
    body_en        = (body.body_en     ?? '').trim();
    body_fr        = (body.body_fr     ?? '').trim();
    lang_filter    = ['en', 'fr', 'all'].includes(body.lang_filter) ? body.lang_filter : 'all';
    // signal: valid PostCategory key or null/absent = send to all subscribers
    signal         = (body.signal && VALID_SIGNALS.has(body.signal)) ? body.signal : null;
    // includeGeneric: when true, also include subscribers with signals:[] alongside signal followers
    includeGeneric = body.includeGeneric === true;
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }

  if (!subject_en || !body_en) {
    return json({ error: 'missing_fields' }, 400);
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
    return json({ error: 'server_error' }, 500);
  }

  const siteUrl = SITE_URL();

  // Filter: active status + language filter + optional signal targeting.
  // Legacy docs without a status field are treated as active.
  const recipients = subsSnap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(s => !s.status || s.status === 'active')
    .filter(s => {
      if (lang_filter === 'all') return true;
      return (s.lang ?? s.language ?? 'en') === lang_filter;
    })
    .filter(s => {
      // No signal targeting → send to everyone.
      if (!signal) return true;
      const subs = Array.isArray(s.signals) ? s.signals : [];
      // Declared follower of this signal.
      if (subs.includes(signal)) return true;
      // Generic subscriber (signals: []) included only when explicitly requested.
      if (includeGeneric && subs.length === 0) return true;
      return false;
    });

  console.log(
    `[send-newsletter] Targeting: ${signal ? `signal=${signal}` : 'all'} | ` +
    `includeGeneric=${includeGeneric} | lang=${lang_filter} | recipients=${recipients.length}`
  );

  if (recipients.length === 0) {
    return json({ sent: 0, failed: 0, errors: [], message: 'no_active_subscribers' });
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

  return json(result);
};
