/**
 * Builders.tsx — The /builders page: a filtered editorial view of BUILDER-category signals.
 *
 * WHY this exists: BÂTISSEUR / BUILDER articles already live in the same posts_fr /
 * posts_en collections the blog reads. This page reuses that exact data + card,
 * filtered to category === 'builder', and frames it as "decision maps". One article,
 * two entry points, one source of truth — nothing is moved out of the blog feed.
 *
 * Connects to: blogService.getPostsByLanguage, shared ArticleCard component, taxonomy
 * (the canonical 'builder' key), pageMeta for SEO. Language follows the i18n toggle,
 * matching About/Contact — /builders has no /fr /en URL prefix.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import Layout from '@/components/Layout';
import { getPostsByLanguage } from '@/integrations/firebase/blogService';
import {
  A,
  type ArticleCardData,
  toCard,
  ArticleCard,
  SkeletonCard,
} from '@/components/ArticleCard';
import { type Lang, getBlogUrl } from '@/utils/languageUtils';
import { usePageMeta } from '@/utils/pageMeta';

// Canonical taxonomy key for the builder signal — see constants/taxonomy.ts.
const BUILDER_CATEGORY = 'builder';

const Builders = () => {
  const { t, i18n } = useTranslation();
  const lang: Lang = i18n.language === 'fr' ? 'fr' : 'en';

  const [cards, setCards] = useState<ArticleCardData[]>([]);
  const [loading, setLoading] = useState(true);

  // Reuse the blog's fetch pattern — same collection, same published filter,
  // narrowed to the builder category. A new builder article appears here with
  // zero code change the moment it is published.
  useEffect(() => {
    setLoading(true);
    setCards([]);
    getPostsByLanguage(lang, { status: 'published', category: BUILDER_CATEGORY })
      .then(posts => setCards(posts.map(p => toCard(p, lang))))
      .catch(err => console.error(`Error loading builder posts_${lang}:`, err))
      .finally(() => setLoading(false));
  }, [lang]);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://afrinia.org';
  usePageMeta({
    title: t('builders.meta_title'),
    description: t('builders.meta_description'),
    ogUrl: `${origin}/builders`,
  });

  return (
    <Layout>
      {/* ── Editorial header ── */}
      <section style={{
        background: A.bg,
        paddingTop: 140,
        paddingBottom: 56,
        borderBottom: `1px solid ${A.border}`,
      }}>
        <div className="page-container section-center-xs" style={{ textAlign: 'center', paddingTop: 0, paddingBottom: 0 }}>
          <div style={{
            fontFamily: A.sans, fontSize: '10px', fontWeight: 500,
            letterSpacing: '4px', textTransform: 'uppercase',
            color: A.gold, marginBottom: 24,
          }}>{t('builders.kicker')}</div>

          <h1 style={{
            fontFamily: A.serif, fontSize: 'clamp(36px,4vw,52px)',
            fontWeight: 300, lineHeight: 1.2,
            color: A.cream, marginBottom: 24,
          }}>{t('builders.title')}</h1>

          <div style={{ width: 40, height: 1, background: A.gold, opacity: 0.5, margin: '0 auto 24px' }} />

          <p style={{
            fontFamily: A.sans, fontSize: 15, fontWeight: 300,
            color: A.muted, lineHeight: 1.8, maxWidth: 620, margin: '0 auto',
          }}>{t('builders.description')}</p>
        </div>
      </section>

      {/* ── Builder articles ── */}
      <div className="blog-section" style={{ background: A.bg }}>
        <div className="page-container">
          {loading ? (
            <div className="blog-article-grid">
              {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : cards.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div style={{ fontFamily: A.serif, fontSize: 28, fontWeight: 300, color: A.muted }}>
                {t('builders.empty')}
              </div>
            </div>
          ) : (
            <div className="blog-article-grid">
              {cards.map(card => <ArticleCard key={card.id} card={card} lang={lang} />)}
            </div>
          )}

          {/* ── Cross-link back to the full signal feed ── */}
          <div style={{ textAlign: 'center', marginTop: 56 }}>
            <Link
              to={getBlogUrl(lang)}
              style={{
                fontFamily: A.sans, fontSize: '10px', fontWeight: 500,
                letterSpacing: '2px', textTransform: 'uppercase',
                color: A.gold, textDecoration: 'none',
                borderBottom: `1px solid ${A.border}`, paddingBottom: 4,
              }}
            >
              {t('builders.backToBlog')} →
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Builders;
