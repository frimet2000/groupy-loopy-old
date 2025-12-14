import React, { useState, useEffect } from 'react';
import { useLanguage } from '../components/LanguageContext';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { motion } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  Heart, 
  MessageCircle, 
  Calendar, 
  Search,
  X,
  Loader2,
  TrendingUp,
  Megaphone,
  Send,
  Mail,
  Clock,
  MessageSquare
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { formatDate } from '../components/utils/dateFormatter';
import FriendChatDialog from '../components/chat/FriendChatDialog';
import FriendRequestsNotification from '../components/friends/FriendRequestsNotification';

export default function Community() {
  const { t, language, isRTL } = useLanguage();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAnnouncementDialog, setShowAnnouncementDialog] = useState(false);
  const [announcementData, setAnnouncementData] = useState({
    title: '',
    message: '',
    expires_in_days: 7
  });
  const [showPrivateMessageDialog, setShowPrivateMessageDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [privateMessage, setPrivateMessage] = useState({ title: '', message: '' });
  const [showChatDialog, setShowChatDialog] = useState(false);
  const [chatFriend, setChatFriend] = useState(null);

  // Fetch sent announcements (admin only)
  const { data: sentAnnouncements = [] } = useQuery({
    queryKey: ['sentAnnouncements', user?.email],
    queryFn: async () => {
      if (user?.role !== 'admin') return [];
      return base44.entities.CommunityAnnouncement.filter({ sent_by: user.email }, '-created_date');
    },
    enabled: !!user && user?.role === 'admin',
  });

  // Fetch sent private messages (admin only)
  const { data: sentPrivateMessages = [] } = useQuery({
    queryKey: ['sentPrivateMessages', user?.email],
    queryFn: async () => {
      if (user?.role !== 'admin') return [];
      const notifications = await base44.entities.Notification.filter({ notification_type: 'admin_message' }, '-created_date');
      // Filter only messages sent by current admin (checking title/body for admin name as fallback)
      return notifications;
    },
    enabled: !!user && user?.role === 'admin',
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (e) {
        base44.auth.redirectToLogin(window.location.href);
      }
    };
    fetchUser();
  }, []);

  // Fetch all users
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
    enabled: !!user,
  });

  // Fetch all trips
  const { data: trips = [] } = useQuery({
    queryKey: ['trips'],
    queryFn: () => base44.entities.Trip.list('-created_date'),
    enabled: !!user,
  });

  // Send announcement mutation
  const sendAnnouncementMutation = useMutation({
    mutationFn: async (data) => {
      const userName = (user.first_name && user.last_name) 
        ? `${user.first_name} ${user.last_name}` 
        : user.full_name;
      
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + data.expires_in_days);
      
      return base44.entities.CommunityAnnouncement.create({
        title: data.title,
        message: data.message,
        sent_by: user.email,
        sent_by_name: userName,
        expires_at: expiresAt.toISOString(),
        active: true
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['announcements']);
      setShowAnnouncementDialog(false);
      setAnnouncementData({ title: '', message: '', expires_in_days: 7 });
      toast.success(language === 'he' ? 'ההודעה נשלחה לכל המשתמשים' : 'Announcement sent to all users');
    },
  });

  // Send private message mutation
  const sendPrivateMessageMutation = useMutation({
    mutationFn: async ({ targetEmail, title, message }) => {
      const userName = (user.first_name && user.last_name) 
        ? `${user.first_name} ${user.last_name}` 
        : user.full_name;
      
      // Create notification
      await base44.entities.Notification.create({
        recipient_email: targetEmail,
        notification_type: 'admin_message',
        title,
        body: message,
        sent_at: new Date().toISOString()
      });

      // Send push notification
      await base44.functions.invoke('sendPushNotification', {
        recipient_email: targetEmail,
        notification_type: 'admin_message',
        title: language === 'he' ? `הודעה מהמנהל: ${title}` : `Admin Message: ${title}`,
        body: message
      });
    },
    onSuccess: () => {
      setShowPrivateMessageDialog(false);
      setSelectedUser(null);
      setPrivateMessage({ title: '', message: '' });
      toast.success(language === 'he' ? 'ההודעה נשלחה' : 'Message sent');
    },
  });

  const myFriends = user?.friends || [];
  const myFriendRequests = user?.friend_requests || [];

  // Filter users for friend suggestions
  const suggestedFriends = users.filter(u => 
    u.email !== user?.email && 
    !myFriends.includes(u.email) &&
    !myFriendRequests.some(req => req.email === u.email)
  );

  // Friend request mutation
  const sendRequestMutation = useMutation({
    mutationFn: async (targetEmail) => {
      const targetUser = users.find(u => u.email === targetEmail);
      
      // Remove existing request from this user if exists, then add new one
      const existingRequests = (targetUser.friend_requests || []).filter(req => req.email !== user.email);
      const updatedRequests = [
        ...existingRequests,
        { email: user.email, timestamp: new Date().toISOString() }
      ];
      
      console.log('Sending friend request to:', targetEmail);
      console.log('Updated requests:', updatedRequests);
      
      await base44.entities.User.update(targetUser.id, {
        friend_requests: updatedRequests
      });
      
      const userName = (user.first_name && user.last_name) 
        ? `${user.first_name} ${user.last_name}` 
        : user.full_name;

      // Send email notification
      try {
        const emailSubject = language === 'he' 
          ? `בקשת חברות חדשה מ-${userName}`
          : `New Friend Request from ${userName}`;
        
        const emailBody = language === 'he'
          ? `שלום,\n\n${userName} שלח/ה לך בקשת חברות ב-The Group Loop.\n\nכדי לאשר או לדחות את הבקשה, היכנס לאתר ועבור לעמוד הקהילה.\n\nבברכה,\nצוות The Group Loop`
          : `Hello,\n\n${userName} sent you a friend request on The Group Loop.\n\nTo accept or decline this request, please log in to the website and go to the Community page.\n\nBest regards,\nThe Group Loop Team`;

        await base44.integrations.Core.SendEmail({
          to: targetEmail,
          subject: emailSubject,
          body: emailBody
        });
      } catch (error) {
        console.log('Email error:', error);
      }
      
      // Send push notification to target user
      try {
        await base44.functions.invoke('sendPushNotification', {
          recipient_email: targetEmail,
          notification_type: 'friend_requests',
          title: language === 'he' ? 'בקשת חברות חדשה' : 'New Friend Request',
          body: language === 'he' 
            ? `${userName} שלח/ה לך בקשת חברות`
            : `${userName} sent you a friend request`
        });
      } catch (error) {
        console.log('Notification error:', error);
      }
      
      return targetEmail;
    },
    onSuccess: async (targetEmail) => {
      await queryClient.invalidateQueries(['users']);
      await queryClient.invalidateQueries(['usersForNotifications']);
      await queryClient.invalidateQueries(['currentUserForNotifications']);
      await queryClient.refetchQueries(['users']);
      await queryClient.refetchQueries(['currentUserForNotifications']);
      toast.success(language === 'he' ? 'בקשת חברות נשלחה' : 'Friend request sent');
    },
  });

  // Accept friend request mutation
  const acceptRequestMutation = useMutation({
    mutationFn: async (requesterEmail) => {
      // Add to both users' friends lists
      const updatedMyFriends = [...myFriends, requesterEmail];
      const updatedMyRequests = myFriendRequests.filter(req => req.email !== requesterEmail);
      
      await base44.auth.updateMe({
        friends: updatedMyFriends,
        friend_requests: updatedMyRequests
      });

      // Add me to their friends list
      const requester = users.find(u => u.email === requesterEmail);
      const updatedTheirFriends = [...(requester.friends || []), user.email];
      await base44.entities.User.update(requester.id, {
        friends: updatedTheirFriends
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      setUser(prev => ({
        ...prev,
        friends: [...(prev.friends || []), acceptRequestMutation.variables],
        friend_requests: prev.friend_requests.filter(req => req.email !== acceptRequestMutation.variables)
      }));
      toast.success(language === 'he' ? 'בקשה התקבלה' : 'Request accepted');
    },
  });

  // Reject friend request mutation
  const rejectRequestMutation = useMutation({
    mutationFn: async (requesterEmail) => {
      const updatedRequests = myFriendRequests.filter(req => req.email !== requesterEmail);
      await base44.auth.updateMe({ friend_requests: updatedRequests });
    },
    onSuccess: () => {
      setUser(prev => ({
        ...prev,
        friend_requests: prev.friend_requests.filter(req => req.email !== rejectRequestMutation.variables)
      }));
      toast.success(language === 'he' ? 'בקשה נדחתה' : 'Request rejected');
    },
  });

  // Get friends' activity
  const friendsActivity = trips
    .filter(trip => {
      const isOrganizerFriend = myFriends.includes(trip.organizer_email);
      const hasParticipantFriend = trip.participants?.some(p => myFriends.includes(p.email));
      return isOrganizerFriend || hasParticipantFriend;
    })
    .slice(0, 20);

  const filteredUsers = suggestedFriends.filter(u => {
    if (!searchQuery) return true;
    const name = (u.first_name && u.last_name) 
      ? `${u.first_name} ${u.last_name}` 
      : u.full_name || u.email;
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const UserCard = ({ targetUser }) => {
    const userName = (targetUser.first_name && targetUser.last_name) 
      ? `${targetUser.first_name} ${targetUser.last_name}` 
      : targetUser.full_name || targetUser.email;
    
    const hasSentRequest = targetUser.friend_requests?.some(req => req.email === user.email);
    const isFriend = myFriends.includes(targetUser.email);

    return (
      <Card className="hover:shadow-lg transition-all">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white">
                {userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold">{userName}</p>
              <p className="text-sm text-gray-500">{targetUser.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }



  return (
    <>
      <FriendRequestsNotification 
        user={user}
        onAccept={(email) => acceptRequestMutation.mutate(email)}
        onReject={(email) => rejectRequestMutation.mutate(email)}
      />

      <FriendChatDialog
        open={showChatDialog}
        onOpenChange={setShowChatDialog}
        friend={chatFriend}
        currentUser={user}
      />

    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {language === 'he' ? 'קהילה' : language === 'ru' ? 'Сообщество' : language === 'es' ? 'Comunidad' : language === 'fr' ? 'Communauté' : language === 'de' ? 'Gemeinschaft' : language === 'it' ? 'Comunità' : 'Community'}
            </h1>
            <p className="text-gray-600">
              {language === 'he' 
                ? 'התחבר עם משתמשים אחרים וגלה פעילויות'
                : language === 'ru' ? 'Общайтесь с другими пользователями и открывайте новые активности'
                : language === 'es' ? 'Conéctate con otros usuarios y descubre actividades'
                : language === 'fr' ? 'Connectez-vous avec d\'autres utilisateurs et découvrez des activités'
                : language === 'de' ? 'Verbinden Sie sich mit anderen Benutzern und entdecken Sie Aktivitäten'
                : language === 'it' ? 'Connettiti con altri utenti e scopri attività'
                : 'Connect with other users and discover activities'}
            </p>
          </div>
          {user.role === 'admin' && (
            <Button
              onClick={() => setShowAnnouncementDialog(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 gap-2"
            >
              <Megaphone className="w-4 h-4" />
              {language === 'he' ? 'שלח הודעה לקהילה' : language === 'ru' ? 'Отправить объявление' : language === 'es' ? 'Enviar anuncio' : language === 'fr' ? 'Envoyer une annonce' : language === 'de' ? 'Ankündigung senden' : language === 'it' ? 'Invia annuncio' : 'Send Announcement'}
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="feed" className="w-full">
        <TabsList className={`grid w-full ${user.role === 'admin' ? 'grid-cols-4' : 'grid-cols-2'} mb-6`}>
          <TabsTrigger value="friends" className="gap-2">
            <Users className="w-4 h-4" />
            {language === 'he' ? 'חברים' : language === 'ru' ? 'Друзья' : language === 'es' ? 'Amigos' : language === 'fr' ? 'Amis' : language === 'de' ? 'Freunde' : language === 'it' ? 'Amici' : 'Friends'} ({myFriends.length})
          </TabsTrigger>
          <TabsTrigger value="discover" className="gap-2">
            <Search className="w-4 h-4" />
            {language === 'he' ? 'גלה' : language === 'ru' ? 'Открыть' : language === 'es' ? 'Descubrir' : language === 'fr' ? 'Découvrir' : language === 'de' ? 'Entdecken' : language === 'it' ? 'Scoprire' : 'Discover'}
          </TabsTrigger>
          {user.role === 'admin' && (
            <>
              <TabsTrigger value="feed" className="gap-2">
                <TrendingUp className="w-4 h-4" />
                {language === 'he' ? 'פיד' : language === 'ru' ? 'Лента' : language === 'es' ? 'Feed' : language === 'fr' ? 'Fil' : language === 'de' ? 'Feed' : language === 'it' ? 'Feed' : 'Feed'}
              </TabsTrigger>
              <TabsTrigger value="inbox" className="gap-2">
                <Mail className="w-4 h-4" />
                {language === 'he' ? 'תיעוד הודעות' : 'Message Log'}
              </TabsTrigger>
            </>
          )}
        </TabsList>

        {/* Friends Tab */}
        <TabsContent value="friends">
          {/* Friend Requests */}
          {myFriendRequests.length > 0 && (
            <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900">
                  {language === 'he' ? 'בקשות חברות' : language === 'ru' ? 'Заявки в друзья' : language === 'es' ? 'Solicitudes de amistad' : language === 'fr' ? 'Demandes d\'amis' : language === 'de' ? 'Freundschaftsanfragen' : language === 'it' ? 'Richieste di amicizia' : 'Friend Requests'} ({myFriendRequests.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {myFriendRequests.map(request => {
                    const requester = users.find(u => u.email === request.email);
                    if (!requester) return null;
                    const name = (requester.first_name && requester.last_name) 
                      ? `${requester.first_name} ${requester.last_name}` 
                      : requester.full_name || requester.email;

                    return (
                      <div key={request.email} className="flex items-center justify-between bg-white p-4 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-blue-100 text-blue-700">
                              {name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{name}</p>
                            <p className="text-sm text-gray-500">
                              {formatDate(new Date(request.timestamp), 'MMM d, HH:mm', language)}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => acceptRequestMutation.mutate(request.email)}
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                            <UserCheck className="w-4 h-4 mr-2" />
                            {language === 'he' ? 'אשר' : language === 'ru' ? 'Принять' : language === 'es' ? 'Aceptar' : language === 'fr' ? 'Accepter' : language === 'de' ? 'Akzeptieren' : language === 'it' ? 'Accetta' : 'Accept'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => rejectRequestMutation.mutate(request.email)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}


          {/* Friend Requests Section */}
          {myFriendRequests.length > 0 && (
            <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900 flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  {language === 'he' ? 'בקשות חברות' : language === 'ru' ? 'Заявки в друзья' : language === 'es' ? 'Solicitudes de amistad' : language === 'fr' ? 'Demandes d\'amis' : language === 'de' ? 'Freundschaftsanfragen' : language === 'it' ? 'Richieste di amicizia' : 'Friend Requests'} ({myFriendRequests.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {myFriendRequests.map(request => {
                    const requester = users.find(u => u.email === request.email);
                    if (!requester) return null;
                    const name = (requester.first_name && requester.last_name) 
                      ? `${requester.first_name} ${requester.last_name}` 
                      : requester.full_name || requester.email;

                    return (
                      <div key={request.email} className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
                        <div className="flex items-center gap-3 flex-1">
                          <Link to={createPageUrl('Profile') + '?email=' + request.email} className="flex items-center gap-3">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback className="bg-blue-100 text-blue-700">
                                {name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold">{name}</p>
                              <p className="text-sm text-gray-500">
                                {formatDate(new Date(request.timestamp), 'MMM d, HH:mm', language)}
                              </p>
                            </div>
                          </Link>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => acceptRequestMutation.mutate(request.email)}
                            disabled={acceptRequestMutation.isLoading}
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                            <UserCheck className="w-4 h-4 mr-2" />
                            {language === 'he' ? 'אשר' : language === 'ru' ? 'Принять' : language === 'es' ? 'Aceptar' : language === 'fr' ? 'Accepter' : language === 'de' ? 'Akzeptieren' : language === 'it' ? 'Accetta' : 'Accept'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => rejectRequestMutation.mutate(request.email)}
                            disabled={rejectRequestMutation.isLoading}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* My Friends List */}
          <Card>
            <CardHeader>
              <CardTitle>
                {language === 'he' ? 'החברים שלי' : language === 'ru' ? 'Мои друзья' : language === 'es' ? 'Mis amigos' : language === 'fr' ? 'Mes amis' : language === 'de' ? 'Meine Freunde' : language === 'it' ? 'I miei amici' : 'My Friends'} ({myFriends.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {myFriends.length === 0 ? (
                <p className="text-center py-8 text-gray-500">
                  {language === 'he' ? 'עדיין אין לך חברים' : language === 'ru' ? 'У вас пока нет друзей' : language === 'es' ? 'Aún no tienes amigos' : language === 'fr' ? 'Vous n\'avez pas encore d\'amis' : language === 'de' ? 'Sie haben noch keine Freunde' : language === 'it' ? 'Non hai ancora amici' : 'You have no friends yet'}
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myFriends.map(friendEmail => {
                    const friend = users.find(u => u.email === friendEmail);
                    if (!friend) return null;
                    const name = (friend.first_name && friend.last_name) 
                      ? `${friend.first_name} ${friend.last_name}` 
                      : friend.full_name || friend.email;

                    return (
                      <Card key={friendEmail} className="hover:shadow-lg transition-all">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <Link to={createPageUrl('Profile') + '?email=' + friendEmail} className="flex items-center gap-3 flex-1">
                              <Avatar className="h-12 w-12">
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-700 text-white">
                                  {name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="font-semibold">{name}</p>
                                <p className="text-sm text-gray-500">{friend.email}</p>
                              </div>
                            </Link>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setChatFriend(friend);
                                setShowChatDialog(true);
                              }}
                              className="gap-2"
                            >
                              <MessageSquare className="w-4 h-4" />
                              {language === 'he' ? 'צ\'אט' : 'Chat'}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Discover Tab */}
        <TabsContent value="discover">
          <Card>
            <CardHeader>
              <CardTitle>
                {language === 'he' ? 'גלה משתמשים חדשים' : language === 'ru' ? 'Открыть новых пользователей' : language === 'es' ? 'Descubrir nuevos usuarios' : language === 'fr' ? 'Découvrir de nouveaux utilisateurs' : language === 'de' ? 'Neue Benutzer entdecken' : language === 'it' ? 'Scopri nuovi utenti' : 'Discover New Users'}
              </CardTitle>
              <div className="mt-4">
                <Input
                  placeholder={language === 'he' ? 'חפש משתמשים...' : language === 'ru' ? 'Поиск пользователей...' : language === 'es' ? 'Buscar usuarios...' : language === 'fr' ? 'Rechercher des utilisateurs...' : language === 'de' ? 'Benutzer suchen...' : language === 'it' ? 'Cerca utenti...' : 'Search users...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-md"
                />
              </div>
            </CardHeader>
            <CardContent>
              {filteredUsers.length === 0 ? (
                <p className="text-center py-8 text-gray-500">
                  {language === 'he' ? 'לא נמצאו משתמשים' : language === 'ru' ? 'Пользователи не найдены' : language === 'es' ? 'No se encontraron usuarios' : language === 'fr' ? 'Aucun utilisateur trouvé' : language === 'de' ? 'Keine Benutzer gefunden' : language === 'it' ? 'Nessun utente trovato' : 'No users found'}
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredUsers.slice(0, 20).map(targetUser => (
                    <UserCard key={targetUser.email} targetUser={targetUser} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feed Tab - Admin Only */}
        {user.role === 'admin' && (
          <TabsContent value="feed">
            {/* Activity Feed */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === 'he' ? 'פעילות חברים' : language === 'ru' ? 'Активность друзей' : language === 'es' ? 'Actividad de amigos' : language === 'fr' ? 'Activité des amis' : language === 'de' ? 'Freundesaktivität' : language === 'it' ? 'Attività degli amici' : "Friends' Activity"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {friendsActivity.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">
                    {language === 'he' 
                      ? 'אין פעילות עדיין. הוסף חברים כדי לראות את הפעילות שלהם!'
                      : language === 'ru' ? 'Нет активности. Добавьте друзей, чтобы видеть их активность!'
                      : language === 'es' ? 'Sin actividad aún. ¡Agrega amigos para ver su actividad!'
                      : language === 'fr' ? 'Aucune activité pour le moment. Ajoutez des amis pour voir leur activité !'
                      : language === 'de' ? 'Noch keine Aktivität. Fügen Sie Freunde hinzu, um deren Aktivität zu sehen!'
                      : language === 'it' ? 'Nessuna attività ancora. Aggiungi amici per vedere la loro attività!'
                      : 'No activity yet. Add friends to see their activity!'}
                  </p>
                ) : (
                  <div className="space-y-4">
                    {friendsActivity.map(trip => {
                      const title = trip.title || trip.title_he || trip.title_en;
                      const organizerUser = users.find(u => u.email === trip.organizer_email);
                      const organizerName = organizerUser 
                        ? ((organizerUser.first_name && organizerUser.last_name) 
                          ? `${organizerUser.first_name} ${organizerUser.last_name}` 
                          : organizerUser.full_name || organizerUser.email)
                        : trip.organizer_name;

                      return (
                        <motion.div
                          key={trip.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <Link to={createPageUrl('TripDetails') + '?id=' + trip.id}>
                            <Card className="hover:shadow-lg transition-all cursor-pointer">
                              <CardContent className="p-4">
                                <div className="flex gap-3">
                                  <Avatar className="h-10 w-10">
                                    <AvatarFallback className="bg-emerald-100 text-emerald-700">
                                      {organizerName.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <p className="text-sm text-gray-600 mb-1">
                                      <span className="font-semibold text-gray-900">{organizerName}</span>
                                      {' '}{language === 'he' ? 'יצר טיול חדש' : language === 'ru' ? 'создал новую поездку' : language === 'es' ? 'creó un nuevo viaje' : language === 'fr' ? 'a créé un nouveau voyage' : language === 'de' ? 'hat eine neue Reise erstellt' : language === 'it' ? 'ha creato un nuovo viaggio' : 'created a new trip'}
                                    </p>
                                    <div className="flex items-center gap-2 mb-2">
                                      <Calendar className="w-4 h-4 text-blue-600" />
                                      <span className="font-semibold">{title}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                      <span className="flex items-center gap-1">
                                        {formatDate(new Date(trip.date), 'MMM d', language)}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Heart className="w-4 h-4" />
                                        {trip.likes?.length || 0}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <MessageCircle className="w-4 h-4" />
                                        {trip.comments?.length || 0}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Admin Message Log Tab */}
        {user.role === 'admin' && (
          <TabsContent value="inbox">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Community Announcements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-purple-600" />
                    {language === 'he' ? 'הודעות קבוצתיות' : 'Group Announcements'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {sentAnnouncements.length === 0 ? (
                    <p className="text-center py-8 text-gray-500">
                      {language === 'he' ? 'לא נשלחו הודעות קבוצתיות עדיין' : 'No group announcements sent yet'}
                    </p>
                  ) : (
                    <div className="space-y-3 max-h-[600px] overflow-y-auto">
                      {sentAnnouncements.map(announcement => (
                        <Card key={announcement.id} className="bg-purple-50 border-purple-200">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">{announcement.title}</h4>
                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                  <Clock className="w-3 h-3" />
                                  {formatDate(new Date(announcement.created_date), 'dd/MM/yyyy HH:mm', language)}
                                </div>
                              </div>
                              <Badge variant={announcement.active ? 'default' : 'secondary'} className="text-xs">
                                {announcement.active 
                                  ? (language === 'he' ? 'פעיל' : 'Active')
                                  : (language === 'he' ? 'פג תוקף' : 'Expired')}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap" dir={language === 'he' ? 'rtl' : 'ltr'}>
                              {announcement.message}
                            </p>
                            <div className="mt-3 pt-3 border-t border-purple-200 text-xs text-gray-500">
                              {language === 'he' ? 'נשלח לכל המשתמשים' : 'Sent to all users'}
                              {announcement.expires_at && (
                                <span className="mr-2">
                                  {' • '}{language === 'he' ? 'תוקף עד:' : 'Expires:'} {formatDate(new Date(announcement.expires_at), 'dd/MM/yyyy', language)}
                                </span>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Private Messages */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="w-5 h-5 text-blue-600" />
                    {language === 'he' ? 'הודעות אישיות' : 'Private Messages'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {sentPrivateMessages.length === 0 ? (
                    <p className="text-center py-8 text-gray-500">
                      {language === 'he' ? 'לא נשלחו הודעות אישיות עדיין' : 'No private messages sent yet'}
                    </p>
                  ) : (
                    <div className="space-y-3 max-h-[600px] overflow-y-auto">
                      {sentPrivateMessages.map(message => {
                        const recipient = users.find(u => u.email === message.recipient_email);
                        const recipientName = recipient 
                          ? ((recipient.first_name && recipient.last_name) 
                            ? `${recipient.first_name} ${recipient.last_name}` 
                            : recipient.full_name || recipient.email)
                          : message.recipient_email;

                        return (
                          <Card key={message.id} className="bg-blue-50 border-blue-200">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Avatar className="h-6 w-6">
                                      <AvatarFallback className="bg-blue-600 text-white text-xs">
                                        {recipientName.charAt(0).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm font-medium text-gray-700">
                                      {language === 'he' ? 'אל:' : 'To:'} {recipientName}
                                    </span>
                                  </div>
                                  <h4 className="font-semibold text-gray-900">{message.title}</h4>
                                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                    <Clock className="w-3 h-3" />
                                    {formatDate(new Date(message.sent_at), 'dd/MM/yyyy HH:mm', language)}
                                  </div>
                                </div>
                                <Badge variant={message.read ? 'secondary' : 'default'} className="text-xs">
                                  {message.read 
                                    ? (language === 'he' ? 'נקרא' : 'Read')
                                    : (language === 'he' ? 'לא נקרא' : 'Unread')}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-700 whitespace-pre-wrap" dir={language === 'he' ? 'rtl' : 'ltr'}>
                                {message.body}
                              </p>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>

      {/* Send Announcement Dialog */}
      <Dialog open={showAnnouncementDialog} onOpenChange={setShowAnnouncementDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-purple-600" />
              {language === 'he' ? 'שלח הודעה לכל הקהילה' : language === 'ru' ? 'Отправить объявление сообществу' : language === 'es' ? 'Enviar anuncio a la comunidad' : language === 'fr' ? 'Envoyer une annonce à la communauté' : language === 'de' ? 'Community-Ankündigung senden' : language === 'it' ? 'Invia annuncio alla comunità' : 'Send Community Announcement'}
            </DialogTitle>
            <DialogDescription>
              {language === 'he' 
                ? 'הודעה זו תופיע לכל המשתמשים בדף הבית'
                : language === 'ru' ? 'Это сообщение появится у всех пользователей на главной странице'
                : language === 'es' ? 'Este mensaje aparecerá a todos los usuarios en la página de inicio'
                : language === 'fr' ? 'Ce message apparaîtra à tous les utilisateurs sur la page d\'accueil'
                : language === 'de' ? 'Diese Nachricht wird allen Benutzern auf der Startseite angezeigt'
                : language === 'it' ? 'Questo messaggio apparirà a tutti gli utenti nella home page'
                : 'This message will appear to all users on the home page'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'he' ? 'כותרת' : language === 'ru' ? 'Заголовок' : language === 'es' ? 'Título' : language === 'fr' ? 'Titre' : language === 'de' ? 'Titel' : language === 'it' ? 'Titolo' : 'Title'}
              </label>
              <Input
                value={announcementData.title}
                onChange={(e) => setAnnouncementData({ ...announcementData, title: e.target.value })}
                placeholder={language === 'he' ? 'לדוגמה: עדכון חשוב' : language === 'ru' ? 'напр., Важное обновление' : language === 'es' ? 'ej., Actualización importante' : language === 'fr' ? 'ex., Mise à jour importante' : language === 'de' ? 'z.B. Wichtiges Update' : language === 'it' ? 'es., Aggiornamento importante' : 'e.g., Important Update'}
                dir={language === 'he' ? 'rtl' : 'ltr'}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'he' ? 'הודעה' : language === 'ru' ? 'Сообщение' : language === 'es' ? 'Mensaje' : language === 'fr' ? 'Message' : language === 'de' ? 'Nachricht' : language === 'it' ? 'Messaggio' : 'Message'}
              </label>
              <Textarea
                value={announcementData.message}
                onChange={(e) => setAnnouncementData({ ...announcementData, message: e.target.value })}
                placeholder={language === 'he' ? 'כתוב את ההודעה כאן...' : language === 'ru' ? 'Напишите ваше сообщение здесь...' : language === 'es' ? 'Escribe tu mensaje aquí...' : language === 'fr' ? 'Écrivez votre message ici...' : language === 'de' ? 'Schreiben Sie Ihre Nachricht hier...' : language === 'it' ? 'Scrivi il tuo messaggio qui...' : 'Write your message here...'}
                rows={4}
                dir={language === 'he' ? 'rtl' : 'ltr'}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'he' ? 'תוקף (ימים)' : language === 'ru' ? 'Срок действия (дни)' : language === 'es' ? 'Validez (días)' : language === 'fr' ? 'Validité (jours)' : language === 'de' ? 'Gültigkeit (Tage)' : language === 'it' ? 'Validità (giorni)' : 'Validity (days)'}
              </label>
              <Input
                type="number"
                min={1}
                max={30}
                value={announcementData.expires_in_days}
                onChange={(e) => setAnnouncementData({ ...announcementData, expires_in_days: parseInt(e.target.value) })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAnnouncementDialog(false)}
              disabled={sendAnnouncementMutation.isLoading}
            >
              {language === 'he' ? 'ביטול' : language === 'ru' ? 'Отмена' : language === 'es' ? 'Cancelar' : language === 'fr' ? 'Annuler' : language === 'de' ? 'Abbrechen' : language === 'it' ? 'Annulla' : 'Cancel'}
            </Button>
            <Button
              onClick={() => sendAnnouncementMutation.mutate(announcementData)}
              disabled={!announcementData.title || !announcementData.message || sendAnnouncementMutation.isLoading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 gap-2"
            >
              {sendAnnouncementMutation.isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {language === 'he' ? 'שלח' : language === 'ru' ? 'Отправить' : language === 'es' ? 'Enviar' : language === 'fr' ? 'Envoyer' : language === 'de' ? 'Senden' : language === 'it' ? 'Invia' : 'Send'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Private Message Dialog */}
      <Dialog open={showPrivateMessageDialog} onOpenChange={setShowPrivateMessageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-blue-600" />
              {language === 'he' ? 'שלח הודעה פרטית' : language === 'ru' ? 'Отправить личное сообщение' : language === 'es' ? 'Enviar mensaje privado' : language === 'fr' ? 'Envoyer un message privé' : language === 'de' ? 'Private Nachricht senden' : language === 'it' ? 'Invia messaggio privato' : 'Send Private Message'}
            </DialogTitle>
            <DialogDescription>
              {selectedUser && (
                <span>
                  {language === 'he' ? 'שלח הודעה ל-' : language === 'ru' ? 'Отправить сообщение ' : language === 'es' ? 'Enviar mensaje a ' : language === 'fr' ? 'Envoyer un message à ' : language === 'de' ? 'Nachricht senden an ' : language === 'it' ? 'Invia messaggio a ' : 'Send message to '}
                  {(selectedUser.first_name && selectedUser.last_name) 
                    ? `${selectedUser.first_name} ${selectedUser.last_name}` 
                    : selectedUser.full_name || selectedUser.email}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'he' ? 'כותרת' : 'Title'}
              </label>
              <Input
                value={privateMessage.title}
                onChange={(e) => setPrivateMessage({ ...privateMessage, title: e.target.value })}
                placeholder={language === 'he' ? 'לדוגמה: הודעה חשובה' : language === 'ru' ? 'напр., Важное сообщение' : language === 'es' ? 'ej., Mensaje importante' : language === 'fr' ? 'ex., Message important' : language === 'de' ? 'z.B. Wichtige Nachricht' : language === 'it' ? 'es., Messaggio importante' : 'e.g., Important Message'}
                dir={language === 'he' ? 'rtl' : 'ltr'}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'he' ? 'הודעה' : language === 'ru' ? 'Сообщение' : language === 'es' ? 'Mensaje' : language === 'fr' ? 'Message' : language === 'de' ? 'Nachricht' : language === 'it' ? 'Messaggio' : 'Message'}
              </label>
              <Textarea
                value={privateMessage.message}
                onChange={(e) => setPrivateMessage({ ...privateMessage, message: e.target.value })}
                placeholder={language === 'he' ? 'כתוב את ההודעה כאן...' : language === 'ru' ? 'Напишите ваше сообщение здесь...' : language === 'es' ? 'Escribe tu mensaje aquí...' : language === 'fr' ? 'Écrivez votre message ici...' : language === 'de' ? 'Schreiben Sie Ihre Nachricht hier...' : language === 'it' ? 'Scrivi il tuo messaggio qui...' : 'Write your message here...'}
                rows={4}
                dir={language === 'he' ? 'rtl' : 'ltr'}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowPrivateMessageDialog(false);
                setSelectedUser(null);
                setPrivateMessage({ title: '', message: '' });
              }}
              disabled={sendPrivateMessageMutation.isLoading}
            >
              {language === 'he' ? 'ביטול' : language === 'ru' ? 'Отмена' : language === 'es' ? 'Cancelar' : language === 'fr' ? 'Annuler' : language === 'de' ? 'Abbrechen' : language === 'it' ? 'Annulla' : 'Cancel'}
            </Button>
            <Button
              onClick={() => sendPrivateMessageMutation.mutate({
                targetEmail: selectedUser.email,
                title: privateMessage.title,
                message: privateMessage.message
              })}
              disabled={!privateMessage.title || !privateMessage.message || sendPrivateMessageMutation.isLoading}
              className="bg-blue-600 hover:bg-blue-700 gap-2"
            >
              {sendPrivateMessageMutation.isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {language === 'he' ? 'שלח' : language === 'ru' ? 'Отправить' : language === 'es' ? 'Enviar' : language === 'fr' ? 'Envoyer' : language === 'de' ? 'Senden' : language === 'it' ? 'Invia' : 'Send'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </>
  );
}