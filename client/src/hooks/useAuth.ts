import { useState, useEffect } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if we're in demo mode (no valid Firebase credentials)
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      
      // Demo mode fallback if Firebase credentials are not configured
      if (!auth) {
        // Create a mock user object for demo purposes
        const mockUser = {
          uid: 'demo-user-' + Date.now(),
          email: email,
          emailVerified: true,
          displayName: email.split('@')[0],
          photoURL: null,
          getIdToken: async () => 'demo-token',
          getIdTokenResult: async () => ({ token: 'demo-token' })
        } as User;
        
        setUser(mockUser);
        return mockUser;
      }
      
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      
      // Demo mode fallback if Firebase credentials are not configured
      if (!auth) {
        // Create a mock user object for demo purposes
        const mockUser = {
          uid: 'demo-user-' + Date.now(),
          email: email,
          emailVerified: true,
          displayName: email.split('@')[0],
          photoURL: null,
          getIdToken: async () => 'demo-token',
          getIdTokenResult: async () => ({ token: 'demo-token' })
        } as User;
        
        setUser(mockUser);
        return mockUser;
      }
      
      const result = await createUserWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      
      // Demo mode - just clear the user
      if (!auth) {
        setUser(null);
        return;
      }
      
      await signOut(auth);
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  return {
    user,
    loading,
    error,
    login,
    signup,
    logout,
  };
}
