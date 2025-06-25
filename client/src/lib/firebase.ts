import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-key",
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project"}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project"}.appspot.com`,
  messagingSenderId: "123456789012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "demo-app-id",
};

// Initialize Firebase with proper error handling
let app;
let auth;

try {
  // Check if we have valid credentials
  const hasValidCredentials = 
    import.meta.env.VITE_FIREBASE_API_KEY && 
    import.meta.env.VITE_FIREBASE_PROJECT_ID &&
    import.meta.env.VITE_FIREBASE_APP_ID &&
    import.meta.env.VITE_FIREBASE_API_KEY !== "demo-key" &&
    import.meta.env.VITE_FIREBASE_API_KEY.startsWith("AIza") &&
    import.meta.env.VITE_FIREBASE_PROJECT_ID.length > 0 &&
    import.meta.env.VITE_FIREBASE_APP_ID.includes(":");

  if (hasValidCredentials) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    console.log("Firebase initialized with real credentials");
  } else {
    console.log("Bypassing Firebase completely - running in demo mode");
    // Don't initialize Firebase at all in demo mode
    app = null;
    auth = null;
  }
} catch (error) {
  console.error("Firebase initialization failed:", error);
  console.log("Running in complete bypass mode");
  app = null;
  auth = null;
}

export { auth };
export default app;
