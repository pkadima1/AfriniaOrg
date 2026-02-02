import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const About = () => {
  const calendarTargetRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://calendar.google.com/calendar/scheduling-button-script.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://calendar.google.com/calendar/scheduling-button-script.js';
    script.async = true;

    script.onload = () => {};

    script.onerror = () => {
      console.error('Failed to load Google Calendar script');
    };

    document.head.appendChild(script);

    return () => {
      try {
        document.head.removeChild(link);
        document.head.removeChild(script);
      } catch {
        // Expected on unmount
      }
    };
  }, []);

  const handleCalendarClick = () => {
    try {
      const calendar = (window as unknown as { calendar?: { schedulingButton?: { load: (config: unknown) => void } } }).calendar;
      if (calendar?.schedulingButton && calendarTargetRef.current) {
        calendar.schedulingButton.load({
          url: 'https://calendar.google.com/calendar/appointments/schedules/AcZssZ0jPSL5lWFs921ITjSqM9lccdsQD0vDmFDY_RErbgAbwLn9gZF4JaB5EMCpN05tR_rebTIPw4EV?gv=true',
          color: '#039BE5',
          label: 'Start with a Time Audit',
          target: calendarTargetRef.current
        });

        setTimeout(() => {
          const googleButton = calendarTargetRef.current?.querySelector('button');
          if (googleButton) {
            googleButton.click();
          } else {
            window.open(
              'https://calendar.google.com/calendar/appointments/schedules/AcZssZ0jPSL5lWFs921ITjSqM9lccdsQD0vDmFDY_RErbgAbwLn9gZF4JaB5EMCpN05tR_rebTIPw4EV?gv=true',
              'calendar-popup',
              'width=800,height=600,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no'
            );
          }
        }, 500);
      } else {
        window.open(
          'https://calendar.google.com/calendar/appointments/schedules/AcZssZ0jPSL5lWFs921ITjSqM9lccdsQD0vDmFDY_RErbgAbwLn9gZF4JaB5EMCpN05tR_rebTIPw4EV?gv=true',
          'calendar-popup',
          'width=800,height=600,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no'
        );
      }
    } catch {
      window.open(
        'https://calendar.google.com/calendar/appointments/schedules/AcZssZ0jPSL5lWFs921ITjSqM9lccdsQD0vDmFDY_RErbgAbwLn9gZF4JaB5EMCpN05tR_rebTIPw4EV?gv=true',
        'calendar-popup',
        'width=800,height=600,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no'
      );
    }
  };

  const manifestoKeys = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8'] as const;

  return (
    <Layout>
      <div ref={calendarTargetRef} className="fixed -top-96 left-0 opacity-0 pointer-events-none" aria-hidden="true" />

      <article className="min-h-screen bg-dark-bg">
        <PageHeader title={t('about.opening.title')} subtitle={t('about.opening.subtitle')} />

        {/* Manifesto — philosophy dominates */}
        <section className="py-16 md:py-24 px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="space-y-12">
              {manifestoKeys.map((key, index) => (
                <p
                  key={key}
                  className="text-lg md:text-xl leading-relaxed text-white font-normal animate-fade-in"
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  {t(`about.opening.manifesto.${key}`)}
                </p>
              ))}
            </div>
          </div>
        </section>

        <div className="home-section-divider" />

        {/* Section 2 — What NodeMatics Does */}
        <section className="py-16 md:py-20 px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">
              {t('about.whatWeDo.title')}
            </h2>
            <p className="text-lg leading-relaxed text-white/85 mb-10">
              {t('about.whatWeDo.body')}
            </p>
            <ul className="space-y-3 text-white/75">
              <li className="flex items-start gap-3">
                <span className="text-accent-blue mt-1">—</span>
                <span>{t('about.whatWeDo.notDo.item1')}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent-blue mt-1">—</span>
                <span>{t('about.whatWeDo.notDo.item2')}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent-blue mt-1">—</span>
                <span>{t('about.whatWeDo.notDo.item3')}</span>
              </li>
            </ul>
          </div>
        </section>

        <div className="home-section-divider" />

        {/* Section 3 — Products as Consequence */}
        <section className="py-16 md:py-20 px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">
              {t('about.products.title')}
            </h2>
            <p className="text-lg leading-relaxed text-white/85">
              {t('about.products.body')}
            </p>
          </div>
        </section>

        <div className="home-section-divider" />

        {/* Section 4 — Founders (low power, supporting role) */}
        <section className="py-12 md:py-16 px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <p className="text-sm uppercase tracking-wider text-text-secondary mb-8">
              {t('about.founders.intro')}
            </p>
            <div className="flex flex-col sm:flex-row gap-10 sm:gap-12">
              <div className="flex gap-4">
                <img
                  src="/lovable-uploads/f77d9966-f5a3-4c77-bb28-46fb6285448b.png"
                  alt={t('about.founders.patrick.name')}
                  className="w-12 h-12 rounded-full object-cover flex-shrink-0 opacity-85"
                />
                <div>
                  <p className="text-white font-medium text-base">
                    {t('about.founders.patrick.name')}
                    <span className="text-text-secondary font-normal ml-1.5">— {t('about.founders.patrick.role')}</span>
                  </p>
                  <p className="text-text-secondary text-sm mt-1 leading-relaxed">
                    {t('about.founders.patrick.bio')}
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <img
                  src="/lovable-uploads/1fb7ed00-84e5-45f2-b0f7-f978ebd3578b.png"
                  alt={t('about.founders.sunita.name')}
                  className="w-12 h-12 rounded-full object-cover flex-shrink-0 opacity-85"
                />
                <div>
                  <p className="text-white font-medium text-base">
                    {t('about.founders.sunita.name')}
                    <span className="text-text-secondary font-normal ml-1.5">— {t('about.founders.sunita.role')}</span>
                  </p>
                  <p className="text-text-secondary text-sm mt-1 leading-relaxed">
                    {t('about.founders.sunita.bio')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="home-section-divider" />

        {/* Section 5 — Closing Statement */}
        <section className="py-16 md:py-20 px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-2xl md:text-3xl leading-relaxed text-white font-medium">
              {t('about.closing.line1')}
            </p>
            <p className="text-xl md:text-2xl text-text-secondary font-normal mt-4">
              {t('about.closing.line2')}
            </p>
          </div>
        </section>

        {/* CTA — only one */}
        <section className="py-16 px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <button
              onClick={handleCalendarClick}
              className="apple-button bg-gradient-to-r from-accent-blue to-accent-purple hover:from-accent-blue/90 hover:to-accent-purple/90 text-white font-semibold px-10 py-4 rounded-2xl text-lg"
            >
              {t('about.cta')}
            </button>
          </div>
        </section>
      </article>
    </Layout>
  );
};

export default About;
