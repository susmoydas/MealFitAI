-- USERS (anonymous, device-based, no auth)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT,
  country TEXT NOT NULL,
  diet_preference TEXT,
  allergies TEXT,
  activity_level TEXT,
  health_goal TEXT,
  units TEXT DEFAULT 'metric',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- AUTH (email-based, no password for lead capture)
CREATE TABLE IF NOT EXISTS auth (
  user_id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  password_hash TEXT DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_auth_email ON auth(email);

-- MEAL LOGS (what the user actually ate, drives the learning loop)
CREATE TABLE IF NOT EXISTS meal_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  meal_id TEXT NOT NULL,
  meal_name TEXT,
  meal_type TEXT,
  protein_tag TEXT,
  eaten_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  source TEXT,
  calories INTEGER,
  protein_level TEXT,
  carbs_level TEXT,
  fiber_level TEXT,
  fat_level TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_meal_logs_user_time ON meal_logs(user_id, eaten_at);

-- MEALS (the global meal library, international)
CREATE TABLE IF NOT EXISTS meals (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  cuisine_origin TEXT,
  meal_type TEXT,
  protein_tag TEXT,
  season_tags TEXT,
  availability_countries TEXT,
  ingredients_json TEXT,
  recipe_text TEXT,
  video_query TEXT,
  video_id TEXT,
  protein_level TEXT,
  carbs_level TEXT,
  fiber_level TEXT,
  fat_level TEXT,
  calories INTEGER,
  image_url TEXT
);
CREATE INDEX IF NOT EXISTS idx_meals_type ON meals(meal_type);

-- INGREDIENT REPLACEMENTS (country-aware substitution)
CREATE TABLE IF NOT EXISTS ingredient_replacements (
  id TEXT PRIMARY KEY,
  ingredient_name TEXT NOT NULL,
  country TEXT NOT NULL,
  available INTEGER,
  substitutes_json TEXT,
  why_substitute TEXT
);
CREATE INDEX IF NOT EXISTS idx_ingredient_country ON ingredient_replacements(ingredient_name, country);

-- MEAL ALTERNATIVES (precomputed swap pairs, optional optimization)
CREATE TABLE IF NOT EXISTS meal_alternatives (
  id TEXT PRIMARY KEY,
  meal_id TEXT NOT NULL,
  alternative_meal_id TEXT NOT NULL,
  FOREIGN KEY (meal_id) REFERENCES meals(id)
);

-- NOTIFICATIONS LOG
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT,
  message TEXT,
  sent_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
