import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '../../LanguageContext';
import { Plus, Trash2, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

export default function ParticipantForm({ userType, participants, setParticipants, groupInfo, setGroupInfo }) {
  const { language, isRTL } = useLanguage();
  const [currentParticipant, setCurrentParticipant] = useState({
    name: '',
    id_number: '',
    age_range: '',
    phone: '',
    email: ''
  });

  const translations = {
    he: {
      title: "פרטי משתתפים",
      groupTitle: "פרטי הקבוצה",
      groupName: "שם הקבוצה",
      leaderName: "שם מנהיג הקבוצה",
      leaderEmail: "אימייל",
      leaderPhone: "טלפון",
      participantName: "שם מלא",
      idNumber: "תעודת זהות",
      ageRange: "טווח גילאים",
      phone: "טלפון",
      email: "אימייל (אופציונלי)",
      add: "הוסף משתתף",
      participants: "משתתפים",
      selectAge: "בחר טווח גילאים"
    },
    en: {
      title: "Participant Details",
      groupTitle: "Group Details",
      groupName: "Group Name",
      leaderName: "Group Leader Name",
      leaderEmail: "Email",
      leaderPhone: "Phone",
      participantName: "Full Name",
      idNumber: "ID Number",
      ageRange: "Age Range",
      phone: "Phone",
      email: "Email (Optional)",
      add: "Add Participant",
      participants: "Participants",
      selectAge: "Select Age Range"
    },
    ru: {
      title: "Данные участников",
      groupTitle: "Данные группы",
      groupName: "Название группы",
      leaderName: "Имя руководителя",
      leaderEmail: "Email",
      leaderPhone: "Телефон",
      participantName: "Полное имя",
      idNumber: "ID номер",
      ageRange: "Возрастная группа",
      phone: "Телефон",
      email: "Email (необязательно)",
      add: "Добавить участника",
      participants: "Участники",
      selectAge: "Выберите возраст"
    },
    es: {
      title: "Detalles de participantes",
      groupTitle: "Detalles del grupo",
      groupName: "Nombre del grupo",
      leaderName: "Nombre del líder",
      leaderEmail: "Email",
      leaderPhone: "Teléfono",
      participantName: "Nombre completo",
      idNumber: "Número de ID",
      ageRange: "Rango de edad",
      phone: "Teléfono",
      email: "Email (opcional)",
      add: "Añadir participante",
      participants: "Participantes",
      selectAge: "Seleccionar edad"
    },
    fr: {
      title: "Détails des participants",
      groupTitle: "Détails du groupe",
      groupName: "Nom du groupe",
      leaderName: "Nom du chef",
      leaderEmail: "Email",
      leaderPhone: "Téléphone",
      participantName: "Nom complet",
      idNumber: "Numéro d'ID",
      ageRange: "Tranche d'âge",
      phone: "Téléphone",
      email: "Email (facultatif)",
      add: "Ajouter participant",
      participants: "Participants",
      selectAge: "Sélectionner l'âge"
    },
    de: {
      title: "Teilnehmerdetails",
      groupTitle: "Gruppendetails",
      groupName: "Gruppenname",
      leaderName: "Name des Leiters",
      leaderEmail: "Email",
      leaderPhone: "Telefon",
      participantName: "Vollständiger Name",
      idNumber: "ID-Nummer",
      ageRange: "Altersbereich",
      phone: "Telefon",
      email: "Email (optional)",
      add: "Teilnehmer hinzufügen",
      participants: "Teilnehmer",
      selectAge: "Altersbereich wählen"
    },
    it: {
      title: "Dettagli partecipanti",
      groupTitle: "Dettagli gruppo",
      groupName: "Nome del gruppo",
      leaderName: "Nome del leader",
      leaderEmail: "Email",
      leaderPhone: "Telefono",
      participantName: "Nome completo",
      idNumber: "Numero ID",
      ageRange: "Fascia d'età",
      phone: "Telefono",
      email: "Email (facoltativo)",
      add: "Aggiungi partecipante",
      participants: "Partecipanti",
      selectAge: "Seleziona età"
    }
  };

  const trans = translations[language] || translations.en;

  const ageRanges = ['0-9', '10-17', '18-25', '26-35', '36-50', '51-65', '65+'];

  const handleAdd = () => {
    if (!currentParticipant.name || !currentParticipant.id_number) {
      return;
    }
    setParticipants([...participants, { ...currentParticipant, id: Date.now() }]);
    setCurrentParticipant({ name: '', id_number: '', age_range: '', phone: '', email: '' });
  };

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <CardTitle>{userType === 'group' ? trans.groupTitle : trans.title}</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {userType === 'group' && (
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
            <div>
              <Label>{trans.leaderPhone} *</Label>
              <Input
                value={groupInfo.leaderPhone}
                onChange={(e) => setGroupInfo({ ...groupInfo, leaderPhone: e.target.value })}
              />
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="font-semibold text-lg">{trans.add}</h3>
          
          <div className="grid gap-4">
            <div>
              <Label>{trans.participantName} *</Label>
              <Input
                value={currentParticipant.name}
                onChange={(e) => setCurrentParticipant({ ...currentParticipant, name: e.target.value })}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>{trans.idNumber} *</Label>
                <Input
                  value={currentParticipant.id_number}
                  onChange={(e) => setCurrentParticipant({ ...currentParticipant, id_number: e.target.value })}
                  maxLength={9}
                />
              </div>
              <div>
                <Label>{trans.ageRange}</Label>
                <Select
                  value={currentParticipant.age_range}
                  onValueChange={(value) => setCurrentParticipant({ ...currentParticipant, age_range: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={trans.selectAge} />
                  </SelectTrigger>
                  <SelectContent>
                    {ageRanges.map(range => (
                      <SelectItem key={range} value={range}>{range}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>{trans.phone}</Label>
                <Input
                  value={currentParticipant.phone}
                  onChange={(e) => setCurrentParticipant({ ...currentParticipant, phone: e.target.value })}
                />
              </div>
              <div>
                <Label>{trans.email}</Label>
                <Input
                  type="email"
                  value={currentParticipant.email}
                  onChange={(e) => setCurrentParticipant({ ...currentParticipant, email: e.target.value })}
                />
              </div>
            </div>

            <Button
              onClick={handleAdd}
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={!currentParticipant.name || !currentParticipant.id_number}
            >
              <Plus className="w-4 h-4 mr-2" />
              {trans.add}
            </Button>
          </div>
        </div>

        {participants.length > 0 && (
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
                            <div className="font-semibold">{p.name}</div>
                            <div className="text-sm text-gray-600">
                              {p.id_number}
                              {p.age_range && ` • ${p.age_range}`}
                            </div>
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
        )}
      </CardContent>
    </Card>
  );
}