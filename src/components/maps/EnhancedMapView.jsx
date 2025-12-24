import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import { useLanguage } from '../LanguageContext';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Layers, Upload, X, Mountain, TrendingUp, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import L from 'leaflet';
import gpxParser from 'gpxparser';
import 'leaflet/dist/leaflet.css';

// Component to add/remove trail overlay
function TrailOverlay({ enabled }) {
  const map = useMap();
  
  useEffect(() => {
    if (!map) return;
    
    let trailLayer = null;
    
    if (enabled) {
      trailLayer = L.tileLayer('https://tile.waymarkedtrails.org/hiking/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://waymarkedtrails.org">Waymarked Trails</a>',
        opacity: 0.6,
        maxZoom: 18
      });
      trailLayer.addTo(map);
    }
    
    return () => {
      if (trailLayer && map) {
        map.removeLayer(trailLayer);
      }
    };
  }, [enabled, map]);
  
  return null;
}

// Component to fit bounds when GPX is loaded
function FitBounds({ bounds }) {
  const map = useMap();
  
  useEffect(() => {
    if (bounds && map) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, map]);
  
  return null;
}

export default function EnhancedMapView({ 
  center = [31.5, 34.75], 
  zoom = 13,
  waypoints = [],
  polylineColor = '#4f46e5',
  markers = [],
  height = '400px',
  showNavigationButtons = true,
  onNavigate
}) {
  const { language, isRTL } = useLanguage();
  const [trailsEnabled, setTrailsEnabled] = useState(false);
  const [gpxData, setGpxData] = useState(null);
  const [elevationData, setElevationData] = useState([]);
  const [gpxBounds, setGpxBounds] = useState(null);
  const [showControls, setShowControls] = useState(false);
  const fileInputRef = useRef(null);

  const handleGPXUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const gpx = new gpxParser();
        gpx.parse(e.target.result);

        if (!gpx.tracks || gpx.tracks.length === 0) {
          toast.error(language === 'he' ? 'קובץ GPX לא תקין' : 'Invalid GPX file');
          return;
        }

        const track = gpx.tracks[0];
        const points = track.points.map(pt => ({
          lat: pt.lat,
          lon: pt.lon,
          ele: pt.ele || 0
        }));

        setGpxData(points);

        // Calculate bounds
        const lats = points.map(p => p.lat);
        const lons = points.map(p => p.lon);
        setGpxBounds([
          [Math.min(...lats), Math.min(...lons)],
          [Math.max(...lats), Math.max(...lons)]
        ]);

        // Prepare elevation data for chart
        const elevData = points.map((point, idx) => ({
          distance: (idx * 0.1).toFixed(1), // Approximate distance in km
          elevation: point.ele
        }));
        setElevationData(elevData);

        toast.success(language === 'he' ? 'מסלול הועלה בהצלחה!' : 'Route uploaded successfully!');
      } catch (error) {
        console.error('GPX parsing error:', error);
        toast.error(language === 'he' ? 'שגיאה בקריאת קובץ GPX' : 'Error reading GPX file');
      }
    };
    reader.readAsText(file);
  };

  const clearGPX = () => {
    setGpxData(null);
    setElevationData([]);
    setGpxBounds(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const mapCenter = gpxData && gpxData.length > 0 
    ? [gpxData[0].lat, gpxData[0].lon]
    : center;

  return (
    <div className="relative space-y-3">
      {/* Map Container */}
      <div className="relative rounded-xl overflow-hidden border-2 border-indigo-200 shadow-lg" style={{ height }}>
        <MapContainer
          center={mapCenter}
          zoom={zoom}
          style={{ height: '100%', width: '100%' }}
        >
          {/* Base Map */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Trail Overlay */}
          <TrailOverlay enabled={trailsEnabled} />

          {/* Fit bounds for GPX */}
          {gpxBounds && <FitBounds bounds={gpxBounds} />}

          {/* Original Waypoints */}
          {waypoints.length > 1 && (
            <Polyline
              positions={waypoints.map(wp => [wp.latitude, wp.longitude])}
              color={polylineColor}
              weight={4}
              opacity={0.7}
            />
          )}
          
          {waypoints.map((wp, idx) => (
            <Marker key={idx} position={[wp.latitude, wp.longitude]} />
          ))}

          {/* Custom Markers */}
          {markers.map((marker, idx) => (
            <Marker key={`marker-${idx}`} position={marker.position}>
              {marker.popup && <Popup>{marker.popup}</Popup>}
            </Marker>
          ))}

          {/* GPX Track */}
          {gpxData && gpxData.length > 0 && (
            <>
              <Polyline
                positions={gpxData.map(p => [p.lat, p.lon])}
                color="#ef4444"
                weight={5}
                opacity={0.8}
              />
              <Marker position={[gpxData[0].lat, gpxData[0].lon]}>
                <Popup>
                  <div className="text-center font-semibold">
                    {language === 'he' ? 'התחלה' : 'Start'}
                  </div>
                </Popup>
              </Marker>
              <Marker position={[gpxData[gpxData.length - 1].lat, gpxData[gpxData.length - 1].lon]}>
                <Popup>
                  <div className="text-center font-semibold">
                    {language === 'he' ? 'סיום' : 'Finish'}
                  </div>
                </Popup>
              </Marker>
            </>
          )}
        </MapContainer>

        {/* Floating Layer Controls */}
        <div className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'} z-[1000] flex flex-col gap-2`}>
          {/* Layer Control Button */}
          <Button
            size="sm"
            onClick={() => setShowControls(!showControls)}
            className="bg-white hover:bg-gray-100 text-gray-800 shadow-xl border border-gray-300 rounded-full w-10 h-10 p-0 flex items-center justify-center"
          >
            <Layers className="w-5 h-5" />
          </Button>

          {/* Controls Panel */}
          {showControls && (
            <Card className="p-3 shadow-xl min-w-[200px]">
              <div className="space-y-3">
                {/* Trail Toggle */}
                <div className="flex items-center justify-between">
                  <Label className="text-xs flex items-center gap-2">
                    <Mountain className="w-4 h-4 text-emerald-600" />
                    {language === 'he' ? 'שבילי הליכה' : 'Hiking Trails'}
                  </Label>
                  <Button
                    size="sm"
                    variant={trailsEnabled ? "default" : "outline"}
                    onClick={() => setTrailsEnabled(!trailsEnabled)}
                    className="h-7 text-xs"
                  >
                    {trailsEnabled ? (language === 'he' ? 'מופעל' : 'ON') : (language === 'he' ? 'כבוי' : 'OFF')}
                  </Button>
                </div>

                {/* GPX Upload */}
                <div className="space-y-2 border-t pt-2">
                  <Label className="text-xs flex items-center gap-2">
                    <Upload className="w-4 h-4 text-blue-600" />
                    {language === 'he' ? 'העלה מסלול GPX' : 'Upload GPX Route'}
                  </Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".gpx"
                    onChange={handleGPXUpload}
                    className="hidden"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-7 text-xs"
                  >
                    {language === 'he' ? 'בחר קובץ' : 'Choose File'}
                  </Button>
                  {gpxData && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={clearGPX}
                      className="w-full h-7 text-xs gap-1"
                    >
                      <X className="w-3 h-3" />
                      {language === 'he' ? 'נקה' : 'Clear'}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Navigation Buttons */}
          {showNavigationButtons && waypoints.length > 0 && (
            <div className="flex gap-2">
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 shadow-lg gap-2"
                onClick={() => {
                  const target = waypoints[waypoints.length - 1];
                  if (!target) return;
                  const url = `https://www.google.com/maps/dir/?api=1&destination=${target.latitude},${target.longitude}`;
                  window.open(url, '_blank');
                  onNavigate?.('google');
                }}
              >
                <MapPin className="w-4 h-4" />
                Google Maps
              </Button>
            </div>
          )}
        </div>

        {/* GPX Info Badge */}
        {gpxData && (
          <div className={`absolute bottom-3 ${isRTL ? 'right-3' : 'left-3'} z-[1000]`}>
            <Badge className="bg-red-500 shadow-lg">
              {language === 'he' ? 'מסלול GPX פעיל' : 'GPX Route Active'}
            </Badge>
          </div>
        )}
      </div>

      {/* Elevation Profile */}
      {elevationData.length > 0 && (
        <Card className="p-4 border-2 border-blue-200">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                {language === 'he' ? 'פרופיל גובה' : 'Elevation Profile'}
              </h4>
              <div className="flex items-center gap-3 text-xs text-gray-600">
                <span>
                  {language === 'he' ? 'מקס:' : 'Max:'} {Math.max(...elevationData.map(d => d.elevation)).toFixed(0)}m
                </span>
                <span>
                  {language === 'he' ? 'מין:' : 'Min:'} {Math.min(...elevationData.map(d => d.elevation)).toFixed(0)}m
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={elevationData}>
                <defs>
                  <linearGradient id="elevationGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="distance" 
                  label={{ value: language === 'he' ? 'מרחק (ק״מ)' : 'Distance (km)', position: 'insideBottom', offset: -5 }}
                  tick={{ fontSize: 11 }}
                />
                <YAxis 
                  label={{ value: language === 'he' ? 'גובה (מ׳)' : 'Elevation (m)', angle: -90, position: 'insideLeft' }}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  labelFormatter={(value) => `${value} km`}
                  formatter={(value) => [`${value.toFixed(0)}m`, language === 'he' ? 'גובה' : 'Elevation']}
                />
                <Area 
                  type="monotone" 
                  dataKey="elevation" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  fill="url(#elevationGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </div>
  );
}