import React, { useState, useEffect } from 'react';
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

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertTriangle, FileText, ChevronRight, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function OrganizerWaiver({ open, onAccept, onDecline }) {
  const { language, isRTL } = useLanguage();
  const [agreed, setAgreed] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  
  const handleNextSection = () => {
    setCurrentSection(currentSection + 1);
  };

  useEffect(() => {
    if (!open) {
      setCurrentSection(0);
      setAgreed(false);
    }
  }, [open]);

  const content = language === 'he' ? {
    title: 'כתב ויתור למארגן טיול',
    subtitle: 'אנא קרא בעיון לפני יצירת הטיול',
    sections: [
      {
        title: 'הצהרת אחריות מלאה',
        text: `בתור מארגן הטיול, אני מצהיר ומתחייב כי:

• אני נושא באחריות מלאה ובלעדית לכל היבטי הטיול
• אני בעל הידע, הניסיון והכישורים הנדרשים לארגון והנהלת הטיול
• אני אבחר מסלול מתאים ובטיחותי לרמת הכושר והניסיון של המשתתפים
• אני אתריע למשתתפים על כל סיכון ידוע או צפוי במסלול
• אני אוודא שתנאי מזג האוויר והשטח בטוחים לפני תחילת הטיול`
      },
      {
        title: 'חובות זהירות',
        text: `אני מתחייב:

• לבדוק את המסלול מראש ולזהות סיכונים
• לספק למשתתפים מידע מדויק על רמת הקושי, משך הזמן והציוד הנדרש
• לשאת עמי ציוד עזרה ראשונה ואמצעי תקשורת
• לפעול בזהירות מירבית ובאחריות לשמירה על בטיחות המשתתפים
• לבטל את הטיול אם התנאים אינם בטיחותיים`
      },
      {
        title: 'ויתור על תביעות כלפי הפלטפורמה',
        text: `אני מבין ומסכים כי:

• הפלטפורמה משמשת אך ורק כמתווכת טכנולוגית
• הפלטפורמה אינה נושאת בכל אחריות לטיול
• אני מוותר באופן סופי ובלתי חוזר על כל תביעה כלפי הפלטפורמה
• אני מתחייב לשפות את הפלטפורמה מכל תביעה שתוגש על ידי משתתף`
      },
      {
        title: 'הצהרה על עמידה בחוק',
        text: `אני מצהיר כי:

• הטיול יתקיים במקום המותר על פי חוק
• אני אציית לכל החוקים והתקנות הרלוונטיים
• אין מניעה חוקית לארגון הטיול
• קיבלתי את כל האישורים הנדרשים (במידה ונדרשים)`
      }
    ],
    confirmation: 'אני מאשר שקראתי, הבנתי ומסכים לכל האמור לעיל',
    scrollNotice: 'יש לגלול עד לסוף כדי להמשיך',
    accept: 'אני מקבל את האחריות ומאשר',
    decline: 'ביטול',
    termsLink: 'קרא את תנאי השימוש המלאים'
  } : {
    title: 'Trip Organizer Liability Waiver',
    subtitle: 'Please read carefully before creating the trip',
    sections: [
      {
        title: 'Full Liability Declaration',
        text: `As the trip organizer, I declare and undertake that:

• I bear full and exclusive responsibility for all aspects of the trip
• I possess the knowledge, experience, and skills required to organize and lead the trip
• I will select a suitable and safe route for participants' fitness and experience levels
• I will warn participants about any known or foreseeable risks on the route
• I will ensure weather and terrain conditions are safe before trip commencement`
      },
      {
        title: 'Duty of Care',
        text: `I undertake to:

• Check the route in advance and identify risks
• Provide participants with accurate information about difficulty level, duration, and required equipment
• Carry first aid equipment and communication devices
• Act with maximum care and responsibility for participants' safety
• Cancel the trip if conditions are unsafe`
      },
      {
        title: 'Waiver of Claims Against Platform',
        text: `I understand and agree that:

• The Platform serves solely as a technological intermediary
• The Platform bears no responsibility for the trip
• I finally and irrevocably waive any claim against the Platform
• I undertake to indemnify the Platform from any claim filed by a participant`
      },
      {
        title: 'Legal Compliance Declaration',
        text: `I declare that:

• The trip will take place in a legally permitted location
• I will comply with all relevant laws and regulations
• There is no legal impediment to organizing the trip
• I have obtained all required permits (if applicable)`
      }
    ],
    confirmation: 'I confirm that I have read, understood, and agree to all of the above',
    scrollNotice: 'Please scroll to the bottom to continue',
    accept: 'I Accept Responsibility and Confirm',
    decline: 'Cancel',
    termsLink: 'Read full terms of service'
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onDecline()}>
      <DialogContent 
        className="max-w-2xl h-[90vh] sm:max-h-[90vh] flex flex-col overflow-hidden" 
        dir={isRTL ? 'rtl' : 'ltr'}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-2xl">{content.title}</DialogTitle>
              <DialogDescription className="text-base">
                {content.subtitle}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Alert className="bg-red-50 border-red-200">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <AlertDescription className="text-red-800 font-medium">
            {language === 'he' 
              ? 'מסמך משפטי מחייב - קריאה מלאה והבנה נדרשת'
              : 'Binding legal document - full reading and understanding required'}
          </AlertDescription>
        </Alert>

        <div className="flex-1 min-h-0 overflow-y-auto border rounded-lg p-8 bg-white shadow-sm">
          <div className="mb-3 text-sm font-semibold text-red-600">
            {language === 'he' ? `חלק ${currentSection + 1} מתוך ${content.sections.length}` : `Section ${currentSection + 1} of ${content.sections.length}`}
          </div>
          
          <h3 className="font-bold text-2xl text-gray-900 mb-4" dir={isRTL ? 'rtl' : 'ltr'}>
            {content.sections[currentSection].title}
          </h3>
          
          <p className="text-gray-700 whitespace-pre-line leading-relaxed text-base mb-8" dir={isRTL ? 'rtl' : 'ltr'}>
            {content.sections[currentSection].text}
          </p>
        </div>

        {currentSection < content.sections.length - 1 ? (
          <div className="flex justify-end py-4 border-t bg-gray-50">
            <button
              type="button"
              onMouseDown={handleNextSection}
              className="gap-2 bg-red-600 hover:bg-red-700 px-8 py-3 text-base font-semibold text-white rounded-md inline-flex items-center justify-center cursor-pointer transition-colors"
            >
              {language === 'he' ? 'הבא' : 'Next'}
              {isRTL ? <ChevronLeft className="w-5 h-5 ml-2" /> : <ChevronRight className="w-5 h-5 ml-2" />}
            </button>
          </div>
        ) : null}

        <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
          <Checkbox 
            id="agree" 
            checked={agreed}
            onCheckedChange={setAgreed}
            disabled={currentSection < content.sections.length - 1}
            className="mt-0.5 flex-shrink-0"
          />
          <label 
            htmlFor="agree" 
            className={`text-xs sm:text-sm font-medium leading-snug ${currentSection < content.sections.length - 1 ? 'text-gray-400' : 'text-gray-900 cursor-pointer'}`}
          >
            {content.confirmation}
          </label>
        </div>

        <Link to={createPageUrl('TermsOfService')} target="_blank">
          <Button variant="link" className="gap-2 text-sm">
            <FileText className="w-4 h-4" />
            {content.termsLink}
          </Button>
        </Link>

        <DialogFooter className="gap-2 flex-shrink-0">
          <Button variant="outline" onClick={onDecline}>
            {content.decline}
          </Button>
          <Button 
            onClick={onAccept}
            disabled={!agreed || currentSection < content.sections.length - 1}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Shield className="w-4 h-4 mr-2" />
            {content.accept}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}