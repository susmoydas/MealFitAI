import { Env } from './types';
import { handleRecommend, handleSearch } from './routes/meals';
import { handleLogMeal, handleRecentHistory } from './routes/history';
import { handleWeather } from './routes/weather';
import { handleSetup, handleGetProfile, handleUpdateProfile } from './routes/user';
import { handleIdentify } from './routes/scanner';
import { handleCheckNotifications } from './routes/notifications';
import { handleNearbyRestaurants } from './routes/restaurants';
import { handleWeeklyInsight } from './routes/insights';
import { handleResolveNutrition } from './routes/nutrition';
import { handleSignup, handleLogin, handleMe } from './routes/auth';
import { withCors, handleOptions } from './middleware/cors';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url    = new URL(request.url);
    const path   = url.pathname;
    const method = request.method;

    if (method === 'OPTIONS') return handleOptions();

    let response: Response;

    try {
      if (path === '/api/auth/signup' && method === 'POST')
        response = await handleSignup(request, env);
      else if (path === '/api/auth/login' && method === 'POST')
        response = await handleLogin(request, env);
      else if (path === '/api/auth/me' && method === 'GET')
        response = await handleMe(request, env);
      else if (path === '/api/meals/recommend' && method === 'GET')
        response = await handleRecommend(request, env);
      else if (path === '/api/meals/search'  && method === 'GET')
        response = await handleSearch(request, env);
      else if (path === '/api/history/log'   && method === 'POST')
        response = await handleLogMeal(request, env);
      else if (path === '/api/history/recent' && method === 'GET')
        response = await handleRecentHistory(request, env);
      else if (path === '/api/weather'        && method === 'GET')
        response = await handleWeather(request, env);
      else if (path === '/api/user/setup'     && method === 'POST')
        response = await handleSetup(request, env);
      else if (path === '/api/user/profile'   && method === 'GET')
        response = await handleGetProfile(request, env);
      else if (path === '/api/scanner/identify' && method === 'POST')
        response = await handleIdentify(request, env);
      else if (path === '/api/notifications/check' && method === 'POST')
        response = await handleCheckNotifications(request, env);
      else if (path === '/api/restaurants/nearby' && method === 'GET')
        response = await handleNearbyRestaurants(request, env);
      else if (path === '/api/user/profile'   && method === 'PUT')
        response = await handleUpdateProfile(request, env);
      else if (path === '/api/insights/weekly' && method === 'GET')
        response = await handleWeeklyInsight(request, env);
      else if (path === '/api/nutrition/resolve' && method === 'POST')
        response = await handleResolveNutrition(request, env);
      else
        response = new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
    } catch (e: any) {
      response = new Response(
        JSON.stringify({ error: 'Internal error', detail: e?.message }),
        { status: 500 }
      );
    }

    return withCors(response);
  }
};
