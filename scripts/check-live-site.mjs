#!/usr/bin/env node
/**
 * check-live-site.mjs — checks what a crawler receives from a running Afrinia
 * site: HTTP status codes, redirects, security headers, raw-HTML head tags,
 * and the sitemap. No JavaScript is executed, exactly like a crawler's first pass.
 *
 * WHY: status codes, redirects and headers are set by Netlify config
 * (public/_redirects, netlify.toml), not by React, so only a real HTTP check
 * proves them. Run it against `netlify serve` locally, a deploy preview, and
 * production after every deploy that touches routing, headers or the sitemap.
 *
 * Usage:  npm run check:site -- --base https://afrinia.org
 *         npm run check:site -- --base http://localhost:8888
 * Exit code 0 = all checks passed, 1 = at least one failed.
 * Keep KNOWN_ROUTES in sync with src/App.tsx and public/_redirects.
 */

const args = process.argv.slice(2);
const baseArg = args[args.indexOf('--base') + 1];
if (!args.includes('--base') || !baseArg) {
  console.error('Usage: node scripts/check-live-site.mjs --base <origin>');
  process.exit(2);
}
const BASE = baseArg.replace(/\/$/, '');
const UA = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';

/** App routes that must answer 200 (mirror of public/_redirects whitelist). */
const KNOWN_ROUTES = [
  '/', '/about', '/contact', '/audio', '/builders', '/en/blog', '/fr/blog',
  '/privacy', '/terms', '/unsubscribed', '/profile', '/settings', '/admin',
];
/** Retired pages of the previous site — no equivalent content, so 404. */
const RETIRED_ROUTES = [
  '/services', '/products', '/example-systems', '/built-by', '/solutions',
  '/industrial-analytics', '/outreachos', '/pricing',
];
const REQUIRED_HEADERS = {
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'SAMEORIGIN',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'permissions-policy': 'camera=()',
};

const results = [];
function record(ok, name, detail = '') {
  results.push({ ok, name, detail });
}

async function get(path) {
  const res = await fetch(BASE + path, { redirect: 'manual', headers: { 'User-Agent': UA } });
  const body = await res.text();
  return { status: res.status, headers: res.headers, body };
}

/** Canonical / og:url values present in raw HTML. */
function headUrls(html) {
  const canonical = [...html.matchAll(/<link[^>]+rel="canonical"[^>]*href="([^"]+)"/g)].map(m => m[1]);
  const ogUrl = [...html.matchAll(/<meta[^>]+property="og:url"[^>]*content="([^"]+)"/g)].map(m => m[1]);
  return { canonical, ogUrl };
}

async function checkRoutesAnswer200(articlePaths) {
  for (const path of [...KNOWN_ROUTES, ...articlePaths]) {
    const r = await get(path);
    record(r.status === 200, `200  ${path}`, `got ${r.status}`);
    if (r.status !== 200) continue;
    record(r.body.includes('<div id="root">'), `app shell  ${path}`, 'index.html not served');
    // Raw HTML is shared by every URL, so it must not claim any page's identity.
    const { canonical, ogUrl } = headUrls(r.body);
    record(canonical.length === 0, `no static canonical  ${path}`, `found ${canonical.join(', ')}`);
    record(ogUrl.length === 0, `no static og:url  ${path}`, `found ${ogUrl.join(', ')}`);
    record(!r.body.includes('gptengineer'), `no gptengineer.js  ${path}`, 'third-party Lovable script still loaded');
  }
}

async function checkNotFound() {
  const unknown = `/this-page-does-not-exist-${Date.now()}`;
  for (const path of [unknown, `/fr${unknown}`, '/assets/missing-file.js', ...RETIRED_ROUTES]) {
    const r = await get(path);
    record(r.status === 404, `404  ${path}`, `got ${r.status}`);
    // Humans still get the app (its Not Found page / legacy redirect), not a bare error.
    if (r.status === 404) record(r.body.includes('<div id="root">'), `404 shows app  ${path}`, 'bare error page');
  }
}

async function checkRedirects() {
  const r = await get('/blog');
  const location = r.headers.get('location') || '';
  record(r.status === 301 && /\/fr\/blog$/.test(location), '301  /blog → /fr/blog', `got ${r.status} → ${location}`);
}

/**
 * Production only: other hostnames serving the site must 301 to afrinia.org,
 * or Google sees duplicate copies. Skipped for previews/localhost, whose own
 * hostname is intentionally not redirected.
 */
async function checkCanonicalHost() {
  if (BASE !== 'https://afrinia.org') return;
  const aliases = [
    ['https://afinia.netlify.app/fr/blog', 'https://afrinia.org/fr/blog'],
    ['https://www.afrinia.org/', 'https://afrinia.org/'],
    ['http://afrinia.org/', 'https://afrinia.org/'],
  ];
  for (const [from, to] of aliases) {
    const res = await fetch(from, { redirect: 'manual', headers: { 'User-Agent': UA } });
    const location = res.headers.get('location') || '';
    record(res.status === 301 && location === to, `301  ${from} → ${to}`, `got ${res.status} → ${location}`);
  }
}

async function checkHeaders() {
  const html = await get('/');
  // Assets are the files nosniff protects most; the first script in the shell is the app bundle.
  const bundle = html.body.match(/<script[^>]+type="module"[^>]+src="([^"]+)"/)?.[1];
  const targets = [['/', html.headers], ['/robots.txt', (await get('/robots.txt')).headers]];
  if (bundle) {
    const js = await get(bundle);
    targets.push([bundle, js.headers]);
    record(/javascript/.test(js.headers.get('content-type') || ''), `JS content-type  ${bundle}`, js.headers.get('content-type'));
  }
  for (const [path, headers] of targets) {
    for (const [name, expected] of Object.entries(REQUIRED_HEADERS)) {
      const value = headers.get(name) || '';
      record(value.includes(expected), `header ${name}  ${path}`, `got "${value}"`);
    }
  }
}

/** Returns one article path per language from the sitemap, for the 200 checks. */
async function checkSitemap() {
  const r = await get('/sitemap.xml');
  record(r.status === 200, '200  /sitemap.xml', `got ${r.status}`);
  record(/xml/.test(r.headers.get('content-type') || ''), 'sitemap content-type', r.headers.get('content-type'));
  record(r.body.trimEnd().endsWith('</urlset>'), 'sitemap well-formed end', 'truncated or invalid');
  const entries = r.body.split('<url>').slice(1);
  for (const path of ['/about', '/contact', '/privacy', '/terms']) {
    const entry = entries.find(e => e.includes(`<loc>https://afrinia.org${path}</loc>`));
    record(Boolean(entry) && !entry.includes('<lastmod>'), `sitemap ${path} has no invented lastmod`, entry ? 'lastmod present' : 'missing');
  }
  const locs = entries.map(e => e.match(/<loc>([^<]+)<\/loc>/)?.[1]).filter(Boolean);
  const pick = lang => locs.find(l => l.includes(`/${lang}/blog/`));
  return ['fr', 'en'].map(pick).filter(Boolean).map(u => new URL(u).pathname);
}

async function main() {
  console.log(`Checking ${BASE}\n`);
  const articlePaths = await checkSitemap();
  record(articlePaths.length > 0, 'sitemap lists articles', 'no /fr/blog/ or /en/blog/ URL found');
  if (articlePaths[0]) articlePaths.push(articlePaths[0].replace(/^\/(fr|en)\/blog\//, '/blog/'));
  await checkRoutesAnswer200(articlePaths);
  await checkNotFound();
  await checkRedirects();
  await checkCanonicalHost();
  await checkHeaders();

  const failed = results.filter(r => !r.ok);
  for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.ok ? '' : `  — ${r.detail}`}`);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed.`);
  process.exit(failed.length ? 1 : 0);
}

main().catch(err => {
  console.error('Check run crashed:', err);
  process.exit(1);
});
