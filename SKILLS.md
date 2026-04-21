# SKILLS.md — Afrinia Project Intelligence

> Last updated: April 2026
> This file defines what Afrinia is, what it is being built to become, and the technical and strategic skills any collaborator (human or AI) must bring to contribute effectively.

---

## 1. WHAT AFRINIA IS

Afrinia is Africa's first bilingual (French/English) opportunity intelligence platform.

It starts as a curated content destination — articles and audio covering African business, tech, finance, and innovation. It evolves into an interactive decision environment where every signal becomes a guided intelligence session, helping founders, investors, diaspora, and policymakers understand and act on African opportunities.

**The one-sentence pitch:**
> Afrinia is what Perplexity AI would be if it was built by Africans, for Africa, in both French and English — grounded in African sources, not Western assumptions.

---

## 2. WHAT AFRINIA IS NOT

- NOT a custom-trained LLM. Afrinia is a RAG system (Retrieval-Augmented Generation) — using existing models (Claude, GPT-4) pointed at curated African sources.
- NOT a generic AI news aggregator.
- NOT a translation of English content into French. It is a bilingual-first platform with separate, adapted content ecosystems.
- NOT a social media platform. Community features support the intelligence mission; they don't replace it.

---

## 3. THE 5-PHASE ROADMAP (TECHNICAL NORTH STAR)

### Phase 1 — Authority Engine (Months 1–6) ← CURRENT PHASE
**Goal:** Build content credibility and SEO authority before adding any complexity.
- Bilingual blog (EN + FR) on Next.js, deployed on Vercel
- Firebase Firestore as the content database
- Auto-publishing pipeline via EngagePerfect (EP)
- Newsletter capture to Firestore
- Simple admin panel at `/admin` for content entry
- No AI features. No user accounts. No payments.
- KPI: 2 articles/week per language, measurable organic traffic growth

### Phase 2 — Community Layer (Months 7–12)
**Goal:** Build the audience layer that future intelligence features will serve.
- Firebase Auth (email + Google Sign-In)
- User profiles with language preference and country
- Bookmarking, reactions, comments on articles
- FR Facebook Group as primary community engine
- EN Facebook Page as passive auto-publish channel
- Newsletter system (Resend or Brevo API)
- KPI: 500 registered users, 1,000 newsletter subscribers

### Phase 3 — Audio & Signal Intelligence (Months 12–18)
**Goal:** Add audio layer and begin structured signal publishing.
- Podcast publishing pipeline (Buzzsprout or RSS feed hosted on Vercel)
- Structured "Signal Cards" — not just articles, but short-form intelligence briefs
- Signal taxonomy: Policy / Investment / Startup / Market / Regulation
- EN/FR signal mirroring
- KPI: 2 podcasts/month, 50 signal cards published

### Phase 4 — AI Intelligence Layer (Months 18–24)
**Goal:** Add the RAG answer engine. Afrinia becomes queryable.
- RAG pipeline: Tavily + Firecrawl + Exa for live African source retrieval
- Claude or GPT-4 as the reasoning layer
- Bilingual query input → bilingual cited answers
- Source transparency: every answer cites the African source
- Tiered access: Free (3 queries/day) → Pro ($9/month, unlimited)
- KPI: 100 paid subscribers, answer engine used daily

### Phase 5 — Intelligence OS (Month 24+)
**Goal:** Afrinia becomes the infrastructure layer, not just a product.
- API access for third-party developers building on African intelligence
- LMS: African AI and entrepreneurship courses
- Institutional tier (embassies, VCs, NGOs, ministries)
- White-label intelligence reports
- KPI: Revenue > $10K MRR, B2B contracts signed

---

## 4. TECHNICAL SKILLS REQUIRED (BY PHASE)

### Phase 1 — Foundation Stack
| Skill | Purpose |
|---|---|
| **Next.js (App Router)** | SSR, SEO-optimized routing, bilingual routing via `[locale]` |
| **Firebase Firestore** | Content database, newsletter subscriber storage |
| **Vercel** | Deployment, edge functions, environment variables |
| **TypeScript** | Type safety across all components |
| **Tailwind CSS** | Styling — using Afrinia design tokens (see Section 6) |
| **next-intl** | i18n routing and translation management |
| **Resend or Brevo API** | Email delivery for newsletter subscribers |
| **GitHub** | Version control, CI/CD via Vercel GitHub integration |

### Phase 2 — Community Stack (adds to Phase 1)
| Skill | Purpose |
|---|---|
| **Firebase Auth** | User accounts, Google Sign-In |
| **Firestore security rules** | Protect user data and admin routes |
| **React Context / Zustand** | Global auth state management |
| **Stripe (preparation only)** | Set up early; activate in Phase 4 |

### Phase 4 — AI Intelligence Stack (adds to Phase 2)
| Skill | Purpose |
|---|---|
| **Tavily API** | Real-time web search grounded in African sources |
| **Firecrawl API** | Scrape and extract full article content for RAG |
| **Exa API** | Company, startup, and people research (Africa-focused) |
| **LangChain or Vercel AI SDK** | RAG pipeline orchestration |
| **Claude API or OpenAI API** | Language model for reasoning and answer generation |
| **Pinecone or pgvector** | Vector store for semantic retrieval |
| **Streaming responses** | Real-time answer delivery in the UI |

---

## 5. CONTENT SKILLS REQUIRED

### Editorial Standards
- All content must exist in both EN and FR. Not translated — **adapted**. Tone, examples, and references should feel native to each language audience.
- EN audience: Pan-African diaspora, international investors, English-speaking African markets (Nigeria, Ghana, Kenya, South Africa)
- FR audience: Francophone African markets (Côte d'Ivoire, Senegal, Cameroon, DRC, Morocco, Guinea) — **this is the higher-opportunity, lower-competition lane**

### Content Pillars
1. **African Tech & Startups** — Funding rounds, founder stories, ecosystem moves
2. **African Finance & Markets** — Currency, trade, banking, fintech
3. **African Policy & Governance** — Regulatory shifts, government programs, AfCFTA
4. **African Innovation** — Agriculture tech, energy, health, education
5. **Diaspora Intelligence** — Remittances, investment from outside, cultural economy

### Content Workflow (Phase 1)
1. Identify signal (news, report, funding announcement)
2. Draft long-form article in EN using EngagePerfect (EP)
3. Adapt to FR using EP bilingual mode
4. Publish to Firestore via admin panel
5. Auto-post to Facebook Page (EN) and Facebook Page (FR)
6. FR content → FR Facebook Group for community discussion

### SEO Skills Required
- Keyword research for African business/tech topics in both EN and FR
- Internal linking between signal articles
- `sitemap.xml` and `robots.txt` configured and pointing to the correct canonical domain
- Structured data (JSON-LD) for articles, with per-page BlogPosting schema
- Core Web Vitals optimization (Next.js Image, font loading)

---

## 6. AFRINIA DESIGN SYSTEM (NEVER DEVIATE)

These are the canonical design tokens. Every UI component must use these.

```css
:root {
  --bg:        #0f172a;   /* Deep navy — primary background */
  --bg2:       #131f35;   /* Slightly lighter navy — card backgrounds */
  --bg3:       #1a2744;   /* Section backgrounds */
  --gold:      #B8912A;   /* Afrinia gold — primary accent, CTAs, borders */
  --gold-lt:   #d4a83a;   /* Lighter gold — hover states */
  --cream:     #F5F0E8;   /* Primary text color */
  --muted:     #8a9bb5;   /* Secondary text, metadata */
  --border:    rgba(184,145,42,0.18); /* Subtle gold borders */
  --serif:     'Cormorant Garamond', Georgia, serif; /* Display headings */
  --sans:      'Jost', 'Helvetica Neue', sans-serif; /* Body, UI elements */
}
```

**Design Principles:**
- Dark-first. Deep navy is non-negotiable as the primary background.
- Gold is used sparingly — for emphasis, borders, tags, and primary CTAs only.
- Typography: Cormorant Garamond for all editorial display text. Jost for all UI and body.
- No gradients unless extremely subtle. No bright colors. No rounded corners > 4px.
- The aesthetic is: *African intelligence meets editorial luxury*. Think The Africa Report meets Perplexity.

**Component Patterns:**
- Tags: 10px Jost, 500 weight, 2.5px letter-spacing, uppercase, gold color, 1px gold border
- Buttons (primary): gold background, dark text, 11px Jost, 2.5px letter-spacing, uppercase
- Buttons (secondary): outline, gold border, gold text, same typography
- Cards: bg2 background, gold border-left or bottom accent, cream headline, muted metadata
- Section dividers: 40px wide, 1px height, gold, 50% opacity

---

## 7. STRATEGIC RULES (NON-NEGOTIABLE)

1. **FR-first in Francophone markets.** The Francophone African business intelligence space is nearly empty. That is the competitive advantage. Never deprioritize French content or community.

2. **Validate before building.** No new feature gets built without evidence users want it. Traffic and engagement data from Phase 1 must inform every Phase 2 decision.

3. **Repurpose, don't create from scratch.** EngagePerfect (EP) is the content engine. Every article should flow from EP. Afrinia is also a live case study for EP's capabilities.

4. **Keep WordPress running passively** during the Phase 1→2 transition. Do not redirect or kill it until the Next.js version has at least 3 months of SEO data.

5. **Separate language ecosystems.** Never mix EN and FR in the same post, group, or feed. Each language has its own complete content experience.

6. **Infrastructure before community.** Firebase Auth must be added before any community features. Adding auth after users exist is dangerous and messy.

7. **The RAG engine is Phase 4, not Phase 1.** Do not build AI features before content authority and user base exist. The intelligence layer needs signal data and user context to be useful.

---

---

## 8. GOOGLE ANALYTICS & SEARCH CONSOLE — CURRENT STATUS & WORK PLAN

> Last audited: April 21, 2026
> Branch for this work: `GoogleAnalyticsSetUp`

This section is the structured work log for getting Afrinia fully instrumented on GA4 and visible to Google Search. It documents what was found, what needs to be fixed, and in what order — so that any session can pick up exactly where the last one left off.

---

### 8.1 What Was Found (Audit Results)

#### Google Analytics (GA4)
**Measurement ID:** `G-E21VHKPP97`
**Stream:** Afrinia (ID: 14346647168)
**Firebase project:** modified-hull-203004

| Finding | File | Severity |
|---------|------|----------|
| Firebase Analytics initialized via `getAnalytics(firebaseApp)` — basic page load fires | `src/integrations/firebase/config.ts:49` | ✅ Working |
| **No SPA route-change tracking** — GA4 only sees the first page load. Every navigation between pages (Home → Blog → Article) is invisible to Analytics | `src/App.tsx` | 🔴 Critical |
| **No custom events** — blog article opens, audio plays, audio pauses, comment submissions all fire zero GA4 events | `src/pages/BlogPost.tsx`, `src/pages/AudioPage.tsx` | 🟠 High |
| **Enhanced Measurement is toggled OFF** in GA4 stream settings — scroll depth, outbound clicks, site search are not collected | GA4 Console (manual toggle) | 🟠 High |
| **AudioPage has no page meta** — title and description never change on the audio page, so GA4 and Google both see it as the homepage | `src/pages/AudioPage.tsx` | 🟡 Medium |

#### Google Search Console (GSC)
**Property:** `https://afrinia.org/`

| Finding | File | Severity |
|---------|------|----------|
| **Wrong domain in sitemap** — all URLs use `afrinia.com` but site is served on `afrinia.org`. Google cannot match crawled URLs to sitemap entries | `public/sitemap.xml` | 🔴 Critical |
| **Wrong domain in robots.txt** — sitemap pointer says `afrinia.com/sitemap.xml` | `public/robots.txt` | 🔴 Critical |
| **Wrong sitemap filename submitted to GSC** — user submitted `/sitemap_index.xml` which does not exist. React SPA serves the HTML shell instead, causing "Sitemap is HTML" error | GSC Console (manual fix) | 🔴 Critical |
| **Wrong canonical domain in index.html** — `og:url` is `https://afrinia.com/` | `index.html:19` | 🟠 High |
| **Zero blog posts in sitemap** — Firestore articles are dynamic and cannot be listed statically. No mechanism exists to generate URLs for published posts | `public/sitemap.xml` | 🟠 High |
| **6 pages indexed, 9 not indexed** — caused by the domain mismatch and missing sitemap coverage | GSC Console | Result of above |

---

### 8.2 Fix Plan (Ordered by Priority)

Work through these in order. Do not skip a step. Each fix depends on the previous being correct.

#### STEP 1 — Fix the domain everywhere (afrinia.com → afrinia.org)
**Why first:** Everything else (sitemap submission, canonical URLs, GA4 data correlation) depends on the domain being consistent. If the sitemap says `afrinia.com` and the site lives at `afrinia.org`, every other fix is built on a broken foundation.

Files to change:
- `public/sitemap.xml` — replace all `https://afrinia.com` with `https://afrinia.org`
- `public/robots.txt` — update sitemap pointer to `https://afrinia.org/sitemap.xml`
- `index.html` — update `og:url` to `https://afrinia.org/`

**After this step:** All static URL references are consistent with the live domain.

---

#### STEP 2 — Fix the sitemap structure
**Why second:** Once the domain is correct, the sitemap needs to be a valid XML document that Google can parse and that correctly represents the site's pages.

Tasks:
- Confirm `public/sitemap.xml` is served at `https://afrinia.org/sitemap.xml` (Vite/Netlify serves `public/` as root)
- Add missing static pages to the sitemap: `/audio`, `/builders`
- Remove pages from sitemap that are excluded in robots.txt: `/admin/*`, `/profile`, `/settings`
- Keep legal pages (`/privacy`, `/terms`) in the sitemap — they are indexable

**After this step:** Go to GSC → Sitemaps → delete the broken `sitemap_index.xml` entry → submit `sitemap.xml`.

---

#### STEP 3 — Add GA4 SPA route-change tracking
**Why third:** Without this, GA4 is essentially useless for a React single-page app. Every click that changes the URL (from homepage to a blog post, for example) is invisible.

**How it works:**
React Router does not reload the page when navigating between routes — it swaps components in memory. But GA4 only fires a `page_view` on a real page load. So we must manually tell GA4 "the user is now on a new page" every time React Router changes the route.

The fix: create a `useGAPageTracking` hook that listens to React Router's `location` object. Every time `location.pathname` changes, fire `gtag('event', 'page_view', { page_path: newPath })`. Mount this hook once in `App.tsx`.

Files to create/change:
- `src/utils/analytics.ts` — centralized GA4 helper (all gtag calls go here, nothing else)
- `src/hooks/useGAPageTracking.ts` — React hook that fires page_view on every route change
- `src/App.tsx` — mount `<GAPageTracker />` inside `<BrowserRouter>`

**After this step:** Every page navigation is visible in GA4 Realtime reports.

---

#### STEP 4 — Add custom event tracking for blog and audio
**Why fourth:** Once page views are working, the next layer is understanding *how* users engage with content.

Events to track:

| Event Name | Where Fired | Data Sent |
|-----------|-------------|-----------|
| `article_view` | BlogPost — when post data loads successfully | `{ article_slug, article_title, article_lang, article_category }` |
| `article_read_complete` | BlogPost — when user scrolls past 80% of article | `{ article_slug, article_title }` |
| `comment_submitted` | BlogPost — on successful comment post | `{ article_slug, article_lang }` |
| `audio_play` | AudioPage — when user clicks play on an episode | `{ episode_id, episode_title, episode_number }` |
| `audio_pause` | AudioPage — when user pauses | `{ episode_id, listen_duration_seconds }` |
| `newsletter_signup` | Blog page and Index — on successful subscription | `{ source_page, lang }` |

Files to change:
- `src/utils/analytics.ts` — add typed event functions (no raw `gtag` calls outside this file)
- `src/pages/BlogPost.tsx` — call `trackArticleView()` and `trackReadComplete()`
- `src/pages/AudioPage.tsx` — call `trackAudioPlay()` and `trackAudioPause()`
- `src/pages/Blog.tsx` — call `trackNewsletterSignup()` on success

---

#### STEP 5 — Add page meta to AudioPage
**Why fifth:** AudioPage currently renders with the default site title. GA4 receives `page_title = "Afrinia — Intelligence for Africa's Builders"` for the audio page. This makes it impossible to distinguish audio traffic from homepage traffic.

Files to change:
- `src/pages/AudioPage.tsx` — add `usePageMeta()` call with audio-specific title and description, in both EN and FR

---

#### STEP 6 — Enable Enhanced Measurement in GA4 (manual, in console)
**Why last:** This is a toggle in the GA4 console (no code change). Once the tracking foundation is solid (Steps 1–5), turning this on adds scroll depth, outbound link clicks, and site search tracking automatically.

Manual action: GA4 Console → Data streams → Afrinia stream → Enhanced measurement → toggle ON

---

### 8.3 Success Criteria (How We Know It's Done)

- [ ] `https://afrinia.org/sitemap.xml` returns valid XML when opened in a browser (not the React app)
- [ ] GSC → Sitemaps shows `sitemap.xml` with **0 errors** and **discovered pages > 0**
- [ ] GA4 Realtime report shows a page_view event when navigating from homepage to a blog post
- [ ] GA4 Realtime report shows an `article_view` event when a blog post fully loads
- [ ] GA4 Realtime report shows an `audio_play` event when an audio episode is played
- [ ] `robots.txt` accessible at `https://afrinia.org/robots.txt` points to the correct sitemap URL
- [ ] No console errors related to gtag or Firebase Analytics
- [ ] Both EN and FR blog pages track separately in GA4

---

### 8.4 Known Limitations (Accepted for Phase 1)

- **Dynamic blog post URLs in sitemap** — Firestore posts cannot be listed in a static `sitemap.xml`. A Firebase Cloud Function that generates the sitemap dynamically is the correct long-term solution (Phase 2). For Phase 1, published slugs will be added manually to the sitemap after each publish cycle.
- **Server-side rendering** — The site is a Vite React SPA, not Next.js. This means Google must execute JavaScript to see the page content. GA4 meta tags and JSON-LD are injected dynamically by React, which means Googlebot's first crawl may see the shell before the content. This is acceptable in Phase 1 but will be resolved when migrating to Next.js (App Router with SSR) in Phase 2.

---

## 9. WHAT ANY CONTRIBUTOR MUST KNOW BEFORE TOUCHING THIS PROJECT


1. Read this SKILLS.md in full.
2. Read CLAUDE.md for how to interact with the AI assistant on this project.
3. Understand that Afrinia is **currently in Phase 1**. Every decision must serve Phase 1 goals or lay groundwork for Phase 2 without adding Phase 1 complexity.
4. The design system in Section 6 is sacred. Do not introduce new colors, fonts, or component patterns without explicit approval.
5. The bilingual requirement is non-negotiable. Every user-facing string must have an EN and FR version.
6. When in doubt: simplest working solution first. Elegance comes in Phase 3+.