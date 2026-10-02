/**
 * Tests for the seo:check rules (scripts/lib/seo-rules.mjs). seo:check is the
 * M2 gate, so each rule must pass a correct page AND catch its own defect —
 * otherwise a green report would mean nothing.
 */
import { describe, expect, test } from 'vitest';
import { checkPage } from '../../scripts/lib/seo-rules.mjs';

const words = n => Array.from({ length: n }, (_, i) => `mot${i}`).join(' ');

/** A raw-HTML article that satisfies every rule; overrides break one thing. */
function articleHtml({ lang = 'fr', title = 'Le Coton | Afrinia', canonical = 'https://afrinia.org/fr/blog/le-coton', h1 = '<h1>Le Coton</h1>', body = words(200), jsonLd = '{"@context":"https://schema.org","@type":"Article","headline":"Le Coton"}', head = '' } = {}) {
  return `<!doctype html><html lang="${lang}"><head><title>${title}</title>
    <meta name="description" content="Un signal stratégique.">
    ${canonical ? `<link rel="canonical" href="${canonical}">` : ''}
    <script type="application/ld+json">${jsonLd}</script>${head}</head>
    <body>${h1}<p>${body}</p><script>var hidden = "${words(500)}";</script></body></html>`;
}

const ok = html => ({ status: 200, robots: '', html });
const rules = (path, page, seen = new Map()) => checkPage(path, page, seen).map(f => f.rule);

describe('a correct article passes every rule', () => {
  test('no failures', () => {
    expect(checkPage('/fr/blog/le-coton', ok(articleHtml()), new Map())).toEqual([]);
  });
});

describe('each rule catches its defect', () => {
  const path = '/fr/blog/le-coton';
  test('status-200', () => expect(rules(path, { status: 404, robots: '', html: '' })).toEqual(['status-200']));
  test('indexable (meta robots or header)', () => {
    expect(rules(path, ok(articleHtml({ head: '<meta name="robots" content="noindex">' })))).toContain('indexable');
    expect(rules(path, { status: 200, robots: 'noindex', html: articleHtml() })).toContain('indexable');
  });
  test('html-lang', () => expect(rules(path, ok(articleHtml({ lang: 'en' })))).toContain('html-lang'));
  test('title present and unique', () => {
    expect(rules(path, ok(articleHtml({ title: '' })))).toContain('title');
    const seen = new Map([['Le Coton | Afrinia', '/fr/blog/other']]);
    expect(rules(path, ok(articleHtml()), seen)).toContain('title-unique');
  });
  test('canonical-self: missing, wrong (homepage) or relative', () => {
    expect(rules(path, ok(articleHtml({ canonical: '' })))).toContain('canonical-self');
    expect(rules(path, ok(articleHtml({ canonical: 'https://afrinia.org/' })))).toContain('canonical-self');
    expect(rules(path, ok(articleHtml({ canonical: '/fr/blog/le-coton' })))).toContain('canonical-self');
  });
  test('one-h1: none or two', () => {
    expect(rules(path, ok(articleHtml({ h1: '' })))).toContain('one-h1');
    expect(rules(path, ok(articleHtml({ h1: '<h1>a</h1><h1>b</h1>' })))).toContain('one-h1');
  });
  test('body-text counts only visible text (script content does not count)', () => {
    expect(rules(path, ok(articleHtml({ body: words(100) })))).toContain('body-text');
  });
  test('json-ld: articles need Article; invalid JSON is reported', () => {
    expect(rules(path, ok(articleHtml({ jsonLd: '{"@type":"WebPage"}' })))).toContain('json-ld-article');
    expect(rules(path, ok(articleHtml({ jsonLd: '{not json' })))).toContain('json-ld-valid');
  });
  test('Article inside an @graph counts', () => {
    expect(rules(path, ok(articleHtml({ jsonLd: '{"@graph":[{"@type":"Organization"},{"@type":"Article"}]}' })))).toEqual([]);
  });
});

describe('listings and language-less pages', () => {
  const listing = (alternates, lang = 'en') => `<!doctype html><html lang="${lang}"><head><title>Ideas</title>
    <meta name="description" content="d"><link rel="canonical" href="https://afrinia.org/en/blog">${alternates}</head>
    <body><h1>Ideas</h1><p>${words(80)}</p></body></html>`;
  const goodAlternates = '<link rel="alternate" hreflang="fr" href="https://afrinia.org/fr/blog"><link rel="alternate" hreflang="en" href="https://afrinia.org/en/blog"><link rel="alternate" hreflang="x-default" href="https://afrinia.org/fr/blog">';

  test('a listing with its EN/FR pair and x-default passes', () => {
    expect(checkPage('/en/blog', ok(listing(goodAlternates)), new Map())).toEqual([]);
  });
  test('a listing without hreflang fails', () => {
    expect(rules('/en/blog', ok(listing('')))).toContain('hreflang');
  });
  test('pages without a language prefix are not held to a lang value (until M2)', () => {
    const html = listing('', 'fr').replace('https://afrinia.org/en/blog', 'https://afrinia.org/about');
    expect(rules('/about', ok(html))).not.toContain('html-lang');
  });
});
