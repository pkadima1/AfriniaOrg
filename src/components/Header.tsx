
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import { UserMenu } from './auth/UserMenu';
import { getBlogUrl, type Lang } from '@/utils/languageUtils';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const lang: Lang = i18n.language === 'fr' ? 'fr' : 'en';
  const blogUrl = getBlogUrl(lang);

  const navigation = [
    { name: t('navigation.ideas'), href: blogUrl },
    { name: t('navigation.builders'), href: '/builders' },
    { name: t('navigation.audio'), href: '/audio' },
    { name: t('navigation.about'), href: '/about' },
    { name: t('navigation.contact'), href: '/contact' },
  ];

  // Blog is active on any /en/blog or /fr/blog route (listing or post)
  const isActive = (path: string) => {
    if (path === blogUrl) {
      return location.pathname.startsWith('/en/blog') || location.pathname.startsWith('/fr/blog');
    }
    return location.pathname === path;
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(15,23,42,0.96)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <nav className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex justify-between items-center h-[68px]">

          {/* Logo — Afrinia image */}
          <Link to="/" className="flex items-center no-underline">
            <img
              src="https://firebasestorage.googleapis.com/v0/b/modified-hull-203004-d8ktc/o/Media%2Fafrinia_logo_header_matched.jpg?alt=media&token=db801d74-8642-4bc8-b3e2-ed3ccd310561"
              alt="Afrinia"
              style={{ height: 40, width: 'auto', objectFit: 'contain' }}
              onError={e => {
                // Fallback to text wordmark if image fails
                const img = e.currentTarget;
                img.style.display = 'none';
                const span = document.createElement('span');
                span.innerHTML = '<span style="color:#B8912A;font-size:18px">▲</span> <span style="font-family:Jost,sans-serif;font-size:13px;font-weight:500;letter-spacing:5px;text-transform:uppercase;color:#F5F0E8">Afrinia</span>';
                img.parentNode?.appendChild(span);
              }}
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-9">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                style={{
                  fontSize: '10px',
                  fontWeight: 500,
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  fontFamily: "'Jost', sans-serif",
                  color: isActive(item.href) ? '#B8912A' : '#8a9bb5',
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#B8912A')}
                onMouseLeave={e => (e.currentTarget.style.color = isActive(item.href) ? '#B8912A' : '#8a9bb5')}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop right side */}
          <div className="hidden md:flex items-center gap-4">
            <LanguageSwitcher />
            <UserMenu />
            <a
              href="/#newsletter"
              className="afrinia-btn-gold"
              style={{ fontSize: '10px', padding: '10px 24px' }}
            >
              {t('navigation.subscribe')}
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            style={{ color: '#8a9bb5' }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div
            className="md:hidden py-4"
            style={{ borderTop: '1px solid rgba(184,145,42,0.18)' }}
          >
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="block py-3"
                style={{
                  fontSize: '11px',
                  fontWeight: 500,
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  fontFamily: "'Jost', sans-serif",
                  color: isActive(item.href) ? '#B8912A' : '#8a9bb5',
                  textDecoration: 'none',
                }}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="mt-4 flex flex-col gap-3">
              <LanguageSwitcher />
              <UserMenu />
              <a
                href="/#newsletter"
                className="afrinia-btn-gold text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('navigation.subscribe')}
              </a>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
