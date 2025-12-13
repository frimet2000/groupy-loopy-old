import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../LanguageContext';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, Loader2, X } from 'lucide-react';
import { formatDate } from '../utils/dateFormatter';
import { motion, AnimatePresence } from 'framer-motion';

export default function DirectMessageChat({ friendEmail, friendName, currentUserEmail, onClose }) {
  const { language, isRTL } = useLanguage();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const scrollRef = useRef(null);

  // Fetch messages between current user and friend
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['directMessages', currentUserEmail, friendEmail],
    queryFn: async () => {
      const allMessages = await base44.entities.DirectMessage.list('-timestamp');
      return allMessages.filter(msg => 
        (msg.sender_email === currentUserEmail && msg.recipient_email === friendEmail) ||
        (msg.sender_email === friendEmail && msg.recipient_email === currentUserEmail)
      ).reverse();
    },
    refetchInterval: 3000,
  });

  // Mark messages as read
  useEffect(() => {
    const markAsRead = async () => {
      const unreadMessages = messages.filter(
        msg => msg.sender_email === friendEmail && msg.recipient_email === currentUserEmail && !msg.read
      );
      
      for (const msg of unreadMessages) {
        await base44.entities.DirectMessage.update(msg.id, { read: true });
      }
      
      if (unreadMessages.length > 0) {
        queryClient.invalidateQueries(['directMessages']);
        queryClient.invalidateQueries(['unreadCount']);
      }
    };
    
    if (messages.length > 0) {
      markAsRead();
    }
  }, [messages, friendEmail, currentUserEmail]);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessageMutation = useMutation({
    mutationFn: async (content) => {
      const userName = await base44.auth.me().then(u => 
        (u.first_name && u.last_name) ? `${u.first_name} ${u.last_name}` : u.full_name
      );

      await base44.entities.DirectMessage.create({
        sender_email: currentUserEmail,
        sender_name: userName,
        recipient_email: friendEmail,
        content,
        timestamp: new Date().toISOString(),
        read: false
      });

      // Send push notification
      try {
        await base44.functions.invoke('sendPushNotification', {
          recipient_email: friendEmail,
          notification_type: 'new_messages',
          title: language === 'he' ? 'הודעה חדשה' : 'New Message',
          body: language === 'he'
            ? `${userName}: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`
            : `${userName}: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`
        });
      } catch (error) {
        console.log('Notification error:', error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['directMessages']);
      setMessage('');
    },
  });

  const handleSend = () => {
    if (message.trim()) {
      sendMessageMutation.mutate(message.trim());
    }
  };

  return (
    <Card className="flex flex-col h-[600px] shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-700 text-white">
              {friendName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg">{friendName}</CardTitle>
            <p className="text-xs text-gray-500">{friendEmail}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>{language === 'he' ? 'התחל שיחה' : 'Start a conversation'}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {messages.map((msg, index) => {
                  const isMe = msg.sender_email === currentUserEmail;
                  const showDate = index === 0 || 
                    new Date(messages[index - 1].timestamp).toDateString() !== new Date(msg.timestamp).toDateString();

                  return (
                    <div key={msg.id}>
                      {showDate && (
                        <div className="flex justify-center my-4">
                          <Badge variant="outline" className="bg-gray-50">
                            {formatDate(new Date(msg.timestamp), 'EEEE, MMMM d', language)}
                          </Badge>
                        </div>
                      )}
                      
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] ${isMe ? 'order-2' : 'order-1'}`}>
                          <div
                            className={`rounded-2xl px-4 py-2 ${
                              isMe
                                ? 'bg-emerald-600 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                            dir={isRTL ? 'rtl' : 'ltr'}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                          </div>
                          <div className={`flex items-center gap-2 mt-1 px-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <p className="text-xs text-gray-500">
                              {formatDate(new Date(msg.timestamp), 'HH:mm', language)}
                            </p>
                            {isMe && msg.read && (
                              <Badge variant="outline" className="text-xs px-1 py-0 h-4 bg-blue-50 text-blue-600 border-blue-200">
                                {language === 'he' ? 'נקרא' : 'Read'}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex gap-2">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={language === 'he' ? 'כתוב הודעה...' : 'Write a message...'}
              className="resize-none"
              rows={2}
              dir={isRTL ? 'rtl' : 'ltr'}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <Button
              onClick={handleSend}
              disabled={!message.trim() || sendMessageMutation.isLoading}
              className="bg-emerald-600 hover:bg-emerald-700 self-end"
            >
              {sendMessageMutation.isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}