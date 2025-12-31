import React, { useEffect, useState } from 'react';
import { ExternalLink, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Landing() {
  const [detectedLanguage, setDetectedLanguage] = useState('en');

  useEffect(() => {
    detectLanguage();
  }, []);

  const detectLanguage = async () => {
    try {
      // Try geolocation
      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const lang = getLanguageFromCoordinates(latitude, longitude);
            setDetectedLanguage(lang);
          },
          () => {
            // Fallback to browser language
            const browserLang = (navigator.language || 'en').split('-')[0];
            const supportedLangs = ['he', 'en', 'ru', 'es', 'fr', 'de', 'it'];
            setDetectedLanguage(supportedLangs.includes(browserLang) ? browserLang : 'en');
          }
        );
      } else {
        // Fallback to browser language
        const browserLang = typeof navigator !== 'undefined' ? (navigator.language || 'en').split('-')[0] : 'en';
        const supportedLangs = ['he', 'en', 'ru', 'es', 'fr', 'de', 'it'];
        setDetectedLanguage(supportedLangs.includes(browserLang) ? browserLang : 'en');
      }
    } catch (error) {
      console.error('Language detection error:', error);
      setDetectedLanguage('en');
    }
  };

  const getLanguageFromCoordinates = (lat, lng) => {
    // Israel
    if (lat >= 29 && lat <= 33.5 && lng >= 34 && lng <= 36) return 'he';
    // Russia and nearby
    if (lat >= 41 && lat <= 82 && lng >= 19 && lng <= 180) return 'ru';
    // Spain
    if (lat >= 36 && lat <= 44 && lng >= -10 && lng <= 4) return 'es';
    // France
    if (lat >= 41 && lat <= 51 && lng >= -5 && lng <= 8) return 'fr';
    // Germany
    if (lat >= 47 && lat <= 55 && lng >= 5 && lng <= 15) return 'de';
    // Italy
    if (lat >= 36 && lat <= 48 && lng >= 6 && lng <= 19) return 'it';
    return 'en';
  };

  const translations = {
    he: {
      title: 'ברוכים הבאים ל-Groupy Loopy',
      subtitle: 'הפלטפורמה למציאת שותפים לטיולים',
      button: 'פתח באפליקציה',
      note: 'לחץ על הכפתור כדי לפתוח את האפליקציה בדפדפן שלך'
    },
    en: {
      title: 'Welcome to Groupy Loopy',
      subtitle: 'Find Trip Partners Platform',
      button: 'Open in Browser',
      note: 'Click the button to open the app in your browser'
    },
    ru: {
      title: 'Добро пожаловать в Groupy Loopy',
      subtitle: 'Платформа для поиска попутчиков',
      button: 'Открыть в браузере',
      note: 'Нажмите кнопку, чтобы открыть приложение в браузере'
    },
    es: {
      title: 'Bienvenido a Groupy Loopy',
      subtitle: 'Plataforma para Encontrar Compañeros de Viaje',
      button: 'Abrir en Navegador',
      note: 'Haz clic en el botón para abrir la app en tu navegador'
    },
    fr: {
      title: 'Bienvenue sur Groupy Loopy',
      subtitle: 'Plateforme pour Trouver des Partenaires de Voyage',
      button: 'Ouvrir dans le Navigateur',
      note: 'Cliquez sur le bouton pour ouvrir l\'application dans votre navigateur'
    },
    de: {
      title: 'Willkommen bei Groupy Loopy',
      subtitle: 'Plattform zum Finden von Reisepartnern',
      button: 'Im Browser öffnen',
      note: 'Klicken Sie auf die Schaltfläche, um die App in Ihrem Browser zu öffnen'
    },
    it: {
      title: 'Benvenuto su Groupy Loopy',
      subtitle: 'Piattaforma per Trovare Compagni di Viaggio',
      button: 'Apri nel Browser',
      note: 'Clicca sul pulsante per aprire l\'app nel tuo browser'
    }
  };

  const t = translations[detectedLanguage] || translations.en;
  const isRTL = detectedLanguage === 'he';

  const handleOpenInBrowser = () => {
    try {
      if (typeof window === 'undefined') return;
      
      const appUrl = window.location.origin;
      
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('landing_page_visited', 'true');
        localStorage.setItem('language', detectedLanguage);
        localStorage.setItem('language_selected', 'true');
      }
      
      // Try multiple methods to open in external browser
      const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
      const isTikTok = userAgent.includes('TikTok') || userAgent.includes('BytedanceWebview');
      const isInstagram = userAgent.includes('Instagram');
      const isFacebook = userAgent.includes('FBAN') || userAgent.includes('FBAV');
      
      if (isTikTok || isInstagram || isFacebook) {
        // For in-app browsers, try to open in external browser
        const a = document.createElement('a');
        a.href = appUrl;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        // Regular redirect
        window.location.href = appUrl;
      }
    } catch (error) {
      console.error('Open browser error:', error);
      // Fallback - try simple redirect
      if (typeof window !== 'undefined') {
        window.location.href = window.location.origin;
      }
    }
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-2xl p-8 space-y-6 text-center">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693c3ab4048a1e3a31fffd66/532a53f9c_.png"
              alt="Groupy Loopy"
              className="h-24 w-auto"
            />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">
              {t.title}
            </h1>
            <p className="text-gray-600 text-lg">
              {t.subtitle}
            </p>
          </div>

          {/* Main Action Button */}
          <Button
            onClick={handleOpenInBrowser}
            className="w-full h-16 text-lg font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <ExternalLink className="w-6 h-6 mr-2" />
            {t.button}
          </Button>

          {/* Note */}
          <p className="text-sm text-gray-500">
            {t.note}
          </p>

          {/* Language Indicator */}
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400 pt-4 border-t">
            <Globe className="w-4 h-4" />
            <span>
              {detectedLanguage === 'he' && 'עברית'}
              {detectedLanguage === 'en' && 'English'}
              {detectedLanguage === 'ru' && 'Русский'}
              {detectedLanguage === 'es' && 'Español'}
              {detectedLanguage === 'fr' && 'Français'}
              {detectedLanguage === 'de' && 'Deutsch'}
              {detectedLanguage === 'it' && 'Italiano'}
            </span>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          © 2025 Groupy Loopy
        </p>
      </div>
    </div>
  );
}