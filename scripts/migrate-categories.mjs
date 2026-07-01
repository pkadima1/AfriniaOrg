/**
 * migrate-categories.mjs — One-time migration of freetext category values to canonical taxonomy.
 *
 * WHY this exists: Firestore posts_en and posts_fr accumulated freetext category values
 * (mixed case, trailing spaces, multiple languages) that break the filter bar and badges.
 * This script remaps every document to one of the 5 canonical PostCategory keys and adds
 * categoryEN, categoryFR, sector, and region fields.
 *
 * Run: node --env-file=.env scripts/migrate-categories.mjs
 * IMPORTANT: This script WRITES to Firestore. Review the CATEGORY_REMAP below before running.
 * Run audit-categories.mjs first to confirm all values are covered.
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const DB_NAME = 'afrinia';

// ── Category remap — covers every value found in the 2026-07-01 audit ─────────
// Keys are normalized (lowercase + trimmed). Values are canonical PostCategory keys.
const CATEGORY_REMAP = {
  // Entrepreneurship / builder variants
  'entrepreneurship':    'builder',
  'entrepreneurialism':  'builder',
  'entrepreneuriat':     'builder',
  'entreprenariat':      'builder',
  'entrepreneur':        'builder',
  'builders':            'builder',
  'builder':             'builder',
  // Investment variants
  'investment':          'investment',
  'investissement':      'investment',
  'invest':              'investment',
  // Opportunity variants (includes "opportunities" found in audit)
  'opportunity':         'opportunity',
  'opportunité':         'opportunity',
  'opportunite':         'opportunity',
  'opportunities':       'opportunity',
  // Tech / TechNote variants
  'technote':            'technote',
  'tech':                'technote',
  'technology':          'technote',
  'innovation':          'technote',
  // Analysis variants
  'analysis':            'analysis',
  'analyse':             'analysis',
  'ideas':               'analysis',
  'idées':               'analysis',
  'idea':                'analysis',
  'market':              'analysis',
  'marché':              'analysis',
  'policy':              'analysis',
  'politique':           'analysis',
};

// ── Display labels — mirrors CATEGORY_LABEL_MAP in src/constants/taxonomy.ts ──
const LABEL_MAP = {
  opportunity: { en: 'OPPORTUNITY',    fr: 'OPPORTUNITÉ'    },
  analysis:    { en: 'ANALYSIS',       fr: 'ANALYSE'        },
  investment:  { en: 'INVESTMENT',     fr: 'INVESTISSEMENT' },
  technote:    { en: 'TECHNOTE',       fr: 'TECHNOTE'       },
  builder:     { en: 'BUILDER',        fr: 'BÂTISSEUR'      },
};

function initAdmin() {
  if (getApps().length > 0) return;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) {
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT env var is missing. Run with: node --env-file=.env scripts/migrate-categories.mjs'
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

  let totalProcessed = 0;
  let totalRemapped = 0;
  const unmapped = [];
  const errors = [];

  for (const col of collections) {
    const snapshot = await db.collection(col).get();
    const docs = snapshot.docs;
    console.log(`\nProcessing ${col} — ${docs.length} documents...`);

    // Batch writes — Firestore max 500 per batch; we use 400 for safety
    const BATCH_SIZE = 400;
    for (let i = 0; i < docs.length; i += BATCH_SIZE) {
      const batch = db.batch();
      const chunk = docs.slice(i, i + BATCH_SIZE);

      for (const doc of chunk) {
        const data = doc.data();
        const rawCategory = data.category ?? '';
        const normalized = String(rawCategory).toLowerCase().trim();

        let canonicalKey = CATEGORY_REMAP[normalized];
        if (!canonicalKey) {
          console.log(`  UNMAPPED — ${col}/${doc.id}: original value "${rawCategory}" → defaulted to analysis`);
          unmapped.push({ collection: col, id: doc.id, originalValue: rawCategory });
          canonicalKey = 'analysis';
        }

        const labels = LABEL_MAP[canonicalKey];
        batch.update(doc.ref, {
          category:   canonicalKey,
          categoryEN: labels.en,
          categoryFR: labels.fr,
          sector:     'other',
          region:     'pan_african',
        });

        totalProcessed++;
      }

      try {
        await batch.commit();
        totalRemapped += chunk.length - (unmapped.length - (unmapped.filter(u => u.collection !== col).length));
      } catch (err) {
        console.error(`  Batch error for ${col} chunk ${i}:`, err.message);
        errors.push({ collection: col, chunkStart: i, error: err.message });
      }
    }
  }

  console.log('\n=== MIGRATION SUMMARY ===');
  console.log(`  Total documents processed: ${totalProcessed}`);
  console.log(`  Total successfully remapped: ${totalProcessed - errors.length}`);

  if (unmapped.length > 0) {
    console.log(`\n  UNMAPPED (defaulted to "analysis"):`);
    for (const u of unmapped) {
      console.log(`    ${u.collection}/${u.id} — original: "${u.originalValue}"`);
    }
  } else {
    console.log('  No unmapped documents — all values were in CATEGORY_REMAP.');
  }

  if (errors.length > 0) {
    console.log(`\n  ERRORS (${errors.length}):`);
    for (const e of errors) {
      console.log(`    ${e.collection} chunk@${e.chunkStart}: ${e.error}`);
    }
  } else {
    console.log('  No Firestore errors.');
  }
}

main().catch(err => {
  console.error('\nScript failed:', err.message);
  process.exit(1);
});
