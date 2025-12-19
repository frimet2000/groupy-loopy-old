import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '../LanguageContext';
import { useGoogleMaps } from '../maps/GoogleMapsProvider';
import { GoogleMap, Marker, Polyline } from '@react-google-maps/api';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Route, Mountain, TrendingUp, TrendingDown, MapPin, Trash2, Loader2, Navigation, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

export default function TrekDayMapEditor({ day, setDay }) {
  const { language } = useLanguage();
  const { isLoaded, loadError, apiKey } = useGoogleMaps();
  const [mapInstance, setMapInstance] = useState(null);
  const [routePath, setRoutePath] = useState([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [routeStats, setRouteStats] = useState(null);
  const directionsServiceRef = useRef(null);
  const elevationServiceRef = useRef(null);

  const center = day.waypoints?.length > 0
    ? { lat: day.waypoints[0].latitude, lng: day.waypoints[0].longitude }
    : { lat: 31.7683, lng: 35.2137 };

  const updateField = (field, value) => {
    const numValue = value === '' ? null : parseFloat(value);
    setDay({ ...day, [field]: numValue });
  };

  const onMapLoad = useCallback((map) => {
    setMapInstance(map);
    if (window.google) {
      directionsServiceRef.current = new window.google.maps.DirectionsService();
      elevationServiceRef.current = new window.google.maps.ElevationService();
    }
  }, []);

  const handleMapClick = useCallback((e) => {
    const newWaypoint = {
      latitude: e.latLng.lat(),
      longitude: e.latLng.lng()
    };
    const updatedWaypoints = [...(day.waypoints || []), newWaypoint];
    setDay({ ...day, waypoints: updatedWaypoints });
    setRoutePath([]); // Clear calculated route when adding new point
  }, [day, setDay]);

  const removeWaypoint = (index) => {
    const updated = day.waypoints.filter((_, i) => i !== index);
    setDay({ ...day, waypoints: updated });
    setRoutePath([]);
  };

  const calculateWalkingRoute = async () => {
    if (!directionsServiceRef.current || !day.waypoints || day.waypoints.length < 2) {
      toast.error(language === 'he' ? 'צריך לפחות 2 נקודות' : 'Need at least 2 points');
      return;
    }

    setIsCalculating(true);

    const waypoints = day.waypoints;
    const origin = { lat: waypoints[0].latitude, lng: waypoints[0].longitude };
    const destination = { lat: waypoints[waypoints.length - 1].latitude, lng: waypoints[waypoints.length - 1].longitude };
    
    const middleWaypoints = waypoints.slice(1, -1).map(wp => ({
      location: { lat: wp.latitude, lng: wp.longitude },
      stopover: true
    }));

    try {
      directionsServiceRef.current.route(
        {
          origin,
          destination,
          waypoints: middleWaypoints,
          travelMode: window.google.maps.TravelMode.WALKING,
        },
        (result, status) => {
          setIsCalculating(false);
          if (status === 'OK' && result.routes[0]) {
            const route = result.routes[0];
            const path = route.overview_path.map(p => ({ lat: p.lat(), lng: p.lng() }));
            setRoutePath(path);

            // Calculate total distance
            let totalDistance = 0;
            let totalElevationGain = 0;
            route.legs.forEach(leg => {
              totalDistance += leg.distance.value;
            });

            // Update day with calculated distance
            setDay(prev => ({
              ...prev,
              daily_distance_km: parseFloat((totalDistance / 1000).toFixed(2))
            }));

            toast.success(language === 'he' ? 'המסלול חושב בהצלחה!' : 'Route calculated!');
          } else {
            toast.error(language === 'he' ? 'לא ניתן לחשב מסלול' : 'Could not calculate route');
          }
        }
      );
    } catch (err) {
      setIsCalculating(false);
      toast.error(language === 'he' ? 'שגיאה בחישוב המסלול' : 'Error calculating route');
    }
  };

  const waypointPath = (day.waypoints || []).map(wp => ({
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
          
          {isLoaded && !loadError && (
            <div className="rounded-xl overflow-hidden border-2 border-indigo-100">
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '300px' }}
                center={center}
                zoom={day.waypoints?.length > 0 ? 12 : 8}
                onClick={handleMapClick}
                onLoad={onMapLoad}
                options={{
                  mapTypeControl: true,
                  streetViewControl: false,
                  fullscreenControl: true,
                  zoomControl: true,
                }}
              >
                {/* Markers for waypoints */}
                {day.waypoints?.map((wp, index) => (
                  <Marker
                    key={index}
                    position={{ lat: wp.latitude, lng: wp.longitude }}
                    label={{ 
                      text: String(index + 1), 
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  />
                ))}
                
                {/* Calculated walking route (blue) */}
                {routePath.length > 1 && (
                  <Polyline
                    path={routePath}
                    options={{
                      strokeColor: '#2563eb',
                      strokeWeight: 4,
                      strokeOpacity: 0.9,
                    }}
                  />
                )}

                {/* Direct line between points (dashed, if no route calculated) */}
                {routePath.length === 0 && waypointPath.length > 1 && (
                  <Polyline
                    path={waypointPath}
                    options={{
                      strokeColor: '#4f46e5',
                      strokeWeight: 3,
                      strokeOpacity: 0.6,
                      icons: [{
                        icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 3 },
                        offset: '0',
                        repeat: '15px'
                      }]
                    }}
                  />
                )}
              </GoogleMap>
            </div>
          )}

          {/* Calculate Route Button */}
          {day.waypoints?.length >= 2 && (
            <Button
              type="button"
              onClick={calculateWalkingRoute}
              disabled={isCalculating}
              className="w-full bg-blue-600 hover:bg-blue-700 gap-2"
            >
              {isCalculating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Navigation className="w-4 h-4" />
              )}
              {language === 'he' ? 'חשב מסלול הליכה' : 'Calculate Walking Route'}
            </Button>
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