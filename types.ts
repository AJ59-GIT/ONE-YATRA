
import React from 'react';

// --- Global Types ---
export type TransportMode = 'CAB' | 'BUS' | 'TRAIN' | 'FLIGHT' | 'MIXED';
export type AppView = 'LOGIN' | 'HOME' | 'RESULTS' | 'BOOKING' | 'MY_TRIPS' | 'PROFILE' | 'SAVED_TRIPS' | 'WALLET' | 'LOYALTY' | 'SUPPORT' | 'ALERTS' | 'IMPACT' | 'DOCUMENTS' | 'ITINERARY' | 'CORPORATE' | 'GROUP_BOOKING' | 'GIFT_CARDS' | 'ARCHITECTURE' | 'PRIVACY' | 'TERMS';
export type Language = 'en' | 'hi' | 'ta' | 'bn' | 'te' | 'ur';
export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP';

// --- Search & Route Types ---
export interface SearchParams {
  origin: string;
  destination: string;
  date: string;
  time: string;
  passengers: number;
  tripType: 'ONE_WAY' | 'ROUND_TRIP' | 'MULTI_CITY';
  isFlexible?: boolean;
  returnDate?: string;
  returnTime?: string;
  segments: TripSegment[];
}

export interface TripSegment {
  id: string;
  origin: string;
  destination: string;
  date: string;
  time: string;
}

export interface SavedSearch extends SearchParams {
  id: string;
  name: string;
  createdAt: number;
}

export interface TrustBadge {
  id: string;
  label: string;
  icon: string; // Lucide icon name
  description: string;
  authority?: string;
  color: string;
}

export interface TravelOption {
  id: string;
  mode: TransportMode;
  provider: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  distance?: string;
  price: number;
  currency: string;
  rating?: number;
  ecoScore: number;
  features: string[];
  tag?: string | null;
  legs?: TravelOption[];
  deepLink?: string;
  deepLinkFallback?: string;
  androidIntent?: string;
  surgeMultiplier?: number;
  carbonEmission?: string;
  trustBadges?: TrustBadge[];
  priceTrend?: 'UP' | 'DOWN' | 'STABLE'; // New field
  realTimeStatus?: string; // New field
}

export interface RouteResponse {
  origin: string;
  destination: string;
  date: string;
  returnDate?: string;
  options: TravelOption[];
  returnOptions?: TravelOption[];
  aiInsight?: string;
}

export interface FilterState {
  departureTime: string[];
  arrivalMaxHour: number;
  priceRange: number[];
  providers: string[];
  amenities: string[];
  stops: string[];
  maxDuration: number;
  minRating: number;
}

// --- User & Profile Types ---
export interface UserProfile {
  email: string;
  name: string;
  phone?: string;
  dob?: string;
  gender?: 'M' | 'F' | 'O';
  avatar?: string;
  addresses?: Address[];
  savedTravelers?: SavedTraveler[];
  emergencyContact?: EmergencyContact;
  twoFactorEnabled?: boolean;
  preferences?: {
    seat?: 'ANY' | 'WINDOW' | 'AISLE';
    meal?: 'ANY' | 'VEG' | 'NON-VEG' | 'VEGAN' | 'JAIN';
    language?: string;
    currency?: string;
  };
  accessibility?: {
    wheelchair?: boolean;
    assistance?: boolean;
  };
  notificationSettings?: {
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
    push: boolean;
  };
  marketingConsent?: {
    newsletter: boolean;
    promos: boolean;
  };
  loyaltyPoints?: number;
  loyaltyTier?: LoyaltyTier;
  walletBalance?: number;
  walletTransactions?: WalletTransaction[];
  pointHistory?: PointTransaction[];
  referrals?: Referral[];
  referralCode?: string;
  medicalInfo?: {
    bloodGroup?: string;
    allergies?: string;
    notes?: string;
  };
}

export interface Address {
  id: string;
  type: 'HOME' | 'WORK' | 'OTHER';
  label?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  landmark?: string;
  isDefaultPickup?: boolean;
  isDefaultDrop?: boolean;
  coordinates?: { lat: number; lng: number };
}

export interface SavedTraveler {
  id: string;
  name: string;
  age: number | string;
  gender: 'M' | 'F' | 'O' | '';
  relation: string;
  idType?: string;
  idNumber?: string;
  isDefault?: boolean;
  phone?: string;
}

export interface EmergencyContact {
  name: string;
  relation: string;
  phone: string;
}

export interface UserDocument {
  id: string;
  type: 'PASSPORT' | 'VISA' | 'AADHAAR' | 'PAN' | 'VOTER_ID' | 'DRIVING_LICENSE' | 'OTHER';
  number: string;
  holderName: string;
  isVerified: boolean;
  expiryDate?: string;
  fileUrl?: string;
  dob?: string;
  gender?: 'M' | 'F' | 'O';
  sharedWith?: string[];
}

// --- Booking Types ---
export type BookingStatus = 'INITIATED' | 'PAYMENT_PENDING' | 'PAYMENT_SUCCESS' | 'CONFIRMING_PROVIDER' | 'CONFIRMED' | 'FAILED' | 'CANCELLED' | 'REFUNDED';

export interface Booking {
  id: string;
  userId: string;
  option: TravelOption;
  passengers: Passenger[];
  totalAmount: number;
  status: BookingStatus;
  createdAt: number;
  travelDate?: string;
  origin?: string;
  destination?: string;
  pnr?: string;
  error?: string;
  commissionEarned?: number;
  selectedSeats?: any[];
  selectedMeal?: Meal | null;
  specialRequests?: string;
  selectedAddOns?: SpecialRequestOption[];
  isCorporate?: boolean;
  policyViolations?: string[];
  discount?: { code: string, amount: number };
  giftCardRedemption?: { code: string, amount: number };
}

export interface Passenger {
  name: string;
  age: string | number;
  gender: string;
  idType?: string;
  idNumber?: string;
}

export interface Meal {
  id: string;
  name: string;
  description: string;
  type: 'VEG' | 'NON-VEG' | 'VEGAN' | 'JAIN';
  price: number;
  isPopular?: boolean;
  image: string;
}

export interface SpecialRequestOption {
  id: string;
  label: string;
  description: string;
  price: number;
  allowedModes: string[];
  icon: React.ReactNode;
}

export interface SavedCard {
  id: string;
  brand: string;
  last4: string;
  expiry: string;
  holderName: string;
  token: string;
}

export interface SavedTrip {
  id: string;
  option: TravelOption;
  origin: string;
  destination: string;
  date: string;
  savedAt: number;
}

// --- Loyalty & Wallet Types ---
export type LoyaltyTier = 'SILVER' | 'GOLD' | 'PLATINUM';

export interface PointTransaction {
  id: string;
  type: 'EARN' | 'REDEEM' | 'BONUS';
  amount: number;
  description: string;
  date: number;
  expiryDate?: number;
}

export interface Referral {
  id: string;
  refereeName: string;
  status: 'PENDING' | 'COMPLETED';
  date: number;
  rewardAmount: number;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  cost: number;
  type: 'DISCOUNT' | 'UPGRADE' | 'VOUCHER';
  code?: string;
  minTier?: LoyaltyTier;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

export interface WalletTransaction {
  id: string;
  type: 'CREDIT' | 'DEBIT';
  category: 'ADD_MONEY' | 'WITHDRAWAL' | 'REFUND' | 'BOOKING' | 'CASHBACK';
  amount: number;
  description: string;
  date: number;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  referenceId?: string;
}

export interface GiftCard {
  id: string;
  code: string;
  balance: number;
  initialAmount: number;
  currency: string;
  purchasedAt: number;
  expiryDate: string;
  designId?: string;
  message?: string;
  senderName?: string;
  recipientEmail?: string;
  status: 'ACTIVE' | 'REDEEMED' | 'EXPIRED';
  transactions?: { date: number, amount: number, type: 'DEBIT' }[];
}

// --- Support & Chat Types ---
export interface SupportTicket {
  id: string;
  category: 'BOOKING' | 'PAYMENT' | 'REFUND' | 'TECHNICAL' | 'OTHER';
  subject: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: number;
  lastUpdated: number;
  messages: TicketMessage[];
}

export interface TicketMessage {
  id: string;
  sender: 'USER' | 'AGENT' | 'SYSTEM';
  text: string;
  timestamp: number;
  attachments?: string[];
}

export type NotificationType = 'BOOKING' | 'OFFER' | 'ALERT' | 'ACCOUNT' | 'UPDATE';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: number;
  isRead: boolean;
  link?: AppView;
}

export interface ChatMessage {
  id: string;
  sender: 'USER' | 'BOT';
  text: string;
  timestamp: number;
  attachments?: string[];
}

export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Review {
  id: string;
  providerName: string;
  userId: string;
  userName: string;
  rating: number;
  text: string;
  date: number;
  helpfulCount: number;
  verifiedBooking: boolean;
  bookingId?: string;
  status?: ReviewStatus;
  reports?: string[];
  providerResponse?: {
    text: string;
    date: number;
    responderName: string;
  };
}

export interface ReportTicket {
  id: string;
  targetId: string;
  targetType: 'REVIEW' | 'LISTING' | 'PROVIDER';
  reason: string;
  description: string;
  evidenceUrl?: string;
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED';
  createdAt: number;
}

// --- Weather & Itinerary ---
export interface WeatherForecast {
  date: string;
  temp: number;
  condition: 'Sunny' | 'Cloudy' | 'Rainy' | 'Stormy' | 'Snowy';
  humidity: number;
  windSpeed: number;
}

export interface WeatherInsights {
  current: WeatherForecast;
  forecast: WeatherForecast[];
  travelDateWeather?: WeatherForecast;
  alerts: string[];
  packingTips: string[];
  bestTimeToVisit: string;
}

export interface ItineraryItem {
  id: string;
  day: number;
  type: 'TRAVEL' | 'STAY' | 'EAT' | 'ACTIVITY';
  title: string;
  time: string;
  cost: number;
  location?: string;
}

// --- Corporate Types ---
export interface CorporateProfile {
  id: string;
  companyName: string;
  gstin: string;
  address: string;
  billingEmail: string;
  totalBudget: number;
  spentAmount: number;
}

export interface Department {
  id: string;
  name: string;
  headEmail: string;
  monthlyBudget: number;
  currentSpend: number;
}

export interface CorporatePolicy {
  id: string;
  departmentId: string;
  maxFlightPrice: number;
  maxHotelPrice: number;
  minAdvanceBookingDays: number;
  allowedModes: TransportMode[];
  requireApprovalAbove: number;
}

export interface ApprovalRequest {
  id: string;
  bookingId: string;
  employeeName: string;
  amount: number;
  violationReason?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedAt: number;
  actionedAt?: number;
  approverName?: string;
}

export interface AppSettings {
  language: Language;
  currency: Currency;
  isB2BMode: boolean;
}
