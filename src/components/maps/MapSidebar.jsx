import React, { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { base44 } from '@/api/base44Client';
import { toast } from "sonner";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { 
  MapPin, 
  Edit, 
  Trash2,
  Navigation,
  X,
  Loader2
} from 'lucide-react';
import { Switch } from "@/components/ui/switch";

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
  const [editDialog, setEditDialog] = useState(false);
  const [editingWaypoint, setEditingWaypoint] = useState(null);
  const [waypointForm, setWaypointForm] = useState({ name: '', description: '', latitude: 0, longitude: 0 });
  const [showMap, setShowMap] = useState(true);
  const [waymarkedVisible, setWaymarkedVisible] = useState(true);
  const [osrmRoute, setOsrmRoute] = useState(null);
  const [osrmLoading, setOsrmLoading] = useState(false);
  const lastOsrmKeyRef = React.useRef(null);
  const [leafletMap, setLeafletMap] = useState(null);

  const waypoints = trip.waypoints || [];

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

  // OSRM Multi-Stop Routing
  const fetchRoute = async (points) => {
    if (points.length < 2) {
      setOsrmRoute(null);
      return;
    }

    setOsrmLoading(true);
    const coords = points.map(p => `${p.lng},${p.lat}`).join(';');
    const url = `https://router.project-osrm.org/route/v1/foot/${coords}?overview=full&geometries=geojson`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.code === 'Ok' && data.routes.length > 0) {
        const route = data.routes[0];
        const result = {
          distance: (route.distance / 1000).toFixed(2),
          geometry: route.geometry,
          duration: Math.round(route.duration / 60)
        };
        setOsrmRoute(result);

        if (leafletMap) {
          const coords = result.geometry.coordinates;
          const latlngs = coords.map(([lng, lat]) => [lat, lng]);
          const bounds = L.latLngBounds(latlngs);
          leafletMap.fitBounds(bounds, { padding: [20, 20] });
        }
      } else {
        console.warn("OSRM couldn't find a path on trails");
        setOsrmRoute({
          distance: null,
          duration: null,
          geometry: {
            type: 'LineString',
            coordinates: points.map(p => [p.lng, p.lat])
          },
          isFallback: true
        });
      }
    } catch (error) {
      console.error("Route error:", error);
      setOsrmRoute({
        distance: null,
        duration: null,
        geometry: {
          type: 'LineString',
          coordinates: points.map(p => [p.lng, p.lat])
        },
        isFallback: true
      });
    } finally {
      setOsrmLoading(false);
    }
  };

  React.useEffect(() => {
    const allPoints = [];
    if (trip.latitude && trip.longitude) allPoints.push({ lat: trip.latitude, lng: trip.longitude });
    const sorted = [...waypoints].sort((a, b) => a.order - b.order);
    sorted.forEach(w => allPoints.push({ lat: w.latitude, lng: w.longitude }));

    if (allPoints.length < 2) {
      setOsrmRoute(null);
      lastOsrmKeyRef.current = null;
      return;
    }

    const key = allPoints.map(p => `${p.lat.toFixed(6)},${p.lng.toFixed(6)}`).join(';');
    if (lastOsrmKeyRef.current === key) return;
    
    lastOsrmKeyRef.current = key;
    fetchRoute(allPoints);
  }, [waypoints, trip.latitude, trip.longitude, leafletMap]);

  return (
    <>
      <Card className="border-0 shadow-lg overflow-hidden">
        <CardContent className="p-4 space-y-4">
          {/* Interactive Map Section */}
          <Card className="overflow-hidden border-2 border-emerald-200">
            <div className="p-2 border-b bg-gray-50 flex items-center gap-2 justify-between">
              <div className="flex items-center gap-2">
                <Switch checked={waymarkedVisible} onCheckedChange={setWaymarkedVisible} />
                <span className="text-xs text-gray-700">
                  {language === 'he' ? 'שבילי Waymarked' : 'Waymarked Trails'}
                </span>
              </div>
            </div>
            <div className="relative">
              <div className="h-[400px] w-full">
                <MapContainer
                    center={[trip.latitude || 31.5, trip.longitude || 34.75]}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                    whenCreated={setLeafletMap}
                    zoomControl={false}
                  >
                    <ZoomControl position="bottomright" />
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      maxZoom={19}
                    />
                    {waymarkedVisible && (
                      <>
                        <TileLayer
                          attribution='&copy; Waymarked Trails - Hiking'
                          url="https://tile.waymarkedtrails.org/hiking/{z}/{x}/{y}.png"
                          opacity={0.6}
                          zIndex={1000}
                        />
                        <TileLayer
                          attribution='&copy; Waymarked Trails - Cycling'
                          url="https://tile.waymarkedtrails.org/cycling/{z}/{x}/{y}.png"
                          opacity={0.4}
                          zIndex={1001}
                        />
                      </>
                    )}
                    
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

                    {/* Trek day waypoints */}
                    {trip.activity_type === 'trek' && trip.trek_days?.length > 0 && (
                      trip.trek_days
                        .sort((a, b) => a.day_number - b.day_number)
                        .map((day, dIndex) => (day.waypoints || []).map((wp, wpIndex) => {
                          const getDayDate = () => {
                            if (day.date) return new Date(day.date);
                            if (trip.date && day.day_number) {
                              const date = new Date(trip.date);
                              date.setDate(date.getDate() + (day.day_number - 1));
                              return date;
                            }
                            return null;
                          };
                          const dayDate = getDayDate();
                          return (
                            <Marker key={`trek-${dIndex}-${wpIndex}`} position={[wp.latitude, wp.longitude]}>
                              <Popup>
                                <div className="text-center">
                                  <p className="font-bold">
                                    {language === 'he' ? `יום ${day.day_number}` : `Day ${day.day_number}`}: {day.daily_title}
                                  </p>
                                  {dayDate && (
                                    <>
                                      <p className="text-xs text-gray-600 mt-1">
                                        {dayDate.toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US', { weekday: 'short' })}
                                      </p>
                                      <p className="text-xs text-gray-600">
                                        {dayDate.toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US', { day: 'numeric', month: 'numeric' })}
                                      </p>
                                    </>
                                  )}
                                </div>
                              </Popup>
                            </Marker>
                          );
                        }))
                    )}

                    {/* Trail path - only show if no OSRM route */}
                    {!osrmRoute && waypoints.length > 0 && (
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

                    {/* OSRM Route */}
                    {osrmRoute?.geometry && (
                      <Polyline
                        positions={osrmRoute.geometry.coordinates.map(([lng, lat]) => [lat, lng])}
                        color="#2563eb"
                        weight={4}
                        opacity={0.9}
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
                    </div>
                  </div>
                )}
              </div>
            </Card>

          {/* OSRM Route Stats */}
          {osrmRoute && osrmRoute.distance && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-sm font-semibold text-blue-800">
                {language === 'he' ? 'מסלול הליכה' : 'Walking Route'}
              </div>
              <div className="text-sm text-blue-700 flex gap-4 mt-1">
                <span>{language === 'he' ? 'מרחק:' : 'Distance:'} {osrmRoute.distance} {language === 'he' ? 'ק"מ' : 'km'}</span>
                <span>{language === 'he' ? 'זמן משוער:' : 'Estimated Time:'} {osrmRoute.duration} {language === 'he' ? 'דק׳' : 'min'}</span>
              </div>
            </div>
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
                const sortedWaypoints = waypoints.sort((a, b) => a.order - b.order);
                const baseUrl = 'https://www.google.com/maps/dir/';
                const points = [
                  `${trip.latitude},${trip.longitude}`,
                  ...sortedWaypoints.map(w => `${w.latitude},${w.longitude}`)
                ];
                return baseUrl + points.join('/') + '/@' + points[0] + ',13z';
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
      </Card>

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