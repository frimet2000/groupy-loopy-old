import React, { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, Edit, Tag, DollarSign, Users, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { Switch } from "@/components/ui/switch";

export default function TrekCategoryManager({ categories, setCategories, currency = 'ILS' }) {
  const { language, isRTL } = useLanguage();
  const [editingCategory, setEditingCategory] = useState(null);
  const [showDialog, setShowDialog] = useState(false);

  const addCategory = () => {
    const newCategory = {
      id: Date.now().toString(),
      name: '',
      description: '',
      max_selectable_days: null,
      color: '#10B981',
      fee_per_adult: 0,
      requires_approval: false
    };
    setEditingCategory(newCategory);
    setShowDialog(true);
  };

  const editCategory = (cat) => {
    setEditingCategory({ ...cat });
    setShowDialog(true);
  };

  const saveCategory = () => {
    if (!editingCategory.name) return;

    if (categories.find(c => c.id === editingCategory.id)) {
      setCategories(categories.map(c => c.id === editingCategory.id ? editingCategory : c));
    } else {
      setCategories([...categories, editingCategory]);
    }

    setShowDialog(false);
    setEditingCategory(null);
  };

  const deleteCategory = (catId) => {
    if (confirm(language === 'he' ? 'למחוק את הקטגוריה?' : 'Delete this category?')) {
      setCategories(categories.filter(c => c.id !== catId));
    }
  };

  const colorOptions = [
    { value: '#10B981', name: language === 'he' ? 'ירוק' : 'Green' },
    { value: '#3B82F6', name: language === 'he' ? 'כחול' : 'Blue' },
    { value: '#F59E0B', name: language === 'he' ? 'כתום' : 'Orange' },
    { value: '#EF4444', name: language === 'he' ? 'אדום' : 'Red' },
    { value: '#8B5CF6', name: language === 'he' ? 'סגול' : 'Purple' },
    { value: '#EC4899', name: language === 'he' ? 'ורוד' : 'Pink' }
  ];

  return (
    <>
      <Card className="border-2 border-purple-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-purple-600" />
              {language === 'he' ? 'קטגוריות/איזורי טראק' : language === 'ru' ? 'Категории трека' : language === 'es' ? 'Categorías del trek' : language === 'fr' ? 'Catégories' : language === 'de' ? 'Trek-Kategorien' : language === 'it' ? 'Categorie' : 'Trek Categories/Areas'}
            </CardTitle>
            <Button
              type="button"
              size="sm"
              onClick={addCategory}
              className="gap-2 bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4" />
              {language === 'he' ? 'הוסף קטגוריה' : language === 'ru' ? 'Добавить' : language === 'es' ? 'Añadir' : language === 'fr' ? 'Ajouter' : language === 'de' ? 'Hinzufügen' : language === 'it' ? 'Aggiungi' : 'Add Category'}
            </Button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {language === 'he' 
              ? 'הגדר איזורים/קטגוריות לטראק (לדוגמה: נגב, צפון, הרי הפירנאים). כל יום בטראק ישויך לאחת הקטגוריות שתגדיר כאן.'
              : language === 'ru'
              ? 'Определите области/категории трека (например: Негев, Север, Пиренеи). Каждый день будет назначен одной из категорий.'
              : language === 'es'
              ? 'Define áreas/categorías del trek (ej: Negev, Norte, Pirineos). Cada día se asignará a una de estas categorías.'
              : language === 'fr'
              ? 'Définissez les zones/catégories du trek (ex: Néguev, Nord, Pyrénées). Chaque jour sera assigné à l\'une de ces catégories.'
              : language === 'de'
              ? 'Definieren Sie Bereiche/Kategorien des Treks (z.B.: Negev, Norden, Pyrenäen). Jeder Tag wird einer dieser Kategorien zugeordnet.'
              : language === 'it'
              ? 'Definisci aree/categorie del trek (es: Negev, Nord, Pirenei). Ogni giorno verrà assegnato a una di queste categorie.'
              : 'Define areas/categories for the trek (e.g., Negev, North, Pyrenees). Each trek day will be assigned to one of these categories.'}
          </p>
        </CardHeader>
        <CardContent className="p-4">
          {categories.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Tag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">
                {language === 'he' ? 'הוסף קטגוריות כדי לארגן את הימים בטראק' : language === 'ru' ? 'Добавьте категории для организации дней' : language === 'es' ? 'Añadir categorías para organizar los días' : language === 'fr' ? 'Ajoutez des catégories pour organiser les jours' : language === 'de' ? 'Kategorien hinzufügen, um Tage zu organisieren' : language === 'it' ? 'Aggiungi categorie per organizzare i giorni' : 'Add categories to organize trek days'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {categories.map((cat) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white border-2 border-purple-100 rounded-xl p-4 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div 
                        className="w-4 h-4 rounded-full mt-1" 
                        style={{ backgroundColor: cat.color }}
                      />
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{cat.name}</h4>
                        {cat.description && (
                          <p className="text-sm text-gray-600 mt-1" dir={isRTL ? 'rtl' : 'ltr'}>
                            {cat.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2 mt-2 text-xs">
                          {cat.max_selectable_days && (
                            <Badge variant="outline" className="gap-1">
                              <Users className="w-3 h-3" />
                              {language === 'he' ? `מקס ${cat.max_selectable_days} ימים` : `Max ${cat.max_selectable_days} days`}
                            </Badge>
                          )}
                          {cat.fee_per_adult > 0 && (
                            <Badge variant="outline" className="gap-1">
                              <DollarSign className="w-3 h-3" />
                              {cat.fee_per_adult} {currency}
                            </Badge>
                          )}
                          {cat.requires_approval && (
                            <Badge variant="outline" className="gap-1">
                              <Shield className="w-3 h-3 text-amber-600" />
                              {language === 'he' ? 'דורש אישור' : 'Requires Approval'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => editCategory(cat)}
                        className="h-8 w-8"
                      >
                        <Edit className="w-4 h-4 text-purple-600" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteCategory(cat.id)}
                        className="h-8 w-8"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Category Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="w-6 h-6 text-purple-600" />
              {editingCategory?.id && categories.find(c => c.id === editingCategory.id)
                ? (language === 'he' ? 'עריכת קטגוריה' : 'Edit Category')
                : (language === 'he' ? 'קטגוריה חדשה' : 'New Category')
              }
            </DialogTitle>
          </DialogHeader>
          {editingCategory && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>
                  {language === 'he' ? 'שם הקטגוריה' : language === 'ru' ? 'Название' : language === 'es' ? 'Nombre' : language === 'fr' ? 'Nom' : language === 'de' ? 'Name' : language === 'it' ? 'Nome' : 'Category Name'} *
                </Label>
                <Input
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  placeholder={language === 'he' ? 'לדוגמה: נגב, צפון, הרי הפירנאים' : 'e.g., Negev, North, Pyrenees'}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </div>

              <div className="space-y-2">
                <Label>
                  {language === 'he' ? 'תיאור' : language === 'ru' ? 'Описание' : language === 'es' ? 'Descripción' : language === 'fr' ? 'Description' : language === 'de' ? 'Beschreibung' : language === 'it' ? 'Descrizione' : 'Description'}
                </Label>
                <Textarea
                  value={editingCategory.description}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  placeholder={language === 'he' ? 'תאר את הקטגוריה...' : 'Describe the category...'}
                  rows={2}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </div>

              <div className="space-y-2">
                <Label>
                  {language === 'he' ? 'צבע' : language === 'ru' ? 'Цвет' : language === 'es' ? 'Color' : language === 'fr' ? 'Couleur' : language === 'de' ? 'Farbe' : language === 'it' ? 'Colore' : 'Color'}
                </Label>
                <div className="flex gap-2">
                  {colorOptions.map(c => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setEditingCategory({ ...editingCategory, color: c.value })}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        editingCategory.color === c.value ? 'border-gray-900 scale-110' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>
                  {language === 'he' ? 'מספר ימים מקסימלי לבחירה' : language === 'ru' ? 'Макс. дней' : language === 'es' ? 'Máx. días' : language === 'fr' ? 'Jours max' : language === 'de' ? 'Max. Tage' : language === 'it' ? 'Giorni max' : 'Max Selectable Days'}
                </Label>
                <Input
                  type="number"
                  min={1}
                  value={editingCategory.max_selectable_days || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, max_selectable_days: e.target.value ? parseInt(e.target.value) : null })}
                  placeholder={language === 'he' ? 'לדוגמה: 8' : 'e.g., 8'}
                />
                <p className="text-xs text-gray-500">
                  {language === 'he' ? 'השאר ריק אם אין מגבלה' : language === 'ru' ? 'Оставьте пусто без ограничений' : language === 'es' ? 'Dejar vacío sin límite' : language === 'fr' ? 'Laisser vide sans limite' : language === 'de' ? 'Leer lassen ohne Limit' : language === 'it' ? 'Lascia vuoto senza limite' : 'Leave empty for no limit'}
                </p>
              </div>

              <div className="space-y-2">
                <Label>
                  {language === 'he' ? 'דמי השתתפות למבוגר' : language === 'ru' ? 'Взнос за взрослого' : language === 'es' ? 'Tarifa por adulto' : language === 'fr' ? 'Frais par adulte' : language === 'de' ? 'Gebühr pro Erwachsener' : language === 'it' ? 'Tariffa per adulto' : 'Fee Per Adult'} ({currency})
                </Label>
                <Input
                  type="number"
                  min={0}
                  value={editingCategory.fee_per_adult || 0}
                  onChange={(e) => setEditingCategory({ ...editingCategory, fee_per_adult: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="space-y-1">
                  <Label className="text-sm font-semibold">
                    {language === 'he' ? 'דורש אישור מנהל' : language === 'ru' ? 'Требуется одобрение' : language === 'es' ? 'Requiere aprobación' : language === 'fr' ? 'Nécessite approbation' : language === 'de' ? 'Genehmigung erforderlich' : language === 'it' ? 'Richiede approvazione' : 'Requires Admin Approval'}
                  </Label>
                  <p className="text-xs text-gray-500">
                    {language === 'he' ? 'למשל לקבוצת "כל השביל"' : 'e.g., for "All Trail" group'}
                  </p>
                </div>
                <Switch
                  checked={editingCategory.requires_approval}
                  onCheckedChange={(checked) => setEditingCategory({ ...editingCategory, requires_approval: checked })}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowDialog(false);
                    setEditingCategory(null);
                  }}
                >
                  {language === 'he' ? 'ביטול' : language === 'ru' ? 'Отмена' : language === 'es' ? 'Cancelar' : language === 'fr' ? 'Annuler' : language === 'de' ? 'Abbrechen' : language === 'it' ? 'Annulla' : 'Cancel'}
                </Button>
                <Button
                  type="button"
                  onClick={saveCategory}
                  disabled={!editingCategory.name}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {language === 'he' ? 'שמור' : language === 'ru' ? 'Сохранить' : language === 'es' ? 'Guardar' : language === 'fr' ? 'Enregistrer' : language === 'de' ? 'Speichern' : language === 'it' ? 'Salva' : 'Save'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}