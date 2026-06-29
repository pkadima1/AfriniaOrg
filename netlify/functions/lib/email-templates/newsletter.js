/**
 * newsletter.js — Admin newsletter broadcast email template.
 *
 * Triggered by event: 'newsletter.broadcast'
 * Payload: { subject, bodyHtml, lang, unsubscribeUrl, siteUrl }
 *
 * The subject and bodyHtml are admin-composed per send.
 * This file provides the branded wrapper and the bilingual footer.
 */

import { wrap, C } from './base.js';

const COPY = {
  en: {
    issueLabel: 'The Afrinia Brief',
    readOnlineCopy: 'View in browser',
    footerTagline: 'Intelligence for Africa\'s builders.',
  },
  fr: {
    issueLabel: 'Le Bref Afrinia',
    readOnlineCopy: 'Voir dans le navigateur',
    footerTagline: 'L\'intelligence pour les bâtisseurs d\'Afrique.',
  },
};

/**
 * @param {{ lang: 'en'|'fr', payload: { subject, bodyHtml, unsubscribeUrl, siteUrl } }}
 * @returns {{ subject: string, html: string }}
 */
export function newsletter({ lang = 'en', payload }) {
  const { subject, bodyHtml, unsubscribeUrl, siteUrl } = payload;
  const c = COPY[lang] ?? COPY.en;

  // The admin composes bodyHtml in the admin panel — it's already HTML.
  // We wrap it in the branded shell without escaping.
  const content = `
    <!-- Issue label -->
    <p style="margin:0 0 24px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:10px;font-weight:600;letter-spacing:4px;text-transform:uppercase;color:${C.gold};">
      ${c.issueLabel}
    </p>

    <!-- Admin-composed body -->
    <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;font-weight:300;color:${C.muted};line-height:1.8;">
      ${bodyHtml}
    </div>

    <!-- Branded footer tagline -->
    <div style="margin-top:40px;padding-top:24px;border-top:1px solid rgba(184,145,42,0.18);">
      <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:13px;font-style:italic;color:${C.muted};opacity:0.6;">
        ${c.footerTagline}
      </p>
    </div>
  `;

  return {
    subject,
    html: wrap({ content, unsubscribeUrl, lang }),
  };
}
