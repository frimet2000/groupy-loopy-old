import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Share2, LogIn, BookOpen, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

export default function ThankYouView({ 
  participants, 
  selectedDays, 
  totalAmount, 
  userType, 
  language, 
  isRTL 
}) {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(7);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const tripId = '6946647d7d7b248feaf1b118';
  const groupyLoginUrl = 'https://groupyloopy.app/login';

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const user = await base44.auth.me();
        setIsLoggedIn(!!user);
      } catch {
        setIsLoggedIn(false);
      }
    };
    checkAuth();

    // Trigger confetti animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    // Google Ads Conversion Tracking
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'conversion', {
        'send_to': 'AW-XXXXXXXXXX/CONVERSION_ID',
        'value': totalAmount || 0,
        'currency': 'ILS',
        'transaction_id': Date.now().toString()
      });
    }
  }, [totalAmount]);

  useEffect(() => {
    // Countdown timer - redirect to Groupy Loopy login after 7 seconds
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      window.location.href = groupyLoginUrl;
    }
  }, [countdown]);

  const handleShare = async () => {
    const message = language === 'he'
      ? `הצטרפתי למסע "נפגשים בשביל ישראל"! 🇮🇱\n\nגם אתם מוזמנים להצטרף:\nhttps://groupyloopy.app/NifgashimPortal`
      : `I joined the "Nifgashim for Israel" trek! 🇮🇱\n\nYou're welcome to join too:\nhttps://groupyloopy.app/NifgashimPortal`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const translations = {
    he: {
      title: "תודה שנרשמת לנפגשים בשביל ישראל!",
      subtitle: "ההרשמה שלך התקבלה בהצלחה",
      groupTitle: "בקשת ההרשמה נשלחה בהצלחה!",
      groupSubtitle: "ההרשמה תישלח לאישור מנהלי המסע",
      groupPending: "ההרשמה ממתינה לאישור",
      groupPendingMessage: "ההרשמה שלכם נשלחה למנהלי המסע לאישור. לאחר שההרשמה תאושר, תקבלו מייל עם כל הפרטים והמידע הנדרש.",
      confirmation: "אישור הרשמה",
      participants: "משתתפים",
      selectedDays: "ימים נבחרים",
      totalPaid: "סכום ששולם",
      groupFree: "רישום קבוצתי - ללא עלות",
      nextSteps: "מה הלאה?",
      step1: "תקבל אישור במייל עם כל הפרטים",
      step2: "הצטרף לקבוצת WhatsApp של הטראק",
      step3: "עקוב אחר עדכונים באזור האישי שלך",
      groupStep1: "מנהלי המסע יבדקו את בקשת ההרשמה",
      groupStep2: "תקבל מייל לאחר אישור ההרשמה",
      groupStep3: "בעקבות האישור תוכל להצטרף לקבוצת WhatsApp של המסע",
      shareWithFriends: "שתף עם חברים",
      loginToTrack: "התחבר למעקב אחר הטיול",
      redirecting: "מעביר אותך להרשמה ב-Groupy Loopy בעוד",
      seconds: "שניות",
      loginMessage: "על מנת לעקוב אחר הטיול ולקבל עדכונים, אנא התחבר למערכת Groupy Loopy",
      viewTrip: "צפה בדף הטיול",
      readGuide: "מדריך לארגון טיולים"
    },
    en: {
      title: "Thank You for Registering to Nifgashim for Israel!",
      subtitle: "Your registration has been successfully received",
      groupTitle: "Registration Request Sent Successfully!",
      groupSubtitle: "Your registration will be sent for trek organizers approval",
      groupPending: "Registration Pending Approval",
      groupPendingMessage: "Your registration has been sent to the trek organizers for approval. Once approved, you'll receive an email with all details and required information.",
      confirmation: "Registration Confirmation",
      participants: "Participants",
      selectedDays: "Selected Days",
      totalPaid: "Total Paid",
      groupFree: "Group Registration - Free",
      nextSteps: "What's Next?",
      step1: "You'll receive an email confirmation with all details",
      step2: "Join the trek's WhatsApp group",
      step3: "Follow updates in your personal area",
      groupStep1: "Trek organizers will review your registration request",
      groupStep2: "You'll receive an email after registration approval",
      groupStep3: "Following approval, you can join the trek's WhatsApp group",
      shareWithFriends: "Share with Friends",
      loginToTrack: "Login to Track Your Trip",
      redirecting: "Redirecting you to the trip page in",
      seconds: "seconds",
      loginMessage: "To track your trip and receive updates, please login to Groupy Loopy",
      viewTrip: "View Trip Page",
      readGuide: "Trip Planning Guide"
    },
    ru: {
      title: "Спасибо за регистрацию на Nifgashim для Израиля!",
      subtitle: "Ваша регистрация успешно получена",
      groupTitle: "Заявка на регистрацию успешно отправлена!",
      groupSubtitle: "Ваша регистрация будет отправлена на утверждение организаторам",
      groupPending: "Регистрация ожидает утверждения",
      groupPendingMessage: "Ваша регистрация отправлена организаторам трека на утверждение. После утверждения вы получите электронное письмо со всеми деталями и необходимой информацией.",
      confirmation: "Подтверждение регистрации",
      participants: "Участники",
      selectedDays: "Выбранные дни",
      totalPaid: "Всего оплачено",
      groupFree: "Групповая регистрация - бесплатно",
      nextSteps: "Что дальше?",
      step1: "Вы получите подтверждение по электронной почте со всеми деталями",
      step2: "Присоединяйтесь к группе WhatsApp трека",
      step3: "Следите за обновлениями в личном кабинете",
      groupStep1: "Организаторы трека рассмотрят вашу заявку",
      groupStep2: "Вы получите письмо после утверждения регистрации",
      groupStep3: "После утверждения вы сможете присоединиться к группе WhatsApp трека",
      shareWithFriends: "Поделиться с друзьями",
      loginToTrack: "Войти для отслеживания поездки",
      redirecting: "Переход на страницу поездки через",
      seconds: "секунд",
      loginMessage: "Чтобы отслеживать поездку и получать обновления, войдите в Groupy Loopy",
      viewTrip: "Просмотр страницы поездки",
      readGuide: "Руководство по планированию поездок"
    },
    es: {
      title: "¡Gracias por registrarte en Nifgashim para Israel!",
      subtitle: "Tu registro ha sido recibido exitosamente",
      groupTitle: "¡Solicitud de registro enviada exitosamente!",
      groupSubtitle: "Tu registro será enviado para aprobación de los organizadores",
      groupPending: "Registro pendiente de aprobación",
      groupPendingMessage: "Tu registro ha sido enviado a los organizadores del trek para su aprobación. Una vez aprobado, recibirás un correo con todos los detalles e información requerida.",
      confirmation: "Confirmación de registro",
      participants: "Participantes",
      selectedDays: "Días seleccionados",
      totalPaid: "Total pagado",
      groupFree: "Registro grupal - gratis",
      nextSteps: "¿Qué sigue?",
      step1: "Recibirás un correo de confirmación con todos los detalles",
      step2: "Únete al grupo de WhatsApp del trek",
      step3: "Sigue las actualizaciones en tu área personal",
      groupStep1: "Los organizadores revisarán tu solicitud de registro",
      groupStep2: "Recibirás un correo después de la aprobación del registro",
      groupStep3: "Tras la aprobación, podrás unirte al grupo de WhatsApp del trek",
      shareWithFriends: "Compartir con amigos",
      loginToTrack: "Iniciar sesión para seguimiento",
      redirecting: "Redirigiendo a la página del viaje en",
      seconds: "segundos",
      loginMessage: "Para seguir tu viaje y recibir actualizaciones, inicia sesión en Groupy Loopy",
      viewTrip: "Ver página del viaje",
      readGuide: "Guía de planificación de viajes"
    },
    fr: {
      title: "Merci de vous être inscrit à Nifgashim pour Israël!",
      subtitle: "Votre inscription a été reçue avec succès",
      groupTitle: "Demande d'inscription envoyée avec succès!",
      groupSubtitle: "Votre inscription sera envoyée pour approbation des organisateurs",
      groupPending: "Inscription en attente d'approbation",
      groupPendingMessage: "Votre inscription a été envoyée aux organisateurs du trek pour approbation. Une fois approuvée, vous recevrez un e-mail avec tous les détails et informations requises.",
      confirmation: "Confirmation d'inscription",
      participants: "Participants",
      selectedDays: "Jours sélectionnés",
      totalPaid: "Total payé",
      groupFree: "Inscription de groupe - gratuit",
      nextSteps: "Quelle est la suite?",
      step1: "Vous recevrez un e-mail de confirmation avec tous les détails",
      step2: "Rejoignez le groupe WhatsApp du trek",
      step3: "Suivez les mises à jour dans votre espace personnel",
      groupStep1: "Les organisateurs examineront votre demande d'inscription",
      groupStep2: "Vous recevrez un e-mail après l'approbation de l'inscription",
      groupStep3: "Suite à l'approbation, vous pourrez rejoindre le groupe WhatsApp du trek",
      shareWithFriends: "Partager avec des amis",
      loginToTrack: "Connexion pour le suivi",
      redirecting: "Redirection vers la page du voyage dans",
      seconds: "secondes",
      loginMessage: "Pour suivre votre voyage et recevoir des mises à jour, connectez-vous à Groupy Loopy",
      viewTrip: "Voir la page du voyage",
      readGuide: "Guide de planification de voyage"
    },
    de: {
      title: "Danke für Ihre Registrierung bei Nifgashim für Israel!",
      subtitle: "Ihre Registrierung wurde erfolgreich empfangen",
      groupTitle: "Registrierungsantrag erfolgreich gesendet!",
      groupSubtitle: "Ihre Registrierung wird zur Genehmigung an die Organisatoren gesendet",
      groupPending: "Registrierung wartet auf Genehmigung",
      groupPendingMessage: "Ihre Registrierung wurde zur Genehmigung an die Trek-Organisatoren gesendet. Nach der Genehmigung erhalten Sie eine E-Mail mit allen Details und erforderlichen Informationen.",
      confirmation: "Registrierungsbestätigung",
      participants: "Teilnehmer",
      selectedDays: "Ausgewählte Tage",
      totalPaid: "Gesamtbetrag",
      groupFree: "Gruppenregistrierung - kostenlos",
      nextSteps: "Was kommt als Nächstes?",
      step1: "Sie erhalten eine Bestätigungs-E-Mail mit allen Details",
      step2: "Treten Sie der WhatsApp-Gruppe des Treks bei",
      step3: "Folgen Sie Updates in Ihrem persönlichen Bereich",
      groupStep1: "Die Trek-Organisatoren werden Ihren Registrierungsantrag prüfen",
      groupStep2: "Sie erhalten eine E-Mail nach Genehmigung der Registrierung",
      groupStep3: "Nach der Genehmigung können Sie der WhatsApp-Gruppe des Treks beitreten",
      shareWithFriends: "Mit Freunden teilen",
      loginToTrack: "Anmelden zur Nachverfolgung",
      redirecting: "Weiterleitung zur Reiseseite in",
      seconds: "Sekunden",
      loginMessage: "Um Ihre Reise zu verfolgen und Updates zu erhalten, melden Sie sich bei Groupy Loopy an",
      viewTrip: "Reiseseite anzeigen",
      readGuide: "Reiseplanungsführer"
    },
    it: {
      title: "Grazie per esserti registrato a Nifgashim per Israele!",
      subtitle: "La tua registrazione è stata ricevuta con successo",
      groupTitle: "Richiesta di registrazione inviata con successo!",
      groupSubtitle: "La tua registrazione sarà inviata per l'approvazione degli organizzatori",
      groupPending: "Registrazione in attesa di approvazione",
      groupPendingMessage: "La tua registrazione è stata inviata agli organizzatori del trek per l'approvazione. Una volta approvata, riceverai un'email con tutti i dettagli e le informazioni richieste.",
      confirmation: "Conferma registrazione",
      participants: "Partecipanti",
      selectedDays: "Giorni selezionati",
      totalPaid: "Totale pagato",
      groupFree: "Registrazione di gruppo - gratuita",
      nextSteps: "Cosa succede dopo?",
      step1: "Riceverai un'email di conferma con tutti i dettagli",
      step2: "Unisciti al gruppo WhatsApp del trek",
      step3: "Segui gli aggiornamenti nella tua area personale",
      groupStep1: "Gli organizzatori del trek esamineranno la tua richiesta di registrazione",
      groupStep2: "Riceverai un'email dopo l'approvazione della registrazione",
      groupStep3: "Dopo l'approvazione, potrai unirti al gruppo WhatsApp del trek",
      shareWithFriends: "Condividi con gli amici",
      loginToTrack: "Accedi per il monitoraggio",
      redirecting: "Reindirizzamento alla pagina del viaggio in",
      seconds: "secondi",
      loginMessage: "Per monitorare il tuo viaggio e ricevere aggiornamenti, accedi a Groupy Loopy",
      viewTrip: "Visualizza pagina del viaggio",
      readGuide: "Guida alla pianificazione del viaggio"
    }
  };

  const trans = translations[language] || translations.en;

  return (
    <div className="space-y-6">
      {/* Success Card */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
      >
        <Card className="border-4 border-green-400 bg-gradient-to-br from-green-50 to-emerald-50 shadow-2xl">
          <CardContent className="p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <CheckCircle className="w-24 h-24 text-green-600 mx-auto mb-6" />
            </motion.div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3" dir={isRTL ? 'rtl' : 'ltr'}>
              {userType === 'group' ? trans.groupTitle : trans.title}
            </h2>
            <p className="text-xl text-gray-600 mb-6" dir={isRTL ? 'rtl' : 'ltr'}>
              {userType === 'group' ? trans.groupSubtitle : trans.subtitle}
            </p>
            
            {userType === 'group' && (
              <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
                  <p className="text-amber-800 font-bold text-lg">
                    {trans.groupPending}
                  </p>
                </div>
                <p className="text-amber-700 text-sm text-center">
                  {trans.groupPendingMessage}
                </p>
              </div>
            )}
            
            {/* Payment Confirmation */}
            {totalAmount > 0 ? (
              <div className="bg-white rounded-xl p-6 border-2 border-green-200 shadow-lg">
                <div className="text-6xl font-bold text-green-600 mb-2">
                  ₪{totalAmount}
                </div>
                <p className="text-gray-600 font-semibold">
                  {trans.totalPaid}
                </p>
              </div>
            ) : (
              <Badge className="bg-blue-600 text-white text-lg px-6 py-2">
                {trans.groupFree}
              </Badge>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Summary Card */}
      <Card className="shadow-xl">
        <CardContent className="p-6 space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
          <h3 className="text-xl font-bold text-gray-900 mb-4">{trans.confirmation}</h3>
          
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="font-semibold text-blue-900 mb-2">{trans.participants}:</div>
            <div className="space-y-1">
              {participants.map((p, idx) => (
                <div key={idx} className="text-gray-700">
                  • {p.name} {p.age_range && `(${p.age_range})`}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="font-semibold text-purple-900 mb-2">{trans.selectedDays}:</div>
            <div className="flex flex-wrap gap-2">
              {selectedDays.map((day, idx) => (
                <Badge key={idx} variant="outline" className="bg-white border-purple-300">
                  {language === 'he' ? `יום ${day.day_number}` : `Day ${day.day_number}`}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="shadow-xl">
        <CardContent className="p-6" dir={isRTL ? 'rtl' : 'ltr'}>
          <h3 className="text-xl font-bold text-gray-900 mb-4">{trans.nextSteps}</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full ${userType === 'group' ? 'bg-amber-500' : 'bg-emerald-600'} text-white flex items-center justify-center font-bold flex-shrink-0`}>
                1
              </div>
              <p className="text-gray-700 pt-1">{userType === 'group' ? trans.groupStep1 : trans.step1}</p>
            </div>
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full ${userType === 'group' ? 'bg-amber-500' : 'bg-emerald-600'} text-white flex items-center justify-center font-bold flex-shrink-0`}>
                2
              </div>
              <p className="text-gray-700 pt-1">{userType === 'group' ? trans.groupStep2 : trans.step2}</p>
            </div>
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full ${userType === 'group' ? 'bg-amber-500' : 'bg-emerald-600'} text-white flex items-center justify-center font-bold flex-shrink-0`}>
                3
              </div>
              <p className="text-gray-700 pt-1">{userType === 'group' ? trans.groupStep3 : trans.step3}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Login Card */}
      <Card className="shadow-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
        <CardContent className="p-6" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693c3ab4048a1e3a31fffd66/532a53f9c_.png"
                alt="Groupy Loopy"
                className="h-12 w-auto"
              />
              <span className="text-2xl font-bold text-gray-800">Groupy Loopy</span>
            </div>
            
            <p className="text-gray-700 text-lg">
              {trans.loginMessage}
            </p>
            
            <Button
              onClick={() => {
                const tripUrl = `${window.location.origin}${createPageUrl('TripDetails')}?id=${tripId}`;
                base44.auth.redirectToLogin(tripUrl);
              }}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white h-14"
              size="lg"
            >
              <LogIn className="w-5 h-5 mr-2" />
              {trans.loginToTrack}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Button
          onClick={handleShare}
          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white h-14"
        >
          <Share2 className="w-5 h-5 mr-2" />
          {trans.shareWithFriends}
        </Button>
        
        <Button
          onClick={() => navigate(createPageUrl('TripPlanningGuide'))}
          variant="outline"
          className="border-2 border-blue-300 hover:bg-blue-50 h-14"
        >
          <BookOpen className="w-5 h-5 mr-2" />
          {trans.readGuide}
        </Button>
      </div>

      {/* Footer Text */}
      <div className="text-center text-sm text-gray-500 pt-6 border-t border-gray-200">
        <p dir={isRTL ? 'rtl' : 'ltr'}>
          {language === 'he' 
            ? '💙 נתראה במסע! מחכים לכם בדרכים של ישראל'
            : '💙 See you on the trek! We look forward to seeing you on Israel\'s trails'}
        </p>
      </div>
    </div>
  );
}