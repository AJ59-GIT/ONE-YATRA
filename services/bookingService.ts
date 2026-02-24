
import { Booking, BookingStatus, TravelOption, Passenger } from "../types";
import { earnPointsForBooking } from "./loyaltyService";
import { processRefundToWallet } from "./walletService";
import { sendCancellation } from "./notificationService";
import { getCurrentUser } from "./authService";

// In-memory store for active session flow
let bookingsStore: Record<string, Booking> = {};
const BOOKING_HISTORY_KEY = 'oneyatra_booking_history';

// Affiliate Commission Rates (Percentage)
const COMMISSION_RATES: Record<string, number> = {
  'FLIGHT': 2.5, // 2.5% per booking
  'BUS': 5.0,    // 5% per booking
  'TRAIN': 1.0,  // Flat 1% or fee
  'CAB': 0,      // CPA usually tracked via Deep Link, not internal booking
};

// --- History Management ---

const getStoredBookings = (): Booking[] => {
  try {
    const stored = localStorage.getItem(BOOKING_HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
};

const saveBookingToHistory = (booking: Booking) => {
  const history = getStoredBookings();
  // Update if exists, else push
  const index = history.findIndex(b => b.id === booking.id);
  if (index !== -1) {
    history[index] = booking;
  } else {
    history.unshift(booking);
  }
  localStorage.setItem(BOOKING_HISTORY_KEY, JSON.stringify(history));
};

export const getUserBookings = (): Booking[] => {
  const history = getStoredBookings();
  if (history.length === 0) {
    // Generate mocks if empty for demo purposes
    const mocks = generateMockBookings();
    localStorage.setItem(BOOKING_HISTORY_KEY, JSON.stringify(mocks));
    return mocks;
  }
  return history;
};

// --- Mock Data Generator ---
const generateMockBookings = (): Booking[] => {
  const today = new Date();
  const pastDate = new Date(today);
  pastDate.setDate(today.getDate() - 45);
  
  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + 15);

  return [
    {
      id: 'BK-MOCK-1',
      userId: 'user-123',
      status: 'CONFIRMED',
      totalAmount: 4500,
      createdAt: pastDate.getTime(),
      travelDate: pastDate.toISOString().split('T')[0],
      pnr: '6E-4592',
      origin: 'Delhi',
      destination: 'Mumbai',
      passengers: [{ name: 'User', age: 28, gender: 'M' }],
      option: {
        id: 'opt-m1', mode: 'FLIGHT', provider: 'IndiGo 6E-202', 
        departureTime: '10:00 AM', arrivalTime: '12:00 PM', duration: '2h', price: 4500, currency: 'INR',
        features: [], ecoScore: 50
      }
    },
    {
      id: 'BK-MOCK-2',
      userId: 'user-123',
      status: 'CANCELLED',
      totalAmount: 1200,
      createdAt: pastDate.getTime() - 86400000,
      travelDate: pastDate.toISOString().split('T')[0],
      pnr: 'PNR8821',
      origin: 'Bangalore',
      destination: 'Mysore',
      passengers: [{ name: 'User', age: 28, gender: 'M' }],
      option: {
        id: 'opt-m2', mode: 'TRAIN', provider: 'Vande Bharat', 
        departureTime: '06:00 AM', arrivalTime: '08:00 AM', duration: '2h', price: 1200, currency: 'INR',
        features: [], ecoScore: 80
      }
    },
    {
      id: 'BK-MOCK-3',
      userId: 'user-123',
      status: 'CONFIRMED',
      totalAmount: 850,
      createdAt: Date.now() - 1000000,
      travelDate: futureDate.toISOString().split('T')[0],
      pnr: 'ZING-99',
      origin: 'Delhi',
      destination: 'Jaipur',
      passengers: [{ name: 'User', age: 28, gender: 'M' }],
      option: {
        id: 'opt-m3', mode: 'BUS', provider: 'ZingBus Volvo', 
        departureTime: '11:00 PM', arrivalTime: '05:00 AM', duration: '6h', price: 850, currency: 'INR',
        features: ['AC', 'Sleeper'], ecoScore: 70
      }
    }
  ];
};

// --- Active Flow ---

export const createBooking = (option: TravelOption, passengers: Passenger[]): Booking => {
  const bookingId = `BK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  // Store context in local storage for retrieval if page refreshes or for history
  const booking: Booking = {
    id: bookingId,
    userId: 'user-123', // Mock user
    option,
    passengers,
    totalAmount: option.price,
    status: 'INITIATED',
    createdAt: Date.now(),
    // We add these for easier listing display later
    travelDate: new Date().toISOString().split('T')[0], // Default to today if not provided in search params context (which we don't strictly have here, simplifying)
    origin: 'Origin', // Placeholder, updated in confirm if available or passed
    destination: 'Destination' 
  };
  bookingsStore[bookingId] = booking;
  return booking;
};

export const processPayment = async (bookingId: string): Promise<boolean> => {
  const booking = bookingsStore[bookingId];
  if (!booking) throw new Error("Booking not found");

  updateBookingStatus(bookingId, 'PAYMENT_PENDING');

  // Simulate Payment Gateway Delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Simulate 90% Success Rate
  const isSuccess = Math.random() > 0.1; 

  if (isSuccess) {
    updateBookingStatus(bookingId, 'PAYMENT_SUCCESS');
    return true;
  } else {
    updateBookingStatus(bookingId, 'FAILED', 'Payment Declined by Bank');
    return false;
  }
};

export const confirmProviderBooking = async (bookingId: string): Promise<Booking> => {
  const booking = bookingsStore[bookingId];
  if (!booking) throw new Error("Booking not found");

  updateBookingStatus(bookingId, 'CONFIRMING_PROVIDER');

  // Simulate Provider API Delay (Inventory Check)
  await new Promise(resolve => setTimeout(resolve, 2500));

  // Simulate 80% Success Rate (20% chance inventory ran out after payment)
  const isSuccess = Math.random() > 0.2; 

  if (isSuccess) {
    const pnr = `${booking.option.mode.substring(0,2)}-${Math.floor(Math.random() * 1000000)}`;
    const commission = (booking.totalAmount * (COMMISSION_RATES[booking.option.mode] || 0)) / 100;
    
    booking.status = 'CONFIRMED';
    booking.pnr = pnr;
    booking.commissionEarned = commission;
    
    // Save to persistent history
    saveBookingToHistory(booking);

    console.log(`[Affiliate] Earned ₹${commission} on Booking ${bookingId}`);
    
    // --- Loyalty Integration ---
    try {
        const points = await earnPointsForBooking(booking.totalAmount, `${booking.option.provider} Trip`);
        console.log(`[Loyalty] Earned ${points} points`);
    } catch(e) {
        console.error("Failed to award points", e);
    }
    // ---------------------------

    return booking;
  } else {
    // SAGA PATTERN: COMPENSATING TRANSACTION
    // Provider failed, but payment succeeded. Must refund.
    await processRefund(bookingId, booking.totalAmount);
    booking.status = 'REFUNDED';
    booking.error = 'Booking failed with provider. Refund initiated to Wallet.';
    saveBookingToHistory(booking);
    return booking;
  }
};

export const cancelUserBooking = async (bookingId: string): Promise<boolean> => {
    const history = getStoredBookings();
    const index = history.findIndex(b => b.id === bookingId);
    
    if (index === -1) return false;
    
    const booking = history[index];
    if (booking.status !== 'CONFIRMED') return false;

    // Logic: Process Refund
    await processRefund(bookingId, booking.totalAmount);
    
    // Logic: Update Status
    booking.status = 'CANCELLED';
    booking.error = 'Cancelled by user.';
    history[index] = booking;
    localStorage.setItem(BOOKING_HISTORY_KEY, JSON.stringify(history));

    // Send Email
    const user = getCurrentUser();
    if (user && user.email) {
        sendCancellation(booking, user.email);
    }

    return true;
};

const processRefund = async (bookingId: string, amount: number) => {
  console.log(`[Refund] Initiating auto-refund for ${bookingId}...`);
  try {
      await processRefundToWallet(amount, bookingId, "Auto-refund for failed/cancelled booking");
      console.log(`[Refund] Refund of ₹${amount} credited to Wallet.`);
  } catch (e) {
      console.error("Failed to process refund to wallet", e);
  }
};

const updateBookingStatus = (id: string, status: BookingStatus, error?: string) => {
  if (bookingsStore[id]) {
    bookingsStore[id].status = status;
    if (error) bookingsStore[id].error = error;
  }
};

export const getBooking = (id: string) => bookingsStore[id];
