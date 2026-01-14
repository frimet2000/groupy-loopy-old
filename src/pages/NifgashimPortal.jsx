// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '../components/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Users, UserCheck, UsersRound, ArrowRight, ArrowLeft, Check, Loader2, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';
import NifgashimUserTypeSelector from '../components/nifgashim/portal/UserTypeSelector';
import NifgashimParticipantForm from '../components/nifgashim/portal/ParticipantForm';
import NifgashimDayCardsSelector from '../components/nifgashim/portal/DayCardsSelector';
import NifgashimMemorialForm from '../components/nifgashim/portal/MemorialForm';
import NifgashimRegistrationSummary from '../components/nifgashim/portal/RegistrationSummary';
import ThankYouView from '../components/nifgashim/portal/ThankYouView';
import AdminDashboard from '../components/nifgashim/portal/AdminDashboard';
import GrowPaymentForm from '../components/nifgashim/portal/GrowPaymentForm';

function MeshulamPaymentForm({ amount, tripId, participants, userType, groupInfo, selectedDays, memorialData, vehicleInfo, onCancel }) {
  const { language } = useLanguage();
  const [processing, setProcessing] = useState(false);

  const parent1 = participants[0];

  const handlePayment = async () => {
    setProcessing(true);
    try {
      const parentName = parent1?.name || groupInfo?.leaderName;
      const parentEmail = parent1?.email || groupInfo?.leaderEmail;
      const parentPhone = parent1?.phone || groupInfo?.leaderPhone;
      
      // Calculate locked amount: 85 ILS per participant (10+)
      const adultsCount = participants.filter(p => {
        if (!p.age_range) return true;
        const age = parseInt(p.age_range.split('-')[0]);
        return age >= 10;
      }).length;
      
      const lockedAmount = adultsCount * 85;

      const response = await base44.functions.invoke('createMeshulamPayment', {
        amount: lockedAmount,
        tripId,
        participants,
        userType,
        groupInfo,
        selectedDays,
        memorialData,
        vehicleInfo,
        customerName: parentName,
        customerEmail: parentEmail,
        customerPhone: parentPhone,
        customerIdNumber: parent1?.id_number,
        description: `תשלום עבור הרשמה למסע נפגשים - ${participants.length} משתתפים`
      });

      console.log('Payment response:', response);

      if (response.data?.success && response.data?.paymentUrl) {
        window.location.href = response.data.paymentUrl;
      } else {
        console.error('Payment error:', response.data);
        toast.error(language === 'he' ? 'שגיאה ביצירת תשלום: ' + (response.data?.error || 'לא ידוע') : 'Payment error: ' + (response.data?.error || 'unknown'));
        setProcessing(false);
      }
    } catch (error) {
      console.error('Payment exception:', error);
      toast.error(language === 'he' ? 'שגיאה בתשלום: ' + error.message : 'Payment error: ' + error.message);
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 bg-blue-50 rounded-xl border-2 border-blue-200">
        <div className="text-center space-y-2">
          <div className="text-4xl font-bold text-blue-900">{amount}₪</div>
          <div className="text-sm text-gray-600">
            {language === 'he' ? 'סכום לתשלום' : 'Amount to pay'}
          </div>
        </div>
      </div>

      <div className="text-sm text-gray-600 space-y-1">
        <p>{language === 'he' ? '• תשלום מאובטח באמצעות משולם' : '• Secure payment via Meshulam'}</p>
        <p>{language === 'he' ? '• אישור יישלח למייל לאחר התשלום' : '• Confirmation sent after payment'}</p>
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={processing}
          className="flex-1"
        >
          {language === 'he' ? 'ביטול' : 'Cancel'}
        </Button>
        <Button
          onClick={handlePayment}
          disabled={processing}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          {processing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {language === 'he' ? 'מעביר לתשלום...' : 'Redirecting...'}
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 mr-2" />
              {language === 'he' ? 'המשך לתשלום' : 'Continue to Payment'}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export default function NifgashimPortal() {
  const { language, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [userType, setUserType] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [selectedDays, setSelectedDays] = useState([]);
  const [groupInfo, setGroupInfo] = useState({ name: '', leaderName: '', leaderEmail: '', leaderPhone: '' });
  const [vehicleInfo, setVehicleInfo] = useState({ hasVehicle: false, number: '' });
  const [memorialData, setMemorialData] = useState({ memorial: null });
  const [submitting, setSubmitting] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [showThankYou, setShowThankYou] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);

  const { data: nifgashimTrip, isLoading, refetch } = useQuery({
    queryKey: ['nifgashimPortalTrip'],
    queryFn: async () => {
      const urlParams = new URLSearchParams(window.location.search);
      let tripId = urlParams.get('id');
      
      if (!tripId) {
         tripId = '6946647d7d7b248feaf1b118';
      }

      try {
        const trips = await base44.entities.Trip.filter({ id: tripId });
        if (!trips || trips.length === 0) {
          console.error('Trip not found:', tripId);
          return null;
        }
        return trips[0];
      } catch (error) {
        console.error('Error fetching trip:', error);
        return null;
      }
    }
  });

  const trekDays = React.useMemo(() => {
    const sourceDays = nifgashimTrip?.days || nifgashimTrip?.trek_days;
    if (!sourceDays) return [];
    
    return sourceDays.map((day, index) => ({
      id: day.id || `day-${index + 1}`,
      date: day.date,
      daily_title: typeof day.daily_title === 'string' ? day.daily_title : (typeof day.title === 'string' ? day.title : ''),
      difficulty: typeof day.difficulty === 'string' ? day.difficulty : 'moderate',
      daily_distance_km: Number(day.daily_distance_km || day.distance_km || 0),
      elevation_gain_m: Number(day.elevation_gain_m || day.elevation_gain || 0),
      day_number: Number(day.day_number || index + 1),
      description: typeof day.daily_description === 'string' ? day.daily_description : (typeof day.description === 'string' ? day.description : (typeof day.content === 'string' ? day.content : '')),
      image: (day.image && typeof day.image === 'object' && day.image.secure_url) ? day.image.secure_url : (typeof day.image === 'string' ? day.image : (typeof day.secure_url === 'string' ? day.secure_url : (typeof day.image_url === 'string' ? day.image_url : null))),
      waypoints: Array.isArray(day.waypoints) ? day.waypoints : []
    })).filter(day => {
      if (!day.date) return true;
      const d = new Date(day.date);
      if (d.getDay() === 6) return false;

      const title = (day.daily_title || '').toLowerCase();
      if (title.includes('rest') || title.includes('מנוחה')) return false;

      return true;
    });
  }, [nifgashimTrip]);

  const linkedDaysPairs = React.useMemo(() => {
    const pairs = nifgashimTrip?.linked_days_pairs || nifgashimTrip?.day_pairs || [];
    
    return pairs.map(pair => {
      if (Array.isArray(pair) && typeof pair[0] === 'number') {
        const id1 = trekDays.find(d => d.day_number === pair[0])?.id;
        const id2 = trekDays.find(d => d.day_number === pair[1])?.id;
        if (id1 && id2) return [id1, id2];
        return null;
      }
      return pair;
    }).filter(Boolean);
  }, [nifgashimTrip, trekDays]);

  React.useEffect(() => {
    const checkAdmin = async () => {
      try {
        const user = await base44.auth.me();
        if (user?.role === 'admin') {
          setIsAdmin(true);
          const urlParams = new URLSearchParams(window.location.search);
          if (urlParams.get('admin') === 'true') {
            setShowAdminDashboard(true);
          }
        }
      } catch (error) {
        setIsAdmin(false);
      }
    };
    checkAdmin();
  }, []);

  useEffect(() => {
    if (userType || participants.length > 0) {
      const state = {
        userType,
        participants,
        selectedDays,
        groupInfo,
        vehicleInfo,
        memorialData,
        currentStep,
        totalAmount,
        timestamp: Date.now()
      };
      localStorage.setItem('nifgashim_registration_state_v2', JSON.stringify(state));
    }
  }, [userType, participants, selectedDays, groupInfo, vehicleInfo, memorialData, currentStep, totalAmount]);

  useEffect(() => {
    const savedState = localStorage.getItem('nifgashim_registration_state_v2');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
          if (!userType && parsed.userType) {
            setUserType(parsed.userType);
            setParticipants(parsed.participants || []);
            setSelectedDays(parsed.selectedDays || []);
            setGroupInfo(parsed.groupInfo || { name: '', leaderName: '', leaderEmail: '', leaderPhone: '' });
            setVehicleInfo(parsed.vehicleInfo || { hasVehicle: false, number: '' });
            setMemorialData(parsed.memorialData || { memorial: null });
            setCurrentStep(parsed.currentStep || 1);
            setTotalAmount(parsed.totalAmount || 0);
          }
        } else {
          localStorage.removeItem('nifgashim_registration_state');
        }
      } catch (e) {
        console.error('Failed to load state', e);
      }
    }
  }, []);

  useEffect(() => {
    const checkPaymentSuccess = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const paymentSuccess = urlParams.get('payment_success');
      // registration_id might not be present if we used direct link
      const registrationId = urlParams.get('registration_id'); 

      if (paymentSuccess === 'true' && !showThankYou) {
        // Wait a bit to ensure UI is ready
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // If we have state but no registration ID, it means we returned from direct payment
        // We need to complete the registration now
        const savedState = localStorage.getItem('nifgashim_registration_state_v2');
        if (savedState && !registrationId) {
            try {
                toast.info(language === 'he' ? 'מאמת תשלום...' : 'Verifying payment...');
                // We pass a placeholder transaction ID or extract from URL if available
                // Meshulam might pass transaction details in query params
                const processId = urlParams.get('processId') || urlParams.get('process_id') || `DIRECT-${Date.now()}`;
                await completeRegistration(processId);
            } catch (err) {
                console.error('Failed to complete registration after payment:', err);
                // Toast already shown in completeRegistration
            }
        } else if (registrationId) {
             // Existing logic for when we had a registration ID
             toast.success(language === 'he' ? 'התשלום בוצע בהצלחה!' : 'Payment successful!');
             setShowThankYou(true);
        }

        // Clean up URL
        const url = new URL(window.location);
        url.searchParams.delete('payment_success');
        url.searchParams.delete('registration_id');
        url.searchParams.delete('sum'); // Clean up Meshulam params if any
        url.searchParams.delete('processId');
        url.searchParams.delete('process_id');
        window.history.replaceState({}, '', url);

        localStorage.removeItem('nifgashim_registration_state'); // Old key
      }
    };

    checkPaymentSuccess();
  }, [language, showThankYou]);

  const translations = {
    he: {
      title: "הרשמה למסע נפגשים בשביל ישראל",
      subtitle: "תהליך הרשמה פשוט ומהיר",
      stepUserType: "סוג רישום",
      stepParticipants: "פרטי משתתפים",
      stepDays: "בחירת ימים",
      stepMemorial: "הנצחה",
      stepSummary: "סיכום",
      next: "הבא",
      back: "אחורה",
      submit: "שלח הרשמה",
      submitting: "שולח...",
      payment: "תשלום",
      proceedToPayment: "המשך לתשלום",
      registrationSuccess: "ההרשמה נשלחה בהצלחה!",
      redirecting: "מעביר לדף הבית..."
    },
    en: {
      title: "Nifgashim for Israel Registration",
      subtitle: "Simple and fast registration process",
      stepUserType: "Registration Type",
      stepParticipants: "Participant Details",
      stepDays: "Select Days",
      stepMemorial: "Memorial",
      stepSummary: "Summary",
      next: "Next",
      back: "Back",
      submit: "Submit Registration",
      submitting: "Submitting...",
      payment: "Payment",
      proceedToPayment: "Proceed to Payment",
      registrationSuccess: "Registration submitted successfully!",
      redirecting: "Redirecting to home..."
    },
    ru: {
      title: "Регистрация Nifgashim для Израиля",
      subtitle: "Простой и быстрый процесс регистрации",
      stepUserType: "Тип регистрации",
      stepParticipants: "Данные участников",
      stepDays: "Выбор дней",
      stepMemorial: "Мемориал",
      stepSummary: "Резюме",
      next: "Далее",
      back: "Назад",
      submit: "Отправить регистрацию",
      submitting: "Отправка...",
      payment: "Оплата",
      proceedToPayment: "Перейти к оплате",
      registrationSuccess: "Регистрация успешна!",
      redirecting: "Перенаправление..."
    },
    es: {
      title: "Registro Nifgashim para Israel",
      subtitle: "Proceso de registro simple y rápido",
      stepUserType: "Tipo de registro",
      stepParticipants: "Detalles de participantes",
      stepDays: "Seleccionar días",
      stepMemorial: "Memorial",
      stepSummary: "Resumen",
      next: "Siguiente",
      back: "Atrás",
      submit: "Enviar registro",
      submitting: "Enviando...",
      payment: "Pago",
      proceedToPayment: "Proceder al pago",
      registrationSuccess: "¡Registro exitoso!",
      redirecting: "Redirigiendo..."
    },
    fr: {
      title: "Inscription Nifgashim pour Israël",
      subtitle: "Processus d'inscription simple et rapide",
      stepUserType: "Type d'inscription",
      stepParticipants: "Détails des participants",
      stepDays: "Sélectionner les jours",
      stepMemorial: "Mémorial",
      stepSummary: "Résumé",
      next: "Suivant",
      back: "Retour",
      submit: "Soumettre l'inscription",
      submitting: "Envoi...",
      payment: "Paiement",
      proceedToPayment: "Procéder au paiement",
      registrationSuccess: "Inscription réussie!",
      redirecting: "Redirection..."
    },
    de: {
      title: "Nifgashim für Israel Registrierung",
      subtitle: "Einfacher und schneller Registrierungsprozess",
      stepUserType: "Registrierungstyp",
      stepParticipants: "Teilnehmerdetails",
      stepDays: "Tage auswählen",
      stepMemorial: "Gedenkstätte",
      stepSummary: "Zusammenfassung",
      next: "Weiter",
      back: "Zurück",
      submit: "Registrierung absenden",
      submitting: "Wird gesendet...",
      payment: "Zahlung",
      proceedToPayment: "Zur Zahlung",
      registrationSuccess: "Registrierung erfolgreich!",
      redirecting: "Umleitung..."
    },
    it: {
      title: "Registrazione Nifgashim per Israele",
      subtitle: "Processo di registrazione semplice e veloce",
      stepUserType: "Tipo di registrazione",
      stepParticipants: "Dettagli partecipanti",
      stepDays: "Seleziona giorni",
      stepMemorial: "Memoriale",
      stepSummary: "Riepilogo",
      next: "Avanti",
      back: "Indietro",
      submit: "Invia registrazione",
      submitting: "Invio...",
      payment: "Pagamento",
      proceedToPayment: "Procedi al pagamento",
      registrationSuccess: "Registrazione riuscita!",
      redirecting: "Reindirizzamento..."
    }
  };

  const trans = translations[language] || translations.en;

  const steps = [
    { id: 1, label: trans.stepUserType },
    { id: 2, label: trans.stepParticipants },
    { id: 3, label: trans.stepDays },
    { id: 4, label: trans.stepMemorial },
    { id: 5, label: trans.stepSummary }
  ];

  const calculateTotalAmount = () => {
    const adultsCount = participants.filter(p => {
      if (!p.age_range) return true;
      const age = parseInt(p.age_range.split('-')[0]);
      return age >= 10;
    }).length;
    return adultsCount * 85;
  };

  const handleSubmit = async () => {
    const amount = calculateTotalAmount();
    setTotalAmount(amount);

    if (amount > 0) {
      toast.info(language === 'he' ? 'מעביר לתשלום...' : 'Redirecting to payment...');
      
      // Save state before redirecting so we can recover it on return
      const state = {
        userType,
        participants,
        selectedDays,
        groupInfo,
        vehicleInfo,
        memorialData,
        currentStep,
        totalAmount: amount,
        timestamp: Date.now()
      };
      localStorage.setItem('nifgashim_registration_state_v2', JSON.stringify(state));

      // Direct redirect to Meshulam
      setTimeout(() => {
        window.location.href = `https://meshulam.co.il/purchase/30f1b9975952?sum=${amount}`;
      }, 1000);
      return;
    }

    await completeRegistration(null);
  };

  const completeRegistration = async (transactionId) => {
    setSubmitting(true);
    try {
      const user = await base44.auth.me().catch(() => null);
      
      const participantsData = participants.map(p => ({
        email: p.email || (user?.email || `temp-${Date.now()}@nifgashim.temp`),
        name: p.name,
        id_number: p.id_number,
        phone: p.phone,
        joined_at: new Date().toISOString(),
        selected_days: selectedDays.map(d => d.day_number),
        waiver_accepted: true,
        waiver_timestamp: new Date().toISOString(),
        is_organized_group: userType === 'group',
        group_type: userType === 'group' ? 'other' : null,
        group_name: userType === 'group' ? groupInfo.name : null,
        vehicle_number: vehicleInfo.hasVehicle ? vehicleInfo.number : null,
        has_vehicle: vehicleInfo.hasVehicle,
        payment_status: transactionId ? 'completed' : 'exempt',
        payment_amount: 0,
        payment_transaction_id: transactionId
      }));

      const currentParticipants = nifgashimTrip?.participants || [];
      await base44.entities.Trip.update(nifgashimTrip.id, {
        participants: [...currentParticipants, ...participantsData]
      });

      if (memorialData.memorial?.fallen_name) {
        await base44.entities.Memorial.create({
          trip_id: nifgashimTrip.id,
          ...memorialData.memorial,
          status: 'pending'
        });
      }

      const payerEmail = userType === 'group' ? groupInfo.leaderEmail : (participants[0]?.email || '');
      const payerName = userType === 'group' ? groupInfo.leaderName : (participants[0]?.name || '');

      if (payerEmail) {
        try {
          await base44.integrations.Core.SendEmail({
            to: payerEmail,
            subject: language === 'he' ? 'אישור הרשמה - נפגשים בשביל ישראל' : 'Registration Confirmation - Nifgashim',
            body: language === 'he' 
              ? `שלום ${payerName},\n\nתודה שנרשמת למסע נפגשים בשביל ישראל!\n\nפרטי ההרשמה נקלטו במערכת.\nמספר משתתפים: ${participants.length}\n\nנתראה במסע!\nצוות נפגשים`
              : `Hello ${payerName},\n\nThank you for registering for Nifgashim Bishvil Israel!\n\nYour registration details have been received.\nParticipants: ${participants.length}\n\nSee you on the trek!\nNifgashim Team`
          });
        } catch (emailError) {
          console.error('Failed to send confirmation email for exempt registration:', emailError);
        }
      }

      try {
        const adminEmail = nifgashimTrip?.organizer_email;
        if (adminEmail) {
             await base44.integrations.Core.SendEmail({
              to: adminEmail,
              subject: `New Exempt Registration: ${payerName}`,
              body: `New exempt registration received.\nUser: ${payerName} (${payerEmail})\nParticipants: ${participants.length}\nType: ${userType}`
            });
        }
      } catch (adminEmailError) {
        console.error('Failed to send admin email for exempt registration:', adminEmailError);
      }

      toast.success(trans.registrationSuccess);
      
      localStorage.removeItem('nifgashim_registration_state_v2');

      setShowThankYou(true);
      return true;
    } catch (error) {
      console.error(error);
      toast.error(language === 'he' ? 'שגיאה בשליחת ההרשמה' : 'Error submitting registration');
      setSubmitting(false);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  const progressPercent = (currentStep / steps.length) * 100;

  if (showAdminDashboard && isAdmin) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8 px-4 ${isRTL ? 'rtl' : 'ltr'}`}>
        <div className="max-w-7xl mx-auto">
          <AdminDashboard
            trip={nifgashimTrip}
            language={language}
            isRTL={isRTL}
          />
        </div>
      </div>
    );
  }

  if (showThankYou) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-8 px-4 ${isRTL ? 'rtl' : 'ltr'}`}>
        <div className="max-w-4xl mx-auto">
          <ThankYouView
            participants={participants}
            selectedDays={selectedDays}
            totalAmount={totalAmount}
            userType={userType}
            language={language}
            isRTL={isRTL}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 py-8 px-4 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{trans.title}</h1>
          <p className="text-gray-600">{trans.subtitle}</p>
        </motion.div>

        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              {steps.map((step, idx) => (
                <div key={step.id} className="contents">
                  <div className={`flex flex-col items-center gap-1 ${currentStep >= step.id ? 'opacity-100' : 'opacity-40'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      currentStep > step.id 
                        ? 'bg-green-500 text-white' 
                        : currentStep === step.id 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
                    </div>
                    <span className="text-xs font-semibold text-center hidden sm:block">
                      {step.label}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 rounded-full ${
                      currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <Progress value={progressPercent} className="h-2" />
          </CardContent>
        </Card>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === 1 && (
              <NifgashimUserTypeSelector
                selectedType={userType}
                onSelect={setUserType}
              />
            )}

            {currentStep === 2 && (
              <NifgashimParticipantForm
                userType={userType}
                participants={participants}
                setParticipants={setParticipants}
                groupInfo={groupInfo}
                setGroupInfo={setGroupInfo}
                vehicleInfo={vehicleInfo}
                setVehicleInfo={setVehicleInfo}
              />
            )}

            {currentStep === 3 && (
              <NifgashimDayCardsSelector
                trekDays={trekDays}
                linkedDaysPairs={linkedDaysPairs}
                selectedDays={selectedDays}
                onDaysChange={setSelectedDays}
                maxDays={nifgashimTrip?.payment_settings?.overall_max_selectable_days || 8}
              />
            )}

            {currentStep === 4 && (
              <NifgashimMemorialForm
                formData={memorialData}
                setFormData={setMemorialData}
              />
            )}

            {currentStep === 5 && (
              <NifgashimRegistrationSummary
                userType={userType}
                participants={participants}
                selectedDays={selectedDays}
                trekDays={trekDays}
                groupInfo={groupInfo}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {showPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPayment(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl p-6 max-w-md w-full"
            >
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <CreditCard className="w-6 h-6" />
                {trans.payment}
              </h2>
              <GrowPaymentForm
                amount={totalAmount}
                customerName={userType === 'group' ? groupInfo.leaderName : participants[0]?.name}
                customerEmail={userType === 'group' ? groupInfo.leaderEmail : participants[0]?.email}
                customerPhone={userType === 'group' ? groupInfo.leaderPhone : participants[0]?.phone}
                registrationData={{
                  tripId: nifgashimTrip?.id,
                  participants,
                  userType,
                  groupInfo,
                  selectedDays,
                  memorialData,
                  vehicleInfo
                }}
                onSuccess={({ registrationId, transactionId }) => {
                  setShowPayment(false);
                  setShowThankYou(true);
                  localStorage.removeItem('nifgashim_registration_state');
                }}
              />
            </motion.div>
          </motion.div>
        )}

        <div className="flex justify-between gap-4 mt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(prev => Math.max(prev - 1, 1))}
            disabled={currentStep === 1 || submitting || showPayment}
            className="px-6"
          >
            <ArrowLeft className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {trans.back}
          </Button>

          {currentStep < steps.length ? (
            <Button
              onClick={() => setCurrentStep(prev => prev + 1)}
              disabled={
                (currentStep === 1 && !userType) ||
                (currentStep === 2 && participants.length === 0) ||
                (currentStep === 3 && selectedDays.length === 0)
              }
              className="px-6 bg-blue-600 hover:bg-blue-700"
            >
              {trans.next}
              <ArrowRight className={`w-4 h-4 ${isRTL ? 'mr-2' : 'ml-2'}`} />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={submitting || showPayment}
              className="px-6 bg-green-600 hover:bg-green-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  {trans.submitting}
                </>
              ) : (
                <>
                  {calculateTotalAmount() > 0 ? (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      {trans.proceedToPayment}
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      {trans.submit}
                    </>
                  )}
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}