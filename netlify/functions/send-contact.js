/**
 * send-contact.js — Contact form handler. Replaces the n8n webhook entirely.
 *
 * Fires two emails atomically:
 *   1. 'contact.admin_notify'    → Afrinia team inbox (ADMIN_EMAIL env var)
 *   2. 'contact.sender_receipt'  → the person who submitted the form
 *
 * Both emails respect the lang field from the form submission.
 *
 * POST /.netlify/functions/send-contact
 * Body (JSON): { name, email, subject, message, lang }
 *
 * Responses:
 *   200  { success: true }
 *   400  { error: 'missing_fields' | 'invalid_email' }
 *   500  { error: 'server_error' }
 *
 * Runtime: Netlify Functions v2 (export default — no Lambda 4KB env var limit)
 */

import { sendBatch } from './lib/email-dispatcher.js';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SITE_URL    = () => process.env.SITE_URL    || 'https://afrinia.org';
const ADMIN_EMAIL = () => process.env.ADMIN_EMAIL || 'contact@afrinia.org';

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

  let name, email, subject, message, lang;
  try {
    const body = JSON.parse(await req.text() || '{}');
    name    = (body.name    ?? '').trim().slice(0, 120);
    email   = (body.email   ?? '').trim().toLowerCase();
    subject = (body.subject ?? '').trim().slice(0, 200);
    message = (body.message ?? '').trim().slice(0, 4000);
    lang    = body.lang === 'fr' ? 'fr' : 'en';
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }

  if (!name || !email || !subject || !message) {
    return json({ error: 'missing_fields' }, 400);
  }

  if (!EMAIL_RE.test(email)) {
    return json({ error: 'invalid_email' }, 400);
  }

  const siteUrl     = SITE_URL();
  const submittedAt = new Date().toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'UTC',
  });

  const sharedPayload = { name, email, subject, message, submittedAt, siteUrl };

  const { sent } = await sendBatch([
    // Notify the Afrinia team.
    {
      event: 'contact.admin_notify',
      to: ADMIN_EMAIL(),
      lang,
      payload: sharedPayload,
      replyTo: email,
    },
    // Send a receipt to the person who submitted the form.
    {
      event: 'contact.sender_receipt',
      to: email,
      lang,
      payload: sharedPayload,
    },
  ]);

  // If both emails failed, report an error.
  if (sent === 0) {
    console.error('[send-contact] Both emails failed');
    return json({ error: 'server_error' }, 500);
  }

  return json({ success: true });
};
