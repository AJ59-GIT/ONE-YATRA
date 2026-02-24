
import React, { useState } from 'react';
import { ArrowLeft, Plus, MapPin, Clock, Utensils, Bed, GripVertical, Trash2, Calendar, Download, Share2, Save } from 'lucide-react';
import { Button } from '../components/Button';
import { ItineraryItem } from '../types';
import { WeatherWidget } from '../components/WeatherWidget';

interface ItineraryBuilderPageProps {
  onBack: () => void;
}

export const ItineraryBuilderPage: React.FC<ItineraryBuilderPageProps> = ({ onBack }) => {
  const [items, setItems] = useState<ItineraryItem[]>([
    { id: '1', day: 1, type: 'TRAVEL', title: 'Flight to Goa', time: '10:00 AM', cost: 5000 },
    { id: '2', day: 1, type: 'STAY', title: 'Check-in at Taj Resort', time: '02:00 PM', cost: 12000, location: 'North Goa' },
    { id: '3', day: 1, type: 'EAT', title: 'Lunch at Fisherman\'s Wharf', time: '03:00 PM', cost: 2000 },
  ]);

  const addItem = () => {
    const newItem: ItineraryItem = {
      id: Date.now().toString(),
      day: 1,
      type: 'ACTIVITY',
      title: 'New Activity',
      time: '05:00 PM',
      cost: 0
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const totalCost = items.reduce((sum, item) => sum + item.cost, 0);

  const getIcon = (type: ItineraryItem['type']) => {
    switch (type) {
        case 'TRAVEL': return <MapPin className="h-4 w-4" />;
        case 'STAY': return <Bed className="h-4 w-4" />;
        case 'EAT': return <Utensils className="h-4 w-4" />;
        default: return <Clock className="h-4 w-4" />;
    }
  };

  const moveItem = (index: number, direction: 'UP' | 'DOWN') => {
      const newItems = [...items];
      if (direction === 'UP' && index > 0) {
          [newItems[index], newItems[index-1]] = [newItems[index-1], newItems[index]];
      } else if (direction === 'DOWN' && index < newItems.length - 1) {
          [newItems[index], newItems[index+1]] = [newItems[index+1], newItems[index]];
      }
      setItems(newItems);
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-20">
            <div className="max-w-5xl mx-auto flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full"><ArrowLeft className="h-5 w-5"/></button>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900">Goa Trip 2024</h1>
                        <p className="text-xs text-gray-500">3 Days • 2 Travelers</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600"><Share2 className="h-5 w-5"/></button>
                    <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600"><Download className="h-5 w-5"/></button>
                    <Button size="sm"><Save className="h-4 w-4 mr-1"/> Save</Button>
                </div>
            </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left: Builder */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* Day Header */}
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-800">Day 1</h2>
                    <span className="text-sm text-gray-500 flex items-center gap-1"><Calendar className="h-4 w-4"/> Oct 12, 2024</span>
                </div>

                <div className="space-y-3 relative">
                    {/* Vertical Line */}
                    <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-gray-200 -z-10"></div>

                    {items.map((item, index) => (
                        <div key={item.id} className="flex items-start gap-4 group">
                            {/* Time Marker */}
                            <div className="w-12 pt-4 text-right text-xs font-bold text-gray-500 shrink-0">
                                {item.time}
                            </div>
                            
                            {/* Card */}
                            <div className="flex-1 bg-white border border-gray-200 rounded-xl p-4 shadow-sm relative transition-shadow hover:shadow-md">
                                {/* Type Badge */}
                                <div className="absolute -left-3 top-4 bg-brand-500 text-white p-1.5 rounded-full ring-4 ring-slate-50">
                                    {getIcon(item.type)}
                                </div>

                                <div className="ml-3 flex justify-between items-start">
                                    <div>
                                        <input 
                                            value={item.title}
                                            onChange={(e) => {
                                                const copy = [...items];
                                                copy[index].title = e.target.value;
                                                setItems(copy);
                                            }}
                                            className="font-bold text-gray-900 border-none p-0 focus:ring-0 w-full"
                                        />
                                        <input 
                                            value={item.location || ''}
                                            placeholder="Add location"
                                            onChange={(e) => {
                                                const copy = [...items];
                                                copy[index].location = e.target.value;
                                                setItems(copy);
                                            }}
                                            className="text-xs text-gray-500 mt-1 w-full border-none p-0 focus:ring-0"
                                        />
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-sm text-gray-700">₹{item.cost}</div>
                                        <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => moveItem(index, 'UP')} className="p-1 hover:bg-gray-100 rounded text-gray-400"><GripVertical className="h-3 w-3"/></button>
                                            <button onClick={() => removeItem(item.id)} className="p-1 hover:bg-red-50 text-red-400 rounded"><Trash2 className="h-3 w-3"/></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    <button 
                        onClick={addItem}
                        className="ml-16 w-[calc(100%-4rem)] py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-400 font-bold hover:border-brand-400 hover:text-brand-500 hover:bg-brand-50 transition-all flex items-center justify-center gap-2"
                    >
                        <Plus className="h-5 w-5" /> Add Activity
                    </button>
                </div>
            </div>

            {/* Right: Summary & Tools */}
            <div className="space-y-6">
                <WeatherWidget city="Goa" />
                
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4">Budget Summary</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Activities</span>
                            <span>₹{items.filter(i => i.type === 'ACTIVITY').reduce((s,i)=>s+i.cost,0)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Travel</span>
                            <span>₹{items.filter(i => i.type === 'TRAVEL').reduce((s,i)=>s+i.cost,0)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Stay</span>
                            <span>₹{items.filter(i => i.type === 'STAY').reduce((s,i)=>s+i.cost,0)}</span>
                        </div>
                        <div className="border-t border-gray-100 pt-2 mt-2 flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span className="text-brand-600">₹{totalCost}</span>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
  );
};
