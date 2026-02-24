
import React, { useState, useEffect } from 'react';
import { ShieldAlert, Phone, MapPin, User, FileText, X, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from './Button';
import { getLocalEmergencyNumbers, triggerSOS, EmergencyNumber } from '../services/trustService';
import { getCurrentUser } from '../services/authService';

interface SafetyCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SafetyCenter: React.FC<SafetyCenterProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [sosSent, setSosSent] = useState(false);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [emergencyNumbers, setEmergencyNumbers] = useState<EmergencyNumber[]>([]);
  const user = getCurrentUser();

  useEffect(() => {
      if (isOpen) {
          // Get Location immediately on open
          if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(async (pos) => {
                  setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                  const nums = await getLocalEmergencyNumbers(pos.coords.latitude, pos.coords.longitude);
                  setEmergencyNumbers(nums);
              });
          }
      }
  }, [isOpen]);

  const handleSOS = async () => {
      if (!location) {
          alert("We need your location to send an SOS. Please enable location permissions.");
          return;
      }
      setLoading(true);
      await triggerSOS(location);
      setLoading(false);
      setSosSent(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-red-900/30 backdrop-blur-md animate-in fade-in">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 sm:zoom-in-95 border border-red-100">
            {/* Header */}
            <div className="bg-red-600 p-6 text-white flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <ShieldAlert className="h-8 w-8" /> Safety Center
                    </h2>
                    <p className="text-red-100 text-sm mt-1">We are here to help you.</p>
                </div>
                <button onClick={onClose} className="p-1 hover:bg-red-500 rounded-full transition-colors"><X className="h-6 w-6"/></button>
            </div>

            <div className="p-6 space-y-6">
                
                {/* SOS Button */}
                {!sosSent ? (
                    <div className="text-center">
                        <button 
                            onClick={handleSOS}
                            disabled={loading}
                            className="w-32 h-32 rounded-full bg-red-100 border-4 border-red-500 flex flex-col items-center justify-center mx-auto hover:bg-red-200 active:scale-95 transition-all shadow-lg shadow-red-500/30 focus:outline-none focus:ring-4 focus:ring-red-300"
                        >
                            {loading ? (
                                <Loader2 className="h-12 w-12 text-red-600 animate-spin" />
                            ) : (
                                <>
                                    <AlertTriangle className="h-10 w-10 text-red-600 mb-1" />
                                    <span className="text-lg font-bold text-red-700">SOS</span>
                                </>
                            )}
                        </button>
                        <p className="text-xs text-gray-500 mt-4">
                            Sends your live location to Emergency Contacts and Local Police.
                        </p>
                    </div>
                ) : (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center animate-in zoom-in">
                        <h3 className="text-xl font-bold text-green-800 mb-2">SOS Sent!</h3>
                        <p className="text-green-700 text-sm">
                            Alerts have been sent to your emergency contacts and local authorities. Help is on the way.
                        </p>
                    </div>
                )}

                <div className="border-t border-gray-100 pt-4"></div>

                {/* Quick Actions */}
                <div className="space-y-3">
                    <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Local Emergency Numbers</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {emergencyNumbers.length > 0 ? emergencyNumbers.map((num, i) => (
                            <a key={i} href={`tel:${num.number}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-300 hover:bg-gray-100 transition-colors">
                                <div className="bg-white p-2 rounded-full text-blue-600 shadow-sm"><Phone className="h-4 w-4"/></div>
                                <div>
                                    <div className="font-bold text-gray-900 text-sm">{num.label}</div>
                                    <div className="text-xs text-gray-500">{num.number}</div>
                                </div>
                            </a>
                        )) : <p className="text-sm text-gray-400 col-span-2">Detecting location for numbers...</p>}
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-4"></div>

                {/* User Info */}
                <div>
                    <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-3">Your Info</h3>
                    <div className="bg-blue-50 rounded-xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <User className="h-5 w-5 text-blue-600" />
                            <div>
                                <div className="font-bold text-gray-900 text-sm">{user?.name || 'Guest'}</div>
                                <div className="text-xs text-blue-700">Blood Group: {user?.medicalInfo?.bloodGroup || 'Not set'}</div>
                            </div>
                        </div>
                        <Button size="sm" variant="outline" className="bg-white border-blue-200 text-blue-700 h-8 text-xs">Edit</Button>
                    </div>
                    {location && (
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                            <MapPin className="h-3 w-3" /> Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}
                        </div>
                    )}
                </div>

            </div>
        </div>
    </div>
  );
};
