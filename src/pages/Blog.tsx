
import { useEffect, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { getPostsByLanguage } from '@/integrations/firebase/blogService';
import { SIGNAL_CATEGORIES } from '@/constants/taxonomy';
import Layout from '@/components/Layout';
import {
  A,
  type ArticleCardData,
  toCard,
  ArticleCard,
  SkeletonCard,
} from '@/components/ArticleCard';
import {
  type Lang,
  useSeoHead,
} from '@/utils/languageUtils';
import { usePageMeta } from '@/utils/pageMeta';
import { trackNewsletterSignup } from '@/utils/analytics';

async function subscribeToNewsletter(email: string, lang: Lang): Promise<void> {
  const res = await fetch('/.netlify/functions/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, lang, source: `blog-page-${lang}` }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({})) as { error?: string };
    if (data.error === 'already_subscribed') throw Object.assign(new Error('already_subscribed'), { code: 'already_subscribed' });
    throw new Error('subscribe_failed');
  }
}

// ── Filter chip button ────────────────────────────────────────────────────────
const FilterChip = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      fontFamily: "'Jost', sans-serif",
      fontSize: '10px', fontWeight: 500,
      letterSpacing: '1.8px', textTransform: 'uppercase',
      padding: '7px 16px',
      border: `1px solid ${active ? A.gold : 'rgba(184,145,42,0.22)'}`,
      background: active ? 'rgba(184,145,42,0.12)' : 'transparent',
      color: active ? A.goldLt : A.muted,
      cursor: 'pointer',
      borderRadius: 2,
      transition: 'all 0.2s',
      whiteSpace: 'nowrap',
    }}
  >
    {label}
  </button>
);

const Blog = () => {
  const { t, i18n } = useTranslation();
  const { pathname } = useLocation();

  const lang: Lang = pathname.startsWith('/fr/') ? 'fr' : 'en';

  useEffect(() => {
    if (i18n.language !== lang) void i18n.changeLanguage(lang);
  }, [lang, i18n]);

  const [cards, setCards] = useState<ArticleCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [nlStatus, setNlStatus] = useState<'idle' | 'loading' | 'success' | 'already' | 'error'>('idle');

  // ── filter state ──────────────────────────────────────────────────────────
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');

  useEffect(() => {
    setLoading(true);
    setCards([]);
    setCategoryFilter('all');
    setCountryFilter('all');
    getPostsByLanguage(lang, { status: 'published' })
      .then(posts => setCards(posts.map(p => toCard(p, lang))))
      .catch(err => console.error(`Error loading posts_${lang}:`, err))
      .finally(() => setLoading(false));
  }, [lang]);

  // Countries are still derived dynamically from fetched data
  const uniqueCountries = useMemo(
    () => [...new Set(cards.flatMap(c => c.targetCountries))].sort(),
    [cards],
  );

  // Apply filters client-side
  const visibleCards = useMemo(() => {
    return cards.filter(card => {
      const catOk = categoryFilter === 'all' || card.category === categoryFilter;
      const cntryOk = countryFilter === 'all' || card.targetCountries.includes(countryFilter);
      return catOk && cntryOk;
    });
  }, [cards, categoryFilter, countryFilter]);

  const activeFilters = (categoryFilter !== 'all' ? 1 : 0) + (countryFilter !== 'all' ? 1 : 0);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://afrinia.org';
  useSeoHead(
    `${origin}/en/blog`,
    `${origin}/fr/blog`,
    `${origin}/${lang}/blog`,
  );

  usePageMeta({
    title: lang === 'fr'
      ? 'Idées & Analyses | Afrinia — Intelligence Africaine'
      : 'Ideas & Analysis | Afrinia — African Intelligence Feed',
    description: lang === 'fr'
      ? 'Explorez les idées, analyses et outils d\'Afrinia pour les entrepreneurs et innovateurs africains. Bimensuel, bilingue.'
      : 'Explore Afrinia\'s ideas, analysis and tools for African entrepreneurs and innovators. Bilingual, biweekly.',
    ogUrl: `${origin}/${lang}/blog`,
  });

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setNlStatus('loading');
    try {
      await subscribeToNewsletter(email.trim(), lang);
      setNlStatus('success');
      trackNewsletterSignup({ source_page: `/${lang}/blog`, lang });
      setEmail('');
    } catch (err) {
      const code = (err as { code?: string }).code;
      setNlStatus(code === 'already_subscribed' ? 'already' : 'error');
    }
  };

  return (
    <Layout>
      {/* ── Hero banner ── */}
      <div style={{
        position: 'relative',
        minHeight: 40,
        paddingTop: 0,
        display: 'flex',
        alignItems: 'center',
        backgroundImage: `url('https://firebasestorage.googleapis.com/v0/b/modified-hull-203004.firebasestorage.app/o/Media%2Fabout1.png?alt=media&token=7ccaaeb4-f339-4e06-8cab-97d300d8c2aa')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: A.bg,
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 50% 60%, rgba(15,23,42,0.25) 0%, rgba(15,23,42,0.55) 40%, rgba(15,23,42,0.82) 75%, rgba(15,23,42,0.97) 100%)',
        }} />
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
          background: `linear-gradient(to bottom, transparent, ${A.bg})`,
        }} />

        <div className="blog-hero-wrap" style={{
          position: 'relative', zIndex: 1,
          display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
        }}>
          <div style={{
            fontFamily: A.sans, fontSize: '9px', fontWeight: 500,
            letterSpacing: '4px', textTransform: 'uppercase',
            color: A.gold, marginBottom: 14,
            textShadow: '0 1px 8px rgba(0,0,0,0.9)',
          }}>{t('blog.eyebrow')}</div>

          <h1 className="blog-title" style={{
            fontFamily: A.serif, fontSize: 'clamp(32px,4vw,52px)',
            fontWeight: 300, color: '#fff', lineHeight: 1.2, marginBottom: 16,
            textShadow: '0 2px 20px rgba(0,0,0,0.95)',
          }}>{t('blog.title')}</h1>

          <div style={{ width: 36, height: 1, background: A.gold, opacity: 0.7, margin: '0 auto 16px' }} />

          <p style={{
            fontFamily: A.sans, fontSize: 14, fontWeight: 300,
            color: 'rgba(245,240,232,0.88)', lineHeight: 1.75, maxWidth: 500,
            textShadow: '0 1px 12px rgba(0,0,0,0.95)',
          }}>{t('blog.subtitle')}</p>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div style={{ background: A.bg, borderBottom: `1px solid ${A.border}` }}>
        <div className="page-container" style={{ paddingTop: 0, paddingBottom: 0 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 0,
            flexWrap: 'wrap', padding: '16px 0',
          }}>
            {/* Category chips — static canonical taxonomy, always in this order */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', flex: 1 }}>
              <FilterChip
                label={lang === 'fr' ? 'TOUT' : 'ALL'}
                active={categoryFilter === 'all'}
                onClick={() => setCategoryFilter('all')}
              />
              {SIGNAL_CATEGORIES.map(cat => (
                <FilterChip
                  key={cat.id}
                  label={lang === 'fr' ? cat.labelFR : cat.labelEN}
                  active={categoryFilter === cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                />
              ))}
            </div>

            {/* Country select */}
            {uniqueCountries.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 16 }}>
                <span style={{
                  fontFamily: A.sans, fontSize: '10px', fontWeight: 500,
                  letterSpacing: '1.5px', textTransform: 'uppercase',
                  color: A.muted, whiteSpace: 'nowrap',
                }}>
                  {lang === 'fr' ? 'Pays' : 'Country'}
                </span>
                <select
                  value={countryFilter}
                  onChange={e => setCountryFilter(e.target.value)}
                  style={{
                    background: A.bg2, border: `1px solid ${countryFilter !== 'all' ? A.gold : 'rgba(184,145,42,0.22)'}`,
                    color: countryFilter !== 'all' ? A.goldLt : A.muted,
                    fontFamily: A.sans, fontSize: '11px',
                    padding: '7px 12px', cursor: 'pointer', outline: 'none',
                    borderRadius: 2,
                  }}
                >
                  <option value="all">{lang === 'fr' ? 'Tous les pays' : 'All countries'}</option>
                  {uniqueCountries.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Active filter count + clear */}
            {activeFilters > 0 && (
              <button
                type="button"
                onClick={() => { setCategoryFilter('all'); setCountryFilter('all'); }}
                style={{
                  marginLeft: 12,
                  fontFamily: A.sans, fontSize: '10px', fontWeight: 500,
                  letterSpacing: '1px', color: A.gold, background: 'none',
                  border: 'none', cursor: 'pointer', textDecoration: 'underline',
                  textUnderlineOffset: 3,
                }}
              >
                {lang === 'fr' ? `Effacer (${activeFilters})` : `Clear (${activeFilters})`}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Article grid ── */}
      <div className="blog-section" style={{ background: A.bg }}>
        <div className="page-container">
          {loading ? (
            <div className="blog-article-grid">
              {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : visibleCards.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div style={{ fontFamily: A.serif, fontSize: 28, fontWeight: 300, color: A.muted, marginBottom: 16 }}>
                {activeFilters > 0
                  ? (lang === 'fr' ? 'Aucun article correspond à ces filtres.' : 'No ideas match these filters.')
                  : (lang === 'fr' ? 'Les premières idées arrivent bientôt.' : 'The first ideas are on their way.')}
              </div>
              {activeFilters > 0 && (
                <button
                  type="button"
                  onClick={() => { setCategoryFilter('all'); setCountryFilter('all'); }}
                  style={{
                    fontFamily: A.sans, fontSize: '11px', fontWeight: 500,
                    letterSpacing: '1.5px', textTransform: 'uppercase',
                    color: A.gold, background: 'none',
                    border: `1px solid ${A.gold}`, padding: '10px 24px',
                    cursor: 'pointer',
                  }}
                >
                  {lang === 'fr' ? 'Voir toutes les idées' : 'Clear filters'}
                </button>
              )}
            </div>
          ) : (
            <>
              {activeFilters > 0 && (
                <p style={{
                  fontFamily: A.sans, fontSize: '11px', color: A.muted,
                  marginBottom: 24, paddingTop: 4,
                }}>
                  {lang === 'fr'
                    ? `${visibleCards.length} idée${visibleCards.length > 1 ? 's' : ''}`
                    : `${visibleCards.length} idea${visibleCards.length !== 1 ? 's' : ''}`}
                </p>
              )}
              <div className="blog-article-grid">
                {visibleCards.map(card => <ArticleCard key={card.id} card={card} lang={lang} />)}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Newsletter ── */}
      <div className="newsletter-block" style={{ background: A.bg3, borderTop: `1px solid ${A.border}`, borderBottom: `1px solid ${A.border}` }}>
        <div className="page-container" style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            fontFamily: A.sans, fontSize: '10px', fontWeight: 500,
            letterSpacing: '4px', textTransform: 'uppercase',
            color: A.gold, marginBottom: 20,
          }}>{t('home.newsletter.eyebrow', 'The Afrinia Brief')}</div>

          <h2 style={{
            fontFamily: A.serif, fontSize: 'clamp(28px,3vw,38px)',
            fontWeight: 300, color: A.cream, lineHeight: 1.2, marginBottom: 16,
          }}>{t('home.newsletter.title', 'One idea. Every Thursday.')}</h2>

          <div style={{ width: 40, height: 1, background: A.gold, opacity: 0.5, margin: '0 auto 20px' }} />

          <p style={{
            fontFamily: A.sans, fontSize: 14, fontWeight: 300,
            color: A.muted, lineHeight: 1.8, marginBottom: 32,
          }}>{t('home.newsletter.sub', 'No noise. No aggregation. One rigorous idea per week for Africa\'s builders.')}</p>

          {(nlStatus === 'success' || nlStatus === 'already') ? (
            <p style={{ fontFamily: A.sans, fontSize: 14, color: A.gold, letterSpacing: '1px' }}>
              {nlStatus === 'already'
                ? t('home.newsletter.alreadyMsg')
                : t('home.newsletter.success', 'You\'re in. Watch your inbox Thursday.')}
            </p>
          ) : (
            <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: 0, maxWidth: 440, margin: '0 auto' }}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={t('home.newsletter.placeholder', 'your@email.com')}
                required
                disabled={nlStatus === 'loading'}
                style={{
                  flex: 1, background: A.bg2, border: `1px solid ${A.border}`,
                  borderRight: 'none', padding: '14px 20px',
                  fontFamily: A.sans, fontSize: 13, color: A.cream,
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                disabled={nlStatus === 'loading'}
                className="afrinia-btn-gold"
                style={{ fontSize: '10px', padding: '14px 28px', flexShrink: 0 }}
              >
                {nlStatus === 'loading' ? '…' : t('home.newsletter.button', 'Subscribe')}
              </button>
            </form>
          )}
          {nlStatus === 'error' && (
            <p style={{ fontFamily: A.sans, fontSize: 12, color: '#ef4444', marginTop: 12 }}>
              {t('home.newsletter.error', 'Something went wrong. Try again.')}
            </p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Blog;
