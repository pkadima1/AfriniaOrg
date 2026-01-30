import { z } from 'zod';
import { 
  fetchCommentsForPost as firebaseFetchComments,
  addCommentToPost as firebaseAddComment,
  deleteComment as firebaseDeleteComment,
  type Comment,
} from '@/integrations/firebase/commentService';

// Validation schemas
export const commentSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters").optional().or(z.literal('')),
  message: z.string().trim().min(1, "Message is required").max(1000, "Message must be less than 1000 characters"),
  postSlug: z.string().min(1, "Post slug is required"),
  parentId: z.string().optional()
});

export type CommentInput = z.infer<typeof commentSchema>;

export { Comment };

// Fetch comments for a specific blog post
export const fetchCommentsForPost = async (postSlug: string): Promise<Comment[]> => {
  try {
    const comments = await firebaseFetchComments(postSlug);

    // Organize comments into a tree structure with replies
    const commentsMap = new Map<string, Comment>();
    const topLevelComments: Comment[] = [];

    // First pass: create all comment objects
    comments.forEach(comment => {
      const commentWithReplies = {
        ...comment,
        replies: [] as Comment[]
      };
      commentsMap.set(comment.id, commentWithReplies);
    });

    // Second pass: organize into tree structure
    comments.forEach(comment => {
      const commentWithReplies = commentsMap.get(comment.id)!;
      
      if (comment.parent_id) {
        // This is a reply, add it to its parent's replies
        const parent = commentsMap.get(comment.parent_id);
        if (parent) {
          parent.replies = parent.replies || [];
          parent.replies.push(commentWithReplies);
        }
      } else {
        // This is a top-level comment
        topLevelComments.push(commentWithReplies);
      }
    });

    return topLevelComments;
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
};

// Add a new comment
export const addCommentToPost = async (commentData: CommentInput): Promise<{ success: boolean; comment?: Comment; error?: string }> => {
  try {
    // Validate input
    const validatedData = commentSchema.parse(commentData);

    const commentId = await firebaseAddComment(
      validatedData.postSlug,
      validatedData.name,
      validatedData.message,
      validatedData.email,
      validatedData.parentId
    );

    if (!commentId) {
      return { success: false, error: 'Failed to add comment' };
    }

    const newComment: Comment = {
      id: commentId,
      post_slug: validatedData.postSlug,
      name: validatedData.name,
      email: validatedData.email,
      message: validatedData.message,
      parent_id: validatedData.parentId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      replies: []
    };

    return { success: true, comment: newComment };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    console.error('Error adding comment:', error);
    return { success: false, error: 'Failed to add comment' };
  }
};

// Delete a comment
export const deleteCommentFromPost = async (commentId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const success = await firebaseDeleteComment(commentId);
    if (!success) {
      return { success: false, error: 'Failed to delete comment' };
    }
    return { success: true };
  } catch (error) {
    console.error('Error deleting comment:', error);
    return { success: false, error: 'Failed to delete comment' };
  }
};

// Count comments for a post (including replies)
export const getCommentCount = async (postSlug: string): Promise<number> => {
  try {
    const comments = await firebaseFetchComments(postSlug);
    return comments.length;
  } catch (error) {
    console.error('Error counting comments:', error);
    return 0;
  }
};