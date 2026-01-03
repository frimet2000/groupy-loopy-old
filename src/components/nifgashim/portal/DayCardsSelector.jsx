import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Mountain, CheckCircle2, Info, X } from 'lucide-react';
import { useLanguage } from '../../LanguageContext';
import { cn } from '@/lib/utils';

export default function NifgashimDayCardsSelector({ 
  trekDays = [], 
  linkedDaysPairs = [], 
  selectedDays = [], 
  onDaysChange,
  maxDays = 8 
}) {
  const { language, isRTL } = useLanguage();
  const [selectedDayForInfo, setSelectedDayForInfo] = useState(null);

  const translations = {
    he: {
      selectDays: "בחר את ימי המסע שלך",
      selected: "נבחרו",
      days: "ימים",
      maxReached: `ניתן לבחור עד ${maxDays} ימים`,
      difficulty: {
        easy: "קל",
        moderate: "בינוני",
        hard: "קשה"
      },
      km: "ק״מ",
      meters: "מ׳ טיפוס",
      readMore: "קרא עוד",
      close: "סגור"
    },
    en: {
      selectDays: "Select Your Trek Days",
      selected: "Selected",
      days: "days",
      maxReached: `You can select up to ${maxDays} days`,
      difficulty: {
        easy: "Easy",
        moderate: "Moderate",
        hard: "Hard"
      },
      km: "km",
      meters: "m climb",
      readMore: "Read More",
      close: "Close"
    }
  };

  const trans = translations[language] || translations.en;

  const isSelected = (dayId) => {
    return selectedDays.some(d => d.id === dayId);
  };

  const isMaxReached = selectedDays.length >= maxDays;

  const handleDayToggle = (day) => {
    const currentlySelected = isSelected(day.id);
    
    // If max reached and we are trying to select a new day (not deselecting), return
    if (isMaxReached && !currentlySelected) {
      return;
    }

    let newSelected = [...selectedDays];

    // Find if this day is part of any linked pair
    const relevantPairs = linkedDaysPairs.filter(pair => {
      if (Array.isArray(pair)) {
        return pair.includes(day.id);
      }
      return pair?.day_id_1 === day.id || pair?.day_id_2 === day.id;
    });

    const getLinkedIds = (id) => {
      const ids = new Set();
      relevantPairs.forEach(pair => {
        if (Array.isArray(pair)) {
          pair.forEach(pId => ids.add(pId));
        } else {
          ids.add(pair.day_id_1);
          ids.add(pair.day_id_2);
        }
      });
      return Array.from(ids);
    };

    const linkedIds = getLinkedIds(day.id);

    if (currentlySelected) {
      // Deselect logic
      // If we deselect a day, we must deselect all linked days
      if (linkedIds.length > 0) {
        newSelected = newSelected.filter(d => !linkedIds.includes(d.id));
      } else {
        newSelected = newSelected.filter(d => d.id !== day.id);
      }
    } else {
      // Select logic
      // Check if we can add the days (considering maxDays)
      const daysToAdd = [];
      
      // Always add the clicked day
      daysToAdd.push(day);

      // Add linked days if not already selected
      if (linkedIds.length > 0) {
        linkedIds.forEach(id => {
          if (id !== day.id && !newSelected.some(d => d.id === id)) {
            const dayObj = trekDays.find(td => td.id === id);
            if (dayObj) daysToAdd.push(dayObj);
          }
        });
      }

      if (newSelected.length + daysToAdd.length > maxDays) {
        // Cannot select - would exceed limit
        return; 
      }

      newSelected = [...newSelected, ...daysToAdd];
    }

    onDaysChange(newSelected);
  };

  // Helper to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(language === 'he' ? 'he-IL' : 'en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{trans.selectDays}</h2>
        <div className={cn(
          "px-4 py-2 rounded-full text-sm font-bold transition-colors",
          isMaxReached ? "bg-red-100 text-red-700" : "bg-blue-50 text-blue-700"
        )}>
          {selectedDays.length} / {maxDays} {trans.selected}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {trekDays.map((day) => {
          const selected = isSelected(day.id);
          const isDisabled = !selected && isMaxReached;
          const isLinked = linkedDaysPairs.some(pair => 
            Array.isArray(pair) ? pair.includes(day.id) : (pair.day_id_1 === day.id || pair.day_id_2 === day.id)
          );
          
          const imageUrl = typeof day.image === 'string' ? day.image : day.image?.secure_url;

          return (
            <motion.div
              key={day.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ 
                opacity: isDisabled ? 0.5 : 1, 
                scale: 1,
                filter: isDisabled ? 'grayscale(100%)' : 'grayscale(0%)'
              }}
              whileHover={!isDisabled ? { scale: 1.02 } : {}}
              className={cn(
                "relative rounded-xl border-2 transition-all duration-200 overflow-hidden flex flex-col h-full bg-white",
                selected 
                  ? "border-blue-600 shadow-md ring-1 ring-blue-600" 
                  : "border-gray-200 hover:border-blue-300 hover:shadow-sm",
                isDisabled && "cursor-not-allowed border-gray-100 bg-gray-50"
              )}
            >
              {/* Image Section */}
              <div 
                className="relative h-48 w-full bg-gray-200 cursor-pointer group"
                onClick={() => !isDisabled && handleDayToggle(day)}
              >
                {imageUrl ? (
                  <img 
                    src={imageUrl} 
                    alt={day.daily_title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                    <Mountain className="w-12 h-12 opacity-20" />
                  </div>
                )}
                
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />

                {/* Info Button - Opens Modal */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDayForInfo(day);
                  }}
                  className="absolute top-3 left-3 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-colors z-10"
                >
                  <Info className="w-5 h-5" />
                </button>

                {/* Linked Badge */}
                {isLinked && (
                  <div className={`absolute top-3 ${isRTL ? 'left-12' : 'right-12'} bg-purple-500/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full shadow-sm`}>
                    {language === 'he' ? 'צמד' : 'Linked'}
                  </div>
                )}

                {/* Selected Checkmark */}
                {selected && (
                  <div className={`absolute top-3 ${isRTL ? 'left-auto right-3' : 'right-3'} bg-blue-600 text-white rounded-full p-1 shadow-lg`}>
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                )}
                
                {/* Date on Image */}
                <div className="absolute bottom-3 left-4 text-white font-medium flex items-center gap-2">
                   <Calendar className="w-4 h-4" />
                   {formatDate(day.date)}
                </div>
              </div>

              {/* Content Section */}
              <div 
                className="p-4 flex-1 flex flex-col cursor-pointer"
                onClick={() => !isDisabled && handleDayToggle(day)}
              >
                <h3 className="font-bold text-lg mb-2 leading-tight">{day.daily_title}</h3>
                
                <div className="mt-auto pt-3 flex items-center justify-between text-sm text-gray-600 border-t border-gray-100">
                  <div className="flex items-center gap-1.5" title={trans.difficulty[day.difficulty]}>
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      day.difficulty === 'easy' ? 'bg-green-500' :
                      day.difficulty === 'moderate' ? 'bg-yellow-500' :
                      'bg-red-500'
                    )} />
                    <span>{day.difficulty ? (trans.difficulty[day.difficulty] || day.difficulty) : '-'}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{day.daily_distance_km} {trans.km}</span>
                    </div>
                    {day.elevation_gain_m > 0 && (
                        <div className="flex items-center gap-1">
                            <Mountain className="w-3.5 h-3.5" />
                            <span>{day.elevation_gain_m}m</span>
                        </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Day Details Modal */}
      <AnimatePresence>
        {selectedDayForInfo && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDayForInfo(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              {/* Modal Content */}
              <motion.div
                layoutId={`day-card-${selectedDayForInfo.id}`}
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative"
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedDayForInfo(null)}
                  className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Hero Image */}
                <div className="relative h-64 w-full">
                  {(typeof selectedDayForInfo.image === 'string' ? selectedDayForInfo.image : selectedDayForInfo.image?.secure_url) ? (
                    <img 
                      src={typeof selectedDayForInfo.image === 'string' ? selectedDayForInfo.image : selectedDayForInfo.image?.secure_url} 
                      alt={selectedDayForInfo.daily_title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                       <Mountain className="w-20 h-20 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 p-6 text-white w-full">
                    <div className="flex items-center gap-2 text-sm opacity-90 mb-2">
                        <Calendar className="w-4 h-4" />
                        {formatDate(selectedDayForInfo.date)}
                    </div>
                    <h2 className="text-3xl font-bold">{selectedDayForInfo.daily_title}</h2>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                  {/* Stats Row */}
                  <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-3 h-3 rounded-full",
                          selectedDayForInfo.difficulty === 'easy' ? 'bg-green-500' :
                          selectedDayForInfo.difficulty === 'moderate' ? 'bg-yellow-500' :
                          'bg-red-500'
                        )} />
                        <span className="font-medium">
                            {trans.difficulty[selectedDayForInfo.difficulty] || selectedDayForInfo.difficulty}
                        </span>
                    </div>
                    <div className="w-px h-6 bg-gray-300" />
                    <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-gray-500" />
                        <span className="font-medium">{selectedDayForInfo.daily_distance_km} {trans.km}</span>
                    </div>
                    <div className="w-px h-6 bg-gray-300" />
                    <div className="flex items-center gap-2">
                        <Mountain className="w-5 h-5 text-gray-500" />
                        <span className="font-medium">{selectedDayForInfo.elevation_gain_m} {trans.meters}</span>
                    </div>
                  </div>

                  {/* Description */}
                  {selectedDayForInfo.description && (
                    <div className="prose max-w-none text-gray-700 leading-relaxed">
                      <div dangerouslySetInnerHTML={{ 
                        __html: selectedDayForInfo.description.includes('<') 
                          ? selectedDayForInfo.description 
                          : selectedDayForInfo.description.replace(/\n/g, '<br/>') 
                      }} />
                    </div>
                  )}

                  {!selectedDayForInfo.description && (
                    <p className="text-gray-500 italic text-center py-8">
                      {language === 'he' ? 'אין מידע נוסף על יום זה' : 'No additional information for this day'}
                    </p>
                  )}
                </div>

              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}