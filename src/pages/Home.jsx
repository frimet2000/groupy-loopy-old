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
import { Plus, Compass, Users, MapPin, ArrowRight, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const { t, isRTL, language } = useLanguage();
  const [filters, setFilters] = useState({});
  const [visibleCount, setVisibleCount] = useState(8);

  const { data: trips = [], isLoading } = useQuery({
    queryKey: ['trips'],
    queryFn: () => base44.entities.Trip.list('-created_date'),
  });

  const filteredTrips = trips.filter(trip => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const title = language === 'he' ? trip.title_he : trip.title_en;
      const desc = language === 'he' ? trip.description_he : trip.description_en;
      if (!title?.toLowerCase().includes(searchLower) && 
          !desc?.toLowerCase().includes(searchLower) &&
          !trip.location?.toLowerCase().includes(searchLower)) {
        return false;
      }
    }
    if (filters.region && trip.region !== filters.region) return false;
    if (filters.difficulty && trip.difficulty !== filters.difficulty) return false;
    if (filters.duration_type && trip.duration_type !== filters.duration_type) return false;
    if (filters.pets_allowed && !trip.pets_allowed) return false;
    if (filters.camping_available && !trip.camping_available) return false;
    if (filters.trail_type?.length > 0) {
      if (!trip.trail_type?.some(t => filters.trail_type.includes(t))) return false;
    }
    if (filters.interests?.length > 0) {
      if (!trip.interests?.some(i => filters.interests.includes(i))) return false;
    }
    return trip.status === 'open';
  });

  const displayedTrips = filteredTrips.slice(0, visibleCount);

  const stats = [
    { icon: Compass, value: trips.length, label: language === 'he' ? 'טיולים' : 'Trips' },
    { icon: Users, value: trips.reduce((acc, t) => acc + (t.current_participants || 1), 0), label: language === 'he' ? 'משתתפים' : 'Participants' },
    { icon: MapPin, value: new Set(trips.map(t => t.region)).size, label: language === 'he' ? 'אזורים' : 'Regions' },
  ];

  return (
    <div className="pb-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900 text-white">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&q=80"
            alt="Israel landscape"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/80 via-emerald-900/60 to-emerald-900" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              {language === 'he' ? 'מצאו שותפים לטיול' : 'Find Trip Partners'}
            </h1>
            <p className="text-xl md:text-2xl text-emerald-100/90 mb-10 leading-relaxed">
              {language === 'he' 
                ? 'הצטרפו לקבוצות מאורגנות או צרו טיול משלכם והזמינו אחרים'
                : 'Join organized groups or create your own trip and invite others'}
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link to={createPageUrl('CreateTrip')}>
                <Button size="lg" className="bg-white text-emerald-900 hover:bg-emerald-50 h-14 px-8 text-lg font-semibold shadow-xl">
                  <Plus className="w-5 h-5 mr-2" />
                  {t('createTrip')}
                </Button>
              </Link>
              <Link to={createPageUrl('AIRecommendations')}>
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 h-14 px-8 text-lg">
                  {t('aiRecommendations')}
                  <ArrowRight className={`w-5 h-5 ${isRTL ? 'mr-2 rotate-180' : 'ml-2'}`} />
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-wrap gap-8 mt-16"
          >
            {stats.map((stat, index) => (
              <div key={index} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4">
                <stat.icon className="w-8 h-8 text-emerald-300" />
                <div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-emerald-200">{stat.label}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Trips Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            {t('exploreTrips')}
          </h2>
          <TripFilters filters={filters} setFilters={setFilters} />
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