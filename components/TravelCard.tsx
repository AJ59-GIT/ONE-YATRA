
import React, { useState, useEffect } from 'react';
import { Clock, Star, Leaf, IndianRupee, Zap, ChevronDown, ChevronUp, Split, Check, Heart, ShieldCheck, TrendingUp, TrendingDown, Minus, Users, Flag, MapPin } from 'lucide-react';
import { TravelOption } from '../types';
import { TransportIcon } from './TransportIcon';
import { Button } from './Button';
import { ReviewModal } from './ReviewModal';
import { ReviewsList } from './ReviewsList';
import { TrustIndicators } from './TrustIndicators';
import { ReportModal } from './ReportModal';
import { useSettings } from '../contexts/SettingsContext';
import { getTrustBadges } from '../services/trustService';

interface TravelCardProps {
  option: TravelOption;
  onBook: (option: TravelOption) => void;
  isSelected?: boolean;
  actionLabel?: string;
  isSaved?: boolean;
  onToggleSave?: (option: TravelOption) => void;
}

export const TravelCard: React.FC<TravelCardProps> = ({ 
  option, 
  onBook, 
  isSelected, 
  actionLabel,
  isSaved = false,
  onToggleSave
}) => {
  const { formatPrice, t } = useSettings();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showReviewsList, setShowReviewsList] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  
  // Inject Badges dynamically if missing
  const displayOption = {
      ...option,
      trustBadges: option.trustBadges || getTrustBadges(option.mode, option.provider)
  };

  const isMultiLeg = option.legs && option.legs.length > 0;

  // Mock Dynamic Data for Trust Signals
  const bookedCount = Math.floor(Math.random() * 50) + 5; 

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-xl shadow-sm border transition-all duration-300 overflow-hidden group ${
      isSelected 
        ? 'border-brand-500 ring-2 ring-brand-200 dark:ring-brand-900/30 bg-brand-50/20 dark:bg-brand-900/10' 
        : 'border-gray-200 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-500 hover:shadow-md'
    }`}>
      
      {/* Top Banner for Tags */}
      <div className="flex items-start justify-between">
        {option.tag && (
            <div className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 inline-block rounded-br-lg ${
            option.tag === 'Cheapest' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
            option.tag === 'Fastest' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
            'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'
            }`}>
            {t(option.tag.toLowerCase().replace(' ', '_')) || option.tag}
            </div>
        )}
        <div className="ml-auto p-1">
            <button 
                onClick={(e) => { e.stopPropagation(); setShowReportModal(true); }}
                className="text-gray-300 dark:text-slate-700 hover:text-red-400 p-1 rounded transition-colors"
                title="Report this listing"
            >
                <Flag className="h-3 w-3" />
            </button>
        </div>
      </div>

      <div className="p-5 pt-2 relative">
        {/* Save Button */}
        {onToggleSave && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(option);
            }}
            className="absolute top-2 right-2 rtl:right-auto rtl:left-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors z-10"
            title={isSaved ? "Remove from Saved" : "Save for later"}
          >
            <Heart className={`h-5 w-5 transition-colors ${isSaved ? 'fill-red-500 text-red-500' : 'text-gray-300 dark:text-slate-600 hover:text-red-400'}`} />
          </button>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Left: Mode & Provider Info */}
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl flex items-center justify-center h-14 w-14 shadow-sm ${
              option.mode === 'CAB' ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400' :
              option.mode === 'FLIGHT' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' :
              option.mode === 'TRAIN' ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' :
              option.mode === 'BUS' ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' :
              'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' // Mixed
            }`}>
               {option.mode === 'MIXED' ? <Split className="h-6 w-6" /> : <TransportIcon mode={option.mode} className="h-7 w-7" />}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-lg flex items-center gap-2">
                {option.provider}
                {/* Trust Badge */}
                {option.rating && option.rating >= 4.5 && (
                    <div title="Top Rated Provider">
                        <ShieldCheck className="h-4 w-4 text-blue-500" />
                    </div>
                )}
              </h3>
              
              {/* Ratings & Reviews */}
              <div className="flex items-center gap-2 text-xs mt-0.5">
                 {option.rating && (
                   <button 
                        className="font-medium text-gray-700 dark:text-slate-300 flex items-center bg-gray-50 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-gray-100 dark:border-slate-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                        onClick={(e) => { e.stopPropagation(); setShowReviewsList(true); }}
                   >
                     <Star className="h-3 w-3 text-yellow-400 mr-1 fill-yellow-400" /> 
                     {option.rating} 
                     <span className="text-gray-400 dark:text-slate-500 ml-1 underline decoration-dotted">See Reviews</span>
                   </button>
                 )}
                 <div className="text-gray-400 dark:text-slate-600">•</div>
                 <div className="text-gray-500 dark:text-slate-400">{option.mode}</div>
              </div>
              
              {/* New Trust Indicators */}
              <TrustIndicators badges={displayOption.trustBadges || []} />

              {/* Real-time Status */}
              {option.realTimeStatus && (
                <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-brand-600 dark:text-brand-400 animate-pulse">
                  <MapPin className="h-3 w-3" />
                  {option.realTimeStatus}
                </div>
              )}
            </div>
          </div>

          {/* Center: Timing & Duration */}
          <div className="flex items-center gap-6 flex-1 justify-center md:px-8">
             <div className="text-center">
                <div className="text-xl font-bold text-gray-900 dark:text-white">{option.departureTime}</div>
                <div className="text-xs text-gray-400 dark:text-slate-500">{t('dep')}</div>
             </div>
             
             <div className="flex flex-col items-center w-full max-w-[120px]">
                <div className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-1 flex items-center">
                   <Clock className="h-3 w-3 mr-1" /> {option.duration}
                </div>
                <div className="w-full h-0.5 bg-gray-200 dark:bg-slate-800 relative">
                   <div className="absolute left-0 rtl:right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-slate-600"></div>
                   <div className="absolute right-0 rtl:left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-slate-600"></div>
                </div>
                {option.mode === 'CAB' && option.surgeMultiplier && option.surgeMultiplier > 1 && (
                  <div className="text-[10px] font-bold text-red-500 mt-1 flex items-center bg-red-50 dark:bg-red-900/20 px-1.5 rounded">
                     <Zap className="h-3 w-3 mr-0.5 fill-red-500" /> Surge {option.surgeMultiplier}x
                  </div>
                )}
             </div>

             <div className="text-center">
                <div className="text-xl font-bold text-gray-900 dark:text-white">{option.arrivalTime}</div>
                <div className="text-xs text-gray-400 dark:text-slate-500">{t('arr')}</div>
             </div>
          </div>

          {/* Right: Price & Action */}
          <div className="flex items-center justify-between md:flex-col md:items-end gap-3 min-w-[120px]">
             <div className="text-right">
               <div className="text-2xl font-bold text-gray-900 dark:text-white flex items-center justify-end">
                 {formatPrice(option.price)}
               </div>
               
               {option.price > 0 && option.currency !== 'INR' && (
                 <div className="text-xs text-gray-400 dark:text-slate-500 font-mono mt-0.5">
                    (≈ ₹{Math.round(option.price / (option.currency === 'USD' ? 0.012 : 0.011)).toLocaleString()})
                 </div>
               )}

               {option.ecoScore > 70 ? (
                 <div className="text-xs text-green-600 dark:text-green-400 font-medium flex items-center justify-end mt-0.5">
                    <Leaf className="h-3 w-3 mr-1" /> {t('eco_friendly')}
                 </div>
               ) : (
                 <div className="text-[10px] text-gray-400 dark:text-slate-500 flex items-center justify-end mt-0.5">
                    <Users className="h-3 w-3 mr-1" /> {bookedCount} booked today
                 </div>
               )}

               {/* Price Trend */}
               {option.priceTrend && (
                 <div className={`text-[10px] font-bold flex items-center justify-end mt-1 ${
                   option.priceTrend === 'UP' ? 'text-red-500' : 
                   option.priceTrend === 'DOWN' ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-slate-500'
                 }`}>
                   {option.priceTrend === 'UP' ? <TrendingUp className="h-3 w-3 mr-1" /> : 
                    option.priceTrend === 'DOWN' ? <TrendingDown className="h-3 w-3 mr-1" /> : 
                    <Minus className="h-3 w-3 mr-1" />}
                   {option.priceTrend === 'UP' ? 'Prices rising' : 
                    option.priceTrend === 'DOWN' ? 'Price drop' : 'Price stable'}
                 </div>
               )}
             </div>
             
             <Button 
                onClick={() => onBook(option)} 
                className={`w-full md:w-auto transition-all ${isSelected ? 'bg-green-600 hover:bg-green-700' : ''}`}
                variant={isSelected ? 'primary' : 'primary'}
             >
                {isSelected ? <><Check className="h-4 w-4 mr-1" /> {t('select')}</> : (actionLabel || t('book_now'))}
             </Button>
          </div>
        </div>
      
        {/* Expanded Details / Multi-Leg View */}
        {isMultiLeg && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-800">
             <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors mb-2"
             >
                {isExpanded ? 'Hide' : 'Show'} Itinerary Details
                {isExpanded ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
             </button>

             {isExpanded && (
               <div className="relative pl-4 rtl:pl-0 rtl:pr-4 space-y-6 mt-4 before:content-[''] before:absolute before:left-[19px] rtl:before:right-[19px] rtl:before:left-auto before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200 dark:before:bg-slate-800">
                  {option.legs?.map((leg, idx) => (
                    <div key={idx} className="relative flex items-start gap-4 animate-in fade-in slide-in-from-top-2">
                       <div className="absolute -left-[23px] rtl:-right-[23px] rtl:-left-auto top-0 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-full p-1 z-10">
                          <TransportIcon mode={leg.mode} className="h-3 w-3 text-gray-500 dark:text-slate-400" />
                       </div>
                       
                       <div className="flex-1 bg-gray-50 dark:bg-slate-800/50 rounded-lg p-3 border border-gray-100 dark:border-slate-700">
                          <div className="flex justify-between items-start mb-2">
                             <div>
                                <div className="font-bold text-sm text-gray-900 dark:text-white">{leg.provider}</div>
                                <div className="text-xs text-gray-500 dark:text-slate-400">{leg.mode} • {leg.duration}</div>
                             </div>
                             <div className="text-right font-bold text-sm text-gray-700 dark:text-slate-300">
                                {formatPrice(leg.price)}
                             </div>
                          </div>
                          <div className="flex items-center text-xs text-gray-500 dark:text-slate-400 gap-2">
                             <span>{leg.departureTime}</span>
                             <span className="text-gray-300 dark:text-slate-700">→</span>
                             <span>{leg.arrivalTime}</span>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
             )}
          </div>
        )}

      </div>

      <ReviewsList 
        isOpen={showReviewsList}
        onClose={() => setShowReviewsList(false)}
        providerName={option.provider}
      />

      <ReportModal 
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetId={option.id}
        targetType="LISTING"
        targetName={`${option.provider} (${option.mode})`}
      />
    </div>
  );
};
