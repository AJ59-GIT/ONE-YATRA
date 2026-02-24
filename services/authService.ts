
import { UserProfile } from "../types";

const USERS_STORAGE_KEY = 'oneyatra_users_db';
const CURRENT_USER_KEY = 'oneyatra_current_user';

// Mock delay to simulate network request
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const checkPasswordStrength = (password: string): { score: number; message: string; color: string } => {
  let score = 0;
  if (password.length > 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  switch (score) {
    case 0:
    case 1:
      return { score: 1, message: 'Weak', color: 'bg-red-500' };
    case 2:
      return { score: 2, message: 'Fair', color: 'bg-yellow-500' };
    case 3:
      return { score: 3, message: 'Good', color: 'bg-blue-500' };
    case 4:
      return { score: 4, message: 'Strong', color: 'bg-green-500' };
    default:
      return { score: 0, message: '', color: 'bg-gray-200' };
  }
};

export const registerWithEmail = async (email: string, password: string, name: string): Promise<{ success: boolean; message?: string }> => {
  await delay(800);
  
  if (!validateEmail(email)) {
    return { success: false, message: "Invalid email format" };
  }

  const usersRaw = localStorage.getItem(USERS_STORAGE_KEY);
  const users = usersRaw ? JSON.parse(usersRaw) : [];

  const exists = users.find((u: any) => u.email === email);
  if (exists) {
    return { success: false, message: "User already exists with this email." };
  }

  // Save new user
  const newUser = { email, password, name, preferences: {} }; // In real app, hash password!
  users.push(newUser);
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  
  // Set as current user
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ email, name, preferences: {} }));
  
  return { success: true };
};

export const loginWithEmail = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
  await delay(800);

  const usersRaw = localStorage.getItem(USERS_STORAGE_KEY);
  const users = usersRaw ? JSON.parse(usersRaw) : [];

  const user = users.find((u: any) => u.email === email && u.password === password);
  
  if (user) {
    // Construct profile object excluding sensitive data like password
    const profile: UserProfile = {
      email: user.email,
      name: user.name,
      phone: user.phone,
      dob: user.dob,
      gender: user.gender,
      avatar: user.avatar,
      addresses: user.addresses,
      emergencyContact: user.emergencyContact,
      twoFactorEnabled: user.twoFactorEnabled,
      preferences: user.preferences
    };
    
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profile));
    return { success: true };
  } else {
    return { success: false, message: "Invalid email or password." };
  }
};

export const updateUserProfile = async (profile: UserProfile): Promise<boolean> => {
  await delay(500);
  try {
    // 1. Update session
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profile));

    // 2. Update 'database'
    const usersRaw = localStorage.getItem(USERS_STORAGE_KEY);
    if (usersRaw) {
      const users = JSON.parse(usersRaw);
      const index = users.findIndex((u: any) => u.email === profile.email);
      if (index !== -1) {
        users[index] = { ...users[index], ...profile };
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      }
    }
    return true;
  } catch (e) {
    return false;
  }
};

export const changePassword = async (oldPass: string, newPass: string): Promise<{success: boolean, message: string}> => {
  await delay(1000);
  // In a real app, this would verify oldPass against the hash
  // Here we just simulate success if oldPass is not empty
  if (!oldPass) return { success: false, message: "Incorrect current password" };
  
  const currentUser = getCurrentUser();
  if (!currentUser) return { success: false, message: "Not logged in" };

  const usersRaw = localStorage.getItem(USERS_STORAGE_KEY);
  if (usersRaw) {
    const users = JSON.parse(usersRaw);
    const index = users.findIndex((u: any) => u.email === currentUser.email);
    if (index !== -1) {
      users[index].password = newPass; // In reality: Hash(newPass)
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      return { success: true, message: "Password updated successfully" };
    }
  }
  return { success: false, message: "User record not found" };
};

export const deleteAccount = async (): Promise<boolean> => {
  await delay(1000);
  const currentUser = getCurrentUser();
  if (!currentUser) return false;

  const usersRaw = localStorage.getItem(USERS_STORAGE_KEY);
  if (usersRaw) {
    const users = JSON.parse(usersRaw);
    const filtered = users.filter((u: any) => u.email !== currentUser.email);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(filtered));
  }
  
  clearAuthData();
  return true;
};

export const logoutUser = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
  localStorage.removeItem('oneyatra_user');
};

export const getCurrentUser = (): UserProfile | null => {
  try {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error("Failed to parse user data", e);
    // Clear corrupted data
    localStorage.removeItem(CURRENT_USER_KEY);
    return null;
  }
};

export const clearAuthData = () => {
  localStorage.removeItem(USERS_STORAGE_KEY);
  localStorage.removeItem(CURRENT_USER_KEY);
  localStorage.removeItem('oneyatra_user');
};
