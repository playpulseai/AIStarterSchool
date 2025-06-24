import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-key",
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project"}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project"}.firebasestorage.app`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "demo-app-id",
};

// Only initialize Firebase if we have real credentials
let app;
let auth;

// Check if we have valid Firebase credentials
const hasValidCredentials = import.meta.env.VITE_FIREBASE_API_KEY && 
  import.meta.env.VITE_FIREBASE_API_KEY !== "demo-key" &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID && 
  import.meta.env.VITE_FIREBASE_PROJECT_ID !== "demo-project" &&
  import.meta.env.VITE_FIREBASE_APP_ID && 
  import.meta.env.VITE_FIREBASE_APP_ID !== "demo-app-id" &&
  import.meta.env.VITE_FIREBASE_API_KEY.length > 20; // Basic validation for real API key

try {
  if (!hasValidCredentials) {
    console.log("Running in demo mode - provide Firebase credentials to enable full authentication");
    auth = null;
  } else {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    console.log("Firebase initialized successfully");
  }
} catch (error) {
  console.error("Firebase initialization error:", error);
  console.log("Falling back to demo mode");
  auth = null;
}

export { auth };
export default app;
