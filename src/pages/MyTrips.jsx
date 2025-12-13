import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguage } from '../components/LanguageContext';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import TripCard from '../components/trips/TripCard';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Calendar, UserCircle, Compass, Bookmark } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MyTrips() {
  const { t, language, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (e) {
        base44.auth.redirectToLogin(createPageUrl('MyTrips'));
      }
    };
    fetchUser();
  }, []);

  const { data: allTrips = [], isLoading } = useQuery({
    queryKey: ['trips'],
    queryFn: () => base44.entities.Trip.list('-date'),
    enabled: !!user,
  });

  const organizedTrips = allTrips.filter(trip => trip.organizer_email === user?.email);
  const joinedTrips = allTrips.filter(trip => 
    trip.participants?.some(p => p.email === user?.email) && 
    trip.organizer_email !== user?.email
  );
  const savedTrips = allTrips.filter(trip =>
    trip.saves?.some(s => s.email === user?.email)
  );
  const upcomingTrips = [...organizedTrips, ...joinedTrips].filter(
    trip => new Date(trip.date) >= new Date()
  ).sort((a, b) => new Date(a.date) - new Date(b.date));

  const EmptyState = ({ icon: Icon, title, description }) => (
    <div className="text-center py-12 md:py-16 bg-white rounded-2xl border border-gray-100">
      <Icon className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-3 md:mb-4" />
      <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-1 md:mb-2 px-4">{title}</h3>
      <p className="text-sm md:text-base text-gray-500 mb-4 md:mb-6 px-4">{description}</p>
      <Link to={createPageUrl('CreateTrip')}>
        <Button className="bg-emerald-600 hover:bg-emerald-700 h-9 md:h-10 text-sm md:text-base">
          <Plus className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2" />
          {t('createTrip')}
        </Button>
      </Link>
    </div>
  );

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8 px-3 md:px-4 pb-20 md:pb-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{t('myTrips')}</h1>
            <Link to={createPageUrl('CreateTrip')}>
              <Button className="bg-emerald-600 hover:bg-emerald-700 h-9 md:h-10">
                <Plus className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1 md:mr-2" />
                <span className="text-sm md:text-base">{t('createTrip')}</span>
              </Button>
            </Link>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 md:space-y-6">
            <TabsList className="bg-white p-1 rounded-xl border shadow-sm w-full grid grid-cols-4 h-auto">
              <TabsTrigger 
                value="upcoming" 
                className="gap-1 md:gap-2 data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 flex-col md:flex-row py-2 text-xs md:text-sm"
              >
                <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span>{language === 'he' ? 'קרובים' : 'Upcoming'}</span>
                {upcomingTrips.length > 0 && (
                  <span className="bg-emerald-600 text-white text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 rounded-full sm:ml-1">
                    {upcomingTrips.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="joined" 
                className="gap-1 md:gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 flex-col md:flex-row py-2 text-xs md:text-sm"
              >
                <Compass className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span>{language === 'he' ? 'הצטרפתי' : 'Joined'}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="organized" 
                className="gap-1 md:gap-2 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 flex-col md:flex-row py-2 text-xs md:text-sm"
              >
                <UserCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span>{language === 'he' ? 'ארגנתי' : 'Organized'}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="saved" 
                className="gap-1 md:gap-2 data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700 flex-col md:flex-row py-2 text-xs md:text-sm"
              >
                <Bookmark className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span>{language === 'he' ? 'שמורים' : 'Saved'}</span>
                {savedTrips.length > 0 && (
                  <span className="bg-amber-600 text-white text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 rounded-full sm:ml-1">
                    {savedTrips.length}
                  </span>
                )}
              </TabsTrigger>
              </TabsList>

            <TabsContent value="upcoming">
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="space-y-3 md:space-y-4">
                      <Skeleton className="h-40 md:h-48 w-full rounded-xl" />
                      <Skeleton className="h-5 md:h-6 w-3/4" />
                      <Skeleton className="h-3 md:h-4 w-1/2" />
                    </div>
                  ))}
                </div>
              ) : upcomingTrips.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                  {upcomingTrips.map(trip => (
                    <TripCard key={trip.id} trip={trip} />
                  ))}
                </div>
              ) : (
                <EmptyState 
                  icon={Calendar}
                  title={t('noUpcomingTrips')}
                  description={language === 'he' ? 'אין לך טיולים מתוכננים בקרוב' : 'No upcoming trips scheduled'}
                />
              )}
            </TabsContent>

            <TabsContent value="joined">
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="space-y-3 md:space-y-4">
                      <Skeleton className="h-40 md:h-48 w-full rounded-xl" />
                      <Skeleton className="h-5 md:h-6 w-3/4" />
                      <Skeleton className="h-3 md:h-4 w-1/2" />
                    </div>
                  ))}
                </div>
              ) : joinedTrips.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                  {joinedTrips.map(trip => (
                    <TripCard key={trip.id} trip={trip} />
                  ))}
                </div>
              ) : (
                <EmptyState 
                  icon={Compass}
                  title={t('noTripsFound')}
                  description={language === 'he' ? 'עדיין לא יצרת טיול' : "You haven't created a trip yet"}
                />
              )}
            </TabsContent>

            <TabsContent value="organized">
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="space-y-3 md:space-y-4">
                      <Skeleton className="h-40 md:h-48 w-full rounded-xl" />
                      <Skeleton className="h-5 md:h-6 w-3/4" />
                      <Skeleton className="h-3 md:h-4 w-1/2" />
                    </div>
                  ))}
                </div>
              ) : organizedTrips.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                  {organizedTrips.map(trip => (
                    <TripCard key={trip.id} trip={trip} />
                  ))}
                </div>
              ) : (
                <EmptyState 
                  icon={UserCircle}
                  title={t('noOrganizedTrips')}
                  description={language === 'he' ? 'עדיין לא יצרת טיול' : "You haven't organized any trips yet"}
                />
              )}
            </TabsContent>

            <TabsContent value="saved">
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="space-y-3 md:space-y-4">
                      <Skeleton className="h-40 md:h-48 w-full rounded-xl" />
                      <Skeleton className="h-5 md:h-6 w-3/4" />
                      <Skeleton className="h-3 md:h-4 w-1/2" />
                    </div>
                  ))}
                </div>
              ) : savedTrips.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                  {savedTrips.map(trip => (
                    <TripCard key={trip.id} trip={trip} />
                  ))}
                </div>
              ) : (
                <EmptyState 
                  icon={Bookmark}
                  title={t('noSavedTrips')}
                  description={language === 'he' ? 'עדיין לא שמרת טיולים' : "You haven't saved any trips yet"}
                />
              )}
            </TabsContent>
            </Tabs>
            </motion.div>
            </div>
            </div>
            );
            }