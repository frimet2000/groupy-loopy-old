// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useLanguage } from '../../LanguageContext';
import { Plus, Trash2, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function ParticipantForm({ userType, participants, setParticipants, groupInfo, setGroupInfo, vehicleInfo, setVehicleInfo }) {
  const { language, isRTL } = useLanguage();
  const [hasSpouse, setHasSpouse] = useState(false);
  const [currentParticipant, setCurrentParticipant] = useState({
    name: '',
    id_number: '',
    age_range: '',
    phone: '',
    email: ''
  });

  // Determine if spouse exists based on the first participant's data if available,
  // otherwise fallback to the local state (during the first entry).
  const spouseExists = participants.length > 0 ? participants[0].hasSpouse : hasSpouse;

  const translations = {
    he: {
      title: "פרטי משתתפים",
      groupTitle: "פרטי הקבוצה",
      groupName: "שם הקבוצה",
      leaderName: "ראש הקבוצה",
      leaderEmail: "אימייל",
      leaderPhone: "טלפון",
      totalParticipants: "מספר המשתתפים הכולל",
      participantName: "שם מלא",
      idNumber: "תעודת זהות (9 ספרות)",
      ageRange: "טווח גילאים (עד 18 לילד)",
      phone: "טלפון נייד (10 ספרות)",
      email: "אימייל",
      add: "הוסף משתתף",
      participants: "משתתפים",
      selectAge: "בחר טווח גילאים",
      duplicateId: "תעודת זהות זו כבר רשומה",
      duplicatePhone: "מספר טלפון זה כבר רשום",
      parent1: "הורה 1",
      parent2: "הורה 2",
      child: "ילד/ה",
      invalidId: "תעודת זהות חייבת להכיל 9 ספרות בדיוק",
      invalidPhone: "טלפון נייד חייב להכיל 10 ספרות בדיוק",
      requiredFields: "יש למלא את כל השדות החובה",
      hasSpouse: "הורה נוסף מצטרף",
      addId: "הוסף ת\"ז",
      vehicleDetails: "פרטי רכב",
      hasVehicle: "האם יש רכב?",
      vehicleNumber: "מספר רכב",
      optional: "אופציונלי",
      vehiclePlaceholder: "12-345-67"
    },
    en: {
      title: "Participant Details",
      groupTitle: "Group Details",
      groupName: "Group Name",
      leaderName: "Group Head",
      leaderEmail: "Email",
      leaderPhone: "Phone",
      totalParticipants: "Total Number of Participants",
      participantName: "Full Name",
      idNumber: "ID Number (9 digits)",
      ageRange: "Age Range",
      phone: "Mobile Phone (10 digits)",
      email: "Email",
      add: "Add Participant",
      participants: "Participants",
      selectAge: "Select Age Range",
      duplicateId: "This ID number is already registered",
      duplicatePhone: "This phone number is already registered",
      parent1: "Parent 1",
      parent2: "Parent 2",
      child: "Child",
      invalidId: "ID must be exactly 9 digits",
      invalidPhone: "Phone must be exactly 10 digits",
      requiredFields: "Please fill in all required fields",
      hasSpouse: "Do you have a spouse/partner?",
      addId: "Add ID",
      vehicleDetails: "Vehicle Details",
      hasVehicle: "Do you have a vehicle?",
      vehicleNumber: "Vehicle Number",
      optional: "Optional",
      vehiclePlaceholder: "12-345-67"
    },
    ru: {
      title: "Данные участников",
      groupTitle: "Данные группы",
      groupName: "Название группы",
      leaderName: "Имя руководителя",
      leaderEmail: "Email",
      leaderPhone: "Телефон",
      totalParticipants: "Общее количество участников",
      participantName: "Полное имя",
      idNumber: "ID номер",
      ageRange: "Возрастная группа",
      phone: "Телефон",
      email: "Email (необязательно)",
      add: "Добавить участника",
      participants: "Участники",
      selectAge: "Выберите возраст",
      duplicateId: "Этот ID уже зарегистрирован",
      duplicatePhone: "Этот номер телефона уже зарегистрирован",
      addId: "Добавить ID",
      vehicleDetails: "Детали транспортного средства",
      vehicleNumber: "Номер автомобиля",
      optional: "необязательно",
      vehiclePlaceholder: "12-345-67"
    },
    es: {
      title: "Detalles de participantes",
      groupTitle: "Detalles del grupo",
      groupName: "Nombre del grupo",
      leaderName: "Nombre del líder",
      leaderEmail: "Email",
      leaderPhone: "Teléfono",
      totalParticipants: "Número total de participantes",
      participantName: "Nombre completo",
      idNumber: "Número de ID",
      ageRange: "Rango de edad",
      phone: "Teléfono",
      email: "Email (opcional)",
      add: "Añadir participante",
      participants: "Participantes",
      selectAge: "Seleccionar edad",
      duplicateId: "Este número de ID ya está registrado",
      duplicatePhone: "Este número de teléfono ya está registrado",
      addId: "Añadir ID",
      vehicleDetails: "Detalles del vehículo",
      vehicleNumber: "Número de vehículo",
      optional: "Opcional",
      vehiclePlaceholder: "12-345-67"
    },
    fr: {
      title: "Détails des participants",
      groupTitle: "Détails du groupe",
      groupName: "Nom du groupe",
      leaderName: "Nom du chef",
      leaderEmail: "Email",
      leaderPhone: "Téléphone",
      totalParticipants: "Nombre total de participants",
      participantName: "Nom complet",
      idNumber: "Numéro d'ID",
      ageRange: "Tranche d'âge",
      phone: "Téléphone",
      email: "Email (facultatif)",
      add: "Ajouter participant",
      participants: "Participants",
      selectAge: "Sélectionner l'âge",
      duplicateId: "Ce numéro d'ID est déjà enregistré",
      duplicatePhone: "Ce numéro de téléphone est déjà enregistré",
      addId: "Ajouter ID"
    },
    de: {
      title: "Teilnehmerdetails",
      groupTitle: "Gruppendetails",
      groupName: "Gruppenname",
      leaderName: "Name des Leiters",
      leaderEmail: "Email",
      leaderPhone: "Telefon",
      totalParticipants: "Gesamtzahl der Teilnehmer",
      participantName: "Vollständiger Name",
      idNumber: "ID-Nummer",
      ageRange: "Altersbereich",
      phone: "Telefon",
      email: "Email (optional)",
      add: "Teilnehmer hinzufügen",
      participants: "Teilnehmer",
      selectAge: "Altersbereich wählen",
      duplicateId: "Diese ID-Nummer ist bereits registriert",
      duplicatePhone: "Diese Telefonnummer ist bereits registriert",
      addId: "ID hinzufügen"
    },
    it: {
      title: "Dettagli partecipanti",
      groupTitle: "Dettagli gruppo",
      groupName: "Nome del gruppo",
      leaderName: "Nome del leader",
      leaderEmail: "Email",
      leaderPhone: "Telefono",
      totalParticipants: "Numero totale di partecipanti",
      participantName: "Nome completo",
      idNumber: "Numero ID",
      ageRange: "Fascia d'età",
      phone: "Telefono",
      email: "Email (facoltativo)",
      add: "Aggiungi partecipante",
      participants: "Partecipanti",
      selectAge: "Seleziona età",
      duplicateId: "Questo numero ID è già registrato",
      duplicatePhone: "Questo numero di telefono è già registrato",
      addId: "Aggiungi ID",
      vehicleDetails: "Dettagli veicolo",
      vehicleNumber: "Numero veicolo",
      optional: "Facoltativo",
      vehiclePlaceholder: "12-345-67"
    }
  };

  const trans = translations[language] || translations.en;

  const ageRanges = ['0-9', '10-18', '19-25', '26-35', '36-50', '51-65', '65+'];

  const handleAdd = () => {
    // Check required fields
    if (!currentParticipant.name || !currentParticipant.id_number || !currentParticipant.age_range) {
      toast.error(trans.requiredFields);
      return;
    }

    // Validate ID number (must be exactly 9 digits)
    if (!/^\d{9}$/.test(currentParticipant.id_number)) {
      toast.error(trans.invalidId);
      return;
    }

    // Check if this is a child (age range starts with 0-17)
    const isChild = typeof currentParticipant.age_range === 'string' && (currentParticipant.age_range.startsWith('0-') || currentParticipant.age_range.startsWith('10-'));
    
    // For adults (parents): phone is required. Email is optional for Parent 2.
    if (!isChild) {
      const isParent2 = participants.length === 1 && spouseExists;
      
      if (!currentParticipant.phone) {
        toast.error(trans.requiredFields);
        return;
      }

      if (!isParent2 && !currentParticipant.email) {
        toast.error(trans.requiredFields);
        return;
      }
      
      // Validate phone number (must be exactly 10 digits for adults)
      if (!/^\d{10}$/.test(currentParticipant.phone)) {
        toast.error(trans.invalidPhone);
        return;
      }
    } else {
      // For children: validate phone if provided (optional but must be 10 digits if entered)
      if (currentParticipant.phone && !/^\d{10}$/.test(currentParticipant.phone)) {
        toast.error(trans.invalidPhone);
        return;
      }
    }

    // Check for duplicate ID number
    const duplicateId = participants.find(p => p.id_number === currentParticipant.id_number);
    if (duplicateId) {
      toast.error(trans.duplicateId);
      return;
    }

    // Check for duplicate phone number (if provided)
    if (currentParticipant.phone) {
      const duplicatePhone = participants.find(p => p.phone === currentParticipant.phone);
      if (duplicatePhone) {
        toast.error(trans.duplicatePhone);
        return;
      }
    }

    const newParticipant = {
      ...currentParticipant,
      id: Date.now(),
      // Save hasSpouse choice with the first participant (Parent 1)
      ...(participants.length === 0 ? { hasSpouse } : {})
    };

    setParticipants([...participants, newParticipant]);
    setCurrentParticipant({ name: '', id_number: '', age_range: '', phone: '', email: '' });
  };

  const handleAddGroup = () => {
    // For groups, we don't add individual participants via this method
    // Groups use a single total participant count
    return;
  };

  const isParent = participants.length === 0 || (participants.length === 1 && spouseExists);
  const availableAgeRanges = isParent 
    ? ageRanges.filter(r => r !== '0-9' && r !== '10-18')
    : ageRanges.filter(r => r === '0-9' || r === '10-18');

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <CardTitle>{userType === 'group' ? trans.groupTitle : trans.title}</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {userType === 'group' && (
          <>
          <div className="space-y-4 p-4 bg-emerald-50 rounded-lg border-2 border-emerald-200">
            <div>
              <Label>{trans.groupName} *</Label>
              <Input
                value={groupInfo.name}
                onChange={(e) => setGroupInfo({ ...groupInfo, name: e.target.value })}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>{trans.leaderName} *</Label>
                <Input
                  value={groupInfo.leaderName}
                  onChange={(e) => setGroupInfo({ ...groupInfo, leaderName: e.target.value })}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </div>
              <div>
                <Label>{trans.leaderEmail} *</Label>
                <Input
                  type="email"
                  value={groupInfo.leaderEmail}
                  onChange={(e) => setGroupInfo({ ...groupInfo, leaderEmail: e.target.value })}
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>{trans.leaderPhone} *</Label>
                <Input
                  value={groupInfo.leaderPhone}
                  onChange={(e) => setGroupInfo({ ...groupInfo, leaderPhone: e.target.value })}
                />
              </div>
              <div>
                <Label>{trans.idNumber} * ({language === 'he' ? 'של המדריך' : 'Leader'})</Label>
                <Input
                  value={groupInfo.leaderIdNumber || ''}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setGroupInfo({ ...groupInfo, leaderIdNumber: val });
                  }}
                  maxLength={9}
                  placeholder="123456789"
                />
              </div>
            </div>
            <div>
              <Label>{trans.totalParticipants} *</Label>
              <Input
                type="number"
                min="1"
                value={groupInfo.totalParticipants || ''}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || '';
                  setGroupInfo({ ...groupInfo, totalParticipants: val });
                }}
                placeholder={language === 'he' ? 'לדוגמה: 25' : 'e.g., 25'}
              />
            </div>
          </div>

          <div className="pt-6 border-t mt-6">
            <h3 className="font-semibold text-lg mb-4">{trans.vehicleDetails}</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                <Checkbox
                  id="groupHasVehicle"
                  checked={vehicleInfo.hasVehicle}
                  onCheckedChange={(checked) => setVehicleInfo({...vehicleInfo, hasVehicle: checked})}
                />
                <Label htmlFor="groupHasVehicle" className="cursor-pointer font-semibold">
                  {trans.hasVehicle}
                </Label>
              </div>

              {vehicleInfo.hasVehicle && (
                <div className="grid sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div>
                    <Label>{trans.vehicleNumber}</Label>
                    <Input 
                      value={vehicleInfo?.number || ''}
                      onChange={(e) => setVehicleInfo && setVehicleInfo({...vehicleInfo, number: e.target.value})}
                      placeholder={trans.vehiclePlaceholder}
                      dir="ltr"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          </>
        )}

        <div className="space-y-4">
          {userType !== 'group' && (
            <>
              {participants.length === 0 && userType !== 'individual' && (
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <Checkbox
                    id="hasSpouse"
                    checked={hasSpouse}
                    onCheckedChange={setHasSpouse}
                  />
                  <Label htmlFor="hasSpouse" className="cursor-pointer font-semibold">
                    {trans.hasSpouse}
                  </Label>
                </div>
              )}
              
              {(userType !== 'individual' || participants.length === 0) && (
                <>
                  <h3 className="font-semibold text-lg">
                    {userType === 'individual'
                      ? trans.participantName
                      : participants.length === 0 
                      ? trans.parent1 
                      : participants.length === 1 && spouseExists
                      ? trans.parent2 
                      : `${trans.child} ${participants.length - (spouseExists ? 1 : 0)}`}
                  </h3>
                  
                  <div className="grid gap-4">
                    <div>
                      <Label>{trans.participantName} *</Label>
                      <Input
                        value={currentParticipant.name}
                        onChange={(e) => setCurrentParticipant({ ...currentParticipant, name: e.target.value })}
                        dir={isRTL ? 'rtl' : 'ltr'}
                        placeholder={language === 'he' ? 'שם מלא' : 'Full Name'}
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label>{trans.idNumber} *</Label>
                        <Input
                          value={currentParticipant.id_number}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            setCurrentParticipant({ ...currentParticipant, id_number: val });
                          }}
                          maxLength={9}
                          placeholder="123456789"
                        />
                      </div>
                      <div>
                        <Label>{trans.ageRange} *</Label>
                        <Select
                          value={currentParticipant.age_range}
                          onValueChange={(value) => setCurrentParticipant({ ...currentParticipant, age_range: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={trans.selectAge} />
                          </SelectTrigger>
                          <SelectContent>
                            {availableAgeRanges.map(range => (
                              <SelectItem key={range} value={range}>{range}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label>
                          {trans.phone} {(() => {
                            const isChild = typeof currentParticipant.age_range === 'string' && (currentParticipant.age_range.startsWith('0-') || currentParticipant.age_range.startsWith('10-'));
                            return isChild ? '' : '*';
                          })()}
                        </Label>
                        <Input
                          value={currentParticipant.phone}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            setCurrentParticipant({ ...currentParticipant, phone: val });
                          }}
                          maxLength={10}
                          placeholder="0501234567"
                        />
                      </div>
                      <div>
                        <Label>
                          {trans.email} {(() => {
                            const isChild = typeof currentParticipant.age_range === 'string' && (currentParticipant.age_range.startsWith('0-') || currentParticipant.age_range.startsWith('10-'));
                            const isParent2 = participants.length === 1 && spouseExists;
                            return (isChild || isParent2) ? '' : '*';
                          })()}
                        </Label>
                        <Input
                          type="email"
                          value={currentParticipant.email}
                          onChange={(e) => setCurrentParticipant({ ...currentParticipant, email: e.target.value })}
                          placeholder={language === 'he' ? 'example@email.com' : 'example@email.com'}
                        />
                      </div>
                    </div>

                    <Button
                      onClick={handleAdd}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {trans.add}
                    </Button>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {participants.length > 0 && (
          <>
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">{trans.participants} ({participants.length})</h3>
            <div className="space-y-2">
              {participants.map((p, idx) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            {userType === 'group' ? (
                              <div className="font-semibold">{p.id_number}</div>
                            ) : (
                              <>
                                <div className="font-semibold">{p.name}</div>
                                <div className="text-sm text-gray-600">
                                  {p.id_number}
                                  {p.age_range && ` • ${p.age_range}`}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setParticipants(participants.filter(pp => pp.id !== p.id))}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t mt-6">
            <h3 className="font-semibold text-lg mb-4">{trans.vehicleDetails}</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                <Checkbox
                  id="participantHasVehicle"
                  checked={vehicleInfo.hasVehicle}
                  onCheckedChange={(checked) => setVehicleInfo({...vehicleInfo, hasVehicle: checked})}
                />
                <Label htmlFor="participantHasVehicle" className="cursor-pointer font-semibold">
                  {trans.hasVehicle}
                </Label>
              </div>

              {vehicleInfo.hasVehicle && (
                <div className="grid sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div>
                    <Label>{trans.vehicleNumber}</Label>
                    <Input 
                      value={vehicleInfo?.number || ''}
                      onChange={(e) => setVehicleInfo && setVehicleInfo({...vehicleInfo, number: e.target.value})}
                      placeholder={trans.vehiclePlaceholder}
                      dir="ltr"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}