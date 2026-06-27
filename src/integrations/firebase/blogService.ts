import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  doc,
  setDoc,
  deleteDoc,
  QueryConstraint,
  DocumentData,
} from 'firebase/firestore';
import { db, storage, auth } from '@/integrations/firebase/config';
import {
  BlogPost,
  getCollectionForLang,
  getCurrentTimestamp,
  convertTimestamp,
} from '@/integrations/firebase/types';
import type { Lang } from '@/utils/languageUtils';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

/** Firestore document size limit is 1 MiB; keep content under this so doc + other fields fit. */
const MAX_CONTENT_BYTES_IN_DOC = 900_000;
const BLOG_CONTENT_STORAGE_PATH = 'blog-content';

// ── In-memory cache ─────────────────────────────────────────────────────────

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const listCache = new Map<string, CacheEntry<BlogPost[]>>();
const postCache = new Map<string, CacheEntry<BlogPost | null>>();

function getCachedList(key: string): BlogPost[] | null {
  const entry = listCache.get(key);
  if (!entry || Date.now() - entry.timestamp > CACHE_TTL) {
    listCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCachedList(key: string, data: BlogPost[]) {
  listCache.set(key, { data, timestamp: Date.now() });
}

function getCachedPost(key: string): BlogPost | null | undefined {
  const entry = postCache.get(key);
  if (!entry || Date.now() - entry.timestamp > CACHE_TTL) {
    postCache.delete(key);
    return undefined; // undefined = no cache; null = cached "not found"
  }
  return entry.data;
}

function setCachedPost(key: string, data: BlogPost | null) {
  postCache.set(key, { data, timestamp: Date.now() });
}

/** Invalidate all cached entries for a given language */
function invalidateCache(lang: Lang) {
  for (const key of listCache.keys()) {
    if (key.startsWith(`${lang}:`)) listCache.delete(key);
  }
  for (const key of postCache.keys()) {
    if (key.startsWith(`${lang}:`)) postCache.delete(key);
  }
}

// ── Document normalisation ────────────────────────────────────────────────────

/** Normalize raw Firestore doc to BlogPost with string dates. */
function toBlogPost(docSnap: { id: string; data: () => DocumentData }): BlogPost {
  const d = docSnap.data();
  return {
    ...d,
    id: docSnap.id,
    created_at: convertTimestamp(d?.created_at),
    updated_at: convertTimestamp(d?.updated_at),
    published_at: d?.published_at != null ? convertTimestamp(d.published_at) : undefined,
  } as BlogPost;
}

// ── Storage content fetcher ───────────────────────────────────────────────────

async function fetchStorageContent(storagePath: string): Promise<string | null> {
  try {
    const storageRef = ref(storage, storagePath);
    const url = await getDownloadURL(storageRef);
    const res = await fetch(url);
    return res.ok ? await res.text() : null;
  } catch {
    console.warn(
      'Could not fetch blog content from Storage (CORS or network). Apply CORS to the bucket. See docs/STORAGE_CORS.md.',
    );
    return null;
  }
}

// ── Public-facing helpers ─────────────────────────────────────────────────────

/**
 * Fetch all published blog posts for a given language.
 * Results are cached per language + filter combination for 5 minutes.
 * If language = 'fr' → fetches ONLY from posts_fr.
 * If language = 'en' → fetches ONLY from posts_en.
 * No mixing or fallback between collections.
 */
export const getPostsByLanguage = async (
  lang: Lang,
  filters?: {
    category?: string;
    status?: string;
    searchTerm?: string;
  },
): Promise<BlogPost[]> => {
  const filtersKey = JSON.stringify(filters ?? {});
  const cacheKey = `${lang}:list:${filtersKey}`;
  const cached = getCachedList(cacheKey);
  if (cached) return cached;

  try {
    const constraints: QueryConstraint[] = [orderBy('created_at', 'desc')];
    if (filters?.status && filters.status !== 'all') {
      constraints.push(where('status', '==', filters.status));
    }
    if (filters?.category && filters.category !== 'all') {
      constraints.push(where('category', '==', filters.category));
    }

    const col = getCollectionForLang(lang);
    const q = query(collection(db, col), ...constraints);
    const snap = await getDocs(q);
    let posts = snap.docs.map(d => toBlogPost({ id: d.id, data: () => d.data() }));

    if (filters?.searchTerm) {
      const s = filters.searchTerm.toLowerCase();
      posts = posts.filter(
        p => p.title.toLowerCase().includes(s) || p.content?.toLowerCase().includes(s),
      );
    }

    setCachedList(cacheKey, posts);
    return posts;
  } catch (error) {
    console.error(`Error fetching posts_${lang}:`, error);
    return [];
  }
};

/**
 * Fetch a single post by slug from the language-specific collection.
 * Merges Storage content when content_storage_path is set.
 * Returns null if not found (no fallback to the other language).
 */
export const getPostByLangAndSlug = async (
  lang: Lang,
  slug: string,
): Promise<BlogPost | null> => {
  const cacheKey = `${lang}:slug:${slug}`;
  const cached = getCachedPost(cacheKey);
  if (cached !== undefined) return cached;

  try {
    const col = getCollectionForLang(lang);
    const q = query(
      collection(db, col),
      where('slug', '==', slug),
      where('status', '==', 'published'),
    );
    const snap = await getDocs(q);
    if (snap.empty) {
      setCachedPost(cacheKey, null);
      return null;
    }

    const docSnap = snap.docs[0];
    const data = toBlogPost({ id: docSnap.id, data: () => docSnap.data() });
    if (data.content_storage_path) {
      const text = await fetchStorageContent(data.content_storage_path);
      if (text) data.content = text;
    }

    setCachedPost(cacheKey, data);
    return data;
  } catch (error) {
    console.error(`Error fetching post by slug from posts_${lang}:`, error);
    return null;
  }
};

// ── Backward-compatible service functions (default lang = 'en') ───────────────

/**
 * Fetch all blog posts with optional filters.
 * Pass lang to target a specific language collection.
 * Defaults to 'en' (posts_en).
 */
export const fetchBlogPosts = async (
  filters?: {
    category?: string;
    status?: string;
    searchTerm?: string;
  },
  lang: Lang = 'en',
): Promise<BlogPost[]> => {
  return getPostsByLanguage(lang, filters);
};

/**
 * Fetch a single blog post by Firestore document ID.
 * Pass lang to specify which collection to look in. Defaults to 'en'.
 */
export const fetchBlogPostById = async (
  id: string,
  lang: Lang = 'en',
): Promise<BlogPost | null> => {
  const cacheKey = `${lang}:id:${id}`;
  const cached = getCachedPost(cacheKey);
  if (cached !== undefined) return cached;

  try {
    const col = getCollectionForLang(lang);
    const docRef = doc(db, col, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      setCachedPost(cacheKey, null);
      return null;
    }

    const data = toBlogPost({ id: docSnap.id, data: () => docSnap.data()! });
    if (data.content_storage_path) {
      const text = await fetchStorageContent(data.content_storage_path);
      if (text) data.content = text;
    }

    setCachedPost(cacheKey, data);
    return data;
  } catch (error) {
    console.error('Error fetching blog post by id:', error);
    return null;
  }
};

/**
 * Fetch a blog post by slug. Uses the language-specific collection.
 * Convenience wrapper around getPostByLangAndSlug. Defaults to 'en'.
 */
export const fetchBlogPostBySlug = async (
  slug: string,
  lang: Lang = 'en',
): Promise<BlogPost | null> => {
  return getPostByLangAndSlug(lang, slug);
};

/**
 * Create or update a blog post in the language-specific collection.
 * If content exceeds Firestore doc size, offloads to Storage.
 * Pass lang to specify which collection to save to. Defaults to 'en'.
 */
export const saveBlogPost = async (
  post: Partial<BlogPost>,
  postId?: string,
  lang: Lang = 'en',
): Promise<string | null> => {
  try {
    const col = getCollectionForLang(lang);
    const now = getCurrentTimestamp();
    const docId = postId || doc(collection(db, col)).id;
    const docRef = doc(db, col, docId);

    const content = post.content ?? '';
    const contentBytes = new TextEncoder().encode(content).length;
    let contentToStore = content;
    let contentStoragePath: string | null | undefined;

    if (contentBytes > MAX_CONTENT_BYTES_IN_DOC) {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        console.error('Cannot upload blog content: user not authenticated');
        return null;
      }
      const storagePath = `${BLOG_CONTENT_STORAGE_PATH}/${uid}/${docId}.html`;
      const storageRef = ref(storage, storagePath);
      await uploadBytes(storageRef, new Blob([content], { type: 'text/html' }));
      contentToStore = '';
      contentStoragePath = storagePath;
    } else if (contentBytes === 0 && postId) {
      const existingSnap = await getDoc(docRef);
      const existingPath = existingSnap.exists()
        ? (existingSnap.data()?.content_storage_path as string | undefined)
        : undefined;
      if (existingPath) {
        contentStoragePath = existingPath;
        contentToStore = '';
      }
    }

    const rawData = {
      ...post,
      content: contentToStore,
      content_storage_path: contentStoragePath !== undefined ? contentStoragePath : null,
      updated_at: now,
      created_at: post.created_at || now,
    };

    // Firestore rejects documents with `undefined` values — strip them.
    const postData = Object.fromEntries(
      Object.entries(rawData).filter(([, v]) => v !== undefined)
    );

    await setDoc(docRef, postData, { merge: true });
    invalidateCache(lang);

    // Notify Google Indexing API when an article is published or unpublished.
    // Fire-and-forget — a failed notification never blocks the save.
    if (post.slug && (post.status === 'published' || post.status === 'archived')) {
      const articleUrl = `https://afrinia.org/${lang}/blog/${post.slug}`;
      const indexingType = post.status === 'published' ? 'URL_UPDATED' : 'URL_DELETED';
      fetch('/.netlify/functions/notify-indexing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: articleUrl, type: indexingType }),
      }).catch(() => { /* silent — indexing failure must never surface to the admin UI */ });
    }

    return docId;
  } catch (error) {
    console.error('Error saving blog post:', error);
    return null;
  }
};

/**
 * Delete a blog post from the language-specific collection.
 * Defaults to 'en'.
 */
export const deleteBlogPost = async (id: string, lang: Lang = 'en'): Promise<boolean> => {
  try {
    const col = getCollectionForLang(lang);
    await deleteDoc(doc(db, col, id));
    invalidateCache(lang);
    return true;
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return false;
  }
};

// ── Storage helpers (language-agnostic) ──────────────────────────────────────

/**
 * Upload image to Firebase Storage for blog (path: blog-images/{imageId})
 */
export const uploadBlogImage = async (file: File): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const storageRef = ref(storage, `blog-images/${fileName}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
};

/**
 * Upload profile avatar to Firebase Storage
 */
export const uploadProfileAvatar = async (file: File, userId: string): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const storageRef = ref(storage, `profile-avatars/${userId}/${fileName}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error('Error uploading profile avatar:', error);
    return null;
  }
};

/**
 * Delete image from Firebase Storage
 */
export const deleteBlogImage = async (imageUrl: string): Promise<boolean> => {
  try {
    await deleteObject(ref(storage, imageUrl));
    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
};
