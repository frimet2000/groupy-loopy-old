import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '../components/LanguageContext';
import MemorialsManager from '../components/nifgashim/MemorialsManager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Users,
  DollarSign,
  Calendar,
  Download,
  Search,
  Loader2,
  Shield,
  Heart,
  CheckCircle,
  Clock,
  XCircle,
  Filter,
  BarChart3,
  Send,
  Mail,
  MessageSquare,
  Phone,
  QrCode,
  MapPin,
  User,
  UsersRound,
  TrendingUp,
  FileText,
  Check,
  X,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  Bell,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

export default function NifgashimAdmin() {
  const { language, isRTL } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [dayFilter, setDayFilter] = useState('all');
  const [groupFilter, setGroupFilter] = useState('all');
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [messageDialog, setMessageDialog] = useState(null);
  const [messageContent, setMessageContent] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [checkInDialog, setCheckInDialog] = useState(null);
  const [sendingReminders, setSendingReminders] = useState(false);
  const [selectedForReminder, setSelectedForReminder] = useState([]);

  const translations = {
    he: {
      title: "ניהול נפגשים בשביל ישראל",
      dashboard: "לוח בקרה",
      registrations: "נרשמים",
      memorials: "זכר החללים",
      statistics: "סטטיסטיקות",
      messaging: "הודעות",
      checkIn: "צ'ק-אין",
      totalRegistrations: "סה״כ נרשמים",
      totalPaid: "שילמו",
      totalPending: "ממתינים לתשלום",
      totalRevenue: "סה״כ הכנסות",
      search: "חיפוש לפי שם, אימייל, ת.ז...",
      filterByStatus: "סינון לפי סטטוס",
      filterByPayment: "סינון לפי תשלום",
      filterByDay: "סינון לפי יום",
      filterByType: "סינון לפי סוג",
      all: "הכל",
      draft: "טיוטה",
      submitted: "נשלח",
      confirmed: "מאושר",
      cancelled: "בוטל",
      completed: "שולם",
      pending: "ממתין",
      partial: "חלקי",
      refunded: "הוחזר",
      exempt: "פטור",
      individuals: "יחידים",
      families: "משפחות",
      organizedGroups: "קבוצות מאורגנות",
      name: "שם",
      idNumber: "ת.ז",
      phone: "טלפון",
      email: "אימייל",
      selectedDays: "ימים נבחרים",
      totalDays: "סה״כ ימים",
      paymentStatus: "סטטוס תשלום",
      amount: "סכום",
      registeredAt: "תאריך רישום",
      actions: "פעולות",
      viewDetails: "פרטים",
      sendMessage: "שלח הודעה",
      sendWhatsApp: "שלח WhatsApp",
      sendEmail: "שלח מייל",
      markAsPaid: "סמן כשולם",
      sendReminder: "שלח תזכורת תשלום",
      sendReminders: "שלח תזכורות",
      sendingReminders: "שולח תזכורות...",
      remindersSent: "תזכורות נשלחו בהצלחה",
      selectForReminder: "בחר לתזכורת",
      approve: "אשר",
      reject: "דחה",
      downloadCSV: "הורד CSV",
      downloadExcel: "הורד Excel",
      selectAll: "בחר הכל",
      sendBulkMessage: "שלח הודעה לנבחרים",
      noRegistrations: "אין נרשמים עדיין",
      groupName: "שם קבוצה",
      groupType: "סוג קבוצה",
      approvalStatus: "סטטוס אישור",
      needsApproval: "ממתין לאישור",
      military: "צבא",
      school: "בית ספר",
      youth_group: "תנועת נוער",
      other: "אחר",
      approved: "מאושר",
      rejected: "נדחה",
      registrationsByDay: "רישומים לפי יום",
      paymentBreakdown: "פילוח תשלומים",
      groupsBreakdown: "פילוח קבוצות",
      checkInParticipant: "צ'ק-אין משתתף",
      checkInSuccess: "צ'ק-אין בוצע בהצלחה",
      messageType: "סוג הודעה",
      chat: "צ'ט",
      whatsapp: "WhatsApp",
      messageContent: "תוכן ההודעה",
      send: "שלח",
      cancel: "ביטול",
      close: "סגור",
      familyMembers: "בני משפחה",
      me: "אני",
      spouse: "בן/בת זוג",
      children: "ילדים",
      pets: "חיות מחמד",
      other: "אחר",
      childDetails: "פרטי ילדים",
      fullName: "שם מלא",
      age: "גיל",
      emergencyContact: "איש קשר חירום",
      dietary: "העדפות תזונה",
      medical: "מצבים רפואיים",
      selectedCategories: "קטגוריות נבחרות"
    },
    en: {
      title: "Nifgashim for Israel Management",
      dashboard: "Dashboard",
      registrations: "Registrations",
      memorials: "Memorials",
      statistics: "Statistics",
      messaging: "Messaging",
      checkIn: "Check-In",
      totalRegistrations: "Total Registrations",
      totalPaid: "Paid",
      totalPending: "Pending Payment",
      totalRevenue: "Total Revenue",
      search: "Search by name, email, ID...",
      filterByStatus: "Filter by Status",
      filterByPayment: "Filter by Payment",
      filterByDay: "Filter by Day",
      filterByType: "Filter by Type",
      all: "All",
      draft: "Draft",
      submitted: "Submitted",
      confirmed: "Confirmed",
      cancelled: "Cancelled",
      completed: "Paid",
      pending: "Pending",
      partial: "Partial",
      refunded: "Refunded",
      exempt: "Exempt",
      individuals: "Individuals",
      families: "Families",
      organizedGroups: "Organized Groups",
      name: "Name",
      idNumber: "ID Number",
      phone: "Phone",
      email: "Email",
      selectedDays: "Selected Days",
      totalDays: "Total Days",
      paymentStatus: "Payment Status",
      amount: "Amount",
      registeredAt: "Registration Date",
      actions: "Actions",
      viewDetails: "Details",
      sendMessage: "Send Message",
      sendWhatsApp: "Send WhatsApp",
      sendEmail: "Send Email",
      markAsPaid: "Mark as Paid",
      approve: "Approve",
      reject: "Reject",
      downloadCSV: "Download CSV",
      downloadExcel: "Download Excel",
      selectAll: "Select All",
      sendBulkMessage: "Send to Selected",
      noRegistrations: "No registrations yet",
      groupName: "Group Name",
      groupType: "Group Type",
      approvalStatus: "Approval Status",
      needsApproval: "Needs Approval",
      military: "Military",
      school: "School",
      youth_group: "Youth Group",
      other: "Other",
      approved: "Approved",
      rejected: "Rejected",
      registrationsByDay: "Registrations by Day",
      paymentBreakdown: "Payment Breakdown",
      groupsBreakdown: "Groups Breakdown",
      checkInParticipant: "Check-In Participant",
      checkInSuccess: "Check-in successful",
      messageType: "Message Type",
      chat: "Chat",
      whatsapp: "WhatsApp",
      messageContent: "Message Content",
      send: "Send",
      cancel: "Cancel",
      close: "Close",
      familyMembers: "Family Members",
      me: "Me",
      spouse: "Spouse",
      children: "Children",
      pets: "Pets",
      other: "Other",
      childDetails: "Children Details",
      fullName: "Full Name",
      age: "Age",
      emergencyContact: "Emergency Contact",
      dietary: "Dietary Preferences",
      medical: "Medical Conditions",
      selectedCategories: "Selected Categories"
    },
    ru: {
      title: "Управление Nifgashim для Израиля",
      dashboard: "Панель",
      registrations: "Регистрации",
      memorials: "Мемориалы",
      statistics: "Статистика",
      messaging: "Сообщения",
      checkIn: "Регистрация",
      totalRegistrations: "Всего регистраций",
      totalPaid: "Оплачено",
      totalPending: "Ожидание оплаты",
      totalRevenue: "Общий доход",
      search: "Поиск по имени, email, ID...",
      filterByStatus: "Фильтр по статусу",
      filterByPayment: "Фильтр по оплате",
      filterByDay: "Фильтр по дню",
      filterByType: "Фильтр по типу",
      all: "Все",
      draft: "Черновик",
      submitted: "Отправлено",
      confirmed: "Подтверждено",
      cancelled: "Отменено",
      completed: "Оплачено",
      pending: "Ожидание",
      partial: "Частично",
      refunded: "Возврат",
      exempt: "Освобожден",
      individuals: "Индивидуально",
      families: "Семьи",
      organizedGroups: "Организованные группы",
      name: "Имя",
      idNumber: "ID",
      phone: "Телефон",
      email: "Email",
      selectedDays: "Выбранные дни",
      totalDays: "Всего дней",
      paymentStatus: "Статус оплаты",
      amount: "Сумма",
      registeredAt: "Дата регистрации",
      actions: "Действия",
      viewDetails: "Детали",
      sendMessage: "Отправить сообщение",
      sendWhatsApp: "Отправить WhatsApp",
      sendEmail: "Отправить Email",
      markAsPaid: "Отметить как оплачено",
      approve: "Одобрить",
      reject: "Отклонить",
      downloadCSV: "Скачать CSV",
      downloadExcel: "Скачать Excel",
      selectAll: "Выбрать все",
      sendBulkMessage: "Отправить выбранным",
      noRegistrations: "Пока нет регистраций",
      groupName: "Название группы",
      groupType: "Тип группы",
      approvalStatus: "Статус одобрения",
      needsApproval: "Требует одобрения",
      military: "Военные",
      school: "Школа",
      youth_group: "Молодежная группа",
      other: "Другое",
      approved: "Одобрено",
      rejected: "Отклонено",
      registrationsByDay: "Регистрации по дням",
      paymentBreakdown: "Разбивка платежей",
      groupsBreakdown: "Разбивка групп",
      checkInParticipant: "Регистрация участника",
      checkInSuccess: "Регистрация успешна",
      messageType: "Тип сообщения",
      chat: "Чат",
      whatsapp: "WhatsApp",
      messageContent: "Содержание",
      send: "Отправить",
      cancel: "Отмена",
      close: "Закрыть",
      familyMembers: "Члены семьи",
      me: "Я",
      spouse: "Супруг",
      children: "Дети",
      pets: "Питомцы",
      other: "Другое",
      childDetails: "Детали детей",
      fullName: "Полное имя",
      age: "Возраст",
      emergencyContact: "Экстренный контакт",
      dietary: "Диета",
      medical: "Медицинские состояния",
      selectedCategories: "Выбранные категории"
    },
    es: {
      title: "Gestión Nifgashim para Israel",
      dashboard: "Panel",
      registrations: "Registros",
      memorials: "Memoriales",
      statistics: "Estadísticas",
      messaging: "Mensajes",
      checkIn: "Check-In",
      totalRegistrations: "Total registros",
      totalPaid: "Pagados",
      totalPending: "Pendientes de pago",
      totalRevenue: "Ingresos totales",
      search: "Buscar por nombre, email, ID...",
      filterByStatus: "Filtrar por estado",
      filterByPayment: "Filtrar por pago",
      filterByDay: "Filtrar por día",
      filterByType: "Filtrar por tipo",
      all: "Todos",
      draft: "Borrador",
      submitted: "Enviado",
      confirmed: "Confirmado",
      cancelled: "Cancelado",
      completed: "Pagado",
      pending: "Pendiente",
      partial: "Parcial",
      refunded: "Reembolsado",
      exempt: "Exento",
      individuals: "Individuales",
      families: "Familias",
      organizedGroups: "Grupos organizados",
      name: "Nombre",
      idNumber: "ID",
      phone: "Teléfono",
      email: "Email",
      selectedDays: "Días seleccionados",
      totalDays: "Total días",
      paymentStatus: "Estado de pago",
      amount: "Cantidad",
      registeredAt: "Fecha de registro",
      actions: "Acciones",
      viewDetails: "Detalles",
      sendMessage: "Enviar mensaje",
      sendWhatsApp: "Enviar WhatsApp",
      sendEmail: "Enviar Email",
      markAsPaid: "Marcar como pagado",
      approve: "Aprobar",
      reject: "Rechazar",
      downloadCSV: "Descargar CSV",
      downloadExcel: "Descargar Excel",
      selectAll: "Seleccionar todo",
      sendBulkMessage: "Enviar a seleccionados",
      noRegistrations: "Sin registros aún",
      groupName: "Nombre del grupo",
      groupType: "Tipo de grupo",
      approvalStatus: "Estado de aprobación",
      needsApproval: "Necesita aprobación",
      military: "Militar",
      school: "Escuela",
      youth_group: "Grupo juvenil",
      other: "Otro",
      approved: "Aprobado",
      rejected: "Rechazado",
      registrationsByDay: "Registros por día",
      paymentBreakdown: "Desglose de pagos",
      groupsBreakdown: "Desglose de grupos",
      checkInParticipant: "Check-in participante",
      checkInSuccess: "Check-in exitoso",
      messageType: "Tipo de mensaje",
      chat: "Chat",
      whatsapp: "WhatsApp",
      messageContent: "Contenido",
      send: "Enviar",
      cancel: "Cancelar",
      close: "Cerrar",
      familyMembers: "Miembros de la familia",
      me: "Yo",
      spouse: "Cónyuge",
      children: "Niños",
      pets: "Mascotas",
      other: "Otro",
      childDetails: "Detalles de niños",
      fullName: "Nombre completo",
      age: "Edad",
      emergencyContact: "Contacto de emergencia",
      dietary: "Preferencias dietéticas",
      medical: "Condiciones médicas",
      selectedCategories: "Categorías seleccionadas"
    },
    fr: {
      title: "Gestion Nifgashim pour Israël",
      dashboard: "Tableau de bord",
      registrations: "Inscriptions",
      memorials: "Mémoriaux",
      statistics: "Statistiques",
      messaging: "Messages",
      checkIn: "Enregistrement",
      totalRegistrations: "Total inscriptions",
      totalPaid: "Payés",
      totalPending: "En attente de paiement",
      totalRevenue: "Revenus totaux",
      search: "Rechercher par nom, email, ID...",
      filterByStatus: "Filtrer par statut",
      filterByPayment: "Filtrer par paiement",
      filterByDay: "Filtrer par jour",
      filterByType: "Filtrer par type",
      all: "Tous",
      draft: "Brouillon",
      submitted: "Soumis",
      confirmed: "Confirmé",
      cancelled: "Annulé",
      completed: "Payé",
      pending: "En attente",
      partial: "Partiel",
      refunded: "Remboursé",
      exempt: "Exempté",
      individuals: "Individuels",
      families: "Familles",
      organizedGroups: "Groupes organisés",
      name: "Nom",
      idNumber: "ID",
      phone: "Téléphone",
      email: "Email",
      selectedDays: "Jours sélectionnés",
      totalDays: "Total jours",
      paymentStatus: "Statut de paiement",
      amount: "Montant",
      registeredAt: "Date d'inscription",
      actions: "Actions",
      viewDetails: "Détails",
      sendMessage: "Envoyer un message",
      sendWhatsApp: "Envoyer WhatsApp",
      sendEmail: "Envoyer Email",
      markAsPaid: "Marquer comme payé",
      approve: "Approuver",
      reject: "Rejeter",
      downloadCSV: "Télécharger CSV",
      downloadExcel: "Télécharger Excel",
      selectAll: "Tout sélectionner",
      sendBulkMessage: "Envoyer aux sélectionnés",
      noRegistrations: "Pas encore d'inscriptions",
      groupName: "Nom du groupe",
      groupType: "Type de groupe",
      approvalStatus: "Statut d'approbation",
      needsApproval: "Besoin d'approbation",
      military: "Militaire",
      school: "École",
      youth_group: "Groupe de jeunes",
      other: "Autre",
      approved: "Approuvé",
      rejected: "Rejeté",
      registrationsByDay: "Inscriptions par jour",
      paymentBreakdown: "Répartition des paiements",
      groupsBreakdown: "Répartition des groupes",
      checkInParticipant: "Enregistrer participant",
      checkInSuccess: "Enregistrement réussi",
      messageType: "Type de message",
      chat: "Chat",
      whatsapp: "WhatsApp",
      messageContent: "Contenu",
      send: "Envoyer",
      cancel: "Annuler",
      close: "Fermer",
      familyMembers: "Membres de la famille",
      me: "Moi",
      spouse: "Conjoint",
      children: "Enfants",
      pets: "Animaux",
      other: "Autre",
      childDetails: "Détails des enfants",
      fullName: "Nom complet",
      age: "Âge",
      emergencyContact: "Contact d'urgence",
      dietary: "Préférences alimentaires",
      medical: "Conditions médicales",
      selectedCategories: "Catégories sélectionnées"
    },
    de: {
      title: "Nifgashim für Israel Management",
      dashboard: "Dashboard",
      registrations: "Anmeldungen",
      memorials: "Gedenkstätten",
      statistics: "Statistiken",
      messaging: "Nachrichten",
      checkIn: "Check-In",
      totalRegistrations: "Gesamt Anmeldungen",
      totalPaid: "Bezahlt",
      totalPending: "Ausstehende Zahlung",
      totalRevenue: "Gesamteinnahmen",
      search: "Suche nach Name, Email, ID...",
      filterByStatus: "Nach Status filtern",
      filterByPayment: "Nach Zahlung filtern",
      filterByDay: "Nach Tag filtern",
      filterByType: "Nach Typ filtern",
      all: "Alle",
      draft: "Entwurf",
      submitted: "Eingereicht",
      confirmed: "Bestätigt",
      cancelled: "Abgesagt",
      completed: "Bezahlt",
      pending: "Ausstehend",
      partial: "Teilweise",
      refunded: "Rückerstattet",
      exempt: "Befreit",
      individuals: "Einzelpersonen",
      families: "Familien",
      organizedGroups: "Organisierte Gruppen",
      name: "Name",
      idNumber: "ID-Nummer",
      phone: "Telefon",
      email: "Email",
      selectedDays: "Ausgewählte Tage",
      totalDays: "Gesamt Tage",
      paymentStatus: "Zahlungsstatus",
      amount: "Betrag",
      registeredAt: "Registrierungsdatum",
      actions: "Aktionen",
      viewDetails: "Details",
      sendMessage: "Nachricht senden",
      sendWhatsApp: "WhatsApp senden",
      sendEmail: "Email senden",
      markAsPaid: "Als bezahlt markieren",
      approve: "Genehmigen",
      reject: "Ablehnen",
      downloadCSV: "CSV herunterladen",
      downloadExcel: "Excel herunterladen",
      selectAll: "Alle auswählen",
      sendBulkMessage: "An ausgewählte senden",
      noRegistrations: "Noch keine Anmeldungen",
      groupName: "Gruppenname",
      groupType: "Gruppentyp",
      approvalStatus: "Genehmigungsstatus",
      needsApproval: "Genehmigung erforderlich",
      military: "Militär",
      school: "Schule",
      youth_group: "Jugendgruppe",
      other: "Andere",
      approved: "Genehmigt",
      rejected: "Abgelehnt",
      registrationsByDay: "Anmeldungen nach Tag",
      paymentBreakdown: "Zahlungsaufschlüsselung",
      groupsBreakdown: "Gruppenaufschlüsselung",
      checkInParticipant: "Teilnehmer einchecken",
      checkInSuccess: "Check-in erfolgreich",
      messageType: "Nachrichtentyp",
      chat: "Chat",
      whatsapp: "WhatsApp",
      messageContent: "Inhalt",
      send: "Senden",
      cancel: "Abbrechen",
      close: "Schließen",
      familyMembers: "Familienmitglieder",
      me: "Ich",
      spouse: "Ehepartner",
      children: "Kinder",
      pets: "Haustiere",
      other: "Andere",
      childDetails: "Kinderdetails",
      fullName: "Vollständiger Name",
      age: "Alter",
      emergencyContact: "Notfallkontakt",
      dietary: "Ernährungspräferenzen",
      medical: "Medizinische Bedingungen",
      selectedCategories: "Ausgewählte Kategorien"
    },
    it: {
      title: "Gestione Nifgashim per Israele",
      dashboard: "Dashboard",
      registrations: "Registrazioni",
      memorials: "Memoriali",
      statistics: "Statistiche",
      messaging: "Messaggi",
      checkIn: "Check-In",
      totalRegistrations: "Registrazioni totali",
      totalPaid: "Pagati",
      totalPending: "In attesa di pagamento",
      totalRevenue: "Entrate totali",
      search: "Cerca per nome, email, ID...",
      filterByStatus: "Filtra per stato",
      filterByPayment: "Filtra per pagamento",
      filterByDay: "Filtra per giorno",
      filterByType: "Filtra per tipo",
      all: "Tutti",
      draft: "Bozza",
      submitted: "Inviato",
      confirmed: "Confermato",
      cancelled: "Annullato",
      completed: "Pagato",
      pending: "In attesa",
      partial: "Parziale",
      refunded: "Rimborsato",
      exempt: "Esente",
      individuals: "Individuali",
      families: "Famiglie",
      organizedGroups: "Gruppi organizzati",
      name: "Nome",
      idNumber: "ID",
      phone: "Telefono",
      email: "Email",
      selectedDays: "Giorni selezionati",
      totalDays: "Totale giorni",
      paymentStatus: "Stato pagamento",
      amount: "Importo",
      registeredAt: "Data registrazione",
      actions: "Azioni",
      viewDetails: "Dettagli",
      sendMessage: "Invia messaggio",
      sendWhatsApp: "Invia WhatsApp",
      sendEmail: "Invia Email",
      markAsPaid: "Segna come pagato",
      approve: "Approva",
      reject: "Rifiuta",
      downloadCSV: "Scarica CSV",
      downloadExcel: "Scarica Excel",
      selectAll: "Seleziona tutto",
      sendBulkMessage: "Invia ai selezionati",
      noRegistrations: "Nessuna registrazione",
      groupName: "Nome gruppo",
      groupType: "Tipo gruppo",
      approvalStatus: "Stato approvazione",
      needsApproval: "Richiede approvazione",
      military: "Militare",
      school: "Scuola",
      youth_group: "Gruppo giovanile",
      other: "Altro",
      approved: "Approvato",
      rejected: "Rifiutato",
      registrationsByDay: "Registrazioni per giorno",
      paymentBreakdown: "Ripartizione pagamenti",
      groupsBreakdown: "Ripartizione gruppi",
      checkInParticipant: "Check-in partecipante",
      checkInSuccess: "Check-in riuscito",
      messageType: "Tipo messaggio",
      chat: "Chat",
      whatsapp: "WhatsApp",
      messageContent: "Contenuto",
      send: "Invia",
      cancel: "Annulla",
      close: "Chiudi",
      familyMembers: "Membri famiglia",
      me: "Io",
      spouse: "Coniuge",
      children: "Bambini",
      pets: "Animali",
      other: "Altro",
      childDetails: "Dettagli bambini",
      fullName: "Nome completo",
      age: "Età",
      emergencyContact: "Contatto emergenza",
      dietary: "Preferenze dietetiche",
      medical: "Condizioni mediche",
      selectedCategories: "Categorie selezionate"
    }
  };

  const trans = translations[language] || translations.en;

  // Check if user is Nifgashim organizer
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await base44.auth.me();
        
        // Check if user is organizer of any Nifgashim trip
        const nifgashimTrips = await base44.entities.Trip.filter({ 
          activity_type: 'trek',
          duration_type: 'multi_day'
        });
        
        const isOrganizer = nifgashimTrips.some(trip => 
          trip.organizer_email === userData.email ||
          trip.additional_organizers?.some(org => org.email === userData.email)
        );
        
        if (!isOrganizer && userData.role !== 'admin') {
          toast.error(language === 'he' ? 'אין לך הרשאות גישה' : 'Access denied');
          navigate('/');
          return;
        }
        
        setUser(userData);
      } catch (e) {
        base44.auth.redirectToLogin();
      }
    };
    checkAuth();
  }, [navigate, language]);

  // Fetch Nifgashim trips
  const { data: nifgashimTrips = [] } = useQuery({
    queryKey: ['nifgashim-trips'],
    queryFn: () => base44.entities.Trip.filter({ 
      activity_type: 'trek',
      duration_type: 'multi_day'
    }),
    enabled: !!user,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: 1,
    staleTime: 60000,
    refetchInterval: 120000
  });

  // Get the latest/active Nifgashim trip
  const activeTrip = nifgashimTrips.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0];

  // Fetch registrations
  const { data: registrations = [], isLoading: loadingRegistrations } = useQuery({
    queryKey: ['nifgashim-registrations'],
    queryFn: () => base44.entities.NifgashimRegistration.list('-created_date'),
    enabled: !!user,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: 1,
    staleTime: 60000,
    refetchInterval: 120000
  });

  const updateRegistrationMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.NifgashimRegistration.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['nifgashim-registrations']);
    }
  });

  // Filtering
  const filteredRegistrations = registrations.filter(reg => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
      reg.user_email?.toLowerCase().includes(searchLower) ||
      reg.id_number?.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || reg.registration_status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || reg.payment_status === paymentFilter;
    const matchesDay = dayFilter === 'all' || reg.selected_days?.includes(parseInt(dayFilter));
    
    let matchesType = true;
    if (groupFilter === 'individuals') {
      const totalPeople = 1 + 
        (reg.family_members?.spouse ? 1 : 0) +
        (reg.children_details?.length || 0) +
        (reg.family_members?.other ? 1 : 0);
      matchesType = totalPeople === 1 && !reg.is_organized_group;
    } else if (groupFilter === 'families') {
      const totalPeople = 1 + 
        (reg.family_members?.spouse ? 1 : 0) +
        (reg.children_details?.length || 0) +
        (reg.family_members?.other ? 1 : 0);
      matchesType = totalPeople > 1 && !reg.is_organized_group;
    } else if (groupFilter === 'organizedGroups') {
      matchesType = reg.is_organized_group === true;
    }
    
    return matchesSearch && matchesStatus && matchesPayment && matchesDay && matchesType;
  });

  // Statistics
  const stats = {
    total: registrations.length,
    paid: registrations.filter(r => r.payment_status === 'completed').length,
    pending: registrations.filter(r => r.payment_status === 'pending').length,
    revenue: registrations.reduce((sum, r) => sum + (r.amount_paid || 0), 0),
    needsApproval: registrations.filter(r => r.is_organized_group && r.group_approval_status === 'pending').length
  };

  // Registrations by day
  const registrationsByDay = {};
  registrations.forEach(reg => {
    (reg.selected_days || []).forEach(day => {
      if (!registrationsByDay[day]) registrationsByDay[day] = 0;
      registrationsByDay[day]++;
    });
  });

  // Age statistics
  const ageStats = {
    adults: 0,
    children: 0,
    childrenByAge: {
      '0-2': 0,
      '3-6': 0,
      '7-10': 0,
      '11-14': 0,
      '15-18': 0,
      '18-21': 0,
      '21+': 0
    }
  };

  registrations.forEach(reg => {
    // Count adults (participant + spouse)
    ageStats.adults += 1;
    if (reg.family_members?.spouse) ageStats.adults += 1;
    
    // Count children
    const childrenCount = reg.children_details?.length || 0;
    ageStats.children += childrenCount;
    
    // Count by age range
    (reg.children_details || []).forEach(child => {
      if (child.age_range && ageStats.childrenByAge[child.age_range] !== undefined) {
        ageStats.childrenByAge[child.age_range]++;
      }
    });
  });

  // Download CSV
  const downloadCSV = () => {
    const headers = [
      trans.name,
      trans.idNumber,
      trans.phone || 'Phone',
      trans.email,
      trans.selectedDays,
      trans.totalDays,
      trans.paymentStatus,
      trans.amount,
      trans.registeredAt,
      trans.groupType
    ].join(',');

    const rows = filteredRegistrations.map(reg => {
      const userName = reg.user_email; // We'll fetch full names later if needed
      return [
        userName,
        reg.id_number || '',
        reg.emergency_contact_phone || '',
        reg.user_email || '',
        (reg.selected_days || []).join(';'),
        (reg.selected_days || []).length,
        reg.payment_status || 'pending',
        reg.total_amount || 0,
        reg.created_date ? format(new Date(reg.created_date), 'yyyy-MM-dd') : '',
        reg.is_organized_group ? (reg.group_name || trans.organizedGroups) : (reg.children_details?.length > 0 ? trans.families : trans.individuals)
      ].map(cell => `"${cell}"`).join(',');
    });

    const csv = [headers, ...rows].join('\n');
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `nifgashim_registrations_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleSendMessage = async (messageType) => {
    if (!messageContent.trim()) {
      toast.error(language === 'he' ? 'נא להזין תוכן הודעה' : 'Please enter message content');
      return;
    }

    setSendingMessage(true);
    try {
      if (messageType === 'email') {
        await base44.integrations.Core.SendEmail({
          to: messageDialog.user_email,
          subject: language === 'he' ? 'הודעה ממארגני נפגשים' : 'Message from Nifgashim Organizers',
          body: messageContent
        });
      } else if (messageType === 'whatsapp') {
        const phone = messageDialog.emergency_contact_phone;
        if (!phone) {
          toast.error(language === 'he' ? 'אין מספר טלפון' : 'No phone number');
          return;
        }
        window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(messageContent)}`, '_blank');
      }
      
      toast.success(language === 'he' ? 'ההודעה נשלחה' : 'Message sent');
      setMessageDialog(null);
      setMessageContent('');
    } catch (error) {
      toast.error(language === 'he' ? 'שגיאה בשליחת הודעה' : 'Error sending message');
    }
    setSendingMessage(false);
  };

  const handleMarkAsPaid = async (registrationId) => {
    updateRegistrationMutation.mutate({
      id: registrationId,
      data: { 
        payment_status: 'completed',
        amount_paid: registrations.find(r => r.id === registrationId).total_amount
      }
    });
    toast.success(language === 'he' ? 'סומן כשולם' : 'Marked as paid');
  };

  const handleApproveGroup = async (registrationId) => {
    updateRegistrationMutation.mutate({
      id: registrationId,
      data: { group_approval_status: 'approved' }
    });
    toast.success(language === 'he' ? 'הקבוצה אושרה' : 'Group approved');
  };

  const handleRejectGroup = async (registrationId) => {
    updateRegistrationMutation.mutate({
      id: registrationId,
      data: { group_approval_status: 'rejected' }
    });
    toast.success(language === 'he' ? 'הקבוצה נדחתה' : 'Group rejected');
  };

  const getPaymentStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'partial': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'exempt': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-4 sm:py-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-2xl p-4 sm:p-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-3xl font-bold text-white">{trans.title}</h1>
                <p className="text-purple-100 text-xs sm:text-sm mt-1">
                  {language === 'he' ? 'ניהול מתקדם של רישומים והנצחות' : 'Advanced registrations and memorials management'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recent Payment Activity Card */}
        <Card className="mb-6 border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2 text-emerald-800">
              <TrendingUp className="w-5 h-5" />
              {language === 'he' ? 'פעילות תשלומים אחרונה' : 'Recent Payment Activity'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            {registrations.filter(r => r.payment_status === 'completed' && r.transaction_id).length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                {language === 'he' ? 'אין תשלומים שהושלמו עדיין' : 'No completed payments yet'}
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {registrations
                  .filter(r => r.payment_status === 'completed')
                  .sort((a, b) => new Date(b.completed_at || b.updated_date || 0) - new Date(a.completed_at || a.updated_date || 0))
                  .slice(0, 5)
                  .map((reg, idx) => {
                    const mainParticipant = reg.participants?.[0] || {};
                    return (
                      <div key={reg.id} className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm border border-green-100">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-sm text-gray-900">
                              {mainParticipant.name || reg.customer_email || reg.user_email}
                            </p>
                            <p className="text-xs text-gray-500">
                              {reg.transaction_id ? `TXN: ${reg.transaction_id.slice(0, 12)}...` : ''}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-700">₪{reg.amount || reg.total_amount || 0}</p>
                          <p className="text-xs text-gray-400">
                            {reg.completed_at ? format(new Date(reg.completed_at), 'dd/MM HH:mm') : 
                             reg.updated_date ? format(new Date(reg.updated_date), 'dd/MM HH:mm') : '-'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
            
            {/* Pending Payments Alert */}
            {registrations.filter(r => r.payment_status === 'pending').length > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-2 text-yellow-800">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {language === 'he' 
                      ? `${registrations.filter(r => r.payment_status === 'pending').length} תשלומים ממתינים`
                      : `${registrations.filter(r => r.payment_status === 'pending').length} payments pending`}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-lg flex items-center justify-center shadow">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold text-blue-900">{stats.total}</div>
                    <div className="text-xs sm:text-sm text-blue-700 font-medium">{trans.totalRegistrations}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-600 rounded-lg flex items-center justify-center shadow">
                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold text-green-900">{stats.paid}</div>
                    <div className="text-xs sm:text-sm text-green-700 font-medium">{trans.totalPaid}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-yellow-50 to-yellow-100">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-600 rounded-lg flex items-center justify-center shadow">
                    <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold text-yellow-900">{stats.pending}</div>
                    <div className="text-xs sm:text-sm text-yellow-700 font-medium">{trans.totalPending}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-purple-50 to-purple-100">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-600 rounded-lg flex items-center justify-center shadow">
                    <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-bold text-purple-900">₪{stats.revenue.toLocaleString()}</div>
                    <div className="text-xs sm:text-sm text-purple-700 font-medium">{trans.totalRevenue}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {stats.needsApproval > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="border-2 border-red-300 shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-red-50 to-red-100 animate-pulse">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-600 rounded-lg flex items-center justify-center shadow">
                      <UsersRound className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl sm:text-3xl font-bold text-red-900">{stats.needsApproval}</div>
                      <div className="text-xs sm:text-sm text-red-700 font-medium">{trans.needsApproval}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Main Content Tabs */}
        <Card className="border-0 shadow-xl">
          <CardContent className="p-3 sm:p-6" dir={isRTL ? 'rtl' : 'ltr'}>
            <Tabs defaultValue="registrations">
              <TabsList className="grid w-full grid-cols-3 sm:grid-cols-4 mb-4 sm:mb-6 h-auto">
                <TabsTrigger value="registrations" className="gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-3">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{trans.registrations}</span>
                  <span className="sm:hidden">{language === 'he' ? 'נרשמים' : 'Regs'}</span>
                </TabsTrigger>
                <TabsTrigger value="memorials" className="gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-3">
                  <Heart className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{trans.memorials}</span>
                  <span className="sm:hidden">{language === 'he' ? 'הנצחות' : 'Mem'}</span>
                </TabsTrigger>
                <TabsTrigger value="statistics" className="gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-3">
                  <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{trans.statistics}</span>
                  <span className="sm:hidden">{language === 'he' ? 'נתונים' : 'Stats'}</span>
                </TabsTrigger>
                <TabsTrigger value="checkin" className="gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-3 hidden sm:flex">
                  <QrCode className="w-3 h-3 sm:w-4 sm:h-4" />
                  {trans.checkIn}
                </TabsTrigger>
              </TabsList>

              {/* Registrations Tab */}
              <TabsContent value="registrations" className="space-y-4">
                {/* Filters and Search */}
                <div className="flex flex-col gap-3 sm:gap-4">
                  <div className="relative">
                    <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
                    <Input
                      placeholder={trans.search}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`h-10 sm:h-12 text-sm sm:text-base ${isRTL ? 'pr-9 sm:pr-10' : 'pl-9 sm:pl-10'}`}
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full sm:w-[180px] h-9 sm:h-10 text-xs sm:text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{trans.all}</SelectItem>
                        <SelectItem value="draft">{trans.draft}</SelectItem>
                        <SelectItem value="submitted">{trans.submitted}</SelectItem>
                        <SelectItem value="confirmed">{trans.confirmed}</SelectItem>
                        <SelectItem value="cancelled">{trans.cancelled}</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                      <SelectTrigger className="w-full sm:w-[180px] h-9 sm:h-10 text-xs sm:text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{trans.all}</SelectItem>
                        <SelectItem value="completed">{trans.completed}</SelectItem>
                        <SelectItem value="pending">{trans.pending}</SelectItem>
                        <SelectItem value="partial">{trans.partial}</SelectItem>
                        <SelectItem value="exempt">{trans.exempt}</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={groupFilter} onValueChange={setGroupFilter}>
                      <SelectTrigger className="w-full sm:w-[180px] h-9 sm:h-10 text-xs sm:text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{trans.all}</SelectItem>
                        <SelectItem value="individuals">{trans.individuals}</SelectItem>
                        <SelectItem value="families">{trans.families}</SelectItem>
                        <SelectItem value="organizedGroups">{trans.organizedGroups}</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button 
                      onClick={downloadCSV}
                      variant="outline"
                      className="gap-2 h-9 sm:h-10 text-xs sm:text-sm w-full sm:w-auto"
                    >
                      <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                      {trans.downloadCSV}
                    </Button>
                  </div>
                </div>

                {/* Registrations Table */}
                {loadingRegistrations ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                  </div>
                ) : filteredRegistrations.length === 0 ? (
                  <Card className="border-2 border-dashed">
                    <CardContent className="p-12 text-center">
                      <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-gray-500 text-lg font-semibold">{trans.noRegistrations}</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {filteredRegistrations.map((reg, idx) => {
                      // Get all participants info
                      const allParticipants = reg.participants || [];
                      const mainParticipant = allParticipants[0] || {};
                      const participantName = mainParticipant.name || reg.customer_name || reg.customer_email || reg.user_email;
                      const participantId = mainParticipant.id_number || reg.id_number;
                      const participantPhone = mainParticipant.phone || reg.emergency_contact_phone;
                      
                      // Calculate family breakdown
                      const adultsCount = allParticipants.filter(p => {
                        if (!p.age_range) return true;
                        const age = parseInt(p.age_range.split('-')[0]);
                        return isNaN(age) || age >= 10;
                      }).length;
                      const childrenCount = allParticipants.filter(p => {
                        if (!p.age_range) return false;
                        const age = parseInt(p.age_range.split('-')[0]);
                        return !isNaN(age) && age < 10;
                      }).length;
                      
                      const totalPeople = allParticipants.length || (1 + 
                        (reg.family_members?.spouse ? 1 : 0) +
                        (reg.children_details?.length || 0) +
                        (reg.family_members?.other ? 1 : 0));
                      
                      const isExpanded = expandedRow === reg.id;
                      const isPaid = reg.payment_status === 'completed' || reg.status === 'completed';
                      const amountPaid = reg.amount_paid || reg.amount || reg.total_amount || 0;

                      return (
                        <motion.div
                          key={reg.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.02 }}
                        >
                          <Card className={`border-2 shadow-md hover:shadow-lg transition-all ${
                            isPaid 
                              ? 'border-green-300 bg-green-50/30' 
                              : reg.payment_status === 'pending'
                              ? 'border-yellow-300 bg-yellow-50/30'
                              : reg.is_organized_group && reg.group_approval_status === 'pending' 
                              ? 'border-red-300 bg-red-50/30' 
                              : 'border-gray-200'
                          }`}>
                            <CardContent className="p-3 sm:p-4" dir={isRTL ? 'rtl' : 'ltr'}>
                              {/* Main Row - Always Visible Info */}
                              <div className="space-y-3">
                                {/* Header with name and badges */}
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                      <h3 className="font-bold text-base sm:text-lg text-gray-900">
                                        {participantName}
                                      </h3>
                                      <Badge className={`${isPaid ? 'bg-green-500 text-white' : getPaymentStatusColor(reg.payment_status)}`}>
                                        {isPaid ? (
                                          <><CheckCircle className="w-3 h-3 mr-1" />{language === 'he' ? 'שולם' : 'Paid'}</>
                                        ) : (
                                          <><Clock className="w-3 h-3 mr-1" />{trans[reg.payment_status] || reg.payment_status}</>
                                        )}
                                      </Badge>
                                    </div>
                                    {reg.customer_email && (
                                      <p className="text-xs text-gray-500" dir="ltr">{reg.customer_email}</p>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center gap-1">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => setExpandedRow(isExpanded ? null : reg.id)}
                                      className="h-8 w-8 p-0"
                                    >
                                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    </Button>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                                          <MoreVertical className="w-4 h-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuItem onClick={() => setMessageDialog(reg)}>
                                          <MessageSquare className="w-4 h-4 mr-2" />
                                          {trans.sendMessage}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => {
                                          const phone = participantPhone || reg.emergency_contact_phone;
                                          if (phone) {
                                            window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}`, '_blank');
                                          } else {
                                            toast.error(language === 'he' ? 'אין מספר טלפון' : 'No phone number');
                                          }
                                        }}>
                                          <Phone className="w-4 h-4 mr-2" />
                                          {trans.sendWhatsApp}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => {
                                          setMessageDialog(reg);
                                          setMessageContent('');
                                        }}>
                                          <Mail className="w-4 h-4 mr-2" />
                                          {trans.sendEmail}
                                        </DropdownMenuItem>
                                        {!isPaid && (
                                          <DropdownMenuItem onClick={() => handleMarkAsPaid(reg.id)}>
                                            <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                                            {trans.markAsPaid}
                                          </DropdownMenuItem>
                                        )}
                                        {reg.is_organized_group && reg.group_approval_status === 'pending' && (
                                          <>
                                            <DropdownMenuItem onClick={() => handleApproveGroup(reg.id)}>
                                              <Check className="w-4 h-4 mr-2 text-green-600" />
                                              {trans.approve}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleRejectGroup(reg.id)}>
                                              <X className="w-4 h-4 mr-2 text-red-600" />
                                              {trans.reject}
                                            </DropdownMenuItem>
                                          </>
                                        )}
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </div>

                                {/* Quick Stats Grid - Always Visible */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                                  {/* Payment Amount */}
                                  <div className={`rounded-lg p-2 text-center ${isPaid ? 'bg-green-100 border border-green-300' : 'bg-yellow-100 border border-yellow-300'}`}>
                                    <p className="text-xs text-gray-600">{language === 'he' ? 'סכום' : 'Amount'}</p>
                                    <p className={`font-bold text-sm ${isPaid ? 'text-green-700' : 'text-yellow-700'}`}>₪{amountPaid}</p>
                                  </div>
                                  
                                  {/* Total Participants */}
                                  <div className="bg-blue-100 border border-blue-300 rounded-lg p-2 text-center">
                                    <p className="text-xs text-gray-600">{language === 'he' ? 'משתתפים' : 'People'}</p>
                                    <p className="font-bold text-sm text-blue-700">{totalPeople}</p>
                                  </div>
                                  
                                  {/* Adults Count */}
                                  <div className="bg-indigo-100 border border-indigo-300 rounded-lg p-2 text-center">
                                    <p className="text-xs text-gray-600">{language === 'he' ? 'מבוגרים' : 'Adults'}</p>
                                    <p className="font-bold text-sm text-indigo-700">{adultsCount}</p>
                                  </div>
                                  
                                  {/* Children Count */}
                                  <div className="bg-pink-100 border border-pink-300 rounded-lg p-2 text-center">
                                    <p className="text-xs text-gray-600">{language === 'he' ? 'ילדים' : 'Children'}</p>
                                    <p className="font-bold text-sm text-pink-700">{childrenCount}</p>
                                  </div>
                                  
                                  {/* Selected Days */}
                                  <div className="bg-purple-100 border border-purple-300 rounded-lg p-2 text-center">
                                    <p className="text-xs text-gray-600">{language === 'he' ? 'ימים' : 'Days'}</p>
                                    <p className="font-bold text-sm text-purple-700">{(reg.selectedDays || reg.selected_days || []).length}</p>
                                  </div>
                                  
                                  {/* Registration Date */}
                                  <div className="bg-gray-100 border border-gray-300 rounded-lg p-2 text-center">
                                    <p className="text-xs text-gray-600">{language === 'he' ? 'תאריך' : 'Date'}</p>
                                    <p className="font-bold text-xs text-gray-700">
                                      {reg.created_date ? format(new Date(reg.created_date), 'dd/MM/yy') : '-'}
                                    </p>
                                  </div>
                                </div>

                                {/* Selected Days Preview */}
                                <div className="flex flex-wrap gap-1">
                                  {(reg.selectedDays || reg.selected_days || []).slice(0, 8).map((day, i) => (
                                    <Badge key={i} variant="outline" className="bg-purple-50 text-purple-700 text-xs py-0">
                                      {language === 'he' ? `יום ${typeof day === 'object' ? day.day_number : day}` : `Day ${typeof day === 'object' ? day.day_number : day}`}
                                    </Badge>
                                  ))}
                                  {(reg.selectedDays || reg.selected_days || []).length > 8 && (
                                    <Badge variant="outline" className="text-xs py-0">+{(reg.selectedDays || reg.selected_days || []).length - 8}</Badge>
                                  )}
                                </div>
                              </div>

                              {/* Expanded Details */}
                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-4 pt-4 border-t space-y-4"
                                  >
                                    {/* All Participants Details */}
                                    <div>
                                      <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                                        <Users className="w-4 h-4" />
                                        {language === 'he' ? `כל המשתתפים (${allParticipants.length})` : `All Participants (${allParticipants.length})`}
                                      </h4>
                                      <div className="grid gap-2">
                                        {allParticipants.map((p, i) => {
                                          const pAge = p.age_range ? parseInt(p.age_range.split('-')[0]) : null;
                                          const isChild = pAge !== null && pAge < 10;
                                          return (
                                            <div key={i} className={`rounded-lg p-3 border ${isChild ? 'bg-pink-50 border-pink-200' : 'bg-blue-50 border-blue-200'}`}>
                                              <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${isChild ? 'bg-pink-500' : 'bg-blue-500'}`}>
                                                    {i + 1}
                                                  </div>
                                                  <div>
                                                    <p className="font-semibold text-sm">{p.name || p.email || `${language === 'he' ? 'משתתף' : 'Participant'} ${i + 1}`}</p>
                                                    <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                                                      {p.id_number && <span>ת.ז: {p.id_number}</span>}
                                                      {p.phone && <span dir="ltr">📞 {p.phone}</span>}
                                                    </div>
                                                  </div>
                                                </div>
                                                <div className="text-right">
                                                  {p.age_range && (
                                                    <Badge className={isChild ? 'bg-pink-500' : 'bg-blue-500'}>
                                                      {p.age_range} {language === 'he' ? 'שנים' : 'y/o'}
                                                    </Badge>
                                                  )}
                                                  {p.age && !p.age_range && (
                                                    <Badge className={p.age < 10 ? 'bg-pink-500' : 'bg-blue-500'}>
                                                      {p.age} {language === 'he' ? 'שנים' : 'y/o'}
                                                    </Badge>
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>

                                    {/* Payment Details */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                      <div className={`rounded-lg p-3 border-2 ${isPaid ? 'bg-green-50 border-green-300' : 'bg-yellow-50 border-yellow-300'}`}>
                                        <p className="text-xs font-semibold text-gray-700 mb-1">
                                          {language === 'he' ? 'סטטוס תשלום' : 'Payment Status'}
                                        </p>
                                        <p className={`text-lg font-bold ${isPaid ? 'text-green-700' : 'text-yellow-700'}`}>
                                          {isPaid ? (language === 'he' ? '✓ שולם' : '✓ Paid') : (language === 'he' ? '⏳ ממתין' : '⏳ Pending')}
                                        </p>
                                      </div>
                                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 border border-green-200">
                                        <p className="text-xs font-semibold text-green-900 mb-1">
                                          {language === 'he' ? 'סכום כולל' : 'Total Amount'}
                                        </p>
                                        <p className="text-lg font-bold text-green-700">₪{amountPaid}</p>
                                      </div>
                                      {reg.transaction_id && (
                                        <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg p-3 border border-purple-200 col-span-2">
                                          <p className="text-xs font-semibold text-purple-900 mb-1">
                                            {language === 'he' ? 'מזהה עסקה' : 'Transaction ID'}
                                          </p>
                                          <p className="text-xs text-purple-700 font-mono break-all">{reg.transaction_id}</p>
                                        </div>
                                      )}
                                    </div>

                                    {/* Selected Days Full List */}
                                    <div>
                                      <p className="text-sm font-bold text-gray-700 mb-2">
                                        {language === 'he' ? 'ימי טיול נבחרים:' : 'Selected Trek Days:'}
                                      </p>
                                      <div className="flex flex-wrap gap-2">
                                        {(reg.selectedDays || reg.selected_days || []).map((day, i) => {
                                          const dayNum = typeof day === 'object' ? day.day_number : day;
                                          const dayTitle = typeof day === 'object' ? day.daily_title : null;
                                          return (
                                            <Badge key={i} className="bg-purple-600 text-white px-3 py-1">
                                              {language === 'he' ? `יום ${dayNum}` : `Day ${dayNum}`}
                                              {dayTitle && ` - ${dayTitle}`}
                                            </Badge>
                                          );
                                        })}
                                      </div>
                                    </div>

                                    {/* Vehicle Info */}
                                    {(reg.vehicle_number || reg.vehicleInfo?.number || reg.vehicleInfo?.hasVehicle) && (
                                      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-3 border-2 border-indigo-200">
                                        <p className="text-xs font-semibold text-indigo-900 mb-2 flex items-center gap-1">
                                          <MapPin className="w-4 h-4" />
                                          {language === 'he' ? 'פרטי רכב' : 'Vehicle Info'}
                                        </p>
                                        <div className="text-sm text-indigo-700">
                                          {reg.vehicleInfo?.hasVehicle && (
                                            <p>✓ {language === 'he' ? 'מגיע עם רכב' : 'Coming with vehicle'}</p>
                                          )}
                                          {(reg.vehicle_number || reg.vehicleInfo?.number) && (
                                            <p className="font-mono font-bold">{reg.vehicle_number || reg.vehicleInfo?.number}</p>
                                          )}
                                        </div>
                                      </div>
                                    )}

                                    {/* Group Info */}
                                    {reg.is_organized_group && (
                                      <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-3 border-2 border-orange-200">
                                        <p className="text-xs font-semibold text-orange-900 mb-2 flex items-center gap-1">
                                          <UsersRound className="w-4 h-4" />
                                          {language === 'he' ? 'פרטי קבוצה מאורגנת' : 'Organized Group Info'}
                                        </p>
                                        <div className="space-y-1 text-sm text-orange-700">
                                          {reg.group_name && <p><span className="font-semibold">{language === 'he' ? 'שם:' : 'Name:'}</span> {reg.group_name}</p>}
                                          {reg.group_type && <p><span className="font-semibold">{language === 'he' ? 'סוג:' : 'Type:'}</span> {trans[reg.group_type] || reg.group_type}</p>}
                                          {reg.groupInfo?.leaderName && <p><span className="font-semibold">{language === 'he' ? 'מוביל:' : 'Leader:'}</span> {reg.groupInfo.leaderName}</p>}
                                          {reg.groupInfo?.leaderPhone && <p dir="ltr"><span className="font-semibold">{language === 'he' ? 'טלפון:' : 'Phone:'}</span> {reg.groupInfo.leaderPhone}</p>}
                                        </div>
                                      </div>
                                    )}

                                    {/* Registration Timestamp */}
                                    <div className="text-xs text-gray-500 pt-2 border-t flex justify-between">
                                      <span>{language === 'he' ? 'נרשם בתאריך:' : 'Registered:'} {reg.created_date ? format(new Date(reg.created_date), 'dd/MM/yyyy HH:mm') : '-'}</span>
                                      {reg.completed_at && <span>{language === 'he' ? 'תשלום בתאריך:' : 'Paid:'} {format(new Date(reg.completed_at), 'dd/MM/yyyy HH:mm')}</span>}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              {/* Memorials Tab */}
              <TabsContent value="memorials">
                {activeTrip ? (
                  <MemorialsManager tripId={activeTrip.id} showTrekDays={true} />
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center text-gray-500">
                      {language === 'he' ? 'אין טיול נפגשים פעיל' : 'No active Nifgashim trip'}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Statistics Tab */}
              <TabsContent value="statistics" className="space-y-6">
                {/* Age Statistics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Users className="w-5 h-5" />
                      {language === 'he' ? 'סטטיסטיקות גילאים' : 'Age Statistics'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2 border-blue-200">
                        <div className="text-3xl font-bold text-blue-900">{ageStats.adults}</div>
                        <div className="text-sm text-blue-700 font-medium">{language === 'he' ? 'מבוגרים' : 'Adults'}</div>
                      </div>
                      <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-4 border-2 border-pink-200">
                        <div className="text-3xl font-bold text-pink-900">{ageStats.children}</div>
                        <div className="text-sm text-pink-700 font-medium">{language === 'he' ? 'ילדים' : 'Children'}</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-gray-700 mb-3">
                        {language === 'he' ? 'פילוח ילדים לפי גיל:' : 'Children by Age:'}
                      </p>
                      {Object.entries(ageStats.childrenByAge).map(([range, count]) => (
                        <div key={range} className="flex items-center gap-3">
                          <div className="w-20 text-xs font-semibold text-gray-700">{range}</div>
                          <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: ageStats.children > 0 ? `${(count / ageStats.children) * 100}%` : '0%' }}
                              className="h-full bg-gradient-to-r from-pink-400 to-pink-600 flex items-center justify-end px-2"
                            >
                              {count > 0 && <span className="text-white text-xs font-bold">{count}</span>}
                            </motion.div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Registrations by Day Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Calendar className="w-5 h-5" />
                      {trans.registrationsByDay}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(registrationsByDay).sort(([a], [b]) => parseInt(a) - parseInt(b)).map(([day, count]) => (
                        <div key={day} className="flex items-center gap-3">
                          <div className="w-16 sm:w-20 text-xs sm:text-sm font-semibold text-gray-700">
                            {language === 'he' ? `יום ${day}` : `Day ${day}`}
                          </div>
                          <div className="flex-1 bg-gray-100 rounded-full h-6 sm:h-8 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(count / registrations.length) * 100}%` }}
                              className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-end px-2 sm:px-3"
                            >
                              <span className="text-white text-xs sm:text-sm font-bold">{count}</span>
                            </motion.div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <DollarSign className="w-5 h-5" />
                      {trans.paymentBreakdown}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                      {['completed', 'pending', 'partial', 'exempt'].map(status => {
                        const count = registrations.filter(r => r.payment_status === status).length;
                        return (
                          <div key={status} className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                            <div className="text-xl sm:text-2xl font-bold text-gray-900">{count}</div>
                            <div className="text-xs sm:text-sm text-gray-600 mt-1">{trans[status]}</div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Groups Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <UsersRound className="w-5 h-5" />
                      {trans.groupsBreakdown}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {['military', 'school', 'youth_group', 'other'].map(type => {
                        const groups = registrations.filter(r => r.is_organized_group && r.group_type === type);
                        if (groups.length === 0) return null;
                        return (
                          <div key={type} className="p-3 sm:p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold text-sm sm:text-base">{trans[type]}</span>
                              <Badge variant="secondary">{groups.length}</Badge>
                            </div>
                            <div className="space-y-1 text-xs sm:text-sm text-gray-700">
                              {groups.map((g, i) => (
                                <div key={i}>• {g.group_name}</div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Check-In Tab */}
              <TabsContent value="checkin" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <QrCode className="w-6 h-6" />
                      {trans.checkIn}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      {language === 'he' 
                        ? 'סרוק QR של משתתף או חפש לפי ת.ז לביצוע צ\'ק-אין' 
                        : 'Scan participant QR or search by ID for check-in'}
                    </p>
                    
                    <div className="space-y-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          placeholder={language === 'he' ? 'חפש לפי ת.ז...' : 'Search by ID...'}
                          className="pl-10"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              const found = registrations.find(r => r.id_number === e.target.value);
                              if (found) {
                                setCheckInDialog(found);
                              } else {
                                toast.error(language === 'he' ? 'משתתף לא נמצא' : 'Participant not found');
                              }
                            }
                          }}
                        />
                      </div>

                      <div className="bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl p-8 text-center">
                        <QrCode className="w-20 h-20 mx-auto text-purple-600 mb-3" />
                        <p className="text-sm text-gray-700">
                          {language === 'he' ? 'סריקת QR תתווסף בקרוב' : 'QR scanning coming soon'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Message Dialog */}
      <Dialog open={!!messageDialog} onOpenChange={() => {
        setMessageDialog(null);
        setMessageContent('');
      }}>
        <DialogContent className="sm:max-w-md" dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              {trans.sendMessage}
            </DialogTitle>
            <DialogDescription>
              {language === 'he' ? 'שלח הודעה למשתתף' : 'Send a message to the participant'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <p className="text-sm font-medium mb-1">{trans.email}:</p>
              <p className="text-sm text-gray-600" dir="ltr">{messageDialog?.user_email}</p>
            </div>

            <div>
              <label className="text-sm font-medium">{trans.messageContent}</label>
              <textarea
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                className="w-full mt-2 p-3 border rounded-lg min-h-[120px] text-sm"
                placeholder={language === 'he' ? 'כתוב את ההודעה...' : 'Write your message...'}
              />
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setMessageDialog(null);
                setMessageContent('');
              }}
              className="flex-1 sm:flex-initial"
            >
              {trans.cancel}
            </Button>
            <Button
              onClick={() => handleSendMessage('email')}
              disabled={sendingMessage}
              className="bg-purple-600 hover:bg-purple-700 flex-1 sm:flex-initial"
            >
              {sendingMessage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              {trans.send}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Check-In Dialog */}
      <Dialog open={!!checkInDialog} onOpenChange={() => setCheckInDialog(null)}>
        <DialogContent className="sm:max-w-lg" dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-green-600" />
              {trans.checkInParticipant}
            </DialogTitle>
          </DialogHeader>

          {checkInDialog && (
            <div className="py-4 space-y-4">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4">
                <p className="font-semibold text-lg mb-2">{checkInDialog.user_email}</p>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                  <div>{trans.idNumber}: {checkInDialog.id_number}</div>
                  <div>{trans.selectedDays}: {(checkInDialog.selected_days || []).length}</div>
                </div>
              </div>

              <Button
                onClick={() => {
                  toast.success(trans.checkInSuccess);
                  setCheckInDialog(null);
                }}
                className="w-full bg-green-600 hover:bg-green-700 h-12"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                {language === 'he' ? 'אשר צ\'ק-אין' : 'Confirm Check-In'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}