import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguage } from '../components/LanguageContext';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { User, Mail, Save, Loader2, Settings, MapPin, Heart, Edit2, Upload, Camera, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const interests = ['nature', 'history', 'photography', 'birdwatching', 'archaeology', 'geology', 'botany', 'extreme_sports', 'family_friendly', 'romantic'];
const regions = ['north', 'center', 'south', 'jerusalem', 'negev', 'eilat'];

export default function Profile() {
  const { t, language, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    profile_image: '',
    bio: '',
    phone: '',
    preferred_regions: [],
    preferred_interests: [],
    home_region: '',
    fitness_level: 'moderate',
    vehicle_type: 'none',
  });
  const [preferences, setPreferences] = useState({
    preferred_regions: [],
    preferred_interests: [],
    preferred_difficulty: '',
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        
        const nameParts = userData.full_name?.split(' ') || ['', ''];
        setFormData({
          first_name: userData.first_name || nameParts[0] || '',
          last_name: userData.last_name || nameParts.slice(1).join(' ') || '',
          profile_image: userData.profile_image || '',
          bio: userData.bio || '',
          phone: userData.phone || '',
          preferred_regions: userData.preferred_regions || [],
          preferred_interests: userData.preferred_interests || [],
          home_region: userData.home_region || '',
          fitness_level: userData.fitness_level || 'moderate',
          vehicle_type: userData.vehicle_type || 'none',
        });
        
        setPreferences({
          preferred_regions: userData.preferred_regions || [],
          preferred_interests: userData.preferred_interests || [],
          preferred_difficulty: userData.preferred_difficulty || '',
        });
      } catch (e) {
        base44.auth.redirectToLogin(createPageUrl('Profile'));
      }
    };
    fetchUser();
  }, []);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const togglePreference = (field, value) => {
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
      handleChange('profile_image', file_url);
      toast.success(language === 'he' ? 'התמונה הועלתה' : 'Image uploaded');
    } catch (error) {
      toast.error(language === 'he' ? 'שגיאה בהעלאת התמונה' : 'Error uploading image');
    }
    setImageUploading(false);
  };

  const handleCameraCapture = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      handleChange('profile_image', file_url);
      toast.success(language === 'he' ? 'התמונה צולמה והועלתה' : 'Photo captured and uploaded');
    } catch (error) {
      toast.error(language === 'he' ? 'שגיאה בצילום התמונה' : 'Error capturing photo');
    }
    setImageUploading(false);
  };

  const handleSave = async () => {
    if (!formData.first_name || !formData.last_name) {
      toast.error(language === 'he' ? 'נא למלא שם פרטי ושם משפחה' : 'Please fill in first and last name');
      return;
    }

    setLoading(true);
    try {
      const fullName = `${formData.first_name} ${formData.last_name}`.trim();
      await base44.auth.updateMe({
        ...formData,
        full_name: fullName,
      });
      
      const updatedUser = await base44.auth.me();
      setUser(updatedUser);
      setEditMode(false);
      toast.success(language === 'he' ? 'הפרופיל עודכן בהצלחה' : 'Profile updated successfully');
    } catch (error) {
      toast.error(language === 'he' ? 'שגיאה בעדכון הפרופיל' : 'Error updating profile');
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Profile Header */}
          <Card className="mb-6 border-0 shadow-lg overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-emerald-500 to-emerald-700" />
            <CardContent className="relative pt-0 pb-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-12 sm:-mt-10">
                <div className="relative">
                  {editMode ? (
                    <>
                      {formData.profile_image ? (
                        <img 
                          src={formData.profile_image} 
                          alt="Profile" 
                          className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center border-4 border-white shadow-lg">
                          <Camera className="w-8 h-8 text-emerald-400" />
                        </div>
                      )}
                      <div className="absolute bottom-0 right-0 flex gap-1">
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handleCameraCapture}
                            className="hidden"
                          />
                          <div className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center shadow-lg transition-all">
                            {imageUploading ? (
                              <Loader2 className="w-4 h-4 text-white animate-spin" />
                            ) : (
                              <Camera className="w-4 h-4 text-white" />
                            )}
                          </div>
                        </label>
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                          <div className="w-8 h-8 rounded-full bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center shadow-lg transition-all">
                            {imageUploading ? (
                              <Loader2 className="w-4 h-4 text-white animate-spin" />
                            ) : (
                              <Upload className="w-4 h-4 text-white" />
                            )}
                          </div>
                        </label>
                      </div>
                    </>
                  ) : (
                    <>
                      {user.profile_image ? (
                        <img 
                          src={user.profile_image} 
                          alt="Profile" 
                          className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                        />
                      ) : (
                        <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                          <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white text-2xl font-bold">
                            {user.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </>
                  )}
                </div>
                <div className="text-center sm:text-start flex-1">
                  <h1 className="text-2xl font-bold text-gray-900">{user.full_name}</h1>
                  <p className="text-gray-500 flex items-center justify-center sm:justify-start gap-2">
                    <Mail className="w-4 h-4" />
                    {user.email}
                  </p>
                  {user.bio && !editMode && (
                    <p className="text-sm text-gray-600 mt-2">{user.bio}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                    {user.role === 'admin' ? (language === 'he' ? 'מנהל' : 'Admin') : (language === 'he' ? 'משתמש' : 'User')}
                  </Badge>
                  {!editMode && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditMode(true)}
                      className="gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      {language === 'he' ? 'ערוך פרופיל' : 'Edit Profile'}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Edit Mode - Personal Info */}
          {editMode && (
            <Card className="mb-6 border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-600" />
                  {language === 'he' ? 'פרטים אישיים' : 'Personal Information'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{language === 'he' ? 'שם פרטי' : 'First Name'} *</Label>
                    <Input
                      value={formData.first_name}
                      onChange={(e) => handleChange('first_name', e.target.value)}
                      dir={language === 'he' ? 'rtl' : 'ltr'}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'he' ? 'שם משפחה' : 'Last Name'} *</Label>
                    <Input
                      value={formData.last_name}
                      onChange={(e) => handleChange('last_name', e.target.value)}
                      dir={language === 'he' ? 'rtl' : 'ltr'}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{language === 'he' ? 'טלפון' : 'Phone'}</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder={language === 'he' ? '050-1234567' : '050-1234567'}
                    dir="ltr"
                  />
                </div>

                <div className="space-y-2">
                  <Label>{language === 'he' ? 'אודותיי' : 'Bio'}</Label>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => handleChange('bio', e.target.value)}
                    placeholder={language === 'he' 
                      ? 'ספר קצת על עצמך, מה אתה אוהב בטיולים...'
                      : 'Tell us about yourself, what you love about hiking...'}
                    rows={3}
                    dir={language === 'he' ? 'rtl' : 'ltr'}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{language === 'he' ? 'אזור מגורים' : 'Home Region'}</Label>
                    <Select value={formData.home_region} onValueChange={(v) => handleChange('home_region', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder={language === 'he' ? 'בחר אזור' : 'Select region'} />
                      </SelectTrigger>
                      <SelectContent>
                        {regions.map(r => (
                          <SelectItem key={r} value={r}>{t(r)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>{language === 'he' ? 'רמת כושר' : 'Fitness Level'}</Label>
                    <Select value={formData.fitness_level} onValueChange={(v) => handleChange('fitness_level', v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">
                          {language === 'he' ? 'נמוכה' : 'Low'}
                        </SelectItem>
                        <SelectItem value="moderate">
                          {language === 'he' ? 'בינונית' : 'Moderate'}
                        </SelectItem>
                        <SelectItem value="high">
                          {language === 'he' ? 'גבוהה' : 'High'}
                        </SelectItem>
                        <SelectItem value="very_high">
                          {language === 'he' ? 'גבוהה מאוד' : 'Very High'}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{language === 'he' ? 'סוג רכב' : 'Vehicle Type'}</Label>
                  <Select value={formData.vehicle_type} onValueChange={(v) => handleChange('vehicle_type', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        {language === 'he' ? 'אין רכב' : 'No vehicle'}
                      </SelectItem>
                      <SelectItem value="regular">
                        {language === 'he' ? 'רכב רגיל' : 'Regular vehicle'}
                      </SelectItem>
                      <SelectItem value="4x4">
                        {language === 'he' ? 'רכב שטח (4X4)' : '4X4 vehicle'}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Preferences */}
          {editMode && (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-emerald-600" />
                  {language === 'he' ? 'העדפות טיולים' : 'Trip Preferences'}
                </CardTitle>
                <CardDescription>
                  {language === 'he' 
                    ? 'הגדר את ההעדפות שלך לקבלת המלצות מותאמות אישית'
                    : 'Set your preferences for personalized recommendations'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Preferred Regions */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    {language === 'he' ? 'אזורים מועדפים' : 'Preferred Regions'}
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {regions.map(region => (
                      <Badge
                        key={region}
                        variant={formData.preferred_regions.includes(region) ? 'default' : 'outline'}
                        className={`cursor-pointer transition-all py-2 px-3 ${
                          formData.preferred_regions.includes(region) 
                            ? 'bg-blue-600 hover:bg-blue-700' 
                            : 'hover:border-blue-500 hover:text-blue-600'
                        }`}
                        onClick={() => togglePreference('preferred_regions', region)}
                      >
                        {t(region)}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Preferred Interests */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-600" />
                    {language === 'he' ? 'תחומי עניין' : 'Interests'}
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {interests.map(interest => (
                      <Badge
                        key={interest}
                        variant={formData.preferred_interests.includes(interest) ? 'default' : 'outline'}
                        className={`cursor-pointer transition-all py-2 px-3 ${
                          formData.preferred_interests.includes(interest) 
                            ? 'bg-rose-600 hover:bg-rose-700' 
                            : 'hover:border-rose-500 hover:text-rose-600'
                        }`}
                        onClick={() => togglePreference('preferred_interests', interest)}
                      >
                        {t(interest)}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          {editMode && (
            <div className="flex gap-4 justify-end mt-6">
              <Button 
                variant="outline"
                onClick={() => {
                  setEditMode(false);
                  // Reset form data
                  const nameParts = user.full_name?.split(' ') || ['', ''];
                  setFormData({
                    first_name: user.first_name || nameParts[0] || '',
                    last_name: user.last_name || nameParts.slice(1).join(' ') || '',
                    profile_image: user.profile_image || '',
                    bio: user.bio || '',
                    phone: user.phone || '',
                    preferred_regions: user.preferred_regions || [],
                    preferred_interests: user.preferred_interests || [],
                    home_region: user.home_region || '',
                    fitness_level: user.fitness_level || 'moderate',
                    vehicle_type: user.vehicle_type || 'none',
                  });
                }}
                disabled={loading}
                className="gap-2"
              >
                <X className="w-4 h-4" />
                {t('cancel')}
              </Button>
              <Button 
                onClick={handleSave}
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 gap-2 min-w-[140px]"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {language === 'he' ? 'שמור שינויים' : 'Save Changes'}
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}