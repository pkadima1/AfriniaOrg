
import Layout from '../components/Layout';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const Services = () => {
  const { t } = useTranslation();
  const [isCalendarReady, setIsCalendarReady] = useState(false);
  const calendarTargetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Google Calendar scheduling script
    const link = document.createElement('link');
    link.href = 'https://calendar.google.com/calendar/scheduling-button-script.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://calendar.google.com/calendar/scheduling-button-script.js';
    script.async = true;
    
    script.onload = () => {
      console.log('Google Calendar script loaded');
      setTimeout(() => {
        setIsCalendarReady(true);
        console.log('Calendar ready state set');
      }, 1000);
    };

    script.onerror = () => {
      console.error('Failed to load Google Calendar script');
    };

    document.head.appendChild(script);

    return () => {
      try {
        document.head.removeChild(link);
        document.head.removeChild(script);
      } catch (e) {
        console.log('Cleanup error (expected):', e);
      }
    };
  }, []);

  const handleCalendarClick = () => {
    console.log('Calendar button clicked');
    console.log('Calendar ready:', isCalendarReady);
    console.log('Calendar target ref:', calendarTargetRef.current);

    try {
      if ((window as unknown as { calendar?: { schedulingButton?: { load: (config: unknown) => void } } }).calendar?.schedulingButton && calendarTargetRef.current) {
        console.log('Using calendar widget with target element');
        (window as unknown as { calendar: { schedulingButton: { load: (config: unknown) => void } } }).calendar.schedulingButton.load({
          url: 'https://calendar.google.com/calendar/appointments/schedules/AcZssZ0jPSL5lWFs921ITjSqM9lccdsQD0vDmFDY_RErbgAbwLn9gZF4JaB5EMCpN05tR_rebTIPw4EV?gv=true',
          color: '#039BE5',
          label: "Book Free Strategy Call",
          target: calendarTargetRef.current
        });

        // Wait for the Google button to be created, then auto-click it
        setTimeout(() => {
          const googleButton = calendarTargetRef.current?.querySelector('button');
          if (googleButton) {
            console.log('Auto-clicking Google calendar button');
            googleButton.click();
          } else {
            console.log('Google button not found, trying iframe approach');
            const iframe = calendarTargetRef.current?.querySelector('iframe');
            if (iframe) {
              console.log('Calendar iframe found');
            } else {
              console.log('Fallback to popup');
              window.open(
                'https://calendar.google.com/calendar/appointments/schedules/AcZssZ0jPSL5lWFs921ITjSqM9lccdsQD0vDmFDY_RErbgAbwLn9gZF4JaB5EMCpN05tR_rebTIPw4EV?gv=true',
                'calendar-popup',
                'width=800,height=600,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no'
              );
            }
          }
        }, 500);
      } else {
        console.log('Fallback to popup');
        window.open(
          'https://calendar.google.com/calendar/appointments/schedules/AcZssZ0jPSL5lWFs921ITjSqM9lccdsQD0vDmFDY_RErbgAbwLn9gZF4JaB5EMCpN05tR_rebTIPw4EV?gv=true',
          'calendar-popup',
          'width=800,height=600,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no'
        );
      }
    } catch (error) {
      console.error('Calendar error:', error);
      window.open(
        'https://calendar.google.com/calendar/appointments/schedules/AcZssZ0jPSL5lWFs921ITjSqM9lccdsQD0vDmFDY_RErbgAbwLn9gZF4JaB5EMCpN05tR_rebTIPw4EV?gv=true',
        'calendar-popup',
        'width=800,height=600,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no'
      );
    }
  };

  return (
    <Layout>
      {/* Calendar widget target - make it visible but positioned off-screen for auto-click */}
      <div ref={calendarTargetRef} className="fixed -top-96 left-0 opacity-0 pointer-events-none"></div>
      
      {/* Hero Section */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            {t('services.hero.title').split(' ').slice(0, -1).join(' ')} <span className="gradient-text">{t('services.hero.title').split(' ').slice(-1)}</span>
          </h1>
          <p className="text-xl text-text-secondary mb-8">
            {t('services.hero.subtitle')}
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Content Generation Service */}
            <Card className="p-8 bg-dark-card border-white/10 card-hover">
              <div className="w-12 h-12 bg-accent-blue/20 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-accent-blue text-2xl">✍️</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4">{t('services.cards.contentGeneration.title')}</h3>
              <p className="text-text-secondary mb-6">
                {t('services.cards.contentGeneration.description')}
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-blue rounded-full"></span>
                  <span>{t('services.cards.contentGeneration.features.blogPosts')}</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-blue rounded-full"></span>
                  <span>{t('services.cards.contentGeneration.features.socialMedia')}</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-blue rounded-full"></span>
                  <span>{t('services.cards.contentGeneration.features.emailCampaigns')}</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-blue rounded-full"></span>
                  <span>{t('services.cards.contentGeneration.features.productDescriptions')}</span>
                </li>
              </ul>
              <Link to="/contact" className="text-accent-blue hover:text-accent-blue/80 font-medium">
                {t('services.learnMore')} →
              </Link>
            </Card>

            {/* SEO Optimization Service */}
            <Card className="p-8 bg-dark-card border-white/10 card-hover">
              <div className="w-12 h-12 bg-accent-purple/20 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-accent-purple text-2xl">📈</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4">{t('services.cards.seoOptimization.title')}</h3>
              <p className="text-text-secondary mb-6">
                {t('services.cards.seoOptimization.description')}
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-purple rounded-full"></span>
                  <span>{t('services.cards.seoOptimization.features.keywordResearch')}</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-purple rounded-full"></span>
                  <span>{t('services.cards.seoOptimization.features.metaTags')}</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-purple rounded-full"></span>
                  <span>{t('services.cards.seoOptimization.features.contentStructure')}</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-purple rounded-full"></span>
                  <span>{t('services.cards.seoOptimization.features.readability')}</span>
                </li>
              </ul>
              <Link to="/contact" className="text-accent-purple hover:text-accent-purple/80 font-medium">
                {t('services.learnMore')} →
              </Link>
            </Card>

            {/* Content Strategy Service */}
            <Card className="p-8 bg-dark-card border-white/10 card-hover">
              <div className="w-12 h-12 bg-accent-blue/20 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-accent-blue text-2xl">🎯</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4">{t('services.cards.contentStrategy.title')}</h3>
              <p className="text-text-secondary mb-6">
                {t('services.cards.contentStrategy.description')}
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-blue rounded-full"></span>
                  <span>{t('services.cards.contentStrategy.features.contentAudit')}</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-blue rounded-full"></span>
                  <span>{t('services.cards.contentStrategy.features.editorialCalendar')}</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-blue rounded-full"></span>
                  <span>{t('services.cards.contentStrategy.features.audienceResearch')}</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-blue rounded-full"></span>
                  <span>{t('services.cards.contentStrategy.features.performanceOptimization')}</span>
                </li>
              </ul>
              <Link to="/contact" className="text-accent-blue hover:text-accent-blue/80 font-medium">
                {t('services.learnMore')} →
              </Link>
            </Card>

            {/* Custom Integration Service */}
            <Card className="p-8 bg-dark-card border-white/10 card-hover">
              <div className="w-12 h-12 bg-accent-purple/20 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-accent-purple text-2xl">⚙️</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4">{t('services.cards.customIntegrations.title')}</h3>
              <p className="text-text-secondary mb-6">
                {t('services.cards.customIntegrations.description')}
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-purple rounded-full"></span>
                  <span>{t('services.cards.customIntegrations.features.apiDevelopment')}</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-purple rounded-full"></span>
                  <span>{t('services.cards.customIntegrations.features.workflowAutomation')}</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-purple rounded-full"></span>
                  <span>{t('services.cards.customIntegrations.features.customModelTraining')}</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-purple rounded-full"></span>
                  <span>{t('services.cards.customIntegrations.features.enterpriseSupport')}</span>
                </li>
              </ul>
              <Link to="/contact" className="text-accent-purple hover:text-accent-purple/80 font-medium">
                {t('services.learnMore')} →
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 px-6 lg:px-8 bg-dark-surface">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">{t('services.process.title')}</h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              {t('services.process.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-accent-blue/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-accent-blue font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">{t('services.process.steps.discovery.title')}</h3>
              <p className="text-text-secondary">
                {t('services.process.steps.discovery.description')}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-accent-purple/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-accent-purple font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">{t('services.process.steps.strategy.title')}</h3>
              <p className="text-text-secondary">
                {t('services.process.steps.strategy.description')}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-accent-blue/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-accent-blue font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">{t('services.process.steps.implementation.title')}</h3>
              <p className="text-text-secondary">
                {t('services.process.steps.implementation.description')}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-accent-purple/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-accent-purple font-bold text-xl">4</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">{t('services.process.steps.optimization.title')}</h3>
              <p className="text-text-secondary">
                {t('services.process.steps.optimization.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            {t('services.cta.title').split(' ').slice(0, -2).join(' ')} <span className="gradient-text">{t('services.cta.title').split(' ').slice(-2).join(' ')}</span>
          </h2>
          <p className="text-xl text-text-secondary mb-8">
            {t('services.cta.subtitle')}
          </p>
          <button 
            onClick={handleCalendarClick}
            className="apple-button bg-gradient-to-r from-accent-blue to-accent-purple hover:from-accent-blue/90 hover:to-accent-purple/90"
          >
            {t('services.cta.button')}
          </button>
        </div>
      </section>
    </Layout>
  );
};

export default Services;
