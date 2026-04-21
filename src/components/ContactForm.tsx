import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';

const GOLD = '#B8912A';
const BODY = '#c8d8e8';
const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(184,145,42,0.3)',
  borderRadius: 2,
  padding: '12px 16px',
  fontSize: 15,
  color: '#ffffff',
  outline: 'none',
  fontFamily: "'Jost', sans-serif",
  fontWeight: 300,
  boxSizing: 'border-box',
};
const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: "'Jost', sans-serif",
  fontSize: 11,
  fontWeight: 500,
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
  color: GOLD,
  marginBottom: 8,
};

const ContactForm = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch('https://engageperfect.app.n8n.cloud/webhook/b6b9ad0f-ab8a-439c-b213-e6b3d5c24d59', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'no-cors',
        body: JSON.stringify({
          type: 'afrinia_contact',
          to: 'afrinia@afrinia.org',
          ...form,
          submitted_at: new Date().toISOString(),
        }),
      });
      setSent(true);
      toast({ title: t('contact.form.success.title'), description: t('contact.form.success.description') });
    } catch {
      toast({ title: t('contact.form.error.title'), description: t('contact.form.error.description'), variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div style={{ padding: '48px 0', textAlign: 'center' }}>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 300, color: '#F5F0E8', marginBottom: 12 }}>
          {t('contact.form.success.title')}
        </p>
        <p style={{ fontSize: 15, color: BODY, lineHeight: 1.7 }}>{t('contact.form.success.description')}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="form-row">
        <div>
          <label style={labelStyle}>{t('contact.form.fields.name.label')}</label>
          <input name="name" required value={form.name} onChange={handleChange} disabled={submitting}
            placeholder={t('contact.form.fields.name.placeholder')} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>{t('contact.form.fields.email.label')}</label>
          <input name="email" type="email" required value={form.email} onChange={handleChange} disabled={submitting}
            placeholder={t('contact.form.fields.email.placeholder')} style={inputStyle} />
        </div>
      </div>
      <div>
        <label style={labelStyle}>{t('contact.form.fields.subject.label')}</label>
        <input name="subject" required value={form.subject} onChange={handleChange} disabled={submitting}
          placeholder={t('contact.form.fields.subject.placeholder')} style={inputStyle} />
      </div>
      <div>
        <label style={labelStyle}>{t('contact.form.fields.message.label')}</label>
        <textarea name="message" required rows={6} value={form.message} onChange={handleChange} disabled={submitting}
          placeholder={t('contact.form.fields.message.placeholder')}
          style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.7 }} />
      </div>
      <div>
        <button type="submit" disabled={submitting}
          style={{
            fontFamily: "'Jost', sans-serif", fontSize: 11, fontWeight: 500,
            letterSpacing: '0.22em', textTransform: 'uppercase',
            background: GOLD, color: '#0a1628', border: 'none', cursor: submitting ? 'not-allowed' : 'pointer',
            padding: '16px 48px', opacity: submitting ? 0.7 : 1, transition: 'opacity 0.2s',
          }}>
          {submitting ? t('contact.form.submitting') : t('contact.form.submit')}
        </button>
      </div>
    </form>
  );
};

export default ContactForm;
