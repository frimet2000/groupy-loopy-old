// @ts-nocheck
import React, { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, RotateCcw, Globe, Mountain, Clock, Zap } from 'lucide-react';
import { getAllCountries, getCountryRegions } from '../utils/CountryRegions';
import { motion } from 'framer-motion';

export default function TripFilters({ filters, setFilters }) {
  const { t, isRTL, language } = useLanguage();
  const [countrySearch, setCountrySearch] = useState('');
  
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
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'boolean') return value;
    return value && value !== '';
  }).length;

  // Quick filter buttons
  const quickFilters = [
    { 
      key: 'country', 
      value: 'israel', 
      emoji: '🇮🇱', 
      label: { he: 'ישראל', ru: 'Израиль', es: 'Israel', fr: 'Israël', de: 'Israel', it: 'Israele', en: 'Israel' }
    },
    { 
      key: 'activity_type', 
      value: 'hiking', 
      emoji: '🥾', 
      label: { he: 'הליכה', ru: 'Пеший', es: 'Senderismo', fr: 'Randonnée', de: 'Wandern', it: 'Trekking', en: 'Hiking' }
    },
    { 
      key: 'activity_type', 
      value: 'cycling', 
      emoji: '🚴', 
      label: { he: 'אופניים', ru: 'Велоспорт', es: 'Ciclismo', fr: 'Vélo', de: 'Radfahren', it: 'Ciclismo', en: 'Cycling' }
    },
    { 
      key: 'difficulty', 
      value: 'easy', 
      emoji: '😊', 
      label: { he: 'קל', ru: 'Легко', es: 'Fácil', fr: 'Facile', de: 'Leicht', it: 'Facile', en: 'Easy' }
    },
    { 
      key: 'difficulty', 
      value: 'challenging', 
      emoji: '💪', 
      label: { he: 'מאתגר', ru: 'Сложно', es: 'Desafiante', fr: 'Difficile', de: 'Schwer', it: 'Difficile', en: 'Hard' }
    },
    { 
      key: 'available_spots', 
      value: true, 
      emoji: '✅', 
      label: { he: 'יש מקומות', ru: 'Есть места', es: 'Disponible', fr: 'Disponible', de: 'Verfügbar', it: 'Disponibile', en: 'Available' }
    },
  ];

  const toggleQuickFilter = (key, value) => {
    if (typeof value === 'boolean') {
      handleFilterChange(key, !filters[key]);
    } else {
      handleFilterChange(key, filters[key] === value ? '' : value);
    }
  };

  const isActive = (key, value) => {
    if (typeof value === 'boolean') return filters[key] === true;
    return filters[key] === value;
  };

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

        {/* Quick Filters */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {language === 'he' ? 'סינון מהיר' : language === 'ru' ? 'Быстрый фильтр' : language === 'es' ? 'Filtro rápido' : language === 'fr' ? 'Filtre rapide' : language === 'de' ? 'Schnellfilter' : language === 'it' ? 'Filtro rapido' : 'Quick Filter'}
            </span>
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 text-xs gap-1"
                size="sm"
              >
                <RotateCcw className="w-3 h-3" />
                {language === 'he' ? 'נקה' : language === 'ru' ? 'Очистить' : language === 'es' ? 'Limpiar' : language === 'fr' ? 'Effacer' : language === 'de' ? 'Löschen' : language === 'it' ? 'Cancella' : 'Clear'}
              </Button>
            )}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
            {quickFilters.map((filter, idx) => (
              <motion.div key={idx} whileTap={{ scale: 0.95 }}>
                <Button
                  variant={isActive(filter.key, filter.value) ? "default" : "outline"}
                  onClick={() => toggleQuickFilter(filter.key, filter.value)}
                  className={`flex-shrink-0 h-11 px-4 gap-2 font-semibold transition-all touch-manipulation ${
                    isActive(filter.key, filter.value)
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg border-0 scale-105'
                      : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-emerald-400 hover:bg-emerald-50'
                  }`}
                >
                  <span className="text-xl">{filter.emoji}</span>
                  <span className="text-sm whitespace-nowrap">{filter.label[language] || filter.label.en}</span>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Advanced Selectors - Always Visible */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Country */}
          <Select value={filters.country} onValueChange={(v) => handleFilterChange('country', v)}>
            <SelectTrigger className="bg-white border-2 border-gray-200 h-12 hover:border-emerald-400 transition-all shadow-sm">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-600" />
                <SelectValue placeholder={language === 'he' ? 'מדינה' : language === 'ru' ? 'Страна' : language === 'es' ? 'País' : language === 'fr' ? 'Pays' : language === 'de' ? 'Land' : language === 'it' ? 'Paese' : 'Country'} />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>{language === 'he' ? 'כל המדינות' : language === 'ru' ? 'Все' : language === 'es' ? 'Todos' : language === 'fr' ? 'Tous' : language === 'de' ? 'Alle' : language === 'it' ? 'Tutti' : 'All'}</SelectItem>
              {getAllCountries().map(country => (
                <SelectItem key={country.value} value={country.value}>
                  {country.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Difficulty */}
          <Select value={filters.difficulty} onValueChange={(v) => handleFilterChange('difficulty', v)}>
            <SelectTrigger className="bg-white border-2 border-gray-200 h-12 hover:border-emerald-400 transition-all shadow-sm">
              <div className="flex items-center gap-2">
                <Mountain className="w-4 h-4 text-blue-600" />
                <SelectValue placeholder={language === 'he' ? 'רמת קושי' : language === 'ru' ? 'Сложность' : language === 'es' ? 'Dificultad' : language === 'fr' ? 'Difficulté' : language === 'de' ? 'Schwierigkeit' : language === 'it' ? 'Difficoltà' : 'Difficulty'} />
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
          <Select value={filters.duration_type} onValueChange={(v) => handleFilterChange('duration_type', v)}>
            <SelectTrigger className="bg-white border-2 border-gray-200 h-12 hover:border-emerald-400 transition-all shadow-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-600" />
                <SelectValue placeholder={language === 'he' ? 'משך זמן' : language === 'ru' ? 'Длительность' : language === 'es' ? 'Duración' : language === 'fr' ? 'Durée' : language === 'de' ? 'Dauer' : language === 'it' ? 'Durata' : 'Duration'} />
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
          <Select value={filters.activity_type} onValueChange={(v) => handleFilterChange('activity_type', v)}>
            <SelectTrigger className="bg-white border-2 border-gray-200 h-12 hover:border-emerald-400 transition-all shadow-sm">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-orange-600" />
                <SelectValue placeholder={language === 'he' ? 'סוג פעילות' : language === 'ru' ? 'Тип' : language === 'es' ? 'Tipo' : language === 'fr' ? 'Type' : language === 'de' ? 'Typ' : language === 'it' ? 'Tipo' : 'Activity'} />
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

        {/* Quick Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {quickFilters.map((filter, idx) => (
            <motion.div key={idx} whileTap={{ scale: 0.95 }}>
              <Badge
                onClick={() => toggleQuickFilter(filter.key, filter.value)}
                className={`cursor-pointer h-9 px-4 text-sm font-semibold gap-2 transition-all touch-manipulation ${
                  isActive(filter.key, filter.value)
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md hover:shadow-lg'
                    : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-emerald-500 hover:bg-emerald-50'
                }`}
              >
                <span>{filter.emoji}</span>
                <span>{filter.label[language] || filter.label.en}</span>
              </Badge>
            </motion.div>
          ))}
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
            </div>
          </motion.div>
        )}
      </div>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </Card>
  );
}