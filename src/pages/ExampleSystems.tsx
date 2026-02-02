import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, FileStack, Mail } from 'lucide-react';

const CASE_KEYS = ['taskAssignment', 'configurator', 'emailLogger'] as const;

const CASE_ICONS = {
  taskAssignment: LayoutDashboard,
  configurator: FileStack,
  emailLogger: Mail,
};

const ExampleSystems = () => {
  const { t } = useTranslation();

  return (
    <Layout>
      <PageHeader title={t('exampleSystems.hero.title')} subtitle={t('exampleSystems.hero.subtitle')} />

      {/* Case study cards */}
      <section className="py-12 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-12">
          {CASE_KEYS.map((key, index) => {
            const Icon = CASE_ICONS[key];
            const base = `exampleSystems.cases.${key}`;
            const accentClass = index % 2 === 0 ? 'accent-blue' : 'accent-purple';
            return (
              <Card
                key={key}
                className="p-8 md:p-10 bg-dark-card border-white/10 card-hover overflow-hidden"
              >
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Visual placeholder: icon + subtle gradient (replace with screenshot when available) */}
                  <div className="lg:w-2/5 flex-shrink-0">
                    <div
                      className={`aspect-video rounded-xl flex items-center justify-center ${
                        accentClass === 'accent-blue'
                          ? 'bg-accent-blue/10 border border-accent-blue/20'
                          : 'bg-accent-purple/10 border border-accent-purple/20'
                      }`}
                    >
                      <Icon
                        className={
                          accentClass === 'accent-blue'
                            ? 'text-accent-blue/60'
                            : 'text-accent-purple/60'
                        }
                        size={48}
                      />
                    </div>
                  </div>
                  <div className="lg:w-3/5 flex flex-col">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
                        accentClass === 'accent-blue'
                          ? 'bg-accent-blue/20'
                          : 'bg-accent-purple/20'
                      }`}
                    >
                      <Icon
                        className={
                          accentClass === 'accent-blue'
                            ? 'text-accent-blue'
                            : 'text-accent-purple'
                        }
                        size={24}
                      />
                    </div>
                    <h2 className="text-2xl font-semibold mb-6">{t(`${base}.title`)}</h2>
                    <div className="space-y-5">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-white/70 mb-1">
                          {t(`${base}.problemLabel`)}
                        </p>
                        <p className="text-text-secondary">{t(`${base}.problem`)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-white/70 mb-1">
                          {t(`${base}.systemLabel`)}
                        </p>
                        <p className="text-text-secondary">{t(`${base}.system`)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-white/70 mb-1">
                          {t(`${base}.outcomeLabel`)}
                        </p>
                        <p className="text-white/95">{t(`${base}.outcome`)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Important note */}
      <section className="py-16 px-6 lg:px-8 bg-dark-surface">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-text-secondary text-lg leading-relaxed">
            {t('exampleSystems.note.line1')}
            <br />
            {t('exampleSystems.note.line2')}
            <br />
            <span className="text-white/90">{t('exampleSystems.note.line3')}</span>
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Link
            to="/contact"
            className="apple-button bg-gradient-to-r from-accent-blue to-accent-purple hover:from-accent-blue/90 hover:to-accent-purple/90 inline-block"
          >
            {t('exampleSystems.cta.button')}
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default ExampleSystems;
