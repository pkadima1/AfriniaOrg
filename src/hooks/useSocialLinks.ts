import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/integrations/firebase/config';
import type { SocialLink } from '@/components/admin/SocialLinksSettings';

const FALLBACK: SocialLink[] = [
  { id: 'facebook', label: 'Facebook', url: 'https://www.facebook.com/profile.php?id=61573268155274', enabled: true },
];

export function useSocialLinks(): { links: SocialLink[]; loading: boolean } {
  const [links, setLinks] = useState<SocialLink[]>(FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, 'site_settings', 'social_links'));
        if (snap.exists()) {
          const data = snap.data() as { links: SocialLink[] };
          setLinks((data.links ?? FALLBACK).filter(l => l.enabled));
        }
      } catch {
        /* use fallback */
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  return { links, loading };
}
