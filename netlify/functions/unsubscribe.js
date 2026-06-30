/**
 * unsubscribe.js — Token-based newsletter unsubscribe handler.
 *
 * Every welcome and broadcast email contains a unique unsubscribe link:
 *   https://afrinia.org/.netlify/functions/unsubscribe?token=UUID&lang=en
 *
 * Clicking it:
 *   1. Looks up the subscriber by their unsubscribeToken in Firestore
 *   2. Sets status → 'unsubscribed'
 *   3. Redirects to /unsubscribed?status=success&lang={lang}
 *
 * No login required. The UUID token is the proof of identity.
 *
 * GET /.netlify/functions/unsubscribe?token=UUID&lang=en|fr
 *
 * Runtime: Netlify Functions v2 (export default — no Lambda 4KB env var limit)
 */

import { getAdminDb } from './lib/firebase-admin.js';

const SITE_URL = () => process.env.SITE_URL || 'https://afrinia.org';

export default async (req) => {
  if (req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  const params = new URL(req.url).searchParams;
  const token  = (params.get('token') ?? '').trim();
  const lang   = params.get('lang') === 'fr' ? 'fr' : 'en';

  // No token — send to homepage, nothing to do.
  if (!token) {
    return Response.redirect(`${SITE_URL()}/`, 302);
  }

  const db = getAdminDb();

  // Find the subscriber by their unique unsubscribe token.
  let snap;
  try {
    snap = await db.collection('newsletter_subscribers')
      .where('unsubscribeToken', '==', token)
      .limit(1)
      .get();
  } catch (err) {
    console.error('[unsubscribe] Firestore query failed:', err.message);
    return Response.redirect(`${SITE_URL()}/unsubscribed?status=error&lang=${lang}`, 302);
  }

  if (snap.empty) {
    // Token not found — already unsubscribed or invalid link.
    return Response.redirect(`${SITE_URL()}/unsubscribed?status=not_found&lang=${lang}`, 302);
  }

  const docRef = snap.docs[0].ref;

  try {
    await docRef.update({ status: 'unsubscribed', unsubscribedAt: new Date() });
  } catch (err) {
    console.error('[unsubscribe] Firestore update failed:', err.message);
    return Response.redirect(`${SITE_URL()}/unsubscribed?status=error&lang=${lang}`, 302);
  }

  return Response.redirect(`${SITE_URL()}/unsubscribed?status=success&lang=${lang}`, 302);
};
