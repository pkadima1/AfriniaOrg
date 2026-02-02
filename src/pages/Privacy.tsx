import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import { useTranslation } from 'react-i18next';

const Privacy = () => {
  const { t } = useTranslation();

  return (
    <Layout>
      <PageHeader title={t('legal.privacy.title')} />
      <section className="py-12 px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <p className="text-text-secondary text-sm mb-8">{t('legal.privacy.updated')}: 2024</p>
          <p className="text-text-secondary">{t('legal.privacy.placeholder')}</p>
        </div>
      </section>
    </Layout>
  );
};

export default Privacy;
