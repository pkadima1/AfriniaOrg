
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

interface Props {
  section: 'builders' | 'audio';
}

const COPY = {
  builders: {
    eyebrow: 'Builders',
    title: 'Founder decision maps. Coming soon.',
    body: 'We are curating the first cohort of African builder profiles — not inspiration stories, but specific decision case studies. The entrepreneurs and technologists constructing Africa\'s digital economy.',
    cta: 'Read the latest ideas while you wait',
    href: '/blog',
  },
  audio: {
    eyebrow: 'The Afrinia Brief — Audio',
    title: 'Every idea, also a conversation.',
    body: 'Audio episodes are in production. Each article on Afrinia will become a focused 6–8 minute episode, available on Spotify and Apple Podcasts. Subscribe to the newsletter to be notified when we launch.',
    cta: 'Subscribe to the brief',
    href: '/#newsletter',
  },
};

const ComingSoon = ({ section }: Props) => {
  const c = COPY[section];

  return (
    <Layout>
      <section
        className="section-xl"
        style={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0f172a',
          paddingTop: 120,
        }}
      >
        <div className="page-container section-center-xs" style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: "'Jost', sans-serif",
            fontSize: '10px', fontWeight: 500,
            letterSpacing: '4px', textTransform: 'uppercase',
            color: '#B8912A', marginBottom: 24,
          }}>{c.eyebrow}</div>

          <h1 style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 'clamp(36px,4vw,52px)',
            fontWeight: 300, lineHeight: 1.2,
            color: '#F5F0E8', marginBottom: 24,
          }}>{c.title}</h1>

          <div style={{ width: 40, height: 1, background: '#B8912A', opacity: 0.5, margin: '0 auto 24px' }} />

          <p style={{
            fontFamily: "'Jost', sans-serif",
            fontSize: 15, fontWeight: 300,
            color: '#8a9bb5', lineHeight: 1.8,
            marginBottom: 40,
          }}>{c.body}</p>

          <Link
            to={c.href}
            style={{
              display: 'inline-block',
              fontFamily: "'Jost', sans-serif",
              fontSize: '11px', fontWeight: 500,
              letterSpacing: '2.5px', textTransform: 'uppercase',
              color: '#0f172a', background: '#B8912A',
              padding: '14px 32px', textDecoration: 'none',
            }}
          >
            {c.cta}
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default ComingSoon;
