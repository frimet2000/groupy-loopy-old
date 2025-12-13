import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../components/LanguageContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, Shield, AlertTriangle, FileText } from 'lucide-react';

export default function TermsOfService() {
  const { t, language, isRTL } = useLanguage();
  const navigate = useNavigate();

  const content = language === 'he' ? {
    title: 'תנאי שימוש והסכם משפטי',
    lastUpdate: 'עדכון אחרון: דצמבר 2025',
    sections: [
      {
        icon: Shield,
        title: '1. הגדרת הפלטפורמה ותפקידה',
        content: `פלטפורמת "The Group Loop" (להלן: "הפלטפורמה") היא שירות דיגיטלי המתווך בין משתמשים המעוניינים לארגן טיולים (להלן: "מארגני טיולים") לבין משתמשים המעוניינים להצטרף לטיולים (להלן: "משתתפים").

הפלטפורמה משמשת אך ורק כמתווכת טכנולוגית, ואינה מארגנת, מנהלת, מפקחת, מאשרת או נוטלת כל אחריות על הטיולים המתפרסמים בה.`
      },
      {
        icon: AlertTriangle,
        title: '2. הצהרת אי-אחריות מלאה',
        content: `הפלטפורמה, בעליה, מפעיליה, עובדיה, ספקיה והמפתחים שלה (להלן ביחד: "הפלטפורמה") אינם נושאים בכל אחריות, ישירה או עקיפה, בגין:

• כל נזק גוף, פציעה, מחלה, מוות או נזק רכוש שייגרמו במהלך הטיול או בקשר אליו
• איכות, בטיחות, התאמה, או חוקיות של הטיולים המתפרסמים
• התנהגות, אמינות, כשירות או זהירות של מארגני הטיולים
• דיוק המידע המתפרסם על הטיולים
• תקלות טכניות, איבוד מידע או כשלים בפלטפורמה
• כל מעשה או מחדל של מארגן הטיול או משתתפים אחרים`
      },
      {
        icon: FileText,
        title: '3. אחריות מארגן הטיול',
        content: `מארגן הטיול נושא באחריות מלאה ובלעדית לכל היבטי הטיול, לרבות:

• בחירת מסלול מתאים ובטיחותי
• הערכת התאמת המסלול לרמת הכושר והניסיון של המשתתפים
• מתן אזהרות והוראות בטיחות מפורטות
• וידוא תנאי מזג אוויר ושטח בטוחים
• החלטות שנעשות במהלך הטיול
• טיפול במצבי חירום
• עמידה בכל החוקים והתקנות הרלוונטיים

מארגן הטיול מצהיר שהוא בעל ידע, ניסיון ויכולת הנדרשים לניהול הטיול, ומתחייב לפעול בזהירות המירבית לשמירה על בטיחות המשתתפים.`
      },
      {
        icon: AlertTriangle,
        title: '4. אחריות המשתתף',
        content: `כל משתתף בטיול נושא באחריות אישית מלאה ומצהיר כי:

• הוא בעל כושר גופני ובריאותי המתאים לטיול
• הוא ער לסיכונים הכרוכים בפעילות בטבע
• הוא נוטל על עצמו את כל הסיכונים הכרוכים בהשתתפות בטיול
• הוא יפעל בזהירות ובהתאם להוראות מארגן הטיול
• הוא יצויד בציוד מתאים ובמצב תקין
• הוא אחראי לבריאותו ולבטיחותו האישית
• הוא לא יסתמך על הפלטפורמה לקבלת מידע רפואי או בטיחותי`
      },
      {
        title: '5. ויתור על תביעות',
        content: `על ידי שימוש בפלטפורמה, כל משתמש (מארגן או משתתף) מוותר באופן סופי ובלתי חוזר על כל זכות תביעה, דרישה או טענה כלפי הפלטפורמה בגין:

• כל נזק גוף, רכוש, נפש או כלכלי שייגרם בקשר לטיול
• רשלנות, התרשלות או מעשה בלתי חוקי של מארגן הטיול או משתתף אחר
• אי-דיוק במידע, תקלות טכניות או כשלים בשירות

ויתור זה כולל גם ויתור על כל תביעה נגד מבטחי הפלטפורמה, נושאי משרה, עובדים וקבלני משנה שלה.`
      },
      {
        title: '6. שיפוי',
        content: `כל משתמש מתחייב לשפות את הפלטפורמה ולהגן עליה מפני כל תביעה, דרישה, הוצאה (לרבות שכר טרחת עורכי דין) או נזק שייגרמו לה כתוצאה מ:

• שימוש בפלטפורמה על ידי המשתמש
• הפרת תנאי שימוש אלה
• הפרת זכויות צד שלישי
• רשלנות או מעשה בלתי חוקי של המשתמש

התחייבות זו תישאר בתוקף גם לאחר סיום השימוש בפלטפורמה.`
      },
      {
        title: '7. המלצות בטיחות',
        content: `הפלטפורמה ממליצה (אך אינה מחייבת) למשתמשים:

• לבדוק את הרקע, הניסיון והמוניטין של מארגן הטיול
• להיפגש עם מארגן הטיול לפני הטיול
• לבדוק את מזג האוויר ותנאי השטח ביום הטיול
• להצטייד בציוד מתאים ותקין
• להביא מים, מזון, ערכת עזרה ראשונה ואמצעי תקשורת
• ליידע את מארגן הטיול על מגבלות בריאותיות או גופניות
• לערוך ביטוח נסיעות או ביטוח תאונות אישיות
• להימנע מטיולים שאינם מתאימים לרמת הכושר האישית

אולם, אחריות יישום המלצות אלו מוטלת על המשתמש בלבד, והפלטפורמה אינה נושאת באחריות אם המשתמש לא פעל בהתאם להן.`
      },
      {
        title: '8. הגבלת אחריות כספית',
        content: `ככל שבית משפט או רשות מוסמכת יקבעו כי לפלטפורמה אחריות כלשהי (חרף ויתור וסעיפי אי-האחריות דלעיל), אחריותה תהיה מוגבלת לסכום שלא יעלה על 100 ש"ח (מאה שקלים חדשים), או סכום דמי השימוש ששולמו על ידי המשתמש (הנמוך מבין השניים).

הפלטפורמה לא תהיה אחראית בכל מקרה לנזקים עקיפים, תוצאתיים, מיוחדים או עונשיים.`
      },
      {
        title: '9. דין וסמכות שיפוט',
        content: `על תנאי שימוש אלה יחולו אך ורק דיני מדינת ישראל. סמכות השיפוט הבלעדית בכל סכסוך הנובע מתנאי שימוש אלה תהיה לבתי המשפט המוסמכים במחוז תל-אביב, ישראל.`
      },
      {
        title: '10. תוקף התנאים',
        content: `תנאי שימוש אלה מהווים את ההסכם המלא והבלעדי בין המשתמש לבין הפלטפורמה. הפלטפורמה שומרת לעצמה את הזכות לעדכן תנאים אלה בכל עת, והמשך השימוש בפלטפורמה יהווה הסכמה לתנאים המעודכנים.

אם נקבע כי סעיף מסוים בתנאים אלה בטל או בלתי אכיף, הדבר לא ישפיע על תוקפם של שאר הסעיפים.`
      },
      {
        title: '11. אישור והצהרה סופית',
        content: `על ידי שימוש בפלטפורמה, המשתמש מצהיר ומאשר כי:

• קרא והבין את תנאי השימוש במלואם
• מסכים לכל תנאי השימוש ללא סייג
• מבין שהפלטפורמה אינה נושאת באחריות לטיולים
• מקבל על עצמו את מלוא האחריות והסיכונים
• מוותר על כל תביעה כלפי הפלטפורמה
• יפעל בזהירות ובאחריות מלאה`
      }
    ]
  } : {
    title: 'Terms of Service and Legal Agreement',
    lastUpdate: 'Last Updated: December 2025',
    sections: [
      {
        icon: Shield,
        title: '1. Platform Definition and Role',
        content: `"The Group Loop" platform (hereinafter: "the Platform") is a digital service that mediates between users who wish to organize trips (hereinafter: "Trip Organizers") and users who wish to join trips (hereinafter: "Participants").

The Platform serves solely as a technological intermediary and does not organize, manage, supervise, approve, or assume any responsibility for trips published on it.`
      },
      {
        icon: AlertTriangle,
        title: '2. Complete Liability Disclaimer',
        content: `The Platform, its owners, operators, employees, suppliers, and developers (hereinafter collectively: "the Platform") bear no responsibility, direct or indirect, for:

• Any bodily injury, illness, death, or property damage that may occur during or in connection with the trip
• Quality, safety, suitability, or legality of published trips
• Behavior, reliability, competence, or prudence of trip organizers
• Accuracy of information published about trips
• Technical failures, loss of information, or system failures
• Any act or omission by the trip organizer or other participants`
      },
      {
        icon: FileText,
        title: '3. Trip Organizer Liability',
        content: `The trip organizer bears full and exclusive responsibility for all aspects of the trip, including:

• Selection of suitable and safe route
• Assessment of route suitability for participants' fitness and experience levels
• Providing detailed safety warnings and instructions
• Ensuring safe weather and terrain conditions
• Decisions made during the trip
• Handling emergency situations
• Compliance with all relevant laws and regulations

The trip organizer declares that they possess the knowledge, experience, and capability required to manage the trip, and commits to acting with maximum care to ensure participants' safety.`
      },
      {
        icon: AlertTriangle,
        title: '4. Participant Liability',
        content: `Each trip participant bears full personal responsibility and declares that:

• They possess physical and health fitness suitable for the trip
• They are aware of risks involved in outdoor activities
• They assume all risks associated with trip participation
• They will act carefully and according to organizer's instructions
• They will be equipped with appropriate and functional equipment
• They are responsible for their personal health and safety
• They will not rely on the Platform for medical or safety information`
      },
      {
        title: '5. Waiver of Claims',
        content: `By using the Platform, each user (organizer or participant) finally and irrevocably waives any right to claim, demand, or argue against the Platform regarding:

• Any bodily, property, mental, or economic damage caused in connection with the trip
• Negligence, carelessness, or illegal act by the trip organizer or another participant
• Inaccurate information, technical failures, or service malfunctions

This waiver includes waiver of any claim against the Platform's insurers, officers, employees, and subcontractors.`
      },
      {
        title: '6. Indemnification',
        content: `Each user undertakes to indemnify and defend the Platform against any claim, demand, expense (including attorney fees), or damage caused as a result of:

• User's use of the Platform
• Violation of these terms of service
• Violation of third-party rights
• User's negligence or illegal act

This obligation will remain in effect even after cessation of Platform use.`
      },
      {
        title: '7. Safety Recommendations',
        content: `The Platform recommends (but does not require) users to:

• Check the background, experience, and reputation of the trip organizer
• Meet with the trip organizer before the trip
• Check weather and terrain conditions on trip day
• Equip themselves with appropriate and functional equipment
• Bring water, food, first aid kit, and communication devices
• Inform the trip organizer about health or physical limitations
• Purchase travel insurance or personal accident insurance
• Avoid trips not suitable for personal fitness level

However, responsibility for implementing these recommendations lies solely with the user, and the Platform bears no responsibility if the user did not act accordingly.`
      },
      {
        title: '8. Financial Liability Limitation',
        content: `To the extent that a court or competent authority determines that the Platform has any liability (despite the waiver and disclaimer clauses above), its liability will be limited to an amount not exceeding 100 NIS (one hundred new Israeli shekels), or the amount of usage fees paid by the user (whichever is lower).

The Platform will not be liable under any circumstances for indirect, consequential, special, or punitive damages.`
      },
      {
        title: '9. Governing Law and Jurisdiction',
        content: `These terms of service shall be governed exclusively by the laws of the State of Israel. Exclusive jurisdiction for any dispute arising from these terms of service shall be with the competent courts in Tel Aviv District, Israel.`
      },
      {
        title: '10. Terms Validity',
        content: `These terms of service constitute the complete and exclusive agreement between the user and the Platform. The Platform reserves the right to update these terms at any time, and continued use of the Platform will constitute acceptance of the updated terms.

If any provision in these terms is determined to be void or unenforceable, it will not affect the validity of the remaining provisions.`
      },
      {
        title: '11. Final Confirmation and Declaration',
        content: `By using the Platform, the user declares and confirms that:

• They have read and understood the terms of service in full
• They agree to all terms of service without reservation
• They understand that the Platform bears no responsibility for trips
• They assume full responsibility and risks
• They waive any claim against the Platform
• They will act carefully and with full responsibility`
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          {isRTL ? <ArrowRight className="w-4 h-4 mr-2" /> : <ArrowLeft className="w-4 h-4 mr-2" />}
          {language === 'he' ? 'חזרה' : 'Back'}
        </Button>

        <Card className="shadow-2xl border-0 mb-8">
          <CardHeader className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-t-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-2xl md:text-3xl">{content.title}</CardTitle>
                <p className="text-red-100 text-sm mt-1">{content.lastUpdate}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-8" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-red-900 text-lg mb-2">
                    {language === 'he' ? 'אזהרה חשובה - קרא בעיון!' : 'Important Warning - Read Carefully!'}
                  </h3>
                  <p className="text-red-800 leading-relaxed">
                    {language === 'he' 
                      ? 'מסמך זה מכיל תנאי שימוש משפטיים מחייבים. השימוש בפלטפורמה מהווה הסכמה מלאה לתנאים אלה. אנא קרא בעיון רב לפני השימוש.'
                      : 'This document contains binding legal terms of service. Use of the Platform constitutes full agreement to these terms. Please read carefully before use.'}
                  </p>
                </div>
              </div>
            </div>

            {content.sections.map((section, index) => (
              <div key={index} className="border-b border-gray-200 last:border-0 pb-6 last:pb-0">
                <div className="flex items-start gap-3 mb-3">
                  {section.icon && (
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <section.icon className="w-5 h-5 text-gray-600" />
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-gray-900 mt-1">{section.title}</h3>
                </div>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line ml-13">
                  {section.content}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <FileText className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-amber-900 text-lg mb-2">
                {language === 'he' ? 'ייעוץ משפטי מומלץ' : 'Legal Consultation Recommended'}
              </h3>
              <p className="text-amber-800 leading-relaxed">
                {language === 'he' 
                  ? 'אנו ממליצים בחום להתייעץ עם עורך דין לפני השימוש בפלטפורמה, במיוחד אם אתה מתכנן לארגן טיולים. ייעוץ משפטי יכול לעזור לך להבין את זכויותיך וחובותיך בצורה מדויקת יותר.'
                  : 'We strongly recommend consulting with a lawyer before using the Platform, especially if you plan to organize trips. Legal consultation can help you understand your rights and obligations more accurately.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}