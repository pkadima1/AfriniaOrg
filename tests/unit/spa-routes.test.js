/**
 * Unit tests for src/routing/spaRoutes.ts — the server-side decision between
 * HTTP 200 (a page of the app) and a real HTTP 404, made before any HTML is
 * sent. A mistake here either 404s a real page (lost from Google) or brings
 * back soft 404s. Node runs the TypeScript module directly (type stripping).
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isKnownSpaPath, pathFromSlug } from '../../src/routing/spaRoutes.ts';

test('every fixed page of the site is known', () => {
  for (const path of ['/', '/about', '/contact', '/audio', '/en/blog', '/fr/blog', '/en/builders', '/fr/builders',
    '/privacy', '/terms', '/unsubscribed', '/profile', '/settings', '/admin']) {
    assert.equal(isKnownSpaPath(path), true, path);
  }
});

test('real article and builder URLs (published on 2026-10-02) are known', () => {
  for (const path of [
    '/fr/blog/le-coton-africain-un-signal-stratgique-pour-btir-une-souverainet-industrielle-par-la-valeur-ajoute',
    '/en/blog/ais-agoa-advantage-digital-exports-redefined',
    '/en/builders/aliko-mohammad-dangote',
    '/blog/le-coton-africain-un-signal-stratgique-pour-btir-une-souverainet-industrielle-par-la-valeur-ajoute',
  ]) {
    assert.equal(isKnownSpaPath(path), true, path);
  }
});

test('admin sub-pages at any depth are known', () => {
  for (const path of ['/admin/blog', '/admin/builders/edit/abc123', '/admin/social']) {
    assert.equal(isKnownSpaPath(path), true, path);
  }
});

test('unknown, retired and malformed URLs are NOT known (→ real 404)', () => {
  for (const path of [
    '/this-page-does-not-exist', '/fr/this-page-does-not-exist', '/services', '/pricing', '/outreachos',
    '/builders/aliko-mohammad-dangote', // never public without a language prefix
    '/fr/blog/a/b', '/fr/blog/', '/en/builders/', '/admin/', '/assets/missing-file.js', '/sitemap.xml',
  ]) {
    assert.equal(isKnownSpaPath(path), false, path);
  }
});

test('mixed-case URLs are not canonical (the app moves visitors to lowercase)', () => {
  assert.equal(isKnownSpaPath('/About'), false);
  assert.equal(isKnownSpaPath('/FR/blog'), false);
});

test('catch-all params map to the pathname', () => {
  assert.equal(pathFromSlug(undefined), '/');
  assert.equal(pathFromSlug([]), '/');
  assert.equal(pathFromSlug(['fr', 'blog', 'mon-article']), '/fr/blog/mon-article');
});
