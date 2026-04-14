import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db } from '@/integrations/firebase/config';
import { Comment, getCommentCollectionForLang, getCurrentTimestamp } from '@/integrations/firebase/types';

/**
 * Fetch all comments for a blog post from the language-specific collection.
 * EN articles → comments_en, FR articles → comments_fr.
 * Ordered newest first; replies are nested by the caller using parent_id.
 */
export const fetchCommentsForPost = async (
  postSlug: string,
  lang: string,
): Promise<Comment[]> => {
  try {
    const col = getCommentCollectionForLang(lang as 'en' | 'fr');
    const q = query(
      collection(db, col),
      where('post_slug', '==', postSlug),
      orderBy('created_at', 'desc'),
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((d) => ({
      ...d.data(),
      id: d.id,
    } as Comment));
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
};

/**
 * Add a new comment to the language-specific comments collection.
 * EN articles → comments_en, FR articles → comments_fr.
 */
export const addCommentToPost = async (
  postSlug: string,
  lang: string,
  name: string,
  message: string,
  email?: string,
  parentId?: string,
): Promise<string | null> => {
  try {
    const col = getCommentCollectionForLang(lang as 'en' | 'fr');
    const now = getCurrentTimestamp();
    const commentRef = await addDoc(collection(db, col), {
      post_slug: postSlug,
      lang,
      name,
      message,
      email: email || null,
      parent_id: parentId || null,
      created_at: now,
      updated_at: now,
    } as Comment);

    return commentRef.id;
  } catch (error) {
    console.error('Error adding comment:', error);
    return null;
  }
};

/**
 * Update a comment in the language-specific collection.
 */
export const updateComment = async (
  commentId: string,
  lang: string,
  updates: Partial<Comment>,
): Promise<boolean> => {
  try {
    const col = getCommentCollectionForLang(lang as 'en' | 'fr');
    const docRef = doc(db, col, commentId);
    await updateDoc(docRef, {
      ...updates,
      updated_at: getCurrentTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('Error updating comment:', error);
    return false;
  }
};

/**
 * Delete a comment from the language-specific collection.
 */
export const deleteComment = async (
  commentId: string,
  lang: string,
): Promise<boolean> => {
  try {
    const col = getCommentCollectionForLang(lang as 'en' | 'fr');
    const docRef = doc(db, col, commentId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Error deleting comment:', error);
    return false;
  }
};

export type { Comment };
