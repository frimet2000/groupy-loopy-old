import React, { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Clock, Plus, Edit, Trash2, MapPin, Sparkles, Loader2, Image, Upload } from 'lucide-react';
import { toast } from "sonner";

export default function DailyItinerary({ trip, isOrganizer, onUpdate }) {
  const { language } = useLanguage();
  const [showAddDay, setShowAddDay] = useState(false);
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [editingDay, setEditingDay] = useState(null);
  const [editingActivity, setEditingActivity] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [dayData, setDayData] = useState({ day: 1, title: '', activities: [] });
  const [activityData, setActivityData] = useState({ time: '', activity: '', notes: '', image_url: '' });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);

  const itinerary = trip.daily_itinerary || [];

  useEffect(() => {
    if (editingActivity) {
      setActivityData({
        time: editingActivity.time || '',
        activity: editingActivity.activity || '',
        notes: editingActivity.notes || '',
        image_url: editingActivity.image_url || ''
      });
    }
  }, [editingActivity]);

  const handleAddDay = async () => {
    const newDay = {
      id: Date.now().toString(),
      ...dayData,
      day: editingDay ? editingDay.day : (itinerary.length + 1)
    };

    const updatedItinerary = editingDay
      ? itinerary.map(d => d.id === editingDay.id ? newDay : d)
      : [...itinerary, newDay];

    await base44.entities.Trip.update(trip.id, {
      daily_itinerary: updatedItinerary
    });

    setShowAddDay(false);
    setEditingDay(null);
    setDayData({ day: 1, title: '', activities: [] });
    onUpdate();
    toast.success(language === 'he' ? 'היום נשמר' : language === 'ru' ? 'День сохранен' : language === 'es' ? 'Día guardado' : language === 'fr' ? 'Jour enregistré' : language === 'de' ? 'Tag gespeichert' : language === 'it' ? 'Giorno salvato' : 'Day saved');
  };

  const handleDeleteDay = async (dayId) => {
    const updatedItinerary = itinerary.filter(d => d.id !== dayId);
    await base44.entities.Trip.update(trip.id, {
      daily_itinerary: updatedItinerary
    });
    onUpdate();
    toast.success(language === 'he' ? 'היום נמחק' : language === 'ru' ? 'День удален' : language === 'es' ? 'Día eliminado' : language === 'fr' ? 'Jour supprimé' : language === 'de' ? 'Tag gelöscht' : language === 'it' ? 'Giorno eliminato' : 'Day deleted');
  };

  const handleAddActivity = async () => {
    const day = itinerary.find(d => d.id === selectedDay);
    if (!day) return;

    console.log('=== SAVING ACTIVITY ===');
    console.log('activityData:', activityData);
    console.log('image_url:', activityData.image_url);

    const newActivity = {
      id: editingActivity?.id || Date.now().toString(),
      time: activityData.time,
      activity: activityData.activity,
      notes: activityData.notes,
      image_url: activityData.image_url || ''
    };

    console.log('newActivity:', newActivity);

    const updatedActivities = editingActivity
      ? day.activities.map(a => a.id === editingActivity.id ? newActivity : a)
      : [...(day.activities || []), newActivity];

    const updatedItinerary = itinerary.map(d =>
      d.id === selectedDay ? { ...d, activities: updatedActivities } : d
    );

    await base44.entities.Trip.update(trip.id, {
      daily_itinerary: updatedItinerary
    });

    setShowAddActivity(false);
    setEditingActivity(null);
    setActivityData({ time: '', activity: '', notes: '', image_url: '' });
    onUpdate();
    toast.success(language === 'he' ? 'הפעילות נשמרה' : language === 'ru' ? 'Активность сохранена' : language === 'es' ? 'Actividad guardada' : language === 'fr' ? 'Activité enregistrée' : language === 'de' ? 'Aktivität gespeichert' : language === 'it' ? 'Attività salvata' : 'Activity saved');
  };

  const handleDeleteActivity = async (dayId, activityId) => {
    const day = itinerary.find(d => d.id === dayId);
    const updatedActivities = day.activities.filter(a => a.id !== activityId);
    const updatedItinerary = itinerary.map(d =>
      d.id === dayId ? { ...d, activities: updatedActivities } : d
    );

    await base44.entities.Trip.update(trip.id, {
      daily_itinerary: updatedItinerary
    });
    onUpdate();
    toast.success(language === 'he' ? 'הפעילות נמחקה' : language === 'ru' ? 'Активность удалена' : language === 'es' ? 'Actividad eliminada' : language === 'fr' ? 'Activité supprimée' : language === 'de' ? 'Aktivität gelöscht' : language === 'it' ? 'Attività eliminata' : 'Activity deleted');
  };

  const handleGenerateAI = async () => {
    setGeneratingAI(true);
    try {
      const durationDays = trip.duration_type === 'multi_day' 
        ? trip.duration_value 
        : trip.duration_type === 'overnight' 
        ? 2 
        : 1;

      const prompt = `Generate a detailed daily itinerary for a ${trip.duration_type} ${trip.activity_type} trip to ${trip.location}, ${trip.region}, ${trip.country}.
      
Trip Details:
- Duration: ${durationDays} day(s)
- Activity Type: ${trip.activity_type}
- Difficulty: ${trip.difficulty}
- Interests: ${trip.interests?.join(', ') || 'general'}
- Trail Types: ${trip.trail_type?.join(', ') || 'various'}

Please provide a structured daily plan with specific activities, timings, and points of interest for each day. Include:
- Morning activities (with specific times)
- Afternoon activities (with specific times)  
- Evening activities (with specific times)
- Recommended rest/meal breaks
- Key points of interest to visit
- Safety considerations if relevant

Return the response in ${language === 'he' ? 'Hebrew' : 'English'}.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            days: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  day: { type: 'number' },
                  title: { type: 'string' },
                  activities: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        time: { type: 'string' },
                        activity: { type: 'string' },
                        notes: { type: 'string' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });

      const aiItinerary = response.days.map((day, idx) => ({
        ...day,
        id: Date.now().toString() + idx
      }));

      await base44.entities.Trip.update(trip.id, { daily_itinerary: aiItinerary });
      onUpdate();
      toast.success(language === 'he' ? 'לוח זמנים נוצר בהצלחה!' : language === 'ru' ? 'Маршрут создан успешно!' : language === 'es' ? '¡Itinerario generado con éxito!' : language === 'fr' ? 'Itinéraire généré avec succès!' : language === 'de' ? 'Route erfolgreich erstellt!' : language === 'it' ? 'Itinerario generato con successo!' : 'Itinerary generated successfully!');
    } catch (error) {
      toast.error(language === 'he' ? 'שגיאה ביצירת לוח זמנים' : language === 'ru' ? 'Ошибка создания маршрута' : language === 'es' ? 'Error al generar itinerario' : language === 'fr' ? 'Erreur lors de la génération' : language === 'de' ? 'Fehler beim Erstellen' : language === 'it' ? 'Errore nella generazione' : 'Error generating itinerary');
    }
    setGeneratingAI(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setActivityData(prev => ({ ...prev, image_url: file_url }));
      toast.success(language === 'he' ? 'התמונה הועלתה בהצלחה' : language === 'ru' ? 'Изображение загружено успешно' : language === 'es' ? 'Imagen subida con éxito' : language === 'fr' ? 'Image téléchargée avec succès' : language === 'de' ? 'Bild erfolgreich hochgeladen' : language === 'it' ? 'Immagine caricata con successo' : 'Image uploaded successfully');
    } catch (error) {
      toast.error(language === 'he' ? 'שגיאה בהעלאת התמונה' : language === 'ru' ? 'Ошибка загрузки изображения' : language === 'es' ? 'Error al subir imagen' : language === 'fr' ? 'Erreur lors du téléchargement' : language === 'de' ? 'Fehler beim Hochladen' : language === 'it' ? 'Errore nel caricamento' : 'Error uploading image');
    }
    setUploadingImage(false);
    e.target.value = '';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            {language === 'he' ? 'תכנון יומי' : language === 'ru' ? 'Ежедневный маршрут' : language === 'es' ? 'Itinerario diario' : language === 'fr' ? 'Itinéraire quotidien' : language === 'de' ? 'Tagesplan' : language === 'it' ? 'Itinerario giornaliero' : 'Daily Itinerary'}
          </CardTitle>
          {isOrganizer && (
            <div className="flex gap-2">
              {itinerary.length === 0 && (
                <Button 
                  onClick={handleGenerateAI}
                  disabled={generatingAI}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  {generatingAI ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  {language === 'he' ? 'צור עם AI' : language === 'ru' ? 'Создать с AI' : language === 'es' ? 'Generar con IA' : language === 'fr' ? 'Générer avec IA' : language === 'de' ? 'Mit KI erstellen' : language === 'it' ? 'Genera con IA' : 'Generate with AI'}
                </Button>
              )}
              <Button onClick={() => {
                setShowAddDay(true);
                setEditingDay(null);
                setDayData({ day: itinerary.length + 1, title: '', activities: [] });
              }}>
                <Plus className="w-4 h-4 mr-2" />
                {language === 'he' ? 'הוסף יום' : language === 'ru' ? 'Добавить день' : language === 'es' ? 'Añadir día' : language === 'fr' ? 'Ajouter un jour' : language === 'de' ? 'Tag hinzufügen' : language === 'it' ? 'Aggiungi giorno' : 'Add Day'}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {itinerary.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {language === 'he' ? 'אין תכנון יומי עדיין' : language === 'ru' ? 'Пока нет маршрута' : language === 'es' ? 'Aún no hay itinerario' : language === 'fr' ? 'Pas encore d\'itinéraire' : language === 'de' ? 'Noch kein Tagesplan' : language === 'it' ? 'Nessun itinerario ancora' : 'No daily itinerary yet'}
          </div>
        ) : (
          <ScrollArea className="h-[500px]">
            <div className="space-y-4">
              {itinerary.sort((a, b) => a.day - b.day).map(day => (
                <Card key={day.id} className="bg-gray-50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Badge className="bg-emerald-600 mb-2">
                          {language === 'he' ? 'יום' : language === 'ru' ? 'День' : language === 'es' ? 'Día' : language === 'fr' ? 'Jour' : language === 'de' ? 'Tag' : language === 'it' ? 'Giorno' : 'Day'} {day.day}
                        </Badge>
                        <h3 className="text-lg font-semibold">{day.title}</h3>
                      </div>
                      {isOrganizer && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedDay(day.id);
                              setShowAddActivity(true);
                              setEditingActivity(null);
                              setActivityData({ time: '', activity: '', notes: '', image_url: '' });
                            }}
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            {language === 'he' ? 'פעילות' : language === 'ru' ? 'Активность' : language === 'es' ? 'Actividad' : language === 'fr' ? 'Activité' : language === 'de' ? 'Aktivität' : language === 'it' ? 'Attività' : 'Activity'}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingDay(day);
                              setDayData(day);
                              setShowAddDay(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600"
                            onClick={() => handleDeleteDay(day.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {(!day.activities || day.activities.length === 0) ? (
                      <p className="text-sm text-gray-500">
                        {language === 'he' ? 'אין פעילויות מתוכננות' : language === 'ru' ? 'Активностей не запланировано' : language === 'es' ? 'No hay actividades planeadas' : language === 'fr' ? 'Aucune activité prévue' : language === 'de' ? 'Keine Aktivitäten geplant' : language === 'it' ? 'Nessuna attività pianificata' : 'No activities planned'}
                      </p>
                    ) : (
                    <div className="space-y-3">
                      {day.activities.map(activity => {
                        console.log('=== DISPLAYING ACTIVITY ===');
                        console.log('activity:', activity);
                        console.log('image_url:', activity.image_url);
                        return (
                          <div key={activity.id} className="flex items-start gap-3 p-3 bg-white rounded-lg" dir={language === 'he' ? 'rtl' : 'ltr'}>
                            {activity.image_url && (
                              <img 
                                src={activity.image_url} 
                                alt={activity.activity}
                                className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                              />
                            )}
                            <Clock className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-xs">
                                  {activity.time}
                                </Badge>
                              </div>
                              <p className="font-medium">{activity.activity}</p>
                              {activity.notes && (
                                <p className="text-sm text-gray-600 mt-1">{activity.notes}</p>
                              )}
                            </div>
                             {isOrganizer && (
                               <div className="flex gap-1">
                                 <Button
                                   size="sm"
                                   variant="ghost"
                                   onClick={() => {
                                     setSelectedDay(day.id);
                                     setEditingActivity(activity);
                                     setActivityData({
                                       time: activity.time || '',
                                       activity: activity.activity || '',
                                       notes: activity.notes || '',
                                       image_url: activity.image_url || ''
                                     });
                                     setShowAddActivity(true);
                                   }}
                                 >
                                   <Edit className="w-3 h-3" />
                                 </Button>
                                 <Button
                                   size="sm"
                                   variant="ghost"
                                   className="text-red-600"
                                   onClick={() => handleDeleteActivity(day.id, activity.id)}
                                 >
                                   <Trash2 className="w-3 h-3" />
                                 </Button>
                               </div>
                             )}
                           </div>
                        );
                      })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>

      {/* Add/Edit Day Dialog */}
      <Dialog open={showAddDay} onOpenChange={setShowAddDay}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingDay
                ? (language === 'he' ? 'עריכת יום' : language === 'ru' ? 'Редактировать день' : language === 'es' ? 'Editar día' : language === 'fr' ? 'Modifier le jour' : language === 'de' ? 'Tag bearbeiten' : language === 'it' ? 'Modifica giorno' : 'Edit Day')
                : (language === 'he' ? 'הוספת יום' : language === 'ru' ? 'Добавить день' : language === 'es' ? 'Añadir día' : language === 'fr' ? 'Ajouter un jour' : language === 'de' ? 'Tag hinzufügen' : language === 'it' ? 'Aggiungi giorno' : 'Add Day')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{language === 'he' ? 'כותרת היום' : language === 'ru' ? 'Название дня' : language === 'es' ? 'Título del día' : language === 'fr' ? 'Titre du jour' : language === 'de' ? 'Tagstitel' : language === 'it' ? 'Titolo del giorno' : 'Day Title'}</Label>
              <Input
                value={dayData.title}
                onChange={(e) => setDayData({ ...dayData, title: e.target.value })}
                placeholder={language === 'he' ? 'לדוגמה: מסלול הר מירון' : language === 'ru' ? 'напр., Маршрут Гора Мерон' : language === 'es' ? 'ej., Sendero Monte Meron' : language === 'fr' ? 'ex., Sentier du Mont Meron' : language === 'de' ? 'z.B., Berg Meron Weg' : language === 'it' ? 'es., Sentiero Monte Meron' : 'e.g., Mt. Meron Trail'}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDay(false)}>
              {language === 'he' ? 'ביטול' : language === 'ru' ? 'Отмена' : language === 'es' ? 'Cancelar' : language === 'fr' ? 'Annuler' : language === 'de' ? 'Abbrechen' : language === 'it' ? 'Annulla' : 'Cancel'}
            </Button>
            <Button onClick={handleAddDay} className="bg-emerald-600 hover:bg-emerald-700">
              {language === 'he' ? 'שמור' : language === 'ru' ? 'Сохранить' : language === 'es' ? 'Guardar' : language === 'fr' ? 'Enregistrer' : language === 'de' ? 'Speichern' : language === 'it' ? 'Salva' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Activity Dialog */}
      <Dialog open={showAddActivity} onOpenChange={(open) => {
        setShowAddActivity(open);
        if (!open) {
          setEditingActivity(null);
          setActivityData({ time: '', activity: '', notes: '', image_url: '' });
        }
      }}>
        <DialogContent dir={language === 'he' ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle>
              {editingActivity
                ? (language === 'he' ? 'עריכת פעילות' : language === 'ru' ? 'Редактировать активность' : language === 'es' ? 'Editar actividad' : language === 'fr' ? 'Modifier l\'activité' : language === 'de' ? 'Aktivität bearbeiten' : language === 'it' ? 'Modifica attività' : 'Edit Activity')
                : (language === 'he' ? 'הוספת פעילות' : language === 'ru' ? 'Добавить активность' : language === 'es' ? 'Añadir actividad' : language === 'fr' ? 'Ajouter une activité' : language === 'de' ? 'Aktivität hinzufügen' : language === 'it' ? 'Aggiungi attività' : 'Add Activity')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{language === 'he' ? 'שעה' : language === 'ru' ? 'Время' : language === 'es' ? 'Hora' : language === 'fr' ? 'Heure' : language === 'de' ? 'Zeit' : language === 'it' ? 'Ora' : 'Time'}</Label>
              <Input
                type="time"
                value={activityData.time}
                onChange={(e) => setActivityData({ ...activityData, time: e.target.value })}
              />
            </div>
            <div>
              <Label>{language === 'he' ? 'פעילות' : language === 'ru' ? 'Активность' : language === 'es' ? 'Actividad' : language === 'fr' ? 'Activité' : language === 'de' ? 'Aktivität' : language === 'it' ? 'Attività' : 'Activity'}</Label>
              <Input
                value={activityData.activity}
                onChange={(e) => setActivityData({ ...activityData, activity: e.target.value })}
                placeholder={language === 'he' ? 'מה מתוכנן?' : language === 'ru' ? 'Что запланировано?' : language === 'es' ? '¿Qué está planeado?' : language === 'fr' ? 'Qu\'est-ce qui est prévu?' : language === 'de' ? 'Was ist geplant?' : language === 'it' ? 'Cosa è previsto?' : "What's planned?"}
              />
            </div>
            <div>
              <Label>{language === 'he' ? 'הערות' : language === 'ru' ? 'Заметки' : language === 'es' ? 'Notas' : language === 'fr' ? 'Notes' : language === 'de' ? 'Notizen' : language === 'it' ? 'Note' : 'Notes'}</Label>
              <Textarea
                value={activityData.notes}
                onChange={(e) => setActivityData({ ...activityData, notes: e.target.value })}
                placeholder={language === 'he' ? 'הערות נוספות...' : language === 'ru' ? 'Дополнительные заметки...' : language === 'es' ? 'Notas adicionales...' : language === 'fr' ? 'Notes supplémentaires...' : language === 'de' ? 'Zusätzliche Notizen...' : language === 'it' ? 'Note aggiuntive...' : 'Additional notes...'}
                rows={3}
              />
            </div>
            <div>
              <Label className="flex items-center gap-2">
                <Image className="w-4 h-4" />
                {language === 'he' ? 'תמונה' : language === 'ru' ? 'Изображение' : language === 'es' ? 'Imagen' : language === 'fr' ? 'Image' : language === 'de' ? 'Bild' : language === 'it' ? 'Immagine' : 'Image'}
              </Label>
              {activityData.image_url ? (
                <div className="relative">
                  <img 
                    src={activityData.image_url} 
                    alt="Activity" 
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 right-2"
                    onClick={() => setActivityData({ ...activityData, image_url: '' })}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="activity-image-upload"
                    disabled={uploadingImage}
                  />
                  <label
                    htmlFor="activity-image-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    {uploadingImage ? (
                      <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                    ) : (
                      <Upload className="w-8 h-8 text-gray-400" />
                    )}
                    <span className="text-sm text-gray-600">
                      {uploadingImage 
                        ? (language === 'he' ? 'מעלה...' : language === 'ru' ? 'Загрузка...' : language === 'es' ? 'Subiendo...' : language === 'fr' ? 'Téléchargement...' : language === 'de' ? 'Hochladen...' : language === 'it' ? 'Caricamento...' : 'Uploading...')
                        : (language === 'he' ? 'לחץ להעלאת תמונה' : language === 'ru' ? 'Нажмите, чтобы загрузить изображение' : language === 'es' ? 'Haz clic para subir imagen' : language === 'fr' ? 'Cliquez pour télécharger l\'image' : language === 'de' ? 'Klicken Sie, um Bild hochzuladen' : language === 'it' ? 'Clicca per caricare l\'immagine' : 'Click to upload image')}
                    </span>
                  </label>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowAddActivity(false);
              setEditingActivity(null);
              setActivityData({ time: '', activity: '', notes: '', image_url: '' });
            }}>
              {language === 'he' ? 'ביטול' : language === 'ru' ? 'Отмена' : language === 'es' ? 'Cancelar' : language === 'fr' ? 'Annuler' : language === 'de' ? 'Abbrechen' : language === 'it' ? 'Annulla' : 'Cancel'}
            </Button>
            <Button onClick={handleAddActivity} className="bg-emerald-600 hover:bg-emerald-700">
              {language === 'he' ? 'שמור' : language === 'ru' ? 'Сохранить' : language === 'es' ? 'Guardar' : language === 'fr' ? 'Enregistrer' : language === 'de' ? 'Speichern' : language === 'it' ? 'Salva' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}