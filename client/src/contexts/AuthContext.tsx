import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import axios from 'axios';

// Check if Firebase config is available
const hasFirebaseConfig = import.meta.env.VITE_FIREBASE_API_KEY && 
                         import.meta.env.VITE_FIREBASE_AUTH_DOMAIN && 
                         import.meta.env.VITE_FIREBASE_PROJECT_ID && 
                         import.meta.env.VITE_FIREBASE_APP_ID;

let auth: any = null;

if (hasFirebaseConfig) {
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };
  initializeApp(firebaseConfig);
  auth = getAuth();
} else {
  console.warn('Firebase configuration not found. Running in development mode with mock authentication.');
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: 'user' | 'therapist';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  profile: UserProfile | null;
  needsProfile: boolean;
  refetchProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [needsProfile, setNeedsProfile] = useState(false);

  const fetchProfile = useCallback(async (firebaseUser: User | null) => {
    if (!firebaseUser) {
      setProfile(null);
      setNeedsProfile(false);
      return;
    }
    try {
      const token = await firebaseUser.getIdToken();
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data);
      setNeedsProfile(false);
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        setNeedsProfile(true);
        setProfile(null);
      } else {
        setProfile(null);
        setNeedsProfile(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!auth) {
      // Development mode - no Firebase
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      fetchProfile(firebaseUser);
    });
    return unsubscribe;
  }, [fetchProfile]);

  const login = async (email: string, password: string) => {
    if (!auth) {
      // Development mode - mock login
      setLoading(true);
      setTimeout(() => {
        const mockUser = {
          uid: 'dev-user-123',
          email: email,
          getIdToken: async () => 'mock-token'
        } as User;
        setUser(mockUser);
        setNeedsProfile(true);
        setLoading(false);
      }, 1000);
      return;
    }

    setLoading(true);
    await signInWithEmailAndPassword(auth, email, password);
    setLoading(false);
  };

  const logout = async () => {
    if (!auth) {
      // Development mode - mock logout
      setLoading(true);
      setTimeout(() => {
        setUser(null);
        setProfile(null);
        setNeedsProfile(false);
        setLoading(false);
      }, 500);
      return;
    }

    setLoading(true);
    await signOut(auth);
    setLoading(false);
    setProfile(null);
    setNeedsProfile(false);
  };

  const refetchProfile = async () => {
    await fetchProfile(user);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, profile, needsProfile, refetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
} 