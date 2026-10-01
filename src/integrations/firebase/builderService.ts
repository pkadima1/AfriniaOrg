/**
 * builderService.ts — CRUD for Builder profile entities.
 *
 * WHY this exists: A Builder (e.g. Aliko Dangote) is one entity, not an article —
 * but it still follows the SAME bilingual split as posts_en/posts_fr: builders_en
 * and builders_fr are separate collections, and the EN/FR profiles for the same
 * person are independent documents (adapted content, not a translation pair — one
 * may exist without the other, same as blog posts). Every function here takes an
 * explicit lang so a query never crosses collections.
 *
 * Connects to: Builders.tsx (directory), BuilderProfile.tsx (public profile),
 * BuilderList.tsx / BuilderEditor.tsx (admin), BlogPostEditor.tsx (article linking,
 * scoped to the post's own language collection).
 */
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  setDoc,
  deleteDoc,
  DocumentData,
} from 'firebase/firestore';
import { db, storage } from '@/integrations/firebase/config';
import {
  Builder,
  getBuilderCollectionForLang,
  getCurrentTimestamp,
  convertTimestamp,
} from '@/integrations/firebase/types';
import type { Lang } from '@/utils/languageUtils';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

function toBuilder(docSnap: { id: string; data: () => DocumentData }): Builder {
  const d = docSnap.data();
  return {
    ...d,
    id: docSnap.id,
    countries: d?.countries ?? [],
    decisionFrameworks: d?.decisionFrameworks ?? [],
    keyFailures: d?.keyFailures ?? [],
    mentalModels: d?.mentalModels ?? [],
    created_at: convertTimestamp(d?.created_at),
    updated_at: convertTimestamp(d?.updated_at),
  } as Builder;
}

/** Public directory — published builders only, in one language collection. */
export const getPublishedBuilders = async (lang: Lang): Promise<Builder[]> => {
  try {
    const col = getBuilderCollectionForLang(lang);
    const q = query(collection(db, col), where('status', '==', 'published'));
    const snap = await getDocs(q);
    const builders = snap.docs.map(d => toBuilder({ id: d.id, data: () => d.data() }));
    return builders.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error(`Error fetching published builders_${lang}:`, error);
    return [];
  }
};

/** Public profile lookup by slug — published only, in one language collection. */
export const getBuilderBySlug = async (lang: Lang, slug: string): Promise<Builder | null> => {
  try {
    const col = getBuilderCollectionForLang(lang);
    const q = query(
      collection(db, col),
      where('slug', '==', slug),
      where('status', '==', 'published'),
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const docSnap = snap.docs[0];
    return toBuilder({ id: docSnap.id, data: () => docSnap.data() });
  } catch (error) {
    console.error(`Error fetching builder by slug from builders_${lang}:`, error);
    return null;
  }
};

/** Admin list — all statuses, in one language collection. */
export const fetchBuilders = async (lang: Lang): Promise<Builder[]> => {
  try {
    const col = getBuilderCollectionForLang(lang);
    const snap = await getDocs(collection(db, col));
    const builders = snap.docs.map(d => toBuilder({ id: d.id, data: () => d.data() }));
    return builders.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error(`Error fetching builders_${lang}:`, error);
    return [];
  }
};

/** Admin editor load — any status, by document id, in one language collection. */
export const fetchBuilderById = async (id: string, lang: Lang): Promise<Builder | null> => {
  try {
    const col = getBuilderCollectionForLang(lang);
    const docRef = doc(db, col, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return toBuilder({ id: docSnap.id, data: () => docSnap.data()! });
  } catch (error) {
    console.error('Error fetching builder by id:', error);
    return null;
  }
};

/** Create or update a builder profile in the language-specific collection. */
export const saveBuilder = async (
  builder: Partial<Builder>,
  builderId: string | undefined,
  lang: Lang,
): Promise<string | null> => {
  try {
    const col = getBuilderCollectionForLang(lang);
    const docId = builderId || doc(collection(db, col)).id;
    const docRef = doc(db, col, docId);
    const now = getCurrentTimestamp();

    const rawData = {
      ...builder,
      updated_at: now,
      created_at: builder.created_at || now,
    };
    const data = Object.fromEntries(Object.entries(rawData).filter(([, v]) => v !== undefined));

    await setDoc(docRef, data, { merge: true });
    return docId;
  } catch (error) {
    console.error('Error saving builder:', error);
    return null;
  }
};

export const deleteBuilder = async (id: string, lang: Lang): Promise<boolean> => {
  try {
    const col = getBuilderCollectionForLang(lang);
    await deleteDoc(doc(db, col, id));
    return true;
  } catch (error) {
    console.error('Error deleting builder:', error);
    return false;
  }
};

/** Upload a builder's photo to Storage (path: builder-photos/{fileName}). Language-agnostic. */
export const uploadBuilderPhoto = async (file: File): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const storageRef = ref(storage, `builder-photos/${fileName}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error('Error uploading builder photo:', error);
    return null;
  }
};
