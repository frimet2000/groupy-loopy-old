import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';
import { MapContainer, TileLayer, Polyline, Marker, useMapEvents } from 'react-leaflet';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import L from 'leaflet';
import { MapPin, Trash2, Route, Mountain, TrendingUp, TrendingDown, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapClickHandler({ onAddPoint }) {
  useMapEvents({
    click(e) {
      onAddPoint(e.latlng);
    },
  });
  return null;
}

export default function TrekDayMapEditor({ day, setDay }) {
  const { language } = useLanguage();
  const [calculating, setCalculating] = useState(false);
  const mapRef = useRef(null);

  const addWaypoint = (latlng) => {
    const newWaypoints = [...(day.waypoints || []), { latitude: latlng.lat, longitude: latlng.lng }];
    setDay({ ...day, waypoints: newWaypoints });
  };

  const removeWaypoint = (index) => {
    const newWaypoints = day.waypoints.filter((_, i) => i !== index);
    setDay({ ...day, waypoints: newWaypoints });
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

Calculate:
1. Walking distance (km) - NOT straight line, but realistic trail distance following terrain
2. Start altitude (meters above sea level)
3. End altitude (meters above sea level)
4. Highest point altitude (meters)
5. Lowest point altitude (meters)
6. Total elevation gain (meters climbing up)
7. Total elevation loss (meters going down)

Use real topographic data. Return precise numbers.`,
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

  const centerLat = day.waypoints?.length > 0 
    ? day.waypoints.reduce((sum, wp) => sum + wp.latitude, 0) / day.waypoints.length 
    : 32.0853;
  const centerLng = day.waypoints?.length > 0 
    ? day.waypoints.reduce((sum, wp) => sum + wp.longitude, 0) / day.waypoints.length 
    : 34.7818;

  const polylinePositions = day.waypoints?.map(wp => [wp.latitude, wp.longitude]) || [];

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
        <p className="text-sm text-gray-600">
          {language === 'he' ? 'לחץ על המפה כדי להוסיף נקודות למסלול' : language === 'ru' ? 'Нажмите на карту, чтобы добавить точки' : language === 'es' ? 'Haz clic en el mapa para agregar puntos' : language === 'fr' ? 'Cliquez sur la carte pour ajouter des points' : language === 'de' ? 'Klicken Sie auf die Karte, um Punkte hinzuzufügen' : language === 'it' ? 'Clicca sulla mappa per aggiungere punti' : 'Click on map to add route points'}
        </p>

        <div className="h-96 rounded-xl overflow-hidden border-2 border-indigo-200">
          <MapContainer
            center={[centerLat, centerLng]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            ref={mapRef}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapClickHandler onAddPoint={addWaypoint} />
            
            {day.waypoints?.map((wp, index) => (
              <Marker
                key={index}
                position={[wp.latitude, wp.longitude]}
              />
            ))}

            {polylinePositions.length > 1 && (
              <Polyline
                positions={polylinePositions}
                color="#4f46e5"
                weight={4}
                opacity={0.7}
              />
            )}
          </MapContainer>
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