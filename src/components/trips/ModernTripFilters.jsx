// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../LanguageContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  Search, X, SlidersHorizontal, Globe2, MapPin, Calendar,
  Mountain, Bike, Truck, Filter, Sparkles, TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';

const activityIcons = {
  hiking: Mountain,
  cycling: Bike,
  offroad: Truck,
};

const difficultyColors = {
  easy: 'bg-green-100 text-green-700 border-green-200',
  moderate: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  challenging: 'bg-orange-100 text-orange-700 border-orange-200',
  hard: 'bg-red-100 text-red-700 border-red-200',
  extreme: 'bg-purple-100 text-purple-700 border-purple-200',
};

export default function ModernTripFilters({ trips, onFilteredTripsChange }) {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState([]);
  const [selectedContinent, setSelectedContinent] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [normalizedCountries, setNormalizedCountries] = useState({});
  const [isNormalizing, setIsNormalizing] = useState(false);

  // Extract and normalize countries using AI
  useEffect(() => {
    const normalizeCountries = async () => {
      if (isNormalizing || Object.keys(normalizedCountries).length > 0) return;
      
      setIsNormalizing(true);
      try {
        // Extract unique countries from trips
        const uniqueCountries = [...new Set(
          trips
            .map(t => t.country)
            .filter(Boolean)
            .map(c => c.toLowerCase())
        )];

        if (uniqueCountries.length === 0) {
          setIsNormalizing(false);
          return;
        }

        // Use AI to normalize country names and map to continents
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `You are a geography expert. Given this list of country names (which may be in different languages or formats), return a normalized mapping.
          
Countries: ${JSON.stringify(uniqueCountries)}

For each country:
1. Identify the standard English name
2. Identify the continent (europe, asia, africa, north_america, south_america, oceania)
3. Provide translations for: en, he, es, fr, de, it, ru

Return a JSON object where each key is the original country name (lowercase), and the value is an object with:
- standard_name (lowercase English)
- continent
- translations (object with en, he, es, fr, de, it, ru)

Example:
{
  "france": {
    "standard_name": "france",
    "continent": "europe",
    "translations": {
      "en": "France",
      "he": "צרפת",
      "es": "Francia",
      "fr": "France",
      "de": "Frankreich",
      "it": "Francia",
      "ru": "Франция"
    }
  }
}`,
          response_json_schema: {
            type: "object",
            additionalProperties: {
              type: "object",
              properties: {
                standard_name: { type: "string" },
                continent: { type: "string" },
                translations: {
                  type: "object",
                  properties: {
                    en: { type: "string" },
                    he: { type: "string" },
                    es: { type: "string" },
                    fr: { type: "string" },
                    de: { type: "string" },
                    it: { type: "string" },
                    ru: { type: "string" }
                  }
                }
              }
            }
          }
        });

        setNormalizedCountries(result);
      } catch (error) {
        console.error('Error normalizing countries:', error);
      }
      setIsNormalizing(false);
    };

    if (trips.length > 0) {
      normalizeCountries();
    }
  }, [trips]);

  // Get available countries from trips
  const availableCountries = useMemo(() => {
    const countries = new Set();
    trips.forEach(trip => {
      if (trip.country) {
        countries.add(trip.country.toLowerCase());
      } else if (trip.region && ['north', 'center', 'south', 'jerusalem', 'negev', 'eilat'].includes(trip.region)) {
        countries.add('israel');
      }
    });
    return Array.from(countries).sort((a, b) => {
      const aName = normalizedCountries[a]?.translations?.[language] || a;
      const bName = normalizedCountries[b]?.translations?.[language] || b;
      return aName.localeCompare(bName);
    });
  }, [trips, normalizedCountries, language]);

  // Get available continents
  const availableContinents = useMemo(() => {
    const continents = new Set();
    availableCountries.forEach(country => {
      const continent = normalizedCountries[country]?.continent;
      if (continent) continents.add(continent);
    });
    return Array.from(continents);
  }, [availableCountries, normalizedCountries]);

  // Filter trips
  useEffect(() => {
    let filtered = trips.filter(trip => {
      // Privacy filtering
      if (trip.privacy === 'private' || trip.privacy === 'invite_only') {
        return false;
      }

      // Only future open trips
      if (trip.status !== 'open') return false;
      const tripDate = new Date(trip.date);
      tripDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (tripDate < today) return false;

      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const title = trip.title || trip.title_he || trip.title_en || '';
        const desc = trip.description || trip.description_he || trip.description_en || '';
        const location = trip.location || '';
        
        if (!title.toLowerCase().includes(query) && 
            !desc.toLowerCase().includes(query) && 
            !location.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Country filter
      if (selectedCountries.length > 0) {
        let tripCountry = (trip.country || '').toLowerCase();
        if (!tripCountry && trip.region && ['north', 'center', 'south', 'jerusalem', 'negev', 'eilat'].includes(trip.region)) {
          tripCountry = 'israel';
        }
        if (!selectedCountries.includes(tripCountry)) return false;
      }

      // Continent filter
      if (selectedContinent !== 'all' && selectedCountries.length === 0) {
        let tripCountry = (trip.country || '').toLowerCase();
        if (!tripCountry && trip.region && ['north', 'center', 'south', 'jerusalem', 'negev', 'eilat'].includes(trip.region)) {
          tripCountry = 'israel';
        }
        const tripContinent = normalizedCountries[tripCountry]?.continent;
        if (tripContinent !== selectedContinent) return false;
      }

      // Activity type filter
      if (selectedActivities.length > 0 && !selectedActivities.includes(trip.activity_type)) {
        return false;
      }

      // Difficulty filter
      if (selectedDifficulties.length > 0 && !selectedDifficulties.includes(trip.difficulty)) {
        return false;
      }

      // Date range filter
      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        fromDate.setHours(0, 0, 0, 0);
        if (tripDate < fromDate) return false;
      }
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        if (tripDate > toDate) return false;
      }

      return true;
    });

    onFilteredTripsChange(filtered);
  }, [trips, searchQuery, selectedCountries, selectedActivities, selectedDifficulties, selectedContinent, dateFrom, dateTo, normalizedCountries]);

  const toggleCountry = (country) => {
    setSelectedCountries(prev => 
      prev.includes(country) ? prev.filter(c => c !== country) : [...prev, country]
    );
  };

  const toggleActivity = (activity) => {
    setSelectedActivities(prev =>
      prev.includes(activity) ? prev.filter(a => a !== activity) : [...prev, activity]
    );
  };

  const toggleDifficulty = (difficulty) => {
    setSelectedDifficulties(prev =>
      prev.includes(difficulty) ? prev.filter(d => d !== difficulty) : [...prev, difficulty]
    );
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCountries([]);
    setSelectedActivities([]);
    setSelectedDifficulties([]);
    setSelectedContinent('all');
    setDateFrom('');
    setDateTo('');
  };

  const activeFiltersCount = selectedCountries.length + selectedActivities.length + selectedDifficulties.length + 
    (selectedContinent !== 'all' ? 1 : 0) + (dateFrom ? 1 : 0) + (dateTo ? 1 : 0);

  const continentLabels = {
    en: { europe: 'Europe', asia: 'Asia', africa: 'Africa', north_america: 'North America', south_america: 'South America', oceania: 'Oceania' },
    he: { europe: 'אירופה', asia: 'אסיה', africa: 'אפריקה', north_america: 'צפון אמריקה', south_america: 'דרום אמריקה', oceania: 'אוקיאניה' },
    es: { europe: 'Europa', asia: 'Asia', africa: 'África', north_america: 'América del Norte', south_america: 'América del Sur', oceania: 'Oceanía' },
    fr: { europe: 'Europe', asia: 'Asie', africa: 'Afrique', north_america: 'Amérique du Nord', south_america: 'Amérique du Sud', oceania: 'Océanie' },
    de: { europe: 'Europa', asia: 'Asien', africa: 'Afrika', north_america: 'Nordamerika', south_america: 'Südamerika', oceania: 'Ozeanien' },
    it: { europe: 'Europa', asia: 'Asia', africa: 'Africa', north_america: 'Nord America', south_america: 'Sud America', oceania: 'Oceania' },
    ru: { europe: 'Европа', asia: 'Азия', africa: 'Африка', north_america: 'Северная Америка', south_america: 'Южная Америка', oceania: 'Океания' }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2 sm:gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder={language === 'he' ? 'חפש טיולים...' : language === 'ru' ? 'Поиск поездок...' : language === 'es' ? 'Buscar viajes...' : language === 'fr' ? 'Rechercher des voyages...' : language === 'de' ? 'Reisen suchen...' : language === 'it' ? 'Cerca viaggi...' : 'Search trips...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 text-base bg-white shadow-sm border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <Button 
          onClick={() => setShowFilters(!showFilters)}
          variant={showFilters ? "default" : "outline"}
          className={`h-12 px-4 sm:px-6 gap-2 rounded-xl shadow-sm border-2 ${showFilters ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-gray-200 hover:border-emerald-200'}`}
        >
          <SlidersHorizontal className="w-5 h-5" />
          <span className="hidden sm:inline font-semibold">
            {language === 'he' ? 'סינון' : language === 'ru' ? 'Фильтр' : language === 'es' ? 'Filtros' : language === 'fr' ? 'Filtres' : language === 'de' ? 'Filter' : language === 'it' ? 'Filtri' : 'Filters'}
          </span>
          {activeFiltersCount > 0 && (
            <Badge className="bg-white text-emerald-600 text-xs font-bold px-2 py-0.5 rounded-full">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Active Filters Pills */}
      <AnimatePresence>
        {(activeFiltersCount > 0 || searchQuery) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2"
          >
            {searchQuery && (
              <Badge className="pl-3 pr-2 py-2 gap-2 bg-emerald-50 text-emerald-700 border-2 border-emerald-200">
                <Search className="w-3 h-3" />
                "{searchQuery}"
                <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => setSearchQuery('')} />
              </Badge>
            )}
            
            {selectedCountries.map(country => (
              <Badge key={country} className="pl-3 pr-2 py-2 gap-2 bg-blue-50 text-blue-700 border-2 border-blue-200">
                <Globe2 className="w-3 h-3" />
                {normalizedCountries[country]?.translations?.[language] || country}
                <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => toggleCountry(country)} />
              </Badge>
            ))}

            {selectedContinent !== 'all' && (
              <Badge className="pl-3 pr-2 py-2 gap-2 bg-purple-50 text-purple-700 border-2 border-purple-200">
                <Globe2 className="w-3 h-3" />
                {continentLabels[language]?.[selectedContinent] || selectedContinent}
                <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => setSelectedContinent('all')} />
              </Badge>
            )}

            {selectedActivities.map(activity => {
              const Icon = activityIcons[activity] || Mountain;
              return (
                <Badge key={activity} className="pl-3 pr-2 py-2 gap-2 bg-teal-50 text-teal-700 border-2 border-teal-200">
                  <Icon className="w-3 h-3" />
                  {t(activity)}
                  <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => toggleActivity(activity)} />
                </Badge>
              );
            })}

            {selectedDifficulties.map(difficulty => (
              <Badge key={difficulty} className={`pl-3 pr-2 py-2 gap-2 border-2 ${difficultyColors[difficulty]}`}>
                <TrendingUp className="w-3 h-3" />
                {t(difficulty)}
                <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => toggleDifficulty(difficulty)} />
              </Badge>
            ))}

            {(dateFrom || dateTo) && (
              <Badge className="pl-3 pr-2 py-2 gap-2 bg-indigo-50 text-indigo-700 border-2 border-indigo-200">
                <Calendar className="w-3 h-3" />
                {dateFrom && new Date(dateFrom).toLocaleDateString()} - {dateTo && new Date(dateTo).toLocaleDateString()}
                <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => { setDateFrom(''); setDateTo(''); }} />
              </Badge>
            )}

            {activeFiltersCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={clearAllFilters}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8"
              >
                {language === 'he' ? 'נקה הכל' : language === 'ru' ? 'Очистить все' : language === 'es' ? 'Limpiar todo' : language === 'fr' ? 'Tout effacer' : language === 'de' ? 'Alle löschen' : language === 'it' ? 'Cancella tutto' : 'Clear All'}
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-4 sm:p-6 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-100 shadow-xl rounded-2xl">
              <div className="space-y-6">
                {/* Continent Selection */}
                {availableContinents.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Globe2 className="w-4 h-4 text-purple-600" />
                      <h4 className="font-bold text-sm text-gray-700">
                        {language === 'he' ? 'יבשת' : language === 'ru' ? 'Континент' : language === 'es' ? 'Continente' : language === 'fr' ? 'Continent' : language === 'de' ? 'Kontinent' : language === 'it' ? 'Continente' : 'Continent'}
                      </h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant={selectedContinent === 'all' ? 'default' : 'outline'}
                        className={`cursor-pointer transition-all px-4 py-2 ${selectedContinent === 'all' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' : 'hover:border-purple-400 hover:bg-purple-50'}`}
                        onClick={() => setSelectedContinent('all')}
                      >
                        {language === 'he' ? 'הכל' : language === 'ru' ? 'Все' : language === 'es' ? 'Todos' : language === 'fr' ? 'Tous' : language === 'de' ? 'Alle' : language === 'it' ? 'Tutti' : 'All'}
                      </Badge>
                      {availableContinents.map(continent => (
                        <Badge
                          key={continent}
                          variant={selectedContinent === continent ? 'default' : 'outline'}
                          className={`cursor-pointer transition-all px-4 py-2 ${selectedContinent === continent ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' : 'hover:border-purple-400 hover:bg-purple-50'}`}
                          onClick={() => setSelectedContinent(continent)}
                        >
                          {continentLabels[language]?.[continent] || continent}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Countries */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <h4 className="font-bold text-sm text-gray-700">
                      {language === 'he' ? 'מדינות' : language === 'ru' ? 'Страны' : language === 'es' ? 'Países' : language === 'fr' ? 'Pays' : language === 'de' ? 'Länder' : language === 'it' ? 'Paesi' : 'Countries'}
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availableCountries.map(country => {
                      const countryName = normalizedCountries[country]?.translations?.[language] || country;
                      return (
                        <Badge
                          key={country}
                          variant={selectedCountries.includes(country) ? 'default' : 'outline'}
                          className={`cursor-pointer transition-all px-4 py-2 ${selectedCountries.includes(country) ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white' : 'hover:border-blue-400 hover:bg-blue-50'}`}
                          onClick={() => toggleCountry(country)}
                        >
                          {countryName}
                        </Badge>
                      );
                    })}
                  </div>
                </div>

                {/* Activity Types */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    <h4 className="font-bold text-sm text-gray-700">
                      {language === 'he' ? 'סוג פעילות' : language === 'ru' ? 'Тип активности' : language === 'es' ? 'Tipo de actividad' : language === 'fr' ? 'Type d\'activité' : language === 'de' ? 'Aktivitätstyp' : language === 'it' ? 'Tipo di attività' : 'Activity Type'}
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['hiking', 'cycling', 'offroad'].map(activity => {
                      const Icon = activityIcons[activity];
                      return (
                        <Badge
                          key={activity}
                          variant={selectedActivities.includes(activity) ? 'default' : 'outline'}
                          className={`cursor-pointer transition-all px-4 py-2 ${selectedActivities.includes(activity) ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white' : 'hover:border-teal-400 hover:bg-teal-50'}`}
                          onClick={() => toggleActivity(activity)}
                        >
                          <Icon className="w-4 h-4 mr-1" />
                          {t(activity)}
                        </Badge>
                      );
                    })}
                  </div>
                </div>

                {/* Difficulty */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-orange-600" />
                    <h4 className="font-bold text-sm text-gray-700">
                      {language === 'he' ? 'רמת קושי' : language === 'ru' ? 'Сложность' : language === 'es' ? 'Dificultad' : language === 'fr' ? 'Difficulté' : language === 'de' ? 'Schwierigkeit' : language === 'it' ? 'Difficoltà' : 'Difficulty'}
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['easy', 'moderate', 'challenging', 'hard', 'extreme'].map(difficulty => (
                      <Badge
                        key={difficulty}
                        variant={selectedDifficulties.includes(difficulty) ? 'default' : 'outline'}
                        className={`cursor-pointer transition-all px-4 py-2 border-2 ${
                          selectedDifficulties.includes(difficulty) 
                            ? difficultyColors[difficulty] + ' font-bold'
                            : 'hover:' + difficultyColors[difficulty]
                        }`}
                        onClick={() => toggleDifficulty(difficulty)}
                      >
                        {t(difficulty)}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Date Range */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    <h4 className="font-bold text-sm text-gray-700">
                      {language === 'he' ? 'טווח תאריכים' : language === 'ru' ? 'Диапазон дат' : language === 'es' ? 'Rango de fechas' : language === 'fr' ? 'Plage de dates' : language === 'de' ? 'Datumsbereich' : language === 'it' ? 'Intervallo date' : 'Date Range'}
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="h-11 bg-white"
                    />
                    <Input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="h-11 bg-white"
                    />
                  </div>
                </div>

                {/* Clear Button */}
                {activeFiltersCount > 0 && (
                  <div className="flex justify-end pt-2">
                    <Button
                      variant="outline"
                      onClick={clearAllFilters}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <X className="w-4 h-4 mr-2" />
                      {language === 'he' ? 'נקה הכל' : language === 'ru' ? 'Очистить все' : language === 'es' ? 'Limpiar todo' : language === 'fr' ? 'Tout effacer' : language === 'de' ? 'Alle löschen' : language === 'it' ? 'Cancella tutto' : 'Clear All'}
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}