/**
 * Route map tests. These URLs are what Google has indexed and what canonical
 * tags declare — a change here changes the public site, so every route is
 * pinned explicitly.
 */
import { describe, expect, test } from 'vitest';
import { listingAlternates, routes } from './routes';
import { isKnownSpaPath } from './spaRoutes';

describe('routes (today\'s public URLs)', () => {
  test('language-prefixed sections', () => {
    expect(routes.blog('fr')).toBe('/fr/blog');
    expect(routes.blog('en')).toBe('/en/blog');
    expect(routes.article('fr', 'le-coton')).toBe('/fr/blog/le-coton');
    expect(routes.builders('en')).toBe('/en/builders');
    expect(routes.builder('en', 'aliko-mohammad-dangote')).toBe('/en/builders/aliko-mohammad-dangote');
  });

  test('pages without a language prefix until M2 (D3)', () => {
    for (const lang of ['fr', 'en'] as const) {
      expect(routes.home(lang)).toBe('/');
      expect(routes.about(lang)).toBe('/about');
      expect(routes.audio(lang)).toBe('/audio');
      expect(routes.contact(lang)).toBe('/contact');
      expect(routes.privacy(lang)).toBe('/privacy');
      expect(routes.terms(lang)).toBe('/terms');
    }
    expect(routes.home()).toBe('/');
  });

  test('every URL the route map produces is a page the server answers with 200', () => {
    const urls = (['fr', 'en'] as const).flatMap(lang => [
      routes.home(lang), routes.blog(lang), routes.article(lang, 'some-slug'), routes.builders(lang),
      routes.builder(lang, 'some-profile'), routes.about(lang), routes.audio(lang), routes.contact(lang),
      routes.privacy(lang), routes.terms(lang),
    ]);
    for (const url of urls) expect(isKnownSpaPath(url), url).toBe(true);
  });
});

describe('listingAlternates (hreflang)', () => {
  test('blog and builders listings pair EN/FR with French as x-default', () => {
    expect(listingAlternates('blog')).toEqual({ fr: '/fr/blog', en: '/en/blog', 'x-default': '/fr/blog' });
    expect(listingAlternates('builders')).toEqual({ fr: '/fr/builders', en: '/en/builders', 'x-default': '/fr/builders' });
  });
});
