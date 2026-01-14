// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, Smartphone, ShieldAlert, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { toast } from 'sonner';

const translations = {
  he: {
    title: 'תשלום מאובטח',
    amount: 'סכום לתשלום',
    processing: 'מעביר לתשלום...',
    payNow: 'מעבר לתשלום',
    payWith: 'ניתן לשלם באמצעות',
    credit: 'כרטיס אשראי',
    bit: 'ביט',
    googlePay: 'Google Pay',
    error: 'שגיאה',
    paymentFailed: 'התשלום נכשל',
    tryAgain: 'נסה שוב',
    redirecting: 'מועבר לדף התשלום המאובטח...',
    secureNote: 'התשלום יתבצע בדף מאובטח של Meshulam'
  },
  en: {
    title: 'Secure Payment',
    amount: 'Amount to Pay',
    processing: 'Redirecting to payment...',
    payNow: 'Proceed to Payment',
    payWith: 'Pay securely with',
    credit: 'Credit Card',
    bit: 'Bit',
    googlePay: 'Google Pay',
    error: 'Error',
    paymentFailed: 'Payment failed',
    tryAgain: 'Try Again',
    redirecting: 'Redirecting to secure payment page...',
    secureNote: 'Payment will be processed on Meshulam secure page'
  }
};

const GrowPaymentForm = ({ 
  amount,
  onSuccess, // Note: onSuccess won't be called directly here as the user leaves the site
  customerName,
  customerEmail,
  customerPhone
}) => {
  const { language } = useLanguage();
  const t = translations[language] || translations.en;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePayment = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    
    setLoading(true);
    setError(null);

    try {
      if (!amount) throw new Error('Missing payment amount');

      toast.info(t.redirecting);
      
      // Construct the Direct URL with the sum parameter
      // Page Code: 30f1b9975952
      const baseUrl = 'https://meshulam.co.il/purchase/30f1b9975952';
      const redirectUrl = `${baseUrl}?sum=${amount}`;
      
      console.log('Redirecting to Meshulam:', redirectUrl);
      
      // Redirect the user
      window.location.href = redirectUrl;

    } catch (error) {
      console.error('Payment redirection error:', error);
      const errorMessage = error.message || (language === 'he' ? 'שגיאה בהפניה לתשלום' : 'Payment redirection error');
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

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
            <ExternalLink className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700">
                {t.secureNote}
            </div>
        </div>

        {error ? (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 text-center">
            <ShieldAlert className="w-8 h-8 text-red-600 mx-auto mb-2" />
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
                  <ExternalLink className="w-5 h-5 mr-2" />
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
                 <div className="flex items-center gap-1">
                  <span>Google Pay</span>
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
