/**
 * Place Search using OpenStreetMap Nominatim API (Free, no billing)
 * This provides live place search like Zomato/Swiggy/Uber
 */

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search';

/**
 * Search for places by query (city, area, town, etc.)
 * @param {string} query - Search query (e.g., "Madurai", "Koramangala")
 * @param {object} options - Search options
 * @returns {Promise<Array>} Array of place suggestions
 */
export const searchPlaces = async (query, options = {}) => {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const {
    country = 'India',
    limit = 10,
    addressDetails = true,
  } = options;

  try {
    const params = new URLSearchParams({
      q: query,
      countrycodes: 'in', // Limit to India
      format: 'json',
      addressdetails: addressDetails ? '1' : '0',
      limit: limit.toString(),
      // Add user agent as required by Nominatim
    });

    const response = await fetch(`${NOMINATIM_BASE_URL}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'UrbanPulse-App/1.0', // Required by Nominatim
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Place search failed');
    }

    const data = await response.json();

    // Transform Nominatim results to our format
    return data.map(place => {
      const mandal = extractMandal(place.address, place.display_name);
      const district = extractDistrict(place.address, place.display_name);
      return {
        name: place.display_name,
        area: extractComponent(place.address, ['suburb', 'neighbourhood', 'village', 'town', 'city_district', 'locality']),
        city: extractComponent(place.address, ['city', 'town', 'municipality', 'village']),
        mandal: mandal,
        district: district,
        state: extractComponent(place.address, ['state']),
        pincode: extractComponent(place.address, ['postcode']),
        latitude: parseFloat(place.lat),
        longitude: parseFloat(place.lon),
        fullAddress: place.display_name,
        type: place.type,
        importance: place.importance,
        rawAddress: place.address, // Keep raw address for debugging
      };
    }).filter(place => place.state); // Only include places with state (India)
  } catch (error) {
    console.error('Error searching places:', error);
    return [];
  }
};

/**
 * Reverse geocode coordinates to get address details
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @returns {Promise<object>} Place details
 */
export const reverseGeocode = async (latitude, longitude) => {
  try {
    const params = new URLSearchParams({
      lat: latitude.toString(),
      lon: longitude.toString(),
      format: 'json',
      addressdetails: '1',
    });

    const response = await fetch(`${NOMINATIM_BASE_URL.replace('/search', '/reverse')}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'UrbanPulse-App/1.0',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Reverse geocoding failed');
    }

    const data = await response.json();

    if (!data || !data.address) {
      return null;
    }

    const mandal = extractMandal(data.address, data.display_name);
    const district = extractDistrict(data.address, data.display_name);
    return {
      name: data.display_name,
      area: extractComponent(data.address, ['suburb', 'neighbourhood', 'village', 'town', 'city_district', 'locality']),
      city: extractComponent(data.address, ['city', 'town', 'municipality', 'village']),
      mandal: mandal,
      district: district,
      state: extractComponent(data.address, ['state']),
      pincode: extractComponent(data.address, ['postcode']),
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      fullAddress: data.display_name,
      rawAddress: data.address, // Keep raw address for debugging
    };
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return null;
  }
};

/**
 * Extract address component from Nominatim address object
 * For Indian addresses, tries multiple field names
 */
const extractComponent = (address, keys) => {
  if (!address) return '';
  
  for (const key of keys) {
    if (address[key]) {
      return address[key];
    }
  }
  return '';
};

/**
 * Extract mandal from Indian address
 * Mandal typically appears in the full address string with "mandal" suffix
 */
const extractMandal = (address, fullAddress = '') => {
  if (!address && !fullAddress) return '';
  
  // First, try to extract from address object fields
  const mandalFields = ['subdistrict', 'county', 'region'];
  for (const field of mandalFields) {
    if (address && address[field]) {
      const value = address[field];
      // Check if it contains "mandal" (case insensitive)
      if (value.toLowerCase().includes('mandal')) {
        return value;
      }
    }
  }
  
  // Parse from full address string (e.g., "Hyderabad, Saroornagar mandal, Ranga Reddy, Telangana")
  if (fullAddress) {
    const addressParts = fullAddress.split(',').map(part => part.trim());
    
    // Look for parts containing "mandal"
    for (let i = 0; i < addressParts.length; i++) {
      const part = addressParts[i].toLowerCase();
      if (part.includes('mandal')) {
        // Return the part with mandal (e.g., "Saroornagar mandal")
        return addressParts[i];
      }
    }
  }
  
  return '';
};

/**
 * Extract district from Indian address (tries multiple field names)
 * District typically appears after mandal in the address
 */
const extractDistrict = (address, fullAddress = '') => {
  if (!address && !fullAddress) return '';
  
  // First, try to extract from address object fields
  const districtFields = [
    'county',           // Common in OSM
    'district',         // Direct district field
    'region',           // Sometimes used
    'administrative',   // Administrative division
  ];
  
  for (const field of districtFields) {
    if (address && address[field]) {
      let district = address[field];
      // Remove "district" suffix if present (e.g., "Bangalore Urban District" -> "Bangalore Urban")
      if (district.toLowerCase().includes('district')) {
        district = district.replace(/district/gi, '').trim();
      }
      // Don't return if it contains "mandal" (that's mandal, not district)
      if (!district.toLowerCase().includes('mandal')) {
        return district;
      }
    }
  }
  
  // Parse from full address string
  // Format: "City, Mandal, District, State"
  // Example: "Hyderabad, Saroornagar mandal, Ranga Reddy, Telangana"
  if (fullAddress) {
    const addressParts = fullAddress.split(',').map(part => part.trim());
    
    // Find the index of mandal
    let mandalIndex = -1;
    for (let i = 0; i < addressParts.length; i++) {
      if (addressParts[i].toLowerCase().includes('mandal')) {
        mandalIndex = i;
        break;
      }
    }
    
    // District is typically right after mandal
    if (mandalIndex >= 0 && mandalIndex + 1 < addressParts.length) {
      const districtCandidate = addressParts[mandalIndex + 1];
      // Make sure it's not state (states are usually longer names or have specific patterns)
      // Common Indian districts don't contain "mandal" and are usually 2-3 words
      if (!districtCandidate.toLowerCase().includes('mandal') && 
          !districtCandidate.toLowerCase().includes('telangana') &&
          !districtCandidate.toLowerCase().includes('andhra') &&
          !districtCandidate.toLowerCase().includes('karnataka') &&
          !districtCandidate.toLowerCase().includes('maharashtra')) {
        return districtCandidate;
      }
    }
    
    // Fallback: look for common district patterns (2-3 words, not containing mandal/state)
    for (let i = 0; i < addressParts.length; i++) {
      const part = addressParts[i];
      const lowerPart = part.toLowerCase();
      // Skip if it's mandal, state, or pincode
      if (lowerPart.includes('mandal') || 
          lowerPart.includes('telangana') ||
          lowerPart.includes('andhra') ||
          lowerPart.includes('karnataka') ||
          lowerPart.includes('maharashtra') ||
          /^\d{6}$/.test(part)) {
        continue;
      }
      // If it's a 2-3 word name and not a city/area, it might be district
      const wordCount = part.split(/\s+/).length;
      if (wordCount >= 2 && wordCount <= 3) {
        // Check if it's not already used as city or area
        // This is a heuristic - might need refinement
        return part;
      }
    }
  }
  
  return '';
};

/**
 * Debounce function for search
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

