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
import { Loader2, Upload, MapPin, Mountain, Clock, Sparkles, Navigation, Globe, Calendar, Users, Compass, Footprints, Bike, Truck, User, Dog, Tent, ArrowRight, ArrowLeft, Check, ChevronRight, UtensilsCrossed } from 'lucide-react';
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
const activityTypes = ['hiking', 'cycling', 'offroad', 'running', 'culinary'];
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
    solo_min: '',
    solo_max: '',
    family_min: '',
    family_max: '',
    currency: 'ILS',
    notes: ''
  });

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
      
      <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 p-1.5 overflow-hidden">
        <div className="max-w-5xl mx-auto w-full flex flex-col h-full">
          {/* Progress Bar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-1 flex-shrink-0"
          >
            <div className="flex items-center justify-between px-1">
              {steps.map((step, idx) => {
                const StepIcon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                
                return (
                  <React.Fragment key={step.id}>
                    <div className={`${isActive || isCompleted ? 'opacity-100' : 'opacity-40'}`}>
                      <div className={`w-5 h-5 rounded flex items-center justify-center ${
                        isCompleted ? 'bg-green-500' : isActive ? `bg-emerald-600` : 'bg-gray-200'
                      }`}>
                        {isCompleted ? (
                          <Check className="w-2.5 h-2.5 text-white" />
                        ) : (
                          <StepIcon className={`w-2.5 h-2.5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                        )}
                      </div>
                    </div>
                    {idx < steps.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-0.5 ${currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </motion.div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-1 overflow-y-auto"
            >
              {/* Step 1: Basic Info */}
              {currentStep === 1 && (
                <div className="bg-white border border-emerald-100 rounded-lg shadow-sm h-full flex flex-col">
                  <div className="bg-emerald-50 py-1 px-2 flex-shrink-0 rounded-t-lg">
                    <h2 className="flex items-center gap-1 text-xs font-bold text-emerald-700">
                      <Sparkles className="w-3 h-3" />
                      {language === 'he' ? 'פרטים בסיסיים' : 'Basic Details'}
                    </h2>
                  </div>
                  <div className="p-2 space-y-1 overflow-y-auto flex-1">
                    <div>
                      <Label className="text-[10px]">{language === 'he' ? 'כותרת' : 'Title'} *</Label>
                      <Input
                        value={formData.title}
                        onChange={(e) => {
                          handleChange('title', e.target.value);
                          if (missingFields.includes('title')) {
                            setMissingFields(prev => prev.filter(f => f !== 'title'));
                          }
                        }}
                        placeholder={language === 'he' ? 'טיול בגליל' : 'Trip name'}
                        dir={isRTL ? 'rtl' : 'ltr'}
                        className={`text-xs p-1 h-6 ${missingFields.includes('title') ? 'border-red-500' : ''}`}
                      />
                    </div>

                    <div>
                      <Label className="text-[10px]">{language === 'he' ? 'תיאור' : 'Description'}</Label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        placeholder={language === 'he' ? 'ספר על הטיול...' : 'Tell us...'}
                        dir={isRTL ? 'rtl' : 'ltr'}
                        rows={1}
                        className="text-xs p-1 min-h-[24px] resize-none"
                      />
                    </div>

                    <div>
                      <Label className="text-[10px]">{language === 'he' ? 'תמונה' : 'Image'}</Label>
                      <div className="flex items-center gap-1.5">
                        {formData.image_url && (
                          <img src={formData.image_url} alt="Trip" className="w-10 h-8 object-cover rounded" />
                        )}
                        <label className="cursor-pointer">
                          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                          <Button type="button" variant="outline" disabled={imageUploading} asChild>
                            <span className="text-[9px] h-6 px-1.5 flex items-center gap-0.5">
                              {imageUploading ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Upload className="w-2.5 h-2.5" />}
                              {language === 'he' ? 'העלה' : 'Upload'}
                            </span>
                          </Button>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Location & Time */}
              {currentStep === 2 && (
                <div className="bg-white border border-blue-100 rounded-lg shadow-sm h-full flex flex-col">
                  <div className="bg-blue-50 py-1 px-2 flex-shrink-0 rounded-t-lg">
                    <h2 className="flex items-center gap-1 text-xs font-bold text-blue-700">
                      <MapPin className="w-3 h-3" />
                      {language === 'he' ? 'מיקום וזמן' : 'Location & Time'}
                    </h2>
                  </div>
                  <div className="p-2 space-y-1 overflow-y-auto flex-1">
                    <div className="grid grid-cols-2 gap-1">
                      <div className="col-span-2">
                        <Label className="text-[10px]">{t('country')}</Label>
                        <Select value={formData.country} onValueChange={(v) => handleChange('country', v)}>
                          <SelectTrigger className="p-1 text-[10px] h-6">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="max-h-32">
                            {countries.map(c => (
                              <SelectItem key={c} value={c}>{t(c)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {formData.country !== 'israel' && (
                        <div>
                          <Label className="text-[10px]">{language === 'he' ? 'מחוז' : 'State'}</Label>
                          <Select value={formData.region} onValueChange={(v) => handleChange('region', v)} disabled={loadingRegions}>
                            <SelectTrigger className="p-1 text-[10px] h-6">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="max-h-32">
                              {dynamicRegions.map(r => (
                                <SelectItem key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <div>
                        <Label className="text-[10px]">{language === 'he' ? 'עיר' : 'City'}</Label>
                        <Select 
                          value={formData.country === 'israel' ? formData.region : formData.sub_region} 
                          onValueChange={(v) => handleChange(formData.country === 'israel' ? 'region' : 'sub_region', v)}
                          disabled={formData.country === 'israel' ? loadingRegions : !formData.region}
                        >
                          <SelectTrigger className="p-1 text-[10px] h-6">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="max-h-32">
                            {(formData.country === 'israel' ? dynamicRegions : dynamicSubRegions).map(item => (
                              <SelectItem key={item} value={item}>{item}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className={formData.country === 'israel' ? 'col-span-1' : 'col-span-2'}>
                        <Label className="text-[10px]">{t('location')} *</Label>
                        <div className="flex gap-0.5">
                          <Input
                            value={formData.location}
                            onChange={(e) => {
                              handleChange('location', e.target.value);
                              if (missingFields.includes('location')) {
                                setMissingFields(prev => prev.filter(f => f !== 'location'));
                              }
                            }}
                            className={`text-[10px] p-1 h-6 ${missingFields.includes('location') ? 'border-red-500' : ''}`}
                            placeholder={language === 'he' ? 'נחל עמוד' : 'Location'}
                          />
                          <Button type="button" variant="outline" onClick={handleLocationSearch} disabled={searchingLocation} className="h-6 w-6 p-0">
                            {searchingLocation ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Navigation className="w-2.5 h-2.5" />}
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label className="text-[10px]">{t('date')} *</Label>
                        <Input
                          type="date"
                          value={formData.date}
                          onChange={(e) => {
                            handleChange('date', e.target.value);
                            if (missingFields.includes('date')) {
                              setMissingFields(prev => prev.filter(f => f !== 'date'));
                            }
                          }}
                          className={`p-1 text-[10px] h-6 ${missingFields.includes('date') ? 'border-red-500' : ''}`}
                        />
                      </div>
                      <div>
                        <Label className="text-[10px]">{language === 'he' ? 'שעה' : 'Time'}</Label>
                        <Input type="time" value={formData.meeting_time} onChange={(e) => handleChange('meeting_time', e.target.value)} className="p-1 text-[10px] h-6" />
                      </div>
                      <div className="col-span-2">
                        <Label className="text-[10px]">{t('duration')}</Label>
                        <Select value={formData.duration_type} onValueChange={(v) => handleChange('duration_type', v)}>
                          <SelectTrigger className="p-1 text-[10px] h-6">
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
                  </div>
                </div>
              )}

              {/* Step 3: Activity Details */}
              {currentStep === 3 && (
                <div className="bg-white border border-amber-100 rounded-lg shadow-sm h-full flex flex-col">
                  <div className="bg-amber-50 py-1 px-2 flex-shrink-0 rounded-t-lg">
                    <h2 className="flex items-center gap-1 text-xs font-bold text-amber-700">
                      <Mountain className="w-3 h-3" />
                      {language === 'he' ? 'פרטי פעילות' : 'Activity'}
                    </h2>
                  </div>
                  <div className="p-2 space-y-1 overflow-y-auto flex-1">
                    <div>
                      <Label className="text-[10px]">{t('activityType')}</Label>
                      <div className="grid grid-cols-5 gap-0.5">
                        {[
                          { type: 'hiking', icon: Footprints },
                          { type: 'running', icon: User },
                          { type: 'cycling', icon: Bike },
                          { type: 'offroad', icon: Truck },
                          { type: 'culinary', icon: UtensilsCrossed }
                        ].map(({ type, icon: Icon }) => (
                          <Button
                            key={type}
                            type="button"
                            variant={formData.activity_type === type ? 'default' : 'outline'}
                            className={`h-10 flex flex-col gap-0 text-[8px] p-0 ${
                              formData.activity_type === type ? 'bg-emerald-600' : ''
                            }`}
                            onClick={() => handleChange('activity_type', type)}
                          >
                            <Icon className="w-3 h-3" />
                            <span className="leading-none">{t(type)}</span>
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-1">
                      <div>
                        <Label className="text-[10px]">{t('difficulty')}</Label>
                        <Select value={formData.difficulty} onValueChange={(v) => handleChange('difficulty', v)}>
                          <SelectTrigger className="p-1 text-[10px] h-6">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {difficulties.map(d => (
                              <SelectItem key={d} value={d}>{t(d)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-[10px]">{language === 'he' ? 'מקס׳' : 'Max'}</Label>
                        <Input
                          type="number"
                          min={2}
                          max={50}
                          value={formData.max_participants}
                          onChange={(e) => handleChange('max_participants', parseInt(e.target.value))}
                          className="p-1 text-[10px] h-6"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-[10px]">{t('trailType')}</Label>
                      <div className="flex flex-wrap gap-0.5">
                        {trailTypes.slice(0, 5).map(type => (
                          <Badge
                            key={type}
                            variant={formData.trail_type.includes(type) ? 'default' : 'outline'}
                            className={`cursor-pointer text-[8px] py-0 px-1 h-4 ${
                              formData.trail_type.includes(type) ? 'bg-emerald-600' : ''
                            }`}
                            onClick={() => handleArrayToggle('trail_type', type)}
                          >
                            {t(type)}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-1.5 text-[9px]">
                      <div className="flex items-center gap-0.5">
                        <Checkbox
                          id="pets"
                          className="h-2.5 w-2.5"
                          checked={formData.pets_allowed}
                          onCheckedChange={(checked) => handleChange('pets_allowed', checked)}
                        />
                        <Label htmlFor="pets" className="cursor-pointer flex items-center gap-0.5">
                          <Dog className="w-2.5 h-2.5" />
                          {language === 'he' ? 'חיות' : 'Pets'}
                        </Label>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <Checkbox
                          id="camping"
                          className="h-2.5 w-2.5"
                          checked={formData.camping_available}
                          onCheckedChange={(checked) => handleChange('camping_available', checked)}
                        />
                        <Label htmlFor="camping" className="cursor-pointer flex items-center gap-0.5">
                          <Tent className="w-2.5 h-2.5" />
                          {language === 'he' ? 'קמפינג' : 'Camp'}
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Planning */}
              {currentStep === 4 && (
                <div className="bg-white border border-purple-100 rounded-lg shadow-sm h-full flex flex-col">
                  <div className="bg-purple-50 py-1 px-2 flex-shrink-0 rounded-t-lg">
                    <h2 className="flex items-center gap-1 text-xs font-bold text-purple-700">
                      <Compass className="w-3 h-3" />
                      {language === 'he' ? 'תכנון (אופציונלי)' : 'Planning'}
                    </h2>
                  </div>
                  <div className="p-2 overflow-y-auto flex-1">
                    <p className="text-[9px] text-gray-600 mb-1">
                      {language === 'he' ? 'ניתן להוסיף בהמשך' : 'Add later'}
                    </p>
                    <div className="grid grid-cols-2 gap-1 text-center">
                      <div className="bg-gray-50 p-1 rounded">
                        <p className="text-xs font-bold text-purple-600">{equipment.length}</p>
                        <p className="text-[8px] text-gray-600">{language === 'he' ? 'ציוד' : 'Gear'}</p>
                      </div>
                      <div className="bg-gray-50 p-1 rounded">
                        <p className="text-xs font-bold text-indigo-600">{waypoints.length}</p>
                        <p className="text-[8px] text-gray-600">{language === 'he' ? 'נקודות' : 'Points'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Summary */}
              {currentStep === 5 && (
                <div className="bg-white border border-green-100 rounded-lg shadow-sm h-full flex flex-col">
                  <div className="bg-green-50 py-1 px-2 flex-shrink-0 rounded-t-lg">
                    <h2 className="flex items-center gap-1 text-xs font-bold text-green-700">
                      <Check className="w-3 h-3" />
                      {language === 'he' ? 'סיכום' : 'Summary'}
                    </h2>
                  </div>
                  <div className="p-2 overflow-y-auto flex-1">
                    <div className="bg-emerald-50 p-1.5 rounded">
                      <h3 className="text-xs font-bold mb-0.5">{formData.title}</h3>
                      {formData.image_url && (
                        <img src={formData.image_url} alt="Trip" className="w-full h-12 object-cover rounded mb-0.5" />
                      )}
                      <div className="grid grid-cols-2 gap-1 text-[9px]">
                        <div>
                          <span className="font-semibold">{language === 'he' ? 'מיקום:' : 'Location:'}</span>
                          <p className="truncate">{formData.location}</p>
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
                          <span className="font-semibold">{language === 'he' ? 'קושי:' : 'Diff:'}</span>
                          <p>{t(formData.difficulty)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-1 gap-1.5 flex-shrink-0 pb-1">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-2 py-1 text-[10px] h-7"
            >
              <ArrowLeft className="w-2.5 h-2.5" />
            </Button>

            {currentStep < steps.length ? (
              <Button
                type="button"
                onClick={nextStep}
                className="px-3 py-1 text-[10px] h-7 bg-emerald-600"
              >
                {language === 'he' ? 'הבא' : 'Next'}
                <ArrowRight className="w-2.5 h-2.5" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="px-3 py-1 text-[10px] h-7 bg-green-600"
              >
                {saving ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <><Check className="w-2.5 h-2.5" /> {language === 'he' ? 'פרסם' : 'Publish'}</>}
              </Button>
            )}
          </div>
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