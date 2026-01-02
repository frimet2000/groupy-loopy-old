import React from 'react';
import { useLanguage } from '../components/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Users, CreditCard, QrCode, MapPin, Calendar, 
  MessageSquare, Shield, Bell, Globe, BarChart3,
  Heart, Camera, Route, CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Features() {
  const { language, isRTL } = useLanguage();
  const navigate = useNavigate();

  const features = [
    {
      icon: Users,
      titleHe: 'רישום משתתפים דיגיטלי',
      titleEn: 'Digital Participant Registration',
      descHe: 'טפסי רישום מתקדמים עם אימות פרטים, בחירת ימים לטראקים, ופרטי משפחה מלאים',
      descEn: 'Advanced registration forms with data validation, trek day selection, and complete family details',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: CreditCard,
      titleHe: 'גביית תשלומים אוטומטית',
      titleEn: 'Automatic Payment Collection',
      descHe: 'אינטגרציה עם Stripe לתשלומים מאובטחים, חישוב מחיר אוטומטי לפי מבוגרים וילדים',
      descEn: 'Stripe integration for secure payments, automatic pricing by adults and children',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: QrCode,
      titleHe: 'צ\'ק-אין QR חכם',
      titleEn: 'Smart QR Check-in',
      descHe: 'סריקת משתתפים בזמן אמת, מעקב אחר ארוחות ולינה, סטטיסטיקות מתקדמות',
      descEn: 'Real-time participant scanning, meal and accommodation tracking, advanced statistics',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: MapPin,
      titleHe: 'מפות אינטראקטיביות',
      titleEn: 'Interactive Maps',
      descHe: 'תכנון מסלולים, נקודות ציון, שיתוף מיקום חי, ניווט למשתתפים',
      descEn: 'Route planning, waypoints, live location sharing, participant navigation',
      color: 'from-red-500 to-orange-500'
    },
    {
      icon: Heart,
      titleHe: 'ניהול הנצחות',
      titleEn: 'Memorial Management',
      descHe: 'מערכת מיוחדת להנצחת חללים בטראקים, הקצאה חכמה לימים, העלאת תמונות',
      descEn: 'Special system for fallen soldiers memorials in treks, smart day assignment, photo uploads',
      color: 'from-rose-500 to-pink-500'
    },
    {
      icon: MessageSquare,
      titleHe: 'צ\'אט קבוצתי מתקדם',
      titleEn: 'Advanced Group Chat',
      descHe: 'הודעות קבוצתיות ופרטיות, שיתוף תמונות, התראות push',
      descEn: 'Group and private messages, photo sharing, push notifications',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      icon: Calendar,
      titleHe: 'לוח זמנים יומי',
      titleEn: 'Daily Itinerary',
      descHe: 'תכנון פעילויות לכל יום, ניהול ציוד, המלצות מים והכנה',
      descEn: 'Daily activity planning, equipment management, water and preparation recommendations',
      color: 'from-amber-500 to-yellow-500'
    },
    {
      icon: Shield,
      titleHe: 'כתבי ויתור דיגיטליים',
      titleEn: 'Digital Waivers',
      descHe: 'מערכת הצהרות מותאמת אישית, אישור תנאים, שמירת רשומות',
      descEn: 'Custom declaration system, terms acceptance, record keeping',
      color: 'from-red-600 to-rose-600'
    },
    {
      icon: Bell,
      titleHe: 'הודעות מתוזמנות',
      titleEn: 'Scheduled Messages',
      descHe: 'תזכורות אוטומטיות, הודעות לפני טיול, עדכונים בזמן אמת',
      descEn: 'Automatic reminders, pre-trip messages, real-time updates',
      color: 'from-yellow-500 to-amber-500'
    },
    {
      icon: BarChart3,
      titleHe: 'דוחות וסטטיסטיקות',
      titleEn: 'Reports & Statistics',
      descHe: 'ניתוח משתתפים, מעקב תשלומים, סטטיסטיקות צ\'ק-אין',
      descEn: 'Participant analysis, payment tracking, check-in statistics',
      color: 'from-cyan-500 to-blue-500'
    },
    {
      icon: Globe,
      titleHe: 'תמיכה רב-לשונית',
      titleEn: 'Multi-language Support',
      descHe: 'עברית, אנגלית, רוסית, ספרדית, צרפתית, גרמנית ואיטלקית',
      descEn: 'Hebrew, English, Russian, Spanish, French, German and Italian',
      color: 'from-teal-500 to-green-500'
    },
    {
      icon: Camera,
      titleHe: 'גלריית תמונות משותפת',
      titleEn: 'Shared Photo Gallery',
      descHe: 'העלאת תמונות, תיוג, לייקים ושיתוף חוויות',
      descEn: 'Photo uploads, tagging, likes and experience sharing',
      color: 'from-pink-500 to-rose-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            {language === 'he' ? 'כל מה שצריך לניהול טיולים קבוצתיים' : 'Everything You Need for Group Trip Management'}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl mb-8 text-emerald-100"
          >
            {language === 'he' 
              ? 'מערכת מקצועית ומקיפה לניהול כל היבטי הטיול - מרישום ועד סיום'
              : 'Professional and comprehensive system for managing all aspects of your trip'}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Button
              size="lg"
              onClick={() => navigate(createPageUrl('CreateTrip'))}
              className="bg-white text-emerald-600 hover:bg-gray-100 text-xl px-8 py-6 shadow-2xl"
            >
              <CheckCircle className="w-6 h-6 mr-2" />
              {language === 'he' ? 'התחל בחינם' : 'Start Free'}
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12" dir={isRTL ? 'rtl' : 'ltr'}>
          {language === 'he' ? 'תכונות מתקדמות' : 'Advanced Features'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="h-full hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-2">
                <CardHeader>
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <CardTitle className="text-xl" dir={isRTL ? 'rtl' : 'ltr'}>
                    {language === 'he' ? feature.titleHe : feature.titleEn}
                  </CardTitle>
                </CardHeader>
                <CardContent dir={isRTL ? 'rtl' : 'ltr'}>
                  <p className="text-gray-600 leading-relaxed">
                    {language === 'he' ? feature.descHe : feature.descEn}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {language === 'he' ? 'מוכנים להתחיל?' : 'Ready to Get Started?'}
          </h2>
          <p className="text-xl mb-8 text-purple-100">
            {language === 'he' 
              ? 'הצטרפו למאות מארגני טיולים שכבר משתמשים ב-Groupy Loopy'
              : 'Join hundreds of trip organizers already using Groupy Loopy'}
          </p>
          <Button
            size="lg"
            onClick={() => navigate(createPageUrl('CreateTrip'))}
            className="bg-white text-purple-600 hover:bg-gray-100 text-xl px-8 py-6 shadow-2xl"
          >
            {language === 'he' ? 'צור טיול ראשון' : 'Create First Trip'}
          </Button>
        </div>
      </div>
    </div>
  );
}