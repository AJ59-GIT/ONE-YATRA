// Rate Card Database
interface RateCard {
  baseFare: number;
  perKm: number;
  perMin: number;
  minFare: number;
  nightSurcharge: number; // multiplier
}

const CITY_RATES: Record<string, RateCard> = {
  'Delhi': { baseFare: 50, perKm: 14, perMin: 2, minFare: 100, nightSurcharge: 1.25 },
  'Mumbai': { baseFare: 40, perKm: 16, perMin: 2.5, minFare: 90, nightSurcharge: 1.3 },
  'Bangalore': { baseFare: 60, perKm: 18, perMin: 3, minFare: 120, nightSurcharge: 1.5 },
  'Default': { baseFare: 45, perKm: 15, perMin: 2, minFare: 80, nightSurcharge: 1.2 },
};

// Traffic Factors (Simulated Maps API Latency)
const TRAFFIC_MULTIPLIERS = {
  'Peak': 1.8, // Heavy Traffic
  'Normal': 1.2,
  'Off-Peak': 1.0,
};

export const getRateCard = (city: string): RateCard => {
  // Simple heuristic to match city string
  if (city.includes('Delhi') || city.includes('Noida') || city.includes('Gurgaon')) return CITY_RATES['Delhi'];
  if (city.includes('Mumbai') || city.includes('Pune')) return CITY_RATES['Mumbai'];
  if (city.includes('Bangalore') || city.includes('Bengaluru')) return CITY_RATES['Bangalore'];
  return CITY_RATES['Default'];
};

export const calculateSurge = (timeStr: string): number => {
  const hour = parseInt(timeStr.split(':')[0]);
  // Rush hours: 8-11 AM and 5-8 PM
  if ((hour >= 8 && hour <= 11) || (hour >= 17 && hour <= 20)) {
    return 1.4 + (Math.random() * 0.4); // 1.4x to 1.8x
  }
  // Night rates: 10 PM to 6 AM
  if (hour >= 22 || hour <= 6) {
    return 1.2;
  }
  return 1.0;
};

export const calculateCabPrice = (
  distanceKm: number,
  durationMins: number,
  city: string,
  timeStr: string
): { price: number; surge: number; breakdown: string } => {
  const rates = getRateCard(city);
  const surge = calculateSurge(timeStr);
  
  const distanceCost = distanceKm * rates.perKm;
  const timeCost = durationMins * rates.perMin;
  const rawTotal = (rates.baseFare + distanceCost + timeCost) * surge;
  
  const finalPrice = Math.max(rawTotal, rates.minFare);

  return {
    price: Math.round(finalPrice),
    surge: parseFloat(surge.toFixed(1)),
    breakdown: `Base ₹${rates.baseFare} + ₹${rates.perKm}/km + Time`
  };
};

export const parseDurationToMins = (durationStr: string): number => {
  // format "2h 30m" or "45m"
  let minutes = 0;
  const hMatch = durationStr.match(/(\d+)h/);
  const mMatch = durationStr.match(/(\d+)m/);
  
  if (hMatch) minutes += parseInt(hMatch[1]) * 60;
  if (mMatch) minutes += parseInt(mMatch[1]);
  
  return minutes || 60; // Default fallback
};

export const parseDistanceToKm = (distanceStr: string): number => {
  // format "14 km"
  const match = distanceStr.match(/(\d+(\.\d+)?)/);
  return match ? parseFloat(match[0]) : 10;
};

export const predictPriceTrend = (mode: string): 'UP' | 'DOWN' | 'STABLE' => {
  const rand = Math.random();
  if (mode === 'FLIGHT' || mode === 'TRAIN') return rand > 0.3 ? 'UP' : 'STABLE';
  if (mode === 'CAB') return rand > 0.8 ? 'UP' : (rand < 0.2 ? 'DOWN' : 'STABLE');
  return 'STABLE';
};
