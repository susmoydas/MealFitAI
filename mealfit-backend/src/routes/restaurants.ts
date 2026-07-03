import { Env } from '../types';
import { findNearbyRestaurants } from '../services/places';

export async function handleNearbyRestaurants(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const lat = parseFloat(url.searchParams.get('lat') ?? '');
  const lon = parseFloat(url.searchParams.get('lon') ?? '');
  const mealName = url.searchParams.get('meal') ?? '';
  const cuisine = url.searchParams.get('cuisine') ?? '';

  if (isNaN(lat) || isNaN(lon)) {
    return err('lat and lon are required', 400);
  }
  if (!mealName) {
    return err('meal is required', 400);
  }

  const restaurants = await findNearbyRestaurants(lat, lon, mealName, cuisine, env);
  return json(restaurants);
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json' }
  });
}
function err(msg: string, status = 400) {
  return json({ error: msg }, status);
}
