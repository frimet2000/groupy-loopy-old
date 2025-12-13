import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguage } from '../components/LanguageContext';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Check, Trash2, Settings, Calendar, MessageCircle, UserPlus, AlertCircle, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { he, enUS } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const notificationIcons = {
  trip_reminder: Calendar,
  join_request: UserPlus,
  request_approved: Check,
  new_message: MessageCircle,
  trip_update: AlertCircle,
  trip_cancelled: AlertCircle,
  upcoming_trip: Calendar,
};

const notificationColors = {
  trip_reminder: 'bg-blue-50 border-blue-200 text-blue-700',
  join_request: 'bg-purple-50 border-purple-200 text-purple-700',
  request_approved: 'bg-green-50 border-green-200 text-green-700',
  new_message: 'bg-orange-50 border-orange-200 text-orange-700',
  trip_update: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  trip_cancelled: 'bg-red-50 border-red-200 text-red-700',
  upcoming_trip: 'bg-blue-50 border-blue-200 text-blue-700',
};

export default function Notifications() {
  const { t, language, isRTL } = useLanguage();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (e) {
        base44.auth.redirectToLogin(createPageUrl('Notifications'));
      }
    };
    fetchUser();
  }, []);

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', user?.email],
    queryFn: () => base44.entities.Notification.filter({ user_email: user.email }, '-created_date'),
    enabled: !!user?.email,
    refetchInterval: 10000,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { read: true }),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      toast.success(language === 'he' ? 'ההתראה נמחקה' : 'Notification deleted');
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const unreadNotifications = notifications.filter(n => !n.read);
      await Promise.all(unreadNotifications.map(n => 
        base44.entities.Notification.update(n.id, { read: true })
      ));
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      toast.success(language === 'he' ? 'כל ההתראות סומנו כנקראו' : 'All notifications marked as read');
    },
  });

  const deleteAllMutation = useMutation({
    mutationFn: async () => {
      await Promise.all(notifications.map(n => 
        base44.entities.Notification.delete(n.id)
      ));
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      toast.success(language === 'he' ? 'כל ההתראות נמחקו' : 'All notifications deleted');
    },
  });

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.read;
    return n.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Bell className="w-8 h-8 text-emerald-600" />
              {language === 'he' ? 'התראות' : 'Notifications'}
            </h1>
            {unreadCount > 0 && (
              <p className="text-gray-600 mt-1">
                {unreadCount} {language === 'he' ? 'התראות חדשות' : 'new notifications'}
              </p>
            )}
          </div>
          <Link to={createPageUrl('Settings')}>
            <Button variant="outline" className="gap-2">
              <Settings className="w-4 h-4" />
              {language === 'he' ? 'הגדרות' : 'Settings'}
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="all" onValueChange={setFilter}>
          <TabsList className="grid grid-cols-4 w-full mb-6">
            <TabsTrigger value="all">
              {language === 'he' ? 'הכל' : 'All'}
            </TabsTrigger>
            <TabsTrigger value="unread">
              {language === 'he' ? 'לא נקרא' : 'Unread'}
              {unreadCount > 0 && (
                <Badge className="ml-2 bg-emerald-600">{unreadCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="trip_reminder">
              {language === 'he' ? 'תזכורות' : 'Reminders'}
            </TabsTrigger>
            <TabsTrigger value="new_message">
              {language === 'he' ? 'הודעות' : 'Messages'}
            </TabsTrigger>
          </TabsList>

          {notifications.length > 0 && (
            <div className="flex gap-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={unreadCount === 0 || markAllAsReadMutation.isLoading}
              >
                <Check className="w-4 h-4 mr-2" />
                {language === 'he' ? 'סמן הכל כנקרא' : 'Mark all as read'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => deleteAllMutation.mutate()}
                disabled={deleteAllMutation.isLoading}
                className="text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {language === 'he' ? 'מחק הכל' : 'Delete all'}
              </Button>
            </div>
          )}

          <TabsContent value={filter} className="mt-0">
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-24 bg-gray-200 animate-pulse rounded-xl" />
                ))}
              </div>
            ) : filteredNotifications.length > 0 ? (
              <AnimatePresence>
                <div className="space-y-3">
                  {filteredNotifications.map((notification) => {
                    const Icon = notificationIcons[notification.type] || Bell;
                    const colorClass = notificationColors[notification.type] || 'bg-gray-50 border-gray-200';
                    
                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                      >
                        <Card 
                          className={`${!notification.read ? 'border-l-4 border-l-emerald-600' : ''} hover:shadow-md transition-all cursor-pointer`}
                          onClick={() => {
                            if (!notification.read) {
                              markAsReadMutation.mutate(notification.id);
                            }
                            if (notification.action_url) {
                              window.location.href = notification.action_url;
                            }
                          }}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg ${colorClass}`}>
                                <Icon className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <h3 className={`font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                                    {notification.title}
                                  </h3>
                                  {!notification.read && (
                                    <Badge className="bg-emerald-600 flex-shrink-0">
                                      {language === 'he' ? 'חדש' : 'New'}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mt-1" dir={isRTL ? 'rtl' : 'ltr'}>
                                  {notification.body}
                                </p>
                                <p className="text-xs text-gray-400 mt-2">
                                  {formatDistanceToNow(new Date(notification.created_date), {
                                    addSuffix: true,
                                    locale: language === 'he' ? he : enUS
                                  })}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteMutation.mutate(notification.id);
                                }}
                                className="flex-shrink-0"
                              >
                                <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-600" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </AnimatePresence>
            ) : (
              <Card className="p-12 text-center">
                <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {language === 'he' ? 'אין התראות' : 'No notifications'}
                </h3>
                <p className="text-gray-600">
                  {language === 'he' 
                    ? 'כל ההתראות שלך יופיעו כאן'
                    : 'All your notifications will appear here'}
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}