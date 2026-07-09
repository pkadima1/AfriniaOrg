import {
  collection,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  getDocs,
} from 'firebase/firestore';
import { db } from '@/integrations/firebase/config';
import {
  AudioEpisode,
  getAudioCollectionForLang,
} from '@/integrations/firebase/types';

/**
 * Fetch published audio episodes for a given language.
 * EN → audio_en collection, FR → audio_fr collection.
 * Ordered by episode_number descending so latest episodes appear first.
 *
 * @param lang    'en' | 'fr'
 * @param count   Maximum number of episodes to return (default 4)
 */
export const fetchAudioEpisodes = async (
  lang: string,
  count = 4,
): Promise<AudioEpisode[]> => {
  try {
    const col = getAudioCollectionForLang(lang as 'en' | 'fr');
    const q = query(
      collection(db, col),
      where('status', '==', 'published'),
      orderBy('episode_number', 'desc'),
      firestoreLimit(count),
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ ...d.data(), id: d.id } as AudioEpisode));
  } catch (error) {
    console.error('Error fetching audio episodes:', error);
    return [];
  }
};

/**
 * Fetch the published audio version of a specific article, if one exists.
 * Links via AudioEpisode.post_slug — set in the admin upload form.
 * Returns null when the article has no audio version (the common case),
 * so callers can simply hide the player.
 *
 * @param slug  The article slug (same language as `lang`)
 * @param lang  'en' | 'fr'
 */
export const fetchEpisodeForPost = async (
  slug: string,
  lang: 'en' | 'fr',
): Promise<AudioEpisode | null> => {
  try {
    const col = getAudioCollectionForLang(lang);
    // Both filters are equalities — served by Firestore's built-in
    // single-field indexes, no composite index required.
    const q = query(
      collection(db, col),
      where('status', '==', 'published'),
      where('post_slug', '==', slug),
      firestoreLimit(1),
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const doc = snap.docs[0];
    return { ...doc.data(), id: doc.id } as AudioEpisode;
  } catch (error) {
    // An audio-player failure must never break the article page.
    console.error('Error fetching audio version for post:', error);
    return null;
  }
};

export type { AudioEpisode };
