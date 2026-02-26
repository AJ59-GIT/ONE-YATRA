
import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { SMSNotification } from './components/SMSNotification';
import { BottomNavigation } from './components/BottomNavigation';
import { SearchParams, AppView, TravelOption, TripSegment, Booking } from './types';
import { requestPushPermission } from './services/notificationService';
import { logoutUser } from './services/authService';
import { useSwipe } from './hooks/useSwipe';
import { useVibration } from './hooks/useVibration';
import { ChatWidget } from './components/ChatWidget';
import { OnboardingGuide } from './components/OnboardingGuide';
import { ErrorBoundary } from './components/ErrorBoundary';
import { OfflineBanner } from './components/OfflineBanner';
import { CookieConsent } from './components/CookieConsent';
import { SOSButton } from './components/SOSButton';
import { Loader2 } from 'lucide-react';
import { SettingsProvider } from './contexts/SettingsContext';

// Lazy Load Pages
const ResultsPage = lazy(() => import('./pages/ResultsPage').then(module => ({ default: module.ResultsPage })));
const BookingPage = lazy(() => import('./pages/BookingPage').then(module => ({ default: module.BookingPage })));
const ArchitecturePage = lazy(() => import('./pages/ArchitecturePage').then(module => ({ default: module.ArchitecturePage })));
const SavedTripsPage = lazy(() => import('./pages/SavedTripsPage').then(module => ({ default: module.SavedTripsPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(module => ({ default: module.ProfilePage })));
const LoyaltyPage = lazy(() => import('./pages/LoyaltyPage').then(module => ({ default: module.LoyaltyPage })));
const MyTripsPage = lazy(() => import('./pages/MyTripsPage').then(module => ({ default: module.MyTripsPage })));
const WalletPage = lazy(() => import('./pages/WalletPage').then(module => ({ default: module.WalletPage })));
const SupportPage = lazy(() => import('./pages/SupportPage').then(module => ({ default: module.SupportPage })));
const AlertsPage = lazy(() => import('./pages/AlertsPage').then(module => ({ default: module.AlertsPage })));
const ImpactDashboardPage = lazy(() => import('./pages/ImpactDashboardPage').then(module => ({ default: module.ImpactDashboardPage })));
const DocumentsVaultPage = lazy(() => import('./pages/DocumentsVaultPage').then(module => ({ default: module.DocumentsVaultPage })));
const ItineraryBuilderPage = lazy(() => import('./pages/ItineraryBuilderPage').then(module => ({ default: module.ItineraryBuilderPage })));
const CorporateDashboardPage = lazy(() => import('./pages/CorporateDashboardPage').then(module => ({ default: module.CorporateDashboardPage })));
const GroupBookingPage = lazy(() => import('./pages/GroupBookingPage').then(module => ({ default: module.GroupBookingPage })));
const GiftCardsPage = lazy(() => import('./pages/GiftCardsPage').then(module => ({ default: module.GiftCardsPage })));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage').then(module => ({ default: module.PrivacyPolicyPage })));
const TermsPage = lazy(() => import('./pages/TermsPage').then(module => ({ default: module.TermsPage })));

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('LOGIN');
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);
  const [selectedOption, setSelectedOption] = useState<TravelOption | null>(null);
  const [bookingContext, setBookingContext] = useState<{origin: string, destination: string} | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const { vibrateTap } = useVibration();
  const mainContentRef = useRef<HTMLElement>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('oneyatra_user');
    const isUserLoggedIn = !!user;

    if (isUserLoggedIn) {
      setIsLoggedIn(true);
      setCurrentView('HOME');
      requestPushPermission();
      if(!localStorage.getItem('oneyatra_onboarding_seen')) {
          setShowOnboarding(true);
      }
    }

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  useEffect(() => {
    // Scroll to top on view change
    window.scrollTo(0, 0);
    if (mainContentRef.current) mainContentRef.current.focus();
  }, [currentView]);

  const handleLoginSuccess = () => {
    localStorage.setItem('oneyatra_user', 'true');
    setIsLoggedIn(true);
    setCurrentView('HOME');
    if(!localStorage.getItem('oneyatra_onboarding_seen')) setShowOnboarding(true);
  };

  const handleLogout = async () => {
    await logoutUser();
    setIsLoggedIn(false);
    setCurrentView('LOGIN');
  }

  const handleSearch = (params: SearchParams) => {
    setSearchParams(params);
    setCurrentView('RESULTS');
  };

  const handleInitiateBooking = (option: TravelOption, context?: {origin: string, destination: string}) => {
    setSelectedOption(option);
    if (context) setBookingContext(context);
    else if (searchParams) setBookingContext({ origin: searchParams.origin, destination: searchParams.destination });
    setCurrentView('BOOKING');
  };

  const handleBookAgain = (booking: Booking) => {
    const params: SearchParams = {
        origin: booking.origin || 'Origin',
        destination: booking.destination || 'Destination',
        date: new Date().toISOString().split('T')[0], 
        time: '09:00',
        passengers: booking.passengers.length,
        tripType: 'ONE_WAY',
        segments: [],
        isFlexible: false
    };
    setSearchParams(params);
    setCurrentView('RESULTS');
  };

  const handleBackToHome = () => setCurrentView('HOME');
  const handleNavigate = (view: AppView) => {
    if (isLoggedIn) setCurrentView(view);
    else setCurrentView('LOGIN');
  }

  const PageLoader = () => (
    <div className="flex h-[60vh] items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-brand-500" />
    </div>
  );

  return (
    <SettingsProvider>
        <div 
        className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300"
        >
        <OfflineBanner />
        <SMSNotification />
        
        {currentView !== 'LOGIN' && <Header onNavigate={handleNavigate} onLogout={handleLogout} />}
        
        {currentView === 'LOGIN' ? (
            <LoginPage onLoginSuccess={handleLoginSuccess} />
        ) : (
            <>
            <main 
                id="main-content" 
                ref={mainContentRef}
                className="flex-grow pb-16 md:pb-0 outline-none" 
                tabIndex={-1}
            >
                <ErrorBoundary>
                <Suspense fallback={<PageLoader />}>
                    {currentView === 'HOME' && <HomePage onSearch={handleSearch} onNavigate={handleNavigate} />}
                    {currentView === 'RESULTS' && searchParams && (
                    <ResultsPage searchParams={searchParams} onBack={handleBackToHome} onBookOption={handleInitiateBooking} />
                    )}
                    {currentView === 'BOOKING' && selectedOption && (
                    <BookingPage 
                        option={selectedOption}
                        origin={bookingContext?.origin || ''}
                        destination={bookingContext?.destination || ''}
                        passengersCount={searchParams?.passengers || 1}
                        onBack={() => setCurrentView('RESULTS')}
                        onComplete={() => setCurrentView('MY_TRIPS')}
                    />
                    )}
                    {currentView === 'SAVED_TRIPS' && <SavedTripsPage onBack={handleBackToHome} onBookOption={handleInitiateBooking} />}
                    {currentView === 'MY_TRIPS' && <MyTripsPage onBack={handleBackToHome} onBookAgain={handleBookAgain} />}
                    {currentView === 'WALLET' && <WalletPage onBack={handleBackToHome} />}
                    {currentView === 'PROFILE' && <ProfilePage onBack={handleBackToHome} onLogout={handleLogout} onNavigate={handleNavigate} />}
                    {currentView === 'LOYALTY' && <LoyaltyPage onBack={handleBackToHome} />}
                    {currentView === 'SUPPORT' && <SupportPage onBack={handleBackToHome} />}
                    {currentView === 'ALERTS' && <AlertsPage />}
                    {currentView === 'ARCHITECTURE' && <ArchitecturePage />}
                    {currentView === 'IMPACT' && <ImpactDashboardPage onBack={handleBackToHome} />}
                    {currentView === 'DOCUMENTS' && <DocumentsVaultPage onBack={handleBackToHome} />}
                    {currentView === 'ITINERARY' && <ItineraryBuilderPage onBack={handleBackToHome} />}
                    {currentView === 'CORPORATE' && <CorporateDashboardPage />}
                    {currentView === 'GROUP_BOOKING' && <GroupBookingPage onBack={handleBackToHome} />}
                    {currentView === 'GIFT_CARDS' && <GiftCardsPage onBack={handleBackToHome} />}
                    {currentView === 'PRIVACY' && <PrivacyPolicyPage onBack={handleBackToHome} />}
                    {currentView === 'TERMS' && <TermsPage onBack={handleBackToHome} />}
                </Suspense>
                </ErrorBoundary>
            </main>

            <BottomNavigation currentView={currentView} onNavigate={handleNavigate} />
            {showOnboarding && <OnboardingGuide onComplete={() => setShowOnboarding(false)} />}
            <CookieConsent />
            <SOSButton />
            <ChatWidget />
            </>
        )}
        </div>
    </SettingsProvider>
  );
};

export default App;
