#!/usr/bin/env node
/**
 * seo-check.mjs — what a search engine's first pass sees, page by page.
 * Fetches every URL in the sitemap WITHOUT running JavaScript (like a
 * crawler) and checks the raw HTML: status, language, title, description,
 * canonical, hreflang, one H1, real body text, Article structured data.
 * Plus negative checks: unknown article/builder slugs must answer 404.
 *
 * WHY: the site's indexing problems (Search Console: soft 404s, duplicate
 * canonicals, "crawled – not indexed") all came from what the raw HTML did
 * or did not contain. Until M2, pages are drawn by JavaScript, so most checks
 * fail by design — this report is M2's to-do list; from M2 it is a hard gate
 * (CLAUDE.md §10). Spec: .claude/skills/verify/SKILL.md.
 *
 * Usage:  npm run seo:check -- --base https://afrinia.org [--urls file.txt] [--summary]
 * Exit code 0 = every check passed, 1 = at least one failed.
 */
import { readFileSync } from 'node:fs';
import { checkPage } from './lib/seo-rules.mjs';

const args = process.argv.slice(2);
const arg = name => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
const BASE = arg('--base')?.replace(/\/$/, '');
if (!BASE) {
  console.error('Usage: node scripts/seo-check.mjs --base <origin> [--urls file] [--summary]');
  process.exit(2);
}
const SUMMARY_ONLY = args.includes('--summary');
const UA = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
/** Netlify draft deploys (<id>--afinia.netlify.app) carry X-Robots-Tag: noindex by design. */
const IS_DRAFT = /^https:\/\/[0-9a-f]+--afinia\.netlify\.app$/.test(BASE);

async function fetchPage(path) {
  const res = await fetch(BASE + path, { redirect: 'manual', headers: { 'User-Agent': UA } });
  const robots = IS_DRAFT ? '' : res.headers.get('x-robots-tag') ?? '';
  return { status: res.status, location: res.headers.get('location') ?? '', robots, html: await res.text() };
}

async function sitemapPaths() {
  const file = arg('--urls');
  const urls = file
    ? readFileSync(file, 'utf8').split('\n').map(l => l.trim()).filter(Boolean)
    : [...(await (await fetch(`${BASE}/sitemap.xml`)).text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  return urls.map(u => new URL(u).pathname);
}

async function negativeChecks() {
  const results = [];
  const probe = Date.now().toString(36);
  for (const path of [`/fr/blog/no-such-article-${probe}`, `/en/blog/no-such-article-${probe}`, `/en/builders/no-such-profile-${probe}`, `/no-such-page-${probe}`]) {
    const { status } = await fetchPage(path);
    results.push({ path, fails: status === 404 ? [] : [{ rule: 'unknown-404', detail: `got ${status}` }] });
  }
  return results;
}

async function main() {
  const paths = await sitemapPaths();
  console.log(`seo:check ${BASE} — ${paths.length} sitemap URLs (raw HTML, no JavaScript)`);
  if (IS_DRAFT) console.log('Draft deploy: Netlify\'s X-Robots-Tag noindex header is ignored (meta robots still checked).');
  console.log('');
  const seenTitles = new Map();
  const results = [];
  for (const path of paths) results.push({ path, fails: checkPage(path, await fetchPage(path), seenTitles) });
  results.push(...(await negativeChecks()));

  const failing = results.filter(r => r.fails.length);
  if (!SUMMARY_ONLY) {
    for (const r of results) {
      console.log(`${r.fails.length ? 'FAIL' : 'PASS'}  ${r.path}`);
      for (const f of r.fails) console.log(`        ✗ ${f.rule}: ${f.detail}`);
    }
  }
  const byRule = {};
  for (const r of failing) for (const f of r.fails) byRule[f.rule] = (byRule[f.rule] ?? 0) + 1;
  console.log(`\n${results.length - failing.length}/${results.length} URLs pass.`);
  if (failing.length) console.log('Failures by rule:', JSON.stringify(byRule));
  process.exit(failing.length ? 1 : 0);
}

main().catch(err => {
  console.error('seo:check crashed:', err);
  process.exit(1);
});
