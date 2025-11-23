
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';

const ContactInfo = () => {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-8">
      <Card className="p-8 bg-dark-card border-white/10">
        <h3 className="text-2xl font-semibold mb-6">{t('contact.info.title')}</h3>
        <div className="space-y-6">
          <div>
            <h4 className="font-medium mb-2">{t('contact.info.email')}</h4>
            <p className="text-text-secondary">contact@NodeMatics.com</p>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">{t('contact.info.ukOffice')}</h4>
            <p className="text-text-secondary mb-2">
              2 Main Court Cumbrea, Main Court<br />
              Brampton, England, CA8 1SA
            </p>
            <p className="text-text-secondary">
              {t('contact.info.phoneWhatsapp')}: <span className="text-accent-blue">+44 7767 59 6260</span>
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-2">{t('contact.info.euOffice')}</h4>
            <p className="text-text-secondary mb-2">
              Auna st 4-5 North Tallinn district<br />
              Tallinn Harju county 10317
            </p>
            <p className="text-text-secondary">
              {t('contact.info.phoneTelegram')}: <span className="text-accent-blue">+372 5354 1829</span>
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-8 bg-dark-card border-white/10">
        <h3 className="text-2xl font-semibold mb-6">{t('contact.info.officeHours.title')}</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span>{t('contact.info.officeHours.mondayFriday')}</span>
            <span className="text-text-secondary">9:00 AM - 6:00 PM {t('contact.info.officeHours.timeGMT')}</span>
          </div>
          <div className="flex justify-between">
            <span>{t('contact.info.officeHours.saturday')}</span>
            <span className="text-text-secondary">10:00 AM - 4:00 PM {t('contact.info.officeHours.timeGMT')}</span>
          </div>
          <div className="flex justify-between">
            <span>{t('contact.info.officeHours.sunday')}</span>
            <span className="text-text-secondary">{t('contact.info.officeHours.closed')}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ContactInfo;
