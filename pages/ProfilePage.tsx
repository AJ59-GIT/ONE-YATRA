
import React, { useState, useEffect, useRef } from 'react';
import { User, MapPin, Shield, Camera, Save, X, Plus, Trash2, Edit2, AlertTriangle, Lock, LogOut, CheckCircle, Smartphone, Home, Briefcase, Key, Settings, Bell, Heart, Globe, Accessibility, Users, Contact, Star, Locate, Eye, EyeOff, Briefcase as BriefcaseIcon, Gift, Leaf, FileText, Scale } from 'lucide-react';
import { UserProfile, Address, EmergencyContact, SavedTraveler, AppView } from '../types';
import { getCurrentUser, updateUserProfile, changePassword, deleteAccount, logoutUser } from '../services/authService';
import { validateIdNumber, IdDocType } from '../utils/idValidation';
import { Button } from '../components/Button';
import { getCityFromCoordinates } from '../services/locationService';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { useTheme } from '../hooks/useTheme';
import { useSettings } from '../contexts/SettingsContext';
import { clearUserData } from '../services/trustService';

interface ProfilePageProps {
  onBack: () => void;
  onLogout: () => void;
  onNavigate?: (view: AppView) => void;
}

type Tab = 'PERSONAL' | 'CO_TRAVELERS' | 'ADDRESS' | 'PREFERENCES' | 'SECURITY' | 'ACCESSIBILITY' | 'TOOLS' | 'LEGAL';

export const ProfilePage: React.FC<ProfilePageProps> = ({ onBack, onLogout, onNavigate }) => {
  const { language, setLanguage, currency, setCurrency } = useSettings();
  const [activeTab, setActiveTab] = useState<Tab>('PERSONAL');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [originalUser, setOriginalUser] = useState<UserProfile | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error'} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Theme Hooks
  const { theme, toggleTheme, highContrast, toggleHighContrast } = useTheme();

  // Address State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [tempAddress, setTempAddress] = useState<Address>({ id: '', type: 'HOME', line1: '', city: '', state: '', zip: '' });
  const [isLocatingAddress, setIsLocatingAddress] = useState(false);

  // Traveler State
  const [isTravelerModalOpen, setIsTravelerModalOpen] = useState(false);
  const [editingTraveler, setEditingTraveler] = useState<SavedTraveler | null>(null);
  const [tempTraveler, setTempTraveler] = useState<SavedTraveler>({ id: '', name: '', age: '', gender: '', relation: 'Family' });
  const [travelerValidationError, setTravelerValidationError] = useState<string | null>(null);

  // Security State
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  
  const addressModalRef = useFocusTrap(isAddressModalOpen, () => setIsAddressModalOpen(false));
  const travelerModalRef = useFocusTrap(isTravelerModalOpen, () => setIsTravelerModalOpen(false));

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      // Ensure defaults for optional fields to avoid undefined errors in controlled inputs
      const sanitized: UserProfile = {
        ...currentUser,
        addresses: currentUser.addresses || [],
        savedTravelers: currentUser.savedTravelers || [],
        emergencyContact: currentUser.emergencyContact || { name: '', relation: '', phone: '' },
        twoFactorEnabled: !!currentUser.twoFactorEnabled,
        medicalInfo: currentUser.medicalInfo || { bloodGroup: '', allergies: '' },
        preferences: {
            seat: currentUser.preferences?.seat || 'ANY',
            meal: currentUser.preferences?.meal || 'ANY',
            language: language || 'en', // Sync with global context
            currency: currency || 'INR',
        },
        accessibility: {
            wheelchair: currentUser.accessibility?.wheelchair || false,
            assistance: currentUser.accessibility?.assistance || false,
        },
        notificationSettings: {
            email: currentUser.notificationSettings?.email ?? true,
            sms: currentUser.notificationSettings?.sms ?? true,
            whatsapp: currentUser.notificationSettings?.whatsapp ?? true,
            push: currentUser.notificationSettings?.push ?? true,
        },
        marketingConsent: {
            newsletter: currentUser.marketingConsent?.newsletter ?? false,
            promos: currentUser.marketingConsent?.promos ?? false,
        }
      };
      setUser(sanitized);
      setOriginalUser(JSON.parse(JSON.stringify(sanitized)));
    }
  }, [language, currency]);

  // ... (Existing CRUD functions remain unchanged: handleSaveProfile, handlePhotoUpload, etc.)
  const hasUnsavedChanges = JSON.stringify(user) !== JSON.stringify(originalUser);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    // Sync global state if changed here
    if (user.preferences?.language) setLanguage(user.preferences.language as any);
    if (user.preferences?.currency) setCurrency(user.preferences.currency as any);

    const success = await updateUserProfile(user);
    setIsSaving(false);
    if (success) {
      setOriginalUser(JSON.parse(JSON.stringify(user)));
      showToast("Profile updated successfully");
    } else {
      showToast("Failed to update profile", "error");
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (window.confirm("You have unsaved changes. Discard them?")) {
        setUser(JSON.parse(JSON.stringify(originalUser)));
      }
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setUser(prev => prev ? { ...prev, avatar: base64 } : null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteData = () => {
      if (window.confirm("Are you sure? This will delete all your local data including bookings, preferences, and wallet history. This action cannot be undone.")) {
          clearUserData();
      }
  };

  // ... (Address & Traveler logic can remain unchanged for brevity, focusing on the updated JSX)
  const openAddressModal = (addr?: Address) => {
    if (addr) {
      setEditingAddress(addr);
      setTempAddress({ ...addr });
    } else {
      setEditingAddress(null);
      setTempAddress({ id: Date.now().toString(), type: 'HOME', line1: '', city: '', state: '', zip: '' });
    }
    setIsAddressModalOpen(true);
  };

  const saveAddress = () => {
    if (!user) return;
    if (!tempAddress.line1 || !tempAddress.city || !tempAddress.zip) {
        alert("Please fill required fields"); return;
    }
    let newAddresses = [...(user.addresses || [])];
    if (tempAddress.isDefaultPickup) newAddresses = newAddresses.map(a => ({ ...a, isDefaultPickup: false }));
    if (tempAddress.isDefaultDrop) newAddresses = newAddresses.map(a => ({ ...a, isDefaultDrop: false }));

    if (editingAddress) newAddresses = newAddresses.map(a => a.id === editingAddress.id ? tempAddress : a);
    else newAddresses.push(tempAddress);
    
    setUser({ ...user, addresses: newAddresses });
    setIsAddressModalOpen(false);
  };

  const deleteAddress = (id: string) => {
    if (!user) return;
    if (window.confirm("Remove this address?")) {
      setUser({ ...user, addresses: user.addresses?.filter(a => a.id !== id) });
    }
  };

  const useCurrentLocation = () => {
      if (!navigator.geolocation) { alert("Geolocation not supported"); return; }
      setIsLocatingAddress(true);
      navigator.geolocation.getCurrentPosition(
          async (position) => {
              try {
                  const city = await getCityFromCoordinates(position.coords.latitude, position.coords.longitude);
                  setTempAddress(prev => ({ ...prev, coordinates: { lat: position.coords.latitude, lng: position.coords.longitude }, city: city || prev.city, state: 'India', zip: '000000' }));
              } catch (e) {} finally { setIsLocatingAddress(false); }
          },
          () => { setIsLocatingAddress(false); alert("Location access denied."); },
          { enableHighAccuracy: true }
      );
  };

  // --- Saved Traveler CRUD ---
  const openTravelerModal = (traveler?: SavedTraveler) => {
    setTravelerValidationError(null);
    if (traveler) { setEditingTraveler(traveler); setTempTraveler({...traveler}); } 
    else { setEditingTraveler(null); setTempTraveler({ id: `t_${Date.now()}`, name: '', age: '', gender: '', relation: 'Family' }); }
    setIsTravelerModalOpen(true);
  };

  const saveTraveler = () => {
    if(!user || !tempTraveler.name) return;

    if (tempTraveler.idType && tempTraveler.idNumber) {
      const v = validateIdNumber(tempTraveler.idType as IdDocType, tempTraveler.idNumber);
      if (!v.isValid) {
        setTravelerValidationError(v.error || 'Invalid ID format');
        return;
      }
      tempTraveler.idNumber = v.normalized;
    }

    let list = [...(user.savedTravelers || [])];
    if (editingTraveler) list = list.map(t => t.id === editingTraveler.id ? tempTraveler : t);
    else list.push(tempTraveler);
    setUser({ ...user, savedTravelers: list });
    setIsTravelerModalOpen(false);
  };

  const deleteTraveler = (id: string) => {
    if(!user) return;
    if (window.confirm("Remove this traveler?")) setUser({ ...user, savedTravelers: user.savedTravelers?.filter(t => t.id !== id) });
  };

  const importContacts = () => {
      const mockContacts: SavedTraveler[] = [
          { id: `t_${Date.now()}_1`, name: "Amit Sharma", age: 32, gender: 'M', relation: 'Colleague', phone: '9876543210' },
          { id: `t_${Date.now()}_2`, name: "Priya Singh", age: 28, gender: 'F', relation: 'Friend', phone: '9988776655' }
      ];
      setUser(prev => prev ? { ...prev, savedTravelers: [...(prev.savedTravelers||[]), ...mockContacts] } : null);
      showToast("2 Contacts Imported");
  };

  const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) { showToast("New passwords do not match", "error"); return; }
    const res = await changePassword(passwords.current, passwords.new);
    if (res.success) { showToast(res.message); setPasswords({ current: '', new: '', confirm: '' }); } 
    else { showToast(res.message, "error"); }
  };

  const inputClasses = "w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white text-gray-900 dark:bg-slate-800 dark:text-white dark:border-slate-600 focus:ring-2 focus:ring-brand-500 outline-none transition-colors";

  const handleLogout = async () => {
    await logoutUser();
    onLogout();
  };

  if (!user) return <div className="p-10 text-center"><p>Loading profile...</p></div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-20 animate-in fade-in duration-300">
      
      {/* Top Banner / Breadcrumb */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
            <X className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline" size="sm" onClick={handleLogout} className="text-red-600 border-red-200 hover:bg-red-50">
              <LogOut className="h-4 w-4 mr-2" /> Logout
           </Button>
           {hasUnsavedChanges && (
             <div className="flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
               <span className="text-xs text-orange-600 font-medium hidden sm:block">Unsaved changes</span>
               <Button variant="outline" size="sm" onClick={handleCancel}>Cancel</Button>
               <Button size="sm" onClick={handleSaveProfile} isLoading={isSaving}>Save Changes</Button>
             </div>
           )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden sticky top-24">
            {/* Minimal Profile Summary */}
            <div className="p-6 text-center border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
              <div className="relative inline-block mb-3 group">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white dark:border-slate-600 shadow-md bg-gray-200">
                  {user.avatar ? (
                    <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <User className="h-10 w-10" />
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-brand-500 p-1.5 rounded-full text-white shadow-sm hover:bg-brand-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
                  aria-label="Upload Photo"
                >
                  <Camera className="h-3 w-3" />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handlePhotoUpload} 
                />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white truncate">{user.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
            </div>

            <nav className="p-2 space-y-1">
              <button 
                onClick={() => setActiveTab('PERSONAL')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 ${activeTab === 'PERSONAL' ? 'bg-brand-50 dark:bg-slate-700 text-brand-700 dark:text-brand-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
              >
                <User className="h-4 w-4" /> Personal Info
              </button>
              <button 
                onClick={() => setActiveTab('TOOLS')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 ${activeTab === 'TOOLS' ? 'bg-brand-50 dark:bg-slate-700 text-brand-700 dark:text-brand-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
              >
                <BriefcaseIcon className="h-4 w-4" /> Travel Tools
              </button>
              <button 
                onClick={() => setActiveTab('CO_TRAVELERS')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 ${activeTab === 'CO_TRAVELERS' ? 'bg-brand-50 dark:bg-slate-700 text-brand-700 dark:text-brand-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
              >
                <Users className="h-4 w-4" /> Co-Travelers
              </button>
              <button 
                onClick={() => setActiveTab('ADDRESS')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 ${activeTab === 'ADDRESS' ? 'bg-brand-50 dark:bg-slate-700 text-brand-700 dark:text-brand-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
              >
                <MapPin className="h-4 w-4" /> Addresses
              </button>
              <button 
                onClick={() => setActiveTab('PREFERENCES')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 ${activeTab === 'PREFERENCES' ? 'bg-brand-50 dark:bg-slate-700 text-brand-700 dark:text-brand-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
              >
                <Settings className="h-4 w-4" /> Preferences
              </button>
              <button 
                onClick={() => setActiveTab('ACCESSIBILITY')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 ${activeTab === 'ACCESSIBILITY' ? 'bg-brand-50 dark:bg-slate-700 text-brand-700 dark:text-brand-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
              >
                <Accessibility className="h-4 w-4" /> Accessibility
              </button>
              <button 
                onClick={() => setActiveTab('SECURITY')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 ${activeTab === 'SECURITY' ? 'bg-brand-50 dark:bg-slate-700 text-brand-700 dark:text-brand-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
              >
                <Shield className="h-4 w-4" /> Security
              </button>
              <button 
                onClick={() => setActiveTab('LEGAL')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 ${activeTab === 'LEGAL' ? 'bg-brand-50 dark:bg-slate-700 text-brand-700 dark:text-brand-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
              >
                <Scale className="h-4 w-4" /> Safety & Legal
              </button>
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 space-y-6">
          
          {/* PERSONAL INFO TAB */}
          {activeTab === 'PERSONAL' && (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 animate-in fade-in slide-in-from-bottom-2">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-slate-700 pb-2">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    value={user.name}
                    onChange={(e) => setUser({ ...user, name: e.target.value })}
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    value={user.email}
                    disabled
                    className="w-full border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-500 dark:text-gray-400 rounded-lg p-2.5 text-sm cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Phone Number</label>
                  <input 
                    type="tel" 
                    value={user.phone || ''}
                    onChange={(e) => setUser({ ...user, phone: e.target.value })}
                    placeholder="+91"
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Date of Birth</label>
                  <input 
                    type="date" 
                    value={user.dob || ''}
                    onChange={(e) => setUser({ ...user, dob: e.target.value })}
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Gender</label>
                  <select 
                    value={user.gender || ''}
                    onChange={(e) => setUser({ ...user, gender: e.target.value as any })}
                    className={inputClasses}
                  >
                    <option value="">Select Gender</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="O">Other</option>
                  </select>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-700">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <AlertTriangle className="h-4 w-4 text-orange-500 mr-2" /> 
                  Emergency Contact
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Contact Name</label>
                    <input 
                      type="text" 
                      value={user.emergencyContact?.name || ''}
                      onChange={(e) => setUser({ ...user, emergencyContact: { ...user.emergencyContact!, name: e.target.value } })}
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Relation</label>
                    <input 
                      type="text" 
                      value={user.emergencyContact?.relation || ''}
                      onChange={(e) => setUser({ ...user, emergencyContact: { ...user.emergencyContact!, relation: e.target.value } })}
                      className={inputClasses}
                      placeholder="e.g. Spouse, Parent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Emergency Phone</label>
                    <input 
                      type="tel" 
                      value={user.emergencyContact?.phone || ''}
                      onChange={(e) => setUser({ ...user, emergencyContact: { ...user.emergencyContact!, phone: e.target.value } })}
                      className={inputClasses}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* LEGAL TAB */}
          {activeTab === 'LEGAL' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                          <Scale className="h-5 w-5 mr-2 text-brand-600" /> Legal & Compliance
                      </h2>
                      <div className="space-y-4">
                          <button 
                            onClick={() => onNavigate?.('PRIVACY')}
                            className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors text-left"
                          >
                              <span className="font-bold text-gray-800 dark:text-gray-200 text-sm">Privacy Policy (DPDP Act 2023)</span>
                              <FileText className="h-4 w-4 text-gray-400" />
                          </button>
                          <button 
                            onClick={() => onNavigate?.('TERMS')}
                            className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors text-left"
                          >
                              <span className="font-bold text-gray-800 dark:text-gray-200 text-sm">Terms & Conditions</span>
                              <FileText className="h-4 w-4 text-gray-400" />
                          </button>
                      </div>
                  </div>

                  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                          <AlertTriangle className="h-5 w-5 mr-2 text-red-600" /> Medical Info (For SOS)
                      </h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">This information will be displayed to emergency responders when you trigger SOS.</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Blood Group</label>
                              <select 
                                value={user.medicalInfo?.bloodGroup || ''}
                                onChange={e => setUser({...user, medicalInfo: {...user.medicalInfo, bloodGroup: e.target.value}})}
                                className={inputClasses}
                              >
                                  <option value="">Select</option>
                                  <option value="A+">A+</option>
                                  <option value="A-">A-</option>
                                  <option value="B+">B+</option>
                                  <option value="B-">B-</option>
                                  <option value="O+">O+</option>
                                  <option value="O-">O-</option>
                                  <option value="AB+">AB+</option>
                                  <option value="AB-">AB-</option>
                              </select>
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Allergies / Conditions</label>
                              <input 
                                type="text"
                                value={user.medicalInfo?.allergies || ''}
                                onChange={e => setUser({...user, medicalInfo: {...user.medicalInfo, allergies: e.target.value}})}
                                className={inputClasses}
                                placeholder="e.g. Penicillin, Diabetes"
                              />
                          </div>
                      </div>
                  </div>

                  <div className="bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30 p-6">
                      <h3 className="font-bold text-red-800 dark:text-red-400 mb-2">Data Controls</h3>
                      <p className="text-xs text-red-600 dark:text-red-400/80 mb-4">Manage your data rights under DPDP Act.</p>
                      <Button onClick={handleDeleteData} variant="outline" className="text-red-600 border-red-200 hover:bg-red-100 dark:border-red-800 dark:hover:bg-red-900/20">
                          Delete My Data & Account
                      </Button>
                  </div>
              </div>
          )}

          {/* ACCESSIBILITY TAB */}
          {activeTab === 'ACCESSIBILITY' && (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 animate-in fade-in slide-in-from-bottom-2">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-slate-700 pb-2">Accessibility Settings</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center">
                    <Eye className="h-4 w-4 mr-2" /> Visual Adjustments
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-slate-700 rounded-lg">
                      <div>
                        <div className="font-bold text-sm text-gray-900 dark:text-white">High Contrast Mode</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Increases contrast ratios, bold text, removes background images.</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={highContrast} onChange={toggleHighContrast} />
                        <div className="w-11 h-6 bg-gray-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PREFERENCES TAB */}
          {activeTab === 'PREFERENCES' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                
                {/* Travel Settings */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                        <Globe className="h-5 w-5 mr-2 text-brand-600" /> Travel & Region
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Preferred Seat</label>
                            <select 
                                value={user.preferences?.seat}
                                onChange={(e) => setUser({...user, preferences: {...user.preferences, seat: e.target.value as any}})}
                                className={inputClasses}
                            >
                                <option value="ANY">Any</option>
                                <option value="WINDOW">Window</option>
                                <option value="AISLE">Aisle</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Meal Preference</label>
                            <select 
                                value={user.preferences?.meal}
                                onChange={(e) => setUser({...user, preferences: {...user.preferences, meal: e.target.value as any}})}
                                className={inputClasses}
                            >
                                <option value="ANY">No Preference</option>
                                <option value="VEG">Vegetarian</option>
                                <option value="NON-VEG">Non-Vegetarian</option>
                                <option value="VEGAN">Vegan</option>
                                <option value="JAIN">Jain</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Language</label>
                            <select 
                                value={user.preferences?.language}
                                onChange={(e) => setUser({...user, preferences: {...user.preferences, language: e.target.value as any}})}
                                className={inputClasses}
                            >
                                <option value="en">English</option>
                                <option value="hi">Hindi (हिंदी)</option>
                                <option value="ta">Tamil (தமிழ்)</option>
                                <option value="bn">Bengali (বাংলা)</option>
                                <option value="te">Telugu (తెలుగు)</option>
                                <option value="ur">Urdu (اردو)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Currency</label>
                            <select 
                                value={user.preferences?.currency}
                                onChange={(e) => setUser({...user, preferences: {...user.preferences, currency: e.target.value as any}})}
                                className={inputClasses}
                            >
                                <option value="INR">Indian Rupee (₹)</option>
                                <option value="USD">US Dollar ($)</option>
                                <option value="EUR">Euro (€)</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
          )}

          {/* TRAVEL TOOLS TAB */}
          {activeTab === 'TOOLS' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Travel Tools</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <button 
                        onClick={() => onNavigate?.('DOCUMENTS')}
                        className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all text-left group"
                    >
                        <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <FileText className="h-6 w-6" />
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-1">Documents Vault</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Securely store your Passport, Visa, and ID cards.</p>
                    </button>

                    <button 
                        onClick={() => onNavigate?.('IMPACT')}
                        className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all text-left group"
                    >
                        <div className="w-12 h-12 rounded-lg bg-green-100 text-green-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Leaf className="h-6 w-6" />
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-1">Eco Dashboard</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Track your carbon footprint and offset emissions.</p>
                    </button>

                    <button 
                        onClick={() => onNavigate?.('GIFT_CARDS')}
                        className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all text-left group"
                    >
                        <div className="w-12 h-12 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Gift className="h-6 w-6" />
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-1">Gift Cards</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Buy or redeem gift cards for friends and family.</p>
                    </button>
                </div>
            </div>
          )}

          {/* ADDRESS TAB */}
          {activeTab === 'ADDRESS' && (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-slate-700 pb-2">
                <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Saved Addresses</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Add home, work, or frequent destinations.</p>
                </div>
                <Button size="sm" onClick={() => openAddressModal()}><Plus className="h-4 w-4 mr-1"/> Add New</Button>
              </div>

              {(!user.addresses || user.addresses.length === 0) ? (
                <div className="text-center py-10 bg-gray-50 dark:bg-slate-900 rounded-lg border border-dashed border-gray-300 dark:border-slate-600">
                  <MapPin className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No addresses saved yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.addresses.map(addr => (
                    <div key={addr.id} className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 hover:border-brand-300 transition-all relative group bg-white dark:bg-slate-800 shadow-sm focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500" tabIndex={0}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`p-1.5 rounded-full ${
                              addr.type === 'HOME' ? 'bg-green-100 text-green-600' :
                              addr.type === 'WORK' ? 'bg-blue-100 text-blue-600' :
                              'bg-gray-100 text-gray-600'
                          }`}>
                              {addr.type === 'HOME' && <Home className="h-4 w-4" />}
                              {addr.type === 'WORK' && <Briefcase className="h-4 w-4" />}
                              {addr.type === 'OTHER' && <MapPin className="h-4 w-4" />}
                          </div>
                          <div>
                              <span className="text-sm font-bold text-gray-900 dark:text-white block">{addr.label || addr.type}</span>
                              <div className="flex gap-2 mt-0.5">
                                  {addr.isDefaultPickup && <span className="text-[10px] bg-brand-50 text-brand-600 px-1.5 py-0.5 rounded border border-brand-100">Default Pickup</span>}
                                  {addr.isDefaultDrop && <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100">Default Drop</span>}
                              </div>
                          </div>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                          <button onClick={() => openAddressModal(addr)} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded focus:outline-none focus:bg-blue-50"><Edit2 className="h-4 w-4"/></button>
                          <button onClick={() => deleteAddress(addr.id)} className="text-red-600 hover:bg-red-50 p-1.5 rounded focus:outline-none focus:bg-red-50"><Trash2 className="h-4 w-4"/></button>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mt-2">{addr.line1}</p>
                      {addr.line2 && <p className="text-xs text-gray-500">{addr.line2}</p>}
                      {addr.landmark && <p className="text-xs text-gray-500 italic mt-1">Landmark: {addr.landmark}</p>}
                      <p className="text-xs text-gray-500 mt-1">{addr.city}, {addr.state} - {addr.zip}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'SECURITY' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Key className="h-5 w-5 mr-2 text-brand-600" /> Change Password
                </h2>
                <form onSubmit={handlePasswordChangeSubmit} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Current Password</label>
                    <input 
                      type="password" 
                      value={passwords.current}
                      onChange={e => setPasswords({...passwords, current: e.target.value})}
                      className={inputClasses}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">New Password</label>
                    <input 
                      type="password" 
                      value={passwords.new}
                      onChange={e => setPasswords({...passwords, new: e.target.value})}
                      className={inputClasses}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Confirm New Password</label>
                    <input 
                      type="password" 
                      value={passwords.confirm}
                      onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                      className={inputClasses}
                      required
                    />
                  </div>
                  <Button type="submit" size="sm">Update Password</Button>
                </form>
              </div>
            </div>
          )}

          {/* CO-TRAVELERS TAB */}
          {activeTab === 'CO_TRAVELERS' && (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 border-b border-gray-100 dark:border-slate-700 pb-2 gap-4">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Saved Co-Travelers</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Manage family and friends for quicker bookings.</p>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={importContacts}
                            className="flex items-center text-xs font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 px-3 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
                        >
                            <Contact className="h-4 w-4 mr-1" /> Import Contacts
                        </button>
                        <Button size="sm" onClick={() => openTravelerModal()}><Plus className="h-4 w-4 mr-1"/> Add New</Button>
                    </div>
                </div>

                {(!user.savedTravelers || user.savedTravelers.length === 0) ? (
                    <div className="text-center py-12 bg-gray-50 dark:bg-slate-900 rounded-lg border border-dashed border-gray-300 dark:border-slate-600">
                        <Users className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No saved travelers yet.</p>
                        <p className="text-xs text-gray-400">Add family members to book tickets for them instantly.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {user.savedTravelers.map(t => (
                            <div key={t.id} className="group border border-gray-200 dark:border-slate-700 rounded-xl p-4 hover:border-brand-300 transition-all bg-white dark:bg-slate-800 shadow-sm hover:shadow-md focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500" tabIndex={0}>
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-sm">
                                            {t.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 dark:text-white text-sm">{t.name}</h4>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                                <span>{t.relation}</span>
                                                <span>•</span>
                                                <span>{t.age} yrs ({t.gender})</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                                        <button onClick={() => openTravelerModal(t)} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded focus:outline-none focus:bg-blue-50"><Edit2 className="h-4 w-4"/></button>
                                        <button onClick={() => deleteTraveler(t.id)} className="text-red-600 hover:bg-red-50 p-1.5 rounded focus:outline-none focus:bg-red-50"><Trash2 className="h-4 w-4"/></button>
                                    </div>
                                </div>
                                
                                {(t.idNumber || t.isDefault) && (
                                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between">
                                        <div className="text-[10px] text-gray-500 dark:text-gray-400 font-mono">
                                            {t.idType}: {t.idNumber || 'Not Added'}
                                        </div>
                                        {t.isDefault && (
                                            <span className="text-[10px] bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-bold flex items-center">
                                                <Star className="h-3 w-3 mr-1 fill-yellow-800" /> Default
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
          )}

        </div>
      </div>

      {/* Address Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" role="dialog" aria-modal="true">
          <div ref={addressModalRef} className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg p-6 transform scale-100 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
               <h3 className="text-lg font-bold text-gray-900 dark:text-white">{editingAddress ? 'Edit Address' : 'Add New Address'}</h3>
               <button onClick={() => setIsAddressModalOpen(false)} className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500 rounded"><X className="h-5 w-5"/></button>
            </div>
            
            <div className="space-y-4">
              {/* Type Selection */}
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Address Type</label>
                <div className="flex gap-2">
                  {['HOME', 'WORK', 'OTHER'].map(t => (
                    <button 
                      key={t}
                      onClick={() => setTempAddress({...tempAddress, type: t as any, label: t === 'OTHER' ? '' : undefined})}
                      className={`flex-1 py-2 text-xs font-bold rounded border transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                          tempAddress.type === t ? 'bg-brand-50 border-brand-500 text-brand-700' : 'bg-white border-gray-200 text-gray-600'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {tempAddress.type === 'OTHER' && (
                  <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Address Label (e.g. Gym, Parents)</label>
                      <input 
                        type="text" 
                        value={tempAddress.label || ''}
                        onChange={e => setTempAddress({...tempAddress, label: e.target.value})}
                        className={inputClasses}
                        placeholder="Custom Name"
                      />
                  </div>
              )}

              {/* Geo-Location */}
              <div className="flex justify-between items-center bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
                  <div className="text-xs text-blue-800 dark:text-blue-300">
                      <strong>Tip:</strong> Use current location to auto-fill details.
                  </div>
                  <button 
                    onClick={useCurrentLocation} 
                    disabled={isLocatingAddress}
                    className="flex items-center text-xs font-bold text-blue-600 hover:text-blue-700 bg-white dark:bg-slate-800 dark:text-blue-400 px-3 py-1.5 rounded border border-blue-200 dark:border-blue-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                      <Locate className={`h-3 w-3 mr-1 ${isLocatingAddress ? 'animate-spin' : ''}`} />
                      {isLocatingAddress ? 'Locating...' : 'Use Current'}
                  </button>
              </div>

              {/* Main Fields */}
              <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Flat / House No / Building</label>
                  <input 
                    type="text" 
                    value={tempAddress.line1}
                    onChange={e => setTempAddress({...tempAddress, line1: e.target.value})}
                    className={inputClasses}
                    placeholder="e.g. A-102, Sunshine Apartments"
                  />
              </div>
              <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Area / Street / Sector</label>
                  <input 
                    type="text" 
                    value={tempAddress.line2 || ''}
                    onChange={e => setTempAddress({...tempAddress, line2: e.target.value})}
                    className={inputClasses}
                    placeholder="Optional"
                  />
              </div>
              <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Landmark</label>
                  <input 
                    type="text" 
                    value={tempAddress.landmark || ''}
                    onChange={e => setTempAddress({...tempAddress, landmark: e.target.value})}
                    className={inputClasses}
                    placeholder="Near City Mall"
                  />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">City</label>
                    <input 
                      type="text" 
                      value={tempAddress.city}
                      onChange={e => setTempAddress({...tempAddress, city: e.target.value})}
                      className={inputClasses}
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Pincode</label>
                    <input 
                      type="text" 
                      value={tempAddress.zip}
                      onChange={e => setTempAddress({...tempAddress, zip: e.target.value})}
                      className={inputClasses}
                    />
                </div>
              </div>

              {/* Defaults */}
              <div className="pt-2 border-t border-gray-100 dark:border-slate-700 flex flex-col gap-2">
                  <label className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-slate-700 rounded cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={tempAddress.isDefaultPickup || false}
                        onChange={e => setTempAddress({...tempAddress, isDefaultPickup: e.target.checked})}
                        className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Set as Default Pickup Location</span>
                  </label>
                  <label className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-slate-700 rounded cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={tempAddress.isDefaultDrop || false}
                        onChange={e => setTempAddress({...tempAddress, isDefaultDrop: e.target.checked})}
                        className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Set as Default Drop Location</span>
                  </label>
              </div>

            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setIsAddressModalOpen(false)} className="flex-1 py-2 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-gray-300">Cancel</button>
              <Button onClick={saveAddress} className="flex-1">Save Address</Button>
            </div>
          </div>
        </div>
      )}

      {/* Traveler Modal */}
      {isTravelerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" role="dialog" aria-modal="true">
          <div ref={travelerModalRef} className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md p-6 transform scale-100 animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh] custom-scrollbar">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{editingTraveler ? 'Edit Traveler' : 'Add Traveler'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={tempTraveler.name}
                  onChange={e => setTempTraveler({...tempTraveler, name: e.target.value})}
                  className={inputClasses}
                  placeholder="As per Gov ID"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Age</label>
                    <input 
                      type="number" 
                      value={tempTraveler.age}
                      onChange={e => setTempTraveler({...tempTraveler, age: parseInt(e.target.value) || ''})}
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Gender</label>
                    <select 
                      value={tempTraveler.gender}
                      onChange={e => setTempTraveler({...tempTraveler, gender: e.target.value as any})}
                      className={inputClasses}
                    >
                        <option value="">Select</option>
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                        <option value="O">Other</option>
                    </select>
                  </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Relation</label>
                <select 
                  value={tempTraveler.relation}
                  onChange={e => setTempTraveler({...tempTraveler, relation: e.target.value})}
                  className={inputClasses}
                >
                    <option value="Spouse">Spouse</option>
                    <option value="Child">Child</option>
                    <option value="Parent">Parent</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Friend">Friend</option>
                    <option value="Colleague">Colleague</option>
                    <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="pt-2 border-t border-gray-100 dark:border-slate-700">
                  <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">ID Proof (Optional)</h4>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                      <select 
                        value={tempTraveler.idType || ''}
                        onChange={e => {
                          const newType = e.target.value as IdDocType;
                          setTempTraveler({...tempTraveler, idType: newType});
                          if (tempTraveler.idNumber) {
                            const v = validateIdNumber(newType, tempTraveler.idNumber);
                            setTravelerValidationError(v.isValid ? null : v.error || 'Invalid format');
                          }
                        }}
                        className={`col-span-1 ${inputClasses}`}
                      >
                          <option value="">Type</option>
                          <option value="AADHAAR">Aadhaar</option>
                          <option value="PAN">PAN</option>
                          <option value="PASSPORT">Passport</option>
                          <option value="VOTER_ID">Voter ID</option>
                          <option value="DRIVING_LICENSE">Driving License</option>
                      </select>
                      <input 
                        type="text" 
                        value={tempTraveler.idNumber || ''}
                        onChange={e => {
                          const val = e.target.value;
                          setTempTraveler({...tempTraveler, idNumber: val});
                          if (tempTraveler.idType) {
                            const v = validateIdNumber(tempTraveler.idType as IdDocType, val);
                            setTravelerValidationError(v.isValid ? null : v.error || 'Invalid format');
                          }
                        }}
                        placeholder="ID Number"
                        className={`col-span-2 ${inputClasses} ${travelerValidationError ? 'border-red-500' : ''}`}
                      />
                  </div>
                  {travelerValidationError && <p className="text-[10px] text-red-500 mb-2">{travelerValidationError}</p>}
              </div>

              <div className="space-y-2 pt-2">
                  <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700">
                      <input 
                          type="checkbox"
                          checked={tempTraveler.isDefault || false}
                          onChange={(e) => setTempTraveler({...tempTraveler, isDefault: e.target.checked})}
                          className="h-4 w-4 text-brand-600 rounded border-gray-300"
                      />
                      <div>
                          <span className="block text-sm font-bold text-gray-900 dark:text-white">Add to all bookings</span>
                          <span className="text-[10px] text-gray-500 dark:text-gray-400">Automatically add this traveler to new trips.</span>
                      </div>
                  </label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setIsTravelerModalOpen(false)} className="flex-1 py-2 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300">Cancel</button>
              <Button onClick={saveTraveler} className="flex-1">Save Traveler</Button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 text-white animate-in slide-in-from-bottom-4 fade-in ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.type === 'success' ? <CheckCircle className="h-5 w-5"/> : <AlertTriangle className="h-5 w-5"/>}
          <span className="text-sm font-medium">{toast.msg}</span>
        </div>
      )}

    </div>
  );
};
