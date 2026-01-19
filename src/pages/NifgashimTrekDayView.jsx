// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '../components/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles, Calendar, MapPin, Users, Heart, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TrekDayCard from '../components/nifgashim/TrekDayCard';
import TrekDayDetailsModal from '../components/nifgashim/TrekDayDetailsModal';

export default function NifgashimTrekDayView() {
  const { language, isRTL, t } = useLanguage();
  const [user, setUser] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);

  // Fetch user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (e) {
        base44.auth.redirectToLogin();
      }
    };
    fetchUser();
  }, []);

  // Fetch user's registration
  const { data: registrations = [], isLoading: loadingRegistrations } = useQuery({
    queryKey: ['myNifgashimRegistration', user?.email],
    queryFn: () => base44.entities.NifgashimRegistration.filter({
      customer_email: user.email
    }),
    enabled: !!user?.email
  });

  const myRegistration = registrations.find(r => r.payment_status === 'completed' || r.status === 'completed') || registrations[0];

  // Fetch trip details
  const { data: trip, isLoading: loadingTrip } = useQuery({
    queryKey: ['nifgashimTrip', myRegistration?.trip_id],
    queryFn: async () => {
      const trips = await base44.entities.Trip.filter({ id: myRegistration.trip_id });
      return trips[0] || null;
    },
    enabled: !!myRegistration?.trip_id
  });

  // Get only the days the user registered for
  const userTrekDays = React.useMemo(() => {
    if (!trip?.trek_days || !myRegistration?.selected_days) return [];
    
    const selectedDayNumbers = myRegistration.selected_days.map(d => 
      typeof d === 'object' ? d.day_number : d
    );
    
    return trip.trek_days
      .filter(day => selectedDayNumbers.includes(day.day_number))
      .sort((a, b) => {
        if (a.date && b.date) return new Date(a.date) - new Date(b.date);
        return (a.day_number || 0) - (b.day_number || 0);
      });
  }, [trip, myRegistration]);

  // Find memorials assigned to user's days
  const memorialsForDays = React.useMemo(() => {
    if (!trip?.memorials || !userTrekDays.length) return {};
    
    const memorialMap = {};
    (trip.memorials || []).forEach(memorial => {
      if (memorial.status === 'approved' && memorial.assigned_day_number) {
        memorialMap[memorial.assigned_day_number] = memorial;
      }
    });
    return memorialMap;
  }, [trip, userTrekDays]);

  if (!user || loadingRegistrations || loadingTrip) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent"
        />
      </div>
    );
  }

  if (!myRegistration) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4 ${isRTL ? 'rtl' : 'ltr'}`}>
        <div className="max-w-2xl mx-auto">
          <Alert className="border-purple-500 bg-purple-950/50 text-white">
            <AlertDescription className="text-center py-6">
              {language === 'he' ? 'עדיין לא נרשמת למסע. נא להירשם תחילה.' : 'You have not registered for the trek yet. Please register first.'}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="inline-block mb-4"
          >
            <Sparkles className="w-16 h-16 text-yellow-400" />
          </motion.div>
          
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400">
            {language === 'he' ? 'ימי הטיול שלי' : 'My Trek Days'}
          </h1>
          
          <p className="text-purple-200 text-lg sm:text-xl max-w-2xl mx-auto">
            {language === 'he' 
              ? 'מסע נפגשים בשביל ישראל - חווית טיול עתידנית ומרגשת' 
              : 'Nifgashim for Israel - A futuristic and emotional trek experience'}
          </p>

          {/* Stats Bar */}
          <div className="flex flex-wrap justify-center gap-6 mt-8">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
              <Calendar className="w-5 h-5 text-purple-400" />
              <span className="text-white font-semibold">{userTrekDays.length}</span>
              <span className="text-purple-200 text-sm">{language === 'he' ? 'ימים' : 'days'}</span>
            </div>
            
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
              <Users className="w-5 h-5 text-pink-400" />
              <span className="text-white font-semibold">{myRegistration.participants?.length || 1}</span>
              <span className="text-purple-200 text-sm">{language === 'he' ? 'משתתפים' : 'participants'}</span>
            </div>

            {Object.keys(memorialsForDays).length > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                <Heart className="w-5 h-5 text-red-400" />
                <span className="text-white font-semibold">{Object.keys(memorialsForDays).length}</span>
                <span className="text-purple-200 text-sm">{language === 'he' ? 'הנצחות' : 'memorials'}</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Trek Days Grid */}
        {userTrekDays.length === 0 ? (
          <Card className="border-purple-500 bg-purple-950/50 text-white">
            <CardContent className="py-12 text-center">
              <p className="text-purple-200">
                {language === 'he' ? 'לא נמצאו ימי טיול' : 'No trek days found'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userTrekDays.map((day, index) => (
                <TrekDayCard
                  key={day.day_number}
                  day={day}
                  memorial={memorialsForDays[day.day_number]}
                  organizers={trip?.additional_organizers || []}
                  index={index}
                  onClick={() => setSelectedDay(day)}
                  language={language}
                  isRTL={isRTL}
                />
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>

      {/* Details Modal */}
      {selectedDay && (
        <TrekDayDetailsModal
          day={selectedDay}
          memorial={memorialsForDays[selectedDay.day_number]}
          organizers={trip?.additional_organizers || []}
          tripId={trip?.id}
          onClose={() => setSelectedDay(null)}
          language={language}
          isRTL={isRTL}
        />
      )}
    </div>
  );
}