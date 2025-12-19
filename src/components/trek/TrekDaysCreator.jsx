import React, { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2, Edit, Route, MapPin, Mountain, TrendingUp, TrendingDown, Sparkles, Loader2, CloudSun } from 'lucide-react';
import { motion } from 'framer-motion';
import TrekDayMapEditor from './TrekDayMapEditor';
import WeatherFetcher from './WeatherFetcher';

export default function TrekDaysCreator({ trekDays, setTrekDays, onGenerateAI }) {
  const { language, isRTL } = useLanguage();
  const [editingDay, setEditingDay] = useState(null);
  const [showDialog, setShowDialog] = useState(false);

  const addDay = () => {
    const newDay = {
      id: Date.now(),
      day_number: (trekDays.length || 0) + 1,
      daily_title: '',
      daily_description: '',
      waypoints: [],
      daily_distance_km: null,
      start_altitude_m: null,
      end_altitude_m: null,
      highest_point_m: null,
      lowest_point_m: null,
      elevation_gain_m: null,
      elevation_loss_m: null,
      estimated_weather: ''
    };
    setEditingDay(newDay);
    setShowDialog(true);
  };

  const editDay = (day) => {
    setEditingDay({ ...day });
    setShowDialog(true);
  };

  const saveDay = () => {
    if (!editingDay.daily_title) {
      return;
    }

    if (editingDay.id && trekDays.find(d => d.id === editingDay.id)) {
      // Update existing
      setTrekDays(trekDays.map(d => d.id === editingDay.id ? editingDay : d));
    } else {
      // Add new
      setTrekDays([...trekDays, editingDay]);
    }

    setShowDialog(false);
    setEditingDay(null);
  };

  const deleteDay = (dayId) => {
    if (confirm(language === 'he' ? 'למחוק את היום?' : 'Delete this day?')) {
      const updatedDays = trekDays.filter(d => d.id !== dayId);
      // Renumber days
      const renumbered = updatedDays.map((d, idx) => ({ ...d, day_number: idx + 1 }));
      setTrekDays(renumbered);
    }
  };

  return (
    <>
      <Card className="border-2 border-indigo-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Route className="w-5 h-5 text-indigo-600" />
              {language === 'he' ? 'ימי הטראק' : language === 'ru' ? 'Дни трека' : language === 'es' ? 'Días del trekking' : language === 'fr' ? 'Jours du trekking' : language === 'de' ? 'Trekking-Tage' : language === 'it' ? 'Giorni del trekking' : 'Trek Days'}
            </CardTitle>
            <Button
              type="button"
              size="sm"
              onClick={addDay}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" />
              {language === 'he' ? 'הוסף יום' : language === 'ru' ? 'Добавить день' : language === 'es' ? 'Añadir día' : language === 'fr' ? 'Ajouter jour' : language === 'de' ? 'Tag hinzufügen' : language === 'it' ? 'Aggiungi giorno' : 'Add Day'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {trekDays.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Route className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">
                {language === 'he' ? 'הוסף ימים לטראק - כל יום עם מסלול משלו' : language === 'ru' ? 'Добавьте дни трека - каждый день со своим маршрутом' : language === 'es' ? 'Añadir días al trekking - cada día con su propia ruta' : language === 'fr' ? 'Ajouter des jours au trekking - chaque jour avec son propre itinéraire' : language === 'de' ? 'Fügen Sie Trekking-Tage hinzu - jeder Tag mit seiner eigenen Route' : language === 'it' ? 'Aggiungi giorni al trekking - ogni giorno con il proprio percorso' : 'Add trek days - each with its own route'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {trekDays.sort((a, b) => a.day_number - b.day_number).map((day) => (
                <motion.div
                  key={day.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white border-2 border-indigo-100 rounded-xl p-4 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-indigo-600">
                          {language === 'he' ? `יום ${day.day_number}` : `Day ${day.day_number}`}
                        </Badge>
                        <h4 className="font-bold text-gray-900">{day.daily_title}</h4>
                      </div>
                      {day.daily_description && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2" dir={isRTL ? 'rtl' : 'ltr'}>
                          {day.daily_description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 text-xs">
                        {day.daily_distance_km && (
                          <Badge variant="outline" className="gap-1">
                            <MapPin className="w-3 h-3" />
                            {day.daily_distance_km.toFixed(1)} {language === 'he' ? 'ק״מ' : 'km'}
                          </Badge>
                        )}
                        {day.elevation_gain_m && (
                          <Badge variant="outline" className="gap-1">
                            <TrendingUp className="w-3 h-3 text-green-600" />
                            +{day.elevation_gain_m.toFixed(0)} {language === 'he' ? 'מ׳' : 'm'}
                          </Badge>
                        )}
                        {day.elevation_loss_m && (
                          <Badge variant="outline" className="gap-1">
                            <TrendingDown className="w-3 h-3 text-red-600" />
                            -{day.elevation_loss_m.toFixed(0)} {language === 'he' ? 'מ׳' : 'm'}
                          </Badge>
                        )}
                        {day.highest_point_m && (
                          <Badge variant="outline" className="gap-1">
                            <Mountain className="w-3 h-3 text-blue-600" />
                            {day.highest_point_m.toFixed(0)} {language === 'he' ? 'מ׳' : 'm'}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => editDay(day)}
                        className="h-8 w-8"
                      >
                        <Edit className="w-4 h-4 text-indigo-600" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteDay(day.id)}
                        className="h-8 w-8"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Day Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh]" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Route className="w-6 h-6 text-indigo-600" />
              {editingDay?.id && trekDays.find(d => d.id === editingDay.id)
                ? (language === 'he' ? `עריכת יום ${editingDay?.day_number}` : `Edit Day ${editingDay?.day_number}`)
                : (language === 'he' ? `יום ${editingDay?.day_number} - חדש` : `Day ${editingDay?.day_number} - New`)
              }
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[70vh] pr-4">
            {editingDay && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>
                    {language === 'he' ? 'כותרת יומית' : language === 'ru' ? 'Дневное название' : language === 'es' ? 'Título del día' : language === 'fr' ? 'Titre quotidien' : language === 'de' ? 'Tagestitel' : language === 'it' ? 'Titolo giornaliero' : 'Daily Title'} *
                  </Label>
                  <Input
                    value={editingDay.daily_title}
                    onChange={(e) => setEditingDay({ ...editingDay, daily_title: e.target.value })}
                    placeholder={language === 'he' ? 'למשל: מסלול לנחל עמוד' : 'e.g., Trail to Amud Stream'}
                    dir={isRTL ? 'rtl' : 'ltr'}
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    {language === 'he' ? 'תיאור סדר היום' : language === 'ru' ? 'Описание дня' : language === 'es' ? 'Descripción del día' : language === 'fr' ? 'Description de la journée' : language === 'de' ? 'Tagesbeschreibung' : language === 'it' ? 'Descrizione della giornata' : 'Day Description'}
                  </Label>
                  <Textarea
                    value={editingDay.daily_description}
                    onChange={(e) => setEditingDay({ ...editingDay, daily_description: e.target.value })}
                    placeholder={language === 'he' ? 'תאר את סדר היום, פעילויות, הפסקות...' : 'Describe the day schedule, activities, breaks...'}
                    rows={4}
                    dir={isRTL ? 'rtl' : 'ltr'}
                  />
                </div>

                <TrekDayMapEditor
                  day={editingDay}
                  setDay={setEditingDay}
                />

                <WeatherFetcher
                    day={editingDay}
                    setDay={setEditingDay}
                  />

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowDialog(false);
                      setEditingDay(null);
                    }}
                  >
                    {language === 'he' ? 'ביטול' : language === 'ru' ? 'Отмена' : language === 'es' ? 'Cancelar' : language === 'fr' ? 'Annuler' : language === 'de' ? 'Abbrechen' : language === 'it' ? 'Annulla' : 'Cancel'}
                  </Button>
                  <Button
                    type="button"
                    onClick={saveDay}
                    disabled={!editingDay.daily_title}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    {language === 'he' ? 'שמור' : language === 'ru' ? 'Сохранить' : language === 'es' ? 'Guardar' : language === 'fr' ? 'Enregistrer' : language === 'de' ? 'Speichern' : language === 'it' ? 'Salva' : 'Save'}
                  </Button>
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}