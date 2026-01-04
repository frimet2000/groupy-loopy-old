// @ts-nocheck
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Download, Search, Users, DollarSign, Calendar, Shield, Car, Heart, ChevronDown, ChevronUp, Baby, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MemorialSchedule from './MemorialSchedule';

export default function AdminDashboard({ trip, language, isRTL }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);
  const [localParticipants, setLocalParticipants] = useState(trip?.participants || []);

  const handleUpdateParticipant = (participantId, updates) => {
    setLocalParticipants(prev => prev.map(p => 
      p.id === participantId ? { ...p, ...updates } : p
    ));
  };

  const translations = {
    he: {
      title: "ניהול משתתפים - נפגשים בשביל ישראל",
      totalParticipants: "סך משתתפים",
      search: "חיפוש משתתף...",
      downloadCSV: "הורד CSV",
      name: "שם",
      idNumber: "ת.ז",
      phone: "טלפון",
      email: "אימייל",
      selectedDays: "ימים נבחרים",
      paymentStatus: "סטטוס תשלום",
      registeredAt: "נרשם בתאריך",
      completed: "שולם",
      pending: "ממתין",
      exempt: "פטור",
      groupType: "קבוצה",
      individual: "פרטי",
      noParticipants: "אין משתתפים רשומים",
      vehicle: "רכב",
      hasVehicle: "מגיע ברכב",
      noVehicle: "ללא רכב",
      vehicleNumber: "מס' רכב",
      familyMembers: "בני משפחה",
      ages: "גילאים",
      totalPeople: "סה\"ך אנשים",
      adultsCount: "מבוגרים",
      childrenCount: "ילדים",
      groupLeader: "מנהיג קבוצה",
      viewDetails: "הצג פרטים",
      hideDetails: "הסתר"
    },
    en: {
      title: "Participants Management - Nifgashim for Israel",
      totalParticipants: "Total Participants",
      search: "Search participant...",
      downloadCSV: "Download CSV",
      name: "Name",
      idNumber: "ID",
      phone: "Phone",
      email: "Email",
      selectedDays: "Selected Days",
      paymentStatus: "Payment Status",
      registeredAt: "Registered",
      completed: "Paid",
      pending: "Pending",
      exempt: "Exempt",
      groupType: "Group",
      individual: "Individual",
      noParticipants: "No registered participants",
      vehicle: "Vehicle",
      hasVehicle: "Has Vehicle",
      noVehicle: "No Vehicle",
      vehicleNumber: "Vehicle #",
      familyMembers: "Family Members",
      ages: "Ages",
      totalPeople: "Total People",
      adultsCount: "Adults",
      childrenCount: "Children",
      groupLeader: "Group Leader",
      viewDetails: "View Details",
      hideDetails: "Hide"
    },
    ru: {
      title: "Управление участниками - Нифгашим для Израиля",
      totalParticipants: "Всего участников",
      search: "Поиск участника...",
      downloadCSV: "Скачать CSV",
      name: "Имя",
      idNumber: "ID",
      phone: "Телефон",
      email: "Email",
      selectedDays: "Выбранные дни",
      paymentStatus: "Статус оплаты",
      registeredAt: "Зарегистрирован",
      completed: "Оплачено",
      pending: "Ожидание",
      exempt: "Освобожден",
      groupType: "Группа",
      individual: "Индивидуальный",
      noParticipants: "Нет зарегистрированных участников",
      familyMembers: "Члены семьи",
      ages: "Возраст",
      totalPeople: "Всего людей",
      adultsCount: "Взрослые",
      childrenCount: "Дети",
      groupLeader: "Лидер группы",
      viewDetails: "Показать",
      hideDetails: "Скрыть"
    },
    es: {
      title: "Gestión de participantes - Nifgashim para Israel",
      totalParticipants: "Total de participantes",
      search: "Buscar participante...",
      downloadCSV: "Descargar CSV",
      name: "Nombre",
      idNumber: "ID",
      phone: "Teléfono",
      email: "Email",
      selectedDays: "Días seleccionados",
      paymentStatus: "Estado de pago",
      registeredAt: "Registrado",
      completed: "Pagado",
      pending: "Pendiente",
      exempt: "Exento",
      groupType: "Grupo",
      individual: "Individual",
      noParticipants: "Sin participantes registrados",
      familyMembers: "Miembros",
      ages: "Edades",
      totalPeople: "Total",
      adultsCount: "Adultos",
      childrenCount: "Niños",
      groupLeader: "Líder",
      viewDetails: "Ver",
      hideDetails: "Ocultar"
    },
    fr: {
      title: "Gestion des participants - Nifgashim pour Israël",
      totalParticipants: "Total des participants",
      search: "Rechercher un participant...",
      downloadCSV: "Télécharger CSV",
      name: "Nom",
      idNumber: "ID",
      phone: "Téléphone",
      email: "Email",
      selectedDays: "Jours sélectionnés",
      paymentStatus: "Statut de paiement",
      registeredAt: "Inscrit",
      completed: "Payé",
      pending: "En attente",
      exempt: "Exempté",
      groupType: "Groupe",
      individual: "Individuel",
      noParticipants: "Aucun participant inscrit",
      familyMembers: "Famille",
      ages: "Âges",
      totalPeople: "Total",
      adultsCount: "Adultes",
      childrenCount: "Enfants",
      groupLeader: "Chef",
      viewDetails: "Voir",
      hideDetails: "Masquer"
    },
    de: {
      title: "Teilnehmerverwaltung - Nifgashim für Israel",
      totalParticipants: "Gesamtteilnehmer",
      search: "Teilnehmer suchen...",
      downloadCSV: "CSV herunterladen",
      name: "Name",
      idNumber: "ID",
      phone: "Telefon",
      email: "Email",
      selectedDays: "Ausgewählte Tage",
      paymentStatus: "Zahlungsstatus",
      registeredAt: "Registriert",
      completed: "Bezahlt",
      pending: "Ausstehend",
      exempt: "Befreit",
      groupType: "Gruppe",
      individual: "Individuell",
      noParticipants: "Keine registrierten Teilnehmer",
      familyMembers: "Familie",
      ages: "Alter",
      totalPeople: "Gesamt",
      adultsCount: "Erwachsene",
      childrenCount: "Kinder",
      groupLeader: "Leiter",
      viewDetails: "Zeigen",
      hideDetails: "Verbergen"
    },
    it: {
      title: "Gestione partecipanti - Nifgashim per Israele",
      totalParticipants: "Totale partecipanti",
      search: "Cerca partecipante...",
      downloadCSV: "Scarica CSV",
      name: "Nome",
      idNumber: "ID",
      phone: "Telefono",
      email: "Email",
      selectedDays: "Giorni selezionati",
      paymentStatus: "Stato pagamento",
      registeredAt: "Registrato",
      completed: "Pagato",
      pending: "In attesa",
      exempt: "Esente",
      groupType: "Gruppo",
      individual: "Individuale",
      noParticipants: "Nessun partecipante registrato",
      familyMembers: "Famiglia",
      ages: "Età",
      totalPeople: "Totale",
      adultsCount: "Adulti",
      childrenCount: "Bambini",
      groupLeader: "Leader",
      viewDetails: "Mostra",
      hideDetails: "Nascondi"
    }
  };

  const trans = translations[language] || translations.en;
  const participants = localParticipants;

  const filteredParticipants = participants.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone?.includes(searchTerm) ||
    p.id_number?.includes(searchTerm)
  );

  const totalPaid = participants.filter(p => p.payment_status === 'completed').length;
  const totalPending = participants.filter(p => p.payment_status === 'pending').length;
  const totalRevenue = participants.reduce((sum, p) => sum + (p.payment_amount || 0), 0);

  const downloadCSV = () => {
    const headers = [
      trans.name,
      trans.idNumber,
      trans.phone,
      trans.email,
      trans.vehicle,
      trans.selectedDays,
      trans.totalPeople,
      trans.ages,
      trans.paymentStatus,
      language === 'he' ? 'סכום' : 'Amount',
      trans.registeredAt
    ].join(',');

    const rows = participants.map(p => [
      p.name || '',
      p.id_number || '',
      p.phone || '',
      p.email || '',
      p.has_vehicle ? `${trans.hasVehicle} (${p.vehicle_number || ''})` : trans.noVehicle,
      (p.selected_days || []).join(';'),
      p.total_people || 1,
      p.age_range || '',
      p.payment_status || 'pending',
      p.payment_amount || 0,
      p.joined_at ? new Date(p.joined_at).toLocaleDateString('he-IL') : ''
    ].map(cell => `"${cell}"`).join(','));

    const csv = [headers, ...rows].join('\n');
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `nifgashim_participants_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const getPaymentStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'exempt': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Shield className="w-8 h-8" />
            {trans.title}
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{participants.length}</div>
                <div className="text-sm text-gray-600">{trans.totalParticipants}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{totalPaid}</div>
                <div className="text-sm text-gray-600">{trans.completed}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold">{totalPending}</div>
                <div className="text-sm text-gray-600">{trans.pending}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">₪{totalRevenue.toLocaleString()}</div>
                <div className="text-sm text-gray-600">{language === 'he' ? 'סה"כ הכנסות' : 'Total Revenue'}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder={trans.search}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              onClick={downloadCSV}
              className="bg-emerald-600 hover:bg-emerald-700 whitespace-nowrap"
            >
              <Download className="w-4 h-4 mr-2" />
              {trans.downloadCSV}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Tabs defaultValue="participants" className="w-full">
            <div className="p-4 border-b">
              <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                <TabsTrigger value="participants" className="gap-2">
                  <Users className="w-4 h-4" />
                  {language === 'he' ? 'משתתפים' : 'Participants'}
                </TabsTrigger>
                <TabsTrigger value="memorials" className="gap-2">
                  <Heart className="w-4 h-4" />
                  {language === 'he' ? 'הנצחה ושיבוץ' : 'Memorials & Schedule'}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="participants" className="m-0">
              {filteredParticipants.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-semibold">{trans.noParticipants}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b-2 border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-8"></th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{trans.name}</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 hidden sm:table-cell">{trans.phone}</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 hidden md:table-cell">{trans.selectedDays}</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 hidden lg:table-cell">{trans.totalPeople}</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{trans.paymentStatus}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredParticipants.map((participant, idx) => (
                        <React.Fragment key={idx}>
                          <motion.tr
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: idx * 0.02 }}
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => setExpandedRow(expandedRow === idx ? null : idx)}
                          >
                            <td className="px-4 py-3">
                              <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
                                {expandedRow === idx ? (
                                  <ChevronUp className="w-4 h-4 text-gray-600" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-gray-600" />
                                )}
                              </Button>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-semibold text-gray-900">{participant.name}</div>
                              {participant.is_organized_group && (
                                <Badge variant="outline" className="mt-1 text-xs bg-blue-50">
                                  {participant.group_name || trans.groupType}
                                </Badge>
                              )}
                              <div className="text-xs text-gray-500 mt-1">{participant.email}</div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 hidden sm:table-cell">
                              {participant.phone || '-'}
                            </td>
                            <td className="px-4 py-3 hidden md:table-cell">
                              <div className="flex flex-wrap gap-1">
                                {(participant.selected_days || []).slice(0, 3).map((day, i) => (
                                  <Badge key={i} variant="outline" className="text-xs bg-purple-50">
                                    {language === 'he' ? `יום ${day}` : `Day ${day}`}
                                  </Badge>
                                ))}
                                {(participant.selected_days || []).length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{(participant.selected_days || []).length - 3}
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold text-gray-900 hidden lg:table-cell">
                              {participant.total_people || 1}
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant="outline" className={`border ${getPaymentStatusColor(participant.payment_status)}`}>
                                {trans[participant.payment_status] || participant.payment_status}
                              </Badge>
                            </td>
                          </motion.tr>

                          {/* Expanded Details */}
                          <AnimatePresence>
                            {expandedRow === idx && (
                              <motion.tr
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-blue-50/30"
                              >
                                <td colSpan="6" className="px-4 py-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-white rounded-lg shadow-sm">
                                    {/* Basic Info */}
                                    <div className="space-y-2">
                                      <h4 className="font-semibold text-sm text-gray-700 border-b pb-1">
                                        {language === 'he' ? 'פרטים בסיסיים' : 'Basic Info'}
                                      </h4>
                                      <div className="text-sm space-y-1">
                                        <div><span className="font-medium">{trans.idNumber}:</span> {participant.id_number || '-'}</div>
                                        <div><span className="font-medium">{trans.email}:</span> {participant.email || '-'}</div>
                                        <div><span className="font-medium">{trans.phone}:</span> {participant.phone || '-'}</div>
                                        {participant.age_range && (
                                          <div><span className="font-medium">{trans.ages}:</span> {participant.age_range}</div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Selected Days Details */}
                                    <div className="space-y-2">
                                      <h4 className="font-semibold text-sm text-gray-700 border-b pb-1">
                                        {trans.selectedDays}
                                      </h4>
                                      <div className="flex flex-wrap gap-1">
                                        {(participant.selected_days || []).map((day, i) => (
                                          <Badge key={i} variant="outline" className="text-xs bg-purple-50">
                                            {language === 'he' ? `יום ${day}` : `Day ${day}`}
                                          </Badge>
                                        ))}
                                        {(participant.selected_days || []).length === 0 && (
                                          <span className="text-sm text-gray-400">{language === 'he' ? 'לא נבחרו ימים' : 'No days selected'}</span>
                                        )}
                                      </div>
                                    </div>

                                    {/* Family/Group Info */}
                                    {(participant.is_organized_group || participant.total_people > 1) && (
                                      <div className="space-y-2">
                                        <h4 className="font-semibold text-sm text-gray-700 border-b pb-1">
                                          {participant.is_organized_group ? trans.groupType : trans.familyMembers}
                                        </h4>
                                        <div className="text-sm space-y-1">
                                          {participant.is_organized_group && (
                                            <>
                                              <div><span className="font-medium">{language === 'he' ? 'שם קבוצה:' : 'Group Name:'}:</span> {participant.group_name || '-'}</div>
                                              <div><span className="font-medium">{language === 'he' ? 'סוג:' : 'Type:'}:</span> {participant.group_type || '-'}</div>
                                            </>
                                          )}
                                          <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4 text-blue-600" />
                                            <span className="font-medium">{trans.totalPeople}:</span> {participant.total_people || 1}
                                          </div>
                                          {participant.children_details && participant.children_details.length > 0 && (
                                            <div className="mt-2 space-y-1">
                                              <div className="font-medium text-xs text-gray-600">{language === 'he' ? 'ילדים:' : 'Children:'}</div>
                                              {participant.children_details.map((child, i) => (
                                                <div key={i} className="flex items-center gap-2 text-xs bg-blue-50 p-2 rounded">
                                                  <Baby className="w-3 h-3 text-blue-600" />
                                                  <span>{child.full_name}</span>
                                                  <span className="text-gray-500">({child.age || child.age_range})</span>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}

                                    {/* Vehicle Info */}
                                    {participant.has_vehicle && (
                                      <div className="space-y-2">
                                        <h4 className="font-semibold text-sm text-gray-700 border-b pb-1">
                                          {trans.vehicle}
                                        </h4>
                                        <div className="flex items-center gap-2 text-sm">
                                          <Car className="w-4 h-4 text-blue-600" />
                                          <span className="font-medium">{trans.vehicleNumber}:</span>
                                          <span className="font-mono">{participant.vehicle_number || '-'}</span>
                                        </div>
                                      </div>
                                    )}

                                    {/* Payment Info */}
                                    <div className="space-y-2">
                                      <h4 className="font-semibold text-sm text-gray-700 border-b pb-1">
                                        {language === 'he' ? 'מידע תשלום' : 'Payment Info'}
                                      </h4>
                                      <div className="text-sm space-y-1">
                                        <div><span className="font-medium">{language === 'he' ? 'סכום:' : 'Amount:'}:</span> ₪{participant.payment_amount || 0}</div>
                                        <div><span className="font-medium">{language === 'he' ? 'סטטוס:' : 'Status:'}:</span> {trans[participant.payment_status] || participant.payment_status}</div>
                                        {participant.payment_transaction_id && (
                                          <div className="text-xs text-gray-500">
                                            <span className="font-medium">{language === 'he' ? 'מס\' עסקה:' : 'Transaction:'}:</span> {participant.payment_transaction_id}
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Registration Date */}
                                    <div className="space-y-2">
                                      <h4 className="font-semibold text-sm text-gray-700 border-b pb-1">
                                        {trans.registeredAt}
                                      </h4>
                                      <div className="text-sm">
                                        {participant.joined_at ? new Date(participant.joined_at).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US', {
                                          year: 'numeric',
                                          month: 'long',
                                          day: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        }) : '-'}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </motion.tr>
                            )}
                          </AnimatePresence>
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="memorials" className="m-0 bg-gray-50/50">
              <MemorialSchedule 
                trip={trip} 
                participants={localParticipants}
                onUpdateParticipant={handleUpdateParticipant}
                language={language}
                isRTL={isRTL}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}