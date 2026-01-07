// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, Smartphone } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const translations = {
  he: {
    title: 'תשלום',
    amount: 'סכום לתשלום',
    processing: 'מעבד תשלום...',
    openWallet: 'פתח ארנק תשלום',
    payWith: 'שלם באמצעות',
    credit: 'כרטיס אשראי',
    bit: 'ביט',
    googlePay: 'Google Pay',
    loading: 'טוען ארנק...',
    error: 'שגיאה בטעינת ארנק התשלומים',
    paymentFailed: 'התשלום נכשל',
    tryAgain: 'נסה שוב'
  },
  en: {
    title: 'Payment',
    amount: 'Amount to Pay',
    processing: 'Processing payment...',
    openWallet: 'Open Payment Wallet',
    payWith: 'Pay with',
    credit: 'Credit Card',
    bit: 'Bit',
    googlePay: 'Google Pay',
    loading: 'Loading wallet...',
    error: 'Error loading payment wallet',
    paymentFailed: 'Payment failed',
    tryAgain: 'Try Again'
  },
  ru: {
    title: 'Оплата',
    amount: 'Сумма к оплате',
    processing: 'Обработка платежа...',
    openWallet: 'Открыть кошелек',
    payWith: 'Оплатить через',
    credit: 'Кредитная карта',
    bit: 'Bit',
    googlePay: 'Google Pay',
    loading: 'Загрузка кошелька...',
    error: 'Ошибка загрузки кошелька',
    paymentFailed: 'Платеж не прошел',
    tryAgain: 'Попробовать снова'
  },
  es: {
    title: 'Pago',
    amount: 'Monto a Pagar',
    processing: 'Procesando pago...',
    openWallet: 'Abrir Billetera',
    payWith: 'Pagar con',
    credit: 'Tarjeta de Crédito',
    bit: 'Bit',
    googlePay: 'Google Pay',
    loading: 'Cargando billetera...',
    error: 'Error al cargar billetera',
    paymentFailed: 'Pago fallido',
    tryAgain: 'Intentar de Nuevo'
  },
  fr: {
    title: 'Paiement',
    amount: 'Montant à Payer',
    processing: 'Traitement du paiement...',
    openWallet: 'Ouvrir le Portefeuille',
    payWith: 'Payer avec',
    credit: 'Carte de Crédit',
    bit: 'Bit',
    googlePay: 'Google Pay',
    loading: 'Chargement du portefeuille...',
    error: 'Erreur de chargement',
    paymentFailed: 'Paiement échoué',
    tryAgain: 'Réessayer'
  },
  de: {
    title: 'Zahlung',
    amount: 'Zu zahlender Betrag',
    processing: 'Zahlung wird verarbeitet...',
    openWallet: 'Wallet öffnen',
    payWith: 'Zahlen mit',
    credit: 'Kreditkarte',
    bit: 'Bit',
    googlePay: 'Google Pay',
    loading: 'Wallet wird geladen...',
    error: 'Fehler beim Laden',
    paymentFailed: 'Zahlung fehlgeschlagen',
    tryAgain: 'Erneut Versuchen'
  },
  it: {
    title: 'Pagamento',
    amount: 'Importo da Pagare',
    processing: 'Elaborazione pagamento...',
    openWallet: 'Apri Portafoglio',
    payWith: 'Paga con',
    credit: 'Carta di Credito',
    bit: 'Bit',
    googlePay: 'Google Pay',
    loading: 'Caricamento portafoglio...',
    error: 'Errore durante il caricamento',
    paymentFailed: 'Pagamento fallito',
    tryAgain: 'Riprova'
  }
};

const GrowPaymentForm = ({ 
  tripId, 
  participants, 
  userType, 
  groupInfo, 
  selectedDays, 
  memorialData, 
  vehicleInfo, 
  amount,
  onSuccess,
  customerName,
  customerEmail,
  customerPhone
}) => {
  const { language } = useLanguage();
  const t = translations[language] || translations.en;
  
  const [loading, setLoading] = useState(false);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [processToken, setProcessToken] = useState(null);

  useEffect(() => {
    // Load Grow SDK
    const script = document.createElement('script');
    // script.src = "https://meshulam.co.il/sdk/grow.js"; // Old URL causing 404/ORB issues
    script.src = "https://secure.meshulam.co.il/sdk/grow.js"; // Updated to secure domain matching API
    script.async = true;
    script.onload = () => {
      console.log('Grow SDK loaded');
      setSdkLoaded(true);
      if (window.growPayment) {
         // Step 2: Configure SDK
         // "הטמעת הגדרות הארנק והתאמתן לאתרכם, תחת הפונקציה ()configureGrowSdk"
         // This needs to be implemented based on specific design requirements
         // For now, we'll keep it default or minimal
      }
    };
    script.onerror = () => {
      console.error('Failed to load Grow SDK');
      toast.error(t.error);
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [t.error]);

  const handlePayment = async () => {
    // Check if we are in production
    const isProduction = window.location.hostname === 'groupyloopy.com' || window.location.hostname === 'groupyloopy.app';
    
    // Allow localhost for testing if we are sure the backend handles it (it does now via conditional logic)
    // But Grow API might still reject localhost referrer/origin if strict.
    // The backend sets successUrl to https://groupyloopy.com if localhost, so it might work.
    
    // User requested to open wallet, so we proceed.
    setLoading(true);

    // Check if browser is Chrome (required for Google Pay by Grow)
    const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);

    try {
      // Step 3: Create Payment Process (Server-side)
      const response = await base44.functions.invoke('createGrowPayment', {
        amount,
        tripId,
        participants,
        userType,
        groupInfo,
        selectedDays,
        memorialData,
        vehicleInfo,
        customerName,
        customerEmail,
        customerPhone,
        enableGooglePay: isChrome
      });

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to create payment');
      }

      const { processToken, processId, registrationId } = response.data;
      setProcessToken(processToken);

      // Step 4: Render Payment Options (Open Wallet)
      if (window.growPayment) {
        window.growPayment.renderPaymentOptions({
          processToken: processToken,
          selectorId: 'grow-payment-container', // Container ID
          onSuccess: async (result) => {
            console.log('Payment success:', result);
            
            try {
              // Approve transaction
              await base44.functions.invoke('approveGrowTransaction', {
                transactionId: result.data?.transactionId || result.transactionId,
                processId
              });

              toast.success(language === 'he' ? 'התשלום בוצע בהצלחה!' : 'Payment successful!');
              onSuccess({ registrationId, transactionId: result.data?.transactionId || result.transactionId });
            } catch (error) {
              console.error('Approve error:', error);
              toast.error(t.paymentFailed);
              setLoading(false);
            }
          },
          onError: (error) => {
            console.error('Payment error:', error);
            toast.error(t.paymentFailed);
            setLoading(false);
          },
          onCancel: () => {
            console.log('Payment cancelled');
            setLoading(false);
          }
        });
      } else {
        console.error('Grow SDK not loaded properly');
        toast.error(t.error);
        setLoading(false);
      }

    } catch (error) {
      console.error('Payment error:', error);
      let errorMessage = error.message || t.error;
      
      // Handle Axios error response
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      }
      
      toast.error(errorMessage);
      setLoading(false);
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

        {!processToken ? (
          <Button 
            onClick={handlePayment}
            disabled={loading || !sdkLoaded}
            className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {t.processing}
              </>
            ) : !sdkLoaded ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {t.loading}
              </>
            ) : (
              <>
                <Smartphone className="w-5 h-5 mr-2" />
                {t.openWallet}
              </>
            )}
          </Button>
        ) : (
          <div id="grow-payment-container" className="min-h-[300px]"></div>
        )}

        <div className="text-center text-sm text-gray-500">
          <div className="mb-2">{t.payWith}</div>
          <div className="flex justify-center gap-4">
            <div className="flex items-center gap-1">
              <CreditCard className="w-4 h-4" />
              <span>{t.credit}</span>
            </div>
            <div className="flex items-center gap-1">
              <Smartphone className="w-4 h-4" />
              <span>{t.bit}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>G</span>
              <span>{t.googlePay}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GrowPaymentForm;
