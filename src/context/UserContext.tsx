import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '../types';
import { useAuth } from './AuthContext';
import { api } from '../services/api';

interface UserContextType {
  userId: string | null;
  profile: UserProfile | null;
  onboarded: boolean;
  loading: boolean;
  setupUser: (profile: Omit<UserProfile, 'id'>) => Promise<void>;
  updateProfile: (fields: Partial<UserProfile>) => Promise<void>;
  markOnboarded: () => Promise<void>;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [onboarded, setOnboarded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setProfile(null);
      setOnboarded(false);
      setLoading(false);
      return;
    }

    const loadProfile = async () => {
      try {
        const data = await api.getMe();
        setProfile({
          id: data.userId,
          name: data.name || user.displayName || '',
          email: data.email || user.email || '',
          country: data.country || '',
          diet_preference: data.diet_preference || '',
          allergies: data.allergies || [],
          activity_level: data.activity_level || '',
          health_goal: data.health_goal || '',
          units: (data.units as 'metric' | 'imperial') || 'metric',
        });
        setOnboarded(!!data.country);
      } catch (error) {
        if (__DEV__) console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, authLoading]);

  const setupUser = async (fields: Omit<UserProfile, 'id'>) => {
    if (!user) return;
    const full: UserProfile = { id: user.uid, ...fields };
    await api.setupProfile(full);
    setProfile(full);
  };

  const updateProfile = async (fields: Partial<UserProfile>) => {
    if (!profile || !user) return;
    const updated = { ...profile, ...fields };
    await api.updateProfile(updated);
    setProfile(updated);
  };

  const markOnboarded = async () => {
    setOnboarded(true);
  };

  return (
    <UserContext.Provider value={{ userId: user?.uid || null, profile, onboarded, loading, setupUser, updateProfile, markOnboarded }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
};
