/**
 * Shared helpers for browser tests: pick the UI language before the app
 * loads, and collect console errors that would signal a regression.
 */
import type { Page } from '@playwright/test';

/** Language for pages without a prefix (/, /about…) — prefixed pages ignore it. */
export async function useLanguage(page: Page, lang: 'fr' | 'en') {
  await page.addInitScript(l => localStorage.setItem('i18nextLng', l), lang);
}

/** Console errors and uncaught exceptions, minus expected noise (404 status lines). */
export function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(`pageerror: ${e.message}`));
  page.on('console', m => {
    const text = m.text();
    if (m.type() === 'error' && !/status of 404|User attempted to access non-existent route/.test(text)) errors.push(text);
  });
  return errors;
}

export const ARTICLE_FR = '/fr/blog/le-coton-africain-un-signal-stratgique-pour-btir-une-souverainet-industrielle-par-la-valeur-ajoute';
export const BUILDER_EN = '/en/builders/aliko-mohammad-dangote';
