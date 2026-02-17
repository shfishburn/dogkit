#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = dirname(fileURLToPath(import.meta.url));
const FILE = resolve(DIR, '..', 'specs', 'recipes', 'weekly_meal_plan.json');

const newRecipes = [
  {
    id: "bison_sweet_potato_kale",
    name: "Bison & Sweet Potato with Kale",
    overview: "Bison is leaner than beef with excellent zinc and iron. Sweet potato brings vitamin A and potassium. Kale provides exceptional vitamin K and calcium. A nutrient-dense red meat option for variety.",
    tags: { protein_type: "bison", primary_carb: "sweet_potato", primary_veggie: "kale", cook_method: "stovetop", prep_time_min: 30, tier: "T2", dimensions_covered: ["P","F","Zn","Fe","B","VA","VK","VE","Ca","K","Mn","O3","Fib","Cu","Ch"] },
    ingredients: [
      { ingredient_id: "muscle_meat_bison_ground", name: "Ground bison", base_g: 230, unit: "g", prep: "raw weight" },
      { ingredient_id: "organ_meat_beef_liver", name: "Beef liver", base_g: 25, unit: "g", prep: "raw, diced small" },
      { ingredient_id: "starchy_carbohydrates_sweet_potato", name: "Sweet potato", base_g: 190, unit: "g", prep: "peeled, cubed, cooked weight" },
      { ingredient_id: "non_starchy_vegetables_kale", name: "Kale", base_g: 80, unit: "g", prep: "stems removed, steamed, chopped" },
      { ingredient_id: "fats_oils_fish_oil", name: "Fish oil", base_g: 5, unit: "ml", prep: "~1 tsp" },
      { ingredient_id: "supplements_vitamin_e", name: "Vitamin E", base_g: null, unit: "IU", prep: "1 IU per lb body weight" },
      { ingredient_id: "calcium_sources_eggshell_powder", name: "Eggshell powder", base_g: 3, unit: "g", prep: "~½ tsp" }
    ],
    instructions: [
      "Peel and cube sweet potato. Boil or steam until tender, about 12 minutes.",
      "Brown bison in a skillet over medium heat. Bison is lean — use a touch of oil to prevent sticking.",
      "Add diced beef liver for the last 3 minutes.",
      "Steam kale leaves for 3–4 minutes. Chop finely.",
      "Combine bison, liver, sweet potato, and kale. Cool to room temperature.",
      "Mix in fish oil, eggshell powder, and vitamin E.",
      "Divide into 2 meals."
    ],
    per_1000kcal_estimate: { protein_g: 54, fat_g: 16, fiber_g: 6, calcium_mg: 1150, phosphorus_mg: 830, ca_p_ratio: "1.4:1" }
  },
  {
    id: "venison_brown_rice_spinach",
    name: "Venison & Brown Rice with Spinach",
    overview: "Venison is one of the leanest red meats available with outstanding iron and zinc. Brown rice adds manganese and steady-release carbs. Spinach contributes iron, magnesium, and vitamin K. An excellent option for dogs needing novel proteins.",
    tags: { protein_type: "venison", primary_carb: "brown_rice", primary_veggie: "spinach", cook_method: "stovetop", prep_time_min: 35, tier: "T2", dimensions_covered: ["P","Zn","Fe","B","VK","VE","Ca","K","Mn","Mg","O3","Fib","Ch","Cu"] },
    ingredients: [
      { ingredient_id: "muscle_meat_venison_ground", name: "Ground venison", base_g: 240, unit: "g", prep: "raw weight" },
      { ingredient_id: "organ_meat_beef_liver", name: "Beef liver", base_g: 25, unit: "g", prep: "raw, diced" },
      { ingredient_id: "starchy_carbohydrates_brown_rice", name: "Brown rice", base_g: 200, unit: "g", prep: "cooked weight" },
      { ingredient_id: "non_starchy_vegetables_spinach", name: "Spinach", base_g: 90, unit: "g", prep: "steamed, chopped" },
      { ingredient_id: "fats_oils_olive_oil", name: "Olive oil", base_g: 10, unit: "ml", prep: "~2 tsp (venison is very lean, needs added fat)" },
      { ingredient_id: "fats_oils_fish_oil", name: "Fish oil", base_g: 5, unit: "ml", prep: "~1 tsp" },
      { ingredient_id: "supplements_vitamin_e", name: "Vitamin E", base_g: null, unit: "IU", prep: "1 IU per lb body weight" },
      { ingredient_id: "calcium_sources_eggshell_powder", name: "Eggshell powder", base_g: 3, unit: "g", prep: "~½ tsp" }
    ],
    instructions: [
      "Cook brown rice per package directions (~25 minutes).",
      "Brown venison in a skillet with olive oil over medium heat. It's very lean — don't overcook.",
      "Add diced beef liver for the last 3 minutes.",
      "Steam spinach for 1–2 minutes. Drain and chop.",
      "Combine venison, liver, rice, and spinach. Cool to room temperature.",
      "Stir in fish oil, eggshell powder, and vitamin E.",
      "Divide into 2 meals."
    ],
    per_1000kcal_estimate: { protein_g: 56, fat_g: 15, fiber_g: 5, calcium_mg: 1100, phosphorus_mg: 840, ca_p_ratio: "1.3:1" }
  },
  {
    id: "cod_white_rice_carrots",
    name: "Cod & White Rice with Carrots",
    overview: "Cod is an ultra-lean white fish rich in selenium, phosphorus, and vitamin D. White rice is the most digestible grain. Carrots provide beta-carotene and gentle fiber. An excellent bland-diet option that's still nutritionally complete.",
    tags: { protein_type: "fish", primary_carb: "white_rice", primary_veggie: "carrots", cook_method: "stovetop", prep_time_min: 25, tier: "T1", dimensions_covered: ["P","Se","VD","Ca","VA","VK","Fib","K","B","O3","Fe","Ch"] },
    ingredients: [
      { ingredient_id: "fish_seafood_cod_fresh", name: "Cod, fresh", base_g: 260, unit: "g", prep: "raw weight, boneless fillets" },
      { ingredient_id: "organ_meat_chicken_liver", name: "Chicken liver", base_g: 25, unit: "g", prep: "raw, diced" },
      { ingredient_id: "starchy_carbohydrates_white_rice", name: "White rice", base_g: 220, unit: "g", prep: "cooked weight" },
      { ingredient_id: "non_starchy_vegetables_carrots", name: "Carrots", base_g: 120, unit: "g", prep: "peeled, diced, cooked" },
      { ingredient_id: "fats_oils_olive_oil", name: "Olive oil", base_g: 10, unit: "ml", prep: "~2 tsp (cod is very lean)" },
      { ingredient_id: "fats_oils_fish_oil", name: "Fish oil", base_g: 5, unit: "ml", prep: "~1 tsp" },
      { ingredient_id: "supplements_vitamin_e", name: "Vitamin E", base_g: null, unit: "IU", prep: "1 IU per lb body weight" },
      { ingredient_id: "calcium_sources_eggshell_powder", name: "Eggshell powder", base_g: 3, unit: "g", prep: "~½ tsp" }
    ],
    instructions: [
      "Cook white rice per package directions.",
      "Peel and dice carrots. Boil until soft, about 10 minutes.",
      "Poach or pan-sear cod fillets in olive oil for 4–5 minutes per side until flaky. Break into pieces.",
      "Sear diced chicken liver in the same pan for 3 minutes.",
      "Combine cod, liver, rice, and carrots. Cool to room temperature.",
      "Stir in fish oil, eggshell powder, and vitamin E.",
      "Divide into 2 meals."
    ],
    per_1000kcal_estimate: { protein_g: 50, fat_g: 14, fiber_g: 4, calcium_mg: 1100, phosphorus_mg: 780, ca_p_ratio: "1.4:1" }
  },
  {
    id: "rabbit_oatmeal_green_beans",
    name: "Rabbit & Oatmeal with Green Beans",
    overview: "Rabbit is an excellent novel protein — very lean, high in B12, and rarely encountered in commercial foods, making it ideal for elimination diets. Oatmeal provides soluble fiber and manganese. Green beans add vitamin K and potassium.",
    tags: { protein_type: "rabbit", primary_carb: "oatmeal", primary_veggie: "green_beans", cook_method: "stovetop", prep_time_min: 30, tier: "T2", dimensions_covered: ["P","B","VK","Ca","K","Mn","Fib","O3","Fe","Ch","Cu"] },
    ingredients: [
      { ingredient_id: "muscle_meat_rabbit", name: "Rabbit", base_g: 240, unit: "g", prep: "raw weight, boneless, cubed" },
      { ingredient_id: "organ_meat_beef_liver", name: "Beef liver", base_g: 25, unit: "g", prep: "raw, diced" },
      { ingredient_id: "starchy_carbohydrates_oatmeal", name: "Oatmeal", base_g: 200, unit: "g", prep: "cooked weight" },
      { ingredient_id: "non_starchy_vegetables_green_beans", name: "Green beans", base_g: 120, unit: "g", prep: "steamed, cut into 1cm pieces" },
      { ingredient_id: "fats_oils_olive_oil", name: "Olive oil", base_g: 10, unit: "ml", prep: "~2 tsp (rabbit is very lean)" },
      { ingredient_id: "fats_oils_fish_oil", name: "Fish oil", base_g: 5, unit: "ml", prep: "~1 tsp" },
      { ingredient_id: "supplements_vitamin_e", name: "Vitamin E", base_g: null, unit: "IU", prep: "1 IU per lb body weight" },
      { ingredient_id: "calcium_sources_eggshell_powder", name: "Eggshell powder", base_g: 3, unit: "g", prep: "~½ tsp" }
    ],
    instructions: [
      "Cook oatmeal with water per package directions.",
      "Cut rabbit into small cubes. Sear in olive oil over medium heat for 6–8 minutes.",
      "Add diced beef liver for the last 3 minutes.",
      "Steam green beans for 5 minutes. Cut small.",
      "Combine rabbit, liver, oatmeal, and green beans. Cool to room temperature.",
      "Mix in fish oil, eggshell powder, and vitamin E.",
      "Divide into 2 meals."
    ],
    per_1000kcal_estimate: { protein_g: 57, fat_g: 14, fiber_g: 6, calcium_mg: 1100, phosphorus_mg: 810, ca_p_ratio: "1.35:1" }
  },
  {
    id: "beef_chuck_barley_broccoli",
    name: "Beef Chuck & Barley with Broccoli",
    overview: "Beef chuck is a fattier, more flavorful cut rich in zinc and iron. Barley provides the highest fiber of any common grain. Broccoli delivers vitamin K, vitamin E, and manganese. A hearty, satisfying meal for cooler weather.",
    tags: { protein_type: "beef", primary_carb: "barley", primary_veggie: "broccoli", cook_method: "stovetop", prep_time_min: 40, tier: "T1", dimensions_covered: ["P","F","Zn","Fe","B","Ch","VK","VE","Ca","K","Mn","O3","Fib","Cu"] },
    ingredients: [
      { ingredient_id: "muscle_meat_beef_chuck_roast", name: "Beef chuck roast", base_g: 200, unit: "g", prep: "raw weight, cubed" },
      { ingredient_id: "organ_meat_beef_liver", name: "Beef liver", base_g: 25, unit: "g", prep: "raw, diced" },
      { ingredient_id: "starchy_carbohydrates_barley", name: "Barley (pearled)", base_g: 190, unit: "g", prep: "cooked weight" },
      { ingredient_id: "non_starchy_vegetables_broccoli", name: "Broccoli", base_g: 100, unit: "g", prep: "steamed, chopped" },
      { ingredient_id: "fats_oils_fish_oil", name: "Fish oil", base_g: 5, unit: "ml", prep: "~1 tsp" },
      { ingredient_id: "supplements_vitamin_e", name: "Vitamin E", base_g: null, unit: "IU", prep: "1 IU per lb body weight" },
      { ingredient_id: "calcium_sources_eggshell_powder", name: "Eggshell powder", base_g: 3, unit: "g", prep: "~½ tsp" }
    ],
    instructions: [
      "Cook pearled barley in water for 30–35 minutes. Start this first.",
      "Cube beef chuck and sear in a skillet over medium-high heat for 6–8 minutes.",
      "Add diced beef liver for the last 3 minutes.",
      "Steam broccoli for 4–5 minutes. Chop small.",
      "Combine beef, liver, barley, and broccoli. Cool to room temperature.",
      "Mix in fish oil, eggshell powder, and vitamin E.",
      "Divide into 2 meals."
    ],
    per_1000kcal_estimate: { protein_g: 48, fat_g: 24, fiber_g: 8, calcium_mg: 1100, phosphorus_mg: 830, ca_p_ratio: "1.3:1" }
  },
  {
    id: "chicken_thigh_lentils_spinach",
    name: "Chicken Thigh & Lentils with Spinach",
    overview: "Lentils paired with chicken thigh create a high-fiber, high-protein meal. Lentils are among the best plant-based sources of iron, potassium, and manganese. Spinach doubles down on iron and adds vitamin K and magnesium.",
    tags: { protein_type: "chicken", primary_carb: "lentils", primary_veggie: "spinach", cook_method: "stovetop", prep_time_min: 30, tier: "T1", dimensions_covered: ["P","F","Zn","Fe","B","Ch","VK","VE","Ca","K","Mn","Mg","O3","Fib"] },
    ingredients: [
      { ingredient_id: "muscle_meat_chicken_thigh_boneless", name: "Chicken thigh, boneless", base_g: 220, unit: "g", prep: "raw weight, cubed" },
      { ingredient_id: "organ_meat_chicken_liver", name: "Chicken liver", base_g: 25, unit: "g", prep: "raw, diced" },
      { ingredient_id: "starchy_carbohydrates_lentils", name: "Lentils (green or brown)", base_g: 180, unit: "g", prep: "cooked weight" },
      { ingredient_id: "non_starchy_vegetables_spinach", name: "Spinach", base_g: 90, unit: "g", prep: "steamed, chopped" },
      { ingredient_id: "fats_oils_fish_oil", name: "Fish oil", base_g: 5, unit: "ml", prep: "~1 tsp" },
      { ingredient_id: "supplements_vitamin_e", name: "Vitamin E", base_g: null, unit: "IU", prep: "1 IU per lb body weight" },
      { ingredient_id: "calcium_sources_eggshell_powder", name: "Eggshell powder", base_g: 3, unit: "g", prep: "~½ tsp" }
    ],
    instructions: [
      "Cook lentils in water for 20–25 minutes until tender. Drain.",
      "Cut chicken thighs into bite-size pieces. Cook in a skillet until done (165°F).",
      "Add diced chicken liver for the last 3 minutes.",
      "Steam spinach for 1–2 minutes. Drain and chop.",
      "Combine chicken, liver, lentils, and spinach. Cool to room temperature.",
      "Stir in fish oil, eggshell powder, and vitamin E.",
      "Divide into 2 meals."
    ],
    per_1000kcal_estimate: { protein_g: 52, fat_g: 22, fiber_g: 11, calcium_mg: 1100, phosphorus_mg: 850, ca_p_ratio: "1.3:1" }
  },
  {
    id: "turkey_sweet_potato_bok_choy",
    name: "Turkey & Sweet Potato with Bok Choy",
    overview: "A lighter Asian-inspired combination. Bok choy is an excellent calcium and vitamin K source with a mild flavor dogs enjoy. Turkey and sweet potato form a lean, digestible base. Beef liver provides the copper and vitamin A that turkey lacks.",
    tags: { protein_type: "turkey", primary_carb: "sweet_potato", primary_veggie: "bok_choy", cook_method: "stovetop", prep_time_min: 25, tier: "T1", dimensions_covered: ["P","F","Zn","B","VA","VK","Ca","K","Se","O3","Fib","Fe","Cu","Ch"] },
    ingredients: [
      { ingredient_id: "muscle_meat_ground_turkey_93_lean", name: "Ground turkey, 93% lean", base_g: 230, unit: "g", prep: "raw weight" },
      { ingredient_id: "organ_meat_beef_liver", name: "Beef liver", base_g: 25, unit: "g", prep: "raw, diced" },
      { ingredient_id: "starchy_carbohydrates_sweet_potato", name: "Sweet potato", base_g: 190, unit: "g", prep: "peeled, cubed, cooked weight" },
      { ingredient_id: "non_starchy_vegetables_bok_choy", name: "Bok choy", base_g: 120, unit: "g", prep: "chopped, steamed" },
      { ingredient_id: "fats_oils_fish_oil", name: "Fish oil", base_g: 5, unit: "ml", prep: "~1 tsp" },
      { ingredient_id: "supplements_vitamin_e", name: "Vitamin E", base_g: null, unit: "IU", prep: "1 IU per lb body weight" },
      { ingredient_id: "calcium_sources_eggshell_powder", name: "Eggshell powder", base_g: 3, unit: "g", prep: "~½ tsp" }
    ],
    instructions: [
      "Peel and cube sweet potato. Boil or steam until tender, about 12 minutes.",
      "Brown ground turkey in a skillet, breaking into crumbles.",
      "Add diced beef liver for the last 3 minutes.",
      "Chop bok choy and steam for 3–4 minutes.",
      "Combine turkey, liver, sweet potato, and bok choy. Cool to room temperature.",
      "Mix in fish oil, eggshell powder, and vitamin E.",
      "Divide into 2 meals."
    ],
    per_1000kcal_estimate: { protein_g: 53, fat_g: 17, fiber_g: 6, calcium_mg: 1150, phosphorus_mg: 850, ca_p_ratio: "1.35:1" }
  },
  {
    id: "pork_loin_quinoa_peas",
    name: "Pork Loin & Quinoa with Peas",
    overview: "Lean pork with quinoa creates a complete amino acid profile. Peas contribute fiber, manganese, and plant-based protein. A clean, efficient recipe with excellent B-vitamin coverage from both pork and chicken liver.",
    tags: { protein_type: "pork", primary_carb: "quinoa", primary_veggie: "peas", cook_method: "stovetop", prep_time_min: 25, tier: "T1", dimensions_covered: ["P","F","Zn","B","VK","Ca","K","Mn","Mg","O3","Fib","Fe","Ch"] },
    ingredients: [
      { ingredient_id: "muscle_meat_pork_loin", name: "Pork loin", base_g: 230, unit: "g", prep: "raw weight, trimmed, cubed" },
      { ingredient_id: "organ_meat_chicken_liver", name: "Chicken liver", base_g: 25, unit: "g", prep: "raw, diced" },
      { ingredient_id: "starchy_carbohydrates_quinoa", name: "Quinoa", base_g: 190, unit: "g", prep: "cooked weight" },
      { ingredient_id: "non_starchy_vegetables_peas", name: "Peas", base_g: 110, unit: "g", prep: "cooked (frozen peas work great)" },
      { ingredient_id: "fats_oils_fish_oil", name: "Fish oil", base_g: 5, unit: "ml", prep: "~1 tsp" },
      { ingredient_id: "supplements_vitamin_e", name: "Vitamin E", base_g: null, unit: "IU", prep: "1 IU per lb body weight" },
      { ingredient_id: "calcium_sources_eggshell_powder", name: "Eggshell powder", base_g: 3, unit: "g", prep: "~½ tsp" }
    ],
    instructions: [
      "Rinse and cook quinoa per package directions.",
      "Cook peas (boil frozen for 3 minutes or steam fresh for 5 minutes).",
      "Cube pork loin and sear in a skillet until cooked through (145°F).",
      "Add diced chicken liver for the last 3 minutes.",
      "Combine pork, liver, quinoa, and peas. Cool to room temperature.",
      "Stir in fish oil, eggshell powder, and vitamin E.",
      "Divide into 2 meals."
    ],
    per_1000kcal_estimate: { protein_g: 52, fat_g: 17, fiber_g: 7, calcium_mg: 1100, phosphorus_mg: 830, ca_p_ratio: "1.3:1" }
  },
  {
    id: "fresh_salmon_white_potato_zucchini",
    name: "Fresh Salmon & White Potato with Zucchini",
    overview: "Fresh salmon delivers premium omega-3 EPA+DHA and vitamin D in higher concentrations than canned. White potato is gentle on digestion. Zucchini adds potassium with very low caloric density. A light, nutrient-dense fish meal.",
    tags: { protein_type: "fish", primary_carb: "white_potato", primary_veggie: "zucchini", cook_method: "stovetop", prep_time_min: 25, tier: "T1", dimensions_covered: ["P","F","O3","VD","Se","Ca","K","Fib","B","Fe","Ch"] },
    ingredients: [
      { ingredient_id: "fish_seafood_salmon_fresh", name: "Salmon, fresh", base_g: 230, unit: "g", prep: "raw weight, boneless fillet" },
      { ingredient_id: "organ_meat_chicken_liver", name: "Chicken liver", base_g: 20, unit: "g", prep: "raw, diced" },
      { ingredient_id: "starchy_carbohydrates_white_potato", name: "White potato", base_g: 200, unit: "g", prep: "peeled, cubed, boiled" },
      { ingredient_id: "non_starchy_vegetables_zucchini", name: "Zucchini", base_g: 120, unit: "g", prep: "sliced, steamed" },
      { ingredient_id: "fats_oils_olive_oil", name: "Olive oil", base_g: 5, unit: "ml", prep: "~1 tsp, for cooking" },
      { ingredient_id: "supplements_vitamin_e", name: "Vitamin E", base_g: null, unit: "IU", prep: "1 IU per lb body weight" },
      { ingredient_id: "calcium_sources_eggshell_powder", name: "Eggshell powder", base_g: 3, unit: "g", prep: "~½ tsp" }
    ],
    instructions: [
      "Peel and cube potatoes. Boil until tender, about 12 minutes. Drain.",
      "Pan-sear salmon fillet in olive oil, skin-side down, 4 minutes per side. Remove skin and flake with a fork.",
      "Sear diced chicken liver in the same pan for 3 minutes.",
      "Slice zucchini and steam for 3–4 minutes.",
      "Combine salmon, liver, potato, and zucchini. Cool to room temperature.",
      "Stir in eggshell powder and vitamin E.",
      "Divide into 2 meals. Note: fresh salmon provides omega-3 — no added fish oil needed."
    ],
    per_1000kcal_estimate: { protein_g: 50, fat_g: 18, fiber_g: 4, calcium_mg: 1100, phosphorus_mg: 800, ca_p_ratio: "1.4:1" }
  },
  {
    id: "lamb_oatmeal_kale",
    name: "Lamb & Oatmeal with Kale",
    overview: "Lamb's richer fat profile pairs well with hearty oatmeal. Kale provides a massive vitamin K boost plus calcium and manganese. A warming, mineral-rich meal that most dogs find highly palatable.",
    tags: { protein_type: "lamb", primary_carb: "oatmeal", primary_veggie: "kale", cook_method: "stovetop", prep_time_min: 30, tier: "T1", dimensions_covered: ["P","F","Zn","Fe","B","VK","VE","Ca","K","Mn","Mg","O3","Fib","Ch","Cu"] },
    ingredients: [
      { ingredient_id: "muscle_meat_lamb_ground", name: "Ground lamb", base_g: 200, unit: "g", prep: "raw weight" },
      { ingredient_id: "organ_meat_beef_liver", name: "Beef liver", base_g: 25, unit: "g", prep: "raw, diced" },
      { ingredient_id: "starchy_carbohydrates_oatmeal", name: "Oatmeal", base_g: 200, unit: "g", prep: "cooked weight" },
      { ingredient_id: "non_starchy_vegetables_kale", name: "Kale", base_g: 90, unit: "g", prep: "stems removed, steamed, chopped" },
      { ingredient_id: "fats_oils_fish_oil", name: "Fish oil", base_g: 5, unit: "ml", prep: "~1 tsp" },
      { ingredient_id: "supplements_vitamin_e", name: "Vitamin E", base_g: null, unit: "IU", prep: "1 IU per lb body weight" },
      { ingredient_id: "calcium_sources_eggshell_powder", name: "Eggshell powder", base_g: 3, unit: "g", prep: "~½ tsp" }
    ],
    instructions: [
      "Cook oatmeal with water per package directions.",
      "Brown lamb in a skillet. Drain excess fat.",
      "Add diced beef liver for the last 3 minutes.",
      "Steam kale for 3–4 minutes. Chop finely.",
      "Combine lamb, liver, oatmeal, and kale. Cool to room temperature.",
      "Mix in fish oil, eggshell powder, and vitamin E.",
      "Divide into 2 meals."
    ],
    per_1000kcal_estimate: { protein_g: 47, fat_g: 27, fiber_g: 5, calcium_mg: 1150, phosphorus_mg: 820, ca_p_ratio: "1.4:1" }
  },
  {
    id: "tilapia_brown_rice_carrots",
    name: "Tilapia & Brown Rice with Carrots",
    overview: "Tilapia is the most affordable and widely available white fish. It's very lean with good vitamin D content. Brown rice adds manganese. Carrots provide vitamin A and gentle fiber. Budget-friendly fish day.",
    tags: { protein_type: "fish", primary_carb: "brown_rice", primary_veggie: "carrots", cook_method: "stovetop", prep_time_min: 25, tier: "T1", dimensions_covered: ["P","VD","Ca","VA","VK","Fib","K","Mn","Fe","B","O3","Se","Ch"] },
    ingredients: [
      { ingredient_id: "fish_seafood_tilapia_fresh", name: "Tilapia, fresh", base_g: 260, unit: "g", prep: "raw weight, boneless fillets" },
      { ingredient_id: "organ_meat_chicken_liver", name: "Chicken liver", base_g: 25, unit: "g", prep: "raw, diced" },
      { ingredient_id: "starchy_carbohydrates_brown_rice", name: "Brown rice", base_g: 200, unit: "g", prep: "cooked weight" },
      { ingredient_id: "non_starchy_vegetables_carrots", name: "Carrots", base_g: 120, unit: "g", prep: "peeled, diced, cooked" },
      { ingredient_id: "fats_oils_olive_oil", name: "Olive oil", base_g: 10, unit: "ml", prep: "~2 tsp (tilapia is very lean)" },
      { ingredient_id: "fats_oils_fish_oil", name: "Fish oil", base_g: 5, unit: "ml", prep: "~1 tsp (tilapia has minimal omega-3)" },
      { ingredient_id: "supplements_vitamin_e", name: "Vitamin E", base_g: null, unit: "IU", prep: "1 IU per lb body weight" },
      { ingredient_id: "calcium_sources_eggshell_powder", name: "Eggshell powder", base_g: 3, unit: "g", prep: "~½ tsp" }
    ],
    instructions: [
      "Cook brown rice per package directions (~25 minutes).",
      "Peel and dice carrots. Boil until soft, about 10 minutes.",
      "Pan-sear tilapia fillets in olive oil for 3–4 minutes per side. Flake with a fork.",
      "Sear diced chicken liver in the same pan for 3 minutes.",
      "Combine tilapia, liver, rice, and carrots. Cool to room temperature.",
      "Stir in fish oil, eggshell powder, and vitamin E.",
      "Divide into 2 meals."
    ],
    per_1000kcal_estimate: { protein_g: 52, fat_g: 14, fiber_g: 5, calcium_mg: 1100, phosphorus_mg: 790, ca_p_ratio: "1.4:1" }
  },
  {
    id: "beef_90_quinoa_brussels",
    name: "Lean Beef & Quinoa with Brussels Sprouts",
    overview: "Lean ground beef with quinoa creates a protein-rich, mineral-dense base. Brussels sprouts contribute exceptional vitamin K and fiber. A well-rounded recipe with broad micronutrient coverage.",
    tags: { protein_type: "beef", primary_carb: "quinoa", primary_veggie: "brussels_sprouts", cook_method: "stovetop", prep_time_min: 25, tier: "T1", dimensions_covered: ["P","F","Zn","Fe","B","Ch","VK","Ca","K","Mn","Mg","O3","Fib","Cu","Se"] },
    ingredients: [
      { ingredient_id: "muscle_meat_ground_beef_90_lean", name: "Ground beef, 90% lean", base_g: 220, unit: "g", prep: "raw weight" },
      { ingredient_id: "organ_meat_beef_liver", name: "Beef liver", base_g: 25, unit: "g", prep: "raw, diced" },
      { ingredient_id: "starchy_carbohydrates_quinoa", name: "Quinoa", base_g: 190, unit: "g", prep: "cooked weight" },
      { ingredient_id: "non_starchy_vegetables_brussels_sprouts", name: "Brussels sprouts", base_g: 100, unit: "g", prep: "halved, steamed" },
      { ingredient_id: "fats_oils_fish_oil", name: "Fish oil", base_g: 5, unit: "ml", prep: "~1 tsp" },
      { ingredient_id: "supplements_vitamin_e", name: "Vitamin E", base_g: null, unit: "IU", prep: "1 IU per lb body weight" },
      { ingredient_id: "calcium_sources_eggshell_powder", name: "Eggshell powder", base_g: 3, unit: "g", prep: "~½ tsp" }
    ],
    instructions: [
      "Rinse and cook quinoa per package directions.",
      "Brown ground beef in a skillet. Drain excess fat.",
      "Add diced beef liver for the last 3 minutes.",
      "Halve Brussels sprouts and steam for 6–8 minutes. Chop small.",
      "Combine beef, liver, quinoa, and Brussels sprouts. Cool to room temperature.",
      "Mix in fish oil, eggshell powder, and vitamin E.",
      "Divide into 2 meals."
    ],
    per_1000kcal_estimate: { protein_g: 53, fat_g: 19, fiber_g: 7, calcium_mg: 1100, phosphorus_mg: 870, ca_p_ratio: "1.25:1" }
  },
  {
    id: "bison_white_potato_green_beans",
    name: "Bison & White Potato with Green Beans",
    overview: "Another bison option using the more digestible white potato. Green beans keep it light with gentle fiber and vitamin K. A simpler, more accessible recipe for dogs who do well on novel proteins.",
    tags: { protein_type: "bison", primary_carb: "white_potato", primary_veggie: "green_beans", cook_method: "stovetop", prep_time_min: 30, tier: "T2", dimensions_covered: ["P","F","Zn","Fe","B","VK","Ca","K","O3","Fib","Ch","Cu"] },
    ingredients: [
      { ingredient_id: "muscle_meat_bison_ground", name: "Ground bison", base_g: 230, unit: "g", prep: "raw weight" },
      { ingredient_id: "organ_meat_chicken_liver", name: "Chicken liver", base_g: 25, unit: "g", prep: "raw, diced" },
      { ingredient_id: "starchy_carbohydrates_white_potato", name: "White potato", base_g: 200, unit: "g", prep: "peeled, cubed, boiled" },
      { ingredient_id: "non_starchy_vegetables_green_beans", name: "Green beans", base_g: 120, unit: "g", prep: "steamed, cut small" },
      { ingredient_id: "fats_oils_fish_oil", name: "Fish oil", base_g: 5, unit: "ml", prep: "~1 tsp" },
      { ingredient_id: "supplements_vitamin_e", name: "Vitamin E", base_g: null, unit: "IU", prep: "1 IU per lb body weight" },
      { ingredient_id: "calcium_sources_eggshell_powder", name: "Eggshell powder", base_g: 3, unit: "g", prep: "~½ tsp" }
    ],
    instructions: [
      "Peel and cube potatoes. Boil until fork-tender, about 12 minutes.",
      "Brown bison in a skillet with a touch of oil.",
      "Add diced chicken liver for the last 3 minutes.",
      "Steam green beans for 5 minutes. Cut small.",
      "Combine bison, liver, potato, and green beans. Cool to room temperature.",
      "Mix in fish oil, eggshell powder, and vitamin E.",
      "Divide into 2 meals."
    ],
    per_1000kcal_estimate: { protein_g: 53, fat_g: 15, fiber_g: 5, calcium_mg: 1100, phosphorus_mg: 820, ca_p_ratio: "1.35:1" }
  },
  {
    id: "chicken_breast_barley_carrots_broccoli",
    name: "Chicken Breast & Barley with Carrots & Broccoli",
    overview: "A lean, high-fiber meal combining chicken breast with barley's soluble fiber. Two vegetables — carrots for vitamin A and broccoli for vitamin K/E — provide broad coverage. Ideal for weight management.",
    tags: { protein_type: "chicken", primary_carb: "barley", primary_veggie: "carrots_and_broccoli", cook_method: "stovetop", prep_time_min: 35, tier: "T1", dimensions_covered: ["P","B","VA","VK","VE","Ca","K","Mn","Fib","O3","Fe","Ch","Se"] },
    ingredients: [
      { ingredient_id: "muscle_meat_chicken_breast_boneless", name: "Chicken breast, boneless", base_g: 240, unit: "g", prep: "raw weight" },
      { ingredient_id: "organ_meat_chicken_liver", name: "Chicken liver", base_g: 25, unit: "g", prep: "raw, diced" },
      { ingredient_id: "starchy_carbohydrates_barley", name: "Barley (pearled)", base_g: 180, unit: "g", prep: "cooked weight" },
      { ingredient_id: "non_starchy_vegetables_carrots", name: "Carrots", base_g: 70, unit: "g", prep: "peeled, diced, cooked" },
      { ingredient_id: "non_starchy_vegetables_broccoli", name: "Broccoli", base_g: 70, unit: "g", prep: "steamed, chopped" },
      { ingredient_id: "fats_oils_fish_oil", name: "Fish oil", base_g: 5, unit: "ml", prep: "~1 tsp" },
      { ingredient_id: "fats_oils_olive_oil", name: "Olive oil", base_g: 5, unit: "ml", prep: "~1 tsp, for cooking" },
      { ingredient_id: "supplements_vitamin_e", name: "Vitamin E", base_g: null, unit: "IU", prep: "1 IU per lb body weight" },
      { ingredient_id: "calcium_sources_eggshell_powder", name: "Eggshell powder", base_g: 3, unit: "g", prep: "~½ tsp" }
    ],
    instructions: [
      "Cook barley in water for 30–35 minutes.",
      "Poach or pan-cook chicken breast in olive oil. Dice or shred when done.",
      "Sear diced chicken liver in the same pan for 3 minutes.",
      "Boil diced carrots for 8 minutes. Steam broccoli for 4 minutes.",
      "Combine chicken, liver, barley, carrots, and broccoli. Cool to room temperature.",
      "Stir in fish oil, eggshell powder, and vitamin E.",
      "Divide into 2 meals."
    ],
    per_1000kcal_estimate: { protein_g: 55, fat_g: 14, fiber_g: 9, calcium_mg: 1100, phosphorus_mg: 810, ca_p_ratio: "1.35:1" }
  },
  {
    id: "beef_heart_sweet_potato_spinach",
    name: "Beef Heart & Sweet Potato with Spinach",
    overview: "Beef heart returns in a different combination — sweet potato replaces lentils for guardians who prefer grain-free carbs. The iron-rich heart with iron-rich spinach creates a potent combination for dogs needing mineral support.",
    tags: { protein_type: "beef", primary_carb: "sweet_potato", primary_veggie: "spinach", cook_method: "stovetop", prep_time_min: 30, tier: "T2", dimensions_covered: ["P","F","Fe","Cu","B","Ch","VA","VK","VE","Ca","K","Mg","O3","Fib","Se","Zn"] },
    ingredients: [
      { ingredient_id: "muscle_meat_beef_heart", name: "Beef heart", base_g: 230, unit: "g", prep: "raw weight, trimmed, cubed" },
      { ingredient_id: "starchy_carbohydrates_sweet_potato", name: "Sweet potato", base_g: 200, unit: "g", prep: "peeled, cubed, cooked weight" },
      { ingredient_id: "non_starchy_vegetables_spinach", name: "Spinach", base_g: 90, unit: "g", prep: "steamed, chopped" },
      { ingredient_id: "fats_oils_fish_oil", name: "Fish oil", base_g: 5, unit: "ml", prep: "~1 tsp" },
      { ingredient_id: "supplements_vitamin_e", name: "Vitamin E", base_g: null, unit: "IU", prep: "1 IU per lb body weight" },
      { ingredient_id: "calcium_sources_eggshell_powder", name: "Eggshell powder", base_g: 3, unit: "g", prep: "~½ tsp" }
    ],
    instructions: [
      "Peel and cube sweet potato. Boil or steam until tender.",
      "Trim and cube beef heart. Sear over medium-high heat for 5–6 minutes.",
      "Steam spinach for 1–2 minutes. Drain and chop.",
      "Combine heart, sweet potato, and spinach. Cool to room temperature.",
      "Mix in fish oil, eggshell powder, and vitamin E.",
      "Divide into 2 meals."
    ],
    per_1000kcal_estimate: { protein_g: 55, fat_g: 14, fiber_g: 7, calcium_mg: 1100, phosphorus_mg: 840, ca_p_ratio: "1.3:1" }
  },
  {
    id: "pork_shoulder_brown_rice_bok_choy",
    name: "Pork Shoulder & Brown Rice with Bok Choy",
    overview: "Pork shoulder's higher fat content makes it great for active dogs who need more calories. Brown rice adds manganese and fiber. Bok choy provides calcium, vitamin K, and potassium with a mild flavor.",
    tags: { protein_type: "pork", primary_carb: "brown_rice", primary_veggie: "bok_choy", cook_method: "stovetop", prep_time_min: 35, tier: "T1", dimensions_covered: ["P","F","Zn","Fe","B","VK","Ca","K","Mn","O3","Fib","Ch","Cu"] },
    ingredients: [
      { ingredient_id: "muscle_meat_pork_shoulder_butt", name: "Pork shoulder/butt", base_g: 200, unit: "g", prep: "raw weight, cubed" },
      { ingredient_id: "organ_meat_beef_liver", name: "Beef liver", base_g: 25, unit: "g", prep: "raw, diced" },
      { ingredient_id: "starchy_carbohydrates_brown_rice", name: "Brown rice", base_g: 190, unit: "g", prep: "cooked weight" },
      { ingredient_id: "non_starchy_vegetables_bok_choy", name: "Bok choy", base_g: 120, unit: "g", prep: "chopped, steamed" },
      { ingredient_id: "fats_oils_fish_oil", name: "Fish oil", base_g: 5, unit: "ml", prep: "~1 tsp" },
      { ingredient_id: "supplements_vitamin_e", name: "Vitamin E", base_g: null, unit: "IU", prep: "1 IU per lb body weight" },
      { ingredient_id: "calcium_sources_eggshell_powder", name: "Eggshell powder", base_g: 3, unit: "g", prep: "~½ tsp" }
    ],
    instructions: [
      "Cook brown rice per package directions (~25 minutes).",
      "Cube pork shoulder and cook in a skillet over medium heat until done.",
      "Add diced beef liver for the last 3 minutes.",
      "Chop bok choy and steam for 3–4 minutes.",
      "Combine pork, liver, rice, and bok choy. Cool to room temperature.",
      "Mix in fish oil, eggshell powder, and vitamin E.",
      "Divide into 2 meals."
    ],
    per_1000kcal_estimate: { protein_g: 46, fat_g: 27, fiber_g: 5, calcium_mg: 1150, phosphorus_mg: 830, ca_p_ratio: "1.4:1" }
  },
  {
    id: "turkey_white_rice_zucchini_peas",
    name: "Turkey & White Rice with Zucchini & Peas",
    overview: "A gentle, highly digestible recipe. White rice is the easiest grain on the stomach. Zucchini and peas together provide fiber without being harsh. Turkey is lean with good selenium. Perfect for recovery days or sensitive stomachs.",
    tags: { protein_type: "turkey", primary_carb: "white_rice", primary_veggie: "zucchini_and_peas", cook_method: "stovetop", prep_time_min: 20, tier: "T1", dimensions_covered: ["P","F","Zn","Se","B","VK","Ca","K","Mn","Fib","O3","Fe","Ch"] },
    ingredients: [
      { ingredient_id: "muscle_meat_ground_turkey_93_lean", name: "Ground turkey, 93% lean", base_g: 230, unit: "g", prep: "raw weight" },
      { ingredient_id: "organ_meat_chicken_liver", name: "Chicken liver", base_g: 25, unit: "g", prep: "raw, diced" },
      { ingredient_id: "starchy_carbohydrates_white_rice", name: "White rice", base_g: 200, unit: "g", prep: "cooked weight" },
      { ingredient_id: "non_starchy_vegetables_zucchini", name: "Zucchini", base_g: 80, unit: "g", prep: "sliced, steamed" },
      { ingredient_id: "non_starchy_vegetables_peas", name: "Peas", base_g: 60, unit: "g", prep: "cooked" },
      { ingredient_id: "fats_oils_fish_oil", name: "Fish oil", base_g: 5, unit: "ml", prep: "~1 tsp" },
      { ingredient_id: "supplements_vitamin_e", name: "Vitamin E", base_g: null, unit: "IU", prep: "1 IU per lb body weight" },
      { ingredient_id: "calcium_sources_eggshell_powder", name: "Eggshell powder", base_g: 3, unit: "g", prep: "~½ tsp" }
    ],
    instructions: [
      "Cook white rice per package directions.",
      "Brown ground turkey in a skillet.",
      "Add diced chicken liver for the last 3 minutes.",
      "Slice zucchini and steam with peas for 4 minutes.",
      "Combine turkey, liver, rice, zucchini, and peas. Cool to room temperature.",
      "Stir in fish oil, eggshell powder, and vitamin E.",
      "Divide into 2 meals."
    ],
    per_1000kcal_estimate: { protein_g: 52, fat_g: 17, fiber_g: 4, calcium_mg: 1100, phosphorus_mg: 830, ca_p_ratio: "1.3:1" }
  },
  {
    id: "venison_sweet_potato_kale",
    name: "Venison & Sweet Potato with Kale",
    overview: "A premium novel-protein recipe. Venison with sweet potato and kale creates an iron-rich, vitamin-dense meal. The deep green of kale combined with sweet potato covers a huge spectrum from vitamin A to vitamin K.",
    tags: { protein_type: "venison", primary_carb: "sweet_potato", primary_veggie: "kale", cook_method: "stovetop", prep_time_min: 30, tier: "T2", dimensions_covered: ["P","Zn","Fe","B","VA","VK","VE","Ca","K","Mn","O3","Fib","Ch","Cu","Mg"] },
    ingredients: [
      { ingredient_id: "muscle_meat_venison_ground", name: "Ground venison", base_g: 240, unit: "g", prep: "raw weight" },
      { ingredient_id: "organ_meat_beef_liver", name: "Beef liver", base_g: 25, unit: "g", prep: "raw, diced" },
      { ingredient_id: "starchy_carbohydrates_sweet_potato", name: "Sweet potato", base_g: 190, unit: "g", prep: "peeled, cubed, cooked weight" },
      { ingredient_id: "non_starchy_vegetables_kale", name: "Kale", base_g: 80, unit: "g", prep: "stems removed, steamed, chopped" },
      { ingredient_id: "fats_oils_olive_oil", name: "Olive oil", base_g: 10, unit: "ml", prep: "~2 tsp (venison is very lean)" },
      { ingredient_id: "fats_oils_fish_oil", name: "Fish oil", base_g: 5, unit: "ml", prep: "~1 tsp" },
      { ingredient_id: "supplements_vitamin_e", name: "Vitamin E", base_g: null, unit: "IU", prep: "1 IU per lb body weight" },
      { ingredient_id: "calcium_sources_eggshell_powder", name: "Eggshell powder", base_g: 3, unit: "g", prep: "~½ tsp" }
    ],
    instructions: [
      "Peel and cube sweet potato. Boil or steam until tender.",
      "Brown venison in olive oil over medium heat.",
      "Add diced beef liver for the last 3 minutes.",
      "Steam kale leaves for 3–4 minutes. Chop finely.",
      "Combine venison, liver, sweet potato, and kale. Cool to room temperature.",
      "Stir in fish oil, eggshell powder, and vitamin E.",
      "Divide into 2 meals."
    ],
    per_1000kcal_estimate: { protein_g: 55, fat_g: 16, fiber_g: 6, calcium_mg: 1150, phosphorus_mg: 840, ca_p_ratio: "1.35:1" }
  },
  {
    id: "sardine_quinoa_broccoli",
    name: "Sardine & Quinoa with Broccoli",
    overview: "Sardines deliver calcium, omega-3, vitamin D, and selenium in a single ingredient. Quinoa adds complete protein and manganese. Broccoli provides vitamin K and E. No separate calcium supplement needed — the sardine bones handle it.",
    tags: { protein_type: "fish", primary_carb: "quinoa", primary_veggie: "broccoli", cook_method: "stovetop", prep_time_min: 20, tier: "T1", dimensions_covered: ["P","F","Ca","Ph","CaPh","O3","VD","Se","VK","VE","Mn","Mg","K","Fib","B","Fe","Ch"] },
    ingredients: [
      { ingredient_id: "fish_seafood_sardines_canned_in_water", name: "Sardines, canned in water (with bones)", base_g: 230, unit: "g", prep: "drained, mashed" },
      { ingredient_id: "organ_meat_chicken_liver", name: "Chicken liver", base_g: 20, unit: "g", prep: "raw, diced, pan-seared" },
      { ingredient_id: "starchy_carbohydrates_quinoa", name: "Quinoa", base_g: 200, unit: "g", prep: "cooked weight" },
      { ingredient_id: "non_starchy_vegetables_broccoli", name: "Broccoli", base_g: 100, unit: "g", prep: "steamed, chopped" },
      { ingredient_id: "fats_oils_olive_oil", name: "Olive oil", base_g: 5, unit: "ml", prep: "~1 tsp, for cooking liver" },
      { ingredient_id: "supplements_vitamin_e", name: "Vitamin E", base_g: null, unit: "IU", prep: "1 IU per lb body weight" }
    ],
    instructions: [
      "Rinse and cook quinoa per package directions.",
      "Sear diced chicken liver in olive oil for 3 minutes.",
      "Steam broccoli for 4–5 minutes. Chop small.",
      "Drain sardines and mash with a fork (bones and all).",
      "Combine sardines, liver, quinoa, and broccoli. Cool to room temperature.",
      "Stir in vitamin E.",
      "Divide into 2 meals. Note: sardine bones provide calcium — no eggshell needed."
    ],
    per_1000kcal_estimate: { protein_g: 54, fat_g: 20, fiber_g: 6, calcium_mg: 1250, phosphorus_mg: 880, ca_p_ratio: "1.4:1" }
  },
  {
    id: "beef_chuck_lentils_carrots",
    name: "Beef Chuck & Lentils with Carrots",
    overview: "A rustic, stew-like recipe. Beef chuck's fat renders nicely into lentils. Lentils contribute iron, fiber, and plant protein. Carrots add vitamin A and sweetness. Economical and nutrient-dense.",
    tags: { protein_type: "beef", primary_carb: "lentils", primary_veggie: "carrots", cook_method: "stovetop", prep_time_min: 35, tier: "T1", dimensions_covered: ["P","F","Zn","Fe","B","Ch","VA","VK","Ca","K","Mn","O3","Fib","Cu"] },
    ingredients: [
      { ingredient_id: "muscle_meat_beef_chuck_roast", name: "Beef chuck roast", base_g: 200, unit: "g", prep: "raw weight, cubed" },
      { ingredient_id: "organ_meat_beef_liver", name: "Beef liver", base_g: 25, unit: "g", prep: "raw, diced" },
      { ingredient_id: "starchy_carbohydrates_lentils", name: "Lentils (green or brown)", base_g: 180, unit: "g", prep: "cooked weight" },
      { ingredient_id: "non_starchy_vegetables_carrots", name: "Carrots", base_g: 120, unit: "g", prep: "peeled, diced, cooked" },
      { ingredient_id: "fats_oils_fish_oil", name: "Fish oil", base_g: 5, unit: "ml", prep: "~1 tsp" },
      { ingredient_id: "supplements_vitamin_e", name: "Vitamin E", base_g: null, unit: "IU", prep: "1 IU per lb body weight" },
      { ingredient_id: "calcium_sources_eggshell_powder", name: "Eggshell powder", base_g: 3, unit: "g", prep: "~½ tsp" }
    ],
    instructions: [
      "Cook lentils in water for 20–25 minutes. Drain.",
      "Cube beef chuck and sear in a skillet for 6–8 minutes.",
      "Add diced beef liver for the last 3 minutes.",
      "Boil diced carrots until soft, about 10 minutes.",
      "Combine beef, liver, lentils, and carrots. Cool to room temperature.",
      "Stir in fish oil, eggshell powder, and vitamin E.",
      "Divide into 2 meals."
    ],
    per_1000kcal_estimate: { protein_g: 49, fat_g: 23, fiber_g: 11, calcium_mg: 1100, phosphorus_mg: 860, ca_p_ratio: "1.3:1" }
  }
];

// Week 2 and week 3 plans using the new recipes
const week2 = [
  { day: 8,  label: "Monday",    am: { recipe_id: "bison_sweet_potato_kale" },             pm: { recipe_id: "cod_white_rice_carrots" } },
  { day: 9,  label: "Tuesday",   am: { recipe_id: "chicken_thigh_lentils_spinach" },       pm: { recipe_id: "venison_brown_rice_spinach" } },
  { day: 10, label: "Wednesday", am: { recipe_id: "turkey_sweet_potato_bok_choy" },        pm: { recipe_id: "sardine_quinoa_broccoli" } },
  { day: 11, label: "Thursday",  am: { recipe_id: "pork_loin_quinoa_peas" },               pm: { recipe_id: "fresh_salmon_white_potato_zucchini" } },
  { day: 12, label: "Friday",    am: { recipe_id: "beef_chuck_barley_broccoli" },          pm: { recipe_id: "rabbit_oatmeal_green_beans" } },
  { day: 13, label: "Saturday",  am: { recipe_id: "lamb_oatmeal_kale" },                   pm: { recipe_id: "tilapia_brown_rice_carrots" } },
  { day: 14, label: "Sunday",    am: { recipe_id: "beef_90_quinoa_brussels" },             pm: { recipe_id: "chicken_breast_barley_carrots_broccoli" } }
];

const week3 = [
  { day: 15, label: "Monday",    am: { recipe_id: "venison_sweet_potato_kale" },           pm: { recipe_id: "turkey_white_rice_zucchini_peas" } },
  { day: 16, label: "Tuesday",   am: { recipe_id: "beef_heart_sweet_potato_spinach" },     pm: { recipe_id: "mackerel_quinoa_kale" } },
  { day: 17, label: "Wednesday", am: { recipe_id: "pork_shoulder_brown_rice_bok_choy" },   pm: { recipe_id: "bison_white_potato_green_beans" } },
  { day: 18, label: "Thursday",  am: { recipe_id: "salmon_white_rice_peas" },              pm: { recipe_id: "beef_chuck_lentils_carrots" } },
  { day: 19, label: "Friday",    am: { recipe_id: "chicken_pumpkin_green_beans" },         pm: { recipe_id: "lamb_brown_rice_brussels" } },
  { day: 20, label: "Saturday",  am: { recipe_id: "sardine_oatmeal_spinach" },             pm: { recipe_id: "beef_sweet_potato_spinach" } },
  { day: 21, label: "Sunday",    am: { recipe_id: "cod_white_rice_carrots" },              pm: { recipe_id: "chicken_brown_rice_broccoli" } }
];

async function main() {
  const raw = await readFile(FILE, 'utf-8');
  const data = JSON.parse(raw);

  // Add new recipes
  data.recipes.push(...newRecipes);

  // Expand weekly plan to 3 weeks
  data.weekly_plan.description = "A 3-week (21-day) rotating meal plan providing maximum protein and ingredient variety across 42 meals. Each day pairs different protein sources at AM and PM. Fish appears 3+ times per week. After 21 days, the cycle repeats.";
  data.weekly_plan.days.push(...week2, ...week3);

  await writeFile(FILE, JSON.stringify(data, null, 2) + '\n', 'utf-8');

  console.log(`Total recipes: ${data.recipes.length}`);
  console.log(`Total plan days: ${data.weekly_plan.days.length}`);

  // Validate all plan references
  const ids = new Set(data.recipes.map(r => r.id));
  let errors = 0;
  for (const day of data.weekly_plan.days) {
    for (const meal of [day.am, day.pm]) {
      if (!ids.has(meal.recipe_id)) {
        console.error(`MISSING recipe: ${meal.recipe_id} (day ${day.day})`);
        errors++;
      }
    }
  }
  if (errors === 0) console.log('All plan references valid');

  const proteins = [...new Set(data.recipes.map(r => r.tags.protein_type))];
  console.log(`Protein types: ${proteins.join(', ')}`);
}

main().catch(e => { console.error(e); process.exit(1); });
