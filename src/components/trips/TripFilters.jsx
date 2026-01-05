// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, RotateCcw, Globe, Mountain, Clock, Zap, X } from 'lucide-react';
import { getAllCountries } from '../utils/CountryRegions';
import { motion } from 'framer-motion';

export default function TripFilters({ filters, setFilters }) {
  const { t, isRTL, language } = useLanguage();
  const [countrySearch, setCountrySearch] = useState('');
  const [showCountrySuggestions, setShowCountrySuggestions] = useState(false);
  
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      country: '',
      region: '',
      difficulty: '',
      duration_type: '',
      activity_type: '',
      pets_allowed: false,
      camping_available: false,
      trail_type: [],
      interests: [],
      date_from: null,
      date_to: null,
      available_spots: false,
      favorites: false
    });
    setCountrySearch('');
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'boolean') return value;
    return value && value !== '';
  }).length;

  // Update country search display when filter changes
  useEffect(() => {
    if (filters.country) {
      const country = getAllCountries(language).find(c => c.value === filters.country);
      if (country) {
        setCountrySearch(typeof country.label === 'string' ? country.label : country.value);
      }
    } else {
      setCountrySearch('');
    }
  }, [filters.country, language]);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.country-autocomplete')) {
        setShowCountrySuggestions(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Filter countries based on search
  const filteredCountries = getAllCountries(language).filter(c => 
    c.label && typeof c.label === 'string' && 
    c.label.toLowerCase().includes(countrySearch.toLowerCase())
  );

  return (
    <Card className="border-2 border-emerald-100 shadow-xl bg-gradient-to-br from-white via-emerald-50/20 to-white backdrop-blur mb-6">
      <div className="p-4">
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 transform -translate-y-1/2 text-emerald-600 w-5 h-5`} />
          <Input
            placeholder={language === 'he' ? '🔍 חפש טיולים לפי שם, מיקום או תיאור...' : language === 'ru' ? '🔍 Поиск поездок...' : language === 'es' ? '🔍 Buscar viajes...' : language === 'fr' ? '🔍 Rechercher...' : language === 'de' ? '🔍 Suchen...' : language === 'it' ? '🔍 Cerca...' : '🔍 Search trips...'}
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className={`${isRTL ? 'pr-12' : 'pl-12'} bg-white border-2 border-emerald-200 focus:border-emerald-500 transition-all h-14 text-base font-medium shadow-sm`}
          />
        </div>



        {/* Advanced Selectors - Always Visible */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Country - Autocomplete Input */}
          <div className="relative country-autocomplete">
            <div className="relative">
              <Globe className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-emerald-600 w-4 h-4 z-10`} />
              <Input
                placeholder={language === 'he' ? 'הקלד מדינה...' : language === 'ru' ? 'Введите страну...' : language === 'es' ? 'Escribe país...' : language === 'fr' ? 'Tapez pays...' : language === 'de' ? 'Land eingeben...' : language === 'it' ? 'Digita paese...' : 'Type country...'}
                value={countrySearch}
                onChange={(e) => {
                  setCountrySearch(e.target.value);
                  setShowCountrySuggestions(true);
                }}
                onFocus={() => setShowCountrySuggestions(true)}
                className={`${isRTL ? 'pr-10 pl-10' : 'pl-10 pr-10'} bg-white border-2 border-gray-200 h-12 hover:border-emerald-400 focus:border-emerald-500 transition-all shadow-sm text-gray-900`}
              />
              {countrySearch && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setCountrySearch('');
                    handleFilterChange('country', '');
                    setShowCountrySuggestions(false);
                  }}
                  className={`absolute ${isRTL ? 'left-1' : 'right-1'} top-1/2 transform -translate-y-1/2 h-8 w-8 hover:bg-red-50`}
                >
                  <X className="w-4 h-4 text-gray-400 hover:text-red-600" />
                </Button>
              )}
            </div>
            {showCountrySuggestions && filteredCountries.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-emerald-300 rounded-lg shadow-2xl max-h-64 overflow-y-auto z-50">
                {filteredCountries.slice(0, 10).map(country => (
                  <div
                    key={country.value}
                    onClick={() => {
                      handleFilterChange('country', country.value);
                      setCountrySearch(typeof country.label === 'string' ? country.label : country.value);
                      setShowCountrySuggestions(false);
                    }}
                    className="px-4 py-3 hover:bg-emerald-50 cursor-pointer transition-colors border-b last:border-b-0 text-gray-900 font-medium flex items-center gap-2"
                  >
                    <Globe className="w-4 h-4 text-emerald-600" />
                    {typeof country.label === 'string' ? country.label : country.value}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Difficulty */}
          <Select value={filters.difficulty || ""} onValueChange={(v) => handleFilterChange('difficulty', v)}>
            <SelectTrigger className="bg-white border-2 border-gray-200 h-12 hover:border-emerald-400 transition-all shadow-sm">
              <div className="flex items-center gap-2 w-full">
                <Mountain className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span className={`flex-1 text-start truncate ${filters.difficulty ? 'text-gray-900' : 'text-gray-500'}`}>
                  {filters.difficulty === 'easy' ? (language === 'he' ? 'קל' : language === 'ru' ? 'Легко' : language === 'es' ? 'Fácil' : language === 'fr' ? 'Facile' : language === 'de' ? 'Leicht' : language === 'it' ? 'Facile' : 'Easy')
                  : filters.difficulty === 'moderate' ? (language === 'he' ? 'בינוני' : language === 'ru' ? 'Средне' : language === 'es' ? 'Moderado' : language === 'fr' ? 'Modéré' : language === 'de' ? 'Mäßig' : language === 'it' ? 'Moderato' : 'Moderate')
                  : filters.difficulty === 'challenging' ? (language === 'he' ? 'מאתגר' : language === 'ru' ? 'Сложно' : language === 'es' ? 'Desafiante' : language === 'fr' ? 'Difficile' : language === 'de' ? 'Anspruchsvoll' : language === 'it' ? 'Impegnativo' : 'Challenging')
                  : filters.difficulty === 'hard' ? (language === 'he' ? 'קשה' : language === 'ru' ? 'Трудно' : language === 'es' ? 'Difícil' : language === 'fr' ? 'Dur' : language === 'de' ? 'Schwer' : language === 'it' ? 'Difficile' : 'Hard')
                  : (language === 'he' ? 'רמת קושי' : language === 'ru' ? 'Сложность' : language === 'es' ? 'Dificultad' : language === 'fr' ? 'Difficulté' : language === 'de' ? 'Schwierigkeit' : language === 'it' ? 'Difficoltà' : 'Difficulty')
                  }
                </span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>{language === 'he' ? 'הכל' : language === 'ru' ? 'Все' : language === 'es' ? 'Todos' : language === 'fr' ? 'Tous' : language === 'de' ? 'Alle' : language === 'it' ? 'Tutti' : 'All'}</SelectItem>
              <SelectItem value="easy">{language === 'he' ? 'קל' : language === 'ru' ? 'Легко' : language === 'es' ? 'Fácil' : language === 'fr' ? 'Facile' : language === 'de' ? 'Leicht' : language === 'it' ? 'Facile' : 'Easy'}</SelectItem>
              <SelectItem value="moderate">{language === 'he' ? 'בינוני' : language === 'ru' ? 'Средне' : language === 'es' ? 'Moderado' : language === 'fr' ? 'Modéré' : language === 'de' ? 'Mäßig' : language === 'it' ? 'Moderato' : 'Moderate'}</SelectItem>
              <SelectItem value="challenging">{language === 'he' ? 'מאתגר' : language === 'ru' ? 'Сложно' : language === 'es' ? 'Desafiante' : language === 'fr' ? 'Difficile' : language === 'de' ? 'Anspruchsvoll' : language === 'it' ? 'Impegnativo' : 'Challenging'}</SelectItem>
              <SelectItem value="hard">{language === 'he' ? 'קשה' : language === 'ru' ? 'Трудно' : language === 'es' ? 'Difícil' : language === 'fr' ? 'Dur' : language === 'de' ? 'Schwer' : language === 'it' ? 'Difficile' : 'Hard'}</SelectItem>
            </SelectContent>
          </Select>

          {/* Duration */}
          <Select value={filters.duration_type || ""} onValueChange={(v) => handleFilterChange('duration_type', v)}>
            <SelectTrigger className="bg-white border-2 border-gray-200 h-12 hover:border-emerald-400 transition-all shadow-sm">
              <div className="flex items-center gap-2 w-full">
                <Clock className="w-4 h-4 text-purple-600 flex-shrink-0" />
                <span className={`flex-1 text-start truncate ${filters.duration_type ? 'text-gray-900' : 'text-gray-500'}`}>
                  {filters.duration_type === 'hours' ? (language === 'he' ? 'שעות' : language === 'ru' ? 'Часы' : language === 'es' ? 'Horas' : language === 'fr' ? 'Heures' : language === 'de' ? 'Stunden' : language === 'it' ? 'Ore' : 'Hours')
                  : filters.duration_type === 'half_day' ? (language === 'he' ? 'חצי יום' : language === 'ru' ? 'Полдня' : language === 'es' ? 'Medio día' : language === 'fr' ? 'Demi-journée' : language === 'de' ? 'Halber Tag' : language === 'it' ? 'Mezza giornata' : 'Half Day')
                  : filters.duration_type === 'full_day' ? (language === 'he' ? 'יום מלא' : language === 'ru' ? 'Полный день' : language === 'es' ? 'Día completo' : language === 'fr' ? 'Journée complète' : language === 'de' ? 'Ganzer Tag' : language === 'it' ? 'Giornata intera' : 'Full Day')
                  : filters.duration_type === 'overnight' ? (language === 'he' ? 'לילה' : language === 'ru' ? 'С ночевкой' : language === 'es' ? 'Noche' : language === 'fr' ? 'Nuit' : language === 'de' ? 'Übernachtung' : language === 'it' ? 'Notturno' : 'Overnight')
                  : filters.duration_type === 'multi_day' ? (language === 'he' ? 'מספר ימים' : language === 'ru' ? 'Несколько дней' : language === 'es' ? 'Varios días' : language === 'fr' ? 'Plusieurs jours' : language === 'de' ? 'Mehrtägig' : language === 'it' ? 'Più giorni' : 'Multi-Day')
                  : (language === 'he' ? 'משך זמן' : language === 'ru' ? 'Длительность' : language === 'es' ? 'Duración' : language === 'fr' ? 'Durée' : language === 'de' ? 'Dauer' : language === 'it' ? 'Durata' : 'Duration')
                  }
                </span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>{language === 'he' ? 'הכל' : language === 'ru' ? 'Все' : language === 'es' ? 'Todos' : language === 'fr' ? 'Tous' : language === 'de' ? 'Alle' : language === 'it' ? 'Tutti' : 'All'}</SelectItem>
              <SelectItem value="hours">{language === 'he' ? 'שעות' : language === 'ru' ? 'Часы' : language === 'es' ? 'Horas' : language === 'fr' ? 'Heures' : language === 'de' ? 'Stunden' : language === 'it' ? 'Ore' : 'Hours'}</SelectItem>
              <SelectItem value="half_day">{language === 'he' ? 'חצי יום' : language === 'ru' ? 'Полдня' : language === 'es' ? 'Medio día' : language === 'fr' ? 'Demi-journée' : language === 'de' ? 'Halber Tag' : language === 'it' ? 'Mezza giornata' : 'Half Day'}</SelectItem>
              <SelectItem value="full_day">{language === 'he' ? 'יום מלא' : language === 'ru' ? 'Полный день' : language === 'es' ? 'Día completo' : language === 'fr' ? 'Journée complète' : language === 'de' ? 'Ganzer Tag' : language === 'it' ? 'Giornata intera' : 'Full Day'}</SelectItem>
              <SelectItem value="overnight">{language === 'he' ? 'לילה' : language === 'ru' ? 'С ночевкой' : language === 'es' ? 'Noche' : language === 'fr' ? 'Nuit' : language === 'de' ? 'Übernachtung' : language === 'it' ? 'Notturno' : 'Overnight'}</SelectItem>
              <SelectItem value="multi_day">{language === 'he' ? 'מספר ימים' : language === 'ru' ? 'Несколько дней' : language === 'es' ? 'Varios días' : language === 'fr' ? 'Plusieurs jours' : language === 'de' ? 'Mehrtägig' : language === 'it' ? 'Più giorni' : 'Multi-Day'}</SelectItem>
            </SelectContent>
          </Select>

          {/* Activity Type */}
          <Select value={filters.activity_type || ""} onValueChange={(v) => handleFilterChange('activity_type', v)}>
            <SelectTrigger className="bg-white border-2 border-gray-200 h-12 hover:border-emerald-400 transition-all shadow-sm">
              <div className="flex items-center gap-2 w-full">
                <Zap className="w-4 h-4 text-orange-600 flex-shrink-0" />
                <span className={`flex-1 text-start truncate ${filters.activity_type ? 'text-gray-900' : 'text-gray-500'}`}>
                  {filters.activity_type === 'hiking' ? (language === 'he' ? 'הליכה' : language === 'ru' ? 'Пеший туризм' : language === 'es' ? 'Senderismo' : language === 'fr' ? 'Randonnée' : language === 'de' ? 'Wandern' : language === 'it' ? 'Trekking' : 'Hiking')
                  : filters.activity_type === 'cycling' ? (language === 'he' ? 'אופניים' : language === 'ru' ? 'Велоспорт' : language === 'es' ? 'Ciclismo' : language === 'fr' ? 'Vélo' : language === 'de' ? 'Radfahren' : language === 'it' ? 'Ciclismo' : 'Cycling')
                  : filters.activity_type === 'offroad' ? (language === 'he' ? 'שטח' : language === 'ru' ? 'Внедорожник' : language === 'es' ? 'Todoterreno' : language === 'fr' ? 'Tout-terrain' : language === 'de' ? 'Offroad' : language === 'it' ? 'Fuoristrada' : 'Off-road')
                  : filters.activity_type === 'trek' ? (language === 'he' ? 'טרק' : language === 'ru' ? 'Трек' : language === 'es' ? 'Trek' : language === 'fr' ? 'Trek' : language === 'de' ? 'Trek' : language === 'it' ? 'Trek' : 'Trek')
                  : (language === 'he' ? 'סוג פעילות' : language === 'ru' ? 'Тип' : language === 'es' ? 'Tipo' : language === 'fr' ? 'Type' : language === 'de' ? 'Typ' : language === 'it' ? 'Tipo' : 'Activity')
                  }
                </span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>{language === 'he' ? 'הכל' : language === 'ru' ? 'Все' : language === 'es' ? 'Todos' : language === 'fr' ? 'Tous' : language === 'de' ? 'Alle' : language === 'it' ? 'Tutti' : 'All'}</SelectItem>
              <SelectItem value="hiking">{language === 'he' ? 'הליכה' : language === 'ru' ? 'Пеший туризм' : language === 'es' ? 'Senderismo' : language === 'fr' ? 'Randonnée' : language === 'de' ? 'Wandern' : language === 'it' ? 'Trekking' : 'Hiking'}</SelectItem>
              <SelectItem value="cycling">{language === 'he' ? 'אופניים' : language === 'ru' ? 'Велоспорт' : language === 'es' ? 'Ciclismo' : language === 'fr' ? 'Vélo' : language === 'de' ? 'Radfahren' : language === 'it' ? 'Ciclismo' : 'Cycling'}</SelectItem>
              <SelectItem value="offroad">{language === 'he' ? 'שטח' : language === 'ru' ? 'Внедорожник' : language === 'es' ? 'Todoterreno' : language === 'fr' ? 'Tout-terrain' : language === 'de' ? 'Offroad' : language === 'it' ? 'Fuoristrada' : 'Off-road'}</SelectItem>
              <SelectItem value="trek">{language === 'he' ? 'טרק' : language === 'ru' ? 'Трек' : language === 'es' ? 'Trek' : language === 'fr' ? 'Trek' : language === 'de' ? 'Trek' : language === 'it' ? 'Trek' : 'Trek'}</SelectItem>
            </SelectContent>
          </Select>
        </div>



        {/* Active Filters Summary */}
        {activeFiltersCount > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-600 text-white font-bold">
                  {activeFiltersCount}
                </Badge>
                <span className="text-sm text-emerald-800 font-medium">
                  {language === 'he' ? 'פילטרים פעילים' : language === 'ru' ? 'Активных фильтров' : language === 'es' ? 'Filtros activos' : language === 'fr' ? 'Filtres actifs' : language === 'de' ? 'Aktive Filter' : language === 'it' ? 'Filtri attivi' : 'Active Filters'}
                </span>
              </div>
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 text-xs gap-1"
                size="sm"
              >
                <RotateCcw className="w-3 h-3" />
                {language === 'he' ? 'נקה הכל' : language === 'ru' ? 'Очистить' : language === 'es' ? 'Limpiar' : language === 'fr' ? 'Effacer' : language === 'de' ? 'Löschen' : language === 'it' ? 'Cancella' : 'Clear All'}
              </Button>
            </div>
          </motion.div>
        )}
      </div>

    </Card>
  );
}