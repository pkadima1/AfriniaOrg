/**
 * sitemap-xml.js — builds the sitemap XML from already-fetched post data.
 *
 * WHY this is separate from sitemap.js: it is pure (no Firebase, no clock), so
 * it can be unit-tested (sitemap-xml.test.js) and every date it writes is
 * traceable to a real document.
 *
 * <lastmod> rule: Google only trusts lastmod when it is consistently accurate.
 * A date is written only when it comes from content (a post's updated_at,
 * falling back to published_at/created_at); pages whose change date is unknown
 * (about, contact, legal…) get no lastmod rather than an invented "today".
 */

export const DOMAIN = 'https://afrinia.org';

/** Static pages without a data source for their change date. */
const STATIC_PAGES = [
  { path: '/about', changefreq: 'monthly', priority: '0.8' },
  { path: '/audio', changefreq: 'weekly', priority: '0.7' },
  { path: '/contact', changefreq: 'yearly', priority: '0.6' },
  { path: '/privacy', changefreq: 'yearly', priority: '0.4' },
  { path: '/terms', changefreq: 'yearly', priority: '0.4' },
];

const XML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' };

/** Slugs come from the admin editor — escape so one odd character can't break the whole file. */
export function escapeXml(value) {
  return String(value).replace(/[&<>"']/g, ch => XML_ESCAPES[ch]);
}

/**
 * Convert a Firestore date (ISO string or Timestamp-like object) to YYYY-MM-DD.
 * Returns null when there is no usable date — never the current date.
 */
export function toDate(ts) {
  if (!ts) return null;
  let date = null;
  if (typeof ts === 'string') date = new Date(ts);
  else if (typeof ts === 'object') {
    const sec = ts.seconds ?? ts._seconds;
    if (typeof sec === 'number') date = new Date(sec * 1000);
  }
  if (!date || Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

/** Last real change of a post: edit date, else publish date, else creation date. */
export function postLastmod(post) {
  return toDate(post.updated_at) ?? toDate(post.published_at) ?? toDate(post.created_at);
}

/** Most recent date in a list (YYYY-MM-DD strings sort chronologically), or null. */
export function latest(dates) {
  const real = dates.filter(Boolean).sort();
  return real.length ? real[real.length - 1] : null;
}

function urlBlock({ loc, lastmod, changefreq, priority, alternates = [] }) {
  const lines = [`    <loc>${escapeXml(loc)}</loc>`];
  if (lastmod) lines.push(`    <lastmod>${lastmod}</lastmod>`);
  lines.push(`    <changefreq>${changefreq}</changefreq>`, `    <priority>${priority}</priority>`);
  for (const { hreflang, href } of alternates) {
    lines.push(`    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${escapeXml(href)}"/>`);
  }
  return `  <url>\n${lines.join('\n')}\n  </url>`;
}

/** EN/FR alternates for a listing that exists in both languages (blog, builders). */
function listingAlternates(section) {
  return [
    { hreflang: 'fr', href: `${DOMAIN}/fr/${section}` },
    { hreflang: 'en', href: `${DOMAIN}/en/${section}` },
    { hreflang: 'x-default', href: `${DOMAIN}/fr/${section}` },
  ];
}

/** Documents without a slug have no URL — skip rather than emit /undefined. */
function withLastmod(docs) {
  return docs.filter(d => d.slug).map(d => ({ slug: d.slug, lastmod: postLastmod(d) }));
}

/**
 * @param {{ frPosts: object[], enPosts: object[], frBuilders?: object[], enBuilders?: object[] }} content
 *   Published documents only; each needs `slug` and any of updated_at/published_at/created_at.
 *   Builder profiles are separate documents per language (no hreflang pair).
 * @returns {string} sitemap XML
 */
export function buildSitemapXml({ frPosts, enPosts, frBuilders = [], enBuilders = [] }) {
  const fr = withLastmod(frPosts);
  const en = withLastmod(enPosts);
  const frB = withLastmod(frBuilders);
  const enB = withLastmod(enBuilders);

  // A listing changes when its newest post changes; the homepage shows both languages.
  const frListLastmod = latest(fr.map(p => p.lastmod));
  const enListLastmod = latest(en.map(p => p.lastmod));
  const homeLastmod = latest([frListLastmod, enListLastmod]);

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset',
    '  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '  xmlns:xhtml="http://www.w3.org/1999/xhtml"',
    '>',
    '',
    '  <!-- Homepage — lastmod = newest article in either language -->',
    urlBlock({ loc: `${DOMAIN}/`, lastmod: homeLastmod, changefreq: 'weekly', priority: '1.0' }),
    '',
    '  <!-- Blog listings — hreflang: same page type, two language variants -->',
    urlBlock({ loc: `${DOMAIN}/fr/blog`, lastmod: frListLastmod, changefreq: 'daily', priority: '0.9', alternates: listingAlternates('blog') }),
    urlBlock({ loc: `${DOMAIN}/en/blog`, lastmod: enListLastmod, changefreq: 'daily', priority: '0.9', alternates: listingAlternates('blog') }),
    '',
    '  <!-- Builder directories — lastmod = newest profile in that language -->',
    urlBlock({ loc: `${DOMAIN}/fr/builders`, lastmod: latest(frB.map(b => b.lastmod)), changefreq: 'weekly', priority: '0.6', alternates: listingAlternates('builders') }),
    urlBlock({ loc: `${DOMAIN}/en/builders`, lastmod: latest(enB.map(b => b.lastmod)), changefreq: 'weekly', priority: '0.6', alternates: listingAlternates('builders') }),
    '',
    '  <!-- Static pages — no lastmod: their change date is not tracked -->',
    ...STATIC_PAGES.map(p => urlBlock({ loc: `${DOMAIN}${p.path}`, ...p })),
    '',
    '  <!-- Francophone Africa articles (audience: FR-speaking Africa) -->',
    ...fr.map(p => urlBlock({ loc: `${DOMAIN}/fr/blog/${p.slug}`, lastmod: p.lastmod, changefreq: 'monthly', priority: '0.9' })),
    '',
    '  <!-- Anglophone Africa articles (audience: EN-speaking Africa) -->',
    ...en.map(p => urlBlock({ loc: `${DOMAIN}/en/blog/${p.slug}`, lastmod: p.lastmod, changefreq: 'monthly', priority: '0.9' })),
    '',
    '  <!-- Builder profiles (each exists only in the language it was written in) -->',
    ...frB.map(b => urlBlock({ loc: `${DOMAIN}/fr/builders/${b.slug}`, lastmod: b.lastmod, changefreq: 'monthly', priority: '0.7' })),
    ...enB.map(b => urlBlock({ loc: `${DOMAIN}/en/builders/${b.slug}`, lastmod: b.lastmod, changefreq: 'monthly', priority: '0.7' })),
    '',
    '</urlset>',
  ].join('\n');
}
