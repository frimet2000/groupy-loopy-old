import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguage } from '../components/LanguageContext';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { motion } from 'framer-motion';
import { 
  Users, Heart, MapPin, Car, Activity, ChevronRight, ChevronLeft, 
  CheckCircle2, Loader2, Accessibility, Plus, X, User, Upload, Camera, Globe, FileText
} from 'lucide-react';
import { getCountryRegions, getAllCountries } from '../components/utils/CountryRegions';

const interests = ['nature', 'history', 'photography', 'birdwatching', 'archaeology', 'geology', 'botany', 'extreme_sports', 'family_friendly', 'romantic'];
const relations = ['self', 'spouse', 'boy', 'girl', 'parent', 'sibling', 'friend', 'dog'];

export default function Onboarding() {
  const { t, language, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const totalSteps = 6;
  
  const getDefaultCountry = () => {
    switch (language) {
      case 'fr': return 'france';
      case 'es': return 'spain';
      case 'en': return 'uk';
      case 'ru': return 'russia';
      case 'it': return 'italy';
      case 'de': return 'germany';
      default: return 'israel';
    }
  };

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    profile_image: '',
    parent_age_range: '',
    has_spouse: false,
    spouse_age_range: '',
    children_age_ranges: [],
    fitness_level: 'moderate',
    accessibility_needs: [],
    preferred_interests: [],
    home_country: getDefaultCountry(),
    home_region: '',
    vehicle_type: 'none',
    travels_with_dog: false,
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleInterest = (interest) => {
    setFormData(prev => ({
      ...prev,
      preferred_interests: prev.preferred_interests.includes(interest)
        ? prev.preferred_interests.filter(i => i !== interest)
        : [...prev.preferred_interests, interest]
    }));
  };

  const toggleAccessibility = (type) => {
    setFormData(prev => ({
      ...prev,
      accessibility_needs: prev.accessibility_needs.includes(type)
        ? prev.accessibility_needs.filter(t => t !== type)
        : [...prev.accessibility_needs, type]
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      handleChange('profile_image', file_url);
      toast.success(language === 'he' ? 'התמונה הועלתה' : 'Image uploaded');
    } catch (error) {
      toast.error(language === 'he' ? 'שגיאה בהעלאת התמונה' : 'Error uploading image');
    }
    setImageUploading(false);
  };

  const handleNext = () => {
    if (step === 0 && (!formData.first_name || !formData.last_name)) {
      toast.error(language === 'he' ? 'נא למלא שם פרטי ושם משפחה' : 'Please fill in first and last name');
      return;
    }
    if (step < totalSteps - 1) {
      setStep(step + 1);
    }
  };

  const handleSkipToEnd = () => {
    if (!acceptedTerms) {
      toast.error(
        language === 'he' ? 'יש לאשר את תנאי השימוש' :
        language === 'ru' ? 'Необходимо принять условия использования' :
        language === 'es' ? 'Debes aceptar los Términos de uso' :
        language === 'fr' ? "Vous devez accepter les conditions d'utilisation" :
        language === 'de' ? 'Sie müssen die Nutzungsbedingungen akzeptieren' :
        language === 'it' ? "Devi accettare i Termini d'uso" :
        'You must accept the Terms of Use'
      );
      setStep(totalSteps - 1);
      return;
    }
    handleSubmit();
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (!acceptedTerms) {
      toast.error(
        language === 'he' ? 'יש לאשר את תנאי השימוש' :
        language === 'ru' ? 'Необходимо принять условия использования' :
        language === 'es' ? 'Debes aceptar los Términos de uso' :
        language === 'fr' ? "Vous devez accepter les conditions d'utilisation" :
        language === 'de' ? 'Sie müssen die Nutzungsbedingungen akzeptieren' :
        language === 'it' ? "Devi accettare i Termini d'uso" :
        'You must accept the Terms of Use'
      );
      setStep(totalSteps - 1);
      return;
    }
    setLoading(true);
    try {
      const fullName = `${formData.first_name} ${formData.last_name}`.trim();
      await base44.auth.updateMe({
        ...formData,
        full_name: fullName,
        profile_completed: true,
        terms_accepted: true,
        terms_accepted_date: new Date().toISOString()
      });

      // Mark first login as completed for PWA install prompt
      localStorage.setItem('first_login_completed', 'true');

      toast.success(language === 'he' ? 'הפרופיל נשמר בהצלחה!' : 'Profile saved successfully!');
      setCompleted(true);
    } catch (error) {
      toast.error(language === 'he' ? 'שגיאה בשמירת הפרופיל' : 'Error saving profile');
    }
    setLoading(false);
  };

  const progress = ((step + 1) / totalSteps) * 100;

  if (completed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 py-8 px-4 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl w-full"
        >
          <Card className="border-0 shadow-2xl">
            <CardContent className="p-8 text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-full mb-4 shadow-lg shadow-emerald-500/30">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              
              <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  {language === 'he' ? 'מעולה! הפרופיל שלך מוכן 🎉' : language === 'ru' ? 'Отлично! Профиль готов 🎉' : language === 'es' ? '¡Genial! Tu perfil está listo 🎉' : language === 'fr' ? 'Super! Votre profil est prêt 🎉' : language === 'de' ? 'Toll! Ihr Profil ist fertig 🎉' : language === 'it' ? 'Fantastico! Il tuo profilo è pronto 🎉' : 'Great! Your profile is ready 🎉'}
                </h1>
                <p className="text-lg text-gray-600">
                  {language === 'he' 
                    ? 'עכשיו הגיע הזמן למצוא שותפים לטיול הבא שלך'
                    : language === 'ru' ? 'Теперь найдите партнеров для следующей поездки'
                    : language === 'es' ? 'Ahora encuentra compañeros para tu próximo viaje'
                    : language === 'fr' ? 'Trouvez maintenant des partenaires pour votre prochain voyage'
                    : language === 'de' ? 'Finden Sie jetzt Partner für Ihre nächste Reise'
                    : language === 'it' ? 'Ora trova compagni per il tuo prossimo viaggio'
                    : 'Now it\'s time to find partners for your next trip'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <Button
                  onClick={() => navigate(createPageUrl('Home'))}
                  size="lg"
                  variant="outline"
                  className="h-auto py-6 flex flex-col gap-2 border-2 hover:border-emerald-500 hover:bg-emerald-50"
                >
                  <Users className="w-8 h-8 text-emerald-600" />
                  <div className="space-y-1">
                    <div className="font-bold text-base">
                      {language === 'he' ? 'הצטרף לטיול קיים' : language === 'ru' ? 'Присоединиться к поездке' : language === 'es' ? 'Unirse a viaje' : language === 'fr' ? 'Rejoindre un voyage' : language === 'de' ? 'Reise beitreten' : language === 'it' ? 'Unisciti a viaggio' : 'Join Existing Trip'}
                    </div>
                    <div className="text-xs text-gray-500 font-normal">
                      {language === 'he' ? 'מצא קבוצה שמתכננת טיול' : language === 'ru' ? 'Найти группу для поездки' : language === 'es' ? 'Encuentra grupo para viaje' : language === 'fr' ? 'Trouver un groupe' : language === 'de' ? 'Gruppe finden' : language === 'it' ? 'Trova gruppo per viaggio' : 'Find a group planning a trip'}
                    </div>
                  </div>
                </Button>

                <Button
                  onClick={() => navigate(createPageUrl('CreateTrip'))}
                  size="lg"
                  className="h-auto py-6 flex flex-col gap-2 bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
                >
                  <Plus className="w-8 h-8" />
                  <div className="space-y-1">
                    <div className="font-bold text-base">
                      {language === 'he' ? 'צור טיול חדש' : language === 'ru' ? 'Создать поездку' : language === 'es' ? 'Crear viaje' : language === 'fr' ? 'Créer voyage' : language === 'de' ? 'Reise erstellen' : language === 'it' ? 'Crea viaggio' : 'Create New Trip'}
                    </div>
                    <div className="text-xs text-emerald-100 font-normal">
                      {language === 'he' ? 'הזמן אחרים להצטרף אליך' : language === 'ru' ? 'Пригласить других' : language === 'es' ? 'Invita a otros' : language === 'fr' ? 'Inviter d\'autres' : language === 'de' ? 'Andere einladen' : language === 'it' ? 'Invita altri' : 'Invite others to join you'}
                    </div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl mb-4 shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              {language === 'he' ? 'ברוכים הבאים!' : language === 'ru' ? 'Добро пожаловать!' : language === 'es' ? '¡Bienvenido!' : language === 'fr' ? 'Bienvenue!' : language === 'de' ? 'Willkommen!' : language === 'it' ? 'Benvenuto!' : 'Welcome!'}
            </h1>
            <p className="text-gray-500 text-lg">
              {language === 'he' 
                ? 'בואו נכיר אתכם טוב יותר כדי להמליץ על הטיולים המושלמים עבורכם'
                : language === 'ru' ? 'Давайте узнаем вас лучше, чтобы рекомендовать идеальные поездки'
                : language === 'es' ? 'Conozcámonos mejor para recomendar viajes perfectos'
                : language === 'fr' ? 'Apprenons à mieux vous connaître pour recommander des voyages parfaits'
                : language === 'de' ? 'Lernen wir Sie besser kennen, um perfekte Reisen zu empfehlen'
                : language === 'it' ? 'Conosciamoci meglio per consigliare viaggi perfetti'
                : "Let's get to know you better to recommend perfect trips"}
            </p>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">
                {language === 'he' ? 'התקדמות' : language === 'ru' ? 'Прогресс' : language === 'es' ? 'Progreso' : language === 'fr' ? 'Progrès' : language === 'de' ? 'Fortschritt' : language === 'it' ? 'Progresso' : 'Progress'}
              </span>
              <span className="text-sm font-medium text-emerald-600">
                {step + 1}/{totalSteps}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Steps */}
          <Card className="border-0 shadow-xl">
            <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    {step === 0 && <User className="w-6 h-6 text-indigo-600" />}
                    {step === 1 && <Users className="w-6 h-6 text-blue-600" />}
                    {step === 2 && <Activity className="w-6 h-6 text-emerald-600" />}
                    {step === 3 && <Heart className="w-6 h-6 text-rose-600" />}
                    {step === 4 && <MapPin className="w-6 h-6 text-purple-600" />}
                    {step === 5 && <FileText className="w-6 h-6 text-gray-700" />}

                    {step === 0 && (language === 'he' ? 'פרטים אישיים' : language === 'ru' ? 'Личные данные' : language === 'es' ? 'Datos personales' : language === 'fr' ? 'Détails personnels' : language === 'de' ? 'Persönliche Daten' : language === 'it' ? 'Dati personali' : 'Personal Details')}
                    {step === 1 && (language === 'he' ? 'פרטי משפחה' : language === 'ru' ? 'Семья' : language === 'es' ? 'Familia' : language === 'fr' ? 'Famille' : language === 'de' ? 'Familie' : language === 'it' ? 'Famiglia' : 'Family Details')}
                    {step === 2 && (language === 'he' ? 'רמת כושר ונגישות' : language === 'ru' ? 'Фитнес и доступность' : language === 'es' ? 'Condición física y accesibilidad' : language === 'fr' ? 'Condition physique et accessibilité' : language === 'de' ? 'Fitness & Barrierefreiheit' : language === 'it' ? 'Fitness e accessibilità' : 'Fitness & Accessibility')}
                    {step === 3 && (language === 'he' ? 'תחומי עניין' : language === 'ru' ? 'Интересы' : language === 'es' ? 'Intereses' : language === 'fr' ? 'Intérêts' : language === 'de' ? 'Interessen' : language === 'it' ? 'Interessi' : 'Interests')}
                    {step === 4 && (language === 'he' ? 'מיקום ורכב' : language === 'ru' ? 'Местоположение и транспорт' : language === 'es' ? 'Ubicación y vehículo' : language === 'fr' ? 'Localisation et véhicule' : language === 'de' ? 'Standort & Fahrzeug' : language === 'it' ? 'Posizione e veicolo' : 'Location & Vehicle')}
                    {step === 5 && (language === 'he' ? 'תנאי שימוש' : language === 'ru' ? 'Условия использования' : language === 'es' ? 'Términos de uso' : language === 'fr' ? "Conditions d'utilisation" : language === 'de' ? 'Nutzungsbedingungen' : language === 'it' ? "Termini d'uso" : 'Legal & Terms')}
                  </CardTitle>
                  <CardDescription>
                    {step === 0 && (language === 'he' ? 'איך נקרא לך?' : language === 'ru' ? 'Как вас зовут?' : language === 'es' ? '¿Cómo te llamamos?' : language === 'fr' ? 'Comment vous appeler?' : language === 'de' ? 'Wie sollen wir Sie nennen?' : language === 'it' ? 'Come ti chiamiamo?' : 'What should we call you?')}
                    {step === 1 && (language === 'he' ? 'פרטי בני משפחה (אופציונלי)' : language === 'ru' ? 'Семья (необязательно)' : language === 'es' ? 'Familia (opcional)' : language === 'fr' ? 'Famille (optionnel)' : language === 'de' ? 'Familie (optional)' : language === 'it' ? 'Famiglia (opzionale)' : 'Family details (optional)')}
                    {step === 2 && (language === 'he' ? 'מה רמת הכושר הפיזי ודרישות הנגישות?' : language === 'ru' ? 'Уровень физподготовки и потребности?' : language === 'es' ? '¿Tu nivel físico y necesidades?' : language === 'fr' ? 'Votre niveau physique et besoins?' : language === 'de' ? 'Ihr Fitnesslevel und Bedürfnisse?' : language === 'it' ? 'Il tuo livello fisico e necessità?' : 'What is your fitness level and accessibility needs?')}
                    {step === 3 && (language === 'he' ? 'מה מעניין אתכם בטיולים?' : language === 'ru' ? 'Что вас интересует?' : language === 'es' ? '¿Qué te interesa?' : language === 'fr' ? 'Qu\'est-ce qui vous intéresse?' : language === 'de' ? 'Was interessiert Sie?' : language === 'it' ? 'Cosa ti interessa?' : 'What interests you in trips?')}
                    {step === 4 && (language === 'he' ? 'איפה אתם גרים ואיזה רכב יש לכם?' : language === 'ru' ? 'Где вы живете и какое авто?' : language === 'es' ? '¿Dónde vives y qué vehículo tienes?' : language === 'fr' ? 'Où vivez-vous et quel véhicule?' : language === 'de' ? 'Wo leben Sie und welches Fahrzeug?' : language === 'it' ? 'Dove vivi e che veicolo hai?' : 'Where do you live and what vehicle do you have?')}
                    {step === 5 && (language === 'he' ? 'קראו ואשרו את תנאי השימוש' : language === 'ru' ? 'Прочтите и примите условия использования' : language === 'es' ? 'Lee y acepta los Términos de uso' : language === 'fr' ? 'Lisez et acceptez les conditions d\'utilisation' : language === 'de' ? 'Lesen und akzeptieren Sie die Nutzungsbedingungen' : language === 'it' ? 'Leggi e accetta i Termini d\'uso' : 'Read and accept the Terms of Use')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  {/* Step 0: Personal Details */}
                  {step === 0 && (
                    <div className="space-y-6">
                      {/* Profile Image */}
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                          {formData.profile_image ? (
                            <img 
                              src={formData.profile_image} 
                              alt="Profile" 
                              className="w-32 h-32 rounded-full object-cover border-4 border-indigo-100"
                            />
                          ) : (
                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center border-4 border-indigo-100">
                              <Camera className="w-12 h-12 text-indigo-400" />
                            </div>
                          )}
                          <label className="absolute bottom-0 right-0 cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                            <div className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center shadow-lg transition-all">
                              {imageUploading ? (
                                <Loader2 className="w-5 h-5 text-white animate-spin" />
                              ) : (
                                <Upload className="w-5 h-5 text-white" />
                              )}
                            </div>
                          </label>
                        </div>
                        <p className="text-sm text-gray-500 text-center">
                          {language === 'he' 
                            ? 'הוסף תמונת פרופיל (אופציונלי)'
                            : language === 'ru' ? 'Добавить фото (необязательно)'
                            : language === 'es' ? 'Añadir foto (opcional)'
                            : language === 'fr' ? 'Ajouter une photo (optionnel)'
                            : language === 'de' ? 'Foto hinzufügen (optional)'
                            : language === 'it' ? 'Aggiungi foto (opzionale)'
                            : 'Add profile photo (optional)'}
                        </p>
                      </div>

                      {/* Name Fields */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-base font-semibold flex items-center gap-2">
                            {language === 'he' ? 'שם פרטי' : language === 'ru' ? 'Имя' : language === 'es' ? 'Nombre' : language === 'fr' ? 'Prénom' : language === 'de' ? 'Vorname' : language === 'it' ? 'Nome' : 'First Name'}
                            <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            value={formData.first_name}
                            onChange={(e) => handleChange('first_name', e.target.value)}
                            className="h-12 text-lg"
                            dir={language === 'he' ? 'rtl' : 'ltr'}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-base font-semibold flex items-center gap-2">
                            {language === 'he' ? 'שם משפחה' : language === 'ru' ? 'Фамилия' : language === 'es' ? 'Apellido' : language === 'fr' ? 'Nom' : language === 'de' ? 'Nachname' : language === 'it' ? 'Cognome' : 'Last Name'}
                            <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            value={formData.last_name}
                            onChange={(e) => handleChange('last_name', e.target.value)}
                            className="h-12 text-lg"
                            dir={language === 'he' ? 'rtl' : 'ltr'}
                          />
                        </div>

                        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mt-4">
                          <p className="text-sm text-indigo-800 leading-relaxed">
                            💡 {language === 'he' 
                              ? 'השם הזה יוצג למשתתפים אחרים בטיולים ויעזור להם להכיר אותך'
                              : language === 'ru' ? 'Это имя увидят другие участники поездок'
                              : language === 'es' ? 'Este nombre lo verán otros participantes en viajes'
                              : language === 'fr' ? 'Ce nom sera affiché aux autres participants'
                              : language === 'de' ? 'Dieser Name wird anderen Teilnehmern angezeigt'
                              : language === 'it' ? 'Questo nome sarà visibile agli altri partecipanti'
                              : 'This name will be shown to other participants on trips and help them get to know you'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 1: Family */}
                  {step === 1 && (
                    <div className="space-y-6">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                          ℹ️ {language === 'he' 
                            ? 'כל השדות אופציונליים - תוכל להשלים מאוחר יותר בפרופיל'
                            : language === 'ru' ? 'Все поля необязательны - можно заполнить позже'
                            : language === 'es' ? 'Todos los campos son opcionales - puedes completarlos después'
                            : language === 'fr' ? 'Tous les champs sont optionnels - à compléter plus tard'
                            : language === 'de' ? 'Alle Felder sind optional - später ausfüllbar'
                            : language === 'it' ? 'Tutti i campi sono opzionali - completabili dopo'
                            : 'All fields are optional - you can complete them later in your profile'}
                        </p>
                      </div>

                      {/* My Age Range */}
                      <div className="space-y-2">
                        <Label className="text-sm">
                          {language === 'he' ? 'קבוצת הגיל שלי' : language === 'ru' ? 'Мой возраст' : language === 'es' ? 'Mi edad' : language === 'fr' ? 'Mon âge' : language === 'de' ? 'Mein Alter' : language === 'it' ? 'La mia età' : 'My Age Range'}
                        </Label>
                        <Select
                          value={formData.parent_age_range}
                          onValueChange={(v) => handleChange('parent_age_range', v)}
                        >
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder={language === 'he' ? 'בחר קבוצת גיל' : language === 'ru' ? 'Выберите возраст' : language === 'es' ? 'Selecciona edad' : language === 'fr' ? 'Sélectionnez l\'âge' : language === 'de' ? 'Alter wählen' : language === 'it' ? 'Seleziona età' : 'Select age range'} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="18-25">18-25</SelectItem>
                            <SelectItem value="26-35">26-35</SelectItem>
                            <SelectItem value="36-45">36-45</SelectItem>
                            <SelectItem value="46-55">46-55</SelectItem>
                            <SelectItem value="56-65">56-65</SelectItem>
                            <SelectItem value="65+">65+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Spouse Checkbox */}
                      <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                        <Label className="cursor-pointer mb-0">
                          {language === 'he' ? 'יש לי בן/בת זוג' : language === 'ru' ? 'У меня есть партнер' : language === 'es' ? 'Tengo pareja' : language === 'fr' ? 'J\'ai un(e) conjoint(e)' : language === 'de' ? 'Ich habe einen Partner' : language === 'it' ? 'Ho un partner' : 'I have a spouse'}
                        </Label>
                        <Switch
                          checked={formData.has_spouse}
                          onCheckedChange={(checked) => handleChange('has_spouse', checked)}
                        />
                      </div>

                      {/* Spouse Age Range - Only shown if has_spouse is true */}
                      {formData.has_spouse && (
                        <div className="space-y-2">
                          <Label className="text-sm">
                            {language === 'he' ? 'קבוצת גיל בן/בת זוג' : language === 'ru' ? 'Возраст партнера' : language === 'es' ? 'Edad de pareja' : language === 'fr' ? 'Âge du conjoint' : language === 'de' ? 'Alter des Partners' : language === 'it' ? 'Età del partner' : 'Spouse Age Range'}
                          </Label>
                          <Select
                            value={formData.spouse_age_range}
                            onValueChange={(v) => handleChange('spouse_age_range', v)}
                          >
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder={language === 'he' ? 'בחר קבוצת גיל' : language === 'ru' ? 'Выберите возраст' : language === 'es' ? 'Selecciona edad' : language === 'fr' ? 'Sélectionnez l\'âge' : language === 'de' ? 'Alter wählen' : language === 'it' ? 'Seleziona età' : 'Select age range'} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="18-25">18-25</SelectItem>
                              <SelectItem value="26-35">26-35</SelectItem>
                              <SelectItem value="36-45">36-45</SelectItem>
                              <SelectItem value="46-55">46-55</SelectItem>
                              <SelectItem value="56-65">56-65</SelectItem>
                              <SelectItem value="65+">65+</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {/* Children */}
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold">
                          {language === 'he' ? 'ילדים' : language === 'ru' ? 'Дети' : language === 'es' ? 'Niños' : language === 'fr' ? 'Enfants' : language === 'de' ? 'Kinder' : language === 'it' ? 'Bambini' : 'Children'}
                        </Label>
                        {formData.children_age_ranges.map((child, idx) => (
                          <div key={child.id} className="bg-pink-50 p-4 rounded-lg border border-pink-200 space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div className="space-y-1">
                                <Label className="text-xs">
                                  {language === 'he' ? 'שם' : language === 'ru' ? 'Имя' : language === 'es' ? 'Nombre' : language === 'fr' ? 'Nom' : language === 'de' ? 'Name' : language === 'it' ? 'Nome' : 'Name'}
                                  <span className="text-gray-400 font-normal mr-1">
                                    ({language === 'he' ? 'אופציונלי' : language === 'ru' ? 'необяз.' : language === 'es' ? 'opcional' : language === 'fr' ? 'optionnel' : language === 'de' ? 'optional' : language === 'it' ? 'opzionale' : 'optional'})
                                  </span>
                                </Label>
                                <Input
                                  value={child.name || ''}
                                  onChange={(e) => {
                                    const updated = [...formData.children_age_ranges];
                                    updated[idx] = { ...updated[idx], name: e.target.value };
                                    handleChange('children_age_ranges', updated);
                                  }}
                                  placeholder={language === 'he' ? `ילד ${idx + 1}` : `Child ${idx + 1}`}
                                  dir={language === 'he' ? 'rtl' : 'ltr'}
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">{language === 'he' ? 'טווח גיל' : language === 'ru' ? 'Возраст' : language === 'es' ? 'Edad' : language === 'fr' ? 'Âge' : language === 'de' ? 'Alter' : language === 'it' ? 'Età' : 'Age Range'}</Label>
                                <Select 
                                  value={child.age_range || ''} 
                                  onValueChange={(value) => {
                                    const updated = [...formData.children_age_ranges];
                                    updated[idx] = { ...updated[idx], age_range: value };
                                    handleChange('children_age_ranges', updated);
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder={language === 'he' ? 'בחר' : language === 'ru' ? 'Выбрать' : language === 'es' ? 'Elegir' : language === 'fr' ? 'Choisir' : language === 'de' ? 'Wählen' : language === 'it' ? 'Scegli' : 'Select'} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="0-2">0-2</SelectItem>
                                    <SelectItem value="3-6">3-6</SelectItem>
                                    <SelectItem value="7-10">7-10</SelectItem>
                                    <SelectItem value="11-14">11-14</SelectItem>
                                    <SelectItem value="15-18">15-18</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">{language === 'he' ? 'מין' : language === 'ru' ? 'Пол' : language === 'es' ? 'Género' : language === 'fr' ? 'Genre' : language === 'de' ? 'Geschlecht' : language === 'it' ? 'Genere' : 'Gender'}</Label>
                                <Select 
                                  value={child.gender || ''} 
                                  onValueChange={(value) => {
                                    const updated = [...formData.children_age_ranges];
                                    updated[idx] = { ...updated[idx], gender: value };
                                    handleChange('children_age_ranges', updated);
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder={language === 'he' ? 'בחר' : language === 'ru' ? 'Выбрать' : language === 'es' ? 'Elegir' : language === 'fr' ? 'Choisir' : language === 'de' ? 'Wählen' : language === 'it' ? 'Scegli' : 'Select'} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="male">{language === 'he' ? 'זכר' : language === 'ru' ? 'Мужской' : language === 'es' ? 'Masculino' : language === 'fr' ? 'Masculin' : language === 'de' ? 'Männlich' : language === 'it' ? 'Maschio' : 'Male'}</SelectItem>
                                    <SelectItem value="female">{language === 'he' ? 'נקבה' : language === 'ru' ? 'Женский' : language === 'es' ? 'Femenino' : language === 'fr' ? 'Féminin' : language === 'de' ? 'Weiblich' : language === 'it' ? 'Femmina' : 'Female'}</SelectItem>
                                    <SelectItem value="other">{language === 'he' ? 'אחר' : language === 'ru' ? 'Другое' : language === 'es' ? 'Otro' : language === 'fr' ? 'Autre' : language === 'de' ? 'Andere' : language === 'it' ? 'Altro' : 'Other'}</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const updated = formData.children_age_ranges.filter((_, i) => i !== idx);
                                handleChange('children_age_ranges', updated);
                              }}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 w-full"
                            >
                              <X className="w-4 h-4 mr-2" />
                              {language === 'he' ? 'הסר' : language === 'ru' ? 'Удалить' : language === 'es' ? 'Eliminar' : language === 'fr' ? 'Supprimer' : language === 'de' ? 'Entfernen' : language === 'it' ? 'Rimuovi' : 'Remove'}
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          onClick={() => {
                            const newChild = {
                              id: Date.now().toString(),
                              name: '',
                              age_range: '',
                              gender: ''
                            };
                            handleChange('children_age_ranges', [...formData.children_age_ranges, newChild]);
                          }}
                          className="w-full border-dashed border-2"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          {language === 'he' ? 'הוסף ילד' : language === 'ru' ? 'Добавить ребенка' : language === 'es' ? 'Añadir niño' : language === 'fr' ? 'Ajouter enfant' : language === 'de' ? 'Kind hinzufügen' : language === 'it' ? 'Aggiungi bambino' : 'Add Child'}
                        </Button>
                      </div>

                      {/* Dog */}
                      <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <Checkbox
                          id="dog"
                          checked={formData.travels_with_dog}
                          onCheckedChange={(checked) => handleChange('travels_with_dog', checked)}
                          className="data-[state=checked]:bg-amber-600"
                        />
                        <Label htmlFor="dog" className="cursor-pointer font-medium text-amber-900">
                          {language === 'he' ? 'אני נוסע עם כלב' : language === 'ru' ? 'Я путешествую с собакой' : language === 'es' ? 'Viajo con perro' : language === 'fr' ? 'Je voyage avec un chien' : language === 'de' ? 'Ich reise mit Hund' : language === 'it' ? 'Viaggio con cane' : 'I travel with a dog'}
                        </Label>
                      </div>
                    </div>
                  )}



                  {/* Step 2: Fitness & Accessibility */}
                  {step === 2 && (
                    <div className="space-y-6">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                          ℹ️ {language === 'he' 
                            ? 'כל השדות אופציונליים - תוכל להשלים מאוחר יותר בפרופיל'
                            : language === 'ru' ? 'Все поля необязательны - можно заполнить позже'
                            : language === 'es' ? 'Todos los campos son opcionales - puedes completarlos después'
                            : language === 'fr' ? 'Tous les champs sont optionnels - à compléter plus tard'
                            : language === 'de' ? 'Alle Felder sind optional - später ausfüllbar'
                            : language === 'it' ? 'Tutti i campi sono opzionali - completabili dopo'
                            : 'All fields are optional - you can complete them later in your profile'}
                        </p>
                      </div>

                      <div className="space-y-3">
                        <Label>{language === 'he' ? 'רמת כושר פיזי' : language === 'ru' ? 'Уровень физподготовки' : language === 'es' ? 'Nivel físico' : language === 'fr' ? 'Niveau physique' : language === 'de' ? 'Fitnesslevel' : language === 'it' ? 'Livello fisico' : 'Fitness Level'}</Label>
                        <Select
                          value={formData.fitness_level}
                          onValueChange={(v) => handleChange('fitness_level', v)}
                        >
                          <SelectTrigger className="h-12">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">
                              {language === 'he' ? 'נמוכה - טיולים קלים בלבד' : language === 'ru' ? 'Низкий - легкие поездки' : language === 'es' ? 'Bajo - viajes fáciles' : language === 'fr' ? 'Bas - voyages faciles' : language === 'de' ? 'Niedrig - leichte Reisen' : language === 'it' ? 'Basso - viaggi facili' : 'Low - Easy trips only'}
                            </SelectItem>
                            <SelectItem value="moderate">
                              {language === 'he' ? 'בינונית - טיולים קלים עד בינוניים' : language === 'ru' ? 'Средний - легкие до средних' : language === 'es' ? 'Moderado - fáciles a moderados' : language === 'fr' ? 'Moyen - faciles à modérés' : language === 'de' ? 'Mittel - leicht bis mittel' : language === 'it' ? 'Moderato - facili a moderati' : 'Moderate - Easy to moderate trips'}
                            </SelectItem>
                            <SelectItem value="high">
                              {language === 'he' ? 'גבוהה - טיולים מאתגרים' : language === 'ru' ? 'Высокий - сложные поездки' : language === 'es' ? 'Alto - viajes desafiantes' : language === 'fr' ? 'Élevé - voyages difficiles' : language === 'de' ? 'Hoch - anspruchsvolle Reisen' : language === 'it' ? 'Alto - viaggi impegnativi' : 'High - Challenging trips'}
                            </SelectItem>
                            <SelectItem value="very_high">
                              {language === 'he' ? 'גבוהה מאוד - טיולים קשים' : language === 'ru' ? 'Очень высокий - трудные' : language === 'es' ? 'Muy alto - viajes difíciles' : language === 'fr' ? 'Très élevé - voyages durs' : language === 'de' ? 'Sehr hoch - harte Reisen' : language === 'it' ? 'Molto alto - viaggi difficili' : 'Very High - Hard trips'}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label className="flex items-center gap-2">
                          <Accessibility className="w-4 h-4 text-purple-600" />
                          {language === 'he' ? 'דרישות נגישות' : language === 'ru' ? 'Потребности доступности' : language === 'es' ? 'Necesidades de accesibilidad' : language === 'fr' ? 'Besoins d\'accessibilité' : language === 'de' ? 'Barrierefreiheit' : language === 'it' ? 'Esigenze di accessibilità' : 'Accessibility Needs'}
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {['wheelchair', 'visual_impairment', 'hearing_impairment', 'mobility_aid', 'stroller_friendly', 'elderly_friendly'].map(type => (
                            <Badge
                              key={type}
                              variant={formData.accessibility_needs.includes(type) ? 'default' : 'outline'}
                              className={`cursor-pointer transition-all py-2 px-3 ${
                                formData.accessibility_needs.includes(type)
                                  ? 'bg-purple-600 hover:bg-purple-700'
                                  : 'hover:border-purple-500 hover:text-purple-600'
                              }`}
                              onClick={() => toggleAccessibility(type)}
                            >
                              {t(type)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Interests */}
                  {step === 3 && (
                    <div className="space-y-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <p className="text-sm text-blue-800">
                          ℹ️ {language === 'he' 
                            ? 'כל השדות אופציונליים - תוכל להשלים מאוחר יותר בפרופיל'
                            : language === 'ru' ? 'Все поля необязательны - можно заполнить позже'
                            : language === 'es' ? 'Todos los campos son opcionales - puedes completarlos después'
                            : language === 'fr' ? 'Tous les champs sont optionnels - à compléter plus tard'
                            : language === 'de' ? 'Alle Felder sind optional - später ausfüllbar'
                            : language === 'it' ? 'Tutti i campi sono opzionali - completabili dopo'
                            : 'All fields are optional - you can complete them later in your profile'}
                        </p>
                      </div>
                      <Label className="text-base font-semibold">
                        {language === 'he' ? 'מה מעניין אותך?' : language === 'ru' ? 'Что вас интересует?' : language === 'es' ? '¿Qué te interesa?' : language === 'fr' ? 'Qu\'est-ce qui vous intéresse?' : language === 'de' ? 'Was interessiert Sie?' : language === 'it' ? 'Cosa ti interessa?' : 'What interests you?'}
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {interests.map(interest => (
                          <Badge
                            key={interest}
                            variant={formData.preferred_interests.includes(interest) ? 'default' : 'outline'}
                            className={`cursor-pointer transition-all py-2 px-4 text-sm ${
                              formData.preferred_interests.includes(interest)
                                ? 'bg-rose-600 hover:bg-rose-700'
                                : 'hover:border-rose-500 hover:text-rose-600'
                            }`}
                            onClick={() => toggleInterest(interest)}
                          >
                            {t(interest)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 5: Legal & Terms */}
                  {step === 5 && (
                    <div className="space-y-4">
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <p className="text-sm text-amber-900">
                          {language === 'he' ? 'עליך לקרוא ולאשר את תנאי השימוש כדי להשלים את ההרשמה' :
                           language === 'ru' ? 'Вам необходимо прочитать и принять условия использования, чтобы завершить регистрацию' :
                           language === 'es' ? 'Debes leer y aceptar los Términos de uso para finalizar el registro' :
                           language === 'fr' ? "Vous devez lire et accepter les conditions d'utilisation pour terminer l'inscription" :
                           language === 'de' ? 'Sie müssen die Nutzungsbedingungen lesen und akzeptieren, um die Registrierung abzuschließen' :
                           language === 'it' ? "Devi leggere e accettare i Termini d'uso per completare la registrazione" :
                           'You must read and accept the Terms of Use to finish sign-up'}
                        </p>
                      </div>

                      <ScrollArea className="h-64 rounded-md border p-4 bg-white">
                        <div className="space-y-3 text-sm leading-6 text-gray-700">
                          <h2 className="font-semibold text-gray-900">
                            {language === 'he' ? 'תנאי שימוש — תקציר' :
                             language === 'ru' ? 'Условия использования — кратко' :
                             language === 'es' ? 'Términos de uso — Resumen' :
                             language === 'fr' ? "Conditions d'utilisation — Résumé" :
                             language === 'de' ? 'Nutzungsbedingungen — Kurzfassung' :
                             language === 'it' ? "Termini d'uso — Sintesi" :
                             'Terms of Use — Summary'}
                          </h2>
                          <p>
                            {language === 'he' ? 'השימוש בפלטפורמה על אחריות המשתמש בלבד. יש לציית לחוק, לכללי הבטיחות והטיול, ולכבד משתתפים אחרים.' :
                             language === 'ru' ? 'Использование платформы на ваш риск. Соблюдайте закон, безопасность и уважайте других участников.' :
                             language === 'es' ? 'El uso de la plataforma es bajo tu responsabilidad. Respeta la ley, la seguridad y a los demás participantes.' :
                             language === 'fr' ? 'L\'utilisation de la plateforme est sous votre responsabilité. Respectez la loi, la sécurité et les autres participants.' :
                             language === 'de' ? 'Die Nutzung der Plattform erfolgt auf eigene Verantwortung. Beachten Sie Gesetz, Sicherheit und respektieren Sie andere.' :
                             language === 'it' ? 'L\'uso della piattaforma è sotto la tua responsabilità. Rispetta la legge, la sicurezza e gli altri partecipanti.' :
                             'Use of the platform is at your own risk. Follow laws and safety rules and respect other participants.'}
                          </p>
                          <ul className="list-disc ml-5 space-y-1">
                            <li>{language === 'he' ? 'אין אחריות על התאמת מסלולים או תנאי שטח' : language === 'ru' ? 'Нет гарантии соответствия маршрутов или условий' : language === 'es' ? 'Sin garantía sobre rutas o condiciones' : language === 'fr' ? 'Aucune garantie sur les itinéraires ou conditions' : language === 'de' ? 'Keine Gewähr für Routen oder Bedingungen' : language === 'it' ? 'Nessuna garanzia su percorsi o condizioni' : 'No warranty on routes or conditions'}</li>
                            <li>{language === 'he' ? 'יש להצטייד בציוד ובביטוח המתאימים' : language === 'ru' ? 'Иметь подходящее снаряжение и страховку' : language === 'es' ? 'Lleva equipo y seguro adecuados' : language === 'fr' ? 'Munissez-vous d\'équipement et assurance adaptés' : language === 'de' ? 'Passende Ausrüstung und Versicherung' : language === 'it' ? 'Dotarsi di attrezzatura e assicurazione adeguate' : 'Bring proper gear and insurance'}</li>
                            <li>{language === 'he' ? 'הפלטפורמה אינה מארגנת טיולים — רק מחברת בין אנשים' : language === 'ru' ? 'Платформа не организует поездки — лишь связывает людей' : language === 'es' ? 'La plataforma no organiza viajes — solo conecta personas' : language === 'fr' ? 'La plateforme n\'organise pas de voyages — elle connecte des personnes' : language === 'de' ? 'Die Plattform organisiert keine Reisen — sie verbindet Menschen' : language === 'it' ? 'La piattaforma non organizza viaggi — collega le persone' : 'The platform does not organize trips — it connects people'}</li>
                            <li>{language === 'he' ? 'עליך לציית להוראות בטיחות ולחוקי המקום' : language === 'ru' ? 'Соблюдайте правила безопасности и законы' : language === 'es' ? 'Cumple normas de seguridad y leyes' : language === 'fr' ? 'Respectez les règles de sécurité et les lois' : language === 'de' ? 'Befolgen Sie Sicherheitsregeln und Gesetze' : language === 'it' ? 'Rispetta le norme di sicurezza e le leggi' : 'Follow safety rules and laws'}</li>
                            <li>{language === 'he' ? 'כיבוד פרטיות והתנהגות מכבדת בקהילה' : language === 'ru' ? 'Уважайте приватность и правила общения' : language === 'es' ? 'Respeta la privacidad y convive con respeto' : language === 'fr' ? 'Respect de la vie privée et des autres' : language === 'de' ? 'Wahrung der Privatsphäre und respektvolles Verhalten' : language === 'it' ? 'Rispetta la privacy e comportati con rispetto' : 'Respect privacy and behave respectfully'}</li>
                          </ul>
                          <p className="text-xs text-gray-500">
                            <a href={createPageUrl('TermsOfUse')} className="text-emerald-600 hover:underline" target="_blank" rel="noreferrer">
                              {language === 'he' ? 'לצפייה במלוא תנאי השימוש' : language === 'ru' ? 'Полные условия использования' : language === 'es' ? 'Ver términos completos' : language === 'fr' ? 'Voir les conditions complètes' : language === 'de' ? 'Vollständige Bedingungen' : language === 'it' ? 'Termini completi' : 'View full Terms'}
                            </a>
                          </p>
                        </div>
                      </ScrollArea>

                      <div className="flex items-center gap-3">
                        <Checkbox id="accept-terms" checked={acceptedTerms} onCheckedChange={setAcceptedTerms} />
                        <Label htmlFor="accept-terms" className="cursor-pointer">
                          {language === 'he' ? 'קראתי ואני מאשר/ת את תנאי השימוש' :
                           language === 'ru' ? 'Я прочитал(а) и принимаю условия использования' :
                           language === 'es' ? 'He leído y acepto los Términos de uso' :
                           language === 'fr' ? "J'ai lu et j'accepte les conditions d'utilisation" :
                           language === 'de' ? 'Ich habe die Nutzungsbedingungen gelesen und akzeptiere sie' :
                           language === 'it' ? 'Ho letto e accetto i Termini d\'uso' :
                           'I have read and accept the Terms of Use'}
                        </Label>
                      </div>
                    </div>
                  )}

                  </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <div className="flex gap-3 flex-1">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={step === 0}
                className="flex items-center gap-2 flex-1 sm:flex-initial"
              >
                {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                {language === 'he' ? 'הקודם' : language === 'ru' ? 'Назад' : language === 'es' ? 'Anterior' : language === 'fr' ? 'Précédent' : language === 'de' ? 'Zurück' : language === 'it' ? 'Precedente' : 'Previous'}
              </Button>

              {step < totalSteps - 1 ? (
                <Button
                  onClick={handleNext}
                  className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2 flex-1 sm:flex-initial"
                >
                  {language === 'he' ? 'הבא' : language === 'ru' ? 'Далее' : language === 'es' ? 'Siguiente' : language === 'fr' ? 'Suivant' : language === 'de' ? 'Weiter' : language === 'it' ? 'Avanti' : 'Next'}
                  {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-emerald-600 hover:bg-emerald-700 min-w-[140px] flex-1 sm:flex-initial"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      {language === 'he' ? 'סיום' : language === 'ru' ? 'Готово' : language === 'es' ? 'Finalizar' : language === 'fr' ? 'Terminer' : language === 'de' ? 'Fertig' : language === 'it' ? 'Fine' : 'Finish'}
                    </>
                  )}
                </Button>
              )}
            </div>

            {step > 0 && (
              <Button
                variant="ghost"
                onClick={handleSkipToEnd}
                disabled={loading}
                className="text-gray-600 hover:text-emerald-600"
              >
                {language === 'he' ? 'דלג והשלם מאוחר יותר' : language === 'ru' ? 'Пропустить и заполнить позже' : language === 'es' ? 'Omitir y completar después' : language === 'fr' ? 'Ignorer et compléter plus tard' : language === 'de' ? 'Überspringen und später ausfüllen' : language === 'it' ? 'Salta e completa dopo' : 'Skip and complete later'}
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}