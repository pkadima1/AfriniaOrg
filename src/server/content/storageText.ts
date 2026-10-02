/**
 * storageText.ts — reads a public text file from Firebase Storage (large
 * article bodies are stored there, see BlogPost.content_storage_path).
 * Anonymous, like a visitor: storage.rules make blog-content publicly
 * readable. Uses the Storage emulator during tests.
 */
import 'server-only';
import { FIREBASE_WEB_CONFIG } from '@/integrations/firebase/publicConfig';

export function storageFileUrl(path: string): string {
  const emulator = process.env.FIREBASE_STORAGE_EMULATOR_HOST;
  const base = emulator ? `http://${emulator}` : 'https://firebasestorage.googleapis.com';
  const bucket = emulator ? `${process.env.GCLOUD_PROJECT ?? 'demo-afrinia'}.appspot.com` : FIREBASE_WEB_CONFIG.storageBucket;
  return `${base}/v0/b/${bucket}/o/${encodeURIComponent(path)}?alt=media`;
}

/** The file's text, or null when it is missing (the caller keeps the in-document content). */
export async function fetchStorageText(path: string, tags: string[]): Promise<string | null> {
  const res = await fetch(storageFileUrl(path), { cache: 'force-cache', next: { tags } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Storage read of ${path} failed: HTTP ${res.status}`);
  return res.text();
}
