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
    <>
      <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Radio className="w-4 h-4 text-white animate-pulse" />
            </div>
            <h3 className="font-semibold text-gray-900">
              {language === 'he' ? 'מיקום חי' : 'Live Location'}
            </h3>
            {activeLocations.length > 0 && (
              <Badge className="ml-1 bg-blue-600">
                {activeLocations.length}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Toggle Location Sharing */}
        <div className={`rounded-xl p-3.5 border-2 ${sharingEnabled ? 'bg-emerald-50 border-emerald-300' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${sharingEnabled ? 'bg-emerald-600' : 'bg-gray-400'}`}>
                <MapPin className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <Label className="font-semibold text-sm">
                  {language === 'he' ? 'שתף מיקום' : 'Share Location'}
                </Label>
                <p className="text-xs text-gray-600 mt-0.5">
                  {sharingEnabled 
                    ? (language === 'he' ? 'מעודכן בזמן אמת' : 'Real-time updates')
                    : (language === 'he' ? 'לא פעיל' : 'Not active')}
                </p>
              </div>
            </div>
            <Switch
              checked={sharingEnabled}
              onCheckedChange={handleToggleSharing}
              className="data-[state=checked]:bg-emerald-600"
            />
          </div>
        </div>

        {activeLocations.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <MapPin className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-gray-900 font-medium mb-1">
              {language === 'he' 
                ? 'אף אחד לא משתף מיקום'
                : 'No active locations'}
            </p>
            <p className="text-sm text-gray-500">
              {language === 'he' 
                ? 'הפעל שיתוף כדי לראות אחרים'
                : 'Enable sharing to see others'}
            </p>
          </div>
        ) : (
          <>
            {/* Map */}
            <div className="h-80 rounded-xl overflow-hidden border-2 border-blue-200 shadow-sm">
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
              <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide px-1">
                {language === 'he' ? 'משתתפים פעילים' : 'Active Participants'}
              </Label>
              {activeLocations.map((loc, index) => (
                <div key={loc.email} className="flex items-center gap-2.5 p-2.5 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                  <div 
                    className="w-2.5 h-2.5 rounded-full animate-pulse" 
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <Avatar className="h-8 w-8 border-2" style={{ borderColor: colors[index % colors.length] }}>
                    <AvatarFallback className="text-xs font-semibold" style={{ backgroundColor: colors[index % colors.length] + '20', color: colors[index % colors.length] }}>
                      {loc.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{loc.name}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 flex-shrink-0" />
                      {formatDistanceToNow(new Date(loc.timestamp), { 
                        addSuffix: true,
                        locale: language === 'he' ? he : enUS 
                      })}
                    </p>
                  </div>
                  {loc.email === currentUserEmail && (
                    <Badge className="bg-emerald-600 text-xs px-2">
                      {language === 'he' ? 'אני' : 'Me'}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Privacy Notice */}
        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs text-amber-800 leading-relaxed">
            <strong>{language === 'he' ? '🔒 פרטיות' : '🔒 Privacy'}:</strong>{' '}
            {language === 'he' 
              ? 'משותף רק עם משתתפי הטיול'
              : 'Shared only with trip participants'}
          </p>
        </div>
      </div>
    </>
  );
}