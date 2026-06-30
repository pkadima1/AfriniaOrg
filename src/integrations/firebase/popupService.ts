/**
 * popupService.ts — Firestore read/write for the subscribe popup configuration.
 *
 * WHY: The popup config lives in Firestore so admins can switch templates and
 * edit copy without a code deploy. The document is public-read so unauthenticated
 * visitors can fetch the active template when the popup triggers.
 *
 * Connects to: site_config/popup_config (Firestore), PopupTemplateAdmin (write),
 * SubscribePopup (read).
 */

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './config';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface BaseTemplateContent {
  headline_en: string;
  headline_fr: string;
  subheadline_en: string;
  subheadline_fr: string;
  cta_en: string;
  cta_fr: string;
}

export interface FeatureHighlightContent extends BaseTemplateContent {
  features_en: string[];
  features_fr: string[];
}

export type TemplateId = 'minimal' | 'feature_highlight' | 'exclusive_access';

export interface PopupConfig {
  enabled: boolean;
  active_template: TemplateId;
  timer_seconds: number;
  dismiss_days: number;
  templates: {
    minimal: BaseTemplateContent;
    feature_highlight: FeatureHighlightContent;
    exclusive_access: BaseTemplateContent;
  };
}

// ── Defaults ──────────────────────────────────────────────────────────────────

export const DEFAULT_CONFIG: PopupConfig = {
  enabled: true,
  active_template: 'minimal',
  timer_seconds: 60,
  dismiss_days: 7,
  templates: {
    minimal: {
      headline_en: 'Stay informed.',
      headline_fr: 'Restez informé.',
      subheadline_en: "Weekly intelligence for Africa's builders.",
      subheadline_fr: "Intelligence hebdomadaire pour les bâtisseurs d'Afrique.",
      cta_en: 'Subscribe',
      cta_fr: "S'abonner",
    },
    feature_highlight: {
      headline_en: 'What you get:',
      headline_fr: 'Ce que vous recevez :',
      subheadline_en: 'Join thousands reading The Afrinia Brief.',
      subheadline_fr: 'Rejoignez des milliers qui lisent Le Bref Afrinia.',
      cta_en: 'Subscribe free',
      cta_fr: "S'abonner gratuitement",
      features_en: ['Weekly analysis', 'Builder profiles', 'Audio episodes'],
      features_fr: ['Analyses hebdomadaires', 'Profils de bâtisseurs', 'Épisodes audio'],
    },
    exclusive_access: {
      headline_en: "Intelligence reserved for Africa's builders.",
      headline_fr: "Intelligence réservée aux bâtisseurs d'Afrique.",
      subheadline_en: 'Request your invitation to The Afrinia Brief.',
      subheadline_fr: 'Demandez votre invitation au Bref Afrinia.',
      cta_en: 'Request Access',
      cta_fr: "Demander l'accès",
    },
  },
};

// ── Service functions ─────────────────────────────────────────────────────────

/**
 * Reads popup config from Firestore. Returns DEFAULT_CONFIG on missing doc or
 * read error — the popup degrades gracefully rather than failing silently.
 */
export async function getPopupConfig(): Promise<PopupConfig> {
  try {
    const snap = await getDoc(doc(db, 'site_config', 'popup_config'));
    if (!snap.exists()) return DEFAULT_CONFIG;
    // Deep-merge so new template keys added in DEFAULT_CONFIG are always present
    const stored = snap.data() as Partial<PopupConfig>;
    return {
      ...DEFAULT_CONFIG,
      ...stored,
      templates: {
        minimal: { ...DEFAULT_CONFIG.templates.minimal, ...stored.templates?.minimal },
        feature_highlight: {
          ...DEFAULT_CONFIG.templates.feature_highlight,
          ...stored.templates?.feature_highlight,
        },
        exclusive_access: {
          ...DEFAULT_CONFIG.templates.exclusive_access,
          ...stored.templates?.exclusive_access,
        },
      },
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export async function savePopupConfig(config: PopupConfig): Promise<void> {
  await setDoc(doc(db, 'site_config', 'popup_config'), config);
}
