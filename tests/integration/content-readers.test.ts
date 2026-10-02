/**
 * Server content readers vs the emulator, with firestore.rules and
 * storage.rules enforced — the proof of decision D4: the server reads like an
 * anonymous visitor, so drafts never reach a page and a query that forgets
 * the `published` filter is refused instead of answered.
 * Seeding uses the emulator's owner token, which bypasses rules (like an
 * admin script); the readers under test use no credentials.
 */
import { beforeAll, describe, expect, test } from 'vitest';
import { getPublishedPost, getPublishedPosts } from '@/server/content/posts';
import { getPublishedBuilder, getPublishedBuilders } from '@/server/content/builders';
import { getEpisodeForPost, getPublishedEpisodes } from '@/server/content/audio';
import { firestoreTarget, runQuery } from '@/server/content/firestoreRest';

const FIRESTORE = process.env.FIRESTORE_EMULATOR_HOST;
const STORAGE = process.env.FIREBASE_STORAGE_EMULATOR_HOST;
const PROJECT = process.env.GCLOUD_PROJECT ?? 'demo-afrinia';
const OWNER = { Authorization: 'Bearer owner' };

/** Plain JS value → Firestore REST typed value (strings, numbers, arrays, maps). */
function encode(value: unknown): Record<string, unknown> {
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'number') return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (value === null) return { nullValue: null };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(encode) } };
  return { mapValue: { fields: Object.fromEntries(Object.entries(value as object).map(([k, v]) => [k, encode(v)])) } };
}

async function seedDoc(collection: string, id: string, data: Record<string, unknown>) {
  const { baseUrl, projectId, databaseId } = firestoreTarget();
  const url = `${baseUrl}/projects/${projectId}/databases/${databaseId}/documents/${collection}?documentId=${id}`;
  const res = await fetch(url, { method: 'POST', headers: { ...OWNER, 'Content-Type': 'application/json' }, body: JSON.stringify({ fields: encode(data).mapValue!.fields }) });
  if (!res.ok) throw new Error(`seed ${collection}/${id}: ${res.status} ${await res.text()}`);
}

async function seedStorage(path: string, body: string) {
  const url = `http://${STORAGE}/upload/storage/v1/b/${PROJECT}.appspot.com/o?uploadType=media&name=${encodeURIComponent(path)}`;
  const res = await fetch(url, { method: 'POST', headers: { ...OWNER, 'Content-Type': 'text/html' }, body });
  if (!res.ok) throw new Error(`seed storage ${path}: ${res.status} ${await res.text()}`);
}

const post = (slug: string, status: string, extra: Record<string, unknown> = {}) => ({
  slug, status, title: `Title ${slug}`, content: '<p>Body</p>', created_at: '2026-05-01T00:00:00.000Z', updated_at: '2026-05-01T00:00:00.000Z', ...extra,
});

beforeAll(async () => {
  if (!FIRESTORE || !STORAGE) throw new Error('Run via `npm run test:integration` (needs the emulators).');
  const { projectId } = firestoreTarget();
  await fetch(`http://${FIRESTORE}/emulator/v1/projects/${projectId}/databases/(default)/documents`, { method: 'DELETE' });

  await seedDoc('posts_fr', 'p1', post('le-coton', 'published', { created_at: '2026-05-07T00:00:00.000Z', content: '<p onclick="x()">Coton<script>alert(1)</script></p>' }));
  await seedDoc('posts_fr', 'p2', post('le-mirage', 'published', { created_at: '2026-04-16T00:00:00.000Z' }));
  await seedDoc('posts_fr', 'd1', post('brouillon-secret', 'draft'));
  await seedDoc('posts_fr', 'a1', post('archive', 'archived'));
  await seedDoc('posts_en', 'p3', post('cotton', 'published', { content: '', content_storage_path: 'blog-content/u1/p3.html' }));
  await seedStorage('blog-content/u1/p3.html', '<h2></h2><p style="color:red">Stored body</p><style>body{display:none}</style>');

  await seedDoc('builders_en', 'b1', { slug: 'aliko-dangote', name: 'Aliko Dangote', status: 'published', bio: 'b' });
  await seedDoc('builders_en', 'b2', { slug: 'zeta-founder', name: 'Zeta Founder', status: 'published', bio: 'b' });
  await seedDoc('builders_en', 'b3', { slug: 'draft-founder', name: 'Draft Founder', status: 'draft', bio: 'b' });

  await seedDoc('audio_fr', 'e1', { episode_number: 1, title: 'Ep 1', status: 'published', post_slug: 'le-coton' });
  await seedDoc('audio_fr', 'e2', { episode_number: 2, title: 'Ep 2', status: 'published' });
  await seedDoc('audio_fr', 'e3', { episode_number: 3, title: 'Ep 3 draft', status: 'draft', post_slug: 'le-mirage' });
});

describe('articles', () => {
  test('lists only published articles, newest first — never drafts or archived', async () => {
    const posts = await getPublishedPosts('fr');
    expect(posts.map(p => p.slug)).toEqual(['le-coton', 'le-mirage']);
  });

  test('a published article is found and its HTML is sanitized on the server', async () => {
    const p = await getPublishedPost('fr', 'le-coton');
    expect(p?.title).toBe('Title le-coton');
    expect(p?.content).toBe('<p>Coton</p>');
  });

  test('a draft or archived slug is "not found" (→ 404), never returned', async () => {
    expect(await getPublishedPost('fr', 'brouillon-secret')).toBeNull();
    expect(await getPublishedPost('fr', 'archive')).toBeNull();
    expect(await getPublishedPost('fr', 'does-not-exist')).toBeNull();
  });

  test('languages never mix', async () => {
    expect(await getPublishedPost('en', 'le-coton')).toBeNull();
    expect((await getPublishedPosts('en')).map(p => p.slug)).toEqual(['cotton']);
  });

  test('a body stored in Storage is fetched anonymously and cleaned the same way', async () => {
    const p = await getPublishedPost('en', 'cotton');
    expect(p?.content).toBe('<p>Stored body</p>');
  });
});

describe('builders and audio', () => {
  test('published builders only, alphabetical; drafts are not found', async () => {
    expect((await getPublishedBuilders('en')).map(b => b.slug)).toEqual(['aliko-dangote', 'zeta-founder']);
    expect(await getPublishedBuilder('en', 'draft-founder')).toBeNull();
    expect((await getPublishedBuilder('en', 'aliko-dangote'))?.decisionFrameworks).toEqual([]);
    expect(await getPublishedBuilders('fr')).toEqual([]);
  });

  test('published episodes only, latest first; an article\'s audio is found only if published', async () => {
    expect((await getPublishedEpisodes('fr')).map(e => e.episode_number)).toEqual([2, 1]);
    expect((await getEpisodeForPost('fr', 'le-coton'))?.title).toBe('Ep 1');
    expect(await getEpisodeForPost('fr', 'le-mirage')).toBeNull();
  });
});

describe('D4 — the rules, not the code, are the last line of defence', () => {
  test('a query that forgets the published filter is REFUSED by the rules (throws), not answered', async () => {
    await expect(runQuery('posts_fr', { where: {}, tags: [] })).rejects.toThrow(/HTTP 403/);
    await expect(runQuery('posts_fr', { where: { status: 'draft' }, tags: [] })).rejects.toThrow(/HTTP 403/);
    await expect(runQuery('builders_en', { where: { slug: 'draft-founder' }, tags: [] })).rejects.toThrow(/HTTP 403/);
  });

  test('private collections stay closed to the server reader', async () => {
    await expect(runQuery('comment_contacts', { where: {}, tags: [] })).rejects.toThrow(/HTTP 403/);
    await expect(runQuery('contact_messages', { where: {}, tags: [] })).rejects.toThrow(/HTTP 403/);
    await expect(runQuery('user_profiles', { where: {}, tags: [] })).rejects.toThrow(/HTTP 403/);
  });
});
