import React, { createContext, useContext, useState, useEffect } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import { base44 } from '@/api/base44Client';

const GoogleMapsContext = createContext();

const libraries = ['places'];

export function GoogleMapsProvider({ children }) {
  const [apiKey, setApiKey] = useState(null);

  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const { data } = await base44.functions.invoke('getGoogleMapsKey');
        setApiKey(data.apiKey);
      } catch (error) {
        console.error('Failed to load Google Maps API key:', error);
      }
    };
    fetchApiKey();
  }, []);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey || '',
    libraries,
  });

  return (
    <GoogleMapsContext.Provider value={{ isLoaded: isLoaded && apiKey, loadError, apiKey }}>
      {children}
    </GoogleMapsContext.Provider>
  );
}

export function useGoogleMaps() {
  const context = useContext(GoogleMapsContext);
  if (!context) {
    throw new Error('useGoogleMaps must be used within GoogleMapsProvider');
  }
  return context;
}