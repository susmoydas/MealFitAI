import { Env } from '../types';
import { getWeeklyInsight } from '../services/engine';

export async function handleWeeklyInsight(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const userId = url.searchParams.get('userId');
  if (!userId) {
    return new Response(JSON.stringify({ error: 'userId required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const insight = await getWeeklyInsight(userId, env);
    return new Response(JSON.stringify(insight), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[Insights] Failed to compute weekly insight:', error);
    return new Response(JSON.stringify({
      hasGap: false,
      nutrient: null,
      daysUnderTarget: 0,
      totalLoggedDays: 0,
      message: 'Unable to load nutrition insights right now.',
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
