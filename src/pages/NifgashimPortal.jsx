import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '../components/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, MapPin, Calendar, CreditCard, User, Mail, Phone, Hash } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const TRIP_ID = '6946647d7d7b248feaf1b118';
const APP_ID = '693c3ab4048a1e3a31fffd66';
const API_KEY = '6038ed8aa02f4f5eb813b1b899ed95bf';

export default function NifgashimPortal() {
  const { isRTL, language } = useLanguage();
  const [selectedDays, setSelectedDays] = useState([]);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    id_number: ''
  });
  const [loading, setLoading] = useState(false);

  const translations = {
    he: {
      title: "הרשמה למסע נפגשים בשביל ישראל 2026",
      subtitle: "מסע ארצישראלי ייחודי",
      gallery: "גלריית תמונות",
      map: "מפת המסלול",
      selectDays: "בחר ימי השתתפות",
      personalDetails: "פרטים אישיים",
      fullName: "שם מלא",
      email: "אימייל",
      phone: "טלפון",
      idNumber: "תעודת זהות",
      totalPrice: "סה״כ לתשלום",
      freeRegistration: "רישום חינם",
      submit: "שלח והמשך לתשלום",
      submitting: "שולח...",
      success: "ההרשמה נשלחה בהצלחה!",
      selectAtLeastOneDay: "יש לבחור לפחות יום אחד",
      fillAllFields: "יש למלא את כל השדות",
      day: "יום"
    },
    en: {
      title: "Nifgashim for Israel Trek 2026 Registration",
      subtitle: "A unique Israel journey",
      gallery: "Photo Gallery",
      map: "Route Map",
      selectDays: "Select Days",
      personalDetails: "Personal Details",
      fullName: "Full Name",
      email: "Email",
      phone: "Phone",
      idNumber: "ID Number",
      totalPrice: "Total Price",
      freeRegistration: "Free Registration",
      submit: "Submit & Continue to Payment",
      submitting: "Submitting...",
      success: "Registration submitted successfully!",
      selectAtLeastOneDay: "Please select at least one day",
      fillAllFields: "Please fill all fields",
      day: "Day"
    },
    ru: {
      title: "Регистрация на поход Нифгашим для Израиля 2026",
      subtitle: "Уникальное путешествие по Израилю",
      gallery: "Галерея фото",
      map: "Карта маршрута",
      selectDays: "Выбрать дни",
      personalDetails: "Личные данные",
      fullName: "Полное имя",
      email: "Email",
      phone: "Телефон",
      idNumber: "ID номер",
      totalPrice: "Итого",
      freeRegistration: "Бесплатная регистрация",
      submit: "Отправить",
      submitting: "Отправка...",
      success: "Регистрация успешна!",
      selectAtLeastOneDay: "Выберите хотя бы один день",
      fillAllFields: "Заполните все поля",
      day: "День"
    },
    es: {
      title: "Registro Nifgashim para Israel Trek 2026",
      subtitle: "Un viaje único por Israel",
      gallery: "Galería de fotos",
      map: "Mapa de ruta",
      selectDays: "Seleccionar días",
      personalDetails: "Datos personales",
      fullName: "Nombre completo",
      email: "Email",
      phone: "Teléfono",
      idNumber: "Número ID",
      totalPrice: "Total",
      freeRegistration: "Registro gratuito",
      submit: "Enviar",
      submitting: "Enviando...",
      success: "¡Registro exitoso!",
      selectAtLeastOneDay: "Seleccione al menos un día",
      fillAllFields: "Complete todos los campos",
      day: "Día"
    },
    fr: {
      title: "Inscription Nifgashim pour Israel Trek 2026",
      subtitle: "Un voyage unique en Israël",
      gallery: "Galerie photos",
      map: "Carte du parcours",
      selectDays: "Sélectionner jours",
      personalDetails: "Coordonnées",
      fullName: "Nom complet",
      email: "Email",
      phone: "Téléphone",
      idNumber: "Numéro ID",
      totalPrice: "Total",
      freeRegistration: "Inscription gratuite",
      submit: "Envoyer",
      submitting: "Envoi...",
      success: "Inscription réussie!",
      selectAtLeastOneDay: "Sélectionnez au moins un jour",
      fillAllFields: "Remplissez tous les champs",
      day: "Jour"
    },
    de: {
      title: "Nifgashim für Israel Trek 2026 Anmeldung",
      subtitle: "Eine einzigartige Israel-Reise",
      gallery: "Fotogalerie",
      map: "Routenkarte",
      selectDays: "Tage auswählen",
      personalDetails: "Persönliche Daten",
      fullName: "Vollständiger Name",
      email: "Email",
      phone: "Telefon",
      idNumber: "ID Nummer",
      totalPrice: "Gesamt",
      freeRegistration: "Kostenlose Anmeldung",
      submit: "Absenden",
      submitting: "Wird gesendet...",
      success: "Anmeldung erfolgreich!",
      selectAtLeastOneDay: "Wählen Sie mindestens einen Tag",
      fillAllFields: "Füllen Sie alle Felder aus",
      day: "Tag"
    },
    it: {
      title: "Registrazione Nifgashim per Israel Trek 2026",
      subtitle: "Un viaggio unico in Israele",
      gallery: "Galleria foto",
      map: "Mappa percorso",
      selectDays: "Seleziona giorni",
      personalDetails: "Dati personali",
      fullName: "Nome completo",
      email: "Email",
      phone: "Telefono",
      idNumber: "Numero ID",
      totalPrice: "Totale",
      freeRegistration: "Registrazione gratuita",
      submit: "Invia",
      submitting: "Invio...",
      success: "Registrazione riuscita!",
      selectAtLeastOneDay: "Seleziona almeno un giorno",
      fillAllFields: "Compila tutti i campi",
      day: "Giorno"
    }
  };

  const trans = translations[language] || translations.he;

  const { data: trip, isLoading } = useQuery({
    queryKey: ['nifgashimTrip', TRIP_ID],
    queryFn: async () => {
      const response = await fetch(
        `https://app.base44.com/api/apps/${APP_ID}/entities/Trip/${TRIP_ID}`,
        {
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      if (!response.ok) throw new Error('Failed to fetch trip');
      return response.json();
    }
  });

  const photos = trip?.photos || [];
  const waypoints = trip?.waypoints || [];
  const trekDays = trip?.trek_days || [];
  const totalPrice = selectedDays.length > 0 ? 85 : 0;

  const handleDayToggle = (dayNumber) => {
    setSelectedDays(prev => 
      prev.includes(dayNumber) 
        ? prev.filter(d => d !== dayNumber)
        : [...prev, dayNumber]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedDays.length === 0) {
      toast.error(trans.selectAtLeastOneDay);
      return;
    }
    
    if (!formData.full_name || !formData.email || !formData.phone || !formData.id_number) {
      toast.error(trans.fillAllFields);
      return;
    }

    setLoading(true);
    
    try {
      const participantData = {
        name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        id_number: formData.id_number,
        joined_at: new Date().toISOString()
      };

      const updatedParticipants = [...(trip.participants || []), participantData];
      const updatedSelectedDays = [
        ...(trip.participants_selected_days || []),
        {
          email: formData.email,
          name: formData.full_name,
          days: selectedDays
        }
      ];

      await fetch(
        `https://app.base44.com/api/apps/${APP_ID}/entities/Trip/${TRIP_ID}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            participants: updatedParticipants,
            participants_selected_days: updatedSelectedDays,
            budget: {
              ...trip.budget,
              notes: `${trans.totalPrice}: ${totalPrice} ש״ח`
            }
          })
        }
      );

      toast.success(trans.success);
      
      // Reset form
      setFormData({ full_name: '', email: '', phone: '', id_number: '' });
      setSelectedDays([]);
    } catch (error) {
      console.error(error);
      toast.error(language === 'he' ? 'שגיאה בשליחת הטופס' : 'Error submitting form');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-b from-blue-50 to-white py-4 sm:py-8 px-4 ${isRTL ? 'rtl' : 'ltr'}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <Card className="mb-6">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white">
            <CardTitle className="text-2xl sm:text-3xl text-center">{trip?.title || trans.title}</CardTitle>
            <p className="text-center text-white opacity-90 mt-2">{trans.subtitle}</p>
          </CardHeader>
        </Card>

        {/* Photo Gallery */}
        {photos.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl">{trans.gallery}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {photos.map((photo, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.05 }}
                    className="relative aspect-square rounded-lg overflow-hidden shadow-md"
                  >
                    <img
                      src={photo.url}
                      alt={photo.caption || `תמונה ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Map */}
        {waypoints.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                {trans.map}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 sm:h-96 rounded-lg overflow-hidden">
                <MapContainer
                  center={[waypoints[0].latitude, waypoints[0].longitude]}
                  zoom={8}
                  className="h-full w-full"
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />
                  {waypoints.map((wp, idx) => (
                    <Marker key={idx} position={[wp.latitude, wp.longitude]}>
                      <Popup>{wp.name || `נקודה ${idx + 1}`}</Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Day Selector */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {trans.selectDays}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {trekDays.map((day) => (
                <motion.div
                  key={day.day_number}
                  whileHover={{ scale: 1.02 }}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    selectedDays.includes(day.day_number)
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => handleDayToggle(day.day_number)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="font-semibold text-lg mb-1">
                        {trans.day} {day.day_number}
                      </div>
                      {day.daily_title && (
                        <div className="text-sm text-gray-700 mb-2">{day.daily_title}</div>
                      )}
                      {day.date && (
                        <div className="text-xs text-gray-500">
                          {new Date(day.date).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      )}
                    </div>
                    <Checkbox
                      checked={selectedDays.includes(day.day_number)}
                      onCheckedChange={() => handleDayToggle(day.day_number)}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Registration Form */}
        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <User className="w-5 h-5" />
                {trans.personalDetails}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="full_name">{trans.fullName}</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {trans.email}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {trans.phone}
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="id_number" className="flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  {trans.idNumber}
                </Label>
                <Input
                  id="id_number"
                  value={formData.id_number}
                  onChange={(e) => setFormData({ ...formData, id_number: e.target.value })}
                  required
                  maxLength={9}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Price Summary & Submit */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-6">
                <div className="text-xl font-bold flex items-center gap-2">
                  <CreditCard className="w-6 h-6" />
                  {trans.totalPrice}:
                </div>
                <Badge className={`text-2xl px-4 py-2 ${totalPrice > 0 ? 'bg-blue-600' : 'bg-green-600'}`}>
                  {totalPrice > 0 ? `${totalPrice} ש״ח` : trans.freeRegistration}
                </Badge>
              </div>
              
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-lg py-6"
              >
                <CheckCircle2 className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {loading ? trans.submitting : trans.submit}
              </Button>
            </CardContent>
          </Card>
        </form>
      </motion.div>
    </div>
  );
}