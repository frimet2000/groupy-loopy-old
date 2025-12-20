import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '../LanguageContext';
import { useGoogleMaps } from '../maps/GoogleMapsProvider';
import { GoogleMap, Marker, Polyline } from '@react-google-maps/api';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Route, Mountain, TrendingUp, TrendingDown, MapPin, Trash2, Loader2, Navigation, BarChart3, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function TrekDayMapEditor({ day, setDay }) {
  const { language } = useLanguage();
  const { isLoaded, loadError, apiKey } = useGoogleMaps();
  const [mapInstance, setMapInstance] = useState(null);
  const [routePath, setRoutePath] = useState([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [routeStats, setRouteStats] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const directionsServiceRef = useRef(null);
  const elevationServiceRef = useRef(null);
  const autocompleteRef = useRef(null);
  const searchInputRef = useRef(null);

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
    setRouteStats(null);
  };

  const getElevationData = async (path) => {
    if (!elevationServiceRef.current || path.length < 2) return null;

    return new Promise((resolve) => {
      elevationServiceRef.current.getElevationAlongPath(
        {
          path: path,
          samples: Math.min(path.length * 3, 256)
        },
        (results, status) => {
          if (status === 'OK' && results) {
            let elevationGain = 0;
            let elevationLoss = 0;
            let highestPoint = results[0].elevation;
            let lowestPoint = results[0].elevation;
            let startAltitude = results[0].elevation;
            let endAltitude = results[results.length - 1].elevation;

            for (let i = 1; i < results.length; i++) {
              const diff = results[i].elevation - results[i - 1].elevation;
              if (diff > 0) {
                elevationGain += diff;
              } else {
                elevationLoss += Math.abs(diff);
              }
              if (results[i].elevation > highestPoint) {
                highestPoint = results[i].elevation;
              }
              if (results[i].elevation < lowestPoint) {
                lowestPoint = results[i].elevation;
              }
            }

            resolve({
              elevationGain: Math.round(elevationGain),
              elevationLoss: Math.round(elevationLoss),
              highestPoint: Math.round(highestPoint),
              lowestPoint: Math.round(lowestPoint),
              startAltitude: Math.round(startAltitude),
              endAltitude: Math.round(endAltitude)
            });
          } else {
            resolve(null);
          }
        }
      );
    });
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
        async (result, status) => {
          if (status === 'OK' && result.routes[0]) {
            const route = result.routes[0];
            const path = route.overview_path.map(p => ({ lat: p.lat(), lng: p.lng() }));
            setRoutePath(path);

            // Calculate total distance and duration
            let totalDistance = 0;
            let totalDuration = 0;
            route.legs.forEach(leg => {
              totalDistance += leg.distance.value;
              totalDuration += leg.duration.value;
            });

            const distanceKm = parseFloat((totalDistance / 1000).toFixed(2));
            const durationHours = Math.floor(totalDuration / 3600);
            const durationMinutes = Math.round((totalDuration % 3600) / 60);

            // Get elevation data
            const elevationData = await getElevationData(path);

            const stats = {
              distance_km: distanceKm,
              duration_hours: durationHours,
              duration_minutes: durationMinutes,
              ...(elevationData || {})
            };

            setRouteStats(stats);

            // Update day with all calculated data
            setDay(prev => ({
              ...prev,
              daily_distance_km: distanceKm,
              elevation_gain_m: elevationData?.elevationGain || prev.elevation_gain_m,
              elevation_loss_m: elevationData?.elevationLoss || prev.elevation_loss_m,
              highest_point_m: elevationData?.highestPoint || prev.highest_point_m,
              lowest_point_m: elevationData?.lowestPoint || prev.lowest_point_m,
              start_altitude_m: elevationData?.startAltitude || prev.start_altitude_m,
              end_altitude_m: elevationData?.endAltitude || prev.end_altitude_m
            }));

            setIsCalculating(false);
            toast.success(language === 'he' ? 'המסלול נותח בהצלחה!' : 'Route analyzed!');
          } else {
            setIsCalculating(false);
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
                <BarChart3 className="w-4 h-4" />
              )}
              {language === 'he' ? 'נתח מסלול והפק סטטיסטיקות' : 'Analyze Route & Get Stats'}
            </Button>
          )}

          {/* Route Statistics */}
          {routeStats && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-indigo-700">
                <BarChart3 className="w-4 h-4" />
                {language === 'he' ? 'ניתוח מסלול' : 'Route Analysis'}
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                    <Route className="w-3 h-3" />
                    {language === 'he' ? 'מרחק' : 'Distance'}
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    {routeStats.distance_km} {language === 'he' ? 'ק״מ' : 'km'}
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                    <Navigation className="w-3 h-3" />
                    {language === 'he' ? 'זמן הליכה' : 'Walking Time'}
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    {routeStats.duration_hours > 0 && `${routeStats.duration_hours}${language === 'he' ? ' שע\' ' : 'h '}`}
                    {routeStats.duration_minutes}{language === 'he' ? ' דק\'' : 'm'}
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                    <TrendingUp className="w-3 h-3 text-green-600" />
                    {language === 'he' ? 'עלייה מצטברת' : 'Elevation Gain'}
                  </div>
                  <div className="text-lg font-bold text-green-600">
                    +{routeStats.elevationGain || 0} {language === 'he' ? 'מ\'' : 'm'}
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                    <TrendingDown className="w-3 h-3 text-red-600" />
                    {language === 'he' ? 'ירידה מצטברת' : 'Elevation Loss'}
                  </div>
                  <div className="text-lg font-bold text-red-600">
                    -{routeStats.elevationLoss || 0} {language === 'he' ? 'מ\'' : 'm'}
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                    <Mountain className="w-3 h-3 text-blue-600" />
                    {language === 'he' ? 'נקודה גבוהה' : 'Highest Point'}
                  </div>
                  <div className="text-lg font-bold text-blue-600">
                    {routeStats.highestPoint || 0} {language === 'he' ? 'מ\'' : 'm'}
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                    <Mountain className="w-3 h-3 text-amber-600" />
                    {language === 'he' ? 'נקודה נמוכה' : 'Lowest Point'}
                  </div>
                  <div className="text-lg font-bold text-amber-600">
                    {routeStats.lowestPoint || 0} {language === 'he' ? 'מ\'' : 'm'}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Badge variant="outline" className="text-xs">
                  {language === 'he' ? 'התחלה' : 'Start'}: {routeStats.startAltitude || 0}{language === 'he' ? 'מ\'' : 'm'}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {language === 'he' ? 'סיום' : 'End'}: {routeStats.endAltitude || 0}{language === 'he' ? 'מ\'' : 'm'}
                </Badge>
              </div>
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

        {/* Saved Stats Summary (when no live stats showing) */}
        {!routeStats && (day.daily_distance_km || day.elevation_gain_m || day.highest_point_m) && (
          <div className="grid grid-cols-2 gap-2 pt-2 border-t text-sm">
            {day.daily_distance_km && (
              <div className="flex items-center gap-1 text-gray-600">
                <Route className="w-3 h-3" />
                {day.daily_distance_km} {language === 'he' ? 'ק״מ' : 'km'}
              </div>
            )}
            {day.elevation_gain_m && (
              <div className="flex items-center gap-1 text-green-600">
                <TrendingUp className="w-3 h-3" />
                +{day.elevation_gain_m} {language === 'he' ? 'מ\'' : 'm'}
              </div>
            )}
            {day.elevation_loss_m && (
              <div className="flex items-center gap-1 text-red-600">
                <TrendingDown className="w-3 h-3" />
                -{day.elevation_loss_m} {language === 'he' ? 'מ\'' : 'm'}
              </div>
            )}
            {day.highest_point_m && (
              <div className="flex items-center gap-1 text-blue-600">
                <Mountain className="w-3 h-3" />
                {day.highest_point_m} {language === 'he' ? 'מ\'' : 'm'}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}