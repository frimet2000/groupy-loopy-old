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
  const [localDismissed, setLocalDismissed] = useState([]);

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

  const allMessages = [...announcements, ...privateMessages]
    .filter(m => !localDismissed.includes(m.id))
    .sort((a, b) => 
      new Date(b.sent_at || b.created_date) - new Date(a.sent_at || a.created_date)
    );

  const handleDismiss = (message) => {
    // Immediate local dismissal for instant UI update
    setLocalDismissed(prev => [...prev, message.id]);
    
    const newDismissed = [...dismissedAnnouncements, message.id];
    setDismissedAnnouncements(newDismissed);
    localStorage.setItem('dismissed_announcements', JSON.stringify(newDismissed));
    
    // Mark as read if it's a private message (async without waiting)
    if (message.type === 'private') {
      base44.entities.Notification.update(message.id, { read: true }).catch(err => 
        console.log('Error marking message as read:', err)
      );
    }
  };

  const currentMessage = allMessages[0];
  
  if (!currentMessage) return null;

  const isPrivate = currentMessage.type === 'private';
  const gradientClass = isPrivate 
    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600'
    : 'bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600';
  
  const messageTitle = currentMessage.title || 'הודעה';
  const messageBody = currentMessage.message || currentMessage.body || 'אין תוכן';
  const messageSender = currentMessage.sent_by_name || 'מנהל';

  console.log('Current message:', currentMessage);
  console.log('Message title:', messageTitle);
  console.log('Message body:', messageBody);

  return (
    <AnimatePresence>
      {currentMessage && (
        <motion.div
          key={currentMessage.id}
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ 
            type: "spring", 
            stiffness: 200, 
            damping: 25,
            exit: { duration: 0.2, ease: "easeOut" }
          }}
          className="fixed top-20 left-0 right-0 z-[9999] px-3 sm:px-4 sm:left-1/2 sm:-translate-x-1/2 sm:max-w-2xl pointer-events-auto"
        >
          <div className={`${gradientClass} rounded-xl shadow-2xl overflow-hidden`}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
            <div className="relative p-4 sm:p-6">
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
                  className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0"
                >
                  {isPrivate ? <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-white" /> : <Megaphone className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
                </motion.div>
                <div className="flex-1 min-w-0 overflow-hidden">
                  <div className="mb-2">
                    <h3 className="font-bold text-base sm:text-xl leading-tight mb-1 text-white break-words">
                      {messageTitle}
                    </h3>
                    <p className="text-xs sm:text-sm text-white/85">
                      {isPrivate 
                        ? (language === 'he' ? 'הודעה מהמנהל' : 'Message from Admin')
                        : `${language === 'he' ? 'מאת' : 'From'} ${messageSender}`}
                    </p>
                  </div>
                  <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap text-white break-words mb-3">
                    {messageBody}
                  </p>
                  <div className="flex justify-end pt-2 border-t border-white/20">
                    <Button
                      onClick={() => handleDismiss(currentMessage)}
                      className="bg-white/20 hover:bg-white/30 text-white border border-white/30 transition-all text-sm sm:text-base"
                      size="sm"
                    >
                      {language === 'he' ? 'אישור קריאה' : 'Mark as Read'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}