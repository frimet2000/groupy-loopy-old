import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../components/LanguageContext';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Send,
  Inbox as InboxIcon,
  Star,
  Archive,
  Trash2,
  RefreshCw,
  X,
  Loader2,
  Search,
  ChevronLeft,
  MailOpen,
  User
} from 'lucide-react';
import { formatDate } from '../components/utils/dateFormatter';

export default function Inbox() {
  const { t, language, isRTL } = useLanguage();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('inbox');
  const [composeData, setComposeData] = useState({
    recipient_email: '',
    subject: '',
    body: ''
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

  // Fetch all users for autocomplete
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
    enabled: !!user,
  });

  // Get current user's friends for priority display
  const myFriends = user?.friends || [];
  const friendUsers = users.filter(u => myFriends.includes(u.email));
  const otherUsers = users.filter(u => !myFriends.includes(u.email) && u.email !== user?.email);

  // Fetch received messages
  const { data: receivedMessages = [], refetch: refetchReceived } = useQuery({
    queryKey: ['receivedMessages', user?.email],
    queryFn: () => base44.entities.Message.filter({ recipient_email: user.email }, '-created_date'),
    enabled: !!user?.email,
    refetchInterval: 5000,
  });

  // Fetch sent messages
  const { data: sentMessages = [], refetch: refetchSent } = useQuery({
    queryKey: ['sentMessages', user?.email],
    queryFn: () => base44.entities.Message.filter({ sender_email: user.email }, '-created_date'),
    enabled: !!user?.email,
    refetchInterval: 5000,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData) => {
      const userName = (user.first_name && user.last_name) 
        ? `${user.first_name} ${user.last_name}` 
        : user.full_name;

      const message = await base44.entities.Message.create({
        sender_email: user.email,
        sender_name: userName,
        recipient_email: messageData.recipient_email,
        subject: messageData.subject,
        body: messageData.body,
        sent_at: new Date().toISOString(),
        read: false,
        starred: false,
        archived: false
      });

      // Send push notification
      try {
        await base44.functions.invoke('sendPushNotification', {
          recipient_email: messageData.recipient_email,
          notification_type: 'new_messages',
          title: language === 'he' ? 'הודעה חדשה' : 'New Message',
          body: messageData.subject
        });
      } catch (error) {
        console.log('Notification error:', error);
      }

      return message;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries(['sentMessages']);
      setShowCompose(false);
      setComposeData({ recipient_email: '', subject: '', body: '' });
      toast.success(language === 'he' ? 'ההודעה נשלחה' : 'Message sent');
    },
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (messageId) => base44.entities.Message.update(messageId, { read: true }),
    onSuccess: () => {
      queryClient.invalidateQueries(['receivedMessages']);
    },
  });

  // Toggle star mutation
  const toggleStarMutation = useMutation({
    mutationFn: ({ messageId, starred }) => base44.entities.Message.update(messageId, { starred }),
    onSuccess: () => {
      queryClient.invalidateQueries(['receivedMessages']);
      queryClient.invalidateQueries(['sentMessages']);
    },
  });

  // Archive mutation
  const archiveMutation = useMutation({
    mutationFn: (messageId) => base44.entities.Message.update(messageId, { archived: true }),
    onSuccess: () => {
      queryClient.invalidateQueries(['receivedMessages']);
      setSelectedMessage(null);
      toast.success(language === 'he' ? 'הועבר לארכיון' : 'Archived');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (messageId) => base44.entities.Message.delete(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries(['receivedMessages']);
      queryClient.invalidateQueries(['sentMessages']);
      setSelectedMessage(null);
      toast.success(language === 'he' ? 'ההודעה נמחקה' : 'Message deleted');
    },
  });

  const handleMessageClick = (message) => {
    setSelectedMessage(message);
    if (!message.read && message.recipient_email === user.email) {
      markAsReadMutation.mutate(message.id);
    }
  };

  const handleReply = () => {
    setComposeData({
      recipient_email: selectedMessage.sender_email,
      subject: selectedMessage.subject.startsWith('Re:') 
        ? selectedMessage.subject 
        : `Re: ${selectedMessage.subject}`,
      body: ''
    });
    setShowCompose(true);
    setSelectedMessage(null);
  };

  // Filter messages
  const getFilteredMessages = () => {
    let messages = [];
    
    if (filter === 'inbox') {
      messages = receivedMessages.filter(m => !m.archived);
    } else if (filter === 'sent') {
      messages = sentMessages;
    } else if (filter === 'starred') {
      messages = [...receivedMessages, ...sentMessages].filter(m => m.starred);
    } else if (filter === 'archived') {
      messages = receivedMessages.filter(m => m.archived);
    }

    if (searchQuery) {
      messages = messages.filter(m => 
        m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.sender_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return messages;
  };

  const filteredMessages = getFilteredMessages();
  const unreadCount = receivedMessages.filter(m => !m.read && !m.archived).length;

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {language === 'he' ? 'תיבת הדואר' : 'Inbox'}
          </h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              {language === 'he' 
                ? `${unreadCount} הודעות שלא נקראו`
                : `${unreadCount} unread messages`}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              refetchReceived();
              refetchSent();
            }}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => setShowCompose(true)}
            className="bg-emerald-600 hover:bg-emerald-700 gap-2"
          >
            <Send className="w-4 h-4" />
            {language === 'he' ? 'הודעה חדשה' : 'Compose'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <Button
                  variant={filter === 'inbox' ? 'default' : 'ghost'}
                  className="w-full justify-start gap-2"
                  onClick={() => setFilter('inbox')}
                >
                  <InboxIcon className="w-4 h-4" />
                  {language === 'he' ? 'דואר נכנס' : 'Inbox'}
                  {unreadCount > 0 && (
                    <Badge className="ml-auto">{unreadCount}</Badge>
                  )}
                </Button>
                <Button
                  variant={filter === 'starred' ? 'default' : 'ghost'}
                  className="w-full justify-start gap-2"
                  onClick={() => setFilter('starred')}
                >
                  <Star className="w-4 h-4" />
                  {language === 'he' ? 'מסומנים בכוכב' : 'Starred'}
                </Button>
                <Button
                  variant={filter === 'sent' ? 'default' : 'ghost'}
                  className="w-full justify-start gap-2"
                  onClick={() => setFilter('sent')}
                >
                  <Send className="w-4 h-4" />
                  {language === 'he' ? 'נשלחו' : 'Sent'}
                </Button>
                <Button
                  variant={filter === 'archived' ? 'default' : 'ghost'}
                  className="w-full justify-start gap-2"
                  onClick={() => setFilter('archived')}
                >
                  <Archive className="w-4 h-4" />
                  {language === 'he' ? 'ארכיון' : 'Archived'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Messages List */}
        <div className="lg:col-span-9">
          {!selectedMessage ? (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <CardTitle className="flex-1">
                    {filter === 'inbox' && (language === 'he' ? 'דואר נכנס' : 'Inbox')}
                    {filter === 'sent' && (language === 'he' ? 'הודעות שנשלחו' : 'Sent Messages')}
                    {filter === 'starred' && (language === 'he' ? 'מסומנים בכוכב' : 'Starred')}
                    {filter === 'archived' && (language === 'he' ? 'ארכיון' : 'Archived')}
                  </CardTitle>
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder={language === 'he' ? 'חיפוש...' : 'Search...'}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[600px]">
                  {filteredMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                      <Mail className="w-16 h-16 mb-4" />
                      <p>{language === 'he' ? 'אין הודעות' : 'No messages'}</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {filteredMessages.map((message) => {
                        const isReceived = message.recipient_email === user.email;
                        const displayName = isReceived ? message.sender_name : message.recipient_email;
                        
                        return (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                              !message.read && isReceived ? 'bg-blue-50' : ''
                            }`}
                            onClick={() => handleMessageClick(message)}
                          >
                            <div className="flex items-start gap-3">
                              <Avatar className="h-10 w-10 flex-shrink-0">
                                <AvatarFallback className={
                                  !message.read && isReceived ? 'bg-blue-600 text-white' : 'bg-gray-200'
                                }>
                                  {displayName?.charAt(0).toUpperCase() || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <p className={`font-medium truncate ${
                                    !message.read && isReceived ? 'text-gray-900' : 'text-gray-700'
                                  }`}>
                                    {displayName}
                                  </p>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <span className="text-xs text-gray-500">
                                      {formatDate(new Date(message.sent_at), 'MMM d', language)}
                                    </span>
                                    {message.starred && (
                                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                    )}
                                  </div>
                                </div>
                                <p className={`text-sm truncate mb-1 ${
                                  !message.read && isReceived ? 'font-semibold text-gray-900' : 'text-gray-600'
                                }`}>
                                  {message.subject}
                                </p>
                                <p className="text-sm text-gray-500 truncate">
                                  {message.body}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedMessage(null)}
                    className="gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    {language === 'he' ? 'חזרה' : 'Back'}
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleStarMutation.mutate({
                        messageId: selectedMessage.id,
                        starred: !selectedMessage.starred
                      })}
                    >
                      <Star className={`w-4 h-4 ${
                        selectedMessage.starred ? 'fill-yellow-500 text-yellow-500' : ''
                      }`} />
                    </Button>
                    {selectedMessage.recipient_email === user.email && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => archiveMutation.mutate(selectedMessage.id)}
                      >
                        <Archive className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(selectedMessage.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-emerald-100 text-emerald-700">
                        {selectedMessage.sender_name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold">{selectedMessage.sender_name}</p>
                        <span className="text-sm text-gray-500">
                          {formatDate(new Date(selectedMessage.sent_at), 'MMM d, HH:mm', language)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{selectedMessage.sender_email}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h2 className="text-xl font-bold mb-4">{selectedMessage.subject}</h2>
                    <div className="prose max-w-none">
                      <p className="whitespace-pre-wrap">{selectedMessage.body}</p>
                    </div>
                  </div>

                  {selectedMessage.recipient_email === user.email && (
                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={handleReply}
                        className="bg-emerald-600 hover:bg-emerald-700 gap-2"
                      >
                        <Send className="w-4 h-4" />
                        {language === 'he' ? 'השב' : 'Reply'}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Compose Dialog */}
      <Dialog open={showCompose} onOpenChange={setShowCompose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-emerald-600" />
              {language === 'he' ? 'הודעה חדשה' : 'New Message'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'he' ? 'אל' : 'To'}
              </label>
              <Input
                value={composeData.recipient_email}
                onChange={(e) => setComposeData({ ...composeData, recipient_email: e.target.value })}
                placeholder={language === 'he' ? 'דוא"ל המקבל' : 'Recipient email'}
                list="users-list"
              />
              <datalist id="users-list">
                {friendUsers.length > 0 && (
                  <option disabled>── {language === 'he' ? 'החברים שלי' : 'My Friends'} ──</option>
                )}
                {friendUsers.map(u => (
                  <option key={u.email} value={u.email}>
                    ⭐ {(u.first_name && u.last_name) 
                      ? `${u.first_name} ${u.last_name}` 
                      : u.full_name || u.email}
                  </option>
                ))}
                {otherUsers.map(u => (
                  <option key={u.email} value={u.email}>
                    {(u.first_name && u.last_name) 
                      ? `${u.first_name} ${u.last_name}` 
                      : u.full_name || u.email}
                  </option>
                ))}
              </datalist>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'he' ? 'נושא' : 'Subject'}
              </label>
              <Input
                value={composeData.subject}
                onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                placeholder={language === 'he' ? 'נושא ההודעה' : 'Message subject'}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'he' ? 'תוכן' : 'Message'}
              </label>
              <Textarea
                value={composeData.body}
                onChange={(e) => setComposeData({ ...composeData, body: e.target.value })}
                placeholder={language === 'he' ? 'כתוב את ההודעה כאן...' : 'Write your message here...'}
                rows={10}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCompose(false);
                setComposeData({ recipient_email: '', subject: '', body: '' });
              }}
            >
              {language === 'he' ? 'ביטול' : 'Cancel'}
            </Button>
            <Button
              onClick={() => sendMessageMutation.mutate(composeData)}
              disabled={
                !composeData.recipient_email || 
                !composeData.subject || 
                !composeData.body ||
                sendMessageMutation.isLoading
              }
              className="bg-emerald-600 hover:bg-emerald-700 gap-2"
            >
              {sendMessageMutation.isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {language === 'he' ? 'שלח' : 'Send'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}