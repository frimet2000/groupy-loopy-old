import React, { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Bell, Check, Trash2, X, Users, MessageSquare, Calendar, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { he, enUS } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const notificationIcons = {
  join_request: Users,
  new_message: MessageSquare,
  trip_update: TrendingUp,
  trip_reminder: Calendar,
};

export default function NotificationBell({ userEmail }) {
  const { language } = useLanguage();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  // For demo purposes, we'll check for:
  // 1. Join requests on user's trips
  // 2. New messages in trips user participates in
  // 3. Upcoming trip reminders
  
  const { data: userTrips = [] } = useQuery({
    queryKey: ['userTripsForNotifications', userEmail],
    queryFn: () => base44.entities.Trip.list(),
    enabled: !!userEmail,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: reminders = [] } = useQuery({
    queryKey: ['upcomingReminders', userEmail],
    queryFn: () => base44.entities.TripReminder.filter({
      user_email: userEmail,
      sent: false
    }),
    enabled: !!userEmail,
    refetchInterval: 60000, // Refresh every minute
  });

  const organizedTrips = userTrips.filter(t => t.organizer_email === userEmail);
  const participatingTrips = userTrips.filter(t => 
    t.participants?.some(p => p.email === userEmail) && 
    t.organizer_email !== userEmail
  );

  // Calculate notifications
  const notifications = [];

  // Join requests for organized trips
  organizedTrips.forEach(trip => {
    const pendingRequests = trip.pending_requests || [];
    pendingRequests.forEach(request => {
      notifications.push({
        id: `join_${trip.id}_${request.email}`,
        type: 'join_request',
        tripId: trip.id,
        tripTitle: trip.title || trip.title_he || trip.title_en,
        message: language === 'he' 
          ? `${request.name} מבקש להצטרף לטיול "${trip.title || trip.title_he || trip.title_en}"`
          : `${request.name} requested to join "${trip.title || trip.title_he || trip.title_en}"`,
        timestamp: request.requested_at,
        unread: true
      });
    });
  });

  // Upcoming reminders (within next 24 hours)
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  reminders.forEach(reminder => {
    const reminderTime = new Date(reminder.reminder_time);
    if (reminderTime <= tomorrow && reminderTime >= now) {
      const trip = userTrips.find(t => t.id === reminder.trip_id);
      if (trip) {
        notifications.push({
          id: `reminder_${reminder.id}`,
          type: 'trip_reminder',
          tripId: trip.id,
          tripTitle: trip.title || trip.title_he || trip.title_en,
          message: language === 'he'
            ? `תזכורת לטיול "${trip.title || trip.title_he || trip.title_en}"`
            : `Reminder for trip "${trip.title || trip.title_he || trip.title_en}"`,
          timestamp: reminder.reminder_time,
          unread: true
        });
      }
    }
  });

  // Sort by timestamp (newest first)
  notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleNotificationClick = (notification) => {
    // Navigate to the trip details
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1"
              >
                <Badge className="h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">
              {language === 'he' ? 'התראות' : 'Notifications'}
            </h3>
            {unreadCount > 0 && (
              <Badge variant="secondary">{unreadCount}</Badge>
            )}
          </div>
        </div>
        <ScrollArea className="h-96">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">
                {language === 'he' ? 'אין התראות חדשות' : 'No new notifications'}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification, index) => {
                const Icon = notificationIcons[notification.type] || Bell;
                return (
                  <Link 
                    key={notification.id}
                    to={createPageUrl('TripDetails') + '?id=' + notification.tripId}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        notification.unread ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 mb-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(notification.timestamp), {
                              addSuffix: true,
                              locale: language === 'he' ? he : enUS
                            })}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}