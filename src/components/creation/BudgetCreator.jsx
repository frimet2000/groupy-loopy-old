import React, { useEffect } from 'react';
import { useLanguage } from '../LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, User, Users } from 'lucide-react';

const currencies = [
  { code: 'ILS', symbol: '₪', name: { he: 'שקל', en: 'Shekel', ru: 'Шекель', es: 'Shéquel', fr: 'Shekel', de: 'Schekel', it: 'Shekel' } },
  { code: 'EUR', symbol: '€', name: { he: 'יורו', en: 'Euro', ru: 'Евро', es: 'Euro', fr: 'Euro', de: 'Euro', it: 'Euro' } },
  { code: 'USD', symbol: '$', name: { he: 'דולר', en: 'Dollar', ru: 'Доллар', es: 'Dólar', fr: 'Dollar', de: 'Dollar', it: 'Dollaro' } },
  { code: 'GBP', symbol: '£', name: { he: 'לירה שטרלינג', en: 'Pound', ru: 'Фунт', es: 'Libra', fr: 'Livre', de: 'Pfund', it: 'Sterlina' } },
  { code: 'RUB', symbol: '₽', name: { he: 'רובל', en: 'Ruble', ru: 'Рубль', es: 'Rublo', fr: 'Rouble', de: 'Rubel', it: 'Rublo' } },
];

const getDefaultCurrency = (lang) => {
  switch (lang) {
    case 'he': return 'ILS';
    case 'ru': return 'RUB';
    case 'de': return 'EUR';
    case 'fr': return 'EUR';
    case 'es': return 'EUR';
    case 'it': return 'EUR';
    default: return 'USD';
  }
};

export default function BudgetCreator({ budget, setBudget }) {
  const { language } = useLanguage();

  useEffect(() => {
    if (!budget.currency) {
      setBudget({ ...budget, currency: getDefaultCurrency(language) });
    }
  }, []);

  const handleChange = (field, value) => {
    setBudget({ ...budget, [field]: value });
  };

  const currentCurrency = currencies.find(c => c.code === budget.currency) || currencies[0];

  return (
    <Card className="border-2 border-amber-100 shadow-xl bg-white/80">
      <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-amber-700">
            <DollarSign className="w-5 h-5" />
            {language === 'he' ? 'תקציב משוער' : language === 'ru' ? 'Примерный бюджет' : language === 'es' ? 'Presupuesto estimado' : language === 'fr' ? 'Budget estimé' : language === 'de' ? 'Geschätztes Budget' : language === 'it' ? 'Budget stimato' : 'Estimated Budget'}
          </CardTitle>
          <Select value={budget.currency || 'ILS'} onValueChange={(v) => handleChange('currency', v)}>
            <SelectTrigger className="w-[120px] h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {currencies.map(curr => (
                <SelectItem key={curr.code} value={curr.code}>
                  {curr.symbol} {curr.name[language] || curr.name.en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-base font-semibold">
            <User className="w-4 h-4 text-blue-600" />
            {language === 'he' ? 'לבודד' : language === 'ru' ? 'Соло' : language === 'es' ? 'Solo' : language === 'fr' ? 'Solo' : language === 'de' ? 'Allein' : language === 'it' ? 'Solo' : 'Solo'}
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-gray-500">{language === 'he' ? 'מינימום' : language === 'ru' ? 'Мин' : language === 'es' ? 'Mín' : language === 'fr' ? 'Min' : language === 'de' ? 'Min' : language === 'it' ? 'Min' : 'Min'} ({currentCurrency.symbol})</Label>
              <Input
                type="number"
                value={budget.solo_min}
                onChange={(e) => handleChange('solo_min', e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                min="0"
                placeholder=""
              />
            </div>
            <div>
              <Label className="text-xs text-gray-500">{language === 'he' ? 'מקסימום' : language === 'ru' ? 'Макс' : language === 'es' ? 'Máx' : language === 'fr' ? 'Max' : language === 'de' ? 'Max' : language === 'it' ? 'Max' : 'Max'} ({currentCurrency.symbol})</Label>
              <Input
                type="number"
                value={budget.solo_max}
                onChange={(e) => handleChange('solo_max', e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                min="0"
                placeholder=""
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
              <Label className="text-xs text-gray-500">{language === 'he' ? 'מינימום' : language === 'ru' ? 'Мин' : language === 'es' ? 'Mín' : language === 'fr' ? 'Min' : language === 'de' ? 'Min' : language === 'it' ? 'Min' : 'Min'} ({currentCurrency.symbol})</Label>
              <Input
                type="number"
                value={budget.family_min}
                onChange={(e) => handleChange('family_min', e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                min="0"
                placeholder=""
              />
            </div>
            <div>
              <Label className="text-xs text-gray-500">{language === 'he' ? 'מקסימום' : language === 'ru' ? 'Макс' : language === 'es' ? 'Máx' : language === 'fr' ? 'Max' : language === 'de' ? 'Max' : language === 'it' ? 'Max' : 'Max'} ({currentCurrency.symbol})</Label>
              <Input
                type="number"
                value={budget.family_max}
                onChange={(e) => handleChange('family_max', e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                min="0"
                placeholder=""
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>{language === 'he' ? 'הערות' : language === 'ru' ? 'Примечания' : language === 'es' ? 'Notas' : language === 'fr' ? 'Notes' : language === 'de' ? 'Notizen' : language === 'it' ? 'Note' : 'Notes'}</Label>
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