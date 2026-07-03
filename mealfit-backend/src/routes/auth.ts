import { Env } from '../types';

const JWT_SECRET = 'mealfit-jwt-secret-2024';

function base64url(data: string): string {
  return btoa(data).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlDecode(data: string): string {
  let base64 = data.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) base64 += '=';
  return atob(base64);
}

async function hmacSign(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return base64url(String.fromCharCode(...new Uint8Array(signature)));
}

async function hmacVerify(data: string, signature: string, secret: string): Promise<boolean> {
  const expected = await hmacSign(data, secret);
  return expected === signature;
}

export async function createToken(userId: string, email: string): Promise<string> {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64url(JSON.stringify({
    sub: userId,
    email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days
  }));
  const signature = await hmacSign(`${header}.${payload}`, JWT_SECRET);
  return `${header}.${payload}.${signature}`;
}

export async function verifyToken(token: string): Promise<{ userId: string; email: string } | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, payload, signature] = parts;
    const valid = await hmacVerify(`${header}.${payload}`, signature, JWT_SECRET);
    if (!valid) return null;
    const data = JSON.parse(base64urlDecode(payload));
    if (data.exp < Math.floor(Date.now() / 1000)) return null;
    return { userId: data.sub, email: data.email };
  } catch {
    return null;
  }
}

export async function handleSignup(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json();
    const { email, name } = body;

    if (!email) {
      return json({ error: 'Email required' }, 400);
    }

    const userId = crypto.randomUUID();

    // Insert user (lead capture — every submission creates a new record)
    await env.DB.prepare(
      'INSERT INTO users (id, name, country, diet_preference, allergies, activity_level, health_goal, units) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(userId, name || '', 'BD', 'omnivore', '[]', 'medium', 'balanced', 'metric').run();

    // Insert auth record (no password for lead capture)
    await env.DB.prepare(
      'INSERT INTO auth (user_id, email, password_hash) VALUES (?, ?, ?)'
    ).bind(userId, email, '').run();

    const token = await createToken(userId, email);

    return json({ ok: true, token, userId, email, name: name || '' });
  } catch (e: any) {
    return json({ error: e?.message || 'Signup failed' }, 500);
  }
}

export async function handleLogin(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return json({ error: 'Email required' }, 400);
    }

    // Lead capture: each submission creates a fresh record
    const userId = crypto.randomUUID();

    await env.DB.prepare(
      'INSERT INTO users (id, name, country, diet_preference, allergies, activity_level, health_goal, units) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(userId, '', 'BD', 'omnivore', '[]', 'medium', 'balanced', 'metric').run();

    await env.DB.prepare(
      'INSERT INTO auth (user_id, email, password_hash) VALUES (?, ?, ?)'
    ).bind(userId, email, '').run();

    const token = await createToken(userId, email);

    return json({ ok: true, token, userId, email, name: '' });
  } catch (e: any) {
    return json({ error: e?.message || 'Login failed' }, 500);
  }
}

export async function handleMe(request: Request, env: Env): Promise<Response> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return json({ error: 'Not authenticated' }, 401);
  }

  const payload = await verifyToken(authHeader.slice(7));
  if (!payload) {
    return json({ error: 'Invalid token' }, 401);
  }

  const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?')
    .bind(payload.userId).first<any>();

  if (!user) {
    return json({ error: 'User not found' }, 404);
  }

  return json({
    userId: user.id,
    email: payload.email,
    name: user.name,
    country: user.country,
    diet_preference: user.diet_preference,
    allergies: JSON.parse(user.allergies || '[]'),
    activity_level: user.activity_level,
    health_goal: user.health_goal,
    units: user.units,
  });
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json' },
  });
}
