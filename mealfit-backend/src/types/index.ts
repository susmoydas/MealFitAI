export type NutritionLevel = 'High' | 'Medium' | 'Low';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type WeatherCondition = 'heatwave' | 'cold' | 'rain' | 'stable';
export type Season = 'spring' | 'summer' | 'autumn' | 'winter' | 'monsoon';

export interface Ingredient {
  name: string;
  amount: string;
  available_locally: boolean;
}

export interface Replacement {
  if_missing: string;
  replace_with: string[];
  why: string;
}

export interface Meal {
  id: string;
  name: string;
  cuisine_origin: string;
  meal_type: MealType;
  protein_tag: string;
  season_tags: string[];
  availability_countries: string[];
  ingredients: Ingredient[];
  replacements: Replacement[];
  recipe_text: string;
  video_query: string;
  video_id?: string;
  protein_level: NutritionLevel;
  carbs_level: NutritionLevel;
  fiber_level: NutritionLevel;
  fat_level?: NutritionLevel;
  calories?: number;
  image_url: string;
  reason?: string;
}

export interface MealLog {
  id: string;
  user_id: string;
  meal_id: string;
  meal_name?: string;
  meal_type: MealType;
  protein_tag: string;
  eaten_at: string;
  source: 'primary' | 'alternative' | 'scanner' | 'manual';
}

export interface UserProfile {
  id: string;
  name?: string;
  country: string;
  diet_preference: string;
  allergies: string[];
  activity_level: string;
  health_goal: string;
  units: 'metric' | 'imperial';
}

export interface WeatherContext {
  condition: WeatherCondition;
  temp_c: number;
  humidity: number;
  season: Season;
  hydration_target_ml: number;
}

export interface Restaurant {
  id: string;
  name: string;
  image_url: string;
  rating: number;
  reviews: number;
  distance_km: number;
  travel_time_min: number;
  travel_walking_min?: number;
  travel_cycling_min?: number;
  cuisine: string;
  address: string;
  open_now: boolean;
  opening_hours: string;
  price_level: number;
  place_id: string;
  phone?: string;
  website?: string;
  lat: number;
  lon: number;
}

export interface RecommendationResponse {
  primary: Meal;
  alternatives: Meal[];
  weather: WeatherContext;
  healthTip?: string;
  fruitRecommendation?: string;
  juiceRecommendation?: string;
  hydrationAdvice?: string;
  restaurants?: Restaurant[];
}

export interface AiSuggestion {
  reason: string;
  healthTip: string;
  alternativeReason: string;
}

export interface Env {
  DB: D1Database;
  CACHE: KVNamespace;
  AI: {
    run: (model: string, options: Record<string, unknown>) => Promise<Record<string, unknown>>;
  };
  OPENWEATHER_API_KEY: string;
  YOUTUBE_API_KEY: string;
  GOOGLE_PLACES_API_KEY: string;
}
