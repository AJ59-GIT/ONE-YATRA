
import { Achievement, LoyaltyTier, PointTransaction, Referral, Reward, UserProfile } from "../types";
import { getCurrentUser, updateUserProfile } from "./authService";

const TIERS: Record<LoyaltyTier, { minPoints: number; benefits: string[] }> = {
  'SILVER': { 
    minPoints: 0, 
    benefits: ['1x Points Earning', 'Member-only Deals'] 
  },
  'GOLD': { 
    minPoints: 2000, 
    benefits: ['1.5x Points Earning', 'Free Cancellation (2/yr)', 'Priority Support'] 
  },
  'PLATINUM': { 
    minPoints: 5000, 
    benefits: ['2x Points Earning', 'Free Lounge Access', 'Zero Convenience Fees', 'Dedicated Agent'] 
  }
};

export const REWARDS_CATALOG: Reward[] = [
  { id: 'R1', title: '₹100 Off Bus Ticket', description: 'Applicable on any bus operator.', cost: 200, type: 'DISCOUNT', code: 'BUS100' },
  { id: 'R2', title: '₹500 Flight Voucher', description: 'Save on your next flight.', cost: 800, type: 'DISCOUNT', code: 'FLY500' },
  { id: 'R3', title: 'Free Meal Upgrade', description: 'Get a premium meal on next flight.', cost: 400, type: 'UPGRADE', code: 'MEALUP' },
  { id: 'R4', title: 'Free Cancellation', description: 'One-time free cancellation waiver.', cost: 1500, type: 'VOUCHER', code: 'FREECANCEL', minTier: 'GOLD' },
  { id: 'R5', title: 'Airport Lounge Access', description: 'Domestic terminal access.', cost: 2500, type: 'VOUCHER', code: 'LOUNGEACC', minTier: 'PLATINUM' },
  { id: 'R6', title: 'Cab Surge Waiver', description: 'No surge pricing for 24 hours.', cost: 600, type: 'VOUCHER', code: 'NOSURGE' },
];

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'A1', title: 'First Steps', description: 'Complete your first booking.', icon: '🚀', unlocked: true },
  { id: 'A2', title: 'Jetsetter', description: 'Book 5 flights.', icon: '✈️', unlocked: false, progress: 2, maxProgress: 5 },
  { id: 'A3', title: 'Eco Warrior', description: 'Choose 3 Eco-Friendly trips.', icon: '🌱', unlocked: false, progress: 1, maxProgress: 3 },
  { id: 'A4', title: 'Road Tripper', description: 'Book a multi-city bus/cab trip.', icon: '🚌', unlocked: false, progress: 0, maxProgress: 1 },
];

export const getTierDetails = (points: number): { current: LoyaltyTier, next?: LoyaltyTier, progress: number, remaining: number } => {
  let current: LoyaltyTier = 'SILVER';
  
  if (points >= TIERS.PLATINUM.minPoints) current = 'PLATINUM';
  else if (points >= TIERS.GOLD.minPoints) current = 'GOLD';

  if (current === 'PLATINUM') {
    return { current, progress: 100, remaining: 0 };
  }

  const next = current === 'SILVER' ? 'GOLD' : 'PLATINUM';
  const minCurrent = TIERS[current].minPoints;
  const minNext = TIERS[next].minPoints;
  
  // Progress within the current level bracket
  const progress = Math.min(100, Math.max(0, ((points - minCurrent) / (minNext - minCurrent)) * 100));
  
  return { current, next, progress, remaining: minNext - points };
};

export const earnPointsForBooking = async (amount: number, description: string): Promise<number> => {
  const user = getCurrentUser();
  if (!user) return 0;

  // Base Logic: 1 Pt per ₹100
  let multiplier = 1;
  if (user.loyaltyTier === 'GOLD') multiplier = 1.5;
  if (user.loyaltyTier === 'PLATINUM') multiplier = 2;

  const pointsEarned = Math.floor((amount / 100) * multiplier);
  
  if (pointsEarned > 0) {
    const newTransaction: PointTransaction = {
      id: `txn_${Date.now()}`,
      type: 'EARN',
      amount: pointsEarned,
      description,
      date: Date.now(),
      expiryDate: Date.now() + (1000 * 60 * 60 * 24 * 365) // 1 Year expiry
    };

    const newTotal = (user.loyaltyPoints || 0) + pointsEarned;
    const { current: newTier } = getTierDetails(newTotal);

    await updateUserProfile({
      ...user,
      loyaltyPoints: newTotal,
      loyaltyTier: newTier,
      pointHistory: [newTransaction, ...(user.pointHistory || [])]
    });
  }

  return pointsEarned;
};

export const redeemPoints = async (rewardId: string): Promise<{ success: boolean; message: string; code?: string }> => {
  const user = getCurrentUser();
  const reward = REWARDS_CATALOG.find(r => r.id === rewardId);
  
  if (!user || !reward) return { success: false, message: 'Invalid request' };
  
  const currentPoints = user.loyaltyPoints || 0;
  
  if (currentPoints < reward.cost) {
    return { success: false, message: `Insufficient points. You need ${reward.cost - currentPoints} more.` };
  }

  if (reward.minTier) {
      const userTier = user.loyaltyTier || 'SILVER';
      // If reward requires PLATINUM, user must be PLATINUM
      if (reward.minTier === 'PLATINUM' && userTier !== 'PLATINUM') {
          return { success: false, message: `This reward is locked for ${reward.minTier} members.` };
      }
      // If reward requires GOLD, user must be GOLD or PLATINUM (so fail if SILVER)
      if (reward.minTier === 'GOLD' && userTier === 'SILVER') {
          return { success: false, message: `This reward is locked for ${reward.minTier} members.` };
      }
  }

  const newTransaction: PointTransaction = {
    id: `red_${Date.now()}`,
    type: 'REDEEM',
    amount: -reward.cost,
    description: `Redeemed: ${reward.title}`,
    date: Date.now()
  };

  const newTotal = currentPoints - reward.cost;
  
  // Note: We don't downgrade tier immediately on redemption usually, keeping tier based on lifetime earnings is standard,
  // but for this MVP, tier follows current balance.
  const { current: newTier } = getTierDetails(newTotal);

  await updateUserProfile({
    ...user,
    loyaltyPoints: newTotal,
    loyaltyTier: newTier,
    pointHistory: [newTransaction, ...(user.pointHistory || [])]
  });

  return { success: true, message: 'Reward redeemed successfully!', code: reward.code };
};

export const addReferralBonus = async (): Promise<boolean> => {
    // Determine random bonus
    const bonus = 500;
    const user = getCurrentUser();
    if(!user) return false;

    const newTransaction: PointTransaction = {
        id: `ref_${Date.now()}`,
        type: 'BONUS',
        amount: bonus,
        description: 'Referral Bonus',
        date: Date.now(),
        expiryDate: Date.now() + (1000 * 60 * 60 * 24 * 90) // 90 days
    };

    const newTotal = (user.loyaltyPoints || 0) + bonus;
    const { current: newTier } = getTierDetails(newTotal);

    // Also update referral list stats
    const currentReferrals = user.referrals || [];
    // Add a mock completed referral for display
    const mockRef: Referral = {
        id: `ref_u_${Date.now()}`,
        refereeName: 'New Friend',
        status: 'COMPLETED',
        date: Date.now(),
        rewardAmount: bonus
    };

    await updateUserProfile({
        ...user,
        loyaltyPoints: newTotal,
        loyaltyTier: newTier,
        pointHistory: [newTransaction, ...(user.pointHistory || [])],
        referrals: [mockRef, ...currentReferrals]
    });
    return true;
};

// --- Referral Specific Helpers ---

export const getReferralCode = (user: UserProfile): string => {
    if (user.referralCode) return user.referralCode;
    
    // Generate simple code: First 3 letters of name + 3 random digits
    const namePart = (user.name || 'USER').substring(0, 3).toUpperCase();
    const randomPart = Math.floor(100 + Math.random() * 900);
    const code = `${namePart}${randomPart}`;
    
    // Persist it
    updateUserProfile({ ...user, referralCode: code });
    return code;
};

export const getReferralHistory = (user: UserProfile): Referral[] => {
    if (user.referrals && user.referrals.length > 0) return user.referrals;
    
    // Return mock data for initial state
    const mocks: Referral[] = [
        { id: 'r1', refereeName: 'Rahul Verma', status: 'COMPLETED', date: Date.now() - 86400000 * 5, rewardAmount: 500 },
        { id: 'r2', refereeName: 'Priya Sharma', status: 'PENDING', date: Date.now() - 86400000 * 2, rewardAmount: 0 },
        { id: 'r3', refereeName: 'Amit Kumar', status: 'COMPLETED', date: Date.now() - 86400000 * 20, rewardAmount: 500 },
    ];
    
    // Persist mocks so they don't change on refresh
    updateUserProfile({ ...user, referrals: mocks });
    return mocks;
};

export const getLeaderboard = (): { name: string; count: number; avatar?: string }[] => [
    { name: 'Vikram S.', count: 42, avatar: '' },
    { name: 'Anjali D.', count: 38, avatar: '' },
    { name: 'Rohan M.', count: 25, avatar: '' },
    { name: 'Sana K.', count: 19, avatar: '' },
    { name: 'You', count: 2, avatar: '' }, // Placeholder position
];
