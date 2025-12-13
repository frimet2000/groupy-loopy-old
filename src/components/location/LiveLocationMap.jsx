import React, { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
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

// Custom marker icons for different users
const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const colors = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export default function LiveLocationMap({ trip, currentUserEmail, onUpdate }) {
  const { language } = useLanguage();
  const [sharingEnabled, setSharingEnabled] = useState(false);
  const [watchId, setWatchId] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([trip.latitude || 31.5, trip.longitude || 34.75]);

  const liveLocations = trip.live_locations || [];
  const myLocation = liveLocations.find(loc => loc.email === currentUserEmail);

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

    const id = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ latitude, longitude });

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

        try {
          await base44.entities.Trip.update(trip.id, { live_locations: updatedLocations });
          onUpdate();
        } catch (error) {
          console.error('Error updating location', error);
        }
      },
      (error) => {
        console.error('Location error:', error);
        toast.error(language === 'he' ? 'שגיאה בקבלת מיקום' : 'Error getting location');
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
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
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-blue-900">
              {language === 'he' ? 'משתפים מיקום כרגע' : 'Currently Sharing'}
            </span>
          </div>
          <Badge className="bg-blue-600">
            {activeLocations.length} / {trip.participants?.length || 0}
          </Badge>
        </div>

        {activeLocations.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">
              {language === 'he' 
                ? 'אף אחד לא משתף מיקום כרגע'
                : 'No one is sharing location right now'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {language === 'he' 
                ? 'הפעל שיתוף מיקום כדי לראות את המשתתפים האחרים'
                : 'Enable location sharing to see other participants'}
            </p>
          </div>
        ) : (
          <>
            {/* Map */}
            <div className="h-80 rounded-lg overflow-hidden border-2 border-blue-200">
              <MapContainer
                center={mapCenter}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

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

                {/* User locations */}
                {activeLocations.map((loc, index) => (
                  <React.Fragment key={loc.email}>
                    <Marker 
                      position={[loc.latitude, loc.longitude]}
                      icon={createCustomIcon(colors[index % colors.length])}
                    >
                      <Popup>
                        <div className="text-center">
                          <p className="font-bold">{loc.name}</p>
                          <p className="text-xs text-gray-600">
                            {formatDistanceToNow(new Date(loc.timestamp), { 
                              addSuffix: true,
                              locale: language === 'he' ? he : enUS 
                            })}
                          </p>
                        </div>
                      </Popup>
                    </Marker>
                    <Circle
                      center={[loc.latitude, loc.longitude]}
                      radius={50}
                      pathOptions={{ 
                        color: colors[index % colors.length],
                        fillColor: colors[index % colors.length],
                        fillOpacity: 0.1 
                      }}
                    />
                  </React.Fragment>
                ))}
              </MapContainer>
            </div>

            {/* Location List */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                {language === 'he' ? 'רשימת משתתפים' : 'Participants List'}
              </Label>
              {activeLocations.map((loc, index) => (
                <div key={loc.email} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <Avatar className="h-8 w-8">
                    <AvatarFallback style={{ backgroundColor: colors[index % colors.length] + '20' }}>
                      {loc.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{loc.name}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(loc.timestamp), { 
                        addSuffix: true,
                        locale: language === 'he' ? he : enUS 
                      })}
                    </p>
                  </div>
                  {loc.email === currentUserEmail && (
                    <Badge className="bg-emerald-600">
                      {language === 'he' ? 'אתה' : 'You'}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </>
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