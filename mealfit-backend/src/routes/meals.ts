import { Env } from '../types';
import { getUser } from '../services/db';
import { searchMeals } from '../services/db';
import { getWeatherContext } from '../services/weather';
import { getMealSuggestions } from '../services/engine';
import { cacheGet, cacheSet, TTL } from '../services/cache';

export async function handleRecommend(request: Request, env: Env): Promise<Response> {
  const url    = new URL(request.url);
  const userId = url.searchParams.get('userId');
  const lat    = parseFloat(url.searchParams.get('lat') ?? '23.8');
  const lon    = parseFloat(url.searchParams.get('lon') ?? '90.4');

  if (!userId) return err('userId is required', 400);

  // Check recommendation cache first
  const cacheKey = `rec:${userId}`;
  const cached = await cacheGet(cacheKey, env);
  if (cached) return json(cached);

  const profile = await getUser(userId, env);
  if (!profile) return err('User not found. Call /api/user/setup first.', 404);

  const weather = await getWeatherContext(lat, lon, profile.country, env);
  const result  = await getMealSuggestions(userId, profile, weather, lat, lon, env);

  await cacheSet(cacheKey, result, TTL.RECOMMENDATION, env);
  return json(result);
}

export async function handleSearch(request: Request, env: Env): Promise<Response> {
  const url    = new URL(request.url);
  const q      = url.searchParams.get('q') ?? '';
  const userId = url.searchParams.get('userId');
  if (!q) return err('q is required', 400);

  const profile = userId ? await getUser(userId, env) : null;
  const country = profile?.country ?? 'BD';
  const meals   = await searchMeals(q, country, env);
  return json(meals);
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json' }
  });
}
function err(msg: string, status = 400) {
  return json({ error: msg }, status);
}
