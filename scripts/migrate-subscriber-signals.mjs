/**
 * migrate-subscriber-signals.mjs — one-time migration.
 *
 * Adds signals: [] to every document in newsletter_subscribers that does not
 * already have a signals field. Idempotent — safe to re-run.
 *
 * Run: node --env-file=.env scripts/migrate-subscriber-signals.mjs
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const DB_NAME = 'afrinia';
const COLLECTION = 'newsletter_subscribers';
const BATCH_LIMIT = 400;

function initAdmin() {
  if (getApps().length > 0) return;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT env var is missing.');
  let sa;
  try {
    sa = JSON.parse(raw);
  } catch {
    sa = JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));
  }
  initializeApp({ credential: cert(sa) });
}

initAdmin();
const db = getFirestore(DB_NAME);

const snap = await db.collection(COLLECTION).get();
console.log(`\nTotal documents in ${COLLECTION}: ${snap.size}`);

let updated = 0;
let skipped = 0;
let errors  = 0;

// Chunk into batches of BATCH_LIMIT
const docs = snap.docs;
for (let i = 0; i < docs.length; i += BATCH_LIMIT) {
  const chunk = docs.slice(i, i + BATCH_LIMIT);
  const batch = db.batch();
  let batchWrites = 0;

  for (const doc of chunk) {
    const data = doc.data();
    if (Array.isArray(data.signals)) {
      skipped++;
      continue;
    }
    batch.update(doc.ref, { signals: [] });
    batchWrites++;
    updated++;
  }

  if (batchWrites > 0) {
    try {
      await batch.commit();
    } catch (err) {
      console.error(`Batch commit error (docs ${i}–${i + chunk.length}):`, err.message);
      errors += batchWrites;
      updated -= batchWrites;
    }
  }
}

console.log('\n── Migration Summary ───────────────────────────────');
console.log(`  Total documents : ${snap.size}`);
console.log(`  Updated         : ${updated}  (signals: [] added)`);
console.log(`  Skipped         : ${skipped}  (signals field already present)`);
console.log(`  Errors          : ${errors}`);
console.log('────────────────────────────────────────────────────\n');
