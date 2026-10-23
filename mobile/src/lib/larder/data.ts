export type Location = "fridge" | "freezer" | "pantry" | "spices";

export type Diet = "vegetarian" | "vegan" | "gluten-free";

export type Food = {
  key: string;
  name: string;
  aisle: string;
  location: Location;
  unit: string;
  shelfDays: number;
  aliases: string[];
};

export type RecipeIngredient = {
  key: string;
  qty: number;
};

export type Recipe = {
  id: string;
  title: string;
  blurb: string;
  minutes: number;
  servings: number;
  diets: Diet[];
  ingredients: RecipeIngredient[];
  steps: string[];
};

export const FOODS: Food[] = [
  { key: "milk", name: "Whole milk", aisle: "Dairy", location: "fridge", unit: "cups", shelfDays: 10, aliases: ["whole milk", "gv whole milk", "milk gal", "milk"] },
  { key: "eggs", name: "Eggs", aisle: "Dairy", location: "fridge", unit: "eggs", shelfDays: 21, aliases: ["large eggs", "eggs 18ct", "eggs"] },
  { key: "butter", name: "Butter", aisle: "Dairy", location: "fridge", unit: "tbsp", shelfDays: 60, aliases: ["salted butter", "unsalted butter", "butter"] },
  { key: "cheddar", name: "Cheddar", aisle: "Dairy", location: "fridge", unit: "oz", shelfDays: 30, aliases: ["cheddar block", "cheddar cheese", "cheddar"] },
  { key: "yogurt", name: "Greek yogurt", aisle: "Dairy", location: "fridge", unit: "cups", shelfDays: 14, aliases: ["greek yogurt", "yogurt"] },
  { key: "chicken", name: "Chicken breast", aisle: "Meat", location: "fridge", unit: "lb", shelfDays: 3, aliases: ["chicken breast", "boneless chicken", "chicken"] },
  { key: "beef", name: "Ground beef", aisle: "Meat", location: "fridge", unit: "lb", shelfDays: 3, aliases: ["ground beef", "beef 80", "ground chuck"] },
  { key: "salmon", name: "Salmon", aisle: "Meat", location: "fridge", unit: "lb", shelfDays: 2, aliases: ["salmon fillet", "atlantic salmon", "salmon"] },
  { key: "shrimp", name: "Shrimp", aisle: "Frozen", location: "freezer", unit: "lb", shelfDays: 90, aliases: ["raw shrimp", "shrimp"] },
  { key: "bacon", name: "Bacon", aisle: "Meat", location: "fridge", unit: "oz", shelfDays: 7, aliases: ["bacon"] },
  { key: "rice", name: "Jasmine rice", aisle: "Pantry", location: "pantry", unit: "cups", shelfDays: 365, aliases: ["jasmine rice", "white rice", "rice"] },
  { key: "pasta", name: "Spaghetti", aisle: "Pantry", location: "pantry", unit: "oz", shelfDays: 365, aliases: ["spaghetti", "pasta"] },
  { key: "bread", name: "Sourdough", aisle: "Bakery", location: "pantry", unit: "slices", shelfDays: 5, aliases: ["sourdough", "bread"] },
  { key: "tortillas", name: "Flour tortillas", aisle: "Bakery", location: "pantry", unit: "tortillas", shelfDays: 14, aliases: ["flour tortillas", "tortillas"] },
  { key: "oats", name: "Rolled oats", aisle: "Pantry", location: "pantry", unit: "cups", shelfDays: 180, aliases: ["old fashioned oats", "rolled oats", "oats"] },
  { key: "flour", name: "All-purpose flour", aisle: "Pantry", location: "pantry", unit: "cups", shelfDays: 180, aliases: ["all purpose flour", "ap flour", "flour"] },
  { key: "sugar", name: "Sugar", aisle: "Pantry", location: "pantry", unit: "cups", shelfDays: 365, aliases: ["granulated sugar", "sugar"] },
  { key: "honey", name: "Honey", aisle: "Pantry", location: "pantry", unit: "tbsp", shelfDays: 365, aliases: ["honey"] },
  { key: "olive-oil", name: "Olive oil", aisle: "Pantry", location: "pantry", unit: "tbsp", shelfDays: 365, aliases: ["extra virgin olive oil", "olive oil"] },
  { key: "soy", name: "Soy sauce", aisle: "Pantry", location: "pantry", unit: "tbsp", shelfDays: 365, aliases: ["soy sauce"] },
  { key: "beans", name: "Black beans", aisle: "Canned", location: "pantry", unit: "cans", shelfDays: 365, aliases: ["black beans", "beans"] },
  { key: "tomatoes", name: "Diced tomatoes", aisle: "Canned", location: "pantry", unit: "cans", shelfDays: 365, aliases: ["diced tomatoes", "canned tomatoes", "tomatoes"] },
  { key: "lentils", name: "Lentils", aisle: "Pantry", location: "pantry", unit: "cups", shelfDays: 365, aliases: ["dry lentils", "lentils"] },
  { key: "chickpeas", name: "Chickpeas", aisle: "Canned", location: "pantry", unit: "cans", shelfDays: 365, aliases: ["garbanzo", "chickpeas"] },
  { key: "onion", name: "Yellow onion", aisle: "Produce", location: "pantry", unit: "onions", shelfDays: 21, aliases: ["yellow onion", "onion"] },
  { key: "garlic", name: "Garlic", aisle: "Produce", location: "pantry", unit: "cloves", shelfDays: 30, aliases: ["garlic"] },
  { key: "ginger", name: "Ginger", aisle: "Produce", location: "fridge", unit: "tbsp", shelfDays: 21, aliases: ["fresh ginger", "ginger"] },
  { key: "spinach", name: "Baby spinach", aisle: "Produce", location: "fridge", unit: "oz", shelfDays: 5, aliases: ["baby spinach", "spinach"] },
  { key: "broccoli", name: "Broccoli", aisle: "Produce", location: "fridge", unit: "crowns", shelfDays: 5, aliases: ["broccoli crowns", "broccoli"] },
  { key: "carrot", name: "Carrots", aisle: "Produce", location: "fridge", unit: "carrots", shelfDays: 21, aliases: ["carrots", "carrot"] },
  { key: "potato", name: "Russet potatoes", aisle: "Produce", location: "pantry", unit: "potatoes", shelfDays: 30, aliases: ["russet potatoes", "russet", "potatoes", "potato"] },
  { key: "banana", name: "Bananas", aisle: "Produce", location: "pantry", unit: "bananas", shelfDays: 5, aliases: ["bananas", "banana"] },
  { key: "lemon", name: "Lemons", aisle: "Produce", location: "fridge", unit: "lemons", shelfDays: 21, aliases: ["lemons", "lemon"] },
  { key: "mushroom", name: "Mushrooms", aisle: "Produce", location: "fridge", unit: "oz", shelfDays: 5, aliases: ["baby bella", "mushrooms", "mushroom"] },
  { key: "bell", name: "Bell pepper", aisle: "Produce", location: "fridge", unit: "peppers", shelfDays: 7, aliases: ["bell pepper", "bell peppers"] },
  { key: "cumin", name: "Ground cumin", aisle: "Spices", location: "spices", unit: "tsp", shelfDays: 365, aliases: ["ground cumin", "cumin"] },
  { key: "salt", name: "Salt", aisle: "Spices", location: "spices", unit: "tsp", shelfDays: 999, aliases: ["kosher salt", "salt"] },
  { key: "pepper", name: "Black pepper", aisle: "Spices", location: "spices", unit: "tsp", shelfDays: 999, aliases: ["black pepper", "pepper"] },
  { key: "paprika", name: "Paprika", aisle: "Spices", location: "spices", unit: "tsp", shelfDays: 365, aliases: ["paprika"] },
  { key: "baking-powder", name: "Baking powder", aisle: "Pantry", location: "pantry", unit: "tsp", shelfDays: 365, aliases: ["baking powder"] },
];

export const FOOD_BY_KEY = new Map(FOODS.map((food) => [food.key, food]));

export const PURCHASE_QTY: Record<string, number> = {
  milk: 16,
  eggs: 12,
  butter: 8,
  cheddar: 8,
  yogurt: 2,
  chicken: 1.5,
  beef: 1,
  salmon: 0.75,
  shrimp: 1,
  bacon: 12,
  rice: 4,
  pasta: 16,
  bread: 8,
  tortillas: 8,
  oats: 3,
  flour: 4,
  sugar: 2,
  honey: 8,
  "olive-oil": 16,
  soy: 8,
  beans: 1,
  tomatoes: 1,
  lentils: 1,
  chickpeas: 1,
  onion: 1,
  garlic: 8,
  ginger: 2,
  spinach: 5,
  broccoli: 1,
  carrot: 4,
  potato: 4,
  banana: 5,
  lemon: 2,
  mushroom: 8,
  bell: 2,
  cumin: 4,
  salt: 8,
  pepper: 4,
  paprika: 4,
  "baking-powder": 4,
};

export const RECIPES: Recipe[] = [
  {
    id: "tomato-pasta",
    title: "Skillet tomato pasta",
    blurb: "A one-pan supper that uses the can already on the shelf.",
    minutes: 25,
    servings: 2,
    diets: ["vegetarian", "vegan"],
    ingredients: [
      { key: "pasta", qty: 8 },
      { key: "tomatoes", qty: 1 },
      { key: "garlic", qty: 3 },
      { key: "onion", qty: 0.5 },
      { key: "olive-oil", qty: 1 },
      { key: "salt", qty: 0.5 },
    ],
    steps: [
      "Boil the spaghetti in salted water until just shy of done. Save a cup of the water.",
      "Soften the onion in olive oil, then add the garlic for a minute.",
      "Pour in the tomatoes, simmer five minutes, and toss with the pasta and a splash of the pasta water.",
    ],
  },
  {
    id: "garlic-chicken",
    title: "Lemon garlic chicken",
    blurb: "Weeknight chicken with a pan sauce from butter and a lemon.",
    minutes: 30,
    servings: 2,
    diets: ["gluten-free"],
    ingredients: [
      { key: "chicken", qty: 1 },
      { key: "butter", qty: 2 },
      { key: "garlic", qty: 3 },
      { key: "lemon", qty: 1 },
      { key: "salt", qty: 0.5 },
      { key: "pepper", qty: 0.25 },
    ],
    steps: [
      "Salt and pepper the chicken. Brown it in butter, about five minutes a side.",
      "Add the garlic and the juice of the lemon. Cover and cook until the center is just done.",
      "Rest three minutes and spoon the pan juices over the top.",
    ],
  },
  {
    id: "spinach-eggs",
    title: "Spinach cheddar eggs",
    blurb: "A fast plate when the spinach is the thing about to wilt.",
    minutes: 12,
    servings: 1,
    diets: ["vegetarian", "gluten-free"],
    ingredients: [
      { key: "eggs", qty: 3 },
      { key: "spinach", qty: 2 },
      { key: "cheddar", qty: 1 },
      { key: "butter", qty: 1 },
      { key: "salt", qty: 0.25 },
    ],
    steps: [
      "Wilt the spinach in butter.",
      "Pour in the beaten eggs and stir gently until just set.",
      "Fold in the cheddar and take it off the heat.",
    ],
  },
  {
    id: "bean-rice",
    title: "Cumin black bean rice",
    blurb: "A pot of rice and a can of beans, finished with onion.",
    minutes: 28,
    servings: 3,
    diets: ["vegetarian", "vegan", "gluten-free"],
    ingredients: [
      { key: "rice", qty: 1.5 },
      { key: "beans", qty: 1 },
      { key: "cumin", qty: 1 },
      { key: "onion", qty: 0.5 },
      { key: "olive-oil", qty: 1 },
      { key: "salt", qty: 0.5 },
    ],
    steps: [
      "Cook the onion in olive oil until soft. Stir in the cumin.",
      "Add the rice and 3 cups of water. Simmer covered until the rice is tender.",
      "Fold in the beans and salt. Rest five minutes off the heat.",
    ],
  },
  {
    id: "oat-bowl",
    title: "Banana honey oats",
    blurb: "Breakfast that clears three things from the counter.",
    minutes: 10,
    servings: 1,
    diets: ["vegetarian"],
    ingredients: [
      { key: "oats", qty: 0.5 },
      { key: "milk", qty: 1 },
      { key: "banana", qty: 1 },
      { key: "honey", qty: 1 },
    ],
    steps: [
      "Simmer the oats and milk for five minutes.",
      "Slice the banana over the top and finish with honey.",
    ],
  },
  {
    id: "fried-rice",
    title: "Ginger fried rice",
    blurb: "Day-old rice, a couple of eggs, and a spoon of soy.",
    minutes: 18,
    servings: 2,
    diets: [],
    ingredients: [
      { key: "rice", qty: 2 },
      { key: "eggs", qty: 2 },
      { key: "soy", qty: 1 },
      { key: "carrot", qty: 1 },
      { key: "onion", qty: 0.5 },
      { key: "garlic", qty: 2 },
      { key: "ginger", qty: 1 },
      { key: "olive-oil", qty: 1 },
    ],
    steps: [
      "Scramble the eggs and set them aside.",
      "Cook the onion, carrot, garlic, and ginger in the oil until the onion is clear.",
      "Add the rice and soy, then fold the eggs back in.",
    ],
  },
  {
    id: "broccoli-chicken",
    title: "Broccoli chicken skillet",
    blurb: "One pan, a crown of broccoli, and the lemon left from last night.",
    minutes: 25,
    servings: 2,
    diets: ["gluten-free"],
    ingredients: [
      { key: "chicken", qty: 0.75 },
      { key: "broccoli", qty: 1 },
      { key: "lemon", qty: 0.5 },
      { key: "garlic", qty: 2 },
      { key: "olive-oil", qty: 1 },
      { key: "salt", qty: 0.5 },
    ],
    steps: [
      "Cut the chicken into pieces and brown it in olive oil. Set it aside.",
      "Add the broccoli and garlic with a splash of water. Cover two minutes.",
      "Return the chicken, squeeze the lemon over, and toss.",
    ],
  },
  {
    id: "potato-roast",
    title: "Paprika potatoes",
    blurb: "A sheet pan that makes the russets worth buying.",
    minutes: 40,
    servings: 3,
    diets: ["vegetarian", "vegan", "gluten-free"],
    ingredients: [
      { key: "potato", qty: 4 },
      { key: "olive-oil", qty: 2 },
      { key: "paprika", qty: 1 },
      { key: "salt", qty: 0.5 },
      { key: "garlic", qty: 2 },
    ],
    steps: [
      "Heat the oven to 425°F. Cut the potatoes into wedges.",
      "Toss with oil, paprika, salt, and smashed garlic.",
      "Roast until the edges are brown, about 35 minutes, turning once.",
    ],
  },
  {
    id: "yogurt-bowl",
    title: "Yogurt with honey",
    blurb: "Something cold that is already done.",
    minutes: 5,
    servings: 1,
    diets: ["vegetarian", "gluten-free"],
    ingredients: [
      { key: "yogurt", qty: 1 },
      { key: "honey", qty: 1 },
      { key: "banana", qty: 0.5 },
    ],
    steps: ["Spoon the yogurt into a bowl, slice the banana, and drizzle the honey."],
  },
  {
    id: "quesadilla",
    title: "Spinach cheddar fold",
    blurb: "A tortilla supper that also uses the greens.",
    minutes: 15,
    servings: 1,
    diets: ["vegetarian"],
    ingredients: [
      { key: "tortillas", qty: 2 },
      { key: "cheddar", qty: 2 },
      { key: "spinach", qty: 1 },
      { key: "onion", qty: 0.25 },
    ],
    steps: [
      "Warm a dry skillet. Lay in a tortilla, then cheddar, spinach, and onion.",
      "Top with the second tortilla and cook until the cheese melts, flipping once.",
    ],
  },
  {
    id: "beef-tacos",
    title: "Weeknight beef tacos",
    blurb: "Cumin, onion, and a pound of beef.",
    minutes: 20,
    servings: 3,
    diets: [],
    ingredients: [
      { key: "beef", qty: 1 },
      { key: "onion", qty: 0.5 },
      { key: "cumin", qty: 1 },
      { key: "salt", qty: 0.5 },
      { key: "tortillas", qty: 6 },
    ],
    steps: [
      "Brown the beef with the onion.",
      "Stir in cumin and salt, then warm the tortillas.",
    ],
  },
  {
    id: "salmon-rice",
    title: "Salmon over rice",
    blurb: "A fillet, a pot of rice, and soy at the end.",
    minutes: 25,
    servings: 2,
    diets: [],
    ingredients: [
      { key: "salmon", qty: 0.75 },
      { key: "rice", qty: 1 },
      { key: "soy", qty: 1 },
      { key: "ginger", qty: 1 },
      { key: "lemon", qty: 0.5 },
    ],
    steps: [
      "Simmer the rice.",
      "Sear the salmon, then finish with ginger and soy.",
      "Serve over the rice with lemon.",
    ],
  },
  {
    id: "shrimp-broccoli",
    title: "Shrimp and broccoli",
    blurb: "Frozen shrimp, the broccoli, and a hot pan.",
    minutes: 16,
    servings: 2,
    diets: ["gluten-free"],
    ingredients: [
      { key: "shrimp", qty: 0.75 },
      { key: "broccoli", qty: 1 },
      { key: "garlic", qty: 2 },
      { key: "soy", qty: 1 },
      { key: "ginger", qty: 1 },
      { key: "olive-oil", qty: 1 },
    ],
    steps: [
      "Sear the shrimp in oil and set them aside.",
      "Cook the broccoli with garlic and ginger, add soy, and return the shrimp.",
    ],
  },
  {
    id: "mushroom-pasta",
    title: "Butter mushroom pasta",
    blurb: "Mushrooms cooked down until they take up less room than you expect.",
    minutes: 22,
    servings: 2,
    diets: ["vegetarian"],
    ingredients: [
      { key: "pasta", qty: 8 },
      { key: "mushroom", qty: 8 },
      { key: "butter", qty: 2 },
      { key: "garlic", qty: 2 },
      { key: "salt", qty: 0.5 },
      { key: "pepper", qty: 0.25 },
    ],
    steps: [
      "Boil the pasta.",
      "Brown the mushrooms in butter, then add the garlic.",
      "Toss with the pasta, salt, and pepper.",
    ],
  },
  {
    id: "lentil-soup",
    title: "Onion lentil soup",
    blurb: "A pot that gets better and uses the dry lentils.",
    minutes: 40,
    servings: 4,
    diets: ["vegetarian", "vegan", "gluten-free"],
    ingredients: [
      { key: "lentils", qty: 1 },
      { key: "onion", qty: 1 },
      { key: "carrot", qty: 2 },
      { key: "garlic", qty: 3 },
      { key: "cumin", qty: 1 },
      { key: "olive-oil", qty: 1 },
      { key: "salt", qty: 1 },
    ],
    steps: [
      "Soften the onion and carrot in oil. Add garlic and cumin.",
      "Add the lentils and 4 cups of water. Simmer until the lentils are soft.",
      "Salt at the end.",
    ],
  },
  {
    id: "chickpea-stew",
    title: "Tomato chickpea stew",
    blurb: "Two cans and an onion.",
    minutes: 25,
    servings: 3,
    diets: ["vegetarian", "vegan"],
    ingredients: [
      { key: "chickpeas", qty: 1 },
      { key: "tomatoes", qty: 1 },
      { key: "onion", qty: 0.5 },
      { key: "garlic", qty: 2 },
      { key: "cumin", qty: 1 },
      { key: "olive-oil", qty: 1 },
      { key: "spinach", qty: 2 },
    ],
    steps: [
      "Cook the onion and garlic in oil. Stir in cumin, tomatoes, and chickpeas.",
      "Simmer ten minutes, then wilt the spinach in the pot.",
    ],
  },
  {
    id: "pancakes",
    title: "Plain pancakes",
    blurb: "Flour, milk, eggs, and baking powder.",
    minutes: 20,
    servings: 2,
    diets: ["vegetarian"],
    ingredients: [
      { key: "flour", qty: 1 },
      { key: "milk", qty: 1 },
      { key: "eggs", qty: 1 },
      { key: "baking-powder", qty: 2 },
      { key: "sugar", qty: 1 },
      { key: "butter", qty: 1 },
    ],
    steps: [
      "Stir the dry ingredients, then the milk and egg. Don't overmix.",
      "Cook spoonfuls in butter until the bubbles set, then flip.",
    ],
  },
  {
    id: "toast-eggs",
    title: "Eggs on toast",
    blurb: "The smallest dinner that still counts.",
    minutes: 8,
    servings: 1,
    diets: ["vegetarian"],
    ingredients: [
      { key: "eggs", qty: 2 },
      { key: "bread", qty: 2 },
      { key: "butter", qty: 1 },
      { key: "salt", qty: 0.25 },
    ],
    steps: ["Toast the bread and butter it. Fry the eggs in the rest of the butter and salt them."],
  },
];

export const SAMPLE_RECEIPT = `WALMART
SUPERCENTER
ST# 2147
10/22/26

GV WHOLE MILK GAL          3.64
BANANAS                    1.28
LARGE EGGS 18CT            4.12
CHICKEN BREAST             8.94
YELLOW ONION               0.98
GARLIC                     0.68
SPAGHETTI                  1.24
DICED TOMATOES             0.88
OLIVE OIL                  6.47
BABY SPINACH               2.48
JASMINE RICE               2.18
CHEDDAR BLOCK              3.56
SALTED BUTTER              4.28
BLACK BEANS                0.92
GROUND CUMIN               1.18
LEMONS                     0.78
SOURDOUGH                  3.48
GREEK YOGURT               4.96
OLD FASHIONED OATS         3.24
HONEY                      4.56
SOY SAUCE                  2.18
BROCCOLI CROWNS            1.98
RUSSET POTATOES            3.12
ALL PURPOSE FLOUR          2.48
GRANULATED SUGAR           2.28
CARROTS                    1.14
FRESH GINGER               0.84
PAPRIKA                    1.42
BLACK PEPPER               2.64
KOSHER SALT                1.18

SUBTOTAL                  79.36
TAX                        1.22
TOTAL                     80.58
`;
