
import React, { useState, useEffect } from 'react';
import { Utensils, Leaf, Beef, AlertCircle, Star, Check, X, ChevronRight } from 'lucide-react';
import { Meal, Passenger } from '../types';
import { Button } from './Button';

interface MealSelectionProps {
  passengers: Passenger[];
  onConfirm: (meal: Meal | null, specialRequests: string) => void;
  onSkip: () => void;
  currency: string;
}

// Mock Data
const MEAL_OPTIONS: Meal[] = [
  {
    id: 'veg-standard',
    name: 'Standard Veg Thali',
    description: 'Paneer Butter Masala, Dal, Rice, and 2 Rotis. Comfort food.',
    type: 'VEG',
    price: 350,
    isPopular: true,
    image: '🥘'
  },
  {
    id: 'chicken-biryani',
    name: 'Hyderabadi Chicken Biryani',
    description: 'Aromatic basmati rice cooked with tender chicken and spices. Served with Raita.',
    type: 'NON-VEG',
    price: 450,
    isPopular: true,
    image: '🍗'
  },
  {
    id: 'jain-meal',
    name: 'Jain Special Meal',
    description: 'No onion, no garlic. Chef special paneer gravy with rice and paratha.',
    type: 'JAIN',
    price: 350,
    image: '🥗'
  },
  {
    id: 'sandwich-combo',
    name: 'Chicken Club Sandwich',
    description: 'Grilled chicken, egg, lettuce and mayo in whole wheat bread.',
    type: 'NON-VEG',
    price: 300,
    image: '🥪'
  },
  {
    id: 'vegan-bowl',
    name: 'Vegan Buddha Bowl',
    description: 'Quinoa, chickpeas, avocado, and tahini dressing. Healthy and light.',
    type: 'VEGAN',
    price: 400,
    image: '🥑'
  },
  {
    id: 'samosa-chai',
    name: 'Samosa & Masala Chai',
    description: '2 Crispy Samosas served with hot ginger tea.',
    type: 'VEG',
    price: 150,
    image: '☕'
  }
];

export const MealSelection: React.FC<MealSelectionProps> = ({ passengers, onConfirm, onSkip, currency }) => {
  const [selectedMealId, setSelectedMealId] = useState<string | null>(null);
  const [specialRequests, setSpecialRequests] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'VEG' | 'NON-VEG' | 'JAIN' | 'VEGAN'>('ALL');
  const [showAllergyInput, setShowAllergyInput] = useState(false);

  useEffect(() => {
    // Attempt to load user preference from local storage
    try {
      const userRaw = localStorage.getItem('oneyatra_current_user');
      if (userRaw) {
        const user = JSON.parse(userRaw);
        if (user.preferences?.meal && user.preferences.meal !== 'ANY') {
           setFilter(user.preferences.meal);
        }
      }
    } catch (e) {}
  }, []);

  const handleConfirm = () => {
    const meal = MEAL_OPTIONS.find(m => m.id === selectedMealId) || null;
    onConfirm(meal, specialRequests);
  };

  const filteredMeals = MEAL_OPTIONS.filter(m => {
    if (filter === 'ALL') return true;
    if (filter === 'VEG') return m.type === 'VEG' || m.type === 'JAIN' || m.type === 'VEGAN';
    return m.type === filter;
  });

  const selectedMeal = MEAL_OPTIONS.find(m => m.id === selectedMealId);

  return (
    <div className="animate-in fade-in zoom-in-95 duration-300 flex flex-col h-full bg-slate-50 rounded-xl border border-gray-200 overflow-hidden">
      
      {/* Header */}
      <div className="bg-white p-4 border-b border-gray-200 shadow-sm z-10">
         <div className="flex justify-between items-center mb-4">
            <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Utensils className="h-5 w-5 text-brand-600" />
                Add a Meal
                </h2>
                <p className="text-xs text-gray-500">Delicious meals served at your seat</p>
            </div>
            {selectedMeal && (
                <div className="text-right">
                    <div className="text-xs text-gray-500">Total Addition</div>
                    <div className="text-lg font-bold text-gray-900">₹{selectedMeal.price * passengers.length}</div>
                </div>
            )}
         </div>

         {/* Filters */}
         <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {['ALL', 'VEG', 'NON-VEG', 'JAIN', 'VEGAN'].map((f) => (
                <button
                    key={f}
                    onClick={() => setFilter(f as any)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${
                        filter === f 
                        ? 'bg-brand-600 text-white border-brand-600 shadow-md' 
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                    }`}
                >
                    {f === 'ALL' ? 'All Items' : f.charAt(0) + f.slice(1).toLowerCase()}
                </button>
            ))}
         </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMeals.map(meal => (
                <div 
                    key={meal.id}
                    onClick={() => setSelectedMealId(meal.id === selectedMealId ? null : meal.id)}
                    className={`relative p-4 rounded-xl border cursor-pointer transition-all group hover:shadow-md ${
                        selectedMealId === meal.id 
                        ? 'bg-white border-brand-500 ring-1 ring-brand-500 shadow-sm' 
                        : 'bg-white border-gray-200 hover:border-brand-200'
                    }`}
                >
                    {meal.isPopular && (
                        <span className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-900" /> Bestseller
                        </span>
                    )}

                    <div className="flex gap-4">
                        <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-4xl shadow-inner shrink-0">
                            {meal.image}
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className={`border p-[1px] rounded-sm ${meal.type === 'NON-VEG' ? 'border-red-500' : 'border-green-600'}`}>
                                            <div className={`w-2 h-2 rounded-full ${meal.type === 'NON-VEG' ? 'bg-red-500' : 'bg-green-600'}`}></div>
                                        </div>
                                        <h3 className="font-bold text-gray-900 text-sm">{meal.name}</h3>
                                    </div>
                                    <p className="text-xs text-gray-500 line-clamp-2">{meal.description}</p>
                                </div>
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                                    selectedMealId === meal.id ? 'bg-brand-500 border-brand-500' : 'border-gray-300'
                                }`}>
                                    {selectedMealId === meal.id && <Check className="h-3 w-3 text-white" />}
                                </div>
                            </div>
                            <div className="mt-2 flex items-center justify-between">
                                <span className="font-bold text-gray-900">₹{meal.price}</span>
                                {meal.type === 'VEGAN' && <span className="text-[10px] text-green-600 flex items-center"><Leaf className="h-3 w-3 mr-1"/> Vegan</span>}
                                {meal.type === 'JAIN' && <span className="text-[10px] text-orange-600 flex items-center">Satvik</span>}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
         </div>

         {/* Special Requests */}
         <div className="mt-6">
            <button 
                onClick={() => setShowAllergyInput(!showAllergyInput)}
                className="flex items-center text-sm font-medium text-brand-600 hover:text-brand-700"
            >
                {showAllergyInput ? <ChevronRight className="h-4 w-4 mr-1 rotate-90"/> : <ChevronRight className="h-4 w-4 mr-1"/>}
                Add Cooking Instructions / Allergies
            </button>
            
            {showAllergyInput && (
                <div className="mt-2 animate-in fade-in slide-in-from-top-2">
                    <textarea 
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                        placeholder="E.g., No peanuts, less spicy, diabetic friendly..."
                        className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none h-20 resize-none"
                    />
                    <p className="text-[10px] text-gray-400 mt-1 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        We will try our best to convey this to the catering partner.
                    </p>
                </div>
            )}
         </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
         <div className="flex gap-3">
            <button 
               onClick={onSkip}
               className="flex-1 py-3 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-lg transition-colors"
            >
               Skip Meal
            </button>
            <Button 
               onClick={handleConfirm}
               className="flex-[2]"
            >
               {selectedMealId 
                 ? `Add Meal for ₹${(selectedMeal?.price || 0) * passengers.length}` 
                 : 'Confirm Selection'
               }
            </Button>
         </div>
      </div>
    </div>
  );
};
