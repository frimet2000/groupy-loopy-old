import React, { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Heart, Plus, Loader2, Trash2, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from "sonner";
import { base44 } from '@/api/base44Client';

export default function TripExperiences({ trip, currentUserEmail, onUpdate }) {
  const { language } = useLanguage();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingExperience, setEditingExperience] = useState(null);
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  const experiences = trip.experiences || [];
  const isParticipant = trip.participants?.some(p => p.email === currentUserEmail);

  const handleSave = async () => {
    if (!content.trim()) {
      toast.error(language === 'he' ? 'נא לכתוב משהו' : 'Please write something');
      return;
    }

    setSaving(true);
    try {
      const currentUser = await base44.auth.me();
      const userName = (currentUser.first_name && currentUser.last_name) 
        ? `${currentUser.first_name} ${currentUser.last_name}` 
        : currentUser.full_name || 'Unknown';
      
      let updatedExperiences;

      if (editingExperience) {
        updatedExperiences = experiences.map(exp =>
          exp.id === editingExperience.id
            ? { ...exp, content: content.trim() }
            : exp
        );
      } else {
        const newExperience = {
          id: Date.now().toString(),
          content: content.trim(),
          author_email: currentUserEmail,
          author_name: userName,
          timestamp: new Date().toISOString()
        };
        updatedExperiences = [...experiences, newExperience];
      }

      await base44.entities.Trip.update(trip.id, { experiences: updatedExperiences });
      
      onUpdate();
      setShowAddDialog(false);
      setEditingExperience(null);
      setContent('');
      toast.success(language === 'he' ? 'החוויה נשמרה' : 'Experience saved');
    } catch (error) {
      toast.error(language === 'he' ? 'שגיאה בשמירה' : 'Error saving');
    }
    setSaving(false);
  };

  const handleDelete = async (experienceId) => {
    try {
      const updatedExperiences = experiences.filter(exp => exp.id !== experienceId);
      await base44.entities.Trip.update(trip.id, { experiences: updatedExperiences });
      onUpdate();
      toast.success(language === 'he' ? 'החוויה נמחקה' : 'Experience deleted');
    } catch (error) {
      toast.error(language === 'he' ? 'שגיאה במחיקה' : 'Error deleting');
    }
  };

  const handleEdit = (experience) => {
    setEditingExperience(experience);
    setContent(experience.content);
    setShowAddDialog(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-600" />
              {language === 'he' ? 'חוויות ורשמים' : 'Experiences & Impressions'}
            </CardTitle>
            {isParticipant && (
              <Button
                onClick={() => {
                  setEditingExperience(null);
                  setContent('');
                  setShowAddDialog(true);
                }}
                className="bg-rose-600 hover:bg-rose-700 gap-2"
                size="sm"
              >
                <Plus className="w-4 h-4" />
                {language === 'he' ? 'שתף חוויה' : 'Share Experience'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {experiences.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Heart className="w-16 h-16 text-gray-300 mb-3" />
              <p className="text-gray-500">
                {language === 'he' 
                  ? 'אין חוויות עדיין. שתפו את הרשמים שלכם!'
                  : 'No experiences yet. Share your impressions!'}
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                {experiences.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).map((experience) => (
                  <Card key={experience.id} className="bg-gradient-to-br from-rose-50 to-pink-50 border-rose-100">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-rose-600 text-white">
                              {experience.author_name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-gray-900">{experience.author_name}</p>
                            <p className="text-xs text-gray-500">
                              {format(new Date(experience.timestamp), 'EEEE, MMMM d, yyyy · HH:mm')}
                            </p>
                          </div>
                        </div>
                        {experience.author_email === currentUserEmail && (
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEdit(experience)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:text-red-700"
                              onClick={() => handleDelete(experience.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed" dir={language === 'he' ? 'rtl' : 'ltr'}>
                        {experience.content}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Experience Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingExperience
                ? (language === 'he' ? 'ערוך חוויה' : 'Edit Experience')
                : (language === 'he' ? 'שתף חוויה' : 'Share Experience')}
            </DialogTitle>
            <DialogDescription>
              {language === 'he' 
                ? 'ספר למשתתפים האחרים על החוויה שלך מהטיול'
                : 'Tell other participants about your experience from the trip'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={language === 'he' 
                ? 'כתוב את הרשמים והחוויות שלך מהטיול...'
                : 'Write your impressions and experiences from the trip...'}
              dir={language === 'he' ? 'rtl' : 'ltr'}
              rows={10}
              className="resize-none"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              {language === 'he' ? 'ביטול' : 'Cancel'}
            </Button>
            <Button onClick={handleSave} disabled={saving} className="bg-rose-600 hover:bg-rose-700">
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Heart className="w-4 h-4 mr-2" />
              )}
              {language === 'he' ? 'שמור' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}