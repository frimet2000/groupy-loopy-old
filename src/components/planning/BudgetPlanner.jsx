import React, { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { DollarSign, Edit, User, Users } from 'lucide-react';
import { toast } from "sonner";

export default function BudgetPlanner({ trip, isOrganizer, onUpdate }) {
  const { language } = useLanguage();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [budgetData, setBudgetData] = useState({
    solo_min: trip.budget?.solo_min || 0,
    solo_max: trip.budget?.solo_max || 0,
    family_min: trip.budget?.family_min || 0,
    family_max: trip.budget?.family_max || 0,
    currency: trip.budget?.currency || (language === 'he' ? 'ILS' : 'EUR'),
    notes: trip.budget?.notes || ''
  });

  const budget = trip.budget || { solo_min: 0, solo_max: 0, family_min: 0, family_max: 0, currency: language === 'he' ? 'ILS' : 'EUR', notes: '' };

  const handleSaveBudget = async () => {
    await base44.entities.Trip.update(trip.id, {
      budget: budgetData
    });
    setShowEditDialog(false);
    onUpdate();
    toast.success(language === 'he' ? 'התקציב עודכן' : language === 'ru' ? 'Бюджет обновлен' : language === 'es' ? 'Presupuesto actualizado' : language === 'fr' ? 'Budget mis à jour' : language === 'de' ? 'Budget aktualisiert' : language === 'it' ? 'Budget aggiornato' : 'Budget updated');
  };

  const formatCurrency = (amount) => {
    const currency = budget.currency || (language === 'he' ? 'ILS' : 'EUR');
    const locale = language === 'he' ? 'he-IL' : language === 'ru' ? 'ru-RU' : language === 'es' ? 'es-ES' : language === 'fr' ? 'fr-FR' : language === 'de' ? 'de-DE' : language === 'it' ? 'it-IT' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatRange = (min, max) => {
    if (min === 0 && max === 0) {
      return language === 'he' ? 'לא הוגדר' : language === 'ru' ? 'Не установлено' : language === 'es' ? 'No definido' : language === 'fr' ? 'Non défini' : language === 'de' ? 'Nicht festgelegt' : language === 'it' ? 'Non impostato' : 'Not set';
    }
    if (min === max) {
      return formatCurrency(min);
    }
    return `${formatCurrency(min)} - ${formatCurrency(max)}`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            {language === 'he' ? 'תקציב משוער' : language === 'ru' ? 'Примерный бюджет' : language === 'es' ? 'Presupuesto estimado' : language === 'fr' ? 'Budget estimé' : language === 'de' ? 'Geschätztes Budget' : language === 'it' ? 'Budget stimato' : 'Estimated Budget'}
          </CardTitle>
          {isOrganizer && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setBudgetData({
                  solo_min: budget.solo_min || 0,
                  solo_max: budget.solo_max || 0,
                  family_min: budget.family_min || 0,
                  family_max: budget.family_max || 0,
                  currency: budget.currency || 'ILS',
                  notes: budget.notes || ''
                });
                setShowEditDialog(true);
              }}
            >
              <Edit className="w-4 h-4 mr-2" />
              {language === 'he' ? 'עריכה' : language === 'ru' ? 'Редактировать' : language === 'es' ? 'Editar' : language === 'fr' ? 'Modifier' : language === 'de' ? 'Bearbeiten' : language === 'it' ? 'Modifica' : 'Edit'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Budget Ranges */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-blue-700">
                  {language === 'he' ? 'לבודד' : language === 'ru' ? 'Одиночный путешественник' : language === 'es' ? 'Viajero solo' : language === 'fr' ? 'Voyageur solo' : language === 'de' ? 'Einzelreisender' : language === 'it' ? 'Viaggiatore singolo' : 'Solo Traveler'}
                </h3>
              </div>
              <p className="text-2xl font-bold text-blue-700">
                {formatRange(budget.solo_min, budget.solo_max)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-purple-700">
                  {language === 'he' ? 'למשפחה' : language === 'ru' ? 'Семья' : language === 'es' ? 'Familia' : language === 'fr' ? 'Famille' : language === 'de' ? 'Familie' : language === 'it' ? 'Famiglia' : 'Family'}
                </h3>
              </div>
              <p className="text-2xl font-bold text-purple-700">
                {formatRange(budget.family_min, budget.family_max)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Notes */}
        {budget.notes && (
          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2 text-gray-700">
                {language === 'he' ? 'הערות' : language === 'ru' ? 'Заметки' : language === 'es' ? 'Notas' : language === 'fr' ? 'Notes' : language === 'de' ? 'Notizen' : language === 'it' ? 'Note' : 'Notes'}
              </h3>
              <p className="text-gray-600 whitespace-pre-wrap">{budget.notes}</p>
            </CardContent>
          </Card>
        )}

        {!budget.notes && budget.solo_min === 0 && budget.solo_max === 0 && budget.family_min === 0 && budget.family_max === 0 && (
          <div className="text-center py-8 text-gray-500">
            {language === 'he' ? 'לא הוגדר תקציב עדיין' : language === 'ru' ? 'Информации о бюджете пока нет' : language === 'es' ? 'Aún no hay información de presupuesto' : language === 'fr' ? 'Pas encore d\'information budgétaire' : language === 'de' ? 'Noch keine Budgetinformationen' : language === 'it' ? 'Nessuna informazione sul budget ancora' : 'No budget information yet'}
          </div>
        )}
      </CardContent>

      {/* Edit Budget Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{language === 'he' ? 'עריכת תקציב' : language === 'ru' ? 'Редактировать бюджет' : language === 'es' ? 'Editar presupuesto' : language === 'fr' ? 'Modifier le budget' : language === 'de' ? 'Budget bearbeiten' : language === 'it' ? 'Modifica budget' : 'Edit Budget'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Solo Budget */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-base font-semibold">
                <User className="w-4 h-4 text-blue-600" />
                {language === 'he' ? 'תקציב לבודד' : language === 'ru' ? 'Бюджет для одного' : language === 'es' ? 'Presupuesto individual' : language === 'fr' ? 'Budget solo' : language === 'de' ? 'Einzelbudget' : language === 'it' ? 'Budget individuale' : 'Solo Budget'}
              </Label>
              <div className="flex flex-wrap gap-2">
                {[
                  { min: 50, max: 100, label: '50-100' },
                  { min: 100, max: 200, label: '100-200' },
                  { min: 200, max: 500, label: '200-500' },
                  { min: 500, max: 999999, label: language === 'he' ? '500+' : '500+' },
                ].map((range) => {
                  const isSelected = budgetData.solo_min === range.min && budgetData.solo_max === range.max;
                  return (
                    <button
                      key={range.label}
                      type="button"
                      onClick={() => setBudgetData({ ...budgetData, solo_min: range.min, solo_max: range.max })}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100'
                      }`}
                    >
                      {range.label} {budgetData.currency === 'ILS' ? '₪' : budgetData.currency === 'EUR' ? '€' : budgetData.currency === 'USD' ? '$' : '£'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Family Budget */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-base font-semibold">
                <Users className="w-4 h-4 text-purple-600" />
                {language === 'he' ? 'תקציב למשפחה' : language === 'ru' ? 'Семейный бюджет' : language === 'es' ? 'Presupuesto familiar' : language === 'fr' ? 'Budget familial' : language === 'de' ? 'Familienbudget' : language === 'it' ? 'Budget familiare' : 'Family Budget'}
              </Label>
              <div className="flex flex-wrap gap-2">
                {[
                  { min: 100, max: 200, label: '100-200' },
                  { min: 200, max: 400, label: '200-400' },
                  { min: 400, max: 800, label: '400-800' },
                  { min: 800, max: 999999, label: language === 'he' ? '800+' : '800+' },
                ].map((range) => {
                  const isSelected = budgetData.family_min === range.min && budgetData.family_max === range.max;
                  return (
                    <button
                      key={range.label}
                      type="button"
                      onClick={() => setBudgetData({ ...budgetData, family_min: range.min, family_max: range.max })}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        isSelected
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'bg-purple-50 text-purple-600 border border-purple-200 hover:bg-purple-100'
                      }`}
                    >
                      {range.label} {budgetData.currency === 'ILS' ? '₪' : budgetData.currency === 'EUR' ? '€' : budgetData.currency === 'USD' ? '$' : '£'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>{language === 'he' ? 'מטבע' : language === 'ru' ? 'Валюта' : language === 'es' ? 'Moneda' : language === 'fr' ? 'Devise' : language === 'de' ? 'Währung' : language === 'it' ? 'Valuta' : 'Currency'}</Label>
              <select
                value={budgetData.currency}
                onChange={(e) => setBudgetData({ ...budgetData, currency: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="ILS">₪ (ILS)</option>
                <option value="EUR">€ (EUR)</option>
                <option value="USD">$ (USD)</option>
                <option value="GBP">£ (GBP)</option>
              </select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>{language === 'he' ? 'הערות' : language === 'ru' ? 'Заметки' : language === 'es' ? 'Notas' : language === 'fr' ? 'Notes' : language === 'de' ? 'Notizen' : language === 'it' ? 'Note' : 'Notes'}</Label>
              <Textarea
                value={budgetData.notes}
                onChange={(e) => setBudgetData({ ...budgetData, notes: e.target.value })}
                placeholder={language === 'he' ? 'הערות על התקציב...' : language === 'ru' ? 'Заметки о бюджете...' : language === 'es' ? 'Notas sobre el presupuesto...' : language === 'fr' ? 'Notes sur le budget...' : language === 'de' ? 'Notizen zum Budget...' : language === 'it' ? 'Note sul budget...' : 'Notes about the budget...'}
                rows={4}
                dir={language === 'he' ? 'rtl' : 'ltr'}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              {language === 'he' ? 'ביטול' : language === 'ru' ? 'Отмена' : language === 'es' ? 'Cancelar' : language === 'fr' ? 'Annuler' : language === 'de' ? 'Abbrechen' : language === 'it' ? 'Annulla' : 'Cancel'}
            </Button>
            <Button onClick={handleSaveBudget} className="bg-emerald-600 hover:bg-emerald-700">
              {language === 'he' ? 'שמור' : language === 'ru' ? 'Сохранить' : language === 'es' ? 'Guardar' : language === 'fr' ? 'Enregistrer' : language === 'de' ? 'Speichern' : language === 'it' ? 'Salva' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}