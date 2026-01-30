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
import { Comment, COLLECTIONS, getCurrentTimestamp } from '@/integrations/firebase/types';

/**
 * Fetch all comments for a blog post
 */
export const fetchCommentsForPost = async (postSlug: string): Promise<Comment[]> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.COMMENTS),
      where('post_slug', '==', postSlug),
      orderBy('created_at', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    } as Comment));
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
};

/**
 * Add a new comment to a post
 */
export const addCommentToPost = async (
  postSlug: string,
  name: string,
  message: string,
  email?: string,
  parentId?: string
): Promise<string | null> => {
  try {
    const now = getCurrentTimestamp();
    const commentRef = await addDoc(collection(db, COLLECTIONS.COMMENTS), {
      post_slug: postSlug,
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
 * Update a comment
 */
export const updateComment = async (
  commentId: string,
  updates: Partial<Comment>
): Promise<boolean> => {
  try {
    const docRef = doc(db, COLLECTIONS.COMMENTS, commentId);
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
 * Delete a comment
 */
export const deleteComment = async (commentId: string): Promise<boolean> => {
  try {
    const docRef = doc(db, COLLECTIONS.COMMENTS, commentId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Error deleting comment:', error);
    return false;
  }
};

export type { Comment };
