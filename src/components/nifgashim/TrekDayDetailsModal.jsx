// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  X, Mountain, MapPin, Heart, Users, Shield, Phone, Mail, 
  TrendingUp, TrendingDown, Sunrise, Sunset, CloudSun, Info, Navigation
} from 'lucide-react';
import { format } from 'date-fns';
import { GoogleMap, Marker, Polyline } from '@react-google-maps/api';
import { base44 } from '@/api/base44Client';
import { useGoogleMaps } from '../maps/GoogleMapsProvider';

export default function TrekDayDetailsModal({ day, memorial, organizers, tripId, onClose, language, isRTL }) {
  const [mapCenter, setMapCenter] = useState({ lat: 31.7683, lng: 35.2137 });
  const [liveLocations, setLiveLocations] = useState([]);
  const { isLoaded } = useGoogleMaps();

  // Get live locations
  useEffect(() => {
    const fetchLiveLocations = async () => {
      if (!tripId) return;
      try {
        const trips = await base44.entities.Trip.filter({ id: tripId });
        const trip = trips[0];
        if (trip?.live_locations) {
          setLiveLocations(trip.live_locations.filter(loc => loc.sharing_enabled));
        }
      } catch (e) {
        console.error('Failed to fetch live locations:', e);
      }
    };
    fetchLiveLocations();
    const interval = setInterval(fetchLiveLocations, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [tripId]);

  // Set map center from waypoints
  useEffect(() => {
    if (day.waypoints?.length > 0) {
      const firstWaypoint = day.waypoints[0];
      if (firstWaypoint.latitude && firstWaypoint.longitude) {
        setMapCenter({ lat: firstWaypoint.latitude, lng: firstWaypoint.longitude });
      }
    }
  }, [day]);

  const mapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: true,
    streetViewControl: false,
    fullscreenControl: true,
    styles: [
      {
        featureType: 'all',
        elementType: 'geometry',
        stylers: [{ color: '#242f3e' }]
      },
      {
        featureType: 'all',
        elementType: 'labels.text.stroke',
        stylers: [{ lightness: -80 }]
      },
      {
        featureType: 'administrative',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#746855' }]
      },
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: '#17263c' }]
      }
    ]
  };

  const pathCoordinates = day.waypoints?.map(wp => ({
    lat: wp.latitude,
    lng: wp.longitude
  })) || [];

  return (
    <AnimatePresence>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className={`max-w-6xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white border-2 border-purple-500/50 ${isRTL ? 'rtl' : 'ltr'}`}>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-lg font-black">{day.day_number}</span>
              </div>
              {day.daily_title || (language === 'he' ? `יום ${day.day_number}` : `Day ${day.day_number}`)}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="info" className="mt-4">
            <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
              <TabsTrigger value="info" className="data-[state=active]:bg-purple-600">
                <Info className="w-4 h-4 mr-2" />
                {language === 'he' ? 'מידע' : 'Info'}
              </TabsTrigger>
              <TabsTrigger value="map" className="data-[state=active]:bg-purple-600">
                <MapPin className="w-4 h-4 mr-2" />
                {language === 'he' ? 'מפה' : 'Map'}
              </TabsTrigger>
              {memorial && (
                <TabsTrigger value="memorial" className="data-[state=active]:bg-red-600">
                  <Heart className="w-4 h-4 mr-2" />
                  {language === 'he' ? 'הנצחה' : 'Memorial'}
                </TabsTrigger>
              )}
              {!memorial && organizers?.length > 0 && (
                <TabsTrigger value="organizers" className="data-[state=active]:bg-purple-600">
                  <Shield className="w-4 h-4 mr-2" />
                  {language === 'he' ? 'מנהלים' : 'Organizers'}
                </TabsTrigger>
              )}
            </TabsList>

            {/* Info Tab */}
            <TabsContent value="info" className="space-y-4 mt-4">
              {/* Description */}
              {day.daily_description && (
                <Card className="bg-slate-800/50 border-purple-500/30">
                  <CardContent className="pt-6">
                    <p className="text-purple-100 leading-relaxed">{day.daily_description}</p>
                  </CardContent>
                </Card>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {day.daily_distance_km && (
                  <Card className="bg-gradient-to-br from-cyan-900/50 to-blue-900/50 border-cyan-500/30">
                    <CardContent className="pt-4 text-center">
                      <MapPin className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">{day.daily_distance_km}</div>
                      <div className="text-xs text-cyan-300">{language === 'he' ? 'ק״מ' : 'km'}</div>
                    </CardContent>
                  </Card>
                )}

                {day.elevation_gain_m && (
                  <Card className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 border-green-500/30">
                    <CardContent className="pt-4 text-center">
                      <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">{day.elevation_gain_m}</div>
                      <div className="text-xs text-green-300">{language === 'he' ? 'עליה (מ״)' : 'Elevation (m)'}</div>
                    </CardContent>
                  </Card>
                )}

                {day.highest_point_m && (
                  <Card className="bg-gradient-to-br from-orange-900/50 to-red-900/50 border-orange-500/30">
                    <CardContent className="pt-4 text-center">
                      <Mountain className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">{day.highest_point_m}</div>
                      <div className="text-xs text-orange-300">{language === 'he' ? 'נקודה גבוהה' : 'Highest'}</div>
                    </CardContent>
                  </Card>
                )}

                {day.lowest_point_m && (
                  <Card className="bg-gradient-to-br from-blue-900/50 to-indigo-900/50 border-blue-500/30">
                    <CardContent className="pt-4 text-center">
                      <TrendingDown className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">{day.lowest_point_m}</div>
                      <div className="text-xs text-blue-300">{language === 'he' ? 'נקודה נמוכה' : 'Lowest'}</div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Additional Info */}
              <div className="grid sm:grid-cols-2 gap-4">
                {day.date && (
                  <Card className="bg-slate-800/50 border-purple-500/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Sunrise className="w-4 h-4 text-purple-400" />
                        {language === 'he' ? 'תאריך' : 'Date'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-white font-semibold">
                        {format(new Date(day.date), 'EEEE, dd MMMM yyyy')}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {day.estimated_weather && (
                  <Card className="bg-slate-800/50 border-purple-500/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <CloudSun className="w-4 h-4 text-purple-400" />
                        {language === 'he' ? 'מזג אוויר משוער' : 'Estimated Weather'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-white">{day.estimated_weather}</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Equipment */}
              {day.equipment?.length > 0 && (
                <Card className="bg-slate-800/50 border-purple-500/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-purple-400" />
                      {language === 'he' ? 'ציוד מומלץ' : 'Recommended Equipment'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {day.equipment.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg">
                          <div className="w-2 h-2 rounded-full bg-purple-400" />
                          <span className="text-purple-100 text-sm">{item.item}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Map Tab */}
            <TabsContent value="map" className="mt-4">
              <Card className="bg-slate-800/50 border-purple-500/30 overflow-hidden">
                <CardContent className="p-0">
                  {isLoaded && (
                    <GoogleMap
                      mapContainerStyle={{ width: '100%', height: '500px' }}
                      center={mapCenter}
                      zoom={13}
                      options={mapOptions}
                    >
                      {/* Route Polyline */}
                      {pathCoordinates.length > 0 && (
                        <Polyline
                          path={pathCoordinates}
                          options={{
                            strokeColor: '#a855f7',
                            strokeOpacity: 0.8,
                            strokeWeight: 4
                          }}
                        />
                      )}

                      {/* Waypoint Markers */}
                      {day.waypoints?.map((wp, idx) => (
                        <Marker
                          key={idx}
                          position={{ lat: wp.latitude, lng: wp.longitude }}
                          label={{
                            text: `${idx + 1}`,
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: 'bold'
                          }}
                        />
                      ))}

                      {/* Live Location Markers */}
                      {liveLocations.map((loc, idx) => (
                        <Marker
                          key={`live-${idx}`}
                          position={{ lat: loc.latitude, lng: loc.longitude }}
                          icon={{
                            path: window.google?.maps?.SymbolPath?.CIRCLE,
                            scale: 8,
                            fillColor: '#10b981',
                            fillOpacity: 1,
                            strokeColor: '#ffffff',
                            strokeWeight: 2
                          }}
                          title={loc.name}
                        />
                      ))}
                    </GoogleMap>
                  )}
                </CardContent>
              </Card>

              {liveLocations.length > 0 && (
                <div className="mt-4 text-sm text-purple-300 flex items-center gap-2">
                  <Navigation className="w-4 h-4" />
                  {language === 'he' 
                    ? `${liveLocations.length} משתתפים משתפים את מיקומם בזמן אמת` 
                    : `${liveLocations.length} participants sharing live location`}
                </div>
              )}
            </TabsContent>

            {/* Memorial Tab */}
            {memorial && (
              <TabsContent value="memorial" className="mt-4 space-y-4">
                <Card className="bg-gradient-to-br from-red-950/50 to-pink-950/50 border-red-500/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-300">
                      <Heart className="w-5 h-5 fill-red-400" />
                      {memorial.fallen_name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {memorial.image_url && (
                      <img 
                        src={memorial.image_url} 
                        alt={memorial.fallen_name}
                        className="w-full max-w-sm mx-auto rounded-lg shadow-2xl"
                      />
                    )}

                    {memorial.date_of_fall && (
                      <div>
                        <p className="text-sm text-red-300">{language === 'he' ? 'תאריך נפילה' : 'Date of Fall'}</p>
                        <p className="text-white font-semibold">{format(new Date(memorial.date_of_fall), 'dd/MM/yyyy')}</p>
                      </div>
                    )}

                    {memorial.place_of_fall && (
                      <div>
                        <p className="text-sm text-red-300">{language === 'he' ? 'מקום נפילה' : 'Place of Fall'}</p>
                        <p className="text-white">{memorial.place_of_fall}</p>
                      </div>
                    )}

                    {memorial.story && (
                      <div>
                        <Separator className="my-4 bg-red-500/30" />
                        <p className="text-purple-100 leading-relaxed whitespace-pre-wrap">{memorial.story}</p>
                      </div>
                    )}

                    {memorial.dedications?.length > 0 && (
                      <div>
                        <Separator className="my-4 bg-red-500/30" />
                        <h4 className="text-sm font-semibold text-red-300 mb-3">
                          {language === 'he' ? 'הקדשות' : 'Dedications'}
                        </h4>
                        <div className="space-y-2">
                          {memorial.dedications.map((ded, idx) => (
                            <Card key={idx} className="bg-white/5 border-white/10">
                              <CardContent className="p-3">
                                <p className="text-xs text-purple-300 mb-1">{ded.author_name}</p>
                                <p className="text-sm text-white">{ded.content}</p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Organizers Tab */}
            {!memorial && organizers?.length > 0 && (
              <TabsContent value="organizers" className="mt-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  {organizers.map((org, idx) => (
                    <Card key={idx} className="bg-slate-800/50 border-purple-500/30">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Shield className="w-5 h-5 text-purple-400" />
                          {org.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {org.email && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-4 h-4 text-purple-400" />
                            <a href={`mailto:${org.email}`} className="text-purple-300 hover:underline">
                              {org.email}
                            </a>
                          </div>
                        )}
                        {org.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4 text-purple-400" />
                            <a href={`tel:${org.phone}`} className="text-purple-300 hover:underline">
                              {org.phone}
                            </a>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            )}
          </Tabs>

          <Button
            onClick={onClose}
            className="mt-6 w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {language === 'he' ? 'סגור' : 'Close'}
          </Button>
        </DialogContent>
      </Dialog>
    </AnimatePresence>
  );
}