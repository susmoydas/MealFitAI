import { Env } from '../types';

export async function cacheGet<T>(key: string, env: Env): Promise<T | null> {
  const val = await env.CACHE.get(key, 'json');
  return (val as T) ?? null;
}

export async function cacheSet<T>(
  key: string, value: T, ttlSeconds: number, env: Env
): Promise<void> {
  await env.CACHE.put(key, JSON.stringify(value), { expirationTtl: ttlSeconds });
}

export async function cacheDel(key: string, env: Env): Promise<void> {
  await env.CACHE.delete(key);
}

// Convenience TTL constants
export const TTL = {
  WEATHER:         30 * 60,       // 30 minutes
  RECOMMENDATION:  30 * 60,       // 30 minutes
  VIDEO:           48 * 60 * 60,  // 48 hours
  NOTIFICATION:    6  * 60 * 60,  // 6 hours (dedup window)
};
