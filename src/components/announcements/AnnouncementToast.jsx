import React, { useEffect, useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Megaphone } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AnnouncementToast() {
  const { language } = useLanguage();
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState(() => {
    const dismissed = localStorage.getItem('dismissed_announcements');
    return dismissed ? JSON.parse(dismissed) : [];
  });

  // Fetch active announcements
  const { data: announcements = [] } = useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      const all = await base44.entities.CommunityAnnouncement.list('-created_date');
      const now = new Date();
      return all.filter(a => 
        a.active && 
        new Date(a.expires_at) > now &&
        !dismissedAnnouncements.includes(a.id)
      );
    },
    refetchInterval: 60000, // Refetch every minute
  });

  const handleDismiss = (announcementId) => {
    const newDismissed = [...dismissedAnnouncements, announcementId];
    setDismissedAnnouncements(newDismissed);
    localStorage.setItem('dismissed_announcements', JSON.stringify(newDismissed));
  };

  const currentAnnouncement = announcements[0];

  return (
    <AnimatePresence>
      {currentAnnouncement && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4"
        >
          <Card className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white border-0 shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
            <div className="relative p-4">
              <div className="flex items-start gap-3">
                <motion.div
                  animate={{ 
                    rotate: [0, -10, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                  className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0"
                >
                  <Megaphone className="w-5 h-5" />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <h3 className="font-bold text-lg leading-tight">
                        {currentAnnouncement.title}
                      </h3>
                      <p className="text-xs text-white/80 mt-0.5">
                        {language === 'he' ? 'מאת' : 'From'} {currentAnnouncement.sent_by_name}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDismiss(currentAnnouncement.id)}
                      className="h-8 w-8 text-white hover:bg-white/20 flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-white/90 leading-relaxed whitespace-pre-wrap">
                    {currentAnnouncement.message}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}