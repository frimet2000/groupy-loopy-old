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
import { Calendar, MapPin, Users, Clock, Mountain, Droplets, TreePine, Dog, Tent, Trash2, Heart, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
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
  
  const title = trip.title || trip.title_he || trip.title_en;
  const description = trip.description || trip.description_he || trip.description_en;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (e) {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  const canDelete = user && (user.email === trip.organizer_email || user.role === 'admin');

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
              ? `שלום ${participant.name},\n\nהטיול "${title}" שתוכנן ל-${format(new Date(trip.date), 'dd/MM/yyyy')} במיקום ${trip.location} בוטל על ידי המארגן.\n\nמצטערים על אי הנוחות.\n\nבברכה,\nצוות TripMate`
              : `Hello ${participant.name},\n\nThe trip "${title}" scheduled for ${format(new Date(trip.date), 'dd/MM/yyyy')} at ${trip.location} has been cancelled by the organizer.\n\nSorry for the inconvenience.\n\nBest regards,\nTripMate Team`
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
      <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-white via-gray-50/50 to-white border border-gray-200/50 hover:border-emerald-300/50 shadow-lg relative before:absolute before:inset-0 before:bg-gradient-to-br before:from-emerald-500/5 before:to-teal-500/5 before:opacity-0 before:group-hover:opacity-100 before:transition-opacity before:duration-500">
        <Link to={createPageUrl('TripDetails') + `?id=${trip.id}`}>
          <div className="relative h-40 md:h-48 overflow-hidden">
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
            
            <div className={`absolute top-2 md:top-3 ${isRTL ? 'right-2 md:right-3' : 'left-2 md:left-3'} flex gap-1 md:gap-2`}>
              <Badge className={`${difficultyColors[trip.difficulty]} border-0 font-medium text-[10px] md:text-xs px-1.5 md:px-2 py-0.5`}>
                {t(trip.difficulty)}
              </Badge>
              {trip.status !== 'open' && (
                <Badge variant="secondary" className="bg-white/90 text-gray-700 text-[10px] md:text-xs px-1.5 md:px-2 py-0.5">
                  {t(trip.status)}
                </Badge>
              )}
            </div>

            {canDelete && (
              <div className={`absolute top-2 md:top-3 ${isRTL ? 'left-2 md:left-3' : 'right-2 md:right-3'}`}>
                <Button
                  size="icon"
                  variant="destructive"
                  className="h-7 w-7 md:h-8 md:w-8 bg-red-600 hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowDeleteDialog(true);
                  }}
                >
                  <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                </Button>
              </div>
            )}
          
            <div className={`absolute bottom-2 md:bottom-3 ${isRTL ? 'right-2 md:right-3' : 'left-2 md:left-3'} flex gap-1.5 md:gap-2`}>
              {trip.pets_allowed && (
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/90 flex items-center justify-center shadow-sm">
                  <Dog className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-600" />
                </div>
              )}
              {trip.camping_available && (
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/90 flex items-center justify-center shadow-sm">
                  <Tent className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-600" />
                </div>
              )}
            </div>
          </div>
        </Link>
        
        <Link to={createPageUrl('TripDetails') + `?id=${trip.id}`}>
          <CardContent className="p-3 md:p-5" dir={isRTL ? 'rtl' : 'ltr'}>
          <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1.5 md:mb-2 line-clamp-1 group-hover:text-emerald-700 transition-colors">
            {title}
          </h3>
          
          {description && (
            <p className="text-gray-500 text-xs md:text-sm mb-3 md:mb-4 line-clamp-2">
              {description}
            </p>
          )}
          
          <div className="space-y-1.5 md:space-y-2">
          <div className="flex items-center gap-1.5 md:gap-2 text-gray-700 text-xs md:text-sm">
            <div className="p-1 md:p-1.5 bg-emerald-100 rounded-lg">
              <MapPin className="w-3 h-3 md:w-4 md:h-4 text-emerald-600 flex-shrink-0" />
            </div>
            <span className="truncate font-medium">{trip.location}</span>
            <Badge variant="outline" className="ml-auto text-[10px] md:text-xs bg-gradient-to-r from-gray-50 to-white px-1.5 md:px-2">
              {t(trip.region)}
            </Badge>
          </div>

          <div className="flex items-center gap-2 md:gap-4 text-gray-700 text-xs md:text-sm">
            <div className="flex items-center gap-1 md:gap-2">
              <div className="p-1 md:p-1.5 bg-blue-100 rounded-lg">
                <Calendar className="w-3 h-3 md:w-4 md:h-4 text-blue-600" />
              </div>
              <span className="font-medium text-[11px] md:text-sm">{format(new Date(trip.date), 'dd/MM/yy')}</span>
            </div>
            <div className="flex items-center gap-1 md:gap-2">
              <div className="p-1 md:p-1.5 bg-purple-100 rounded-lg">
                <Clock className="w-3 h-3 md:w-4 md:h-4 text-purple-600" />
              </div>
              <span className="font-medium text-[11px] md:text-sm">{trip.duration_value} {t(trip.duration_type)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1.5 md:pt-2 border-t border-gray-100 mt-2 md:mt-3">
            <div className="flex items-center gap-2 md:gap-4 text-gray-700 text-xs md:text-sm">
              <div className="flex items-center gap-1 md:gap-2">
                <div className="p-1 md:p-1.5 bg-rose-100 rounded-lg">
                  <Users className="w-3 h-3 md:w-4 md:h-4 text-rose-600" />
                </div>
                <span className="font-medium text-[11px] md:text-sm">{trip.current_participants || 1}/{trip.max_participants || '∞'}</span>
              </div>
              <div className="flex items-center gap-0.5 md:gap-1 text-gray-500">
                <Heart className="w-3 h-3 md:w-4 md:h-4" />
                <span className="text-[10px] md:text-xs">{trip.likes?.length || 0}</span>
              </div>
              <div className="flex items-center gap-0.5 md:gap-1 text-gray-500">
                <MessageCircle className="w-3 h-3 md:w-4 md:h-4" />
                <span className="text-[10px] md:text-xs">{trip.comments?.length || 0}</span>
              </div>
            </div>
              
              {trip.trail_type && trip.trail_type.length > 0 && (
                <div className="flex gap-1">
                  {trip.trail_type.slice(0, 2).map((type) => (
                    <Badge key={type} variant="secondary" className="text-[10px] md:text-xs bg-gray-100 px-1.5 md:px-2 py-0 md:py-0.5">
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