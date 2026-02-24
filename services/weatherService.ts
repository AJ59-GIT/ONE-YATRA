
import { WeatherForecast, WeatherInsights } from "../types";

const CONDITIONS: WeatherForecast['condition'][] = ['Sunny', 'Cloudy', 'Rainy', 'Stormy', 'Snowy'];

const PACKING_RULES = [
  { condition: (t: number, c: string) => c === 'Rainy' || c === 'Stormy', item: 'Umbrella & Raincoat' },
  { condition: (t: number, c: string) => t < 10, item: 'Heavy Woolens & Gloves' },
  { condition: (t: number, c: string) => t >= 10 && t < 20, item: 'Light Jacket or Sweater' },
  { condition: (t: number, c: string) => t > 30, item: 'Sunscreen, Hat & Sunglasses' },
  { condition: (t: number, c: string) => c === 'Sunny' && t > 25, item: 'Cotton Clothes' },
  { condition: (t: number, c: string) => c === 'Snowy', item: 'Snow Boots & Thermals' },
];

export const getDestinationWeather = (city: string, travelDate?: string): WeatherInsights => {
  // Deterministic mock based on city chars
  const seed = city.length + city.charCodeAt(0);
  const forecast: WeatherForecast[] = [];
  const today = new Date();
  
  // Generate 7 Days
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    // Pseudo-random generation
    const dailySeed = seed + i;
    // Simulate generic seasonal temp (e.g., 20-35)
    const tempBase = 20 + (dailySeed % 15); 
    const conditionIndex = dailySeed % CONDITIONS.length;
    
    forecast.push({
      date: date.toISOString().split('T')[0],
      temp: tempBase,
      condition: CONDITIONS[conditionIndex],
      humidity: 40 + (dailySeed % 40),
      windSpeed: 5 + (dailySeed % 15)
    });
  }

  // Identify Travel Date Weather
  let travelDateWeather: WeatherForecast | undefined;
  if (travelDate) {
    travelDateWeather = forecast.find(f => f.date === travelDate);
    // If travel date is beyond 7 days, generate a probabilistic one
    if (!travelDateWeather) {
        const tDate = new Date(travelDate);
        travelDateWeather = {
            date: travelDate,
            temp: 20 + (seed % 15),
            condition: CONDITIONS[seed % CONDITIONS.length],
            humidity: 50,
            windSpeed: 10
        };
    }
  }

  // Generate Packing Tips based on forecast average
  const avgTemp = forecast.reduce((acc, curr) => acc + curr.temp, 0) / 7;
  const conditionsSet = new Set(forecast.map(f => f.condition));
  
  const packingTips: string[] = [];
  PACKING_RULES.forEach(rule => {
      // Check if any day meets the condition roughly
      const relevantDay = forecast.find(f => rule.condition(f.temp, f.condition));
      if (relevantDay) {
          if (!packingTips.includes(rule.item)) packingTips.push(rule.item);
      }
  });
  if (packingTips.length === 0) packingTips.push("Comfortable Casual Wear");

  // Generate Alerts
  const alerts: string[] = [];
  if (conditionsSet.has('Stormy')) alerts.push("Severe Thunderstorm Warning");
  if (avgTemp > 38) alerts.push("Heatwave Alert: Stay Hydrated");
  if (conditionsSet.has('Snowy') && avgTemp < 0) alerts.push("Blizzard Watch");

  // Best Time to Visit (Mock logic)
  const months = ["Oct - Mar", "Nov - Feb", "Sep - Mar", "Round the Year"];
  const bestTime = months[seed % months.length];

  return {
    current: forecast[0],
    forecast,
    travelDateWeather,
    alerts,
    packingTips,
    bestTimeToVisit: bestTime
  };
};

// Kept for backward compatibility if used elsewhere strictly for forecast array
export const getWeatherForecast = (city: string, days: number = 5): WeatherForecast[] => {
    return getDestinationWeather(city).forecast.slice(0, days);
};
