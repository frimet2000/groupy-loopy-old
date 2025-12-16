import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguage } from '../components/LanguageContext';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Share2, 
  MapPin, 
  Calendar, 
  Clock, 
  Mountain, 
  Compass, 
  Users, 
  Check, 
  Dog, 
  Tent,
  ArrowRight,
  Home,
  Copy,
  Download
} from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import html2canvas from 'html2canvas';

export default function TripSummary() {
  const { t, language, isRTL } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const tripId = params.get('id');
        
        if (!tripId) {
          navigate(createPageUrl('Home'));
          return;
        }

        const tripData = await base44.entities.Trip.filter({ id: tripId });
        if (tripData && tripData.length > 0) {
          setTrip(tripData[0]);
          
          // Celebrate!
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        } else {
          navigate(createPageUrl('Home'));
        }
      } catch (error) {
        console.error('Error fetching trip:', error);
        navigate(createPageUrl('Home'));
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [location, navigate]);

  const handleShare = async () => {
    const url = `${window.location.origin}${createPageUrl('TripDetails')}?id=${trip.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: trip.title,
          text: trip.description || t('checkOutThisTrip'),
          url: url
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          handleCopyLink(url);
        }
      }
    } else {
      handleCopyLink(url);
    }
  };

  const handleCopyLink = (url) => {
    navigator.clipboard.writeText(url);
    toast.success(language === 'he' ? 'הקישור הועתק!' : 'Link copied!');
  };

  const handleDownloadImage = async () => {
    const element = document.getElementById('trip-summary-card');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2
      });
      
      const link = document.createElement('a');
      link.download = `${trip.title}.png`;
      link.href = canvas.toDataURL();
      link.click();
      
      toast.success(language === 'he' ? 'התמונה הורדה!' : 'Image downloaded!');
    } catch (error) {
      toast.error(language === 'he' ? 'שגיאה בהורדת התמונה' : 'Error downloading image');
    }
  };

  if (loading || !trip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">{language === 'he' ? 'טוען...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl"
          >
            <Check className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {language === 'he' ? '🎉 הטיול נוצר בהצלחה!' : '🎉 Trip Created Successfully!'}
          </h1>
          <p className="text-lg text-gray-600">
            {language === 'he' ? 'הטיול שלך מחכה למשתתפים!' : 'Your trip is ready for participants!'}
          </p>
        </motion.div>

        {/* Trip Summary Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          id="trip-summary-card"
        >
          <Card className="border-2 border-emerald-200 shadow-2xl overflow-hidden">
            {trip.image_url && (
              <div className="h-64 overflow-hidden">
                <img 
                  src={trip.image_url} 
                  alt={trip.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50">
              <CardTitle className="text-3xl">{trip.title}</CardTitle>
              {trip.description && (
                <p className="text-gray-700 mt-2 leading-relaxed">{trip.description}</p>
              )}
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Key Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                  <div className="flex items-center gap-2 text-emerald-700 mb-1">
                    <MapPin className="w-4 h-4" />
                    <span className="font-semibold text-sm">{t('location')}</span>
                  </div>
                  <p className="text-gray-800 font-medium">{trip.location}</p>
                  <p className="text-gray-500 text-sm">{trip.region}</p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm border">
                  <div className="flex items-center gap-2 text-emerald-700 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="font-semibold text-sm">{t('date')}</span>
                  </div>
                  <p className="text-gray-800 font-medium">
                    {new Date(trip.date).toLocaleDateString()}
                  </p>
                  {trip.meeting_time && (
                    <p className="text-gray-500 text-sm">{trip.meeting_time}</p>
                  )}
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm border">
                  <div className="flex items-center gap-2 text-emerald-700 mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="font-semibold text-sm">{t('duration')}</span>
                  </div>
                  <p className="text-gray-800 font-medium">{t(trip.duration_type)}</p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm border">
                  <div className="flex items-center gap-2 text-emerald-700 mb-1">
                    <Mountain className="w-4 h-4" />
                    <span className="font-semibold text-sm">{t('activityType')}</span>
                  </div>
                  <p className="text-gray-800 font-medium">{t(trip.activity_type)}</p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm border">
                  <div className="flex items-center gap-2 text-emerald-700 mb-1">
                    <Compass className="w-4 h-4" />
                    <span className="font-semibold text-sm">{t('difficulty')}</span>
                  </div>
                  <p className="text-gray-800 font-medium">{t(trip.difficulty)}</p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm border">
                  <div className="flex items-center gap-2 text-emerald-700 mb-1">
                    <Users className="w-4 h-4" />
                    <span className="font-semibold text-sm">{t('maxParticipants')}</span>
                  </div>
                  <p className="text-gray-800 font-medium">{trip.max_participants}</p>
                </div>
              </div>

              {/* Additional Features */}
              {(trip.pets_allowed || trip.camping_available || trip.trail_type?.length > 0) && (
                <div className="space-y-3">
                  <h3 className="font-bold text-lg text-gray-900">{language === 'he' ? 'תכונות נוספות' : 'Additional Features'}</h3>
                  
                  <div className="flex flex-wrap gap-2">
                    {trip.pets_allowed && (
                      <Badge className="gap-1 bg-green-100 text-green-800 hover:bg-green-200">
                        <Dog className="w-3 h-3" />
                        {t('petsAllowed')}
                      </Badge>
                    )}
                    {trip.camping_available && (
                      <Badge className="gap-1 bg-blue-100 text-blue-800 hover:bg-blue-200">
                        <Tent className="w-3 h-3" />
                        {t('campingAvailable')}
                      </Badge>
                    )}
                    {trip.trail_type?.map(type => (
                      <Badge key={type} variant="outline" className="border-emerald-400">
                        {t(type)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8"
        >
          <Button
            size="lg"
            onClick={handleShare}
            className="gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-lg py-6"
          >
            <Share2 className="w-5 h-5" />
            {language === 'he' ? 'שתף את הטיול' : 'Share Trip'}
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={handleDownloadImage}
            className="gap-2 text-lg py-6 border-2"
          >
            <Download className="w-5 h-5" />
            {language === 'he' ? 'הורד כתמונה' : 'Download Image'}
          </Button>

          <Button
            size="lg"
            onClick={() => navigate(createPageUrl('TripDetails') + '?id=' + trip.id)}
            className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-lg py-6"
          >
            {language === 'he' ? 'לדף הטיול' : 'View Trip'}
            <ArrowRight className="w-5 h-5" />
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate(createPageUrl('Home'))}
            className="gap-2 text-lg py-6 border-2"
          >
            <Home className="w-5 h-5" />
            {language === 'he' ? 'חזרה לעמוד הבית' : 'Back to Home'}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}