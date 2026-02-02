import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-dark-surface border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          {/* Logo + description */}
          <div className="col-span-2">
            <Link to="/" className="inline-block">
              <img
                src="/NodeMatics_Logo.png"
                alt="NodeMatics Logo"
                className="h-12 w-auto"
              />
            </Link>
            <p className="mt-4 text-sm text-text-secondary max-w-xs">
              {t('footer.description')}
            </p>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-white text-sm mb-4">{t('footer.company')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-sm text-text-secondary hover:text-white transition-colors">
                  {t('footer.links.about')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-text-secondary hover:text-white transition-colors">
                  {t('footer.links.philosophy')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-white text-sm mb-4">{t('footer.services')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/services" className="text-sm text-text-secondary hover:text-white transition-colors">
                  {t('footer.links.whatWeInstall')}
                </Link>
              </li>
              <li>
                <Link to="/example-systems" className="text-sm text-text-secondary hover:text-white transition-colors">
                  {t('footer.links.exampleSystems')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Products */}
          <div>
            <h3 className="font-semibold text-white text-sm mb-4">{t('footer.products')}</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href={t('footer.urls.engagePerfect')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-text-secondary hover:text-white transition-colors"
                >
                  {t('footer.links.engagePerfect')}
                </a>
              </li>
              <li>
                <Link to="/built-by" className="text-sm text-text-secondary hover:text-white transition-colors">
                  {t('footer.links.veilInDev')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white text-sm mb-4">{t('footer.contact')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/contact" className="text-sm text-text-secondary hover:text-white transition-colors">
                  {t('footer.links.bookTimeAudit')}
                </Link>
              </li>
              <li>
                <a
                  href={t('footer.urls.email')}
                  className="text-sm text-text-secondary hover:text-white transition-colors"
                >
                  {t('footer.links.email')}
                </a>
              </li>
              <li>
                <a
                  href={t('footer.urls.linkedIn')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-text-secondary hover:text-white transition-colors"
                >
                  {t('footer.links.linkedIn')}
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-white text-sm mb-4">{t('footer.legal')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy" className="text-sm text-text-secondary hover:text-white transition-colors">
                  {t('footer.links.privacyPolicy')}
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-text-secondary hover:text-white transition-colors">
                  {t('footer.links.termsOfService')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 text-center text-sm text-text-secondary">
          <p>{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
