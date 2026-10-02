# CurrentStatus.md — Afrinia Live Project Tracker

> **The single source of truth for where the project stands.** Read the top section first — it always answers: what is live, what is in progress, what is next, and what is waiting on the owner.
> Updated at the end of **every step** (not only milestones), in the same branch as the work. Plan and rules live in `CLAUDE.md` (Section 10 = migration plan); this file records progress against that plan.

**Legend:** ✅ done & verified · 🟡 in progress · 🔴 not started · ⏸ waiting on the owner or an external action

---

## 1. NOW — at a glance  *(last updated: 2026-10-02)*

| | |
|---|---|
| **Live on afrinia.org** | `main` @ `3aebad8` — Vite app on **React 19**, with M0 SEO fixes, builder profiles, Storage owner folders, translated sign-in |
| **Production health** | `npm run check:site -- --base https://afrinia.org` → **140/140** (2026-10-02). Sitemap: 40 URLs. Live Firestore/Storage rules == repo |
| **Current phase** | Phase 1 — Authority Engine · Next.js migration **M1 — Foundation** (CLAUDE.md §10) |
| **In progress** | ⏸ M1 step 2 — Next.js serves the existing site unchanged: **built and verified on a draft deploy (146/146)**, awaiting the owner's OK to commit to `migration/m1-nextjs-shell` → `migration/nextjs` (not production) |
| **Next** | M1 step 3 — route map, metadata helper, server data readers, Vitest + Playwright, `seo:check` |
| **Search Console baseline** | 11 indexed / 52 not indexed (GSC data of 2026-09-21). "Validate fix" started by the owner on Soft 404 + Duplicate canonical (2026-10-02) |

### Waiting on the owner ⏸
0. **Approve committing M1 step 2** (Next.js shell) to the migration branch — evidence in section 3.
1. **Admin → Social Links → Save** once (first save that actually persists — before 2026-10-02 every save was rejected).
2. **Upload one image in the admin** (article cover or builder photo) — confirms the Storage owner-folder rules from the user's side.
3. **Send one test message** via https://afrinia.org/contact — confirm the email arrives and the message appears in the admin inbox.
4. **Search Console**: check the validation progress weekly; record indexed / not-indexed counts in section 3.

### Known open issues (scheduled)
| Issue | Why it is not fixed yet | Fixed in |
|---|---|---|
| Page text arrives only via JavaScript (empty raw HTML) | Needs server rendering | M2 |
| Unknown article/builder slugs answer HTTP 200 ("Not Found" drawn in JS) | Only the database knows which slugs exist; needs the server | M2 |
| `<html lang>` is always `fr` in raw HTML | Same — set per page by the server | M2 |
| Articles declare no hreflang pair | Posts don't store their translation's slug yet (`translation_slug`) | M2 |
| `/blog/<slug>` redirects by browser language, client-side | Needs a server redirect map with the slug's language | M5 |
| One 1.7 MB JavaScript bundle (admin editor shipped to visitors) | Split per route with Next.js | M3/M4 |
| Admin screens partly English-only (e.g. "Access Denied" toasts) | Admin-only; low priority | M4 |
| `npm audit` findings, dead Supabase files, 11 lint warnings | Hardening pass | M6 |
| `firestore.rules` TEMP: comments accept `email: null` from old bundles | Remove once no pre-M0 bundle can still be open | M6 |
| TypeScript runs in non-strict mode (`strict: false`), unlike CLAUDE.md §9 | Turning it on is a large change of its own | M6 |
| Security headers written twice (next.config for rendered pages, netlify.toml for static files) | Netlify applies neither mechanism to the other's responses; one list in `config/security-headers.json`, a unit test fails on drift | accepted |
| `proxy.ts` sends every known path to one app shell (migration scaffolding) | Pages are still the client-side app | removed as pages move to server routes (M2) |

---

## 2. MIGRATION PROGRESS (Next.js, CLAUDE.md §10)

| Phase | Status | Notes |
|---|---|---|
| D1–D5 decisions | ✅ 2026-10-02 | Netlify · next-intl · `/` → `/fr` · rules-bound public reads · authenticated on-demand revalidation |
| M0 — Stabilise the live site | ✅ 2026-10-01 | 39/116 → 127/127 crawler checks; commenter emails private |
| Builders merge + Storage owner folders | ✅ 2026-10-02 | /fr\|en/builders; strangers can no longer delete media |
| M1 step 1 — React 19 | ✅ 2026-10-02 | Released on the current app; + social links fix, sign-in EN/FR |
| M1 step 2 — Next.js runs the existing site | ⏸ | built + verified on draft; awaiting commit OK |
| M1 step 3 — foundations (route map, metadata, data layer, tests) | 🔴 | |
| M2 — Server-rendered public pages (SEO core) | 🔴 | |
| M3 — Interactive islands | 🔴 | |
| M4 — Auth & admin, publish → refresh | 🔴 | |
| M5 — SEO infrastructure (sitemap, redirects, OG) | 🔴 | |
| M6 — Hardening (CSP, audit, performance) | 🔴 | |
| M7 — Cutover & 4-week monitoring | 🔴 | |

---

## 3. PROGRESS LOG (newest first)

### 2026-10-02 — M1 step 2 built and verified on a draft ⏸ (awaiting commit OK)
- Where: branch `migration/m1-nextjs-shell` (from `migration/nextjs` = `main` @ `3aebad8`), worktree `../AfriniaOrg-nextjs`; nothing reaches production before M7.
- What changed: Next.js 16.3 replaces Vite. `index.html` → `app/layout.tsx` (same metadata, fonts, Organization JSON-LD, still no site-wide canonical); `main.tsx` → `src/spa.tsx` + `src/ClientApp.tsx` (the existing app, browser-only); `public/_redirects` → `next.config.ts` redirects (301 kept) + `proxy.ts` + `src/routing/spaRoutes.ts` (known path → one static app shell; anything else → Next's static 404); `src/pages` renamed `src/views` (Next.js reserves `pages/`).
- Found and fixed while building: (1) a per-URL page cache let random URLs create stored 404 pages (storage-abuse risk) and, on case-insensitive disks, served `/terms` as 404 after `/Terms` → replaced by one shared shell + proxy; 100 random URLs now add 0 cache entries. (2) On Netlify, `next.config` headers miss static files and `netlify.toml` headers miss rendered pages → one list (`config/security-headers.json`) applied by both, with a drift test. (3) ESLint was scanning generated `.next/` files.
- Evidence: draft `check:site` **146/146** (production today 140/140 — 6 new header checks); 9 interactive flows, sign-in + footer in FR/EN, 404 page, legacy links, in-app navigation (0 full reloads) identical to production; subscribe/contact functions answer as in production; unit tests 22/22 (+ route list, header drift); rule tests 45/45; typecheck 0 errors; lint 0 errors (11 old warnings).
- Measured: article page JavaScript 669 KB → 716 KB (+7%, Next.js runtime); real reductions come when the admin editor stops shipping to visitors (M3/M4).

### 2026-10-02 — Docs: tracker restructured
- `CurrentStatus.md` restructured as the live tracker (NOW · migration table · dated log · July archive); `CLAUDE.md` requires updating it at the end of every step and no longer keeps its own progress log.

### 2026-10-02 — M1 step 1 released ✅ (`chore/react-19` → `main` @ `edacb38`)
- Removed 28 unused UI components + 25 libraries (~4,800 lines) that blocked React 19; upgraded to React 19.3 (+ sonner 2, next-themes 0.4, Radix latest) — 0 peer-dependency problems.
- Social links: settings were saved to `site_settings`, which no rule covered — every admin save failed. Moved to `site_config/social_links` (one service file); the footer now shows only enabled platforms (Facebook).
- Sign-in journey translated EN/FR (~60 strings; 568 keys in each language); Firebase errors mapped to clear messages.
- Evidence: production `check:site` 140/140; 9 interactive flows OK in Chrome; FR/EN sign-in and footer verified; rule tests 45/45.

### 2026-10-02 — Builders + Storage release ✅ (`merge/builders-into-main` → `main` @ `d8e08f5`)
- July builders work merged; builder URLs language-prefixed (`/fr|en/builders[/slug]`), `/builders` → 301 `/fr/builders`; builders in the sitemap.
- Storage owner folders: any signed-up account could delete any blog image, builder photo or podcast file — now only the uploader can.
- Lesson: the M0 rules release had silently removed builders/contact rules live since 2026-07-26 → every rules release now diffs the live rules first (verify skill).
- Evidence: rules published first (+30 lines, nothing removed), then Storage rules, then `main` 2 s later; production 140/140; 45 Storage files and all 25 episodes load.

### 2026-10-01 — M0 released ✅
- Real 404s, no homepage canonical in raw HTML, `afinia.netlify.app` → 301, sitemap with real dates, security headers, articles no longer point hreflang at "Post not found" pages, commenter emails private (`comment_contacts`, admin-only).
- Evidence: production `check:site` 39/116 → 127/127; live test comment verified and deleted.

### 2026-09-29 — Diagnosis ✅
- Raw HTML for every URL is the same empty 5 KB shell; Google sees one canonical (the homepage) for every page; unknown URLs answer 200. Decision: migrate to Next.js (plan in CLAUDE.md §10).

---

## 4. ARCHIVE — milestones before the Next.js migration (April–July 2026)

> Historical record, kept unchanged below. Its "current branch" and "next session" notes are **out of date** (those branches were deployed in July) — use sections 1–3 above for the current state.

#### MILESTONE LOG (archive)

---

#### MILESTONE 0 — Foundation & Planning
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

#### MILESTONE 1 — Fix Domain Mismatch (afrinia.com → afrinia.org)
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

#### MILESTONE 2 — Fix Sitemap Structure (Add Missing Pages, Remove Non-Indexable)
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

#### MILESTONE 3 — GA4 SPA Route-Change Tracking
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

#### MILESTONE 4 — GA4 Custom Event Tracking (Blog + Audio)
**Status:** ✅ Done
**Date completed:** 2026-04-21
**Branch:** `GoogleAnalyticsSetUp`

**What was done:**
All typed event functions were defined in `src/utils/analytics.ts` (Milestone 3). This milestone wired them into the four pages that generate those events.

| Event | File | Trigger | Data sent |
|-------|------|---------|-----------|
| `article_view` | `BlogPost.tsx` | Post data loads successfully from Firestore | `article_slug`, `article_title`, `article_lang`, `article_category` |
| `article_read_complete` | `BlogPost.tsx` | IntersectionObserver fires when end-of-article sentinel scrolls into view (50% threshold) | `article_slug`, `article_title` |
| `comment_submitted` | `BlogPost.tsx` | Comment successfully written to Firestore | `article_slug`, `article_lang` |
| `audio_play` | `AudioPage.tsx` | `onPlay` fires on the `<audio>` element (new episode start OR resume) | `episode_id`, `episode_title`, `episode_number` |
| `audio_pause` | `AudioPage.tsx` | `onPause` fires AND `audioRef.current.ended === false` (intentional pause only, not natural episode end) | `episode_id`, `listen_duration_seconds` |
| `newsletter_signup` | `Blog.tsx` | Firestore write succeeds in `handleSubscribe` | `source_page: /{lang}/blog`, `lang` |
| `newsletter_signup` | `Index.tsx` | Firestore write succeeds in `handleSubscribe` | `source_page: home`, `lang` |

**Design decisions recorded:**
- **`article_read_complete` uses IntersectionObserver, not scroll events.** Scroll listeners fire constantly and require debouncing. An IntersectionObserver on a 0-height sentinel `<div>` placed at the end of the article body fires once, cleanly, with no performance cost. A `hasTrackedReadRef` prevents re-firing if the user scrolls back up and down.
- **`audio_pause` guards against natural episode end.** `onPause` and `onEnded` both fire when an episode finishes. `audioRef.current.ended` distinguishes natural end from user pause. Only user pauses emit the event, so the listen duration data is meaningful.
- **`newsletter_signup` is tracked in both Blog and Index.** Both pages have independent newsletter forms writing to Firestore. The `source_page` parameter tells GA4 which page converted the subscriber.
- **TypeScript:** `tsc --noEmit` passes with zero errors.

**Success criteria to verify in GA4 Realtime:**
- [ ] Open a blog article → GA4 shows `article_view` with correct slug, title, lang, category
- [ ] Scroll to the bottom of the article → GA4 shows `article_read_complete`
- [ ] Submit a comment → GA4 shows `comment_submitted`
- [ ] Play an audio episode → GA4 shows `audio_play` with episode data
- [ ] Pause audio mid-episode → GA4 shows `audio_pause` with `listen_duration_seconds`
- [ ] Subscribe to newsletter on blog or homepage → GA4 shows `newsletter_signup` with correct `source_page`

---

#### MILESTONE 5 — Add Page Meta to AudioPage
**Status:** ✅ Done
**Date completed:** 2026-04-21
**Branch:** `GoogleAnalyticsSetUp`

**Root cause:**
Every visit to `/audio` was recorded in GA4 with `page_title: "Afrinia — Intelligence for Africa's Builders"` — the same title as the homepage. GA4 cannot distinguish audio traffic from homepage traffic in any report filtered by page title. Google also had no structured data describing the podcast, which limits how the audio page appears in search results.

**Files changed:**

| File | What changed |
|------|-------------|
| `src/pages/AudioPage.tsx` | Added `usePageMeta` import; added `usePageMeta()` call inside the component with bilingual title, bilingual description, canonical `ogUrl`, and a `PodcastSeries` JSON-LD schema |
| `src/locales/en.json` | Added `audio_page.page_title` and `audio_page.page_description` |
| `src/locales/fr.json` | Added `audio_page.page_title` and `audio_page.page_description` |

**What the JSON-LD does:**
The `PodcastSeries` schema block tells Google that `/audio` is a podcast series named "The Afrinia Brief", published by the Afrinia organisation (`afrinia.org/#organization`), available in both English and French. This is the same organisation already declared in `index.html` — the `@id` links them together so Google sees a coherent knowledge graph, not isolated pages.

**Design decisions recorded:**
- **Why `usePageMeta` re-runs on language change:** `useTranslation()` re-renders the component when the user switches language. `t('audio_page.page_title')` changes value, so `usePageMeta`'s dependency array triggers and the browser tab title and meta tags update immediately — no page reload needed.
- **Why JSON-LD is hardcoded (not translated):** Structured data is read by search engine crawlers, not users. "The Afrinia Brief" is a proper noun that does not change by language. Translating it would create two competing schema entries, which confuses Google's parser.
- **Why `inLanguage` is an array:** The audio feed serves both EN and FR listeners. Declaring both languages in the schema correctly signals multilingual content to search engines rather than implying it is English-only.

**Success criteria verified:**
- ✅ `tsc --noEmit` passes with zero errors
- [ ] Browser tab shows "The Afrinia Brief — Audio | Afrinia" when on the audio page (EN)
- [ ] Browser tab shows "Le Bref Afrinia — Audio | Afrinia" when language is switched to FR
- [ ] GA4 Realtime shows `page_title: "The Afrinia Brief — Audio | Afrinia"` for `/audio` visits
- [ ] Browser DevTools → Sources → rendered `<head>` contains `<script type="application/ld+json">` with PodcastSeries schema while on `/audio`, and that script is removed when navigating away

---

#### MILESTONE 6 — Enable Enhanced Measurement in GA4 Console
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

### SUMMARY TABLE

| Milestone | Description | Status | Date |
|-----------|-------------|--------|------|
| 0 | Foundation & Planning | ✅ Done | 2026-04-21 |
| 1 | Fix domain mismatch (afrinia.com → afrinia.org) | ✅ Done | 2026-04-21 |
| 2 | Fix sitemap structure (add missing pages) | ✅ Done | 2026-04-21 |
| 3 | GA4 SPA route-change tracking | ✅ Done | 2026-04-21 |
| 4 | GA4 custom event tracking (blog + audio) | ✅ Done | 2026-04-21 |
| 5 | Add page meta to AudioPage | ✅ Done | 2026-04-21 |
| 6 | Enable Enhanced Measurement (GA4 console) | ⏸ Blocked | — |
| 7 | Fix sitemap serving wrong file (force redirect) | ✅ Done | 2026-07-01 |
| 8 | Fix production fetching wrong Firestore database | ✅ Done | 2026-07-01 |
| 9 | Signal Architecture taxonomy design + signalMapSkills.md | ✅ Done | 2026-07-01 |
| 10 | Signal Architecture — Prompt 1: Audit categories | ✅ Done | 2026-07-01 |
| 11 | Signal Architecture — Prompts 2–10: Full implementation | ✅ Done | 2026-07-01 |
| 12 | Audio signal taxonomy — migrate + display fix | ✅ Done | 2026-07-01 |
| 13 | Followable Signals architecture design | ✅ Done | 2026-07-01 |
| 14 | Followable Signals — Prompts 11–17: Implementation | ✅ Done | 2026-07-01 |

---

---

### SESSION: 2026-07-01 — Branch: `feature/resend-mailing-system`

> This session was on a different branch from the `GoogleAnalyticsSetUp` session above. Both branches are diverged from `main`. `feature/resend-mailing-system` contains all the most recent work including Milestones 7, 8, 9.

---

#### MILESTONE 7 — Fix Sitemap Serving Wrong File (force redirect)
**Status:** ✅ Done — commit `eca0c6e`
**Branch:** `feature/resend-mailing-system`
**Date completed:** 2026-07-01
**DEPLOY NEEDED — not yet live at afrinia.org**

**Root cause:**
Netlify serves static files over redirects unless the redirect explicitly has `force = true`. The file `public/sitemap.xml` (a static placeholder) is copied to `dist/sitemap.xml` at build time. Netlify CDN was finding that static file and serving it directly, bypassing the dynamic Netlify Function entirely. The result: `afrinia.org/sitemap.xml` showed a comment saying "THIS FILE IS NO LONGER THE LIVE SITEMAP" with no article URLs — exactly the placeholder content.

The dynamic Netlify Function at `netlify/functions/sitemap.js` (which queries Firestore live and returns real article URLs) was never being called in production.

**Files changed:**

| File | What changed |
|---|---|
| `netlify.toml` | Added `force = true` to the `[[redirects]]` block for `/sitemap.xml` |
| `public/_redirects` | Changed `200` to `200!` (the `!` suffix is the force flag for this file format) |

**What you should see after deploying:**
- `afrinia.org/sitemap.xml` returns XML with `<lastmod>`, `<changefreq>`, `<priority>` fields and all published article URLs
- The static comment "THIS FILE IS NO LONGER THE LIVE SITEMAP" does NOT appear
- New articles published via admin panel appear in the sitemap immediately (no deploy needed)

**Post-deploy action required:**
Resubmit sitemap in Google Search Console: GSC → Sitemaps → delete old entry → add `sitemap.xml` → Submit.

---

#### MILESTONE 8 — Fix Production Fetching Wrong Firestore Database
**Status:** ✅ Done — commit `eca0c6e`
**Branch:** `feature/resend-mailing-system`
**Date completed:** 2026-07-01
**DEPLOY NEEDED — not yet live at afrinia.org**

**Root cause:**
Firebase project `modified-hull-203004` has TWO Firestore databases:
- The **default** database — nearly empty, almost no articles
- A **named** database called `"afrinia"` — contains all real content

`config.ts` was reading an environment variable `VITE_FIRESTORE_DATABASE_ID` to decide which database to connect to. This variable existed in the local `.env` file (`VITE_FIRESTORE_DATABASE_ID=afrinia`) but was never set in Netlify's environment variables panel. At build time, Vite saw the variable as undefined and silently fell back to the default (wrong) database.

Result: Local dev showed rich content (many articles, proper categories). Production at `afrinia.org` showed sparse data (1–2 categories, almost no articles). Same codebase — two completely different databases.

**Files changed:**

| File | What changed |
|---|---|
| `src/integrations/firebase/config.ts` | Removed env-var conditional entirely. Hardcoded `getFirestore(firebaseApp, 'afrinia')` — matching what the Netlify backend functions (`sitemap.js`, `firebase-admin.js`) already do. |

**Important:** The Netlify environment variable `VITE_FIRESTORE_DATABASE_ID` is no longer needed and can be left unset or removed from Netlify's dashboard without consequence.

---

#### MILESTONE 9 — Signal Architecture: Taxonomy Design + signalMapSkills.md
**Status:** ✅ Done (design complete, implementation not started)
**Branch:** `feature/resend-mailing-system`
**Date completed:** 2026-07-01

**What was done:**
Designed the canonical 5-category signal taxonomy for Afrinia's content classification system. Wrote and then fully corrected `signalMapSkills.md` — a 10-prompt sequential implementation plan.

**The original `signalMapSkills.md` had critical errors:**
- Written for Next.js App Router (wrong framework — Afrinia is Vite + React Router v6)
- Referenced a `signals` Firestore collection (doesn't exist — real collections are `posts_en` / `posts_fr`)
- All file paths used `lib/` directory (doesn't exist — should be `src/`)
- Routing patterns used Next.js `useParams` (wrong — should be React Router `useLocation()`)
- Prompt 9 planned to replace the working Netlify sitemap function with a Next.js sitemap

**The corrected `signalMapSkills.md` now has:**
- Correct stack facts at the top of the file (hard requirement for any new session)
- Correct collections: `posts_en` and `posts_fr`
- Correct file paths: all under `src/`
- Correct routing: `pathname.startsWith('/fr/')` via `useLocation()`
- Correct component patterns: shadcn/ui Selects, not native `<select>`
- ESM script format: `.mjs` extension
- Phase 2 flag for hreflang per-article alternates (not possible without cross-reference field)
- CSR limitation documented for JSON-LD (not in raw HTML source — accepted for Phase 1)
- Reference tables at bottom: field names, TypeScript types, real file paths

**The canonical taxonomy (permanent — do not change without updating signalMapSkills.md):**

| Key | EN Label | FR Label | Meaning |
|---|---|---|---|
| `opportunity` | OPPORTUNITY | OPPORTUNITÉ | Market openings, trade plays, sector entry, actionable leads |
| `analysis` | ANALYSIS | ANALYSE | Macro trends, policy context, structural explanations |
| `investment` | INVESTMENT | INVESTISSEMENT | Funding rounds, capital flows, DFI activity, M&A |
| `technote` | TECHNOTE | TECHNOTE | Fintech, AI, digital infrastructure — identical in both languages by design |
| `builder` | BUILDER | BÂTISSEUR | Founder profiles, startup ecosystems, operator intelligence |

**Note on `signalMapSkills.md` file status:** The file was rewritten this session but is untracked in git (not yet committed). It must be committed before the next session begins.

---

### CURRENT STATE OF THE APP (2026-07-01)

#### What is working correctly

| Feature | Confidence | Notes |
|---|---|---|
| Blog listing (EN + FR) | High | Fetches from `posts_en`/`posts_fr`, renders cards, filters by category + country |
| Article detail page | High | Fetches by slug + lang, renders content, related posts, comments, JSON-LD |
| JSON-LD Article schema | High | All required fields present — `headline`, `description`, `datePublished`, `dateModified`, `author`, `publisher`, `inLanguage`, `url`, `image` (conditional), `keywords`, `isPartOf`. Only missing: `articleSection` (Prompt 8 of signalMapSkills.md) |
| Canonical + og:url tags | High | Set per-page via `usePageMeta`, removed on unmount |
| Admin blog editor | High | Save, edit, publish, archive, delete, featured image upload, notify Google on publish |
| Firebase Auth | High | Sign in/up/out, profile, roles, stale closure bug fixed |
| Newsletter subscribe/unsubscribe | High | Netlify Functions v2, Resend |
| Contact form | High | Netlify Function, Resend |
| Audio page | High | Episodes from Firestore, inline player, fixed mini-player, JSON-LD PodcastSeries |
| GA4 tracking | High | Page views (SPA), article_view, article_read_complete, newsletter_signup, comment_submitted |
| robots.txt | High | Correct, Disallow /admin/, points to sitemap.xml |
| Firestore security rules | High | Deployed, covers all collections, deny-all catch-all |
| Dynamic sitemap function | High (post-deploy) | Netlify Function queries both collections live — force redirect in place |

#### Current bugs and missing items

**CRITICAL — fixed, deploy needed:**
- Production was fetching wrong Firestore database → fixed commit `eca0c6e`
- Sitemap serving static placeholder → fixed commit `eca0c6e`

**HIGH — requires signalMapSkills.md execution:**
- Category field in Firestore is freetext garbage (duplicates, misspellings, mixed languages) → Prompts 1+4
- Blog filter bar derives categories dynamically from dirty data → shows broken UI → Prompt 6
- Admin category input is freetext — allows bad data to be entered → Prompt 5
- Category badges render raw Firestore strings without language respect → Prompt 7

**MEDIUM:**
- JSON-LD missing `articleSection` field — requires Prompt 3 taxonomy constants first → Prompt 8
- TypeScript has no enforcement for canonical category values (`category?: string`) → Prompt 2
- No `src/constants/taxonomy.ts` file yet — single source of truth for labels missing → Prompt 3
- No cross-reference field between EN and FR articles — hreflang per-article deferred to Phase 2
- `signalMapSkills.md` is untracked in git — needs commit before next session

**LOW:**
- Dead auth modal files: `src/components/auth/AuthModal_FIXED.tsx`, `AuthModal_New.tsx`
- Dead Supabase integration: `src/integrations/supabase/`, `src/utils/supabaseComments.ts`
- Bundle size 1.7MB — admin components always loaded — Phase 2 optimisation

---

### NEXT SESSION — WHERE TO START

#### Completed this session (2026-07-01, branch: `feature/signal-architecture`)

All 10 prompts from `signalMapSkills.md` are done. Commit: `da53b7b`.

**What was done:**
- Prompt 1: `scripts/audit-categories.mjs` ran — found 8 unique freetext values across 20 docs
- Prompt 2: `PostCategory`, `PostSector`, `PostRegion` types added to `types.ts`
- Prompt 3: `src/constants/taxonomy.ts` created — single source of truth for all labels
- Prompt 4: `scripts/migrate-categories.mjs` ran — all 20 Firestore docs migrated to canonical keys, `categoryEN`, `categoryFR`, `sector`, `region` fields added
- Prompt 5: `BlogPostEditor.tsx` — category freetext Input replaced with enforced Select; Sector and Region dropdowns added
- Prompt 6: `Blog.tsx` — filter bar uses static `SIGNAL_CATEGORIES`, no more dynamic dirty data
- Prompt 7: `Blog.tsx` + `BlogPost.tsx` — all category badges use `getCategoryLabel`
- Prompt 8: `BlogPost.tsx` — `articleSection` added to JSON-LD Article schema
- Prompt 9: sitemap function verified — already correct, no changes needed
- Prompt 10: full data audit passed — all 20 docs have valid canonical categories + required fields; `tsc --noEmit` zero errors

#### MILESTONE 12 — Audio Signal Taxonomy
**Status:** ✅ Done — commit `3261600`
**Branch:** `feature/signal-architecture`

**What was done:**
- Audited `audio_en` (5 docs) and `audio_fr` (12 docs) — same freetext mess as blog posts
  (`Founder`, `Oportunité` [typo], `Strategies`, `Bâtisseurs`, `Entrepreneurialism`, etc.)
- `scripts/migrate-audio-categories.mjs` migrated all 17 audio documents to canonical keys,
  added `categoryEN` and `categoryFR` display fields. Zero unmapped, zero errors.
- `AudioEpisode.category` in `types.ts` changed from `string` to `PostCategory`
- `AudioPage.tsx` `EpisodeCard` now uses `getCategoryLabel(ep.category, lang)` —
  shows BUILDER/BÂTISSEUR, OPPORTUNITY/OPPORTUNITÉ, etc. correctly per language

#### MILESTONE 13 — Followable Signals Architecture Design
**Status:** ✅ Done (design only — implementation not started)
**Branch:** `feature/signal-architecture`

**Design documented in `signalMapSkills.md` Prompts 11–17:**
- Prompt 11: Add `signals: []` field to all subscriber Firestore documents
- Prompt 12: Add `Subscriber` and `FollowableSignal` types to `types.ts`
- Prompt 13: Update `subscribe` Netlify Function to accept `signals` array
- Prompt 14: Update `send-newsletter` to support per-signal targeting
- Prompt 15: Create `SignalFollowCTA` component — end-of-article follow button
- Prompt 16: Update admin panel to choose "Signal followers only" vs "All subscribers"
- Prompt 17: End-to-end verification

**Why this is the right next feature:**
- Converts passive readers into declared signal followers at highest-intent moment (end of article)
- Per-signal email lists → higher open rates, lower churn, editorial intelligence
- Foundation for paid tiers (premium signal briefings) — monetisation architecture built-in
- The taxonomy migration (Milestones 10–12) is the prerequisite — now complete

---

---

### SESSION: 2026-07-01 — Branch: `feature/followable-signals`

> Created from `feature/signal-architecture`. Contains the full Followable Signals implementation (Milestone 14).

---

#### MILESTONE 14 — Followable Signals Implementation (Prompts 11–17)
**Status:** ✅ Done — commit `f82f61b`
**Branch:** `feature/followable-signals`
**Date completed:** 2026-07-01

**Critical schema correction applied during this session:**
`signalMapSkills.md` described a `subscribers` collection with `lang`/`subscribed_at`/`unsubscribed: boolean`. The actual production code uses `newsletter_subscribers` with `language`/`subscribedAt`/`status: 'active'|'unsubscribed'`/`unsubscribeToken`. All 6 implementation prompts were adapted to the real schema.

**Files changed:**

| File | What changed |
|---|---|
| `scripts/migrate-subscriber-signals.mjs` | New script — adds `signals: []` to all 9 existing `newsletter_subscribers` docs. Idempotent. Ran and verified: 0 docs missing signals field. |
| `src/integrations/firebase/types.ts` | Added `FollowableSignal = PostCategory` and `Subscriber` interface matching real schema |
| `netlify/functions/subscribe.js` | Accepts optional `signals[]` in POST body, validates each value against `VALID_SIGNALS`, stores on subscriber doc |
| `netlify/functions/send-newsletter.js` | New `signal` + `includeGeneric` params for per-signal targeting. Logs targeting summary on every send. |
| `src/components/SignalFollowCTA.tsx` | New component — bilingual "Follow this signal" CTA at end of every article. Calls subscribe with `signals: [signal]`. |
| `src/pages/BlogPost.tsx` | Mounts `SignalFollowCTA` after `articleEndRef` sentinel, before SocialShare |
| `src/components/admin/BlogPostEditor.tsx` | Adds `signalTarget` state + radio UI below Notify toggle: "Signal followers only" (default) / "All subscribers". Passes `signal` param to send-newsletter. |

**Verification results:**
- ✅ tsc --noEmit → zero errors
- ✅ 9/9 newsletter_subscribers docs have signals field
- ✅ subscribe.js filters invalid signal values server-side with console.warn
- ✅ send-newsletter.js signal filter logic covers all three cases (specific, generic-included, all)
- ✅ SignalFollowCTA renders in EN and FR with correct signal label
- ✅ Admin radio default is 'signal' (safest — no accidental broadcast)

**What is NOT yet verified (requires running dev server):**
- SignalFollowCTA visual appearance in browser
- Subscribe POST returning 200 and writing signals to Firestore
- Admin radio UI rendering when Notify toggle is ON

---

### NEXT SESSION — WHERE TO START

#### Three branches need to be deployed in order:
1. `feature/resend-mailing-system` — sitemap force redirect + correct Firestore DB
2. `feature/signal-architecture` — full signal taxonomy (Prompts 1-10) + audio fix
3. `feature/followable-signals` — followable signals (Prompts 11-16)

Merge order matters: resend-mailing-system → signal-architecture → followable-signals → main.

#### Post-deploy verification checklist:
- `afrinia.org/sitemap.xml` returns dynamic XML with article URLs (not the placeholder comment)
- `afrinia.org/en/blog` filter bar: ALL · OPPORTUNITY · ANALYSIS · INVESTMENT · TECHNOTE · BUILDER
- `afrinia.org/fr/blog` filter bar: TOUT · OPPORTUNITÉ · ANALYSE · INVESTISSEMENT · TECHNOTE · BÂTISSEUR
- Open any article → `SignalFollowCTA` appears below body in correct language
- Submit a test email via the CTA → Firestore `newsletter_subscribers` doc has `signals: ['builder']` (or correct signal)
- Admin → edit a post → toggle Notify → radio appears, "Signal followers only" pre-selected
- Resubmit sitemap in GSC after deploy
