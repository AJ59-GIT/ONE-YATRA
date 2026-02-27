
import { UserProfile } from "../types";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendEmailVerification, 
  signInWithPopup,
  updateProfile,
  onAuthStateChanged,
  User
} from "firebase/auth";
import { auth, googleProvider } from "./firebase";

const CURRENT_USER_KEY = 'oneyatra_current_user';
const USERS_STORAGE_KEY = 'oneyatra_users_db';

// Mock delay to simulate network request
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Initialize sync from Firebase to LocalStorage
onAuthStateChanged(auth, (user) => {
  if (user && (user.emailVerified || user.providerData[0]?.providerId === 'google.com')) {
    const profile: UserProfile = {
      email: user.email || '',
      name: user.displayName || 'User',
      avatar: user.photoURL || undefined,
      preferences: {}
    };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profile));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
});

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
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update display name
    await updateProfile(user, { displayName: name });
    
    // Send verification email
    await sendEmailVerification(user);
    
    return { success: true, message: "Verification email sent. Please check your inbox." };
  } catch (error: any) {
    console.error("Firebase Registration Error:", error);
    let message = "Registration failed.";
    if (error.code === 'auth/email-already-in-use') message = "Email already in use.";
    else if (error.code === 'auth/weak-password') message = "Password is too weak.";
    else if (error.code === 'auth/operation-not-allowed') message = "Email/Password sign-in is not enabled in Firebase Console.";
    else if (error.code === 'auth/invalid-email') message = "Invalid email address.";
    else if (error.message) message = `Registration failed: ${error.message}`;
    
    return { success: false, message };
  }
};

export const loginWithEmail = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Force reload user to get latest emailVerified status
    await user.reload();
    const updatedUser = auth.currentUser;

    if (updatedUser && !updatedUser.emailVerified) {
      return { success: false, message: "Please verify your email before logging in. Check your inbox." };
    }

    const profile: UserProfile = {
      email: updatedUser?.email || user.email || '',
      name: updatedUser?.displayName || user.displayName || 'User',
      preferences: {}
    };
    
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profile));
    return { success: true };
  } catch (error: any) {
    console.error("Firebase Login Error:", error);
    let message = "Invalid email or password.";
    if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') message = "Invalid email or password.";
    else if (error.code === 'auth/wrong-password') message = "Invalid password.";
    else if (error.code === 'auth/too-many-requests') message = "Too many failed attempts. Please try again later.";
    else if (error.code === 'auth/operation-not-allowed') message = "Email/Password sign-in is not enabled in Firebase Console.";
    else if (error.message) message = `Login failed: ${error.message}`;
    
    return { success: false, message };
  }
};

export const resendVerificationEmail = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    if (user.emailVerified) {
      return { success: false, message: "Email is already verified." };
    }
    await sendEmailVerification(user);
    return { success: true, message: "Verification email resent. Please check your inbox." };
  } catch (error: any) {
    return { success: false, message: "Failed to resend verification email." };
  }
};

export const loginWithGoogle = async (): Promise<{ success: boolean; message?: string }> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    const profile: UserProfile = {
      email: user.email || '',
      name: user.displayName || 'User',
      avatar: user.photoURL || undefined,
      preferences: {}
    };
    
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profile));
    return { success: true };
  } catch (error: any) {
    return { success: false, message: "Google login failed." };
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

export const logoutUser = async () => {
  await signOut(auth);
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
