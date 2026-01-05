// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  SlidersHorizontal, Search, RotateCcw, MapPin, Calendar as CalendarIcon, 
  TrendingUp, Sparkles, Filter, X 
} from 'lucide-react';
import { getAllCountries, getCountryRegions } from '../utils/CountryRegions';
import { motion, AnimatePresence } from 'framer-motion';

const difficulties = ['easy', 'moderate', 'challenging', 'hard'];
const durations = ['hours', 'half_day', 'full_day', 'overnight', 'multi_day'];
const activityTypes = ['hiking', 'cycling', 'offroad'];
const trailTypes = ['water', 'full_shade', 'partial_shade', 'desert', 'forest', 'coastal', 'mountain', 'historical', 'urban'];
const interests = ['nature', 'history', 'photography', 'birdwatching', 'archaeology', 'geology', 'botany', 'extreme_sports', 'family_friendly', 'romantic'];

export default function TripFilters({ filters, setFilters, showAdvanced }) {
  const { t, isRTL, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  
  // Sync with prop if provided, but allow internal toggle
  useEffect(() => {
    if (showAdvanced !== undefined) {
      setIsOpen(showAdvanced);
    }
  }, [showAdvanced]);

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
    if (key === 'country' && value === 'israel') return false; // Default
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'boolean') return value;
    return value && value !== '';
  }).length;

  return (
    <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm mb-6">
      <div className="p-4">
        {/* Search and Basic Toggles */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4`} />
            <Input
              placeholder={language === 'he' ? 'חפש טיולים...' : 'Search trips...'}
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className={`${isRTL ? 'pr-9' : 'pl-9'} bg-white border-emerald-100 focus:border-emerald-300 transition-all`}
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
             <Button
              variant={isOpen ? "secondary" : "outline"}
              onClick={() => setIsOpen(!isOpen)}
              className="gap-2 w-full md:w-auto border-emerald-200 hover:bg-emerald-50 text-emerald-700"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {language === 'he' ? 'סינון מתקדם' : 'Filters'}
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-200">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>

            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="text-gray-500 hover:text-red-500"
                size="icon"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && !isOpen && (
          <div className="flex flex-wrap gap-2 mt-3">
             {filters.country && filters.country !== 'israel' && (
               <Badge variant="outline" className="gap-1 bg-white">
                 {t(filters.country)}
                 <X className="w-3 h-3 cursor-pointer" onClick={() => handleFilterChange('country', '')} />
               </Badge>
             )}
             {filters.region && (
               <Badge variant="outline" className="gap-1 bg-white">
                 {t(filters.region)}
                 <X className="w-3 h-3 cursor-pointer" onClick={() => handleFilterChange('region', '')} />
               </Badge>
             )}
             {filters.difficulty && (
               <Badge variant="outline" className="gap-1 bg-white">
                 {t(filters.difficulty)}
                 <X className="w-3 h-3 cursor-pointer" onClick={() => handleFilterChange('difficulty', '')} />
               </Badge>
             )}
             {/* Add more badges for other filters as needed */}
          </div>
        )}

        {/* Expandable Advanced Filters */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="pt-6 space-y-6">
                <Separator className="bg-emerald-100/50" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Location Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-emerald-700 font-medium">
                      <MapPin className="w-4 h-4" />
                      {language === 'he' ? 'מיקום' : 'Location'}
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-gray-500 mb-1.5 block">{t('country')}</Label>
                        <Select value={filters.country} onValueChange={(v) => handleFilterChange('country', v)}>
                          <SelectTrigger className="bg-white border-gray-200">
                            <SelectValue placeholder={t('selectCountry')} />
                          </SelectTrigger>
                          <SelectContent>
                            <div className="p-2">
                                <Input 
                                  placeholder={language === 'he' ? 'חפש מדינה...' : 'Search country...'} 
                                  className="h-8 text-xs"
                                  value={countrySearch}
                                  onChange={(e) => setCountrySearch(e.target.value)}
                                />
                            </div>
                            <SelectItem value="israel">{t('israel')}</SelectItem>
                            {getAllCountries()
                                .filter(c => c.value !== 'israel')
                                .filter(c => c.label.toLowerCase().includes(countrySearch.toLowerCase()))
                                .map(country => (
                              <SelectItem key={country.value} value={country.value}>
                                {country.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {filters.country && getCountryRegions(filters.country).length > 0 && (
                        <div>
                          <Label className="text-xs text-gray-500 mb-1.5 block">{t('region')}</Label>
                          <Select value={filters.region} onValueChange={(v) => handleFilterChange('region', v)}>
                            <SelectTrigger className="bg-white border-gray-200">
                              <SelectValue placeholder={t('allRegions')} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all_regions">{t('allRegions')}</SelectItem>
                              {getCountryRegions(filters.country).map(region => (
                                <SelectItem key={region} value={region}>
                                  {t(region)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Trip Details Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-emerald-700 font-medium">
                      <TrendingUp className="w-4 h-4" />
                      {language === 'he' ? 'פרטי הטיול' : 'Trip Details'}
                    </div>

                    <div className="space-y-3">
                       <div>
                        <Label className="text-xs text-gray-500 mb-1.5 block">{t('difficulty')}</Label>
                        <Select value={filters.difficulty} onValueChange={(v) => handleFilterChange('difficulty', v)}>
                          <SelectTrigger className="bg-white border-gray-200">
                            <SelectValue placeholder={t('anyDifficulty')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">{t('anyDifficulty')}</SelectItem>
                            {difficulties.map(diff => (
                              <SelectItem key={diff} value={diff}>{t(diff)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-xs text-gray-500 mb-1.5 block">{t('duration')}</Label>
                        <Select value={filters.duration_type} onValueChange={(v) => handleFilterChange('duration_type', v)}>
                          <SelectTrigger className="bg-white border-gray-200">
                            <SelectValue placeholder={t('anyDuration')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">{t('anyDuration')}</SelectItem>
                            {durations.map(dur => (
                              <SelectItem key={dur} value={dur}>{t(dur)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Type & Preferences */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-emerald-700 font-medium">
                      <Sparkles className="w-4 h-4" />
                      {language === 'he' ? 'סוג והעדפות' : 'Type & Preferences'}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-gray-500 mb-1.5 block">{t('activityType')}</Label>
                        <Select value={filters.activity_type} onValueChange={(v) => handleFilterChange('activity_type', v)}>
                          <SelectTrigger className="bg-white border-gray-200">
                            <SelectValue placeholder={t('anyActivity')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">{t('anyActivity')}</SelectItem>
                            {activityTypes.map(type => (
                              <SelectItem key={type} value={type}>{t(type)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex flex-col gap-2 pt-1">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <Checkbox 
                            id="available_spots" 
                            checked={filters.available_spots}
                            onCheckedChange={(checked) => handleFilterChange('available_spots', checked)}
                          />
                          <label htmlFor="available_spots" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-gray-600">
                            {language === 'he' ? 'מקומות פנויים בלבד' : 'Available spots only'}
                          </label>
                        </div>
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <Checkbox 
                            id="favorites" 
                            checked={filters.favorites}
                            onCheckedChange={(checked) => handleFilterChange('favorites', checked)}
                          />
                          <label htmlFor="favorites" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-gray-600">
                            {language === 'he' ? 'מועדפים בלבד' : 'Favorites only'}
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                   {/* Tags Section */}
                   <div className="space-y-4">
                    <div className="flex items-center gap-2 text-emerald-700 font-medium">
                      <Filter className="w-4 h-4" />
                      {language === 'he' ? 'תגיות' : 'Tags'}
                    </div>
                    
                    <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                      {trailTypes.map(type => (
                        <Badge 
                          key={type}
                          variant={filters.trail_type.includes(type) ? "default" : "outline"}
                          className={`cursor-pointer ${filters.trail_type.includes(type) ? 'bg-emerald-600 hover:bg-emerald-700' : 'hover:bg-emerald-50 text-gray-600 border-gray-200'}`}
                          onClick={() => {
                            const newTypes = filters.trail_type.includes(type)
                              ? filters.trail_type.filter(t => t !== type)
                              : [...filters.trail_type, type];
                            handleFilterChange('trail_type', newTypes);
                          }}
                        >
                          {t(type)}
                        </Badge>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}
