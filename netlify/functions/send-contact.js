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

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'method_not_allowed' }) };
  }

  let name, email, subject, message, lang;
  try {
    const body = JSON.parse(event.body ?? '{}');
    name    = (body.name    ?? '').trim().slice(0, 120);
    email   = (body.email   ?? '').trim().toLowerCase();
    subject = (body.subject ?? '').trim().slice(0, 200);
    message = (body.message ?? '').trim().slice(0, 4000);
    lang    = body.lang === 'fr' ? 'fr' : 'en';
  } catch {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'invalid_json' }) };
  }

  if (!name || !email || !subject || !message) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'missing_fields' }) };
  }

  if (!EMAIL_RE.test(email)) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'invalid_email' }) };
  }

  const siteUrl      = SITE_URL();
  const submittedAt  = new Date().toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'UTC',
  });

  const sharedPayload = { name, email, subject, message, submittedAt, siteUrl };

  const { sent, failed } = await sendBatch([
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
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'server_error' }) };
  }

  return {
    statusCode: 200,
    headers: CORS,
    body: JSON.stringify({ success: true }),
  };
};
