/**
 * routes.ts — the route map: the ONLY place public page URLs are built
 * (CLAUDE.md §9 rule 4). Links, metadata, canonicals, sitemaps and
 * revalidation all call these functions instead of assembling strings.
 *
 * Every function takes the language, even where today's URL has no prefix
 * (`about('fr')` → `/about`): decision D3 moves those pages under /fr and /en
 * in M2, and then only this file changes. Absolute URLs: absoluteUrl() in
 * src/constants/site.ts.
 */
import type { Lang } from '@/utils/languageUtils';

export const routes = {
  /** Homepage. D3 (M2): `/${lang}`; `/` will permanently redirect to `/fr`. */
  home: (_lang?: Lang) => '/',
  blog: (lang: Lang) => `/${lang}/blog`,
  article: (lang: Lang, slug: string) => `/${lang}/blog/${slug}`,
  builders: (lang: Lang) => `/${lang}/builders`,
  /** A profile exists only in the languages it was written in. */
  builder: (lang: Lang, slug: string) => `/${lang}/builders/${slug}`,
  // Language-less today; under /fr|/en from M2 (D3).
  about: (_lang: Lang) => '/about',
  audio: (_lang: Lang) => '/audio',
  contact: (_lang: Lang) => '/contact',
  privacy: (_lang: Lang) => '/privacy',
  terms: (_lang: Lang) => '/terms',
} as const;

export type RouteName = keyof typeof routes;

/**
 * hreflang pairs for pages that truly exist in both languages at
 * predictable URLs (listings). Articles and builder profiles are separate
 * documents per language — they get no pair until posts store their
 * translation's slug (M2, `translation_slug`).
 */
export function listingAlternates(route: 'blog' | 'builders'): Record<Lang | 'x-default', string> {
  return {
    fr: routes[route]('fr'),
    en: routes[route]('en'),
    // French is the site default (D3).
    'x-default': routes[route]('fr'),
  };
}
