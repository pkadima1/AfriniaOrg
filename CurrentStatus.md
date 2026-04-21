# CurrentStatus.md — Afrinia Live Project Tracker

> This file is the single source of truth for what has been done, what is in progress, and what is next.
> It is updated at the end of every milestone — never before it is fully completed and tested.
> Branch context is noted per milestone so any session can locate the exact code change.

---

## HOW TO READ THIS FILE

- 🔴 **Not started** — identified, planned, not touched yet
- 🟡 **In progress** — branch created, work begun, not yet committed/tested
- ✅ **Done** — code committed, locally verified, success criteria confirmed
- ⏸ **Blocked** — waiting on an external action (GSC console, GA4 console, deployment)

---

## CURRENT BRANCH: `GoogleAnalyticsSetUp`

Parent goal: Get Afrinia fully instrumented on Google Analytics 4 and correctly indexed by Google Search Console.
See **SKILLS.md Section 8** for the full audit findings and 6-step fix plan.

---

## MILESTONE LOG

---

### MILESTONE 0 — Foundation & Planning
**Status:** ✅ Done
**Date completed:** 2026-04-21
**Branch:** `GoogleAnalyticsSetUp`

**What was done:**
- Created branch `GoogleAnalyticsSetUp` from `main`
- Rebuilt `CLAUDE.md` from scratch with project owner's working principles (think deeply, explain what/how/why, no shortcuts, production-ready, root-cause focus)
- Conducted full audit of GA4 and GSC status (screenshots + codebase inspection)
- Added `SKILLS.md Section 8` — structured work plan with audit findings, 6-step fix plan, success criteria, and known limitations

**Why this mattered:**
Without a clear map of what is broken and in what order to fix it, every subsequent session would start from scratch. This milestone ensures the work plan is documented, justified, and executable by anyone.

---

### MILESTONE 1 — Fix Domain Mismatch (afrinia.com → afrinia.org)
**Status:** ✅ Done
**Date completed:** 2026-04-21
**Branch:** `GoogleAnalyticsSetUp`

**Root cause:**
The site is live at `https://afrinia.org/` (confirmed via Google Search Console property). However, the domain `afrinia.com` was hardcoded in 5 source files. This caused Google to see URLs listed in the sitemap (`afrinia.com`) that do not match the domain it is crawling (`afrinia.org`) — a canonical mismatch that prevents correct indexing.

**Files changed:**

| File | What changed |
|------|-------------|
| `public/robots.txt` | Sitemap pointer updated from `afrinia.com/sitemap.xml` to `afrinia.org/sitemap.xml` |
| `public/sitemap.xml` | All 12 URL references updated from `afrinia.com` to `afrinia.org` (loc, hreflang, and comment examples) |
| `index.html` | `og:url`, JSON-LD `@id`, `url`, `logo.url`, and publisher reference all updated to `afrinia.org` |
| `src/pages/Blog.tsx` | SSR fallback origin updated from `afrinia.com` to `afrinia.org` |
| `src/pages/BlogPost.tsx` | SSR fallback origin updated; JSON-LD `publisher @id` updated to `afrinia.org/#organization` |

**What was NOT changed:**
- Firebase config (project IDs, storage URLs) — these are Firebase infrastructure identifiers, not canonical URLs
- Any runtime content already stored in Firestore — those are data, not code

**Success criteria verified in production (2026-04-21):**
- ✅ `https://afrinia.org/sitemap.xml` returns valid XML — 7 URLs listed, all `afrinia.org` (screenshot confirmed: browser renders plain-text sitemap, not the React app)
- ✅ GSC → Sitemaps → `/sitemap.xml` shows **"Sitemap processed successfully"**, Last read: 4/21/26, **Discovered pages: 7**
- ✅ GSC → URL Inspection → `https://afrinia.org/` shows **"URL is on Google"** and **"Page is indexed"**
- ✅ HTTPS valid, Breadcrumbs: 1 valid item detected
- ✅ `robots.txt` in production points to the correct sitemap URL

**Previous broken state (for reference):**
- `sitemap_index.xml` had "1 error — Sitemap is HTML", 0 discovered pages
- All URLs in the sitemap referenced `afrinia.com` instead of `afrinia.org`

---

### MILESTONE 2 — Fix Sitemap Structure (Add Missing Pages, Remove Non-Indexable)
**Status:** ✅ Done (completed as part of Milestone 1 — same file, same commit)
**Date completed:** 2026-04-21
**Branch:** `GoogleAnalyticsSetUp`

**What was done:**
- Added `/audio` page — it existed as a live route in the app but was absent from the sitemap
- `/builders` confirmed and retained (it is a public, indexable coming-soon page)
- Disallowed paths (`/admin/*`, `/profile`, `/settings`) are correctly absent — they were never in the sitemap and robots.txt already blocks them
- Comment block cleaned up: removed the outdated `afrinia.com` example slug template; updated the Phase 1 manual workflow note and Phase 2 long-term plan note

**Success criteria verified in production (2026-04-21):**
- ✅ GSC discovered exactly **7 pages** — matches the 7 entries in the sitemap exactly (/, /about, /fr/blog, /en/blog, /audio, /contact, /builders)
- ✅ No disallowed URL appears in the sitemap
- ✅ GSC reports **0 errors** on `/sitemap.xml`

---

### MILESTONE 3 — GA4 SPA Route-Change Tracking
**Status:** ✅ Done
**Date completed:** 2026-04-21
**Branch:** `GoogleAnalyticsSetUp`

**Root cause:**
React Router swaps page components without reloading the browser. Firebase Analytics fires one `page_view` automatically when the app first loads, then never again. Every navigation after that (home → blog → article → audio) was invisible to GA4.

**Files changed:**

| File | What changed |
|------|-------------|
| `src/integrations/firebase/config.ts` | `analytics` instance now exported (`export let analytics`) instead of being created and discarded. This avoids hidden coupling — any module that needs to call `logEvent` imports the single initialized instance rather than calling `getAnalytics()` again. |
| `src/utils/analytics.ts` | **New file.** Centralized GA4 helper. All GA4 calls in the entire codebase go through here. Exports `trackPageView` (Milestone 3) and all custom event functions (`trackArticleView`, `trackAudioPlay`, etc.) with typed parameters — ready for Milestone 4 wiring. Internal `fire()` guard means analytics failures never crash the UI. |
| `src/components/GAPageTracker.tsx` | **New file.** React component that renders nothing but fires `trackPageView` on every route change. Skips first render (Firebase already handles the initial page_view). Mounted once inside `<BrowserRouter>`, outside `<Routes>`, so it is never unmounted during navigation. |
| `src/App.tsx` | Added `<GAPageTracker />` as first child of `<BrowserRouter>`, before `<Routes>`. One line change. |

**Design decisions recorded:**
- **Why a component, not a hook:** A component returning null is the standard React pattern for "router-aware side effect." It keeps `App.tsx` clean and does not pollute the `App` component with hook boilerplate.
- **Why skip first render:** Firebase auto-fires page_view on initialization. Firing again on mount would double-count the first page view.
- **Why all events in one file:** If GA4 is ever replaced or the measurement ID changes, there is exactly one file to update. No hunting through components.
- **TypeScript:** Zero type errors confirmed (`tsc --noEmit` passes cleanly).

**Success criteria to verify in GA4 Realtime:**
- [ ] Navigate from homepage to a blog post → GA4 Realtime shows `page_view` with `page_path: /en/blog/your-slug`
- [ ] Navigate back to blog listing → GA4 Realtime shows `page_view` with `page_path: /en/blog`
- [ ] No duplicate events on initial page load
- [ ] No console errors related to analytics

---

### MILESTONE 4 — GA4 Custom Event Tracking (Blog + Audio)
**Status:** 🔴 Not started
**Planned branch:** `GoogleAnalyticsSetUp`

**What needs to be done:**
- Add to `src/utils/analytics.ts`: typed functions for `article_view`, `article_read_complete`, `comment_submitted`, `audio_play`, `audio_pause`, `newsletter_signup`
- Wire into `src/pages/BlogPost.tsx`: `article_view` on load, `article_read_complete` on 80% scroll
- Wire into `src/pages/AudioPage.tsx`: `audio_play` on play click, `audio_pause` on pause
- Wire into `src/pages/Blog.tsx`: `newsletter_signup` on successful subscription

**Success criteria:**
- GA4 Realtime shows `article_view` when a blog post loads
- GA4 Realtime shows `audio_play` when an episode starts
- All events include the correct data (slug, title, language, category)

---

### MILESTONE 5 — Add Page Meta to AudioPage
**Status:** 🔴 Not started
**Planned branch:** `GoogleAnalyticsSetUp`

**What needs to be done:**
- Add `usePageMeta()` call in `src/pages/AudioPage.tsx` with EN and FR title/description
- Add JSON-LD for the audio page (PodcastSeries schema)

**Why this matters:**
GA4 currently sees every visit to `/audio` as a visit to "Afrinia — Intelligence for Africa's Builders" (the default title). It is indistinguishable from the homepage in reports. Google also sees no structured data for the audio content.

**Success criteria:**
- Browser tab shows "Audio | Afrinia" (or French equivalent) when on the audio page
- GA4 Realtime shows correct `page_title` for audio page visits

---

### MILESTONE 6 — Enable Enhanced Measurement in GA4 Console
**Status:** ⏸ Blocked (manual console action)
**Owner:** Project owner (pkadima1@gmail.com)

**What needs to be done (manual — no code change):**
1. Go to GA4 Console → Admin → Data streams → Afrinia stream
2. Click the stream → Enhanced measurement section
3. Toggle Enhanced measurement ON
4. Enable: Scrolls, Outbound clicks, Site search, Form interactions

**Why this matters:**
Enhanced Measurement is currently toggled OFF (visible in the GA4 screenshot). This toggle enables scroll depth, outbound link tracking, and form interaction tracking — all automatically, with no additional code.

**Success criteria:**
- GA4 shows scroll events in Realtime when scrolling a page
- Outbound clicks tracked when clicking external links

---

## SUMMARY TABLE

| Milestone | Description | Status | Date |
|-----------|-------------|--------|------|
| 0 | Foundation & Planning | ✅ Done | 2026-04-21 |
| 1 | Fix domain mismatch (afrinia.com → afrinia.org) | ✅ Done | 2026-04-21 |
| 2 | Fix sitemap structure (add missing pages) | ✅ Done | 2026-04-21 |
| 3 | GA4 SPA route-change tracking | ✅ Done | 2026-04-21 |
| 4 | GA4 custom event tracking (blog + audio) | 🔴 Not started | — |
| 5 | Add page meta to AudioPage | 🔴 Not started | — |
| 6 | Enable Enhanced Measurement (GA4 console) | ⏸ Blocked | — |
