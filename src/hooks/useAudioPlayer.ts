/**
 * useAudioPlayer — single source of truth for HTML5 audio player mechanics.
 *
 * WHY: the play/pause/seek/progress logic was duplicated in Index.tsx and
 * AudioPage.tsx (and the copies had already drifted — the homepage lost its
 * analytics events). Every audio player on the site consumes this hook and
 * keeps only its own chrome (bottom bar, inline card, …).
 *
 * The consumer renders its own <audio> element and spreads `audioProps` on it:
 *
 *   const player = useAudioPlayer({ onPlay, onPause });
 *   <audio src={url} {...player.audioProps} />
 */

import { useCallback, useRef, useState } from 'react';

interface UseAudioPlayerOptions {
  /** Fired when playback starts (both first play and resume). */
  onPlay?: () => void;
  /**
   * Fired on an intentional pause — NOT when the track ends naturally.
   * Receives the listened position in whole seconds (for GA listen-duration).
   */
  onPause?: (listenedSeconds: number) => void;
}

export function useAudioPlayer(options?: UseAudioPlayerOptions) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);

  /** Toggle play/pause on the current source. */
  const toggle = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) void el.play();
    else el.pause();
  }, []);

  /** Pause and fully reset — used when closing a player. */
  const stop = useCallback(() => {
    audioRef.current?.pause();
    setPlaying(false);
    setTime(0);
    setDuration(0);
  }, []);

  /** Jump to a position (seconds) — used by the progress bar. */
  const seek = useCallback((seconds: number) => {
    if (audioRef.current) audioRef.current.currentTime = seconds;
    setTime(seconds);
  }, []);

  /** Reset progress state — used when switching to a different track. */
  const reset = useCallback(() => {
    setPlaying(false);
    setTime(0);
    setDuration(0);
  }, []);

  // Spread onto the consumer's <audio> element. Recreated every render on
  // purpose so the onPlay/onPause callbacks never capture stale track state.
  const audioProps = {
    ref: audioRef,
    onPlay: () => {
      setPlaying(true);
      options?.onPlay?.();
    },
    onPause: () => {
      setPlaying(false);
      // `ended` is true when the track finished naturally — only report
      // intentional pauses to the onPause callback.
      if (!audioRef.current?.ended) {
        options?.onPause?.(Math.round(audioRef.current?.currentTime ?? 0));
      }
    },
    onEnded: () => {
      setPlaying(false);
      setTime(0);
    },
    onTimeUpdate: () => setTime(audioRef.current?.currentTime ?? 0),
    onLoadedMetadata: () => setDuration(audioRef.current?.duration ?? 0),
  };

  return { audioRef, playing, time, duration, toggle, stop, seek, reset, audioProps };
}

/**
 * Format seconds as "m:ss" for player time labels; "--:--" when unknown.
 * 0 is a valid elapsed time ("0:00") — callers showing a duration should
 * guard themselves (`duration ? formatPlayerTime(duration) : '--:--'`)
 * since 0 there means "metadata not loaded yet".
 */
export function formatPlayerTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '--:--';
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
}
