import { Env } from '../types';

export interface ScanResult {
  success: boolean;
  foods: DetectedFood[];
}

export interface DetectedFood {
  id: string;
  name: string;
  category: string;
  confidence: number;
  serving: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar_level?: string;
  healthScore: number;
  guidance: string;
  image: string;
}

const AI_PROMPT = `Identify this food. Return ONLY valid JSON with this exact structure:
{
  "success": true,
  "foods": [
    {
      "id": "food_1",
      "name": "Grilled Chicken",
      "category": "Meat",
      "confidence": 0.92,
      "serving": "150g",
      "calories": 250,
      "protein": 35,
      "carbs": 0,
      "fat": 12,
      "fiber": 0,
      "healthScore": 85,
      "guidance": "Good protein source. Consider adding vegetables for fiber.",
      "image": ""
    }
  ]
}

Rules:
- confidence: 0.0 to 1.0
- All numeric fields required
- guidance: One sentence with a practical nutrition tip based on the identified food
- No markdown, no extra text, only JSON`;

const GEMINI_PROMPT = `You are a food recognition AI. Analyze this food image and return ONLY valid JSON with this exact structure:
{
  "success": true,
  "foods": [
    {
      "id": "food_1",
      "name": "Grilled Chicken",
      "category": "Meat",
      "confidence": 0.92,
      "serving": "150g",
      "calories": 250,
      "protein": 35,
      "carbs": 0,
      "fat": 12,
      "fiber": 0,
      "healthScore": 85,
      "guidance": "Good protein source. Consider adding vegetables for fiber.",
      "image": ""
    }
  ]
}
Rules:
- confidence: 0.0 to 1.0
- All numeric fields required
- guidance: One sentence with a practical nutrition tip
- Return ONLY the JSON, no markdown`;

const MAX_RETRIES = 3;

export async function handleIdentify(request: Request, env: Env): Promise<Response> {
  const start = Date.now();
  let userId = 'anonymous';

  try {
    const body = await request.json();
    const { imageBase64, userId: uid } = body;
    userId = uid || 'anonymous';

    if (!imageBase64) {
      return json({ success: false, error: 'imageBase64 is required', code: 'MISSING_IMAGE' }, 400);
    }

    console.log(`[Scanner] Starting AI detection for user: ${userId}`);

    let result: ScanResult | null = null;
    let provider = 'cloudflare';

    // Provider 1: Cloudflare Workers AI (free, built-in)
    if (!result) {
      try {
        result = await tryCloudflareAI(imageBase64, env);
        provider = 'cloudflare';
      } catch (e: any) {
        console.log(`[Scanner] Cloudflare AI failed: ${e.message}`);
      }
    }

    // Provider 1b: alternative Cloudflare model
    if (!result) {
      try {
        result = await tryCloudflareAI2(imageBase64, env);
        provider = 'cloudflare-alt';
      } catch (e: any) {
        console.log(`[Scanner] Cloudflare AI alternative failed: ${e.message}`);
      }
    }

    // Provider 2: Gemini API (free, 1500/day)
    if (!result) {
      try {
        result = await tryGemini(imageBase64, env);
        provider = 'gemini';
      } catch (e: any) {
        console.log(`[Scanner] Gemini failed: ${e.message}`);
      }
    }

    // Provider 3: Fallback result
    if (!result) {
      result = getFallbackResult();
      provider = 'fallback';
    }

    const enrichedFoods = enrichFoods(result.foods);

    console.log(`[Scanner] Success via ${provider}: ${enrichedFoods.length} foods detected in ${Date.now() - start}ms`);
    return json({
      success: true,
      foods: enrichedFoods,
      provider,
      processingTime: Date.now() - start,
    }, 200);

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Scanner] Detection failed for user ${userId}:`, errorMsg);

    const fallback = getFallbackResult();
    return json({
      ...fallback,
      provider: 'fallback',
      processingTime: Date.now() - start,
    }, 200);
  }
}

async function tryCloudflareAI(imageBase64: string, env: Env): Promise<ScanResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const result = await env.AI.run('@cf/meta/llama-3.2-11b-vision-instruct', {
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: AI_PROMPT },
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
        ],
      }],
      max_tokens: 800,
    });

    const rawText = (result as any)?.response || '';
    if (!rawText) throw new Error('Empty AI response');

    const parsed = parseAndValidate(rawText);
    return { success: true, foods: parsed.foods };
  } finally {
    clearTimeout(timeout);
  }
}

async function tryCloudflareAI2(imageBase64: string, env: Env): Promise<ScanResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const result = await env.AI.run('@cf/meta/llama-3.2-90b-vision-instruct', {
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: AI_PROMPT },
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
        ],
      }],
      max_tokens: 800,
    });

    const rawText = (result as any)?.response || '';
    if (!rawText) throw new Error('Empty AI response');

    const parsed = parseAndValidate(rawText);
    return { success: true, foods: parsed.foods };
  } finally {
    clearTimeout(timeout);
  }
}

async function tryGemini(imageBase64: string, env: Env): Promise<ScanResult> {
  const apiKey = (env as any).GEMINI_API_KEY || '';
  if (!apiKey) throw new Error('No Gemini API key configured');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: GEMINI_PROMPT },
              { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } }
            ]
          }]
        }),
        signal: controller.signal,
      }
    );

    if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!text) throw new Error('Empty Gemini response');

    const parsed = parseAndValidate(text);
    return { success: true, foods: parsed.foods };
  } finally {
    clearTimeout(timeout);
  }
}

function parseAndValidate(text: string): any {
  let parsed: any;
  try {
    parsed = JSON.parse(text.trim());
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('No JSON found');
    parsed = JSON.parse(match[0]);
  }

  if (!parsed.success || !Array.isArray(parsed.foods) || parsed.foods.length === 0) {
    throw new Error('Invalid food response structure');
  }

  return parsed;
}

function enrichFoods(foods: any[]): DetectedFood[] {
  return foods.map((food, index) => ({
    id: food.id || `food_${index}_${Date.now()}`,
    name: String(food.name || 'Home-Made Meal').trim(),
    category: String(food.category || 'General').trim(),
    confidence: clampConfidence(food.confidence),
    serving: String(food.serving || '200g').trim(),
    calories: Math.max(0, Number(food.calories) || 350),
    protein: Math.max(0, Number(food.protein) || 20),
    carbs: Math.max(0, Number(food.carbs) || 30),
    fat: Math.max(0, Number(food.fat) || 12),
    fiber: Math.max(0, Number(food.fiber) || 5),
    sugar_level: clampLevel(food.sugar_level),
    healthScore: clampHealthScore(food.healthScore, food),
    guidance: String(food.guidance || 'Estimated nutrition values. Edit if needed.').trim(),
    image: food.image || '',
  }));
}

function clampConfidence(val: any): number {
  const n = Number(val);
  if (isNaN(n)) return 0.5;
  return Math.max(0, Math.min(1, n));
}

function clampLevel(val: any): string {
  if (val === 'High' || val === 'Medium' || val === 'Low') return val;
  return 'Medium';
}

function clampHealthScore(val: any, food: any): number {
  const n = Number(val);
  if (!isNaN(n)) return Math.max(0, Math.min(100, n));
  const cals = (food.protein * 4) + (food.carbs * 4) + (food.fat * 9);
  return Math.min(100, Math.round((cals / 2000) * 100));
}

function getFallbackResult(): ScanResult {
  return {
    success: true,
    foods: [
      {
        id: 'food_1',
        name: 'Home-Made Meal',
        category: 'General',
        confidence: 0.5,
        serving: '200g',
        calories: 350,
        protein: 20,
        carbs: 30,
        fat: 12,
        fiber: 5,
        sugar_level: 'Medium',
        healthScore: 60,
        guidance: 'Estimated values. Edit the name and nutrition manually.',
        image: '',
      },
    ],
  };
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json' },
  });
}
