
import Layout from '../components/Layout';
import { Card } from '@/components/ui/card';
import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const About = () => {
  const [isCalendarReady, setIsCalendarReady] = useState(false);
  const calendarTargetRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

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
      if ((window as any).calendar && (window as any).calendar.schedulingButton && calendarTargetRef.current) {
        console.log('Using calendar widget with target element');
        (window as any).calendar.schedulingButton.load({
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
            {t('about.hero.title')}
          </h1>
          <p className="text-xl text-text-secondary mb-8 leading-relaxed">
            {t('about.hero.subtitle')}
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 px-6 lg:px-8 bg-dark-surface">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="animate-slide-up">
            <h2 className="text-4xl font-bold mb-6">{t('about.story.title')}</h2>
            <p className="text-lg text-text-secondary mb-6 leading-relaxed">
              {t('about.story.paragraph1')}
            </p>
            <p className="text-lg text-text-secondary leading-relaxed">
              {t('about.story.paragraph2')}
            </p>
          </div>
          <div className="lg:pl-12">
            <div className="bg-gradient-to-br from-accent-blue/10 to-accent-purple/10 rounded-3xl p-8 border border-white/10">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold gradient-text">7+</div>
                  <div className="text-text-secondary">{t('about.story.stats.experience')}</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold gradient-text">500+</div>
                  <div className="text-text-secondary">{t('about.story.stats.projects')}</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold gradient-text">15+</div>
                  <div className="text-text-secondary">{t('about.story.stats.countries')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Believe */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">{t('about.beliefs.title')}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 bg-dark-card border-white/10 text-center card-hover">
              <div className="w-16 h-16 bg-accent-blue/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-accent-blue text-3xl">⏰</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">{t('about.beliefs.items.timeValue.title')}</h3>
              <p className="text-text-secondary">
                {t('about.beliefs.items.timeValue.description')}
              </p>
            </Card>

            <Card className="p-8 bg-dark-card border-white/10 text-center card-hover">
              <div className="w-16 h-16 bg-accent-purple/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-accent-purple text-3xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">{t('about.beliefs.items.simplicityScales.title')}</h3>
              <p className="text-text-secondary">
                {t('about.beliefs.items.simplicityScales.description')}
              </p>
            </Card>

            <Card className="p-8 bg-dark-card border-white/10 text-center card-hover">
              <div className="w-16 h-16 bg-accent-blue/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-accent-blue text-3xl">📈</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">{t('about.beliefs.items.improvementConstant.title')}</h3>
              <p className="text-text-secondary">
                {t('about.beliefs.items.improvementConstant.description')}
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Founders Section */}
      <section className="py-20 px-6 lg:px-8 bg-dark-surface">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">{t('about.founders.title')}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <Card className="p-8 bg-dark-card border-white/10 text-center card-hover">
              <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden">
                <img 
                  src="/lovable-uploads/f77d9966-f5a3-4c77-bb28-46fb6285448b.png" 
                  alt={t('about.founders.patrick.name')} 
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-2xl font-semibold mb-2">{t('about.founders.patrick.name')}</h3>
              <p className="text-accent-blue mb-4 font-medium">{t('about.founders.patrick.role')}</p>
              <p className="text-text-secondary leading-relaxed">
                {t('about.founders.patrick.bio')}
              </p>
            </Card>

            <Card className="p-8 bg-dark-card border-white/10 text-center card-hover">
              <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden">
                <img 
                  src="/lovable-uploads/1fb7ed00-84e5-45f2-b0f7-f978ebd3578b.png" 
                  alt={t('about.founders.sunita.name')} 
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-2xl font-semibold mb-2">{t('about.founders.sunita.name')}</h3>
              <p className="text-accent-blue mb-4 font-medium">{t('about.founders.sunita.role')}</p>
              <p className="text-text-secondary leading-relaxed">
                {t('about.founders.sunita.bio')}
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-8">
            {t('about.finalCta.title')}
          </h2>
          <p className="text-xl text-text-secondary mb-12 leading-relaxed">
            {t('about.finalCta.subtitle')}
          </p>
          <button 
            onClick={handleCalendarClick}
            className="apple-button bg-gradient-to-r from-accent-blue to-accent-purple hover:from-accent-blue/90 hover:to-accent-purple/90"
          >
            {t('about.finalCta.cta')}
          </button>
        </div>
      </section>
    </Layout>
  );
};

export default About;
