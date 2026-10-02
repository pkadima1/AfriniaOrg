/**
 * metadata.ts — builds a page's Next.js `Metadata` (title, description,
 * canonical, hreflang alternates, Open Graph, Twitter) in one call.
 *
 * WHY one helper (CLAUDE.md §9 rule 2): the canonical, og:url and hreflang
 * must always agree and always be absolute https://afrinia.org URLs. Built
 * separately per page, they drift — the original site declared every page to
 * be the homepage. Every server-rendered page (M2+) exports
 * `generateMetadata` that returns `buildMetadata(...)`.
 */
import type { Metadata } from 'next';
import { absoluteUrl } from '@/constants/site';
import type { Lang } from '@/utils/languageUtils';

export interface PageMetaInput {
  lang: Lang;
  /** Path from the route map, e.g. routes.article('fr', slug). */
  path: string;
  title: string;
  description: string;
  /** Absolute URL or site path of the share image; omitted when absent. */
  image?: string;
  type?: 'website' | 'article';
  /** Language versions of THIS page (paths), e.g. listingAlternates('blog'). */
  alternates?: Partial<Record<Lang | 'x-default', string>>;
  /** Pages that must not appear in search (admin, profile, unsubscribe). */
  noindex?: boolean;
  /** ISO dates, articles only. */
  publishedTime?: string;
  modifiedTime?: string;
}

const OG_LOCALE: Record<Lang, string> = { fr: 'fr_FR', en: 'en_US' };

const toAbsolute = (pathOrUrl: string) => (/^https?:\/\//.test(pathOrUrl) ? pathOrUrl : absoluteUrl(pathOrUrl));

export function buildMetadata(input: PageMetaInput): Metadata {
  const url = absoluteUrl(input.path);
  const title = input.title.trim();
  const description = input.description.trim();
  const images = input.image ? [toAbsolute(input.image)] : undefined;
  const otherLang: Lang = input.lang === 'fr' ? 'en' : 'fr';

  const languages = input.alternates
    ? Object.fromEntries(Object.entries(input.alternates).map(([hreflang, path]) => [hreflang, absoluteUrl(path)]))
    : undefined;

  return {
    title,
    description,
    alternates: { canonical: url, ...(languages ? { languages } : {}) },
    openGraph: {
      url,
      title,
      description,
      siteName: 'Afrinia',
      type: input.type ?? 'website',
      locale: OG_LOCALE[input.lang],
      alternateLocale: [OG_LOCALE[otherLang]],
      ...(images ? { images } : {}),
      ...(input.type === 'article' && input.publishedTime ? { publishedTime: input.publishedTime } : {}),
      ...(input.type === 'article' && input.modifiedTime ? { modifiedTime: input.modifiedTime } : {}),
    },
    twitter: {
      card: images ? 'summary_large_image' : 'summary',
      title,
      description,
      ...(images ? { images } : {}),
    },
    ...(input.noindex ? { robots: { index: false, follow: true } } : {}),
  };
}
