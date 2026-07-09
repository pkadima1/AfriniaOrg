---
name: verify
description: How to run and drive the Afrinia app locally to verify changes end-to-end in a real browser.
---

# Verifying Afrinia changes at the browser surface

## Launch
- `npm run dev` → Vite on **http://localhost:8080** (background it; poll `curl -s -o /dev/null -w '%{http_code}' http://localhost:8080/` until 200).
- The dev server talks to the **real production Firestore** (named `afrinia` database). Reads are safe; never write/create documents as part of verification (client writes need contributor auth anyway).

## Drive with Playwright
- Playwright is not a project dep — `npm init -y && npm i playwright` in the scratchpad, then `chromium.launch({ channel: 'chrome' })` (system Chrome, no browser download).
- **Use `waitUntil: 'domcontentloaded'` + a ~5s settle wait, never `networkidle`** — Firebase/GA keep persistent connections so networkidle always times out.
- Firestore data arrives async: assert after the settle wait, not on load.

## Gotchas learned
- React controlled `<input type="range">`: programmatic `el.value = x` + dispatch is swallowed by React's value tracker. Use the native setter:
  `Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,'30')` then dispatch `input` + `change`.
- Audio player buttons flip their `aria-label` between the listen label and "Pause" — match both in locators.
- Pre-existing console noise (not regressions): React `fetchPriority` prop warning on BlogPost featured image; tsc errors for `UserProfile.language` in PopupTemplateAdmin/NewsletterAdmin.

## Flows worth driving
- Homepage `/` → audio episode rows (`.afrinia-episode`), click to play (bottom bar appears), toggle pause, close (✕, `button[title="Close player"]`).
- `/audio` → episode cards (cursor:pointer, border-radius 8px), click → bottom-bar player.
- `/fr/blog/<slug>` or `/en/blog/<slug>` → article page; the inline audio player renders only when a published episode in `audio_{lang}` has `post_slug == slug`. To verify the player UI without writing to prod, temporarily stub `fetchEpisodeForPost` to return `fetchAudioEpisodes(lang,1)[0]`, drive, then revert.
- Newsletter form → POST `/.netlify/functions/subscribe` (functions need `netlify dev`, not plain vite; or probe production with an invalid email → expect 400).
