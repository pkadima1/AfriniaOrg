/**
 * Dynamic sitemap — served at /sitemap.xml (the function claims that path via
 * `config.path` below).
 *
 * Every request queries Firestore live for all published articles.
 * No deployment needed when a new article is published via the admin panel.
 *
 * Collections queried: posts_fr, posts_en, builders_fr, builders_en
 * Only documents with status == 'published' are included.
 * XML building (incl. the real-dates-only <lastmod> rule) lives in
 * lib/sitemap-xml.js so it can be unit-tested without Firebase.
 *
 * Runtime: Netlify Functions v2 (export default — no Lambda 4KB env var limit)
 */

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { buildSitemapXml } from './lib/sitemap-xml.js';

// Public Firebase web config — same project as the frontend (not a secret).
const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyCibUT3NtqVG-vJjjgkuGFZZBA-1bXiGVg',
  projectId: 'modified-hull-203004',
  appId: '1:17223733952:web:b10b841c6642161ab65325',
};

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

// Query a collection for all published slugs + the dates lastmod is derived from.
async function fetchPublished(db, col) {
  try {
    const snap = await getDocs(
      query(collection(db, col), where('status', '==', 'published'))
    );
    return snap.docs.map(d => {
      const data = d.data();
      return {
        slug: data.slug,
        updated_at: data.updated_at,
        published_at: data.published_at,
        created_at: data.created_at,
      };
    });
  } catch (err) {
    console.error(`[sitemap] error fetching ${col}:`, err.message);
    return [];
  }
}

export default async () => {
  const db = getDb();

  // Fetch all published content in parallel. A failed collection yields [] —
  // the rest of the sitemap is still served.
  const [frPosts, enPosts, frBuilders, enBuilders] = await Promise.all([
    fetchPublished(db, 'posts_fr'),
    fetchPublished(db, 'posts_en'),
    fetchPublished(db, 'builders_fr'),
    fetchPublished(db, 'builders_en'),
  ]);

  return new Response(buildSitemapXml({ frPosts, enPosts, frBuilders, enBuilders }), {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=UTF-8',
      // Cache for 1 hour — Googlebot re-crawls sitemaps infrequently anyway.
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
};

// The function owns /sitemap.xml directly. WHY not a redirect rule: a rewrite
// from /sitemap.xml to /.netlify/functions/sitemap was only honoured by
// production git builds — draft deploys and `netlify serve` ignored it and fell
// through to other rules, so the sitemap could not be tested before release.
export const config = { path: '/sitemap.xml' };
