/**
 * welcome.js — Newsletter welcome email, fired when someone subscribes.
 *
 * Triggered by event: 'newsletter.welcome'
 * Payload: { unsubscribeUrl: string, siteUrl: string }
 */

import { wrap, ctaButton, divider, C } from './base.js';

const COPY = {
  en: {
    subject: 'Welcome to The Afrinia Brief',
    headline: 'You\'re in.',
    sub: 'One idea. Every week. Built for Africa\'s builders.',
    body1: 'The Afrinia Brief delivers one rigorous, bilingual idea each week — covering African tech, finance, policy, and the people building on this continent.',
    body2: 'No noise. No aggregation. Just signal.',
    ctaLabel: 'Read the latest ideas',
    expectHeadline: 'What to expect',
    bullets: [
      '1 long-form idea per week, in English and French',
      'Founder case studies and operator profiles',
      'African market signals and opportunity analysis',
      'Audio versions of selected articles',
    ],
  },
  fr: {
    subject: 'Bienvenue dans Le Bref Afrinia',
    headline: 'Vous êtes des nôtres.',
    sub: 'Une idée. Chaque semaine. Pour les bâtisseurs d\'Afrique.',
    body1: 'Le Bref Afrinia livre chaque semaine une idée rigoureuse et bilingue sur la tech africaine, la finance, la politique et les personnes qui construisent ce continent.',
    body2: 'Pas de bruit. Pas d\'agrégation. Que du signal.',
    ctaLabel: 'Lire les dernières idées',
    expectHeadline: 'Ce à quoi vous attendre',
    bullets: [
      '1 analyse approfondie par semaine, en français et en anglais',
      'Études de cas de fondateurs et profils d\'opérateurs',
      'Signaux de marché africains et analyse d\'opportunités',
      'Versions audio d\'articles sélectionnés',
    ],
  },
};

/**
 * @param {{ lang: 'en'|'fr', payload: { unsubscribeUrl: string, siteUrl: string } }}
 * @returns {{ subject: string, html: string }}
 */
export function welcome({ lang = 'en', payload }) {
  const { unsubscribeUrl, siteUrl } = payload;
  const c = COPY[lang] ?? COPY.en;
  const blogUrl = `${siteUrl}/${lang}/blog`;

  const content = `
    <h1 style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:36px;font-weight:300;color:${C.cream};line-height:1.1;">
      ${c.headline}
    </h1>
    <p style="margin:0 0 24px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;font-weight:300;color:${C.gold};letter-spacing:1px;">
      ${c.sub}
    </p>

    ${divider()}

    <p style="margin:0 0 16px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;font-weight:300;color:${C.muted};line-height:1.8;">
      ${c.body1}
    </p>
    <p style="margin:0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;font-weight:300;color:${C.muted};line-height:1.8;">
      ${c.body2}
    </p>

    <!-- What to expect section -->
    <div style="margin:32px 0;padding:24px 28px;background-color:${C.bg};border-left:2px solid ${C.gold};">
      <p style="margin:0 0 16px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:10px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:${C.gold};">
        ${c.expectHeadline}
      </p>
      ${c.bullets.map(b => `
      <p style="margin:0 0 8px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:13px;font-weight:300;color:${C.muted};line-height:1.6;">
        <span style="color:${C.gold};margin-right:8px;">—</span>${b}
      </p>`).join('')}
    </div>

    ${ctaButton({ href: blogUrl, label: c.ctaLabel })}
  `;

  return {
    subject: c.subject,
    html: wrap({ content, unsubscribeUrl, lang }),
  };
}
