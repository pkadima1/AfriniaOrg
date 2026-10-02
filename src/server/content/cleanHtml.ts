/**
 * cleanHtml.ts — the article HTML cleaner for server rendering.
 * WHY: article HTML must be sanitized (XSS) and normalized before it is sent
 * in the page. This runs the SAME cleaner as the browser
 * (src/utils/contentSanitizer.ts) against a jsdom window — never a second
 * implementation. Server-only: jsdom must not reach the visitor's bundle.
 */
import 'server-only';
import { JSDOM } from 'jsdom';
import { createArticleCleaner } from '@/utils/contentSanitizer';

const { window } = new JSDOM('');

export const cleanArticleHtmlOnServer = createArticleCleaner(window as unknown as Window & typeof globalThis);
