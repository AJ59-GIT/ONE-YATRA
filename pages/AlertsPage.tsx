
import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, MapPin, Wind, ArrowRight, RefreshCw, Plane, Bus, Train, Car, Info } from 'lucide-react';
import { Booking } from '../types';
import { getUserBookings } from '../services/bookingService';
import { Button } from '../components/Button';

// Mock weather data
const getWeather = (city: string) => {
    // Deterministic mock based on city name length
    const types = ['Sunny', 'Rainy', 'Cloudy', 'Clear'];
    const temps = [28, 24, 22, 30];
    const type = types[city.length % types.length];
    const temp = temps[city.length % temps.length];
    return { type, temp, icon: type === 'Rainy' ? '🌧️' : type === 'Cloudy' ? '☁️' : '☀️' };
};

export const AlertsPage: React.FC = () => {
  const [activeTrips, setActiveTrips] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    fetchLiveUpdates();
    const interval = setInterval(fetchLiveUpdates, 30000); // 30s Auto Refresh
    return () => clearInterval(interval);
  }, []);

  const fetchLiveUpdates = async () => {
    setLoading(true);
    // Simulate API Fetch
    await new Promise(r => setTimeout(r, 800));
    
    const allBookings = getUserBookings();
    const today = new Date();
    // Filter for Upcoming or Recent trips (Last 24h to Future)
    const upcoming = allBookings.filter(b => {
        if (b.status !== 'CONFIRMED') return false;
        const tripDate = new Date(b.travelDate || b.createdAt);
        const diffHours = (tripDate.getTime() - today.getTime()) / 36e5;
        return diffHours > -24; // Show trips from yesterday onwards (active)
    }).sort((a, b) => new Date(a.travelDate || 0).getTime() - new Date(b.travelDate || 0).getTime());

    setActiveTrips(upcoming);
    setLastUpdated(new Date());
    setLoading(false);
  };

  const getStatusMock = (booking: Booking) => {
      // Deterministic mock status based on Booking ID
      const seed = booking.id.charCodeAt(booking.id.length - 1);
      
      if (seed % 5 === 0) return { status: 'DELAYED', msg: 'Delayed by 45 mins', color: 'text-red-600', bg: 'bg-red-50' };
      if (seed % 7 === 0 && booking.option.mode === 'FLIGHT') return { status: 'GATE_CHANGE', msg: 'Gate changed to 14B', color: 'text-orange-600', bg: 'bg-orange-50' };
      if (seed % 3 === 0 && booking.option.mode === 'CAB') return { status: 'TRAFFIC', msg: 'Heavy traffic on route (+15m)', color: 'text-yellow-600', bg: 'bg-yellow-50' };
      
      return { status: 'ON_TIME', msg: 'On Time', color: 'text-green-600', bg: 'bg-green-50' };
  };

  const getTransportIcon = (mode: string) => {
      if (mode === 'FLIGHT') return <Plane className="h-5 w-5"/>;
      if (mode === 'TRAIN') return <Train className="h-5 w-5"/>;
      if (mode === 'BUS') return <Bus className="h-5 w-5"/>;
      return <Car className="h-5 w-5"/>;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-24 animate-in fade-in">
        
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                    <AlertTriangle className="h-6 w-6 mr-2 text-brand-600" /> 
                    Live Trip Alerts
                </h1>
                <p className="text-xs text-gray-500 mt-1 flex items-center">
                    Updated {lastUpdated.toLocaleTimeString()}
                    {loading && <RefreshCw className="h-3 w-3 ml-2 animate-spin"/>}
                </p>
            </div>
            <Button size="sm" variant="outline" onClick={fetchLiveUpdates} disabled={loading}>
                Refresh
            </Button>
        </div>

        {activeTrips.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                <div className="bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Info className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-gray-900 font-bold mb-1">No active trips</h3>
                <p className="text-sm text-gray-500">You don't have any upcoming trips scheduled.</p>
            </div>
        ) : (
            <div className="space-y-6">
                {activeTrips.map(trip => {
                    const status = getStatusMock(trip);
                    const weather = getWeather(trip.destination || 'City');

                    return (
                        <div key={trip.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
                            {status.status === 'DELAYED' && (
                                <div className="absolute top-0 left-0 right-0 h-1 bg-red-500 animate-pulse"></div>
                            )}
                            
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-gray-100 p-2.5 rounded-lg text-gray-600">
                                            {getTransportIcon(trip.option.mode)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 font-bold text-gray-900">
                                                {trip.origin} <ArrowRight className="h-4 w-4 text-gray-400"/> {trip.destination}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-0.5">
                                                {trip.option.provider} • {trip.pnr || 'No PNR'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${status.bg} ${status.color} flex items-center shadow-sm`}>
                                        {status.status !== 'ON_TIME' && <AlertTriangle className="h-3 w-3 mr-1.5" />}
                                        {status.msg}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex items-center justify-between">
                                        <div>
                                            <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Departure</div>
                                            <div className="font-mono text-sm font-bold text-gray-800">{trip.option.departureTime}</div>
                                            <div className="text-xs text-gray-500">{new Date(trip.travelDate || Date.now()).toLocaleDateString()}</div>
                                        </div>
                                        <Clock className="h-5 w-5 text-gray-300" />
                                    </div>

                                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex items-center justify-between">
                                        <div>
                                            <div className="text-[10px] text-blue-500 uppercase font-bold tracking-wider">Destination Weather</div>
                                            <div className="font-bold text-sm text-blue-900 flex items-center gap-1">
                                                {weather.icon} {weather.temp}°C {weather.type}
                                            </div>
                                            <div className="text-xs text-blue-700">Wind: 12 km/h</div>
                                        </div>
                                        <Wind className="h-5 w-5 text-blue-300" />
                                    </div>
                                </div>

                                {trip.option.mode === 'FLIGHT' && (
                                    <div className="mt-4 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                                        <div className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs text-gray-600 whitespace-nowrap">
                                            Terminal: <strong>T3</strong>
                                        </div>
                                        <div className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs text-gray-600 whitespace-nowrap">
                                            Gate: <strong>{status.status === 'GATE_CHANGE' ? '14B' : '12A'}</strong>
                                        </div>
                                        <div className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs text-gray-600 whitespace-nowrap">
                                            Bag Drop: <strong>Counter 4-9</strong>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
    </div>
  );
};
