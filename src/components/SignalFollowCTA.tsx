/**
 * SignalFollowCTA — "Follow this signal" subscription block.
 *
 * Appears at the end of every article, after the body and before SocialShare.
 * Captures readers at highest-intent moment (just finished the article) and
 * stores them as declared followers of the specific signal type they read.
 *
 * Calls /.netlify/functions/subscribe with signals: [signal] so the subscriber
 * is targetable for per-signal newsletter sends.
 */

import { useState } from 'react';
import { PostCategory } from '@/integrations/firebase/types';
import { getCategoryLabel } from '@/constants/taxonomy';

// ── Afrinia brand tokens (mirrors BlogPost.tsx — keep in sync) ────────────────
const A = {
  bg2:    '#131f35',
  gold:   '#B8912A',
  goldLt: '#d4a83a',
  cream:  '#F5F0E8',
  muted:  '#8a9bb5',
  border: 'rgba(184,145,42,0.18)',
  serif:  "'Cormorant Garamond', Georgia, serif",
  sans:   "'Jost', 'Helvetica Neue', sans-serif",
};

type Lang = 'en' | 'fr';
type SubmitState = 'idle' | 'submitting' | 'success' | 'already' | 'error';

interface Props {
  signal: PostCategory;
  lang: Lang;
}

export default function SignalFollowCTA({ signal, lang }: Props) {
  const [email, setEmail]     = useState('');
  const [state, setState]     = useState<SubmitState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const label = getCategoryLabel(signal, lang);

  const eyebrow = lang === 'fr'
    ? `SIGNAL ${label}`
    : `${label} SIGNAL`;

  const heading = lang === 'fr'
    ? `Suivre les signaux ${label}`
    : `Follow ${label} signals`;

  const sub = lang === 'fr'
    ? `Recevez chaque article ${label} directement dans votre boîte mail.`
    : `Get every ${label} article we publish, direct to your inbox.`;

  const placeholder = lang === 'fr' ? 'Votre adresse e-mail' : 'Your email address';
  const cta         = lang === 'fr' ? 'SUIVRE' : 'FOLLOW';

  const successMsg = lang === 'fr'
    ? `Vous suivez les signaux ${label}.`
    : `You're following ${label} signals.`;

  const alreadyMsg = lang === 'fr'
    ? 'Cette adresse est déjà abonnée.'
    : 'This email is already subscribed.';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setState('submitting');
    setErrorMsg('');

    try {
      const res = await fetch('/.netlify/functions/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          lang,
          source: `article-signal-cta-${signal}`,
          signals: [signal],
        }),
      });

      if (res.ok) {
        setState('success');
        setEmail('');
        return;
      }

      const data = await res.json().catch(() => ({}));
      if (res.status === 409 || data?.error === 'already_subscribed') {
        setState('already');
      } else {
        setState('error');
        setErrorMsg(lang === 'fr' ? 'Une erreur est survenue. Réessayez.' : 'Something went wrong. Please try again.');
      }
    } catch {
      setState('error');
      setErrorMsg(lang === 'fr' ? 'Une erreur est survenue. Réessayez.' : 'Something went wrong. Please try again.');
    }
  };

  return (
    <div style={{
      background: A.bg2,
      border: `1px solid ${A.border}`,
      borderRadius: 8,
      padding: 'clamp(28px, 4vw, 44px)',
      marginTop: 48,
    }}>
      {/* Gold separator */}
      <div style={{ width: 36, height: 2, background: A.gold, marginBottom: 20 }} />

      {/* Eyebrow */}
      <p style={{
        fontFamily: A.sans,
        fontSize: '10px',
        fontWeight: 600,
        letterSpacing: '3px',
        textTransform: 'uppercase',
        color: A.gold,
        margin: '0 0 14px',
      }}>
        {eyebrow}
      </p>

      {/* Heading */}
      <h3 style={{
        fontFamily: A.serif,
        fontSize: 'clamp(22px, 3vw, 30px)',
        fontWeight: 300,
        color: A.cream,
        lineHeight: 1.25,
        margin: '0 0 12px',
      }}>
        {heading}
      </h3>

      {/* Subtext */}
      <p style={{
        fontFamily: A.sans,
        fontSize: '14px',
        fontWeight: 300,
        color: A.muted,
        lineHeight: 1.7,
        margin: '0 0 28px',
      }}>
        {sub}
      </p>

      {/* Success state */}
      {state === 'success' && (
        <p style={{
          fontFamily: A.sans,
          fontSize: '14px',
          color: A.gold,
          margin: 0,
          letterSpacing: '0.5px',
        }}>
          ✓ {successMsg}
        </p>
      )}

      {/* Already subscribed state */}
      {state === 'already' && (
        <p style={{
          fontFamily: A.sans,
          fontSize: '14px',
          color: A.muted,
          margin: 0,
        }}>
          {alreadyMsg}
        </p>
      )}

      {/* Form — hidden after success or already */}
      {state !== 'success' && state !== 'already' && (
        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}
        >
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder={placeholder}
            disabled={state === 'submitting'}
            style={{
              flex: '1 1 220px',
              minWidth: 0,
              background: 'transparent',
              border: `1px solid ${A.border}`,
              borderRadius: 4,
              padding: '12px 16px',
              fontFamily: A.sans,
              fontSize: '14px',
              color: A.cream,
              outline: 'none',
              opacity: state === 'submitting' ? 0.6 : 1,
            }}
          />
          <button
            type="submit"
            disabled={state === 'submitting'}
            style={{
              flexShrink: 0,
              background: 'transparent',
              border: `1px solid ${A.gold}`,
              borderRadius: 4,
              padding: '12px 28px',
              fontFamily: A.sans,
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '2.5px',
              textTransform: 'uppercase',
              color: A.gold,
              cursor: state === 'submitting' ? 'wait' : 'pointer',
              opacity: state === 'submitting' ? 0.6 : 1,
              transition: 'color 0.2s, border-color 0.2s',
            }}
            onMouseEnter={e => {
              if (state !== 'submitting') {
                (e.currentTarget as HTMLButtonElement).style.color = A.goldLt;
                (e.currentTarget as HTMLButtonElement).style.borderColor = A.goldLt;
              }
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.color = A.gold;
              (e.currentTarget as HTMLButtonElement).style.borderColor = A.gold;
            }}
          >
            {state === 'submitting' ? '…' : cta}
          </button>
        </form>
      )}

      {/* Error message */}
      {state === 'error' && errorMsg && (
        <p style={{
          fontFamily: A.sans,
          fontSize: '13px',
          color: '#e07070',
          margin: '10px 0 0',
        }}>
          {errorMsg}
        </p>
      )}
    </div>
  );
}
