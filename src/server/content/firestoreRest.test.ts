/**
 * Decoding of Firestore REST values. Every field shown on a server-rendered
 * page passes through decodeValue, so each Firestore type is pinned here.
 */
import { describe, expect, test } from 'vitest';
import { decodeDocument, decodeValue } from './firestoreRest';

describe('decodeValue', () => {
  test('scalars', () => {
    expect(decodeValue({ stringValue: 'Le Coton' })).toBe('Le Coton');
    expect(decodeValue({ integerValue: '42' })).toBe(42);
    expect(decodeValue({ doubleValue: 1.5 })).toBe(1.5);
    expect(decodeValue({ booleanValue: true })).toBe(true);
    expect(decodeValue({ nullValue: null })).toBeNull();
    expect(decodeValue({ timestampValue: '2026-05-07T18:50:26.397Z' })).toBe('2026-05-07T18:50:26.397Z');
  });

  test('arrays and maps, nested', () => {
    expect(decodeValue({ arrayValue: { values: [{ stringValue: 'NG' }, { stringValue: 'GH' }] } })).toEqual(['NG', 'GH']);
    expect(decodeValue({ arrayValue: {} })).toEqual([]);
    expect(decodeValue({
      mapValue: { fields: { title: { stringValue: 'Cadre' }, sources: { arrayValue: { values: [{ mapValue: { fields: { url: { stringValue: 'https://x' } } } }] } } } },
    })).toEqual({ title: 'Cadre', sources: [{ url: 'https://x' }] });
    expect(decodeValue({ mapValue: {} })).toEqual({});
  });

  test('an unknown type decodes to undefined rather than a wrong value', () => {
    expect(decodeValue({ somethingNew: 1 })).toBeUndefined();
  });
});

describe('decodeDocument', () => {
  test('the id is the last segment of the document name', () => {
    const doc = decodeDocument({
      name: 'projects/p/databases/afrinia/documents/posts_fr/abc123',
      fields: { slug: { stringValue: 'le-coton' }, status: { stringValue: 'published' } },
    });
    expect(doc).toEqual({ id: 'abc123', data: { slug: 'le-coton', status: 'published' } });
  });

  test('a document without fields', () => {
    expect(decodeDocument({ name: 'projects/p/databases/d/documents/c/x' })).toEqual({ id: 'x', data: {} });
  });
});
