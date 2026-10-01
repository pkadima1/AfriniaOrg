/**
 * Storage rules tests — proves that "signed in" is not enough to touch the
 * team's media: users write only inside their own uid folder, legacy files are
 * read-only, and everything stays publicly readable for the site.
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

const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47]);
const MP3 = new Uint8Array([0x49, 0x44, 0x33]);
const image = { contentType: 'image/png' };
const audio = { contentType: 'audio/mpeg' };

before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-afrinia',
    storage: { rules: readFileSync('storage.rules', 'utf8') },
  });
});

after(async () => {
  await env.cleanup();
});

beforeEach(async () => {
  await env.clearStorage();
  // Existing files: one per owner folder, one legacy flat file per folder.
  await env.withSecurityRulesDisabled(async ctx => {
    const st = ctx.storage();
    await st.ref('blog-images/team1/cover.png').put(PNG, image);
    await st.ref('blog-images/legacy.png').put(PNG, image);
    await st.ref('builder-photos/team1/face.png').put(PNG, image);
    await st.ref('builder-photos/legacy.png').put(PNG, image);
    await st.ref('audio/fr/team1/ep001.mp3').put(MP3, audio);
    await st.ref('audio/fr/ep000-legacy.mp3').put(MP3, audio);
    await st.ref('audio-thumbnails/fr/team1/ep001.png').put(PNG, image);
    await st.ref('audio-thumbnails/fr/ep000-legacy.png').put(PNG, image);
  });
});

const anon = () => env.unauthenticatedContext().storage();
const team1 = () => env.authenticatedContext('team1').storage();
const stranger = () => env.authenticatedContext('stranger').storage();
const put = (st, path, data, meta) => Promise.resolve(st.ref(path).put(data, meta));

describe('image folders (blog-images, builder-photos)', () => {
  for (const folder of ['blog-images', 'builder-photos']) {
    test(`${folder}: anyone can read, so the site can show images`, async () => {
      await assertSucceeds(anon().ref(`${folder}/team1/${folder === 'blog-images' ? 'cover' : 'face'}.png`).getMetadata());
      await assertSucceeds(anon().ref(`${folder}/legacy.png`).getMetadata());
    });

    test(`${folder}: a signed-in stranger cannot replace or delete the team's images`, async () => {
      const own = folder === 'blog-images' ? 'cover' : 'face';
      await assertFails(put(stranger(), `${folder}/team1/${own}.png`, PNG, image));
      await assertFails(stranger().ref(`${folder}/team1/${own}.png`).delete());
      await assertFails(put(stranger(), `${folder}/team1/new.png`, PNG, image));
      // The hole that was live before owner folders: flat-path files.
      await assertFails(stranger().ref(`${folder}/legacy.png`).delete());
      await assertFails(put(stranger(), `${folder}/legacy.png`, PNG, image));
    });

    test(`${folder}: legacy flat-path files are read-only from the app, even for the team`, async () => {
      await assertFails(put(team1(), `${folder}/legacy.png`, PNG, image));
      await assertFails(team1().ref(`${folder}/legacy.png`).delete());
      await assertFails(put(team1(), `${folder}/new-flat.png`, PNG, image));
    });

    test(`${folder}: a user manages images in their own folder only`, async () => {
      await assertSucceeds(put(stranger(), `${folder}/stranger/mine.png`, PNG, image));
      await assertSucceeds(stranger().ref(`${folder}/stranger/mine.png`).delete());
      await assertSucceeds(put(team1(), `${folder}/team1/another.png`, PNG, image));
    });

    test(`${folder}: visitors cannot upload; non-images and files over 5 MB are rejected`, async () => {
      await assertFails(put(anon(), `${folder}/anon/x.png`, PNG, image));
      await assertFails(put(team1(), `${folder}/team1/script.js`, PNG, { contentType: 'text/javascript' }));
      await assertFails(put(team1(), `${folder}/team1/huge.png`, new Uint8Array(5 * 1024 * 1024 + 1), image));
    });
  }
});

describe('audio and audio covers', () => {
  test('anyone can read episodes and covers (the player needs no account)', async () => {
    await assertSucceeds(anon().ref('audio/fr/team1/ep001.mp3').getMetadata());
    await assertSucceeds(anon().ref('audio/fr/ep000-legacy.mp3').getMetadata());
    await assertSucceeds(anon().ref('audio-thumbnails/fr/team1/ep001.png').getMetadata());
  });

  test('a signed-in stranger cannot delete or replace episodes or covers', async () => {
    await assertFails(stranger().ref('audio/fr/team1/ep001.mp3').delete());
    await assertFails(put(stranger(), 'audio/fr/team1/ep001.mp3', MP3, audio));
    await assertFails(stranger().ref('audio-thumbnails/fr/team1/ep001.png').delete());
    await assertFails(stranger().ref('audio/fr/ep000-legacy.mp3').delete());
  });

  test('the uploader manages their own episodes; legacy episodes are read-only', async () => {
    await assertSucceeds(put(team1(), 'audio/en/team1/ep002.mp3', MP3, audio));
    await assertSucceeds(put(team1(), 'audio-thumbnails/en/team1/ep002.png', PNG, image));
    await assertSucceeds(team1().ref('audio/fr/team1/ep001.mp3').delete());
    await assertFails(team1().ref('audio/fr/ep000-legacy.mp3').delete());
  });

  test('only en/fr, and only the right file type', async () => {
    await assertFails(put(team1(), 'audio/de/team1/ep.mp3', MP3, audio));
    await assertFails(put(team1(), 'audio/fr/team1/ep.png', PNG, image));
    await assertFails(put(team1(), 'audio-thumbnails/fr/team1/cover.mp3', MP3, audio));
  });
});

describe('everything else', () => {
  test('unknown paths are closed to everyone', async () => {
    await assertFails(put(team1(), 'random/team1/file.png', PNG, image));
    await assertFails(anon().ref('random/file.png').getMetadata());
  });
});
