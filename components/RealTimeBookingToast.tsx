
import React, { useState, useEffect } from 'react';
import { User, MapPin } from 'lucide-react';

const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Goa', 'Pune', 'Chennai', 'Hyderabad'];
const NAMES = ['Amit', 'Priya', 'Rahul', 'Sneha', 'Vikram', 'Anjali', 'Rohan'];

export const RealTimeBookingToast: React.FC = () => {
  const [notification, setNotification] = useState<{name: string, from: string, to: string} | null>(null);

  useEffect(() => {
    const trigger = () => {
        const name = NAMES[Math.floor(Math.random() * NAMES.length)];
        const from = CITIES[Math.floor(Math.random() * CITIES.length)];
        let to = CITIES[Math.floor(Math.random() * CITIES.length)];
        while(to === from) to = CITIES[Math.floor(Math.random() * CITIES.length)]; // Ensure diff cities

        setNotification({ name, from, to });
        setTimeout(() => setNotification(null), 4000); // Hide after 4s
    };

    // Initial trigger
    const timeout1 = setTimeout(trigger, 5000);
    // Recurring interval
    const interval = setInterval(trigger, 20000); // Every 20s

    return () => {
        clearTimeout(timeout1);
        clearInterval(interval);
    };
  }, []);

  if (!notification) return null;

  return (
    <div className="fixed bottom-20 left-4 z-40 bg-white/90 backdrop-blur-md border border-gray-200 shadow-lg rounded-full px-4 py-2 flex items-center gap-3 animate-in slide-in-from-left fade-in duration-500 max-w-[90vw]">
        <div className="bg-brand-100 p-1.5 rounded-full">
            <User className="h-3 w-3 text-brand-600" />
        </div>
        <div className="text-xs text-gray-700">
            <span className="font-bold">{notification.name}</span> just booked a trip to <span className="font-bold">{notification.to}</span>
        </div>
    </div>
  );
};
