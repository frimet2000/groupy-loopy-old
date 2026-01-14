// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, Smartphone, AlertCircle, ShieldAlert } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

const translations = {
  he: {
    title: 'תשלום מאובטח',
    amount: 'סכום לתשלום',
    processing: 'מעבד תשלום...',
    payNow: 'שלם עכשיו',
    payWith: 'שלם באמצעות',
    credit: 'כרטיס אשראי',
    bit: 'ביט',
    googlePay: 'Google Pay',
    error: 'שגיאה',
    paymentFailed: 'התשלום נכשל',
    tryAgain: 'נסה שוב',
    invalidPhone: 'נא להזין מספר טלפון ישראלי תקין (05... - 10 ספרות)',
    invalidName: 'נא להזין שם מלא (פרטי ומשפחה)',
    chromeRequired: 'לתשלום ב-Google Pay יש להשתמש בדפדפן Chrome בלבד',
    browserWarning: 'דפדפן זה אינו נתמך לתשלום ב-Google Pay',
    initializing: 'מאתחל מערכת תשלומים...'
  },
  en: {
    title: 'Secure Payment',
    amount: 'Amount to Pay',
    processing: 'Processing payment...',
    payNow: 'Pay Now',
    payWith: 'Pay with',
    credit: 'Credit Card',
    bit: 'Bit',
    googlePay: 'Google Pay',
    error: 'Error',
    paymentFailed: 'Payment failed',
    tryAgain: 'Try Again',
    invalidPhone: 'Please enter a valid Israeli phone number (05... - 10 digits)',
    invalidName: 'Please enter full name (First and Last)',
    chromeRequired: 'For Google Pay, please use Chrome browser only',
    browserWarning: 'This browser is not supported for Google Pay',
    initializing: 'Initializing payment system...'
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
  const { language } = useLanguage();
  const t = translations[language] || translations.en;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [isChrome, setIsChrome] = useState(true);

  // Check browser on mount
  useEffect(() => {
    const isChromeBrowser = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    setIsChrome(isChromeBrowser);
  }, []);

  // Load Grow SDK (Removed for Redirect Mode)
  // useEffect(() => { ... }, []);

  const validateForm = () => {
    // Validation removed as user will fill details on Grow page
    return true;
  };

  const handleTransactionApproval = async (transactionData) => {
     // Transaction approval will be handled via server-side callback or success page redirect
     // But if we are redirected back here with params, we might need it.
     // For now, in Redirect Mode, the user leaves the site.
  };

  const handlePayment = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    
    // Check Google Pay restriction
    // If user explicitly wants Google Pay, they must be on Chrome.
    if (!isChrome) {
        toast.warning(t.chromeRequired);
    }

    setLoading(true);
    setError(null);

    try {
      if (!amount) throw new Error('Missing payment details');

      // 1. Call Backend to Create Payment Process
      const response = await base44.functions.invoke('createGrowPayment', {
        sum: amount,
        fullName: customerName, // Optional, might be empty
        phone: customerPhone,   // Optional, might be empty
        description: 'הרשמה לנפגשים בשביל ישראל',
        email: customerEmail
      });
      
      console.log('Create Payment response:', response);

      if (!response.data.success || !response.data.url) {
        throw new Error(response.data.error || 'Failed to create payment process');
      }

      // 2. Redirect to Grow Payment Page
      console.log('Redirecting to Grow URL:', response.data.url);
      window.location.href = response.data.url;

    } catch (error) {
      console.error('Payment initiation error:', error);
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

        {!isChrome && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                <ShieldAlert className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-700">
                    {t.chromeRequired}
                </div>
            </div>
        )}

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
                  {t.initializing}
                 </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5 mr-2" />
                  {t.payNow}
                </>
              )}
            </Button>
            
            {/* The Grow SDK might render elements here or in a modal. 
                We ensure there's a container if needed, though usually it opens a modal. */}
            <div id="grow-payment-container"></div>

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
