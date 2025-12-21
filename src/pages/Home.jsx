import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguage } from '../components/LanguageContext';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import TripCard from '../components/trips/TripCard';
import TripFilters from '../components/trips/TripFilters';
import TripsMap from '../components/maps/TripsMap';
import { getContinentForCountry, continents } from '../components/utils/ContinentMapping';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Compass, Users, MapPin, ArrowRight, ChevronDown, Video, Calendar, Share2, SlidersHorizontal, List, Globe, Heart, Radio, Bike, Mountain, Truck, History } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from 'framer-motion';
import { format, isPast, isToday, isTomorrow } from 'date-fns';
import { toast } from "sonner";
import AnnouncementToast from '../components/announcements/AnnouncementToast';

export default function Home() {
  const { t, isRTL, language } = useLanguage();
  const navigate = useNavigate();
  const [filters, setFilters] = useState({});
  const [visibleCount, setVisibleCount] = useState(8);
  const [sortBy, setSortBy] = useState('date');
  const [user, setUser] = useState(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'
  const [selectedContinent, setSelectedContinent] = useState('all');
  const [showLiveTripsDialog, setShowLiveTripsDialog] = useState(false);
  const [joiningLiveTrip, setJoiningLiveTrip] = useState(false);

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

  const filteredTrips = trips.filter(trip => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const title = trip.title || trip.title_he || trip.title_en;
      const desc = trip.description || trip.description_he || trip.description_en;
      if (!title?.toLowerCase().includes(searchLower) && 
          !desc?.toLowerCase().includes(searchLower) &&
          !trip.location?.toLowerCase().includes(searchLower)) {
        return false;
      }
    }
    
    // Continent filter from dropdown
    if (selectedContinent !== 'all') {
      const tripCountry = trip.country || 'israel'; // backward compatibility
      const tripContinent = getContinentForCountry(tripCountry);
      if (tripContinent !== selectedContinent) return false;
    }
    
    if (filters.country && trip.country !== filters.country) {
      // For backward compatibility, if trip has no country, assume israel
      if (!trip.country && filters.country !== 'israel') return false;
      if (trip.country && trip.country !== filters.country) return false;
    }
    if (filters.region && trip.region !== filters.region) return false;
    if (filters.difficulty && trip.difficulty !== filters.difficulty) return false;
    if (filters.duration_type && trip.duration_type !== filters.duration_type) return false;
    if (filters.activity_type && trip.activity_type !== filters.activity_type) return false;
    if (filters.pets_allowed && !trip.pets_allowed) return false;
    if (filters.camping_available && !trip.camping_available) return false;
    if (filters.trail_type?.length > 0) {
      if (!trip.trail_type?.some(t => filters.trail_type.includes(t))) return false;
    }
    if (filters.interests?.length > 0) {
      if (!trip.interests?.some(i => filters.interests.includes(i))) return false;
    }
    if (filters.date_from && new Date(trip.date) < new Date(filters.date_from)) return false;
    if (filters.date_to && new Date(trip.date) > new Date(filters.date_to)) return false;

    // Filter by available spots
    if (filters.available_spots) {
      const hasSpots = !trip.max_participants || 
        (trip.current_participants || 1) < trip.max_participants;
      if (!hasSpots) return false;
    }

    // Favorites filter
    if (filters.favorites) {
      if (!user || !trip.likes?.some(like => like.email === user.email)) return false;
    }

    if (trip.status !== 'open') return false;

    // Privacy filtering
    if (trip.privacy === 'private') {
      // Only show to organizer and participants
      if (!user) return false;
      const isOrganizerOrParticipant = trip.organizer_email === user.email || 
        trip.participants?.some(p => p.email === user.email);
      if (!isOrganizerOrParticipant) return false;
    } else if (trip.privacy === 'invite_only') {
      // Only show to invited users, organizer, and participants
      if (!user) return false;
      const isInvitedOrParticipant = trip.invited_emails?.includes(user.email) ||
        trip.organizer_email === user.email ||
        trip.participants?.some(p => p.email === user.email);
      if (!isInvitedOrParticipant) return false;
    }

    // Only show future trips in main section
    const tripDate = new Date(trip.date);
    tripDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (tripDate < today) return false;

    return true;
  }).sort((a, b) => {
    // Smart sorting: prioritize user's location and interests
    if (user && sortBy === 'date') {
      // Get user's participated/viewed/liked countries
      const userCountries = new Set();
      trips.forEach(t => {
        if (t.participants?.some(p => p.email === user.email) ||
            t.views?.some(v => v.email === user.email) ||
            t.likes?.some(l => l.email === user.email)) {
          userCountries.add(t.country || 'israel');
        }
      });

      const aCountry = a.country || 'israel';
      const bCountry = b.country || 'israel';
      const userHomeCountry = user.home_region ? 
        trips.find(t => t.region === user.home_region)?.country || 'israel' : 'israel';

      // Priority: 1. Home country, 2. Interacted countries, 3. Others
      const aPriority = aCountry === userHomeCountry ? 0 : 
                        userCountries.has(aCountry) ? 1 : 2;
      const bPriority = bCountry === userHomeCountry ? 0 : 
                        userCountries.has(bCountry) ? 1 : 2;

      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      
      // Within same priority, sort by date
      return new Date(a.date) - new Date(b.date);
    }

    switch (sortBy) {
      case 'date':
        return new Date(a.date) - new Date(b.date);
      case 'date_desc':
        return new Date(b.date) - new Date(a.date);
      case 'popularity':
        return (b.current_participants || 0) - (a.current_participants || 0);
      case 'likes':
        return (b.likes?.length || 0) - (a.likes?.length || 0);
      case 'comments':
        return (b.comments?.length || 0) - (a.comments?.length || 0);
      case 'newest':
        return new Date(b.created_date) - new Date(a.created_date);
      case 'title':
        const titleA = a.title || a.title_he || a.title_en;
        const titleB = b.title || b.title_he || b.title_en;
        return titleA.localeCompare(titleB);
      default:
        return 0;
    }
  });

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
  }).sort((a, b) => new Date(b.date) - new Date(a.date));

  // Group trips by country
  const tripsByCountry = filteredTrips.reduce((acc, trip) => {
    const country = trip.country || 'israel';
    if (!acc[country]) acc[country] = [];
    acc[country].push(trip);
    return acc;
  }, {});

  const displayedTrips = filteredTrips.slice(0, visibleCount);

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
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-teal-900 to-emerald-950 text-white min-h-[60vh] md:min-h-[85vh] flex items-center touch-manipulation mx-4 sm:mx-6 my-6 rounded-[2.5rem] shadow-[0_20px_80px_rgba(0,0,0,0.5),0_0_60px_rgba(16,185,129,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&q=80"
            alt="landscape"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/95 via-teal-900/90 to-emerald-950/95" />

          {/* Animated Particles */}
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-emerald-400/30 rounded-full"
              animate={{
                x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
                y: [Math.random() * 600, Math.random() * 600],
                scale: [1, 1.5, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{
                duration: 10 + Math.random() * 10,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.2
              }}
              style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
            />
          ))}

          {/* Floating Orbs */}
          <motion.div
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 left-20 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              x: [0, -80, 0],
              y: [0, 100, 0],
              scale: [1, 1.3, 1],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-20 right-32 w-80 h-80 bg-teal-400/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              x: [0, 60, 0],
              y: [0, -60, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute top-1/2 right-20 w-72 h-72 bg-emerald-300/15 rounded-full blur-3xl"
          />

          {/* Animated Mesh Gradient */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.15),transparent_50%)]" />

          {/* Grid Pattern Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
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
                {t('heroTitle')}
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
                    className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 h-11 px-4 text-sm font-bold shadow-lg border border-white/20 touch-manipulation"
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
                    className="w-full relative bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 h-11 px-4 text-sm font-bold shadow-lg border border-white/20 touch-manipulation"
                  >
                    <Radio className="w-4 h-4 mr-2 animate-pulse" />
                    {language === 'he' ? 'טיולים חיים' : 'Live'}
                  </Button>
                </motion.div>
              </div>

              {/* AI Recommendations - Desktop only */}
              <Link to={createPageUrl('AIRecommendations')} className="hidden sm:block w-full">
                <motion.div whileTap={{ scale: 0.95 }} className="w-full">
                  <Button className="w-full bg-white/10 backdrop-blur-md border-2 border-white/30 text-white hover:bg-white/20 h-12 px-6 text-sm font-bold shadow-xl touch-manipulation">
                    <span className="bg-gradient-to-r from-emerald-200 to-teal-200 bg-clip-text text-transparent font-bold">
                      {t('aiRecommendations')}
                    </span>
                    <ArrowRight className={`w-5 h-5 ${isRTL ? 'mr-2 rotate-180' : 'ml-2'}`} />
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>

          {/* Enhanced Stats with Animations */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.9 }}
            className="flex flex-wrap gap-3 sm:gap-6 mt-8 sm:mt-20"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -6 }}
                className="group relative flex-1 min-w-[90px]"
              >
                <div className="absolute inset-0 bg-emerald-400/30 rounded-2xl blur-2xl group-hover:blur-3xl transition-all" />
                <div className="relative flex items-center gap-2 sm:gap-4 bg-white rounded-2xl px-3 sm:px-8 py-3 sm:py-5 border-2 border-emerald-200 shadow-2xl hover:shadow-[0_12px_40px_rgba(16,185,129,0.4)] transition-all">
                  <div className="p-1.5 sm:p-3 bg-emerald-600 rounded-lg sm:rounded-xl shadow-lg">
                    <stat.icon className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 1, delay: 1 + index * 0.1 }}
                      className="text-xl sm:text-3xl font-bold text-gray-900"
                    >
                      {stat.value}
                    </motion.div>
                    <div className="text-xs sm:text-sm text-emerald-700 font-bold truncate">{stat.label}</div>
                  </div>
                </div>
              </motion.div>
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

      {/* Trips Section */}
      <section id="trips-section" className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12 pb-20 sm:pb-8">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                {t('exploreTrips')}
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                {filteredTrips.length} {language === 'he' ? 'טיולים נמצאו' : language === 'ru' ? 'поездок найдено' : language === 'es' ? 'viajes encontrados' : language === 'fr' ? 'voyages trouvés' : language === 'de' ? 'Reisen gefunden' : language === 'it' ? 'viaggi trovati' : 'trips found'}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-start sm:justify-end">
              {/* Continent Filter */}
              <Select value={selectedContinent} onValueChange={setSelectedContinent}>
                <SelectTrigger className="w-[140px] sm:w-[200px] h-10 sm:h-11 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === 'he' ? 'כל היבשות' : language === 'ru' ? 'Все континенты' : language === 'es' ? 'Todos los continentes' : language === 'fr' ? 'Tous les continents' : language === 'de' ? 'Alle Kontinente' : language === 'it' ? 'Tutti i continenti' : 'All Continents'}</SelectItem>
                  <SelectItem value="europe">{language === 'he' ? 'אירופה' : language === 'ru' ? 'Европа' : language === 'es' ? 'Europa' : language === 'fr' ? 'Europe' : language === 'de' ? 'Europa' : language === 'it' ? 'Europa' : 'Europe'}</SelectItem>
                  <SelectItem value="asia">{language === 'he' ? 'אסיה' : language === 'ru' ? 'Азия' : language === 'es' ? 'Asia' : language === 'fr' ? 'Asie' : language === 'de' ? 'Asien' : language === 'it' ? 'Asia' : 'Asia'}</SelectItem>
                  <SelectItem value="africa">{language === 'he' ? 'אפריקה' : language === 'ru' ? 'Африка' : language === 'es' ? 'África' : language === 'fr' ? 'Afrique' : language === 'de' ? 'Afrika' : language === 'it' ? 'Africa' : 'Africa'}</SelectItem>
                  <SelectItem value="north_america">{language === 'he' ? 'צפון אמריקה' : language === 'ru' ? 'Северная Америка' : language === 'es' ? 'América del Norte' : language === 'fr' ? 'Amérique du Nord' : language === 'de' ? 'Nordamerika' : language === 'it' ? 'Nord America' : 'North America'}</SelectItem>
                  <SelectItem value="south_america">{language === 'he' ? 'דרום אמריקה' : language === 'ru' ? 'Южная Америка' : language === 'es' ? 'América del Sur' : language === 'fr' ? 'Amérique du Sud' : language === 'de' ? 'Südamerika' : language === 'it' ? 'Sud America' : 'South America'}</SelectItem>
                  <SelectItem value="oceania">{language === 'he' ? 'אוקיאניה' : language === 'ru' ? 'Океания' : language === 'es' ? 'Oceanía' : language === 'fr' ? 'Océanie' : language === 'de' ? 'Ozeanien' : language === 'it' ? 'Oceania' : 'Oceania'}</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode Toggle */}
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
                <>
                  <Button 
                    variant={filters.favorites ? "default" : "outline"}
                    className={`gap-1 sm:gap-2 h-10 sm:h-11 px-2 sm:px-4 text-xs sm:text-sm min-h-[44px] touch-manipulation ${filters.favorites ? 'bg-rose-600 hover:bg-rose-700 text-white' : ''}`}
                    onClick={() => setFilters(prev => ({ ...prev, favorites: !prev.favorites }))}
                  >
                    <Heart className={`w-3 h-3 sm:w-4 sm:h-4 ${filters.favorites ? 'fill-white' : ''}`} />
                    <span className="hidden sm:inline">{language === 'he' ? 'מועדפים' : language === 'ru' ? 'Избранное' : language === 'es' ? 'Favoritos' : language === 'fr' ? 'Favoris' : language === 'de' ? 'Favoriten' : language === 'it' ? 'Preferiti' : 'Favorites'}</span>
                  </Button>
                  <Link to={createPageUrl('MyLists')} className="hidden sm:block">
                    <Button variant="outline" className="gap-2 h-10 sm:h-11 text-sm min-h-[44px] touch-manipulation">
                      <List className="w-4 h-4" />
                      {language === 'he' ? 'הרשימות שלי' : language === 'ru' ? 'Мои списки' : language === 'es' ? 'Mis listas' : language === 'fr' ? 'Mes listes' : language === 'de' ? 'Meine Listen' : language === 'it' ? 'Le mie liste' : 'My Lists'}
                    </Button>
                  </Link>
                </>
              )}
              <Button
                variant="outline"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="gap-1 sm:gap-2 h-10 sm:h-11 px-2 sm:px-4 text-xs sm:text-sm min-h-[44px] touch-manipulation"
              >
                <SlidersHorizontal className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{language === 'he' ? 'סינון מתקדם' : language === 'ru' ? 'Расширенные фильтры' : language === 'es' ? 'Filtros avanzados' : language === 'fr' ? 'Filtres avancés' : language === 'de' ? 'Erweiterte Filter' : language === 'it' ? 'Filtri avanzati' : 'Advanced Filters'}</span>
                <span className="sm:hidden">{language === 'he' ? 'סינון' : language === 'ru' ? 'Фильтры' : language === 'es' ? 'Filtros' : language === 'fr' ? 'Filtres' : language === 'de' ? 'Filter' : language === 'it' ? 'Filtri' : 'Filters'}</span>
              </Button>
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
          <TripFilters 
            filters={filters} 
            setFilters={setFilters} 
            showAdvanced={showAdvancedFilters}
          />
        </div>

        {viewMode === 'map' ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <TripsMap trips={filteredTrips} />
          </motion.div>
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
                  <motion.div 
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: { staggerChildren: 0.08 }
                      }
                    }}
                  >
                    {visibleCountryTrips.map((trip, index) => (
                      <motion.div
                        key={trip.id}
                        variants={{
                          hidden: { opacity: 0, y: 30, scale: 0.95 },
                          visible: { 
                            opacity: 1, 
                            y: 0,
                            scale: 1,
                            transition: {
                              type: "spring",
                              stiffness: 100,
                              damping: 12
                            }
                          }
                        }}
                        whileHover={{ 
                          y: -8,
                          transition: { duration: 0.3 }
                        }}
                        className="group relative"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/0 to-teal-400/0 group-hover:from-emerald-400/20 group-hover:to-teal-400/20 rounded-2xl blur-xl transition-all duration-500 opacity-0 group-hover:opacity-100" />
                        <div className="relative">
                          <TripCard trip={trip} />
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              );
            })}

            {filteredTrips.length > visibleCount && (
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
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative text-center py-20 bg-gradient-to-br from-white to-gray-50 rounded-3xl border border-gray-200 shadow-xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05),transparent_60%)]" />
            <div className="relative">
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                <Compass className="w-20 h-20 text-emerald-400 mx-auto mb-6" />
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{t('noTripsFound')}</h3>
              <p className="text-gray-600 mb-8 text-lg">{t('createFirstTrip')}</p>
              <Link to={createPageUrl('CreateTrip')}>
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white h-14 px-8 text-lg font-bold shadow-2xl shadow-emerald-500/30">
                    <Plus className="w-5 h-5 mr-2" />
                    {t('createTrip')}
                  </Button>
                </motion.div>
              </Link>
            </div>
          </motion.div>
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
            const country = trip.country || 'israel';
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

              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.08 }
                  }
                }}
              >
                {countryTrips.map((trip) => (
                  <motion.div
                    key={trip.id}
                    variants={{
                      hidden: { opacity: 0, y: 30, scale: 0.95 },
                      visible: { 
                        opacity: 1, 
                        y: 0,
                        scale: 1,
                        transition: {
                          type: "spring",
                          stiffness: 100,
                          damping: 12
                        }
                      }
                    }}
                    whileHover={{ 
                      y: -8,
                      transition: { duration: 0.3 }
                    }}
                    className="group relative opacity-75 hover:opacity-100 transition-opacity"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-400/0 to-gray-400/0 group-hover:from-gray-400/20 group-hover:to-gray-500/20 rounded-2xl blur-xl transition-all duration-500 opacity-0 group-hover:opacity-100" />
                    <div className="relative">
                      <TripCard trip={trip} />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
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