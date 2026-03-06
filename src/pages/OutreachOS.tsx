import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';

declare global {
  interface Window {
    jspdf?: { jsPDF: new (opts: object) => PdfDoc };
  }
}

interface PdfDoc {
  addPage(): void;
  setFont(name: string, style: string): void;
  setFontSize(size: number): void;
  setTextColor(r: number, g: number, b: number): void;
  setFillColor(r: number, g: number, b: number): void;
  setDrawColor(r: number, g: number, b: number): void;
  setLineWidth(w: number): void;
  text(text: string | string[], x: number, y: number, opts?: object): void;
  rect(x: number, y: number, w: number, h: number, style: string): void;
  roundedRect(x: number, y: number, w: number, h: number, rx: number, ry: number, style: string): void;
  circle(x: number, y: number, r: number, style: string): void;
  line(x1: number, y1: number, x2: number, y2: number): void;
  splitTextToSize(text: string, maxW: number): string[];
  save(filename: string): void;
}

const JSPDF_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';

function loadJsPDF(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.jspdf) { resolve(); return; }
    const script = document.createElement('script');
    script.src = JSPDF_CDN;
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function generatePDF() {
  loadJsPDF().then(() => {
    if (!window.jspdf) return;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const W = 210;
    const margin = 24;
    const contentW = W - margin * 2;
    const blue: [number, number, number] = [59, 130, 246];
    const navy: [number, number, number] = [15, 23, 42];
    const dark: [number, number, number] = [30, 41, 59];
    const grey: [number, number, number] = [100, 116, 139];
    const lightGrey: [number, number, number] = [248, 250, 252];
    const midGrey: [number, number, number] = [148, 163, 184];

    const sf = (style: string, size: number, color?: [number, number, number]) => {
      doc.setFont('helvetica', style);
      doc.setFontSize(size);
      if (color) doc.setTextColor(color[0], color[1], color[2]);
    };

    const fillRect = (x: number, y: number, w: number, h: number, r: number, c: [number, number, number]) => {
      doc.setFillColor(c[0], c[1], c[2]);
      if (r) doc.roundedRect(x, y, w, h, r, r, 'F');
      else doc.rect(x, y, w, h, 'F');
    };

    const header = (label: string) => {
      fillRect(0, 0, W, 12, 0, navy);
      sf('normal', 9, [255, 255, 255]);
      doc.text(label, margin, 8.5);
    };

    // PAGE 1 — COVER
    fillRect(0, 0, W, 297, 0, navy);
    doc.setFillColor(59, 130, 246); doc.rect(0, 0, W / 2, 6, 'F');
    doc.setFillColor(139, 92, 246); doc.rect(W / 2, 0, W / 2, 6, 'F');
    sf('bold', 11, [255, 255, 255]); doc.text('NodeMatics', margin, 36);
    sf('bold', 48, [255, 255, 255]); doc.text('OutreachOS', margin, 110);
    sf('normal', 14, midGrey);
    doc.text('Automated B2B Outreach', margin, 125);
    doc.text('Built Inside Google Workspace', margin, 134);
    doc.setDrawColor(59, 130, 246); doc.setLineWidth(0.5);
    doc.line(margin, 144, margin + 60, 144);
    sf('normal', 12, midGrey); doc.text('Find prospects. Write emails. Fill your pipeline.', margin, 158);
    sf('bold', 12, [255, 255, 255]); doc.text('Automatically.', margin, 168);
    sf('normal', 9, grey); doc.text('A NodeMatics Product', margin, 270); doc.text('nodematics.com', margin, 278);

    // PAGE 2 — THE PROBLEM
    doc.addPage(); header('OutreachOS Introduction');
    sf('bold', 24, dark); doc.text('Why most B2B outreach fails', margin, 36);
    doc.setDrawColor(blue[0], blue[1], blue[2]); doc.setLineWidth(0.4); doc.line(margin, 40, margin + 40, 40);
    const p2body = 'Manual outreach doesn\'t scale. Blast campaigns don\'t convert. Most consultants and small agencies are stuck choosing between spending hours researching and writing individual emails, or sending robotic bulk messages that get ignored or flagged as spam.\n\nOutreachOS solves both problems simultaneously — delivering genuine personalisation at consistent volume, running automatically in the background every day.';
    sf('normal', 11, dark); doc.text(doc.splitTextToSize(p2body, contentW), margin, 54);
    const boxY = 110;
    fillRect(margin, boxY, contentW / 2 - 6, 52, 4, [255, 251, 240]);
    doc.setDrawColor(245, 158, 11); doc.setLineWidth(0.8); doc.line(margin, boxY, margin, boxY + 52);
    sf('bold', 12, dark); doc.text('Too Manual', margin + 6, boxY + 12);
    sf('normal', 9.5, grey); doc.text(doc.splitTextToSize('Hours of research. Individual emails. Tracking who you contacted. A second job that still doesn\'t scale.', contentW / 2 - 16), margin + 6, boxY + 22);
    const box2X = margin + contentW / 2 + 6;
    fillRect(box2X, boxY, contentW / 2 - 6, 52, 4, [255, 251, 240]);
    doc.setDrawColor(245, 158, 11); doc.line(box2X, boxY, box2X, boxY + 52);
    sf('bold', 12, dark); doc.text('Too Robotic', box2X + 6, boxY + 12);
    sf('normal', 9.5, grey); doc.text(doc.splitTextToSize('Blast campaigns ignored or flagged as spam. Prospects know it\'s a template. Reply rates collapse.', contentW / 2 - 16), box2X + 6, boxY + 22);
    sf('bold', 13, dark); doc.text('OutreachOS solves both. Volume AND personalisation. Automatically.', margin, 178);

    // PAGE 3 — WHAT IT DOES
    doc.addPage(); header('OutreachOS Introduction');
    sf('bold', 24, dark); doc.text('Six things OutreachOS does every day', margin, 36);
    doc.setDrawColor(blue[0], blue[1], blue[2]); doc.setLineWidth(0.4); doc.line(margin, 40, margin + 40, 40);
    const caps = [
      { num: '1', title: 'Finds Prospects', desc: 'Runs targeted searches by job title, industry, and location — automatically cycling through your ideal customer profile combinations.' },
      { num: '2', title: 'Enriches Each Lead', desc: 'Captures name, company, role, and LinkedIn URL for every prospect found — no manual research required.' },
      { num: '3', title: 'Writes Personalised Emails', desc: 'Uses AI to write a unique email for each prospect. Not a template with a name swapped in — a genuinely tailored message.' },
      { num: '4', title: 'Sends via Gmail or Zoho Mail', desc: 'Emails go out from your own dedicated business address — via Gmail or Zoho Mail. Your domain, your reputation, fully under your control.' },
      { num: '5', title: 'Drafts LinkedIn DMs', desc: 'Generates a matching LinkedIn message for each prospect — ready for your 10-minute daily queue.' },
      { num: '6', title: 'Logs Everything', desc: 'Every prospect, email, status, and reply date tracked automatically in your Google Sheet control room.' },
    ];
    caps.forEach((cap, i) => {
      const col = i % 2; const row = Math.floor(i / 2);
      const cx = margin + col * (contentW / 2 + 6); const cy = 52 + row * 40; const cw = contentW / 2 - 3;
      fillRect(cx, cy, cw, 36, 3, lightGrey);
      sf('bold', 16, blue); doc.text(cap.num, cx + 6, cy + 13);
      sf('bold', 10, dark); doc.text(cap.title, cx + 18, cy + 12);
      sf('normal', 8.5, grey); doc.text(doc.splitTextToSize(cap.desc, cw - 22), cx + 18, cy + 20);
    });

    // PAGE 4 — NUMBERS
    doc.addPage();
    fillRect(0, 0, W, 297, 0, navy);
    doc.setFillColor(59, 130, 246); doc.rect(0, 0, W / 2, 6, 'F');
    doc.setFillColor(139, 92, 246); doc.rect(W / 2, 0, W / 2, 6, 'F');
    sf('bold', 24, [255, 255, 255]); doc.text('What to expect in 30 days', margin, 36);
    doc.setDrawColor(blue[0], blue[1], blue[2]); doc.setLineWidth(0.4); doc.line(margin, 40, margin + 40, 40);
    const stats = [
      { value: '450+', label: 'email touches sent per month' },
      { value: '240+', label: 'LinkedIn DM drafts generated' },
      { value: '~10 min', label: 'of daily effort (reviewing LinkedIn queue)' },
      { value: 'YOUR account', label: 'Runs inside your own Google account' },
      { value: '\u00A30/month', label: 'Zero monthly subscription fees' },
    ];
    let sy = 56;
    stats.forEach(s => {
      sf('bold', 22, blue as [number, number, number]); doc.text(s.value, margin, sy);
      sf('normal', 11, midGrey); doc.text(s.label, margin + 52, sy);
      doc.setDrawColor(30, 41, 59); doc.setLineWidth(0.2); doc.line(margin, sy + 4, W - margin, sy + 4);
      sy += 26;
    });
    sf('normal', 9, grey); doc.text('Based on standard ICP configuration with 15 prospects per daily batch.', margin, sy + 10);

    // PAGE 5 — WHO IT'S FOR
    doc.addPage(); header('OutreachOS Introduction');
    sf('bold', 24, dark); doc.text('Is OutreachOS right for you?', margin, 36);
    doc.setDrawColor(blue[0], blue[1], blue[2]); doc.setLineWidth(0.4); doc.line(margin, 40, margin + 40, 40);
    sf('bold', 13, [16, 185, 129]); doc.text('OutreachOS is for you if...', margin, 52);
    const forItems = ['You sell B2B services worth \u00A33,000 or more per deal', 'You\'re a solo consultant, fractional executive, or run a 1-5 person agency', 'You use Gmail and Google Workspace already', 'You want consistent outreach without hiring a VA or SDR', 'You\'re tired of paying \u00A3300+/month for tools that still need a team to run', 'You want to own your system \u2014 not rent it'];
    let fy = 62;
    forItems.forEach(item => {
      doc.setFillColor(16, 185, 129); doc.circle(margin + 2.5, fy - 1.5, 2.5, 'F');
      sf('normal', 10.5, dark);
      const lines = doc.splitTextToSize(item, contentW - 14);
      doc.text(lines, margin + 9, fy);
      fy += lines.length > 1 ? 14 : 11;
    });
    fillRect(margin, fy + 4, contentW, 44, 4, lightGrey);
    sf('bold', 11, grey); doc.text('Not for you if:', margin + 8, fy + 16);
    sf('normal', 10, grey);
    ['X  You sell B2C products', 'X  You need to send 1,000+ emails per day', 'X  You want a fully managed service (see NodeMatics Done-For-You)'].forEach((item, i) => {
      doc.text(item, margin + 8, fy + 26 + i * 10);
    });

    // PAGE 6 — PRICING
    doc.addPage(); header('OutreachOS Introduction');
    sf('bold', 24, dark); doc.text('Three ways to get OutreachOS', margin, 36);
    doc.setDrawColor(blue[0], blue[1], blue[2]); doc.setLineWidth(0.4); doc.line(margin, 40, margin + 40, 40);
    sf('normal', 10, grey); doc.text('No subscriptions. No lock-in. You own everything.', margin, 50);
    const tiers = [
      { name: 'Self-Install', price: '\u00A3397', term: 'one-time', items: ['Complete OutreachOS system files', 'Step-by-step deployment guide', 'Setup walkthrough video', '14-day bug-fix support'] },
      { name: 'Done-With-You', price: '\u00A3797', term: 'one-time (most popular)', items: ['Everything in Self-Install', '90-minute Zoom setup session', 'We configure your ICP live with you', 'Campaign live before session ends'] },
      { name: 'Done-For-You', price: '\u00A31,497', term: 'one-time', items: ['Everything in Done-With-You', 'NodeMatics installs and configures everything', 'Campaign running before handover', '30-day priority support'] },
    ];
    let ty = 60;
    tiers.forEach(tier => {
      const featured = tier.name === 'Done-With-You';
      fillRect(margin, ty, contentW, 50, 4, featured ? [239, 246, 255] : lightGrey);
      if (featured) { doc.setDrawColor(59, 130, 246); doc.setLineWidth(0.8); doc.roundedRect(margin, ty, contentW, 50, 4, 4, 'S'); }
      sf('bold', 14, featured ? blue : dark); doc.text(tier.name, margin + 8, ty + 13);
      sf('bold', 18, dark); doc.text(tier.price, margin + contentW - 30, ty + 13);
      sf('normal', 8, grey); doc.text(tier.term, margin + 8, ty + 21);
      sf('normal', 9, grey);
      tier.items.forEach((item, i) => { doc.text('\u2022 ' + item, margin + 8, ty + 29 + i * 7); });
      ty += 56;
    });
    sf('normal', 9, grey); doc.text(doc.splitTextToSize('Optional: Monthly maintenance & optimisation \u2014 \u00A397/month (priority fixes, quarterly review, WhatsApp support)', contentW), margin, ty + 4);
    sf('bold', 10, dark); doc.text('To get started, visit nodematics.com/outreachos or email hello@nodematics.com', margin, ty + 22);

    // PAGE 7 — CLOSING
    doc.addPage();
    fillRect(0, 0, W, 297, 0, navy);
    doc.setFillColor(59, 130, 246); doc.rect(0, 0, W / 2, 6, 'F');
    doc.setFillColor(139, 92, 246); doc.rect(W / 2, 0, W / 2, 6, 'F');
    sf('bold', 28, [255, 255, 255]); doc.text('Built by NodeMatics', margin, 60);
    doc.setDrawColor(blue[0], blue[1], blue[2]); doc.setLineWidth(0.5); doc.line(margin, 66, margin + 50, 66);
    sf('normal', 12, midGrey);
    const c1 = doc.splitTextToSize('NodeMatics designs and installs time-saving systems inside Google Workspace. No SaaS. No lock-in. You own the system in your Drive.', contentW);
    doc.text(c1, margin, 80);
    const c2 = doc.splitTextToSize('OutreachOS is one example of a solution that proved repeatable enough to become a product.', contentW);
    doc.text(c2, margin, 80 + c1.length * 7 + 6);
    sf('normal', 10, grey); doc.text('nodematics.com', margin, 260); doc.text('\u00A9 2026 NodeMatics', margin, 270);

    doc.save('OutreachOS_Introduction.pdf');
  }).catch(() => alert('PDF library failed to load. Please check your internet connection.'));
}

const FEATURE_KEYS = ['1', '2', '3', '4', '5', '6'] as const;
const TIER_KEYS = ['selfInstall', 'doneWithYou', 'doneForYou'] as const;
const TIER_ITEM_KEYS = ['1', '2', '3', '4'] as const;
const PRICING_FEATURED: Record<string, boolean> = { selfInstall: false, doneWithYou: true, doneForYou: false };

const OutreachOS = () => {
  const { t } = useTranslation();

  const STATS_KEYS = ['emails', 'linkedin', 'effort', 'fees'] as const;
  const FOR_ITEM_KEYS = ['1', '2', '3', '4', '5', '6'] as const;
  const NOT_FOR_KEYS = ['1', '2', '3'] as const;

  return (
    <Layout>
      <PageHeader
        title={t('outreachOSPage.hero.title')}
        subtitle={t('outreachOSPage.hero.subtitle')}
      />

      {/* ======== PROOF BADGES + CTAs ======== */}
      <section className="py-8 px-6 lg:px-8 bg-dark-surface">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {(['emails', 'effort', 'payment', 'account'] as const).map(key => (
              <span key={key} className="px-4 py-1.5 rounded-full text-sm font-semibold bg-accent-blue/10 border border-accent-blue/25 text-white/90">
                {t(`outreachOSPage.badges.${key}`)}
              </span>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#pricing" className="apple-button bg-accent-blue hover:bg-accent-blue/90 shadow-lg shadow-accent-blue/20">
              {t('outreachOSPage.cta.get')}
            </a>
            <button
              onClick={generatePDF}
              className="px-8 py-4 border-2 border-white/25 text-white font-semibold rounded-2xl hover:bg-white/10 hover:border-accent-purple/50 transition-all duration-300"
            >
              {t('outreachOSPage.cta.download')}
            </button>
          </div>
        </div>
      </section>

      {/* ======== PROBLEM ======== */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-white">
            {t('outreachOSPage.problem.title')}
          </h2>
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {(['tooManual', 'tooRobotic'] as const).map(key => (
              <Card key={key} className="p-8 bg-dark-card border-l-4 border-l-amber-500 border-t-white/10 border-r-white/10 border-b-white/10">
                <h3 className="text-xl font-bold text-white mb-3">{t(`outreachOSPage.problem.${key}.title`)}</h3>
                <p className="text-text-secondary leading-relaxed">{t(`outreachOSPage.problem.${key}.body`)}</p>
              </Card>
            ))}
          </div>
          <p className="text-center text-xl font-bold text-white">
            {t('outreachOSPage.problem.solution')}
          </p>
        </div>
      </section>

      {/* ======== HOW IT WORKS ======== */}
      <section id="how-it-works" className="py-20 px-6 lg:px-8 bg-dark-surface scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-white">
            {t('outreachOSPage.howItWorks.title')}
          </h2>
          <p className="text-center text-text-secondary mb-16">{t('outreachOSPage.howItWorks.subtitle')}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURE_KEYS.map(n => (
              <Card key={n} className="p-6 bg-dark-card border-white/10 card-hover">
                <div className="text-4xl font-black text-accent-blue leading-none mb-3">{n}</div>
                <h3 className="text-base font-bold text-white mb-2">{t(`outreachOSPage.howItWorks.features.${n}.title`)}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{t(`outreachOSPage.howItWorks.features.${n}.desc`)}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ======== NUMBERS ======== */}
      <section id="numbers" className="py-20 px-6 lg:px-8 scroll-mt-20">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-16 text-white">
            {t('outreachOSPage.numbers.title')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            {STATS_KEYS.map(key => (
              <div key={key}>
                <div className="text-4xl md:text-5xl font-black text-white mb-2">{t(`outreachOSPage.numbers.stats.${key}.value`)}</div>
                <div className="text-xs text-text-secondary uppercase tracking-wide font-medium">{t(`outreachOSPage.numbers.stats.${key}.label`)}</div>
              </div>
            ))}
          </div>
          <p className="text-sm text-text-secondary">{t('outreachOSPage.numbers.disclaimer')}</p>
        </div>
      </section>

      {/* ======== WHO IT'S FOR ======== */}
      <section id="who-its-for" className="py-20 px-6 lg:px-8 bg-dark-surface scroll-mt-20">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-white">
            {t('outreachOSPage.whoItsFor.title')}
          </h2>
          <ul className="space-y-4 mb-10">
            {FOR_ITEM_KEYS.map(key => (
              <li key={key} className="flex items-start gap-3 text-white font-medium">
                <span className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                {t(`outreachOSPage.whoItsFor.items.${key}`)}
              </li>
            ))}
          </ul>
          <Card className="p-6 bg-dark-card border-white/10">
            <p className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-4">{t('outreachOSPage.whoItsFor.notForLabel')}</p>
            <ul className="space-y-2">
              {NOT_FOR_KEYS.map(key => (
                <li key={key} className="flex items-start gap-3 text-sm text-text-secondary">
                  <span className="font-bold text-white/40">✗</span>{t(`outreachOSPage.whoItsFor.notFor.${key}`)}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>

      {/* ======== PRICING ======== */}
      <section id="pricing" className="py-20 px-6 lg:px-8 scroll-mt-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-3 text-white">
            {t('outreachOSPage.pricing.title')}
          </h2>
          <p className="text-center text-text-secondary mb-16">{t('outreachOSPage.pricing.subtitle')}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start mb-8">
            {TIER_KEYS.map(tierKey => {
              const featured = PRICING_FEATURED[tierKey];
              return (
                <Card
                  key={tierKey}
                  className={`p-8 flex flex-col relative ${
                    featured
                      ? 'bg-dark-card border-accent-blue/60 shadow-xl shadow-accent-blue/10 scale-[1.03]'
                      : 'bg-dark-card border-white/10'
                  }`}
                >
                  {featured && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent-blue text-white text-xs px-3 py-1 rounded-full">
                      {t('outreachOSPage.pricing.mostPopular')}
                    </Badge>
                  )}
                  <h3 className="text-lg font-bold text-white mb-2">{t(`outreachOSPage.pricing.tiers.${tierKey}.name`)}</h3>
                  <div className="text-4xl font-black text-white mb-1">{t(`outreachOSPage.pricing.tiers.${tierKey}.price`)}</div>
                  <div className="text-xs text-text-secondary mb-6">{t('outreachOSPage.pricing.oneTimePayment')}</div>
                  <ul className="space-y-2.5 mb-8 flex-grow">
                    {TIER_ITEM_KEYS.map(itemKey => (
                      <li key={itemKey} className="flex items-start gap-2.5 text-sm text-text-secondary">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-blue flex-shrink-0 mt-1.5" />
                        {t(`outreachOSPage.pricing.tiers.${tierKey}.items.${itemKey}`)}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/contact"
                    className={`text-center py-3 px-6 rounded-xl text-sm font-bold transition-all duration-200 ${
                      featured
                        ? 'bg-accent-blue text-white hover:bg-accent-blue/90'
                        : 'border border-accent-blue text-accent-blue hover:bg-accent-blue/10'
                    }`}
                  >
                    {t(`outreachOSPage.pricing.tiers.${tierKey}.cta`)}
                  </Link>
                </Card>
              );
            })}
          </div>

          <p className="text-center text-sm text-text-secondary">
            {t('outreachOSPage.pricing.optional')}
          </p>
        </div>
      </section>

      {/* ======== DOWNLOAD CTA ======== */}
      <section id="download" className="py-20 px-6 lg:px-8 bg-dark-surface scroll-mt-20">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {t('outreachOSPage.downloadCta.title')}
          </h2>
          <p className="text-text-secondary mb-10 leading-relaxed">
            {t('outreachOSPage.downloadCta.subtitle')}
          </p>
          <button
            onClick={generatePDF}
            className="apple-button bg-green-500 hover:bg-green-600 shadow-lg shadow-green-500/20 w-full sm:w-auto"
          >
            {t('outreachOSPage.downloadCta.button')}
          </button>
          <p className="text-xs text-text-secondary mt-4">{t('outreachOSPage.downloadCta.footnote')}</p>
        </div>
      </section>

    </Layout>
  );
};

export default OutreachOS;
