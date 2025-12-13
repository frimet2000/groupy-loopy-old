import React from 'react';
import { useLanguage } from '../LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DollarSign, User, Users } from 'lucide-react';

export default function BudgetCreator({ budget, setBudget }) {
  const { language } = useLanguage();

  const handleChange = (field, value) => {
    setBudget({ ...budget, [field]: value });
  };

  return (
    <Card className="border-2 border-amber-100 shadow-xl bg-white/80">
      <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 border-b">
        <CardTitle className="flex items-center gap-2 text-amber-700">
          <DollarSign className="w-5 h-5" />
          {language === 'he' ? 'תקציב משוער' : language === 'ru' ? 'Примерный бюджет' : language === 'es' ? 'Presupuesto estimado' : language === 'fr' ? 'Budget estimé' : language === 'de' ? 'Geschätztes Budget' : language === 'it' ? 'Budget stimato' : 'Estimated Budget'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-base font-semibold">
            <User className="w-4 h-4 text-blue-600" />
            {language === 'he' ? 'לבודד' : language === 'ru' ? 'Соло' : language === 'es' ? 'Solo' : language === 'fr' ? 'Solo' : language === 'de' ? 'Allein' : language === 'it' ? 'Solo' : 'Solo'}
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-gray-500">{language === 'he' ? 'מינימום' : 'Min'}</Label>
              <Input
                type="number"
                value={budget.solo_min}
                onChange={(e) => handleChange('solo_min', parseFloat(e.target.value) || 0)}
                min="0"
                placeholder="0"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-500">{language === 'he' ? 'מקסימום' : 'Max'}</Label>
              <Input
                type="number"
                value={budget.solo_max}
                onChange={(e) => handleChange('solo_max', parseFloat(e.target.value) || 0)}
                min="0"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-base font-semibold">
            <Users className="w-4 h-4 text-purple-600" />
            {language === 'he' ? 'למשפחה' : language === 'ru' ? 'Семья' : language === 'es' ? 'Familia' : language === 'fr' ? 'Famille' : language === 'de' ? 'Familie' : language === 'it' ? 'Famiglia' : 'Family'}
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-gray-500">{language === 'he' ? 'מינימום' : 'Min'}</Label>
              <Input
                type="number"
                value={budget.family_min}
                onChange={(e) => handleChange('family_min', parseFloat(e.target.value) || 0)}
                min="0"
                placeholder="0"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-500">{language === 'he' ? 'מקסימום' : 'Max'}</Label>
              <Input
                type="number"
                value={budget.family_max}
                onChange={(e) => handleChange('family_max', parseFloat(e.target.value) || 0)}
                min="0"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>{language === 'he' ? 'הערות' : language === 'ru' ? 'Примечания' : language === 'es' ? 'Notas' : language === 'fr' ? 'Notes' : language === 'de' ? 'Notizen' : language === 'it' ? 'Note' : 'Notes'}
          <Textarea
            value={budget.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder={language === 'he' ? 'הערות על התקציב...' : language === 'ru' ? 'Заметки о бюджете...' : language === 'es' ? 'Notas del presupuesto...' : language === 'fr' ? 'Notes sur le budget...' : language === 'de' ? 'Budget-Notizen...' : language === 'it' ? 'Note sul budget...' : 'Budget notes...'}
            rows={3}
            dir={language === 'he' ? 'rtl' : 'ltr'}
          />
        </div>
      </CardContent>
    </Card>
  );
}