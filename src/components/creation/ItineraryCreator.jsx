import React, { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Clock, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from "sonner";

export default function ItineraryCreator({ itinerary, setItinerary }) {
  const { language } = useLanguage();
  const [showDayDialog, setShowDayDialog] = useState(false);
  const [showActivityDialog, setShowActivityDialog] = useState(false);
  const [editingDayIndex, setEditingDayIndex] = useState(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(null);
  const [editingActivityIndex, setEditingActivityIndex] = useState(null);
  const [dayData, setDayData] = useState({ day: 1, title: '', activities: [] });
  const [activityData, setActivityData] = useState({ time: '', activity: '', notes: '' });

  const handleAddDay = () => {
    const updated = [...itinerary];
    if (editingDayIndex !== null) {
      updated[editingDayIndex] = { ...dayData, id: updated[editingDayIndex].id };
    } else {
      updated.push({ id: Date.now().toString(), ...dayData, day: itinerary.length + 1 });
    }
    setItinerary(updated);
    setShowDayDialog(false);
    setEditingDayIndex(null);
    setDayData({ day: 1, title: '', activities: [] });
    toast.success(language === 'he' ? 'יום נשמר' : 'Day saved');
  };

  const handleDeleteDay = (index) => {
    setItinerary(itinerary.filter((_, i) => i !== index));
  };

  const handleAddActivity = () => {
    const updated = [...itinerary];
    const day = updated[selectedDayIndex];
    const activities = day.activities || [];
    
    if (editingActivityIndex !== null) {
      activities[editingActivityIndex] = { ...activityData, id: activities[editingActivityIndex].id };
    } else {
      activities.push({ id: Date.now().toString(), ...activityData });
    }
    
    updated[selectedDayIndex] = { ...day, activities };
    setItinerary(updated);
    setShowActivityDialog(false);
    setEditingActivityIndex(null);
    setActivityData({ time: '', activity: '', notes: '' });
    toast.success(language === 'he' ? 'פעילות נשמרה' : 'Activity saved');
  };

  const handleDeleteActivity = (dayIndex, activityIndex) => {
    const updated = [...itinerary];
    const activities = updated[dayIndex].activities.filter((_, i) => i !== activityIndex);
    updated[dayIndex] = { ...updated[dayIndex], activities };
    setItinerary(updated);
  };

  return (
    <>
      <Card className="border-2 border-violet-100 shadow-xl bg-white/80">
        <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-violet-700">
              <Calendar className="w-5 h-5" />
              {language === 'he' ? 'לוח זמנים יומי' : 'Daily Schedule'}
            </CardTitle>
            <Button type="button" size="sm" onClick={() => {
              if (itinerary.length === 0) {
                toast.error(language === 'he' ? 'יש ליצור יום קודם' : 'Please create a day first');
                return;
              }
              setSelectedDayIndex(itinerary.length - 1);
              setEditingActivityIndex(null);
              setActivityData({ time: '', activity: '', notes: '' });
              setShowActivityDialog(true);
            }}>
              <Plus className="w-4 h-4 mr-1" />
              {language === 'he' ? 'הוסף פעילות' : 'Add Activity'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <ScrollArea className="h-[300px]">
            {itinerary.length === 0 ? (
              <p className="text-center text-gray-500 py-8 text-sm">
                {language === 'he' ? 'אין לוח זמנים עדיין' : 'No schedule yet'}
              </p>
            ) : (
              <div className="space-y-3">
                {itinerary.sort((a, b) => a.day - b.day).map((day, dayIdx) => (
                  <Card key={day.id} className="bg-gray-50">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-violet-600">
                            {language === 'he' ? 'יום' : 'Day'} {day.day}
                          </Badge>
                          <span className="font-semibold text-sm">{day.title}</span>
                        </div>
                        <div className="flex gap-1">
                          <Button type="button" size="sm" variant="ghost" onClick={() => {
                            setSelectedDayIndex(dayIdx);
                            setEditingActivityIndex(null);
                            setActivityData({ time: '', activity: '', notes: '' });
                            setShowActivityDialog(true);
                          }}>
                            <Plus className="w-3 h-3" />
                          </Button>
                          <Button type="button" size="sm" variant="ghost" onClick={() => {
                            setEditingDayIndex(dayIdx);
                            setDayData(day);
                            setShowDayDialog(true);
                          }}>
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button type="button" size="sm" variant="ghost" className="text-red-600" onClick={() => handleDeleteDay(dayIdx)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      {day.activities && day.activities.length > 0 && (
                        <div className="space-y-1">
                          {day.activities.map((act, actIdx) => (
                            <div key={act.id} className="flex items-start gap-2 p-2 bg-white rounded text-xs">
                              <Clock className="w-3 h-3 text-blue-600 mt-0.5" />
                              <div className="flex-1">
                                <Badge variant="outline" className="text-xs mb-1">{act.time}</Badge>
                                <p className="font-medium">{act.activity}</p>
                                {act.notes && <p className="text-gray-600">{act.notes}</p>}
                              </div>
                              <Button type="button" size="icon" variant="ghost" className="h-6 w-6 text-red-600" onClick={() => handleDeleteActivity(dayIdx, actIdx)}>
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={showDayDialog} onOpenChange={setShowDayDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingDayIndex !== null ? (language === 'he' ? 'ערוך יום' : 'Edit Day') : (language === 'he' ? 'יום חדש' : 'New Day')}</DialogTitle>
          </DialogHeader>
          <Input
            value={dayData.title}
            onChange={(e) => setDayData({ ...dayData, title: e.target.value })}
            placeholder={language === 'he' ? 'כותרת היום...' : 'Day title...'}
            dir={language === 'he' ? 'rtl' : 'ltr'}
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowDayDialog(false)}>{language === 'he' ? 'ביטול' : 'Cancel'}</Button>
            <Button type="button" onClick={handleAddDay} className="bg-violet-600">{language === 'he' ? 'שמור' : 'Save'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showActivityDialog} onOpenChange={setShowActivityDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{language === 'he' ? 'פעילות חדשה' : 'New Activity'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">{language === 'he' ? 'שעה' : 'Time'}</label>
              <Input type="time" value={activityData.time} onChange={(e) => setActivityData({ ...activityData, time: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">{language === 'he' ? 'פעילות' : 'Activity'}</label>
              <Input
                value={activityData.activity}
                onChange={(e) => setActivityData({ ...activityData, activity: e.target.value })}
                placeholder={language === 'he' ? 'מה מתוכנן?' : 'What\'s planned?'}
              />
            </div>
            <div>
              <label className="text-sm font-medium">{language === 'he' ? 'הערות' : 'Notes'}</label>
              <Textarea
                value={activityData.notes}
                onChange={(e) => setActivityData({ ...activityData, notes: e.target.value })}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowActivityDialog(false)}>{language === 'he' ? 'ביטול' : 'Cancel'}</Button>
            <Button type="button" onClick={handleAddActivity} className="bg-violet-600">{language === 'he' ? 'שמור' : 'Save'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}