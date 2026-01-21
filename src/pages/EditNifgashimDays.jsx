// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '../components/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Mail, 
  CreditCard,
  ArrowLeft,
  ArrowRight,
  Mountain,
  Send
} from 'lucide-react';
import NifgashimDayCardsSelector from '../components/nifgashim/portal/DayCardsSelector';

export default function EditNifgashimDays() {
  const { language, isRTL } = useLanguage();
  const [mode, setMode] = useState('loading'); // loading, verify, edit, success, error, resend
  const [registration, setRegistration] = useState(null);
  const [trip, setTrip] = useState(null);
  const [selectedDays, setSelectedDays] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [additionalPayment, setAdditionalPayment] = useState(null);
  
  // For resend mode
  const [resendEmail, setResendEmail] = useState('');
  const [resendIdNumber, setResendIdNumber] = useState('');
  const [isResending, setIsResending] = useState(false);

  const translations = {
    he: {
      title: 'עריכת ימי מסע',
      subtitle: 'שנה את ימי המסע שבחרת',
      loading: 'טוען נתונים...',
      invalidLink: 'קישור לא תקין',
      invalidLinkDesc: 'הקישור שהשתמשת בו אינו תקף או פג תוקפו.',
      currentDays: 'הימים הנוכחיים שנבחרו',
      selectNewDays: 'בחר ימים חדשים',
      saveChanges: 'שמור שינויים',
      saving: 'שומר...',
      success: 'השינויים נשמרו בהצלחה!',
      successDesc: 'אימייל אישור נשלח אליך.',
      additionalPaymentRequired: 'נדרש תשלום נוסף',
      additionalPaymentDesc: 'הימים החדשים שבחרת דורשים תשלום נוסף של',
      contactSupport: 'צור קשר עם התמיכה להשלמת התשלום',
      resendLink: 'שלח קישור עריכה מחדש',
      resendTitle: 'קבל קישור לעריכת ימים',
      resendDesc: 'הזן את המייל שנרשמת איתו ונשלח לך קישור חדש',
      email: 'כתובת מייל',
      idNumber: 'תעודת זהות (אופציונלי)',
      sendLink: 'שלח קישור',
      sending: 'שולח...',
      linkSent: 'קישור נשלח!',
      linkSentDesc: 'אם קיימת הרשמה עם המייל שהזנת, נשלח אליך קישור לעריכה.',
      backToEdit: 'חזרה לעריכה',
      noChanges: 'לא בוצעו שינויים',
      noChangesDesc: 'הימים שבחרת זהים לימים הקיימים.'
    },
    en: {
      title: 'Edit Trek Days',
      subtitle: 'Change your selected trek days',
      loading: 'Loading...',
      invalidLink: 'Invalid Link',
      invalidLinkDesc: 'The link you used is invalid or has expired.',
      currentDays: 'Currently Selected Days',
      selectNewDays: 'Select New Days',
      saveChanges: 'Save Changes',
      saving: 'Saving...',
      success: 'Changes saved successfully!',
      successDesc: 'A confirmation email has been sent to you.',
      additionalPaymentRequired: 'Additional Payment Required',
      additionalPaymentDesc: 'The new days you selected require an additional payment of',
      contactSupport: 'Contact support to complete the payment',
      resendLink: 'Resend Edit Link',
      resendTitle: 'Get Edit Link',
      resendDesc: 'Enter your registration email to receive a new edit link',
      email: 'Email Address',
      idNumber: 'ID Number (optional)',
      sendLink: 'Send Link',
      sending: 'Sending...',
      linkSent: 'Link Sent!',
      linkSentDesc: 'If a registration exists with that email, an edit link has been sent.',
      backToEdit: 'Back to Edit',
      noChanges: 'No Changes Made',
      noChangesDesc: 'The selected days are the same as your current selection.'
    },
    ru: {
      title: 'Редактировать дни похода',
      subtitle: 'Измените выбранные дни похода',
      loading: 'Загрузка...',
      invalidLink: 'Недействительная ссылка',
      invalidLinkDesc: 'Ссылка недействительна или истек срок ее действия.',
      currentDays: 'Текущие выбранные дни',
      selectNewDays: 'Выберите новые дни',
      saveChanges: 'Сохранить изменения',
      saving: 'Сохранение...',
      success: 'Изменения сохранены!',
      successDesc: 'Письмо с подтверждением отправлено.',
      additionalPaymentRequired: 'Требуется дополнительная оплата',
      additionalPaymentDesc: 'Новые дни требуют дополнительную оплату',
      contactSupport: 'Свяжитесь с поддержкой для оплаты',
      resendLink: 'Отправить ссылку повторно',
      resendTitle: 'Получить ссылку',
      resendDesc: 'Введите email регистрации',
      email: 'Email',
      idNumber: 'ID (необязательно)',
      sendLink: 'Отправить',
      sending: 'Отправка...',
      linkSent: 'Ссылка отправлена!',
      linkSentDesc: 'Если регистрация существует, ссылка отправлена.',
      backToEdit: 'Назад',
      noChanges: 'Без изменений',
      noChangesDesc: 'Выбранные дни совпадают с текущими.'
    },
    es: {
      title: 'Editar Días del Trek',
      subtitle: 'Cambia tus días seleccionados',
      loading: 'Cargando...',
      invalidLink: 'Enlace Inválido',
      invalidLinkDesc: 'El enlace es inválido o ha expirado.',
      currentDays: 'Días Actualmente Seleccionados',
      selectNewDays: 'Seleccionar Nuevos Días',
      saveChanges: 'Guardar Cambios',
      saving: 'Guardando...',
      success: '¡Cambios guardados!',
      successDesc: 'Se ha enviado un correo de confirmación.',
      additionalPaymentRequired: 'Pago Adicional Requerido',
      additionalPaymentDesc: 'Los nuevos días requieren un pago adicional de',
      contactSupport: 'Contacta soporte para completar el pago',
      resendLink: 'Reenviar Enlace',
      resendTitle: 'Obtener Enlace',
      resendDesc: 'Ingresa tu email de registro',
      email: 'Email',
      idNumber: 'ID (opcional)',
      sendLink: 'Enviar',
      sending: 'Enviando...',
      linkSent: '¡Enlace Enviado!',
      linkSentDesc: 'Si existe un registro, se envió el enlace.',
      backToEdit: 'Volver',
      noChanges: 'Sin Cambios',
      noChangesDesc: 'Los días seleccionados son iguales.'
    },
    fr: {
      title: 'Modifier les Jours',
      subtitle: 'Changez vos jours sélectionnés',
      loading: 'Chargement...',
      invalidLink: 'Lien Invalide',
      invalidLinkDesc: 'Le lien est invalide ou a expiré.',
      currentDays: 'Jours Actuellement Sélectionnés',
      selectNewDays: 'Sélectionner de Nouveaux Jours',
      saveChanges: 'Enregistrer',
      saving: 'Enregistrement...',
      success: 'Modifications enregistrées!',
      successDesc: 'Un email de confirmation a été envoyé.',
      additionalPaymentRequired: 'Paiement Supplémentaire Requis',
      additionalPaymentDesc: 'Les nouveaux jours nécessitent un paiement de',
      contactSupport: 'Contactez le support pour payer',
      resendLink: 'Renvoyer le Lien',
      resendTitle: 'Obtenir le Lien',
      resendDesc: 'Entrez votre email d\'inscription',
      email: 'Email',
      idNumber: 'ID (optionnel)',
      sendLink: 'Envoyer',
      sending: 'Envoi...',
      linkSent: 'Lien Envoyé!',
      linkSentDesc: 'Si une inscription existe, le lien a été envoyé.',
      backToEdit: 'Retour',
      noChanges: 'Pas de Changements',
      noChangesDesc: 'Les jours sélectionnés sont identiques.'
    },
    de: {
      title: 'Trek-Tage Bearbeiten',
      subtitle: 'Ändere deine ausgewählten Tage',
      loading: 'Laden...',
      invalidLink: 'Ungültiger Link',
      invalidLinkDesc: 'Der Link ist ungültig oder abgelaufen.',
      currentDays: 'Aktuell Ausgewählte Tage',
      selectNewDays: 'Neue Tage Auswählen',
      saveChanges: 'Speichern',
      saving: 'Speichern...',
      success: 'Änderungen gespeichert!',
      successDesc: 'Eine Bestätigungs-E-Mail wurde gesendet.',
      additionalPaymentRequired: 'Zusätzliche Zahlung Erforderlich',
      additionalPaymentDesc: 'Die neuen Tage erfordern eine Zahlung von',
      contactSupport: 'Kontaktiere den Support für die Zahlung',
      resendLink: 'Link Erneut Senden',
      resendTitle: 'Link Erhalten',
      resendDesc: 'Gib deine Registrierungs-E-Mail ein',
      email: 'E-Mail',
      idNumber: 'ID (optional)',
      sendLink: 'Senden',
      sending: 'Senden...',
      linkSent: 'Link Gesendet!',
      linkSentDesc: 'Wenn eine Registrierung existiert, wurde der Link gesendet.',
      backToEdit: 'Zurück',
      noChanges: 'Keine Änderungen',
      noChangesDesc: 'Die ausgewählten Tage sind identisch.'
    },
    it: {
      title: 'Modifica Giorni Trek',
      subtitle: 'Cambia i giorni selezionati',
      loading: 'Caricamento...',
      invalidLink: 'Link Non Valido',
      invalidLinkDesc: 'Il link non è valido o è scaduto.',
      currentDays: 'Giorni Attualmente Selezionati',
      selectNewDays: 'Seleziona Nuovi Giorni',
      saveChanges: 'Salva',
      saving: 'Salvataggio...',
      success: 'Modifiche salvate!',
      successDesc: 'Email di conferma inviata.',
      additionalPaymentRequired: 'Pagamento Aggiuntivo Richiesto',
      additionalPaymentDesc: 'I nuovi giorni richiedono un pagamento di',
      contactSupport: 'Contatta il supporto per pagare',
      resendLink: 'Reinvia Link',
      resendTitle: 'Ottieni Link',
      resendDesc: 'Inserisci la tua email di registrazione',
      email: 'Email',
      idNumber: 'ID (opzionale)',
      sendLink: 'Invia',
      sending: 'Invio...',
      linkSent: 'Link Inviato!',
      linkSentDesc: 'Se esiste una registrazione, il link è stato inviato.',
      backToEdit: 'Indietro',
      noChanges: 'Nessuna Modifica',
      noChangesDesc: 'I giorni selezionati sono identici.'
    }
  };

  const t = translations[language] || translations.en;

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const regId = urlParams.get('regId');
    const token = urlParams.get('token');

    if (!regId || !token) {
      setMode('resend');
      return;
    }

    verifyToken(regId, token);
  }, []);

  const verifyToken = async (regId, token) => {
    try {
      const response = await base44.functions.invoke('verifyNifgashimEditToken', {
        registrationId: regId,
        token: token
      });

      if (response.data.success) {
        setRegistration(response.data.registration);
        setTrip(response.data.trip);
        
        // Initialize selected days from registration
        // Map registration's selected day numbers to full trek day objects
        const trekDays = response.data.trip?.trek_days || [];
        const registrationSelectedDayNumbers = response.data.registration.selected_days || [];
        
        // Also check selectedDays array for full objects
        const registrationSelectedDays = response.data.registration.selectedDays || [];
        
        let initialSelectedDays = [];
        
        if (registrationSelectedDays.length > 0 && typeof registrationSelectedDays[0] === 'object') {
          // selectedDays contains full day objects - use them but ensure they match trek_days
          initialSelectedDays = registrationSelectedDays.map(regDay => {
            // Find matching trek day by day_number
            const matchingTrekDay = trekDays.find(td => td.day_number === regDay.day_number);
            return matchingTrekDay || regDay;
          });
        } else if (registrationSelectedDayNumbers.length > 0) {
          // selected_days contains day numbers - map to full objects
          initialSelectedDays = registrationSelectedDayNumbers
            .map(dayNum => trekDays.find(td => td.day_number === dayNum))
            .filter(Boolean);
        }
        
        setSelectedDays(initialSelectedDays);
        
        setMode('edit');
      } else {
        setError(response.data.error);
        setMode('error');
      }
    } catch (err) {
      console.error('Error verifying token:', err);
      setError(err.message);
      setMode('error');
    }
  };

  const handleSaveChanges = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const regId = urlParams.get('regId');
    const token = urlParams.get('token');

    // Check if days actually changed
    const currentDayNumbers = (registration.selected_days || []).sort().join(',');
    const newDayNumbers = selectedDays.map(d => d.day_number).sort().join(',');
    
    if (currentDayNumbers === newDayNumbers) {
      toast.info(t.noChanges);
      return;
    }

    setIsSubmitting(true);
    setAdditionalPayment(null);

    try {
      const response = await base44.functions.invoke('updateNifgashimDays', {
        registrationId: regId,
        token: token,
        newSelectedDays: selectedDays,
        language: language
      });

      if (response.data.success) {
        setMode('success');
        toast.success(t.success);
      } else if (response.data.requiresAdditionalPayment) {
        setAdditionalPayment(response.data);
      } else {
        toast.error(response.data.error || 'Error updating days');
      }
    } catch (err) {
      console.error('Error saving changes:', err);
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendLink = async () => {
    if (!resendEmail) {
      toast.error(language === 'he' ? 'נא להזין כתובת מייל' : 'Please enter an email address');
      return;
    }

    setIsResending(true);

    try {
      await base44.functions.invoke('resendNifgashimEditLink', {
        email: resendEmail,
        idNumber: resendIdNumber || undefined,
        language: language
      });

      toast.success(t.linkSent);
      setMode('linkSent');
    } catch (err) {
      console.error('Error resending link:', err);
      toast.error(err.message);
    } finally {
      setIsResending(false);
    }
  };

  // Loading state
  if (mode === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">{t.loading}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (mode === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">{t.invalidLink}</h2>
            <p className="text-gray-600 mb-6">{t.invalidLinkDesc}</p>
            <Button onClick={() => setMode('resend')} className="gap-2">
              <Mail className="w-4 h-4" />
              {t.resendLink}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Resend link mode
  if (mode === 'resend') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-xl">{t.resendTitle}</CardTitle>
            <p className="text-gray-600 text-sm mt-2">{t.resendDesc}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>{t.email}</Label>
              <Input
                type="email"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                placeholder="email@example.com"
                dir="ltr"
              />
            </div>
            <div>
              <Label>{t.idNumber}</Label>
              <Input
                type="text"
                value={resendIdNumber}
                onChange={(e) => setResendIdNumber(e.target.value)}
                placeholder="123456789"
                dir="ltr"
              />
            </div>
            <Button 
              onClick={handleResendLink} 
              className="w-full gap-2"
              disabled={isResending}
            >
              {isResending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t.sending}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  {t.sendLink}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Link sent confirmation
  if (mode === 'linkSent') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">{t.linkSent}</h2>
            <p className="text-gray-600">{t.linkSentDesc}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (mode === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
              >
                <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-4" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.success}</h2>
              <p className="text-gray-600">{t.successDesc}</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Edit mode
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{t.title}</h1>
          <p className="text-gray-600 mt-2">{t.subtitle}</p>
          {registration?.customer_name && (
            <p className="text-blue-600 font-medium mt-1">{registration.customer_name}</p>
          )}
        </div>

        {/* Additional Payment Warning */}
        <AnimatePresence>
          {additionalPayment && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <CreditCard className="w-8 h-8 text-amber-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-amber-800">{t.additionalPaymentRequired}</h3>
                      <p className="text-amber-700 mt-1">
                        {t.additionalPaymentDesc} <span className="font-bold">{additionalPayment.additionalPaymentNeeded}₪</span>
                      </p>
                      <p className="text-amber-600 text-sm mt-2">{t.contactSupport}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Day Selector */}
        {trip && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mountain className="w-5 h-5 text-blue-600" />
                {t.selectNewDays}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <NifgashimDayCardsSelector
                trekDays={trip.trek_days || []}
                linkedDaysPairs={trip.linked_days_pairs || []}
                selectedDays={selectedDays}
                onDaysChange={setSelectedDays}
                maxDays={trip.payment_settings?.overall_max_selectable_days || 8}
                trekCategories={trip.trek_categories || []}
              />
            </CardContent>
          </Card>
        )}

        {/* Save Button */}
        <div className="flex justify-center pb-8">
          <Button
            size="lg"
            onClick={handleSaveChanges}
            disabled={isSubmitting || selectedDays.length === 0}
            className="gap-2 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t.saving}
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                {t.saveChanges}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}