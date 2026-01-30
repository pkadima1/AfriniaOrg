
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { Card } from '@/components/ui/card';
import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const Index = () => {
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

    // Add load event listener
    script.onload = () => {
      console.log('Google Calendar script loaded');
      // Wait a bit more for the calendar object to be fully initialized
      setTimeout(() => {
        setIsCalendarReady(true);
        console.log('Calendar ready state set');
      }, 1000);
    };

    script.onerror = () => {
      console.error('Failed to load Google Calendar script');
    };

    document.head.appendChild(script);

    // Cleanup function
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
      // Check if calendar object exists and we have a target element
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
            // Alternative: look for iframe and try to trigger it
            const iframe = calendarTargetRef.current?.querySelector('iframe');
            if (iframe) {
              // If there's an iframe, the calendar should already be showing
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
        // Fallback to popup if script not loaded or no target
        window.open(
          'https://calendar.google.com/calendar/appointments/schedules/AcZssZ0jPSL5lWFs921ITjSqM9lccdsQD0vDmFDY_RErbgAbwLn9gZF4JaB5EMCpN05tR_rebTIPw4EV?gv=true', 
          'calendar-popup',
          'width=800,height=600,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no'
        );
      }
    } catch (error) {
      console.error('Calendar error:', error);
      // Fallback to popup on any error
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
      <section className="relative py-32 px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/5 to-accent-purple/5"></div>
        <div className="relative max-w-4xl mx-auto text-center animate-fade-in">
          <h1 className="text-6xl md:text-8xl font-bold mb-8">
            {t('home.hero.title')}
          </h1>
          <p className="text-xl md:text-2xl text-text-secondary mb-12 max-w-3xl mx-auto leading-relaxed">
            {t('home.hero.subtitle')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/products"
              className="apple-button bg-accent-purple hover:bg-accent-purple/90 hover:shadow-accent-purple/20"
            >
              {t('home.hero.cta.exploreProducts')}
            </Link>
            <Link
              to="/about"
              className="apple-button bg-accent-blue hover:bg-accent-blue/90 hover:shadow-accent-blue/20"
            >
              {t('home.hero.cta.learnAbout')}
            </Link>
            <button
              onClick={handleCalendarClick}
              className="apple-button bg-gradient-to-r from-accent-blue to-accent-purple hover:from-accent-blue/90 hover:to-accent-purple/90"
            >
              {t('home.hero.cta.bookCall')}
            </button>
          </div>
        </div>
      </section>

      {/* Our Solutions */}
      <section className="py-20 px-6 lg:px-8 bg-dark-surface">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              {t('home.solutions.title')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-scale-in">
            <Card className="p-8 bg-dark-card border-white/10 card-hover text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 rounded-3xl flex items-center justify-center mb-6 mx-auto">
                <span className="text-4xl">🎯</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">{t('home.solutions.items.engagePerfect.title')}</h3>
              <p className="text-text-secondary leading-relaxed">
                {t('home.solutions.items.engagePerfect.description')}
              </p>
            </Card>
            <Card className="p-8 bg-dark-card border-white/10 card-hover text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 rounded-3xl flex items-center justify-center mb-6 mx-auto">
                <span className="text-4xl">⚡</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">{t('home.solutions.items.skySparkRules.title')}</h3>
              <p className="text-text-secondary leading-relaxed">
                {t('home.solutions.items.skySparkRules.description')}
              </p>
            </Card>
            <Card className="p-8 bg-dark-card border-white/10 card-hover text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 rounded-3xl flex items-center justify-center mb-6 mx-auto">
                <span className="text-4xl">🤖</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">{t('home.solutions.items.smartAutomations.title')}</h3>
              <p className="text-text-secondary leading-relaxed">
                {t('home.solutions.items.smartAutomations.description')}
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              {t('home.values.title')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-scale-in">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 rounded-3xl flex items-center justify-center mb-6 mx-auto">
                <span className="text-3xl">⏰</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">{t('home.values.items.respectTime.title')}</h3>
              <p className="text-text-secondary leading-relaxed">
                {t('home.values.items.respectTime.description')}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 rounded-3xl flex items-center justify-center mb-6 mx-auto">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">{t('home.values.items.keepPractical.title')}</h3>
              <p className="text-text-secondary leading-relaxed">
                {t('home.values.items.keepPractical.description')}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 rounded-3xl flex items-center justify-center mb-6 mx-auto">
                <span className="text-3xl">📈</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">{t('home.values.items.buildImpact.title')}</h3>
              <p className="text-text-secondary leading-relaxed">
                {t('home.values.items.buildImpact.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Client Logo Bar - Updated with lighter background */}
      <section className="py-16 px-6 lg:px-8 bg-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">
              {t('home.clients.title')}
            </h2>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            <div className="flex items-center justify-center h-16 opacity-80 hover:opacity-100 transition-opacity">
              <img 
                src="/lovable-uploads/df1e608e-1eaf-400e-a5ff-dcc7b1c2e147.png" 
                alt="CoffeeDesk" 
                className="max-h-full max-w-32 object-contain filter brightness-110 hover:brightness-125 transition-all" 
              />
            </div>
            <div className="flex items-center justify-center h-16 opacity-80 hover:opacity-100 transition-opacity">
              <img 
                src="/lovable-uploads/151297f0-c6b5-40a4-8af9-3eee4de77ffc.png" 
                alt="Biscuiteers" 
                className="max-h-full max-w-32 object-contain filter brightness-110 hover:brightness-125 transition-all" 
              />
            </div>
            <div className="flex items-center justify-center h-16 opacity-80 hover:opacity-100 transition-opacity">
              <img 
                src="/lovable-uploads/75a928ad-e768-4ae4-befd-90a07fca9f8a.png" 
                alt="WebInsight" 
                className="max-h-full max-w-32 object-contain filter brightness-110 hover:brightness-125 transition-all" 
              />
            </div>
            <div className="flex items-center justify-center h-16 opacity-80 hover:opacity-100 transition-opacity">
              <img 
                src="/lovable-uploads/b3cdf068-a2d8-4b73-bc82-2e33138ede1f.png" 
                alt="WikiLaps" 
                className="max-h-full max-w-32 object-contain filter brightness-110 hover:brightness-125 transition-all" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Client Testimonials */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              {t('home.testimonials.title')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 bg-dark-card border-white/10 text-center">
              <blockquote className="text-lg mb-6 leading-relaxed">
                "{t('home.testimonials.items.quote1')}"
              </blockquote>
              <div className="text-accent-blue font-medium">
                — {t('home.testimonials.items.author1')}
              </div>
            </Card>
            <Card className="p-8 bg-dark-card border-white/10 text-center">
              <blockquote className="text-lg mb-6 leading-relaxed">
                "{t('home.testimonials.items.quote2')}"
              </blockquote>
              <div className="text-accent-blue font-medium">
                — {t('home.testimonials.items.author2')}
              </div>
            </Card>
            <Card className="p-8 bg-dark-card border-white/10 text-center">
              <blockquote className="text-lg mb-6 leading-relaxed">
                "{t('home.testimonials.items.quote3')}"
              </blockquote>
              <div className="text-accent-blue font-medium">
                — {t('home.testimonials.items.author3')}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 lg:px-8 bg-dark-surface">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-8">
            {t('home.finalCta.title')}
          </h2>
          <p className="text-xl text-text-secondary mb-12 leading-relaxed">
            {t('home.finalCta.subtitle')}
          </p>
          <button
            onClick={handleCalendarClick}
            className="apple-button bg-gradient-to-r from-accent-blue to-accent-purple hover:from-accent-blue/90 hover:to-accent-purple/90"
          >
            {t('home.finalCta.cta')}
          </button>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
