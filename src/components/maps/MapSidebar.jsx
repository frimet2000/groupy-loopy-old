import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
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
import { 
  Route, 
  Coffee, 
  Mountain, 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  Loader2,
  Eye,
  Utensils,
  Navigation,
  Backpack,
  Check
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function MapSidebar({ trip, isOrganizer, onUpdate }) {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('trail');
  const [nearbyRestaurants, setNearbyRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [editingWaypoint, setEditingWaypoint] = useState(null);
  const [waypointForm, setWaypointForm] = useState({ name: '', description: '', latitude: 0, longitude: 0 });
  const [equipmentDialog, setEquipmentDialog] = useState(false);
  const [newEquipmentItem, setNewEquipmentItem] = useState('');

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

  useEffect(() => {
    if (activeTab === 'restaurants') {
      fetchNearbyPlaces();
    }
  }, [activeTab, trip.latitude, trip.longitude]);

  const fetchNearbyPlaces = async () => {
    if (!trip.latitude || !trip.longitude) return;
    setLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: language === 'he'
          ? `מצא מסעדות, בתי קפה ועגלות קפה באזור ${trip.location} (קואורדינטות: ${trip.latitude}, ${trip.longitude}). כלול שם, תיאור קצר, וקואורדינטות משוערות.`
          : `Find restaurants, cafes, and coffee carts near ${trip.location} (coordinates: ${trip.latitude}, ${trip.longitude}). Include name, brief description, and approximate coordinates.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            places: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  latitude: { type: "number" },
                  longitude: { type: "number" },
                  type: { type: "string" }
                }
              }
            }
          }
        }
      });
      setNearbyRestaurants(result.places || []);
    } catch (error) {
      console.error('Error fetching places:', error);
    }
    setLoading(false);
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

  return (
    <>
      <Card className="border-0 shadow-lg">
        <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl" className="h-full">
          <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-emerald-50 to-blue-50 p-1 m-0">
            <TabsTrigger value="trail" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white gap-2">
              <Route className="w-4 h-4" />
              {language === 'he' ? 'מסלול' : 'Trail'}
            </TabsTrigger>
            <TabsTrigger value="restaurants" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white gap-2">
              <Coffee className="w-4 h-4" />
              {language === 'he' ? 'מזון' : 'Food'}
            </TabsTrigger>
            <TabsTrigger value="equipment" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white gap-2">
              <Backpack className="w-4 h-4" />
              {language === 'he' ? 'ציוד' : 'Equipment'}
            </TabsTrigger>
          </TabsList>

          {/* Trail Map */}
          <TabsContent value="trail" className="p-0 m-0">
            <CardContent className="p-4 space-y-4">
              {isOrganizer && (
                <Button
                  onClick={handleAddWaypoint}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 gap-2"
                  size="sm"
                >
                  <Plus className="w-4 h-4" />
                  {language === 'he' ? 'הוסף נקודת ציון' : 'Add Waypoint'}
                </Button>
              )}

              <div className="h-[400px] rounded-lg overflow-hidden border-2 border-emerald-200">
                <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  
                  {/* Start Point */}
                  <Marker position={center}>
                    <Popup>
                      <div className="text-center">
                        <p className="font-semibold">{language === 'he' ? 'נקודת התחלה' : 'Start'}</p>
                        <p className="text-sm">{trip.location}</p>
                      </div>
                    </Popup>
                  </Marker>

                  {/* Waypoints */}
                  {waypoints.map((waypoint, index) => (
                    <Marker key={waypoint.id} position={[waypoint.latitude, waypoint.longitude]}>
                      <Popup>
                        <div>
                          <p className="font-semibold">{waypoint.name}</p>
                          {waypoint.description && <p className="text-sm">{waypoint.description}</p>}
                        </div>
                      </Popup>
                    </Marker>
                  ))}

                  {/* Trail Path */}
                  {trailPath.length > 1 && (
                    <Polyline positions={trailPath} color="emerald" weight={4} opacity={0.7} />
                  )}
                </MapContainer>
              </div>

              <ScrollArea className="h-[200px]">
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
            </CardContent>
          </TabsContent>

          {/* Restaurants */}
          <TabsContent value="restaurants" className="p-0 m-0">
            <CardContent className="p-4 space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
                </div>
              ) : (
                <>
                  <div className="h-[300px] rounded-lg overflow-hidden border-2 border-amber-200">
                    <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      
                      {nearbyRestaurants.map((place, index) => (
                        <Marker key={index} position={[place.latitude, place.longitude]}>
                          <Popup>
                            <div>
                              <p className="font-semibold flex items-center gap-1">
                                {place.type === 'cafe' ? <Coffee className="w-4 h-4" /> : <Utensils className="w-4 h-4" />}
                                {place.name}
                              </p>
                              <p className="text-sm">{place.description}</p>
                            </div>
                          </Popup>
                        </Marker>
                      ))}
                    </MapContainer>
                  </div>

                  <ScrollArea className="h-[300px]">
                    <div className="space-y-3">
                      {nearbyRestaurants.map((place, index) => (
                        <Card key={index} className="border-amber-200 bg-amber-50/50">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center">
                                {place.type === 'cafe' ? (
                                  <Coffee className="w-5 h-5 text-white" />
                                ) : (
                                  <Utensils className="w-5 h-5 text-white" />
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900">{place.name}</p>
                                <p className="text-sm text-gray-600 mt-1">{place.description}</p>
                                <a
                                  href={`https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 mt-2"
                                >
                                  <Navigation className="w-3 h-3" />
                                  {language === 'he' ? 'נווט' : 'Navigate'}
                                </a>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </>
              )}
            </CardContent>
          </TabsContent>

          {/* Equipment Checklist */}
          <TabsContent value="equipment" className="p-0 m-0">
            <CardContent className="p-4 space-y-4">
              {isOrganizer && (
                <>
                  {/* Popular Equipment */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">
                      {language === 'he' ? 'פריטי ציוד פופולריים' : 'Popular Equipment'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {popularEquipment.map((item) => {
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

              <ScrollArea className="h-[500px]">
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
                      <div 
                        key={item.id} 
                        className="flex items-center gap-3 p-3 bg-purple-50/50 rounded-lg border border-purple-100 hover:bg-purple-50 transition-colors"
                      >
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