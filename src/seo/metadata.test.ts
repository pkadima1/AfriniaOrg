/**
 * Metadata helper tests: the canonical, og:url and hreflang a page declares
 * are what Google uses to decide which URL to index.
 */
import { describe, expect, test } from 'vitest';
import { buildMetadata } from './metadata';
import { listingAlternates, routes } from '@/routing/routes';

const article = buildMetadata({
  lang: 'fr',
  path: routes.article('fr', 'le-coton'),
  title: '  Le Coton Africain | Afrinia ',
  description: 'Un signal stratégique.',
  image: 'https://firebasestorage.googleapis.com/v0/b/x/o/cover.png',
  type: 'article',
  publishedTime: '2026-05-07T18:50:26.397Z',
  modifiedTime: '2026-05-08T10:00:00.000Z',
});

describe('buildMetadata', () => {
  test('canonical and og:url are the same absolute production URL', () => {
    expect(article.alternates?.canonical).toBe('https://afrinia.org/fr/blog/le-coton');
    expect(article.openGraph?.url).toBe('https://afrinia.org/fr/blog/le-coton');
  });

  test('title and description are trimmed and repeated for social previews', () => {
    expect(article.title).toBe('Le Coton Africain | Afrinia');
    expect(article.openGraph?.title).toBe('Le Coton Africain | Afrinia');
    expect(article.twitter?.description).toBe('Un signal stratégique.');
  });

  test('Open Graph locale follows the page language, with the other as alternate', () => {
    expect(article.openGraph).toMatchObject({ locale: 'fr_FR', alternateLocale: ['en_US'], type: 'article' });
    const en = buildMetadata({ lang: 'en', path: routes.blog('en'), title: 'Ideas', description: 'd' });
    expect(en.openGraph).toMatchObject({ locale: 'en_US', alternateLocale: ['fr_FR'], type: 'website' });
  });

  test('articles carry their dates; other pages do not', () => {
    expect(article.openGraph).toMatchObject({ publishedTime: '2026-05-07T18:50:26.397Z', modifiedTime: '2026-05-08T10:00:00.000Z' });
    const page = buildMetadata({ lang: 'fr', path: '/about', title: 't', description: 'd', publishedTime: '2026-01-01' });
    expect(page.openGraph).not.toHaveProperty('publishedTime');
  });

  test('hreflang alternates become absolute URLs including x-default', () => {
    const list = buildMetadata({ lang: 'en', path: routes.blog('en'), title: 't', description: 'd', alternates: listingAlternates('blog') });
    expect(list.alternates?.languages).toEqual({
      fr: 'https://afrinia.org/fr/blog',
      en: 'https://afrinia.org/en/blog',
      'x-default': 'https://afrinia.org/fr/blog',
    });
  });

  test('pages without alternates declare none (articles until translation_slug exists)', () => {
    expect(article.alternates).not.toHaveProperty('languages');
  });

  test('share image: absolute kept, site path made absolute, absent → no image and a small card', () => {
    expect(article.openGraph?.images).toEqual(['https://firebasestorage.googleapis.com/v0/b/x/o/cover.png']);
    expect(article.twitter).toMatchObject({ card: 'summary_large_image' });
    const local = buildMetadata({ lang: 'fr', path: '/', title: 't', description: 'd', image: '/logo.png' });
    expect(local.openGraph?.images).toEqual(['https://afrinia.org/logo.png']);
    const none = buildMetadata({ lang: 'fr', path: '/', title: 't', description: 'd' });
    expect(none.openGraph).not.toHaveProperty('images');
    expect(none.twitter).toMatchObject({ card: 'summary' });
  });

  test('noindex pages are excluded from search but links are still followed', () => {
    expect(buildMetadata({ lang: 'fr', path: '/unsubscribed', title: 't', description: 'd', noindex: true }).robots)
      .toEqual({ index: false, follow: true });
    expect(article).not.toHaveProperty('robots');
  });
});
