import { Meal, RecommendationResponse, WeatherContext, ScanResult, NutritionLevel, MealLog, Season, Restaurant, DetectedFood } from '../types';
import { JournalEntry } from '../context/JournalContext';

const IMG = {
  ilish: 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=1200&h=1200&fit=crop',
  salad: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&h=1200&fit=crop',
  dal: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=1200&h=1200&fit=crop',
  soup: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=1200&h=1200&fit=crop',
  chicken: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=1200&h=1200&fit=crop',
  shakshuka: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=1200&h=1200&fit=crop',
  biryani: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=1200&h=1200&fit=crop',
  salmon: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=1200&h=1200&fit=crop',
  pasta: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=1200&h=1200&fit=crop',
  tacos: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=1200&h=1200&fit=crop',
  porridge: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=1200&h=1200&fit=crop',
  khichuri: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=1200&h=1200&fit=crop',
  miso: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=1200&h=1200&fit=crop',
  curry: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1200&h=1200&fit=crop',
  sushi: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=1200&h=1200&fit=crop',
  ramen: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=1200&h=1200&fit=crop',
  bibimbap: 'https://images.unsplash.com/photo-1553163147-622ab57be1c7?w=1200&h=1200&fit=crop',
  koreanBbq: 'https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?w=1200&h=1200&fit=crop',
  kungPao: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=1200&h=1200&fit=crop',
  dimsum: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=1200&h=1200&fit=crop',
  padThai: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=1200&h=1200&fit=crop',
  thaiCurry: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=1200&h=1200&fit=crop',
  ratatouille: 'https://images.unsplash.com/photo-1572453800999-e8d2d1589b7c?w=1200&h=1200&fit=crop',
  crepe: 'https://images.unsplash.com/photo-1519676867240-f03562e64548?w=1200&h=1200&fit=crop',
  burger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&h=1200&fit=crop',
  caesar: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=1200&h=1200&fit=crop',
  greek: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1200&h=1200&fit=crop',
  falafel: 'https://images.unsplash.com/photo-1593001872095-7d6b7d8e8a3e?w=1200&h=1200&fit=crop',
  tofuBowl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&h=1200&fit=crop',
  mangoLassi: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=1200&h=1200&fit=crop',
};

// Additional food images for multi-image support
const IMG2 = {
  // Indian
  curryBowl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=1200&h=1200&fit=crop',
  paneer: 'https://images.unsplash.com/photo-1630692659157-331c7e498bcd?w=1200&h=1200&fit=crop',
  naan: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=1200&h=1200&fit=crop',
  // Bangladeshi
  bengaliFish: 'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=1200&h=1200&fit=crop',
  bengaliThali: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=1200&h=1200&fit=crop',
  // Japanese
  japaneseBowl: 'https://images.unsplash.com/photo-1546069901-d5bf1962c3b1?w=1200&h=1200&fit=crop',
  japaneseNoodles: 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=1200&h=1200&fit=crop',
  // Korean
  koreanTable: 'https://images.unsplash.com/photo-1553163147-622ab57be1c7?w=1200&h=1200&fit=crop',
  koreanStew: 'https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?w=1200&h=1200&fit=crop',
  // Chinese
  chinesePlatter: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=1200&h=1200&fit=crop',
  dimsumBasket: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=1200&h=1200&fit=crop',
  // Mexican
  mexicanPlatter: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=1200&h=1200&fit=crop',
  mexicanStreet: 'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=1200&h=1200&fit=crop',
  // Italian
  italianPasta: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=1200&h=1200&fit=crop',
  italianPizza: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&h=1200&fit=crop',
  // Mediterranean
  medBowl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1200&h=1200&fit=crop',
  medFalafel: 'https://images.unsplash.com/photo-1593001872095-7d6b7d8e8a3e?w=1200&h=1200&fit=crop',
  // Thai
  thaiBowl: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=1200&h=1200&fit=crop',
  thaiCurryBowl: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=1200&h=1200&fit=crop',
  // American / Western
  grilledPlate: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=1200&h=1200&fit=crop',
  burgerFries: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&h=1200&fit=crop',
  // French
  frenchPlate: 'https://images.unsplash.com/photo-1572453800999-e8d2d1589b7c?w=1200&h=1200&fit=crop',
  frenchSoup: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=1200&h=1200&fit=crop',
  // General
  breakfastPlate: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=1200&h=1200&fit=crop',
  healthyBowl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&h=1200&fit=crop',
  dessert: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=1200&h=1200&fit=crop',
};

// Cuisine-based image pools for multi-image support
const CUISINE_IMAGES: Record<string, string[]> = {
  Indian: [IMG2.curryBowl, IMG2.paneer, IMG2.naan],
  Bangladeshi: [IMG2.bengaliFish, IMG2.bengaliThali, IMG2.curryBowl],
  Japanese: [IMG2.japaneseBowl, IMG2.japaneseNoodles, IMG.miso],
  Korean: [IMG2.koreanTable, IMG2.koreanStew, IMG.bibimbap],
  Chinese: [IMG2.chinesePlatter, IMG2.dimsumBasket, IMG.kungPao],
  Mexican: [IMG2.mexicanPlatter, IMG2.mexicanStreet, IMG.tacos],
  Italian: [IMG2.italianPasta, IMG2.italianPizza, IMG.pasta],
  Mediterranean: [IMG2.medBowl, IMG2.medFalafel, IMG2.healthyBowl],
  Thai: [IMG2.thaiBowl, IMG2.thaiCurryBowl, IMG2.japaneseBowl],
  American: [IMG2.grilledPlate, IMG2.burgerFries, IMG.caesar],
  French: [IMG2.frenchPlate, IMG2.frenchSoup, IMG.ratatouille],
};

const YT: Record<string, string> = {
  'Ilish Bhapa (Steamed Hilsa)': 'QZuF8ysCw-k',
  'Dal Tadka': '-0RZxSPwIpc',
  'Miso Soup': '3B1PZ49aFDg',
  'Chicken Curry': '7MEH5_C7kUM',
  'Shakshuka': '0tFeQsfhE2I',
  'Chicken Biryani': 'uDZoZMXjFnI',
  'Grilled Salmon': 'ky8c7iEVHmM',
  'Pasta Primavera': 'eWbH6vVW_4g',
  'Mexican Tacos': '5QVGASRJ2Rg',
  'Khichuri': 'Q_6GgxUFOAE',
  'Miso Soup (Japanese)': 'RjFp2pNUjME',
  'Greek Salad': 'UCE3G__UQKQ',
  'Oat Porridge': 'N_2HqI5HSCA',
};

function makeMeal(
  id: string,
  name: string,
  cuisine: string,
  type: Meal['meal_type'],
  tag: string,
  seasons: string[],
  countries: string[],
  ings: Meal['ingredients'],
  repl: Meal['replacements'],
  recipe: string,
  protein: NutritionLevel,
  carbs: NutritionLevel,
  fiber: NutritionLevel,
  fat: NutritionLevel,
  sugar: NutritionLevel,
  cal: number,
  prep: string,
  img: string,
  reason: string,
  benefit?: string,
  extraImgs?: string[],
): Meal {
  const pool = CUISINE_IMAGES[cuisine] || [];
  const selected = extraImgs || pool.slice(0, 3);
  // Ensure primary image_url is first, then supplement with extras
  const allImgs = [img, ...selected.filter(u => u !== img)].slice(0, 4);
  return {
    id, name, cuisine_origin: cuisine, meal_type: type, protein_tag: tag,
    season_tags: seasons, availability_countries: countries,
    ingredients: ings, replacements: repl, recipe_text: recipe,
    video_query: `${name} recipe`, video_id: YT[name] || '',
    protein_level: protein, carbs_level: carbs, fiber_level: fiber,
    fat_level: fat, sugar_level: sugar,
    calories: cal, prep_time: prep,
    image_url: img, images: allImgs, reason, seasonal_benefit: benefit,
  };
}

const EMPTY_REPL: Meal['replacements'] = [];

export const MOCK_MEALS: Meal[] = [
  // --- Indian (5) ---
  makeMeal('m_indian_1', 'Chicken Biryani', 'Indian', 'lunch', 'chicken',
    ['summer', 'autumn', 'all'], ['IN', 'BD', 'PK', 'UK', 'US'],
    [
      { name: 'Chicken', amount: '500g', available_locally: true },
      { name: 'Basmati rice', amount: '2 cups', available_locally: true },
      { name: 'Yogurt', amount: '1/2 cup', available_locally: true },
      { name: 'Biryani masala', amount: '2 tbsp', available_locally: false },
      { name: 'Saffron', amount: 'a pinch', available_locally: false },
      { name: 'Ghee', amount: '3 tbsp', available_locally: true },
    ],
    [
      { if_missing: 'Biryani masala', replace_with: ['Garam masala + turmeric + chili powder', 'Curry powder'], why: 'Biryani masala is a specific blend; garam masala with turmeric creates a close aromatic profile.' },
      { if_missing: 'Saffron', replace_with: ['Turmeric soaked in warm milk', 'Food coloring (optional)'], why: 'Saffron adds color and aroma; turmeric milk gives a golden hue.' },
    ],
    'Marinate chicken with yogurt and masala for 1 hour. Parboil rice with whole spices until 70% cooked. Layer chicken and rice, sprinkle saffron milk and ghee. Seal pot and cook on low heat 25 minutes.',
    'High', 'High', 'Low', 'Medium', 'Low', 620, '45 min', IMG.biryani,
    'A fragrant, layered rice dish packed with tender chicken and aromatic spices.', 'Rich in protein and complex carbohydrates for sustained energy.'),

  makeMeal('m_indian_2', 'Masoor Dal (Red Lentil Curry)', 'Indian', 'dinner', 'lentil',
    ['winter', 'monsoon', 'all'], ['IN', 'BD', 'PK'],
    [
      { name: 'Red lentils (masoor)', amount: '200g', available_locally: true },
      { name: 'Ghee', amount: '2 tbsp', available_locally: true },
      { name: 'Cumin seeds', amount: '1 tsp', available_locally: true },
      { name: 'Turmeric powder', amount: '1/2 tsp', available_locally: true },
      { name: 'Tomato', amount: '2 pcs', available_locally: true },
    ],
    [{ if_missing: 'Asafoetida', replace_with: ['Garlic powder', 'Onion powder'], why: 'Asafoetida aids digestion but is hard to find; garlic powder gives a similar savory depth.' }],
    'Rinse lentils and boil with turmeric and water until soft and mushy, about 20 minutes. In a separate pan, heat ghee and temper cumin seeds until they sizzle, then add chopped tomato and cook until soft. Pour over cooked dal and simmer 5 more minutes.',
    'High', 'Medium', 'High', 'Low', 'Low', 320, '30 min', IMG.dal,
    'A comforting, protein-rich lentil dish that pairs perfectly with rice or flatbread.', 'High in fiber and plant-based protein, excellent for digestive health.'),

  makeMeal('m_indian_3', 'Palak Paneer', 'Indian', 'dinner', 'paneer',
    ['winter', 'spring', 'all'], ['IN', 'UK', 'US'],
    [
      { name: 'Paneer', amount: '200g', available_locally: true },
      { name: 'Spinach', amount: '300g', available_locally: true },
      { name: 'Onion', amount: '1 pc', available_locally: true },
      { name: 'Garlic', amount: '4 cloves', available_locally: true },
      { name: 'Cream', amount: '2 tbsp', available_locally: true },
      { name: 'Garam masala', amount: '1 tsp', available_locally: true },
    ],
    [{ if_missing: 'Paneer', replace_with: ['Tofu (pressed)', 'Halloumi'], why: 'Paneer has a firm texture that holds up well; pressed tofu mimics this closely.' }],
    'Blanch spinach, then blend into a smooth puree. Sauté onions and garlic until golden. Add spinach puree, garam masala, and salt. Simmer 10 minutes. Cube paneer and gently fold in. Finish with a drizzle of cream.',
    'High', 'Low', 'High', 'Medium', 'Low', 380, '25 min', IMG.curry,
    'Creamy spinach curry with soft paneer cubes — a classic North Indian comfort dish.', 'Iron-rich spinach combined with high-protein paneer for a nourishing meal.'),

  makeMeal('m_indian_4', 'Masala Dosa', 'Indian', 'breakfast', 'rice',
    ['spring', 'summer', 'all'], ['IN', 'UK', 'US', 'SG'],
    [
      { name: 'Rice', amount: '1 cup', available_locally: true },
      { name: 'Urad dal', amount: '1/2 cup', available_locally: false },
      { name: 'Potato', amount: '3 pcs', available_locally: true },
      { name: 'Mustard seeds', amount: '1 tsp', available_locally: true },
      { name: 'Curry leaves', amount: 'few', available_locally: false },
      { name: 'Green chili', amount: '2 pcs', available_locally: true },
    ],
    [
      { if_missing: 'Urad dal', replace_with: ['Moong dal', 'Chana dal'], why: 'Urad dal gives the characteristic crispness; moong dal produces a slightly softer but still tasty dosa.' },
      { if_missing: 'Curry leaves', replace_with: ['Fresh cilantro', 'Bay leaf (crumbled)'], why: 'Curry leaves add a unique aroma; cilantro provides a fresh herbal note.' },
    ],
    'Soak rice and dal for 6 hours. Grind into a smooth batter and ferment overnight. For filling, boil and mash potatoes, then temper with mustard seeds, curry leaves, and chili. Pour batter on a hot griddle, spread thin, cook until crisp. Fill with potato mixture.',
    'Medium', 'High', 'Low', 'Low', 'Low', 290, '40 min', IMG.curry,
    'Crispy fermented crepe filled with spiced potatoes — a beloved South Indian breakfast.', 'Fermented batter provides probiotics for gut health.'),

  makeMeal('m_indian_5', 'Chana Masala', 'Indian', 'lunch', 'chickpea',
    ['autumn', 'winter', 'all'], ['IN', 'UK', 'US', 'CA'],
    [
      { name: 'Chickpeas', amount: '400g canned', available_locally: true },
      { name: 'Onion', amount: '2 pcs', available_locally: true },
      { name: 'Tomato', amount: '3 pcs', available_locally: true },
      { name: 'Ginger-garlic paste', amount: '2 tbsp', available_locally: true },
      { name: 'Coriander powder', amount: '2 tsp', available_locally: true },
      { name: 'Amchur (dried mango)', amount: '1 tsp', available_locally: false },
    ],
    [{ if_missing: 'Amchur', replace_with: ['Lemon juice', 'Tamarind paste'], why: 'Amchur adds tanginess; lemon juice provides a similar sour kick.' }],
    'Sauté onions until deep golden. Add ginger-garlic paste and cook 1 minute. Add chopped tomatoes and spices, cook until oil separates. Add chickpeas and water. Simmer 15 minutes until thick. Finish with a squeeze of lemon.',
    'High', 'Medium', 'High', 'Low', 'Low', 340, '25 min', IMG.curry,
    'A tangy, spiced chickpea curry that is hearty, affordable, and full of flavor.', 'Excellent plant-based protein and fiber content.'),

  // --- Bangladeshi (4) ---
  makeMeal('m_bd_1', 'Ilish Bhapa (Steamed Hilsa)', 'Bangladeshi', 'lunch', 'fish',
    ['monsoon', 'summer'], ['BD', 'IN'],
    [
      { name: 'Hilsa fish (Ilish)', amount: '4 pieces', available_locally: true },
      { name: 'Mustard seeds', amount: '3 tbsp', available_locally: true },
      { name: 'Mustard oil', amount: '4 tbsp', available_locally: true },
      { name: 'Green chili', amount: '4 pcs', available_locally: true },
      { name: 'Turmeric powder', amount: '1 tsp', available_locally: true },
    ],
    [{ if_missing: 'Coconut milk', replace_with: ['Thick yogurt', 'Cashew paste'], why: 'Coconut milk is imported; yogurt or cashew paste gives a similar creamy base.' }],
    'Soak mustard seeds and grind into a smooth paste with green chili. Mix paste with mustard oil, turmeric, and salt. Coat hilsa pieces and marinate 15 minutes. Place in a steel bowl, cover tightly with foil, and steam 20-25 minutes until fish is cooked. Serve hot with steamed rice.',
    'High', 'Low', 'Low', 'High', 'Low', 420, '35 min', IMG.ilish,
    'The national dish of Bangladesh — tender hilsa fish steamed in a spicy mustard sauce.', 'Rich in omega-3 fatty acids for heart and brain health.'),

  makeMeal('m_bd_2', 'Bhuna Khichuri', 'Bangladeshi', 'lunch', 'rice',
    ['monsoon', 'winter'], ['BD', 'IN'],
    [
      { name: 'Rice', amount: '1 cup', available_locally: true },
      { name: 'Moong dal', amount: '1/2 cup', available_locally: true },
      { name: 'Ghee', amount: '2 tbsp', available_locally: true },
      { name: 'Cumin seeds', amount: '1 tsp', available_locally: true },
      { name: 'Ginger', amount: '1 inch', available_locally: true },
    ],
    [{ if_missing: 'Bay leaves', replace_with: ['Curry leaves', 'Skip'], why: 'Bay leaves add aroma; curry leaves provide a different but pleasant fragrance.' }],
    'Wash rice and dal together. Heat ghee, add cumin seeds and ginger, sauté. Add rice-dal mixture and stir 2 minutes. Add water, salt, turmeric and cook covered on low heat 20 minutes until soft.',
    'Medium', 'High', 'Medium', 'Low', 'Low', 350, '30 min', IMG.khichuri,
    'A comforting one-pot rice and lentil dish, perfect for rainy days.', 'Easily digestible comfort food, gentle on the stomach.'),

  makeMeal('m_bd_3', 'Beef Rezala', 'Bangladeshi', 'dinner', 'beef',
    ['winter', 'autumn'], ['BD', 'IN'],
    [
      { name: 'Beef', amount: '500g', available_locally: true },
      { name: 'Yogurt', amount: '1 cup', available_locally: true },
      { name: 'Onion', amount: '3 pcs', available_locally: true },
      { name: 'Ghee', amount: '3 tbsp', available_locally: true },
      { name: 'Cardamom', amount: '4 pcs', available_locally: true },
      { name: 'Rose water', amount: '1 tbsp', available_locally: false },
    ],
    [{ if_missing: 'Rose water', replace_with: ['Milk + a drop of vanilla', 'Skip'], why: 'Rose water adds a floral aroma; vanilla-infused milk gives a subtle sweetness.' }],
    'Marinate beef in yogurt and spices for 2 hours. Brown onions in ghee until golden. Add beef and sear on high heat. Add warm water, cover, and simmer 1.5 hours until tender. Finish with rose water and fried onions.',
    'High', 'Low', 'Low', 'High', 'Low', 480, '90 min', IMG.curry,
    'A royal Bengali beef curry slow-cooked in aromatic yogurt sauce.', 'High-quality protein for muscle maintenance and repair.'),

  makeMeal('m_bd_4', 'Panta Ilish', 'Bangladeshi', 'breakfast', 'fish',
    ['summer', 'monsoon'], ['BD'],
    [
      { name: 'Leftover rice', amount: '2 cups', available_locally: true },
      { name: 'Water', amount: 'to soak', available_locally: true },
      { name: 'Hilsa fish (fried)', amount: '2 pieces', available_locally: true },
      { name: 'Green chili', amount: '3 pcs', available_locally: true },
      { name: 'Onion', amount: '1 pc', available_locally: true },
    ],
    [],
    'Soak leftover rice in water overnight until slightly fermented. Serve with fried hilsa fish, sliced onions, and green chilies. A traditional Pahela Baishakh (Bengali New Year) breakfast.',
    'High', 'High', 'Low', 'Medium', 'Low', 390, '5 min', IMG.ilish,
    'A traditional Bengali breakfast of fermented rice with fried hilsa fish.', 'Fermented rice supports gut health with natural probiotics.'),

  // --- Japanese (4) ---
  makeMeal('m_jp_1', 'Miso Soup with Tofu', 'Japanese', 'breakfast', 'tofu',
    ['winter', 'spring', 'all'], ['JP', 'US', 'UK', 'AU'],
    [
      { name: 'Miso paste', amount: '3 tbsp', available_locally: true },
      { name: 'Tofu (silken)', amount: '200g', available_locally: true },
      { name: 'Seaweed (wakame)', amount: '1 tbsp', available_locally: false },
      { name: 'Spring onion', amount: '2 stalks', available_locally: true },
    ],
    [
      { if_missing: 'Dashi stock', replace_with: ['Vegetable stock + soy sauce', 'Chicken stock'], why: 'Dashi provides umami; vegetable stock with soy sauce creates a similar savory base.' },
      { if_missing: 'Wakame seaweed', replace_with: ['Chopped spinach', 'Thinly sliced nori'], why: 'Wakame adds texture; spinach gives a similar tender green element.' },
    ],
    'Bring dashi (or substitute stock) to a gentle simmer. Cut tofu into small cubes and add to broth. Remove from heat, stir in miso paste until dissolved. Add rehydrated wakame (or substitute greens). Garnish with spring onion.',
    'Medium', 'Low', 'Low', 'Low', 'Low', 120, '10 min', IMG.miso,
    'A warming, umami-rich soup that starts the day with nutrition and comfort.', 'Low calorie, high in probiotics from fermented miso.'),

  makeMeal('m_jp_2', 'Chicken Katsu Curry', 'Japanese', 'lunch', 'chicken',
    ['autumn', 'winter', 'all'], ['JP', 'UK', 'US', 'AU'],
    [
      { name: 'Chicken breast', amount: '200g', available_locally: true },
      { name: 'Panko breadcrumbs', amount: '1 cup', available_locally: false },
      { name: 'Japanese curry roux', amount: '2 blocks', available_locally: false },
      { name: 'Carrot', amount: '1 pc', available_locally: true },
      { name: 'Potato', amount: '2 pcs', available_locally: true },
      { name: 'Rice', amount: '1 cup', available_locally: true },
    ],
    [
      { if_missing: 'Panko breadcrumbs', replace_with: ['Regular breadcrumbs', 'Crushed cornflakes'], why: 'Panko creates a lighter, crispier coating; regular crumbs still work well.' },
      { if_missing: 'Japanese curry roux', replace_with: ['Curry powder + flour + butter', 'Indian curry paste'], why: 'Japanese curry is milder and thicker; a roux made from curry powder and flour approximates it.' },
    ],
    'Flatten chicken breast, season, coat in flour, egg, and panko. Deep fry until golden and cooked through. For curry, sauté onions, carrots, and potatoes. Add water and curry roux, simmer until thickened. Serve chicken sliced over rice with curry sauce.',
    'High', 'High', 'Medium', 'Medium', 'Low', 580, '40 min', IMG.chicken,
    'Crispy panko-crusted chicken cutlet served with rich Japanese curry and rice.', 'High protein with energy-sustaining carbohydrates.'),

  makeMeal('m_jp_3', 'Salmon Sushi Bowl', 'Japanese', 'dinner', 'fish',
    ['spring', 'summer'], ['JP', 'US', 'UK', 'AU'],
    [
      { name: 'Sushi rice', amount: '1 cup', available_locally: true },
      { name: 'Salmon (sashimi grade)', amount: '200g', available_locally: false },
      { name: 'Avocado', amount: '1 pc', available_locally: true },
      { name: 'Soy sauce', amount: '2 tbsp', available_locally: true },
      { name: 'Nori strips', amount: 'handful', available_locally: true },
      { name: 'Pickled ginger', amount: '1 tbsp', available_locally: true },
    ],
    [{ if_missing: 'Sashimi-grade salmon', replace_with: ['Smoked salmon', 'Grilled salmon (flaked)'], why: 'Sashimi-grade salmon is raw and requires special handling; smoked salmon offers a similar texture and flavor.' }],
    'Cook sushi rice and season with rice vinegar, sugar, and salt. Slice salmon into thin pieces. Assemble bowl with rice, salmon, sliced avocado, nori strips, and pickled ginger. Drizzle with soy sauce.',
    'High', 'High', 'Medium', 'Medium', 'Low', 450, '20 min', IMG.sushi,
    'A fresh, vibrant sushi experience without the rolling — perfect for weeknights.', 'Omega-3 rich salmon supports cardiovascular health.'),

  makeMeal('m_jp_4', 'Tonkotsu Ramen', 'Japanese', 'dinner', 'pork',
    ['winter', 'autumn'], ['JP', 'US', 'UK'],
    [
      { name: 'Ramen noodles', amount: '200g', available_locally: true },
      { name: 'Pork bone broth', amount: '4 cups', available_locally: false },
      { name: 'Chashu pork', amount: '4 slices', available_locally: false },
      { name: 'Soft-boiled egg', amount: '2 pcs', available_locally: true },
      { name: 'Green onion', amount: '2 stalks', available_locally: true },
      { name: 'Nori', amount: '4 sheets', available_locally: true },
    ],
    [
      { if_missing: 'Pork bone broth', replace_with: ['Chicken bone broth + pork fat', 'Rich beef broth'], why: 'Tonkotsu broth is creamy and porky; chicken bone broth with pork fat approximates the richness.' },
      { if_missing: 'Chashu pork', replace_with: ['Braised pork belly', 'Grilled pork loin'], why: 'Chashu is slow-braised pork; pork belly braised in soy and mirin gives a similar result.' },
    ],
    'Simmer pork bones for 12-18 hours until the broth is creamy and opaque. Cook ramen noodles according to package. Assemble: noodles, broth, sliced chashu, halved soft-boiled egg, green onions, and nori.',
    'High', 'High', 'Low', 'High', 'Low', 520, '20 min', IMG.ramen,
    'A rich, creamy pork bone broth ramen that warms the soul.', 'High in collagen from the bone broth, supporting joint and skin health.'),

  // --- Korean (4) ---
  makeMeal('m_kr_1', 'Bibimbap', 'Korean', 'lunch', 'beef',
    ['spring', 'summer', 'all'], ['KR', 'US', 'UK', 'AU'],
    [
      { name: 'Rice', amount: '1 cup', available_locally: true },
      { name: 'Beef bulgogi', amount: '150g', available_locally: true },
      { name: 'Spinach', amount: '100g', available_locally: true },
      { name: 'Carrot', amount: '1 pc', available_locally: true },
      { name: 'Egg', amount: '1 pc', available_locally: true },
      { name: 'Gochujang paste', amount: '2 tbsp', available_locally: false },
    ],
    [{ if_missing: 'Gochujang paste', replace_with: ['Sriracha + miso paste', 'Chili paste + honey'], why: 'Gochujang is fermented chili paste; sriracha with miso creates a similar sweet-spicy-umami profile.' }],
    'Cook rice and keep warm. Sauté spinach and carrots separately. Grill bulgogi beef until caramelized. Fry an egg sunny-side up. Assemble bowl: rice, vegetables, beef, egg. Serve with gochujang and sesame oil.',
    'High', 'High', 'Medium', 'Medium', 'Medium', 500, '35 min', IMG.bibimbap,
    'A colorful Korean rice bowl with sautéed vegetables, beef, and a fried egg.', 'Perfectly balanced meal with protein, carbs, and vegetables.'),

  makeMeal('m_kr_2', 'Korean BBQ (Samgyeopsal)', 'Korean', 'dinner', 'pork',
    ['summer', 'spring', 'all'], ['KR', 'US', 'UK', 'AU'],
    [
      { name: 'Pork belly', amount: '400g', available_locally: true },
      { name: 'Lettuce leaves', amount: 'for wrapping', available_locally: true },
      { name: 'Garlic', amount: '6 cloves', available_locally: true },
      { name: 'Ssamjang sauce', amount: '3 tbsp', available_locally: false },
      { name: 'Kimchi', amount: '1 cup', available_locally: true },
    ],
    [{ if_missing: 'Ssamjang sauce', replace_with: ['Miso + chili paste + garlic', 'Gochujang + sesame oil'], why: 'Ssamjang is a thick, savory dipping sauce; miso with chili paste approximates the flavor.' }],
    'Slice pork belly into thick pieces. Grill on a hot pan or tabletop grill until crispy and golden. Serve with lettuce wraps, sliced garlic, ssamjang, and kimchi. Each person wraps pork in lettuce with condiments.',
    'High', 'Low', 'Medium', 'High', 'Low', 560, '30 min', IMG.koreanBbq,
    'A social dining experience where you grill pork belly at the table and wrap it in lettuce.', 'High-quality fat and protein for satiety and energy.'),

  makeMeal('m_kr_3', 'Kimchi Jjigae (Kimchi Stew)', 'Korean', 'dinner', 'pork',
    ['winter', 'autumn'], ['KR', 'US', 'UK'],
    [
      { name: 'Kimchi (aged)', amount: '2 cups', available_locally: true },
      { name: 'Pork belly', amount: '200g', available_locally: true },
      { name: 'Tofu', amount: '200g', available_locally: true },
      { name: 'Gochugaru', amount: '1 tbsp', available_locally: false },
      { name: 'Green onion', amount: '2 stalks', available_locally: true },
    ],
    [{ if_missing: 'Gochugaru', replace_with: ['Crushed red pepper + paprika', 'Cayenne pepper'], why: 'Gochugaru has a mild heat and smoky flavor; crushed red pepper with paprika mimics this.' }],
    'Sauté pork belly slices until golden. Add aged kimchi and stir-fry 3 minutes. Add water, gochugaru, and bring to a boil. Reduce heat, add tofu slices, and simmer 15 minutes. Garnish with green onions.',
    'High', 'Low', 'Medium', 'Medium', 'Low', 320, '25 min', IMG.koreanBbq,
    'A hearty, spicy kimchi stew that warms you from the inside out.', 'Fermented kimchi provides probiotics that aid digestion.'),

  makeMeal('m_kr_4', 'Japchae (Glass Noodles)', 'Korean', 'lunch', 'noodle',
    ['spring', 'summer', 'all'], ['KR', 'US', 'UK'],
    [
      { name: 'Sweet potato noodles', amount: '200g', available_locally: false },
      { name: 'Beef', amount: '100g', available_locally: true },
      { name: 'Spinach', amount: '100g', available_locally: true },
      { name: 'Carrot', amount: '1 pc', available_locally: true },
      { name: 'Soy sauce', amount: '3 tbsp', available_locally: true },
      { name: 'Sesame oil', amount: '2 tbsp', available_locally: true },
    ],
    [{ if_missing: 'Sweet potato noodles', replace_with: ['Rice vermicelli', 'Soba noodles'], why: 'Sweet potato noodles are chewy and translucent; rice vermicelli has a similar texture when cooked.' }],
    'Boil noodles until tender, drain, and toss with sesame oil. Sauté beef strips. Blanch spinach and julienne carrots. Mix everything with soy sauce, sugar, and sesame oil. Toss well and serve warm or at room temperature.',
    'Medium', 'High', 'Medium', 'Low', 'Medium', 340, '30 min', IMG.bibimbap,
    'Sweet and savory glass noodles stir-fried with vegetables and beef.', 'A lighter noodle dish that is naturally gluten-free.'),

  // --- Chinese (4) ---
  makeMeal('m_cn_1', 'Kung Pao Chicken', 'Chinese', 'dinner', 'chicken',
    ['autumn', 'winter', 'all'], ['CN', 'US', 'UK', 'AU'],
    [
      { name: 'Chicken thigh', amount: '400g', available_locally: true },
      { name: 'Peanuts', amount: '1/2 cup', available_locally: true },
      { name: 'Dried chili', amount: '6 pcs', available_locally: true },
      { name: 'Soy sauce', amount: '2 tbsp', available_locally: true },
      { name: 'Rice vinegar', amount: '1 tbsp', available_locally: true },
      { name: 'Green onion', amount: '3 stalks', available_locally: true },
    ],
    [],
    'Dice chicken thigh into cubes. Marinate with soy sauce and cornstarch. Stir-fry chicken in hot oil until golden. Add dried chilies and peanuts. Pour sauce mixture (soy, vinegar, sugar, sesame oil) and toss. Garnish with green onions.',
    'High', 'Medium', 'Medium', 'Medium', 'Medium', 420, '20 min', IMG.kungPao,
    'A bold, spicy Sichuan stir-fry with tender chicken and crunchy peanuts.', 'Good source of protein and healthy fats from peanuts.'),

  makeMeal('m_cn_2', 'Dim Sum (Har Gow)', 'Chinese', 'snack', 'shrimp',
    ['spring', 'summer', 'all'], ['CN', 'HK', 'US', 'UK', 'AU'],
    [
      { name: 'Shrimp', amount: '300g', available_locally: true },
      { name: 'Wheat starch', amount: '1 cup', available_locally: false },
      { name: 'Bamboo shoots', amount: '1/4 cup', available_locally: true },
      { name: 'Sesame oil', amount: '1 tsp', available_locally: true },
      { name: 'Ginger', amount: '1 tsp grated', available_locally: true },
    ],
    [{ if_missing: 'Wheat starch', replace_with: ['Rice flour + tapioca starch', 'Cornstarch'], why: 'Wheat starch creates a translucent wrapper; rice flour with tapioca starch produces a similar chewy texture.' }],
    'Make dough with wheat starch and boiling water, knead until smooth. Mix chopped shrimp with bamboo shoots, seasonings. Roll dough into small circles, fill with shrimp mixture. Pleat to seal. Steam 5-6 minutes until translucent.',
    'High', 'Medium', 'Low', 'Low', 'Low', 220, '45 min', IMG.dimsum,
    'Delicate shrimp dumplings with a translucent, chewy wrapper.', 'Lean protein from shrimp with minimal fat content.'),

  makeMeal('m_cn_3', 'Mapo Tofu', 'Chinese', 'dinner', 'tofu',
    ['autumn', 'winter', 'all'], ['CN', 'US', 'UK', 'JP'],
    [
      { name: 'Silken tofu', amount: '400g', available_locally: true },
      { name: 'Ground pork', amount: '150g', available_locally: true },
      { name: 'Doubanjiang (chili bean paste)', amount: '2 tbsp', available_locally: false },
      { name: 'Sichuan peppercorns', amount: '1 tsp', available_locally: false },
      { name: 'Green onion', amount: '2 stalks', available_locally: true },
    ],
    [
      { if_missing: 'Doubanjiang', replace_with: ['Miso + chili paste', 'Gochujang'], why: 'Doubanjiang is fermented chili bean paste; miso with chili paste creates a similar savory-spicy base.' },
      { if_missing: 'Sichuan peppercorns', replace_with: ['Black pepper + lemon zest', 'Skip'], why: 'Sichuan peppercorns create a numbing sensation; black pepper with lemon zest adds a different but pleasant warmth.' },
    ],
    'Cut tofu into cubes and blanch in salted water. Brown ground pork in a wok. Add doubanjiang and stir-fry until fragrant. Add water, tofu, and simmer 5 minutes. Thicken with cornstarch slurry. Finish with Sichuan pepper and green onions.',
    'High', 'Low', 'Medium', 'Medium', 'Low', 310, '20 min', IMG.tofuBowl,
    'A classic Sichuan dish featuring silken tofu in a spicy, numbing chili sauce.', 'Plant-forward protein with metabolism-boosting spices.'),

  makeMeal('m_cn_4', 'Fried Rice', 'Chinese', 'lunch', 'rice',
    ['all'], ['CN', 'US', 'UK', 'AU', 'SG'],
    [
      { name: 'Day-old rice', amount: '3 cups', available_locally: true },
      { name: 'Egg', amount: '3 pcs', available_locally: true },
      { name: 'Mixed vegetables', amount: '1 cup', available_locally: true },
      { name: 'Soy sauce', amount: '2 tbsp', available_locally: true },
      { name: 'Sesame oil', amount: '1 tbsp', available_locally: true },
      { name: 'Spring onion', amount: '3 stalks', available_locally: true },
    ],
    [],
    'Heat wok on high heat. Scramble eggs and set aside. Stir-fry vegetables until tender. Add cold rice and break up any clumps. Add soy sauce and sesame oil, toss well. Return eggs, mix through. Garnish with spring onion.',
    'Medium', 'High', 'Medium', 'Medium', 'Low', 380, '15 min', IMG.kungPao,
    'Quick, versatile fried rice that is a staple across Chinese cuisine.', 'Customizable with any protein or vegetables on hand.'),

  // --- Mexican (4) ---
  makeMeal('m_mx_1', 'Chicken Tinga Tacos', 'Mexican', 'lunch', 'chicken',
    ['spring', 'summer', 'all'], ['MX', 'US', 'UK'],
    [
      { name: 'Chicken breast', amount: '500g', available_locally: true },
      { name: 'Tomato', amount: '4 pcs', available_locally: true },
      { name: 'Chipotle peppers', amount: '2 tbsp', available_locally: false },
      { name: 'Onion', amount: '1 large', available_locally: true },
      { name: 'Corn tortillas', amount: '8 pcs', available_locally: true },
    ],
    [{ if_missing: 'Chipotle peppers', replace_with: ['Smoked paprika + hot chili', 'Ancho chili powder'], why: 'Chipotle adds smoky heat; smoked paprika with chili achieves similar depth.' }],
    'Boil chicken with onion, garlic, and salt until tender. Shred the chicken. Blend tomatoes, chipotle, and oregano into a smooth sauce. Simmer sauce, add shredded chicken, and cook 10 minutes until flavors meld. Serve on warm tortillas.',
    'High', 'Medium', 'Medium', 'Low', 'Low', 380, '30 min', IMG.tacos,
    'Smoky, shredded chicken tacos with a chipotle-tomato sauce.', 'High protein, moderate-carb meal that is great for post-workout.'),

  makeMeal('m_mx_2', 'Guacamole & Chips', 'Mexican', 'snack', 'avocado',
    ['spring', 'summer', 'all'], ['MX', 'US', 'UK', 'AU'],
    [
      { name: 'Avocado', amount: '3 pcs', available_locally: true },
      { name: 'Lime', amount: '2 pcs', available_locally: true },
      { name: 'Cilantro', amount: 'fresh', available_locally: true },
      { name: 'Jalapeño', amount: '1 pc', available_locally: true },
      { name: 'Tomato', amount: '1 pc', available_locally: true },
      { name: 'Tortilla chips', amount: '200g', available_locally: true },
    ],
    [],
    'Halve avocados, remove pits, and scoop into a bowl. Mash to desired consistency. Dice tomato and jalapeño finely. Mix with lime juice, cilantro, and salt. Adjust seasoning. Serve immediately with tortilla chips.',
    'Low', 'Medium', 'High', 'High', 'Low', 280, '10 min', IMG.tacos,
    'Creamy, fresh guacamole made with ripe avocados and zesty lime.', 'Heart-healthy monounsaturated fats from avocados.'),

  makeMeal('m_mx_3', 'Elote (Mexican Street Corn)', 'Mexican', 'snack', 'corn',
    ['summer', 'spring'], ['MX', 'US'],
    [
      { name: 'Corn on the cob', amount: '4 pcs', available_locally: true },
      { name: 'Mayonnaise', amount: '3 tbsp', available_locally: true },
      { name: 'Cotija cheese', amount: '1/2 cup', available_locally: false },
      { name: 'Chili powder', amount: '1 tsp', available_locally: true },
      { name: 'Lime', amount: '1 pc', available_locally: true },
    ],
    [{ if_missing: 'Cotija cheese', replace_with: ['Feta (crumbled)', 'Parmesan (grated)'], why: 'Cotija is a salty, crumbly Mexican cheese; feta provides a similar saltiness and texture.' }],
    'Grill corn on the cob until charred, about 10 minutes. Brush with mayonnaise. Sprinkle with crumbled cotija cheese, chili powder, and a squeeze of lime. Serve hot.',
    'Low', 'High', 'Medium', 'Medium', 'Medium', 220, '15 min', IMG.tacos,
    'Grilled corn slathered in creamy mayo, cheese, and chili.', 'Good source of fiber and B vitamins from corn.'),

  makeMeal('m_mx_4', 'Churros', 'Mexican', 'snack', 'dessert',
    ['autumn', 'winter', 'all'], ['MX', 'ES', 'US', 'UK'],
    [
      { name: 'Flour', amount: '1 cup', available_locally: true },
      { name: 'Water', amount: '1 cup', available_locally: true },
      { name: 'Butter', amount: '1/2 cup', available_locally: true },
      { name: 'Egg', amount: '3 pcs', available_locally: true },
      { name: 'Cinnamon', amount: '2 tsp', available_locally: true },
      { name: 'Sugar', amount: '1/2 cup', available_locally: true },
    ],
    [],
    'Bring water, butter, and sugar to a boil. Add flour and stir until dough forms. Let cool slightly, then beat in eggs one at a time. Pipe into hot oil and fry until golden. Roll in cinnamon sugar.',
    'Low', 'High', 'Low', 'High', 'High', 310, '25 min', IMG.tacos,
    'Crispy, cinnamon-sugar fried dough sticks — a beloved Mexican dessert.', 'Best enjoyed as an occasional treat in balanced diet.'),

  // --- Italian (4) ---
  makeMeal('m_it_1', 'Creamy Garlic Pasta', 'Italian', 'dinner', 'pasta',
    ['winter', 'autumn', 'all'], ['IT', 'US', 'UK', 'AU'],
    [
      { name: 'Pasta (penne)', amount: '300g', available_locally: true },
      { name: 'Garlic', amount: '6 cloves', available_locally: true },
      { name: 'Olive oil', amount: '3 tbsp', available_locally: true },
      { name: 'Parmesan cheese', amount: '50g', available_locally: false },
      { name: 'Heavy cream', amount: '200ml', available_locally: true },
    ],
    [{ if_missing: 'Parmesan cheese', replace_with: ['Cheddar (grated)', 'Nutritional yeast'], why: 'Parmesan adds nutty saltiness; cheddar provides a similar umami hit.' }],
    'Cook pasta al dente. In a pan, sauté minced garlic in olive oil. Add cream and simmer. Toss in cooked pasta, add grated parmesan (or substitute), and mix well. Garnish with fresh parsley.',
    'Medium', 'High', 'Low', 'High', 'Medium', 480, '20 min', IMG.pasta,
    'Rich, creamy garlic pasta that is pure comfort in a bowl.', 'Carbohydrate-rich meal providing quick energy.'),

  makeMeal('m_it_2', 'Margherita Pizza', 'Italian', 'lunch', 'cheese',
    ['spring', 'summer', 'all'], ['IT', 'US', 'UK', 'AU', 'DE'],
    [
      { name: 'Pizza dough', amount: '1 ball', available_locally: true },
      { name: 'San Marzano tomatoes', amount: '400g', available_locally: false },
      { name: 'Fresh mozzarella', amount: '200g', available_locally: true },
      { name: 'Fresh basil', amount: 'leaves', available_locally: true },
      { name: 'Olive oil', amount: '2 tbsp', available_locally: true },
    ],
    [{ if_missing: 'San Marzano tomatoes', replace_with: ['Regular plum tomatoes + sugar', 'Crushed tomatoes'], why: 'San Marzano tomatoes are sweeter and less acidic; regular plum tomatoes with a pinch of sugar balance the acidity.' }],
    'Stretch dough into a round. Spread crushed tomatoes evenly. Tear mozzarella and distribute. Drizzle olive oil. Bake at the highest temperature (250°C/500°F) for 8-10 minutes until crust is golden and cheese bubbles. Top with fresh basil.',
    'High', 'High', 'Medium', 'Medium', 'Low', 450, '20 min', IMG.pasta,
    'The classic Neapolitan pizza with tomato, mozzarella, and basil.', 'Balanced meal with protein, carbs, and calcium from mozzarella.'),

  makeMeal('m_it_3', 'Risotto alla Milanese', 'Italian', 'dinner', 'rice',
    ['autumn', 'winter'], ['IT', 'US', 'UK'],
    [
      { name: 'Arborio rice', amount: '1.5 cups', available_locally: true },
      { name: 'Saffron', amount: 'a pinch', available_locally: false },
      { name: 'Chicken broth', amount: '4 cups', available_locally: true },
      { name: 'Onion', amount: '1 pc', available_locally: true },
      { name: 'Parmesan', amount: '1/2 cup', available_locally: true },
      { name: 'Butter', amount: '3 tbsp', available_locally: true },
    ],
    [{ if_missing: 'Saffron', replace_with: ['Turmeric', 'Annatto powder'], why: 'Saffron gives risotto its signature golden color and floral aroma; turmeric provides color and earthy notes.' }],
    'Sauté finely diced onion in butter until translucent. Add rice and toast 2 minutes. Add saffron-infused warm broth one ladle at a time, stirring constantly. Continue for 18 minutes. Finish with butter and parmesan. Serve immediately.',
    'Medium', 'High', 'Low', 'Medium', 'Low', 400, '35 min', IMG.pasta,
    'Creamy saffron-infused risotto, a Milanese classic.', 'Comforting carbohydrates with anti-inflammatory saffron compounds.'),

  makeMeal('m_it_4', 'Caprese Salad', 'Italian', 'lunch', 'cheese',
    ['summer', 'spring'], ['IT', 'US', 'UK', 'AU'],
    [
      { name: 'Fresh mozzarella', amount: '200g', available_locally: true },
      { name: 'Tomato', amount: '3 pcs', available_locally: true },
      { name: 'Fresh basil', amount: 'leaves', available_locally: true },
      { name: 'Olive oil', amount: '3 tbsp', available_locally: true },
      { name: 'Balsamic vinegar', amount: '1 tbsp', available_locally: true },
    ],
    [],
    'Slice mozzarella and tomatoes into even rounds. Alternate on a plate. Drizzle with olive oil and balsamic vinegar. Season with salt and pepper. Garnish with fresh basil leaves.',
    'High', 'Low', 'Low', 'Medium', 'Low', 280, '10 min', IMG.salad,
    'A simple, elegant salad celebrating fresh summer ingredients.', 'Calcium-rich mozzarella with antioxidant lycopene from tomatoes.'),

  // --- Mediterranean (4) ---
  makeMeal('m_med_1', 'Greek Salad', 'Mediterranean', 'lunch', 'feta',
    ['summer', 'spring', 'all'], ['GR', 'US', 'UK', 'AU'],
    [
      { name: 'Cucumber', amount: '1 pc', available_locally: true },
      { name: 'Tomato', amount: '4 pcs', available_locally: true },
      { name: 'Feta cheese', amount: '150g', available_locally: true },
      { name: 'Kalamata olives', amount: '1/2 cup', available_locally: false },
      { name: 'Red onion', amount: '1/2 pc', available_locally: true },
      { name: 'Olive oil', amount: '3 tbsp', available_locally: true },
    ],
    [{ if_missing: 'Kalamata olives', replace_with: ['Black olives', 'Green olives'], why: 'Kalamata olives have a distinct fruity flavor; black olives provide a milder alternative.' }],
    'Chop cucumber, tomatoes, and red onion into large chunks. Add olives. Crumble feta on top. Drizzle with olive oil and oregano. Season with salt and pepper. Toss gently and serve.',
    'Medium', 'Low', 'Medium', 'High', 'Low', 260, '10 min', IMG.greek,
    'A refreshing, crunchy Greek salad with briny feta and olives.', 'Heart-healthy olive oil and vegetables rich in antioxidants.'),

  makeMeal('m_med_2', 'Falafel Wrap', 'Mediterranean', 'lunch', 'chickpea',
    ['spring', 'summer', 'all'], ['EG', 'US', 'UK', 'DE', 'AU'],
    [
      { name: 'Chickpeas (dried)', amount: '300g', available_locally: true },
      { name: 'Onion', amount: '1 pc', available_locally: true },
      { name: 'Parsley', amount: 'fresh', available_locally: true },
      { name: 'Cumin', amount: '2 tsp', available_locally: true },
      { name: 'Pita bread', amount: '4 pcs', available_locally: true },
      { name: 'Tahini', amount: '3 tbsp', available_locally: false },
    ],
    [{ if_missing: 'Tahini', replace_with: ['Greek yogurt + garlic', 'Peanut butter + lemon juice'], why: 'Tahini adds nutty creaminess to the sauce; Greek yogurt gives a similarly creamy dressing.' }],
    'Soak dried chickpeas overnight. Blend chickpeas, onion, parsley, cumin, and salt until a coarse paste forms. Shape into balls and deep fry until golden brown. Serve in pita with tahini sauce, vegetables, and pickles.',
    'High', 'Medium', 'High', 'Medium', 'Low', 400, '30 min', IMG.falafel,
    'Crispy, herbed chickpea fritters in warm pita bread.', 'Plant-based protein and fiber for sustained energy.'),

  makeMeal('m_med_3', 'Hummus', 'Mediterranean', 'snack', 'chickpea',
    ['all'], ['EG', 'US', 'UK', 'AU', 'DE'],
    [
      { name: 'Chickpeas', amount: '400g canned', available_locally: true },
      { name: 'Tahini', amount: '3 tbsp', available_locally: true },
      { name: 'Lemon', amount: '2 pcs', available_locally: true },
      { name: 'Garlic', amount: '2 cloves', available_locally: true },
      { name: 'Olive oil', amount: '3 tbsp', available_locally: true },
    ],
    [],
    'Drain chickpeas and reserve liquid. Blend chickpeas, tahini, lemon juice, garlic, and salt in a food processor. Add reserved liquid until desired consistency. Drizzle with olive oil and paprika before serving.',
    'Medium', 'Low', 'High', 'Medium', 'Low', 180, '10 min', IMG.falafel,
    'Smooth, creamy chickpea dip with tahini and lemon.', 'Rich in fiber, plant protein, and healthy fats.'),

  makeMeal('m_med_4', 'Shakshuka', 'Mediterranean', 'breakfast', 'egg',
    ['spring', 'autumn', 'all'], ['EG', 'TR', 'US', 'UK'],
    [
      { name: 'Eggs', amount: '4 pcs', available_locally: true },
      { name: 'Tomato', amount: '5 pcs', available_locally: true },
      { name: 'Bell pepper', amount: '1 pc', available_locally: true },
      { name: 'Cumin', amount: '1 tsp', available_locally: true },
      { name: 'Paprika', amount: '1 tsp', available_locally: true },
    ],
    [{ if_missing: 'Feta cheese', replace_with: ['Paneer (crumbled)', 'Mozzarella (diced)'], why: 'Feta adds saltiness and creaminess; crumbled paneer is a close texture match.' }],
    'Sauté onions and bell pepper in olive oil until soft. Add chopped tomatoes, cumin, paprika, and simmer 10 minutes. Make 4 wells in the sauce, crack an egg into each, cover and cook 6-8 minutes until whites set.',
    'High', 'Low', 'Medium', 'Medium', 'Low', 310, '20 min', IMG.shakshuka,
    'Eggs poached in a spiced tomato and pepper sauce.', 'High-protein breakfast that is quick, one-pan, and satisfying.'),

  // --- Thai (4) ---
  makeMeal('m_th_1', 'Pad Thai', 'Thai', 'dinner', 'noodle',
    ['spring', 'summer', 'all'], ['TH', 'US', 'UK', 'AU'],
    [
      { name: 'Rice noodles', amount: '200g', available_locally: true },
      { name: 'Shrimp', amount: '200g', available_locally: true },
      { name: 'Tamarind paste', amount: '2 tbsp', available_locally: false },
      { name: 'Fish sauce', amount: '2 tbsp', available_locally: true },
      { name: 'Bean sprouts', amount: '1 cup', available_locally: true },
      { name: 'Peanuts (crushed)', amount: '1/4 cup', available_locally: true },
    ],
    [{ if_missing: 'Tamarind paste', replace_with: ['Lime juice + brown sugar', 'Rice vinegar + honey'], why: 'Tamarind provides a sweet-sour flavor; lime juice with brown sugar replicates this balance.' }],
    'Soak rice noodles in warm water for 30 minutes. Stir-fry shrimp until pink. Push to side, scramble egg. Add noodles, tamarind sauce, and toss. Add bean sprouts and green onions. Top with crushed peanuts and lime wedge.',
    'High', 'High', 'Medium', 'Medium', 'High', 420, '25 min', IMG.padThai,
    'Thailand\'s most famous noodle dish — sweet, sour, and savory.', 'Balanced meal with protein, carbs, and fresh vegetables.'),

  makeMeal('m_th_2', 'Green Curry', 'Thai', 'dinner', 'chicken',
    ['autumn', 'winter', 'all'], ['TH', 'US', 'UK', 'AU'],
    [
      { name: 'Chicken thigh', amount: '400g', available_locally: true },
      { name: 'Green curry paste', amount: '3 tbsp', available_locally: false },
      { name: 'Coconut milk', amount: '400ml', available_locally: true },
      { name: 'Thai basil', amount: 'leaves', available_locally: false },
      { name: 'Bamboo shoots', amount: '1 cup', available_locally: true },
      { name: 'Fish sauce', amount: '2 tbsp', available_locally: true },
    ],
    [
      { if_missing: 'Green curry paste', replace_with: ['Green chili + garlic + lemongrass + cilantro', 'Thai red curry paste'], why: 'Green curry paste gets its color from green chilies and cilantro; red paste is spicier but still delicious.' },
      { if_missing: 'Thai basil', replace_with: ['Regular basil', 'Mint'], why: 'Thai basil has an anise-like flavor; regular basil or mint provide fresh herbal notes.' },
    ],
    'Fry green curry paste in coconut cream until fragrant. Add chicken and cook until sealed. Add remaining coconut milk, bamboo shoots, and simmer 15 minutes. Season with fish sauce and sugar. Add Thai basil before serving with rice.',
    'High', 'Low', 'Medium', 'High', 'Low', 450, '30 min', IMG.thaiCurry,
    'Aromatic Thai green curry with tender chicken in creamy coconut sauce.', 'Anti-inflammatory properties from galangal and lemongrass.'),

  makeMeal('m_th_3', 'Tom Yum Soup', 'Thai', 'lunch', 'shrimp',
    ['winter', 'monsoon', 'all'], ['TH', 'US', 'UK', 'AU'],
    [
      { name: 'Shrimp', amount: '300g', available_locally: true },
      { name: 'Lemongrass', amount: '2 stalks', available_locally: true },
      { name: 'Galangal', amount: '1 inch', available_locally: false },
      { name: 'Kaffir lime leaves', amount: '4 pcs', available_locally: false },
      { name: 'Mushrooms', amount: '200g', available_locally: true },
      { name: 'Chili paste', amount: '2 tbsp', available_locally: true },
    ],
    [
      { if_missing: 'Galangal', replace_with: ['Ginger', 'Skip'], why: 'Galangal is more floral and less spicy than ginger; ginger provides a different but pleasant warmth.' },
      { if_missing: 'Kaffir lime leaves', replace_with: ['Lime zest + bay leaf', 'Lemon zest'], why: 'Kaffir lime leaves have a distinct citrus flavor; lime zest with bay leaf approximates the aroma.' },
    ],
    'Boil water with lemongrass, galangal, and lime leaves for 5 minutes. Add mushrooms and simmer. Add shrimp and cook until pink. Stir in chili paste, fish sauce, and lime juice. Serve hot with fresh cilantro.',
    'High', 'Low', 'Low', 'Low', 'Low', 200, '20 min', IMG.thaiCurry,
    'Hot and sour Thai soup with shrimp and aromatic herbs.', 'Low-calorie, immune-boosting soup with anti-inflammatory herbs.'),

  makeMeal('m_th_4', 'Mango Sticky Rice', 'Thai', 'snack', 'rice',
    ['summer', 'spring'], ['TH', 'US', 'UK', 'AU'],
    [
      { name: 'Sticky rice', amount: '1 cup', available_locally: false },
      { name: 'Mango (ripe)', amount: '2 pcs', available_locally: true },
      { name: 'Coconut milk', amount: '1 cup', available_locally: true },
      { name: 'Sugar', amount: '1/2 cup', available_locally: true },
      { name: 'Salt', amount: 'a pinch', available_locally: true },
    ],
    [{ if_missing: 'Sticky rice', replace_with: ['Jasmine rice', 'Sushi rice'], why: 'Sticky rice has a unique chewy texture; jasmine rice is less sticky but still works in a pinch.' }],
    'Soak sticky rice for 4 hours or overnight. Steam rice until tender, about 20 minutes. Warm coconut milk with sugar and salt until dissolved. Pour half over the rice and let absorb 15 minutes. Serve with sliced mango and remaining coconut sauce.',
    'Low', 'High', 'Medium', 'Medium', 'High', 350, '30 min', IMG.mangoLassi,
    'Sweet coconut sticky rice with fresh ripe mango.', 'Vitamin C-rich mango paired with energy-boosting sticky rice.'),

  // --- American (3) ---
  makeMeal('m_us_1', 'Grilled Salmon with Asparagus', 'American', 'dinner', 'fish',
    ['spring', 'summer'], ['US', 'UK', 'AU', 'JP'],
    [
      { name: 'Salmon fillet', amount: '200g', available_locally: true },
      { name: 'Asparagus', amount: '200g', available_locally: true },
      { name: 'Lemon', amount: '1 pc', available_locally: true },
      { name: 'Olive oil', amount: '2 tbsp', available_locally: true },
      { name: 'Garlic', amount: '3 cloves', available_locally: true },
    ],
    [],
    'Season salmon with salt, pepper, and lemon juice. Toss asparagus with olive oil and garlic. Grill salmon 4 minutes per side and asparagus until tender-crisp. Plate together and serve with lemon wedges.',
    'High', 'Low', 'Medium', 'Medium', 'Low', 380, '20 min', IMG.salmon,
    'Perfectly grilled salmon with crisp-tender asparagus.', 'Omega-3 rich, light dinner ideal for warm evenings.'),

  makeMeal('m_us_2', 'Classic Cheeseburger', 'American', 'lunch', 'beef',
    ['summer', 'spring', 'all'], ['US', 'UK', 'AU', 'DE'],
    [
      { name: 'Ground beef', amount: '200g', available_locally: true },
      { name: 'Burger bun', amount: '1 pc', available_locally: true },
      { name: 'Cheddar cheese', amount: '2 slices', available_locally: true },
      { name: 'Lettuce', amount: 'leaves', available_locally: true },
      { name: 'Tomato', amount: '2 slices', available_locally: true },
      { name: 'Pickles', amount: '3 slices', available_locally: true },
    ],
    [],
    'Form beef into a patty, season generously with salt and pepper. Grill or pan-sear 4 minutes per side for medium. Add cheese in the last minute to melt. Assemble bun with lettuce, tomato, patty, cheese, and pickles.',
    'High', 'Medium', 'Low', 'High', 'Low', 520, '15 min', IMG.burger,
    'Juicy cheeseburger with all the classic fixings.', 'High-quality protein and iron from beef.'),

  makeMeal('m_us_3', 'Caesar Salad', 'American', 'lunch', 'chicken',
    ['spring', 'summer', 'all'], ['US', 'UK', 'AU', 'CA'],
    [
      { name: 'Romaine lettuce', amount: '1 head', available_locally: true },
      { name: 'Grilled chicken', amount: '200g', available_locally: true },
      { name: 'Parmesan', amount: '1/2 cup shaved', available_locally: true },
      { name: 'Croutons', amount: '1 cup', available_locally: true },
      { name: 'Caesar dressing', amount: '3 tbsp', available_locally: true },
      { name: 'Lemon', amount: '1 pc', available_locally: true },
    ],
    [],
    'Grill chicken breast until cooked through, let rest, slice. Chop romaine lettuce. Toss with Caesar dressing, croutons, and shaved parmesan. Top with sliced chicken and extra parmesan.',
    'High', 'Low', 'Medium', 'Medium', 'Low', 340, '15 min', IMG.caesar,
    'Crisp romaine with grilled chicken, parmesan, and crunchy croutons.', 'High-protein salad with calcium from parmesan.'),

  // --- French (3) ---
  makeMeal('m_fr_1', 'Ratatouille', 'French', 'dinner', 'vegetable',
    ['summer', 'autumn'], ['FR', 'US', 'UK', 'AU'],
    [
      { name: 'Eggplant', amount: '1 pc', available_locally: true },
      { name: 'Zucchini', amount: '2 pcs', available_locally: true },
      { name: 'Tomato', amount: '4 pcs', available_locally: true },
      { name: 'Bell pepper', amount: '2 pcs', available_locally: true },
      { name: 'Herbes de Provence', amount: '2 tsp', available_locally: false },
      { name: 'Olive oil', amount: '4 tbsp', available_locally: true },
    ],
    [{ if_missing: 'Herbes de Provence', replace_with: ['Thyme + rosemary + oregano', 'Italian seasoning'], why: 'Herbes de Provence is a blend of dried herbs; thyme, rosemary, and oregano cover the main notes.' }],
    'Dice all vegetables into uniform cubes. Sauté onion and garlic in olive oil. Add each vegetable in order of hardness: eggplant, bell pepper, zucchini, tomatoes. Add herbs and simmer 30 minutes. Serve warm or at room temperature.',
    'Low', 'Medium', 'High', 'Medium', 'Medium', 210, '45 min', IMG.ratatouille,
    'A rustic Provençal vegetable stew bursting with summer flavors.', 'High in fiber and vitamins from a variety of colorful vegetables.'),

  makeMeal('m_fr_2', 'French Onion Soup', 'French', 'dinner', 'vegetable',
    ['winter', 'autumn'], ['FR', 'US', 'UK', 'CA'],
    [
      { name: 'Onion', amount: '6 pcs', available_locally: true },
      { name: 'Butter', amount: '3 tbsp', available_locally: true },
      { name: 'Beef broth', amount: '4 cups', available_locally: true },
      { name: 'Gruyère cheese', amount: '200g', available_locally: false },
      { name: 'Baguette', amount: '4 slices', available_locally: true },
      { name: 'Thyme', amount: 'sprigs', available_locally: true },
    ],
    [{ if_missing: 'Gruyère cheese', replace_with: ['Swiss cheese', 'Provolone'], why: 'Gruyère melts beautifully and has a nutty flavor; Swiss cheese has similar melting properties.' }],
    'Slice onions thinly. Caramelize in butter over low heat for 40 minutes until deep golden brown. Add broth and thyme, simmer 20 minutes. Ladle into oven-safe bowls, top with baguette slice and grated Gruyère. Broil until bubbly and golden.',
    'Medium', 'Medium', 'Low', 'Medium', 'Low', 340, '60 min', IMG.soup,
    'Rich caramelized onion soup with a bubbly cheese crust.', 'Mineral-rich broth with bone health-supporting nutrients.'),

  makeMeal('m_fr_3', 'Crêpes', 'French', 'breakfast', 'egg',
    ['spring', 'summer', 'all'], ['FR', 'US', 'UK', 'AU'],
    [
      { name: 'Flour', amount: '1 cup', available_locally: true },
      { name: 'Egg', amount: '2 pcs', available_locally: true },
      { name: 'Milk', amount: '1.5 cups', available_locally: true },
      { name: 'Butter', amount: '2 tbsp melted', available_locally: true },
      { name: 'Sugar', amount: '1 tbsp', available_locally: true },
      { name: 'Vanilla extract', amount: '1 tsp', available_locally: true },
    ],
    [],
    'Whisk flour, eggs, milk, melted butter, sugar, and vanilla until smooth. Rest batter 30 minutes. Heat a non-stick pan, pour a thin layer of batter, swirl to coat. Cook 1 minute per side until lightly golden. Fill with Nutella, fruit, or lemon sugar.',
    'Medium', 'High', 'Low', 'Medium', 'High', 280, '20 min', IMG.crepe,
    'Thin, delicate French pancakes that can be filled with anything.', 'Versatile breakfast base that can be made sweet or savory.'),

  // --- More variety ---
  makeMeal('m_extra_1', 'Chickpea & Avocado Bowl', 'Mediterranean', 'lunch', 'chickpea',
    ['spring', 'summer', 'all'], ['US', 'UK', 'AU', 'MX', 'EG'],
    [
      { name: 'Chickpeas (canned)', amount: '400g', available_locally: true },
      { name: 'Avocado', amount: '1 pc', available_locally: true },
      { name: 'Cherry tomatoes', amount: '200g', available_locally: true },
      { name: 'Cucumber', amount: '1 pc', available_locally: true },
      { name: 'Tahini', amount: '2 tbsp', available_locally: false },
    ],
    [{ if_missing: 'Tahini', replace_with: ['Greek yogurt + garlic', 'Peanut butter + lemon juice'], why: 'Tahini adds nutty creaminess; Greek yogurt gives a similarly creamy dressing.' }],
    'Drain and rinse chickpeas. Dice avocado, tomatoes, and cucumber. Whisk tahini (or substitute) with lemon juice, water, and salt. Combine all ingredients, drizzle dressing, and toss gently.',
    'High', 'Medium', 'High', 'Medium', 'Low', 360, '10 min', IMG.salad,
    'Fresh, creamy bowl with chickpeas, avocado, and crunchy vegetables.', 'High-fiber, plant-based protein ideal for warm days.'),

  makeMeal('m_extra_2', 'Oatmeal with Fruits', 'American', 'breakfast', 'oat',
    ['winter', 'autumn', 'all'], ['US', 'UK', 'AU', 'JP'],
    [
      { name: 'Rolled oats', amount: '1 cup', available_locally: true },
      { name: 'Banana', amount: '1 pc', available_locally: true },
      { name: 'Blueberries', amount: '1/2 cup', available_locally: true },
      { name: 'Honey', amount: '1 tbsp', available_locally: true },
      { name: 'Cinnamon', amount: '1/2 tsp', available_locally: true },
    ],
    [],
    'Bring milk and water to a boil. Add oats, reduce heat, and simmer 5 minutes stirring occasionally. Slice banana on top, add blueberries, drizzle honey, and sprinkle cinnamon.',
    'Medium', 'High', 'High', 'Low', 'High', 290, '10 min', IMG.porridge,
    'Warm, hearty oatmeal topped with fresh fruits and honey.', 'High-fiber breakfast providing sustained energy for the morning.'),

  makeMeal('m_extra_3', 'Tofu Bibimbap', 'Korean', 'lunch', 'tofu',
    ['spring', 'summer', 'all'], ['KR', 'US', 'UK'],
    [
      { name: 'Rice', amount: '1 cup', available_locally: true },
      { name: 'Firm tofu', amount: '200g', available_locally: true },
      { name: 'Spinach', amount: '100g', available_locally: true },
      { name: 'Carrot', amount: '1 pc', available_locally: true },
      { name: 'Gochujang', amount: '2 tbsp', available_locally: false },
    ],
    [{ if_missing: 'Gochujang', replace_with: ['Sriracha + miso', 'Chili paste + honey'], why: 'Gochujang is a fermented chili paste; sriracha with miso creates a similar sweet-spicy-umami flavor.' }],
    'Press and cube tofu, pan-fry until golden. Cook rice. Sauté spinach and carrots separately. Assemble bowl: rice, tofu, vegetables. Serve with gochujang sauce and sesame seeds.',
    'Medium', 'High', 'Medium', 'Medium', 'Low', 370, '25 min', IMG.tofuBowl,
    'A plant-based take on the classic Korean rice bowl.', 'Complete plant protein from tofu and rice.'),

  makeMeal('m_extra_4', 'Vegetable Stir-fry', 'Chinese', 'dinner', 'vegetable',
    ['all'], ['CN', 'US', 'UK', 'AU'],
    [
      { name: 'Broccoli', amount: '200g', available_locally: true },
      { name: 'Bell pepper', amount: '2 pcs', available_locally: true },
      { name: 'Snow peas', amount: '150g', available_locally: true },
      { name: 'Garlic', amount: '4 cloves', available_locally: true },
      { name: 'Soy sauce', amount: '2 tbsp', available_locally: true },
      { name: 'Sesame oil', amount: '1 tbsp', available_locally: true },
    ],
    [],
    'Heat wok until smoking. Add oil, then garlic. Add vegetables in order of hardness: broccoli first, then bell pepper, then snow peas. Stir-fry 3-4 minutes until crisp-tender. Add soy sauce and sesame oil. Toss and serve immediately.',
    'Low', 'Medium', 'High', 'Low', 'Medium', 160, '15 min', IMG.kungPao,
    'Quick, colorful vegetable stir-fry with garlic and soy sauce.', 'Low-calorie meal packed with vitamins and antioxidants.'),
];

export function getMealById(id: string): Meal | undefined {
  return MOCK_MEALS.find(m => m.id === id);
}

export function searchMeals(query: string): Meal[] {
  const q = query.toLowerCase();
  return MOCK_MEALS.filter(m =>
    m.name.toLowerCase().includes(q) ||
    m.cuisine_origin.toLowerCase().includes(q) ||
    m.ingredients.some(i => i.name.toLowerCase().includes(q))
  );
}

function getSeasonIndex(): number {
  const m = new Date().getMonth() + 1;
  if (m >= 3 && m <= 5) return 0; // spring
  if (m >= 6 && m <= 8) return 1; // summer
  if (m >= 9 && m <= 11) return 2; // autumn
  return 3; // winter
}

const SEASON_KEYS: Season[] = ['spring', 'summer', 'autumn', 'winter'];

function getSeason(): Season {
  return SEASON_KEYS[getSeasonIndex()];
}

export const MOCK_WEATHERS: WeatherContext[] = [
  { condition: 'stable', temp_c: 22, humidity: 55, season: getSeason(), hydration_target_ml: 2200, daily_steps: 6500, step_goal: 8000, activity_level: 'moderate' },
  { condition: 'stable', temp_c: 28, humidity: 65, season: getSeason(), hydration_target_ml: 2500, daily_steps: 7200, step_goal: 8000, activity_level: 'moderate' },
  { condition: 'heatwave', temp_c: 35, humidity: 40, season: getSeason(), hydration_target_ml: 3500, daily_steps: 4200, step_goal: 6000, activity_level: 'low' },
  { condition: 'cold', temp_c: 8, humidity: 70, season: getSeason(), hydration_target_ml: 1800, daily_steps: 5100, step_goal: 8000, activity_level: 'low' },
  { condition: 'rain', temp_c: 18, humidity: 85, season: getSeason(), hydration_target_ml: 2000, daily_steps: 3800, step_goal: 8000, activity_level: 'low' },
  { condition: 'monsoon', temp_c: 30, humidity: 90, season: 'monsoon', hydration_target_ml: 2800, daily_steps: 4500, step_goal: 7000, activity_level: 'low' },
];

export const MOCK_RESTAURANTS = [
  { id: 'r_1', name: 'Taj Mahal Bistro', place_id: 'r_1', cuisine: 'Indian', address: '123 Curry St, Downtown', lat: 40.7128, lon: -74.006, distance_km: 1.2, travel_time_min: 5, rating: 4.5, reviews: 234, image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=800&fit=crop', open_now: true, opening_hours: '10:00-22:00', price_level: 2 },
  { id: 'r_2', name: 'Sakura Ramen House', place_id: 'r_2', cuisine: 'Japanese', address: '456 Noodle Ave, Midtown', lat: 40.714, lon: -74.008, distance_km: 0.8, travel_time_min: 3, rating: 4.7, reviews: 189, image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=800&fit=crop', open_now: true, opening_hours: '11:00-23:00', price_level: 2 },
  { id: 'r_3', name: 'Seoul BBQ Grill', place_id: 'r_3', cuisine: 'Korean', address: '789 Bulgogi Blvd, K-Town', lat: 40.718, lon: -74.003, distance_km: 1.5, travel_time_min: 6, rating: 4.3, reviews: 312, image_url: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=800&h=800&fit=crop', open_now: true, opening_hours: '12:00-23:00', price_level: 3 },
  { id: 'r_4', name: 'Golden Dragon Chinese', place_id: 'r_4', cuisine: 'Chinese', address: '321 Dragon Ln, Chinatown', lat: 40.716, lon: -74.001, distance_km: 0.5, travel_time_min: 2, rating: 4.2, reviews: 456, image_url: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&h=800&fit=crop', open_now: true, opening_hours: '10:00-22:30', price_level: 2 },
  { id: 'r_5', name: 'Pizza Napoli', place_id: 'r_5', cuisine: 'Italian', address: '567 Pasta St, Little Italy', lat: 40.72, lon: -74.004, distance_km: 1.8, travel_time_min: 7, rating: 4.6, reviews: 198, image_url: 'https://images.unsplash.com/photo-1578474846511-04ba529f0b88?w=800&h=800&fit=crop', open_now: false, opening_hours: '17:00-23:00', price_level: 3 },
  { id: 'r_6', name: 'Le Petit Café', place_id: 'r_6', cuisine: 'French', address: '890 Rue St, Arts District', lat: 40.71, lon: -74.01, distance_km: 2.1, travel_time_min: 8, rating: 4.8, reviews: 145, image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=800&fit=crop', open_now: true, opening_hours: '08:00-21:00', price_level: 4 },
  { id: 'r_7', name: 'Mediterranean Grill', place_id: 'r_7', cuisine: 'Mediterranean', address: '432 Olive Way, East Side', lat: 40.715, lon: -74.002, distance_km: 1.0, travel_time_min: 4, rating: 4.4, reviews: 267, image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=800&fit=crop', open_now: true, opening_hours: '11:00-22:00', price_level: 2 },
  { id: 'r_8', name: 'Thai Orchid', place_id: 'r_8', cuisine: 'Thai', address: '654 Spice Rd, Uptown', lat: 40.722, lon: -74.007, distance_km: 2.5, travel_time_min: 9, rating: 4.5, reviews: 178, image_url: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=800&h=800&fit=crop', open_now: true, opening_hours: '11:00-22:00', price_level: 2 },
  { id: 'r_9', name: 'Americana Diner', place_id: 'r_9', cuisine: 'American', address: '987 Burger Ave, Westside', lat: 40.718, lon: -74.012, distance_km: 3.0, travel_time_min: 10, rating: 4.1, reviews: 523, image_url: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&h=800&fit=crop', open_now: true, opening_hours: '06:00-23:00', price_level: 1 },
  { id: 'r_10', name: 'El Mariachi Tacos', place_id: 'r_10', cuisine: 'Mexican', address: '246 Salsa St, Market District', lat: 40.713, lon: -74.005, distance_km: 0.6, travel_time_min: 2, rating: 4.3, reviews: 345, image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c7?w=800&h=800&fit=crop', open_now: true, opening_hours: '09:00-23:00', price_level: 1 },
];

export function getMockWeather(lat?: number, lon?: number): WeatherContext {
  if (lat !== undefined && lon !== undefined) {
    if (lat > 0 && lat < 30 && lon > 70 && lon < 100) return MOCK_WEATHERS[5]; // monsoon
    if (Math.abs(lat) > 40) return MOCK_WEATHERS[3]; // cold
    if (lat > 30 && lat < 40) return MOCK_WEATHERS[4]; // rain
  }
  return MOCK_WEATHERS[1];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const SEASONAL_PICKS: Record<string, { image_url: string; benefit: string }> = {
  Apple: { image_url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800&h=800&fit=crop', benefit: 'Rich in fiber and vitamin C for immune health.' },
  Mango: { image_url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&h=800&fit=crop', benefit: 'Packed with vitamin A for healthy vision and skin.' },
  Watermelon: { image_url: 'https://images.unsplash.com/photo-1563114773-84221b62d575?w=800&h=800&fit=crop', benefit: 'Hydrating and rich in lycopene for heart health.' },
  Strawberry: { image_url: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=800&h=800&fit=crop', benefit: 'High in antioxidants and vitamin C.' },
  Kiwi: { image_url: 'https://images.unsplash.com/photo-1585059895524-72359a06133a?w=800&h=800&fit=crop', benefit: 'More vitamin C than an orange, aids digestion.' },
  Pineapple: { image_url: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=800&h=800&fit=crop', benefit: 'Contains bromelain for digestion and anti-inflammation.' },
  Orange: { image_url: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=800&h=800&fit=crop', benefit: 'Immune-boosting vitamin C and hydration.' },
  Pomegranate: { image_url: 'https://images.unsplash.com/photo-1541344999736-83eca272f6fc?w=800&h=800&fit=crop', benefit: 'Rich in antioxidants for heart and brain health.' },
  Papaya: { image_url: 'https://images.unsplash.com/photo-1615485925767-84f9ac594910?w=800&h=800&fit=crop', benefit: 'Enzyme-rich fruit that aids digestion.' },
  Blueberry: { image_url: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=800&h=800&fit=crop', benefit: 'Brain-boosting antioxidants and fiber.' },
};

export function getSeasonalPicks() {
  const season = getSeason();
  const seasonFruits: Record<string, string[]> = {
    spring: ['Strawberry', 'Papaya', 'Pineapple', 'Kiwi'],
    summer: ['Mango', 'Watermelon', 'Pineapple', 'Blueberry'],
    autumn: ['Apple', 'Pomegranate', 'Orange', 'Kiwi'],
    winter: ['Orange', 'Pomegranate', 'Apple', 'Kiwi'],
    monsoon: ['Apple', 'Pomegranate', 'Papaya', 'Orange'],
  };
  const fruits = seasonFruits[season] ?? seasonFruits.summer;
  return fruits.map(name => ({
    name,
    ...(SEASONAL_PICKS[name] || { image_url: '', benefit: 'Seasonal fruit packed with nutrients.' }),
    season,
  }));
}

function pickRestaurantsForMeal(meal: Meal): Restaurant[] {
  const cuisineMatch = MOCK_RESTAURANTS.filter(r =>
    r.cuisine.toLowerCase() === meal.cuisine_origin.toLowerCase() ||
    meal.cuisine_origin === 'Bangladeshi' && r.cuisine === 'Indian' ||
    meal.cuisine_origin === 'Indian' && ['Indian', 'Bangladeshi'].includes(r.cuisine)
  );
  return cuisineMatch.slice(0, 4).map(r => ({
    ...r, lat: r.lat, lon: r.lon,
    travel_walking_min: Math.round(r.distance_km * 12),
    travel_cycling_min: Math.round(r.distance_km * 4),
  }));
}

export function buildMockRecommendation(userId: string, lat?: number, lon?: number): RecommendationResponse {
  const weather = getMockWeather(lat, lon);
  const season = weather.season;
  const steps = weather.daily_steps || 6000;
  const activityLevel = weather.activity_level || 'moderate';
  const filtered = MOCK_MEALS.filter(m => m.season_tags.includes(season) || m.season_tags.includes('all'));
  const pool = filtered.length >= 3 ? filtered : MOCK_MEALS;

  const shuffled = shuffle(pool);

  let primary = shuffled[0];
  const alternatives = shuffled.slice(1, 7);

  // Activity-aware recommendation: high steps → higher protein meals
  if (steps > 8000) {
    const highProtein = pool.filter(m => m.protein_level === 'High');
    if (highProtein.length > 0) primary = highProtein[Math.floor(Math.random() * highProtein.length)];
  } else if (weather.condition === 'heatwave' || weather.condition === 'monsoon') {
    const lightMeals = pool.filter(m => m.calories <= 350);
    if (lightMeals.length > 0) primary = lightMeals[Math.floor(Math.random() * lightMeals.length)];
  }

  if (primary.reason) {
    const activityNote = steps > 8000
      ? ' With your high activity today, this protein-rich meal supports muscle recovery.'
      : weather.condition === 'heatwave'
        ? ' Light meals help you stay cool in this heat.'
        : '';
    if (!primary.reason.endsWith(activityNote) && activityNote) {
      primary = { ...primary, reason: primary.reason + activityNote };
    }
  }

  const seasonalPicks = getSeasonalPicks();

  const tips: string[] = [
    'Add a handful of leafy greens to your meals for extra fiber and vitamins.',
    'Drink a glass of water 15 minutes before meals to aid digestion.',
    'Seasonal fruits are at their nutritional peak — include them in your diet.',
    'Chew slowly and mindfully to improve digestion and satisfaction.',
    'Try to include at least three different colors on your plate at each meal.',
    'Herbal teas like ginger or peppermint can aid digestion after meals.',
  ];

  const restaurants = pickRestaurantsForMeal(primary);

  return {
    primary, alternatives, weather,
    healthTip: tips[Math.floor(Math.random() * tips.length)],
    seasonalPicks,
    restaurants,
  };
}

const MEAL_TYPES: JournalEntry['mealType'][] = ['breakfast', 'lunch', 'dinner', 'snack'];

export function generateMockHistory(userId: string): JournalEntry[] {
  const entries: JournalEntry[] = [];
  const now = new Date();

  for (let day = 6; day >= 0; day--) {
    const date = new Date(now);
    date.setDate(date.getDate() - day);
    const mealsForDay = day === 0 ? ['breakfast', 'lunch'] as JournalEntry['mealType'][] : MEAL_TYPES;

    for (const mealType of mealsForDay) {
      const available = MOCK_MEALS.filter(m => m.meal_type === mealType || Math.random() > 0.5);
      if (available.length === 0) continue;
      const meal = available[Math.floor(Math.random() * available.length)];
      const eatenAt = new Date(date);
      eatenAt.setHours(
        mealType === 'breakfast' ? 8 + Math.floor(Math.random() * 2) :
        mealType === 'lunch' ? 12 + Math.floor(Math.random() * 2) :
        mealType === 'dinner' ? 19 + Math.floor(Math.random() * 2) :
        15 + Math.floor(Math.random() * 3),
        Math.floor(Math.random() * 60)
      );

      entries.push({
        id: `mock_${day}_${mealType}`,
        userId,
        mealId: meal.id,
        mealName: meal.name,
        mealType,
        proteinLevel: meal.protein_level,
        carbsLevel: meal.carbs_level,
        fiberLevel: meal.fiber_level,
        proteinTag: meal.protein_tag,
        calories: meal.calories,
        eatenAt: eatenAt.toISOString(),
        source: Math.random() > 0.5 ? 'primary' : 'alternative',
      });
    }
  }
  return entries;
}

const NOTIFICATION_TEMPLATES: { type: string; icon: string; templates: string[] }[] = [
  { type: 'meal_reminder', icon: '⏰', templates: ['Time for {meal}!', 'Ready for {meal}?', 'Don\'t skip {meal} today!'] },
  { type: 'water', icon: '💧', templates: ['Stay hydrated: {ml}ml recommended today.', 'Time for a glass of water!'] },
  { type: 'weather', icon: '🌤️', templates: ['{temp}°C today — light meals recommended.', 'Weather update: {condition}. Plan your meals accordingly.'] },
  { type: 'nutrition', icon: '🥗', templates: ['Low fiber this week — add lentils or greens.', 'Great protein variety this week!'] },
  { type: 'achievement', icon: '🎉', templates: ['All meals logged today! Great job!', '7-day streak! Keep it up!'] },
];

export function mockCheckNotifications(): { id: string; type: string; icon: string; title: string; message: string; time: string; read: boolean }[] {
  const notifs: { id: string; type: string; icon: string; title: string; message: string; time: string; read: boolean }[] = [];
  const now = new Date();

  const addNotif = (type: string, icon: string, title: string, message: string, hoursAgo: number) => {
    const t = new Date(now);
    t.setHours(t.getHours() - hoursAgo);
    notifs.push({
      id: `notif_${notifs.length}`, type, icon, title, message,
      time: t.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      read: hoursAgo > 4,
    });
  };

  const hour = now.getHours();
  if (hour < 10) addNotif('meal_reminder', '⏰', 'Breakfast time', 'Start your day with a nutritious breakfast.', 0);
  else if (hour < 14) addNotif('meal_reminder', '⏰', 'Lunch time', 'Fuel up for the afternoon.', 1);
  else if (hour < 20) addNotif('meal_reminder', '⏰', 'Dinner time', 'Wind down with a satisfying meal.', 2);

  const weather = getMockWeather();
  addNotif('water', '💧', 'Stay hydrated', 'Keep sipping water throughout the day for optimal health.', 4);
  addNotif('weather', '🌤️', `Today: ${weather.condition}`, `${weather.temp_c.toFixed(0)}°C with ${weather.condition} conditions.`, 5);
  addNotif('nutrition', '🥗', 'Nutrition tip', 'Your fiber intake has been good this week. Keep it up!', 6);

  return notifs;
}

const SCAN_RESULTS: Record<string, {
  name: string; protein: NutritionLevel; carbs: NutritionLevel; fiber: NutritionLevel;
  fat: NutritionLevel; sugar: NutritionLevel; calories: number; category: string;
  guidance: string; foods: DetectedFood[];
}> = {
  default: {
    name: 'Home-cooked meal', protein: 'Medium', carbs: 'Medium', fiber: 'Medium', fat: 'Medium', sugar: 'Low', calories: 300, category: 'Mixed Dish',
    guidance: 'A balanced home-cooked meal with good nutritional variety. Add vegetables for more fiber.',
    foods: [
      { name: 'Rice', confidence: 92, calories: 150, protein_level: 'Low', carbs_level: 'High', fat_level: 'Low', fiber_level: 'Low', serving_size: '1 cup', food_category: 'Grain' },
      { name: 'Mixed Vegetable Curry', confidence: 85, calories: 120, protein_level: 'Medium', carbs_level: 'Medium', fat_level: 'Medium', fiber_level: 'High', serving_size: '1 serving', food_category: 'Curry' },
    ],
  },
  rice: {
    name: 'Rice and Curry', protein: 'Medium', carbs: 'High', fiber: 'Low', fat: 'Medium', sugar: 'Low', calories: 450, category: 'Mixed Dish',
    guidance: 'A hearty rice-based meal. Add a side of vegetables for more fiber and nutrients.',
    foods: [
      { name: 'Steamed Rice', confidence: 95, calories: 200, protein_level: 'Low', carbs_level: 'High', fat_level: 'Low', fiber_level: 'Low', serving_size: '1.5 cups', food_category: 'Grain' },
      { name: 'Chicken Curry', confidence: 88, calories: 250, protein_level: 'High', carbs_level: 'Low', fat_level: 'Medium', fiber_level: 'Low', serving_size: '1 serving', food_category: 'Meat Dish' },
    ],
  },
  salad: {
    name: 'Fresh Garden Salad', protein: 'Low', carbs: 'Low', fiber: 'High', fat: 'Low', sugar: 'Low', calories: 180, category: 'Salad',
    guidance: 'A fresh, low-calorie salad. Add grilled chicken or chickpeas for protein.',
    foods: [
      { name: 'Mixed Greens', confidence: 90, calories: 30, protein_level: 'Low', carbs_level: 'Low', fat_level: 'Low', fiber_level: 'Medium', serving_size: '2 cups', food_category: 'Vegetable' },
      { name: 'Cherry Tomatoes', confidence: 87, calories: 25, protein_level: 'Low', carbs_level: 'Low', fat_level: 'Low', fiber_level: 'Low', serving_size: '5 pieces', food_category: 'Vegetable' },
      { name: 'Cucumber', confidence: 83, calories: 15, protein_level: 'Low', carbs_level: 'Low', fat_level: 'Low', fiber_level: 'Low', serving_size: '1/2 cup', food_category: 'Vegetable' },
    ],
  },
  soup: {
    name: 'Vegetable Soup', protein: 'Low', carbs: 'Medium', fiber: 'High', fat: 'Low', sugar: 'Low', calories: 200, category: 'Soup',
    guidance: 'A warming, nutrient-rich soup that supports hydration and digestion.',
    foods: [
      { name: 'Vegetable Broth Soup', confidence: 91, calories: 180, protein_level: 'Low', carbs_level: 'Medium', fat_level: 'Low', fiber_level: 'High', serving_size: '1 bowl', food_category: 'Soup' },
    ],
  },
};

export function mockIdentify(imageBase64: string): ScanResult {
  const keys = Object.keys(SCAN_RESULTS);
  const key = keys[Math.floor(Math.random() * keys.length)];
  const result = SCAN_RESULTS[key];
  return {
    name: result.name,
    protein_level: result.protein,
    carbs_level: result.carbs,
    fiber_level: result.fiber,
    fat_level: result.fat,
    sugar_level: result.sugar,
    calories: result.calories,
    confidence: Math.round((78 + Math.random() * 18) * 10) / 10,
    guidance: result.guidance,
    food_category: result.category,
    serving_size: '1 serving',
    similar_foods: ['Rice bowl', 'Mixed curry', 'Grilled protein'],
    multiple_foods: result.foods.map(f => ({
      ...f,
      confidence: Math.round((f.confidence - 3 + Math.random() * 6) * 10) / 10,
    })),
  };
}
