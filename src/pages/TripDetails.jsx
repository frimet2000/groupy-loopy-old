// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
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
import InviteFriends from '../components/collaboration/InviteFriends';
import TrekDaysDisplay from '../components/trek/TrekDaysDisplay';
import TrekDaySelector from '../components/trek/TrekDaySelector';
import ProfilePreviewDialog from '../components/profile/ProfilePreviewDialog';
import ParticipantStats from '../components/participants/ParticipantStats';
import EditParticipantDialog from '../components/participants/EditParticipantDialog';
import JoinTripDialog from '../components/dialogs/JoinTripDialog';
import { SEO } from '@/components/SEO';
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
  DialogTitle } from
"@/components/ui/dialog";
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
  Info, GalleryHorizontal, Heart, MessageSquare, Radio, Backpack, Bookmark, DollarSign, Image, Loader2, Camera, Upload, Bell, Package, UserPlus, FileText, Shield, AlertTriangle, Settings, Eye, EyeOff } from
'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const difficultyColors = {
  easy: 'bg-green-100 text-green-700 border-green-200',
  moderate: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  challenging: 'bg-orange-100 text-orange-700 border-orange-200',
  hard: 'bg-red-100 text-red-700 border-red-200'
};

const trailIcons = {
  water: Droplets,
  forest: TreePine,
  desert: Sun,
  historical: History,
  urban: Building
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
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [selectedTrekDays, setSelectedTrekDays] = useState([]);
  const [showAddOrganizerDialog, setShowAddOrganizerDialog] = useState(false);
  const [newOrganizerEmail, setNewOrganizerEmail] = useState('');
  const [selectedEquipmentDay, setSelectedEquipmentDay] = useState(0);
  const [familyMembers, setFamilyMembers] = useState({
    me: true,
    spouse: false,
    pets: false,
    other: false
  });
  const [selectedChildren, setSelectedChildren] = useState([]);
  const [otherMemberName, setOtherMemberName] = useState('');
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [selectedProfileEmail, setSelectedProfileEmail] = useState(null);
  const [showEditParticipantDialog, setShowEditParticipantDialog] = useState(false);
  const [showTabSettingsDialog, setShowTabSettingsDialog] = useState(false);
  const [hiddenTabs, setHiddenTabs] = useState([]);

  // Calculate age from birth date (only for adults with date format)
  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    // If it's an age range (e.g., "3-6", "18-25"), return it as is
    if (typeof birthDate === 'string' && birthDate.includes('-')) {
      return birthDate;
    }
    const today = new Date();
    const birth = new Date(birthDate);
    // Check if valid date
    if (isNaN(birth.getTime())) return birthDate;
    const age = today.getFullYear() - birth.getFullYear();
    return age;
  };

  const accessibilityTypes = ['wheelchair', 'visual_impairment', 'hearing_impairment', 'mobility_aid', 'stroller_friendly', 'elderly_friendly'];

  const urlParams = new URLSearchParams(window.location.search);
  const tripId = urlParams.get('id');

  // State for active tab - must be declared before useQuery that uses it
  const [activeTab, setActiveTab] = useState('details');

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

  // Scroll to top when trip changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [tripId]);

  const { data: trip, isLoading, error } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: async () => {
      const trips = await base44.entities.Trip.filter({ id: tripId });
      return trips[0];
    },
    enabled: !!tripId,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
    staleTime: 30000,
    refetchInterval: activeTab === 'chat' ? 5000 : false // Only refetch when in chat tab
  });

  // Fetch user profiles for all participants to show updated names and family info
  // Available to everyone viewing the trip - uses backend function with service role
  const allProfileEmails = React.useMemo(() => {
    if (!trip) return [];
    const participantEmails = (trip.participants || []).map((p) => p.email);
    const organizerEmails = [trip.organizer_email, ...(trip.additional_organizers || []).map((o) => o.email)];
    const set = new Set([...participantEmails, ...organizerEmails].filter(Boolean));
    return Array.from(set);
  }, [trip]);

  const { data: userProfiles = {} } = useQuery({
    queryKey: ['userProfiles', allProfileEmails.join(',')],
    queryFn: async () => {
      if (!allProfileEmails.length) return {};
      const response = await base44.functions.invoke('getUserProfiles', { emails: allProfileEmails });
      return response.data.profiles || {};
    },
    enabled: allProfileEmails.length > 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
    staleTime: 60000
  });

  // Open chat tab if hash is #chat
  useEffect(() => {
    if (window.location.hash === '#chat' && trip) {
      setActiveTab('chat');
    }
  }, [trip, window.location.hash]);

  const isOrganizer = user?.email === trip?.organizer_email;
  const isAdditionalOrganizer = trip?.additional_organizers?.some((o) => o.email === user?.email);
  const canEdit = isOrganizer || isAdditionalOrganizer;
  const hasJoined = trip?.participants?.some((p) => p.email === user?.email);
  const hasPendingRequest = trip?.pending_requests?.some((r) => r.email === user?.email);
  const isFull = !trip?.flexible_participants && trip?.current_participants >= trip?.max_participants;
  const isIsraelTrailTrip = trip?.title?.includes('שביל ישראל') || trip?.tags?.includes('shvil_israel');

  // Sync hidden tabs when trip loads
  useEffect(() => {
    if (trip?.hidden_tabs) {
      setHiddenTabs(trip.hidden_tabs);
    }
  }, [trip?.id, trip?.hidden_tabs]);

  // Track view
  useEffect(() => {
    const trackView = async () => {
      if (!trip || !user) return;

      const hasViewed = trip.views?.some((v) => v.email === user.email);
      if (!hasViewed) {
        const updatedViews = [
        ...(trip.views || []),
        { email: user.email, timestamp: new Date().toISOString() }];

        await base44.entities.Trip.update(trip.id, { views: updatedViews });
      }
    };

    trackView();
  }, [trip?.id, user?.email]);

  // Show pending requests dialog for organizer
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'join') {
      setShowJoinDialog(true);
    }
  }, []);

  useEffect(() => {
    if (trip && user && isOrganizer && trip.pending_requests?.length > 0 && !showRequestDialog) {
      setShowRequestDialog(true);
      setCurrentRequestIndex(0);
    }
  }, [trip, isOrganizer]);

  const handleJoinClick = async () => {
    // Check if user is logged in
    if (!user) {
      toast.info(language === 'he' ? 'יש להתחבר כדי להצטרף לטיול' : 'Please login to join the trip');
      base44.auth.redirectToLogin(window.location.href);
      return;
    }

    // Check if registration is open
    if (trip.registration_start_date) {
      const registrationOpens = new Date(trip.registration_start_date);
      const now = new Date();

      if (now < registrationOpens) {
        toast.error(
          language === 'he' ?
          `ההרשמה תפתח ב-${registrationOpens.toLocaleDateString('he-IL', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}` :
          `Registration opens on ${registrationOpens.toLocaleDateString('en-US', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`
        );
        return;
      }
    }

    // Join directly without waiver
    joinMutation.mutate();
  };

  const handleRequestReminder = async () => {
    if (!user) {
      base44.auth.redirectToLogin(window.location.href);
      return;
    }

    try {
      const userName = user.first_name && user.last_name ?
      `${user.first_name} ${user.last_name}` :
      user.full_name;

      const updatedReminders = [
      ...(trip.registration_reminders || []),
      {
        email: user.email,
        name: userName,
        requested_at: new Date().toISOString()
      }];


      await base44.entities.Trip.update(tripId, {
        registration_reminders: updatedReminders
      });

      queryClient.invalidateQueries(['trip', tripId]);
      toast.success(
        language === 'he' ?
        'תקבל תזכורת כשההרשמה תיפתח' :
        'You will receive a reminder when registration opens'
      );
    } catch (error) {
      toast.error(language === 'he' ? 'שגיאה בבקשת תזכורת' : 'Error requesting reminder');
    }
  };

  const joinMutation = useMutation({
    mutationFn: async () => {
      const userName = user.first_name && user.last_name ?
      `${user.first_name} ${user.last_name}` :
      user.full_name;

      console.log('=== JOIN MUTATION START ===');
      console.log('User:', userName, user.email);
      console.log('Family Members:', familyMembers);
      console.log('Selected Children:', selectedChildren);
      console.log('Other Member Name:', otherMemberName);

      // For treks, validate day selection
      if (trip.activity_type === 'trek' && selectedTrekDays.length === 0) {
        throw new Error(language === 'he' ? 'נא לבחור לפחות יום אחד' : 'Please select at least one day');
      }

      // Build family members info
      const familyInfo = [];
      if (familyMembers.spouse) familyInfo.push(language === 'he' ? 'בן/בת זוג' : 'Spouse');
      if (selectedChildren.length > 0) {
        familyInfo.push(`${selectedChildren.length} ${language === 'he' ? 'ילדים' : 'children'}`);
      }
      if (familyMembers.pets) familyInfo.push(language === 'he' ? 'בעלי חיים' : 'Pets');
      if (familyMembers.other && otherMemberName) familyInfo.push(otherMemberName);

      const familyMessage = familyInfo.length > 0 ?
      `\n${language === 'he' ? 'מצטרפים:' : 'Joining:'} ${familyInfo.join(', ')}` :
      '';
      const fullMessage = joinMessage + familyMessage;

      // Calculate total people joining (excluding pets)
      let totalPeopleJoining = 1; // User themselves
      if (familyMembers.spouse) totalPeopleJoining++;
      if (selectedChildren.length > 0) totalPeopleJoining += selectedChildren.length;
      if (familyMembers.other && otherMemberName) totalPeopleJoining++;
      // Note: pets are not counted in total people

      console.log('Total People Joining:', totalPeopleJoining);
      console.log('Family Message:', familyMessage);

      // Get parent age range from user profile
      const parentAgeRange = user.parent_age_range || user.age_range;

      // Build children details snapshot from current user's profile
      const toRange = (a) => {
        if (a == null || isNaN(a)) return null;
        if (a < 3) return '0-2';
        if (a < 7) return '3-6';
        if (a < 11) return '7-10';
        if (a < 15) return '11-14';
        if (a < 19) return '15-18';
        if (a < 22) return '18-21';
        return '21+';
      };
      let myKids = Array.isArray(user.children_age_ranges) && user.children_age_ranges.length > 0 ?
      user.children_age_ranges :
      Array.isArray(user.children_birth_dates) ? user.children_birth_dates.map((c) => ({ id: c.id, name: c.name, age_range: toRange((() => {// derive age
          const d = new Date(c.birth_date);
          if (isNaN(d.getTime())) return null;
          const today = new Date();
          let age = today.getFullYear() - d.getFullYear();
          const m = today.getMonth() - d.getMonth();
          if (m < 0 || m === 0 && today.getDate() < d.getDate()) age--;
          return age;
        })()), gender: c.gender })) : [];
      // Normalize IDs so each child has a stable identifier
      myKids = (myKids || []).map((k, i) => ({ ...k, id: k?.id || `idx_${i}` }));
      const selSet = new Set(selectedChildren || []);
      const childrenDetails = myKids.filter((k) => selSet.has(k.id)).map((k) => ({ id: k.id, name: k.name, age_range: k.age_range, gender: k.gender }));

      // Check if approval is needed:
      // 1. approval_required is true, OR
      // 2. flexible participants enabled AND exceeding max capacity
      const needsApproval = trip.approval_required === true ||
      trip.flexible_participants && trip.current_participants >= trip.max_participants;

      if (!needsApproval) {
        const participantData = {
          email: user.email,
          name: userName,
          joined_at: new Date().toISOString(),
          accessibility_needs: accessibilityNeeds,
          waiver_accepted: true,
          waiver_timestamp: new Date().toISOString(),
          family_members: familyMembers,
          selected_children: selectedChildren,
          other_member_name: otherMemberName,
          total_people: totalPeopleJoining,
          children_details: childrenDetails,
          parent_age_range: parentAgeRange
        };

        console.log('Participant Data Being Saved:', participantData);

        const updatedParticipants = [
        ...(trip.participants || []),
        participantData];


        // Calculate total participants across all families
        const totalParticipantsCount = updatedParticipants.reduce((sum, p) => sum + (p.total_people || 1), 0);

        const updateData = {
          participants: updatedParticipants,
          current_participants: totalParticipantsCount
        };

        // For treks, add selected days
        if (trip.activity_type === 'trek') {
          const updatedSelectedDays = [
          ...(trip.participants_selected_days || []),
          {
            email: user.email,
            name: userName,
            days: selectedTrekDays
          }];

          updateData.participants_selected_days = updatedSelectedDays;
        }

        console.log('=== UPDATE DATA BEING SENT ===');
        console.log(JSON.stringify(updateData, null, 2));

        const result = await base44.entities.Trip.update(tripId, updateData);

        console.log('=== UPDATE RESULT ===');
        console.log(JSON.stringify(result, null, 2));

        return { autoJoined: true };
      }

      // Otherwise, add to pending requests
      const updatedPendingRequests = [
      ...(trip.pending_requests || []),
      {
        email: user.email,
        name: userName,
        requested_at: new Date().toISOString(),
        message: fullMessage,
        accessibility_needs: accessibilityNeeds,
        waiver_accepted: false,
        waiver_timestamp: null,
        selected_days: trip.activity_type === 'trek' ? selectedTrekDays : [],
        family_members: familyMembers,
        selected_children: selectedChildren,
        other_member_name: otherMemberName,
        children_details: childrenDetails,
        parent_age_range: parentAgeRange
      }];


      // Update trip immediately - this is the only blocking operation
      await base44.entities.Trip.update(tripId, {
        pending_requests: updatedPendingRequests
      });

      // Send email and notification in background (non-blocking)
      const title = trip.title || trip.title_he || trip.title_en;
      const fullUserName = userName;
      const emailBody = language === 'he' ?
      `שלום ${trip.organizer_name},\n\n${fullUserName} מבקש להצטרף לטיול "${title}" שלך.${joinMessage ? `\n\nהודעה מהמשתתף:\n"${joinMessage}"` : ''}\n\nהיכנס לעמוד הטיול כדי לאשר או לדחות את הבקשה.\n\nבברכה,\nצוות TripMate` :
      `Hello ${trip.organizer_name},\n\n${fullUserName} has requested to join your trip "${title}".${joinMessage ? `\n\nMessage from participant:\n"${joinMessage}"` : ''}\n\nVisit the trip page to approve or reject the request.\n\nBest regards,\nTripMate Team`;

      // Fire and forget - don't await these
      base44.integrations.Core.SendEmail({
        to: trip.organizer_email,
        subject: language === 'he' ?
        `בקשה להצטרפות לטיול "${title}"` :
        `Join request for trip "${title}"`,
        body: emailBody
      }).catch((err) => console.log('Email error:', err));

      base44.functions.invoke('sendPushNotification', {
        recipient_email: trip.organizer_email,
        notification_type: 'join_requests',
        title: language === 'he' ? 'בקשה להצטרפות חדשה' : 'New Join Request',
        body: language === 'he' ?
        `${fullUserName} מבקש להצטרף לטיול "${title}"` :
        `${fullUserName} requested to join "${title}"`
      }).catch((err) => console.log('Notification error:', err));
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries(['trip', tripId]);
      setJoinMessage('');
      setAccessibilityNeeds([]);
      setSelectedTrekDays([]);
      setFamilyMembers({ me: true, spouse: false, pets: false, other: false });
      setSelectedChildren([]);
      setOtherMemberName('');
      setShowJoinDialog(false);

      if (result?.autoJoined) {
        // Track conversion for auto-join
        if (window.gtag) {
          window.gtag('event', 'conversion', {'send_to': 'AW-17752551436/7_p1CJDNw9sbEIzgiZFC'});
        }
        toast.success(language === 'he' ? 'הצטרפת לטיול!' : language === 'ru' ? 'Вы присоединились!' : language === 'es' ? '¡Te has unido!' : language === 'fr' ? 'Vous avez rejoint!' : language === 'de' ? 'Sie sind beigetreten!' : language === 'it' ? 'Ti sei unito!' : 'You have joined!');
      } else {
        toast.success(language === 'he' ? 'הבקשה נשלחה למארגן' : language === 'ru' ? 'Запрос отправлен организатору' : language === 'es' ? 'Solicitud enviada al organizador' : language === 'fr' ? 'Demande envoyée à l\'organisateur' : language === 'de' ? 'Anfrage an Organisator gesendet' : language === 'it' ? 'Richiesta inviata all\'organizzatore' : 'Request sent to organizer');
      }
    },
    onError: (error) => {
      toast.error(error.message || (language === 'he' ? 'שגיאה בהצטרפות' : 'Error joining'));
    }
  });

  const leaveMutation = useMutation({
    mutationFn: async () => {
      const updatedParticipants = (trip.participants || []).filter(
        (p) => p.email !== user.email
      );
      // Recalculate total participants
      const totalParticipantsCount = updatedParticipants.reduce((sum, p) => sum + (p.total_people || 1), 0);
      await base44.entities.Trip.update(tripId, {
        participants: updatedParticipants,
        current_participants: totalParticipantsCount
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['trip', tripId]);
      toast.success(t('leftTrip'));
    }
  });

  const approveMutation = useMutation({
    mutationFn: async (requestEmail) => {
      const request = trip.pending_requests.find((r) => r.email === requestEmail);
      const updatedPendingRequests = trip.pending_requests.filter((r) => r.email !== requestEmail);

      // Calculate total people joining for this request (excluding pets)
      let totalPeopleJoining = 1; // User themselves
      if (request.family_members?.spouse) totalPeopleJoining++;
      if (request.selected_children?.length > 0) totalPeopleJoining += request.selected_children.length;
      if (request.family_members?.other && request.other_member_name) totalPeopleJoining++;
      // Note: pets are not counted in total people

      const updatedParticipants = [
      ...(trip.participants || []),
      {
        email: request.email,
        name: request.name,
        joined_at: new Date().toISOString(),
        accessibility_needs: request.accessibility_needs || [],
        waiver_accepted: request.waiver_accepted || false,
        waiver_timestamp: request.waiver_timestamp || new Date().toISOString(),
        family_members: request.family_members,
        selected_children: request.selected_children,
        other_member_name: request.other_member_name,
        total_people: totalPeopleJoining,
        children_details: request.children_details || [],
        parent_age_range: request.parent_age_range
      }];


      // Calculate total participants across all families
      const totalParticipantsCount = updatedParticipants.reduce((sum, p) => sum + (p.total_people || 1), 0);

      const updateData = {
        pending_requests: updatedPendingRequests,
        participants: updatedParticipants,
        current_participants: totalParticipantsCount
      };

      // For treks, add selected days
      if (trip.activity_type === 'trek' && request.selected_days) {
        const updatedSelectedDays = [
        ...(trip.participants_selected_days || []),
        {
          email: request.email,
          name: request.name,
          days: request.selected_days
        }];

        updateData.participants_selected_days = updatedSelectedDays;
      }

      await base44.entities.Trip.update(tripId, updateData);

      // Send approval email and notification
      const title = trip.title || trip.title_he || trip.title_en;
      await base44.integrations.Core.SendEmail({
        to: requestEmail,
        subject: language === 'he' ?
        `בקשתך להצטרפות לטיול "${title}" אושרה` :
        `Your request to join "${title}" was approved`,
        body: language === 'he' ?
        `שלום ${request.name},\n\nבקשתך להצטרף לטיול "${title}" אושרה על ידי המארגן.\n\nמקווים שתהנה מהטיול!\n\nבברכה,\nצוות TripMate` :
        `Hello ${request.name},\n\nYour request to join "${title}" has been approved by the organizer.\n\nHope you enjoy the trip!\n\nBest regards,\nTripMate Team`
      });

      // Send push notification
      try {
        await base44.functions.invoke('sendPushNotification', {
          recipient_email: requestEmail,
          notification_type: 'trip_updates',
          title: language === 'he' ? 'בקשתך אושרה!' : 'Your request approved!',
          body: language === 'he' ?
          `בקשתך להצטרף לטיול "${title}" אושרה` :
          `Your request to join "${title}" was approved`
        });
      } catch (error) {
        console.log('Notification error:', error);
      }
    },
    onSuccess: () => {
      // Track conversion for approval
      if (window.gtag) {
        window.gtag('event', 'conversion', {'send_to': 'AW-17752551436/7_p1CJDNw9sbEIzgiZFC'});
      }
      queryClient.invalidateQueries(['trip', tripId]);
      toast.success(language === 'he' ? 'הבקשה אושרה' : language === 'ru' ? 'Запрос одобрен' : language === 'es' ? 'Solicitud aprobada' : language === 'fr' ? 'Demande approuvée' : language === 'de' ? 'Anfrage genehmigt' : language === 'it' ? 'Richiesta approvata' : 'Request approved');

      // Show next request if exists
      if (currentRequestIndex < trip.pending_requests.length - 1) {
        setCurrentRequestIndex((prev) => prev + 1);
      } else {
        setShowRequestDialog(false);
      }
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async (requestEmail) => {
      const request = trip.pending_requests.find((r) => r.email === requestEmail);
      const updatedPendingRequests = trip.pending_requests.filter((r) => r.email !== requestEmail);

      await base44.entities.Trip.update(tripId, {
        pending_requests: updatedPendingRequests
      });

      // Send rejection email
      const title = trip.title || trip.title_he || trip.title_en;
      await base44.integrations.Core.SendEmail({
        to: requestEmail,
        subject: language === 'he' ?
        `בקשתך להצטרפות לטיול "${title}"` :
        `Your request to join "${title}"`,
        body: language === 'he' ?
        `שלום ${request.name},\n\nמצטערים, בקשתך להצטרף לטיול "${title}" נדחתה על ידי המארגן.\n\nבברכה,\nצוות TripMate` :
        `Hello ${request.name},\n\nSorry, your request to join "${title}" was declined by the organizer.\n\nBest regards,\nTripMate Team`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['trip', tripId]);
      toast.success(language === 'he' ? 'הבקשה נדחתה' : language === 'ru' ? 'Запрос отклонен' : language === 'es' ? 'Solicitud rechazada' : language === 'fr' ? 'Demande rejetée' : language === 'de' ? 'Anfrage abgelehnt' : language === 'it' ? 'Richiesta rifiutata' : 'Request declined');

      // Show next request if exists
      if (currentRequestIndex < trip.pending_requests.length - 1) {
        setCurrentRequestIndex((prev) => prev + 1);
      } else {
        setShowRequestDialog(false);
      }
    }
  });

  const handleShare = async () => {
    setShowShareDialog(true);
  };

  const handleSaveTrip = async () => {
    if (!user) {
      base44.auth.redirectToLogin(window.location.href);
      return;
    }

    const hasSaved = trip.saves?.some((s) => s.email === user.email);

    if (hasSaved) {
      const updatedSaves = trip.saves.filter((s) => s.email !== user.email);
      await base44.entities.Trip.update(trip.id, { saves: updatedSaves });
      toast.success(language === 'he' ? 'הוסר מהשמורים' : language === 'ru' ? 'Удалено из сохраненных' : language === 'es' ? 'Eliminado de guardados' : language === 'fr' ? 'Retiré des enregistrés' : language === 'de' ? 'Von Gespeicherten entfernt' : language === 'it' ? 'Rimosso dai salvati' : 'Removed from saved');
    } else {
      const updatedSaves = [
      ...(trip.saves || []),
      { email: user.email, timestamp: new Date().toISOString() }];

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
    navigate(createPageUrl('EditTrip') + '?id=' + tripId);
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

  const handleAddOrganizer = async () => {
    if (!newOrganizerEmail || !newOrganizerEmail.includes('@')) {
      toast.error(language === 'he' ? 'נא להזין כתובת אימייל תקינה' : 'Please enter a valid email');
      return;
    }

    try {
      const users = await base44.entities.User.list();
      const newOrganizer = users.find((u) => u.email === newOrganizerEmail);

      if (!newOrganizer) {
        toast.error(language === 'he' ? 'משתמש לא נמצא במערכת' : 'User not found');
        return;
      }

      if (trip.organizer_email === newOrganizerEmail) {
        toast.error(language === 'he' ? 'משתמש זה כבר המארגן הראשי' : 'This user is already the main organizer');
        return;
      }

      if (trip.additional_organizers?.some((o) => o.email === newOrganizerEmail)) {
        toast.error(language === 'he' ? 'משתמש זה כבר מארגן' : 'This user is already an organizer');
        return;
      }

      const userName = newOrganizer.first_name && newOrganizer.last_name ?
      `${newOrganizer.first_name} ${newOrganizer.last_name}` :
      newOrganizer.full_name || newOrganizerEmail;

      const updatedOrganizers = [
      ...(trip.additional_organizers || []),
      { email: newOrganizerEmail, name: userName }];


      await base44.entities.Trip.update(tripId, { additional_organizers: updatedOrganizers });

      await base44.integrations.Core.SendEmail({
        to: newOrganizerEmail,
        subject: language === 'he' ? `הוזמנת להיות מארגן בטיול "${trip.title || trip.title_he}"` : `You've been invited as organizer for "${trip.title}"`,
        body: language === 'he' ?
        `שלום ${userName},\n\nהוזמנת להיות מארגן משותף בטיול "${trip.title || trip.title_he}".\n\nכעת תוכל לערוך את פרטי הטיול ולנהל את המשתתפים.\n\nבברכה,\nצוות Groupy Loopy` :
        `Hello ${userName},\n\nYou've been invited as a co-organizer for the trip "${trip.title}".\n\nYou can now edit trip details and manage participants.\n\nBest regards,\nGroupy Loopy Team`
      });

      queryClient.invalidateQueries(['trip', tripId]);
      setShowAddOrganizerDialog(false);
      setNewOrganizerEmail('');
      toast.success(language === 'he' ? 'מארגן נוסף נוסף בהצלחה' : 'Co-organizer added successfully');
    } catch (error) {
      toast.error(language === 'he' ? 'שגיאה בהוספת מארגן' : 'Error adding organizer');
    }
  };

  const handleRemoveOrganizer = async (email) => {
    if (!confirm(language === 'he' ? 'להסיר מארגן זה?' : 'Remove this organizer?')) return;

    try {
      const updatedOrganizers = trip.additional_organizers.filter((o) => o.email !== email);
      await base44.entities.Trip.update(tripId, { additional_organizers: updatedOrganizers });
      queryClient.invalidateQueries(['trip', tripId]);
      toast.success(language === 'he' ? 'מארגן הוסר' : 'Organizer removed');
    } catch (error) {
      toast.error(language === 'he' ? 'שגיאה בהסרת מארגן' : 'Error removing organizer');
    }
  };

  const handleSaveParticipantEdit = async (updatedData) => {
    try {
      const myParticipant = trip.participants.find((p) => p.email === user.email);
      if (!myParticipant) return;

      const updatedParticipants = trip.participants.map((p) =>
      p.email === user.email ?
      { ...p, ...updatedData } :
      p
      );

      // Recalculate total participants
      const totalParticipantsCount = updatedParticipants.reduce((sum, p) => sum + (p.total_people || 1), 0);

      await base44.entities.Trip.update(tripId, {
        participants: updatedParticipants,
        current_participants: totalParticipantsCount
      });

      queryClient.invalidateQueries(['trip', tripId]);
      setShowEditParticipantDialog(false);
      toast.success(language === 'he' ? 'הפרטים עודכנו בהצלחה' : 'Details updated successfully');
    } catch (error) {
      toast.error(language === 'he' ? 'שגיאה בעדכון הפרטים' : 'Error updating details');
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

  const handleSendChatMessage = async ({ content, type, recipient_email, isUrgent }) => {
    setSendingMessage(true);
    try {
      const userName = user.first_name && user.last_name ?
      `${user.first_name} ${user.last_name}` :
      user.full_name;
      const newMessage = {
        id: Date.now().toString(),
        sender_email: user.email,
        sender_name: userName,
        content,
        timestamp: new Date().toISOString(),
        type,
        recipient_email: recipient_email || null,
        isUrgent: isUrgent || false
      };

      const updatedMessages = [...(trip.messages || []), newMessage];
      await base44.entities.Trip.update(tripId, {
        messages: updatedMessages
      });

      queryClient.invalidateQueries(['trip', tripId]);

      // Send notifications to participants (except sender)
      const title = trip.title || trip.title_he || trip.title_en;
      const recipientsList = type === 'private' && recipient_email ?
      [recipient_email] :
      (trip.participants || []).map((p) => p.email).filter((e) => e !== user.email);

      // Persist a copy to the Message inbox for unread counters and Inbox hub
      try {
        await Promise.all(
          recipientsList.map((email) =>
            base44.entities.Message.create({
              sender_email: user.email,
              sender_name: userName,
              recipient_email: email,
              subject: language === 'he' ? `צ'אט טיול: ${trip.title || trip.title_he || trip.title_en || 'Trip'}` : `Trip Chat: ${trip.title || trip.title_en || trip.title_he || 'Trip'}`,
              body: content,
              sent_at: new Date().toISOString(),
              read: false,
              starred: false,
              archived: false
            })
          )
        );
      } catch (e) {
        console.log('Message inbox save error:', e);
      }

      // Create notification records for group messages
      if (type === 'group') {
        const notificationPromises = recipientsList.map((email) =>
        base44.entities.Notification.create({
          recipient_email: email,
          notification_type: 'new_messages',
          title: language === 'he' ? 'הודעה חדשה בצ\'אט הקבוצתי' : 'New message in group chat',
          body: language === 'he' ?
          `${userName} כתב/ה: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}` :
          `${userName} wrote: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
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
            body: language === 'he' ?
            `${userName} שלח/ה הודעה בטיול "${title}"` :
            `${userName} sent a message in "${title}"`
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

  // Event schema for SEO - must be before early returns (Rules of Hooks)
  const eventSchema = useMemo(() => {
    if (!trip) return null;
    const title = trip.title || trip.title_he || trip.title_en;
    const description = trip.description || trip.description_he || trip.description_en;
    const start = trip.date ? new Date(trip.date).toISOString() : undefined;
    return {
      "@context": "https://schema.org",
      "@type": "Event",
      name: title,
      description,
      startDate: start,
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      eventStatus: "https://schema.org/EventScheduled",
      image: trip.image_url ? [trip.image_url] : undefined,
      location: {
        "@type": "Place",
        name: trip.location || "",
        address: trip.location || ""
      },
      organizer: {
        "@type": "Organization",
        name: "Groupy Loopy",
        url: "https://groupyloopy.com/"
      }
    };
  }, [trip]);

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
      </div>);

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
      </div>);

  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32 md:pb-8 overflow-y-auto">
      {eventSchema && <script type="application/ld+json">{JSON.stringify(eventSchema)}</script>}
      <SEO title={trip.title || trip.title_he || trip.title_en} description={trip.description || trip.description_he || trip.description_en} />
      {/* Hero Image */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        <img
          src={trip.image_url || 'https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?w=1920'}
          alt={trip.title || trip.title_he || trip.title_en || 'Trip'}
          className="w-full h-full object-cover" />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full bg-white/90 hover:bg-white"
            onClick={() => navigate(-1)}>

            {isRTL ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
          </Button>
          <div className="flex gap-2">
            {canEdit && !isEditing &&
            <>
                <Button
                variant="secondary"
                className="rounded-full bg-white/90 hover:bg-white gap-2 h-11 px-4 font-semibold shadow-lg border border-gray-200"
                onClick={handleStartEdit}>

                  <Edit className="w-5 h-5" />
                  <span className="hidden sm:inline">
                    {language === 'he' ? 'ערוך' : language === 'ru' ? 'Изменить' : language === 'es' ? 'Editar' : language === 'fr' ? 'Modifier' : language === 'de' ? 'Bearbeiten' : language === 'it' ? 'Modifica' : 'Edit'}
                  </span>
                </Button>
                <Button
                variant="secondary"
                className="rounded-full bg-white/90 hover:bg-white gap-2 h-11 px-4 font-semibold shadow-lg border border-gray-200"
                disabled={uploadingImage}
                onClick={() => document.getElementById('trip-image-gallery').click()}>

                  {uploadingImage ?
                <Loader2 className="w-5 h-5 animate-spin" /> :

                <Upload className="w-5 h-5" />
                }
                  <span className="hidden sm:inline">
                    {language === 'he' ? 'העלה תמונה' : language === 'ru' ? 'Загрузить' : language === 'es' ? 'Subir' : language === 'fr' ? 'Télécharger' : language === 'de' ? 'Hochladen' : language === 'it' ? 'Carica' : 'Upload'}
                  </span>
                </Button>
                <Button
                variant="secondary"
                className="rounded-full bg-white/90 hover:bg-white gap-2 h-11 px-4 font-semibold shadow-lg border border-gray-200 sm:hidden"
                disabled={uploadingImage}
                onClick={() => document.getElementById('trip-image-camera').click()}>

                  {uploadingImage ?
                <Loader2 className="w-5 h-5 animate-spin" /> :

                <Camera className="w-5 h-5" />
                }
                  <span className="hidden sm:inline">
                    {language === 'he' ? 'צלם' : language === 'ru' ? 'Сфотографировать' : language === 'es' ? 'Tomar foto' : language === 'fr' ? 'Prendre' : language === 'de' ? 'Foto' : language === 'it' ? 'Scatta' : 'Photo'}
                  </span>
                </Button>
                <input
                id="trip-image-gallery"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload} />

                <input
                id="trip-image-camera"
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleImageUpload} />

              </>
            }
            {canEdit && isEditing &&
            <div className="flex gap-2">
                <Button
                variant="secondary"
                className="rounded-full bg-white/90 hover:bg-white"
                onClick={handleCancelEdit}>

                  <X className="w-4 h-4 mr-1" />
                  {language === 'he' ? 'ביטול' : language === 'ru' ? 'Отмена' : language === 'es' ? 'Cancelar' : language === 'fr' ? 'Annuler' : language === 'de' ? 'Abbrechen' : language === 'it' ? 'Annulla' : 'Cancel'}
                </Button>
                <Button
                className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={handleSaveEdit}>

                  <Check className="w-4 h-4 mr-1" />
                  {language === 'he' ? 'שמור' : language === 'ru' ? 'Сохранить' : language === 'es' ? 'Guardar' : language === 'fr' ? 'Enregistrer' : language === 'de' ? 'Speichern' : language === 'it' ? 'Salva' : 'Save'}
                </Button>
              </div>
            }
            {!isEditing &&
            <>
                {user &&
              <Button
              variant="secondary"
              className={`rounded-full bg-white/90 hover:bg-white gap-2 h-11 px-4 font-semibold shadow-lg ${
              trip.saves?.some((s) => s.email === user.email) ? 'text-emerald-600 border-2 border-emerald-200' : 'border border-gray-200'}`
              }
              onClick={handleSaveTrip}>

                  <Bookmark className={`w-5 h-5 ${
              trip.saves?.some((s) => s.email === user.email) ? 'fill-current' : ''}`
              } />
                  <span className="hidden sm:inline">
                    {trip.saves?.some((s) => s.email === user.email) 
                      ? (language === 'he' ? 'נשמר' : language === 'ru' ? 'Сохранено' : language === 'es' ? 'Guardado' : language === 'fr' ? 'Enregistré' : language === 'de' ? 'Gespeichert' : language === 'it' ? 'Salvato' : 'Saved')
                      : (language === 'he' ? 'שמור' : language === 'ru' ? 'Сохранить' : language === 'es' ? 'Guardar' : language === 'fr' ? 'Enregistrer' : language === 'de' ? 'Speichern' : language === 'it' ? 'Salva' : 'Save')}
                  </span>
                </Button>
              }
              <Button
              variant="secondary"
              className="rounded-full bg-white/90 hover:bg-white gap-2 h-11 px-4 font-semibold shadow-lg border border-gray-200"
              onClick={handleShare}>

                <Share2 className="w-5 h-5" />
                <span className="hidden sm:inline">
                  {language === 'he' ? 'שתף' : language === 'ru' ? 'Поделиться' : language === 'es' ? 'Compartir' : language === 'fr' ? 'Partager' : language === 'de' ? 'Teilen' : language === 'it' ? 'Condividi' : 'Share'}
                </span>
              </Button>
              </>
            }
          </div>
        </div>

        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge className={`${difficultyColors[trip.difficulty]} border`}>
              {t(trip.difficulty)}
            </Badge>
            {trip.pets_allowed &&
            <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                <Dog className="w-3 h-3 mr-1" /> {t('petsAllowed')}
              </Badge>
            }
            {trip.camping_available &&
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                <Tent className="w-3 h-3 mr-1" /> {t('campingAvailable')}
              </Badge>
            }
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            {trip.title || trip.title_he || trip.title_en}
            {trip.flexible_participants &&
            <Badge variant="outline" className="ml-3 bg-white/20 backdrop-blur-sm text-white border-white/40 text-sm">
                {language === 'he' ? 'מספר משתתפים גמיש' : 'Flexible'}
              </Badge>
            }
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 -mt-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}>

          {/* Action Card */}
          <Card className="mb-6 shadow-2xl border-0 bg-gradient-to-br from-white via-gray-50 to-white overflow-visible relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5 pointer-events-none" />
            <CardContent className="p-4 sm:p-8 relative min-h-[120px]">
              {isEditing ?
              <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>{language === 'he' ? 'כותרת' : language === 'ru' ? 'Название' : language === 'es' ? 'Título' : language === 'fr' ? 'Titre' : language === 'de' ? 'Titel' : language === 'it' ? 'Titolo' : 'Title'}</Label>
                    <Input
                    value={editData.title}
                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                    dir={isRTL ? 'rtl' : 'ltr'} />

                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'he' ? 'תיאור' : language === 'ru' ? 'Описание' : language === 'es' ? 'Descripción' : language === 'fr' ? 'Description' : language === 'de' ? 'Beschreibung' : language === 'it' ? 'Descrizione' : 'Description'}</Label>
                    <Textarea
                    value={editData.description || ''}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    dir={isRTL ? 'rtl' : 'ltr'}
                    rows={3} />

                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('country')}</Label>
                      <Select value={editData.country} onValueChange={(v) => setEditData({ ...editData, country: v, region: '', sub_region: '' })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {getAllCountries().map((c) =>
                        <SelectItem key={c} value={c}>{t(c)}</SelectItem>
                        )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{language === 'he' ? 'אזור' : language === 'ru' ? 'Регион' : language === 'es' ? 'Región' : language === 'fr' ? 'Région' : language === 'de' ? 'Region' : language === 'it' ? 'Regione' : 'Region'}</Label>
                      <Input
                      value={editData.region}
                      onChange={(e) => setEditData({ ...editData, region: e.target.value })}
                      placeholder={language === 'he' ? 'אזור/מחוז' : language === 'ru' ? 'Регион/Штат' : language === 'es' ? 'Región/Estado' : language === 'fr' ? 'Région/État' : language === 'de' ? 'Region/Bundesland' : language === 'it' ? 'Regione/Stato' : 'Region/State'} />

                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>{language === 'he' ? 'תאריך' : language === 'ru' ? 'Дата' : language === 'es' ? 'Fecha' : language === 'fr' ? 'Date' : language === 'de' ? 'Datum' : language === 'it' ? 'Data' : 'Date'}</Label>
                      <Input
                      type="date"
                      value={editData.date}
                      onChange={(e) => setEditData({ ...editData, date: e.target.value })} />

                    </div>
                    <div className="space-y-2">
                      <Label>{language === 'he' ? 'שעת התכנסות' : language === 'ru' ? 'Время встречи' : language === 'es' ? 'Hora de encuentro' : language === 'fr' ? 'Heure de rendez-vous' : language === 'de' ? 'Treffpunkt Zeit' : language === 'it' ? 'Orario ritrovo' : 'Meeting Time'}</Label>
                      <Input
                      type="time"
                      value={editData.meeting_time || ''}
                      onChange={(e) => setEditData({ ...editData, meeting_time: e.target.value })} />

                    </div>
                    <div className="space-y-2">
                      <Label>{language === 'he' ? 'מיקום' : language === 'ru' ? 'Местоположение' : language === 'es' ? 'Ubicación' : language === 'fr' ? 'Emplacement' : language === 'de' ? 'Standort' : language === 'it' ? 'Posizione' : 'Location'}</Label>
                      <Input
                      value={editData.location}
                      onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                      dir={isRTL ? 'rtl' : 'ltr'} />

                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('activityType')}</Label>
                      <Select value={editData.activity_type} onValueChange={(v) => setEditData({ ...editData, activity_type: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {activityTypes.map((type) =>
                        <SelectItem key={type} value={type}>{t(type)}</SelectItem>
                        )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{language === 'he' ? 'רמת קושי' : 'Difficulty'}</Label>
                      <Select value={editData.difficulty} onValueChange={(v) => setEditData({ ...editData, difficulty: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {difficulties.map((d) =>
                        <SelectItem key={d} value={d}>{t(d)}</SelectItem>
                        )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {editData.activity_type === 'cycling' &&
                <>
                      <Separator />
                      <div className="space-y-4">
                        <Label className="text-base font-semibold">{language === 'he' ? 'פרטי רכיבה' : language === 'ru' ? 'Детали велосипеда' : language === 'es' ? 'Detalles de ciclismo' : language === 'fr' ? 'Détails du cyclisme' : language === 'de' ? 'Radfahren Details' : language === 'it' ? 'Dettagli ciclismo' : 'Cycling Details'}</Label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>{t('cyclingType')}</Label>
                            <Select value={editData.cycling_type} onValueChange={(v) => setEditData({ ...editData, cycling_type: v })}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {cyclingTypes.map((type) =>
                            <SelectItem key={type} value={type}>{t(type)}</SelectItem>
                            )}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>{t('cyclingDistance')}</Label>
                            <Input
                          type="number"
                          value={editData.cycling_distance || ''}
                          onChange={(e) => setEditData({ ...editData, cycling_distance: parseInt(e.target.value) || null })}
                          placeholder="50" />

                          </div>
                          <div className="space-y-2">
                            <Label>{t('cyclingElevation')}</Label>
                            <Input
                          type="number"
                          value={editData.cycling_elevation || ''}
                          onChange={(e) => setEditData({ ...editData, cycling_elevation: parseInt(e.target.value) || null })}
                          placeholder="500" />

                          </div>
                        </div>
                      </div>
                    </>
                }

                  {editData.activity_type === 'offroad' &&
                <>
                      <Separator />
                      <div className="space-y-4">
                        <Label className="text-base font-semibold">{language === 'he' ? 'פרטי שטח' : language === 'ru' ? 'Детали бездорожья' : language === 'es' ? 'Detalles todo terreno' : language === 'fr' ? 'Détails tout-terrain' : language === 'de' ? 'Offroad-Details' : language === 'it' ? 'Dettagli fuoristrada' : 'Off-road Details'}</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>{t('offroadVehicleType')}</Label>
                            <Select value={editData.offroad_vehicle_type} onValueChange={(v) => setEditData({ ...editData, offroad_vehicle_type: v })}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {offroadVehicleTypes.map((type) =>
                            <SelectItem key={type} value={type}>{t(type)}</SelectItem>
                            )}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>{t('offroadDistance')}</Label>
                            <Input
                          type="number"
                          value={editData.offroad_distance || ''}
                          onChange={(e) => setEditData({ ...editData, offroad_distance: parseInt(e.target.value) || null })}
                          placeholder="80" />

                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>{t('offroadTerrainType')}</Label>
                          <div className="flex flex-wrap gap-2">
                            {offroadTerrainTypes.map((type) =>
                        <Badge
                          key={type}
                          variant={editData.offroad_terrain_type?.includes(type) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => {
                            const current = editData.offroad_terrain_type || [];
                            setEditData({
                              ...editData,
                              offroad_terrain_type: current.includes(type) ?
                              current.filter((t) => t !== type) :
                              [...current, type]
                            });
                          }}>

                                {t(type)}
                              </Badge>
                        )}
                          </div>
                        </div>
                      </div>
                    </>
                }

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{language === 'he' ? 'סוג משך' : language === 'ru' ? 'Тип продолжительности' : language === 'es' ? 'Tipo de duración' : language === 'fr' ? 'Type de durée' : language === 'de' ? 'Dauertyp' : language === 'it' ? 'Tipo di durata' : 'Duration Type'}</Label>
                      <Select value={editData.duration_type} onValueChange={(v) => setEditData({ ...editData, duration_type: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {durations.map((d) =>
                        <SelectItem key={d} value={d}>{t(d)}</SelectItem>
                        )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{language === 'he' ? 'משך זמן' : language === 'ru' ? 'Значение продолжительности' : language === 'es' ? 'Valor de duración' : language === 'fr' ? 'Valeur de durée' : language === 'de' ? 'Dauerwert' : language === 'it' ? 'Valore durata' : 'Duration Value'}</Label>
                      <Input
                      type="number"
                      value={editData.duration_value}
                      onChange={(e) => setEditData({ ...editData, duration_value: parseInt(e.target.value) })}
                      min={1} />

                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'he' ? 'מקסימום משתתפים' : language === 'ru' ? 'Макс. участники' : language === 'es' ? 'Máximo de participantes' : language === 'fr' ? 'Participants max' : language === 'de' ? 'Max. Teilnehmer' : language === 'it' ? 'Massimo partecipanti' : 'Max Participants'}</Label>
                    <Input
                    type="number"
                    value={editData.max_participants}
                    onChange={(e) => setEditData({ ...editData, max_participants: parseInt(e.target.value) })}
                    min={trip.current_participants} />

                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label>{language === 'he' ? 'סוגי שביל' : language === 'ru' ? 'Типы тропы' : language === 'es' ? 'Tipos de sendero' : language === 'fr' ? 'Types de sentier' : language === 'de' ? 'Wegtypen' : language === 'it' ? 'Tipi di sentiero' : 'Trail Types'}</Label>
                    <div className="flex flex-wrap gap-2">
                      {trailTypes.map((type) =>
                    <Badge
                      key={type}
                      variant={editData.trail_type?.includes(type) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => {
                        const current = editData.trail_type || [];
                        setEditData({
                          ...editData,
                          trail_type: current.includes(type) ?
                          current.filter((t) => t !== type) :
                          [...current, type]
                        });
                      }}>

                          {t(type)}
                        </Badge>
                    )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{t('interests')}</Label>
                    <div className="flex flex-wrap gap-2">
                      {['nature', 'history', 'photography', 'birdwatching', 'archaeology', 'geology', 'botany', 'extreme_sports', 'family_friendly', 'romantic'].map((interest) =>
                    <Badge
                      key={interest}
                      variant={editData.interests?.includes(interest) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => {
                        const current = editData.interests || [];
                        setEditData({
                          ...editData,
                          interests: current.includes(interest) ?
                          current.filter((i) => i !== interest) :
                          [...current, interest]
                        });
                      }}>

                          {t(interest)}
                        </Badge>
                    )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{t('accessibilityTypes')}</Label>
                    <div className="flex flex-wrap gap-2">
                      {accessibilityTypes.map((type) =>
                    <Badge
                      key={type}
                      variant={editData.accessibility_types?.includes(type) ? 'default' : 'outline'}
                      className="cursor-pointer bg-purple-600"
                      onClick={() => {
                        const current = editData.accessibility_types || [];
                        setEditData({
                          ...editData,
                          accessibility_types: current.includes(type) ?
                          current.filter((t) => t !== type) :
                          [...current, type]
                        });
                      }}>

                          {t(type)}
                        </Badge>
                    )}
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
                      <Label className="mb-0">{t('petsAllowed')}</Label>
                      <Switch
                      checked={editData.pets_allowed}
                      onCheckedChange={(checked) => setEditData({ ...editData, pets_allowed: checked })} />

                    </div>
                    <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
                      <Label className="mb-0">{t('campingAvailable')}</Label>
                      <Switch
                      checked={editData.camping_available}
                      onCheckedChange={(checked) => setEditData({ ...editData, camping_available: checked })} />

                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>{language === 'he' ? 'מדריך מקצועי' : language === 'ru' ? 'Профессиональный гид' : language === 'es' ? 'Guía profesional' : language === 'fr' ? 'Guide professionnel' : language === 'de' ? 'Professioneller Führer' : language === 'it' ? 'Guida professionale' : 'Professional Guide'}</Label>
                      <Switch
                      checked={editData.has_guide}
                      onCheckedChange={(checked) => setEditData({ ...editData, has_guide: checked })} />

                    </div>
                    {editData.has_guide &&
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>{language === 'he' ? 'שם המדריך' : language === 'ru' ? 'Имя гида' : language === 'es' ? 'Nombre del guía' : language === 'fr' ? 'Nom du guide' : language === 'de' ? 'Name des Führers' : language === 'it' ? 'Nome della guida' : 'Guide Name'}</Label>
                          <Input
                        value={editData.guide_name}
                        onChange={(e) => setEditData({ ...editData, guide_name: e.target.value })}
                        dir={isRTL ? 'rtl' : 'ltr'} />

                        </div>
                        <div className="space-y-2">
                          <Label>{language === 'he' ? 'נושא ההדרכה' : language === 'ru' ? 'Тема гида' : language === 'es' ? 'Tema del guía' : language === 'fr' ? 'Sujet du guide' : language === 'de' ? 'Thema des Führers' : language === 'it' ? 'Argomento della guida' : 'Guide Topic'}</Label>
                          <Input
                        value={editData.guide_topic}
                        onChange={(e) => setEditData({ ...editData, guide_topic: e.target.value })}
                        dir={isRTL ? 'rtl' : 'ltr'} />

                        </div>
                      </div>
                  }
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>{language === 'he' ? 'טווחי גילאי הורים' : language === 'ru' ? 'Возраст родителей' : language === 'es' ? 'Rangos de edad de padres' : language === 'fr' ? 'Tranches d\'âge des parents' : language === 'de' ? 'Altersgruppen Eltern' : language === 'it' ? 'Fasce d\'età genitori' : 'Parent Age Ranges'}</Label>
                      <div className="flex flex-wrap gap-2">
                        {['20-30', '30-40', '40-50', '50-60', '60+'].map((range) =>
                      <Badge
                        key={range}
                        variant={editData.parent_age_ranges?.includes(range) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => {
                          const current = editData.parent_age_ranges || [];
                          setEditData({
                            ...editData,
                            parent_age_ranges: current.includes(range) ?
                            current.filter((r) => r !== range) :
                            [...current, range]
                          });
                        }}>

                            {range}
                          </Badge>
                      )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>{language === 'he' ? 'טווחי גילאי ילדים' : language === 'ru' ? 'Возраст детей' : language === 'es' ? 'Rangos de edad de niños' : language === 'fr' ? 'Tranches d\'âge des enfants' : language === 'de' ? 'Altersgruppen Kinder' : language === 'it' ? 'Fasce d\'età bambini' : 'Children Age Ranges'}</Label>
                      <div className="flex flex-wrap gap-2">
                        {['0-2', '3-6', '7-10', '11-14', '15-18', '18-21', '21+'].map((range) =>
                      <Badge
                        key={range}
                        variant={editData.children_age_ranges?.includes(range) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => {
                          const current = editData.children_age_ranges || [];
                          setEditData({
                            ...editData,
                            children_age_ranges: current.includes(range) ?
                            current.filter((r) => r !== range) :
                            [...current, range]
                          });
                        }}>

                            {range}
                          </Badge>
                      )}
                      </div>
                    </div>
                  </div>
                </div> :

              <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-between gap-4">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-6 w-full sm:w-auto">
                    <motion.div
                    className="flex items-center gap-3 bg-gradient-to-br from-blue-50 to-cyan-50 px-4 py-3 rounded-xl border-2 border-blue-100 shadow-md hover:shadow-xl transition-all"
                    whileHover={{ scale: 1.05, y: -2 }}>

                      <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg shadow-lg">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-800">{formatDate(new Date(trip.date), 'EEEE, MMMM d, yyyy', language)}</span>
                        {trip.meeting_time &&
                      <span className="text-sm text-blue-700 flex items-center gap-1 font-semibold">
                            <Clock className="w-4 h-4" />
                            {language === 'he' ? 'התכנסות:' : language === 'ru' ? 'Встреча:' : language === 'es' ? 'Encuentro:' : language === 'fr' ? 'Rendez-vous :' : language === 'de' ? 'Treffpunkt:' : language === 'it' ? 'Ritrovo:' : 'Meeting:'} {trip.meeting_time}
                          </span>
                      }
                      </div>
                    </motion.div>
                    <motion.div
                    className="flex items-center gap-3 bg-gradient-to-br from-purple-50 to-pink-50 px-4 py-3 rounded-xl border-2 border-purple-100 shadow-md hover:shadow-xl transition-all"
                    whileHover={{ scale: 1.05, y: -2 }}>

                      <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow-lg">
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-bold text-gray-800">
                        {trip.activity_type === 'trek' && trip.trek_days?.length > 0 ?
                      `${trip.trek_days.length} ${language === 'he' ? 'ימים' : language === 'ru' ? 'дней' : language === 'es' ? 'días' : language === 'fr' ? 'jours' : language === 'de' ? 'Tage' : language === 'it' ? 'giorni' : 'days'}` :
                      `${trip.duration_value} ${t(trip.duration_type)}`
                      }
                      </span>
                    </motion.div>
                    {!isIsraelTrailTrip &&
                    <motion.div
                    className="flex items-center gap-3 bg-rose-600 px-5 py-3 rounded-xl shadow-2xl hover:shadow-[0_8px_30px_rgba(225,29,72,0.5)] transition-all border-2 border-rose-700"
                    whileHover={{ scale: 1.05, y: -3 }}>

                      <div className="p-2 bg-white/20 rounded-lg shadow-lg backdrop-blur-sm">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-white text-lg">
                         {(() => {
                          let total = 0;
                          (trip.participants || []).forEach((p) => {
                            total += p.total_people || 1;
                          });
                          return total;
                        })()}/{trip.flexible_participants ?
                        <span>
                            {trip.max_participants} <span className="text-slate-50 text-xs">{language === 'he' ? 'גמיש' : 'Flexible'}</span>
                          </span> :
                        trip.max_participants}
                        </span>
                        <span className="text-xs text-white/90 font-bold">
                          {trip.participants?.length || 0} {language === 'he' ? 'משפחות' : 'families'}
                        </span>
                      </div>
                    </motion.div>
                    }
                    {trip.activity_type === 'cycling' &&
                  <motion.div
                    className="flex items-center gap-3 bg-cyan-600 px-5 py-3 rounded-xl shadow-2xl hover:shadow-[0_8px_30px_rgba(8,145,178,0.5)] transition-all border-2 border-cyan-700"
                    whileHover={{ scale: 1.05, y: -3 }}>

                        <div className="p-2 bg-white/20 rounded-lg shadow-lg backdrop-blur-sm">
                          <Bike className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-white text-lg">{t(trip.cycling_type || 'cycling')}</span>
                      </motion.div>
                  }
                    {trip.activity_type === 'offroad' &&
                  <motion.div
                    className="flex items-center gap-3 bg-orange-600 px-5 py-3 rounded-xl shadow-2xl hover:shadow-[0_8px_30px_rgba(234,88,12,0.5)] transition-all border-2 border-orange-700"
                    whileHover={{ scale: 1.05, y: -3 }}>

                        <div className="p-2 bg-white/20 rounded-lg shadow-lg backdrop-blur-sm">
                          <Truck className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-white text-lg">{t(trip.offroad_vehicle_type || 'offroad')}</span>
                      </motion.div>
                  }
                  </div>

                  {user && hasJoined &&
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                      <Button
                    onClick={handleAddToCalendar}
                    disabled={addingToCalendar}
                    className="bg-blue-600 hover:bg-blue-700 gap-2 h-11 shadow-lg w-full sm:w-auto">

                        {addingToCalendar ?
                    <Loader2 className="w-4 h-4 animate-spin" /> :

                    <Calendar className="w-4 h-4" />
                    }
                        {language === 'he' ? 'הוסף ליומן' : language === 'ru' ? 'В календарь' : language === 'es' ? 'Agregar a calendario' : language === 'fr' ? 'Ajouter au calendrier' : language === 'de' ? 'Zum Kalender' : language === 'it' ? 'Aggiungi al calendario' : 'Add to Calendar'}
                      </Button>
                      <Button
                    onClick={() => setShowEditParticipantDialog(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 gap-2 h-11 shadow-lg w-full sm:w-auto">

                        <Edit className="w-4 h-4" />
                        {language === 'he' ? 'ערוך משפחה' : 'Edit Family'}
                      </Button>
                      {!canEdit &&
                  <Button
                    variant="outline"
                    onClick={() => leaveMutation.mutate()}
                    disabled={leaveMutation.isLoading}
                    className="text-red-600 border-red-200 hover:bg-red-50 h-11 shadow-lg w-full sm:w-auto">

                          <X className="w-4 h-4 mr-2" />
                          {t('leave')}
                        </Button>
                  }
                    </div>
                }

                  {user && !hasJoined && (
                hasPendingRequest ?
                <Badge variant="outline" className="border-yellow-300 text-yellow-700 bg-yellow-50">
                        {language === 'he' ? 'הבקשה ממתינה לאישור' : language === 'ru' ? 'Запрос ожидает подтверждения' : language === 'es' ? 'Solicitud pendiente de aprobación' : language === 'fr' ? 'Demande en attente d\'approbation' : language === 'de' ? 'Anfrage wartet auf Genehmigung' : language === 'it' ? 'Richiesta in attesa di approvazione' : 'Request pending approval'}
                      </Badge> :
                (() => {
                  // Check if registration has opened
                  const registrationOpens = trip.registration_start_date ? new Date(trip.registration_start_date) : null;
                  const now = new Date();
                  const registrationClosed = registrationOpens && now < registrationOpens;
                  const alreadyRequested = trip.registration_reminders?.some((r) => r.email === user.email);

                  if (registrationClosed) {
                    return (
                      <div className="space-y-3">
                            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300">
                              <CardContent className="p-4 text-center">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                  <Clock className="w-5 h-5 text-amber-600" />
                                  <p className="font-bold text-amber-900">
                                    {language === 'he' ? 'ההרשמה טרם נפתחה' : 'Registration Not Yet Open'}
                                  </p>
                                </div>
                                <p className="text-sm text-amber-700 mb-3">
                                  {language === 'he' ?
                              `ההרשמה תיפתח ב-${registrationOpens.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}` :
                              `Registration opens on ${registrationOpens.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`}
                                </p>
                                {!alreadyRequested ?
                            <Button
                              onClick={handleRequestReminder}
                              className="bg-amber-600 hover:bg-amber-700 gap-2">

                                    <Bell className="w-4 h-4" />
                                    {language === 'he' ? 'שלח לי תזכורת' : 'Send Me a Reminder'}
                                  </Button> :

                            <Badge className="bg-green-100 text-green-700 border-green-300">
                                    {language === 'he' ? '✓ תקבל תזכורת כשההרשמה תיפתח' : '✓ You will be reminded when registration opens'}
                                  </Badge>
                            }
                              </CardContent>
                            </Card>
                          </div>);

                  }

                  return (
                    <motion.div
                      animate={{
                        scale: [1, 1.05, 1],
                        boxShadow: [
                        '0 0 0 0 rgba(16, 185, 129, 0.7)',
                        '0 0 0 10px rgba(16, 185, 129, 0)',
                        '0 0 0 0 rgba(16, 185, 129, 0)']

                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="inline-block">

                          <Button
                        onClick={() => setShowJoinDialog(true)}
                        disabled={joinMutation.isLoading || isFull}
                        className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg text-lg font-bold px-8 h-14 touch-manipulation min-h-[44px]">

                            <Check className="w-5 h-5 mr-2" />
                            {isFull ? t('tripFull') : language === 'he' ? 'בקש להצטרף' : language === 'ru' ? 'Запросить присоединение' : language === 'es' ? 'Solicitar unirse' : language === 'fr' ? 'Demander à rejoindre' : language === 'de' ? 'Beitritt anfragen' : language === 'it' ? 'Richiedi di unirti' : 'Request to Join'}
                          </Button>
                        </motion.div>);

                })())
                }
                  
                  {!user && (
                    isIsraelTrailTrip ?
          <Button
            onClick={() => navigate(`/NifgashimPortal?id=${trip.id}`)}
            className="bg-emerald-600 hover:bg-emerald-700 gap-2 shadow-lg">
            <ArrowRight className="w-4 h-4" />
            {language === 'he' ? 'מעבר לפורטל' : 'Go to Portal'}
          </Button> :
                    <Button
                      onClick={() => base44.auth.redirectToLogin(window.location.href)}
                      className="bg-emerald-600 hover:bg-emerald-700 shadow-lg">

                          {language === 'he' ? 'התחבר להצטרפות' : language === 'ru' ? 'Войти для присоединения' : language === 'es' ? 'Iniciar sesión para unirse' : language === 'fr' ? 'Se connecter pour rejoindre' : language === 'de' ? 'Anmelden zum Beitreten' : language === 'it' ? 'Accedi per unirti' : 'Login to Join'}
                    </Button>
                  )}

                  {canEdit &&
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto items-stretch sm:items-center">
                      <Button
                    onClick={handleAddToCalendar}
                    disabled={addingToCalendar}
                    className="bg-blue-600 hover:bg-blue-700 gap-2 h-11 shadow-lg w-full sm:w-auto">

                        {addingToCalendar ?
                    <Loader2 className="w-4 h-4 animate-spin" /> :

                    <Calendar className="w-4 h-4" />
                    }
                        {language === 'he' ? 'הוסף ליומן' : language === 'ru' ? 'В календарь' : language === 'es' ? 'Agregar a calendario' : language === 'fr' ? 'Ajouter au calendrier' : language === 'de' ? 'Zum Kalender' : language === 'it' ? 'Aggiungi al calendario' : 'Add to Calendar'}
                      </Button>
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 h-11 flex items-center justify-center px-4 font-semibold shadow-lg w-full sm:w-auto">
                        {language === 'he' ? 'אתה המארגן' : language === 'ru' ? 'Вы организатор' : language === 'es' ? 'Eres el organizador' : language === 'fr' ? 'Vous êtes l\'organisateur' : language === 'de' ? 'Sie sind der Organisator' : language === 'it' ? 'Sei l\'organizzatore' : "You're the organizer"}
                      </Badge>
                    </div>
                }
                </div>
              }
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="w-full mb-4">
              {canEdit && (
                <div className="flex justify-end mb-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTabSettingsDialog(true)}
                    className="gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    {language === 'he' ? 'הגדרות טאבים' : 'Tab Settings'}
                  </Button>
                </div>
              )}
              <TabsList className="flex flex-wrap lg:grid lg:grid-cols-8 lg:auto-rows-fr w-full items-stretch gap-1.5 lg:gap-2 h-auto bg-gradient-to-r from-white via-gray-50 to-white border-2 border-gray-200/50 shadow-xl rounded-xl p-2 lg:p-3 text-xs md:text-sm" dir={language === 'he' ? 'rtl' : 'ltr'}>
                {!hiddenTabs.includes('details') && (
                  <TabsTrigger value="details" className="group flex items-center gap-2 whitespace-nowrap data-[state=active]:bg-gradient-to-br data-[state=active]:from-emerald-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/50 data-[state=active]:border-2 data-[state=active]:border-emerald-400 text-gray-600 py-2 px-2 md:py-3 md:px-4 rounded-xl transition-all duration-300 hover:scale-105 lg:w-full lg:justify-center">
                    <Info className="w-4 h-4 text-emerald-600 group-data-[state=active]:text-white" />
                    <span className="text-sm">{language === 'he' ? 'פרטים' : language === 'ru' ? 'Детали' : language === 'es' ? 'Detalles' : language === 'fr' ? 'Détails' : language === 'de' ? 'Details' : language === 'it' ? 'Dettagli' : 'Details'}</span>
                  </TabsTrigger>
                )}
                {!hiddenTabs.includes('map') && (
                  <TabsTrigger value="map" className="group flex items-center gap-2 whitespace-nowrap data-[state=active]:bg-gradient-to-br data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/50 data-[state=active]:border-2 data-[state=active]:border-purple-400 text-gray-600 py-2 px-2 md:py-3 md:px-4 rounded-xl transition-all duration-300 hover:scale-105 lg:w-full lg:justify-center">
                    <MapPin className="w-4 h-4 text-purple-600 group-data-[state=active]:text-white" />
                    <span className="text-sm">{language === 'he' ? 'מפה' : language === 'ru' ? 'Карта' : language === 'es' ? 'Mapa' : language === 'fr' ? 'Carte' : language === 'de' ? 'Karte' : language === 'it' ? 'Mappa' : 'Map'}</span>
                  </TabsTrigger>
                )}
                {!hiddenTabs.includes('navigate') && (
                  <TabsTrigger value="navigate" className="group flex items-center gap-2 whitespace-nowrap data-[state=active]:bg-gradient-to-br data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-green-500/50 data-[state=active]:border-2 data-[state=active]:border-green-400 text-gray-600 py-2 px-2 md:py-3 md:px-4 rounded-xl transition-all duration-300 hover:scale-105 lg:w-full lg:justify-center" onClick={(e) => {
                    e.preventDefault();
                    setShowNavigationDialog(true);
                  }}>
                    <Navigation className="w-4 h-4 text-green-600 group-data-[state=active]:text-white" />
                    <span className="text-sm">{language === 'he' ? 'נווט' : 'Navigate'}</span>
                  </TabsTrigger>
                )}
                {!hiddenTabs.includes('participants') && (
                  <TabsTrigger value="participants" className="group flex items-center gap-2 whitespace-nowrap data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/50 data-[state=active]:border-2 data-[state=active]:border-blue-400 text-gray-600 py-2 px-2 md:py-3 md:px-4 rounded-xl transition-all duration-300 hover:scale-105 lg:w-full lg:justify-center">
                    <Users className="w-4 h-4 text-blue-600 group-data-[state=active]:text-white" />
                    <span className="text-sm">{language === 'he' ? 'משתתפים' : language === 'ru' ? 'Участники' : language === 'es' ? 'Participantes' : language === 'fr' ? 'Participants' : language === 'de' ? 'Teilnehmer' : language === 'it' ? 'Partecipanti' : 'Participants'}</span>
                  </TabsTrigger>
                )}
                {!hiddenTabs.includes('equipment') && (
                  <TabsTrigger value="equipment" className="group flex items-center gap-2 whitespace-nowrap data-[state=active]:bg-gradient-to-br data-[state=active]:from-indigo-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-500/50 data-[state=active]:border-2 data-[state=active]:border-indigo-400 text-gray-600 py-2 px-2 md:py-3 md:px-4 rounded-xl transition-all duration-300 hover:scale-105 lg:w-full lg:justify-center">
                    <Backpack className="w-4 h-4 text-indigo-600 group-data-[state=active]:text-white" />
                    <span className="text-sm">{language === 'he' ? 'ציוד' : language === 'ru' ? 'Снаряжение' : language === 'es' ? 'Equipo' : language === 'fr' ? 'Équipement' : language === 'de' ? 'Ausrüstung' : language === 'it' ? 'Attrezzatura' : 'Equipment'}</span>
                  </TabsTrigger>
                )}
                {!hiddenTabs.includes('itinerary') && (
                  <TabsTrigger value="itinerary" className="group flex items-center gap-2 whitespace-nowrap data-[state=active]:bg-gradient-to-br data-[state=active]:from-violet-500 data-[state=active]:to-violet-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-violet-500/50 data-[state=active]:border-2 data-[state=active]:border-violet-400 text-gray-600 py-2 px-2 md:py-3 md:px-4 rounded-xl transition-all duration-300 hover:scale-105 lg:w-full lg:justify-center">
                    <Calendar className="w-4 h-4 text-violet-600 group-data-[state=active]:text-white" />
                    <span className="text-sm">{language === 'he' ? 'לוח זמנים' : language === 'ru' ? 'Маршрут' : language === 'es' ? 'Itinerario' : language === 'fr' ? 'Itinéraire' : language === 'de' ? 'Reiseplan' : language === 'it' ? 'Itinerario' : 'Itinerary'}</span>
                  </TabsTrigger>
                )}
                {!hiddenTabs.includes('budget') && (
                  <TabsTrigger value="budget" className="group flex items-center gap-2 whitespace-nowrap data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-500 data-[state=active]:to-amber-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-amber-500/50 data-[state=active]:border-2 data-[state=active]:border-amber-400 text-gray-600 py-2 px-2 md:py-3 md:px-4 rounded-xl transition-all duration-300 hover:scale-105 lg:w-full lg:justify-center">
                    <DollarSign className="w-4 h-4 text-amber-600 group-data-[state=active]:text-white" />
                    <span className="text-sm">{language === 'he' ? 'תקציב' : language === 'ru' ? 'Бюджет' : language === 'es' ? 'Presupuesto' : language === 'fr' ? 'Budget' : language === 'de' ? 'Budget' : language === 'it' ? 'Budget' : 'Budget'}</span>
                  </TabsTrigger>
                )}
                {!hiddenTabs.includes('social') && (
                  <TabsTrigger value="social" className="group flex items-center gap-2 whitespace-nowrap data-[state=active]:bg-gradient-to-br data-[state=active]:from-sky-500 data-[state=active]:to-sky-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-sky-500/50 data-[state=active]:border-2 data-[state=active]:border-sky-400 text-gray-600 py-2 px-2 md:py-3 md:px-4 rounded-xl transition-all duration-300 hover:scale-105 lg:w-full lg:justify-center">
                    <MessageCircle className="w-4 h-4 text-sky-600 group-data-[state=active]:text-white" />
                    <span className="text-sm">{language === 'he' ? 'חברתי' : language === 'ru' ? 'Соцсети' : language === 'es' ? 'Social' : language === 'fr' ? 'Social' : language === 'de' ? 'Sozial' : language === 'it' ? 'Sociale' : 'Social'}</span>
                  </TabsTrigger>
                )}
                {(hasJoined || isOrganizer) && (
                  <>
                    {!hiddenTabs.includes('chat') && (
                      <TabsTrigger value="chat" className="group flex items-center gap-2 whitespace-nowrap data-[state=active]:bg-gradient-to-br data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-orange-500/50 data-[state=active]:border-2 data-[state=active]:border-orange-400 text-gray-600 py-2 px-2 md:py-3 md:px-4 rounded-xl transition-all duration-300 hover:scale-105 lg:w-full lg:justify-center">
                        <MessageSquare className="w-4 h-4 text-orange-600 group-data-[state=active]:text-white" />
                        <span className="text-sm">{language === 'he' ? 'צ\'אט' : language === 'ru' ? 'Чат' : language === 'es' ? 'Chat' : language === 'fr' ? 'Chat' : language === 'de' ? 'Chat' : language === 'it' ? 'Chat' : 'Chat'}</span>
                      </TabsTrigger>
                    )}
                    {!hiddenTabs.includes('gallery') && (
                      <TabsTrigger value="gallery" className="group flex items-center gap-2 whitespace-nowrap data-[state=active]:bg-gradient-to-br data-[state=active]:from-pink-500 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-pink-500/50 data-[state=active]:border-2 data-[state=active]:border-pink-400 text-gray-600 py-2 px-2 md:py-3 md:px-4 rounded-xl transition-all duration-300 hover:scale-105 lg:w-full lg:justify-center">
                        <GalleryHorizontal className="w-4 h-4 text-pink-600 group-data-[state=active]:text-white" />
                        <span className="text-sm">{language === 'he' ? 'גלריה' : language === 'ru' ? 'Галерея' : language === 'es' ? 'Galería' : language === 'fr' ? 'Galerie' : language === 'de' ? 'Galerie' : language === 'it' ? 'Galleria' : 'Gallery'}</span>
                      </TabsTrigger>
                    )}
                    {!hiddenTabs.includes('experiences') && (
                      <TabsTrigger value="experiences" className="group flex items-center gap-2 whitespace-nowrap data-[state=active]:bg-gradient-to-br data-[state=active]:from-rose-500 data-[state=active]:to-rose-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-rose-500/50 data-[state=active]:border-2 data-[state=active]:border-rose-400 text-gray-600 py-2 px-2 md:py-3 md:px-4 rounded-xl transition-all duration-300 hover:scale-105 lg:w-full lg:justify-center">
                        <Heart className="w-4 h-4 text-rose-600 group-data-[state=active]:text-white" />
                        <span className="text-sm">{language === 'he' ? 'חוויות' : language === 'ru' ? 'Впечатления' : language === 'es' ? 'Experiencias' : language === 'fr' ? 'Expériences' : language === 'de' ? 'Erlebnisse' : language === 'it' ? 'Esperienze' : 'Experiences'}</span>
                      </TabsTrigger>
                    )}
                    {!hiddenTabs.includes('location') && (
                      <TabsTrigger value="location" className="group flex items-center gap-2 whitespace-nowrap data-[state=active]:bg-gradient-to-br data-[state=active]:from-teal-500 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-teal-500/50 data-[state=active]:border-2 data-[state=active]:border-teal-400 text-gray-600 py-2 px-2 md:py-3 md:px-4 rounded-xl transition-all duration-300 hover:scale-105 lg:w-full lg:justify-center">
                        <Radio className="w-4 h-4 text-teal-600 group-data-[state=active]:text-white" />
                        <span className="text-sm">{language === 'he' ? 'מיקום חי' : 'Live Location'}</span>
                      </TabsTrigger>
                    )}
                    {!hiddenTabs.includes('reminders') && (
                      <TabsTrigger value="reminders" className="group flex items-center gap-2 whitespace-nowrap data-[state=active]:bg-gradient-to-br data-[state=active]:from-yellow-500 data-[state=active]:to-yellow-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-yellow-500/50 data-[state=active]:border-2 data-[state=active]:border-yellow-400 text-gray-600 py-2 px-2 md:py-3 md:px-4 rounded-xl transition-all duration-300 hover:scale-105 lg:w-full lg:justify-center">
                        <Bell className="w-4 h-4 text-yellow-600 group-data-[state=active]:text-white" />
                        <span className="text-sm">{language === 'he' ? 'תזכורות' : 'Reminders'}</span>
                      </TabsTrigger>
                    )}
                    {!hiddenTabs.includes('contributions') && (
                      <TabsTrigger value="contributions" className="group flex items-center gap-2 whitespace-nowrap data-[state=active]:bg-gradient-to-br data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-orange-500/50 data-[state=active]:border-2 data-[state=active]:border-orange-400 text-gray-600 py-2 px-2 md:py-3 md:px-4 rounded-xl transition-all duration-300 hover:scale-105 lg:w-full lg:justify-center">
                        <Package className="w-4 h-4 text-orange-600 group-data-[state=active]:text-white" />
                        <span className="text-sm">{language === 'he' ? 'מביא' : 'Bringing'}</span>
                      </TabsTrigger>
                    )}
                    {!hiddenTabs.includes('invite') && (
                      <TabsTrigger value="invite" className="group flex items-center gap-2 whitespace-nowrap data-[state=active]:bg-gradient-to-br data-[state=active]:from-cyan-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/50 data-[state=active]:border-2 data-[state=active]:border-cyan-400 text-gray-600 py-2 px-2 md:py-3 md:px-4 rounded-xl transition-all duration-300 hover:scale-105 lg:w-full lg:justify-center">
                        <UserPlus className="w-4 h-4 text-cyan-600 group-data-[state=active]:text-white" />
                        <span className="text-sm">{language === 'he' ? 'הזמן' : 'Invite'}</span>
                      </TabsTrigger>
                    )}
                  </>
                )}
                    <TabsTrigger value="waiver" className="group relative flex items-center gap-2 whitespace-nowrap data-[state=active]:bg-gradient-to-br data-[state=active]:from-red-500 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-red-500/50 data-[state=active]:border-2 data-[state=active]:border-red-400 text-gray-600 py-2 px-2 md:py-3 md:px-4 rounded-xl transition-all duration-300 hover:scale-105 lg:w-full lg:justify-center">
                      {!trip.participants?.find((p) => p.email === user?.email)?.waiver_accepted &&
                  <motion.div
                    animate={{
                      scale: [1, 1.3, 1]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />

                  }
                      <Shield className="w-4 h-4 text-red-600 group-data-[state=active]:text-white" />
                      <span className="text-sm font-bold">{language === 'he' ? 'נא לקרוא' : 'Please Read'}</span>
                    </TabsTrigger>
                    </TabsList>
                    </div>

            <TabsContent value="social" className="mt-0">
              <TripComments
                trip={trip}
                currentUserEmail={user?.email}
                onUpdate={() => queryClient.invalidateQueries(['trip', tripId])} />

            </TabsContent>

            <TabsContent value="details" className="space-y-6 mt-0">
              {/* Trek Days Display */}
              {trip.activity_type === 'trek' && trip.trek_days?.length > 0 &&
              <TrekDaysDisplay
                trip={trip}
                selectedDay={selectedEquipmentDay}
                onDayChange={setSelectedEquipmentDay} />

              }

              {/* Description */}
              {(trip.description || trip.description_he || trip.description_en) && !isEditing &&
              <Card>
                  <CardContent className="p-6">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap" dir={isRTL ? 'rtl' : 'ltr'}>{trip.description || trip.description_he || trip.description_en}</p>
                  </CardContent>
                </Card>
              }

              {/* Details */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('tripDetails')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6" dir={language === 'he' ? 'rtl' : 'ltr'}>
                  {trip.activity_type === 'cycling' && (trip.cycling_distance || trip.cycling_elevation) &&
                  <div>
                      <p className="font-medium mb-2">{t('cycling')} {language === 'he' ? 'פרטים' : language === 'ru' ? 'Детали' : language === 'es' ? 'Detalles' : language === 'fr' ? 'Détails' : language === 'de' ? 'Details' : language === 'it' ? 'Dettagli' : 'Details'}</p>
                      <div className="flex flex-wrap gap-3">
                        {trip.cycling_distance &&
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {trip.cycling_distance} {language === 'he' ? 'ק"מ' : language === 'ru' ? 'км' : language === 'es' ? 'km' : language === 'fr' ? 'km' : language === 'de' ? 'km' : language === 'it' ? 'km' : 'km'}
                          </Badge>
                      }
                        {trip.cycling_elevation &&
                      <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                            ↗ {trip.cycling_elevation} {language === 'he' ? 'מ\'' : language === 'ru' ? 'м' : language === 'es' ? 'm' : language === 'fr' ? 'm' : language === 'de' ? 'm' : language === 'it' ? 'm' : 'm'}
                          </Badge>
                      }
                      </div>
                    </div>
                  }

                  {trip.activity_type === 'offroad' &&
                  <div>
                      <p className="font-medium mb-2">{t('offroad')} {language === 'he' ? 'פרטים' : language === 'ru' ? 'Детали' : language === 'es' ? 'Detalles' : language === 'fr' ? 'Détails' : language === 'de' ? 'Details' : language === 'it' ? 'Dettagli' : 'Details'}</p>
                      <div className="space-y-2">
                        {trip.offroad_distance &&
                      <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                            {trip.offroad_distance} {language === 'he' ? 'ק"מ' : language === 'ru' ? 'км' : language === 'es' ? 'km' : language === 'fr' ? 'km' : language === 'de' ? 'km' : language === 'it' ? 'km' : 'km'}
                          </Badge>
                      }
                        {trip.offroad_terrain_type && trip.offroad_terrain_type.length > 0 &&
                      <div>
                            <p className="text-sm text-gray-500 mb-1">{t('offroadTerrainType')}:</p>
                            <div className="flex flex-wrap gap-2">
                              {trip.offroad_terrain_type.map((terrain) =>
                          <Badge key={terrain} variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                  {t(terrain)}
                                </Badge>
                          )}
                            </div>
                          </div>
                      }
                      </div>
                    </div>
                  }

                  {trip.trail_type && trip.trail_type.length > 0 &&
                  <div>
                      <p className="font-medium mb-2">{t('trailType')}</p>
                      <div className="flex flex-wrap gap-2">
                        {trip.trail_type.map((type) => {
                        const Icon = trailIcons[type] || Mountain;
                        return (
                          <Badge key={type} variant="outline" className="gap-1">
                              <Icon className="w-3 h-3" />
                              {t(type)}
                            </Badge>);

                      })}
                      </div>
                    </div>
                  }

                  {trip.interests && trip.interests.length > 0 &&
                  <div>
                      <p className="font-medium mb-2">{t('interests')}</p>
                      <div className="flex flex-wrap gap-2">
                        {trip.interests.map((interest) =>
                      <Badge key={interest} variant="secondary">
                            {t(interest)}
                          </Badge>
                      )}
                      </div>
                    </div>
                  }

                  {trip.accessibility_types && trip.accessibility_types.length > 0 &&
                  <div>
                      <p className="font-medium mb-2">{t('accessibilityTypes')}</p>
                      <div className="flex flex-wrap gap-2">
                        {trip.accessibility_types.map((type) =>
                      <Badge key={type} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                            {t(type)}
                          </Badge>
                      )}
                      </div>
                    </div>
                  }

                  {trip.has_guide &&
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-blue-900 mb-1">
                            {language === 'he' ? 'מדריך מקצועי' : language === 'ru' ? 'Профессиональный гид' : language === 'es' ? 'Guía profesional' : language === 'fr' ? 'Guide professionnel' : language === 'de' ? 'Professioneller Führer' : language === 'it' ? 'Guida professionale' : 'Professional Guide'}
                          </p>
                          {trip.guide_name &&
                        <p className="text-sm text-blue-700 mb-1">
                              <span className="font-medium">{language === 'he' ? 'שם:' : language === 'ru' ? 'Имя:' : language === 'es' ? 'Nombre:' : language === 'fr' ? 'Nom :' : language === 'de' ? 'Name:' : language === 'it' ? 'Nome:' : 'Name:'}</span> {trip.guide_name}
                            </p>
                        }
                          {trip.guide_topic &&
                        <p className="text-sm text-blue-700">
                              <span className="font-medium">{language === 'he' ? 'נושא:' : language === 'ru' ? 'Тема:' : language === 'es' ? 'Tema:' : language === 'fr' ? 'Sujet :' : language === 'de' ? 'Thema:' : language === 'it' ? 'Argomento:' : 'Topic:'}</span> {trip.guide_topic}
                            </p>
                        }
                        </div>
                      </div>
                    </div>
                  }

                  {/* Equipment for Trek */}
                  {trip.activity_type === 'trek' && trip.trek_days?.some((day) => day.equipment?.length > 0) &&
                  <div className="space-y-4">
                      <p className="font-medium mb-2 flex items-center gap-2">
                        <Backpack className="w-5 h-5 text-indigo-600" />
                        {language === 'he' ? 'מה להביא לטראק' : language === 'ru' ? 'Что взять с собой' : language === 'es' ? 'Qué llevar' : language === 'fr' ? 'Quoi apporter' : language === 'de' ? 'Was mitnehmen' : language === 'it' ? 'Cosa portare' : 'What to bring'}
                      </p>
                      
                      {/* Day Selector */}
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {trip.trek_days.sort((a, b) => a.day_number - b.day_number).map((day, idx) => {
                        const getDayDate = () => {
                          if (day.date) return new Date(day.date);
                          if (trip.date && day.day_number) {
                            const date = new Date(trip.date);
                            date.setDate(date.getDate() + (day.day_number - 1));
                            return date;
                          }
                          return null;
                        };
                        const dayDate = getDayDate();

                        return (
                          <Button
                            key={idx}
                            variant={selectedEquipmentDay === idx ? "default" : "outline"}
                            onClick={() => setSelectedEquipmentDay(idx)}
                            className={`min-w-fit flex flex-col items-center py-2 h-auto ${selectedEquipmentDay === idx ? 'bg-indigo-600 hover:bg-indigo-700' : ''}`}>

                              <span className="font-semibold">
                                {language === 'he' ? `יום ${day.day_number}` : `Day ${day.day_number}`}
                              </span>
                              {dayDate &&
                            <>
                                  <span className="text-xs opacity-90">
                                    {dayDate.toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US', { weekday: 'short' })}
                                  </span>
                                  <span className="text-xs opacity-80">
                                    {dayDate.toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US', { day: 'numeric', month: 'numeric' })}
                                  </span>
                                </>
                            }
                            </Button>);

                      })}
                      </div>

                      {/* Selected Day Equipment */}
                      {trip.trek_days.sort((a, b) => a.day_number - b.day_number)[selectedEquipmentDay]?.equipment?.length > 0 &&
                    <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                          <h4 className="font-semibold text-indigo-900 mb-3">
                            {language === 'he' ?
                        `יום ${trip.trek_days.sort((a, b) => a.day_number - b.day_number)[selectedEquipmentDay].day_number}: ${trip.trek_days.sort((a, b) => a.day_number - b.day_number)[selectedEquipmentDay].daily_title}` :
                        `Day ${trip.trek_days.sort((a, b) => a.day_number - b.day_number)[selectedEquipmentDay].day_number}: ${trip.trek_days.sort((a, b) => a.day_number - b.day_number)[selectedEquipmentDay].daily_title}`}
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {trip.trek_days.sort((a, b) => a.day_number - b.day_number)[selectedEquipmentDay].equipment.map((item, idx) =>
                        <div key={idx} className="flex items-center gap-2 bg-white rounded-lg p-2 text-sm">
                                <Check className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                                <span className="text-gray-700">{item.item}</span>
                              </div>
                        )}
                          </div>
                          {trip.trek_days.sort((a, b) => a.day_number - b.day_number)[selectedEquipmentDay].recommended_water_liters &&
                      <div className="mt-3 flex items-center gap-2 text-blue-700 bg-blue-50 rounded-lg p-2">
                              <Droplets className="w-4 h-4" />
                              <span className="text-sm font-medium">
                                {language === 'he' ?
                          `מים מומלצים: ${trip.trek_days.sort((a, b) => a.day_number - b.day_number)[selectedEquipmentDay].recommended_water_liters} ליטר` :
                          `Recommended water: ${trip.trek_days.sort((a, b) => a.day_number - b.day_number)[selectedEquipmentDay].recommended_water_liters}L`}
                              </span>
                            </div>
                      }
                        </div>
                    }
                    </div>
                  }

                  {/* Equipment for Regular Trips */}
                  {trip.equipment_checklist && trip.equipment_checklist.length > 0 &&
                  <div className="space-y-4">
                      <p className="font-medium mb-2 flex items-center gap-2">
                        <Backpack className="w-5 h-5 text-indigo-600" />
                        {language === 'he' ? 'מה להביא' : language === 'ru' ? 'Что взять' : language === 'es' ? 'Qué llevar' : language === 'fr' ? 'Quoi apporter' : language === 'de' ? 'Was mitnehmen' : language === 'it' ? 'Cosa portare' : 'What to bring'}
                      </p>
                      <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {trip.equipment_checklist.map((item, idx) =>
                        <div key={idx} className="flex items-center gap-2 bg-white rounded-lg p-2 text-sm">
                              <Check className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                              <span className="text-gray-700">{item.item}</span>
                            </div>
                        )}
                        </div>
                        {trip.recommended_water_liters &&
                      <div className="mt-3 flex items-center gap-2 text-blue-700 bg-blue-50 rounded-lg p-2">
                            <Droplets className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              {language === 'he' ? `מים מומלצים: ${trip.recommended_water_liters} ליטר` : `Recommended water: ${trip.recommended_water_liters}L`}
                            </span>
                          </div>
                      }
                      </div>
                    </div>
                  }

                  <Separator />

                  {(trip.parent_age_ranges?.length > 0 || trip.children_age_ranges?.length > 0) &&
                  <div className="space-y-4">
                      {trip.parent_age_ranges?.length > 0 &&
                    <div>
                          <p className="text-gray-500 mb-2">{language === 'he' ? 'טווחי גילאי הורים' : language === 'ru' ? 'Возраст родителей' : language === 'es' ? 'Rangos de edad de padres' : language === 'fr' ? 'Tranches d\'âge des parents' : language === 'de' ? 'Altersgruppen Eltern' : language === 'it' ? 'Fasce d\'età genitori' : 'Parent Age Ranges'}</p>
                          <div className="flex flex-wrap gap-2">
                            {trip.parent_age_ranges.map((range) =>
                        <Badge key={range} variant="outline" className="border-purple-300 text-purple-700">
                                {range}
                              </Badge>
                        )}
                          </div>
                        </div>
                    }
                      {trip.children_age_ranges?.length > 0 &&
                    <div>
                          <p className="text-gray-500 mb-2">{language === 'he' ? 'טווחי גילאי ילדים' : language === 'ru' ? 'Возраст детей' : language === 'es' ? 'Rangos de edad de niños' : language === 'fr' ? 'Tranches d\'âge des enfants' : language === 'de' ? 'Altersgruppen Kinder' : language === 'it' ? 'Fasce d\'età bambini' : 'Children Age Ranges'}</p>
                          <div className="flex flex-wrap gap-2">
                            {trip.children_age_ranges.map((range) =>
                        <Badge key={range} variant="outline" className="border-pink-300 text-pink-700">
                                {range}
                              </Badge>
                        )}
                          </div>
                        </div>
                    }
                    </div>
                  }
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="participants" className="mt-0">
              <div className="space-y-6" dir={language === 'he' ? 'rtl' : 'ltr'}>
              {/* Participant Statistics - visible to everyone */}
              <ParticipantStats
                  trip={trip}
                  userProfiles={userProfiles}
                  calculateAge={calculateAge}
                  language={language}
                  isRTL={isRTL} />


              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-600" />
                    {t('participants')} ({trip.current_participants || 1})
                  </CardTitle>
                </CardHeader>
                <CardContent dir={language === 'he' ? 'rtl' : 'ltr'}>
                  <TooltipProvider>
                  <div className="space-y-4">
                    {/* Organizers Section */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-700">
                          {language === 'he' ? 'מארגנים' : 'Organizers'}
                        </h3>
                        {isOrganizer &&
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setShowAddOrganizerDialog(true)}
                              className="gap-2">

                            <UserPlus className="w-4 h-4" />
                            {language === 'he' ? 'הוסף' : 'Add'}
                          </Button>
                            }
                      </div>
                      
                      <div className="space-y-2">
                        {/* Main Organizer */}
                        <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-emerald-600 text-white">
                              {(() => {
                                const displayName = userProfiles[trip.organizer_email]?.name || trip.organizer_name || trip.organizer_email;
                                return typeof displayName === 'string' && displayName.length > 0 ? displayName.charAt(0).toUpperCase() : 'O';
                              })()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium" dir={language === 'he' ? 'rtl' : 'ltr'}>
                            {userProfiles[trip.organizer_email]?.name || trip.organizer_name}
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-xs text-emerald-600 font-semibold">{language === 'he' ? 'מארגן ראשי' : 'Main Organizer'}</p>
                            {(() => {
                                    const organizer = trip.participants?.find((p) => p.email === trip.organizer_email);
                                    if (!organizer) return null;

                                    let total = 1;
                                    if (organizer.family_members?.spouse) total++;
                                    if (organizer.selected_children?.length > 0) total += organizer.selected_children.length;
                                    if (organizer.family_members?.other && organizer.other_member_name) total++;

                                    return (
                                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-xs">
                            {total} {language === 'he' ? 'אנשים' : 'people'}
                            </Badge>);

                                  })()}
                            </div>
                          </div>
                          <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedProfileEmail(trip.organizer_email);
                                  setShowProfileDialog(true);
                                }}>

                            <User className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Additional Organizers */}
                        {trip.additional_organizers?.map((organizer, index) =>
                            <div key={index} className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200" data-test="co-organizer-row">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-emerald-500 text-white">
                                {(() => {
                                  const displayName = userProfiles[organizer.email]?.name || organizer.name || organizer.email;
                                  return typeof displayName === 'string' && displayName.length > 0 ? displayName.charAt(0).toUpperCase() : 'O';
                                })()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-medium" dir={language === 'he' ? 'rtl' : 'ltr'}>
                                {userProfiles[organizer.email]?.name || organizer.name || organizer.email}
                              </p>
                              <p className="text-xs text-emerald-600">{language === 'he' ? 'מארגן משותף' : 'Co-organizer'}</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedProfileEmail(organizer.email);
                                  setShowProfileDialog(true);
                                }}>

                              <User className="w-4 h-4" />
                            </Button>
                            {isOrganizer &&
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveOrganizer(organizer.email)}
                                className="text-red-600 hover:bg-red-50">

                                <X className="w-4 h-4" />
                              </Button>
                              }
                          </div>
                            )}
                      </div>
                    </div>

                    <Separator />

                    {/* Participants Table */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <span>{language === 'he' ? 'כל המשתתפים' : 'All Participants'} ({trip.participants?.length || 0})</span>
                        <span className="text-xs text-gray-500">
                          ({(() => {
                                let total = 0;
                                (trip.participants || []).forEach((p) => {
                                  total += 1; // participant
                                  if (p.family_members?.spouse) total++;
                                  if (p.selected_children?.length > 0) total += p.selected_children.length;
                                  if (p.family_members?.other && p.other_member_name) total++;
                                });
                                return total;
                              })()} {language === 'he' ? 'אנשים סה"כ' : 'total people'})
                        </span>
                      </h3>
                      
                      {trip.participants?.length > 0 ?
                          <div className="border rounded-lg overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="px-4 py-3 text-start text-xs font-semibold text-gray-700">
                                    {language === 'he' ? 'משתתף' : 'Participant'}
                                  </th>
                                  <th className="px-4 py-3 text-start text-xs font-semibold text-gray-700">
                                    {language === 'he' ? 'מבוגרים' : 'Adults'}
                                  </th>
                                  <th className="px-4 py-3 text-start text-xs font-semibold text-gray-700">
                                    {language === 'he' ? 'ילדים' : 'Children'}
                                  </th>
                                  <th className="px-4 py-3 text-start text-xs font-semibold text-gray-700">
                                    <div className="flex items-center gap-1">
                                      <Dog className="w-4 h-4 text-amber-600" />
                                    </div>
                                  </th>
                                  <th className="px-4 py-3 text-start text-xs font-semibold text-gray-700">
                                    {language === 'he' ? 'מצטרף נוסף' : 'Other'}
                                  </th>
                                  <th className="px-4 py-3 text-start text-xs font-semibold text-gray-700">
                                    {language === 'he' ? 'סה"כ' : 'Total'}
                                  </th>
                                  <th className="px-4 py-3 text-start text-xs font-semibold text-gray-700">
                                    {language === 'he' ? 'תאריך' : 'Date'}
                                  </th>
                                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">
                                    {language === 'he' ? 'פרופיל' : 'Profile'}
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {trip.participants.map((participant, index) => {
                                    const participantProfile = userProfiles[participant.email];

                                    console.log(`\n\n=== RENDERING PARTICIPANT ${index + 1} ===`);
                                    console.log('Raw participant object:');
                                    console.dir(participant);
                                    console.log('\nParticipant.family_members:', participant.family_members);
                                    console.log('Participant.selected_children:', participant.selected_children);
                                    console.log('Participant.other_member_name:', participant.other_member_name);
                                    console.log('\nProfile data:');
                                    console.dir(participantProfile);

                                    // Calculate breakdown
                                    let adultsCount = 1; // The participant themselves
                                    if (participant.family_members?.spouse) adultsCount++;

                                    console.log('Adults Count:', adultsCount);

                                    // Count children
                                    let childrenCount = participant.selected_children?.length || 0;
                                    // Prefer snapshot saved on participant
                                    let childrenDetails = Array.isArray(participant.children_details) && participant.children_details.length > 0 ?
                                    participant.children_details :
                                    [];

                                    console.log('Children Count:', childrenCount);
                                    console.log('Selected Children IDs:', participant.selected_children);

                                    if (childrenDetails.length === 0 && childrenCount > 0 && participantProfile?.children_age_ranges) {
                                      const details = [];
                                      participant.selected_children.forEach((childId, idx) => {
                                        const child = participantProfile.children_age_ranges.find((c) => c.id === childId);
                                        console.log(`Child ${idx + 1}:`, child);
                                        if (child) {
                                          details.push({
                                            age_range: child.age_range,
                                            gender: child.gender,
                                            name: child.name
                                          });
                                        }
                                      });
                                      childrenDetails = details;
                                    }

                                    console.log('Children Details:', childrenDetails);

                                    let otherCount = 0;
                                    const otherDetails = [];
                                    if (participant.family_members?.other && participant.other_member_name) {
                                      otherCount++;
                                      otherDetails.push(participant.other_member_name);
                                    }

                                    console.log('Other Count:', otherCount);
                                    console.log('Other Details:', otherDetails);

                                    const hasPets = participant.family_members?.pets;
                                    console.log('Has Pets:', hasPets);

                                    const totalPeople = adultsCount + childrenCount + otherCount;
                                    console.log('Total People:', totalPeople);
                                    console.log('===================');

                                    const isOrganizerRow = participant.email === trip.organizer_email;

                                    return (
                                      <tr key={index} className={`hover:bg-gray-50 transition-colors ${isOrganizerRow ? 'bg-emerald-50/50' : ''}`}>
                                     <td className="px-4 py-3">
                                       <div className="flex items-center gap-3">
                                         <Avatar className="h-9 w-9">
                                           <AvatarFallback className={isOrganizerRow ? 'bg-emerald-600 text-white' : 'bg-blue-100 text-blue-700'}>
                                             {(() => {
                                               const displayName = participantProfile?.name || participant.name || participant.email;
                                               return typeof displayName === 'string' && displayName.length > 0 ? displayName.charAt(0).toUpperCase() : 'P';
                                             })()}
                                           </AvatarFallback>
                                         </Avatar>
                                         <div className="flex-1">
                                           <p className="font-medium text-sm" dir={language === 'he' ? 'rtl' : 'ltr'}>
                                             {participantProfile?.name || participant.name}
                                           </p>
                                           {isOrganizerRow &&
                                              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-xs mt-0.5">
                                               {language === 'he' ? 'מארגן' : 'Organizer'}
                                             </Badge>
                                              }
                                         </div>
                                       </div>
                                     </td>
                                      <td className="px-4 py-3">
                                        {(() => {
                                          const adultsDetails = [];
                                          // Main participant
                                          const mainAge = participant.parent_age_range || participantProfile?.parent_age_range || (participantProfile?.birth_date ? calculateAge(participantProfile.birth_date) : null);
                                          adultsDetails.push({
                                            name: participantProfile?.name || participant.name,
                                            role: language === 'he' ? 'ראשי' : 'Main',
                                            age: mainAge
                                          });

                                          // Spouse
                                          if (participant.family_members?.spouse) {
                                            const spouseAge = participantProfile?.spouse_age_range || (participantProfile?.spouse_birth_date ? calculateAge(participantProfile.spouse_birth_date) : null);
                                            adultsDetails.push({
                                              name: language === 'he' ? 'בן/בת זוג' : 'Spouse',
                                              role: language === 'he' ? 'בן/בת זוג' : 'Spouse',
                                              age: spouseAge
                                            });
                                          }

                                          return (
                                            <TooltipProvider>
                                              <Tooltip delayDuration={100}>
                                                <TooltipTrigger asChild>
                                                  <button className="cursor-pointer inline-flex focus:outline-none flex-col items-start">
                                                    <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors">
                                                      {adultsCount}
                                                    </Badge>
                                                    {adultsCount > 1 &&
                                                      <p className="text-xs text-gray-500 mt-1">{language === 'he' ? '+ בן/בת זוג' : '+ Spouse'}</p>
                                                    }
                                                  </button>
                                                </TooltipTrigger>
                                                <TooltipContent className="bg-white border-2 border-indigo-300 shadow-xl p-4 max-w-xs" side="top">
                                                  <div className="space-y-2">
                                                    <p className="font-bold text-indigo-700 mb-2 border-b border-indigo-200 pb-1">
                                                      {language === 'he' ? 'פרטי המבוגרים' : 'Adults Details'}
                                                    </p>
                                                    {adultsDetails.map((adult, idx) => (
                                                      <div key={idx} className="flex items-center gap-2 p-2 bg-indigo-50 rounded-lg">
                                                        <div className="flex-1">
                                                          <p className="font-semibold text-gray-800 text-sm">
                                                            {adult.name}
                                                          </p>
                                                          {adult.age && (
                                                            <p className="text-gray-600 text-xs">
                                                              {language === 'he' ? 'גיל/טווח:' : 'Age:'} <span className="font-bold text-indigo-700">{adult.age}</span>
                                                            </p>
                                                          )}
                                                        </div>
                                                      </div>
                                                    ))}
                                                  </div>
                                                </TooltipContent>
                                              </Tooltip>
                                            </TooltipProvider>
                                          );
                                        })()}
                                      </td>
                                      <td className="px-4 py-3">
                                        {childrenCount > 0 ?
                                          <TooltipProvider>
                                            <Tooltip delayDuration={100}>
                                              <TooltipTrigger asChild>
                                                <button className="cursor-pointer inline-flex focus:outline-none">
                                                  <Badge variant="secondary" className="bg-pink-100 text-pink-700 hover:bg-pink-200 transition-colors">
                                                    {childrenCount}
                                                  </Badge>
                                                </button>
                                              </TooltipTrigger>
                                              <TooltipContent className="bg-white border-2 border-pink-300 shadow-xl p-4 max-w-xs" side="top">
                                                <div className="space-y-2">
                                                  <p className="font-bold text-pink-700 mb-2 border-b border-pink-200 pb-1">
                                                    {language === 'he' ? 'פרטי הילדים' : 'Children Details'}
                                                  </p>
                                                  {childrenDetails.length > 0 ?
                                                  childrenDetails.map((childData, idx) => {
                                                    const genderLabel = childData.gender === 'male' ?
                                                    language === 'he' ? 'בן' : 'Boy' :
                                                    childData.gender === 'female' ?
                                                    language === 'he' ? 'בת' : 'Girl' :
                                                    '';
                                                    return (
                                                      <div key={idx} className="flex items-center gap-2 p-2 bg-pink-50 rounded-lg">
                                                          <span className={`w-3 h-3 rounded-full flex-shrink-0 ${childData.gender === 'male' ? 'bg-blue-500' : childData.gender === 'female' ? 'bg-pink-500' : 'bg-gray-400'}`}></span>
                                                          <div className="flex-1">
                                                            <p className="font-semibold text-gray-800 text-sm">
                                                              {language === 'he' ? 'ילד' : 'Child'} {idx + 1}
                                                            </p>
                                                            <p className="text-gray-600 text-xs">
                                                              {childData.age_range &&
                                                            <span className="font-bold text-pink-700">{childData.age_range}</span>
                                                            }
                                                              {genderLabel && ` • ${genderLabel}`}
                                                            </p>
                                                          </div>
                                                        </div>);

                                                  }) :

                                                  <p className="text-sm text-gray-500">{language === 'he' ? 'אין פרטי ילדים זמינים' : 'No children details available'}</p>
                                                  }
                                                </div>
                                              </TooltipContent>
                                            </Tooltip>
                                          </TooltipProvider> :

                                          <span className="text-xs text-gray-400">-</span>
                                          }
                                      </td>
                                      <td className="px-4 py-3">
                                        {hasPets ?
                                          <div className="flex items-center gap-0.5">
                                            <Dog className="w-4 h-4 text-amber-600" />
                                          </div> :

                                          <span className="text-xs text-gray-400">-</span>
                                          }
                                      </td>
                                      <td className="px-4 py-3">
                                        {otherCount > 0 ?
                                          <div>
                                            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                                              {otherCount}
                                            </Badge>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                              {otherDetails.map((detail, idx) =>
                                              <span key={idx} className="text-xs text-gray-600">
                                                  {detail}{idx < otherDetails.length - 1 ? ',' : ''}
                                                </span>
                                              )}
                                            </div>
                                          </div> :

                                          <span className="text-xs text-gray-400">-</span>
                                          }
                                      </td>
                                      <td className="px-4 py-3">
                                        <Badge variant="secondary" className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 font-bold border border-emerald-300">
                                          {totalPeople}
                                        </Badge>
                                      </td>
                                      <td className="px-4 py-3">
                                        <span className="text-xs text-gray-500">
                                          {formatDate(new Date(participant.joined_at), 'MMM d', language)}
                                        </span>
                                      </td>
                                      <td className="px-4 py-3 text-center">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                              setSelectedProfileEmail(participant.email);
                                              setShowProfileDialog(true);
                                            }}>

                                          <User className="w-4 h-4" />
                                        </Button>
                                      </td>
                                    </tr>);

                                  })}
                              </tbody>
                            </table>
                          </div>
                        </div> :

                          <div className="text-center py-8 text-gray-500">
                        {language === 'he' ? 'אין משתתפים עדיין' : 'No participants yet'}
                      </div>
                          }
                    </div>
                  </div>
                  </TooltipProvider>
                </CardContent>
              </Card>
              </div>
            </TabsContent>

            <TabsContent value="map" className="mt-0">
              <MapSidebar
                trip={trip}
                isOrganizer={canEdit}
                onUpdate={() => queryClient.invalidateQueries(['trip', tripId])} />

              <div className="mt-6">
                <WeatherWidget location={trip.location} date={trip.date} />
              </div>
            </TabsContent>

            <TabsContent value="equipment" className="mt-0">
              <TripEquipment
                trip={trip}
                isOrganizer={canEdit}
                onUpdate={() => queryClient.invalidateQueries(['trip', tripId])} />

            </TabsContent>

            <TabsContent value="itinerary" className="mt-0">
              <DailyItinerary
                trip={trip}
                isOrganizer={canEdit}
                onUpdate={async () => {
                  await queryClient.invalidateQueries(['trip', tripId]);
                  await queryClient.refetchQueries(['trip', tripId]);
                }} />

            </TabsContent>

            <TabsContent value="budget" className="mt-0">
              <BudgetPlanner
                trip={trip}
                isOrganizer={canEdit}
                onUpdate={() => queryClient.invalidateQueries(['trip', tripId])} />

            </TabsContent>

            {(hasJoined || isOrganizer) &&
            <>
                <TabsContent value="chat" className="mt-0">
                  <TripChat
                  trip={trip}
                  currentUserEmail={user?.email}
                  onSendMessage={handleSendChatMessage}
                  sending={sendingMessage} />

                </TabsContent>

                <TabsContent value="gallery" className="mt-0">
                  <TripGallery
                  trip={trip}
                  currentUserEmail={user?.email}
                  onUpdate={() => queryClient.invalidateQueries(['trip', tripId])} />

                </TabsContent>

                <TabsContent value="experiences" className="mt-0">
                  <TripExperiences
                  trip={trip}
                  currentUserEmail={user?.email}
                  onUpdate={() => queryClient.invalidateQueries(['trip', tripId])} />

                </TabsContent>

                <TabsContent value="location" className="mt-0">
                  <LiveLocationMap
                  trip={trip}
                  currentUserEmail={user?.email}
                  onUpdate={() => queryClient.invalidateQueries(['trip', tripId])} />

                </TabsContent>
                <TabsContent value="reminders" className="mt-0">
                  <TripReminders
                  trip={trip}
                  currentUserEmail={user?.email} />

                </TabsContent>
                <TabsContent value="contributions" className="mt-0">
                  <TripContributions
                  trip={trip}
                  currentUserEmail={user?.email}
                  onUpdate={() => queryClient.invalidateQueries(['trip', tripId])} />

                </TabsContent>
                <TabsContent value="invite" className="mt-0">
                  <InviteFriends
                  trip={trip}
                  currentUserEmail={user?.email}
                  onUpdate={() => queryClient.invalidateQueries(['trip', tripId])} />

                </TabsContent>
                </>
            }
                <TabsContent value="waiver" className="mt-0">
                  <Card className="border-2 border-red-200">
                    <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50">
                      <CardTitle className="flex items-center gap-2 text-red-700">
                        <motion.div
                      animate={{
                        rotate: [0, 10, -10, 0]
                      }}
                      transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        repeatDelay: 2
                      }}>

                          <Shield className="w-6 h-6" />
                        </motion.div>
                        {language === 'he' ? 'כתב ויתור וביטוח - חשוב מאוד!' :
                    language === 'ru' ? 'Отказ и страхование - очень важно!' :
                    language === 'es' ? 'Exención y seguro - ¡muy importante!' :
                    language === 'fr' ? 'Décharge et assurance - très important!' :
                    language === 'de' ? 'Haftungsausschluss & Versicherung - sehr wichtig!' :
                    language === 'it' ? 'Liberatoria e assicurazione - molto importante!' :
                    'Liability Waiver & Insurance - Very Important!'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                    dir={isRTL ? 'rtl' : 'ltr'}>

                        <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-6">
                          <div className="flex items-start gap-3 mb-4">
                            <AlertTriangle className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
                            <div>
                              <h3 className="font-bold text-xl text-amber-900 mb-2">
                                {language === 'he' ? 'נא לקרוא בעיון לפני המשך השתתפות' :
                            language === 'ru' ? 'Пожалуйста, внимательно прочитайте перед продолжением' :
                            language === 'es' ? 'Por favor, lea atentamente antes de continuar' :
                            language === 'fr' ? 'Veuillez lire attentivement avant de continuer' :
                            language === 'de' ? 'Bitte lesen Sie sorgfältig, bevor Sie fortfahren' :
                            language === 'it' ? 'Si prega di leggere attentamente prima di continuare' :
                            'Please Read Carefully Before Continuing'}
                              </h3>
                              <p className="text-gray-700 leading-relaxed">
                                {language === 'he' ?
                            'השתתפות בטיולים מאורגנים דרך האפליקציה נעשית על אחריותך הבלעדית. חשוב מאוד לקרוא את כתב הוויתור המלא ולוודא שיש לך ביטוח מתאים.' :
                            language === 'ru' ? 'Участие в поездках, организованных через приложение, осуществляется на ваш собственный риск. Очень важно прочитать полный отказ и убедиться, что у вас есть соответствующая страховка.' :
                            language === 'es' ? 'La participación en viajes organizados a través de la aplicación es bajo su propio riesgo. Es muy importante leer la exención completa y asegurarse de tener un seguro adecuado.' :
                            language === 'fr' ? 'La participation aux voyages organisés via l\'application se fait à vos propres risques. Il est très important de lire la décharge complète et de vous assurer d\'avoir une assurance appropriée.' :
                            language === 'de' ? 'Die Teilnahme an über die App organisierten Reisen erfolgt auf eigene Gefahr. Es ist sehr wichtig, den vollständigen Haftungsausschluss zu lesen und sicherzustellen, dass Sie eine angemessene Versicherung haben.' :
                            language === 'it' ? 'La partecipazione ai viaggi organizzati tramite l\'app avviene a proprio rischio. È molto importante leggere la liberatoria completa e assicurarsi di avere un\'assicurazione adeguata.' :
                            'Participation in trips organized through the app is at your own risk. It is very important to read the full waiver and ensure you have appropriate insurance.'}
                              </p>
                            </div>
                          </div>

                          <div className="text-sm text-gray-800 leading-relaxed space-y-4">
                            {language === 'he' ? (
                              <>
                                <p className="font-bold">1. כללי והסכמה לתנאים</p>
                                <p>השימוש באפליקציית Groupy Loopy (להלן: "האפליקציה"), לרבות שירותי המפות, תכנון המסלולים, הניווט והצטרפות לקבוצות טיול, מותנה בהסכמה מלאה ובלתי מסויגת לכל האמור במסמך זה. המשך השימוש באפליקציה מהווה אישור כי קראת והבנת את תנאיו, ואתה מסכים לפטור את בעלי האפליקציה, מפתחיה ומנהליה (להלן: "המפעילים") מכל אחריות.</p>
                                
                                <p className="font-bold">2. היעדר אחריות למידע ולניווט</p>
                                <p><strong>שירות AS-IS:</strong> המידע המוצג באפליקציה, לרבות שירותי המפות והשבילים, מבוסס על מקורות חיצוניים ופתוחים. המפעילים אינם מתחייבים לדיוק, מהימנות או שלמות הנתונים.</p>
                                <p><strong>סטיות בשטח:</strong> ייתכנו סטיות משמעותיות בין המסלול המוצג במפה לבין תנאי השטח בפועל. הניווט וההסתמכות על המידע הדיגיטלי הם באחריות המשתמש בלבד.</p>
                                
                                <p className="font-bold">3. בטיחות, כשירות ואחריות אישית</p>
                                <p><strong>אחריות המשתמש:</strong> היציאה לטיול והשימוש במסלולים המוצעים נעשים על דעת המשתמש ובאחריותו הבלעדית. על המשתמש להפעיל שיקול דעת עצמאי בשטח, לבדוק את תנאי מזג האוויר, מצב הביטחון וסכנת שיטפונות.</p>
                                <p><strong>כשירות גופנית:</strong> המשתמש מצהיר כי הוא בעל כשירות רפואית וגופנית המתאימה למסלול שנבחר.</p>
                                <p><strong>ציוד עזר:</strong> המשתמש מבין כי האפליקציה אינה תחליף למפה פיזית, מצפן, כמות מספקת של מים וציוד בטיחות נדרש.</p>
                                
                                <p className="font-bold">4. שחרור מלא מאחריות לנזקים</p>
                                <p><strong>נזקי גוף ורכוש:</strong> המפעילים לא יישאו בכל אחריות לנזק ישיר או עקיף, גופני (לרבות פציעה, נכות או מוות), כספי או רכושי, שייגרם למשתמש או לצד שלישי כתוצאה מהשימוש באפליקציה.</p>
                                <p><strong>טיולים קבוצתיים:</strong> במסגרת "טיולי קבוצות", המפעילים אינם אחראים להתנהגות המשתתפים, לאיכות הארגון או לכל אירוע פלילי או נזיקי המתרחש במהלך המפגש. המשתמש מוותר על כל טענה כלפי האפליקציה בגין פעילות של משתמשים אחרים.</p>
                                
                                <p className="font-bold">5. הגבלת אחריות טכנולוגית</p>
                                <p>המפעילים אינם אחראים לתקלות טכניות, הפסקות בשירות, איבוד קליטת GPS או שגיאות בחישובי מסלול OSRM/Google Maps שעלולות להוביל לטעות בדרך.</p>
                                
                                <p className="font-bold">6. פרטיות ושירותי מיקום</p>
                                <p>המשתמש מאשר לאפליקציה לאסוף ולשתף נתוני מיקום (GPS) בזמן אמת לצורך תפעול הניווט והצגת מיקום המשתתפים בקבוצה. המשתמש מבין כי מיקומו עשוי להיות חשוף למשתתפים אחרים בהתאם להגדרות הקבוצה.</p>
                                
                                <p className="font-bold">7. סמכות שיפוט</p>
                                <p>על כתב ויתור זה יחולו חוקי מדינת ישראל.</p>
                                
                                <div className="bg-amber-100 p-4 rounded-lg border-2 border-amber-400 mt-4">
                                  <p className="font-bold mb-2">סיכום והצהרה:</p>
                                  <p>באמצעות סימון תיבת האישור או שימוש באפליקציה, אני מצהיר כי:</p>
                                  <ul className="list-disc list-inside mt-2 space-y-1">
                                    <li>אני מוותר על כל זכות תביעה כנגד מפתחי ומפעילי Groupy Loopy</li>
                                    <li>ידוע לי כי טיולי שטח כרוכים בסכנה וכי אני לוקח על עצמי סיכון זה מרצוני החופשי</li>
                                    <li>אני אחראי באופן מלא על עצמי ועל המלווים מטעמי (כולל קטינים)</li>
                                  </ul>
                                </div>
                              </>
                            ) : language === 'ru' ? (
                              <>
                                <p className="font-bold">1. Общие положения и согласие с условиями</p>
                                <p>Использование приложения Groupy Loopy (далее: "Приложение"), включая картографические сервисы, планирование маршрутов, навигацию и участие в групповых поездках, обусловлено полным и безоговорочным согласием со всем, изложенным в этом документе. Продолжение использования Приложения подтверждает, что вы прочитали и поняли условия, и вы соглашаетесь освободить владельцев Приложения, его разработчиков и администраторов (далее: "Операторы") от любой ответственности.</p>
                                
                                <p className="font-bold">2. Отказ от ответственности за информацию и навигацию</p>
                                <p><strong>Сервис AS-IS:</strong> Информация, отображаемая в Приложении, включая картографические и маршрутные сервисы, основана на внешних и открытых источниках. Операторы не гарантируют точность, надежность или полноту данных.</p>
                                <p><strong>Отклонения на местности:</strong> Могут быть существенные расхождения между маршрутом, отображаемым на карте, и фактическими условиями на местности. Навигация и доверие к цифровой информации осуществляются на ответственность пользователя.</p>
                                
                                <p className="font-bold">3. Безопасность, пригодность и личная ответственность</p>
                                <p><strong>Ответственность пользователя:</strong> Выход на маршрут и использование предлагаемых маршрутов осуществляются по усмотрению пользователя и под его исключительную ответственность. Пользователь должен применять самостоятельное суждение на местности, проверять погодные условия, безопасность и риск наводнений.</p>
                                <p><strong>Физическая пригодность:</strong> Пользователь заявляет, что обладает медицинской и физической пригодностью, соответствующей выбранному маршруту.</p>
                                <p><strong>Оборудование:</strong> Пользователь понимает, что Приложение не заменяет физическую карту, компас, достаточное количество воды и необходимое защитное снаряжение.</p>
                                
                                <p className="font-bold">4. Полное освобождение от ответственности за ущерб</p>
                                <p><strong>Телесные повреждения и имущественный ущерб:</strong> Операторы не несут никакой ответственности за прямой или косвенный ущерб, телесные повреждения (включая травмы, инвалидность или смерть), финансовый или имущественный ущерб, причиненный пользователю или третьей стороне в результате использования Приложения.</p>
                                <p><strong>Групповые поездки:</strong> В рамках "групповых поездок" Операторы не несут ответственности за поведение участников, качество организации или любые криминальные или деликтные инциденты, происходящие во время мероприятия. Пользователь отказывается от любых претензий к Приложению относительно действий других пользователей.</p>
                                
                                <p className="font-bold">5. Ограничение технологической ответственности</p>
                                <p>Операторы не несут ответственности за технические сбои, прерывания в обслуживании, потерю сигнала GPS или ошибки в расчетах маршрута OSRM/Google Maps, которые могут привести к неправильному пути.</p>
                                
                                <p className="font-bold">6. Конфиденциальность и службы определения местоположения</p>
                                <p>Пользователь разрешает Приложению собирать и передавать данные о местоположении (GPS) в реальном времени для работы навигации и отображения местоположения участников группы. Пользователь понимает, что его местоположение может быть раскрыто другим участникам в соответствии с настройками группы.</p>
                                
                                <p className="font-bold">7. Юрисдикция</p>
                                <p>Настоящий отказ регулируется законами Государства Израиль.</p>
                                
                                <div className="bg-amber-100 p-4 rounded-lg border-2 border-amber-400 mt-4">
                                  <p className="font-bold mb-2">Резюме и заявление:</p>
                                  <p>Отмечая флажок подтверждения или используя Приложение, я заявляю, что:</p>
                                  <ul className="list-disc list-inside mt-2 space-y-1">
                                    <li>Я отказываюсь от любого права на иск против разработчиков и операторов Groupy Loopy</li>
                                    <li>Мне известно, что полевые поездки связаны с опасностью, и я принимаю этот риск по своей доброй воле</li>
                                    <li>Я полностью несу ответственность за себя и сопровождающих лиц (включая несовершеннолетних)</li>
                                  </ul>
                                </div>
                              </>
                            ) : language === 'es' ? (
                              <>
                                <p className="font-bold">1. Generalidades y consentimiento a los términos</p>
                                <p>El uso de la aplicación Groupy Loopy (en adelante: "la Aplicación"), incluidos los servicios de mapas, planificación de rutas, navegación y participación en grupos de viaje, está condicionado al consentimiento total e incondicional de todo lo establecido en este documento. El uso continuado de la Aplicación constituye la confirmación de que ha leído y comprendido sus términos, y acepta liberar a los propietarios de la Aplicación, sus desarrolladores y administradores (en adelante: "los Operadores") de toda responsabilidad.</p>
                                
                                <p className="font-bold">2. Descargo de responsabilidad por información y navegación</p>
                                <p><strong>Servicio TAL CUAL:</strong> La información mostrada en la Aplicación, incluidos los servicios de mapas y rutas, se basa en fuentes externas y abiertas. Los Operadores no garantizan la exactitud, fiabilidad o integridad de los datos.</p>
                                <p><strong>Desviaciones en el terreno:</strong> Pueden existir desviaciones significativas entre la ruta mostrada en el mapa y las condiciones reales del terreno. La navegación y confianza en la información digital son responsabilidad exclusiva del usuario.</p>
                                
                                <p className="font-bold">3. Seguridad, aptitud y responsabilidad personal</p>
                                <p><strong>Responsabilidad del usuario:</strong> La salida al viaje y el uso de las rutas propuestas se realizan bajo el criterio del usuario y bajo su exclusiva responsabilidad. El usuario debe aplicar juicio independiente en el terreno, verificar condiciones meteorológicas, situación de seguridad y riesgo de inundaciones.</p>
                                <p><strong>Aptitud física:</strong> El usuario declara que posee la aptitud médica y física apropiada para la ruta elegida.</p>
                                <p><strong>Equipo auxiliar:</strong> El usuario entiende que la Aplicación no sustituye un mapa físico, brújula, cantidad suficiente de agua y equipo de seguridad necesario.</p>
                                
                                <p className="font-bold">4. Liberación total de responsabilidad por daños</p>
                                <p><strong>Daños corporales y materiales:</strong> Los Operadores no asumirán ninguna responsabilidad por daño directo o indirecto, corporal (incluyendo lesión, discapacidad o muerte), financiero o material, causado al usuario o a terceros como resultado del uso de la Aplicación.</p>
                                <p><strong>Viajes grupales:</strong> En el contexto de "viajes grupales", los Operadores no son responsables del comportamiento de los participantes, la calidad de la organización o cualquier evento criminal o dañino que ocurra durante el encuentro. El usuario renuncia a cualquier reclamación contra la Aplicación por actividades de otros usuarios.</p>
                                
                                <p className="font-bold">5. Limitación de responsabilidad tecnológica</p>
                                <p>Los Operadores no son responsables de fallas técnicas, interrupciones del servicio, pérdida de señal GPS o errores en los cálculos de ruta OSRM/Google Maps que puedan llevar a un error en el camino.</p>
                                
                                <p className="font-bold">6. Privacidad y servicios de ubicación</p>
                                <p>El usuario autoriza a la Aplicación a recopilar y compartir datos de ubicación (GPS) en tiempo real con el propósito de operar la navegación y mostrar la ubicación de los participantes del grupo. El usuario entiende que su ubicación puede ser expuesta a otros participantes según la configuración del grupo.</p>
                                
                                <p className="font-bold">7. Jurisdicción</p>
                                <p>Este descargo de responsabilidad se rige por las leyes del Estado de Israel.</p>
                                
                                <div className="bg-amber-100 p-4 rounded-lg border-2 border-amber-400 mt-4">
                                  <p className="font-bold mb-2">Resumen y declaración:</p>
                                  <p>Al marcar la casilla de confirmación o usar la Aplicación, declaro que:</p>
                                  <ul className="list-disc list-inside mt-2 space-y-1">
                                    <li>Renuncio a cualquier derecho de reclamación contra los desarrolladores y operadores de Groupy Loopy</li>
                                    <li>Soy consciente de que los viajes al aire libre conllevan peligro y acepto este riesgo por mi propia voluntad</li>
                                    <li>Soy totalmente responsable de mí mismo y de los acompañantes (incluidos menores)</li>
                                  </ul>
                                </div>
                              </>
                            ) : language === 'fr' ? (
                              <>
                                <p className="font-bold">1. Généralités et consentement aux conditions</p>
                                <p>L'utilisation de l'application Groupy Loopy (ci-après : "l'Application"), y compris les services cartographiques, la planification d'itinéraires, la navigation et l'adhésion à des groupes de voyage, est conditionnée par un consentement total et inconditionnel à tout ce qui est indiqué dans ce document. La poursuite de l'utilisation de l'Application constitue une confirmation que vous avez lu et compris ses conditions, et vous acceptez de dégager les propriétaires de l'Application, ses développeurs et administrateurs (ci-après : "les Opérateurs") de toute responsabilité.</p>
                                
                                <p className="font-bold">2. Déclaration de non-responsabilité pour l'information et la navigation</p>
                                <p><strong>Service TEL QUEL :</strong> Les informations affichées dans l'Application, y compris les services de cartes et de sentiers, sont basées sur des sources externes et ouvertes. Les Opérateurs ne garantissent pas l'exactitude, la fiabilité ou l'exhaustivité des données.</p>
                                <p><strong>Écarts sur le terrain :</strong> Il peut y avoir des écarts significatifs entre l'itinéraire affiché sur la carte et les conditions réelles du terrain. La navigation et la confiance dans l'information numérique relèvent de la seule responsabilité de l'utilisateur.</p>
                                
                                <p className="font-bold">3. Sécurité, aptitude et responsabilité personnelle</p>
                                <p><strong>Responsabilité de l'utilisateur :</strong> Le départ en voyage et l'utilisation des itinéraires proposés se font à la discrétion de l'utilisateur et sous sa seule responsabilité. L'utilisateur doit faire preuve de jugement indépendant sur le terrain, vérifier les conditions météorologiques, la situation sécuritaire et le risque d'inondations.</p>
                                <p><strong>Aptitude physique :</strong> L'utilisateur déclare posséder l'aptitude médicale et physique appropriée pour l'itinéraire choisi.</p>
                                <p><strong>Équipement auxiliaire :</strong> L'utilisateur comprend que l'Application ne remplace pas une carte physique, une boussole, une quantité suffisante d'eau et l'équipement de sécurité nécessaire.</p>
                                
                                <p className="font-bold">4. Libération totale de responsabilité pour dommages</p>
                                <p><strong>Dommages corporels et matériels :</strong> Les Opérateurs n'assumeront aucune responsabilité pour les dommages directs ou indirects, corporels (y compris blessure, invalidité ou décès), financiers ou matériels, causés à l'utilisateur ou à des tiers résultant de l'utilisation de l'Application.</p>
                                <p><strong>Voyages de groupe :</strong> Dans le cadre des "voyages de groupe", les Opérateurs ne sont pas responsables du comportement des participants, de la qualité de l'organisation ou de tout événement criminel ou dommageable survenant pendant la rencontre. L'utilisateur renonce à toute réclamation contre l'Application concernant les activités d'autres utilisateurs.</p>
                                
                                <p className="font-bold">5. Limitation de responsabilité technologique</p>
                                <p>Les Opérateurs ne sont pas responsables des pannes techniques, des interruptions de service, de la perte de signal GPS ou des erreurs dans les calculs d'itinéraire OSRM/Google Maps pouvant conduire à une erreur de route.</p>
                                
                                <p className="font-bold">6. Confidentialité et services de localisation</p>
                                <p>L'utilisateur autorise l'Application à collecter et partager des données de localisation (GPS) en temps réel dans le but d'exploiter la navigation et d'afficher la localisation des participants du groupe. L'utilisateur comprend que sa localisation peut être exposée à d'autres participants selon les paramètres du groupe.</p>
                                
                                <p className="font-bold">7. Juridiction</p>
                                <p>Cette décharge est régie par les lois de l'État d'Israël.</p>
                                
                                <div className="bg-amber-100 p-4 rounded-lg border-2 border-amber-400 mt-4">
                                  <p className="font-bold mb-2">Résumé et déclaration :</p>
                                  <p>En cochant la case de confirmation ou en utilisant l'Application, je déclare que :</p>
                                  <ul className="list-disc list-inside mt-2 space-y-1">
                                    <li>Je renonce à tout droit de réclamation contre les développeurs et opérateurs de Groupy Loopy</li>
                                    <li>Je sais que les voyages de plein air comportent des dangers et j'accepte ce risque de mon plein gré</li>
                                    <li>Je suis entièrement responsable de moi-même et de mes accompagnants (y compris les mineurs)</li>
                                  </ul>
                                </div>
                              </>
                            ) : language === 'de' ? (
                              <>
                                <p className="font-bold">1. Allgemeines und Zustimmung zu den Bedingungen</p>
                                <p>Die Nutzung der Groupy Loopy-Anwendung (nachfolgend: "die App"), einschließlich Kartendienste, Routenplanung, Navigation und Teilnahme an Gruppenreisen, ist an die vollständige und bedingungslose Zustimmung zu allem, was in diesem Dokument festgelegt ist, gebunden. Die fortgesetzte Nutzung der App bestätigt, dass Sie die Bedingungen gelesen und verstanden haben, und Sie erklären sich damit einverstanden, die Eigentümer der App, ihre Entwickler und Administratoren (nachfolgend: "die Betreiber") von jeglicher Haftung freizustellen.</p>
                                
                                <p className="font-bold">2. Haftungsausschluss für Informationen und Navigation</p>
                                <p><strong>Service WIE BESEHEN:</strong> Die in der App angezeigten Informationen, einschließlich Karten- und Wegdienste, basieren auf externen und offenen Quellen. Die Betreiber garantieren nicht die Genauigkeit, Zuverlässigkeit oder Vollständigkeit der Daten.</p>
                                <p><strong>Abweichungen im Gelände:</strong> Es können erhebliche Abweichungen zwischen der auf der Karte angezeigten Route und den tatsächlichen Geländebedingungen bestehen. Navigation und Vertrauen in die digitalen Informationen liegen in der alleinigen Verantwortung des Benutzers.</p>
                                
                                <p className="font-bold">3. Sicherheit, Eignung und persönliche Verantwortung</p>
                                <p><strong>Verantwortung des Benutzers:</strong> Die Durchführung der Reise und die Nutzung der vorgeschlagenen Routen erfolgen nach eigenem Ermessen des Benutzers und unter seiner alleinigen Verantwortung. Der Benutzer muss im Gelände selbständig urteilen, Wetterbedingungen, Sicherheitslage und Überschwemmungsgefahr prüfen.</p>
                                <p><strong>Körperliche Eignung:</strong> Der Benutzer erklärt, dass er über die medizinische und körperliche Eignung verfügt, die für die gewählte Route geeignet ist.</p>
                                <p><strong>Hilfsausrüstung:</strong> Der Benutzer versteht, dass die App keine physische Karte, Kompass, ausreichend Wasser und erforderliche Sicherheitsausrüstung ersetzt.</p>
                                
                                <p className="font-bold">4. Vollständige Haftungsfreistellung für Schäden</p>
                                <p><strong>Körperschäden und Sachschäden:</strong> Die Betreiber übernehmen keinerlei Haftung für direkte oder indirekte Schäden, körperliche Schäden (einschließlich Verletzung, Behinderung oder Tod), finanzielle oder sachliche Schäden, die dem Benutzer oder Dritten infolge der Nutzung der App zugefügt werden.</p>
                                <p><strong>Gruppenreisen:</strong> Im Rahmen von "Gruppenreisen" sind die Betreiber nicht verantwortlich für das Verhalten der Teilnehmer, die Qualität der Organisation oder für kriminelle oder schadenverursachende Ereignisse, die während des Treffens auftreten. Der Benutzer verzichtet auf jegliche Ansprüche gegen die App bezüglich der Aktivitäten anderer Benutzer.</p>
                                
                                <p className="font-bold">5. Einschränkung der technologischen Haftung</p>
                                <p>Die Betreiber haften nicht für technische Störungen, Dienstunterbrechungen, GPS-Signalverlust oder Fehler in OSRM/Google Maps-Routenberechnungen, die zu Navigationsfehlern führen können.</p>
                                
                                <p className="font-bold">6. Datenschutz und Standortdienste</p>
                                <p>Der Benutzer autorisiert die App, Standortdaten (GPS) in Echtzeit zu sammeln und zu teilen, um die Navigation zu betreiben und den Standort der Gruppenmitglieder anzuzeigen. Der Benutzer versteht, dass sein Standort gemäß den Gruppeneinstellungen anderen Teilnehmern offengelegt werden kann.</p>
                                
                                <p className="font-bold">7. Gerichtsstand</p>
                                <p>Dieser Haftungsausschluss unterliegt den Gesetzen des Staates Israel.</p>
                                
                                <div className="bg-amber-100 p-4 rounded-lg border-2 border-amber-400 mt-4">
                                  <p className="font-bold mb-2">Zusammenfassung und Erklärung:</p>
                                  <p>Durch Ankreuzen des Bestätigungsfeldes oder Nutzung der App erkläre ich, dass:</p>
                                  <ul className="list-disc list-inside mt-2 space-y-1">
                                    <li>Ich auf jegliches Klagerecht gegen die Entwickler und Betreiber von Groupy Loopy verzichte</li>
                                    <li>Mir bekannt ist, dass Outdoor-Reisen mit Gefahren verbunden sind und ich dieses Risiko aus freiem Willen übernehme</li>
                                    <li>Ich vollständig verantwortlich bin für mich und meine Begleiter (einschließlich Minderjähriger)</li>
                                  </ul>
                                </div>
                              </>
                            ) : language === 'it' ? (
                              <>
                                <p className="font-bold">1. Generalità e consenso ai termini</p>
                                <p>L'uso dell'applicazione Groupy Loopy (di seguito: "l'Applicazione"), compresi i servizi di mappe, pianificazione percorsi, navigazione e adesione a gruppi di viaggio, è condizionato al consenso totale e incondizionato a tutto quanto stabilito in questo documento. Il proseguimento dell'uso dell'Applicazione costituisce conferma che hai letto e compreso i suoi termini, e accetti di sollevare i proprietari dell'Applicazione, i suoi sviluppatori e amministratori (di seguito: "gli Operatori") da ogni responsabilità.</p>
                                
                                <p className="font-bold">2. Esclusione di responsabilità per informazioni e navigazione</p>
                                <p><strong>Servizio COSÌ COM'È:</strong> Le informazioni visualizzate nell'Applicazione, compresi i servizi di mappe e sentieri, si basano su fonti esterne e aperte. Gli Operatori non garantiscono l'accuratezza, l'affidabilità o la completezza dei dati.</p>
                                <p><strong>Deviazioni sul terreno:</strong> Possono esserci deviazioni significative tra il percorso visualizzato sulla mappa e le condizioni reali del terreno. La navigazione e l'affidamento sulle informazioni digitali sono di esclusiva responsabilità dell'utente.</p>
                                
                                <p className="font-bold">3. Sicurezza, idoneità e responsabilità personale</p>
                                <p><strong>Responsabilità dell'utente:</strong> L'uscita per il viaggio e l'uso dei percorsi proposti avvengono a discrezione dell'utente e sotto la sua esclusiva responsabilità. L'utente deve applicare un giudizio indipendente sul terreno, verificare le condizioni meteorologiche, la situazione di sicurezza e il rischio di inondazioni.</p>
                                <p><strong>Idoneità fisica:</strong> L'utente dichiara di possedere l'idoneità medica e fisica appropriata per il percorso scelto.</p>
                                <p><strong>Attrezzatura ausiliaria:</strong> L'utente comprende che l'Applicazione non sostituisce una mappa fisica, bussola, quantità sufficiente di acqua e attrezzatura di sicurezza necessaria.</p>
                                
                                <p className="font-bold">4. Liberazione totale da responsabilità per danni</p>
                                <p><strong>Danni fisici e materiali:</strong> Gli Operatori non assumono alcuna responsabilità per danni diretti o indiretti, fisici (inclusi lesioni, invalidità o morte), finanziari o materiali, causati all'utente o a terzi a seguito dell'uso dell'Applicazione.</p>
                                <p><strong>Viaggi di gruppo:</strong> Nel contesto dei "viaggi di gruppo", gli Operatori non sono responsabili del comportamento dei partecipanti, della qualità dell'organizzazione o di qualsiasi evento criminale o dannoso che si verifichi durante l'incontro. L'utente rinuncia a qualsiasi reclamo contro l'Applicazione per attività di altri utenti.</p>
                                
                                <p className="font-bold">5. Limitazione di responsabilità tecnologica</p>
                                <p>Gli Operatori non sono responsabili per guasti tecnici, interruzioni del servizio, perdita del segnale GPS o errori nei calcoli del percorso OSRM/Google Maps che possono portare a errori di navigazione.</p>
                                
                                <p className="font-bold">6. Privacy e servizi di localizzazione</p>
                                <p>L'utente autorizza l'Applicazione a raccogliere e condividere dati di localizzazione (GPS) in tempo reale per il funzionamento della navigazione e la visualizzazione della posizione dei partecipanti del gruppo. L'utente comprende che la sua posizione può essere esposta ad altri partecipanti secondo le impostazioni del gruppo.</p>
                                
                                <p className="font-bold">7. Giurisdizione</p>
                                <p>Questa liberatoria è regolata dalle leggi dello Stato di Israele.</p>
                                
                                <div className="bg-amber-100 p-4 rounded-lg border-2 border-amber-400 mt-4">
                                  <p className="font-bold mb-2">Riepilogo e dichiarazione:</p>
                                  <p>Spuntando la casella di conferma o utilizzando l'Applicazione, dichiaro che:</p>
                                  <ul className="list-disc list-inside mt-2 space-y-1">
                                    <li>Rinuncio a qualsiasi diritto di reclamo contro gli sviluppatori e operatori di Groupy Loopy</li>
                                    <li>Sono consapevole che i viaggi all'aperto comportano pericoli e accetto questo rischio di mia spontanea volontà</li>
                                    <li>Sono completamente responsabile per me stesso e per i miei accompagnatori (compresi i minori)</li>
                                  </ul>
                                </div>
                              </>
                            ) : (
                              <>
                                <p className="font-bold">1. General and Consent to Terms</p>
                                <p>Use of the Groupy Loopy application (hereinafter: "the Application"), including map services, route planning, navigation, and joining travel groups, is conditioned upon full and unconditional consent to everything stated in this document. Continued use of the Application constitutes confirmation that you have read and understood its terms, and you agree to release the Application's owners, developers, and administrators (hereinafter: "the Operators") from any liability.</p>
                                
                                <p className="font-bold">2. Disclaimer for Information and Navigation</p>
                                <p><strong>AS-IS Service:</strong> The information displayed in the Application, including map and trail services, is based on external and open sources. The Operators do not guarantee the accuracy, reliability, or completeness of the data.</p>
                                <p><strong>Deviations on the ground:</strong> There may be significant deviations between the route displayed on the map and the actual terrain conditions. Navigation and reliance on digital information are the sole responsibility of the user.</p>
                                
                                <p className="font-bold">3. Safety, Fitness, and Personal Responsibility</p>
                                <p><strong>User's responsibility:</strong> Embarking on a trip and using the proposed routes are done at the user's discretion and under their sole responsibility. The user must exercise independent judgment in the field, check weather conditions, security situation, and flood risk.</p>
                                <p><strong>Physical fitness:</strong> The user declares they possess the medical and physical fitness appropriate for the chosen route.</p>
                                <p><strong>Auxiliary equipment:</strong> The user understands that the Application is not a substitute for a physical map, compass, sufficient water, and required safety equipment.</p>
                                
                                <p className="font-bold">4. Full Release from Liability for Damages</p>
                                <p><strong>Bodily and property damage:</strong> The Operators will not assume any liability for direct or indirect damage, bodily harm (including injury, disability, or death), financial or property damage, caused to the user or third parties as a result of using the Application.</p>
                                <p><strong>Group trips:</strong> In the context of "group trips", the Operators are not responsible for participants' behavior, the quality of organization, or any criminal or tortious event occurring during the gathering. The user waives any claim against the Application regarding activities of other users.</p>
                                
                                <p className="font-bold">5. Limitation of Technological Liability</p>
                                <p>The Operators are not liable for technical malfunctions, service interruptions, GPS signal loss, or errors in OSRM/Google Maps route calculations that may lead to navigation mistakes.</p>
                                
                                <p className="font-bold">6. Privacy and Location Services</p>
                                <p>The user authorizes the Application to collect and share location data (GPS) in real-time for the purpose of operating navigation and displaying the location of group participants. The user understands that their location may be exposed to other participants according to group settings.</p>
                                
                                <p className="font-bold">7. Jurisdiction</p>
                                <p>This waiver is governed by the laws of the State of Israel.</p>
                                
                                <div className="bg-amber-100 p-4 rounded-lg border-2 border-amber-400 mt-4">
                                  <p className="font-bold mb-2">Summary and Declaration:</p>
                                  <p>By checking the confirmation box or using the Application, I declare that:</p>
                                  <ul className="list-disc list-inside mt-2 space-y-1">
                                    <li>I waive any right to claim against the developers and operators of Groupy Loopy</li>
                                    <li>I am aware that outdoor trips involve danger and I accept this risk of my own free will</li>
                                    <li>I am fully responsible for myself and my companions (including minors)</li>
                                  </ul>
                                </div>
                              </>
                            )}
                          </div>
                        </div>



                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                          <p className="text-sm text-gray-700">
                            {language === 'he' ?
                        '💡 למידע נוסף או שאלות, צור קשר עם המארגן דרך הצ\'אט' :
                        language === 'ru' ? '💡 Для получения дополнительной информации или вопросов свяжитесь с организатором через чат' :
                        language === 'es' ? '💡 Para más información o preguntas, contacta al organizador por chat' :
                        language === 'fr' ? '💡 Pour plus d\'informations ou questions, contactez l\'organisateur via le chat' :
                        language === 'de' ? '💡 Für weitere Informationen oder Fragen kontaktieren Sie den Organisator über den Chat' :
                        language === 'it' ? '💡 Per ulteriori informazioni o domande, contatta l\'organizzatore tramite chat' :
                        '💡 For more information or questions, contact the organizer via chat'}
                          </p>
                        </div>
                      </motion.div>
                    </CardContent>
                  </Card>
                </TabsContent>
                </Tabs>
        </motion.div>
      </div>

      {/* Join Request Dialog */}
      <JoinTripDialog
        open={showJoinDialog}
        onOpenChange={setShowJoinDialog}
        trip={trip}
        user={user}
        joinMessage={joinMessage}
        setJoinMessage={setJoinMessage}
        accessibilityNeeds={accessibilityNeeds}
        setAccessibilityNeeds={setAccessibilityNeeds}
        familyMembers={familyMembers}
        setFamilyMembers={setFamilyMembers}
        selectedChildren={selectedChildren}
        setSelectedChildren={setSelectedChildren}
        otherMemberName={otherMemberName}
        setOtherMemberName={setOtherMemberName}
        selectedTrekDays={selectedTrekDays}
        setSelectedTrekDays={setSelectedTrekDays}
        onJoin={handleJoinClick}
        isLoading={joinMutation.isLoading}
        onShowTerms={() => setShowTermsDialog(true)} />


      {/* Old Dialog Code Removed */}
      {false &&
      <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <DialogContent className="w-[95vw] max-w-2xl p-0 gap-0 h-[90vh] max-h-[90vh] flex flex-col overflow-hidden">
          <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 flex-shrink-0 border-b">
            <DialogTitle className="text-lg sm:text-xl">
              placeholder
            </DialogTitle>
            <DialogDescription className="text-sm">
              placeholder
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
          <div className="space-y-4">
            <div className="space-y-2" dir={language === 'he' ? 'rtl' : 'ltr'}>
              <Label className="text-sm">
                {language === 'he' ? 'הודעה למארגן (אופציונלי)' : language === 'ru' ? 'Сообщение организатору (необязательно)' : language === 'es' ? 'Mensaje al organizador (opcional)' : language === 'fr' ? 'Message à l\'organisateur (optionnel)' : language === 'de' ? 'Nachricht an Organisator (optional)' : language === 'it' ? 'Messaggio all\'organizzatore (opzionale)' : 'Message to organizer (optional)'}
              </Label>
              <Textarea
                  value={joinMessage}
                  onChange={(e) => setJoinMessage(e.target.value)}
                  placeholder={language === 'he' ?
                  'לדוגמה: שלום, אני בעל ניסיון בטיולים בדרום. יש לכם עוד מקום לאדם נוסף?' :
                  language === 'ru' ? 'напр., Привет, у меня есть опыт походов на юге. Есть место для ещё одного?' :
                  language === 'es' ? 'ej., Hola, tengo experiencia haciendo senderismo en el sur. ¿Tienen espacio para uno más?' :
                  language === 'fr' ? 'ex., Salut, j\'ai de l\'expérience en randonnée dans le sud. Avez-vous de la place pour une personne de plus?' :
                  language === 'de' ? 'z.B. Hallo, ich habe Erfahrung im Wandern im Süden. Haben Sie noch Platz für eine Person?' :
                  language === 'it' ? 'es., Ciao, ho esperienza in escursioni al sud. Avete spazio per un\'altra persona?' :
                  'e.g., Hi, I have experience hiking in the south. Do you have room for one more?'}
                  rows={3}
                  dir={language === 'he' ? 'rtl' : 'ltr'}
                  className="text-sm" />

            </div>

            {/* Trek Day Selection */}
            <div dir={language === 'he' ? 'rtl' : 'ltr'}>
            {trip.activity_type === 'trek' && trip.trek_days?.length > 0 &&
                <TrekDaySelector
                  trekDays={trip.trek_days}
                  dayPairs={trip.day_pairs || []}
                  selectedDays={selectedTrekDays}
                  setSelectedDays={setSelectedTrekDays} />

                }
            </div>

            <div className="space-y-2" dir={language === 'he' ? 'rtl' : 'ltr'}>
              <Label className="text-sm">
                {t('myAccessibilityNeeds')} ({language === 'he' ? 'אופציונלי' : language === 'ru' ? 'необязательно' : language === 'es' ? 'opcional' : language === 'fr' ? 'optionnel' : language === 'de' ? 'optional' : language === 'it' ? 'opzionale' : 'optional'})
              </Label>
              <div className="flex flex-wrap gap-2">
                {accessibilityTypes.map((type) =>
                  <Badge
                    key={type}
                    variant={accessibilityNeeds.includes(type) ? 'default' : 'outline'}
                    className={`cursor-pointer transition-all text-xs ${
                    accessibilityNeeds.includes(type) ?
                    'bg-purple-600 hover:bg-purple-700' :
                    'hover:border-purple-500 hover:text-purple-600'}`
                    }
                    onClick={() => {
                      setAccessibilityNeeds((prev) =>
                      prev.includes(type) ?
                      prev.filter((t) => t !== type) :
                      [...prev, type]
                      );
                    }}>

                    {t(type)}
                  </Badge>
                  )}
              </div>
            </div>

            {/* Family Members Selection */}
            <div className="space-y-3" dir={language === 'he' ? 'rtl' : 'ltr'}>
              <Label className="text-sm font-semibold">
                {language === 'he' ? 'מי מצטרף לטיול?' : 'Who is joining the trip?'}
              </Label>
              <div className="grid grid-cols-1 gap-2 bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-3 p-2 bg-white rounded-lg border-2 border-emerald-200">
                  <Checkbox
                      id="me"
                      checked={familyMembers.me}
                      disabled
                      className="data-[state=checked]:bg-emerald-600" />

                  <label htmlFor="me" className="flex-1 font-medium text-sm cursor-not-allowed opacity-70">
                    {language === 'he' ? 'אני' : 'Me'}
                  </label>
                </div>
                
                <div className="flex items-center gap-3 p-2 bg-white rounded-lg hover:bg-gray-50 transition-colors">
                  <Checkbox
                      id="spouse"
                      checked={familyMembers.spouse}
                      onCheckedChange={(checked) => setFamilyMembers({ ...familyMembers, spouse: checked })}
                      className="data-[state=checked]:bg-emerald-600" />

                  <label htmlFor="spouse" className="flex-1 font-medium text-sm cursor-pointer">
                    {language === 'he' ? 'בן/בת זוג' : 'Spouse/Partner'}
                  </label>
                </div>

                {user?.children_age_ranges && user.children_age_ranges.length > 0 && (() => {
                    const normalizedChildren = user.children_age_ranges.map((child, idx) => {
                      if (typeof child === 'string') {
                        return { id: `idx_${idx}`, name: null, age_range: child, gender: null };
                      }
                      return { ...child, id: child?.id || `idx_${idx}` };
                    });

                    return (
                      <div className="space-y-2" dir={language === 'he' ? 'rtl' : 'ltr'}>
                      <Label className="text-xs font-semibold">
                        {language === 'he' ? 'ילדים' : 'Children'}
                      </Label>
                      {normalizedChildren.map((child, idx) => {
                          const refId = child.id;
                          return (
                            <div key={refId} className="flex items-center gap-3 p-2 bg-white rounded-lg hover:bg-gray-50 transition-colors">
                            <Checkbox
                                id={`child-${refId}`}
                                checked={selectedChildren.includes(refId)}
                                onCheckedChange={(checked) => {
                                  setSelectedChildren((prev) =>
                                  checked ?
                                  [...prev, refId] :
                                  prev.filter((id) => id !== refId)
                                  );
                                }}
                                className="data-[state=checked]:bg-pink-600" />

                            <label htmlFor={`child-${refId}`} className="flex-1 font-medium text-sm cursor-pointer">
                              {child.name || `${language === 'he' ? 'ילד' : 'Child'} ${idx + 1}`}
                              {child.age_range &&
                                <Badge variant="outline" className="ml-2 bg-pink-50 text-pink-700 text-xs">
                                  {child.age_range}
                                </Badge>
                                }
                            </label>
                          </div>);

                        })}
                    </div>);

                  })()}

                <div className="flex items-center gap-3 p-2 bg-white rounded-lg hover:bg-gray-50 transition-colors">
                  <Checkbox
                      id="pets"
                      checked={familyMembers.pets}
                      onCheckedChange={(checked) => setFamilyMembers({ ...familyMembers, pets: checked })}
                      className="data-[state=checked]:bg-amber-600" />

                  <label htmlFor="pets" className="flex-1 font-medium text-sm cursor-pointer flex items-center gap-2">
                    <Dog className="w-4 h-4" />
                    {language === 'he' ? 'בעלי חיים' : 'Pets'}
                  </label>
                </div>

                <div className="space-y-2" dir={language === 'he' ? 'rtl' : 'ltr'}>
                  <div className="flex items-center gap-3 p-2 bg-white rounded-lg hover:bg-gray-50 transition-colors">
                    <Checkbox
                        id="other"
                        checked={familyMembers.other}
                        onCheckedChange={(checked) => {
                          setFamilyMembers({ ...familyMembers, other: checked });
                          if (!checked) setOtherMemberName('');
                        }}
                        className="data-[state=checked]:bg-purple-600" />

                    <label htmlFor="other" className="flex-1 font-medium text-sm cursor-pointer">
                      {language === 'he' ? 'נוסף' : 'Other'}
                    </label>
                  </div>
                  
                  {familyMembers.other &&
                    <Input
                      value={otherMemberName}
                      onChange={(e) => setOtherMemberName(e.target.value)}
                      placeholder={language === 'he' ? 'שם האדם/ים הנוסף/ים' : 'Name of other person(s)'}
                      dir={language === 'he' ? 'rtl' : 'ltr'}
                      className="text-sm" />

                    }
                </div>
              </div>
            </div>

            placeholder
          </div>
          </div>

          <div className="flex gap-3 px-4 sm:px-6 py-3 sm:py-4 border-t flex-shrink-0 bg-white">
            placeholder
          </div>
        </DialogContent>
      </Dialog>
      }

      {/* Join Request Notification Dialog */}
      {trip && trip.pending_requests && trip.pending_requests.length > 0 &&
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
          <DialogContent className="sm:max-w-md" dir={language === 'he' ? 'rtl' : 'ltr'}>
            <DialogHeader>
              <DialogTitle>
                {language === 'he' ? 'בקשה להצטרפות לטיול' : language === 'ru' ? 'Запрос на присоединение' : language === 'es' ? 'Solicitud de unión' : language === 'fr' ? 'Demande de rejoindre' : language === 'de' ? 'Beitrittsanfrage' : language === 'it' ? 'Richiesta di unirsi' : 'Trip Join Request'}
              </DialogTitle>
              <DialogDescription>
                {language === 'he' ?
              `בקשה ${currentRequestIndex + 1} מתוך ${trip.pending_requests.length}` :
              language === 'ru' ? `Запрос ${currentRequestIndex + 1} из ${trip.pending_requests.length}` :
              language === 'es' ? `Solicitud ${currentRequestIndex + 1} de ${trip.pending_requests.length}` :
              language === 'fr' ? `Demande ${currentRequestIndex + 1} sur ${trip.pending_requests.length}` :
              language === 'de' ? `Anfrage ${currentRequestIndex + 1} von ${trip.pending_requests.length}` :
              language === 'it' ? `Richiesta ${currentRequestIndex + 1} di ${trip.pending_requests.length}` :
              `Request ${currentRequestIndex + 1} of ${trip.pending_requests.length}`}
              </DialogDescription>
            </DialogHeader>

            {trip.pending_requests[currentRequestIndex] &&
          <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-emerald-100 text-emerald-700">
                        {(() => {
                          const name = trip.pending_requests[currentRequestIndex].name || trip.pending_requests[currentRequestIndex].email;
                          return typeof name === 'string' && name.length > 0 ? name.charAt(0).toUpperCase() : 'P';
                        })()}
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
                onClick={() => {
                  setSelectedProfileEmail(trip.pending_requests[currentRequestIndex].email);
                  setShowProfileDialog(true);
                }}
                className="gap-2">

                    <User className="w-4 h-4" />
                    {language === 'he' ? 'פרופיל' : language === 'ru' ? 'Профиль' : language === 'es' ? 'Perfil' : language === 'fr' ? 'Profil' : language === 'de' ? 'Profil' : language === 'it' ? 'Profilo' : 'Profile'}
                  </Button>
                </div>

                {trip.pending_requests[currentRequestIndex].message &&
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
            }

                {trip.pending_requests[currentRequestIndex].accessibility_needs &&
            trip.pending_requests[currentRequestIndex].accessibility_needs.length > 0 &&
            <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      {t('accessibilityNeeds')}
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {trip.pending_requests[currentRequestIndex].accessibility_needs.map((need, i) =>
                <Badge key={i} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          {t(need)}
                        </Badge>
                )}
                    </div>
                  </div>
            }
              </div>
          }

            <DialogFooter className="sm:justify-between gap-2">
              <Button
              variant="outline"
              onClick={() => setShowRequestDialog(false)}
              disabled={approveMutation.isLoading || rejectMutation.isLoading}>

                {language === 'he' ? 'סגור' : language === 'ru' ? 'Закрыть' : language === 'es' ? 'Cerrar' : language === 'fr' ? 'Fermer' : language === 'de' ? 'Schließen' : language === 'it' ? 'Chiudi' : 'Close'}
              </Button>
              <div className="flex gap-2">
                <Button
                variant="outline"
                onClick={() => rejectMutation.mutate(trip.pending_requests[currentRequestIndex].email)}
                disabled={approveMutation.isLoading || rejectMutation.isLoading}
                className="text-red-600 border-red-200 hover:bg-red-50">

                  <X className="w-4 h-4 mr-2" />
                  {language === 'he' ? 'דחה' : language === 'ru' ? 'Отклонить' : language === 'es' ? 'Rechazar' : language === 'fr' ? 'Rejeter' : language === 'de' ? 'Ablehnen' : language === 'it' ? 'Rifiuta' : 'Reject'}
                </Button>
                <Button
                onClick={() => approveMutation.mutate(trip.pending_requests[currentRequestIndex].email)}
                disabled={approveMutation.isLoading || rejectMutation.isLoading}
                className="bg-emerald-600 hover:bg-emerald-700">

                  <Check className="w-4 h-4 mr-2" />
                  {language === 'he' ? 'אשר' : language === 'ru' ? 'Одобрить' : language === 'es' ? 'Aprobar' : language === 'fr' ? 'Approuver' : language === 'de' ? 'Genehmigen' : language === 'it' ? 'Approva' : 'Approve'}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }

      {/* Share Dialog */}
      <ShareDialog
        trip={trip}
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        isOrganizer={canEdit} />


      {/* Add Organizer Dialog */}
      <Dialog open={showAddOrganizerDialog} onOpenChange={setShowAddOrganizerDialog}>
        <DialogContent dir={language === 'he' ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle>
              {language === 'he' ? 'הוסף מארגן משותף' : 'Add Co-organizer'}
            </DialogTitle>
            <DialogDescription>
              {language === 'he' ?
              'הזן את כתובת האימייל של המשתמש שברצונך להוסיף כמארגן משותף' :
              'Enter the email address of the user you want to add as a co-organizer'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>
                {language === 'he' ? 'אימייל' : 'Email'}
              </Label>
              <Input
                type="email"
                value={newOrganizerEmail}
                onChange={(e) => setNewOrganizerEmail(e.target.value)}
                placeholder={language === 'he' ? 'user@example.com' : 'user@example.com'}
                dir="ltr" />

            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddOrganizerDialog(false);
                setNewOrganizerEmail('');
              }}>

              {t('cancel')}
            </Button>
            <Button
              onClick={handleAddOrganizer}
              className="bg-emerald-600 hover:bg-emerald-700">

              <UserPlus className="w-4 h-4 mr-2" />
              {language === 'he' ? 'הוסף' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Terms Dialog */}
      <Dialog open={showTermsDialog} onOpenChange={setShowTermsDialog}>
        <DialogContent className="max-w-4xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl" dir={isRTL ? 'rtl' : 'ltr'}>
              <FileText className="w-6 h-6" />
              {language === 'he' ? 'תקנון ותנאי שימוש' : language === 'ru' ? 'Условия использования' : language === 'es' ? 'Términos de uso' : language === 'fr' ? 'Conditions d\'utilisation' : language === 'de' ? 'Nutzungsbedingungen' : language === 'it' ? 'Termini di utilizzo' : 'Terms of Use'}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <p className="text-sm text-gray-700">
                  {language === 'he' ? 'ברוכים הבאים ל-Groupy Loopy. השימוש באפליקציה ובשירותים שלנו כפוף לתנאי שימוש אלה.' :
                  language === 'ru' ? 'Добро пожаловать в Groupy Loopy. Использование приложения регулируется этими условиями.' :
                  language === 'es' ? 'Bienvenido a Groupy Loopy. El uso de nuestra aplicación está sujeto a estos términos.' :
                  language === 'fr' ? 'Bienvenue sur Groupy Loopy. L\'utilisation de notre application est soumise à ces conditions.' :
                  language === 'de' ? 'Willkommen bei Groupy Loopy. Die Nutzung unserer App unterliegt diesen Bedingungen.' :
                  language === 'it' ? 'Benvenuti su Groupy Loopy. L\'uso della nostra app è soggetto a questi termini.' :
                  'Welcome to Groupy Loopy. Use of our app is subject to these terms of use.'}
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-purple-600" />
                    <h3 className="font-bold text-lg">{language === 'he' ? 'כתב ויתור - חשוב מאוד!' : language === 'ru' ? 'Отказ от ответственности - очень важно!' : language === 'es' ? '¡Exención - muy importante!' : language === 'fr' ? 'Décharge - très important!' : language === 'de' ? 'Haftungsausschluss - sehr wichtig!' : language === 'it' ? 'Liberatoria - molto importante!' : 'Waiver - Very Important!'}</h3>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-4 border-2 border-amber-300 space-y-3">
                    <p className="text-gray-700 leading-relaxed">
                      {language === 'he' ? 'השתתפות בטיולים מאורגנים דרך האפליקציה נעשית על אחריותך הבלעדית. אתה מאשר כי:' :
                      language === 'ru' ? 'Участие в поездках организованных через приложение осуществляется на ваш собственный риск. Вы подтверждаете, что:' :
                      language === 'es' ? 'La participación en viajes organizados a través de la aplicación es bajo su propio riesgo. Usted confirma que:' :
                      language === 'fr' ? 'La participation aux voyages organisés via l\'application se fait à vos propres risques. Vous confirmez que:' :
                      language === 'de' ? 'Die Teilnahme an über die App organisierten Reisen erfolgt auf eigene Gefahr. Sie bestätigen, dass:' :
                      language === 'it' ? 'La partecipazione ai viaggi organizzati tramite l\'app avviene a proprio rischio. Confermi che:' :
                      'Participation in trips organized through the app is at your own risk. You confirm that:'}
                    </p>
                    <div className="text-sm text-gray-800 leading-relaxed space-y-4">
                      {language === 'he' ? (
                        <>
                          <p className="font-bold">1. כללי והסכמה לתנאים</p>
                          <p>השימוש באפליקציית Groupy Loopy (להלן: "האפליקציה"), לרבות שירותי המפות, תכנון המסלולים, הניווט והצטרפות לקבוצות טיול, מותנה בהסכמה מלאה ובלתי מסויגת לכל האמור במסמך זה. המשך השימוש באפליקציה מהווה אישור כי קראת והבנת את תנאיו, ואתה מסכים לפטור את בעלי האפליקציה, מפתחיה ומנהליה (להלן: "המפעילים") מכל אחריות.</p>
                          
                          <p className="font-bold">2. היעדר אחריות למידע ולניווט</p>
                          <p><strong>שירות AS-IS:</strong> המידע המוצג באפליקציה, לרבות שירותי המפות והשבילים, מבוסס על מקורות חיצוניים ופתוחים. המפעילים אינם מתחייבים לדיוק, מהימנות או שלמות הנתונים.</p>
                          <p><strong>סטיות בשטח:</strong> ייתכנו סטיות משמעותיות בין המסלול המוצג במפה לבין תנאי השטח בפועל. הניווט וההסתמכות על המידע הדיגיטלי הם באחריות המשתמש בלבד.</p>
                          
                          <p className="font-bold">3. בטיחות, כשירות ואחריות אישית</p>
                          <p><strong>אחריות המשתמש:</strong> היציאה לטיול והשימוש במסלולים המוצעים נעשים על דעת המשתמש ובאחריותו הבלעדית. על המשתמש להפעיל שיקול דעת עצמאי בשטח, לבדוק את תנאי מזג האוויר, מצב הביטחון וסכנת שיטפונות.</p>
                          <p><strong>כשירות גופנית:</strong> המשתמש מצהיר כי הוא בעל כשירות רפואית וגופנית המתאימה למסלול שנבחר.</p>
                          <p><strong>ציוד עזר:</strong> המשתמש מבין כי האפליקציה אינה תחליף למפה פיזית, מצפן, כמות מספקת של מים וציוד בטיחות נדרש.</p>
                          
                          <p className="font-bold">4. שחרור מלא מאחריות לנזקים</p>
                          <p><strong>נזקי גוף ורכוש:</strong> המפעילים לא יישאו בכל אחריות לנזק ישיר או עקיף, גופני (לרבות פציעה, נכות או מוות), כספי או רכושי, שייגרם למשתמש או לצד שלישי כתוצאה מהשימוש באפליקציה.</p>
                          <p><strong>טיולים קבוצתיים:</strong> במסגרת "טיולי קבוצות", המפעילים אינם אחראים להתנהגות המשתתפים, לאיכות הארגון או לכל אירוע פלילי או נזיקי המתרחש במהלך המפגש. המשתמש מוותר על כל טענה כלפי האפליקציה בגין פעילות של משתמשים אחרים.</p>
                          
                          <p className="font-bold">5. הגבלת אחריות טכנולוגית</p>
                          <p>המפעילים אינם אחראים לתקלות טכניות, הפסקות בשירות, איבוד קליטת GPS או שגיאות בחישובי מסלול OSRM/Google Maps שעלולות להוביל לטעות בדרך.</p>
                          
                          <p className="font-bold">6. פרטיות ושירותי מיקום</p>
                          <p>המשתמש מאשר לאפליקציה לאסוף ולשתף נתוני מיקום (GPS) בזמן אמת לצורך תפעול הניווט והצגת מיקום המשתתפים בקבוצה. המשתמש מבין כי מיקומו עשוי להיות חשוף למשתתפים אחרים בהתאם להגדרות הקבוצה.</p>
                          
                          <p className="font-bold">7. סמכות שיפוט</p>
                          <p>על כתב ויתור זה יחולו חוקי מדינת ישראל.</p>
                          
                          <div className="bg-amber-100 p-4 rounded-lg border-2 border-amber-400 mt-4">
                            <p className="font-bold mb-2">סיכום והצהרה:</p>
                            <p>באמצעות סימון תיבת האישור או שימוש באפליקציה, אני מצהיר כי:</p>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                              <li>אני מוותר על כל זכות תביעה כנגד מפתחי ומפעילי Groupy Loopy</li>
                              <li>ידוע לי כי טיולי שטח כרוכים בסכנה וכי אני לוקח על עצמי סיכון זה מרצוני החופשי</li>
                              <li>אני אחראי באופן מלא על עצמי ועל המלווים מטעמי (כולל קטינים)</li>
                            </ul>
                          </div>
                        </>
                      ) : language === 'ru' ? (
                        <>
                          <p className="font-bold">1. Общие положения и согласие с условиями</p>
                          <p>Использование приложения Groupy Loopy (далее: "Приложение"), включая картографические сервисы, планирование маршрутов, навигацию и участие в групповых поездках, обусловлено полным и безоговорочным согласием со всем, изложенным в этом документе. Продолжение использования Приложения подтверждает, что вы прочитали и поняли условия, и вы соглашаетесь освободить владельцев Приложения, его разработчиков и администраторов (далее: "Операторы") от любой ответственности.</p>
                          
                          <p className="font-bold">2. Отказ от ответственности за информацию и навигацию</p>
                          <p><strong>Сервис AS-IS:</strong> Информация, отображаемая в Приложении, включая картографические и маршрутные сервисы, основана на внешних и открытых источниках. Операторы не гарантируют точность, надежность или полноту данных.</p>
                          <p><strong>Отклонения на местности:</strong> Могут быть существенные расхождения между маршрутом, отображаемым на карте, и фактическими условиями на местности. Навигация и доверие к цифровой информации осуществляются на ответственность пользователя.</p>
                          
                          <p className="font-bold">3. Безопасность, пригодность и личная ответственность</p>
                          <p><strong>Ответственность пользователя:</strong> Выход на маршрут и использование предлагаемых маршрутов осуществляются по усмотрению пользователя и под его исключительную ответственность. Пользователь должен применять самостоятельное суждение на местности, проверять погодные условия, безопасность и риск наводнений.</p>
                          <p><strong>Физическая пригодность:</strong> Пользователь заявляет, что обладает медицинской и физической пригодностью, соответствующей выбранному маршруту.</p>
                          <p><strong>Оборудование:</strong> Пользователь понимает, что Приложение не заменяет физическую карту, компас, достаточное количество воды и необходимое защитное снаряжение.</p>
                          
                          <p className="font-bold">4. Полное освобождение от ответственности за ущерб</p>
                          <p><strong>Телесные повреждения и имущественный ущерб:</strong> Операторы не несут никакой ответственности за прямой или косвенный ущерб, телесные повреждения (включая травмы, инвалидность или смерть), финансовый или имущественный ущерб, причиненный пользователю или третьей стороне в результате использования Приложения.</p>
                          <p><strong>Групповые поездки:</strong> В рамках "групповых поездок" Операторы не несут ответственности за поведение участников, качество организации или любые криминальные или деликтные инциденты, происходящие во время мероприятия. Пользователь отказывается от любых претензий к Приложению относительно действий других пользователей.</p>
                          
                          <p className="font-bold">5. Ограничение технологической ответственности</p>
                          <p>Операторы не несут ответственности за технические сбои, прерывания в обслуживании, потерю сигнала GPS или ошибки в расчетах маршрута OSRM/Google Maps, которые могут привести к неправильному пути.</p>
                          
                          <p className="font-bold">6. Конфиденциальность и службы определения местоположения</p>
                          <p>Пользователь разрешает Приложению собирать и передавать данные о местоположении (GPS) в реальном времени для работы навигации и отображения местоположения участников группы. Пользователь понимает, что его местоположение может быть раскрыто другим участникам в соответствии с настройками группы.</p>
                          
                          <p className="font-bold">7. Юрисдикция</p>
                          <p>Настоящий отказ регулируется законами Государства Израиль.</p>
                          
                          <div className="bg-amber-100 p-4 rounded-lg border-2 border-amber-400 mt-4">
                            <p className="font-bold mb-2">Резюме и заявление:</p>
                            <p>Отмечая флажок подтверждения или используя Приложение, я заявляю, что:</p>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                              <li>Я отказываюсь от любого права на иск против разработчиков и операторов Groupy Loopy</li>
                              <li>Мне известно, что полевые поездки связаны с опасностью, и я принимаю этот риск по своей доброй воле</li>
                              <li>Я полностью несу ответственность за себя и сопровождающих лиц (включая несовершеннолетних)</li>
                            </ul>
                          </div>
                        </>
                      ) : language === 'es' ? (
                        <>
                          <p className="font-bold">1. Generalidades y consentimiento a los términos</p>
                          <p>El uso de la aplicación Groupy Loopy (en adelante: "la Aplicación"), incluidos los servicios de mapas, planificación de rutas, navegación y participación en grupos de viaje, está condicionado al consentimiento total e incondicional de todo lo establecido en este documento. El uso continuado de la Aplicación constituye la confirmación de que ha leído y comprendido sus términos, y acepta liberar a los propietarios de la Aplicación, sus desarrolladores y administradores (en adelante: "los Operadores") de toda responsabilidad.</p>
                          
                          <p className="font-bold">2. Descargo de responsabilidad por información y navegación</p>
                          <p><strong>Servicio TAL CUAL:</strong> La información mostrada en la Aplicación, incluidos los servicios de mapas y rutas, se basa en fuentes externas y abiertas. Los Operadores no garantizan la exactitud, fiabilidad o integridad de los datos.</p>
                          <p><strong>Desviaciones en el terreno:</strong> Pueden existir desviaciones significativas entre la ruta mostrada en el mapa y las condiciones reales del terreno. La navegación y confianza en la información digital son responsabilidad exclusiva del usuario.</p>
                          
                          <p className="font-bold">3. Seguridad, aptitud y responsabilidad personal</p>
                          <p><strong>Responsabilidad del usuario:</strong> La salida al viaje y el uso de las rutas propuestas se realizan bajo el criterio del usuario y bajo su exclusiva responsabilidad. El usuario debe aplicar juicio independiente en el terreno, verificar condiciones meteorológicas, situación de seguridad y riesgo de inundaciones.</p>
                          <p><strong>Aptitud física:</strong> El usuario declara que posee la aptitud médica y física apropiada para la ruta elegida.</p>
                          <p><strong>Equipo auxiliar:</strong> El usuario entiende que la Aplicación no sustituye un mapa físico, brújula, cantidad suficiente de agua y equipo de seguridad necesario.</p>
                          
                          <p className="font-bold">4. Liberación total de responsabilidad por daños</p>
                          <p><strong>Daños corporales y materiales:</strong> Los Operadores no asumirán ninguna responsabilidad por daño directo o indirecto, corporal (incluyendo lesión, discapacidad o muerte), financiero o material, causado al usuario o a terceros como resultado del uso de la Aplicación.</p>
                          <p><strong>Viajes grupales:</strong> En el contexto de "viajes grupales", los Operadores no son responsables del comportamiento de los participantes, la calidad de la organización o cualquier evento criminal o dañino que ocurra durante el encuentro. El usuario renuncia a cualquier reclamación contra la Aplicación por actividades de otros usuarios.</p>
                          
                          <p className="font-bold">5. Limitación de responsabilidad tecnológica</p>
                          <p>Los Operadores no son responsables de fallas técnicas, interrupciones del servicio, pérdida de señal GPS o errores en los cálculos de ruta OSRM/Google Maps que puedan llevar a un error en el camino.</p>
                          
                          <p className="font-bold">6. Privacidad y servicios de ubicación</p>
                          <p>El usuario autoriza a la Aplicación a recopilar y compartir datos de ubicación (GPS) en tiempo real con el propósito de operar la navegación y mostrar la ubicación de los participantes del grupo. El usuario entiende que su ubicación puede ser expuesta a otros participantes según la configuración del grupo.</p>
                          
                          <p className="font-bold">7. Jurisdicción</p>
                          <p>Este descargo de responsabilidad se rige por las leyes del Estado de Israel.</p>
                          
                          <div className="bg-amber-100 p-4 rounded-lg border-2 border-amber-400 mt-4">
                            <p className="font-bold mb-2">Resumen y declaración:</p>
                            <p>Al marcar la casilla de confirmación o usar la Aplicación, declaro que:</p>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                              <li>Renuncio a cualquier derecho de reclamación contra los desarrolladores y operadores de Groupy Loopy</li>
                              <li>Soy consciente de que los viajes al aire libre conllevan peligro y acepto este riesgo por mi propia voluntad</li>
                              <li>Soy totalmente responsable de mí mismo y de los acompañantes (incluidos menores)</li>
                            </ul>
                          </div>
                        </>
                      ) : language === 'fr' ? (
                        <>
                          <p className="font-bold">1. Généralités et consentement aux conditions</p>
                          <p>L'utilisation de l'application Groupy Loopy (ci-après : "l'Application"), y compris les services cartographiques, la planification d'itinéraires, la navigation et l'adhésion à des groupes de voyage, est conditionnée par un consentement total et inconditionnel à tout ce qui est indiqué dans ce document. La poursuite de l'utilisation de l'Application constitue une confirmation que vous avez lu et compris ses conditions, et vous acceptez de dégager les propriétaires de l'Application, ses développeurs et administrateurs (ci-après : "les Opérateurs") de toute responsabilité.</p>
                          
                          <p className="font-bold">2. Déclaration de non-responsabilité pour l'information et la navigation</p>
                          <p><strong>Service TEL QUEL :</strong> Les informations affichées dans l'Application, y compris les services de cartes et de sentiers, sont basées sur des sources externes et ouvertes. Les Opérateurs ne garantissent pas l'exactitude, la fiabilité ou l'exhaustivité des données.</p>
                          <p><strong>Écarts sur le terrain :</strong> Il peut y avoir des écarts significatifs entre l'itinéraire affiché sur la carte et les conditions réelles du terrain. La navigation et la confiance dans l'information numérique relèvent de la seule responsabilité de l'utilisateur.</p>
                          
                          <p className="font-bold">3. Sécurité, aptitude et responsabilité personnelle</p>
                          <p><strong>Responsabilité de l'utilisateur :</strong> Le départ en voyage et l'utilisation des itinéraires proposés se font à la discrétion de l'utilisateur et sous sa seule responsabilité. L'utilisateur doit faire preuve de jugement indépendant sur le terrain, vérifier les conditions météorologiques, la situation sécuritaire et le risque d'inondations.</p>
                          <p><strong>Aptitude physique :</strong> L'utilisateur déclare posséder l'aptitude médicale et physique appropriée pour l'itinéraire choisi.</p>
                          <p><strong>Équipement auxiliaire :</strong> L'utilisateur comprend que l'Application ne remplace pas une carte physique, une boussole, une quantité suffisante d'eau et l'équipement de sécurité nécessaire.</p>
                          
                          <p className="font-bold">4. Libération totale de responsabilité pour dommages</p>
                          <p><strong>Dommages corporels et matériels :</strong> Les Opérateurs n'assumeront aucune responsabilité pour les dommages directs ou indirects, corporels (y compris blessure, invalidité ou décès), financiers ou matériels, causés à l'utilisateur ou à des tiers résultant de l'utilisation de l'Application.</p>
                          <p><strong>Voyages de groupe :</strong> Dans le cadre des "voyages de groupe", les Opérateurs ne sont pas responsables du comportement des participants, de la qualité de l'organisation ou de tout événement criminel ou dommageable survenant pendant la rencontre. L'utilisateur renonce à toute réclamation contre l'Application concernant les activités d'autres utilisateurs.</p>
                          
                          <p className="font-bold">5. Limitation de responsabilité technologique</p>
                          <p>Les Opérateurs ne sont pas responsables des pannes techniques, des interruptions de service, de la perte de signal GPS ou des erreurs dans les calculs d'itinéraire OSRM/Google Maps pouvant conduire à une erreur de route.</p>
                          
                          <p className="font-bold">6. Confidentialité et services de localisation</p>
                          <p>L'utilisateur autorise l'Application à collecter et partager des données de localisation (GPS) en temps réel dans le but d'exploiter la navigation et d'afficher la localisation des participants du groupe. L'utilisateur comprend que sa localisation peut être exposée à d'autres participants selon les paramètres du groupe.</p>
                          
                          <p className="font-bold">7. Juridiction</p>
                          <p>Cette décharge est régie par les lois de l'État d'Israël.</p>
                          
                          <div className="bg-amber-100 p-4 rounded-lg border-2 border-amber-400 mt-4">
                            <p className="font-bold mb-2">Résumé et déclaration :</p>
                            <p>En cochant la case de confirmation ou en utilisant l'Application, je déclare que :</p>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                              <li>Je renonce à tout droit de réclamation contre les développeurs et opérateurs de Groupy Loopy</li>
                              <li>Je sais que les voyages de plein air comportent des dangers et j'accepte ce risque de mon plein gré</li>
                              <li>Je suis entièrement responsable de moi-même et de mes accompagnants (y compris les mineurs)</li>
                            </ul>
                          </div>
                        </>
                      ) : language === 'de' ? (
                        <>
                          <p className="font-bold">1. Allgemeines und Zustimmung zu den Bedingungen</p>
                          <p>Die Nutzung der Groupy Loopy-Anwendung (nachfolgend: "die App"), einschließlich Kartendienste, Routenplanung, Navigation und Teilnahme an Gruppenreisen, ist an die vollständige und bedingungslose Zustimmung zu allem, was in diesem Dokument festgelegt ist, gebunden. Die fortgesetzte Nutzung der App bestätigt, dass Sie die Bedingungen gelesen und verstanden haben, und Sie erklären sich damit einverstanden, die Eigentümer der App, ihre Entwickler und Administratoren (nachfolgend: "die Betreiber") von jeglicher Haftung freizustellen.</p>
                          
                          <p className="font-bold">2. Haftungsausschluss für Informationen und Navigation</p>
                          <p><strong>Service WIE BESEHEN:</strong> Die in der App angezeigten Informationen, einschließlich Karten- und Wegdienste, basieren auf externen und offenen Quellen. Die Betreiber garantieren nicht die Genauigkeit, Zuverlässigkeit oder Vollständigkeit der Daten.</p>
                          <p><strong>Abweichungen im Gelände:</strong> Es können erhebliche Abweichungen zwischen der auf der Karte angezeigten Route und den tatsächlichen Geländebedingungen bestehen. Navigation und Vertrauen in die digitalen Informationen liegen in der alleinigen Verantwortung des Benutzers.</p>
                          
                          <p className="font-bold">3. Sicherheit, Eignung und persönliche Verantwortung</p>
                          <p><strong>Verantwortung des Benutzers:</strong> Die Durchführung der Reise und die Nutzung der vorgeschlagenen Routen erfolgen nach eigenem Ermessen des Benutzers und unter seiner alleinigen Verantwortung. Der Benutzer muss im Gelände selbständig urteilen, Wetterbedingungen, Sicherheitslage und Überschwemmungsgefahr prüfen.</p>
                          <p><strong>Körperliche Eignung:</strong> Der Benutzer erklärt, dass er über die medizinische und körperliche Eignung verfügt, die für die gewählte Route geeignet ist.</p>
                          <p><strong>Hilfsausrüstung:</strong> Der Benutzer versteht, dass die App keine physische Karte, Kompass, ausreichend Wasser und erforderliche Sicherheitsausrüstung ersetzt.</p>
                          
                          <p className="font-bold">4. Vollständige Haftungsfreistellung für Schäden</p>
                          <p><strong>Körperschäden und Sachschäden:</strong> Die Betreiber übernehmen keinerlei Haftung für direkte oder indirekte Schäden, körperliche Schäden (einschließlich Verletzung, Behinderung oder Tod), finanzielle oder sachliche Schäden, die dem Benutzer oder Dritten infolge der Nutzung der App zugefügt werden.</p>
                          <p><strong>Gruppenreisen:</strong> Im Rahmen von "Gruppenreisen" sind die Betreiber nicht verantwortlich für das Verhalten der Teilnehmer, die Qualität der Organisation oder für kriminelle oder schadenverursachende Ereignisse, die während des Treffens auftreten. Der Benutzer verzichtet auf jegliche Ansprüche gegen die App bezüglich der Aktivitäten anderer Benutzer.</p>
                          
                          <p className="font-bold">5. Einschränkung der technologischen Haftung</p>
                          <p>Die Betreiber haften nicht für technische Störungen, Dienstunterbrechungen, GPS-Signalverlust oder Fehler in OSRM/Google Maps-Routenberechnungen, die zu Navigationsfehlern führen können.</p>
                          
                          <p className="font-bold">6. Datenschutz und Standortdienste</p>
                          <p>Der Benutzer autorisiert die App, Standortdaten (GPS) in Echtzeit zu sammeln und zu teilen, um die Navigation zu betreiben und den Standort der Gruppenmitglieder anzuzeigen. Der Benutzer versteht, dass sein Standort gemäß den Gruppeneinstellungen anderen Teilnehmern offengelegt werden kann.</p>
                          
                          <p className="font-bold">7. Gerichtsstand</p>
                          <p>Dieser Haftungsausschluss unterliegt den Gesetzen des Staates Israel.</p>
                          
                          <div className="bg-amber-100 p-4 rounded-lg border-2 border-amber-400 mt-4">
                            <p className="font-bold mb-2">Zusammenfassung und Erklärung:</p>
                            <p>Durch Ankreuzen des Bestätigungsfeldes oder Nutzung der App erkläre ich, dass:</p>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                              <li>Ich auf jegliches Klagerecht gegen die Entwickler und Betreiber von Groupy Loopy verzichte</li>
                              <li>Mir bekannt ist, dass Outdoor-Reisen mit Gefahren verbunden sind und ich dieses Risiko aus freiem Willen übernehme</li>
                              <li>Ich vollständig verantwortlich bin für mich und meine Begleiter (einschließlich Minderjähriger)</li>
                            </ul>
                          </div>
                        </>
                      ) : language === 'it' ? (
                        <>
                          <p className="font-bold">1. Generalità e consenso ai termini</p>
                          <p>L'uso dell'applicazione Groupy Loopy (di seguito: "l'Applicazione"), compresi i servizi di mappe, pianificazione percorsi, navigazione e adesione a gruppi di viaggio, è condizionato al consenso totale e incondizionato a tutto quanto stabilito in questo documento. Il proseguimento dell'uso dell'Applicazione costituisce conferma che hai letto e compreso i suoi termini, e accetti di sollevare i proprietari dell'Applicazione, i suoi sviluppatori e amministratori (di seguito: "gli Operatori") da ogni responsabilità.</p>
                          
                          <p className="font-bold">2. Esclusione di responsabilità per informazioni e navigazione</p>
                          <p><strong>Servizio COSÌ COM'È:</strong> Le informazioni visualizzate nell'Applicazione, compresi i servizi di mappe e sentieri, si basano su fonti esterne e aperte. Gli Operatori non garantiscono l'accuratezza, l'affidabilità o la completezza dei dati.</p>
                          <p><strong>Deviazioni sul terreno:</strong> Possono esserci deviazioni significative tra il percorso visualizzato sulla mappa e le condizioni reali del terreno. La navigazione e l'affidamento sulle informazioni digitali sono di esclusiva responsabilità dell'utente.</p>
                          
                          <p className="font-bold">3. Sicurezza, idoneità e responsabilità personale</p>
                          <p><strong>Responsabilità dell'utente:</strong> L'uscita per il viaggio e l'uso dei percorsi proposti avvengono a discrezione dell'utente e sotto la sua esclusiva responsabilità. L'utente deve applicare un giudizio indipendente sul terreno, verificare le condizioni meteorologiche, la situazione di sicurezza e il rischio di inondazioni.</p>
                          <p><strong>Idoneità fisica:</strong> L'utente dichiara di possedere l'idoneità medica e fisica appropriata per il percorso scelto.</p>
                          <p><strong>Attrezzatura ausiliaria:</strong> L'utente comprende che l'Applicazione non sostituisce una mappa fisica, bussola, quantità sufficiente di acqua e attrezzatura di sicurezza necessaria.</p>
                          
                          <p className="font-bold">4. Liberazione totale da responsabilità per danni</p>
                          <p><strong>Danni fisici e materiali:</strong> Gli Operatori non assumono alcuna responsabilità per danni diretti o indiretti, fisici (inclusi lesioni, invalidità o morte), finanziari o materiali, causati all'utente o a terzi a seguito dell'uso dell'Applicazione.</p>
                          <p><strong>Viaggi di gruppo:</strong> Nel contesto dei "viaggi di gruppo", gli Operatori non sono responsabili del comportamento dei partecipanti, della qualità dell'organizzazione o di qualsiasi evento criminale o dannoso che si verifichi durante l'incontro. L'utente rinuncia a qualsiasi reclamo contro l'Applicazione per attività di altri utenti.</p>
                          
                          <p className="font-bold">5. Limitazione di responsabilità tecnologica</p>
                          <p>Gli Operatori non sono responsabili per guasti tecnici, interruzioni del servizio, perdita del segnale GPS o errori nei calcoli del percorso OSRM/Google Maps che possono portare a errori di navigazione.</p>
                          
                          <p className="font-bold">6. Privacy e servizi di localizzazione</p>
                          <p>L'utente autorizza l'Applicazione a raccogliere e condividere dati di localizzazione (GPS) in tempo reale per il funzionamento della navigazione e la visualizzazione della posizione dei partecipanti del gruppo. L'utente comprende che la sua posizione può essere esposta ad altri partecipanti secondo le impostazioni del gruppo.</p>
                          
                          <p className="font-bold">7. Giurisdizione</p>
                          <p>Questa liberatoria è regolata dalle leggi dello Stato di Israele.</p>
                          
                          <div className="bg-amber-100 p-4 rounded-lg border-2 border-amber-400 mt-4">
                            <p className="font-bold mb-2">Riepilogo e dichiarazione:</p>
                            <p>Spuntando la casella di conferma o utilizzando l'Applicazione, dichiaro che:</p>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                              <li>Rinuncio a qualsiasi diritto di reclamo contro gli sviluppatori e operatori di Groupy Loopy</li>
                              <li>Sono consapevole che i viaggi all'aperto comportano pericoli e accetto questo rischio di mia spontanea volontà</li>
                              <li>Sono completamente responsabile per me stesso e per i miei accompagnatori (compresi i minori)</li>
                            </ul>
                          </div>
                        </>
                      ) : (
                        <>
                          <p className="font-bold">1. General and Consent to Terms</p>
                          <p>Use of the Groupy Loopy application (hereinafter: "the Application"), including map services, route planning, navigation, and joining travel groups, is conditioned upon full and unconditional consent to everything stated in this document. Continued use of the Application constitutes confirmation that you have read and understood its terms, and you agree to release the Application's owners, developers, and administrators (hereinafter: "the Operators") from any liability.</p>
                          
                          <p className="font-bold">2. Disclaimer for Information and Navigation</p>
                          <p><strong>AS-IS Service:</strong> The information displayed in the Application, including map and trail services, is based on external and open sources. The Operators do not guarantee the accuracy, reliability, or completeness of the data.</p>
                          <p><strong>Deviations on the ground:</strong> There may be significant deviations between the route displayed on the map and the actual terrain conditions. Navigation and reliance on digital information are the sole responsibility of the user.</p>
                          
                          <p className="font-bold">3. Safety, Fitness, and Personal Responsibility</p>
                          <p><strong>User's responsibility:</strong> Embarking on a trip and using the proposed routes are done at the user's discretion and under their sole responsibility. The user must exercise independent judgment in the field, check weather conditions, security situation, and flood risk.</p>
                          <p><strong>Physical fitness:</strong> The user declares they possess the medical and physical fitness appropriate for the chosen route.</p>
                          <p><strong>Auxiliary equipment:</strong> The user understands that the Application is not a substitute for a physical map, compass, sufficient water, and required safety equipment.</p>
                          
                          <p className="font-bold">4. Full Release from Liability for Damages</p>
                          <p><strong>Bodily and property damage:</strong> The Operators will not assume any liability for direct or indirect damage, bodily harm (including injury, disability, or death), financial or property damage, caused to the user or third parties as a result of using the Application.</p>
                          <p><strong>Group trips:</strong> In the context of "group trips", the Operators are not responsible for participants' behavior, the quality of organization, or any criminal or tortious event occurring during the gathering. The user waives any claim against the Application regarding activities of other users.</p>
                          
                          <p className="font-bold">5. Limitation of Technological Liability</p>
                          <p>The Operators are not liable for technical malfunctions, service interruptions, GPS signal loss, or errors in OSRM/Google Maps route calculations that may lead to navigation mistakes.</p>
                          
                          <p className="font-bold">6. Privacy and Location Services</p>
                          <p>The user authorizes the Application to collect and share location data (GPS) in real-time for the purpose of operating navigation and displaying the location of group participants. The user understands that their location may be exposed to other participants according to group settings.</p>
                          
                          <p className="font-bold">7. Jurisdiction</p>
                          <p>This waiver is governed by the laws of the State of Israel.</p>
                          
                          <div className="bg-amber-100 p-4 rounded-lg border-2 border-amber-400 mt-4">
                            <p className="font-bold mb-2">Summary and Declaration:</p>
                            <p>By checking the confirmation box or using the Application, I declare that:</p>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                              <li>I waive any right to claim against the developers and operators of Groupy Loopy</li>
                              <li>I am aware that outdoor trips involve danger and I accept this risk of my own free will</li>
                              <li>I am fully responsible for myself and my companions (including minors)</li>
                            </ul>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <h3 className="font-bold text-lg">{language === 'he' ? 'הגבלת אחריות' : language === 'ru' ? 'Ограничение ответственности' : language === 'es' ? 'Limitación de responsabilidad' : language === 'fr' ? 'Limitation de responsabilité' : language === 'de' ? 'Haftungsbeschränkung' : language === 'it' ? 'Limitazione di responsabilità' : 'Limitation of Liability'}</h3>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {language === 'he' ? 'האפליקציה מסופקת "כמות שהיא". איננו אחראים לפעולות משתמשים, נזקים מטיולים, או תקלות במערכת.' :
                    language === 'ru' ? 'Приложение предоставляется "как есть". Мы не несем ответственности за действия пользователей, ущерб от поездок или сбои в системе.' :
                    language === 'es' ? 'La aplicación se proporciona "tal cual". No somos responsables de las acciones de los usuarios, daños de viajes o fallos del sistema.' :
                    language === 'fr' ? 'L\'application est fournie "telle quelle". Nous ne sommes pas responsables des actions des utilisateurs, des dommages causés par les voyages.' :
                    language === 'de' ? 'Die App wird "wie besehen" bereitgestellt. Wir haften nicht für Nutzeraktionen, Reiseschäden oder Systemausfälle.' :
                    language === 'it' ? 'L\'app viene fornita "così com\'è". Non siamo responsabili per le azioni degli utenti, danni da viaggi o guasti del sistema.' :
                    'The app is provided "as is". We are not liable for user actions, trip damages, or system failures.'}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-center">
                <p className="text-sm text-gray-600">
                  {language === 'he' ? 'לשאלות: frimet@gmail.com' :
                  language === 'ru' ? 'Вопросы: frimet@gmail.com' :
                  language === 'es' ? 'Preguntas: frimet@gmail.com' :
                  language === 'fr' ? 'Questions: frimet@gmail.com' :
                  language === 'de' ? 'Fragen: frimet@gmail.com' :
                  language === 'it' ? 'Domande: frimet@gmail.com' :
                  'Questions: frimet@gmail.com'}
                </p>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Navigation Choice Dialog */}
      <Dialog open={showNavigationDialog} onOpenChange={setShowNavigationDialog}>
        <DialogContent className="sm:max-w-md" dir={language === 'he' ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle className="text-center">
              {language === 'he' ? 'בחר אפליקציית ניווט' : 'Choose Navigation App'}
            </DialogTitle>
            <DialogDescription className="text-center">
              {language === 'he' ?
              'איך תרצה לנווט ליעד?' :
              'How would you like to navigate to the destination?'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 py-4">
            <Button
              onClick={() => {
                const target = (() => {
                  if (trip.activity_type === 'trek' && trip.trek_days?.length > 0) {
                    const firstDay = [...trip.trek_days].sort((a, b) => a.day_number - b.day_number)[0];
                    if (firstDay?.waypoints?.length > 0) return firstDay.waypoints[firstDay.waypoints.length - 1];
                  }
                  return { latitude: trip.latitude, longitude: trip.longitude };
                })();
                const wazeUrl = `https://waze.com/ul?ll=${target.latitude},${target.longitude}&navigate=yes`;
                window.open(wazeUrl, '_blank');
                setShowNavigationDialog(false);
              }}
              className="h-24 flex flex-col gap-2 bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700">

              <div className="text-3xl">🚗</div>
              <span className="font-semibold">Waze</span>
            </Button>
            
            <Button
              onClick={() => {
                const target = (() => {
                  if (trip.activity_type === 'trek' && trip.trek_days?.length > 0) {
                    const firstDay = [...trip.trek_days].sort((a, b) => a.day_number - b.day_number)[0];
                    if (firstDay?.waypoints?.length > 0) return firstDay.waypoints[firstDay.waypoints.length - 1];
                  }
                  return { latitude: trip.latitude, longitude: trip.longitude };
                })();
                const googleUrl = `https://www.google.com/maps/dir/?api=1&destination=${target.latitude},${target.longitude}`;
                window.open(googleUrl, '_blank');
                setShowNavigationDialog(false);
              }}
              className="h-24 flex flex-col gap-2 bg-gradient-to-br from-red-500 to-yellow-500 hover:from-red-600 hover:to-yellow-600">

              <div className="text-3xl">🗺️</div>
              <span className="font-semibold">Google Maps</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Profile Preview Dialog */}
      <ProfilePreviewDialog
        open={showProfileDialog}
        onOpenChange={setShowProfileDialog}
        userEmail={selectedProfileEmail}
        userName={(() => {
          // Get userName for the selected profile
          if (!selectedProfileEmail) return null;
          // Check if it's an organizer
          if (selectedProfileEmail === trip.organizer_email) {
            return userProfiles[trip.organizer_email]?.name || trip.organizer_name;
          }
          // Check if it's an additional organizer
          const organizer = trip.additional_organizers?.find(o => o.email === selectedProfileEmail);
          if (organizer) {
            return userProfiles[selectedProfileEmail]?.name || organizer.name;
          }
          // Check if it's a participant
          const participant = trip.participants?.find(p => p.email === selectedProfileEmail);
          if (participant) {
            return userProfiles[selectedProfileEmail]?.name || participant.name;
          }
          return null;
        })()} />


      {/* Edit Participant Dialog */}
      {user && hasJoined &&
      <EditParticipantDialog
        open={showEditParticipantDialog}
        onOpenChange={setShowEditParticipantDialog}
        participant={trip?.participants?.find((p) => p.email === user.email)}
        userProfile={userProfiles[user.email]}
        onSave={handleSaveParticipantEdit}
        language={language} />

      }

      {/* Tab Settings Dialog */}
      <Dialog open={showTabSettingsDialog} onOpenChange={setShowTabSettingsDialog}>
        <DialogContent className="sm:max-w-lg" dir={language === 'he' ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle>
              {language === 'he' ? 'הגדרות טאבים' : 'Tab Settings'}
            </DialogTitle>
            <DialogDescription>
              {language === 'he' ? 'בחר אילו טאבים להציג למשתתפים' : 'Choose which tabs to show to participants'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4 max-h-[60vh] overflow-y-auto">
            {[
              { value: 'details', icon: Info, label: language === 'he' ? 'פרטים' : 'Details' },
              { value: 'map', icon: MapPin, label: language === 'he' ? 'מפה' : 'Map' },
              { value: 'navigate', icon: Navigation, label: language === 'he' ? 'נווט' : 'Navigate' },
              { value: 'participants', icon: Users, label: language === 'he' ? 'משתתפים' : 'Participants' },
              { value: 'equipment', icon: Backpack, label: language === 'he' ? 'ציוד' : 'Equipment' },
              { value: 'itinerary', icon: Calendar, label: language === 'he' ? 'לוח זמנים' : 'Itinerary' },
              { value: 'budget', icon: DollarSign, label: language === 'he' ? 'תקציב' : 'Budget' },
              { value: 'social', icon: MessageCircle, label: language === 'he' ? 'חברתי' : 'Social' },
              { value: 'chat', icon: MessageSquare, label: language === 'he' ? 'צ\'אט' : 'Chat' },
              { value: 'gallery', icon: GalleryHorizontal, label: language === 'he' ? 'גלריה' : 'Gallery' },
              { value: 'experiences', icon: Heart, label: language === 'he' ? 'חוויות' : 'Experiences' },
              { value: 'location', icon: Radio, label: language === 'he' ? 'מיקום חי' : 'Live Location' },
              { value: 'reminders', icon: Bell, label: language === 'he' ? 'תזכורות' : 'Reminders' },
              { value: 'contributions', icon: Package, label: language === 'he' ? 'מביא' : 'Bringing' },
              { value: 'invite', icon: UserPlus, label: language === 'he' ? 'הזמן' : 'Invite' }
            ].map((tab) => {
              const Icon = tab.icon;
              const isHidden = hiddenTabs.includes(tab.value);
              return (
                <div
                  key={tab.value}
                  className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all cursor-pointer ${
                    isHidden ? 'bg-gray-100 border-gray-300' : 'bg-white border-emerald-200'
                  }`}
                  onClick={() => {
                    setHiddenTabs(prev =>
                      prev.includes(tab.value)
                        ? prev.filter(t => t !== tab.value)
                        : [...prev, tab.value]
                    );
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isHidden ? 'text-gray-400' : 'text-emerald-600'}`} />
                    <span className={`font-medium ${isHidden ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                      {tab.label}
                    </span>
                  </div>
                  {isHidden ? (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-emerald-600" />
                  )}
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setHiddenTabs(trip?.hidden_tabs || []);
                setShowTabSettingsDialog(false);
              }}
            >
              {language === 'he' ? 'ביטול' : 'Cancel'}
            </Button>
            <Button
              onClick={async () => {
                await base44.entities.Trip.update(tripId, { hidden_tabs: hiddenTabs });
                queryClient.invalidateQueries(['trip', tripId]);
                setShowTabSettingsDialog(false);
                toast.success(language === 'he' ? 'ההגדרות נשמרו' : 'Settings saved');
              }}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Check className="w-4 h-4 mr-2" />
              {language === 'he' ? 'שמור' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      </div>);

}