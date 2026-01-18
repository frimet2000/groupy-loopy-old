// @ts-nocheck
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLanguage } from '../../LanguageContext';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GroupHealthDeclaration({ accepted, onAccept, leaderName }) {
  const { language, isRTL } = useLanguage();

  const declarationText = `אני ${leaderName} ראש קבוצת _____ מצהיר כי קראתי את כל הוראות הבטיחות ופרטי המסלולים אליהם נרשמנו. 2. וידאתי שכל חברי הקבוצה בריאים וכשירים להשתתף במסלולים אליהם נרשמנו 3. אני אחראי להתנהגות תקינה של חברי קבוצתי בהתאם להוראות הבטיחות ונחיות מארגני המסע. 4. אני אדווח למארגני המסע על כל בעיה רפואית או בטיחותית שתיווצר מזמן השתתפותנו במסע, ואפעל בהתאם להוראותיהם.`;

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <p className="text-gray-800 leading-relaxed">{declarationText}</p>

        <div className="flex items-start gap-3">
          <Checkbox
            id="groupHealthDeclaration"
            checked={accepted}
            onCheckedChange={onAccept}
          />
          <Label htmlFor="groupHealthDeclaration" className="cursor-pointer">
            אני מאשר/ת את ההצהרה
          </Label>
        </div>
      </CardContent>
    </Card>
  );
}