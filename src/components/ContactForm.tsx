
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const ContactForm = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Send to n8n webhook
      await fetch('https://engageperfect.app.n8n.cloud/webhook/b6b9ad0f-ab8a-439c-b213-e6b3d5c24d59', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
        body: JSON.stringify({
          type: 'contact_form',
          name: formData.name,
          email: formData.email,
          company: formData.company || '',
          message: formData.message,
          submitted_at: new Date().toISOString()
        }),
      });

      console.log('Contact form sent to n8n webhook');

      toast({
        title: t('contact.form.success.title'),
        description: t('contact.form.success.description'),
      });
      
      setFormData({ name: '', email: '', company: '', message: '' });
    } catch (error: any) {
      console.error('Contact form error:', error);
      toast({
        title: t('contact.form.error.title'),
        description: t('contact.form.error.description'),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <Card className="p-8 bg-dark-card border-white/10">
      <h2 className="text-3xl font-bold mb-6">{t('contact.form.title')}</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            {t('contact.form.fields.name.label')}
          </label>
          <Input
            id="name"
            name="name"
            type="text"
            required
            value={formData.name}
            onChange={handleChange}
            disabled={isSubmitting}
            className="bg-dark-surface border-white/20 text-white placeholder:text-text-secondary"
            placeholder={t('contact.form.fields.name.placeholder')}
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            {t('contact.form.fields.email.label')}
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            disabled={isSubmitting}
            className="bg-dark-surface border-white/20 text-white placeholder:text-text-secondary"
            placeholder={t('contact.form.fields.email.placeholder')}
          />
        </div>

        <div>
          <label htmlFor="company" className="block text-sm font-medium mb-2">
            {t('contact.form.fields.company.label')}
          </label>
          <Input
            id="company"
            name="company"
            type="text"
            value={formData.company}
            onChange={handleChange}
            disabled={isSubmitting}
            className="bg-dark-surface border-white/20 text-white placeholder:text-text-secondary"
            placeholder={t('contact.form.fields.company.placeholder')}
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium mb-2">
            {t('contact.form.fields.message.label')}
          </label>
          <textarea
            id="message"
            name="message"
            rows={6}
            required
            value={formData.message}
            onChange={handleChange}
            disabled={isSubmitting}
            className="w-full bg-dark-surface border border-white/20 rounded-lg px-3 py-2 text-white placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-blue disabled:opacity-50"
            placeholder={t('contact.form.fields.message.placeholder')}
          />
        </div>

        <Button 
          type="submit" 
          className="w-full apple-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? t('contact.form.submitting') : t('contact.form.submit')}
        </Button>
      </form>
    </Card>
  );
};

export default ContactForm;
