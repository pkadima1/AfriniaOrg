import { useState, useEffect } from 'react';
import {
  DEFAULT_SOCIAL_LINKS,
  fetchSocialLinks,
  type SocialLink,
} from '@/integrations/firebase/socialLinksService';

const enabledOnly = (links: SocialLink[]) => links.filter(l => l.enabled);

/**
 * The social links switched on in the admin panel (footer, Contact page).
 * Starts with — and falls back to — the defaults, so the page never shows
 * links that were not explicitly enabled, even while loading or offline.
 */
export function useSocialLinks(): { links: SocialLink[]; loading: boolean } {
  const [links, setLinks] = useState<SocialLink[]>(enabledOnly(DEFAULT_SOCIAL_LINKS));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSocialLinks()
      .then(all => setLinks(enabledOnly(all)))
      .catch(err => console.error('Error loading social links:', err))
      .finally(() => setLoading(false));
  }, []);

  return { links, loading };
}
