/**
 * commentService.ts — reads and writes article comments.
 * Comments are public documents; a commenter's optional email is private and
 * stored apart in comment_contacts (see firestore.rules for the guarantees).
 */
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/integrations/firebase/config';
import {
  COLLECTIONS,
  Comment,
  CommentContact,
  getCommentCollectionForLang,
  getCurrentTimestamp,
} from '@/integrations/firebase/types';

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
 *
 * Sequence: 1) reserve the comment id, 2) in ONE atomic batch write the public
 * comment (no email) and, if an email was given, the private contact document
 * with the same id. Firestore rules only accept the contact document inside
 * the batch that creates its comment, so either both are saved or neither.
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
    const commentLang = lang as 'en' | 'fr';
    const col = getCommentCollectionForLang(commentLang);
    const now = getCurrentTimestamp();
    const commentRef = doc(collection(db, col));
    const batch = writeBatch(db);

    batch.set(commentRef, {
      post_slug: postSlug,
      lang: commentLang,
      name,
      message,
      parent_id: parentId || null,
      created_at: now,
      updated_at: now,
    });

    if (email) {
      const contact: CommentContact = {
        email,
        comment_id: commentRef.id,
        lang: commentLang,
        post_slug: postSlug,
        created_at: now,
      };
      batch.set(doc(db, COLLECTIONS.COMMENT_CONTACTS, commentRef.id), contact);
    }

    await batch.commit();
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
