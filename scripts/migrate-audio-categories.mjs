/**
 * migrate-audio-categories.mjs — One-time migration of freetext audio episode categories.
 *
 * WHY this exists: audio_en and audio_fr accumulated the same freetext category mess as
 * posts_en/posts_fr. This maps every episode to one of the 5 canonical PostCategory keys
 * and adds categoryEN, categoryFR fields for display (no sector/region for audio in Phase 1).
 *
 * Run: node --env-file=.env scripts/migrate-audio-categories.mjs
 * IMPORTANT: This script WRITES to Firestore. Run audit first to verify the remap covers all values.
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const DB_NAME = 'afrinia';

// ── Category remap — covers all values found in the 2026-07-01 audio audit ───
// Keys are normalized (lowercase + trimmed). Values are canonical PostCategory keys.
const CATEGORY_REMAP = {
  // Builder variants (entrepreneurs, founders)
  'entrepreneurship':   'builder',
  'entrepreneurialism': 'builder',
  'entrepreneuriat':    'builder',
  'entreprenariat':     'builder',
  'entrepreneur':       'builder',
  'entrepreneurs':      'builder',
  'founder':            'builder',
  'founders':           'builder',
  'builder':            'builder',
  'builders':           'builder',
  'bâtisseur':          'builder',
  'bâtisseurs':         'builder',
  // Investment variants
  'investment':         'investment',
  'investissement':     'investment',
  'invest':             'investment',
  // Opportunity variants (including misspelling "oportunité" found in audio_fr)
  'opportunity':        'opportunity',
  'opportunities':      'opportunity',
  'opportunité':        'opportunity',
  'oportunité':         'opportunity',  // typo found in audio_fr
  'opportunite':        'opportunity',
  // Analysis / strategy variants
  'analysis':           'analysis',
  'analyse':            'analysis',
  'strategies':         'analysis',
  'strategy':           'analysis',
  'stratégies':         'analysis',
  'stratégie':          'analysis',
  'ideas':              'analysis',
  'idées':              'analysis',
  'market':             'analysis',
  'policy':             'analysis',
  // Technote variants
  'technote':           'technote',
  'tech':               'technote',
  'technology':         'technote',
  'innovation':         'technote',
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
  if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT env var missing. Run with: node --env-file=.env');
  let sa;
  try { sa = JSON.parse(raw); } catch { sa = JSON.parse(Buffer.from(raw, 'base64').toString('utf8')); }
  initializeApp({ credential: cert(sa) });
}

async function main() {
  initAdmin();
  const db = getFirestore(DB_NAME);
  const collections = ['audio_en', 'audio_fr'];

  let totalProcessed = 0;
  const unmapped = [];
  const errors = [];

  for (const col of collections) {
    const snapshot = await db.collection(col).get();
    console.log(`\nProcessing ${col} — ${snapshot.size} documents...`);

    const BATCH_SIZE = 400;
    for (let i = 0; i < snapshot.docs.length; i += BATCH_SIZE) {
      const batch = db.batch();
      const chunk = snapshot.docs.slice(i, i + BATCH_SIZE);

      for (const doc of chunk) {
        const rawCategory = doc.data().category ?? '';
        const normalized = String(rawCategory).toLowerCase().trim();

        let canonicalKey = CATEGORY_REMAP[normalized];
        if (!canonicalKey) {
          console.log(`  UNMAPPED — ${col}/${doc.id}: "${rawCategory}" → defaulted to analysis`);
          unmapped.push({ collection: col, id: doc.id, originalValue: rawCategory });
          canonicalKey = 'analysis';
        }

        const labels = LABEL_MAP[canonicalKey];
        batch.update(doc.ref, {
          category:   canonicalKey,
          categoryEN: labels.en,
          categoryFR: labels.fr,
        });

        totalProcessed++;
      }

      try {
        await batch.commit();
      } catch (err) {
        console.error(`  Batch error for ${col}:`, err.message);
        errors.push({ collection: col, error: err.message });
      }
    }
  }

  console.log('\n=== AUDIO MIGRATION SUMMARY ===');
  console.log(`  Total documents processed: ${totalProcessed}`);
  if (unmapped.length > 0) {
    console.log(`\n  UNMAPPED (defaulted to "analysis"):`);
    for (const u of unmapped) console.log(`    ${u.collection}/${u.id} — original: "${u.originalValue}"`);
  } else {
    console.log('  No unmapped documents — all values were in CATEGORY_REMAP.');
  }
  if (errors.length > 0) {
    console.log(`\n  ERRORS: ${errors.length}`);
  } else {
    console.log('  No Firestore errors.');
  }
}

main().catch(err => { console.error('\nScript failed:', err.message); process.exit(1); });
