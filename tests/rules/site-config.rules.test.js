/**
 * Firestore rules tests for site settings (site_config): the footer and Contact
 * page read social links as anonymous visitors; only admins may change them.
 * Regression guard: social links used to live in `site_settings`, which no
 * rule covered — every admin save failed and visitors could not read them.
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

const links = [{ id: 'facebook', label: 'Facebook', url: 'https://www.facebook.com/x', enabled: true }];

beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async ctx => {
    const db = ctx.firestore();
    await db.doc('user_profiles/admin1').set({ role: 'admin' });
    await db.doc('user_profiles/editor1').set({ role: 'contributor' });
    await db.doc('site_config/social_links').set({ links });
  });
});

describe('site_config/social_links', () => {
  test('visitors can read the social links (footer, Contact page)', async () => {
    await assertSucceeds(env.unauthenticatedContext().firestore().doc('site_config/social_links').get());
  });

  test('only admins can save them', async () => {
    const save = db => db.doc('site_config/social_links').set({ links, updatedAt: 'now' });
    await assertFails(save(env.unauthenticatedContext().firestore()));
    await assertFails(save(env.authenticatedContext('editor1').firestore()));
    await assertSucceeds(save(env.authenticatedContext('admin1').firestore()));
  });

  test('the old, uncovered location stays closed', async () => {
    await assertFails(env.unauthenticatedContext().firestore().doc('site_settings/social_links').get());
    await assertFails(env.authenticatedContext('admin1').firestore().doc('site_settings/social_links').set({ links }));
  });
});
