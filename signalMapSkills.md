# signalMapSkills.md
## Afrinia Signal Architecture — Sequential Code Agent Implementation Plan

> **HOW TO USE THIS FILE**
> Execute one prompt at a time. Do not proceed to the next prompt until the current one is confirmed working.
> Each prompt is self-contained but assumes the previous step is complete and stable.
> All field names, values, and file paths are canonical — do not rename or improvise.

---

## STACK REALITY — READ THIS BEFORE ANYTHING ELSE

This is **NOT a Next.js project**. It is:
- React 18 + TypeScript + **Vite** (dev port 8080)
- **React Router v6** — locale is derived from `useLocation()` / `pathname.startsWith('/fr/')`, never from Next.js `useParams` or `usePathname`
- Firebase Client SDK (not Admin SDK) in the frontend — imported from `firebase/app`, `firebase/firestore`
- Firebase Admin SDK only in Netlify Functions at `netlify/functions/lib/firebase-admin.js`
- Netlify Functions v2 (`export default async () => {}`) — NOT Next.js API routes
- **Shadcn/ui** component library — use `<Select>`, `<Label>` etc. from `@/components/ui/*`
- Tailwind CSS for utility classes, inline styles with the `A` token object for brand colors
- i18next for translations — string keys in `src/locales/en.json` and `src/locales/fr.json`
- Path alias `@/` resolves to `src/`

**Firestore collections that hold blog posts:**
- `posts_en` — English articles
- `posts_fr` — French articles
- There is NO `signals` collection. Any reference to `signals` in prompts below has been replaced with the correct collection names.

**Module resolution:** `package.json` has `"type": "module"`. Scripts must use `.mjs` extension or ESM syntax.

---

## THE CANONICAL TAXONOMY — READ THIS FIRST

Before executing any prompt, internalize this. Every prompt below enforces it.

### Signal Types (Primary Filter — 5 only, no more, no less)

| ID | EN Label | FR Label | What it signals |
|----|----------|----------|-----------------|
| `opportunity` | OPPORTUNITY | OPPORTUNITÉ | Market openings, trade plays, sector entry points, actionable leads |
| `analysis` | ANALYSIS | ANALYSE | Macro trends, policy context, structural explanations, geopolitical signals |
| `investment` | INVESTMENT | INVESTISSEMENT | Funding rounds, capital flows, DFI activity, M&A, financial markets |
| `technote` | TECHNOTE | TECHNOTE | Fintech, AI, digital infrastructure, platform economies (bilingual brand asset — identical in EN and FR by design) |
| `builder` | BUILDER | BÂTISSEUR | Founder profiles, startup ecosystems, operator intelligence, business model innovation |

### Sector Tags (Secondary Metadata — Firestore only, not visible in UI yet)

`fintech` · `agritech` · `energy` · `logistics` · `health` · `education` · `real_estate` · `trade` · `digital_infrastructure` · `other`

### Region Tags (Tertiary Metadata — Firestore only, not visible in UI yet)

`west_africa` · `east_africa` · `central_africa` · `north_africa` · `southern_africa` · `pan_african`

---

## PROMPT 1 — Audit: Read all existing category values from Firestore

**Objective:** Before touching anything, get a complete picture of what exists in the real collections. This is diagnostic only — no writes.

```
You are working on the Afrinia React + Vite + Firebase project.

Task: Audit all unique category values currently stored in Firestore.

IMPORTANT: The collections are `posts_en` and `posts_fr` — there is NO `signals` collection.

Steps:
1. Write a Node script at `scripts/audit-categories.mjs` that connects to Firestore using the Firebase Admin SDK.
   The service account JSON is in the FIREBASE_SERVICE_ACCOUNT environment variable (same pattern as
   `netlify/functions/lib/firebase-admin.js`). Load it from a local `.env.local` file or pass it inline.
   The named Firestore database is "afrinia" (matches VITE_FIRESTORE_DATABASE_ID in .env).

2. Fetch ALL documents from BOTH `posts_en` and `posts_fr` collections.

3. For each document, extract the value of these fields: `category`, `tags`, `status`.
   Record the document ID and which collection it came from.

4. Output to console:

   SECTION A — EXISTING CATEGORY VALUES IN posts_en
   (unique value → count of documents using it)

   SECTION B — EXISTING CATEGORY VALUES IN posts_fr
   (unique value → count of documents using it)

   SECTION C — DOCUMENTS WITH MISSING/EMPTY CATEGORY
   (collection name + document ID for any doc where category is null, undefined, or empty string)

   SECTION D — STATUS BREAKDOWN
   (how many documents are 'published', 'draft', 'archived' across both collections)

5. Do not write or modify any data. This is read-only.

Run the script: node scripts/audit-categories.mjs

Post the full console output here before proceeding to Prompt 2.
```

---

## PROMPT 2 — Schema: Add canonical types to the existing types file

**Objective:** Add `PostCategory`, `PostSector`, `PostRegion` to the existing types file and extend `BlogPost` with the new taxonomy fields. This is the single source of truth — no duplicate type files.

```
You are working on the Afrinia React + Vite + Firebase project.

Task: Extend the existing type definitions at `src/integrations/firebase/types.ts`.

DO NOT create a new file. DO NOT create a `lib/` directory. Edit the existing file only.

Changes to make:

1. BEFORE the existing `BlogPost` interface, add these three new types:

```typescript
export type PostCategory =
  | 'opportunity'
  | 'analysis'
  | 'investment'
  | 'technote'
  | 'builder';

export type PostSector =
  | 'fintech'
  | 'agritech'
  | 'energy'
  | 'logistics'
  | 'health'
  | 'education'
  | 'real_estate'
  | 'trade'
  | 'digital_infrastructure'
  | 'other';

export type PostRegion =
  | 'west_africa'
  | 'east_africa'
  | 'central_africa'
  | 'north_africa'
  | 'southern_africa'
  | 'pan_african';
```

2. In the existing `BlogPost` interface, replace:
   ```typescript
   category?: string;
   ```
   with:
   ```typescript
   category?: PostCategory;       // canonical signal type key — used for filtering
   categoryEN?: string;           // derived display label (EN) — never typed manually
   categoryFR?: string;           // derived display label (FR) — never typed manually
   sector?: PostSector;           // secondary metadata — Firestore only in Phase 1
   region?: PostRegion;           // tertiary metadata — Firestore only in Phase 1
   ```
   Keep all other existing fields exactly as they are.

3. Do not touch any other file in this step.

Confirm: show the updated `src/integrations/firebase/types.ts` file in full.
```

---

## PROMPT 3 — Constants: Create the taxonomy constants file

**Objective:** A single file at `src/constants/taxonomy.ts` that maps every canonical category key to its EN and FR display labels. This is the ONLY place these labels are ever defined. All UI components and the admin panel import from here.

```
You are working on the Afrinia React + Vite + Firebase project.

Task: Create `src/constants/taxonomy.ts`. Create the `src/constants/` directory if it does not exist.

DO NOT create a `lib/` directory. The file must be at `src/constants/taxonomy.ts`.

This file must contain exactly these four exports:

```typescript
import { PostCategory } from '@/integrations/firebase/types';

// 1. Ordered array for filter UI rendering — import order = display order
export const SIGNAL_CATEGORIES: {
  id: PostCategory;
  labelEN: string;
  labelFR: string;
}[] = [
  { id: 'opportunity',  labelEN: 'OPPORTUNITY',    labelFR: 'OPPORTUNITÉ'    },
  { id: 'analysis',     labelEN: 'ANALYSIS',       labelFR: 'ANALYSE'        },
  { id: 'investment',   labelEN: 'INVESTMENT',     labelFR: 'INVESTISSEMENT' },
  { id: 'technote',     labelEN: 'TECHNOTE',       labelFR: 'TECHNOTE'       },
  { id: 'builder',      labelEN: 'BUILDER',        labelFR: 'BÂTISSEUR'      },
];

// 2. O(1) lookup map — used in components and admin panel to derive labels from keys
export const CATEGORY_LABEL_MAP: Record<PostCategory, { en: string; fr: string }> = {
  opportunity:  { en: 'OPPORTUNITY',    fr: 'OPPORTUNITÉ'    },
  analysis:     { en: 'ANALYSIS',       fr: 'ANALYSE'        },
  investment:   { en: 'INVESTMENT',     fr: 'INVESTISSEMENT' },
  technote:     { en: 'TECHNOTE',       fr: 'TECHNOTE'       },
  builder:      { en: 'BUILDER',        fr: 'BÂTISSEUR'      },
};

// 3. Helper — resolves the display label for a given key and locale
export function getCategoryLabel(category: PostCategory, locale: 'en' | 'fr'): string {
  return CATEGORY_LABEL_MAP[category]?.[locale] ?? category.toUpperCase();
}

// 4. Sector and region arrays — for admin dropdowns (English labels only in Phase 1)
export const SIGNAL_SECTORS = [
  { id: 'fintech',                 label: 'Fintech'                 },
  { id: 'agritech',                label: 'Agritech'                },
  { id: 'energy',                  label: 'Energy'                  },
  { id: 'logistics',               label: 'Logistics'               },
  { id: 'health',                  label: 'Health'                  },
  { id: 'education',               label: 'Education'               },
  { id: 'real_estate',             label: 'Real Estate'             },
  { id: 'trade',                   label: 'Trade'                   },
  { id: 'digital_infrastructure',  label: 'Digital Infrastructure'  },
  { id: 'other',                   label: 'Other'                   },
];

export const SIGNAL_REGIONS = [
  { id: 'west_africa',     label: 'West Africa'    },
  { id: 'east_africa',     label: 'East Africa'    },
  { id: 'central_africa',  label: 'Central Africa' },
  { id: 'north_africa',    label: 'North Africa'   },
  { id: 'southern_africa', label: 'Southern Africa'},
  { id: 'pan_african',     label: 'Pan-African'    },
];
```

Confirm: show the created file in full. No other file is modified in this step.
```

---

## PROMPT 4 — Migration: Remap all existing Firestore documents to canonical categories

**Objective:** One-time data migration. Map every existing freetext category value in `posts_en` and `posts_fr` to one of the 5 canonical `PostCategory` keys. Add `categoryEN`, `categoryFR`, `sector`, and `region` fields to every document. After this runs, no document has an old or invalid category value.

```
You are working on the Afrinia React + Vite + Firebase project.

Task: Write a one-time migration script at `scripts/migrate-categories.mjs`.

IMPORTANT:
- Target collections: `posts_en` AND `posts_fr` — NOT a `signals` collection.
- The named Firestore database is "afrinia".
- Use firebase-admin package (already in package.json as a dependency).
- This is an ESM file (.mjs) because package.json has "type": "module".
- Load the service account from the FIREBASE_SERVICE_ACCOUNT environment variable,
  following the same pattern used in `netlify/functions/lib/firebase-admin.js`.

The script must:

1. Define the remapping object using every old value found in the Prompt 1 audit
   (adjust the list below if the audit found additional values):

```javascript
const CATEGORY_REMAP = {
  // Entrepreneurship variants → builder
  'entrepreneurship':    'builder',
  'entrepreneurialism':  'builder',
  'entrepreneuriat':     'builder',
  'entreprenariat':      'builder',
  'entrepreneur':        'builder',
  'builders':            'builder',
  'builder':             'builder',
  // Investment variants → investment
  'investment':          'investment',
  'investissement':      'investment',
  'invest':              'investment',
  // Opportunity variants → opportunity
  'opportunity':         'opportunity',
  'opportunité':         'opportunity',
  'opportunite':         'opportunity',
  'opportunities':       'opportunity',
  // Tech variants → technote
  'technote':            'technote',
  'tech':                'technote',
  'technology':          'technote',
  'innovation':          'technote',
  // Analysis variants → analysis
  'analysis':            'analysis',
  'analyse':             'analysis',
  'ideas':               'analysis',
  'idées':               'analysis',
  'idea':                'analysis',
  'market':              'analysis',
  'marché':              'analysis',
  'policy':              'analysis',
  'politique':           'analysis',
};
```

2. Define display labels (mirrors CATEGORY_LABEL_MAP in src/constants/taxonomy.ts):

```javascript
const LABEL_MAP = {
  opportunity: { en: 'OPPORTUNITY',    fr: 'OPPORTUNITÉ'    },
  analysis:    { en: 'ANALYSIS',       fr: 'ANALYSE'        },
  investment:  { en: 'INVESTMENT',     fr: 'INVESTISSEMENT' },
  technote:    { en: 'TECHNOTE',       fr: 'TECHNOTE'       },
  builder:     { en: 'BUILDER',        fr: 'BÂTISSEUR'      },
};
```

3. Fetch all documents from BOTH `posts_en` and `posts_fr`.

4. For each document:
   a. Read the current `category` field value. Normalize: lowercase + trim whitespace.
   b. Look up in CATEGORY_REMAP. If found, use the canonical key.
      If NOT found: default to `'analysis'` and log:
      `UNMAPPED — posts_en/<docId>: original value "<value>" → defaulted to analysis`
   c. Write back to the document using Firestore batch writes (max 400 per batch):
      - `category`: the canonical key string (e.g. `'builder'`)
      - `categoryEN`: LABEL_MAP[key].en
      - `categoryFR`: LABEL_MAP[key].fr
      - `sector`: `'other'`   (default — will be updated manually via admin panel)
      - `region`: `'pan_african'`  (default — will be updated manually via admin panel)

5. Print final summary:
   - Total documents processed (posts_en count + posts_fr count)
   - Total successfully remapped
   - List of any UNMAPPED documents (collection + ID + original value)
   - Any Firestore errors

Run the script:
  FIREBASE_SERVICE_ACCOUNT="$(cat path/to/service-account.json)" node scripts/migrate-categories.mjs

Confirm it completes without errors and print the full summary output here.
Do not modify any frontend files in this step.
```

---

## PROMPT 5 — Admin Panel: Replace category freetext input with enforced dropdown

**Objective:** Lock the admin editor so no freetext category value can ever be entered again. Category becomes a fixed dropdown. Sector and region dropdowns are added. `categoryEN` and `categoryFR` are derived automatically on save — never typed manually.

```
You are working on the Afrinia React + Vite + Firebase project.

Task: Update the admin blog post editor at `src/components/admin/BlogPostEditor.tsx`.

KEY FACTS ABOUT THIS FILE:
- Uses shadcn/ui components. Import Select from `@/components/ui/select` — NOT native <select>.
- The form state is in a `post` object managed by `setPost(prev => ({ ...prev, field: value }))`.
- The category text input is around line 556 — it looks like:
  <Input id="category" value={post.category} onChange={(e) => setPost(...)} />
- Existing imports include Label from `@/components/ui/label` and Input from `@/components/ui/input`.

Changes to make:

1. Add this import at the top of the file:
```typescript
import {
  SIGNAL_CATEGORIES,
  SIGNAL_SECTORS,
  SIGNAL_REGIONS,
  CATEGORY_LABEL_MAP,
} from '@/constants/taxonomy';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PostCategory, PostSector, PostRegion } from '@/integrations/firebase/types';
```

2. CATEGORY FIELD — replace the `<Input>` for category with:
```tsx
<div className="space-y-2">
  <Label htmlFor="category">Signal Type</Label>
  <Select
    value={post.category || ''}
    onValueChange={(value) => {
      const key = value as PostCategory;
      const labels = CATEGORY_LABEL_MAP[key];
      setPost(prev => ({
        ...prev,
        category: key,
        categoryEN: labels.en,
        categoryFR: labels.fr,
      }));
    }}
  >
    <SelectTrigger id="category">
      <SelectValue placeholder="— Select Signal Type —" />
    </SelectTrigger>
    <SelectContent>
      {SIGNAL_CATEGORIES.map(c => (
        <SelectItem key={c.id} value={c.id}>
          {c.labelEN} / {c.labelFR}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>
```

3. SECTOR FIELD — add directly below the category field:
```tsx
<div className="space-y-2">
  <Label htmlFor="sector">Sector</Label>
  <Select
    value={post.sector || ''}
    onValueChange={(value) =>
      setPost(prev => ({ ...prev, sector: value as PostSector }))
    }
  >
    <SelectTrigger id="sector">
      <SelectValue placeholder="— Select Sector —" />
    </SelectTrigger>
    <SelectContent>
      {SIGNAL_SECTORS.map(s => (
        <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>
```

4. REGION FIELD — add directly below the sector field:
```tsx
<div className="space-y-2">
  <Label htmlFor="region">Region</Label>
  <Select
    value={post.region || ''}
    onValueChange={(value) =>
      setPost(prev => ({ ...prev, region: value as PostRegion }))
    }
  >
    <SelectTrigger id="region">
      <SelectValue placeholder="— Select Region —" />
    </SelectTrigger>
    <SelectContent>
      {SIGNAL_REGIONS.map(r => (
        <SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>
```

5. The existing save logic in `blogService.ts` already writes the full `post` object via `setDoc`.
   No changes to the save function are needed — `category`, `categoryEN`, `categoryFR`,
   `sector`, `region` are all on the `post` state object and will be written automatically.

6. For the EDIT form (loading an existing post), the existing code at line ~164 already does:
   `category: data.category || ''`
   After migration, this will be a canonical key (e.g. 'builder') and the Select will
   pre-populate correctly because `value={post.category || ''}` matches the SelectItem values.

Confirm: run the dev server, open `/admin/blog/new`, verify the three dropdowns appear.
Open an existing post — verify all three dropdowns pre-populate from saved Firestore values.
```

---

## PROMPT 6 — Frontend: Update the blog filter bar to use canonical taxonomy

**Objective:** Replace the dynamic `uniqueCategories` derived from fetched post data with a static, ordered list from `SIGNAL_CATEGORIES`. The correct language label renders from the canonical map. No English words appear on `/fr/blog`. No French words appear on `/en/blog`.

```
You are working on the Afrinia React + Vite + Firebase project.

Task: Update the filter bar in `src/pages/Blog.tsx`.

KEY FACTS ABOUT THIS FILE:
- Locale is derived from: `const lang: Lang = pathname.startsWith('/fr/') ? 'fr' : 'en';`
  (from `useLocation()` — React Router v6 pattern, NOT Next.js)
- The filter chip component is `FilterChip` defined inline in this file.
- `uniqueCategories` is currently derived dynamically at line ~228:
  `[...new Set(cards.map(c => c.category).filter(Boolean))].sort()`
  This must be REPLACED — it is the root cause of duplicate/misspelled filter buttons.
- Filter comparison at line ~240: `card.category === categoryFilter` — this still works
  after migration because both sides will be canonical keys.

Changes to make:

1. Add this import at the top of the file:
```typescript
import { SIGNAL_CATEGORIES, getCategoryLabel } from '@/constants/taxonomy';
import { PostCategory } from '@/integrations/firebase/types';
```

2. REMOVE the `uniqueCategories` useMemo entirely (lines ~228-231).

3. Replace the filter bar category chips section (the block that maps `uniqueCategories`)
   with a static list derived from `SIGNAL_CATEGORIES`:

```tsx
{/* ALL chip — always first */}
<FilterChip
  label={lang === 'fr' ? 'TOUT' : 'ALL'}
  active={categoryFilter === 'all'}
  onClick={() => setCategoryFilter('all')}
/>
{/* 5 canonical signal type chips — always in this order, correct language */}
{SIGNAL_CATEGORIES.map(cat => (
  <FilterChip
    key={cat.id}
    label={lang === 'fr' ? cat.labelFR : cat.labelEN}
    active={categoryFilter === cat.id}
    onClick={() => setCategoryFilter(cat.id)}
  />
))}
```

4. The existing filter logic in `visibleCards` (line ~238):
   `categoryFilter === 'all' || card.category === categoryFilter`
   — this is correct as-is. No change needed.

5. In the `toCard` function (line ~54), update the category fallback:
   Change: `category: post.category || 'Ideas',`
   To:     `category: post.category || 'analysis',`
   (The fallback is now a canonical key, not a freetext label)

Verify after change:
- Load `/en/blog` — filter bar shows: ALL · OPPORTUNITY · ANALYSIS · INVESTMENT · TECHNOTE · BUILDER
- Load `/fr/blog` — filter bar shows: TOUT · OPPORTUNITÉ · ANALYSE · INVESTISSEMENT · TECHNOTE · BÂTISSEUR
- TECHNOTE is identical in both. No duplicates. No misspellings.
- Clicking each filter correctly shows/hides articles.

Confirm: show the updated filter bar JSX section in full.
```

---

## PROMPT 7 — Frontend: Update category badges to use canonical labels

**Objective:** Every category badge rendered — in the blog card, in the article header, and in the "Read Next" related posts section — must use `getCategoryLabel()` instead of rendering the raw Firestore string. No hardcoded label strings in components.

```
You are working on the Afrinia React + Vite + Firebase project.

Task: Update category badge rendering in two files.

FILE 1: `src/pages/Blog.tsx`

In the inline `ArticleCard` component (around line 87), the badge renders:
  `{card.category}`
Change to:
  `{getCategoryLabel(card.category as PostCategory, lang)}`

Import needed (already added in Prompt 6):
  `getCategoryLabel` from `@/constants/taxonomy`
  `PostCategory` from `@/integrations/firebase/types`

---

FILE 2: `src/pages/BlogPost.tsx`

There are THREE places that render a raw category string in this file:

A) The `toRelatedCard` function (~line 74):
   `category: post.category || 'Ideas',`
   Change fallback to: `category: post.category || 'analysis',`

B) The article header category pill (~line 514):
   `{post.category}`
   The `post` here is `DisplayPost` (a local interface). The `DisplayPost.category` field
   is currently `string`. It holds the value set from `firebasePost.category`.
   Change the badge render to:
   `{getCategoryLabel((post.category as PostCategory) || 'analysis', lang)}`

C) The "Read Next" related post card badge (~line 677):
   `{card.category}`
   Change to:
   `{getCategoryLabel((card.category as PostCategory) || 'analysis', lang)}`

   `card` here is `RelatedCard` (a local interface with `category: string`).

Add this import near the top of BlogPost.tsx:
```typescript
import { getCategoryLabel } from '@/constants/taxonomy';
import { PostCategory } from '@/integrations/firebase/types';
```

---

Verify after changes:
- `/en/blog` — card badges show: OPPORTUNITY, INVESTMENT, BUILDER, etc. (English)
- `/fr/blog` — card badges show: OPPORTUNITÉ, INVESTISSEMENT, BÂTISSEUR, etc. (French)
- TECHNOTE appears identically in both languages.
- Open any article page — the category pill at the top shows the correct language label.
- "Read Next" related post badges also show the correct language label.

Confirm: show the updated badge lines in both files.
```

---

## PROMPT 8 — SEO: Add `articleSection` to the existing JSON-LD schema

**Objective:** Every article page already outputs a JSON-LD Article block via `usePageMeta`. Add `articleSection` (the canonical category label in the correct language) to this schema. This is a primary Google indexing signal that tells Google what type of content each article is.

```
You are working on the Afrinia React + Vite + Firebase project.

Task: Add `articleSection` to the JSON-LD schema in `src/pages/BlogPost.tsx`.

KEY FACTS:
- The JSON-LD is already implemented — it is passed as the `jsonLd` prop to `usePageMeta`
  starting around line 359. The `usePageMeta` hook injects it via `document.createElement('script')`
  client-side. This is a CSR app — the JSON-LD is injected by JavaScript, not in raw HTML.
  Google processes JavaScript and will read it, but it will NOT appear in raw page source before JS runs.
  This is a known CSR limitation. Do not flag it as a bug. It is noted and accepted for Phase 1.

- The existing JSON-LD object already has: `headline`, `description`, `image`, `url`,
  `inLanguage`, `datePublished`, `dateModified`, `author`, `publisher`, `keywords`, `isPartOf`.

Changes to make:

In the `jsonLd` object passed to `usePageMeta` (around line 369), add ONE new field:
```typescript
articleSection: getCategoryLabel((post.category as PostCategory) || 'analysis', lang),
```

The `post.category` at this point is the raw string from `DisplayPost` (set from Firestore).
After migration it will always be a canonical PostCategory key.

The full updated `jsonLd` object shape:
```typescript
jsonLd: post ? {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: post.title,
  description: post.summary,
  articleSection: getCategoryLabel((post.category as PostCategory) || 'analysis', lang),
  ...(post.featuredImageURL ? { image: post.featuredImageURL } : {}),
  url: postUrl,
  inLanguage: lang === 'fr' ? 'fr' : 'en',
  datePublished: post.date,
  dateModified: post.date,
  author: { '@type': 'Organization', name: 'Afrinia', url: 'https://afrinia.org' },
  publisher: {
    '@type': 'Organization',
    '@id': 'https://afrinia.org/#organization',
    name: 'Afrinia',
    url: 'https://afrinia.org',
  },
  keywords: post.tags.join(', '),
  isPartOf: {
    '@type': 'Blog',
    '@id': `${origin}/${lang}/blog`,
    name: lang === 'fr' ? 'Afrinia — Flux d\'Intelligence' : 'Afrinia Intelligence Feed',
  },
} : undefined,
```

No other changes to this file in this step.

Import needed (already added in Prompt 7):
  `getCategoryLabel` from `@/constants/taxonomy`
  `PostCategory` from `@/integrations/firebase/types`

Verify: open any article in a browser, open DevTools → Elements → search for
`application/ld+json` in the <head> — confirm the `articleSection` field is present
with the correct value for the page's language.

Confirm: show the updated `jsonLd` object in context.
```

---

## PROMPT 9 — SEO: Update the Netlify sitemap function

**Objective:** The dynamic sitemap already exists at `netlify/functions/sitemap.js` and already queries `posts_fr` and `posts_en`. This step adds proper `<xhtml:link>` hreflang alternates for the blog listing pages (already there) and verifies the function is working correctly end-to-end.

```
You are working on the Afrinia React + Vite + Firebase project.

Task: Verify and improve the existing sitemap Netlify Function at `netlify/functions/sitemap.js`.

KEY FACTS:
- This function already exists and works. DO NOT replace it.
- It already queries `posts_fr` and `posts_en` for published posts.
- The redirect in `netlify.toml` already has `force = true` (added in a previous session).
- The `public/_redirects` file already has `200!` (force flag).
- Articles in `posts_en` and `posts_fr` are independent documents — there is NO `slugFR`
  field linking an EN article to its FR equivalent. This means per-article hreflang alternates
  in the sitemap cannot be added without a future schema change. This is a Phase 2 concern.

What to verify in this step:

1. Open `netlify/functions/sitemap.js` and confirm:
   [ ] The blog listing hreflang block exists for both /en/blog and /fr/blog
       (look for `<xhtml:link rel="alternate" hreflang="fr"` in the urlBlock for blog pages)
   [ ] Every article URL from posts_fr is prefixed with `${DOMAIN}/fr/blog/`
   [ ] Every article URL from posts_en is prefixed with `${DOMAIN}/en/blog/`
   [ ] `Cache-Control` header is set

2. Test locally with Netlify CLI:
   `netlify dev`
   Then visit: `http://localhost:8888/sitemap.xml`
   Confirm it returns XML (not the static placeholder HTML).
   Confirm published articles appear in the XML output.

3. If the blog listing pages are missing hreflang blocks, add them following the existing
   pattern in the file. Do not add per-article hreflang (see KEY FACTS above).

Report: PASS or FAIL for each check above. Show the sitemap XML output for the blog listing
section only (the first 30 lines of XML output).
```

---

## PROMPT 10 — Verification: End-to-end audit of the complete signal architecture

**Objective:** Before considering this implementation complete, run a full verification sweep across every layer. Nothing passes until everything passes.

```
You are working on the Afrinia React + Vite + Firebase project.

Task: Run a complete verification audit of the signal architecture implementation.

Check each of the following and report PASS or FAIL with evidence:

DATA LAYER
[ ] 1. Run `node scripts/audit-categories.mjs` — confirm zero documents have a `category`
        value outside the 5 canonical keys: opportunity, analysis, investment, technote, builder.
[ ] 2. Confirm every published document has `categoryEN`, `categoryFR`, `sector`, and `region`
        fields present and non-empty.
[ ] 3. Confirm no document has the old freetext values: entrepreneurship, entrepreneuriat,
        entrepreneurialism, ideas, idées, opportunité (as a primary category key — valid in categoryFR),
        investissement (as a primary key), tech.

TYPE LAYER
[ ] 4. Confirm `src/integrations/firebase/types.ts` exports `PostCategory`, `PostSector`,
        `PostRegion` types and that `BlogPost.category` is typed as `PostCategory` (optional).
[ ] 5. Confirm no other file in the project defines duplicate category types.

CONSTANTS LAYER
[ ] 6. Confirm `src/constants/taxonomy.ts` exists and exports `SIGNAL_CATEGORIES`,
        `CATEGORY_LABEL_MAP`, `getCategoryLabel`, `SIGNAL_SECTORS`, `SIGNAL_REGIONS`.
[ ] 7. Confirm TECHNOTE has identical EN and FR labels: `'TECHNOTE'` / `'TECHNOTE'`.

ADMIN PANEL
[ ] 8. Navigate to `/admin/blog/new` in dev — confirm Signal Type is a dropdown with
        exactly 5 options, not a text input.
[ ] 9. Confirm Sector and Region dropdowns are present below Signal Type.
[ ] 10. Create a test article, save it — open Firestore Console → posts_en → find the doc
         → confirm it has `category`, `categoryEN`, `categoryFR`, `sector`, `region` fields.
         Delete the test article after confirming.

FRONTEND — EN BLOG (/en/blog)
[ ] 11. Filter bar shows exactly: ALL · OPPORTUNITY · ANALYSIS · INVESTMENT · TECHNOTE · BUILDER
         (in this order, all uppercase, in English).
[ ] 12. Click INVESTMENT — confirm only investment-tagged articles appear. Click ALL — all return.
[ ] 13. Open any article card — badge shows the English label (e.g. BUILDER, not BÂTISSEUR).

FRONTEND — FR BLOG (/fr/blog)
[ ] 14. Filter bar shows exactly: TOUT · OPPORTUNITÉ · ANALYSE · INVESTISSEMENT · TECHNOTE · BÂTISSEUR
         (in this order, all uppercase, in French).
[ ] 15. TECHNOTE appears identically in both EN and FR filter bars.
[ ] 16. Open any article card on FR route — badge shows French label (e.g. BÂTISSEUR, not BUILDER).
[ ] 17. Zero English filter labels appear on /fr/blog. Zero French filter labels appear on /en/blog.

ARTICLE DETAIL PAGE
[ ] 18. Open any article — the category pill below the title shows the correct language label.
[ ] 19. Open DevTools → Elements → search `application/ld+json` in <head> — confirm
         `articleSection` field is present with the correct language label.
         NOTE: JSON-LD is CSR-injected (client-side via useEffect). It will NOT appear in
         raw HTML source (Cmd+U). This is expected for a Vite CSR app and is accepted for Phase 1.

SITEMAP
[ ] 20. Run `netlify dev` → visit `http://localhost:8888/sitemap.xml` → confirm the function
         XML is returned (has <lastmod>, <changefreq>, <priority> tags — NOT the static placeholder
         comment "THIS FILE IS NO LONGER THE LIVE SITEMAP").
         Confirm published articles appear in the XML.

Report each check as PASS or FAIL. For every FAIL, state the exact file and line number.
Do not mark this task complete until all 20 checks pass.
```

---

## REFERENCE — Field naming convention (canonical, permanent)

| Firestore Field | TypeScript Type | Example Value | Notes |
|---|---|---|---|
| `category` | `PostCategory` | `'investment'` | Canonical key — used for queries and client-side filtering |
| `categoryEN` | `string` | `'INVESTMENT'` | Derived from category on save — display only, never typed manually |
| `categoryFR` | `string` | `'INVESTISSEMENT'` | Derived from category on save — display only, never typed manually |
| `sector` | `PostSector` | `'fintech'` | Secondary metadata — Firestore only in Phase 1 |
| `region` | `PostRegion` | `'west_africa'` | Tertiary metadata — Firestore only in Phase 1 |
| `country` (existing) | `string[]` (`target_countries`) | `['Nigeria']` | Existing field — keep unchanged |

## REFERENCE — Real file paths (use these, never guess)

| What | Actual path |
|---|---|
| Type definitions | `src/integrations/firebase/types.ts` |
| Taxonomy constants | `src/constants/taxonomy.ts` |
| Blog listing page | `src/pages/Blog.tsx` |
| Article detail page | `src/pages/BlogPost.tsx` |
| Admin editor | `src/components/admin/BlogPostEditor.tsx` |
| Blog service (Firestore) | `src/integrations/firebase/blogService.ts` |
| Page meta + JSON-LD hook | `src/utils/pageMeta.ts` |
| Dynamic sitemap function | `netlify/functions/sitemap.js` |
| Migration script | `scripts/migrate-categories.mjs` |
| Audit script | `scripts/audit-categories.mjs` |

---

*signalMapSkills.md — Afrinia Intelligence Platform*
*Signal Architecture v1.0 — Stack-corrected for React + Vite + React Router v6*
*Do not modify taxonomy constants without updating this document*
