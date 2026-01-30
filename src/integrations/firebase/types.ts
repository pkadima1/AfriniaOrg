// Firestore type definitions and utilities

export type UserRole = 'admin' | 'contributor' | 'viewer';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  role: UserRole;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: string;
  author_name: string;
  category?: string;
  /** In-document content, or empty when content is in Storage (see content_storage_path). */
  content: string;
  /** When set, full content is in Storage at this path; fetch and merge when loading. */
  content_storage_path?: string;
  created_at: string;
  excerpt?: string;
  featured_image_url?: string;
  meta_description?: string;
  meta_title?: string;
  published_at?: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  tags?: string[];
  title: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  post_slug: string;
  name: string;
  email?: string;
  message: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
}

// Firestore Collection names
export const COLLECTIONS = {
  USER_PROFILES: 'user_profiles',
  BLOG_POSTS: 'blog_posts',
  COMMENTS: 'comments',
} as const;

// Helper function to convert Firestore timestamp to ISO string
export const convertTimestamp = (timestamp: unknown): string => {
  if (!timestamp) return new Date().toISOString();
  if (typeof timestamp === 'string') return timestamp;
  if (timestamp && typeof timestamp === 'object') {
    const t = timestamp as Record<string, unknown>;
    if (typeof t.toDate === 'function') {
      return (t.toDate as () => Date)().toISOString();
    }
    // Serialized Firestore Timestamp: { seconds, nanoseconds } or { _seconds, _nanoseconds }
    const sec = (t.seconds ?? t._seconds) as number | undefined;
    if (typeof sec === 'number' && !Number.isNaN(sec)) {
      return new Date(sec * 1000).toISOString();
    }
  }
  return new Date().toISOString();
};

// Helper function to get current ISO timestamp
export const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
};
