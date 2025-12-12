import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../LanguageContext';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { base44 } from '@/api/base44Client';
import { toast } from "sonner";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { 
  Route, 
  MapPin, 
  Plus, 
  Edit, 
  Trash2,
  Navigation,
  Backpack,
  Check,
  ExternalLink,
  AlertTriangle,
  X
} from 'lucide-react';

// Fix Leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Component for adding waypoints by clicking on map
function MapClickHandler({ isOrganizer, onMapClick }) {
  useMapEvents({
    click: (e) => {
      if (isOrganizer) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

export default function MapSidebar({ trip, isOrganizer, onUpdate }) {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('trail');
  const [waterLiters, setWaterLiters] = useState({});
  const [editDialog, setEditDialog] = useState(false);
  const [editingWaypoint, setEditingWaypoint] = useState(null);
  const [waypointForm, setWaypointForm] = useState({ name: '', description: '', latitude: 0, longitude: 0 });
  const [equipmentDialog, setEquipmentDialog] = useState(false);
  const [newEquipmentItem, setNewEquipmentItem] = useState('');
  const [recommendedWater, setRecommendedWater] = useState(trip.recommended_water_liters || null);
  const [showMap, setShowMap] = useState(false);

  const center = [trip.latitude || 31.5, trip.longitude || 34.75];
  const waypoints = trip.waypoints || [];
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

  useEffect(() => {
    // Initialize and update water liters from equipment checklist
    const litersMap = {};
    equipmentChecklist.forEach(item => {
      if (item.water_liters) {
        litersMap[item.id] = item.water_liters;
      }
    });
    setWaterLiters(litersMap);
  }, [equipmentChecklist]);



  const handleMapClick = (lat, lng) => {
    setEditingWaypoint(null);
    setWaypointForm({ 
      name: '', 
      description: '', 
      latitude: lat, 
      longitude: lng 
    });
    setEditDialog(true);
  };

  const handleAddWaypoint = () => {
    setEditingWaypoint(null);
    setWaypointForm({ 
      name: '', 
      description: '', 
      latitude: trip.latitude || 31.5, 
      longitude: trip.longitude || 34.75 
    });
    setEditDialog(true);
  };

  const handleEditWaypoint = (waypoint) => {
    setEditingWaypoint(waypoint);
    setWaypointForm({
      name: waypoint.name,
      description: waypoint.description || '',
      latitude: waypoint.latitude,
      longitude: waypoint.longitude
    });
    setEditDialog(true);
  };

  const handleSaveWaypoint = async () => {
    if (!waypointForm.name) {
      toast.error(language === 'he' ? 'נא למלא שם' : 'Please enter name');
      return;
    }

    const updatedWaypoints = [...waypoints];
    if (editingWaypoint) {
      const index = waypoints.findIndex(w => w.id === editingWaypoint.id);
      updatedWaypoints[index] = { ...editingWaypoint, ...waypointForm };
    } else {
      updatedWaypoints.push({
        id: Date.now().toString(),
        ...waypointForm,
        order: waypoints.length
      });
    }

    try {
      await base44.entities.Trip.update(trip.id, { waypoints: updatedWaypoints });
      onUpdate();
      setEditDialog(false);
      toast.success(language === 'he' ? 'נקודת ציון נשמרה' : 'Waypoint saved');
    } catch (error) {
      toast.error(language === 'he' ? 'שגיאה בשמירה' : 'Error saving');
    }
  };

  const handleDeleteWaypoint = async (waypointId) => {
    const updatedWaypoints = waypoints.filter(w => w.id !== waypointId);
    try {
      await base44.entities.Trip.update(trip.id, { waypoints: updatedWaypoints });
      onUpdate();
      toast.success(language === 'he' ? 'נקודת ציון נמחקה' : 'Waypoint deleted');
    } catch (error) {
      toast.error(language === 'he' ? 'שגיאה במחיקה' : 'Error deleting');
    }
  };

  const trailPath = waypoints
    .sort((a, b) => a.order - b.order)
    .map(w => [w.latitude, w.longitude]);

  const handleAddPopularEquipment = async (popularItem) => {
    const itemName = language === 'he' ? popularItem.item_he : popularItem.item_en;
    
    // Check if already exists
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

  const handleWaterLitersChange = async (itemId, liters) => {
    setWaterLiters({ ...waterLiters, [itemId]: liters });
    
    const updatedEquipment = equipmentChecklist.map(item =>
      item.id === itemId ? { ...item, water_liters: liters } : item
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
      <Card className="border-0 shadow-lg overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl" className="h-full">
          <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-purple-500 to-purple-600 p-1.5 m-0">
            <TabsTrigger value="trail" className="data-[state=active]:bg-white data-[state=active]:text-purple-700 text-white/90 font-semibold gap-2 rounded-md">
              <Route className="w-5 h-5" />
              {language === 'he' ? 'מסלול' : 'Trail'}
            </TabsTrigger>
            <TabsTrigger value="equipment" className="data-[state=active]:bg-white data-[state=active]:text-purple-700 text-white/90 font-semibold gap-2 rounded-md">
              <Backpack className="w-5 h-5" />
              {language === 'he' ? 'ציוד' : 'Equipment'}
            </TabsTrigger>
          </TabsList>

          {/* Trail Map */}
          <TabsContent value="trail" className="p-0 m-0">
            <CardContent className="p-4 space-y-4">
              {/* Interactive Map Section */}
              {showMap ? (
                <Card className="overflow-hidden border-2 border-emerald-200">
                  <div className="relative">
                    <div className="h-[400px] w-full">
                      <MapContainer
                        center={[trip.latitude || 31.5, trip.longitude || 34.75]}
                        zoom={13}
                        style={{ height: '100%', width: '100%' }}
                      >
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        
                        {/* Starting point marker */}
                        <Marker position={[trip.latitude || 31.5, trip.longitude || 34.75]}>
                          <Popup>
                            <div className="text-center">
                              <p className="font-bold text-emerald-700">
                                {language === 'he' ? 'נקודת התחלה' : 'Starting Point'}
                              </p>
                              <p className="text-sm">{trip.location}</p>
                            </div>
                          </Popup>
                        </Marker>

                        {/* Waypoint markers */}
                        {waypoints.sort((a, b) => a.order - b.order).map((waypoint, index) => (
                          <Marker key={waypoint.id} position={[waypoint.latitude, waypoint.longitude]}>
                            <Popup>
                              <div className="text-center">
                                <p className="font-bold">{index + 1}. {waypoint.name}</p>
                                {waypoint.description && (
                                  <p className="text-xs text-gray-600 mt-1">{waypoint.description}</p>
                                )}
                              </div>
                            </Popup>
                          </Marker>
                        ))}

                        {/* Trail path */}
                        {waypoints.length > 0 && (
                          <Polyline
                            positions={[
                              [trip.latitude || 31.5, trip.longitude || 34.75],
                              ...waypoints.sort((a, b) => a.order - b.order).map(w => [w.latitude, w.longitude])
                            ]}
                            color="#10b981"
                            weight={3}
                            opacity={0.7}
                          />
                        )}

                        {/* Click handler for adding waypoints */}
                        <MapClickHandler isOrganizer={isOrganizer} onMapClick={handleMapClick} />
                      </MapContainer>
                    </div>
                    
                    {/* Map instructions overlay */}
                    {isOrganizer && (
                      <div className="absolute top-2 left-2 right-2 bg-emerald-600 text-white px-3 py-2 rounded-lg shadow-lg text-xs font-medium z-[1000]">
                        <div className="flex items-center justify-between">
                          <span>
                            {language === 'he' 
                              ? '💡 לחץ על המפה להוספת נקודת ציון' 
                              : '💡 Click on map to add waypoint'}
                          </span>
                          <button
                            onClick={() => setShowMap(false)}
                            className="bg-white/20 hover:bg-white/30 rounded p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ) : (
                <Button
                  onClick={() => setShowMap(true)}
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 gap-2 shadow-lg"
                  size="lg"
                >
                  <MapPin className="w-5 h-5" />
                  {language === 'he' ? 'הצג מפה אינטראקטיבית' : 'Show Interactive Map'}
                </Button>
              )}

              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {waypoints.sort((a, b) => a.order - b.order).map((waypoint, index) => (
                    <div key={waypoint.id} className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg">
                      <Badge className="bg-emerald-600">{index + 1}</Badge>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{waypoint.name}</p>
                        {waypoint.description && (
                          <p className="text-xs text-gray-600">{waypoint.description}</p>
                        )}
                      </div>
                      {isOrganizer && (
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => handleEditWaypoint(waypoint)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteWaypoint(waypoint.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {waypoints.length > 0 && (
                <a
                  href={(() => {
                    const origin = `${trip.latitude},${trip.longitude}`;
                    const sortedWaypoints = waypoints.sort((a, b) => a.order - b.order);
                    const lastWaypoint = sortedWaypoints[sortedWaypoints.length - 1];
                    const destination = `${lastWaypoint.latitude},${lastWaypoint.longitude}`;
                    const waypointsParam = sortedWaypoints.slice(0, -1)
                      .map(w => `${w.latitude},${w.longitude}`)
                      .join('|');
                    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${waypointsParam ? `&waypoints=${waypointsParam}` : ''}&travelmode=walking`;
                  })()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 gap-2 shadow-lg" size="lg">
                    <Navigation className="w-5 h-5" />
                    {language === 'he' ? 'נווט עם כל נקודות הציון בגוגל מפות' : 'Navigate Full Route in Google Maps'}
                  </Button>
                </a>
              )}
            </CardContent>
          </TabsContent>

          {/* Equipment Checklist */}
          <TabsContent value="equipment" className="p-0 m-0">
            <CardContent className="p-4 space-y-4">
              {/* Water Recommendation Section - Prominent */}
              <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 border-0 shadow-xl">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-2xl">💧</span>
                    </div>
                    <div>
                      <p className="font-bold text-white text-lg">
                        {language === 'he' ? 'כמות מים מומלצת' : 'Recommended Water'}
                      </p>
                      <p className="text-xs text-white/80">
                        {language === 'he' ? 'להביא לטיול' : 'Bring for the trip'}
                      </p>
                    </div>
                  </div>

                  {isOrganizer ? (
                    <div className="space-y-3">
                      <p className="text-sm text-white/90 font-medium">
                        {language === 'he' ? 'בחר כמה ליטרים להמליץ:' : 'Select liters to recommend:'}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {[1, 1.5, 2, 3, 4].map(liters => (
                          <button
                            key={liters}
                            onClick={() => handleWaterRecommendationChange(liters)}
                            className={`px-4 py-2.5 rounded-lg text-base font-bold transition-all ${
                              recommendedWater === liters
                                ? 'bg-white text-blue-600 shadow-lg scale-105'
                                : 'bg-white/20 text-white border-2 border-white/30 hover:bg-white/30 hover:scale-105'
                            }`}
                          >
                            {liters}L
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-2">
                      {recommendedWater ? (
                        <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                          <p className="text-4xl font-bold text-white mb-1">{recommendedWater}L</p>
                          <p className="text-sm text-white/90">
                            {language === 'he' ? 'מומלץ ע"י המארגן' : 'Recommended by organizer'}
                          </p>
                        </div>
                      ) : (
                        <p className="text-white/80 text-sm italic">
                          {language === 'he' ? 'המארגן טרם הגדיר המלצה' : 'No recommendation set yet'}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

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

                          <span className={`flex-1 ${item.checked ? 'line-through text-gray-500' : 'text-gray-900'}`}>
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
          </TabsContent>
        </Tabs>
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

      {/* Edit Waypoint Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingWaypoint 
                ? (language === 'he' ? 'ערוך נקודת ציון' : 'Edit Waypoint')
                : (language === 'he' ? 'הוסף נקודת ציון' : 'Add Waypoint')}
            </DialogTitle>
            <DialogDescription>
              {language === 'he' 
                ? 'הוסף נקודת עניין במסלול הטיול'
                : 'Add a point of interest along the trail'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'he' ? 'שם' : 'Name'}
              </label>
              <Input
                value={waypointForm.name}
                onChange={(e) => setWaypointForm({ ...waypointForm, name: e.target.value })}
                placeholder={language === 'he' ? 'נקודת תצפית, מעיין, וכו׳' : 'Viewpoint, spring, etc.'}
                dir={language === 'he' ? 'rtl' : 'ltr'}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'he' ? 'תיאור' : 'Description'}
              </label>
              <Textarea
                value={waypointForm.description}
                onChange={(e) => setWaypointForm({ ...waypointForm, description: e.target.value })}
                placeholder={language === 'he' ? 'תיאור קצר' : 'Brief description'}
                dir={language === 'he' ? 'rtl' : 'ltr'}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Latitude</label>
                <Input
                  type="number"
                  step="0.000001"
                  value={waypointForm.latitude}
                  onChange={(e) => setWaypointForm({ ...waypointForm, latitude: parseFloat(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Longitude</label>
                <Input
                  type="number"
                  step="0.000001"
                  value={waypointForm.longitude}
                  onChange={(e) => setWaypointForm({ ...waypointForm, longitude: parseFloat(e.target.value) })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(false)}>
              {language === 'he' ? 'ביטול' : 'Cancel'}
            </Button>
            <Button onClick={handleSaveWaypoint} className="bg-emerald-600 hover:bg-emerald-700">
              {language === 'he' ? 'שמור' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}