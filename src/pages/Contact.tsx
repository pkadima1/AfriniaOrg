import Layout from '../components/Layout';
import ContactForm from '../components/ContactForm';
import { useTranslation } from 'react-i18next';
import { useSocialLinks } from '@/hooks/useSocialLinks';

const BG   = '#0a1628';
const GOLD = '#B8912A';
const GOLD_BORDER = 'rgba(184,145,42,0.25)';
const WHITE = '#ffffff';
const BODY  = '#c8d8e8';
const MUTED = '#8fa8c8';
const SERIF = "'Cormorant Garamond', serif";
const SANS  = "'Jost', sans-serif";

const reasons = ['r1', 'r2', 'r3'] as const;

const Contact = () => {
  const { t } = useTranslation();
  const { links: socialLinks } = useSocialLinks();
  return (
    <Layout>
      <div style={{ background: BG, minHeight: '100vh', fontFamily: SANS }}>

        {/* HERO */}
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '96px 48px 72px', textAlign: 'center' }}>
          <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase', color: GOLD, marginBottom: 24 }}>
            {t('contact.hero.eyebrow')}
          </p>
          <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: 300, lineHeight: 1.1, color: WHITE, marginBottom: 20, letterSpacing: '-0.02em' }}>
            {t('contact.hero.title')}
          </h1>
          <p style={{ fontSize: 17, fontWeight: 300, lineHeight: 1.8, color: BODY, maxWidth: 560, margin: '0 auto' }}>
            {t('contact.hero.subtitle')}
          </p>
        </div>

        {/* REASONS ROW */}
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 48px 80px' }}>
          <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase', color: GOLD, marginBottom: 40 }}>
            {t('contact.reasons.label')}
          </p>
          <div id="reasons-grid">
            {reasons.map(key => (
              <div key={key} style={{ borderTop: `1px solid ${GOLD_BORDER}`, paddingTop: 24 }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: GOLD, marginTop: 9, flexShrink: 0 }} />
                  <div>
                    <p style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 400, color: WHITE, marginBottom: 8 }}>
                      {t(`contact.reasons.${key}.title`)}
                    </p>
                    <p style={{ fontSize: 15, fontWeight: 300, lineHeight: 1.75, color: BODY }}>
                      {t(`contact.reasons.${key}.desc`)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DIVIDER */}
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 48px' }}>
          <div style={{ borderBottom: `1px solid ${GOLD_BORDER}` }} />
        </div>

        {/* FORM + DIRECT */}
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 48px 100px' }}>
          <div id="contact-grid">
            {/* Left: form */}
            <div>
              <p style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 300, color: WHITE, marginBottom: 40 }}>
                {t('contact.form.title')}
              </p>
              <ContactForm />
            </div>

            {/* Right: direct info */}
            <div style={{ borderLeft: `1px solid ${GOLD_BORDER}`, paddingLeft: 56 }} className="contact-right">
              <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase', color: GOLD, marginBottom: 32 }}>
                {t('contact.direct.label')}
              </p>

              <div style={{ marginBottom: 40 }}>
                <p style={{ fontSize: 12, fontWeight: 300, color: MUTED, letterSpacing: '0.1em', marginBottom: 8 }}>
                  {t('contact.direct.emailLabel')}
                </p>
                <a href="mailto:afrinia@afrinia.org"
                  style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 300, color: WHITE, textDecoration: 'none', borderBottom: `1px solid ${GOLD}`, paddingBottom: 2 }}>
                  afrinia@afrinia.org
                </a>
                <p style={{ fontSize: 13, fontWeight: 300, color: MUTED, marginTop: 10 }}>
                  {t('contact.direct.response')}
                </p>
              </div>

              <div style={{ borderTop: `1px solid ${GOLD_BORDER}`, paddingTop: 32 }}>
                <p style={{ fontSize: 12, fontWeight: 300, color: MUTED, letterSpacing: '0.1em', marginBottom: 16 }}>
                  {t('contact.direct.social')}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {socialLinks.map(s => (
                    <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 14, fontWeight: 300, color: BODY, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 4, height: 4, borderRadius: '50%', background: GOLD, display: 'inline-block' }} />
                      {s.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER LINE */}
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 48px 64px', textAlign: 'center' }}>
          <p style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 300, fontStyle: 'italic', color: MUTED }}>
            Read the Afrinia Brief every Thursday.
          </p>
        </div>

      </div>

      <style>{`
        #reasons-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 40px; }
        #contact-grid { display: grid; grid-template-columns: 1fr 340px; gap: 64px; align-items: start; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        @media (max-width: 860px) {
          #reasons-grid { grid-template-columns: 1fr; }
          #contact-grid { grid-template-columns: 1fr; }
          .contact-right { border-left: none !important; padding-left: 0 !important; border-top: 1px solid rgba(184,145,42,0.25); padding-top: 40px; }
          .form-row { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </Layout>
  );
};

export default Contact;
