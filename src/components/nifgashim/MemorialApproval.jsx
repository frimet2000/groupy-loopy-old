import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '../LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, Calendar, MapPin, Heart, User } from 'lucide-react';

export default function MemorialApproval({ memorial, onUpdate }) {
  const { language, isRTL } = useLanguage();
  const [showDialog, setShowDialog] = useState(false);
  const [displayDate, setDisplayDate] = useState(memorial.display_on_date || '');
  const [loading, setLoading] = useState(false);

  const translations = {
    he: {
      approve: "אשר הנצחה",
      reject: "דחה",
      pending: "ממתין",
      approved: "מאושר",
      rejected: "נדחה",
      fallen: "שם החלל/ה",
      dateOfFall: "תאריך נפילה",
      place: "מקום",
      relation: "קרבה",
      requester: "מבקש/ת",
      story: "סיפור",
      displayDate: "תאריך תצוגה",
      selectDisplayDate: "בחר תאריך תצוגה בטרק",
      save: "שמור ואשר",
      cancel: "ביטול",
      success: "ההנצחה עודכנה",
      error: "שגיאה בעדכון"
    },
    en: {
      approve: "Approve",
      reject: "Reject",
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected",
      fallen: "Fallen",
      dateOfFall: "Date of Fall",
      place: "Place",
      relation: "Relation",
      requester: "Requester",
      story: "Story",
      displayDate: "Display Date",
      selectDisplayDate: "Select display date in trek",
      save: "Save & Approve",
      cancel: "Cancel",
      success: "Memorial updated",
      error: "Update error"
    }
  };

  const trans = translations[language] || translations.en;

  const handleApprove = async () => {
    if (!displayDate) {
      toast.error(language === 'he' ? 'יש לבחור תאריך תצוגה' : 'Please select display date');
      return;
    }

    setLoading(true);
    try {
      const userData = await base44.auth.me();
      await base44.entities.Memorial.update(memorial.id, {
        status: 'approved',
        approved_by: userData.email,
        approved_at: new Date().toISOString(),
        display_on_date: displayDate
      });
      toast.success(trans.success);
      setShowDialog(false);
      onUpdate?.();
    } catch (error) {
      console.error(error);
      toast.error(trans.error);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      const userData = await base44.auth.me();
      await base44.entities.Memorial.update(memorial.id, {
        status: 'rejected',
        approved_by: userData.email,
        approved_at: new Date().toISOString()
      });
      toast.success(trans.success);
      onUpdate?.();
    } catch (error) {
      console.error(error);
      toast.error(trans.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className={`${isRTL ? 'rtl' : 'ltr'} hover:shadow-lg transition-shadow`}>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-5 h-5 text-blue-600" />
                  <span className="font-bold text-lg">{memorial.fallen_name}</span>
                </div>
                
                {memorial.date_of_fall && (
                  <div className="text-sm text-gray-600 flex items-center gap-2 mb-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(memorial.date_of_fall).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US')}
                  </div>
                )}

                {memorial.place_of_fall && (
                  <div className="text-sm text-gray-600 flex items-center gap-2 mb-1">
                    <MapPin className="w-3 h-3" />
                    {memorial.place_of_fall}
                  </div>
                )}

                <div className="text-sm text-gray-600 flex items-center gap-2">
                  <User className="w-3 h-3" />
                  {memorial.requester_name}
                </div>

                {memorial.story && (
                  <div className="mt-2 text-sm text-gray-700 bg-gray-50 p-2 rounded">
                    {memorial.story.slice(0, 150)}...
                  </div>
                )}
              </div>

              <Badge className={
                memorial.status === 'approved' ? 'bg-green-100 text-green-800' :
                memorial.status === 'rejected' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }>
                {trans[memorial.status]}
              </Badge>
            </div>

            {memorial.status === 'pending' && (
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => setShowDialog(true)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {trans.approve}
                </Button>
                <Button
                  onClick={handleReject}
                  variant="destructive"
                  size="sm"
                  disabled={loading}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  {trans.reject}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle>{trans.approve}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{trans.displayDate} *</Label>
              <Input
                type="date"
                value={displayDate}
                onChange={(e) => setDisplayDate(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">{trans.selectDisplayDate}</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleApprove}
                disabled={loading || !displayDate}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {trans.save}
              </Button>
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                {trans.cancel}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}