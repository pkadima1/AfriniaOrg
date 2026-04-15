import Layout from '../components/Layout';
import { useTranslation } from 'react-i18next';

const PATRICK_PHOTO =
  'https://firebasestorage.googleapis.com/v0/b/modified-hull-203004.firebasestorage.app/o/Afrinia%2FAfriniaMedia%2FMe%20LinkedIn.png?alt=media&token=b7119c05-1405-40e9-a3a4-b489d1a2fa52';

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
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '0 24px 80px',
          fontFamily: "'Jost', sans-serif",
        }}
      >
        {/* ── HERO ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 64,
            alignItems: 'center',
            padding: '64px 0 72px',
            borderBottom: '1px solid rgba(184,145,42,0.2)',
          }}
        >
          {/* Text */}
          <div>
            <p
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: '#B8912A',
                marginBottom: 20,
              }}
            >
              {t('about.eyebrow')}
            </p>

            <h1
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 'clamp(42px, 5vw, 60px)',
                fontWeight: 300,
                lineHeight: 1.1,
                color: '#F5F0E8',
                marginBottom: 8,
                letterSpacing: '-0.01em',
              }}
            >
              Patrick K.
              <br />
              Tshimanga
            </h1>

            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 'clamp(16px, 2vw, 20px)',
                fontWeight: 400,
                fontStyle: 'italic',
                color: '#B8912A',
                marginBottom: 32,
              }}
            >
              {t('about.hero.title')}
            </p>

            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 'clamp(20px, 2.5vw, 26px)',
                fontWeight: 300,
                fontStyle: 'italic',
                lineHeight: 1.55,
                color: '#d4c9a8',
                marginBottom: 32,
                borderLeft: '2px solid #B8912A',
                paddingLeft: 20,
              }}
            >
              {t('about.hero.lead')}
            </p>

            <p
              style={{
                fontSize: 15,
                fontWeight: 300,
                lineHeight: 1.8,
                color: '#8a9bb5',
              }}
            >
              {t('about.hero.body')}
            </p>
          </div>

          {/* Photo */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ position: 'relative', width: 340, height: 420 }}>
              {/* Gold offset border */}
              <div
                style={{
                  position: 'absolute',
                  top: -12,
                  left: 12,
                  width: '100%',
                  height: '100%',
                  border: '1px solid #B8912A',
                  borderRadius: 1,
                  zIndex: 0,
                }}
              />
              <img
                src={PATRICK_PHOTO}
                alt="Patrick K. Tshimanga"
                style={{
                  position: 'relative',
                  zIndex: 1,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'top center',
                  borderRadius: 1,
                  display: 'block',
                }}
              />
              <p
                style={{
                  position: 'absolute',
                  bottom: -36,
                  left: 0,
                  right: 0,
                  textAlign: 'center',
                  fontFamily: "'Jost', sans-serif",
                  fontSize: 11,
                  fontWeight: 300,
                  letterSpacing: '0.1em',
                  color: '#5c7090',
                  zIndex: 1,
                }}
              >
                {t('about.photoCaption')}
              </p>
            </div>
          </div>
        </div>

        {/* ── BELIEFS ── */}
        <div
          style={{
            padding: '72px 0',
            borderBottom: '1px solid rgba(184,145,42,0.2)',
          }}
        >
          <p
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#B8912A',
              marginBottom: 40,
            }}
          >
            {t('about.beliefs.label')}
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 48,
            }}
          >
            {beliefs.map(({ num, key }) => (
              <div
                key={key}
                style={{
                  borderTop: '1px solid rgba(184,145,42,0.2)',
                  paddingTop: 24,
                }}
              >
                <p
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 42,
                    fontWeight: 300,
                    color: 'rgba(184,145,42,0.18)',
                    lineHeight: 1,
                    marginBottom: 12,
                  }}
                >
                  {num}
                </p>
                <h3
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 22,
                    fontWeight: 400,
                    color: '#F5F0E8',
                    marginBottom: 12,
                    lineHeight: 1.3,
                  }}
                >
                  {t(`about.beliefs.${key}.headline`)}
                </h3>
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 300,
                    lineHeight: 1.75,
                    color: '#8a9bb5',
                  }}
                >
                  {t(`about.beliefs.${key}.body`)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── MISSION QUOTE ── */}
        <div
          style={{
            padding: '72px 0',
            borderBottom: '1px solid rgba(184,145,42,0.2)',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(26px, 3.5vw, 40px)',
              fontWeight: 300,
              fontStyle: 'italic',
              lineHeight: 1.45,
              color: '#F5F0E8',
              maxWidth: 820,
              margin: '0 auto 24px',
              letterSpacing: '-0.01em',
            }}
          >
            {t('about.mission.quote')}
          </p>
          <p
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: 12,
              fontWeight: 300,
              letterSpacing: '0.12em',
              color: '#B8912A',
            }}
          >
            {t('about.mission.attr')}
          </p>
        </div>

        {/* ── ASPIRATIONS ── */}
        <div
          style={{
            padding: '72px 0',
            borderBottom: '1px solid rgba(184,145,42,0.2)',
          }}
        >
          <p
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#B8912A',
              marginBottom: 40,
            }}
          >
            {t('about.aspirations.label')}
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 280px) 1fr',
              gap: 64,
              alignItems: 'start',
            }}
            className="asp-layout"
          >
            <div>
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 'clamp(32px, 4vw, 48px)',
                  fontWeight: 300,
                  lineHeight: 1.15,
                  color: '#F5F0E8',
                  marginBottom: 24,
                }}
              >
                {t('about.aspirations.heading')}
              </h2>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 300,
                  lineHeight: 1.8,
                  color: '#8a9bb5',
                }}
              >
                {t('about.aspirations.body')}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {aspirations.map((key, i) => (
                <div
                  key={key}
                  style={{
                    display: 'flex',
                    gap: 24,
                    padding: i === 0 ? '0 0 28px' : '28px 0',
                    borderBottom:
                      i < aspirations.length - 1
                        ? '1px solid rgba(184,145,42,0.2)'
                        : 'none',
                    alignItems: 'flex-start',
                  }}
                >
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: '#B8912A',
                      marginTop: 8,
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <p
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 20,
                        fontWeight: 400,
                        color: '#F5F0E8',
                        marginBottom: 6,
                      }}
                    >
                      {t(`about.aspirations.${key}.title`)}
                    </p>
                    <p
                      style={{
                        fontSize: 13.5,
                        fontWeight: 300,
                        lineHeight: 1.7,
                        color: '#8a9bb5',
                      }}
                    >
                      {t(`about.aspirations.${key}.desc`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── CODA ── */}
        <div
          style={{
            padding: '64px 0 0',
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            alignItems: 'end',
            gap: 40,
          }}
          className="coda-layout"
        >
          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 18,
              fontWeight: 300,
              fontStyle: 'italic',
              lineHeight: 1.6,
              color: '#d4c9a8',
            }}
          >
            {t('about.coda.text')}
          </p>
          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 48,
              fontWeight: 300,
              color: 'rgba(184,145,42,0.2)',
              lineHeight: 1,
              userSelect: 'none',
            }}
          >
            {t('about.coda.mark')}
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .asp-layout {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
          .coda-layout {
            grid-template-columns: 1fr !important;
          }
          .coda-layout > p:last-child {
            display: none;
          }
        }
      `}</style>
    </Layout>
  );
};

export default About;
