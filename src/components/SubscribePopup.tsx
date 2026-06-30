/**
 * SubscribePopup.tsx — Subscription acquisition popup for the homepage and blog posts.
 *
 * WHY: The inline newsletter section is passive — readers have to scroll to it.
 * This popup intercepts users at high-intent moments (time-on-site, exit intent)
 * to convert readers who would otherwise leave without subscribing.
 *
 * Connects to: popupService (config), /.netlify/functions/subscribe (API),
 * localStorage (dismiss/subscribed state), Index.tsx + BlogPost.tsx (mount points).
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { X, CheckCircle, Loader2, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  getPopupConfig,
  DEFAULT_CONFIG,
  type PopupConfig,
  type FeatureHighlightContent,
} from '@/integrations/firebase/popupService';
import { trackNewsletterSignup } from '@/utils/analytics';

// ── Brand tokens (mirror Afrinia CSS variables) ──────────────────────────────
const A = {
  bg:     '#0f172a',
  bg2:    '#131f35',
  gold:   '#B8912A',
  goldLt: '#d4a83a',
  cream:  '#F5F0E8',
  muted:  '#8a9bb5',
  border: 'rgba(184,145,42,0.18)',
  serif:  "'Cormorant Garamond', Georgia, serif",
  sans:   "'Jost', 'Helvetica Neue', sans-serif",
};

// ── LocalStorage keys ─────────────────────────────────────────────────────────
const LS_SUBSCRIBED  = 'afrinia_subscribed';
const LS_DISMISSED   = 'afrinia_popup_dismissed_at';

// ── Helper: should the popup be shown? ───────────────────────────────────────
function shouldShowPopup(dismissDays: number): boolean {
  if (localStorage.getItem(LS_SUBSCRIBED) === 'true') return false;
  const dismissedAt = localStorage.getItem(LS_DISMISSED);
  if (dismissedAt) {
    const elapsed = Date.now() - new Date(dismissedAt).getTime();
    if (elapsed < dismissDays * 24 * 60 * 60 * 1000) return false;
  }
  return true;
}

// ── Subscribe API call (mirrors Index.tsx pattern) ────────────────────────────
async function subscribeEmail(email: string, lang: string): Promise<void> {
  const res = await fetch('/.netlify/functions/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, lang, source: 'popup' }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({})) as { error?: string };
    if (data.error === 'already_subscribed') {
      throw Object.assign(new Error('already_subscribed'), { code: 'already_subscribed' });
    }
    throw new Error('subscribe_failed');
  }
}

// ── Template sub-components ───────────────────────────────────────────────────

interface TemplateProps {
  config: PopupConfig;
  lang: 'en' | 'fr';
  email: string;
  setEmail: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  status: 'idle' | 'loading' | 'success' | 'already' | 'error';
  onDismiss: () => void;
}

const CloseButton = ({ onDismiss }: { onDismiss: () => void }) => (
  <button
    onClick={onDismiss}
    aria-label="Close"
    style={{
      position: 'absolute',
      top: 16,
      right: 16,
      background: 'none',
      border: 'none',
      color: A.muted,
      cursor: 'pointer',
      padding: 4,
      lineHeight: 0,
      transition: 'color 0.2s',
    }}
    onMouseEnter={e => (e.currentTarget.style.color = A.cream)}
    onMouseLeave={e => (e.currentTarget.style.color = A.muted)}
  >
    <X size={18} />
  </button>
);

const EmailForm = ({
  lang, email, setEmail, onSubmit, status, ctaLabel,
}: {
  lang: 'en' | 'fr';
  email: string;
  setEmail: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  status: TemplateProps['status'];
  ctaLabel: string;
}) => {
  const placeholder = lang === 'fr' ? 'votre@email.com' : 'your@email.com';
  const isLoading = status === 'loading';

  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', gap: 8, marginTop: 8 }}>
      <input
        type="email"
        required
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder={placeholder}
        disabled={isLoading}
        style={{
          flex: 1,
          padding: '10px 14px',
          background: 'rgba(255,255,255,0.06)',
          border: `1px solid ${A.border}`,
          borderRadius: 2,
          color: A.cream,
          fontFamily: A.sans,
          fontSize: 13,
          outline: 'none',
          minWidth: 0,
        }}
      />
      <button
        type="submit"
        disabled={isLoading || !email}
        style={{
          padding: '10px 20px',
          background: A.gold,
          border: 'none',
          borderRadius: 2,
          color: A.bg,
          fontFamily: A.sans,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          cursor: isLoading ? 'default' : 'pointer',
          opacity: isLoading ? 0.7 : 1,
          whiteSpace: 'nowrap',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          transition: 'background 0.2s',
        }}
        onMouseEnter={e => { if (!isLoading) (e.currentTarget.style.background = A.goldLt); }}
        onMouseLeave={e => { (e.currentTarget.style.background = A.gold); }}
      >
        {isLoading && <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />}
        {ctaLabel}
      </button>
    </form>
  );
};

const SuccessMessage = ({ lang }: { lang: 'en' | 'fr' }) => (
  <div style={{ textAlign: 'center', padding: '16px 0' }}>
    <CheckCircle size={40} style={{ color: A.gold, margin: '0 auto 12px', display: 'block' }} />
    <p style={{ fontFamily: A.serif, fontSize: 20, color: A.cream, margin: '0 0 8px' }}>
      {lang === 'fr' ? 'Bienvenue !' : 'Welcome aboard!'}
    </p>
    <p style={{ fontFamily: A.sans, fontSize: 13, color: A.muted, margin: 0 }}>
      {lang === 'fr'
        ? 'Votre premier numéro arrive bientôt.'
        : 'Your first issue is on its way.'}
    </p>
  </div>
);

const AlreadyMessage = ({ lang }: { lang: 'en' | 'fr' }) => (
  <p style={{ fontFamily: A.sans, fontSize: 12, color: A.gold, margin: '8px 0 0' }}>
    {lang === 'fr' ? 'Vous êtes déjà abonné(e).' : "You're already subscribed."}
  </p>
);

const ErrorMessage = ({ lang }: { lang: 'en' | 'fr' }) => (
  <p style={{ fontFamily: A.sans, fontSize: 12, color: '#f87171', margin: '8px 0 0' }}>
    {lang === 'fr' ? 'Une erreur est survenue. Réessayez.' : 'Something went wrong. Please try again.'}
  </p>
);

// ── Template 1: MINIMAL ───────────────────────────────────────────────────────
const MinimalTemplate = ({ config, lang, email, setEmail, onSubmit, status, onDismiss }: TemplateProps) => {
  const t = config.templates.minimal;
  const headline    = lang === 'fr' ? t.headline_fr    : t.headline_en;
  const subheadline = lang === 'fr' ? t.subheadline_fr : t.subheadline_en;
  const cta         = lang === 'fr' ? t.cta_fr         : t.cta_en;

  return (
    <div style={{ position: 'relative', padding: '40px 36px 32px' }}>
      <CloseButton onDismiss={onDismiss} />

      {/* Gold eyebrow */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <span style={{ display: 'inline-block', width: 20, height: 1, background: A.gold }} />
        <span style={{
          fontFamily: A.sans, fontSize: 9, fontWeight: 600,
          letterSpacing: '3px', textTransform: 'uppercase', color: A.gold,
        }}>
          THE AFRINIA BRIEF
        </span>
      </div>

      {status === 'success' ? <SuccessMessage lang={lang} /> : (
        <>
          <h2 style={{
            fontFamily: A.serif, fontSize: 28, fontWeight: 300,
            color: A.cream, margin: '0 0 8px', lineHeight: 1.2,
          }}>
            {headline}
          </h2>
          <p style={{ fontFamily: A.sans, fontSize: 14, color: A.muted, margin: '0 0 24px', lineHeight: 1.7 }}>
            {subheadline}
          </p>

          <EmailForm
            lang={lang} email={email} setEmail={setEmail}
            onSubmit={onSubmit} status={status} ctaLabel={cta}
          />

          {status === 'already' && <AlreadyMessage lang={lang} />}
          {status === 'error'   && <ErrorMessage   lang={lang} />}

          <p style={{ fontFamily: A.sans, fontSize: 11, color: A.muted, margin: '16px 0 0', opacity: 0.6 }}>
            {lang === 'fr'
              ? 'Gratuit · Désinscription en un clic'
              : 'Free · Unsubscribe anytime'}
          </p>
        </>
      )}
    </div>
  );
};

// ── Template 2: FEATURE HIGHLIGHT ─────────────────────────────────────────────
const FeatureHighlightTemplate = ({ config, lang, email, setEmail, onSubmit, status, onDismiss }: TemplateProps) => {
  const t = config.templates.feature_highlight as FeatureHighlightContent;
  const headline    = lang === 'fr' ? t.headline_fr    : t.headline_en;
  const subheadline = lang === 'fr' ? t.subheadline_fr : t.subheadline_en;
  const cta         = lang === 'fr' ? t.cta_fr         : t.cta_en;
  const features    = lang === 'fr' ? (t.features_fr ?? []) : (t.features_en ?? []);

  return (
    <div style={{ position: 'relative', padding: '40px 36px 32px' }}>
      <CloseButton onDismiss={onDismiss} />

      {/* Gold top rule */}
      <div style={{ width: '100%', height: 1, background: `linear-gradient(90deg, ${A.gold}, transparent)`, marginBottom: 28 }} />

      {status === 'success' ? <SuccessMessage lang={lang} /> : (
        <>
          <h2 style={{
            fontFamily: A.serif, fontSize: 26, fontWeight: 300,
            color: A.cream, margin: '0 0 20px', lineHeight: 1.25,
          }}>
            {headline}
          </h2>

          {/* Feature bullets */}
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px' }}>
            {features.map((f, i) => (
              <li key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                fontFamily: A.sans, fontSize: 13, color: A.cream,
                marginBottom: 10,
              }}>
                <span style={{
                  width: 18, height: 18, borderRadius: '50%',
                  background: 'rgba(184,145,42,0.15)',
                  border: `1px solid ${A.gold}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Check size={10} style={{ color: A.gold }} />
                </span>
                {f}
              </li>
            ))}
          </ul>

          <p style={{ fontFamily: A.sans, fontSize: 13, color: A.muted, margin: '0 0 20px', lineHeight: 1.7 }}>
            {subheadline}
          </p>

          <EmailForm
            lang={lang} email={email} setEmail={setEmail}
            onSubmit={onSubmit} status={status} ctaLabel={cta}
          />

          {status === 'already' && <AlreadyMessage lang={lang} />}
          {status === 'error'   && <ErrorMessage   lang={lang} />}
        </>
      )}
    </div>
  );
};

// ── Template 3: EXCLUSIVE ACCESS ──────────────────────────────────────────────
const ExclusiveAccessTemplate = ({ config, lang, email, setEmail, onSubmit, status, onDismiss }: TemplateProps) => {
  const t = config.templates.exclusive_access;
  const headline    = lang === 'fr' ? t.headline_fr    : t.headline_en;
  const subheadline = lang === 'fr' ? t.subheadline_fr : t.subheadline_en;
  const cta         = lang === 'fr' ? t.cta_fr         : t.cta_en;

  const invitationLabel = lang === 'fr' ? 'SUR INVITATION' : 'BY INVITATION';

  return (
    <div style={{ position: 'relative', padding: '0 0 32px' }}>
      <CloseButton onDismiss={onDismiss} />

      {/* Dark banner header */}
      <div style={{
        padding: '28px 36px 20px',
        borderBottom: `1px solid ${A.border}`,
        background: 'rgba(0,0,0,0.25)',
      }}>
        <span style={{
          display: 'inline-block',
          padding: '4px 10px',
          border: `1px solid ${A.gold}`,
          fontFamily: A.sans, fontSize: 9, fontWeight: 600,
          letterSpacing: '3px', textTransform: 'uppercase', color: A.gold,
        }}>
          {invitationLabel}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14 }}>
          <span style={{ display: 'inline-block', width: 16, height: 1, background: A.gold }} />
          <span style={{
            fontFamily: A.sans, fontSize: 9, fontWeight: 600,
            letterSpacing: '3px', textTransform: 'uppercase', color: A.gold,
          }}>
            THE AFRINIA BRIEF
          </span>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '28px 36px 0' }}>
        {status === 'success' ? <SuccessMessage lang={lang} /> : (
          <>
            <h2 style={{
              fontFamily: A.serif, fontSize: 24, fontWeight: 300,
              color: A.cream, margin: '0 0 12px', lineHeight: 1.3,
            }}>
              {headline}
            </h2>
            <p style={{ fontFamily: A.sans, fontSize: 13, color: A.muted, margin: '0 0 24px', lineHeight: 1.7 }}>
              {subheadline}
            </p>

            {/* Stacked layout for exclusive feel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={lang === 'fr' ? 'votre@email.com' : 'your@email.com'}
                disabled={status === 'loading'}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: 'rgba(255,255,255,0.06)',
                  border: `1px solid ${A.border}`,
                  borderRadius: 2,
                  color: A.cream,
                  fontFamily: A.sans,
                  fontSize: 13,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="button"
                disabled={status === 'loading' || !email}
                onClick={e => onSubmit(e as unknown as React.FormEvent)}
                style={{
                  width: '100%',
                  padding: '13px',
                  background: 'transparent',
                  border: `1px solid ${A.gold}`,
                  color: A.gold,
                  fontFamily: A.sans,
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  cursor: status === 'loading' ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'background 0.2s, color 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = A.gold;
                  e.currentTarget.style.color = A.bg;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = A.gold;
                }}
              >
                {status === 'loading' && <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />}
                {cta}
              </button>
            </div>

            {status === 'already' && <AlreadyMessage lang={lang} />}
            {status === 'error'   && <ErrorMessage   lang={lang} />}
          </>
        )}
      </div>
    </div>
  );
};

// ── Main popup component ──────────────────────────────────────────────────────

interface Props {
  /** Override page source tag sent to analytics (default: 'popup') */
  source?: string;
}

export const SubscribePopup = ({ source = 'popup' }: Props) => {
  const { i18n } = useTranslation();
  const lang: 'en' | 'fr' = i18n.language === 'fr' ? 'fr' : 'en';

  const [config, setConfig] = useState<PopupConfig | null>(null);
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'already' | 'error'>('idle');

  // Guard: prevents triggers from firing multiple times once visible
  const firedRef = useRef(false);

  const show = useCallback(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    setVisible(true);
  }, []);

  // ── Load config + set up triggers ─────────────────────────────────────────
  useEffect(() => {
    void getPopupConfig().then(cfg => setConfig(cfg));
  }, []);

  useEffect(() => {
    if (!config || !config.enabled) return;
    if (!shouldShowPopup(config.dismiss_days)) return;

    // Timer trigger
    const timer = setTimeout(show, config.timer_seconds * 1000);

    // Exit intent trigger (desktop: mouse leaves viewport through the top)
    const onMouseLeave = (e: MouseEvent) => {
      if (e.clientY < 10) show();
    };
    document.addEventListener('mouseleave', onMouseLeave);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [config, show]);

  // ── Auto-close after success ──────────────────────────────────────────────
  useEffect(() => {
    if (status !== 'success') return;
    const t = setTimeout(() => setVisible(false), 3500);
    return () => clearTimeout(t);
  }, [status]);

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem(LS_DISMISSED, new Date().toISOString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || status === 'loading') return;
    setStatus('loading');
    try {
      await subscribeEmail(email.trim(), lang);
      localStorage.setItem(LS_SUBSCRIBED, 'true');
      trackNewsletterSignup({ source_page: source, lang });
      setStatus('success');
    } catch (err) {
      const code = (err as { code?: string }).code;
      setStatus(code === 'already_subscribed' ? 'already' : 'error');
    }
  };

  if (!config || !visible) return null;

  const templateProps: TemplateProps = {
    config, lang, email, setEmail,
    onSubmit: (e) => void handleSubmit(e),
    status, onDismiss: handleDismiss,
  };

  const templateMap = {
    minimal:           <MinimalTemplate         {...templateProps} />,
    feature_highlight: <FeatureHighlightTemplate {...templateProps} />,
    exclusive_access:  <ExclusiveAccessTemplate  {...templateProps} />,
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleDismiss}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 9998,
          animation: 'fadeIn 0.25s ease',
        }}
      />

      {/* Popup card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={lang === 'fr' ? "S'abonner à la newsletter" : 'Subscribe to newsletter'}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: 480,
          background: A.bg2,
          border: `1px solid ${A.border}`,
          zIndex: 9999,
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
          animation: 'popupIn 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        {templateMap[config.active_template]}
      </div>

      {/* Keyframe animations — injected once via a style tag */}
      <style>{`
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes popupIn { from { opacity: 0; transform: translate(-50%, -48%) scale(0.95) } to { opacity: 1; transform: translate(-50%, -50%) scale(1) } }
        @keyframes spin    { to { transform: rotate(360deg) } }
      `}</style>
    </>
  );
};
