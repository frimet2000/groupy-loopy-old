import React, { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { base44 } from '@/api/base44Client';
import { toast } from "sonner";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Radio, Users, Clock, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { he, enUS } from 'date-fns/locale';

// Fix Leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Trail overlay component
function TrailOverlay() {
  const map = useMap();
  
  useEffect(() => {
    const trailLayer = L.tileLayer('https://tile.waymarkedtrails.org/hiking/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://waymarkedtrails.org">Waymarked Trails</a>',
      opacity: 0.6,
      maxZoom: 18
    });
    trailLayer.addTo(map);
    
    return () => {
      map.removeLayer(trailLayer);
    };
  }, [map]);
  
  return null;
}

// Custom marker icons for different users
const createCustomIcon = (color, size = 24, isOrganizer = false, isHighlighted = false) => {
  const borderColor = isHighlighted ? '#FFD700' : 'white';
  const borderWidth = isHighlighted ? 4 : 3;
  const shadowSize = isOrganizer ? '0 4px 12px rgba(0,0,0,0.5)' : '0 2px 8px rgba(0,0,0,0.3)';
  
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: ${size}px; height: ${size}px; border-radius: 50%; border: ${borderWidth}px solid ${borderColor}; box-shadow: ${shadowSize};"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

const colors = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export default function LiveLocationMap({ trip, currentUserEmail, onUpdate }) {
  const { language } = useLanguage();
  const [sharingEnabled, setSharingEnabled] = useState(false);
  const [watchId, setWatchId] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([trip.latitude || 31.5, trip.longitude || 34.75]);
  const [highlightedEmail, setHighlightedEmail] = useState(null);

  const liveLocations = trip.live_locations || [];
  const myLocation = liveLocations.find(loc => loc.email === currentUserEmail);
  
  const isOrganizer = currentUserEmail === trip.organizer_email;
  const isAdditionalOrganizer = trip.additional_organizers?.some(o => o.email === currentUserEmail);
  const canHighlight = isOrganizer || isAdditionalOrganizer;

  useEffect(() => {
    if (myLocation) {
      setSharingEnabled(myLocation.sharing_enabled);
    }
  }, [myLocation]);

  useEffect(() => {
    // Auto-refresh every 15 seconds
    const interval = setInterval(() => {
      onUpdate();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const startSharing = () => {
    if (!navigator.geolocation) {
      toast.error(language === 'he' ? 'הדפדפן לא תומך בשיתוף מיקום' : 'Browser does not support location sharing');
      return;
    }

    // Request permission first
    navigator.permissions.query({ name: 'geolocation' }).then((result) => {
      if (result.state === 'denied') {
        toast.error(language === 'he' ? 'אין הרשאת מיקום. אנא אפשר גישה להגדרות הדפדפן' : 'Location permission denied. Please enable in browser settings');
        return;
      }
    }).catch(() => {
      // If permissions API not supported, continue anyway
    });

    const id = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ latitude, longitude });
        setMapCenter([latitude, longitude]);

        // Update location in database
        const updatedLocations = liveLocations.filter(loc => loc.email !== currentUserEmail);
        updatedLocations.push({
          email: currentUserEmail,
          name: trip.participants?.find(p => p.email === currentUserEmail)?.name || 'Unknown',
          latitude,
          longitude,
          timestamp: new Date().toISOString(),
          sharing_enabled: true
        });

        await base44.entities.Trip.update(trip.id, { live_locations: updatedLocations });
        onUpdate();
      },
      (error) => {
        console.error('Location error:', error);
        let errorMessage = language === 'he' ? 'שגיאה בקבלת מיקום' : 'Error getting location';
        
        if (error.code === 1) {
          errorMessage = language === 'he' ? 'אין הרשאה לגשת למיקום. אנא אפשר גישה בהגדרות הדפדפן' : 'Location permission denied. Please enable location access in browser settings';
        } else if (error.code === 2) {
          errorMessage = language === 'he' ? 'לא ניתן לקבל את המיקום. נסה שוב מאוחר יותר' : 'Location unavailable. Please try again later';
        } else if (error.code === 3) {
          errorMessage = language === 'he' ? 'תם הזמן לקבלת מיקום. נסה שוב' : 'Location timeout. Please try again';
        }
        
        toast.error(errorMessage);
        setSharingEnabled(false);
        if (watchId) {
          navigator.geolocation.clearWatch(watchId);
          setWatchId(null);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000
      }
    );

    setWatchId(id);
    setSharingEnabled(true);
    toast.success(language === 'he' ? 'שיתוף מיקום הופעל' : 'Location sharing enabled');
  };

  const stopSharing = async () => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }

    // Update database to disable sharing
    const updatedLocations = liveLocations.map(loc => 
      loc.email === currentUserEmail 
        ? { ...loc, sharing_enabled: false }
        : loc
    );

    try {
      await base44.entities.Trip.update(trip.id, { live_locations: updatedLocations });
      setSharingEnabled(false);
      onUpdate();
      toast.success(language === 'he' ? 'שיתוף מיקום הופסק' : 'Location sharing disabled');
    } catch (error) {
      console.error('Error stopping location sharing', error);
    }
  };

  const handleToggleSharing = () => {
    if (sharingEnabled) {
      stopSharing();
    } else {
      startSharing();
    }
  };

  const activeLocations = liveLocations.filter(loc => loc.sharing_enabled);

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-xl">
        <CardTitle className="flex items-center gap-2">
          <Radio className="w-5 h-5" />
          {language === 'he' ? 'מיקום חי של הקבוצה' : 'Live Group Location'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Toggle Location Sharing */}
        <Card className={`${sharingEnabled ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${sharingEnabled ? 'bg-emerald-600' : 'bg-gray-400'}`}>
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <Label className="font-semibold">
                    {language === 'he' ? 'שתף את המיקום שלי' : 'Share My Location'}
                  </Label>
                  <p className="text-xs text-gray-600">
                    {sharingEnabled 
                      ? (language === 'he' ? 'המיקום שלך מעודכן בזמן אמת' : 'Your location updates in real-time')
                      : (language === 'he' ? 'אחרים לא יכולים לראות את המיקום שלך' : 'Others cannot see your location')}
                  </p>
                </div>
              </div>
              <Switch
                checked={sharingEnabled}
                onCheckedChange={handleToggleSharing}
                className="data-[state=checked]:bg-emerald-600"
              />
            </div>
          </CardContent>
        </Card>

        {/* Active Locations Count */}
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-blue-900">
                {language === 'he' ? 'משתפים מיקום חי' : 'Sharing Live Location'}
              </span>
            </div>
            <Badge className="bg-blue-600">
              {activeLocations.length} / {trip.participants?.length || 0}
            </Badge>
          </div>
          <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg text-xs">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded-full bg-emerald-600" />
              <span className="text-gray-600">{language === 'he' ? 'מארגן' : 'Organizer'}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full border-4 border-yellow-400 bg-blue-500" />
              <span className="text-gray-600">{language === 'he' ? 'מודגש' : 'Highlighted'}</span>
            </div>
          </div>
        </div>

        {trip.participants?.length > 0 ? (
          <>
            {/* Map */}
            <div className="h-80 rounded-lg overflow-hidden border-2 border-blue-200">
              <MapContainer
                center={mapCenter}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  maxZoom={19}
                />
                <TrailOverlay />

                {/* Trip starting point */}
                <Marker position={[trip.latitude || 31.5, trip.longitude || 34.75]}>
                  <Popup>
                    <div className="text-center">
                      <p className="font-bold text-emerald-700">
                        {language === 'he' ? 'נקודת התחלה' : 'Starting Point'}
                      </p>
                      <p className="text-sm">{trip.location}</p>
                    </div>
                  </Popup>
                </Marker>

                {/* All participants */}
                {trip.participants.map((participant, index) => {
                  const liveLocation = liveLocations.find(loc => loc.email === participant.email && loc.sharing_enabled);
                  const isOrganizerMarker = participant.email === trip.organizer_email;
                  const isAdditionalOrganizerMarker = trip.additional_organizers?.some(o => o.email === participant.email);
                  const isHighlighted = highlightedEmail === participant.email;
                  
                  // Use live location if available, otherwise use trip starting point
                  const position = liveLocation 
                    ? [liveLocation.latitude, liveLocation.longitude]
                    : [trip.latitude || 31.5, trip.longitude || 34.75];
                  
                  const markerColor = isOrganizerMarker 
                    ? '#059669' // emerald-600
                    : isAdditionalOrganizerMarker
                    ? '#0d9488' // teal-600
                    : colors[index % colors.length];
                  
                  const markerSize = (isOrganizerMarker || isAdditionalOrganizerMarker) ? 32 : 24;

                  return (
                    <React.Fragment key={participant.email}>
                      <Marker 
                        position={position}
                        icon={createCustomIcon(markerColor, markerSize, isOrganizerMarker || isAdditionalOrganizerMarker, isHighlighted)}
                      >
                        <Popup>
                          <div className="text-center">
                            <p className="font-bold">{participant.name}</p>
                            {(isOrganizerMarker || isAdditionalOrganizerMarker) && (
                              <Badge className="bg-emerald-600 text-xs mt-1">
                                {language === 'he' ? 'מארגן' : 'Organizer'}
                              </Badge>
                            )}
                            {liveLocation ? (
                              <p className="text-xs text-gray-600 mt-1">
                                <Radio className="w-3 h-3 inline mr-1" />
                                {formatDistanceToNow(new Date(liveLocation.timestamp), { 
                                  addSuffix: true,
                                  locale: language === 'he' ? he : enUS 
                                })}
                              </p>
                            ) : (
                              <p className="text-xs text-gray-500 mt-1">
                                {language === 'he' ? 'לא משתף מיקום' : 'Not sharing location'}
                              </p>
                            )}
                          </div>
                        </Popup>
                      </Marker>
                      {liveLocation && (
                        <Circle
                          center={position}
                          radius={50}
                          pathOptions={{ 
                            color: markerColor,
                            fillColor: markerColor,
                            fillOpacity: 0.1 
                          }}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </MapContainer>
            </div>

            {/* Participants List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-semibold text-gray-700">
                  {language === 'he' ? 'כל המשתתפים' : 'All Participants'}
                </Label>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Radio className="w-3 h-3 text-green-600" />
                  <span>{activeLocations.length} {language === 'he' ? 'משתפים' : 'sharing'}</span>
                </div>
              </div>
              {trip.participants.map((participant, index) => {
                const liveLocation = liveLocations.find(loc => loc.email === participant.email && loc.sharing_enabled);
                const isOrganizerRow = participant.email === trip.organizer_email;
                const isAdditionalOrganizerRow = trip.additional_organizers?.some(o => o.email === participant.email);
                const isHighlighted = highlightedEmail === participant.email;
                
                const markerColor = isOrganizerRow 
                  ? '#059669'
                  : isAdditionalOrganizerRow
                  ? '#0d9488'
                  : colors[index % colors.length];

                return (
                  <div 
                    key={participant.email} 
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                      isHighlighted 
                        ? 'bg-yellow-50 border-yellow-400 border-2 shadow-lg' 
                        : isOrganizerRow || isAdditionalOrganizerRow
                        ? 'bg-emerald-50 border-emerald-200'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div 
                      className={`rounded-full ${isOrganizerRow || isAdditionalOrganizerRow ? 'w-4 h-4' : 'w-3 h-3'}`}
                      style={{ backgroundColor: markerColor }}
                    />
                    <Avatar className={isOrganizerRow || isAdditionalOrganizerRow ? 'h-10 w-10' : 'h-8 w-8'}>
                      <AvatarFallback style={{ backgroundColor: markerColor + '20' }}>
                        {typeof participant.name === 'string' && participant.name ? participant.name.charAt(0) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{participant.name}</p>
                        {(isOrganizerRow || isAdditionalOrganizerRow) && (
                          <Badge className="bg-emerald-600 text-xs">
                            {language === 'he' ? 'מארגן' : 'Organizer'}
                          </Badge>
                        )}
                      </div>
                      {liveLocation ? (
                        <p className="text-xs text-green-600 flex items-center gap-1 font-medium">
                          <Radio className="w-3 h-3" />
                          {formatDistanceToNow(new Date(liveLocation.timestamp), { 
                            addSuffix: true,
                            locale: language === 'he' ? he : enUS 
                          })}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-400">
                          {language === 'he' ? 'לא משתף' : 'Not sharing'}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {participant.email === currentUserEmail && (
                        <Badge className="bg-blue-600 text-xs">
                          {language === 'he' ? 'אתה' : 'You'}
                        </Badge>
                      )}
                      {canHighlight && participant.email !== currentUserEmail && (
                        <Button
                          size="sm"
                          variant={isHighlighted ? "default" : "outline"}
                          onClick={() => setHighlightedEmail(isHighlighted ? null : participant.email)}
                          className={`h-7 text-xs ${isHighlighted ? 'bg-yellow-600 hover:bg-yellow-700' : ''}`}
                        >
                          {isHighlighted ? '⭐' : language === 'he' ? 'הדגש' : 'Highlight'}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">
              {language === 'he' ? 'אין משתתפים בטיול' : 'No participants in trip'}
            </p>
          </div>
        )}

        {/* Privacy Notice */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs text-amber-800">
            <strong>{language === 'he' ? 'פרטיות:' : 'Privacy:'}</strong>{' '}
            {language === 'he' 
              ? 'המיקום שלך משותף רק עם משתתפי הטיול. תוכל להפסיק את השיתוף בכל עת.'
              : 'Your location is only shared with trip participants. You can stop sharing at any time.'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}