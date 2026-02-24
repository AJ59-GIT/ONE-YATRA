
import { Review, Booking, ReviewStatus } from "../types";

const REVIEWS_STORAGE_KEY = 'oneyatra_reviews';

const MOCK_REVIEWS: Review[] = [
  {
    id: 'r1',
    providerName: 'IndiGo',
    userId: 'u1',
    userName: 'Rahul M.',
    rating: 5,
    text: 'Excellent service and on-time departure. The web check-in was smooth.',
    date: Date.now() - 86400000 * 2,
    helpfulCount: 12,
    verifiedBooking: true,
    status: 'APPROVED',
    providerResponse: {
      text: "Thanks Rahul! Glad you enjoyed the flight.",
      date: Date.now() - 86400000,
      responderName: "IndiGo Team"
    }
  },
  {
    id: 'r2',
    providerName: 'Uber',
    userId: 'u2',
    userName: 'Sneha P.',
    rating: 4,
    text: 'Car was clean but driver arrived 5 mins late. Good ride otherwise.',
    date: Date.now() - 86400000 * 5,
    helpfulCount: 3,
    verifiedBooking: true,
    status: 'APPROVED'
  },
  {
    id: 'r3',
    providerName: 'Zingbus',
    userId: 'u3',
    userName: 'Amit K.',
    rating: 5,
    text: 'Very comfortable sleeper seats. Charging points worked perfectly!',
    date: Date.now() - 86400000 * 10,
    helpfulCount: 8,
    verifiedBooking: true,
    status: 'APPROVED'
  },
  {
    id: 'r4',
    providerName: 'Ola',
    userId: 'u4',
    userName: 'Vikram S.',
    rating: 2,
    text: 'AC was not working properly. Driver was polite though.',
    date: Date.now() - 86400000 * 15,
    helpfulCount: 15,
    verifiedBooking: true,
    status: 'APPROVED'
  }
];

export const getReviews = (providerName?: string): Review[] => {
  try {
    const stored = localStorage.getItem(REVIEWS_STORAGE_KEY);
    const localReviews: Review[] = stored ? JSON.parse(stored) : [];
    const all = [...localReviews, ...MOCK_REVIEWS];
    
    // Filter approved or self-authored
    const visible = all.filter(r => r.status === 'APPROVED');

    if (!providerName) return visible.sort((a,b) => b.helpfulCount - a.helpfulCount);
    
    // Simple partial match
    return visible.filter(r => 
        providerName.toLowerCase().includes(r.providerName.toLowerCase().split(' ')[0]) || 
        r.providerName.toLowerCase().includes(providerName.toLowerCase())
    ).sort((a,b) => b.helpfulCount - a.helpfulCount);
  } catch (e) {
    return MOCK_REVIEWS;
  }
};

export const addReview = (review: Review) => {
  const stored = localStorage.getItem(REVIEWS_STORAGE_KEY);
  const localReviews: Review[] = stored ? JSON.parse(stored) : [];
  
  // Auto-approve for demo unless it contains restricted keywords
  const isAutoApproved = !review.text.toLowerCase().includes("spam") && !review.text.toLowerCase().includes("fake");
  review.status = isAutoApproved ? 'APPROVED' : 'PENDING';
  
  localReviews.unshift(review);
  localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(localReviews));
};

export const voteHelpful = (reviewId: string) => {
    const stored = localStorage.getItem(REVIEWS_STORAGE_KEY);
    if(stored) {
        const localReviews: Review[] = JSON.parse(stored);
        const idx = localReviews.findIndex(r => r.id === reviewId);
        if(idx !== -1) {
            localReviews[idx].helpfulCount += 1;
            localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(localReviews));
        }
    }
};

export const reportReview = (reviewId: string, reason: string) => {
    const stored = localStorage.getItem(REVIEWS_STORAGE_KEY);
    let localReviews: Review[] = stored ? JSON.parse(stored) : [];
    
    // Handle mock reviews reporting by creating a local copy if not exists
    if (!localReviews.find(r => r.id === reviewId)) {
        const mockReview = MOCK_REVIEWS.find(r => r.id === reviewId);
        if(mockReview) localReviews.push({...mockReview});
    }

    const idx = localReviews.findIndex(r => r.id === reviewId);
    if(idx !== -1) {
        localReviews[idx].reports = [...(localReviews[idx].reports || []), reason];
        // Auto-hide if too many reports
        if ((localReviews[idx].reports?.length || 0) > 3) {
            localReviews[idx].status = 'PENDING'; // Send back to moderation
        }
        localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(localReviews));
    }
};

export const replyToReview = (reviewId: string, text: string, responderName: string) => {
    const stored = localStorage.getItem(REVIEWS_STORAGE_KEY);
    let localReviews: Review[] = stored ? JSON.parse(stored) : [];
    
    // Handle mock reviews
    if (!localReviews.find(r => r.id === reviewId)) {
        const mockReview = MOCK_REVIEWS.find(r => r.id === reviewId);
        if(mockReview) localReviews.push({...mockReview});
    }

    const idx = localReviews.findIndex(r => r.id === reviewId);
    if(idx !== -1) {
        localReviews[idx].providerResponse = {
            text,
            date: Date.now(),
            responderName
        };
        localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(localReviews));
    }
};

export const checkReviewEligibility = (booking: Booking): { allowed: boolean; reason?: string } => {
    if (booking.status !== 'CONFIRMED') {
        return { allowed: false, reason: "You can only review completed trips." };
    }

    const travelTime = new Date(booking.travelDate || booking.createdAt).getTime();
    const now = Date.now();
    const daysDiff = (now - travelTime) / (1000 * 60 * 60 * 24);

    if (daysDiff > 30) {
        return { allowed: false, reason: "Reviews submission window closed (30 days limit)." };
    }

    if (daysDiff < 0) {
        return { allowed: false, reason: "You can review after the trip date." };
    }

    // Check if already reviewed (Basic check using local storage for demo)
    const reviews = getReviews();
    const existing = reviews.find(r => r.bookingId === booking.id);
    if (existing) {
        return { allowed: false, reason: "You have already reviewed this trip." };
    }

    return { allowed: true };
};
