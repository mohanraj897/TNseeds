import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// Optional
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyB_mLyGIpuI8vgNeP2QIAno9fXC25-Qwoo",
  authDomain: "agri-6bbfc.firebaseapp.com",
  projectId: "agri-6bbfc",
  storageBucket: "agri-6bbfc.firebasestorage.app",
  messagingSenderId: "1045736503877",
  appId: "1:1045736503877:web:520aec52520b173ac6012c",
  measurementId: "G-H7BDF4T1C9",
};

const app = initializeApp(firebaseConfig);

// Optional (only if you need Analytics)
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export default app;