var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/services/db.ts
async function getUser(userId, env) {
  const row = await env.DB.prepare(
    `SELECT id, name, country, diet_preference, allergies, activity_level, health_goal, units
     FROM users WHERE id = ?`
  ).bind(userId).first();
  if (!row) return null;
  return { ...row, allergies: JSON.parse(row.allergies || "[]") };
}
__name(getUser, "getUser");
async function upsertUser(profile, env) {
  await env.DB.prepare(
    `INSERT INTO users (id, name, country, diet_preference, allergies, activity_level, health_goal, units)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       name=excluded.name, country=excluded.country, diet_preference=excluded.diet_preference,
       allergies=excluded.allergies, activity_level=excluded.activity_level,
       health_goal=excluded.health_goal, units=excluded.units`
  ).bind(
    profile.id,
    profile.name ?? null,
    profile.country,
    profile.diet_preference,
    JSON.stringify(profile.allergies),
    profile.activity_level,
    profile.health_goal,
    profile.units
  ).run();
}
__name(upsertUser, "upsertUser");
async function getRecentLogs(userId, hours, env) {
  const since = new Date(Date.now() - hours * 3600 * 1e3).toISOString();
  const { results } = await env.DB.prepare(
    `SELECT id, user_id, meal_id, meal_name, meal_type, protein_tag, eaten_at, source
     FROM meal_logs WHERE user_id = ? AND eaten_at >= ?
     ORDER BY eaten_at DESC LIMIT 50`
  ).bind(userId, since).all();
  return results;
}
__name(getRecentLogs, "getRecentLogs");
async function logMeal(log, env) {
  await env.DB.prepare(
    `INSERT INTO meal_logs (id, user_id, meal_id, meal_name, meal_type, protein_tag, eaten_at, source)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    log.id,
    log.user_id,
    log.meal_id,
    log.meal_name ?? null,
    log.meal_type,
    log.protein_tag,
    log.eaten_at ?? (/* @__PURE__ */ new Date()).toISOString(),
    log.source
  ).run();
}
__name(logMeal, "logMeal");
async function getMealsByCountry(country, env) {
  const { results } = await env.DB.prepare(
    `SELECT * FROM meals WHERE availability_countries LIKE ?`
  ).bind(`%"${country}"%`).all();
  return results.map(parseMealRow);
}
__name(getMealsByCountry, "getMealsByCountry");
async function searchMeals(query, country, env) {
  const q = `%${query}%`;
  const { results } = await env.DB.prepare(
    `SELECT * FROM meals
     WHERE availability_countries LIKE ?
     AND (name LIKE ? OR cuisine_origin LIKE ? OR season_tags LIKE ?)`
  ).bind(`%"${country}"%`, q, q, q).all();
  return results.map(parseMealRow);
}
__name(searchMeals, "searchMeals");
async function getSubstitutes(ingredient, country, env) {
  const row = await env.DB.prepare(
    `SELECT substitutes_json, why_substitute FROM ingredient_replacements
     WHERE ingredient_name = ? AND country = ? AND available = 0`
  ).bind(ingredient, country).first();
  if (!row) return null;
  return {
    if_missing: ingredient,
    replace_with: JSON.parse(row.substitutes_json || "[]"),
    why: row.why_substitute
  };
}
__name(getSubstitutes, "getSubstitutes");
function parseMealRow(row) {
  return {
    id: row.id,
    name: row.name,
    cuisine_origin: row.cuisine_origin,
    meal_type: row.meal_type,
    protein_tag: row.protein_tag,
    season_tags: JSON.parse(row.season_tags || "[]"),
    availability_countries: JSON.parse(row.availability_countries || "[]"),
    ingredients: JSON.parse(row.ingredients_json || "[]"),
    replacements: [],
    recipe_text: row.recipe_text,
    video_query: row.video_query,
    video_id: row.video_id,
    protein_level: row.protein_level,
    carbs_level: row.carbs_level,
    fiber_level: row.fiber_level,
    fat_level: row.fat_level,
    calories: row.calories,
    image_url: row.image_url
  };
}
__name(parseMealRow, "parseMealRow");

// src/services/cache.ts
async function cacheGet(key, env) {
  const val = await env.CACHE.get(key, "json");
  return val ?? null;
}
__name(cacheGet, "cacheGet");
async function cacheSet(key, value, ttlSeconds, env) {
  await env.CACHE.put(key, JSON.stringify(value), { expirationTtl: ttlSeconds });
}
__name(cacheSet, "cacheSet");
async function cacheDel(key, env) {
  await env.CACHE.delete(key);
}
__name(cacheDel, "cacheDel");
var TTL = {
  WEATHER: 30 * 60,
  // 30 minutes
  RECOMMENDATION: 30 * 60,
  // 30 minutes
  VIDEO: 48 * 60 * 60,
  // 48 hours
  NOTIFICATION: 6 * 60 * 60
  // 6 hours (dedup window)
};

// src/services/weather.ts
var SOUTHERN = {
  AU: true,
  NZ: true,
  AR: true,
  BR: true,
  ZA: true,
  CL: true
};
var MONSOON_COUNTRIES = ["BD", "IN", "PK", "LK", "MM", "TH", "VN"];
function deriveSeason(country, date) {
  const month = date.getMonth();
  if (MONSOON_COUNTRIES.includes(country)) {
    if (month >= 5 && month <= 9) return "monsoon";
    if (month >= 10 || month <= 1) return "winter";
    return "summer";
  }
  const southern = SOUTHERN[country] ?? false;
  const adjusted = southern ? (month + 6) % 12 : month;
  if (adjusted <= 1 || adjusted === 11) return "winter";
  if (adjusted <= 4) return "spring";
  if (adjusted <= 7) return "summer";
  return "autumn";
}
__name(deriveSeason, "deriveSeason");
function detectCondition(tempC, humidity, prevTempC, weatherMain) {
  const isRain = ["Rain", "Drizzle", "Thunderstorm"].includes(weatherMain);
  const swing = prevTempC !== null ? Math.abs(tempC - prevTempC) : 0;
  if (tempC > 32 || swing >= 10) return "heatwave";
  if (tempC < 15) return "cold";
  if (isRain || humidity > 80) return "rain";
  return "stable";
}
__name(detectCondition, "detectCondition");
function calcHydration(condition, activity) {
  const base = activity === "high" ? 3e3 : 2e3;
  if (condition === "heatwave") return base + 500;
  if (condition === "rain" || condition === "cold") return base - 200;
  return base;
}
__name(calcHydration, "calcHydration");
async function getWeatherContext(lat, lon, country, env) {
  const cacheKey = `weather:${lat.toFixed(2)}:${lon.toFixed(2)}`;
  const cached = await cacheGet(cacheKey, env);
  if (cached) return cached;
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${env.OPENWEATHER_API_KEY}&units=metric`;
  const res = await fetch(url);
  if (!res.ok) {
    return { condition: "stable", temp_c: 22, humidity: 55, season: deriveSeason(country, /* @__PURE__ */ new Date()), hydration_target_ml: 2e3 };
  }
  const data = await res.json();
  const tempC = data.main.temp;
  const humidity = data.main.humidity;
  const weatherMain = data.weather[0].main;
  const condition = detectCondition(tempC, humidity, null, weatherMain);
  const season = deriveSeason(country, /* @__PURE__ */ new Date());
  const ctx = {
    condition,
    temp_c: tempC,
    humidity,
    season,
    hydration_target_ml: calcHydration(condition, "medium")
  };
  await cacheSet(cacheKey, ctx, TTL.WEATHER, env);
  return ctx;
}
__name(getWeatherContext, "getWeatherContext");

// src/services/places.ts
var CUISINE_KEYWORDS = {
  biryani: ["biryani", "indian", "pakistani", "bangladeshi"],
  khichuri: ["bangladeshi", "indian", "comfort food"],
  ilish: ["bangladeshi", "fish", "seafood"],
  dal: ["indian", "vegetarian", "bangladeshi"],
  chicken: ["chicken", "grill", "fast food"],
  salad: ["salad", "healthy", "cafe"],
  soup: ["soup", "comfort food", "cafe"],
  breakfast: ["cafe", "bakery", "breakfast"],
  lunch: ["lunch", "healthy", "bistro"],
  dinner: ["restaurant", "fine dining", "bistro"],
  snack: ["cafe", "bakery", "fast food"],
  pasta: ["italian", "pasta", "european"],
  tacos: ["mexican", "tacos", "latin"],
  salmon: ["seafood", "grill", "fine dining"]
};
function buildSearchQuery(mealName, cuisineOrigin) {
  const lower = mealName.toLowerCase();
  for (const [key, keywords] of Object.entries(CUISINE_KEYWORDS)) {
    if (lower.includes(key)) return keywords[0];
  }
  if (cuisineOrigin) {
    const map = {
      Bangladeshi: "bangladeshi",
      Indian: "indian",
      Mexican: "mexican",
      Japanese: "japanese",
      Italian: "italian",
      American: "american"
    };
    return map[cuisineOrigin] || "restaurant";
  }
  return "restaurant";
}
__name(buildSearchQuery, "buildSearchQuery");
function estimateTravelTime(distanceKm) {
  return {
    min: Math.round(distanceKm * 3),
    walking: Math.round(distanceKm / 5 * 60),
    cycling: Math.round(distanceKm / 15 * 60)
  };
}
__name(estimateTravelTime, "estimateTravelTime");
function mockNearbyRestaurants(lat, lon, mealName, cuisineOrigin) {
  const names = [
    { name: "Spice Garden", cuisine: "Bangladeshi", rating: 4.5, reviews: 312, price: 2 },
    { name: "Taj Mahal Kitchen", cuisine: "Indian", rating: 4.3, reviews: 245, price: 2 },
    { name: "Golden Wok Bistro", cuisine: "Asian", rating: 4.1, reviews: 189, price: 2 },
    { name: "Green Leaf Cafe", cuisine: "Healthy", rating: 4.6, reviews: 178, price: 1 },
    { name: "Riverside Grill", cuisine: "Continental", rating: 4.4, reviews: 421, price: 3 },
    { name: "Dhaka Delights", cuisine: "Bangladeshi", rating: 4.7, reviews: 534, price: 1 },
    { name: "Curry House", cuisine: "Indian", rating: 4.2, reviews: 267, price: 2 },
    { name: "Sea Breeze Restaurant", cuisine: "Seafood", rating: 4.5, reviews: 398, price: 3 },
    { name: "Urban Pantry", cuisine: "Cafe", rating: 4.3, reviews: 156, price: 1 },
    { name: "The Cozy Bowl", cuisine: "Comfort Food", rating: 4.4, reviews: 203, price: 2 }
  ];
  const query = buildSearchQuery(mealName, cuisineOrigin);
  const matches = names.filter(
    (n) => n.cuisine.toLowerCase().includes(query) || n.name.toLowerCase().includes(query)
  );
  const pool = matches.length >= 3 ? matches : names;
  const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, 6);
  return shuffled.map((n, i) => {
    const dist = 0.3 + i * 0.5 + Math.random() * 0.8;
    const travel = estimateTravelTime(dist);
    return {
      id: `rest_${i}_${Date.now()}`,
      name: n.name,
      image_url: `https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=300&fit=crop`,
      rating: n.rating,
      reviews: n.reviews,
      distance_km: parseFloat(dist.toFixed(1)),
      travel_time_min: travel.min,
      travel_walking_min: travel.walking,
      travel_cycling_min: travel.cycling,
      cuisine: n.cuisine,
      address: `${(lat + 0.01 * i).toFixed(4)}, ${(lon + 0.01 * i).toFixed(4)}`,
      open_now: true,
      opening_hours: "10:00 AM - 10:00 PM",
      price_level: n.price,
      place_id: `place_mock_${i}`,
      lat: lat + 2e-3 * i,
      lon: lon + 2e-3 * i
    };
  });
}
__name(mockNearbyRestaurants, "mockNearbyRestaurants");
async function findNearbyRestaurants(lat, lon, mealName, cuisineOrigin, env) {
  const cacheKey = `rest:${lat.toFixed(2)}:${lon.toFixed(2)}:${mealName.slice(0, 20)}`;
  try {
    const cached = await cacheGet(cacheKey, env);
    if (cached) return cached;
    const query = buildSearchQuery(mealName, cuisineOrigin);
    const apiKey = env.GOOGLE_PLACES_API_KEY;
    if (apiKey && apiKey !== "YOUR_KEY") {
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=2000&keyword=${encodeURIComponent(query)}&key=${apiKey}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.status === "OK" && data.results?.length > 0) {
        const restaurants = data.results.slice(0, 6).map((p, i) => {
          const dist = calcDistance(lat, lon, p.geometry.location.lat, p.geometry.location.lng);
          const travel = estimateTravelTime(dist);
          return {
            id: `place_${p.place_id}`,
            name: p.name,
            image_url: p.photos?.[0] ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${p.photos[0].photo_reference}&key=${apiKey}` : "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=300&fit=crop",
            rating: p.rating || 0,
            reviews: p.user_ratings_total || 0,
            distance_km: parseFloat(dist.toFixed(1)),
            travel_time_min: travel.min,
            travel_walking_min: travel.walking,
            travel_cycling_min: travel.cycling,
            cuisine: p.types?.[0] || query,
            address: p.vicinity || "",
            open_now: p.opening_hours?.open_now ?? true,
            opening_hours: "",
            price_level: p.price_level || 1,
            place_id: p.place_id,
            lat: p.geometry.location.lat,
            lon: p.geometry.location.lng
          };
        });
        await cacheSet(cacheKey, restaurants, TTL.RECOMMENDATION, env);
        return restaurants;
      }
    }
  } catch {
  }
  const mock = mockNearbyRestaurants(lat, lon, mealName, cuisineOrigin);
  await cacheSet(cacheKey, mock, TTL.RECOMMENDATION, env);
  return mock;
}
__name(findNearbyRestaurants, "findNearbyRestaurants");
function calcDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}
__name(calcDistance, "calcDistance");

// src/services/engine.ts
function filterByDiet(pool, diet, allergies) {
  return pool.filter((m) => {
    const ing = m.ingredients.map((i) => i.name.toLowerCase());
    for (const allergen of allergies) {
      if (ing.some((i) => i.includes(allergen.toLowerCase()))) return false;
    }
    if (diet === "vegetarian") {
      const meat = ["chicken", "beef", "pork", "lamb", "fish", "shrimp", "prawn", "meat"];
      if (meat.some((m2) => ing.some((i) => i.includes(m2)))) return false;
    }
    if (diet === "vegan") {
      const animal = ["chicken", "beef", "pork", "lamb", "fish", "egg", "milk", "cream", "butter", "cheese", "ghee"];
      if (animal.some((a) => ing.some((i) => i.includes(a)))) return false;
    }
    if (diet === "pescatarian") {
      const land = ["chicken", "beef", "pork", "lamb", "mutton"];
      if (land.some((a) => ing.some((i) => i.includes(a)))) return false;
    }
    return true;
  });
}
__name(filterByDiet, "filterByDiet");
function applySeasonBias(pool, season) {
  const match = pool.filter((m) => m.season_tags.includes(season));
  const others = pool.filter((m) => !m.season_tags.includes(season));
  return [...match, ...others];
}
__name(applySeasonBias, "applySeasonBias");
function applyWeatherBias(pool, condition) {
  const scoreFn = /* @__PURE__ */ __name((m) => {
    const tags = m.season_tags;
    if (condition === "heatwave") {
      if (tags.some((t) => ["hydrating", "cooling", "light", "salad"].includes(t))) return 2;
      if (tags.some((t) => ["warming", "heavy", "spicy"].includes(t))) return -1;
    }
    if (condition === "cold") {
      if (tags.some((t) => ["warming", "comfort", "hearty", "soup"].includes(t))) return 2;
    }
    if (condition === "rain") {
      if (tags.some((t) => ["comfort", "warming", "hearty"].includes(t))) return 1;
      if (tags.some((t) => ["hydrating", "cooling"].includes(t))) return -1;
    }
    return 0;
  }, "scoreFn");
  return [...pool].sort((a, b) => scoreFn(b) - scoreFn(a));
}
__name(applyWeatherBias, "applyWeatherBias");
function applyHistoryPenalty(pool, logs) {
  const now = Date.now();
  const h24 = now - 24 * 3600 * 1e3;
  const h48 = now - 48 * 3600 * 1e3;
  const recent24Ids = new Set(logs.filter((l) => new Date(l.eaten_at).getTime() > h24).map((l) => l.meal_id));
  const recent48Tags = new Set(logs.filter((l) => new Date(l.eaten_at).getTime() > h48).map((l) => l.protein_tag));
  const primary_excluded = pool.filter((m) => !recent24Ids.has(m.id));
  const fallback = pool.filter((m) => recent24Ids.has(m.id));
  const penalized = primary_excluded.sort((a, b) => {
    const aRepeat = recent48Tags.has(a.protein_tag) ? 1 : 0;
    const bRepeat = recent48Tags.has(b.protein_tag) ? 1 : 0;
    return aRepeat - bRepeat;
  });
  return [...penalized, ...fallback];
}
__name(applyHistoryPenalty, "applyHistoryPenalty");
async function applyLocalization(pool, country, env) {
  return Promise.all(pool.map(async (meal) => {
    const replacements = [];
    for (const ing of meal.ingredients) {
      if (!ing.available_locally) {
        const sub = await getSubstitutes(ing.name, country, env);
        if (sub) replacements.push(sub);
      }
    }
    return { ...meal, replacements };
  }));
}
__name(applyLocalization, "applyLocalization");
var AI_MODELS = ["@cf/meta/llama-3.2-3b-instruct", "@cf/meta/llama-3.1-8b-instruct-fp8"];
async function generateAiReason(meal, condition, season, tempC, profile, env) {
  const prompt = `You are a nutrition expert. Recommend this meal to a user.

Meal: ${meal.name}
Cuisine: ${meal.cuisine_origin}
Type: ${meal.meal_type}
Protein: ${meal.protein_level} | Carbs: ${meal.carbs_level} | Fiber: ${meal.fiber_level}${meal.calories ? ` | Calories: ~${meal.calories}` : ""}
Season: ${season} | Weather: ${condition} (${tempC.toFixed(0)}\xB0C)
User goal: ${profile.health_goal} | Activity: ${profile.activity_level}

Write a JSON response with exactly these fields:
- "reason": one sentence explaining why this meal is a good choice today (consider weather, season, and user goal)
- "healthTip": one sentence with a health insight about this meal

Return ONLY valid JSON.`;
  for (const model of AI_MODELS) {
    try {
      const result = await env.AI.run(model, {
        messages: [{ role: "user", content: prompt }],
        max_tokens: 300
      });
      let raw = result.response || "";
      if (typeof raw === "object" && raw !== null) {
        raw = JSON.stringify(raw);
      }
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {
      continue;
    }
  }
  return null;
}
__name(generateAiReason, "generateAiReason");
function buildFallbackReason(meal, condition, season) {
  if (condition === "heatwave") return "Light and hydrating \u2014 ideal for hot weather.";
  if (condition === "cold") return "Warming and comforting for the cold weather.";
  if (condition === "rain") return "Perfect comfort food for a rainy day.";
  if (meal.season_tags?.includes(season)) return `Seasonal pick for ${season}.`;
  return `Recommended based on your preferences.`;
}
__name(buildFallbackReason, "buildFallbackReason");
function buildFallbackHealthTip(meal) {
  const tips = [];
  if (meal.protein_level === "High") tips.push("High in protein \u2014 great for muscle maintenance.");
  if (meal.fiber_level === "High") tips.push("Rich in fiber \u2014 supports digestion.");
  if (meal.calories && meal.calories < 300) tips.push("Low-calorie option \u2014 light on the stomach.");
  if (tips.length === 0) tips.push("A balanced choice for your day.");
  return tips[0];
}
__name(buildFallbackHealthTip, "buildFallbackHealthTip");
async function getMealSuggestions(userId, profile, weather, lat, lon, env) {
  const logs = await getRecentLogs(userId, 72, env);
  let pool = await getMealsByCountry(profile.country, env);
  pool = filterByDiet(pool, profile.diet_preference, profile.allergies);
  pool = applySeasonBias(pool, weather.season);
  pool = applyWeatherBias(pool, weather.condition);
  pool = applyHistoryPenalty(pool, logs);
  pool = await applyLocalization(pool, profile.country, env);
  if (pool.length === 0) {
    pool = await getMealsByCountry(profile.country, env);
    pool = await applyLocalization(pool, profile.country, env);
  }
  const ai = await generateAiReason(pool[0], weather.condition, weather.season, weather.temp_c, profile, env);
  const primary = {
    ...pool[0],
    reason: ai?.reason ?? buildFallbackReason(pool[0], weather.condition, weather.season)
  };
  const alternatives = pool.slice(1, 6).map((m) => ({
    ...m,
    reason: buildFallbackReason(m, weather.condition, weather.season)
  }));
  const healthTip = ai?.healthTip ?? buildFallbackHealthTip(pool[0]);
  const restaurants = await findNearbyRestaurants(lat, lon, primary.name, primary.cuisine_origin, env);
  return { primary, alternatives, weather, healthTip, restaurants };
}
__name(getMealSuggestions, "getMealSuggestions");

// src/routes/meals.ts
async function handleRecommend(request, env) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");
  const lat = parseFloat(url.searchParams.get("lat") ?? "23.8");
  const lon = parseFloat(url.searchParams.get("lon") ?? "90.4");
  if (!userId) return err("userId is required", 400);
  const cacheKey = `rec:${userId}`;
  const cached = await cacheGet(cacheKey, env);
  if (cached) return json(cached);
  const profile = await getUser(userId, env);
  if (!profile) return err("User not found. Call /api/user/setup first.", 404);
  const weather = await getWeatherContext(lat, lon, profile.country, env);
  const result = await getMealSuggestions(userId, profile, weather, lat, lon, env);
  await cacheSet(cacheKey, result, TTL.RECOMMENDATION, env);
  return json(result);
}
__name(handleRecommend, "handleRecommend");
async function handleSearch(request, env) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q") ?? "";
  const userId = url.searchParams.get("userId");
  if (!q) return err("q is required", 400);
  const profile = userId ? await getUser(userId, env) : null;
  const country = profile?.country ?? "BD";
  const meals = await searchMeals(q, country, env);
  return json(meals);
}
__name(handleSearch, "handleSearch");
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
__name(json, "json");
function err(msg, status = 400) {
  return json({ error: msg }, status);
}
__name(err, "err");

// src/routes/history.ts
async function handleLogMeal(request, env) {
  const body = await request.json();
  const { user_id, meal_id, meal_name, meal_type, protein_tag, source } = body;
  if (!user_id || !meal_id) return err2("user_id and meal_id required", 400);
  await logMeal({
    id: crypto.randomUUID(),
    user_id,
    meal_id,
    meal_name,
    meal_type: meal_type ?? "lunch",
    protein_tag: protein_tag ?? "other",
    source: source ?? "primary"
  }, env);
  await cacheDel(`rec:${user_id}`, env);
  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" }
  });
}
__name(handleLogMeal, "handleLogMeal");
async function handleRecentHistory(request, env) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");
  const hours = parseInt(url.searchParams.get("hours") ?? "72", 10);
  if (!userId) return err2("userId required", 400);
  const logs = await getRecentLogs(userId, hours, env);
  return new Response(JSON.stringify(logs), { headers: { "Content-Type": "application/json" } });
}
__name(handleRecentHistory, "handleRecentHistory");
function err2(msg, status = 400) {
  return new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
__name(err2, "err");

// src/routes/weather.ts
async function handleWeather(request, env) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");
  const lat = parseFloat(url.searchParams.get("lat") ?? "23.8");
  const lon = parseFloat(url.searchParams.get("lon") ?? "90.4");
  const profile = userId ? await getUser(userId, env) : null;
  const country = profile?.country ?? "BD";
  const ctx = await getWeatherContext(lat, lon, country, env);
  return new Response(JSON.stringify(ctx), { headers: { "Content-Type": "application/json" } });
}
__name(handleWeather, "handleWeather");

// src/routes/user.ts
async function handleSetup(request, env) {
  const body = await request.json();
  if (!body.id || !body.country) return err3("id and country required", 400);
  const profile = {
    id: body.id,
    country: body.country ?? "BD",
    diet_preference: body.diet_preference ?? "omnivore",
    allergies: body.allergies ?? [],
    activity_level: body.activity_level ?? "medium",
    health_goal: body.health_goal ?? "balanced",
    units: body.units ?? "metric"
  };
  await upsertUser(profile, env);
  return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
}
__name(handleSetup, "handleSetup");
async function handleGetProfile(request, env) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");
  if (!userId) return err3("userId required", 400);
  const user = await getUser(userId, env);
  if (!user) return err3("Not found", 404);
  return new Response(JSON.stringify(user), { headers: { "Content-Type": "application/json" } });
}
__name(handleGetProfile, "handleGetProfile");
async function handleUpdateProfile(request, env) {
  const body = await request.json();
  if (!body.id) return err3("id required", 400);
  await upsertUser(body, env);
  return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
}
__name(handleUpdateProfile, "handleUpdateProfile");
function err3(msg, status = 400) {
  return new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
__name(err3, "err");

// src/routes/scanner.ts
async function handleIdentify(request, env) {
  try {
    const body = await request.json();
    const { imageBase64 } = body;
    if (!imageBase64) {
      return Response.json({ error: "imageBase64 is required" }, { status: 400 });
    }
    try {
      const result = await env.AI.run("@cf/meta/llama-3.2-11b-vision-instruct", {
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "Identify this food. Return a JSON with: name (food name), protein_level (High/Medium/Low), carbs_level (High/Medium/Low), fiber_level (High/Medium/Low), guidance (one sentence about nutrition). Return ONLY valid JSON." },
              { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
            ]
          }
        ],
        max_tokens: 300
      });
      const text = result.response || "";
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return Response.json({
          name: parsed.name || "Unknown food",
          protein_level: parsed.protein_level || "Medium",
          carbs_level: parsed.carbs_level || "Medium",
          fiber_level: parsed.fiber_level || "Medium",
          guidance: parsed.guidance || "A balanced meal option."
        });
      }
    } catch {
    }
    const sizeInfo = imageBase64.length;
    const names = ["Home-cooked Meal", "Rice Bowl", "Fresh Salad", "Vegetable Soup", "Grilled Plate"];
    const idx = sizeInfo % names.length;
    return Response.json({
      name: names[idx],
      protein_level: idx % 3 === 0 ? "High" : idx % 3 === 1 ? "Medium" : "Low",
      carbs_level: idx % 3 === 1 ? "High" : "Medium",
      fiber_level: idx % 3 === 2 ? "High" : "Medium",
      guidance: [
        "A balanced home-cooked meal with good nutritional variety.",
        "A hearty rice-based meal. Consider adding vegetables for more fiber.",
        "A fresh, low-calorie option. Add protein for a complete meal.",
        "A warming nutrient-rich choice. Great for hydration and digestion."
      ][idx]
    });
  } catch (e) {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }
}
__name(handleIdentify, "handleIdentify");

// src/routes/notifications.ts
async function handleCheckNotifications(request, env) {
  try {
    const body = await request.json();
    const { userId } = body;
    if (!userId) {
      return Response.json({ error: "userId is required" }, { status: 400 });
    }
    const user = await getUser(userId, env);
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }
    const notifications = [];
    const recentLogs = await getRecentLogs(userId, 72, env);
    const recentProteins = recentLogs.slice(0, 5).map((l) => l.protein_tag);
    if (recentProteins.length >= 2) {
      const lastTwo = recentProteins.slice(0, 2);
      if (lastTwo[0] === lastTwo[1]) {
        notifications.push({
          type: "repetition",
          message: `You've had ${lastTwo[0]} the last two times. Try something different!`
        });
      }
    }
    return Response.json(notifications);
  } catch (e) {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }
}
__name(handleCheckNotifications, "handleCheckNotifications");

// src/routes/restaurants.ts
async function handleNearbyRestaurants(request, env) {
  const url = new URL(request.url);
  const lat = parseFloat(url.searchParams.get("lat") ?? "");
  const lon = parseFloat(url.searchParams.get("lon") ?? "");
  const mealName = url.searchParams.get("meal") ?? "";
  const cuisine = url.searchParams.get("cuisine") ?? "";
  if (isNaN(lat) || isNaN(lon)) {
    return err4("lat and lon are required", 400);
  }
  if (!mealName) {
    return err4("meal is required", 400);
  }
  const restaurants = await findNearbyRestaurants(lat, lon, mealName, cuisine, env);
  return json2(restaurants);
}
__name(handleNearbyRestaurants, "handleNearbyRestaurants");
function json2(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
__name(json2, "json");
function err4(msg, status = 400) {
  return json2({ error: msg }, status);
}
__name(err4, "err");

// src/middleware/cors.ts
function withCors(response) {
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type");
  return new Response(response.body, { ...response, headers });
}
__name(withCors, "withCors");
function handleOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}
__name(handleOptions, "handleOptions");

// src/index.ts
var index_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    if (method === "OPTIONS") return handleOptions();
    let response;
    try {
      if (path === "/api/meals/recommend" && method === "GET")
        response = await handleRecommend(request, env);
      else if (path === "/api/meals/search" && method === "GET")
        response = await handleSearch(request, env);
      else if (path === "/api/history/log" && method === "POST")
        response = await handleLogMeal(request, env);
      else if (path === "/api/history/recent" && method === "GET")
        response = await handleRecentHistory(request, env);
      else if (path === "/api/weather" && method === "GET")
        response = await handleWeather(request, env);
      else if (path === "/api/user/setup" && method === "POST")
        response = await handleSetup(request, env);
      else if (path === "/api/user/profile" && method === "GET")
        response = await handleGetProfile(request, env);
      else if (path === "/api/scanner/identify" && method === "POST")
        response = await handleIdentify(request, env);
      else if (path === "/api/notifications/check" && method === "POST")
        response = await handleCheckNotifications(request, env);
      else if (path === "/api/restaurants/nearby" && method === "GET")
        response = await handleNearbyRestaurants(request, env);
      else if (path === "/api/user/profile" && method === "PUT")
        response = await handleUpdateProfile(request, env);
      else
        response = new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
    } catch (e) {
      response = new Response(
        JSON.stringify({ error: "Internal error", detail: e?.message }),
        { status: 500 }
      );
    }
    return withCors(response);
  }
};
export {
  index_default as default
};
//# sourceMappingURL=index.js.map
