// Helper function to detect user's region based on coordinates
export function getRegionFromCoordinates(lat, lon) {
  // Israel approximate region boundaries
  const regions = {
    eilat: { minLat: 29.0, maxLat: 30.0, minLon: 34.5, maxLon: 35.5 },
    negev: { minLat: 30.0, maxLat: 31.3, minLon: 34.3, maxLon: 35.5 },
    south: { minLat: 31.3, maxLat: 31.8, minLon: 34.5, maxLon: 35.0 },
    jerusalem: { minLat: 31.6, maxLat: 32.0, minLon: 34.9, maxLon: 35.4 },
    center: { minLat: 31.8, maxLat: 32.5, minLon: 34.7, maxLon: 35.2 },
    north: { minLat: 32.5, maxLat: 33.5, minLon: 35.0, maxLon: 36.0 },
  };

  for (const [region, bounds] of Object.entries(regions)) {
    if (
      lat >= bounds.minLat &&
      lat <= bounds.maxLat &&
      lon >= bounds.minLon &&
      lon <= bounds.maxLon
    ) {
      return region;
    }
  }

  return 'center'; // default fallback
}

export function detectUserLocation(onSuccess, onError) {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const region = getRegionFromCoordinates(latitude, longitude);
        onSuccess(region, latitude, longitude);
      },
      (error) => {
        console.log('Geolocation error:', error);
        if (onError) onError(error);
      },
      { timeout: 5000, maximumAge: 300000 }
    );
  } else {
    console.log('Geolocation not supported');
    if (onError) onError(new Error('Geolocation not supported'));
  }
}

// Detect country from user's location coordinates
export async function detectCountryFromLocation() {
  return new Promise((resolve) => {
    if (!('geolocation' in navigator)) {
      resolve('israel');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // Map coordinates to countries
        if (latitude >= 29 && latitude <= 33.5 && longitude >= 34 && longitude <= 36) {
          resolve('israel');
        } else if (latitude >= 41 && latitude <= 51 && longitude >= -5 && longitude <= 10) {
          if (longitude >= -5 && longitude <= 3) {
            if (latitude >= 43 && latitude <= 51 && longitude >= -5 && longitude <= 5) {
              resolve('france');
            } else if (latitude >= 36 && latitude <= 44 && longitude >= -10 && longitude <= 4) {
              resolve('spain');
            } else {
              resolve('france');
            }
          } else if (latitude >= 47 && latitude <= 55 && longitude >= 5 && longitude <= 15) {
            resolve('germany');
          } else if (latitude >= 36 && latitude <= 48 && longitude >= 6 && longitude <= 19) {
            resolve('italy');
          } else {
            resolve('israel');
          }
        } else if (latitude >= 36 && latitude <= 48 && longitude >= 6 && longitude <= 19) {
          resolve('italy');
        } else if (latitude >= 47 && latitude <= 55 && longitude >= 5 && longitude <= 15) {
          resolve('germany');
        } else if (latitude >= 36 && latitude <= 44 && longitude >= -10 && longitude <= 4) {
          resolve('spain');
        } else if (latitude >= 41 && latitude <= 51 && longitude >= -5 && longitude <= 6) {
          resolve('france');
        } else if (latitude >= 24 && latitude <= 49 && longitude >= -125 && longitude <= -66) {
          resolve('usa');
        } else if (latitude >= 41 && latitude <= 83 && longitude >= -141 && longitude <= -52) {
          resolve('canada');
        } else if (latitude >= 36 && latitude <= 43 && longitude >= 25 && longitude <= 29) {
          resolve('greece');
        } else if (latitude >= 36 && latitude <= 42 && longitude >= -9 && longitude <= -6) {
          resolve('portugal');
        } else if (latitude >= 50 && latitude <= 53 && longitude >= -10 && longitude <= 2) {
          resolve('uk');
        } else {
          resolve('israel');
        }
      },
      () => {
        resolve('israel');
      },
      { timeout: 5000 }
    );
  });
}