import { Env, Meal, MealLog, UserProfile, Replacement } from '../types';

// ── User ──────────────────────────────────────────────────────────────────
export async function getUser(userId: string, env: Env): Promise<UserProfile | null> {
  const row = await env.DB.prepare(
    `SELECT id, name, country, diet_preference, allergies, activity_level, health_goal, units
     FROM users WHERE id = ?`
  ).bind(userId).first<any>();
  if (!row) return null;
  return { ...row, allergies: JSON.parse(row.allergies || '[]') };
}

export async function upsertUser(profile: UserProfile, env: Env): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO users (id, name, country, diet_preference, allergies, activity_level, health_goal, units)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       name=excluded.name, country=excluded.country, diet_preference=excluded.diet_preference,
       allergies=excluded.allergies, activity_level=excluded.activity_level,
       health_goal=excluded.health_goal, units=excluded.units`
  ).bind(
    profile.id, profile.name ?? null, profile.country, profile.diet_preference,
    JSON.stringify(profile.allergies), profile.activity_level,
    profile.health_goal, profile.units
  ).run();
}

// ── Meal logs ─────────────────────────────────────────────────────────────
export async function getRecentLogs(userId: string, hours: number, env: Env): Promise<MealLog[]> {
  const since = new Date(Date.now() - hours * 3600 * 1000).toISOString();
  const { results } = await env.DB.prepare(
    `SELECT id, user_id, meal_id, meal_name, meal_type, protein_tag, eaten_at, source,
            calories, protein_level, carbs_level, fiber_level
     FROM meal_logs WHERE user_id = ? AND eaten_at >= ?
     ORDER BY eaten_at DESC LIMIT 50`
  ).bind(userId, since).all<MealLog>();
  return results;
}

export async function logMeal(log: {
  id: string; user_id: string; meal_id: string; meal_name?: string;
  meal_type: string; protein_tag: string; eaten_at?: string; source: string;
  calories?: number; protein_level?: string; carbs_level?: string; fiber_level?: string;
}, env: Env): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO meal_logs (id, user_id, meal_id, meal_name, meal_type, protein_tag, eaten_at, source, calories, protein_level, carbs_level, fiber_level)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    log.id, log.user_id, log.meal_id, log.meal_name ?? null, log.meal_type,
    log.protein_tag, log.eaten_at ?? new Date().toISOString(), log.source,
    log.calories ?? null, log.protein_level ?? null, log.carbs_level ?? null, log.fiber_level ?? null
  ).run();
}

// ── Meals ─────────────────────────────────────────────────────────────────
export async function getMealsByCountry(country: string, env: Env): Promise<Meal[]> {
  const { results } = await env.DB.prepare(
    `SELECT * FROM meals WHERE availability_countries LIKE ?`
  ).bind(`%"${country}"%`).all<any>();
  return results.map(parseMealRow);
}

export async function searchMeals(query: string, country: string, env: Env): Promise<Meal[]> {
  const q = `%${query}%`;
  const { results } = await env.DB.prepare(
    `SELECT * FROM meals
     WHERE availability_countries LIKE ?
     AND (name LIKE ? OR cuisine_origin LIKE ? OR season_tags LIKE ?)`,
  ).bind(`%"${country}"%`, q, q, q).all<any>();
  return results.map(parseMealRow);
}

export async function getMealById(id: string, env: Env): Promise<Meal | null> {
  const row = await env.DB.prepare(`SELECT * FROM meals WHERE id = ?`).bind(id).first<any>();
  return row ? parseMealRow(row) : null;
}

// ── Ingredient substitutes ────────────────────────────────────────────────
export async function getSubstitutes(ingredient: string, country: string, env: Env)
  : Promise<Replacement | null> {
  const row = await env.DB.prepare(
    `SELECT substitutes_json, why_substitute FROM ingredient_replacements
     WHERE ingredient_name = ? AND country = ? AND available = 0`
  ).bind(ingredient, country).first<any>();
  if (!row) return null;
  return {
    if_missing: ingredient,
    replace_with: JSON.parse(row.substitutes_json || '[]'),
    why: row.why_substitute,
  };
}

// ── Row parser ────────────────────────────────────────────────────────────
function parseMealRow(row: any): Meal {
  return {
    id: row.id,
    name: row.name,
    cuisine_origin: row.cuisine_origin,
    meal_type: row.meal_type,
    protein_tag: row.protein_tag,
    season_tags: JSON.parse(row.season_tags || '[]'),
    availability_countries: JSON.parse(row.availability_countries || '[]'),
    ingredients: JSON.parse(row.ingredients_json || '[]'),
    replacements: [],
    recipe_text: row.recipe_text,
    video_query: row.video_query,
    video_id: row.video_id,
    protein_level: row.protein_level,
    carbs_level: row.carbs_level,
    fiber_level: row.fiber_level,
    fat_level: row.fat_level,
    calories: row.calories,
    image_url: row.image_url,
  };
}
