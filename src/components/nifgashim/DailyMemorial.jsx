import React from 'react';
import { useLanguage } from '../LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Calendar, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DailyMemorial({ memorial, compact = false }) {
  const { language, isRTL } = useLanguage();

  if (!memorial) return null;

  const translations = {
    he: {
      inMemory: "לזכרו/ה של",
      fell: "נפל/ה",
      requestedBy: "הנצחה ע\"י"
    },
    en: {
      inMemory: "In Memory of",
      fell: "Fell",
      requestedBy: "Requested by"
    }
  };

  const trans = translations[language] || translations.en;

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`bg-gradient-to-r from-blue-50 to-purple-50 border-r-4 border-blue-600 p-4 rounded-lg ${isRTL ? 'border-l-4 border-r-0' : ''}`}
      >
        <div className="flex items-start gap-3">
          <Heart className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <div className="font-semibold text-gray-900">{trans.inMemory}</div>
            <div className="text-lg font-bold text-blue-700">{memorial.fallen_name}</div>
            {memorial.date_of_fall && (
              <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                <Calendar className="w-3 h-3" />
                {new Date(memorial.date_of_fall).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US')}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={isRTL ? 'rtl' : 'ltr'}
    >
      <Card className="border-2 border-blue-200 shadow-xl overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"></div>
        <CardHeader className="bg-gradient-to-b from-blue-50 to-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-full bg-blue-100">
              <Heart className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle className="text-xl">{trans.inMemory}</CardTitle>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-blue-700">
            {memorial.fallen_name}
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          {memorial.date_of_fall && (
            <div className="flex items-center gap-2 text-gray-700">
              <Calendar className="w-4 h-4" />
              <span>
                {trans.fell} {new Date(memorial.date_of_fall).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          )}

          {memorial.place_of_fall && (
            <div className="flex items-center gap-2 text-gray-700">
              <MapPin className="w-4 h-4" />
              <span>{memorial.place_of_fall}</span>
            </div>
          )}

          {memorial.story && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {memorial.story}
              </p>
            </div>
          )}

          {memorial.requester_name && (
            <div className="text-sm text-gray-600 pt-4 border-t">
              {trans.requestedBy}: {memorial.requester_name}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}