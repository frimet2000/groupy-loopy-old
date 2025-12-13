import React, { useEffect, useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Megaphone, Mail } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AnnouncementToast() {
  const { language } = useLanguage();
  const [user, setUser] = useState(null);
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState(() => {
    const dismissed = localStorage.getItem('dismissed_announcements');
    return dismissed ? JSON.parse(dismissed) : [];
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (e) {
        console.log('Not logged in');
      }
    };
    fetchUser();
  }, []);

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
      ).map(a => ({ ...a, type: 'announcement' }));
    },
    refetchInterval: 60000, // Refetch every minute
  });

  // Fetch private messages (admin messages)
  const { data: privateMessages = [] } = useQuery({
    queryKey: ['adminMessages', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const messages = await base44.entities.Notification.filter({ 
        recipient_email: user.email,
        notification_type: 'admin_message',
        read: false
      });
      return messages.filter(m => !dismissedAnnouncements.includes(m.id))
        .map(m => ({ ...m, type: 'private' }));
    },
    enabled: !!user?.email,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const allMessages = [...announcements, ...privateMessages].sort((a, b) => 
    new Date(b.sent_at || b.created_date) - new Date(a.sent_at || a.created_date)
  );

  const handleDismiss = async (message) => {
    const newDismissed = [...dismissedAnnouncements, message.id];
    setDismissedAnnouncements(newDismissed);
    localStorage.setItem('dismissed_announcements', JSON.stringify(newDismissed));
    
    // Mark as read if it's a private message
    if (message.type === 'private') {
      try {
        await base44.entities.Notification.update(message.id, { read: true });
      } catch (error) {
        console.log('Error marking message as read:', error);
      }
    }
  };

  const currentMessage = allMessages[0];
  
  if (!currentMessage) return null;

  const isPrivate = currentMessage.type === 'private';
  const gradientClass = isPrivate 
    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600'
    : 'bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600';
  
  const messageTitle = currentMessage.title || '';
  const messageBody = currentMessage.message || currentMessage.body || '';
  const messageSender = currentMessage.sent_by_name || '';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -100 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4"
      >
        <Card className={`${gradientClass} text-white border-0 shadow-2xl overflow-hidden`}>
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
                {isPrivate ? <Mail className="w-5 h-5" /> : <Megaphone className="w-5 h-5" />}
              </motion.div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <h3 className="font-bold text-lg leading-tight text-white">
                      {messageTitle}
                    </h3>
                    <p className="text-xs text-white/80 mt-0.5">
                      {isPrivate 
                        ? (language === 'he' ? 'הודעה מהמנהל' : 'Message from Admin')
                        : `${language === 'he' ? 'מאת' : 'From'} ${messageSender}`}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDismiss(currentMessage)}
                    className="h-8 w-8 text-white hover:bg-white/20 flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-white/90 leading-relaxed whitespace-pre-wrap">
                  {messageBody}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}