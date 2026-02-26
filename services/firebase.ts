
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, EmailAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBrXnUCReVm8-T3ymkwJHDR2BhwIvWAWgk",
  authDomain: "oneyatra-964b6.firebaseapp.com",
  projectId: "oneyatra-964b6",
  storageBucket: "oneyatra-964b6.firebasestorage.app",
  messagingSenderId: "570711234788",
  appId: "1:570711234788:web:cf50457e4f3e7a97a774f1",
  measurementId: "G-28Q9PH522E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const emailProvider = new EmailAuthProvider();

export default app;
