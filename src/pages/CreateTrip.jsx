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
import { toast } from "sonner";
import { Loader2, Upload, MapPin, Mountain, Clock, Sparkles, Navigation, Globe, Calendar, Users, Compass, Footprints, Bike, Truck, User, Dog, Tent } from 'lucide-react';
import { motion } from 'framer-motion';
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
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [searchingLocation, setSearchingLocation] = useState(false);
  const [loadingRegions, setLoadingRegions] = useState(false);
  const [dynamicRegions, setDynamicRegions] = useState([]);
  const [loadingSubRegions, setLoadingSubRegions] = useState(false);
  const [dynamicSubRegions, setDynamicSubRegions] = useState([]);
  const [countrySearchValue, setCountrySearchValue] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showWaiver, setShowWaiver] = useState(false);
  
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
  const [allergens, setAllergens] = useState([]);
  const [itinerary, setItinerary] = useState([]);
  const [budget, setBudget] = useState({
    solo_min: 0,
    solo_max: 0,
    family_min: 0,
    family_max: 0,
    currency: 'ILS',
    notes: ''
  });

  const [generatingItinerary, setGeneratingItinerary] = useState(false);
  const [generatingEquipment, setGeneratingEquipment] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showCountryDropdown && !e.target.closest('.relative')) {
        setShowCountryDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCountryDropdown]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        
        // Detect user's country by location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              
              // Detect country from coordinates
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
                // Set default country based on selected language
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
              // Set default country based on selected language
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
          // Set default country based on selected language
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
        toast.error(language === 'he' ? 'יש להתחבר' : language === 'ru' ? 'Пожалуйста, войдите' : language === 'es' ? 'Por favor, inicia sesión' : language === 'fr' ? 'Veuillez vous connecter' : language === 'de' ? 'Bitte anmelden' : language === 'it' ? 'Accedi per favore' : 'Please login');
        navigate(createPageUrl('Home'));
      }
    };
    fetchUser();
  }, [language, navigate]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // When country changes, fetch regions dynamically via AI
    if (field === 'country') {
      fetchRegionsForCountry(value);
      setFormData(prev => ({ ...prev, region: '', sub_region: '' }));
      setDynamicSubRegions([]);
    }
    
    // When region changes, fetch sub-regions dynamically via AI
    if (field === 'region' && value) {
      fetchSubRegionsForRegion(value, formData.country);
      setFormData(prev => ({ ...prev, sub_region: '' }));
    }
  };

  const fetchRegionsForCountry = async (country) => {
    setLoadingRegions(true);
    try {
      // For Israel, fetch cities/areas directly instead of states
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
      toast.error(language === 'he' ? 'שגיאה בטעינת מחוזות' : language === 'ru' ? 'Ошибка загрузки штатов' : language === 'es' ? 'Error al cargar estados' : language === 'fr' ? 'Erreur de chargement des états' : language === 'de' ? 'Fehler beim Laden der Bundesstaaten' : language === 'it' ? 'Errore nel caricamento degli stati' : 'Error loading states');
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
      toast.error(language === 'he' ? 'שגיאה בטעינת אזורים' : language === 'ru' ? 'Ошибка загрузки районов' : language === 'es' ? 'Error al cargar subregiones' : language === 'fr' ? 'Erreur de chargement des sous-régions' : language === 'de' ? 'Fehler beim Laden der Unterregionen' : language === 'it' ? 'Errore nel caricamento delle sottoregioni' : 'Error loading sub-regions');
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
      toast.success(language === 'he' ? 'התמונה הועלתה' : language === 'ru' ? 'Изображение загружено' : language === 'es' ? 'Imagen cargada' : language === 'fr' ? 'Image téléchargée' : language === 'de' ? 'Bild hochgeladen' : language === 'it' ? 'Immagine caricata' : 'Image uploaded');
    } catch (error) {
      toast.error(language === 'he' ? 'שגיאה בהעלאת התמונה' : language === 'ru' ? 'Ошибка загрузки изображения' : language === 'es' ? 'Error al cargar imagen' : language === 'fr' ? 'Erreur de téléchargement de l\'image' : language === 'de' ? 'Fehler beim Hochladen des Bildes' : language === 'it' ? 'Errore nel caricamento dell\'immagine' : 'Error uploading image');
    }
    setImageUploading(false);
  };

  const handleLocationSearch = async () => {
    const searchQuery = formData.location || formData.sub_region || formData.region;
    
    if (!searchQuery) {
      toast.error(language === 'he' ? 'נא לבחור אזור או להזין מיקום' : language === 'ru' ? 'Пожалуйста, выберите район или введите местоположение' : language === 'es' ? 'Por favor, selecciona área o ingresa ubicación' : language === 'fr' ? 'Veuillez sélectionner une zone ou saisir un emplacement' : language === 'de' ? 'Bitte wählen Sie ein Gebiet oder geben Sie einen Standort ein' : language === 'it' ? 'Seleziona un\'area o inserisci una posizione' : 'Please select area or enter location');
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
      
      // Open map picker to confirm/adjust location
      setShowMapPicker(true);
    } catch (error) {
      toast.error(language === 'he' ? 'לא ניתן למצוא את המיקום' : language === 'ru' ? 'Не удалось найти местоположение' : language === 'es' ? 'No se pudo encontrar la ubicación' : language === 'fr' ? 'Impossible de trouver l\'emplacement' : language === 'de' ? 'Standort konnte nicht gefunden werden' : language === 'it' ? 'Impossibile trovare la posizione' : 'Could not find location');
      setSearchingLocation(false);
    }
  };

  const handleMapConfirm = async (lat, lng) => {
    // Save exact coordinates immediately - no rounding or modifications
    const exactLat = parseFloat(lat);
    const exactLng = parseFloat(lng);
    
    setFormData(prev => ({
      ...prev,
      latitude: exactLat,
      longitude: exactLng
    }));
    
    setShowMapPicker(false);
    
    // Get detailed location information from exact coordinates
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: language === 'he'
          ? `עבור הקואורדינטות המדויקות ${exactLat}, ${exactLng}, תן את הפרטים הבאים:
1. location_name: שם מדויק של המיקום (עיר/אתר/שכונה)
2. sub_region: שם העיר או האזור הכללי (באנגלית, lowercase)
3. region: שם המחוז או המדינה (באנגלית, lowercase)
4. country: שם המדינה (באנגלית, lowercase, עם underscores אם יש רווחים)

חשוב מאוד: זהה את המדינה בדיוק לפי הקואורדינטות האלה.`
          : `For the EXACT coordinates ${exactLat}, ${exactLng}, provide the following details:
1. location_name: exact location name (city/site/neighborhood)
2. sub_region: city or general area name (English, lowercase)
3. region: state or province name (English, lowercase)
4. country: country name (English, lowercase, with underscores for spaces)

IMPORTANT: Identify the country precisely based on these coordinates.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            location_name: { type: "string" },
            sub_region: { type: "string" },
            region: { type: "string" },
            country: { type: "string" }
          }
        }
      });
      
      if (result.location_name) {
        // Update country and load regions if different
        if (result.country && result.country !== formData.country) {
          await fetchRegionsForCountry(result.country);
        }
        
        const isIsrael = result.country === 'israel';
        
        // For Israel, only update region (which represents city/area)
        // For other countries, update region and load sub-regions
        if (!isIsrael && result.region && result.region !== formData.region) {
          await fetchSubRegionsForRegion(result.region, result.country);
        }
        
        setFormData(prev => ({
          ...prev,
          latitude: exactLat,  // Ensure exact coordinates are preserved
          longitude: exactLng, // Ensure exact coordinates are preserved
          location: result.location_name,
          sub_region: isIsrael ? '' : (result.sub_region || prev.sub_region),
          region: isIsrael ? (result.sub_region || result.region || prev.region) : (result.region || prev.region),
          country: result.country || prev.country
        }));
        
        toast.success(language === 'he' ? `מיקום מדויק נשמר: ${result.location_name} (${exactLat.toFixed(6)}, ${exactLng.toFixed(6)})` : language === 'ru' ? `Точное местоположение сохранено: ${result.location_name} (${exactLat.toFixed(6)}, ${exactLng.toFixed(6)})` : language === 'es' ? `Ubicación exacta guardada: ${result.location_name} (${exactLat.toFixed(6)}, ${exactLng.toFixed(6)})` : language === 'fr' ? `Emplacement exact enregistré : ${result.location_name} (${exactLat.toFixed(6)}, ${exactLng.toFixed(6)})` : language === 'de' ? `Genauer Standort gespeichert: ${result.location_name} (${exactLat.toFixed(6)}, ${exactLng.toFixed(6)})` : language === 'it' ? `Posizione esatta salvata: ${result.location_name} (${exactLat.toFixed(6)}, ${exactLng.toFixed(6)})` : `Exact location saved: ${result.location_name} (${exactLat.toFixed(6)}, ${exactLng.toFixed(6)})`);
      } else {
        toast.success(language === 'he' ? `קואורדינטות מדויקות נשמרו: ${exactLat.toFixed(6)}, ${exactLng.toFixed(6)}` : language === 'ru' ? `Точные координаты сохранены: ${exactLat.toFixed(6)}, ${exactLng.toFixed(6)}` : language === 'es' ? `Coordenadas exactas guardadas: ${exactLat.toFixed(6)}, ${exactLng.toFixed(6)}` : language === 'fr' ? `Coordonnées exactes enregistrées : ${exactLat.toFixed(6)}, ${exactLng.toFixed(6)}` : language === 'de' ? `Genaue Koordinaten gespeichert: ${exactLat.toFixed(6)}, ${exactLng.toFixed(6)}` : language === 'it' ? `Coordinate esatte salvate: ${exactLat.toFixed(6)}, ${exactLng.toFixed(6)}` : `Exact coordinates saved: ${exactLat.toFixed(6)}, ${exactLng.toFixed(6)}`);
      }
    } catch (error) {
      console.error('Error getting location details:', error);
      toast.success(language === 'he' ? `קואורדינטות נשמרו: ${exactLat.toFixed(6)}, ${exactLng.toFixed(6)}` : language === 'ru' ? `Координаты сохранены: ${exactLat.toFixed(6)}, ${exactLng.toFixed(6)}` : language === 'es' ? `Coordenadas guardadas: ${exactLat.toFixed(6)}, ${exactLng.toFixed(6)}` : language === 'fr' ? `Coordonnées enregistrées : ${exactLat.toFixed(6)}, ${exactLng.toFixed(6)}` : language === 'de' ? `Koordinaten gespeichert: ${exactLat.toFixed(6)}, ${exactLng.toFixed(6)}` : language === 'it' ? `Coordinate salvate: ${exactLat.toFixed(6)}, ${exactLng.toFixed(6)}` : `Coordinates saved: ${exactLat.toFixed(6)}, ${exactLng.toFixed(6)}`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.location || !formData.date) {
      const missing = [];
      if (!formData.title) missing.push(language === 'he' ? 'כותרת' : language === 'ru' ? 'название' : language === 'es' ? 'título' : language === 'fr' ? 'titre' : language === 'de' ? 'Titel' : language === 'it' ? 'titolo' : 'title');
      if (!formData.location) missing.push(language === 'he' ? 'מיקום' : language === 'ru' ? 'местоположение' : language === 'es' ? 'ubicación' : language === 'fr' ? 'emplacement' : language === 'de' ? 'Standort' : language === 'it' ? 'posizione' : 'location');
      if (!formData.date) missing.push(language === 'he' ? 'תאריך' : language === 'ru' ? 'дата' : language === 'es' ? 'fecha' : language === 'fr' ? 'date' : language === 'de' ? 'Datum' : language === 'it' ? 'data' : 'date');
      toast.error((language === 'he' ? 'שדות חובה חסרים: ' : language === 'ru' ? 'Отсутствуют обязательные поля: ' : language === 'es' ? 'Faltan campos obligatorios: ' : language === 'fr' ? 'Champs obligatoires manquants : ' : language === 'de' ? 'Erforderliche Felder fehlen: ' : language === 'it' ? 'Campi obbligatori mancanti: ' : 'Required fields missing: ') + missing.join(', '));
      return;
    }

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
        allergens,
        daily_itinerary: itinerary,
        budget,
        // Clean up empty numeric fields
        cycling_distance: formData.cycling_distance || undefined,
        cycling_elevation: formData.cycling_elevation || undefined,
        offroad_distance: formData.offroad_distance || undefined,
      };

      const createdTrip = await base44.entities.Trip.create(tripData);
      toast.success(language === 'he' ? 'הטיול נשמר בהצלחה!' : language === 'ru' ? 'Поездка успешно создана!' : language === 'es' ? '¡Viaje creado exitosamente!' : language === 'fr' ? 'Voyage créé avec succès !' : language === 'de' ? 'Reise erfolgreich erstellt!' : language === 'it' ? 'Viaggio creato con successo!' : 'Trip created successfully!');
      setShowWaiver(false);
      navigate(createPageUrl('TripDetails') + '?id=' + createdTrip.id);
    } catch (error) {
      console.error('Error:', error);
      toast.error(language === 'he' ? 'שגיאה בשמירה' : language === 'ru' ? 'Ошибка сохранения' : language === 'es' ? 'Error al guardar' : language === 'fr' ? 'Erreur lors de l\'enregistrement' : language === 'de' ? 'Fehler beim Speichern' : language === 'it' ? 'Errore nel salvataggio' : 'Error saving trip');
    } finally {
      setSaving(false);
    }
  };

  const handleWaiverDecline = () => {
    setShowWaiver(false);
    setSaving(false);
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

  if (!user) return null;

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
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-teal-50/40 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-2xl shadow-2xl mb-6">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <Compass className="w-7 h-7" />
            </div>
            <h1 className="text-3xl font-bold">
              {t('createTrip')}
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {language === 'he' 
              ? 'שתף את חוויית הטיול שלך ומצא שותפים להרפתקה הבאה' 
              : language === 'ru' 
              ? 'Поделитесь своим опытом путешествий и найдите партнеров для следующего приключения'
              : language === 'es'
              ? 'Comparte tu experiencia de viaje y encuentra compañeros para la próxima aventura'
              : language === 'fr'
              ? 'Partagez votre expérience de voyage et trouvez des partenaires pour la prochaine aventure'
              : language === 'de'
              ? 'Teilen Sie Ihre Reiseerfahrung und finden Sie Partner für das nächste Abenteuer'
              : language === 'it'
              ? 'Condividi la tua esperienza di viaggio e trova compagni per la prossima avventura'
              : 'Share your trip experience and find partners for the next adventure'}
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="border-2 border-emerald-100 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent font-bold">
                    {language === 'he' ? 'פרטים בסיסיים' : language === 'ru' ? 'Основные детали' : language === 'es' ? 'Detalles básicos' : language === 'fr' ? 'Détails de base' : language === 'de' ? 'Grundlegende Details' : language === 'it' ? 'Dettagli di base' : 'Basic Details'}
                  </span>
                </CardTitle>
              </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{language === 'he' ? 'כותרת' : language === 'ru' ? 'Название' : language === 'es' ? 'Título' : language === 'fr' ? 'Titre' : language === 'de' ? 'Titel' : language === 'it' ? 'Titolo' : 'Title'}</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder={language === 'he' ? 'כותרת הטיול' : language === 'ru' ? 'Название поездки' : language === 'es' ? 'Título del viaje' : language === 'fr' ? 'Titre du voyage' : language === 'de' ? 'Reise-Titel' : language === 'it' ? 'Titolo del viaggio' : 'Trip title'}
                  dir={isRTL ? 'rtl' : 'ltr'}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>{language === 'he' ? 'תיאור' : language === 'ru' ? 'Описание' : language === 'es' ? 'Descripción' : language === 'fr' ? 'Description' : language === 'de' ? 'Beschreibung' : language === 'it' ? 'Descrizione' : 'Description'}</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder={language === 'he' ? 'תיאור הטיול' : language === 'ru' ? 'Описание поездки' : language === 'es' ? 'Descripción del viaje' : language === 'fr' ? 'Description du voyage' : language === 'de' ? 'Reisebeschreibung' : language === 'it' ? 'Descrizione del viaggio' : 'Trip description'}
                  dir={isRTL ? 'rtl' : 'ltr'}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>{t('uploadImage')}</Label>
                <div className="flex items-center gap-4">
                  {formData.image_url ? (
                    <img 
                      src={formData.image_url} 
                      alt="Trip" 
                      className="w-32 h-24 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-32 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Upload className="w-8 h-8 text-gray-400" />
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
                      <span>
                        {imageUploading ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <Upload className="w-4 h-4 mr-2" />
                        )}
                        {language === 'he' ? 'העלה תמונה' : language === 'ru' ? 'Загрузить' : language === 'es' ? 'Subir' : language === 'fr' ? 'Télécharger' : language === 'de' ? 'Hochladen' : language === 'it' ? 'Carica' : 'Upload'}
                      </span>
                    </Button>
                  </label>
                </div>
              </div>
            </CardContent>
            </Card>
          </motion.div>

          {/* Location & Time */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="border-2 border-blue-100 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-blue-100">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-blue-700 to-cyan-700 bg-clip-text text-transparent font-bold">
                    {language === 'he' ? 'מיקום וזמן' : language === 'ru' ? 'Местоположение и время' : language === 'es' ? 'Ubicación y tiempo' : language === 'fr' ? 'Emplacement et horaire' : language === 'de' ? 'Standort & Zeit' : language === 'it' ? 'Posizione e orario' : 'Location & Time'}
                  </span>
                </CardTitle>
              </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2 relative">
                  <Label className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    {t('country')}
                  </Label>
                  <Select 
                    value={formData.country} 
                    onValueChange={(v) => handleChange('country', v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={language === 'he' ? 'בחר מדינה' : language === 'ru' ? 'Выберите страну' : language === 'es' ? 'Seleccionar país' : language === 'fr' ? 'Sélectionner pays' : language === 'de' ? 'Land auswählen' : language === 'it' ? 'Seleziona paese' : 'Select country'} />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {countries.map(c => (
                        <SelectItem key={c} value={c}>
                          {t(c)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className={`grid grid-cols-1 ${formData.country === 'israel' ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-4`}>
                    {formData.country !== 'israel' && (
                      <div className="space-y-2">
                        <Label>{language === 'he' ? 'מחוז/מדינה' : language === 'ru' ? 'Штат/Провинция' : language === 'es' ? 'Estado/Provincia' : language === 'fr' ? 'État/Province' : language === 'de' ? 'Bundesland/Provinz' : language === 'it' ? 'Stato/Provincia' : 'State/Province'}</Label>
                        <Select 
                          value={formData.region} 
                          onValueChange={(v) => handleChange('region', v)}
                          disabled={loadingRegions}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={loadingRegions ? (language === 'he' ? 'טוען...' : language === 'ru' ? 'Загрузка...' : language === 'es' ? 'Cargando...' : language === 'fr' ? 'Chargement...' : language === 'de' ? 'Lädt...' : language === 'it' ? 'Caricamento...' : 'Loading...') : (language === 'he' ? 'בחר מחוז' : language === 'ru' ? 'Выберите штат' : language === 'es' ? 'Seleccionar estado' : language === 'fr' ? 'Sélectionner état' : language === 'de' ? 'Bundesland auswählen' : language === 'it' ? 'Seleziona stato' : 'Select state')} />
                          </SelectTrigger>
                          <SelectContent>
                            {dynamicRegions.map(r => (
                              <SelectItem key={r} value={r}>
                                {r.charAt(0).toUpperCase() + r.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {loadingRegions && (
                          <p className="text-xs text-blue-600 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 animate-pulse" />
                            {language === 'he' ? 'AI יוצר מחוזות...' : language === 'ru' ? 'AI генерирует штаты...' : language === 'es' ? 'IA generando estados...' : language === 'fr' ? 'IA génère les états...' : language === 'de' ? 'KI generiert Bundesländer...' : language === 'it' ? 'IA genera stati...' : 'AI generating states...'}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>{language === 'he' ? 'אזור/עיר' : language === 'ru' ? 'Район/Город' : language === 'es' ? 'Área/Ciudad' : language === 'fr' ? 'Zone/Ville' : language === 'de' ? 'Gebiet/Stadt' : language === 'it' ? 'Area/Città' : 'Area/City'}</Label>
                      <Select 
                        value={formData.country === 'israel' ? formData.region : formData.sub_region} 
                        onValueChange={(v) => handleChange(formData.country === 'israel' ? 'region' : 'sub_region', v)}
                        disabled={formData.country === 'israel' ? loadingRegions : (loadingSubRegions || !formData.region)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={
                            formData.country === 'israel'
                              ? loadingRegions
                                ? (language === 'he' ? 'טוען...' : language === 'ru' ? 'Загрузка...' : language === 'es' ? 'Cargando...' : language === 'fr' ? 'Chargement...' : language === 'de' ? 'Lädt...' : language === 'it' ? 'Caricamento...' : 'Loading...')
                                : (language === 'he' ? 'בחר אזור' : language === 'ru' ? 'Выберите район' : language === 'es' ? 'Seleccionar área' : language === 'fr' ? 'Sélectionner zone' : language === 'de' ? 'Gebiet auswählen' : language === 'it' ? 'Seleziona area' : 'Select area')
                              : !formData.region 
                              ? (language === 'he' ? 'בחר מחוז תחילה' : language === 'ru' ? 'Сначала выберите штат' : language === 'es' ? 'Selecciona estado primero' : language === 'fr' ? 'Sélectionnez d\'abord l\'état' : language === 'de' ? 'Wählen Sie zuerst das Bundesland' : language === 'it' ? 'Seleziona prima lo stato' : 'Select state first')
                              : loadingSubRegions 
                              ? (language === 'he' ? 'טוען...' : language === 'ru' ? 'Загрузка...' : language === 'es' ? 'Cargando...' : language === 'fr' ? 'Chargement...' : language === 'de' ? 'Lädt...' : language === 'it' ? 'Caricamento...' : 'Loading...') 
                              : (language === 'he' ? 'בחר אזור' : language === 'ru' ? 'Выберите район' : language === 'es' ? 'Seleccionar área' : language === 'fr' ? 'Sélectionner zone' : language === 'de' ? 'Gebiet auswählen' : language === 'it' ? 'Seleziona area' : 'Select area')
                          } />
                        </SelectTrigger>
                        <SelectContent>
                          {(formData.country === 'israel' ? dynamicRegions : dynamicSubRegions).map(item => (
                            <SelectItem key={item} value={item}>
                              {item}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {(formData.country === 'israel' ? loadingRegions : loadingSubRegions) && (
                        <p className="text-xs text-blue-600 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 animate-pulse" />
                          {language === 'he' ? 'AI יוצר אזורים...' : language === 'ru' ? 'AI генерирует районы...' : language === 'es' ? 'IA generando áreas...' : language === 'fr' ? 'IA génère les zones...' : language === 'de' ? 'KI generiert Gebiete...' : language === 'it' ? 'IA genera aree...' : 'AI generating areas...'}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>{t('location')}</Label>
                      <div className="flex gap-2">
                        <Input
                          value={formData.location}
                          onChange={(e) => handleChange('location', e.target.value)}
                          placeholder={language === 'he' ? 'שם מדויק' : language === 'ru' ? 'Точное название' : language === 'es' ? 'Nombre específico' : language === 'fr' ? 'Nom spécifique' : language === 'de' ? 'Spezifischer Name' : language === 'it' ? 'Nome specifico' : 'Specific name'}
                          required
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleLocationSearch}
                          disabled={searchingLocation}
                          className="gap-2 flex-shrink-0"
                        >
                          {searchingLocation ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Navigation className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                      {formData.latitude && formData.longitude && (
                        <p className="text-xs text-green-600 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {language === 'he' ? 'מיקום נמצא' : language === 'ru' ? 'Найдено' : language === 'es' ? 'Encontrado' : language === 'fr' ? 'Trouvé' : language === 'de' ? 'Gefunden' : language === 'it' ? 'Trovato' : 'Found'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('date')}</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleChange('date', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {language === 'he' ? 'שעת התכנסות' : language === 'ru' ? 'Время встречи' : language === 'es' ? 'Hora de encuentro' : language === 'fr' ? 'Heure de rendez-vous' : language === 'de' ? 'Treffzeit' : language === 'it' ? 'Ora d\'incontro' : 'Meeting Time'}
                  </Label>
                  <Input
                    type="time"
                    value={formData.meeting_time}
                    onChange={(e) => handleChange('meeting_time', e.target.value)}
                    placeholder="08:00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('duration')}</Label>
                  <Select value={formData.duration_type} onValueChange={(v) => handleChange('duration_type', v)}>
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
                  <Label>{t('durationValue')}</Label>
                  <Input
                    type="number"
                    min={1}
                    value={formData.duration_value}
                    onChange={(e) => handleChange('duration_value', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
            </Card>
          </motion.div>

          {/* Trail Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="border-2 border-amber-100 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-lg">
                    <Mountain className="w-5 h-5 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent font-bold">
                    {language === 'he' ? 'פרטי המסלול' : language === 'ru' ? 'Детали маршрута' : language === 'es' ? 'Detalles del recorrido' : language === 'fr' ? 'Détails du parcours' : language === 'de' ? 'Routendetails' : language === 'it' ? 'Dettagli del percorso' : 'Trail Details'}
                  </span>
                </CardTitle>
              </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('activityType')} *</Label>
                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      type="button"
                      variant={formData.activity_type === 'hiking' ? 'default' : 'outline'}
                      className={`h-20 flex flex-col items-center gap-2 ${
                        formData.activity_type === 'hiking'
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'hover:border-emerald-500 hover:text-emerald-600'
                      }`}
                      onClick={() => handleChange('activity_type', 'hiking')}
                    >
                      <Footprints className="w-6 h-6" />
                      <span className="text-sm font-semibold">{t('hiking')}</span>
                    </Button>
                    <Button
                      type="button"
                      variant={formData.activity_type === 'cycling' ? 'default' : 'outline'}
                      className={`h-20 flex flex-col items-center gap-2 ${
                        formData.activity_type === 'cycling'
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'hover:border-blue-500 hover:text-blue-600'
                      }`}
                      onClick={() => handleChange('activity_type', 'cycling')}
                    >
                      <Bike className="w-6 h-6" />
                      <span className="text-sm font-semibold">{t('cycling')}</span>
                    </Button>
                    <Button
                      type="button"
                      variant={formData.activity_type === 'offroad' ? 'default' : 'outline'}
                      className={`h-20 flex flex-col items-center gap-2 ${
                        formData.activity_type === 'offroad'
                          ? 'bg-orange-600 hover:bg-orange-700 text-white'
                          : 'hover:border-orange-500 hover:text-orange-600'
                      }`}
                      onClick={() => handleChange('activity_type', 'offroad')}
                    >
                      <Truck className="w-6 h-6" />
                      <span className="text-sm font-semibold">{t('offroad')}</span>
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>{t('difficulty')}</Label>
                  <Select value={formData.difficulty} onValueChange={(v) => handleChange('difficulty', v)}>
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

              {/* Cycling Specific Fields */}
              {formData.activity_type === 'cycling' && (
                <>
                  <div className="space-y-2">
                    <Label>{t('cyclingType')} *</Label>
                    <Select value={formData.cycling_type} onValueChange={(v) => handleChange('cycling_type', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('cyclingType')} />
                      </SelectTrigger>
                      <SelectContent>
                        {cyclingTypes.map(type => (
                          <SelectItem key={type} value={type}>{t(type)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('cyclingDistance')}</Label>
                      <Input
                        type="number"
                        min={1}
                        value={formData.cycling_distance}
                        onChange={(e) => handleChange('cycling_distance', parseInt(e.target.value))}
                        placeholder="50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('cyclingElevation')}</Label>
                      <Input
                        type="number"
                        min={0}
                        value={formData.cycling_elevation}
                        onChange={(e) => handleChange('cycling_elevation', parseInt(e.target.value))}
                        placeholder="500"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Off-road Specific Fields */}
              {formData.activity_type === 'offroad' && (
                <>
                  <div className="space-y-2">
                    <Label>{t('offroadVehicleType')} *</Label>
                    <Select value={formData.offroad_vehicle_type} onValueChange={(v) => handleChange('offroad_vehicle_type', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('offroadVehicleType')} />
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
                      placeholder="80"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>{t('offroadTerrainType')}</Label>
                    <div className="flex flex-wrap gap-2">
                      {offroadTerrainTypes.map(type => (
                        <Badge
                          key={type}
                          variant={formData.offroad_terrain_type.includes(type) ? 'default' : 'outline'}
                          className={`cursor-pointer transition-all ${
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
                </>
              )}

              <div className="space-y-2">
                <Label>{t('maxParticipants')}</Label>
                <Input
                  type="number"
                  min={2}
                  max={50}
                  value={formData.max_participants}
                  onChange={(e) => handleChange('max_participants', parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-3">
                <Label>{t('trailType')}</Label>
                <div className="flex flex-wrap gap-2">
                  {trailTypes.map(type => (
                    <Badge
                      key={type}
                      variant={formData.trail_type.includes(type) ? 'default' : 'outline'}
                      className={`cursor-pointer transition-all ${
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
                <Label>{t('interests')}</Label>
                <div className="flex flex-wrap gap-2">
                  {interests.map(interest => (
                    <Badge
                      key={interest}
                      variant={formData.interests.includes(interest) ? 'default' : 'outline'}
                      className={`cursor-pointer transition-all ${
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
                <Label>{t('accessibilityTypes')}</Label>
                <div className="flex flex-wrap gap-2">
                  {accessibilityTypes.map(type => (
                    <Badge
                      key={type}
                      variant={formData.accessibility_types.includes(type) ? 'default' : 'outline'}
                      className={`cursor-pointer transition-all ${
                        formData.accessibility_types.includes(type) 
                          ? 'bg-purple-600 hover:bg-purple-700' 
                          : 'hover:border-purple-500'
                      }`}
                      onClick={() => handleArrayToggle('accessibility_types', type)}
                    >
                      {t(type)}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-6 pt-2">
                <motion.div 
                  whileHover={{ scale: 1.02 }} 
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-3"
                >
                  <div className="relative">
                    <Checkbox
                      id="pets"
                      checked={formData.pets_allowed}
                      onCheckedChange={(checked) => handleChange('pets_allowed', checked)}
                      className="h-5 w-5 border-2 border-amber-400 data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600 transition-all"
                    />
                    {formData.pets_allowed && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1"
                      >
                        <Dog className="w-4 h-4 text-amber-600" />
                      </motion.div>
                    )}
                  </div>
                  <Label htmlFor="pets" className="cursor-pointer font-medium flex items-center gap-2 text-gray-700 hover:text-amber-700 transition-colors">
                    <Dog className="w-4 h-4 text-amber-600" />
                    {t('petsAllowed')}
                  </Label>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.02 }} 
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-3"
                >
                  <div className="relative">
                    <Checkbox
                      id="camping"
                      checked={formData.camping_available}
                      onCheckedChange={(checked) => handleChange('camping_available', checked)}
                      className="h-5 w-5 border-2 border-emerald-400 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 transition-all"
                    />
                    {formData.camping_available && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1"
                      >
                        <Tent className="w-4 h-4 text-emerald-600" />
                      </motion.div>
                    )}
                  </div>
                  <Label htmlFor="camping" className="cursor-pointer font-medium flex items-center gap-2 text-gray-700 hover:text-emerald-700 transition-colors">
                    <Tent className="w-4 h-4 text-emerald-600" />
                    {t('campingAvailable')}
                  </Label>
                </motion.div>
              </div>

              {/* Guide Information */}
              <div className="space-y-4 pt-4 border-t border-amber-200">
                <motion.div 
                  whileHover={{ scale: 1.02 }} 
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-3"
                >
                  <div className="relative">
                    <Checkbox
                      id="has_guide"
                      checked={formData.has_guide}
                      onCheckedChange={(checked) => handleChange('has_guide', checked)}
                      className="h-5 w-5 border-2 border-blue-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 transition-all"
                    />
                    {formData.has_guide && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1"
                      >
                        <User className="w-4 h-4 text-blue-600" />
                      </motion.div>
                    )}
                  </div>
                  <Label htmlFor="has_guide" className="cursor-pointer font-medium flex items-center gap-2 text-gray-700 hover:text-blue-700 transition-colors">
                    <User className="w-4 h-4 text-blue-600" />
                    {language === 'he' ? 'יש מדריך מקצועי' : language === 'ru' ? 'Есть профессиональный гид' : language === 'es' ? 'Tiene guía profesional' : language === 'fr' ? 'A un guide professionnel' : language === 'de' ? 'Hat professionellen Führer' : language === 'it' ? 'Ha guida professionale' : 'Has Professional Guide'}
                  </Label>
                </motion.div>

                {formData.has_guide && (
                  <div className="space-y-4 pl-6 pr-6">
                    <div className="space-y-2">
                      <Label>{language === 'he' ? 'שם המדריך' : language === 'ru' ? 'Имя гида' : language === 'es' ? 'Nombre del guía' : language === 'fr' ? 'Nom du guide' : language === 'de' ? 'Name des Führers' : language === 'it' ? 'Nome della guida' : 'Guide Name'}</Label>
                      <Input
                        value={formData.guide_name || ''}
                        onChange={(e) => handleChange('guide_name', e.target.value)}
                        placeholder={language === 'he' ? 'הכנס שם המדריך' : language === 'ru' ? 'Введите имя гида' : language === 'es' ? 'Ingresa nombre del guía' : language === 'fr' ? 'Entrez le nom du guide' : language === 'de' ? 'Führernamen eingeben' : language === 'it' ? 'Inserisci nome della guida' : 'Enter guide name'}
                        dir={isRTL ? 'rtl' : 'ltr'}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{language === 'he' ? 'נושא ההדרכה' : language === 'ru' ? 'Тема экскурсии' : language === 'es' ? 'Tema de guía' : language === 'fr' ? 'Sujet du guide' : language === 'de' ? 'Führungsthema' : language === 'it' ? 'Argomento della guida' : 'Guide Topic'}</Label>
                      <Textarea
                        value={formData.guide_topic || ''}
                        onChange={(e) => handleChange('guide_topic', e.target.value)}
                        placeholder={language === 'he' ? 'למשל: צמחיה, היסטוריה, ציפורים...' : language === 'ru' ? 'напр., Флора, История, Птицы...' : language === 'es' ? 'ej., Flora, Historia, Aves...' : language === 'fr' ? 'ex., Flore, Histoire, Oiseaux...' : language === 'de' ? 'z.B. Flora, Geschichte, Vögel...' : language === 'it' ? 'es., Flora, Storia, Uccelli...' : 'e.g., Flora, History, Birds...'}
                        rows={3}
                        dir={isRTL ? 'rtl' : 'ltr'}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            </Card>
          </motion.div>

          {/* Age Ranges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="border-2 border-purple-100 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent font-bold">
                    {language === 'he' ? 'גילאים' : language === 'ru' ? 'Возрастные группы' : language === 'es' ? 'Rangos de edad' : language === 'fr' ? 'Tranches d\'âge' : language === 'de' ? 'Altersgruppen' : language === 'it' ? 'Fasce d\'età' : 'Age Ranges'}
                  </span>
                </CardTitle>
                <CardDescription>
                  {language === 'he' ? 'בחר טווחי גילאים מתאימים לטיול' : language === 'ru' ? 'Выберите подходящие возрастные группы для поездки' : language === 'es' ? 'Selecciona rangos de edad apropiados para el viaje' : language === 'fr' ? 'Sélectionnez les tranches d\'âge appropriées pour le voyage' : language === 'de' ? 'Wählen Sie geeignete Altersgruppen für die Reise' : language === 'it' ? 'Seleziona le fasce d\'età appropriate per il viaggio' : 'Select appropriate age ranges for the trip'}
                </CardDescription>
              </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label className="flex items-center gap-2 text-purple-700 font-bold text-base">
                  <div className="p-1.5 bg-purple-100 rounded-lg">
                    <Users className="w-4 h-4 text-purple-700" />
                  </div>
                  {language === 'he' ? 'טווחי גילאי הורים' : language === 'ru' ? 'Возраст родителей' : language === 'es' ? 'Rangos de edad de padres' : language === 'fr' ? 'Tranches d\'âge des parents' : language === 'de' ? 'Altersgruppen Eltern' : language === 'it' ? 'Fasce d\'età genitori' : 'Parent Age Ranges'}
                </Label>
                <div className="flex flex-wrap gap-3">
                  {['20-30', '30-40', '40-50', '50-60', '60+'].map(range => (
                    <motion.button
                      key={range}
                      type="button"
                      whileHover={{ scale: 1.08, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleArrayToggle('parent_age_ranges', range)}
                      className={`relative px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                        formData.parent_age_ranges.includes(range)
                          ? 'bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 text-white shadow-2xl shadow-purple-500/50'
                          : 'bg-white border-2 border-purple-200 text-purple-700 hover:border-purple-400 hover:bg-purple-50 hover:shadow-lg'
                      }`}
                    >
                      {formData.parent_age_ranges.includes(range) && (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-lg"
                        >
                          <Users className="w-3 h-3 text-purple-600" />
                        </motion.div>
                      )}
                      <span className="relative z-10">{range}</span>
                      {formData.parent_age_ranges.includes(range) && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-xl"
                          style={{
                            backgroundSize: '200% 100%',
                            animation: 'shimmer 2s infinite'
                          }}
                        />
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label className="flex items-center gap-2 text-pink-700 font-bold text-base">
                  <div className="p-1.5 bg-pink-100 rounded-lg">
                    <User className="w-4 h-4 text-pink-700" />
                  </div>
                  {language === 'he' ? 'טווחי גילאי ילדים' : language === 'ru' ? 'Возраст детей' : language === 'es' ? 'Rangos de edad de niños' : language === 'fr' ? 'Tranches d\'âge des enfants' : language === 'de' ? 'Altersgruppen Kinder' : language === 'it' ? 'Fasce d\'età bambini' : 'Children Age Ranges'}
                </Label>
                <div className="flex flex-wrap gap-3">
                  {['0-2', '3-6', '7-10', '11-14', '15-18', '18-21', '21+'].map(range => (
                    <motion.button
                      key={range}
                      type="button"
                      whileHover={{ scale: 1.08, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleArrayToggle('children_age_ranges', range)}
                      className={`relative px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                        formData.children_age_ranges.includes(range)
                          ? 'bg-gradient-to-br from-pink-500 via-pink-600 to-rose-600 text-white shadow-2xl shadow-pink-500/50'
                          : 'bg-white border-2 border-pink-200 text-pink-700 hover:border-pink-400 hover:bg-pink-50 hover:shadow-lg'
                      }`}
                    >
                      {formData.children_age_ranges.includes(range) && (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-lg"
                        >
                          <User className="w-3 h-3 text-pink-600" />
                        </motion.div>
                      )}
                      <span className="relative z-10">{range}</span>
                      {formData.children_age_ranges.includes(range) && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-xl"
                          style={{
                            backgroundSize: '200% 100%',
                            animation: 'shimmer 2s infinite'
                          }}
                        />
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            </CardContent>
            </Card>
          </motion.div>

          {/* Planning Tools */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <WaypointsCreator
              waypoints={waypoints}
              setWaypoints={setWaypoints}
              startLat={formData.latitude}
              startLng={formData.longitude}
              locationName={formData.location}
            />

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

            <BudgetCreator
              budget={budget}
              setBudget={setBudget}
            />
          </motion.div>

          {/* Submit */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex gap-4 justify-end pt-4"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate(createPageUrl('Home'))}
                disabled={saving}
                className="border-2 hover:bg-gray-50 transition-all duration-300 px-8 py-6 text-base font-semibold"
              >
                {t('cancel')}
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                type="submit"
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 min-w-[160px] px-8 py-6 text-base font-bold shadow-2xl hover:shadow-3xl transition-all duration-300"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    {language === 'he' ? 'שומר...' : language === 'ru' ? 'Сохранение...' : language === 'es' ? 'Guardando...' : language === 'fr' ? 'Enregistrement...' : language === 'de' ? 'Speichern...' : language === 'it' ? 'Salvataggio...' : 'Saving...'}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    {t('save')}
                  </>
                )}
              </Button>
            </motion.div>
          </motion.div>
        </form>
      </div>

      <OrganizerWaiver
        open={showWaiver}
        onAccept={saveTrip}
        onDecline={handleWaiverDecline}
      />
    </div>
    </>
  );
}