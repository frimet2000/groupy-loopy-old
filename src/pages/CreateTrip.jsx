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
import { Loader2, Upload, MapPin, Mountain, Clock, Sparkles, Navigation, Globe, Calendar, Users, Compass } from 'lucide-react';
import { motion } from 'framer-motion';
import { detectUserLocation, getRegionFromCoordinates } from '../components/utils/LocationDetector';
import LocationPicker from '../components/maps/LocationPicker';
import { getAllCountries } from '../components/utils/CountryRegions';
import WaypointsCreator from '../components/creation/WaypointsCreator';
import EquipmentCreator from '../components/creation/EquipmentCreator';
import ItineraryCreator from '../components/creation/ItineraryCreator';
import BudgetCreator from '../components/creation/BudgetCreator';
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
  
  const countries = getAllCountries();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    country: '',
    region: '',
    sub_region: '',
    date: '',
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
    max_participants: 10,
    image_url: ''
  });

  const [waypoints, setWaypoints] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [itinerary, setItinerary] = useState([]);
  const [budget, setBudget] = useState({
    solo_min: 0,
    solo_max: 0,
    family_min: 0,
    family_max: 0,
    currency: 'ILS',
    notes: ''
  });

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
                setFormData(prev => ({ ...prev, country: 'israel' }));
                await fetchRegionsForCountry('israel');
              }
            },
            async (error) => {
              console.log('Geolocation not available, using default');
              setFormData(prev => ({ ...prev, country: 'israel' }));
              await fetchRegionsForCountry('israel');
            }
          );
        } else {
          setFormData(prev => ({ ...prev, country: 'israel' }));
          await fetchRegionsForCountry('israel');
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
      
      // Open map picker to confirm/adjust location
      setShowMapPicker(true);
    } catch (error) {
      toast.error(language === 'he' ? 'לא ניתן למצוא את המיקום' : 'Could not find location');
      setSearchingLocation(false);
    }
  };

  const handleMapConfirm = async (lat, lng) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng
    }));
    
    setShowMapPicker(false);
    
    // Get detailed location information from coordinates
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: language === 'he'
          ? `עבור הקואורדינטות ${lat}, ${lng}, תן את הפרטים הבאים:
1. location_name: שם מדויק של המיקום (עיר/אתר/שכונה)
2. sub_region: שם העיר או האזור הכללי (באנגלית, lowercase)
3. region: שם המחוז או המדינה (באנגלית, lowercase)
4. country: שם המדינה (באנגלית, lowercase, עם underscores אם יש רווחים)`
          : `For coordinates ${lat}, ${lng}, provide the following details:
1. location_name: exact location name (city/site/neighborhood)
2. sub_region: city or general area name (English, lowercase)
3. region: state or province name (English, lowercase)
4. country: country name (English, lowercase, with underscores for spaces)`,
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
          location: result.location_name,
          sub_region: isIsrael ? '' : (result.sub_region || prev.sub_region),
          region: isIsrael ? (result.sub_region || result.region || prev.region) : (result.region || prev.region),
          country: result.country || prev.country
        }));
        
        toast.success(language === 'he' ? `מיקום מלא נשמר: ${result.location_name}` : `Full location saved: ${result.location_name}`);
      } else {
        toast.success(language === 'he' ? 'מיקום נשמר' : 'Location saved');
      }
    } catch (error) {
      console.error('Error getting location details:', error);
      toast.success(language === 'he' ? 'מיקום נשמר' : 'Location saved');
    }
  };

  const saveTrip = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.location || !formData.date) {
      const missing = [];
      if (!formData.title) missing.push(language === 'he' ? 'כותרת' : 'title');
      if (!formData.location) missing.push(language === 'he' ? 'מיקום' : 'location');
      if (!formData.date) missing.push(language === 'he' ? 'תאריך' : 'date');
      toast.error((language === 'he' ? 'שדות חובה חסרים: ' : 'Required fields missing: ') + missing.join(', '));
      return;
    }

    setSaving(true);
    try {
      const tripData = {
        ...formData,
        current_participants: 1,
        status: 'open',
        organizer_name: user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : (user?.full_name || user?.email || ''),
        organizer_email: user?.email || '',
        participants: [{
          email: user?.email || '',
          name: user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : (user?.full_name || user?.email || ''),
          joined_at: new Date().toISOString(),
          accessibility_needs: []
        }],
        waypoints,
        equipment_checklist: equipment,
        daily_itinerary: itinerary,
        budget,
        // Clean up empty numeric fields
        cycling_distance: formData.cycling_distance || undefined,
        cycling_elevation: formData.cycling_elevation || undefined,
        offroad_distance: formData.offroad_distance || undefined,
      };

      const createdTrip = await base44.entities.Trip.create(tripData);
      toast.success(language === 'he' ? 'הטיול נשמר בהצלחה!' : 'Trip created successfully!');
      navigate(createPageUrl('TripDetails') + '?id=' + createdTrip.id);
    } catch (error) {
      console.error('Error:', error);
      toast.error(language === 'he' ? 'שגיאה בשמירה' : 'Error saving trip');
    } finally {
      setSaving(false);
    }
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
              : 'Share your trip experience and find partners for the next adventure'}
          </p>
        </motion.div>

        <form onSubmit={saveTrip} className="space-y-6">
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
                    {language === 'he' ? 'פרטים בסיסיים' : 'Basic Details'}
                  </span>
                </CardTitle>
              </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{language === 'he' ? 'כותרת' : 'Title'}</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder={language === 'he' ? 'כותרת הטיול' : 'Trip title'}
                  dir={isRTL ? 'rtl' : 'ltr'}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>{language === 'he' ? 'תיאור' : 'Description'}</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder={language === 'he' ? 'תיאור הטיול' : 'Trip description'}
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
                        {language === 'he' ? 'העלה תמונה' : 'Upload'}
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
                    {language === 'he' ? 'מיקום וזמן' : 'Location & Time'}
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
                  <div className="relative">
                    <Input
                      value={countrySearchValue}
                      onChange={(e) => {
                        setCountrySearchValue(e.target.value);
                        setShowCountryDropdown(true);
                      }}
                      onFocus={() => {
                        if (!countrySearchValue && formData.country) {
                          setCountrySearchValue(t(formData.country));
                        }
                        setShowCountryDropdown(true);
                      }}
                      placeholder={language === 'he' ? 'חפש מדינה...' : 'Search country...'}
                      dir={isRTL ? 'rtl' : 'ltr'}
                      className="w-full"
                    />
                    {formData.country && !showCountryDropdown && !countrySearchValue && (
                      <div className="absolute inset-0 flex items-center px-3 pointer-events-none text-gray-900">
                        {t(formData.country)}
                      </div>
                    )}
                  </div>
                  {showCountryDropdown && (
                    <div className="absolute z-50 w-full mt-1 max-h-60 overflow-auto bg-white border border-gray-200 rounded-lg shadow-xl">
                      {countries
                        .filter(c => {
                          const translated = t(c).toLowerCase();
                          const search = countrySearchValue.toLowerCase();
                          return !countrySearchValue || translated.includes(search) || c.includes(search);
                        })
                        .slice(0, 10)
                        .map(c => (
                          <div
                            key={c}
                            className={`px-4 py-2 cursor-pointer hover:bg-blue-50 transition-colors ${
                              formData.country === c ? 'bg-blue-100 font-semibold' : ''
                            }`}
                            onClick={() => {
                              handleChange('country', c);
                              setCountrySearchValue(t(c));
                              setShowCountryDropdown(false);
                            }}
                          >
                            {t(c)}
                          </div>
                        ))}
                      {countries.filter(c => {
                        const translated = t(c).toLowerCase();
                        const search = countrySearchValue.toLowerCase();
                        return !countrySearchValue || translated.includes(search) || c.includes(search);
                      }).length === 0 && (
                        <div className="px-4 py-2 text-gray-500 text-center">
                          {language === 'he' ? 'לא נמצאו תוצאות' : 'No results'}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className={`grid grid-cols-1 ${formData.country === 'israel' ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-4`}>
                    {formData.country !== 'israel' && (
                      <div className="space-y-2">
                        <Label>{language === 'he' ? 'מחוז/מדינה' : 'State/Province'}</Label>
                        <Select 
                          value={formData.region} 
                          onValueChange={(v) => handleChange('region', v)}
                          disabled={loadingRegions}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={loadingRegions ? (language === 'he' ? 'טוען...' : 'Loading...') : (language === 'he' ? 'בחר מחוז' : 'Select state')} />
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
                            {language === 'he' ? 'AI יוצר מחוזות...' : 'AI generating states...'}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>{language === 'he' ? 'אזור/עיר' : 'Area/City'}</Label>
                      <Select 
                        value={formData.country === 'israel' ? formData.region : formData.sub_region} 
                        onValueChange={(v) => handleChange(formData.country === 'israel' ? 'region' : 'sub_region', v)}
                        disabled={formData.country === 'israel' ? loadingRegions : (loadingSubRegions || !formData.region)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={
                            formData.country === 'israel'
                              ? loadingRegions
                                ? (language === 'he' ? 'טוען...' : 'Loading...')
                                : (language === 'he' ? 'בחר אזור' : 'Select area')
                              : !formData.region 
                              ? (language === 'he' ? 'בחר מחוז תחילה' : 'Select state first')
                              : loadingSubRegions 
                              ? (language === 'he' ? 'טוען...' : 'Loading...') 
                              : (language === 'he' ? 'בחר אזור' : 'Select area')
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
                          {language === 'he' ? 'AI יוצר אזורים...' : 'AI generating areas...'}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>{t('location')}</Label>
                      <div className="flex gap-2">
                        <Input
                          value={formData.location}
                          onChange={(e) => handleChange('location', e.target.value)}
                          placeholder={language === 'he' ? 'שם מדויק' : 'Specific name'}
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
                          {language === 'he' ? 'מיקום נמצא' : 'Found'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    {language === 'he' ? 'פרטי המסלול' : 'Trail Details'}
                  </span>
                </CardTitle>
              </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('activityType')} *</Label>
                  <Select value={formData.activity_type} onValueChange={(v) => handleChange('activity_type', v)}>
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
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="pets"
                    checked={formData.pets_allowed}
                    onCheckedChange={(checked) => handleChange('pets_allowed', checked)}
                  />
                  <Label htmlFor="pets" className="cursor-pointer">{t('petsAllowed')}</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="camping"
                    checked={formData.camping_available}
                    onCheckedChange={(checked) => handleChange('camping_available', checked)}
                  />
                  <Label htmlFor="camping" className="cursor-pointer">{t('campingAvailable')}</Label>
                </div>
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
                    {language === 'he' ? 'גילאים' : 'Age Ranges'}
                  </span>
                </CardTitle>
                <CardDescription>
                  {language === 'he' ? 'בחר טווחי גילאים מתאימים לטיול' : 'Select appropriate age ranges for the trip'}
                </CardDescription>
              </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>{language === 'he' ? 'טווחי גילאי הורים' : 'Parent Age Ranges'}</Label>
                <div className="flex flex-wrap gap-2">
                  {['20-30', '30-40', '40-50', '50-60', '60+'].map(range => (
                    <Badge
                      key={range}
                      variant={formData.parent_age_ranges.includes(range) ? 'default' : 'outline'}
                      className={`cursor-pointer transition-all ${
                        formData.parent_age_ranges.includes(range) 
                          ? 'bg-purple-600 hover:bg-purple-700' 
                          : 'hover:border-purple-500'
                      }`}
                      onClick={() => handleArrayToggle('parent_age_ranges', range)}
                    >
                      {range}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>{language === 'he' ? 'טווחי גילאי ילדים' : 'Children Age Ranges'}</Label>
                <div className="flex flex-wrap gap-2">
                  {['0-2', '3-6', '7-10', '11-14', '15-18', '18-21', '21+'].map(range => (
                    <Badge
                      key={range}
                      variant={formData.children_age_ranges.includes(range) ? 'default' : 'outline'}
                      className={`cursor-pointer transition-all ${
                        formData.children_age_ranges.includes(range) 
                          ? 'bg-pink-600 hover:bg-pink-700' 
                          : 'hover:border-pink-500'
                      }`}
                      onClick={() => handleArrayToggle('children_age_ranges', range)}
                    >
                      {range}
                    </Badge>
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
            />

            <ItineraryCreator
              itinerary={itinerary}
              setItinerary={setItinerary}
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
                    {language === 'he' ? 'שומר...' : 'Saving...'}
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
    </div>
    </>
  );
}