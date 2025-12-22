import React, { useState, useEffect } from 'react';
import { useLanguage } from '../components/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Sun, Cloud, CloudRain, CloudSnow, CloudSun, Wind, Droplets } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';

const weatherIcons = {
  sunny: Sun,
  cloudy: Cloud,
  partly_cloudy: CloudSun,
  rainy: CloudRain,
  snowy: CloudSnow,
};

export default function Weather() {
  const { t, language, isRTL } = useLanguage();
  const [location, setLocation] = useState('Tel Aviv');
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchForecast = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const prompt = language === 'he'
        ? `תחזית מזג אוויר לשבוע הקרוב עבור ${location}, ישראל. היום ${today}. ספק תחזית ל-7 ימים עם טמפרטורות, תיאור קצר, ויום בשבוע. חשוב: החזר רק אובייקט JSON תקין.`
        : `Weekly weather forecast for ${location}, Israel. Today is ${today}. Provide 7 days forecast with temperatures, description, and day of week.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            days: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  day_name: { type: "string" },
                  date: { type: "string" },
                  temp_high: { type: "number" },
                  temp_low: { type: "number" },
                  condition: { type: "string", enum: ["sunny", "cloudy", "partly_cloudy", "rainy", "snowy"] },
                  description: { type: "string" }
                }
              }
            }
          }
        }
      });
      setForecast(result.days);
    } catch (error) {
      console.error('Error fetching forecast:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchForecast();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchForecast();
  };

  return (
    <div className="container mx-auto p-4 max-w-5xl min-h-screen pb-24" dir={isRTL ? 'rtl' : 'ltr'}>
      <h1 className="text-3xl font-bold mb-6 text-center text-emerald-800 flex items-center justify-center gap-2">
        <CloudSun className="w-8 h-8 text-emerald-600" />
        {language === 'he' ? 'תחזית שבועית' : 'Weekly Forecast'}
      </h1>

      <form onSubmit={handleSearch} className="flex gap-2 mb-8 max-w-md mx-auto">
        <Input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder={language === 'he' ? 'הכנס מיקום...' : 'Enter location...'}
          className="bg-white/80 backdrop-blur-sm border-emerald-200 focus:border-emerald-500"
        />
        <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md">
          <Search className="w-4 h-4" />
        </Button>
      </form>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(7)].map((_, i) => (
            <Card key={i} className="bg-white/50 border-0 shadow-sm">
              <CardContent className="p-6 flex flex-col items-center">
                <Skeleton className="h-4 w-20 mb-4" />
                <Skeleton className="h-12 w-12 rounded-full mb-4" />
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : forecast ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {forecast.map((day, index) => {
            const Icon = weatherIcons[day.condition] || Sun;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`
                  h-full transition-all duration-300 border-0 shadow-md hover:shadow-lg hover:-translate-y-1
                  ${index === 0 ? 'bg-gradient-to-br from-emerald-50 to-teal-50 ring-2 ring-emerald-200' : 'bg-white/90 backdrop-blur-sm'}
                `}>
                  <CardHeader className="pb-2 pt-4 px-4">
                    <CardTitle className="text-lg flex justify-between items-center">
                      <span className="font-bold text-gray-800">{day.day_name}</span>
                      <span className="text-xs font-medium text-gray-500 bg-white/50 px-2 py-1 rounded-full">{day.date}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center p-4 pt-2">
                    <div className="my-3 p-3 bg-white/50 rounded-full shadow-inner">
                      <Icon className={`w-10 h-10 ${
                        day.condition === 'sunny' ? 'text-yellow-500 fill-yellow-100' :
                        day.condition === 'rainy' ? 'text-blue-500' :
                        day.condition === 'cloudy' ? 'text-gray-500' :
                        'text-emerald-500'
                      }`} />
                    </div>
                    <div className="flex items-end gap-1 mb-2">
                      <div className="text-3xl font-bold text-gray-800">
                        {day.temp_high}°
                      </div>
                      <div className="text-lg text-gray-400 mb-1 font-medium">
                        / {day.temp_low}°
                      </div>
                    </div>
                    <p className="text-center text-sm font-medium text-gray-600 line-clamp-2 min-h-[2.5rem]">
                      {day.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}