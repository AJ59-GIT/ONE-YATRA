
import React, { useState, useEffect } from 'react';
import { Cookie, X, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { Button } from './Button';
import { getCookiePreferences, saveCookiePreferences, CookiePreferences } from '../services/trustService';

export const CookieConsent: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  const [prefs, setPrefs] = useState<CookiePreferences>({
      analytics: true,
      marketing: false,
      functional: true,
      timestamp: 0
  });

  useEffect(() => {
      const existing = getCookiePreferences();
      if (!existing) {
          // Slight delay to not block initial render
          setTimeout(() => setIsOpen(true), 1500);
      }
  }, []);

  const handleAcceptAll = () => {
      const newPrefs = { analytics: true, marketing: true, functional: true, timestamp: Date.now() };
      saveCookiePreferences(newPrefs);
      setIsOpen(false);
  };

  const handleRejectAll = () => {
      const newPrefs = { analytics: false, marketing: false, functional: true, timestamp: Date.now() }; // Functional usually mandatory
      saveCookiePreferences(newPrefs);
      setIsOpen(false);
  };

  const handleSavePreferences = () => {
      saveCookiePreferences({ ...prefs, timestamp: Date.now() });
      setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] p-4 animate-in slide-in-from-bottom-full duration-500">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            <div className="p-6">
                <div className="flex items-start gap-4">
                    <div className="bg-brand-100 p-3 rounded-full shrink-0 hidden sm:block">
                        <Cookie className="h-6 w-6 text-brand-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">We value your privacy</h3>
                        <p className="text-sm text-gray-600 leading-relaxed mb-4">
                            We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies. Read our <a href="/privacy" className="text-brand-600 underline">Privacy Policy</a>.
                        </p>
                        
                        {showDetails && (
                            <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-3 animate-in slide-in-from-top-2 border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-green-600" />
                                        <span className="text-sm font-bold text-gray-800">Essential</span>
                                    </div>
                                    <span className="text-xs text-gray-400">Required</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={prefs.functional} onChange={e => setPrefs({...prefs, functional: e.target.checked})} className="rounded text-brand-600 focus:ring-brand-500" />
                                        <span className="text-sm font-bold text-gray-800">Functional</span>
                                    </label>
                                    <span className="text-xs text-gray-500">Preferences</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={prefs.analytics} onChange={e => setPrefs({...prefs, analytics: e.target.checked})} className="rounded text-brand-600 focus:ring-brand-500" />
                                        <span className="text-sm font-bold text-gray-800">Analytics</span>
                                    </label>
                                    <span className="text-xs text-gray-500">Usage Stats</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={prefs.marketing} onChange={e => setPrefs({...prefs, marketing: e.target.checked})} className="rounded text-brand-600 focus:ring-brand-500" />
                                        <span className="text-sm font-bold text-gray-800">Marketing</span>
                                    </label>
                                    <span className="text-xs text-gray-500">Ads</span>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-3">
                            <button 
                                onClick={() => setShowDetails(!showDetails)}
                                className="text-sm font-bold text-gray-500 hover:text-gray-900 flex items-center justify-center sm:justify-start"
                            >
                                {showDetails ? 'Hide Details' : 'Customize'}
                                {showDetails ? <ChevronUp className="h-4 w-4 ml-1"/> : <ChevronDown className="h-4 w-4 ml-1"/>}
                            </button>
                            <div className="flex-1"></div>
                            {showDetails ? (
                                <Button onClick={handleSavePreferences}>Save Preferences</Button>
                            ) : (
                                <>
                                    <button onClick={handleRejectAll} className="px-6 py-2 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors">Reject All</button>
                                    <Button onClick={handleAcceptAll}>Accept All</Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};
