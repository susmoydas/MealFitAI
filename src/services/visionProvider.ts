import { FoodItem, FoodRecognitionResult, ScanResult } from '../types';
import { geminiService } from './geminiService';
import { api } from './api';
import { offlineCache } from './offlineCache';

export const CONFIDENCE_THRESHOLD = 0.70;

function mapToResult(scanResult: ScanResult): FoodRecognitionResult {
  if (scanResult.foods && scanResult.total_nutrition) {
    return {
      foods: scanResult.foods,
      totalNutrition: scanResult.total_nutrition,
    };
  }
  const calories = scanResult.calories || 0;
  const foodItem: FoodItem = {
    name: scanResult.name,
    confidence: scanResult.confidence || 50,
    portion: scanResult.serving_size || '1 serving',
    calories,
    protein_g: 0,
    carbs_g: 0,
    fat_g: 0,
    fiber_g: 0,
    sugar_g: 0,
    sodium_mg: 0,
  };
  return {
    foods: [foodItem],
    totalNutrition: {
      calories,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      fiber_g: 0,
      sugar_g: 0,
      sodium_mg: 0,
    },
  };
}

async function geminiProvider(base64Image: string): Promise<FoodRecognitionResult | null> {
  try {
    const scanResult = await geminiService.identifyFood(base64Image);
    return mapToResult(scanResult);
  } catch {
    return null;
  }
}

async function cloudflareProvider(base64Image: string, userId: string): Promise<FoodRecognitionResult | null> {
  try {
    const response = await api.identify(base64Image, userId);
    if (!response || !Array.isArray(response.foods) || response.foods.length === 0) return null;
    const foods: FoodItem[] = response.foods.map((f: any) => ({
      name: String(f.name || 'Unknown Food'),
      confidence: Math.round((f.confidence || 0.5) * 100),
      portion: f.serving || f.portion || '1 serving',
      calories: f.calories || 0,
      protein_g: f.protein_g ?? f.protein ?? 0,
      carbs_g: f.carbs_g ?? f.carbs ?? 0,
      fat_g: f.fat_g ?? f.fat ?? 0,
      fiber_g: f.fiber_g ?? f.fiber ?? 0,
      sugar_g: f.sugar_g ?? f.sugar ?? 0,
      sodium_mg: f.sodium_mg ?? f.sodium ?? 0,
    }));
    const total = {
      calories: foods.reduce((s, f) => s + f.calories, 0),
      protein_g: foods.reduce((s, f) => s + f.protein_g, 0),
      carbs_g: foods.reduce((s, f) => s + f.carbs_g, 0),
      fat_g: foods.reduce((s, f) => s + f.fat_g, 0),
      fiber_g: foods.reduce((s, f) => s + f.fiber_g, 0),
      sugar_g: foods.reduce((s, f) => s + f.sugar_g, 0),
      sodium_mg: foods.reduce((s, f) => s + f.sodium_mg, 0),
    };
    return { foods, totalNutrition: total };
  } catch {
    return null;
  }
}

async function offlineProvider(): Promise<FoodRecognitionResult | null> {
  try {
    const scanResult = await offlineCache.getScanResult();
    return mapToResult(scanResult);
  } catch {
    return null;
  }
}

export const visionProvider = {
  async identify(base64Image: string, userId: string): Promise<FoodRecognitionResult> {
    const result =
      (await geminiProvider(base64Image)) ||
      (await cloudflareProvider(base64Image, userId)) ||
      (await offlineProvider());

    if (result && result.foods.length > 0) return result;

    return {
      foods: [{
        name: 'Unknown Food',
        confidence: 0,
        portion: '1 serving',
        calories: 0,
        protein_g: 0,
        carbs_g: 0,
        fat_g: 0,
        fiber_g: 0,
        sugar_g: 0,
        sodium_mg: 0,
      }],
      totalNutrition: {
        calories: 0,
        protein_g: 0,
        carbs_g: 0,
        fat_g: 0,
        fiber_g: 0,
        sugar_g: 0,
        sodium_mg: 0,
      },
    };
  },
};
