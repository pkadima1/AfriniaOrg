
import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/integrations/firebase/config';
import { getPostsByLanguage } from '@/integrations/firebase/blogService';
import { fetchAudioEpisodes, type AudioEpisode } from '@/integrations/firebase/audioService';
import { BlogPost } from '@/integrations/firebase/types';
import { type Lang, getBlogUrl, getPostUrl } from '@/utils/languageUtils';
import { trackNewsletterSignup } from '@/utils/analytics';
import { usePageMeta } from '@/utils/pageMeta';
import Layout from '../components/Layout';

// ── Afrinia brand colours (mirrored from CSS variables for inline styles) ──
const A = {
  bg:      '#0f172a',
  bg2:     '#131f35',
  bg3:     '#1a2744',
  gold:    '#B8912A',
  goldLt:  '#d4a83a',
  cream:   '#F5F0E8',
  muted:   '#8a9bb5',
  border:  'rgba(184,145,42,0.18)',
  serif:   "'Cormorant Garamond', Georgia, serif",
  sans:    "'Jost', 'Helvetica Neue', sans-serif",
};

// ── Article card shape used for the Latest Ideas section ──
interface ArticleCard {
  tag: string;
  readTime: string;
  audio: boolean;
  title: string;
  excerpt: string;
  link: string;
  image?: string;
}

function blogPostToCard(post: BlogPost, lang: Lang): ArticleCard {
  const words = (post.excerpt || post.content || '').replace(/<[^>]+>/g, '').split(/\s+/).length;
  const mins = Math.max(1, Math.round(words / 200));
  return {
    tag: post.category || 'Ideas',
    readTime: `${mins} min${lang === 'fr' ? ' de lecture' : ' read'}`,
    audio: false,
    title: post.title,
    excerpt: (post.excerpt || post.content || '').replace(/<[^>]+>/g, '').substring(0, 160) + '…',
    link: getPostUrl(lang, post.slug),
    image: post.featured_image_url,
  };
}

// ── Builder shape for the "People doing the work" section ──
interface BuilderCard {
  quote: string;
  name: string;
  role: string;
  bio: string;
  slug: string;
  image?: string;
}

// Shown only when no published episodes are in Firestore yet
const PLACEHOLDER_EPISODES_EN = [
  { num: 'Episode 001', title: 'How three free AI tools built a $40K/year business in Kinshasa', dur: '7 min 24 sec · Systems + AI' },
  { num: 'Episode 002', title: 'The $2 billion ed-tech gap that nobody is building for', dur: '6 min 51 sec · Opportunity' },
  { num: 'Episode 003', title: 'What M-Pesa was really about — and what it means for AI in Africa', dur: '8 min 03 sec · Roots + Future' },
  { num: 'Episode 004', title: 'Why no-code automation is Africa\'s most underused competitive advantage', dur: '7 min 18 sec · Systems + AI' },
];

const PLACEHOLDER_EPISODES_FR = [
  { num: 'Épisode 001', title: 'Comment trois outils IA gratuits ont généré 40 000 $/an à Kinshasa', dur: '7 min 24 sec · Systèmes + IA' },
  { num: 'Épisode 002', title: 'Le vide de 2 milliards dans l\'edtech africain que personne ne comble', dur: '6 min 51 sec · Opportunité' },
  { num: 'Épisode 003', title: 'Ce que M-Pesa signifiait vraiment — et ce que cela implique pour l\'IA en Afrique', dur: '8 min 03 sec · Racines + Avenir' },
  { num: 'Épisode 004', title: 'Pourquoi l\'automatisation no-code est l\'avantage concurrentiel le plus sous-utilisé d\'Afrique', dur: '7 min 18 sec · Systèmes + IA' },
];

/** Convert a Firestore AudioEpisode to the flat shape the episode list renders */
function episodeToRow(ep: AudioEpisode) {
  const pad = String(ep.episode_number).padStart(3, '0');
  const label = ep.lang === 'fr' ? `Épisode ${pad}` : `Episode ${pad}`;
  const dur = [ep.duration, ep.category].filter(Boolean).join(' · ');
  return { num: label, title: ep.title, dur, url: ep.audio_url };
}

const CATEGORIES = [
  { icon: 'AI',  key: 'ai',       label: 'Systems + AI',  desc: 'Automation, AI tools, and digital infrastructure for African builders' },
  { icon: '▲',  key: 'builders',  label: 'Builders',       desc: 'Founder decisions, case studies, and operator profiles' },
  { icon: '■',  key: 'opp',       label: 'Opportunity',    desc: 'Market gaps, business ideas, and untapped African sectors' },
  { icon: '○',  key: 'edu',       label: 'Education',      desc: 'Skills, frameworks, and tools for Africa\'s knowledge economy' },
  { icon: '∞',  key: 'roots',     label: 'Roots + Future', desc: 'Africa\'s intellectual heritage informing its technological destiny' },
];

// ── Section eyebrow shared style ──
const eyebrowStyle: React.CSSProperties = {
  fontFamily: A.sans,
  fontSize: '10px',
  fontWeight: 500,
  letterSpacing: '4px',
  textTransform: 'uppercase',
  color: A.gold,
  marginBottom: '16px',
};

const sectionTitleStyle: React.CSSProperties = {
  fontFamily: A.serif,
  fontWeight: 300,
  color: A.cream,
  lineHeight: 1.2,
};

// ── Play / Pause button for audio episodes ──
const PlayBtn = ({ active = false, playing = false }: { active?: boolean; playing?: boolean }) => (
  <div style={{
    width: 36, height: 36, flexShrink: 0,
    border: `1px solid ${active ? A.goldLt : A.gold}`,
    borderRadius: '50%',
    background: active ? `rgba(184,145,42,0.12)` : 'transparent',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'background 0.2s, border-color 0.2s',
  }}>
    {active && playing ? (
      /* Pause icon — two vertical bars */
      <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
        <div style={{ width: 3, height: 12, background: A.goldLt, borderRadius: 1 }} />
        <div style={{ width: 3, height: 12, background: A.goldLt, borderRadius: 1 }} />
      </div>
    ) : (
      /* Play triangle */
      <div style={{
        width: 0, height: 0, borderStyle: 'solid',
        borderWidth: '6px 0 6px 10px',
        borderColor: `transparent transparent transparent ${active ? A.goldLt : A.gold}`,
        marginLeft: 2,
      }} />
    )}
  </div>
);

// ── Newsletter subscribe via Netlify function (server writes to Firestore + sends welcome email) ──
async function subscribeEmail(email: string, lang: string): Promise<void> {
  const res = await fetch('/.netlify/functions/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, lang, source: 'homepage' }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({})) as { error?: string };
    if (data.error === 'already_subscribed') throw Object.assign(new Error('already_subscribed'), { code: 'already_subscribed' });
    throw new Error('subscribe_failed');
  }
}

const Index = () => {
  const { t, i18n } = useTranslation();
  // Derive lang from i18n — updates reactively when language switcher fires
  const lang: Lang = i18n.language === 'fr' ? 'fr' : 'en';

  usePageMeta({
    title: lang === 'fr'
      ? 'Afrinia — Intelligence pour les bâtisseurs d\'Afrique'
      : 'Afrinia — Intelligence for Africa\'s Builders',
    description: lang === 'fr'
      ? 'Idées, analyses et outils pour les entrepreneurs et innovateurs africains. Flux d\'intelligence bilingue en français et en anglais.'
      : 'Ideas, analysis and tools for entrepreneurs and innovators across Africa. Bilingual intelligence feed in English and French.',
    ogUrl: 'https://afrinia.org/',
  });

  const [email, setEmail] = useState('');
  const [nlStatus, setNlStatus] = useState<'idle' | 'loading' | 'success' | 'already' | 'error'>('idle');
  const [articles, setArticles] = useState<ArticleCard[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);
  const [builderPost, setBuilderPost] = useState<BuilderCard | null>(null);
  const [episodes, setEpisodes] = useState<AudioEpisode[]>([]);

  // ── Inline audio player state ─────────────────────────────────────────────
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [nowPlaying, setNowPlaying] = useState<{ url: string; title: string; num: string } | null>(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioTime, setAudioTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);

  const handleEpisodeClick = useCallback((url: string, title: string, num: string) => {
    if (!url) return;
    if (nowPlaying?.url === url) {
      // Same episode — toggle play/pause
      if (audioRef.current) {
        if (audioRef.current.paused) {
          void audioRef.current.play();
        } else {
          audioRef.current.pause();
        }
      }
    } else {
      // New episode — swap source and autoplay
      setAudioTime(0);
      setAudioDuration(0);
      setNowPlaying({ url, title, num });
      setAudioPlaying(false); // will flip to true on 'play' event
    }
  }, [nowPlaying]);

  const stopPlayer = useCallback(() => {
    audioRef.current?.pause();
    setNowPlaying(null);
    setAudioPlaying(false);
    setAudioTime(0);
    setAudioDuration(0);
  }, []);

  useEffect(() => {
    // Re-fetch whenever language changes — reads from posts_en or posts_fr accordingly
    setLoadingArticles(true);
    setArticles([]);
    getPostsByLanguage(lang, { status: 'published' })
      .then(posts => {
        setArticles(posts.slice(0, 3).map(p => blogPostToCard(p, lang)));
      })
      .catch(() => {/* silently show empty state */})
      .finally(() => setLoadingArticles(false));
  }, [lang]);

  useEffect(() => {
    // Fetch audio episodes from the lang-specific collection (audio_en or audio_fr)
    fetchAudioEpisodes(lang, 4)
      .then(eps => setEpisodes(eps))
      .catch(() => setEpisodes([]));
  }, [lang]);

  useEffect(() => {
    // Fetch site_config/homepage for builder section toggle (language-agnostic)
    getDoc(doc(db, 'site_config', 'homepage'))
      .then(snap => {
        if (!snap.exists()) return;
        const data = snap.data() as Record<string, unknown>;
        if (data.showBuilderSection === true) {
          setShowBuilder(true);
          // Fetch the most recent real_stories post in the active language
          getPostsByLanguage(lang, { status: 'published', category: 'real_stories' })
            .then(posts => {
              if (posts.length > 0) {
                const p = posts[0];
                setBuilderPost({
                  quote: (p.excerpt || '').replace(/<[^>]+>/g, '') || t('home.builder.quote'),
                  name: p.author_name || t('home.builder.name'),
                  role: t('home.builder.role'),
                  bio: (p.content || '').replace(/<[^>]+>/g, '').substring(0, 280) + '…' || t('home.builder.bio'),
                  slug: p.slug,
                  image: p.featured_image_url,
                });
              }
            })
            .catch(() => {/* use i18n fallback */});
        }
      })
      .catch(() => {/* site_config may not exist yet — hide builder section */});
  }, [lang, t]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setNlStatus('loading');
    try {
      await subscribeEmail(email.trim(), lang);
      setNlStatus('success');
      trackNewsletterSignup({ source_page: 'home', lang });
      setEmail('');
    } catch (err) {
      const code = (err as { code?: string }).code;
      setNlStatus(code === 'already_subscribed' ? 'already' : 'error');
    }
  };

  return (
    <>
    <Layout>
      {/* ════════════════════════════════════════
          SECTION 1 — HERO
      ════════════════════════════════════════ */}
      <section
        className="hero-section"
        style={{
          minHeight: '100vh',
          position: 'relative',
          overflow: 'hidden',
          paddingTop: 68,
          background: `radial-gradient(ellipse 60% 60% at 30% 50%, rgba(184,145,42,0.06) 0%, transparent 70%),
                       linear-gradient(135deg, #0a1020 0%, #0f172a 40%, #111928 100%)`,
        }}
      >
        {/* Subtle grid overlay — left half only */}
        <div
          className="afrinia-grid-bg absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{ right: '50%' }}
        />

        {/* Left — text */}
        <div style={{
          position: 'relative', zIndex: 2,
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
        }}
          className="hero-text"
        >
          <div style={{ ...eyebrowStyle, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <span style={{ display: 'inline-block', width: 28, height: 1, background: A.gold }} />
            {t('home.hero.eyebrow')}
          </div>
          <h1 style={{
            fontFamily: A.serif,
            fontSize: 'clamp(42px, 4.5vw, 64px)',
            fontWeight: 300,
            lineHeight: 1.1,
            color: A.cream,
            marginBottom: 28,
          }}
            dangerouslySetInnerHTML={{ __html: t('home.hero.headline') }}
          />
          <p style={{
            fontFamily: A.sans,
            fontSize: 15, fontWeight: 300,
            color: A.muted, lineHeight: 1.8,
            marginBottom: 40, maxWidth: 440,
          }}>
            {t('home.hero.sub')}
          </p>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <Link to={getBlogUrl(lang)} className="afrinia-btn-gold">{t('home.hero.cta.primary')}</Link>
            <a href="#newsletter" className="afrinia-btn-outline">{t('home.hero.cta.secondary')}</a>
          </div>
        </div>

        {/* Right — hero image in tablet mockup */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }} className="hero-image-col">
          {/* Tablet shell */}
          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: 520,
            background: '#0d1120',
            borderRadius: 24,
            border: '2px solid rgba(184,145,42,0.3)',
            boxShadow: `
              0 0 0 1px rgba(255,255,255,0.04),
              0 32px 80px rgba(0,0,0,0.65),
              inset 0 1px 0 rgba(255,255,255,0.06)
            `,
            padding: '18px 14px',
          }}>
            {/* Top bar — camera + speaker */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              height: 24,
              marginBottom: 10,
            }}>
              <div style={{
                width: 8, height: 8,
                borderRadius: '50%',
                background: '#1e2535',
                border: '1px solid rgba(255,255,255,0.08)',
              }} />
              <div style={{
                width: 44, height: 5,
                borderRadius: 4,
                background: '#1e2535',
              }} />
            </div>

            {/* Screen */}
            <div style={{
              borderRadius: 12,
              overflow: 'hidden',
              aspectRatio: '4/3',
              background: '#000',
            }}>
              <img
                src="https://firebasestorage.googleapis.com/v0/b/modified-hull-203004-d8ktc/o/Media%2F20260314_1811_Image%20Generation_simple_compose_01kkphva1jes9swpwtryzre46m.png?alt=media&token=3b88ab0a-4aa0-4d61-92eb-a167381c9a18"
                alt="Africa builds"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center',
                  filter: 'brightness(0.9) contrast(1.08) saturate(1.12)',
                  display: 'block',
                }}
              />
            </div>

            {/* Bottom bar — home button */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 28,
              marginTop: 10,
            }}>
              <div style={{
                width: 36, height: 36,
                borderRadius: '50%',
                border: '1.5px solid rgba(184,145,42,0.25)',
                background: '#1a2030',
              }} />
            </div>

            {/* Right side button */}
            <div style={{
              position: 'absolute',
              right: -3, top: '30%',
              width: 3, height: 52,
              background: '#1c2538',
              borderRadius: '0 3px 3px 0',
            }} />
            {/* Left side buttons */}
            <div style={{
              position: 'absolute',
              left: -3, top: '22%',
              width: 3, height: 36,
              background: '#1c2538',
              borderRadius: '3px 0 0 3px',
            }} />
            <div style={{
              position: 'absolute',
              left: -3, top: '33%',
              width: 3, height: 36,
              background: '#1c2538',
              borderRadius: '3px 0 0 3px',
            }} />
          </div>
        </div>

      </section>

      {/* ════════════════════════════════════════
          SECTION 2 — STATS STRIP
      ════════════════════════════════════════ */}
      <section className="section-md" style={{
        background: A.bg2,
        borderTop: `1px solid ${A.border}`,
        borderBottom: `1px solid ${A.border}`,
      }}>
        <div className="page-container stats-grid">
          {([
            { num: '54',   label: t('home.stats.s1') },
            { num: '1.4B', label: t('home.stats.s2') },
            { num: '1',    label: t('home.stats.s3') },
            { num: '0',    label: t('home.stats.s4') },
          ] as const).map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: A.serif, fontSize: 42,
                fontWeight: 300, color: A.gold, lineHeight: 1, marginBottom: 8,
              }}>{s.num}</div>
              <div style={{
                fontFamily: A.sans, fontSize: '10px',
                letterSpacing: '2.5px', textTransform: 'uppercase',
                color: A.muted,
              }}>{s.label}</div>
            </div>
          ))}
        </div>

      </section>

      {/* ════════════════════════════════════════
          SECTION 3 — THREE PILLARS
      ════════════════════════════════════════ */}
      <section className="section-xl" style={{ background: A.bg }}>
        <div className="page-container">
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={eyebrowStyle}>{t('home.pillars.eyebrow')}</div>
            <h2 style={{ ...sectionTitleStyle, fontSize: 'clamp(32px,3.5vw,48px)' }}
              dangerouslySetInnerHTML={{ __html: t('home.pillars.title') }}
            />
          </div>
          <div className="pillars-grid">
            {([
              { num: '01', key: 'ideas' },
              { num: '02', key: 'builders' },
              { num: '03', key: 'audio' },
            ] as const).map((p, i) => (
              <div key={i} className="afrinia-pillar" style={{ transitionDelay: `${i * 0.15}s` }}>
                <div style={{
                  fontFamily: A.serif, fontSize: 64, fontWeight: 300,
                  color: 'rgba(184,145,42,0.55)', lineHeight: 1, marginBottom: 24,
                }}>{p.num}</div>
                <div style={{
                  fontFamily: A.sans, fontSize: '11px', fontWeight: 500,
                  letterSpacing: '3px', textTransform: 'uppercase',
                  color: A.gold, marginBottom: 16,
                }}>{t(`home.pillars.${p.key}.label`)}</div>
                <h3 style={{
                  fontFamily: A.serif, fontSize: 22, fontWeight: 400,
                  color: A.cream, lineHeight: 1.3, marginBottom: 16,
                }}>{t(`home.pillars.${p.key}.headline`)}</h3>
                <p style={{
                  fontFamily: A.sans, fontSize: 14, fontWeight: 300,
                  color: A.muted, lineHeight: 1.8,
                }}>{t(`home.pillars.${p.key}.body`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          SECTION 4 — BELIEF QUOTE
      ════════════════════════════════════════ */}
      <section className="section-md text-center" style={{
        background: A.bg2,
        borderTop: `1px solid ${A.border}`,
        borderBottom: `1px solid ${A.border}`,
      }}>
        <div className="page-container section-center-sm">
          <p style={{
            fontFamily: A.serif,
            fontSize: 'clamp(22px,2.8vw,36px)',
            fontWeight: 300, fontStyle: 'italic',
            color: A.cream, lineHeight: 1.5,
            marginBottom: 24,
          }}
            dangerouslySetInnerHTML={{ __html: t('home.belief.quote') }}
          />
          <div style={{ width: 40, height: 1, background: A.gold, opacity: 0.5, margin: '0 auto 16px' }} />
          <p style={{
            fontFamily: A.sans, fontSize: '10px',
            letterSpacing: '3px', textTransform: 'uppercase',
            color: A.muted,
          }}>{t('home.belief.attr')}</p>
        </div>
      </section>

      {/* ════════════════════════════════════════
          SECTION 5 — LATEST IDEAS
      ════════════════════════════════════════ */}
      <section id="ideas" className="section-xl" style={{ background: A.bg }}>
        <div className="page-container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 48, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={eyebrowStyle}>{t('home.latest.eyebrow')}</div>
              <h2 style={{ ...sectionTitleStyle, fontSize: 36 }}
                dangerouslySetInnerHTML={{ __html: t('home.latest.title') }}
              />
            </div>
            <Link to={getBlogUrl(lang)} className="afrinia-btn-outline">{t('home.latest.viewAll')}</Link>
          </div>

          {loadingArticles ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: A.muted, fontFamily: A.sans, fontSize: 13 }}>
              {lang === 'fr' ? 'Chargement…' : 'Loading…'}
            </div>
          ) : articles.length === 0 ? (
            <div className="section-md" style={{
              gridColumn: '1 / -1', textAlign: 'center',
              border: `1px solid ${A.border}`,
            }}>
              <p style={{ fontFamily: A.serif, fontSize: 24, fontWeight: 300, color: A.muted, marginBottom: 12 }}>
                {lang === 'fr' ? 'La première idée est en cours de rédaction.' : 'The first idea is being written.'}
              </p>
              <p style={{ fontFamily: A.sans, fontSize: 13, fontWeight: 300, color: A.muted, lineHeight: 1.7 }}>
                {lang === 'fr' ? 'Abonnez-vous ci-dessous pour être le premier à la lire.' : 'Subscribe below to be the first to read it.'}
              </p>
            </div>
          ) : (
            <>
              <div className={`articles-grid article-count-${articles.length}`}>
                {articles.map((art, i) => (
                  <div key={i} className="afrinia-article-card">
                    {art.image ? (
                      <img
                        src={art.image}
                        alt={art.title}
                        style={{
                          width: '100%', aspectRatio: i === 0 ? '16/9' : '3/2',
                          objectFit: 'cover', display: 'block',
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '100%', aspectRatio: i === 0 ? '16/9' : '3/2',
                        background: A.bg3,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <span style={{
                          fontFamily: A.sans, fontSize: '9px',
                          letterSpacing: '2px', textTransform: 'uppercase',
                          color: A.muted,
                        }}>Afrinia</span>
                      </div>
                    )}
                    <div style={{ padding: 28 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
                        <span className="afrinia-tag">{art.tag}</span>
                        <span style={{ fontFamily: A.sans, fontSize: '10px', color: A.muted, letterSpacing: '1px' }}>{art.readTime}</span>
                        {art.audio && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: A.sans, fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', color: A.muted }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: A.gold, flexShrink: 0, display: 'inline-block' }} />
                            Audio available
                          </span>
                        )}
                      </div>
                      <h3 style={{
                        fontFamily: A.serif,
                        fontSize: i === 0 ? 26 : 20,
                        fontWeight: 400, color: A.cream, lineHeight: 1.25, marginBottom: 12,
                      }}>{art.title}</h3>
                      <p style={{
                        fontFamily: A.sans, fontSize: 13, fontWeight: 300,
                        color: A.muted, lineHeight: 1.7, marginBottom: 20,
                      }}>{art.excerpt}</p>
                      <Link
                        to={art.link}
                        style={{
                          fontFamily: A.sans, fontSize: '10px', fontWeight: 500,
                          letterSpacing: '2px', textTransform: 'uppercase',
                          color: A.gold, textDecoration: 'none',
                        }}
                      >
                        {t('home.latest.readMore')} →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════════
          SECTION 6 — CATEGORIES
      ════════════════════════════════════════ */}
      <section className="section-md" style={{
        background: A.bg2,
        borderTop: `1px solid ${A.border}`,
      }}>
        <div className="page-container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={eyebrowStyle}>{t('home.categories.eyebrow')}</div>
            <h2 style={{ ...sectionTitleStyle, fontSize: 'clamp(32px,3.5vw,48px)' }}
              dangerouslySetInnerHTML={{ __html: t('home.categories.title') }}
            />
          </div>
          <div className="cat-grid">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.key}
                to={`${getBlogUrl(lang)}?category=${cat.key}`}
                style={{
                  background: A.bg, border: `1px solid ${A.border}`,
                  padding: '32px 24px', textAlign: 'center',
                  textDecoration: 'none', display: 'block',
                  transition: 'border-color 0.3s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = A.gold; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = A.border; }}
              >
                <div style={{
                  fontFamily: A.serif, fontSize: 32, fontWeight: 300,
                  color: 'rgba(184,145,42,0.55)', marginBottom: 16, lineHeight: 1,
                }}>{cat.icon}</div>
                <div style={{
                  fontFamily: A.sans, fontSize: '10px', fontWeight: 500,
                  letterSpacing: '2.5px', textTransform: 'uppercase',
                  color: A.cream, marginBottom: 8,
                }}>{cat.label}</div>
                <div style={{
                  fontFamily: A.sans, fontSize: 12, fontWeight: 300,
                  color: A.muted, lineHeight: 1.6,
                }}>{cat.desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          SECTION 7 — FEATURED BUILDER
          Only rendered when admin enables it via site_config/homepage.showBuilderSection
      ════════════════════════════════════════ */}
      {showBuilder && (
        <section className="section-xl" style={{ background: A.bg }}>
          <div className="page-container">
            <div style={{ marginBottom: 48 }}>
              <div style={eyebrowStyle}>{t('home.builder.eyebrow')}</div>
              <h2 style={{ ...sectionTitleStyle, fontSize: 'clamp(32px,3.5vw,48px)' }}
                dangerouslySetInnerHTML={{ __html: t('home.builder.title') }}
              />
            </div>
            <div className="builder-grid">
              {/* Image */}
              <div style={{
                background: A.bg3, border: `1px solid ${A.border}`,
                aspectRatio: '3/4', overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {builderPost?.image ? (
                  <img
                    src={builderPost.image}
                    alt={builderPost.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                ) : (
                  <p style={{
                    fontFamily: A.sans, fontSize: '10px',
                    letterSpacing: '2px', textTransform: 'uppercase',
                    color: A.muted, textAlign: 'center', padding: 24, lineHeight: 2,
                  }}>
                    Founder portrait<br />Natural window light<br />Confident · Real
                  </p>
                )}
              </div>
              {/* Content */}
              <div style={{
                background: A.bg2, border: `1px solid ${A.border}`,
                padding: '60px 52px',
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
              }}>
                <span className="afrinia-tag" style={{ marginBottom: 32, display: 'inline-block' }}>
                  {t('home.builder.featuredTag')}
                </span>
                <p style={{
                  fontFamily: A.serif, fontSize: 28, fontWeight: 300,
                  fontStyle: 'italic', color: A.cream, lineHeight: 1.4, marginBottom: 32,
                }}>{builderPost?.quote || t('home.builder.quote')}</p>
                <div style={{
                  fontFamily: A.sans, fontSize: '11px', fontWeight: 500,
                  letterSpacing: '2px', textTransform: 'uppercase',
                  color: A.gold, marginBottom: 6,
                }}>{builderPost?.name || t('home.builder.name')}</div>
                <div style={{
                  fontFamily: A.sans, fontSize: 12, fontWeight: 300,
                  color: A.muted, marginBottom: 36,
                }}>{builderPost?.role || t('home.builder.role')}</div>
                <p style={{
                  fontFamily: A.sans, fontSize: 14, fontWeight: 300,
                  color: A.muted, lineHeight: 1.8, marginBottom: 32,
                }}>{builderPost?.bio || t('home.builder.bio')}</p>
                <Link
                  to={builderPost ? getPostUrl(lang, builderPost.slug) : '/builders'}
                  className="afrinia-btn-outline"
                  style={{ alignSelf: 'flex-start' }}
                >
                  {t('home.builder.cta')} →
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════
          SECTION 8 — AUDIO STRIP
      ════════════════════════════════════════ */}
      <section className="section-md" style={{
        background: A.bg2,
        borderTop: `1px solid ${A.border}`,
        borderBottom: `1px solid ${A.border}`,
      }}>
        <div className="page-container audio-grid" style={{
          gap: 80, alignItems: 'center',
        }}>
          {/* Left */}
          <div>
            <div style={eyebrowStyle}>{t('home.audio.eyebrow')}</div>
            <h2 style={{
              ...sectionTitleStyle,
              fontSize: 'clamp(28px,3vw,42px)',
              marginBottom: 20,
            }}
              dangerouslySetInnerHTML={{ __html: t('home.audio.title') }}
            />
            <div style={{ width: 40, height: 1, background: A.gold, opacity: 0.5, margin: '0 0 20px' }} />
            <p style={{
              fontFamily: A.sans, fontSize: 14, fontWeight: 300,
              color: A.muted, lineHeight: 1.8, marginBottom: 32, maxWidth: 420,
            }}>{t('home.audio.body')}</p>
            <Link to="/audio" className="afrinia-btn-outline">{t('home.audio.cta')} →</Link>
          </div>
          {/* Right — episode list (live from Firestore, fallback to placeholders) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {(episodes.length > 0
              ? episodes.map(episodeToRow)
              : lang === 'fr' ? PLACEHOLDER_EPISODES_FR : PLACEHOLDER_EPISODES_EN
            ).map((ep, i) => {
              const row = ep as { num: string; title: string; dur: string; url?: string };
              const isActive = !!row.url && nowPlaying?.url === row.url;
              const inner = (
                <div
                  key={i}
                  className="afrinia-episode"
                  style={{
                    textDecoration: 'none',
                    cursor: row.url ? 'pointer' : 'default',
                    background: isActive ? 'rgba(184,145,42,0.06)' : undefined,
                    borderRadius: isActive ? 4 : undefined,
                  }}
                  onClick={row.url ? () => handleEpisodeClick(row.url!, row.title, row.num) : undefined}
                >
                  <PlayBtn active={isActive} playing={isActive && audioPlaying} />
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontFamily: A.sans, fontSize: '9px',
                      letterSpacing: '2px', textTransform: 'uppercase',
                      color: A.gold, marginBottom: 4,
                    }}>{row.num}</div>
                    <div style={{
                      fontFamily: A.serif, fontSize: 15, fontWeight: 400,
                      color: A.cream, lineHeight: 1.3, marginBottom: 4,
                    }}>{row.title}</div>
                    <div style={{
                      fontFamily: A.sans, fontSize: '10px', color: A.muted,
                    }}>{row.dur}</div>
                  </div>
                </div>
              );
              return inner;
            })}
          </div>
        </div>

      </section>

      {/* ════════════════════════════════════════
          SECTION 9 — NEWSLETTER
      ════════════════════════════════════════ */}
      <section id="newsletter" className="section-xl text-center" style={{ background: A.bg }}>
        <div className="page-container section-center-xs">
          <div style={{ ...eyebrowStyle, marginBottom: 20 }}>{t('home.newsletter.eyebrow')}</div>
          <h2 style={{
            fontFamily: A.serif, fontSize: 'clamp(36px,4vw,56px)',
            fontWeight: 300, lineHeight: 1.1, color: A.cream, marginBottom: 8,
          }}>{t('home.newsletter.headline')}</h2>
          <h2 style={{
            fontFamily: A.serif, fontSize: 'clamp(36px,4vw,56px)',
            fontWeight: 300, fontStyle: 'italic', lineHeight: 1.1,
            color: A.gold, marginBottom: 28,
          }}>{t('home.newsletter.sub')}</h2>
          <p style={{
            fontFamily: A.sans, fontSize: 14, fontWeight: 300,
            color: A.muted, lineHeight: 1.8, marginBottom: 40,
          }}>{t('home.newsletter.desc')}</p>

          {(nlStatus === 'success' || nlStatus === 'already') ? (
            <p style={{
              fontFamily: A.sans, fontSize: 14, color: A.gold,
              letterSpacing: '1px', padding: '16px 0',
            }}>
              {nlStatus === 'already' ? t('home.newsletter.alreadyMsg') : t('home.newsletter.successMsg')}
            </p>
          ) : (
            <form
              onSubmit={handleSubscribe}
              style={{ display: 'flex', maxWidth: 480, margin: '0 auto 20px' }}
            >
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={t('home.newsletter.placeholder')}
                required
                style={{
                  flex: 1, background: A.bg2,
                  border: `1px solid ${A.border}`, borderRight: 'none',
                  padding: '16px 20px',
                  fontFamily: A.sans, fontSize: 13, fontWeight: 300,
                  color: A.cream, outline: 'none',
                }}
              />
              <button
                type="submit"
                disabled={nlStatus === 'loading'}
                className="afrinia-btn-gold"
                style={{ whiteSpace: 'nowrap', opacity: nlStatus === 'loading' ? 0.7 : 1 }}
              >
                {nlStatus === 'loading' ? '...' : t('home.newsletter.cta')}
              </button>
            </form>
          )}

          {nlStatus === 'error' && (
            <p style={{ fontFamily: A.sans, fontSize: 12, color: '#ef4444', marginBottom: 8 }}>
              {t('home.newsletter.errorMsg')}
            </p>
          )}

          <p style={{
            fontFamily: A.sans, fontSize: '10px',
            letterSpacing: '1.5px', textTransform: 'uppercase',
            color: A.muted,
          }}>{t('home.newsletter.promise')}</p>
        </div>
      </section>
    </Layout>

    {/* ── Hidden audio element ── */}
    {nowPlaying && (
      <audio
        ref={audioRef}
        src={nowPlaying.url}
        autoPlay
        onPlay={() => setAudioPlaying(true)}
        onPause={() => setAudioPlaying(false)}
        onEnded={() => { setAudioPlaying(false); setAudioTime(0); }}
        onTimeUpdate={() => setAudioTime(audioRef.current?.currentTime ?? 0)}
        onLoadedMetadata={() => setAudioDuration(audioRef.current?.duration ?? 0)}
      />
    )}

    {/* ── Fixed bottom mini-player ── */}
    {nowPlaying && (
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
        background: '#0a1628',
        borderTop: `1px solid ${A.border}`,
        padding: '10px 24px',
        display: 'flex', alignItems: 'center', gap: 16,
        boxShadow: '0 -4px 24px rgba(0,0,0,0.5)',
      }}>
        {/* Play/Pause toggle */}
        <button
          onClick={() => {
            if (audioRef.current) {
              if (audioRef.current.paused) void audioRef.current.play();
              else audioRef.current.pause();
            }
          }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}
        >
          <PlayBtn active playing={audioPlaying} />
        </button>

        {/* Episode info */}
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontFamily: A.sans, fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: A.gold, marginBottom: 2 }}>
            {nowPlaying.num}
          </div>
          <div style={{ fontFamily: A.serif, fontSize: 14, color: A.cream, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {nowPlaying.title}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ flex: 2, display: 'flex', alignItems: 'center', gap: 10, maxWidth: 400 }}>
          <span style={{ fontFamily: A.sans, fontSize: 11, color: A.muted, flexShrink: 0 }}>
            {Math.floor(audioTime / 60)}:{String(Math.floor(audioTime % 60)).padStart(2, '0')}
          </span>
          <input
            type="range"
            min={0}
            max={audioDuration || 1}
            value={audioTime}
            onChange={e => {
              const t = Number(e.target.value);
              if (audioRef.current) audioRef.current.currentTime = t;
              setAudioTime(t);
            }}
            style={{ flex: 1, accentColor: A.gold, cursor: 'pointer' }}
          />
          <span style={{ fontFamily: A.sans, fontSize: 11, color: A.muted, flexShrink: 0 }}>
            {audioDuration ? `${Math.floor(audioDuration / 60)}:${String(Math.floor(audioDuration % 60)).padStart(2, '0')}` : '--:--'}
          </span>
        </div>

        {/* Close */}
        <button
          onClick={stopPlayer}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: A.muted, fontSize: 18, lineHeight: 1, flexShrink: 0,
            padding: '4px 6px',
          }}
          title="Close player"
        >
          ✕
        </button>
      </div>
    )}
    </>
  );
};

export default Index;
