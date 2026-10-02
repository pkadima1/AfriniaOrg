/**
 * proxy.ts — decides, before any page renders, whether a URL is a page of the
 * app (→ the static app shell, HTTP 200) or unknown (→ Next.js's static
 * not-found page, HTTP 404). Runs after next.config.ts redirects/headers.
 *
 * WHY: without it, unknown URLs would get the app with HTTP 200 and a "404"
 * drawn in the browser — the soft 404 that M0 removed. The list of known
 * paths lives in src/routing/spaRoutes.ts (unit-tested).
 * Temporary by design: in M2 each page becomes a real route and this file
 * shrinks to nothing.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { isKnownSpaPath } from '@/routing/spaRoutes';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname !== '/' && isKnownSpaPath(pathname)) {
    // Same HTML for every app route; the browser keeps its URL and React
    // Router renders the right page from it.
    return NextResponse.rewrite(new URL('/', request.url));
  }
  // "/" is the shell itself; anything else matches no route → 404.
  return NextResponse.next();
}

export const config = {
  // Skip Next.js internals, Netlify functions and any path with a file
  // extension (robots.txt, favicon, images, /sitemap.xml…): those are files.
  matcher: ['/((?!_next/|\\.netlify/|.*\\.[a-zA-Z0-9]+$).*)'],
};
