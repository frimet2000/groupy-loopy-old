import React from 'react';
import { GoogleMap, useJsApiLoader, Marker, Polyline } from '@react-google-maps/api';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

export function useGoogleMaps() {
  return useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ['places']
  });
}

export default function GoogleMapWrapper({ 
  center, 
  zoom = 13, 
  onClick, 
  markers = [], 
  polyline = null,
  className = "h-full w-full"
}) {
  const { isLoaded, loadError } = useGoogleMaps();

  if (loadError) {
    return <div className="flex items-center justify-center h-full text-red-600">Error loading maps</div>;
  }

  if (!isLoaded) {
    return <div className="flex items-center justify-center h-full">Loading maps...</div>;
  }

  return (
    <GoogleMap
      mapContainerClassName={className}
      center={center}
      zoom={zoom}
      onClick={onClick}
      options={{
        streetViewControl: false,
        mapTypeControl: true,
        fullscreenControl: true,
      }}
    >
      {markers.map((marker, idx) => (
        <Marker
          key={idx}
          position={marker.position}
          label={marker.label}
          title={marker.title}
        />
      ))}
      
      {polyline && (
        <Polyline
          path={polyline.path}
          options={{
            strokeColor: polyline.color || '#10b981',
            strokeWeight: polyline.weight || 3,
            strokeOpacity: polyline.opacity || 0.7,
          }}
        />
      )}
    </GoogleMap>
  );
}