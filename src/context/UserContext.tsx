import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '../types';
import { STORAGE_KEYS } from '../constants';
import { api } from '../services/api';

function generateId(): string {
  return 'local_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

interface UserContextType {
  userId: string;
  profile: UserProfile;
  onboarded: boolean;
  loading: boolean;
  saveProfile: (p: UserProfile) => Promise<void>;
  updateProfile: (fields: Partial<UserProfile>) => Promise<void>;
}

const DEFAULT_PROFILE: UserProfile = {
  id: '',
  country: '',
  diet_preference: '',
  allergies: [],
  activity_level: 'moderate',
  health_goal: 'general_health',
  units: 'metric',
  name: '',
  email: '',
};

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
        if (raw) {
          const parsed: UserProfile = JSON.parse(raw);
          setProfile(parsed);
        }
      } catch {
        await AsyncStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const syncToApi = useCallback(async (p: UserProfile) => {
    try {
      await api.updateProfile(p);
    } catch {
      // offline — ignore
    }
  }, []);

  const saveProfile = useCallback(async (p: UserProfile) => {
    const final = { ...p };
    if (!final.id) final.id = generateId();
    setProfile(final);
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(final));
    syncToApi(final);
  }, [syncToApi]);

  const updateProfile = useCallback(async (fields: Partial<UserProfile>) => {
    if (!profile) return;
    const updated = { ...profile, ...fields };
    setProfile(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(updated));
    syncToApi(updated);
  }, [profile, syncToApi]);

  const value: UserContextType = {
    userId: profile?.id || '',
    profile: profile || DEFAULT_PROFILE,
    onboarded: !!(profile?.name && profile?.email && profile?.country && profile?.diet_preference),
    loading,
    saveProfile,
    updateProfile,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
};
