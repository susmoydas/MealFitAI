-- Add missing columns to meal_logs table
ALTER TABLE meal_logs ADD COLUMN calories INTEGER;
ALTER TABLE meal_logs ADD COLUMN protein_level TEXT;
ALTER TABLE meal_logs ADD COLUMN carbs_level TEXT;
ALTER TABLE meal_logs ADD COLUMN fiber_level TEXT;
ALTER TABLE meal_logs ADD COLUMN fat_level TEXT;
