import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '../components/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Save, AlertCircle, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NifgashimTrekManager() {
  const { language, isRTL } = useLanguage();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [editingDay, setEditingDay] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const translations = {
    he: {
      title: "ניהול ימי טרק - נפגשים בשביל ישראל",
      addDay: "הוסף יום",
      editDay: "ערוך יום",
      year: "שנה",
      date: "תאריך",
      dailyTitle: "כותרת היום",
      dailyDescription: "תיאור",
      region: "אזור",
      negev: "נגב",
      north: "צפון",
      center: "מרכז",
      south: "דרום",
      maxParticipants: "מקסימום משתתפים",
      guide: "מנחה",
      meetingPoint: "נקודת מפגש",
      meetingTime: "שעת מפגש",
      save: "שמור",
      cancel: "ביטול",
      delete: "מחק",
      adminOnly: "דף זה מיועד למנהלים בלבד",
      success: "היום נשמר בהצלחה",
      error: "שגיאה בשמירה",
      deleteConfirm: "האם למחוק יום זה?",
      difficulty: "רמת קושי",
      easy: "קל",
      moderate: "בינוני",
      challenging: "מאתגר",
      hard: "קשה"
    },
    en: {
      title: "Trek Days Management - Nifgashim for Israel",
      addDay: "Add Day",
      editDay: "Edit Day",
      year: "Year",
      date: "Date",
      dailyTitle: "Daily Title",
      dailyDescription: "Description",
      region: "Region",
      negev: "Negev",
      north: "North",
      center: "Center",
      south: "South",
      maxParticipants: "Max Participants",
      guide: "Guide",
      meetingPoint: "Meeting Point",
      meetingTime: "Meeting Time",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      adminOnly: "This page is for administrators only",
      success: "Day saved successfully",
      error: "Error saving",
      deleteConfirm: "Delete this day?",
      difficulty: "Difficulty",
      easy: "Easy",
      moderate: "Moderate",
      challenging: "Challenging",
      hard: "Hard"
    }
  };

  const trans = translations[language] || translations.en;

  const { data: trips = [] } = useQuery({
    queryKey: ['nifgashimTrips', selectedYear],
    queryFn: () => base44.entities.Trip.filter({ 
      activity_type: 'trek',
      organizer_email: 'nifgashim@israel.org'
    }),
    refetchInterval: 10000
  });

  const nifgashimTrip = trips[0];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        if (userData?.role !== 'admin') {
          base44.auth.redirectToLogin();
          return;
        }
        setUser(userData);
      } catch (e) {
        base44.auth.redirectToLogin();
      }
    };
    fetchUser();
  }, []);

  const handleSaveDay = async (dayData) => {
    try {
      if (!nifgashimTrip) {
        // Create the main Nifgashim trip
        await base44.entities.Trip.create({
          title: 'נפגשים בשביל ישראל',
          activity_type: 'trek',
          organizer_email: 'nifgashim@israel.org',
          organizer_name: 'נפגשים בשביל ישראל',
          trek_days: [dayData],
          country: 'israel',
          location: 'ישראל',
          date: dayData.date,
          duration_type: 'multi_day',
          difficulty: 'moderate'
        });
      } else {
        const existingDays = nifgashimTrip.trek_days || [];
        const dayIndex = existingDays.findIndex(d => d.day_number === dayData.day_number);
        
        let updatedDays;
        if (dayIndex >= 0) {
          updatedDays = [...existingDays];
          updatedDays[dayIndex] = dayData;
        } else {
          updatedDays = [...existingDays, dayData];
        }

        await base44.entities.Trip.update(nifgashimTrip.id, {
          trek_days: updatedDays
        });
      }

      queryClient.invalidateQueries(['nifgashimTrips']);
      toast.success(trans.success);
      setShowDialog(false);
      setEditingDay(null);
    } catch (error) {
      console.error(error);
      toast.error(trans.error);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isRTL ? 'rtl' : 'ltr'}`}>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{trans.adminOnly}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const trekDays = nifgashimTrip?.trek_days || [];

  return (
    <div className={`min-h-screen bg-gray-50 py-6 px-4 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{trans.title}</h1>
              <p className="text-gray-600">{selectedYear}</p>
            </div>
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  {trans.addDay}
                </Button>
              </DialogTrigger>
              <DialogContent className={`max-w-2xl max-h-[90vh] overflow-y-auto ${isRTL ? 'rtl' : 'ltr'}`}>
                <DialogHeader>
                  <DialogTitle>{editingDay ? trans.editDay : trans.addDay}</DialogTitle>
                </DialogHeader>
                <DayForm 
                  day={editingDay} 
                  onSave={handleSaveDay} 
                  onCancel={() => {
                    setShowDialog(false);
                    setEditingDay(null);
                  }}
                  translations={trans}
                  language={language}
                />
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        {/* Days List */}
        <div className="grid gap-4">
          {trekDays.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                {language === 'he' ? 'עדיין לא נוספו ימים. לחץ על "הוסף יום" להתחלה' : 'No days added yet. Click "Add Day" to start'}
              </CardContent>
            </Card>
          ) : (
            trekDays.sort((a, b) => new Date(a.date) - new Date(b.date)).map((day, idx) => (
              <motion.div
                key={day.day_number || idx}
                initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-4 h-4 text-gray-600" />
                          <span className="font-semibold">
                            {new Date(day.date).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="text-lg font-bold text-gray-900 mb-1">
                          {day.daily_title}
                        </div>
                        <div className="text-sm text-gray-600 mb-3">
                          {day.daily_description}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {trans[day.region] || day.region}
                          </span>
                          <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                            {day.max_participants || 120} {language === 'he' ? 'משתתפים' : 'participants'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingDay(day);
                            setShowDialog(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function DayForm({ day, onSave, onCancel, translations, language }) {
  const [formData, setFormData] = useState(day || {
    day_number: 1,
    date: '',
    daily_title: '',
    daily_description: '',
    region: 'negev',
    difficulty: 'moderate',
    max_participants: 120,
    guide_name: '',
    meeting_point: '',
    meeting_time: '08:00'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>{translations.date} *</Label>
        <Input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({...formData, date: e.target.value})}
          required
        />
      </div>

      <div>
        <Label>{translations.dailyTitle} *</Label>
        <Input
          value={formData.daily_title}
          onChange={(e) => setFormData({...formData, daily_title: e.target.value})}
          required
        />
      </div>

      <div>
        <Label>{translations.dailyDescription}</Label>
        <Textarea
          value={formData.daily_description}
          onChange={(e) => setFormData({...formData, daily_description: e.target.value})}
          rows={3}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label>{translations.region} *</Label>
          <Select value={formData.region} onValueChange={(value) => setFormData({...formData, region: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="negev">{translations.negev}</SelectItem>
              <SelectItem value="north">{translations.north}</SelectItem>
              <SelectItem value="center">{translations.center}</SelectItem>
              <SelectItem value="south">{translations.south}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>{translations.difficulty}</Label>
          <Select value={formData.difficulty} onValueChange={(value) => setFormData({...formData, difficulty: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">{translations.easy}</SelectItem>
              <SelectItem value="moderate">{translations.moderate}</SelectItem>
              <SelectItem value="challenging">{translations.challenging}</SelectItem>
              <SelectItem value="hard">{translations.hard}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>{translations.maxParticipants}</Label>
        <Input
          type="number"
          value={formData.max_participants}
          onChange={(e) => setFormData({...formData, max_participants: parseInt(e.target.value)})}
          min={1}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
          <Save className="w-4 h-4 mr-2" />
          {translations.save}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          {translations.cancel}
        </Button>
      </div>
    </form>
  );
}