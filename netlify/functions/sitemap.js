/**
 * Dynamic sitemap — served at /sitemap.xml via Netlify redirect.
 *
 * Every request queries Firestore live for all published articles.
 * No deployment needed when a new article is published via the admin panel.
 *
 * Collections queried: posts_fr, posts_en
 * Only documents with status == 'published' are included.
 *
 * Runtime: Netlify Functions v2 (export default — no Lambda 4KB env var limit)
 */

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

// Public Firebase web config — same project as the frontend (not a secret).
const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyCibUT3NtqVG-vJjjgkuGFZZBA-1bXiGVg',
  projectId: 'modified-hull-203004',
  appId: '1:17223733952:web:b10b841c6642161ab65325',
};

const DOMAIN  = 'https://afrinia.org';
// Named Firestore database — matches VITE_FIRESTORE_DATABASE_ID in .env
const DB_NAME = 'afrinia';

// Reuse the Firebase app across warm function invocations.
let _db = null;
function getDb() {
  if (_db) return _db;
  const app = getApps().length ? getApps()[0] : initializeApp(FIREBASE_CONFIG);
  _db = getFirestore(app, DB_NAME);
  return _db;
}

// Query a collection for all published slugs + their last-modified date.
async function fetchPublished(db, col) {
  try {
    const snap = await getDocs(
      query(collection(db, col), where('status', '==', 'published'))
    );
    return snap.docs.map(d => {
      const data = d.data();
      return { slug: data.slug, updated_at: data.updated_at };
    });
  } catch (err) {
    console.error(`[sitemap] error fetching ${col}:`, err.message);
    return [];
  }
}

// Convert a Firestore timestamp (object or ISO string) to YYYY-MM-DD.
function toDate(ts) {
  if (!ts) return new Date().toISOString().slice(0, 10);
  if (typeof ts === 'string') return ts.slice(0, 10);
  if (typeof ts === 'object') {
    const sec = ts.seconds ?? ts._seconds;
    if (typeof sec === 'number') return new Date(sec * 1000).toISOString().slice(0, 10);
  }
  return new Date().toISOString().slice(0, 10);
}

// Build a single <url> block.
function urlBlock(loc, lastmod, changefreq, priority) {
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

export default async () => {
  const db    = getDb();
  const today = new Date().toISOString().slice(0, 10);

  // Fetch both language collections in parallel.
  const [frPosts, enPosts] = await Promise.all([
    fetchPublished(db, 'posts_fr'),
    fetchPublished(db, 'posts_en'),
  ]);

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset',
    '  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '  xmlns:xhtml="http://www.w3.org/1999/xhtml"',
    '>',
    '',
    '  <!-- Static pages -->',
    urlBlock(`${DOMAIN}/`, today, 'weekly', '1.0'),
    urlBlock(`${DOMAIN}/about`, today, 'monthly', '0.8'),
    '',
    '  <!-- Blog listings — hreflang: same page type, two language variants -->',
    `  <url>
    <loc>${DOMAIN}/fr/blog</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
    <xhtml:link rel="alternate" hreflang="fr"        href="${DOMAIN}/fr/blog"/>
    <xhtml:link rel="alternate" hreflang="en"        href="${DOMAIN}/en/blog"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${DOMAIN}/fr/blog"/>
  </url>`,
    `  <url>
    <loc>${DOMAIN}/en/blog</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
    <xhtml:link rel="alternate" hreflang="en"        href="${DOMAIN}/en/blog"/>
    <xhtml:link rel="alternate" hreflang="fr"        href="${DOMAIN}/fr/blog"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${DOMAIN}/fr/blog"/>
  </url>`,
    urlBlock(`${DOMAIN}/audio`, today, 'weekly', '0.7'),
    urlBlock(`${DOMAIN}/contact`, today, 'yearly', '0.6'),
    urlBlock(`${DOMAIN}/builders`, today, 'monthly', '0.5'),
    urlBlock(`${DOMAIN}/privacy`, today, 'yearly', '0.4'),
    urlBlock(`${DOMAIN}/terms`, today, 'yearly', '0.4'),
    '',
    '  <!-- Francophone Africa articles (audience: FR-speaking Africa) -->',
    ...frPosts.map(p =>
      urlBlock(`${DOMAIN}/fr/blog/${p.slug}`, toDate(p.updated_at), 'monthly', '0.9')
    ),
    '',
    '  <!-- Anglophone Africa articles (audience: EN-speaking Africa) -->',
    ...enPosts.map(p =>
      urlBlock(`${DOMAIN}/en/blog/${p.slug}`, toDate(p.updated_at), 'monthly', '0.9')
    ),
    '',
    '</urlset>',
  ].join('\n');

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=UTF-8',
      // Cache for 1 hour — Googlebot re-crawls sitemaps infrequently anyway.
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
};
