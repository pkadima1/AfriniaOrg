import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

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
    sf('normal', 11, dark);
    const p2body = 'Manual outreach doesn\'t scale. Blast campaigns don\'t convert. Most consultants and small agencies are stuck choosing between spending hours researching and writing individual emails, or sending robotic bulk messages that get ignored or flagged as spam.\n\nOutreachOS solves both problems simultaneously — delivering genuine personalisation at consistent volume, running automatically in the background every day.';
    doc.text(doc.splitTextToSize(p2body, contentW), margin, 54);
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

// ---- SPARK ICON SVG ----
const SparkIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <circle cx="16" cy="16" r="16" fill="#0F172A" />
    <path d="M16 4L17.5 13.5L26 10L19.5 17L28 18.5L19.5 20L26 26L17.5 19.5L16 28L14.5 19.5L6 26L12.5 20L4 18.5L12.5 17L6 10L14.5 13.5L16 4Z" fill="url(#spark-o)" />
    <defs>
      <linearGradient id="spark-o" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
        <stop stopColor="#3B82F6" /><stop offset="1" stopColor="#8B5CF6" />
      </linearGradient>
    </defs>
  </svg>
);

// ---- CHECK ICON ----
const CheckIcon = () => (
  <span style={{ width: 22, height: 22, background: '#10B981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </span>
);

const OutreachOS = () => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = 'OutreachOS — Automated B2B Outreach by NodeMatics';
    return () => { document.title = 'NodeMatics'; };
  }, []);

  const toggleMenu = () => {
    menuRef.current?.classList.toggle('open');
  };

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", WebkitFontSmoothing: 'antialiased' }}>

      {/* ======== NAV ======== */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, background: 'rgba(15,23,42,0.96)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <SparkIcon />
            <span style={{ fontSize: 18, fontWeight: 700, background: 'linear-gradient(135deg,#3B82F6,#8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.3px' }}>NodeMatics</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }} className="outreach-desktop-nav">
            {[['/', 'Home'], ['/products', 'Products'], ['/services', 'Services'], ['/contact', 'Contact']].map(([href, label]) => (
              <Link key={href} to={href} style={{ color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>{label}</Link>
            ))}
          </div>
          <a href="#pricing" style={{ background: '#3B82F6', color: '#fff', border: 'none', padding: '10px 22px', borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }} className="outreach-desktop-nav">
            Get OutreachOS
          </a>
          <button onClick={toggleMenu} style={{ display: 'none', flexDirection: 'column', gap: 5, cursor: 'pointer', padding: 4, background: 'none', border: 'none' }} className="outreach-hamburger" aria-label="Open menu">
            <span style={{ display: 'block', width: 24, height: 2, background: '#fff', borderRadius: 2 }} />
            <span style={{ display: 'block', width: 24, height: 2, background: '#fff', borderRadius: 2 }} />
            <span style={{ display: 'block', width: 24, height: 2, background: '#fff', borderRadius: 2 }} />
          </button>
        </div>
        <div ref={menuRef} style={{ background: '#0F172A', borderTop: '1px solid rgba(255,255,255,0.08)', padding: '0 24px', maxHeight: 0, overflow: 'hidden', transition: 'max-height 0.3s ease' }} className="outreach-mobile-menu">
          {[['/', 'Home'], ['/products', 'Products'], ['/services', 'Services'], ['/contact', 'Contact']].map(([href, label]) => (
            <Link key={href} to={href} style={{ display: 'block', padding: '12px 0', color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontSize: 15, fontWeight: 500, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{label}</Link>
          ))}
          <a href="#pricing" style={{ display: 'inline-block', marginTop: 16, marginBottom: 16, background: '#3B82F6', color: '#fff', padding: '10px 22px', borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>Get OutreachOS</a>
        </div>
      </nav>

      <style>{`
        @media (max-width: 640px) {
          .outreach-desktop-nav { display: none !important; }
          .outreach-hamburger { display: flex !important; }
        }
        .outreach-mobile-menu.open { max-height: 320px !important; }
        .outreach-section-divider { height: 1px; background: rgba(0,0,0,0.06); }
        html { scroll-behavior: smooth; }
      `}</style>

      {/* ======== HERO ======== */}
      <section id="hero" style={{ background: '#0F172A', padding: 'clamp(80px,12vw,120px) 24px 80px', textAlign: 'center', scrollMarginTop: 68 }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h1 style={{ fontSize: 'clamp(2.2rem,6vw,3.8rem)', fontWeight: 800, color: '#fff', lineHeight: 1.15, letterSpacing: '-1px', marginBottom: 24 }}>
            Your outreach runs while you sleep.
          </h1>
          <p style={{ fontSize: 'clamp(1rem,2.5vw,1.2rem)', color: '#94A3B8', maxWidth: 640, margin: '0 auto 32px', lineHeight: 1.7 }}>
            OutreachOS finds your prospects, writes personalised emails, and fills your pipeline — automatically. Runs in your Google account. One payment. No subscriptions.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 40 }}>
            {['✦ 450+ emails/month', '✦ ~10 min daily effort', '✦ One-time payment'].map(b => (
              <span key={b} style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)', color: 'rgba(255,255,255,0.9)', padding: '8px 18px', borderRadius: 50, fontSize: 13, fontWeight: 600 }}>{b}</span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#pricing" style={{ background: '#3B82F6', color: '#fff', padding: '16px 32px', borderRadius: 12, fontSize: 16, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 20px rgba(59,130,246,0.35)' }}>
              Get OutreachOS
            </a>
            <button onClick={generatePDF} style={{ background: 'transparent', color: '#fff', border: '2px solid rgba(255,255,255,0.35)', padding: '14px 30px', borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: 'pointer' }}>
              Download the Introduction
            </button>
          </div>
        </div>
      </section>

      {/* ======== PROBLEM ======== */}
      <section id="problem" style={{ background: '#fff', padding: '96px 24px', scrollMarginTop: 68 }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 800, color: '#1E293B', textAlign: 'center', marginBottom: 56, letterSpacing: '-0.5px' }}>
            Most outreach fails for one of two reasons.
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 28, marginBottom: 48 }}>
            {[
              { title: 'Too manual', body: 'You spend hours researching prospects, writing individual emails, tracking who you contacted. It\'s a second job. And it still doesn\'t scale.' },
              { title: 'Too robotic', body: 'Blast campaigns get ignored or flagged as spam. Prospects can tell it\'s a template. Your reply rate collapses. Your domain reputation suffers.' },
            ].map(c => (
              <div key={c.title} style={{ borderLeft: '4px solid #F59E0B', padding: '28px 28px 28px 24px', background: '#FFFBF0', borderRadius: '0 12px 12px 0' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1E293B', marginBottom: 12 }}>{c.title}</h3>
                <p style={{ color: '#64748B', lineHeight: 1.7, fontSize: '0.95rem' }}>{c.body}</p>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', fontSize: '1.15rem', fontWeight: 700, color: '#1E293B' }}>
            OutreachOS solves both. Volume AND personalisation. Automatically.
          </p>
        </div>
      </section>

      <div className="outreach-section-divider" />

      {/* ======== HOW IT WORKS ======== */}
      <section id="how-it-works" style={{ background: '#F8FAFC', padding: '96px 24px', scrollMarginTop: 68 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 800, color: '#1E293B', textAlign: 'center', marginBottom: 12, letterSpacing: '-0.5px' }}>
            Six things OutreachOS does every day.
          </h2>
          <p style={{ textAlign: 'center', color: '#64748B', marginBottom: 56, fontSize: '1rem' }}>
            All inside your Google account. Nothing leaves your Drive.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 24 }}>
            {[
              { n: '1', title: 'Finds Prospects', desc: 'Runs targeted searches by job title, industry, and location — automatically cycling through your ideal customer profile combinations.' },
              { n: '2', title: 'Enriches Each Lead', desc: 'Captures name, company, role, and LinkedIn URL for every prospect found — no manual research required.' },
              { n: '3', title: 'Writes Personalised Emails', desc: 'Uses AI to write a unique email for each prospect. Not a template with a name swapped in — a genuinely tailored message based on their role and company.' },
              { n: '4', title: 'Sends via Gmail or Zoho Mail', desc: 'Emails go out from your own dedicated business address — via Gmail or Zoho Mail. Your domain, your reputation, fully under your control.' },
              { n: '5', title: 'Drafts LinkedIn DMs', desc: 'Generates a matching LinkedIn message for each prospect — ready for you to review and send in a 10-minute daily queue.' },
              { n: '6', title: 'Logs Everything', desc: 'Every prospect, email, status, and reply date tracked automatically in your Google Sheet control room.' },
            ].map(f => (
              <div key={f.n} style={{ background: '#fff', borderRadius: 16, padding: 28, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#3B82F6', lineHeight: 1, marginBottom: 12 }}>{f.n}</div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1E293B', marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: '0.875rem', color: '#64748B', lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======== NUMBERS ======== */}
      <section id="numbers" style={{ background: '#0F172A', padding: '96px 24px', textAlign: 'center', scrollMarginTop: 68 }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 800, color: '#fff', textAlign: 'center', marginBottom: 64, letterSpacing: '-0.5px' }}>
            What OutreachOS delivers in 30 days.
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 32, marginBottom: 32 }}>
            {[
              { value: '450+', label: 'Email touches sent' },
              { value: '240+', label: 'LinkedIn DMs drafted' },
              { value: '~10 min', label: 'Daily effort required' },
              { value: '£0', label: 'Monthly subscription fees' },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontSize: 'clamp(2.2rem,5vw,3.2rem)', fontWeight: 900, color: '#fff', lineHeight: 1, marginBottom: 8 }}>{s.value}</div>
                <div style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '0.8rem', color: '#64748B' }}>Based on standard ICP configuration with 15 prospects per daily batch.</p>
        </div>
      </section>

      {/* ======== WHO IT'S FOR ======== */}
      <section id="who-its-for" style={{ background: '#fff', padding: '96px 24px', scrollMarginTop: 68 }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 800, color: '#1E293B', textAlign: 'center', marginBottom: 48, letterSpacing: '-0.5px' }}>
            OutreachOS is for you if...
          </h2>
          <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 16, marginBottom: 48 }}>
            {[
              'You sell B2B services worth £3,000 or more per deal',
              'You\'re a solo consultant, fractional executive, or run a 1–5 person agency',
              'You use Gmail and Google Workspace already',
              'You want consistent outreach without hiring a VA or SDR',
              'You\'re tired of paying £300+/month for tools that still need a team to run',
              'You want to own your system — not rent it',
            ].map(item => (
              <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, fontSize: '1rem', color: '#1E293B', fontWeight: 500 }}>
                <CheckIcon />
                {item}
              </li>
            ))}
          </ul>
          <div style={{ background: '#F8FAFC', borderRadius: 16, padding: '28px 32px' }}>
            <h3 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#64748B', marginBottom: 16 }}>Not for you if...</h3>
            <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 10 }}>
              {['You sell B2C products', 'You need to send 1,000+ emails per day', 'You want a fully managed service (see NodeMatics Done-For-You)'].map(item => (
                <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, fontSize: '0.9rem', color: '#64748B' }}>
                  <span style={{ fontWeight: 700 }}>✗</span>{item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <div className="outreach-section-divider" />

      {/* ======== PRICING ======== */}
      <section id="pricing" style={{ background: '#F8FAFC', padding: '96px 24px', scrollMarginTop: 68 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 800, color: '#1E293B', textAlign: 'center', marginBottom: 12, letterSpacing: '-0.5px' }}>
            One system. Three ways to get it.
          </h2>
          <p style={{ textAlign: 'center', color: '#64748B', marginBottom: 64, fontSize: '0.95rem' }}>
            No subscriptions. No lock-in. You own everything.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 24, alignItems: 'start', maxWidth: 980, margin: '0 auto 32px' }}>
            {[
              { name: 'Self-Install', price: '£397', featured: false, items: ['Complete OutreachOS system files', 'Step-by-step deployment guide', 'Setup walkthrough video', '14-day bug-fix support'], cta: 'Get Self-Install' },
              { name: 'Done-With-You', price: '£797', featured: true, items: ['Everything in Self-Install', '90-minute Zoom setup session', 'We configure your ICP live with you', 'Campaign live before session ends'], cta: 'Get Done-With-You' },
              { name: 'Done-For-You', price: '£1,497', featured: false, items: ['Everything in Done-With-You', 'NodeMatics installs and configures everything', 'Campaign running before handover', '30-day priority support'], cta: 'Get Done-For-You' },
            ].map(tier => (
              <div key={tier.name} style={{ position: 'relative', background: '#fff', borderRadius: 20, padding: 32, border: tier.featured ? '2px solid #3B82F6' : '1px solid rgba(0,0,0,0.08)', boxShadow: tier.featured ? '0 8px 40px rgba(59,130,246,0.18)' : '0 2px 12px rgba(0,0,0,0.04)', transform: tier.featured ? 'scale(1.03)' : 'none' }}>
                {tier.featured && (
                  <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: '#3B82F6', color: '#fff', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, padding: '5px 16px', borderRadius: 50, whiteSpace: 'nowrap' }}>
                    Most Popular
                  </div>
                )}
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E293B', marginBottom: 8 }}>{tier.name}</h3>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#1E293B', lineHeight: 1, marginBottom: 4 }}>{tier.price}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: 24 }}>one-time payment</div>
                <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 10, marginBottom: 28 }}>
                  {tier.items.map(item => (
                    <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: '0.875rem', color: '#475569', lineHeight: 1.5 }}>
                      <span style={{ width: 6, height: 6, background: '#3B82F6', borderRadius: '50%', flexShrink: 0, marginTop: 6 }} />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link to="/contact" style={{ display: 'block', width: '100%', textAlign: 'center', padding: tier.featured ? '14px 24px' : '12px 24px', borderRadius: 10, fontSize: 15, fontWeight: 700, textDecoration: 'none', background: tier.featured ? '#3B82F6' : 'transparent', color: tier.featured ? '#fff' : '#3B82F6', border: tier.featured ? 'none' : '2px solid #3B82F6', boxSizing: 'border-box' }}>
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#64748B', maxWidth: 560, margin: '0 auto' }}>
            Optional: Monthly maintenance &amp; optimisation — <strong>£97/month</strong> (priority fixes, quarterly review, WhatsApp support)
          </p>
        </div>
      </section>

      {/* ======== DOWNLOAD CTA ======== */}
      <section id="download" style={{ background: '#0F172A', padding: '96px 24px', textAlign: 'center', scrollMarginTop: 68 }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 800, color: '#fff', marginBottom: 24, letterSpacing: '-0.5px' }}>
            Not ready to buy? Read the full introduction first.
          </h2>
          <p style={{ color: '#94A3B8', maxWidth: 520, margin: '0 auto 40px', lineHeight: 1.7, fontSize: '1rem' }}>
            The OutreachOS Introduction covers exactly how the system works, who it's designed for, and what to expect — in plain language, no technical jargon.
          </p>
          <button onClick={generatePDF} style={{ background: '#10B981', color: '#fff', border: 'none', padding: '18px 40px', borderRadius: 14, fontSize: 17, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 20px rgba(16,185,129,0.35)' }}>
            ⬇ Download the OutreachOS Introduction (PDF)
          </button>
          <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: 16 }}>Free. No email required. Instant download.</p>
        </div>
      </section>

      {/* ======== FOOTER ======== */}
      <footer id="footer" style={{ background: '#1E293B', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '48px 24px 32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 24, marginBottom: 28 }}>
          <div>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <circle cx="16" cy="16" r="16" fill="#1E293B" />
                <path d="M16 4L17.5 13.5L26 10L19.5 17L28 18.5L19.5 20L26 26L17.5 19.5L16 28L14.5 19.5L6 26L12.5 20L4 18.5L12.5 17L6 10L14.5 13.5L16 4Z" fill="url(#spark-f)" />
                <defs>
                  <linearGradient id="spark-f" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#3B82F6" /><stop offset="1" stopColor="#8B5CF6" />
                  </linearGradient>
                </defs>
              </svg>
              <span style={{ fontSize: 16, fontWeight: 700, background: 'linear-gradient(135deg,#3B82F6,#8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>NodeMatics</span>
            </Link>
            <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: 8 }}>Systems that give time back.</p>
          </div>
          <nav style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
            {[['/', 'Home'], ['/products', 'Products'], ['/services', 'Services'], ['/contact', 'Contact'], ['/privacy', 'Privacy Policy']].map(([href, label]) => (
              <Link key={href} to={href} style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '0.85rem' }}>{label}</Link>
            ))}
          </nav>
          <p style={{ fontSize: '0.8rem', color: '#64748B', textAlign: 'right' }}>A NodeMatics product — nodematics.com</p>
        </div>
        <div style={{ maxWidth: 1100, margin: '0 auto', paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center', fontSize: '0.78rem', color: '#64748B' }}>
          © 2026 NodeMatics. All rights reserved.
        </div>
      </footer>

    </div>
  );
};

export default OutreachOS;
