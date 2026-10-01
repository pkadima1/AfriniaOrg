/**
 * site.ts — the single definition of Afrinia's public address.
 *
 * WHY: canonical links, hreflang, JSON-LD, share and indexing URLs must always
 * name the production domain — even when the app runs on a deploy preview or
 * localhost. Building them from window.location made previews declare
 * themselves canonical. A constant (not an env var) on purpose: no environment
 * should ever publish a different canonical domain.
 * Mirrors DOMAIN in netlify/functions/lib/sitemap-xml.js (server side).
 */

export const SITE_URL = 'https://afrinia.org';

/** schema.org @id of the Afrinia Organization, declared once in index.html. */
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;

/** Absolute production URL for an app path: '/fr/blog' → 'https://afrinia.org/fr/blog'. */
export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
