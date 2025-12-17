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
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { motion } from 'framer-motion';
import { 
  Users, Heart, MapPin, Car, Activity, ChevronRight, ChevronLeft, 
  CheckCircle2, Loader2, Accessibility, Plus, X, User, Upload, Camera, Globe
} from 'lucide-react';
import { getRegionsForCountry, getAllCountries } from '../components/utils/CountryRegions';

const interests = ['nature', 'history', 'photography', 'birdwatching', 'archaeology', 'geology', 'botany', 'extreme_sports', 'family_friendly', 'romantic'];
const relations = ['self', 'spouse', 'boy', 'girl', 'parent', 'sibling', 'friend', 'dog'];

export default function Onboarding() {
  const { t, language, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const totalSteps = 5;
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    profile_image: '',
    family_ages: [{ relation: 'self', age: 30 }],
    fitness_level: 'moderate',
    has_physical_disability: false,
    disability_description: '',
    needs_accessibility: false,
    accessibility_requirements: '',
    trip_interests: [],
    home_country: 'israel',
    home_region: '',
    vehicle_type: 'none',
    has_4x4_vehicle: false,
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleInterest = (interest) => {
    setFormData(prev => ({
      ...prev,
      trip_interests: prev.trip_interests.includes(interest)
        ? prev.trip_interests.filter(i => i !== interest)
        : [...prev.trip_interests, interest]
    }));
  };

  const addFamilyMember = () => {
    setFormData(prev => ({
      ...prev,
      family_ages: [...prev.family_ages, { relation: 'child', age: 10 }]
    }));
  };

  const removeFamilyMember = (index) => {
    setFormData(prev => ({
      ...prev,
      family_ages: prev.family_ages.filter((_, i) => i !== index)
    }));
  };

  const updateFamilyMember = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      family_ages: prev.family_ages.map((member, i) => 
        i === index ? { ...member, [field]: value } : member
      )
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

  const handleNext = () => {
    if (step === 0 && (!formData.first_name || !formData.last_name)) {
      toast.error(language === 'he' ? 'נא למלא שם פרטי ושם משפחה' : 'Please fill in first and last name');
      return;
    }
    if (step < totalSteps - 1) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const fullName = `${formData.first_name} ${formData.last_name}`.trim();
      await base44.auth.updateMe({
        ...formData,
        full_name: fullName,
        profile_completed: true
      });
      
      // Mark first login as completed for PWA install prompt
      localStorage.setItem('first_login_completed', 'true');
      
      toast.success(language === 'he' ? 'הפרופיל נשמר בהצלחה!' : 'Profile saved successfully!');
      setCompleted(true);
    } catch (error) {
      toast.error(language === 'he' ? 'שגיאה בשמירת הפרופיל' : 'Error saving profile');
    }
    setLoading(false);
  };

  const progress = ((step + 1) / totalSteps) * 100;

  if (completed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 py-8 px-4 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl w-full"
        >
          <Card className="border-0 shadow-2xl">
            <CardContent className="p-8 text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-full mb-4 shadow-lg shadow-emerald-500/30">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              
              <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  {language === 'he' ? 'מעולה! הפרופיל שלך מוכן 🎉' : 'Great! Your profile is ready 🎉'}
                </h1>
                <p className="text-lg text-gray-600">
                  {language === 'he' 
                    ? 'עכשיו הגיע הזמן למצוא שותפים לטיול הבא שלך'
                    : 'Now it\'s time to find partners for your next trip'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <Button
                  onClick={() => navigate(createPageUrl('Home'))}
                  size="lg"
                  variant="outline"
                  className="h-auto py-6 flex flex-col gap-2 border-2 hover:border-emerald-500 hover:bg-emerald-50"
                >
                  <Users className="w-8 h-8 text-emerald-600" />
                  <div className="space-y-1">
                    <div className="font-bold text-base">
                      {language === 'he' ? 'הצטרף לטיול קיים' : 'Join Existing Trip'}
                    </div>
                    <div className="text-xs text-gray-500 font-normal">
                      {language === 'he' ? 'מצא קבוצה שמתכננת טיול' : 'Find a group planning a trip'}
                    </div>
                  </div>
                </Button>

                <Button
                  onClick={() => navigate(createPageUrl('CreateTrip'))}
                  size="lg"
                  className="h-auto py-6 flex flex-col gap-2 bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
                >
                  <Plus className="w-8 h-8" />
                  <div className="space-y-1">
                    <div className="font-bold text-base">
                      {language === 'he' ? 'צור טיול חדש' : 'Create New Trip'}
                    </div>
                    <div className="text-xs text-emerald-100 font-normal">
                      {language === 'he' ? 'הזמן אחרים להצטרף אליך' : 'Invite others to join you'}
                    </div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl mb-4 shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              {language === 'he' ? 'ברוכים הבאים!' : 'Welcome!'}
            </h1>
            <p className="text-gray-500 text-lg">
              {language === 'he' 
                ? 'בואו נכיר אתכם טוב יותר כדי להמליץ על הטיולים המושלמים עבורכם'
                : "Let's get to know you better to recommend perfect trips"}
            </p>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">
                {language === 'he' ? 'התקדמות' : 'Progress'}
              </span>
              <span className="text-sm font-medium text-emerald-600">
                {step + 1}/{totalSteps}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Steps */}
          <Card className="border-0 shadow-xl">
            <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    {step === 0 && <User className="w-6 h-6 text-indigo-600" />}
                    {step === 1 && <Users className="w-6 h-6 text-blue-600" />}
                    {step === 2 && <Activity className="w-6 h-6 text-emerald-600" />}
                    {step === 3 && <Heart className="w-6 h-6 text-rose-600" />}
                    {step === 4 && <MapPin className="w-6 h-6 text-purple-600" />}
                    
                    {step === 0 && (language === 'he' ? 'פרטים אישיים' : 'Personal Details')}
                    {step === 1 && (language === 'he' ? 'בני המשפחה' : 'Family Members')}
                    {step === 2 && (language === 'he' ? 'רמת כושר ונגישות' : 'Fitness & Accessibility')}
                    {step === 3 && (language === 'he' ? 'תחומי עניין' : 'Interests')}
                    {step === 4 && (language === 'he' ? 'מיקום ורכב' : 'Location & Vehicle')}
                  </CardTitle>
                  <CardDescription>
                    {step === 0 && (language === 'he' ? 'איך נקרא לך?' : 'What should we call you?')}
                    {step === 1 && (language === 'he' ? 'מי יצא איתכם לטיולים?' : 'Who will be joining you on trips?')}
                    {step === 2 && (language === 'he' ? 'מה רמת הכושר הפיזי ודרישות הנגישות?' : 'What is your fitness level and accessibility needs?')}
                    {step === 3 && (language === 'he' ? 'מה מעניין אתכם בטיולים?' : 'What interests you in trips?')}
                    {step === 4 && (language === 'he' ? 'איפה אתם גרים ואיזה רכב יש לכם?' : 'Where do you live and what vehicle do you have?')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  {/* Step 0: Personal Details */}
                  {step === 0 && (
                    <div className="space-y-6">
                      {/* Profile Image */}
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                          {formData.profile_image ? (
                            <img 
                              src={formData.profile_image} 
                              alt="Profile" 
                              className="w-32 h-32 rounded-full object-cover border-4 border-indigo-100"
                            />
                          ) : (
                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center border-4 border-indigo-100">
                              <Camera className="w-12 h-12 text-indigo-400" />
                            </div>
                          )}
                          <label className="absolute bottom-0 right-0 cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                            <div className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center shadow-lg transition-all">
                              {imageUploading ? (
                                <Loader2 className="w-5 h-5 text-white animate-spin" />
                              ) : (
                                <Upload className="w-5 h-5 text-white" />
                              )}
                            </div>
                          </label>
                        </div>
                        <p className="text-sm text-gray-500 text-center">
                          {language === 'he' 
                            ? 'הוסף תמונת פרופיל (אופציונלי)'
                            : 'Add profile photo (optional)'}
                        </p>
                      </div>

                      {/* Name Fields */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-base font-semibold flex items-center gap-2">
                            {language === 'he' ? 'שם פרטי' : 'First Name'}
                            <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            value={formData.first_name}
                            onChange={(e) => handleChange('first_name', e.target.value)}
                            className="h-12 text-lg"
                            dir={language === 'he' ? 'rtl' : 'ltr'}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-base font-semibold flex items-center gap-2">
                            {language === 'he' ? 'שם משפחה' : 'Last Name'}
                            <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            value={formData.last_name}
                            onChange={(e) => handleChange('last_name', e.target.value)}
                            className="h-12 text-lg"
                            dir={language === 'he' ? 'rtl' : 'ltr'}
                          />
                        </div>

                        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mt-4">
                          <p className="text-sm text-indigo-800 leading-relaxed">
                            💡 {language === 'he' 
                              ? 'השם הזה יוצג למשתתפים אחרים בטיולים ויעזור להם להכיר אותך'
                              : 'This name will be shown to other participants on trips and help them get to know you'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 1: Family Ages */}
                  {step === 1 && (
                    <div className="space-y-4">
                      {formData.family_ages.map((member, index) => (
                        <div key={index} className="flex gap-3 items-start p-4 bg-gray-50 rounded-xl">
                          <div className="flex-1 grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label className="text-xs">
                                {language === 'he' ? 'קשר משפחתי' : 'Relation'}
                              </Label>
                              <Select
                                value={member.relation}
                                onValueChange={(v) => updateFamilyMember(index, 'relation', v)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {relations.map(r => (
                                    <SelectItem key={r} value={r}>
                                      {language === 'he' 
                                        ? {self: 'אני', spouse: 'בן/בת זוג', boy: 'ילד', girl: 'ילדה', parent: 'הורה', sibling: 'אח/אחות', friend: 'חבר/ה', dog: 'כלב'}[r]
                                        : {self: 'Self', spouse: 'Spouse', boy: 'Boy', girl: 'Girl', parent: 'Parent', sibling: 'Sibling', friend: 'Friend', dog: 'Dog'}[r]
                                      }
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs">
                                {language === 'he' ? 'גיל' : 'Age'}
                              </Label>
                              <Input
                                type="number"
                                min={0}
                                max={120}
                                value={member.age}
                                onChange={(e) => updateFamilyMember(index, 'age', parseInt(e.target.value))}
                              />
                            </div>
                          </div>
                          {index > 0 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeFamilyMember(index)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 mt-6"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        onClick={addFamilyMember}
                        className="w-full border-dashed border-2"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        {language === 'he' ? 'הוסף בן משפחה' : 'Add Family Member'}
                      </Button>
                    </div>
                  )}

                  {/* Step 2: Fitness & Accessibility */}
                  {step === 2 && (
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label>{language === 'he' ? 'רמת כושר פיזי' : 'Fitness Level'}</Label>
                        <Select
                          value={formData.fitness_level}
                          onValueChange={(v) => handleChange('fitness_level', v)}
                        >
                          <SelectTrigger className="h-12">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">
                              {language === 'he' ? 'נמוכה - טיולים קלים בלבד' : 'Low - Easy trips only'}
                            </SelectItem>
                            <SelectItem value="moderate">
                              {language === 'he' ? 'בינונית - טיולים קלים עד בינוניים' : 'Moderate - Easy to moderate trips'}
                            </SelectItem>
                            <SelectItem value="high">
                              {language === 'he' ? 'גבוהה - טיולים מאתגרים' : 'High - Challenging trips'}
                            </SelectItem>
                            <SelectItem value="very_high">
                              {language === 'he' ? 'גבוהה מאוד - טיולים קשים' : 'Very High - Hard trips'}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-4 p-4 bg-blue-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <Accessibility className="w-5 h-5 text-blue-600" />
                          <Label className="font-semibold text-blue-900">
                            {language === 'he' ? 'נגישות' : 'Accessibility'}
                          </Label>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Checkbox
                            id="disability"
                            checked={formData.has_physical_disability}
                            onCheckedChange={(checked) => handleChange('has_physical_disability', checked)}
                            className="data-[state=checked]:bg-blue-600"
                          />
                          <Label htmlFor="disability" className="cursor-pointer">
                            {language === 'he' ? 'יש מוגבלות פיזית' : 'Has physical disability'}
                          </Label>
                        </div>

                        {formData.has_physical_disability && (
                          <Textarea
                            value={formData.disability_description}
                            onChange={(e) => handleChange('disability_description', e.target.value)}
                            placeholder={language === 'he' ? 'תאר את המוגבלות...' : 'Describe the disability...'}
                            rows={3}
                          />
                        )}

                        <div className="flex items-center gap-3">
                          <Checkbox
                            id="accessibility"
                            checked={formData.needs_accessibility}
                            onCheckedChange={(checked) => handleChange('needs_accessibility', checked)}
                            className="data-[state=checked]:bg-blue-600"
                          />
                          <Label htmlFor="accessibility" className="cursor-pointer">
                            {language === 'he' ? 'צורך בנגישות מיוחדת' : 'Needs special accessibility'}
                          </Label>
                        </div>

                        {formData.needs_accessibility && (
                          <Textarea
                            value={formData.accessibility_requirements}
                            onChange={(e) => handleChange('accessibility_requirements', e.target.value)}
                            placeholder={language === 'he' ? 'תאר את דרישות הנגישות...' : 'Describe accessibility requirements...'}
                            rows={3}
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Step 3: Interests */}
                  {step === 3 && (
                    <div className="space-y-4">
                      <Label className="text-base font-semibold">
                        {language === 'he' ? 'מה מעניין אותך?' : 'What interests you?'}
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {interests.map(interest => (
                          <Badge
                            key={interest}
                            variant={formData.trip_interests.includes(interest) ? 'default' : 'outline'}
                            className={`cursor-pointer transition-all py-2 px-4 text-sm ${
                              formData.trip_interests.includes(interest)
                                ? 'bg-rose-600 hover:bg-rose-700'
                                : 'hover:border-rose-500 hover:text-rose-600'
                            }`}
                            onClick={() => toggleInterest(interest)}
                          >
                            {t(interest)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 4: Location & Vehicle */}
                  {step === 4 && (
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-purple-600" />
                          {language === 'he' ? 'מדינה' : 'Country'}
                        </Label>
                        <Select
                          value={formData.home_country}
                          onValueChange={(v) => {
                            handleChange('home_country', v);
                            handleChange('home_region', '');
                          }}
                        >
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder={language === 'he' ? 'בחר מדינה' : 'Select country'} />
                          </SelectTrigger>
                          <SelectContent>
                            {getAllCountries().map(country => (
                              <SelectItem key={country} value={country}>{t(country)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label>{language === 'he' ? 'אזור מגורים' : 'Home Region'}</Label>
                        <Select
                          value={formData.home_region}
                          onValueChange={(v) => handleChange('home_region', v)}
                        >
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder={language === 'he' ? 'בחר אזור' : 'Select region'} />
                          </SelectTrigger>
                          <SelectContent>
                            {getRegionsForCountry(formData.home_country).map(r => (
                              <SelectItem key={r} value={r}>{r}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="p-4 bg-purple-50 rounded-xl space-y-4">
                        <div className="flex items-center gap-3">
                          <Car className="w-5 h-5 text-purple-600" />
                          <Label className="font-semibold text-purple-900">
                            {language === 'he' ? 'רכב' : 'Vehicle'}
                          </Label>
                        </div>
                        
                        <div className="space-y-3">
                          <div 
                            onClick={() => {
                              handleChange('vehicle_type', 'none');
                              handleChange('has_4x4_vehicle', false);
                            }}
                            className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                              formData.vehicle_type === 'none' 
                                ? 'border-purple-600 bg-purple-100' 
                                : 'border-gray-200 hover:border-purple-300'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-4 h-4 rounded-full border-2 ${
                                formData.vehicle_type === 'none' 
                                  ? 'border-purple-600 bg-purple-600' 
                                  : 'border-gray-300'
                              }`}>
                                {formData.vehicle_type === 'none' && (
                                  <div className="w-2 h-2 bg-white rounded-full m-auto mt-0.5" />
                                )}
                              </div>
                              <span className="font-medium">
                                {language === 'he' ? 'אין לי רכב' : 'No vehicle'}
                              </span>
                            </div>
                          </div>

                          <div 
                            onClick={() => {
                              handleChange('vehicle_type', 'regular');
                              handleChange('has_4x4_vehicle', false);
                            }}
                            className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                              formData.vehicle_type === 'regular' 
                                ? 'border-purple-600 bg-purple-100' 
                                : 'border-gray-200 hover:border-purple-300'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-4 h-4 rounded-full border-2 ${
                                formData.vehicle_type === 'regular' 
                                  ? 'border-purple-600 bg-purple-600' 
                                  : 'border-gray-300'
                              }`}>
                                {formData.vehicle_type === 'regular' && (
                                  <div className="w-2 h-2 bg-white rounded-full m-auto mt-0.5" />
                                )}
                              </div>
                              <span className="font-medium">
                                {language === 'he' ? 'רכב רגיל' : 'Regular vehicle'}
                              </span>
                            </div>
                          </div>

                          <div 
                            onClick={() => {
                              handleChange('vehicle_type', '4x4');
                              handleChange('has_4x4_vehicle', true);
                            }}
                            className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                              formData.vehicle_type === '4x4' 
                                ? 'border-purple-600 bg-purple-100' 
                                : 'border-gray-200 hover:border-purple-300'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-4 h-4 rounded-full border-2 ${
                                formData.vehicle_type === '4x4' 
                                  ? 'border-purple-600 bg-purple-600' 
                                  : 'border-gray-300'
                              }`}>
                                {formData.vehicle_type === '4x4' && (
                                  <div className="w-2 h-2 bg-white rounded-full m-auto mt-0.5" />
                                )}
                              </div>
                              <span className="font-medium">
                                {language === 'he' ? 'רכב שטח (4X4)' : '4X4 vehicle'}
                              </span>
                            </div>
                            {formData.vehicle_type === '4x4' && (
                              <p className="text-sm text-purple-700 mt-2 mr-6">
                                {language === 'he' 
                                  ? '🎉 מעולה! נציג לך גם טיולים שדורשים רכב שטח'
                                  : '🎉 Great! We\'ll show you trips that require 4X4 vehicles'}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex gap-4 justify-between mt-6">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 0}
              className="flex items-center gap-2"
            >
              {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              {language === 'he' ? 'הקודם' : 'Previous'}
            </Button>

            {step < totalSteps - 1 ? (
              <Button
                onClick={handleNext}
                className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2"
              >
                {language === 'he' ? 'הבא' : 'Next'}
                {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 min-w-[140px]"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    {language === 'he' ? 'סיום' : 'Finish'}
                  </>
                )}
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}