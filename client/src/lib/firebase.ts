import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-key",
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project"}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project"}.firebasestorage.app`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "demo-app-id",
};

// Initialize Firebase with proper error handling
let app;
let auth;

try {
  // Check if we have valid credentials
  const hasValidCredentials = import.meta.env.VITE_FIREBASE_API_KEY && 
    import.meta.env.VITE_FIREBASE_API_KEY !== "demo-key" &&
    import.meta.env.VITE_FIREBASE_API_KEY.startsWith("AIza");

  if (hasValidCredentials) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    console.log("Firebase initialized successfully");
  } else {
    // Initialize with demo config that won't cause API errors
    const demoConfig = {
      apiKey: "demo-key-bypass",
      authDomain: "demo.firebaseapp.com", 
      projectId: "demo-project",
      storageBucket: "demo-project.appspot.com",
      appId: "1:123456789:web:demo"
    };
    
    console.log("Initializing Firebase in demo mode");
    app = initializeApp(demoConfig);
    auth = getAuth(app);
    
    // Connect to auth emulator in demo mode to avoid real API calls
    if (typeof window !== 'undefined' && !auth._authDomain.includes('localhost')) {
      try {
        connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
      } catch (e) {
        // Emulator connection failed, continue in demo mode
        console.log("Running in demo mode without emulator");
      }
    }
  }
} catch (error) {
  console.error("Firebase initialization failed:", error);
  // Create minimal working firebase instance
  const fallbackConfig = {
    apiKey: "fallback-key",
    authDomain: "fallback.firebaseapp.com",
    projectId: "fallback-project"
  };
  app = initializeApp(fallbackConfig);
  auth = getAuth(app);
}

export { auth };
export default app;
