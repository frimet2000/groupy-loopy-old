import React, { useEffect, useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bell, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function NotificationPermissionRequest() {
  const { language } = useLanguage();
  const [showDialog, setShowDialog] = useState(false);
  const [requesting, setRequesting] = useState(false);

  const translations = {
    he: {
      title: 'קבל התראות',
      description: 'אפשר התראות כדי לא לפספס עדכונים חשובים מהטיולים שלך',
      benefits: [
        '📱 התראות על הודעות חדשות בצ\'אט',
        '⚠️ אזהרות דחופות',
        '🚀 עדכוני טיולים חשובים',
        '👥 בקשות הצטרפות'
      ],
      enable: 'אפשר התראות',
      later: 'אולי מאוחר יותר',
      enabling: 'מאפשר...'
    },
    en: {
      title: 'Enable Notifications',
      description: 'Enable notifications to stay updated on your trips',
      benefits: [
        '📱 New chat messages',
        '⚠️ Urgent alerts',
        '🚀 Important trip updates',
        '👥 Join requests'
      ],
      enable: 'Enable Notifications',
      later: 'Maybe Later',
      enabling: 'Enabling...'
    },
    ru: {
      title: 'Включить уведомления',
      description: 'Включите уведомления, чтобы не пропустить важные обновления',
      benefits: [
        '📱 Новые сообщения в чате',
        '⚠️ Срочные уведомления',
        '🚀 Важные обновления поездок',
        '👥 Запросы на участие'
      ],
      enable: 'Включить уведомления',
      later: 'Позже',
      enabling: 'Включение...'
    },
    es: {
      title: 'Activar notificaciones',
      description: 'Activa las notificaciones para no perderte actualizaciones importantes',
      benefits: [
        '📱 Nuevos mensajes de chat',
        '⚠️ Alertas urgentes',
        '🚀 Actualizaciones importantes',
        '👥 Solicitudes para unirse'
      ],
      enable: 'Activar notificaciones',
      later: 'Tal vez más tarde',
      enabling: 'Activando...'
    },
    fr: {
      title: 'Activer les notifications',
      description: 'Activez les notifications pour ne rien manquer',
      benefits: [
        '📱 Nouveaux messages',
        '⚠️ Alertes urgentes',
        '🚀 Mises à jour importantes',
        '👥 Demandes de participation'
      ],
      enable: 'Activer notifications',
      later: 'Plus tard',
      enabling: 'Activation...'
    },
    de: {
      title: 'Benachrichtigungen aktivieren',
      description: 'Aktivieren Sie Benachrichtigungen für wichtige Updates',
      benefits: [
        '📱 Neue Nachrichten',
        '⚠️ Dringende Warnungen',
        '🚀 Wichtige Updates',
        '👥 Beitrittsanfragen'
      ],
      enable: 'Benachrichtigungen aktivieren',
      later: 'Vielleicht später',
      enabling: 'Wird aktiviert...'
    },
    it: {
      title: 'Attiva notifiche',
      description: 'Attiva le notifiche per non perdere aggiornamenti importanti',
      benefits: [
        '📱 Nuovi messaggi',
        '⚠️ Avvisi urgenti',
        '🚀 Aggiornamenti importanti',
        '👥 Richieste di partecipazione'
      ],
      enable: 'Attiva notifiche',
      later: 'Forse più tardi',
      enabling: 'Attivazione...'
    }
  };

  const t = translations[language] || translations.en;

  useEffect(() => {
    const checkPermission = async () => {
      // Only run on first visit after login
      const hasChecked = localStorage.getItem('notification_permission_checked');
      if (hasChecked) return;

      // Check if user is logged in
      try {
        const user = await base44.auth.me();
        if (!user) return;

        // Check if browser supports notifications
        if (!('Notification' in window) || !('serviceWorker' in navigator)) {
          localStorage.setItem('notification_permission_checked', 'true');
          return;
        }

        // Check current permission status
        if (Notification.permission === 'default') {
          // Wait a bit after page load to not be intrusive
          setTimeout(() => {
            setShowDialog(true);
          }, 3000);
        } else {
          localStorage.setItem('notification_permission_checked', 'true');
        }
      } catch (error) {
        console.log('Not logged in');
      }
    };

    checkPermission();
  }, []);

  const handleEnable = async () => {
    setRequesting(true);
    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        toast.success(language === 'he' ? 'התראות הופעלו!' : 'Notifications enabled!');
        localStorage.setItem('notification_permission_checked', 'true');
        setShowDialog(false);
        
        // Trigger subscription process
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: await getVapidPublicKey()
          });

          // Save subscription
          await base44.functions.invoke('savePushSubscription', {
            subscription: JSON.stringify(subscription)
          });
        }
      } else {
        toast.error(language === 'he' ? 'לא ניתן להפעיל התראות' : 'Could not enable notifications');
        localStorage.setItem('notification_permission_checked', 'true');
        setShowDialog(false);
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      toast.error(language === 'he' ? 'שגיאה בהפעלת התראות' : 'Error enabling notifications');
    }
    setRequesting(false);
  };

  const handleLater = () => {
    setShowDialog(false);
    // Don't mark as checked so it can appear again later
  };

  const getVapidPublicKey = async () => {
    // This should be stored in your environment or fetched from backend
    const publicKey = 'YOUR_VAPID_PUBLIC_KEY'; // Replace with actual key
    const urlBase64ToUint8Array = (base64String) => {
      const padding = '='.repeat((4 - base64String.length % 4) % 4);
      const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);
      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      return outputArray;
    };
    return urlBase64ToUint8Array(publicKey);
  };

  return (
    <AnimatePresence>
      {showDialog && (
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center justify-between mb-4">
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                  className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl"
                >
                  <Bell className="w-8 h-8 text-white" />
                </motion.div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLater}
                  className="h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <DialogTitle className="text-2xl font-bold">
                {t.title}
              </DialogTitle>
              <DialogDescription className="text-base">
                {t.description}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-4">
              {t.benefits.map((benefit, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <span className="text-lg">{benefit}</span>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <Button
                onClick={handleEnable}
                disabled={requesting}
                className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold"
              >
                {requesting ? t.enabling : t.enable}
              </Button>
              <Button
                variant="ghost"
                onClick={handleLater}
                disabled={requesting}
                className="w-full"
              >
                {t.later}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}