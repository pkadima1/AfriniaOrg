/**
 * seo-rules.mjs — the page checks behind `npm run seo:check`, separated so
 * they can be unit-tested (tests/unit/seo-rules.test.js): a wrong rule would
 * give false confidence once seo:check is the M2 gate.
 */
import { JSDOM } from 'jsdom';

export const SITE = 'https://afrinia.org';

export const isArticle = path => /^\/(fr|en)\/blog\/[^/]+$/.test(path);
export const isListing = path => /^\/(fr|en)\/(blog|builders)$/.test(path);
export const localeOf = path => path.match(/^\/(fr|en)(\/|$)/)?.[1] ?? null;

/** Readable text a crawler gets without scripts or styles. */
function visibleText(doc) {
  doc.querySelectorAll('script, style, noscript, template').forEach(el => el.remove());
  return (doc.body?.textContent ?? '').replace(/\s+/g, ' ').trim();
}

/**
 * @param {string} path  page path, e.g. /fr/blog/le-coton
 * @param {{status:number, robots:string, html:string}} page  raw HTTP response
 * @param {Map<string,string>} seenTitles  titles already seen in this run → path
 * @returns {{rule:string, detail:string}[]} failed rules (empty = page passes)
 */
export function checkPage(path, page, seenTitles) {
  const fails = [];
  const fail = (rule, detail) => fails.push({ rule, detail });
  if (page.status !== 200) {
    fail('status-200', `got ${page.status}`);
    return fails;
  }
  const doc = new JSDOM(page.html).window.document;
  const meta = name => doc.querySelector(`meta[name="${name}"]`)?.getAttribute('content') ?? '';

  // `page.robots` is the X-Robots-Tag header. Netlify adds "noindex" to every
  // draft deploy on purpose; seo-check.mjs passes '' for those hosts, so only a
  // noindex the SITE declares (meta tag, or the header in production) fails.
  if (/noindex/i.test(meta('robots')) || /noindex/i.test(page.robots)) fail('indexable', 'noindex present');

  const locale = localeOf(path);
  const lang = doc.documentElement.getAttribute('lang');
  if (locale && lang !== locale) fail('html-lang', `lang="${lang}" on a /${locale}/ page`);

  const title = doc.querySelector('title')?.textContent?.trim() ?? '';
  if (!title) fail('title', 'empty');
  else if (seenTitles.has(title)) fail('title-unique', `same title as ${seenTitles.get(title)}`);
  else seenTitles.set(title, path);

  if (!meta('description').trim()) fail('meta-description', 'missing');

  const canonicals = [...doc.querySelectorAll('link[rel="canonical"]')].map(l => l.getAttribute('href'));
  if (canonicals.length !== 1 || canonicals[0] !== SITE + path) fail('canonical-self', canonicals.length ? canonicals.join(', ') : 'missing');

  if (isListing(path)) {
    const alt = Object.fromEntries([...doc.querySelectorAll('link[rel="alternate"][hreflang]')].map(l => [l.getAttribute('hreflang'), l.getAttribute('href')]));
    const section = path.split('/')[2];
    for (const [hreflang, expected] of [['fr', `/fr/${section}`], ['en', `/en/${section}`], ['x-default', `/fr/${section}`]]) {
      if (alt[hreflang] !== SITE + expected) fail('hreflang', `${hreflang} → ${alt[hreflang] ?? 'missing'}`);
    }
  }

  const h1s = doc.querySelectorAll('h1').length;
  if (h1s !== 1) fail('one-h1', `${h1s} <h1>`);

  const ldTypes = [...doc.querySelectorAll('script[type="application/ld+json"]')].flatMap(s => {
    try {
      const data = JSON.parse(s.textContent);
      return [data, ...(data['@graph'] ?? [])].map(d => d['@type']);
    } catch {
      return ['INVALID'];
    }
  });
  if (ldTypes.includes('INVALID')) fail('json-ld-valid', 'unparseable JSON-LD');
  if (isArticle(path) && !ldTypes.includes('Article')) fail('json-ld-article', 'no Article');

  const words = visibleText(doc).split(' ').filter(Boolean).length;
  const minWords = isArticle(path) ? 150 : 50;
  if (words < minWords) fail('body-text', `${words} words without JavaScript (min ${minWords})`);
  return fails;
}
