import React, { createContext, useContext, useState, useEffect } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import { base44 } from '@/api/base44Client';

const GoogleMapsContext = createContext(null);

const libraries = ['places'];

function GoogleMapsLoader({ apiKey, mapLanguage, children }) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    language: mapLanguage === 'he' ? 'iw' : mapLanguage,
    region: mapLanguage === 'he' ? 'IL' : undefined,
  });

  return (
    <GoogleMapsContext.Provider value={{ isLoaded, loadError, apiKey }}>
      {children}
    </GoogleMapsContext.Provider>
  );
}

export function GoogleMapsProvider({ children }) {
  const [apiKey, setApiKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialLanguage] = useState(() => localStorage.getItem('language') || 'he');

  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);
        if (isLocal) {
          setApiKey(null);
          setLoading(false);
          return;
        }
        const response = await base44.functions.invoke('getGoogleMapsKey', {});
        if (response?.data?.apiKey) {
          setApiKey(response.data.apiKey);
        } else if (response?.apiKey) {
          setApiKey(response.apiKey);
        } else {
          setError('No API key returned');
        }
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    };
    fetchApiKey();
  }, []);

  if (loading || !apiKey) {
    return (
      <GoogleMapsContext.Provider value={{ isLoaded: false, loadError: error, apiKey: null }}>
        {children}
      </GoogleMapsContext.Provider>
    );
  }

  return (
    <GoogleMapsLoader apiKey={apiKey} mapLanguage={initialLanguage}>
      {children}
    </GoogleMapsLoader>
  );
}

export function useGoogleMaps() {
  const context = useContext(GoogleMapsContext);
  if (!context) {
    throw new Error('useGoogleMaps must be used within GoogleMapsProvider');
  }
  return context;
}
