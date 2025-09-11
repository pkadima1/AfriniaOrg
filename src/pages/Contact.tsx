
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import ContactForm from '../components/ContactForm';
import ContactInfo from '../components/ContactInfo';
import ResponseTime from '../components/ResponseTime';

const Contact = () => {
  const { t } = useTranslation();
  
  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            {t('contact.hero.title').split(' ').slice(0, -1).join(' ')}{' '}
            <span className="gradient-text">{t('contact.hero.title').split(' ').slice(-1)}</span>
          </h1>
          <p className="text-xl text-text-secondary mb-8">
            {t('contact.hero.subtitle')}
          </p>
        </div>
      </section>

      {/* Contact Form and Info */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <ContactForm />
            <ContactInfo />
          </div>
        </div>
      </section>

      <ResponseTime />
    </Layout>
  );
};

export default Contact;
