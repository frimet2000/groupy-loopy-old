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
    // Check if user has already installed or dismissed
    const hasInstalled = localStorage.getItem('pwa_installed');
    const hasDismissed = localStorage.getItem('pwa_dismissed');
    const isFirstLogin = localStorage.getItem('first_login_completed');

    // Only show after first login and if not dismissed/installed
    if (isFirstLogin && !hasInstalled && !hasDismissed) {
      // Listen for beforeinstallprompt event
      const handleBeforeInstallPrompt = (e) => {
        e.preventDefault();
        setDeferredPrompt(e);
        // Show prompt after a short delay
        setTimeout(() => setShowPrompt(true), 2000);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
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

  if (!showPrompt) return null;

  return (
    <Dialog open={showPrompt} onOpenChange={setShowPrompt}>
      <DialogContent className="sm:max-w-md">
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
            {language === 'he' ? 'התקן את האפליקציה' : 'Install the App'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {language === 'he' 
              ? 'קבל גישה מהירה מהמסך הבית, התראות בזמן אמת וחוויה משופרת'
              : 'Get quick access from home screen, real-time notifications and enhanced experience'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg">
            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Download className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-emerald-900">
                {language === 'he' ? 'פעולה מהירה' : 'Quick Access'}
              </p>
              <p className="text-sm text-emerald-700">
                {language === 'he' 
                  ? 'פתח את האפליקציה ישירות מהמסך הבית'
                  : 'Open the app directly from your home screen'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-lg">🔔</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-blue-900">
                {language === 'he' ? 'התראות בזמן אמת' : 'Real-time Notifications'}
              </p>
              <p className="text-sm text-blue-700">
                {language === 'he' 
                  ? 'קבל עדכונים על הודעות חדשות ובקשות'
                  : 'Get updates on new messages and requests'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-lg">⚡</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-purple-900">
                {language === 'he' ? 'ביצועים מהירים' : 'Fast Performance'}
              </p>
              <p className="text-sm text-purple-700">
                {language === 'he' 
                  ? 'טעינה מהירה יותר וחוויה חלקה'
                  : 'Faster loading and smoother experience'}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button 
            variant="ghost" 
            onClick={handleDismiss}
            className="w-full sm:w-auto order-3 sm:order-1"
          >
            <X className="w-4 h-4 mr-2" />
            {language === 'he' ? 'לא תודה' : 'No Thanks'}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleLater}
            className="w-full sm:w-auto order-2"
          >
            {language === 'he' ? 'מאוחר יותר' : 'Later'}
          </Button>
          <Button 
            onClick={handleInstall}
            disabled={!deferredPrompt}
            className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 order-1 sm:order-3"
          >
            <Download className="w-4 h-4 mr-2" />
            {language === 'he' ? 'התקן עכשיו' : 'Install Now'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}