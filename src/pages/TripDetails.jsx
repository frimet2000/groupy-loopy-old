import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguage } from '../components/LanguageContext';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import WeatherWidget from '../components/weather/WeatherWidget';
import TripChat from '../components/chat/TripChat';
import MapSidebar from '../components/maps/MapSidebar';
import TripGallery from '../components/gallery/TripGallery';
import TripExperiences from '../components/experiences/TripExperiences';
import LiveLocationMap from '../components/location/LiveLocationMap';
import TripEquipment from '../components/equipment/TripEquipment';
import DailyItinerary from '../components/planning/DailyItinerary';
import BudgetPlanner from '../components/planning/BudgetPlanner';
import ShareDialog from '../components/sharing/ShareDialog';
import TripComments from '../components/social/TripComments';
import ParticipantWaiver from '../components/legal/ParticipantWaiver';
import TripReminders from '../components/reminders/TripReminders';
import TripContributions from '../components/contributions/TripContributions';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { getAllCountries } from '../components/utils/CountryRegions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { formatDate } from '../components/utils/dateFormatter';
import { motion } from 'framer-motion';
import {
  Calendar, MapPin, Clock, Users, Mountain, Dog, Tent,
  Share2, ArrowLeft, ArrowRight, Check, X, User,
  Droplets, TreePine, Sun, History, Building, Navigation, Edit, MessageCircle, Bike, Truck,
  Info, GalleryHorizontal, Heart, MessageSquare, Radio, Backpack, Bookmark, DollarSign, Image, Loader2, Camera, Upload, Bell, Package
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

const difficulties = ['easy', 'moderate', 'challenging', 'hard', 'extreme'];
const durations = ['hours', 'half_day', 'full_day', 'overnight', 'multi_day'];
const activityTypes = ['hiking', 'cycling', 'offroad'];
const cyclingTypes = ['road', 'mountain', 'gravel', 'hybrid', 'bmx', 'electric'];
const offroadVehicleTypes = ['jeep', 'atv', 'dirt_bike', 'side_by_side', 'buggy', 'truck'];
const offroadTerrainTypes = ['sand', 'rocks', 'mud', 'hills', 'desert', 'forest_trails', 'river_crossing'];
const trailTypes = ['water', 'full_shade', 'partial_shade', 'desert', 'forest', 'coastal', 'mountain', 'historical', 'urban'];
const accessibilityTypes = ['wheelchair', 'visual_impairment', 'hearing_impairment', 'mobility_aid', 'stroller_friendly', 'elderly_friendly'];

export default function TripDetails() {
  const { t, language, isRTL } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [joinMessage, setJoinMessage] = useState('');
  const [accessibilityNeeds, setAccessibilityNeeds] = useState([]);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [currentRequestIndex, setCurrentRequestIndex] = useState(0);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showWaiver, setShowWaiver] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [addingToCalendar, setAddingToCalendar] = useState(false);
  const [showNavigationDialog, setShowNavigationDialog] = useState(false);
  
  const accessibilityTypes = ['wheelchair', 'visual_impairment', 'hearing_impairment', 'mobility_aid', 'stroller_friendly', 'elderly_friendly'];

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
    refetchInterval: 5000, // Refresh every 5 seconds for all users viewing trip details
  });

  // Fetch user profiles for all participants to show updated names
  const { data: userProfiles = {} } = useQuery({
    queryKey: ['userProfiles', trip?.participants?.map(p => p.email).join(',')],
    queryFn: async () => {
      if (!trip?.participants) return {};
      const users = await base44.entities.User.list();
      const profileMap = {};
      trip.participants.forEach(participant => {
        const userProfile = users.find(u => u.email === participant.email);
        if (userProfile) {
          profileMap[participant.email] = (userProfile.first_name && userProfile.last_name)
            ? `${userProfile.first_name} ${userProfile.last_name}`
            : userProfile.full_name;
        }
      });
      return profileMap;
    },
    enabled: !!trip?.participants?.length,
  });

  const isOrganizer = user?.email === trip?.organizer_email;
  const hasJoined = trip?.participants?.some(p => p.email === user?.email);
  const hasPendingRequest = trip?.pending_requests?.some(r => r.email === user?.email);
  const isFull = trip?.current_participants >= trip?.max_participants;

  // Track view
  useEffect(() => {
    const trackView = async () => {
      if (!trip || !user) return;
      
      const hasViewed = trip.views?.some(v => v.email === user.email);
      if (!hasViewed) {
        const updatedViews = [
          ...(trip.views || []),
          { email: user.email, timestamp: new Date().toISOString() }
        ];
        await base44.entities.Trip.update(trip.id, { views: updatedViews });
      }
    };
    
    trackView();
  }, [trip?.id, user?.email]);

  // Show pending requests dialog for organizer
  useEffect(() => {
    if (trip && isOrganizer && trip.pending_requests?.length > 0 && !showRequestDialog) {
      setShowRequestDialog(true);
      setCurrentRequestIndex(0);
    }
  }, [trip, isOrganizer]);

  const handleJoinClick = () => {
    setShowWaiver(true);
  };

  const handleWaiverAccept = async () => {
    setShowWaiver(false);
    joinMutation.mutate();
  };

  const handleWaiverDecline = () => {
    setShowWaiver(false);
    setJoinMessage('');
    setAccessibilityNeeds([]);
    setShowJoinDialog(false);
  };

  const joinMutation = useMutation({
    mutationFn: async () => {
      const userName = (user.first_name && user.last_name) 
        ? `${user.first_name} ${user.last_name}` 
        : user.full_name;
      const updatedPendingRequests = [
        ...(trip.pending_requests || []),
        {
          email: user.email,
          name: userName,
          requested_at: new Date().toISOString(),
          message: joinMessage,
          accessibility_needs: accessibilityNeeds,
          waiver_accepted: true,
          waiver_timestamp: new Date().toISOString()
        }
      ];
      await base44.entities.Trip.update(tripId, {
        pending_requests: updatedPendingRequests
      });

      // Send email to organizer
      const title = trip.title || trip.title_he || trip.title_en;
      const fullUserName = (user.first_name && user.last_name) 
        ? `${user.first_name} ${user.last_name}` 
        : user.full_name;
      const emailBody = language === 'he'
        ? `שלום ${trip.organizer_name},\n\n${fullUserName} מבקש להצטרף לטיול "${title}" שלך.${joinMessage ? `\n\nהודעה מהמשתתף:\n"${joinMessage}"` : ''}\n\nהיכנס לעמוד הטיול כדי לאשר או לדחות את הבקשה.\n\nבברכה,\nצוות TripMate`
        : `Hello ${trip.organizer_name},\n\n${fullUserName} has requested to join your trip "${title}".${joinMessage ? `\n\nMessage from participant:\n"${joinMessage}"` : ''}\n\nVisit the trip page to approve or reject the request.\n\nBest regards,\nTripMate Team`;
      
      await base44.integrations.Core.SendEmail({
        to: trip.organizer_email,
        subject: language === 'he' 
          ? `בקשה להצטרפות לטיול "${title}"`
          : `Join request for trip "${title}"`,
        body: emailBody
      });
      
      // Send push notification to organizer
      try {
        await base44.functions.invoke('sendPushNotification', {
          recipient_email: trip.organizer_email,
          notification_type: 'join_requests',
          title: language === 'he' ? 'בקשה להצטרפות חדשה' : 'New Join Request',
          body: language === 'he'
            ? `${fullUserName} מבקש להצטרף לטיול "${title}"`
            : `${fullUserName} requested to join "${title}"`
        });
      } catch (error) {
        console.log('Notification error:', error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['trip', tripId]);
      setJoinMessage('');
      setAccessibilityNeeds([]);
      setShowJoinDialog(false);
      toast.success(language === 'he' ? 'הבקשה נשלחה למארגן' : language === 'ru' ? 'Запрос отправлен организатору' : language === 'es' ? 'Solicitud enviada al organizador' : language === 'fr' ? 'Demande envoyée à l\'organisateur' : language === 'de' ? 'Anfrage an Organisator gesendet' : language === 'it' ? 'Richiesta inviata all\'organizzatore' : 'Request sent to organizer');
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

  const approveMutation = useMutation({
    mutationFn: async (requestEmail) => {
      const request = trip.pending_requests.find(r => r.email === requestEmail);
      const updatedPendingRequests = trip.pending_requests.filter(r => r.email !== requestEmail);
      const updatedParticipants = [
        ...(trip.participants || []),
        {
          email: request.email,
          name: request.name,
          joined_at: new Date().toISOString(),
          accessibility_needs: request.accessibility_needs || [],
          waiver_accepted: request.waiver_accepted || false,
          waiver_timestamp: request.waiver_timestamp || new Date().toISOString()
        }
      ];
      
      await base44.entities.Trip.update(tripId, {
        pending_requests: updatedPendingRequests,
        participants: updatedParticipants,
        current_participants: updatedParticipants.length
      });

      // Send approval email and notification
      const title = trip.title || trip.title_he || trip.title_en;
      await base44.integrations.Core.SendEmail({
        to: requestEmail,
        subject: language === 'he' 
          ? `בקשתך להצטרפות לטיול "${title}" אושרה`
          : `Your request to join "${title}" was approved`,
        body: language === 'he'
          ? `שלום ${request.name},\n\nבקשתך להצטרף לטיול "${title}" אושרה על ידי המארגן.\n\nמקווים שתהנה מהטיול!\n\nבברכה,\nצוות TripMate`
          : `Hello ${request.name},\n\nYour request to join "${title}" has been approved by the organizer.\n\nHope you enjoy the trip!\n\nBest regards,\nTripMate Team`
      });
      
      // Send push notification
      try {
        await base44.functions.invoke('sendPushNotification', {
          recipient_email: requestEmail,
          notification_type: 'trip_updates',
          title: language === 'he' ? 'בקשתך אושרה!' : 'Your request approved!',
          body: language === 'he' 
            ? `בקשתך להצטרף לטיול "${title}" אושרה`
            : `Your request to join "${title}" was approved`
        });
      } catch (error) {
        console.log('Notification error:', error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['trip', tripId]);
      toast.success(language === 'he' ? 'הבקשה אושרה' : language === 'ru' ? 'Запрос одобрен' : language === 'es' ? 'Solicitud aprobada' : language === 'fr' ? 'Demande approuvée' : language === 'de' ? 'Anfrage genehmigt' : language === 'it' ? 'Richiesta approvata' : 'Request approved');
      
      // Show next request if exists
      if (currentRequestIndex < trip.pending_requests.length - 1) {
        setCurrentRequestIndex(prev => prev + 1);
      } else {
        setShowRequestDialog(false);
      }
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
      const title = trip.title || trip.title_he || trip.title_en;
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
      toast.success(language === 'he' ? 'הבקשה נדחתה' : language === 'ru' ? 'Запрос отклонен' : language === 'es' ? 'Solicitud rechazada' : language === 'fr' ? 'Demande rejetée' : language === 'de' ? 'Anfrage abgelehnt' : language === 'it' ? 'Richiesta rifiutata' : 'Request declined');
      
      // Show next request if exists
      if (currentRequestIndex < trip.pending_requests.length - 1) {
        setCurrentRequestIndex(prev => prev + 1);
      } else {
        setShowRequestDialog(false);
      }
    },
  });

  const handleShare = async () => {
    setShowShareDialog(true);
  };

  const handleSaveTrip = async () => {
    if (!user) {
      base44.auth.redirectToLogin(window.location.href);
      return;
    }

    const hasSaved = trip.saves?.some(s => s.email === user.email);
    
    if (hasSaved) {
      const updatedSaves = trip.saves.filter(s => s.email !== user.email);
      await base44.entities.Trip.update(trip.id, { saves: updatedSaves });
      toast.success(language === 'he' ? 'הוסר מהשמורים' : language === 'ru' ? 'Удалено из сохраненных' : language === 'es' ? 'Eliminado de guardados' : language === 'fr' ? 'Retiré des enregistrés' : language === 'de' ? 'Von Gespeicherten entfernt' : language === 'it' ? 'Rimosso dai salvati' : 'Removed from saved');
    } else {
      const updatedSaves = [
        ...(trip.saves || []),
        { email: user.email, timestamp: new Date().toISOString() }
      ];
      await base44.entities.Trip.update(trip.id, { saves: updatedSaves });
      toast.success(language === 'he' ? 'נשמר בהצלחה' : language === 'ru' ? 'Успешно сохранено' : language === 'es' ? 'Guardado exitosamente' : language === 'fr' ? 'Enregistré avec succès' : language === 'de' ? 'Erfolgreich gespeichert' : language === 'it' ? 'Salvato con successo' : 'Saved successfully');
    }
    
    queryClient.invalidateQueries(['trip', tripId]);
  };

  const handleAddToCalendar = () => {
    // Create Google Calendar event URL - no authentication needed!
    const title = trip.title || trip.title_he || trip.title_en || 'Trip';
    const description = trip.description || trip.description_he || trip.description_en || '';
    const location = trip.location || '';
    
    // Calculate end time based on duration
    let endDate = new Date(trip.date);
    if (trip.duration_type === 'hours' && trip.duration_value) {
      endDate.setHours(endDate.getHours() + trip.duration_value);
    } else if (trip.duration_type === 'half_day') {
      endDate.setHours(endDate.getHours() + 4);
    } else if (trip.duration_type === 'full_day') {
      endDate.setDate(endDate.getDate() + 1);
    } else if (trip.duration_type === 'overnight') {
      endDate.setDate(endDate.getDate() + 1);
    } else if (trip.duration_type === 'multi_day' && trip.duration_value) {
      endDate.setDate(endDate.getDate() + trip.duration_value);
    } else {
      endDate.setHours(endDate.getHours() + 2);
    }

    // Format dates for Google Calendar (YYYYMMDDTHHMMSSZ)
    const formatGoogleDate = (date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const startDate = new Date(trip.date);
    if (trip.meeting_time) {
      const [hours, minutes] = trip.meeting_time.split(':');
      startDate.setHours(parseInt(hours), parseInt(minutes));
    } else {
      startDate.setHours(9, 0); // Default to 9 AM
    }

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}&dates=${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`;

    // Open Google Calendar in new tab
    window.open(googleCalendarUrl, '_blank');
    
    toast.success(
      language === 'he' ? 'נפתח יומן Google' : 
      language === 'ru' ? 'Открытие Google Calendar' : 
      language === 'es' ? 'Abriendo Google Calendar' :
      language === 'fr' ? 'Ouverture de Google Agenda' :
      language === 'de' ? 'Google Kalender wird geöffnet' :
      language === 'it' ? 'Apertura di Google Calendar' :
      'Opening Google Calendar'
    );
  };

  const handleStartEdit = () => {
    setEditData({
      title: trip.title || trip.title_he || '',
      description: trip.description || trip.description_he || '',
      max_participants: trip.max_participants || 10,
      date: trip.date,
      meeting_time: trip.meeting_time || '',
      location: trip.location,
      country: trip.country || 'israel',
      region: trip.region || '',
      sub_region: trip.sub_region || '',
      difficulty: trip.difficulty,
      duration_type: trip.duration_type,
      duration_value: trip.duration_value,
      activity_type: trip.activity_type || 'hiking',
      cycling_type: trip.cycling_type || '',
      cycling_distance: trip.cycling_distance || null,
      cycling_elevation: trip.cycling_elevation || null,
      offroad_vehicle_type: trip.offroad_vehicle_type || '',
      offroad_distance: trip.offroad_distance || null,
      offroad_terrain_type: trip.offroad_terrain_type || [],
      trail_type: trip.trail_type || [],
      interests: trip.interests || [],
      accessibility_types: trip.accessibility_types || [],
      pets_allowed: trip.pets_allowed || false,
      camping_available: trip.camping_available || false,
      has_guide: trip.has_guide || false,
      guide_name: trip.guide_name || '',
      guide_topic: trip.guide_topic || '',
      parent_age_ranges: trip.parent_age_ranges || [],
      children_age_ranges: trip.children_age_ranges || [],
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({});
  };

  const handleSaveEdit = async () => {
    try {
      if (!editData.title || editData.title.trim() === '') {
        toast.error(language === 'he' ? 'חובה למלא כותרת' : language === 'ru' ? 'Необходимо название' : language === 'es' ? 'Se requiere título' : language === 'fr' ? 'Le titre est requis' : language === 'de' ? 'Titel erforderlich' : language === 'it' ? 'Titolo richiesto' : 'Title is required');
        return;
      }
      await base44.entities.Trip.update(tripId, editData);
      queryClient.invalidateQueries(['trip', tripId]);
      setIsEditing(false);
      toast.success(language === 'he' ? 'הטיול עודכן בהצלחה' : language === 'ru' ? 'Поездка успешно обновлена' : language === 'es' ? 'Viaje actualizado exitosamente' : language === 'fr' ? 'Voyage mis à jour avec succès' : language === 'de' ? 'Reise erfolgreich aktualisiert' : language === 'it' ? 'Viaggio aggiornato con successo' : 'Trip updated successfully');
    } catch (error) {
      toast.error(language === 'he' ? 'שגיאה בעדכון' : language === 'ru' ? 'Ошибка обновления' : language === 'es' ? 'Error al actualizar' : language === 'fr' ? 'Erreur de mise à jour' : language === 'de' ? 'Fehler beim Aktualisieren' : language === 'it' ? 'Errore nell\'aggiornare' : 'Error updating');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.Trip.update(tripId, { image_url: file_url });
      await queryClient.invalidateQueries(['trip', tripId]);
      await queryClient.refetchQueries(['trip', tripId]);
      toast.success(language === 'he' ? 'התמונה הוחלפה בהצלחה' : language === 'ru' ? 'Изображение успешно обновлено' : language === 'es' ? 'Imagen actualizada exitosamente' : language === 'fr' ? 'Image mise à jour avec succès' : language === 'de' ? 'Bild erfolgreich aktualisiert' : language === 'it' ? 'Immagine aggiornata con successo' : 'Image updated successfully');
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error(language === 'he' ? 'שגיאה בהעלאת התמונה' : language === 'ru' ? 'Ошибка загрузки изображения' : language === 'es' ? 'Error al subir imagen' : language === 'fr' ? 'Erreur de téléchargement d\'image' : language === 'de' ? 'Fehler beim Hochladen des Bildes' : language === 'it' ? 'Errore nel caricamento dell\'immagine' : 'Error uploading image');
    }
    setUploadingImage(false);
    // Reset file input
    e.target.value = '';
  };

  const handleSendChatMessage = async ({ content, type, recipient_email }) => {
    setSendingMessage(true);
    try {
      const userName = (user.first_name && user.last_name) 
        ? `${user.first_name} ${user.last_name}` 
        : user.full_name;
      const newMessage = {
        id: Date.now().toString(),
        sender_email: user.email,
        sender_name: userName,
        content,
        timestamp: new Date().toISOString(),
        type,
        recipient_email: recipient_email || null
      };

      const updatedMessages = [...(trip.messages || []), newMessage];
      await base44.entities.Trip.update(tripId, {
        messages: updatedMessages
      });

      queryClient.invalidateQueries(['trip', tripId]);
      
      // Send notifications to participants (except sender)
      const title = trip.title || trip.title_he || trip.title_en;
      const recipientsList = type === 'private' && recipient_email
        ? [recipient_email]
        : (trip.participants || []).map(p => p.email).filter(e => e !== user.email);
      
      // Create notification records for group messages
      if (type === 'group') {
        const notificationPromises = recipientsList.map(email => 
          base44.entities.Notification.create({
            recipient_email: email,
            notification_type: 'new_messages',
            title: language === 'he' ? 'הודעה חדשה בצ\'אט הקבוצתי' : 'New message in group chat',
            body: language === 'he'
              ? `${userName} כתב/ה: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`
              : `${userName} wrote: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
            trip_id: tripId,
            sent_at: new Date().toISOString()
          })
        );
        await Promise.all(notificationPromises);
      }
      
      recipientsList.forEach(async (email) => {
        try {
          await base44.functions.invoke('sendPushNotification', {
            recipient_email: email,
            notification_type: 'new_messages',
            title: language === 'he' ? 'הודעה חדשה בטיול' : 'New message in trip',
            body: language === 'he'
              ? `${userName} שלח/ה הודעה בטיול "${title}"`
              : `${userName} sent a message in "${title}"`
          });
        } catch (error) {
          console.log('Notification error:', error);
        }
      });
    } catch (error) {
      toast.error(language === 'he' ? 'שגיאה בשליחת ההודעה' : language === 'ru' ? 'Ошибка отправки сообщения' : language === 'es' ? 'Error al enviar mensaje' : language === 'fr' ? 'Erreur d\'envoi du message' : language === 'de' ? 'Fehler beim Senden der Nachricht' : language === 'it' ? 'Errore nell\'invio del messaggio' : 'Error sending message');
    }
    setSendingMessage(false);
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
          {language === 'he' ? 'הטיול לא נמצא' : language === 'ru' ? 'Поездка не найдена' : language === 'es' ? 'Viaje no encontrado' : language === 'fr' ? 'Voyage non trouvé' : language === 'de' ? 'Reise nicht gefunden' : language === 'it' ? 'Viaggio non trovato' : 'Trip not found'}
        </h2>
        <Button onClick={() => navigate(createPageUrl('Home'))}>
          {t('home')}
        </Button>
      </div>
    );
  }

  const title = trip.title || trip.title_he || trip.title_en;
  const description = trip.description || trip.description_he || trip.description_en;

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
            {isOrganizer && !isEditing && (
              <>
                <Button 
                  variant="secondary" 
                  size="icon" 
                  className="rounded-full bg-white/90 hover:bg-white"
                  onClick={handleStartEdit}
                >
                  <Edit className="w-5 h-5" />
                </Button>
                <Button 
                  variant="secondary" 
                  size="icon" 
                  className="rounded-full bg-white/90 hover:bg-white relative w-10 h-10 sm:w-auto sm:h-auto"
                  disabled={uploadingImage}
                  onClick={() => document.getElementById('trip-image-gallery').click()}
                  title={language === 'he' ? 'בחר מהגלריה' : language === 'ru' ? 'Выбрать из галереи' : language === 'es' ? 'Elegir de la galería' : language === 'fr' ? 'Choisir de la galerie' : language === 'de' ? 'Aus Galerie wählen' : language === 'it' ? 'Scegli dalla galleria' : 'Choose from gallery'}
                >
                  {uploadingImage ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Upload className="w-5 h-5" />
                  )}
                </Button>
                <Button 
                  variant="secondary" 
                  size="icon" 
                  className="rounded-full bg-white/90 hover:bg-white relative w-10 h-10 sm:w-auto sm:h-auto"
                  disabled={uploadingImage}
                  onClick={() => document.getElementById('trip-image-camera').click()}
                  title={language === 'he' ? 'צלם תמונה' : language === 'ru' ? 'Сделать фото' : language === 'es' ? 'Tomar foto' : language === 'fr' ? 'Prendre photo' : language === 'de' ? 'Foto aufnehmen' : language === 'it' ? 'Scatta foto' : 'Take photo'}
                >
                  {uploadingImage ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Camera className="w-5 h-5" />
                  )}
                </Button>
                <input
                  id="trip-image-gallery"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <input
                  id="trip-image-camera"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </>
            )}
            {isOrganizer && isEditing && (
              <div className="flex gap-2">
                <Button 
                  variant="secondary" 
                  className="rounded-full bg-white/90 hover:bg-white"
                  onClick={handleCancelEdit}
                >
                  <X className="w-4 h-4 mr-1" />
                  {language === 'he' ? 'ביטול' : language === 'ru' ? 'Отмена' : language === 'es' ? 'Cancelar' : language === 'fr' ? 'Annuler' : language === 'de' ? 'Abbrechen' : language === 'it' ? 'Annulla' : 'Cancel'}
                </Button>
                <Button 
                  className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={handleSaveEdit}
                >
                  <Check className="w-4 h-4 mr-1" />
                  {language === 'he' ? 'שמור' : language === 'ru' ? 'Сохранить' : language === 'es' ? 'Guardar' : language === 'fr' ? 'Enregistrer' : language === 'de' ? 'Speichern' : language === 'it' ? 'Salva' : 'Save'}
                </Button>
              </div>
            )}
            {!isEditing && (
              <>
                {user && (
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    className={`rounded-full bg-white/90 hover:bg-white ${
                      trip.saves?.some(s => s.email === user.email) ? 'text-emerald-600' : ''
                    }`}
                    onClick={handleSaveTrip}
                  >
                    <Bookmark className={`w-5 h-5 ${
                      trip.saves?.some(s => s.email === user.email) ? 'fill-current' : ''
                    }`} />
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
              </>
            )}
          </div>
        </div>

        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge className={`${difficultyColors[trip.difficulty]} border`}>
              {t(trip.difficulty)}
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
              {isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>{language === 'he' ? 'כותרת' : language === 'ru' ? 'Название' : language === 'es' ? 'Título' : language === 'fr' ? 'Titre' : language === 'de' ? 'Titel' : language === 'it' ? 'Titolo' : 'Title'}</Label>
                    <Input
                      value={editData.title}
                      onChange={(e) => setEditData({...editData, title: e.target.value})}
                      dir={isRTL ? 'rtl' : 'ltr'}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'he' ? 'תיאור' : language === 'ru' ? 'Описание' : language === 'es' ? 'Descripción' : language === 'fr' ? 'Description' : language === 'de' ? 'Beschreibung' : language === 'it' ? 'Descrizione' : 'Description'}</Label>
                    <Textarea
                      value={editData.description || ''}
                      onChange={(e) => setEditData({...editData, description: e.target.value})}
                      dir={isRTL ? 'rtl' : 'ltr'}
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('country')}</Label>
                      <Select value={editData.country} onValueChange={(v) => setEditData({...editData, country: v, region: '', sub_region: ''})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {getAllCountries().map(c => (
                            <SelectItem key={c} value={c}>{t(c)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{language === 'he' ? 'אזור' : language === 'ru' ? 'Регион' : language === 'es' ? 'Región' : language === 'fr' ? 'Région' : language === 'de' ? 'Region' : language === 'it' ? 'Regione' : 'Region'}</Label>
                      <Input
                        value={editData.region}
                        onChange={(e) => setEditData({...editData, region: e.target.value})}
                        placeholder={language === 'he' ? 'אזור/מחוז' : language === 'ru' ? 'Регион/Штат' : language === 'es' ? 'Región/Estado' : language === 'fr' ? 'Région/État' : language === 'de' ? 'Region/Bundesland' : language === 'it' ? 'Regione/Stato' : 'Region/State'}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>{language === 'he' ? 'תאריך' : language === 'ru' ? 'Дата' : language === 'es' ? 'Fecha' : language === 'fr' ? 'Date' : language === 'de' ? 'Datum' : language === 'it' ? 'Data' : 'Date'}</Label>
                      <Input
                        type="date"
                        value={editData.date}
                        onChange={(e) => setEditData({...editData, date: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{language === 'he' ? 'שעת התכנסות' : language === 'ru' ? 'Время встречи' : language === 'es' ? 'Hora de encuentro' : language === 'fr' ? 'Heure de rendez-vous' : language === 'de' ? 'Treffpunkt Zeit' : language === 'it' ? 'Orario ritrovo' : 'Meeting Time'}</Label>
                      <Input
                        type="time"
                        value={editData.meeting_time || ''}
                        onChange={(e) => setEditData({...editData, meeting_time: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{language === 'he' ? 'מיקום' : language === 'ru' ? 'Местоположение' : language === 'es' ? 'Ubicación' : language === 'fr' ? 'Emplacement' : language === 'de' ? 'Standort' : language === 'it' ? 'Posizione' : 'Location'}</Label>
                      <Input
                        value={editData.location}
                        onChange={(e) => setEditData({...editData, location: e.target.value})}
                        dir={isRTL ? 'rtl' : 'ltr'}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('activityType')}</Label>
                      <Select value={editData.activity_type} onValueChange={(v) => setEditData({...editData, activity_type: v})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {activityTypes.map(type => (
                            <SelectItem key={type} value={type}>{t(type)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{language === 'he' ? 'רמת קושי' : 'Difficulty'}</Label>
                      <Select value={editData.difficulty} onValueChange={(v) => setEditData({...editData, difficulty: v})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {difficulties.map(d => (
                            <SelectItem key={d} value={d}>{t(d)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {editData.activity_type === 'cycling' && (
                    <>
                      <Separator />
                      <div className="space-y-4">
                        <Label className="text-base font-semibold">{language === 'he' ? 'פרטי רכיבה' : language === 'ru' ? 'Детали велосипеда' : language === 'es' ? 'Detalles de ciclismo' : language === 'fr' ? 'Détails du cyclisme' : language === 'de' ? 'Radfahren Details' : language === 'it' ? 'Dettagli ciclismo' : 'Cycling Details'}</Label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>{t('cyclingType')}</Label>
                            <Select value={editData.cycling_type} onValueChange={(v) => setEditData({...editData, cycling_type: v})}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {cyclingTypes.map(type => (
                                  <SelectItem key={type} value={type}>{t(type)}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>{t('cyclingDistance')}</Label>
                            <Input
                              type="number"
                              value={editData.cycling_distance || ''}
                              onChange={(e) => setEditData({...editData, cycling_distance: parseInt(e.target.value) || null})}
                              placeholder="50"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>{t('cyclingElevation')}</Label>
                            <Input
                              type="number"
                              value={editData.cycling_elevation || ''}
                              onChange={(e) => setEditData({...editData, cycling_elevation: parseInt(e.target.value) || null})}
                              placeholder="500"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {editData.activity_type === 'offroad' && (
                    <>
                      <Separator />
                      <div className="space-y-4">
                        <Label className="text-base font-semibold">{language === 'he' ? 'פרטי שטח' : language === 'ru' ? 'Детали бездорожья' : language === 'es' ? 'Detalles todo terreno' : language === 'fr' ? 'Détails tout-terrain' : language === 'de' ? 'Offroad-Details' : language === 'it' ? 'Dettagli fuoristrada' : 'Off-road Details'}</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>{t('offroadVehicleType')}</Label>
                            <Select value={editData.offroad_vehicle_type} onValueChange={(v) => setEditData({...editData, offroad_vehicle_type: v})}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {offroadVehicleTypes.map(type => (
                                  <SelectItem key={type} value={type}>{t(type)}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>{t('offroadDistance')}</Label>
                            <Input
                              type="number"
                              value={editData.offroad_distance || ''}
                              onChange={(e) => setEditData({...editData, offroad_distance: parseInt(e.target.value) || null})}
                              placeholder="80"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>{t('offroadTerrainType')}</Label>
                          <div className="flex flex-wrap gap-2">
                            {offroadTerrainTypes.map(type => (
                              <Badge
                                key={type}
                                variant={editData.offroad_terrain_type?.includes(type) ? 'default' : 'outline'}
                                className="cursor-pointer"
                                onClick={() => {
                                  const current = editData.offroad_terrain_type || [];
                                  setEditData({
                                    ...editData,
                                    offroad_terrain_type: current.includes(type)
                                      ? current.filter(t => t !== type)
                                      : [...current, type]
                                  });
                                }}
                              >
                                {t(type)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{language === 'he' ? 'סוג משך' : language === 'ru' ? 'Тип продолжительности' : language === 'es' ? 'Tipo de duración' : language === 'fr' ? 'Type de durée' : language === 'de' ? 'Dauertyp' : language === 'it' ? 'Tipo di durata' : 'Duration Type'}</Label>
                      <Select value={editData.duration_type} onValueChange={(v) => setEditData({...editData, duration_type: v})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {durations.map(d => (
                            <SelectItem key={d} value={d}>{t(d)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{language === 'he' ? 'משך זמן' : language === 'ru' ? 'Значение продолжительности' : language === 'es' ? 'Valor de duración' : language === 'fr' ? 'Valeur de durée' : language === 'de' ? 'Dauerwert' : language === 'it' ? 'Valore durata' : 'Duration Value'}</Label>
                      <Input
                        type="number"
                        value={editData.duration_value}
                        onChange={(e) => setEditData({...editData, duration_value: parseInt(e.target.value)})}
                        min={1}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'he' ? 'מקסימום משתתפים' : language === 'ru' ? 'Макс. участники' : language === 'es' ? 'Máximo de participantes' : language === 'fr' ? 'Participants max' : language === 'de' ? 'Max. Teilnehmer' : language === 'it' ? 'Massimo partecipanti' : 'Max Participants'}</Label>
                    <Input
                      type="number"
                      value={editData.max_participants}
                      onChange={(e) => setEditData({...editData, max_participants: parseInt(e.target.value)})}
                      min={trip.current_participants}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label>{language === 'he' ? 'סוגי שביל' : language === 'ru' ? 'Типы тропы' : language === 'es' ? 'Tipos de sendero' : language === 'fr' ? 'Types de sentier' : language === 'de' ? 'Wegtypen' : language === 'it' ? 'Tipi di sentiero' : 'Trail Types'}</Label>
                    <div className="flex flex-wrap gap-2">
                      {trailTypes.map(type => (
                        <Badge
                          key={type}
                          variant={editData.trail_type?.includes(type) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => {
                            const current = editData.trail_type || [];
                            setEditData({
                              ...editData,
                              trail_type: current.includes(type) 
                                ? current.filter(t => t !== type)
                                : [...current, type]
                            });
                          }}
                        >
                          {t(type)}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{t('interests')}</Label>
                    <div className="flex flex-wrap gap-2">
                      {['nature', 'history', 'photography', 'birdwatching', 'archaeology', 'geology', 'botany', 'extreme_sports', 'family_friendly', 'romantic'].map(interest => (
                        <Badge
                          key={interest}
                          variant={editData.interests?.includes(interest) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => {
                            const current = editData.interests || [];
                            setEditData({
                              ...editData,
                              interests: current.includes(interest) 
                                ? current.filter(i => i !== interest)
                                : [...current, interest]
                            });
                          }}
                        >
                          {t(interest)}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{t('accessibilityTypes')}</Label>
                    <div className="flex flex-wrap gap-2">
                      {accessibilityTypes.map(type => (
                        <Badge
                          key={type}
                          variant={editData.accessibility_types?.includes(type) ? 'default' : 'outline'}
                          className="cursor-pointer bg-purple-600"
                          onClick={() => {
                            const current = editData.accessibility_types || [];
                            setEditData({
                              ...editData,
                              accessibility_types: current.includes(type) 
                                ? current.filter(t => t !== type)
                                : [...current, type]
                            });
                          }}
                        >
                          {t(type)}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
                      <Label className="mb-0">{t('petsAllowed')}</Label>
                      <Switch
                        checked={editData.pets_allowed}
                        onCheckedChange={(checked) => setEditData({...editData, pets_allowed: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
                      <Label className="mb-0">{t('campingAvailable')}</Label>
                      <Switch
                        checked={editData.camping_available}
                        onCheckedChange={(checked) => setEditData({...editData, camping_available: checked})}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>{language === 'he' ? 'מדריך מקצועי' : language === 'ru' ? 'Профессиональный гид' : language === 'es' ? 'Guía profesional' : language === 'fr' ? 'Guide professionnel' : language === 'de' ? 'Professioneller Führer' : language === 'it' ? 'Guida professionale' : 'Professional Guide'}</Label>
                      <Switch
                        checked={editData.has_guide}
                        onCheckedChange={(checked) => setEditData({...editData, has_guide: checked})}
                      />
                    </div>
                    {editData.has_guide && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>{language === 'he' ? 'שם המדריך' : language === 'ru' ? 'Имя гида' : language === 'es' ? 'Nombre del guía' : language === 'fr' ? 'Nom du guide' : language === 'de' ? 'Name des Führers' : language === 'it' ? 'Nome della guida' : 'Guide Name'}</Label>
                          <Input
                            value={editData.guide_name}
                            onChange={(e) => setEditData({...editData, guide_name: e.target.value})}
                            dir={isRTL ? 'rtl' : 'ltr'}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{language === 'he' ? 'נושא ההדרכה' : language === 'ru' ? 'Тема гида' : language === 'es' ? 'Tema del guía' : language === 'fr' ? 'Sujet du guide' : language === 'de' ? 'Thema des Führers' : language === 'it' ? 'Argomento della guida' : 'Guide Topic'}</Label>
                          <Input
                            value={editData.guide_topic}
                            onChange={(e) => setEditData({...editData, guide_topic: e.target.value})}
                            dir={isRTL ? 'rtl' : 'ltr'}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>{language === 'he' ? 'טווחי גילאי הורים' : language === 'ru' ? 'Возраст родителей' : language === 'es' ? 'Rangos de edad de padres' : language === 'fr' ? 'Tranches d\'âge des parents' : language === 'de' ? 'Altersgruppen Eltern' : language === 'it' ? 'Fasce d\'età genitori' : 'Parent Age Ranges'}</Label>
                      <div className="flex flex-wrap gap-2">
                        {['20-30', '30-40', '40-50', '50-60', '60+'].map(range => (
                          <Badge
                            key={range}
                            variant={editData.parent_age_ranges?.includes(range) ? 'default' : 'outline'}
                            className="cursor-pointer"
                            onClick={() => {
                              const current = editData.parent_age_ranges || [];
                              setEditData({
                                ...editData,
                                parent_age_ranges: current.includes(range) 
                                  ? current.filter(r => r !== range)
                                  : [...current, range]
                              });
                            }}
                          >
                            {range}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>{language === 'he' ? 'טווחי גילאי ילדים' : language === 'ru' ? 'Возраст детей' : language === 'es' ? 'Rangos de edad de niños' : language === 'fr' ? 'Tranches d\'âge des enfants' : language === 'de' ? 'Altersgruppen Kinder' : language === 'it' ? 'Fasce d\'età bambini' : 'Children Age Ranges'}</Label>
                      <div className="flex flex-wrap gap-2">
                        {['0-2', '3-6', '7-10', '11-14', '15-18', '18-21', '21+'].map(range => (
                          <Badge
                            key={range}
                            variant={editData.children_age_ranges?.includes(range) ? 'default' : 'outline'}
                            className="cursor-pointer"
                            onClick={() => {
                              const current = editData.children_age_ranges || [];
                              setEditData({
                                ...editData,
                                children_age_ranges: current.includes(range) 
                                  ? current.filter(r => r !== range)
                                  : [...current, range]
                              });
                            }}
                          >
                            {range}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-6 flex-wrap">
                    <motion.div 
                      className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="p-1 bg-blue-100 rounded">
                        <Calendar className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-700">{formatDate(new Date(trip.date), 'EEEE, MMMM d, yyyy', language)}</span>
                        {trip.meeting_time && (
                          <span className="text-sm text-blue-600 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {language === 'he' ? 'התכנסות:' : language === 'ru' ? 'Встреча:' : language === 'es' ? 'Encuentro:' : language === 'fr' ? 'Rendez-vous :' : language === 'de' ? 'Treffpunkt:' : language === 'it' ? 'Ritrovo:' : 'Meeting:'} {trip.meeting_time}
                          </span>
                        )}
                      </div>
                    </motion.div>
                    <motion.div 
                      className="flex items-center gap-2 bg-purple-50 px-3 py-2 rounded-lg"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="p-1 bg-purple-100 rounded">
                        <Clock className="w-5 h-5 text-purple-600" />
                      </div>
                      <span className="font-semibold text-gray-700">{trip.duration_value} {t(trip.duration_type)}</span>
                    </motion.div>
                    <motion.div 
                      className="flex items-center gap-2 bg-rose-50 px-3 py-2 rounded-lg"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="p-1 bg-rose-100 rounded">
                        <Users className="w-5 h-5 text-rose-600" />
                      </div>
                      <span className="font-semibold text-gray-700">{trip.current_participants || 1}/{trip.max_participants}</span>
                    </motion.div>
                    {trip.activity_type === 'cycling' && (
                      <motion.div 
                        className="flex items-center gap-2 bg-cyan-50 px-3 py-2 rounded-lg"
                        whileHover={{ scale: 1.05 }}
                      >
                        <div className="p-1 bg-cyan-100 rounded">
                          <Bike className="w-5 h-5 text-cyan-600" />
                        </div>
                        <span className="font-semibold text-gray-700">{t(trip.cycling_type || 'cycling')}</span>
                      </motion.div>
                    )}
                    {trip.activity_type === 'offroad' && (
                      <motion.div 
                        className="flex items-center gap-2 bg-orange-50 px-3 py-2 rounded-lg"
                        whileHover={{ scale: 1.05 }}
                      >
                        <div className="p-1 bg-orange-100 rounded">
                          <Truck className="w-5 h-5 text-orange-600" />
                        </div>
                        <span className="font-semibold text-gray-700">{t(trip.offroad_vehicle_type || 'offroad')}</span>
                      </motion.div>
                    )}
                  </div>

                  {user && !isOrganizer && (
                    hasJoined ? (
                      <div className="flex gap-2">
                        <Button 
                          onClick={handleAddToCalendar}
                          disabled={addingToCalendar}
                          className="bg-blue-600 hover:bg-blue-700 gap-2"
                        >
                          {addingToCalendar ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Calendar className="w-4 h-4" />
                          )}
                          {language === 'he' ? 'הוסף ליומן' : language === 'ru' ? 'В календарь' : language === 'es' ? 'Agregar a calendario' : language === 'fr' ? 'Ajouter au calendrier' : language === 'de' ? 'Zum Kalender' : language === 'it' ? 'Aggiungi al calendario' : 'Add to Calendar'}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => leaveMutation.mutate()}
                          disabled={leaveMutation.isLoading}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <X className="w-4 h-4 mr-2" />
                          {t('leave')}
                        </Button>
                      </div>
                    ) : hasPendingRequest ? (
                      <Badge variant="outline" className="border-yellow-300 text-yellow-700 bg-yellow-50">
                        {language === 'he' ? 'הבקשה ממתינה לאישור' : language === 'ru' ? 'Запрос ожидает подтверждения' : language === 'es' ? 'Solicitud pendiente de aprobación' : language === 'fr' ? 'Demande en attente d\'approbation' : language === 'de' ? 'Anfrage wartet auf Genehmigung' : language === 'it' ? 'Richiesta in attesa di approvazione' : 'Request pending approval'}
                      </Badge>
                    ) : (
                      <Button 
                        onClick={() => setShowJoinDialog(true)}
                        disabled={joinMutation.isLoading || isFull}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        {isFull ? t('tripFull') : (language === 'he' ? 'בקש להצטרף' : language === 'ru' ? 'Запросить присоединение' : language === 'es' ? 'Solicitar unirse' : language === 'fr' ? 'Demander à rejoindre' : language === 'de' ? 'Beitritt anfragen' : language === 'it' ? 'Richiedi di unirti' : 'Request to Join')}
                      </Button>
                    )
                  )}
                  
                  {!user && (
                    <Button 
                      onClick={() => base44.auth.redirectToLogin(window.location.href)}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      {language === 'he' ? 'התחבר להצטרפות' : language === 'ru' ? 'Войти для присоединения' : language === 'es' ? 'Iniciar sesión para unirse' : language === 'fr' ? 'Se connecter pour rejoindre' : language === 'de' ? 'Anmelden zum Beitreten' : language === 'it' ? 'Accedi per unirti' : 'Login to Join'}
                    </Button>
                  )}

                  {isOrganizer && (
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleAddToCalendar}
                        disabled={addingToCalendar}
                        className="bg-blue-600 hover:bg-blue-700 gap-2"
                      >
                        {addingToCalendar ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Calendar className="w-4 h-4" />
                        )}
                        {language === 'he' ? 'הוסף ליומן' : language === 'ru' ? 'В календарь' : language === 'es' ? 'Agregar a calendario' : language === 'fr' ? 'Ajouter au calendrier' : language === 'de' ? 'Zum Kalender' : language === 'it' ? 'Aggiungi al calendario' : 'Add to Calendar'}
                      </Button>
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 h-10 flex items-center">
                        {language === 'he' ? 'אתה המארגן' : language === 'ru' ? 'Вы организатор' : language === 'es' ? 'Eres el organizador' : language === 'fr' ? 'Vous êtes l\'organisateur' : language === 'de' ? 'Sie sind der Organisator' : language === 'it' ? 'Sei l\'organizzatore' : "You're the organizer"}
                      </Badge>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-12 h-auto bg-white border shadow-sm mb-6" dir={language === 'he' ? 'rtl' : 'ltr'}>
              <TabsTrigger value="details" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 py-3">
                <Info className="w-4 h-4 text-emerald-600 sm:hidden" />
                <span className="text-xs sm:text-sm sm:hidden">{language === 'he' ? 'פרטים' : language === 'ru' ? 'Детали' : language === 'es' ? 'Detalles' : language === 'fr' ? 'Détails' : language === 'de' ? 'Details' : language === 'it' ? 'Dettagli' : 'Details'}</span>
                <Info className="w-4 h-4 text-emerald-600 hidden sm:block" />
                <span className="hidden sm:inline">{language === 'he' ? 'פרטים' : language === 'ru' ? 'Детали' : language === 'es' ? 'Detalles' : language === 'fr' ? 'Détails' : language === 'de' ? 'Details' : language === 'it' ? 'Dettagli' : 'Details'}</span>
              </TabsTrigger>
              <TabsTrigger value="map" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 py-3">
                <MapPin className="w-4 h-4 text-purple-600 sm:hidden" />
                <span className="text-xs sm:text-sm sm:hidden">{language === 'he' ? 'מפה' : language === 'ru' ? 'Карта' : language === 'es' ? 'Mapa' : language === 'fr' ? 'Carte' : language === 'de' ? 'Karte' : language === 'it' ? 'Mappa' : 'Map'}</span>
                <MapPin className="w-4 h-4 text-purple-600 hidden sm:block" />
                <span className="hidden sm:inline">{language === 'he' ? 'מפה' : language === 'ru' ? 'Карта' : language === 'es' ? 'Mapa' : language === 'fr' ? 'Carte' : language === 'de' ? 'Karte' : language === 'it' ? 'Mappa' : 'Map'}</span>
              </TabsTrigger>
              <TabsTrigger value="navigate" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 data-[state=active]:bg-green-50 data-[state=active]:text-green-700 py-3" onClick={(e) => {
                e.preventDefault();
                setShowNavigationDialog(true);
              }}>
                <Navigation className="w-4 h-4 text-green-600 sm:hidden" />
                <span className="text-xs sm:text-sm sm:hidden">{language === 'he' ? 'נווט' : language === 'ru' ? 'Навиг.' : language === 'es' ? 'Navegar' : language === 'fr' ? 'Naviguer' : language === 'de' ? 'Navigieren' : language === 'it' ? 'Navigare' : 'Navigate'}</span>
                <Navigation className="w-4 h-4 text-green-600 hidden sm:block" />
                <span className="hidden sm:inline">{language === 'he' ? 'נווט ליעד' : language === 'ru' ? 'Навигация' : language === 'es' ? 'Navegar' : language === 'fr' ? 'Naviguer' : language === 'de' ? 'Navigieren' : language === 'it' ? 'Navigare' : 'Navigate'}</span>
              </TabsTrigger>
              <TabsTrigger value="participants" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 py-3">
                <Users className="w-4 h-4 text-blue-600 sm:hidden" />
                <span className="text-xs sm:text-sm sm:hidden">{language === 'he' ? 'משתתפים' : language === 'ru' ? 'Люди' : language === 'es' ? 'Gente' : language === 'fr' ? 'Personnes' : language === 'de' ? 'Leute' : language === 'it' ? 'Persone' : 'People'}</span>
                <Users className="w-4 h-4 text-blue-600 hidden sm:block" />
                <span className="hidden sm:inline">{language === 'he' ? 'משתתפים' : language === 'ru' ? 'Участники' : language === 'es' ? 'Participantes' : language === 'fr' ? 'Participants' : language === 'de' ? 'Teilnehmer' : language === 'it' ? 'Partecipanti' : 'Participants'}</span>
              </TabsTrigger>
              <TabsTrigger value="equipment" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 py-3">
                <Backpack className="w-4 h-4 text-indigo-600 sm:hidden" />
                <span className="text-xs sm:text-sm sm:hidden">{language === 'he' ? 'ציוד' : language === 'ru' ? 'Снаряжение' : language === 'es' ? 'Equipo' : language === 'fr' ? 'Équipement' : language === 'de' ? 'Ausrüstung' : language === 'it' ? 'Attrezzatura' : 'Gear'}</span>
                <Backpack className="w-4 h-4 text-indigo-600 hidden sm:block" />
                <span className="hidden sm:inline">{language === 'he' ? 'ציוד' : language === 'ru' ? 'Снаряжение' : language === 'es' ? 'Equipo' : language === 'fr' ? 'Équipement' : language === 'de' ? 'Ausrüstung' : language === 'it' ? 'Attrezzatura' : 'Equipment'}</span>
              </TabsTrigger>
              <TabsTrigger value="itinerary" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 data-[state=active]:bg-violet-50 data-[state=active]:text-violet-700 py-3">
                <Calendar className="w-4 h-4 text-violet-600 sm:hidden" />
                <span className="text-xs sm:text-sm sm:hidden">{language === 'he' ? 'לוח' : language === 'ru' ? 'План' : language === 'es' ? 'Plan' : language === 'fr' ? 'Plan' : language === 'de' ? 'Plan' : language === 'it' ? 'Piano' : 'Plan'}</span>
                <Calendar className="w-4 h-4 text-violet-600 hidden sm:block" />
                <span className="hidden sm:inline">{language === 'he' ? 'לוח זמנים' : language === 'ru' ? 'Маршрут' : language === 'es' ? 'Itinerario' : language === 'fr' ? 'Itinéraire' : language === 'de' ? 'Reiseplan' : language === 'it' ? 'Itinerario' : 'Itinerary'}</span>
              </TabsTrigger>
              <TabsTrigger value="budget" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700 py-3">
                <DollarSign className="w-4 h-4 text-amber-600 sm:hidden" />
                <span className="text-xs sm:text-sm sm:hidden">{language === 'he' ? 'תקציב' : language === 'ru' ? 'Бюджет' : language === 'es' ? 'Presupuesto' : language === 'fr' ? 'Budget' : language === 'de' ? 'Budget' : language === 'it' ? 'Budget' : 'Budget'}</span>
                <DollarSign className="w-4 h-4 text-amber-600 hidden sm:block" />
                <span className="hidden sm:inline">{language === 'he' ? 'תקציב' : language === 'ru' ? 'Бюджет' : language === 'es' ? 'Presupuesto' : language === 'fr' ? 'Budget' : language === 'de' ? 'Budget' : language === 'it' ? 'Budget' : 'Budget'}</span>
              </TabsTrigger>
              <TabsTrigger value="social" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 data-[state=active]:bg-sky-50 data-[state=active]:text-sky-700 py-3">
                <MessageCircle className="w-4 h-4 text-sky-600 sm:hidden" />
                <span className="text-xs sm:text-sm sm:hidden">{language === 'he' ? 'חברתי' : language === 'ru' ? 'Соцсети' : language === 'es' ? 'Social' : language === 'fr' ? 'Social' : language === 'de' ? 'Sozial' : language === 'it' ? 'Sociale' : 'Social'}</span>
                <MessageCircle className="w-4 h-4 text-sky-600 hidden sm:block" />
                <span className="hidden sm:inline">{language === 'he' ? 'חברתי' : language === 'ru' ? 'Соцсети' : language === 'es' ? 'Social' : language === 'fr' ? 'Social' : language === 'de' ? 'Sozial' : language === 'it' ? 'Sociale' : 'Social'}</span>
              </TabsTrigger>
              {(hasJoined || isOrganizer) && (
                <>
                  <TabsTrigger value="chat" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700 py-3">
                    <MessageSquare className="w-4 h-4 text-orange-600 sm:hidden" />
                    <span className="text-xs sm:text-sm sm:hidden">{language === 'he' ? 'צ\'אט' : language === 'ru' ? 'Чат' : language === 'es' ? 'Chat' : language === 'fr' ? 'Chat' : language === 'de' ? 'Chat' : language === 'it' ? 'Chat' : 'Chat'}</span>
                    <MessageSquare className="w-4 h-4 text-orange-600 hidden sm:block" />
                    <span className="hidden sm:inline">{language === 'he' ? 'צ\'אט' : language === 'ru' ? 'Чат' : language === 'es' ? 'Chat' : language === 'fr' ? 'Chat' : language === 'de' ? 'Chat' : language === 'it' ? 'Chat' : 'Chat'}</span>
                  </TabsTrigger>
                  <TabsTrigger value="gallery" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 data-[state=active]:bg-pink-50 data-[state=active]:text-pink-700 py-3">
                    <GalleryHorizontal className="w-4 h-4 text-pink-600 sm:hidden" />
                    <span className="text-xs sm:text-sm sm:hidden">{language === 'he' ? 'גלריה' : language === 'ru' ? 'Фото' : language === 'es' ? 'Fotos' : language === 'fr' ? 'Photos' : language === 'de' ? 'Fotos' : language === 'it' ? 'Foto' : 'Photos'}</span>
                    <GalleryHorizontal className="w-4 h-4 text-pink-600 hidden sm:block" />
                    <span className="hidden sm:inline">{language === 'he' ? 'גלריה' : language === 'ru' ? 'Галерея' : language === 'es' ? 'Galería' : language === 'fr' ? 'Galerie' : language === 'de' ? 'Galerie' : language === 'it' ? 'Galleria' : 'Gallery'}</span>
                  </TabsTrigger>
                  <TabsTrigger value="experiences" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 data-[state=active]:bg-rose-50 data-[state=active]:text-rose-700 py-3">
                    <Heart className="w-4 h-4 text-rose-600 sm:hidden" />
                    <span className="text-xs sm:text-sm sm:hidden">{language === 'he' ? 'חוויות' : language === 'ru' ? 'Истории' : language === 'es' ? 'Historias' : language === 'fr' ? 'Récits' : language === 'de' ? 'Geschichten' : language === 'it' ? 'Storie' : 'Stories'}</span>
                    <Heart className="w-4 h-4 text-rose-600 hidden sm:block" />
                    <span className="hidden sm:inline">{language === 'he' ? 'חוויות' : language === 'ru' ? 'Впечатления' : language === 'es' ? 'Experiencias' : language === 'fr' ? 'Expériences' : language === 'de' ? 'Erlebnisse' : language === 'it' ? 'Esperienze' : 'Experiences'}</span>
                  </TabsTrigger>
                  <TabsTrigger value="location" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700 py-3">
                    <Radio className="w-4 h-4 text-teal-600 sm:hidden" />
                    <span className="text-xs sm:text-sm sm:hidden">{language === 'he' ? 'מיקום' : language === 'ru' ? 'Онлайн' : language === 'es' ? 'En vivo' : language === 'fr' ? 'Direct' : language === 'de' ? 'Live' : language === 'it' ? 'Live' : 'Live'}</span>
                    <Radio className="w-4 h-4 text-teal-600 hidden sm:block" />
                    <span className="hidden sm:inline">{language === 'he' ? 'מיקום חי' : language === 'ru' ? 'Локация' : language === 'es' ? 'Ubicación' : language === 'fr' ? 'Localisation' : language === 'de' ? 'Standort' : language === 'it' ? 'Posizione' : 'Live Location'}</span>
                  </TabsTrigger>
                  <TabsTrigger value="reminders" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 data-[state=active]:bg-yellow-50 data-[state=active]:text-yellow-700 py-3">
                    <Bell className="w-4 h-4 text-yellow-600 sm:hidden" />
                    <span className="text-xs sm:text-sm sm:hidden">{language === 'he' ? 'תזכורות' : language === 'ru' ? 'Напоминания' : language === 'es' ? 'Recordatorios' : language === 'fr' ? 'Rappels' : language === 'de' ? 'Erinnerungen' : language === 'it' ? 'Promemoria' : 'Reminders'}</span>
                    <Bell className="w-4 h-4 text-yellow-600 hidden sm:block" />
                    <span className="hidden sm:inline">{language === 'he' ? 'תזכורות' : language === 'ru' ? 'Напоминания' : language === 'es' ? 'Recordatorios' : language === 'fr' ? 'Rappels' : language === 'de' ? 'Erinnerungen' : language === 'it' ? 'Promemoria' : 'Reminders'}</span>
                  </TabsTrigger>
                  <TabsTrigger value="contributions" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 py-3">
                    <Package className="w-4 h-4 text-indigo-600 sm:hidden" />
                    <span className="text-xs sm:text-sm sm:hidden">{language === 'he' ? 'מביאים' : 'Bringing'}</span>
                    <Package className="w-4 h-4 text-indigo-600 hidden sm:block" />
                    <span className="hidden sm:inline">{language === 'he' ? 'מה אני מביא' : 'What I\'m Bringing'}</span>
                  </TabsTrigger>
                  </>
                  )}
                  </TabsList>

            <TabsContent value="social" className="mt-0">
              <TripComments 
                trip={trip}
                currentUserEmail={user?.email}
                onUpdate={() => queryClient.invalidateQueries(['trip', tripId])}
              />
            </TabsContent>

            <TabsContent value="details" className="space-y-6 mt-0">
              {/* Description */}
              {description && !isEditing && (
                <Card>
                  <CardContent className="p-6">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap" dir={isRTL ? 'rtl' : 'ltr'}>{description}</p>
                  </CardContent>
                </Card>
              )}

              {/* Details */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('tripDetails')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6" dir={language === 'he' ? 'rtl' : 'ltr'}>
                  {trip.activity_type === 'cycling' && (trip.cycling_distance || trip.cycling_elevation) && (
                    <div>
                      <p className="font-medium mb-2">{t('cycling')} {language === 'he' ? 'פרטים' : language === 'ru' ? 'Детали' : language === 'es' ? 'Detalles' : language === 'fr' ? 'Détails' : language === 'de' ? 'Details' : language === 'it' ? 'Dettagli' : 'Details'}</p>
                      <div className="flex flex-wrap gap-3">
                        {trip.cycling_distance && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {trip.cycling_distance} {language === 'he' ? 'ק"מ' : language === 'ru' ? 'км' : language === 'es' ? 'km' : language === 'fr' ? 'km' : language === 'de' ? 'km' : language === 'it' ? 'km' : 'km'}
                          </Badge>
                        )}
                        {trip.cycling_elevation && (
                          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                            ↗ {trip.cycling_elevation} {language === 'he' ? 'מ\'' : language === 'ru' ? 'м' : language === 'es' ? 'm' : language === 'fr' ? 'm' : language === 'de' ? 'm' : language === 'it' ? 'm' : 'm'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {trip.activity_type === 'offroad' && (
                    <div>
                      <p className="font-medium mb-2">{t('offroad')} {language === 'he' ? 'פרטים' : language === 'ru' ? 'Детали' : language === 'es' ? 'Detalles' : language === 'fr' ? 'Détails' : language === 'de' ? 'Details' : language === 'it' ? 'Dettagli' : 'Details'}</p>
                      <div className="space-y-2">
                        {trip.offroad_distance && (
                          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                            {trip.offroad_distance} {language === 'he' ? 'ק"מ' : language === 'ru' ? 'км' : language === 'es' ? 'km' : language === 'fr' ? 'km' : language === 'de' ? 'km' : language === 'it' ? 'km' : 'km'}
                          </Badge>
                        )}
                        {trip.offroad_terrain_type && trip.offroad_terrain_type.length > 0 && (
                          <div>
                            <p className="text-sm text-gray-500 mb-1">{t('offroadTerrainType')}:</p>
                            <div className="flex flex-wrap gap-2">
                              {trip.offroad_terrain_type.map(terrain => (
                                <Badge key={terrain} variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                  {t(terrain)}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

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

                  {trip.accessibility_types && trip.accessibility_types.length > 0 && (
                    <div>
                      <p className="font-medium mb-2">{t('accessibilityTypes')}</p>
                      <div className="flex flex-wrap gap-2">
                        {trip.accessibility_types.map(type => (
                          <Badge key={type} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                            {t(type)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {trip.has_guide && (
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-blue-900 mb-1">
                            {language === 'he' ? 'מדריך מקצועי' : language === 'ru' ? 'Профессиональный гид' : language === 'es' ? 'Guía profesional' : language === 'fr' ? 'Guide professionnel' : language === 'de' ? 'Professioneller Führer' : language === 'it' ? 'Guida professionale' : 'Professional Guide'}
                          </p>
                          {trip.guide_name && (
                            <p className="text-sm text-blue-700 mb-1">
                              <span className="font-medium">{language === 'he' ? 'שם:' : language === 'ru' ? 'Имя:' : language === 'es' ? 'Nombre:' : language === 'fr' ? 'Nom :' : language === 'de' ? 'Name:' : language === 'it' ? 'Nome:' : 'Name:'}</span> {trip.guide_name}
                            </p>
                          )}
                          {trip.guide_topic && (
                            <p className="text-sm text-blue-700">
                              <span className="font-medium">{language === 'he' ? 'נושא:' : language === 'ru' ? 'Тема:' : language === 'es' ? 'Tema:' : language === 'fr' ? 'Sujet :' : language === 'de' ? 'Thema:' : language === 'it' ? 'Argomento:' : 'Topic:'}</span> {trip.guide_topic}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <Separator />

                  {(trip.parent_age_ranges?.length > 0 || trip.children_age_ranges?.length > 0) && (
                    <div className="space-y-4">
                      {trip.parent_age_ranges?.length > 0 && (
                        <div>
                          <p className="text-gray-500 mb-2">{language === 'he' ? 'טווחי גילאי הורים' : language === 'ru' ? 'Возраст родителей' : language === 'es' ? 'Rangos de edad de padres' : language === 'fr' ? 'Tranches d\'âge des parents' : language === 'de' ? 'Altersgruppen Eltern' : language === 'it' ? 'Fasce d\'età genitori' : 'Parent Age Ranges'}</p>
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
                          <p className="text-gray-500 mb-2">{language === 'he' ? 'טווחי גילאי ילדים' : language === 'ru' ? 'Возраст детей' : language === 'es' ? 'Rangos de edad de niños' : language === 'fr' ? 'Tranches d\'âge des enfants' : language === 'de' ? 'Altersgruppen Kinder' : language === 'it' ? 'Fasce d\'età bambini' : 'Children Age Ranges'}</p>
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
            </TabsContent>

            <TabsContent value="participants" className="mt-0">
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
                          {(userProfiles[trip.organizer_email] || trip.organizer_name)?.charAt(0) || 'O'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium" dir={language === 'he' ? 'rtl' : 'ltr'}>
                          {userProfiles[trip.organizer_email] || trip.organizer_name}
                        </p>
                        <p className="text-sm text-emerald-600">{t('organizer')}</p>
                      </div>
                    </div>

                    {/* Other participants */}
                    {trip.participants?.filter(p => p.email !== trip.organizer_email).map((participant, index) => (
                      <div key={index} className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-gray-200">
                              {(userProfiles[participant.email] || participant.name)?.charAt(0) || 'P'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium" dir={language === 'he' ? 'rtl' : 'ltr'}>
                              {userProfiles[participant.email] || participant.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatDate(new Date(participant.joined_at), 'MMM d', language)}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(createPageUrl('Profile') + '?email=' + participant.email)}
                          className="gap-2"
                        >
                          <User className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="map" className="mt-0">
              <MapSidebar 
                trip={trip}
                isOrganizer={isOrganizer}
                onUpdate={() => queryClient.invalidateQueries(['trip', tripId])}
              />
              <div className="mt-6">
                <WeatherWidget location={trip.location} date={trip.date} />
              </div>
            </TabsContent>

            <TabsContent value="equipment" className="mt-0">
              <TripEquipment 
                trip={trip}
                isOrganizer={isOrganizer}
                onUpdate={() => queryClient.invalidateQueries(['trip', tripId])}
              />
            </TabsContent>

            <TabsContent value="itinerary" className="mt-0">
              <DailyItinerary 
                trip={trip}
                isOrganizer={isOrganizer}
                onUpdate={async () => {
                  await queryClient.invalidateQueries(['trip', tripId]);
                  await queryClient.refetchQueries(['trip', tripId]);
                }}
              />
            </TabsContent>

            <TabsContent value="budget" className="mt-0">
              <BudgetPlanner 
                trip={trip}
                isOrganizer={isOrganizer}
                onUpdate={() => queryClient.invalidateQueries(['trip', tripId])}
              />
            </TabsContent>

            {(hasJoined || isOrganizer) && (
              <>
                <TabsContent value="chat" className="mt-0">
                  <TripChat 
                    trip={trip}
                    currentUserEmail={user?.email}
                    onSendMessage={handleSendChatMessage}
                    sending={sendingMessage}
                  />
                </TabsContent>

                <TabsContent value="gallery" className="mt-0">
                  <TripGallery 
                    trip={trip}
                    currentUserEmail={user?.email}
                    onUpdate={() => queryClient.invalidateQueries(['trip', tripId])}
                  />
                </TabsContent>

                <TabsContent value="experiences" className="mt-0">
                  <TripExperiences 
                    trip={trip}
                    currentUserEmail={user?.email}
                    onUpdate={() => queryClient.invalidateQueries(['trip', tripId])}
                  />
                </TabsContent>

                <TabsContent value="location" className="mt-0">
                  <LiveLocationMap 
                    trip={trip}
                    currentUserEmail={user?.email}
                    onUpdate={() => queryClient.invalidateQueries(['trip', tripId])}
                  />
                </TabsContent>
                <TabsContent value="reminders" className="mt-0">
                  <TripReminders 
                    trip={trip}
                    currentUserEmail={user?.email}
                  />
                </TabsContent>
                <TabsContent value="contributions" className="mt-0">
                  <TripContributions 
                    trip={trip}
                    currentUserEmail={user?.email}
                    onUpdate={() => queryClient.invalidateQueries(['trip', tripId])}
                  />
                </TabsContent>
                </>
                )}
                </Tabs>
        </motion.div>
      </div>

      {/* Join Request Dialog */}
      <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {language === 'he' ? 'בקשה להצטרפות לטיול' : language === 'ru' ? 'Запрос на присоединение к поездке' : language === 'es' ? 'Solicitud para unirse al viaje' : language === 'fr' ? 'Demande pour rejoindre le voyage' : language === 'de' ? 'Anfrage zur Teilnahme an der Reise' : language === 'it' ? 'Richiesta di unirsi al viaggio' : 'Request to Join Trip'}
            </DialogTitle>
            <DialogDescription>
              {language === 'he' 
                ? 'ספר למארגן מעט על עצמך או שאל שאלות על הטיול'
                : language === 'ru' ? 'Расскажите организатору о себе или задайте вопросы о поездке'
                : language === 'es' ? 'Cuéntale al organizador sobre ti o haz preguntas sobre el viaje'
                : language === 'fr' ? 'Parlez de vous à l\'organisateur ou posez des questions sur le voyage'
                : language === 'de' ? 'Erzählen Sie dem Organisator über sich oder stellen Sie Fragen zur Reise'
                : language === 'it' ? 'Racconta all\'organizzatore di te o fai domande sul viaggio'
                : 'Tell the organizer about yourself or ask questions about the trip'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>
                {language === 'he' ? 'הודעה למארגן (אופציונלי)' : language === 'ru' ? 'Сообщение организатору (необязательно)' : language === 'es' ? 'Mensaje al organizador (opcional)' : language === 'fr' ? 'Message à l\'organisateur (optionnel)' : language === 'de' ? 'Nachricht an Organisator (optional)' : language === 'it' ? 'Messaggio all\'organizzatore (opzionale)' : 'Message to organizer (optional)'}
              </Label>
              <Textarea
                value={joinMessage}
                onChange={(e) => setJoinMessage(e.target.value)}
                placeholder={language === 'he' 
                  ? 'לדוגמה: שלום, אני בעל ניסיון בטיולים בדרום. יש לכם עוד מקום לאדם נוסף?'
                  : language === 'ru' ? 'напр., Привет, у меня есть опыт походов на юге. Есть место для ещё одного?'
                  : language === 'es' ? 'ej., Hola, tengo experiencia haciendo senderismo en el sur. ¿Tienen espacio para uno más?'
                  : language === 'fr' ? 'ex., Salut, j\'ai de l\'expérience en randonnée dans le sud. Avez-vous de la place pour une personne de plus?'
                  : language === 'de' ? 'z.B. Hallo, ich habe Erfahrung im Wandern im Süden. Haben Sie noch Platz für eine Person?'
                  : language === 'it' ? 'es., Ciao, ho esperienza in escursioni al sud. Avete spazio per un\'altra persona?'
                  : 'e.g., Hi, I have experience hiking in the south. Do you have room for one more?'}
                rows={4}
                dir={language === 'he' ? 'rtl' : 'ltr'}
              />
            </div>

            <div className="space-y-2">
              <Label>
                {t('myAccessibilityNeeds')} ({language === 'he' ? 'אופציונלי' : language === 'ru' ? 'необязательно' : language === 'es' ? 'opcional' : language === 'fr' ? 'optionnel' : language === 'de' ? 'optional' : language === 'it' ? 'opzionale' : 'optional'})
              </Label>
              <div className="flex flex-wrap gap-2">
                {accessibilityTypes.map(type => (
                  <Badge
                    key={type}
                    variant={accessibilityNeeds.includes(type) ? 'default' : 'outline'}
                    className={`cursor-pointer transition-all ${
                      accessibilityNeeds.includes(type) 
                        ? 'bg-purple-600 hover:bg-purple-700' 
                        : 'hover:border-purple-500 hover:text-purple-600'
                    }`}
                    onClick={() => {
                      setAccessibilityNeeds(prev =>
                        prev.includes(type)
                          ? prev.filter(t => t !== type)
                          : [...prev, type]
                      );
                    }}
                  >
                    {t(type)}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowJoinDialog(false);
                setJoinMessage('');
                setAccessibilityNeeds([]);
              }}
            >
              {t('cancel')}
            </Button>
            <Button 
              onClick={handleJoinClick}
              disabled={joinMutation.isLoading}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {joinMutation.isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              {language === 'he' ? 'שלח בקשה' : language === 'ru' ? 'Отправить запрос' : language === 'es' ? 'Enviar solicitud' : language === 'fr' ? 'Envoyer demande' : language === 'de' ? 'Anfrage senden' : language === 'it' ? 'Invia richiesta' : 'Send Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Join Request Notification Dialog */}
      {trip && trip.pending_requests && trip.pending_requests.length > 0 && (
        <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {language === 'he' ? 'בקשה להצטרפות לטיול' : language === 'ru' ? 'Запрос на присоединение' : language === 'es' ? 'Solicitud de unión' : language === 'fr' ? 'Demande de rejoindre' : language === 'de' ? 'Beitrittsanfrage' : language === 'it' ? 'Richiesta di unirsi' : 'Trip Join Request'}
              </DialogTitle>
              <DialogDescription>
                {language === 'he' 
                  ? `בקשה ${currentRequestIndex + 1} מתוך ${trip.pending_requests.length}`
                  : language === 'ru' ? `Запрос ${currentRequestIndex + 1} из ${trip.pending_requests.length}`
                  : language === 'es' ? `Solicitud ${currentRequestIndex + 1} de ${trip.pending_requests.length}`
                  : language === 'fr' ? `Demande ${currentRequestIndex + 1} sur ${trip.pending_requests.length}`
                  : language === 'de' ? `Anfrage ${currentRequestIndex + 1} von ${trip.pending_requests.length}`
                  : language === 'it' ? `Richiesta ${currentRequestIndex + 1} di ${trip.pending_requests.length}`
                  : `Request ${currentRequestIndex + 1} of ${trip.pending_requests.length}`}
              </DialogDescription>
            </DialogHeader>

            {trip.pending_requests[currentRequestIndex] && (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-emerald-100 text-emerald-700">
                        {trip.pending_requests[currentRequestIndex].name?.charAt(0) || 'P'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-lg">{trip.pending_requests[currentRequestIndex].name}</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(new Date(trip.pending_requests[currentRequestIndex].requested_at), 'MMM d, HH:mm', language)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(createPageUrl('Profile') + '?email=' + trip.pending_requests[currentRequestIndex].email)}
                    className="gap-2"
                  >
                    <User className="w-4 h-4" />
                    {language === 'he' ? 'פרופיל' : language === 'ru' ? 'Профиль' : language === 'es' ? 'Perfil' : language === 'fr' ? 'Profil' : language === 'de' ? 'Profil' : language === 'it' ? 'Profilo' : 'Profile'}
                  </Button>
                </div>

                {trip.pending_requests[currentRequestIndex].message && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start gap-2 mb-1">
                      <MessageCircle className="w-4 h-4 text-gray-500 mt-0.5" />
                      <span className="text-sm font-medium text-gray-700">
                        {language === 'he' ? 'הודעה' : language === 'ru' ? 'Сообщение' : language === 'es' ? 'Mensaje' : language === 'fr' ? 'Message' : language === 'de' ? 'Nachricht' : language === 'it' ? 'Messaggio' : 'Message'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 italic">
                      "{trip.pending_requests[currentRequestIndex].message}"
                    </p>
                  </div>
                )}

                {trip.pending_requests[currentRequestIndex].accessibility_needs && 
                 trip.pending_requests[currentRequestIndex].accessibility_needs.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      {t('accessibilityNeeds')}
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {trip.pending_requests[currentRequestIndex].accessibility_needs.map((need, i) => (
                        <Badge key={i} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          {t(need)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <DialogFooter className="sm:justify-between gap-2">
              <Button 
                variant="outline"
                onClick={() => setShowRequestDialog(false)}
                disabled={approveMutation.isLoading || rejectMutation.isLoading}
              >
                {language === 'he' ? 'סגור' : language === 'ru' ? 'Закрыть' : language === 'es' ? 'Cerrar' : language === 'fr' ? 'Fermer' : language === 'de' ? 'Schließen' : language === 'it' ? 'Chiudi' : 'Close'}
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => rejectMutation.mutate(trip.pending_requests[currentRequestIndex].email)}
                  disabled={approveMutation.isLoading || rejectMutation.isLoading}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <X className="w-4 h-4 mr-2" />
                  {language === 'he' ? 'דחה' : language === 'ru' ? 'Отклонить' : language === 'es' ? 'Rechazar' : language === 'fr' ? 'Rejeter' : language === 'de' ? 'Ablehnen' : language === 'it' ? 'Rifiuta' : 'Reject'}
                </Button>
                <Button
                  onClick={() => approveMutation.mutate(trip.pending_requests[currentRequestIndex].email)}
                  disabled={approveMutation.isLoading || rejectMutation.isLoading}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Check className="w-4 h-4 mr-2" />
                  {language === 'he' ? 'אשר' : language === 'ru' ? 'Одобрить' : language === 'es' ? 'Aprobar' : language === 'fr' ? 'Approuver' : language === 'de' ? 'Genehmigen' : language === 'it' ? 'Approva' : 'Approve'}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Share Dialog */}
      <ShareDialog
        trip={trip}
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        isOrganizer={isOrganizer}
      />

      {/* Participant Waiver */}
      <ParticipantWaiver
        open={showWaiver}
        onAccept={handleWaiverAccept}
        onDecline={handleWaiverDecline}
        tripTitle={title}
      />

      {/* Navigation Choice Dialog */}
      <Dialog open={showNavigationDialog} onOpenChange={setShowNavigationDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              {language === 'he' ? 'בחר אפליקציית ניווט' : 'Choose Navigation App'}
            </DialogTitle>
            <DialogDescription className="text-center">
              {language === 'he' 
                ? 'איך תרצה לנווט ליעד?'
                : 'How would you like to navigate to the destination?'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 py-4">
            <Button
              onClick={() => {
                const wazeUrl = `https://waze.com/ul?ll=${trip.latitude},${trip.longitude}&navigate=yes`;
                window.open(wazeUrl, '_blank');
                setShowNavigationDialog(false);
              }}
              className="h-24 flex flex-col gap-2 bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
            >
              <div className="text-3xl">🚗</div>
              <span className="font-semibold">Waze</span>
            </Button>
            
            <Button
              onClick={() => {
                const googleUrl = `https://www.google.com/maps/dir/?api=1&destination=${trip.latitude},${trip.longitude}`;
                window.open(googleUrl, '_blank');
                setShowNavigationDialog(false);
              }}
              className="h-24 flex flex-col gap-2 bg-gradient-to-br from-red-500 to-yellow-500 hover:from-red-600 hover:to-yellow-600"
            >
              <div className="text-3xl">🗺️</div>
              <span className="font-semibold">Google Maps</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      </div>
      );
      }