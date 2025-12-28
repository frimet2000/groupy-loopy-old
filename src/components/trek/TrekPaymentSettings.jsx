import React from 'react';
import { useLanguage } from '../LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Euro, PoundSterling, Coins } from 'lucide-react';

const currencies = [
  { code: 'ILS', symbol: '₪', icon: Coins, name: { he: 'שקל', en: 'Shekel', ru: 'Шекель', es: 'Shekel', fr: 'Shekel', de: 'Schekel', it: 'Shekel' } },
  { code: 'USD', symbol: '$', icon: DollarSign, name: { he: 'דולר', en: 'Dollar', ru: 'Доллар', es: 'Dólar', fr: 'Dollar', de: 'Dollar', it: 'Dollaro' } },
  { code: 'EUR', symbol: '€', icon: Euro, name: { he: 'יורו', en: 'Euro', ru: 'Евро', es: 'Euro', fr: 'Euro', de: 'Euro', it: 'Euro' } },
  { code: 'GBP', symbol: '£', icon: PoundSterling, name: { he: 'ליש״ט', en: 'Pound', ru: 'Фунт', es: 'Libra', fr: 'Livre', de: 'Pfund', it: 'Sterlina' } }
];

export const getCurrencyIcon = (currency) => {
  const curr = currencies.find(c => c.code === currency);
  return curr ? curr.icon : DollarSign;
};

export default function TrekPaymentSettings({ paymentSettings, setPaymentSettings }) {
  const { language, isRTL } = useLanguage();

  const updateSetting = (field, value) => {
    setPaymentSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="border-2 border-green-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            {language === 'he' ? 'הגדרות תשלום' : language === 'ru' ? 'Настройки оплаты' : language === 'es' ? 'Configuración de pago' : language === 'fr' ? 'Paramètres de paiement' : language === 'de' ? 'Zahlungseinstellungen' : language === 'it' ? 'Impostazioni di pagamento' : 'Payment Settings'}
          </CardTitle>
          <Switch
            checked={paymentSettings.enabled}
            onCheckedChange={(checked) => updateSetting('enabled', checked)}
          />
        </div>
      </CardHeader>
      {paymentSettings.enabled && (
        <CardContent className="p-4 space-y-4">
          <div className="space-y-2">
            <Label>
              {language === 'he' ? 'מטבע' : language === 'ru' ? 'Валюта' : language === 'es' ? 'Moneda' : language === 'fr' ? 'Devise' : language === 'de' ? 'Währung' : language === 'it' ? 'Valuta' : 'Currency'}
            </Label>
            <Select 
              value={paymentSettings.currency} 
              onValueChange={(v) => updateSetting('currency', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map(curr => {
                  const CurrIcon = curr.icon;
                  return (
                    <SelectItem key={curr.code} value={curr.code}>
                      <div className="flex items-center gap-2">
                        <CurrIcon className="w-4 h-4" />
                        {curr.name[language] || curr.name.en} ({curr.symbol})
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>
              {language === 'he' ? 'דמי רישום בסיס' : language === 'ru' ? 'Базовый регистрационный взнос' : language === 'es' ? 'Tarifa de registro base' : language === 'fr' ? 'Frais d\'inscription de base' : language === 'de' ? 'Grundregistrierungsgebühr' : language === 'it' ? 'Quota di registrazione base' : 'Base Registration Fee'}
            </Label>
            <Input
              type="number"
              min={0}
              value={paymentSettings.base_registration_fee}
              onChange={(e) => updateSetting('base_registration_fee', parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                {language === 'he' ? 'גיל מבוגר מ-' : language === 'ru' ? 'Взрослый от' : language === 'es' ? 'Adulto desde' : language === 'fr' ? 'Adulte à partir de' : language === 'de' ? 'Erwachsener ab' : language === 'it' ? 'Adulto da' : 'Adult Age From'}
              </Label>
              <Input
                type="number"
                min={1}
                max={21}
                value={paymentSettings.adult_age_threshold}
                onChange={(e) => updateSetting('adult_age_threshold', parseInt(e.target.value) || 10)}
              />
            </div>

            <div className="space-y-2">
              <Label>
                {language === 'he' ? 'מקס ילדים חינם' : language === 'ru' ? 'Макс детей бесплатно' : language === 'es' ? 'Máx niños gratis' : language === 'fr' ? 'Max enfants gratuits' : language === 'de' ? 'Max Kinder kostenlos' : language === 'it' ? 'Max bambini gratis' : 'Max Free Children'}
              </Label>
              <Input
                type="number"
                min={0}
                value={paymentSettings.max_free_children || ''}
                onChange={(e) => updateSetting('max_free_children', e.target.value ? parseInt(e.target.value) : null)}
                placeholder={language === 'he' ? 'ריק = ללא הגבלה' : 'Empty = no limit'}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>
              {language === 'he' ? 'מקסימום ימים לבחירה (כולל)' : language === 'ru' ? 'Макс дней для выбора (всего)' : language === 'es' ? 'Máx días seleccionables (total)' : language === 'fr' ? 'Jours sélectionnables max (total)' : language === 'de' ? 'Max wählbare Tage (gesamt)' : language === 'it' ? 'Giorni selezionabili max (totale)' : 'Overall Max Selectable Days'}
            </Label>
            <Input
              type="number"
              min={1}
              value={paymentSettings.overall_max_selectable_days || ''}
              onChange={(e) => updateSetting('overall_max_selectable_days', e.target.value ? parseInt(e.target.value) : null)}
              placeholder={language === 'he' ? 'ריק = ללא הגבלה' : 'Empty = no limit'}
            />
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">
                {language === 'he' ? 'הנחה לקבוצות' : language === 'ru' ? 'Скидка для групп' : language === 'es' ? 'Descuento para grupos' : language === 'fr' ? 'Réduction pour groupes' : language === 'de' ? 'Gruppenrabatt' : language === 'it' ? 'Sconto di gruppo' : 'Group Discount'}
              </Label>
              <Switch
                checked={paymentSettings.group_discount_enabled}
                onCheckedChange={(checked) => updateSetting('group_discount_enabled', checked)}
              />
            </div>
            {paymentSettings.group_discount_enabled && (
              <div className="space-y-2">
                <Label>
                  {language === 'he' ? 'אחוז הנחה (%)' : language === 'ru' ? 'Процент скидки (%)' : language === 'es' ? 'Porcentaje de descuento (%)' : language === 'fr' ? 'Pourcentage de réduction (%)' : language === 'de' ? 'Rabattprozentsatz (%)' : language === 'it' ? 'Percentuale di sconto (%)' : 'Discount Percentage (%)'}
                </Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={paymentSettings.group_discount_percentage}
                  onChange={(e) => updateSetting('group_discount_percentage', parseFloat(e.target.value) || 0)}
                />
              </div>
            )}
          </div>

          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-semibold">
                  {language === 'he' ? 'קבוצות מאורגנות חינם' : language === 'ru' ? 'Организованные группы бесплатно' : language === 'es' ? 'Grupos organizados gratis' : language === 'fr' ? 'Groupes organisés gratuits' : language === 'de' ? 'Organisierte Gruppen kostenlos' : language === 'it' ? 'Gruppi organizzati gratis' : 'Organized Groups Free'}
                </Label>
                <p className="text-xs text-gray-500">
                  {language === 'he' ? 'צבא, בתי ספר וכו׳' : 'Military, schools, etc.'}
                </p>
              </div>
              <Switch
                checked={paymentSettings.organized_group_free}
                onCheckedChange={(checked) => updateSetting('organized_group_free', checked)}
              />
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export { currencies };