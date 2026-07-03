import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';

interface LocalUser {
  uid: string;
  email: string;
  displayName: string;
}

interface AuthContextType {
  user: LocalUser | null;
  userId: string | null;
  loading: boolean;
  signup: (email: string, name: string) => Promise<void>;
  login: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const token = await api.loadToken();
        if (token) {
          const profile = await api.getMe();
          setUser({
            uid: profile.userId,
            email: profile.email,
            displayName: profile.name,
          });
        }
      } catch {
        await api.logout();
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const signup = async (email: string, name: string) => {
    const result = await api.signup(email, name);
    setUser({
      uid: result.userId,
      email: result.email,
      displayName: result.name,
    });
  };

  const login = async (email: string) => {
    const result = await api.login(email);
    setUser({
      uid: result.userId,
      email: result.email,
      displayName: result.name,
    });
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, userId: user?.uid || null, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
