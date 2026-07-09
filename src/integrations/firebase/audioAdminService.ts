import {
  ref,
  uploadBytesResumable,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
} from 'firebase/firestore';
import { db, storage } from '@/integrations/firebase/config';
import {
  AudioEpisode,
  PostCategory,
  getAudioCollectionForLang,
} from '@/integrations/firebase/types';

export interface AudioUploadMetadata {
  episode_number: number;
  title: string;
  duration: string;
  category?: PostCategory;
  categoryEN?: string;   // derived display label (EN) — never typed manually
  categoryFR?: string;   // derived display label (FR) — never typed manually
  description?: string;
  status: 'draft' | 'published';
  lang: 'en' | 'fr';
  /** Optional cover image file — uploaded to audio-thumbnails/{lang}/ */
  imageFile?: File;
  /** Optional slug of the article this episode is the audio version of —
   *  BlogPost.tsx shows an inline player when a published episode links here. */
  post_slug?: string;
}

export type UploadProgressCallback = (progress: number) => void;

/**
 * Upload an audio file to Firebase Storage under audio/{lang}/{filename},
 * then create a matching Firestore document in the audio_en or audio_fr collection.
 * Returns the full AudioEpisode record (with the Storage download URL).
 */
export async function uploadAudioEpisode(
  file: File,
  metadata: AudioUploadMetadata,
  onProgress?: UploadProgressCallback,
): Promise<AudioEpisode> {
  // Sanitise filename: keep only safe characters
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const epPadded = String(metadata.episode_number).padStart(3, '0');
  const storagePath = `audio/${metadata.lang}/ep${epPadded}-${safeName}`;
  const storageRef = ref(storage, storagePath);

  // 1 — Upload to Storage with progress tracking
  await new Promise<void>((resolve, reject) => {
    const task = uploadBytesResumable(storageRef, file, {
      contentType: file.type || 'audio/mpeg',
    });
    task.on(
      'state_changed',
      snap =>
        onProgress?.(
          Math.round((snap.bytesTransferred / snap.totalBytes) * 100),
        ),
      reject,
      () => resolve(),
    );
  });

  // 2 — Get the public download URL
  const audio_url = await getDownloadURL(storageRef);

  // 3 — Optionally upload cover image to audio-thumbnails/{lang}/
  let featured_image_url: string | null = null;
  let image_storage_path: string | null = null;

  if (metadata.imageFile) {
    const safeImg = metadata.imageFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const imgPath = `audio-thumbnails/${metadata.lang}/ep${epPadded}-${safeImg}`;
    const imgRef = ref(storage, imgPath);
    await uploadBytes(imgRef, metadata.imageFile, {
      contentType: metadata.imageFile.type || 'image/jpeg',
    });
    featured_image_url = await getDownloadURL(imgRef);
    image_storage_path = imgPath;
  }

  // 4 — Write Firestore document
  const now = new Date().toISOString();
  const col = getAudioCollectionForLang(metadata.lang);
  const docRef = await addDoc(collection(db, col), {
    episode_number: metadata.episode_number,
    title: metadata.title,
    duration: metadata.duration,
    category:   metadata.category   ?? null,
    categoryEN: metadata.categoryEN ?? null,
    categoryFR: metadata.categoryFR ?? null,
    description: metadata.description ?? null,
    post_slug: metadata.post_slug ?? null,
    audio_storage_path: storagePath,
    audio_url,
    featured_image_url,
    image_storage_path,
    status: metadata.status,
    lang: metadata.lang,
    published_at: metadata.status === 'published' ? now : null,
    created_at: now,
    updated_at: now,
  });

  return {
    id: docRef.id,
    episode_number: metadata.episode_number,
    title: metadata.title,
    duration: metadata.duration,
    category: metadata.category,
    post_slug: metadata.post_slug,
    audio_storage_path: storagePath,
    audio_url,
    featured_image_url: featured_image_url ?? undefined,
    image_storage_path: image_storage_path ?? undefined,
    status: metadata.status,
    lang: metadata.lang,
    published_at: metadata.status === 'published' ? now : undefined,
    created_at: now,
    updated_at: now,
  };
}

/**
 * Fetch ALL episodes for a language (draft + published), ordered by episode_number desc.
 * Used by the admin list — the public audioService.ts only fetches published ones.
 */
export async function fetchAllAudioEpisodes(
  lang: 'en' | 'fr',
): Promise<AudioEpisode[]> {
  const col = getAudioCollectionForLang(lang);
  const q = query(collection(db, col), orderBy('episode_number', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ ...d.data(), id: d.id } as AudioEpisode));
}

/**
 * Toggle an episode's status between 'draft' and 'published'.
 */
export async function updateAudioEpisodeStatus(
  lang: 'en' | 'fr',
  id: string,
  status: 'draft' | 'published',
): Promise<void> {
  const col = getAudioCollectionForLang(lang);
  const now = new Date().toISOString();
  await updateDoc(doc(db, col, id), {
    status,
    updated_at: now,
    ...(status === 'published' ? { published_at: now } : {}),
  });
}

/**
 * Delete an episode: removes the Storage file then the Firestore document.
 * Silently ignores Storage 404 errors (file already gone).
 */
export async function deleteAudioEpisode(episode: AudioEpisode): Promise<void> {
  // Remove audio file from Storage
  if (episode.audio_storage_path) {
    await deleteObject(ref(storage, episode.audio_storage_path)).catch(() => {});
  }
  // Remove thumbnail from Storage
  if (episode.image_storage_path) {
    await deleteObject(ref(storage, episode.image_storage_path)).catch(() => {});
  }
  const col = getAudioCollectionForLang(episode.lang as 'en' | 'fr');
  await deleteDoc(doc(db, col, episode.id));
}
