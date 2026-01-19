import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageCircle, Send, Users, Lock, Loader2, Video, X, Calendar, Clock, Search, AlertCircle, CheckSquare } from 'lucide-react';
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
import GroupChatManager from './GroupChatManager';

export default function TripChat({ trip, currentUserEmail, onSendMessage, sending }) {
  const { language } = useLanguage();
  const [message, setMessage] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [activeTab, setActiveTab] = useState('group');
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [scheduledTime, setScheduledTime] = useState('');
  const [creatingInvite, setCreatingInvite] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [groups, setGroups] = useState([]);
  const [urgentPopupMessage, setUrgentPopupMessage] = useState(null);
  const scrollRef = useRef(null);
  const lastUrgentMessageIdRef = useRef(null);

  // Handle incoming urgent messages
  useEffect(() => {
    if (!trip.messages || trip.messages.length === 0) return;
    
    // Get the latest message
    // Assuming messages are appended, so last one is newest
    const lastMsg = trip.messages[trip.messages.length - 1];
    
    // Check if it's urgent, not from me, and not already shown
    if (lastMsg.isUrgent && lastMsg.sender_email !== currentUserEmail) {
      if (lastMsg.id !== lastUrgentMessageIdRef.current) {
        lastUrgentMessageIdRef.current = lastMsg.id;
        setUrgentPopupMessage(lastMsg);
        
        // Play alert sound
        try {
          const audio = new Audio('https://cdn.pixabay.com/download/audio/2022/03/24/audio_805cb3f394.mp3?filename=notification-sound-7062.mp3');
          audio.volume = 1.0;
          audio.play().catch(e => console.log('Audio play failed:', e));
        } catch (e) {
          console.error('Error playing sound:', e);
        }
      }
    }
  }, [trip.messages, currentUserEmail]);

  const roomName = `tripmate-${trip.id}`;
  const videoCallUrl = `https://meet.jit.si/${roomName}`;
  
  const activeInvite = trip.video_call_invites?.find(invite => invite.active);

  // Check if this is Nifgashim trek - fetch real participants from registrations
  const isNifgashim = trip.activity_type === 'trek' && trip.title?.includes('נפגשים');

  const { data: nifgashimRegistrations = [] } = useQuery({
    queryKey: ['nifgashimRegistrations', trip.id],
    queryFn: () => base44.entities.NifgashimRegistration.filter({ trip_id: trip.id }),
    enabled: isNifgashim,
    refetchOnWindowFocus: false,
  });

  // Build participants list based on trip type
  const participants = React.useMemo(() => {
    if (isNifgashim) {
      // Flatten all participants from all registrations
      const allParticipants = [];
      nifgashimRegistrations.forEach(reg => {
        (reg.participants || []).forEach(p => {
          allParticipants.push({
            email: p.email || reg.customer_email || reg.user_email,
            name: p.name,
            phone: p.phone,
            id_number: p.id_number
          });
        });
      });
      return allParticipants;
    }
    return trip.participants || [];
  }, [isNifgashim, nifgashimRegistrations, trip.participants]);

  const otherParticipants = participants.filter(p => p.email !== currentUserEmail);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [trip.messages]);

  const handleSend = async () => {
    if (!message.trim()) return;

    const type = activeTab === 'group' ? 'group' : 'private';
    
    // Determine recipients
    let recipients = [];
    if (type === 'group') {
      recipients = participants.map(p => p.email).filter(e => e !== currentUserEmail);
    } else if (multiSelectMode) {
      recipients = selectedRecipients;
    } else if (selectedRecipient) {
      recipients = [selectedRecipient];
    }

    if (recipients.length === 0 && type !== 'group') {
      toast.error(language === 'he' ? 'בחר נמענים' : 'Select recipients');
      return;
    }

    // Send message via onSendMessage (updates trip)
    await onSendMessage({
      content: message.trim(),
      type,
      recipient_email: type === 'private' ? (multiSelectMode ? null : selectedRecipient) : null,
      isUrgent
    });

    // Send notifications (Push + Email)
    try {
      const result = await base44.functions.invoke('sendChatNotification', {
        tripId: trip.id,
        recipientEmails: recipients,
        message: message.trim(),
        isUrgent,
        isGroup: type === 'group',
        groupName: trip.title || 'Trip Chat',
        messageId: Date.now().toString()
      });
      console.log('Notification sent:', result);
    } catch (error) {
      console.error('Notification error:', error);
      toast.error(language === 'he' ? 'שגיאה בשליחת התראות' : 'Error sending notifications');
    }

    setMessage('');
    setIsUrgent(false);
    setMultiSelectMode(false);
    setSelectedRecipients([]);
  };

  const handleCreateInvite = async () => {
    if (!scheduledTime) {
      toast.error(language === 'he' ? 'נא לבחור זמן' : language === 'ru' ? 'Пожалуйста, выберите время' : language === 'es' ? 'Por favor, selecciona hora' : language === 'fr' ? 'Veuillez sélectionner l\'heure' : language === 'de' ? 'Bitte Zeit auswählen' : language === 'it' ? 'Seleziona l\'ora' : 'Please select time');
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

      toast.success(language === 'he' ? 'הזימון נשלח!' : language === 'ru' ? 'Приглашение отправлено!' : language === 'es' ? '¡Invitación enviada!' : language === 'fr' ? 'Invitation envoyée !' : language === 'de' ? 'Einladung gesendet!' : language === 'it' ? 'Invito inviato!' : 'Invite sent!');
      setShowScheduleDialog(false);
      setScheduledTime('');
    } catch (error) {
      toast.error(language === 'he' ? 'שגיאה ביצירת הזימון' : language === 'ru' ? 'Ошибка создания приглашения' : language === 'es' ? 'Error al crear invitación' : language === 'fr' ? 'Erreur lors de la création de l\'invitation' : language === 'de' ? 'Fehler beim Erstellen der Einladung' : language === 'it' ? 'Errore nella creazione dell\'invito' : 'Error creating invite');
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

  const toggleRecipient = (email) => {
    setSelectedRecipients((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]
    );
  };

  const filteredParticipants = React.useMemo(() => {
    if (!searchQuery.trim()) return otherParticipants;
    
    const query = searchQuery.toLowerCase();
    return otherParticipants.filter((p) => 
      p.name?.toLowerCase().includes(query) ||
      p.email?.toLowerCase().includes(query) ||
      p.phone?.toLowerCase().includes(query) ||
      p.id_number?.toLowerCase().includes(query)
    );
  }, [otherParticipants, searchQuery]);

  const renderMessage = (msg, isPrivate = false) => {
    const isMine = msg.sender_email === currentUserEmail;
    const urgent = msg.isUrgent || false;
    return (
      <div key={msg.id} className={`flex gap-3 mb-4 ${isMine ? 'flex-row-reverse' : ''}`}>
        <Avatar className="w-8 h-8">
          <AvatarFallback className={isMine ? 'bg-emerald-600 text-white' : 'bg-gray-200'}>
            {typeof msg.sender_name === 'string' && msg.sender_name ? msg.sender_name.charAt(0) : 'U'}
          </AvatarFallback>
        </Avatar>
        <div className={`flex-1 ${isMine ? 'text-right' : ''}`}>
          <div className={`inline-block max-w-[80%] ${isMine ? 'text-right' : ''}`}>
            <div className="flex items-center gap-2 mb-1">
              {urgent && (
                <AlertCircle className="w-4 h-4 text-red-600 animate-pulse" />
              )}
              <span className="text-sm font-medium text-gray-700">
                {msg.sender_name}
              </span>
              <span className="text-xs text-gray-400">
                {format(new Date(msg.timestamp), 'HH:mm')}
              </span>
            </div>
            <div className={`rounded-2xl px-4 py-2 ${
              urgent
                ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white border-2 border-yellow-400 shadow-lg'
                : isMine 
                ? 'bg-emerald-600 text-white' 
                : 'bg-gray-100 text-gray-900'
            }`}>
              {urgent && (
                <div className="flex items-center gap-2 mb-1 pb-1 border-b border-white/30">
                  <AlertCircle className="w-3 h-3" />
                  <span className="text-xs font-bold uppercase">
                    {language === 'he' ? 'דחוף!' : language === 'ru' ? 'Срочно!' : language === 'es' ? '¡Urgente!' : language === 'fr' ? 'Urgent !' : language === 'de' ? 'Dringend!' : language === 'it' ? 'Urgente!' : 'URGENT!'}
                  </span>
                </div>
              )}
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
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-blue-600" />
              {language === 'he' ? 'צ\'אט הטיול' : language === 'ru' ? 'Чат поездки' : language === 'es' ? 'Chat del viaje' : language === 'fr' ? 'Chat du voyage' : language === 'de' ? 'Reise-Chat' : language === 'it' ? 'Chat del viaggio' : 'Trip Chat'}
            </CardTitle>
            <div className="flex gap-2">
              <GroupChatManager trip={trip} onGroupCreated={(group) => setGroups([...groups, group])} />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowVideoCall(true)}
                className="gap-2 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
              >
                <Video className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {language === 'he' ? 'שיחת וידאו' : language === 'ru' ? 'Видеозвонок' : language === 'es' ? 'Videollamada' : language === 'fr' ? 'Appel vidéo' : language === 'de' ? 'Videoanruf' : language === 'it' ? 'Videochiamata' : 'Video Call'}
                </span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="group" className="gap-2">
              <Users className="w-4 h-4" />
              {language === 'he' ? 'קבוצתי' : language === 'ru' ? 'Группа' : language === 'es' ? 'Grupo' : language === 'fr' ? 'Groupe' : language === 'de' ? 'Gruppe' : language === 'it' ? 'Gruppo' : 'Group'}
            </TabsTrigger>
            <TabsTrigger value="private" className="gap-2">
              <Lock className="w-4 h-4" />
              {language === 'he' ? 'פרטי' : language === 'ru' ? 'Приватный' : language === 'es' ? 'Privado' : language === 'fr' ? 'Privé' : language === 'de' ? 'Privat' : language === 'it' ? 'Privato' : 'Private'}
            </TabsTrigger>
          </TabsList>

          {/* Group Chat */}
          <TabsContent value="group" className="space-y-4" dir={language === 'he' ? 'rtl' : 'ltr'}>
            {/* Active Video Call Invite Banner */}
            {activeInvite && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center">
                    <Video className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-emerald-900">
                      {language === 'he' ? 'זימון לשיחת וידאו' : language === 'ru' ? 'Приглашение на видеозвонок' : language === 'es' ? 'Invitación a videollamada' : language === 'fr' ? 'Invitation à un appel vidéo' : language === 'de' ? 'Videoanruf-Einladung' : language === 'it' ? 'Invito a videochiamata' : 'Video Call Invitation'}
                    </p>
                    <p className="text-sm text-emerald-700">
                      {activeInvite.creator_name} {language === 'he' ? 'מזמין לשיחת וידאו ב-' : language === 'ru' ? 'приглашает на видеозвонок в ' : language === 'es' ? 'te invita a videollamada a las ' : language === 'fr' ? 'vous invite à un appel vidéo à ' : language === 'de' ? 'lädt Sie zu einem Videoanruf um ' : language === 'it' ? 'ti invita a videochiamata alle ' : 'invites you to video call at '}
                      {format(new Date(activeInvite.scheduled_time), 'MMM d, HH:mm')}
                    </p>
                    <Button
                      size="sm"
                      className="mt-2 bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => setShowVideoCall(true)}
                    >
                      {language === 'he' ? 'הצטרף לשיחה' : language === 'ru' ? 'Присоединиться' : language === 'es' ? 'Unirse' : language === 'fr' ? 'Rejoindre' : language === 'de' ? 'Beitreten' : language === 'it' ? 'Partecipa' : 'Join Call'}
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
                      : language === 'ru' ? 'Сообщений пока нет. Начните разговор!'
                      : language === 'es' ? '¡Aún no hay mensajes. Inicia la conversación!'
                      : language === 'fr' ? 'Pas encore de messages. Commencez la conversation !'
                      : language === 'de' ? 'Noch keine Nachrichten. Starten Sie das Gespräch!'
                      : language === 'it' ? 'Nessun messaggio ancora. Inizia la conversazione!'
                      : 'No messages yet. Start the conversation!'}
                  </p>
                </div>
              ) : (
                groupMessages.map(msg => renderMessage(msg))
              )}
            </ScrollArea>

            <div className="space-y-3 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowScheduleDialog(true)}
                className="w-full gap-2 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
              >
                <Calendar className="w-4 h-4" />
                {language === 'he' ? 'קבע שיחת וידאו' : language === 'ru' ? 'Запланировать видеозвонок' : language === 'es' ? 'Programar videollamada' : language === 'fr' ? 'Planifier appel vidéo' : language === 'de' ? 'Videoanruf planen' : language === 'it' ? 'Pianifica videochiamata' : 'Schedule Video Call'}
              </Button>

              <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg" dir={language === 'he' ? 'rtl' : 'ltr'}>
                <div className="flex items-center gap-2">
                  <AlertCircle className={`w-4 h-4 ${isUrgent ? 'text-red-600' : 'text-gray-400'}`} />
                  <span className="text-sm font-medium">
                    {language === 'he' ? 'הודעה דחופה' : language === 'ru' ? 'Срочное сообщение' : language === 'es' ? 'Mensaje urgente' : language === 'fr' ? 'Message urgent' : language === 'de' ? 'Dringende Nachricht' : language === 'it' ? 'Messaggio urgente' : 'Urgent Message'}
                  </span>
                </div>
                <Switch checked={isUrgent} onCheckedChange={setIsUrgent} />
              </div>
              
              <div className="flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !sending && handleSend()}
                  placeholder={language === 'he' ? 'כתוב הודעה...' : language === 'ru' ? 'Введите сообщение...' : language === 'es' ? 'Escribe un mensaje...' : language === 'fr' ? 'Écrivez un message...' : language === 'de' ? 'Nachricht eingeben...' : language === 'it' ? 'Scrivi un messaggio...' : 'Type a message...'}
                  disabled={sending}
                  dir={language === 'he' ? 'rtl' : 'ltr'}
                  className={isUrgent ? 'border-2 border-red-400' : ''}
                />
                <Button 
                  onClick={handleSend} 
                  disabled={!message.trim() || sending}
                  className={isUrgent ? 'bg-red-600 hover:bg-red-700 animate-pulse' : 'bg-emerald-600 hover:bg-emerald-700'}
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
          <TabsContent value="private" className="space-y-4" dir={language === 'he' ? 'rtl' : 'ltr'}>
            {otherParticipants.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-gray-500">
                  {language === 'he' 
                    ? 'אין משתתפים נוספים עדיין'
                    : language === 'ru' ? 'Других участников пока нет'
                    : language === 'es' ? 'Aún no hay otros participantes'
                    : language === 'fr' ? 'Pas encore d\'autres participants'
                    : language === 'de' ? 'Noch keine anderen Teilnehmer'
                    : language === 'it' ? 'Nessun altro partecipante ancora'
                    : 'No other participants yet'}
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-3 p-3 bg-blue-50 border border-blue-200 rounded-lg" dir={language === 'he' ? 'rtl' : 'ltr'}>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <CheckSquare className="w-4 h-4 text-blue-600" />
                      {language === 'he' ? 'בחירה מרובה' : language === 'ru' ? 'Множественный выбор' : language === 'es' ? 'Selección múltiple' : language === 'fr' ? 'Sélection multiple' : language === 'de' ? 'Mehrfachauswahl' : language === 'it' ? 'Selezione multipla' : 'Multi-Select'}
                    </label>
                    <Switch checked={multiSelectMode} onCheckedChange={setMultiSelectMode} />
                  </div>
                  {multiSelectMode && selectedRecipients.length > 0 && (
                    <div className="text-xs text-blue-700">
                      {selectedRecipients.length} {language === 'he' ? 'נבחרו' : language === 'ru' ? 'выбрано' : language === 'es' ? 'seleccionados' : language === 'fr' ? 'sélectionnés' : language === 'de' ? 'ausgewählt' : language === 'it' ? 'selezionati' : 'selected'}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder={language === 'he' ? 'חפש לפי שם, אימייל או טלפון...' : language === 'ru' ? 'Поиск по имени, email или телефону...' : language === 'es' ? 'Buscar por nombre, email o teléfono...' : language === 'fr' ? 'Rechercher par nom, email ou téléphone...' : language === 'de' ? 'Nach Name, E-Mail oder Telefon suchen...' : language === 'it' ? 'Cerca per nome, email o telefono...' : 'Search by name, email or phone...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {!multiSelectMode && (
                  <div className="space-y-2" dir={language === 'he' ? 'rtl' : 'ltr'}>
                    <label className="text-sm font-medium">
                      {language === 'he' ? 'שלח הודעה פרטית אל:' : language === 'ru' ? 'Отправить личное сообщение:' : language === 'es' ? 'Enviar mensaje privado a:' : language === 'fr' ? 'Envoyer message privé à :' : language === 'de' ? 'Private Nachricht senden an:' : language === 'it' ? 'Invia messaggio privato a:' : 'Send private message to:'}
                    </label>
                    <Select value={selectedRecipient} onValueChange={setSelectedRecipient}>
                      <SelectTrigger>
                        <SelectValue placeholder={language === 'he' ? 'בחר משתתף' : language === 'ru' ? 'Выбрать участника' : language === 'es' ? 'Seleccionar participante' : language === 'fr' ? 'Sélectionner participant' : language === 'de' ? 'Teilnehmer auswählen' : language === 'it' ? 'Seleziona partecipante' : 'Select participant'} />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredParticipants.map(p => (
                          <SelectItem key={p.email} value={p.email}>
                            <div>
                              <p className="font-medium">{p.name}</p>
                              <p className="text-xs text-gray-500">{p.email}</p>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {multiSelectMode && (
                  <div className="max-h-48 overflow-y-auto space-y-2 border rounded-lg p-2">
                    {filteredParticipants.map((p) => (
                      <div
                        key={p.email}
                        className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                        onClick={() => toggleRecipient(p.email)}
                      >
                        <Checkbox checked={selectedRecipients.includes(p.email)} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{p.name}</p>
                          <p className="text-xs text-gray-500 truncate">{p.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {(selectedRecipient || (multiSelectMode && selectedRecipients.length > 0)) && (
                  <>
                    <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg" dir={language === 'he' ? 'rtl' : 'ltr'}>
                      <div className="flex items-center gap-2">
                        <AlertCircle className={`w-4 h-4 ${isUrgent ? 'text-red-600' : 'text-gray-400'}`} />
                        <span className="text-sm font-medium">
                          {language === 'he' ? 'הודעה דחופה' : language === 'ru' ? 'Срочное сообщение' : language === 'es' ? 'Mensaje urgente' : language === 'fr' ? 'Message urgent' : language === 'de' ? 'Dringende Nachricht' : language === 'it' ? 'Messaggio urgente' : 'Urgent Message'}
                        </span>
                      </div>
                      <Switch checked={isUrgent} onCheckedChange={setIsUrgent} />
                    </div>

                    <ScrollArea className="h-[300px] pr-4" ref={scrollRef}>
                      {privateConversations[selectedRecipient]?.length > 0 ? (
                        privateConversations[selectedRecipient].map(msg => renderMessage(msg, true))
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center py-12">
                          <MessageCircle className="w-12 h-12 text-gray-300 mb-3" />
                          <p className="text-gray-500">
                            {language === 'he' 
                              ? 'אין הודעות עדיין'
                              : language === 'ru' ? 'Сообщений пока нет'
                              : language === 'es' ? 'Aún no hay mensajes'
                              : language === 'fr' ? 'Pas encore de messages'
                              : language === 'de' ? 'Noch keine Nachrichten'
                              : language === 'it' ? 'Nessun messaggio ancora'
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
                        placeholder={
                          multiSelectMode 
                            ? (language === 'he' ? 'הודעה לנבחרים...' : language === 'ru' ? 'Сообщение выбранным...' : language === 'es' ? 'Mensaje a seleccionados...' : language === 'fr' ? 'Message aux sélectionnés...' : language === 'de' ? 'Nachricht an Ausgewählte...' : language === 'it' ? 'Messaggio ai selezionati...' : 'Message to selected...')
                            : (language === 'he' ? 'כתוב הודעה פרטית...' : language === 'ru' ? 'Введите личное сообщение...' : language === 'es' ? 'Escribe mensaje privado...' : language === 'fr' ? 'Écrivez message privé...' : language === 'de' ? 'Private Nachricht eingeben...' : language === 'it' ? 'Scrivi messaggio privato...' : 'Type a private message...')
                        }
                        disabled={sending}
                        dir={language === 'he' ? 'rtl' : 'ltr'}
                        className={isUrgent ? 'border-2 border-red-400' : ''}
                      />
                      <Button 
                        onClick={handleSend} 
                        disabled={!message.trim() || sending || (!selectedRecipient && (!multiSelectMode || selectedRecipients.length === 0))}
                        className={isUrgent ? 'bg-red-600 hover:bg-red-700 animate-pulse' : 'bg-blue-600 hover:bg-blue-700'}
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
            {language === 'he' ? 'קבע שיחת וידאו' : language === 'ru' ? 'Запланировать видеозвонок' : language === 'es' ? 'Programar videollamada' : language === 'fr' ? 'Planifier appel vidéo' : language === 'de' ? 'Videoanruf planen' : language === 'it' ? 'Pianifica videochiamata' : 'Schedule Video Call'}
          </DialogTitle>
          <DialogDescription>
            {language === 'he' 
              ? 'בחר מתי תרצה לקיים את שיחת הוידאו'
              : language === 'ru' ? 'Выберите время для видеозвонка'
              : language === 'es' ? 'Elige cuándo quieres hacer la videollamada'
              : language === 'fr' ? 'Choisissez quand vous souhaitez avoir l\'appel vidéo'
              : language === 'de' ? 'Wählen Sie, wann Sie den Videoanruf haben möchten'
              : language === 'it' ? 'Scegli quando vuoi fare la videochiamata'
              : 'Choose when you want to have the video call'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {language === 'he' ? 'תאריך ושעה' : language === 'ru' ? 'Дата и время' : language === 'es' ? 'Fecha y hora' : language === 'fr' ? 'Date et heure' : language === 'de' ? 'Datum und Uhrzeit' : language === 'it' ? 'Data e ora' : 'Date & Time'}
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
            {language === 'he' ? 'ביטול' : language === 'ru' ? 'Отмена' : language === 'es' ? 'Cancelar' : language === 'fr' ? 'Annuler' : language === 'de' ? 'Abbrechen' : language === 'it' ? 'Annulla' : 'Cancel'}
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
            {language === 'he' ? 'שלח זימון' : language === 'ru' ? 'Отправить приглашение' : language === 'es' ? 'Enviar invitación' : language === 'fr' ? 'Envoyer invitation' : language === 'de' ? 'Einladung senden' : language === 'it' ? 'Invia invito' : 'Send Invite'}
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
                {language === 'he' ? 'שיחת וידאו קבוצתית' : language === 'ru' ? 'Групповой видеозвонок' : language === 'es' ? 'Videollamada grupal' : language === 'fr' ? 'Appel vidéo de groupe' : language === 'de' ? 'Gruppen-Videoanruf' : language === 'it' ? 'Videochiamata di gruppo' : 'Group Video Call'}
              </DialogTitle>
              <DialogDescription>
                {language === 'he' 
                  ? 'כל המשתתפים הרשומים לטיול יכולים להצטרף לשיחה'
                  : language === 'ru' ? 'Все зарегистрированные участники могут присоединиться'
                  : language === 'es' ? 'Todos los participantes registrados pueden unirse'
                  : language === 'fr' ? 'Tous les participants inscrits peuvent rejoindre'
                  : language === 'de' ? 'Alle registrierten Teilnehmer können beitreten'
                  : language === 'it' ? 'Tutti i partecipanti registrati possono partecipare'
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

    {/* Urgent Message Popup */}
    <Dialog open={!!urgentPopupMessage} onOpenChange={(open) => !open && setUrgentPopupMessage(null)}>
      <DialogContent className="border-l-8 border-l-red-600 animate-in zoom-in-95 duration-300">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600 text-2xl">
            <AlertCircle className="w-8 h-8 animate-pulse" />
            {language === 'he' ? 'הודעה דחופה!' : language === 'ru' ? 'Срочное сообщение!' : language === 'es' ? '¡Mensaje urgente!' : language === 'fr' ? 'Message urgent !' : language === 'de' ? 'Dringende Nachricht!' : language === 'it' ? 'Messaggio urgente!' : 'URGENT MESSAGE!'}
          </DialogTitle>
          <DialogDescription className="text-lg font-medium text-gray-900 mt-4">
            {language === 'he' ? 'התקבלה הודעה דחופה מ-' : language === 'ru' ? 'Получено срочное сообщение от ' : language === 'es' ? 'Mensaje urgente de ' : language === 'fr' ? 'Message urgent de ' : language === 'de' ? 'Dringende Nachricht von ' : language === 'it' ? 'Messaggio urgente da ' : 'Urgent message from '}
            <span className="font-bold">{urgentPopupMessage?.sender_name}</span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-6 bg-red-50 border border-red-100 rounded-xl my-2">
          <p className="text-xl text-gray-900 leading-relaxed whitespace-pre-wrap">
            {urgentPopupMessage?.content}
          </p>
          <div className="mt-4 flex justify-end text-sm text-gray-500">
            {urgentPopupMessage && format(new Date(urgentPopupMessage.timestamp), 'HH:mm')}
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <Button 
            onClick={() => setUrgentPopupMessage(null)}
            className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto text-lg py-6"
          >
            {language === 'he' ? 'אישור וסגירה' : language === 'ru' ? 'Подтвердить' : language === 'es' ? 'Entendido' : language === 'fr' ? 'Compris' : language === 'de' ? 'Verstanden' : language === 'it' ? 'Capito' : 'Acknowledge'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}