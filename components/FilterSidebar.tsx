
import React, { useState } from 'react';
import { X, Sun, Moon, Sunrise, Sunset, Filter, Star, Check } from 'lucide-react';
import { FilterState } from '../types';
import { Button } from './Button';

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  minPrice: number;
  maxPrice: number;
  maxDurationLimit: number; // In minutes
  availableProviders: string[];
  onClose: () => void; // For mobile
  resultsCount: number;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onChange,
  minPrice,
  maxPrice,
  maxDurationLimit,
  availableProviders,
  onClose,
  resultsCount
}) => {
  const updateFilter = (key: keyof FilterState, value: any) => {
    onChange({ ...filters, [key]: value });
  };

  const handleProviderToggle = (provider: string) => {
    const newProviders = filters.providers.includes(provider)
      ? filters.providers.filter(p => p !== provider)
      : [...filters.providers, provider];
    updateFilter('providers', newProviders);
  };

  const handleAmenityToggle = (amenity: string) => {
    const newAmenities = filters.amenities.includes(amenity)
      ? filters.amenities.filter(a => a !== amenity)
      : [...filters.amenities, amenity];
    updateFilter('amenities', newAmenities);
  };

  const handleDepartureToggle = (slot: string) => {
    const newSlots = filters.departureTime.includes(slot)
      ? filters.departureTime.filter(s => s !== slot)
      : [...filters.departureTime, slot];
    updateFilter('departureTime', newSlots);
  };

  const handleStopsToggle = (stop: string) => {
    const newStops = filters.stops.includes(stop)
      ? filters.stops.filter(s => s !== stop)
      : [...filters.stops, stop];
    updateFilter('stops', newStops);
  };

  const handleReset = () => {
    onChange({
      departureTime: [],
      arrivalMaxHour: 24,
      priceRange: [minPrice, maxPrice],
      providers: [],
      amenities: [],
      stops: [],
      maxDuration: maxDurationLimit,
      minRating: 0
    });
  };

  const activeCount = 
    filters.departureTime.length + 
    filters.providers.length + 
    filters.amenities.length + 
    filters.stops.length + 
    (filters.minRating > 0 ? 1 : 0) +
    (filters.priceRange[1] < maxPrice || filters.priceRange[0] > minPrice ? 1 : 0) +
    (filters.maxDuration < maxDurationLimit ? 1 : 0);

  const formatDuration = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  return (
    <div className="bg-white dark:bg-slate-900 h-full flex flex-col border-r border-gray-200 dark:border-slate-800 overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-brand-600 dark:text-brand-400" />
          <h2 className="font-bold text-gray-900 dark:text-white">Filters</h2>
          {activeCount > 0 && (
            <span className="bg-brand-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {activeCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
           <button onClick={handleReset} className="text-xs text-brand-600 dark:text-brand-400 font-medium hover:text-brand-700 dark:hover:text-brand-300 focus:outline-none focus:underline">Reset</button>
           <button onClick={onClose} className="lg:hidden p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded text-gray-500 dark:text-slate-400"><X className="h-5 w-5"/></button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        
        {/* Departure Time */}
        <div className="border-b border-gray-100 dark:border-slate-800 pb-4">
          <h3 className="text-sm font-bold text-gray-800 dark:text-slate-200 mb-3">Departure Time</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: '0-6', label: 'Early', sub: 'Before 6 AM', icon: <Sunrise className="h-4 w-4"/> },
              { id: '6-12', label: 'Morning', sub: '6 AM - 12 PM', icon: <Sun className="h-4 w-4"/> },
              { id: '12-18', label: 'Afternoon', sub: '12 PM - 6 PM', icon: <Sun className="h-4 w-4 text-orange-400"/> },
              { id: '18-24', label: 'Evening', sub: 'After 6 PM', icon: <Moon className="h-4 w-4"/> }
            ].map((slot) => (
              <button
                key={slot.id}
                onClick={() => handleDepartureToggle(slot.id)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                  filters.departureTime.includes(slot.id) 
                    ? 'bg-brand-50 dark:bg-brand-900/20 border-brand-500 text-brand-700 dark:text-brand-300' 
                    : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:border-gray-300 dark:hover:border-slate-600'
                }`}
              >
                <div className={`mb-1 ${filters.departureTime.includes(slot.id) ? 'text-brand-500' : 'text-gray-400 dark:text-slate-600'}`}>{slot.icon}</div>
                <div className="text-xs font-bold">{slot.label}</div>
                <div className="text-[10px] opacity-70">{slot.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div className="border-b border-gray-100 dark:border-slate-800 pb-4">
          <div className="flex justify-between items-center mb-2">
             <h3 className="text-sm font-bold text-gray-800 dark:text-slate-200">Price Range</h3>
             <span className="text-xs text-gray-500 dark:text-slate-400">₹{filters.priceRange[0]} - ₹{filters.priceRange[1]}</span>
          </div>
          <input 
            type="range"
            min={minPrice}
            max={maxPrice}
            step={50}
            value={filters.priceRange[1]}
            onChange={(e) => updateFilter('priceRange', [filters.priceRange[0], parseInt(e.target.value)])}
            className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <div className="flex justify-between text-[10px] text-gray-400 dark:text-slate-500 mt-1">
             <span>₹{minPrice}</span>
             <span>₹{maxPrice}+</span>
          </div>
        </div>

        {/* Stops */}
        <div className="border-b border-gray-100 dark:border-slate-800 pb-4">
          <h3 className="text-sm font-bold text-gray-800 dark:text-slate-200 mb-3">Stops</h3>
          <div className="flex gap-2">
             {['0', '1', '2+'].map(stop => (
               <button
                  key={stop}
                  onClick={() => handleStopsToggle(stop)}
                  className={`flex-1 py-1.5 rounded text-xs font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                    filters.stops.includes(stop)
                      ? 'bg-brand-50 dark:bg-brand-900/20 border-brand-500 text-brand-700 dark:text-brand-300'
                      : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:border-gray-300 dark:hover:border-slate-600'
                  }`}
               >
                 {stop === '0' ? 'Non-stop' : stop === '1' ? '1 Stop' : '2+ Stops'}
               </button>
             ))}
          </div>
        </div>

        {/* Providers */}
        <div className="border-b border-gray-100 dark:border-slate-800 pb-4">
          <h3 className="text-sm font-bold text-gray-800 dark:text-slate-200 mb-3">Providers</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
            {availableProviders.map(provider => (
              <label key={provider} className="flex items-center cursor-pointer group">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={filters.providers.includes(provider)}
                  onChange={() => handleProviderToggle(provider)}
                />
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors peer-focus:ring-2 peer-focus:ring-brand-500 peer-focus:ring-offset-1 ${
                  filters.providers.includes(provider) ? 'bg-brand-500 border-brand-500' : 'border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 group-hover:border-gray-400 dark:group-hover:border-slate-600'
                }`}>
                  {filters.providers.includes(provider) && <Check className="h-3 w-3 text-white" />}
                </div>
                <span className={`ml-2 text-sm ${filters.providers.includes(provider) ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-600 dark:text-slate-400'}`}>{provider}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Arrival Time */}
        <div className="border-b border-gray-100 dark:border-slate-800 pb-4">
           <div className="flex justify-between items-center mb-2">
             <h3 className="text-sm font-bold text-gray-800 dark:text-slate-200">Arrival Before</h3>
             <span className="text-xs text-gray-500 dark:text-slate-400">{filters.arrivalMaxHour === 24 ? 'Anytime' : `${filters.arrivalMaxHour}:00`}</span>
          </div>
          <input 
            type="range"
            min={0}
            max={24}
            step={1}
            value={filters.arrivalMaxHour}
            onChange={(e) => updateFilter('arrivalMaxHour', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Duration */}
        <div className="border-b border-gray-100 dark:border-slate-800 pb-4">
           <div className="flex justify-between items-center mb-2">
             <h3 className="text-sm font-bold text-gray-800 dark:text-slate-200">Max Duration</h3>
             <span className="text-xs text-gray-500 dark:text-slate-400">{formatDuration(filters.maxDuration)}</span>
          </div>
          <input 
            type="range"
            min={30}
            max={maxDurationLimit}
            step={30}
            value={filters.maxDuration}
            onChange={(e) => updateFilter('maxDuration', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        
        {/* Rating */}
        <div className="border-b border-gray-100 dark:border-slate-800 pb-4">
           <h3 className="text-sm font-bold text-gray-800 dark:text-slate-200 mb-3">Min Rating</h3>
           <div className="flex gap-2">
             {[3, 4, 4.5].map(rating => (
               <button
                 key={rating}
                 onClick={() => updateFilter('minRating', filters.minRating === rating ? 0 : rating)}
                 className={`flex items-center px-3 py-1.5 rounded-full border text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                    filters.minRating === rating
                      ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-400 dark:border-yellow-900/50 text-yellow-700 dark:text-yellow-300'
                      : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:border-gray-300 dark:hover:border-slate-600'
                 }`}
               >
                 {rating}+ <Star className={`h-3 w-3 ml-1 ${filters.minRating === rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-400 dark:text-slate-600'}`} />
               </button>
             ))}
           </div>
        </div>

        {/* Amenities */}
        <div className="pb-20">
          <h3 className="text-sm font-bold text-gray-800 dark:text-slate-200 mb-3">Amenities</h3>
          <div className="flex flex-wrap gap-2">
            {['WiFi', 'AC', 'Food', 'Sleeper', 'Power', 'TV'].map(amenity => (
              <button
                key={amenity}
                onClick={() => handleAmenityToggle(amenity)}
                className={`px-3 py-1.5 rounded text-xs border transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                  filters.amenities.includes(amenity)
                    ? 'bg-brand-50 dark:bg-brand-900/20 border-brand-500 text-brand-700 dark:text-brand-300 font-medium'
                    : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                }`}
              >
                {amenity}
              </button>
            ))}
          </div>
        </div>

      </div>

      <div className="sticky bottom-0 p-4 border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 lg:hidden">
        <Button onClick={onClose} className="w-full">
           Show {resultsCount} Results
        </Button>
      </div>
    </div>
  );
};
