// @ts-nocheck
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '../../LanguageContext';
import { Users, Calendar, CreditCard, CheckCircle2, Plus, X, Trash2, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function RegistrationSummary({ userType, participants, selectedDays, trekDays, groupInfo, setParticipants, isFullTrek = false }) {
  const { language, isRTL } = useLanguage();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newParticipant, setNewParticipant] = useState({
    name: '',
    id_number: '',
    age_range: '',
    phone: '',
    email: ''
  });

  const translations = {
    he: {
      title: "סיכום ההרשמה",
      registrationType: "סוג הרשמה",
      individual: "אישי",
      family: "משפחתי",
      group: "קבוצה מאורגנת",
      participants: "משתתפים",
      totalParticipants: "סך הכל משתתפים",
      selectedDays: "ימים נבחרים",
      totalCost: "עלות כוללת",
      free: "חינם",
      groupName: "שם הקבוצה",
      leader: "מנהיג",
      addParticipant: "הוסף משתתף",
      addParent: "הוסף הורה",
      addChild: "הוסף ילד/ה",
      name: "שם מלא",
      idNumber: "תעודת זהות",
      ageRange: "טווח גילאים",
      phone: "טלפון",
      email: "אימייל",
      cancel: "ביטול",
      save: "שמור",
      selectAge: "בחר גיל",
      invalidId: "ת\"ז חייבת להכיל 9 ספרות",
      invalidPhone: "טלפון חייב להכיל 10 ספרות",
      duplicateId: "ת\"ז כבר רשומה",
      optional: "אופציונלי"
    },
    en: {
      title: "Registration Summary",
      registrationType: "Registration Type",
      individual: "Individual",
      family: "Family",
      group: "Organized Group",
      participants: "Participants",
      totalParticipants: "Total Participants",
      selectedDays: "Selected Days",
      totalCost: "Total Cost",
      free: "Free",
      groupName: "Group Name",
      leader: "Leader",
      addParticipant: "Add Participant",
      addParent: "Add Parent",
      addChild: "Add Child",
      name: "Full Name",
      idNumber: "ID Number",
      ageRange: "Age Range",
      phone: "Phone",
      email: "Email",
      cancel: "Cancel",
      save: "Save",
      selectAge: "Select age",
      invalidId: "ID must be 9 digits",
      invalidPhone: "Phone must be 10 digits",
      duplicateId: "ID already registered",
      optional: "optional"
    },
    ru: {
      title: "Резюме регистрации",
      registrationType: "Тип регистрации",
      individual: "Индивидуально",
      family: "Семья",
      group: "Организованная группа",
      participants: "Участники",
      totalParticipants: "Всего участников",
      selectedDays: "Выбранные дни",
      totalCost: "Общая стоимость",
      free: "Бесплатно",
      groupName: "Название группы",
      leader: "Лидер",
      addParticipant: "Добавить участника",
      addParent: "Добавить родителя",
      addChild: "Добавить ребенка",
      name: "Полное имя",
      idNumber: "Номер ID",
      ageRange: "Возраст",
      phone: "Телефон",
      email: "Email",
      cancel: "Отмена",
      save: "Сохранить",
      selectAge: "Выбрать возраст",
      invalidId: "ID должен содержать 9 цифр",
      invalidPhone: "Телефон должен содержать 10 цифр",
      duplicateId: "ID уже зарегистрирован",
      optional: "необязательно"
    },
    es: {
      title: "Resumen de registro",
      registrationType: "Tipo de registro",
      individual: "Individual",
      family: "Familia",
      group: "Grupo organizado",
      participants: "Participantes",
      totalParticipants: "Total de participantes",
      selectedDays: "Días seleccionados",
      totalCost: "Costo total",
      free: "Gratis",
      groupName: "Nombre del grupo",
      leader: "Líder",
      addParticipant: "Añadir participante",
      addParent: "Añadir padre",
      addChild: "Añadir niño",
      name: "Nombre completo",
      idNumber: "Número de ID",
      ageRange: "Rango de edad",
      phone: "Teléfono",
      email: "Email",
      cancel: "Cancelar",
      save: "Guardar",
      selectAge: "Seleccionar edad",
      invalidId: "ID debe tener 9 dígitos",
      invalidPhone: "Teléfono debe tener 10 dígitos",
      duplicateId: "ID ya registrado",
      optional: "opcional"
    },
    fr: {
      title: "Résumé de l'inscription",
      registrationType: "Type d'inscription",
      individual: "Individuel",
      family: "Famille",
      group: "Groupe organisé",
      participants: "Participants",
      totalParticipants: "Nombre total de participants",
      selectedDays: "Jours sélectionnés",
      totalCost: "Coût total",
      free: "Gratuit",
      groupName: "Nom du groupe",
      leader: "Chef",
      addParticipant: "Ajouter participant",
      addParent: "Ajouter parent",
      addChild: "Ajouter enfant",
      name: "Nom complet",
      idNumber: "Numéro d'ID",
      ageRange: "Tranche d'âge",
      phone: "Téléphone",
      email: "Email",
      cancel: "Annuler",
      save: "Enregistrer",
      selectAge: "Sélectionner l'âge",
      invalidId: "ID doit avoir 9 chiffres",
      invalidPhone: "Téléphone doit avoir 10 chiffres",
      duplicateId: "ID déjà enregistré",
      optional: "facultatif"
    },
    de: {
      title: "Registrierungszusammenfassung",
      registrationType: "Registrierungstyp",
      individual: "Einzeln",
      family: "Familie",
      group: "Organisierte Gruppe",
      participants: "Teilnehmer",
      totalParticipants: "Gesamtzahl der Teilnehmer",
      selectedDays: "Ausgewählte Tage",
      totalCost: "Gesamtkosten",
      free: "Kostenlos",
      groupName: "Gruppenname",
      leader: "Leiter",
      addParticipant: "Teilnehmer hinzufügen",
      addParent: "Elternteil hinzufügen",
      addChild: "Kind hinzufügen",
      name: "Vollständiger Name",
      idNumber: "ID-Nummer",
      ageRange: "Altersbereich",
      phone: "Telefon",
      email: "Email",
      cancel: "Abbrechen",
      save: "Speichern",
      selectAge: "Alter wählen",
      invalidId: "ID muss 9 Ziffern haben",
      invalidPhone: "Telefon muss 10 Ziffern haben",
      duplicateId: "ID bereits registriert",
      optional: "optional"
    },
    it: {
      title: "Riepilogo registrazione",
      registrationType: "Tipo di registrazione",
      individual: "Individuale",
      family: "Famiglia",
      group: "Gruppo organizzato",
      participants: "Partecipanti",
      totalParticipants: "Numero totale di partecipanti",
      selectedDays: "Giorni selezionati",
      totalCost: "Costo totale",
      free: "Gratuito",
      groupName: "Nome gruppo",
      leader: "Leader",
      addParticipant: "Aggiungi partecipante",
      addParent: "Aggiungi genitore",
      addChild: "Aggiungi bambino",
      name: "Nome completo",
      idNumber: "Numero ID",
      ageRange: "Fascia d'età",
      phone: "Telefono",
      email: "Email",
      cancel: "Annulla",
      save: "Salva",
      selectAge: "Seleziona età",
      invalidId: "ID deve avere 9 cifre",
      invalidPhone: "Telefono deve avere 10 cifre",
      duplicateId: "ID già registrato",
      optional: "facoltativo"
    }
  };

  const trans = translations[language] || translations.en;

  // Age ranges
  const parentAgeRanges = ['19-25', '26-35', '36-50', '51-65', '65+'];
  const childAgeRanges = ['0-9', '10-18'];
  
  // Check how many parents exist
  const parentCount = participants.filter(p => {
    if (!p.age_range) return true;
    const age = parseInt(p.age_range.split('-')[0]);
    return age >= 19;
  }).length;
  
  const canAddParent = userType === 'family' && parentCount < 2;
  const canAddChild = userType === 'family';

  const handleAddParticipant = () => {
    if (!newParticipant.name || !newParticipant.id_number || !newParticipant.age_range) {
      toast.error(trans.requiredFields || 'Please fill required fields');
      return;
    }
    
    if (!/^\d{9}$/.test(newParticipant.id_number)) {
      toast.error(trans.invalidId);
      return;
    }
    
    const isChild = newParticipant.age_range === '0-9' || newParticipant.age_range === '10-18';
    
    if (!isChild && newParticipant.phone && !/^\d{10}$/.test(newParticipant.phone)) {
      toast.error(trans.invalidPhone);
      return;
    }
    
    if (participants.find(p => p.id_number === newParticipant.id_number)) {
      toast.error(trans.duplicateId);
      return;
    }
    
    const participant = {
      ...newParticipant,
      id: Date.now()
    };
    
    setParticipants([...participants, participant]);
    setNewParticipant({ name: '', id_number: '', age_range: '', phone: '', email: '' });
    setShowAddForm(false);
  };

  const handleRemoveParticipant = (id) => {
    setParticipants(participants.filter(p => p.id !== id));
  };

  // Add "Day" translation
  const dayLabel = language === 'he' ? 'יום' : 
                   language === 'ru' ? 'День' :
                   language === 'es' ? 'Día' :
                   language === 'fr' ? 'Jour' :
                   language === 'de' ? 'Tag' :
                   language === 'it' ? 'Giorno' : 'Day';

  // Calculate price: 85 ILS per adult (10+) for the entire trek
  const calculatePrice = () => {
    const adultsCount = participants.filter(p => {
      if (!p.age_range) return true; // Default to adult if not specified
      const age = parseInt(p.age_range.split('-')[0]);
      return age >= 10;
    }).length;

    return adultsCount * 85; // 85 ILS per adult for entire trek
  };

  const totalPrice = calculatePrice();

  const fullTrekLabel = language === 'he' ? 'טראק מלא' :
                        language === 'ru' ? 'Полный трек' :
                        language === 'es' ? 'Trek completo' :
                        language === 'fr' ? 'Trek complet' :
                        language === 'de' ? 'Voller Trek' :
                        language === 'it' ? 'Trek completo' : 'Full Trek';

  const userTypeLabels = {
    individual: trans.individual,
    family: trans.family,
    group: trans.group,
    full_trek: fullTrekLabel
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold">{trans.participants}</h3>
              <Badge className="bg-purple-600 text-white text-sm">
                {userType === 'group' ? groupInfo.totalParticipants || 0 : participants.length}
              </Badge>
            </div>
            {userType === 'family' && setParticipants && !showAddForm && (
              <div className="flex gap-2">
                {canAddParent && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowAddForm('parent')}
                    className="text-purple-600 border-purple-300 hover:bg-purple-100"
                  >
                    <UserPlus className="w-4 h-4 mr-1" />
                    {trans.addParent}
                  </Button>
                )}
                {canAddChild && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowAddForm('child')}
                    className="text-pink-600 border-pink-300 hover:bg-pink-100"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    {trans.addChild}
                  </Button>
                )}
              </div>
            )}
          </div>
          
          {/* Inline Add Form */}
          <AnimatePresence>
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 overflow-hidden"
              >
                <div className="bg-white p-4 rounded-lg border-2 border-purple-300 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-purple-700">
                      {showAddForm === 'parent' ? trans.addParent : trans.addChild}
                    </h4>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setShowAddForm(false);
                        setNewParticipant({ name: '', id_number: '', age_range: '', phone: '', email: '' });
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm">{trans.name} *</Label>
                      <Input
                        value={newParticipant.name}
                        onChange={(e) => setNewParticipant({ ...newParticipant, name: e.target.value })}
                        dir={isRTL ? 'rtl' : 'ltr'}
                        className="h-9"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">{trans.idNumber} *</Label>
                      <Input
                        value={newParticipant.id_number}
                        onChange={(e) => setNewParticipant({ ...newParticipant, id_number: e.target.value.replace(/\D/g, '') })}
                        maxLength={9}
                        className="h-9"
                        placeholder="123456789"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">{trans.ageRange} *</Label>
                      <Select
                        value={newParticipant.age_range}
                        onValueChange={(v) => setNewParticipant({ ...newParticipant, age_range: v })}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder={trans.selectAge} />
                        </SelectTrigger>
                        <SelectContent>
                          {(showAddForm === 'parent' ? parentAgeRanges : childAgeRanges).map(r => (
                            <SelectItem key={r} value={r}>{r}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {showAddForm === 'parent' && (
                      <>
                        <div>
                          <Label className="text-sm">{trans.phone}</Label>
                          <Input
                            value={newParticipant.phone}
                            onChange={(e) => setNewParticipant({ ...newParticipant, phone: e.target.value.replace(/\D/g, '') })}
                            maxLength={10}
                            className="h-9"
                            placeholder="0501234567"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <Label className="text-sm">{trans.email} ({trans.optional})</Label>
                          <Input
                            type="email"
                            value={newParticipant.email}
                            onChange={(e) => setNewParticipant({ ...newParticipant, email: e.target.value })}
                            className="h-9"
                          />
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={handleAddParticipant}
                      className="flex-1 bg-purple-600 hover:bg-purple-700"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      {trans.save}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowAddForm(false);
                        setNewParticipant({ name: '', id_number: '', age_range: '', phone: '', email: '' });
                      }}
                      size="sm"
                    >
                      {trans.cancel}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="space-y-2">
            {participants.map((p, idx) => (
              <div key={p.id} className="flex items-center gap-3 bg-white p-3 rounded-lg group">
                <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{p.name}</div>
                  <div className="text-sm text-gray-600 truncate">
                    {p.id_number} {p.age_range && `• ${p.age_range}`}
                  </div>
                </div>
                {setParticipants && participants.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveParticipant(p.id)}
                    className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 hover:bg-red-50 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {selectedDays.map(day => {
              const fullDayData = trekDays.find(td => td.day_number === day.day_number || td.id === day.id);
              const title = fullDayData?.daily_title || day.daily_title || (language === 'he' ? `יום ${day.day_number}` : `Day ${day.day_number}`);
              
              // Format date with weekday
              const date = fullDayData?.date ? new Date(fullDayData.date) : null;
              const weekdayShort = date ? date.toLocaleDateString(language === 'he' ? 'he-IL' : language === 'ru' ? 'ru-RU' : language === 'es' ? 'es-ES' : language === 'fr' ? 'fr-FR' : language === 'de' ? 'de-DE' : language === 'it' ? 'it-IT' : 'en-US', { weekday: 'short' }) : '';
              const dateStr = date ? date.toLocaleDateString(language === 'he' ? 'he-IL' : language === 'ru' ? 'ru-RU' : language === 'es' ? 'es-ES' : language === 'fr' ? 'fr-FR' : language === 'de' ? 'de-DE' : language === 'it' ? 'it-IT' : 'en-US', { month: 'short', day: 'numeric' }) : '';
              
              return (
                <div key={day.day_number || day.id} className="bg-white rounded-lg p-3 border border-indigo-200">
                  <div className="font-semibold text-indigo-700">{title}</div>
                  {dateStr && (
                    <div className="text-xs text-gray-600 mt-1">
                      {weekdayShort} • {dateStr}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Price - only for non-group registrations */}
        {userType !== 'group' && userType !== 'full_trek' && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-lg border-2 border-amber-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-amber-600" />
                <h3 className="font-bold text-xl">{trans.totalCost}</h3>
              </div>
              <div className="text-3xl font-bold text-amber-600">
              {totalPrice}₪
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {language === 'he' 
              ? `תשלום עבור ${participants.filter(p => !p.age_range || parseInt(p.age_range.split('-')[0]) >= 10).length} מבוגרים (גיל 10+) × 85₪ לכל הטראק`
              : language === 'ru'
              ? `Оплата за ${participants.filter(p => !p.age_range || parseInt(p.age_range.split('-')[0]) >= 10).length} взрослых (10+) × 85₪ за весь трек`
              : language === 'es'
              ? `Pago por ${participants.filter(p => !p.age_range || parseInt(p.age_range.split('-')[0]) >= 10).length} adultos (10+) × 85₪ por todo el trek`
              : language === 'fr'
              ? `Paiement pour ${participants.filter(p => !p.age_range || parseInt(p.age_range.split('-')[0]) >= 10).length} adultes (10+) × 85₪ pour tout le trek`
              : language === 'de'
              ? `Zahlung für ${participants.filter(p => !p.age_range || parseInt(p.age_range.split('-')[0]) >= 10).length} Erwachsene (10+) × 85₪ für den gesamten Trek`
              : language === 'it'
              ? `Pagamento per ${participants.filter(p => !p.age_range || parseInt(p.age_range.split('-')[0]) >= 10).length} adulti (10+) × 85₪ per tutto il trek`
              : `Payment for ${participants.filter(p => !p.age_range || parseInt(p.age_range.split('-')[0]) >= 10).length} adults (age 10+) × 85₪ for entire trek`}
          </p>
          </div>
        )}

        {/* Full Trek Price Info */}
        {userType === 'full_trek' && (
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-lg border-2 border-orange-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-orange-600" />
                <h3 className="font-bold text-xl">{trans.totalCost}</h3>
              </div>
              <div className="text-3xl font-bold text-orange-600">
                270₪
              </div>
            </div>
            <p className="text-sm text-orange-700 mt-2 font-medium">
              {language === 'he' 
                ? '⭐ מחיר מיוחד לטראק מלא - התשלום יישלח על ידי מנהל'
                : language === 'ru'
                ? '⭐ Специальная цена за полный трек - Оплата будет отправлена администратором'
                : language === 'es'
                ? '⭐ Precio especial para trek completo - El pago será enviado por un administrador'
                : language === 'fr'
                ? '⭐ Prix spécial pour trek complet - Le paiement sera envoyé par un administrateur'
                : language === 'de'
                ? '⭐ Sonderpreis für vollen Trek - Zahlung wird vom Admin gesendet'
                : language === 'it'
                ? '⭐ Prezzo speciale per trek completo - Il pagamento sarà inviato da un amministratore'
                : '⭐ Special price for full trek - Payment will be sent by admin'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}