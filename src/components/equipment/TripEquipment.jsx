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
      toast.error(language === 'he' ? 'הפריט כבר קיים' : 'Item already exists');
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
      toast.success(language === 'he' ? 'פריט נוסף' : 'Item added');
    } catch (error) {
      toast.error(language === 'he' ? 'שגיאה בהוספה' : 'Error adding');
    }
  };

  const handleAddEquipment = async () => {
    if (!newEquipmentItem.trim()) {
      toast.error(language === 'he' ? 'נא למלא שם פריט' : 'Please enter item name');
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
      toast.success(language === 'he' ? 'פריט נוסף' : 'Item added');
    } catch (error) {
      toast.error(language === 'he' ? 'שגיאה בהוספה' : 'Error adding');
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
      toast.error(language === 'he' ? 'שגיאה בעדכון' : 'Error updating');
    }
  };

  const handleDeleteEquipment = async (itemId) => {
    const updatedEquipment = equipmentChecklist.filter(item => item.id !== itemId);

    try {
      await base44.entities.Trip.update(trip.id, { equipment_checklist: updatedEquipment });
      onUpdate();
      toast.success(language === 'he' ? 'פריט נמחק' : 'Item deleted');
    } catch (error) {
      toast.error(language === 'he' ? 'שגיאה במחיקה' : 'Error deleting');
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
      toast.error(language === 'he' ? 'שגיאה בעדכון' : 'Error updating');
    }
  };

  const handleWaterRecommendationChange = async (liters) => {
    setRecommendedWater(liters);
    try {
      await base44.entities.Trip.update(trip.id, { recommended_water_liters: liters });
      onUpdate();
      toast.success(language === 'he' ? 'המלצת מים עודכנה' : 'Water recommendation updated');
    } catch (error) {
      toast.error(language === 'he' ? 'שגיאה בעדכון' : 'Error updating');
    }
  };

  return (
    <>
      <Card>
        <CardContent className="p-4 space-y-4">


          {/* Water Recommendation */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
              💧 {language === 'he' ? 'כמות מים מומלצת' : 'Recommended Water'}
            </p>
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
                          ? 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {liters}L
                  </button>
                );
              })}
            </div>
          </div>

          {isOrganizer && (
            <>
              {/* Popular Equipment */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  {language === 'he' ? 'פריטי ציוד נוספים' : 'Additional Equipment'}
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
                {language === 'he' ? 'הוסף פריט מותאם אישית' : 'Add Custom Item'}
              </Button>
            </>
          )}

          {/* Allergens Section */}
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <p className="font-semibold text-orange-900">
                  {language === 'he' ? 'אלרגנים במזון' : 'Food Allergens'}
                </p>
              </div>
              <p className="text-xs text-orange-700 mb-3">
                {language === 'he' 
                  ? 'סמן אלרגנים שיש להימנע מהם בטיול'
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

          <ScrollArea className="h-[400px]">
            {equipmentChecklist.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Backpack className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-gray-500">
                  {language === 'he' 
                    ? 'אין פריטי ציוד עדיין'
                    : 'No equipment items yet'}
                </p>
                {isOrganizer && (
                  <p className="text-xs text-gray-400 mt-2">
                    {language === 'he' 
                      ? 'בחר פריטים מהרשימה למעלה'
                      : 'Select items from the list above'}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {equipmentChecklist.map((item) => (
                  <div key={item.id} className="bg-purple-50/50 rounded-lg border border-purple-100 hover:bg-purple-50 transition-colors">
                    <div className="flex items-center gap-3 p-3">
                      <button
                        onClick={() => handleToggleEquipment(item.id)}
                        className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                          item.checked 
                            ? 'bg-purple-600 border-purple-600' 
                            : 'border-purple-300 hover:border-purple-400'
                        }`}
                      >
                        {item.checked && <Check className="w-4 h-4 text-white" />}
                      </button>

                      <span className={`flex-1 ${item.checked ? 'line-through text-gray-500' : 'text-gray-900'}`} dir={language === 'he' ? 'rtl' : 'ltr'}>
                        {item.item}
                      </span>

                      {isOrganizer && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteEquipment(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Add Equipment Dialog */}
      <Dialog open={equipmentDialog} onOpenChange={setEquipmentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {language === 'he' ? 'הוסף פריט ציוד' : 'Add Equipment Item'}
            </DialogTitle>
            <DialogDescription>
              {language === 'he' 
                ? 'הוסף פריט לרשימת הציוד המומלצת לטיול'
                : 'Add an item to the recommended equipment list'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'he' ? 'שם הפריט' : 'Item Name'}
              </label>
              <Input
                value={newEquipmentItem}
                onChange={(e) => setNewEquipmentItem(e.target.value)}
                placeholder={language === 'he' ? 'כובע, מים, נעליים...' : 'Hat, water, shoes...'}
                dir={language === 'he' ? 'rtl' : 'ltr'}
                onKeyPress={(e) => e.key === 'Enter' && handleAddEquipment()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEquipmentDialog(false)}>
              {language === 'he' ? 'ביטול' : 'Cancel'}
            </Button>
            <Button onClick={handleAddEquipment} className="bg-purple-600 hover:bg-purple-700">
              {language === 'he' ? 'הוסף' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}