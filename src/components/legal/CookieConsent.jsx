import React, { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Cookie, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function CookieConsent() {
  const { language, isRTL } = useLanguage();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie_consent', 'declined');
    setShowBanner(false);
  };

  const content = language === 'he' ? {
    title: 'עוגיות ופרטיות',
    message: 'אנחנו משתמשים בעוגיות כדי לשפר את החוויה שלך באתר, לנתח תנועה ולספק תכונות מותאמות אישית.',
    learnMore: 'קרא עוד',
    accept: 'אני מסכים',
    decline: 'דחה'
  } : {
    title: 'Cookies & Privacy',
    message: 'We use cookies to improve your experience, analyze traffic, and provide personalized features.',
    learnMore: 'Learn more',
    accept: 'Accept',
    decline: 'Decline'
  };

  return (
    <AnimatePresence>
      {showBanner &&
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-md"
        role="dialog"
        aria-labelledby="cookie-title"
        aria-describedby="cookie-description">

          <Card className="bg-white text-card-foreground my-16 rounded-xl shadow-2xl border-2">
            <div className="my-3 p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Cookie className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 id="cookie-title" className="font-bold text-lg mb-2" dir={isRTL ? 'rtl' : 'ltr'}>
                    {content.title}
                  </h3>
                  <p id="cookie-description" className="text-sm text-gray-600 mb-3" dir={isRTL ? 'rtl' : 'ltr'}>
                    {content.message}
                  </p>
                  <Link to={createPageUrl('CookiePolicy')}>
                    <Button variant="link" className="p-0 h-auto text-sm text-emerald-600 hover:text-emerald-700">
                      {content.learnMore}
                    </Button>
                  </Link>
                </div>
                <Button
                variant="ghost"
                size="icon"
                onClick={handleDecline}
                className="flex-shrink-0"
                aria-label={language === 'he' ? 'סגור' : 'Close'}>

                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex gap-3">
                <Button
                variant="outline"
                onClick={handleDecline}
                className="flex-1">

                  {content.decline}
                </Button>
                <Button
                onClick={handleAccept}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700">

                  {content.accept}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      }
    </AnimatePresence>);

}