
import React, { useEffect, useState } from 'react';
import { Sparkles, ArrowLeft, Filter, AlertCircle, Repeat, Share2, Copy, Check, Twitter, Mail, X, ExternalLink } from 'lucide-react';
import { RouteResponse, SearchParams, TravelOption, FilterState } from '../types';
import { fetchTravelOptions } from '../services/geminiService';
import { trackDeepLinkClick } from '../services/deepLinkService';
import { TravelCard } from '../components/TravelCard';
import { FilterSidebar } from '../components/FilterSidebar';
import { Button } from '../components/Button';
import { parseDurationToMins } from '../services/pricingService';
import { isTripSaved, saveTrip, removeTrip } from '../services/savedTripsService';
import { RealTimeBookingToast } from '../components/RealTimeBookingToast';
import { EmptyState } from '../components/EmptyState';
import { TravelCardSkeleton } from '../components/TravelCardSkeleton';
import { WeatherWidget } from '../components/WeatherWidget';
import { useSettings } from '../contexts/SettingsContext';

interface ResultsPageProps {
  searchParams: SearchParams;
  onBack: () => void;
  onBookOption?: (option: TravelOption) => void;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({ searchParams, onBack, onBookOption }) => {
  const { t, formatPrice, formatDate } = useSettings();
  const [data, setData] = useState<RouteResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSort, setActiveSort] = useState<'ALL' | 'CHEAPEST' | 'FASTEST' | 'ECO'>('ALL');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // Share State
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isDeepLinkModalOpen, setIsDeepLinkModalOpen] = useState(false);
  const [pendingDeepLinkOption, setPendingDeepLinkOption] = useState<TravelOption | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  // Saved items state for re-rendering updates
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    departureTime: [],
    arrivalMaxHour: 24,
    priceRange: [0, 100000],
    providers: [],
    amenities: [],
    stops: [],
    maxDuration: 24 * 60, // 24 hours in mins
    minRating: 0
  });

  // Derived Constraints for Filters
  const [filterConstraints, setFilterConstraints] = useState({
    minPrice: 0,
    maxPrice: 10000,
    maxDuration: 1200,
    providers: [] as string[]
  });
  
  // Round Trip State
  const [roundTripTab, setRoundTripTab] = useState<'OUTBOUND' | 'RETURN'>('OUTBOUND');
  const [selectedOutbound, setSelectedOutbound] = useState<TravelOption | null>(null);
  const [selectedReturn, setSelectedReturn] = useState<TravelOption | null>(null);

  const isRoundTrip = searchParams.tripType === 'ROUND_TRIP';

  const updateSavedIds = (options: TravelOption[]) => {
    const newSet = new Set<string>();
    options.forEach(opt => {
      if (isTripSaved(opt.id)) newSet.add(opt.id);
    });
    setSavedIds(newSet);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError('');
      try {
        const result = await fetchTravelOptions(searchParams);
        setData(result);
        
        // Calculate filter bounds
        const allOptions = [...(result.options || []), ...(result.returnOptions || [])];
        if (allOptions.length > 0) {
            updateSavedIds(allOptions);
            const prices = allOptions.map(o => o.price);
            const durations = allOptions.map(o => parseDurationToMins(o.duration));
            const providers = Array.from(new Set(allOptions.map(o => o.provider.split(' ')[0]))).sort(); // Use simplified provider name
            
            const minP = Math.min(...prices);
            const maxP = Math.max(...prices);
            const maxD = Math.max(...durations);

            setFilterConstraints({
                minPrice: minP,
                maxPrice: maxP,
                maxDuration: maxD,
                providers: providers
            });
            
            // Initialize filter state with bounds
            setFilters(prev => ({
                ...prev,
                priceRange: [minP, maxP],
                maxDuration: maxD
            }));
        }

      } catch (err) {
        setError('Failed to fetch travel options. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [searchParams]);

  // -- Share Functionality --
  const generateShareData = () => {
    const baseUrl = window.location.origin + window.location.pathname;
    const params = new URLSearchParams();
    
    params.set('origin', searchParams.origin);
    params.set('destination', searchParams.destination);
    params.set('date', searchParams.date);
    params.set('tripType', searchParams.tripType);
    params.set('passengers', searchParams.passengers.toString());
    params.set('time', searchParams.time);
    if(searchParams.isFlexible) params.set('isFlexible', 'true');
    if(searchParams.returnDate) params.set('returnDate', searchParams.returnDate);
    if(searchParams.returnTime) params.set('returnTime', searchParams.returnTime);
    if(searchParams.segments && searchParams.segments.length > 0) {
      params.set('segments', encodeURIComponent(JSON.stringify(searchParams.segments)));
    }

    const url = `${baseUrl}?${params.toString()}`;
    const text = `Check out this trip on OneYatra: ${searchParams.origin} to ${searchParams.destination} on ${new Date(searchParams.date).toLocaleDateString()}. Compare flights, trains & cabs!`;

    return { url, text, title: 'OneYatra Trip Search' };
  };

  const handleShare = async () => {
    const { url, text, title } = generateShareData();
    
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (e) {
        console.log('Native share cancelled or failed', e);
      }
    }
    setIsShareModalOpen(true);
  };

  const copyToClipboard = async () => {
    const { url } = generateShareData();
    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  // -- Helper Functions for Filtering --
  
  const parseTime = (timeStr: string): number => {
     // Expected "10:00 AM" or similar
     const [time, modifier] = timeStr.split(' ');
     let [hours, minutes] = time.split(':').map(Number);
     if (modifier === 'PM' && hours < 12) hours += 12;
     if (modifier === 'AM' && hours === 12) hours = 0;
     return hours + (minutes / 60);
  };

  const checkDepartureTime = (timeStr: string, slots: string[]) => {
      if (slots.length === 0) return true;
      const t = parseTime(timeStr);
      return slots.some(slot => {
          const [start, end] = slot.split('-').map(Number);
          return t >= start && t < end;
      });
  };

  const checkArrivalTime = (timeStr: string, maxHour: number) => {
      if (maxHour === 24) return true;
      const t = parseTime(timeStr);
      return t <= maxHour;
  };

  const checkStops = (legs: TravelOption[] | undefined, selectedStops: string[]) => {
      if (selectedStops.length === 0) return true;
      const stopCount = legs ? Math.max(0, legs.length - 1) : 0;
      return selectedStops.some(s => {
          if (s === '0') return stopCount === 0;
          if (s === '1') return stopCount === 1;
          if (s === '2+') return stopCount >= 2;
          return false;
      });
  };

  const applyFilters = (options: TravelOption[]) => {
      return options.filter(opt => {
          // Price
          if (opt.price < filters.priceRange[0] || opt.price > filters.priceRange[1]) return false;
          
          // Duration
          const dur = parseDurationToMins(opt.duration);
          if (dur > filters.maxDuration) return false;

          // Rating
          if (filters.minRating > 0 && (opt.rating || 0) < filters.minRating) return false;

          // Providers
          if (filters.providers.length > 0) {
              const simpleName = opt.provider.split(' ')[0];
              if (!filters.providers.includes(simpleName)) return false;
          }

          // Departure Time
          if (!checkDepartureTime(opt.departureTime, filters.departureTime)) return false;

          // Arrival Time
          if (!checkArrivalTime(opt.arrivalTime, filters.arrivalMaxHour)) return false;

          // Stops
          if (!checkStops(opt.legs, filters.stops)) return false;

          // Amenities
          if (filters.amenities.length > 0) {
             const hasAll = filters.amenities.every(a => 
                 opt.features.some(f => f.toLowerCase().includes(a.toLowerCase()))
             );
             if (!hasAll) return false;
          }

          return true;
      });
  };

  const sortOptions = (options: TravelOption[]) => {
    let opts = [...options];
    if (activeSort === 'CHEAPEST') {
      opts.sort((a, b) => a.price - b.price);
    } else if (activeSort === 'FASTEST') {
      opts.sort((a, b) => parseDurationToMins(a.duration) - parseDurationToMins(b.duration));
    } else if (activeSort === 'ECO') {
        opts.sort((a, b) => b.ecoScore - a.ecoScore);
    }
    return opts;
  };

  const handleBook = (option: TravelOption) => {
    if (isRoundTrip) {
      if (roundTripTab === 'OUTBOUND') {
        setSelectedOutbound(option);
        setRoundTripTab('RETURN'); 
      } else {
        setSelectedReturn(option);
      }
      return;
    }
    handleBookingProcess(option);
  };

  const handleToggleSave = (option: TravelOption) => {
    if (savedIds.has(option.id)) {
      removeTrip(option.id);
      const newSet = new Set(savedIds);
      newSet.delete(option.id);
      setSavedIds(newSet);
    } else {
      if (!data) return;
      const origin = isRoundTrip && roundTripTab === 'RETURN' ? data.destination : data.origin;
      const destination = isRoundTrip && roundTripTab === 'RETURN' ? data.origin : data.destination;
      const date = isRoundTrip && roundTripTab === 'RETURN' ? (data.returnDate || data.date) : data.date;
      
      saveTrip(option, origin, destination, date);
      const newSet = new Set(savedIds);
      newSet.add(option.id);
      setSavedIds(newSet);
    }
  };

  const handleBookingProcess = (option: TravelOption) => {
    if (option.mode === 'CAB') {
        handleDeepLink(option);
    } else {
        if (onBookOption) {
            onBookOption(option);
        } else {
            console.error("Internal booking handler missing");
        }
    }
  };

  const handleRoundTripCheckout = () => {
    if (!selectedOutbound || !selectedReturn) return;
    const combinedOption: TravelOption = {
      id: `rt-${Date.now()}`,
      mode: 'MIXED',
      provider: 'Round Trip Bundle',
      departureTime: selectedOutbound.departureTime,
      arrivalTime: selectedReturn.arrivalTime, 
      duration: 'Combined',
      price: (selectedOutbound.price + selectedReturn.price) * 0.95,
      currency: 'INR',
      features: ['Round Trip Discount Applied'],
      ecoScore: Math.floor((selectedOutbound.ecoScore + selectedReturn.ecoScore) / 2),
      legs: [selectedOutbound, selectedReturn],
      tag: 'Round Trip'
    };
    handleBookingProcess(combinedOption);
  };

  const handleDeepLink = (option: TravelOption) => {
    trackDeepLinkClick(option.provider, 'attempted');
    setPendingDeepLinkOption(option);
    setIsDeepLinkModalOpen(true);
  };

  const confirmDeepLink = () => {
    if (!pendingDeepLinkOption) return;
    const isAndroid = /Android/i.test(navigator.userAgent);
    const targetUrl = (isAndroid && pendingDeepLinkOption.androidIntent) ? pendingDeepLinkOption.androidIntent : pendingDeepLinkOption.deepLink;
    
    if (targetUrl) {
      const isUniversal = targetUrl.startsWith('http');
      window.location.href = targetUrl;
      
      if (!isUniversal && !targetUrl.startsWith('intent://') && pendingDeepLinkOption.deepLinkFallback) {
        setTimeout(() => {
           if (!document.hidden) {
             trackDeepLinkClick(pendingDeepLinkOption.provider, 'fallback');
             window.open(pendingDeepLinkOption.deepLinkFallback, '_blank');
           }
        }, 2500);
      }
    }
    setIsDeepLinkModalOpen(false);
    setPendingDeepLinkOption(null);
  };

  // SKELETON LOADING STATE
  if (loading) {
    return (
      <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-white dark:bg-slate-950">
         {/* Fake Header */}
         <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-4 py-4 z-30">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex flex-col space-y-2">
                    <div className="h-6 w-48 bg-gray-200 dark:bg-slate-800 rounded animate-pulse"></div>
                    <div className="h-4 w-32 bg-gray-100 dark:bg-slate-700 rounded animate-pulse"></div>
                </div>
            </div>
         </div>
         <div className="flex-1 flex max-w-7xl mx-auto w-full p-4 gap-6">
             <div className="hidden lg:block w-72 shrink-0 space-y-4">
                 <div className="h-full bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-4">
                    <div className="h-6 w-24 bg-gray-200 dark:bg-slate-800 rounded mb-6 animate-pulse"></div>
                    {[1,2,3,4].map(i => <div key={i} className="h-16 w-full bg-gray-100 dark:bg-slate-800 rounded mb-4 animate-pulse"></div>)}
                 </div>
             </div>
             <div className="flex-1 space-y-4">
                 {[1, 2, 3, 4].map(i => <TravelCardSkeleton key={i} />)}
             </div>
         </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <EmptyState 
        icon={AlertCircle}
        title="Oops! Something went wrong."
        description={error}
        actionLabel="Try Again"
        onAction={onBack}
        className="min-h-[60vh]"
      />
    );
  }

  // Prepare Display Data
  const rawOptions = isRoundTrip && roundTripTab === 'RETURN' && data.returnOptions 
    ? data.returnOptions 
    : data.options;

  const processedOptions = sortOptions(applyFilters(rawOptions));
  
  const totalPrice = (selectedOutbound?.price || 0) + (selectedReturn?.price || 0);
  const discountedPrice = totalPrice * 0.95;

  const shareData = generateShareData();

  // Determine Destination for Weather Widget
  const destinationCity = isRoundTrip && roundTripTab === 'RETURN' 
    ? data.origin // If returning, show origin weather (which is where I'm going back to)
    : data.destination;
  
  const travelDate = isRoundTrip && roundTripTab === 'RETURN'
    ? (data.returnDate || data.date)
    : data.date;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-slate-50 dark:bg-slate-950">
      
      <RealTimeBookingToast />

      {/* Search Header (Sticky) */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-4 sm:px-6 lg:px-8 py-4 shadow-sm z-30 shrink-0">
         <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
               <div className="flex items-center gap-2">
                 <button onClick={onBack} className="p-1 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400 rtl:-mr-2 rtl:ml-0"><ArrowLeft className="h-5 w-5 rtl:rotate-180"/></button>
                 <h1 className="text-lg font-bold text-gray-900 dark:text-white flex items-center truncate">
                    {isRoundTrip ? (
                       <>{data.origin} <Repeat className="h-4 w-4 mx-1.5 text-brand-500"/> {data.destination}</>
                    ) : (
                       searchParams.tripType === 'MULTI_CITY' ? 'Multi-City Trip' : `${data.origin} ${t('label_to')} ${data.destination}`
                    )}
                 </h1>
               </div>
               <div className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 ml-8 rtl:mr-8 rtl:ml-0 flex items-center gap-2">
                  <span>{formatDate(data.date)}</span>
                  <span>•</span>
                  <span>{searchParams.passengers} {t('label_passengers')}</span>
               </div>
            </div>
            
            <div className="flex items-center gap-2">
               {/* Share Button */}
               <button 
                  onClick={handleShare}
                  className="p-2 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors border border-gray-200 dark:border-slate-700"
                  title="Share Search"
               >
                  <Share2 className="h-5 w-5" />
               </button>

               {/* Filter Toggle (Mobile) */}
               <button 
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden p-2 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 relative"
               >
                  <Filter className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-brand-500 rounded-full border border-white dark:border-slate-900"></span>
               </button>
            </div>
         </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative max-w-7xl mx-auto w-full">
         
         {/* Sidebar (Desktop) */}
         <div className="hidden lg:block w-72 shrink-0 h-full border-r border-gray-200 dark:border-slate-800 overflow-y-auto custom-scrollbar rtl:border-l rtl:border-r-0">
            {/* Weather Widget Embedded in Sidebar */}
            <div className="p-4 border-b border-gray-200 dark:border-slate-800">
               <WeatherWidget city={destinationCity} date={travelDate} />
            </div>
            
            <FilterSidebar 
              filters={filters} 
              onChange={setFilters}
              minPrice={filterConstraints.minPrice}
              maxPrice={filterConstraints.maxPrice}
              maxDurationLimit={filterConstraints.maxDuration}
              availableProviders={filterConstraints.providers}
              onClose={() => {}}
              resultsCount={processedOptions.length}
            />
         </div>

         {/* Mobile Filter Sheet */}
         {showMobileFilters && (
            <div className="absolute inset-0 z-50 lg:hidden flex">
               <div className="w-full h-full bg-white dark:bg-slate-900 animate-in slide-in-from-right duration-300 overflow-y-auto">
                  <div className="p-4 border-b border-gray-200 dark:border-slate-800">
                     <h3 className="font-bold text-lg mb-4 dark:text-white">Destination Info</h3>
                     <WeatherWidget city={destinationCity} date={travelDate} />
                  </div>
                  <FilterSidebar 
                     filters={filters} 
                     onChange={setFilters}
                     minPrice={filterConstraints.minPrice}
                     maxPrice={filterConstraints.maxPrice}
                     maxDurationLimit={filterConstraints.maxDuration}
                     availableProviders={filterConstraints.providers}
                     onClose={() => setShowMobileFilters(false)}
                     resultsCount={processedOptions.length}
                  />
               </div>
            </div>
         )}

         {/* Results Area */}
         <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 pb-32">
            
            {/* Round Trip Tabs */}
            {isRoundTrip && (
               <div className="flex items-center justify-center mb-6 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-1 rounded-xl max-w-lg mx-auto shadow-sm">
                  <button 
                  onClick={() => setRoundTripTab('OUTBOUND')}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${roundTripTab === 'OUTBOUND' ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'}`}
                  >
                  {t('label_from')} {data.origin}
                  </button>
                  <button 
                  onClick={() => setRoundTripTab('RETURN')}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${roundTripTab === 'RETURN' ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'}`}
                  >
                  {t('label_return')}
                  </button>
               </div>
            )}

            {/* Sort Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar mb-4">
              {['ALL', 'CHEAPEST', 'FASTEST', 'ECO'].map(f => (
                <button 
                  key={f}
                  onClick={() => setActiveSort(f as any)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all capitalize border ${
                      activeSort === f 
                      ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-500/20' 
                      : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700'
                  }`}
                >
                  {t(f.toLowerCase())}
                </button>
              ))}
            </div>

            {/* AI Insight */}
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/30 p-3 rounded-lg flex gap-3 mb-6 items-start">
               <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
               <p className="text-xs text-indigo-800 dark:text-indigo-200 leading-relaxed">{data.aiInsight}</p>
            </div>

            {/* List */}
            <div className="space-y-4">
               {processedOptions.length === 0 ? (
                  <EmptyState 
                    icon={Filter}
                    title="No results found"
                    description="Try adjusting your filters to see more options."
                    actionLabel="Reset Filters"
                    onAction={() => setFilters({
                        departureTime: [],
                        arrivalMaxHour: 24,
                        priceRange: [filterConstraints.minPrice, filterConstraints.maxPrice],
                        providers: [],
                        amenities: [],
                        stops: [],
                        maxDuration: filterConstraints.maxDuration,
                        minRating: 0
                    })}
                  />
               ) : (
                  processedOptions.map((option, index) => {
                     const isSelected = isRoundTrip && (
                        (roundTripTab === 'OUTBOUND' && selectedOutbound?.id === option.id) ||
                        (roundTripTab === 'RETURN' && selectedReturn?.id === option.id)
                     );
                     
                     return (
                        <div 
                           key={option.id} 
                           className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                           style={{ animationDelay: `${index * 50}ms` }}
                        >
                           <TravelCard 
                              option={option} 
                              onBook={handleBook}
                              isSelected={isSelected || false}
                              actionLabel={isRoundTrip ? t('select') : t('book_now')}
                              isSaved={savedIds.has(option.id)}
                              onToggleSave={() => handleToggleSave(option)}
                           />
                        </div>
                     );
                  })
               )}
            </div>
         </div>

      </div>

      {/* Round Trip Footer (Fixed) */}
      {isRoundTrip && (selectedOutbound || selectedReturn) && (
        <div className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 shadow-2xl p-4 z-40 shrink-0">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
             <div className="flex-1 w-full md:w-auto flex justify-between md:justify-start gap-8">
               <div className={selectedOutbound ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-slate-600'}>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">{t('tab_one_way')}</div>
                  <div className="font-bold text-sm">{selectedOutbound ? formatPrice(selectedOutbound.price) : 'Select option'}</div>
               </div>
               <div className="text-gray-300 dark:text-slate-700 hidden md:block">|</div>
               <div className={selectedReturn ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-slate-600'}>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">{t('label_return')}</div>
                  <div className="font-bold text-sm">{selectedReturn ? formatPrice(selectedReturn.price) : 'Select option'}</div>
               </div>
             </div>
             
             <div className="flex items-center gap-6 w-full md:w-auto">
                {selectedOutbound && selectedReturn && (
                  <div className="text-right">
                    <div className="text-[10px] text-brand-600 dark:text-brand-400 font-bold bg-brand-50 dark:bg-brand-900/20 px-2 rounded inline-block">5% Discount Applied</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{formatPrice(Math.round(discountedPrice))}</div>
                  </div>
                )}
                
                <Button 
                  disabled={!selectedOutbound || !selectedReturn} 
                  onClick={handleRoundTripCheckout}
                  className="w-full md:w-auto"
                >
                  Book Trip
                </Button>
             </div>
          </div>
        </div>
      )}

      {/* Deep Link Modal */}
      {isDeepLinkModalOpen && pendingDeepLinkOption && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-8 transform scale-100 animate-in zoom-in-95 duration-200 text-center">
            <div className="w-16 h-16 bg-brand-50 dark:bg-brand-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
               <ExternalLink className="h-8 w-8 text-brand-600 dark:text-brand-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Redirecting to {pendingDeepLinkOption.provider}</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-8">
              We are taking you to the {pendingDeepLinkOption.provider} app to complete your booking. 
              If the app isn't installed, we'll use their secure website.
            </p>
            
            <div className="flex gap-3">
               <button 
                 onClick={() => { setIsDeepLinkModalOpen(false); setPendingDeepLinkOption(null); }}
                 className="flex-1 py-3 text-sm font-bold text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-xl transition-colors"
               >
                 Cancel
               </button>
               <Button onClick={confirmDeepLink} className="flex-[2] rounded-xl shadow-lg shadow-brand-500/30">
                 Continue
               </Button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal Fallback */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-sm p-6 transform scale-100 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Share Trip</h3>
              <button onClick={() => setIsShareModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-4 bg-gray-50 dark:bg-slate-900/50 p-3 rounded-lg border border-gray-100 dark:border-slate-700">
              {shareData.text}
            </p>

            <div className="grid grid-cols-2 gap-3 mb-4">
               <a 
                 href={`https://wa.me/?text=${encodeURIComponent(shareData.text + ' ' + shareData.url)}`}
                 target="_blank"
                 rel="noopener noreferrer"
                 className="flex flex-col items-center justify-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 border border-green-200 dark:border-green-900/30 transition-colors"
               >
                 <div className="font-bold text-sm">WhatsApp</div>
               </a>
               <a 
                 href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareData.url)}`}
                 target="_blank"
                 rel="noopener noreferrer"
                 className="flex flex-col items-center justify-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-900/30 transition-colors"
               >
                 <Twitter className="h-5 w-5 mb-1" />
                 <span className="text-xs font-bold">Twitter</span>
               </a>
               <a 
                 href={`mailto:?subject=${encodeURIComponent(shareData.title)}&body=${encodeURIComponent(shareData.text + '\n\n' + shareData.url)}`}
                 className="flex flex-col items-center justify-center p-3 rounded-lg bg-gray-50 dark:bg-slate-900/50 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-900/70 border border-gray-200 dark:border-slate-700 transition-colors"
               >
                 <Mail className="h-5 w-5 mb-1" />
                 <span className="text-xs font-bold">Email</span>
               </a>
               <button 
                 onClick={copyToClipboard}
                 className="flex flex-col items-center justify-center p-3 rounded-lg bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-900/40 border border-brand-200 dark:border-brand-900/30 transition-colors relative"
               >
                 {linkCopied ? <Check className="h-5 w-5 mb-1" /> : <Copy className="h-5 w-5 mb-1" />}
                 <span className="text-xs font-bold">{linkCopied ? 'Copied' : 'Copy Link'}</span>
               </button>
            </div>
            
            {linkCopied && (
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-black text-white text-xs py-1 px-3 rounded-full animate-in fade-in slide-in-from-bottom-2">
                Link Copied to Clipboard
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
