// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, Smartphone, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

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

  const handlePayment = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    
    setLoading(true);
    setError(null);

    try {
      if (!amount || !customerName || !customerPhone) {
        throw new Error('Missing payment details');
      }

      // קריאה לפונקציית Backend
      const response = await base44.functions.invoke('createGrowPayment', {
        sum: amount,
        fullName: customerName,
        phone: customerPhone,
        description: 'הרשמה לנפגשים בשביל ישראל'
      });
      
      console.log('Payment response:', response);

      if (!response.data.success || !response.data.url) {
        throw new Error(response.data.error || 'Failed to create payment');
      }

      // הפניה ישירות לדף התשלום של Meshulam
      window.location.href = response.data.url;

    } catch (error) {
      console.error('Payment error:', error);
      const errorMessage = error.message || (language === 'he' ? 'שגיאה בתשלום' : 'Payment error');
      setError(errorMessage);
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

        {error ? (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 text-center">
            <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <div className="text-red-700 font-semibold mb-2">{t.error}</div>
            <div className="text-sm text-red-600 mb-4">{error}</div>
            <Button 
              onClick={() => setError(null)}
              variant="outline"
              className="w-full"
            >
              {t.tryAgain}
            </Button>
          </div>
        ) : (
          <>
            <Button 
              type="button"
              onClick={handlePayment}
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {t.processing}
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5 mr-2" />
                  {t.payNow}
                </>
              )}
            </Button>

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
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default GrowPaymentForm;