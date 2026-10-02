/**
 * contentSanitizer.ts — makes article HTML safe and brand-clean.
 *
 * WHY this exists: post content is authored in the Quill editor, often by
 * pasting from external tools (docs, AI writers). Pasted HTML carries hostile
 * artifacts — inline background/text colors that render as white bars on the
 * dark theme, and non-breaking spaces between every word that break text flow.
 * It is also rendered with dangerouslySetInnerHTML, which must never receive
 * unsanitized HTML (XSS).
 *
 * Used in two places so content is clean end-to-end:
 *   - blogService: every fetched post is cleaned before display or editing
 *   - BlogPostEditor: content is cleaned again on save, so documents in
 *     Firestore converge to clean HTML as posts are re-saved
 * And on the server (M2+): src/server/content/cleanHtml.ts runs the SAME
 * cleaner against a jsdom window — one implementation, two environments.
 */

import createDOMPurify from 'dompurify';

/**
 * Tags DOMPurify's HTML profile keeps but an article must never contain:
 * <style> restyles or hides the whole page (not just the article); forms and
 * their controls could post a reader's input to another site (phishing).
 * No published article used any of them (checked 2026-10-02, 29 posts).
 */
const FORBIDDEN_TAGS = ['style', 'form', 'input', 'button', 'textarea', 'select', 'option'];
const FORBIDDEN_ATTRS = ['formaction'];

/** Style properties authors must never control — the design system owns them. */
const FORBIDDEN_STYLE_PROPS = ['background-color', 'background', 'color', 'font-family', 'font-size'];

/**
 * Builds the cleaner for a given window (the browser's, or jsdom's on the
 * server). WHY a factory: the logic needs DOM APIs (DOMPurify, DOMParser,
 * TreeWalker) that only exist in a window, and must be identical everywhere.
 */
export function createArticleCleaner(win: Window & typeof globalThis): (html: string) => string {
  const purify = createDOMPurify(win);

  /**
   * Sanitize (XSS) and normalize article HTML for the Afrinia design system.
   * Idempotent — cleaning already-clean content changes nothing.
   */
  return function clean(html: string): string {
    if (!html) return html;

    // 1 — Security: strip scripts, event handlers, javascript: URLs, etc.
    const safe = purify.sanitize(html, {
      USE_PROFILES: { html: true },
      FORBID_TAGS: FORBIDDEN_TAGS,
      FORBID_ATTR: FORBIDDEN_ATTRS,
    });

    const doc = new win.DOMParser().parseFromString(safe, 'text/html');

    // 2 — Strip design-breaking inline styles; drop the attribute when emptied.
    for (const el of Array.from(doc.body.querySelectorAll<HTMLElement>('[style]'))) {
      for (const prop of FORBIDDEN_STYLE_PROPS) el.style.removeProperty(prop);
      if (!el.getAttribute('style')?.trim()) el.removeAttribute('style');
    }

    // 3 — Non-breaking spaces between words (paste artifact) → normal
    //     spaces, so text can wrap and space naturally.
    const walker = doc.createTreeWalker(doc.body, win.NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (node.nodeValue && node.nodeValue.includes('\u00A0')) {
        node.nodeValue = node.nodeValue.replace(/\u00A0/g, ' ');
      }
    }

    // 4 — Empty headings (pasted structural leftovers) render as blank gaps.
    for (const h of Array.from(doc.body.querySelectorAll('h1, h2, h3, h4, h5, h6'))) {
      if (!h.textContent?.trim() && !h.querySelector('img')) h.remove();
    }

    return doc.body.innerHTML;
  };
}

let browserCleaner: ((html: string) => string) | null = null;

/** Browser cleaner (the app's components and services). */
export function cleanArticleHtml(html: string): string {
  browserCleaner ??= createArticleCleaner(window);
  return browserCleaner(html);
}
