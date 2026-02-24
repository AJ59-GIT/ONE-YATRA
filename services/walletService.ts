
import { UserProfile, WalletTransaction } from "../types";
import { getCurrentUser, updateUserProfile } from "./authService";

export const getWalletBalance = (): number => {
  const user = getCurrentUser();
  return user?.walletBalance || 0;
};

export const getWalletTransactions = (): WalletTransaction[] => {
  const user = getCurrentUser();
  return user?.walletTransactions || [];
};

export const addMoney = async (amount: number): Promise<boolean> => {
  const user = getCurrentUser();
  if (!user) return false;

  const transaction: WalletTransaction = {
    id: `txn_${Date.now()}`,
    type: 'CREDIT',
    category: 'ADD_MONEY',
    amount: amount,
    description: 'Added money to wallet',
    date: Date.now(),
    status: 'SUCCESS'
  };

  return await updateWallet(user, amount, transaction);
};

export const withdrawMoney = async (amount: number, bankDetails: string): Promise<boolean> => {
  const user = getCurrentUser();
  if (!user || (user.walletBalance || 0) < amount) return false;

  const transaction: WalletTransaction = {
    id: `txn_${Date.now()}`,
    type: 'DEBIT',
    category: 'WITHDRAWAL',
    amount: amount,
    description: `Transfer to Bank (${bankDetails})`,
    date: Date.now(),
    status: 'SUCCESS'
  };

  // Subtract amount
  return await updateWallet(user, -amount, transaction);
};

export const payWithWallet = async (amount: number, bookingId: string): Promise<boolean> => {
  const user = getCurrentUser();
  if (!user || (user.walletBalance || 0) < amount) return false;

  const transaction: WalletTransaction = {
    id: `txn_${Date.now()}`,
    type: 'DEBIT',
    category: 'BOOKING',
    amount: amount,
    description: `Payment for Booking #${bookingId.split('-')[1] || bookingId}`,
    date: Date.now(),
    referenceId: bookingId,
    status: 'SUCCESS'
  };

  return await updateWallet(user, -amount, transaction);
};

export const processRefundToWallet = async (amount: number, bookingId: string, reason: string = 'Booking Cancelled'): Promise<boolean> => {
  const user = getCurrentUser();
  if (!user) return false;

  const transaction: WalletTransaction = {
    id: `txn_${Date.now()}`,
    type: 'CREDIT',
    category: 'REFUND',
    amount: amount,
    description: `Refund: ${reason}`,
    date: Date.now(),
    referenceId: bookingId,
    status: 'SUCCESS'
  };

  return await updateWallet(user, amount, transaction);
};

export const processCashback = async (amount: number, promoCode: string): Promise<boolean> => {
    const user = getCurrentUser();
    if (!user) return false;
  
    const transaction: WalletTransaction = {
      id: `txn_${Date.now()}`,
      type: 'CREDIT',
      category: 'CASHBACK',
      amount: amount,
      description: `Cashback Applied (${promoCode})`,
      date: Date.now(),
      status: 'SUCCESS'
    };
  
    return await updateWallet(user, amount, transaction);
};

const updateWallet = async (user: UserProfile, changeAmount: number, transaction: WalletTransaction): Promise<boolean> => {
  const newBalance = (user.walletBalance || 0) + changeAmount;
  const newTransactions = [transaction, ...(user.walletTransactions || [])];

  const updatedUser: UserProfile = {
    ...user,
    walletBalance: newBalance,
    walletTransactions: newTransactions
  };

  return await updateUserProfile(updatedUser);
};
