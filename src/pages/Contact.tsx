
import { useState } from 'react';
import Layout from '../components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    toast({
      title: "Message sent!",
      description: "We'll get back to you within 24 hours.",
    });
    setFormData({ name: '', email: '', company: '', message: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Get in <span className="gradient-text">Touch</span>
          </h1>
          <p className="text-xl text-text-secondary mb-8">
            Ready to transform your content strategy? Let's discuss how 
            Nodematics can help you achieve your goals.
          </p>
        </div>
      </section>

      {/* Contact Form and Info */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Contact Form */}
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
                    className="w-full bg-dark-surface border border-white/20 rounded-lg px-3 py-2 text-white placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-blue"
                    placeholder="Tell us about your project and how we can help..."
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full apple-button"
                >
                  Send Message
                </Button>
              </form>
            </Card>

            {/* Contact Information */}
            <div className="space-y-8">
              <Card className="p-8 bg-dark-card border-white/10">
                <h3 className="text-2xl font-semibold mb-6">Contact Information</h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">Email</h4>
                    <p className="text-text-secondary">hello@nodematics.com</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">UK Office</h4>
                    <p className="text-text-secondary mb-2">
                      2 Main Court Cumbrea, Main Court<br />
                      Brampton, England, CA8 1SA
                    </p>
                    <p className="text-text-secondary">
                      Phone & WhatsApp: <span className="text-accent-blue">+44 7767 59 6260</span>
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">EU Office</h4>
                    <p className="text-text-secondary mb-2">
                      Auna st 4-5 North Tallinn district<br />
                      Tallinn Harju county 10317
                    </p>
                    <p className="text-text-secondary">
                      Phone & Telegram: <span className="text-accent-blue">+372 5354 1829</span>
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-8 bg-dark-card border-white/10">
                <h3 className="text-2xl font-semibold mb-6">Office Hours</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span className="text-text-secondary">9:00 AM - 6:00 PM GMT</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span className="text-text-secondary">10:00 AM - 4:00 PM GMT</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span className="text-text-secondary">Closed</span>
                  </div>
                </div>
              </Card>

              <Card className="p-8 bg-dark-card border-white/10">
                <h3 className="text-2xl font-semibold mb-6">Quick Links</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Sales Inquiries</h4>
                    <p className="text-accent-blue">sales@nodematics.com</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Technical Support</h4>
                    <p className="text-accent-blue">support@nodematics.com</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Partnership</h4>
                    <p className="text-accent-blue">partners@nodematics.com</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Response Time Section */}
      <section className="py-20 px-6 lg:px-8 bg-dark-surface">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            We'll Respond <span className="gradient-text">Quickly</span>
          </h2>
          <p className="text-xl text-text-secondary mb-8">
            Our team typically responds to inquiries within 2-4 hours during business hours.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold gradient-text mb-2">&lt; 2hrs</div>
              <div className="text-text-secondary">Sales Inquiries</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold gradient-text mb-2">&lt; 4hrs</div>
              <div className="text-text-secondary">General Questions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold gradient-text mb-2">&lt; 24hrs</div>
              <div className="text-text-secondary">Technical Support</div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
