export type TargetPreset = {
  calories: number;
  proteinMealsPerDay: number;
  fiberMealsPerDay: number;
};

const TARGET_PRESETS: Record<string, TargetPreset> = {
  sedentary:     { calories: 1800, proteinMealsPerDay: 1, fiberMealsPerDay: 2 },
  light:         { calories: 2000, proteinMealsPerDay: 1, fiberMealsPerDay: 2 },
  moderate:      { calories: 2200, proteinMealsPerDay: 2, fiberMealsPerDay: 2 },
  active:        { calories: 2400, proteinMealsPerDay: 2, fiberMealsPerDay: 3 },
  very_active:   { calories: 2600, proteinMealsPerDay: 2, fiberMealsPerDay: 3 },
};

export function getTargetsForUser(user: { activity_level?: string } | null): TargetPreset {
  const level = user?.activity_level?.toLowerCase() || 'moderate';
  return TARGET_PRESETS[level] || TARGET_PRESETS.moderate;
}
