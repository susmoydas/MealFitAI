import { WeatherContext, WeatherCondition, Season, Env } from '../types';
import { cacheGet, cacheSet, TTL } from './cache';

// Country-to-hemisphere map (add more as needed)
const SOUTHERN: Record<string, boolean> = {
  AU: true, NZ: true, AR: true, BR: true, ZA: true, CL: true,
};

// Country-specific season overrides (monsoon regions)
const MONSOON_COUNTRIES = ['BD','IN','PK','LK','MM','TH','VN'];

export function deriveSeason(country: string, date: Date): Season {
  const month = date.getMonth(); // 0-11
  if (MONSOON_COUNTRIES.includes(country)) {
    if (month >= 5 && month <= 9) return 'monsoon';
    if (month >= 10 || month <= 1) return 'winter';
    return 'summer';
  }
  const southern = SOUTHERN[country] ?? false;
  const adjusted = southern ? (month + 6) % 12 : month;
  if (adjusted <= 1 || adjusted === 11) return 'winter';
  if (adjusted <= 4)  return 'spring';
  if (adjusted <= 7)  return 'summer';
  return 'autumn';
}

export function detectCondition(tempC: number, humidity: number,
  prevTempC: number | null, weatherMain: string): WeatherCondition {
  const isRain = ['Rain','Drizzle','Thunderstorm'].includes(weatherMain);
  const swing = prevTempC !== null ? Math.abs(tempC - prevTempC) : 0;
  if (tempC > 32 || swing >= 10) return 'heatwave';
  if (tempC < 15) return 'cold';
  if (isRain || humidity > 80) return 'rain';
  return 'stable';
}

export function calcHydration(condition: WeatherCondition, activity: string): number {
  const base = activity === 'high' ? 3000 : 2000;
  if (condition === 'heatwave') return base + 500;
  if (condition === 'rain' || condition === 'cold') return base - 200;
  return base;
}

export async function getWeatherContext(
  lat: number, lon: number,
  country: string, env: Env
): Promise<WeatherContext> {
  const cacheKey = `weather:${lat.toFixed(2)}:${lon.toFixed(2)}`;
  const cached = await cacheGet<WeatherContext>(cacheKey, env);
  if (cached) return cached;

  const url = `https://api.openweathermap.org/data/2.5/weather` +
    `?lat=${lat}&lon=${lon}&appid=${env.OPENWEATHER_API_KEY}&units=metric`;
  const res = await fetch(url);
  if (!res.ok) {
    // Graceful fallback — stable weather, no hydration boost
    return { condition:'stable', temp_c:22, humidity:55, season:deriveSeason(country, new Date()), hydration_target_ml:2000 };
  }
  const data: any = await res.json();
  const tempC = data.main.temp as number;
  const humidity = data.main.humidity as number;
  const weatherMain = data.weather[0].main as string;
  const condition = detectCondition(tempC, humidity, null, weatherMain);
  const season = deriveSeason(country, new Date());
  const ctx: WeatherContext = {
    condition, temp_c: tempC, humidity, season,
    hydration_target_ml: calcHydration(condition, 'medium'),
  };
  await cacheSet(cacheKey, ctx, TTL.WEATHER, env);
  return ctx;
}
