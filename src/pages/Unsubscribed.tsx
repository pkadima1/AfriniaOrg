/**
 * Unsubscribed.tsx — Confirmation page after clicking an unsubscribe link.
 *
 * Reached via redirect from /.netlify/functions/unsubscribe after processing the token.
 * Query params: ?status=success|not_found|error&lang=en|fr
 *
 * Three states (all bilingual):
 *   success   — subscriber was found and marked unsubscribed
 *   not_found — token was invalid or already used
 *   error     — server error during unsubscribe
 */

import { useSearchParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';

const A = {
  bg:    '#0f172a',
  gold:  '#B8912A',
  cream: '#F5F0E8',
  muted: '#8a9bb5',
  serif: "'Cormorant Garamond', Georgia, serif",
  sans:  "'Jost', 'Helvetica Neue', sans-serif",
};

const COPY = {
  success: {
    en: {
      headline: 'You\'ve been unsubscribed.',
      body: 'You will no longer receive The Afrinia Brief. We\'re sorry to see you go — the door is always open if you change your mind.',
      cta: 'Back to Afrinia',
      resubscribe: 'Subscribe again',
    },
    fr: {
      headline: 'Vous avez été désinscrit(e).',
      body: 'Vous ne recevrez plus Le Bref Afrinia. Nous sommes désolés de vous voir partir — la porte reste ouverte si vous changez d\'avis.',
      cta: 'Retour à Afrinia',
      resubscribe: 'Se réabonner',
    },
  },
  not_found: {
    en: {
      headline: 'Link already used.',
      body: 'This unsubscribe link has already been used or is no longer valid. If you\'re still receiving emails, contact us.',
      cta: 'Back to Afrinia',
      resubscribe: null,
    },
    fr: {
      headline: 'Lien déjà utilisé.',
      body: 'Ce lien de désinscription a déjà été utilisé ou n\'est plus valide. Si vous recevez toujours nos e-mails, contactez-nous.',
      cta: 'Retour à Afrinia',
      resubscribe: null,
    },
  },
  error: {
    en: {
      headline: 'Something went wrong.',
      body: 'We couldn\'t process your unsubscribe request. Please try again or contact us directly.',
      cta: 'Back to Afrinia',
      resubscribe: null,
    },
    fr: {
      headline: 'Une erreur est survenue.',
      body: 'Nous n\'avons pas pu traiter votre demande de désinscription. Veuillez réessayer ou nous contacter directement.',
      cta: 'Retour à Afrinia',
      resubscribe: null,
    },
  },
};

const Unsubscribed = () => {
  const [params] = useSearchParams();
  const rawStatus = params.get('status') ?? 'success';
  const lang: 'en' | 'fr' = params.get('lang') === 'fr' ? 'fr' : 'en';

  const status = (rawStatus in COPY ? rawStatus : 'success') as keyof typeof COPY;
  const c = COPY[status][lang];
  const blogUrl = `/${lang}/blog`;

  return (
    <Layout>
      <section
        style={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: A.bg,
          paddingTop: 120,
          paddingBottom: 80,
        }}
      >
        <div
          style={{
            maxWidth: 520,
            margin: '0 auto',
            padding: '0 24px',
            textAlign: 'center',
          }}
        >
          {/* Eyebrow */}
          <div style={{
            fontFamily: A.sans,
            fontSize: '10px', fontWeight: 500,
            letterSpacing: '4px', textTransform: 'uppercase',
            color: A.gold, marginBottom: 24,
          }}>
            {lang === 'fr' ? 'Le Bref Afrinia' : 'The Afrinia Brief'}
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: A.serif,
            fontSize: 'clamp(32px, 4vw, 48px)',
            fontWeight: 300, lineHeight: 1.2,
            color: A.cream, marginBottom: 24,
          }}>
            {c.headline}
          </h1>

          {/* Gold divider */}
          <div style={{
            width: 40, height: 1,
            background: A.gold, opacity: 0.5,
            margin: '0 auto 24px',
          }} />

          {/* Body */}
          <p style={{
            fontFamily: A.sans,
            fontSize: 15, fontWeight: 300,
            color: A.muted, lineHeight: 1.8,
            marginBottom: 40,
          }}>
            {c.body}
          </p>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/"
              style={{
                display: 'inline-block',
                fontFamily: A.sans,
                fontSize: '11px', fontWeight: 500,
                letterSpacing: '2.5px', textTransform: 'uppercase',
                color: '#0a1628', background: A.gold,
                padding: '14px 32px', textDecoration: 'none',
              }}
            >
              {c.cta}
            </Link>

            {c.resubscribe && (
              <Link
                to={blogUrl}
                style={{
                  display: 'inline-block',
                  fontFamily: A.sans,
                  fontSize: '11px', fontWeight: 500,
                  letterSpacing: '2.5px', textTransform: 'uppercase',
                  color: A.gold,
                  border: `1px solid ${A.gold}`,
                  padding: '14px 32px', textDecoration: 'none',
                }}
              >
                {c.resubscribe}
              </Link>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Unsubscribed;
