// Pincode Lookup Utility
// Fetches location data from pincode (India)

export interface PincodeData {
  pincode: string;
  city: string;
  state: string;
  district?: string;
  latitude: number;
  longitude: number;
  area?: string;
}

// Using India Post API (free, no API key required)
export const lookupPincode = async (pincode: string): Promise<PincodeData | null> => {
  if (!pincode || pincode.length !== 6) {
    return null;
  }

  try {
    // Method 1: Using India Post API (if available)
    // This is a free API that provides pincode data
    const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch pincode data');
    }

    const data = await response.json();
    
    if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
      const postOffice = data[0].PostOffice[0];
      
      // Get coordinates using geocoding (fallback to OpenStreetMap Nominatim)
      const coordinates = await getCoordinatesFromAddress(
        `${postOffice.Name}, ${postOffice.District}, ${postOffice.State}, India`
      );

      return {
        pincode: pincode,
        city: postOffice.District || postOffice.Name,
        state: postOffice.State,
        district: postOffice.District,
        area: postOffice.Name,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      };
    }

    return null;
  } catch (error) {
    console.error('Pincode lookup error:', error);
    
    // Fallback: Try to get coordinates directly from pincode using geocoding
    try {
      const coordinates = await getCoordinatesFromAddress(`${pincode}, India`);
      if (coordinates) {
        return {
          pincode: pincode,
          city: '',
          state: '',
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
        };
      }
    } catch (fallbackError) {
      console.error('Fallback geocoding error:', fallbackError);
    }

    return null;
  }
};

// Get coordinates from address using OpenStreetMap Nominatim (free, no API key)
const getCoordinatesFromAddress = async (address: string): Promise<{ latitude: number; longitude: number } | null> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
      {
        headers: {
          'User-Agent': 'Kash.it E-Commerce App', // Required by Nominatim
        },
      }
    );

    if (!response.ok) {
      throw new Error('Geocoding failed');
    }

    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
    }

    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

// Validate Indian pincode format
export const isValidPincode = (pincode: string): boolean => {
  return /^[1-9][0-9]{5}$/.test(pincode);
};

