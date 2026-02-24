
import { GiftCard } from "../types";

const GC_STORAGE_KEY = 'oneyatra_giftcards_db';

// Generate a random 16 digit code separated by dashes
const generateCode = () => {
  const segment = () => Math.random().toString(36).substr(2, 4).toUpperCase();
  return `${segment()}-${segment()}-${segment()}-${segment()}`;
};

export const getAllGiftCards = (): GiftCard[] => {
  try {
    const data = localStorage.getItem(GC_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

const saveGiftCards = (cards: GiftCard[]) => {
  localStorage.setItem(GC_STORAGE_KEY, JSON.stringify(cards));
};

export const purchaseGiftCard = async (
  amount: number,
  details: { sender: string; recipientEmail: string; message?: string; designId: string }
): Promise<GiftCard> => {
  // Simulate API Delay
  await new Promise(r => setTimeout(r, 1000));

  const newCard: GiftCard = {
    id: `gc-${Date.now()}`,
    code: generateCode(),
    balance: amount,
    initialAmount: amount,
    currency: 'INR',
    purchasedAt: Date.now(),
    expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString(), // 1 year
    designId: details.designId,
    message: details.message,
    senderName: details.sender,
    recipientEmail: details.recipientEmail,
    status: 'ACTIVE',
    transactions: []
  };

  const cards = getAllGiftCards();
  cards.push(newCard);
  saveGiftCards(cards);

  return newCard;
};

export const validateGiftCard = async (code: string): Promise<{ isValid: boolean; card?: GiftCard; message?: string }> => {
  await new Promise(r => setTimeout(r, 500));
  
  const cards = getAllGiftCards();
  const card = cards.find(c => c.code === code);

  if (!card) {
    return { isValid: false, message: 'Invalid Gift Card Code' };
  }

  if (card.status === 'EXPIRED' || new Date(card.expiryDate).getTime() < Date.now()) {
    return { isValid: false, message: 'Gift Card has expired' };
  }

  if (card.status === 'REDEEMED' || card.balance <= 0) {
    return { isValid: false, message: 'Gift Card balance is zero' };
  }

  return { isValid: true, card };
};

export const redeemGiftCard = async (code: string, amountToRedeem: number): Promise<boolean> => {
  const cards = getAllGiftCards();
  const index = cards.findIndex(c => c.code === code);

  if (index === -1) return false;

  const card = cards[index];
  if (card.balance < amountToRedeem) return false;

  card.balance -= amountToRedeem;
  card.transactions = card.transactions || [];
  card.transactions.push({
    date: Date.now(),
    amount: amountToRedeem,
    type: 'DEBIT'
  });

  if (card.balance === 0) {
    card.status = 'REDEEMED';
  }

  saveGiftCards(cards);
  return true;
};
