import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguage } from '../components/LanguageContext';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import WeatherWidget from '../components/weather/WeatherWidget';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import {
  Calendar, MapPin, Clock, Users, Mountain, Dog, Tent,
  Share2, ArrowLeft, ArrowRight, Check, X, User,
  Droplets, TreePine, Sun, History, Building, Navigation, Edit
} from 'lucide-react';

const difficultyColors = {
  easy: 'bg-green-100 text-green-700 border-green-200',
  moderate: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  challenging: 'bg-orange-100 text-orange-700 border-orange-200',
  hard: 'bg-red-100 text-red-700 border-red-200',
};

const trailIcons = {
  water: Droplets,
  forest: TreePine,
  desert: Sun,
  historical: History,
  urban: Building,
};

export default function TripDetails() {
  const { t, language, isRTL } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);

  const urlParams = new URLSearchParams(window.location.search);
  const tripId = urlParams.get('id');

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

  const { data: trip, isLoading, error } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: async () => {
      const trips = await base44.entities.Trip.filter({ id: tripId });
      return trips[0];
    },
    enabled: !!tripId,
  });

  const joinMutation = useMutation({
    mutationFn: async () => {
      const updatedPendingRequests = [
        ...(trip.pending_requests || []),
        {
          email: user.email,
          name: user.full_name,
          requested_at: new Date().toISOString()
        }
      ];
      await base44.entities.Trip.update(tripId, {
        pending_requests: updatedPendingRequests
      });

      // Send email to organizer
      const title = language === 'he' ? trip.title_he : trip.title_en;
      await base44.integrations.Core.SendEmail({
        to: trip.organizer_email,
        subject: language === 'he' 
          ? `בקשה להצטרפות לטיול "${title}"`
          : `Join request for trip "${title}"`,
        body: language === 'he'
          ? `שלום ${trip.organizer_name},\n\n${user.full_name} מבקש להצטרף לטיול "${title}" שלך.\n\nהיכנס לעמוד הטיול כדי לאשר או לדחות את הבקשה.\n\nבברכה,\nצוות TripMate`
          : `Hello ${trip.organizer_name},\n\n${user.full_name} has requested to join your trip "${title}".\n\nVisit the trip page to approve or reject the request.\n\nBest regards,\nTripMate Team`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['trip', tripId]);
      toast.success(language === 'he' ? 'הבקשה נשלחה למארגן' : 'Request sent to organizer');
    },
  });

  const leaveMutation = useMutation({
    mutationFn: async () => {
      const updatedParticipants = (trip.participants || []).filter(
        p => p.email !== user.email
      );
      await base44.entities.Trip.update(tripId, {
        participants: updatedParticipants,
        current_participants: updatedParticipants.length
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['trip', tripId]);
      toast.success(t('leftTrip'));
    },
  });

  const isOrganizer = user?.email === trip?.organizer_email;
  const hasJoined = trip?.participants?.some(p => p.email === user?.email);
  const hasPendingRequest = trip?.pending_requests?.some(r => r.email === user?.email);
  const isFull = trip?.current_participants >= trip?.max_participants;

  const approveMutation = useMutation({
    mutationFn: async (requestEmail) => {
      const request = trip.pending_requests.find(r => r.email === requestEmail);
      const updatedPendingRequests = trip.pending_requests.filter(r => r.email !== requestEmail);
      const updatedParticipants = [
        ...(trip.participants || []),
        {
          email: request.email,
          name: request.name,
          joined_at: new Date().toISOString()
        }
      ];
      
      await base44.entities.Trip.update(tripId, {
        pending_requests: updatedPendingRequests,
        participants: updatedParticipants,
        current_participants: updatedParticipants.length
      });

      // Send approval email
      const title = language === 'he' ? trip.title_he : trip.title_en;
      await base44.integrations.Core.SendEmail({
        to: requestEmail,
        subject: language === 'he' 
          ? `בקשתך להצטרפות לטיול "${title}" אושרה`
          : `Your request to join "${title}" was approved`,
        body: language === 'he'
          ? `שלום ${request.name},\n\nבקשתך להצטרף לטיול "${title}" אושרה על ידי המארגן.\n\nמקווים שתהנה מהטיול!\n\nבברכה,\nצוות TripMate`
          : `Hello ${request.name},\n\nYour request to join "${title}" has been approved by the organizer.\n\nHope you enjoy the trip!\n\nBest regards,\nTripMate Team`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['trip', tripId]);
      toast.success(language === 'he' ? 'הבקשה אושרה' : 'Request approved');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (requestEmail) => {
      const request = trip.pending_requests.find(r => r.email === requestEmail);
      const updatedPendingRequests = trip.pending_requests.filter(r => r.email !== requestEmail);
      
      await base44.entities.Trip.update(tripId, {
        pending_requests: updatedPendingRequests
      });

      // Send rejection email
      const title = language === 'he' ? trip.title_he : trip.title_en;
      await base44.integrations.Core.SendEmail({
        to: requestEmail,
        subject: language === 'he' 
          ? `בקשתך להצטרפות לטיול "${title}"`
          : `Your request to join "${title}"`,
        body: language === 'he'
          ? `שלום ${request.name},\n\nמצטערים, בקשתך להצטרף לטיול "${title}" נדחתה על ידי המארגן.\n\nבברכה,\nצוות TripMate`
          : `Hello ${request.name},\n\nSorry, your request to join "${title}" was declined by the organizer.\n\nBest regards,\nTripMate Team`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['trip', tripId]);
      toast.success(language === 'he' ? 'הבקשה נדחתה' : 'Request declined');
    },
  });

  const handleShare = async () => {
    try {
      await navigator.share({
        title: language === 'he' ? trip.title_he : trip.title_en,
        url: window.location.href,
      });
    } catch (e) {
      navigator.clipboard.writeText(window.location.href);
      toast.success(language === 'he' ? 'הקישור הועתק' : 'Link copied');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Skeleton className="h-80 w-full rounded-2xl mb-8" />
        <Skeleton className="h-10 w-1/2 mb-4" />
        <Skeleton className="h-6 w-3/4 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {language === 'he' ? 'הטיול לא נמצא' : 'Trip not found'}
        </h2>
        <Button onClick={() => navigate(createPageUrl('Home'))}>
          {t('home')}
        </Button>
      </div>
    );
  }

  const title = language === 'he' ? trip.title_he : trip.title_en;
  const description = language === 'he' ? trip.description_he : trip.description_en;

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Hero Image */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        <img
          src={trip.image_url || 'https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?w=1920'}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <Button 
            variant="secondary" 
            size="icon" 
            className="rounded-full bg-white/90 hover:bg-white"
            onClick={() => navigate(-1)}
          >
            {isRTL ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
          </Button>
          <div className="flex gap-2">
            {isOrganizer && (
              <Button 
                variant="secondary" 
                size="icon" 
                className="rounded-full bg-white/90 hover:bg-white"
                onClick={() => navigate(createPageUrl('EditTrip') + '?id=' + tripId)}
              >
                <Edit className="w-5 h-5" />
              </Button>
            )}
            <Button 
              variant="secondary" 
              size="icon" 
              className="rounded-full bg-white/90 hover:bg-white"
              onClick={handleShare}
            >
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge className={`${difficultyColors[trip.difficulty]} border`}>
              {t(trip.difficulty)}
            </Badge>
            <Badge variant="secondary" className="bg-white/90">
              {t(trip.region)}
            </Badge>
            {trip.pets_allowed && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                <Dog className="w-3 h-3 mr-1" /> {t('petsAllowed')}
              </Badge>
            )}
            {trip.camping_available && (
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                <Tent className="w-3 h-3 mr-1" /> {t('campingAvailable')}
              </Badge>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">{title}</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Action Card */}
          <Card className="mb-6 shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-6 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">{format(new Date(trip.date), 'EEEE, MMMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-600" />
                    <span>{trip.duration_value} {t(trip.duration_type)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-rose-600" />
                    <span>{trip.current_participants || 1}/{trip.max_participants}</span>
                  </div>
                </div>

                {user && !isOrganizer && (
                  hasJoined ? (
                    <Button 
                      variant="outline" 
                      onClick={() => leaveMutation.mutate()}
                      disabled={leaveMutation.isLoading}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <X className="w-4 h-4 mr-2" />
                      {t('leave')}
                    </Button>
                  ) : hasPendingRequest ? (
                    <Badge variant="outline" className="border-yellow-300 text-yellow-700 bg-yellow-50">
                      {language === 'he' ? 'הבקשה ממתינה לאישור' : 'Request pending approval'}
                    </Badge>
                  ) : (
                    <Button 
                      onClick={() => joinMutation.mutate()}
                      disabled={joinMutation.isLoading || isFull}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      {isFull ? t('tripFull') : (language === 'he' ? 'בקש להצטרף' : 'Request to Join')}
                    </Button>
                  )
                )}
                
                {!user && (
                  <Button 
                    onClick={() => base44.auth.redirectToLogin(window.location.href)}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    {language === 'he' ? 'התחבר להצטרפות' : 'Login to Join'}
                  </Button>
                )}

                {isOrganizer && (
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                    {language === 'he' ? 'אתה המארגן' : "You're the organizer"}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              {description && (
                <Card>
                  <CardContent className="p-6">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{description}</p>
                  </CardContent>
                </Card>
              )}

              {/* Details */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('tripDetails')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-emerald-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium">{t('location')}</p>
                      <p className="text-gray-600 mb-2">{trip.location}</p>
                      {trip.latitude && trip.longitude && (
                        <div className="flex flex-wrap gap-2">
                          <a
                            href={`https://waze.com/ul?ll=${trip.latitude},${trip.longitude}&navigate=yes`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button size="sm" variant="outline" className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50">
                              <Navigation className="w-4 h-4" />
                              {language === 'he' ? 'נווט ב-Waze' : 'Navigate with Waze'}
                            </Button>
                          </a>
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${trip.latitude},${trip.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button size="sm" variant="outline" className="gap-2 text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                              <MapPin className="w-4 h-4" />
                              {language === 'he' ? 'נווט ב-Google Maps' : 'Navigate with Google Maps'}
                            </Button>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {trip.trail_type && trip.trail_type.length > 0 && (
                    <div>
                      <p className="font-medium mb-2">{t('trailType')}</p>
                      <div className="flex flex-wrap gap-2">
                        {trip.trail_type.map(type => {
                          const Icon = trailIcons[type] || Mountain;
                          return (
                            <Badge key={type} variant="outline" className="gap-1">
                              <Icon className="w-3 h-3" />
                              {t(type)}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {trip.interests && trip.interests.length > 0 && (
                    <div>
                      <p className="font-medium mb-2">{t('interests')}</p>
                      <div className="flex flex-wrap gap-2">
                        {trip.interests.map(interest => (
                          <Badge key={interest} variant="secondary">
                            {t(interest)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <Separator />

                  {(trip.parent_age_ranges?.length > 0 || trip.children_age_ranges?.length > 0) && (
                    <div className="space-y-4">
                      {trip.parent_age_ranges?.length > 0 && (
                        <div>
                          <p className="text-gray-500 mb-2">{language === 'he' ? 'טווחי גילאי הורים' : 'Parent Age Ranges'}</p>
                          <div className="flex flex-wrap gap-2">
                            {trip.parent_age_ranges.map(range => (
                              <Badge key={range} variant="outline" className="border-purple-300 text-purple-700">
                                {range}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {trip.children_age_ranges?.length > 0 && (
                        <div>
                          <p className="text-gray-500 mb-2">{language === 'he' ? 'טווחי גילאי ילדים' : 'Children Age Ranges'}</p>
                          <div className="flex flex-wrap gap-2">
                            {trip.children_age_ranges.map(range => (
                              <Badge key={range} variant="outline" className="border-pink-300 text-pink-700">
                                {range}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Pending Requests (Organizer Only) */}
              {isOrganizer && trip.pending_requests && trip.pending_requests.length > 0 && (
                <Card className="border-yellow-200 bg-yellow-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-yellow-800">
                      <Clock className="w-5 h-5" />
                      {language === 'he' ? 'בקשות להצטרפות' : 'Join Requests'} ({trip.pending_requests.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {trip.pending_requests.map((request, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg">
                          <Avatar>
                            <AvatarFallback className="bg-yellow-200">
                              {request.name?.charAt(0) || 'P'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium">{request.name}</p>
                            <p className="text-sm text-gray-500">
                              {format(new Date(request.requested_at), 'MMM d, HH:mm')}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => approveMutation.mutate(request.email)}
                              disabled={approveMutation.isLoading || rejectMutation.isLoading}
                              className="bg-emerald-600 hover:bg-emerald-700"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => rejectMutation.mutate(request.email)}
                              disabled={approveMutation.isLoading || rejectMutation.isLoading}
                              className="text-red-600 border-red-200 hover:bg-red-50"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Participants */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-600" />
                    {t('participants')} ({trip.current_participants || 1})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Organizer */}
                    <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                      <Avatar>
                        <AvatarFallback className="bg-emerald-600 text-white">
                          {trip.organizer_name?.charAt(0) || 'O'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{trip.organizer_name}</p>
                        <p className="text-sm text-emerald-600">{t('organizer')}</p>
                      </div>
                    </div>

                    {/* Other participants */}
                    {trip.participants?.filter(p => p.email !== trip.organizer_email).map((participant, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Avatar>
                          <AvatarFallback className="bg-gray-200">
                            {participant.name?.charAt(0) || 'P'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{participant.name}</p>
                          <p className="text-sm text-gray-500">
                            {format(new Date(participant.joined_at), 'MMM d')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <WeatherWidget location={trip.location} date={trip.date} />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}