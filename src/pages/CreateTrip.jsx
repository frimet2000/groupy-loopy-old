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
import { Loader2, Upload, MapPin, Mountain, Clock, Sparkles, Navigation, Globe, Calendar, Users, Compass, Footprints, Bike, Truck, User, Dog, Tent, ArrowRight, ArrowLeft, Check, ChevronRight, UtensilsCrossed, FileText, Shield, AlertTriangle, Scale, UserX, Copyright, Route } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from 'framer-motion';
import { detectUserLocation, getRegionFromCoordinates } from '../components/utils/LocationDetector';
import LocationPicker from '../components/maps/LocationPicker';
import { getAllCountries } from '../components/utils/CountryRegions';
import { israelCities, filterCities } from '../components/utils/IsraelCities';
import WaypointsCreator from '../components/creation/WaypointsCreator';
import EquipmentCreator from '../components/creation/EquipmentCreator';
import ItineraryCreator from '../components/creation/ItineraryCreator';
import BudgetCreator from '../components/creation/BudgetCreator';
import TripTemplates from '../components/templates/TripTemplates';
import TrekDaysCreator from '../components/trek/TrekDaysCreator';

const difficulties = ['easy', 'moderate', 'challenging', 'hard', 'extreme'];
const durations = ['hours', 'half_day', 'full_day', 'overnight', 'multi_day'];
const activityTypes = ['hiking', 'cycling', 'offroad', 'running', 'culinary', 'trek'];
const cyclingTypes = ['road', 'mountain', 'gravel', 'hybrid', 'bmx', 'electric'];
const offroadVehicleTypes = ['jeep', 'atv', 'dirt_bike', 'side_by_side', 'buggy', 'truck'];
const offroadTerrainTypes = ['sand', 'rocks', 'mud', 'hills', 'desert', 'forest_trails', 'river_crossing'];
const trailTypes = ['water', 'full_shade', 'partial_shade', 'desert', 'forest', 'coastal', 'mountain', 'historical', 'urban'];
const interests = ['nature', 'history', 'photography', 'birdwatching', 'archaeology', 'geology', 'botany', 'extreme_sports', 'family_friendly', 'romantic'];
const accessibilityTypes = ['wheelchair', 'visual_impairment', 'hearing_impairment', 'mobility_aid', 'stroller_friendly', 'elderly_friendly'];

export default function CreateTrip() {
  const { t, language, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [searchingLocation, setSearchingLocation] = useState(false);
  const [loadingRegions, setLoadingRegions] = useState(false);
  const [dynamicRegions, setDynamicRegions] = useState([]);
  const [loadingSubRegions, setLoadingSubRegions] = useState(false);
  const [dynamicSubRegions, setDynamicSubRegions] = useState([]);
  const [citySearch, setCitySearch] = useState('');
  const [filteredCities, setFilteredCities] = useState(israelCities);
  const [generatingItinerary, setGeneratingItinerary] = useState(false);
  const [generatingEquipment, setGeneratingEquipment] = useState(false);
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  
  const countries = getAllCountries();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    country: '',
    region: '',
    sub_region: '',
    date: '',
    meeting_time: '',
    duration_type: 'full_day',
    duration_value: 1,
    activity_type: 'hiking',
    difficulty: 'moderate',
    trip_character: '',
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
    trek_days: [],
    trek_overall_highest_point_m: null,
    trek_overall_lowest_point_m: null,
    trek_total_distance_km: null,
    participants_selected_days: []
  });

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

  const steps = [
    { 
      id: 1, 
      title: language === 'he' ? 'פרטים בסיסיים' : language === 'ru' ? 'Основная информация' : language === 'es' ? 'Información básica' : language === 'fr' ? 'Informations de base' : language === 'de' ? 'Grundlegende Informationen' : language === 'it' ? 'Informazioni di base' : 'Basic Info',
      icon: Sparkles,
      color: 'from-emerald-500 to-teal-500'
    },
    { 
      id: 2, 
      title: language === 'he' ? 'מיקום וזמן' : language === 'ru' ? 'Место и время' : language === 'es' ? 'Ubicación y hora' : language === 'fr' ? 'Lieu et heure' : language === 'de' ? 'Ort und Zeit' : language === 'it' ? 'Luogo e orario' : 'Location & Time',
      icon: MapPin,
      color: 'from-blue-500 to-cyan-500'
    },
    { 
      id: 3, 
      title: language === 'he' ? 'פרטי הפעילות' : language === 'ru' ? 'Детали активности' : language === 'es' ? 'Detalles de la actividad' : language === 'fr' ? 'Détails de l\'activité' : language === 'de' ? 'Aktivitätsdetails' : language === 'it' ? 'Dettagli dell\'attività' : 'Activity Details',
      icon: Mountain,
      color: 'from-amber-500 to-orange-500'
    },
    { 
      id: 4, 
      title: language === 'he' ? 'תכנון' : language === 'ru' ? 'Планирование' : language === 'es' ? 'Planificación' : language === 'fr' ? 'Planification' : language === 'de' ? 'Planung' : language === 'it' ? 'Pianificazione' : 'Planning',
      icon: Compass,
      color: 'from-purple-500 to-pink-500'
    },
    { 
      id: 5, 
      title: language === 'he' ? 'סיכום' : language === 'ru' ? 'Резюме' : language === 'es' ? 'Resumen' : language === 'fr' ? 'Résumé' : language === 'de' ? 'Zusammenfassung' : language === 'it' ? 'Riepilogo' : 'Summary',
      icon: Check,
      color: 'from-green-500 to-emerald-500'
    }
  ];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        
        // Set default country based on language immediately (no waiting for geolocation)
        const languageToCountry = {
          'he': 'israel',
          'en': 'uk',
          'fr': 'france',
          'es': 'spain',
          'de': 'germany',
          'it': 'italy',
          'ru': 'israel'
        };
        const defaultCountry = languageToCountry[language] || 'israel';
        setFormData(prev => ({ ...prev, country: defaultCountry }));
        fetchRegionsForCountry(defaultCountry);
        
        if (userData.home_region) {
          setFormData(prev => ({ ...prev, region: userData.home_region }));
        }
      } catch (e) {
        toast.error(language === 'he' ? 'יש להתחבר' : 'Please login');
        navigate(createPageUrl('Home'));
      }
    };
    fetchUser();
  }, [language, navigate]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'country') {
      fetchRegionsForCountry(value);
      setFormData(prev => ({ ...prev, region: '', sub_region: '', location: '' }));
      setDynamicSubRegions([]);
    }
    
    if (field === 'region' && value) {
      if (formData.country === 'israel') {
        // For Israel, region is the city/area, so set it as location
        setFormData(prev => ({ ...prev, location: value }));
      }
      fetchSubRegionsForRegion(value, formData.country);
      setFormData(prev => ({ ...prev, sub_region: '' }));
    }
    
    if (field === 'sub_region' && value) {
      // For other countries, sub_region is the city/area, so set it as location
      setFormData(prev => ({ ...prev, location: value }));
    }
  };

  const fetchRegionsForCountry = async (country) => {
    setLoadingRegions(true);
    
    // Use predefined regions for common countries to avoid slow AI calls
    const predefinedRegions = {
      israel: language === 'he' 
        ? ['תל אביב', 'ירושלים', 'חיפה', 'אילת', 'באר שבע', 'נתניה', 'הרצליה', 'רמת גן', 'פתח תקווה', 'אשדוד', 'גליל', 'גולן', 'נגב', 'כרמל', 'שרון']
        : ['tel aviv', 'jerusalem', 'haifa', 'eilat', 'beer sheva', 'netanya', 'herzliya', 'galilee', 'golan', 'negev', 'carmel', 'sharon', 'dead sea'],
      usa: ['california', 'texas', 'florida', 'new york', 'colorado', 'arizona', 'utah', 'washington', 'oregon', 'hawaii', 'alaska', 'montana'],
      france: ['paris', 'provence', 'normandy', 'brittany', 'alsace', 'loire valley', 'french alps', 'cote d\'azur', 'bordeaux', 'burgundy'],
      spain: ['barcelona', 'madrid', 'andalusia', 'basque country', 'valencia', 'galicia', 'canary islands', 'balearic islands', 'catalonia'],
      germany: ['bavaria', 'berlin', 'black forest', 'hamburg', 'munich', 'cologne', 'saxon switzerland', 'rhine valley', 'alps'],
      italy: ['rome', 'tuscany', 'amalfi coast', 'cinque terre', 'dolomites', 'lake como', 'sicily', 'sardinia', 'venice', 'milan'],
      uk: ['london', 'scotland', 'wales', 'lake district', 'cornwall', 'cotswolds', 'yorkshire', 'peak district', 'highlands']
    };
    
    if (predefinedRegions[country]) {
      setDynamicRegions(predefinedRegions[country]);
      setLoadingRegions(false);
      return;
    }
    
    // Fallback to AI for other countries
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `List 8-10 main regions/states in ${t(country)}. Return only names in English lowercase, comma-separated.`,
        add_context_from_internet: false,
        response_json_schema: {
          type: "object",
          properties: {
            regions: { type: "array", items: { type: "string" } }
          }
        }
      });
      setDynamicRegions(result.regions || []);
    } catch (error) {
      console.error('Error fetching regions:', error);
      setDynamicRegions([]);
    }
    setLoadingRegions(false);
  };

  const fetchSubRegionsForRegion = async (region, country) => {
    // Skip sub-regions for Israel (region is already specific enough)
    if (country === 'israel') {
      setDynamicSubRegions([]);
      return;
    }
    
    setLoadingSubRegions(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `List 6-8 cities/areas in ${region}, ${t(country)}. Names only, English lowercase, comma-separated.`,
        add_context_from_internet: false,
        response_json_schema: {
          type: "object",
          properties: {
            sub_regions: { type: "array", items: { type: "string" } }
          }
        }
      });
      setDynamicSubRegions(result.sub_regions || []);
    } catch (error) {
      console.error('Error fetching sub-regions:', error);
      setDynamicSubRegions([]);
    }
    setLoadingSubRegions(false);
  };

  const handleArrayToggle = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
    }));
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
    const searchQuery = formData.location || formData.sub_region || formData.region;
    
    if (!searchQuery) {
      toast.error(language === 'he' ? 'נא לבחור אזור או להזין מיקום' : 'Please select area or enter location');
      return;
    }

    setSearchingLocation(true);
    try {
      const countryName = t(formData.country);
      const locationQuery = formData.location
        ? formData.sub_region 
          ? `${formData.location}, ${formData.sub_region}, ${formData.region}, ${countryName}`
          : formData.region
          ? `${formData.location}, ${formData.region}, ${countryName}`
          : `${formData.location}, ${countryName}`
        : formData.sub_region
        ? `${formData.sub_region}, ${formData.region}, ${countryName}`
        : formData.region
        ? `${formData.region}, ${countryName}`
        : countryName;
        
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: language === 'he'
          ? `מצא קואורדינטות GPS (latitude, longitude) עבור המיקום "${locationQuery}". חפש ב-Google Maps ותן קואורדינטות מדויקות.`
          : `Find GPS coordinates (latitude, longitude) for the location "${locationQuery}". Search Google Maps and provide exact coordinates.`,
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

  const handleMapConfirm = async (lat, lng) => {
    const exactLat = parseFloat(lat);
    const exactLng = parseFloat(lng);
    
    console.log('Map confirmed:', exactLat, exactLng);
    
    // Update coordinates immediately
    setFormData(prev => ({
      ...prev,
      latitude: exactLat,
      longitude: exactLng
    }));
    
    // Always get location name from coordinates when pin is placed
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${exactLat}&lon=${exactLng}&accept-language=${language === 'he' ? 'he' : 'en'}`
      );
      const data = await response.json();
      
      // Extract a meaningful location name
      const locationName = data.address?.tourism || 
                          data.address?.attraction || 
                          data.address?.village || 
                          data.address?.town || 
                          data.address?.city || 
                          data.address?.county || 
                          data.name || 
                          formData.sub_region || 
                          formData.region;
      
      if (locationName) {
        setFormData(prev => ({
          ...prev,
          location: locationName
        }));
      }
    } catch (error) {
      console.error('Error getting location name:', error);
    }
    
    setShowMapPicker(false);
    toast.success(
      language === 'he' 
        ? `מיקום נשמר: ${exactLat.toFixed(6)}, ${exactLng.toFixed(6)}` 
        : language === 'ru'
        ? `Местоположение сохранено: ${exactLat.toFixed(6)}, ${exactLng.toFixed(6)}`
        : language === 'es'
        ? `Ubicación guardada: ${exactLat.toFixed(6)}, ${exactLng.toFixed(6)}`
        : language === 'fr'
        ? `Emplacement enregistré: ${exactLat.toFixed(6)}, ${exactLng.toFixed(6)}`
        : language === 'de'
        ? `Standort gespeichert: ${exactLat.toFixed(6)}, ${exactLng.toFixed(6)}`
        : language === 'it'
        ? `Posizione salvata: ${exactLat.toFixed(6)}, ${exactLng.toFixed(6)}`
        : `Location saved: ${exactLat.toFixed(6)}, ${exactLng.toFixed(6)}`
    );
  };

  const handleGenerateItinerary = async () => {
    if (!formData.location || !formData.duration_type) {
      toast.error(language === 'he' ? 'נא למלא מיקום ומשך טיול' : 'Please fill location and duration');
      return;
    }

    setGeneratingItinerary(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: language === 'he'
          ? `צור מסלול יומי מפורט לטיול ${formData.activity_type} במשך ${formData.duration_value} ${t(formData.duration_type)} במיקום ${formData.location}, ${formData.region}, ${t(formData.country)}.
רמת קושי: ${t(formData.difficulty)}
סוגי שביל: ${formData.trail_type.map(t => t).join(', ')}
תחומי עניין: ${formData.interests.map(t => t).join(', ')}

חשוב מאוד: שמור על הקשר גיאוגרפי מדויק! אל תציע דברים שלא הגיוניים - למשל, אל תציע ביקור במדבר אם המיקום הוא נתניה או חיפה. התבסס רק על אטרקציות, שבילים ומסלולים שממש קיימים באזור הספציפי הזה.

צור מסלול עם פעילויות לכל יום, כולל שעות מוצעות ותיאור קצר לכל פעילות. החזר כ-JSON array של ימים.`
          : `Create a detailed daily itinerary for a ${formData.duration_value} ${t(formData.duration_type)} ${formData.activity_type} trip at ${formData.location}, ${formData.region}, ${t(formData.country)}.
Difficulty: ${t(formData.difficulty)}
Trail types: ${formData.trail_type.map(type => t(type)).join(', ')}
Interests: ${formData.interests.map(int => t(int)).join(', ')}

CRITICAL: Maintain accurate geographical context! Do not suggest illogical things - for example, don't suggest visiting a desert if the location is Netanya or Haifa. Base recommendations ONLY on actual attractions, trails, and routes that exist in this specific area.

Create an itinerary with activities for each day, including suggested times and brief descriptions. Return as JSON array of days.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            days: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  day: { type: "number" },
                  title: { type: "string" },
                  activities: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        time: { type: "string" },
                        activity: { type: "string" },
                        notes: { type: "string" }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (result.days && result.days.length > 0) {
        const newItinerary = result.days.map((day, idx) => ({
          id: Date.now() + idx,
          day: day.day || idx + 1,
          title: day.title || `Day ${idx + 1}`,
          activities: day.activities.map((act, actIdx) => ({
            id: Date.now() + idx * 100 + actIdx,
            time: act.time || '09:00',
            activity: act.activity,
            notes: act.notes || ''
          }))
        }));
        setItinerary(newItinerary);
        toast.success(language === 'he' ? 'מסלול נוצר בהצלחה!' : 'Itinerary generated successfully!');
      }
    } catch (error) {
      console.error('Error generating itinerary:', error);
      toast.error(language === 'he' ? 'שגיאה ביצירת מסלול' : 'Error generating itinerary');
    }
    setGeneratingItinerary(false);
  };

  const handleGenerateEquipment = async () => {
    if (!formData.activity_type || !formData.duration_type) {
      toast.error(language === 'he' ? 'נא לבחור סוג פעילות ומשך טיול' : 'Please select activity type and duration');
      return;
    }

    setGeneratingEquipment(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: language === 'he'
          ? `צור רשימת ציוד מומלצת לטיול ${formData.activity_type} במשך ${formData.duration_value} ${t(formData.duration_type)} במיקום ${formData.location || formData.region}, ${t(formData.country)}.
רמת קושי: ${t(formData.difficulty)}
מזג אויר: ${formData.date ? new Date(formData.date).toLocaleDateString() : 'לא מצוין'}
סוגי שביל: ${formData.trail_type.map(t => t).join(', ')}
מותר בעלי חיים: ${formData.pets_allowed ? 'כן' : 'לא'}
קמפינג: ${formData.camping_available ? 'כן' : 'לא'}

חשוב: התאם את הציוד למאפיינים הספציפיים של האזור והשטח. למשל, אם זה אזור חופי - ציוד חוף, אם זה הרים - ציוד הרים, אם זה מדבר - הגנה מהשמש וכו'.

כלול המלצה לכמות מים בליטרים ורשימת פריטי ציוד מפורטת.`
          : `Create a recommended packing list for a ${formData.duration_value} ${t(formData.duration_type)} ${formData.activity_type} trip at ${formData.location || formData.region}, ${t(formData.country)}.
Difficulty: ${t(formData.difficulty)}
Date: ${formData.date ? new Date(formData.date).toLocaleDateString() : 'Not specified'}
Trail types: ${formData.trail_type.map(type => t(type)).join(', ')}
Pets allowed: ${formData.pets_allowed ? 'Yes' : 'No'}
Camping: ${formData.camping_available ? 'Yes' : 'No'}

IMPORTANT: Adapt equipment to the specific characteristics of the area and terrain. For example, if it's a coastal area - beach gear, if it's mountains - mountain gear, if it's desert - sun protection, etc.

Include water recommendation in liters and detailed equipment list.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            water_liters: { type: "number" },
            equipment: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  item: { type: "string" },
                  category: { type: "string" }
                }
              }
            }
          }
        }
      });

      if (result.water_liters) {
        setWaterRecommendation(result.water_liters);
      }
      
      if (result.equipment && result.equipment.length > 0) {
        const newEquipment = result.equipment.map((item, idx) => ({
          id: Date.now() + idx,
          item: item.item,
          checked: false,
          category: item.category || 'General'
        }));
        setEquipment(newEquipment);
        toast.success(language === 'he' ? 'רשימת ציוד נוצרה בהצלחה!' : 'Packing list generated successfully!');
      }
    } catch (error) {
      console.error('Error generating equipment:', error);
      toast.error(language === 'he' ? 'שגיאה ביצירת רשימת ציוד' : 'Error generating packing list');
    }
    setGeneratingEquipment(false);
  };

  const [missingFields, setMissingFields] = useState([]);

  const validateStep = (step) => {
    const missing = [];
    
    switch(step) {
      case 1:
        if (!formData.title) {
          missing.push('title');
          toast.error(
            language === 'he' ? '⚠️ נא להזין כותרת לטיול' :
            language === 'ru' ? '⚠️ Введите название поездки' :
            language === 'es' ? '⚠️ Ingrese el título del viaje' :
            language === 'fr' ? '⚠️ Entrez le titre du voyage' :
            language === 'de' ? '⚠️ Geben Sie den Reisename ein' :
            language === 'it' ? '⚠️ Inserisci il titolo del viaggio' :
            '⚠️ Please enter trip title'
          );
        }
        break;
      case 2:
        if (!formData.location) missing.push('location');
        if (!formData.date) missing.push('date');
        
        if (missing.length > 0) {
          toast.error(
            language === 'he' ? '⚠️ נא למלא את כל השדות המסומנים' :
            language === 'ru' ? '⚠️ Заполните все отмеченные поля' :
            language === 'es' ? '⚠️ Complete todos los campos marcados' :
            language === 'fr' ? '⚠️ Remplissez tous les champs marqués' :
            language === 'de' ? '⚠️ Füllen Sie alle markierten Felder aus' :
            language === 'it' ? '⚠️ Compila tutti i campi contrassegnati' :
            '⚠️ Please fill all marked fields'
          );
        }
        break;
      case 3:
        return true;
      case 4:
        return true;
      default:
        return true;
    }
    
    setMissingFields(missing);
    return missing.length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setMissingFields([]);
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!validateStep(currentStep)) return;
    await saveTrip();
  };

  const handleApplyTemplate = (templateData) => {
    // Apply template data to form
    setFormData(prev => ({
      ...prev,
      ...templateData,
      // Keep user's own inputs if already filled
      title: prev.title || '',
      description: prev.description || '',
      location: prev.location || '',
      date: prev.date || '',
    }));
    
    // Apply itinerary
    if (templateData.daily_itinerary?.length > 0) {
      setItinerary(templateData.daily_itinerary);
    }
    
    // Apply equipment
    if (templateData.equipment_checklist?.length > 0) {
      setEquipment(templateData.equipment_checklist);
    }
    
    // Apply water recommendation
    if (templateData.recommended_water_liters) {
      setWaterRecommendation(templateData.recommended_water_liters);
    }
    
    // Apply budget
    if (templateData.budget) {
      setBudget(templateData.budget);
    }
    
    toast.success(language === 'he' ? 'התבנית הוחלה בהצלחה!' : 'Template applied successfully!');
  };

  const saveTrip = async () => {
    setSaving(true);
    
    try {
      const cleanFormData = Object.fromEntries(
        Object.entries(formData).filter(([_, v]) => v !== undefined && v !== null && v !== '')
      );

      // Clean budget - convert empty strings to null or remove them
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

      const tripData = {
        ...cleanFormData,
        current_participants: 1,
        status: 'open',
        organizer_name: user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : (user?.full_name || user?.email || ''),
        organizer_email: user?.email || '',
        organizer_waiver_accepted: true,
        organizer_waiver_timestamp: new Date().toISOString(),
        participants: [{
          email: user?.email || '',
          name: user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : (user?.full_name || user?.email || ''),
          joined_at: new Date().toISOString(),
          accessibility_needs: [],
          waiver_accepted: true,
          waiver_timestamp: new Date().toISOString()
        }],
        waypoints: formData.activity_type === 'trek' ? [] : (waypoints || []),
        equipment_checklist: equipment || [],
        recommended_water_liters: waterRecommendation || null,
        daily_itinerary: formData.activity_type === 'trek' ? [] : (itinerary || []),
        budget: Object.keys(cleanBudget).length > 0 ? cleanBudget : undefined,
        trek_days: formData.activity_type === 'trek' ? trekDays : [],
        trek_overall_highest_point_m: trekOverallHighest,
        trek_overall_lowest_point_m: trekOverallLowest,
        trek_total_distance_km: trekTotalDistance
      };

      const createdTrip = await base44.entities.Trip.create(tripData);
      navigate(createPageUrl('TripSummary') + '?id=' + createdTrip.id);
    } catch (error) {
      console.error('Error creating trip:', error);
      toast.error(language === 'he' ? 'שגיאה: ' + error.message : 'Error: ' + error.message);
      setSaving(false);
    }
  };

  if (!user) return null;

  const progressPercent = (currentStep / steps.length) * 100;

  if (saving) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-emerald-600" />
          <p className="text-xl font-bold text-gray-800">{language === 'he' ? 'יוצר את הטיול...' : 'Creating trip...'}</p>
        </div>
      </div>
    );
  }

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

      <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 overflow-hidden">
        <div className="max-w-5xl mx-auto w-full flex flex-col h-full px-2 sm:px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-2 flex-shrink-0"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-3 py-1.5 sm:px-6 sm:py-2 rounded-2xl shadow-lg">
              <Compass className="w-4 h-4 sm:w-6 sm:h-6" />
              <h1 className="text-base sm:text-xl font-bold">{t('createTrip')}</h1>
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
              className="flex-1 overflow-y-auto pb-4"
            >
              {/* Step 1: Basic Info */}
              {currentStep === 1 && (
                <Card className="border border-emerald-100 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 py-2 flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-sm sm:text-lg">
                        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                        {language === 'he' ? 'פרטים בסיסיים' : language === 'ru' ? 'Основная информация' : language === 'es' ? 'Información básica' : language === 'fr' ? 'Informations de base' : language === 'de' ? 'Grundinformationen' : language === 'it' ? 'Informazioni di base' : 'Basic Details'}
                      </CardTitle>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowTemplates(true)}
                        className="gap-2 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 hover:from-purple-100 hover:to-pink-100"
                      >
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        <span className="hidden sm:inline">{language === 'he' ? 'השתמש בתבנית' : 'Use Template'}</span>
                        <span className="sm:hidden">{language === 'he' ? 'תבנית' : 'Template'}</span>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4 space-y-2.5 sm:space-y-3">
                    <div className="space-y-1">
                      <Label className="text-sm font-semibold">
                        {language === 'he' ? 'כותרת הטיול' :
                         language === 'ru' ? 'Название поездки' :
                         language === 'es' ? 'Título del viaje' :
                         language === 'fr' ? 'Titre du voyage' :
                         language === 'de' ? 'Reisename' :
                         language === 'it' ? 'Titolo del viaggio' :
                         'Trip Title'} *
                      </Label>
                      <Input
                        value={formData.title}
                        onChange={(e) => {
                          handleChange('title', e.target.value);
                          if (missingFields.includes('title')) {
                            setMissingFields(prev => prev.filter(f => f !== 'title'));
                          }
                        }}
                        placeholder={language === 'he' ? 'למשל: טיול בגליל' :
                                    language === 'ru' ? 'напр., Поход в горы' :
                                    language === 'es' ? 'ej., Excursión a la montaña' :
                                    language === 'fr' ? 'ex., Randonnée en montagne' :
                                    language === 'de' ? 'z.B., Bergwanderung' :
                                    language === 'it' ? 'es., Escursione in montagna' :
                                    'e.g., Mountain Hike'}
                        dir={isRTL ? 'rtl' : 'ltr'}
                        className={`text-sm p-2 ${
                          missingFields.includes('title') 
                            ? 'border-2 border-red-500 bg-red-50' 
                            : ''
                        }`}
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-sm font-semibold">
                        {language === 'he' ? 'תיאור' :
                         language === 'ru' ? 'Описание' :
                         language === 'es' ? 'Descripción' :
                         language === 'fr' ? 'Description' :
                         language === 'de' ? 'Beschreibung' :
                         language === 'it' ? 'Descrizione' :
                         'Description'}
                      </Label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        placeholder={language === 'he' ? 'ספר על הטיול...' :
                                    language === 'ru' ? 'Расскажите о поездке...' :
                                    language === 'es' ? 'Cuéntanos sobre el viaje...' :
                                    language === 'fr' ? 'Parlez-nous de votre voyage...' :
                                    language === 'de' ? 'Erzählen Sie über die Reise...' :
                                    language === 'it' ? 'Raccontaci del viaggio...' :
                                    'Tell us about your trip...'}
                        dir={isRTL ? 'rtl' : 'ltr'}
                        rows={2}
                        className="text-sm p-2"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-sm font-semibold">
                        {language === 'he' ? 'העלה תמונה' :
                         language === 'ru' ? 'Загрузить изображение' :
                         language === 'es' ? 'Subir imagen' :
                         language === 'fr' ? 'Télécharger une image' :
                         language === 'de' ? 'Bild hochladen' :
                         language === 'it' ? 'Carica immagine' :
                         'Upload Image'}
                      </Label>
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
                              {language === 'he' ? 'העלה' :
                               language === 'ru' ? 'Загрузить' :
                               language === 'es' ? 'Subir' :
                               language === 'fr' ? 'Télécharger' :
                               language === 'de' ? 'Hochladen' :
                               language === 'it' ? 'Carica' :
                               'Upload'}
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
                      {language === 'he' ? 'מיקום וזמן' : language === 'ru' ? 'Место и время' : language === 'es' ? 'Ubicación y hora' : language === 'fr' ? 'Lieu et heure' : language === 'de' ? 'Ort und Zeit' : language === 'it' ? 'Luogo e orario' : 'Location & Time'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-6 space-y-3 sm:space-y-4">
                    <div className="space-y-2">
                      <Label className="text-lg font-semibold flex items-center gap-2">
                        <Globe className="w-5 h-5" />
                        {t('country')} *
                      </Label>
                      <Select 
                        value={formData.country} 
                        onValueChange={(v) => handleChange('country', v)}
                      >
                        <SelectTrigger className="p-6 text-base">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {countries.map(c => (
                            <SelectItem key={c} value={c}>{t(c)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-base font-semibold">
                        {t('location')} * 
                        {language === 'he' && <span className="text-sm text-gray-500 font-normal mr-2">(ניתן לסמן נק' ספציפית על המפה)</span>}
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          value={formData.location}
                          onChange={(e) => {
                            handleChange('location', e.target.value);
                            if (missingFields.includes('location')) {
                              setMissingFields(prev => prev.filter(f => f !== 'location'));
                            }
                          }}
                          className={missingFields.includes('location') ? 'border-2 border-red-500 bg-red-50' : ''}
                          placeholder={
                            formData.country === 'israel' 
                              ? (language === 'he' ? 'לדוגמה: נחל עמוד, מצדה, עין גדי' : 'e.g., Nahal Amud, Masada, Ein Gedi')
                            : formData.country === 'usa'
                              ? (language === 'he' ? 'לדוגמה: Grand Canyon, Yosemite' : language === 'es' ? 'ej., Grand Canyon, Yosemite' : language === 'fr' ? 'ex., Grand Canyon, Yosemite' : language === 'de' ? 'z.B. Grand Canyon, Yosemite' : language === 'it' ? 'es., Grand Canyon, Yosemite' : 'e.g., Grand Canyon, Yosemite')
                            : formData.country === 'france'
                              ? (language === 'fr' ? 'ex., Mont Blanc, Chamonix, Verdon' : language === 'he' ? 'לדוגמה: Mont Blanc, Chamonix' : language === 'es' ? 'ej., Mont Blanc, Chamonix' : language === 'de' ? 'z.B. Mont Blanc, Chamonix' : language === 'it' ? 'es., Mont Blanc, Chamonix' : 'e.g., Mont Blanc, Chamonix')
                            : formData.country === 'spain'
                              ? (language === 'es' ? 'ej., Sierra de Guadarrama, Picos de Europa' : language === 'he' ? 'לדוגמה: Sierra de Guadarrama' : language === 'fr' ? 'ex., Sierra de Guadarrama' : language === 'de' ? 'z.B. Sierra de Guadarrama' : language === 'it' ? 'es., Sierra de Guadarrama' : 'e.g., Sierra de Guadarrama')
                            : formData.country === 'italy'
                              ? (language === 'it' ? 'es., Dolomiti, Cinque Terre, Lago di Como' : language === 'he' ? 'לדוגמה: Dolomiti, Cinque Terre' : language === 'es' ? 'ej., Dolomiti, Cinque Terre' : language === 'fr' ? 'ex., Dolomiti, Cinque Terre' : language === 'de' ? 'z.B. Dolomiti, Cinque Terre' : 'e.g., Dolomiti, Cinque Terre')
                            : formData.country === 'germany'
                              ? (language === 'de' ? 'z.B. Schwarzwald, Alpen, Harz' : language === 'he' ? 'לדוגמה: Schwarzwald, Alpen' : language === 'es' ? 'ej., Schwarzwald, Alpen' : language === 'fr' ? 'ex., Schwarzwald, Alpen' : language === 'it' ? 'es., Schwarzwald, Alpen' : 'e.g., Black Forest, Alps')
                            : formData.country === 'switzerland'
                              ? (language === 'de' ? 'z.B. Matterhorn, Jungfrau, Interlaken' : language === 'fr' ? 'ex., Matterhorn, Jungfrau' : language === 'it' ? 'es., Matterhorn, Jungfrau' : language === 'he' ? 'לדוגמה: Matterhorn, Jungfrau' : 'e.g., Matterhorn, Jungfrau')
                            : formData.country === 'norway'
                              ? (language === 'he' ? 'לדוגמה: Trolltunga, Preikestolen' : language === 'es' ? 'ej., Trolltunga, Preikestolen' : language === 'fr' ? 'ex., Trolltunga, Preikestolen' : language === 'de' ? 'z.B. Trolltunga, Preikestolen' : language === 'it' ? 'es., Trolltunga, Preikestolen' : 'e.g., Trolltunga, Preikestolen')
                            : formData.country === 'new_zealand'
                              ? (language === 'he' ? 'לדוגמה: Milford Sound, Mount Cook' : 'e.g., Milford Sound, Mount Cook')
                            : formData.country === 'japan'
                              ? (language === 'he' ? 'לדוגמה: Mount Fuji, Kyoto' : language === 'es' ? 'ej., Monte Fuji, Kioto' : language === 'fr' ? 'ex., Mont Fuji, Kyoto' : language === 'de' ? 'z.B. Fuji, Kyoto' : language === 'it' ? 'es., Monte Fuji, Kyoto' : 'e.g., Mount Fuji, Kyoto')
                            : (language === 'he' ? 'שם מדויק של המיקום' : language === 'es' ? 'Nombre específico' : language === 'fr' ? 'Nom spécifique' : language === 'de' ? 'Spezifischer Name' : language === 'it' ? 'Nome specifico' : 'Specific location name')
                          }
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
                          {language === 'he' ? 'מיקום נמצא במפה' : language === 'ru' ? 'Местоположение найдено' : language === 'es' ? 'Ubicación encontrada' : language === 'fr' ? 'Emplacement trouvé' : language === 'de' ? 'Standort gefunden' : language === 'it' ? 'Posizione trovata' : 'Location found on map'}
                        </p>
                      )}
                      {missingFields.includes('location') && (
                        <p className="text-red-600 text-sm font-semibold animate-bounce">
                          {language === 'he' ? '⚠️ שדה חובה - נא להזין מיקום' : '⚠️ Required field - please enter location'}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-base font-semibold flex items-center gap-2">
                          <Calendar className="w-5 h-5" />
                          {t('date')} *
                        </Label>
                        <Input
                          type="date"
                          value={formData.date}
                          onChange={(e) => {
                            handleChange('date', e.target.value);
                            if (missingFields.includes('date')) {
                              setMissingFields(prev => prev.filter(f => f !== 'date'));
                            }
                          }}
                          className={`p-4 ${missingFields.includes('date') ? 'border-2 border-red-500 bg-red-50' : ''}`}
                        />
                        {missingFields.includes('date') && (
                          <p className="text-red-600 text-sm font-semibold animate-bounce">
                            {language === 'he' ? '⚠️ שדה חובה - נא לבחור תאריך' : '⚠️ Required field - please select a date'}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-base font-semibold flex items-center gap-2">
                          <Clock className="w-5 h-5" />
                          {language === 'he' ? 'שעת התכנסות' : language === 'ru' ? 'Время встречи' : language === 'es' ? 'Hora de encuentro' : language === 'fr' ? 'Heure de rendez-vous' : language === 'de' ? 'Treffzeit' : language === 'it' ? 'Orario di ritrovo' : 'Meeting Time'}
                        </Label>
                        <Input
                          type="time"
                          value={formData.meeting_time}
                          onChange={(e) => handleChange('meeting_time', e.target.value)}
                          className="p-4"
                        />
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
                      {language === 'he' ? 'פרטי הפעילות' : language === 'ru' ? 'Детали активности' : language === 'es' ? 'Detalles de la actividad' : language === 'fr' ? 'Détails de l\'activité' : language === 'de' ? 'Aktivitätsdetails' : language === 'it' ? 'Dettagli dell\'attività' : 'Activity Details'}
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
                          {language === 'he' ? 'טראק' : language === 'ru' ? 'Трек' : language === 'es' ? 'Trekking' : language === 'fr' ? 'Trekking' : language === 'de' ? 'Trekking' : language === 'it' ? 'Trekking' : 'Trek'}
                          </Button>
                      </div>
                    </div>

                    {formData.activity_type === 'trek' && (
                      <div className="space-y-4 p-6 bg-indigo-50 rounded-2xl border-2 border-indigo-200">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label className="text-base font-semibold text-indigo-900">
                              {language === 'he' ? 'דרוש אישור למצטרפים' : language === 'ru' ? 'Требуется одобрение' : language === 'es' ? 'Se requiere aprobación' : language === 'fr' ? 'Approbation requise' : language === 'de' ? 'Genehmigung erforderlich' : language === 'it' ? 'Richiesta approvazione' : 'Approval Required'}
                            </Label>
                            <p className="text-sm text-gray-600">
                              {language === 'he' ? 'כבוי = הצטרפות אוטומטית, דלוק = יש לאשר כל מצטרף' : language === 'ru' ? 'Выкл = автоматическая регистрация, Вкл = требуется одобрение' : language === 'es' ? 'Off = registro automático, On = requiere aprobación' : language === 'fr' ? 'Off = inscription automatique, On = approbation requise' : language === 'de' ? 'Aus = automatische Anmeldung, Ein = Genehmigung erforderlich' : language === 'it' ? 'Off = registrazione automatica, On = approvazione richiesta' : 'Off = auto join, On = requires approval'}
                            </p>
                          </div>
                          <Switch
                            checked={formData.approval_required}
                            onCheckedChange={(checked) => handleChange('approval_required', checked)}
                          />
                        </div>
                      </div>
                    )}

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
                          onChange={(e) => handleChange('max_participants', parseInt(e.target.value))}
                          className="p-4"
                        />
                      </div>
                    </div>

                    {formData.activity_type === 'cycling' && (
                      <div className="space-y-4 p-6 bg-blue-50 rounded-2xl">
                        <h3 className="text-lg font-bold text-blue-900">{language === 'he' ? 'פרטי רכיבה' : language === 'ru' ? 'Детали велопоездки' : language === 'es' ? 'Detalles del ciclismo' : language === 'fr' ? 'Détails du cyclisme' : language === 'de' ? 'Radfahrdetails' : language === 'it' ? 'Dettagli del ciclismo' : 'Cycling Details'}</h3>
                        <div className="space-y-2">
                          <Label>{t('cyclingType')}</Label>
                          <Select value={formData.cycling_type} onValueChange={(v) => handleChange('cycling_type', v)}>
                            <SelectTrigger className="p-4">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {cyclingTypes.map(type => (
                                <SelectItem key={type} value={type}>{t(type)}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>{t('cyclingDistance')}</Label>
                            <Input
                              type="number"
                              min={1}
                              value={formData.cycling_distance}
                              onChange={(e) => handleChange('cycling_distance', parseInt(e.target.value))}
                              className="p-4"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>{t('cyclingElevation')}</Label>
                            <Input
                              type="number"
                              min={0}
                              value={formData.cycling_elevation}
                              onChange={(e) => handleChange('cycling_elevation', parseInt(e.target.value))}
                              className="p-4"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {formData.activity_type === 'offroad' && (
                      <div className="space-y-4 p-6 bg-orange-50 rounded-2xl">
                        <h3 className="text-lg font-bold text-orange-900">{language === 'he' ? 'פרטי שטח' : language === 'ru' ? 'Детали внедорожной поездки' : language === 'es' ? 'Detalles del todoterreno' : language === 'fr' ? 'Détails du tout-terrain' : language === 'de' ? 'Offroad-Details' : language === 'it' ? 'Dettagli del fuoristrada' : 'Off-Road Details'}</h3>
                        <div className="space-y-2">
                          <Label>{t('offroadVehicleType')}</Label>
                          <Select value={formData.offroad_vehicle_type} onValueChange={(v) => handleChange('offroad_vehicle_type', v)}>
                            <SelectTrigger className="p-4">
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
                            min={1}
                            value={formData.offroad_distance}
                            onChange={(e) => handleChange('offroad_distance', parseInt(e.target.value))}
                            className="p-4"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label>{t('offroadTerrainType')}</Label>
                          <div className="flex flex-wrap gap-2">
                            {offroadTerrainTypes.map(type => (
                              <Badge
                                key={type}
                                variant={formData.offroad_terrain_type.includes(type) ? 'default' : 'outline'}
                                className={`cursor-pointer text-sm py-2 px-4 ${
                                  formData.offroad_terrain_type.includes(type) 
                                    ? 'bg-orange-600 hover:bg-orange-700' 
                                    : 'hover:border-orange-500'
                                }`}
                                onClick={() => handleArrayToggle('offroad_terrain_type', type)}
                              >
                                {t(type)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

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

                    <div className="space-y-3">
                      <Label className="text-base font-semibold">{language === 'he' ? 'אופי הטיול' : 'Trip Character'}</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {['families', 'couples', 'seniors', 'singles', 'lgbtq'].map(char => (
                          <Button
                            key={char}
                            type="button"
                            variant={formData.trip_character === char ? 'default' : 'outline'}
                            size="sm"
                            className={`h-auto py-2 ${
                              formData.trip_character === char
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                : 'hover:border-emerald-500'
                            }`}
                            onClick={() => handleChange('trip_character', char)}
                          >
                            {char === 'families' ? (language === 'he' ? 'משפחות' : 'Families') :
                             char === 'couples' ? (language === 'he' ? 'זוגות' : 'Couples') :
                             char === 'seniors' ? (language === 'he' ? 'גיל השלישי' : 'Seniors') :
                             char === 'singles' ? (language === 'he' ? 'היכרויות' : 'Singles') :
                             char === 'lgbtq' ? (language === 'he' ? 'להט״ב' : 'LGBTQ+') : char}
                          </Button>
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
                  {formData.activity_type === 'trek' ? (
                    <>
                      <TrekDaysCreator
                        trekDays={trekDays}
                        setTrekDays={setTrekDays}
                      />
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <EquipmentCreator
                          equipment={equipment}
                          setEquipment={setEquipment}
                          waterRecommendation={waterRecommendation}
                          setWaterRecommendation={setWaterRecommendation}
                          onGenerateAI={generatingEquipment ? null : handleGenerateEquipment}
                        />
                        <BudgetCreator
                          budget={budget}
                          setBudget={setBudget}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <EquipmentCreator
                        equipment={equipment}
                        setEquipment={setEquipment}
                        waterRecommendation={waterRecommendation}
                        setWaterRecommendation={setWaterRecommendation}
                        onGenerateAI={generatingEquipment ? null : handleGenerateEquipment}
                      />
                      <ItineraryCreator
                        itinerary={itinerary}
                        setItinerary={setItinerary}
                        onGenerateAI={generatingItinerary ? null : handleGenerateItinerary}
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

              {/* Step 5: Summary */}
              {currentStep === 5 && (
                <Card className="border-2 border-green-100 shadow-2xl">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <Check className="w-7 h-7 text-green-600" />
                      {language === 'he' ? 'סיכום הטיול' : language === 'ru' ? 'Резюме поездки' : language === 'es' ? 'Resumen del viaje' : language === 'fr' ? 'Résumé du voyage' : language === 'de' ? 'Reisezusammenfassung' : language === 'it' ? 'Riepilogo del viaggio' : 'Trip Summary'}
                    </CardTitle>
                    <CardDescription>{language === 'he' ? 'בדוק שהכל נכון לפני פרסום' : language === 'ru' ? 'Проверьте все перед публикацией' : language === 'es' ? 'Revisa todo antes de publicar' : language === 'fr' ? 'Vérifiez tout avant de publier' : language === 'de' ? 'Überprüfen Sie alles vor der Veröffentlichung' : language === 'it' ? 'Rivedi tutto prima di pubblicare' : 'Review everything before publishing'}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                    {/* Main Info */}
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-2xl">
                      <h3 className="text-3xl font-bold mb-3 text-emerald-900">{formData.title}</h3>
                      {formData.image_url && (
                        <img src={formData.image_url} alt="Trip" className="w-full h-80 object-cover rounded-xl mb-4 shadow-lg" />
                      )}
                      {formData.description && (
                        <p className="text-gray-700 text-lg mb-6 leading-relaxed">{formData.description}</p>
                      )}
                      
                      {/* Key Details Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-white/70 p-5 rounded-xl">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-emerald-700">
                            <MapPin className="w-4 h-4" />
                            <span className="font-semibold text-sm">{language === 'he' ? 'מיקום' : 'Location'}</span>
                          </div>
                          <p className="text-gray-800">{formData.location}</p>
                          <p className="text-gray-500 text-sm">{formData.region}, {t(formData.country)}</p>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-emerald-700">
                            <Calendar className="w-4 h-4" />
                            <span className="font-semibold text-sm">{language === 'he' ? 'תאריך' : 'Date'}</span>
                          </div>
                          <p className="text-gray-800">{new Date(formData.date).toLocaleDateString()}</p>
                          {formData.meeting_time && (
                            <p className="text-gray-500 text-sm">{language === 'he' ? 'התכנסות:' : 'Meeting:'} {formData.meeting_time}</p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-emerald-700">
                            <Clock className="w-4 h-4" />
                            <span className="font-semibold text-sm">{language === 'he' ? 'משך' : 'Duration'}</span>
                          </div>
                          <p className="text-gray-800">{t(formData.duration_type)}</p>
                          {formData.duration_value > 1 && (
                            <p className="text-gray-500 text-sm">{formData.duration_value} {language === 'he' ? 'ימים' : 'days'}</p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-emerald-700">
                            <Mountain className="w-4 h-4" />
                            <span className="font-semibold text-sm">{language === 'he' ? 'פעילות' : 'Activity'}</span>
                          </div>
                          <p className="text-gray-800">{t(formData.activity_type)}</p>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-emerald-700">
                            <Compass className="w-4 h-4" />
                            <span className="font-semibold text-sm">{language === 'he' ? 'רמת קושי' : 'Difficulty'}</span>
                          </div>
                          <p className="text-gray-800">{t(formData.difficulty)}</p>
                        </div>
                        {formData.trip_character && (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-emerald-700">
                              <Users className="w-4 h-4" />
                              <span className="font-semibold text-sm">{language === 'he' ? 'אופי' : 'Character'}</span>
                            </div>
                            <p className="text-gray-800">
                              {formData.trip_character === 'families' ? (language === 'he' ? 'משפחות' : 'Families') :
                               formData.trip_character === 'couples' ? (language === 'he' ? 'זוגות' : 'Couples') :
                               formData.trip_character === 'seniors' ? (language === 'he' ? 'גיל השלישי' : 'Seniors') :
                               formData.trip_character === 'singles' ? (language === 'he' ? 'היכרויות' : 'Singles') :
                               formData.trip_character === 'lgbtq' ? (language === 'he' ? 'להט״ב' : 'LGBTQ+') : ''}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Activity Specific Details */}
                    {formData.activity_type === 'cycling' && formData.cycling_type && (
                      <div className="bg-blue-50 p-6 rounded-xl">
                        <h4 className="font-bold text-lg mb-3 text-blue-900">{language === 'he' ? 'פרטי רכיבה' : 'Cycling Details'}</h4>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-semibold text-blue-700">{language === 'he' ? 'סוג:' : 'Type:'}</span>
                            <p className="text-gray-800">{t(formData.cycling_type)}</p>
                          </div>
                          {formData.cycling_distance && (
                            <div>
                              <span className="font-semibold text-blue-700">{language === 'he' ? 'מרחק:' : 'Distance:'}</span>
                              <p className="text-gray-800">{formData.cycling_distance} {language === 'he' ? 'ק״מ' : 'km'}</p>
                            </div>
                          )}
                          {formData.cycling_elevation && (
                            <div>
                              <span className="font-semibold text-blue-700">{language === 'he' ? 'עליה:' : 'Elevation:'}</span>
                              <p className="text-gray-800">{formData.cycling_elevation} {language === 'he' ? 'מטר' : 'm'}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {formData.activity_type === 'offroad' && formData.offroad_vehicle_type && (
                      <div className="bg-orange-50 p-6 rounded-xl">
                        <h4 className="font-bold text-lg mb-3 text-orange-900">{language === 'he' ? 'פרטי שטח' : 'Off-Road Details'}</h4>
                        <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                          <div>
                            <span className="font-semibold text-orange-700">{language === 'he' ? 'רכב:' : 'Vehicle:'}</span>
                            <p className="text-gray-800">{t(formData.offroad_vehicle_type)}</p>
                          </div>
                          {formData.offroad_distance && (
                            <div>
                              <span className="font-semibold text-orange-700">{language === 'he' ? 'מרחק:' : 'Distance:'}</span>
                              <p className="text-gray-800">{formData.offroad_distance} {language === 'he' ? 'ק״מ' : 'km'}</p>
                            </div>
                          )}
                        </div>
                        {formData.offroad_terrain_type.length > 0 && (
                          <div>
                            <span className="font-semibold text-orange-700 text-sm">{language === 'he' ? 'סוגי שטח:' : 'Terrain:'}</span>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {formData.offroad_terrain_type.map(type => (
                                <Badge key={type} className="bg-orange-600">{t(type)}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Trail Types & Interests */}
                    {(formData.trail_type.length > 0 || formData.interests.length > 0) && (
                      <div className="bg-purple-50 p-6 rounded-xl space-y-4">
                        {formData.trail_type.length > 0 && (
                          <div>
                            <h4 className="font-bold text-purple-900 mb-2">{language === 'he' ? 'סוגי מסלול' : 'Trail Types'}</h4>
                            <div className="flex flex-wrap gap-2">
                              {formData.trail_type.map(type => (
                                <Badge key={type} variant="outline" className="border-purple-400 text-purple-700">{t(type)}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {formData.interests.length > 0 && (
                          <div>
                            <h4 className="font-bold text-purple-900 mb-2">{language === 'he' ? 'תחומי עניין' : 'Interests'}</h4>
                            <div className="flex flex-wrap gap-2">
                              {formData.interests.map(int => (
                                <Badge key={int} variant="outline" className="border-purple-400 text-purple-700">{t(int)}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Equipment List */}
                    {equipment.length > 0 && (
                      <div className="bg-amber-50 p-6 rounded-xl">
                        <h4 className="font-bold text-lg mb-3 text-amber-900 flex items-center gap-2">
                          <Check className="w-5 h-5" />
                          {language === 'he' ? 'רשימת ציוד' : 'Equipment List'}
                          {waterRecommendation && (
                            <span className="text-sm font-normal text-amber-700">
                              ({language === 'he' ? 'מים מומלצים:' : 'Water:'} {waterRecommendation}L)
                            </span>
                          )}
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {equipment.map(item => (
                            <div key={item.id} className="flex items-center gap-2 text-sm text-gray-700">
                              <Check className="w-4 h-4 text-emerald-600" />
                              <span>{item.item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Daily Itinerary */}
                    {itinerary.length > 0 && (
                      <div className="bg-indigo-50 p-6 rounded-xl">
                        <h4 className="font-bold text-lg mb-4 text-indigo-900">{language === 'he' ? 'מסלול יומי' : 'Daily Itinerary'}</h4>
                        <div className="space-y-4">
                          {itinerary.map(day => (
                            <div key={day.id} className="bg-white p-4 rounded-lg shadow-sm">
                              <h5 className="font-bold text-indigo-800 mb-2">
                                {language === 'he' ? `יום ${day.day}` : `Day ${day.day}`}: {day.title}
                              </h5>
                              <div className="space-y-2">
                                {day.activities.map(activity => (
                                  <div key={activity.id} className="flex gap-3 text-sm">
                                    <span className="font-semibold text-indigo-600 w-16">{activity.time}</span>
                                    <div className="flex-1">
                                      <p className="font-medium text-gray-800">{activity.activity}</p>
                                      {activity.notes && <p className="text-gray-600 text-xs mt-1">{activity.notes}</p>}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Waypoints */}
                    {waypoints.length > 0 && (
                      <div className="bg-teal-50 p-6 rounded-xl">
                        <h4 className="font-bold text-lg mb-3 text-teal-900">{language === 'he' ? 'נקודות ציון' : 'Waypoints'}</h4>
                        <div className="space-y-2">
                          {waypoints.map((wp, idx) => (
                            <div key={wp.id} className="flex items-start gap-3 bg-white p-3 rounded-lg">
                              <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                                {idx + 1}
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-gray-800">{wp.name}</p>
                                {wp.description && <p className="text-gray-600 text-sm">{wp.description}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Budget */}
                    {(budget.solo_min > 0 || budget.family_min > 0 || budget.notes) && (
                      <div className="bg-rose-50 p-6 rounded-xl">
                        <h4 className="font-bold text-lg mb-3 text-rose-900">{language === 'he' ? 'תקציב משוער' : 'Estimated Budget'}</h4>
                        <div className="grid grid-cols-2 gap-4">
                          {budget.solo_min > 0 && (
                            <div className="bg-white p-4 rounded-lg">
                              <p className="text-sm text-rose-700 font-semibold mb-1">{language === 'he' ? 'סולו' : 'Solo'}</p>
                              <p className="text-xl font-bold text-gray-800">
                                {budget.solo_min} - {budget.solo_max} {budget.currency}
                              </p>
                            </div>
                          )}
                          {budget.family_min > 0 && (
                            <div className="bg-white p-4 rounded-lg">
                              <p className="text-sm text-rose-700 font-semibold mb-1">{language === 'he' ? 'משפחה' : 'Family'}</p>
                              <p className="text-xl font-bold text-gray-800">
                                {budget.family_min} - {budget.family_max} {budget.currency}
                              </p>
                            </div>
                          )}
                        </div>
                        {budget.notes && (
                          <p className="text-gray-600 text-sm mt-3">{budget.notes}</p>
                        )}
                      </div>
                    )}

                    {/* Additional Info */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                     <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                       <Users className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                       <p className="text-2xl font-bold text-gray-800">{formData.max_participants}</p>
                       <p className="text-xs text-gray-600">{language === 'he' ? 'משתתפים מקס׳' : 'Max Participants'}</p>
                     </div>
                     {formData.pets_allowed && (
                       <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                         <Dog className="w-6 h-6 text-green-600 mx-auto mb-2" />
                         <p className="text-sm font-semibold text-gray-800">{language === 'he' ? 'מותר בעלי חיים' : 'Pets Allowed'}</p>
                       </div>
                     )}
                     {formData.camping_available && (
                       <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                         <Tent className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                         <p className="text-sm font-semibold text-gray-800">{language === 'he' ? 'אפשרות קמפינג' : 'Camping Available'}</p>
                       </div>
                     )}
                    </div>

                    {/* Terms Link */}
                    <div className="bg-blue-50 p-4 rounded-xl text-center border border-blue-200">
                      <p className="text-sm text-gray-700 mb-2">
                        {language === 'he' ? 'מומלץ לקרוא את' : language === 'ru' ? 'Рекомендуем прочитать' : language === 'es' ? 'Recomendamos leer' : language === 'fr' ? 'Nous recommandons de lire' : language === 'de' ? 'Wir empfehlen zu lesen' : language === 'it' ? 'Si consiglia di leggere' : 'We recommend reading'}
                      </p>
                      <Button 
                        type="button"
                        variant="link"
                        onClick={() => setShowTermsDialog(true)}
                        className="text-blue-600 hover:text-blue-800 font-semibold underline"
                      >
                        {language === 'he' ? 'תנאי השימוש וכתב הויתור' : language === 'ru' ? 'Условия использования и отказ от ответственности' : language === 'es' ? 'Términos de uso y exención' : language === 'fr' ? 'Conditions d\'utilisation et décharge' : language === 'de' ? 'Nutzungsbedingungen und Haftungsausschluss' : language === 'it' ? 'Termini di utilizzo e liberatoria' : 'Terms of Use and Waiver'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="sticky bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 py-3 px-2 flex justify-between gap-2 flex-shrink-0 shadow-lg z-20"
          >
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-4 py-2.5 text-sm font-semibold flex-1 max-w-[140px]"
            >
              <ArrowLeft className={`w-4 h-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
              {language === 'he' ? 'אחורה' : language === 'ru' ? 'Назад' : language === 'es' ? 'Atrás' : language === 'fr' ? 'Retour' : language === 'de' ? 'Zurück' : language === 'it' ? 'Indietro' : 'Back'}
            </Button>

            {currentStep < steps.length ? (
              <Button
                type="button"
                onClick={nextStep}
                className="px-4 py-2.5 text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 flex-1 max-w-[140px]"
              >
                {language === 'he' ? 'הבא' : language === 'ru' ? 'Далее' : language === 'es' ? 'Siguiente' : language === 'fr' ? 'Suivant' : language === 'de' ? 'Weiter' : language === 'it' ? 'Avanti' : 'Next'}
                <ArrowRight className={`w-4 h-4 ${isRTL ? 'mr-1' : 'ml-1'}`} />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSubmit(e);
                }}
                disabled={saving}
                className="px-4 py-2.5 text-sm font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 flex-1 max-w-[140px] touch-manipulation"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    {language === 'he' ? 'פרסם' : language === 'ru' ? 'Опубликовать' : language === 'es' ? 'Publicar' : language === 'fr' ? 'Publier' : language === 'de' ? 'Veröffentlichen' : language === 'it' ? 'Pubblica' : 'Publish'}
                  </>
                )}
              </Button>
            )}
          </motion.div>
        </div>
      </div>

      {/* Templates Dialog */}
      <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
        <DialogContent className="max-w-4xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="w-6 h-6 text-purple-600" />
              {language === 'he' ? 'בחר תבנית טיול' : 'Choose Trip Template'}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            <TripTemplates 
              onSelectTemplate={handleApplyTemplate}
              onClose={() => setShowTemplates(false)}
            />
          </ScrollArea>
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
                  {language === 'he' ? 'ברוכים הבאים ל-Groupy Loopy. השימוש באפליקציה ובשירותים שלנו כפוף לתנאי שימוש אלה.' 
                   : language === 'ru' ? 'Добро пожаловать в Groupy Loopy. Использование приложения регулируется этими условиями.'
                   : language === 'es' ? 'Bienvenido a Groupy Loopy. El uso de nuestra aplicación está sujeto a estos términos.'
                   : language === 'fr' ? 'Bienvenue sur Groupy Loopy. L\'utilisation de notre application est soumise à ces conditions.'
                   : language === 'de' ? 'Willkommen bei Groupy Loopy. Die Nutzung unserer App unterliegt diesen Bedingungen.'
                   : language === 'it' ? 'Benvenuti su Groupy Loopy. L\'uso della nostra app è soggetto a questi termini.'
                   : 'Welcome to Groupy Loopy. Use of our app is subject to these terms of use.'}
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
                      {language === 'he' ? 'השתתפות בטיולים מאורגנים דרך האפליקציה נעשית על אחריותך הבלעדית. אתה מאשר כי:'
                       : language === 'ru' ? 'Участие в поездках организованных через приложение осуществляется на ваш собственный риск. Вы подтверждаете, что:'
                       : language === 'es' ? 'La participación en viajes organizados a través de la aplicación es bajo su propio riesgo. Usted confirma que:'
                       : language === 'fr' ? 'La participation aux voyages organisés via l\'application se fait à vos propres risques. Vous confirmez que:'
                       : language === 'de' ? 'Die Teilnahme an über die App organisierten Reisen erfolgt auf eigene Gefahr. Sie bestätigen, dass:'
                       : language === 'it' ? 'La partecipazione ai viaggi organizzati tramite l\'app avviene a proprio rischio. Confermi che:'
                       : 'Participation in trips organized through the app is at your own risk. You confirm that:'}
                    </p>
                    <ul className="space-y-2 text-sm">
                      {(language === 'he' ? [
                        'אתה כשיר מבחינה בריאותית ופיזית להשתתף בפעילות',
                        'אתה אחראי לבדוק את התנאים, הציוד והסיכונים הכרוכים בטיול',
                        'האפליקציה ומפעיליה אינם אחראים לכל פגיעה, נזק או אובדן שיגרם לך',
                        'המארגן והמשתתפים אינם אחראים לבטיחותך האישית',
                        'אתה מוותר על כל תביעה כנגד האפליקציה, המפעילים והמשתתפים האחרים',
                        'מומלץ בחום לקחת ביטוח נסיעות מתאים'
                      ] : language === 'ru' ? [
                        'Вы физически и медицински здоровы для участия в активности',
                        'Вы несете ответственность за проверку условий, оборудования и рисков поездки',
                        'Приложение и его операторы не несут ответственности за травмы, ущерб или потери',
                        'Организатор и участники не несут ответственности за вашу безопасность',
                        'Вы отказываетесь от претензий к приложению, операторам и участникам',
                        'Настоятельно рекомендуется оформить соответствующую страховку'
                      ] : language === 'es' ? [
                        'Está física y médicamente apto para participar en la actividad',
                        'Es responsable de verificar las condiciones, equipo y riesgos del viaje',
                        'La aplicación y sus operadores no son responsables de lesiones, daños o pérdidas',
                        'El organizador y participantes no son responsables de su seguridad',
                        'Renuncia a reclamaciones contra la aplicación, operadores y participantes',
                        'Se recomienda encarecidamente contratar un seguro de viaje'
                      ] : language === 'fr' ? [
                        'Vous êtes physiquement et médicalement apte à participer à l\'activité',
                        'Vous êtes responsable de vérifier les conditions, l\'équipement et les risques',
                        'L\'application et ses opérateurs ne sont pas responsables des blessures, dommages ou pertes',
                        'L\'organisateur et les participants ne sont pas responsables de votre sécurité',
                        'Vous renoncez aux réclamations contre l\'application, les opérateurs et les participants',
                        'Il est fortement recommandé de souscrire une assurance voyage'
                      ] : language === 'de' ? [
                        'Sie sind körperlich und medizinisch fit für die Teilnahme an der Aktivität',
                        'Sie sind verantwortlich für die Überprüfung der Bedingungen, Ausrüstung und Risiken',
                        'Die App und ihre Betreiber haften nicht für Verletzungen, Schäden oder Verluste',
                        'Der Organisator und Teilnehmer sind nicht für Ihre Sicherheit verantwortlich',
                        'Sie verzichten auf Ansprüche gegen die App, Betreiber und Teilnehmer',
                        'Es wird dringend empfohlen, eine Reiseversicherung abzuschließen'
                      ] : language === 'it' ? [
                        'Sei fisicamente e medicalmente idoneo a partecipare all\'attività',
                        'Sei responsabile di verificare condizioni, attrezzatura e rischi del viaggio',
                        'L\'app e i suoi operatori non sono responsabili di lesioni, danni o perdite',
                        'L\'organizzatore e i partecipanti non sono responsabili della tua sicurezza',
                        'Rinunci a reclami contro l\'app, operatori e partecipanti',
                        'Si raccomanda vivamente di stipulare un\'assicurazione di viaggio'
                      ] : [
                        'You are physically and medically fit to participate in the activity',
                        'You are responsible for checking conditions, equipment, and risks',
                        'The app and its operators are not liable for injuries, damage, or loss',
                        'The organizer and participants are not responsible for your safety',
                        'You waive claims against the app, operators, and other participants',
                        'Travel insurance is strongly recommended'
                      ]).map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-amber-600 mt-1">•</span>
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <UserX className="w-5 h-5 text-purple-600" />
                    <h3 className="font-bold text-lg">{language === 'he' ? 'כשירות לשימוש' : language === 'ru' ? 'Право на использование' : language === 'es' ? 'Elegibilidad' : language === 'fr' ? 'Éligibilité' : language === 'de' ? 'Berechtigung' : language === 'it' ? 'Idoneità' : 'Eligibility'}</h3>
                  </div>
                  <ul className="space-y-2 text-sm">
                    {(language === 'he' ? [
                      'עליך להיות בגיל 18 לפחות',
                      'עליך לספק מידע מדויק',
                      'אתה אחראי לשמירה על סודיות הסיסמה',
                      'אסור להעביר את חשבונך לאחרים'
                    ] : language === 'ru' ? [
                      'Вам должно быть не менее 18 лет',
                      'Вы должны предоставить точную информацию',
                      'Вы несете ответственность за конфиденциальность пароля',
                      'Вы не можете передать учетную запись другим'
                    ] : language === 'es' ? [
                      'Debe tener al menos 18 años',
                      'Debe proporcionar información precisa',
                      'Es responsable de la confidencialidad de su contraseña',
                      'No puede transferir su cuenta a otros'
                    ] : language === 'fr' ? [
                      'Vous devez avoir au moins 18 ans',
                      'Vous devez fournir des informations exactes',
                      'Vous êtes responsable de la confidentialité du mot de passe',
                      'Vous ne pouvez pas transférer votre compte à d\'autres'
                    ] : language === 'de' ? [
                      'Sie müssen mindestens 18 Jahre alt sein',
                      'Sie müssen genaue Informationen angeben',
                      'Sie sind für die Vertraulichkeit des Passworts verantwortlich',
                      'Sie können Ihr Konto nicht an andere übertragen'
                    ] : language === 'it' ? [
                      'Devi avere almeno 18 anni',
                      'Devi fornire informazioni accurate',
                      'Sei responsabile della riservatezza della password',
                      'Non puoi trasferire il tuo account ad altri'
                    ] : [
                      'You must be at least 18 years old',
                      'You must provide accurate information',
                      'You are responsible for password confidentiality',
                      'You may not transfer your account to others'
                    ]).map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-purple-600 mt-1">•</span>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <h3 className="font-bold text-lg">{language === 'he' ? 'הגבלת אחריות' : language === 'ru' ? 'Ограничение ответственности' : language === 'es' ? 'Limitación de responsabilidad' : language === 'fr' ? 'Limitation de responsabilité' : language === 'de' ? 'Haftungsbeschränkung' : language === 'it' ? 'Limitazione di responsabilità' : 'Limitation of Liability'}</h3>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {language === 'he' ? 'האפליקציה מסופקת "כמות שהיא". איננו אחראים לפעולות משתמשים, נזקים מטיולים, או תקלות במערכת. אחריותנו מוגבלת לסכום ששילמת (אם בכלל) בשנים עשרת החודשים האחרונים.'
                     : language === 'ru' ? 'Приложение предоставляется "как есть". Мы не несем ответственности за действия пользователей, ущерб от поездок или сбои в системе. Наша ответственность ограничена суммой, которую вы заплатили (если таковая имеется) за последние двенадцать месяцев.'
                     : language === 'es' ? 'La aplicación se proporciona "tal cual". No somos responsables de las acciones de los usuarios, daños de viajes o fallos del sistema. Nuestra responsabilidad se limita a la cantidad que pagó (si corresponde) en los últimos doce meses.'
                     : language === 'fr' ? 'L\'application est fournie "telle quelle". Nous ne sommes pas responsables des actions des utilisateurs, des dommages causés par les voyages ou des pannes du système. Notre responsabilité est limitée au montant que vous avez payé (le cas échéant) au cours des douze derniers mois.'
                     : language === 'de' ? 'Die App wird "wie besehen" bereitgestellt. Wir haften nicht für Nutzeraktionen, Reiseschäden oder Systemausfälle. Unsere Haftung ist auf den Betrag beschränkt, den Sie (falls zutreffend) in den letzten zwölf Monaten bezahlt haben.'
                     : language === 'it' ? 'L\'app viene fornita "così com\'è". Non siamo responsabili per le azioni degli utenti, danni da viaggi o guasti del sistema. La nostra responsabilità è limitata all\'importo pagato (se applicabile) negli ultimi dodici mesi.'
                     : 'The app is provided "as is". We are not liable for user actions, trip damages, or system failures. Our liability is limited to the amount you paid (if any) in the last twelve months.'}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Copyright className="w-5 h-5 text-purple-600" />
                    <h3 className="font-bold text-lg">{language === 'he' ? 'קניין רוחני' : language === 'ru' ? 'Интеллектуальная собственность' : language === 'es' ? 'Propiedad intelectual' : language === 'fr' ? 'Propriété intellectuelle' : language === 'de' ? 'Geistiges Eigentum' : language === 'it' ? 'Proprietà intellettuale' : 'Intellectual Property'}</h3>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {language === 'he' ? 'כל התוכן באפליקציה מוגן בזכויות יוצרים. אסור להעתיק או להפיץ ללא אישור. התוכן שאתה מפרסם נשאר שלך, אך אתה מעניק לנו רישיון להשתמש בו במסגרת השירות.'
                     : language === 'ru' ? 'Весь контент приложения защищен авторским правом. Копирование или распространение без разрешения запрещено. Контент, который вы публикуете, остается вашим, но вы предоставляете нам лицензию на его использование в рамках сервиса.'
                     : language === 'es' ? 'Todo el contenido de la aplicación está protegido por derechos de autor. No se permite copiar o distribuir sin permiso. El contenido que publique sigue siendo suyo, pero nos otorga una licencia para usarlo dentro del servicio.'
                     : language === 'fr' ? 'Tout le contenu de l\'application est protégé par des droits d\'auteur. La copie ou la distribution sans autorisation est interdite. Le contenu que vous publiez reste le vôtre, mais vous nous accordez une licence pour l\'utiliser dans le cadre du service.'
                     : language === 'de' ? 'Alle Inhalte der App sind urheberrechtlich geschützt. Kopieren oder Verteilen ohne Genehmigung ist verboten. Die Inhalte, die Sie veröffentlichen, bleiben Ihre, aber Sie gewähren uns eine Lizenz zur Nutzung im Rahmen des Dienstes.'
                     : language === 'it' ? 'Tutti i contenuti dell\'app sono protetti da copyright. È vietato copiare o distribuire senza autorizzazione. Il contenuto che pubblichi rimane tuo, ma ci concedi una licenza per utilizzarlo all\'interno del servizio.'
                     : 'All app content is copyright protected. Copying or distributing without permission is prohibited. Content you publish remains yours, but you grant us a license to use it within the service.'}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Scale className="w-5 h-5 text-purple-600" />
                    <h3 className="font-bold text-lg">{language === 'he' ? 'דין חל' : language === 'ru' ? 'Применимое право' : language === 'es' ? 'Ley aplicable' : language === 'fr' ? 'Droit applicable' : language === 'de' ? 'Anwendbares Recht' : language === 'it' ? 'Legge applicabile' : 'Governing Law'}</h3>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {language === 'he' ? 'תנאים אלה כפופים לדיני מדינת ישראל. מחלוקות יתבררו בבתי המשפט המוסמכים בישראל.'
                     : language === 'ru' ? 'Эти условия регулируются законами Государства Израиль. Споры разрешаются в компетентных судах Израиля.'
                     : language === 'es' ? 'Estos términos se rigen por las leyes del Estado de Israel. Las disputas se resolverán en los tribunales competentes de Israel.'
                     : language === 'fr' ? 'Ces conditions sont régies par les lois de l\'État d\'Israël. Les litiges seront résolus par les tribunaux compétents d\'Israël.'
                     : language === 'de' ? 'Diese Bedingungen unterliegen den Gesetzen des Staates Israel. Streitigkeiten werden vor den zuständigen Gerichten Israels beigelegt.'
                     : language === 'it' ? 'Questi termini sono regolati dalle leggi dello Stato di Israele. Le controversie saranno risolte dai tribunali competenti di Israele.'
                     : 'These terms are governed by the laws of the State of Israel. Disputes will be resolved in the competent courts of Israel.'}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-center">
                <p className="text-sm text-gray-600">
                  {language === 'he' ? 'לשאלות: frimet@gmail.com'
                   : language === 'ru' ? 'Вопросы: frimet@gmail.com'
                   : language === 'es' ? 'Preguntas: frimet@gmail.com'
                   : language === 'fr' ? 'Questions: frimet@gmail.com'
                   : language === 'de' ? 'Fragen: frimet@gmail.com'
                   : language === 'it' ? 'Domande: frimet@gmail.com'
                   : 'Questions: frimet@gmail.com'}
                </p>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}