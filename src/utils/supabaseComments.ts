import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';

// Validation schemas
export const commentSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters").optional().or(z.literal('')),
  message: z.string().trim().min(1, "Message is required").max(1000, "Message must be less than 1000 characters"),
  postSlug: z.string().min(1, "Post slug is required"),
  parentId: z.string().uuid("Invalid parent comment ID").optional()
});

export type CommentInput = z.infer<typeof commentSchema>;

export interface Comment {
  id: string;
  post_slug: string;
  name: string;
  email?: string;
  message: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
  replies?: Comment[];
}

// Fetch comments for a specific blog post
export const fetchCommentsForPost = async (postSlug: string): Promise<Comment[]> => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_slug', postSlug)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
      return [];
    }

    // Organize comments into a tree structure with replies
    const commentsMap = new Map<string, Comment>();
    const topLevelComments: Comment[] = [];

    // First pass: create all comment objects
    data.forEach(comment => {
      const commentWithReplies: Comment = {
        ...comment,
        replies: []
      };
      commentsMap.set(comment.id, commentWithReplies);
    });

    // Second pass: organize into tree structure
    data.forEach(comment => {
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

    // Prepare data for insertion
    const insertData = {
      post_slug: validatedData.postSlug,
      name: validatedData.name,
      email: validatedData.email || null,
      message: validatedData.message,
      parent_id: validatedData.parentId || null
    };

    const { data, error } = await supabase
      .from('comments')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error('Error adding comment:', error);
      return { success: false, error: error.message };
    }

    return { success: true, comment: data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    console.error('Error adding comment:', error);
    return { success: false, error: 'Failed to add comment' };
  }
};

// Count comments for a post (including replies)
export const getCommentCount = async (postSlug: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_slug', postSlug);

    if (error) {
      console.error('Error counting comments:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Error counting comments:', error);
    return 0;
  }
};