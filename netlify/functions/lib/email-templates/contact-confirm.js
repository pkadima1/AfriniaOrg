/**
 * contact-confirm.js — Two emails fired when someone submits the contact form.
 *
 * Event 'contact.sender_receipt'  → confirmation to the person who submitted
 * Event 'contact.admin_notify'    → notification to the Afrinia team inbox
 *
 * Both emails are bilingual. The lang is derived from the form submission.
 * Payload: { name, email, subject, message, lang, siteUrl, submittedAt }
 */

import { wrap, divider, C } from './base.js';

// ── Full bilingual copy ───────────────────────────────────────────────────────

const COPY = {
  receipt: {
    en: {
      subject: (subj) => `We received your message: "${subj}"`,
      headline: 'Message received.',
      body: (name) => `Thank you, ${name}. We have received your message and will respond within 2–3 business days.`,
      yourMessage: 'Your message',
      teamSign: 'The Afrinia Team',
    },
    fr: {
      subject: (subj) => `Nous avons reçu votre message : « ${subj} »`,
      headline: 'Message reçu.',
      body: (name) => `Merci, ${name}. Nous avons bien reçu votre message et vous répondrons sous 2 à 3 jours ouvrables.`,
      yourMessage: 'Votre message',
      teamSign: "L'équipe Afrinia",
    },
  },
  admin: {
    en: {
      emailSubject: (subj) => `[Afrinia Contact] ${subj}`,
      title: 'New contact form submission',
      labelFrom: 'From',
      labelSubject: 'Subject',
      labelDate: 'Date',
      labelMessage: 'Message',
      replyLabel: (name) => `Reply to ${name} →`,
    },
    fr: {
      emailSubject: (subj) => `[Contact Afrinia] ${subj}`,
      title: 'Nouveau message via le formulaire de contact',
      labelFrom: 'De',
      labelSubject: 'Objet',
      labelDate: 'Date',
      labelMessage: 'Message',
      replyLabel: (name) => `Répondre à ${name} →`,
    },
  },
};

// ── Sender receipt ────────────────────────────────────────────────────────────

/**
 * @param {{ lang: 'en'|'fr', payload: { name, subject, message, siteUrl } }}
 * @returns {{ subject: string, html: string }}
 */
export function contactSenderReceipt({ lang = 'en', payload }) {
  const { name, subject, message, siteUrl } = payload;
  const c = COPY.receipt[lang] ?? COPY.receipt.en;

  const content = `
    <h1 style="margin:0 0 24px;font-family:Georgia,'Times New Roman',serif;font-size:30px;font-weight:300;color:${C.cream};line-height:1.1;">
      ${c.headline}
    </h1>
    <p style="margin:0 0 24px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;font-weight:300;color:${C.muted};line-height:1.8;">
      ${c.body(escapeHtml(name))}
    </p>

    ${divider()}

    <div style="padding:20px 24px;background-color:${C.bg};border-left:2px solid ${C.gold};">
      <p style="margin:0 0 12px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:10px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:${C.gold};">
        ${c.yourMessage}
      </p>
      <p style="margin:0 0 8px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:13px;font-weight:600;color:${C.cream};">
        ${escapeHtml(subject)}
      </p>
      <p style="margin:0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:13px;font-weight:300;color:${C.muted};line-height:1.7;white-space:pre-wrap;">
        ${escapeHtml(message)}
      </p>
    </div>

    <p style="margin:32px 0 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:13px;font-weight:300;color:${C.muted};">
      ${c.teamSign}
    </p>
  `;

  return {
    subject: c.subject(subject),
    html: wrap({ content, unsubscribeUrl: siteUrl, lang }),
  };
}

// ── Admin notification ────────────────────────────────────────────────────────

/**
 * Admin notification respects the language of the form submission
 * so French-speaking senders produce a French admin notification.
 *
 * @param {{ lang: 'en'|'fr', payload: { name, email, subject, message, submittedAt, siteUrl } }}
 * @returns {{ subject: string, html: string }}
 */
export function contactAdminNotify({ lang = 'en', payload }) {
  const { name, email, subject, message, submittedAt, siteUrl } = payload;
  const c = COPY.admin[lang] ?? COPY.admin.en;

  const content = `
    <h1 style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:300;color:${C.cream};">
      ${c.title}
    </h1>
    <p style="margin:0 0 24px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:12px;color:${C.muted};">
      ${escapeHtml(submittedAt)}
    </p>

    ${divider()}

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:24px;">
      ${metaRow(c.labelFrom, `${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;`)}
      ${metaRow(c.labelSubject, escapeHtml(subject))}
    </table>

    <p style="margin:0 0 12px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:10px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:${C.gold};">
      ${c.labelMessage}
    </p>
    <div style="padding:20px 24px;background-color:${C.bg};border-left:2px solid ${C.gold};">
      <p style="margin:0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:13px;font-weight:300;color:${C.muted};line-height:1.7;white-space:pre-wrap;">
        ${escapeHtml(message)}
      </p>
    </div>

    <p style="margin:24px 0 0;">
      <a href="mailto:${escapeHtml(email)}?subject=Re%3A%20${encodeURIComponent(subject)}"
        style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:12px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:${C.gold};text-decoration:none;">
        ${c.replyLabel(escapeHtml(name))}
      </a>
    </p>
  `;

  return {
    subject: c.emailSubject(subject),
    html: wrap({ content, unsubscribeUrl: siteUrl, lang }),
  };
}

// ── Shared helpers ────────────────────────────────────────────────────────────

function metaRow(label, value) {
  return `
  <tr>
    <td style="padding:8px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:${C.gold};width:80px;vertical-align:top;">
      ${label}
    </td>
    <td style="padding:8px 0 8px 16px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:13px;color:${C.cream};vertical-align:top;">
      ${value}
    </td>
  </tr>`;
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
