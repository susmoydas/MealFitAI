import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import {
  Meal, ScanResult, WeatherContext, RecommendationResponse,
  NutritionLevel, MealLog, DetectedFood,
} from '../types';

const KEYS = {
  PRELOADED: 'mealfit_cache_preloaded',
  RECIPES: 'mealfit_cache_recipes',
  SCANNER: 'mealfit_cache_scanner',
  WEATHER: 'mealfit_cache_weather',
  SEASONAL: 'mealfit_cache_seasonal',
  RECS: 'mealfit_cache_recommendations',
  PENDING_SYNC: 'mealfit_cache_pending_sync',
  NUTRITION: 'mealfit_cache_nutrition',
  CATEGORIES: 'mealfit_cache_categories',
  SUMMARY: 'mealfit_cache_daily_summary',
};

// ── Scanner demo results ──
const DEMO_SCAN_RESULTS: ScanResult[] = [
  {
    name: 'Rice and Curry', protein_level: 'Medium', carbs_level: 'High',
    fiber_level: 'Low', fat_level: 'Medium', sugar_level: 'Low',
    calories: 450, confidence: 92, food_category: 'Mixed Dish',
    serving_size: '1 plate',
    guidance: 'A hearty rice-based meal. Add a side of vegetables for more fiber.',
    multiple_foods: [
      { name: 'Steamed Rice', confidence: 95, calories: 200, protein_level: 'Low', carbs_level: 'High', fat_level: 'Low', fiber_level: 'Low', serving_size: '1.5 cups', food_category: 'Grain' },
      { name: 'Chicken Curry', confidence: 88, calories: 250, protein_level: 'High', carbs_level: 'Low', fat_level: 'Medium', fiber_level: 'Low', serving_size: '1 serving', food_category: 'Meat Dish' },
    ],
  },
  {
    name: 'Fresh Garden Salad', protein_level: 'Low', carbs_level: 'Low',
    fiber_level: 'High', fat_level: 'Low', sugar_level: 'Low',
    calories: 180, confidence: 90, food_category: 'Salad',
    serving_size: '1 bowl',
    guidance: 'A fresh, low-calorie salad. Add grilled chicken or chickpeas for protein.',
    multiple_foods: [
      { name: 'Mixed Greens', confidence: 90, calories: 30, protein_level: 'Low', carbs_level: 'Low', fat_level: 'Low', fiber_level: 'Medium', serving_size: '2 cups', food_category: 'Vegetable' },
      { name: 'Cherry Tomatoes', confidence: 87, calories: 25, protein_level: 'Low', carbs_level: 'Low', fat_level: 'Low', fiber_level: 'Low', serving_size: '5 pieces', food_category: 'Vegetable' },
      { name: 'Cucumber', confidence: 83, calories: 15, protein_level: 'Low', carbs_level: 'Low', fat_level: 'Low', fiber_level: 'Low', serving_size: '1/2 cup', food_category: 'Vegetable' },
    ],
  },
  {
    name: 'Vegetable Soup', protein_level: 'Low', carbs_level: 'Medium',
    fiber_level: 'High', fat_level: 'Low', sugar_level: 'Low',
    calories: 200, confidence: 91, food_category: 'Soup',
    serving_size: '1 bowl',
    guidance: 'A warming, nutrient-rich soup that supports hydration and digestion.',
    multiple_foods: [
      { name: 'Vegetable Broth Soup', confidence: 91, calories: 180, protein_level: 'Low', carbs_level: 'Medium', fat_level: 'Low', fiber_level: 'High', serving_size: '1 bowl', food_category: 'Soup' },
    ],
  },
  {
    name: 'Home-cooked Meal', protein_level: 'Medium', carbs_level: 'Medium',
    fiber_level: 'Medium', fat_level: 'Medium', sugar_level: 'Low',
    calories: 300, confidence: 88, food_category: 'Mixed Dish',
    serving_size: '1 plate',
    guidance: 'A balanced home-cooked meal with good nutritional variety.',
    multiple_foods: [
      { name: 'Rice', confidence: 92, calories: 150, protein_level: 'Low', carbs_level: 'High', fat_level: 'Low', fiber_level: 'Low', serving_size: '1 cup', food_category: 'Grain' },
      { name: 'Mixed Vegetable Curry', confidence: 85, calories: 120, protein_level: 'Medium', carbs_level: 'Medium', fat_level: 'Medium', fiber_level: 'High', serving_size: '1 serving', food_category: 'Curry' },
    ],
  },
  {
    name: 'Grilled Salmon with Vegetables', protein_level: 'High', carbs_level: 'Low',
    fiber_level: 'Medium', fat_level: 'Medium', sugar_level: 'Low',
    calories: 380, confidence: 93, food_category: 'Seafood',
    serving_size: '1 fillet',
    guidance: 'A protein-rich meal with healthy omega-3 fats. Pairs well with quinoa.',
    multiple_foods: [
      { name: 'Grilled Salmon', confidence: 94, calories: 280, protein_level: 'High', carbs_level: 'Low', fat_level: 'Medium', fiber_level: 'Low', serving_size: '1 fillet', food_category: 'Seafood' },
      { name: 'Roasted Vegetables', confidence: 86, calories: 100, protein_level: 'Low', carbs_level: 'Medium', fat_level: 'Low', fiber_level: 'High', serving_size: '1 cup', food_category: 'Vegetable' },
    ],
  },
];

export const offlineCache = {
  isOnline: async (): Promise<boolean> => {
    try {
      const state = await NetInfo.fetch();
      return state.isConnected ?? true;
    } catch {
      return true;
    }
  },

  // ── Preload on first install ──
  preload: async (): Promise<void> => {
    const done = await AsyncStorage.getItem(KEYS.PRELOADED);
    if (done === 'true') return;

    const { MOCK_MEALS } = require('../data/mockData') as { MOCK_MEALS: Meal[] };
    const batch: [string, string][] = [
      [KEYS.PRELOADED, 'true'],
      [KEYS.RECIPES, JSON.stringify(MOCK_MEALS)],
      [KEYS.SCANNER, JSON.stringify(DEMO_SCAN_RESULTS)],
    ];

    // Extract categories and nutrition info
    const categories = [...new Set(MOCK_MEALS.map(m => m.cuisine_origin))];
    const nutritionMap: Record<string, { protein: NutritionLevel[]; cuisine: string }> = {};
    MOCK_MEALS.forEach(m => {
      nutritionMap[m.id] = { protein: [m.protein_level], cuisine: m.cuisine_origin };
    });
    batch.push([KEYS.CATEGORIES, JSON.stringify(categories)]);
    batch.push([KEYS.NUTRITION, JSON.stringify(nutritionMap)]);

    await AsyncStorage.multiSet(batch);
  },

  // ── Recipes ──
  getRecipes: async (): Promise<Meal[]> => {
    const raw = await AsyncStorage.getItem(KEYS.RECIPES);
    if (raw) {
      try { return JSON.parse(raw); } catch { /* fall through */ }
    }
    const { MOCK_MEALS } = require('../data/mockData') as { MOCK_MEALS: Meal[] };
    return MOCK_MEALS;
  },

  cacheRecipes: async (meals: Meal[]): Promise<void> => {
    await AsyncStorage.setItem(KEYS.RECIPES, JSON.stringify(meals));
  },

  // ── Scanner ──
  getScanResult: async (): Promise<ScanResult> => {
    const raw = await AsyncStorage.getItem(KEYS.SCANNER);
    if (raw) {
      try {
        const results: ScanResult[] = JSON.parse(raw);
        return results[Math.floor(Math.random() * results.length)];
      } catch { /* fall through */ }
    }
    return DEMO_SCAN_RESULTS[Math.floor(Math.random() * DEMO_SCAN_RESULTS.length)];
  },

  cacheScanResult: async (result: ScanResult): Promise<void> => {
    const raw = await AsyncStorage.getItem(KEYS.SCANNER);
    if (raw) {
      try {
        const existing: ScanResult[] = JSON.parse(raw);
        existing.unshift(result);
        await AsyncStorage.setItem(KEYS.SCANNER, JSON.stringify(existing.slice(0, 10)));
      } catch {
        await AsyncStorage.setItem(KEYS.SCANNER, JSON.stringify([result, ...DEMO_SCAN_RESULTS]));
      }
    } else {
      await AsyncStorage.setItem(KEYS.SCANNER, JSON.stringify([result, ...DEMO_SCAN_RESULTS]));
    }
  },

  // ── Weather ──
  getWeather: async (): Promise<WeatherContext | null> => {
    const raw = await AsyncStorage.getItem(KEYS.WEATHER);
    return raw ? JSON.parse(raw) : null;
  },

  cacheWeather: async (weather: WeatherContext): Promise<void> => {
    await AsyncStorage.setItem(KEYS.WEATHER, JSON.stringify(weather));
  },

  // ── Recommendations ──
  getRecs: async (): Promise<RecommendationResponse | null> => {
    const raw = await AsyncStorage.getItem(KEYS.RECS);
    return raw ? JSON.parse(raw) : null;
  },

  cacheRecs: async (recs: RecommendationResponse): Promise<void> => {
    await AsyncStorage.setItem(KEYS.RECS, JSON.stringify(recs));
  },

  // ── Seasonal picks ──
  getSeasonalPicks: async (): Promise<any[]> => {
    const raw = await AsyncStorage.getItem(KEYS.SEASONAL);
    return raw ? JSON.parse(raw) : [];
  },

  cacheSeasonalPicks: async (picks: any[]): Promise<void> => {
    await AsyncStorage.setItem(KEYS.SEASONAL, JSON.stringify(picks));
  },

  // ── Pending sync queue ──
  addPendingSync: async (log: Omit<MealLog, 'id'>): Promise<void> => {
    const raw = await AsyncStorage.getItem(KEYS.PENDING_SYNC);
    const pending: Omit<MealLog, 'id'>[] = raw ? JSON.parse(raw) : [];
    pending.push(log);
    await AsyncStorage.setItem(KEYS.PENDING_SYNC, JSON.stringify(pending));
  },

  getPendingSync: async (): Promise<Omit<MealLog, 'id'>[]> => {
    const raw = await AsyncStorage.getItem(KEYS.PENDING_SYNC);
    return raw ? JSON.parse(raw) : [];
  },

  clearPendingSync: async (): Promise<void> => {
    await AsyncStorage.removeItem(KEYS.PENDING_SYNC);
  },

  // ── Sync when back online ──
  syncPendingData: async (): Promise<void> => {
    const pending = await offlineCache.getPendingSync();
    if (pending.length === 0) return;

    const { api } = require('./api') as typeof import('./api');
    const errors: Omit<MealLog, 'id'>[] = [];

    for (const log of pending) {
      try {
        await api.logMeal(log);
      } catch {
        errors.push(log);
      }
    }

    if (errors.length === 0) {
      await offlineCache.clearPendingSync();
    } else {
      await AsyncStorage.setItem(KEYS.PENDING_SYNC, JSON.stringify(errors));
    }
  },
};
