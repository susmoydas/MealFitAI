import { Env, UserProfile } from '../types';
import { getUser, upsertUser } from '../services/db';

export async function handleSetup(request: Request, env: Env): Promise<Response> {
  const body = await request.json() as UserProfile;
  if (!body.id || !body.country) return err('id and country required', 400);
  const profile: UserProfile = {
    id:               body.id,
    country:          body.country ?? 'BD',
    diet_preference:  body.diet_preference ?? 'omnivore',
    allergies:        body.allergies ?? [],
    activity_level:   body.activity_level ?? 'medium',
    health_goal:      body.health_goal ?? 'balanced',
    units:            body.units ?? 'metric',
  };
  await upsertUser(profile, env);
  return new Response(JSON.stringify({ ok: true }), { headers: {'Content-Type':'application/json'}});
}

export async function handleGetProfile(request: Request, env: Env): Promise<Response> {
  const url    = new URL(request.url);
  const userId = url.searchParams.get('userId');
  if (!userId) return err('userId required', 400);
  const user = await getUser(userId, env);
  if (!user) return err('Not found', 404);
  return new Response(JSON.stringify(user), { headers: {'Content-Type':'application/json'}});
}

export async function handleUpdateProfile(request: Request, env: Env): Promise<Response> {
  const body = await request.json() as UserProfile;
  if (!body.id) return err('id required', 400);
  await upsertUser(body, env);
  return new Response(JSON.stringify({ ok: true }), { headers: {'Content-Type':'application/json'}});
}

function err(msg: string, status = 400) {
  return new Response(JSON.stringify({ error: msg }), {
    status, headers: {'Content-Type':'application/json'}
  });
}
