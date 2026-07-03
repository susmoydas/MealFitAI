-- ============================================================
-- MealFit AI — Production Seed Data
-- 10 globally diverse meals with real images + YouTube videos
-- ============================================================

-- ------------------------------------------------------------
-- MEALS
-- Each meal has: real Unsplash image, real YouTube video ID,
-- complete nutrition levels, calorie estimate
-- ------------------------------------------------------------
INSERT INTO meals (id, name, cuisine_origin, meal_type, protein_tag, season_tags, availability_countries, ingredients_json, recipe_text, video_query, video_id, protein_level, carbs_level, fiber_level, fat_level, calories, image_url) VALUES

('meal_ilish',
 'Ilish Bhapa (Steamed Hilsa in Mustard Sauce)',
 'Bangladeshi', 'lunch', 'fish',
 '["monsoon","summer"]',
 '["BD","IN"]',
 '[{"name":"Hilsa fish (Ilish)","amount":"4 pieces","available_locally":true},{"name":"Mustard seeds","amount":"3 tbsp","available_locally":true},{"name":"Mustard oil","amount":"4 tbsp","available_locally":true},{"name":"Green chili","amount":"4 pieces","available_locally":true},{"name":"Turmeric powder","amount":"1 tsp","available_locally":true},{"name":"Coconut milk","amount":"2 tbsp","available_locally":false}]',
 'Soak mustard seeds and grind into a smooth paste with green chili. Mix paste with mustard oil, turmeric, and salt. Coat hilsa pieces and marinate 15 minutes. Place in a steel bowl, cover tightly with foil, and steam 20-25 minutes until fish is cooked. Serve hot with steamed rice.',
 'ilish bhapa recipe', 'QZuF8ysCw-k',
 'High', 'Low', 'Low', 'Medium', 380,
 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=1200&h=1200&fit=crop'),

('meal_dal',
 'Masoor Dal (Red Lentil Curry)',
 'Indian', 'dinner', 'lentil',
 '["winter","monsoon","all"]',
 '["IN","BD","PK"]',
 '[{"name":"Red lentils (masoor)","amount":"200g","available_locally":true},{"name":"Ghee","amount":"2 tbsp","available_locally":true},{"name":"Cumin seeds","amount":"1 tsp","available_locally":true},{"name":"Turmeric powder","amount":"1/2 tsp","available_locally":true},{"name":"Tomato","amount":"2 pieces","available_locally":true},{"name":"Asafoetida (hing)","amount":"a pinch","available_locally":false}]',
 'Rinse lentils and boil with turmeric and water until soft and mushy, about 20 minutes. In a separate pan, heat ghee and temper cumin seeds until they sizzle, then add chopped tomato and cook until soft. Pour tempering over cooked dal and simmer 5 more minutes. Serve with steamed rice or roti.',
 'masoor dal recipe', '-0RZxSPwIpc',
 'High', 'Medium', 'High', 'Low', 280,
 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=1200&h=1200&fit=crop'),

('meal_chicken_tinga',
 'Chicken Tinga (Smoky Shredded Chicken)',
 'Mexican', 'lunch', 'chicken',
 '["spring","summer","all"]',
 '["MX","US","UK"]',
 '[{"name":"Chicken breast","amount":"500g","available_locally":true},{"name":"Chipotle peppers in adobo","amount":"3 pieces","available_locally":false},{"name":"Roma tomatoes","amount":"4 pieces","available_locally":true},{"name":"White onion","amount":"1 large","available_locally":true},{"name":"Garlic","amount":"3 cloves","available_locally":true},{"name":"Avocado (for topping)","amount":"1 piece","available_locally":true}]',
 'Poach chicken breast in salted water until cooked, shred with two forks. Blend tomatoes, half the onion, garlic, and chipotle into a smooth sauce. Sauté remaining onion, pour in sauce, simmer 10 minutes. Add shredded chicken and simmer 10 more minutes. Serve in tacos or over rice, topped with avocado.',
 'chicken tinga recipe', '7MEH5_C7kUM',
 'High', 'Low', 'Medium', 'Medium', 340,
 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=1200&h=1200&fit=crop'),

('meal_shakshuka',
 'Shakshuka (Eggs Poached in Spiced Tomato Sauce)',
 'North African', 'breakfast', 'egg',
 '["spring","autumn","all"]',
 '["EG","MA","TN","IL","US","UK"]',
 '[{"name":"Eggs","amount":"4 pieces","available_locally":true},{"name":"Ripe tomatoes","amount":"6 pieces","available_locally":true},{"name":"Red bell pepper","amount":"1 piece","available_locally":true},{"name":"Cumin powder","amount":"1 tsp","available_locally":true},{"name":"Paprika","amount":"1 tsp","available_locally":true},{"name":"Harissa paste","amount":"1 tbsp","available_locally":false}]',
 'Sauté chopped onion and red bell pepper until softened. Add chopped tomatoes, cumin, paprika, and harissa paste, simmer until sauce thickens, about 12 minutes. Make wells in sauce and crack an egg into each. Cover and cook on low until whites set but yolks remain runny, 6-8 minutes. Serve with warm flatbread.',
 'shakshuka recipe', '0tFeQsfhE2I',
 'High', 'Low', 'Medium', 'Medium', 320,
 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=1200&h=1200&fit=crop'),

('meal_salmon',
 'Grilled Salmon with Asparagus',
 'American', 'dinner', 'fish',
 '["spring","summer"]',
 '["US","UK","DE","AU","JP"]',
 '[{"name":"Salmon fillet","amount":"200g","available_locally":true},{"name":"Asparagus","amount":"200g","available_locally":true},{"name":"Lemon","amount":"1 piece","available_locally":true},{"name":"Olive oil","amount":"2 tbsp","available_locally":true},{"name":"Garlic","amount":"3 cloves","available_locally":true},{"name":"Fresh dill","amount":"sprigs","available_locally":false}]',
 'Season salmon with salt, pepper, and lemon juice. Toss asparagus with olive oil and garlic. Grill salmon 4 minutes per side and asparagus until tender-crisp. Plate together, garnish with fresh dill or substitute herb, and serve with lemon wedges.',
 'grilled salmon asparagus', 'ky8c7iEVHmM',
 'High', 'Low', 'Medium', 'Medium', 420,
 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=1200&h=1200&fit=crop'),

('meal_khichuri',
 'Bhuna Khichuri (Rice & Lentil Comfort Bowl)',
 'Bangladeshi', 'lunch', 'rice',
 '["monsoon","winter","rain"]',
 '["BD","IN"]',
 '[{"name":"Rice","amount":"1 cup","available_locally":true},{"name":"Moong dal","amount":"1/2 cup","available_locally":true},{"name":"Ghee","amount":"2 tbsp","available_locally":true},{"name":"Cumin seeds","amount":"1 tsp","available_locally":true},{"name":"Ginger","amount":"1 inch","available_locally":true},{"name":"Bay leaves","amount":"2 pieces","available_locally":false}]',
 'Wash rice and dal together. Heat ghee in a pot, add cumin seeds and ginger, sauté. Add rice-dal mixture and stir 2 minutes. Add water, salt, turmeric and cook covered on low heat 20 minutes until soft. Serve with fried eggplant or omelette.',
 'bhuna khichuri recipe', 'Q_6GgxUFOAE',
 'Medium', 'High', 'Medium', 'Low', 350,
 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=1200&h=1200&fit=crop'),

('meal_miso',
 'Miso Soup with Tofu',
 'Japanese', 'breakfast', 'tofu',
 '["winter","spring","all"]',
 '["JP","US","UK","AU","DE"]',
 '[{"name":"Dashi stock","amount":"800ml","available_locally":false},{"name":"Miso paste","amount":"3 tbsp","available_locally":true},{"name":"Silken tofu","amount":"150g","available_locally":true},{"name":"Wakame seaweed","amount":"2 tbsp","available_locally":false},{"name":"Spring onion","amount":"2 stalks","available_locally":true}]',
 'Bring dashi (or substitute stock) to a gentle simmer. Cut tofu into small cubes and add to broth. Remove from heat, stir in miso paste until dissolved. Add rehydrated wakame (or substitute greens). Serve in bowls, garnished with sliced spring onion.',
 'miso soup recipe', 'RjFp2pNUjME',
 'Medium', 'Low', 'Low', 'Low', 160,
 'https://images.unsplash.com/photo-1607301405390-d831c242f59a?w=1200&h=1200&fit=crop'),

('meal_biryani',
 'Chicken Biryani',
 'Indian', 'lunch', 'chicken',
 '["winter","autumn","all"]',
 '["IN","BD","PK","UK","US"]',
 '[{"name":"Chicken","amount":"500g","available_locally":true},{"name":"Basmati rice","amount":"2 cups","available_locally":true},{"name":"Yogurt","amount":"1/2 cup","available_locally":true},{"name":"Biryani masala","amount":"2 tbsp","available_locally":false},{"name":"Saffron","amount":"a pinch","available_locally":false},{"name":"Ghee","amount":"3 tbsp","available_locally":true}]',
 'Marinate chicken with yogurt and masala for 1 hour. Parboil rice with whole spices until 70% cooked. Layer chicken and rice in a heavy pot, sprinkle saffron milk and ghee. Seal the pot with dough and cook on low heat 25 minutes. Let rest 5 minutes before opening.',
 'chicken biryani recipe', 'uDZoZMXjFnI',
 'High', 'High', 'Low', 'High', 550,
 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=1200&h=1200&fit=crop'),

('meal_chickpea_bowl',
 'Chickpea & Avocado Bowl',
 'Mediterranean', 'lunch', 'chickpea',
 '["spring","summer","all"]',
 '["US","UK","DE","AU","MX","EG"]',
 '[{"name":"Chickpeas (canned)","amount":"400g","available_locally":true},{"name":"Avocado","amount":"1 piece","available_locally":true},{"name":"Cherry tomatoes","amount":"200g","available_locally":true},{"name":"Cucumber","amount":"1 piece","available_locally":true},{"name":"Tahini","amount":"2 tbsp","available_locally":false},{"name":"Lemon","amount":"1 piece","available_locally":true}]',
 'Drain and rinse chickpeas. Dice avocado, tomatoes, and cucumber. Whisk tahini (or substitute) with lemon juice, water, and salt for dressing. Combine all ingredients, drizzle dressing, and toss gently. Serve at room temperature.',
 'chickpea avocado bowl', 'UCE3G__UQKQ',
 'High', 'Medium', 'High', 'Medium', 400,
 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&h=1200&fit=crop'),

('meal_porridge',
 'Oatmeal with Banana & Berries',
 'American', 'breakfast', 'oat',
 '["winter","autumn","all"]',
 '["US","UK","DE","AU","JP"]',
 '[{"name":"Rolled oats","amount":"1 cup","available_locally":true},{"name":"Banana","amount":"1 piece","available_locally":true},{"name":"Blueberries","amount":"1/2 cup","available_locally":true},{"name":"Honey","amount":"1 tbsp","available_locally":true},{"name":"Milk","amount":"1 cup","available_locally":true},{"name":"Cinnamon","amount":"1/2 tsp","available_locally":true}]',
 'Bring milk and water to a boil. Add oats, reduce heat, and simmer 5 minutes stirring occasionally. Slice banana on top, add blueberries, drizzle honey, and sprinkle cinnamon. Serve warm.',
 'oatmeal breakfast recipe', 'N_2HqI5HSCA',
 'Medium', 'High', 'High', 'Low', 310,
 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=1200&h=1200&fit=crop');

-- ------------------------------------------------------------
-- INGREDIENT REPLACEMENTS
-- ------------------------------------------------------------
INSERT INTO ingredient_replacements (id, ingredient_name, country, available, substitutes_json, why_substitute) VALUES

('ing_coconut_milk_bd', 'Coconut milk', 'BD', 0,
 '["Thick yogurt diluted with water","Cashew paste mixed with water"]',
 'Coconut milk is imported and pricey in most BD markets; yogurt or cashew paste gives a similar creamy base.'),

('ing_chipotle_bd', 'Chipotle peppers in adobo', 'BD', 0,
 '["Smoked dried red chili + tomato paste + brown sugar","Regular dried red chili + 1/2 tsp smoked paprika"]',
 'Recreates smoky, sweet heat of chipotle using pantry staples available in Bangladeshi kitchens.'),

('ing_chipotle_in', 'Chipotle peppers in adobo', 'IN', 0,
 '["Kashmiri red chili powder + smoked paprika + tamarind pulp"]',
 'Kashmiri chili adds color without excess heat; smoked paprika replicates smokiness; tamarind adds tang.'),

('ing_asafoetida_de', 'Asafoetida (hing)', 'DE', 0,
 '["Finely minced garlic + onion sauté (larger quantity)"]',
 'Hing is rarely stocked in German stores; a stronger garlic-onion base approximates its savory depth.'),

('ing_wakame_bd', 'Wakame seaweed', 'BD', 0,
 '["Finely shredded spinach","Bottle gourd (lau) leaves"]',
 'Provides similar tender, mineral leafy texture when seaweed is not available.'),

('ing_wakame_de', 'Wakame seaweed', 'DE', 0,
 '["Baby spinach, added in last minute of cooking"]',
 'Closest easily-sourced substitute in German supermarkets for soft leafy texture.'),

('ing_harissa_bd', 'Harissa paste', 'BD', 0,
 '["Red chili paste + roasted garlic + cumin + coriander + vinegar"]',
 'Combines pantry spices to approximate harissas smoky, garlicky heat.'),

('ing_harissa_de', 'Harissa paste', 'DE', 0,
 '["Sambal oelek + roasted garlic + ground cumin and coriander"]',
 'Sambal oelek is widely stocked in German supermarkets and approximates harissas heat profile.'),

('ing_dashi_bd', 'Dashi stock', 'BD', 0,
 '["Vegetable stock + 1 tsp soy sauce","Diluted anchovy stock"]',
 'Dashi provides umami; vegetable stock with soy sauce creates a similar savory base.'),

('ing_dashi_de', 'Dashi stock', 'DE', 0,
 '["Vegetable stock + dash of soy sauce","Mushroom broth"]',
 'Mushroom broth provides natural umami similar to kombu-based dashi.'),

('ing_tahini_bd', 'Tahini', 'BD', 0,
 '["Greek yogurt + garlic","Peanut butter + lemon juice"]',
 'Tahini adds nutty creaminess; Greek yogurt with garlic gives similarly creamy dressing.'),

('ing_tahini_de', 'Tahini', 'DE', 0,
 '["Greek yogurt + garlic","Sunflower seed butter + lemon"]',
 'Sunflower seed butter provides a similar nutty flavor profile to tahini.'),

('ing_saffron_bd', 'Saffron', 'BD', 0,
 '["Turmeric soaked in warm milk","A few drops of yellow food color"]',
 'Saffron adds color and aroma; turmeric milk gives golden hue with health benefits.');
