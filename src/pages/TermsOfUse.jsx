import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../components/LanguageContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, FileText, Shield, AlertTriangle, Scale, UserX, Copyright } from 'lucide-react';

export default function TermsOfUse() {
  const { language, isRTL } = useLanguage();
  const navigate = useNavigate();

  const content = language === 'he' ? {
    title: 'תקנון ותנאי שימוש',
    lastUpdated: 'עודכן לאחרונה: 13 בדצמבר 2025',
    intro: 'ברוכים הבאים ל-The Group Loop. השימוש באפליקציה ובשירותים שלנו כפוף לתנאי שימוש אלה. אנא קרא אותם בעיון לפני השימוש בשירות.',
    sections: [
      {
        icon: FileText,
        title: 'קבלת התנאים',
        text: 'על ידי גישה או שימוש באפליקציה, אתה מאשר שקראת, הבנת ומסכים להיות מחויב לתנאי שימוש אלה. אם אינך מסכים לתנאים, אנא הפסק להשתמש בשירות.'
      },
      {
        icon: UserX,
        title: 'כשירות לשימוש',
        items: [
          'עליך להיות בגיל 18 לפחות כדי להשתמש בשירות',
          'עליך לספק מידע מדויק ומעודכן בעת ההרשמה',
          'אתה אחראי לשמירה על סודיות הסיסמה שלך',
          'אסור להעביר את חשבונך לאדם אחר'
        ]
      },
      {
        icon: Shield,
        title: 'שימושים מותרים ואסורים',
        allowed: {
          title: 'מותר:',
          items: [
            'ליצור ולנהל טיולים',
            'להצטרף לטיולים של אחרים',
            'לתקשר עם משתמשים אחרים',
            'לשתף תוכן הקשור לטיולים'
          ]
        },
        forbidden: {
          title: 'אסור:',
          items: [
            'להפר חוקים או תקנות כלשהן',
            'להטריד, להעליב או לפגוע במשתמשים אחרים',
            'לפרסם תוכן פוגעני, גזעני או מיני',
            'לשתף מידע כוזב או מטעה',
            'לנסות לפרוץ או להזיק למערכת',
            'לאסוף מידע על משתמשים ללא רשותם',
            'להשתמש בשירות למטרות מסחריות ללא אישור',
            'ליצור חשבונות מזויפים או להתחזות לאחרים'
          ]
        }
      },
      {
        icon: Copyright,
        title: 'קניין רוחני',
        text: 'כל התוכן באפליקציה, כולל עיצוב, לוגו, טקסט, גרפיקה וקוד, הינו רכושנו או של מעניקי הרישיונות שלנו ומוגן בזכויות יוצרים. אסור להעתיק, לשכפל, להפיץ או להשתמש בתוכן ללא אישור מפורש.',
        userContent: {
          title: 'תוכן משתמשים:',
          text: 'אתה שומר על זכויות היוצרים על התוכן שאתה מפרסם. עם זאת, אתה מעניק לנו רישיון עולמי, לא בלעדי ללא תמלוגים להשתמש, להציג, לשכפל ולהפיץ את התוכן שלך במסגרת השירות.'
        }
      },
      {
        icon: AlertTriangle,
        title: 'הסרת אחריות',
        items: [
          'האפליקציה מסופקת "כמות שהיא" ללא אחריות מכל סוג',
          'איננו אחראים לפעולות, התנהגות או בטיחות של משתמשים',
          'איננו אחראים לנזקים הנובעים מהשתתפות בטיולים',
          'איננו מבטיחים שהשירות יהיה זמין תמיד או נקי מטעויות',
          'איננו אחראים לאובדן מידע או נזקים אחרים הנובעים מהשימוש'
        ]
      },
      {
        icon: Shield,
        title: 'הגבלת אחריות',
        text: 'בכל מקרה, אחריותנו לכל נזק, הפסד או תביעה כלפיך תהיה מוגבלת לסכום ששילמת לנו (אם בכלל) בשנים עשרת החודשים שקדמו לתביעה.'
      },
      {
        icon: Shield,
        title: 'שיפוי',
        text: 'אתה מסכים לשפות, להגן ולפטור אותנו מכל תביעות, הפסדים, נזקים, התחייבויות והוצאות הנובעים מהשימוש שלך באפליקציה או מהפרת תנאי השימוש.'
      },
      {
        icon: Scale,
        title: 'דין וסמכות שיפוט',
        text: 'תנאי שימוש אלה כפופים לחוקי מדינת ישראל. כל מחלוקת תתברר אך ורק בבתי המשפט המוסמכים.'
      },
      {
        icon: FileText,
        title: 'שינויים בתנאים',
        text: 'אנו שומרים לעצמנו את הזכות לשנות או לעדכן את תנאי השימוש בכל עת. נודיע לך על שינויים משמעותיים באמצעות האפליקציה או בדוא"ל. המשך השימוש לאחר שינוי מהווה הסכמה לתנאים המעודכנים.'
      },
      {
        icon: UserX,
        title: 'סיום חשבון',
        text: 'אנו שומרים לעצמנו את הזכות להשעות או לסגור חשבונך בכל עת, עם או ללא הודעה מוקדמת, במקרה של הפרת תנאי השימוש או שימוש לרעה בשירות. אתה רשאי לסגור את חשבונך בכל עת דרך הגדרות הפרופיל.'
      }
    ],
    contact: 'לשאלות או בירורים בנוגע לתנאי השימוש, ניתן ליצור קשר דרך האפליקציה או בדוא"ל support@thegrouploop.com'
  } : {
    title: 'Terms of Use',
    lastUpdated: 'Last Updated: December 13, 2025',
    intro: 'Welcome to The Group Loop. Use of our app and services is subject to these terms of use. Please read them carefully before using the service.',
    sections: [
      {
        icon: FileText,
        title: 'Acceptance of Terms',
        text: 'By accessing or using the app, you confirm that you have read, understood, and agree to be bound by these terms of use. If you do not agree to the terms, please stop using the service.'
      },
      {
        icon: UserX,
        title: 'Eligibility',
        items: [
          'You must be at least 18 years old to use the service',
          'You must provide accurate and up-to-date information when registering',
          'You are responsible for maintaining the confidentiality of your password',
          'You may not transfer your account to another person'
        ]
      },
      {
        icon: Shield,
        title: 'Permitted and Prohibited Uses',
        allowed: {
          title: 'Permitted:',
          items: [
            'Create and manage trips',
            'Join trips by others',
            'Communicate with other users',
            'Share trip-related content'
          ]
        },
        forbidden: {
          title: 'Prohibited:',
          items: [
            'Violate any laws or regulations',
            'Harass, insult, or harm other users',
            'Post offensive, racist, or sexual content',
            'Share false or misleading information',
            'Attempt to hack or damage the system',
            'Collect user information without permission',
            'Use the service for commercial purposes without approval',
            'Create fake accounts or impersonate others'
          ]
        }
      },
      {
        icon: Copyright,
        title: 'Intellectual Property',
        text: 'All content in the app, including design, logo, text, graphics, and code, is our property or that of our licensors and is protected by copyright. You may not copy, reproduce, distribute, or use the content without express permission.',
        userContent: {
          title: 'User Content:',
          text: 'You retain copyright to content you post. However, you grant us a worldwide, non-exclusive, royalty-free license to use, display, reproduce, and distribute your content within the service.'
        }
      },
      {
        icon: AlertTriangle,
        title: 'Disclaimer',
        items: [
          'The app is provided "as is" without warranty of any kind',
          'We are not responsible for actions, conduct, or safety of users',
          'We are not liable for damages resulting from trip participation',
          'We do not guarantee the service will always be available or error-free',
          'We are not responsible for loss of information or other damages from use'
        ]
      },
      {
        icon: Shield,
        title: 'Limitation of Liability',
        text: 'In any event, our liability for any damage, loss, or claim against you shall be limited to the amount you paid us (if any) in the twelve months preceding the claim.'
      },
      {
        icon: Shield,
        title: 'Indemnification',
        text: 'You agree to indemnify, defend, and hold us harmless from any claims, losses, damages, liabilities, and expenses arising from your use of the app or breach of terms of use.'
      },
      {
        icon: Scale,
        title: 'Governing Law and Jurisdiction',
        text: 'These terms of use are governed by the laws of the State of Israel. Any dispute shall be resolved exclusively in the competent courts.'
      },
      {
        icon: FileText,
        title: 'Changes to Terms',
        text: 'We reserve the right to change or update the terms of use at any time. We will notify you of significant changes through the app or email. Continued use after a change constitutes acceptance of the updated terms.'
      },
      {
        icon: UserX,
        title: 'Account Termination',
        text: 'We reserve the right to suspend or close your account at any time, with or without prior notice, in case of violation of terms of use or misuse of service. You may close your account at any time through profile settings.'
      }
    ],
    contact: 'For questions or clarifications regarding terms of use, you can contact us through the app or email support@thegrouploop.com'
  };

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
          <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-lg">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8" />
              <div>
                <CardTitle className="text-3xl" dir={isRTL ? 'rtl' : 'ltr'}>{content.title}</CardTitle>
                <p className="text-purple-100 text-sm mt-1">{content.lastUpdated}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-8" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="bg-purple-50 rounded-lg p-6 border-2 border-purple-200">
              <p className="text-gray-700 leading-relaxed">{content.intro}</p>
            </div>

            {content.sections.map((section, idx) => (
              <div key={idx} className="space-y-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <section.icon className="w-5 h-5 text-purple-600" />
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
                        <span className="text-purple-600 mt-1">•</span>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {section.allowed && (
                  <div className="bg-green-50 rounded-lg p-4 space-y-3">
                    <h3 className="font-semibold text-green-900">{section.allowed.title}</h3>
                    <ul className="space-y-2 mr-4">
                      {section.allowed.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-green-600 mt-1">✓</span>
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {section.forbidden && (
                  <div className="bg-red-50 rounded-lg p-4 space-y-3">
                    <h3 className="font-semibold text-red-900">{section.forbidden.title}</h3>
                    <ul className="space-y-2 mr-4">
                      {section.forbidden.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-red-600 mt-1">✗</span>
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {section.userContent && (
                  <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                    <h3 className="font-semibold text-blue-900">{section.userContent.title}</h3>
                    <p className="text-gray-700">{section.userContent.text}</p>
                  </div>
                )}
              </div>
            ))}

            <div className="bg-amber-50 rounded-lg p-6 border-2 border-amber-200">
              <p className="text-gray-700">{content.contact}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}