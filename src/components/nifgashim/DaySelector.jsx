import React, { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, AlertCircle, CheckCircle2, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DaySelector({ trekDays, selectedDates, onDatesChange, maxNegevDays = 8, maxTotalDays = 30 }) {
  const { language, isRTL } = useLanguage();

  const translations = {
    he: {
      selectDays: "בחירת ימים",
      selected: "נבחר",
      negevLimit: "מגבלת נגב",
      totalLimit: "מגבלה כוללת",
      days: "ימים",
      region: "אזור",
      negev: "נגב",
      north: "צפון",
      center: "מרכז",
      south: "דרום",
      full: "מלא",
      available: "פנוי",
      limitReached: "הגעת למגבלה!"
    },
    en: {
      selectDays: "Select Days",
      selected: "Selected",
      negevLimit: "Negev Limit",
      totalLimit: "Total Limit",
      days: "days",
      region: "Region",
      negev: "Negev",
      north: "North",
      center: "Center",
      south: "South",
      full: "Full",
      available: "Available",
      limitReached: "Limit reached!"
    }
  };

  const trans = translations[language] || translations.en;

  const negevDaysCount = selectedDates.filter(dateStr => {
    const day = trekDays.find(d => d.date === dateStr);
    return day?.region === 'negev';
  }).length;

  const totalDaysCount = selectedDates.length;

  const canSelectNegev = negevDaysCount < maxNegevDays;
  const canSelectTotal = totalDaysCount < maxTotalDays;

  const handleDayToggle = (day) => {
    const isSelected = selectedDates.includes(day.date);
    
    if (isSelected) {
      onDatesChange(selectedDates.filter(d => d !== day.date));
    } else {
      if (!canSelectTotal) return;
      if (day.region === 'negev' && !canSelectNegev) return;
      onDatesChange([...selectedDates, day.date]);
    }
  };

  const getRegionColor = (region) => {
    const colors = {
      negev: 'bg-amber-100 text-amber-800',
      north: 'bg-green-100 text-green-800',
      center: 'bg-blue-100 text-blue-800',
      south: 'bg-red-100 text-red-800'
    };
    return colors[region] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className={negevDaysCount >= maxNegevDays ? 'border-red-300 bg-red-50' : ''}>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-600">
                {negevDaysCount}/{maxNegevDays}
              </div>
              <div className="text-sm text-gray-600">{trans.negevLimit}</div>
            </div>
          </CardContent>
        </Card>

        <Card className={totalDaysCount >= maxTotalDays ? 'border-red-300 bg-red-50' : ''}>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {totalDaysCount}/{maxTotalDays}
              </div>
              <div className="text-sm text-gray-600">{trans.totalLimit}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Days Grid */}
      <div className="grid gap-3">
        {trekDays.map((day, idx) => {
          const isSelected = selectedDates.includes(day.date);
          const isNegev = day.region === 'negev';
          const canSelect = isSelected || (canSelectTotal && (!isNegev || canSelectNegev));
          const isFull = day.current_participants >= day.max_participants;

          return (
            <motion.div
              key={day.id || idx}
              initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card 
                className={`cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-2 border-blue-500 bg-blue-50 shadow-lg' 
                    : canSelect && !isFull
                    ? 'hover:border-blue-300 hover:shadow-md'
                    : 'opacity-50 cursor-not-allowed'
                }`}
                onClick={() => !isFull && canSelect && handleDayToggle(day)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-gray-600" />
                        <span className="font-semibold">
                          {new Date(day.date).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        {day.daily_title || `Day ${idx + 1}`}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge className={getRegionColor(day.region)}>
                          <MapPin className="w-3 h-3 mr-1" />
                          {trans[day.region] || day.region}
                        </Badge>
                        {isFull && (
                          <Badge variant="destructive">{trans.full}</Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center">
                      {isSelected ? (
                        <CheckCircle2 className="w-8 h-8 text-blue-600" />
                      ) : (
                        <div className="w-8 h-8 rounded-full border-2 border-gray-300"></div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Warnings */}
      {!canSelectNegev && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {language === 'he' 
              ? `הגעת למגבלת ${maxNegevDays} ימים בנגב` 
              : `You've reached the ${maxNegevDays} days limit in Negev`}
          </AlertDescription>
        </Alert>
      )}

      {!canSelectTotal && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {language === 'he' 
              ? `הגעת למגבלת ${maxTotalDays} ימים כוללת` 
              : `You've reached the ${maxTotalDays} total days limit`}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}