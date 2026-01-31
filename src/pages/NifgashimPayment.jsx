// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, CreditCard, Mountain, Check, Calendar, User, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';

export default function NifgashimPayment() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [paymentComplete, setPaymentComplete] = useState(false);

  // Get URL parameters - support multiple param names
  const urlParams = new URLSearchParams(window.location.search);
  const registrationId = urlParams.get('payment_request') || urlParams.get('special_hiker') || urlParams.get('registration_id');
  const amount = parseInt(urlParams.get('amount') || '0');

  // Fetch registration details
  const { data: registration, isLoading, error } = useQuery({
    queryKey: ['paymentRegistration', registrationId],
    queryFn: async () => {
      if (!registrationId) return null;
      const regs = await base44.entities.NifgashimRegistration.filter({ id: registrationId });
      return regs[0] || null;
    },
    enabled: !!registrationId
  });

  const translations = {
    he: {
      title: 'השלמת תשלום - נפגשים בשביל ישראל',
      subtitle: 'תשלום עבור השתתפות במסע',
      amount: 'סכום לתשלום',
      participant: 'משתתף',
      email: 'אימייל',
      days: 'ימי מסע',
      payWithPayPal: 'תשלום באמצעות PayPal / כרטיס אשראי',
      processing: 'מעבד תשלום...',
      success: 'התשלום בוצע בהצלחה!',
      successMessage: 'תודה! קוד QR להשתתפות נשלח למייל שלך.',
      backToHome: 'חזרה לדף הבית',
      error: 'שגיאה בטעינת פרטי ההרשמה',
      notFound: 'הרשמה לא נמצאה',
      invalidLink: 'קישור לא תקין'
    },
    en: {
      title: 'Complete Payment - Nifgashim for Israel',
      subtitle: 'Payment for trek participation',
      amount: 'Amount to Pay',
      participant: 'Participant',
      email: 'Email',
      days: 'Trek Days',
      payWithPayPal: 'Pay with PayPal / Credit Card',
      processing: 'Processing payment...',
      success: 'Payment Successful!',
      successMessage: 'Thank you! Your QR code has been sent to your email.',
      backToHome: 'Back to Home',
      error: 'Error loading registration',
      notFound: 'Registration not found',
      invalidLink: 'Invalid link'
    },
    ru: {
      title: 'Завершение оплаты - Nifgashim',
      subtitle: 'Оплата участия в походе',
      amount: 'Сумма к оплате',
      participant: 'Участник',
      email: 'Email',
      days: 'Дни похода',
      payWithPayPal: 'Оплатить через PayPal / Карта',
      processing: 'Обработка платежа...',
      success: 'Оплата успешна!',
      successMessage: 'Спасибо! QR-код отправлен на вашу почту.',
      backToHome: 'На главную',
      error: 'Ошибка загрузки',
      notFound: 'Регистрация не найдена',
      invalidLink: 'Недействительная ссылка'
    },
    es: {
      title: 'Completar Pago - Nifgashim',
      subtitle: 'Pago por participación en trek',
      amount: 'Monto a Pagar',
      participant: 'Participante',
      email: 'Email',
      days: 'Días de Trek',
      payWithPayPal: 'Pagar con PayPal / Tarjeta',
      processing: 'Procesando pago...',
      success: '¡Pago Exitoso!',
      successMessage: 'Gracias! Tu código QR ha sido enviado a tu email.',
      backToHome: 'Volver al Inicio',
      error: 'Error al cargar',
      notFound: 'Registro no encontrado',
      invalidLink: 'Enlace inválido'
    },
    fr: {
      title: 'Finaliser le Paiement - Nifgashim',
      subtitle: 'Paiement pour la participation au trek',
      amount: 'Montant à Payer',
      participant: 'Participant',
      email: 'Email',
      days: 'Jours de Trek',
      payWithPayPal: 'Payer avec PayPal / Carte',
      processing: 'Traitement du paiement...',
      success: 'Paiement Réussi!',
      successMessage: 'Merci! Votre code QR a été envoyé par email.',
      backToHome: 'Retour à l\'accueil',
      error: 'Erreur de chargement',
      notFound: 'Inscription non trouvée',
      invalidLink: 'Lien invalide'
    },
    de: {
      title: 'Zahlung abschließen - Nifgashim',
      subtitle: 'Zahlung für Trek-Teilnahme',
      amount: 'Zu zahlender Betrag',
      participant: 'Teilnehmer',
      email: 'Email',
      days: 'Trek-Tage',
      payWithPayPal: 'Mit PayPal / Karte bezahlen',
      processing: 'Zahlung wird verarbeitet...',
      success: 'Zahlung erfolgreich!',
      successMessage: 'Danke! Ihr QR-Code wurde per E-Mail gesendet.',
      backToHome: 'Zurück zur Startseite',
      error: 'Ladefehler',
      notFound: 'Registrierung nicht gefunden',
      invalidLink: 'Ungültiger Link'
    },
    it: {
      title: 'Completa Pagamento - Nifgashim',
      subtitle: 'Pagamento per partecipazione al trek',
      amount: 'Importo da Pagare',
      participant: 'Partecipante',
      email: 'Email',
      days: 'Giorni di Trek',
      payWithPayPal: 'Paga con PayPal / Carta',
      processing: 'Elaborazione pagamento...',
      success: 'Pagamento Riuscito!',
      successMessage: 'Grazie! Il tuo codice QR è stato inviato via email.',
      backToHome: 'Torna alla Home',
      error: 'Errore di caricamento',
      notFound: 'Registrazione non trovata',
      invalidLink: 'Link non valido'
    }
  };

  // Detect language from browser or default to Hebrew
  const browserLang = navigator.language?.split('-')[0] || 'he';
  const language = ['he', 'en', 'ru', 'es', 'fr', 'de', 'it'].includes(browserLang) ? browserLang : 'he';
  const isRTL = language === 'he';
  const t = translations[language] || translations.he;

  const handlePayPalPayment = async () => {
    try {
      setSubmitting(true);
      setPaymentMethod('paypal');

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

      // Wait for DOM to update
      await new Promise(resolve => setTimeout(resolve, 100));

      paypal.Buttons({
        createOrder: async () => {
          const response = await base44.functions.invoke('createPayPalOrder', {
            amount: amount,
            participantsCount: registration?.participants?.length || 1,
            userEmail: registration?.customer_email || '',
            registrationId: registrationId
          });

          if (!response.data?.orderId) {
            throw new Error('Failed to create order');
          }

          return response.data.orderId;
        },
        onApprove: async (data) => {
          const response = await base44.functions.invoke('capturePayPalOrder', {
            orderId: data.orderID,
            registrationId: registrationId
          });

          if (response.data?.success) {
            toast.success(t.success);
            setPaymentComplete(true);
            
            // Send QR email
            try {
              await base44.functions.invoke('sendQREmailToParticipant', {
                registrationId: registrationId,
                language
              });
            } catch (e) {
              console.error('Failed to send QR email:', e);
            }
          } else {
            toast.error(language === 'he' ? 'שגיאה בביצוע התשלום' : 'Payment failed');
          }
          setSubmitting(false);
        },
        onCancel: () => {
          toast.info(language === 'he' ? 'התשלום בוטל' : 'Payment cancelled');
          setSubmitting(false);
          setPaymentMethod(null);
        },
        onError: (err) => {
          console.error('PayPal error:', err);
          toast.error(language === 'he' ? 'שגיאה בתהליך התשלום' : 'Payment error');
          setSubmitting(false);
          setPaymentMethod(null);
        }
      }).render('#paypal-button-container');

    } catch (error) {
      console.error('PayPal payment failed:', error);
      toast.error(language === 'he' ? 'שגיאה בטעינת PayPal' : 'Failed to load PayPal');
      setSubmitting(false);
      setPaymentMethod(null);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50">
        <Loader2 className="w-12 h-12 animate-spin text-orange-600" />
      </div>
    );
  }

  // Error or not found
  if (!registrationId || !amount || error || !registration) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 py-8 px-4 ${isRTL ? 'rtl' : 'ltr'}`}>
        <div className="max-w-md mx-auto">
          <Card className="text-center p-8">
            <CardContent>
              <Mountain className="w-16 h-16 mx-auto text-red-400 mb-4" />
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                {!registrationId ? t.invalidLink : t.notFound}
              </h2>
              <Button 
                onClick={() => navigate(createPageUrl('Home'))}
                className="mt-4"
              >
                {t.backToHome}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Payment complete
  if (paymentComplete) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-8 px-4 ${isRTL ? 'rtl' : 'ltr'}`}>
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="text-center overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6">
                <Check className="w-16 h-16 mx-auto text-white mb-2" />
                <h1 className="text-2xl font-bold text-white">{t.success}</h1>
              </div>
              <CardContent className="p-6">
                <p className="text-gray-700 mb-6">{t.successMessage}</p>
                <Button 
                  onClick={() => navigate(createPageUrl('Home'))}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {t.backToHome}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  const participantName = registration?.participants?.[0]?.name || registration?.customer_name || '';
  const participantEmail = registration?.customer_email || registration?.participants?.[0]?.email || '';
  const selectedDaysCount = registration?.selected_days?.length || registration?.selectedDays?.length || 0;

  return (
    <div className={`min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 py-6 px-4 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <Mountain className="w-12 h-12 mx-auto text-orange-600 mb-3" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{t.title}</h1>
          <p className="text-gray-600">{t.subtitle}</p>
        </motion.div>

        {/* Registration Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="mb-6">
            <CardContent className="p-6">
              {/* Participant Info */}
              <div className="space-y-4 mb-6">
                {participantName && (
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">{t.participant}</p>
                      <p className="font-semibold">{participantName}</p>
                    </div>
                  </div>
                )}
                
                {participantEmail && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">{t.email}</p>
                      <p className="font-semibold">{participantEmail}</p>
                    </div>
                  </div>
                )}
                
                {selectedDaysCount > 0 && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">{t.days}</p>
                      <p className="font-semibold">{selectedDaysCount} {language === 'he' ? 'ימים' : 'days'}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Amount */}
              <div className="bg-gradient-to-r from-orange-100 to-amber-100 border-2 border-orange-300 rounded-xl p-4 text-center">
                <p className="text-sm text-orange-700 mb-1">{t.amount}</p>
                <p className="text-4xl font-bold text-orange-800">₪{amount}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Payment Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              {!paymentMethod ? (
                <Button
                  onClick={handlePayPalPayment}
                  disabled={submitting}
                  className="w-full h-14 text-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      {t.processing}
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 mr-2" />
                      {t.payWithPayPal}
                    </>
                  )}
                </Button>
              ) : (
                <div id="paypal-button-container" className="min-h-[150px]"></div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}