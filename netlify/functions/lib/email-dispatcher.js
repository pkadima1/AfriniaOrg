/**
 * email-dispatcher.js — Central email routing engine.
 *
 * All email sending in the entire mailing system flows through sendEmail().
 * No Netlify function calls the Resend SDK directly — they all call this.
 *
 * WHY this matters for the future: adding open tracking, switching from Resend
 * to another provider, adding a/b subject line testing, or logging every send
 * requires editing exactly ONE file, not hunting through every function.
 *
 * Usage:
 *   import { sendEmail } from './lib/email-dispatcher.js';
 *
 *   await sendEmail({
 *     event: 'newsletter.welcome',
 *     to: 'user@example.com',
 *     lang: 'fr',
 *     payload: { unsubscribeUrl, siteUrl },
 *   });
 *
 * To add a new event: register it in lib/email-templates/index.js. Done.
 */

import { Resend } from 'resend';
import { templates } from './email-templates/index.js';

// Singleton Resend client — reused across warm Lambda invocations.
let _resend = null;
function getResend() {
  if (_resend) return _resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY env var is missing.');
  _resend = new Resend(key);
  return _resend;
}

const FROM_EMAIL = () => process.env.FROM_EMAIL || 'newsletter@afrinia.org';
const SITE_URL   = () => process.env.SITE_URL   || 'https://afrinia.org';

/**
 * Sends a single email by dispatching to the correct template.
 *
 * @param {object} opts
 * @param {string}      opts.event    - Template key, e.g. 'newsletter.welcome'
 * @param {string}      opts.to       - Recipient email address
 * @param {'en'|'fr'}   opts.lang     - Language for subject + body copy (default: 'en')
 * @param {object}      opts.payload  - Event-specific data passed to the template
 * @param {string}      [opts.from]   - Override sender address (defaults to FROM_EMAIL env var)
 * @param {string}      [opts.replyTo]- Optional reply-to address
 * @returns {Promise<{ id: string }>} Resend send result
 * @throws {Error} if event is not registered or Resend call fails
 */
export async function sendEmail({ event, to, lang = 'en', payload = {}, from, replyTo }) {
  const template = templates[event];
  if (!template) {
    throw new Error(
      `[email-dispatcher] Unknown event "${event}". ` +
      `Register it in lib/email-templates/index.js.`
    );
  }

  // Inject site URL into payload so templates can build absolute links.
  const enrichedPayload = { siteUrl: SITE_URL(), ...payload };

  const { subject, html } = template({ lang, payload: enrichedPayload });

  const sendParams = {
    from: from || FROM_EMAIL(),
    to,
    subject,
    html,
  };
  if (replyTo) sendParams.reply_to = replyTo;

  const result = await getResend().emails.send(sendParams);
  return result;
}

/**
 * Sends the same event to multiple recipients, each with their own lang/payload.
 * Uses Promise.allSettled so one failure does not abort the rest.
 *
 * @param {Array<{ event, to, lang, payload, from, replyTo }>} sends
 * @returns {Promise<{ sent: number, failed: number, errors: string[] }>}
 */
export async function sendBatch(sends) {
  const results = await Promise.allSettled(sends.map(s => sendEmail(s)));

  let sent = 0;
  let failed = 0;
  const errors = [];

  for (const r of results) {
    if (r.status === 'fulfilled') {
      sent++;
    } else {
      failed++;
      errors.push(r.reason?.message ?? 'Unknown error');
    }
  }

  return { sent, failed, errors };
}
