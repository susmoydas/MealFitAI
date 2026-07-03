import { ScanResult, FoodItem, NutritionLevel } from '../types';
import { offlineCache } from './offlineCache';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

const MAX_RETRIES = 3;
const RETRY_DELAYS = [500, 1000, 2000];
const TIMEOUT_MS = 15000;

const FOOD_PROMPT = `You are a food recognition AI. Analyze this meal image and identify EVERY visible food item. For each food, estimate the serving portion and nutrition values. Return ONLY valid JSON with this exact structure:

{
  "foods": [
    {
      "name": "Food Name",
      "confidence": 0.95,
      "portion": "180 g",
      "calories": 365,
      "protein_g": 36,
      "carbs_g": 8,
      "fat_g": 18,
      "fiber_g": 1,
      "sugar_g": 2,
      "sodium_mg": 520
    }
  ],
  "totalNutrition": {
    "calories": 365,
    "protein_g": 36,
    "carbs_g": 8,
    "fat_g": 18,
    "fiber_g": 1,
    "sugar_g": 2,
    "sodium_mg": 520
  }
}

Rules:
- confidence: 0.0 to 1.0 (how confident)
- Include EVERY visible food item separately
- Estimate portion size realistically (e.g. "180 g", "1 cup", "2 pieces")
- All numeric fields required (use 0 if unknown)
- totalNutrition must be the sum of all foods
- Return ONLY the JSON, no markdown, no extra text
- Be as accurate as possible with calorie and macro estimates`;

function gramsToLevel(grams: number, nutrient: 'protein' | 'carbs' | 'fat' | 'fiber' | 'sugar'): NutritionLevel {
  const thresholds: Record<string, { high: number; medium: number }> = {
    protein: { high: 20, medium: 10 },
    carbs: { high: 40, medium: 20 },
    fat: { high: 20, medium: 10 },
    fiber: { high: 8, medium: 4 },
    sugar: { high: 15, medium: 5 },
  };
  const t = thresholds[nutrient];
  if (grams >= t.high) return 'High';
  if (grams >= t.medium) return 'Medium';
  return 'Low';
}

function generateGuidance(food: { protein_g: number; carbs_g: number; fat_g: number; fiber_g: number; sugar_g: number; calories: number }): string {
  const tips: string[] = [];
  if (food.protein_g >= 20) tips.push('Good protein source');
  else if (food.protein_g < 10) tips.push('Consider adding a protein source');
  if (food.fiber_g >= 8) tips.push('Excellent fiber content');
  else if (food.fiber_g < 4) tips.push('Add vegetables or whole grains for more fiber');
  if (food.fat_g > 20) tips.push('High in fat - consider a lighter side');
  if (food.calories > 500) tips.push('Hearty portion - may want to split');
  return tips.length > 0 ? tips.join('. ') + '.' : 'Balanced meal option.';
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('TIMEOUT')), ms)
    ),
  ]);
}

function validateScanResult(data: any): boolean {
  if (!data || typeof data !== 'object') return false;
  if (!Array.isArray(data.foods) || data.foods.length === 0) return false;
  const food = data.foods[0];
  if (!food.name || typeof food.name !== 'string') return false;
  if (typeof food.calories !== 'number') return false;
  if (typeof food.confidence !== 'number') return false;
  if (food.protein_g === undefined && food.protein === undefined) return false;
  return true;
}

function parseGeminiResponse(text: string): any {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  try {
    return JSON.parse(jsonMatch[0]);
  } catch {
    return null;
  }
}

function toFoodItem(data: any): FoodItem {
  return {
    name: String(data.name || 'Unknown Food'),
    confidence: Math.round((data.confidence || 0.5) * 100),
    portion: data.portion || data.serving || '1 serving',
    calories: data.calories || 0,
    protein_g: data.protein_g ?? data.protein ?? 0,
    carbs_g: data.carbs_g ?? data.carbs ?? 0,
    fat_g: data.fat_g ?? data.fat ?? 0,
    fiber_g: data.fiber_g ?? data.fiber ?? 0,
    sugar_g: data.sugar_g ?? data.sugar ?? 0,
    sodium_mg: data.sodium_mg ?? data.sodium ?? 0,
  };
}

function convertToScanResult(data: any): ScanResult {
  const foodItems: FoodItem[] = data.foods.map(toFoodItem);
  const primary = foodItems[0];

  const total = data.totalNutrition
    ? {
        calories: data.totalNutrition.calories || foodItems.reduce((s, f) => s + f.calories, 0),
        protein_g: data.totalNutrition.protein_g ?? foodItems.reduce((s, f) => s + f.protein_g, 0),
        carbs_g: data.totalNutrition.carbs_g ?? foodItems.reduce((s, f) => s + f.carbs_g, 0),
        fat_g: data.totalNutrition.fat_g ?? foodItems.reduce((s, f) => s + f.fat_g, 0),
        fiber_g: data.totalNutrition.fiber_g ?? foodItems.reduce((s, f) => s + f.fiber_g, 0),
        sugar_g: data.totalNutrition.sugar_g ?? foodItems.reduce((s, f) => s + f.sugar_g, 0),
        sodium_mg: data.totalNutrition.sodium_mg ?? foodItems.reduce((s, f) => s + f.sodium_mg, 0),
      }
    : {
        calories: foodItems.reduce((s, f) => s + f.calories, 0),
        protein_g: foodItems.reduce((s, f) => s + f.protein_g, 0),
        carbs_g: foodItems.reduce((s, f) => s + f.carbs_g, 0),
        fat_g: foodItems.reduce((s, f) => s + f.fat_g, 0),
        fiber_g: foodItems.reduce((s, f) => s + f.fiber_g, 0),
        sugar_g: foodItems.reduce((s, f) => s + f.sugar_g, 0),
        sodium_mg: foodItems.reduce((s, f) => s + f.sodium_mg, 0),
      };

  return {
    name: primary.name,
    protein_level: gramsToLevel(total.protein_g, 'protein'),
    carbs_level: gramsToLevel(total.carbs_g, 'carbs'),
    fiber_level: gramsToLevel(total.fiber_g, 'fiber'),
    fat_level: gramsToLevel(total.fat_g, 'fat'),
    sugar_level: gramsToLevel(total.sugar_g, 'sugar'),
    calories: total.calories,
    confidence: Math.round(
      foodItems.reduce((min, f) => Math.min(min, f.confidence), 100)
    ),
    guidance: data.foods[0].guidance || generateGuidance(total),
    serving_size: foodItems.map(f => f.portion).join(' + '),
    food_category: primary.name ? 'Scanned Meal' : 'Unknown',
    foods: foodItems,
    total_nutrition: total,
  };
}

async function callGeminiAPI(base64Image: string): Promise<any> {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY') {
    throw new Error('NO_API_KEY');
  }

  const response = await withTimeout(
    fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: FOOD_PROMPT },
            { inlineData: { mimeType: 'image/jpeg', data: base64Image } }
          ]
        }]
      })
    }),
    TIMEOUT_MS
  );

  if (!response.ok) {
    const status = response.status;
    if (status === 429) throw new Error('RATE_LIMIT');
    if (status >= 500) throw new Error('SERVER_ERROR');
    throw new Error(`API_ERROR_${status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return text;
}

export const geminiService = {
  async identifyFood(base64Image: string, onProgress?: (stage: string) => void): Promise<ScanResult> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        onProgress?.(attempt === 0 ? 'Analyzing your meal...' : 'Retrying...');
        const text = await callGeminiAPI(base64Image);
        const parsed = parseGeminiResponse(text);
        
        if (!parsed || !validateScanResult(parsed)) {
          throw new Error('INVALID_JSON');
        }

        return convertToScanResult(parsed);
      } catch (error: any) {
        lastError = error;
        const errorMsg = error.message || '';
        
        if (errorMsg === 'NO_API_KEY' || errorMsg === 'RATE_LIMIT') {
          break;
        }
        
        if (attempt < MAX_RETRIES - 1) {
          await new Promise(r => setTimeout(r, RETRY_DELAYS[attempt]));
        }
      }
    }

    onProgress?.('Using offline food database...');
    return offlineCache.getScanResult();
  },
};
