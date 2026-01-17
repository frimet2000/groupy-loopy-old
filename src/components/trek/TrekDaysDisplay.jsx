import React, { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Route, MapPin, Mountain, TrendingUp, TrendingDown, Cloud, Backpack, Droplets, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import WeatherWidget from '../weather/WeatherWidget';
import EnhancedMapView from '../maps/EnhancedMapView';

export default function TrekDaysDisplay({ trip, selectedDay: externalSelectedDay, onDayChange }) {
  const { language, isRTL } = useLanguage();
  const [internalSelectedDay, setInternalSelectedDay] = useState(0);
  const [failedImages, setFailedImages] = useState(new Set());
  
  const selectedDay = externalSelectedDay !== undefined ? externalSelectedDay : internalSelectedDay;
  const setSelectedDay = onDayChange || setInternalSelectedDay;

  if (!trip.trek_days || trip.trek_days.length === 0) {
    return null;
  }

  const sortedDays = [...trip.trek_days].sort((a, b) => {
    const dateA = a.date ? new Date(a.date) : (trip.date ? new Date(new Date(trip.date).setDate(new Date(trip.date).getDate() + (a.day_number - 1))) : null);
    const dateB = b.date ? new Date(b.date) : (trip.date ? new Date(new Date(trip.date).setDate(new Date(trip.date).getDate() + (b.day_number - 1))) : null);
    if (dateA && dateB) return dateA - dateB;
    return a.day_number - b.day_number;
  });
  const currentDay = sortedDays[selectedDay];

  return (
    <Card className="border-2 border-indigo-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardTitle className="flex items-center gap-2">
          <Route className="w-5 h-5 text-indigo-600" />
          {language === 'he' ? 'מסלול הטראק' : language === 'ru' ? 'Маршрут трека' : language === 'es' ? 'Ruta del trekking' : language === 'fr' ? 'Itinéraire du trekking' : language === 'de' ? 'Trekking-Route' : language === 'it' ? 'Percorso del trekking' : 'Trek Route'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 lg:p-8 space-y-4 lg:space-y-6">
        {/* Overall Trek Stats */}
        {(trip.trek_total_distance_km || trip.trek_overall_highest_point_m) &&
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 lg:gap-6 p-4 lg:p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl">
            {trip.trek_total_distance_km &&
          <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">
                  {language === 'he' ? 'סה״כ מרחק' : language === 'ru' ? 'Общее расстояние' : language === 'es' ? 'Distancia total' : language === 'fr' ? 'Distance totale' : language === 'de' ? 'Gesamtdistanz' : language === 'it' ? 'Distanza totale' : 'Total Distance'}
                </p>
                <p className="text-2xl font-bold text-indigo-900">{trip.trek_total_distance_km.toFixed(1)} {language === 'he' ? 'ק״מ' : 'km'}</p>
              </div>
          }
            {trip.trek_overall_highest_point_m &&
          <div className="text-center">
                <p className="text-xs text-gray-600 mb-1 flex items-center justify-center gap-1">
                  <Mountain className="w-3 h-3" />
                  {language === 'he' ? 'נק׳ גבוהה ביותר' : language === 'ru' ? 'Макс. высота' : language === 'es' ? 'Punto más alto' : language === 'fr' ? 'Point le plus haut' : language === 'de' ? 'Höchster Punkt' : language === 'it' ? 'Punto più alto' : 'Highest Point'}
                </p>
                <p className="text-2xl font-bold text-purple-900">{trip.trek_overall_highest_point_m.toFixed(0)} {language === 'he' ? 'מ׳' : 'm'}</p>
              </div>
          }
            {trip.trek_overall_lowest_point_m &&
          <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">
                  {language === 'he' ? 'נק׳ נמוכה ביותר' : language === 'ru' ? 'Мин. высота' : language === 'es' ? 'Punto más bajo' : language === 'fr' ? 'Point le plus bas' : language === 'de' ? 'Tiefster Punkt' : language === 'it' ? 'Punto più basso' : 'Lowest Point'}
                </p>
                <p className="text-2xl font-bold text-teal-900">{trip.trek_overall_lowest_point_m.toFixed(0)} {language === 'he' ? 'מ׳' : 'm'}</p>
              </div>
          }
          </div>
        }

        {/* Day Tabs */}
        <Tabs value={selectedDay.toString()} onValueChange={(v) => setSelectedDay(parseInt(v))}>
          <TabsList className="flex flex-wrap w-full gap-2 lg:gap-3 h-auto p-2 lg:p-4" dir={isRTL ? 'rtl' : 'ltr'}>
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
              const prevDayDate = index > 0 ? (() => {
                const prevDay = sortedDays[index - 1];
                if (prevDay.date) return new Date(prevDay.date);
                if (trip.date && prevDay.day_number) {
                  const date = new Date(trip.date);
                  date.setDate(date.getDate() + (prevDay.day_number - 1));
                  return date;
                }
                return null;
              })() : null;

              const isNewWeek = dayDate && prevDayDate && dayDate.getDay() < prevDayDate.getDay();

              // Find category for this day
              const category = trip.trek_categories?.find(cat => cat.id === day.category_id);

              return (
                <div key={day.id || index} style={{display: 'contents'}}>
                  {isNewWeek && <div className="w-full h-0" />}
                  <TabsTrigger key={day.id || index}
                    value={index.toString()}
                    className={`relative overflow-hidden flex flex-col items-center justify-center py-2 min-h-[100px] min-w-[110px] transition-all ${
                    day.image_url ?
                    'data-[state=active]:ring-4 data-[state=active]:ring-white data-[state=active]:scale-105' :
                    'data-[state=active]:bg-indigo-100'}`
                    }
                    dir={isRTL ? 'rtl' : 'ltr'}
                    style={{
                      ...(day.image_url && day.image_url.length > 5 ? {
                        backgroundImage: `url(${day.image_url})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      } : {
                        background: 'linear-gradient(135deg, #818cf8 0%, #a78bfa 100%)'
                      })
                    }}>

                    {day.image_url &&
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/60" />
                    }
                    
                    {/* Category Badge */}
                    {category && (
                      <div 
                        className="absolute top-1 right-1 px-2 py-0.5 rounded-full text-xs font-bold z-10 shadow-lg"
                        style={{ 
                          backgroundColor: category.color,
                          color: '#ffffff'
                        }}
                      >
                        {category.name}
                      </div>
                    )}

                    <span className={`font-bold text-base z-10 relative ${day.image_url ? 'text-white drop-shadow-lg' : ''}`}>
                      {language === 'he' ? `יום ${day.day_number}` : `Day ${day.day_number}`}
                    </span>
                    <span className={`text-xs font-semibold z-10 relative mt-0.5 ${day.image_url ? 'text-white drop-shadow-md' : 'text-gray-800'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                      {day.daily_title}
                    </span>
                    {dayDate && (
                      <>
                        <span className={`text-xs z-10 relative ${day.image_url ? 'text-white/90 drop-shadow' : 'text-gray-600'}`}>
                          {dayDate.toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US', { weekday: 'short' })}
                        </span>
                        <span className={`text-xs z-10 relative ${day.image_url ? 'text-white/90 drop-shadow' : 'text-gray-600'}`}>
                          {dayDate.toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US', {
                            day: 'numeric',
                            month: 'numeric'
                          })}
                        </span>
                      </>
                    )}
                  </TabsTrigger>
                </div>
              );
            })}
          </TabsList>

          {sortedDays.map((day, index) =>
          <TabsContent key={day.id || index} value={index.toString()} className="mt-4 pt-12 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 space-y-4">
              {/* Day Navigation */}
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDay(Math.max(0, selectedDay - 1))}
                  disabled={selectedDay === 0}
                  className="gap-1"
                >
                  {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                  {language === 'he' ? 'יום קודם' : language === 'ru' ? 'Предыдущий' : language === 'es' ? 'Anterior' : language === 'fr' ? 'Précédent' : language === 'de' ? 'Zurück' : language === 'it' ? 'Precedente' : 'Previous'}
                </Button>
                <span className="text-sm text-gray-600">
                  {language === 'he' ? `יום ${day.day_number} מתוך ${sortedDays.length}` : `Day ${day.day_number} of ${sortedDays.length}`}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDay(Math.min(sortedDays.length - 1, selectedDay + 1))}
                  disabled={selectedDay === sortedDays.length - 1}
                  className="gap-1"
                >
                  {language === 'he' ? 'יום הבא' : language === 'ru' ? 'Следующий' : language === 'es' ? 'Siguiente' : language === 'fr' ? 'Suivant' : language === 'de' ? 'Weiter' : language === 'it' ? 'Successivo' : 'Next'}
                  {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </Button>
              </div>

              {/* Day Header */}
              <div>
                {day.image_url &&
              <img
                src={day.image_url}
                alt={day.daily_title}
                className="w-full h-64 object-cover rounded-xl mb-4 shadow-lg" />

              }
                <h3 className="text-2xl font-bold text-indigo-900 mb-2" dir={isRTL ? 'rtl' : 'ltr'}>
                  {day.daily_title}
                </h3>
                {day.daily_description &&
              <p className="text-gray-700 leading-relaxed" dir={isRTL ? 'rtl' : 'ltr'}>
                    {day.daily_description}
                  </p>
              }
              </div>

              {/* Day Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
                {day.daily_distance_km &&
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                    <p className="text-xs text-gray-600 mb-1 flex items-center justify-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {language === 'he' ? 'מרחק' : language === 'ru' ? 'Расстояние' : language === 'es' ? 'Distancia' : language === 'fr' ? 'Distance' : language === 'de' ? 'Distanz' : language === 'it' ? 'Distanza' : 'Distance'}
                    </p>
                    <p className="text-lg font-bold text-blue-900">{day.daily_distance_km.toFixed(1)} {language === 'he' ? 'ק״מ' : 'km'}</p>
                  </div>
              }
                {day.elevation_gain_m &&
              <div className="bg-green-50 p-3 rounded-lg text-center">
                    <p className="text-xs text-gray-600 mb-1 flex items-center justify-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {language === 'he' ? 'עליה' : language === 'ru' ? 'Подъем' : language === 'es' ? 'Ascenso' : language === 'fr' ? 'Montée' : language === 'de' ? 'Aufstieg' : language === 'it' ? 'Salita' : 'Climb'}
                    </p>
                    <p className="text-lg font-bold text-green-900">+{day.elevation_gain_m.toFixed(0)} {language === 'he' ? 'מ׳' : 'm'}</p>
                  </div>
              }
                {day.elevation_loss_m &&
              <div className="bg-red-50 p-3 rounded-lg text-center">
                    <p className="text-xs text-gray-600 mb-1 flex items-center justify-center gap-1">
                      <TrendingDown className="w-3 h-3" />
                      {language === 'he' ? 'ירידה' : language === 'ru' ? 'Спуск' : language === 'es' ? 'Descenso' : language === 'fr' ? 'Descente' : language === 'de' ? 'Abstieg' : language === 'it' ? 'Discesa' : 'Descent'}
                    </p>
                    <p className="text-lg font-bold text-red-900">-{day.elevation_loss_m.toFixed(0)} {language === 'he' ? 'מ׳' : 'm'}</p>
                  </div>
              }
                {day.highest_point_m &&
              <div className="bg-purple-50 p-3 rounded-lg text-center">
                    <p className="text-xs text-gray-600 mb-1 flex items-center justify-center gap-1">
                      <Mountain className="w-3 h-3" />
                      {language === 'he' ? 'נק׳ גבוהה' : language === 'ru' ? 'Макс.' : language === 'es' ? 'Punto alto' : language === 'fr' ? 'Point haut' : language === 'de' ? 'Höchster' : language === 'it' ? 'Più alto' : 'Highest'}
                    </p>
                    <p className="text-lg font-bold text-purple-900">{day.highest_point_m.toFixed(0)} {language === 'he' ? 'מ׳' : 'm'}</p>
                  </div>
              }
              </div>

              {/* Weather */}
              <div className="mt-4">
                <WeatherWidget
                location={trip.location}
                date={day.date || (trip.date ? new Date(new Date(trip.date).setDate(new Date(trip.date).getDate() + (day.day_number - 1))).toISOString().split('T')[0] : null)} />

              </div>

              {/* Day Equipment */}
              {day.equipment && day.equipment.length > 0 && (
                <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200" dir={isRTL ? 'rtl' : 'ltr'}>
                  <h4 className="font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                    <Backpack className="w-4 h-4" />
                    {language === 'he' ? 'ציוד ליום זה' : language === 'ru' ? 'Снаряжение на день' : language === 'es' ? 'Equipo del día' : language === 'fr' ? 'Équipement du jour' : language === 'de' ? 'Ausrüstung des Tages' : language === 'it' ? 'Attrezzatura del giorno' : 'Equipment for this day'}
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {day.equipment.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-white rounded-lg p-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                        <span className="text-gray-700">{item.item}</span>
                      </div>
                    ))}
                  </div>
                  {day.recommended_water_liters && (
                    <div className="mt-3 flex items-center gap-2 text-blue-700 bg-blue-50 rounded-lg p-2">
                      <Droplets className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {language === 'he' ? `מים מומלצים: ${day.recommended_water_liters} ליטר` : `Recommended water: ${day.recommended_water_liters}L`}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Map */}
              {day.waypoints && day.waypoints.length > 0 && (
                <EnhancedMapView
                  center={[
                    day.waypoints.reduce((sum, wp) => sum + wp.latitude, 0) / day.waypoints.length,
                    day.waypoints.reduce((sum, wp) => sum + wp.longitude, 0) / day.waypoints.length
                  ]}
                  zoom={13}
                  waypoints={day.waypoints}
                  polylineColor="#4f46e5"
                  height="400px"
                  showNavigationButtons={true}
                />
              )}
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>);

}