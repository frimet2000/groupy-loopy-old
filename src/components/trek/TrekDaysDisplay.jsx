import React, { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapContainer, TileLayer, Polyline, Marker } from 'react-leaflet';
import L from 'leaflet';
import { Route, MapPin, Mountain, TrendingUp, TrendingDown, Cloud } from 'lucide-react';
import { motion } from 'framer-motion';
import WeatherWidget from '../weather/WeatherWidget';

// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function TrekDaysDisplay({ trip }) {
  const { language, isRTL } = useLanguage();
  const [selectedDay, setSelectedDay] = useState(0);

  if (!trip.trek_days || trip.trek_days.length === 0) {
    return null;
  }

  const sortedDays = [...trip.trek_days].sort((a, b) => a.day_number - b.day_number);
  const currentDay = sortedDays[selectedDay];

  return (
    <Card className="border-2 border-indigo-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardTitle className="flex items-center gap-2">
          <Route className="w-5 h-5 text-indigo-600" />
          {language === 'he' ? 'מסלול הטראק' : language === 'ru' ? 'Маршрут трека' : language === 'es' ? 'Ruta del trekking' : language === 'fr' ? 'Itinéraire du trekking' : language === 'de' ? 'Trekking-Route' : language === 'it' ? 'Percorso del trekking' : 'Trek Route'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Overall Trek Stats */}
        {(trip.trek_total_distance_km || trip.trek_overall_highest_point_m) && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl">
            {trip.trek_total_distance_km && (
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">
                  {language === 'he' ? 'סה״כ מרחק' : language === 'ru' ? 'Общее расстояние' : language === 'es' ? 'Distancia total' : language === 'fr' ? 'Distance totale' : language === 'de' ? 'Gesamtdistanz' : language === 'it' ? 'Distanza totale' : 'Total Distance'}
                </p>
                <p className="text-2xl font-bold text-indigo-900">{trip.trek_total_distance_km.toFixed(1)} {language === 'he' ? 'ק״מ' : 'km'}</p>
              </div>
            )}
            {trip.trek_overall_highest_point_m && (
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1 flex items-center justify-center gap-1">
                  <Mountain className="w-3 h-3" />
                  {language === 'he' ? 'נק׳ גבוהה ביותר' : language === 'ru' ? 'Макс. высота' : language === 'es' ? 'Punto más alto' : language === 'fr' ? 'Point le plus haut' : language === 'de' ? 'Höchster Punkt' : language === 'it' ? 'Punto più alto' : 'Highest Point'}
                </p>
                <p className="text-2xl font-bold text-purple-900">{trip.trek_overall_highest_point_m.toFixed(0)} {language === 'he' ? 'מ׳' : 'm'}</p>
              </div>
            )}
            {trip.trek_overall_lowest_point_m && (
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">
                  {language === 'he' ? 'נק׳ נמוכה ביותר' : language === 'ru' ? 'Мин. высота' : language === 'es' ? 'Punto más bajo' : language === 'fr' ? 'Point le plus bas' : language === 'de' ? 'Tiefster Punkt' : language === 'it' ? 'Punto più basso' : 'Lowest Point'}
                </p>
                <p className="text-2xl font-bold text-teal-900">{trip.trek_overall_lowest_point_m.toFixed(0)} {language === 'he' ? 'מ׳' : 'm'}</p>
              </div>
            )}
          </div>
        )}

        {/* Day Tabs */}
        <Tabs value={selectedDay.toString()} onValueChange={(v) => setSelectedDay(parseInt(v))}>
          <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${sortedDays.length}, 1fr)` }} dir={isRTL ? 'rtl' : 'ltr'}>
            {sortedDays.map((day, index) => {
              const getDayDate = () => {
                if (day.date) return new Date(day.date);
                if (trip.date && day.day_number) {
                  const date = new Date(trip.date);
                  date.setDate(date.getDate() + (day.day_number - 1));
                  return date;
                }
                return null;
              };
              
              const dayDate = getDayDate();
              
              return (
                <TabsTrigger 
                  key={day.id || index} 
                  value={index.toString()} 
                  className="relative overflow-hidden data-[state=active]:bg-indigo-100 flex flex-col items-center py-2 min-h-[72px]" 
                  dir={isRTL ? 'rtl' : 'ltr'}
                  style={day.image_url ? {
                    backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6)), url(${day.image_url})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  } : {}}
                >
                  <span className={`font-semibold z-10 ${day.image_url ? 'text-white drop-shadow-lg' : ''}`}>
                    {language === 'he' ? `יום ${day.day_number}` : `Day ${day.day_number}`}
                  </span>
                  {dayDate && (
                    <span className={`text-xs z-10 ${day.image_url ? 'text-white/90 drop-shadow' : 'text-gray-600'}`}>
                      {dayDate.toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US', { 
                        day: 'numeric', 
                        month: 'numeric' 
                      })}
                    </span>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {sortedDays.map((day, index) => (
            <TabsContent key={day.id || index} value={index.toString()} className="space-y-4 mt-4">
              {/* Day Header */}
              <div>
                {day.image_url && (
                  <img 
                    src={day.image_url} 
                    alt={day.daily_title}
                    className="w-full h-64 object-cover rounded-xl mb-4 shadow-lg"
                  />
                )}
                <h3 className="text-2xl font-bold text-indigo-900 mb-2" dir={isRTL ? 'rtl' : 'ltr'}>
                  {day.daily_title}
                </h3>
                {day.daily_description && (
                  <p className="text-gray-700 leading-relaxed" dir={isRTL ? 'rtl' : 'ltr'}>
                    {day.daily_description}
                  </p>
                )}
              </div>

              {/* Day Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {day.daily_distance_km && (
                  <div className="bg-blue-50 p-3 rounded-lg text-center">
                    <p className="text-xs text-gray-600 mb-1 flex items-center justify-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {language === 'he' ? 'מרחק' : language === 'ru' ? 'Расстояние' : language === 'es' ? 'Distancia' : language === 'fr' ? 'Distance' : language === 'de' ? 'Distanz' : language === 'it' ? 'Distanza' : 'Distance'}
                    </p>
                    <p className="text-lg font-bold text-blue-900">{day.daily_distance_km.toFixed(1)} {language === 'he' ? 'ק״מ' : 'km'}</p>
                  </div>
                )}
                {day.elevation_gain_m && (
                  <div className="bg-green-50 p-3 rounded-lg text-center">
                    <p className="text-xs text-gray-600 mb-1 flex items-center justify-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {language === 'he' ? 'עליה' : language === 'ru' ? 'Подъем' : language === 'es' ? 'Ascenso' : language === 'fr' ? 'Montée' : language === 'de' ? 'Aufstieg' : language === 'it' ? 'Salita' : 'Climb'}
                    </p>
                    <p className="text-lg font-bold text-green-900">+{day.elevation_gain_m.toFixed(0)} {language === 'he' ? 'מ׳' : 'm'}</p>
                  </div>
                )}
                {day.elevation_loss_m && (
                  <div className="bg-red-50 p-3 rounded-lg text-center">
                    <p className="text-xs text-gray-600 mb-1 flex items-center justify-center gap-1">
                      <TrendingDown className="w-3 h-3" />
                      {language === 'he' ? 'ירידה' : language === 'ru' ? 'Спуск' : language === 'es' ? 'Descenso' : language === 'fr' ? 'Descente' : language === 'de' ? 'Abstieg' : language === 'it' ? 'Discesa' : 'Descent'}
                    </p>
                    <p className="text-lg font-bold text-red-900">-{day.elevation_loss_m.toFixed(0)} {language === 'he' ? 'מ׳' : 'm'}</p>
                  </div>
                )}
                {day.highest_point_m && (
                  <div className="bg-purple-50 p-3 rounded-lg text-center">
                    <p className="text-xs text-gray-600 mb-1 flex items-center justify-center gap-1">
                      <Mountain className="w-3 h-3" />
                      {language === 'he' ? 'נק׳ גבוהה' : language === 'ru' ? 'Макс.' : language === 'es' ? 'Punto alto' : language === 'fr' ? 'Point haut' : language === 'de' ? 'Höchster' : language === 'it' ? 'Più alto' : 'Highest'}
                    </p>
                    <p className="text-lg font-bold text-purple-900">{day.highest_point_m.toFixed(0)} {language === 'he' ? 'מ׳' : 'm'}</p>
                  </div>
                )}
              </div>

              {/* Weather */}
              <div className="mt-4">
                <WeatherWidget 
                  location={trip.location} 
                  date={day.date || (trip.date ? new Date(new Date(trip.date).setDate(new Date(trip.date).getDate() + (day.day_number - 1))).toISOString().split('T')[0] : null)}
                />
              </div>

              {/* Map */}
              {day.waypoints && day.waypoints.length > 0 && (
                <div className="h-96 rounded-xl overflow-hidden border-2 border-indigo-200">
                  <MapContainer
                    center={[
                      day.waypoints.reduce((sum, wp) => sum + wp.latitude, 0) / day.waypoints.length,
                      day.waypoints.reduce((sum, wp) => sum + wp.longitude, 0) / day.waypoints.length
                    ]}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    
                    {day.waypoints.map((wp, wpIndex) => (
                      <Marker
                        key={wpIndex}
                        position={[wp.latitude, wp.longitude]}
                      />
                    ))}

                    {day.waypoints.length > 1 && (
                      <Polyline
                        positions={day.waypoints.map(wp => [wp.latitude, wp.longitude])}
                        color="#4f46e5"
                        weight={4}
                        opacity={0.7}
                      />
                    )}
                  </MapContainer>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}