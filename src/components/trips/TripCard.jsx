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
import { Calendar, MapPin, Users, Clock, Mountain, Droplets, TreePine, Dog, Tent, Trash2 } from 'lucide-react';
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
  
  const title = language === 'he' ? trip.title_he : trip.title_en;
  const description = language === 'he' ? trip.description_he : trip.description_en;

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
      <Card className="group overflow-hidden hover:shadow-xl transition-all duration-500 bg-white border-0 shadow-md relative">
        <Link to={createPageUrl('TripDetails') + `?id=${trip.id}`}>
          <div className="relative h-48 overflow-hidden">
            <img
              src={trip.image_url || `https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?w=600`}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            <div className={`absolute top-3 ${isRTL ? 'right-3' : 'left-3'} flex gap-2`}>
              <Badge className={`${difficultyColors[trip.difficulty]} border-0 font-medium`}>
                {t(trip.difficulty)}
              </Badge>
              {trip.status !== 'open' && (
                <Badge variant="secondary" className="bg-white/90 text-gray-700">
                  {t(trip.status)}
                </Badge>
              )}
            </div>

            {canDelete && (
              <div className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'}`}>
                <Button
                  size="icon"
                  variant="destructive"
                  className="h-8 w-8 bg-red-600 hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowDeleteDialog(true);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          
            <div className={`absolute bottom-3 ${isRTL ? 'right-3' : 'left-3'} flex gap-2`}>
              {trip.pets_allowed && (
                <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                  <Dog className="w-4 h-4 text-amber-600" />
                </div>
              )}
              {trip.camping_available && (
                <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                  <Tent className="w-4 h-4 text-emerald-600" />
                </div>
              )}
            </div>
          </div>
        </Link>
        
        <Link to={createPageUrl('TripDetails') + `?id=${trip.id}`}>
          <CardContent className="p-5">
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-emerald-700 transition-colors">
            {title}
          </h3>
          
          {description && (
            <p className="text-gray-500 text-sm mb-4 line-clamp-2">
              {description}
            </p>
          )}
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span className="truncate">{trip.location}</span>
              <Badge variant="outline" className="ml-auto text-xs">
                {t(trip.region)}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4 text-gray-600 text-sm">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span>{format(new Date(trip.date), 'dd/MM/yyyy')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-purple-500" />
                <span>{trip.duration_value} {t(trip.duration_type)}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-3">
              <div className="flex items-center gap-1.5 text-gray-600 text-sm">
                <Users className="w-4 h-4 text-rose-500" />
                <span>{trip.current_participants || 1}/{trip.max_participants || '∞'}</span>
              </div>
              
              {trip.trail_type && trip.trail_type.length > 0 && (
                <div className="flex gap-1">
                  {trip.trail_type.slice(0, 3).map((type) => (
                    <Badge key={type} variant="secondary" className="text-xs bg-gray-100">
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