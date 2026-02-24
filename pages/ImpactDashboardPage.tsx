
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
         
         {/* Main Stats */}
         <div className="bg-white rounded-2xl shadow-xl p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
               <div className="inline-flex p-3 rounded-full bg-emerald-100 text-emerald-600 mb-3">
                  <Wind className="h-6 w-6" />
               </div>
               <div className="text-3xl font-bold text-emerald-900">{co2Saved} kg</div>
               <div className="text-xs text-emerald-700 font-medium uppercase tracking-wide">CO2 Saved</div>
            </div>
            <div className="p-4 rounded-xl bg-green-50 border border-green-100">
               <div className="inline-flex p-3 rounded-full bg-green-100 text-green-600 mb-3">
                  <TreeDeciduous className="h-6 w-6" />
               </div>
               <div className="text-3xl font-bold text-green-900">{treesEquivalent}</div>
               <div className="text-xs text-green-700 font-medium uppercase tracking-wide">Trees Planted Equiv.</div>
            </div>
            <div className="p-4 rounded-xl bg-teal-50 border border-teal-100">
               <div className="inline-flex p-3 rounded-full bg-teal-100 text-teal-600 mb-3">
                  <Award className="h-6 w-6" />
               </div>
               <div className="text-3xl font-bold text-teal-900">Top 10%</div>
               <div className="text-xs text-teal-700 font-medium uppercase tracking-wide">Eco Traveler Rank</div>
            </div>
         </div>

         {/* Visual Chart (CSS only for simplicity) */}
         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-6 flex items-center">
               <Leaf className="h-5 w-5 text-emerald-500 mr-2" /> Monthly Impact
            </h3>
            <div className="flex items-end justify-between h-40 gap-2">
               {[40, 65, 30, 80, 50, 90].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                     <div className="w-full bg-emerald-100 rounded-t-lg relative transition-all duration-500 hover:bg-emerald-200" style={{ height: `${h}%` }}>
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                           {h}kg
                        </div>
                     </div>
                     <span className="text-[10px] text-gray-400 font-bold">
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
