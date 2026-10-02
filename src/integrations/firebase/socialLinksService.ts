/**
 * socialLinksService.ts — the single definition of Afrinia's social links.
 *
 * WHY: the admin panel saves which platforms are shown; the footer and the
 * Contact page read it. Both used to hard-code the Firestore location
 * separately (site_settings/social_links), a collection the Firestore rules
 * never covered — every save failed and visitors could not read it. Settings
 * now live in site_config/ (public read, admin write — see firestore.rules),
 * next to the popup and homepage settings, defined once here.
 * Connects to: SocialLinksSettings (admin, write), useSocialLinks (read).
 */
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/integrations/firebase/config';

export interface SocialLink {
  id: string;
  label: string;
  url: string;
  enabled: boolean;
}

/**
 * Known platforms and their defaults. A platform appears on the site only when
 * enabled in the admin panel; until something is saved, only Facebook is on.
 */
export const DEFAULT_SOCIAL_LINKS: SocialLink[] = [
  { id: 'linkedin', label: 'LinkedIn', url: 'https://linkedin.com/company/afrinia', enabled: false },
  { id: 'twitter', label: 'X / Twitter', url: 'https://x.com/afrinia_org', enabled: false },
  { id: 'facebook', label: 'Facebook', url: 'https://www.facebook.com/profile.php?id=61573268155274', enabled: true },
];

const socialLinksDoc = () => doc(db, 'site_config', 'social_links');

/**
 * Saved settings merged over the defaults (so a newly added platform still
 * appears in the admin list). Falls back to the defaults if nothing is saved.
 * Throws on a read error so callers decide how to degrade.
 */
export async function fetchSocialLinks(): Promise<SocialLink[]> {
  const snap = await getDoc(socialLinksDoc());
  const saved = snap.exists() ? ((snap.data().links as SocialLink[] | undefined) ?? []) : [];
  return DEFAULT_SOCIAL_LINKS.map(def => {
    const found = saved.find(s => s.id === def.id);
    return found ? { ...def, ...found } : def;
  });
}

/** Admin only — Firestore rules reject writes from anyone else. */
export async function saveSocialLinks(links: SocialLink[]): Promise<void> {
  await setDoc(socialLinksDoc(), { links, updatedAt: new Date().toISOString() });
}
