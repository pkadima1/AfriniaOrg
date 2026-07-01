/**
 * audit-categories.mjs — Read-only audit of all category values in Firestore.
 *
 * WHY this exists: Before migrating category data, we need to know exactly what
 * freetext values exist so the CATEGORY_REMAP in migrate-categories.mjs is complete.
 *
 * Connects to: Firestore named database "afrinia", collections posts_en + posts_fr.
 *
 * Run: node --env-file=.env scripts/audit-categories.mjs
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const DB_NAME = 'afrinia';

function initAdmin() {
  if (getApps().length > 0) return;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) {
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT env var is missing. Run with: node --env-file=.env scripts/audit-categories.mjs'
    );
  }
  let serviceAccount;
  try {
    serviceAccount = JSON.parse(raw);
  } catch {
    serviceAccount = JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));
  }
  initializeApp({ credential: cert(serviceAccount) });
}

async function main() {
  initAdmin();
  const db = getFirestore(DB_NAME);
  const collections = ['posts_en', 'posts_fr'];
  const results = {};

  for (const col of collections) {
    const snapshot = await db.collection(col).get();
    results[col] = snapshot.docs.map(doc => ({
      id: doc.id,
      category: doc.data().category ?? null,
      tags: doc.data().tags ?? [],
      status: doc.data().status ?? null,
    }));
  }

  // SECTION A — EXISTING CATEGORY VALUES IN posts_en
  console.log('\n=== SECTION A — EXISTING CATEGORY VALUES IN posts_en ===');
  const enCategories = {};
  for (const doc of results.posts_en) {
    const cat = doc.category;
    if (cat !== null && cat !== undefined && cat !== '') {
      enCategories[cat] = (enCategories[cat] || 0) + 1;
    }
  }
  const enEntries = Object.entries(enCategories).sort((a, b) => b[1] - a[1]);
  if (enEntries.length === 0) {
    console.log('  (none found)');
  } else {
    for (const [cat, count] of enEntries) {
      console.log(`  "${cat}" → ${count} document(s)`);
    }
  }

  // SECTION B — EXISTING CATEGORY VALUES IN posts_fr
  console.log('\n=== SECTION B — EXISTING CATEGORY VALUES IN posts_fr ===');
  const frCategories = {};
  for (const doc of results.posts_fr) {
    const cat = doc.category;
    if (cat !== null && cat !== undefined && cat !== '') {
      frCategories[cat] = (frCategories[cat] || 0) + 1;
    }
  }
  const frEntries = Object.entries(frCategories).sort((a, b) => b[1] - a[1]);
  if (frEntries.length === 0) {
    console.log('  (none found)');
  } else {
    for (const [cat, count] of frEntries) {
      console.log(`  "${cat}" → ${count} document(s)`);
    }
  }

  // SECTION C — DOCUMENTS WITH MISSING/EMPTY CATEGORY
  console.log('\n=== SECTION C — DOCUMENTS WITH MISSING/EMPTY CATEGORY ===');
  let missingCount = 0;
  for (const col of collections) {
    for (const doc of results[col]) {
      if (doc.category === null || doc.category === undefined || doc.category === '') {
        console.log(`  ${col}/${doc.id}`);
        missingCount++;
      }
    }
  }
  if (missingCount === 0) {
    console.log('  (none — all documents have a category value)');
  }

  // SECTION D — STATUS BREAKDOWN
  console.log('\n=== SECTION D — STATUS BREAKDOWN (both collections combined) ===');
  const statusCounts = {};
  for (const col of collections) {
    for (const doc of results[col]) {
      const status = doc.status || '(missing)';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    }
  }
  for (const [status, count] of Object.entries(statusCounts).sort()) {
    console.log(`  ${status}: ${count} document(s)`);
  }

  console.log('\n=== TOTALS ===');
  console.log(`  posts_en: ${results.posts_en.length} documents`);
  console.log(`  posts_fr: ${results.posts_fr.length} documents`);
  console.log(`  Total: ${results.posts_en.length + results.posts_fr.length} documents`);
}

main().catch(err => {
  console.error('\nScript failed:', err.message);
  process.exit(1);
});
