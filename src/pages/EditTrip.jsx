// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguage } from '../components/LanguageContext';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Loader2, Upload, MapPin, Mountain, Clock, Sparkles, Navigation, Globe, Calendar, Users, Compass, Footprints, Bike, Truck, User, Dog, Tent, ArrowRight, ArrowLeft, Check, UtensilsCrossed, Route, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getRegionFromCoordinates } from '../components/utils/LocationDetector';
import LocationPicker from '../components/maps/LocationPicker';
import { getAllCountries } from '../components/utils/CountryRegions';
import WaypointsCreator from '../components/creation/WaypointsCreator';
import EquipmentCreator from '../components/creation/EquipmentCreator';
import ItineraryCreator from '../components/creation/ItineraryCreator';
import BudgetCreator from '../components/creation/BudgetCreator';
import TrekDaysCreator from '../components/trek/TrekDaysCreator';
import TrekCategoryManager from '../components/trek/TrekCategoryManager';
import TrekPaymentSettings from '../components/trek/TrekPaymentSettings';
import ScheduledMessagesEditor from '../components/messages/ScheduledMessagesEditor';

const difficulties = ['easy', 'moderate', 'challenging', 'hard', 'extreme'];
const durations = ['hours', 'half_day', 'full_day', 'overnight', 'multi_day'];
const activityTypes = ['hiking', 'cycling', 'offroad', 'running', 'culinary', 'trek'];
const cyclingTypes = ['road', 'mountain', 'gravel', 'hybrid', 'bmx', 'electric'];
const offroadVehicleTypes = ['jeep', 'atv', 'dirt_bike', 'side_by_side', 'buggy', 'truck'];
const offroadTerrainTypes = ['sand', 'rocks', 'mud', 'hills', 'desert', 'forest_trails', 'river_crossing'];
const trailTypes = ['water', 'full_shade', 'partial_shade', 'desert', 'forest', 'coastal', 'mountain', 'historical', 'urban'];
const interests = ['nature', 'history', 'photography', 'birdwatching', 'archaeology', 'geology', 'botany', 'extreme_sports', 'family_friendly', 'romantic'];
const accessibilityTypes = ['wheelchair', 'visual_impairment', 'hearing_impairment', 'mobility_aid', 'stroller_friendly', 'elderly_friendly'];

export default function EditTrip() {
  const { t, language, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [imageUploading, setImageUploading] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [searchingLocation, setSearchingLocation] = useState(false);
  const [tripId, setTripId] = useState(null);
  
  const countries = getAllCountries(language);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    country: '',
    region: '',
    sub_region: '',
    latitude: null,
    longitude: null,
    date: '',
    registration_start_date: '',
    meeting_time: '',
    duration_type: 'full_day',
    duration_value: 1,
    activity_type: 'hiking',
    difficulty: 'moderate',
    trip_character: [],
    cycling_type: '',
    cycling_distance: null,
    cycling_elevation: null,
    offroad_vehicle_type: '',
    offroad_distance: null,
    offroad_terrain_type: [],
    trail_type: [],
    interests: [],
    accessibility_types: [],
    parent_age_ranges: [],
    children_age_ranges: [],
    pets_allowed: false,
    camping_available: false,
    has_guide: false,
    guide_name: '',
    guide_topic: '',
    max_participants: 10,
    image_url: '',
    approval_required: false,
    additional_organizers: []
  });

  const [newOrganizerEmail, setNewOrganizerEmail] = useState('');
  const [waypoints, setWaypoints] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [waterRecommendation, setWaterRecommendation] = useState(null);
  const [itinerary, setItinerary] = useState([]);
  const [budget, setBudget] = useState({
    solo_min: '',
    solo_max: '',
    family_min: '',
    family_max: '',
    currency: 'ILS',
    notes: ''
  });
  const [trekDays, setTrekDays] = useState([]);
  const [dayPairs, setDayPairs] = useState([]);
  const [trekCategories, setTrekCategories] = useState([]);
  const [paymentSettings, setPaymentSettings] = useState({
    enabled: false,
    currency: 'ILS',
    base_registration_fee: 0,
    adult_age_threshold: 10,
    max_free_children: null,
    overall_max_selectable_days: null,
    payment_methods: ['paypal', 'credit_card'],
    group_discount_enabled: false,
    group_discount_percentage: 0,
    organized_group_free: false
  });
  const [scheduledMessages, setScheduledMessages] = useState([]);

  const steps = [
    { 
      id: 1, 
      title: language === 'he' ? 'פרטים בסיסיים' : 'Basic Info',
      icon: Sparkles,
      color: 'from-emerald-500 to-teal-500'
    },
    { 
      id: 2, 
      title: language === 'he' ? 'מיקום וזמן' : 'Location & Time',
      icon: MapPin,
      color: 'from-blue-500 to-cyan-500'
    },
    { 
      id: 3, 
      title: language === 'he' ? 'פרטי הפעילות' : 'Activity Details',
      icon: Mountain,
      color: 'from-amber-500 to-orange-500'
    },
    { 
      id: 4, 
      title: language === 'he' ? 'תכנון' : 'Planning',
      icon: Compass,
      color: 'from-purple-500 to-pink-500'
    }
  ];

  useEffect(() => {
    const init = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        
        if (!id) {
          toast.error(language === 'he' ? 'לא נמצא טיול' : 'Trip not found');
          navigate(createPageUrl('MyTrips'));
          return;
        }

        setTripId(id);
        const trips = await base44.entities.Trip.filter({ id });
        const trip = trips[0];

        if (!trip) {
          toast.error(language === 'he' ? 'לא נמצא טיול' : 'Trip not found');
          navigate(createPageUrl('MyTrips'));
          return;
        }

        const isManager = trip.organizer_email === userData.email || 
                          userData.role === 'admin' ||
                          trip.additional_organizers?.some(org => org.email === userData.email);

        if (!isManager) {
          toast.error(language === 'he' ? 'אין הרשאה לערוך טיול זה' : 'No permission to edit this trip');
          navigate(createPageUrl('TripDetails') + '?id=' + id);
          return;
        }

        // Load trip data into form
        setFormData({
          title: (trip.title || trip.title_he || trip.title_en || trip.title_ru || trip.title_es || trip.title_fr || trip.title_de || trip.title_it || ''),
          description: trip.description || '',
          location: trip.location || '',
          country: trip.country || 'israel',
          region: trip.region || '',
          sub_region: trip.sub_region || '',
          latitude: trip.latitude || null,
          longitude: trip.longitude || null,
          date: trip.date ? trip.date.split('T')[0] : '',
          registration_start_date: trip.registration_start_date 
            ? new Date(new Date(trip.registration_start_date).getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16) 
            : '',
          meeting_time: trip.meeting_time || '',
          duration_type: trip.duration_type || 'full_day',
          duration_value: trip.duration_value || 1,
          activity_type: trip.activity_type || 'hiking',
          difficulty: trip.difficulty || 'moderate',
          trip_character: Array.isArray(trip.trip_character) ? trip.trip_character : [],
          cycling_type: trip.cycling_type || '',
          cycling_distance: trip.cycling_distance || null,
          cycling_elevation: trip.cycling_elevation || null,
          offroad_vehicle_type: trip.offroad_vehicle_type || '',
          offroad_distance: trip.offroad_distance || null,
          offroad_terrain_type: trip.offroad_terrain_type || [],
          trail_type: trip.trail_type || [],
          interests: trip.interests || [],
          accessibility_types: trip.accessibility_types || [],
          parent_age_ranges: trip.parent_age_ranges || [],
          children_age_ranges: trip.children_age_ranges || [],
          pets_allowed: trip.pets_allowed || false,
          camping_available: trip.camping_available || false,
          has_guide: trip.has_guide || false,
          guide_name: trip.guide_name || '',
          guide_topic: trip.guide_topic || '',
          max_participants: trip.max_participants || 10,
          image_url: trip.image_url || '',
          approval_required: trip.approval_required || false,
          additional_organizers: trip.additional_organizers || []
        });

        setWaypoints(trip.waypoints || []);
        setEquipment(trip.equipment_checklist || []);
        setWaterRecommendation(trip.recommended_water_liters || null);
        setItinerary(trip.daily_itinerary || []);
        setBudget(trip.budget || {
          solo_min: '',
          solo_max: '',
          family_min: '',
          family_max: '',
          currency: 'ILS',
          notes: ''
        });
        // Load trek days with all their data including images
        setTrekDays((trip.trek_days || []).map((day, idx) => ({
          ...day,
          id: day.id || Date.now() + idx
        })));
        setDayPairs(trip.linked_days_pairs || trip.day_pairs || []);
        setTrekCategories(trip.trek_categories || []);
        setPaymentSettings(trip.payment_settings || {
          enabled: false,
          currency: 'ILS',
          base_registration_fee: 0,
          adult_age_threshold: 10,
          max_free_children: null,
          overall_max_selectable_days: null,
          payment_methods: ['paypal', 'credit_card'],
          group_discount_enabled: false,
          group_discount_percentage: 0,
          organized_group_free: false
        });
        setScheduledMessages(trip.scheduled_messages || []);

        setLoading(false);
      } catch (e) {
        console.error('Error loading trip:', e);
        toast.error(language === 'he' ? 'שגיאה בטעינת הטיול' : 'Error loading trip');
        navigate(createPageUrl('MyTrips'));
      }
    };
    init();
  }, [language, navigate]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayToggle = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
    }));
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    const oldDateStr = formData.date;
    handleChange('date', newDate);

    if (formData.activity_type === 'trek' && trekDays.length > 0 && oldDateStr && newDate) {
      const oldDate = new Date(oldDateStr);
      const date = new Date(newDate);
      const diffTime = date.getTime() - oldDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

      if (diffDays !== 0) {
        const updatedDays = trekDays.map(day => {
          if (!day.date) return day;
          const d = new Date(day.date);
          d.setDate(d.getDate() + diffDays);
          return { ...day, date: d.toISOString().split('T')[0] };
        });
        setTrekDays(updatedDays);
        toast.info(language === 'he' ? 'תאריכי ימי הטראק עודכנו בהתאם' : 'Trek days dates updated accordingly');
      }
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      handleChange('image_url', file_url);
      toast.success(language === 'he' ? 'התמונה הועלתה' : 'Image uploaded');
    } catch (error) {
      toast.error(language === 'he' ? 'שגיאה בהעלאת התמונה' : 'Error uploading image');
    }
    setImageUploading(false);
  };

  const handleLocationSearch = async () => {
    if (!formData.location) {
      toast.error(language === 'he' ? 'נא להזין מיקום' : 'Please enter a location');
      return;
    }

    setSearchingLocation(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: language === 'he'
          ? `מצא קואורדינטות GPS (latitude, longitude) עבור המיקום "${formData.location}" ב${t(formData.country)}. חפש ב-Google Maps ותן קואורדינטות מדויקות.`
          : `Find GPS coordinates (latitude, longitude) for the location "${formData.location}" in ${t(formData.country)}. Search Google Maps and provide exact coordinates.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            latitude: { type: "number" },
            longitude: { type: "number" }
          }
        }
      });
      
      setFormData(prev => ({
        ...prev,
        latitude: result.latitude,
        longitude: result.longitude
      }));
      
      setSearchingLocation(false);
      setShowMapPicker(true);
    } catch (error) {
      toast.error(language === 'he' ? 'לא ניתן למצוא את המיקום' : 'Could not find location');
      setSearchingLocation(false);
    }
  };

  const handleMapConfirm = (lat, lng) => {
    handleChange('latitude', lat);
    handleChange('longitude', lng);
    toast.success(language === 'he' ? 'מיקום נשמר' : 'Location saved');
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, steps.length));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const saveTrip = async (e) => {
    if (e) e.preventDefault();
    
    if (!formData.title || !formData.location || !formData.date) {
      toast.error(language === 'he' ? 'נא למלא את כל השדות' : 'Please fill all required fields');
      return;
    }

    setSaving(true);
    try {
      const cleanFormData = Object.fromEntries(
        Object.entries(formData).filter(([_, v]) => v !== undefined && !(typeof v === 'number' && Number.isNaN(v)))
      );

      const cleanBudget = {};
      if (budget.solo_min && budget.solo_min !== '') cleanBudget.solo_min = Number(budget.solo_min);
      if (budget.solo_max && budget.solo_max !== '') cleanBudget.solo_max = Number(budget.solo_max);
      if (budget.family_min && budget.family_min !== '') cleanBudget.family_min = Number(budget.family_min);
      if (budget.family_max && budget.family_max !== '') cleanBudget.family_max = Number(budget.family_max);
      if (budget.currency) cleanBudget.currency = budget.currency;
      if (budget.notes) cleanBudget.notes = budget.notes;

      // Calculate trek totals if trek
      let trekOverallHighest = null;
      let trekOverallLowest = null;
      let trekTotalDistance = null;
      
      if (formData.activity_type === 'trek' && trekDays.length > 0) {
        const highPoints = trekDays.filter(d => d.highest_point_m).map(d => d.highest_point_m);
        const lowPoints = trekDays.filter(d => d.lowest_point_m).map(d => d.lowest_point_m);
        const distances = trekDays.filter(d => d.daily_distance_km).map(d => d.daily_distance_km);
        
        if (highPoints.length > 0) trekOverallHighest = Math.max(...highPoints);
        if (lowPoints.length > 0) trekOverallLowest = Math.min(...lowPoints);
        if (distances.length > 0) trekTotalDistance = distances.reduce((sum, d) => sum + d, 0);
      }

      const organizersClean = (formData.additional_organizers || [])
        .filter(o => o && o.email)
        .map(o => ({
          email: (o.email || '').trim().toLowerCase(),
          ...(o.name && o.name.trim() ? { name: o.name.trim() } : {})
        }));

      const tripData = {
        ...cleanFormData,
        title: (formData.title || '').trim(),
        additional_organizers: organizersClean,
        // normalize numeric fields (allow clearing)
        max_participants: formData.max_participants === '' ? null : Number(formData.max_participants),
        waypoints: formData.activity_type === 'trek' ? [] : (waypoints || []),
        equipment_checklist: equipment || [],
        recommended_water_liters: waterRecommendation || null,
        daily_itinerary: formData.activity_type === 'trek' ? [] : (itinerary || []),
        budget: Object.keys(cleanBudget).length > 0 ? cleanBudget : undefined,
        trek_days: formData.activity_type === 'trek' ? trekDays : [],
        trek_categories: formData.activity_type === 'trek' ? trekCategories : [],
        linked_days_pairs: formData.activity_type === 'trek' ? dayPairs : [],
        payment_settings: formData.activity_type === 'trek' ? paymentSettings : undefined,
        trek_overall_highest_point_m: trekOverallHighest,
        trek_overall_lowest_point_m: trekOverallLowest,
        trek_total_distance_km: trekTotalDistance,
        scheduled_messages: scheduledMessages
      };

      console.log('Saving trek days:', JSON.stringify(trekDays, null, 2));
      console.log('Trip data being saved:', JSON.stringify(tripData, null, 2));
      await base44.entities.Trip.update(tripId, tripData);
      toast.success(language === 'he' ? 'הטיול עודכן בהצלחה!' : 'Trip updated successfully!');
      navigate(createPageUrl('TripDetails') + '?id=' + tripId);
    } catch (error) {
      console.error('Error:', error);
      toast.error(language === 'he' ? 'שגיאה בעדכון' : 'Error updating trip');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (saving) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-emerald-600" />
          <p className="text-xl font-bold text-gray-800">{language === 'he' ? 'שומר שינויים...' : 'Saving changes...'}</p>
        </div>
      </div>
    );
  }

  const progressPercent = (currentStep / steps.length) * 100;

  return (
    <>
      <LocationPicker
        isOpen={showMapPicker}
        onClose={() => setShowMapPicker(false)}
        initialLat={formData.latitude}
        initialLng={formData.longitude}
        locationName={formData.location}
        onConfirm={handleMapConfirm}
      />

      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 pb-32 md:pb-0">
        <div className="max-w-5xl mx-auto w-full flex flex-col h-full px-2 sm:px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-2 flex-shrink-0"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-3 py-1.5 sm:px-6 sm:py-2 rounded-2xl shadow-lg">
              <Compass className="w-4 h-4 sm:w-6 sm:h-6" />
              <h1 className="text-base sm:text-xl font-bold">{language === 'he' ? 'עריכת טיול' : 'Edit Trip'}</h1>
            </div>
          </motion.div>

          {/* Progress Bar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-2 flex-shrink-0"
          >
            <Card className="overflow-hidden shadow-lg border border-emerald-100">
              <CardContent className="p-2 sm:p-3">
                <div className="flex items-center justify-between mb-2">
                  {steps.map((step, idx) => {
                    const StepIcon = step.icon;
                    const isActive = currentStep === step.id;
                    const isCompleted = currentStep > step.id;
                    
                    return (
                      <React.Fragment key={step.id}>
                        <div className={`flex flex-col items-center gap-1 ${isActive || isCompleted ? 'opacity-100' : 'opacity-40'}`}>
                          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                            isCompleted 
                              ? 'bg-gradient-to-br from-green-500 to-emerald-500' 
                              : isActive 
                              ? `bg-gradient-to-br ${step.color}` 
                              : 'bg-gray-200'
                          }`}>
                            {isCompleted ? (
                              <Check className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            ) : (
                              <StepIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                            )}
                          </div>
                          <span className={`text-[10px] sm:text-xs font-semibold text-center hidden sm:block ${
                            isActive ? 'text-gray-900' : 'text-gray-500'
                          }`}>
                            {step.title.split(' ')[0]}
                          </span>
                        </div>
                        {idx < steps.length - 1 && (
                          <div className={`flex-1 h-1 mx-1 rounded-full transition-all duration-500 ${
                            currentStep > step.id ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gray-200'
                          }`} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
                <Progress value={progressPercent} className="h-1.5 bg-gray-200" />
              </CardContent>
            </Card>
          </motion.div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-1 pb-4"
            >
              {/* Step 1: Basic Info */}
              {currentStep === 1 && (
                <Card className="border border-emerald-100 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 py-2">
                    <CardTitle className="flex items-center gap-2 text-sm sm:text-lg">
                      <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                      {language === 'he' ? 'פרטים בסיסיים' : 'Basic Details'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4 space-y-2.5 sm:space-y-3">
                    <div className="space-y-1">
                      <Label className="text-sm font-semibold">{language === 'he' ? 'כותרת הטיול' : language === 'ru' ? 'Название поездки' : language === 'es' ? 'Título del viaje' : language === 'fr' ? 'Titre du voyage' : language === 'de' ? 'Reisetitel' : language === 'it' ? 'Titolo del viaggio' : 'Trip Title'} *</Label>
                      <Input
                        value={formData.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        dir={isRTL ? 'rtl' : 'ltr'}
                        className="text-sm p-2"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-sm font-semibold">{language === 'he' ? 'תיאור' : language === 'ru' ? 'Описание' : language === 'es' ? 'Descripción' : language === 'fr' ? 'Description' : language === 'de' ? 'Beschreibung' : language === 'it' ? 'Descrizione' : 'Description'}</Label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        dir={isRTL ? 'rtl' : 'ltr'}
                        rows={2}
                        className="text-sm p-2"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-sm font-semibold">{language === 'he' ? 'הוסף מנהלים לטיול' : 'Add Trip Admins'}</Label>
                      <div className="flex gap-2 mb-2">
                        <Input 
                          value={newOrganizerEmail}
                          onChange={(e) => setNewOrganizerEmail(e.target.value)}
                          placeholder={language === 'he' ? 'אימייל של מנהל נוסף' : 'Email of additional admin'}
                          className="flex-1 text-sm p-2"
                        />
                        <Button 
                          type="button"
                          size="sm"
                          onClick={() => {
                            const email = (newOrganizerEmail || '').trim().toLowerCase();
                            if (email && !formData.additional_organizers.some(o => (o.email || '').trim().toLowerCase() === email)) {
                              setFormData(prev => ({
                                ...prev,
                                additional_organizers: [...prev.additional_organizers, { email, name: '' }]
                              }));
                              setNewOrganizerEmail('');
                            }
                          }}
                          className="bg-indigo-600 hover:bg-indigo-700"
                        >
                          {language === 'he' ? 'הוסף' : 'Add'}
                        </Button>
                      </div>
                      
                      {formData.additional_organizers.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {formData.additional_organizers.map((org, idx) => (
                            <Badge key={idx} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                              <User className="w-3 h-3" />
                              {org.email}
                              <button 
                                onClick={() => {
                                  setFormData(prev => ({
                                    ...prev,
                                    additional_organizers: prev.additional_organizers.filter((_, i) => i !== idx)
                                  }));
                                }}
                                className="ml-1 hover:text-red-600"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <Label className="text-sm font-semibold">{language === 'he' ? 'העלה תמונה' : 'Upload Image'}</Label>
                      <div className="flex items-center gap-3">
                        {formData.image_url ? (
                          <img 
                            src={formData.image_url} 
                            alt="Trip" 
                            className="w-20 h-16 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-20 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Upload className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                          <Button type="button" variant="outline" size="sm" disabled={imageUploading} asChild>
                            <span className="gap-1 text-xs">
                              {imageUploading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Upload className="w-4 h-4" />
                              )}
                              {language === 'he' ? 'העלה' : 'Upload'}
                            </span>
                          </Button>
                        </label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 2: Location & Time */}
              {currentStep === 2 && (
                <Card className="border-2 border-blue-100 shadow-2xl">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 py-2 sm:py-3">
                    <CardTitle className="flex items-center gap-2 text-sm sm:text-xl">
                      <MapPin className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
                      {language === 'he' ? 'מיקום וזמן' : 'Location & Time'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-6 space-y-3 sm:space-y-4">
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">{t('location')} *</Label>
                      <div className="flex gap-2">
                        <Input
                          value={formData.location}
                          onChange={(e) => handleChange('location', e.target.value)}
                          className="flex-1 p-4"
                          dir={isRTL ? 'rtl' : 'ltr'}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleLocationSearch}
                          disabled={searchingLocation}
                          className="gap-2 px-4"
                        >
                          {searchingLocation ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Navigation className="w-5 h-5" />
                          )}
                        </Button>
                      </div>
                      {formData.latitude && formData.longitude && (
                        <p className="text-sm text-green-600 flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {language === 'he' ? 'מיקום נמצא במפה' : 'Location found on map'}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-base font-semibold flex items-center gap-2">
                          <Calendar className="w-5 h-5" />
                          {t('date')} *
                        </Label>
                        <Input
                          type="date"
                          value={formData.date}
                          onChange={handleDateChange}
                          className="p-4"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-base font-semibold flex items-center gap-2">
                          <Clock className="w-5 h-5" />
                          {language === 'he' ? 'שעת התכנסות' : 'Meeting Time'}
                        </Label>
                        <Input
                          type="time"
                          value={formData.meeting_time}
                          onChange={(e) => handleChange('meeting_time', e.target.value)}
                          className="p-4"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200">
                      <Label className="text-base font-semibold flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-indigo-600" />
                        {language === 'he' ? 'תאריך פתיחת הרשמה (אופציונלי)' : 'Registration Opens (Optional)'}
                      </Label>
                      <Input
                        type="datetime-local"
                        value={formData.registration_start_date}
                        onChange={(e) => handleChange('registration_start_date', e.target.value)}
                        className="p-4"
                      />
                      <p className="text-xs text-indigo-700 mt-1">
                        {language === 'he' 
                          ? 'אם לא מולא - ההרשמה פתוחה מיד. אם מולא - משתמשים יוכלו להצטרף רק מהתאריך שנבחר'
                          : 'If empty - registration is open immediately. If filled - users can only join from the selected date'}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-base font-semibold">{t('duration')}</Label>
                      <Select value={formData.duration_type} onValueChange={(v) => handleChange('duration_type', v)}>
                        <SelectTrigger className="p-4">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {durations.map(d => (
                            <SelectItem key={d} value={d}>{t(d)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 3: Activity Details */}
              {currentStep === 3 && (
                <Card className="border-2 border-amber-100 shadow-2xl">
                  <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 py-2 sm:py-3">
                    <CardTitle className="flex items-center gap-2 text-sm sm:text-xl">
                      <Mountain className="w-4 h-4 sm:w-6 sm:h-6 text-amber-600" />
                      {language === 'he' ? 'פרטי הפעילות' : 'Activity Details'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-6 space-y-3 sm:space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm sm:text-base font-semibold">{t('activityType')} *</Label>
                      <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                        <Button
                          type="button"
                          variant={formData.activity_type === 'hiking' ? 'default' : 'outline'}
                          className={`h-20 sm:h-28 flex flex-col items-center justify-center gap-1.5 text-xs sm:text-base font-bold ${
                            formData.activity_type === 'hiking'
                              ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-2xl scale-105'
                              : 'border-2 hover:border-emerald-500 hover:bg-emerald-50'
                          }`}
                          onClick={() => handleChange('activity_type', 'hiking')}
                        >
                          <Footprints className="w-6 h-6 sm:w-8 sm:h-8" />
                          {t('hiking')}
                        </Button>
                        <Button
                          type="button"
                          variant={formData.activity_type === 'running' ? 'default' : 'outline'}
                          className={`h-20 sm:h-28 flex flex-col items-center justify-center gap-1.5 text-xs sm:text-base font-bold ${
                            formData.activity_type === 'running'
                              ? 'bg-gradient-to-br from-violet-500 to-purple-500 text-white shadow-2xl scale-105'
                              : 'border-2 hover:border-violet-500 hover:bg-violet-50'
                          }`}
                          onClick={() => handleChange('activity_type', 'running')}
                        >
                          <User className="w-6 h-6 sm:w-8 sm:h-8" />
                          {t('running')}
                        </Button>
                        <Button
                          type="button"
                          variant={formData.activity_type === 'cycling' ? 'default' : 'outline'}
                          className={`h-20 sm:h-28 flex flex-col items-center justify-center gap-1.5 text-xs sm:text-base font-bold ${
                            formData.activity_type === 'cycling'
                              ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-2xl scale-105'
                              : 'border-2 hover:border-blue-500 hover:bg-blue-50'
                          }`}
                          onClick={() => handleChange('activity_type', 'cycling')}
                        >
                          <Bike className="w-6 h-6 sm:w-8 sm:h-8" />
                          {t('cycling')}
                        </Button>
                        <Button
                          type="button"
                          variant={formData.activity_type === 'offroad' ? 'default' : 'outline'}
                          className={`h-20 sm:h-28 flex flex-col items-center justify-center gap-1.5 text-xs sm:text-base font-bold ${
                            formData.activity_type === 'offroad'
                              ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-2xl scale-105'
                              : 'border-2 hover:border-orange-500 hover:bg-orange-50'
                          }`}
                          onClick={() => handleChange('activity_type', 'offroad')}
                        >
                          <Truck className="w-6 h-6 sm:w-8 sm:h-8" />
                          {t('offroad')}
                        </Button>
                        <Button
                          type="button"
                          variant={formData.activity_type === 'culinary' ? 'default' : 'outline'}
                          className={`h-20 sm:h-28 flex flex-col items-center justify-center gap-1.5 text-xs sm:text-base font-bold ${
                            formData.activity_type === 'culinary'
                              ? 'bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-2xl scale-105'
                              : 'border-2 hover:border-rose-500 hover:bg-rose-50'
                          }`}
                          onClick={() => handleChange('activity_type', 'culinary')}
                        >
                          <UtensilsCrossed className="w-6 h-6 sm:w-8 sm:h-8" />
                          {t('culinary')}
                        </Button>
                        <Button
                          type="button"
                          variant={formData.activity_type === 'trek' ? 'default' : 'outline'}
                          className={`h-20 sm:h-28 flex flex-col items-center justify-center gap-1.5 text-xs sm:text-base font-bold ${
                            formData.activity_type === 'trek'
                              ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-2xl scale-105'
                              : 'border-2 hover:border-indigo-500 hover:bg-indigo-50'
                          }`}
                          onClick={() => handleChange('activity_type', 'trek')}
                        >
                          <Route className="w-6 h-6 sm:w-8 sm:h-8" />
                          {language === 'he' ? 'טראק' : 'Trek'}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4 p-6 bg-indigo-50 rounded-2xl border-2 border-indigo-200">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-base font-semibold text-indigo-900">
                            {language === 'he' ? 'דרוש אישור למצטרפים' : 'Approval Required'}
                          </Label>
                          <p className="text-sm text-gray-600">
                            {language === 'he' ? 'כבוי = הצטרפות אוטומטית, דלוק = יש לאשר כל מצטרף' : 'Off = auto join, On = requires approval'}
                          </p>
                        </div>
                        <Switch
                          checked={formData.approval_required}
                          onCheckedChange={(checked) => handleChange('approval_required', checked)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-base font-semibold">{t('difficulty')}</Label>
                        <Select value={formData.difficulty} onValueChange={(v) => handleChange('difficulty', v)}>
                          <SelectTrigger className="p-4 text-base">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {difficulties.map(d => (
                              <SelectItem key={d} value={d}>{t(d)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-base font-semibold flex items-center gap-2">
                          <Users className="w-5 h-5" />
                          {t('maxParticipants')}
                        </Label>
                        <Input
                          type="number"
                          min={2}
                          max={50}
                          value={formData.max_participants}
                          onChange={(e) => handleChange('max_participants', e.target.value === '' ? '' : parseInt(e.target.value))}
                          className="p-4"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-base font-semibold">{t('trailType')}</Label>
                      <div className="flex flex-wrap gap-2">
                        {trailTypes.map(type => (
                          <Badge
                            key={type}
                            variant={formData.trail_type.includes(type) ? 'default' : 'outline'}
                            className={`cursor-pointer text-sm py-2 px-4 ${
                              formData.trail_type.includes(type) 
                                ? 'bg-emerald-600 hover:bg-emerald-700' 
                                : 'hover:border-emerald-500'
                            }`}
                            onClick={() => handleArrayToggle('trail_type', type)}
                          >
                            {t(type)}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-base font-semibold">{t('interests')}</Label>
                      <div className="flex flex-wrap gap-2">
                        {interests.map(interest => (
                          <Badge
                            key={interest}
                            variant={formData.interests.includes(interest) ? 'default' : 'outline'}
                            className={`cursor-pointer text-sm py-2 px-4 ${
                              formData.interests.includes(interest) 
                                ? 'bg-blue-600 hover:bg-blue-700' 
                                : 'hover:border-blue-500'
                            }`}
                            onClick={() => handleArrayToggle('interests', interest)}
                          >
                            {t(interest)}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 pt-2">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="pets"
                          checked={formData.pets_allowed}
                          onCheckedChange={(checked) => handleChange('pets_allowed', checked)}
                        />
                        <Label htmlFor="pets" className="cursor-pointer text-sm flex items-center gap-1">
                          <Dog className="w-4 h-4" />
                          {t('petsAllowed')}
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="camping"
                          checked={formData.camping_available}
                          onCheckedChange={(checked) => handleChange('camping_available', checked)}
                        />
                        <Label htmlFor="camping" className="cursor-pointer text-sm flex items-center gap-1">
                          <Tent className="w-4 h-4" />
                          {t('campingAvailable')}
                        </Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 4: Planning */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <ScheduledMessagesEditor
                    scheduledMessages={scheduledMessages}
                    onChange={setScheduledMessages}
                  />
                  {formData.activity_type === 'trek' ? (
                    <>
                      <TrekPaymentSettings
                        paymentSettings={paymentSettings}
                        setPaymentSettings={setPaymentSettings}
                      />
                      <TrekCategoryManager
                        categories={trekCategories}
                        setCategories={setTrekCategories}
                        currency={paymentSettings.currency}
                      />
                      <TrekDaysCreator
                        trekDays={trekDays}
                        setTrekDays={setTrekDays}
                        dayPairs={dayPairs}
                        setDayPairs={setDayPairs}
                        tripDate={formData.date}
                        tripLocation={formData.location}
                        categories={trekCategories}
                      />
                      <EquipmentCreator
                        equipment={equipment}
                        setEquipment={setEquipment}
                        waterRecommendation={waterRecommendation}
                        setWaterRecommendation={setWaterRecommendation}
                      />
                    </>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <EquipmentCreator
                        equipment={equipment}
                        setEquipment={setEquipment}
                        waterRecommendation={waterRecommendation}
                        setWaterRecommendation={setWaterRecommendation}
                      />
                      <ItineraryCreator
                        itinerary={itinerary}
                        setItinerary={setItinerary}
                      />
                      <WaypointsCreator
                        waypoints={waypoints}
                        setWaypoints={setWaypoints}
                        startLat={formData.latitude}
                        startLng={formData.longitude}
                        locationName={formData.location}
                      />
                      <BudgetCreator
                        budget={budget}
                        setBudget={setBudget}
                      />
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-20 left-0 right-0 bg-white/95 backdrop-blur-md py-3 px-4 flex justify-between gap-2 z-20 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] md:relative md:bottom-auto md:shadow-none md:px-2"
          >
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-4 py-2.5 text-sm font-semibold flex-1 max-w-[140px]"
            >
              <ArrowLeft className={`w-4 h-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
              {language === 'he' ? 'אחורה' : 'Back'}
            </Button>

            {currentStep < steps.length ? (
              <Button
                type="button"
                onClick={nextStep}
                className="px-4 py-2.5 text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 flex-1 max-w-[140px]"
              >
                {language === 'he' ? 'הבא' : 'Next'}
                <ArrowRight className={`w-4 h-4 ${isRTL ? 'mr-1' : 'ml-1'}`} />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={saveTrip}
                disabled={saving}
                className="px-4 py-2.5 text-sm font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 flex-1 max-w-[140px]"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    {language === 'he' ? 'שמור' : 'Save'}
                  </>
                )}
              </Button>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
}