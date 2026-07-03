import AsyncStorage from '@react-native-async-storage/async-storage';

const USDA_API_KEY = 'DEMO_KEY';
const USDA_BASE = 'https://api.nal.usda.gov/fdc/v1';
const CACHE_PREFIX = '@mealfit_usda_';

export interface USDAResult {
  name: string;
  brand?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  servingSize?: string;
  category?: string;
  ingredients?: string;
}

export const usda = {
  async lookupBarcode(barcode: string): Promise<USDAResult | null> {
    try {
      const cached = await AsyncStorage.getItem(`${CACHE_PREFIX}${barcode}`);
      if (cached) return JSON.parse(cached);
    } catch {}

    try {
      const response = await fetch(
        `${USDA_BASE}/foods/search?query=${encodeURIComponent(barcode)}&pageSize=1&api_key=${USDA_API_KEY}`
      );
      if (!response.ok) return null;
      const data = await response.json();
      if (!data.foods?.length) return null;

      const food = data.foods[0];
      const nutrients = food.foodNutrients || [];

      const extract = (name: string, def = 0) => {
        const n = nutrients.find((x: any) => x.nutrientName === name);
        return n?.value ?? def;
      };

      const result: USDAResult = {
        name: food.description,
        brand: food.brandOwner,
        calories: Math.round(extract('Energy')),
        protein: extract('Protein'),
        carbs: extract('Carbohydrate, by difference'),
        fat: extract('Total lipid (fat)'),
        fiber: extract('Fiber, total dietary'),
        sugar: extract('Total Sugars'),
        servingSize: food.householdServingFullText || (food.servingSize ? `${food.servingSize}${food.servingSizeUnit || 'g'}` : undefined),
        category: food.foodCategory,
        ingredients: food.ingredients,
      };

      await AsyncStorage.setItem(`${CACHE_PREFIX}${barcode}`, JSON.stringify(result));
      return result;
    } catch {
      return null;
    }
  },
};
