import { useState, useEffect } from 'react';

// Mock User type to avoid Firebase dependency
interface MockUser {
  uid: string;
  email: string;
  emailVerified: boolean;
  displayName: string | null;
  photoURL: string | null;
  getIdToken: () => Promise<string>;
  getIdTokenResult: () => Promise<{ token: string }>;
}

export function useAuth() {
  const [user, setUser] = useState<MockUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Always bypass authentication in demo mode
    setLoading(false);
    
    // Set a mock user for demo purposes
    const mockUser: MockUser = {
      uid: 'demo-user-bypass',
      email: 'demo@aistarterschool.com',
      emailVerified: true,
      displayName: 'Demo User',
      photoURL: null,
      getIdToken: async () => 'demo-token',
      getIdTokenResult: async () => ({ token: 'demo-token' })
    };
    
    setUser(mockUser);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      
      // Always return mock user in bypass mode
      const mockUser: MockUser = {
        uid: 'demo-user-' + Date.now(),
        email: email,
        emailVerified: true,
        displayName: email.split('@')[0],
        photoURL: null,
        getIdToken: async () => 'demo-token',
        getIdTokenResult: async () => ({ token: 'demo-token' })
      };
      
      setUser(mockUser);
      return mockUser;
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
      
      // Always return mock user in bypass mode
      const mockUser: MockUser = {
        uid: 'demo-user-' + Date.now(),
        email: email,
        emailVerified: true,
        displayName: email.split('@')[0],
        photoURL: null,
        getIdToken: async () => 'demo-token',
        getIdTokenResult: async () => ({ token: 'demo-token' })
      };
      
      setUser(mockUser);
      return mockUser;
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
      // In bypass mode, just clear the user
      setUser(null);
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
