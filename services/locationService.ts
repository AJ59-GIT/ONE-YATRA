
import { getCurrentUser } from "./authService";

export interface LocationSuggestion {
  id: string;
  city: string; // Main display text (City Name OR Address Label)
  state: string; // Subtitle (State/Country OR Full Address Line)
  country: string;
  code?: string; // Airport code
  type: 'CITY' | 'AIRPORT' | 'SAVED';
  fullAddress?: string; // Explicit full address for booking
}

// Mock dataset for Indian Context
const LOCATIONS: LocationSuggestion[] = [
  // Major Metros (Airports)
  { id: 'DEL', city: 'New Delhi', state: 'Delhi', country: 'India', code: 'DEL', type: 'AIRPORT' },
  { id: 'BOM', city: 'Mumbai', state: 'Maharashtra', country: 'India', code: 'BOM', type: 'AIRPORT' },
  { id: 'BLR', city: 'Bengaluru', state: 'Karnataka', country: 'India', code: 'BLR', type: 'AIRPORT' },
  { id: 'MAA', city: 'Chennai', state: 'Tamil Nadu', country: 'India', code: 'MAA', type: 'AIRPORT' },
  { id: 'CCU', city: 'Kolkata', state: 'West Bengal', country: 'India', code: 'CCU', type: 'AIRPORT' },
  { id: 'HYD', city: 'Hyderabad', state: 'Telangana', country: 'India', code: 'HYD', type: 'AIRPORT' },
  
  // Other Major Cities
  { id: 'GOI', city: 'Goa', state: 'Goa', country: 'India', code: 'GOI', type: 'AIRPORT' },
  { id: 'PNQ', city: 'Pune', state: 'Maharashtra', country: 'India', code: 'PNQ', type: 'AIRPORT' },
  { id: 'AMD', city: 'Ahmedabad', state: 'Gujarat', country: 'India', code: 'AMD', type: 'AIRPORT' },
  { id: 'JAI', city: 'Jaipur', state: 'Rajasthan', country: 'India', code: 'JAI', type: 'AIRPORT' },
  { id: 'LKO', city: 'Lucknow', state: 'Uttar Pradesh', country: 'India', code: 'LKO', type: 'AIRPORT' },
  { id: 'COK', city: 'Kochi', state: 'Kerala', country: 'India', code: 'COK', type: 'AIRPORT' },
  { id: 'IXC', city: 'Chandigarh', state: 'Punjab', country: 'India', code: 'IXC', type: 'AIRPORT' },
  { id: 'ATQ', city: 'Amritsar', state: 'Punjab', country: 'India', code: 'ATQ', type: 'AIRPORT' },
  
  // Tourist / Non-Airport centric (Simulated)
  { id: 'C_AGR', city: 'Agra', state: 'Uttar Pradesh', country: 'India', type: 'CITY' },
  { id: 'C_VNS', city: 'Varanasi', state: 'Uttar Pradesh', country: 'India', type: 'CITY' },
  { id: 'C_SHM', city: 'Shimla', state: 'Himachal Pradesh', country: 'India', type: 'CITY' },
  { id: 'C_MNL', city: 'Manali', state: 'Himachal Pradesh', country: 'India', type: 'CITY' },
  { id: 'C_UDR', city: 'Udaipur', state: 'Rajasthan', country: 'India', type: 'CITY' },
  { id: 'C_RSH', city: 'Rishikesh', state: 'Uttarakhand', country: 'India', type: 'CITY' },
];

export const searchLocations = async (query: string): Promise<LocationSuggestion[]> => {
  // Simulate network delay for realistic feel
  await new Promise(resolve => setTimeout(resolve, 150));
  
  const q = query.toLowerCase();
  
  // 1. Fetch Saved Addresses from User Profile
  const user = getCurrentUser();
  const savedSuggestions: LocationSuggestion[] = [];
  
  if (user && user.addresses) {
    user.addresses.forEach(addr => {
      const label = addr.label || (addr.type === 'OTHER' ? 'Custom Location' : addr.type);
      const fullAddr = `${addr.line1}, ${addr.city}`;
      
      // Match against Label, City, or Address Line
      if (label.toLowerCase().includes(q) || 
          addr.city.toLowerCase().includes(q) || 
          addr.line1.toLowerCase().includes(q)) {
            
        savedSuggestions.push({
          id: addr.id,
          city: label, // Display Title
          state: fullAddr, // Display Subtitle
          country: 'India',
          type: 'SAVED',
          fullAddress: `${addr.line1}, ${addr.line2 ? addr.line2 + ', ' : ''}${addr.city}, ${addr.state} - ${addr.zip}`
        });
      }
    });
  }

  // 2. Filter Mock Locations
  const apiMatches = LOCATIONS.filter(l => 
    l.city.toLowerCase().includes(q) || 
    l.code?.toLowerCase().includes(q) ||
    l.state.toLowerCase().includes(q)
  );

  // 3. Combine (Saved first)
  return [...savedSuggestions, ...apiMatches];
};

export const getCityFromCoordinates = async (lat: number, lng: number): Promise<string | null> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    // Return mock if no API key is available in dev environment
    console.warn("API Key missing for Geocoding");
    return null;
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
    );
    const data = await response.json();
    
    if (data.status === 'OK' && data.results.length > 0) {
      // Prioritize finding the 'locality' (City)
      for (const component of data.results[0].address_components) {
        if (component.types.includes('locality')) {
            return component.long_name;
        }
      }
      // Fallback: Administrative Area Level 2 (District) or 1 (State) or just the formatted address part
      return data.results[0].address_components[0].long_name;
    }
    return null;
  } catch (error) {
    console.error("Error reverse geocoding:", error);
    return null;
  }
};
