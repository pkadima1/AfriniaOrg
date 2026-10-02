/**
 * firestoreRest.ts — server-side, read-only access to Firestore over its
 * public REST API, WITHOUT credentials.
 *
 * WHY no credentials (decision D4): the server reads exactly like an
 * anonymous visitor, so firestore.rules decide what it can see — a coding
 * mistake cannot leak a draft (a query without the `status == published`
 * filter is refused by the rules and throws here). Responses are cached by
 * Next.js under `tags`, so publishing can refresh just the affected pages
 * (decision D5, wired in M4).
 *
 * Sequence: build a structured query → POST :runQuery → decode Firestore's
 * typed values into plain objects → callers map them (mappers.ts).
 * Tests point it at the local emulator via FIRESTORE_EMULATOR_HOST (set by
 * `firebase emulators:exec`); production never sets that variable.
 */
import 'server-only';
import { FIREBASE_WEB_CONFIG, FIRESTORE_DATABASE_ID } from '@/integrations/firebase/publicConfig';

export interface FirestoreDoc {
  id: string;
  data: Record<string, unknown>;
}

interface Target {
  baseUrl: string;
  projectId: string;
  databaseId: string;
}

/** Production, or the emulator during tests (default database there). */
export function firestoreTarget(): Target {
  const emulator = process.env.FIRESTORE_EMULATOR_HOST;
  if (emulator) {
    return { baseUrl: `http://${emulator}/v1`, projectId: process.env.GCLOUD_PROJECT ?? 'demo-afrinia', databaseId: '(default)' };
  }
  return { baseUrl: 'https://firestore.googleapis.com/v1', projectId: FIREBASE_WEB_CONFIG.projectId, databaseId: FIRESTORE_DATABASE_ID };
}

// ── Typed value decoding ──────────────────────────────────────────────────────

type FirestoreValue = Record<string, unknown>;

/** Firestore REST encodes every value with its type (e.g. {stringValue: "x"}). */
export function decodeValue(value: FirestoreValue): unknown {
  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return Number(value.doubleValue);
  if ('booleanValue' in value) return value.booleanValue;
  if ('nullValue' in value) return null;
  if ('timestampValue' in value) return value.timestampValue; // ISO string
  if ('referenceValue' in value) return value.referenceValue;
  if ('bytesValue' in value) return value.bytesValue;
  if ('geoPointValue' in value) return value.geoPointValue;
  if ('arrayValue' in value) {
    const values = (value.arrayValue as { values?: FirestoreValue[] }).values ?? [];
    return values.map(decodeValue);
  }
  if ('mapValue' in value) {
    return decodeFields((value.mapValue as { fields?: Record<string, FirestoreValue> }).fields ?? {});
  }
  return undefined;
}

export function decodeFields(fields: Record<string, FirestoreValue>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(fields).map(([key, v]) => [key, decodeValue(v)]));
}

/** A REST document → {id, data}; the id is the last segment of its name. */
export function decodeDocument(doc: { name: string; fields?: Record<string, FirestoreValue> }): FirestoreDoc {
  return { id: doc.name.split('/').pop() ?? '', data: decodeFields(doc.fields ?? {}) };
}

// ── Queries ───────────────────────────────────────────────────────────────────

export interface QueryOptions {
  /** Equality filters, e.g. { status: 'published', slug }. */
  where: Record<string, string>;
  limit?: number;
  /** Next.js cache tags for on-demand revalidation (D5). */
  tags: string[];
}

function encodeFilter(field: string, value: string) {
  return { fieldFilter: { field: { fieldPath: field }, op: 'EQUAL', value: { stringValue: value } } };
}

/**
 * Run a query on one collection. Throws on any non-OK answer — including a
 * rules refusal (403), which means the query itself is wrong (e.g. it asks
 * for drafts) and must never be silently treated as "no content".
 */
export async function runQuery(collectionId: string, options: QueryOptions): Promise<FirestoreDoc[]> {
  const { baseUrl, projectId, databaseId } = firestoreTarget();
  const filters = Object.entries(options.where).map(([field, value]) => encodeFilter(field, value));
  const structuredQuery = {
    from: [{ collectionId }],
    ...(filters.length === 1 ? { where: filters[0] } : {}),
    ...(filters.length > 1 ? { where: { compositeFilter: { op: 'AND', filters } } } : {}),
    ...(options.limit ? { limit: options.limit } : {}),
  };

  const res = await fetch(`${baseUrl}/projects/${projectId}/databases/${databaseId}/documents:runQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ structuredQuery }),
    cache: 'force-cache',
    next: { tags: options.tags },
  });
  if (!res.ok) {
    throw new Error(`Firestore query on ${collectionId} failed: HTTP ${res.status} ${await res.text()}`);
  }
  const rows = (await res.json()) as Array<{ document?: { name: string; fields?: Record<string, FirestoreValue> } }>;
  return rows.filter(row => row.document).map(row => decodeDocument(row.document!));
}
