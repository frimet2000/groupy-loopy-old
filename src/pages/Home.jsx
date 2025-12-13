import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguage } from '../components/LanguageContext';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import TripCard from '../components/trips/TripCard';
import TripFilters from '../components/trips/TripFilters';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Compass, Users, MapPin, ArrowRight, ChevronDown, Video, Calendar, Share2, SlidersHorizontal, List } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, isPast, isToday, isTomorrow } from 'date-fns';
import { toast } from "sonner";

export default function Home() {
  const { t, isRTL, language } = useLanguage();
  const [filters, setFilters] = useState({});
  const [visibleCount, setVisibleCount] = useState(8);
  const [sortBy, setSortBy] = useState('date');
  const [user, setUser] = useState(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

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

    return true;
  }).sort((a, b) => {
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

  const displayedTrips = filteredTrips.slice(0, visibleCount);

  const openTrips = trips.filter(t => t.status === 'open');
  
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
    { icon: Compass, value: openTrips.length, label: language === 'he' ? 'טיולים פעילים' : 'Active Trips', color: 'text-emerald-300' },
    { icon: Users, value: uniqueParticipants.size, label: language === 'he' ? 'משתתפים' : 'Participants', color: 'text-blue-300' },
    { icon: MapPin, value: new Set(openTrips.map(t => t.region)).size, label: language === 'he' ? 'אזורים' : 'Regions', color: 'text-purple-300' },
  ];

  const handleShare = async () => {
    const shareData = {
      title: 'The Group Loop',
      text: language === 'he' 
        ? 'מצא שותפים לטיול הבא שלך!' 
        : 'Find partners for your next trip!',
      url: window.location.origin
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.origin);
        toast.success(language === 'he' ? 'הקישור הועתק ללוח' : 'Link copied to clipboard');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        await navigator.clipboard.writeText(window.location.origin);
        toast.success(language === 'he' ? 'הקישור הועתק ללוח' : 'Link copied to clipboard');
      }
    }
  };

  return (
    <div className="pb-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-teal-900 to-emerald-950 text-white min-h-[85vh] flex items-center">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&q=80"
            alt="Israel landscape"
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

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20">
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
              className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 backdrop-blur-sm border border-emerald-400/30 rounded-full px-5 py-2 mb-8"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-sm font-medium text-emerald-100">
                {language === 'he' ? 'פלטפורמת הטיולים המתקדמת של ישראל' : 'Israel\'s Advanced Trip Platform'}
              </span>
            </motion.div>

            {/* Main Title with Gradient */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight mb-6"
            >
              <span className="bg-gradient-to-r from-white via-emerald-100 to-teal-200 bg-clip-text text-transparent">
                {t('heroTitle')}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="text-xl md:text-2xl text-emerald-100/90 mb-12 leading-relaxed max-w-2xl"
            >
              {t('heroSubtitle')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.7 }}
              className="flex flex-wrap gap-4"
            >
              <Link to={createPageUrl('CreateTrip')}>
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button size="lg" className="bg-gradient-to-r from-white to-emerald-50 text-emerald-900 hover:from-emerald-50 hover:to-white h-16 px-10 text-lg font-bold shadow-2xl shadow-emerald-500/20 border-2 border-white/50">
                    <Plus className="w-6 h-6 mr-2" />
                    {t('createTrip')}
                  </Button>
                </motion.div>
              </Link>
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  size="lg" 
                  onClick={() => {
                    if (user?.home_region) {
                      setFilters({ region: user.home_region });
                    }
                    document.getElementById('trips-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white hover:from-teal-600 hover:to-emerald-700 h-16 px-10 text-lg font-bold shadow-2xl shadow-teal-500/20 border-2 border-white/20"
                >
                  <Users className="w-6 h-6 mr-2" />
                  {language === 'he' ? 'הצטרף לטיול' : 'Join a Trip'}
                </Button>
              </motion.div>
              <Link to={createPageUrl('AIRecommendations')}>
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button size="lg" className="bg-white/10 backdrop-blur-md border-2 border-white/30 text-white hover:bg-white/20 h-16 px-10 text-lg font-bold shadow-xl">
                    <span className="bg-gradient-to-r from-emerald-200 to-teal-200 bg-clip-text text-transparent font-bold">
                      {t('aiRecommendations')}
                    </span>
                    <ArrowRight className={`w-6 h-6 ${isRTL ? 'mr-2 rotate-180' : 'ml-2'}`} />
                  </Button>
                </motion.div>
              </Link>
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  size="lg" 
                  onClick={handleShare}
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600 h-16 px-10 text-lg font-bold shadow-2xl shadow-orange-500/30 border-2 border-yellow-300/30"
                >
                  <Share2 className="w-6 h-6 mr-2" />
                  {language === 'he' ? 'שתף עם חברים' : 'Share with Friends'}
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Enhanced Stats with Animations */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.9 }}
            className="flex flex-wrap gap-6 mt-20"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -4 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/30 to-teal-400/30 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
                <div className="relative flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-2xl px-8 py-5 border border-white/20">
                  <div className="p-3 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-xl">
                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                  <div>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 1, delay: 1 + index * 0.1 }}
                      className="text-3xl font-bold bg-gradient-to-r from-white to-emerald-100 bg-clip-text text-transparent"
                    >
                      {stat.value}
                    </motion.div>
                    <div className="text-sm text-emerald-200 font-medium">{stat.label}</div>
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
                      {language === 'he' ? 'זימונים לשיחות וידאו' : 'Video Call Invitations'}
                    </h3>
                    <p className="text-emerald-50 text-sm">
                      {language === 'he' 
                        ? `יש לך ${myActiveInvites.length} זימון${myActiveInvites.length > 1 ? 'ים' : ''} פעיל${myActiveInvites.length > 1 ? 'ים' : ''}`
                        : `You have ${myActiveInvites.length} active invite${myActiveInvites.length > 1 ? 's' : ''}`}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  {myActiveInvites.map(({ trip, invite }) => {
                    const title = trip.title || trip.title_he || trip.title_en;
                    const scheduledDate = new Date(invite.scheduled_time);
                    const timeLabel = isToday(scheduledDate) 
                      ? (language === 'he' ? 'היום' : 'Today')
                      : isTomorrow(scheduledDate)
                      ? (language === 'he' ? 'מחר' : 'Tomorrow')
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
                              {language === 'he' ? 'מאת' : 'by'} {invite.creator_name}
                            </span>
                          </div>
                        </div>
                        <Link to={createPageUrl('TripDetails') + '?id=' + trip.id}>
                          <Button 
                            className="bg-white text-emerald-600 hover:bg-emerald-50"
                          >
                            {language === 'he' ? 'צפה בטיול' : 'View Trip'}
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
      <section id="trips-section" className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                {t('exploreTrips')}
              </h2>
              <p className="text-gray-600 mt-1">
                {filteredTrips.length} {language === 'he' ? 'טיולים נמצאו' : 'trips found'}
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {user && (
                <Link to={createPageUrl('MyLists')}>
                  <Button variant="outline" className="gap-2">
                    <List className="w-4 h-4" />
                    {language === 'he' ? 'הרשימות שלי' : 'My Lists'}
                  </Button>
                </Link>
              )}
              <Button
                variant="outline"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="gap-2"
              >
                <SlidersHorizontal className="w-4 h-4" />
                {language === 'he' ? 'סינון מתקדם' : 'Advanced Filters'}
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {language === 'he' ? 'מיין:' : 'Sort:'}
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="date">{language === 'he' ? 'תאריך ↑' : 'Date ↑'}</option>
                  <option value="date_desc">{language === 'he' ? 'תאריך ↓' : 'Date ↓'}</option>
                  <option value="popularity">{language === 'he' ? 'פופולריות' : 'Popularity'}</option>
                  <option value="likes">{language === 'he' ? 'לייקים' : 'Most Liked'}</option>
                  <option value="comments">{language === 'he' ? 'הכי מדוברים' : 'Most Discussed'}</option>
                  <option value="newest">{language === 'he' ? 'החדשים ביותר' : 'Newest'}</option>
                  <option value="title">{language === 'he' ? 'א-ת' : 'A-Z'}</option>
                </select>
              </div>
            </div>
          </div>
          <TripFilters 
            filters={filters} 
            setFilters={setFilters} 
            showAdvanced={showAdvancedFilters}
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1 }
                }
              }}
            >
              {displayedTrips.map((trip) => (
                <motion.div
                  key={trip.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                >
                  <TripCard trip={trip} />
                </motion.div>
              ))}
            </motion.div>

            {filteredTrips.length > visibleCount && (
              <div className="flex justify-center mt-10">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setVisibleCount(prev => prev + 8)}
                  className="gap-2"
                >
                  <ChevronDown className="w-5 h-5" />
                  {language === 'he' ? 'הצג עוד' : 'Load More'}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <Compass className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('noTripsFound')}</h3>
            <p className="text-gray-500 mb-6">{t('createFirstTrip')}</p>
            <Link to={createPageUrl('CreateTrip')}>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4 mr-2" />
                {t('createTrip')}
              </Button>
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}