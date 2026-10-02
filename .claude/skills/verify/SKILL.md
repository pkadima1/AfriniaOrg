---
name: verify
description: How to run and drive the Afrinia app locally and on deploy previews/production to verify changes end-to-end — browser flows, raw-HTML SEO checks (what crawlers see), and the per-phase gates of the Next.js migration.
---

# Verifying Afrinia changes

Two questions must be answered for any public-page change:
1. **Does it work for a person?** → drive it in a real browser (Playwright).
2. **Does it work for a crawler?** → read the raw HTML with no JavaScript (curl / `seo:check`).

A page that passes 1 but fails 2 is not done. See CLAUDE.md Sections 5, 10, 11.

Which app am I verifying? Check the branch:
- `main`, `fix/*`, `feature/*` from main → **Vite app** (until cutover, M7).
- `migration/*` → **Next.js app**.

---

## A. Launch

### Vite app (current production)
- `npm run dev` → **http://localhost:8080** (background it; poll `curl -s -o /dev/null -w '%{http_code}' http://localhost:8080/` until 200).
- Netlify Functions (subscribe, send-contact, sitemap…) need `netlify dev` → http://localhost:8888, not plain Vite.
- Checks (all must pass): `npm run typecheck` (0 errors), `npm run lint` (0 errors; warnings are pre-existing), `npm test` (unit), `npm run test:rules` (Firestore emulator, `demo-afrinia`, port 8085 — no production access), `npm run build`.

### Netlify routing — only a draft deploy tells the truth
Verified 2026-09-30 (M0). Routing, redirects, headers and function paths must be checked on a **Netlify draft deploy**, not locally:
- `netlify deploy --build --message "<what> — not production"` (no `--prod`) builds and uploads to a private URL `https://<deploy-id>--afinia.netlify.app`, sent with `x-robots-tag: noindex`. Production is untouched. Then `npm run check:site -- --base <that URL>`.
- `netlify serve` / `netlify dev` do **not** route like production: they ignored the old `/sitemap.xml` → function rewrite. Never sign off routing from them.
- Any rule in `public/_redirects` that matches a path beats a function's `config.path`: a `/*` catch-all swallowed `/sitemap.xml`. Unknown URLs get a 404 from `dist/404.html` instead (emitted by `vite.config.ts`).
- Netlify CLI deploys rewrite `deno.lock`; run `git checkout deno.lock` afterwards.
- Never keep uncommitted work in the session scratchpad (e.g. a git worktree there) — it is wiped when a session restarts.

### Next.js app (migration branches, worktree `../AfriniaOrg-nextjs`)
- `npm run dev` → `next dev` on **http://localhost:8080**. Production build: `npm run build && npm run start` (port 8080; use `npx next start -p 3100` to run beside a dev server).
- **Behaviour like production (statuses, redirects, caching) only in the production build** — never sign off from `next dev`.
- `next start` does not run Netlify Functions: locally `/sitemap.xml` is 404 (8 expected `check:site` failures). Everything else must pass locally; the draft deploy must pass 100%.
- macOS disks ignore letter case: if Next.js ever stores per-URL pages again, `/Terms` and `/terms` collide locally. The app-shell design (one stored page) avoids it — check `.next/server/route-cache` stays at 2 pages after requesting random URLs.
- Netlify + Next.js facts (draft deploys, 2026-10-02): `next.config` headers reach rendered pages only; `netlify.toml` headers reach static files and functions only — both carry `config/security-headers.json` (unit-tested). Netlify Functions with `config.path` (the sitemap) still win over Next.js routes. Deploy logs show `Using Next.js Runtime - v5.x`.
- Scripts: `npm run typecheck` (`tsc --noEmit`), `npm run lint` (ignores `.next/`, `.netlify/`, test reports), `npm test` (Vitest: `tests/unit/` + `src/**/*.test.ts`), `npm run test:rules` (rules, emulators), `npm run test:integration` (server content readers vs emulators with real rules), `npm run test:e2e` (Playwright, see below), `npm run check:site -- --base <url>`, `npm run seo:check -- --base <url> [--summary]`.
- **Playwright:** `npm run build` then `npm run test:e2e` (starts `next start -p 3100` itself), or `E2E_BASE_URL=<draft or https://afrinia.org> npm run test:e2e` — read-only flows, desktop + 375px. Uses installed Chrome.
- **Judge every check by its exit code** (`cmd; echo $?`), never by one summary line — Vitest once printed "Tests 66 passed" while a test FILE failed.
- **Never automate logins against production Firebase.** Repeated wrong sign-ins got this machine rate-limited ("Trop de tentatives…", 2026-10-02). The translated wrong-password message is a manual check: one attempt with a made-up address.
- **seo:check** ignores Netlify's `X-Robots-Tag: noindex` on draft hosts (`<id>--afinia.netlify.app`) — it is added on purpose; a meta-robots noindex is still caught. Baseline 2026-10-02: 1/44 on both production and draft.
- The emulator prints "Unexpected rules runtime error: WARNING … sun.misc.Unsafe" on Java 26 — a JVM deprecation notice, not a failure.

### Data safety (both apps)
- Local runs talk to the **real production Firestore** (named database `afrinia`). Reads are safe. **Never write/create/delete documents as part of verification.** Writes (comments, rules changes, publish flows) are tested against the Firestore emulator (`firebase emulators:start --only firestore`) or on a deploy preview with an explicitly created test post that is deleted afterwards — and only with the owner's OK.

---

## B. Crawler view — raw HTML checks

This is what Googlebot's first pass, Bing, and link previews (LinkedIn, WhatsApp, X) see.

### Manual recipe (works today on any URL)
```bash
U=https://afrinia.org/fr/blog/<slug>          # or http://localhost:8080/...
curl -s -A "Googlebot/2.1" -o raw.html -w "%{http_code} %{size_download}B\n" "$U"
grep -o '<html[^>]*>' raw.html                           # lang must match the URL language
grep -o '<title>[^<]*' raw.html                          # page-specific title
grep -o '<link rel="canonical"[^>]*>' raw.html           # must equal $U (not the homepage)
grep -o '<link rel="alternate"[^>]*hreflang[^>]*>' raw.html
grep -c '<h1' raw.html                                   # exactly 1
python3 -c "import re;h=open('raw.html').read();t=re.sub(r'<script.*?</script>|<style.*?</style>','',h,flags=re.S);print(len(re.sub('<[^>]+>',' ',t).split()),'words without JS')"
```
Status codes: `curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' <url>` — unknown URL must be `404`; legacy URL must be `301`/`308` with the right target.

**Baseline recorded 2026-09-29 (Vite, production):** every URL → 200, 5,058 B, empty `<div id="root"></div>`, canonical `https://afrinia.org/`, `lang="fr"`, ~0 words. `/this-page-does-not-exist` and `/services` → 200 (soft 404).

### Before publishing Firestore/Storage rules — compare with what is LIVE
The repo is not the only source of rules: a feature branch may have published its own. Publishing from another branch silently deletes them (happened 2026-10-01: M0's release removed the live builders/contact rules). Before any `firebase deploy --only firestore:rules` or `--only storage`:
```bash
T=$(gcloud auth print-access-token); H="x-goog-user-project: modified-hull-203004"
R=https://firebaserules.googleapis.com/v1/projects/modified-hull-203004
for rel in cloud.firestore/afrinia firebase.storage/modified-hull-203004.firebasestorage.app; do
  rs=$(curl -s -H "Authorization: Bearer $T" -H "$H" "$R/releases/$rel" | python3 -c "import json,sys;print(json.load(sys.stdin)['rulesetName'])")
  curl -s -H "Authorization: Bearer $T" -H "$H" "https://firebaserules.googleapis.com/v1/$rs" \
    | python3 -c "import json,sys;print(''.join(f['content'] for f in json.load(sys.stdin)['source']['files']),end='')" > /tmp/live-$(echo $rel | cut -d/ -f1).rules
done
diff /tmp/live-cloud.firestore.rules firestore.rules; diff /tmp/live-firebase.storage.rules storage.rules
```
Every difference must be one this release intends. Rule tests: `npm run test:rules` (Firestore + Storage emulators via `firebase.test.json`, project `demo-afrinia`, files run one at a time because they share one emulator).

### `scripts/check-live-site.mjs` — exists since M0
`npm run check:site -- --base <origin>`: 200s for every app route and two sitemap articles; real 404 (with the app shell) for unknown and retired URLs; `/blog` → 301 `/fr/blog`; no static canonical/og:url or `gptengineer` in raw HTML; security headers on page, asset and robots.txt; JS served as JavaScript; sitemap well-formed with no invented `lastmod`. With `--base https://afrinia.org` it also checks that `afinia.netlify.app`, `www` and `http` 301 to `https://afrinia.org`. Keep its `KNOWN_ROUTES` in sync with `src/App.tsx` and `public/_redirects`.

### `scripts/seo-check.mjs` — spec (implemented in M1)
Usage: `npm run seo:check -- --base <origin> [--urls file]`. Without `--urls`, it reads `<origin>/sitemap.xml`. For each URL, fetch with a Googlebot user agent and **no JavaScript**, and fail the run (exit code 1, per-URL report) unless:
- status is 200 and there is no `noindex`;
- `<html lang>` equals the URL's locale segment;
- `<title>` is non-empty and unique across the run; meta description present;
- canonical equals the URL itself (absolute, `https://afrinia.org`, no trailing variations);
- `hreflang` alternates are present and reciprocal where a translation exists, plus `x-default`;
- exactly one `<h1>`;
- visible text without scripts ≥ 150 words on article pages, ≥ 50 on other pages;
- article pages contain a valid `application/ld+json` `Article`.
Negative checks (built-in list): a random unknown path → 404; an unknown article slug in each locale → 404; each legacy/old URL in the redirect map → 301/308 to the expected target.

### Rendered view (what Google sees after JavaScript)
```bash
BIN=$(find ~/Library/Caches/ms-playwright -name chrome-headless-shell -type f | head -1)
"$BIN" --headless --disable-gpu --virtual-time-budget=15000 --dump-dom "$U" > rendered.html
```
Compare with `raw.html`: after migration, raw and rendered must carry the same title, canonical and body text.

---

## C. Person view — drive with Playwright

- Playwright is not yet a project dependency (added in M1). Until then: `npm init -y && npm i playwright` in the scratchpad, then `chromium.launch({ channel: 'chrome' })` (system Chrome, no browser download).
- **Use `waitUntil: 'domcontentloaded'` + a ~5s settle wait, never `networkidle`** — Firebase/GA keep persistent connections so networkidle always times out.
- Firestore data arrives async on the Vite app: assert after the settle wait. On Next.js public pages, content is in the HTML at load — assert immediately; only islands (comments, player) load later.
- Always run each flow in **EN and FR**, and at **375px** and desktop width. Collect `page.on('console')` errors; any new error fails the check.

### Gotchas learned
- React controlled `<input type="range">`: programmatic `el.value = x` + dispatch is swallowed by React's value tracker. Use the native setter:
  `Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,'30')` then dispatch `input` + `change`.
- Audio player buttons flip their `aria-label` between the listen label and "Pause" — match both in locators.
- Pre-existing console noise on the Vite app (not regressions): React `fetchPriority` prop warning on BlogPost featured image.
- Next.js hydration warnings ("Text content does not match") are real bugs, not noise — usually a date/locale formatted differently on server and client.

### Flows worth driving
- Homepage → audio episode rows (`.afrinia-episode`), click to play (bottom bar appears), toggle pause, close (✕, `button[title="Close player"]`).
- Audio page → episode cards, click → bottom-bar player.
- Article page (`/fr/blog/<slug>`, `/en/blog/<slug>`) → body, featured image, share buttons, comments list; inline audio player renders only when a published episode in `audio_{lang}` has `post_slug == slug`. To verify the player UI without writing to prod, temporarily stub `fetchEpisodeForPost` to return `fetchAudioEpisodes(lang,1)[0]`, drive, then revert.
- Language switcher → must land on the **translated URL** of the same page (Next.js), not just flip text.
- Builders list → profile page → linked articles.
- Newsletter form → POST `/.netlify/functions/subscribe` (probe production with an invalid email → expect 400; never subscribe real addresses).
- Contact form → probe with invalid input → expect validation error; do not send real messages.
- Admin (M4+): sign in as a test contributor on a deploy preview only.

---

## D. Phase gates (Next.js migration — CLAUDE.md Section 10)

Record each command and its result in CLAUDE.md §10.3 when a phase closes.

| Phase | Must pass before asking the owner to approve the merge |
|---|---|
| **M0** | Before release: `npm test`, `npm run test:rules` (20/20), `check:site` 124/124 on a draft deploy. Release: Firestore rules first, then frontend. After: `npm run check:site -- --base https://afrinia.org` passes; anonymous REST read of `comments` (legacy) is denied; one owner-approved test comment with email posts on production, the public doc has no email, then both docs are deleted. |
| **M1** | `typecheck`, `lint`, `test` green; `build` succeeds; deploy preview serves `/fr` and `/en` with correct raw `lang`, title, canonical; `seo:check` runs (even if only on the home URLs). |
| **M2** | `seo:check --base <preview>` passes for **every** sitemap URL + negative checks; Playwright page tests pass EN/FR at 375px and desktop; visual comparison with production screenshots for home, article, list, builders. |
| **M3** | Playwright flows for player, comments (read; post only on emulator), subscribe (invalid email → 400), contact, language switcher, share; GA4 `page_view` fires on navigation (network assertion on `collect` requests); no console errors. |
| **M4** | Revalidate-handler unit tests (no token → 401, viewer → 403, contributor/admin → 200); on the preview: publish a test post → appears in raw HTML without rebuild → edit reflected → unpublish → 404; test post deleted afterwards. |
| **M5** | `seo:check` on sitemap + full redirect map; `robots.txt` and `sitemap.xml` valid; Rich Results Test passes on 3 articles (record links). |
| **M6** | CSP header present and no CSP violations in console across all flows; `npm audit --omit=dev` has no critical/high; Lighthouse mobile (article + home): Perf ≥ 90, SEO 100, A11y ≥ 90. |
| **M7** | Pre-cutover: full suite on final preview, env vars confirmed, rollback deploy ID recorded. Post-cutover: `seo:check --base https://afrinia.org` passes; Search Console URL inspection of 3 articles shows article text in "View crawled page". |
