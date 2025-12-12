import React, { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Sun, Cloud, CloudRain, CloudSnow, Wind, Droplets, Thermometer, CloudSun } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const weatherIcons = {
  sunny: Sun,
  cloudy: Cloud,
  partly_cloudy: CloudSun,
  rainy: CloudRain,
  snowy: CloudSnow,
};

export default function WeatherWidget({ location, date }) {
  const { t, isRTL, language } = useLanguage();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      try {
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: language === 'he' 
            ? `תן תחזית מזג אוויר עבור ${location}, ישראל בתאריך ${date}. ספק נתוני מזג אוויר ריאליסטיים עבור ישראל בהתבסס על העונה והמיקום. התשובה חייבת להיות בעברית.`
            : `Get weather forecast for ${location}, Israel on ${date}. Provide realistic weather data for Israel based on the season and location.`,
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              temperature_high: { type: "number" },
              temperature_low: { type: "number" },
              humidity: { type: "number" },
              wind_speed: { type: "number" },
              condition: { type: "string", enum: ["sunny", "cloudy", "partly_cloudy", "rainy", "snowy"] },
              description: { type: "string" }
            }
          }
        });
        setWeather(result);
      } catch (error) {
        console.error('Weather fetch error:', error);
        // Fallback weather data
        setWeather({
          temperature_high: 25,
          temperature_low: 15,
          humidity: 45,
          wind_speed: 12,
          condition: "sunny",
          description: language === 'he' ? "שמיים בהירים צפויים" : "Clear skies expected"
        });
      }
      setLoading(false);
    };

    if (location && date) {
      fetchWeather();
    }
  }, [location, date, language]);

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
        <CardHeader>
          <Skeleton className="h-6 w-32 bg-white/20" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-16 w-24 bg-white/20" />
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-8 bg-white/20" />
            <Skeleton className="h-8 bg-white/20" />
            <Skeleton className="h-8 bg-white/20" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!weather) return null;

  const WeatherIcon = weatherIcons[weather.condition] || Sun;

  return (
    <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
      
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium text-white/90">{t('weather')}</CardTitle>
      </CardHeader>
      
      <CardContent className="relative">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-5xl font-bold">{weather.temperature_high}°</div>
            <div className="text-white/70 text-sm mt-1">
              {t('temperature')}: {weather.temperature_low}° - {weather.temperature_high}°
            </div>
          </div>
          <WeatherIcon className="w-16 h-16 text-white/90" />
        </div>
        
        <div className="grid grid-cols-3 gap-4 bg-white/10 rounded-xl p-3">
          <div className="text-center">
            <Droplets className="w-5 h-5 mx-auto mb-1 text-white/70" />
            <div className="text-sm font-semibold">{weather.humidity}%</div>
            <div className="text-xs text-white/60">{t('humidity')}</div>
          </div>
          <div className="text-center border-x border-white/20">
            <Wind className="w-5 h-5 mx-auto mb-1 text-white/70" />
            <div className="text-sm font-semibold">{weather.wind_speed} km/h</div>
            <div className="text-xs text-white/60">{t('wind')}</div>
          </div>
          <div className="text-center">
            <Thermometer className="w-5 h-5 mx-auto mb-1 text-white/70" />
            <div className="text-sm font-semibold capitalize">{weather.condition.replace('_', ' ')}</div>
            <div className="text-xs text-white/60">{t('conditions')}</div>
          </div>
        </div>
        
        {weather.description && (
          <p className="text-sm text-white/80 mt-4 text-center">
            {weather.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}