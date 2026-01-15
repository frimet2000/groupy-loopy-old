// @ts-nocheck
import React, { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

const translations = {
  he: {
    loading: 'טוען דף התשלום...',
    success: 'התשלום בוצע בהצלחה',
    failed: 'התשלום נכשל, אנא נסה שוב',
    error: 'שגיאה בתהליך התשלום',
    timeout: 'פעולת התשלום הזמן פג'
  },
  en: {
    loading: 'Loading payment form...',
    success: 'Payment completed successfully',
    failed: 'Payment failed, please try again',
    error: 'Payment error',
    timeout: 'Payment timeout'
  },
  ru: {
    loading: 'Загрузка формы платежа...',
    success: 'Платеж успешно завершен',
    failed: 'Платеж не удался, пожалуйста, попробуйте снова',
    error: 'Ошибка платежа',
    timeout: 'Время ожидания платежа истекло'
  },
  es: {
    loading: 'Cargando formulario de pago...',
    success: 'Pago completado con éxito',
    failed: 'El pago falló, por favor intente de nuevo',
    error: 'Error de pago',
    timeout: 'Tiempo de espera de pago agotado'
  },
  fr: {
    loading: 'Chargement du formulaire de paiement...',
    success: 'Paiement complété avec succès',
    failed: 'Le paiement a échoué, veuillez réessayer',
    error: 'Erreur de paiement',
    timeout: 'Délai d\'attente du paiement dépassé'
  },
  de: {
    loading: 'Zahlungsformular wird geladen...',
    success: 'Zahlung erfolgreich abgeschlossen',
    failed: 'Zahlung fehlgeschlagen, bitte versuchen Sie es erneut',
    error: 'Zahlungsfehler',
    timeout: 'Zahlungs-Timeout'
  },
  it: {
    loading: 'Caricamento del modulo di pagamento...',
    success: 'Pagamento completato con successo',
    failed: 'Pagamento non riuscito, riprovare',
    error: 'Errore di pagamento',
    timeout: 'Timeout di pagamento'
  }
};

const getLang = (lang) => {
  const supported = Object.keys(translations);
  return supported.includes(lang) ? lang : 'en';
};

export default function GrowPaymentForm({ authCode, language }) {
  const containerRef = useRef(null);
  const lang = getLang(language);
  const t = translations[lang];

  useEffect(() => {
    if (!authCode || !containerRef.current) return;

    let isMounted = true;

    const initializeGrowPayment = async () => {
      try {
        // Wait for SDK to be available
        const maxAttempts = 10;
        let attempts = 0;
        
        while (!window.growPayment && attempts < maxAttempts && isMounted) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }

        if (!window.growPayment || !isMounted) {
          console.error('Grow SDK not available after waiting');
          alert(t.error);
          return;
        }

        const config = {
          environment: 'DEV',
          version: 1,
          events: {
            onSuccess: (response) => {
              console.log('Payment success:', response);
              if (isMounted) {
                window.location.href = `${window.location.origin}${window.location.pathname}?payment_success=true`;
              }
            },
            onFailure: (response) => {
              console.error('Payment failure:', response);
              if (isMounted) alert(t.failed);
            },
            onError: (response) => {
              console.error('Payment error:', response);
              if (isMounted) alert(t.error);
            },
            onTimeout: () => {
              console.error('Payment timeout');
              if (isMounted) alert(t.timeout);
            },
            onWalletChange: (state) => {
              console.log('Wallet changed:', state);
            },
            onPaymentStart: () => {
              console.log('Payment started');
            },
            onPaymentCancel: () => {
              console.log('Payment cancelled');
            }
          }
        };

        window.growPayment.init(config);
        window.growPayment.renderPaymentOptions(authCode);
      } catch (error) {
        console.error('Failed to initialize Grow payment:', error);
        if (isMounted) alert(t.error);
      }
    };

    // Load Grow SDK
    const script = document.createElement('script');
    script.src = 'https://cdn.meshulam.co.il/sdk/gs.min.js';
    script.async = true;
    script.onload = initializeGrowPayment;
    script.onerror = () => {
      console.error('Failed to load Grow SDK script');
      if (isMounted) alert(t.error);
    };
    document.body.appendChild(script);

    return () => {
      isMounted = false;
      if (script.parentNode) {
        document.body.removeChild(script);
      }
    };
  }, [authCode, lang, t]);

  return (
    <div className="w-full space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          <p className="text-blue-700 font-medium">
            {t.loading}
          </p>
        </div>
      </div>
      <div 
        ref={containerRef}
        id="grow-payment-container" 
        className="w-full min-h-[500px] sm:min-h-[600px] bg-white rounded-lg border border-gray-200"
      />
    </div>
  );
}