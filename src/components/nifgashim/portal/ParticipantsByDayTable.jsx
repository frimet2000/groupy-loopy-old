// @ts-nocheck
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Calendar, Users, CheckCircle, Clock, Filter } from 'lucide-react';
import { format } from 'date-fns';

export default function ParticipantsByDayTable({ registrations, trekDays, language, isRTL }) {
  const [selectedDay, setSelectedDay] = useState('all');

  const translations = {
    he: {
      title: "משתתפים לפי יום טיול",
      selectDay: "בחר יום",
      allDays: "כל הימים",
      day: "יום",
      name: "שם",
      phone: "טלפון",
      email: "אימייל",
      paymentStatus: "סטטוס תשלום",
      paid: "שולם",
      pending: "ממתין",
      participants: "משתתפים",
      downloadExcel: "הורד Excel",
      noParticipants: "אין משתתפים ליום זה",
      totalForDay: "סה״כ ליום",
      adults: "מבוגרים",
      children: "ילדים"
    },
    en: {
      title: "Participants by Trek Day",
      selectDay: "Select Day",
      allDays: "All Days",
      day: "Day",
      name: "Name",
      phone: "Phone",
      email: "Email",
      paymentStatus: "Payment Status",
      paid: "Paid",
      pending: "Pending",
      participants: "Participants",
      downloadExcel: "Download Excel",
      noParticipants: "No participants for this day",
      totalForDay: "Total for day",
      adults: "Adults",
      children: "Children"
    },
    ru: {
      title: "Участники по дням",
      selectDay: "Выберите день",
      allDays: "Все дни",
      day: "День",
      name: "Имя",
      phone: "Телефон",
      email: "Email",
      paymentStatus: "Статус оплаты",
      paid: "Оплачено",
      pending: "Ожидание",
      participants: "Участники",
      downloadExcel: "Скачать Excel",
      noParticipants: "Нет участников",
      totalForDay: "Всего за день",
      adults: "Взрослые",
      children: "Дети"
    },
    es: {
      title: "Participantes por día",
      selectDay: "Seleccionar día",
      allDays: "Todos los días",
      day: "Día",
      name: "Nombre",
      phone: "Teléfono",
      email: "Email",
      paymentStatus: "Estado de pago",
      paid: "Pagado",
      pending: "Pendiente",
      participants: "Participantes",
      downloadExcel: "Descargar Excel",
      noParticipants: "Sin participantes",
      totalForDay: "Total del día",
      adults: "Adultos",
      children: "Niños"
    },
    fr: {
      title: "Participants par jour",
      selectDay: "Sélectionner jour",
      allDays: "Tous les jours",
      day: "Jour",
      name: "Nom",
      phone: "Téléphone",
      email: "Email",
      paymentStatus: "Statut de paiement",
      paid: "Payé",
      pending: "En attente",
      participants: "Participants",
      downloadExcel: "Télécharger Excel",
      noParticipants: "Pas de participants",
      totalForDay: "Total du jour",
      adults: "Adultes",
      children: "Enfants"
    },
    de: {
      title: "Teilnehmer nach Tag",
      selectDay: "Tag auswählen",
      allDays: "Alle Tage",
      day: "Tag",
      name: "Name",
      phone: "Telefon",
      email: "Email",
      paymentStatus: "Zahlungsstatus",
      paid: "Bezahlt",
      pending: "Ausstehend",
      participants: "Teilnehmer",
      downloadExcel: "Excel herunterladen",
      noParticipants: "Keine Teilnehmer",
      totalForDay: "Gesamt für Tag",
      adults: "Erwachsene",
      children: "Kinder"
    },
    it: {
      title: "Partecipanti per giorno",
      selectDay: "Seleziona giorno",
      allDays: "Tutti i giorni",
      day: "Giorno",
      name: "Nome",
      phone: "Telefono",
      email: "Email",
      paymentStatus: "Stato pagamento",
      paid: "Pagato",
      pending: "In attesa",
      participants: "Partecipanti",
      downloadExcel: "Scarica Excel",
      noParticipants: "Nessun partecipante",
      totalForDay: "Totale giorno",
      adults: "Adulti",
      children: "Bambini"
    }
  };

  const trans = translations[language] || translations.en;

  // Get unique days from trek_days sorted by date
  const sortedDays = useMemo(() => {
    if (!trekDays || trekDays.length === 0) return [];
    return [...trekDays].sort((a, b) => {
      if (a.date && b.date) return new Date(a.date) - new Date(b.date);
      return (a.day_number || 0) - (b.day_number || 0);
    });
  }, [trekDays]);

  // Build participant list per day
  const participantsByDay = useMemo(() => {
    const byDay = {};
    
    registrations.forEach(reg => {
      const allParticipants = reg.participants || [];
      const selectedDays = reg.selectedDays || reg.selected_days || [];
      const isPaid = reg.payment_status === 'completed' || reg.status === 'completed';
      
      selectedDays.forEach(day => {
        const dayNum = typeof day === 'object' ? day.day_number : day;
        if (!byDay[dayNum]) byDay[dayNum] = [];
        
        allParticipants.forEach(p => {
          const pAge = p.age_range ? parseInt(p.age_range.split('-')[0]) : null;
          const isChild = pAge !== null && pAge < 10;
          
          byDay[dayNum].push({
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
        });
      });
    });
    
    return byDay;
  }, [registrations]);

  // Filter participants based on selected day
  const filteredParticipants = useMemo(() => {
    if (selectedDay === 'all') {
      // Combine all days, remove duplicates by email
      const seen = new Set();
      const all = [];
      Object.values(participantsByDay).flat().forEach(p => {
        const key = p.email || p.name;
        if (!seen.has(key)) {
          seen.add(key);
          all.push(p);
        }
      });
      return all;
    }
    return participantsByDay[selectedDay] || [];
  }, [selectedDay, participantsByDay]);

  // Stats for selected day
  const dayStats = useMemo(() => {
    const participants = filteredParticipants;
    return {
      total: participants.length,
      adults: participants.filter(p => !p.isChild).length,
      children: participants.filter(p => p.isChild).length,
      paid: participants.filter(p => p.isPaid).length,
      pending: participants.filter(p => !p.isPaid).length
    };
  }, [filteredParticipants]);

  // Download Excel for selected day
  const downloadExcel = () => {
    const dayLabel = selectedDay === 'all' 
      ? trans.allDays 
      : `${trans.day} ${selectedDay}`;
    
    const headers = [
      trans.name,
      trans.phone,
      trans.email,
      language === 'he' ? 'ת.ז' : 'ID',
      language === 'he' ? 'גיל' : 'Age',
      trans.paymentStatus,
      language === 'he' ? 'קבוצה' : 'Group'
    ].join(',');

    const rows = filteredParticipants.map(p => [
      p.name || '',
      p.phone || '',
      p.email || '',
      p.idNumber || '',
      p.ageRange || '',
      p.isPaid ? trans.paid : trans.pending,
      p.isGroup ? (p.groupName || 'Yes') : ''
    ].map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','));

    const csv = [headers, ...rows].join('\n');
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `nifgashim_${selectedDay === 'all' ? 'all_days' : `day_${selectedDay}`}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="w-5 h-5 text-indigo-600" />
            {trans.title}
          </CardTitle>
          
          <div className="flex flex-wrap items-center gap-3">
            <Select value={selectedDay} onValueChange={setSelectedDay}>
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder={trans.selectDay} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{trans.allDays}</SelectItem>
                {sortedDays.map(day => (
                  <SelectItem key={day.day_number} value={String(day.day_number)}>
                    {trans.day} {day.day_number}
                    {day.date && ` - ${format(new Date(day.date), 'dd/MM')}`}
                    {day.daily_title && ` (${day.daily_title.slice(0, 20)}${day.daily_title.length > 20 ? '...' : ''})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button
              onClick={downloadExcel}
              variant="default"
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              <Download className="w-4 h-4" />
              {trans.downloadExcel}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        {/* Stats Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-200">
            <div className="text-2xl font-bold text-blue-700">{dayStats.total}</div>
            <div className="text-xs text-blue-600">{trans.participants}</div>
          </div>
          <div className="bg-indigo-50 rounded-lg p-3 text-center border border-indigo-200">
            <div className="text-2xl font-bold text-indigo-700">{dayStats.adults}</div>
            <div className="text-xs text-indigo-600">{trans.adults}</div>
          </div>
          <div className="bg-pink-50 rounded-lg p-3 text-center border border-pink-200">
            <div className="text-2xl font-bold text-pink-700">{dayStats.children}</div>
            <div className="text-xs text-pink-600">{trans.children}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center border border-green-200">
            <div className="text-2xl font-bold text-green-700">{dayStats.paid}</div>
            <div className="text-xs text-green-600">{trans.paid}</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-3 text-center border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-700">{dayStats.pending}</div>
            <div className="text-xs text-yellow-600">{trans.pending}</div>
          </div>
        </div>

        {/* Participants Table */}
        {filteredParticipants.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>{trans.noParticipants}</p>
          </div>
        ) : (
          <div className="overflow-x-auto" dir={isRTL ? 'rtl' : 'ltr'}>
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gray-100 border-b-2 border-gray-200">
                <tr>
                  <th className={`px-3 py-3 font-semibold border-b ${isRTL ? 'text-right' : 'text-left'}`}>#</th>
                  <th className={`px-3 py-3 font-semibold border-b ${isRTL ? 'text-right' : 'text-left'}`}>{trans.name}</th>
                  <th className={`px-3 py-3 font-semibold border-b hidden sm:table-cell ${isRTL ? 'text-right' : 'text-left'}`}>{trans.phone}</th>
                  <th className={`px-3 py-3 font-semibold border-b hidden md:table-cell ${isRTL ? 'text-right' : 'text-left'}`}>{trans.email}</th>
                  <th className={`px-3 py-3 font-semibold border-b ${isRTL ? 'text-right' : 'text-left'}`}>{trans.paymentStatus}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredParticipants.map((p, idx) => (
                  <tr key={idx} className={`hover:bg-gray-50 ${p.isChild ? 'bg-pink-50/30' : ''}`}>
                    <td className={`px-3 py-3 text-gray-500 ${isRTL ? 'text-right' : 'text-left'}`}>{idx + 1}</td>
                    <td className={`px-3 py-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                      <div className="font-medium">{p.name}</div>
                      {p.isGroup && (
                        <Badge variant="outline" className="text-xs mt-1 bg-orange-50 text-orange-700 border-orange-300">
                          {p.groupName || (language === 'he' ? 'קבוצה' : 'Group')}
                        </Badge>
                      )}
                      {p.isChild && (
                        <Badge variant="outline" className="text-xs mt-1 bg-pink-50 text-pink-700 border-pink-300">
                          {p.ageRange}
                        </Badge>
                      )}
                    </td>
                    <td className={`px-3 py-3 hidden sm:table-cell ${isRTL ? 'text-right' : 'text-left'}`} dir="ltr">{p.phone}</td>
                    <td className={`px-3 py-3 hidden md:table-cell ${isRTL ? 'text-right' : 'text-left'}`} dir="ltr">{p.email}</td>
                    <td className={`px-3 py-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {p.isPaid ? (
                        <Badge className="bg-green-500 text-white gap-1">
                          <CheckCircle className="w-3 h-3" />
                          {trans.paid}
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-500 text-white gap-1">
                          <Clock className="w-3 h-3" />
                          {trans.pending}
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}