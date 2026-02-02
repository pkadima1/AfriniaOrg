import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const CONTACT_METHOD_VALUES = ['email', 'phone', 'video'] as const;

const ContactForm = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    timeDrain: '',
    contactMethod: '' as '' | (typeof CONTACT_METHOD_VALUES)[number],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await fetch('https://engageperfect.app.n8n.cloud/webhook/b6b9ad0f-ab8a-439c-b213-e6b3d5c24d59', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
        body: JSON.stringify({
          type: 'time_audit_request',
          name: formData.name,
          email: formData.email,
          company: formData.company || '',
          time_drain: formData.timeDrain,
          contact_method: formData.contactMethod || 'email',
          submitted_at: new Date().toISOString(),
        }),
      });

      toast({
        title: t('contact.form.success.title'),
        description: t('contact.form.success.description'),
      });

      setFormData({
        name: '',
        email: '',
        company: '',
        timeDrain: '',
        contactMethod: '',
      });
    } catch (error: unknown) {
      console.error('Contact form error:', error);
      toast({
        title: t('contact.form.error.title'),
        description: t('contact.form.error.description'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleContactMethodChange = (value: string) => {
    setFormData({
      ...formData,
      contactMethod: value as (typeof CONTACT_METHOD_VALUES)[number],
    });
  };

  return (
    <Card className="p-8 bg-dark-card border-white/10">
      <h2 className="text-2xl font-bold mb-6">{t('contact.form.title')}</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Label htmlFor="name" className="text-sm font-medium mb-2 block">
            {t('contact.form.fields.name.label')}
          </Label>
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
          <Label htmlFor="email" className="text-sm font-medium mb-2 block">
            {t('contact.form.fields.email.label')}
          </Label>
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
          <Label htmlFor="company" className="text-sm font-medium mb-2 block">
            {t('contact.form.fields.company.label')}
          </Label>
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
          <Label htmlFor="timeDrain" className="text-sm font-medium mb-2 block">
            {t('contact.form.fields.timeDrain.label')}
          </Label>
          <textarea
            id="timeDrain"
            name="timeDrain"
            rows={4}
            required
            value={formData.timeDrain}
            onChange={handleChange}
            disabled={isSubmitting}
            className="w-full bg-dark-surface border border-white/20 rounded-lg px-3 py-2 text-white placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-blue disabled:opacity-50 resize-none"
            placeholder={t('contact.form.fields.timeDrain.placeholder')}
          />
        </div>

        <div>
          <Label className="text-sm font-medium mb-2 block">
            {t('contact.form.fields.contactMethod.label')}
          </Label>
          <Select
            value={formData.contactMethod}
            onValueChange={handleContactMethodChange}
            disabled={isSubmitting}
          >
            <SelectTrigger className="bg-dark-surface border-white/20 text-white [&>span]:text-text-secondary">
              <SelectValue placeholder={t('contact.form.fields.contactMethod.placeholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email" className="text-foreground">
                {t('contact.form.fields.contactMethod.email')}
              </SelectItem>
              <SelectItem value="phone" className="text-foreground">
                {t('contact.form.fields.contactMethod.phone')}
              </SelectItem>
              <SelectItem value="video" className="text-foreground">
                {t('contact.form.fields.contactMethod.video')}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          type="submit"
          className="w-full apple-button bg-gradient-to-r from-accent-blue to-accent-purple hover:from-accent-blue/90 hover:to-accent-purple/90"
          disabled={isSubmitting}
        >
          {isSubmitting ? t('contact.form.submitting') : t('contact.form.submit')}
        </Button>
      </form>
    </Card>
  );
};

export default ContactForm;
