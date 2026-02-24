/**
 * Deep Link Service
 * Handles construction of Universal Links, URI Schemes, and Android Intents.
 * Includes security validation and parameter encoding.
 */

// Allowlist of supported providers
const ALLOWED_PROVIDERS = [
  'Uber', 'Ola', 'Rapido', 'BluSmart', 
  'IndiGo', 'Air India', 'Vistara', 
  'IRCTC', 'Vande Bharat', 
  'RedBus', 'ZingBus', 'IntrCity'
];

interface DeepLinkResult {
  url: string;
  fallbackUrl: string;
  androidIntent?: string;
  isUniversal: boolean;
}

export const sanitizeInput = (input: string): string => {
  return encodeURIComponent(input.trim());
};

export const trackDeepLinkClick = (provider: string, status: 'attempted' | 'fallback') => {
  // Simulation of analytics event
  console.log(`[Analytics] DeepLink Clicked: ${provider} | Status: ${status} | Timestamp: ${Date.now()}`);
};

export const generateDeepLink = (
  provider: string,
  mode: string,
  origin: string,
  destination: string
): DeepLinkResult => {
  const safeProvider = ALLOWED_PROVIDERS.find(p => provider.includes(p)) || 'Generic';
  const safeOrigin = sanitizeInput(origin);
  const safeDest = sanitizeInput(destination);

  switch (safeProvider) {
    case 'Uber':
      // Uber Universal Link
      return {
        url: `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[formatted_address]=${safeDest}&dropoff[nickname]=${safeDest}`,
        isUniversal: true,
        fallbackUrl: `https://m.uber.com/looking?dropoff[formatted_address]=${safeDest}`,
        // Uber Intent
        androidIntent: `intent://?action=setPickup&pickup=my_location&dropoff[formatted_address]=${safeDest}#Intent;package=com.ubercab;scheme=uber;end`
      };

    case 'Ola':
      // Ola Custom Scheme
      return {
        url: `olacabs://app?drop_lat=&drop_lng=&drop_name=${safeDest}`, 
        isUniversal: false,
        fallbackUrl: `https://book.olacabs.com/?drop_name=${safeDest}`,
        // Android Intent with fallback to browser built-in
        androidIntent: `intent://app?drop_lat=&drop_lng=&drop_name=${safeDest}#Intent;scheme=olacabs;package=com.olacabs.customer;S.browser_fallback_url=${encodeURIComponent(`https://book.olacabs.com/?drop_name=${safeDest}`)};end`
      };

    case 'Rapido':
      return {
        url: `rapido://booking?destination=${safeDest}`,
        isUniversal: false,
        fallbackUrl: 'https://www.rapido.bike/',
        androidIntent: `intent://booking?destination=${safeDest}#Intent;scheme=rapido;package=com.rapido.passenger;end`
      };

    case 'IndiGo':
      return {
        url: `https://www.goindigo.in/booking/flight-ticket.html?origin=${safeOrigin}&dest=${safeDest}`,
        isUniversal: true,
        fallbackUrl: 'https://www.goindigo.in/'
      };

    case 'IRCTC':
    case 'Vande Bharat':
      return {
        url: `irctcconnect://train_search?src=${safeOrigin}&dst=${safeDest}`,
        isUniversal: false,
        fallbackUrl: 'https://www.irctc.co.in/nget/train-search',
        androidIntent: `intent://train_search?src=${safeOrigin}&dst=${safeDest}#Intent;scheme=irctcconnect;package=com.irctc.rail.connect;end`
      };

    case 'RedBus':
    case 'ZingBus':
      return {
        url: `redbus://search?fromCityName=${safeOrigin}&toCityName=${safeDest}`,
        isUniversal: false,
        fallbackUrl: `https://www.redbus.in/search?fromCity=${safeOrigin}&toCity=${safeDest}`,
        androidIntent: `intent://search?fromCityName=${safeOrigin}&toCityName=${safeDest}#Intent;scheme=redbus;package=in.redbus.android;end`
      };

    default:
      return {
        url: `https://www.google.com/maps/dir/?api=1&origin=${safeOrigin}&destination=${safeDest}&travelmode=transit`,
        isUniversal: true,
        fallbackUrl: `https://www.google.com/maps/dir/?api=1&origin=${safeOrigin}&destination=${safeDest}`
      };
  }
};