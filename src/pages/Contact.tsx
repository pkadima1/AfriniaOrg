import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import ContactForm from '../components/ContactForm';

const Contact = () => {
  const { t } = useTranslation();

  return (
    <Layout>
      <PageHeader title={t('contact.hero.title')} subtitle={t('contact.hero.subtitle')} />

      {/* What to expect */}
      <section className="py-8 px-6 lg:px-8 bg-dark-surface/50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-lg font-semibold text-white mb-4 text-center">
            {t('contact.whatToExpect.title')}
          </h2>
          <ul className="space-y-2 text-text-secondary text-center">
            <li className="flex items-center justify-center gap-2">
              <span className="text-accent-blue">✓</span>
              {t('contact.whatToExpect.b1')}
            </li>
            <li className="flex items-center justify-center gap-2">
              <span className="text-accent-blue">✓</span>
              {t('contact.whatToExpect.b2')}
            </li>
            <li className="flex items-center justify-center gap-2">
              <span className="text-accent-blue">✓</span>
              {t('contact.whatToExpect.b3')}
            </li>
            <li className="flex items-center justify-center gap-2">
              <span className="text-accent-blue">✓</span>
              {t('contact.whatToExpect.b4')}
            </li>
          </ul>
        </div>
      </section>

      {/* Form + Trust builders */}
      <section className="py-16 px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            <div className="lg:col-span-3">
              <ContactForm />
            </div>
            <div className="lg:col-span-2">
              <div className="space-y-8 lg:sticky lg:top-28">
                <div className="p-6 rounded-xl bg-dark-card border border-white/10">
                  <h3 className="text-sm font-semibold text-white mb-4">
                    {t('contact.trustBuilders.whatYouGet')}
                  </h3>
                  <ul className="space-y-2 text-sm text-text-secondary">
                    <li className="flex items-start gap-2">
                      <span className="text-accent-blue shrink-0">✓</span>
                      {t('contact.trustBuilders.get1')}
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent-blue shrink-0">✓</span>
                      {t('contact.trustBuilders.get2')}
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent-blue shrink-0">✓</span>
                      {t('contact.trustBuilders.get3')}
                    </li>
                  </ul>
                </div>
                <div className="p-6 rounded-xl bg-dark-card border border-white/10">
                  <h3 className="text-sm font-semibold text-white mb-4">
                    {t('contact.trustBuilders.whatYouWontGet')}
                  </h3>
                  <ul className="space-y-2 text-sm text-text-secondary">
                    <li className="flex items-start gap-2">
                      <span className="text-white/60 shrink-0">✗</span>
                      {t('contact.trustBuilders.wont1')}
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-white/60 shrink-0">✗</span>
                      {t('contact.trustBuilders.wont2')}
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-white/60 shrink-0">✗</span>
                      {t('contact.trustBuilders.wont3')}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Alternative contact */}
      <section className="py-12 px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-text-secondary mb-2">
            {t('contact.alternativeContact.preferEmail')}{' '}
            <a
              href={`mailto:${t('contact.alternativeContact.email')}`}
              className="text-accent-blue hover:text-accent-blue/80 font-medium"
            >
              {t('contact.alternativeContact.email')}
            </a>
          </p>
          <p className="text-text-secondary">
            {t('contact.alternativeContact.linkedIn')}{' '}
            <a
              href={t('contact.alternativeContact.linkedInUrl')}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-blue hover:text-accent-blue/80 font-medium"
            >
              NodeMatics
            </a>
          </p>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
