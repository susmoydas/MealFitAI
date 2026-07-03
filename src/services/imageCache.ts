import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = 'img_cache_';
const META_KEY = 'img_cache_meta';

interface CacheMeta {
  [url: string]: { cachedAt: number; ttl: number };
}

const DEFAULT_TTL = 7 * 24 * 60 * 60 * 1000;

async function getMeta(): Promise<CacheMeta> {
  try {
    const raw = await AsyncStorage.getItem(META_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

async function saveMeta(meta: CacheMeta) {
  try {
    await AsyncStorage.setItem(META_KEY, JSON.stringify(meta));
  } catch {}
}

export async function cacheImageData(url: string, data: string, ttl?: number) {
  try {
    const key = CACHE_PREFIX + btoa(url).slice(0, 60);
    await AsyncStorage.setItem(key, data);
    const meta = await getMeta();
    meta[url] = { cachedAt: Date.now(), ttl: ttl ?? DEFAULT_TTL };
    await saveMeta(meta);
  } catch {}
}

export async function getCachedImageData(url: string): Promise<string | null> {
  try {
    const meta = await getMeta();
    const entry = meta[url];
    if (!entry) return null;
    if (Date.now() - entry.cachedAt > entry.ttl) {
      const key = CACHE_PREFIX + btoa(url).slice(0, 60);
      await AsyncStorage.removeItem(key);
      delete meta[url];
      await saveMeta(meta);
      return null;
    }
    const key = CACHE_PREFIX + btoa(url).slice(0, 60);
    return await AsyncStorage.getItem(key);
  } catch {
    return null;
  }
}

export async function clearImageCache() {
  try {
    const meta = await getMeta();
    const keys = Object.keys(meta).map(url => CACHE_PREFIX + btoa(url).slice(0, 60));
    await AsyncStorage.multiRemove([META_KEY, ...keys]);
  } catch {}
}

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&h=1200&fit=crop',
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1200&h=1200&fit=crop',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&h=1200&fit=crop',
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&h=1200&fit=crop',
  'https://images.unsplash.com/photo-1546069901-d5bf1962c3b1?w=1200&h=1200&fit=crop',
];

const FOOD_QUERIES = [
  'food+cooking+plating',
  'food+meal+prep',
  'food+top+view',
  'food+dish+restaurant',
  'food+healthy+bowl',
  'ingredients+cooking',
];

export function generateAdditionalImages(imageUrl?: string, mealName?: string): string[] {
  const imgs: string[] = [];
  if (imageUrl && !FALLBACK_IMAGES.includes(imageUrl)) {
    imgs.push(imageUrl);
  }

  const seed = mealName
    ? mealName.toLowerCase().replace(/[^a-z0-9]/g, '+')
    : 'food';

  const extra = FOOD_QUERIES.map(q =>
    `https://source.unsplash.com/400x400/?${q}&${seed}`
  );

  const combined = [...imgs, ...extra, ...FALLBACK_IMAGES];
  const seen = new Set<string>();
  return combined.filter(u => {
    if (seen.has(u)) return false;
    seen.add(u);
    return true;
  }).slice(0, 5);
}
