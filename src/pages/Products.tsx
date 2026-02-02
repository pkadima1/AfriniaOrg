import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Products = () => {
  const { t } = useTranslation();
  
  return (
    <Layout>
      <PageHeader title={t('products.hero.title')} subtitle={t('products.hero.subtitle')} />

      {/* CTA below header */}
      <section className="py-6 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <a 
            href="https://engageperfect.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="apple-button"
          >
            {t('products.hero.cta')}
          </a>
        </div>
      </section>

      {/* Enhanced UI Preview Section */}
      <section className="py-16 px-6 lg:px-8 bg-dark-surface">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">{t('products.seeItInAction.title')}</h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              {t('products.seeItInAction.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Live Demo Interface */}
            <div className="bg-dark-card border border-white/10 rounded-3xl p-8 overflow-hidden">
              <h3 className="text-2xl font-semibold mb-6 text-center">{t('products.seeItInAction.liveGenerator.title')}</h3>
              
              {/* Mock Interface */}
              <div className="space-y-4">
                <div className="bg-dark-bg rounded-2xl p-4 border border-accent-blue/30">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 bg-accent-blue rounded-full"></div>
                    <span className="text-sm font-medium">{t('products.seeItInAction.liveGenerator.inputPrompt')}</span>
                  </div>
                  <p className="text-sm text-gray-300 bg-dark-surface rounded-lg p-3">
                    "{t('products.seeItInAction.liveGenerator.samplePrompt')}"
                  </p>
                </div>
                
                <div className="text-center py-2">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-purple/20 rounded-full">
                    <div className="w-2 h-2 bg-accent-purple rounded-full animate-pulse"></div>
                    <span className="text-sm text-accent-purple">{t('products.seeItInAction.liveGenerator.aiProcessing')}</span>
                  </div>
                </div>
                
                <div className="bg-accent-blue/10 rounded-2xl p-4 border-l-4 border-accent-blue">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-accent-blue">{t('products.seeItInAction.liveGenerator.generatedContent')}</h4>
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">{t('products.seeItInAction.liveGenerator.seoScore')}</span>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    "{t('products.seeItInAction.liveGenerator.sampleContent')}"
                  </p>
                  <div className="flex gap-2 mt-3">
                    <span className="text-xs bg-accent-blue/20 text-accent-blue px-2 py-1 rounded">1,247 {t('products.seeItInAction.liveGenerator.words')}</span>
                    <span className="text-xs bg-accent-purple/20 text-accent-purple px-2 py-1 rounded">{t('products.seeItInAction.liveGenerator.eatCompliant')}</span>
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">{t('products.seeItInAction.liveGenerator.readyToPublish')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Features Showcase */}
            <div className="space-y-6">
              <Card className="p-6 bg-gradient-to-br from-accent-blue/10 to-accent-purple/10 border-accent-blue/30 card-hover">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-accent-blue/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-accent-blue">{t('products.seeItInAction.features.lightningFast.title')}</h3>
                    <p className="text-sm text-gray-300">{t('products.seeItInAction.features.lightningFast.description')}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-accent-purple/10 to-accent-blue/10 border-accent-purple/30 card-hover">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-accent-purple/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-accent-purple">{t('products.seeItInAction.features.seoOptimized.title')}</h3>
                    <p className="text-sm text-gray-300">{t('products.seeItInAction.features.seoOptimized.description')}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-green-500/10 to-accent-blue/10 border-green-500/30 card-hover">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🧠</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-green-400">{t('products.seeItInAction.features.humanLike.title')}</h3>
                    <p className="text-sm text-gray-300">{t('products.seeItInAction.features.humanLike.description')}</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-dark-card rounded-2xl border border-white/10">
              <div className="text-3xl font-bold text-accent-blue mb-2">10x</div>
              <div className="text-sm text-gray-400">{t('products.seeItInAction.stats.faster')}</div>
            </div>
            <div className="text-center p-6 bg-dark-card rounded-2xl border border-white/10">
              <div className="text-3xl font-bold text-accent-purple mb-2">94%</div>
              <div className="text-sm text-gray-400">{t('products.seeItInAction.stats.seoScore')}</div>
            </div>
            <div className="text-center p-6 bg-dark-card rounded-2xl border border-white/10">
              <div className="text-3xl font-bold text-green-400 mb-2">50+</div>
              <div className="text-sm text-gray-400">{t('products.seeItInAction.stats.contentTypes')}</div>
            </div>
            <div className="text-center p-6 bg-dark-card rounded-2xl border border-white/10">
              <div className="text-3xl font-bold text-accent-blue mb-2">24/7</div>
              <div className="text-sm text-gray-400">{t('products.seeItInAction.stats.availability')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">{t('products.features.title')}</h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              {t('products.features.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <Card className="p-8 bg-dark-card border-white/10 card-hover">
              <div className="w-12 h-12 bg-accent-blue/20 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-accent-blue text-2xl">📝</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4">{t('products.features.contentGeneration.title')}</h3>
              <p className="text-text-secondary mb-6">
                {t('products.features.contentGeneration.description')}
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-accent-blue rounded-full"></span>
                  <span>{t('products.features.contentGeneration.features.longForm')}</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-accent-blue rounded-full"></span>
                  <span>{t('products.features.contentGeneration.features.socialMedia')}</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-accent-blue rounded-full"></span>
                  <span>{t('products.features.contentGeneration.features.productDescriptions')}</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-accent-blue rounded-full"></span>
                  <span>{t('products.features.contentGeneration.features.emailCampaigns')}</span>
                </li>
              </ul>
            </Card>

            <Card className="p-8 bg-dark-card border-white/10 card-hover">
              <div className="w-12 h-12 bg-accent-purple/20 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-accent-purple text-2xl">🎯</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4">{t('products.features.eatCompliance.title')}</h3>
              <p className="text-text-secondary mb-4">
                {t('products.features.eatCompliance.description')}
              </p>
              <p className="text-sm text-accent-purple mb-6 italic">
                {t('products.features.eatCompliance.note')}
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-accent-purple rounded-full"></span>
                  <span>{t('products.features.eatCompliance.features.expertLevel')}</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-accent-purple rounded-full"></span>
                  <span>{t('products.features.eatCompliance.features.authoritative')}</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-accent-purple rounded-full"></span>
                  <span>{t('products.features.eatCompliance.features.trustworthy')}</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-accent-purple rounded-full"></span>
                  <span>{t('products.features.eatCompliance.features.experienceBased')}</span>
                </li>
              </ul>
            </Card>

            <Card className="p-8 bg-dark-card border-white/10 card-hover">
              <div className="w-12 h-12 bg-accent-blue/20 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-accent-blue text-2xl">📊</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4">{t('products.features.seoOptimization.title')}</h3>
              <p className="text-text-secondary mb-6">
                {t('products.features.seoOptimization.description')}
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-accent-blue rounded-full"></span>
                  <span>{t('products.features.seoOptimization.features.keywordOptimization')}</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-accent-blue rounded-full"></span>
                  <span>{t('products.features.seoOptimization.features.metaDescriptions')}</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-accent-blue rounded-full"></span>
                  <span>{t('products.features.seoOptimization.features.headerOptimization')}</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-accent-blue rounded-full"></span>
                  <span>{t('products.features.seoOptimization.features.readabilityScoring')}</span>
                </li>
              </ul>
            </Card>

            <Card className="p-8 bg-dark-card border-white/10 card-hover">
              <div className="w-12 h-12 bg-accent-purple/20 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-accent-purple text-2xl">⚡</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4">{t('products.features.automation.title')}</h3>
              <p className="text-text-secondary mb-4">
                {t('products.features.automation.description')}
              </p>
              <p className="text-sm text-accent-purple mb-6 font-medium">
                {t('products.features.automation.note')}
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-accent-purple rounded-full"></span>
                  <span>{t('products.features.automation.features.wordpressIntegration')}</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-accent-purple rounded-full"></span>
                  <span>{t('products.features.automation.features.socialScheduling')}</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-accent-purple rounded-full"></span>
                  <span>{t('products.features.automation.features.apiAccess')}</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-accent-purple rounded-full"></span>
                  <span>{t('products.features.automation.features.bulkGeneration')}</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 px-6 lg:px-8 bg-dark-surface">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">{t('products.useCases.title')}</h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              {t('products.useCases.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 bg-dark-card border-white/10 text-center card-hover">
              <div className="w-16 h-16 bg-accent-blue/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-accent-blue text-3xl">👨‍💻</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">{t('products.useCases.contentCreators.title')}</h3>
              <p className="text-text-secondary">
                {t('products.useCases.contentCreators.description')}
              </p>
            </Card>

            <Card className="p-8 bg-dark-card border-white/10 text-center card-hover">
              <div className="w-16 h-16 bg-accent-purple/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-accent-purple text-3xl">👥</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">{t('products.useCases.marketingTeams.title')}</h3>
              <p className="text-text-secondary">
                {t('products.useCases.marketingTeams.description')}
              </p>
            </Card>

            <Card className="p-8 bg-dark-card border-white/10 text-center card-hover">
              <div className="w-16 h-16 bg-accent-blue/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-accent-blue text-3xl">🏢</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">{t('products.useCases.smallBusinesses.title')}</h3>
              <p className="text-text-secondary">
                {t('products.useCases.smallBusinesses.description')}
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">{t('products.testimonials.title')}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 bg-dark-card border-white/10 text-center card-hover">
              <blockquote className="text-lg mb-6 leading-relaxed">
                "{t('products.testimonials.items.quote1')}"
              </blockquote>
              <div className="text-accent-blue font-medium">
                — {t('products.testimonials.items.author1')}
              </div>
            </Card>

            <Card className="p-8 bg-dark-card border-white/10 text-center card-hover">
              <blockquote className="text-lg mb-6 leading-relaxed">
                "{t('products.testimonials.items.quote2')}"
              </blockquote>
              <div className="text-accent-blue font-medium">
                — {t('products.testimonials.items.author2')}
              </div>
            </Card>

            <Card className="p-8 bg-dark-card border-white/10 text-center card-hover">
              <blockquote className="text-lg mb-6 leading-relaxed">
                "{t('products.testimonials.items.quote3')}"
              </blockquote>
              <div className="text-accent-blue font-medium">
                — {t('products.testimonials.items.author3')}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-8 bg-dark-surface">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            {t('products.finalCta.title')} <span className="gradient-text">EngagePerfect</span>?
          </h2>
          <p className="text-xl text-text-secondary mb-8">
            {t('products.finalCta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="https://engageperfect.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="apple-button"
            >
              {t('products.finalCta.startTrial')}
            </a>
            <Link 
              to="/contact" 
              className="px-8 py-4 border border-white/20 text-white rounded-2xl hover:bg-white/5 transition-all duration-300"
            >
              {t('products.finalCta.requestDemo')}
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Products;
