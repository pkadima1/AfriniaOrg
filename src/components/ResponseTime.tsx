
import { useTranslation } from 'react-i18next';

const ResponseTime = () => {
  const { t } = useTranslation();
  
  return (
    <section className="py-20 px-6 lg:px-8 bg-dark-surface">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-6">
          {t('contact.responseTime.title').split(' ').slice(0, -1).join(' ')}{' '}
          <span className="gradient-text">{t('contact.responseTime.title').split(' ').slice(-1)}</span>
        </h2>
        <p className="text-xl text-text-secondary mb-8">
          {t('contact.responseTime.subtitle')}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold gradient-text mb-2">{t('contact.responseTime.hours2')}</div>
            <div className="text-text-secondary">{t('contact.responseTime.sales')}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold gradient-text mb-2">{t('contact.responseTime.hours4')}</div>
            <div className="text-text-secondary">{t('contact.responseTime.general')}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold gradient-text mb-2">{t('contact.responseTime.hours24')}</div>
            <div className="text-text-secondary">{t('contact.responseTime.technical')}</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResponseTime;
