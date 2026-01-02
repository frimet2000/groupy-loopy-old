import React, { useEffect } from 'react';
import { useLanguage } from '../components/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  CheckCircle, Users, CreditCard, MapPin, 
  Calendar, Shield, ArrowLeft, Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function TripPlanningGuide() {
  const { language, isRTL } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    // SEO Meta Tags
    document.title = language === 'he' 
      ? 'איך לארגן טיול קבוצתי ב-5 שלבים (בלי לשבור את הראש) | Groupy Loopy'
      : 'How to Organize a Group Trip in 5 Steps | Groupy Loopy';
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', language === 'he'
        ? 'מדריך מקצועי לארגון טיולים קבוצתיים: רשימת ציוד, גביית כספים, ניהול משתתפים, תכנון מסלול ושימוש במערכות דיגיטליות. כלים וטיפים מעשיים למארגני טיולים.'
        : 'Professional guide for organizing group trips: equipment list, payment collection, participant management, route planning and digital systems. Practical tools and tips for trip organizers.'
      );
    }

    // Add keywords
    const keywordsMeta = document.querySelector('meta[name="keywords"]') || document.createElement('meta');
    keywordsMeta.name = 'keywords';
    keywordsMeta.content = 'רשימת ציוד לטיול, גביית כספים, ניהול משתתפים, שביל ישראל, ארגון טיול קבוצתי, טופס הרשמה לטיול, מערכת ניהול טיולים';
    if (!document.querySelector('meta[name="keywords"]')) {
      document.head.appendChild(keywordsMeta);
    }

    return () => {
      document.title = 'Groupy Loopy';
    };
  }, [language]);

  const steps = [
    {
      number: 1,
      icon: Users,
      titleHe: 'הקמת רשימת משתתפים ואיסוף פרטים',
      titleEn: 'Building Participant List and Collecting Details',
      contentHe: 'השלב הראשון בארגון טיול קבוצתי מוצלח הוא יצירת רשימת משתתפים מסודרת. במקום לנהל טבלאות Excel מבולגנות או שרשורי WhatsApp אינסופיים, השתמשו בטופס רישום דיגיטלי שאוסף את כל המידע הנדרש: שמות מלאים, תעודות זהות לביטוח, מספרי טלפון לחירום, דרישות נגישות מיוחדות, והעדפות תזונה. Groupy Loopy מאפשר למשתתפים למלא את הפרטים בעצמם, לבחור ימים ספציפיים (במקרה של טראק רב-יומי), ולציין את בני המשפחה המצטרפים - הכל באופן אוטומטי ללא עבודת מזכירות מיותרת.',
      contentEn: 'The first step in organizing a successful group trip is creating an organized participant list. Instead of managing messy Excel spreadsheets or endless WhatsApp threads, use a digital registration form that collects all required information: full names, ID numbers for insurance, emergency phone numbers, special accessibility needs, and dietary preferences. Groupy Loopy allows participants to fill in their details themselves, select specific days (for multi-day treks), and specify joining family members - all automatically without unnecessary administrative work.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      number: 2,
      icon: CreditCard,
      titleHe: 'גביית כספים ומעקב תשלומים',
      titleEn: 'Payment Collection and Tracking',
      contentHe: 'אחד האתגרים הגדולים בארגון טיולים קבוצתיים הוא גביית הכספים. במקום לנהל העברות בנקאיות ידניות, ביט, פייבוקס וסימון תשלומים בטבלה - השתמשו במערכת גביה אוטומטית. עם Groupy Loopy, כל משתתף מקבל לינק תשלום אישי, המערכת מחשבת אוטומטית את המחיר לפי מספר המבוגרים והילדים, ומעדכנת את סטטוס התשלום בזמן אמת. זה חוסך שעות של עבודה ומונע טעויות אנוש. למארגני טראקים גדולים - זה משנה חיים לגמרי.',
      contentEn: 'One of the biggest challenges in organizing group trips is collecting payments. Instead of managing manual bank transfers, Bit, Paybox and marking payments in a spreadsheet - use an automatic collection system. With Groupy Loopy, each participant receives a personal payment link, the system automatically calculates the price by number of adults and children, and updates payment status in real-time. This saves hours of work and prevents human errors. For large trek organizers - this is a complete game-changer.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      number: 3,
      icon: MapPin,
      titleHe: 'תכנון מסלול ונקודות ציון',
      titleEn: 'Route Planning and Waypoints',
      contentHe: 'לאחר שיש לכם רשימת משתתפים וכספים, הגיע הזמן לתכנן את המסלול בפועל. בין אם זה טיול יומי בגליל, טראק של שבוע בשביל ישראל, או יום כיף משפחתי - חשוב לסמן את נקודות המפגש, תחנות המנוחה, ומקורות המים על המפה. Groupy Loopy מציעה מפות אינטראקטיביות עם יכולת סימון waypoints, שיתוף המיקום עם כל המשתתפים, ואפילו ניווט ישיר ל-Waze או Google Maps. אם אתם מתכננים טראק רב-יומי, תוכלו ליצור מפה נפרדת לכל יום עם נקודות הציון הרלוונטיות.',
      contentEn: 'After you have a participant list and payments, it\'s time to plan the actual route. Whether it\'s a day trip in the Galilee, a week-long Israel Trail trek, or a family fun day - it\'s important to mark meeting points, rest stops, and water sources on the map. Groupy Loopy offers interactive maps with waypoint marking capability, location sharing with all participants, and even direct navigation to Waze or Google Maps. If you\'re planning a multi-day trek, you can create a separate map for each day with relevant waypoints.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      number: 4,
      icon: Calendar,
      titleHe: 'ניהול לוגיסטיקה: ציוד, ארוחות ולינה',
      titleEn: 'Logistics Management: Equipment, Meals and Accommodation',
      contentHe: 'רשימת ציוד לטיול היא קריטית - במיוחד בטיולים ארוכים. במקום לשלוח הודעת WhatsApp עם רשימה שאף אחד לא שומר, צרו רשימת ציוד דיגיטלית שכל משתתף יכול לראות בכל רגע. לטראקים רב-יומיים, תוכלו לציין ציוד שונה לכל יום. בנוסף, עם מערכת הצ\'ק-אין של Groupy Loopy תוכלו לעקוב אחר ארוחות (צהריים, ערב, ארוחת בוקר), לינה, ומי מגיע ברכב - הכל דרך סריקת QR פשוטה. זה מאפשר לכם לדעת בדיוק כמה אנשים מגיעים לכל ארוחה וכמה מקומות לינה נדרשים.',
      contentEn: 'An equipment list for the trip is critical - especially for long trips. Instead of sending a WhatsApp message with a list that no one saves, create a digital equipment list that every participant can see at any time. For multi-day treks, you can specify different equipment for each day. Additionally, with Groupy Loopy\'s check-in system you can track meals (lunch, dinner, breakfast), accommodation, and who\'s coming by car - all through simple QR scanning. This allows you to know exactly how many people are coming to each meal and how many accommodation spots are needed.',
      color: 'from-amber-500 to-orange-500'
    },
    {
      number: 5,
      icon: Shield,
      titleHe: 'כתבי ויתור, ביטוח והנצחה',
      titleEn: 'Waivers, Insurance and Memorials',
      contentHe: 'השלב האחרון והחשוב ביותר הוא הטיפול בהיבטים המשפטיים והרגשיים. כל משתתף חייב לאשר כתב ויתור שמגן עליכם כמארגנים, ולספק פרטי ביטוח נסיעות. במקרה של טראקים מיוחדים כמו "נפגשים בשביל ישראל", המערכת מאפשרת גם ניהול בקשות הנצחה - משפחות יכולות להגיש בקשה להנציח חלל, להעלות תמונה וסיפור, והמארגן יכול להקצות את ההנצחות לימים ספציפיים בטראק. Groupy Loopy מנהלת את כל התהליך הזה דיגיטלית, כולל אישורים והודעות אוטומטיות למשפחות.',
      contentEn: 'The last and most important step is handling legal and emotional aspects. Every participant must approve a waiver that protects you as organizers, and provide travel insurance details. For special treks like "Nifgashim Bishvil Israel", the system also allows memorial request management - families can submit a request to memorialize a fallen soldier, upload a photo and story, and the organizer can assign memorials to specific days in the trek. Groupy Loopy manages this entire process digitally, including approvals and automatic notifications to families.',
      color: 'from-red-500 to-rose-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/20 to-teal-50/20 pb-16">
      {/* Back Button */}
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl('Home'))}
          className="gap-2"
        >
          {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          {language === 'he' ? 'חזרה לדף הבית' : 'Back to Home'}
        </Button>
      </div>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full mb-6 font-semibold text-sm">
            <Sparkles className="w-4 h-4" />
            {language === 'he' ? 'מדריך מקצועי' : 'Professional Guide'}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6" dir={isRTL ? 'rtl' : 'ltr'}>
            {language === 'he' 
              ? 'איך לארגן טיול קבוצתי ב-5 שלבים (בלי לשבור את הראש)'
              : 'How to Organize a Group Trip in 5 Steps (Without Losing Your Mind)'}
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
            {language === 'he'
              ? 'מדריך שלב אחר שלב לארגון טיולים קבוצתיים מוצלחים - מרישום משתתפים וגביית כספים ועד ניהול לוגיסטיקה והנצחה. הכל שתצטרכו לדעת כדי להפוך את הטיול הבא שלכם לחוויה בלתי נשכחת.'
              : 'A step-by-step guide to organizing successful group trips - from participant registration and payment collection to logistics management and memorials. Everything you need to know to make your next trip an unforgettable experience.'}
          </p>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 space-y-8" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Introduction */}
        <Card className="border-2 border-emerald-200 shadow-xl">
          <CardContent className="p-8 prose prose-lg max-w-none" dir={isRTL ? 'rtl' : 'ltr'}>
            <p className="text-gray-700 leading-relaxed text-lg">
              {language === 'he' ? (
                <>
                  ארגון טיול קבוצתי - בין אם זה טראק של שבוע בשביל ישראל, יום טיול משפחתי או אירוע חברה - 
                  יכול להיראות כמו משימה מפחידה. רשימות משתתפים שמשתנות כל הזמן, גביית כספים מעשרות אנשים, 
                  תיאום ציוד, תכנון מסלול, וטיפול בבקשות מיוחדות. אבל עם התכנון הנכון והכלים המתאימים, 
                  אפשר להפוך את התהליך לפשוט ומהנה. במדריך הזה נעבור על חמשת השלבים המרכזיים שכל מארגן 
                  טיולים צריך לעבור, ונראה איך פלטפורמה דיגיטלית כמו <strong>Groupy Loopy</strong> יכולה לחסוך 
                  לכם שעות של עבודה ומתח מיותר.
                </>
              ) : (
                <>
                  Organizing a group trip - whether it's a week-long Israel Trail trek, a family day trip, or a company event - 
                  can seem like a daunting task. Participant lists that constantly change, collecting payments from dozens of people, 
                  coordinating equipment, route planning, and handling special requests. But with proper planning and the right tools, 
                  you can make the process simple and enjoyable. In this guide, we'll go through the five main steps every trip 
                  organizer needs to follow, and see how a digital platform like <strong>Groupy Loopy</strong> can save you 
                  hours of work and unnecessary stress.
                </>
              )}
            </p>
          </CardContent>
        </Card>

        {/* Steps */}
        {steps.map((step, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="border-2 border-gray-200 shadow-xl hover:shadow-2xl transition-all">
              <CardContent className="p-8">
                <div className="flex items-start gap-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-lg">
                        {step.number}
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {language === 'he' ? step.titleHe : step.titleEn}
                      </h2>
                    </div>
                    <p className="text-gray-700 leading-relaxed text-lg">
                      {language === 'he' ? step.contentHe : step.contentEn}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {/* Additional Tips Section */}
        <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-xl">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-indigo-900 mb-6 flex items-center gap-3">
              <CheckCircle className="w-7 h-7" />
              {language === 'he' ? 'טיפים נוספים להצלחה' : 'Additional Tips for Success'}
            </h2>
            <div className="space-y-4 text-gray-700">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-indigo-600 mt-2 flex-shrink-0"></div>
                <p className="text-lg leading-relaxed">
                  {language === 'he' 
                    ? <><strong>רשימת ציוד לטיול:</strong> הכינו רשימה מפורטת לפי סוג השטח - מדבר דורש הגנה מהשמש וכמות מים גדולה יותר, הרים דורשים ביגוד חם לשעות הערב, וטיולי מים דורשים נעליים מתאימות.</>
                    : <><strong>Trip Equipment List:</strong> Prepare a detailed list according to terrain type - desert requires sun protection and more water, mountains require warm clothing for evening hours, and water trips require appropriate footwear.</>}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-indigo-600 mt-2 flex-shrink-0"></div>
                <p className="text-lg leading-relaxed">
                  {language === 'he'
                    ? <><strong>תקשורת עם המשתתפים:</strong> שלחו הודעות תזכורת שבוע לפני, יום לפני, ובבוקר הטיול. כלול פרטי התכנסות מדויקים, רשימת ציוד, ופרטי התקשרות שלכם.</>
                    : <><strong>Participant Communication:</strong> Send reminder messages a week before, a day before, and on the morning of the trip. Include exact meeting details, equipment list, and your contact information.</>}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-indigo-600 mt-2 flex-shrink-0"></div>
                <p className="text-lg leading-relaxed">
                  {language === 'he'
                    ? <><strong>ניהול משתתפים בזמן אמת:</strong> במהלך הטיול, השתמשו בכלי מעקב דיגיטלי לוודא שכולם נמצאים, לסמן מי הגיע לנקודות ציון, ולנהל אירועים לא צפויים בצורה מסודרת.</>
                    : <><strong>Real-time Participant Management:</strong> During the trip, use digital tracking tools to ensure everyone is present, mark who arrived at waypoints, and manage unexpected events in an organized manner.</>}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-4 border-emerald-400 bg-gradient-to-br from-emerald-600 to-teal-600 shadow-2xl">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {language === 'he' ? 'מוכנים להתחיל?' : 'Ready to Get Started?'}
              </h2>
              <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
                {language === 'he'
                  ? 'הפכו את הטיול הקבוצתי הבא שלכם למאורגן לחלוטין עם Groupy Loopy. רישום משתתפים, גביית תשלומים, מפות, צ\'אט והנצחה - הכל במקום אחד, בחינם.'
                  : 'Make your next group trip completely organized with Groupy Loopy. Participant registration, payment collection, maps, chat and memorials - all in one place, for free.'}
              </p>
              <Button
                size="lg"
                onClick={() => navigate(createPageUrl('CreateTrip'))}
                className="bg-white text-emerald-600 hover:bg-gray-100 text-xl px-10 py-7 shadow-2xl hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all"
              >
                <CheckCircle className="w-6 h-6 mr-2" />
                {language === 'he' ? 'צור את הטיול הראשון שלך' : 'Create Your First Trip'}
              </Button>
              <p className="text-sm text-emerald-200 mt-4">
                {language === 'he' ? '✓ ללא כרטיס אשראי  ✓ ללא התחייבות  ✓ תמיכה מלאה בעברית' : '✓ No credit card  ✓ No commitment  ✓ Full Hebrew support'}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Related Resources */}
        <Card className="border-2 border-gray-200 shadow-lg">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6" dir={isRTL ? 'rtl' : 'ltr'}>
              {language === 'he' ? 'משאבים נוספים' : 'Additional Resources'}
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={() => navigate(createPageUrl('Features'))}
                className="h-auto py-4 justify-start text-right"
                dir={isRTL ? 'rtl' : 'ltr'}
              >
                <div className="flex items-center gap-3 w-full">
                  <Users className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <div className="text-right flex-1">
                    <div className="font-bold text-gray-900">
                      {language === 'he' ? 'כל התכונות' : 'All Features'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {language === 'he' ? 'גלה את כל היכולות של המערכת' : 'Discover all system capabilities'}
                    </div>
                  </div>
                </div>
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(createPageUrl('NifgashimPortal'))}
                className="h-auto py-4 justify-start text-right"
                dir={isRTL ? 'rtl' : 'ltr'}
              >
                <div className="flex items-center gap-3 w-full">
                  <Heart className="w-5 h-5 text-rose-600 flex-shrink-0" />
                  <div className="text-right flex-1">
                    <div className="font-bold text-gray-900">
                      {language === 'he' ? 'נפגשים בשביל ישראל' : 'Nifgashim Bishvil Israel'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {language === 'he' ? 'רישום לטראק והנצחת חללים' : 'Trek registration and memorial management'}
                    </div>
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* SEO Footer Text */}
        <div className="text-center text-sm text-gray-500 py-8 border-t border-gray-200">
          <p>
            {language === 'he' ? (
              <>
                <strong>Groupy Loopy</strong> - המערכת המובילה בישראל לניהול טיולים קבוצתיים. 
                רישום משתתפים דיגיטלי, גביית תשלומים אוטומטית, ניהול לוגיסטיקה מתקדם, 
                מפות אינטראקטיביות ומערכת הנצחה ייחודית לטראקים מיוחדים. 
                מתאים למדריכי טיולים, ארגוני נוער, בתי ספר וקהילות. התחל בחינם עוד היום.
              </>
            ) : (
              <>
                <strong>Groupy Loopy</strong> - Israel's leading system for group trip management. 
                Digital participant registration, automatic payment collection, advanced logistics management, 
                interactive maps and unique memorial system for special treks. 
                Suitable for tour guides, youth organizations, schools and communities. Start free today.
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}