
import React, { useState, useEffect } from 'react';
import { MessageSquare, X } from 'lucide-react';

interface SMS {
  id: string;
  text: string;
  type: string;
  timestamp: number;
}

export const SMSNotification: React.FC = () => {
  const [notifications, setNotifications] = useState<SMS[]>([]);

  useEffect(() => {
    const handleSMS = (event: Event) => {
      const customEvent = event as CustomEvent;
      const newSMS: SMS = {
        id: Math.random().toString(36).substr(2, 9),
        text: customEvent.detail.text,
        type: customEvent.detail.type,
        timestamp: customEvent.detail.timestamp
      };

      setNotifications(prev => [newSMS, ...prev]);

      // Auto dismiss
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== newSMS.id));
      }, 6000);
    };

    window.addEventListener('oneyatra-sms-received', handleSMS);
    return () => window.removeEventListener('oneyatra-sms-received', handleSMS);
  }, []);

  if (notifications.length === 0) return null;

  return (
    <div 
      className="fixed top-4 left-0 right-0 z-[100] flex flex-col items-center pointer-events-none gap-2 px-4"
      role="region"
      aria-live="polite"
      aria-label="Notifications"
    >
      {notifications.map((sms, index) => (
        <div 
          key={sms.id}
          role="alert"
          className="bg-gray-900/95 backdrop-blur-md text-white p-3 rounded-2xl shadow-2xl flex items-start gap-3 max-w-sm w-full pointer-events-auto border border-gray-700 animate-in slide-in-from-top-full duration-500"
          style={{ marginTop: index * -60, transform: `scale(${1 - index * 0.05}) translateY(${index * 10}px)`, opacity: 1 - index * 0.2, zIndex: 100 - index }}
        >
          <div className="bg-green-500 p-2 rounded-full shrink-0" aria-hidden="true">
            <MessageSquare className="h-4 w-4 text-white fill-current" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center mb-0.5">
              <span className="text-xs font-bold text-gray-300">MESSAGES • now</span>
            </div>
            <p className="text-xs font-medium leading-relaxed">{sms.text}</p>
          </div>
          <button 
            onClick={() => setNotifications(prev => prev.filter(n => n.id !== sms.id))}
            className="text-gray-500 hover:text-white transition-colors"
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  );
};
