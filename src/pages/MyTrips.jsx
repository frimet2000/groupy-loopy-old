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
import { Plus, Calendar, UserCircle, Compass, Bookmark, History } from 'lucide-react';
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

  // Optimized: fetch all trips once and filter client-side with aggressive caching
  const { data: allTrips = [], isLoading } = useQuery({
    queryKey: ['all-trips-cached'],
    queryFn: () => base44.entities.Trip.list('-date', 200),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes - very aggressive
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  // Memoize filtered trips to avoid recalculation on every render
  const { organizedTrips, joinedTrips, savedTrips, upcomingTrips, pastTrips } = React.useMemo(() => {
    if (!user || !allTrips.length) {
      return { organizedTrips: [], joinedTrips: [], savedTrips: [], upcomingTrips: [], pastTrips: [] };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const organized = allTrips.filter(trip => trip.organizer_email === user.email);
    const joined = allTrips.filter(trip => 
      trip.participants?.some(p => p.email === user.email) && 
      trip.organizer_email !== user.email
    );
    const saved = allTrips.filter(trip =>
      trip.saves?.some(s => s.email === user.email)
    );

    const myTrips = [...organized, ...joined];
    const uniqueMyTrips = myTrips.filter((trip, index, self) => 
      index === self.findIndex(t => t.id === trip.id)
    );

    const upcoming = uniqueMyTrips.filter(trip => new Date(trip.date) >= today)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    const past = uniqueMyTrips.filter(trip => new Date(trip.date) < today)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    return { organizedTrips: organized, joinedTrips: joined, savedTrips: saved, upcomingTrips: upcoming, pastTrips: past };
  }, [allTrips, user]);

  const EmptyState = ({ icon: Icon, title, description }) => (
    <div className="text-center py-16 sm:py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
      <Icon className="w-16 h-16 sm:w-20 sm:h-20 text-gray-300 mx-auto mb-4" />
      <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2 px-4">{title}</h3>
      <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8 px-4 leading-relaxed">{description}</p>
      <Link to={createPageUrl('CreateTrip')}>
        <Button className="bg-emerald-600 hover:bg-emerald-700 h-12 px-8 text-base font-semibold touch-manipulation min-h-[44px]">
          <Plus className="w-5 h-5 mr-2" />
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
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 pb-24 sm:pb-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('myTrips')}</h1>
            <Link to={createPageUrl('CreateTrip')}>
              <Button className="bg-emerald-600 hover:bg-emerald-700 h-11 px-4 sm:px-6 touch-manipulation min-h-[44px]">
                <Plus className="w-5 h-5 mr-2" />
                <span className="font-semibold">{t('createTrip')}</span>
              </Button>
            </Link>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-white p-1.5 rounded-xl border-2 border-gray-200 shadow-xl w-full grid grid-cols-5 h-auto touch-manipulation" dir="rtl">
              <TabsTrigger 
                value="upcoming" 
                className="gap-1.5 data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:border-2 data-[state=active]:border-emerald-700 flex-col py-3 text-xs sm:text-sm min-h-[56px] touch-manipulation rounded-lg font-bold transition-all"
              >
                <Calendar className="w-5 h-5" />
                <span className="font-medium">{language === 'he' ? 'קרובים' : language === 'ru' ? 'Скоро' : language === 'es' ? 'Próximos' : language === 'fr' ? 'À venir' : language === 'de' ? 'Bald' : language === 'it' ? 'Imminenti' : 'Upcoming'}</span>
                {upcomingTrips.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-lg">
                    {upcomingTrips.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="joined" 
                className="gap-1.5 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 flex-col py-3 text-xs sm:text-sm min-h-[56px] touch-manipulation"
              >
                <Compass className="w-5 h-5" />
                <span className="font-medium">{language === 'he' ? 'הצטרפתי' : language === 'ru' ? 'Мои' : language === 'es' ? 'Unido' : language === 'fr' ? 'Rejoint' : language === 'de' ? 'Dabei' : language === 'it' ? 'Unito' : 'Joined'}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="organized" 
                className="gap-1.5 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 flex-col py-3 text-xs sm:text-sm min-h-[56px] touch-manipulation"
              >
                <UserCircle className="w-5 h-5" />
                <span className="font-medium">{language === 'he' ? 'ארגנתי' : language === 'ru' ? 'Мои' : language === 'es' ? 'Míos' : language === 'fr' ? 'Mes' : language === 'de' ? 'Meine' : language === 'it' ? 'Miei' : 'My'}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="saved" 
                className="gap-1.5 data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700 flex-col py-3 text-xs sm:text-sm min-h-[56px] touch-manipulation relative"
              >
                <Bookmark className="w-5 h-5" />
                <span className="font-medium">{language === 'he' ? 'שמורים' : language === 'ru' ? 'Избранное' : language === 'es' ? 'Guardados' : language === 'fr' ? 'Sauvegardés' : language === 'de' ? 'Gespeichert' : language === 'it' ? 'Salvati' : 'Saved'}</span>
                {savedTrips.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-lg">
                    {savedTrips.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="past" 
                className="gap-1.5 data-[state=active]:bg-gray-50 data-[state=active]:text-gray-700 flex-col py-3 text-xs sm:text-sm min-h-[56px] touch-manipulation relative"
              >
                <History className="w-5 h-5" />
                <span className="font-medium">{language === 'he' ? 'שהיו' : language === 'ru' ? 'Прошедшие' : language === 'es' ? 'Pasados' : language === 'fr' ? 'Passés' : language === 'de' ? 'Vergangene' : language === 'it' ? 'Passati' : 'Past'}</span>
                {pastTrips.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gray-600 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-lg">
                    {pastTrips.length}
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
                  description={language === 'he' ? 'אין לך טיולים מתוכננים בקרוב' : language === 'ru' ? 'Нет запланированных поездок' : language === 'es' ? 'No hay viajes próximos programados' : language === 'fr' ? 'Aucun voyage prévu à venir' : language === 'de' ? 'Keine anstehenden Reisen geplant' : language === 'it' ? 'Nessun viaggio imminente programmato' : 'No upcoming trips scheduled'}
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
                  description={language === 'he' ? 'עדיין לא יצרת טיול' : language === 'ru' ? 'Вы еще не создали поездку' : language === 'es' ? 'Aún no has creado un viaje' : language === 'fr' ? "Vous n'avez pas encore créé de voyage" : language === 'de' ? 'Sie haben noch keine Reise erstellt' : language === 'it' ? 'Non hai ancora creato un viaggio' : "You haven't created a trip yet"}
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
                  description={language === 'he' ? 'עדיין לא יצרת טיול' : language === 'ru' ? 'Вы еще не организовали поездки' : language === 'es' ? 'Aún no has organizado ningún viaje' : language === 'fr' ? "Vous n'avez pas encore organisé de voyages" : language === 'de' ? 'Sie haben noch keine Reisen organisiert' : language === 'it' ? 'Non hai ancora organizzato nessun viaggio' : "You haven't organized any trips yet"}
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
                  description={language === 'he' ? 'עדיין לא שמרת טיולים' : language === 'ru' ? 'Вы еще не сохранили поездки' : language === 'es' ? 'Aún no has guardado ningún viaje' : language === 'fr' ? "Vous n'avez pas encore sauvegardé de voyages" : language === 'de' ? 'Sie haben noch keine Reisen gespeichert' : language === 'it' ? 'Non hai ancora salvato nessun viaggio' : "You haven't saved any trips yet"}
                />
              )}
            </TabsContent>

            <TabsContent value="past">
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
              ) : pastTrips.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                  {pastTrips.map(trip => (
                    <TripCard key={trip.id} trip={trip} />
                  ))}
                </div>
              ) : (
                <EmptyState 
                  icon={History}
                  title={language === 'he' ? 'אין טיולים שעברו' : language === 'ru' ? 'Нет прошедших поездок' : language === 'es' ? 'No hay viajes pasados' : language === 'fr' ? 'Aucun voyage passé' : language === 'de' ? 'Keine vergangenen Reisen' : language === 'it' ? 'Nessun viaggio passato' : 'No past trips'}
                  description={language === 'he' ? 'טיולים שעברו יופיעו כאן' : language === 'ru' ? 'Прошедшие поездки появятся здесь' : language === 'es' ? 'Los viajes pasados aparecerán aquí' : language === 'fr' ? 'Les voyages passés apparaîtront ici' : language === 'de' ? 'Vergangene Reisen erscheinen hier' : language === 'it' ? 'I viaggi passati appariranno qui' : 'Past trips will appear here'}
                />
              )}
            </TabsContent>
            </Tabs>
            </motion.div>
            </div>
            </div>
            );
            }