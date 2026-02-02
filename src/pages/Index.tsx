
import Layout from '../components/Layout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Zap, LayoutDashboard, FileText } from 'lucide-react';

const IMAGES = {
  hero: 'https://firebasestorage.googleapis.com/v0/b/modified-hull-203004.firebasestorage.app/o/Media%2FSection%201%20%E2%80%93%20Hero.png?alt=media&token=2850f698-5cab-45be-82ae-2767c9c7b681',
  problem: 'https://firebasestorage.googleapis.com/v0/b/modified-hull-203004.firebasestorage.app/o/Media%2FSection%202.png?alt=media&token=ab2e8e7b-edc1-41e9-91b4-5454ba563fff',
  position: 'https://firebasestorage.googleapis.com/v0/b/modified-hull-203004.firebasestorage.app/o/Media%2FSection%203%20%E2%80%93%20Position%20Statement%201.png?alt=media&token=d4327f34-4e4b-4e20-9492-2eaeff858bac',
  focus: 'https://firebasestorage.googleapis.com/v0/b/modified-hull-203004.firebasestorage.app/o/Media%2FSection%204%20%E2%80%93%20Current%20Focus.png?alt=media&token=a9e776aa-bc76-407b-869c-2925e9c391b1',
  home4: 'https://firebasestorage.googleapis.com/v0/b/modified-hull-203004.firebasestorage.app/o/Media%2Fhome%204.jpg?alt=media&token=0cb712c2-ec13-441f-ad43-7440ee27f4e5',
  closing: 'https://firebasestorage.googleapis.com/v0/b/modified-hull-203004.firebasestorage.app/o/Media%2FSection%207%20%E2%80%93%20Closing.png?alt=media&token=4c8c893d-fde0-421a-80ae-b6554f302664',
  engagePerfect: 'https://firebasestorage.googleapis.com/v0/b/modified-hull-203004.firebasestorage.app/o/Media%2FEngPerfect.png?alt=media&token=227cb820-f321-407b-b576-621857cb7966',
  veil: 'https://firebasestorage.googleapis.com/v0/b/modified-hull-203004.firebasestorage.app/o/Media%2FVeil_1-removebg-preview.png?alt=media&token=d003954d-2ace-423a-ab1f-698c1c4451f8',
};

const Index = () => {
  const [isCalendarReady, setIsCalendarReady] = useState(false);
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

    script.onload = () => {
      setTimeout(() => setIsCalendarReady(true), 1000);
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
    try {
      if ((window as unknown as { calendar?: { schedulingButton?: { load: (config: unknown) => void } } }).calendar?.schedulingButton && calendarTargetRef.current) {
        (window as unknown as { calendar: { schedulingButton: { load: (config: unknown) => void } } }).calendar.schedulingButton.load({
          url: 'https://calendar.google.com/calendar/appointments/schedules/AcZssZ0jPSL5lWFs921ITjSqM9lccdsQD0vDmFDY_RErbgAbwLn9gZF4JaB5EMCpN05tR_rebTIPw4EV?gv=true',
          color: '#039BE5',
          label: t('home.hero.cta.primary'),
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

  return (
    <Layout>
      <div ref={calendarTargetRef} className="fixed -top-96 left-0 opacity-0 pointer-events-none" aria-hidden="true" />

      {/* SECTION 1 - HERO — Split layout: content left, image right */}
      <section className="relative min-h-[85vh] flex items-center py-20 md:py-28 px-6 lg:px-8 overflow-hidden">
        {/* Background image with dark overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{ backgroundImage: `url(${IMAGES.hero})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-dark-bg via-dark-bg/95 to-dark-bg/80" />
        <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/[0.05] via-transparent to-accent-purple/[0.05]" />

        <div className="relative max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="text-center lg:text-left">
              <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-8">
                <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-white/5 border border-white/10 text-white/90">
                  {t('home.hero.trustBadges.google')}
                </span>
                <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-accent-purple/10 border border-accent-purple/20 text-accent-purple/90">
                  {t('home.hero.trustBadges.since')}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 tracking-tight text-white">
                {t('home.hero.headline')}
              </h1>
              <p className="text-xl md:text-2xl text-white/80 mb-6 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                {t('home.hero.subheadline')}
              </p>
              <p className="text-base md:text-lg text-accent-blue font-semibold mb-12 max-w-xl mx-auto lg:mx-0">
                {t('home.hero.trustLine')}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
                <button
                  onClick={handleCalendarClick}
                  className="apple-button bg-accent-blue hover:bg-accent-blue/90 shadow-lg shadow-accent-blue/20"
                >
                  {t('home.hero.cta.primary')}
                </button>
                <a
                  href="#offerings"
                  className="px-8 py-4 border-2 border-white/25 text-white font-semibold rounded-2xl hover:bg-white/10 hover:border-accent-purple/50 transition-all duration-300"
                >
                  {t('home.hero.cta.secondary')}
                </a>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <img
                src={IMAGES.hero}
                alt=""
                className="w-full max-w-lg xl:max-w-xl rounded-2xl object-contain shadow-2xl shadow-black/50"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="home-section-divider" />

      {/* SECTION 2 - THE PROBLEM — Liking: human-centric image, visual rhythm */}
      <section className="py-20 md:py-24 px-6 lg:px-8 bg-dark-surface">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center text-white">
            {t('home.problem.title')}
          </h2>
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
            <img
              src={IMAGES.problem}
              alt=""
              className="w-full max-w-md mx-auto md:mx-0 rounded-2xl object-cover shadow-xl order-2 md:order-1"
            />
            <div className="space-y-4 text-lg leading-relaxed order-1 md:order-2">
              <p className="text-white/75">{t('home.problem.body.p1')}</p>
              <p className="text-white/75">{t('home.problem.body.p2')}</p>
              <p className="text-white/75">{t('home.problem.body.p3')}</p>
              <p className="text-white/75">{t('home.problem.body.p4')}</p>
              <p className="text-white font-medium">{t('home.problem.body.p5')}</p>
              <p className="text-white font-medium">{t('home.problem.body.p6')}</p>
              <p className="text-accent-blue font-bold text-xl">{t('home.problem.body.p7')}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="home-section-divider" />

      {/* SECTION 3 - POSITION STATEMENT — Alternate layout: text first, image right */}
      <section className="py-20 md:py-24 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center text-white">
            {t('home.position.title')}
          </h2>
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <p className="text-lg text-white/80 mb-8 leading-relaxed">
                {t('home.position.body')}
              </p>
              <ul className="space-y-4 mb-8 pl-6">
                <li className="flex items-start gap-3 text-lg text-white/80">
                  <span className="text-accent-blue mt-1.5 text-xl">—</span>
                  <span>{t('home.position.bullets.b1')}</span>
                </li>
                <li className="flex items-start gap-3 text-lg text-white/80">
                  <span className="text-accent-blue mt-1.5 text-xl">—</span>
                  <span>{t('home.position.bullets.b2')}</span>
                </li>
                <li className="flex items-start gap-3 text-lg text-white/80">
                  <span className="text-accent-blue mt-1.5 text-xl">—</span>
                  <span>{t('home.position.bullets.b3')}</span>
                </li>
              </ul>
              <p className="text-lg text-accent-purple font-semibold">
                {t('home.position.closing')}
              </p>
            </div>
            <img
              src={IMAGES.position}
              alt=""
              className="w-full max-w-md mx-auto rounded-2xl object-cover shadow-xl"
            />
          </div>
        </div>
      </section>

      <div className="home-section-divider" />

      {/* SECTION 4 - CURRENT FOCUS — Image left, content right */}
      <section className="py-20 md:py-24 px-6 lg:px-8 bg-dark-surface">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center text-white">
            {t('home.focus.title')}
          </h2>
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
            <img
              src={IMAGES.focus}
              alt=""
              className="w-full max-w-md mx-auto md:mx-0 rounded-2xl object-cover shadow-xl order-2 md:order-1"
            />
            <div className="order-1 md:order-2">
              <p className="text-lg text-white/80 mb-8 leading-relaxed">
                {t('home.focus.body')}
              </p>
              <ul className="space-y-4 mb-8 pl-6">
                <li className="flex items-start gap-3 text-lg text-white/80">
                  <span className="text-accent-purple mt-1.5 text-xl">—</span>
                  <span>{t('home.focus.bullets.b1')}</span>
                </li>
                <li className="flex items-start gap-3 text-lg text-white/80">
                  <span className="text-accent-purple mt-1.5 text-xl">—</span>
                  <span>{t('home.focus.bullets.b2')}</span>
                </li>
                <li className="flex items-start gap-3 text-lg text-white/80">
                  <span className="text-accent-purple mt-1.5 text-xl">—</span>
                  <span>{t('home.focus.bullets.b3')}</span>
                </li>
                <li className="flex items-start gap-3 text-lg text-white/80">
                  <span className="text-accent-purple mt-1.5 text-xl">—</span>
                  <span>{t('home.focus.bullets.b4')}</span>
                </li>
              </ul>
              <p className="text-lg text-white font-semibold">
                {t('home.focus.closing')}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="home-section-divider" />

      {/* SECTION 5 - THREE CORE OFFERINGS — Commitment: soft CTA per card */}
      <section id="offerings" className="py-20 md:py-24 px-6 lg:px-8 scroll-mt-24">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center text-white">
            {t('home.offerings.title')}
          </h2>
          <p className="text-center text-white/70 mb-16 max-w-xl mx-auto">
            {t('home.offerings.subtitle')}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="group p-8 bg-dark-card/80 border-white/10 text-center transition-all duration-300 hover:border-accent-blue/40 hover:bg-dark-card hover:shadow-xl hover:shadow-accent-blue/5">
              <div className="w-16 h-16 bg-accent-blue/20 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:bg-accent-blue/30 transition-colors">
                <Zap className="w-8 h-8 text-accent-blue" strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-bold mb-4 text-accent-blue">
                {t('home.offerings.card1.title')}
              </h3>
              <p className="text-white/80 leading-relaxed mb-6">
                {t('home.offerings.card1.outcome')}
              </p>
              <a href="#closing" className="text-sm font-medium text-accent-blue/90 hover:text-accent-blue transition-colors">
                {t('home.offeringsCta')} →
              </a>
            </Card>
            <Card className="group p-8 bg-dark-card/80 border-white/10 text-center transition-all duration-300 hover:border-accent-purple/40 hover:bg-dark-card hover:shadow-xl hover:shadow-accent-purple/5">
              <div className="w-16 h-16 bg-accent-purple/20 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:bg-accent-purple/30 transition-colors">
                <LayoutDashboard className="w-8 h-8 text-accent-purple" strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-bold mb-4 text-accent-purple">
                {t('home.offerings.card2.title')}
              </h3>
              <p className="text-white/80 leading-relaxed mb-6">
                {t('home.offerings.card2.outcome')}
              </p>
              <a href="#closing" className="text-sm font-medium text-accent-purple/90 hover:text-accent-purple transition-colors">
                {t('home.offeringsCta')} →
              </a>
            </Card>
            <Card className="group p-8 bg-dark-card/80 border-white/10 text-center transition-all duration-300 hover:border-accent-blue/40 hover:bg-dark-card hover:shadow-xl hover:shadow-accent-blue/5">
              <div className="w-16 h-16 bg-accent-blue/20 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:bg-accent-blue/30 transition-colors">
                <FileText className="w-8 h-8 text-accent-blue" strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-bold mb-4 text-accent-blue">
                {t('home.offerings.card3.title')}
              </h3>
              <p className="text-white/80 leading-relaxed mb-6">
                {t('home.offerings.card3.outcome')}
              </p>
              <a href="#closing" className="text-sm font-medium text-accent-blue/90 hover:text-accent-blue transition-colors">
                {t('home.offeringsCta')} →
              </a>
            </Card>
          </div>
        </div>
      </section>

      {/* SECTION 5.5 - TESTIMONIALS — Social Proof */}
      <section className="py-20 md:py-24 px-6 lg:px-8 bg-dark-surface">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-12 text-center text-white">
            {t('home.testimonials.title')}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {(['1', '2', '3'] as const).map((i) => (
              <blockquote
                key={i}
                className="relative p-6 rounded-2xl bg-dark-card/60 border border-white/5"
              >
                <p className="text-white/90 leading-relaxed mb-4">
                  &ldquo;{t(`home.testimonials.items.${i}.quote`)}&rdquo;
                </p>
                <footer className="text-sm text-accent-blue/90 font-medium">
                  — {t(`home.testimonials.items.${i}.author`)}
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <div className="home-section-divider" />

      {/* SECTION 6 - BUILT BY NODEMATICS — Authority: products as proof */}
      <section className="py-20 md:py-24 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center text-white">
            {t('home.builtBy.title')}
          </h2>
          <p className="text-lg text-white/80 mb-16 text-center max-w-2xl mx-auto leading-relaxed">
            {t('home.builtBy.intro')}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-8 bg-dark-card border-white/10 hover:border-accent-blue/30 transition-colors">
              <img
                src={IMAGES.engagePerfect}
                alt="EngagePerfect"
                className="h-12 w-auto mb-4 object-contain object-left"
              />
              <p className="text-white/85 mb-6 leading-relaxed">
                {t('home.builtBy.engagePerfect.description')}
              </p>
              <a
                href="https://engageperfect.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-accent-blue font-semibold hover:text-accent-purple transition-colors"
              >
                {t('home.builtBy.engagePerfect.link')}
              </a>
            </Card>
            <Card className="p-8 bg-dark-card border-white/10 hover:border-accent-purple/30 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={IMAGES.veil}
                  alt="Veil"
                  className="h-12 w-auto object-contain object-left"
                />
                <Badge variant="secondary" className="bg-accent-purple/20 text-accent-purple border-accent-purple/30">
                  {t('home.builtBy.veil.badge')}
                </Badge>
              </div>
              <p className="text-white/85 leading-relaxed">
                {t('home.builtBy.veil.description')}
              </p>
            </Card>
          </div>
        </div>
      </section>

      <div className="home-section-divider" />

      {/* SECTION 7 - CLOSING — Commitment & consistency, reciprocity */}
      <section id="closing" className="relative py-24 md:py-32 px-6 lg:px-8 scroll-mt-24 bg-black">
        <div className="absolute inset-0 bg-gradient-to-t from-accent-blue/[0.05] via-transparent to-accent-purple/[0.05] pointer-events-none" aria-hidden="true" />
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-8 text-white">
            {t('home.closing.title')}
          </h2>
          <img
            src={IMAGES.home4}
            alt=""
            className="w-full max-w-2xl mx-auto mb-12 rounded-2xl object-cover shadow-xl"
          />
          <p className="text-xl text-white/85 mb-8 leading-relaxed max-w-3xl mx-auto">
            {t('home.closing.body')}
          </p>
          <p className="text-sm text-white/60 mb-10">
            {t('home.closing.subtext')}
          </p>
          <button
            onClick={handleCalendarClick}
            className="apple-button bg-gradient-to-r from-accent-blue to-accent-purple hover:from-accent-blue/90 hover:to-accent-purple/90 shadow-xl shadow-accent-purple/20"
          >
            {t('home.closing.cta')}
          </button>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
