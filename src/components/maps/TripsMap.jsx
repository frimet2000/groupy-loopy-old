import React, { useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguage } from '../LanguageContext';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, MapPin, Navigation, Mountain } from 'lucide-react';
import { format } from 'date-fns';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom icons for different activity types
const createCustomIcon = (color) => new Icon({
  iconUrl: `data:image/svg+xml;base64,${btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" fill="${color}">
      <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24c0-6.6-5.4-12-12-12zm0 16c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z"/>
    </svg>
  `)}`,
  iconSize: [32, 45],
  iconAnchor: [16, 45],
  popupAnchor: [0, -45],
});

const activityIcons = {
  hiking: createCustomIcon('#10b981'),
  cycling: createCustomIcon('#3b82f6'),
  offroad: createCustomIcon('#f97316'),
};

// Component to fit bounds when trips change
function MapBounds({ trips }) {
  const map = useMap();
  
  React.useEffect(() => {
    if (trips.length > 0) {
      const validTrips = trips.filter(t => t.latitude && t.longitude);
      if (validTrips.length > 0) {
        const bounds = validTrips.map(t => [t.latitude, t.longitude]);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
      }
    }
  }, [trips, map]);
  
  return null;
}

export default function TripsMap({ trips }) {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [showTopo, setShowTopo] = useState(false);
  
  // Filter trips that have valid coordinates and are in the future
  const validTrips = useMemo(() => 
    trips.filter(trip => 
      trip.latitude && 
      trip.longitude && 
      trip.status === 'open' &&
      new Date(trip.date) >= new Date()
    ),
    [trips]
  );

  // Calculate center
  const center = useMemo(() => {
    if (validTrips.length === 0) return [32.0853, 34.7818]; // Default: Tel Aviv
    
    const avgLat = validTrips.reduce((sum, t) => sum + t.latitude, 0) / validTrips.length;
    const avgLng = validTrips.reduce((sum, t) => sum + t.longitude, 0) / validTrips.length;
    return [avgLat, avgLng];
  }, [validTrips]);

  if (validTrips.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center bg-gray-100 rounded-2xl">
        <div className="text-center">
          <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">
            {language === 'he' ? 'אין טיולים עתידיים עם מיקום' : 'No upcoming trips with location'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl border-2 border-emerald-100">
      <MapContainer
        center={center}
        zoom={8}
        className="w-full h-full"
        scrollWheelZoom={true}
      >
        {/* Base map - toggle between regular and topographic */}
        {showTopo ? (
          <TileLayer
            attribution='Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
            url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
            maxZoom={17}
          />
        ) : (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        )}
        
        <MapBounds trips={validTrips} />
        
        {validTrips.map(trip => {
          const icon = activityIcons[trip.activity_type] || activityIcons.hiking;
          const title = trip.title;
          const spotsLeft = trip.max_participants - (trip.current_participants || 1);
          
          return (
            <Marker
              key={trip.id}
              position={[trip.latitude, trip.longitude]}
              icon={icon}
            >
              <Popup maxWidth={280} className="custom-popup">
                <div className="p-1.5 md:p-2 space-y-2 md:space-y-3">
                  {trip.image_url && (
                    <img
                      src={trip.image_url}
                      alt={title}
                      className="w-full h-24 md:h-32 object-cover rounded-lg"
                    />
                  )}
                  
                  <div>
                    <h3 className="font-bold text-sm md:text-lg mb-1.5 md:mb-2 line-clamp-2">{title}</h3>

                    <div className="space-y-1.5 md:space-y-2 text-xs md:text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4 text-emerald-600" />
                        <span>{format(new Date(trip.date), 'MMM d, yyyy')}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span>{trip.location}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-purple-600" />
                        <span className="text-gray-700">
                          {trip.current_participants || 1}/{trip.max_participants}
                        </span>
                        {spotsLeft > 0 && spotsLeft <= 3 && (
                          <Badge variant="destructive" className="text-xs">
                            {language === 'he' ? `נותרו ${spotsLeft}` : `${spotsLeft} left`}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex gap-1.5 md:gap-2 flex-wrap">
                        <Badge className="bg-emerald-100 text-emerald-700 text-[10px] md:text-xs">
                          {t(trip.activity_type)}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] md:text-xs">
                          {t(trip.difficulty)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 h-8 md:h-9 text-xs md:text-sm"
                    onClick={() => navigate(createPageUrl('TripDetails') + '?id=' + trip.id)}
                  >
                    <Navigation className="w-3 h-3 md:w-4 md:h-4 mr-1.5 md:mr-2" />
                    {language === 'he' ? 'פרטים' : 'Details'}
                  </Button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      
      {/* Layer controls */}
      <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-white/95 backdrop-blur-sm rounded-lg md:rounded-xl p-1.5 md:p-3 shadow-lg md:shadow-xl z-[1000]">
        <Button
          size="sm"
          variant={showTopo ? "default" : "outline"}
          onClick={() => setShowTopo(!showTopo)}
          className={`w-full justify-start gap-1 md:gap-2 text-xs px-2 py-1 h-7 md:h-9 md:px-3 md:py-2 ${showTopo ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
        >
          <Mountain className="w-3 h-3 md:w-4 md:h-4" />
          <span className="text-[10px] md:text-xs">
            {language === 'he' ? 'טופו' : language === 'ru' ? 'Топо' : language === 'es' ? 'Topo' : language === 'fr' ? 'Topo' : language === 'de' ? 'Topo' : language === 'it' ? 'Topo' : 'Topo'}
          </span>
        </Button>
      </div>

      {/* Map legend */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-xl z-[1000]">
        <h4 className="font-bold text-sm mb-2">
          {language === 'he' ? 'סוגי פעילויות' : language === 'ru' ? 'Типы активности' : language === 'es' ? 'Tipos de actividad' : language === 'fr' ? 'Types d\'activité' : language === 'de' ? 'Aktivitätstypen' : language === 'it' ? 'Tipi di attività' : 'Activity Types'}
        </h4>
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-600"></div>
            <span>{t('hiking')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-600"></div>
            <span>{t('cycling')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-600"></div>
            <span>{t('offroad')}</span>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t text-xs text-gray-600">
          {validTrips.length} {language === 'he' ? 'טיולים עתידיים' : language === 'ru' ? 'будущих поездок' : language === 'es' ? 'viajes próximos' : language === 'fr' ? 'voyages à venir' : language === 'de' ? 'bevorstehende Reisen' : language === 'it' ? 'prossimi viaggi' : 'upcoming trips'}
        </div>
      </div>
    </div>
  );
}