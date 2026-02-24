
import React, { useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { SafetyCenter } from './SafetyCenter';

export const SOSButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 z-40 bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg shadow-red-600/30 transition-all hover:scale-110 flex items-center justify-center group"
        aria-label="Safety Center"
        title="Safety Center"
      >
        <ShieldAlert className="h-6 w-6" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap text-xs font-bold ml-0 group-hover:ml-2">
            Safety
        </span>
      </button>
      <SafetyCenter isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
