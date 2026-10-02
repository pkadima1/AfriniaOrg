/**
 * audio.ts — published audio episodes for server-rendered pages (M2+).
 */
import 'server-only';
import type { AudioEpisode } from '@/integrations/firebase/types';
import { getAudioCollectionForLang } from '@/integrations/firebase/types';
import { mapEpisode } from '@/integrations/firebase/mappers';
import type { Lang } from '@/utils/languageUtils';
import { runQuery } from './firestoreRest';
import { contentTags } from './tags';

/** Latest episode first (episode_number descending), like the audio page. */
export async function getPublishedEpisodes(lang: Lang): Promise<AudioEpisode[]> {
  const docs = await runQuery(getAudioCollectionForLang(lang), {
    where: { status: 'published' },
    tags: [contentTags.audio(lang)],
  });
  return docs.map(doc => mapEpisode(doc.id, doc.data)).sort((a, b) => b.episode_number - a.episode_number);
}

/** The audio version of one article, or null (most articles have none). */
export async function getEpisodeForPost(lang: Lang, postSlug: string): Promise<AudioEpisode | null> {
  const [doc] = await runQuery(getAudioCollectionForLang(lang), {
    where: { status: 'published', post_slug: postSlug },
    limit: 1,
    tags: [contentTags.audio(lang)],
  });
  return doc ? mapEpisode(doc.id, doc.data) : null;
}
