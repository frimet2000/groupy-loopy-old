import React, { useEffect, useRef } from 'react';
import { useLanguage } from '../LanguageContext';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function MessageListener() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const lastSeenIdRef = useRef(localStorage.getItem('last_toast_msg_id'));

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const { data: unreadMessages = [] } = useQuery({
    queryKey: ['unreadMessages', user?.email],
    queryFn: () => base44.entities.Message.filter({ recipient_email: user.email, read: false }, '-sent_at'),
    enabled: !!user?.email,
    refetchInterval: 5000,
  });

  useEffect(() => {
    if (!unreadMessages || unreadMessages.length === 0) return;
    const newest = unreadMessages[0];
    if (!newest?.id) return;
    if (lastSeenIdRef.current === newest.id) return;
    if (document.visibilityState !== 'visible') return; // SW push will handle when app hidden

    lastSeenIdRef.current = newest.id;
    localStorage.setItem('last_toast_msg_id', newest.id);

    const title = language === 'he' ? 'הודעה חדשה' : 'New message';
    const action = language === 'he' ? 'לחץ לצפייה' : 'Click to view';
    const preview = (newest.body || '').slice(0, 80);

    toast.info(`${title}: ${preview}`, {
      action: {
        label: action,
        onClick: () => {
          const url = createPageUrl('Inbox') + `?chat=${encodeURIComponent(newest.sender_email)}`;
          navigate(url);
        }
      }
    });
  }, [unreadMessages, language, navigate]);

  return null;
}