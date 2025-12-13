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
import { Loader2, Upload, MapPin, Mountain, Clock, Sparkles, Navigation } from 'lucide-react';
import { getRegionFromCoordinates } from '../components/utils/LocationDetector';
import LocationPicker from '../components/maps/LocationPicker';

const regions = ['north', 'center', 'south', 'jerusalem', 'negev', 'eilat'];
const difficulties = ['easy', 'moderate', 'challenging', 'hard', 'extreme'];
const durations = ['hours', 'half_day', 'full_day', 'overnight', 'multi_day'];
const activityTypes = ['hiking', 'cycling', 'offroad'];
const cyclingTypes = ['road', 'mountain', 'gravel', 'hybrid', 'bmx', 'electric'];
const offroadVehicleTypes = ['jeep', 'atv', 'dirt_bike', 'side_by_side', 'buggy', 'truck'];
const offroadTerrainTypes = ['sand', 'rocks', 'mud', 'hills', 'desert', 'forest_trails', 'river_crossing'];
const trailTypes = ['water', 'full_shade', 'partial_shade', 'desert', 'forest', 'coastal', 'mountain', 'historical', 'urban'];
const interests = ['nature', 'history', 'photography', 'birdwatching', 'archaeology', 'geology', 'botany', 'extreme_sports', 'family_friendly', 'romantic'];
const accessibilityTypes = ['wheelchair', 'visual_impairment', 'hearing_impairment', 'mobility_aid', 'stroller_friendly', 'elderly_friendly'];

export default function EditTrip() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [imageUploading, setImageUploading] = useState(false);
  const [tripId, setTripId] = useState(null);
  const [showMapPicker, setShowMapPicker] = useState(false);
  
  const [formData, setFormData] = useState({
    title_he: '',
    title_en: '',
    description_he: '',
    description_en: '',
    location: '',
    latitude: null,
    longitude: null,
    region: '',
    date: '',
    duration_type: 'full_day',
    duration_value: 1,
    activity_type: 'hiking',
    difficulty: 'moderate',
    cycling_type: '',
    cycling_distance: '',
    cycling_elevation: '',
    offroad_vehicle_type: '',
    offroad_distance: '',
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

        if (trip.organizer_email !== userData.email) {
          toast.error(language === 'he' ? 'אין הרשאה לערוך טיול זה' : 'No permission to edit this trip');
          navigate(createPageUrl('TripDetails') + '?id=' + id);
          return;
        }

        setFormData({
          title_he: trip.title_he || '',
          title_en: trip.title_en || '',
          description_he: trip.description_he || '',
          description_en: trip.description_en || '',
          location: trip.location || '',
          latitude: trip.latitude || null,
          longitude: trip.longitude || null,
          region: trip.region || '',
          date: trip.date || '',
          duration_type: trip.duration_type || 'full_day',
          duration_value: trip.duration_value || 1,
          activity_type: trip.activity_type || 'hiking',
          difficulty: trip.difficulty || 'moderate',
          cycling_type: trip.cycling_type || '',
          cycling_distance: trip.cycling_distance || '',
          cycling_elevation: trip.cycling_elevation || '',
          offroad_vehicle_type: trip.offroad_vehicle_type || '',
          offroad_distance: trip.offroad_distance || '',
          offroad_terrain_type: trip.offroad_terrain_type || [],
          trail_type: trip.trail_type || [],
          interests: trip.interests || [],
          accessibility_types: trip.accessibility_types || [],
          parent_age_ranges: trip.parent_age_ranges || [],
          children_age_ranges: trip.children_age_ranges || [],
          pets_allowed: trip.pets_allowed || false,
          camping_available: trip.camping_available || false,
          max_participants: trip.max_participants || 10,
          image_url: trip.image_url || ''
        });

        setLoading(false);
      } catch (e) {
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

    setImageUploading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: language === 'he'
          ? `מצא קואורדינטות GPS (latitude, longitude) עבור המיקום "${formData.location}" בישראל. חפש ב-Google Maps ותן קואורדינטות מדויקות.`
          : `Find GPS coordinates (latitude, longitude) for the location "${formData.location}" in Israel. Search Google Maps and provide exact coordinates.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            latitude: { type: "number" },
            longitude: { type: "number" }
          }
        }
      });
      
      handleChange('latitude', result.latitude);
      handleChange('longitude', result.longitude);
      
      // Auto-detect region based on coordinates
      const detectedRegion = getRegionFromCoordinates(result.latitude, result.longitude);
      handleChange('region', detectedRegion);
      
      setImageUploading(false);
      
      // Open map picker to confirm/adjust location
      setShowMapPicker(true);
    } catch (error) {
      toast.error(language === 'he' ? 'לא ניתן למצוא את המיקום' : 'Could not find location');
      setImageUploading(false);
    }
  };

  const handleMapConfirm = (lat, lng) => {
    handleChange('latitude', lat);
    handleChange('longitude', lng);
    
    // Update region based on new coordinates
    const detectedRegion = getRegionFromCoordinates(lat, lng);
    handleChange('region', detectedRegion);
    
    toast.success(language === 'he' ? 'מיקום נשמר' : 'Location saved');
  };

  const saveTrip = async (e) => {
    e.preventDefault();
    
    if (!formData.title_he || !formData.location || !formData.date) {
      toast.error(language === 'he' ? 'נא למלא את כל השדות' : 'Please fill all fields');
      return;
    }

    setSaving(true);
    try {
      const tripData = {
        title_he: formData.title_he,
        title_en: formData.title_en || formData.title_he,
        description_he: formData.description_he,
        description_en: formData.description_en || formData.description_he,
        location: formData.location,
        latitude: formData.latitude,
        longitude: formData.longitude,
        region: formData.region,
        date: formData.date,
        duration_type: formData.duration_type,
        duration_value: formData.duration_value,
        activity_type: formData.activity_type,
        difficulty: formData.difficulty,
        cycling_type: formData.cycling_type,
        cycling_distance: formData.cycling_distance,
        cycling_elevation: formData.cycling_elevation,
        offroad_vehicle_type: formData.offroad_vehicle_type,
        offroad_distance: formData.offroad_distance,
        offroad_terrain_type: formData.offroad_terrain_type,
        trail_type: formData.trail_type,
        interests: formData.interests,
        accessibility_types: formData.accessibility_types,
        parent_age_ranges: formData.parent_age_ranges,
        children_age_ranges: formData.children_age_ranges,
        pets_allowed: formData.pets_allowed,
        camping_available: formData.camping_available,
        max_participants: formData.max_participants,
        image_url: formData.image_url
      };

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
      
      <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          {language === 'he' ? 'עריכת טיול' : language === 'ru' ? 'Редактировать поездку' : 'Edit Trip'}
        </h1>

        <form onSubmit={saveTrip} className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                {language === 'he' ? 'פרטים בסיסיים' : language === 'ru' ? 'Основные детали' : 'Basic Details'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t('titleHe')}</Label>
                <Input
                  value={formData.title_he}
                  onChange={(e) => handleChange('title_he', e.target.value)}
                  placeholder="כותרת בעברית"
                  dir="rtl"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>{t('descriptionHe')}</Label>
                <Textarea
                  value={formData.description_he}
                  onChange={(e) => handleChange('description_he', e.target.value)}
                  placeholder="תיאור בעברית"
                  dir="rtl"
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

          {/* Location & Time */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                {language === 'he' ? 'מיקום וזמן' : language === 'ru' ? 'Местоположение и время' : 'Location & Time'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('location')}</Label>
                    <div className="flex gap-2">
                      <Input
                        value={formData.location}
                        onChange={(e) => handleChange('location', e.target.value)}
                        placeholder={language === 'he' ? 'נחל דוד, עין גדי' : 'Nahal David, Ein Gedi'}
                        required
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleLocationSearch}
                        disabled={imageUploading || !formData.location}
                        className="gap-2"
                      >
                        {imageUploading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Navigation className="w-4 h-4" />
                        )}
                        {language === 'he' ? 'חפש במפה' : language === 'ru' ? 'Найти на карте' : 'Find on Map'}
                      </Button>
                    </div>
                    {formData.latitude && formData.longitude && (
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {language === 'he' ? 'מיקום נמצא במפה' : language === 'ru' ? 'Местоположение найдено' : 'Location found'}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>{t('region')}</Label>
                    <Select value={formData.region} onValueChange={(v) => handleChange('region', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('selectRegion')} />
                      </SelectTrigger>
                      <SelectContent>
                        {regions.map(r => (
                          <SelectItem key={r} value={r}>{t(r)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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

          {/* Trail Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mountain className="w-5 h-5 text-amber-600" />
                {language === 'he' ? 'פרטי המסלול' : language === 'ru' ? 'Детали маршрута' : 'Trail Details'}
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

          {/* Age Ranges */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-600" />
                {language === 'he' ? 'גילאים' : language === 'ru' ? 'Возрастные группы' : 'Age Ranges'}
              </CardTitle>
              <CardDescription>
                {language === 'he' ? 'בחר טווחי גילאים מתאימים לטיול' : language === 'ru' ? 'Выберите подходящие возрастные группы для поездки' : 'Select appropriate age ranges for the trip'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>{language === 'he' ? 'טווחי גילאי הורים' : language === 'ru' ? 'Возраст родителей' : 'Parent Age Ranges'}</Label>
                <div className="flex flex-wrap gap-2">
                  {['30-40', '40-50', '50-60', '60+'].map(range => (
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
                <Label>{language === 'he' ? 'טווחי גילאי ילדים' : language === 'ru' ? 'Возраст детей' : 'Children Age Ranges'}</Label>
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

          {/* Submit */}
          <div className="flex gap-4 justify-end">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate(createPageUrl('TripDetails') + '?id=' + tripId)}
              disabled={saving}
            >
              {t('cancel')}
            </Button>
            <Button 
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 min-w-[140px]"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  {language === 'he' ? 'שומר...' : language === 'ru' ? 'Сохранение...' : 'Saving...'}
                </>
              ) : (
                language === 'he' ? 'עדכן טיול' : language === 'ru' ? 'Обновить поездку' : 'Update Trip'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
    </>
  );
}