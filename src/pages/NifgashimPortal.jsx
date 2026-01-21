// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '../components/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { ArrowRight, ArrowLeft, Check, Loader2, CreditCard, Shield, LogIn, Edit3, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import NifgashimUserTypeSelector from '../components/nifgashim/portal/UserTypeSelector';
import NifgashimParticipantForm from '../components/nifgashim/portal/ParticipantForm';
import NifgashimDayCardsSelector from '../components/nifgashim/portal/DayCardsSelector';
import NifgashimMemorialForm from '../components/nifgashim/portal/MemorialForm';
import NifgashimRegistrationSummary from '../components/nifgashim/portal/RegistrationSummary';
import ThankYouView from '../components/nifgashim/portal/ThankYouView';
import AdminDashboard from '../components/nifgashim/portal/AdminDashboard';
import GroupHealthDeclaration from '../components/nifgashim/portal/GroupHealthDeclaration';
import HealthDeclaration from '../components/nifgashim/portal/HealthDeclaration';
import SafetyInstructions from '../components/nifgashim/portal/SafetyInstructions';

export default function NifgashimPortal() {
  // Force Hebrew for Nifgashim portal regardless of user's language settings
  const language = 'he';
  const isRTL = true;
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
  const [safetyInstructionsAccepted, setSafetyInstructionsAccepted] = useState(false);

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
    const sourceDays = nifgashimTrip?.trek_days || nifgashimTrip?.days;
    if (!sourceDays || sourceDays.length === 0) {
      return [];
    }

    // Debug: log the structure to find where images are
    // console.log('=== Trek Days Structure Debug ===');
    // console.log('First day object:', sourceDays[0]);
    // console.log('Trip photos:', nifgashimTrip?.photos);
    // console.log('Trip image_url:', nifgashimTrip?.image_url);
    // console.log('==================================');

    // Get images from daily_itinerary if available
    const dailyItineraryImages = {};
    if (Array.isArray(nifgashimTrip?.daily_itinerary)) {
      nifgashimTrip.daily_itinerary.forEach(itinerary => {
        if (itinerary.day && itinerary.activities && Array.isArray(itinerary.activities)) {
          const firstImageUrl = itinerary.activities
            .find(activity => activity?.image_url)?.image_url;
          if (firstImageUrl) {
            dailyItineraryImages[itinerary.day] = firstImageUrl;
          }
        }
      });
    }

    // Get images from photos array by matching day number
    const photosByDay = {};
    if (Array.isArray(nifgashimTrip?.photos)) {
      nifgashimTrip.photos.forEach(photo => {
        if (photo.day_number && photo.url) {
          photosByDay[photo.day_number] = photo.url;
        }
      });
    }

    return sourceDays.map((day, index) => {
      const dayNum = Number(day.day_number || index + 1);
      return {
        id: day.id || `day-${dayNum}`,
        date: day.date,
        daily_title: typeof day.daily_title === 'string' ? day.daily_title : (typeof day.title === 'string' ? day.title : ''),
        difficulty: typeof day.difficulty === 'string' ? day.difficulty : 'moderate',
        daily_distance_km: Number(day.daily_distance_km || day.distance_km || 0),
        elevation_gain_m: Number(day.elevation_gain_m || day.elevation_gain || 0),
        day_number: dayNum,
        category_id: day.category_id,
        description: typeof day.daily_description === 'string' ? day.daily_description : (typeof day.description === 'string' ? day.description : (typeof day.content === 'string' ? day.content : '')),
        image_url: day.image_url || day.image || dailyItineraryImages[dayNum] || photosByDay[dayNum] || nifgashimTrip?.image_url || null,
        waypoints: Array.isArray(day.waypoints) ? day.waypoints : []
      };
    }).filter(day => {
      if (!day.date) return true;
      const d = new Date(day.date);
      if (d.getDay() === 6) return false;

      const title = (day.daily_title || '').toLowerCase();
      if (title.includes('rest') || title.includes('מנוחה')) return false;

      return true;
    });
  }, [nifgashimTrip]);

  const linkedDaysPairs = React.useMemo(() => {
    if (Array.isArray(nifgashimTrip?.linked_days_pairs)) {
      return nifgashimTrip.linked_days_pairs;
    }
    if (Array.isArray(nifgashimTrip?.day_pairs)) {
      return nifgashimTrip.day_pairs;
    }
    return [];
  }, [nifgashimTrip]);

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
        safetyInstructionsAccepted,
        timestamp: Date.now()
      };
      localStorage.setItem('nifgashim_registration_state_v2', JSON.stringify(state));
    }
  }, [userType, participants, selectedDays, groupInfo, vehicleInfo, memorialData, currentStep, totalAmount, groupParticipantCount, groupHealthDeclarationAccepted, individualHealthDeclarationAccepted, safetyInstructionsAccepted]);

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
            setSafetyInstructionsAccepted(parsed.safetyInstructionsAccepted || false);
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
      subtitle: "במהלך ההרשמה תתבקשו לאפשר התראות, אנא אפשרו זאת לשם ניהול תקין של המסע מבחינת בטיחות ועדכונים",
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
        { id: 3, label: language === 'he' ? 'בטיחות' : language === 'ru' ? 'Безопасность' : language === 'es' ? 'Seguridad' : language === 'fr' ? 'Sécurité' : language === 'de' ? 'Sicherheit' : language === 'it' ? 'Sicurezza' : 'Safety' },
        { id: 4, label: trans.stepHealth },
        { id: 5, label: trans.stepDays },
        { id: 6, label: trans.stepMemorial },
        { id: 7, label: trans.stepSummary }
      ]
    : [
        { id: 1, label: trans.stepUserType },
        { id: 2, label: trans.stepParticipants },
        { id: 3, label: language === 'he' ? 'בטיחות' : language === 'ru' ? 'Безопасность' : language === 'es' ? 'Seguridad' : language === 'fr' ? 'Sécurité' : language === 'de' ? 'Sicherheit' : language === 'it' ? 'Sicurezza' : 'Safety' },
        { id: 4, label: trans.stepHealth },
        { id: 5, label: trans.stepDays },
        { id: 6, label: trans.stepMemorial },
        { id: 7, label: trans.stepSummary },
        { id: 8, label: trans.payment }
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
    if (selectedDays.length === 0) {
      toast.error(language === 'he' ? 'בחר לפחות יום אחד' : 'Please select at least one day');
      return;
    }

    try {
      const amount = calculateTotalAmount();
      console.log('Amount calculated for payment:', amount);
      setTotalAmount(amount);

      if (amount > 0) {
        console.log('Moving to payment step 8');
        setCurrentStep(8);
        return;
      }

      console.log('Amount is 0, completing registration without payment');
      await completeRegistration(null);
    } catch (error) {
      console.error('handleSubmit error:', error);
      toast.error(language === 'he' ? 'שגיאה בהכנת התשלום' : 'Error preparing payment');
    }
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
      const pendingRegId = localStorage.getItem('pending_registration_id');

      if (!pendingRegId) {
        toast.error(language === 'he' ? 'שגיאה בשמירת ההרשמה' : 'Failed to save registration');
        setSubmitting(false);
        return;
      }

      const user = await base44.auth.me().catch(() => null);
      const payerEmail = participants[0]?.email || user?.email || '';

      // Load PayPal SDK dynamically
      const loadPayPalSDK = async () => {
        if (window.paypal) {
          return window.paypal;
        }

        const clientIdResponse = await base44.functions.invoke('getPayPalClientId');
        const CLIENT_ID = clientIdResponse.data?.clientId;
        
        if (!CLIENT_ID) {
          throw new Error('PayPal not configured');
        }

        return new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = `https://www.paypal.com/sdk/js?client-id=${CLIENT_ID}&currency=ILS&locale=${language}_IL`;
          script.onload = () => resolve(window.paypal);
          script.onerror = () => reject(new Error('Failed to load PayPal SDK'));
          document.head.appendChild(script);
        });
      };

      const paypal = await loadPayPalSDK();

      // Show PayPal button container
      setPaymentMethod('paypal');
      
      // Wait for DOM to update
      await new Promise(resolve => setTimeout(resolve, 100));

      paypal.Buttons({
        createOrder: async () => {
          const response = await base44.functions.invoke('createPayPalOrder', {
            amount: totalAmount,
            participantsCount: participants.length,
            userEmail: payerEmail,
            registrationId: pendingRegId
          });

          if (!response.data?.orderId) {
            throw new Error('Failed to create order');
          }

          return response.data.orderId;
        },
        onApprove: async (data) => {
          const response = await base44.functions.invoke('capturePayPalOrder', {
            orderId: data.orderID,
            registrationId: pendingRegId
          });

          if (response.data?.success) {
            toast.success(language === 'he' ? 'התשלום בוצע בהצלחה!' : 'Payment successful!');
            setShowThankYou(true);
            localStorage.removeItem('nifgashim_registration_state_v2');
            localStorage.removeItem('pending_registration_id');
          } else {
            toast.error(language === 'he' ? 'שגיאה בביצוע התשלום' : 'Payment failed');
          }
          setSubmitting(false);
        },
        onCancel: () => {
          toast.info(language === 'he' ? 'התשלום בוטל' : 'Payment cancelled');
          setSubmitting(false);
        },
        onError: (err) => {
          console.error('PayPal error:', err);
          toast.error(language === 'he' ? 'שגיאה בתהליך התשלום' : 'Payment error');
          setSubmitting(false);
        }
      }).render('#paypal-button-container');

    } catch (error) {
      console.error('PayPal payment failed:', error);
      toast.error(language === 'he' ? 'שגיאה בטעינת PayPal' : 'Failed to load PayPal');
      setSubmitting(false);
    }
  };

  const completeRegistration = async (transactionId) => {
    setSubmitting(true);
    try {
      const user = await base44.auth.me().catch(() => null);
      const payerEmail = userType === 'group' ? groupInfo.leaderEmail : (participants[0]?.email || user?.email || '');
      const payerName = userType === 'group' ? groupInfo.leaderName : (participants[0]?.name || '');
      const year = new Date().getFullYear();

      const selectedDayNumbers = selectedDays.map(d => d.day_number);
      const isOrganizedGroup = userType === 'group';
      const baseAmount = userType === 'group' ? 0 : totalAmount;
      const paymentStatus = baseAmount > 0
        ? (transactionId === 'PENDING' ? 'pending' : (transactionId === 'ADMIN_EXEMPT' ? 'exempt' : 'completed'))
        : 'exempt';
      
      // Create registration in NifgashimRegistration entity
      const registrationData = {
        trip_id: nifgashimTrip.id,
        user_email: payerEmail || null,
        year,
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
        userType,
        groupInfo: isOrganizedGroup
          ? { ...groupInfo, totalParticipants: groupParticipantCount, healthDeclarationAccepted: groupHealthDeclarationAccepted }
          : null,
        vehicleInfo,
        memorialData: memorialData.memorial?.fallen_name ? memorialData : null,
        selectedDays: selectedDays.map(d => ({
          day_number: d.day_number,
          daily_title: d.daily_title,
          date: d.date
        })),
        selected_days: selectedDayNumbers,
        amount: baseAmount,
        total_amount: baseAmount,
        amount_paid: paymentStatus === 'completed' ? baseAmount : 0,
        status: transactionId === 'PENDING' ? 'pending_payment' : 'completed',
        registration_status: 'submitted',
        payment_status: paymentStatus,
        transaction_id: transactionId === 'PENDING' ? null : transactionId,
        customer_email: payerEmail,
        customer_name: payerName,
        emergency_contact_phone: isOrganizedGroup ? groupInfo.leaderPhone : (participants[0]?.phone || null),
        is_organized_group: isOrganizedGroup,
        group_name: isOrganizedGroup ? groupInfo.name || payerName : null,
        group_approval_status: isOrganizedGroup ? 'pending' : null
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

      // Send confirmation emails regardless of payment status
      if (payerEmail) {
        try {
          // Send confirmation email
          await base44.functions.invoke('sendNifgashimConfirmation', {
            registrationId: createdRegistration.id,
            language
          });
        } catch (emailError) {
          console.error('Failed to send confirmation email:', emailError);
        }

        // Send QR code email only if payment is completed or exempt
        if (paymentStatus === 'completed' || paymentStatus === 'exempt') {
          try {
            await base44.functions.invoke('sendQREmailToParticipant', {
              registrationId: createdRegistration.id,
              language
            });
          } catch (qrEmailError) {
            console.error('Failed to send QR email:', qrEmailError);
          }
        }
      }

      // If this is just a pending registration before payment, stop here
      if (transactionId === 'PENDING') {
        // Store the registration ID for later update after payment
        localStorage.setItem('pending_registration_id', createdRegistration.id);
        return true;
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
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">{trans.title}</h1>
          <p className="text-lg sm:text-xl font-semibold text-blue-700 bg-blue-50 border-2 border-blue-200 rounded-xl py-3 px-4">{trans.subtitle}</p>
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
              <div className="space-y-4">
                <NifgashimUserTypeSelector
                  selectedType={userType}
                  onSelect={setUserType}
                />
                
                {/* Edit Days Link for existing registrations */}
                <div className="flex flex-col items-center gap-3 pt-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link to={createPageUrl('EditNifgashimDays')}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 text-purple-600 hover:text-purple-700 border-purple-200 hover:bg-purple-50"
                      >
                        <Edit3 className="w-4 h-4" />
                        {language === 'he' ? 'שינוי ימי מסע' : 
                         language === 'ru' ? 'Изменить дни' : 
                         language === 'es' ? 'Cambiar días' : 
                         language === 'fr' ? 'Modifier les jours' : 
                         language === 'de' ? 'Tage ändern' : 
                         language === 'it' ? 'Cambia giorni' : 
                         'Change days'}
                      </Button>
                    </Link>
                    <Link to={createPageUrl('CancelNifgashimRegistration')}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4" />
                        {language === 'he' ? 'ביטול השתתפות' : 
                         language === 'ru' ? 'Отменить регистрацию' : 
                         language === 'es' ? 'Cancelar registro' : 
                         language === 'fr' ? 'Annuler l\'inscription' : 
                         language === 'de' ? 'Registrierung stornieren' : 
                         language === 'it' ? 'Annulla registrazione' : 
                         'Cancel registration'}
                      </Button>
                    </Link>
                  </div>
                  
                  {/* Admin Login Button */}
                  {!isAdmin && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const currentUrl = window.location.href;
                        base44.auth.redirectToLogin(currentUrl);
                      }}
                      className="gap-2 text-gray-600 hover:text-blue-600 border-gray-300"
                    >
                      <LogIn className="w-4 h-4" />
                      {language === 'he' ? 'התחברות מנהלים' : 
                       language === 'ru' ? 'Вход для админов' : 
                       language === 'es' ? 'Acceso administradores' : 
                       language === 'fr' ? 'Connexion admin' : 
                       language === 'de' ? 'Admin-Login' : 
                       language === 'it' ? 'Login admin' : 
                       'Admin Login'}
                    </Button>
                  )}
                </div>
                
                {/* Show admin badge if logged in as admin */}
                {isAdmin && (
                  <div className="flex justify-center pt-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full text-green-700 text-sm">
                      <Shield className="w-4 h-4" />
                      {language === 'he' ? 'מחובר כמנהל - ניתן לדלג על תשלום' : 
                       language === 'ru' ? 'Вход как админ - Можно пропустить оплату' :
                       language === 'es' ? 'Conectado como admin - Puede saltar el pago' :
                       language === 'fr' ? 'Connecté en tant qu\'admin - Peut passer le paiement' :
                       language === 'de' ? 'Als Admin angemeldet - Kann Zahlung überspringen' :
                       language === 'it' ? 'Connesso come admin - Puoi saltare il pagamento' :
                       'Logged in as Admin - Can skip payment'}
                    </div>
                  </div>
                )}
              </div>
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

            {currentStep === 3 && userType !== 'group' && (
              <SafetyInstructions
                accepted={safetyInstructionsAccepted}
                onAccept={setSafetyInstructionsAccepted}
                language={language}
              />
            )}

            {currentStep === 3 && userType === 'group' && (
              <SafetyInstructions
                accepted={safetyInstructionsAccepted}
                onAccept={setSafetyInstructionsAccepted}
                language={language}
              />
            )}

            {currentStep === 4 && userType !== 'group' && (
              <HealthDeclaration
                accepted={individualHealthDeclarationAccepted}
                onAccept={setIndividualHealthDeclarationAccepted}
                language={language}
              />
            )}

            {currentStep === 4 && userType === 'group' && (
              <GroupHealthDeclaration
                accepted={groupHealthDeclarationAccepted}
                onAccept={setGroupHealthDeclarationAccepted}
                leaderName={groupInfo.leaderName}
                groupName={groupInfo.name}
              />
            )}

            {currentStep === (userType === 'group' ? 5 : 5) && (
              <NifgashimDayCardsSelector
                trekDays={trekDays}
                linkedDaysPairs={linkedDaysPairs}
                selectedDays={selectedDays}
                onDaysChange={setSelectedDays}
                maxDays={nifgashimTrip?.payment_settings?.overall_max_selectable_days || 8}
                trekCategories={nifgashimTrip?.trek_categories || []}
              />
            )}

            {currentStep === (userType === 'group' ? 6 : 6) && (
              <NifgashimMemorialForm
                formData={memorialData}
                setFormData={setMemorialData}
              />
            )}

            {currentStep === (userType === 'group' ? 7 : 7) && (
              <div className="space-y-4">
                <NifgashimRegistrationSummary
                  userType={userType}
                  participants={participants}
                  setParticipants={setParticipants}
                  selectedDays={selectedDays}
                  trekDays={trekDays}
                  groupInfo={groupInfo}
                />
                
                {userType === 'group' && (
                  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                    <p className="text-green-800 font-semibold text-center">
                      {language === 'he' ? '✓ קבוצות - ללא תשלום' : language === 'ru' ? '✓ Группы - Бесплатно' : language === 'es' ? '✓ Grupos - Gratis' : language === 'fr' ? '✓ Groupes - Gratuit' : language === 'de' ? '✓ Gruppen - Kostenlos' : language === 'it' ? '✓ Gruppi - Gratis' : '✓ Groups - Free'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {currentStep === 8 && userType !== 'group' && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-6 text-center">
                    {language === 'he' ? 'תשלום' : language === 'ru' ? 'Оплата' : language === 'es' ? 'Pago' : language === 'fr' ? 'Paiement' : language === 'de' ? 'Zahlung' : language === 'it' ? 'Pagamento' : 'Payment'}
                  </h2>
                  
                  <div className="text-center mb-6">
                    <p className="text-lg text-gray-700">
                      {language === 'he' ? `סכום לתשלום: ₪${totalAmount}` : `Amount: ₪${totalAmount}`}
                    </p>
                  </div>

                  {/* Admin Skip Payment Option */}
                  {isAdmin && (
                    <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                      <div className="flex items-center gap-2 text-green-700 mb-3">
                        <Shield className="w-5 h-5" />
                        <span className="font-semibold">
                          {language === 'he' ? 'מנהל - ניתן לדלג על תשלום' : 
                           language === 'ru' ? 'Администратор - Пропустить оплату' :
                           language === 'es' ? 'Admin - Saltar pago' :
                           language === 'fr' ? 'Admin - Passer le paiement' :
                           language === 'de' ? 'Admin - Zahlung überspringen' :
                           language === 'it' ? 'Admin - Salta pagamento' :
                           'Admin - Skip Payment'}
                        </span>
                      </div>
                      <Button
                        onClick={async () => {
                          setSubmitting(true);
                          try {
                            await completeRegistration('ADMIN_EXEMPT');
                          } catch (error) {
                            console.error('Admin registration failed:', error);
                          }
                          setSubmitting(false);
                        }}
                        disabled={submitting}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            {language === 'he' ? 'שולח...' : 
                             language === 'ru' ? 'Отправка...' :
                             language === 'es' ? 'Enviando...' :
                             language === 'fr' ? 'Envoi...' :
                             language === 'de' ? 'Wird gesendet...' :
                             language === 'it' ? 'Invio...' :
                             'Submitting...'}
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            {language === 'he' ? 'השלם הרשמה ללא תשלום' :
                             language === 'ru' ? 'Завершить регистрацию без оплаты' :
                             language === 'es' ? 'Completar registro sin pago' :
                             language === 'fr' ? 'Terminer l\'inscription sans paiement' :
                             language === 'de' ? 'Registrierung ohne Zahlung abschließen' :
                             language === 'it' ? 'Completa registrazione senza pagamento' :
                             'Complete Registration Without Payment'}
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {!paymentMethod && (
                    <div className="space-y-4">
                      <button
                        onClick={handlePayPalPayment}
                        disabled={submitting}
                        className="w-full p-4 border-2 border-blue-500 rounded-lg hover:bg-blue-50 transition disabled:opacity-50"
                      >
                        <div className="font-semibold text-blue-600 flex items-center justify-center gap-2">
                          <CreditCard className="w-5 h-5" />
                          <span>{language === 'he' ? 'תשלום באמצעות PayPal / כרטיס אשראי' : 'Pay with PayPal / Credit Card'}</span>
                        </div>
                      </button>
                    </div>
                  )}

                  {paymentMethod === 'paypal' && (
                    <div className="space-y-4">
                      <div id="paypal-button-container" className="min-h-[150px]"></div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t-2 border-gray-200 py-4 px-4 -mx-4 mt-6 shadow-lg z-10">
          <div className="flex justify-between items-center max-w-4xl mx-auto">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(prev => Math.max(prev - 1, 1))}
            disabled={currentStep === 1}
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
                    (currentStep === 2 && (
                      !groupInfo.leaderPhone ||
                      !groupInfo.leaderIdNumber ||
                      String(groupInfo.leaderIdNumber).length !== 9 ||
                      !groupInfo.totalParticipants ||
                      Number(groupInfo.totalParticipants) <= 0
                    )) ||
                    (currentStep === 3 && !safetyInstructionsAccepted) ||
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
              {currentStep < 7 && currentStep !== 8 ? (
                <Button
                   onClick={() => setCurrentStep(prev => prev + 1)}
                   disabled={
                     (currentStep === 1 && !userType) ||
                     (currentStep === 2 && participants.length === 0) ||
                     (currentStep === 3 && !safetyInstructionsAccepted) ||
                     (currentStep === 4 && !individualHealthDeclarationAccepted) ||
                     (currentStep === 5 && selectedDays.length === 0)
                   }
                   className="px-6 bg-blue-600 hover:bg-blue-700"
                 >
                   {trans.next}
                   <ArrowRight className={`w-4 h-4 ${isRTL ? 'mr-2' : 'ml-2'}`} />
                 </Button>
               ) : currentStep === 7 ? (
                <Button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Payment button clicked!');
                    handleSubmit();
                  }}
                  disabled={submitting}
                  className="px-6 bg-green-600 hover:bg-green-700 touch-manipulation"
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
    </div>
  );
}