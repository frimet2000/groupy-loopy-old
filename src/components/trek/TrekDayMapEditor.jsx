import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '../LanguageContext';
import { useGoogleMaps } from '../maps/GoogleMapsProvider';
import { GoogleMap, Marker, Polyline, DirectionsRenderer } from '@react-google-maps/api';
import { MapContainer, TileLayer, Marker as LeafletMarker, Polyline as LeafletPolyline, useMapEvents, GeoJSON as LeafletGeoJSON, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import TrailDiscoveryPanel from "./TrailDiscoveryPanel";
import { Route, Mountain, TrendingUp, TrendingDown, MapPin, Trash2, Loader2, Navigation, BarChart3, Search, Map } from 'lucide-react';
import { toast } from 'sonner';

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Leaflet click handler component
function LeafletClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function TrekDayMapEditor({ day, setDay }) {
  const { language, isRTL } = useLanguage();
  const [mapProvider, setMapProvider] = useState('israelhiking'); // 'israelhiking' or 'google'
  
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

  const [leafletMap, setLeafletMap] = useState(null);
  const [waymarkedVisible, setWaymarkedVisible] = useState(true);
  const [discoveryOpen, setDiscoveryOpen] = useState(false);
  const [selectedTrail, setSelectedTrail] = useState(null);
const waymarkedOverlaysRef = useRef([]);
const [osrmLoading, setOsrmLoading] = useState(false);
const [osrmRoute, setOsrmRoute] = useState(null);
const lastOsrmKeyRef = useRef(null);

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

  const handleLeafletMapClick = useCallback((lat, lng) => {
    const newWaypoint = {
      latitude: lat,
      longitude: lng
    };
    const updatedWaypoints = [...(day.waypoints || []), newWaypoint];
    setDay({ ...day, waypoints: updatedWaypoints });
    
    // Initialize Google services if not already done
    if (!window.google && isLoaded) {
      return;
    }
    
    // Try to get elevation data if Google services are available
    if (window.google && window.google.maps && window.google.maps.ElevationService) {
      if (!elevationServiceRef.current) {
        elevationServiceRef.current = new window.google.maps.ElevationService();
      }
      
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
  }, [day, setDay, isLoaded]);

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
    if (mapProvider === 'israelhiking' && leafletMap) {
      const bounds = L.geoJSON(geojson).getBounds();
      leafletMap.fitBounds(bounds, { padding: [20, 20] });
    } else if (mapProvider === 'google' && mapInstance && window.google) {
      const bounds = new window.google.maps.LatLngBounds();
      paths.forEach(path => path.forEach(p => bounds.extend(p)));
      if (!bounds.isEmpty()) mapInstance.fitBounds(bounds);
    }
    setDiscoveryOpen(false);
  };

  const applySelectedTrail = () => {
    if (!selectedTrail?.paths?.length) return;
    const flat = selectedTrail.paths.flat();
    const maxPoints = 200;
    const step = Math.max(1, Math.floor(flat.length / maxPoints));
    const sampled = flat.filter((_, idx) => idx % step === 0);
    const newWaypoints = sampled.map(p => ({ latitude: p.lat, longitude: p.lng }));
    setDay(prev => ({ ...prev, waypoints: newWaypoints }));
    setDirectionsResponse(null);
    setRoutePath([]);
    setRouteStats(null);
    toast.success(language === 'he' ? 'המסלול נשמר ליום זה' : 'Route set for this day');
  };

  const waypointPath = (day.waypoints || []).map(wp => ({
    lat: wp.latitude,
    lng: wp.longitude
  }));

  useEffect(() => {
  if (mapProvider !== 'google' || !mapInstance || !window.google) return;
  const overlays = mapInstance.overlayMapTypes;
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
}, [waymarkedVisible, mapProvider, mapInstance]);

// OSRM pedestrian routing between 2 points
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

useEffect(() => {
  if (!day.waypoints || day.waypoints.length !== 2) {
    setOsrmRoute(null);
    lastOsrmKeyRef.current = null;
    return;
  }
  const [a, b] = day.waypoints;
  if (!a || !b) return;
  const key = `${a.latitude.toFixed(6)},${a.longitude.toFixed(6)}|${b.latitude.toFixed(6)},${b.longitude.toFixed(6)}`;
  if (lastOsrmKeyRef.current === key) return;
  (async () => {
    setOsrmLoading(true);
    const res = await getOSRMRoute({ lat: a.latitude, lng: a.longitude }, { lat: b.latitude, lng: b.longitude });
    setOsrmLoading(false);
    if (!res?.geometry?.coordinates?.length) { setOsrmRoute(null); return; }
    setOsrmRoute(res);

    // Snap markers to path start/end
    const coords = res.geometry.coordinates;
    const start = coords[0];
    const end = coords[coords.length - 1];
    const snappedKey = `${start[1].toFixed(6)},${start[0].toFixed(6)}|${end[1].toFixed(6)},${end[0].toFixed(6)}`;
    lastOsrmKeyRef.current = snappedKey;
    setDay(prev => ({ ...prev, waypoints: [
      { latitude: start[1], longitude: start[0] },
      { latitude: end[1], longitude: end[0] }
    ]}));

    // Fit bounds to route
    if (mapProvider === 'israelhiking' && leafletMap) {
      const latlngs = coords.map(([lng, lat]) => [lat, lng]);
      const bounds = L.latLngBounds(latlngs);
      leafletMap.fitBounds(bounds, { padding: [20, 20] });
    } else if (mapProvider === 'google' && mapInstance && window.google) {
      const bounds = new window.google.maps.LatLngBounds();
      coords.forEach(([lng, lat]) => bounds.extend({ lat, lng }));
      if (!bounds.isEmpty()) mapInstance.fitBounds(bounds);
    }
  })();
}, [day.waypoints, mapProvider, leafletMap, mapInstance]);

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
            <Card className="overflow-hidden border-2 border-indigo-200">
              <div className="p-2 border-b bg-gray-50 flex items-center gap-2 flex-wrap">
                <Button
                  type="button"
                  size="sm"
                  variant={mapProvider === 'israelhiking' ? 'default' : 'outline'}
                  onClick={() => setMapProvider('israelhiking')}
                  className={mapProvider === 'israelhiking' ? 'bg-emerald-600' : ''}
                >
                  <Map className="w-4 h-4 mr-1" />
                  {language === 'he' ? 'מפה' : 'Map'}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={mapProvider === 'google' ? 'default' : 'outline'}
                  onClick={() => setMapProvider('google')}
                  className={mapProvider === 'google' ? 'bg-blue-600' : ''}
                >
                  <Navigation className="w-4 h-4 mr-1" />
                  Google
                </Button>
                
                {mapProvider === 'google' && (
                  <div className="flex gap-1 bg-white rounded-md p-1 border">
                    <Button
                      type="button"
                      size="icon"
                      variant={searchMode === 'single' ? 'secondary' : 'ghost'}
                      onClick={() => setSearchMode('single')}
                      className={`h-6 w-6 ${searchMode === 'single' ? 'bg-indigo-100 text-indigo-700' : ''}`}
                      title={language === 'he' ? 'נקודה' : 'Point'}
                    >
                      <MapPin className="w-3 h-3" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant={searchMode === 'route' ? 'secondary' : 'ghost'}
                      onClick={() => setSearchMode('route')}
                      className={`h-6 w-6 ${searchMode === 'route' ? 'bg-indigo-100 text-indigo-700' : ''}`}
                      title={language === 'he' ? 'מסלול' : 'Route'}
                    >
                      <Route className="w-3 h-3" />
                    </Button>
                  </div>
                )}

                <div className="flex items-center gap-2 ml-auto flex-wrap">
                  <Switch checked={waymarkedVisible} onCheckedChange={setWaymarkedVisible} />
                  <span className="text-xs text-gray-700">{language === 'he' ? 'שבילי Waymarked' : 'Waymarked'}</span>
                  <Button type="button" size="sm" variant="outline" onClick={() => setDiscoveryOpen(true)} className="gap-1">
                    <Search className="w-4 h-4" />
                    {language === 'he' ? 'מצא שבילים' : 'Find Trails'}
                  </Button>
                </div>
              </div>

              <div className="relative h-[300px] w-full">
                {/* Search Overlay */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-fit max-w-[95%] bg-white/90 backdrop-blur-sm shadow-lg rounded-lg border border-gray-200 z-[1001] pointer-events-none p-2">
                  <div className="pointer-events-auto min-w-[300px]">
                    {mapProvider === 'israelhiking' && (
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handlePlaceSearch()}
                            placeholder={language === 'he' ? 'חפש מיקום...' : 'Search location...'}
                            className="h-8 text-sm"
                            dir={language === 'he' ? 'rtl' : 'ltr'}
                          />
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          onClick={handlePlaceSearch}
                          disabled={isSearching || !searchQuery.trim()}
                          className="h-8 bg-emerald-600 hover:bg-emerald-700"
                        >
                          {isSearching ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
                        </Button>
                      </div>
                    )}

                    {mapProvider === 'google' && searchMode === 'single' && (
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            ref={searchInputRef}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handlePlaceSearch()}
                            placeholder={language === 'he' ? 'חפש מיקום...' : 'Search location...'}
                            className="h-8 text-sm"
                            dir={language === 'he' ? 'rtl' : 'ltr'}
                          />
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          onClick={handlePlaceSearch}
                          disabled={isSearching || !searchQuery.trim()}
                          className="h-8 bg-indigo-600 hover:bg-indigo-700"
                        >
                          {isSearching ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
                        </Button>
                      </div>
                    )}

                    {mapProvider === 'google' && searchMode === 'route' && (
                      <div className="flex flex-col gap-2 w-full">
                        <Input
                          value={startPoint}
                          onChange={(e) => setStartPoint(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && endPoint && handleRouteSearch()}
                          placeholder={language === 'he' ? 'התחלה' : 'Start'}
                          className="h-8 text-sm"
                          dir={language === 'he' ? 'rtl' : 'ltr'}
                        />
                        <div className="flex gap-2">
                          <Input
                            value={endPoint}
                            onChange={(e) => setEndPoint(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && startPoint && handleRouteSearch()}
                            placeholder={language === 'he' ? 'סיום' : 'End'}
                            className="h-8 text-sm"
                            dir={language === 'he' ? 'rtl' : 'ltr'}
                          />
                          <Button
                            type="button"
                            size="sm"
                            onClick={handleRouteSearch}
                            disabled={isSearching || !startPoint.trim() || !endPoint.trim()}
                            className="h-8 bg-indigo-600 hover:bg-indigo-700"
                          >
                            {isSearching ? <Loader2 className="w-3 h-3 animate-spin" /> : <Route className="w-3 h-3" />}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {mapProvider === 'israelhiking' ? (
                  <MapContainer
                    center={[center.lat, center.lng]}
                    zoom={day.waypoints?.length > 0 ? 12 : 8}
                    style={{ width: '100%', height: '300px' }}
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
                        attribution='&copy; <a href="https://waymarkedtrails.org">Waymarked Trails</a> - Hiking'
                        url="https://tile.waymarkedtrails.org/hiking/{z}/{x}/{y}.png"
                        opacity={0.6}
                        zIndex={1000}
                      />
                      <TileLayer
                        attribution='&copy; <a href="https://waymarkedtrails.org">Waymarked Trails</a> - Cycling'
                        url="https://tile.waymarkedtrails.org/cycling/{z}/{x}/{y}.png"
                        opacity={0.4}
                        zIndex={1001}
                      />
                    </>
                  )}
                  <LeafletClickHandler onMapClick={handleLeafletMapClick} />
                  
                  {/* Waypoint markers */}
                  {day.waypoints?.map((wp, index) => (
                    <LeafletMarker
                      key={index}
                      position={[wp.latitude, wp.longitude]}
                    />
                  ))}

                  {/* Line between points */}
                  {!osrmRoute && waypointPath.length > 1 && (
                    <LeafletPolyline
                      positions={waypointPath.map(p => [p.lat, p.lng])}
                      color="#4f46e5"
                      weight={3}
                      opacity={0.6}
                      dashArray="10, 10"
                    />
                  )}

                  {selectedTrail?.geojson && (
                    <LeafletGeoJSON
                      data={selectedTrail.geojson}
                      style={{ color: '#16a34a', weight: 5, opacity: 0.9 }}
                    />
                  )}

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
                <GoogleMap
                  key={`map-${language}`}
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
                  {!directionsResponse && !osrmRoute && waypointPath.length > 1 && (
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

                      {osrmRoute?.geometry && (
                      <Polyline
                      path={osrmRoute.geometry.coordinates.map(([lng, lat]) => ({ lat, lng }))}
                      options={{
                        strokeColor: '#2563eb',
                        strokeWeight: 4,
                        strokeOpacity: 0.9
                      }}
                      />
                      )}

                  {selectedTrail?.paths?.length > 0 && selectedTrail.paths.map((path, idx) => (
                    <Polyline
                      key={`trail-${idx}`}
                      path={path}
                      options={{
                        strokeColor: '#16a34a',
                        strokeWeight: 5,
                        strokeOpacity: 0.9
                      }}
                    />
                  ))}
                </GoogleMap>
              )}
            </div>
            </Card>
          )}

          {/* Selected Trail Details */}
          {selectedTrail && (
            <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-emerald-800">
                    {selectedTrail.info?.name || (language === 'he' ? 'שביל ללא שם' : 'Unnamed Trail')}
                  </div>
                  <div className="text-xs text-emerald-700">
                    {(selectedTrail.info?.type === 'bicycle' || selectedTrail.info?.type === 'mtb') ? (language === 'he' ? 'אופניים' : 'Cycling') : (language === 'he' ? 'הליכה' : 'Hiking')}
                  </div>
                </div>
                <Button type="button" size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={applySelectedTrail}>
                  {language === 'he' ? 'קבע כמסלול הקבוצה' : 'Set as Group Route'}
                </Button>
              </div>
            </div>
          )}

          {/* OSRM Route Stats */}
          {osrmRoute && (
            <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-sm font-semibold text-blue-800">
                {language === 'he' ? 'מסלול הליכה' : 'Walking Route'}
              </div>
              <div className="text-sm text-blue-700 flex gap-4 mt-1">
                <span>{language === 'he' ? 'מרחק:' : 'Distance:'} {osrmRoute.distance} {language === 'he' ? 'ק"מ' : 'km'}</span>
                <span>{language === 'he' ? 'זמן משוער:' : 'Estimated Time:'} {osrmRoute.duration} {language === 'he' ? 'דק׳' : 'min'}</span>
              </div>
            </div>
          )}

          {/* Calculate Route Button - Only for Google Maps */}
          {mapProvider === 'google' && day.waypoints?.length >= 2 && (
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
      <TrailDiscoveryPanel
        isOpen={discoveryOpen}
        onOpenChange={setDiscoveryOpen}
        mapProvider={mapProvider}
        getBounds={() => {
          if (mapProvider === 'israelhiking' && leafletMap) {
            const b = leafletMap.getBounds();
            return { south: b.getSouth(), west: b.getWest(), north: b.getNorth(), east: b.getEast() };
          }
          if (mapProvider === 'google' && mapInstance && mapInstance.getBounds) {
            const b = mapInstance.getBounds();
            if (!b) return null;
            const ne = b.getNorthEast();
            const sw = b.getSouthWest();
            return { south: sw.lat(), west: sw.lng(), north: ne.lat(), east: ne.lng() };
          }
          return null;
        }}
        onTrailSelected={handleTrailSelected}
      />
      </CardContent>
    </Card>
  );
}