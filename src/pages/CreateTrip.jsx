import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguage } from '../components/LanguageContext';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { format } from 'date-fns';
import { CalendarIcon, Upload, Loader2, MapPin, Clock, Mountain, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { detectUserLocation } from '../components/utils/LocationDetector';

const regions = ['north', 'center', 'south', 'jerusalem', 'negev', 'eilat'];
const difficulties = ['easy', 'moderate', 'challenging', 'hard'];
const durations = ['hours', 'half_day', 'full_day', 'overnight', 'multi_day'];
const trailTypes = ['water', 'full_shade', 'partial_shade', 'desert', 'forest', 'coastal', 'mountain', 'historical', 'urban'];
const interests = ['nature', 'history', 'photography', 'birdwatching', 'archaeology', 'geology', 'botany', 'extreme_sports', 'family_friendly', 'romantic'];

export default function CreateTrip() {
  const { t, language, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    title_he: '',
    title_en: '',
    description_he: '',
    description_en: '',
    location: '',
    region: '',
    date: '',
    duration_type: 'full_day',
    duration_value: 1,
    difficulty: 'moderate',
    trail_type: [],
    interests: [],
    parent_age_min: 18,
    parent_age_max: 65,
    children_age_min: 0,
    children_age_max: 18,
    pets_allowed: false,
    camping_available: false,
    max_participants: 10,
    image_url: '',
    status: 'open'
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        
        // Detect location and set region
        if (userData.home_region) {
          handleChange('region', userData.home_region);
        } else {
          detectUserLocation((region) => {
            handleChange('region', region);
          });
        }
      } catch (e) {
        toast.error(language === 'he' ? 'יש להתחבר כדי ליצור טיול' : 'Please login to create a trip');
        navigate(createPageUrl('Home'));
      }
    };
    fetchUser();
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title_he || !formData.title_en) {
      toast.error(language === 'he' ? 'נא למלא כותרת בעברית ובאנגלית' : 'Please fill in title in both languages');
      return;
    }
    if (!formData.location) {
      toast.error(language === 'he' ? 'נא למלא את המיקום' : 'Please fill in location');
      return;
    }
    if (!formData.region) {
      toast.error(language === 'he' ? 'נא לבחור אזור' : 'Please select region');
      return;
    }
    if (!formData.date) {
      toast.error(language === 'he' ? 'נא לבחור תאריך' : 'Please select date');
      return;
    }

    setLoading(true);
    try {
      const tripData = {
        ...formData,
        organizer_name: user.full_name,
        organizer_email: user.email,
        current_participants: 1,
        participants: [{
          email: user.email,
          name: user.full_name,
          joined_at: new Date().toISOString()
        }]
      };

      await base44.entities.Trip.create(tripData);
      toast.success(t('tripCreated'));
      navigate(createPageUrl('MyTrips'));
    } catch (error) {
      console.error('Error creating trip:', error);
      toast.error(language === 'he' ? 'שגיאה ביצירת הטיול: ' + error.message : 'Error creating trip: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {t('createTrip')}
            </h1>
            <p className="text-gray-500">
              {language === 'he' ? 'צור טיול חדש ומצא שותפים לדרך' : 'Create a new trip and find partners'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                  {language === 'he' ? 'פרטים בסיסיים' : 'Basic Details'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('titleHe')}</Label>
                    <Input
                      value={formData.title_he}
                      onChange={(e) => handleChange('title_he', e.target.value)}
                      placeholder="טיול לנחל..."
                      dir="rtl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('titleEn')}</Label>
                    <Input
                      value={formData.title_en}
                      onChange={(e) => handleChange('title_en', e.target.value)}
                      placeholder="Trip to..."
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('descriptionHe')}</Label>
                    <Textarea
                      value={formData.description_he}
                      onChange={(e) => handleChange('description_he', e.target.value)}
                      placeholder="תיאור הטיול..."
                      dir="rtl"
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('descriptionEn')}</Label>
                    <Textarea
                      value={formData.description_en}
                      onChange={(e) => handleChange('description_en', e.target.value)}
                      placeholder="Trip description..."
                      dir="ltr"
                      rows={4}
                    />
                  </div>
                </div>

                {/* Image Upload */}
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
                      <Button type="button" variant="outline" disabled={imageUploading}>
                        {imageUploading ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <Upload className="w-4 h-4 mr-2" />
                        )}
                        {language === 'he' ? 'העלה תמונה' : 'Upload'}
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
                  {language === 'he' ? 'מיקום וזמן' : 'Location & Time'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('location')}</Label>
                    <Input
                      value={formData.location}
                      onChange={(e) => handleChange('location', e.target.value)}
                      placeholder={language === 'he' ? 'נחל דוד, עין גדי' : 'Nahal David, Ein Gedi'}
                    />
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>{t('date')}</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.date ? format(new Date(formData.date), 'PPP') : t('selectDate')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.date ? new Date(formData.date) : undefined}
                          onSelect={(date) => handleChange('date', date ? format(date, 'yyyy-MM-dd') : '')}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
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
                  {language === 'he' ? 'פרטי המסלול' : 'Trail Details'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div className="flex flex-wrap gap-6 pt-2">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="pets"
                      checked={formData.pets_allowed}
                      onCheckedChange={(checked) => handleChange('pets_allowed', checked)}
                      className="data-[state=checked]:bg-emerald-600"
                    />
                    <Label htmlFor="pets" className="cursor-pointer">{t('petsAllowed')}</Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="camping"
                      checked={formData.camping_available}
                      onCheckedChange={(checked) => handleChange('camping_available', checked)}
                      className="data-[state=checked]:bg-emerald-600"
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
                  {language === 'he' ? 'גילאים' : 'Age Ranges'}
                </CardTitle>
                <CardDescription>
                  {language === 'he' ? 'הגדר את טווח הגילאים המתאים לטיול' : 'Set appropriate age ranges for the trip'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label>{t('parentAgeRange')}</Label>
                    <div className="flex gap-4">
                      <div className="flex-1 space-y-1">
                        <span className="text-xs text-gray-500">{t('minAge')}</span>
                        <Input
                          type="number"
                          min={18}
                          max={100}
                          value={formData.parent_age_min}
                          onChange={(e) => handleChange('parent_age_min', parseInt(e.target.value))}
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <span className="text-xs text-gray-500">{t('maxAge')}</span>
                        <Input
                          type="number"
                          min={18}
                          max={100}
                          value={formData.parent_age_max}
                          onChange={(e) => handleChange('parent_age_max', parseInt(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label>{t('childrenAgeRange')}</Label>
                    <div className="flex gap-4">
                      <div className="flex-1 space-y-1">
                        <span className="text-xs text-gray-500">{t('minAge')}</span>
                        <Input
                          type="number"
                          min={0}
                          max={18}
                          value={formData.children_age_min}
                          onChange={(e) => handleChange('children_age_min', parseInt(e.target.value))}
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <span className="text-xs text-gray-500">{t('maxAge')}</span>
                        <Input
                          type="number"
                          min={0}
                          max={18}
                          value={formData.children_age_max}
                          onChange={(e) => handleChange('children_age_max', parseInt(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex gap-4 justify-end">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate(createPageUrl('Home'))}
              >
                {t('cancel')}
              </Button>
              <Button 
                type="submit" 
                className="bg-emerald-600 hover:bg-emerald-700 min-w-[140px]"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  t('save')
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}