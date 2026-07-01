import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import { fetchAudioEpisodes } from '@/integrations/firebase/audioService';
import type { AudioEpisode, PostCategory } from '@/integrations/firebase/types';
import type { Lang } from '@/utils/languageUtils';
import { getCategoryLabel, SIGNAL_CATEGORIES } from '@/constants/taxonomy';
import { trackAudioPlay, trackAudioPause } from '@/utils/analytics';
import { usePageMeta } from '@/utils/pageMeta';

// ── Brand tokens (shared with Index.tsx) ────────────────────────────────────
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

// ── Small inline play/pause button ───────────────────────────────────────────
const PlayBtn = ({ active = false, playing = false }: { active?: boolean; playing?: boolean }) => (
  <div style={{
    width: 44, height: 44, flexShrink: 0,
    border: `1px solid ${active ? A.goldLt : A.gold}`,
    borderRadius: '50%',
    background: active ? 'rgba(184,145,42,0.14)' : 'transparent',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'background 0.2s, border-color 0.2s',
    cursor: 'pointer',
  }}>
    {active && playing ? (
      <div style={{ display: 'flex', gap: 3 }}>
        <div style={{ width: 3, height: 12, background: A.goldLt, borderRadius: 1 }} />
        <div style={{ width: 3, height: 12, background: A.goldLt, borderRadius: 1 }} />
      </div>
    ) : (
      <div style={{
        width: 0, height: 0, borderStyle: 'solid',
        borderWidth: '7px 0 7px 12px',
        borderColor: `transparent transparent transparent ${active ? A.goldLt : A.gold}`,
        marginLeft: 3,
      }} />
    )}
  </div>
);

// ── Signal filter chip ───────────────────────────────────────────────────────
const FilterChip = ({
  label, active, onClick,
}: { label: string; active: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    style={{
      fontFamily: A.sans,
      fontSize: '10px',
      fontWeight: active ? 600 : 400,
      letterSpacing: '2.5px',
      textTransform: 'uppercase',
      padding: '8px 18px',
      border: `1px solid ${active ? A.gold : A.border}`,
      borderRadius: 4,
      background: active ? 'rgba(184,145,42,0.12)' : 'transparent',
      color: active ? A.gold : A.muted,
      cursor: 'pointer',
      transition: 'color 0.2s, border-color 0.2s, background 0.2s',
      whiteSpace: 'nowrap',
    }}
  >
    {label}
  </button>
);

// ── Episode card ─────────────────────────────────────────────────────────────
interface CardProps {
  ep: AudioEpisode;
  isActive: boolean;
  isPlaying: boolean;
  onPlay: (ep: AudioEpisode) => void;
  epLabel: string;
  lang: Lang;
}

const EpisodeCard = ({ ep, isActive, isPlaying, onPlay, epLabel, lang }: CardProps) => (
  <div
    onClick={() => ep.audio_url && onPlay(ep)}
    style={{
      background: isActive ? A.bg3 : A.bg2,
      border: `1px solid ${isActive ? A.gold : A.border}`,
      borderRadius: 8,
      overflow: 'hidden',
      cursor: ep.audio_url ? 'pointer' : 'default',
      transition: 'border-color 0.2s, background 0.2s',
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    {/* Cover image */}
    {ep.featured_image_url && (
      <div style={{ width: '100%', aspectRatio: '16/9', overflow: 'hidden' }}>
        <img
          src={ep.featured_image_url}
          alt={ep.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>
    )}

    {/* Card body */}
    <div style={{ padding: '20px 20px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Episode number */}
      <div style={{
        fontFamily: A.sans, fontSize: '9px', fontWeight: 500,
        letterSpacing: '2.5px', textTransform: 'uppercase', color: A.gold,
      }}>
        {epLabel} {String(ep.episode_number).padStart(3, '0')}
      </div>

      {/* Title */}
      <div style={{
        fontFamily: A.serif, fontSize: 18, fontWeight: 400,
        color: A.cream, lineHeight: 1.3,
      }}>
        {ep.title}
      </div>

      {/* Meta row */}
      <div style={{
        fontFamily: A.sans, fontSize: '11px', color: A.muted,
        display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
      }}>
        <span>{ep.duration}</span>
        {ep.category && (
          <>
            <span style={{ width: 2, height: 2, borderRadius: '50%', background: A.muted, flexShrink: 0, display: 'inline-block' }} />
            <span>{getCategoryLabel(ep.category as PostCategory, lang)}</span>
          </>
        )}
      </div>

      {/* Play button row */}
      {ep.audio_url && (
        <div style={{ marginTop: 6 }}>
          <PlayBtn active={isActive} playing={isActive && isPlaying} />
        </div>
      )}
    </div>
  </div>
);

// ── Main page ────────────────────────────────────────────────────────────────
const AudioPage = () => {
  const { t, i18n } = useTranslation();
  const lang: Lang = i18n.language === 'fr' ? 'fr' : 'en';

  usePageMeta({
    title: t('audio_page.page_title'),
    description: t('audio_page.page_description'),
    ogUrl: 'https://afrinia.org/audio',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'PodcastSeries',
      '@id': 'https://afrinia.org/audio#podcast',
      name: 'The Afrinia Brief',
      description: 'Ideas, analysis, and conversations for Africa\'s entrepreneurs and builders. Available in English and French.',
      url: 'https://afrinia.org/audio',
      inLanguage: ['en', 'fr'],
      author: {
        '@type': 'Organization',
        name: 'Afrinia',
        '@id': 'https://afrinia.org/#organization',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Afrinia',
        '@id': 'https://afrinia.org/#organization',
      },
    },
  });

  const [episodes, setEpisodes] = useState<AudioEpisode[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<PostCategory | 'all'>('all');

  // Inline player state
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [nowPlaying, setNowPlaying] = useState<AudioEpisode | null>(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioTime, setAudioTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);

  // Re-fetch when language changes
  useEffect(() => {
    setLoading(true);
    fetchAudioEpisodes(lang, 50)
      .then(eps => setEpisodes(eps))
      .catch(() => setEpisodes([]))
      .finally(() => setLoading(false));
  }, [lang]);

  const handlePlay = useCallback((ep: AudioEpisode) => {
    if (!ep.audio_url) return;
    if (nowPlaying?.id === ep.id) {
      // Toggle same episode
      if (audioRef.current) {
        if (audioRef.current.paused) void audioRef.current.play();
        else audioRef.current.pause();
      }
    } else {
      setAudioTime(0);
      setAudioDuration(0);
      setNowPlaying(ep);
      setAudioPlaying(false);
    }
  }, [nowPlaying]);

  const stopPlayer = useCallback(() => {
    audioRef.current?.pause();
    setNowPlaying(null);
    setAudioPlaying(false);
    setAudioTime(0);
    setAudioDuration(0);
  }, []);

  const epLabel = t('audio_page.episode_label');

  const visibleEpisodes = categoryFilter === 'all'
    ? episodes
    : episodes.filter(ep => ep.category === categoryFilter);

  return (
    <>
      <Layout>
        <section
          className="section-xl"
          style={{ background: A.bg, minHeight: '100vh', paddingTop: 120, paddingBottom: nowPlaying ? 90 : 60 }}
        >
          <div className="page-container">

            {/* Page header */}
            <div style={{ textAlign: 'center', marginBottom: 60 }}>
              <div style={{
                fontFamily: A.sans, fontSize: '10px', fontWeight: 500,
                letterSpacing: '4px', textTransform: 'uppercase',
                color: A.gold, marginBottom: 20,
              }}>
                {t('audio_page.eyebrow')}
              </div>

              {loading ? (
                <p style={{ fontFamily: A.sans, fontSize: 14, color: A.muted }}>
                  {t('audio_page.loading')}
                </p>
              ) : episodes.length === 0 ? (
                /* ── Coming soon state ── */
                <>
                  <h1 style={{
                    fontFamily: A.serif, fontSize: 'clamp(36px,4vw,52px)',
                    fontWeight: 300, lineHeight: 1.2, color: A.cream, marginBottom: 20,
                  }}>
                    {t('audio_page.coming_title')}
                  </h1>
                  <div style={{ width: 40, height: 1, background: A.gold, opacity: 0.5, margin: '0 auto 24px' }} />
                  <p style={{
                    fontFamily: A.sans, fontSize: 15, fontWeight: 300,
                    color: A.muted, lineHeight: 1.8, marginBottom: 40,
                    maxWidth: 560, margin: '0 auto 40px',
                  }}>
                    {t('audio_page.coming_body')}
                  </p>
                  <Link
                    to="/#newsletter"
                    style={{
                      display: 'inline-block', fontFamily: A.sans,
                      fontSize: '11px', fontWeight: 500,
                      letterSpacing: '2.5px', textTransform: 'uppercase',
                      color: A.bg, background: A.gold,
                      padding: '14px 32px', textDecoration: 'none',
                    }}
                  >
                    {t('audio_page.coming_cta')}
                  </Link>
                </>
              ) : (
                /* ── Episodes header ── */
                <>
                  <h1 style={{
                    fontFamily: A.serif, fontSize: 'clamp(36px,4vw,52px)',
                    fontWeight: 300, lineHeight: 1.2, color: A.cream, marginBottom: 8,
                  }}>
                    {t('audio_page.episodes_title')}
                  </h1>
                  <p style={{
                    fontFamily: A.serif, fontStyle: 'italic',
                    fontSize: 'clamp(22px,2.5vw,32px)',
                    fontWeight: 300, color: A.gold,
                  }}>
                    {t('audio_page.episodes_subtitle')}
                  </p>
                  <div style={{ width: 40, height: 1, background: A.gold, opacity: 0.5, margin: '24px auto 0' }} />
                </>
              )}
            </div>

            {/* Signal filter bar — only when episodes are loaded */}
            {!loading && episodes.length > 0 && (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 8,
                justifyContent: 'center',
                marginBottom: 40,
              }}>
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
            )}

            {/* Episode grid */}
            {!loading && episodes.length > 0 && (
              <>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: 24,
                }}>
                  {visibleEpisodes.map(ep => (
                    <EpisodeCard
                      key={ep.id}
                      ep={ep}
                      isActive={nowPlaying?.id === ep.id}
                      isPlaying={nowPlaying?.id === ep.id && audioPlaying}
                      onPlay={handlePlay}
                      epLabel={epLabel}
                      lang={lang}
                    />
                  ))}
                </div>

                {/* Empty filtered state */}
                {visibleEpisodes.length === 0 && (
                  <div style={{ textAlign: 'center', paddingTop: 60 }}>
                    <p style={{
                      fontFamily: A.sans, fontSize: 14,
                      color: A.muted, letterSpacing: '0.5px',
                    }}>
                      {lang === 'fr'
                        ? 'Aucun épisode dans cette catégorie pour le moment.'
                        : 'No episodes in this category yet.'}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </Layout>

      {/* Hidden audio element */}
      {nowPlaying?.audio_url && (
        <audio
          ref={audioRef}
          src={nowPlaying.audio_url}
          autoPlay
          onPlay={() => {
            setAudioPlaying(true);
            if (nowPlaying) {
              trackAudioPlay({
                episode_id: nowPlaying.id,
                episode_title: nowPlaying.title,
                episode_number: nowPlaying.episode_number,
              });
            }
          }}
          onPause={() => {
            setAudioPlaying(false);
            // audioRef.current.ended is true when the episode finished naturally.
            // We only want to track intentional pauses, not natural episode ends.
            if (!audioRef.current?.ended && nowPlaying) {
              trackAudioPause({
                episode_id: nowPlaying.id,
                listen_duration_seconds: Math.round(audioTime),
              });
            }
          }}
          onEnded={() => { setAudioPlaying(false); setAudioTime(0); }}
          onTimeUpdate={() => setAudioTime(audioRef.current?.currentTime ?? 0)}
          onLoadedMetadata={() => setAudioDuration(audioRef.current?.duration ?? 0)}
        />
      )}

      {/* Fixed bottom mini-player */}
      {nowPlaying && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
          background: '#0a1628',
          borderTop: `1px solid ${A.border}`,
          padding: '10px 24px',
          display: 'flex', alignItems: 'center', gap: 16,
          boxShadow: '0 -4px 24px rgba(0,0,0,0.5)',
        }}>
          {/* Thumbnail (if any) */}
          {nowPlaying.featured_image_url && (
            <img
              src={nowPlaying.featured_image_url}
              alt=""
              style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }}
            />
          )}

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
              {epLabel} {String(nowPlaying.episode_number).padStart(3, '0')}
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
              type="range" min={0} max={audioDuration || 1} value={audioTime}
              onChange={e => {
                const val = Number(e.target.value);
                if (audioRef.current) audioRef.current.currentTime = val;
                setAudioTime(val);
              }}
              style={{ flex: 1, accentColor: A.gold, cursor: 'pointer' }}
            />
            <span style={{ fontFamily: A.sans, fontSize: 11, color: A.muted, flexShrink: 0 }}>
              {audioDuration
                ? `${Math.floor(audioDuration / 60)}:${String(Math.floor(audioDuration % 60)).padStart(2, '0')}`
                : '--:--'}
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

export default AudioPage;
