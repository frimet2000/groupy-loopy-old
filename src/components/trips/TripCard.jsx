import React, { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Calendar, MapPin, Users, Clock, Mountain, Droplets, TreePine, Dog, Tent, Trash2, Heart, MessageCircle, List } from 'lucide-react';
import AddToListButton from './AddToListButton';
import { formatDate } from '../utils/dateFormatter';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

const trailIcons = {
  water: Droplets,
  forest: TreePine,
  mountain: Mountain,
};

const difficultyColors = {
  easy: 'bg-green-100 text-green-700',
  moderate: 'bg-yellow-100 text-yellow-700',
  challenging: 'bg-orange-100 text-orange-700',
  hard: 'bg-red-100 text-red-700',
};

export default function TripCard({ trip }) {
  const { t, language, isRTL } = useLanguage();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(trip.likes?.length || 0);
  
  const title = trip.title || trip.title_he || trip.title_en;
  const description = trip.description || trip.description_he || trip.description_en;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        setIsLiked(trip.likes?.some(like => like.email === userData.email) || false);
      } catch (e) {
        setUser(null);
      }
    };
    fetchUser();
  }, [trip.likes]);

  const canDelete = user && (user.email === trip.organizer_email || user.role === 'admin');

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error(language === 'he' ? 'יש להתחבר כדי לסמן מועדפים' : 'Please login to like trips');
      return;
    }

    try {
      const currentLikes = trip.likes || [];
      const newLikes = isLiked
        ? currentLikes.filter(like => like.email !== user.email)
        : [...currentLikes, { email: user.email, timestamp: new Date().toISOString() }];

      await base44.entities.Trip.update(trip.id, { likes: newLikes });
      setIsLiked(!isLiked);
      setLikesCount(newLikes.length);
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      
      toast.success(isLiked 
        ? (language === 'he' ? 'הוסר מהמועדפים' : 'Removed from favorites')
        : (language === 'he' ? 'נוסף למועדפים' : 'Added to favorites')
      );
    } catch (error) {
      toast.error(language === 'he' ? 'שגיאה בעדכון מועדפים' : 'Error updating favorites');
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      // Send emails to all participants except the organizer
      const participants = trip.participants || [];
      const emailPromises = participants
        .filter(p => p.email !== trip.organizer_email)
        .map(participant => 
          base44.integrations.Core.SendEmail({
            to: participant.email,
            subject: language === 'he' 
              ? `הטיול "${title}" בוטל`
              : `Trip "${title}" has been cancelled`,
            body: language === 'he'
              ? `שלום ${participant.name},\n\nהטיול "${title}" שתוכנן ל-${formatDate(new Date(trip.date), 'dd/MM/yyyy', language)} במיקום ${trip.location} בוטל על ידי המארגן.\n\nמצטערים על אי הנוחות.\n\nבברכה,\nצוות TripMate`
              : `Hello ${participant.name},\n\nThe trip "${title}" scheduled for ${formatDate(new Date(trip.date), 'dd/MM/yyyy', language)} at ${trip.location} has been cancelled by the organizer.\n\nSorry for the inconvenience.\n\nBest regards,\nTripMate Team`
          })
        );

      await Promise.all(emailPromises);
      await base44.entities.Trip.delete(trip.id);
      
      toast.success(language === 'he' ? 'הטיול נמחק והמשתתפים קיבלו הודעה' : 'Trip deleted and participants notified');
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    } catch (error) {
      toast.error(language === 'he' ? 'שגיאה במחיקת הטיול' : 'Error deleting trip');
    }
    setDeleting(false);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-white via-gray-50/50 to-white border-2 border-gray-200/50 hover:border-emerald-300/50 shadow-lg relative before:absolute before:inset-0 before:bg-gradient-to-br before:from-emerald-500/5 before:to-teal-500/5 before:opacity-0 before:group-hover:opacity-100 before:transition-opacity before:duration-500 touch-manipulation active:scale-[0.98] rounded-2xl">
        <Link to={createPageUrl('TripDetails') + `?id=${trip.id}`}>
          <div className="relative h-48 sm:h-52 md:h-56 overflow-hidden rounded-t-2xl border-b-2 border-gray-100/50">
            <img
              src={trip.image_url || `https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?w=600`}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 group-hover:brightness-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/60" />
            
            {/* Animated Corner Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-teal-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl" />
            
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            
            <div className={`absolute top-3 ${isRTL ? 'right-3' : 'left-3'} flex gap-1.5`}>
              <Badge className={`${difficultyColors[trip.difficulty]} border-0 font-semibold text-xs px-2.5 py-1 shadow-sm`}>
                {t(trip.difficulty)}
              </Badge>
              {trip.status !== 'open' && (
                <Badge variant="secondary" className="bg-white/90 text-gray-700 text-xs px-2.5 py-1 font-semibold shadow-sm">
                  {t(trip.status)}
                </Badge>
              )}
            </div>

            <div className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'} flex gap-2`}>
              {user && (
                <Button
                  size="icon"
                  variant="ghost"
                  className={`h-10 w-10 rounded-full ${isLiked ? 'bg-rose-600 hover:bg-rose-700' : 'bg-white/95 hover:bg-white'} transition-all shadow-lg backdrop-blur-sm touch-manipulation min-h-[44px] min-w-[44px]`}
                  onClick={handleLike}
                >
                  <Heart className={`h-5 w-5 ${isLiked ? 'fill-white text-white' : 'text-rose-600'}`} />
                </Button>
              )}
              {canDelete && (
                <Button
                  size="icon"
                  variant="destructive"
                  className="h-10 w-10 rounded-full bg-red-600/95 hover:bg-red-700 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shadow-lg backdrop-blur-sm touch-manipulation min-h-[44px] min-w-[44px]"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowDeleteDialog(true);
                  }}
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              )}
            </div>
          
            <div className={`absolute bottom-3 ${isRTL ? 'right-3' : 'left-3'} flex gap-2`}>
              {trip.pets_allowed && (
                <div className="w-9 h-9 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <Dog className="w-5 h-5 text-amber-600" />
                </div>
              )}
              {trip.camping_available && (
                <div className="w-9 h-9 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <Tent className="w-5 h-5 text-emerald-600" />
                </div>
              )}
            </div>
          </div>
        </Link>
        
        <Link to={createPageUrl('TripDetails') + `?id=${trip.id}`}>
          <CardContent className="p-4 sm:p-5" dir={isRTL ? 'rtl' : 'ltr'}>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-700 transition-colors leading-tight">
            {title}
          </h3>
          
          {description && (
            <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed">
              {description}
            </p>
          )}
          
          <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-gray-700">
            <div className="p-1.5 bg-emerald-100 rounded-lg flex-shrink-0">
              <MapPin className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="truncate font-semibold text-sm">{trip.location}</span>
            <Badge variant="outline" className="ml-auto text-xs bg-gradient-to-r from-gray-50 to-white px-2.5 py-0.5 font-semibold flex-shrink-0">
              {t(trip.region)}
            </Badge>
          </div>

          <div className="flex items-center gap-3 text-gray-700">
          <div className="flex items-center gap-2 flex-1">
            <div className="p-1.5 bg-blue-100 rounded-lg flex-shrink-0">
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <span className="font-semibold text-sm">{formatDate(new Date(trip.date), 'dd/MM/yy', language)}</span>
          </div>
            <div className="flex items-center gap-2 flex-1">
              <div className="p-1.5 bg-purple-100 rounded-lg flex-shrink-0">
                <Clock className="w-4 h-4 text-purple-600" />
              </div>
              <span className="font-semibold text-sm truncate">{trip.duration_value} {t(trip.duration_type)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2.5 border-t border-gray-100 mt-3">
            <div className="flex items-center gap-3 text-gray-700">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-rose-100 rounded-lg">
                  <Users className="w-4 h-4 text-rose-600" />
                </div>
                <span className="font-semibold text-sm">{trip.current_participants || 1}/{trip.max_participants || '∞'}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                <Heart className="w-4 h-4" />
                <span className="text-sm font-medium">{likesCount}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm font-medium">{trip.comments?.length || 0}</span>
              </div>
            </div>
              
              {trip.trail_type && trip.trail_type.length > 0 && (
                <div className="flex gap-1 flex-wrap justify-end">
                  {trip.trail_type.slice(0, 2).map((type) => (
                    <Badge key={type} variant="secondary" className="text-xs bg-gray-100 px-2 py-0.5 font-medium">
                      {t(type)}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
        </Link>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'he' ? 'מחיקת טיול' : 'Delete Trip'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'he' 
                ? 'האם אתה בטוח שברצונך למחוק את הטיול? פעולה זו לא ניתנת לביטול.'
                : 'Are you sure you want to delete this trip? This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>
              {t('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? (language === 'he' ? 'מוחק...' : 'Deleting...') : t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}