import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

export default function MeetingPointMap({ latitude, longitude, title, address, showNavigation = true }) {
  const { language } = useLanguage();
  const [mapLoaded, setMapLoaded] = useState(false);

  const translations = {
    he: {
      meetingPoint: "נקודת מפגש",
      navigate: "נווט",
      openInMaps: "פתח במפות"
    },
    en: {
      meetingPoint: "Meeting Point",
      navigate: "Navigate",
      openInMaps: "Open in Maps"
    },
    ru: {
      meetingPoint: "Точка встречи",
      navigate: "Навигация",
      openInMaps: "Открыть в картах"
    },
    es: {
      meetingPoint: "Punto de encuentro",
      navigate: "Navegar",
      openInMaps: "Abrir en mapas"
    },
    fr: {
      meetingPoint: "Point de rendez-vous",
      navigate: "Naviguer",
      openInMaps: "Ouvrir dans maps"
    },
    de: {
      meetingPoint: "Treffpunkt",
      navigate: "Navigieren",
      openInMaps: "In Karten öffnen"
    },
    it: {
      meetingPoint: "Punto d'incontro",
      navigate: "Naviga",
      openInMaps: "Apri in mappe"
    }
  };

  const trans = translations[language] || translations.he;

  useEffect(() => {
    if (window.google) {
      setMapLoaded(true);
    }
  }, []);

  const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
  const navigateUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          {trans.meetingPoint}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {title && <div className="font-semibold text-sm">{title}</div>}
        {address && <div className="text-sm text-gray-600">{address}</div>}
        
        <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 relative">
          <iframe
            src={`https://www.google.com/maps/embed/v1/place?key=${window.GOOGLE_MAPS_KEY || ''}&q=${latitude},${longitude}&zoom=15`}
            className="w-full h-full border-0"
            loading="lazy"
            allowFullScreen
          />
        </div>

        {showNavigation && (
          <div className="flex gap-2">
            <Button
              onClick={() => window.open(navigateUrl, '_blank')}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              size="sm"
            >
              <Navigation className="w-4 h-4 mr-1" />
              {trans.navigate}
            </Button>
            <Button
              onClick={() => window.open(mapUrl, '_blank')}
              variant="outline"
              className="flex-1"
              size="sm"
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              {trans.openInMaps}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}