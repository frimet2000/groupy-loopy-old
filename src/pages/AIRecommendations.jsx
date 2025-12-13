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
  const [user, setUser] = useState(null);
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
  const [personalizedSuggestions, setPersonalizedSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  const { data: allTrips = [] } = useQuery({
    queryKey: ['trips'],
    queryFn: () => base44.entities.Trip.list('-created_date'),
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        
        // Auto-fill preferences from user profile
        if (userData) {
          setPreferences(prev => ({
            ...prev,
            region: userData.preferred_regions?.[0] || prev.region,
            interests: userData.preferred_interests || prev.interests,
            difficulty: userData.fitness_level === 'low' ? 'easy' :
                       userData.fitness_level === 'moderate' ? 'moderate' :
                       userData.fitness_level === 'high' ? 'challenging' :
                       userData.fitness_level === 'very_high' ? 'hard' : prev.difficulty,
          }));
        }
      } catch (e) {
        console.log('Not logged in');
      }
    };
    fetchUser();
  }, []);

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
    
    // Get user's past trips
    const userTrips = user ? allTrips.filter(trip => 
      trip.participants?.some(p => p.email === user.email) || 
      trip.organizer_email === user.email
    ) : [];

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

    // Score trips based on user profile similarity
    if (user) {
      filteredTrips = filteredTrips.map(trip => {
        let score = 0;
        
        // Match preferred regions
        if (user.preferred_regions?.includes(trip.region)) score += 3;
        
        // Match preferred interests
        const matchingInterests = trip.interests?.filter(i => 
          user.preferred_interests?.includes(i)
        ).length || 0;
        score += matchingInterests * 2;
        
        // Match fitness level
        if (user.fitness_level === 'low' && trip.difficulty === 'easy') score += 2;
        if (user.fitness_level === 'moderate' && ['easy', 'moderate'].includes(trip.difficulty)) score += 2;
        if (user.fitness_level === 'high' && ['moderate', 'challenging'].includes(trip.difficulty)) score += 2;
        if (user.fitness_level === 'very_high' && ['challenging', 'hard'].includes(trip.difficulty)) score += 2;
        
        // Match family composition
        if (user.children_age_ranges?.length > 0 && trip.interests?.includes('family_friendly')) score += 3;
        if (user.travels_with_dog && trip.pets_allowed) score += 3;
        
        return { ...trip, _score: score };
      }).sort((a, b) => b._score - a._score);
    }

    setRecommendations(filteredTrips.slice(0, 6));

    // Generate personalized AI recommendations based on user profile AND current filters
    if (user) {
      try {
        const countryName = t(preferences.country || 'israel');
        const regionText = preferences.region ? `in the ${t(preferences.region)} region` : 'in any region';
        
        const userProfileText = `
**User Profile:**
- Name: ${user.first_name} ${user.last_name}
- Home Region: ${user.home_region ? t(user.home_region) : 'Not specified'}
- Fitness Level: ${user.fitness_level || 'moderate'}
- Vehicle: ${user.vehicle_type === 'none' ? 'No vehicle' : user.vehicle_type === 'regular' ? 'Regular car' : '4X4 vehicle'}
- Travels with dog: ${user.travels_with_dog ? 'Yes' : 'No'}
- Interests: ${user.interests?.map(i => t(i)).join(', ') || 'None specified'}
- Family: ${user.family_members?.length || 0} members

**Past Trip History (${userTrips.length} trips):**
${userTrips.slice(0, 5).map(trip => `- ${trip.title || trip.title_he || trip.title_en} (${trip.country || 'israel'}, ${t(trip.region || 'unknown')}, ${t(trip.difficulty)})`).join('\n') || 'No past trips'}

**CURRENT FILTER PREFERENCES (MUST FOLLOW):**
- Country: ${countryName} (MUST be in this country)
${preferences.region ? `- Region: ${t(preferences.region)} (MUST be in this region)` : ''}
${preferences.difficulty ? `- Difficulty: ${t(preferences.difficulty)} (MUST match)` : ''}
${preferences.duration ? `- Duration: ${t(preferences.duration)} (MUST match)` : ''}
${preferences.budget ? `- Budget: ${t(preferences.budget)} (MUST fit)` : ''}
${preferences.companions ? `- Companions: ${t(preferences.companions)} (MUST suit)` : ''}
${preferences.intensity ? `- Intensity: ${t(preferences.intensity)} (MUST match)` : ''}
${preferences.accommodation ? `- Accommodation: ${t(preferences.accommodation)} (MUST include)` : ''}
- Interests: ${preferences.interests.length > 0 ? preferences.interests.map(i => t(i)).join(', ') : 'user profile interests'}
        `.trim();

        const personalizedResult = await base44.integrations.Core.InvokeLLM({
          prompt: `You are an expert travel advisor. Create 3 trip recommendations for this user.

${userProfileText}

CRITICAL REQUIREMENTS:
1. ALL suggestions MUST be in ${countryName}${preferences.region ? `, specifically in ${t(preferences.region)} region` : ''}
2. MUST match the user's current filter preferences (difficulty, duration, budget, companions, intensity, accommodation)
3. MUST align with user's profile (fitness, interests, family, vehicle)
4. Build on their past experiences while offering something new
5. Each suggestion must explain how it matches BOTH the current filters AND the user's profile

Format each suggestion to clearly show how it satisfies all filters and user preferences.

Respond in ${language === 'he' ? 'Hebrew' : 'English'}.`,
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
        setPersonalizedSuggestions(personalizedResult.suggestions);
      } catch (error) {
        console.error('Personalized AI error:', error);
      }
    }

    // Get AI suggestions for new trips with ALL filters
    try {
      const countryName = t(preferences.country || 'israel');
      const regionText = preferences.region ? `specifically in the ${t(preferences.region)} region` : '';
      const durationText = preferences.duration ? `Duration: ${t(preferences.duration)}` : 'Duration: flexible';
      const difficultyText = preferences.difficulty ? `Difficulty: ${t(preferences.difficulty)}` : 'Difficulty: flexible';
      const budgetText = preferences.budget ? `Budget: ${t(preferences.budget)}` : 'Budget: flexible';
      const companionsText = preferences.companions ? `Traveling with: ${t(preferences.companions)}` : 'Traveling: flexible group';
      const intensityText = preferences.intensity ? `Activity intensity: ${t(preferences.intensity)}` : 'Intensity: flexible';
      const accommodationText = preferences.accommodation ? `Accommodation: ${t(preferences.accommodation)}` : 'Accommodation: flexible';
      
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert travel planner specializing in ${countryName}. Create 3 HIGHLY SPECIFIC trip suggestions ${regionText} in ${countryName}.

**MANDATORY REQUIREMENTS - Must follow ALL of these:**
- Country: ${countryName} (MUST be in this country ONLY)
${preferences.region ? `- Region: ${t(preferences.region)} (MUST be in this specific region)` : `- Region: Any region in ${countryName}`}
- ${difficultyText} (MUST match this level exactly)
- ${durationText} (MUST match this duration)
- ${budgetText} (costs MUST fit this budget range)
- ${companionsText} (MUST be suitable for this group type)
- ${intensityText} (activity pace MUST match this intensity)
- ${accommodationText} (MUST include this accommodation type)
- Interests: ${preferences.interests.length > 0 ? preferences.interests.map(i => t(i)).join(', ') : 'general outdoor activities'} (MUST incorporate these interests)

**For each suggestion provide:**
1. Exact location name in ${countryName}${regionText ? ` - ${t(preferences.region)} region` : ''}
2. Why it PERFECTLY matches EVERY single preference above (difficulty, duration, budget, companions, intensity, accommodation, interests)
3. Best season and timing
4. Rich description with trail/activity details
5. Practical tips for this specific trip

CRITICAL: All suggestions MUST be in ${countryName}${preferences.region ? ` in the ${t(preferences.region)} region` : ''}, matching ALL filters provided.

Respond in ${language === 'he' ? 'Hebrew' : 'English'}.`,
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
                : language === 'ru'
                ? 'Позвольте нам помочь вам найти идеальную поездку на основе ваших предпочтений'
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
                    {language === 'he' ? 'העדפות' : language === 'ru' ? 'Предпочтения' : 'Preferences'}
                  </span>
                </CardTitle>
                <CardDescription className="text-base">
                  {language === 'he' 
                    ? 'בחר את ההעדפות שלך לקבלת המלצות מותאמות אישית'
                    : language === 'ru'
                    ? 'Выберите ваши предпочтения для получения персональных рекомендаций'
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
                  <Label>{language === 'he' ? 'תקציב' : language === 'ru' ? 'Бюджет' : 'Budget'}</Label>
                  <Select 
                    value={preferences.budget} 
                    onValueChange={(v) => handlePreferenceChange('budget', v)}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder={language === 'he' ? 'כל תקציב' : language === 'ru' ? 'Любой бюджет' : 'Any budget'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>{language === 'he' ? 'כל תקציב' : language === 'ru' ? 'Любой бюджет' : 'Any budget'}</SelectItem>
                      {budgetRanges.map(b => (
                        <SelectItem key={b} value={b}>{t(b)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{language === 'he' ? 'מלווים' : language === 'ru' ? 'Попутчики' : 'Travel Companions'}</Label>
                  <Select 
                    value={preferences.companions} 
                    onValueChange={(v) => handlePreferenceChange('companions', v)}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder={language === 'he' ? 'כל סוג קבוצה' : language === 'ru' ? 'Любая группа' : 'Any group'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>{language === 'he' ? 'כל סוג קבוצה' : language === 'ru' ? 'Любая группа' : 'Any group'}</SelectItem>
                      {travelCompanions.map(c => (
                        <SelectItem key={c} value={c}>{t(c)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{language === 'he' ? 'עצמת פעילות' : language === 'ru' ? 'Интенсивность' : 'Activity Intensity'}</Label>
                  <Select 
                    value={preferences.intensity} 
                    onValueChange={(v) => handlePreferenceChange('intensity', v)}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder={language === 'he' ? 'כל עצמה' : language === 'ru' ? 'Любая интенсивность' : 'Any intensity'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>{language === 'he' ? 'כל עצמה' : language === 'ru' ? 'Любая интенсивность' : 'Any intensity'}</SelectItem>
                      {activityIntensity.map(i => (
                        <SelectItem key={i} value={i}>{t(i)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{language === 'he' ? 'סוג לינה' : language === 'ru' ? 'Жилье' : 'Accommodation'}</Label>
                  <Select 
                    value={preferences.accommodation} 
                    onValueChange={(v) => handlePreferenceChange('accommodation', v)}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder={language === 'he' ? 'כל סוג לינה' : language === 'ru' ? 'Любое жилье' : 'Any accommodation'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>{language === 'he' ? 'כל סוג לינה' : language === 'ru' ? 'Любое жилье' : 'Any accommodation'}</SelectItem>
                      {accommodationTypes.map(a => (
                        <SelectItem key={a} value={a}>{t(a)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {user && (
                <div className="flex items-start gap-3 text-sm bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                  <Sparkles className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-purple-900 mb-1">
                      {language === 'he' ? 'הפרופיל שלך נטען' : language === 'ru' ? 'Ваш профиль загружен' : 'Your profile loaded'}
                    </p>
                    <p className="text-purple-700">
                      {language === 'he' 
                        ? 'ההמלצות יתאימו לרמת הכושר, העדפות והיסטוריית הטיולים שלך'
                        : language === 'ru'
                        ? 'Рекомендации будут соответствовать вашему уровню подготовки, предпочтениям и истории поездок'
                        : 'Recommendations will match your fitness level, preferences, and trip history'}
                    </p>
                  </div>
                </div>
              )}

              {userLocation && (
                <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 p-3 rounded-lg">
                  <MapPin className="w-4 h-4" />
                  {language === 'he' 
                    ? 'המיקום שלך זוהה - ההמלצות יתחשבו בכך'
                    : language === 'ru'
                    ? 'Ваше местоположение определено - рекомендации учтут это'
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
                      <span>{language === 'he' ? 'מחפש המלצות מושלמות...' : language === 'ru' ? 'Поиск идеальных рекомендаций...' : 'Finding perfect recommendations...'}</span>
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
            {(recommendations || aiSuggestions || personalizedSuggestions) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Personalized AI Recommendations (Based on Profile) */}
                {personalizedSuggestions && personalizedSuggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="flex items-center gap-3 mb-8 bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500 text-white px-6 py-4 rounded-2xl shadow-2xl">
                      <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">
                          {language === 'he' ? 'מומלץ במיוחד בשבילך' : language === 'ru' ? 'Специально рекомендуем для вас' : 'Specially Recommended for You'}
                        </h2>
                        <p className="text-sm text-white/90">
                          {language === 'he' 
                            ? 'מבוסס על הפרופיל וההיסטוריה שלך' 
                            : language === 'ru'
                            ? 'На основе вашего профиля и истории'
                            : 'Based on your profile and history'}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {personalizedSuggestions.map((suggestion, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.2 + index * 0.1 }}
                          whileHover={{ scale: 1.03, y: -5 }}
                        >
                          <Card className="h-full border-2 border-purple-200 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 backdrop-blur-sm">
                            <CardHeader>
                              <div className="flex items-start gap-3">
                                <motion.div 
                                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 flex items-center justify-center text-white font-bold shadow-2xl shadow-purple-500/40"
                                  whileHover={{ rotate: 360 }}
                                  transition={{ duration: 0.6 }}
                                >
                                  <Sparkles className="w-6 h-6" />
                                </motion.div>
                                <div className="flex-1">
                                  <CardTitle className="text-lg bg-gradient-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent font-bold">
                                    {suggestion.location}
                                  </CardTitle>
                                  <Badge className="mt-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-200">
                                    {suggestion.best_time}
                                  </Badge>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-4 rounded-xl border border-pink-200">
                                <p className="text-xs font-semibold text-pink-700 mb-2 flex items-center gap-1">
                                  <Sparkles className="w-3 h-3" />
                                  {language === 'he' ? 'למה זה מושלם בשבילך' : language === 'ru' ? 'Почему это идеально для вас' : 'Why it\'s perfect for you'}
                                </p>
                                <p className="text-gray-700 leading-relaxed">{suggestion.reason}</p>
                              </div>
                              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-100">
                                <p className="text-xs font-semibold text-blue-700 mb-2 flex items-center gap-1">
                                  <Compass className="w-3 h-3" />
                                  {language === 'he' ? 'פרטים' : language === 'ru' ? 'Подробности' : 'Details'}
                                </p>
                                <p className="text-gray-700 leading-relaxed">{suggestion.description}</p>
                              </div>
                              {suggestion.tips && (
                                <motion.div 
                                  className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-xl border-2 border-purple-200"
                                  whileHover={{ scale: 1.02 }}
                                >
                                  <p className="text-sm text-purple-900 font-medium flex items-start gap-2">
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
                          : language === 'ru'
                          ? 'Но у нас есть несколько AI-рекомендаций для вас!'
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
                        {language === 'he' ? 'הצעות מותאמות אישית' : language === 'ru' ? 'Персональные предложения' : 'Personalized Suggestions'}
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
                                  {language === 'he' ? 'למה מתאים לך' : language === 'ru' ? 'Почему подходит вам' : 'Why it suits you'}
                                </p>
                                <p className="text-gray-700 leading-relaxed">{suggestion.reason}</p>
                              </div>
                              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-100">
                                <p className="text-xs font-semibold text-blue-700 mb-2 flex items-center gap-1">
                                  <Compass className="w-3 h-3" />
                                  {language === 'he' ? 'מה לצפות' : language === 'ru' ? 'Чего ожидать' : 'What to expect'}
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