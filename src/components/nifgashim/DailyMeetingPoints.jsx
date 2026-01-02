import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import MeetingPointMap from './MeetingPointMap';

export default function DailyMeetingPoints({ trekDays }) {
  const { language } = useLanguage();

  const translations = {
    he: {
      title: "נקודות מפגש יומיות",
      day: "יום",
      noLocation: "לא הוגדר מיקום"
    },
    en: {
      title: "Daily Meeting Points",
      day: "Day",
      noLocation: "No location set"
    },
    ru: {
      title: "Точки встречи",
      day: "День",
      noLocation: "Нет локации"
    },
    es: {
      title: "Puntos de encuentro",
      day: "Día",
      noLocation: "Sin ubicación"
    },
    fr: {
      title: "Points de rendez-vous",
      day: "Jour",
      noLocation: "Pas de localisation"
    },
    de: {
      title: "Treffpunkte",
      day: "Tag",
      noLocation: "Kein Standort"
    },
    it: {
      title: "Punti d'incontro",
      day: "Giorno",
      noLocation: "Nessuna posizione"
    }
  };

  const trans = translations[language] || translations.he;

  const daysWithLocation = trekDays.filter(day => day.waypoints && day.waypoints.length > 0 && day.waypoints[0].latitude && day.waypoints[0].longitude);

  if (daysWithLocation.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">
          <MapPin className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p>{trans.noLocation}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <MapPin className="w-5 h-5" />
        {trans.title}
      </h3>
      
      {daysWithLocation.map((day) => {
        const meetingPoint = day.waypoints[0];
        return (
          <div key={day.day_number} className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50">
                {trans.day} {day.day_number}
              </Badge>
              <span className="text-sm font-medium">{day.daily_title}</span>
              <span className="text-xs text-gray-500">
                {new Date(day.date).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US', {
                  day: 'numeric',
                  month: 'short'
                })}
              </span>
            </div>
            <MeetingPointMap
              latitude={meetingPoint.latitude}
              longitude={meetingPoint.longitude}
              title={meetingPoint.name}
              address={meetingPoint.description}
            />
          </div>
        );
      })}
    </div>
  );
}