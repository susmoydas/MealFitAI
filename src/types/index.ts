export type NutritionLevel = 'High' | 'Medium' | 'Low';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type WeatherCondition = 'heatwave' | 'cold' | 'rain' | 'stable' | 'monsoon';
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
  protein_level: NutritionLevel;
  carbs_level: NutritionLevel;
  fiber_level: NutritionLevel;
  fat_level: NutritionLevel;
  sugar_level: NutritionLevel;
  calories: number;
  prep_time: string;
  image_url: string;
  images?: string[];
  video_id?: string;
  reason?: string;
  seasonal_benefit?: string;
}

export interface WeatherContext {
  condition: WeatherCondition;
  temp_c: number;
  humidity: number;
  season: Season;
  hydration_target_ml: number;
  daily_steps?: number;
  step_goal?: number;
  activity_level?: string;
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

export interface SeasonalPick {
  name: string;
  image_url: string;
  benefit: string;
  season: Season;
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
  seasonalPicks?: SeasonalPick[];
}

export interface UserProfile {
  id: string;
  country: string;
  diet_preference: string;
  allergies: string[];
  activity_level: string;
  health_goal: string;
  units: 'metric' | 'imperial';
  name?: string;
  email?: string;
  age?: number;
}

export interface MealLog {
  id: string;
  user_id: string;
  meal_id: string;
  meal_name: string;
  meal_type: MealType;
  protein_tag: string;
  eaten_at: string;
  source: 'primary' | 'alternative' | 'scanner' | 'manual';
  calories?: number;
  protein_level?: NutritionLevel;
  carbs_level?: NutritionLevel;
  fiber_level?: NutritionLevel;
}

export interface DetectedFood {
  name: string;
  confidence: number;
  calories: number;
  protein_level: NutritionLevel;
  carbs_level: NutritionLevel;
  fat_level: NutritionLevel;
  fiber_level: NutritionLevel;
  serving_size?: string;
  food_category?: string;
  guidance?: string;
}

export interface WeeklyInsight {
  hasGap: boolean;
  nutrient: 'protein' | 'fiber' | 'calories' | null;
  daysUnderTarget: number;
  totalLoggedDays: number;
  message: string;
  suggestedMealId?: string;
  suggestedMealName?: string;
}

export interface FoodItem {
  name: string;
  confidence: number;
  portion: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sugar_g: number;
  sodium_mg: number;
}

export interface FoodRecognitionResult {
  foods: FoodItem[];
  totalNutrition: {
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    fiber_g: number;
    sugar_g: number;
    sodium_mg: number;
  };
}

export interface ScanResult {
  name: string;
  protein_level: NutritionLevel;
  carbs_level: NutritionLevel;
  fiber_level: NutritionLevel;
  fat_level?: NutritionLevel;
  sugar_level?: NutritionLevel;
  calories?: number;
  confidence?: number;
  guidance: string;
  meal_id?: string;
  similar_foods?: string[];
  serving_size?: string;
  food_category?: string;
  multiple_foods?: DetectedFood[];
  foods?: FoodItem[];
  total_nutrition?: FoodRecognitionResult['totalNutrition'];
}
