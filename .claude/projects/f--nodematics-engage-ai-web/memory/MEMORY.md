# NodeMatics Web — Project Memory

## Project Identity
- **Repo**: nodematics-engage-ai-web
- **Brand**: NodeMatics — "Systems that give time back."
- **Stack**: React 18 + TypeScript + Vite + shadcn/ui + Tailwind + React Router v6
- **Package manager**: Bun (`bun.lockb` present)
- **Auth/DB**: Firebase (Auth + Firestore + Storage) — migrated from Supabase
- **Deployment**: Netlify (`public/_redirects`)
- **i18n**: i18next, en.json + fr.json in `src/locales/`

## Key Files
- `CLAUDE.md` — Full project reference (created 2026-03-05)
- `src/App.tsx` — All routes defined here
- `src/components/Layout.tsx` — Wraps Header + content + Footer
- `src/components/Header.tsx` — Sticky nav with mobile hamburger + auth UserMenu
- `src/contexts/AuthContext.tsx` — Firebase auth state management
- `src/integrations/firebase/` — All Firebase services
- `src/locales/en.json` + `fr.json` — All UI strings (always update both)
- `firestore.rules` — Firestore security rules (in project root)
- `docs/mission.md` — OutreachOS landing page spec

## Brand Colors (Tailwind tokens)
- `accent-blue` = `#3B82F6`
- `accent-purple` = `#8B5CF6`
- `dark-bg` / `dark-surface` / `dark-card` = dark navy layers
- Custom classes: `apple-button`, `glass-effect`, `gradient-text`, `card-hover`, `home-section-divider`

## OutreachOS Landing Page
- **Spec**: `docs/mission.md`
- **Location**: `public/outreachos/index.html` (standalone HTML, NOT React)
- **URL**: `nodematics.com/outreachos`
- **Key**: Self-contained HTML file — jsPDF from CDN, Google Fonts, all CSS/JS inline
- **9 sections**: Nav, Hero, Problem, How It Works, Numbers, Who It's For, Pricing, Download CTA, Footer
- **PDF**: 7-page OutreachOS Introduction generated client-side via jsPDF
- **Pricing**: £397 / £797 / £1,497 one-time + £97/month optional maintenance

## Architecture Patterns
- Page components use `<Layout>` + `<PageHeader>` pattern
- All UI strings go through `t()` — never hardcode
- Auth: always use `useAuth()` hook
- Firebase services: use `src/integrations/firebase/` services, never call Firestore directly from pages
- DO NOT use Supabase client — fully migrated to Firebase

## Current Branch
`dbMigrationAndFocuReposition` — has uncommitted changes in firestore.rules, AuthContext, Profile, Settings

## Conventions
- No emojis in UI unless brand-appropriate
- Keep tone: calm, confident, intelligent
- shadcn/ui components from `src/components/ui/`
- Both en.json AND fr.json must be updated for any new string

See `CLAUDE.md` for full project reference.
