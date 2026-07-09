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
 */

import DOMPurify from 'dompurify';

/** Style properties authors must never control — the design system owns them. */
const FORBIDDEN_STYLE_PROPS = ['background-color', 'background', 'color', 'font-family', 'font-size'];

/**
 * Sanitize (XSS) and normalize article HTML for the Afrinia design system.
 * Idempotent — cleaning already-clean content changes nothing.
 */
export function cleanArticleHtml(html: string): string {
  if (!html) return html;

  // 1 — Security: strip scripts, event handlers, javascript: URLs, etc.
  const safe = DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });

  const doc = new DOMParser().parseFromString(safe, 'text/html');

  // 2 — Strip design-breaking inline styles; drop the attribute when emptied.
  for (const el of Array.from(doc.body.querySelectorAll<HTMLElement>('[style]'))) {
    for (const prop of FORBIDDEN_STYLE_PROPS) el.style.removeProperty(prop);
    if (!el.getAttribute('style')?.trim()) el.removeAttribute('style');
  }

  // 3 — Non-breaking spaces between words (paste artifact) → normal
  //     spaces, so text can wrap and space naturally.
  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
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
}
