# Afrinia

**Afrinia** is a bilingual (EN/FR) African business intelligence platform — built for African entrepreneurs, technologists, and builders. Ideas, systems, and case studies for those constructing the digital future of Africa.

## Tech stack

- **Vite** + **React** + **TypeScript**
- **Firebase** — Firestore (database), Storage (media), Authentication
- **Tailwind CSS** + **shadcn/ui** component library
- **react-i18next** — bilingual EN/FR localisation
- **react-router-dom v6** — client-side routing

## Local development

```sh
# 1. Clone the repository
git clone <YOUR_GIT_URL>

# 2. Navigate into the project
cd AfriniaOrgFolk

# 3. Install dependencies
npm install

# 4. Start the dev server
npm run dev
```

The app will be available at `http://localhost:8080`.

## Project structure

```
src/
  components/       # Reusable UI components
    admin/          # Admin-only components (editor, subscribers, social links…)
    auth/           # Auth guards (ProtectedRoute)
  contexts/         # React contexts (Auth)
  hooks/            # Custom hooks (useSocialLinks, use-toast…)
  integrations/
    firebase/       # Firebase config, Firestore services
  locales/          # i18n JSON files — en.json / fr.json
  pages/            # Route-level pages (About, Blog, Contact, Admin…)
  utils/            # Language utilities, helpers
```

## Admin panel

Accessible at `/admin` (requires authenticated user with `contributor` or `admin` role).

| Route | Access | Description |
|---|---|---|
| `/admin` | Contributor+ | Dashboard |
| `/admin/blog` | Contributor+ | Blog post list |
| `/admin/blog/new` | Contributor+ | Create post |
| `/admin/blog/edit/:id` | Contributor+ | Edit post |
| `/admin/audio` | Contributor+ | Audio episodes |
| `/admin/users` | Admin only | User management |
| `/admin/subscribers` | Admin only | Newsletter subscribers |
| `/admin/social` | Admin only | Social links settings |

## Deployment

Build for production:

```sh
npm run build
```

The `dist/` folder can be deployed to any static host (Firebase Hosting, Netlify, Vercel, etc.).
