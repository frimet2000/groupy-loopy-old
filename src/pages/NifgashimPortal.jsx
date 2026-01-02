import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '../components/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Users, UserCheck, UsersRound, ArrowRight, ArrowLeft, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NifgashimUserTypeSelector from '../components/nifgashim/portal/UserTypeSelector';
import NifgashimParticipantForm from '../components/nifgashim/portal/ParticipantForm';
import NifgashimDayCardsSelector from '../components/nifgashim/portal/DayCardsSelector';
import NifgashimMemorialForm from '../components/nifgashim/portal/MemorialForm';
import NifgashimRegistrationSummary from '../components/nifgashim/portal/RegistrationSummary';

export default function NifgashimPortal() {
  const { language, isRTL } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const [userType, setUserType] = useState(null); // 'individual', 'family', 'group'
  const [participants, setParticipants] = useState([]);
  const [selectedDays, setSelectedDays] = useState([]);
  const [groupInfo, setGroupInfo] = useState({ name: '', leaderName: '', leaderEmail: '', leaderPhone: '' });
  const [memorialData, setMemorialData] = useState({ memorial: null });
  const [submitting, setSubmitting] = useState(false);

  const { data: nifgashimTrip, isLoading } = useQuery({
    queryKey: ['nifgashimPortalTrip'],
    queryFn: async () => {
      const trips = await base44.entities.Trip.filter({ 
        id: '6946647d7d7b248feaf1b118'
      });
      return trips[0];
    }
  });
  const trekDays = nifgashimTrip?.trek_days || [];
  const linkedDaysPairs = nifgashimTrip?.linked_days_pairs || [];

  const translations = {
    he: {
      title: "הרשמה למסע נפגשים בשביל ישראל",
      subtitle: "תהליך הרשמה פשוט ומהיר",
      stepUserType: "סוג רישום",
      stepParticipants: "פרטי משתתפים",
      stepDays: "בחירת ימים",
      stepMemorial: "הנצחה",
      stepSummary: "סיכום",
      next: "הבא",
      back: "אחורה",
      submit: "שלח הרשמה",
      submitting: "שולח..."
    },
    en: {
      title: "Nifgashim for Israel Registration",
      subtitle: "Simple and fast registration process",
      stepUserType: "Registration Type",
      stepParticipants: "Participant Details",
      stepDays: "Select Days",
      stepMemorial: "Memorial",
      stepSummary: "Summary",
      next: "Next",
      back: "Back",
      submit: "Submit Registration",
      submitting: "Submitting..."
    },
    ru: {
      title: "Регистрация Nifgashim для Израиля",
      subtitle: "Простой и быстрый процесс регистрации",
      stepUserType: "Тип регистрации",
      stepParticipants: "Данные участников",
      stepDays: "Выбор дней",
      stepMemorial: "Мемориал",
      stepSummary: "Резюме",
      next: "Далее",
      back: "Назад",
      submit: "Отправить регистрацию",
      submitting: "Отправка..."
    },
    es: {
      title: "Registro Nifgashim para Israel",
      subtitle: "Proceso de registro simple y rápido",
      stepUserType: "Tipo de registro",
      stepParticipants: "Detalles de participantes",
      stepDays: "Seleccionar días",
      stepMemorial: "Memorial",
      stepSummary: "Resumen",
      next: "Siguiente",
      back: "Atrás",
      submit: "Enviar registro",
      submitting: "Enviando..."
    },
    fr: {
      title: "Inscription Nifgashim pour Israël",
      subtitle: "Processus d'inscription simple et rapide",
      stepUserType: "Type d'inscription",
      stepParticipants: "Détails des participants",
      stepDays: "Sélectionner les jours",
      stepMemorial: "Mémorial",
      stepSummary: "Résumé",
      next: "Suivant",
      back: "Retour",
      submit: "Soumettre l'inscription",
      submitting: "Envoi..."
    },
    de: {
      title: "Nifgashim für Israel Registrierung",
      subtitle: "Einfacher und schneller Registrierungsprozess",
      stepUserType: "Registrierungstyp",
      stepParticipants: "Teilnehmerdetails",
      stepDays: "Tage auswählen",
      stepMemorial: "Gedenkstätte",
      stepSummary: "Zusammenfassung",
      next: "Weiter",
      back: "Zurück",
      submit: "Registrierung absenden",
      submitting: "Wird gesendet..."
    },
    it: {
      title: "Registrazione Nifgashim per Israele",
      subtitle: "Processo di registrazione semplice e veloce",
      stepUserType: "Tipo di registrazione",
      stepParticipants: "Dettagli partecipanti",
      stepDays: "Seleziona giorni",
      stepMemorial: "Memoriale",
      stepSummary: "Riepilogo",
      next: "Avanti",
      back: "Indietro",
      submit: "Invia registrazione",
      submitting: "Invio..."
    }
  };

  const trans = translations[language] || translations.en;

  const steps = [
    { id: 1, label: trans.stepUserType },
    { id: 2, label: trans.stepParticipants },
    { id: 3, label: trans.stepDays },
    { id: 4, label: trans.stepMemorial },
    { id: 5, label: trans.stepSummary }
  ];

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const user = await base44.auth.me().catch(() => null);
      
      // Prepare participant data for Trip entity
      const participantsData = participants.map(p => ({
        email: p.email || (user?.email || `temp-${Date.now()}@nifgashim.temp`),
        name: p.name,
        id_number: p.id_number,
        phone: p.phone,
        joined_at: new Date().toISOString(),
        selected_days: selectedDays.map(d => d.day_number),
        waiver_accepted: true,
        waiver_timestamp: new Date().toISOString(),
        is_organized_group: userType === 'group',
        group_type: userType === 'group' ? 'other' : null,
        group_name: userType === 'group' ? groupInfo.name : null,
        payment_status: userType === 'group' ? 'exempt' : 'pending'
      }));

      // Update Trip entity with new participants
      const currentParticipants = nifgashimTrip?.participants || [];
      await base44.entities.Trip.update(nifgashimTrip.id, {
        participants: [...currentParticipants, ...participantsData]
      });

      // Create Memorial request if provided
      if (memorialData.memorial?.fallen_name) {
        await base44.entities.Memorial.create({
          trip_id: nifgashimTrip.id,
          ...memorialData.memorial,
          status: 'pending'
        });
      }

      toast.success(language === 'he' ? 'ההרשמה נשלחה בהצלחה!' : 'Registration submitted successfully!');
      
      // Reset form
      setCurrentStep(1);
      setUserType(null);
      setParticipants([]);
      setSelectedDays([]);
      setGroupInfo({ name: '', leaderName: '', leaderEmail: '', leaderPhone: '' });
      setMemorialData({ memorial: null });
    } catch (error) {
      console.error(error);
      toast.error(language === 'he' ? 'שגיאה בשליחת ההרשמה' : 'Error submitting registration');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  const progressPercent = (currentStep / steps.length) * 100;

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 py-8 px-4 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{trans.title}</h1>
          <p className="text-gray-600">{trans.subtitle}</p>
        </motion.div>

        {/* Progress */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              {steps.map((step, idx) => (
                <React.Fragment key={step.id}>
                  <div className={`flex flex-col items-center gap-1 ${currentStep >= step.id ? 'opacity-100' : 'opacity-40'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      currentStep > step.id 
                        ? 'bg-green-500 text-white' 
                        : currentStep === step.id 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
                    </div>
                    <span className="text-xs font-semibold text-center hidden sm:block">
                      {step.label}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 rounded-full ${
                      currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
            <Progress value={progressPercent} className="h-2" />
          </CardContent>
        </Card>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === 1 && (
              <NifgashimUserTypeSelector
                selectedType={userType}
                onSelect={setUserType}
              />
            )}

            {currentStep === 2 && (
              <NifgashimParticipantForm
                userType={userType}
                participants={participants}
                setParticipants={setParticipants}
                groupInfo={groupInfo}
                setGroupInfo={setGroupInfo}
              />
            )}

            {currentStep === 3 && (
              <NifgashimDayCardsSelector
                trekDays={trekDays}
                linkedDaysPairs={linkedDaysPairs}
                selectedDays={selectedDays}
                onDaysChange={setSelectedDays}
                maxDays={8}
              />
            )}

            {currentStep === 4 && (
              <NifgashimMemorialForm
                formData={memorialData}
                setFormData={setMemorialData}
              />
            )}

            {currentStep === 5 && (
              <NifgashimRegistrationSummary
                userType={userType}
                participants={participants}
                selectedDays={selectedDays}
                trekDays={trekDays}
                groupInfo={groupInfo}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between gap-4 mt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(prev => Math.max(prev - 1, 1))}
            disabled={currentStep === 1 || submitting}
            className="px-6"
          >
            <ArrowLeft className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {trans.back}
          </Button>

          {currentStep < steps.length ? (
            <Button
              onClick={() => setCurrentStep(prev => prev + 1)}
              disabled={
                (currentStep === 1 && !userType) ||
                (currentStep === 2 && participants.length === 0) ||
                (currentStep === 3 && selectedDays.length === 0)
              }
              className="px-6 bg-blue-600 hover:bg-blue-700"
            >
              {trans.next}
              <ArrowRight className={`w-4 h-4 ${isRTL ? 'mr-2' : 'ml-2'}`} />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 bg-green-600 hover:bg-green-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  {trans.submitting}
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  {trans.submit}
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}