import { useEffect } from 'react';

// Default fallback values that match index.html
const DEFAULT_TITLE = 'Afrinia — Intelligence for Africa\'s Builders';
const DEFAULT_DESCRIPTION =
  'Ideas, analysis and tools for entrepreneurs and innovators across Africa. Bilingual intelligence feed in English and French.';

function setMetaContent(selector: string, content: string): void {
  const el = document.querySelector(selector) as HTMLMetaElement | null;
  if (el) el.content = content;
}

function getMetaContent(selector: string): string {
  return (document.querySelector(selector) as HTMLMetaElement | null)?.content ?? '';
}

export interface PageMetaOptions {
  title: string;
  description: string;
  /** Override the og:image (e.g. featured image for a blog post) */
  ogImage?: string;
  /**
   * Canonical URL for this page (full https://afrinia.org/... URL).
   * Sets both og:url and <link rel="canonical"> — both signals matter to Google.
   */
  ogUrl?: string;
  /**
   * One or more schema.org JSON-LD objects to inject as
   * <script type="application/ld+json"> tags while the page is mounted.
   */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

/**
 * Dynamically updates <title> and social/Open-Graph meta tags while a page
 * is mounted, then restores the site-level defaults on unmount.
 *
 * Also injects JSON-LD <script> tags into <head> and cleans them up on unmount.
 */
export function usePageMeta({
  title,
  description,
  ogImage,
  ogUrl,
  jsonLd,
}: PageMetaOptions): void {
  // Stable key so the effect only re-runs when the actual data changes.
  const jsonLdKey = jsonLd ? JSON.stringify(jsonLd) : '';

  useEffect(() => {
    // ── snapshot current values so we can restore on unmount ──────────────
    const prevTitle = document.title;
    const prevDesc = getMetaContent('meta[name="description"]');
    const prevOgTitle = getMetaContent('meta[property="og:title"]');
    const prevOgDesc = getMetaContent('meta[property="og:description"]');

    // ── apply new values ──────────────────────────────────────────────────
    document.title = title;
    setMetaContent('meta[name="description"]', description);
    setMetaContent('meta[property="og:title"]', title);
    setMetaContent('meta[property="og:description"]', description);
    setMetaContent('meta[name="twitter:title"]', title);
    setMetaContent('meta[name="twitter:description"]', description);

    if (ogUrl) {
      // og:url may not exist in index.html; create it if absent
      let urlEl = document.querySelector('meta[property="og:url"]') as HTMLMetaElement | null;
      if (!urlEl) {
        urlEl = document.createElement('meta');
        urlEl.setAttribute('property', 'og:url');
        document.head.appendChild(urlEl);
      }
      urlEl.content = ogUrl;

      // <link rel="canonical"> — the definitive signal Google uses to resolve
      // duplicate/variant URLs. Must match the og:url exactly.
      let canonicalEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!canonicalEl) {
        canonicalEl = document.createElement('link');
        canonicalEl.rel = 'canonical';
        document.head.appendChild(canonicalEl);
      }
      canonicalEl.href = ogUrl;
    }

    if (ogImage) {
      setMetaContent('meta[property="og:image"]', ogImage);
      setMetaContent('meta[name="twitter:image"]', ogImage);
    }

    // ── inject JSON-LD ────────────────────────────────────────────────────
    const injectedScripts: HTMLScriptElement[] = [];
    if (jsonLd) {
      const schemas = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      schemas.forEach(schema => {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-page-meta', 'true');
        script.textContent = JSON.stringify(schema);
        document.head.appendChild(script);
        injectedScripts.push(script);
      });
    }

    // ── cleanup: restore defaults & remove injected scripts ──────────────
    return () => {
      document.title = prevTitle || DEFAULT_TITLE;
      setMetaContent('meta[name="description"]', prevDesc || DEFAULT_DESCRIPTION);
      setMetaContent('meta[property="og:title"]', prevOgTitle || DEFAULT_TITLE);
      setMetaContent('meta[property="og:description"]', prevOgDesc || DEFAULT_DESCRIPTION);
      // Remove canonical on unmount — the next page will set its own if needed.
      document.querySelector('link[rel="canonical"]')?.remove();
      injectedScripts.forEach(s => s.remove());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, ogImage, ogUrl, jsonLdKey]);
}
