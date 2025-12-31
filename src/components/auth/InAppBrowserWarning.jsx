import React, { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ExternalLink, Copy, Chrome } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

// Detect if running in an in-app browser (TikTok, Instagram, Facebook, etc.)
export function isInAppBrowser() {
  if (typeof window === 'undefined' || !navigator.userAgent) return false;

  const ua = navigator.userAgent.toLowerCase();
  
  // Check for common in-app browsers
  const inAppBrowsers = [
    'fban',        // Facebook App
    'fbav',        // Facebook App
    'instagram',   // Instagram
    'tiktok',      // TikTok
    'snapchat',    // Snapchat
    'twitter',     // Twitter/X
    'line',        // LINE
    'whatsapp',    // WhatsApp
    'linkedin',    // LinkedIn
  ];

  return inAppBrowsers.some(browser => ua.includes(browser));
}

// Get the specific app name
export function getInAppBrowserName() {
  if (typeof window === 'undefined' || !navigator.userAgent) return null;

  const ua = navigator.userAgent.toLowerCase();
  
  if (ua.includes('tiktok')) return 'TikTok';
  if (ua.includes('instagram')) return 'Instagram';
  if (ua.includes('fban') || ua.includes('fbav')) return 'Facebook';
  if (ua.includes('snapchat')) return 'Snapchat';
  if (ua.includes('twitter')) return 'Twitter';
  if (ua.includes('line')) return 'LINE';
  if (ua.includes('whatsapp')) return 'WhatsApp';
  if (ua.includes('linkedin')) return 'LinkedIn';
  
  return null;
}

export default function InAppBrowserWarning({ isOpen, onClose }) {
  const { language } = useLanguage();
  const appName = getInAppBrowserName();

  const content = {
    he: {
      title: "אופס! גוגל לא מאשרת התחברות מכאן",
      description: `הבקשה לא עומדת בדרישות האבטחה של מדיניות Google`,
      instruction: `כדי שתוכל להתחבר בבטחה, לחץ על 3 הנקודות ${appName === 'Instagram' ? '(בפינה העליונה)' : appName === 'TikTok' ? '(בצד)' : '(באפליקציה)'} ובחר ב-'פתח בדפדפן חיצוני' (Open in Browser).`,
      alternativeWeb: "לחלופין, פתח את האתר בדפדפן רגיל כמו Chrome, Safari או Firefox.",
      copyLinkButton: "העתק קישור",
      closeButton: "סגור",
      linkCopied: "הקישור הועתק!"
    },
    en: {
      title: "Oops! Google doesn't allow login from here",
      description: "The request does not meet Google's security policy requirements",
      instruction: `To log in securely, tap the 3 dots ${appName === 'Instagram' ? '(top corner)' : appName === 'TikTok' ? '(side)' : '(in the app)'} and select 'Open in Browser'.`,
      alternativeWeb: "Alternatively, open this site in a regular browser like Chrome, Safari, or Firefox.",
      copyLinkButton: "Copy Link",
      closeButton: "Close",
      linkCopied: "Link copied!"
    },
    ru: {
      title: "Упс! Google не разрешает вход отсюда",
      description: "Запрос не соответствует требованиям политики безопасности Google",
      instruction: `Для безопасного входа нажмите на 3 точки ${appName === 'Instagram' ? '(в верхнем углу)' : appName === 'TikTok' ? '(сбоку)' : '(в приложении)'} и выберите 'Открыть в браузере'.`,
      alternativeWeb: "Или откройте сайт в обычном браузере, таком как Chrome, Safari или Firefox.",
      copyLinkButton: "Скопировать ссылку",
      closeButton: "Закрыть",
      linkCopied: "Ссылка скопирована!"
    },
    es: {
      title: "¡Ups! Google no permite iniciar sesión desde aquí",
      description: "La solicitud no cumple con los requisitos de la política de seguridad de Google",
      instruction: `Para iniciar sesión de forma segura, toca los 3 puntos ${appName === 'Instagram' ? '(esquina superior)' : appName === 'TikTok' ? '(lateral)' : '(en la app)'} y selecciona 'Abrir en navegador'.`,
      alternativeWeb: "Alternativamente, abre este sitio en un navegador normal como Chrome, Safari o Firefox.",
      copyLinkButton: "Copiar enlace",
      closeButton: "Cerrar",
      linkCopied: "¡Enlace copiado!"
    },
    fr: {
      title: "Oups! Google n'autorise pas la connexion d'ici",
      description: "La demande ne répond pas aux exigences de la politique de sécurité de Google",
      instruction: `Pour vous connecter en toute sécurité, appuyez sur les 3 points ${appName === 'Instagram' ? '(coin supérieur)' : appName === 'TikTok' ? '(côté)' : '(dans l\'app)'} et sélectionnez 'Ouvrir dans le navigateur'.`,
      alternativeWeb: "Alternativement, ouvrez ce site dans un navigateur normal comme Chrome, Safari ou Firefox.",
      copyLinkButton: "Copier le lien",
      closeButton: "Fermer",
      linkCopied: "Lien copié !"
    },
    de: {
      title: "Hoppla! Google erlaubt hier keine Anmeldung",
      description: "Die Anfrage erfüllt nicht die Sicherheitsrichtlinien von Google",
      instruction: `Für sichere Anmeldung tippen Sie auf die 3 Punkte ${appName === 'Instagram' ? '(obere Ecke)' : appName === 'TikTok' ? '(Seite)' : '(in der App)'} und wählen Sie 'Im Browser öffnen'.`,
      alternativeWeb: "Alternativ öffnen Sie diese Seite in einem normalen Browser wie Chrome, Safari oder Firefox.",
      copyLinkButton: "Link kopieren",
      closeButton: "Schließen",
      linkCopied: "Link kopiert!"
    },
    it: {
      title: "Ops! Google non consente l'accesso da qui",
      description: "La richiesta non soddisfa i requisiti della politica di sicurezza di Google",
      instruction: `Per accedere in sicurezza, tocca i 3 punti ${appName === 'Instagram' ? '(angolo superiore)' : appName === 'TikTok' ? '(laterale)' : '(nell\'app)'} e seleziona 'Apri nel browser'.`,
      alternativeWeb: "In alternativa, apri questo sito in un browser normale come Chrome, Safari o Firefox.",
      copyLinkButton: "Copia link",
      closeButton: "Chiudi",
      linkCopied: "Link copiato!"
    }
  };

  const text = content[language] || content.en;

  const handleCopyLink = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success(text.linkCopied);
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border-l-8 border-l-red-600 max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-red-600 text-2xl">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <AlertTriangle className="w-10 h-10" />
            </motion.div>
            {text.title}
          </DialogTitle>
          <DialogDescription className="text-base text-gray-700 pt-2 space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm font-medium text-red-800 text-center">
                disallowed_useragent :403
              </p>
              <p className="text-xs text-red-700 text-center mt-1">
                {text.description}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <ExternalLink className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm leading-relaxed text-gray-800">
                  {text.instruction}
                </p>
              </div>

              <div className="flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-lg p-4">
                <Chrome className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm leading-relaxed text-gray-700">
                  {text.alternativeWeb}
                </p>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 pt-4">
          <Button
            onClick={handleCopyLink}
            className="bg-emerald-600 hover:bg-emerald-700 gap-2 w-full h-12"
          >
            <Copy className="w-5 h-5" />
            {text.copyLinkButton}
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full h-12"
          >
            {text.closeButton}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}