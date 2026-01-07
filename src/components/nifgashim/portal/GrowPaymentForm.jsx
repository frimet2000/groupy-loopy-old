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
    error: 'Errore di caricamento',
    paymentFailed: 'Pagamento fallito',
    tryAgain: 'Riprova'
  }
};

export default function GrowPaymentForm({ 
  amount, 
  customerName, 
  customerEmail, 
  customerPhone, 
  registrationData,
  onSuccess 
}) {
  const { language } = useLanguage();
  const t = translations[language] || translations.en;
  const [loading, setLoading] = useState(false);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [processToken, setProcessToken] = useState(null);

  // Load Grow SDK
  useEffect(() => {
    // Only load in production
    const isProduction = window.location.hostname === 'groupyloopy.com' || window.location.hostname === 'groupyloopy.app';
    
    if (!isProduction) {
      console.log('Grow SDK skipped in development/preview');
      setSdkLoaded(true);
      return;
    }

    if (document.getElementById('grow-sdk')) {
      setSdkLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.id = 'grow-sdk';
    script.src = 'https://meshulam.co.il/sdk/grow.js';
    script.async = true;
    script.onload = () => {
      console.log('Grow SDK loaded successfully');
      setSdkLoaded(true);
    };
    script.onerror = (error) => {
      console.error('Failed to load Grow SDK:', error);
      setSdkLoaded(true); // Allow to proceed anyway
    };
    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById('grow-sdk');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  const handlePayment = async () => {
    const isProduction = window.location.hostname === 'groupyloopy.com' || window.location.hostname === 'groupyloopy.app';
    if (!isProduction) {
      toast.info(language === 'he' ? 'תשלומים זמינים רק בסביבת ייצור' : 'Payments are only available in production');
      return;
    }

    if (!sdkLoaded) {
      toast.error(t.loading);
      return;
    }

    setLoading(true);

    try {
      // Create payment process
      const response = await base44.functions.invoke('createGrowPayment', {
        amount,
        customerName,
        customerEmail,
        customerPhone,
        description: `רישום למסע נפגשים בשביל ישראל`,
        ...registrationData
      });

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to create payment');
      }

      const { processToken, processId, registrationId } = response.data;
      setProcessToken(processToken);

      // Configure and render Grow wallet
      if (window.growPayment) {
        window.growPayment.renderPaymentOptions({
          processToken,
          renderTo: 'grow-payment-container',
          lang: language === 'he' ? 'he' : 'en',
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
}