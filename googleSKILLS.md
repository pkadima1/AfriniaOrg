# googleSKILLS.md — Afrinia Google Visibility Fix Plan
> Version: 1.0 — April 2026  
> Purpose: Make Afrinia's content fully visible, crawlable, and indexable by Google.  
> How to use: Give each numbered prompt to Claude Code ONE AT A TIME. Verify the result before moving to the next prompt. Do not skip steps. Do not combine prompts.

---

## CONTEXT — WHY THIS FILE EXISTS

Afrinia Phase 1 frontend is complete. The site is live at https://afrinia.org with:
- 6 published FR articles at `/fr/blog/[slug]`
- 5 audio episodes at `/audio`
- Admin dashboard at `/admin`
- Newsletter capture on homepage and blog listing
- Full bilingual design (FR primary, EN secondary)

**The problem:** Google cannot find or index the individual article pages.

**Root causes confirmed by Google Search Console audit (April 27, 2026):**

1. The sitemap is static — it lists only 7 hardcoded pages and contains zero article URLs
2. Article slugs are never added to the sitemap after publishing
3. No Article structured data (JSON-LD) exists on any article page — Google treats them as generic web pages
4. No meta tags on AudioPage — Google sees it as a duplicate of the homepage
5. GA4 SPA route-change tracking is missing — every navigation between pages is invisible to Analytics
6. No canonical tag strategy — Google has not confirmed which URL version is authoritative

**Stack:** Vite + React + TypeScript + React Router v6 + Firebase Firestore + Netlify  
**Not Next.js.** This is a client-side SPA. SSR is deferred to Phase 2.  
**Accepted limitation:** Because this is a React SPA (not Next.js), Google must execute JavaScript to see content. This is acceptable for Phase 1. The fixes below work within this constraint.

---

## RULES FOR CLAUDE CODE

- Read this file in full before starting any prompt.
- Complete one prompt fully before starting the next.
- Never modify files outside the scope of the current prompt.
- Never suggest adding new features, pages, or components not listed here.
- Never suggest migrating to Next.js — that is Phase 2.
- After every change, confirm the verification step passes before declaring the task done.
- If a file path does not exist, say so before proceeding. Do not guess.

---

## PROMPT 1 — Audit and report all current SEO-related files

**Give this exact prompt to Claude Code:**

```
Read and report the full contents of these files. Do not change anything. Just read and show me what is currently in each file:

1. public/sitemap.xml
2. public/robots.txt
3. index.html (root level)
4. src/utils/pageMeta.ts (if it exists)
5. src/pages/BlogPost.tsx
6. src/pages/AudioPage.tsx
7. src/pages/Blog.tsx

For each file, tell me:
- Whether the file exists
- Its full current content
- Any immediate problems you can see related to SEO, canonical URLs, or meta tags
```

**Verification:** Claude Code shows you the content of all 7 files with no errors. You can see the problems clearly. No files were changed.

---

## PROMPT 2 — Fix robots.txt

**Context:** The current robots.txt may point to the wrong sitemap URL or use the wrong domain. This must be correct before anything else.

**Give this exact prompt to Claude Code:**

```
Fix the file public/robots.txt so it contains exactly this content and nothing else:

User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: facebookexternalhit
Allow: /

User-agent: *
Allow: /
Disallow: /admin/
Disallow: /profile
Disallow: /settings

Sitemap: https://afrinia.org/sitemap.xml

Replace the entire file with exactly the above. Do not add any other content.
After making the change, show me the full new content of the file.
```

**Verification:**
1. Open `https://afrinia.org/robots.txt` in your browser after deployment
2. You should see the exact content above
3. The sitemap line must say `https://afrinia.org/sitemap.xml` — not `afrinia.com`

---

## PROMPT 3 — Fix static sitemap for all known static pages

**Context:** The current static sitemap has wrong domains and missing pages. This prompt fixes the static pages only. Dynamic article URLs are handled in Prompt 4.

**Give this exact prompt to Claude Code:**

```
Replace the entire content of public/sitemap.xml with the following valid XML. Do not change any URLs. Copy exactly:

<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">

  <!-- Homepage -->
  <url>
    <loc>https://afrinia.org/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- About -->
  <url>
    <loc>https://afrinia.org/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <!-- Blog indexes -->
  <url>
    <loc>https://afrinia.org/fr/blog</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://afrinia.org/en/blog</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>

  <!-- Audio -->
  <url>
    <loc>https://afrinia.org/audio</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>

  <!-- Contact -->
  <url>
    <loc>https://afrinia.org/contact</loc>
    <changefreq>yearly</changefreq>
    <priority>0.5</priority>
  </url>

  <!-- ARTICLE URLS — Add one <url> block here for every published article.
       Format: https://afrinia.org/fr/blog/[slug] and https://afrinia.org/en/blog/[slug]
       This section must be updated manually after each new article is published.
       See PROMPT 4 for the procedure. -->

</urlset>

After replacing the file, open it in the browser at https://afrinia.org/sitemap.xml and confirm it shows XML, not the React app.
Show me the full content of the new file.
```

**Verification:**
1. Open `https://afrinia.org/sitemap.xml` in your browser after deployment
2. You must see raw XML — not the Afrinia website
3. The XML must be valid — no parsing errors in browser
4. All URLs must use `afrinia.org` — zero instances of `afrinia.com`

---

## PROMPT 4 — Add all existing article URLs to the sitemap

**Context:** You have 6 published French articles. Their slugs are visible in the browser URL bar when you visit each one. This prompt adds them to the sitemap permanently.

**Give this exact prompt to Claude Code:**

```
I need to add article URLs to public/sitemap.xml. The sitemap currently has a comment placeholder section for articles.

Add the following URL blocks inside the <urlset> element, replacing the comment placeholder.
Use the exact slugs I provide. For each FR article, also add the EN equivalent with /en/blog/ prefix using the same slug.

Here are the FR article slugs (copy from your browser URL bar for each published article):
- le-capital-de-la-diaspora-rinventer-linvestissement-immobilier-africain-par-lingnierie-de-confiance
- croissance-africaine-au-dela-des-chiffres-daide-et-rapports-externes
- francophonie-digitale-levier-strategique
- le-mirage-europeen-rediriger-lambition-africaine-vers-la-prosperite-locale
- le-mythe-du-financement-batir-des-projets-strategiques-pour-attirer-le-capital-en-afrique
- reinventer-leconomie-africaine-opportunites-strategiques-face-aux-crises-externes

For each slug, create two <url> blocks using this format:

<url>
  <loc>https://afrinia.org/fr/blog/[slug]</loc>
  <lastmod>2026-04-21</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.9</priority>
</url>
<url>
  <loc>https://afrinia.org/en/blog/[slug]</loc>
  <lastmod>2026-04-21</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.9</priority>
</url>

Add all 12 URL blocks (6 FR + 6 EN) to the sitemap, replacing the comment placeholder.
Show me the complete final sitemap.xml content after the change.

IMPORTANT: The slugs I gave you may have encoding issues (special characters). Check each slug against the actual URL in the browser and correct any characters that were changed during copy-paste (e.g., accented characters, hyphens replacing apostrophes).
```

**Verification:**
1. Open `https://afrinia.org/sitemap.xml` in browser after deployment
2. Count the `<url>` entries — you must see 6 static pages + 12 article URLs = 18 total entries
3. Click one of the article URLs from the sitemap — it must load the actual article, not a 404
4. Go to Google Search Console → Sitemaps → Open Sitemap → verify "Discovered pages" updates

**MAINTENANCE RULE:** Every time a new article is published, immediately add its FR and EN URL to this sitemap manually using the same format. This is a required step in the publishing workflow until a dynamic sitemap is built in Phase 2.

---

## PROMPT 5 — Add Article JSON-LD structured data to BlogPost pages

**Context:** Google currently sees article pages as generic web pages. JSON-LD Article schema tells Google exactly what each page is — its headline, publication date, language, and publisher. This is the highest-leverage SEO fix for individual articles.

**Give this exact prompt to Claude Code:**

```
I need to add Article structured data (JSON-LD) to the BlogPost page component.

First, read the full content of src/pages/BlogPost.tsx and show it to me.

Then, add a JSON-LD script tag that injects Article structured data into the page <head> for each article.

Requirements:
- The JSON-LD must be injected dynamically using the article data already loaded from Firestore
- Use React Helmet or document.createElement to inject the script into <head>
- The schema type must be "Article" (not BlogPosting — Article has broader Google support)
- The JSON-LD must include these fields populated from the actual article data:
  - @context: "https://schema.org"
  - @type: "Article"
  - headline: the article title
  - description: the article excerpt or first 160 characters of body
  - datePublished: the article publication date in ISO 8601 format (YYYY-MM-DD)
  - dateModified: same as datePublished if no modified date exists
  - author: { @type: "Organization", name: "Afrinia", url: "https://afrinia.org" }
  - publisher: { @type: "Organization", name: "Afrinia", url: "https://afrinia.org" }
  - inLanguage: "fr" if the URL starts with /fr/, "en" if it starts with /en/
  - url: the full canonical URL of the current page (window.location.href)
  - image: the article cover image URL if available, otherwise omit the field entirely

- The script tag must be removed when the component unmounts (cleanup function)
- Do not use any new npm packages unless react-helmet is already installed
- If react-helmet is not installed, use a useEffect with document.createElement('script') and cleanup

After making the change, show me:
1. The full updated BlogPost.tsx
2. How to verify the JSON-LD is working in the browser
```

**Verification:**
1. Open any article page in Chrome
2. Right-click → View Page Source
3. Search for `application/ld+json` — you must find the script tag with Article data
4. Copy the JSON from the script tag and paste it into https://validator.schema.org — it must show zero errors
5. In Google Search Console → URL Inspection → paste any article URL → Test Live URL → check "Enhancements" section — it should now show Article data detected

---

## PROMPT 6 — Add canonical meta tag and unique page meta to every page

**Context:** Google needs a clear signal of which URL is the authoritative version of each page. Without canonical tags, Google makes its own decision — which may exclude your pages. Every page also needs a unique title and description.

**Give this exact prompt to Claude Code:**

```
I need to add canonical meta tags and ensure every page has a unique title and description.

First, read these files and show me their current content:
- src/utils/pageMeta.ts (if it exists — if not, tell me)
- src/pages/AudioPage.tsx
- src/pages/About.tsx
- src/pages/Contact.tsx

Then make these changes:

1. In src/utils/pageMeta.ts (create it if it doesn't exist), add or update a function called setPageMeta that:
   - Sets document.title
   - Sets or updates the meta description tag
   - Sets or updates a canonical <link> tag in <head> pointing to the current page URL
   - The canonical URL must always use https://afrinia.org as the base domain
   - Takes parameters: { title: string, description: string, canonicalPath: string }
   - Example call: setPageMeta({ title: 'Le Bref Afrinia — Audio', description: '...', canonicalPath: '/audio' })

2. In src/pages/AudioPage.tsx, call setPageMeta with:
   - title: "Le Bref Afrinia — Audio | Intelligence pour les bâtisseurs africains"
   - description: "Chaque idée Afrinia aussi en audio. Épisodes sur les affaires, la tech et l'innovation en Afrique."
   - canonicalPath: "/audio"

3. In src/pages/About.tsx, call setPageMeta with:
   - title: "À Propos — Afrinia | Intelligence pour l'Afrique"
   - description: "Afrinia est la première plateforme d'intelligence bilingue pour les entrepreneurs et technologues africains."
   - canonicalPath: "/about"

4. In src/pages/Contact.tsx, call setPageMeta with:
   - title: "Contact — Afrinia"
   - description: "Contactez l'équipe Afrinia pour toute question éditoriale, partenariat ou collaboration."
   - canonicalPath: "/contact"

5. Verify that BlogPost.tsx already calls setPageMeta with the article title and slug. If it does not, add the call using the article's title, excerpt, and canonical URL.

Show me all changed files in full after making the changes.
```

**Verification:**
1. Open `https://afrinia.org/audio` in Chrome
2. Right-click → View Page Source
3. Search for `<link rel="canonical"` — must show `https://afrinia.org/audio`
4. Search for `<title>` — must show the audio-specific title, not the homepage title
5. Repeat for `/about` and `/contact`
6. Open any article — canonical must match the article URL exactly

---

## PROMPT 7 — Add GA4 SPA route-change tracking

**Context:** GA4 only fires a page_view on real page loads. In a React SPA, navigating from the homepage to an article is not a real page load — it is a JavaScript component swap. GA4 currently sees it as zero. This means you have no data on which articles people read, how long they stay, or which language performs better.

**Give this exact prompt to Claude Code:**

```
I need to add GA4 page_view tracking for every React Router route change.

First, read src/App.tsx and show it to me in full.
Then read src/utils/analytics.ts (if it exists) and show it to me.

Then make these changes:

1. Create or update src/utils/analytics.ts to contain a centralized GA4 helper:

export const trackPageView = (path: string, title: string) => {
  if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
    (window as any).gtag('event', 'page_view', {
      page_path: path,
      page_title: title,
      page_location: window.location.href,
    });
  }
};

export const trackEvent = (eventName: string, params: Record<string, string | number>) => {
  if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
    (window as any).gtag('event', eventName, params);
  }
};

2. Create src/hooks/useGAPageTracking.ts with this exact content:

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '@/utils/analytics';

export const useGAPageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname, document.title);
  }, [location.pathname]);
};

3. In src/App.tsx, create a component called GAPageTracker that calls useGAPageTracking:

const GAPageTracker = () => {
  useGAPageTracking();
  return null;
};

Place <GAPageTracker /> as the FIRST child inside <BrowserRouter>, before any <Routes>.

Show me the full updated App.tsx after the change.

Do not change any existing routes or components. Only add the GAPageTracker.
```

**Verification:**
1. Deploy the change to Netlify
2. Open GA4 → Reports → Realtime
3. Open afrinia.org in a new browser tab
4. Click from the homepage to any article
5. In GA4 Realtime, you must see TWO page_view events: one for `/` and one for the article URL
6. If you only see one, the hook is not working — report the exact GA4 Realtime output

---

## PROMPT 8 — Add article_view and newsletter_signup event tracking

**Context:** Once page views work (Prompt 7), you need event-level data to understand content performance. These two events are the most important for Phase 1 — they tell you which articles are being read and which newsletter placements convert.

**Give this exact prompt to Claude Code:**

```
I need to add two custom GA4 events: article_view and newsletter_signup.

First, read these files in full:
- src/pages/BlogPost.tsx
- src/pages/Blog.tsx
- src/utils/analytics.ts

Then make these changes:

1. In src/utils/analytics.ts, add these two typed functions below the existing trackPageView and trackEvent functions:

export const trackArticleView = (params: {
  article_slug: string;
  article_title: string;
  article_lang: string;
  article_category: string;
}) => {
  trackEvent('article_view', params);
};

export const trackNewsletterSignup = (params: {
  source_page: string;
  lang: string;
}) => {
  trackEvent('newsletter_signup', params);
};

2. In src/pages/BlogPost.tsx:
- Find the point where the article data has fully loaded from Firestore and the title/category are available
- Call trackArticleView() at that point with the actual article slug, title, language (fr or en, detected from the URL), and category
- The language must be detected from window.location.pathname — if it starts with /fr/, use 'fr'; if /en/, use 'en'

3. In src/pages/Blog.tsx:
- Find the newsletter subscription form submit handler (where the email is sent to Firestore or an API)
- After a successful subscription, call trackNewsletterSignup() with:
  - source_page: window.location.pathname
  - lang: detected from the URL the same way as above

Show me all three updated files in full after the changes.
```

**Verification:**
1. Deploy to Netlify
2. Open GA4 → Reports → Realtime
3. Open any article page
4. In GA4 Realtime → Events, you must see an `article_view` event appear within 30 seconds
5. Go to the blog page, enter a test email in the newsletter form, submit it
6. In GA4 Realtime → Events, you must see a `newsletter_signup` event appear
7. Click each event in Realtime to confirm the parameters (article_slug, lang, etc.) are populated correctly

---

## PROMPT 9 — Submit updated sitemap to Google Search Console and request indexing for all articles

**This is a manual action — no code required. Follow these steps exactly:**

**Step 1 — Submit the corrected sitemap:**
1. Go to Google Search Console → https://afrinia.org property
2. Click Sitemaps in the left menu
3. If `sitemap_index.xml` appears in the list, click it and delete it (it does not exist)
4. If `sitemap.xml` appears, click it and delete it (to force a fresh re-read)
5. In the "Add a new sitemap" field, type: `sitemap.xml`
6. Click Submit
7. Wait 30 seconds, then refresh — it must show "Success" with "Discovered pages" > 0

**Step 2 — Request indexing for every article:**

For each of the following URLs, do this:
- Go to URL Inspection
- Paste the URL
- Click "Test Live URL"
- When the test completes and shows green ("URL is available to Google"), click "Request Indexing"
- Wait for the confirmation message before moving to the next URL

Article URLs to submit (FR):
```
https://afrinia.org/fr/blog/le-capital-de-la-diaspora-rinventer-linvestissement-immobilier-africain-par-lingnierie-de-confiance
https://afrinia.org/fr/blog/croissance-africaine-au-dela-des-chiffres-daide-et-rapports-externes
https://afrinia.org/fr/blog/francophonie-digitale-levier-strategique
https://afrinia.org/fr/blog/le-mirage-europeen-rediriger-lambition-africaine-vers-la-prosperite-locale
https://afrinia.org/fr/blog/le-mythe-du-financement-batir-des-projets-strategiques-pour-attirer-le-capital-en-afrique
https://afrinia.org/fr/blog/reinventer-leconomie-africaine-opportunites-strategiques-face-aux-crises-externes
```

Article URLs to submit (EN — same slugs):
```
https://afrinia.org/en/blog/le-capital-de-la-diaspora-rinventer-linvestissement-immobilier-africain-par-lingnierie-de-confiance
https://afrinia.org/en/blog/croissance-africaine-au-dela-des-chiffres-daide-et-rapports-externes
https://afrinia.org/en/blog/francophonie-digitale-levier-strategique
https://afrinia.org/en/blog/le-mirage-europeen-rediriger-lambition-africaine-vers-la-prosperite-locale
https://afrinia.org/en/blog/le-mythe-du-financement-batir-des-projets-strategiques-pour-attirer-le-capital-en-afrique
https://afrinia.org/en/blog/reinventer-leconomie-africaine-opportunites-strategiques-face-aux-crises-externes
```

Static pages to submit:
```
https://afrinia.org/
https://afrinia.org/about
https://afrinia.org/audio
https://afrinia.org/contact
```

**Verification:**
- All submissions show "Indexing requested" confirmation
- GSC → Sitemaps shows `sitemap.xml` with Status: Success and Discovered pages ≥ 18
- Check back in 48–72 hours: GSC → Pages → Indexed count should increase from 8

---

## PROMPT 10 — Final audit: confirm all fixes are live

**Give this exact prompt to Claude Code:**

```
Run a final audit to confirm all SEO fixes from googleSKILLS.md are correctly implemented. 

Check each of the following and report the result as PASS or FAIL with evidence:

1. public/robots.txt — contains Disallow: /admin/ and Sitemap: https://afrinia.org/sitemap.xml
2. public/sitemap.xml — contains 18+ <url> entries, all using https://afrinia.org (not afrinia.com)
3. src/pages/BlogPost.tsx — contains a JSON-LD script injection for Article schema
4. src/pages/BlogPost.tsx — calls setPageMeta() or equivalent with article title and canonical URL
5. src/pages/AudioPage.tsx — calls setPageMeta() with audio-specific title and canonical /audio
6. src/utils/analytics.ts — exports trackPageView, trackEvent, trackArticleView, trackNewsletterSignup
7. src/hooks/useGAPageTracking.ts — exists and uses useLocation to fire page_view on route change
8. src/App.tsx — contains <GAPageTracker /> inside <BrowserRouter>
9. src/pages/BlogPost.tsx — calls trackArticleView() after article data loads
10. src/pages/Blog.tsx — calls trackNewsletterSignup() after successful subscription

Report each as PASS or FAIL. For any FAIL, show the specific line or section that is missing or wrong.
Do not make any changes in this step — audit only.
```

**Verification:** All 10 checks return PASS. If any return FAIL, fix that specific item before closing the work session.

---

## POST-IMPLEMENTATION RULES (PERMANENT)

These rules apply from now on, every time you publish content:

**Every new article published must immediately trigger:**
1. Add the article's FR URL to `public/sitemap.xml` under the article URL section
2. Add the article's EN URL to `public/sitemap.xml` under the article URL section
3. Commit and push the sitemap change to trigger a Netlify deploy
4. Go to Google Search Console → URL Inspection → paste the FR article URL → Request Indexing
5. Go to Google Search Console → URL Inspection → paste the EN article URL → Request Indexing

This takes 5 minutes per article and is non-negotiable until a dynamic sitemap is built in Phase 2.

---

## SUCCESS CRITERIA — PHASE 1 GOOGLE VISIBILITY

The work in this file is complete when ALL of the following are true:

- [ ] `https://afrinia.org/sitemap.xml` returns valid XML with 18+ URL entries when opened in a browser
- [ ] `https://afrinia.org/robots.txt` shows correct Disallow and Sitemap entries
- [ ] GSC → Sitemaps shows `sitemap.xml` with Status: Success and Discovered pages ≥ 18
- [ ] GSC → Pages → Indexed count increases to 15+ within 7 days of completing this plan
- [ ] Right-clicking any article page → View Source shows `application/ld+json` with Article schema
- [ ] Schema.org validator shows zero errors for any article's JSON-LD
- [ ] GA4 Realtime shows two page_view events when navigating from homepage to an article
- [ ] GA4 Realtime shows `article_view` event when an article fully loads
- [ ] GA4 Realtime shows `newsletter_signup` event after a test subscription
- [ ] Every page has a unique `<title>` and `<link rel="canonical">` tag
- [ ] The only query driving Google traffic is no longer just "afrinia" — at least one topical keyword appears in GSC Performance within 30 days

---

## WHAT NOT TO DO (SCOPE GUARDRAILS)

Do not build during this fix sprint:
- Server-side rendering (Next.js migration) — Phase 2
- Dynamic sitemap generation via Firebase Cloud Function — Phase 2
- Audio episode JSON-LD schema (Podcast) — Phase 2 after audio has its own routes
- Backlink campaigns or external link building — separate activity
- New pages, features, or content pillars — not part of this fix
- Changing the design, fonts, colors, or layout — not part of this fix
