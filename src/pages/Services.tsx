import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import { Card } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Zap, LayoutDashboard, FileText } from 'lucide-react';

const OFFERING_ICONS = {
  quickWin: Zap,
  operationsControlRoom: LayoutDashboard,
  configurator: FileText,
};

const OFFERING_INCLUDE_KEYS = {
  quickWin: ['emailSheet', 'pdfGenerator', 'driveOrganizer', 'formOnboarding'] as const,
  operationsControlRoom: ['roleTasks', 'statusAudit', 'weeklyReport', 'ownership'] as const,
  configurator: ['validation', 'calculation', 'pdf', 'diagram', 'iterations'] as const,
};

const DELIVERABLE_KEYS = ['sheet', 'script', 'admin', 'bugfix'] as const;

const FAQ_KEYS = ['software', 'data', 'ai'] as const;

const Services = () => {
  const { t } = useTranslation();
  const calendarTargetRef = useRef<HTMLDivElement>(null);

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
      } catch (e) {
        console.log('Cleanup error (expected):', e);
      }
    };
  }, []);

  const handleCalendarClick = () => {
    try {
      if ((window as unknown as { calendar?: { schedulingButton?: { load: (config: unknown) => void } } }).calendar?.schedulingButton && calendarTargetRef.current) {
        (window as unknown as { calendar: { schedulingButton: { load: (config: unknown) => void } } }).calendar.schedulingButton.load({
          url: 'https://calendar.google.com/calendar/appointments/schedules/AcZssZ0jPSL5lWFs921ITjSqM9lccdsQD0vDmFDY_RErbgAbwLn9gZF4JaB5EMCpN05tR_rebTIPw4EV?gv=true',
          color: '#039BE5',
          label: t('services.cta.button'),
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
    } catch (error) {
      console.error('Calendar error:', error);
      window.open(
        'https://calendar.google.com/calendar/appointments/schedules/AcZssZ0jPSL5lWFs921ITjSqM9lccdsQD0vDmFDY_RErbgAbwLn9gZF4JaB5EMCpN05tR_rebTIPw4EV?gv=true',
        'calendar-popup',
        'width=800,height=600,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no'
      );
    }
  };

  type OfferingKey = keyof typeof OFFERING_ICONS;

  return (
    <Layout>
      <div ref={calendarTargetRef} className="fixed -top-96 left-0 opacity-0 pointer-events-none" aria-hidden="true" />

      <PageHeader title={t('services.hero.title')} subtitle={t('services.hero.subtitle')} />

      {/* Three offerings */}
      <section className="py-12 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {(['quickWin', 'operationsControlRoom', 'configurator'] as OfferingKey[]).map((key, index) => {
              const Icon = OFFERING_ICONS[key];
              const base = `services.offerings.${key}`;
              const includeKeys = OFFERING_INCLUDE_KEYS[key];
              const accentClass = index % 2 === 0 ? 'accent-blue' : 'accent-purple';
              return (
                <Card key={key} className="p-8 bg-dark-card border-white/10 card-hover flex flex-col">
                  <div className={`w-12 h-12 ${accentClass === 'accent-blue' ? 'bg-accent-blue/20' : 'bg-accent-purple/20'} rounded-2xl flex items-center justify-center mb-6`}>
                    <Icon className={accentClass === 'accent-blue' ? 'text-accent-blue' : 'text-accent-purple'} size={24} />
                  </div>
                  <h2 className="text-2xl font-semibold mb-2">{t(`${base}.title`)}</h2>
                  <p className="text-sm text-text-secondary/90 mb-4 font-medium">
                    {t(`${base}.timeline`)}
                  </p>
                  <p className="text-text-secondary text-sm mb-2">
                    <span className="font-medium text-white/90">For: </span>
                    {t(`${base}.for`)}
                  </p>
                  <p className="text-text-secondary text-sm mb-4">
                    <span className="font-medium text-white/90">Outcome: </span>
                    {t(`${base}.outcome`)}
                  </p>
                  <p className="text-xs font-medium text-white/80 mb-2">{t(`${base}.includesLabel`)}</p>
                  <ul className="space-y-2 mb-6 flex-grow">
                    {includeKeys.map((includeKey) => (
                      <li key={includeKey} className="flex items-start gap-2 text-sm text-text-secondary">
                        <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${accentClass === 'accent-blue' ? 'bg-accent-blue' : 'bg-accent-purple'}`} />
                        <span>{t(`${base}.includes.${includeKey}`)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-4 border-t border-white/10">
                    <p className="text-white font-medium">{t(`${base}.pricing`)}</p>
                    <p className="text-sm text-text-secondary">{t(`${base}.pricingOptional`)}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 lg:px-8 bg-dark-surface">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">{t('services.process.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="text-center">
              <div className="w-16 h-16 bg-accent-blue/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-accent-blue font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">{t('services.process.steps.timeAudit.title')}</h3>
              <p className="text-text-secondary">{t('services.process.steps.timeAudit.description')}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-accent-purple/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-accent-purple font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">{t('services.process.steps.install.title')}</h3>
              <p className="text-text-secondary">{t('services.process.steps.install.description')}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-accent-blue/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-accent-blue font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">{t('services.process.steps.prove.title')}</h3>
              <p className="text-text-secondary">{t('services.process.steps.prove.description')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Deliverables */}
      <section className="py-16 px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">{t('services.deliverables.title')}</h2>
          <ul className="space-y-4">
            {DELIVERABLE_KEYS.map((key) => (
              <li key={key} className="flex items-center gap-3 text-text-secondary">
                <span className="w-2 h-2 bg-accent-blue rounded-full flex-shrink-0" />
                {t(`services.deliverables.items.${key}`)}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6 lg:px-8 bg-dark-surface">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">{t('services.faq.title')}</h2>
          <Accordion type="single" collapsible className="w-full">
            {FAQ_KEYS.map((key) => (
              <AccordionItem key={key} value={key} className="mb-3 last:mb-0 border border-white/10 rounded-xl bg-dark-card/50 px-5 data-[state=open]:bg-dark-card/70">
                <AccordionTrigger className="text-left text-white hover:no-underline hover:text-accent-blue py-5">
                  {t(`services.faq.items.${key}.question`)}
                </AccordionTrigger>
                <AccordionContent className="text-text-secondary pb-5">
                  {t(`services.faq.items.${key}.answer`)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            <span className="gradient-text">{t('services.cta.primary')}</span>
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleCalendarClick}
              className="apple-button bg-gradient-to-r from-accent-blue to-accent-purple hover:from-accent-blue/90 hover:to-accent-purple/90"
            >
              {t('services.cta.button')}
            </button>
            <Link
              to="/example-systems"
              className="text-accent-blue hover:text-accent-blue/80 font-medium underline underline-offset-4"
            >
              {t('services.cta.secondary')}
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Services;
