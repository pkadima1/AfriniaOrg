/**
 * base.js — shared HTML wrapper for all Afrinia emails.
 *
 * WHY this exists: every email shares the same branded shell (navy background,
 * gold accents, footer with unsubscribe link). Only the inner content changes.
 * One place to update the design, all templates update automatically.
 *
 * To add a new email event: create a new template file that exports a function
 * returning { subject, html } where html is built by calling wrap() from here.
 */

// Brand tokens mirrored from the Afrinia CSS design system.
const C = {
  bg:     '#0f172a',
  bg2:    '#131f35',
  gold:   '#B8912A',
  cream:  '#F5F0E8',
  muted:  '#8a9bb5',
  border: 'rgba(184,145,42,0.18)',
};

/**
 * Wraps inner HTML content in the Afrinia email shell.
 *
 * @param {object} opts
 * @param {string} opts.content   - The inner body HTML (between header and footer)
 * @param {string} opts.unsubscribeUrl - Full URL for the unsubscribe link (included in footer)
 * @param {'en'|'fr'} opts.lang  - Language for footer copy
 * @returns {string} Complete HTML email string
 */
export function wrap({ content, unsubscribeUrl, lang = 'en' }) {
  const year = new Date().getFullYear();
  const footerCopy = lang === 'fr'
    ? `© ${year} Afrinia. Tous droits réservés.`
    : `© ${year} Afrinia. All rights reserved.`;
  const unsubscribeCopy = lang === 'fr'
    ? 'Se désabonner'
    : 'Unsubscribe';
  const footerNote = lang === 'fr'
    ? 'Vous recevez cet e-mail parce que vous vous êtes abonné(e) à The Afrinia Brief.'
    : 'You are receiving this email because you subscribed to The Afrinia Brief.';

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Afrinia</title>
</head>
<body style="margin:0;padding:0;background-color:${C.bg};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:${C.bg};">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <!-- Email container — max 600px, consistent with major clients -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
          style="max-width:600px;background-color:${C.bg2};border:1px solid ${C.border};">

          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 28px;border-bottom:1px solid ${C.border};">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <span style="display:inline-block;width:20px;height:1px;background:${C.gold};vertical-align:middle;margin-right:10px;"></span>
                    <span style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:10px;font-weight:600;letter-spacing:4px;text-transform:uppercase;color:${C.gold};">THE AFRINIA BRIEF</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body content -->
          <tr>
            <td style="padding:40px 40px 32px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px 32px;border-top:1px solid ${C.border};">
              <p style="margin:0 0 8px;font-size:11px;color:${C.muted};line-height:1.6;">${footerNote}</p>
              <p style="margin:0;font-size:11px;color:${C.muted};">
                ${footerCopy} &nbsp;·&nbsp;
                <a href="${unsubscribeUrl}" style="color:${C.gold};text-decoration:none;">${unsubscribeCopy}</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Renders a gold CTA button.
 *
 * @param {object} opts
 * @param {string} opts.href  - Button URL
 * @param {string} opts.label - Button text
 * @returns {string} HTML table-based button (renders in all email clients)
 */
export function ctaButton({ href, label }) {
  return `
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:32px 0 0;">
    <tr>
      <td style="background-color:${C.gold};padding:0;">
        <a href="${href}"
          style="display:inline-block;padding:14px 36px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;
                 font-size:11px;font-weight:600;letter-spacing:2.5px;text-transform:uppercase;
                 color:#0a1628;text-decoration:none;white-space:nowrap;">
          ${label}
        </a>
      </td>
    </tr>
  </table>`;
}

/** Renders a gold horizontal divider line. */
export function divider() {
  return `<div style="width:40px;height:1px;background:${C.gold};opacity:0.5;margin:24px 0;"></div>`;
}

// Expose brand colours to templates that need inline references.
export { C };
