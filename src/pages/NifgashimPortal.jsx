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
import GroupHealthDeclaration from '../components/nifgashim/portal/GroupHealthDeclaration';
import GroupParticipantCount from '../components/nifgashim/portal/GroupParticipantCount';
import HealthDeclaration from '../components/nifgashim/portal/HealthDeclaration';

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
  const [totalAmount, setTotalAmount] = useState(0);
  const [showThankYou, setShowThankYou] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [groupParticipantCount, setGroupParticipantCount] = useState(0);
  const [groupHealthDeclarationAccepted, setGroupHealthDeclarationAccepted] = useState(false);
  const [individualHealthDeclarationAccepted, setIndividualHealthDeclarationAccepted] = useState(false);

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
      category_id: day.category_id,
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
        groupParticipantCount,
        groupHealthDeclarationAccepted,
        individualHealthDeclarationAccepted,
        timestamp: Date.now()
      };
      localStorage.setItem('nifgashim_registration_state_v2', JSON.stringify(state));
    }
  }, [userType, participants, selectedDays, groupInfo, vehicleInfo, memorialData, currentStep, totalAmount, groupParticipantCount, groupHealthDeclarationAccepted, individualHealthDeclarationAccepted]);

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
            setGroupInfo(parsed.groupInfo || { name: '', leaderName: '', leaderEmail: '', leaderPhone: '', leaderIdNumber: '' });
            setVehicleInfo(parsed.vehicleInfo || { hasVehicle: false, number: '' });
            setMemorialData(parsed.memorialData || { memorial: null });
            setCurrentStep(parsed.currentStep || 1);
            setTotalAmount(parsed.totalAmount || 0);
            setGroupParticipantCount(parsed.groupParticipantCount || 0);
            setGroupHealthDeclarationAccepted(parsed.groupHealthDeclarationAccepted || false);
            setIndividualHealthDeclarationAccepted(parsed.individualHealthDeclarationAccepted || false);
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
      const registrationId = urlParams.get('registration_id'); 

      if (paymentSuccess === 'true' && !showThankYou) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const savedState = localStorage.getItem('nifgashim_registration_state_v2');
        if (savedState && !registrationId) {
            try {
                toast.info(language === 'he' ? 'מאמת תשלום...' : 'Verifying payment...');
                const processId = urlParams.get('processId') || urlParams.get('process_id') || `DIRECT-${Date.now()}`;
                await completeRegistration(processId);
            } catch (err) {
                console.error('Failed to complete registration after payment:', err);
            }
        } else if (registrationId) {
             toast.success(language === 'he' ? 'התשלום בוצע בהצלחה!' : 'Payment successful!');
             setShowThankYou(true);
        }

        const url = new URL(window.location);
        url.searchParams.delete('payment_success');
        url.searchParams.delete('registration_id');
        url.searchParams.delete('sum');
        url.searchParams.delete('processId');
        url.searchParams.delete('process_id');
        window.history.replaceState({}, '', url);

        localStorage.removeItem('nifgashim_registration_state');
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
      stepHealth: "הצהרת בריאות",
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
      stepHealth: "Health Declaration",
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
      stepHealth: "Медицинское заявление",
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
      stepHealth: "Declaración de Salud",
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
      stepHealth: "Déclaration de Santé",
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
      stepHealth: "Gesundheitserklärung",
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
      stepHealth: "Dichiarazione di Salute",
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

  const steps = userType === 'group' 
    ? [
        { id: 1, label: trans.stepUserType },
        { id: 2, label: trans.stepParticipants },
        { id: 3, label: language === 'he' ? 'הצהרות' : 'Declarations' },
        { id: 4, label: trans.stepHealth },
        { id: 5, label: trans.stepDays },
        { id: 6, label: trans.stepMemorial },
        { id: 7, label: trans.stepSummary }
      ]
    : [
        { id: 1, label: trans.stepUserType },
        { id: 2, label: trans.stepParticipants },
        { id: 3, label: trans.stepHealth },
        { id: 4, label: trans.stepDays },
        { id: 5, label: trans.stepMemorial },
        { id: 6, label: trans.stepSummary },
        { id: 7, label: trans.payment }
      ];

  const calculateTotalAmount = () => {
    // Groups are free - no payment required
    if (userType === 'group') {
      return 0;
    }

    // Count adults (age 10+) for individuals
    const adultsCount = participants.filter(p => {
      if (!p.age_range) {
        console.log('Participant without age_range, counting as adult:', p);
        return true;
      }
      
      const ageStr = p.age_range.split('-')[0].trim();
      const age = parseInt(ageStr);
      
      if (isNaN(age)) {
        console.log('Invalid age_range format, counting as adult:', p);
        return true;
      }
      
      const isAdult = age >= 10;
      console.log(`Participant ${p.name}, age_range: ${p.age_range}, parsed age: ${age}, isAdult: ${isAdult}`);
      return isAdult;
    }).length;
    
    const total = adultsCount * 85;
    console.log('=== PAYMENT CALCULATION ===');
    console.log('Total participants:', participants.length);
    console.log('Adult participants (age 10+):', adultsCount);
    console.log('Total amount:', total, 'ILS');
    console.log('Participants data:', participants);
    console.log('========================');
    
    return total;
  };

  const [paymentUrl, setPaymentUrl] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null); // 'grow' or 'paypal'

  const handleSubmit = async () => {
    const amount = calculateTotalAmount();
    console.log('Amount calculated for payment:', amount);
    setTotalAmount(amount);

    if (amount > 0) {
      // Show payment method selection
      setCurrentStep(6);
      return;
    }

    await completeRegistration(null);
  };

  const handleGrowPayment = async () => {
    try {
      setSubmitting(true);
      await completeRegistration('PENDING');
      const pendingRegId = localStorage.getItem('pending_registration_id');

      const response = await base44.functions.invoke('createGrowPaymentEmbed', {
        amount: totalAmount,
        customerEmail: participants[0]?.email || '',
        customerName: participants[0]?.name || '',
        registrationId: pendingRegId
      });

      if (response.data?.success === true && response.data?.authCode) {
        setPaymentUrl(response.data.authCode);
        setPaymentMethod('grow');
      } else {
        const errorMsg = response.data?.error || (language === 'he' ? 'שגיאה ביצירת התשלום' : 'Error creating payment');
        toast.error(errorMsg);
        setSubmitting(false);
      }
    } catch (error) {
      console.error('Grow payment failed:', error);
      toast.error(language === 'he' ? 'שגיאה בתהליך התשלום' : 'Error in payment process');
      setSubmitting(false);
    }
  };

  const handlePayPalPayment = async () => {
    try {
      setSubmitting(true);
      await completeRegistration('PENDING');

      const response = await base44.functions.invoke('paypalPayment', {
        amount: Math.round(totalAmount),
        participantsCount: participants.length,
        userEmail: participants[0]?.email || ''
      });

      const blob = new Blob([response.data], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      window.location.href = url;
    } catch (error) {
      console.error('PayPal payment failed:', error);
      toast.error(language === 'he' ? 'שגיאה בתהליך התשלום' : 'Error in payment process');
      setSubmitting(false);
    }
  };

  const completeRegistration = async (transactionId) => {
    setSubmitting(true);
    try {
      const user = await base44.auth.me().catch(() => null);
      const payerEmail = userType === 'group' ? groupInfo.leaderEmail : (participants[0]?.email || user?.email || '');
      const payerName = userType === 'group' ? groupInfo.leaderName : (participants[0]?.name || '');
      
      // Create registration in NifgashimRegistration entity
      const registrationData = {
        trip_id: nifgashimTrip.id,
        participants: userType === 'group' 
          ? [{ 
              name: groupInfo.leaderName,
              id_number: groupInfo.leaderIdNumber,
              phone: groupInfo.leaderPhone,
              email: groupInfo.leaderEmail,
              age_range: '36-50'
            }]
          : participants.map(p => ({
              name: p.name,
              id_number: p.id_number,
              phone: p.phone,
              email: p.email || payerEmail,
              age_range: p.age_range
            })),
        userType: userType,
        groupInfo: userType === 'group' ? { ...groupInfo, totalParticipants: groupParticipantCount, healthDeclarationAccepted: groupHealthDeclarationAccepted } : null,
        vehicleInfo: vehicleInfo,
        memorialData: memorialData.memorial?.fallen_name ? memorialData : null,
        selectedDays: selectedDays.map(d => ({
          day_number: d.day_number,
          daily_title: d.daily_title,
          date: d.date
        })),
        amount: userType === 'group' ? 0 : totalAmount,
        status: transactionId === 'PENDING' ? 'pending_payment' : 'completed',
        transaction_id: transactionId === 'PENDING' ? null : transactionId,
        customer_email: payerEmail,
        customer_name: payerName
      };

      const createdRegistration = await base44.entities.NifgashimRegistration.create(registrationData);
      console.log('Created NifgashimRegistration:', createdRegistration);

      // Also create Memorial if submitted
      if (memorialData.memorial?.fallen_name) {
        await base44.entities.Memorial.create({
          trip_id: nifgashimTrip.id,
          ...memorialData.memorial,
          status: 'pending'
        });
      }

      // If this is just a pending registration before payment, stop here
      if (transactionId === 'PENDING') {
        // Store the registration ID for later update after payment
        localStorage.setItem('pending_registration_id', createdRegistration.id);
        return true;
      }

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
          console.error('Failed to send confirmation email:', emailError);
        }
      }

      try {
        const adminEmail = nifgashimTrip?.organizer_email;
        if (adminEmail) {
          const body = userType === 'group'
            ? `הרשמה חדשה קבוצה התקבלה.\nמדריך: ${payerName} (${payerEmail})\nתעודת זהות: ${groupInfo.leaderIdNumber}\nכמות משתתפים: ${groupParticipantCount}\nהצהרת בריאות אושרה: כן\nהרשמה חינם`
            : `הרשמה חדשה התקבלה.\nמשתמש: ${payerName} (${payerEmail})\nמשתתפים: ${participants.length}\nסוג: ${userType}\nסכום: ₪${totalAmount}`;
          
          await base44.integrations.Core.SendEmail({
            to: adminEmail,
            subject: `הרשמה חדשה: ${payerName}`,
            body: body
          });
        }
      } catch (adminEmailError) {
        console.error('Failed to send admin email:', adminEmailError);
      }

      toast.success(trans.registrationSuccess);
      
      localStorage.removeItem('nifgashim_registration_state_v2');
      localStorage.removeItem('pending_registration_id');

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

            {currentStep === 3 && userType === 'group' && (
              <div className="space-y-6">
                <GroupParticipantCount
                  totalCount={groupParticipantCount}
                  onCountChange={setGroupParticipantCount}
                />
                <GroupHealthDeclaration
                  accepted={groupHealthDeclarationAccepted}
                  onAccept={setGroupHealthDeclarationAccepted}
                  leaderName={groupInfo.leaderName}
                />
              </div>
            )}

            {currentStep === 3 && userType !== 'group' && (
              <HealthDeclaration
                accepted={individualHealthDeclarationAccepted}
                onAccept={setIndividualHealthDeclarationAccepted}
                language={language}
              />
            )}

            {currentStep === (userType === 'group' ? 5 : 4) && (
              <NifgashimDayCardsSelector
                trekDays={trekDays}
                linkedDaysPairs={linkedDaysPairs}
                selectedDays={selectedDays}
                onDaysChange={setSelectedDays}
                maxDays={nifgashimTrip?.payment_settings?.overall_max_selectable_days || 8}
                trekCategories={nifgashimTrip?.trek_categories || []}
              />
            )}

            {currentStep === (userType === 'group' ? 6 : 5) && (
              <NifgashimMemorialForm
                formData={memorialData}
                setFormData={setMemorialData}
              />
            )}

            {currentStep === (userType === 'group' ? 7 : 6) && (
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

        <div className="flex justify-between items-center mt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(prev => Math.max(prev - 1, 1))}
            disabled={currentStep === 1 || (userType !== 'group' && currentStep === 7) || (userType === 'group' && currentStep === 8) || submitting}
            className="px-6"
          >
            <ArrowLeft className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {trans.back}
          </Button>

          {userType === 'group' ? (
            <>
              {currentStep < 7 ? (
                <Button
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  disabled={
                    (currentStep === 1 && !userType) ||
                    (currentStep === 2 && participants.length === 0) ||
                    (currentStep === 3 && (groupParticipantCount === 0 || !groupHealthDeclarationAccepted)) ||
                    (currentStep === 4 && !groupHealthDeclarationAccepted) ||
                    (currentStep === 5 && selectedDays.length === 0)
                  }
                  className="px-6 bg-blue-600 hover:bg-blue-700"
                >
                  {trans.next}
                  <ArrowRight className={`w-4 h-4 ${isRTL ? 'mr-2' : 'ml-2'}`} />
                </Button>
              ) : currentStep === 7 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-6 bg-green-600 hover:bg-green-700"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      {trans.submitting}
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      {trans.submit}
                    </>
                  )}
                </Button>
              ) : null}
            </>
          ) : (
            <>
              {currentStep < 6 ? (
                <Button
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  disabled={
                    (currentStep === 1 && !userType) ||
                    (currentStep === 2 && participants.length === 0) ||
                    (currentStep === 3 && !individualHealthDeclarationAccepted) ||
                    (currentStep === 4 && selectedDays.length === 0)
                  }
                  className="px-6 bg-blue-600 hover:bg-blue-700"
                >
                  {trans.next}
                  <ArrowRight className={`w-4 h-4 ${isRTL ? 'mr-2' : 'ml-2'}`} />
                </Button>
              ) : currentStep === 6 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
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
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
