import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguage } from '../components/LanguageContext';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { User, Mail, Save, Loader2, Settings, MapPin, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

const interests = ['nature', 'history', 'photography', 'birdwatching', 'archaeology', 'geology', 'botany', 'extreme_sports', 'family_friendly', 'romantic'];
const regions = ['north', 'center', 'south', 'jerusalem', 'negev', 'eilat'];

export default function Profile() {
  const { t, language, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    preferred_regions: [],
    preferred_interests: [],
    preferred_difficulty: '',
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        if (userData.preferred_regions) {
          setPreferences({
            preferred_regions: userData.preferred_regions || [],
            preferred_interests: userData.preferred_interests || [],
            preferred_difficulty: userData.preferred_difficulty || '',
          });
        }
      } catch (e) {
        base44.auth.redirectToLogin(createPageUrl('Profile'));
      }
    };
    fetchUser();
  }, []);

  const togglePreference = (field, value) => {
    setPreferences(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await base44.auth.updateMe(preferences);
      toast.success(language === 'he' ? 'ההעדפות נשמרו' : 'Preferences saved');
    } catch (error) {
      toast.error(language === 'he' ? 'שגיאה בשמירת ההעדפות' : 'Error saving preferences');
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Profile Header */}
          <Card className="mb-6 border-0 shadow-lg overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-emerald-500 to-emerald-700" />
            <CardContent className="relative pt-0 pb-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-12 sm:-mt-10">
                <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                  <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white text-2xl font-bold">
                    {user.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center sm:text-start flex-1">
                  <h1 className="text-2xl font-bold text-gray-900">{user.full_name}</h1>
                  <p className="text-gray-500 flex items-center justify-center sm:justify-start gap-2">
                    <Mail className="w-4 h-4" />
                    {user.email}
                  </p>
                </div>
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                  {user.role === 'admin' ? (language === 'he' ? 'מנהל' : 'Admin') : (language === 'he' ? 'משתמש' : 'User')}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-emerald-600" />
                {language === 'he' ? 'העדפות טיולים' : 'Trip Preferences'}
              </CardTitle>
              <CardDescription>
                {language === 'he' 
                  ? 'הגדר את ההעדפות שלך לקבלת המלצות מותאמות אישית'
                  : 'Set your preferences for personalized recommendations'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Preferred Regions */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  {language === 'he' ? 'אזורים מועדפים' : 'Preferred Regions'}
                </Label>
                <div className="flex flex-wrap gap-2">
                  {regions.map(region => (
                    <Badge
                      key={region}
                      variant={preferences.preferred_regions.includes(region) ? 'default' : 'outline'}
                      className={`cursor-pointer transition-all py-2 px-3 ${
                        preferences.preferred_regions.includes(region) 
                          ? 'bg-blue-600 hover:bg-blue-700' 
                          : 'hover:border-blue-500 hover:text-blue-600'
                      }`}
                      onClick={() => togglePreference('preferred_regions', region)}
                    >
                      {t(region)}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Preferred Interests */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-600" />
                  {language === 'he' ? 'תחומי עניין' : 'Interests'}
                </Label>
                <div className="flex flex-wrap gap-2">
                  {interests.map(interest => (
                    <Badge
                      key={interest}
                      variant={preferences.preferred_interests.includes(interest) ? 'default' : 'outline'}
                      className={`cursor-pointer transition-all py-2 px-3 ${
                        preferences.preferred_interests.includes(interest) 
                          ? 'bg-rose-600 hover:bg-rose-700' 
                          : 'hover:border-rose-500 hover:text-rose-600'
                      }`}
                      onClick={() => togglePreference('preferred_interests', interest)}
                    >
                      {t(interest)}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              <Button 
                onClick={handleSave}
                disabled={loading}
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {t('save')}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}