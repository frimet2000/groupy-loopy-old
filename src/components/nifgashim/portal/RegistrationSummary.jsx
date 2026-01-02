import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '../../LanguageContext';
import { Users, Calendar, CreditCard, CheckCircle2 } from 'lucide-react';

export default function RegistrationSummary({ userType, participants, selectedDays, trekDays, groupInfo }) {
  const { language, isRTL } = useLanguage();

  const translations = {
    he: {
      title: "סיכום ההרשמה",
      registrationType: "סוג הרשמה",
      individual: "אישי",
      family: "משפחתי",
      group: "קבוצה מאורגנת",
      participants: "משתתפים",
      selectedDays: "ימים נבחרים",
      totalCost: "עלות כוללת",
      free: "חינם",
      groupName: "שם הקבוצה",
      leader: "מנהיג"
    },
    en: {
      title: "Registration Summary",
      registrationType: "Registration Type",
      individual: "Individual",
      family: "Family",
      group: "Organized Group",
      participants: "Participants",
      selectedDays: "Selected Days",
      totalCost: "Total Cost",
      free: "Free",
      groupName: "Group Name",
      leader: "Leader"
    },
    ru: {
      title: "Резюме регистрации",
      registrationType: "Тип регистрации",
      individual: "Индивидуально",
      family: "Семья",
      group: "Организованная группа",
      participants: "Участники",
      selectedDays: "Выбранные дни",
      totalCost: "Общая стоимость",
      free: "Бесплатно",
      groupName: "Название группы",
      leader: "Лидер"
    },
    es: {
      title: "Resumen de registro",
      registrationType: "Tipo de registro",
      individual: "Individual",
      family: "Familia",
      group: "Grupo organizado",
      participants: "Participantes",
      selectedDays: "Días seleccionados",
      totalCost: "Costo total",
      free: "Gratis",
      groupName: "Nombre del grupo",
      leader: "Líder"
    },
    fr: {
      title: "Résumé de l'inscription",
      registrationType: "Type d'inscription",
      individual: "Individuel",
      family: "Famille",
      group: "Groupe organisé",
      participants: "Participants",
      selectedDays: "Jours sélectionnés",
      totalCost: "Coût total",
      free: "Gratuit",
      groupName: "Nom du groupe",
      leader: "Chef"
    },
    de: {
      title: "Registrierungszusammenfassung",
      registrationType: "Registrierungstyp",
      individual: "Einzeln",
      family: "Familie",
      group: "Organisierte Gruppe",
      participants: "Teilnehmer",
      selectedDays: "Ausgewählte Tage",
      totalCost: "Gesamtkosten",
      free: "Kostenlos",
      groupName: "Gruppenname",
      leader: "Leiter"
    },
    it: {
      title: "Riepilogo registrazione",
      registrationType: "Tipo di registrazione",
      individual: "Individuale",
      family: "Famiglia",
      group: "Gruppo organizzato",
      participants: "Partecipanti",
      selectedDays: "Giorni selezionati",
      totalCost: "Costo totale",
      free: "Gratuito",
      groupName: "Nome gruppo",
      leader: "Leader"
    }
  };

  const trans = translations[language] || translations.en;

  // Calculate price: only adults (age 10+) pay
  const calculatePrice = () => {
    if (userType === 'group') return 0;
    
    const adultsCount = participants.filter(p => {
      if (!p.age_range) return true; // Default to adult if not specified
      const age = parseInt(p.age_range.split('-')[0]);
      return age >= 10;
    }).length;

    return adultsCount * selectedDays.length * 85; // 85 ILS per adult per day
  };

  const totalPrice = calculatePrice();

  const userTypeLabels = {
    individual: trans.individual,
    family: trans.family,
    group: trans.group
  };

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <CardTitle className="text-2xl flex items-center gap-2">
          <CheckCircle2 className="w-6 h-6" />
          {trans.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Registration Type */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold">{trans.registrationType}</h3>
          </div>
          <Badge className="bg-blue-600 text-white text-lg px-4 py-2">
            {userTypeLabels[userType]}
          </Badge>
        </div>

        {/* Group Info */}
        {userType === 'group' && (
          <div className="bg-emerald-50 p-4 rounded-lg space-y-2">
            <div>
              <span className="font-semibold">{trans.groupName}: </span>
              <span>{groupInfo.name}</span>
            </div>
            <div>
              <span className="font-semibold">{trans.leader}: </span>
              <span>{groupInfo.leaderName} • {groupInfo.leaderEmail}</span>
            </div>
          </div>
        )}

        {/* Participants */}
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold">{trans.participants}</h3>
          </div>
          <div className="space-y-2">
            {participants.map((p, idx) => (
              <div key={p.id} className="flex items-center gap-3 bg-white p-3 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-sm text-gray-600">
                    {p.id_number} {p.age_range && `• ${p.age_range}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Days */}
        <div className="bg-indigo-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold">{trans.selectedDays}</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {selectedDays.map(day => (
              <Badge key={day.day_number} className="bg-indigo-600 text-white text-sm py-2 justify-center">
                {trans.day} {day.day_number}
              </Badge>
            ))}
          </div>
        </div>

        {/* Price */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-lg border-2 border-amber-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-amber-600" />
              <h3 className="font-bold text-xl">{trans.totalCost}</h3>
            </div>
            <div className="text-3xl font-bold text-amber-600">
              {userType === 'group' ? trans.free : `${totalPrice}₪`}
            </div>
          </div>
          {userType !== 'group' && (
            <p className="text-sm text-gray-600 mt-2">
              {language === 'he' 
                ? `תשלום עבור ${participants.filter(p => !p.age_range || parseInt(p.age_range.split('-')[0]) >= 10).length} מבוגרים × ${selectedDays.length} ימים × 85₪`
                : `Payment for ${participants.filter(p => !p.age_range || parseInt(p.age_range.split('-')[0]) >= 10).length} adults × ${selectedDays.length} days × 85₪`}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}