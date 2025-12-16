import React, { useState } from 'react';
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
    toast.success(language === 'he' ? 'היום נשמר' : 'Day saved');
  };

  const handleDeleteDay = async (dayId) => {
    const updatedItinerary = itinerary.filter(d => d.id !== dayId);
    await base44.entities.Trip.update(trip.id, {
      daily_itinerary: updatedItinerary
    });
    onUpdate();
    toast.success(language === 'he' ? 'היום נמחק' : 'Day deleted');
  };

  const handleAddActivity = async () => {
    const day = itinerary.find(d => d.id === selectedDay);
    if (!day) return;

    const newActivity = {
      id: Date.now().toString(),
      ...activityData
    };

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
    toast.success(language === 'he' ? 'הפעילות נשמרה' : 'Activity saved');
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
    toast.success(language === 'he' ? 'הפעילות נמחקה' : 'Activity deleted');
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
      toast.success(language === 'he' ? 'לוח זמנים נוצר בהצלחה!' : 'Itinerary generated successfully!');
    } catch (error) {
      toast.error(language === 'he' ? 'שגיאה ביצירת לוח זמנים' : 'Error generating itinerary');
    }
    setGeneratingAI(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setActivityData({ ...activityData, image_url: file_url });
      toast.success(language === 'he' ? 'התמונה הועלתה בהצלחה' : 'Image uploaded successfully');
    } catch (error) {
      toast.error(language === 'he' ? 'שגיאה בהעלאת התמונה' : 'Error uploading image');
    }
    setUploadingImage(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            {language === 'he' ? 'תכנון יומי' : 'Daily Itinerary'}
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
                  {language === 'he' ? 'צור עם AI' : 'Generate with AI'}
                </Button>
              )}
              <Button onClick={() => {
                setShowAddDay(true);
                setEditingDay(null);
                setDayData({ day: itinerary.length + 1, title: '', activities: [] });
              }}>
                <Plus className="w-4 h-4 mr-2" />
                {language === 'he' ? 'הוסף יום' : 'Add Day'}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {itinerary.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {language === 'he' ? 'אין תכנון יומי עדיין' : 'No daily itinerary yet'}
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
                          {language === 'he' ? 'יום' : 'Day'} {day.day}
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
                            {language === 'he' ? 'פעילות' : 'Activity'}
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
                        {language === 'he' ? 'אין פעילויות מתוכננות' : 'No activities planned'}
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {day.activities.map(activity => (
                          <div key={activity.id} className="flex items-start gap-3 p-3 bg-white rounded-lg">
                            <Clock className="w-4 h-4 text-blue-600 mt-1" />
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
                                    setActivityData(activity);
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
                        ))}
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
                ? (language === 'he' ? 'ערוך יום' : 'Edit Day')
                : (language === 'he' ? 'הוסף יום' : 'Add Day')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{language === 'he' ? 'כותרת היום' : 'Day Title'}</Label>
              <Input
                value={dayData.title}
                onChange={(e) => setDayData({ ...dayData, title: e.target.value })}
                placeholder={language === 'he' ? 'לדוגמה: מסלול הר מירון' : 'e.g., Mt. Meron Trail'}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDay(false)}>
              {language === 'he' ? 'ביטול' : 'Cancel'}
            </Button>
            <Button onClick={handleAddDay} className="bg-emerald-600 hover:bg-emerald-700">
              {language === 'he' ? 'שמור' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Activity Dialog */}
      <Dialog open={showAddActivity} onOpenChange={setShowAddActivity}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingActivity
                ? (language === 'he' ? 'ערוך פעילות' : 'Edit Activity')
                : (language === 'he' ? 'הוסף פעילות' : 'Add Activity')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{language === 'he' ? 'שעה' : 'Time'}</Label>
              <Input
                type="time"
                value={activityData.time}
                onChange={(e) => setActivityData({ ...activityData, time: e.target.value })}
              />
            </div>
            <div>
              <Label>{language === 'he' ? 'פעילות' : 'Activity'}</Label>
              <Input
                value={activityData.activity}
                onChange={(e) => setActivityData({ ...activityData, activity: e.target.value })}
                placeholder={language === 'he' ? 'מה מתוכנן?' : "What's planned?"}
              />
            </div>
            <div>
              <Label>{language === 'he' ? 'הערות' : 'Notes'}</Label>
              <Textarea
                value={activityData.notes}
                onChange={(e) => setActivityData({ ...activityData, notes: e.target.value })}
                placeholder={language === 'he' ? 'הערות נוספות...' : 'Additional notes...'}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddActivity(false)}>
              {language === 'he' ? 'ביטול' : 'Cancel'}
            </Button>
            <Button onClick={handleAddActivity} className="bg-emerald-600 hover:bg-emerald-700">
              {language === 'he' ? 'שמור' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}