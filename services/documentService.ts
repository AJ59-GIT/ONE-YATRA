
import { UserDocument } from "../types";

const VAULT_STORAGE_KEY = 'oneyatra_docs_vault';

// --- Local Storage Management ---

export const getDocuments = (): UserDocument[] => {
  try {
    const data = localStorage.getItem(VAULT_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const saveDocument = (doc: UserDocument): UserDocument[] => {
  const current = getDocuments();
  // Check update or insert
  const index = current.findIndex(d => d.id === doc.id);
  if (index !== -1) {
    current[index] = doc;
  } else {
    current.unshift(doc);
  }
  localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(current));
  return current;
};

export const deleteDocument = (id: string): UserDocument[] => {
  const current = getDocuments().filter(d => d.id !== id);
  localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(current));
  return current;
};

// --- Mock OCR Engine ---

export interface OCRResult {
  holderName: string;
  number: string;
  expiryDate?: string;
  dob?: string;
  gender?: 'M' | 'F' | 'O';
  confidence: number;
}

export const performOCR = async (file: File): Promise<OCRResult> => {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 2500));

  // Determine doc type from filename usually, here just random mock
  // In a real app, we'd send `file` to Google Cloud Vision API or Tesseract.js
  
  const today = new Date();
  const futureDate = new Date(today);
  futureDate.setFullYear(today.getFullYear() + 5);
  const dobDate = new Date(today);
  dobDate.setFullYear(today.getFullYear() - 28);

  return {
    holderName: "Aditya Verma", // Mock extracted name
    number: Math.random().toString(36).substring(2, 10).toUpperCase(),
    expiryDate: futureDate.toISOString().split('T')[0],
    dob: dobDate.toISOString().split('T')[0],
    gender: 'M',
    confidence: 0.95
  };
};

export const checkExpiry = (doc: UserDocument): 'VALID' | 'EXPIRING_SOON' | 'EXPIRED' => {
  if (!doc.expiryDate) return 'VALID';
  
  const expiry = new Date(doc.expiryDate).getTime();
  const now = Date.now();
  const sixMonths = 1000 * 60 * 60 * 24 * 180;

  if (expiry < now) return 'EXPIRED';
  if (expiry - now < sixMonths) return 'EXPIRING_SOON';
  return 'VALID';
};
