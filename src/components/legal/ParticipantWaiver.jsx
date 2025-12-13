import React, { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertTriangle, FileText, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ParticipantWaiver({ open, onAccept, onDecline, tripTitle }) {
  const { language, isRTL } = useLanguage();
  const [agreed, setAgreed] = useState(false);
  const [healthConfirm, setHealthConfirm] = useState(false);
  const [readFully, setReadFully] = useState(false);

  const handleScroll = (e) => {
    const element = e.target;
    // Enable checkbox when user scrolls to near the bottom (more lenient)
    const scrollProgress = (element.scrollTop + element.clientHeight) / element.scrollHeight;
    if (scrollProgress > 0.85) {
      setReadFully(true);
    }
  };

  const content = language === 'he' ? {
    title: 'כתב ויתור למשתתף בטיול',
    subtitle: `הצטרפות לטיול: ${tripTitle}`,
    sections: [
      {
        title: 'הצהרת הבנת הסיכונים',
        text: `אני מבין ומודע לכך ש:

• השתתפות בטיולים בטבע כרוכה בסיכונים טבעיים כמו מעידה, נפילה, התייבשות, שיזוף וחשיפה לגורמי טבע
• הסביבה הטבעית אינה מבוקרת ועשויה להכיל סכנות בלתי צפויות
• תנאי מזג אוויר ושטח עשויים להשתנות במהלך הטיול
• אני נושא באחריות אישית לבטיחותי ובריאותי`
      },
      {
        title: 'הצהרת כושר גופני ובריאותי',
        text: `אני מצהיר כי:

• אני בעל כושר גופני ובריאותי המאפשר לי להשתתף בטיול
• אינני סובל ממחלות או מגבלות רפואיות שעלולות לסכן אותי במהלך הטיול
• עדכנתי את מארגן הטיול בנוגע לכל מגבלה בריאותית או גופנית רלוונטית
• אני אצטייד בציוד מתאים ותקין
• אני אביא כמות מספקת של מים, מזון וציוד בטיחות אישי`
      },
      {
        title: 'ויתור על תביעות',
        text: `אני מוותר באופן סופי ובלתי חוזר על כל זכות לתבוע את:

• הפלטפורמה "The Group Loop", בעליה, מפעיליה ועובדיה
• מארגן הטיול (אלא במקרה של רשלנות חמורה מצדו)

בגין כל נזק גוף, רכוש, נפש או כלכלי שעלול להיגרם לי במהלך הטיול או בקשר אליו.

אני מבין שהפלטפורמה משמשת אך ורק כמתווכת טכנולוגית ואינה נושאת בכל אחריות לטיול.`
      },
      {
        title: 'נטילת סיכון מרצון',
        text: `אני מצהיר כי:

• אני משתתף בטיול מרצוני החופשי
• אני מבין את הסיכונים הכרוכים בטיול ומקבל אותם על עצמי
• אני מתחייב לפעול בזהירות ובהתאם להוראות מארגן הטיול
• אני מתחייב לא לעשות כל פעולה שעלולה לסכן אותי או אחרים
• אני אעדכן את מארגן הטיול על כל בעיה או קושי במהלך הטיול`
      },
      {
        title: 'ביטוח ומצבי חירום',
        text: `אני מבין כי:

• הפלטפורמה אינה מספקת כיסוי ביטוחי כלשהו
• מומלץ מאוד לערוך ביטוח נסיעות או תאונות אישיות
• במקרה חירום, עליי או על מארגן הטיול ליצור קשר עם שירותי חירום
• אני אשא בעלויות רפואיות או אחרות הכרוכות בטיפול בי`
      }
    ],
    confirmation: 'אני מאשר שקראתי, הבנתי ומסכים לכל האמור לעיל',
    healthConfirmation: 'אני מאשר שאני בכושר גופני ובריאותי טוב להשתתפות בטיול זה',
    scrollNotice: 'יש לגלול עד לסוף כדי להמשיך',
    accept: 'אני מבין ומסכים - אשר הצטרפות',
    decline: 'ביטול',
    termsLink: 'קרא את תנאי השימוש המלאים'
  } : {
    title: 'Trip Participant Liability Waiver',
    subtitle: `Joining trip: ${tripTitle}`,
    sections: [
      {
        title: 'Risk Understanding Declaration',
        text: `I understand and am aware that:

• Participation in outdoor trips involves natural risks such as slipping, falling, dehydration, sunburn, and exposure to natural elements
• The natural environment is uncontrolled and may contain unforeseen dangers
• Weather and terrain conditions may change during the trip
• I bear personal responsibility for my safety and health`
      },
      {
        title: 'Physical and Health Fitness Declaration',
        text: `I declare that:

• I possess physical and health fitness that enables me to participate in the trip
• I do not suffer from diseases or medical limitations that could endanger me during the trip
• I have informed the trip organizer about any relevant health or physical limitations
• I will equip myself with appropriate and functional equipment
• I will bring sufficient water, food, and personal safety equipment`
      },
      {
        title: 'Waiver of Claims',
        text: `I finally and irrevocably waive any right to sue:

• "The Group Loop" platform, its owners, operators, and employees
• The trip organizer (except in case of gross negligence on their part)

For any bodily, property, mental, or economic damage that may be caused to me during or in connection with the trip.

I understand that the Platform serves solely as a technological intermediary and bears no responsibility for the trip.`
      },
      {
        title: 'Voluntary Risk Assumption',
        text: `I declare that:

• I am participating in the trip of my own free will
• I understand the risks involved in the trip and accept them
• I undertake to act carefully and according to the trip organizer's instructions
• I undertake not to perform any action that could endanger me or others
• I will update the trip organizer about any problem or difficulty during the trip`
      },
      {
        title: 'Insurance and Emergencies',
        text: `I understand that:

• The Platform does not provide any insurance coverage
• It is highly recommended to purchase travel or personal accident insurance
• In case of emergency, I or the trip organizer should contact emergency services
• I will bear medical or other costs associated with my treatment`
      }
    ],
    confirmation: 'I confirm that I have read, understood, and agree to all of the above',
    healthConfirmation: 'I confirm that I am in good physical and health condition to participate in this trip',
    scrollNotice: 'Please scroll to the bottom to continue',
    accept: 'I Understand and Agree - Confirm Joining',
    decline: 'Cancel',
    termsLink: 'Read full terms of service'
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onDecline()}>
      <DialogContent className="max-w-2xl max-h-[90vh]" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-2xl">{content.title}</DialogTitle>
              <DialogDescription className="text-base">
                {content.subtitle}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Alert className="bg-amber-50 border-amber-200">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <AlertDescription className="text-amber-800 font-medium">
            {language === 'he' 
              ? 'מסמך משפטי מחייב - קריאה מלאה והבנה נדרשת'
              : 'Binding legal document - full reading and understanding required'}
          </AlertDescription>
        </Alert>

        <ScrollArea className="h-[250px] border rounded-lg p-4" onScroll={handleScroll}>
          <div className="space-y-6">
            {content.sections.map((section, index) => (
              <div key={index}>
                <h3 className="font-bold text-lg text-gray-900 mb-2" dir={isRTL ? 'rtl' : 'ltr'}>{section.title}</h3>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed" dir={isRTL ? 'rtl' : 'ltr'}>{section.text}</p>
              </div>
            ))}
          </div>
        </ScrollArea>

        {!readFully && (
          <Alert className="bg-amber-50 border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              {content.scrollNotice}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
            <Checkbox 
              id="agree" 
              checked={agreed}
              onCheckedChange={setAgreed}
              disabled={!readFully}
              className="mt-0.5 flex-shrink-0"
            />
            <label 
              htmlFor="agree" 
              className={`text-xs sm:text-sm font-medium leading-snug ${!readFully ? 'text-gray-400' : 'text-gray-900 cursor-pointer'}`}
            >
              {content.confirmation}
            </label>
          </div>

          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <Checkbox 
              id="health" 
              checked={healthConfirm}
              onCheckedChange={setHealthConfirm}
              disabled={!readFully}
              className="mt-0.5 flex-shrink-0"
            />
            <label 
              htmlFor="health" 
              className={`text-xs sm:text-sm font-medium leading-snug ${!readFully ? 'text-gray-400' : 'text-blue-900 cursor-pointer'}`}
            >
              <Heart className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
              {content.healthConfirmation}
            </label>
          </div>
        </div>

        <Link to={createPageUrl('TermsOfService')} target="_blank">
          <Button variant="link" className="gap-2 text-sm">
            <FileText className="w-4 h-4" />
            {content.termsLink}
          </Button>
        </Link>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onDecline}>
            {content.decline}
          </Button>
          <Button 
            onClick={onAccept}
            disabled={!agreed || !healthConfirm || !readFully}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Shield className="w-4 h-4 mr-2" />
            {content.accept}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}