import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const IMAGES = {
  engagePerfect: 'https://firebasestorage.googleapis.com/v0/b/modified-hull-203004.firebasestorage.app/o/Media%2FEngPerfect.png?alt=media&token=227cb820-f321-407b-b576-621857cb7966',
  veil: 'https://firebasestorage.googleapis.com/v0/b/modified-hull-203004.firebasestorage.app/o/Media%2FVeil_1-removebg-preview.png?alt=media&token=d003954d-2ace-423a-ab1f-698c1c4451f8',
};

const ENGAGEPERFECT_URL = 'https://engageperfect.com';

const BuiltBy = () => {
  const { t } = useTranslation();

  return (
    <Layout>
      <PageHeader title={t('builtByPage.hero.title')} subtitle={t('builtByPage.hero.intro')} />

      {/* Product cards */}
      <section className="py-12 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* EngagePerfect — primary, full emphasis */}
            <Card className="p-8 bg-dark-card border-white/10 hover:border-accent-blue/30 transition-colors">
              <img
                src={IMAGES.engagePerfect}
                alt={t('builtByPage.products.engagePerfect.title')}
                className="h-12 w-auto mb-6 object-contain object-left"
              />
              <h2 className="text-2xl font-semibold mb-3 text-white">
                {t('builtByPage.products.engagePerfect.title')}
              </h2>
              <p className="text-text-secondary mb-4 leading-relaxed">
                {t('builtByPage.products.engagePerfect.description')}
              </p>
              <p className="text-sm text-white/80 mb-6 leading-relaxed">
                {t('builtByPage.products.engagePerfect.supportingLine')}
              </p>
              <a
                href={ENGAGEPERFECT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-accent-blue font-semibold hover:text-accent-blue/80 transition-colors"
              >
                {t('builtByPage.products.engagePerfect.cta')}
              </a>
            </Card>

            {/* Veil — muted, in development */}
            <Card className="p-8 bg-dark-card/80 border-white/5 hover:border-accent-purple/20 transition-colors opacity-95">
              <div className="flex items-center gap-3 mb-6">
                <img
                  src={IMAGES.veil}
                  alt={t('builtByPage.products.veil.title')}
                  className="h-12 w-auto object-contain object-left"
                />
                <Badge variant="secondary" className="bg-accent-purple/20 text-accent-purple/90 border-accent-purple/30 shrink-0">
                  {t('builtByPage.products.veil.badge')}
                </Badge>
              </div>
              <h2 className="text-2xl font-semibold mb-3 text-white/95">
                {t('builtByPage.products.veil.title')}
              </h2>
              <p className="text-text-secondary mb-4 leading-relaxed">
                {t('builtByPage.products.veil.description')}
              </p>
              <p className="text-sm text-white/70 leading-relaxed">
                {t('builtByPage.products.veil.supportingLine')}
              </p>
              {t('builtByPage.products.veil.cta') && (
                <p className="mt-6 text-sm text-accent-purple/80 font-medium">
                  {t('builtByPage.products.veil.cta')}
                </p>
              )}
            </Card>
          </div>
        </div>
      </section>

      {/* Closing statement */}
      <section className="py-16 px-6 lg:px-8 bg-dark-surface">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-lg md:text-xl text-text-secondary leading-relaxed">
            {t('builtByPage.closing')}
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Link
            to="/services"
            className="apple-button bg-gradient-to-r from-accent-blue to-accent-purple hover:from-accent-blue/90 hover:to-accent-purple/90 inline-block"
          >
            {t('builtByPage.cta')}
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default BuiltBy;
