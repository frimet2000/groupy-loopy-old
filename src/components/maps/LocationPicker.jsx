import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../LanguageContext';
import { Loader2 } from 'lucide-react';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
const LIBRARIES = ['places'];

export default function LocationPicker({ isOpen, onClose, initialLat, initialLng, locationName, onConfirm }) {
  const { language } = useLanguage();
  const [position, setPosition] = useState(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : { lat: 31.5, lng: 34.9 }
  );
  const [map, setMap] = useState(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
    preventGoogleFontsLoading: true,
  });

  useEffect(() => {
    if (initialLat && initialLng) {
      setPosition({ lat: initialLat, lng: initialLng });
    }
  }, [initialLat, initialLng]);

  const onLoad = useCallback((map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleMapClick = useCallback((e) => {
    // Get exact coordinates from click
    const exactLat = e.latLng.lat();
    const exactLng = e.latLng.lng();
    setPosition({ lat: exactLat, lng: exactLng });
  }, []);

  const handleConfirm = () => {
    // Return exact coordinates without any modifications
    onConfirm(position.lat, position.lng);
    onClose();
  };

  if (loadError) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-red-600">
              {language === 'he' ? 'שגיאה בטעינת Google Maps' : 'Google Maps Loading Error'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-700">
              {language === 'he' 
                ? 'לא ניתן לטעון את Google Maps. נא לוודא:'
                : 'Unable to load Google Maps. Please verify:'}
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
              <li>
                {language === 'he' 
                  ? 'ה-API Key תקף ומוגדר ב-Google Cloud Console'
                  : 'API Key is valid and configured in Google Cloud Console'}
              </li>
              <li>
                {language === 'he' 
                  ? 'Maps JavaScript API מופעל בפרויקט'
                  : 'Maps JavaScript API is enabled in the project'}
              </li>
              <li>
                {language === 'he' 
                  ? 'חשבון חיוב פעיל מקושר לפרויקט'
                  : 'Active billing account is linked to the project'}
              </li>
              <li>
                {language === 'he' 
                  ? 'הדומיין מורשה להשתמש ב-API Key'
                  : 'Domain is authorized to use the API Key'}
              </li>
            </ul>
            <p className="text-xs text-gray-500">
              {language === 'he' 
                ? 'ניתן להגדיר את ה-API Key ב: Google Cloud Console → APIs & Services → Credentials'
                : 'Configure API Key at: Google Cloud Console → APIs & Services → Credentials'}
            </p>
          </div>
          <DialogFooter>
            <Button onClick={onClose} variant="outline">
              {language === 'he' ? 'סגור' : 'Close'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

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
          {!isLoaded ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-50">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
          ) : (
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '100%' }}
              center={position}
              zoom={13}
              onLoad={onLoad}
              onUnmount={onUnmount}
              onClick={handleMapClick}
              options={{
                streetViewControl: false,
                mapTypeControl: true,
                fullscreenControl: false,
              }}
            >
              <Marker position={position} />
            </GoogleMap>
          )}
        </div>

        <div className="text-sm text-gray-600 font-mono">
          {language === 'he' ? 'קואורדינטות:' : 'Coordinates:'} {position.lat.toFixed(8)}, {position.lng.toFixed(8)}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {language === 'he' ? 'ביטול' : 'Cancel'}
          </Button>
          <Button onClick={handleConfirm} className="bg-emerald-600 hover:bg-emerald-700">
            {language === 'he' ? 'אישור מיקום' : 'Confirm Location'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}