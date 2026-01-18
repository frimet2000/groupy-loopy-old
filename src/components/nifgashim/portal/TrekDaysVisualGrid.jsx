// @ts-nocheck
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { 
  Calendar, 
  Users, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  X,
  Search,
  Download,
  ChevronRight,
  Mountain
} from 'lucide-react';
import { format } from 'date-fns';

export default function TrekDaysVisualGrid({ registrations, trekDays, language, isRTL }) {
  const [selectedDay, setSelectedDay] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const translations = {
    he: {
      title: "ימי טיול - תצוגה גרפית",
      participants: "משתתפים",
      adults: "מבוגרים",
      children: "ילדים",
      paid: "שילמו",
      pending: "ממתינים",
      notPaid: "לא שולם",
      day: "יום",
      clickToView: "לחץ לצפייה במשתתפים",
      noParticipants: "אין משתתפים ליום זה",
      participantDetails: "פרטי משתתפים",
      name: "שם",
      phone: "טלפון",
      email: "אימייל",
      idNumber: "ת.ז",
      age: "גיל",
      paymentStatus: "סטטוס תשלום",
      search: "חיפוש משתתף...",
      downloadExcel: "הורד Excel",
      close: "סגור",
      total: "סה״כ"
    },
    en: {
      title: "Trek Days - Visual View",
      participants: "Participants",
      adults: "Adults",
      children: "Children",
      paid: "Paid",
      pending: "Pending",
      notPaid: "Not Paid",
      day: "Day",
      clickToView: "Click to view participants",
      noParticipants: "No participants for this day",
      participantDetails: "Participant Details",
      name: "Name",
      phone: "Phone",
      email: "Email",
      idNumber: "ID",
      age: "Age",
      paymentStatus: "Payment Status",
      search: "Search participant...",
      downloadExcel: "Download Excel",
      close: "Close",
      total: "Total"
    },
    ru: {
      title: "Дни похода - Визуальный вид",
      participants: "Участники",
      adults: "Взрослые",
      children: "Дети",
      paid: "Оплачено",
      pending: "Ожидание",
      notPaid: "Не оплачено",
      day: "День",
      clickToView: "Нажмите для просмотра",
      noParticipants: "Нет участников",
      participantDetails: "Детали участников",
      name: "Имя",
      phone: "Телефон",
      email: "Email",
      idNumber: "ID",
      age: "Возраст",
      paymentStatus: "Статус оплаты",
      search: "Поиск участника...",
      downloadExcel: "Скачать Excel",
      close: "Закрыть",
      total: "Всего"
    },
    es: {
      title: "Días de Trek - Vista Visual",
      participants: "Participantes",
      adults: "Adultos",
      children: "Niños",
      paid: "Pagado",
      pending: "Pendiente",
      notPaid: "No pagado",
      day: "Día",
      clickToView: "Clic para ver participantes",
      noParticipants: "Sin participantes",
      participantDetails: "Detalles de participantes",
      name: "Nombre",
      phone: "Teléfono",
      email: "Email",
      idNumber: "ID",
      age: "Edad",
      paymentStatus: "Estado de pago",
      search: "Buscar participante...",
      downloadExcel: "Descargar Excel",
      close: "Cerrar",
      total: "Total"
    },
    fr: {
      title: "Jours de Trek - Vue Visuelle",
      participants: "Participants",
      adults: "Adultes",
      children: "Enfants",
      paid: "Payé",
      pending: "En attente",
      notPaid: "Non payé",
      day: "Jour",
      clickToView: "Cliquez pour voir",
      noParticipants: "Pas de participants",
      participantDetails: "Détails des participants",
      name: "Nom",
      phone: "Téléphone",
      email: "Email",
      idNumber: "ID",
      age: "Âge",
      paymentStatus: "Statut de paiement",
      search: "Rechercher...",
      downloadExcel: "Télécharger Excel",
      close: "Fermer",
      total: "Total"
    },
    de: {
      title: "Trek-Tage - Visuelle Ansicht",
      participants: "Teilnehmer",
      adults: "Erwachsene",
      children: "Kinder",
      paid: "Bezahlt",
      pending: "Ausstehend",
      notPaid: "Nicht bezahlt",
      day: "Tag",
      clickToView: "Klicken zum Anzeigen",
      noParticipants: "Keine Teilnehmer",
      participantDetails: "Teilnehmerdetails",
      name: "Name",
      phone: "Telefon",
      email: "Email",
      idNumber: "ID",
      age: "Alter",
      paymentStatus: "Zahlungsstatus",
      search: "Teilnehmer suchen...",
      downloadExcel: "Excel herunterladen",
      close: "Schließen",
      total: "Gesamt"
    },
    it: {
      title: "Giorni di Trek - Vista Visuale",
      participants: "Partecipanti",
      adults: "Adulti",
      children: "Bambini",
      paid: "Pagato",
      pending: "In attesa",
      notPaid: "Non pagato",
      day: "Giorno",
      clickToView: "Clicca per vedere",
      noParticipants: "Nessun partecipante",
      participantDetails: "Dettagli partecipanti",
      name: "Nome",
      phone: "Telefono",
      email: "Email",
      idNumber: "ID",
      age: "Età",
      paymentStatus: "Stato pagamento",
      search: "Cerca partecipante...",
      downloadExcel: "Scarica Excel",
      close: "Chiudi",
      total: "Totale"
    }
  };

  const trans = translations[language] || translations.en;

  // Sort trek days by date
  const sortedDays = useMemo(() => {
    if (!trekDays || trekDays.length === 0) return [];
    return [...trekDays].sort((a, b) => {
      if (a.date && b.date) return new Date(a.date) - new Date(b.date);
      return (a.day_number || 0) - (b.day_number || 0);
    });
  }, [trekDays]);

  // Build participant data per day
  const participantsByDay = useMemo(() => {
    const byDay = {};
    
    registrations.forEach(reg => {
      const allParticipants = reg.participants || [];
      const selectedDays = reg.selectedDays || reg.selected_days || [];
      const isPaid = reg.payment_status === 'completed' || reg.status === 'completed';
      
      selectedDays.forEach(day => {
        const dayNum = typeof day === 'object' ? day.day_number : day;
        if (!byDay[dayNum]) {
          byDay[dayNum] = {
            participants: [],
            total: 0,
            adults: 0,
            children: 0,
            paid: 0,
            pending: 0
          };
        }
        
        allParticipants.forEach(p => {
          const pAge = p.age_range ? parseInt(p.age_range.split('-')[0]) : null;
          const isChild = pAge !== null && pAge < 10;
          
          byDay[dayNum].participants.push({
            name: p.name || reg.customer_name || reg.customer_email,
            phone: p.phone || reg.emergency_contact_phone || '',
            email: p.email || reg.customer_email || reg.user_email || '',
            idNumber: p.id_number || '',
            ageRange: p.age_range || '',
            isChild,
            isPaid,
            paymentStatus: reg.payment_status,
            registrationId: reg.id,
            isGroup: reg.is_organized_group,
            groupName: reg.group_name
          });
          
          byDay[dayNum].total++;
          if (isChild) byDay[dayNum].children++;
          else byDay[dayNum].adults++;
          if (isPaid) byDay[dayNum].paid++;
          else byDay[dayNum].pending++;
        });
      });
    });
    
    return byDay;
  }, [registrations]);

  // Filter participants in dialog
  const filteredParticipants = useMemo(() => {
    if (!selectedDay) return [];
    const dayData = participantsByDay[selectedDay.day_number];
    if (!dayData) return [];
    
    if (!searchTerm) return dayData.participants;
    
    const searchLower = searchTerm.toLowerCase();
    return dayData.participants.filter(p => 
      p.name?.toLowerCase().includes(searchLower) ||
      p.email?.toLowerCase().includes(searchLower) ||
      p.phone?.includes(searchTerm) ||
      p.idNumber?.includes(searchTerm)
    );
  }, [selectedDay, participantsByDay, searchTerm]);

  // Download Excel for selected day
  const downloadDayExcel = () => {
    if (!selectedDay) return;
    
    const dayData = participantsByDay[selectedDay.day_number];
    if (!dayData) return;
    
    const headers = [
      trans.name,
      trans.phone,
      trans.email,
      trans.idNumber,
      trans.age,
      trans.paymentStatus
    ].join(',');

    const rows = dayData.participants.map(p => [
      p.name || '',
      p.phone || '',
      p.email || '',
      p.idNumber || '',
      p.ageRange || '',
      p.isPaid ? trans.paid : trans.notPaid
    ].map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','));

    const csv = [headers, ...rows].join('\n');
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `day_${selectedDay.day_number}_participants_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Get color based on category (Negev=yellow, North/Center=green)
  const getDayColor = (dayNum) => {
    // Find the day to get its category
    const day = sortedDays.find(d => d.day_number === dayNum);
    const categoryId = day?.category_id?.toLowerCase() || '';
    
    // Negev - yellow
    if (categoryId.includes('negev') || categoryId.includes('נגב')) {
      return 'from-yellow-100 to-yellow-200 border-yellow-400';
    }
    // North or Center - green
    if (categoryId.includes('north') || categoryId.includes('צפון') || 
        categoryId.includes('center') || categoryId.includes('מרכז')) {
      return 'from-green-100 to-emerald-100 border-green-400';
    }
    
    // Default - green
    return 'from-green-100 to-emerald-100 border-green-400';
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Mountain className="w-5 h-5 text-purple-600" />
          {trans.title}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 sm:p-6">
        {/* Days Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4" dir={isRTL ? 'rtl' : 'ltr'}>
          {sortedDays.map((day, idx) => {
            const dayData = participantsByDay[day.day_number] || { total: 0, adults: 0, children: 0, paid: 0, pending: 0 };
            const hasParticipants = dayData.total > 0;
            
            return (
              <motion.div
                key={day.day_number}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedDay(day)}
                className="cursor-pointer"
              >
                <div className={`
                  relative rounded-xl border-2 p-3 sm:p-4 
                  bg-gradient-to-br ${getDayColor(day.day_number)}
                  transition-all duration-300 hover:shadow-lg
                  ${hasParticipants ? 'hover:border-purple-500' : ''}
                  ${isRTL ? 'text-right' : ''}
                `}>
                  {/* Day Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-purple-600" />
                      <span className="font-bold text-purple-900 text-sm sm:text-base">
                        {trans.day} {day.day_number}
                      </span>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-purple-400 ${isRTL ? 'rotate-180' : ''}`} />
                  </div>
                  
                  {/* Date */}
                  {day.date && (
                    <div className="text-xs text-gray-600 mb-2">
                      {format(new Date(day.date), 'dd/MM/yyyy')}
                    </div>
                  )}
                  
                  {/* Title */}
                  {day.daily_title && (
                    <div className="text-xs font-medium text-gray-700 mb-3 line-clamp-2">
                      {day.daily_title}
                    </div>
                  )}
                  
                  {/* Stats */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-blue-600" />
                        <span className="text-xs text-gray-600">{trans.total}</span>
                      </div>
                      <span className="font-bold text-blue-700 text-sm">{dayData.total}</span>
                    </div>
                    
                    {hasParticipants && (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-green-600" />
                            <span className="text-xs text-gray-500">{trans.paid}</span>
                          </div>
                          <span className="font-semibold text-green-700 text-xs">{dayData.paid}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-yellow-600" />
                            <span className="text-xs text-gray-500">{trans.pending}</span>
                          </div>
                          <span className="font-semibold text-yellow-700 text-xs">{dayData.pending}</span>
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* Progress Bar */}
                  {hasParticipants && (
                    <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
                        style={{ width: `${(dayData.paid / dayData.total) * 100}%` }}
                      />
                    </div>
                  )}
                  
                  {/* Click hint */}
                  <div className="text-[10px] text-center text-purple-500 mt-2 opacity-70">
                    {trans.clickToView}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Summary Stats - Count UNIQUE participants across all registrations, not per day */}
        {(() => {
          // Calculate unique totals from registrations, not from participantsByDay
          let uniqueTotal = 0;
          let uniqueAdults = 0;
          let uniqueChildren = 0;
          let uniquePaid = 0;
          
          registrations.forEach(reg => {
            const allParticipants = reg.participants || [];
            const isPaid = reg.payment_status === 'completed' || reg.status === 'completed';
            
            allParticipants.forEach(p => {
              uniqueTotal++;
              const pAge = p.age_range ? parseInt(p.age_range.split('-')[0]) : null;
              const isChild = pAge !== null && pAge < 10;
              if (isChild) uniqueChildren++;
              else uniqueAdults++;
              if (isPaid) uniquePaid++;
            });
          });
          
          return (
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-200">
                <div className="text-2xl font-bold text-blue-700">{uniqueTotal}</div>
                <div className="text-xs text-blue-600">{trans.participants} {trans.total}</div>
              </div>
              <div className="bg-indigo-50 rounded-lg p-3 text-center border border-indigo-200">
                <div className="text-2xl font-bold text-indigo-700">{uniqueAdults}</div>
                <div className="text-xs text-indigo-600">{trans.adults}</div>
              </div>
              <div className="bg-pink-50 rounded-lg p-3 text-center border border-pink-200">
                <div className="text-2xl font-bold text-pink-700">{uniqueChildren}</div>
                <div className="text-xs text-pink-600">{trans.children}</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center border border-green-200">
                <div className="text-2xl font-bold text-green-700">{uniquePaid}</div>
                <div className="text-xs text-green-600">{trans.paid}</div>
              </div>
            </div>
          );
        })()}
      </CardContent>

      {/* Participants Dialog */}
      <Dialog open={!!selectedDay} onOpenChange={() => {
        setSelectedDay(null);
        setSearchTerm('');
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="flex items-center gap-3 text-lg">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold">
                  {trans.day} {selectedDay?.day_number}
                  {selectedDay?.daily_title && ` - ${selectedDay.daily_title}`}
                </div>
                {selectedDay?.date && (
                  <div className="text-sm font-normal text-gray-500">
                    {format(new Date(selectedDay.date), 'dd/MM/yyyy')}
                  </div>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="py-4 space-y-4 overflow-y-auto max-h-[calc(90vh-200px)]">
            {/* Stats Row */}
            {selectedDay && participantsByDay[selectedDay.day_number] && (
              <div className="grid grid-cols-4 gap-2">
                <div className="bg-blue-50 rounded-lg p-2 text-center">
                  <div className="text-xl font-bold text-blue-700">
                    {participantsByDay[selectedDay.day_number].total}
                  </div>
                  <div className="text-xs text-blue-600">{trans.total}</div>
                </div>
                <div className="bg-indigo-50 rounded-lg p-2 text-center">
                  <div className="text-xl font-bold text-indigo-700">
                    {participantsByDay[selectedDay.day_number].adults}
                  </div>
                  <div className="text-xs text-indigo-600">{trans.adults}</div>
                </div>
                <div className="bg-pink-50 rounded-lg p-2 text-center">
                  <div className="text-xl font-bold text-pink-700">
                    {participantsByDay[selectedDay.day_number].children}
                  </div>
                  <div className="text-xs text-pink-600">{trans.children}</div>
                </div>
                <div className="bg-green-50 rounded-lg p-2 text-center">
                  <div className="text-xl font-bold text-green-700">
                    {participantsByDay[selectedDay.day_number].paid}
                  </div>
                  <div className="text-xs text-green-600">{trans.paid}</div>
                </div>
              </div>
            )}

            {/* Search and Download */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
                <Input
                  placeholder={trans.search}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`${isRTL ? 'pr-9' : 'pl-9'}`}
                />
              </div>
              <Button
                onClick={downloadDayExcel}
                variant="outline"
                className="gap-2 bg-green-50 border-green-300 text-green-700 hover:bg-green-100"
              >
                <Download className="w-4 h-4" />
                {trans.downloadExcel}
              </Button>
            </div>

            {/* Participants List */}
            {filteredParticipants.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{trans.noParticipants}</p>
              </div>
            ) : (
              <div className="space-y-2" dir={isRTL ? 'rtl' : 'ltr'}>
                {filteredParticipants.map((p, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    className={`
                      rounded-lg p-3 border-2 transition-all text-start
                      ${p.isChild 
                        ? 'bg-pink-50 border-pink-200' 
                        : 'bg-white border-gray-200'}
                      ${p.isPaid 
                        ? (isRTL ? 'border-r-4 border-r-green-500' : 'border-l-4 border-l-green-500')
                        : (isRTL ? 'border-r-4 border-r-yellow-500' : 'border-l-4 border-l-yellow-500')}
                    `}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className={`
                          w-10 h-10 rounded-full flex items-center justify-center text-white font-bold
                          ${p.isChild ? 'bg-pink-500' : 'bg-blue-500'}
                        `}>
                          {idx + 1}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{p.name}</div>
                          <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                            {p.phone && (
                              <span className="flex items-center gap-1" dir="ltr">
                                <Phone className="w-3 h-3" />
                                {p.phone}
                              </span>
                            )}
                            {p.email && (
                              <span className="flex items-center gap-1" dir="ltr">
                                <Mail className="w-3 h-3" />
                                {p.email}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 sm:mr-0 mr-auto">
                        {p.ageRange && (
                          <Badge variant="outline" className={p.isChild ? 'bg-pink-100 text-pink-700 border-pink-300' : 'bg-blue-100 text-blue-700 border-blue-300'}>
                            {p.ageRange}
                          </Badge>
                        )}
                        {p.isGroup && (
                          <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
                            {p.groupName || (language === 'he' ? 'קבוצה' : 'Group')}
                          </Badge>
                        )}
                        <Badge className={p.isPaid ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'}>
                          {p.isPaid ? (
                            <><CheckCircle className="w-3 h-3 mr-1" />{trans.paid}</>
                          ) : (
                            <><Clock className="w-3 h-3 mr-1" />{trans.notPaid}</>
                          )}
                        </Badge>
                      </div>
                    </div>
                    
                    {p.idNumber && (
                      <div className="mt-2 text-xs text-gray-500">
                        {trans.idNumber}: {p.idNumber}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t">
            <Button
              onClick={() => {
                setSelectedDay(null);
                setSearchTerm('');
              }}
              variant="outline"
              className="w-full"
            >
              <X className="w-4 h-4 mr-2" />
              {trans.close}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}