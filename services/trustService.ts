
import { TransportMode, TrustBadge, ReportTicket, UserProfile } from "../types";
import { getCurrentUser } from "./authService";

const COOKIE_CONSENT_KEY = 'oneyatra_cookie_consent';
const REPORTS_KEY = 'oneyatra_reports';

// --- Trust Badges Mock Data ---
export const getTrustBadges = (mode: TransportMode, provider: string): TrustBadge[] => {
  const badges: TrustBadge[] = [];

  // Universal Badges
  if (Math.random() > 0.5) {
    badges.push({
      id: 'verified',
      label: 'Verified Partner',
      icon: 'ShieldCheck',
      description: 'This provider has undergone strict background checks.',
      color: 'text-blue-600 bg-blue-50'
    });
  }

  if (mode === 'FLIGHT') {
    badges.push({
      id: 'iata',
      label: 'IATA Accredited',
      icon: 'Globe',
      description: 'Officially accredited by the International Air Transport Association.',
      authority: 'IATA',
      color: 'text-indigo-600 bg-indigo-50'
    });
  } else if (mode === 'CAB') {
    badges.push({
        id: 'bg-check',
        label: 'Driver Verified',
        icon: 'UserCheck',
        description: 'Driver background and license verified by 3rd party.',
        color: 'text-green-600 bg-green-50'
    });
    badges.push({
        id: 'gps',
        label: 'GPS Tracked',
        icon: 'MapPin',
        description: 'Ride is tracked in real-time for safety.',
        color: 'text-orange-600 bg-orange-50'
    });
  } else if (mode === 'BUS') {
      badges.push({
          id: 'insurance',
          label: 'Insured Trip',
          icon: 'Umbrella',
          description: 'Trip covers accident insurance up to ₹5 Lakhs.',
          authority: 'Acko',
          color: 'text-emerald-600 bg-emerald-50'
      });
  }

  // Quality Badges
  if (provider.toLowerCase().includes('premium') || Math.random() > 0.7) {
      badges.push({
          id: 'quality',
          label: 'Top Rated Service',
          icon: 'Award',
          description: 'Consistently rated 4.5+ by travelers.',
          color: 'text-yellow-700 bg-yellow-50'
      });
  }

  return badges;
};

// --- Safety / SOS Logic ---

export interface EmergencyNumber {
    label: string;
    number: string;
}

export const getLocalEmergencyNumbers = async (lat: number, lng: number): Promise<EmergencyNumber[]> => {
    // Mock logic: real implementation would use reverse geocoding to find city/country
    // and return specific numbers.
    return [
        { label: 'Police', number: '100' },
        { label: 'Ambulance', number: '102' },
        { label: 'Women Helpline', number: '1091' },
        { label: 'Tourist Police', number: '1363' }
    ];
};

export const triggerSOS = async (location: {lat: number, lng: number}): Promise<boolean> => {
    const user = getCurrentUser();
    // Simulate API call to backend which SMSes emergency contacts
    console.log(`[SOS] Triggered for user ${user?.email || 'Guest'} at ${location.lat}, ${location.lng}`);
    
    // Simulate delay
    await new Promise(r => setTimeout(r, 1500));
    return true;
};

// --- Reporting Mechanism ---

export const submitReport = (report: Omit<ReportTicket, 'id' | 'createdAt' | 'status'>): ReportTicket => {
    const newReport: ReportTicket = {
        ...report,
        id: `RPT-${Date.now()}`,
        createdAt: Date.now(),
        status: 'OPEN'
    };

    const existing = JSON.parse(localStorage.getItem(REPORTS_KEY) || '[]');
    existing.push(newReport);
    localStorage.setItem(REPORTS_KEY, JSON.stringify(existing));
    
    return newReport;
};

// --- Cookie / Privacy ---

export interface CookiePreferences {
    analytics: boolean;
    marketing: boolean;
    functional: boolean;
    timestamp: number;
}

export const saveCookiePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(prefs));
};

export const getCookiePreferences = (): CookiePreferences | null => {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    return stored ? JSON.parse(stored) : null;
};

export const clearUserData = () => {
    localStorage.clear(); // Nuclear option for "Delete My Data" request
    window.location.reload();
};
