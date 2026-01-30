import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  Query,
  QueryConstraint,
  limit,
  startAfter,
  DocumentData,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db, storage } from '@/integrations/firebase/config';
import { BlogPost, COLLECTIONS, getCurrentTimestamp, convertTimestamp } from '@/integrations/firebase/types';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

/** Firestore document size limit is 1 MiB; keep content under this so doc + other fields fit. */
const MAX_CONTENT_BYTES_IN_DOC = 900_000;
const BLOG_CONTENT_STORAGE_PATH = 'blog-content';

/** Normalize raw Firestore doc to BlogPost with string dates (Firestore returns Timestamp for date fields). */
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

/**
 * Fetch all published blog posts with optional filters
 */
export const fetchBlogPosts = async (filters?: {
  category?: string;
  status?: string;
  searchTerm?: string;
}): Promise<BlogPost[]> => {
  try {
    const constraints: QueryConstraint[] = [
      orderBy('created_at', 'desc'),
    ];

    if (filters?.status && filters.status !== 'all') {
      constraints.push(where('status', '==', filters.status));
    }

    if (filters?.category && filters.category !== 'all') {
      constraints.push(where('category', '==', filters.category));
    }

    const q = query(collection(db, COLLECTIONS.BLOG_POSTS), ...constraints);
    const querySnapshot = await getDocs(q);
    const posts = querySnapshot.docs.map((docSnap) =>
      toBlogPost({ id: docSnap.id, data: () => docSnap.data() })
    );

    // Client-side search filter if needed
    if (filters?.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      return posts.filter(
        (post) =>
          post.title.toLowerCase().includes(searchLower) ||
          post.content?.toLowerCase().includes(searchLower)
      );
    }

    return posts;
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
};

/**
 * Fetch a single blog post by ID. If content is in Storage (content_storage_path), fetches and merges it.
 */
export const fetchBlogPostById = async (id: string): Promise<BlogPost | null> => {
  try {
    const docRef = doc(db, COLLECTIONS.BLOG_POSTS, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = toBlogPost({ id: docSnap.id, data: () => docSnap.data()! });
    const storagePath = data.content_storage_path;
    if (storagePath) {
      try {
        const storageRef = ref(storage, storagePath);
        const url = await getDownloadURL(storageRef);
        const res = await fetch(url);
        if (res.ok) {
          data.content = await res.text();
        }
      } catch (storageError) {
        console.warn('Could not fetch blog content from Storage (CORS or network).', storageError);
      }
    }
    return data;
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
};

/**
 * Fetch a blog post by slug. If content is in Storage, fetches and merges it.
 */
export const fetchBlogPostBySlug = async (slug: string): Promise<BlogPost | null> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.BLOG_POSTS),
      where('slug', '==', slug),
      where('status', '==', 'published')
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const docSnap = querySnapshot.docs[0];
    const data = toBlogPost({ id: docSnap.id, data: () => docSnap.data() });
    const storagePath = data.content_storage_path;
    if (storagePath) {
      try {
        const storageRef = ref(storage, storagePath);
        const url = await getDownloadURL(storageRef);
        const res = await fetch(url);
        if (res.ok) {
          data.content = await res.text();
        }
      } catch (storageError) {
        // CORS or network: still return the post so the page shows correct title/author
        console.warn('Could not fetch blog content from Storage (CORS or network). Apply CORS to the bucket. See docs/STORAGE_CORS.md.', storageError);
      }
    }
    return data;
  } catch (error) {
    console.error('Error fetching blog post by slug:', error);
    return null;
  }
};

/**
 * Create or update a blog post. If content exceeds Firestore size limit, stores content in
 * Storage at blog-content/{postId}.html and sets content_storage_path in the document.
 * Firestore doc size limit is 1 MiB; content over ~900KB is stored in Storage and the doc
 * keeps content empty + content_storage_path (so "content not in Firestore" is by design for large posts).
 */
export const saveBlogPost = async (post: Partial<BlogPost>, postId?: string): Promise<string | null> => {
  try {
    const now = getCurrentTimestamp();
    const docId = postId || doc(collection(db, COLLECTIONS.BLOG_POSTS)).id;
    const docRef = doc(db, COLLECTIONS.BLOG_POSTS, docId);

    const content = post.content ?? '';
    const contentBytes = new TextEncoder().encode(content).length;
    let contentToStore = content;
    let contentStoragePath: string | null | undefined;

    if (contentBytes > MAX_CONTENT_BYTES_IN_DOC) {
      const storagePath = `${BLOG_CONTENT_STORAGE_PATH}/${docId}.html`;
      const storageRef = ref(storage, storagePath);
      await uploadBytes(storageRef, new Blob([content], { type: 'text/html' }));
      contentToStore = '';
      contentStoragePath = storagePath;
    } else if (contentBytes === 0 && postId) {
      // Update with empty content (e.g. editor loaded post but CORS blocked Storage fetch).
      // Preserve existing content_storage_path so we don't wipe the reference.
      const existingSnap = await getDoc(docRef);
      const existingPath = existingSnap.exists() ? (existingSnap.data()?.content_storage_path as string | undefined) : undefined;
      if (existingPath) {
        contentStoragePath = existingPath;
        contentToStore = '';
      }
    }

    const postData = {
      ...post,
      content: contentToStore,
      content_storage_path: contentStoragePath !== undefined ? contentStoragePath : null,
      updated_at: now,
      created_at: post.created_at || now,
    };

    await setDoc(docRef, postData, { merge: true });
    return docId;
  } catch (error) {
    console.error('Error saving blog post:', error);
    return null;
  }
};

/**
 * Delete a blog post
 */
export const deleteBlogPost = async (id: string): Promise<boolean> => {
  try {
    const docRef = doc(db, COLLECTIONS.BLOG_POSTS, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return false;
  }
};

/**
 * Upload image to Firebase Storage for blog (path: blog-images/{imageId})
 * Used by blog post editor for featured images and inline content.
 */
export const uploadBlogImage = async (file: File): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `blog-images/${fileName}`;

    const storageRef = ref(storage, filePath);
    await uploadBytes(storageRef, file);

    const url = await getDownloadURL(storageRef);
    return url;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
};

/**
 * Upload profile avatar to Firebase Storage (path: profile-avatars/{userId}/{filename})
 * Must use this path so Storage rules allow only the owning user to write.
 */
export const uploadProfileAvatar = async (file: File, userId: string): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `profile-avatars/${userId}/${fileName}`;

    const storageRef = ref(storage, filePath);
    await uploadBytes(storageRef, file);

    const url = await getDownloadURL(storageRef);
    return url;
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
    const storageRef = ref(storage, imageUrl);
    await deleteObject(storageRef);
    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
};
