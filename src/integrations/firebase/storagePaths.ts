/**
 * storagePaths.ts — the one place upload paths are built.
 *
 * WHY: storage.rules lets a signed-in user write only inside a folder named
 * after their own uid (e.g. blog-images/{uid}/...). Anyone can create an
 * account, so this "owner folder" rule is what stops a stranger from replacing
 * or deleting images and audio uploaded by the team. Every upload must build
 * its path here so the code and the rules can never drift apart.
 * Used by: blogService, builderService, audioAdminService.
 */
import { auth } from '@/integrations/firebase/config';

/** Top-level Storage folders that use per-user owner folders. */
export type OwnedFolder = 'blog-images' | 'builder-photos' | `audio/${'en' | 'fr'}` | `audio-thumbnails/${'en' | 'fr'}`;

/**
 * `{folder}/{uid}/{fileName}` for the signed-in user.
 * Throws when nobody is signed in — Storage would reject the upload anyway,
 * and failing here gives a clear error instead of a permission-denied one.
 */
export function ownedStoragePath(folder: OwnedFolder, fileName: string): string {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('You must be signed in to upload files.');
  return `${folder}/${uid}/${fileName}`;
}

/** A unique, safe file name that keeps the original extension. */
export function uniqueFileName(file: File): string {
  const ext = file.name.includes('.') ? file.name.split('.').pop() : 'bin';
  return `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;
}
