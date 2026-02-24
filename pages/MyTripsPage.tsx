
import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, ArrowRight, Calendar, MapPin, Clock, RotateCw, FileText, CheckCircle, XCircle, AlertTriangle, Plane, Train, Bus, Car, Star } from 'lucide-react';
import { Booking, TransportMode } from '../types';
import { getUserBookings, cancelUserBooking } from '../services/bookingService';
import { Button } from '../components/Button';
import { sendCancellationSMS } from '../services/notificationService';
import { getCurrentUser } from '../services/authService';
import { EmptyState } from '../components/EmptyState';
import { ReviewModal } from '../components/ReviewModal';
import { FeedbackModal } from '../components/FeedbackModal';
import { checkReviewEligibility } from '../services/reviewService';

interface MyTripsPageProps {
  onBack: () => void;
  onBookAgain: (booking: Booking) => void;
}

type Tab = 'UPCOMING' | 'COMPLETED' | 'CANCELLED';

const ITEMS_PER_PAGE = 5;

export const MyTripsPage: React.FC<MyTripsPageProps> = ({ onBack, onBookAgain }) => {
  const [activeTab, setActiveTab] = useState<Tab>('UPCOMING');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [modeFilter, setModeFilter] = useState<'ALL' | TransportMode>('ALL');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Review State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewContext, setReviewContext] = useState<{provider: string, bookingId: string} | null>(null);
  
  // Feedback State
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    const data = getUserBookings();
    setBookings(data);
    setLoading(false);
    
    // Simulating post-trip feedback trigger
    const recentlyCompleted = data.find(b => b.status === 'CONFIRMED' && b.travelDate && new Date(b.travelDate).getTime() < Date.now());
    const feedbackGiven = localStorage.getItem('oneyatra_feedback_given');
    if (recentlyCompleted && !feedbackGiven) {
        setTimeout(() => {
            setFeedbackModalOpen(true);
            localStorage.setItem('oneyatra_feedback_given', 'true');
        }, 3000);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleDownloadInvoice = (id: string) => {
    alert(`Downloading Invoice for Booking ID: ${id}`);
  };

  const handleCancelBooking = async (id: string) => {
      const booking = bookings.find(b => b.id === id);
      if(!booking) return;

      if(window.confirm("Are you sure you want to cancel this booking? Refunds will be credited to your wallet immediately.")) {
          setLoading(true);
          const success = await cancelUserBooking(id);
          setLoading(false);
          if (success) {
              alert("Booking Cancelled Successfully. Check your email/SMS for details.");
              
              // Trigger SMS
              const user = getCurrentUser();
              const phone = user?.phone || '9876543210';
              sendCancellationSMS(booking, phone);

              fetchBookings(); // Refresh list
          } else {
              alert("Failed to cancel booking. Please contact support.");
          }
      }
  };

  const handleRateTrip = (booking: Booking) => {
      const eligibility = checkReviewEligibility(booking);
      if (!eligibility.allowed) {
          alert(eligibility.reason);
          return;
      }
      setReviewContext({ provider: booking.option.provider, bookingId: booking.id });
      setReviewModalOpen(true);
  };

  const getFilteredBookings = () => {
    const today = new Date().toISOString().split('T')[0];

    return bookings.filter(b => {
      // 1. Tab Logic
      if (activeTab === 'UPCOMING') {
        const isUpcoming = (b.status === 'CONFIRMED' || b.status === 'INITIATED') && 
                           (b.travelDate && b.travelDate >= today);
        if (!isUpcoming) return false;
      } else if (activeTab === 'COMPLETED') {
        const isCompleted = (b.status === 'CONFIRMED' && b.travelDate && b.travelDate < today) || 
                            b.status === 'PAYMENT_SUCCESS'; // Edge case
        if (!isCompleted) return false;
      } else if (activeTab === 'CANCELLED') {
        const isCancelled = b.status === 'CANCELLED' || b.status === 'REFUNDED' || b.status === 'FAILED';
        if (!isCancelled) return false;
      }

      // 2. Mode Filter
      if (modeFilter !== 'ALL' && b.option.mode !== modeFilter) return false;

      // 3. Search Query (PNR, Origin, Destination, Provider)
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matches = 
          b.pnr?.toLowerCase().includes(q) ||
          b.origin?.toLowerCase().includes(q) ||
          b.destination?.toLowerCase().includes(q) ||
          b.option.provider.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    }).sort((a, b) => {
      // Sort logic: Upcoming (Soonest first), Others (Newest first)
      if (activeTab === 'UPCOMING') {
        return (a.travelDate || '').localeCompare(b.travelDate || '');
      } else {
        return (b.travelDate || '').localeCompare(a.travelDate || '');
      }
    });
  };

  const filteredData = getFilteredBookings();
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = filteredData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold flex items-center"><CheckCircle className="h-3 w-3 mr-1"/> Confirmed</span>;
      case 'CANCELLED':
      case 'REFUNDED':
        return <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold flex items-center"><XCircle className="h-3 w-3 mr-1"/> Cancelled</span>;
      case 'FAILED':
        return <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold flex items-center"><AlertTriangle className="h-3 w-3 mr-1"/> Failed</span>;
      default:
        return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold flex items-center"><Clock className="h-3 w-3 mr-1"/> Pending</span>;
    }
  };

  const getModeIcon = (mode: string) => {
    switch(mode) {
      case 'FLIGHT': return <Plane className="h-5 w-5"/>;
      case 'TRAIN': return <Train className="h-5 w-5"/>;
      case 'BUS': return <Bus className="h-5 w-5"/>;
      default: return <Car className="h-5 w-5"/>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pb-20 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">My Trips</h1>
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          {['UPCOMING', 'COMPLETED', 'CANCELLED'].map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab as Tab); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${
                activeTab === tab 
                  ? 'bg-white text-brand-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by PNR, City, or Airline..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
          />
        </div>

        {/* Mode Filter */}
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
          {['ALL', 'FLIGHT', 'TRAIN', 'BUS', 'CAB'].map(m => (
            <button
              key={m}
              onClick={() => setModeFilter(m as any)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-colors ${
                modeFilter === m 
                  ? 'bg-brand-50 border-brand-500 text-brand-700' 
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {m === 'ALL' ? 'All Modes' : m.charAt(0) + m.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading trips...</div>
        ) : paginatedData.length === 0 ? (
          <EmptyState 
            icon={Filter}
            title="No trips found"
            description={searchQuery ? "Try adjusting your search filters." : "You haven't booked any trips in this category yet."}
            actionLabel="Plan a Trip"
            onAction={onBack}
          />
        ) : (
          paginatedData.map((booking) => (
            <div key={booking.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              {/* Card Header */}
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex justify-between items-center">
                 <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      booking.option.mode === 'FLIGHT' ? 'bg-blue-100 text-blue-600' :
                      booking.option.mode === 'TRAIN' ? 'bg-orange-100 text-orange-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                       {getModeIcon(booking.option.mode)}
                    </div>
                    <div>
                       <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
                          {new Date(booking.travelDate || booking.createdAt).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}
                          <span className="text-gray-400 font-normal">•</span>
                          <span className="text-xs text-gray-500 font-normal">{booking.option.departureTime}</span>
                       </div>
                    </div>
                 </div>
                 {getStatusBadge(booking.status)}
              </div>

              {/* Card Body */}
              <div className="p-6">
                 <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="flex-1">
                       <div className="flex items-center gap-4 mb-2">
                          <span className="text-xl font-bold text-gray-900">{booking.origin || booking.option.provider}</span>
                          <ArrowRight className="h-5 w-5 text-gray-300" />
                          <span className="text-xl font-bold text-gray-900">{booking.destination || 'Destination'}</span>
                       </div>
                       <div className="text-sm text-gray-500 flex items-center gap-2">
                          <span>{booking.option.provider}</span>
                          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                          <span>{booking.option.duration}</span>
                          {booking.pnr && (
                            <>
                              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                              <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-xs text-gray-700">PNR: {booking.pnr}</span>
                            </>
                          )}
                       </div>
                    </div>

                    <div className="text-right">
                       <div className="text-lg font-bold text-gray-900">₹{booking.totalAmount.toLocaleString()}</div>
                       <div className="text-xs text-gray-500">{booking.passengers.length} Passenger(s)</div>
                    </div>
                 </div>
              </div>

              {/* Card Footer Actions */}
              <div className="bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center">
                 <button 
                    onClick={() => handleDownloadInvoice(booking.id)}
                    className="flex items-center text-xs font-medium text-brand-600 hover:text-brand-700 hover:bg-brand-50 px-3 py-2 rounded transition-colors"
                 >
                    <Download className="h-4 w-4 mr-2" /> Download Invoice
                 </button>
                 
                 <div className="flex gap-3">
                    {booking.status === 'CONFIRMED' && activeTab === 'COMPLETED' && (
                       <button 
                         onClick={() => handleRateTrip(booking)}
                         className="flex items-center text-xs font-bold text-yellow-600 bg-yellow-50 hover:bg-yellow-100 px-3 py-2 rounded transition-colors"
                       >
                          <Star className="h-3 w-3 mr-1" /> Rate Trip
                       </button>
                    )}
                    {booking.status === 'CONFIRMED' && activeTab === 'UPCOMING' && (
                       <button 
                         onClick={() => handleCancelBooking(booking.id)}
                         className="text-xs font-bold text-red-600 hover:bg-red-50 px-3 py-2 rounded transition-colors"
                       >
                          Cancel Booking
                       </button>
                    )}
                    <button 
                       onClick={() => onBookAgain(booking)}
                       className="flex items-center text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 px-4 py-2 rounded-lg transition-colors shadow-sm"
                    >
                       <RotateCw className="h-3 w-3 mr-2" /> Book Again
                    </button>
                 </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
           <button 
             onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
             disabled={currentPage === 1}
             className="px-3 py-1 rounded border border-gray-200 text-sm disabled:opacity-50"
           >
             Previous
           </button>
           <span className="px-3 py-1 text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
           <button 
             onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
             disabled={currentPage === totalPages}
             className="px-3 py-1 rounded border border-gray-200 text-sm disabled:opacity-50"
           >
             Next
           </button>
        </div>
      )}

      {reviewContext && (
          <ReviewModal 
            isOpen={reviewModalOpen}
            onClose={() => setReviewModalOpen(false)}
            providerName={reviewContext.provider}
            bookingId={reviewContext.bookingId}
          />
      )}

      <FeedbackModal 
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
      />

    </div>
  );
};
