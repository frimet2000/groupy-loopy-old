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
    if (window.growPayment) {
      setSdkLoaded(true);
      return;
    }

    (function () {
      const s = document.createElement('script');
      s.type = 'text/javascript';
      s.async = true;
      s.src = 'https://cdn.meshulam.co.il/sdk/gs.min.js';
      s.onload = () => {
        if (window.growPayment) {
          const isProduction = window.location.hostname === 'groupyloopy.com' || window.location.hostname === 'groupyloopy.app';
          
          const config = {
            environment: isProduction ? 'PROD' : 'DEV',
            version: 1,
            events: {
              onSuccess: (response) => {
                console.log('Payment success:', response);
                toast.success(language === 'he' ? 'התשלום בוצע בהצלחה!' : 'Payment successful!');
                onSuccess(response);
              },
              onFailure: (response) => {
                console.error('Payment failure:', response);
                toast.error(t.paymentFailed);
                setLoading(false);
              },
              onError: (response) => {
                console.error('Payment error:', response);
                toast.error(t.paymentFailed);
                setLoading(false);
              },
              onWalletChange: (state) => {
                console.log('Wallet state:', state);
              }
            }
          };
          
          window.growPayment.init(config);
          setSdkLoaded(true);
        }
      };
      s.onerror = () => {
        console.error('Failed to load Grow SDK');
        toast.error(t.error);
      };
      const x = document.getElementsByTagName('script')[0];
      x.parentNode.insertBefore(s, x);
    })();
  }, [language, t.error, t.paymentFailed, onSuccess]);

  const handlePayment = async () => {
    if (!sdkLoaded) {
      toast.error(t.loading);
      return;
    }

    setLoading(true);

    const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);

    try {
      console.log('Sending payment request with:', {
        amount,
        tripId,
        participants: participants?.length || 0,
        userType,
        customerName,
        customerEmail,
        customerPhone
      });

      const response = await base44.functions.invoke('createGrowPayment', {
        amount,
        tripId: tripId || '',
        participants: participants || [],
        userType: userType || 'individual',
        groupInfo: groupInfo || {},
        selectedDays: selectedDays || [],
        memorialData: memorialData || {},
        vehicleInfo: vehicleInfo || {},
        customerName,
        customerEmail,
        customerPhone,
        enableGooglePay: isChrome
      });

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to create payment');
      }

      const { processToken } = response.data;
      setProcessToken(processToken);
      
      setTimeout(() => {
        window.growPayment.renderPaymentOptions(processToken);
      }, 500);

    } catch (error) {
      console.error('Payment error:', error);
      let errorMessage = error.message || t.error;
      
      if (error.response?.data?.error) {
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
          <div id="grow-payment-container" className="w-full min-h-[400px]"></div>
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