import React, { useState, useEffect } from 'react';
import { useLanguage } from '../components/LanguageContext';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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
  Mail
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { formatDate } from '../components/utils/dateFormatter';
import DirectMessageChat from '../components/chat/DirectMessageChat';

export default function Community() {
  const { t, language, isRTL } = useLanguage();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const [chatFriend, setChatFriend] = useState(null);

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

  // Fetch unread message count
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unreadCount', user?.email],
    queryFn: async () => {
      if (!user?.email) return 0;
      const messages = await base44.entities.DirectMessage.filter({ 
        recipient_email: user.email,
        read: false
      });
      return messages.length;
    },
    enabled: !!user?.email,
    refetchInterval: 5000,
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
      const updatedRequests = [
        ...(targetUser.friend_requests || []),
        { email: user.email, timestamp: new Date().toISOString() }
      ];
      await base44.entities.User.update(targetUser.id, {
        friend_requests: updatedRequests
      });
      
      // Send notification to target user
      try {
        const userName = (user.first_name && user.last_name) 
          ? `${user.first_name} ${user.last_name}` 
          : user.full_name;
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
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
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

  const openChat = (friendEmail) => {
    const friend = users.find(u => u.email === friendEmail);
    if (friend) {
      const friendName = (friend.first_name && friend.last_name) 
        ? `${friend.first_name} ${friend.last_name}` 
        : friend.full_name || friend.email;
      setChatFriend({ email: friendEmail, name: friendName });
      setChatOpen(true);
    }
  };

  const UserCard = ({ targetUser }) => {
    const userName = (targetUser.first_name && targetUser.last_name) 
      ? `${targetUser.first_name} ${targetUser.last_name}` 
      : targetUser.full_name || targetUser.email;

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
            <Button
              size="sm"
              onClick={() => sendRequestMutation.mutate(targetUser.email)}
              disabled={sendRequestMutation.isLoading}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              {language === 'he' ? 'הוסף' : 'Add'}
            </Button>
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

  // Check if user is admin
  if (user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {language === 'he' ? 'גישה מוגבלת' : 'Access Restricted'}
            </h2>
            <p className="text-gray-600">
              {language === 'he' 
                ? 'דף זה זמין רק למנהלי מערכת'
                : 'This page is only available for administrators'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          {language === 'he' ? 'קהילה' : 'Community'}
        </h1>
        <p className="text-gray-600">
          {language === 'he' 
            ? 'התחבר עם משתמשים אחרים וגלה פעילויות'
            : 'Connect with other users and discover activities'}
        </p>
      </div>

      <Tabs defaultValue="feed" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="feed" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            {language === 'he' ? 'פיד' : 'Feed'}
          </TabsTrigger>
          <TabsTrigger value="friends" className="gap-2">
            <Users className="w-4 h-4" />
            {language === 'he' ? 'חברים' : 'Friends'} ({myFriends.length})
          </TabsTrigger>
          <TabsTrigger value="messages" className="gap-2 relative">
            <Mail className="w-4 h-4" />
            {language === 'he' ? 'הודעות' : 'Messages'}
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="discover" className="gap-2">
            <Search className="w-4 h-4" />
            {language === 'he' ? 'גלה' : 'Discover'}
          </TabsTrigger>
        </TabsList>

        {/* Feed Tab */}
        <TabsContent value="feed">
          {/* Friend Requests */}
          {myFriendRequests.length > 0 && (
            <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900">
                  {language === 'he' ? 'בקשות חברות' : 'Friend Requests'} ({myFriendRequests.length})
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
                            {language === 'he' ? 'אשר' : 'Accept'}
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

          {/* Activity Feed */}
          <Card>
            <CardHeader>
              <CardTitle>
                {language === 'he' ? 'פעילות חברים' : "Friends' Activity"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {friendsActivity.length === 0 ? (
                <p className="text-center py-8 text-gray-500">
                  {language === 'he' 
                    ? 'אין פעילות עדיין. הוסף חברים כדי לראות את הפעילות שלהם!'
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
                                    {' '}{language === 'he' ? 'יצר טיול חדש' : 'created a new trip'}
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

        {/* Friends Tab */}
        <TabsContent value="friends">
          <Card>
            <CardHeader>
              <CardTitle>
                {language === 'he' ? 'החברים שלי' : 'My Friends'} ({myFriends.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {myFriends.length === 0 ? (
                <p className="text-center py-8 text-gray-500">
                  {language === 'he' ? 'עדיין אין לך חברים' : 'You have no friends yet'}
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
                             onClick={() => openChat(friendEmail)}
                             className="gap-2"
                           >
                             <MessageCircle className="w-4 h-4" />
                             {language === 'he' ? 'שלח הודעה' : 'Message'}
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

        {/* Messages Tab */}
        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle>
                {language === 'he' ? 'הודעות' : 'Messages'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {myFriends.length === 0 ? (
                <p className="text-center py-8 text-gray-500">
                  {language === 'he' 
                    ? 'הוסף חברים כדי להתחיל לשלוח הודעות'
                    : 'Add friends to start messaging'}
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
                      <Card 
                        key={friendEmail} 
                        className="hover:shadow-lg transition-all cursor-pointer"
                        onClick={() => openChat(friendEmail)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white">
                                {name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-semibold">{name}</p>
                              <p className="text-sm text-gray-500 flex items-center gap-2">
                                <MessageCircle className="w-3 h-3" />
                                {language === 'he' ? 'לחץ לפתיחת צ\'אט' : 'Click to open chat'}
                              </p>
                            </div>
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
                {language === 'he' ? 'גלה משתמשים חדשים' : 'Discover New Users'}
              </CardTitle>
              <div className="mt-4">
                <Input
                  placeholder={language === 'he' ? 'חפש משתמשים...' : 'Search users...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-md"
                />
              </div>
            </CardHeader>
            <CardContent>
              {filteredUsers.length === 0 ? (
                <p className="text-center py-8 text-gray-500">
                  {language === 'he' ? 'לא נמצאו משתמשים' : 'No users found'}
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
      </Tabs>

      {/* Direct Message Dialog */}
      <Dialog open={chatOpen} onOpenChange={setChatOpen}>
        <DialogContent className="max-w-3xl p-0">
          {chatFriend && (
            <DirectMessageChat
              friendEmail={chatFriend.email}
              friendName={chatFriend.name}
              currentUserEmail={user.email}
              onClose={() => setChatOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}