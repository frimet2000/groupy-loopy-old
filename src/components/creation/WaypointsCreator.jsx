import React, { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, Edit, Trash2, Navigation, X, Plus } from 'lucide-react';
import { toast } from "sonner";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => onMapClick(e.latlng.lat, e.latlng.lng),
  });
  return null;
}

export default function WaypointsCreator({ waypoints, setWaypoints, startLat, startLng, locationName }) {
  const { language } = useLanguage();
  const [showMap, setShowMap] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [waypointForm, setWaypointForm] = useState({ name: '', description: '', latitude: 0, longitude: 0 });

  const handleMapClick = (lat, lng) => {
    setEditingIndex(null);
    setWaypointForm({ name: '', description: '', latitude: lat, longitude: lng });
    setEditDialog(true);
  };

  const handleEditWaypoint = (waypoint, index) => {
    setEditingIndex(index);
    setWaypointForm(waypoint);
    setEditDialog(true);
  };

  const handleSaveWaypoint = () => {
    if (!waypointForm.name) {
      toast.error(language === 'he' ? 'נא למלא שם' : 'Please enter name');
      return;
    }

    const updated = [...waypoints];
    if (editingIndex !== null) {
      updated[editingIndex] = waypointForm;
    } else {
      updated.push({ ...waypointForm, order: waypoints.length });
    }

    setWaypoints(updated);
    setEditDialog(false);
    toast.success(language === 'he' ? 'נקודת ציון נשמרה' : 'Waypoint saved');
  };

  const handleDeleteWaypoint = (index) => {
    setWaypoints(waypoints.filter((_, i) => i !== index));
    toast.success(language === 'he' ? 'נקודת ציון נמחקה' : 'Waypoint deleted');
  };

  const googleMapsUrl = waypoints.length > 0 && startLat && startLng ? (() => {
    const origin = `${startLat},${startLng}`;
    const sorted = [...waypoints].sort((a, b) => a.order - b.order);
    const destination = `${sorted[sorted.length - 1].latitude},${sorted[sorted.length - 1].longitude}`;
    const waypointsParam = sorted.slice(0, -1).map(w => `${w.latitude},${w.longitude}`).join('|');
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${waypointsParam ? `&waypoints=${waypointsParam}` : ''}&travelmode=walking`;
  })() : null;

  return (
    <>
      <Card className="border-2 border-purple-100 shadow-xl bg-white/80">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 border-b">
          <CardTitle className="flex items-center gap-2 text-purple-700">
            <MapPin className="w-5 h-5" />
            {language === 'he' ? 'נקודות ציון במסלול' : 'Waypoints'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {showMap ? (
            <Card className="overflow-hidden border-2 border-emerald-200">
              <div className="relative">
                <div className="h-[350px] w-full">
                  <MapContainer
                    center={[startLat || 31.5, startLng || 34.75]}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; OpenStreetMap'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    
                    {startLat && startLng && (
                      <Marker position={[startLat, startLng]}>
                        <Popup>
                          <div className="text-center">
                            <p className="font-bold text-emerald-700">
                              {language === 'he' ? 'התחלה' : 'Start'}
                            </p>
                            <p className="text-sm">{locationName}</p>
                          </div>
                        </Popup>
                      </Marker>
                    )}

                    {waypoints.sort((a, b) => a.order - b.order).map((wp, idx) => (
                      <Marker key={idx} position={[wp.latitude, wp.longitude]}>
                        <Popup>
                          <div className="text-center">
                            <p className="font-bold">{idx + 1}. {wp.name}</p>
                            {wp.description && <p className="text-xs text-gray-600">{wp.description}</p>}
                          </div>
                        </Popup>
                      </Marker>
                    ))}

                    {waypoints.length > 0 && startLat && startLng && (
                      <Polyline
                        positions={[
                          [startLat, startLng],
                          ...waypoints.sort((a, b) => a.order - b.order).map(w => [w.latitude, w.longitude])
                        ]}
                        color="#10b981"
                        weight={3}
                        opacity={0.7}
                      />
                    )}

                    <MapClickHandler onMapClick={handleMapClick} />
                  </MapContainer>
                </div>
                
                <div className="absolute top-2 left-2 right-2 bg-emerald-600 text-white px-3 py-2 rounded-lg shadow-lg text-xs font-medium z-[400]">
                  <div className="flex items-center justify-between">
                    <span>
                      {language === 'he' ? '💡 לחץ על המפה להוספת נקודה' : '💡 Click to add waypoint'}
                    </span>
                    <button onClick={() => setShowMap(false)} className="bg-white/20 hover:bg-white/30 rounded p-1">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Button onClick={() => setShowMap(true)} className="w-full bg-emerald-600 hover:bg-emerald-700 gap-2" size="lg">
              <MapPin className="w-5 h-5" />
              {language === 'he' ? 'הצג מפה' : 'Show Map'}
            </Button>
          )}

          <ScrollArea className="h-[200px]">
            <div className="space-y-2">
              {waypoints.length === 0 ? (
                <p className="text-center text-gray-500 py-8 text-sm">
                  {language === 'he' ? 'אין נקודות ציון עדיין' : 'No waypoints yet'}
                </p>
              ) : (
                waypoints.sort((a, b) => a.order - b.order).map((wp, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg">
                    <Badge className="bg-emerald-600">{idx + 1}</Badge>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{wp.name}</p>
                      {wp.description && <p className="text-xs text-gray-600">{wp.description}</p>}
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEditWaypoint(wp, idx)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={() => handleDeleteWaypoint(idx)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          {googleMapsUrl && (
            <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 gap-2" size="lg">
                <Navigation className="w-5 h-5" />
                {language === 'he' ? 'נווט בגוגל מפות' : 'Navigate in Google Maps'}
              </Button>
            </a>
          )}
        </CardContent>
      </Card>

      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="z-[10000]">
          <DialogHeader>
            <DialogTitle>
              {editingIndex !== null
                ? (language === 'he' ? 'ערוך נקודה' : 'Edit Waypoint')
                : (language === 'he' ? 'נקודה חדשה' : 'New Waypoint')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">{language === 'he' ? 'שם' : 'Name'}</label>
              <Input
                value={waypointForm.name}
                onChange={(e) => setWaypointForm({ ...waypointForm, name: e.target.value })}
                placeholder={language === 'he' ? 'נקודת תצפית...' : 'Viewpoint...'}
                dir={language === 'he' ? 'rtl' : 'ltr'}
              />
            </div>
            <div>
              <label className="text-sm font-medium">{language === 'he' ? 'תיאור' : 'Description'}</label>
              <Textarea
                value={waypointForm.description}
                onChange={(e) => setWaypointForm({ ...waypointForm, description: e.target.value })}
                dir={language === 'he' ? 'rtl' : 'ltr'}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(false)}>{language === 'he' ? 'ביטול' : 'Cancel'}</Button>
            <Button onClick={handleSaveWaypoint} className="bg-emerald-600 hover:bg-emerald-700">{language === 'he' ? 'שמור' : 'Save'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}