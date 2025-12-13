import React, { useState, useEffect } from 'react';
import { useLanguage } from '../components/LanguageContext';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { motion } from 'framer-motion';
import { 
  Bell, 
  Users, 
  MessageSquare, 
  Calendar, 
  TrendingUp, 
  Save,
  Loader2,
  Sparkles
} from 'lucide-react';

export default function Settings() {
  const { t, language, isRTL } = useLanguage();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notificationPrefs, setNotificationPrefs] = useState({
    friend_requests: true,
    trip_updates: true,
    new_messages: true,
    upcoming_trips: true,
    trip_invitations: true,
    join_requests: true,
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        
        // Load existing preferences
        if (userData.notification_preferences) {
          setNotificationPrefs(userData.notification_preferences);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        toast.error(language === 'he' ? 'שגיאה בטעינת נתונים' : 'Error loading data');
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const handleToggle = (key) => {
    setNotificationPrefs(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({
        notification_preferences: notificationPrefs
      });
      toast.success(language === 'he' ? 'ההגדרות נשמרו בהצלחה' : 'Settings saved successfully');
    } catch (error) {
      toast.error(language === 'he' ? 'שגיאה בשמירת הגדרות' : 'Error saving settings');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const notificationOptions = [
    {
      key: 'friend_requests',
      icon: Users,
      title: language === 'he' ? 'בקשות חברות' : 'Friend Requests',
      description: language === 'he' 
        ? 'קבל התראות כאשר מישהו שולח לך בקשת חברות' 
        : 'Get notified when someone sends you a friend request',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      key: 'trip_updates',
      icon: TrendingUp,
      title: language === 'he' ? 'עדכוני טיולים' : 'Trip Updates',
      description: language === 'he' 
        ? 'קבל התראות על שינויים בטיולים שהצטרפת אליהם' 
        : 'Get notified about changes in trips you joined',
      color: 'from-emerald-500 to-teal-600'
    },
    {
      key: 'new_messages',
      icon: MessageSquare,
      title: language === 'he' ? 'הודעות חדשות' : 'New Messages',
      description: language === 'he' 
        ? 'קבל התראות על הודעות חדשות בצ\'אט הטיולים' 
        : 'Get notified about new messages in trip chats',
      color: 'from-purple-500 to-pink-600'
    },
    {
      key: 'upcoming_trips',
      icon: Calendar,
      title: language === 'he' ? 'טיולים מתקרבים' : 'Upcoming Trips',
      description: language === 'he' 
        ? 'קבל תזכורות לטיולים שרשומים אליהם (יום לפני)' 
        : 'Get reminders for trips you joined (1 day before)',
      color: 'from-orange-500 to-red-600'
    },
    {
      key: 'trip_invitations',
      icon: Bell,
      title: language === 'he' ? 'הזמנות לטיולים' : 'Trip Invitations',
      description: language === 'he' 
        ? 'קבל התראות כאשר מוזמנים אותך לטיול פרטי' 
        : 'Get notified when invited to a private trip',
      color: 'from-pink-500 to-rose-600'
    },
    {
      key: 'join_requests',
      icon: Users,
      title: language === 'he' ? 'בקשות הצטרפות' : 'Join Requests',
      description: language === 'he' 
        ? 'קבל התראות על בקשות להצטרף לטיולים שארגנת' 
        : 'Get notified about join requests for trips you organize',
      color: 'from-cyan-500 to-blue-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-8 px-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl shadow-lg">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              {language === 'he' ? 'הגדרות התראות' : 'Notification Settings'}
            </h1>
          </div>
          <p className="text-gray-600">
            {language === 'he' 
              ? 'נהל את העדפות ההתראות שלך ובחר איזה עדכונים תרצה לקבל' 
              : 'Manage your notification preferences and choose which updates you want to receive'}
          </p>
        </motion.div>

        <Card className="mb-6 border-2 border-gray-100 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              {language === 'he' ? 'העדפות התראות' : 'Notification Preferences'}
            </CardTitle>
            <CardDescription>
              {language === 'he'
                ? 'בחר איזה התראות תרצה לקבל'
                : 'Choose which notifications you want to receive'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {notificationOptions.map((option, index) => {
              const Icon = option.icon;
              return (
                <motion.div
                  key={option.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-start justify-between p-4 rounded-2xl hover:bg-gray-50 transition-all group">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`p-3 bg-gradient-to-br ${option.color} rounded-xl shadow-md group-hover:shadow-lg transition-all`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <Label 
                          htmlFor={option.key} 
                          className="text-base font-semibold cursor-pointer block mb-1"
                        >
                          {option.title}
                        </Label>
                        <p className="text-sm text-gray-500">
                          {option.description}
                        </p>
                      </div>
                    </div>
                    <Switch
                      id={option.key}
                      checked={notificationPrefs[option.key]}
                      onCheckedChange={() => handleToggle(option.key)}
                      className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-emerald-500 data-[state=checked]:to-teal-600"
                    />
                  </div>
                  {index < notificationOptions.length - 1 && <Separator className="my-2" />}
                </motion.div>
              );
            })}
          </CardContent>
        </Card>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full h-14 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <Save className="w-5 h-5 mr-2" />
            )}
            {saving 
              ? (language === 'he' ? 'שומר...' : 'Saving...') 
              : (language === 'he' ? 'שמור הגדרות' : 'Save Settings')}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}