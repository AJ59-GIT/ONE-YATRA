
import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Calendar, ArrowRight, Repeat, Building, X, Heart, Plus, Users, Clock, Locate, Loader2, Bookmark, ChevronDown, ChevronUp, Star, Trash2 } from 'lucide-react';
import { Button } from '../components/Button';
import { SearchParams, SavedSearch, TripSegment, AppView } from '../types';
import { LocationAutocomplete } from '../components/LocationAutocomplete';
import { CustomDatePicker } from '../components/CustomDatePicker';
import { getCityFromCoordinates } from '../services/locationService';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { useSettings } from '../contexts/SettingsContext';

interface HomePageProps {
  onSearch: (params: SearchParams) => void;
  onNavigate?: (view: AppView) => void; 
}

export const HomePage: React.FC<HomePageProps> = ({ onSearch, onNavigate }) => {
  const { t, formatDate } = useSettings();
  
  // Form State
  const [tripType, setTripType] = useState<'ONE_WAY' | 'ROUND_TRIP' | 'MULTI_CITY'>('ONE_WAY');
  
  // Single/Round Trip State
  const [origin, setOrigin] = useState('Delhi');
  const [destination, setDestination] = useState('Mumbai');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [returnDate, setReturnDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2); // Default return 2 days later
    return d.toISOString().split('T')[0];
  });
  const [time, setTime] = useState('08:00');
  
  // Multi City State
  const [segments, setSegments] = useState<TripSegment[]>([
    { id: '1', origin: 'Delhi', destination: 'Agra', date: new Date().toISOString().split('T')[0], time: '08:00' },
    { id: '2', origin: 'Agra', destination: 'Jaipur', date: new Date().toISOString().split('T')[0], time: '14:00' }
  ]);

  // Common State
  const [isFlexible, setIsFlexible] = useState(false);
  const [passengers, setPassengers] = useState(1);
  const [isLocating, setIsLocating] = useState(false);
  
  // History State
  const [searchHistory, setSearchHistory] = useState<SearchParams[]>([]);
  
  // Saved Search State
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [isSavedSectionOpen, setIsSavedSectionOpen] = useState(true);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [routeToSaveName, setRouteToSaveName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const saveModalRef = useFocusTrap(isSaveModalOpen, () => setIsSaveModalOpen(false));

  // Load data from localStorage on mount
  useEffect(() => {
    const historyStored = localStorage.getItem('oneyatra_search_history');
    if (historyStored) {
      try {
        setSearchHistory(JSON.parse(historyStored));
      } catch (e) {
        console.error("Failed to parse search history", e);
      }
    }

    const savedStored = localStorage.getItem('oneyatra_saved_searches');
    if (savedStored) {
      try {
        setSavedSearches(JSON.parse(savedStored));
      } catch (e) {
        console.error("Failed to parse saved searches", e);
      }
    }
  }, []);

  // Ensure return date is not before start date
  useEffect(() => {
    if (tripType === 'ROUND_TRIP' && returnDate < date) {
      setReturnDate(date);
    }
  }, [date, tripType]);

  // --- Multi City Logic ---
  const addSegment = () => {
    if (segments.length >= 5) return;
    const lastSegment = segments[segments.length - 1];
    const newSegment: TripSegment = {
      id: Date.now().toString(),
      origin: lastSegment.destination, // Chain origin from prev destination
      destination: '',
      date: lastSegment.date,
      time: '09:00'
    };
    setSegments([...segments, newSegment]);
  };

  const removeSegment = (index: number) => {
    if (segments.length <= 1) return;
    const newSegments = segments.filter((_, i) => i !== index);
    
    // Fix chaining if middle segment removed
    for (let i = 1; i < newSegments.length; i++) {
        newSegments[i].origin = newSegments[i-1].destination;
    }
    setSegments(newSegments);
  };

  const updateSegment = (index: number, field: keyof TripSegment, value: string) => {
    const newSegments = [...segments];
    newSegments[index] = { ...newSegments[index], [field]: value };
    
    // Auto-update next segment origin if destination changed
    if (field === 'destination' && index < newSegments.length - 1) {
        newSegments[index + 1].origin = value;
    }
    
    setSegments(newSegments);
  };

  // --- History Logic ---
  const addToHistory = (params: SearchParams) => {
    const newHistory = [params, ...searchHistory].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('oneyatra_search_history', JSON.stringify(newHistory));
  };

  const handleApplySearch = (item: SearchParams) => {
    setTripType(item.tripType);
    setPassengers(item.passengers);
    if (item.isFlexible !== undefined) setIsFlexible(item.isFlexible);
    
    if (item.tripType === 'MULTI_CITY') {
        setSegments(item.segments);
    } else {
        setOrigin(item.origin);
        setDestination(item.destination);
        setDate(item.date);
        setTime(item.time);
        if (item.tripType === 'ROUND_TRIP' && item.returnDate) {
            setReturnDate(item.returnDate);
        }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- Geolocation Logic ---
  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
            const city = await getCityFromCoordinates(latitude, longitude);
            if (city) {
                if (tripType !== 'MULTI_CITY') setOrigin(city);
                else updateSegment(0, 'origin', city);
            } else {
                alert("Could not automatically detect city name. Please enter manually.");
            }
        } catch (e) {
             console.error("Reverse geocoding failed", e);
             alert("Failed to fetch location details.");
        } finally {
            setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        let msg = "Unable to retrieve your location.";
        if (error.code === 1) msg = "Location permission denied.";
        else if (error.code === 2) msg = "Location unavailable.";
        alert(msg);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // --- Saved Search Logic ---
  const openSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    const name = tripType === 'MULTI_CITY' ? `Multi-City Trip (${segments.length} stops)` : `${origin} to ${destination}`;
    setRouteToSaveName(name);
    setEditingId(null);
    setIsSaveModalOpen(true);
  };

  const confirmSaveSearch = () => {
    if (!routeToSaveName.trim()) return;

    let params: SearchParams;
    if (tripType === 'MULTI_CITY') {
        params = { origin: segments[0].origin, destination: segments[segments.length-1].destination, date: segments[0].date, time: segments[0].time, passengers, isFlexible, tripType: 'MULTI_CITY', segments };
    } else {
        params = { origin, destination, date, time, passengers, isFlexible, tripType, segments: [], returnDate: tripType === 'ROUND_TRIP' ? returnDate : undefined };
    }

    let updated: SavedSearch[];
    if (editingId) {
      updated = savedSearches.map(s => s.id === editingId ? { ...s, name: routeToSaveName } : s);
    } else {
      const newSearch: SavedSearch = {
        id: `save-${Date.now()}`,
        name: routeToSaveName,
        createdAt: Date.now(),
        ...params
      };
      updated = [newSearch, ...savedSearches];
    }
    
    setSavedSearches(updated);
    localStorage.setItem('oneyatra_saved_searches', JSON.stringify(updated));
    setIsSaveModalOpen(false);
    setIsSavedSectionOpen(true);
  };

  const handleEditSaved = (search: SavedSearch, e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    setRouteToSaveName(search.name);
    setEditingId(search.id);
    setIsSaveModalOpen(true);
  };

  const handleDeleteSaved = (id: string, e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    if(window.confirm("Remove this saved search?")) {
        const updated = savedSearches.filter(s => s.id !== id);
        setSavedSearches(updated);
        localStorage.setItem('oneyatra_saved_searches', JSON.stringify(updated));
    }
  };

  // --- Main Search Submit ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let params: SearchParams;

    if (tripType === 'MULTI_CITY') {
        params = { 
            origin: segments[0].origin, 
            destination: segments[segments.length - 1].destination, 
            date: segments[0].date, 
            time: segments[0].time, 
            passengers, 
            isFlexible, 
            tripType: 'MULTI_CITY', 
            segments 
        };
    } else {
        params = { 
            origin, 
            destination, 
            date, 
            time, 
            passengers, 
            isFlexible, 
            tripType, 
            segments: [],
            returnDate: tripType === 'ROUND_TRIP' ? returnDate : undefined
        };
    }
    addToHistory(params);
    onSearch(params);
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <div className="absolute -top-20 -left-20 rtl:left-auto rtl:-right-20 w-96 h-96 bg-brand-100 rounded-full blur-3xl opacity-50 mix-blend-multiply animate-blob"></div>
        <div className="absolute top-20 right-0 rtl:right-auto rtl:left-0 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-50 mix-blend-multiply animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20">
        <section className="text-center max-w-3xl mx-auto mb-10">
          <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 tracking-tight mb-4">
            {t('hero_title').split('.')[0]}<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-orange-500">
              {t('hero_title').split('.')[1] || ''}
            </span>
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            {t('hero_desc')}
          </p>
        </section>

        {/* Search Widget */}
        <section className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-4 sm:p-8 max-w-5xl mx-auto border border-gray-100 relative z-20 transition-all duration-300" aria-label="Search Form">
          
          {/* Trip Type Tabs */}
          <div role="tablist" className="flex gap-4 mb-6 border-b border-gray-100 pb-2 overflow-x-auto no-scrollbar">
            {['ONE_WAY', 'ROUND_TRIP', 'MULTI_CITY'].map((type) => (
                <button 
                    key={type}
                    role="tab"
                    aria-selected={tripType === type}
                    onClick={() => setTripType(type as any)}
                    className={`text-sm font-bold pb-2 transition-colors border-b-2 whitespace-nowrap px-2 focus:outline-none focus:ring-2 focus:ring-brand-200 rounded-t-sm ${tripType === type ? 'text-brand-600 border-brand-600' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
                >
                    {t(`tab_${type.toLowerCase()}`)}
                </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} role="search">
            
            {tripType !== 'MULTI_CITY' ? (
                /* --- ONE WAY & ROUND TRIP FORM --- */
                <>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-5 relative group z-40">
                        <label htmlFor="origin-input" className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">{t('label_from')}</label>
                        <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 group-focus-within:ring-2 ring-brand-200 transition-all p-3">
                            <MapPin className="text-gray-400 h-5 w-5 mr-3 shrink-0 rtl:mr-0 rtl:ml-3" aria-hidden="true" />
                            <div className="flex-grow">
                                <LocationAutocomplete value={origin} onChange={setOrigin} placeholder={t('label_from')} required className="bg-transparent border-none outline-none w-full text-gray-900 font-medium placeholder-gray-400" />
                            </div>
                            <button type="button" onClick={handleGeolocation} disabled={isLocating} className="p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500" aria-label="Use current location">
                                {isLocating ? <Loader2 className="h-5 w-5 text-brand-500 animate-spin" aria-hidden="true" /> : <Locate className="h-5 w-5 text-gray-400 hover:text-brand-600" aria-hidden="true" />}
                            </button>
                        </div>
                    </div>
                    <div className="hidden md:flex md:col-span-1 items-end justify-center pb-3" aria-hidden="true">
                         {tripType === 'ROUND_TRIP' ? <Repeat className="text-gray-300 h-6 w-6" /> : <ArrowRight className="text-gray-300 h-6 w-6 rtl:rotate-180" />}
                    </div>
                    <div className="md:col-span-6 relative group z-30">
                        <label htmlFor="destination-input" className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">{t('label_to')}</label>
                        <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 group-focus-within:ring-2 ring-brand-200 transition-all p-3">
                            <MapPin className="text-gray-400 h-5 w-5 mr-3 shrink-0 rtl:mr-0 rtl:ml-3" aria-hidden="true" />
                            <div className="flex-grow">
                                <LocationAutocomplete value={destination} onChange={setDestination} placeholder={t('label_to')} required className="bg-transparent border-none outline-none w-full text-gray-900 font-medium placeholder-gray-400" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-4">
                    {/* Departure Date */}
                    <div className={`${tripType === 'ROUND_TRIP' ? 'md:col-span-3' : 'md:col-span-4'} relative group z-20`}>
                        <label htmlFor="departure-date" className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">{t('label_date')}</label>
                        <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 group-focus-within:ring-2 ring-brand-200 transition-all p-3">
                            <Calendar className="text-gray-400 h-5 w-5 mr-3 shrink-0 rtl:mr-0 rtl:ml-3" aria-hidden="true" />
                            <CustomDatePicker value={date} onChange={setDate} isFlexible={isFlexible} onFlexibleChange={setIsFlexible} className="w-full" />
                        </div>
                    </div>

                    {/* Return Date (Conditional) */}
                    {tripType === 'ROUND_TRIP' && (
                        <div className="md:col-span-3 relative group z-20 animate-in fade-in zoom-in-95 duration-200">
                            <label htmlFor="return-date" className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">{t('label_return')}</label>
                            <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 group-focus-within:ring-2 ring-brand-200 transition-all p-3">
                                <Calendar className="text-gray-400 h-5 w-5 mr-3 shrink-0 rtl:mr-0 rtl:ml-3" aria-hidden="true" />
                                <CustomDatePicker value={returnDate} onChange={setReturnDate} isFlexible={isFlexible} onFlexibleChange={setIsFlexible} minDate={date} className="w-full" />
                            </div>
                        </div>
                    )}

                    <div className={`${tripType === 'ROUND_TRIP' ? 'md:col-span-3' : 'md:col-span-4'} relative group z-10`}>
                        <label htmlFor="trip-time" className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">{t('label_time')}</label>
                        <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 group-focus-within:ring-2 ring-brand-200 transition-all p-3">
                            <Clock className="text-gray-400 h-5 w-5 mr-3 rtl:mr-0 rtl:ml-3" aria-hidden="true" />
                            <input id="trip-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} className="bg-transparent border-none outline-none w-full text-gray-900 font-medium" required />
                        </div>
                    </div>
                    
                    <div className={`${tripType === 'ROUND_TRIP' ? 'md:col-span-3' : 'md:col-span-4'} relative group z-10`}>
                        <label htmlFor="passengers-input" className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">{t('label_passengers')}</label>
                        <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 group-focus-within:ring-2 ring-brand-200 transition-all p-3">
                            <Users className="text-gray-400 h-5 w-5 mr-3 rtl:mr-0 rtl:ml-3" aria-hidden="true" />
                            <input id="passengers-input" type="number" min="1" max="10" value={passengers} onChange={(e) => setPassengers(parseInt(e.target.value))} className="bg-transparent border-none outline-none w-full text-gray-900 font-medium" required />
                        </div>
                    </div>
                </div>
                </>
            ) : (
                /* --- MULTI CITY FORM --- */
                <div className="space-y-4">
                    {segments.map((segment, index) => (
                        <div key={segment.id} className="relative bg-gray-50 rounded-xl p-4 border border-gray-200 animate-in fade-in slide-in-from-top-2 duration-300">
                             <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-gray-500 uppercase">Segment {index + 1}</span>
                                {segments.length > 2 && (
                                    <button 
                                        type="button" 
                                        onClick={() => removeSegment(index)}
                                        className="text-gray-400 hover:text-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                                        title="Remove segment"
                                        aria-label={`Remove segment ${index + 1}`}
                                    >
                                        <X className="h-4 w-4" aria-hidden="true" />
                                    </button>
                                )}
                             </div>
                             
                             <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                 {/* Origin */}
                                 <div className="md:col-span-3 z-30">
                                     <div className="flex items-center bg-white rounded-lg border border-gray-200 p-2 focus-within:ring-2 focus-within:ring-brand-200">
                                         <MapPin className="text-gray-400 h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" aria-hidden="true" />
                                         <LocationAutocomplete 
                                            value={segment.origin} 
                                            onChange={(val) => updateSegment(index, 'origin', val)} 
                                            placeholder={t('label_from')}
                                            className="bg-transparent border-none outline-none w-full text-sm font-medium" 
                                         />
                                         {index === 0 && (
                                            <button type="button" onClick={handleGeolocation} disabled={isLocating} className="ml-1 focus:outline-none focus:ring-2 focus:ring-brand-500 rounded" aria-label="Use current location">
                                                {isLocating ? <Loader2 className="h-4 w-4 text-brand-500 animate-spin" aria-hidden="true" /> : <Locate className="h-4 w-4 text-gray-400" aria-hidden="true" />}
                                            </button>
                                         )}
                                     </div>
                                 </div>
                                 
                                 {/* Destination */}
                                 <div className="md:col-span-3 z-30">
                                     <div className="flex items-center bg-white rounded-lg border border-gray-200 p-2 focus-within:ring-2 focus-within:ring-brand-200">
                                         <MapPin className="text-brand-500 h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" aria-hidden="true" />
                                         <LocationAutocomplete 
                                            value={segment.destination} 
                                            onChange={(val) => updateSegment(index, 'destination', val)} 
                                            placeholder={t('label_to')}
                                            className="bg-transparent border-none outline-none w-full text-sm font-medium" 
                                         />
                                     </div>
                                 </div>

                                 {/* Date */}
                                 <div className="md:col-span-3 z-20">
                                     <div className="flex items-center bg-white rounded-lg border border-gray-200 p-2 h-full focus-within:ring-2 focus-within:ring-brand-200">
                                         <Calendar className="text-gray-400 h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" aria-hidden="true" />
                                         <CustomDatePicker 
                                            value={segment.date} 
                                            onChange={(val) => updateSegment(index, 'date', val)} 
                                            isFlexible={false} 
                                            onFlexibleChange={() => {}} 
                                            className="w-full text-sm"
                                            minDate={index > 0 ? segments[index-1].date : undefined}
                                         />
                                     </div>
                                 </div>

                                 {/* Time */}
                                 <div className="md:col-span-3">
                                     <div className="flex items-center bg-white rounded-lg border border-gray-200 p-2 h-full focus-within:ring-2 focus-within:ring-brand-200">
                                         <Clock className="text-gray-400 h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" aria-hidden="true" />
                                         <input 
                                            type="time" 
                                            value={segment.time} 
                                            onChange={(e) => updateSegment(index, 'time', e.target.value)} 
                                            className="bg-transparent border-none outline-none w-full text-sm font-medium" 
                                            aria-label={`Time for segment ${index + 1}`}
                                         />
                                     </div>
                                 </div>
                             </div>
                        </div>
                    ))}

                    <div className="flex items-center gap-4">
                        {segments.length < 5 && (
                            <button 
                                type="button"
                                onClick={addSegment}
                                className="flex items-center gap-2 text-brand-600 font-bold hover:text-brand-700 hover:bg-brand-50 px-4 py-2 rounded-lg transition-colors border border-dashed border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                            >
                                <Plus className="h-4 w-4" aria-hidden="true" /> Add City
                            </button>
                        )}
                        
                        <div className="ml-auto flex items-center bg-gray-50 rounded-lg px-3 py-2 border border-gray-200 focus-within:ring-2 focus-within:ring-brand-500">
                             <Users className="text-gray-400 h-4 w-4 mr-2" aria-hidden="true" />
                             <input 
                                type="number" 
                                min="1" 
                                max="10" 
                                value={passengers} 
                                onChange={(e) => setPassengers(parseInt(e.target.value))} 
                                className="bg-transparent border-none outline-none w-12 text-sm font-medium text-center" 
                                title="Passengers"
                                aria-label="Number of passengers"
                             />
                             <span className="text-xs text-gray-500 ml-1">Pax</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Button size="lg" className="flex-grow text-lg shadow-brand-500/30">
                <Search className="mr-2 h-5 w-5 rtl:mr-0 rtl:ml-2" aria-hidden="true" />
                {tripType === 'ROUND_TRIP' ? t('btn_search_round') : tripType === 'ONE_WAY' ? t('btn_search') : t('btn_search_multi')}
              </Button>
              <button 
                type="button"
                onClick={openSaveModal}
                className="flex items-center justify-center px-6 py-3 border-2 border-brand-200 text-brand-600 font-semibold rounded-lg hover:bg-brand-50 hover:border-brand-300 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
                title="Save this search for later"
              >
                <Heart className="h-5 w-5 mr-2 rtl:mr-0 rtl:ml-2" aria-hidden="true" />
                Save
              </button>
            </div>
          </form>
          
          {/* Group Booking Link */}
          <div className="mt-4 text-center">
              <button 
                onClick={() => onNavigate?.('GROUP_BOOKING')}
                className="text-xs text-gray-500 hover:text-brand-600 hover:underline flex items-center justify-center mx-auto transition-colors"
              >
                  <Building className="h-3 w-3 mr-1 rtl:mr-0 rtl:ml-1" /> {t('group_booking')}
              </button>
          </div>
        </section>

        {/* --- SAVED SEARCHES SECTION --- */}
        {savedSearches.length > 0 && (
           <section className="max-w-5xl mx-auto mt-6 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300 relative z-10">
             <button 
               onClick={() => setIsSavedSectionOpen(!isSavedSectionOpen)}
               className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors focus:outline-none focus:bg-gray-100"
               aria-expanded={isSavedSectionOpen}
             >
               <div className="flex items-center gap-2">
                 <Bookmark className="h-5 w-5 text-brand-500" aria-hidden="true" />
                 <h3 className="font-bold text-gray-800">{t('saved_routes')}</h3>
                 <span className="bg-brand-100 text-brand-700 text-xs font-bold px-2 py-0.5 rounded-full">{savedSearches.length}</span>
               </div>
               {isSavedSectionOpen ? <ChevronUp className="h-4 w-4 text-gray-400" aria-hidden="true" /> : <ChevronDown className="h-4 w-4 text-gray-400" aria-hidden="true" />}
             </button>
             
             {isSavedSectionOpen && (
               <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-white">
                 {savedSearches.map(saved => (
                   <button 
                     key={saved.id}
                     onClick={() => handleApplySearch(saved)}
                     className="group relative flex flex-col p-3 rounded-lg border border-gray-100 hover:border-brand-200 hover:bg-brand-50/30 transition-all cursor-pointer text-left w-full focus:outline-none focus:ring-2 focus:ring-brand-500"
                   >
                     <div className="flex justify-between items-start mb-2 w-full">
                       <div className="flex items-center gap-1.5 font-bold text-gray-800">
                         <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" aria-hidden="true" />
                         {saved.name}
                       </div>
                       <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
                         <div 
                           role="button"
                           tabIndex={0}
                           onClick={(e) => handleEditSaved(saved, e)}
                           onKeyDown={(e) => { if(e.key === 'Enter' || e.key === ' ') handleEditSaved(saved, e); }}
                           className="p-1 hover:bg-white rounded text-gray-400 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                         >
                           {/* Edit Icon SVG */}
                           <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                         </div>
                         <div
                           role="button"
                           tabIndex={0}
                           onClick={(e) => handleDeleteSaved(saved.id, e)}
                           onKeyDown={(e) => { if(e.key === 'Enter' || e.key === ' ') handleDeleteSaved(saved.id, e); }}
                           className="p-1 hover:bg-white rounded text-gray-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                         >
                           <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                         </div>
                       </div>
                     </div>
                     <div className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {saved.origin} → {saved.destination}
                     </div>
                     <div className="text-xs text-gray-400 mt-1 flex justify-between w-full">
                        <span>{formatDate(saved.date)}</span>
                        <span>{saved.tripType === 'ROUND_TRIP' ? 'Round Trip' : 'One Way'}</span>
                     </div>
                   </button>
                 ))}
               </div>
             )}
           </section>
        )}
        
        {/* Save Modal */}
        {isSaveModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" role="dialog" aria-modal="true">
                <div ref={saveModalRef} className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 transform scale-100 animate-in zoom-in-95 duration-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">{editingId ? 'Edit Saved Search' : 'Save This Search'}</h3>
                    <input 
                        type="text" 
                        value={routeToSaveName}
                        onChange={(e) => setRouteToSaveName(e.target.value)}
                        placeholder="e.g. Daily Office Commute"
                        className="w-full border border-gray-300 rounded-lg p-3 text-sm mb-4 focus:ring-2 focus:ring-brand-500 outline-none"
                        autoFocus
                    />
                    <div className="flex gap-3">
                        <button onClick={() => setIsSaveModalOpen(false)} className="flex-1 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-lg transition-colors">Cancel</button>
                        <Button onClick={confirmSaveSearch} className="flex-1">Save</Button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
