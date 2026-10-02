/**
 * spaRoutes.ts — which URL paths belong to the app (HTTP 200) and which are
 * unknown (HTTP 404), decided on the server before the page is sent.
 *
 * WHY: during the migration the existing React Router app is one static
 * Next.js page (app/page.tsx) that proxy.ts serves for known paths. Without
 * this check every
 * URL would answer 200 and draw "404" in the browser — the "soft 404" that M0
 * removed. This list replaces the whitelist that lived in public/_redirects.
 * MUST mirror the <Route> list in src/App.tsx. Replaced by the route map as
 * pages move to server rendering (CLAUDE.md §10, M1 step 3 / M2).
 */

/** Paths that match exactly (case-sensitive: mixed-case URLs are not canonical). */
const EXACT_PATHS = new Set([
  '/',
  '/about',
  '/contact',
  '/audio',
  '/en/blog',
  '/fr/blog',
  '/en/builders',
  '/fr/builders',
  '/privacy',
  '/terms',
  '/unsubscribed',
  '/profile',
  '/settings',
  '/admin',
]);

/**
 * Prefixes followed by exactly ONE more segment (an article or profile slug).
 * /blog/<slug> is kept because the app redirects it client-side to the
 * browser language (TEMP until the M5 redirect map).
 */
const ONE_SEGMENT_PREFIXES = ['/en/blog/', '/fr/blog/', '/en/builders/', '/fr/builders/', '/blog/'];

/** Prefixes followed by any number of segments (admin sub-pages). */
const ANY_DEPTH_PREFIXES = ['/admin/'];

export function isKnownSpaPath(pathname: string): boolean {
  if (EXACT_PATHS.has(pathname)) return true;
  for (const prefix of ONE_SEGMENT_PREFIXES) {
    // Any one non-empty segment, exactly like the former `/fr/blog/*` rule: the
    // app itself shows Not Found for a slug that does not exist (until M2,
    // where the server checks the database and answers a real 404).
    if (pathname.startsWith(prefix)) {
      const rest = pathname.slice(prefix.length);
      return rest.length > 0 && !rest.includes('/');
    }
  }
  return ANY_DEPTH_PREFIXES.some(prefix => pathname.startsWith(prefix) && pathname.length > prefix.length);
}

/** Catch-all route params → pathname ("/" for the homepage). */
export function pathFromSlug(slug: string[] | undefined): string {
  return '/' + (slug ?? []).join('/');
}
