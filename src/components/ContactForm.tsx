
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const ContactForm = () => {
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
        title: "Message sent successfully!",
        description: "We'll get back to you within 24 hours.",
      });
      
      setFormData({ name: '', email: '', company: '', message: '' });
    } catch (error: any) {
      console.error('Contact form error:', error);
      toast({
        title: "Error sending message",
        description: "Please try again or contact us directly at contact@nodematics.com",
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
      <h2 className="text-3xl font-bold mb-6">Send us a message</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Full Name
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
            placeholder="Your full name"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email Address
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
            placeholder="your@email.com"
          />
        </div>

        <div>
          <label htmlFor="company" className="block text-sm font-medium mb-2">
            Company (Optional)
          </label>
          <Input
            id="company"
            name="company"
            type="text"
            value={formData.company}
            onChange={handleChange}
            disabled={isSubmitting}
            className="bg-dark-surface border-white/20 text-white placeholder:text-text-secondary"
            placeholder="Your company name"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium mb-2">
            Message
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
            placeholder="Tell us about your project and how we can help..."
          />
        </div>

        <Button 
          type="submit" 
          className="w-full apple-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </Button>
      </form>
    </Card>
  );
};

export default ContactForm;
