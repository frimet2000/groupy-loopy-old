// @ts-nocheck
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Eye, 
  EyeOff, 
  Settings2,
  Info,
  MapPin,
  Navigation,
  Users,
  Backpack,
  Calendar,
  DollarSign,
  MessageCircle,
  MessageSquare,
  GalleryHorizontal,
  Heart,
  Radio,
  Bell,
  Package,
  UserPlus,
  Shield
} from 'lucide-react';
import { toast } from "sonner";
import { base44 } from '@/api/base44Client';

const TAB_CONFIG = [
  { id: 'details', icon: Info, labelHe: 'פרטים', labelEn: 'Details' },
  { id: 'map', icon: MapPin, labelHe: 'מפה', labelEn: 'Map' },
  { id: 'navigate', icon: Navigation, labelHe: 'נווט', labelEn: 'Navigate' },
  { id: 'participants', icon: Users, labelHe: 'משתתפים', labelEn: 'Participants' },
  { id: 'equipment', icon: Backpack, labelHe: 'ציוד', labelEn: 'Equipment' },
  { id: 'itinerary', icon: Calendar, labelHe: 'לוח זמנים', labelEn: 'Itinerary' },
  { id: 'budget', icon: DollarSign, labelHe: 'תקציב', labelEn: 'Budget' },
  { id: 'social', icon: MessageCircle, labelHe: 'חברתי', labelEn: 'Social' },
  { id: 'chat', icon: MessageSquare, labelHe: "צ'אט", labelEn: 'Chat' },
  { id: 'gallery', icon: GalleryHorizontal, labelHe: 'גלריה', labelEn: 'Gallery' },
  { id: 'experiences', icon: Heart, labelHe: 'חוויות', labelEn: 'Experiences' },
  { id: 'location', icon: Radio, labelHe: 'מיקום חי', labelEn: 'Live Location' },
  { id: 'reminders', icon: Bell, labelHe: 'תזכורות', labelEn: 'Reminders' },
  { id: 'contributions', icon: Package, labelHe: 'מביא', labelEn: 'Bringing' },
  { id: 'invite', icon: UserPlus, labelHe: 'הזמן', labelEn: 'Invite' },
  { id: 'waiver', icon: Shield, labelHe: 'נא לקרוא', labelEn: 'Please Read' },
];

export default function TabVisibilityManager({ trip, language = 'he', onUpdate }) {
  const [open, setOpen] = useState(false);
  const [hiddenTabs, setHiddenTabs] = useState(trip?.hidden_tabs || []);
  const [saving, setSaving] = useState(false);

  const isHe = language === 'he';

  // Sync hiddenTabs with trip.hidden_tabs when trip updates
  React.useEffect(() => {
    setHiddenTabs(trip?.hidden_tabs || []);
  }, [trip?.hidden_tabs]);

  const handleToggle = (tabId) => {
    setHiddenTabs(prev => 
      prev.includes(tabId) 
        ? prev.filter(t => t !== tabId)
        : [...prev, tabId]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.entities.Trip.update(trip.id, { hidden_tabs: hiddenTabs });
      toast.success(isHe ? 'הגדרות נשמרו בהצלחה' : 'Settings saved successfully');
      if (onUpdate) onUpdate();
      setOpen(false);
    } catch (error) {
      toast.error(isHe ? 'שגיאה בשמירת ההגדרות' : 'Error saving settings');
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 border-purple-200 text-purple-700 hover:bg-purple-50"
        >
          <Settings2 className="w-4 h-4" />
          {isHe ? 'הסתר/הצג כפתורים' : 'Hide/Show Buttons'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto" dir={isHe ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-purple-600" />
            {isHe ? 'ניהול תצוגת כפתורים' : 'Manage Button Visibility'}
          </DialogTitle>
          <DialogDescription>
            {isHe 
              ? 'בחר אילו כפתורים יוצגו למשתתפים בדף הטיול'
              : 'Choose which buttons to show participants on the trip page'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {TAB_CONFIG.map((tab) => {
            const Icon = tab.icon;
            const isHidden = hiddenTabs.includes(tab.id);
            
            return (
              <div 
                key={tab.id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                  isHidden 
                    ? 'bg-gray-100 border-gray-200' 
                    : 'bg-white border-emerald-200 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isHidden ? 'bg-gray-200' : 'bg-emerald-100'}`}>
                    <Icon className={`w-4 h-4 ${isHidden ? 'text-gray-500' : 'text-emerald-600'}`} />
                  </div>
                  <span className={`font-medium ${isHidden ? 'text-gray-500' : 'text-gray-800'}`}>
                    {isHe ? tab.labelHe : tab.labelEn}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {isHidden ? (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-emerald-600" />
                  )}
                  <Switch
                    checked={!isHidden}
                    onCheckedChange={() => handleToggle(tab.id)}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setOpen(false)}
          >
            {isHe ? 'ביטול' : 'Cancel'}
          </Button>
          <Button
            className="flex-1 bg-purple-600 hover:bg-purple-700"
            onClick={handleSave}
            disabled={saving}
          >
            {saving 
              ? (isHe ? 'שומר...' : 'Saving...') 
              : (isHe ? 'שמור שינויים' : 'Save Changes')
            }
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}