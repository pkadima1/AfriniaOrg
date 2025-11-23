
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="bg-dark-surface border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center">
              <img 
                src="/NodeMatics_Logo.png"
                alt="NodeMatics Logo" 
                className="h-12 w-auto"
              />
            </Link>
            <p className="mt-4 text-text-secondary max-w-md">
              {t('footer.description')}
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">{t('footer.company')}</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-text-secondary hover:text-white transition-colors">{t('footer.links.about')}</Link></li>
              <li><Link to="/services" className="text-text-secondary hover:text-white transition-colors">{t('footer.links.services')}</Link></li>
              <li><Link to="/contact" className="text-text-secondary hover:text-white transition-colors">{t('footer.links.contact')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">{t('footer.products')}</h3>
            <ul className="space-y-2">
              <li><Link to="/products" className="text-text-secondary hover:text-white transition-colors">{t('footer.links.engagePerfect')}</Link></li>
              <li><a href="#" className="text-text-secondary hover:text-white transition-colors">{t('footer.links.support')}</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 text-center text-text-secondary">
          <p>{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
