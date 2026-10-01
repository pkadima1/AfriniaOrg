/**
 * send-contact.js — Contact form handler. Replaces the n8n webhook entirely.
 *
 * Every submission is written to Firestore (`contact_messages`) FIRST, so the
 * message survives even if the email provider is down — email is a notification
 * of the stored record, not the record itself. The admin panel at /admin/messages
 * reads from this collection.
 *
 * Then fires two emails:
 *   1. 'contact.admin_notify'    → Afrinia team inbox (ADMIN_EMAIL env var)
 *   2. 'contact.sender_receipt'  → the person who submitted the form
 *
 * Both emails respect the lang field from the form submission.
 *
 * POST /.netlify/functions/send-contact
 * Body (JSON): { name, email, subject, message, lang }
 *
 * Responses:
 *   200  { success: true }                      — stored, both emails sent
 *   200  { success: true, emailFailed: true }   — stored, but Resend failed
 *   400  { error: 'missing_fields' | 'invalid_email' }
 *   500  { error: 'server_error' }               — Firestore write failed
 *
 * Runtime: Netlify Functions v2 (export default — no Lambda 4KB env var limit)
 */

import { getAdminDb } from './lib/firebase-admin.js';
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

  // Store first — the record must survive even if the email provider is down.
  // Mirrors the pattern in subscribe.js: Firestore write is the source of truth,
  // email is best-effort on top of it.
  try {
    await getAdminDb().collection('contact_messages').add({
      name,
      email,
      subject,
      message,
      lang,
      status: 'new',
      submittedAt: new Date(),
    });
  } catch (err) {
    console.error('[send-contact] Firestore write failed:', err.message);
    return json({ error: 'server_error' }, 500);
  }

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

  // The message is safely stored regardless of email outcome — report email
  // trouble to the client without failing the request.
  if (sent === 0) {
    console.error('[send-contact] Both emails failed, message stored');
    return json({ success: true, emailFailed: true });
  }

  return json({ success: true });
};
