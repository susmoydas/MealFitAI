import { Env, MealLog } from '../types';
import { logMeal, getRecentLogs } from '../services/db';
import { cacheDel } from '../services/cache';

export async function handleLogMeal(request: Request, env: Env): Promise<Response> {
  const body = await request.json() as any;
  const { user_id, meal_id, meal_name, meal_type, protein_tag, source,
          calories, protein_level, carbs_level, fiber_level } = body;
  if (!user_id || !meal_id) return err('user_id and meal_id required', 400);

  // Require nutrition snapshot fields for new logs
  if (calories == null || !protein_level || !carbs_level || !fiber_level) {
    return err('calories, protein_level, carbs_level, fiber_level are required', 400);
  }

  await logMeal({
    id: crypto.randomUUID(), user_id, meal_id, meal_name,
    meal_type: meal_type ?? 'lunch',
    protein_tag: protein_tag ?? 'other',
    source: source ?? 'primary',
    calories, protein_level, carbs_level, fiber_level,
  }, env);

  // Bust recommendation cache so next call reflects updated history
  await cacheDel(`rec:${user_id}`, env);

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function handleRecentHistory(request: Request, env: Env): Promise<Response> {
  const url    = new URL(request.url);
  const userId = url.searchParams.get('userId');
  const hours  = parseInt(url.searchParams.get('hours') ?? '72', 10);
  if (!userId) return err('userId required', 400);
  const logs = await getRecentLogs(userId, hours, env);
  return new Response(JSON.stringify(logs), { headers: { 'Content-Type': 'application/json' }});
}

function err(msg: string, status = 400) {
  return new Response(JSON.stringify({ error: msg }), {
    status, headers: { 'Content-Type': 'application/json' }
  });
}
