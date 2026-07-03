import { Meal } from '../types';
import { fetchWithTimeout } from '../lib/utils';

const BASE_URL = 'https://dummyjson.com/recipes';

const FOOD_IMAGE_URLS = [
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&h=1200&fit=crop',
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1200&h=1200&fit=crop',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&h=1200&fit=crop',
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&h=1200&fit=crop',
  'https://images.unsplash.com/photo-1546069901-d5bf1962c3b1?w=1200&h=1200&fit=crop',
  'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=1200&h=1200&fit=crop',
  'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=1200&h=1200&fit=crop',
  'https://images.unsplash.com/photo-1553621042-f6e147245754?w=1200&h=1200&fit=crop',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=1200&fit=crop',
  'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=1200&h=1200&fit=crop',
];

export interface DummyJSONRecipe {
  id: number;
  name: string;
  ingredients: string[];
  instructions: string[];
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  difficulty: string;
  cuisine: string;
  caloriesPerServing: number;
  tags: string[];
  userId: number;
  image: string;
  rating: number;
  reviewCount: number;
  mealType: string[];
}

export interface DummyJSONResponse {
  recipes: DummyJSONRecipe[];
  total: number;
  skip: number;
  limit: number;
}

function generateImages(primaryImage: string, mealName?: string): string[] {
  const imgs = [primaryImage];
  const index = mealName
    ? mealName.length % FOOD_IMAGE_URLS.length
    : 0;

  const extras: string[] = [];
  for (let i = 0; i < 4; i++) {
    const idx = (index + i) % FOOD_IMAGE_URLS.length;
    const url = FOOD_IMAGE_URLS[idx];
    if (url !== primaryImage) extras.push(url);
  }

  return deduplicateUrls([...imgs, ...extras]).slice(0, 5);
}

function deduplicateUrls(urls: string[]): string[] {
  const seen = new Set<string>();
  return urls.filter(u => {
    if (seen.has(u)) return false;
    seen.add(u);
    return true;
  });
}

function convertToMeal(recipe: DummyJSONRecipe): Meal {
  const images = generateImages(recipe.image, recipe.name);
  return {
    id: `dummyjson-${recipe.id}`,
    name: recipe.name,
    cuisine_origin: recipe.cuisine || 'International',
    meal_type: determineMealType(recipe.mealType),
    protein_tag: determineProteinTag(recipe.ingredients),
    season_tags: determineSeasonTags(recipe.cuisine, recipe.tags),
    availability_countries: ['Global'],
    ingredients: recipe.ingredients.map(i => ({
      name: i,
      amount: '',
      available_locally: true,
    })),
    replacements: [],
    recipe_text: recipe.instructions.join('\n\n'),
    video_query: recipe.name,
    protein_level: 'Medium',
    carbs_level: 'Medium',
    fiber_level: 'Medium',
    fat_level: 'Medium',
    sugar_level: 'Medium',
    calories: recipe.caloriesPerServing || 300,
    prep_time: `${recipe.prepTimeMinutes || 15} min`,
    image_url: recipe.image,
    images,
    reason: `A delicious ${recipe.cuisine || 'international'} dish with ${recipe.ingredients.length} ingredients.`,
  };
}

function determineMealType(mealType: string[]): 'breakfast' | 'lunch' | 'dinner' | 'snack' {
  const types = mealType.map(t => t.toLowerCase());

  if (types.includes('dessert') || types.includes('snack')) {
    return 'snack';
  }
  if (types.includes('breakfast')) {
    return 'breakfast';
  }
  if (types.includes('lunch')) {
    return 'lunch';
  }
  if (types.includes('dinner')) {
    return 'dinner';
  }
  return 'lunch';
}

function determineProteinTag(ingredients: string[]): string {
  const lowerIngredients = ingredients.map(i => i.toLowerCase());

  if (lowerIngredients.some(i => i.includes('chicken') || i.includes('turkey') || i.includes('duck'))) return 'chicken';
  if (lowerIngredients.some(i => i.includes('beef') || i.includes('steak') || i.includes('lamb') || i.includes('pork'))) return 'beef';
  if (lowerIngredients.some(i => i.includes('fish') || i.includes('salmon') || i.includes('tuna') || i.includes('shrimp') || i.includes('prawn'))) return 'fish';
  if (lowerIngredients.some(i => i.includes('tofu') || i.includes('tempeh'))) return 'tofu';
  if (lowerIngredients.some(i => i.includes('lentil') || i.includes('chickpea') || i.includes('bean'))) return 'lentil';
  if (lowerIngredients.some(i => i.includes('egg'))) return 'egg';
  if (lowerIngredients.some(i => i.includes('paneer') || i.includes('cheese'))) return 'cheese';

  return 'vegetable';
}

function determineSeasonTags(cuisine: string, tags: string[]): string[] {
  const seasonTags: string[] = [];

  if (tags.includes('dessert') || tags.includes('sweet')) {
    seasonTags.push('winter', 'fall');
  }
  if (cuisine?.toLowerCase().includes('indian') || cuisine?.toLowerCase().includes('mexican')) {
    seasonTags.push('summer', 'spring');
  }

  return seasonTags.length > 0 ? seasonTags : ['all-season'];
}

export const recipeApi = {
  async searchRecipes(query: string): Promise<Meal[]> {
    try {
      const response = await fetchWithTimeout(`${BASE_URL}/search?q=${encodeURIComponent(query)}&limit=30`);
      const data: DummyJSONResponse = await response.json();
      return data.recipes.map(convertToMeal);
    } catch {
      return [];
    }
  },

  async getRecipeById(id: string): Promise<Meal | null> {
    try {
      const recipeId = id.replace('dummyjson-', '');
      const response = await fetchWithTimeout(`${BASE_URL}/${recipeId}`);
      const recipe: DummyJSONRecipe = await response.json();
      return convertToMeal(recipe);
    } catch {
      return null;
    }
  },

  async getRandomRecipes(count: number = 10): Promise<Meal[]> {
    try {
      const response = await fetchWithTimeout(`${BASE_URL}?limit=${count}`);
      const data: DummyJSONResponse = await response.json();
      return data.recipes.map(convertToMeal);
    } catch {
      return [];
    }
  },

  async getRecipesByTag(tag: string): Promise<Meal[]> {
    try {
      const response = await fetchWithTimeout(`${BASE_URL}/tag/${encodeURIComponent(tag)}?limit=30`);
      const data: DummyJSONResponse = await response.json();
      return data.recipes.map(convertToMeal);
    } catch {
      return [];
    }
  },

  async getRecipesByCategory(category: string): Promise<Meal[]> {
    try {
      const tag = category.toLowerCase();
      return this.getRecipesByTag(tag);
    } catch {
      return [];
    }
  },

  async getDessertRecipes(): Promise<Meal[]> {
    return this.getRecipesByTag('dessert');
  },

  async getCookieRecipes(): Promise<Meal[]> {
    try {
      const allRecipes = await this.getRandomRecipes(50);
      return allRecipes.filter(recipe =>
        recipe.name.toLowerCase().includes('cookie') ||
        recipe.name.toLowerCase().includes('biscuit') ||
        recipe.name.toLowerCase().includes('biscotti') ||
        recipe.ingredients.some(i => i.name.toLowerCase().includes('cookie') || i.name.toLowerCase().includes('biscuit'))
      );
    } catch {
      return [];
    }
  },

  async getRecipesByCuisine(cuisine: string): Promise<Meal[]> {
    try {
      const response = await fetchWithTimeout(`${BASE_URL}?cuisine=${encodeURIComponent(cuisine)}&limit=30`);
      const data: DummyJSONResponse = await response.json();
      return data.recipes.map(convertToMeal);
    } catch {
      return [];
    }
  },

  async getTags(): Promise<string[]> {
    try {
      const response = await fetchWithTimeout(`${BASE_URL}/tags`);
      const tags: string[] = await response.json();
      return tags;
    } catch {
      return [];
    }
  },

  async getAllCuisines(): Promise<{ cuisine: string; count: number }[]> {
    try {
      const response = await fetchWithTimeout(`${BASE_URL}?limit=200`);
      const data: DummyJSONResponse = await response.json();
      const counts: Record<string, number> = {};
      data.recipes.forEach(r => {
        const c = r.cuisine || 'International';
        counts[c] = (counts[c] || 0) + 1;
      });
      return Object.entries(counts)
        .map(([cuisine, count]) => ({ cuisine, count }))
        .sort((a, b) => b.count - a.count);
    } catch {
      return [];
    }
  },
};
