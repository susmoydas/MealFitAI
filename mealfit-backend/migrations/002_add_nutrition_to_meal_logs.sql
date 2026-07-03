-- Migration: Add nutrition snapshot columns to meal_logs
-- Run: wrangler d1 execute mealfit-db --remote --file=migrations/002_add_nutrition_to_meal_logs.sql

ALTER TABLE meal_logs ADD COLUMN calories INTEGER;
ALTER TABLE meal_logs ADD COLUMN protein_level TEXT;
ALTER TABLE meal_logs ADD COLUMN carbs_level TEXT;
ALTER TABLE meal_logs ADD COLUMN fiber_level TEXT;
