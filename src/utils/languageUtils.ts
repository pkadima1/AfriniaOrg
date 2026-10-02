import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { routes } from '@/routing/routes';

export type Lang = 'en' | 'fr';
export const SUPPORTED_LANGS: readonly Lang[] = ['en', 'fr'] as const;

/**
 * Detect active language using priority order:
 *   1. URL prefix  (/fr/... or /en/...)
 *   2. Browser navigator.language
 *   3. Default → 'en'
 */
export function detectLanguage(): Lang {
  if (typeof window === 'undefined') return 'en';
  const path = window.location.pathname;
  if (path.startsWith('/fr/') || path === '/fr') return 'fr';
  if (path.startsWith('/en/') || path === '/en') return 'en';
  const browserLang = navigator.language?.toLowerCase().split('-')[0];
  if (browserLang === 'fr') return 'fr';
  if (browserLang === 'en') return 'en';
  return 'fr'; // French is the platform default
}

/** Returns true if the string is a supported Lang */
export function isSupportedLang(lang: string | undefined): lang is Lang {
  return lang === 'en' || lang === 'fr';
}

// Long-standing names for the route map's section URLs (src/routing/routes.ts
// builds them; these only keep existing call sites readable).
export const getBlogUrl = routes.blog;
export const getPostUrl = routes.article;
export const getBuildersUrl = routes.builders;
export const getBuilderUrl = routes.builder;

/**
 * Language of the interface on pages WITHOUT a language prefix (/about,
 * /audio…): the visitor's chosen language. Prefixed pages use useUrlLang().
 */
export function useUiLang(): Lang {
  const { i18n } = useTranslation();
  return i18n.language === 'fr' ? 'fr' : 'en';
}

/**
 * Language of a language-prefixed page (/fr/..., /en/...), taken from the URL —
 * never from the browser — and mirrored into i18next so the UI text matches.
 * WHY: the same URL must always show the same language to every visitor and to
 * Google. Used by every page that lives under a /fr or /en prefix.
 */
export function useUrlLang(): Lang {
  const { pathname } = useLocation();
  const { i18n } = useTranslation();
  const lang: Lang = pathname === '/fr' || pathname.startsWith('/fr/') ? 'fr' : 'en';
  useEffect(() => {
    if (i18n.language !== lang) void i18n.changeLanguage(lang);
  }, [lang, i18n]);
  return lang;
}

/**
 * Swap the lang prefix in a pathname for supported bilingual routes.
 *
 * Blog rules (builders follow the same rules):
 *   - Blog listing (/lang/blog)       → /{targetLang}/blog
 *   - Blog post   (/lang/blog/slug)   → /{targetLang}/blog  (listing)
 *     Redirecting to the same slug in another language is unsafe because the
 *     slug may not exist.  Always land on the blog listing.
 *
 * Non-blog pages have no lang prefix, so they are returned unchanged.
 */
export function getAlternateUrl(currentPath: string, targetLang: Lang): string {
  const blogPathRe = /^\/(?:en|fr)?\/blog(?:\/.*)?$/;
  const buildersPathRe = /^\/(?:en|fr)\/builders(?:\/.*)?$/;

  if (blogPathRe.test(currentPath)) {
    // Always redirect to the target-language blog listing
    return `/${targetLang}/blog`;
  }

  // Builder profiles are separate documents per language (the slug may differ
  // or not exist), so the switch lands on the directory, like blog posts.
  if (buildersPathRe.test(currentPath)) {
    return getBuildersUrl(targetLang);
  }

  // Non-blog pages stay on the same route (no lang prefix routing for them)
  return currentPath;
}

/**
 * Injects hreflang alternate links into document.head; self-cleans on unmount.
 * Only for pages that truly exist in both languages at the given URLs (e.g. the
 * blog listings). Articles must NOT use it until posts store their translation's
 * slug: FR and EN articles have different slugs, and pointing hreflang at the
 * same slug in the other language sent Google to "Post not found" pages.
 * The canonical link is owned by usePageMeta (ogUrl), not by this hook.
 */
export function useHreflangLinks(enUrl: string, frUrl: string) {
  useEffect(() => {
    const added: HTMLLinkElement[] = [];

    const add = (attrs: Record<string, string>) => {
      const el = document.createElement('link');
      for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
      document.head.appendChild(el);
      added.push(el);
    };

    add({ rel: 'alternate', hreflang: 'en', href: enUrl });
    add({ rel: 'alternate', hreflang: 'fr', href: frUrl });
    add({ rel: 'alternate', hreflang: 'x-default', href: frUrl }); // French is the platform default

    return () => { added.forEach(el => el.remove()); };
  }, [enUrl, frUrl]);
}
