/**
 * tags.ts — Next.js cache tags for content reads.
 * WHY: on publish/edit (M4, decision D5) the server refreshes exactly the
 * cached reads that depend on the changed document — by tag, not by
 * rebuilding the site. Readers and the revalidation endpoint both use these.
 */
import type { Lang } from '@/utils/languageUtils';

export const contentTags = {
  posts: (lang: Lang) => `posts:${lang}`,
  post: (lang: Lang, slug: string) => `post:${lang}:${slug}`,
  builders: (lang: Lang) => `builders:${lang}`,
  builder: (lang: Lang, slug: string) => `builder:${lang}:${slug}`,
  audio: (lang: Lang) => `audio:${lang}`,
} as const;
