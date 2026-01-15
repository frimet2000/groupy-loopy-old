// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { useLanguage } from '../components/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Home, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function PaymentSuccess() {
  const { language, isRTL } = useLanguage();
  const [processing, setProcessing] = useState(true);

  const translations = {
    he: {
      title: "התשלום בוצע בהצלחה!",
      subtitle: "תודה על הרשמתך למסע נפגשים בשביל ישראל",
      message: "קיבלת אישור במייל עם כל הפרטים",
      home: "חזרה לדף הבית",
      processing: "מעבד את התשלום..."
    },
    en: {
      title: "Payment Successful!",
      subtitle: "Thank you for registering for Nifgashim Bishvil Israel",
      message: "You will receive a confirmation email with all the details",
      home: "Back to Home",
      processing: "Processing payment..."
    },
    ru: {
      title: "Оплата успешна!",
      subtitle: "Спасибо за регистрацию на Nifgashim",
      message: "Вы получите подтверждение по электронной почте",
      home: "На главную",
      processing: "Обработка платежа..."
    },
    es: {
      title: "¡Pago exitoso!",
      subtitle: "Gracias por registrarte en Nifgashim",
      message: "Recibirás un correo de confirmación",
      home: "Volver al inicio",
      processing: "Procesando pago..."
    },
    fr: {
      title: "Paiement réussi!",
      subtitle: "Merci pour votre inscription à Nifgashim",
      message: "Vous recevrez un email de confirmation",
      home: "Retour à l'accueil",
      processing: "Traitement du paiement..."
    },
    de: {
      title: "Zahlung erfolgreich!",
      subtitle: "Vielen Dank für Ihre Anmeldung bei Nifgashim",
      message: "Sie erhalten eine Bestätigungs-E-Mail",
      home: "Zurück zur Startseite",
      processing: "Zahlung wird verarbeitet..."
    },
    it: {
      title: "Pagamento riuscito!",
      subtitle: "Grazie per la registrazione a Nifgashim",
      message: "Riceverai un'email di conferma",
      home: "Torna alla home",
      processing: "Elaborazione pagamento..."
    }
  };

  const trans = translations[language] || translations.en;

  useEffect(() => {
    const completeRegistration = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const processId = urlParams.get('processId') || urlParams.get('cField1');
        
        // Get saved registration data
        const pendingRegId = localStorage.getItem('pending_registration_id');
        
        if (pendingRegId && processId) {
          // Update registration status to completed
          await base44.entities.NifgashimRegistration.update(pendingRegId, {
            status: 'completed',
            transaction_id: processId,
            completed_at: new Date().toISOString()
          });
          
          localStorage.removeItem('pending_registration_id');
          localStorage.removeItem('nifgashim_registration_state_v2');
        }
        
        setProcessing(false);
      } catch (error) {
        console.error('Error completing registration:', error);
        setProcessing(false);
      }
    };

    completeRegistration();
  }, []);

  if (processing) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 ${isRTL ? 'rtl' : 'ltr'}`}>
        <Card className="max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
            <p className="text-lg text-gray-600">{trans.processing}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 p-4 ${isRTL ? 'rtl' : 'ltr'}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="max-w-md mx-auto overflow-hidden">
          <CardContent className="p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                {trans.title}
              </h1>
              <p className="text-lg text-gray-600 mb-2">
                {trans.subtitle}
              </p>
              <p className="text-gray-500 mb-8">
                {trans.message}
              </p>

              <Link to={createPageUrl('Home')}>
                <Button className="bg-green-600 hover:bg-green-700 gap-2">
                  <Home className="w-4 h-4" />
                  {trans.home}
                </Button>
              </Link>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}