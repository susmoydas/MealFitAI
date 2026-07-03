import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS } from '../constants';
import { UserProfile, MealLog, RecommendationResponse } from '../types';

async function save<T>(key: string, value: T): Promise<void> {
  await SecureStore.setItemAsync(key, JSON.stringify(value));
}

async function load<T>(key: string): Promise<T | null> {
  const val = await SecureStore.getItemAsync(key);
  return val ? JSON.parse(val) as T : null;
}

export async function getUserId(): Promise<string | null> {
  return SecureStore.getItemAsync(STORAGE_KEYS.USER_ID);
}

export async function saveUserId(id: string): Promise<void> {
  await SecureStore.setItemAsync(STORAGE_KEYS.USER_ID, id);
}

export const saveProfile = (p: UserProfile) => save(STORAGE_KEYS.USER_PROFILE, p);
export const loadProfile = () => load<UserProfile>(STORAGE_KEYS.USER_PROFILE);

export const saveLastRecs = (r: RecommendationResponse) => save(STORAGE_KEYS.LAST_RECS, r);
export const loadLastRecs = () => load<RecommendationResponse>(STORAGE_KEYS.LAST_RECS);

export async function addPendingLog(log: Omit<MealLog,'id'>): Promise<void> {
  const existing = (await load<Omit<MealLog,'id'>[]>(STORAGE_KEYS.PENDING_LOGS)) ?? [];
  await save(STORAGE_KEYS.PENDING_LOGS, [...existing, log]);
}

export async function flushPendingLogs(): Promise<Omit<MealLog,'id'>[]> {
  const logs = (await load<Omit<MealLog,'id'>[]>(STORAGE_KEYS.PENDING_LOGS)) ?? [];
  await SecureStore.deleteItemAsync(STORAGE_KEYS.PENDING_LOGS);
  return logs;
}

export const isOnboarded = async () => !!(await SecureStore.getItemAsync(STORAGE_KEYS.ONBOARDED));
export const setOnboarded = () => SecureStore.setItemAsync(STORAGE_KEYS.ONBOARDED, 'true');
