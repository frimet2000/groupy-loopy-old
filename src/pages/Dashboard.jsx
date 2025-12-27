import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguage } from '../components/LanguageContext';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Calendar,
  MessageSquare,
  TrendingUp,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  Eye,
  Heart,
  UserPlus,
  Activity,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { formatDate } from '../components/utils/dateFormatter';

export default function Dashboard() {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (error) {
        base44.auth.redirectToLogin();
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const { data: myTrips = [], isLoading: tripsLoading } = useQuery({
    queryKey: ['organizerTrips', user?.email],
    queryFn: async () => {
      const trips = await base44.entities.Trip.list();
      return trips.filter(t => 
        t.organizer_email === user?.email || 
        t.additional_organizers?.some(o => o.email === user?.email)
      );
    },
    enabled: !!user?.email,
  });

  // Calculate statistics
  const stats = React.useMemo(() => {
    const now = new Date();
    const pendingRequests = myTrips.reduce((sum, t) => sum + (t.pending_requests?.length || 0), 0);
    const upcomingTrips = myTrips.filter(t => new Date(t.date) > now && t.status !== 'cancelled').length;
    const totalParticipants = myTrips.reduce((sum, t) => sum + (t.current_participants || 0), 0);
    const totalMessages = myTrips.reduce((sum, t) => sum + (t.messages?.length || 0), 0);
    const totalViews = myTrips.reduce((sum, t) => sum + (t.views?.length || 0), 0);
    const totalLikes = myTrips.reduce((sum, t) => sum + (t.likes?.length || 0), 0);

    return { pendingRequests, upcomingTrips, totalParticipants, totalMessages, totalViews, totalLikes };
  }, [myTrips]);

  // Trips by status
  const tripsByStatus = React.useMemo(() => {
    const statusCounts = {
      open: 0,
      full: 0,
      completed: 0,
      cancelled: 0
    };
    myTrips.forEach(t => {
      statusCounts[t.status] = (statusCounts[t.status] || 0) + 1;
    });
    return Object.entries(statusCounts).map(([status, count]) => ({
      name: language === 'he' 
        ? (status === 'open' ? 'פתוח' : status === 'full' ? 'מלא' : status === 'completed' ? 'הסתיים' : 'בוטל')
        : language === 'ru'
        ? (status === 'open' ? 'Открыто' : status === 'full' ? 'Заполнено' : status === 'completed' ? 'Завершено' : 'Отменено')
        : language === 'es'
        ? (status === 'open' ? 'Abierto' : status === 'full' ? 'Completo' : status === 'completed' ? 'Completado' : 'Cancelado')
        : language === 'fr'
        ? (status === 'open' ? 'Ouvert' : status === 'full' ? 'Complet' : status === 'completed' ? 'Terminé' : 'Annulé')
        : language === 'de'
        ? (status === 'open' ? 'Offen' : status === 'full' ? 'Voll' : status === 'completed' ? 'Abgeschlossen' : 'Abgesagt')
        : language === 'it'
        ? (status === 'open' ? 'Aperto' : status === 'full' ? 'Completo' : status === 'completed' ? 'Completato' : 'Annullato')
        : status,
      value: count
    }));
  }, [myTrips, language]);

  // Activity over time (last 30 days)
  const activityData = React.useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        trips: 0,
        participants: 0
      };
    });

    myTrips.forEach(trip => {
      const tripDate = new Date(trip.created_date);
      const daysAgo = Math.floor((new Date() - tripDate) / (1000 * 60 * 60 * 24));
      if (daysAgo >= 0 && daysAgo < 30) {
        last30Days[29 - daysAgo].trips += 1;
      }
    });

    return last30Days;
  }, [myTrips]);

  // Pending requests details
  const pendingRequestsDetails = React.useMemo(() => {
    const requests = [];
    myTrips.forEach(trip => {
      if (trip.pending_requests?.length > 0) {
        trip.pending_requests.forEach(req => {
          requests.push({
            ...req,
            tripId: trip.id,
            tripTitle: trip.title || trip.title_he || trip.title_en,
            tripDate: trip.date
          });
        });
      }
    });
    return requests.sort((a, b) => new Date(b.requested_at) - new Date(a.requested_at)).slice(0, 10);
  }, [myTrips]);

  // Recent messages
  const recentMessages = React.useMemo(() => {
    const messages = [];
    myTrips.forEach(trip => {
      if (trip.messages?.length > 0) {
        trip.messages.forEach(msg => {
          messages.push({
            ...msg,
            tripId: trip.id,
            tripTitle: trip.title || trip.title_he || trip.title_en
          });
        });
      }
    });
    return messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);
  }, [myTrips]);

  // Upcoming trips
  const upcomingTrips = React.useMemo(() => {
    const now = new Date();
    return myTrips
      .filter(t => new Date(t.date) > now && t.status !== 'cancelled')
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5);
  }, [myTrips]);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

  if (loading || tripsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8" dir={language === 'he' ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {language === 'he' ? 'לוח מחוונים' : language === 'ru' ? 'Панель управления' : language === 'es' ? 'Panel de control' : language === 'fr' ? 'Tableau de bord' : language === 'de' ? 'Dashboard' : language === 'it' ? 'Pannello di controllo' : 'Dashboard'}
            </h1>
            <p className="text-gray-600 mt-1">
              {language === 'he' ? 'סקירת הטיולים שלך' : language === 'ru' ? 'Обзор ваших поездок' : language === 'es' ? 'Resumen de tus viajes' : language === 'fr' ? 'Aperçu de vos voyages' : language === 'de' ? 'Überblick über Ihre Reisen' : language === 'it' ? 'Panoramica dei tuoi viaggi' : 'Your trips overview'}
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div whileHover={{ scale: 1.02 }}>
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">
                      {language === 'he' ? 'בקשות ממתינות' : language === 'ru' ? 'Ожидающие запросы' : language === 'es' ? 'Solicitudes pendientes' : language === 'fr' ? 'Demandes en attente' : language === 'de' ? 'Ausstehende Anfragen' : language === 'it' ? 'Richieste in sospeso' : 'Pending Requests'}
                    </p>
                    <p className="text-3xl font-bold mt-2">{stats.pendingRequests}</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-lg">
                    <UserPlus className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }}>
            <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-sm font-medium">
                      {language === 'he' ? 'טיולים קרובים' : language === 'ru' ? 'Предстоящие поездки' : language === 'es' ? 'Próximos viajes' : language === 'fr' ? 'Voyages à venir' : language === 'de' ? 'Bevorstehende Reisen' : language === 'it' ? 'Prossimi viaggi' : 'Upcoming Trips'}
                    </p>
                    <p className="text-3xl font-bold mt-2">{stats.upcomingTrips}</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-lg">
                    <Calendar className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }}>
            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">
                      {language === 'he' ? 'סה"כ משתתפים' : language === 'ru' ? 'Всего участников' : language === 'es' ? 'Total participantes' : language === 'fr' ? 'Total des participants' : language === 'de' ? 'Teilnehmer gesamt' : language === 'it' ? 'Partecipanti totali' : 'Total Participants'}
                    </p>
                    <p className="text-3xl font-bold mt-2">{stats.totalParticipants}</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-lg">
                    <Users className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }}>
            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">
                      {language === 'he' ? 'הודעות' : language === 'ru' ? 'Сообщения' : language === 'es' ? 'Mensajes' : language === 'fr' ? 'Messages' : language === 'de' ? 'Nachrichten' : language === 'it' ? 'Messaggi' : 'Messages'}
                    </p>
                    <p className="text-3xl font-bold mt-2">{stats.totalMessages}</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-lg">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-600" />
                {language === 'he' ? 'התפלגות סטטוס' : language === 'ru' ? 'Распределение по статусам' : language === 'es' ? 'Distribución de estado' : language === 'fr' ? 'Distribution des statuts' : language === 'de' ? 'Statusverteilung' : language === 'it' ? 'Distribuzione dello stato' : 'Status Distribution'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={tripsByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={false}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {tripsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {tripsByStatus.map((entry, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm text-gray-700">{entry.name}: {entry.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                {language === 'he' ? 'פעילות אחרונה (30 יום)' : language === 'ru' ? 'Активность (последние 30 дней)' : language === 'es' ? 'Actividad (últimos 30 días)' : language === 'fr' ? 'Activité (30 derniers jours)' : language === 'de' ? 'Aktivität (letzte 30 Tage)' : language === 'it' ? 'Attività (ultimi 30 giorni)' : 'Activity (Last 30 Days)'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="trips" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for detailed views */}
        <Tabs defaultValue="requests" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="requests">
              {language === 'he' ? 'בקשות' : language === 'ru' ? 'Запросы' : language === 'es' ? 'Solicitudes' : language === 'fr' ? 'Demandes' : language === 'de' ? 'Anfragen' : language === 'it' ? 'Richieste' : 'Requests'} 
              {stats.pendingRequests > 0 && (
                <Badge className="ml-2 bg-red-500">{stats.pendingRequests}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="trips">
              {language === 'he' ? 'טיולים קרובים' : language === 'ru' ? 'Предстоящие' : language === 'es' ? 'Próximos' : language === 'fr' ? 'À venir' : language === 'de' ? 'Bevorstehend' : language === 'it' ? 'Prossimi' : 'Upcoming Trips'}
            </TabsTrigger>
            <TabsTrigger value="messages">
              {language === 'he' ? 'הודעות' : language === 'ru' ? 'Сообщения' : language === 'es' ? 'Mensajes' : language === 'fr' ? 'Messages' : language === 'de' ? 'Nachrichten' : language === 'it' ? 'Messaggi' : 'Messages'}
            </TabsTrigger>
          </TabsList>

          {/* Pending Requests */}
          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle>{language === 'he' ? 'בקשות הצטרפות ממתינות' : language === 'ru' ? 'Заявки на присоединение' : language === 'es' ? 'Solicitudes de unión pendientes' : language === 'fr' ? 'Demandes d\'adhésion en attente' : language === 'de' ? 'Ausstehende Beitrittsanfragen' : language === 'it' ? 'Richieste di partecipazione in sospeso' : 'Pending Join Requests'}</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingRequestsDetails.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <UserPlus className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>{language === 'he' ? 'אין בקשות ממתינות' : language === 'ru' ? 'Нет ожидающих запросов' : language === 'es' ? 'No hay solicitudes pendientes' : language === 'fr' ? 'Aucune demande en attente' : language === 'de' ? 'Keine ausstehenden Anfragen' : language === 'it' ? 'Nessuna richiesta in sospeso' : 'No pending requests'}</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {pendingRequestsDetails.map((req, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(createPageUrl('TripDetails') + '?id=' + req.tripId)}>
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <Avatar className="border-2 border-emerald-200">
                                  <AvatarFallback className="bg-emerald-100 text-emerald-700">
                                    {req.name?.charAt(0) || req.email?.charAt(0) || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <p className="font-semibold text-gray-900">{req.name}</p>
                                      <p className="text-sm text-gray-600">{req.tripTitle}</p>
                                    </div>
                                    <Badge variant="outline" className="flex-shrink-0">
                                      {formatDate(req.tripDate, language)}
                                    </Badge>
                                  </div>
                                  {req.message && (
                                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{req.message}</p>
                                  )}
                                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                    <Clock className="w-3 h-3" />
                                    {new Date(req.requested_at).toLocaleString(language === 'he' ? 'he-IL' : 'en-US')}
                                  </div>
                                </div>
                                <ArrowRight className={`w-5 h-5 text-gray-400 flex-shrink-0 ${language === 'he' ? 'rotate-180' : ''}`} />
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Upcoming Trips */}
          <TabsContent value="trips">
            <Card>
              <CardHeader>
                <CardTitle>{language === 'he' ? 'הטיולים הקרובים שלך' : language === 'ru' ? 'Ваши предстоящие поездки' : language === 'es' ? 'Tus próximos viajes' : language === 'fr' ? 'Vos voyages à venir' : language === 'de' ? 'Ihre bevorstehenden Reisen' : language === 'it' ? 'I tuoi prossimi viaggi' : 'Your Upcoming Trips'}</CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingTrips.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>{language === 'he' ? 'אין טיולים קרובים' : language === 'ru' ? 'Нет предстоящих поездок' : language === 'es' ? 'No hay viajes próximos' : language === 'fr' ? 'Aucun voyage à venir' : language === 'de' ? 'Keine bevorstehenden Reisen' : language === 'it' ? 'Nessun viaggio in programma' : 'No upcoming trips'}</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {upcomingTrips.map((trip, idx) => (
                        <motion.div
                          key={trip.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(createPageUrl('TripDetails') + '?id=' + trip.id)}>
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                {trip.image_url ? (
                                  <img src={trip.image_url} alt="" className="w-16 h-16 rounded-lg object-cover" />
                                ) : (
                                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                                    <MapPin className="w-8 h-8 text-white" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <h3 className="font-bold text-gray-900">
                                      {trip.title || trip.title_he || trip.title_en}
                                    </h3>
                                    <Badge className="bg-emerald-600 flex-shrink-0">
                                      {formatDate(trip.date, language)}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                                    <div className="flex items-center gap-1">
                                      <MapPin className="w-4 h-4" />
                                      {trip.location}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Users className="w-4 h-4" />
                                      {trip.current_participants || 0}
                                      {trip.max_participants && `/${trip.max_participants}`}
                                    </div>
                                  </div>
                                </div>
                                <ArrowRight className={`w-5 h-5 text-gray-400 flex-shrink-0 ${language === 'he' ? 'rotate-180' : ''}`} />
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recent Messages */}
          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle>{language === 'he' ? 'הודעות אחרונות' : language === 'ru' ? 'Последние сообщения' : language === 'es' ? 'Mensajes recientes' : language === 'fr' ? 'Messages récents' : language === 'de' ? 'Letzte Nachrichten' : language === 'it' ? 'Messaggi recenti' : 'Recent Messages'}</CardTitle>
              </CardHeader>
              <CardContent>
                {recentMessages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>{language === 'he' ? 'אין הודעות' : language === 'ru' ? 'Нет сообщений' : language === 'es' ? 'No hay mensajes' : language === 'fr' ? 'Aucun message' : language === 'de' ? 'Keine Nachrichten' : language === 'it' ? 'Nessun messaggio' : 'No messages'}</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {recentMessages.map((msg, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(createPageUrl('TripDetails') + '?id=' + msg.tripId + '#chat')}>
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <Avatar className="border-2 border-purple-200">
                                  <AvatarFallback className="bg-purple-100 text-purple-700">
                                    {msg.sender_name?.charAt(0) || msg.sender_email?.charAt(0) || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <p className="font-semibold text-gray-900">{msg.sender_name}</p>
                                      <p className="text-xs text-gray-500">{msg.tripTitle}</p>
                                    </div>
                                    <span className="text-xs text-gray-500 flex-shrink-0">
                                      {new Date(msg.timestamp).toLocaleTimeString(language === 'he' ? 'he-IL' : 'en-US', { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                      })}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{msg.content}</p>
                                </div>
                                <ArrowRight className={`w-5 h-5 text-gray-400 flex-shrink-0 ${language === 'he' ? 'rotate-180' : ''}`} />
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Engagement Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{language === 'he' ? 'סה"כ צפיות' : language === 'ru' ? 'Всего просмотров' : language === 'es' ? 'Vistas totales' : language === 'fr' ? 'Total des vues' : language === 'de' ? 'Aufrufe gesamt' : language === 'it' ? 'Visualizzazioni totali' : 'Total Views'}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalViews}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Eye className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{language === 'he' ? 'סה"כ לייקים' : language === 'ru' ? 'Всего лайков' : language === 'es' ? 'Me gusta totales' : language === 'fr' ? 'Total des likes' : language === 'de' ? 'Likes gesamt' : language === 'it' ? 'Mi piace totali' : 'Total Likes'}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalLikes}</p>
                </div>
                <div className="p-3 bg-rose-50 rounded-lg">
                  <Heart className="w-6 h-6 text-rose-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{language === 'he' ? 'סה"כ טיולים' : language === 'ru' ? 'Всего поездок' : language === 'es' ? 'Viajes totales' : language === 'fr' ? 'Total des voyages' : language === 'de' ? 'Reisen gesamt' : language === 'it' ? 'Viaggi totali' : 'Total Trips'}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{myTrips.length}</p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-lg">
                  <Calendar className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}