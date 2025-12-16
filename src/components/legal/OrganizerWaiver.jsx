import React, { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertTriangle, ChevronRight, ChevronLeft, Check, Loader2 } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from 'framer-motion';

export default function OrganizerWaiver({ open, onAccept, onDecline }) {
  const { language, isRTL } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [agreed, setAgreed] = useState(false);
  const [processing, setProcessing] = useState(false);

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
    accept: 'אני מקבל את האחריות ומאשר',
    decline: 'ביטול',
    next: 'הבא',
    back: 'חזור'
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
    accept: 'I Accept Responsibility and Confirm',
    decline: 'Cancel',
    next: 'Next',
    back: 'Back'
  };

  const totalSteps = content.sections.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleAccept = async () => {
    if (!agreed) return;
    setProcessing(true);
    try {
      await onAccept();
    } catch (error) {
      console.error('Error accepting waiver:', error);
      setProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onDecline()}>
      <DialogContent 
        className="max-w-3xl h-[90vh] flex flex-col overflow-hidden" 
        dir={isRTL ? 'rtl' : 'ltr'}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-2xl">{content.title}</DialogTitle>
              <p className="text-sm text-gray-500">{content.subtitle}</p>
            </div>
          </div>

          <Alert className="bg-red-50 border-red-200">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <AlertDescription className="text-red-800 font-medium">
              {language === 'he' 
                ? 'מסמך משפטי מחייב - קריאה מלאה והבנה נדרשת'
                : 'Binding legal document - full reading and understanding required'}
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{language === 'he' ? `שלב ${currentStep + 1} מתוך ${totalSteps}` : `Step ${currentStep + 1} of ${totalSteps}`}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </DialogHeader>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 overflow-y-auto px-1"
          >
            <div className="bg-white border rounded-lg p-6 h-full">
              <h3 className="font-bold text-xl text-gray-900 mb-4" dir={isRTL ? 'rtl' : 'ltr'}>
                {content.sections[currentStep].title}
              </h3>
              
              <p className="text-gray-700 whitespace-pre-line leading-relaxed" dir={isRTL ? 'rtl' : 'ltr'}>
                {content.sections[currentStep].text}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {currentStep === totalSteps - 1 && (
          <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg flex-shrink-0">
            <Checkbox 
              id="agree" 
              checked={agreed}
              onCheckedChange={setAgreed}
              className="mt-0.5 flex-shrink-0"
            />
            <label 
              htmlFor="agree" 
              className="text-sm font-medium leading-snug text-gray-900 cursor-pointer"
            >
              {content.confirmation}
            </label>
          </div>
        )}

        <div className="flex justify-between gap-2 pt-4 border-t flex-shrink-0">
          <Button 
            variant="outline" 
            onClick={currentStep === 0 ? onDecline : handleBack}
            className="gap-2"
          >
            {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            {currentStep === 0 ? content.decline : content.back}
          </Button>

          {currentStep < totalSteps - 1 ? (
            <Button 
              onClick={handleNext}
              className="gap-2 bg-red-600 hover:bg-red-700"
            >
              {content.next}
              {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </Button>
          ) : (
            <Button 
              onClick={handleAccept}
              disabled={!agreed || processing}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              {processing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              {content.accept}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}