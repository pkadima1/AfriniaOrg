/**
 * Builders.tsx — The /builders page: a directory of Builder profile entities.
 *
 * WHY this exists: A builder (e.g. Aliko Dangote) is a person, not an article.
 * This page lists published Builder entities from the `builders` collection —
 * each links to /builders/:slug, which aggregates that person's decision-mind
 * content plus every published article that links back to them via builderId.
 * This replaced the earlier version that filtered posts_en/posts_fr by
 * category === 'builder' directly — that conflated "the person" with "an article
 * about the person," so five articles about one builder had no shared home.
 *
 * Connects to: builderService.getPublishedBuilders, BuilderProfile.tsx (the
 * per-person page this links to), pageMeta for SEO.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import Layout from '@/components/Layout';
import { getPublishedBuilders } from '@/integrations/firebase/builderService';
import { A } from '@/components/ArticleCard';
import {
  type Lang,
  getBlogUrl,
  getBuilderUrl,
  getBuildersUrl,
  useHreflangLinks,
  useUrlLang,
} from '@/utils/languageUtils';
import { absoluteUrl } from '@/constants/site';
import { usePageMeta } from '@/utils/pageMeta';
import type { Builder } from '@/integrations/firebase/types';

const BuilderCard = ({ builder, lang }: { builder: Builder; lang: Lang }) => {
  const { t } = useTranslation();
  const insightCount = builder.decisionFrameworks.length + builder.keyFailures.length + builder.mentalModels.length;

  return (
    <Link to={getBuilderUrl(lang, builder.slug)} style={{ textDecoration: 'none' }}>
      <article style={{
        background: A.bg2,
        borderRadius: '16px',
        border: `1px solid ${A.border}`,
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '28px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          {builder.photo_url ? (
            <img
              src={builder.photo_url}
              alt={builder.name}
              style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{
              width: 56, height: 56, borderRadius: '50%', background: A.bg3,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: A.serif, fontSize: 20, color: A.gold,
            }}>{builder.name.charAt(0)}</div>
          )}
          <div>
            <h2 style={{ fontFamily: A.serif, fontSize: 20, fontWeight: 400, color: A.cream, marginBottom: 2 }}>
              {builder.name}
            </h2>
            {builder.role && <p style={{ fontFamily: A.sans, fontSize: 12, color: A.muted }}>{builder.role}</p>}
          </div>
        </div>

        {builder.bio && (
          <p style={{
            fontFamily: A.sans, fontSize: 13, fontWeight: 300, color: A.muted,
            lineHeight: 1.7, marginBottom: 20, flex: 1,
            display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>{builder.bio}</p>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: A.sans, fontSize: '11px', color: A.muted }}>
            {builder.countries.join(', ')}
          </span>
          {insightCount > 0 && (
            <span style={{
              fontFamily: A.sans, fontSize: '9px', fontWeight: 500,
              letterSpacing: '2px', textTransform: 'uppercase',
              color: A.gold, border: `1px solid rgba(184,145,42,0.25)`, padding: '3px 10px',
            }}>{t('builders.decisionsCount', { count: insightCount })}</span>
          )}
        </div>
      </article>
    </Link>
  );
};

const BuilderCardSkeleton = () => (
  <div style={{ background: A.bg2, borderRadius: '16px', border: `1px solid ${A.border}`, padding: '28px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
      <div style={{ width: 56, height: 56, borderRadius: '50%', background: A.bg3 }} />
      <div style={{ flex: 1 }}>
        <div style={{ width: '60%', height: 16, background: A.bg3, marginBottom: 8 }} />
        <div style={{ width: '40%', height: 12, background: A.bg3 }} />
      </div>
    </div>
    <div style={{ width: '100%', height: 12, background: A.bg3, marginBottom: 6 }} />
    <div style={{ width: '80%', height: 12, background: A.bg3 }} />
  </div>
);

const Builders = () => {
  const { t } = useTranslation();
  const lang = useUrlLang();

  const [builders, setBuilders] = useState<Builder[]>([]);
  const [loading, setLoading] = useState(true);

  // builders_en/builders_fr are independent collections; the URL prefix
  // (/fr/builders, /en/builders) decides which one this page lists.
  useEffect(() => {
    setLoading(true);
    setBuilders([]);
    getPublishedBuilders(lang)
      .then(setBuilders)
      .catch(err => console.error(`Error loading builders_${lang}:`, err))
      .finally(() => setLoading(false));
  }, [lang]);

  // The directory exists in both languages, so it declares its EN/FR pair.
  useHreflangLinks(absoluteUrl(getBuildersUrl('en')), absoluteUrl(getBuildersUrl('fr')));
  usePageMeta({
    title: t('builders.meta_title'),
    description: t('builders.meta_description'),
    ogUrl: absoluteUrl(getBuildersUrl(lang)),
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

      {/* ── Builder directory ── */}
      <div className="blog-section" style={{ background: A.bg }}>
        <div className="page-container">
          {loading ? (
            <div className="blog-article-grid">
              {[1, 2, 3].map(i => <BuilderCardSkeleton key={i} />)}
            </div>
          ) : builders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div style={{ fontFamily: A.serif, fontSize: 28, fontWeight: 300, color: A.muted }}>
                {t('builders.empty')}
              </div>
            </div>
          ) : (
            <div className="blog-article-grid">
              {builders.map(b => <BuilderCard key={b.id} builder={b} lang={lang} />)}
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
