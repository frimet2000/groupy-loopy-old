import React, { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { base44 } from '@/api/base44Client';
import { toast } from "sonner";
import { 
  Backpack,
  Plus,
  Trash2,
  Check,
  AlertTriangle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function TripEquipment({ trip, isOrganizer, onUpdate }) {
  const { language } = useLanguage();
  const [equipmentDialog, setEquipmentDialog] = useState(false);
  const [newEquipmentItem, setNewEquipmentItem] = useState('');
  const [recommendedWater, setRecommendedWater] = useState(trip.recommended_water_liters || null);

  const equipmentChecklist = trip.equipment_checklist || [];

  useEffect(() => {
    setRecommendedWater(trip.recommended_water_liters || null);
  }, [trip.recommended_water_liters]);

  const popularEquipment = [
    { id: 'water', item_he: 'מים', item_en: 'Water' },
    { id: 'hat', item_he: 'כובע', item_en: 'Hat' },
    { id: 'sunscreen', item_he: 'קרם הגנה', item_en: 'Sunscreen' },
    { id: 'shoes', item_he: 'נעלי הליכה', item_en: 'Hiking Shoes' },
    { id: 'snacks', item_he: 'חטיפים', item_en: 'Snacks' },
    { id: 'firstaid', item_he: 'ערכת עזרה ראשונה', item_en: 'First Aid Kit' },
    { id: 'flashlight', item_he: 'פנס', item_en: 'Flashlight' },
    { id: 'map', item_he: 'מפה', item_en: 'Map' },
    { id: 'jacket', item_he: 'ג\'קט', item_en: 'Jacket' },
    { id: 'backpack', item_he: 'תיק גב', item_en: 'Backpack' },
  ];

  const allergensList = [
    { id: 'gluten', name_he: 'גלוטן', name_en: 'Gluten' },
    { id: 'dairy', name_he: 'חלב', name_en: 'Dairy' },
    { id: 'eggs', name_he: 'ביצים', name_en: 'Eggs' },
    { id: 'nuts', name_he: 'אגוזים', name_en: 'Nuts' },
    { id: 'peanuts', name_he: 'בוטנים', name_en: 'Peanuts' },
    { id: 'soy', name_he: 'סויה', name_en: 'Soy' },
    { id: 'fish', name_he: 'דגים', name_en: 'Fish' },
    { id: 'shellfish', name_he: 'פירות ים', name_en: 'Shellfish' },
    { id: 'sesame', name_he: 'שומשום', name_en: 'Sesame' },
  ];

  const handleAddPopularEquipment = async (popularItem) => {
    const itemName = language === 'he' ? popularItem.item_he : popularItem.item_en;
    
    if (equipmentChecklist.some(item => item.item === itemName)) {
      toast.error(language === 'he' ? 'הפריט כבר קיים' : language === 'ru' ? 'Элемент уже существует' : language === 'es' ? 'El elemento ya existe' : language === 'fr' ? 'L\'élément existe déjà' : language === 'de' ? 'Artikel existiert bereits' : language === 'it' ? 'L\'elemento esiste già' : 'Item already exists');
      return;
    }

    const updatedEquipment = [
      ...equipmentChecklist,
      {
        id: Date.now().toString(),
        item: itemName,
        checked: false,
        category: 'popular'
      }
    ];

    try {
      await base44.entities.Trip.update(trip.id, { equipment_checklist: updatedEquipment });
      onUpdate();
      toast.success(language === 'he' ? 'פריט נוסף' : language === 'ru' ? 'Элемент добавлен' : language === 'es' ? 'Elemento agregado' : language === 'fr' ? 'Élément ajouté' : language === 'de' ? 'Artikel hinzugefügt' : language === 'it' ? 'Elemento aggiunto' : 'Item added');
    } catch (error) {
      toast.error(language === 'he' ? 'שגיאה בהוספה' : language === 'ru' ? 'Ошибка добавления' : language === 'es' ? 'Error al agregar' : language === 'fr' ? 'Erreur d\'ajout' : language === 'de' ? 'Fehler beim Hinzufügen' : language === 'it' ? 'Errore nell\'aggiungere' : 'Error adding');
    }
  };

  const handleAddEquipment = async () => {
    if (!newEquipmentItem.trim()) {
      toast.error(language === 'he' ? 'נא למלא שם פריט' : language === 'ru' ? 'Пожалуйста, введите название предмета' : language === 'es' ? 'Por favor, ingresa nombre del elemento' : language === 'fr' ? 'Veuillez saisir le nom de l\'élément' : language === 'de' ? 'Bitte Artikelnamen eingeben' : language === 'it' ? 'Inserisci il nome dell\'elemento' : 'Please enter item name');
      return;
    }

    const updatedEquipment = [
      ...equipmentChecklist,
      {
        id: Date.now().toString(),
        item: newEquipmentItem,
        checked: false,
        category: 'custom'
      }
    ];

    try {
      await base44.entities.Trip.update(trip.id, { equipment_checklist: updatedEquipment });
      onUpdate();
      setNewEquipmentItem('');
      setEquipmentDialog(false);
      toast.success(language === 'he' ? 'פריט נוסף' : language === 'ru' ? 'Элемент добавлен' : language === 'es' ? 'Elemento agregado' : language === 'fr' ? 'Élément ajouté' : language === 'de' ? 'Artikel hinzugefügt' : language === 'it' ? 'Elemento aggiunto' : 'Item added');
    } catch (error) {
      toast.error(language === 'he' ? 'שגיאה בהוספה' : language === 'ru' ? 'Ошибка добавления' : language === 'es' ? 'Error al agregar' : language === 'fr' ? 'Erreur d\'ajout' : language === 'de' ? 'Fehler beim Hinzufügen' : language === 'it' ? 'Errore nell\'aggiungere' : 'Error adding');
    }
  };

  const handleToggleEquipment = async (itemId) => {
    const updatedEquipment = equipmentChecklist.map(item =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );

    try {
      await base44.entities.Trip.update(trip.id, { equipment_checklist: updatedEquipment });
      onUpdate();
    } catch (error) {
      toast.error(language === 'he' ? 'שגיאה בעדכון' : language === 'ru' ? 'Ошибка обновления' : language === 'es' ? 'Error al actualizar' : language === 'fr' ? 'Erreur de mise à jour' : language === 'de' ? 'Fehler beim Aktualisieren' : language === 'it' ? 'Errore nell\'aggiornare' : 'Error updating');
    }
  };

  const handleDeleteEquipment = async (itemId) => {
    const updatedEquipment = equipmentChecklist.filter(item => item.id !== itemId);

    try {
      await base44.entities.Trip.update(trip.id, { equipment_checklist: updatedEquipment });
      onUpdate();
      toast.success(language === 'he' ? 'פריט נמחק' : language === 'ru' ? 'Элемент удален' : language === 'es' ? 'Elemento eliminado' : language === 'fr' ? 'Élément supprimé' : language === 'de' ? 'Artikel gelöscht' : language === 'it' ? 'Elemento eliminato' : 'Item deleted');
    } catch (error) {
      toast.error(language === 'he' ? 'שגיאה במחיקה' : language === 'ru' ? 'Ошибка удаления' : language === 'es' ? 'Error al eliminar' : language === 'fr' ? 'Erreur de suppression' : language === 'de' ? 'Fehler beim Löschen' : language === 'it' ? 'Errore nell\'eliminare' : 'Error deleting');
    }
  };

  const handleToggleAllergen = async (allergenId) => {
    const currentAllergens = trip.allergens || [];
    const updatedAllergens = currentAllergens.includes(allergenId)
      ? currentAllergens.filter(id => id !== allergenId)
      : [...currentAllergens, allergenId];

    try {
      await base44.entities.Trip.update(trip.id, { allergens: updatedAllergens });
      onUpdate();
    } catch (error) {
      toast.error(language === 'he' ? 'שגיאה בעדכון' : language === 'ru' ? 'Ошибка обновления' : language === 'es' ? 'Error al actualizar' : language === 'fr' ? 'Erreur de mise à jour' : language === 'de' ? 'Fehler beim Aktualisieren' : language === 'it' ? 'Errore nell\'aggiornare' : 'Error updating');
    }
  };

  const handleWaterRecommendationChange = async (liters) => {
    setRecommendedWater(liters);
    try {
      await base44.entities.Trip.update(trip.id, { recommended_water_liters: liters });
      onUpdate();
      toast.success(language === 'he' ? 'המלצת מים עודכנה' : language === 'ru' ? 'Рекомендация воды обновлена' : language === 'es' ? 'Recomendación de agua actualizada' : language === 'fr' ? 'Recommandation d\'eau mise à jour' : language === 'de' ? 'Wasserempfehlung aktualisiert' : language === 'it' ? 'Raccomandazione acqua aggiornata' : 'Water recommendation updated');
    } catch (error) {
      toast.error(language === 'he' ? 'שגיאה בעדכון' : language === 'ru' ? 'Ошибка обновления' : language === 'es' ? 'Error al actualizar' : language === 'fr' ? 'Erreur de mise à jour' : language === 'de' ? 'Fehler beim Aktualisieren' : language === 'it' ? 'Errore nell\'aggiornare' : 'Error updating');
    }
  };

  return (
    <>
      <Card>
        <CardContent className="p-4 space-y-4">


          {/* Water Recommendation */}
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-lg">💧</span>
                </div>
                <p className="font-semibold text-blue-900">
                  {language === 'he' ? 'כמות מים מומלצת' : language === 'ru' ? 'Рекомендуемая вода' : language === 'es' ? 'Agua recomendada' : language === 'fr' ? 'Eau recommandée' : language === 'de' ? 'Empfohlenes Wasser' : language === 'it' ? 'Acqua consigliata' : 'Recommended Water'}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {[1, 1.5, 2, 3, 4].map(liters => {
                  const isSelected = recommendedWater === liters;
                  return (
                    <button
                      key={liters}
                      onClick={() => isOrganizer && handleWaterRecommendationChange(liters)}
                      disabled={!isOrganizer}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-md'
                          : isOrganizer 
                            ? 'bg-white text-blue-600 border border-blue-300 hover:bg-blue-100'
                            : 'bg-white text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {liters}L
                    </button>
                  );
                })}
              </div>
              {!isOrganizer && recommendedWater && (
                <p className="text-xs text-blue-700 mt-2">
                  {language === 'he' ? 'מומלץ ע"י המארגן' : language === 'ru' ? 'Рекомендовано организатором' : language === 'es' ? 'Recomendado por el organizador' : language === 'fr' ? 'Recommandé par l\'organisateur' : language === 'de' ? 'Vom Organisator empfohlen' : language === 'it' ? 'Raccomandato dall\'organizzatore' : 'Recommended by organizer'}
                </p>
              )}
            </CardContent>
          </Card>

          {isOrganizer && (
            <>
              {/* Popular Equipment */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  {language === 'he' ? 'פריטי ציוד נוספים' : language === 'ru' ? 'Дополнительное снаряжение' : language === 'es' ? 'Equipo adicional' : language === 'fr' ? 'Équipement supplémentaire' : language === 'de' ? 'Zusätzliche Ausrüstung' : language === 'it' ? 'Attrezzatura aggiuntiva' : 'Additional Equipment'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {popularEquipment.filter(item => item.id !== 'water').map((item) => {
                    const itemName = language === 'he' ? item.item_he : item.item_en;
                    const alreadyAdded = equipmentChecklist.some(e => e.item === itemName);
                    return (
                      <Button
                        key={item.id}
                        size="sm"
                        variant={alreadyAdded ? "secondary" : "outline"}
                        onClick={() => !alreadyAdded && handleAddPopularEquipment(item)}
                        disabled={alreadyAdded}
                        className="gap-1"
                      >
                        {alreadyAdded && <Check className="w-3 h-3" />}
                        {itemName}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <Button
                onClick={() => setEquipmentDialog(true)}
                className="w-full bg-purple-600 hover:bg-purple-700 gap-2"
                size="sm"
              >
                <Plus className="w-4 h-4" />
                {language === 'he' ? 'הוסף פריט מותאם אישית' : language === 'ru' ? 'Добавить свой элемент' : language === 'es' ? 'Agregar elemento personalizado' : language === 'fr' ? 'Ajouter élément personnalisé' : language === 'de' ? 'Benutzerdefinierten Artikel hinzufügen' : language === 'it' ? 'Aggiungi elemento personalizzato' : 'Add Custom Item'}
              </Button>
            </>
          )}

          {/* Allergens Section */}
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <p className="font-semibold text-orange-900">
                  {language === 'he' ? 'אלרגנים במזון' : language === 'ru' ? 'Пищевые аллергены' : language === 'es' ? 'Alérgenos alimentarios' : language === 'fr' ? 'Allergènes alimentaires' : language === 'de' ? 'Lebensmittelallergene' : language === 'it' ? 'Allergeni alimentari' : 'Food Allergens'}
                </p>
              </div>
              <p className="text-xs text-orange-700 mb-3">
                {language === 'he' 
                  ? 'סמן אלרגנים שיש להימנע מהם בטיול'
                  : language === 'ru' ? 'Отметьте аллергены, которых следует избегать во время поездки'
                  : language === 'es' ? 'Marca los alérgenos que se deben evitar durante el viaje'
                  : language === 'fr' ? 'Marquez les allergènes à éviter pendant le voyage'
                  : language === 'de' ? 'Markieren Sie Allergene, die während der Reise vermieden werden sollten'
                  : language === 'it' ? 'Marca gli allergeni da evitare durante il viaggio'
                  : 'Mark allergens to avoid during the trip'}
              </p>
              <div className="flex flex-wrap gap-2">
                {allergensList.map((allergen) => {
                  const allergenName = language === 'he' ? allergen.name_he : allergen.name_en;
                  const isSelected = (trip.allergens || []).includes(allergen.id);
                  return (
                    <button
                      key={allergen.id}
                      onClick={() => handleToggleAllergen(allergen.id)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-all ${
                        isSelected
                          ? 'bg-orange-600 text-white'
                          : 'bg-white text-gray-700 border border-orange-300 hover:border-orange-500'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                      {allergenName}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>


        </CardContent>
      </Card>

      {/* Add Equipment Dialog */}
      <Dialog open={equipmentDialog} onOpenChange={setEquipmentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {language === 'he' ? 'הוסף פריט ציוד' : language === 'ru' ? 'Добавить снаряжение' : language === 'es' ? 'Agregar elemento de equipo' : language === 'fr' ? 'Ajouter élément d\'équipement' : language === 'de' ? 'Ausrüstungsgegenstand hinzufügen' : language === 'it' ? 'Aggiungi elemento attrezzatura' : 'Add Equipment Item'}
            </DialogTitle>
            <DialogDescription>
              {language === 'he' 
                ? 'הוסף פריט לרשימת הציוד המומלצת לטיול'
                : language === 'ru' ? 'Добавьте элемент в рекомендуемый список снаряжения'
                : language === 'es' ? 'Agrega un elemento a la lista de equipo recomendado'
                : language === 'fr' ? 'Ajoutez un élément à la liste d\'équipement recommandée'
                : language === 'de' ? 'Fügen Sie einen Artikel zur empfohlenen Ausrüstungsliste hinzu'
                : language === 'it' ? 'Aggiungi un elemento alla lista attrezzatura consigliata'
                : 'Add an item to the recommended equipment list'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'he' ? 'שם הפריט' : language === 'ru' ? 'Название предмета' : language === 'es' ? 'Nombre del elemento' : language === 'fr' ? 'Nom de l\'élément' : language === 'de' ? 'Artikelname' : language === 'it' ? 'Nome dell\'elemento' : 'Item Name'}
              </label>
              <Input
                value={newEquipmentItem}
                onChange={(e) => setNewEquipmentItem(e.target.value)}
                placeholder={language === 'he' ? 'כובע, מים, נעליים...' : language === 'ru' ? 'Шляпа, вода, обувь...' : language === 'es' ? 'Sombrero, agua, zapatos...' : language === 'fr' ? 'Chapeau, eau, chaussures...' : language === 'de' ? 'Hut, Wasser, Schuhe...' : language === 'it' ? 'Cappello, acqua, scarpe...' : 'Hat, water, shoes...'}
                dir={language === 'he' ? 'rtl' : 'ltr'}
                onKeyPress={(e) => e.key === 'Enter' && handleAddEquipment()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEquipmentDialog(false)}>
              {language === 'he' ? 'ביטול' : language === 'ru' ? 'Отмена' : language === 'es' ? 'Cancelar' : language === 'fr' ? 'Annuler' : language === 'de' ? 'Abbrechen' : language === 'it' ? 'Annulla' : 'Cancel'}
            </Button>
            <Button onClick={handleAddEquipment} className="bg-purple-600 hover:bg-purple-700">
              {language === 'he' ? 'הוסף' : language === 'ru' ? 'Добавить' : language === 'es' ? 'Agregar' : language === 'fr' ? 'Ajouter' : language === 'de' ? 'Hinzufügen' : language === 'it' ? 'Aggiungi' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}