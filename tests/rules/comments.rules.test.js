/**
 * Firestore rules tests for comments — proves who can read/write what.
 * Guarantees under test: commenter emails are never publicly readable; comments
 * accept only the expected shape; contact emails can only be attached while
 * creating one's own comment; moderation is admin-only.
 * Runs against the local emulator only (project "demo-afrinia" — no network,
 * cannot touch production):  npm run test:rules
 */

import { readFileSync } from 'node:fs';
import { after, before, beforeEach, describe, test } from 'node:test';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';

let env;

before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-afrinia',
    firestore: { rules: readFileSync('firestore.rules', 'utf8') },
  });
});

after(async () => {
  await env.cleanup();
});

beforeEach(async () => {
  await env.clearFirestore();
  // Seed roles and existing documents with rules bypassed (as an admin script would).
  await env.withSecurityRulesDisabled(async ctx => {
    const db = ctx.firestore();
    await db.doc('user_profiles/admin1').set({ role: 'admin', email: 'admin@afrinia.org' });
    await db.doc('user_profiles/viewer1').set({ role: 'viewer', email: 'reader@example.com' });
    await db.doc('comments_fr/existing').set(validComment('fr'));
    await db.doc('comment_contacts/existing').set(validContact('existing', 'fr'));
    await db.doc('comments/legacy1').set({ name: 'Old', email: 'old@example.com', message: 'hi' });
  });
});

const NOW = '2026-09-30T12:00:00.000Z';

function validComment(lang, overrides = {}) {
  return {
    post_slug: 'le-coton-africain',
    lang,
    name: 'Amina',
    message: 'Très bonne analyse.',
    parent_id: null,
    created_at: NOW,
    updated_at: NOW,
    ...overrides,
  };
}

function validContact(commentId, lang, overrides = {}) {
  return {
    email: 'amina@example.com',
    comment_id: commentId,
    lang,
    post_slug: 'le-coton-africain',
    created_at: NOW,
    ...overrides,
  };
}

const anon = () => env.unauthenticatedContext().firestore();
const viewer = () => env.authenticatedContext('viewer1', { email: 'reader@example.com' }).firestore();
const admin = () => env.authenticatedContext('admin1', { email: 'admin@afrinia.org' }).firestore();

describe('public comments — create', () => {
  test('anyone can post a valid comment in each language', async () => {
    await assertSucceeds(anon().collection('comments_en').add(validComment('en')));
    await assertSucceeds(anon().collection('comments_fr').add(validComment('fr')));
  });

  test('a reply (parent_id set) is accepted', async () => {
    await assertSucceeds(anon().collection('comments_fr').add(validComment('fr', { parent_id: 'existing' })));
  });

  test('an email address inside the public comment is rejected', async () => {
    await assertFails(anon().collection('comments_fr').add(validComment('fr', { email: 'amina@example.com' })));
  });

  test('email: null (sent by the pre-fix app bundle) is still accepted', async () => {
    await assertSucceeds(anon().collection('comments_fr').add(validComment('fr', { email: null })));
  });

  test('unexpected fields are rejected', async () => {
    await assertFails(anon().collection('comments_fr').add(validComment('fr', { is_admin: true })));
  });

  test('language must match the collection', async () => {
    await assertFails(anon().collection('comments_en').add(validComment('fr')));
  });

  test('missing required fields are rejected', async () => {
    const { message: _omitted, ...noMessage } = validComment('fr');
    await assertFails(anon().collection('comments_fr').add(noMessage));
  });

  test('empty or oversized name/message are rejected', async () => {
    const col = anon().collection('comments_fr');
    await assertFails(col.add(validComment('fr', { name: '' })));
    await assertFails(col.add(validComment('fr', { name: 'x'.repeat(81) })));
    await assertSucceeds(col.add(validComment('fr', { name: 'x'.repeat(80) })));
    await assertFails(col.add(validComment('fr', { message: '' })));
    await assertFails(col.add(validComment('fr', { message: 'x'.repeat(2001) })));
    await assertSucceeds(col.add(validComment('fr', { message: 'x'.repeat(2000) })));
  });

  test('wrong types are rejected', async () => {
    const col = anon().collection('comments_fr');
    await assertFails(col.add(validComment('fr', { parent_id: 42 })));
    await assertFails(col.add(validComment('fr', { name: 123 })));
    await assertFails(col.add(validComment('fr', { updated_at: '2030-01-01T00:00:00.000Z' })));
  });
});

describe('public comments — read and moderation', () => {
  test('anyone can read comments', async () => {
    await assertSucceeds(anon().doc('comments_fr/existing').get());
    await assertSucceeds(anon().collection('comments_fr').where('post_slug', '==', 'le-coton-africain').get());
  });

  test('visitors and signed-in non-admins cannot edit or delete comments', async () => {
    await assertFails(anon().doc('comments_fr/existing').update({ message: 'defaced' }));
    await assertFails(anon().doc('comments_fr/existing').delete());
    await assertFails(viewer().doc('comments_fr/existing').update({ message: 'defaced' }));
    await assertFails(viewer().doc('comments_fr/existing').delete());
  });

  test('admins can moderate', async () => {
    await assertSucceeds(admin().doc('comments_fr/existing').update({ message: 'edited' }));
    await assertSucceeds(admin().doc('comments_fr/existing').delete());
  });
});

describe('private commenter emails (comment_contacts)', () => {
  test('comment + email in one batch succeeds (the app flow)', async () => {
    const db = anon();
    const ref = db.collection('comments_fr').doc();
    const batch = db.batch();
    batch.set(ref, validComment('fr'));
    batch.set(db.doc(`comment_contacts/${ref.id}`), validContact(ref.id, 'fr'));
    await assertSucceeds(batch.commit());
  });

  test('an email cannot be attached to someone else\'s existing comment', async () => {
    await env.withSecurityRulesDisabled(ctx => ctx.firestore().doc('comments_fr/noemail').set(validComment('fr')));
    await assertFails(anon().doc('comment_contacts/noemail').set(validContact('noemail', 'fr')));
  });

  test('an email without any comment is rejected', async () => {
    await assertFails(anon().doc('comment_contacts/ghost').set(validContact('ghost', 'fr')));
  });

  test('invalid, oversized or mismatched contact data is rejected', async () => {
    const attempt = async overrides => {
      const db = anon();
      const ref = db.collection('comments_fr').doc();
      const batch = db.batch();
      batch.set(ref, validComment('fr'));
      batch.set(db.doc(`comment_contacts/${ref.id}`), validContact(ref.id, 'fr', overrides(ref.id)));
      return batch.commit();
    };
    await assertFails(attempt(() => ({ email: 'not-an-email' })));
    await assertFails(attempt(() => ({ email: `${'x'.repeat(250)}@example.com` })));
    await assertFails(attempt(() => ({ comment_id: 'other-id' })));
    await assertFails(attempt(() => ({ lang: 'en' })));
    await assertFails(attempt(() => ({ post_slug: 'a-different-article' })));
    await assertFails(attempt(() => ({ extra: 'field' })));
  });

  test('nobody but an admin can read commenter emails', async () => {
    await assertFails(anon().doc('comment_contacts/existing').get());
    await assertFails(anon().collection('comment_contacts').get());
    await assertFails(viewer().doc('comment_contacts/existing').get());
    await assertSucceeds(admin().doc('comment_contacts/existing').get());
  });

  test('contact emails are never updated; only admins delete them', async () => {
    await assertFails(admin().doc('comment_contacts/existing').update({ email: 'x@example.com' }));
    await assertFails(anon().doc('comment_contacts/existing').delete());
    await assertFails(viewer().doc('comment_contacts/existing').delete());
    await assertSucceeds(admin().doc('comment_contacts/existing').delete());
  });
});

describe('legacy comments collection', () => {
  test('is no longer publicly readable (it holds emails)', async () => {
    await assertFails(anon().doc('comments/legacy1').get());
    await assertFails(anon().collection('comments').get());
    await assertFails(viewer().doc('comments/legacy1').get());
  });

  test('admins can still read and delete it; nobody can write', async () => {
    await assertSucceeds(admin().doc('comments/legacy1').get());
    await assertFails(admin().collection('comments').add({ name: 'x', message: 'y' }));
    await assertSucceeds(admin().doc('comments/legacy1').delete());
  });
});
