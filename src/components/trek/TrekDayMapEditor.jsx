import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';
import { useGoogleMaps } from '../maps/GoogleMapsProvider';
import { GoogleMap, Marker, Polyline, DirectionsRenderer } from '@react-google-maps/api';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { MapPin, Trash2, Route, Mountain, TrendingUp, TrendingDown, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

function MapEditorContent({ day, setDay }) {
  const { language } = useLanguage();
  const { isLoaded, loadError } = useGoogleMaps();
  const [calculating, setCalculating] = useState(false);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [directions, setDirections] = useState(null);
  const mapRef = useRef(null);

  // Fetch walking route from Google Maps Directions Service when waypoints change
  useEffect(() => {
    if (!isLoaded || !window.google || !day.waypoints || day.waypoints.length < 2) {
      setDirections(null);
      return;
    }

    setLoadingRoute(true);
    const directionsService = new window.google.maps.DirectionsService();

    const origin = { lat: day.waypoints[0].latitude, lng: day.waypoints[0].longitude };
    const destination = { lat: day.waypoints[day.waypoints.length - 1].latitude, lng: day.waypoints[day.waypoints.length - 1].longitude };
    
    const waypoints = day.waypoints.slice(1, -1).map(wp => ({
      location: { lat: wp.latitude, lng: wp.longitude },
      stopover: true
    }));

    directionsService.route(
      {
        origin,
        destination,
        waypoints,
        travelMode: window.google.maps.TravelMode.WALKING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);
        } else {
          console.error('Directions request failed:', status);
        }
        setLoadingRoute(false);
      }
    );
  }, [day.waypoints, isLoaded]);

  if (loadError) {
    return (
      <Card className="border-red-200">
        <CardContent className="py-20">
          <div className="flex flex-col items-center justify-center gap-2 text-red-600">
            <span>{language === 'he' ? 'שגיאה בטעינת המפה' : 'Error loading map'}</span>
            <span className="text-xs text-red-400">{loadError}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isLoaded) {
    return (
      <Card className="border-indigo-200">
        <CardContent className="py-20">
          <div className="flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            <span className="text-gray-600">{language === 'he' ? 'טוען מפת גוגל...' : 'Loading Google Map...'}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const addWaypoint = (e) => {
    const newWaypoints = [...(day.waypoints || []), { latitude: e.latLng.lat(), longitude: e.latLng.lng() }];
    setDay({ ...day, waypoints: newWaypoints });
  };

  const removeWaypoint = (index) => {
    const newWaypoints = day.waypoints.filter((_, i) => i !== index);
    setDay({ ...day, waypoints: newWaypoints });
    if (newWaypoints.length < 2) {
      setDirections(null);
    }
  };

  const calculateRouteData = async () => {
    if (!day.waypoints || day.waypoints.length < 2) {
      toast.error(language === 'he' ? 'נא לסמן לפחות 2 נקודות במפה' : 'Please mark at least 2 points on the map');
      return;
    }

    setCalculating(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Given these GPS waypoints for a hiking trail (in order):
${day.waypoints.map((wp, i) => `Point ${i + 1}: ${wp.latitude}, ${wp.longitude}`).join('\n')}

CRITICAL: Use Google Maps API or real hiking/trail routing services to calculate the ACTUAL WALKING/HIKING DISTANCE along trails and paths, NOT straight-line distance.

Calculate:
1. Walking distance (km) - Use Google Maps walking route or trail routing, NOT air distance
2. Start altitude (meters above sea level) - use real elevation data
3. End altitude (meters above sea level) - use real elevation data
4. Highest point altitude (meters) along the route
5. Lowest point altitude (meters) along the route
6. Total elevation gain (meters climbing up) - sum of all uphill sections
7. Total elevation loss (meters going down) - sum of all downhill sections

Search Google Maps and use real topographic/elevation data. Return precise numbers based on actual trail routing.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            distance_km: { type: "number" },
            start_altitude_m: { type: "number" },
            end_altitude_m: { type: "number" },
            highest_point_m: { type: "number" },
            lowest_point_m: { type: "number" },
            elevation_gain_m: { type: "number" },
            elevation_loss_m: { type: "number" }
          }
        }
      });

      setDay({
        ...day,
        daily_distance_km: result.distance_km,
        start_altitude_m: result.start_altitude_m,
        end_altitude_m: result.end_altitude_m,
        highest_point_m: result.highest_point_m,
        lowest_point_m: result.lowest_point_m,
        elevation_gain_m: result.elevation_gain_m,
        elevation_loss_m: result.elevation_loss_m
      });

      toast.success(language === 'he' ? 'נתוני המסלול חושבו!' : 'Route data calculated!');
    } catch (error) {
      toast.error(language === 'he' ? 'שגיאה בחישוב' : 'Calculation error');
    }
    setCalculating(false);
  };

  const center = day.waypoints?.length > 0 
    ? { 
        lat: day.waypoints.reduce((sum, wp) => sum + wp.latitude, 0) / day.waypoints.length,
        lng: day.waypoints.reduce((sum, wp) => sum + wp.longitude, 0) / day.waypoints.length
      }
    : { lat: 32.0853, lng: 34.7818 };

  return (
    <Card className="border-indigo-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Route className="w-4 h-4 text-indigo-600" />
            {language === 'he' ? 'מסלול יומי במפה' : language === 'ru' ? 'Дневной маршрут' : language === 'es' ? 'Ruta diaria' : language === 'fr' ? 'Itinéraire quotidien' : language === 'de' ? 'Tagesroute' : language === 'it' ? 'Percorso giornaliero' : 'Daily Route'}
          </CardTitle>
          {day.waypoints?.length >= 2 && (
            <Button
              type="button"
              size="sm"
              onClick={calculateRouteData}
              disabled={calculating}
              className="gap-2 bg-purple-600 hover:bg-purple-700"
            >
              {calculating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {language === 'he' ? 'חשב נתונים' : language === 'ru' ? 'Рассчитать' : language === 'es' ? 'Calcular' : language === 'fr' ? 'Calculer' : language === 'de' ? 'Berechnen' : language === 'it' ? 'Calcola' : 'Calculate'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {language === 'he' ? 'לחץ על המפה כדי להוסיף נקודות למסלול' : language === 'ru' ? 'Нажмите на карту, чтобы добавить точки' : language === 'es' ? 'Haz clic en el mapa para agregar puntos' : language === 'fr' ? 'Cliquez sur la carte pour ajouter des points' : language === 'de' ? 'Klicken Sie auf die Karte, um Punkte hinzuzufügen' : language === 'it' ? 'Clicca sulla mappa per aggiungere punti' : 'Click on map to add route points'}
          </p>
          {loadingRoute && (
            <div className="flex items-center gap-2 text-sm text-indigo-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              {language === 'he' ? 'טוען מסלול...' : 'Loading route...'}
            </div>
          )}
        </div>

        <div 
          id="trek-map-container"
          style={{ width: '100%', height: '384px', borderRadius: '12px', overflow: 'hidden', border: '2px solid #c7d2fe' }}
        >
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={center}
            zoom={13}
            onClick={addWaypoint}
            onLoad={map => mapRef.current = map}
            options={{
              mapTypeControl: true,
              streetViewControl: false,
              fullscreenControl: false,
            }}
          >
            {day.waypoints?.map((wp, index) => (
              <Marker
                key={index}
                position={{ lat: wp.latitude, lng: wp.longitude }}
                label={(index + 1).toString()}
              />
            ))}

            {directions && (
              <DirectionsRenderer
                directions={directions}
                options={{
                  suppressMarkers: true,
                  polylineOptions: {
                    strokeColor: '#4f46e5',
                    strokeWeight: 4,
                    strokeOpacity: 0.8,
                  }
                }}
              />
            )}
          </GoogleMap>
        </div>

        {day.waypoints?.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-semibold">
              {language === 'he' ? 'נקודות המסלול' : language === 'ru' ? 'Точки маршрута' : language === 'es' ? 'Puntos de ruta' : language === 'fr' ? 'Points d\'itinéraire' : language === 'de' ? 'Routenpunkte' : language === 'it' ? 'Punti del percorso' : 'Route Points'} ({day.waypoints.length})
            </Label>
            <div className="flex flex-wrap gap-2">
              {day.waypoints.map((wp, index) => (
                <Badge key={index} variant="outline" className="gap-2">
                  <MapPin className="w-3 h-3" />
                  {index + 1}
                  <button
                    type="button"
                    onClick={() => removeWaypoint(index)}
                    className="ml-1 hover:text-red-600"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Calculated Data Display */}
        {(day.daily_distance_km || day.elevation_gain_m) && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t">
            {day.daily_distance_km && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">{language === 'he' ? 'מרחק' : 'Distance'}</p>
                <p className="text-lg font-bold text-blue-900">{day.daily_distance_km.toFixed(1)} {language === 'he' ? 'ק״מ' : 'km'}</p>
              </div>
            )}
            {day.elevation_gain_m && (
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {language === 'he' ? 'עליה' : 'Climb'}
                </p>
                <p className="text-lg font-bold text-green-900">+{day.elevation_gain_m.toFixed(0)} {language === 'he' ? 'מ׳' : 'm'}</p>
              </div>
            )}
            {day.elevation_loss_m && (
              <div className="bg-red-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" />
                  {language === 'he' ? 'ירידה' : 'Descent'}
                </p>
                <p className="text-lg font-bold text-red-900">-{day.elevation_loss_m.toFixed(0)} {language === 'he' ? 'מ׳' : 'm'}</p>
              </div>
            )}
            {day.highest_point_m && (
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                  <Mountain className="w-3 h-3" />
                  {language === 'he' ? 'נק׳ גבוהה' : 'Highest'}
                </p>
                <p className="text-lg font-bold text-purple-900">{day.highest_point_m.toFixed(0)} {language === 'he' ? 'מ׳' : 'm'}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function TrekDayMapEditor({ day, setDay }) {
  return <MapEditorContent day={day} setDay={setDay} />;
}