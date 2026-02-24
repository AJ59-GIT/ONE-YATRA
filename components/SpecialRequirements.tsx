
import React, { useState, useEffect } from 'react';
import { Accessibility, Briefcase, Dog, Baby, MessageSquare, AlertCircle, Check, Info } from 'lucide-react';
import { SpecialRequestOption, TransportMode } from '../types';
import { Button } from './Button';

interface SpecialRequirementsProps {
  mode: TransportMode;
  onConfirm: (selected: SpecialRequestOption[], notes: string) => void;
  onSkip: () => void;
}

const REQUEST_OPTIONS: SpecialRequestOption[] = [
  {
    id: 'wheelchair',
    label: 'Wheelchair Assistance',
    description: 'Airport/Station assistance from check-in to boarding.',
    price: 0,
    allowedModes: ['FLIGHT', 'TRAIN', 'BUS'],
    icon: <Accessibility className="h-5 w-5" />
  },
  {
    id: 'extra_luggage',
    label: 'Extra Luggage Allowance',
    description: 'Add 15kg extra baggage allowance.',
    price: 500,
    allowedModes: ['FLIGHT', 'BUS', 'CAB'],
    icon: <Briefcase className="h-5 w-5" />
  },
  {
    id: 'pet_travel',
    label: 'Pet Travel',
    description: 'Carry a small pet (cat/dog) in a carrier.',
    price: 1500,
    allowedModes: ['CAB', 'TRAIN'], // Usually restricted on buses/some flights without prior booking
    icon: <Dog className="h-5 w-5" />
  },
  {
    id: 'minor',
    label: 'Unaccompanied Minor',
    description: 'Escort service for children traveling alone.',
    price: 1000,
    allowedModes: ['FLIGHT'],
    icon: <Baby className="h-5 w-5" />
  }
];

export const SpecialRequirements: React.FC<SpecialRequirementsProps> = ({ mode, onConfirm, onSkip }) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState('');

  const availableOptions = REQUEST_OPTIONS.filter(opt => 
    opt.allowedModes.includes(mode) || mode === 'MIXED'
  );

  useEffect(() => {
    // Auto-select based on user profile preferences
    try {
        const userRaw = localStorage.getItem('oneyatra_current_user');
        if (userRaw) {
            const user = JSON.parse(userRaw);
            const preSelected = new Set<string>();
            
            if (user.accessibility?.wheelchair) {
                preSelected.add('wheelchair');
            }
            // Add assistance if applicable logic exists in REQUEST_OPTIONS, currently mapped to wheelchair effectively
            
            if (preSelected.size > 0) {
                setSelectedIds(preSelected);
            }
        }
    } catch(e) {}
  }, []);

  const toggleOption = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleConfirm = () => {
    const selected = availableOptions.filter(opt => selectedIds.has(opt.id));
    onConfirm(selected, notes);
  };

  const totalCost = availableOptions
    .filter(opt => selectedIds.has(opt.id))
    .reduce((sum, opt) => sum + opt.price, 0);

  return (
    <div className="animate-in fade-in zoom-in-95 duration-300 flex flex-col h-full bg-slate-50 rounded-xl border border-gray-200 overflow-hidden">
      
      {/* Header */}
      <div className="bg-white p-4 border-b border-gray-200 shadow-sm z-10">
         <div className="flex justify-between items-center">
            <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-brand-600" />
                Special Requirements
                </h2>
                <p className="text-xs text-gray-500">Customize your journey for your needs</p>
            </div>
            {totalCost > 0 && (
                <div className="text-right">
                    <div className="text-xs text-gray-500">Total Extra</div>
                    <div className="text-lg font-bold text-gray-900">₹{totalCost}</div>
                </div>
            )}
         </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
         
         <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-6 flex items-start">
            <Info className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-800">
               Availability of special services depends on the provider ({mode}). We will forward your request immediately upon booking.
            </p>
         </div>

         <div className="space-y-3">
            {availableOptions.map(option => {
              const isSelected = selectedIds.has(option.id);
              return (
                <div 
                   key={option.id}
                   onClick={() => toggleOption(option.id)}
                   className={`relative p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between group ${
                       isSelected 
                       ? 'bg-white border-brand-500 ring-1 ring-brand-500 shadow-sm' 
                       : 'bg-white border-gray-200 hover:border-brand-200'
                   }`}
                >
                   <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${isSelected ? 'bg-brand-100 text-brand-600' : 'bg-gray-100 text-gray-500'}`}>
                         {option.icon}
                      </div>
                      <div>
                         <h3 className="font-bold text-gray-900 text-sm">{option.label}</h3>
                         <p className="text-xs text-gray-500">{option.description}</p>
                      </div>
                   </div>
                   
                   <div className="flex items-center gap-4">
                      <div className="text-right">
                         <div className={`font-bold text-sm ${option.price === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                            {option.price === 0 ? 'Free' : `₹${option.price}`}
                         </div>
                      </div>
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                          isSelected ? 'bg-brand-500 border-brand-500' : 'border-gray-300 bg-white'
                      }`}>
                          {isSelected && <Check className="h-3 w-3 text-white" />}
                      </div>
                   </div>
                </div>
              );
            })}

            {availableOptions.length === 0 && (
               <div className="text-center py-8 text-gray-500 text-sm">
                  No specific add-ons available for this transport mode. You can still add notes below.
               </div>
            )}
         </div>

         {/* Notes */}
         <div className="mt-8">
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
               Additional Notes
               <span className="ml-2 text-[10px] font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Optional</span>
            </label>
            <textarea 
               value={notes}
               onChange={(e) => setNotes(e.target.value)}
               placeholder="Example: Need help carrying bags, passenger is elderly, etc."
               className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none h-24 resize-none"
            />
            <p className="text-[10px] text-gray-400 mt-2 flex items-center">
               <AlertCircle className="h-3 w-3 mr-1" />
               Providers will do their best to accommodate special requests, but they cannot be guaranteed in all regions.
            </p>
         </div>

      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
         <div className="flex gap-3">
            <button 
               onClick={onSkip}
               className="flex-1 py-3 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-lg transition-colors"
            >
               Skip
            </button>
            <Button 
               onClick={handleConfirm}
               className="flex-[2]"
            >
               {totalCost > 0 
                 ? `Add Requests (₹${totalCost})` 
                 : 'Confirm Requests'
               }
            </Button>
         </div>
      </div>
    </div>
  );
};
