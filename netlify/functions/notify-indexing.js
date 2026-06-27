/**
 * notify-indexing — Netlify Function
 *
 * Called by the admin panel when an article is published or unpublished.
 * Sends a URL_UPDATED or URL_DELETED notification to the Google Indexing API
 * so Google discovers new articles within hours instead of waiting weeks for a crawl.
 *
 * Required Netlify env vars (set in Netlify UI → Site → Environment variables):
 *   GOOGLE_INDEXING_CLIENT_EMAIL  — service account email from the JSON key file
 *   GOOGLE_INDEXING_PRIVATE_KEY   — PEM private key from the JSON key file
 *                                   Replace literal \n with actual newlines when pasting.
 *
 * How to get these credentials — see docs/GOOGLE_INDEXING_SETUP.md
 *
 * Called via:  POST /.netlify/functions/notify-indexing
 * Body (JSON): { "url": "https://afrinia.org/fr/blog/my-slug", "type": "URL_UPDATED" }
 *              type is either "URL_UPDATED" (publish) or "URL_DELETED" (unpublish/delete)
 */

import { createSign } from 'crypto';

const SCOPE = 'https://www.googleapis.com/auth/indexing';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const INDEXING_URL = 'https://indexing.googleapis.com/v3/urlNotifications:publish';

/** Base64url encode (JWT format — no padding, URL-safe chars). */
function b64url(str) {
  return Buffer.from(str).toString('base64url');
}

/**
 * Build and sign a JWT for the Google service account.
 * Google's Indexing API uses OAuth 2.0 with service accounts (not API keys).
 * The JWT is signed with RS256 using the service account private key.
 */
function buildJwt(clientEmail, privateKey) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = b64url(JSON.stringify({
    iss: clientEmail,
    scope: SCOPE,
    aud: TOKEN_URL,
    exp: now + 3600,
    iat: now,
  }));
  const unsigned = `${header}.${claim}`;
  const sign = createSign('RSA-SHA256');
  sign.update(unsigned);
  const sig = sign.sign(privateKey, 'base64url');
  return `${unsigned}.${sig}`;
}

/** Exchange a signed JWT for a short-lived OAuth access token. */
async function getAccessToken(clientEmail, privateKey) {
  const jwt = buildJwt(clientEmail, privateKey);
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Token exchange failed (${res.status}): ${body}`);
  }
  const data = await res.json();
  return data.access_token;
}

/** Notify Google Indexing API for a single URL. */
async function notifyGoogle(accessToken, url, type) {
  const res = await fetch(INDEXING_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ url, type }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Indexing API error (${res.status}): ${body}`);
  }
  return await res.json();
}

export const handler = async (event) => {
  // Only accept POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  // Parse the request body
  let url, type;
  try {
    const body = JSON.parse(event.body || '{}');
    url = body.url;
    type = body.type || 'URL_UPDATED';
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  if (!url || !url.startsWith('https://afrinia.org/')) {
    return { statusCode: 400, body: JSON.stringify({ error: 'url must be an afrinia.org URL' }) };
  }

  if (!['URL_UPDATED', 'URL_DELETED'].includes(type)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'type must be URL_UPDATED or URL_DELETED' }) };
  }

  // Check credentials are configured
  const clientEmail = process.env.GOOGLE_INDEXING_CLIENT_EMAIL;
  const privateKey = (process.env.GOOGLE_INDEXING_PRIVATE_KEY || '').replace(/\\n/g, '\n');

  if (!clientEmail || !privateKey) {
    console.warn('[notify-indexing] credentials not configured — skipping');
    return {
      statusCode: 200,
      body: JSON.stringify({ skipped: true, reason: 'credentials_not_configured' }),
    };
  }

  try {
    const token = await getAccessToken(clientEmail, privateKey);
    const result = await notifyGoogle(token, url, type);
    console.log(`[notify-indexing] notified Google: ${type} ${url}`);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true, url, type, result }),
    };
  } catch (err) {
    console.error('[notify-indexing] error:', err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
