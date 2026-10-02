/**
 * posts.ts — published articles for server-rendered pages (M2+).
 * Every query filters `status == published`: firestore.rules refuse any other
 * public read, so drafts cannot reach a page even if this code is wrong (D4).
 */
import 'server-only';
import type { BlogPost } from '@/integrations/firebase/types';
import { getCollectionForLang } from '@/integrations/firebase/types';
import { mapPost } from '@/integrations/firebase/mappers';
import type { Lang } from '@/utils/languageUtils';
import { cleanArticleHtmlOnServer } from './cleanHtml';
import { runQuery } from './firestoreRest';
import { fetchStorageText } from './storageText';
import { contentTags } from './tags';

/** Newest first, like the blog listing (created_at descending). */
const newestFirst = (a: BlogPost, b: BlogPost) => b.created_at.localeCompare(a.created_at);

export async function getPublishedPosts(lang: Lang): Promise<BlogPost[]> {
  const docs = await runQuery(getCollectionForLang(lang), {
    where: { status: 'published' },
    tags: [contentTags.posts(lang)],
  });
  return docs.map(doc => mapPost(doc.id, doc.data, cleanArticleHtmlOnServer)).sort(newestFirst);
}

/**
 * One published article, or null (→ the page answers 404). Large bodies live
 * in Storage (content_storage_path); they are fetched and cleaned the same way.
 */
export async function getPublishedPost(lang: Lang, slug: string): Promise<BlogPost | null> {
  const tags = [contentTags.posts(lang), contentTags.post(lang, slug)];
  const [doc] = await runQuery(getCollectionForLang(lang), { where: { status: 'published', slug }, limit: 1, tags });
  if (!doc) return null;
  const post = mapPost(doc.id, doc.data, cleanArticleHtmlOnServer);
  if (post.content_storage_path) {
    const text = await fetchStorageText(post.content_storage_path, tags);
    if (text) post.content = cleanArticleHtmlOnServer(text);
  }
  return post;
}
