/**
 * Unit tests for netlify/functions/lib/sitemap-xml.js.
 * Guards the rule that every <lastmod> comes from real content dates — never
 * the day the sitemap was generated — plus URL shape and XML safety.
 * Run: npm test  (Node's built-in test runner, no dependencies)
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildSitemapXml, toDate, postLastmod, latest, escapeXml } from '../../netlify/functions/lib/sitemap-xml.js';

/** Returns the <url> block whose <loc> is exactly `loc`, or undefined. */
function urlEntry(xml, loc) {
  return xml.split('<url>').find(block => block.includes(`<loc>${loc}</loc>`));
}

test('toDate: ISO strings and Firestore Timestamp shapes become YYYY-MM-DD', () => {
  assert.equal(toDate('2026-05-07T18:50:26.397Z'), '2026-05-07');
  assert.equal(toDate({ seconds: 1778179826 }), '2026-05-07');
  assert.equal(toDate({ _seconds: 1778179826 }), '2026-05-07');
});

test('toDate: missing or invalid dates return null, never today', () => {
  for (const bad of [undefined, null, '', 'not-a-date', {}, { seconds: 'x' }]) {
    assert.equal(toDate(bad), null, `input ${JSON.stringify(bad)}`);
  }
});

test('postLastmod: prefers updated_at, then published_at, then created_at', () => {
  assert.equal(postLastmod({ updated_at: '2026-04-21T00:00:00Z', published_at: '2026-04-16T00:00:00Z' }), '2026-04-21');
  assert.equal(postLastmod({ published_at: '2026-04-16T00:00:00Z', created_at: '2026-04-01T00:00:00Z' }), '2026-04-16');
  assert.equal(postLastmod({ created_at: '2026-04-01T00:00:00Z' }), '2026-04-01');
  assert.equal(postLastmod({}), null);
});

test('latest: newest real date, ignoring nulls', () => {
  assert.equal(latest(['2026-04-01', null, '2026-07-10', '2026-05-07']), '2026-07-10');
  assert.equal(latest([null, null]), null);
  assert.equal(latest([]), null);
});

test('escapeXml: characters that would break XML are escaped', () => {
  assert.equal(escapeXml(`a&b<c>"d'`), 'a&amp;b&lt;c&gt;&quot;d&apos;');
});

const frPosts = [
  { slug: 'le-coton', updated_at: '2026-05-07T18:50:26Z' },
  { slug: 'le-mirage', published_at: '2026-04-16T13:28:38Z', updated_at: '2026-04-21T08:42:10Z' },
];
const enPosts = [{ slug: 'cotton', created_at: '2026-07-10T15:36:20Z' }];

test('articles get their own real lastmod and language-prefixed URLs', () => {
  const xml = buildSitemapXml({ frPosts, enPosts });
  assert.match(urlEntry(xml, 'https://afrinia.org/fr/blog/le-coton'), /<lastmod>2026-05-07<\/lastmod>/);
  assert.match(urlEntry(xml, 'https://afrinia.org/fr/blog/le-mirage'), /<lastmod>2026-04-21<\/lastmod>/);
  assert.match(urlEntry(xml, 'https://afrinia.org/en/blog/cotton'), /<lastmod>2026-07-10<\/lastmod>/);
});

test('listings take their newest article date; homepage the newest of both', () => {
  const xml = buildSitemapXml({ frPosts, enPosts });
  assert.match(urlEntry(xml, 'https://afrinia.org/fr/blog'), /<lastmod>2026-05-07<\/lastmod>/);
  assert.match(urlEntry(xml, 'https://afrinia.org/en/blog'), /<lastmod>2026-07-10<\/lastmod>/);
  assert.match(urlEntry(xml, 'https://afrinia.org/'), /<lastmod>2026-07-10<\/lastmod>/);
});

test('static pages carry no lastmod (their change date is unknown)', () => {
  const xml = buildSitemapXml({ frPosts, enPosts });
  for (const path of ['/about', '/audio', '/contact', '/builders', '/privacy', '/terms']) {
    const entry = urlEntry(xml, `https://afrinia.org${path}`);
    assert.ok(entry, `${path} is listed`);
    assert.doesNotMatch(entry, /<lastmod>/, `${path} has no lastmod`);
  }
});

test("no date in the sitemap is today's date unless content says so", () => {
  const today = new Date().toISOString().slice(0, 10);
  const xml = buildSitemapXml({ frPosts, enPosts });
  assert.ok(!xml.includes(`<lastmod>${today}</lastmod>`));
});

test('posts without a slug or dates are handled safely', () => {
  const xml = buildSitemapXml({ frPosts: [{ updated_at: '2026-01-01' }, { slug: 'no-dates' }], enPosts: [] });
  assert.ok(!xml.includes('undefined'), 'no /blog/undefined URL');
  assert.doesNotMatch(urlEntry(xml, 'https://afrinia.org/fr/blog/no-dates'), /<lastmod>/);
  // No dated posts at all → listings and homepage have no lastmod either.
  assert.doesNotMatch(urlEntry(xml, 'https://afrinia.org/fr/blog'), /<lastmod>/);
  assert.doesNotMatch(urlEntry(xml, 'https://afrinia.org/'), /<lastmod>/);
});

test('empty database still yields a valid sitemap with the static pages', () => {
  const xml = buildSitemapXml({ frPosts: [], enPosts: [] });
  assert.ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>'));
  assert.ok(xml.trimEnd().endsWith('</urlset>'));
  assert.equal((xml.match(/<url>/g) || []).length, 9);
});

test('hreflang alternates are kept on both blog listings', () => {
  const xml = buildSitemapXml({ frPosts, enPosts });
  for (const loc of ['https://afrinia.org/fr/blog', 'https://afrinia.org/en/blog']) {
    const entry = urlEntry(xml, loc);
    assert.match(entry, /hreflang="fr" href="https:\/\/afrinia.org\/fr\/blog"/);
    assert.match(entry, /hreflang="en" href="https:\/\/afrinia.org\/en\/blog"/);
    assert.match(entry, /hreflang="x-default" href="https:\/\/afrinia.org\/fr\/blog"/);
  }
});

test('slugs with special characters cannot break the XML', () => {
  const xml = buildSitemapXml({ frPosts: [{ slug: 'a&b', updated_at: '2026-01-01' }], enPosts: [] });
  assert.ok(xml.includes('<loc>https://afrinia.org/fr/blog/a&amp;b</loc>'));
});
