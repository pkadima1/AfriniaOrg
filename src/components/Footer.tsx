
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getBlogUrl, type Lang } from '@/utils/languageUtils';

const A = {
  bg2:    '#131f35',
  gold:   '#B8912A',
  cream:  '#F5F0E8',
  muted:  '#8a9bb5',
  border: 'rgba(184,145,42,0.18)',
  sans:   "'Jost', 'Helvetica Neue', sans-serif",
};

const FooterLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
  <li>
    <Link
      to={to}
      style={{
        fontFamily: A.sans, fontSize: 13, fontWeight: 300,
        color: A.muted, textDecoration: 'none', transition: 'color 0.2s',
        display: 'block', paddingBottom: 10,
      }}
      onMouseEnter={e => (e.currentTarget.style.color = A.gold)}
      onMouseLeave={e => (e.currentTarget.style.color = A.muted)}
    >
      {children}
    </Link>
  </li>
);

const FooterAnchor = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <li>
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        fontFamily: A.sans, fontSize: 13, fontWeight: 300,
        color: A.muted, textDecoration: 'none', transition: 'color 0.2s',
        display: 'block', paddingBottom: 10,
      }}
      onMouseEnter={e => (e.currentTarget.style.color = A.gold)}
      onMouseLeave={e => (e.currentTarget.style.color = A.muted)}
    >
      {children}
    </a>
  </li>
);

const colTitle: React.CSSProperties = {
  fontFamily: A.sans, fontSize: '10px', fontWeight: 500,
  letterSpacing: '2.5px', textTransform: 'uppercase',
  color: A.cream, marginBottom: 20,
};

const Footer = () => {
  const { t, i18n } = useTranslation();
  const lang: Lang = i18n.language === 'fr' ? 'fr' : 'en';
  const blogUrl = getBlogUrl(lang);

  return (
    <footer style={{ background: A.bg2, borderTop: `1px solid ${A.border}`, padding: '60px 40px 32px' }}>
      <div
        style={{
          maxWidth: 1140, margin: '0 auto',
          gap: 60, marginBottom: 48,
        }}
        className="footer-grid"
      >
        {/* Brand */}
        <div>
          <div style={{
            fontFamily: A.sans, fontSize: '12px', fontWeight: 500,
            letterSpacing: '5px', textTransform: 'uppercase',
            color: A.cream, marginBottom: 16,
          }}>
            <span style={{ color: A.gold, marginRight: 8 }}>▲</span>Afrinia
          </div>
          <p style={{
            fontFamily: A.sans, fontSize: 13, fontWeight: 300,
            color: A.muted, lineHeight: 1.8,
            maxWidth: 280, marginBottom: 24,
          }}>
            {t('afrinia_footer.description')}
          </p>
          <div style={{
            fontFamily: A.sans, fontSize: '10px',
            letterSpacing: '2px', textTransform: 'uppercase',
            color: A.gold,
          }}>
            {t('afrinia_footer.tagline')}
          </div>
        </div>

        {/* Content */}
        <div>
          <div style={colTitle}>{t('afrinia_footer.content')}</div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <FooterLink to={blogUrl}>{t('afrinia_footer.links.ideas')}</FooterLink>
            <FooterLink to="/builders">{t('afrinia_footer.links.builders')}</FooterLink>
            <FooterLink to={`${blogUrl}?category=opp`}>{t('afrinia_footer.links.opportunity')}</FooterLink>
            <FooterLink to={`${blogUrl}?category=edu`}>{t('afrinia_footer.links.education')}</FooterLink>
            <FooterLink to={`${blogUrl}?category=roots`}>{t('afrinia_footer.links.roots')}</FooterLink>
          </ul>
        </div>

        {/* Platform */}
        <div>
          <div style={colTitle}>{t('afrinia_footer.platform')}</div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <FooterLink to="/about">{t('afrinia_footer.links.about')}</FooterLink>
            <FooterLink to="/audio">{t('afrinia_footer.links.podcast')}</FooterLink>
            <FooterLink to="/#newsletter">{t('afrinia_footer.links.subscribe')}</FooterLink>
            <FooterLink to="/contact">{t('afrinia_footer.links.writeForUs')}</FooterLink>
            <FooterLink to="/contact">{t('afrinia_footer.links.contact')}</FooterLink>
          </ul>
        </div>

        {/* Follow */}
        <div>
          <div style={colTitle}>{t('afrinia_footer.follow')}</div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <FooterAnchor href="https://linkedin.com">LinkedIn</FooterAnchor>
            <FooterAnchor href="https://spotify.com">Spotify</FooterAnchor>
            <FooterAnchor href="https://podcasts.apple.com">Apple Podcasts</FooterAnchor>
            <FooterAnchor href="https://twitter.com">Twitter / X</FooterAnchor>
            <FooterAnchor href="https://youtube.com">YouTube</FooterAnchor>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          maxWidth: 1140, margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingTop: 24, borderTop: `1px solid ${A.border}`,
          flexWrap: 'wrap', gap: 12,
        }}
      >
        <span style={{ fontFamily: A.sans, fontSize: 11, color: A.muted, letterSpacing: '0.5px' }}>
          &copy; {new Date().getFullYear()} {t('afrinia_footer.copyright')}
        </span>
        <div style={{ display: 'flex', gap: 20 }}>
          {[
            { label: t('afrinia_footer.links.privacy'), to: '/privacy' },
            { label: t('afrinia_footer.links.terms'), to: '/terms' },
          ].map(l => (
            <Link
              key={l.to}
              to={l.to}
              style={{
                fontFamily: A.sans, fontSize: '10px',
                letterSpacing: '2px', textTransform: 'uppercase',
                color: A.muted, textDecoration: 'none',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = A.gold)}
              onMouseLeave={e => (e.currentTarget.style.color = A.muted)}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>

    </footer>
  );
};

export default Footer;
