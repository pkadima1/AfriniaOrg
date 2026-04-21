/**
 * analytics.ts — centralized GA4 event helpers
 *
 * WHY this file exists: every GA4 call in the codebase must go through here.
 * This gives us one place to update if the measurement ID changes, one place
 * to add error handling, and one place to disable analytics in tests — without
 * hunting down raw `logEvent` calls scattered across components.
 *
 * RULE: nothing outside this file calls `logEvent` or `gtag` directly.
 */

import { logEvent } from 'firebase/analytics';
import { analytics } from '@/integrations/firebase/config';

// ── Internal guard ────────────────────────────────────────────────────────────
// Analytics may be null if Firebase failed to initialize (ad-blocker, test env).
// Every exported function checks this before acting. Analytics must NEVER
// crash the UI — all calls are wrapped in try/catch.

function fire(eventName: string, params?: Record<string, string | number | boolean>): void {
  if (!analytics) return;
  try {
    logEvent(analytics, eventName, params);
  } catch {
    // Fail silently — an analytics failure must never surface to the user.
  }
}

// ── Page views ────────────────────────────────────────────────────────────────

/**
 * Fire a page_view event for SPA route changes.
 *
 * Called by GAPageTracker on every React Router navigation AFTER the initial
 * load. Firebase Analytics already fires one page_view automatically when the
 * app initialises — this covers every subsequent route change.
 *
 * @param pagePath   The new URL pathname, e.g. "/en/blog/my-article"
 * @param pageTitle  document.title at the moment of navigation
 */
export function trackPageView(pagePath: string, pageTitle: string): void {
  fire('page_view', {
    page_path: pagePath,
    page_title: pageTitle,
    page_location: window.location.href,
  });
}

// ── Custom events (Milestone 4 — wired up in BlogPost, AudioPage, Blog) ──────
// Defined here now so the shape is locked. Components will call these once
// Milestone 4 work begins — no raw logEvent calls will ever appear there.

export function trackArticleView(params: {
  article_slug: string;
  article_title: string;
  article_lang: string;
  article_category: string;
}): void {
  fire('article_view', params);
}

export function trackArticleReadComplete(params: {
  article_slug: string;
  article_title: string;
}): void {
  fire('article_read_complete', params);
}

export function trackCommentSubmitted(params: {
  article_slug: string;
  article_lang: string;
}): void {
  fire('comment_submitted', params);
}

export function trackAudioPlay(params: {
  episode_id: string;
  episode_title: string;
  episode_number: number;
}): void {
  fire('audio_play', params);
}

export function trackAudioPause(params: {
  episode_id: string;
  listen_duration_seconds: number;
}): void {
  fire('audio_pause', params);
}

export function trackNewsletterSignup(params: {
  source_page: string;
  lang: string;
}): void {
  fire('newsletter_signup', params);
}
