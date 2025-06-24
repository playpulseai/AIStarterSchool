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

try {
  if (import.meta.env.VITE_FIREBASE_API_KEY === "demo-key") {
    console.log("Running in demo mode - Firebase authentication disabled");
    // Create a minimal auth object for demo mode
    auth = null;
  } else {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
  }
} catch (error) {
  console.error("Firebase initialization error:", error);
  auth = null;
}

export { auth };
export default app;
