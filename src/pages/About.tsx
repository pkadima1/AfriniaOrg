import Layout from '../components/Layout';
import { useTranslation } from 'react-i18next';

const PATRICK_PHOTO =
  'https://firebasestorage.googleapis.com/v0/b/modified-hull-203004.firebasestorage.app/o/Afrinia%2FAfriniaMedia%2FMe%20LinkedIn.png?alt=media&token=b7119c05-1405-40e9-a3a4-b489d1a2fa52';

/* ─── Design tokens ─────────────────────────────── */
const BG          = '#0a1628';          // deep dark premium navy
const GOLD        = '#B8912A';          // brand gold
const GOLD_LIGHT  = '#d4a83a';          // lighter gold for numbers (solid, no opacity)
const GOLD_BORDER = 'rgba(184,145,42,0.3)';
const WHITE       = '#ffffff';          // headings & h-level text
const BODY        = '#dde8f4';          // body paragraphs — white-toned, high contrast
const LEAD        = '#f0e8d0';          // italic pull-quotes
const MUTED       = '#8fa8c8';          // captions / attribution
const SERIF       = "'Cormorant Garamond', serif";
const SANS        = "'Jost', sans-serif";

const About = () => {
  const { t } = useTranslation();

  const beliefs = [
    { num: '01', key: 'b1' },
    { num: '02', key: 'b2' },
    { num: '03', key: 'b3' },
    { num: '04', key: 'b4' },
  ] as const;

  const aspirations = ['a1', 'a2', 'a3'] as const;

  return (
    <Layout>
      {/* ── full-page background ── */}
      <div style={{ background: BG, minHeight: '100vh', fontFamily: SANS }}>

        {/* ════════════════════════════════════════
            HERO
        ════════════════════════════════════════ */}
        <div
          className="about-hero"
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '80px 48px 96px',
            display: 'grid',
            gridTemplateColumns: '1fr 380px',
            gap: 80,
            alignItems: 'center',
          }}
        >
          {/* ── left: text ── */}
          <div>
            {/* eyebrow */}
            <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase', color: GOLD, marginBottom: 24 }}>
              {t('about.eyebrow')}
            </p>

            {/* name */}
            <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(50px, 5.5vw, 74px)', fontWeight: 300, lineHeight: 1.05, color: WHITE, marginBottom: 14, letterSpacing: '-0.02em' }}>
              Patrick K.
              <br />
              Tshimanga
            </h1>

            {/* role */}
            <p style={{ fontFamily: SERIF, fontSize: 'clamp(17px, 1.8vw, 21px)', fontStyle: 'italic', color: GOLD, marginBottom: 40 }}>
              {t('about.hero.title')}
            </p>

            {/* pull-quote */}
            <p style={{ fontFamily: SERIF, fontSize: 'clamp(21px, 2.2vw, 28px)', fontWeight: 300, fontStyle: 'italic', lineHeight: 1.6, color: LEAD, marginBottom: 36, borderLeft: `3px solid ${GOLD}`, paddingLeft: 24 }}>
              {t('about.hero.lead')}
            </p>

            {/* body */}
            <p style={{ fontSize: 17, fontWeight: 300, lineHeight: 1.9, color: BODY, maxWidth: 560 }}>
              {t('about.hero.body')}
            </p>
          </div>

          {/* ── right: photo ── */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* gold offset border frame */}
            <div style={{ position: 'relative', width: '100%' }}>
              {/* offset gold border — sits behind and shifted */}
              <div style={{
                position: 'absolute',
                top: -10,
                left: 10,
                right: -10,
                bottom: 10,
                border: `1px solid ${GOLD}`,
                borderRadius: 2,
                zIndex: 0,
              }} />
              <img
                src={PATRICK_PHOTO}
                alt="Patrick K. Tshimanga"
                style={{
                  position: 'relative',
                  zIndex: 1,
                  width: '100%',
                  height: 480,
                  objectFit: 'cover',
                  objectPosition: 'top center',
                  borderRadius: 2,
                  display: 'block',
                  background: BG,   /* matches page bg */
                }}
              />
            </div>
            <p style={{ marginTop: 24, fontFamily: SANS, fontSize: 11, fontWeight: 300, letterSpacing: '0.12em', color: MUTED, textAlign: 'center' }}>
              {t('about.photoCaption')}
            </p>
          </div>
        </div>

        {/* divider */}
        <hr style={{ maxWidth: 1200, margin: '0 auto', border: 'none', borderTop: `1px solid ${GOLD_BORDER}` }} />

        {/* ════════════════════════════════════════
            WHAT I BELIEVE
        ════════════════════════════════════════ */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '88px 48px' }}>

          {/* section label */}
          <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase', color: GOLD, marginBottom: 56 }}>
            {t('about.beliefs.label')}
          </p>

          {/* strict 2-col grid — controlled via <style> below */}
          <div id="beliefs-grid">
            {beliefs.map(({ num, key }) => (
              <div key={key} style={{ borderTop: `1px solid ${GOLD_BORDER}`, paddingTop: 32 }}>

                {/* solid gold number — no opacity */}
                <p style={{ fontFamily: SERIF, fontSize: 60, fontWeight: 300, color: GOLD_LIGHT, lineHeight: 1, marginBottom: 18 }}>
                  {num}
                </p>

                <h3 style={{ fontFamily: SERIF, fontSize: 25, fontWeight: 400, color: WHITE, marginBottom: 14, lineHeight: 1.35 }}>
                  {t(`about.beliefs.${key}.headline`)}
                </h3>

                <p style={{ fontSize: 16, fontWeight: 300, lineHeight: 1.85, color: BODY }}>
                  {t(`about.beliefs.${key}.body`)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* divider */}
        <hr style={{ maxWidth: 1200, margin: '0 auto', border: 'none', borderTop: `1px solid ${GOLD_BORDER}` }} />

        {/* ════════════════════════════════════════
            MISSION QUOTE
        ════════════════════════════════════════ */}
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '96px 48px', textAlign: 'center' }}>
          <p style={{ fontFamily: SERIF, fontSize: 'clamp(28px, 3.2vw, 44px)', fontWeight: 300, fontStyle: 'italic', lineHeight: 1.5, color: WHITE, marginBottom: 28, letterSpacing: '-0.01em' }}>
            {t('about.mission.quote')}
          </p>
          <p style={{ fontFamily: SANS, fontSize: 12, fontWeight: 400, letterSpacing: '0.18em', textTransform: 'uppercase', color: GOLD }}>
            {t('about.mission.attr')}
          </p>
        </div>

        {/* divider */}
        <hr style={{ maxWidth: 1200, margin: '0 auto', border: 'none', borderTop: `1px solid ${GOLD_BORDER}` }} />

        {/* ════════════════════════════════════════
            WHERE I AM GOING
        ════════════════════════════════════════ */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '88px 48px' }}>

          <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase', color: GOLD, marginBottom: 56 }}>
            {t('about.aspirations.label')}
          </p>

          <div id="asp-layout">
            {/* left col */}
            <div>
              <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(34px, 3.5vw, 50px)', fontWeight: 300, lineHeight: 1.18, color: WHITE, marginBottom: 28 }}>
                {t('about.aspirations.heading')}
              </h2>
              <p style={{ fontSize: 16, fontWeight: 300, lineHeight: 1.9, color: BODY }}>
                {t('about.aspirations.body')}
              </p>
            </div>

            {/* right col */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {aspirations.map((key, i) => (
                <div
                  key={key}
                  style={{
                    display: 'flex',
                    gap: 28,
                    padding: i === 0 ? '0 0 40px' : '40px 0',
                    borderBottom: i < aspirations.length - 1 ? `1px solid ${GOLD_BORDER}` : 'none',
                    alignItems: 'flex-start',
                  }}
                >
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: GOLD, marginTop: 11, flexShrink: 0 }} />
                  <div>
                    <p style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 400, color: WHITE, marginBottom: 10, lineHeight: 1.3 }}>
                      {t(`about.aspirations.${key}.title`)}
                    </p>
                    <p style={{ fontSize: 16, fontWeight: 300, lineHeight: 1.85, color: BODY }}>
                      {t(`about.aspirations.${key}.desc`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* divider */}
        <hr style={{ maxWidth: 1200, margin: '0 auto', border: 'none', borderTop: `1px solid ${GOLD_BORDER}` }} />

        {/* ════════════════════════════════════════
            CODA
        ════════════════════════════════════════ */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 48px 110px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          <p style={{ fontFamily: SERIF, fontSize: 'clamp(20px, 2vw, 26px)', fontWeight: 300, fontStyle: 'italic', lineHeight: 1.75, color: LEAD, maxWidth: 700 }}>
            {t('about.coda.text')}
          </p>
          <p style={{ fontFamily: SERIF, fontSize: 80, fontWeight: 300, color: GOLD_LIGHT, lineHeight: 1, userSelect: 'none' }}>
            {t('about.coda.mark')}
          </p>
        </div>

      </div>{/* /BG */}

      {/* ── Grid + responsive overrides ── */}
      <style>{`
        /* Beliefs — always 2 equal columns */
        #beliefs-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 52px 64px;
        }
        /* Aspirations — fixed left col + flexible right */
        #asp-layout {
          display: grid;
          grid-template-columns: 340px 1fr;
          gap: 80px;
          align-items: start;
        }
        @media (max-width: 960px) {
          .about-hero {
            grid-template-columns: 1fr !important;
            gap: 48px !important;
            padding: 56px 24px 64px !important;
          }
          #beliefs-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          #asp-layout {
            grid-template-columns: 1fr;
            gap: 48px;
          }
        }
        @media (max-width: 600px) {
          .about-hero img { height: 300px !important; }
          section, div[style] { padding-left: 24px !important; padding-right: 24px !important; }
        }
      `}</style>
    </Layout>
  );
};

export default About;
