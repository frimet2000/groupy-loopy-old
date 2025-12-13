import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../components/LanguageContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Accessibility, Eye, Ear, Keyboard, Mouse, Smartphone, Mail, AlertCircle } from 'lucide-react';

export default function AccessibilityStatement() {
  const { language, isRTL } = useLanguage();
  const navigate = useNavigate();

  const content = language === 'he' ? {
    title: 'הצהרת נגישות',
    lastUpdated: 'עודכן לאחרונה: 13 בדצמבר 2025',
    intro: 'The Group Loop מחויבת להנגיש את האפליקציה והשירותים שלה לכלל האוכלוסייה, כולל אנשים עם מוגבלות. אנו פועלים למימוש זכותם של כל האנשים לגלוש באתר באופן עצמאי, יעיל, שוויוני ונוח.',
    sections: [
      {
        icon: Accessibility,
        title: 'רמת הנגישות',
        text: 'האפליקציה מתוכננת בהתאם לתקן הבינלאומי לנגישות תכנים באינטרנט (WCAG 2.1) ברמה AA. הנגשת האפליקציה בוצעה על פי המלצות התקן הישראלי (ת"י 5568) לנגישות תכנים באינטרנט.'
      },
      {
        icon: Eye,
        title: 'נגישות לאנשים עם לקות ראייה',
        items: [
          'תמיכה מלאה בקוראי מסך (Screen Readers) כגון NVDA, JAWS ו-VoiceOver',
          'כפתור הנגשה צף להגדלת גודל הגופן (80%-150%)',
          'מצב ניגודיות גבוהה להתאמת התצוגה',
          'טקסט אלטרנטיבי (Alt Text) לכל התמונות והאיקונים',
          'ניווט באמצעות מקלדת בלבד',
          'סדר קריאה לוגי של התוכן',
          'תיוג נכון של כותרות וכפתורים'
        ]
      },

      {
        icon: Keyboard,
        title: 'נגישות מקלדת',
        items: [
          'ניווט מלא באמצעות מקלדת (Tab, Enter, Space)',
          'סימון ברור של האלמנט הפעיל',
          'קיצורי דרך נוחים לפעולות נפוצות',
          'אפשרות לדלג על תפריט הניווט (Skip to Content)'
        ]
      },
      {
        icon: Mouse,
        title: 'נגישות תפעולית',
        items: [
          'כפתורים ואזורי לחיצה גדולים',
          'זמן תגובה מספיק לביצוע פעולות',
          'אפשרות לביטול ותיקון טעויות',
          'הימנעות מתוכן מהבהב שעלול לגרום להתקפים'
        ]
      },
      {
        icon: Smartphone,
        title: 'נגישות בנייד',
        items: [
          'ממשק מותאם למסכי מגע',
          'תמיכה בתכונות נגישות של iOS ו-Android',
          'ניווט קל באמצעות מחוות',
          'אפשרות להגדלת מסך בזום'
        ]
      },
      {
        icon: AlertCircle,
        title: 'חריגים ומגבלות',
        text: 'למרות מאמצינו, ייתכנו חלקים באפליקציה שטרם הונגשו במלואם. אנו ממשיכים לעבוד על שיפור הנגישות ומעודכנים את האפליקציה באופן שוטף.',
        items: [
          'תכנים שהועלו על ידי משתמשים - אין לנו שליטה על נגישותם',
          'שירותים של צד שלישי - עשויים להיות בעלי מגבלות נגישות',
          'תכנים ישנים - נמצאים בתהליך הנגשה הדרגתי'
        ]
      },
      {
        icon: Mail,
        title: 'רכז נגישות ויצירת קשר',
        text: 'אם נתקלת בבעיית נגישות באפליקציה, או שיש לך הצעות לשיפור הנגישות, נשמח לשמוע ממך:',
        contact: [
          'דוא"ל: frimet@gmail.com'
        ]
      },
      {
        icon: Accessibility,
        title: 'התאמות נגישות בטיולים',
        text: 'האפליקציה מאפשרת למארגני טיולים לסמן את רמת הנגישות של הטיול ולציין התאמות מיוחדות. משתתפים יכולים לציין את צרכי הנגישות שלהם בעת ההצטרפות לטיול.'
      }
    ],
    commitment: {
      title: 'המחויבות שלנו',
      text: 'אנו ב-The Group Loop מאמינים שלכל אדם מגיע גישה שווה למידע ולשירותים. אנו ממשיכים לעבוד על שיפור הנגישות, לבצע בדיקות תקופתיות, ולעדכן את האפליקציה בהתאם לתקנים המשתנים והצרכים המשתנים של הקהילה שלנו.'
    }
  } : {
    title: 'Accessibility Statement',
    lastUpdated: 'Last Updated: December 13, 2025',
    intro: 'The Group Loop is committed to making its app and services accessible to the entire population, including people with disabilities. We work to realize the right of all people to browse the site independently, efficiently, equally, and conveniently.',
    sections: [
      {
        icon: Accessibility,
        title: 'Accessibility Level',
        text: 'The app is designed according to the Web Content Accessibility Guidelines (WCAG 2.1) Level AA. The app accessibility was implemented according to the Israeli Standard (IS 5568) for web content accessibility.'
      },
      {
        icon: Eye,
        title: 'Accessibility for People with Visual Impairments',
        items: [
          'Full support for screen readers such as NVDA, JAWS, and VoiceOver',
          'Floating accessibility button to increase font size (80%-150%)',
          'High contrast mode for display adjustment',
          'Alternative text (Alt Text) for all images and icons',
          'Navigation using keyboard only',
          'Logical reading order of content',
          'Proper labeling of headings and buttons'
        ]
      },

      {
        icon: Keyboard,
        title: 'Keyboard Accessibility',
        items: [
          'Full navigation using keyboard (Tab, Enter, Space)',
          'Clear marking of the active element',
          'Convenient shortcuts for common actions',
          'Option to skip navigation menu (Skip to Content)'
        ]
      },
      {
        icon: Mouse,
        title: 'Operational Accessibility',
        items: [
          'Large buttons and clickable areas',
          'Sufficient response time for actions',
          'Option to cancel and correct errors',
          'Avoiding flashing content that may cause seizures'
        ]
      },
      {
        icon: Smartphone,
        title: 'Mobile Accessibility',
        items: [
          'Touch screen adapted interface',
          'Support for iOS and Android accessibility features',
          'Easy navigation using gestures',
          'Option to zoom in on screen'
        ]
      },
      {
        icon: AlertCircle,
        title: 'Exceptions and Limitations',
        text: 'Despite our efforts, there may be parts of the app that have not yet been fully made accessible. We continue to work on improving accessibility and update the app regularly.',
        items: [
          'User-uploaded content - we have no control over their accessibility',
          'Third-party services - may have accessibility limitations',
          'Old content - undergoing gradual accessibility process'
        ]
      },
      {
        icon: Mail,
        title: 'Accessibility Coordinator and Contact',
        text: 'If you encounter an accessibility problem in the app, or have suggestions for improving accessibility, we would love to hear from you:',
        contact: [
          'Email: frimet@gmail.com'
        ]
      },
      {
        icon: Accessibility,
        title: 'Accessibility Accommodations in Trips',
        text: 'The app allows trip organizers to mark the accessibility level of the trip and specify special accommodations. Participants can indicate their accessibility needs when joining a trip.'
      }
    ],
    commitment: {
      title: 'Our Commitment',
      text: 'At The Group Loop, we believe everyone deserves equal access to information and services. We continue to work on improving accessibility, conduct periodic checks, and update the app according to changing standards and the changing needs of our community.'
    }
  } : language === 'ru' ? {
    title: 'Заявление о доступности',
    lastUpdated: 'Последнее обновление: 13 декабря 2025',
    intro: 'The Group Loop стремится сделать свое приложение и услуги доступными для всего населения, включая людей с ограниченными возможностями. Мы работаем над реализацией права всех людей просматривать сайт самостоятельно, эффективно, на равных и удобно.',
    sections: [
      {
        icon: Accessibility,
        title: 'Уровень доступности',
        text: 'Приложение разработано в соответствии с международным стандартом доступности веб-контента (WCAG 2.1) уровня AA. Обеспечение доступности приложения было выполнено в соответствии с рекомендациями израильского стандарта (IS 5568) для доступности веб-контента.'
      },
      {
        icon: Eye,
        title: 'Доступность для людей с нарушениями зрения',
        items: [
          'Полная поддержка программ чтения с экрана, таких как NVDA, JAWS и VoiceOver',
          'Плавающая кнопка доступности для увеличения размера шрифта (80%-150%)',
          'Режим высокой контрастности для настройки отображения',
          'Альтернативный текст для всех изображений и значков',
          'Навигация только с помощью клавиатуры',
          'Логический порядок чтения контента',
          'Правильная маркировка заголовков и кнопок'
        ]
      },
      {
        icon: Keyboard,
        title: 'Доступность клавиатуры',
        items: [
          'Полная навигация с помощью клавиатуры (Tab, Enter, Space)',
          'Четкая маркировка активного элемента',
          'Удобные горячие клавиши для общих действий',
          'Возможность пропустить меню навигации (перейти к содержимому)'
        ]
      },
      {
        icon: Mouse,
        title: 'Операционная доступность',
        items: [
          'Большие кнопки и области нажатия',
          'Достаточное время отклика для действий',
          'Возможность отменить и исправить ошибки',
          'Избегание мигающего контента, который может вызвать приступы'
        ]
      },
      {
        icon: Smartphone,
        title: 'Мобильная доступность',
        items: [
          'Интерфейс, адаптированный для сенсорных экранов',
          'Поддержка функций доступности iOS и Android',
          'Простая навигация с помощью жестов',
          'Возможность увеличения экрана'
        ]
      },
      {
        icon: AlertCircle,
        title: 'Исключения и ограничения',
        text: 'Несмотря на наши усилия, могут быть части приложения, которые еще не полностью доступны. Мы продолжаем работать над улучшением доступности и регулярно обновляем приложение.',
        items: [
          'Контент, загруженный пользователями - мы не контролируем их доступность',
          'Сторонние сервисы - могут иметь ограничения доступности',
          'Старый контент - проходит процесс постепенного обеспечения доступности'
        ]
      },
      {
        icon: Mail,
        title: 'Координатор по доступности и контакты',
        text: 'Если вы столкнулись с проблемой доступности в приложении или у вас есть предложения по улучшению доступности, мы будем рады услышать от вас:',
        contact: [
          'Электронная почта: frimet@gmail.com'
        ]
      },
      {
        icon: Accessibility,
        title: 'Приспособления доступности в поездках',
        text: 'Приложение позволяет организаторам поездок отмечать уровень доступности поездки и указывать специальные приспособления. Участники могут указать свои потребности в доступности при присоединении к поездке.'
      }
    ],
    commitment: {
      title: 'Наше обязательство',
      text: 'В The Group Loop мы верим, что каждый заслуживает равного доступа к информации и услугам. Мы продолжаем работать над улучшением доступности, проводим периодические проверки и обновляем приложение в соответствии с изменяющимися стандартами и меняющимися потребностями нашего сообщества.'
    }
  } : content;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          {isRTL ? <ArrowRight className="w-4 h-4 mr-2" /> : <ArrowLeft className="w-4 h-4 mr-2" />}
          {language === 'he' ? 'חזרה' : 'Back'}
        </Button>

        <Card className="shadow-xl border-0 mb-8">
          <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-lg">
            <div className="flex items-center gap-3">
              <Accessibility className="w-8 h-8" />
              <div>
                <CardTitle className="text-3xl" dir={isRTL ? 'rtl' : 'ltr'}>{content.title}</CardTitle>
                <p className="text-green-100 text-sm mt-1">{content.lastUpdated}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-8" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="bg-green-50 rounded-lg p-6 border-2 border-green-200">
              <p className="text-gray-700 leading-relaxed">{content.intro}</p>
            </div>

            {content.sections.map((section, idx) => (
              <div key={idx} className="space-y-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <section.icon className="w-5 h-5 text-green-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
                </div>
                
                {section.text && (
                  <p className="text-gray-700 leading-relaxed">{section.text}</p>
                )}

                {section.items && (
                  <ul className="space-y-2 mr-4">
                    {section.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">✓</span>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {section.contact && (
                  <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                    {section.contact.map((line, i) => (
                      <p key={i} className="text-gray-700 font-medium">{line}</p>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border-2 border-green-300">
              <h2 className="text-xl font-bold text-green-900 mb-3">{content.commitment.title}</h2>
              <p className="text-gray-700 leading-relaxed">{content.commitment.text}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}