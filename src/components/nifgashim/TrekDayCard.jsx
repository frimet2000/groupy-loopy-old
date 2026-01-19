// @ts-nocheck
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Heart, Mountain, MapPin, Sunrise, Sunset, TrendingUp, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';

export default function TrekDayCard({ day, memorial, index, onClick, language, isRTL }) {
  const difficultyColors = {
    easy: 'from-green-400 to-emerald-500',
    moderate: 'from-yellow-400 to-orange-500',
    challenging: 'from-orange-500 to-red-500',
    hard: 'from-red-500 to-pink-600',
    extreme: 'from-purple-600 to-pink-700'
  };

  const difficultyLabels = {
    he: {
      easy: 'קל',
      moderate: 'בינוני',
      challenging: 'מאתגר',
      hard: 'קשה',
      extreme: 'אקסטרים'
    },
    en: {
      easy: 'Easy',
      moderate: 'Moderate',
      challenging: 'Challenging',
      hard: 'Hard',
      extreme: 'Extreme'
    }
  };

  const difficultyColor = difficultyColors[day.difficulty] || 'from-gray-400 to-gray-600';
  const difficultyLabel = (difficultyLabels[language] || difficultyLabels.en)[day.difficulty] || day.difficulty;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: index * 0.1, type: 'spring', stiffness: 200 }}
      whileHover={{ scale: 1.03, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <Card className="h-full bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border-2 border-purple-500/30 hover:border-purple-400/60 transition-all duration-300 overflow-hidden group relative">
        {/* Animated Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Memorial Indicator */}
        {memorial && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 + 0.3, type: 'spring' }}
            className="absolute top-4 right-4 z-10"
          >
            <div className="relative">
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-red-500 rounded-full blur-md"
              />
              <Heart className="w-6 h-6 text-red-400 fill-red-400 relative z-10" />
            </div>
          </motion.div>
        )}

        <CardHeader className="relative pb-2">
          {/* Day Number Badge */}
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
            className={`absolute top-4 ${isRTL ? 'right-4' : 'left-4'} w-16 h-16 rounded-full bg-gradient-to-br ${difficultyColor} flex items-center justify-center shadow-lg shadow-purple-500/30`}
          >
            <span className="text-2xl font-black text-white">{day.day_number}</span>
          </motion.div>

          <div className={`${isRTL ? 'mr-20' : 'ml-20'}`}>
            <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
              {day.daily_title || (language === 'he' ? `יום ${day.day_number}` : `Day ${day.day_number}`)}
            </h3>
            
            {day.date && (
              <div className="flex items-center gap-2 text-purple-300 text-sm">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(day.date), 'dd/MM/yyyy')}</span>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-3 relative">
          {/* Description */}
          {day.daily_description && (
            <p className="text-purple-200 text-sm line-clamp-2 leading-relaxed">
              {day.daily_description}
            </p>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {day.daily_distance_km && (
              <div className="flex items-center gap-1.5 px-2 py-1.5 bg-white/5 rounded-lg border border-white/10">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-white font-semibold">{day.daily_distance_km}</span>
                <span className="text-purple-300">{language === 'he' ? 'ק״מ' : 'km'}</span>
              </div>
            )}

            {day.elevation_gain_m && (
              <div className="flex items-center gap-1.5 px-2 py-1.5 bg-white/5 rounded-lg border border-white/10">
                <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                <span className="text-white font-semibold">{day.elevation_gain_m}</span>
                <span className="text-purple-300">{language === 'he' ? 'מ״' : 'm'}</span>
              </div>
            )}

            {day.highest_point_m && (
              <div className="flex items-center gap-1.5 px-2 py-1.5 bg-white/5 rounded-lg border border-white/10">
                <Mountain className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-white font-semibold">{day.highest_point_m}</span>
                <span className="text-purple-300">{language === 'he' ? 'מ״' : 'm'}</span>
              </div>
            )}

            {day.lowest_point_m && (
              <div className="flex items-center gap-1.5 px-2 py-1.5 bg-white/5 rounded-lg border border-white/10">
                <TrendingDown className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-white font-semibold">{day.lowest_point_m}</span>
                <span className="text-purple-300">{language === 'he' ? 'מ״' : 'm'}</span>
              </div>
            )}
          </div>

          {/* Difficulty Badge */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <Badge className={`bg-gradient-to-r ${difficultyColor} text-white border-0 shadow-lg`}>
              {difficultyLabel}
            </Badge>
            
            {memorial && (
              <Badge className="bg-red-500/20 text-red-300 border border-red-500/30">
                {language === 'he' ? 'הנצחה' : 'Memorial'}
              </Badge>
            )}
          </div>

          {/* Click Hint */}
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-center text-purple-400 text-xs pt-2"
          >
            {language === 'he' ? 'לחץ לפרטים מלאים' : 'Click for full details'}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}