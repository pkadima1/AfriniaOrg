
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { t } = useTranslation();

  const navigation = [
    { name: t('navigation.home'), href: '/' },
    { name: t('navigation.about'), href: '/about' },
    { name: t('navigation.products'), href: '/products' },
    { name: t('navigation.services'), href: '/services' },
    { name: t('navigation.blog'), href: '/blog' },
    { name: t('navigation.contact'), href: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-effect">
      <nav className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center">
            <img 
              src="/lovable-uploads/8235a7be-e051-4013-a38e-a6748d05bdab.png" 
              alt="NodeMatics Logo" 
              className="h-8 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`transition-colors duration-200 ${
                  isActive(item.href)
                    ? 'text-accent-blue'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <LanguageSwitcher />
            <Link
              to="/contact"
              className="px-6 py-2 border border-accent-blue text-accent-blue rounded-xl hover:bg-accent-blue hover:text-white transition-all duration-300"
            >
              {t('navigation.getStarted')}
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`block py-2 transition-colors duration-200 ${
                  isActive(item.href)
                    ? 'text-accent-blue'
                    : 'text-gray-300 hover:text-white'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="mt-4 flex flex-col space-y-2">
              <LanguageSwitcher />
              <Link
                to="/contact"
                className="px-6 py-2 border border-accent-blue text-accent-blue rounded-xl hover:bg-accent-blue hover:text-white transition-all duration-300 text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('navigation.getStarted')}
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
