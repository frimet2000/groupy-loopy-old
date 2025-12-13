import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../components/LanguageContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Shield, Lock, Database, Share2, Cookie, Mail } from 'lucide-react';

export default function PrivacyPolicy() {
  const { language, isRTL } = useLanguage();
  const navigate = useNavigate();

  const content = language === 'he' ? {
    title: 'מדיניות פרטיות',
    lastUpdated: 'עודכן לאחרונה: 13 בדצמבר 2025',
    sections: [
      {
        icon: Shield,
        title: 'הקדמה',
        text: 'ב-The Group Loop אנו מחויבים להגן על פרטיותך ועל המידע האישי שלך. מדיניות פרטיות זו מסבירה איזה מידע אנו אוספים, כיצד אנו משתמשים בו, ואיזה זכויות יש לך לגבי המידע שלך.'
      },
      {
        icon: Database,
        title: 'מידע שאנו אוספים',
        subsections: [
          {
            subtitle: 'מידע אישי שאתה מספק',
            items: [
              'שם מלא וכתובת דואר אלקטרוני בעת ההרשמה',
              'תמונת פרופיל ומידע נוסף שתבחר לשתף',
              'פרטי טיולים שאתה יוצר או מצטרף אליהם',
              'הודעות ותוכן שאתה משתף בפלטפורמה',
              'העדפות נגישות ודרישות מיוחדות'
            ]
          },
          {
            subtitle: 'מידע שנאסף אוטומטית',
            items: [
              'כתובת IP ונתוני מיקום גיאוגרפי (עם אישורך)',
              'סוג דפדפן ומכשיר',
              'דפים שביקרת באתר והפעולות שביצעת',
              'תאריך ושעת השימוש בשירות'
            ]
          }
        ]
      },
      {
        icon: Cookie,
        title: 'שימוש בעוגיות (Cookies)',
        text: 'אנו משתמשים בעוגיות ובטכנולוגיות דומות לשיפור חוויית המשתמש, לשמירת העדפות, ולניתוח תנועה באתר. אתה יכול לשלוט בעוגיות דרך הגדרות הדפדפן שלך.',
        items: [
          'עוגיות הכרחיות - לתפעול האתר התקין',
          'עוגיות פונקציונליות - לשמירת העדפותיך',
          'עוגיות אנליטיות - להבנת שימוש באתר',
          'עוגיות שיווקיות - לשיפור תוכן מותאם'
        ]
      },
      {
        icon: Lock,
        title: 'כיצד אנו משתמשים במידע',
        items: [
          'לספק ולשפר את שירותי האפליקציה',
          'ליצור התאמות בין מטיילים לטיולים',
          'לשלוח התראות והודעות רלוונטיות',
          'לנתח ולשפר את ביצועי הפלטפורמה',
          'למנוע שימוש לרעה ולאכוף את תנאי השימוש',
          'לעמוד בדרישות חוקיות'
        ]
      },
      {
        icon: Share2,
        title: 'שיתוף מידע עם צדדים שלישיים',
        text: 'אנו לא מוכרים את המידע האישי שלך. אנו עשויים לשתף מידע רק במקרים הבאים:',
        items: [
          'עם משתמשים אחרים - מידע שבחרת לשתף בפרופיל ובטיולים',
          'ספקי שירות - כגון אירוח, אנליטיקה ותקשורת',
          'דרישות חוקיות - כאשר נדרש על פי חוק',
          'מיזוגים ורכישות - במקרה של שינוי בעלות בחברה'
        ]
      },
      {
        icon: Shield,
        title: 'אבטחת מידע',
        text: 'אנו נוקטים באמצעי אבטחה טכניים וארגוניים כדי להגן על המידע שלך, כולל הצפנה, אימות דו-שלבי, וגישה מוגבלת. עם זאת, שום שיטה של העברה באינטרנט או אחסון אלקטרוני אינה מאובטחת ב-100%.'
      },
      {
        icon: Shield,
        title: 'הזכויות שלך',
        text: 'בהתאם לחוק הגנת הפרטיות, יש לך את הזכויות הבאות:',
        items: [
          'זכות עיון - לקבל עותק של המידע האישי שלך',
          'זכות תיקון - לתקן מידע לא מדויק',
          'זכות מחיקה - למחוק את המידע שלך (בכפוף למגבלות חוקיות)',
          'זכות להגבלת עיבוד - להגביל שימושים מסוימים במידע',
          'זכות להתנגד - להתנגד לעיבוד מסוים של המידע שלך',
          'זכות להעברה - לקבל את המידע שלך בפורמט נייד'
        ]
      },
      {
        icon: Mail,
        title: 'יצירת קשר',
        text: 'לשאלות או בקשות בנוגע למדיניות הפרטיות, ניתן ליצור איתנו קשר בדוא"ל frimet@gmail.com'
      }
    ],
    gdpr: {
      title: 'עמידה בתקנת GDPR',
      text: 'אם אתה תושב האיחוד האירופי, אנו עומדים בדרישות תקנת ה-GDPR. זה כולל את הזכויות הנוספות שלך כמפורט לעיל, והזכות להגיש תלונה לרשות הפיקוח על הגנת המידע במדינתך.'
    },
    children: {
      title: 'קטינים',
      text: 'השירות שלנו מיועד למשתמשים מעל גיל 18. אנו לא אוספים ביודעין מידע מילדים מתחת לגיל 13. אם אתה הורה וגילית שילדך סיפק לנו מידע, אנא צור קשר.'
    },
    changes: {
      title: 'שינויים במדיניות',
      text: 'אנו עשויים לעדכן את מדיניות הפרטיות מעת לעת. נודיע לך על כל שינוי משמעותי באמצעות האפליקציה או בדוא"ל.'
    }
  } : {
    title: 'Privacy Policy',
    lastUpdated: 'Last Updated: December 13, 2025',
    sections: [
      {
        icon: Shield,
        title: 'Introduction',
        text: 'At The Group Loop, we are committed to protecting your privacy and personal information. This privacy policy explains what information we collect, how we use it, and what rights you have regarding your information.'
      },
      {
        icon: Database,
        title: 'Information We Collect',
        subsections: [
          {
            subtitle: 'Personal Information You Provide',
            items: [
              'Full name and email address during registration',
              'Profile picture and additional information you choose to share',
              'Details of trips you create or join',
              'Messages and content you share on the platform',
              'Accessibility preferences and special requirements'
            ]
          },
          {
            subtitle: 'Automatically Collected Information',
            items: [
              'IP address and geographic location data (with your consent)',
              'Browser type and device information',
              'Pages visited and actions performed on the site',
              'Date and time of service usage'
            ]
          }
        ]
      },
      {
        icon: Cookie,
        title: 'Use of Cookies',
        text: 'We use cookies and similar technologies to improve user experience, save preferences, and analyze site traffic. You can control cookies through your browser settings.',
        items: [
          'Essential cookies - for proper site operation',
          'Functional cookies - to save your preferences',
          'Analytics cookies - to understand site usage',
          'Marketing cookies - to improve personalized content'
        ]
      },
      {
        icon: Lock,
        title: 'How We Use Your Information',
        items: [
          'To provide and improve app services',
          'To match travelers with trips',
          'To send relevant notifications and messages',
          'To analyze and improve platform performance',
          'To prevent abuse and enforce terms of use',
          'To comply with legal requirements'
        ]
      },
      {
        icon: Share2,
        title: 'Sharing Information with Third Parties',
        text: 'We do not sell your personal information. We may share information only in the following cases:',
        items: [
          'With other users - information you chose to share in profile and trips',
          'Service providers - such as hosting, analytics, and communications',
          'Legal requirements - when required by law',
          'Mergers and acquisitions - in case of company ownership change'
        ]
      },
      {
        icon: Shield,
        title: 'Information Security',
        text: 'We take technical and organizational security measures to protect your information, including encryption, two-factor authentication, and restricted access. However, no method of internet transmission or electronic storage is 100% secure.'
      },
      {
        icon: Shield,
        title: 'Your Rights',
        text: 'According to privacy law, you have the following rights:',
        items: [
          'Right to access - to receive a copy of your personal information',
          'Right to rectification - to correct inaccurate information',
          'Right to erasure - to delete your information (subject to legal limitations)',
          'Right to restriction - to limit certain uses of information',
          'Right to object - to object to certain processing of your information',
          'Right to portability - to receive your information in a portable format'
        ]
      },
      {
        icon: Mail,
        title: 'Contact',
        text: 'For questions or requests regarding privacy policy, you can contact us at frimet@gmail.com'
      }
    ],
    gdpr: {
      title: 'GDPR Compliance',
      text: 'If you are a resident of the European Union, we comply with GDPR requirements. This includes your additional rights as detailed above, and the right to file a complaint with the data protection supervisory authority in your country.'
    },
    children: {
      title: 'Minors',
      text: 'Our service is intended for users over 18. We do not knowingly collect information from children under 13. If you are a parent and discovered that your child provided us with information, please contact us.'
    },
    changes: {
      title: 'Policy Changes',
      text: 'We may update the privacy policy from time to time. We will notify you of any significant changes through the app or email.'
    }
  } : language === 'ru' ? {
    title: 'Политика конфиденциальности',
    lastUpdated: 'Последнее обновление: 13 декабря 2025',
    sections: [
      {
        icon: Shield,
        title: 'Введение',
        text: 'В The Group Loop мы стремимся защищать вашу конфиденциальность и личную информацию. Эта политика конфиденциальности объясняет, какую информацию мы собираем, как мы ее используем, и какие права у вас есть в отношении вашей информации.'
      },
      {
        icon: Database,
        title: 'Собираемая информация',
        subsections: [
          {
            subtitle: 'Личная информация, которую вы предоставляете',
            items: [
              'Полное имя и адрес электронной почты при регистрации',
              'Фото профиля и дополнительная информация, которой вы решите поделиться',
              'Детали поездок, которые вы создаете или к которым присоединяетесь',
              'Сообщения и контент, которым вы делитесь на платформе',
              'Предпочтения по доступности и особые требования'
            ]
          },
          {
            subtitle: 'Автоматически собираемая информация',
            items: [
              'IP-адрес и данные геолокации (с вашего согласия)',
              'Тип браузера и информация об устройстве',
              'Посещенные страницы и выполненные действия на сайте',
              'Дата и время использования сервиса'
            ]
          }
        ]
      },
      {
        icon: Cookie,
        title: 'Использование файлов cookie',
        text: 'Мы используем файлы cookie и аналогичные технологии для улучшения пользовательского опыта, сохранения предпочтений и анализа трафика сайта. Вы можете управлять файлами cookie через настройки браузера.',
        items: [
          'Необходимые файлы cookie - для правильной работы сайта',
          'Функциональные файлы cookie - для сохранения ваших предпочтений',
          'Аналитические файлы cookie - для понимания использования сайта',
          'Маркетинговые файлы cookie - для улучшения персонализированного контента'
        ]
      },
      {
        icon: Lock,
        title: 'Как мы используем вашу информацию',
        items: [
          'Для предоставления и улучшения услуг приложения',
          'Для подбора путешественников к поездкам',
          'Для отправки соответствующих уведомлений и сообщений',
          'Для анализа и улучшения производительности платформы',
          'Для предотвращения злоупотреблений и соблюдения условий использования',
          'Для соблюдения юридических требований'
        ]
      },
      {
        icon: Share2,
        title: 'Обмен информацией с третьими лицами',
        text: 'Мы не продаем вашу личную информацию. Мы можем делиться информацией только в следующих случаях:',
        items: [
          'С другими пользователями - информация, которой вы решили поделиться в профиле и поездках',
          'Поставщики услуг - такие как хостинг, аналитика и коммуникации',
          'Юридические требования - когда требуется по закону',
          'Слияния и поглощения - в случае изменения владельца компании'
        ]
      },
      {
        icon: Shield,
        title: 'Безопасность информации',
        text: 'Мы принимаем технические и организационные меры безопасности для защиты вашей информации, включая шифрование, двухфакторную аутентификацию и ограниченный доступ. Однако ни один метод передачи через интернет или электронного хранения не является на 100% безопасным.'
      },
      {
        icon: Shield,
        title: 'Ваши права',
        text: 'В соответствии с законом о конфиденциальности у вас есть следующие права:',
        items: [
          'Право доступа - получить копию вашей личной информации',
          'Право на исправление - исправить неточную информацию',
          'Право на удаление - удалить вашу информацию (с учетом юридических ограничений)',
          'Право на ограничение обработки - ограничить определенное использование информации',
          'Право на возражение - возразить против определенной обработки вашей информации',
          'Право на переносимость - получить вашу информацию в переносимом формате'
        ]
      },
      {
        icon: Mail,
        title: 'Контакты',
        text: 'По вопросам или запросам относительно политики конфиденциальности вы можете связаться с нами по электронной почте frimet@gmail.com'
      }
    ],
    gdpr: {
      title: 'Соответствие GDPR',
      text: 'Если вы являетесь резидентом Европейского Союза, мы соблюдаем требования GDPR. Это включает ваши дополнительные права, подробно описанные выше, и право подать жалобу в надзорный орган по защите данных в вашей стране.'
    },
    children: {
      title: 'Несовершеннолетние',
      text: 'Наш сервис предназначен для пользователей старше 18 лет. Мы сознательно не собираем информацию от детей младше 13 лет. Если вы родитель и обнаружили, что ваш ребенок предоставил нам информацию, пожалуйста, свяжитесь с нами.'
    },
    changes: {
      title: 'Изменения в политике',
      text: 'Мы можем время от времени обновлять политику конфиденциальности. Мы уведомим вас о любых значительных изменениях через приложение или электронную почту.'
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
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8" />
              <div>
                <CardTitle className="text-3xl" dir={isRTL ? 'rtl' : 'ltr'}>{content.title}</CardTitle>
                <p className="text-blue-100 text-sm mt-1">{content.lastUpdated}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-8" dir={isRTL ? 'rtl' : 'ltr'}>
            {content.sections.map((section, idx) => (
              <div key={idx} className="space-y-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <section.icon className="w-5 h-5 text-blue-600" />
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
                        <span className="text-blue-600 mt-1">•</span>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {section.subsections && section.subsections.map((sub, subIdx) => (
                  <div key={subIdx} className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <h3 className="font-semibold text-gray-900">{sub.subtitle}</h3>
                    <ul className="space-y-2 mr-4">
                      {sub.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-blue-600 mt-1">•</span>
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ))}

            <div className="bg-green-50 rounded-lg p-6 border-2 border-green-200">
              <h2 className="text-lg font-bold text-green-900 mb-2">{content.gdpr.title}</h2>
              <p className="text-gray-700">{content.gdpr.text}</p>
            </div>

            <div className="bg-amber-50 rounded-lg p-6 border-2 border-amber-200">
              <h2 className="text-lg font-bold text-amber-900 mb-2">{content.children.title}</h2>
              <p className="text-gray-700">{content.children.text}</p>
            </div>

            <div className="bg-purple-50 rounded-lg p-6 border-2 border-purple-200">
              <h2 className="text-lg font-bold text-purple-900 mb-2">{content.changes.title}</h2>
              <p className="text-gray-700">{content.changes.text}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}