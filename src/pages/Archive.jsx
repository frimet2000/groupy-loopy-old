import React, { useState, useMemo } from 'react';
import { useLanguage } from '../components/LanguageContext';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import TripCard from '../components/trips/TripCard';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Loader2, ArrowLeft, ArrowRight, History, Calendar } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { motion } from 'framer-motion';

export default function Archive() {
  const { language, t, isRTL } = useLanguage();
  const [visibleCount, setVisibleCount] = useState(12);
  const [user, setUser] = useState(null);

  React.useEffect(() => {
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

  // Fetch trips
  const { data: allTrips = [], isLoading } = useQuery({
    queryKey: ['trips-archive'],
    queryFn: () => base44.entities.Trip.list('-date'),
    staleTime: 60 * 1000 // 1 minute
  });

  const archiveTrips = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return allTrips.filter(trip => {
      // Filter for past trips
      const tripDate = new Date(trip.date);
      tripDate.setHours(0, 0, 0, 0);
      
      // Basic past check
      if (tripDate >= today) return false;
      
      // Privacy check similar to Home.js
      if (trip.privacy === 'private') {
        if (!user) return false;
        const isOrganizerOrParticipant = trip.organizer_email === user.email || 
          trip.participants?.some(p => p.email === user.email);
        return isOrganizerOrParticipant;
      }

      if (trip.privacy === 'invite_only') {
        if (!user) return false;
        const isInvitedOrParticipant = trip.invited_emails?.includes(user.email) ||
          trip.organizer_email === user.email ||
          trip.participants?.some(p => p.email === user.email);
        return isInvitedOrParticipant;
      }

      return true;
    }).sort((a, b) => new Date(b.date) - new Date(a.date)); // Newest past trip first
  }, [allTrips, user]);

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <SEO 
        title={language === 'he' ? 'ארכיון טיולים - Groupy Loopy' : 'Trip Archive - Groupy Loopy'} 
        description={language === 'he' ? 'צפה בטיולים שכבר התקיימו' : 'View past trips'} 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            <Link to={createPageUrl('Home')}>
              <Button variant="ghost" size="icon" className="rounded-full">
                {isRTL ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <History className="w-8 h-8 text-emerald-600" />
                {language === 'he' ? 'ארכיון טיולים' : 'Trip Archive'}
              </h1>
              <p className="text-gray-500 mt-1">
                {language === 'he' 
                  ? `נמצאו ${archiveTrips.length} טיולים שהתקיימו`
                  : `Found ${archiveTrips.length} past trips`}
              </p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : archiveTrips.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900">
              {language === 'he' ? 'לא נמצאו טיולים בארכיון' : 'No past trips found'}
            </h3>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {archiveTrips.slice(0, visibleCount).map((trip) => (
                <div key={trip.id} className="opacity-75 hover:opacity-100 transition-opacity">
                  <TripCard trip={trip} user={user} isArchive={true} />
                </div>
              ))}
            </div>

            {archiveTrips.length > visibleCount && (
              <div className="mt-12 text-center">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setVisibleCount(prev => prev + 12)}
                  className="min-w-[200px]"
                >
                  {language === 'he' ? 'טען עוד' : 'Load More'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}