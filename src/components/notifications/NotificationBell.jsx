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
import { Bell, Check, Trash2, X, Users, MessageSquare, Calendar, TrendingUp, UserPlus, UserCheck, Mail } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { he, enUS } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import FriendChatDialog from '../chat/FriendChatDialog';
import { toast } from 'sonner';

const notificationIcons = {
  join_request: Users,
  new_message: MessageSquare,
  trip_update: TrendingUp,
  trip_reminder: Calendar,
  friend_request: UserPlus,
  inbox_message: Mail,
};

export default function NotificationBell({ userEmail }) {
  const { language } = useLanguage();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [showChatDialog, setShowChatDialog] = useState(false);
  const [chatFriend, setChatFriend] = useState(null);

  // For demo purposes, we'll check for:
  // 1. Join requests on user's trips
  // 2. New messages in trips user participates in
  // 3. Upcoming trip reminders
  
  const { data: userTrips = [] } = useQuery({
    queryKey: ['userTripsForNotifications', userEmail],
    queryFn: () => base44.entities.Trip.list(),
    enabled: !!userEmail,
    staleTime: 60000,
  });

  const { data: reminders = [] } = useQuery({
    queryKey: ['upcomingReminders', userEmail],
    queryFn: () => base44.entities.TripReminder.filter({
      user_email: userEmail,
      sent: false
    }),
    enabled: !!userEmail,
    staleTime: 60000,
  });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUserForNotifications', userEmail],
    queryFn: () => base44.auth.me(),
    enabled: !!userEmail,
    staleTime: 30000,
  });

  // Fetch unread messages
  const { data: unreadMessages = [] } = useQuery({
    queryKey: ['unreadMessages', userEmail],
    queryFn: () => base44.entities.Message.filter({ 
      recipient_email: userEmail,
      read: false,
      archived: false
    }, '-created_date', 10),
    enabled: !!userEmail,
    staleTime: 30000,
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['usersForNotifications'],
    queryFn: () => base44.entities.User.list(),
    enabled: !!userEmail && (currentUser?.friend_requests?.length > 0),
    staleTime: 60000,
  });

  const organizedTrips = userTrips.filter(t => t.organizer_email === userEmail);
  const participatingTrips = userTrips.filter(t => 
    t.participants?.some(p => p.email === userEmail) && 
    t.organizer_email !== userEmail
  );

  // Calculate notifications
  const notifications = [];

  // Inbox messages
  unreadMessages.forEach(msg => {
    notifications.push({
      id: `inbox_${msg.id}`,
      type: 'inbox_message',
      messageId: msg.id,
      message: language === 'he' 
        ? `${msg.sender_name}: ${msg.subject}`
        : `${msg.sender_name}: ${msg.subject}`,
      timestamp: msg.sent_at,
      unread: true
    });
  });

  // Friend requests
  const friendRequests = currentUser?.friend_requests || [];
  friendRequests.forEach(request => {
    const requester = allUsers.find(u => u.email === request.email);
    const requesterName = requester 
      ? ((requester.first_name && requester.last_name) 
        ? `${requester.first_name} ${requester.last_name}` 
        : requester.full_name || requester.email)
      : request.email;

    notifications.push({
      id: `friend_request_${request.email}`,
      type: 'friend_request',
      requesterEmail: request.email,
      message: language === 'he' 
        ? `${requesterName} שלח/ה לך בקשת חברות`
        : `${requesterName} sent you a friend request`,
      timestamp: request.timestamp,
      unread: true
    });
  });

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

  const acceptFriendMutation = useMutation({
    mutationFn: async (requesterEmail) => {
      const myFriends = currentUser?.friends || [];
      const myRequests = currentUser?.friend_requests || [];
      
      const updatedMyFriends = [...myFriends, requesterEmail];
      const updatedMyRequests = myRequests.filter(req => req.email !== requesterEmail);
      
      await base44.auth.updateMe({
        friends: updatedMyFriends,
        friend_requests: updatedMyRequests
      });

      const requester = allUsers.find(u => u.email === requesterEmail);
      if (requester) {
        const updatedTheirFriends = [...(requester.friends || []), userEmail];
        await base44.entities.User.update(requester.id, {
          friends: updatedTheirFriends
        });
      }

      return requester;
    },
    onSuccess: (requester) => {
      queryClient.invalidateQueries(['currentUserForNotifications']);
      queryClient.invalidateQueries(['users']);
      toast.success(language === 'he' ? 'בקשה התקבלה' : 'Request accepted');
      
      // Open chat with new friend
      if (requester) {
        setChatFriend(requester);
        setShowChatDialog(true);
      }
    },
  });

  const rejectFriendMutation = useMutation({
    mutationFn: async (requesterEmail) => {
      const myRequests = currentUser?.friend_requests || [];
      const updatedRequests = myRequests.filter(req => req.email !== requesterEmail);
      await base44.auth.updateMe({ friend_requests: updatedRequests });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['currentUserForNotifications']);
      toast.success(language === 'he' ? 'בקשה נדחתה' : 'Request rejected');
    },
  });

  const handleNotificationClick = (notification) => {
    setOpen(false);
  };

  const renderNotificationLink = (notification, children) => {
    if (notification.type === 'friend_request' || notification.type === 'inbox_message') {
      const targetPage = notification.type === 'friend_request' ? 'Community' : 'Inbox';
      return (
        <Link 
          to={createPageUrl(targetPage)}
          onClick={() => handleNotificationClick(notification)}
        >
          {children}
        </Link>
      );
    }
    return (
      <Link 
        to={createPageUrl('TripDetails') + '?id=' + notification.tripId}
        onClick={() => handleNotificationClick(notification)}
      >
        {children}
      </Link>
    );
  };

  return (
    <>
      <FriendChatDialog
        open={showChatDialog}
        onOpenChange={setShowChatDialog}
        friend={chatFriend}
        currentUser={currentUser}
      />

    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative"
          onClick={(e) => {
            e.stopPropagation();
            setOpen(!open);
          }}
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
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
                
                if (notification.type === 'friend_request') {
                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 hover:bg-gray-50 transition-colors ${
                        notification.unread ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 mb-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mb-2">
                            {formatDistanceToNow(new Date(notification.timestamp), {
                              addSuffix: true,
                              locale: language === 'he' ? he : enUS
                            })}
                          </p>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                acceptFriendMutation.mutate(notification.requesterEmail);
                              }}
                              disabled={acceptFriendMutation.isLoading}
                              className="bg-emerald-600 hover:bg-emerald-700 h-7 text-xs"
                            >
                              <UserCheck className="w-3 h-3 mr-1" />
                              {language === 'he' ? 'אשר' : 'Accept'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                rejectFriendMutation.mutate(notification.requesterEmail);
                              }}
                              disabled={rejectFriendMutation.isLoading}
                              className="h-7 text-xs"
                            >
                              <X className="w-3 h-3 mr-1" />
                              {language === 'he' ? 'דחה' : 'Reject'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                }

                const bgColor = notification.type === 'inbox_message' 
                  ? 'bg-amber-100' 
                  : 'bg-emerald-100';
                const textColor = notification.type === 'inbox_message'
                  ? 'text-amber-600'
                  : 'text-emerald-600';

                return (
                  <div key={notification.id}>
                    {renderNotificationLink(
                      notification,
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                          notification.unread ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex gap-3">
                          <div className={`w-10 h-10 ${bgColor} rounded-full flex items-center justify-center flex-shrink-0`}>
                            <Icon className={`w-5 h-5 ${textColor}`} />
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
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
    </>
  );
}