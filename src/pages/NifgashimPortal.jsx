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
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';
import NifgashimUserTypeSelector from '../components/nifgashim/portal/UserTypeSelector';
import NifgashimParticipantForm from '../components/nifgashim/portal/ParticipantForm';
import NifgashimDayCardsSelector from '../components/nifgashim/portal/DayCardsSelector';
import NifgashimMemorialForm from '../components/nifgashim/portal/MemorialForm';
import NifgashimRegistrationSummary from '../components/nifgashim/portal/RegistrationSummary';
import ThankYouView from '../components/nifgashim/portal/ThankYouView';
import AdminDashboard from '../components/nifgashim/portal/AdminDashboard';

// Load stripe promise dynamically
let stripePromise = null;
const getStripePromise = async () => {
  if (!stripePromise) {
    try {
      const response = await base44.functions.invoke('getStripePublicKey', {});
      if (response.data.publicKey) {
        stripePromise = loadStripe(response.data.publicKey);
      }
    } catch (error) {
      console.error('Failed to load Stripe key:', error);
      // Fallback to env variable if available
      // @ts-ignore
      const envKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
      if (envKey) {
        stripePromise = loadStripe(envKey);
      }
    }
  }
  return stripePromise;
};

function PaymentForm({ amount, participants, userType, groupInfo, onSuccess, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();
  const { language } = useLanguage();
  const [processing, setProcessing] = useState(false);
  const [receiptType, setReceiptType] = useState('parent1');
  const [customReceipt, setCustomReceipt] = useState({ name: '', email: '', id_number: '' });

  // Determine available receipt options
  const parent1 = participants[0];
  const parent2 = participants.length > 1 && participants[0]?.hasSpouse ? participants[1] : null;

  const translations = {
    he: {
      payNow: "שלם עכשיו",
      processing: "מעבד תשלום...",
      cancel: "ביטול",
      cardDetails: "פרטי כרטיס אשראי",
      receiptDetails: "פרטי קבלה",
      receiptFor: "עבור מי הקבלה?",
      parent1: `הורה 1: ${parent1?.name || ''}`,
      parent2: `הורה 2: ${parent2?.name || ''}`,
      groupLeader: `ראש קבוצה: ${groupInfo?.leaderName || ''}`,
      other: "אחר (הזנה ידנית)",
      fullName: "שם מלא",
      email: "אימייל",
      idNumber: "תעודת זהות"
    },
    en: {
      payNow: "Pay Now",
      processing: "Processing...",
      cancel: "Cancel",
      cardDetails: "Card Details",
      receiptDetails: "Receipt Details",
      receiptFor: "Who is the receipt for?",
      parent1: `Parent 1: ${parent1?.name || ''}`,
      parent2: `Parent 2: ${parent2?.name || ''}`,
      groupLeader: `Group Leader: ${groupInfo?.leaderName || ''}`,
      other: "Other (Manual Entry)",
      fullName: "Full Name",
      email: "Email",
      idNumber: "ID Number"
    }
  };

  const trans = translations[language] || translations.en;

  // Initialize receipt type based on user type
  useEffect(() => {
    if (userType === 'group') {
      setReceiptType('group');
    } else {
      setReceiptType('parent1');
    }
  }, [userType]);

  const getReceiptDetails = () => {
    if (receiptType === 'parent1') {
      return {
        name: parent1?.name,
        email: parent1?.email,
        id_number: parent1?.id_number
      };
    } else if (receiptType === 'parent2') {
      return {
        name: parent2?.name,
        email: parent2?.email,
        id_number: parent2?.id_number
      };
    } else if (receiptType === 'group') {
      return {
        name: groupInfo?.leaderName,
        email: groupInfo?.leaderEmail,
        id_number: '' // Group might not have ID here, usually organization
      };
    } else {
      return customReceipt;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    const receiptDetails = getReceiptDetails();
    if (!receiptDetails.name || !receiptDetails.email) {
      toast.error(language === 'he' ? 'נא למלא פרטי קבלה' : 'Please fill receipt details');
      return;
    }

    setProcessing(true);
    try {
      // Get client secret from backend
      const response = await base44.functions.invoke('processNifgashimPayment', {
        amount: amount,
        email: receiptDetails.email,
        receiptName: receiptDetails.name,
        receiptId: receiptDetails.id_number
      });

      if (!response.data.success || !response.data.clientSecret) {
        toast.error(response.data.error || (language === 'he' ? 'שגיאה ביצירת תשלום' : 'Failed to initialize payment'));
        setProcessing(false);
        return;
      }

      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret: response.data.clientSecret,
        confirmParams: {
          return_url: window.location.href,
          payment_method_data: {
            billing_details: {
              name: receiptDetails.name,
              email: receiptDetails.email,
            }
          }
        },
        redirect: 'if_required'
      });

      if (error) {
        toast.error(error.message);
        setProcessing(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        toast.success(language === 'he' ? 'התשלום בוצע בהצלחה!' : 'Payment successful!');
        try {
          await onSuccess(paymentIntent.id);
        } catch (err) {
          console.error('Registration failed after payment:', err);
          setProcessing(false);
        }
      } else {
        toast.error(language === 'he' ? 'התשלום נכשל' : 'Payment failed');
        setProcessing(false);
      }
    } catch (error) {
      console.error(error);
      toast.error(language === 'he' ? 'שגיאה בתשלום. אנא נסה שוב.' : 'Payment error. Please try again.');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="font-semibold text-lg border-b pb-2">{trans.receiptDetails}</h3>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">{trans.receiptFor}</label>
          <div className="grid gap-2">
            {userType !== 'group' && parent1 && (
              <label className="flex items-center space-x-2 space-x-reverse cursor-pointer p-2 border rounded hover:bg-gray-50">
                <input
                  type="radio"
                  name="receiptType"
                  value="parent1"
                  checked={receiptType === 'parent1'}
                  onChange={(e) => setReceiptType(e.target.value)}
                  className="ml-2"
                />
                <span>{trans.parent1}</span>
              </label>
            )}
            
            {userType !== 'group' && parent2 && (
              <label className="flex items-center space-x-2 space-x-reverse cursor-pointer p-2 border rounded hover:bg-gray-50">
                <input
                  type="radio"
                  name="receiptType"
                  value="parent2"
                  checked={receiptType === 'parent2'}
                  onChange={(e) => setReceiptType(e.target.value)}
                  className="ml-2"
                />
                <span>{trans.parent2}</span>
              </label>
            )}

            {userType === 'group' && (
              <label className="flex items-center space-x-2 space-x-reverse cursor-pointer p-2 border rounded hover:bg-gray-50">
                <input
                  type="radio"
                  name="receiptType"
                  value="group"
                  checked={receiptType === 'group'}
                  onChange={(e) => setReceiptType(e.target.value)}
                  className="ml-2"
                />
                <span>{trans.groupLeader}</span>
              </label>
            )}

            <label className="flex items-center space-x-2 space-x-reverse cursor-pointer p-2 border rounded hover:bg-gray-50">
              <input
                type="radio"
                name="receiptType"
                value="custom"
                checked={receiptType === 'custom'}
                onChange={(e) => setReceiptType(e.target.value)}
                className="ml-2"
              />
              <span>{trans.other}</span>
            </label>
          </div>
        </div>

        {receiptType === 'custom' && (
          <div className="grid gap-3 p-3 bg-gray-50 rounded-lg animate-in fade-in slide-in-from-top-2">
            <div>
              <label className="text-sm font-medium">{trans.fullName}</label>
              <input
                type="text"
                required
                className="w-full p-2 border rounded"
                value={customReceipt.name}
                onChange={(e) => setCustomReceipt({ ...customReceipt, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">{trans.email}</label>
              <input
                type="email"
                required
                className="w-full p-2 border rounded"
                value={customReceipt.email}
                onChange={(e) => setCustomReceipt({ ...customReceipt, email: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">{trans.idNumber}</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={customReceipt.id_number}
                onChange={(e) => setCustomReceipt({ ...customReceipt, id_number: e.target.value })}
              />
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">{trans.cardDetails}</label>
        <div className="p-3 border-2 border-gray-200 rounded-lg">
          <CardElement options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
            },
          }} />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={processing}
          className="flex-1"
        >
          {trans.cancel}
        </Button>
        <Button
          type="submit"
          disabled={!stripe || processing}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          {processing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {trans.processing}
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 mr-2" />
              {trans.payNow} {amount}₪
            </>
          )}
        </Button>
      </div>
    </form>
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
  const [stripeReady, setStripeReady] = useState(null);

  const { data: nifgashimTrip, isLoading, refetch } = useQuery({
    queryKey: ['nifgashimPortalTrip'],
    queryFn: async () => {
      // Get trip ID from URL
      const urlParams = new URLSearchParams(window.location.search);
      let tripId = urlParams.get('id');
      
      // Fallback to the specific trip ID if not provided (as requested by user)
      if (!tripId) {
         tripId = '6946647d7d7b248feaf1b118';
      }

      // Fetch the real trip from the database
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

  // Transform trip days to the format expected by the selector
  const trekDays = React.useMemo(() => {
    // Check for both 'days' and 'trek_days' fields
    const sourceDays = nifgashimTrip?.days || nifgashimTrip?.trek_days;
    if (!sourceDays) return [];
    
    return sourceDays.map((day, index) => ({
      id: day.id || `day-${index + 1}`,
      date: day.date,
      daily_title: day.daily_title || day.title,
      difficulty: day.difficulty || 'moderate',
      daily_distance_km: day.daily_distance_km || day.distance_km || 0,
      elevation_gain_m: day.elevation_gain_m || day.elevation_gain || 0,
      day_number: day.day_number || index + 1,
      description: day.daily_description || day.description || day.content || '',
      image: day.image || day.secure_url || day.image_url || null
    })).filter(day => {
      // Filter out Saturdays if requested (user explicit request)
      if (!day.date) return true;
      const d = new Date(day.date);
      if (d.getDay() === 6) return false;

      // Filter out rest days (titles containing "Rest" or "מנוחה")
      const title = (day.daily_title || '').toLowerCase();
      if (title.includes('rest') || title.includes('מנוחה')) return false;

      return true;
    });
  }, [nifgashimTrip]);

  const trekMapUrl = React.useMemo(() => {
    return nifgashimTrip?.map_url || nifgashimTrip?.map_image_url || null;
  }, [nifgashimTrip]);

  const linkedDaysPairs = React.useMemo(() => {
    const pairs = nifgashimTrip?.linked_days_pairs || nifgashimTrip?.day_pairs || [];
    
    // If pairs contain numbers (from TrekDaysCreator), map to IDs
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

  // Load Stripe
  React.useEffect(() => {
    const loadStripePromise = async () => {
      const promise = await getStripePromise();
      setStripeReady(promise);
    };
    loadStripePromise();
  }, []);

  // Check if user is admin
  React.useEffect(() => {
    const checkAdmin = async () => {
      try {
        const user = await base44.auth.me();
        if (user?.role === 'admin') {
          setIsAdmin(true);
          // Check URL for admin access
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

  // Save state to local storage
  useEffect(() => {
    // Only save if we have some data
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
      localStorage.setItem('nifgashim_registration_state', JSON.stringify(state));
    }
  }, [userType, participants, selectedDays, groupInfo, memorialData, currentStep, totalAmount]);

  // Load state on mount
  useEffect(() => {
    const savedState = localStorage.getItem('nifgashim_registration_state');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        // Only restore if less than 24 hours old
        if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
          if (!userType && parsed.userType) {
            setUserType(parsed.userType);
            setParticipants(parsed.participants || []);
            setSelectedDays(parsed.selectedDays || []);
            setGroupInfo(parsed.groupInfo || { name: '', leaderName: '', leaderEmail: '', leaderPhone: '' });
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

  // Handle Stripe redirect return
  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (!stripeReady || participants.length === 0) return;

      const clientSecret = new URLSearchParams(window.location.search).get(
        "payment_intent_client_secret"
      );

      if (!clientSecret) return;

      try {
        const { paymentIntent } = await stripeReady.retrievePaymentIntent(clientSecret);

        if (paymentIntent && paymentIntent.status === 'succeeded') {
          // Check if we already processed this
          // (Simple check: if we are showing ThankYou, we are done)
          if (showThankYou) return;

          toast.success(language === 'he' ? 'התשלום בוצע בהצלחה!' : 'Payment successful!');
          
          // Clear URL params to prevent double processing
          const url = new URL(window.location);
          url.searchParams.delete('payment_intent_client_secret');
          url.searchParams.delete('payment_intent');
          url.searchParams.delete('redirect_status');
          window.history.replaceState({}, '', url);

          // Complete registration
          await completeRegistration(paymentIntent.id);
          
          // Clear saved state
          localStorage.removeItem('nifgashim_registration_state');
        }
      } catch (err) {
        console.error('Error checking payment status:', err);
        toast.error(language === 'he' ? 'שגיאה בבדיקת סטטוס תשלום' : 'Error checking payment status');
      }
    };

    checkPaymentStatus();
  }, [stripeReady, participants, showThankYou]);

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
    if (userType === 'group') return 0;
    const adultsCount = participants.filter(p => {
      if (!p.age_range) return true;
      const age = parseInt(p.age_range.split('-')[0]);
      return age >= 10;
    }).length;
    return adultsCount * 85;
  };

  const handleSubmit = async () => {
    const amount = calculateTotalAmount();
    
    // If payment required, show payment form
    if (amount > 0) {
      setTotalAmount(amount);
      setShowPayment(true);
      return;
    }

    // If no payment needed (group), complete registration
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
        payment_status: transactionId ? 'completed' : (userType === 'group' ? 'exempt' : 'pending'),
        payment_amount: totalAmount,
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

      // Send confirmation email to user
      const payerEmail = userType === 'group' ? groupInfo.leaderEmail : (participants[0]?.email || '');
      const payerName = userType === 'group' ? groupInfo.leaderName : (participants[0]?.name || '');
      
      try {
        await base44.integrations.Core.SendEmail({
          to: payerEmail,
          subject: language === 'he' ? 'אישור הרשמה - נפגשים בשביל ישראל' : 'Registration Confirmation - Nifgashim',
          body: language === 'he' 
            ? `שלום ${payerName},\n\nתודה שנרשמת למסע נפגשים בשביל ישראל!\n\nפרטי ההרשמה נקלטו במערכת.\nמספר משתתפים: ${participants.length}\nסכום ששולם: ${totalAmount}₪\n\nקבלה נשלחה לכתובת המייל הזו.\n\nנתראה במסע!\nצוות נפגשים`
            : `Hello ${payerName},\n\nThank you for registering for Nifgashim Bishvil Israel!\n\nYour registration details have been received.\nParticipants: ${participants.length}\nAmount paid: ${totalAmount}₪\n\nA receipt has been sent to this email address.\n\nSee you on the trek!\nNifgashim Team`
        });
      } catch (emailError) {
        console.error('Failed to send confirmation email', emailError);
      }

      // Send notification to admin
      try {
        const adminEmail = nifgashimTrip?.organizer_email;
        if (adminEmail) {
             await base44.integrations.Core.SendEmail({
              to: adminEmail,
              subject: `New Registration: ${payerName}`,
              body: `New registration received.\nUser: ${payerName} (${payerEmail})\nParticipants: ${participants.length}\nAmount: ${totalAmount}\nType: ${userType}`
            });
        }
      } catch (adminEmailError) {
        console.error('Failed to send admin email', adminEmailError);
      }

      toast.success(trans.registrationSuccess);
      
      // Clear saved state
      localStorage.removeItem('nifgashim_registration_state');

      // Show Thank You view
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

  // Admin Dashboard View
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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{trans.title}</h1>
          <p className="text-gray-600">{trans.subtitle}</p>
        </motion.div>

        {/* Progress */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              {steps.map((step, idx) => (
                <React.Fragment key={step.id}>
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
                </React.Fragment>
              ))}
            </div>
            <Progress value={progressPercent} className="h-2" />
          </CardContent>
        </Card>

        {/* Step Content */}
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
                mapUrl={trekMapUrl}
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

        {/* Payment Dialog */}
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
              <p className="text-gray-600 mb-6">
                {language === 'he' 
                  ? `סכום לתשלום: ${totalAmount}₪`
                  : `Amount to pay: ${totalAmount}₪`}
              </p>
              {stripeReady ? (
                <Elements stripe={stripeReady}>
                  <PaymentForm
                    amount={totalAmount}
                    participants={participants}
                    userType={userType}
                    groupInfo={groupInfo}
                    onSuccess={completeRegistration}
                    onCancel={() => setShowPayment(false)}
                  />
                </Elements>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* Navigation */}
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