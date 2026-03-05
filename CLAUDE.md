# CLAUDE.md — NodeMatics Web (nodematics-engage-ai-web)

## Project Overview

**NodeMatics** is a systems engineering studio website. The site serves as the main marketing and authority platform for NodeMatics, showcasing their Google Workspace automation services and products.

**Live site**: nodematics.com
**Lovable project**: https://lovable.dev/projects/5289dd59-ccf8-4692-b7a2-042a06264194
**Deployment**: Netlify (`public/_redirects` present)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript + Vite |
| UI Library | shadcn/ui + Radix UI primitives |
| Styling | Tailwind CSS (custom design tokens) |
| Routing | React Router v6 |
| Auth | Firebase Authentication |
| Database | Firestore (migrated FROM Supabase) |
| Storage | Firebase Storage |
| i18n | i18next (en + fr locales) |
| Package manager | Bun (lockfile: bun.lockb) |

---

## Brand Identity

- **Background**: dark navy `#0F172A` (primary), white `#FFFFFF`, dark surface `bg-dark-surface`
- **Primary accent**: Electric blue `#3B82F6` (`accent-blue`)
- **Secondary accent**: Purple `#8B5CF6` (`accent-purple`)
- **Success/proof**: Green `#10B981`
- **Warning/urgency**: Amber `#F59E0B`
- **Body font**: Inter / system-ui
- **Tone**: calm, confident, intelligent — NOT hype, NOT salesy
- **Logo**: `/NodeMatics_Logo.png` (public dir) — used in Header and Footer
- **Tagline**: "Systems that give time back."

### Tailwind Custom Tokens (in use throughout)
- `bg-dark-bg`, `bg-dark-surface`, `bg-dark-card`
- `text-accent-blue`, `text-accent-purple`, `text-text-secondary`
- `glass-effect` — header backdrop blur class
- `apple-button` — primary CTA button class
- `gradient-text` — blue-to-purple text gradient
- `card-hover` — hover shadow animation
- `home-section-divider` — section separator line

---

## Directory Structure

```
src/
  App.tsx                  # Root router (all routes defined here)
  main.tsx                 # Entry point + i18n init
  App.css                  # Minimal base styles
  pages/
    Index.tsx              # Home page (7 sections with images from Firebase Storage)
    About.tsx
    Products.tsx           # EngagePerfect product showcase
    Services.tsx
    ExampleSystems.tsx
    BuiltBy.tsx            # Products built by NodeMatics (EngagePerfect, Veil)
    Solutions.tsx
    Pricing.tsx
    Contact.tsx
    Privacy.tsx
    Terms.tsx
    Blog.tsx
    BlogPost.tsx
    IndustrialAnalytics.tsx
    NotFound.tsx
    Profile.tsx            # Authenticated user profile (Firebase)
    Settings.tsx           # Password change, account settings (Firebase)
    admin/BlogAdmin.tsx    # Admin blog editor (AdminRoute protected)
  components/
    Layout.tsx             # Wraps Header + children + Footer
    Header.tsx             # Sticky nav, mobile hamburger, LanguageSwitcher, UserMenu
    Footer.tsx             # Multi-column footer with all links
    PageHeader.tsx         # Reusable page hero header
    ContactForm.tsx        # Contact form
    ContactInfo.tsx
    EmojiPicker.tsx
    LanguageSwitcher.tsx   # EN/FR toggle
    ResponseTime.tsx
    SocialShare.tsx
    auth/
      AuthModal.tsx        # Sign in / sign up modal (Firebase)
      ProtectedRoute.tsx   # AdminRoute + ContributorRoute wrappers
      UserMenu.tsx         # User avatar dropdown (auth state)
    admin/
      BlogPostEditor.tsx
      BlogPostList.tsx
      UserManagement.tsx
    ui/                    # Full shadcn/ui component library
  contexts/
    AuthContext.tsx        # Firebase auth state + Firestore profile management
  integrations/
    firebase/
      config.ts            # Firebase app init (auth, db, storage exports)
      types.ts             # UserRole, COLLECTIONS, getCurrentTimestamp
      blogService.ts       # Blog CRUD (Firestore) + image upload (Storage)
      commentService.ts    # Comment CRUD (Firestore)
      userService.ts       # User profile CRUD (Firestore)
    supabase/              # LEGACY — Supabase client still present but NOT actively used
  locales/
    en.json                # English translations (all UI strings)
    fr.json                # French translations
  hooks/
    use-mobile.tsx
public/
  NodeMatics_Logo.png      # Main logo asset
  favicon.ico
  _redirects               # Netlify SPA routing rule
  outreachos/              # OutreachOS standalone landing page (see below)
docs/
  mission.md               # OutreachOS landing page brief/spec
```

---

## Routes (App.tsx)

| Path | Component | Auth |
|---|---|---|
| `/` | Index | Public |
| `/about` | About | Public |
| `/products` | Products | Public |
| `/services` | Services | Public |
| `/example-systems` | ExampleSystems | Public |
| `/built-by` | BuiltBy | Public |
| `/solutions` | Solutions | Public |
| `/industrial-analytics` | IndustrialAnalytics | Public |
| `/pricing` | Pricing | Public |
| `/contact` | Contact | Public |
| `/privacy` | Privacy | Public |
| `/terms` | Terms | Public |
| `/blog` | Blog | Public |
| `/blog/:slug` | BlogPost | Public |
| `/profile` | Profile | Redirect if unauth |
| `/settings` | Settings | Redirect if unauth |
| `/admin/*` | BlogAdmin | AdminRoute |

---

## Firebase Architecture

**Collections** (Firestore):
- `user_profiles/{userId}` — UserProfile docs (role: viewer/contributor/admin)
- `blog_posts/{postId}` — Blog posts with author, status, slug, content
- `comments/{commentId}` — Blog comments

**Role hierarchy**: viewer (1) < contributor (2) < admin (3)

**Security rules**: `firestore.rules` at root — public read for published blogs, contributors can write, admins have full access.

**Auth flow**: Firebase Auth → `onAuthStateChanged` → Firestore profile fetch/create → `AuthContext` state

**Storage**: Firebase Storage for blog images and user avatars, accessed via `uploadBlogImage()` in blogService.

---

## i18n Pattern

All UI strings go through `useTranslation()` hook:
```tsx
const { t } = useTranslation();
t('home.hero.headline')  // → "We design systems that give time back."
```

Locale files: `src/locales/en.json` and `src/locales/fr.json`. Always add new strings to BOTH files.

---

## OutreachOS Landing Page

**Location**: `public/outreachos/index.html` (standalone HTML file, NOT part of React app)
**URL**: `nodematics.com/outreachos`
**Spec**: `docs/mission.md`

This is a complete, self-contained HTML file with:
- All CSS and JS inline
- Google Fonts (Inter) from CDN
- jsPDF from cdnjs.cloudflare.com for PDF generation
- No React, no Tailwind, no build step required
- 9 sections as per mission.md spec
- PDF download triggers 7-page OutreachOS Introduction document

---

## Development Workflow

```bash
bun install          # Install dependencies
bun run dev          # Start dev server (Vite)
bun run build        # Production build
bun run preview      # Preview production build
```

The `dist/` folder is committed (unusual — probably for direct deployment or preview).

---

## Key Conventions

1. **Page pattern**: Use `<Layout>` wrapper + `<PageHeader>` for inner pages
2. **Translations**: Always use `t()` — never hardcode UI strings
3. **Firebase**: Use services in `src/integrations/firebase/` — don't call Firestore directly from pages
4. **Auth state**: Always use `useAuth()` hook — never import Firebase auth directly in pages
5. **Supabase**: DO NOT use the Supabase client — project has fully migrated to Firebase
6. **Styling**: Use Tailwind custom tokens (`accent-blue`, `dark-surface`, etc.) over raw hex values
7. **Images**: Main site images hosted on Firebase Storage CDN; referenced by URL in components

---

## Current Status & In-Progress Work

**Branch**: `dbMigrationAndFocuReposition`

**Recent changes (uncommitted)**:
- `firestore.rules` — Security rules updates
- `AuthContext.tsx` — Auth state improvements
- `Profile.tsx` — Profile page updates
- `Settings.tsx` — Settings page updates

**OutreachOS page**: Standalone HTML landing page to be built as per `docs/mission.md`.

---

## Known Issues / Notes

- Supabase client files (`src/integrations/supabase/`) still exist but are legacy — only Firebase is active
- `AuthModal_FIXED.tsx` and `AuthModal_New.tsx` appear to be experimental iterations alongside `AuthModal.tsx`
- The `dist/` directory being committed suggests a workflow where built files are tracked — be careful not to accidentally overwrite
- Products page (`Products.tsx`) is focused on EngagePerfect (AI content tool), but the main NodeMatics positioning is Google Workspace automation systems
