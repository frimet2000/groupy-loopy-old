import React, { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SlidersHorizontal, X, Search, RotateCcw, Sparkles, MapPin, Calendar as CalendarIcon, TrendingUp } from 'lucide-react';
import { getAllCountries, getCountryRegions } from '../utils/CountryRegions';
import { motion, AnimatePresence } from 'framer-motion';
const difficulties = ['easy', 'moderate', 'challenging', 'hard'];
const durations = ['hours', 'half_day', 'full_day', 'overnight', 'multi_day'];
const activityTypes = ['hiking', 'cycling', 'offroad'];
const trailTypes = ['water', 'full_shade', 'partial_shade', 'desert', 'forest', 'coastal', 'mountain', 'historical', 'urban'];
const interests = ['nature', 'history', 'photography', 'birdwatching', 'archaeology', 'geology', 'botany', 'extreme_sports', 'family_friendly', 'romantic'];

export default function TripFilters({ filters, setFilters, onSearch = () => {}, showAdvanced }) {
  const { t, isRTL, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [countrySearch, setCountrySearch] = useState('');
  
  const countries = getAllCountries().sort((a, b) => t(a).localeCompare(t(b)));
  const regions = filters.country ? getCountryRegions(filters.country) : getCountryRegions('israel');
  const filteredCountries = countries.filter(c => 
    t(c).toLowerCase().includes(countrySearch.toLowerCase())
  );

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleFilterChange('search', searchTerm);
  };

  const activeFiltersCount = Object.keys(filters).filter(k => 
    filters[k] && (Array.isArray(filters[k]) ? filters[k].length > 0 : true)
  ).length;

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-3">
        <motion.div 
          className="relative flex-1"
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2`}>
            <motion.div 
              className="p-2 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl shadow-lg"
              animate={{ 
                boxShadow: ['0 0 0 0 rgba(16,185,129,0.4)', '0 0 0 8px rgba(16,185,129,0)', '0 0 0 0 rgba(16,185,129,0)']
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Search className="w-5 h-5 text-white" />
            </motion.div>
          </div>
          <Input
            placeholder={t('search') + '...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`${isRTL ? 'pr-16 md:pr-20' : 'pl-16 md:pl-20'} h-12 md:h-14 text-base bg-white/90 backdrop-blur-xl border-2 border-gray-200/50 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 rounded-2xl shadow-lg hover:shadow-xl transition-all font-medium`}
          />
        </motion.div>
        
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                variant="outline" 
                className="h-12 md:h-14 px-4 md:px-6 bg-gradient-to-r from-white to-gray-50/80 backdrop-blur-xl border-2 border-gray-200/50 hover:border-emerald-400 hover:from-emerald-50 hover:to-teal-50 rounded-2xl shadow-lg hover:shadow-xl transition-all group"
              >
                <motion.div 
                  className="p-1.5 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl shadow-md"
                  whileHover={{ rotate: 90 }}
                  transition={{ duration: 0.3 }}
                >
                  <SlidersHorizontal className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </motion.div>
                <span className="hidden sm:inline ml-2 font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  {t('filter')}
                </span>
                {activeFiltersCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-2"
                  >
                    <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg px-2.5 py-0.5 font-bold">
                      {activeFiltersCount}
                    </Badge>
                  </motion.div>
                )}
              </Button>
            </motion.div>
          </SheetTrigger>
          
          <SheetContent side={isRTL ? 'right' : 'left'} className="w-full sm:max-w-md overflow-y-auto bg-gradient-to-br from-gray-50 to-white z-[100]">
            <SheetHeader className="mb-6">
              <SheetTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    {t('filter')}
                  </span>
                </div>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearFilters} 
                    className="text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl"
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    {t('clear')}
                  </Button>
                </motion.div>
              </SheetTitle>
            </SheetHeader>
            
            <div className="space-y-5">
              {/* Country */}
              <Card className="p-4 bg-white/80 backdrop-blur-sm border-2 border-gray-100 shadow-md hover:shadow-lg transition-all">
                <Label className="text-sm font-bold flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  {t('country')}
                </Label>
                <div className="space-y-2">
                  <Input
                    placeholder={
                      language === 'he' ? 'חפש מדינה...' :
                      language === 'ru' ? 'Поиск страны...' :
                      language === 'es' ? 'Buscar país...' :
                      language === 'fr' ? 'Rechercher pays...' :
                      language === 'de' ? 'Land suchen...' :
                      language === 'it' ? 'Cerca paese...' :
                      'Search country...'
                    }
                    value={countrySearch}
                    onChange={(e) => setCountrySearch(e.target.value)}
                    className="h-10 border-2 hover:border-emerald-300 rounded-xl"
                    dir={isRTL ? 'rtl' : 'ltr'}
                  />
                  <Select 
                    value={filters.country || 'israel'} 
                    onValueChange={(v) => {
                      handleFilterChange('country', v);
                      if (v !== filters.country) {
                        handleFilterChange('region', '');
                      }
                      setCountrySearch('');
                    }}
                  >
                    <SelectTrigger className="h-12 border-2 hover:border-emerald-400 rounded-xl transition-all">
                      <SelectValue placeholder={t('selectCountry')} />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px] z-[150]">
                      {filteredCountries.map(c => (
                        <SelectItem key={c} value={c}>{t(c)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </Card>

              {/* Region */}
              <Card className="p-4 bg-white/80 backdrop-blur-sm border-2 border-gray-100 shadow-md hover:shadow-lg transition-all">
                <Label className="text-sm font-bold flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  {t('region')}
                </Label>
                <Select 
                  value={filters.region || ''} 
                  onValueChange={(v) => handleFilterChange('region', v === 'all' ? '' : v)}
                >
                  <SelectTrigger className="h-12 border-2 hover:border-blue-400 rounded-xl transition-all">
                    <SelectValue placeholder={t('allRegions')} />
                  </SelectTrigger>
                  <SelectContent className="z-[150]">
                    <SelectItem value="all">{t('allRegions')}</SelectItem>
                    {regions.map(r => (
                      <SelectItem key={r} value={r}>{t(r)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Card>

              {/* Difficulty */}
              <Card className="p-4 bg-white/80 backdrop-blur-sm border-2 border-gray-100 shadow-md hover:shadow-lg transition-all">
                <Label className="text-sm font-bold flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-orange-600" />
                  {t('difficulty')}
                </Label>
                <Select 
                  value={filters.difficulty || ''} 
                  onValueChange={(v) => handleFilterChange('difficulty', v === 'all' ? '' : v)}
                >
                  <SelectTrigger className="h-12 border-2 hover:border-orange-400 rounded-xl transition-all">
                    <SelectValue placeholder={t('allDifficulties')} />
                  </SelectTrigger>
                  <SelectContent className="z-[150]">
                    <SelectItem value="all">{t('allDifficulties')}</SelectItem>
                    {difficulties.map(d => (
                      <SelectItem key={d} value={d}>{t(d)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Card>

              {/* Duration */}
              <Card className="p-4 bg-white/80 backdrop-blur-sm border-2 border-gray-100 shadow-md hover:shadow-lg transition-all">
                <Label className="text-sm font-bold flex items-center gap-2 mb-3">
                  <CalendarIcon className="w-4 h-4 text-purple-600" />
                  {t('duration')}
                </Label>
                <Select 
                  value={filters.duration_type || ''} 
                  onValueChange={(v) => handleFilterChange('duration_type', v === 'all' ? '' : v)}
                >
                  <SelectTrigger className="h-12 border-2 hover:border-purple-400 rounded-xl transition-all">
                    <SelectValue placeholder={t('allDurations')} />
                  </SelectTrigger>
                  <SelectContent className="z-[150]">
                    <SelectItem value="all">{t('allDurations')}</SelectItem>
                    {durations.map(d => (
                      <SelectItem key={d} value={d}>{t(d)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Card>

              {/* Activity Type */}
              <Card className="p-4 bg-white/80 backdrop-blur-sm border-2 border-gray-100 shadow-md hover:shadow-lg transition-all">
                <Label className="text-sm font-bold flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-pink-600" />
                  {t('activityType')}
                </Label>
                <Select 
                  value={filters.activity_type || ''} 
                  onValueChange={(v) => handleFilterChange('activity_type', v === 'all' ? '' : v)}
                >
                  <SelectTrigger className="h-12 border-2 hover:border-pink-400 rounded-xl transition-all">
                    <SelectValue placeholder={t('activityType')} />
                  </SelectTrigger>
                  <SelectContent className="z-[150]">
                    <SelectItem value="all">{language === 'he' ? 'כל הסוגים' : 'All Types'}</SelectItem>
                    {activityTypes.map(a => (
                      <SelectItem key={a} value={a}>{t(a)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Card>

              {/* Date Range */}
              <Card className="p-4 bg-white/80 backdrop-blur-sm border-2 border-gray-100 shadow-md hover:shadow-lg transition-all">
                <Label className="text-sm font-bold flex items-center gap-2 mb-3">
                  <CalendarIcon className="w-4 h-4 text-indigo-600" />
                  {t('dateRange')}
                </Label>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-gray-600">{t('from')}</Label>
                    <Input
                      type="date"
                      value={filters.date_from || ''}
                      onChange={(e) => handleFilterChange('date_from', e.target.value)}
                      className="h-11 border-2 hover:border-indigo-400 rounded-xl transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-gray-600">{t('to')}</Label>
                    <Input
                      type="date"
                      value={filters.date_to || ''}
                      onChange={(e) => handleFilterChange('date_to', e.target.value)}
                      className="h-11 border-2 hover:border-indigo-400 rounded-xl transition-all"
                    />
                  </div>
                </div>
              </Card>

              {/* Trail Types */}
              <Card className="p-4 bg-white/80 backdrop-blur-sm border-2 border-gray-100 shadow-md hover:shadow-lg transition-all">
                <Label className="text-sm font-bold flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  {t('trailType')}
                </Label>
                <div className="flex flex-wrap gap-2">
                  {trailTypes.map(type => (
                    <motion.div
                      key={type}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Badge
                        variant={filters.trail_type?.includes(type) ? 'default' : 'outline'}
                        className={`cursor-pointer transition-all shadow-sm ${
                          filters.trail_type?.includes(type) 
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg' 
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
                    </motion.div>
                  ))}
                </div>
              </Card>

              {/* Interests */}
              <Card className="p-4 bg-white/80 backdrop-blur-sm border-2 border-gray-100 shadow-md hover:shadow-lg transition-all">
                <Label className="text-sm font-bold flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  {t('interests')}
                </Label>
                <div className="flex flex-wrap gap-2">
                  {interests.map(interest => (
                    <motion.div
                      key={interest}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Badge
                        variant={filters.interests?.includes(interest) ? 'default' : 'outline'}
                        className={`cursor-pointer transition-all shadow-sm ${
                          filters.interests?.includes(interest) 
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg' 
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
                    </motion.div>
                  ))}
                </div>
              </Card>

              {/* Boolean Filters */}
              <Card className="p-4 bg-white/80 backdrop-blur-sm border-2 border-gray-100 shadow-md hover:shadow-lg transition-all">
                <div className="space-y-4">
                  <motion.div 
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all cursor-pointer"
                    whileHover={{ x: 5 }}
                  >
                    <Checkbox
                      id="pets"
                      checked={filters.pets_allowed || false}
                      onCheckedChange={(checked) => handleFilterChange('pets_allowed', checked)}
                      className="data-[state=checked]:bg-gradient-to-br data-[state=checked]:from-emerald-500 data-[state=checked]:to-teal-600 border-2"
                    />
                    <Label htmlFor="pets" className="cursor-pointer font-medium">{t('petsAllowed')}</Label>
                  </motion.div>
                  
                  <motion.div 
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all cursor-pointer"
                    whileHover={{ x: 5 }}
                  >
                    <Checkbox
                      id="camping"
                      checked={filters.camping_available || false}
                      onCheckedChange={(checked) => handleFilterChange('camping_available', checked)}
                      className="data-[state=checked]:bg-gradient-to-br data-[state=checked]:from-emerald-500 data-[state=checked]:to-teal-600 border-2"
                    />
                    <Label htmlFor="camping" className="cursor-pointer font-medium">{t('campingAvailable')}</Label>
                  </motion.div>

                  <motion.div 
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all cursor-pointer"
                    whileHover={{ x: 5 }}
                  >
                    <Checkbox
                      id="available_spots"
                      checked={filters.available_spots || false}
                      onCheckedChange={(checked) => handleFilterChange('available_spots', checked)}
                      className="data-[state=checked]:bg-gradient-to-br data-[state=checked]:from-emerald-500 data-[state=checked]:to-teal-600 border-2"
                    />
                    <Label htmlFor="available_spots" className="cursor-pointer font-medium">
                      {language === 'he' ? 'רק טיולים עם מקומות פנויים' : 'Only trips with available spots'}
                    </Label>
                  </motion.div>
                </div>
              </Card>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  onClick={() => setIsOpen(false)} 
                  className="w-full h-14 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all mt-4"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  {t('apply')}
                </Button>
              </motion.div>
            </div>
          </SheetContent>
        </Sheet>
      </form>

      {/* Active Filters Display */}
      <AnimatePresence>
        {activeFiltersCount > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2 p-4 bg-gradient-to-r from-gray-50 to-white rounded-2xl border-2 border-gray-100 shadow-md"
          >
            {filters.country && filters.country !== 'israel' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Badge className="pl-3 pr-2 py-2 gap-2 bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-md hover:shadow-lg transition-all">
                  {t(filters.country)}
                  <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.8 }}>
                    <X 
                      className="w-4 h-4 cursor-pointer hover:bg-white/20 rounded-full" 
                      onClick={() => {
                        handleFilterChange('country', 'israel');
                        handleFilterChange('region', '');
                      }} 
                    />
                  </motion.div>
                </Badge>
              </motion.div>
            )}
            {filters.region && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Badge className="pl-3 pr-2 py-2 gap-2 bg-gradient-to-r from-blue-400 to-indigo-500 text-white shadow-md hover:shadow-lg transition-all">
                  {t(filters.region)}
                  <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.8 }}>
                    <X 
                      className="w-4 h-4 cursor-pointer hover:bg-white/20 rounded-full" 
                      onClick={() => handleFilterChange('region', '')} 
                    />
                  </motion.div>
                </Badge>
              </motion.div>
            )}
            {filters.difficulty && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Badge className="pl-3 pr-2 py-2 gap-2 bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-md hover:shadow-lg transition-all">
                  {t(filters.difficulty)}
                  <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.8 }}>
                    <X 
                      className="w-4 h-4 cursor-pointer hover:bg-white/20 rounded-full" 
                      onClick={() => handleFilterChange('difficulty', '')} 
                    />
                  </motion.div>
                </Badge>
              </motion.div>
            )}
            {filters.activity_type && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Badge className="pl-3 pr-2 py-2 gap-2 bg-gradient-to-r from-pink-400 to-purple-500 text-white shadow-md hover:shadow-lg transition-all">
                  {t(filters.activity_type)}
                  <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.8 }}>
                    <X 
                      className="w-4 h-4 cursor-pointer hover:bg-white/20 rounded-full" 
                      onClick={() => handleFilterChange('activity_type', '')} 
                    />
                  </motion.div>
                </Badge>
              </motion.div>
            )}
            {filters.date_from && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Badge className="pl-3 pr-2 py-2 gap-2 bg-gradient-to-r from-indigo-400 to-purple-500 text-white shadow-md hover:shadow-lg transition-all">
                  {language === 'he' ? 'מ-' : 'From '}{filters.date_from}
                  <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.8 }}>
                    <X 
                      className="w-4 h-4 cursor-pointer hover:bg-white/20 rounded-full" 
                      onClick={() => handleFilterChange('date_from', '')} 
                    />
                  </motion.div>
                </Badge>
              </motion.div>
            )}
            {filters.date_to && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Badge className="pl-3 pr-2 py-2 gap-2 bg-gradient-to-r from-indigo-400 to-purple-500 text-white shadow-md hover:shadow-lg transition-all">
                  {language === 'he' ? 'עד-' : 'To '}{filters.date_to}
                  <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.8 }}>
                    <X 
                      className="w-4 h-4 cursor-pointer hover:bg-white/20 rounded-full" 
                      onClick={() => handleFilterChange('date_to', '')} 
                    />
                  </motion.div>
                </Badge>
              </motion.div>
            )}
            {filters.trail_type?.map(type => (
              <motion.div
                key={type}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Badge className="pl-3 pr-2 py-2 gap-2 bg-gradient-to-r from-teal-400 to-cyan-500 text-white shadow-md hover:shadow-lg transition-all">
                  {t(type)}
                  <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.8 }}>
                    <X 
                      className="w-4 h-4 cursor-pointer hover:bg-white/20 rounded-full" 
                      onClick={() => handleFilterChange('trail_type', filters.trail_type.filter(t => t !== type))} 
                    />
                  </motion.div>
                </Badge>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}