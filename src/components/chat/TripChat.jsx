import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageCircle, Send, Users, Lock, Loader2, Video, X, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { base44 } from '@/api/base44Client';
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function TripChat({ trip, currentUserEmail, onSendMessage, sending }) {
  const { language } = useLanguage();
  const [message, setMessage] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [activeTab, setActiveTab] = useState('group');
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [scheduledTime, setScheduledTime] = useState('');
  const [creatingInvite, setCreatingInvite] = useState(false);
  const scrollRef = useRef(null);

  const roomName = `tripmate-${trip.id}`;
  const videoCallUrl = `https://meet.jit.si/${roomName}`;
  
  const activeInvite = trip.video_call_invites?.find(invite => invite.active);

  const participants = trip.participants || [];
  const otherParticipants = participants.filter(p => p.email !== currentUserEmail);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [trip.messages]);

  const handleSend = async () => {
    if (!message.trim()) return;

    const type = activeTab === 'group' ? 'group' : 'private';
    await onSendMessage({
      content: message.trim(),
      type,
      recipient_email: type === 'private' ? selectedRecipient : null
    });
    setMessage('');
  };

  const handleCreateInvite = async () => {
    if (!scheduledTime) {
      toast.error(language === 'he' ? 'נא לבחור זמן' : 'Please select time');
      return;
    }

    setCreatingInvite(true);
    try {
      const participant = trip.participants?.find(p => p.email === currentUserEmail);
      const newInvite = {
        id: Date.now().toString(),
        creator_email: currentUserEmail,
        creator_name: participant?.name || 'Unknown',
        created_at: new Date().toISOString(),
        scheduled_time: scheduledTime,
        active: true
      };

      // Deactivate all previous invites
      const updatedInvites = (trip.video_call_invites || []).map(invite => ({
        ...invite,
        active: false
      }));
      updatedInvites.push(newInvite);

      await base44.entities.Trip.update(trip.id, {
        video_call_invites: updatedInvites
      });

      toast.success(language === 'he' ? 'הזימון נשלח!' : 'Invite sent!');
      setShowScheduleDialog(false);
      setScheduledTime('');
    } catch (error) {
      toast.error(language === 'he' ? 'שגיאה ביצירת הזימון' : 'Error creating invite');
    }
    setCreatingInvite(false);
  };

  const groupMessages = (trip.messages || []).filter(m => m.type === 'group');
  const privateMessages = (trip.messages || []).filter(m => 
    m.type === 'private' && 
    (m.sender_email === currentUserEmail || m.recipient_email === currentUserEmail)
  );

  const getPrivateConversations = () => {
    const conversations = {};
    privateMessages.forEach(msg => {
      const otherEmail = msg.sender_email === currentUserEmail ? msg.recipient_email : msg.sender_email;
      if (!conversations[otherEmail]) {
        conversations[otherEmail] = [];
      }
      conversations[otherEmail].push(msg);
    });
    return conversations;
  };

  const privateConversations = getPrivateConversations();

  const renderMessage = (msg, isPrivate = false) => {
    const isMine = msg.sender_email === currentUserEmail;
    return (
      <div key={msg.id} className={`flex gap-3 mb-4 ${isMine ? 'flex-row-reverse' : ''}`}>
        <Avatar className="w-8 h-8">
          <AvatarFallback className={isMine ? 'bg-emerald-600 text-white' : 'bg-gray-200'}>
            {msg.sender_name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className={`flex-1 ${isMine ? 'text-right' : ''}`}>
          <div className={`inline-block max-w-[80%] ${isMine ? 'text-right' : ''}`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-gray-700">
                {isMine ? (language === 'he' ? 'אני' : 'Me') : msg.sender_name}
              </span>
              <span className="text-xs text-gray-400">
                {format(new Date(msg.timestamp), 'HH:mm')}
              </span>
            </div>
            <div className={`rounded-2xl px-4 py-2 ${
              isMine 
                ? 'bg-emerald-600 text-white' 
                : 'bg-gray-100 text-gray-900'
            }`}>
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-blue-600" />
              {language === 'he' ? 'צ\'אט הטיול' : 'Trip Chat'}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowVideoCall(true)}
              className="gap-2 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
            >
              <Video className="w-4 h-4" />
              {language === 'he' ? 'שיחת וידאו' : 'Video Call'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="group" className="gap-2">
              <Users className="w-4 h-4" />
              {language === 'he' ? 'קבוצתי' : 'Group'}
            </TabsTrigger>
            <TabsTrigger value="private" className="gap-2">
              <Lock className="w-4 h-4" />
              {language === 'he' ? 'פרטי' : 'Private'}
            </TabsTrigger>
          </TabsList>

          {/* Group Chat */}
          <TabsContent value="group" className="space-y-4">
            {/* Active Video Call Invite Banner */}
            {activeInvite && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center">
                    <Video className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-emerald-900">
                      {language === 'he' ? 'זימון לשיחת וידאו' : 'Video Call Invitation'}
                    </p>
                    <p className="text-sm text-emerald-700">
                      {activeInvite.creator_name} {language === 'he' ? 'מזמין לשיחת וידאו ב-' : 'invites you to video call at '}
                      {format(new Date(activeInvite.scheduled_time), 'MMM d, HH:mm')}
                    </p>
                    <Button
                      size="sm"
                      className="mt-2 bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => setShowVideoCall(true)}
                    >
                      {language === 'he' ? 'הצטרף לשיחה' : 'Join Call'}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <ScrollArea className="h-[400px] pr-4" ref={scrollRef}>
              {groupMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <MessageCircle className="w-12 h-12 text-gray-300 mb-3" />
                  <p className="text-gray-500">
                    {language === 'he' 
                      ? 'אין הודעות עדיין. התחל את השיחה!'
                      : 'No messages yet. Start the conversation!'}
                  </p>
                </div>
              ) : (
                groupMessages.map(msg => renderMessage(msg))
              )}
            </ScrollArea>

            <div className="space-y-2 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowScheduleDialog(true)}
                className="w-full gap-2 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
              >
                <Calendar className="w-4 h-4" />
                {language === 'he' ? 'קבע שיחת וידאו' : 'Schedule Video Call'}
              </Button>
              
              <div className="flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !sending && handleSend()}
                  placeholder={language === 'he' ? 'כתוב הודעה...' : 'Type a message...'}
                  disabled={sending}
                  dir={language === 'he' ? 'rtl' : 'ltr'}
                />
                <Button 
                  onClick={handleSend} 
                  disabled={!message.trim() || sending}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Private Chat */}
          <TabsContent value="private" className="space-y-4">
            {otherParticipants.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-gray-500">
                  {language === 'he' 
                    ? 'אין משתתפים נוספים עדיין'
                    : 'No other participants yet'}
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {language === 'he' ? 'שלח הודעה פרטית אל:' : 'Send private message to:'}
                  </label>
                  <Select value={selectedRecipient} onValueChange={setSelectedRecipient}>
                    <SelectTrigger>
                      <SelectValue placeholder={language === 'he' ? 'בחר משתתף' : 'Select participant'} />
                    </SelectTrigger>
                    <SelectContent>
                      {otherParticipants.map(p => (
                        <SelectItem key={p.email} value={p.email}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedRecipient && (
                  <>
                    <ScrollArea className="h-[300px] pr-4" ref={scrollRef}>
                      {privateConversations[selectedRecipient]?.length > 0 ? (
                        privateConversations[selectedRecipient].map(msg => renderMessage(msg, true))
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center py-12">
                          <MessageCircle className="w-12 h-12 text-gray-300 mb-3" />
                          <p className="text-gray-500">
                            {language === 'he' 
                              ? 'אין הודעות עדיין'
                              : 'No messages yet'}
                          </p>
                        </div>
                      )}
                    </ScrollArea>

                    <div className="flex gap-2 pt-4 border-t">
                      <Input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !sending && handleSend()}
                        placeholder={language === 'he' ? 'כתוב הודעה פרטית...' : 'Type a private message...'}
                        disabled={sending}
                        dir={language === 'he' ? 'rtl' : 'ltr'}
                      />
                      <Button 
                        onClick={handleSend} 
                        disabled={!message.trim() || sending}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {sending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>

    {/* Schedule Video Call Dialog */}
    <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {language === 'he' ? 'קבע שיחת וידאו' : 'Schedule Video Call'}
          </DialogTitle>
          <DialogDescription>
            {language === 'he' 
              ? 'בחר מתי תרצה לקיים את שיחת הוידאו'
              : 'Choose when you want to have the video call'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {language === 'he' ? 'תאריך ושעה' : 'Date & Time'}
            </label>
            <Input
              type="datetime-local"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
            {language === 'he' ? 'ביטול' : 'Cancel'}
          </Button>
          <Button
            onClick={handleCreateInvite}
            disabled={creatingInvite || !scheduledTime}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {creatingInvite ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Video className="w-4 h-4 mr-2" />
            )}
            {language === 'he' ? 'שלח זימון' : 'Send Invite'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    {/* Video Call Dialog */}
    <Dialog open={showVideoCall} onOpenChange={setShowVideoCall}>
      <DialogContent className="max-w-5xl h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>
                {language === 'he' ? 'שיחת וידאו קבוצתית' : 'Group Video Call'}
              </DialogTitle>
              <DialogDescription>
                {language === 'he' 
                  ? 'כל המשתתפים הרשומים לטיול יכולים להצטרף לשיחה'
                  : 'All registered trip participants can join the call'}
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowVideoCall(false)}
              className="h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        <div className="flex-1 p-6 pt-4">
          <iframe
            src={videoCallUrl}
            allow="camera; microphone; fullscreen; display-capture; autoplay"
            className="w-full h-full rounded-lg border-2 border-gray-200"
            style={{ minHeight: '600px' }}
          />
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}