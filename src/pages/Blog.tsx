
import { useEffect, useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { getPostsByLanguage } from '@/integrations/firebase/blogService';
import { BlogPost as FirestorePost } from '@/integrations/firebase/types';
import Layout from '@/components/Layout';
import {
  type Lang,
  getPostUrl,
  useSeoHead,
} from '@/utils/languageUtils';
import { usePageMeta } from '@/utils/pageMeta';
import { trackNewsletterSignup } from '@/utils/analytics';

// ── Afrinia brand tokens ──────────────────────────────────────────────────────
const A = {
  bg:     '#0f172a',
  bg2:    '#131f35',
  bg3:    '#1a2744',
  gold:   '#B8912A',
  goldLt: '#d4a83a',
  cream:  '#F5F0E8',
  muted:  '#8a9bb5',
  border: 'rgba(184,145,42,0.18)',
  serif:  "'Cormorant Garamond', Georgia, serif",
  sans:   "'Jost', 'Helvetica Neue', sans-serif",
};

interface ArticleCard {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  image?: string;
  readTime: string;
  targetCountries: string[];
  contentLang: string;
  tags: string[];
}

function toCard(post: FirestorePost, lang: Lang): ArticleCard {
  const words = (post.excerpt || post.content || '').replace(/<[^>]+>/g, '').split(/\s+/).length;
  const mins = Math.max(1, Math.round(words / 200));
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt || post.content?.replace(/<[^>]+>/g, '').substring(0, 160) + '…' || '',
    category: post.category || 'Ideas',
    author: post.author_name,
    date: post.published_at
      ? new Date(post.published_at).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', {
          year: 'numeric', month: 'long', day: 'numeric',
        })
      : post.created_at
        ? new Date(post.created_at).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', {
            year: 'numeric', month: 'long', day: 'numeric',
          })
        : '—',
    image: post.featured_image_url,
    readTime: `${mins} min${lang === 'fr' ? ' de lecture' : ' read'}`,
    targetCountries: post.target_countries ?? [],
    contentLang: post.content_language ?? lang,
    tags: post.tags ?? [],
  };
}

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

// ── Article card component ──────────────────────────────────────────────────
const ArticleCard = ({ card, lang }: { card: ArticleCard; lang: Lang }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      to={getPostUrl(lang, card.slug)}
      style={{ textDecoration: 'none' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <article style={{
        background: A.bg2,
        borderRadius: '16px',
        border: `1px solid ${hovered ? 'rgba(184,145,42,0.4)' : A.border}`,
        overflow: 'hidden',
        transition: 'border-color 0.3s, transform 0.3s',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {card.image && (
          <div style={{ width: '100%', aspectRatio: '16/9', overflow: 'hidden' }}>
            <img
              src={card.image}
              alt={card.title}
              loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s', transform: hovered ? 'scale(1.03)' : 'scale(1)' }}
              onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
        )}
        <div style={{ padding: '28px 28px 32px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <span style={{
              fontFamily: A.sans, fontSize: '9px', fontWeight: 500,
              letterSpacing: '2.5px', textTransform: 'uppercase',
              color: A.gold, border: `1px solid rgba(184,145,42,0.25)`,
              padding: '3px 10px',
            }}>{card.category}</span>
            <span style={{ fontFamily: A.sans, fontSize: '11px', color: A.muted }}>{card.readTime}</span>
          </div>

          <h2 style={{
            fontFamily: A.serif, fontSize: 'clamp(18px,2vw,22px)',
            fontWeight: 400, color: A.cream,
            lineHeight: 1.3, marginBottom: 12, flex: 1,
          }}>{card.title}</h2>

          <p style={{
            fontFamily: A.sans, fontSize: 13, fontWeight: 300,
            color: A.muted, lineHeight: 1.7,
            marginBottom: 20,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>{card.excerpt}</p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: A.sans, fontSize: '11px', color: A.muted }}>{card.date}</span>
            <span style={{
              fontFamily: A.sans, fontSize: '10px', fontWeight: 500,
              letterSpacing: '1.5px', textTransform: 'uppercase',
              color: hovered ? A.goldLt : A.gold,
              transition: 'color 0.2s',
            }}>{lang === 'fr' ? 'Lire →' : 'Read →'}</span>
          </div>
        </div>
      </article>
    </Link>
  );
};

// ── Skeleton card for loading state ──────────────────────────────────────────
const SkeletonCard = () => (
  <div style={{ background: A.bg2, borderRadius: '16px', border: `1px solid ${A.border}`, overflow: 'hidden' }}>
    <div style={{ width: '100%', aspectRatio: '16/9', background: A.bg3 }} />
    <div style={{ padding: '28px' }}>
      <div style={{ width: 80, height: 10, background: A.bg3, marginBottom: 16 }} />
      <div style={{ width: '90%', height: 18, background: A.bg3, marginBottom: 8 }} />
      <div style={{ width: '70%', height: 18, background: A.bg3, marginBottom: 20 }} />
      <div style={{ width: '100%', height: 12, background: A.bg3, marginBottom: 6 }} />
      <div style={{ width: '80%', height: 12, background: A.bg3 }} />
    </div>
  </div>
);

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

  const [cards, setCards] = useState<ArticleCard[]>([]);
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

  // Derive unique categories and countries from fetched cards
  const uniqueCategories = useMemo(
    () => [...new Set(cards.map(c => c.category).filter(Boolean))].sort(),
    [cards],
  );
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
            {/* Category chips */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', flex: 1 }}>
              <FilterChip
                label={lang === 'fr' ? 'Tout' : 'All'}
                active={categoryFilter === 'all'}
                onClick={() => setCategoryFilter('all')}
              />
              {uniqueCategories.map(cat => (
                <FilterChip
                  key={cat}
                  label={cat}
                  active={categoryFilter === cat}
                  onClick={() => setCategoryFilter(cat)}
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
