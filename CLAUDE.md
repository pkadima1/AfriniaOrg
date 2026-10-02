# CLAUDE.md — How to Work on This Project

> This file governs how any AI assistant (Claude or otherwise) must think, communicate, and act when working on the Afrinia codebase. These rules are non-negotiable and apply to every task, every file, every decision.
>
> **Where things stand:** `CurrentStatus.md` — read its section 1 ("NOW") at the start of every session.
> **Active initiative:** migration from the Vite single-page app to Next.js so search engines receive real HTML. Plan: Section 10. Verification recipes: `.claude/skills/verify/SKILL.md`.

---

## 1. WHO YOU ARE WORKING WITH

The person directing this project:
- Thinks in **systems and logic**, not in code syntax. He understands cause and effect, architecture, flows, and consequences — but is not a programmer.
- Cares deeply about **why** something is done, not just what is done.
- Will not accept vague answers, surface-level fixes, or "it works for now" solutions.
- Expects every decision to be **justified**, every trade-off to be **named**, and every risk to be **surfaced** before it becomes a problem.
- Operates with a **long-term builder mindset**: he is building something that will scale to thousands of users. Every decision today shapes what is possible in Phase 3, 4, and 5.

---

## 2. HOW TO THINK BEFORE ACTING

Before writing a single line of code or making any change, you must answer these three questions internally:

**WHAT** — What exactly is the problem? Not the symptom. The root cause.
**WHY** — Why does this problem exist? What created it? What will happen if it is not fixed?
**HOW** — How will the solution fix the root cause without creating new problems?

If you cannot answer all three clearly, you are not ready to act. Investigate further.

**The rule:** Diagnose before you prescribe. A doctor who writes a prescription without reading the test results is dangerous. Be the careful doctor, not the rushed one.

**Verify live state before trusting notes.** Docs and memory describe what was true when written. Before acting on a claim about production (afrinia.org), re-check it with the recipes in the verify skill.

---

## 3. HOW TO COMMUNICATE

Plain English, always. No jargon without an explanation. When a technical term is necessary, explain it in one sentence using an analogy or plain language.

**Structure every explanation as:**
1. What is happening right now (the current state)
2. What is wrong with it and why it matters (the problem)
3. What the fix does and how it solves the root cause (the solution)
4. What risks or side effects the fix introduces (the trade-offs)

Never say "I fixed it." Say what was broken, what you changed, and what the user should now observe differently.

---

## 4. CODE QUALITY STANDARDS (NON-NEGOTIABLE)

### Security First
- Never expose API keys, secrets, or credentials in code. Use environment variables.
- All user inputs are validated before touching any database or external service.
- No `dangerouslySetInnerHTML` without sanitization (article HTML goes through `cleanArticleHtml`).
- Firestore security rules must match the code. If code allows an operation, the rules must too. If the rules block it, the code must respect that.
- Never trust the client. Always validate on the server side or in Firestore rules.
- Never make personal data (emails, names of non-public users) publicly readable.
- Server-only code (service-account keys, `firebase-admin`) must never be importable from a client component. In Next.js, such modules start with `import 'server-only'`.

### No Shortcuts
- No `// TODO: fix this later` in committed code.
- No hardcoded values that belong in config or environment variables.
- No commented-out blocks of old code left in production files.
- No `any` type in TypeScript unless absolutely unavoidable and explicitly justified in a comment.

### No Duplication
- If the same logic appears in two places, extract it. Name it clearly. Import it both places.
- Before creating a new component, search for an existing one to reuse or extend.
- Design tokens (colors, fonts, spacing) live in one place and are referenced everywhere. They are never re-typed in a component.
- Translation strings live in `en.json` and `fr.json`. They are never hardcoded in a component.
- URLs of public pages are built by one helper (the route map). They are never assembled by hand in components, the sitemap, or metadata.

### Documentation
- Every function that is non-obvious gets a one-line comment explaining **why** it exists, not what it does (the code already shows what it does).
- Every file that is not self-explanatory gets a three-line header: what it is, why it exists, and what it connects to.
- Complex flows (auth, analytics, data fetching, rendering/revalidation) get an inline comment at the entry point explaining the full sequence.

### Long-Term Resolution Over Symptomatic Fixes
- If a bug is caused by a wrong assumption in the architecture, fix the assumption — do not patch around it.
- If a workaround is unavoidable, it must be marked with `// TEMP:` and a clear explanation of what the real fix requires.
- Every change must leave the codebase in a **better state** than before. Not just "working" — better.

---

## 5. PRODUCTION-READY STANDARDS

Every change made to this codebase is treated as if it is going live to real users in the next 30 minutes.

**This means:**
- All new code is tested before being committed — automated tests (Section 11) plus driving the feature in a real browser (verify skill).
- No changes to routing, security rules, or data models without checking what breaks downstream.
- Environment variables are verified to exist before deployment (not assumed).
- Loading states exist for every async operation. Empty states exist for every list or data fetch.
- Error states are handled. If a Firebase call fails, the UI shows something useful — not a blank screen or a JavaScript error.
- The site works with slow connections and on mobile. No layout breaking at 375px width.
- **Public pages must be readable without JavaScript.** Their text, title, canonical and language must be present in the raw HTML the server sends (checked with `curl`, not only in a browser).

**Testing checklist before any commit:**
- [ ] `npm run typecheck`, `npm run lint` (0 errors), `npm test` pass — judged by **exit code 0**, never by reading one summary line; `npm run test:rules` when rules or data access changed; on the Next.js branch also `npm run test:integration` (server readers vs emulator) and `npm run test:e2e` (Playwright)
- [ ] `npm run build` succeeds
- [ ] The feature works on localhost, driven in a real browser
- [ ] The feature works in both English and French
- [ ] The feature does not break any existing page or route
- [ ] No console errors in the browser
- [ ] Firestore security rules allow the new operations — and nothing more
- [ ] All new strings have EN and FR translations
- [ ] For routing, headers, redirects, sitemap or public pages: `npm run check:site` passes on a Netlify **draft deploy** (local `netlify serve` does not route like production — see the verify skill), and `npm run seo:check` does not regress (from M2: passes).

---

## 6. BRANCH AND COMMIT DISCIPLINE

- Feature branches are named descriptively: `feature/ga4-spa-tracking`, `fix/sitemap-domain`, etc.
- Commits are small and focused. One logical change per commit.
- Commit messages follow the pattern: `type: plain-English description of what changed and why`
  - Types: `feat`, `fix`, `refactor`, `docs`, `chore`, `test`
  - Example: `feat: add GA4 route-change tracking so article page views are recorded in Analytics`
- Never commit directly to `main`. Always work on a branch and merge. `main` deploys to production on Netlify.
- **Nothing is committed, pushed, or merged without the owner's OK.** Build and verify freely on a branch, then stop and present: what changed, why, what was verified (with evidence), what remains. Wait for approval.
- **Migration branches:** all Next.js work lives on the integration branch `migration/nextjs`. Each phase is built on its own branch (`migration/m2-public-pages`, etc.) cut from `migration/nextjs` and merged back into it after its exit criteria pass. Only the cutover phase (M7) merges `migration/nextjs` into `main`.
- Fixes to the live site during the migration (e.g. M0) branch from `main` and merge to `main`, then `main` is merged into `migration/nextjs` so the two never drift.
- Parallel work (e.g. migration code while a docs or hotfix branch is open) uses a git worktree **beside** the repo (`../AfriniaOrg-<name>`), never in a temporary/scratch folder.

### Progress tracking (`CurrentStatus.md`)
At the end of **every step** — not only phases — and in the same branch as the work, update `CurrentStatus.md`:
1. Section 1 "NOW": what is live, what is in progress, what is next, what waits on the owner, known open issues.
2. Section 2: the phase/step status table.
3. Section 3: a dated log entry — what changed, why, and the evidence (commands run and their results).
`CLAUDE.md` holds the rules and the plan; it is not a progress log.

---

## 7. WHAT TO DO WHEN UNCERTAIN

If you are uncertain about the right approach:
1. Say so explicitly. Do not guess and hide it.
2. Present two or three options with their trade-offs clearly named.
3. Recommend one option and explain why.
4. Wait for confirmation before proceeding.

Uncertainty acknowledged is a strength. Uncertainty hidden is a bug waiting to happen.

---

## 8. CURRENT PROJECT PHASE

Afrinia is in **Phase 1 — Authority Engine**. See SKILLS.md for the full roadmap.

Every task must serve one of these Phase 1 goals:
- Get more content indexed by Google (SEO)
- Track what content is performing (Analytics)
- Make the site trustworthy and reliable for first-time visitors
- Build the admin infrastructure to publish content efficiently

If a task does not serve Phase 1, it is deferred to the appropriate phase. No exceptions.

The Next.js migration serves the first goal directly and is already the Phase 1 stack in SKILLS.md (Section 4). **While it is in progress, no new features are added to the Vite app** — only fixes to the live site (M0-style). New features wait for the Next.js codebase so they are not built twice.

---

## 9. TARGET ARCHITECTURE (WHY THE MIGRATION EXISTS)

**Diagnosis (verified 2026-09-29 against production).** The site is a Vite single-page app. For every URL the server sends the same 5 KB file with an empty `<div id="root">`; the page content is drawn later by JavaScript. Consequences seen in Google Search Console (11 indexed / 52 not indexed):
- The static `index.html` declares `canonical = https://afrinia.org/` for every URL → "Duplicate, Google chose different canonical" (19).
- Unknown and legacy URLs answer HTTP 200 and draw a "404" in JavaScript → "Soft 404" (16).
- Pages look empty until rendered → "Crawled – currently not indexed" (12).
- Language is chosen by the browser, not the URL; `<html lang="fr">` is static.
- Non-Google crawlers and link previews (LinkedIn, WhatsApp, X) see nothing.

**Principle.** A public page is only as good as the HTML the server sends. The server must send the finished page: full text, its own title/description/canonical, its language, and the correct HTTP status.

**Target stack.**

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js (App Router)**, TypeScript strict | Renders pages on the server; the documented Phase 1 stack |
| Rendering | Server components + static generation with **on-demand revalidation** (ISR) | Articles are built once, served from cache, and rebuilt only when an admin publishes or edits |
| Routing | Every public page under `/fr/...` or `/en/...` | One URL per language; Google sees exactly one version per URL |
| i18n | **next-intl**, reading the existing `src/locales/en.json` and `fr.json` | Works in server components; one source of translations |
| Data | Firestore database `afrinia` + Firebase Storage (unchanged) | No data migration needed |
| Auth | Firebase Auth, client-side, as today | Admin/profile pages are not indexed, so they don't need server rendering |
| UI | Tailwind + shadcn/ui + Afrinia design tokens (unchanged) | Components are reused, not rewritten |
| Hosting | Decision D1 (Section 10) | |
| Tests | Vitest (unit), Playwright (browser + SEO), Firestore rules tests (emulator) | Section 11 |

**Architectural rules for the Next.js codebase.**
1. Public pages are server components. `'use client'` only on the interactive leaf (audio player, comment form, language switcher), never on a whole page.
2. Every public page exports `generateMetadata`, built through one shared helper that produces title, description, canonical, `hreflang` alternates and Open Graph together.
3. A missing article or builder calls `notFound()` → real HTTP 404. A moved URL is a real 301/308 redirect, never a client-side `<Navigate>`.
4. The route map (one module) is the only place public URLs are built — used by links, metadata, sitemap, redirects, and revalidation.
5. Public reads cannot return drafts even if code has a bug (Decision D4).
6. Language comes only from the URL. No browser/localStorage language detection for content.
7. `/admin`, `/profile`, `/settings` are client-rendered, `noindex`, and guarded as today; Firestore rules remain the real protection.

---

## 10. NEXT.JS MIGRATION PLAN

**Status legend:** ☐ not started · ◐ in progress · ☑ done (with date). This section is the **plan**; day-to-day progress and evidence are recorded in `CurrentStatus.md` (sections 2–3). Update the phase marks here when a phase closes.

### 10.1 Decisions (approved by the owner 2026-10-02)

| # | Decision | Options | Recommendation | Status |
|---|---|---|---|---|
| D1 | Hosting | (a) **Stay on Netlify** (Next.js runtime) · (b) Move to Vercel (named in SKILLS.md) | (a) — change one thing at a time; the domain, env vars and the existing Netlify Functions (subscribe, send-contact, notify-indexing…) keep working. Vercel can be revisited after cutover. | **Approved 2026-10-02** |
| D2 | i18n library | (a) **next-intl** · (b) keep react-i18next | (a) — native server-component support and locale routing; only one string uses `{{…}}` interpolation to convert. | **Approved 2026-10-02** |
| D3 | Root URL `/` | (a) **`/` permanently redirects to `/fr`**; every page has a language prefix · (b) `/` is the French homepage without prefix | (a) — one rule for every URL; x-default = `/fr`. Never redirect by browser language. | **Approved 2026-10-02** |
| D4 | How public pages read Firestore | (a) **Rules-bound reads** (unauthenticated, like a visitor) · (b) `firebase-admin` (bypasses rules) | (a) — Firestore rules already restrict public reads to `status == 'published'`, so a coding mistake cannot leak a draft. `firebase-admin` is used only where privileged access is required (revalidation auth, existing functions). | **Approved 2026-10-02** |
| D5 | Publish → page refresh | Admin save calls `POST /api/revalidate` with the user's Firebase ID token; the server verifies the token and contributor/admin role, then refreshes the article, both lists, the sitemap and the homepage | Only option that keeps ISR fresh without full rebuilds | **Approved 2026-10-02** |

### 10.2 Phases

Each phase lists **scope**, **tests that must exist and pass**, and **exit criteria**. A phase is done only when every exit criterion is verified with evidence and the owner has approved the merge.

#### M0 — Stabilise the live site (Vite, branches from `main`) ☑ 2026-10-01
Why: the migration takes ~2 weeks; these fixes stop the damage now and carry into Next.js.
- `fix/seo-quick-wins` (8 commits): static homepage canonical/og:url and all Lovable tooling removed from the shell; known routes whitelisted in `public/_redirects`, everything else a true 404 via `dist/404.html` (retired pages like `/services` included — no equivalent content, so 404, not a redirect); `afinia.netlify.app` → 301 to afrinia.org; mixed-case paths → lowercase; sitemap served by its function's own path with real `lastmod` only; baseline security headers; one `SITE_URL` constant; articles no longer declare hreflang to a non-existent same-slug translation; newsletter form stacks on phones; admin screens follow the site language (0 TypeScript/lint errors).
- `fix/comment-email-privacy` (2 commits, stacked on the above): commenter email moved to admin-only `comment_contacts` (atomic batch with the comment); validated comment creation; admin-only moderation; legacy `comments` admin-read. **Rules are published before the frontend.**
- Tests: `npm test` (13 sitemap unit tests), `npm run test:rules` (20 emulator tests; 10 fail on the old rules), `npm run check:site` (124/124 on the draft deploy vs 39/116 on production before), browser runs EN/FR at 320–1280px.
- Exit: `npm run check:site -- --base https://afrinia.org` passes; legacy comment emails not anonymously readable; a test comment with email posts on production, its email stored only in `comment_contacts`, then deleted.
- Not fixable before Next.js: page text still arrives via JavaScript; unknown article slugs under `/fr|en/blog/*` still answer 200; `/blog/:slug` picks a language client-side.

#### M1 — Foundation ☑ 2026-10-02
Entry: D1–D5 approved ☑; `feature/builders-page` merged to `main` ☑; `main` merged into `migration/nextjs`.
Built in three steps so each change can be verified on its own (refined 2026-10-02):
- **Step 1 — React 19 on the current app ☑ 2026-10-02.** The Next.js App Router requires React 19. Upgraded (and the 28 unused UI components that blocked it removed) on the live Vite app and released, so the cutover carries one less change. `UserProfile.language` type errors were fixed in M0.
- **Step 2 — Next.js serves the existing site unchanged ☑ 2026-10-02.** Next.js 16 replaces Vite following the official "migrate from Vite" path. `index.html` → `app/layout.tsx`; `main.tsx` → `src/spa.tsx` + `src/ClientApp.tsx` (browser-only); `src/pages` → `src/views` (Next.js reserves `pages/`). Routing: `proxy.ts` sends every known path (`src/routing/spaRoutes.ts`) to **one** static app shell (`app/page.tsx`); anything else gets Next.js's static 404 (`app/not-found.tsx`) — a per-URL catch-all was rejected because it stores a page per requested URL (random URLs → stored 404s). Redirects in `next.config.ts` (301s kept). Security headers: one list in `config/security-headers.json`, applied by `next.config.ts` (rendered pages) **and** `netlify.toml` (static files, functions) — on Netlify neither reaches the other's responses; a unit test fails if they differ. Netlify Functions (subscribe, send-contact, sitemap…) keep working beside Next.js.
  Exit: `check:site` passes on a draft deploy (146/146 on 2026-10-02); every interactive flow identical in Chrome (EN/FR, 375px + desktop); typecheck/lint/test/test:rules/build green.
- **Step 3 — Foundations ☑ 2026-10-02.** Route map `src/routing/routes.ts` (every function takes the language, so D3 is a one-file change; old helpers delegate to it); metadata helper `src/seo/metadata.ts` (canonical + og:url + hreflang + OG/Twitter together); shared document mappers (`mappers.ts`) and Firebase identifiers (`publicConfig.ts`) used by browser and server; server readers `src/server/content/*` (anonymous Firestore REST, `server-only`, Next.js cache tags for D5) with the SAME article cleaner run on jsdom; Vitest (`npm test`), emulator integration tests (`npm run test:integration` — proves D4: drafts never returned, an unfiltered query is refused), Playwright (`npm run test:e2e`), `npm run seo:check` (rules unit-tested).
  Exit (met on draft 2026-10-02): unit 66, integration 9, rules 45, e2e 25, check:site 146/146; seo:check reports the baseline **1/44** (= production) — M2 must reach 44/44.
- next-intl (D2) is installed in M2, together with the first server-rendered text, so it is never added unused.

#### M2 — Public content pages (the SEO core) ☐
Entry: M1 ☑ — `migration/nextjs` has the route map, `buildMetadata`, server readers (`src/server/content/*`), and the gates (`seo:check` baseline 1/44, Playwright 25/25, check:site 146/146). Work on `migration/m2-*` branches cut from `migration/nextjs`, in the worktree `../AfriniaOrg-nextjs`.
Build order (each step is its own branch + draft-verified merge; the page moves from the app shell to a real server route, and `proxy.ts`/`spaRoutes.ts` lose that path):
1. **i18n + locale layout:** install next-intl (D2) reading `src/locales/*.json` (convert i18next `{{x}}` to `{x}` for the strings server pages use); `app/[locale]/layout.tsx` with `<html lang={locale}>`; only `fr` and `en` are valid locales (others → 404). Header/Footer rendered on the server where possible (interactive parts stay client islands).
2. **Article page `/[locale]/blog/[slug]`** — the highest-value page: full body in raw HTML (via `getPublishedPost`, already sanitized), `generateMetadata` via `buildMetadata` (type article, dates, image), JSON-LD `Article` + `BreadcrumbList`, `notFound()` for unknown/unpublished slugs, static params for published posts + on-demand cache. Comments, audio player and share stay client islands, mounted on the server-rendered page.
3. **Blog listings `/[locale]/blog`** (hreflang pair via `listingAlternates`; category filter keeps working).
4. **Builders `/[locale]/builders` and `/[locale]/builders/[slug]`.**
5. **Home, about, audio, contact, privacy, terms, unsubscribed** — moving under `/fr` and `/en` (D3): the route map changes in one place; `/` → 308 `/fr`; old unprefixed URLs (`/about`, `/audio`, `/contact`, `/privacy`, `/terms`) → 301/308 to `/fr/...` (permanent redirects, tested).
6. **Article translations:** a `translation_slug` field on posts (editor + Firestore) so an article can declare its real counterpart (hreflang). Until then articles declare no pair.
- Per page: loading, empty and error states (`loading.tsx`, `error.tsx`, `not-found.tsx`, translated); design identical to today at 375px and desktop; `'use client'` only on interactive leaves (§9 rule 1).
- Tests per step: unit tests for any new mapping/metadata logic; Playwright specs per page type (EN/FR, desktop + 375px); `seo:check` on the draft must not regress and the pages moved in that step must pass all rules.
- Exit: `npm run seo:check -- --base <draft>` → **44/44** (every sitemap URL: 200, own canonical, hreflang where paired, correct lang, unique title, one H1, body text without JS, Article JSON-LD on articles; unknown slugs 404); check:site and Playwright green; no console errors.

#### M3 — Interactive islands ☐
- Client components only where interaction is needed: audio player (`useAudioPlayer`) + mini-player, comments (read + post), newsletter subscribe + popup, contact form, language switcher (links to the translated URL, not a toggle), social share, GA4 page-view tracking on route change.
- Tests: Playwright flows for each island in EN and FR; network assertions that subscribe/contact hit their functions.
- Exit: every interaction that works on the live site works on the preview; no console errors; JavaScript for article pages measurably smaller than today's 1.7 MB bundle.

#### M4 — Auth and admin ☐
- Sign in/up/out, reset password, profile, settings — client-rendered, `noindex`.
- `/admin` shell client-rendered, lazy-loaded (Quill and admin code never ship to public pages); `AdminRoute` guard as today.
- `POST /api/revalidate` (D5) wired into post/builder/audio save, publish, unpublish and delete; `notify-indexing` call kept.
- Tests: unit tests for the revalidate handler (rejects missing/invalid token, rejects viewer role, accepts contributor/admin); Playwright: publish on the preview → article reachable with fresh content without a rebuild.
- Exit: full editorial loop (create → publish → visible in raw HTML → edit → updated → unpublish → 404) works on the preview in both languages.

#### M5 — SEO infrastructure ☐
- `app/sitemap.ts` and `app/robots.ts` built from the route map (replaces the sitemap Netlify Function), real `lastmod`, EN/FR alternates.
- Redirect map from every old URL (`/about`, `/builders`, `/audio`, `/contact`, legacy routes, `/blog/:slug`) to its new URL with 301/308, tested.
- Open Graph images per article (featured image, with a branded fallback), `Organization` + `WebSite` JSON-LD on home.
- Exit: `seo:check` passes on all sitemap URLs and on the redirect list; Google Rich Results Test passes on 3 sample articles (manual, evidence recorded).

#### M6 — Hardening ☐
- Content-Security-Policy (allowing only GA, Firebase, Storage, fonts actually used), security headers carried over from M0.
- `npm audit` — no critical/high vulnerabilities in production dependencies; remove dead code (Supabase files, unused auth modals).
- Performance: Lighthouse on article + home, mobile profile — Performance ≥ 90, SEO = 100, Accessibility ≥ 90; images via `next/image` with correct sizes.
- Firestore/Storage rules re-reviewed against the new code (role checks for uploads).
- Exit: numbers recorded in this section; no console errors on any page.

#### M7 — Cutover and monitoring ☐
- Before: record the current production deploy ID on Netlify (instant rollback target); confirm all env vars exist in the production context; full `seo:check` + Playwright suite on the final preview.
- Merge `migration/nextjs` → `main`; production deploy.
- After (same day): `seo:check` against https://afrinia.org; spot-check redirects; submit sitemap in Search Console; "Validate fix" on Soft 404, Duplicate canonical, Crawled-not-indexed; URL-inspect 3 articles ("View crawled page" shows the article text).
- Rollback trigger: any public page failing, forms broken, or admin unable to publish → republish the recorded deploy, then diagnose.
- Monitoring for 4 weeks: weekly indexed/not-indexed counts and impressions recorded here.
- Exit: indexed count rising, no new Soft 404 / duplicate-canonical entries.

### 10.3 Progress log
Moved to `CurrentStatus.md` section 3 (newest first, with evidence) — one place for progress.

---

## 11. TESTING STANDARDS

Tests exist to prove a claim, not to raise a number. Each layer answers a different question:

| Layer | Tool | Answers | Lives in |
|---|---|---|---|
| Unit | Vitest (`npm test`; on `main` until cutover: Node's runner) | Is this function correct? (sitemap, route map, metadata, sanitizer, mappers, seo rules, revalidate auth) | `tests/unit/` and next to the code (`*.test.ts`) |
| Integration | Vitest + Firestore/Storage emulators (`npm run test:integration`) | Do the server content readers return exactly what the rules allow a visitor to see? | `tests/integration/` |
| Rules | `@firebase/rules-unit-testing@3` + Firestore emulator (`npm run test:rules`, project `demo-afrinia`, port 8085) | Can a visitor/viewer/contributor/admin do exactly what they should — and nothing more? | `tests/rules/` |
| Browser | Playwright | Does the feature work for a real user in EN and FR, at 375px and desktop? | `tests/e2e/` |
| HTTP | `scripts/check-live-site.mjs` (`npm run check:site -- --base <url>`) | Do status codes, redirects, security headers, raw head tags and the sitemap behave as intended on a real Netlify deploy? | `scripts/` |
| SEO | `scripts/seo-check.mjs` (`npm run seo:check -- --base <url>`; no JavaScript, like a crawler; rules in `scripts/lib/seo-rules.mjs`) | Does the raw HTML of every public URL carry its content, canonical, language and correct status? | `scripts/` |

Rules:
- Every bug fix adds a test that fails before the fix and passes after.
- Uncommitted work never lives in a temporary/scratch folder (it is wiped when a session restarts); back it up beside the repo or commit once approved.
- Tests never write to the production Firestore. Writes are tested against the emulator; browser tests against production data are read-only.
- A phase's exit criteria cite the command that was run and its result.
- A check passes when its command exits 0. Never infer success from one line of output (2026-10-02: "Tests 66 passed" hid "1 failed file").
- Never automate logins against production Firebase (rate-limited after repeated attempts); login messages are a manual, one-off check.
