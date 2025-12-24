import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GoogleMap, Marker as GMarker, Polyline as GPolyline, Autocomplete, DirectionsRenderer } from '@react-google-maps/api';
import { useGoogleMaps } from '../maps/GoogleMapsProvider';
import { MapPin, Edit, Trash2, Navigation, X, Search } from 'lucide-react';
import { toast } from "sonner";
import { MapContainer, TileLayer, Marker as LeafletMarker, Polyline as LeafletPolyline, GeoJSON as LeafletGeoJSON, useMapEvents, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Switch } from "@/components/ui/switch";
import TrailDiscoveryPanel from '../trek/TrailDiscoveryPanel';

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function WaypointsCreator({ waypoints, setWaypoints, startLat, startLng, locationName }) {
  const { language } = useLanguage();
  const { isLoaded } = useGoogleMaps();
  const [searchBox, setSearchBox] = useState(null);
  const [directions, setDirections] = useState(null);
  const [showDirections, setShowDirections] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [waypointForm, setWaypointForm] = useState({ name: '', description: '', latitude: 0, longitude: 0 });

  const [mapProvider, setMapProvider] = useState('israelhiking');
  const [leafletMap, setLeafletMap] = useState(null);
  const gmapRef = useRef(null);
  const [waymarkedVisible, setWaymarkedVisible] = useState(true);
  const [discoveryOpen, setDiscoveryOpen] = useState(false);
  const [selectedTrail, setSelectedTrail] = useState(null);
  const [osrmRoute, setOsrmRoute] = useState(null);
  const [osrmLoading, setOsrmLoading] = useState(false);
  const lastOsrmKeyRef = useRef(null);

  const handleMapClick = (lat, lng) => {
    setEditingIndex(null);
    setWaypointForm({ name: `${language === 'he' ? 'נקודה' : 'Point'} ${waypoints.length + 1}`, description: '', latitude: lat, longitude: lng });
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

  // OSRM Multi-point Routing
  const getOSRMRoute = async (points) => {
    if (points.length < 2) return null;
    const coordsString = points.map(p => `${p.lng},${p.lat}`).join(';');
    const url = `https://router.project-osrm.org/route/v1/foot/${coordsString}?overview=full&geometries=geojson&steps=true`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.code === 'Ok' && data.routes.length > 0) {
        const route = data.routes[0];
        return {
          distance: (route.distance / 1000).toFixed(2),
          geometry: route.geometry,
          duration: Math.round(route.duration / 60)
        };
      }
    } catch (error) {
      console.error('OSRM Routing Error:', error);
    }
    return null;
  };

  useEffect(() => {
    const points = [];
    if (startLat && startLng) points.push({ lat: startLat, lng: startLng });
    const sorted = [...waypoints].sort((a, b) => a.order - b.order);
    sorted.forEach(w => points.push({ lat: w.latitude, lng: w.longitude }));

    if (points.length < 2) {
      setOsrmRoute(null);
      return;
    }

    const key = points.map(p => `${p.lat.toFixed(5)},${p.lng.toFixed(5)}`).join('|');
    if (lastOsrmKeyRef.current === key) return;

    (async () => {
      setOsrmLoading(true);
      const res = await getOSRMRoute(points);
      setOsrmLoading(false);
      if (res) {
        setOsrmRoute(res);
        lastOsrmKeyRef.current = key;
      }
    })();
  }, [waypoints, startLat, startLng]);

  function LeafletClickHandler({ onMapClick }) {
    useMapEvents({ click: (e) => onMapClick(e.latlng.lat, e.latlng.lng) });
    return null;
  }

  return (
    <>
      <Card className="border-2 border-purple-100 shadow-xl bg-white/80">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 border-b">
          <CardTitle className="flex items-center gap-2 text-purple-700">
            <MapPin className="w-5 h-5" />
            {language === 'he' ? 'תכנון מסלול הליכה' : 'Walking Route Planner'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {showMap ? (
            <Card className="overflow-hidden border-2 border-emerald-200 relative">
              {/* Floating UI Layer - This fixes the overlap */}
              <div className="absolute top-2 left-0 right-0 flex justify-center z-[1001] pointer-events-none px-2">
                <div className="w-fit max-w-full bg-emerald-600/90 backdrop-blur-md text-white px-3 py-2 rounded-xl shadow-2xl pointer-events-auto flex items-center gap-2 flex-wrap">
                   <span className="text-xs font-bold hidden sm:inline">
                    {language === 'he' ? '💡 לחץ על המפה' : '💡 Click Map'}
                  </span>
                  
                  <div className="flex items-center gap-1 bg-white rounded-lg px-2 py-1 shadow-inner">
                    <Search className="w-3 h-3 text-gray-400" />
                    <Autocomplete 
                      onLoad={setSearchBox} 
                      onPlaceChanged={() => {
                        const place = searchBox?.getPlace();
                        if (place?.geometry) handleMapClick(place.geometry.location.lat(), place.geometry.location.lng());
                      }}
                    >
                      <input
                        className="w-32 sm:w-48 text-xs text-gray-800 outline-none border-none bg-transparent"
                        placeholder={language === 'he' ? 'חיפוש...' : 'Search...'}
                      />
                    </Autocomplete>
                  </div>

                  <Button size="sm" variant="secondary" className="h-8 text-xs bg-white/20 hover:bg-white/40 text-white border-none" onClick={() => setShowMap(false)}>
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div className="h-[400px] w-full">
                {mapProvider === 'israelhiking' ? (
                  <MapContainer
                    center={[startLat || 31.5, startLng || 34.75]}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                    whenCreated={setLeafletMap}
                    zoomControl={false}
                  >
                    <ZoomControl position="bottomright" />
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    {waymarkedVisible && (
                      <TileLayer url="https://tile.waymarkedtrails.org/hiking/{z}/{x}/{y}.png" opacity={0.7} zIndex={1000} />
                    )}
                    <LeafletClickHandler onMapClick={handleMapClick} />
                    
                    {startLat && startLng && <LeafletMarker position={[startLat, startLng]} />}
                    {waypoints.map((wp, i) => (
                      <LeafletMarker key={i} position={[wp.latitude, wp.longitude]} />
                    ))}
                    
                    {osrmRoute && (
                      <LeafletPolyline 
                        positions={osrmRoute.geometry.coordinates.map(([lng, lat]) => [lat, lng])} 
                        color="#2563eb" weight={5} opacity={0.8}
                      />
                    )}
                  </MapContainer>
                ) : (
                  /* Google Map Implementation would go here similar to above */
                  <div className="flex items-center justify-center h-full bg-gray-100">Google Maps Mode</div>
                )}
              </div>

              {/* Stats Overlay */}
              {osrmRoute && (
                <div className="absolute bottom-4 left-4 z-[1001] bg-white/90 backdrop-blur p-2 rounded-lg shadow-md border border-blue-100">
                   <div className="flex gap-3 text-xs font-bold text-blue-800">
                      <span>📏 {osrmRoute.distance} ק"מ</span>
                      <span>⏱️ {osrmRoute.duration} דק׳</span>
                   </div>
                </div>
              )}
            </Card>
          ) : (
            <Button onClick={() => setShowMap(true)} className="w-full bg-emerald-600 hover:bg-emerald-700 h-12">
              <Navigation className="mr-2 h-5 w-5" /> {language === 'he' ? 'פתח מפת תכנון' : 'Open Planning Map'}
            </Button>
          )}

          <ScrollArea className={`${waypoints.length > 0 ? 'h-[150px]' : 'h-0'}`}>
            <div className="space-y-2 pr-3">
              {waypoints.map((wp, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded-md border border-slate-100">
                  <Badge variant="outline" className="bg-white">{idx + 1}</Badge>
                  <span className="flex-1 text-sm font-medium truncate">{wp.name}</span>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500" onClick={() => handleDeleteWaypoint(idx)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Edit Waypoint Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{language === 'he' ? 'פרטי נקודה' : 'Waypoint Details'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <Input 
              value={waypointForm.name} 
              onChange={e => setWaypointForm({...waypointForm, name: e.target.value})}
              placeholder="שם הנקודה (למשל: תצפית)"
            />
            <Textarea 
              value={waypointForm.description} 
              onChange={e => setWaypointForm({...waypointForm, description: e.target.value})}
              placeholder="תיאור קצר..."
            />
          </div>
          <DialogFooter>
            <Button onClick={handleSaveWaypoint} className="bg-emerald-600 w-full">{language === 'he' ? 'הוסף למסלול' : 'Add to Route'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}