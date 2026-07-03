import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Meal, NutritionLevel } from '../types';
import { useAuth } from './AuthContext';
import { api } from '../services/api';

export interface JournalEntry {
  id: string;
  userId: string;
  mealId: string;
  mealName: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  proteinLevel: NutritionLevel;
  carbsLevel: NutritionLevel;
  fiberLevel: NutritionLevel;
  proteinTag: string;
  calories: number;
  eatenAt: string;
  source: 'primary' | 'alternative' | 'scanner' | 'manual' | 'recipe';
}

export interface DaySummary {
  date: string;
  label: string;
  meals: JournalEntry[];
  totalCalories: number;
  proteinCount: { High: number; Medium: number; Low: number };
  fiberCount: { High: number; Medium: number; Low: number };
}

export interface NutritionInsight {
  type: 'warning' | 'tip' | 'positive';
  icon: string;
  text: string;
  detail?: string;
}

interface JournalContextType {
  todayEntries: JournalEntry[];
  weekEntries: JournalEntry[];
  allEntries: JournalEntry[];
  daySummaries: DaySummary[];
  insights: NutritionInsight[];
  addEntry: (meal: Meal, mealType: JournalEntry['mealType'], source: JournalEntry['source'], userId: string) => Promise<void>;
  addEntryLocal: (meal: Meal, mealType: JournalEntry['mealType'], source: JournalEntry['source'], userId: string) => Promise<void>;
  ensureSeeded: (userId: string) => Promise<void>;
  loading: boolean;
}

function getDayLabel(date: Date): string {
  const now = new Date();
  const diff = now.getDate() - date.getDate();
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

const MEAL_TYPE_ORDER = ['breakfast', 'lunch', 'dinner', 'snack'];

function generateInsights(entries: JournalEntry[]): NutritionInsight[] {
  const insights: NutritionInsight[] = [];
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const recent = entries.filter(e => new Date(e.eatenAt) >= weekAgo);

  const tagCounts: Record<string, { count: number; names: string[] }> = {};
  recent.forEach(e => {
    const tag = (e.proteinTag || 'other').toLowerCase();
    if (!tagCounts[tag]) tagCounts[tag] = { count: 0, names: [] };
    tagCounts[tag].count++;
    if (!tagCounts[tag].names.includes(e.mealName)) {
      tagCounts[tag].names.push(e.mealName);
    }
  });

  const highProteinRatio = recent.filter(e => e.proteinLevel === 'High').length / Math.max(recent.length, 1);
  const highFiberRatio = recent.filter(e => e.fiberLevel === 'High').length / Math.max(recent.length, 1);

  Object.entries(tagCounts).forEach(([tag, info]) => {
    if (info.count >= 3) {
      const label = tag.charAt(0).toUpperCase() + tag.slice(1);
      const examples = info.names.slice(0, 2).join(', ');
      insights.push({
        type: 'warning',
        icon: '\u26A0\uFE0F',
        text: `${label} ${info.count}x this week — try a different protein today.`,
        detail: examples ? `Had: ${examples}` : undefined,
      });
    }
  });

  if (recent.length >= 4 && highProteinRatio < 0.25) {
    insights.push({
      type: 'warning',
      icon: '\uD83D\uDCAA',
      text: 'Protein has been low this week. Add lentils, eggs, or fish to your meals.',
    });
  }

  if (recent.length >= 4 && highFiberRatio < 0.2) {
    insights.push({
      type: 'warning',
      icon: '\uD83C\uDF3E',
      text: 'Fiber is low this week. Include vegetables, dal, or oats in your meals.',
    });
  }

  if (recent.length >= 14) {
    insights.push({
      type: 'positive',
      icon: '\u2705',
      text: 'Great consistency! You\'ve been logging meals regularly.',
    });
  }

  const uniqueProteins = new Set(recent.map(e => e.proteinTag)).size;
  if (uniqueProteins >= 5) {
    insights.push({
      type: 'positive',
      icon: '\uD83C\uDF7D\uFE0F',
      text: `Excellent variety! You've had ${uniqueProteins} different protein sources this week.`,
    });
  }

  if (insights.length === 0) {
    insights.push({ type: 'tip', icon: '\uD83C\uDF7D\uFE0F', text: 'Log your meals to get personalized nutrition insights.' });
  }

  return insights.slice(0, 4);
}

const FOOD_LOGS_KEY = '@mealfit_offline_logs';

async function loadOfflineLogs(): Promise<JournalEntry[]> {
  const raw = await AsyncStorage.getItem(FOOD_LOGS_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function saveOfflineLogs(logs: JournalEntry[]): Promise<void> {
  await AsyncStorage.setItem(FOOD_LOGS_KEY, JSON.stringify(logs));
}

const JournalContext = createContext<JournalContextType | null>(null);

export function JournalProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const loadEntries = useCallback(async (userId: string) => {
    setLoading(true);
    try {
      const logs = await api.getRecentHistory(userId, 168) as any[];
      const journalEntries: JournalEntry[] = logs.map((log: any) => ({
        id: log.id,
        userId: log.user_id,
        mealId: log.meal_id,
        mealName: log.meal_name || 'Unknown',
        mealType: log.meal_type || 'snack',
        proteinLevel: log.protein_level || 'Medium',
        carbsLevel: log.carbs_level || 'Medium',
        fiberLevel: log.fiber_level || 'Low',
        proteinTag: log.protein_tag || 'other',
        calories: log.calories || 300,
        eatenAt: log.eaten_at,
        source: log.source || 'scanner',
      }));
      journalEntries.sort((a, b) => new Date(b.eatenAt).getTime() - new Date(a.eatenAt).getTime());
      setEntries(journalEntries);
      await saveOfflineLogs(journalEntries);
    } catch (error) {
      if (__DEV__) console.log('Loading from offline cache');
      const offlineLogs = await loadOfflineLogs();
      setEntries(offlineLogs);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setEntries([]);
      return;
    }
    loadEntries(user.uid);
  }, [user, loadEntries]);

  const todayEntries = useMemo(() => {
    const now = new Date();
    return entries.filter(e => {
      const d = new Date(e.eatenAt);
      return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).sort((a, b) => MEAL_TYPE_ORDER.indexOf(a.mealType) - MEAL_TYPE_ORDER.indexOf(b.mealType));
  }, [entries]);

  const weekEntries = useMemo(() => {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return entries.filter(e => new Date(e.eatenAt) >= weekAgo).sort((a, b) => new Date(b.eatenAt).getTime() - new Date(a.eatenAt).getTime());
  }, [entries]);

  const daySummaries = useMemo(() => {
    const grouped: Record<string, JournalEntry[]> = {};
    const allRelevant = entries.filter(e => {
      const d = new Date(e.eatenAt);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return d >= weekAgo;
    });
    allRelevant.forEach(e => {
      const key = new Date(e.eatenAt).toDateString();
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(e);
    });
    return Object.entries(grouped).map(([dateKey, meals]) => {
      const date = new Date(dateKey);
      return {
        date: dateKey,
        label: getDayLabel(date),
        meals: meals.sort((a, b) => MEAL_TYPE_ORDER.indexOf(a.mealType) - MEAL_TYPE_ORDER.indexOf(b.mealType)),
        totalCalories: meals.reduce((s, m) => s + m.calories, 0),
        proteinCount: meals.reduce((acc, m) => { acc[m.proteinLevel]++; return acc; }, { High: 0, Medium: 0, Low: 0 }),
        fiberCount: meals.reduce((acc, m) => { acc[m.fiberLevel]++; return acc; }, { High: 0, Medium: 0, Low: 0 }),
      };
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [entries]);

  const insights = useMemo(() => generateInsights(entries), [entries]);

  const addEntry = useCallback(async (meal: Meal, mealType: JournalEntry['mealType'], source: JournalEntry['source'], userId: string) => {
    setLoading(true);
    try {
      await api.logMeal({
        user_id: userId,
        meal_id: meal.id,
        meal_name: meal.name,
        meal_type: mealType,
        protein_tag: meal.protein_tag,
        source,
        calories: meal.calories || 300,
        protein_level: meal.protein_level,
        carbs_level: meal.carbs_level,
        fiber_level: meal.fiber_level,
        fat_level: meal.fat_level || 'Medium',
      });

      const newEntry: JournalEntry = {
        id: `log-${Date.now()}`,
        userId,
        mealId: meal.id,
        mealName: meal.name,
        mealType,
        proteinLevel: meal.protein_level,
        carbsLevel: meal.carbs_level,
        fiberLevel: meal.fiber_level,
        proteinTag: meal.protein_tag,
        calories: meal.calories || 300,
        eatenAt: new Date().toISOString(),
        source,
      };

      setEntries(prev => {
        const updated = [newEntry, ...prev];
        updated.sort((a, b) => new Date(b.eatenAt).getTime() - new Date(a.eatenAt).getTime());
        saveOfflineLogs(updated);
        return updated;
      });
    } catch (error) {
      if (__DEV__) console.error('Error saving to backend, saving offline:', error);
      const newEntry: JournalEntry = {
        id: `offline-${Date.now()}`,
        userId,
        mealId: meal.id,
        mealName: meal.name,
        mealType,
        proteinLevel: meal.protein_level,
        carbsLevel: meal.carbs_level,
        fiberLevel: meal.fiber_level,
        proteinTag: meal.protein_tag,
        calories: meal.calories || 300,
        eatenAt: new Date().toISOString(),
        source,
      };
      setEntries(prev => {
        const updated = [newEntry, ...prev];
        saveOfflineLogs(updated);
        return updated;
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const addEntryLocal = useCallback(async (meal: Meal, mealType: JournalEntry['mealType'], source: JournalEntry['source'], userId: string) => {
    const newEntry: JournalEntry = {
      id: `local-${Date.now()}`,
      userId,
      mealId: meal.id,
      mealName: meal.name,
      mealType,
      proteinLevel: meal.protein_level,
      carbsLevel: meal.carbs_level,
      fiberLevel: meal.fiber_level,
      proteinTag: meal.protein_tag,
      calories: meal.calories || 0,
      eatenAt: new Date().toISOString(),
      source,
    };

    setEntries(prev => {
      const updated = [newEntry, ...prev];
      updated.sort((a, b) => new Date(b.eatenAt).getTime() - new Date(a.eatenAt).getTime());
      saveOfflineLogs(updated);
      return updated;
    });
  }, []);

  const ensureSeeded = useCallback(async (userId: string) => {
    // Backend handles seeding
  }, []);

  return (
    <JournalContext.Provider value={{ todayEntries, weekEntries, allEntries: entries, daySummaries, insights, addEntry, addEntryLocal, ensureSeeded, loading }}>
      {children}
    </JournalContext.Provider>
  );
}

export const useJournal = () => {
  const ctx = useContext(JournalContext);
  if (!ctx) throw new Error('useJournal must be used within JournalProvider');
  return ctx;
};
