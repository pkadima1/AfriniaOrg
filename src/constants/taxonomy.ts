/**
 * taxonomy.ts — Canonical signal classification constants for Afrinia.
 *
 * WHY this exists: Single source of truth for all category keys, labels, sectors,
 * and regions. Every component and the admin panel imports from here.
 * If a label changes, change it here — nowhere else.
 *
 * Connects to: PostCategory type in firebase/types.ts; BlogPostEditor, Blog, BlogPost pages.
 */

import { PostCategory } from '@/integrations/firebase/types';

// 1. Ordered array for filter UI rendering — import order = display order
export const SIGNAL_CATEGORIES: {
  id: PostCategory;
  labelEN: string;
  labelFR: string;
}[] = [
  { id: 'opportunity',  labelEN: 'OPPORTUNITY',    labelFR: 'OPPORTUNITÉ'    },
  { id: 'analysis',     labelEN: 'ANALYSIS',       labelFR: 'ANALYSE'        },
  { id: 'investment',   labelEN: 'INVESTMENT',     labelFR: 'INVESTISSEMENT' },
  { id: 'technote',     labelEN: 'TECHNOTE',       labelFR: 'TECHNOTE'       },
  { id: 'builder',      labelEN: 'BUILDER',        labelFR: 'BÂTISSEUR'      },
];

// 2. O(1) lookup map — used in components and admin panel to derive labels from keys
export const CATEGORY_LABEL_MAP: Record<PostCategory, { en: string; fr: string }> = {
  opportunity:  { en: 'OPPORTUNITY',    fr: 'OPPORTUNITÉ'    },
  analysis:     { en: 'ANALYSIS',       fr: 'ANALYSE'        },
  investment:   { en: 'INVESTMENT',     fr: 'INVESTISSEMENT' },
  technote:     { en: 'TECHNOTE',       fr: 'TECHNOTE'       },
  builder:      { en: 'BUILDER',        fr: 'BÂTISSEUR'      },
};

// 3. Helper — resolves the display label for a given key and locale
export function getCategoryLabel(category: PostCategory, locale: 'en' | 'fr'): string {
  return CATEGORY_LABEL_MAP[category]?.[locale] ?? category.toUpperCase();
}

// 4. Sector and region arrays — for admin dropdowns (English labels only in Phase 1)
export const SIGNAL_SECTORS = [
  { id: 'fintech',                label: 'Fintech'                },
  { id: 'agritech',               label: 'Agritech'               },
  { id: 'energy',                 label: 'Energy'                 },
  { id: 'logistics',              label: 'Logistics'              },
  { id: 'health',                 label: 'Health'                 },
  { id: 'education',              label: 'Education'              },
  { id: 'real_estate',            label: 'Real Estate'            },
  { id: 'trade',                  label: 'Trade'                  },
  { id: 'digital_infrastructure', label: 'Digital Infrastructure' },
  { id: 'other',                  label: 'Other'                  },
];

export const SIGNAL_REGIONS = [
  { id: 'west_africa',     label: 'West Africa'    },
  { id: 'east_africa',     label: 'East Africa'    },
  { id: 'central_africa',  label: 'Central Africa' },
  { id: 'north_africa',    label: 'North Africa'   },
  { id: 'southern_africa', label: 'Southern Africa'},
  { id: 'pan_african',     label: 'Pan-African'    },
];
