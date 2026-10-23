import { FOOD_BY_KEY, FOODS, PURCHASE_QTY, type Food, type Recipe, type RecipeIngredient } from "./data";

export type ParsedLine = {
  key: string | null;
  name: string;
  qty: number;
  unit: string;
  price?: number;
  aisle: string;
  location: Food["location"];
  shelfDays: number;
};

const SKIP =
  /^(walmart|save money|live better|supercenter|subtotal|tax|total|change|visa|mastercard|discover|amex|debit|credit|cash|payment|approval|account|balance|survey|give us|thank|feedback|manager|fuel|you saved|items sold|items in|purchase|store #|st#|op#|te#|tc#|ref|aid|network|terminal|cashier|ebt|discount|promo|coupon|bag fee|recycling|amount|tend|\*+|-+|\d{2}\/\d{2})/i;

const PRICE = /\$?\s*(\d+\.\d{2})\s*[A-Z]?\s*$/;

export function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function titleCase(value: string) {
  return normalize(value).replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}

export function resolveFood(raw: string): Food | null {
  const name = normalize(raw);
  if (name.length < 3) return null;
  let best: Food | null = null;
  let bestLen = 0;
  for (const food of FOODS) {
    for (const alias of food.aliases) {
      const needle = normalize(alias);
      if (needle.length < 3) continue;
      if (name === needle || name.includes(needle)) {
        if (needle.length > bestLen) {
          best = food;
          bestLen = needle.length;
        }
      }
    }
  }
  return best;
}

export function todayISO(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDays(iso: string, days: number) {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, (m ?? 1) - 1, d ?? 1);
  date.setDate(date.getDate() + days);
  return todayISO(date);
}

export function daysUntil(iso: string, today = todayISO()) {
  const [y1, m1, d1] = today.split("-").map(Number);
  const [y2, m2, d2] = iso.split("-").map(Number);
  const a = Date.UTC(y1, (m1 ?? 1) - 1, d1 ?? 1);
  const b = Date.UTC(y2, (m2 ?? 1) - 1, d2 ?? 1);
  return Math.round((b - a) / 86400000);
}

export function formatQty(qty: number) {
  if (!Number.isFinite(qty)) return "0";
  const rounded = Math.round(qty * 100) / 100;
  if (Math.abs(rounded - 0.25) < 0.01) return "¼";
  if (Math.abs(rounded - 0.5) < 0.01) return "½";
  if (Math.abs(rounded - 0.75) < 0.01) return "¾";
  if (Number.isInteger(rounded)) return String(rounded);
  return String(rounded);
}

export function parseReceipt(text: string): ParsedLine[] {
  const rawLines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const items: ParsedLine[] = [];
  let pending: string | null = null;

  const emit = (label: string, price?: number) => {
    const cleaned = label.replace(PRICE, "").replace(/\s{2,}/g, " ").trim();
    if (!cleaned || SKIP.test(cleaned) || cleaned.length < 3) return;
    const food = resolveFood(cleaned);
    const qtyMatch = cleaned.match(/(\d+)\s*ct\b/i);
    const qty = qtyMatch ? Number(qtyMatch[1]) : food ? (PURCHASE_QTY[food.key] ?? 1) : 1;
    items.push({
      key: food?.key ?? null,
      name: food?.name ?? titleCase(cleaned),
      qty,
      unit: food?.unit ?? "items",
      price,
      aisle: food?.aisle ?? "Grocery",
      location: food?.location ?? "pantry",
      shelfDays: food?.shelfDays ?? 14,
    });
  };

  for (const line of rawLines) {
    if (SKIP.test(line)) {
      pending = null;
      continue;
    }
    const priceMatch = line.match(PRICE);
    if (priceMatch && line.replace(PRICE, "").trim().length > 0) {
      emit(line.replace(PRICE, "").trim(), Number(priceMatch[1]));
      pending = null;
      continue;
    }
    if (priceMatch && pending) {
      emit(pending, Number(priceMatch[1]));
      pending = null;
      continue;
    }
    if (!priceMatch && /[a-z]/i.test(line)) pending = line;
  }

  const merged = new Map<string, ParsedLine>();
  const loose: ParsedLine[] = [];
  for (const item of items) {
    const id = item.key ?? `raw:${normalize(item.name)}`;
    const existing = merged.get(id);
    if (!existing) {
      merged.set(id, { ...item });
      continue;
    }
    existing.qty += item.qty;
    if (item.price) existing.price = (existing.price ?? 0) + item.price;
  }
  for (const item of merged.values()) loose.push(item);
  return loose;
}

export type Stock = { key: string; qty: number };

export function ingredientStatus(ingredient: RecipeIngredient, stock: Stock[]) {
  const have = stock.find((item) => item.key === ingredient.key)?.qty ?? 0;
  return { have, need: ingredient.qty, ok: have + 0.001 >= ingredient.qty };
}

export function matchRecipe(recipe: Recipe, stock: Stock[]) {
  const rows = recipe.ingredients.map((ingredient) => ({
    ingredient,
    ...ingredientStatus(ingredient, stock),
  }));
  const hit = rows.filter((row) => row.ok).length;
  return {
    rows,
    hit,
    total: rows.length,
    ready: hit === rows.length && rows.length > 0,
  };
}

export function scaleIngredients(recipe: Recipe, servings: number) {
  const factor = servings / recipe.servings;
  return recipe.ingredients.map((ingredient) => ({
    ...ingredient,
    qty: Math.round(ingredient.qty * factor * 100) / 100,
  }));
}

export function foodOrNull(key: string) {
  return FOOD_BY_KEY.get(key) ?? null;
}
