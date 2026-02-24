
import React, { useState, useEffect } from 'react';
import { Menu, User, Zap, Server, LogOut, Trash2, Heart, Settings, Crown, Briefcase, Wallet, LifeBuoy, Bell, AlertTriangle, Moon, Sun, Globe, Building2, Layout } from 'lucide-react';
import { clearAuthData, getCurrentUser } from '../services/authService';
import { AppView, UserProfile } from '../types';
import { NotificationCenter } from './NotificationCenter';
import { useTheme } from '../hooks/useTheme';
import { useSettings } from '../contexts/SettingsContext';

interface HeaderProps {
  onNavigate?: (view: AppView) => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, onLogout }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showArch, setShowArch] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, currency, setCurrency, isB2BMode, toggleB2BMode, t, dir } = useSettings();

  useEffect(() => {
    const userData = getCurrentUser();
    setUser(userData);
    
    const archPref = localStorage.getItem('oneyatra_show_arch');
    if (archPref === 'true') setShowArch(true);
  }, []);

  const toggleArch = () => {
    const newVal = !showArch;
    setShowArch(newVal);
    localStorage.setItem('oneyatra_show_arch', String(newVal));
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to clear all user data? This will log you out and clear the local database.")) {
      clearAuthData();
      window.location.reload();
    }
  };

  const displayName = user?.name || user?.email || 'Traveler';

  return (
    <header className={`sticky top-0 z-50 backdrop-blur-md border-b transition-all duration-300 ${isB2BMode ? 'bg-slate-900 text-white border-slate-800' : 'bg-white/90 dark:bg-slate-900/90 border-gray-100 dark:border-slate-800'}`} dir={dir}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div 
            className="flex items-center cursor-pointer group" 
            onClick={() => onNavigate?.(isB2BMode ? 'CORPORATE' : 'HOME')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onNavigate?.(isB2BMode ? 'CORPORATE' : 'HOME')}
            aria-label="Go to Home"
          >
            <div className={`p-1.5 rounded-lg mr-2 transition-transform group-hover:scale-110 ${isB2BMode ? 'bg-blue-600' : 'bg-brand-500'}`}>
              {isB2BMode ? <Building2 className="h-5 w-5 text-white"/> : <Zap className="h-5 w-5 text-white" fill="currentColor" aria-hidden="true" />}
            </div>
            <span className={`text-xl font-bold bg-clip-text text-transparent ${isB2BMode ? 'bg-gradient-to-r from-blue-400 to-indigo-400' : 'bg-gradient-to-r from-brand-600 to-brand-500 dark:from-brand-400 dark:to-brand-600'}`}>
              {t('app_name')} {isB2BMode && <span className="text-xs font-mono ml-1 px-1 border rounded opacity-70">CORP</span>}
            </span>
          </div>
          
          <nav className="hidden md:flex space-x-6 items-center rtl:space-x-reverse" aria-label="Desktop Navigation">
            {!isB2BMode && (
                <>
                    <button onClick={() => onNavigate?.('HOME')} className="text-sm font-medium hover:text-brand-600 transition-colors">{t('nav_plan')}</button>
                    <button onClick={() => onNavigate?.('MY_TRIPS')} className="text-sm font-medium hover:text-brand-600 transition-colors">{t('nav_trips')}</button>
                    <button onClick={() => onNavigate?.('ITINERARY')} className="text-sm font-medium hover:text-brand-600 transition-colors flex items-center gap-1"><Layout className="h-4 w-4"/> Planner</button>
                </>
            )}
            {isB2BMode && (
                <>
                    <button onClick={() => onNavigate?.('CORPORATE')} className="text-sm font-medium hover:text-blue-400 transition-colors">Dashboard</button>
                    <button className="text-sm font-medium hover:text-blue-400 transition-colors">Approvals</button>
                    <button className="text-sm font-medium hover:text-blue-400 transition-colors">Reports</button>
                </>
            )}
          </nav>

          <div className="flex items-center space-x-3 sm:space-x-4 rtl:space-x-reverse">
             {/* Global Settings */}
             <div className="hidden sm:flex items-center gap-2 rtl:gap-2">
                <Globe className="h-4 w-4 text-gray-400" />
                <select 
                    value={language} 
                    onChange={(e) => setLanguage(e.target.value as any)}
                    className="bg-transparent text-xs font-bold border-none focus:ring-0 cursor-pointer text-gray-600 dark:text-gray-300"
                >
                    <option value="en">EN</option>
                    <option value="hi">हिंदी</option>
                    <option value="ta">தமிழ்</option>
                    <option value="bn">বাংলা</option>
                    <option value="te">తెలుగు</option>
                    <option value="ur">اردو</option>
                </select>
                <div className="h-4 w-px bg-gray-300"></div>
                <select 
                    value={currency} 
                    onChange={(e) => setCurrency(e.target.value as any)}
                    className="bg-transparent text-xs font-bold border-none focus:ring-0 cursor-pointer text-gray-600 dark:text-gray-300"
                >
                    <option value="INR">INR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                </select>
             </div>

             {/* Theme Toggle */}
             <button
               onClick={toggleTheme}
               className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
               aria-label="Toggle Theme"
               title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
             >
               {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
             </button>

             {/* Dev Toggle */}
             <div className="hidden sm:flex items-center mr-2 gap-3 rtl:mr-0 rtl:ml-2">
                {showArch && (
                   <button onClick={handleReset} className="text-red-500 hover:text-red-700" title="Reset DB"><Trash2 className="h-4 w-4" /></button>
                )}
                <label className="flex items-center cursor-pointer relative" aria-label="Toggle Developer Mode">
                   <input type="checkbox" className="sr-only peer" checked={showArch} onChange={toggleArch} />
                   <div className="w-8 h-4 bg-gray-300 rounded-full peer peer-checked:bg-brand-600 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] rtl:after:right-[2px] rtl:after:left-auto after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all"></div>
                </label>
             </div>

            {/* Notification Center */}
            <div className="hidden md:block">
                <NotificationCenter onNavigate={onNavigate || (() => {})} />
            </div>
            
            {/* User Dropdown Trigger */}
            <button 
              onClick={() => onNavigate?.('PROFILE')}
              className="flex items-center gap-2 p-1 pl-2 pr-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer border border-transparent hover:border-gray-200 group rtl:pl-1 rtl:pr-2"
            >
              <div className={`p-1.5 rounded-full ${isB2BMode ? 'bg-blue-800 text-blue-200' : 'bg-gray-200 text-gray-500 dark:bg-slate-700 dark:text-gray-400'}`}>
                <User className="h-4 w-4" aria-hidden="true" />
              </div>
            </button>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2">
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu Content (Simplified) */}
      {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 w-full bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 p-4 shadow-lg flex flex-col gap-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                  <span className="text-sm font-medium">Theme</span>
                  <button
                    onClick={toggleTheme}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white dark:bg-slate-700 shadow-sm border border-gray-200 dark:border-slate-600 text-xs font-bold"
                  >
                    {theme === 'dark' ? <><Sun className="h-4 w-4" /> Light Mode</> : <><Moon className="h-4 w-4" /> Dark Mode</>}
                  </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                  <span className="text-sm font-medium">Language</span>
                  <select 
                      value={language} 
                      onChange={(e) => setLanguage(e.target.value as any)}
                      className="bg-transparent text-sm font-bold border-none focus:ring-0"
                  >
                      <option value="en">English</option>
                      <option value="hi">हिंदी</option>
                      <option value="ta">தமிழ்</option>
                      <option value="bn">বাংলা</option>
                      <option value="te">తెలుగు</option>
                      <option value="ur">اردو</option>
                  </select>
              </div>
              <button onClick={() => {toggleB2BMode(); setIsMenuOpen(false);}} className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                  <Briefcase className="h-5 w-5"/> {t('switch_to')} {isB2BMode ? t('personal_mode') : t('corp_mode')}
              </button>
              <button onClick={() => {onNavigate?.('ITINERARY'); setIsMenuOpen(false);}} className="flex items-center gap-2 p-3">
                  <Layout className="h-5 w-5"/> Trip Planner
              </button>
              <button onClick={() => {onNavigate?.('IMPACT'); setIsMenuOpen(false);}} className="flex items-center gap-2 p-3">
                  <Heart className="h-5 w-5 text-green-500"/> {t('nav_impact')}
              </button>
              <button onClick={onLogout} className="flex items-center gap-2 p-3 text-red-500">
                  <LogOut className="h-5 w-5"/> {t('logout')}
              </button>
          </div>
      )}
    </header>
  );
};
