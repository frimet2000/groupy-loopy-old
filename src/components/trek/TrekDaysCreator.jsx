// @ts-nocheck
import React, { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2, Edit, Route, MapPin, Mountain, TrendingUp, TrendingDown, Sparkles, Loader2, CloudSun, Calendar, Compass, Link as LinkIcon, Unlink } from 'lucide-react';
import { motion } from 'framer-motion';
import TrekDayMapEditor from './TrekDayMapEditor';
import EquipmentCreator from '../creation/EquipmentCreator';
import DayImageUploader from './DayImageUploader';

export default function TrekDaysCreator({ trekDays, setTrekDays, dayPairs = [], setDayPairs = (pairs) => {}, onGenerateAI, tripDate, tripLocation, categories = [] }) {
  const { language, isRTL } = useLanguage();

  const { t } = useLanguage();

  const difficulties = ['easy', 'moderate', 'challenging', 'hard', 'extreme'];

  const getDayDate = (day) => {
    if (day.date) return new Date(day.date);
    if (tripDate && day.day_number) {
      const date = new Date(tripDate);
      date.setDate(date.getDate() + (day.day_number - 1));
      return date;
    }
    return null;
  };
  const [editingDay, setEditingDay] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [pairingDay1, setPairingDay1] = useState('');
  const [pairingDay2, setPairingDay2] = useState('');

  const addDay = () => {
    const newDay = {
      id: Date.now(),
      day_number: (trekDays.length || 0) + 1,
      category_id: '',
      daily_title: '',
      date: '',
      daily_description: '',
      difficulty: 'moderate',
      waypoints: [],
      daily_distance_km: null,
      start_altitude_m: null,
      end_altitude_m: null,
      highest_point_m: null,
      lowest_point_m: null,
      elevation_gain_m: null,
      elevation_loss_m: null,
      estimated_weather: '',
      equipment: [],
      recommended_water_liters: null,
      image_url: ''
    };
    setEditingDay(newDay);
    setShowDialog(true);
  };

  const editDay = (day) => {
    setEditingDay({ ...day, date: day.date ? day.date.split('T')[0] : '' });
    setShowDialog(true);
  };

  const saveDay = () => {
      if (!editingDay.daily_title) {
        return;
      }

      console.log('Saving day with data:', JSON.stringify(editingDay, null, 2));

      if (editingDay.id && trekDays.find(d => d.id === editingDay.id)) {
        // Update existing - create a new array with the updated day
        const updatedDays = trekDays.map(d => d.id === editingDay.id ? {...editingDay} : d);
        console.log('Updated days array:', JSON.stringify(updatedDays, null, 2));
        setTrekDays(updatedDays);
      } else {
        // Add new
        setTrekDays([...trekDays, {...editingDay}]);
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

  const handleAddPair = () => {
    const d1 = parseInt(pairingDay1);
    const d2 = parseInt(pairingDay2);

    if (!d1 || !d2) return;

    if (Math.abs(d1 - d2) !== 1) {
      alert(language === 'he' ? 'ניתן לקשר רק ימים רצופים' : 'Only consecutive days can be linked');
      return;
    }

    const pair = [Math.min(d1, d2), Math.max(d1, d2)];

    // Check overlap
    const isOverlapping = dayPairs.some(p => 
      p.includes(pair[0]) || p.includes(pair[1])
    );

    if (isOverlapping) {
      alert(language === 'he' ? 'אחד הימים כבר משוייך לצמד אחר' : 'One of the days is already in a pair');
      return;
    }

    // Check existing
    const exists = dayPairs.some(p => p[0] === pair[0] && p[1] === pair[1]);
    if (exists) return;

    setDayPairs([...dayPairs, pair]);
    setPairingDay1('');
    setPairingDay2('');
  };

  const handleRemovePair = (index) => {
    setDayPairs(dayPairs.filter((_, i) => i !== index));
  };

  const toggleLinkNext = (dayNumber) => {
    const nextDayNum = dayNumber + 1;
    // Check if next day exists
    if (!trekDays.some(d => d.day_number === nextDayNum)) return;

    const pair = [dayNumber, nextDayNum];
    
    // Check if already linked
    const existingPairIndex = dayPairs.findIndex(p => 
      (p.includes(dayNumber) && p.includes(nextDayNum))
    );

    if (existingPairIndex >= 0) {
      // Unlink
      const newPairs = [...dayPairs];
      newPairs.splice(existingPairIndex, 1);
      setDayPairs(newPairs);
    } else {
      // Link
      // Check for overlaps
      const isOverlapping = dayPairs.some(p => 
        p.includes(dayNumber) || p.includes(nextDayNum)
      );

      if (isOverlapping) {
        alert(language === 'he' ? 'אחד הימים כבר משוייך לצמד אחר' : 'One of the days is already in a pair');
        return;
      }

      setDayPairs([...dayPairs, pair]);
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
              {trekDays.sort((a, b) => {
                const dateA = getDayDate(a);
                const dateB = getDayDate(b);
                if (dateA && dateB) return dateA - dateB;
                return a.day_number - b.day_number;
              }).map((day) => (
                <motion.div
                  key={day.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white border-2 border-indigo-100 rounded-xl p-4 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    {day.image_url && (
                      <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden border border-gray-200">
                        <img src={day.image_url} alt={day.daily_title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {day.day_number > 1 && (
                          <Badge variant="default" className="bg-indigo-600">
                            {language === 'he' ? `יום ${day.day_number - 1}` : `Day ${day.day_number - 1}`}
                          </Badge>
                        )}
                        {day.category_id && categories.find(c => c.id === day.category_id) && (
                          <Badge 
                            variant="default"
                            style={{ 
                              backgroundColor: categories.find(c => c.id === day.category_id)?.color,
                              color: 'white'
                            }}
                          >
                            {categories.find(c => c.id === day.category_id)?.name}
                          </Badge>
                        )}
                        <h4 className="font-bold text-gray-900">{day.daily_title}</h4>
                      </div>
                      {getDayDate(day) && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {getDayDate(day).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US', { 
                              weekday: 'long', 
                              day: 'numeric', 
                              month: 'numeric' 
                            })}
                          </span>
                        </div>
                      )}
                      {day.daily_description && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2" dir={isRTL ? 'rtl' : 'ltr'}>
                          {day.daily_description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 text-xs">
                        {day.difficulty && (
                          <Badge variant="secondary" className="gap-1 border border-gray-200">
                            <Compass className="w-3 h-3 text-amber-600" />
                            {t(day.difficulty)}
                          </Badge>
                        )}
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
                      {trekDays.some(d => d.day_number === day.day_number + 1) && (
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleLinkNext(day.day_number)}
                          className={`h-8 w-8 ${dayPairs.some(p => p.includes(day.day_number) && p.includes(day.day_number + 1)) ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100' : 'text-gray-400 hover:text-indigo-600'}`}
                          title={dayPairs.some(p => p.includes(day.day_number) && p.includes(day.day_number + 1)) ? (language === 'he' ? 'בטל צימוד ליום הבא' : 'Unlink from next day') : (language === 'he' ? 'צמד ליום הבא' : 'Link to next day')}
                        >
                          {dayPairs.some(p => p.includes(day.day_number) && p.includes(day.day_number + 1)) ? <Unlink className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
                        </Button>
                      )}
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

      {/* Day Pairs Management */}
      <Card className="border-2 border-indigo-200 shadow-lg mt-6">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="w-5 h-5 text-indigo-600" />
            {language === 'he' ? 'צמדי ימים' : 'Day Pairs'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-wrap items-end gap-4 p-4 bg-gray-50 rounded-lg border">
            <div className="space-y-2 flex-1 min-w-[150px]">
              <Label>{language === 'he' ? 'יום ראשון בצמד' : 'First Day'}</Label>
              <Select value={pairingDay1} onValueChange={setPairingDay1}>
                <SelectTrigger>
                  <SelectValue placeholder={language === 'he' ? 'בחר יום...' : 'Select day...'} />
                </SelectTrigger>
                <SelectContent>
                  {trekDays.sort((a, b) => a.day_number - b.day_number).map(day => (
                    <SelectItem key={day.id} value={day.day_number.toString()}>
                      {day.day_number > 1 
                        ? (language === 'he' ? `יום ${day.day_number - 1}` : `Day ${day.day_number - 1}`)
                        : (day.daily_title || (language === 'he' ? 'יום התכנסות' : 'Gathering Day'))
                      }
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2 flex-1 min-w-[150px]">
              <Label>{language === 'he' ? 'יום שני בצמד' : 'Second Day'}</Label>
              <Select value={pairingDay2} onValueChange={setPairingDay2}>
                <SelectTrigger>
                  <SelectValue placeholder={language === 'he' ? 'בחר יום...' : 'Select day...'} />
                </SelectTrigger>
                <SelectContent>
                  {trekDays.sort((a, b) => a.day_number - b.day_number).map(day => (
                    <SelectItem key={day.id} value={day.day_number.toString()}>
                      {day.day_number > 1 
                        ? (language === 'he' ? `יום ${day.day_number - 1}` : `Day ${day.day_number - 1}`)
                        : (day.daily_title || (language === 'he' ? 'יום התכנסות' : 'Gathering Day'))
                      }
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleAddPair}
              disabled={!pairingDay1 || !pairingDay2}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              {language === 'he' ? 'צור צמד' : 'Create Pair'}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {dayPairs.map((pair, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-white border border-indigo-200 rounded-lg shadow-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-indigo-50">
                    {language === 'he' ? `יום ${pair[0]}` : `Day ${pair[0]}`}
                  </Badge>
                  <LinkIcon className="w-4 h-4 text-gray-400" />
                  <Badge variant="outline" className="bg-indigo-50">
                    {language === 'he' ? `יום ${pair[1]}` : `Day ${pair[1]}`}
                  </Badge>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleRemovePair(idx)}
                  className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <Unlink className="w-4 h-4" />
                </Button>
              </div>
            ))}
            {dayPairs.length === 0 && (
              <div className="col-span-full text-center py-4 text-gray-500 text-sm">
                {language === 'he' ? 'לא הוגדרו צמדי ימים' : 'No day pairs defined'}
              </div>
            )}
          </div>
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

                {categories.length > 0 && (
                  <div className="space-y-2">
                    <Label>
                      {language === 'he' ? 'קטגוריה/איזור' : language === 'ru' ? 'Категория/Область' : language === 'es' ? 'Categoría/Área' : language === 'fr' ? 'Catégorie/Zone' : language === 'de' ? 'Kategorie/Bereich' : language === 'it' ? 'Categoria/Area' : 'Category/Area'}
                    </Label>
                    <Select 
                      value={editingDay.category_id || ''} 
                      onValueChange={(v) => setEditingDay({ ...editingDay, category_id: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={language === 'he' ? 'בחר קטגוריה' : 'Select category'} />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: cat.color }}
                              />
                              {cat.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>
                    {language === 'he' ? 'תאריך' : language === 'ru' ? 'Дата' : language === 'es' ? 'Fecha' : language === 'fr' ? 'Date' : language === 'de' ? 'Datum' : language === 'it' ? 'Data' : 'Date'}
                  </Label>
                  <Input
                    type="date"
                    value={editingDay.date ? editingDay.date.split('T')[0] : ''}
                    onChange={(e) => setEditingDay({ ...editingDay, date: e.target.value })}
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

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Compass className="w-4 h-4" />
                    {language === 'he' ? 'רמת קושי יומית' : 'Daily Difficulty'}
                  </Label>
                  <Select 
                    value={editingDay.difficulty || 'moderate'} 
                    onValueChange={(v) => setEditingDay({ ...editingDay, difficulty: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {difficulties.map(d => (
                        <SelectItem key={d} value={d}>{t(d)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <DayImageUploader 
                  imageUrl={editingDay.image_url} 
                  onImageChange={(url) => {
                    console.log('DayImageUploader onImageChange called with:', url);
                    setEditingDay(prev => {
                      const newDay = {...prev, image_url: url};
                      console.log('New editingDay state:', newDay);
                      return newDay;
                    });
                  }} 
                />

                <TrekDayMapEditor
                  day={editingDay}
                  setDay={setEditingDay}
                />

                <EquipmentCreator
                  equipment={editingDay.equipment || []}
                  setEquipment={(newEquipment) => setEditingDay(prev => ({...prev, equipment: newEquipment}))}
                  waterRecommendation={editingDay.recommended_water_liters}
                  setWaterRecommendation={(liters) => setEditingDay(prev => ({...prev, recommended_water_liters: liters}))}
                  onGenerateAI={undefined}
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