import { UserProfile, RecommendationResponse, WeatherContext, ScanResult, MealLog, Meal, Restaurant } from '../types';
import { api } from './api';
import { offlineCache } from './offlineCache';
import {
  buildMockRecommendation, getMockWeather, mockIdentify,
  mockCheckNotifications, searchMeals, getMealById, generateMockHistory
} from '../data/mockData';
import { JournalEntry } from '../context/JournalContext';

export const dataService = {
  async recommend(userId: string, lat: number, lon: number): Promise<RecommendationResponse> {
    try {
      const result = await api.getRecommendations(userId) as any;
      if (result && result.primary) {
        offlineCache.cacheRecs(result);
        return result;
      }
      throw new Error('Invalid response');
    } catch {
      const cached = await offlineCache.getRecs();
      if (cached) return cached;
      return buildMockRecommendation(userId, lat, lon);
    }
  },

  async search(query: string, userId: string): Promise<Meal[]> {
    try {
      const results = await api.searchMeals(query) as any;
      if (results && results.length > 0) return results;
      throw new Error('No results');
    } catch {
      const cached = await offlineCache.getRecipes();
      const q = query.toLowerCase();
      const filtered = cached.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.cuisine_origin.toLowerCase().includes(q) ||
        m.ingredients.some(i => i.name.toLowerCase().includes(q))
      );
      if (filtered.length > 0) return filtered;
      return searchMeals(query);
    }
  },

  async getWeather(userId: string, lat: number, lon: number): Promise<WeatherContext> {
    try {
      const result = await api.getWeather('BD') as unknown as WeatherContext;
      if (result && result.condition) {
        offlineCache.cacheWeather(result);
        return result;
      }
      throw new Error('Invalid weather');
    } catch {
      const cached = await offlineCache.getWeather();
      if (cached) return cached;
      return getMockWeather(lat, lon);
    }
  },

  async identify(userId: string, imageBase64: string): Promise<ScanResult> {
    try {
      const result = await api.identify(imageBase64, userId);

      if (!result || !Array.isArray(result.foods) || result.foods.length === 0) {
        throw new Error('No foods detected by API');
      }

      const primary = result.foods[0];
      const scanResult: ScanResult = {
        name: primary.name,
        protein_level: 'Medium',
        carbs_level: 'Medium',
        fiber_level: 'Low',
        calories: primary.calories,
        confidence: Math.round(primary.confidence * 100),
        guidance: primary.guidance || 'Balanced meal option.',
      };

      offlineCache.cacheScanResult(scanResult);

      return scanResult;
    } catch (error) {
      console.error('API identify failed, using offline result:', error);
      return offlineCache.getScanResult();
    }
  },

  async checkNotifications(userId: string): Promise<{ id: string; type: string; icon: string; title: string; message: string; time: string; read: boolean }[]> {
    try {
      return mockCheckNotifications();
    } catch {
      return mockCheckNotifications();
    }
  },

  async setupUser(profile: UserProfile): Promise<boolean> {
    try {
      await api.setupProfile(profile);
      offlineCache.preload();
      return true;
    } catch {
      offlineCache.preload();
      return true;
    }
  },

  async updateProfile(profile: UserProfile): Promise<boolean> {
    try {
      await api.updateProfile(profile);
      return true;
    } catch {
      return true;
    }
  },

  async logMeal(log: Omit<MealLog, 'id'>): Promise<boolean> {
    try {
      await api.logMeal(log);
      return true;
    } catch {
      offlineCache.addPendingSync(log);
      return false;
    }
  },

  async getHistory(userId: string, hours?: number): Promise<MealLog[]> {
    try {
      return await api.getRecentHistory(userId, hours || 168) as any;
    } catch {
      return [];
    }
  },

  generateMockHistory(userId: string): JournalEntry[] {
    return generateMockHistory(userId);
  },

  getMealById(id: string): Meal | undefined {
    return getMealById(id);
  },

  async nearbyRestaurants(lat: number, lon: number, meal: string, cuisine: string): Promise<Restaurant[]> {
    try {
      return await api.getNearbyRestaurants(lat, lon, meal, cuisine) as any;
    } catch {
      return [];
    }
  },
};
