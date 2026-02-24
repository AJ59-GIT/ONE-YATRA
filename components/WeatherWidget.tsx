
import React, { useEffect, useState } from 'react';
import { Sun, Cloud, CloudRain, CloudLightning, Snowflake, Wind, Droplets, AlertTriangle, Briefcase, Calendar, Thermometer } from 'lucide-react';
import { WeatherInsights } from '../types';
import { getDestinationWeather } from '../services/weatherService';

interface WeatherWidgetProps {
  city: string;
  date?: string; // Travel Date
  compact?: boolean;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ city, date, compact = false }) => {
  const [data, setData] = useState<WeatherInsights | null>(null);
  const [unit, setUnit] = useState<'C' | 'F'>('C');
  const [activeTab, setActiveTab] = useState<'FORECAST' | 'INSIGHTS'>('FORECAST');

  useEffect(() => {
    setData(getDestinationWeather(city, date));
  }, [city, date]);

  const getIcon = (condition: string, className = "h-6 w-6") => {
    switch (condition) {
      case 'Sunny': return <Sun className={`${className} text-yellow-500`} />;
      case 'Cloudy': return <Cloud className={`${className} text-gray-400`} />;
      case 'Rainy': return <CloudRain className={`${className} text-blue-400`} />;
      case 'Stormy': return <CloudLightning className={`${className} text-purple-500`} />;
      case 'Snowy': return <Snowflake className={`${className} text-cyan-300`} />;
      default: return <Sun className={`${className} text-yellow-500`} />;
    }
  };

  const formatTemp = (celsius: number) => {
    if (unit === 'C') return `${Math.round(celsius)}°C`;
    return `${Math.round(celsius * 9/5 + 32)}°F`;
  };

  if (!data) return <div className="h-24 bg-gray-50 rounded-xl animate-pulse"></div>;

  // --- Compact View (Existing) ---
  if (compact) {
      const dayWeather = data.travelDateWeather || data.current;
      return (
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 p-3 rounded-lg">
            {getIcon(dayWeather.condition)}
            <div>
            <div className="font-bold text-gray-900 text-sm flex items-center">
                {city} <span className="mx-2 text-gray-300">|</span> {formatTemp(dayWeather.temp)}
            </div>
            <div className="text-xs text-blue-700 flex gap-3 mt-0.5">
                <span className="flex items-center gap-1"><Wind className="h-3 w-3"/> {dayWeather.windSpeed} km/h</span>
                <span className="flex items-center gap-1"><Droplets className="h-3 w-3"/> {dayWeather.humidity}%</span>
            </div>
            </div>
        </div>
      );
  }

  // --- Full Widget ---
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div>
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                {city} Weather
                {data.alerts.length > 0 && (
                    <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                )}
            </h3>
            {date && (
                <p className="text-xs text-gray-500 mt-0.5 flex items-center">
                    <Calendar className="h-3 w-3 mr-1" /> Travel: {new Date(date).toLocaleDateString()}
                </p>
            )}
        </div>
        <div className="flex bg-white rounded-lg border border-gray-200 p-0.5">
            <button 
                onClick={() => setUnit('C')}
                className={`px-2 py-1 text-xs font-bold rounded ${unit === 'C' ? 'bg-brand-50 text-brand-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
                °C
            </button>
            <button 
                onClick={() => setUnit('F')}
                className={`px-2 py-1 text-xs font-bold rounded ${unit === 'F' ? 'bg-brand-50 text-brand-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
                °F
            </button>
        </div>
      </div>

      {/* Alerts Banner */}
      {data.alerts.map((alert, idx) => (
          <div key={idx} className="bg-red-50 px-4 py-2 border-b border-red-100 flex items-center text-xs text-red-700 font-bold animate-in slide-in-from-top-2">
              <AlertTriangle className="h-4 w-4 mr-2 text-red-600 animate-pulse" />
              {alert}
          </div>
      ))}

      {/* Navigation */}
      <div className="flex border-b border-gray-100">
          <button 
            onClick={() => setActiveTab('FORECAST')}
            className={`flex-1 py-2 text-xs font-bold border-b-2 transition-colors ${activeTab === 'FORECAST' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            7-Day Forecast
          </button>
          <button 
            onClick={() => setActiveTab('INSIGHTS')}
            className={`flex-1 py-2 text-xs font-bold border-b-2 transition-colors ${activeTab === 'INSIGHTS' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Tips & Packing
          </button>
      </div>

      <div className="p-4">
        {activeTab === 'FORECAST' && (
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                {data.forecast.map((day, i) => {
                    const isTravelDay = day.date === date;
                    return (
                        <div 
                            key={i} 
                            className={`flex flex-col items-center min-w-[70px] p-2 rounded-xl border transition-all ${
                                isTravelDay 
                                ? 'bg-brand-50 border-brand-200 ring-1 ring-brand-200' 
                                : 'bg-white border-gray-100'
                            }`}
                        >
                            <span className={`text-[10px] mb-1 font-bold ${isTravelDay ? 'text-brand-700' : 'text-gray-500'}`}>
                                {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                            </span>
                            <span className="text-[9px] text-gray-400 mb-2">
                                {new Date(day.date).getDate()}
                            </span>
                            {getIcon(day.condition)}
                            <span className="text-sm font-bold text-gray-900 mt-2">{formatTemp(day.temp)}</span>
                            <span className="text-[9px] text-gray-400 mt-1">{day.condition}</span>
                        </div>
                    );
                })}
            </div>
        )}

        {activeTab === 'INSIGHTS' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-2">
                {/* Packing */}
                <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center">
                        <Briefcase className="h-3 w-3 mr-1" /> Packing Suggestions
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {data.packingTips.map((tip, i) => (
                            <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-medium border border-indigo-100">
                                {tip}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Best Time */}
                <div className="bg-green-50 rounded-lg p-3 border border-green-100 flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                        <div className="text-xs font-bold text-green-800">Best Time to Visit</div>
                        <div className="text-sm font-medium text-green-700 mt-0.5">{data.bestTimeToVisit}</div>
                        <div className="text-[10px] text-green-600 mt-1">
                            Plan your trip during these months for the best experience.
                        </div>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
