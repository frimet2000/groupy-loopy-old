// @ts-nocheck
import React, { useState } from 'react';
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
  React.useEffect(() => {
    if (showAdvanced !== undefined) {
      setIsOpen(showAdvanced);
    }
  }, [showAdvanced]);

  const countries = getAllCountries().sort((a, b) => t(a).localeCompare(t(b)));
  const regions = filters.country ? getCountryRegions(filters.country) : getCountryRegions('israel');
  const filteredCountries = countries.filter(c => 
    t(c).toLowerCase().includes(countrySearch.toLowerCase())
  );

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters(prev => ({
      ...prev,
      region: '',
      difficulty: '',
      duration_type: '',
      activity_type: '',
      date_from: null,
      date_to: null,
      trail_type: [],
      interests: [],
      pets_allowed: false,
      camping_available: false,
      available_spots: false
    }));
  };

  const activeFiltersCount = Object.keys(filters).filter(k => 
    k !== 'search' && k !== 'country' && 
    filters[k] && (Array.isArray(filters[k]) ? filters[k].length > 0 : true)
  ).length;

  return (
    <div className="space-y-4">
      {/* Search Bar & Toggle */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <div className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2`}>
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <Input
            placeholder={t('search') + '...'}
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className={`${isRTL ? 'pr-12' : 'pl-12'} h-12 text-lg bg-white shadow-sm border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl transition-all`}
          />
        </div>
        
        <Button 
          onClick={() => setIsOpen(!isOpen)}
          variant={isOpen ? "secondary" : "outline"}
          className={`h-12 px-6 gap-2 rounded-xl shadow-sm border-2 ${isOpen ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-gray-200 hover:border-emerald-200 hover:text-emerald-600'}`}
        >
          <SlidersHorizontal className="w-5 h-5" />
          <span className="hidden sm:inline font-semibold">{t('filter')}</span>
          {activeFiltersCount > 0 && (
            <span className="bg-emerald-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </div>

      {/* Expandable Filters Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-white border-2 border-gray-100 shadow-lg rounded-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2 text-gray-800">
                  <Filter className="w-5 h-5 text-emerald-600" />
                  {language === 'he' ? 'סינון מתקדם' : 'Advanced Filters'}
                </h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearFilters}
                  className="text-gray-500 hover:text-red-600 hover:bg-red-50"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {t('clear')}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Country Selection */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                    <MapPin className="w-4 h-4 text-emerald-500" />
                    {t('country')}
                  </Label>
                  <div className="space-y-2">
                    <Input
                      placeholder={language === 'he' ? 'חפש מדינה...' : 'Search country...'}
                      value={countrySearch}
                      onChange={(e) => setCountrySearch(e.target.value)}
                      className="h-10 text-sm"
                    />
                    <Select 
                      value={filters.country || ''} 
                      onValueChange={(v) => {
                        handleFilterChange('country', v === 'all' ? '' : v);
                        if (v !== filters.country) handleFilterChange('region', '');
                        setCountrySearch('');
                      }}
                    >
                      <SelectTrigger className="h-11 bg-gray-50/50">
                        <SelectValue placeholder={t('selectCountry')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{language === 'he' ? 'כל המדינות' : 'All Countries'}</SelectItem>
                        {filteredCountries.map(c => (
                          <SelectItem key={c} value={c}>{t(c)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Region Selection */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    {t('region')}
                  </Label>
                  <Select 
                    value={filters.region || ''} 
                    onValueChange={(v) => handleFilterChange('region', v === 'all' ? '' : v)}
                  >
                    <SelectTrigger className="h-11 bg-gray-50/50">
                      <SelectValue placeholder={t('allRegions')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('allRegions')}</SelectItem>
                      {regions.map(r => (
                        <SelectItem key={r} value={r}>{t(r)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Range */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                    <CalendarIcon className="w-4 h-4 text-indigo-500" />
                    {t('dateRange')}
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs text-gray-500 mb-1 block">{t('from')}</Label>
                      <Input
                        type="date"
                        value={filters.date_from || ''}
                        onChange={(e) => handleFilterChange('date_from', e.target.value)}
                        className="h-11 bg-gray-50/50"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500 mb-1 block">{t('to')}</Label>
                      <Input
                        type="date"
                        value={filters.date_to || ''}
                        onChange={(e) => handleFilterChange('date_to', e.target.value)}
                        className="h-11 bg-gray-50/50"
                      />
                    </div>
                  </div>
                </div>

                {/* Difficulty */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                    <TrendingUp className="w-4 h-4 text-orange-500" />
                    {t('difficulty')}
                  </Label>
                  <Select 
                    value={filters.difficulty || ''} 
                    onValueChange={(v) => handleFilterChange('difficulty', v === 'all' ? '' : v)}
                  >
                    <SelectTrigger className="h-11 bg-gray-50/50">
                      <SelectValue placeholder={t('allDifficulties')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('allDifficulties')}</SelectItem>
                      {difficulties.map(d => (
                        <SelectItem key={d} value={d}>{t(d)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                    <CalendarIcon className="w-4 h-4 text-purple-500" />
                    {t('duration')}
                  </Label>
                  <Select 
                    value={filters.duration_type || ''} 
                    onValueChange={(v) => handleFilterChange('duration_type', v === 'all' ? '' : v)}
                  >
                    <SelectTrigger className="h-11 bg-gray-50/50">
                      <SelectValue placeholder={t('allDurations')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('allDurations')}</SelectItem>
                      {durations.map(d => (
                        <SelectItem key={d} value={d}>{t(d)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Activity Type */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                    <Sparkles className="w-4 h-4 text-pink-500" />
                    {t('activityType')}
                  </Label>
                  <Select 
                    value={filters.activity_type || ''} 
                    onValueChange={(v) => handleFilterChange('activity_type', v === 'all' ? '' : v)}
                  >
                    <SelectTrigger className="h-11 bg-gray-50/50">
                      <SelectValue placeholder={t('activityType')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{language === 'he' ? 'כל הסוגים' : 'All Types'}</SelectItem>
                      {activityTypes.map(a => (
                        <SelectItem key={a} value={a}>{t(a)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-6">
                {/* Trail Types */}
                <div>
                  <Label className="text-sm font-semibold flex items-center gap-2 mb-3 text-gray-700">
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    {t('trailType')}
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {trailTypes.map(type => (
                      <Badge
                        key={type}
                        variant={filters.trail_type?.includes(type) ? 'default' : 'outline'}
                        className={`cursor-pointer transition-all ${
                          filters.trail_type?.includes(type) 
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0' 
                            : 'hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50'
                        }`}
                        onClick={() => {
                          const current = filters.trail_type || [];
                          const updated = current.includes(type) 
                            ? current.filter(t => t !== type)
                            : [...current, type];
                          handleFilterChange('trail_type', updated);
                        }}
                      >
                        {t(type)}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Interests */}
                <div>
                  <Label className="text-sm font-semibold flex items-center gap-2 mb-3 text-gray-700">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    {t('interests')}
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {interests.map(interest => (
                      <Badge
                        key={interest}
                        variant={filters.interests?.includes(interest) ? 'default' : 'outline'}
                        className={`cursor-pointer transition-all ${
                          filters.interests?.includes(interest) 
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0' 
                            : 'hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50'
                        }`}
                        onClick={() => {
                          const current = filters.interests || [];
                          const updated = current.includes(interest) 
                            ? current.filter(i => i !== interest)
                            : [...current, interest];
                          handleFilterChange('interests', updated);
                        }}
                      >
                        {t(interest)}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Boolean Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-all cursor-pointer bg-gray-50/50">
                    <Checkbox
                      id="pets"
                      checked={filters.pets_allowed || false}
                      onCheckedChange={(checked) => handleFilterChange('pets_allowed', checked)}
                      className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                    />
                    <Label htmlFor="pets" className="cursor-pointer font-medium text-sm">{t('petsAllowed')}</Label>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-all cursor-pointer bg-gray-50/50">
                    <Checkbox
                      id="camping"
                      checked={filters.camping_available || false}
                      onCheckedChange={(checked) => handleFilterChange('camping_available', checked)}
                      className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                    />
                    <Label htmlFor="camping" className="cursor-pointer font-medium text-sm">{t('campingAvailable')}</Label>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-all cursor-pointer bg-gray-50/50">
                    <Checkbox
                      id="available_spots"
                      checked={filters.available_spots || false}
                      onCheckedChange={(checked) => handleFilterChange('available_spots', checked)}
                      className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                    />
                    <Label htmlFor="available_spots" className="cursor-pointer font-medium text-sm">
                      {language === 'he' ? 'מקומות פנויים' : 'Available Spots'}
                    </Label>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <Button 
                  onClick={() => setIsOpen(false)} 
                  className="w-full sm:w-auto px-8 h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {t('apply')}
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filters Display */}
      <AnimatePresence>
        {activeFiltersCount > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2"
          >
            {filters.country && (
              <Badge className="pl-3 pr-2 py-1.5 gap-2 bg-white border-2 border-emerald-100 text-emerald-700 hover:bg-emerald-50">
                {t(filters.country)}
                <X 
                  className="w-3 h-3 cursor-pointer hover:text-red-500" 
                  onClick={() => {
                    handleFilterChange('country', '');
                    handleFilterChange('region', '');
                  }} 
                />
              </Badge>
            )}
            {filters.region && (
              <Badge className="pl-3 pr-2 py-1.5 gap-2 bg-white border-2 border-blue-100 text-blue-700 hover:bg-blue-50">
                {t(filters.region)}
                <X 
                  className="w-3 h-3 cursor-pointer hover:text-red-500" 
                  onClick={() => handleFilterChange('region', '')} 
                />
              </Badge>
            )}
            {filters.difficulty && (
              <Badge className="pl-3 pr-2 py-1.5 gap-2 bg-white border-2 border-orange-100 text-orange-700 hover:bg-orange-50">
                {t(filters.difficulty)}
                <X 
                  className="w-3 h-3 cursor-pointer hover:text-red-500" 
                  onClick={() => handleFilterChange('difficulty', '')} 
                />
              </Badge>
            )}
            {filters.activity_type && (
              <Badge className="pl-3 pr-2 py-1.5 gap-2 bg-white border-2 border-pink-100 text-pink-700 hover:bg-pink-50">
                {t(filters.activity_type)}
                <X 
                  className="w-3 h-3 cursor-pointer hover:text-red-500" 
                  onClick={() => handleFilterChange('activity_type', '')} 
                />
              </Badge>
            )}
            {filters.trail_type?.map(type => (
              <Badge key={type} className="pl-3 pr-2 py-1.5 gap-2 bg-white border-2 border-teal-100 text-teal-700 hover:bg-teal-50">
                {t(type)}
                <X 
                  className="w-3 h-3 cursor-pointer hover:text-red-500" 
                  onClick={() => handleFilterChange('trail_type', filters.trail_type.filter(t => t !== type))} 
                />
              </Badge>
            ))}
            {filters.interests?.map(interest => (
              <Badge key={interest} className="pl-3 pr-2 py-1.5 gap-2 bg-white border-2 border-indigo-100 text-indigo-700 hover:bg-indigo-50">
                {t(interest)}
                <X 
                  className="w-3 h-3 cursor-pointer hover:text-red-500" 
                  onClick={() => handleFilterChange('interests', filters.interests.filter(i => i !== interest))} 
                />
              </Badge>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}