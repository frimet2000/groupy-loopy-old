import React, { useState } from 'react';
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
import { MapPin, Edit, Trash2, Navigation, X, Plus } from 'lucide-react';
import { toast } from "sonner";





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
                  {isLoaded ? (
                    <GoogleMap
                      center={{ lat: startLat || 31.5, lng: startLng || 34.75 }}
                      zoom={13}
                      mapContainerStyle={{ height: '100%', width: '100%' }}
                      onClick={(e) => handleMapClick(e.latLng.lat(), e.latLng.lng())}
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
                        waypoints.length > 0 && startLat && startLng && (
                          <GPolyline
                            path={[
                              { lat: startLat, lng: startLng },
                              ...waypoints
                                .sort((a, b) => a.order - b.order)
                                .map((w) => ({ lat: w.latitude, lng: w.longitude }))
                            ]}
                            options={{ strokeColor: '#10b981', strokeOpacity: 0.7, strokeWeight: 3 }}
                          />
                        )
                      )}
                    </GoogleMap>
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-500 text-sm">
                      {language === 'he' ? 'טוען מפה...' : 'Loading map...'}
                    </div>
                  )}
                </div>
                
                <div className="absolute top-2 left-2 right-2 bg-emerald-600 text-white px-3 py-2 rounded-lg shadow-lg text-xs font-medium z-[400]">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
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