import React, { useState, useEffect } from 'react';
import { useLanguage } from '../components/LanguageContext';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import TripCard from '../components/trips/TripCard';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, MapPin, Compass, Loader2, RefreshCw, Lightbulb, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllCountries, getCountryRegions } from '../components/utils/CountryRegions';
const difficulties = ['easy', 'moderate', 'challenging', 'hard', 'extreme'];
const durations = ['hours', 'half_day', 'full_day', 'overnight', 'multi_day'];
const interests = ['nature', 'history', 'photography', 'birdwatching', 'archaeology', 'geology', 'botany', 'extreme_sports', 'family_friendly', 'romantic'];
const budgetRanges = ['budget', 'moderate', 'comfortable', 'luxury'];
const travelCompanions = ['solo', 'couple', 'family_young_kids', 'family_teens', 'friends', 'group'];
const activityIntensity = ['relaxed', 'moderate', 'active', 'very_active'];
const accommodationTypes = ['camping', 'hostel', 'hotel', 'boutique', 'resort', 'vacation_rental'];

export default function AIRecommendations() {
  const { t, language, isRTL } = useLanguage();
  const [preferences, setPreferences] = useState({
    country: 'israel',
    region: '',
    difficulty: '',
    duration: '',
    interests: [],
    budget: '',
    companions: '',
    intensity: '',
    accommodation: '',
  });
  
  const countries = getAllCountries();
  const regions = preferences.country ? getCountryRegions(preferences.country) : [];
  const [recommendations, setRecommendations] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  const { data: allTrips = [] } = useQuery({
    queryKey: ['trips'],
    queryFn: () => base44.entities.Trip.list('-created_date'),
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => console.log('Location error:', error)
      );
    }
  }, []);

  const handlePreferenceChange = (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const toggleInterest = (interest) => {
    setPreferences(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const getRecommendations = async () => {
    setLoading(true);
    
    // Filter existing trips
    let filteredTrips = allTrips.filter(trip => trip.status === 'open');
    
    const tripCountry = (trip) => trip.country || 'israel';
    if (preferences.country) {
      filteredTrips = filteredTrips.filter(trip => tripCountry(trip) === preferences.country);
    }
    if (preferences.region) {
      filteredTrips = filteredTrips.filter(trip => trip.region === preferences.region);
    }
    if (preferences.difficulty) {
      filteredTrips = filteredTrips.filter(trip => trip.difficulty === preferences.difficulty);
    }
    if (preferences.duration) {
      filteredTrips = filteredTrips.filter(trip => trip.duration_type === preferences.duration);
    }
    if (preferences.interests.length > 0) {
      filteredTrips = filteredTrips.filter(trip => 
        trip.interests?.some(i => preferences.interests.includes(i))
      );
    }

    setRecommendations(filteredTrips.slice(0, 6));

    // Get AI suggestions for new trips
    try {
      const countryName = t(preferences.country);
      const regionText = preferences.region ? `in the ${t(preferences.region)} region` : '';
      
      const durationText = preferences.duration ? t(preferences.duration) : '';
      const difficultyText = preferences.difficulty ? t(preferences.difficulty) : '';
      const budgetText = preferences.budget ? t(preferences.budget) : '';
      const companionsText = preferences.companions ? t(preferences.companions) : '';
      const intensityText = preferences.intensity ? t(preferences.intensity) : '';
      const accommodationText = preferences.accommodation ? t(preferences.accommodation) : '';
      
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert travel planner. Based on these detailed preferences, suggest 3 highly personalized outdoor trips ${regionText} in ${countryName}:

**User Preferences:**
- Region: ${preferences.region ? t(preferences.region) : 'any region in ' + countryName}
- Difficulty: ${difficultyText || 'any difficulty level'}
- Duration: ${durationText || 'any duration'}
- Budget: ${budgetText || 'any budget'}
- Travel Companions: ${companionsText || 'any group type'}
- Activity Intensity: ${intensityText || 'any intensity'}
- Accommodation: ${accommodationText || 'any accommodation type'}
- Interests: ${preferences.interests.length > 0 ? preferences.interests.map(i => t(i)).join(', ') : 'general outdoor activities'}

**Requirements for each detailed itinerary:**
1. Specific location name with exact coordinates if possible
2. Detailed explanation of why this trip perfectly matches ALL preferences (difficulty, duration, budget, companions, intensity, interests)
3. Best season/months to visit and why
4. Comprehensive description: trail conditions, scenery, key highlights, unique features
5. Budget breakdown: estimated costs for activities, meals, accommodation (based on budget preference)
6. Accommodation recommendations: specific places matching the preferred type and budget
7. Companion-specific considerations: family-friendly facilities, romantic spots, solo traveler safety, group logistics
8. Daily itinerary outline: timing, activities, rest periods matching the intensity level
9. Practical tips: equipment needed, fitness level, best starting time, parking, permits, safety
10. Approximate total cost per person

Make suggestions specific, actionable, and perfectly tailored to ALL criteria including budget, companions, and intensity preferences.

Please respond in ${language === 'he' ? 'Hebrew' : 'English'}.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  location: { type: "string" },
                  reason: { type: "string" },
                  best_time: { type: "string" },
                  description: { type: "string" },
                  tips: { type: "string" }
                }
              }
            }
          }
        }
      });
      setAiSuggestions(result.suggestions);
    } catch (error) {
      console.error('AI suggestions error:', error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 via-indigo-500 to-purple-600 rounded-3xl mb-6 shadow-2xl shadow-purple-500/40 relative"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-3xl bg-gradient-to-r from-pink-400/30 to-purple-400/30 blur-xl"
              />
              <Sparkles className="w-10 h-10 text-white relative z-10" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl font-bold mb-4"
            >
              <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 bg-clip-text text-transparent">
                {t('aiRecommendations')}
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-600 text-lg max-w-2xl mx-auto"
            >
              {language === 'he' 
                ? 'תן לנו לעזור לך למצוא את הטיול המושלם לפי ההעדפות שלך'
                : 'Let us help you find the perfect trip based on your preferences'}
            </motion.p>
          </div>

          {/* Preferences Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="mb-8 border-2 border-purple-100 shadow-2xl bg-white/90 backdrop-blur-sm hover:shadow-3xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-purple-50 via-indigo-50 to-pink-50 border-b border-purple-100">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent font-bold">
                    {language === 'he' ? 'העדפות' : 'Preferences'}
                  </span>
                </CardTitle>
                <CardDescription className="text-base">
                  {language === 'he' 
                    ? 'בחר את ההעדפות שלך לקבלת המלצות מותאמות אישית'
                    : 'Select your preferences to get personalized recommendations'}
                </CardDescription>
              </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>{t('country')}</Label>
                <div className="flex flex-wrap gap-2">
                  {countries.map(country => (
                    <Badge
                      key={country}
                      variant={preferences.country === country ? 'default' : 'outline'}
                      className={`cursor-pointer transition-all py-2 px-3 ${
                        preferences.country === country
                          ? 'bg-emerald-600 hover:bg-emerald-700'
                          : 'hover:border-emerald-500 hover:text-emerald-600'
                      }`}
                      onClick={() => {
                        setPreferences({ ...preferences, country, region: '' });
                        setRecommendations(null);
                        setAiSuggestions(null);
                      }}
                    >
                      {t(country)}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {regions.length > 0 && (
                  <div className="space-y-2">
                    <Label>{t('region')}</Label>
                    <Select 
                      value={preferences.region} 
                      onValueChange={(v) => handlePreferenceChange('region', v)}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder={t('allRegions')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={null}>{t('allRegions')}</SelectItem>
                        {regions.map(r => (
                          <SelectItem key={r} value={r}>{t(r)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>{t('difficulty')}</Label>
                  <Select 
                    value={preferences.difficulty} 
                    onValueChange={(v) => handlePreferenceChange('difficulty', v)}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder={t('allDifficulties')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>{t('allDifficulties')}</SelectItem>
                      {difficulties.map(d => (
                        <SelectItem key={d} value={d}>{t(d)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t('duration')}</Label>
                  <Select 
                    value={preferences.duration} 
                    onValueChange={(v) => handlePreferenceChange('duration', v)}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder={t('allDurations')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>{t('allDurations')}</SelectItem>
                      {durations.map(d => (
                        <SelectItem key={d} value={d}>{t(d)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label>{t('interests')}</Label>
                <div className="flex flex-wrap gap-2">
                  {interests.map(interest => (
                    <Badge
                      key={interest}
                      variant={preferences.interests.includes(interest) ? 'default' : 'outline'}
                      className={`cursor-pointer transition-all py-2 px-3 ${
                        preferences.interests.includes(interest) 
                          ? 'bg-indigo-600 hover:bg-indigo-700' 
                          : 'hover:border-indigo-500 hover:text-indigo-600'
                      }`}
                      onClick={() => toggleInterest(interest)}
                    >
                      {t(interest)}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{language === 'he' ? 'תקציב' : 'Budget'}</Label>
                  <Select 
                    value={preferences.budget} 
                    onValueChange={(v) => handlePreferenceChange('budget', v)}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder={language === 'he' ? 'כל תקציב' : 'Any budget'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>{language === 'he' ? 'כל תקציב' : 'Any budget'}</SelectItem>
                      {budgetRanges.map(b => (
                        <SelectItem key={b} value={b}>{t(b)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{language === 'he' ? 'מלווים' : 'Travel Companions'}</Label>
                  <Select 
                    value={preferences.companions} 
                    onValueChange={(v) => handlePreferenceChange('companions', v)}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder={language === 'he' ? 'כל סוג קבוצה' : 'Any group'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>{language === 'he' ? 'כל סוג קבוצה' : 'Any group'}</SelectItem>
                      {travelCompanions.map(c => (
                        <SelectItem key={c} value={c}>{t(c)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{language === 'he' ? 'עצמת פעילות' : 'Activity Intensity'}</Label>
                  <Select 
                    value={preferences.intensity} 
                    onValueChange={(v) => handlePreferenceChange('intensity', v)}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder={language === 'he' ? 'כל עצמה' : 'Any intensity'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>{language === 'he' ? 'כל עצמה' : 'Any intensity'}</SelectItem>
                      {activityIntensity.map(i => (
                        <SelectItem key={i} value={i}>{t(i)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{language === 'he' ? 'סוג לינה' : 'Accommodation'}</Label>
                  <Select 
                    value={preferences.accommodation} 
                    onValueChange={(v) => handlePreferenceChange('accommodation', v)}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder={language === 'he' ? 'כל סוג לינה' : 'Any accommodation'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>{language === 'he' ? 'כל סוג לינה' : 'Any accommodation'}</SelectItem>
                      {accommodationTypes.map(a => (
                        <SelectItem key={a} value={a}>{t(a)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {userLocation && (
                <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 p-3 rounded-lg">
                  <MapPin className="w-4 h-4" />
                  {language === 'he' 
                    ? 'המיקום שלך זוהה - ההמלצות יתחשבו בכך'
                    : 'Your location detected - recommendations will consider this'}
                </div>
              )}

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  onClick={getRecommendations}
                  disabled={loading}
                  className="w-full h-16 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-lg font-bold shadow-2xl hover:shadow-3xl transition-all duration-300"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin mr-3" />
                      <span>{language === 'he' ? 'מחפש המלצות מושלמות...' : 'Finding perfect recommendations...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-6 h-6 mr-3" />
                      <span>{t('getRecommendations')}</span>
                    </>
                  )}
                </Button>
              </motion.div>
            </CardContent>
            </Card>
          </motion.div>

          {/* Results */}
          <AnimatePresence>
            {(recommendations || aiSuggestions) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Existing Trips */}
                {recommendations && recommendations.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex items-center gap-3 mb-8 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-4 rounded-2xl shadow-2xl">
                      <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                        <Compass className="w-6 h-6" />
                      </div>
                      <h2 className="text-2xl font-bold">{t('recommendedTrips')}</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {recommendations.map((trip, index) => (
                        <motion.div
                          key={trip.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <TripCard trip={trip} />
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {recommendations && recommendations.length === 0 && (
                  <Card className="text-center py-12">
                    <CardContent>
                      <Compass className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {t('noTripsFound')}
                      </h3>
                      <p className="text-gray-500">
                        {language === 'he' 
                          ? 'אבל יש לנו כמה המלצות AI עבורך!'
                          : 'But we have some AI suggestions for you!'}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* AI Suggestions */}
                {aiSuggestions && aiSuggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="flex items-center gap-3 mb-8 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-4 rounded-2xl shadow-2xl">
                      <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                        <Lightbulb className="w-6 h-6" />
                      </div>
                      <h2 className="text-2xl font-bold">
                        {language === 'he' ? 'הצעות מותאמות אישית' : 'Personalized Suggestions'}
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {aiSuggestions.map((suggestion, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.5 + index * 0.1 }}
                          whileHover={{ scale: 1.03, y: -5 }}
                        >
                          <Card className="h-full border-2 border-amber-100 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white via-amber-50/30 to-orange-50/30 backdrop-blur-sm">
                            <CardHeader>
                              <div className="flex items-start gap-3">
                                <motion.div 
                                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 via-orange-400 to-orange-500 flex items-center justify-center text-white font-bold shadow-2xl shadow-amber-500/40"
                                  whileHover={{ rotate: 360 }}
                                  transition={{ duration: 0.6 }}
                                >
                                  {index + 1}
                                </motion.div>
                                <div className="flex-1">
                                  <CardTitle className="text-lg bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent font-bold">
                                    {suggestion.location}
                                  </CardTitle>
                                  <Badge className="mt-2 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border-amber-200">
                                    {suggestion.best_time}
                                  </Badge>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
                                <p className="text-xs font-semibold text-purple-700 mb-2 flex items-center gap-1">
                                  <Sparkles className="w-3 h-3" />
                                  {language === 'he' ? 'למה מתאים לך' : 'Why it suits you'}
                                </p>
                                <p className="text-gray-700 leading-relaxed">{suggestion.reason}</p>
                              </div>
                              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-100">
                                <p className="text-xs font-semibold text-blue-700 mb-2 flex items-center gap-1">
                                  <Compass className="w-3 h-3" />
                                  {language === 'he' ? 'מה לצפות' : 'What to expect'}
                                </p>
                                <p className="text-gray-700 leading-relaxed">{suggestion.description}</p>
                              </div>
                              {suggestion.tips && (
                                <motion.div 
                                  className="bg-gradient-to-r from-amber-100 to-orange-100 p-4 rounded-xl border-2 border-amber-200"
                                  whileHover={{ scale: 1.02 }}
                                >
                                  <p className="text-sm text-amber-900 font-medium flex items-start gap-2">
                                    <span className="text-xl">💡</span>
                                    <span>{suggestion.tips}</span>
                                  </p>
                                </motion.div>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}