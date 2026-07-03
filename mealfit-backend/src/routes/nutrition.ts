import { Env } from '../types';
import { resolveNutrition } from '../services/engine';

export async function handleResolveNutrition(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json() as { dishName?: string; ingredients?: string; country?: string };
    const dishName = body.dishName?.trim();
    if (!dishName) {
      return new Response(JSON.stringify({ error: 'dishName is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const country = body.country || 'Global';
    const ingredients = body.ingredients?.trim() || '';

    const result = await resolveNutrition(dishName, ingredients, country, env);
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[Nutrition] Resolve failed:', error);
    return new Response(JSON.stringify({ error: 'Failed to resolve nutrition' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
