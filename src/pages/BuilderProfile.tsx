/**
 * BuilderProfile.tsx — /builders/:slug, the public page for one Builder entity.
 *
 * WHY this exists: this is where "the person" lives — bio + accumulated
 * decision-mind content (frameworks, failures, mental models) — plus every
 * published article that links back to them via BlogPost.builderId. As more
 * articles get linked over time, this page compounds instead of staying static.
 *
 * Connects to: builderService.getBuilderBySlug, blogService.getPostsByBuilderId,
 * the shared ArticleCard/toCard used by the blog and the builder directory.
 */

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import Layout from '@/components/Layout';
import NotFound from '@/pages/NotFound';
import { getBuilderBySlug } from '@/integrations/firebase/builderService';
import { getPostsByBuilderId } from '@/integrations/firebase/blogService';
import {
  A,
  type ArticleCardData,
  toCard,
  ArticleCard,
  SkeletonCard,
} from '@/components/ArticleCard';
import { getBlogUrl, getBuilderUrl, getBuildersUrl, useUrlLang } from '@/utils/languageUtils';
import { absoluteUrl } from '@/constants/site';
import { usePageMeta } from '@/utils/pageMeta';
import type { Builder, DecisionInsight } from '@/integrations/firebase/types';

const InsightSection = ({
  title, items, sourceLabel,
}: { title: string; items: DecisionInsight[]; sourceLabel: string }) => {
  if (items.length === 0) return null;
  return (
    <div style={{ marginBottom: 40 }}>
      <h3 style={{
        fontFamily: A.sans, fontSize: '11px', fontWeight: 500,
        letterSpacing: '2.5px', textTransform: 'uppercase',
        color: A.gold, marginBottom: 16,
      }}>{title}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map((item, i) => {
          const text = item.title;
          return (
            <div key={i} style={{
              background: A.bg2, border: `1px solid ${A.border}`, borderRadius: 12,
              padding: '18px 20px',
            }}>
              <p style={{ fontFamily: A.serif, fontSize: 17, fontWeight: 400, color: A.cream, lineHeight: 1.5, marginBottom: item.sourceUrl ? 8 : 0 }}>
                {text}
              </p>
              {item.sourceUrl && (
                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontFamily: A.sans, fontSize: 11, color: A.muted, textDecoration: 'underline' }}
                >
                  {sourceLabel}
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const BuilderProfile = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  // The URL decides the language. A profile exists only in the collection it
  // was written in (builders_en / builders_fr) — no hreflang pair is declared.
  const lang = useUrlLang();

  const [builder, setBuilder] = useState<Builder | null>(null);
  const [articles, setArticles] = useState<ArticleCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);
    getBuilderBySlug(lang, slug)
      .then(async data => {
        if (!data) {
          setNotFound(true);
          return;
        }
        setBuilder(data);
        const posts = await getPostsByBuilderId(data.id, lang);
        setArticles(posts.map(p => toCard(p, lang)));
      })
      .catch(err => {
        console.error('Error loading builder profile:', err);
        setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [slug, lang]);

  usePageMeta({
    title: builder ? t('builders.profileMetaTitle', { name: builder.name }) : t('builders.meta_title'),
    description: builder ? (builder.bio || t('builders.meta_description')) : t('builders.meta_description'),
    ogUrl: builder ? absoluteUrl(getBuilderUrl(lang, builder.slug)) : undefined,
    ogImage: builder?.photo_url,
  });

  if (!loading && notFound) {
    return <NotFound />;
  }

  return (
    <Layout>
      <section style={{ background: A.bg, paddingTop: 140, paddingBottom: 56, borderBottom: `1px solid ${A.border}` }}>
        <div className="page-container">
          <Link
            to={getBuildersUrl(lang)}
            style={{
              fontFamily: A.sans, fontSize: '10px', fontWeight: 500,
              letterSpacing: '2px', textTransform: 'uppercase',
              color: A.gold, textDecoration: 'none', display: 'inline-block', marginBottom: 32,
            }}
          >
            ← {t('builders.kicker')}
          </Link>

          {loading || !builder ? (
            <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
              <div style={{ width: 88, height: 88, borderRadius: '50%', background: A.bg3 }} />
              <div style={{ width: 240, height: 32, background: A.bg3 }} />
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
              {builder.photo_url ? (
                <img
                  src={builder.photo_url}
                  alt={builder.name}
                  style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{
                  width: 88, height: 88, borderRadius: '50%', background: A.bg3,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: A.serif, fontSize: 32, color: A.gold,
                }}>{builder.name.charAt(0)}</div>
              )}
              <div>
                <h1 style={{ fontFamily: A.serif, fontSize: 'clamp(28px,3.5vw,42px)', fontWeight: 300, color: A.cream, marginBottom: 6 }}>
                  {builder.name}
                </h1>
                {builder.role && (
                  <p style={{ fontFamily: A.sans, fontSize: 14, color: A.gold, marginBottom: 4 }}>
                    {builder.role}
                  </p>
                )}
                {builder.countries.length > 0 && (
                  <p style={{ fontFamily: A.sans, fontSize: 12, color: A.muted }}>{builder.countries.join(', ')}</p>
                )}
              </div>
            </div>
          )}

          {builder?.bio && (
            <p style={{
              fontFamily: A.sans, fontSize: 15, fontWeight: 300, color: A.muted,
              lineHeight: 1.8, maxWidth: 680, marginTop: 28,
            }}>{builder.bio}</p>
          )}
        </div>
      </section>

      {builder && (
        <div className="blog-section" style={{ background: A.bg }}>
          <div className="page-container" style={{ maxWidth: 780 }}>
            <InsightSection
              title={t('builders.profile.decisionFrameworks')}
              items={builder.decisionFrameworks}
              sourceLabel={t('builders.profile.source')}
            />
            <InsightSection
              title={t('builders.profile.keyFailures')}
              items={builder.keyFailures}
              sourceLabel={t('builders.profile.source')}
            />
            <InsightSection
              title={t('builders.profile.mentalModels')}
              items={builder.mentalModels}
              sourceLabel={t('builders.profile.source')}
            />
          </div>
        </div>
      )}

      <div className="blog-section" style={{ background: A.bg }}>
        <div className="page-container">
          <h2 style={{
            fontFamily: A.sans, fontSize: '11px', fontWeight: 500,
            letterSpacing: '2.5px', textTransform: 'uppercase',
            color: A.gold, marginBottom: 24,
          }}>{t('builders.profile.relatedArticles')}</h2>

          {loading ? (
            <div className="blog-article-grid">
              {[1, 2].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : articles.length === 0 ? (
            <p style={{ fontFamily: A.sans, fontSize: 14, color: A.muted }}>
              {t('builders.profile.noArticlesYet')}
            </p>
          ) : (
            <div className="blog-article-grid">
              {articles.map(card => <ArticleCard key={card.id} card={card} lang={lang} />)}
            </div>
          )}

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

export default BuilderProfile;
