/**
 * Firestore rules tests for builder profiles and contact-form messages.
 * Builders: published profiles are public; drafts and editing are for
 * contributors; deletion is admin-only. Contact messages hold personal data:
 * only admins may read or manage them, and browsers can never create them
 * (the send-contact function writes with the Admin SDK).
 * Runs against the local emulator only (project "demo-afrinia"):  npm run test:rules
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

const builder = (status) => ({ name: 'Aliko Dangote', slug: 'aliko-dangote', status });

beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async ctx => {
    const db = ctx.firestore();
    await db.doc('user_profiles/admin1').set({ role: 'admin' });
    await db.doc('user_profiles/editor1').set({ role: 'contributor' });
    await db.doc('user_profiles/viewer1').set({ role: 'viewer' });
    await db.doc('builders_en/published1').set(builder('published'));
    await db.doc('builders_en/draft1').set(builder('draft'));
    await db.doc('contact_messages/m1').set({ name: 'Amina', email: 'amina@example.com', message: 'Hello', status: 'new' });
  });
});

const anon = () => env.unauthenticatedContext().firestore();
const viewer = () => env.authenticatedContext('viewer1').firestore();
const editor = () => env.authenticatedContext('editor1').firestore();
const admin = () => env.authenticatedContext('admin1').firestore();

describe('builder profiles', () => {
  test('anyone can read published profiles; the public listing query is allowed', async () => {
    await assertSucceeds(anon().doc('builders_en/published1').get());
    await assertSucceeds(anon().collection('builders_en').where('status', '==', 'published').get());
  });

  test('drafts are hidden from visitors and signed-in viewers', async () => {
    await assertFails(anon().doc('builders_en/draft1').get());
    await assertFails(viewer().doc('builders_en/draft1').get());
    await assertFails(anon().collection('builders_en').get());
  });

  test('contributors can read drafts, create and edit; viewers cannot write', async () => {
    await assertSucceeds(editor().doc('builders_en/draft1').get());
    await assertSucceeds(editor().collection('builders_fr').add(builder('draft')));
    await assertSucceeds(editor().doc('builders_en/draft1').update({ status: 'published' }));
    await assertFails(viewer().collection('builders_fr').add(builder('draft')));
    await assertFails(anon().doc('builders_en/published1').update({ name: 'Defaced' }));
  });

  test('only admins can delete a profile', async () => {
    await assertFails(editor().doc('builders_en/published1').delete());
    await assertSucceeds(admin().doc('builders_en/published1').delete());
  });
});

describe('contact messages (personal data)', () => {
  test('visitors, viewers and contributors cannot read them', async () => {
    await assertFails(anon().doc('contact_messages/m1').get());
    await assertFails(viewer().collection('contact_messages').get());
    await assertFails(editor().doc('contact_messages/m1').get());
  });

  test('no browser can create one — not even an admin (the server function writes them)', async () => {
    await assertFails(anon().collection('contact_messages').add({ message: 'spam' }));
    await assertFails(admin().collection('contact_messages').add({ message: 'x' }));
  });

  test('admins can read, mark and delete them', async () => {
    await assertSucceeds(admin().doc('contact_messages/m1').get());
    await assertSucceeds(admin().doc('contact_messages/m1').update({ status: 'read' }));
    await assertSucceeds(admin().doc('contact_messages/m1').delete());
  });
});
