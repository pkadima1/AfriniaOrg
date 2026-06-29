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
 */

import { getAdminDb } from './lib/firebase-admin.js';

const SITE_URL = () => process.env.SITE_URL || 'https://afrinia.org';

function redirect(path) {
  return {
    statusCode: 302,
    headers: { Location: `${SITE_URL()}${path}` },
    body: '',
  };
}

export const handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const params = event.queryStringParameters ?? {};
  const token  = (params.token ?? '').trim();
  const lang   = params.lang === 'fr' ? 'fr' : 'en';

  // No token — send to homepage, nothing to do.
  if (!token) {
    return redirect('/');
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
    return redirect(`/unsubscribed?status=error&lang=${lang}`);
  }

  if (snap.empty) {
    // Token not found — already unsubscribed or invalid link.
    return redirect(`/unsubscribed?status=not_found&lang=${lang}`);
  }

  const docRef = snap.docs[0].ref;

  try {
    await docRef.update({ status: 'unsubscribed', unsubscribedAt: new Date() });
  } catch (err) {
    console.error('[unsubscribe] Firestore update failed:', err.message);
    return redirect(`/unsubscribed?status=error&lang=${lang}`);
  }

  return redirect(`/unsubscribed?status=success&lang=${lang}`);
};
