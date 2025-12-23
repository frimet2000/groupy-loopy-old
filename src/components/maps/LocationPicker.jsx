import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../LanguageContext';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition }) {
  const map = useMapEvents({
    click(e) {
      // Use exact coordinates without any rounding
      const exactLat = e.latlng.lat;
      const exactLng = e.latlng.lng;
      setPosition([exactLat, exactLng]);
    },
  });

  useEffect(() => {
    if (position) {
      // Pan to position smoothly without changing zoom
      map.panTo(position, { animate: false });
    }
  }, [position, map]);

  return position ? <Marker position={position} /> : null;
}

export default function LocationPicker({ isOpen, onClose, initialLat, initialLng, locationName, onConfirm }) {
  const { language } = useLanguage();
  const [position, setPosition] = useState(
    initialLat && initialLng ? [initialLat, initialLng] : [31.5, 34.9] // Default to center of Israel
  );

  useEffect(() => {
    if (initialLat && initialLng) {
      setPosition([initialLat, initialLng]);
    }
  }, [initialLat, initialLng]);

  const handleConfirm = () => {
    if (!position) return;
    const [exactLat, exactLng] = position;
    console.log('LocationPicker sending coordinates:', exactLat, exactLng);
    if (typeof onConfirm === 'function') onConfirm(exactLat, exactLng);
    if (typeof onClose === 'function') onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>
            {language === 'he' ? 'בחר את מיקום ההתחלה' : 'Select Starting Point'}
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-2">
            {language === 'he' 
              ? `לחץ על המפה כדי לסמן את נקודת ההתחלה של הטיול ב${locationName || 'מיקום זה'}`
              : `Click on the map to mark the starting point of the trip at ${locationName || 'this location'}`}
          </p>
        </DialogHeader>

        <div className="flex-1 rounded-lg overflow-hidden border border-gray-200 h-[calc(80vh-180px)]">
          <MapContainer
            center={position}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker position={position} setPosition={setPosition} />
          </MapContainer>
        </div>

        <div className="text-sm text-gray-600 font-mono">
          {language === 'he' ? 'קואורדינטות:' : 'Coordinates:'} {position[0].toFixed(8)}, {position[1].toFixed(8)}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {language === 'he' ? 'ביטול' : 'Cancel'}
          </Button>
          <Button type="button" onClick={handleConfirm} className="bg-emerald-600 hover:bg-emerald-700">
            {language === 'he' ? 'אישור מיקום' : 'Confirm Location'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}