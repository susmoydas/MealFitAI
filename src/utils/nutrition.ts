import { NutritionLevel, Meal } from '../types';

export function estimateCalories(meal: Meal): number {
  if (meal.calories) return meal.calories;
  const g = { High: { p: 30, c: 45, f: 10 }, Medium: { p: 18, c: 25, f: 5 }, Low: { p: 8, c: 10, f: 2 } };
  const v = g[meal.protein_level] || g.Medium;
  const fatG = { High: 25, Medium: 15, Low: 8 }[meal.fat_level] || 12;
  return Math.round(v.p * 4 + v.c * 4 + v.f * 2 + fatG * 9);
}

export function estimateCookTime(recipeText: string): string {
  const wc = recipeText.split(/\s+/).length;
  if (wc > 120) return '40 min';
  if (wc > 80) return '30 min';
  return '20 min';
}

export function estimateFatG(meal: Meal): number {
  return { High: 25, Medium: 15, Low: 8 }[meal.fat_level] || 12;
}

export function estimateSugarG(meal: Meal): number {
  return { High: 20, Medium: 10, Low: 3 }[meal.sugar_level] || 5;
}

export function estimateSodiumMg(meal: Meal): number {
  const cuisineFactor: Record<string, number> = {
    Indian: 600, Bangladeshi: 650, Japanese: 800, Korean: 900, Chinese: 850,
    Mexican: 500, Italian: 700, Mediterranean: 450, Thai: 750, American: 650, French: 600,
  };
  return cuisineFactor[meal.cuisine_origin] || 550;
}

export function estimateProteinG(meal: Meal): number {
  return { High: 30, Medium: 18, Low: 8 }[meal.protein_level] || 15;
}

export function estimateCarbsG(meal: Meal): number {
  return { High: 45, Medium: 25, Low: 10 }[meal.carbs_level] || 20;
}

export function estimateFiberG(meal: Meal): number {
  return { High: 10, Medium: 5, Low: 2 }[meal.fiber_level] || 4;
}
