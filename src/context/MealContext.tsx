import React, { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react';
import { Meal, RecommendationResponse } from '../types';
import { dataService } from '../services/dataService';
import { offlineCache } from '../services/offlineCache';
import { saveLastRecs, loadLastRecs } from '../services/storage';
import { buildMockRecommendation } from '../data/mockData';
import * as Location from 'expo-location';

interface MealContextType {
  recs: RecommendationResponse | null;
  activeMeal: Meal | null;
  loading: boolean;
  error: string | null;
  fetchRecs: (userId: string) => Promise<void>;
  setActiveMeal: (meal: Meal) => void;
  logMeal: (userId: string, meal: Meal, source: 'primary' | 'alternative' | 'scanner' | 'manual') => Promise<void>;
}

const MealContext = createContext<MealContextType | null>(null);
const DEFAULT_LOCATION = { lat: 23.8, lon: 90.4 };

export function MealProvider({ children }: { children: ReactNode }) {
  const [recs, setRecs] = useState<RecommendationResponse | null>(null);
  const [activeMeal, setActiveMeal] = useState<Meal | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const locationRef = useRef<{ lat: number; lon: number } | null>(null);
  const locationAttempted = useRef(false);

  const getLocation = useCallback(async (): Promise<{ lat: number; lon: number }> => {
    if (locationRef.current) return locationRef.current;
    if (locationAttempted.current) return DEFAULT_LOCATION;
    locationAttempted.current = true;
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return DEFAULT_LOCATION;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      locationRef.current = { lat: loc.coords.latitude, lon: loc.coords.longitude };
      return locationRef.current;
    } catch {
      return DEFAULT_LOCATION;
    }
  }, []);

  const fetchRecs = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);

    // Preload offline cache on first launch
    offlineCache.preload();

    // Sync any pending data from offline period
    offlineCache.syncPendingData();

    try {
      const { lat, lon } = await getLocation();
      const result = await dataService.recommend(userId, lat, lon);
      setRecs(result);
      setActiveMeal(result.primary);
      await saveLastRecs(result);
    } catch {
      setError('Using cached suggestions.');
      const cached = await loadLastRecs();
      if (cached) {
        setRecs(cached);
        setActiveMeal(cached.primary);
      } else {
        const cachedOffline = await offlineCache.getRecs();
        if (cachedOffline) {
          setRecs(cachedOffline);
          setActiveMeal(cachedOffline.primary);
        } else {
          const mock = buildMockRecommendation(userId);
          setRecs(mock);
          setActiveMeal(mock.primary);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [getLocation]);

  const logMeal = async (
    userId: string,
    meal: Meal,
    source: 'primary' | 'alternative' | 'scanner' | 'manual',
  ) => {
    await dataService.logMeal({
      user_id: userId,
      meal_id: meal.id,
      meal_name: meal.name,
      meal_type: meal.meal_type,
      protein_tag: meal.protein_tag,
      eaten_at: new Date().toISOString(),
      source,
      calories: meal.calories,
      protein_level: meal.protein_level,
      carbs_level: meal.carbs_level,
      fiber_level: meal.fiber_level,
    });
    setTimeout(() => fetchRecs(userId), 1000);
  };

  return (
    <MealContext.Provider value={{ recs, activeMeal, loading, error, fetchRecs, setActiveMeal, logMeal }}>
      {children}
    </MealContext.Provider>
  );
}

export const useMeal = () => {
  const ctx = useContext(MealContext);
  if (!ctx) throw new Error('useMeal must be used within MealProvider');
  return ctx;
};
