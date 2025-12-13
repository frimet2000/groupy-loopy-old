import React, { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Clock, Plus, Trash2, Bell, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { he, enUS } from 'date-fns/locale';

const timeBeforeOptions = [
  { value: '1_hour', labelEn: '1 hour before', labelHe: 'שעה לפני' },
  { value: '3_hours', labelEn: '3 hours before', labelHe: '3 שעות לפני' },
  { value: '6_hours', labelEn: '6 hours before', labelHe: '6 שעות לפני' },
  { value: '12_hours', labelEn: '12 hours before', labelHe: '12 שעות לפני' },
  { value: '1_day', labelEn: '1 day before', labelHe: 'יום לפני' },
  { value: '2_days', labelEn: '2 days before', labelHe: 'יומיים לפני' },
  { value: '3_days', labelEn: '3 days before', labelHe: '3 ימים לפני' },
  { value: '1_week', labelEn: '1 week before', labelHe: 'שבוע לפני' },
];

const calculateReminderTime = (tripDate, timeBefore) => {
  const tripDateTime = new Date(tripDate);
  const hoursMap = {
    '1_hour': 1,
    '3_hours': 3,
    '6_hours': 6,
    '12_hours': 12,
    '1_day': 24,
    '2_days': 48,
    '3_days': 72,
    '1_week': 168,
  };
  
  const hours = hoursMap[timeBefore] || 24;
  return new Date(tripDateTime.getTime() - hours * 60 * 60 * 1000).toISOString();
};

export default function TripReminders({ trip, currentUserEmail }) {
  const { language } = useLanguage();
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    time_before: '1_day',
    message: ''
  });

  const { data: reminders = [] } = useQuery({
    queryKey: ['tripReminders', trip.id, currentUserEmail],
    queryFn: () => base44.entities.TripReminder.filter({ 
      trip_id: trip.id,
      user_email: currentUserEmail 
    }),
    enabled: !!currentUserEmail,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.TripReminder.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tripReminders']);
      setShowDialog(false);
      setFormData({ time_before: '1_day', message: '' });
      toast.success(language === 'he' ? 'התזכורת נוצרה' : 'Reminder created');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.TripReminder.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['tripReminders']);
      toast.success(language === 'he' ? 'התזכורת נמחקה' : 'Reminder deleted');
    },
  });

  const handleCreate = () => {
    const reminderTime = calculateReminderTime(trip.date, formData.time_before);
    
    createMutation.mutate({
      trip_id: trip.id,
      user_email: currentUserEmail,
      reminder_type: 'before_trip',
      reminder_time: reminderTime,
      time_before: formData.time_before,
      message: formData.message || undefined,
      sent: false
    });
  };

  const activeReminders = reminders.filter(r => !r.sent);
  const pastReminders = reminders.filter(r => r.sent);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-600" />
            {language === 'he' ? 'תזכורות' : 'Reminders'}
          </div>
          <Button
            size="sm"
            onClick={() => setShowDialog(true)}
            className="bg-emerald-600 hover:bg-emerald-700 gap-2"
          >
            <Plus className="w-4 h-4" />
            {language === 'he' ? 'הוסף תזכורת' : 'Add Reminder'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeReminders.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 mb-2">
              {language === 'he' ? 'אין תזכורות פעילות' : 'No active reminders'}
            </p>
            <p className="text-sm text-gray-500">
              {language === 'he' 
                ? 'הוסף תזכורת כדי לקבל התראה לפני הטיול'
                : 'Add a reminder to get notified before the trip'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeReminders.map(reminder => {
              const timeLabel = timeBeforeOptions.find(
                opt => opt.value === reminder.time_before
              );
              
              return (
                <div 
                  key={reminder.id}
                  className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg border border-emerald-200"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-emerald-900">
                        {language === 'he' ? timeLabel?.labelHe : timeLabel?.labelEn}
                      </p>
                      <p className="text-sm text-emerald-700">
                        {formatDistanceToNow(new Date(reminder.reminder_time), {
                          addSuffix: true,
                          locale: language === 'he' ? he : enUS
                        })}
                      </p>
                      {reminder.message && (
                        <p className="text-xs text-emerald-600 mt-1 italic">
                          "{reminder.message}"
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMutation.mutate(reminder.id)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        {pastReminders.length > 0 && (
          <div className="mt-6">
            <Label className="text-sm font-semibold text-gray-500 mb-3 block">
              {language === 'he' ? 'תזכורות שנשלחו' : 'Sent Reminders'}
            </Label>
            <div className="space-y-2">
              {pastReminders.map(reminder => {
                const timeLabel = timeBeforeOptions.find(
                  opt => opt.value === reminder.time_before
                );
                
                return (
                  <div 
                    key={reminder.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <Clock className="w-4 h-4 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">
                        {language === 'he' ? timeLabel?.labelHe : timeLabel?.labelEn}
                      </p>
                      <p className="text-xs text-gray-500">
                        {language === 'he' ? 'נשלח' : 'Sent'} {formatDistanceToNow(new Date(reminder.sent_at), {
                          addSuffix: true,
                          locale: language === 'he' ? he : enUS
                        })}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {language === 'he' ? 'נשלח' : 'Sent'}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {language === 'he' ? 'הוסף תזכורת' : 'Add Reminder'}
            </DialogTitle>
            <DialogDescription>
              {language === 'he' 
                ? 'קבע מתי תרצה לקבל תזכורת לפני הטיול'
                : 'Set when you want to be reminded before the trip'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{language === 'he' ? 'תזכיר אותי' : 'Remind me'}</Label>
              <Select 
                value={formData.time_before}
                onValueChange={(v) => setFormData({ ...formData, time_before: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeBeforeOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {language === 'he' ? opt.labelHe : opt.labelEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{language === 'he' ? 'הודעה מותאמת (אופציונלי)' : 'Custom message (optional)'}</Label>
              <Textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder={language === 'he' 
                  ? 'הוסף הערה אישית לתזכורת...'
                  : 'Add a personal note to the reminder...'}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              {language === 'he' ? 'ביטול' : 'Cancel'}
            </Button>
            <Button 
              onClick={handleCreate}
              disabled={createMutation.isLoading}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {language === 'he' ? 'צור תזכורת' : 'Create Reminder'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}