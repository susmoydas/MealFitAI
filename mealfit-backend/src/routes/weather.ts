import { Env } from '../types';
import { getUser } from '../services/db';
import { getWeatherContext } from '../services/weather';

export async function handleWeather(request: Request, env: Env): Promise<Response> {
  const url    = new URL(request.url);
  const userId = url.searchParams.get('userId');
  const lat    = parseFloat(url.searchParams.get('lat') ?? '23.8');
  const lon    = parseFloat(url.searchParams.get('lon') ?? '90.4');
  const profile = userId ? await getUser(userId, env) : null;
  const country = profile?.country ?? 'BD';
  const ctx = await getWeatherContext(lat, lon, country, env);
  return new Response(JSON.stringify(ctx), { headers: { 'Content-Type': 'application/json' }});
}
