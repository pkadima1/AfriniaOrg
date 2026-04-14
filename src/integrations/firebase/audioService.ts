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

export type { AudioEpisode };
