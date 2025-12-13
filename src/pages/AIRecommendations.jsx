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

export default function AIRecommendations() {
  const { t, language, isRTL } = useLanguage();
  const [preferences, setPreferences] = useState({
    country: 'israel',
    region: '',
    difficulty: '',
    duration: '',
    interests: [],
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
      
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert travel planner. Based on these detailed preferences, suggest 3 highly personalized outdoor trips ${regionText} in ${countryName}:

**User Preferences:**
- Region: ${preferences.region ? t(preferences.region) : 'any region in ' + countryName}
- Difficulty: ${difficultyText || 'any difficulty level'}
- Duration: ${durationText || 'any duration'}
- Interests: ${preferences.interests.length > 0 ? preferences.interests.map(i => t(i)).join(', ') : 'general outdoor activities'}

**Requirements for each suggestion:**
1. Specific location name with exact coordinates if possible
2. Detailed explanation of why this trip perfectly matches ALL the user's preferences (difficulty, duration, interests)
3. Best season/months to visit and why
4. Comprehensive description including: trail conditions, scenery, key highlights, what makes it unique
5. Practical tips: equipment needed, fitness level required, best starting time, parking, permits, safety considerations
6. Approximate duration in hours or days

Make suggestions specific, actionable, and perfectly tailored to the user's criteria. Use local knowledge and real place names.

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
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl mb-4 shadow-lg shadow-purple-500/30">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              {t('aiRecommendations')}
            </h1>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              {language === 'he' 
                ? 'תן לנו לעזור לך למצוא את הטיול המושלם לפי ההעדפות שלך'
                : 'Let us help you find the perfect trip based on your preferences'}
            </p>
          </div>

          {/* Preferences Card */}
          <Card className="mb-8 border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600" />
                {language === 'he' ? 'העדפות' : 'Preferences'}
              </CardTitle>
              <CardDescription>
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
                    )}

              {userLocation && (
                <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 p-3 rounded-lg">
                  <MapPin className="w-4 h-4" />
                  {language === 'he' 
                    ? 'המיקום שלך זוהה - ההמלצות יתחשבו בכך'
                    : 'Your location detected - recommendations will consider this'}
                </div>
              )}

              <Button 
                onClick={getRecommendations}
                disabled={loading}
                className="w-full h-14 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-lg"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <Sparkles className="w-5 h-5 mr-2" />
                )}
                {t('getRecommendations')}
              </Button>
            </CardContent>
          </Card>

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
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <Compass className="w-6 h-6 text-emerald-600" />
                      {t('recommendedTrips')}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {recommendations.map(trip => (
                        <TripCard key={trip.id} trip={trip} />
                      ))}
                    </div>
                  </div>
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
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <Lightbulb className="w-6 h-6 text-amber-500" />
                      {language === 'he' ? 'הצעות מותאמות אישית' : 'Personalized Suggestions'}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {aiSuggestions.map((suggestion, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card className="h-full hover:shadow-lg transition-shadow border-0 bg-gradient-to-br from-white to-gray-50">
                            <CardHeader>
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold shadow-lg shadow-amber-500/30">
                                  {index + 1}
                                </div>
                                <div>
                                  <CardTitle className="text-lg">{suggestion.location}</CardTitle>
                                  <Badge variant="outline" className="mt-1">
                                    {suggestion.best_time}
                                  </Badge>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div>
                                <p className="text-sm text-gray-500 mb-1">
                                  {language === 'he' ? 'למה מתאים לך' : 'Why it suits you'}
                                </p>
                                <p className="text-gray-700">{suggestion.reason}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500 mb-1">
                                  {language === 'he' ? 'מה לצפות' : 'What to expect'}
                                </p>
                                <p className="text-gray-700">{suggestion.description}</p>
                              </div>
                              {suggestion.tips && (
                                <div className="bg-amber-50 p-3 rounded-lg">
                                  <p className="text-sm text-amber-800">
                                    💡 {suggestion.tips}
                                  </p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}