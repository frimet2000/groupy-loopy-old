import React, { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, X, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';

export default function InstallPrompt() {
  const { language } = useLanguage();
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    // Check if app is already installed (running in standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         window.navigator.standalone === true;
    
    if (isStandalone) {
      localStorage.setItem('pwa_installed', 'true');
      return;
    }

    // Check if user has already dismissed
    const hasDismissed = localStorage.getItem('pwa_dismissed');
    const hasInstalled = localStorage.getItem('pwa_installed');

    // Only show if not dismissed/installed
    if (!hasInstalled && !hasDismissed) {
      // Listen for beforeinstallprompt event
      const handleBeforeInstallPrompt = (e) => {
        e.preventDefault();
        setDeferredPrompt(e);
        // Show prompt after a short delay
        setTimeout(() => setShowPrompt(true), 3000);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      // Listen for app installed event
      const handleAppInstalled = () => {
        localStorage.setItem('pwa_installed', 'true');
        setShowPrompt(false);
      };

      window.addEventListener('appinstalled', handleAppInstalled);

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
      };
    }
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      localStorage.setItem('pwa_installed', 'true');
      setShowPrompt(false);
    }

    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa_dismissed', 'true');
    setShowPrompt(false);
  };

  const handleLater = () => {
    setShowPrompt(false);
  };

  const translations = {
    he: {
      title: 'התקן את האפליקציה',
      description: 'קבל גישה מהירה מהמסך הבית, התראות בזמן אמת וחוויה משופרת',
      quickAccess: 'גישה מהירה',
      quickAccessDesc: 'פתח את האפליקציה ישירות מהמסך הבית',
      notifications: 'התראות בזמן אמת',
      notificationsDesc: 'קבל עדכונים על הודעות חדשות ובקשות',
      performance: 'ביצועים מהירים',
      performanceDesc: 'טעינה מהירה יותר וחוויה חלקה',
      noThanks: 'לא תודה',
      later: 'מאוחר יותר',
      installNow: 'התקן עכשיו'
    },
    en: {
      title: 'Install the App',
      description: 'Get quick access from home screen, real-time notifications and enhanced experience',
      quickAccess: 'Quick Access',
      quickAccessDesc: 'Open the app directly from your home screen',
      notifications: 'Real-time Notifications',
      notificationsDesc: 'Get updates on new messages and requests',
      performance: 'Fast Performance',
      performanceDesc: 'Faster loading and smoother experience',
      noThanks: 'No Thanks',
      later: 'Later',
      installNow: 'Install Now'
    },
    ru: {
      title: 'Установить приложение',
      description: 'Быстрый доступ с главного экрана, уведомления в реальном времени и улучшенный опыт',
      quickAccess: 'Быстрый доступ',
      quickAccessDesc: 'Открывайте приложение прямо с главного экрана',
      notifications: 'Уведомления в реальном времени',
      notificationsDesc: 'Получайте обновления о новых сообщениях и запросах',
      performance: 'Быстрая производительность',
      performanceDesc: 'Более быстрая загрузка и плавная работа',
      noThanks: 'Нет, спасибо',
      later: 'Позже',
      installNow: 'Установить сейчас'
    },
    es: {
      title: 'Instalar la aplicación',
      description: 'Acceso rápido desde la pantalla de inicio, notificaciones en tiempo real y experiencia mejorada',
      quickAccess: 'Acceso rápido',
      quickAccessDesc: 'Abre la aplicación directamente desde tu pantalla de inicio',
      notifications: 'Notificaciones en tiempo real',
      notificationsDesc: 'Recibe actualizaciones sobre nuevos mensajes y solicitudes',
      performance: 'Rendimiento rápido',
      performanceDesc: 'Carga más rápida y experiencia más fluida',
      noThanks: 'No, gracias',
      later: 'Más tarde',
      installNow: 'Instalar ahora'
    },
    fr: {
      title: 'Installer l\'application',
      description: 'Accès rapide depuis l\'écran d\'accueil, notifications en temps réel et expérience améliorée',
      quickAccess: 'Accès rapide',
      quickAccessDesc: 'Ouvrez l\'application directement depuis votre écran d\'accueil',
      notifications: 'Notifications en temps réel',
      notificationsDesc: 'Recevez des mises à jour sur les nouveaux messages et demandes',
      performance: 'Performance rapide',
      performanceDesc: 'Chargement plus rapide et expérience plus fluide',
      noThanks: 'Non merci',
      later: 'Plus tard',
      installNow: 'Installer maintenant'
    },
    de: {
      title: 'App installieren',
      description: 'Schneller Zugriff vom Startbildschirm, Echtzeit-Benachrichtigungen und verbesserte Erfahrung',
      quickAccess: 'Schneller Zugriff',
      quickAccessDesc: 'Öffnen Sie die App direkt von Ihrem Startbildschirm',
      notifications: 'Echtzeit-Benachrichtigungen',
      notificationsDesc: 'Erhalten Sie Updates über neue Nachrichten und Anfragen',
      performance: 'Schnelle Leistung',
      performanceDesc: 'Schnelleres Laden und flüssigeres Erlebnis',
      noThanks: 'Nein danke',
      later: 'Später',
      installNow: 'Jetzt installieren'
    },
    it: {
      title: 'Installa l\'app',
      description: 'Accesso rapido dalla schermata iniziale, notifiche in tempo reale ed esperienza migliorata',
      quickAccess: 'Accesso rapido',
      quickAccessDesc: 'Apri l\'app direttamente dalla schermata iniziale',
      notifications: 'Notifiche in tempo reale',
      notificationsDesc: 'Ricevi aggiornamenti su nuovi messaggi e richieste',
      performance: 'Prestazioni veloci',
      performanceDesc: 'Caricamento più veloce ed esperienza più fluida',
      noThanks: 'No grazie',
      later: 'Più tardi',
      installNow: 'Installa ora'
    }
  };

  const t = translations[language] || translations.en;

  if (!showPrompt) return null;

  return (
    <Dialog open={showPrompt} onOpenChange={setShowPrompt}>
      <DialogContent className="sm:max-w-md max-w-[95vw] mx-auto">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg"
            >
              <Smartphone className="w-8 h-8 text-white" />
            </motion.div>
          </div>
          <DialogTitle className="text-center text-xl">
            {t.title}
          </DialogTitle>
          <DialogDescription className="text-center">
            {t.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg">
            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Download className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-emerald-900 text-sm">
                {t.quickAccess}
              </p>
              <p className="text-xs text-emerald-700">
                {t.quickAccessDesc}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-lg">🔔</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-blue-900 text-sm">
                {t.notifications}
              </p>
              <p className="text-xs text-blue-700">
                {t.notificationsDesc}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-lg">⚡</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-purple-900 text-sm">
                {t.performance}
              </p>
              <p className="text-xs text-purple-700">
                {t.performanceDesc}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button 
            variant="ghost" 
            onClick={handleDismiss}
            className="w-full sm:w-auto order-3 sm:order-1 text-sm"
          >
            <X className="w-4 h-4 mr-2" />
            {t.noThanks}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleLater}
            className="w-full sm:w-auto order-2 text-sm"
          >
            {t.later}
          </Button>
          <Button 
            onClick={handleInstall}
            disabled={!deferredPrompt}
            className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 order-1 sm:order-3 text-sm"
          >
            <Download className="w-4 h-4 mr-2" />
            {t.installNow}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}