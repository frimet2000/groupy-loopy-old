import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLanguage } from '../../LanguageContext';
import { Calendar, CheckCircle2, AlertCircle, MapPin, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function DayCardsSelector({ trekDays, linkedDaysPairs, selectedDays, onDaysChange, maxDays = 8 }) {
  const { language, isRTL } = useLanguage();

  const translations = {
    he: {
      title: "בחרו את הימים שלכם",
      subtitle: "לחצו על הכרטיסים כדי לבחור ימים",
      selected: "נבחר",
      pair: "זוג",
      maxReached: "הגעתם למקסימום ימים",
      day: "יום"
    },
    en: {
      title: "Choose Your Days",
      subtitle: "Click on cards to select days",
      selected: "Selected",
      pair: "Pair",
      maxReached: "Maximum days reached",
      day: "Day"
    },
    ru: {
      title: "Выберите дни",
      subtitle: "Нажмите на карточки для выбора дней",
      selected: "Выбрано",
      pair: "Пара",
      maxReached: "Достигнут максимум",
      day: "День"
    },
    es: {
      title: "Elige tus días",
      subtitle: "Haz clic en las tarjetas para seleccionar días",
      selected: "Seleccionado",
      pair: "Par",
      maxReached: "Máximo alcanzado",
      day: "Día"
    },
    fr: {
      title: "Choisissez vos jours",
      subtitle: "Cliquez sur les cartes pour sélectionner les jours",
      selected: "Sélectionné",
      pair: "Paire",
      maxReached: "Maximum atteint",
      day: "Jour"
    },
    de: {
      title: "Wählen Sie Ihre Tage",
      subtitle: "Klicken Sie auf die Karten, um Tage auszuwählen",
      selected: "Ausgewählt",
      pair: "Paar",
      maxReached: "Maximum erreicht",
      day: "Tag"
    },
    it: {
      title: "Scegli i tuoi giorni",
      subtitle: "Clicca sulle carte per selezionare i giorni",
      selected: "Selezionato",
      pair: "Coppia",
      maxReached: "Massimo raggiunto",
      day: "Giorno"
    }
  };

  const trans = translations[language] || translations.en;

  const handleDayToggle = (day) => {
    const isSelected = selectedDays.some(d => d.day_number === day.day_number);
    const linkedPair = linkedDaysPairs.find(pair => pair.includes(day.day_number));

    if (isSelected) {
      // Deselect
      if (linkedPair) {
        const linkedDayNumber = linkedPair.find(num => num !== day.day_number);
        onDaysChange(selectedDays.filter(d => !linkedPair.includes(d.day_number)));
      } else {
        onDaysChange(selectedDays.filter(d => d.day_number !== day.day_number));
      }
    } else {
      // Select
      if (linkedPair) {
        const linkedDay = trekDays.find(d => linkedPair.find(num => num !== day.day_number) === d.day_number);
        if (selectedDays.length + 2 > maxDays) return;
        onDaysChange([...selectedDays, day, linkedDay].filter(Boolean));
      } else {
        if (selectedDays.length >= maxDays) return;
        onDaysChange([...selectedDays, day]);
      }
    }
  };

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <CardTitle className="text-2xl">{trans.title}</CardTitle>
        <p className="text-sm text-white/90">{trans.subtitle}</p>
        <div className="flex items-center gap-4 mt-3">
          <Badge className="bg-white/20 text-white text-base px-4 py-2">
            {trans.selected}: {selectedDays.length}/{maxDays}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {selectedDays.length >= maxDays && (
          <Alert className="mb-4 bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{trans.maxReached}</AlertDescription>
          </Alert>
        )}

        <ScrollArea className="h-[500px] pr-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {trekDays.map((day, idx) => {
              const isSelected = selectedDays.some(d => d.day_number === day.day_number);
              const linkedPair = linkedDaysPairs.find(pair => pair.includes(day.day_number));
              const isLinked = !!linkedPair;
              const canSelect = isSelected || selectedDays.length < maxDays;

              return (
                <motion.div
                  key={day.day_number}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card
                    className={`cursor-pointer transition-all ${
                      isSelected
                        ? 'border-4 border-blue-500 shadow-2xl scale-105'
                        : canSelect
                        ? 'hover:border-blue-300 hover:shadow-lg hover:scale-102'
                        : 'opacity-50 cursor-not-allowed'
                    } ${isLinked ? 'border-l-8 border-l-purple-500' : ''}`}
                    onClick={() => canSelect && handleDayToggle(day)}
                  >
                    {day.image_url && (
                      <div className="relative h-40 overflow-hidden rounded-t-lg">
                        <img
                          src={day.image_url}
                          alt={day.daily_title}
                          className="w-full h-full object-cover"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-blue-600/40 flex items-center justify-center">
                            <CheckCircle2 className="w-16 h-16 text-white" />
                          </div>
                        )}
                        {isLinked && (
                          <Badge className="absolute top-2 right-2 bg-purple-600">
                            {trans.pair}
                          </Badge>
                        )}
                      </div>
                    )}
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span className="font-bold text-blue-600">
                          {trans.day} {day.day_number}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg mb-2">{day.daily_title}</h3>
                      {day.daily_description && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {day.daily_description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" />
                        <span>{new Date(day.date).toLocaleDateString(language === 'he' ? 'he-IL' : language === 'ru' ? 'ru-RU' : language === 'es' ? 'es-ES' : language === 'fr' ? 'fr-FR' : language === 'de' ? 'de-DE' : language === 'it' ? 'it-IT' : 'en-US')}</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}