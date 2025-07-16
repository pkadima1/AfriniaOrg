
import { Card } from '@/components/ui/card';

const ContactInfo = () => {
  return (
    <div className="space-y-8">
      <Card className="p-8 bg-dark-card border-white/10">
        <h3 className="text-2xl font-semibold mb-6">Contact Information</h3>
        <div className="space-y-6">
          <div>
            <h4 className="font-medium mb-2">Email</h4>
            <p className="text-text-secondary">contact@nodematics.com</p>
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
    </div>
  );
};

export default ContactInfo;
