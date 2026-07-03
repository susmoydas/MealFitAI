import { Env, UserProfile, Meal, WeatherContext } from '../types';
import { getUser, getMealsByCountry } from './db';
import { getTargetsForUser } from './nutritionTargets';

// ── Types ──────────────────────────────────────────────────────────────────

interface DayNutrition {
  date: string;
  totalCalories: number;
  hadHighProtein: boolean;
  hadHighFiber: boolean;
  hasData: boolean;
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

export interface ResolvedNutrition {
  name: string;
  calories: number;
  proteinLevel: 'High' | 'Medium' | 'Low';
  carbsLevel: 'High' | 'Medium' | 'Low';
  fiberLevel: 'High' | 'Medium' | 'Low';
  source: 'library' | 'usda' | 'open_food_facts' | 'ai_estimated';
}

// ── Nutrition Resolution Chain ──────────────────────────────────────────────

export async function getMealSuggestions(
  userId: string,
  profile: UserProfile,
  weather: WeatherContext,
  lat: number,
  lon: number,
  env: Env,
): Promise<{ primary: Meal; alternatives: Meal[]; weather: WeatherContext; healthTip: string }> {
  // Get meals available in user's country
  const meals = await getMealsByCountry(profile.country || 'BD', env);
  
  if (meals.length === 0) {
    // Fallback: get any meals
    const { results } = await env.DB.prepare('SELECT * FROM meals LIMIT 10').all();
    const fallbackMeals = results.map((row: any) => ({
      id: row.id,
      name: row.name,
      cuisine_origin: row.cuisine_origin || 'Global',
      meal_type: row.meal_type || 'lunch',
      protein_tag: row.protein_tag || 'mixed',
      season_tags: JSON.parse(row.season_tags || '[]'),
      availability_countries: JSON.parse(row.availability_countries || '[]'),
      ingredients: JSON.parse(row.ingredients_json || '[]'),
      replacements: [],
      recipe_text: row.recipe_text || '',
      video_query: row.video_query || '',
      video_id: row.video_id || '',
      protein_level: row.protein_level || 'Medium',
      carbs_level: row.carbs_level || 'Medium',
      fiber_level: row.fiber_level || 'Medium',
      fat_level: row.fat_level || 'Medium',
      calories: row.calories || 300,
      image_url: row.image_url || '',
    })) as Meal[];
    
    if (fallbackMeals.length === 0) {
      throw new Error('No meals available');
    }
    
    return {
      primary: fallbackMeals[0],
      alternatives: fallbackMeals.slice(1, 4),
      weather,
      healthTip: 'Try something new today!',
    };
  }

  // Score meals based on weather, preferences, and history
  const scored = meals.map(meal => {
    let score = 50;
    
    // Weather-based scoring
    if (weather.condition === 'heatwave' && meal.fiber_level === 'Low') score += 10;
    if (weather.condition === 'cold' && meal.protein_level === 'High') score += 10;
    if (weather.condition === 'monsoon' && meal.fiber_level === 'High') score += 5;
    
    // Diet preference scoring
    if (profile.diet_preference === 'vegetarian' && meal.protein_tag === 'vegetarian') score += 15;
    if (profile.diet_preference === 'vegan' && meal.protein_tag === 'vegetarian') score += 20;
    if (profile.diet_preference === 'non-vegetarian' && meal.protein_tag !== 'vegetarian') score += 10;
    
    // Health goal scoring
    if (profile.health_goal === 'muscle_gain' && meal.protein_level === 'High') score += 15;
    if (profile.health_goal === 'weight_loss' && (meal.calories || 300) < 400) score += 15;
    if (profile.health_goal === 'balanced') score += 5;
    
    // Add some randomness
    score += Math.random() * 10;
    
    return { meal, score };
  });

  scored.sort((a, b) => b.score - a.score);
  
  const primary = scored[0].meal;
  const alternatives = scored.slice(1, 4).map(s => s.meal);

  const healthTip = generateHealthTip(profile, weather);

  return {
    primary,
    alternatives,
    weather,
    healthTip,
  };
}

function generateHealthTip(profile: UserProfile, weather: WeatherContext): string {
  const tips: string[] = [];
  
  if (weather.condition === 'heatwave') {
    tips.push('Stay hydrated! Drink plenty of water today.');
  }
  if (weather.condition === 'cold') {
    tips.push('Warm soups and teas are great for cold weather.');
  }
  if (profile.health_goal === 'weight_loss') {
    tips.push('Focus on protein and fiber to stay full longer.');
  }
  if (profile.health_goal === 'muscle_gain') {
    tips.push('Include protein in every meal for muscle recovery.');
  }
  if (profile.activity_level === 'low') {
    tips.push('Even light activity like walking helps digestion.');
  }
  
  return tips.length > 0 ? tips[0] : 'A balanced meal keeps you energized throughout the day.';
}

// ── Nutrition Resolution Chain ──────────────────────────────────────────────

export async function resolveNutrition(
  dishName: string,
  ingredients: string,
  country: string,
  env: Env,
): Promise<ResolvedNutrition> {
  // Step 1: fuzzy match against local meals library
  const libraryMatch = await matchLibraryMeal(dishName, env);
  if (libraryMatch) {
    return {
      name: libraryMatch.name,
      calories: libraryMatch.calories || 300,
      proteinLevel: libraryMatch.protein_level || 'Medium',
      carbsLevel: libraryMatch.carbs_level || 'Medium',
      fiberLevel: libraryMatch.fiber_level || 'Medium',
      source: 'library',
    };
  }

  // Step 2: ingredient-level USDA lookup (stub — no USDA API integrated yet)
  if (ingredients) {
    const usdaResult = await resolveFromUSDA(ingredients, env);
    if (usdaResult) return { ...usdaResult, name: dishName, source: 'usda' };
  }

  // Step 3: Open Food Facts fallback (stub — no OFF API integrated yet)
  const offResult = await resolveFromOpenFoodFacts(dishName, env);
  if (offResult) return { ...offResult, name: dishName, source: 'open_food_facts' };

  // Step 4: AI estimation fallback — for regional/home-style dishes
  const aiResult = await estimateWithAI(dishName, ingredients, env);

  // Grow the library: upsert this resolved dish so future lookups hit Step 1
  await upsertMealToLibrary(aiResult, country, env);

  return { ...aiResult, source: 'ai_estimated' };
}

async function matchLibraryMeal(
  dishName: string,
  env: Env,
): Promise<{ name: string; calories: number; protein_level: string; carbs_level: string; fiber_level: string } | null> {
  try {
    const { results } = await env.DB.prepare(
      `SELECT name, calories, protein_level, carbs_level, fiber_level
       FROM meals WHERE name LIKE ? LIMIT 1`
    ).bind(`%${dishName}%`).all();
    return (results as any[])[0] || null;
  } catch {
    return null;
  }
}

// Stub: USDA FoodData Central integration (to be implemented when API key is available)
async function resolveFromUSDA(
  _ingredients: string,
  _env: Env,
): Promise<Omit<ResolvedNutrition, 'name' | 'source'> | null> {
  // TODO: Implement when USDA API key is configured
  // For each ingredient, query USDA FoodData Central search endpoint
  // Sum macro estimates, convert to High/Medium/Low using shared thresholds
  return null;
}

// Stub: Open Food Facts integration (to be implemented)
async function resolveFromOpenFoodFacts(
  _dishName: string,
  _env: Env,
): Promise<Omit<ResolvedNutrition, 'name' | 'source'> | null> {
  // TODO: Implement Open Food Facts search for packaged/branded items
  return null;
}

async function estimateWithAI(
  dishName: string,
  ingredients: string,
  env: Env,
): Promise<Omit<ResolvedNutrition, 'source'>> {
  const prompt =
    `You are a nutrition estimator. Given a dish name and optional ingredients, ` +
    `return ONLY a JSON object, no other text, in this exact shape: ` +
    `{"calories": number, "proteinLevel": "High"|"Medium"|"Low", "carbsLevel": "High"|"Medium"|"Low", "fiberLevel": "High"|"Medium"|"Low"}. ` +
    `Dish: "${dishName}". Ingredients: "${ingredients || 'not provided, infer from dish name'}". ` +
    `Base the estimate on a typical single serving. Be realistic — most home-cooked meals are 300-600 calories.`;

  try {
    const aiResponse = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
    });

    const rawText = (aiResponse as any)?.response || '';
    const parsed = JSON.parse(rawText.trim());

    // Validate the response shape
    const validLevels = ['High', 'Medium', 'Low'];
    const isValid =
      typeof parsed.calories === 'number' &&
      validLevels.includes(parsed.proteinLevel) &&
      validLevels.includes(parsed.carbsLevel) &&
      validLevels.includes(parsed.fiberLevel);

    if (isValid) {
      return {
        name: dishName,
        calories: Math.round(parsed.calories),
        proteinLevel: parsed.proteinLevel,
        carbsLevel: parsed.carbsLevel,
        fiberLevel: parsed.fiberLevel,
      };
    }
  } catch {
    // Model didn't return clean JSON — fall through to safe defaults
  }

  // Safe fallback so the user still gets editable pills
  return {
    name: dishName,
    calories: 350,
    proteinLevel: 'Medium',
    carbsLevel: 'Medium',
    fiberLevel: 'Medium',
  };
}

async function upsertMealToLibrary(
  resolved: { name: string; calories: number; proteinLevel: string; carbsLevel: string; fiberLevel: string },
  country: string,
  env: Env,
) {
  try {
    const id = `usergen-${Date.now()}`;
    await env.DB.prepare(
      `INSERT INTO meals (id, name, cuisine_origin, meal_type, protein_tag, season_tags,
                          availability_countries, ingredients_json, protein_level, carbs_level,
                          fiber_level, calories)
       VALUES (?, ?, 'user_submitted', 'lunch', 'mixed', '[]', ?, '[]', ?, ?, ?, ?)`
    ).bind(
      id, resolved.name, JSON.stringify([country]),
      resolved.proteinLevel, resolved.carbsLevel, resolved.fiberLevel, resolved.calories,
    ).run();
  } catch {
    // Non-critical — just means the library won't grow for this dish
  }
}

// ── Weekly Insight ──────────────────────────────────────────────────────────

export async function getWeeklyInsight(userId: string, env: Env): Promise<WeeklyInsight> {
  // Cache for 24h per user per day
  const today = new Date().toISOString().slice(0, 10);
  const cacheKey = `weekly_insight:${userId}:${today}`;
  const cached = await env.CACHE.get(cacheKey);
  if (cached) {
    try { return JSON.parse(cached); } catch { /* recompute */ }
  }

  const user = await getUser(userId, env);
  const targets = getTargetsForUser(user);

  // Fetch last 7 days of meal logs with nutrition data
  const { results } = await env.DB.prepare(
    `SELECT eaten_at, calories, protein_level, fiber_level
     FROM meal_logs
     WHERE user_id = ? AND eaten_at >= datetime('now', '-7 days')
     ORDER BY eaten_at ASC`
  ).bind(userId).all();

  // Group logs by calendar day
  const dayMap = new Map<string, DayNutrition>();
  for (const row of results as any[]) {
    const day = String(row.eaten_at || '').slice(0, 10);
    if (!day) continue;

    if (!dayMap.has(day)) {
      dayMap.set(day, {
        date: day,
        totalCalories: 0,
        hadHighProtein: false,
        hadHighFiber: false,
        hasData: false,
      });
    }
    const d = dayMap.get(day)!;

    // Only count rows that actually have nutrition data (NULL = old log, skip)
    if (row.calories != null) {
      d.totalCalories += Number(row.calories);
      d.hasData = true;
    }
    if (row.protein_level === 'High') d.hadHighProtein = true;
    if (row.fiber_level === 'High' || row.fiber_level === 'Medium') d.hadHighFiber = true;
  }

  const days = Array.from(dayMap.values()).filter(d => d.hasData);

  // Not enough data yet
  if (days.length < 3) {
    const result: WeeklyInsight = {
      hasGap: false,
      nutrient: null,
      daysUnderTarget: 0,
      totalLoggedDays: days.length,
      message: days.length === 0
        ? 'No meals logged yet this week. Start scanning or logging meals to see your nutrition insights.'
        : `Log ${3 - days.length} more meal${3 - days.length > 1 ? 's' : ''} this week and we'll show you a nutrition summary.`,
    };
    await env.CACHE.put(cacheKey, JSON.stringify(result), { expirationTtl: 86400 });
    return result;
  }

  // Calculate gaps: how many days missed each target
  const fiberGapDays = days.filter(d => !d.hadHighFiber).length;
  const proteinGapDays = days.filter(d => !d.hadHighProtein).length;
  const calorieGapDays = days.filter(d => d.totalCalories < targets.calories * 0.7).length;

  // Rank gaps by severity (most days affected first), require at least 3 days
  const gaps = [
    { nutrient: 'fiber' as const, count: fiberGapDays },
    { nutrient: 'protein' as const, count: proteinGapDays },
    { nutrient: 'calories' as const, count: calorieGapDays },
  ]
    .filter(g => g.count >= 3)
    .sort((a, b) => b.count - a.count);

  let result: WeeklyInsight;

  if (gaps.length === 0) {
    result = {
      hasGap: false,
      nutrient: null,
      daysUnderTarget: 0,
      totalLoggedDays: days.length,
      message: 'Your nutrition balance looks good this week. Keep it up!',
    };
  } else {
    const top = gaps[0];
    const suggestion = await findSuggestionMeal(top.nutrient, user?.country || 'Global', env);

    const messages: Record<string, string> = {
      fiber: `Your fiber intake has been low ${top.count} of the last ${days.length} days. Try adding ${suggestion?.name || 'a fruit or vegetable side'} to your next meal.`,
      protein: `Your protein intake has been low ${top.count} of the last ${days.length} days. Try adding ${suggestion?.name || 'a protein-rich food'} to your next meal.`,
      calories: `You've logged fewer calories than usual on ${top.count} of the last ${days.length} days. Make sure you're eating enough to fuel your day.`,
    };

    result = {
      hasGap: true,
      nutrient: top.nutrient,
      daysUnderTarget: top.count,
      totalLoggedDays: days.length,
      message: messages[top.nutrient],
      suggestedMealId: suggestion?.id,
      suggestedMealName: suggestion?.name,
    };
  }

  await env.CACHE.put(cacheKey, JSON.stringify(result), { expirationTtl: 86400 });
  return result;
}

// Find one real, country-available meal high in the given nutrient
async function findSuggestionMeal(
  nutrient: 'fiber' | 'protein' | 'calories',
  country: string,
  env: Env,
): Promise<{ id: string; name: string } | null> {
  const column = nutrient === 'fiber' ? 'fiber_level'
    : nutrient === 'protein' ? 'protein_level'
    : null;

  if (!column) return null;

  try {
    const { results } = await env.DB.prepare(
      `SELECT id, name FROM meals WHERE ${column} = 'High' AND availability_countries LIKE ? LIMIT 1`
    ).bind(`%${country}%`).all();
    return (results as any[])[0] || null;
  } catch {
    return null;
  }
}
