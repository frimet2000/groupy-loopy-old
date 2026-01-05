// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../LanguageContext';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  Search, X, Globe, MapPin, Calendar, Users, 
  Mountain, Bike, Truck, Filter, ChevronDown
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export default function ModernTripFilters({ trips, onFilteredTripsChange }) {
  const { language, t, isRTL } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState([]);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [availableCountries, setAvailableCountries] = useState([]);
  const [countryToContinentMap, setCountryToContinentMap] = useState({});

  // Get unique countries from trips and detect continents
  useEffect(() => {
    const detectContinents = async () => {
      const countries = new Set();
      const tempMap = {};

      trips.forEach(trip => {
        let country = trip.country || '';
        if (!country && trip.region && ['north', 'center', 'south', 'jerusalem', 'negev', 'eilat'].includes(trip.region)) {
          country = 'israel';
        }
        if (country && typeof country === 'string') {
          countries.add(country.toLowerCase());
        }
      });

      const countriesArray = Array.from(countries);

      // Known mappings
      const knownMappings = {
        israel: 'asia',
        usa: 'north_america',
        italy: 'europe',
        spain: 'europe',
        france: 'europe',
        germany: 'europe',
        uk: 'europe',
        japan: 'asia',
        australia: 'oceania',
        canada: 'north_america',
        switzerland: 'europe',
        austria: 'europe',
        new_zealand: 'oceania',
        norway: 'europe',
        sweden: 'europe',
        greece: 'europe',
        portugal: 'europe',
        netherlands: 'europe',
        belgium: 'europe',
        denmark: 'europe',
        ireland: 'europe',
        iceland: 'europe',
        croatia: 'europe',
        poland: 'europe',
        czech_republic: 'europe',
        thailand: 'asia',
        indonesia: 'asia',
        malaysia: 'asia',
        vietnam: 'asia',
        south_korea: 'asia',
        china: 'asia',
        india: 'asia',
        nepal: 'asia',
        turkey: 'asia',
        egypt: 'africa',
        morocco: 'africa',
        south_africa: 'africa',
        kenya: 'africa',
        tanzania: 'africa',
        brazil: 'south_america',
        argentina: 'south_america',
        chile: 'south_america',
        peru: 'south_america',
        mexico: 'north_america',
        costa_rica: 'north_america',
        finland: 'europe',
        romania: 'europe',
        hungary: 'europe',
        slovakia: 'europe',
        bulgaria: 'europe',
        serbia: 'europe',
        slovenia: 'europe',
        montenegro: 'europe',
        bosnia_herzegovina: 'europe',
        albania: 'europe',
        north_macedonia: 'europe',
        luxembourg: 'europe',
        malta: 'europe',
        cyprus: 'europe',
        estonia: 'europe',
        latvia: 'europe',
        lithuania: 'europe',
      };

      // First add all known countries
      countriesArray.forEach(country => {
        if (knownMappings[country]) {
          tempMap[country] = knownMappings[country];
        }
      });

      // For unknown countries, use AI
      const unknownCountries = countriesArray.filter(c => !knownMappings[c]);
      if (unknownCountries.length > 0) {
        try {
          const response = await base44.integrations.Core.InvokeLLM({
            prompt: `Given these country names: ${unknownCountries.join(', ')}. 
Return ONLY a JSON object mapping each country to its continent. Use these continent codes: europe, asia, africa, north_america, south_america, oceania.
Format: {"country1": "continent", "country2": "continent"}`,
            response_json_schema: {
              type: "object",
              additionalProperties: { type: "string" }
            }
          });
          
          Object.assign(tempMap, response);
        } catch (error) {
          console.error('Error detecting continents:', error);
          // Fallback to 'other' for unknown countries
          unknownCountries.forEach(c => {
            tempMap[c] = 'other';
          });
        }
      }

      setCountryToContinentMap(tempMap);
      setAvailableCountries(countriesArray.sort());
    };

    if (trips.length > 0) {
      detectContinents();
    }
  }, [trips]);

  // Activity icons
  const activityIcons = {
    hiking: Mountain,
    cycling: Bike,
    offroad: Truck,
  };

  // Filter trips
  const filteredTrips = useMemo(() => {
    return trips.filter(trip => {
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
        let tripCountry = '';
        if (trip.country && typeof trip.country === 'string') {
          tripCountry = trip.country.toLowerCase();
        }
        if (!tripCountry && trip.region && ['north', 'center', 'south', 'jerusalem', 'negev', 'eilat'].includes(trip.region)) {
          tripCountry = 'israel';
        }
        if (!tripCountry || !selectedCountries.includes(tripCountry)) {
          return false;
        }
      }

      // Activity filter
      if (selectedActivities.length > 0) {
        if (!selectedActivities.includes(trip.activity_type)) {
          return false;
        }
      }

      // Difficulty filter
      if (selectedDifficulties.length > 0) {
        if (!selectedDifficulties.includes(trip.difficulty)) {
          return false;
        }
      }

      return true;
    });
  }, [trips, searchQuery, selectedCountries, selectedActivities, selectedDifficulties]);

  // Update parent with filtered trips
  useEffect(() => {
    onFilteredTripsChange(filteredTrips);
  }, [filteredTrips, onFilteredTripsChange]);

  // Toggle filter
  const toggleFilter = (value, selectedArray, setSelectedArray) => {
    if (selectedArray.includes(value)) {
      setSelectedArray(selectedArray.filter(v => v !== value));
    } else {
      setSelectedArray([...selectedArray, value]);
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCountries([]);
    setSelectedActivities([]);
    setSelectedDifficulties([]);
  };

  const hasActiveFilters = searchQuery || selectedCountries.length > 0 || 
    selectedActivities.length > 0 || selectedDifficulties.length > 0;

  return (
    <Card className="p-4 sm:p-6 mb-6 border-2 border-gray-200">
      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          type="text"
          placeholder={language === 'he' ? 'חפש טיולים...' : language === 'ru' ? 'Поиск поездок...' : language === 'es' ? 'Buscar viajes...' : language === 'fr' ? 'Rechercher des voyages...' : language === 'de' ? 'Reisen suchen...' : language === 'it' ? 'Cerca viaggi...' : 'Search trips...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10 h-12 text-base"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedCountries.map(country => (
            <Badge 
              key={country}
              variant="secondary"
              className="gap-2 px-3 py-1.5 bg-emerald-100 text-emerald-700 border border-emerald-300 cursor-pointer hover:bg-emerald-200"
              onClick={() => toggleFilter(country, selectedCountries, setSelectedCountries)}
            >
              <Globe className="w-3 h-3" />
              {t(country)}
              <X className="w-3 h-3" />
            </Badge>
          ))}
          {selectedActivities.map(activity => {
            const Icon = activityIcons[activity] || Mountain;
            return (
              <Badge 
                key={activity}
                variant="secondary"
                className="gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 border border-blue-300 cursor-pointer hover:bg-blue-200"
                onClick={() => toggleFilter(activity, selectedActivities, setSelectedActivities)}
              >
                <Icon className="w-3 h-3" />
                {t(activity)}
                <X className="w-3 h-3" />
              </Badge>
            );
          })}
          {selectedDifficulties.map(difficulty => (
            <Badge 
              key={difficulty}
              variant="secondary"
              className="gap-2 px-3 py-1.5 bg-purple-100 text-purple-700 border border-purple-300 cursor-pointer hover:bg-purple-200"
              onClick={() => toggleFilter(difficulty, selectedDifficulties, setSelectedDifficulties)}
            >
              <Mountain className="w-3 h-3" />
              {t(difficulty)}
              <X className="w-3 h-3" />
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="gap-2 text-gray-600 hover:text-gray-900"
          >
            <X className="w-4 h-4" />
            {language === 'he' ? 'נקה הכל' : language === 'ru' ? 'Очистить всё' : language === 'es' ? 'Limpiar todo' : language === 'fr' ? 'Tout effacer' : language === 'de' ? 'Alles löschen' : language === 'it' ? 'Cancella tutto' : 'Clear all'}
          </Button>
        </div>
      )}

      {/* Filters Toggle */}
      <Collapsible open={showMoreFilters} onOpenChange={setShowMoreFilters}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full gap-2 mb-4">
            <Filter className="w-4 h-4" />
            {language === 'he' ? 'סינונים מתקדמים' : language === 'ru' ? 'Расширенные фильтры' : language === 'es' ? 'Filtros avanzados' : language === 'fr' ? 'Filtres avancés' : language === 'de' ? 'Erweiterte Filter' : language === 'it' ? 'Filtri avanzati' : 'Advanced Filters'}
            <ChevronDown className={`w-4 h-4 transition-transform ${showMoreFilters ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="space-y-4">
          {/* Countries */}
          {availableCountries.length > 0 && (
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                {language === 'he' ? 'מדינות' : language === 'ru' ? 'Страны' : language === 'es' ? 'Países' : language === 'fr' ? 'Pays' : language === 'de' ? 'Länder' : language === 'it' ? 'Paesi' : 'Countries'}
              </label>
              <div className="flex flex-wrap gap-2">
                {availableCountries.map(country => (
                  <Badge
                    key={country}
                    variant={selectedCountries.includes(country) ? "default" : "outline"}
                    className={`cursor-pointer px-3 py-2 ${
                      selectedCountries.includes(country) 
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => toggleFilter(country, selectedCountries, setSelectedCountries)}
                  >
                    {t(country)}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Activities */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Mountain className="w-4 h-4" />
              {language === 'he' ? 'סוג פעילות' : language === 'ru' ? 'Тип активности' : language === 'es' ? 'Tipo de actividad' : language === 'fr' ? 'Type d\'activité' : language === 'de' ? 'Aktivitätstyp' : language === 'it' ? 'Tipo di attività' : 'Activity Type'}
            </label>
            <div className="flex flex-wrap gap-2">
              {['hiking', 'cycling', 'offroad', 'running', 'culinary', 'trek'].map(activity => {
                const Icon = activityIcons[activity] || Mountain;
                return (
                  <Badge
                    key={activity}
                    variant={selectedActivities.includes(activity) ? "default" : "outline"}
                    className={`cursor-pointer px-3 py-2 gap-2 ${
                      selectedActivities.includes(activity) 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => toggleFilter(activity, selectedActivities, setSelectedActivities)}
                  >
                    <Icon className="w-3 h-3" />
                    {t(activity)}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Mountain className="w-4 h-4" />
              {language === 'he' ? 'רמת קושי' : language === 'ru' ? 'Сложность' : language === 'es' ? 'Dificultad' : language === 'fr' ? 'Difficulté' : language === 'de' ? 'Schwierigkeit' : language === 'it' ? 'Difficoltà' : 'Difficulty'}
            </label>
            <div className="flex flex-wrap gap-2">
              {['easy', 'moderate', 'challenging', 'hard', 'extreme'].map(difficulty => (
                <Badge
                  key={difficulty}
                  variant={selectedDifficulties.includes(difficulty) ? "default" : "outline"}
                  className={`cursor-pointer px-3 py-2 ${
                    selectedDifficulties.includes(difficulty) 
                      ? 'bg-purple-600 text-white hover:bg-purple-700' 
                      : 'hover:bg-gray-100'
                  }`}
                  onClick={() => toggleFilter(difficulty, selectedDifficulties, setSelectedDifficulties)}
                >
                  {t(difficulty)}
                </Badge>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}