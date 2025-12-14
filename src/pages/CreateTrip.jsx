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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Loader2, Upload, MapPin, Mountain, Clock, Sparkles, Navigation, Globe, Calendar, Users, Compass, Footprints, Bike, Truck, User, Dog, Tent, ArrowRight, ArrowLeft, Check, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { detectUserLocation, getRegionFromCoordinates } from '../components/utils/LocationDetector';
import LocationPicker from '../components/maps/LocationPicker';
import { getAllCountries } from '../components/utils/CountryRegions';
import WaypointsCreator from '../components/creation/WaypointsCreator';
import EquipmentCreator from '../components/creation/EquipmentCreator';
import ItineraryCreator from '../components/creation/ItineraryCreator';
import BudgetCreator from '../components/creation/BudgetCreator';
import OrganizerWaiver from '../components/legal/OrganizerWaiver';

const difficulties = ['easy', 'moderate', 'challenging', 'hard', 'extreme'];
const durations = ['hours', 'half_day', 'full_day', 'overnight', 'multi_day'];
const activityTypes = ['hiking', 'cycling', 'offroad'];
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
  const [showWaiver, setShowWaiver] = useState(false);
  const [generatingItinerary, setGeneratingItinerary] = useState(false);
  const [generatingEquipment, setGeneratingEquipment] = useState(false);
  
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
    image_url: ''
  });

  const [waypoints, setWaypoints] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [waterRecommendation, setWaterRecommendation] = useState(null);
  const [itinerary, setItinerary] = useState([]);
  const [budget, setBudget] = useState({
    solo_min: 0,
    solo_max: 0,
    family_min: 0,
    family_max: 0,
    currency: 'ILS',
    notes: ''
  });

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
    },
    { 
      id: 5, 
      title: language === 'he' ? 'סיכום' : 'Summary',
      icon: Check,
      color: 'from-green-500 to-emerald-500'
    }
  ];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              
              try {
                const result = await base44.integrations.Core.InvokeLLM({
                  prompt: `What country are these GPS coordinates in: ${latitude}, ${longitude}? Return only the country name in English, lowercase, using underscores for spaces (e.g., "united_states", "south_africa", "new_zealand"). If it's a common country name with no spaces, just use lowercase (e.g., "israel", "france", "spain").`,
                  add_context_from_internet: true,
                  response_json_schema: {
                    type: "object",
                    properties: {
                      country: { type: "string" }
                    }
                  }
                });
                
                const detectedCountry = result.country || 'israel';
                setFormData(prev => ({ ...prev, country: detectedCountry }));
                await fetchRegionsForCountry(detectedCountry);
                
                if (userData.home_region) {
                  setFormData(prev => ({ ...prev, region: userData.home_region }));
                }
              } catch (error) {
                console.error('Error detecting country:', error);
                const languageToCountry = {
                  'he': 'israel',
                  'en': 'uk',
                  'fr': 'france',
                  'es': 'spain',
                  'de': 'germany',
                  'it': 'italy'
                };
                const defaultCountry = languageToCountry[language] || 'israel';
                setFormData(prev => ({ ...prev, country: defaultCountry }));
                await fetchRegionsForCountry(defaultCountry);
              }
            },
            async (error) => {
              console.log('Geolocation not available, using default');
              const languageToCountry = {
                'he': 'israel',
                'en': 'uk',
                'fr': 'france',
                'es': 'spain',
                'de': 'germany',
                'it': 'italy'
              };
              const defaultCountry = languageToCountry[language] || 'israel';
              setFormData(prev => ({ ...prev, country: defaultCountry }));
              await fetchRegionsForCountry(defaultCountry);
            }
          );
        } else {
          const languageToCountry = {
            'he': 'israel',
            'en': 'uk',
            'fr': 'france',
            'es': 'spain',
            'de': 'germany',
            'it': 'italy'
          };
          const defaultCountry = languageToCountry[language] || 'israel';
          setFormData(prev => ({ ...prev, country: defaultCountry }));
          await fetchRegionsForCountry(defaultCountry);
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
      setFormData(prev => ({ ...prev, region: '', sub_region: '' }));
      setDynamicSubRegions([]);
    }
    
    if (field === 'region' && value) {
      fetchSubRegionsForRegion(value, formData.country);
      setFormData(prev => ({ ...prev, sub_region: '' }));
    }
  };

  const fetchRegionsForCountry = async (country) => {
    setLoadingRegions(true);
    try {
      const isIsrael = country === 'israel';
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: isIsrael
          ? (language === 'he'
            ? `צור רשימה של 10-15 אזורים וערים מרכזיים בישראל. החזר רק את שמות האזורים/ערים בעברית, מופרדים בפסיקים. לדוגמה: "תל אביב, ירושלים, חיפה, אילת, באר שבע". השתמש בשמות הרשמיים בעברית.`
            : `Create a list of 10-15 main regions and cities in Israel. Return only the region/city names in English (lowercase), separated by commas. For example: "tel aviv, jerusalem, haifa, eilat". Use simple, short names.`)
          : (language === 'he'
            ? `צור רשימה של 8-12 מחוזות או מדינות עיקריים ב-${t(country)}. החזר רק את שמות המחוזות/מדינות באנגלית (lowercase), מופרדים בפסיקים. לדוגמה: "california, texas, florida". השתמש בשמות פשוטים וקצרים.`
            : `Create a list of 8-12 main states or provinces in ${t(country)}. Return only the state/province names in English (lowercase), separated by commas. For example: "california, texas, florida". Use simple, short names.`),
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            regions: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });
      
      setDynamicRegions(result.regions || []);
    } catch (error) {
      console.error('Error fetching regions:', error);
      toast.error(language === 'he' ? 'שגיאה בטעינת מחוזות' : 'Error loading states');
      setDynamicRegions([]);
    }
    setLoadingRegions(false);
  };

  const fetchSubRegionsForRegion = async (region, country) => {
    setLoadingSubRegions(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: language === 'he'
          ? `צור רשימה של 8-12 אזורים או ערים מרכזיות באזור ${region} ב-${t(country)}. החזר רק את שמות האזורים/ערים באנגלית (lowercase), מופרדים בפסיקים. לדוגמה: "los angeles, san francisco, san diego". השתמש בשמות פשוטים וקצרים.`
          : `Create a list of 8-12 sub-regions or major cities in ${region}, ${t(country)}. Return only the sub-region/city names in English (lowercase), separated by commas. For example: "los angeles, san francisco, san diego". Use simple, short names.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            sub_regions: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });
      
      setDynamicSubRegions(result.sub_regions || []);
    } catch (error) {
      console.error('Error fetching sub-regions:', error);
      toast.error(language === 'he' ? 'שגיאה בטעינת אזורים' : 'Error loading sub-regions');
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
    
    setFormData(prev => ({
      ...prev,
      latitude: exactLat,
      longitude: exactLng
    }));
    
    setShowMapPicker(false);
    toast.success(language === 'he' ? `מיקום נשמר: ${exactLat.toFixed(6)}, ${exactLng.toFixed(6)}` : `Location saved: ${exactLat.toFixed(6)}, ${exactLng.toFixed(6)}`);
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

צור מסלול עם פעילויות לכל יום, כולל שעות מוצעות ותיאור קצר לכל פעילות. החזר כ-JSON array של ימים.`
          : `Create a detailed daily itinerary for a ${formData.duration_value} ${t(formData.duration_type)} ${formData.activity_type} trip at ${formData.location}, ${formData.region}, ${t(formData.country)}.
Difficulty: ${t(formData.difficulty)}
Trail types: ${formData.trail_type.map(type => t(type)).join(', ')}
Interests: ${formData.interests.map(int => t(int)).join(', ')}

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

כלול המלצה לכמות מים בליטרים ורשימת פריטי ציוד מפורטת.`
          : `Create a recommended packing list for a ${formData.duration_value} ${t(formData.duration_type)} ${formData.activity_type} trip at ${formData.location || formData.region}, ${t(formData.country)}.
Difficulty: ${t(formData.difficulty)}
Date: ${formData.date ? new Date(formData.date).toLocaleDateString() : 'Not specified'}
Trail types: ${formData.trail_type.map(type => t(type)).join(', ')}
Pets allowed: ${formData.pets_allowed ? 'Yes' : 'No'}
Camping: ${formData.camping_available ? 'Yes' : 'No'}

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

  const validateStep = (step) => {
    switch(step) {
      case 1:
        if (!formData.title) {
          toast.error(language === 'he' ? 'נא להזין כותרת' : 'Please enter title');
          return false;
        }
        return true;
      case 2:
        if (!formData.location || !formData.date) {
          toast.error(language === 'he' ? 'נא למלא מיקום ותאריך' : 'Please fill location and date');
          return false;
        }
        return true;
      case 3:
        return true;
      case 4:
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    if (!validateStep(currentStep)) return;
    setShowWaiver(true);
  };

  const saveTrip = async () => {
    setSaving(true);
    try {
      const tripData = {
        ...formData,
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
        waypoints,
        equipment_checklist: equipment,
        recommended_water_liters: waterRecommendation,
        daily_itinerary: itinerary,
        budget,
        cycling_distance: formData.cycling_distance || undefined,
        cycling_elevation: formData.cycling_elevation || undefined,
        offroad_distance: formData.offroad_distance || undefined,
      };

      const createdTrip = await base44.entities.Trip.create(tripData);
      toast.success(language === 'he' ? 'הטיול נשמר בהצלחה!' : 'Trip created successfully!');
      setShowWaiver(false);
      navigate(createPageUrl('TripDetails') + '?id=' + createdTrip.id);
    } catch (error) {
      console.error('Error:', error);
      toast.error(language === 'he' ? 'שגיאה בשמירה' : 'Error saving trip');
    } finally {
      setSaving(false);
    }
  };

  const handleWaiverDecline = () => {
    setShowWaiver(false);
    setSaving(false);
  };

  if (!user) return null;

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
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-4 rounded-3xl shadow-2xl mb-6">
              <Compass className="w-8 h-8" />
              <h1 className="text-3xl font-bold">{t('createTrip')}</h1>
            </div>
            <p className="text-gray-600 text-lg">
              {language === 'he' ? 'אשף יצירת טיול חכם' : 'Smart Trip Creation Wizard'}
            </p>
          </motion.div>

          {/* Progress Bar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <Card className="overflow-hidden shadow-xl border-2 border-emerald-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  {steps.map((step, idx) => {
                    const StepIcon = step.icon;
                    const isActive = currentStep === step.id;
                    const isCompleted = currentStep > step.id;
                    
                    return (
                      <React.Fragment key={step.id}>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className={`flex flex-col items-center gap-2 ${isActive || isCompleted ? 'opacity-100' : 'opacity-40'}`}
                        >
                          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                            isCompleted 
                              ? 'bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg' 
                              : isActive 
                              ? `bg-gradient-to-br ${step.color} shadow-2xl scale-110` 
                              : 'bg-gray-200'
                          }`}>
                            {isCompleted ? (
                              <Check className="w-8 h-8 text-white" />
                            ) : (
                              <StepIcon className={`w-7 h-7 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                            )}
                          </div>
                          <span className={`text-xs font-semibold text-center hidden sm:block ${
                            isActive ? 'text-gray-900' : 'text-gray-500'
                          }`}>
                            {step.title}
                          </span>
                        </motion.div>
                        {idx < steps.length - 1 && (
                          <div className={`flex-1 h-2 mx-2 rounded-full transition-all duration-500 ${
                            currentStep > step.id ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gray-200'
                          }`} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
                <Progress value={progressPercent} className="h-3 bg-gray-200" />
                <div className="mt-2 text-center">
                  <span className="text-sm font-semibold text-gray-700">
                    {language === 'he' ? `שלב ${currentStep} מתוך ${steps.length}` : `Step ${currentStep} of ${steps.length}`}
                  </span>
                </div>
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
            >
              {/* Step 1: Basic Info */}
              {currentStep === 1 && (
                <Card className="border-2 border-emerald-100 shadow-2xl">
                  <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50">
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <Sparkles className="w-7 h-7 text-emerald-600" />
                      {language === 'he' ? 'פרטים בסיסיים' : 'Basic Details'}
                    </CardTitle>
                    <CardDescription>{language === 'he' ? 'תן לטיול שלך שם וסיפור' : 'Give your trip a name and story'}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                    <div className="space-y-2">
                      <Label className="text-lg font-semibold">{language === 'he' ? 'כותרת הטיול' : 'Trip Title'} *</Label>
                      <Input
                        value={formData.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        placeholder={language === 'he' ? 'למשל: טיול מהמם בגליל העליון' : 'e.g., Amazing Galilee Hike'}
                        dir={isRTL ? 'rtl' : 'ltr'}
                        className="text-lg p-6"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-lg font-semibold">{language === 'he' ? 'תיאור' : 'Description'}</Label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        placeholder={language === 'he' ? 'ספר על הטיול שלך...' : 'Tell us about your trip...'}
                        dir={isRTL ? 'rtl' : 'ltr'}
                        rows={5}
                        className="text-base"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-lg font-semibold">{t('uploadImage')}</Label>
                      <div className="flex items-center gap-6">
                        {formData.image_url ? (
                          <img 
                            src={formData.image_url} 
                            alt="Trip" 
                            className="w-48 h-36 object-cover rounded-2xl shadow-lg"
                          />
                        ) : (
                          <div className="w-48 h-36 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                            <Upload className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                          <Button type="button" variant="outline" disabled={imageUploading} asChild>
                            <span className="gap-2 p-6">
                              {imageUploading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                <Upload className="w-5 h-5" />
                              )}
                              {language === 'he' ? 'העלה תמונה' : 'Upload Image'}
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
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <MapPin className="w-7 h-7 text-blue-600" />
                      {language === 'he' ? 'מיקום וזמן' : 'Location & Time'}
                    </CardTitle>
                    <CardDescription>{language === 'he' ? 'איפה וממתי?' : 'Where and when?'}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
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

                    <div className={`grid ${formData.country === 'israel' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3'} gap-4`}>
                      {formData.country !== 'israel' && (
                        <div className="space-y-2">
                          <Label className="text-base font-semibold">{language === 'he' ? 'מחוז/מדינה' : 'State/Province'}</Label>
                          <Select 
                            value={formData.region} 
                            onValueChange={(v) => handleChange('region', v)}
                            disabled={loadingRegions}
                          >
                            <SelectTrigger className="p-4">
                              <SelectValue placeholder={loadingRegions ? (language === 'he' ? 'טוען...' : 'Loading...') : (language === 'he' ? 'בחר' : 'Select')} />
                            </SelectTrigger>
                            <SelectContent>
                              {dynamicRegions.map(r => (
                                <SelectItem key={r} value={r}>
                                  {r.charAt(0).toUpperCase() + r.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label className="text-base font-semibold">{language === 'he' ? 'אזור/עיר' : 'Area/City'}</Label>
                        <Select 
                          value={formData.country === 'israel' ? formData.region : formData.sub_region} 
                          onValueChange={(v) => handleChange(formData.country === 'israel' ? 'region' : 'sub_region', v)}
                          disabled={formData.country === 'israel' ? loadingRegions : (loadingSubRegions || !formData.region)}
                        >
                          <SelectTrigger className="p-4">
                            <SelectValue placeholder={language === 'he' ? 'בחר' : 'Select'} />
                          </SelectTrigger>
                          <SelectContent>
                            {(formData.country === 'israel' ? dynamicRegions : dynamicSubRegions).map(item => (
                              <SelectItem key={item} value={item}>{item}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-base font-semibold">{t('location')} *</Label>
                        <div className="flex gap-2">
                          <Input
                            value={formData.location}
                            onChange={(e) => handleChange('location', e.target.value)}
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
                          onChange={(e) => handleChange('date', e.target.value)}
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
                  <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <Mountain className="w-7 h-7 text-amber-600" />
                      {language === 'he' ? 'פרטי הפעילות' : 'Activity Details'}
                    </CardTitle>
                    <CardDescription>{language === 'he' ? 'איזה סוג של טיול?' : 'What kind of trip?'}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                    <div className="space-y-4">
                      <Label className="text-lg font-semibold">{t('activityType')} *</Label>
                      <div className="grid grid-cols-3 gap-4">
                        <Button
                          type="button"
                          variant={formData.activity_type === 'hiking' ? 'default' : 'outline'}
                          className={`h-32 flex flex-col items-center justify-center gap-3 text-lg font-bold ${
                            formData.activity_type === 'hiking'
                              ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-2xl scale-105'
                              : 'border-2 hover:border-emerald-500 hover:bg-emerald-50'
                          }`}
                          onClick={() => handleChange('activity_type', 'hiking')}
                        >
                          <Footprints className="w-10 h-10" />
                          {t('hiking')}
                        </Button>
                        <Button
                          type="button"
                          variant={formData.activity_type === 'cycling' ? 'default' : 'outline'}
                          className={`h-32 flex flex-col items-center justify-center gap-3 text-lg font-bold ${
                            formData.activity_type === 'cycling'
                              ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-2xl scale-105'
                              : 'border-2 hover:border-blue-500 hover:bg-blue-50'
                          }`}
                          onClick={() => handleChange('activity_type', 'cycling')}
                        >
                          <Bike className="w-10 h-10" />
                          {t('cycling')}
                        </Button>
                        <Button
                          type="button"
                          variant={formData.activity_type === 'offroad' ? 'default' : 'outline'}
                          className={`h-32 flex flex-col items-center justify-center gap-3 text-lg font-bold ${
                            formData.activity_type === 'offroad'
                              ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-2xl scale-105'
                              : 'border-2 hover:border-orange-500 hover:bg-orange-50'
                          }`}
                          onClick={() => handleChange('activity_type', 'offroad')}
                        >
                          <Truck className="w-10 h-10" />
                          {t('offroad')}
                        </Button>
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
                          onChange={(e) => handleChange('max_participants', parseInt(e.target.value))}
                          className="p-4"
                        />
                      </div>
                    </div>

                    {formData.activity_type === 'cycling' && (
                      <div className="space-y-4 p-6 bg-blue-50 rounded-2xl">
                        <h3 className="text-lg font-bold text-blue-900">{language === 'he' ? 'פרטי רכיבה' : 'Cycling Details'}</h3>
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
                        <h3 className="text-lg font-bold text-orange-900">{language === 'he' ? 'פרטי שטח' : 'Off-Road Details'}</h3>
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

                    <div className="flex flex-wrap gap-6 pt-4">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id="pets"
                          checked={formData.pets_allowed}
                          onCheckedChange={(checked) => handleChange('pets_allowed', checked)}
                        />
                        <Label htmlFor="pets" className="cursor-pointer text-base flex items-center gap-2">
                          <Dog className="w-5 h-5" />
                          {t('petsAllowed')}
                        </Label>
                      </div>
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id="camping"
                          checked={formData.camping_available}
                          onCheckedChange={(checked) => handleChange('camping_available', checked)}
                        />
                        <Label htmlFor="camping" className="cursor-pointer text-base flex items-center gap-2">
                          <Tent className="w-5 h-5" />
                          {t('campingAvailable')}
                        </Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 4: Planning */}
              {currentStep === 4 && (
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

              {/* Step 5: Summary */}
              {currentStep === 5 && (
                <Card className="border-2 border-green-100 shadow-2xl">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <Check className="w-7 h-7 text-green-600" />
                      {language === 'he' ? 'סיכום הטיול' : 'Trip Summary'}
                    </CardTitle>
                    <CardDescription>{language === 'he' ? 'בדוק שהכל נכון לפני פרסום' : 'Review everything before publishing'}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-2xl">
                      <h3 className="text-2xl font-bold mb-4">{formData.title}</h3>
                      {formData.image_url && (
                        <img src={formData.image_url} alt="Trip" className="w-full h-64 object-cover rounded-xl mb-4" />
                      )}
                      <p className="text-gray-700 mb-4">{formData.description}</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-semibold">{language === 'he' ? 'מיקום:' : 'Location:'}</span>
                          <p>{formData.location}, {formData.region}, {t(formData.country)}</p>
                        </div>
                        <div>
                          <span className="font-semibold">{language === 'he' ? 'תאריך:' : 'Date:'}</span>
                          <p>{new Date(formData.date).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <span className="font-semibold">{language === 'he' ? 'סוג:' : 'Type:'}</span>
                          <p>{t(formData.activity_type)}</p>
                        </div>
                        <div>
                          <span className="font-semibold">{language === 'he' ? 'קושי:' : 'Difficulty:'}</span>
                          <p>{t(formData.difficulty)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="bg-white p-4 rounded-xl shadow">
                        <p className="text-3xl font-bold text-purple-600">{equipment.length}</p>
                        <p className="text-sm text-gray-600">{language === 'he' ? 'פריטי ציוד' : 'Equipment Items'}</p>
                      </div>
                      <div className="bg-white p-4 rounded-xl shadow">
                        <p className="text-3xl font-bold text-indigo-600">{itinerary.length}</p>
                        <p className="text-sm text-gray-600">{language === 'he' ? 'ימים מתוכננים' : 'Planned Days'}</p>
                      </div>
                      <div className="bg-white p-4 rounded-xl shadow">
                        <p className="text-3xl font-bold text-emerald-600">{waypoints.length}</p>
                        <p className="text-sm text-gray-600">{language === 'he' ? 'נקודות ציון' : 'Waypoints'}</p>
                      </div>
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
            className="flex justify-between mt-8"
          >
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-8 py-6 text-base font-semibold border-2"
            >
              <ArrowLeft className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {language === 'he' ? 'אחורה' : 'Back'}
            </Button>

            {currentStep < steps.length ? (
              <Button
                type="button"
                onClick={nextStep}
                className="px-8 py-6 text-base font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-xl"
              >
                {language === 'he' ? 'הבא' : 'Next'}
                <ArrowRight className={`w-5 h-5 ${isRTL ? 'mr-2' : 'ml-2'}`} />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="px-12 py-6 text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-2xl"
              >
                {saving ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <Check className="w-6 h-6 mr-2" />
                    {language === 'he' ? 'פרסם טיול' : 'Publish Trip'}
                  </>
                )}
              </Button>
            )}
          </motion.div>
        </div>
      </div>

      <OrganizerWaiver
        open={showWaiver}
        onAccept={saveTrip}
        onDecline={handleWaiverDecline}
      />
    </>
  );
}