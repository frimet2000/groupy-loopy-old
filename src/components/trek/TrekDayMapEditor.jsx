import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';
import { useGoogleMaps } from '../maps/GoogleMapsProvider';
import { GoogleMap, Marker, Polyline } from '@react-google-maps/api';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Route, Mountain, TrendingUp, TrendingDown, MapPin, Trash2, Loader2 } from 'lucide-react';

export default function TrekDayMapEditor({ day, setDay }) {
  const { language } = useLanguage();
  const { isLoaded, loadError } = useGoogleMaps();
  const [mapReady, setMapReady] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const mapRef = useRef(null);
  const containerRef = useRef(null);

  // Delay showing map until component is mounted and visible
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMap(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const updateField = (field, value) => {
    const numValue = value === '' ? null : parseFloat(value);
    setDay({ ...day, [field]: numValue });
  };

  const center = day.waypoints?.length > 0
    ? { lat: day.waypoints[0].latitude, lng: day.waypoints[0].longitude }
    : { lat: 31.7683, lng: 35.2137 };

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
    setMapReady(true);
  }, []);

  const handleMapClick = useCallback((e) => {
    const newWaypoint = {
      latitude: e.latLng.lat(),
      longitude: e.latLng.lng()
    };
    const updatedWaypoints = [...(day.waypoints || []), newWaypoint];
    setDay({ ...day, waypoints: updatedWaypoints });
  }, [day, setDay]);

  const removeWaypoint = (index) => {
    const updated = day.waypoints.filter((_, i) => i !== index);
    setDay({ ...day, waypoints: updated });
  };

  const pathCoordinates = (day.waypoints || []).map(wp => ({
    lat: wp.latitude,
    lng: wp.longitude
  }));

  return (
    <Card className="border-indigo-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Route className="w-4 h-4 text-indigo-600" />
          {language === 'he' ? 'מסלול ונתוני יום' : 'Route & Day Data'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Map Section */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            {language === 'he' ? 'לחץ על המפה להוספת נקודות מסלול' : 'Click on map to add waypoints'}
          </Label>
          
          {loadError && (
            <div className="h-64 bg-red-50 rounded-lg flex items-center justify-center text-red-600">
              {language === 'he' ? 'שגיאה בטעינת המפה' : 'Error loading map'}
            </div>
          )}
          
          {!isLoaded && !loadError && (
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
          )}
          
          {isLoaded && !loadError && showMap && (
            <div 
              ref={containerRef}
              style={{ width: '100%', height: '300px', borderRadius: '12px', overflow: 'hidden', background: '#e5e7eb' }}
            >
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '300px' }}
                center={center}
                zoom={10}
                onClick={handleMapClick}
                onLoad={onMapLoad}
                options={{
                  mapTypeControl: true,
                  streetViewControl: false,
                  fullscreenControl: false,
                }}
              >
                {mapReady && day.waypoints?.map((wp, index) => (
                  <Marker
                    key={index}
                    position={{ lat: wp.latitude, lng: wp.longitude }}
                    label={{ text: String(index + 1), color: 'white' }}
                  />
                ))}
                
                {mapReady && pathCoordinates.length > 1 && (
                  <Polyline
                    path={pathCoordinates}
                    options={{
                      strokeColor: '#4f46e5',
                      strokeWeight: 4,
                      strokeOpacity: 0.8,
                    }}
                  />
                )}
              </GoogleMap>
            </div>
          )}

          {/* Waypoints List */}
          {day.waypoints?.length > 0 && (
            <div className="mt-3 space-y-1">
              <Label className="text-xs text-gray-500">
                {language === 'he' ? `${day.waypoints.length} נקודות במסלול` : `${day.waypoints.length} waypoints`}
              </Label>
              <div className="flex flex-wrap gap-2">
                {day.waypoints.map((wp, index) => (
                  <div key={index} className="flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded-lg text-xs">
                    <MapPin className="w-3 h-3 text-indigo-600" />
                    <span>{index + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0"
                      onClick={() => removeWaypoint(index)}
                    >
                      <Trash2 className="w-3 h-3 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Stats Fields */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
          <div className="space-y-2">
            <Label className="flex items-center gap-1 text-sm">
              <Route className="w-3 h-3" />
              {language === 'he' ? 'מרחק (ק״מ)' : 'Distance (km)'}
            </Label>
            <Input
              type="number"
              step="0.1"
              value={day.daily_distance_km || ''}
              onChange={(e) => updateField('daily_distance_km', e.target.value)}
              placeholder="15.5"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1 text-sm">
              <Mountain className="w-3 h-3" />
              {language === 'he' ? 'נקודה גבוהה (מ\')' : 'Highest Point (m)'}
            </Label>
            <Input
              type="number"
              value={day.highest_point_m || ''}
              onChange={(e) => updateField('highest_point_m', e.target.value)}
              placeholder="1200"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1 text-sm">
              <TrendingUp className="w-3 h-3 text-green-600" />
              {language === 'he' ? 'עלייה (מ\')' : 'Elevation Gain (m)'}
            </Label>
            <Input
              type="number"
              value={day.elevation_gain_m || ''}
              onChange={(e) => updateField('elevation_gain_m', e.target.value)}
              placeholder="800"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1 text-sm">
              <TrendingDown className="w-3 h-3 text-red-600" />
              {language === 'he' ? 'ירידה (מ\')' : 'Elevation Loss (m)'}
            </Label>
            <Input
              type="number"
              value={day.elevation_loss_m || ''}
              onChange={(e) => updateField('elevation_loss_m', e.target.value)}
              placeholder="600"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}