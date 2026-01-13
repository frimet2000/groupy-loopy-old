// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, Smartphone, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const translations = {
  he: {
    title: 'תשלום',
    amount: 'סכום לתשלום',
    processing: 'מעבד תשלום...',
    payNow: 'שלם עכשיו',
    payWith: 'שלם באמצעות',
    credit: 'כרטיס אשראי',
    bit: 'ביט',
    googlePay: 'Google Pay',
    error: 'שגיאה',
    paymentFailed: 'התשלום נכשל',
    tryAgain: 'נסה שוב'
  },
  en: {
    title: 'Payment',
    amount: 'Amount to Pay',
    processing: 'Processing payment...',
    payNow: 'Pay Now',
    payWith: 'Pay with',
    credit: 'Credit Card',
    bit: 'Bit',
    googlePay: 'Google Pay',
    error: 'Error',
    paymentFailed: 'Payment failed',
    tryAgain: 'Try Again'
  },
  ru: {
    title: 'Оплата',
    amount: 'Сумма к оплате',
    processing: 'Обработка платежа...',
    payNow: 'Оплатить',
    payWith: 'Оплатить через',
    credit: 'Кредитная карта',
    bit: 'Bit',
    googlePay: 'Google Pay',
    error: 'Ошибка',
    paymentFailed: 'Платеж не прошел',
    tryAgain: 'Попробовать снова'
  },
  es: {
    title: 'Pago',
    amount: 'Monto a Pagar',
    processing: 'Procesando pago...',
    payNow: 'Pagar Ahora',
    payWith: 'Pagar con',
    credit: 'Tarjeta de Crédito',
    bit: 'Bit',
    googlePay: 'Google Pay',
    error: 'Error',
    paymentFailed: 'Pago fallido',
    tryAgain: 'Intentar de Nuevo'
  },
  fr: {
    title: 'Paiement',
    amount: 'Montant à Payer',
    processing: 'Traitement du paiement...',
    payNow: 'Payer Maintenant',
    payWith: 'Payer avec',
    credit: 'Carte de Crédit',
    bit: 'Bit',
    googlePay: 'Google Pay',
    error: 'Erreur',
    paymentFailed: 'Paiement échoué',
    tryAgain: 'Réessayer'
  },
  de: {
    title: 'Zahlung',
    amount: 'Zu zahlender Betrag',
    processing: 'Zahlung wird verarbeitet...',
    payNow: 'Jetzt Zahlen',
    payWith: 'Zahlen mit',
    credit: 'Kreditkarte',
    bit: 'Bit',
    googlePay: 'Google Pay',
    error: 'Fehler',
    paymentFailed: 'Zahlung fehlgeschlagen',
    tryAgain: 'Erneut Versuchen'
  },
  it: {
    title: 'Pagamento',
    amount: 'Importo da Pagare',
    processing: 'Elaborazione pagamento...',
    payNow: 'Paga Ora',
    payWith: 'Paga con',
    credit: 'Carta di Credito',
    bit: 'Bit',
    googlePay: 'Google Pay',
    error: 'Errore',
    paymentFailed: 'Pagamento fallito',
    tryAgain: 'Riprova'
  }
};

const GrowPaymentForm = ({ 
  amount,
  onSuccess,
  customerName,
  customerEmail,
  customerPhone,
  registrationData
}) => {
  const { tripId, participants, userType, groupInfo, selectedDays, memorialData, vehicleInfo } = registrationData || {};
  const { language } = useLanguage();
  const t = translations[language] || translations.en;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [processId, setProcessId] = useState(null);
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [isChrome, setIsChrome] = useState(false);
  const [showIframe, setShowIframe] = useState(false);

  useEffect(() => {
    // Check if browser is Chrome (required for Google Pay)
    const checkChrome = () => {
      const isChromium = window.chrome;
      const winNav = window.navigator;
      const vendorName = winNav.vendor;
      const isOpera = typeof window.opr !== "undefined";
      const isIEedge = winNav.userAgent.indexOf("Edg") > -1;
      const isIOSChrome = winNav.userAgent.match("CriOS");

      if (isIOSChrome) {
        return true;
      } else if (
        isChromium !== null &&
        typeof isChromium !== "undefined" &&
        vendorName === "Google Inc." &&
        isOpera === false &&
        isIEedge === false
      ) {
        return true;
      } else {
        return false;
      }
    };
    setIsChrome(checkChrome());
  }, []);

  // Load Meshulam SDK
  useEffect(() => {
    const loadSDK = async () => {
      if (window.growPayment) {
        setSdkReady(true);
        return;
      }

      // Check if script already exists
      if (document.getElementById('grow-payment-sdk')) {
        // Wait for SDK to initialize
        const checkInterval = setInterval(() => {
          if (window.growPayment) {
            setSdkReady(true);
            clearInterval(checkInterval);
          }
        }, 100);

        setTimeout(() => clearInterval(checkInterval), 5000);
        return;
      }

      const script = document.createElement('script');
      script.id = 'grow-payment-sdk';
      script.src = 'https://cdn.meshulam.co.il/sdk/gs.min.js';
      script.async = true;
      
      script.onload = () => {
        // Wait for SDK to be globally available
        const checkSDK = setInterval(() => {
          if (window.growPayment) {
            setSdkReady(true);
            clearInterval(checkSDK);
          }
        }, 50);

        setTimeout(() => clearInterval(checkSDK), 3000);
      };

      script.onerror = () => {
        setError(language === 'he' ? 'שגיאה בטעינת מערכת התשלום' : 'Failed to load payment SDK');
      };

      document.head.appendChild(script);
    };

    loadSDK();

    return () => {
      const script = document.getElementById('grow-payment-sdk');
      if (script && script.parentNode) {
        document.head.removeChild(script);
      }
    };
  }, [language]);

  const handlePayment = async (e) => {
    if (e && e.preventDefault) e.preventDefault(); // Prevent form submission reload
    
    console.log('--- handlePayment v3.0 started ---');
    
    if (!sdkReady) {
      toast.error(language === 'he' ? 'מערכת התשלום טוענת...' : 'Payment system is loading...');
      return;
    }

    setLoading(true);
    setError(null);
    setShowIframe(false);

    try {
      console.log('Initiating payment with:', { amount, customerName, customerPhone });

      if (!amount || !customerName || !customerPhone) {
        throw new Error('Missing payment details (amount, name, or phone)');
      }

      console.log('Invoking createGrowPayment...');
      const response = await base44.functions.invoke('createGrowPayment', {
        sum: amount,
        fullName: customerName,
        phone: customerPhone
      });
      
      console.log('createGrowPayment raw response:', JSON.stringify(response));

      // Handle different SDK response structures
      const data = response?.data || response;

      if (!data) {
        throw new Error('No data received from payment server');
      }
      
      console.log('Parsed payment data:', data);

      // Store payment URL if available (for fallback)
      if (data.url) {
        console.log('Payment URL received:', data.url);
        setPaymentUrl(data.url);
      }

      // If server explicitly says success=false
      if (!data.success) {
        const errorDetail = data.error || 'Unknown server error';
        console.error('Server returned failure:', JSON.stringify(data));
        // If we have a URL, don't throw, just use iframe
        if (data.url) {
           console.warn('Server reported failure but provided URL, trying iframe fallback');
           setShowIframe(true);
           setLoading(false);
           return;
        }
        throw new Error(errorDetail);
      }

      if (!data.processId && !data.processToken) {
        // If no token but we have URL, maybe just switch to iframe?
        if (data.url) {
           console.log('No token but URL received, switching to iframe fallback');
           setShowIframe(true);
           setLoading(false);
           return;
        }
        console.error('Missing processId/processToken in success response:', JSON.stringify(data));
        throw new Error('Payment server did not return a process ID or Token');
      }

      const receivedProcessId = data.processId;
      const receivedProcessToken = data.processToken;
      console.log('Payment processId:', receivedProcessId); 
      console.log('Payment processToken:', receivedProcessToken ? '***' : 'missing');
      setProcessId(receivedProcessId);

      // Initialize SDK first with all callbacks before rendering
      if (!window.growPayment) {
        throw new Error('Payment SDK not loaded');
      }

      window.growPayment.init({
        environment: 'DEV', // Always use DEV for Sandbox testing
        version: 1,
        events: {
          onSuccess: (res) => {
            console.log('Payment success:', res);
            toast.success(language === 'he' ? 'התשלום בוצע בהצלחה!' : 'Payment successful!');
            setLoading(false);
            setProcessId(null);
            if (onSuccess) {
              onSuccess(res);
            }
          },
          onFailure: (res) => {
            console.error('Payment failure:', JSON.stringify(res));
            const errorMsg = typeof res === 'string' ? res : (res?.message || (language === 'he' ? 'התשלום נכשל' : 'Payment failed'));
            toast.error(errorMsg);
            setLoading(false);
            setProcessId(null);
            // On failure, offer iframe if available
            if (paymentUrl) setShowIframe(true);
          },
          onError: (res) => {
            console.error('Payment error event:', JSON.stringify(res));
            const errorMsg = typeof res === 'string' ? res : (res?.message || (language === 'he' ? 'שגיאה בתשלום' : 'Payment error'));
            toast.error(errorMsg);
            setLoading(false);
            setProcessId(null);
            // On error, offer iframe if available
            if (paymentUrl) setShowIframe(true);
          },
          onCancel: () => {
            console.log('Payment cancelled by user');
            toast.error(language === 'he' ? 'התשלום בוטל' : 'Payment cancelled');
            setLoading(false);
            setProcessId(null);
          },
          onWalletChange: (state) => {
            console.log('Wallet state:', state);
          },
          onPaymentStart: () => {
            console.log('Payment started');
          },
          onPaymentCancel: () => {
            console.log('Payment cancelled');
            setLoading(false);
            setProcessId(null);
          },
          onTimeout: () => {
            console.log('Payment timeout');
            toast.error(language === 'he' ? 'התשלום הסתיים בתיאום' : 'Payment timeout');
            setLoading(false);
            setProcessId(null);
          }
        }
      });

      // Render payment options after 500ms to ensure wallet is initialized
      setTimeout(() => {
        try {
          const identifier = receivedProcessToken || receivedProcessId;
          console.log('Rendering payment options for identifier:', identifier === receivedProcessToken ? 'Token' : 'ID');
          window.growPayment.renderPaymentOptions(identifier);
          setLoading(false);
        } catch (renderError) {
          console.error('Render error:', renderError);
          setLoading(false);
          setProcessId(null);
          
          // Fallback to iframe if render fails
          if (data.url) {
             console.log('Render failed, falling back to iframe');
             setShowIframe(true);
             toast.error(language === 'he' ? 'הארנק לא נטען, עובר לטופס אשראי' : 'Wallet failed, switching to credit card form');
          } else {
             const errorMessage = language === 'he' ? 'שגיאה בהצגת אפשרויות תשלום' : 'Failed to render payment options';
             setError(errorMessage);
             toast.error(errorMessage);
          }
        }
      }, 500);

    } catch (error) {
      console.error('Payment error caught:', error);
      console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
      
      const errorMessage = error.message || (language === 'he' ? 'שגיאה בתשלום' : 'Payment error');
      setError(errorMessage);
      toast.error(errorMessage);
      setLoading(false);
      
      // If we have a URL from a previous attempt or this one, offer it?
      if (paymentUrl) {
         console.log('Error caught but URL available, enabling iframe fallback');
         setShowIframe(true);
      }
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          {t.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-4 border-2 border-emerald-200">
          <div className="text-sm text-gray-600 mb-1">{t.amount}</div>
          <div className="text-3xl font-bold text-emerald-700">₪{amount.toFixed(2)}</div>
        </div>

        {error ? (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 text-center">
            <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <div className="text-red-700 font-semibold mb-2">{t.error}</div>
            <div className="text-sm text-red-600 mb-4">{error}</div>
            <Button 
              onClick={() => {
                setError(null);
                setProcessId(null);
              }}
              variant="outline"
              className="w-full"
            >
              {t.tryAgain}
            </Button>
            {paymentUrl && (
              <Button 
                onClick={() => {
                   setError(null);
                   setShowIframe(true);
                }}
                variant="link"
                className="w-full mt-2 text-blue-600"
              >
                {language === 'he' ? 'נסה תשלום רגיל (IFRAME)' : 'Try Standard Payment (IFRAME)'}
              </Button>
            )}
          </div>
        ) : showIframe && paymentUrl ? (
          <div className="w-full">
            <iframe 
              src={paymentUrl} 
              className="w-full h-[600px] border-0 rounded-lg shadow-sm"
              title="Payment Frame"
              allow="payment"
            />
            <Button 
              onClick={() => setShowIframe(false)} 
              variant="outline" 
              className="w-full mt-4"
            >
              {language === 'he' ? 'חזור לארנק' : 'Back to Wallet'}
            </Button>
          </div>
        ) : processId ? (
          <div id="grow-payment-container" className="min-h-[400px] w-full">
            {/* Payment options will be rendered here by Meshulam SDK */}
          </div>
        ) : (
          <Button 
            type="button"
            onClick={handlePayment}
            disabled={loading || !sdkReady}
            className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {t.processing}
              </>
            ) : !sdkReady ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {language === 'he' ? 'טוען...' : 'Loading...'}
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5 mr-2" />
                {t.payNow}
              </>
            )}
          </Button>
        )}

        {!error && (
          <div className="text-center text-sm text-gray-500">
            <div className="mb-2">{t.payWith}</div>
            <div className="flex flex-wrap justify-center gap-3">
              <div className="flex items-center gap-1">
                <CreditCard className="w-4 h-4" />
                <span>{t.credit}</span>
              </div>
              <div className="flex items-center gap-1">
                <Smartphone className="w-4 h-4" />
                <span>{t.bit}</span>
              </div>
              {isChrome && (
                <div className="flex items-center gap-1">
                  <span>G</span>
                  <span>{t.googlePay}</span>
                </div>
              )}
            </div>
            {!isChrome && (
              <div className="text-xs text-amber-600 mt-2">
                {language === 'he' ? '*Google Pay נתמך בדפדפן כרום בלבד' : '*Google Pay is supported on Chrome only'}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GrowPaymentForm;