/**
 * Shared document mappers — the browser services and the server readers both
 * use them, so a post looks identical whichever side read it.
 */
import { describe, expect, test } from 'vitest';
import { mapBuilder, mapEpisode, mapPost } from './mappers';

const upper = (html: string) => html.toUpperCase();

describe('mapPost', () => {
  test('keeps fields, sets the id, cleans the content with the given cleaner', () => {
    const post = mapPost('id1', { slug: 'le-coton', title: 'Le Coton', content: '<p>x</p>', status: 'published' }, upper);
    expect(post).toMatchObject({ id: 'id1', slug: 'le-coton', title: 'Le Coton', content: '<P>X</P>', status: 'published' });
  });

  test('dates: ISO strings kept, Timestamp-like objects converted, published_at optional', () => {
    const post = mapPost('id', { created_at: '2026-05-07T18:50:26.397Z', updated_at: { seconds: 1778179826 } }, upper);
    expect(post.created_at).toBe('2026-05-07T18:50:26.397Z');
    expect(post.updated_at).toBe('2026-05-07T18:50:26.000Z');
    expect(post.published_at).toBeUndefined();
  });

  test('a missing body is passed through, not cleaned', () => {
    expect(mapPost('id', { content_storage_path: 'blog-content/u/id.html' }, upper).content).toBeUndefined();
  });
});

describe('mapBuilder', () => {
  test('list fields default to empty arrays', () => {
    const b = mapBuilder('b1', { name: 'Aliko Dangote', slug: 'aliko-dangote', status: 'published' });
    expect(b).toMatchObject({ id: 'b1', countries: [], decisionFrameworks: [], keyFailures: [], mentalModels: [] });
  });
});

describe('mapEpisode', () => {
  test('stored fields kept, id set', () => {
    expect(mapEpisode('e1', { episode_number: 3, title: 'Ep' })).toEqual({ id: 'e1', episode_number: 3, title: 'Ep' });
  });
});
