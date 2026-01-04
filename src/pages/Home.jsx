// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguage } from '../components/LanguageContext';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import TripCard from '../components/trips/TripCard';
import TripsMap from '../components/maps/TripsMap';
import ModernTripFilters from '../components/trips/ModernTripFilters';
import OrganizerAlerts from '../components/organizer/OrganizerAlerts';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, Compass, Users, MapPin, ArrowRight, ChevronDown, Video, Calendar, 
  Share2, List, Globe, Heart, Radio, Bike, Mountain, 
  Truck, History, CreditCard, BookOpen 
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from 'framer-motion';
import { format, isPast, isToday, isTomorrow } from 'date-fns';
import { toast } from "sonner";
import AnnouncementToast from '../components/announcements/AnnouncementToast';

export default function Home() {
  const { t, isRTL, language, setLanguage } = useLanguage();
  const navigate = useNavigate();

  const [visibleCount, setVisibleCount] = useState(8);
  const [sortBy, setSortBy] = useState('date');
  const [user, setUser] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [showLiveTripsDialog, setShowLiveTripsDialog] = useState(false);
  const [joiningLiveTrip, setJoiningLiveTrip] = useState(false);
  const [filteredTrips, setFilteredTrips] = useState([]);


  // Auto-detect and set language from URL parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get('lang');
    if (langParam && ['en', 'he', 'es', 'fr', 'de', 'it', 'ru'].includes(langParam) && langParam !== language) {
      setLanguage(langParam);
    }
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (e) {
        console.log('Not logged in');
      }
    };
    fetchUser();
  }, []);

  const { data: trips = [], isLoading } = useQuery({
    queryKey: ['trips'],
    queryFn: () => base44.entities.Trip.list('-created_date'),
  });

  // Sort filtered trips
  const sortedTrips = useMemo(() => {
    return [...filteredTrips].sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'date_desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'popularity':
          return (b.current_participants || 0) - (a.current_participants || 0);
        case 'likes':
          return (b.likes?.length || 0) - (a.likes?.length || 0);
        case 'comments':
          return (b.comments?.length || 0) - (a.comments?.length || 0);
        case 'newest':
          return new Date(b.created_date).getTime() - new Date(a.created_date).getTime();
        case 'title':
          const titleA = a.title || a.title_he || a.title_en || '';
          const titleB = b.title || b.title_he || b.title_en || '';
          return titleA.localeCompare(titleB);
        default:
          return 0;
      }
    });
  }, [filteredTrips, sortBy]);

  // Group trips by country
  const tripsByCountry = sortedTrips.reduce((acc, trip) => {
    let country = trip.country || '';
    if (!country && trip.region && ['north', 'center', 'south', 'jerusalem', 'negev', 'eilat'].includes(trip.region)) {
      country = 'israel';
    }
    if (!country) {
      country = 'other';
    }
    
    if (!acc[country]) acc[country] = [];
    acc[country].push(trip);
    return acc;
  }, {});



  // Get past trips
  const pastTrips = trips.filter(trip => {
    const tripDate = new Date(trip.date);
    tripDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (tripDate >= today) return false;
    if (trip.status !== 'open' && trip.status !== 'completed') return false;
    
    // Apply same privacy filters
    if (trip.privacy === 'private') {
      if (!user) return false;
      const isOrganizerOrParticipant = trip.organizer_email === user.email || 
        trip.participants?.some(p => p.email === user.email);
      if (!isOrganizerOrParticipant) return false;
    } else if (trip.privacy === 'invite_only') {
      if (!user) return false;
      const isInvitedOrParticipant = trip.invited_emails?.includes(user.email) ||
        trip.organizer_email === user.email ||
        trip.participants?.some(p => p.email === user.email);
      if (!isInvitedOrParticipant) return false;
    }
    
    return true;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const openTrips = trips.filter(t => {
    if (t.status !== 'open') return false;
    const tripDate = new Date(t.date);
    tripDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return tripDate >= today;
  });
  
  // Get active video call invites for trips user is participating in
  const myActiveInvites = user ? trips.filter(trip => 
    trip.participants?.some(p => p.email === user.email) &&
    trip.video_call_invites?.some(invite => invite.active && !isPast(new Date(invite.scheduled_time)))
  ).map(trip => ({
    trip,
    invite: trip.video_call_invites.find(invite => invite.active && !isPast(new Date(invite.scheduled_time)))
  })) : [];
  
  // Count unique participants by email
  const uniqueParticipants = new Set();
  openTrips.forEach(trip => {
    if (trip.participants && Array.isArray(trip.participants)) {
      trip.participants.forEach(p => {
        if (p.email) uniqueParticipants.add(p.email);
      });
    }
  });
  
  const stats = [
    { icon: Compass, value: openTrips.length, label: language === 'he' ? 'טיולים פעילים' : language === 'ru' ? 'Активные поездки' : language === 'es' ? 'Viajes activos' : language === 'fr' ? 'Voyages actifs' : language === 'de' ? 'Aktive Reisen' : language === 'it' ? 'Viaggi attivi' : 'Active Trips', color: 'text-emerald-300' },
    { icon: Users, value: uniqueParticipants.size, label: language === 'he' ? 'משתתפים' : language === 'ru' ? 'Участники' : language === 'es' ? 'Participantes' : language === 'fr' ? 'Participants' : language === 'de' ? 'Teilnehmer' : language === 'it' ? 'Partecipanti' : 'Participants', color: 'text-blue-300' },
    { icon: MapPin, value: new Set(openTrips.map(t => t.region)).size, label: language === 'he' ? 'אזורים' : language === 'ru' ? 'Регионы' : language === 'es' ? 'Regiones' : language === 'fr' ? 'Régions' : language === 'de' ? 'Regionen' : language === 'it' ? 'Regioni' : 'Regions', color: 'text-purple-300' },
  ];

  const handleShare = async () => {
    const shareUrl = 'https://groupyloopy.app';
    const shareData = {
      title: 'Groupy Loopy',
      text: language === 'he' 
        ? 'מצא שותפים לטיול הבא שלך!' 
        : 'Find partners for your next trip!',
      url: shareUrl
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success(language === 'he' ? 'הקישור הועתק ללוח' : language === 'ru' ? 'Ссылка скопирована' : language === 'es' ? 'Enlace copiado' : language === 'fr' ? 'Lien copié' : language === 'de' ? 'Link kopiert' : language === 'it' ? 'Link copiato' : 'Link copied to clipboard');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        await navigator.clipboard.writeText(shareUrl);
        toast.success(language === 'he' ? 'הקישור הועתק ללוח' : language === 'ru' ? 'Ссылка скопирована' : language === 'es' ? 'Enlace copiado' : language === 'fr' ? 'Lien copié' : language === 'de' ? 'Link kopiert' : language === 'it' ? 'Link copiato' : 'Link copied to clipboard');
      }
    }
  };

  const handleJoinLiveTrip = async (activityType) => {
    if (!user) {
      base44.auth.redirectToLogin(createPageUrl('Home'));
      return;
    }

    setJoiningLiveTrip(true);
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Find trips happening today with the selected activity type
      const liveTrips = trips.filter(trip => {
        const tripDate = new Date(trip.date);
        tripDate.setHours(0, 0, 0, 0);
        return tripDate.getTime() === today.getTime() && 
               trip.activity_type === activityType &&
               trip.status === 'open' &&
               !trip.participants?.some(p => p.email === user.email) &&
               trip.organizer_email !== user.email &&
               (!trip.max_participants || (trip.current_participants || 1) < trip.max_participants);
      });

      if (liveTrips.length === 0) {
        toast.error(language === 'he' ? 'אין טיולים פעילים כרגע מסוג זה' : language === 'ru' ? 'Сейчас нет активных поездок этого типа' : language === 'es' ? 'No hay viajes activos de este tipo' : language === 'fr' ? 'Aucun voyage actif de ce type' : language === 'de' ? 'Keine aktiven Reisen dieses Typs' : language === 'it' ? 'Nessun viaggio attivo di questo tipo' : 'No active trips of this type right now');
        setShowLiveTripsDialog(false);
        setJoiningLiveTrip(false);
        return;
      }

      const selectedTrip = liveTrips[0];
      const userName = (user.first_name && user.last_name) 
        ? `${user.first_name} ${user.last_name}` 
        : user.full_name;

      // Add join request
      const updatedPendingRequests = [
        ...(selectedTrip.pending_requests || []),
        {
          email: user.email,
          name: userName,
          requested_at: new Date().toISOString(),
          message: language === 'he' ? 'הצטרפות מהירה דרך הרדאר' : language === 'ru' ? 'Быстрое присоединение через радар' : language === 'es' ? 'Unión rápida vía radar' : language === 'fr' ? 'Adhésion rapide via radar' : language === 'de' ? 'Schnellbeitritt über Radar' : language === 'it' ? 'Unione rapida via radar' : 'Quick join via radar',
          accessibility_needs: [],
          waiver_accepted: false,
          waiver_timestamp: null
        }
      ];

      await base44.entities.Trip.update(selectedTrip.id, {
        pending_requests: updatedPendingRequests
      });

      toast.success(language === 'he' ? 'בקשה נשלחה בהצלחה!' : language === 'ru' ? 'Запрос успешно отправлен!' : language === 'es' ? '¡Solicitud enviada!' : language === 'fr' ? 'Demande envoyée!' : language === 'de' ? 'Anfrage gesendet!' : language === 'it' ? 'Richiesta inviata!' : 'Request sent successfully!');
      setShowLiveTripsDialog(false);
      
      // Navigate to trip details
      navigate(createPageUrl('TripDetails') + '?id=' + selectedTrip.id);
    } catch (error) {
      toast.error(language === 'he' ? 'שגיאה בהצטרפות' : language === 'ru' ? 'Ошибка присоединения' : language === 'es' ? 'Error al unirse' : language === 'fr' ? 'Erreur de participation' : language === 'de' ? 'Fehler beim Beitreten' : language === 'it' ? 'Errore nell\'unirsi' : 'Error joining');
    }
    setJoiningLiveTrip(false);
  };

  return (
    <div className="pb-8">
      {/* Announcement Toast */}
      <AnnouncementToast />

      {/* Organizer Alerts */}
      {user && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
          <OrganizerAlerts userEmail={user.email} />
        </section>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-teal-900 to-emerald-950 text-white min-h-[60vh] md:min-h-[85vh] flex items-center touch-manipulation mx-4 sm:mx-6 my-6 rounded-[2.5rem] shadow-[0_20px_80px_rgba(0,0,0,0.5),0_0_60px_rgba(16,185,129,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=85"
            alt="landscape"
            className="w-full h-full object-cover opacity-40 brightness-110 contrast-125 saturate-125"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/85 via-teal-900/80 to-emerald-950/85" />

          {/* Animated Particles - Reduced for performance */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-emerald-400/20 rounded-full hidden md:block"
              animate={{
                x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
                y: [Math.random() * 600, Math.random() * 600],
                scale: [1, 1.5, 1],
                opacity: [0.2, 0.4, 0.2]
              }}
              transition={{
                duration: 15 + Math.random() * 10,
                repeat: Infinity,
                ease: "linear",
                delay: i * 0.3
              }}
              style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
            />
          ))}

          {/* Floating Orbs - Desktop only for performance */}
          <div className="absolute top-20 left-20 w-96 h-96 bg-emerald-400/15 rounded-full blur-3xl hidden md:block" />
          <div className="absolute bottom-20 right-32 w-80 h-80 bg-teal-400/15 rounded-full blur-3xl hidden md:block" />

          {/* Static overlays for better performance */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_50%)]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="max-w-4xl"
          >
            {/* Decorative Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="inline-flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-emerald-500/30 to-teal-500/30 backdrop-blur-md border border-emerald-400/40 rounded-full px-3 py-1.5 sm:px-5 sm:py-2 mb-4 sm:mb-8 shadow-[0_4px_20px_rgba(16,185,129,0.4)]"
            >
              <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs sm:text-sm font-medium text-emerald-100">
                {language === 'he' ? 'פלטפורמת הטיולים המתקדמת של ישראל' : language === 'ru' ? 'Международная платформа для путешествий' : language === 'es' ? 'Plataforma Internacional de Viajes' : language === 'fr' ? 'Plateforme de voyage internationale' : language === 'de' ? 'Internationale Reiseplattform' : language === 'it' ? 'Piattaforma di viaggio internazionale' : 'International Trip Platform'}
              </span>
            </motion.div>

            {/* Main Title with Gradient */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-bold leading-tight mb-3 sm:mb-6"
            >
              <span className="bg-gradient-to-r from-white via-emerald-100 to-teal-200 bg-clip-text text-transparent">
                {language === 'he' ? 'כל הטיולים שלכם במקום אחד' : language === 'ru' ? 'Все ваши поездки в одном месте' : language === 'es' ? 'Todos tus viajes en un solo lugar' : language === 'fr' ? 'Tous vos voyages en un seul endroit' : language === 'de' ? 'Alle Ihre Reisen an einem Ort' : language === 'it' ? 'Tutti i tuoi viaggi in un unico posto' : 'All Your Trips in One Place'}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="text-base sm:text-xl md:text-2xl text-emerald-100/90 mb-6 sm:mb-12 leading-relaxed max-w-2xl"
            >
              {t('heroSubtitle')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.7 }}
              className="flex flex-col gap-3 sm:gap-4 w-full max-w-md"
            >
              {/* Primary Actions Row */}
              <div className="grid grid-cols-2 gap-3">
                <Link to={createPageUrl('CreateTrip')} className="w-full">
                  <motion.div whileTap={{ scale: 0.95 }} className="w-full">
                    <Button className="w-full bg-white text-emerald-700 hover:bg-emerald-50 h-12 px-4 text-sm font-bold shadow-2xl border-2 border-emerald-200 hover:border-emerald-300 touch-manipulation hover:shadow-[0_8px_30px_rgba(16,185,129,0.4)] transition-all">
                      <Plus className="w-5 h-5 mr-2" />
                      {t('createTrip')}
                    </Button>
                  </motion.div>
                </Link>
                <motion.div whileTap={{ scale: 0.95 }} className="w-full">
                  <Button 
                    onClick={() => document.getElementById('trips-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="w-full bg-emerald-600 text-white hover:bg-emerald-700 h-12 px-4 text-sm font-bold shadow-2xl border-2 border-emerald-700 hover:border-emerald-800 touch-manipulation hover:shadow-[0_8px_30px_rgba(16,185,129,0.5)] transition-all"
                  >
                    <Users className="w-5 h-5 mr-2" />
                    {language === 'he' ? 'הצטרף' : 'Join'}
                  </Button>
                </motion.div>
              </div>

              {/* Secondary Actions Row */}
              <div className="grid grid-cols-2 gap-3">
                <motion.div whileTap={{ scale: 0.95 }} className="w-full">
                  <Button 
                    onClick={handleShare}
                    className="w-full bg-rose-600 text-white hover:bg-rose-700 h-11 px-4 text-sm font-bold shadow-2xl border-2 border-rose-700 hover:border-rose-800 touch-manipulation hover:shadow-[0_8px_30px_rgba(225,29,72,0.5)] transition-all"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    {language === 'he' ? 'שתף' : 'Share'}
                  </Button>
                </motion.div>
                <motion.div whileTap={{ scale: 0.95 }} className="w-full">
                  <Button 
                    onClick={() => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const liveTrips = trips.filter(trip => {
                        const tripDate = new Date(trip.date);
                        tripDate.setHours(0, 0, 0, 0);
                        return tripDate.getTime() === today.getTime() && trip.status === 'open' && (!trip.privacy || trip.privacy === 'public');
                      });
                      if (liveTrips.length > 0) {
                        navigate(createPageUrl('TripDetails') + '?id=' + liveTrips[0].id);
                      } else {
                        toast.info(language === 'he' ? 'אין טיולים חיים כרגע' : 'No live trips right now');
                      }
                    }}
                    className="w-full relative bg-green-600 text-white hover:bg-green-700 h-11 px-4 text-sm font-bold shadow-2xl border-2 border-green-700 hover:border-green-800 touch-manipulation hover:shadow-[0_8px_30px_rgba(22,163,74,0.5)] transition-all"
                  >
                    <Radio className="w-4 h-4 mr-2 animate-pulse" />
                    {language === 'he' ? 'טיולים חיים' : 'Live'}
                  </Button>
                </motion.div>
              </div>

              {/* AI Recommendations - Desktop only */}
              <Link to={createPageUrl('AIRecommendations')} className="hidden sm:block w-full">
                <motion.div whileTap={{ scale: 0.95 }} className="w-full">
                  <Button className="w-full bg-purple-600 border-2 border-purple-700 text-white hover:bg-purple-700 hover:border-purple-800 h-12 px-6 text-sm font-bold shadow-2xl hover:shadow-[0_8px_30px_rgba(147,51,234,0.5)] touch-manipulation transition-all">
                    <span className="font-bold">
                      {t('aiRecommendations')}
                    </span>
                    <ArrowRight className={`w-5 h-5 ${isRTL ? 'mr-2 rotate-180' : 'ml-2'}`} />
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>

          {/* Enhanced Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.9 }}
            className="flex flex-wrap gap-3 sm:gap-6 mt-8 sm:mt-20"
          >
            {stats.map((stat, index) => (
              <div
                key={index}
                className="flex-1 min-w-[90px]"
              >
                <div className="flex items-center gap-2 sm:gap-4 bg-white rounded-2xl px-3 sm:px-8 py-3 sm:py-5 border-2 border-emerald-200 shadow-xl">
                  <div className="p-1.5 sm:p-3 bg-emerald-600 rounded-lg sm:rounded-xl">
                    <stat.icon className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xl sm:text-3xl font-bold text-gray-900">
                      {stat.value}
                    </div>
                    <div className="text-xs sm:text-sm text-emerald-700 font-bold truncate">{stat.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Video Call Invites Banner */}
      {myActiveInvites.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 shadow-xl">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Video className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">
                      {language === 'he' ? 'זימונים לשיחות וידאו' : language === 'ru' ? 'Приглашения на видеозвонок' : language === 'es' ? 'Invitaciones a videollamada' : language === 'fr' ? 'Invitations à appel vidéo' : language === 'de' ? 'Videoanruf-Einladungen' : language === 'it' ? 'Inviti a videochiamata' : 'Video Call Invitations'}
                    </h3>
                    <p className="text-emerald-50 text-sm">
                      {language === 'he' 
                        ? `יש לך ${myActiveInvites.length} זימון${myActiveInvites.length > 1 ? 'ים' : ''} פעיל${myActiveInvites.length > 1 ? 'ים' : ''}`
                        : language === 'ru'
                        ? `У вас ${myActiveInvites.length} активн${myActiveInvites.length > 1 ? 'ых приглашения' : 'ое приглашение'}`
                        : language === 'es'
                        ? `Tienes ${myActiveInvites.length} invitación${myActiveInvites.length > 1 ? 'es' : ''} activa${myActiveInvites.length > 1 ? 's' : ''}`
                        : language === 'fr'
                        ? `Vous avez ${myActiveInvites.length} invitation${myActiveInvites.length > 1 ? 's' : ''} active${myActiveInvites.length > 1 ? 's' : ''}`
                        : language === 'de'
                        ? `Sie haben ${myActiveInvites.length} aktive Einladung${myActiveInvites.length > 1 ? 'en' : ''}`
                        : language === 'it'
                        ? `Hai ${myActiveInvites.length} invit${myActiveInvites.length > 1 ? 'i attivi' : 'o attivo'}`
                        : `You have ${myActiveInvites.length} active invite${myActiveInvites.length > 1 ? 's' : ''}`}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  {myActiveInvites.map(({ trip, invite }) => {
                    const title = trip.title || trip.title_he || trip.title_en;
                    const scheduledDate = new Date(invite.scheduled_time);
                    const timeLabel = isToday(scheduledDate) 
                      ? (language === 'he' ? 'היום' : language === 'ru' ? 'Сегодня' : language === 'es' ? 'Hoy' : language === 'fr' ? 'Aujourd\'hui' : language === 'de' ? 'Heute' : language === 'it' ? 'Oggi' : 'Today')
                      : isTomorrow(scheduledDate)
                      ? (language === 'he' ? 'מחר' : language === 'ru' ? 'Завтра' : language === 'es' ? 'Mañana' : language === 'fr' ? 'Demain' : language === 'de' ? 'Morgen' : language === 'it' ? 'Domani' : 'Tomorrow')
                      : format(scheduledDate, 'MMM d');

                    return (
                      <div key={trip.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-lg">{title}</p>
                          <div className="flex items-center gap-4 mt-1 text-sm text-emerald-50">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {timeLabel} {format(scheduledDate, 'HH:mm')}
                            </span>
                            <span>
                              {language === 'he' ? 'מאת' : language === 'ru' ? 'от' : language === 'es' ? 'por' : language === 'fr' ? 'par' : language === 'de' ? 'von' : language === 'it' ? 'da' : 'by'} {invite.creator_name}
                            </span>
                          </div>
                        </div>
                        <Link to={createPageUrl('TripDetails') + '?id=' + trip.id}>
                          <Button 
                            className="bg-white text-emerald-600 hover:bg-emerald-50"
                          >
                            {language === 'he' ? 'צפה בטיול' : language === 'ru' ? 'Посмотреть поездку' : language === 'es' ? 'Ver viaje' : language === 'fr' ? 'Voir le voyage' : language === 'de' ? 'Reise ansehen' : language === 'it' ? 'Visualizza viaggio' : 'View Trip'}
                          </Button>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          </motion.div>
        </section>
      )}

      {/* Features Section - SEO H2 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-xl transition-shadow border-2 border-emerald-100">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {language === 'he' ? 'הרשמה מהירה' : language === 'ru' ? 'Быстрая регистрация' : language === 'es' ? 'Registro rápido' : language === 'fr' ? 'Inscription rapide' : language === 'de' ? 'Schnelle Anmeldung' : language === 'it' ? 'Registrazione rapida' : 'Quick Registration'}
              </h2>
              <p className="text-gray-600 text-sm">
                {language === 'he' ? 'טפסים דיגיטליים חכמים לרישום משתתפים - אוטומטי, מהיר ופשוט' : language === 'ru' ? 'Умные цифровые формы для регистрации участников - автоматически, быстро и просто' : language === 'es' ? 'Formularios digitales inteligentes para registro de participantes - automático, rápido y simple' : language === 'fr' ? 'Formulaires numériques intelligents pour l\'inscription des participants - automatique, rapide et simple' : language === 'de' ? 'Intelligente digitale Formulare zur Teilnehmerregistrierung - automatisch, schnell und einfach' : language === 'it' ? 'Moduli digitali intelligenti per la registrazione dei partecipanti - automatico, veloce e semplice' : 'Smart digital forms for participant registration - automatic, fast and simple'}
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow border-2 border-blue-100">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {language === 'he' ? 'מפות ומסלולים' : language === 'ru' ? 'Карты и маршруты' : language === 'es' ? 'Mapas y rutas' : language === 'fr' ? 'Cartes et itinéraires' : language === 'de' ? 'Karten und Routen' : language === 'it' ? 'Mappe e percorsi' : 'Maps & Routes'}
              </h2>
              <p className="text-gray-600 text-sm">
                {language === 'he' ? 'תכנון מסלולים, נקודות ציון ושיתוף מיקום בזמן אמת עם המשתתפים' : language === 'ru' ? 'Планирование маршрутов, точки интереса и обмен местоположением в реальном времени с участниками' : language === 'es' ? 'Planificación de rutas, puntos de referencia y ubicación en tiempo real con participantes' : language === 'fr' ? 'Planification d\'itinéraires, points de repère et partage de localisation en temps réel avec les participants' : language === 'de' ? 'Routenplanung, Wegpunkte und Echtzeit-Standortfreigabe mit Teilnehmern' : language === 'it' ? 'Pianificazione percorsi, punti di riferimento e condivisione posizione in tempo reale con i partecipanti' : 'Route planning, waypoints and real-time location sharing with participants'}
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow border-2 border-purple-100">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {language === 'he' ? 'ניהול תשלומים מאובטח' : language === 'ru' ? 'Безопасное управление платежами' : language === 'es' ? 'Gestión segura de pagos' : language === 'fr' ? 'Gestion sécurisée des paiements' : language === 'de' ? 'Sichere Zahlungsverwaltung' : language === 'it' ? 'Gestione pagamenti sicura' : 'Secure Payment Management'}
              </h2>
              <p className="text-gray-600 text-sm">
                {language === 'he' ? 'גביית תשלומים אוטומטית, מעקב סטטוסים ודוחות מפורטים - הכל במקום אחד' : language === 'ru' ? 'Автоматический сбор платежей, отслеживание статусов и подробные отчеты - все в одном месте' : language === 'es' ? 'Cobro automático de pagos, seguimiento de estados e informes detallados - todo en un solo lugar' : language === 'fr' ? 'Collecte automatique des paiements, suivi des statuts et rapports détaillés - le tout en un seul endroit' : language === 'de' ? 'Automatische Zahlungserfassung, Statusverfolgung und detaillierte Berichte - alles an einem Ort' : language === 'it' ? 'Raccolta automatica pagamenti, tracciamento stato e report dettagliati - tutto in un unico posto' : 'Automatic payment collection, status tracking and detailed reports - all in one place'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA to Planning Guide */}
        <div className="mt-8 text-center">
          <Link to={createPageUrl('TripPlanningGuide')}>
            <Button variant="outline" className="gap-2 border-2 border-emerald-300 hover:bg-emerald-50 h-12">
              <BookOpen className="w-5 h-5 text-emerald-600" />
              {language === 'he' ? 'מדריך מלא לארגון טיולים' : language === 'ru' ? 'Полное руководство по организации поездок' : language === 'es' ? 'Guía completa para organizar viajes' : language === 'fr' ? 'Guide complet pour organiser des voyages' : language === 'de' ? 'Vollständiger Leitfaden zur Reiseorganisation' : language === 'it' ? 'Guida completa per organizzare viaggi' : 'Complete Trip Organization Guide'}
            </Button>
          </Link>
        </div>
      </section>

      {/* Trips Section */}
      <section id="trips-section" className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12 pb-20 sm:pb-8">
          <ModernTripFilters 
            trips={trips}
            onFilteredTripsChange={setFilteredTrips}
          />

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6 mb-6">
            <div>
              <p className="text-sm sm:text-base text-gray-600">
                {sortedTrips.length} {language === 'he' ? 'טיולים נמצאו' : language === 'ru' ? 'поездок найдено' : language === 'es' ? 'viajes encontrados' : language === 'fr' ? 'voyages trouvés' : language === 'de' ? 'Reisen gefunden' : language === 'it' ? 'viaggi trovati' : 'trips found'}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-start sm:justify-end">
              <div className="flex bg-gray-100 rounded-lg p-0.5 sm:p-1 touch-manipulation">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={`gap-1 sm:gap-2 h-9 sm:h-10 px-2 sm:px-3 text-xs sm:text-sm min-h-[44px] touch-manipulation ${viewMode === 'grid' ? 'bg-white shadow-sm text-emerald-700' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  <List className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{language === 'he' ? 'רשימה' : 'List'}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('map')}
                  className={`gap-1 sm:gap-2 h-9 sm:h-10 px-2 sm:px-3 text-xs sm:text-sm min-h-[44px] touch-manipulation ${viewMode === 'map' ? 'bg-white shadow-sm text-emerald-700' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{language === 'he' ? 'מפה' : 'Map'}</span>
                </Button>
              </div>

              {user && (
                <Link to={createPageUrl('MyLists')} className="hidden sm:block">
                  <Button variant="outline" className="gap-2 h-10 sm:h-11 text-sm min-h-[44px] touch-manipulation">
                    <List className="w-4 h-4" />
                    {language === 'he' ? 'הרשימות שלי' : language === 'ru' ? 'Мои списки' : language === 'es' ? 'Mis listas' : language === 'fr' ? 'Mes listes' : language === 'de' ? 'Meine Listen' : language === 'it' ? 'Le mie liste' : 'My Lists'}
                  </Button>
                </Link>
              )}
              
              {viewMode === 'grid' && (
                <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto">
                  <span className="text-xs sm:text-sm text-gray-600 hidden sm:inline">
                    {language === 'he' ? 'מיין:' : language === 'ru' ? 'Сортировка:' : language === 'es' ? 'Ordenar:' : language === 'fr' ? 'Trier :' : language === 'de' ? 'Sortieren:' : language === 'it' ? 'Ordina:' : 'Sort:'}
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-2 sm:px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 flex-1 sm:flex-initial min-h-[44px] touch-manipulation"
                  >
                    <option value="date">{language === 'he' ? 'תאריך ↑' : language === 'ru' ? 'Дата ↑' : language === 'es' ? 'Fecha ↑' : language === 'fr' ? 'Date ↑' : language === 'de' ? 'Datum ↑' : language === 'it' ? 'Data ↑' : 'Date ↑'}</option>
                    <option value="date_desc">{language === 'he' ? 'תאריך ↓' : language === 'ru' ? 'Дата ↓' : language === 'es' ? 'Fecha ↓' : language === 'fr' ? 'Date ↓' : language === 'de' ? 'Datum ↓' : language === 'it' ? 'Data ↓' : 'Date ↓'}</option>
                    <option value="popularity">{language === 'he' ? 'פופולריות' : language === 'ru' ? 'Популярность' : language === 'es' ? 'Popularidad' : language === 'fr' ? 'Popularité' : language === 'de' ? 'Beliebtheit' : language === 'it' ? 'Popolarità' : 'Popularity'}</option>
                    <option value="likes">{language === 'he' ? 'לייקים' : language === 'ru' ? 'Больше всего лайков' : language === 'es' ? 'Más gustados' : language === 'fr' ? 'Les plus aimés' : language === 'de' ? 'Am beliebtesten' : language === 'it' ? 'Più apprezzati' : 'Most Liked'}</option>
                    <option value="comments">{language === 'he' ? 'הכי מדוברים' : language === 'ru' ? 'Больше всего обсуждаемые' : language === 'es' ? 'Más comentados' : language === 'fr' ? 'Les plus commentés' : language === 'de' ? 'Am meisten diskutiert' : language === 'it' ? 'Più commentati' : 'Most Discussed'}</option>
                    <option value="newest">{language === 'he' ? 'החדשים ביותר' : language === 'ru' ? 'Новейшие' : language === 'es' ? 'Más recientes' : language === 'fr' ? 'Les plus récents' : language === 'de' ? 'Neueste' : language === 'it' ? 'Più recenti' : 'Newest'}</option>
                    <option value="title">{language === 'he' ? 'א-ת' : language === 'ru' ? 'А-Я' : language === 'es' ? 'A-Z' : language === 'fr' ? 'A-Z' : language === 'de' ? 'A-Z' : language === 'it' ? 'A-Z' : 'A-Z'}</option>
                  </select>
                </div>
              )}
            </div>
          </div>

        {viewMode === 'map' ? (
          <div>
            <TripsMap trips={sortedTrips} />
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-48 w-full rounded-xl" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : displayedTrips.length > 0 ? (
          <>
            {Object.entries(tripsByCountry).map(([country, countryTrips]) => {
              const visibleCountryTrips = countryTrips.slice(0, visibleCount);

              return (
                <motion.div
                  key={country}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-12"
                >
                  {/* Country Header */}
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-emerald-300 to-transparent" />
                    <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl sm:rounded-2xl border border-emerald-200/50 shadow-sm">
                      <Globe className="w-4 h-4 sm:w-6 sm:h-6 text-emerald-600" />
                      <h3 className="text-base sm:text-2xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
                        {t(country)}
                      </h3>
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 font-semibold text-xs sm:text-sm">
                        {countryTrips.length}
                      </Badge>
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-emerald-300 to-transparent" />
                  </div>

                  {/* Trips Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {visibleCountryTrips.map((trip, index) => (
                      <div key={trip.id}>
                        <TripCard trip={trip} currentUser={user} />
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}

            {sortedTrips.length > visibleCount && (
              <div className="flex justify-center mt-8 sm:mt-10">
                <Button
                  variant="outline"
                  onClick={() => setVisibleCount(prev => prev + 8)}
                  className="gap-2 h-12 px-8 text-base font-semibold touch-manipulation min-h-[44px]"
                >
                  <ChevronDown className="w-5 h-5" />
                  {language === 'he' ? 'הצג עוד' : language === 'ru' ? 'Загрузить ещё' : language === 'es' ? 'Cargar más' : language === 'fr' ? 'Charger plus' : language === 'de' ? 'Mehr laden' : language === 'it' ? 'Carica altro' : 'Load More'}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="relative text-center py-20 bg-gradient-to-br from-white to-gray-50 rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05),transparent_60%)]" />
            <div className="relative">
              <Compass className="w-20 h-20 text-emerald-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{t('noTripsFound')}</h3>
              <p className="text-gray-600 mb-8 text-lg">{t('createFirstTrip')}</p>
              <Link to={createPageUrl('CreateTrip')}>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white h-14 px-8 text-lg font-bold shadow-xl border-2 border-emerald-700 hover:border-emerald-800">
                  <Plus className="w-5 h-5 mr-2" />
                  {t('createTrip')}
                </Button>
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Past Trips Section */}
      {pastTrips.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-20 sm:pb-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
            <div className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm">
              <History className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
              <h3 className="text-lg sm:text-2xl font-bold text-gray-700">
                {language === 'he' ? 'טיולים שהיו' : language === 'ru' ? 'Прошедшие поездки' : language === 'es' ? 'Viajes pasados' : language === 'fr' ? 'Voyages passés' : language === 'de' ? 'Vergangene Reisen' : language === 'it' ? 'Viaggi passati' : 'Past Trips'}
              </h3>
              <Badge variant="secondary" className="bg-gray-200 text-gray-700 font-semibold text-xs sm:text-sm">
                {pastTrips.length}
              </Badge>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
          </div>

          {/* Group past trips by country */}
          {Object.entries(pastTrips.reduce((acc, trip) => {
            let country = trip.country;
            if (!country && trip.region && ['north', 'center', 'south', 'jerusalem', 'negev', 'eilat'].includes(trip.region)) {
              country = 'israel';
            }
            if (!country) {
              country = 'other';
            }
            if (!acc[country]) acc[country] = [];
            acc[country].push(trip);
            return acc;
          }, {})).map(([country, countryTrips]) => (
            <motion.div
              key={country}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              {/* Country Header */}
              <div className="flex items-center gap-2 sm:gap-3 mb-4">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
                  <Globe className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-semibold text-gray-600">{t(country)}</span>
                  <Badge variant="outline" className="bg-white text-gray-600 text-xs">
                    {countryTrips.length}
                  </Badge>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {countryTrips.map((trip) => (
                  <div
                    key={trip.id}
                    className="opacity-75 hover:opacity-100 transition-opacity"
                  >
                    <TripCard trip={trip} currentUser={user} />
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </section>
      )}

      {/* Live Trips Dialog */}
      <Dialog open={showLiveTripsDialog} onOpenChange={setShowLiveTripsDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-center justify-center">
              <Radio className="w-6 h-6 text-emerald-600" />
              {language === 'he' ? 'הצטרף לטיול חי' : language === 'ru' ? 'Присоединиться к живой поездке' : language === 'es' ? 'Únete a un viaje en vivo' : language === 'fr' ? 'Rejoindre un voyage en direct' : language === 'de' ? 'Live-Reise beitreten' : language === 'it' ? 'Unisciti a un viaggio live' : 'Join a Live Trip'}
            </DialogTitle>
            <DialogDescription className="text-center">
              {language === 'he' 
                ? 'בחר את סוג הפעילות שאתה מעוניין בה היום'
                : language === 'ru' ? 'Выберите тип активности, которая вас интересует сегодня'
                : language === 'es' ? 'Elige el tipo de actividad que te interesa hoy'
                : language === 'fr' ? 'Choisissez le type d\'activité qui vous intéresse aujourd\'hui'
                : language === 'de' ? 'Wählen Sie die Aktivität, die Sie heute interessiert'
                : language === 'it' ? 'Scegli il tipo di attività che ti interessa oggi'
                : 'Choose the activity type you\'re interested in today'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-3 py-4">
            <Button
              onClick={() => handleJoinLiveTrip('hiking')}
              disabled={joiningLiveTrip}
              className="h-20 flex items-center justify-start gap-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
            >
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Mountain className="w-6 h-6" />
              </div>
              <div className="text-right flex-1">
                <p className="font-bold text-lg">{t('hiking')}</p>
                <p className="text-sm text-green-100">{language === 'he' ? 'טיולי רגלי' : language === 'ru' ? 'Пешие прогулки' : language === 'es' ? 'Senderismo' : language === 'fr' ? 'Randonnée' : language === 'de' ? 'Wandern' : language === 'it' ? 'Escursioni' : 'Hiking trips'}</p>
              </div>
            </Button>

            <Button
              onClick={() => handleJoinLiveTrip('cycling')}
              disabled={joiningLiveTrip}
              className="h-20 flex items-center justify-start gap-4 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white"
            >
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Bike className="w-6 h-6" />
              </div>
              <div className="text-right flex-1">
                <p className="font-bold text-lg">{t('cycling')}</p>
                <p className="text-sm text-blue-100">{language === 'he' ? 'רכיבת אופניים' : language === 'ru' ? 'Велоспорт' : language === 'es' ? 'Ciclismo' : language === 'fr' ? 'Cyclisme' : language === 'de' ? 'Radfahren' : language === 'it' ? 'Ciclismo' : 'Cycling trips'}</p>
              </div>
            </Button>

            <Button
              onClick={() => handleJoinLiveTrip('offroad')}
              disabled={joiningLiveTrip}
              className="h-20 flex items-center justify-start gap-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
            >
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Truck className="w-6 h-6" />
              </div>
              <div className="text-right flex-1">
                <p className="font-bold text-lg">{t('offroad')}</p>
                <p className="text-sm text-orange-100">{language === 'he' ? 'טיולי שטח' : language === 'ru' ? 'Внедорожные' : language === 'es' ? 'Todo terreno' : language === 'fr' ? 'Tout-terrain' : language === 'de' ? 'Offroad' : language === 'it' ? 'Fuoristrada' : 'Off-road trips'}</p>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}