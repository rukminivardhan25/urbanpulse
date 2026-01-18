const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

/**
 * Search for nearby places using OpenStreetMap Nominatim API
 * @param {number} latitude - User's latitude
 * @param {number} longitude - User's longitude
 * @param {string} placeType - Type of place (hospital, police, fire_station)
 * @param {number} radius - Search radius in meters (default: 5000 = 5km)
 * @returns {Promise<Array>} Array of nearby places
 */
export const searchNearbyPlaces = async (latitude, longitude, placeType, radius = 5000) => {
  try {
    const queries = {
      hospital: 'hospital',
      police: 'police',
      fire_station: 'fire_station',
      ambulance: 'ambulance',
    };

    const query = queries[placeType] || placeType;

    // Using Nominatim search API with bbox for nearby search
    const bbox = calculateBoundingBox(latitude, longitude, radius / 1000); // Convert to km
    
    const params = new URLSearchParams({
      q: query,
      format: 'json',
      limit: '10',
      bounded: '1',
      viewbox: `${bbox.minLon},${bbox.maxLat},${bbox.maxLon},${bbox.minLat}`, // minLon, maxLat, maxLon, minLat
      'accept-language': 'en',
    });
    
    const response = await fetch(`${NOMINATIM_BASE_URL}/search?${params.toString()}`, {
      headers: {
        'User-Agent': 'UrbanPulse App', // Required by Nominatim
      },
    });

    const data = await response.json();
    
    if (data && data.length > 0) {
      // Calculate distance for each result and sort by distance
      const placesWithDistance = data.map((place) => {
        const placeLat = parseFloat(place.lat);
        const placeLon = parseFloat(place.lon);
        const distance = calculateDistance(latitude, longitude, placeLat, placeLon);
        
        return {
          id: place.place_id,
          name: place.display_name.split(',')[0], // First part of display name
          fullName: place.display_name,
          latitude: placeLat,
          longitude: placeLon,
          address: place.display_name,
          distance: distance, // in km
          distanceFormatted: formatDistance(distance),
          type: place.type,
          category: place.category,
        };
      });

      // Sort by distance (nearest first)
      placesWithDistance.sort((a, b) => a.distance - b.distance);

      return placesWithDistance;
    }

    return [];
  } catch (error) {
    console.error(`Error searching for nearby ${placeType}:`, error);
    return [];
  }
};

/**
 * Get nearby emergency services (hospital, police, fire station)
 * @param {number} latitude - User's latitude
 * @param {number} longitude - User's longitude
 * @returns {Promise<Object>} Object with nearby hospital, police, and fire station
 */
export const getNearbyEmergencyServices = async (latitude, longitude) => {
  try {
    const [hospitals, policeStations, fireStations] = await Promise.all([
      searchNearbyPlaces(latitude, longitude, 'hospital'),
      searchNearbyPlaces(latitude, longitude, 'police'),
      searchNearbyPlaces(latitude, longitude, 'fire_station'),
    ]);

    return {
      hospital: hospitals.length > 0 ? hospitals[0] : null,
      police: policeStations.length > 0 ? policeStations[0] : null,
      fireStation: fireStations.length > 0 ? fireStations[0] : null,
    };
  } catch (error) {
    console.error('Error getting nearby emergency services:', error);
    return {
      hospital: null,
      police: null,
      fireStation: null,
    };
  }
};

/**
 * Reverse geocoding - Get address from coordinates
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @returns {Promise<string>} Address string
 */
export const reverseGeocode = async (latitude, longitude) => {
  try {
    const params = new URLSearchParams({
      lat: latitude.toString(),
      lon: longitude.toString(),
      format: 'json',
      'accept-language': 'en',
    });
    
    const response = await fetch(`${NOMINATIM_BASE_URL}/reverse?${params.toString()}`, {
      headers: {
        'User-Agent': 'UrbanPulse App',
      },
    });

    const data = await response.json();
    
    if (data && data.display_name) {
      return data.display_name;
    }
    return '';
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return '';
  }
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - First latitude
 * @param {number} lon1 - First longitude
 * @param {number} lat2 - Second latitude
 * @param {number} lon2 - Second longitude
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
};

/**
 * Calculate bounding box for search
 * @param {number} lat - Center latitude
 * @param {number} lon - Center longitude
 * @param {number} radiusKm - Radius in kilometers
 * @returns {Object} Bounding box coordinates
 */
const calculateBoundingBox = (lat, lon, radiusKm) => {
  const latKm = 111.0; // 1 degree latitude ≈ 111 km
  const lonKm = 111.0 * Math.cos(deg2rad(lat)); // 1 degree longitude varies by latitude

  return {
    minLat: lat - radiusKm / latKm,
    maxLat: lat + radiusKm / latKm,
    minLon: lon - radiusKm / lonKm,
    maxLon: lon + radiusKm / lonKm,
  };
};

/**
 * Convert degrees to radians
 */
const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

/**
 * Format distance for display
 * @param {number} distance - Distance in kilometers
 * @returns {string} Formatted distance string
 */
const formatDistance = (distance) => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`;
  }
  return `${distance.toFixed(1)} km`;
};

