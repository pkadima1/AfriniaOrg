import { useEffect } from 'react';

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

/** /en/blog or /fr/blog */
export function getBlogUrl(lang: Lang): string {
  return `/${lang}/blog`;
}

/** /en/blog/my-post or /fr/blog/mon-article */
export function getPostUrl(lang: Lang, slug: string): string {
  return `/${lang}/blog/${slug}`;
}

/**
 * Swap the lang prefix in a pathname for supported bilingual routes.
 *
 * Blog rules:
 *   - Blog listing (/lang/blog)       → /{targetLang}/blog
 *   - Blog post   (/lang/blog/slug)   → /{targetLang}/blog  (listing)
 *     Redirecting to the same slug in another language is unsafe because the
 *     slug may not exist.  Always land on the blog listing.
 *
 * Non-blog pages have no lang prefix, so they are returned unchanged.
 */
export function getAlternateUrl(currentPath: string, targetLang: Lang): string {
  const blogPathRe = /^\/(?:en|fr)?\/blog(?:\/.*)?$/;

  if (blogPathRe.test(currentPath)) {
    // Always redirect to the target-language blog listing
    return `/${targetLang}/blog`;
  }

  // Non-blog pages stay on the same route (no lang prefix routing for them)
  return currentPath;
}

/**
 * Injects hreflang + canonical link tags into document.head.
 * Self-cleans on unmount or when URLs change.
 */
export function useSeoHead(enUrl: string, frUrl: string, canonicalUrl: string) {
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
    add({ rel: 'canonical', href: canonicalUrl });

    return () => { added.forEach(el => el.remove()); };
  }, [enUrl, frUrl, canonicalUrl]);
}
