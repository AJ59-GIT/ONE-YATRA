
import React from 'react';
import { Leaf, TreeDeciduous, Wind, Share2, Award, Info, ArrowLeft } from 'lucide-react';
import { getUserBookings } from '../services/bookingService';
import { Button } from '../components/Button';

interface ImpactDashboardPageProps {
  onBack: () => void;
}

export const ImpactDashboardPage: React.FC<ImpactDashboardPageProps> = ({ onBack }) => {
  // Mock Calculations based on history
  const bookings = getUserBookings();
  const totalTrips = bookings.length;
  // Assume average trip is 500km. Avg flight is 120g/km. Avg Train is 30g/km.
  // Mock savings: 20kg per trip for demo.
  const co2Saved = totalTrips * 20; 
  const treesEquivalent = Math.floor(co2Saved / 10); // 1 tree ~ 10kg CO2/yr

  return (
    <div className="bg-emerald-50 min-h-screen pb-20">
      
      {/* Header */}
      <div className="bg-emerald-800 text-white p-6 pb-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
           <Leaf className="w-64 h-64" />
        </div>
        <button onClick={onBack} className="relative z-10 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors mb-4">
           <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="relative z-10">
           <h1 className="text-3xl font-bold mb-2">My Eco Impact</h1>
           <p className="text-emerald-100">Tracking your carbon footprint reduction with every journey.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-10 relative z-10 space-y-6">
         
         {/* Bento Grid Stats */}
         <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4">
            
            {/* CO2 Saved - Large */}
            <div className="md:col-span-2 md:row-span-2 bg-white rounded-2xl shadow-xl p-8 flex flex-col justify-between border border-emerald-100">
               <div>
                  <div className="inline-flex p-3 rounded-2xl bg-emerald-100 text-emerald-600 mb-4">
                     <Wind className="h-8 w-8" />
                  </div>
                  <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Carbon Footprint Saved</h3>
                  <div className="text-5xl font-black text-emerald-900">{co2Saved} kg</div>
               </div>
               <div className="mt-8 pt-6 border-t border-emerald-50">
                  <p className="text-xs text-emerald-700 font-medium leading-relaxed">
                     That's equivalent to avoiding {Math.round(co2Saved / 0.2)} km of driving in a standard petrol car!
                  </p>
               </div>
            </div>

            {/* Trees Equivalent - Medium */}
            <div className="md:col-span-2 bg-green-600 rounded-2xl shadow-lg p-6 text-white flex items-center justify-between overflow-hidden relative">
               <div className="relative z-10">
                  <div className="text-green-100 text-[10px] uppercase font-bold tracking-wider mb-1">Nature Impact</div>
                  <div className="text-4xl font-black">{treesEquivalent}</div>
                  <div className="text-xs text-green-100 font-medium uppercase mt-1">Mature Trees Planted</div>
               </div>
               <TreeDeciduous className="h-24 w-24 text-green-500/30 absolute -right-4 -bottom-4 rotate-12" />
            </div>

            {/* Rank - Small */}
            <div className="md:col-span-1 bg-white rounded-2xl shadow-md p-6 border border-teal-100 flex flex-col items-center justify-center text-center">
               <Award className="h-6 w-6 text-teal-600 mb-2" />
               <div className="text-xl font-black text-teal-900">Top 10%</div>
               <div className="text-[10px] text-teal-700 font-bold uppercase">Global Rank</div>
            </div>

            {/* Trips - Small */}
            <div className="md:col-span-1 bg-white rounded-2xl shadow-md p-6 border border-emerald-100 flex flex-col items-center justify-center text-center">
               <Leaf className="h-6 w-6 text-emerald-600 mb-2" />
               <div className="text-xl font-black text-emerald-900">{totalTrips}</div>
               <div className="text-[10px] text-emerald-700 font-bold uppercase">Eco Journeys</div>
            </div>
         </div>

         {/* Visual Chart Section */}
         <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex justify-between items-center mb-8">
               <h3 className="font-bold text-gray-900 flex items-center">
                  <Leaf className="h-5 w-5 text-emerald-500 mr-2" /> Impact Velocity
               </h3>
               <div className="flex gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">CO2 (kg)</span>
               </div>
            </div>
            <div className="flex items-end justify-between h-48 gap-3">
               {[40, 65, 30, 80, 50, 90].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                     <div className="w-full bg-emerald-50 rounded-xl relative transition-all duration-500 hover:bg-emerald-100 cursor-pointer" style={{ height: `100%` }}>
                        <div 
                           className="absolute bottom-0 left-0 right-0 bg-emerald-500 rounded-xl transition-all duration-1000 ease-out group-hover:bg-emerald-600" 
                           style={{ height: `${h}%` }}
                        >
                           <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-xl whitespace-nowrap z-20">
                              {h} kg saved
                           </div>
                        </div>
                     </div>
                     <span className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">
                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i]}
                     </span>
                  </div>
               ))}
            </div>
         </div>

         {/* Offsets */}
         <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-xl shadow-lg p-6 text-white flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
               <h3 className="text-xl font-bold mb-2">Offset your remaining footprint</h3>
               <p className="text-teal-100 text-sm max-w-md">
                  Invest in certified renewable energy projects in Rural India. ₹100 offsets approx 500kg CO2.
               </p>
            </div>
            <Button className="bg-white text-teal-700 hover:bg-teal-50 border-none">
               Offset Now
            </Button>
         </div>

         {/* Share */}
         <div className="text-center pt-8">
            <button className="inline-flex items-center text-emerald-700 font-bold hover:underline">
               <Share2 className="h-4 w-4 mr-2" /> Share my impact certificate
            </button>
         </div>

      </div>
    </div>
  );
};
