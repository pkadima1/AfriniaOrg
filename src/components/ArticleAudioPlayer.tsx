/**
 * ArticleAudioPlayer — inline "listen to this article" player on BlogPost pages.
 *
 * Renders when a published AudioEpisode links to the article via post_slug
 * (linked in the admin audio upload form). Sits between the metadata strip
 * and the excerpt. Hides itself entirely if the audio file fails to load —
 * a broken player must never degrade the reading experience.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Headphones, Play, Pause } from 'lucide-react';
import type { AudioEpisode } from '@/integrations/firebase/types';
import { useAudioPlayer, formatPlayerTime } from '@/hooks/useAudioPlayer';
import { trackAudioPlay, trackAudioPause } from '@/utils/analytics';

// ── Afrinia brand tokens (mirrors BlogPost.tsx — keep in sync) ────────────────
const A = {
  bg2:    '#131f35',
  gold:   '#B8912A',
  cream:  '#F5F0E8',
  muted:  '#8a9bb5',
  border: 'rgba(184,145,42,0.18)',
  sans:   "'Jost', 'Helvetica Neue', sans-serif",
};

interface Props {
  episode: AudioEpisode;
}

export default function ArticleAudioPlayer({ episode }: Props) {
  const { t } = useTranslation();
  const [failed, setFailed] = useState(false);

  const player = useAudioPlayer({
    onPlay: () =>
      trackAudioPlay({
        episode_id: episode.id,
        episode_title: episode.title,
        episode_number: episode.episode_number,
      }),
    onPause: listenedSeconds =>
      trackAudioPause({
        episode_id: episode.id,
        listen_duration_seconds: listenedSeconds,
      }),
  });

  if (!episode.audio_url || failed) return null;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 16,
      padding: '14px 20px',
      background: A.bg2,
      border: `1px solid ${A.border}`,
      borderLeft: `2px solid ${A.gold}`,
      borderRadius: 4,
      marginBottom: 28,
    }}>
      {/* No autoPlay — playback is always reader-initiated */}
      <audio src={episode.audio_url} preload="metadata" {...player.audioProps} onError={() => setFailed(true)} />

      {/* Play / pause */}
      <button
        onClick={player.toggle}
        aria-label={player.playing ? t('article_audio.pause') : t('article_audio.listen')}
        style={{
          width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
          border: `1px solid ${A.gold}`,
          background: player.playing ? A.gold : 'rgba(184,145,42,0.12)',
          color: player.playing ? '#0f172a' : A.gold,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'background 0.2s, color 0.2s',
        }}
      >
        {player.playing
          ? <Pause size={17} fill="currentColor" />
          : <Play size={17} fill="currentColor" style={{ marginLeft: 2 }} />}
      </button>

      <div style={{ minWidth: 0, flex: 1 }}>
        {/* Label row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6,
          fontFamily: A.sans, fontSize: '10px', fontWeight: 500,
          letterSpacing: '2px', textTransform: 'uppercase', color: A.gold,
        }}>
          <Headphones size={12} style={{ flexShrink: 0 }} />
          {t('article_audio.listen')}
          <span style={{ color: A.muted, letterSpacing: '1px', textTransform: 'none', fontWeight: 300 }}>
            {/* Show the episode's display duration until metadata loads */}
            {player.duration ? formatPlayerTime(player.duration) : episode.duration}
          </span>
        </div>

        {/* Progress row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: A.sans, fontSize: 11, color: A.muted, flexShrink: 0, minWidth: 34 }}>
            {formatPlayerTime(player.time)}
          </span>
          <input
            type="range"
            min={0}
            max={player.duration || 1}
            value={player.time}
            onChange={e => player.seek(Number(e.target.value))}
            aria-label={t('article_audio.seek')}
            style={{ flex: 1, accentColor: A.gold, cursor: 'pointer', minWidth: 0 }}
          />
        </div>
      </div>
    </div>
  );
}
