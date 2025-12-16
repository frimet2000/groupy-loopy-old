import React, { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { UserPlus, Mail, Send, Loader2, X, Copy } from 'lucide-react';
import { motion } from 'framer-motion';

export default function InviteFriends({ trip, currentUserEmail, onUpdate }) {
  const { language, isRTL } = useLanguage();
  const [inviteEmail, setInviteEmail] = useState('');
  const [sending, setSending] = useState(false);
  const isOrganizer = currentUserEmail === trip.organizer_email;

  const invitedUsers = trip.invited_emails || [];
  const alreadyParticipants = trip.participants?.map(p => p.email) || [];
  const pendingRequests = trip.pending_requests?.map(r => r.email) || [];

  const handleSendInvite = async () => {
    if (!inviteEmail.trim()) {
      toast.error(
        language === 'he' ? 'נא להזין כתובת אימייל' :
        language === 'ru' ? 'Введите адрес электронной почты' :
        language === 'es' ? 'Ingrese correo electrónico' :
        language === 'fr' ? 'Entrez une adresse e-mail' :
        language === 'de' ? 'E-Mail-Adresse eingeben' :
        language === 'it' ? 'Inserisci email' :
        'Please enter email address'
      );
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      toast.error(
        language === 'he' ? 'כתובת אימייל לא תקינה' :
        language === 'ru' ? 'Неверный адрес электронной почты' :
        language === 'es' ? 'Correo electrónico no válido' :
        language === 'fr' ? 'Adresse e-mail invalide' :
        language === 'de' ? 'Ungültige E-Mail-Adresse' :
        language === 'it' ? 'Email non valida' :
        'Invalid email address'
      );
      return;
    }

    if (alreadyParticipants.includes(inviteEmail)) {
      toast.error(
        language === 'he' ? 'המשתמש כבר משתתף בטיול' :
        language === 'ru' ? 'Пользователь уже участвует' :
        language === 'es' ? 'El usuario ya es participante' :
        language === 'fr' ? 'L\'utilisateur participe déjà' :
        language === 'de' ? 'Benutzer ist bereits Teilnehmer' :
        language === 'it' ? 'L\'utente è già partecipante' :
        'User is already a participant'
      );
      return;
    }

    if (invitedUsers.includes(inviteEmail)) {
      toast.error(
        language === 'he' ? 'הזמנה כבר נשלחה למשתמש זה' :
        language === 'ru' ? 'Приглашение уже отправлено' :
        language === 'es' ? 'Ya se envió invitación' :
        language === 'fr' ? 'Invitation déjà envoyée' :
        language === 'de' ? 'Einladung bereits gesendet' :
        language === 'it' ? 'Invito già inviato' :
        'Invitation already sent to this user'
      );
      return;
    }

    setSending(true);
    try {
      // Update trip with new invited email
      const updatedInvites = [...invitedUsers, inviteEmail];
      await base44.entities.Trip.update(trip.id, {
        invited_emails: updatedInvites
      });

      // Send invitation email
      const tripUrl = `${window.location.origin}${window.location.pathname}?id=${trip.id}`;
      const senderName = trip.participants?.find(p => p.email === currentUserEmail)?.name || currentUserEmail;
      
      const emailBody = language === 'he'
        ? `שלום,\n\n${senderName} מזמין אותך להצטרף לטיול "${trip.title}"!\n\n📅 תאריך: ${new Date(trip.date).toLocaleDateString('he-IL')}\n📍 מיקום: ${trip.location}\n⛰️ פעילות: ${trip.activity_type}\n\nלחץ כאן כדי לצפות בפרטי הטיול ולהצטרף:\n${tripUrl}\n\nמקווים לראותך שם!\n\nבברכה,\nצוות Groupy Loopy`
        : language === 'ru'
        ? `Здравствуйте,\n\n${senderName} приглашает вас присоединиться к поездке "${trip.title}"!\n\n📅 Дата: ${new Date(trip.date).toLocaleDateString('ru-RU')}\n📍 Место: ${trip.location}\n⛰️ Активность: ${trip.activity_type}\n\nНажмите здесь, чтобы просмотреть детали и присоединиться:\n${tripUrl}\n\nНадеемся увидеть вас!\n\nС уважением,\nКоманда Groupy Loopy`
        : language === 'es'
        ? `Hola,\n\n¡${senderName} te invita a unirte al viaje "${trip.title}"!\n\n📅 Fecha: ${new Date(trip.date).toLocaleDateString('es-ES')}\n📍 Ubicación: ${trip.location}\n⛰️ Actividad: ${trip.activity_type}\n\nHaz clic aquí para ver los detalles y unirte:\n${tripUrl}\n\n¡Esperamos verte allí!\n\nSaludos,\nEquipo Groupy Loopy`
        : language === 'fr'
        ? `Bonjour,\n\n${senderName} vous invite à rejoindre le voyage "${trip.title}" !\n\n📅 Date : ${new Date(trip.date).toLocaleDateString('fr-FR')}\n📍 Lieu : ${trip.location}\n⛰️ Activité : ${trip.activity_type}\n\nCliquez ici pour voir les détails et rejoindre :\n${tripUrl}\n\nNous espérons vous y voir !\n\nCordialement,\nÉquipe Groupy Loopy`
        : language === 'de'
        ? `Hallo,\n\n${senderName} lädt Sie ein, an der Reise "${trip.title}" teilzunehmen!\n\n📅 Datum: ${new Date(trip.date).toLocaleDateString('de-DE')}\n📍 Ort: ${trip.location}\n⛰️ Aktivität: ${trip.activity_type}\n\nKlicken Sie hier, um Details anzuzeigen und beizutreten:\n${tripUrl}\n\nWir hoffen, Sie dort zu sehen!\n\nMit freundlichen Grüßen,\nGroupy Loopy Team`
        : language === 'it'
        ? `Ciao,\n\n${senderName} ti invita a unirti al viaggio "${trip.title}"!\n\n📅 Data: ${new Date(trip.date).toLocaleDateString('it-IT')}\n📍 Luogo: ${trip.location}\n⛰️ Attività: ${trip.activity_type}\n\nClicca qui per vedere i dettagli e unirti:\n${tripUrl}\n\nSperiamo di vederti lì!\n\nCordiali saluti,\nTeam Groupy Loopy`
        : `Hello,\n\n${senderName} invites you to join the trip "${trip.title}"!\n\n📅 Date: ${new Date(trip.date).toLocaleDateString()}\n📍 Location: ${trip.location}\n⛰️ Activity: ${trip.activity_type}\n\nClick here to view trip details and join:\n${tripUrl}\n\nHope to see you there!\n\nBest regards,\nGroupy Loopy Team`;

      await base44.integrations.Core.SendEmail({
        to: inviteEmail,
        subject: language === 'he'
          ? `הזמנה לטיול: ${trip.title}`
          : language === 'ru'
          ? `Приглашение на поездку: ${trip.title}`
          : language === 'es'
          ? `Invitación al viaje: ${trip.title}`
          : language === 'fr'
          ? `Invitation au voyage : ${trip.title}`
          : language === 'de'
          ? `Einladung zur Reise: ${trip.title}`
          : language === 'it'
          ? `Invito al viaggio: ${trip.title}`
          : `Trip Invitation: ${trip.title}`,
        body: emailBody
      });

      setInviteEmail('');
      onUpdate();
      toast.success(
        language === 'he' ? 'ההזמנה נשלחה!' :
        language === 'ru' ? 'Приглашение отправлено!' :
        language === 'es' ? '¡Invitación enviada!' :
        language === 'fr' ? 'Invitation envoyée !' :
        language === 'de' ? 'Einladung gesendet!' :
        language === 'it' ? 'Invito inviato!' :
        'Invitation sent!'
      );
    } catch (error) {
      toast.error(
        language === 'he' ? 'שגיאה בשליחת ההזמנה' :
        language === 'ru' ? 'Ошибка отправки' :
        language === 'es' ? 'Error al enviar' :
        language === 'fr' ? 'Erreur d\'envoi' :
        language === 'de' ? 'Fehler beim Senden' :
        language === 'it' ? 'Errore nell\'invio' :
        'Error sending invitation'
      );
    }
    setSending(false);
  };

  const handleCopyLink = async () => {
    const tripUrl = `${window.location.origin}${window.location.pathname}?id=${trip.id}`;
    await navigator.clipboard.writeText(tripUrl);
    toast.success(
      language === 'he' ? 'הקישור הועתק' :
      language === 'ru' ? 'Ссылка скопирована' :
      language === 'es' ? 'Enlace copiado' :
      language === 'fr' ? 'Lien copié' :
      language === 'de' ? 'Link kopiert' :
      language === 'it' ? 'Link copiato' :
      'Link copied'
    );
  };

  const handleRemoveInvite = async (email) => {
    try {
      const updatedInvites = invitedUsers.filter(e => e !== email);
      await base44.entities.Trip.update(trip.id, {
        invited_emails: updatedInvites
      });
      onUpdate();
      toast.success(
        language === 'he' ? 'ההזמנה בוטלה' :
        language === 'ru' ? 'Приглашение отменено' :
        language === 'es' ? 'Invitación cancelada' :
        language === 'fr' ? 'Invitation annulée' :
        language === 'de' ? 'Einladung abgebrochen' :
        language === 'it' ? 'Invito annullato' :
        'Invitation cancelled'
      );
    } catch (error) {
      toast.error(
        language === 'he' ? 'שגיאה בביטול ההזמנה' :
        language === 'ru' ? 'Ошибка отмены' :
        language === 'es' ? 'Error al cancelar' :
        language === 'fr' ? 'Erreur d\'annulation' :
        language === 'de' ? 'Fehler beim Abbrechen' :
        language === 'it' ? 'Errore nell\'annullare' :
        'Error cancelling invitation'
      );
    }
  };

  return (
    <Card className="border-2 border-emerald-100">
      <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50">
        <CardTitle className="flex items-center gap-3" dir={isRTL ? 'rtl' : 'ltr'}>
          <UserPlus className="w-6 h-6 text-emerald-600" />
          {language === 'he' ? 'הזמן חברים' :
           language === 'ru' ? 'Пригласить друзей' :
           language === 'es' ? 'Invitar amigos' :
           language === 'fr' ? 'Inviter des amis' :
           language === 'de' ? 'Freunde einladen' :
           language === 'it' ? 'Invita amici' :
           'Invite Friends'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Share Link */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700" dir={isRTL ? 'rtl' : 'ltr'}>
            {language === 'he' ? 'שתף קישור לטיול:' :
             language === 'ru' ? 'Поделиться ссылкой:' :
             language === 'es' ? 'Compartir enlace:' :
             language === 'fr' ? 'Partager le lien :' :
             language === 'de' ? 'Link teilen:' :
             language === 'it' ? 'Condividi link:' :
             'Share trip link:'}
          </p>
          <Button
            onClick={handleCopyLink}
            variant="outline"
            className="w-full gap-2 border-emerald-200 hover:bg-emerald-50"
          >
            <Copy className="w-4 h-4" />
            {language === 'he' ? 'העתק קישור' :
             language === 'ru' ? 'Копировать ссылку' :
             language === 'es' ? 'Copiar enlace' :
             language === 'fr' ? 'Copier le lien' :
             language === 'de' ? 'Link kopieren' :
             language === 'it' ? 'Copia link' :
             'Copy Link'}
          </Button>
        </div>

        {/* Send Email Invitation */}
        {isOrganizer && (
          <>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">
                  {language === 'he' ? 'או' : language === 'ru' ? 'или' : language === 'es' ? 'o' : language === 'fr' ? 'ou' : language === 'de' ? 'oder' : language === 'it' ? 'o' : 'or'}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700" dir={isRTL ? 'rtl' : 'ltr'}>
                {language === 'he' ? 'שלח הזמנה באימייל:' :
                 language === 'ru' ? 'Отправить приглашение по email:' :
                 language === 'es' ? 'Enviar invitación por correo:' :
                 language === 'fr' ? 'Envoyer invitation par e-mail :' :
                 language === 'de' ? 'Einladung per E-Mail senden:' :
                 language === 'it' ? 'Invia invito via email:' :
                 'Send invitation by email:'}
              </p>
              <div className="flex gap-2" dir={isRTL ? 'rtl' : 'ltr'}>
                <Input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder={
                    language === 'he' ? 'כתובת אימייל של החבר' :
                    language === 'ru' ? 'Email друга' :
                    language === 'es' ? 'Email del amigo' :
                    language === 'fr' ? 'E-mail de l\'ami' :
                    language === 'de' ? 'E-Mail des Freundes' :
                    language === 'it' ? 'Email dell\'amico' :
                    'Friend\'s email address'
                  }
                  onKeyDown={(e) => e.key === 'Enter' && handleSendInvite()}
                  className="flex-1"
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
                <Button
                  onClick={handleSendInvite}
                  disabled={sending || !inviteEmail.trim()}
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

            {/* Invited Users List */}
            {invitedUsers.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-700" dir={isRTL ? 'rtl' : 'ltr'}>
                  {language === 'he' ? 'הזמנות שנשלחו:' :
                   language === 'ru' ? 'Отправленные приглашения:' :
                   language === 'es' ? 'Invitaciones enviadas:' :
                   language === 'fr' ? 'Invitations envoyées :' :
                   language === 'de' ? 'Gesendete Einladungen:' :
                   language === 'it' ? 'Inviti inviati:' :
                   'Sent invitations:'}
                </p>
                <div className="space-y-2">
                  {invitedUsers.map((email, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-200"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-emerald-600 text-white text-xs">
                            <Mail className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-gray-800" dir={isRTL ? 'rtl' : 'ltr'}>
                            {email}
                          </p>
                          <p className="text-xs text-emerald-600">
                            {pendingRequests.includes(email)
                              ? (language === 'he' ? 'ממתין לאישור' :
                                 language === 'ru' ? 'Ожидает подтверждения' :
                                 language === 'es' ? 'Esperando confirmación' :
                                 language === 'fr' ? 'En attente de confirmation' :
                                 language === 'de' ? 'Wartet auf Bestätigung' :
                                 language === 'it' ? 'In attesa di conferma' :
                                 'Pending approval')
                              : alreadyParticipants.includes(email)
                              ? (language === 'he' ? 'משתתף' :
                                 language === 'ru' ? 'Участник' :
                                 language === 'es' ? 'Participante' :
                                 language === 'fr' ? 'Participant' :
                                 language === 'de' ? 'Teilnehmer' :
                                 language === 'it' ? 'Partecipante' :
                                 'Joined')
                              : (language === 'he' ? 'הוזמן' :
                                 language === 'ru' ? 'Приглашен' :
                                 language === 'es' ? 'Invitado' :
                                 language === 'fr' ? 'Invité' :
                                 language === 'de' ? 'Eingeladen' :
                                 language === 'it' ? 'Invitato' :
                                 'Invited')}
                          </p>
                        </div>
                      </div>
                      {!alreadyParticipants.includes(email) && !pendingRequests.includes(email) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveInvite(email)}
                          className="hover:bg-red-50 hover:text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {!isOrganizer && (
          <div className="text-center py-8 text-gray-500" dir={isRTL ? 'rtl' : 'ltr'}>
            <UserPlus className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-sm">
              {language === 'he'
                ? 'רק המארגן יכול להזמין חברים נוספים'
                : language === 'ru'
                ? 'Только организатор может приглашать друзей'
                : language === 'es'
                ? 'Solo el organizador puede invitar amigos'
                : language === 'fr'
                ? 'Seul l\'organisateur peut inviter des amis'
                : language === 'de'
                ? 'Nur der Organisator kann Freunde einladen'
                : language === 'it'
                ? 'Solo l\'organizzatore può invitare amici'
                : 'Only the organizer can invite friends'}
            </p>
            <Button
              onClick={handleCopyLink}
              variant="outline"
              className="mt-4 gap-2"
            >
              <Copy className="w-4 h-4" />
              {language === 'he' ? 'העתק קישור לשיתוף' :
               language === 'ru' ? 'Копировать ссылку для отправки' :
               language === 'es' ? 'Copiar enlace para compartir' :
               language === 'fr' ? 'Copier le lien pour partager' :
               language === 'de' ? 'Link zum Teilen kopieren' :
               language === 'it' ? 'Copia link per condividere' :
               'Copy link to share'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}