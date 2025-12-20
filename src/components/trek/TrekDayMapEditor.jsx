import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '../LanguageContext';
import { useGoogleMaps } from '../maps/GoogleMapsProvider';
import { GoogleMap, Marker, Polyline, DirectionsRenderer } from '@react-google-maps/api';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Route, Mountain, TrendingUp, TrendingDown, MapPin, Trash2, Loader2, Navigation, BarChart3, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function TrekDayMapEditor({ day, setDay }) {
  const { language, isRTL } = useLanguage();
  
  const getMapLanguage = () => {
    const langMap = {
      'he': 'iw',
      'en': 'en',
      'ru': 'ru',
      'es': 'es',
      'fr': 'fr',
      'de': 'de',
      'it': 'it'
    };
    return langMap[language] || 'en';
  };

  const getMapRegion = () => {
    const regionMap = {
      'he': 'IL',
      'en': 'US',
      'ru': 'RU',
      'es': 'ES',
      'fr': 'FR',
      'de': 'DE',
      'it': 'IT'
    };
    return regionMap[language] || 'US';
  };
  const { isLoaded, loadError, apiKey } = useGoogleMaps();
  const [mapInstance, setMapInstance] = useState(null);
  const [routePath, setRoutePath] = useState([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [routeStats, setRouteStats] = useState(null);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const directionsRendererRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchMode, setSearchMode] = useState('single'); // 'single' or 'route'
  const [startPoint, setStartPoint] = useState('');
  const [endPoint, setEndPoint] = useState('');
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

  const handlePlaceSearch = useCallback(() => {
    if (!searchQuery.trim() || !window.google) return;
    
    setIsSearching(true);
    const geocoder = new window.google.maps.Geocoder();
    
    geocoder.geocode({ address: searchQuery }, (results, status) => {
      setIsSearching(false);
      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location;
        const lat = location.lat();
        const lng = location.lng();
        const newWaypoint = {
          latitude: lat,
          longitude: lng
        };
        const updatedWaypoints = [...(day.waypoints || []), newWaypoint];
        setDay({ ...day, waypoints: updatedWaypoints });
        setRoutePath([]);
        setDirectionsResponse(null);
        setRouteStats(null);
        setSearchQuery('');
        
        if (mapInstance) {
          mapInstance.panTo(location);
          mapInstance.setZoom(14);
        }

        // Fetch elevation
        if (elevationServiceRef.current) {
          elevationServiceRef.current.getElevationForLocations(
            { locations: [{ lat, lng }] },
            (results, status) => {
              if (status === 'OK' && results[0]) {
                const ele = Math.round(results[0].elevation);
                setDay(prev => {
                  const waypointsCount = prev.waypoints?.length || 0;
                  const isFirst = waypointsCount === 1;
                  const updated = { ...prev };
                  
                  if (isFirst) {
                    updated.start_altitude_m = ele;
                    updated.end_altitude_m = ele;
                    updated.highest_point_m = ele;
                    updated.lowest_point_m = ele;
                    updated.elevation_gain_m = 0;
                    updated.elevation_loss_m = 0;
                    updated.daily_distance_km = 0;
                  } else {
                    updated.end_altitude_m = ele;
                    if (updated.highest_point_m === null || ele > updated.highest_point_m) updated.highest_point_m = ele;
                    if (updated.lowest_point_m === null || ele < updated.lowest_point_m) updated.lowest_point_m = ele;
                  }
                  return updated;
                });
              }
            }
          );
        }
      }
    });
  }, [searchQuery, day, setDay, mapInstance]);

  const handleRouteSearch = useCallback(() => {
    if (!startPoint.trim() || !endPoint.trim() || !window.google) return;
    
    setIsSearching(true);
    const geocoder = new window.google.maps.Geocoder();
    
    // Geocode both points
    Promise.all([
      new Promise((resolve) => {
        geocoder.geocode({ address: startPoint }, (results, status) => {
          if (status === 'OK' && results[0]) {
            resolve({ lat: results[0].geometry.location.lat(), lng: results[0].geometry.location.lng() });
          } else {
            resolve(null);
          }
        });
      }),
      new Promise((resolve) => {
        geocoder.geocode({ address: endPoint }, (results, status) => {
          if (status === 'OK' && results[0]) {
            resolve({ lat: results[0].geometry.location.lat(), lng: results[0].geometry.location.lng() });
          } else {
            resolve(null);
          }
        });
      })
    ]).then(([start, end]) => {
      setIsSearching(false);
      if (start && end) {
        const newWaypoints = [
          { latitude: start.lat, longitude: start.lng },
          { latitude: end.lat, longitude: end.lng }
        ];
        setDay({ ...day, waypoints: newWaypoints });
        setRoutePath([]);
        setStartPoint('');
        setEndPoint('');
        
        if (mapInstance) {
          const bounds = new window.google.maps.LatLngBounds();
          bounds.extend(start);
          bounds.extend(end);
          mapInstance.fitBounds(bounds);
        }
      } else {
        toast.error(language === 'he' ? 'לא נמצאו המיקומים' : 'Locations not found');
      }
    });
  }, [startPoint, endPoint, day, setDay, mapInstance, language]);

  const handleMapClick = useCallback((e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    const newWaypoint = {
      latitude: lat,
      longitude: lng
    };
    const updatedWaypoints = [...(day.waypoints || []), newWaypoint];
    setDay({ ...day, waypoints: updatedWaypoints });
    setRoutePath([]); 
    setDirectionsResponse(null); 
    setRouteStats(null);

    // Fetch elevation for the new point
    if (elevationServiceRef.current) {
      elevationServiceRef.current.getElevationForLocations(
        { locations: [{ lat, lng }] },
        (results, status) => {
          if (status === 'OK' && results[0]) {
            const ele = Math.round(results[0].elevation);
            setDay(prev => {
              const waypointsCount = prev.waypoints?.length || 0;
              const isFirst = waypointsCount === 1; // It was just added
              const updated = { ...prev };
              
              if (isFirst) {
                updated.start_altitude_m = ele;
                updated.end_altitude_m = ele;
                updated.highest_point_m = ele;
                updated.lowest_point_m = ele;
                updated.elevation_gain_m = 0;
                updated.elevation_loss_m = 0;
                updated.daily_distance_km = 0;
              } else {
                updated.end_altitude_m = ele;
                if (updated.highest_point_m === null || ele > updated.highest_point_m) updated.highest_point_m = ele;
                if (updated.lowest_point_m === null || ele < updated.lowest_point_m) updated.lowest_point_m = ele;
              }
              return updated;
            });
          }
        }
      );
    }
  }, [day, setDay]);

  const removeWaypoint = (index) => {
    const updated = day.waypoints.filter((_, i) => i !== index);
    setDay({ ...day, waypoints: updated });
    setRoutePath([]);
    setDirectionsResponse(null);
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
            setDirectionsResponse(result);
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

    const handleDirectionsChanged = useCallback(async () => {
    if (!directionsRendererRef.current) return;

    const result = directionsRendererRef.current.getDirections();
    if (!result) return;

    // Avoid infinite loops by checking if the result is significantly different if needed,
    // but DirectionsRenderer generally only fires this on user interaction if we use it correctly.

    const route = result.routes[0];
    const path = route.overview_path.map(p => ({ lat: p.lat(), lng: p.lng() }));

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

    // We can't await inside the synchronous callback chain easily without state updates,
    // but we can trigger stats update

    // Update waypoints from the new route (dragging creates stopovers)
    const newWaypoints = [];
    if (route.legs.length > 0) {
      newWaypoints.push({ latitude: route.legs[0].start_location.lat(), longitude: route.legs[0].start_location.lng() });
      route.legs.forEach(leg => {
        newWaypoints.push({ latitude: leg.end_location.lat(), longitude: leg.end_location.lng() });
      });
    }

    setDay(prev => ({
       ...prev,
       waypoints: newWaypoints,
       daily_distance_km: distanceKm
    }));

    // Recalculate elevation for the new path
    const elevationData = await getElevationData(path);

    const stats = {
      distance_km: distanceKm,
      duration_hours: durationHours,
      duration_minutes: durationMinutes,
      ...(elevationData || {})
    };

    setRouteStats(stats);

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

    }, [setDay]);

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
            <>
            {/* Search Mode Toggle */}
            <div className="flex gap-2 mb-2">
              <Button
                type="button"
                size="sm"
                variant={searchMode === 'single' ? 'default' : 'outline'}
                onClick={() => setSearchMode('single')}
                className={searchMode === 'single' ? 'bg-indigo-600' : ''}
              >
                <MapPin className="w-4 h-4 mr-1" />
                {language === 'he' ? 'נקודה' : 'Point'}
              </Button>
              <Button
                type="button"
                size="sm"
                variant={searchMode === 'route' ? 'default' : 'outline'}
                onClick={() => setSearchMode('route')}
                className={searchMode === 'route' ? 'bg-indigo-600' : ''}
              >
                <Route className="w-4 h-4 mr-1" />
                {language === 'he' ? 'מסלול' : 'Route'}
              </Button>
            </div>

            {searchMode === 'single' ? (
              <div className="flex gap-2 mb-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    ref={searchInputRef}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handlePlaceSearch()}
                    placeholder={language === 'he' ? 'חפש מיקום...' : 'Search location...'}
                    className="pl-9 text-sm"
                    dir={language === 'he' ? 'rtl' : 'ltr'}
                  />
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={handlePlaceSearch}
                  disabled={isSearching || !searchQuery.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </Button>
              </div>
            ) : (
              <div className="space-y-2 mb-2 p-3 bg-indigo-50 rounded-lg">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 bg-green-500 rounded-full" />
                    <Input
                      value={startPoint}
                      onChange={(e) => setStartPoint(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && endPoint && handleRouteSearch()}
                      placeholder={language === 'he' ? 'נקודת התחלה (למשל: אילת)' : 'Start point (e.g., Eilat)'}
                      className="pl-9 text-sm"
                      dir={language === 'he' ? 'rtl' : 'ltr'}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 bg-red-500 rounded-full" />
                    <Input
                      value={endPoint}
                      onChange={(e) => setEndPoint(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && startPoint && handleRouteSearch()}
                      placeholder={language === 'he' ? 'נקודת סיום (למשל: אילות)' : 'End point (e.g., Eilot)'}
                      className="pl-9 text-sm"
                      dir={language === 'he' ? 'rtl' : 'ltr'}
                    />
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleRouteSearch}
                    disabled={isSearching || !startPoint.trim() || !endPoint.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Route className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            )}
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
                  language: getMapLanguage(),
                  region: getMapRegion(),
                }}
                >
                {/* Show DirectionsRenderer if we have a calculated route */}
                {directionsResponse ? (
                  <DirectionsRenderer
                    directions={directionsResponse}
                    onLoad={(renderer) => {
                      directionsRendererRef.current = renderer;
                    }}
                    onDirectionsChanged={handleDirectionsChanged}
                    options={{
                      draggable: true,
                      suppressMarkers: false, // Show default A/B markers which are draggable
                      polylineOptions: {
                        strokeColor: '#2563eb',
                        strokeWeight: 4,
                        strokeOpacity: 0.9,
                      }
                    }}
                  />
                ) : (
                  <>
                    {/* Markers for waypoints (only when no route is calculated) */}
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
                  </>
                )}

                {/* Direct line between points (dashed, if no route calculated) */}
                {!directionsResponse && waypointPath.length > 1 && (
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
            </>
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
        {!routeStats && (day.daily_distance_km !== null || day.elevation_gain_m !== null || day.highest_point_m !== null) && (
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