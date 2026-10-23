import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { FOOD_BY_KEY, RECIPES, SAMPLE_RECEIPT, type Diet, type Location } from "./data";
import { addDays, parseReceipt, resolveFood, todayISO, type ParsedLine } from "./logic";

export type PantryItem = {
  id: string;
  key: string | null;
  name: string;
  qty: number;
  unit: string;
  location: Location;
  aisle: string;
  expiresOn: string;
};

export type ListItem = {
  id: string;
  key: string | null;
  name: string;
  qty: number;
  unit: string;
  aisle: string;
  checked: boolean;
};

export type ReceiptLine = {
  name: string;
  qty: number;
  unit: string;
  price?: number;
  aisle: string;
};

export type Receipt = {
  id: string;
  store: string;
  date: string;
  sample: boolean;
  lines: ReceiptLine[];
};

type LarderState = {
  onboarded: boolean;
  diet: Diet | "any";
  cookNow: boolean;
  pantry: PantryItem[];
  list: ListItem[];
  receipts: Receipt[];
  plan: Record<string, string>;
  finishOnboarding: () => void;
  setDiet: (diet: Diet | "any") => void;
  setCookNow: (value: boolean) => void;
  importLines: (lines: ParsedLine[], opts: { store: string; date?: string; sample?: boolean }) => number;
  importSample: () => number;
  setQty: (id: string, qty: number) => void;
  setLocation: (id: string, location: Location) => void;
  removeItem: (id: string) => void;
  useUp: (id: string, toList: boolean) => void;
  addManual: (input: { name: string; qty: number; location: Location }) => void;
  cook: (recipeId: string, servings: number) => void;
  addMissing: (recipeId: string, servings: number) => void;
  shopPlan: () => void;
  toggleList: (id: string) => void;
  shelveChecked: () => void;
  clearChecked: () => void;
  setPlan: (date: string, recipeId: string | null) => void;
  reset: () => void;
};

function uid() {
  const cryptoRef = globalThis.crypto;
  if (cryptoRef && typeof cryptoRef.randomUUID === "function") return cryptoRef.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function mergeLine(pantry: PantryItem[], line: ParsedLine, date: string): PantryItem[] {
  const expiresOn = addDays(date, line.shelfDays);
  const index = pantry.findIndex((item) => (line.key ? item.key === line.key : item.name === line.name));
  if (index === -1) {
    return [
      {
        id: uid(),
        key: line.key,
        name: line.name,
        qty: line.qty,
        unit: line.unit,
        location: line.location,
        aisle: line.aisle,
        expiresOn,
      },
      ...pantry,
    ];
  }
  return pantry.map((item, i) =>
    i === index
      ? {
          ...item,
          qty: Math.round((item.qty + line.qty) * 100) / 100,
          expiresOn: expiresOn > item.expiresOn ? expiresOn : item.expiresOn,
        }
      : item,
  );
}

function pushList(list: ListItem[], item: Omit<ListItem, "id" | "checked">): ListItem[] {
  const existing = list.find((row) => !row.checked && (item.key ? row.key === item.key : row.name === item.name));
  if (existing) {
    return list.map((row) =>
      row.id === existing.id ? { ...row, qty: Math.round((row.qty + item.qty) * 100) / 100 } : row,
    );
  }
  return [...list, { ...item, id: uid(), checked: false }];
}

const empty = {
  onboarded: false,
  diet: "any" as const,
  cookNow: true,
  pantry: [] as PantryItem[],
  list: [] as ListItem[],
  receipts: [] as Receipt[],
  plan: {} as Record<string, string>,
};

export const useLarder = create<LarderState>()(
  persist(
    (set, get) => ({
      ...empty,
      finishOnboarding: () => set({ onboarded: true }),
      setDiet: (diet) => set({ diet }),
      setCookNow: (cookNow) => set({ cookNow }),
      importLines: (lines, opts) => {
        if (lines.length === 0) return 0;
        const date = opts.date ?? todayISO();
        let pantry = get().pantry;
        for (const line of lines) pantry = mergeLine(pantry, line, date);
        const receipt: Receipt = {
          id: uid(),
          store: opts.store,
          date,
          sample: Boolean(opts.sample),
          lines: lines.map((line) => ({
            name: line.name,
            qty: line.qty,
            unit: line.unit,
            price: line.price,
            aisle: line.aisle,
          })),
        };
        set({ pantry, receipts: [receipt, ...get().receipts].slice(0, 24), onboarded: true });
        return lines.length;
      },
      importSample: () => get().importLines(parseReceipt(SAMPLE_RECEIPT), { store: "Walmart", sample: true }),
      setQty: (id, qty) =>
        set({
          pantry: get().pantry.flatMap((item) => {
            if (item.id !== id) return [item];
            if (qty <= 0) return [];
            return [{ ...item, qty: Math.round(qty * 100) / 100 }];
          }),
        }),
      setLocation: (id, location) =>
        set({
          pantry: get().pantry.map((item) => (item.id === id ? { ...item, location } : item)),
        }),
      removeItem: (id) => set({ pantry: get().pantry.filter((item) => item.id !== id) }),
      useUp: (id, toList) => {
        const item = get().pantry.find((row) => row.id === id);
        if (!item) return;
        const pantry = get().pantry.filter((row) => row.id !== id);
        const list = toList
          ? pushList(get().list, {
              key: item.key,
              name: item.name,
              qty: 1,
              unit: item.unit,
              aisle: item.aisle,
            })
          : get().list;
        set({ pantry, list });
      },
      addManual: ({ name, qty, location }) => {
        const resolved = resolveFood(name);
        const line: ParsedLine = resolved
          ? {
              key: resolved.key,
              name: resolved.name,
              qty,
              unit: resolved.unit,
              aisle: resolved.aisle,
              location,
              shelfDays: resolved.shelfDays,
            }
          : {
              key: null,
              name: name.trim(),
              qty,
              unit: "items",
              aisle: "Grocery",
              location,
              shelfDays: 14,
            };
        set({ pantry: mergeLine(get().pantry, line, todayISO()), onboarded: true });
      },
      cook: (recipeId, servings) => {
        const recipe = RECIPES.find((entry) => entry.id === recipeId);
        if (!recipe) return;
        const factor = servings / recipe.servings;
        let pantry = get().pantry;
        for (const ingredient of recipe.ingredients) {
          const need = ingredient.qty * factor;
          pantry = pantry.flatMap((item) => {
            if (item.key !== ingredient.key) return [item];
            const next = Math.round((item.qty - need) * 100) / 100;
            if (next <= 0.05) return [];
            return [{ ...item, qty: next }];
          });
        }
        set({ pantry });
      },
      addMissing: (recipeId, servings) => {
        const recipe = RECIPES.find((entry) => entry.id === recipeId);
        if (!recipe) return;
        const factor = servings / recipe.servings;
        let list = get().list;
        for (const ingredient of recipe.ingredients) {
          const food = FOOD_BY_KEY.get(ingredient.key);
          if (!food) continue;
          const have = get().pantry.find((item) => item.key === ingredient.key)?.qty ?? 0;
          const need = Math.round(ingredient.qty * factor * 100) / 100;
          if (have + 0.001 >= need) continue;
          list = pushList(list, {
            key: food.key,
            name: food.name,
            qty: Math.round((need - have) * 100) / 100,
            unit: food.unit,
            aisle: food.aisle,
          });
        }
        set({ list });
      },
      shopPlan: () => {
        const ids = Object.values(get().plan);
        for (const id of ids) get().addMissing(id, RECIPES.find((entry) => entry.id === id)?.servings ?? 1);
      },
      toggleList: (id) =>
        set({
          list: get().list.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)),
        }),
      shelveChecked: () => {
        const checked = get().list.filter((item) => item.checked);
        let pantry = get().pantry;
        for (const item of checked) {
          const food = item.key ? FOOD_BY_KEY.get(item.key) : undefined;
          pantry = mergeLine(
            pantry,
            {
              key: item.key,
              name: item.name,
              qty: item.qty,
              unit: item.unit,
              aisle: item.aisle,
              location: food?.location ?? "pantry",
              shelfDays: food?.shelfDays ?? 14,
            },
            todayISO(),
          );
        }
        set({ pantry, list: get().list.filter((item) => !item.checked) });
      },
      clearChecked: () => set({ list: get().list.filter((item) => !item.checked) }),
      setPlan: (date, recipeId) => {
        const plan = { ...get().plan };
        if (!recipeId) delete plan[date];
        else plan[date] = recipeId;
        set({ plan });
      },
      reset: () => set({ ...empty, onboarded: false }),
    }),
    {
      name: "larder-v1",
      storage: createJSONStorage(() => AsyncStorage),
      skipHydration: true,
      partialize: (state) => ({
        onboarded: state.onboarded,
        diet: state.diet,
        cookNow: state.cookNow,
        pantry: state.pantry,
        list: state.list,
        receipts: state.receipts,
        plan: state.plan,
      }),
    },
  ),
);
