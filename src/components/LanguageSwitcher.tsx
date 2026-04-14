import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getAlternateUrl, type Lang } from '@/utils/languageUtils';

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();

  const languages = [
    { code: 'en', name: t('language.en'), flag: '🇺🇸' },
    { code: 'fr', name: t('language.fr'), flag: '🇫🇷' },
  ];

  const handleLanguageChange = (languageCode: string) => {
    const targetLang = languageCode as Lang;
    void i18n.changeLanguage(targetLang);

    // Navigate to the equivalent URL in the target language.
    // /en/blog/my-post → /fr/blog/my-post
    // /about → /about (no change for non-blog pages)
    const newPath = getAlternateUrl(window.location.pathname, targetLang);
    navigate(newPath, { replace: true });
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 text-gray-300 hover:text-white hover:bg-white/10"
          aria-label={t('language.switch')}
        >
          <Globe className="w-4 h-4" />
          <span className="hidden sm:inline">{currentLanguage.flag} {currentLanguage.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-dark-card border-white/10">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={`flex items-center gap-2 cursor-pointer hover:bg-white/10 ${
              i18n.language === language.code ? 'bg-accent-blue/20 text-accent-blue' : 'text-gray-300'
            }`}
          >
            <span>{language.flag}</span>
            <span>{language.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
