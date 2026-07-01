// Firestore type definitions and utilities

export type UserRole = 'admin' | 'contributor' | 'viewer';

// ── Taxonomy types — canonical signal classification system ───────────────────

export type PostCategory =
  | 'opportunity'
  | 'analysis'
  | 'investment'
  | 'technote'
  | 'builder';

export type PostSector =
  | 'fintech'
  | 'agritech'
  | 'energy'
  | 'logistics'
  | 'health'
  | 'education'
  | 'real_estate'
  | 'trade'
  | 'digital_infrastructure'
  | 'other';

export type PostRegion =
  | 'west_africa'
  | 'east_africa'
  | 'central_africa'
  | 'north_africa'
  | 'southern_africa'
  | 'pan_african';

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
  /** In-document content, or empty when content is in Storage (see content_storage_path). */
  content: string;
  /** When set, full content is in Storage at this path; fetch and merge when loading. */
  content_storage_path?: string;
  created_at: string;
  category?: PostCategory;       // canonical signal type key — used for filtering
  categoryEN?: string;           // derived display label (EN) — never typed manually
  categoryFR?: string;           // derived display label (FR) — never typed manually
  sector?: PostSector;           // secondary metadata — Firestore only in Phase 1
  region?: PostRegion;           // tertiary metadata — Firestore only in Phase 1
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
  content_language?: 'en' | 'fr' | 'both';
  target_countries?: string[];
}

export interface Comment {
  id: string;
  post_slug: string;
  /** Language of the post this comment belongs to — 'en' | 'fr' */
  lang: string;
  name: string;
  email?: string;
  message: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
  replies?: Comment[];
}

export interface AudioEpisode {
  id: string;
  /** Numeric episode number — used for ordering and display (e.g. 1 → "Episode 001") */
  episode_number: number;
  title: string;
  /** Display duration string, e.g. "7 min 24 sec" */
  duration: string;
  /** Topic category shown alongside the duration, e.g. "Systems + AI" */
  category?: string;
  /** Short summary / description */
  description?: string;
  /** Direct link to the episode (Spotify / Apple Podcasts / mp3) — Firebase Storage download URL */
  audio_url?: string;
  /** Firebase Storage path used to generate audio_url and for deletion, e.g. "audio/en/ep001-title.mp3" */
  audio_storage_path?: string;
  /** Optional cover / thumbnail image URL (Firebase Storage download URL) */
  featured_image_url?: string;
  /** Firebase Storage path for the thumbnail — used for deletion */
  image_storage_path?: string;
  /** Optional link back to the related blog post */
  post_slug?: string;
  status: 'draft' | 'published';
  /** Language of the episode — 'en' | 'fr' (implicit from collection, stored for reference) */
  lang: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

// Firestore Collection names
export const COLLECTIONS = {
  USER_PROFILES: 'user_profiles',
  /** Legacy single-language collection — kept for reference during migration */
  BLOG_POSTS: 'blog_posts',
  /** Legacy comments — kept for historical data only */
  COMMENTS: 'comments',
  /** Bilingual blog post collections */
  POSTS_EN: 'posts_en',
  POSTS_FR: 'posts_fr',
  /** Bilingual comment collections */
  COMMENTS_EN: 'comments_en',
  COMMENTS_FR: 'comments_fr',
  /** Bilingual audio episode collections */
  AUDIO_EN: 'audio_en',
  AUDIO_FR: 'audio_fr',
} as const;

/** Returns the Firestore blog-post collection name for a given language */
export function getCollectionForLang(lang: 'en' | 'fr'): string {
  return lang === 'fr' ? COLLECTIONS.POSTS_FR : COLLECTIONS.POSTS_EN;
}

/** Returns the Firestore comment collection name for a given language */
export function getCommentCollectionForLang(lang: 'en' | 'fr'): string {
  return lang === 'fr' ? COLLECTIONS.COMMENTS_FR : COLLECTIONS.COMMENTS_EN;
}

/** Returns the Firestore audio episode collection name for a given language */
export function getAudioCollectionForLang(lang: 'en' | 'fr'): string {
  return lang === 'fr' ? COLLECTIONS.AUDIO_FR : COLLECTIONS.AUDIO_EN;
}

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
