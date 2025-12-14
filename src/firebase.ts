import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyACJqKHCCpIMfPzvCYeIBsokjLVdRdQjhg",
  authDomain: "fir-expo-demo-b375e.firebaseapp.com",
  projectId: "fir-expo-demo-b375e",
  storageBucket: "fir-expo-demo-b375e.firebasestorage.app",
  messagingSenderId: "576772893511",
  appId: "1:576772893511:web:5f4946106b7b4ed9e87a62",
  measurementId: "G-XT50X4K8ZS",
};

export const firebaseApp = initializeApp(firebaseConfig);

// Auth - Firebase gerencia a sessão automaticamente
export const auth = getAuth(firebaseApp);
