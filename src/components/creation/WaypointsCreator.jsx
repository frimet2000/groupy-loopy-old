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
import { MapPin, Edit, Trash2, Navigation, X, Plus, Search } from 'lucide-react';
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

  // Map provider and advanced features
  const [mapProvider, setMapProvider] = useState('israelhiking'); // 'israelhiking' or 'google'
  const [leafletMap, setLeafletMap] = useState(null);
  const gmapRef = useRef(null);
  const [waymarkedVisible, setWaymarkedVisible] = useState(true);
  const [discoveryOpen, setDiscoveryOpen] = useState(false);
  const [selectedTrail, setSelectedTrail] = useState(null); // { geojson, paths, info }
  const [osrmRoute, setOsrmRoute] = useState(null);
  const [osrmLoading, setOsrmLoading] = useState(false);
  const lastOsrmKeyRef = useRef(null);

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

  const computeRoute = async () => {
    if (!isLoaded || !window.google) return;
    if (!startLat || !startLng || waypoints.length === 0) return;
    const sorted = [...waypoints].sort((a, b) => a.order - b.order);
    const directionsService = new window.google.maps.DirectionsService();
    const result = await directionsService.route({
      origin: { lat: startLat, lng: startLng },
      destination: { lat: sorted[sorted.length - 1].latitude, lng: sorted[sorted.length - 1].longitude },
      waypoints: sorted.slice(0, -1).map(w => ({ location: { lat: w.latitude, lng: w.longitude }, stopover: true })),
      travelMode: window.google.maps.TravelMode.WALKING,
    });
    setDirections(result);
    setShowDirections(true);
  };

  const clearRoute = () => {
    setDirections(null);
    setShowDirections(false);
  };

  // Leaflet click handler component
  function LeafletClickHandler({ onMapClick }) {
    useMapEvents({
      click: (e) => onMapClick(e.latlng.lat, e.latlng.lng),
    });
    return null;
  }

  const onGMapLoad = (map) => {
    gmapRef.current = map;
  };

  const geoToPaths = (geo) => {
    const paths = [];
    const features = geo?.type === 'FeatureCollection' ? geo.features : [geo];
    features?.forEach(f => {
      if (!f?.geometry) return;
      const g = f.geometry;
      if (g.type === 'LineString') {
        paths.push(g.coordinates.map(([lng, lat]) => ({ lat, lng })));
      } else if (g.type === 'MultiLineString') {
        g.coordinates.forEach(line => {
          paths.push(line.map(([lng, lat]) => ({ lat, lng })));
        });
      }
    });
    return paths;
  };

  const handleTrailSelected = (geojson, info) => {
    const paths = geoToPaths(geojson);
    setSelectedTrail({ geojson, info, paths });
    // Fit bounds
    if (mapProvider === 'israelhiking' && leafletMap) {
      const bounds = L.geoJSON(geojson).getBounds();
      leafletMap.fitBounds(bounds, { padding: [20, 20] });
    } else if (mapProvider === 'google' && gmapRef.current && window.google) {
      const bounds = new window.google.maps.LatLngBounds();
      paths.forEach(path => path.forEach(p => bounds.extend(p)));
      if (!bounds.isEmpty()) gmapRef.current.fitBounds(bounds);
    }
    setDiscoveryOpen(false);
  };

  const applySelectedTrail = () => {
    if (!selectedTrail?.paths?.length) return;
    const flat = selectedTrail.paths.flat();
    const maxPoints = 200;
    const step = Math.max(1, Math.floor(flat.length / maxPoints));
    const sampled = flat.filter((_, idx) => idx % step === 0);
    const newWps = sampled.map((p, i) => ({ name: `WP ${i+1}`, description: '', latitude: p.lat, longitude: p.lng, order: i }));
    setWaypoints(newWps);
    setSelectedTrail(null);
    toast.success(language === 'he' ? 'השביל נוסף כנקודות ציון' : 'Trail applied as waypoints');
  };

  // Add Waymarked overlays to Google map when enabled
  useEffect(() => {
    if (mapProvider !== 'google' || !gmapRef.current || !window.google) return;
    const overlays = gmapRef.current.overlayMapTypes;
    const hasOverlay = (name) => {
      for (let i = 0; i < overlays.getLength(); i++) {
        const item = overlays.getAt(i);
        if (item && item.name === name) return true;
      }
      return false;
    };
    const addOverlay = (name, template) => {
      const type = new window.google.maps.ImageMapType({
        getTileUrl: (coord, zoom) => template.replace('{z}', zoom).replace('{x}', coord.x).replace('{y}', coord.y),
        tileSize: new window.google.maps.Size(256, 256),
        name,
      });
      overlays.push(type);
    };
    if (waymarkedVisible) {
      if (!hasOverlay('Waymarked Hiking')) addOverlay('Waymarked Hiking', 'https://tile.waymarkedtrails.org/hiking/{z}/{x}/{y}.png');
      if (!hasOverlay('Waymarked Cycling')) addOverlay('Waymarked Cycling', 'https://tile.waymarkedtrails.org/cycling/{z}/{x}/{y}.png');
    } else {
      for (let i = overlays.getLength() - 1; i >= 0; i--) {
        const item = overlays.getAt(i);
        if (item && (item.name === 'Waymarked Hiking' || item.name === 'Waymarked Cycling')) {
          overlays.removeAt(i);
        }
      }
    }
  }, [waymarkedVisible, mapProvider]);

  // OSRM pedestrian routing between two points
  const getOSRMRoute = async (startCoords, endCoords) => {
    const url = `https://router.project-osrm.org/route/v1/foot/${startCoords.lng},${startCoords.lat};${endCoords.lng},${endCoords.lat}?overview=full&geometries=geojson&steps=true`;
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

  // Trigger OSRM when we have exactly two endpoints
  useEffect(() => {
    const points = [];
    if (startLat && startLng) points.push({ lat: startLat, lng: startLng, isStart: true });
    const sorted = [...waypoints].sort((a, b) => a.order - b.order);
    sorted.forEach(w => points.push({ lat: w.latitude, lng: w.longitude }));
    if (points.length !== 2) {
      setOsrmRoute(null);
      lastOsrmKeyRef.current = null;
      return;
    }
    const a = points[0];
    const b = points[1];
    const key = `${a.lat.toFixed(6)},${a.lng.toFixed(6)}|${b.lat.toFixed(6)},${b.lng.toFixed(6)}`;
    if (lastOsrmKeyRef.current === key) return;
    (async () => {
      setOsrmLoading(true);
      const res = await getOSRMRoute({ lat: a.lat, lng: a.lng }, { lat: b.lat, lng: b.lng });
      setOsrmLoading(false);
      if (!res?.geometry?.coordinates?.length) { setOsrmRoute(null); return; }
      setOsrmRoute(res);
      const coords = res.geometry.coordinates;
      const start = coords[0];
      const end = coords[coords.length - 1];
      lastOsrmKeyRef.current = `${start[1].toFixed(6)},${start[0].toFixed(6)}|${end[1].toFixed(6)},${end[0].toFixed(6)}`;
      // Snap last waypoint to path end (we cannot change start props here)
      if (sorted.length >= 1) {
        const snapped = { ...sorted[sorted.length - 1], latitude: end[1], longitude: end[0] };
        const updated = [...sorted.slice(0, -1), snapped];
        setWaypoints(updated.map((w, i) => ({ ...w, order: i })));
      }
      // Fit bounds
      if (mapProvider === 'israelhiking' && leafletMap) {
        const latlngs = coords.map(([lng, lat]) => [lat, lng]);
        const bounds = L.latLngBounds(latlngs);
        leafletMap.fitBounds(bounds, { padding: [20, 20] });
      } else if (mapProvider === 'google' && gmapRef.current && window.google) {
        const bounds = new window.google.maps.LatLngBounds();
        coords.forEach(([lng, lat]) => bounds.extend({ lat, lng }));
        if (!bounds.isEmpty()) gmapRef.current.fitBounds(bounds);
      }
    })();
  }, [waypoints, startLat, startLng, mapProvider, leafletMap]);

  const googleMapsUrl = waypoints.length > 0 && startLat && startLng ? (() => {
    const sorted = [...waypoints].sort((a, b) => a.order - b.order);
    
    // Create a URL with all waypoints as separate markers
    const baseUrl = 'https://www.google.com/maps/dir/';
    const points = [
      `${startLat},${startLng}`,
      ...sorted.map(w => `${w.latitude},${w.longitude}`)
    ];
    
    return baseUrl + points.join('/') + '/@' + points[0] + ',13z';
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
                  <div className="flex items-center gap-2 mb-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={mapProvider === 'israelhiking' ? 'default' : 'outline'}
                      onClick={() => setMapProvider('israelhiking')}
                      className={mapProvider === 'israelhiking' ? 'bg-emerald-600' : ''}
                    >
                      {language === 'he' ? 'מפה' : 'Map'}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={mapProvider === 'google' ? 'default' : 'outline'}
                      onClick={() => setMapProvider('google')}
                      className={mapProvider === 'google' ? 'bg-blue-600' : ''}
                    >
                      Google
                    </Button>
                    <div className="flex items-center gap-2 ml-auto">
                      <Switch checked={waymarkedVisible} onCheckedChange={setWaymarkedVisible} />
                      <span className="text-xs text-gray-700">{language === 'he' ? 'שבילי Waymarked' : 'Waymarked Trails'}</span>
                      <Button type="button" size="sm" variant="outline" onClick={() => setDiscoveryOpen(true)} className="gap-1">
                        <Search className="w-4 h-4" />
                        {language === 'he' ? 'מצא שבילים' : 'Find Trails'}
                      </Button>
                    </div>
                  </div>

                  {mapProvider === 'israelhiking' ? (
                    <MapContainer
                      center={[startLat || 31.5, startLng || 34.75]}
                      zoom={13}
                      style={{ height: '300px', width: '100%' }}
                      whenCreated={setLeafletMap}
                      zoomControl={false}
                    >
                      <ZoomControl position="bottomright" />
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
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
                      <LeafletClickHandler onMapClick={(lat, lng) => handleMapClick(lat, lng)} />

                      {startLat && startLng && (
                        <LeafletMarker position={[startLat, startLng]} />
                      )}
                      {waypoints.sort((a, b) => a.order - b.order).map((wp, idx) => (
                        <LeafletMarker key={idx} position={[wp.latitude, wp.longitude]} />
                      ))}

                      {/* Direct line when no OSRM */}
                      {!osrmRoute && startLat && startLng && waypoints.length > 0 && (
                        <LeafletPolyline
                          positions={[[startLat, startLng], ...waypoints.sort((a,b)=>a.order-b.order).map(w => [w.latitude, w.longitude]) ]}
                          color="#10b981"
                          weight={3}
                          opacity={0.7}
                        />
                      )}

                      {/* Selected trail rendering */}
                      {selectedTrail?.geojson && (
                        <LeafletGeoJSON data={selectedTrail.geojson} style={{ color: '#16a34a', weight: 5, opacity: 0.9 }} />
                      )}

                      {/* OSRM route rendering */}
                      {osrmRoute?.geometry && (
                        <LeafletPolyline
                          positions={osrmRoute.geometry.coordinates.map(([lng, lat]) => [lat, lng])}
                          color="#2563eb"
                          weight={4}
                          opacity={0.9}
                        />
                      )}
                    </MapContainer>
                  ) : (
                    isLoaded ? (
                      <GoogleMap
                        center={{ lat: startLat || 31.5, lng: startLng || 34.75 }}
                        zoom={13}
                        mapContainerStyle={{ height: '300px', width: '100%' }}
                        onClick={(e) => handleMapClick(e.latLng.lat(), e.latLng.lng())}
                        onLoad={onGMapLoad}
                        options={{ streetViewControl: false, mapTypeControl: false }}
                      >
                        {startLat && startLng && (
                          <GMarker position={{ lat: startLat, lng: startLng }} />
                        )}

                        {waypoints.sort((a, b) => a.order - b.order).map((wp, idx) => (
                          <GMarker key={idx} position={{ lat: wp.latitude, lng: wp.longitude }} />
                        ))}

                        {showDirections && directions ? (
                          <DirectionsRenderer directions={directions} />
                        ) : (
                          !osrmRoute && waypoints.length > 0 && startLat && startLng && (
                            <GPolyline
                              path={[{ lat: startLat, lng: startLng }, ...waypoints.sort((a,b)=>a.order-b.order).map(w => ({ lat: w.latitude, lng: w.longitude }))]}
                              options={{ strokeColor: '#10b981', strokeOpacity: 0.7, strokeWeight: 3 }}
                            />
                          )
                        )}

                        {osrmRoute?.geometry && (
                          <GPolyline
                            path={osrmRoute.geometry.coordinates.map(([lng, lat]) => ({ lat, lng }))}
                            options={{ strokeColor: '#2563eb', strokeOpacity: 0.9, strokeWeight: 4 }}
                          />
                        )}

                        {selectedTrail?.paths?.length > 0 && selectedTrail.paths.map((path, idx) => (
                          <GPolyline
                            key={`trail-${idx}`}
                            path={path}
                            options={{ strokeColor: '#16a34a', strokeOpacity: 0.9, strokeWeight: 5 }}
                          />
                        ))}
                      </GoogleMap>
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-500 text-sm">
                        {language === 'he' ? 'טוען מפה...' : 'Loading map...'}
                      </div>
                    )
                  )}
                </div>

                {/* OSRM stats */}
                {osrmRoute && (
                  <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="text-sm font-semibold text-blue-800">
                      {language === 'he' ? 'מסלול הליכה' : 'Walking Route'}
                    </div>
                    <div className="text-sm text-blue-700 flex gap-4 mt-1">
                      <span>{language === 'he' ? 'מרחק:' : 'Distance:'} {osrmRoute.distance} {language === 'he' ? 'ק"מ' : 'km'}</span>
                      <span>{language === 'he' ? 'זמן משוער:' : 'Estimated Time:'} {osrmRoute.duration} {language === 'he' ? 'דק׳' : 'min'}</span>
                    </div>
                    {selectedTrail && (
                      <div className="mt-2 flex justify-end">
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={applySelectedTrail}>
                          {language === 'he' ? 'החל מסלול כשיטה לנקודות' : 'Apply trail as waypoints'}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-fit max-w-[95%] bg-emerald-600/90 backdrop-blur-sm text-white px-3 py-2 rounded-lg shadow-lg text-xs font-medium z-[1001] pointer-events-none">
                  <div className="flex items-center justify-between gap-2 flex-wrap pointer-events-auto">
                    <span>
                      {language === 'he' ? '💡 לחץ על המפה להוספת נקודה' : '💡 Click to add waypoint'}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button type="button" size="sm" variant="secondary" className="bg-white/20 hover:bg-white/30" onClick={computeRoute}>
                        <Navigation className="w-4 h-4 mr-1" />
                        {language === 'he' ? 'מסלול' : 'Route'}
                      </Button>
                      {showDirections && (
                        <Button type="button" size="sm" variant="secondary" className="bg-white/20 hover:bg-white/30" onClick={clearRoute}>
                          {language === 'he' ? 'נקה' : 'Clear'}
                        </Button>
                      )}
                      <div className="bg-white rounded-lg overflow-hidden">
                        <Autocomplete onLoad={setSearchBox} onPlaceChanged={() => {
                          const place = searchBox?.getPlace();
                          if (!place || !place.geometry) return;
                          const lat = place.geometry.location.lat();
                          const lng = place.geometry.location.lng();
                          handleMapClick(lat, lng);
                        }}>
                          <input
                            className="px-3 py-2 w-60 text-sm text-gray-800 outline-none"
                            placeholder={language === 'he' ? 'חיפוש מקום...' : 'Search place...'}
                          />
                        </Autocomplete>
                      </div>
                      <button onClick={() => setShowMap(false)} className="bg-white/20 hover:bg-white/30 rounded p-1">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            {/* Trail Discovery Panel */}
            <TrailDiscoveryPanel
              isOpen={discoveryOpen}
              onOpenChange={setDiscoveryOpen}
              mapProvider={mapProvider}
              getBounds={() => {
                if (mapProvider === 'israelhiking' && leafletMap) {
                  const b = leafletMap.getBounds();
                  return { south: b.getSouth(), west: b.getWest(), north: b.getNorth(), east: b.getEast() };
                }
                if (mapProvider === 'google' && gmapRef.current && gmapRef.current.getBounds) {
                  const b = gmapRef.current.getBounds();
                  if (!b) return null;
                  const ne = b.getNorthEast();
                  const sw = b.getSouthWest();
                  return { south: sw.lat(), west: sw.lng(), north: ne.lat(), east: ne.lng() };
                }
                return null;
              }}
              onTrailSelected={handleTrailSelected}
            />

            </Card>
          ) : (
            <Button type="button" onClick={() => setShowMap(true)} className="w-full bg-emerald-600 hover:bg-emerald-700 gap-2" size="lg">
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
                      <Button type="button" size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEditWaypoint(wp, idx)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={() => handleDeleteWaypoint(idx)}>
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
            <Button type="button" variant="outline" onClick={() => setEditDialog(false)}>{language === 'he' ? 'ביטול' : 'Cancel'}</Button>
            <Button type="button" onClick={handleSaveWaypoint} className="bg-emerald-600 hover:bg-emerald-700">{language === 'he' ? 'שמור' : 'Save'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}