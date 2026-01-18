// @ts-nocheck
import React, { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MapPin, TrendingUp, Mountain, Link as LinkIcon } from 'lucide-react';
import { toast } from "sonner";

export default function TrekDaySelector({ trekDays, selectedDays, setSelectedDays, dayPairs = [] }) {
  const { language } = useLanguage();
  const [selectAll, setSelectAll] = useState(false);

  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedDays([0]); // 0 represents entire trek
    } else {
      setSelectedDays([]);
    }
  };

  const handleDayToggle = (dayNumber) => {
    const pair = dayPairs.find(p => p.includes(dayNumber));
    const daysToToggle = pair ? pair : [dayNumber];

    // If "all" is selected, deselect it first and handle the click as a new selection
    if (selectedDays.includes(0)) {
      setSelectAll(false);
      setSelectedDays(daysToToggle);
      if (pair) {
        toast.info(language === 'he' ? 'נבחר צמד ימים' : 'Day pair selected');
      }
      return;
    }

    const isSelected = selectedDays.includes(dayNumber);
    let newSelectedDays;

    if (isSelected) {
      // Deselect
      newSelectedDays = selectedDays.filter(d => !daysToToggle.includes(d));
    } else {
      // Select
      // Filter out duplicates just in case, though usually not needed if logic is correct
      const uniqueDays = new Set([...selectedDays, ...daysToToggle]);
      newSelectedDays = Array.from(uniqueDays);
      
      if (pair) {
        toast.info(language === 'he' ? 'נבחר צמד ימים' : 'Day pair selected');
      }
    }
    
    setSelectedDays(newSelectedDays);
  };

  const sortedDays = [...trekDays].sort((a, b) => a.day_number - b.day_number);

  return (
    <Card className="border-indigo-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">
          {language === 'he' ? 'בחר ימי השתתפות' : language === 'ru' ? 'Выберите дни участия' : language === 'es' ? 'Selecciona días de participación' : language === 'fr' ? 'Sélectionnez les jours de participation' : language === 'de' ? 'Teilnahmetage auswählen' : language === 'it' ? 'Seleziona giorni di partecipazione' : 'Select Participation Days'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Select All Option */}
        <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg border-2 border-indigo-200">
          <Checkbox
            id="all-days"
            checked={selectAll || selectedDays.includes(0)}
            onCheckedChange={handleSelectAll}
          />
          <Label htmlFor="all-days" className="font-semibold text-indigo-900 cursor-pointer flex-1">
            {language === 'he' ? 'כל הטראק' : language === 'ru' ? 'Весь трек' : language === 'es' ? 'Todo el trekking' : language === 'fr' ? 'Tout le trekking' : language === 'de' ? 'Gesamtes Trekking' : language === 'it' ? 'Tutto il trekking' : 'Entire Trek'}
          </Label>
        </div>

        {/* Individual Days */}
        <div className="space-y-2">
          {sortedDays.map((day) => (
            <div
              key={day.id || day.day_number}
              className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                selectedDays.includes(day.day_number) && !selectedDays.includes(0)
                  ? 'bg-indigo-50 border-indigo-300'
                  : 'bg-white border-gray-200 hover:border-indigo-200'
              } ${selectAll || selectedDays.includes(0) ? 'opacity-50' : ''}`}
            >
              <Checkbox
                id={`day-${day.day_number}`}
                checked={selectedDays.includes(day.day_number) || selectedDays.includes(0)}
                onCheckedChange={() => handleDayToggle(day.day_number)}
                disabled={selectAll || selectedDays.includes(0)}
              />
              <div className="flex-1">
                <Label
                  htmlFor={`day-${day.day_number}`}
                  className="font-semibold text-gray-900 cursor-pointer block mb-1"
                >
                  {day.day_number > 1 
                    ? `${language === 'he' ? 'יום' : 'Day'} ${day.day_number - 1}: ${day.daily_title}`
                    : day.daily_title
                  }
                </Label>
                <div className="flex flex-wrap gap-2 text-xs">
                  {dayPairs.some(p => p.includes(day.day_number)) && (
                    <Badge variant="secondary" className="gap-1 bg-indigo-100 text-indigo-700 border-indigo-200">
                      <LinkIcon className="w-3 h-3" />
                      {language === 'he' ? 'חלק מצמד' : 'Linked Day'}
                    </Badge>
                  )}
                  {day.daily_distance_km && (
                    <Badge variant="outline" className="gap-1 bg-blue-50">
                      <MapPin className="w-3 h-3" />
                      {day.daily_distance_km.toFixed(1)} {language === 'he' ? 'ק״מ' : 'km'}
                    </Badge>
                  )}
                  {day.elevation_gain_m && (
                    <Badge variant="outline" className="gap-1 bg-green-50">
                      <TrendingUp className="w-3 h-3 text-green-600" />
                      +{day.elevation_gain_m.toFixed(0)} {language === 'he' ? 'מ׳' : 'm'}
                    </Badge>
                  )}
                  {day.highest_point_m && (
                    <Badge variant="outline" className="gap-1 bg-purple-50">
                      <Mountain className="w-3 h-3 text-purple-600" />
                      {day.highest_point_m.toFixed(0)} {language === 'he' ? 'מ׳' : 'm'}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        {selectedDays.length > 0 && (
          <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 text-center">
            <p className="text-sm font-semibold text-emerald-900">
              {selectedDays.includes(0)
                ? (language === 'he' ? 'נבחר: כל הטראק' : language === 'ru' ? 'Выбрано: весь трек' : language === 'es' ? 'Seleccionado: todo el trekking' : language === 'fr' ? 'Sélectionné: tout le trekking' : language === 'de' ? 'Ausgewählt: gesamtes Trekking' : language === 'it' ? 'Selezionato: tutto il trekking' : 'Selected: Entire Trek')
                : language === 'he'
                  ? `נבחרו ${selectedDays.length} ימים`
                  : language === 'ru' ? `Выбрано дней: ${selectedDays.length}`
                  : language === 'es' ? `${selectedDays.length} días seleccionados`
                  : language === 'fr' ? `${selectedDays.length} jours sélectionnés`
                  : language === 'de' ? `${selectedDays.length} Tage ausgewählt`
                  : language === 'it' ? `${selectedDays.length} giorni selezionati`
                  : `${selectedDays.length} days selected`
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}