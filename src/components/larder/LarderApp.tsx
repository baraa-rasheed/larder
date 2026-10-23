import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Archive,
  CalendarDays,
  Camera,
  Check,
  ClipboardPaste,
  Clock,
  Home,
  Minus,
  Plus,
  Search,
  ShoppingCart,
  Store,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";
import {
  FOOD_BY_KEY,
  RECIPES,
  SAMPLE_RECEIPT,
  type Diet,
  type Location,
} from "@/lib/larder/data";
import {
  addDays,
  daysUntil,
  formatQty,
  matchRecipe,
  parseReceipt,
  scaleIngredients,
  todayISO,
} from "@/lib/larder/logic";
import { readReceiptImage } from "@/lib/larder/read-receipt";
import { useLarder, type PantryItem } from "@/lib/larder/store";

type Tab = "home" | "cook" | "pantry" | "list" | "plan";
type Sheet =
  | { kind: "receipt" }
  | { kind: "recipe"; id: string }
  | { kind: "item"; id: string }
  | { kind: "add" }
  | null;

const TABS: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "cook", label: "Cook", icon: UtensilsCrossed },
  { id: "pantry", label: "Pantry", icon: Archive },
  { id: "list", label: "List", icon: ShoppingCart },
  { id: "plan", label: "Plan", icon: CalendarDays },
];

const LOCATIONS: { id: Location | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "fridge", label: "Fridge" },
  { id: "freezer", label: "Freezer" },
  { id: "pantry", label: "Pantry" },
  { id: "spices", label: "Spices" },
];

const DIETS: { id: Diet | "any"; label: string }[] = [
  { id: "any", label: "Any" },
  { id: "vegetarian", label: "Vegetarian" },
  { id: "vegan", label: "Vegan" },
  { id: "gluten-free", label: "Gluten-free" },
];

const AISLE_ORDER = ["Produce", "Meat", "Dairy", "Bakery", "Frozen", "Canned", "Pantry", "Spices", "Grocery"];

export function LarderApp() {
  const onboarded = useLarder((s) => s.onboarded);
  const [tab, setTab] = useState<Tab>("home");
  const [sheet, setSheet] = useState<Sheet>(null);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    void useLarder.persist.rehydrate();
  }, []);

  useEffect(() => {
    if (!note) return;
    const id = window.setTimeout(() => setNote(null), 2400);
    return () => window.clearTimeout(id);
  }, [note]);

  if (!onboarded) {
    return (
      <Phone>
        <Welcome
          onPaste={() => {
            useLarder.getState().finishOnboarding();
            setSheet({ kind: "receipt" });
          }}
          onSample={() => {
            const count = useLarder.getState().importSample();
            setNote(`Filed ${count} items from a sample Walmart receipt.`);
            setTab("home");
          }}
        />
        <SheetFrame open={sheet?.kind === "receipt"} onClose={() => setSheet(null)}>
          <ReceiptSheet
            onClose={() => setSheet(null)}
            onDone={(count, sample) => {
              setSheet(null);
              setNote(sample ? `Filed ${count} sample items.` : `Filed ${count} items into the pantry.`);
            }}
          />
        </SheetFrame>
      </Phone>
    );
  }

  return (
    <Phone>
      <div className="flex min-h-screen flex-col">
        <main className="flex-1 px-5 pb-28 pt-6">
          {tab === "home" && <HomeScreen onReceipt={() => setSheet({ kind: "receipt" })} onRecipe={(id) => setSheet({ kind: "recipe", id })} onCookTab={() => setTab("cook")} />}
          {tab === "cook" && <CookScreen onRecipe={(id) => setSheet({ kind: "recipe", id })} />}
          {tab === "pantry" && (
            <PantryScreen onItem={(id) => setSheet({ kind: "item", id })} onAdd={() => setSheet({ kind: "add" })} />
          )}
          {tab === "list" && <ListScreen />}
          {tab === "plan" && <PlanScreen onRecipe={(id) => setSheet({ kind: "recipe", id })} />}
        </main>
        <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-md border-t border-line bg-bg/95 px-2 pb-3 pt-2 backdrop-blur">
          <ul className="grid grid-cols-5">
            {TABS.map((item) => {
              const Icon = item.icon;
              const active = tab === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className={cn("tap flex w-full flex-col items-center gap-1 rounded-2xl py-2 text-xs", active ? "text-primary" : "text-muted")}
                    onClick={() => setTab(item.id)}
                  >
                    <span className="relative">
                      <Icon size={22} strokeWidth={active ? 2.25 : 1.75} />
                      {item.id === "list" && <ListBadge />}
                    </span>
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
      <SheetFrame open={sheet !== null} onClose={() => setSheet(null)}>
        {sheet?.kind === "receipt" && (
          <ReceiptSheet
            onClose={() => setSheet(null)}
            onDone={(count, sample) => {
              setSheet(null);
              setNote(sample ? `Filed ${count} sample items.` : `Filed ${count} items into the pantry.`);
              setTab("pantry");
            }}
          />
        )}
        {sheet?.kind === "recipe" && (
          <RecipeSheet
            id={sheet.id}
            onClose={() => setSheet(null)}
            onNote={(message) => {
              setNote(message);
              setSheet(null);
            }}
          />
        )}
        {sheet?.kind === "item" && <ItemSheet id={sheet.id} onClose={() => setSheet(null)} />}
        {sheet?.kind === "add" && <AddSheet onClose={() => setSheet(null)} />}
      </SheetFrame>
      {note && (
        <p className="fixed inset-x-0 top-4 z-50 mx-auto w-fit max-w-xs rounded-full bg-fg px-4 py-2 text-center text-sm text-primary-fg shadow-sm">
          {note}
        </p>
      )}
    </Phone>
  );
}

function ListBadge() {
  const count = useLarder((s) => s.list.filter((row) => !row.checked).length);
  if (count === 0) return null;
  return (
    <span className="absolute -right-2 -top-1 min-w-4 rounded-full bg-primary px-1 text-center text-xs leading-4 text-primary-fg">
      {count}
    </span>
  );
}

function Phone({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas">
      <div className="mx-auto min-h-screen w-full max-w-md overflow-x-hidden bg-bg text-fg shadow-sm">{children}</div>
    </div>
  );
}

function Welcome({ onPaste, onSample }: { onPaste: () => void; onSample: () => void }) {
  return (
    <div className="flex min-h-screen flex-col justify-between px-6 py-14">
      <div>
        <p className="enter-up text-sm font-medium tracking-widest text-muted">LARDER</p>
        <h1 className="enter-up mt-4 font-display text-5xl leading-none text-fg">What you have is the menu.</h1>
        <p className="enter-up mt-5 max-w-sm text-lg leading-relaxed text-muted">
          Paste a Walmart receipt. Larder files the food, shows what you can cook, and lists only the gaps.
        </p>
      </div>
      <div className="enter-up grid gap-3">
        <button type="button" className="tap rounded-full bg-primary px-5 py-4 text-base font-medium text-primary-fg" onClick={onPaste}>
          Paste a receipt
        </button>
        <button type="button" className="tap rounded-full border border-line bg-surface px-5 py-4 text-base font-medium text-fg" onClick={onSample}>
          Try a sample Walmart receipt
        </button>
        <p className="text-center text-sm text-muted">The sample is not your account. Live Walmart login needs a merchant-link partner.</p>
      </div>
    </div>
  );
}

function HomeScreen({
  onReceipt,
  onRecipe,
  onCookTab,
}: {
  onReceipt: () => void;
  onRecipe: (id: string) => void;
  onCookTab: () => void;
}) {
  const pantry = useLarder((s) => s.pantry);
  const receipts = useLarder((s) => s.receipts);
  const stock = useMemo(() => toStock(pantry), [pantry]);
  const ready = RECIPES.filter((recipe) => matchRecipe(recipe, stock).ready);
  const soon = [...pantry].filter((item) => daysUntil(item.expiresOn) <= 5).sort((a, b) => a.expiresOn.localeCompare(b.expiresOn));
  const last = receipts[0];
  const spend = spendByAisle(receipts);

  return (
    <div className="grid gap-6">
      <header className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm tracking-widest text-muted">LARDER</p>
          <h1 className="font-display text-4xl text-fg">Tonight</h1>
        </div>
        <button type="button" className="tap flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-medium text-primary-fg" onClick={onReceipt}>
          <Store size={16} />
          Receipt
        </button>
      </header>

      {pantry.length === 0 ? (
        <section className="rounded-3xl border border-line bg-surface p-5">
          <h2 className="font-display text-2xl">The pantry is empty</h2>
          <p className="mt-2 text-muted">A receipt is the fastest way in. Paper, email, or a photo.</p>
          <button type="button" className="tap mt-4 rounded-full bg-fg px-4 py-3 text-sm font-medium text-primary-fg" onClick={onReceipt}>
            Add a Walmart trip
          </button>
        </section>
      ) : (
        <>
          <section>
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="font-display text-2xl">Cook now</h2>
              <button type="button" className="text-sm text-primary" onClick={onCookTab}>
                All recipes
              </button>
            </div>
            {ready.length === 0 ? (
              <p className="text-muted">Nothing is a full match yet. Open Cook to see how close you are.</p>
            ) : (
              <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-1">
                {ready.slice(0, 6).map((recipe) => (
                  <button
                    key={recipe.id}
                    type="button"
                    className="tap w-52 shrink-0 rounded-3xl bg-surface p-4 text-left shadow-sm"
                    onClick={() => onRecipe(recipe.id)}
                  >
                    <p className="text-xs font-medium text-primary">Ready</p>
                    <p className="mt-2 font-display text-xl leading-tight">{recipe.title}</p>
                    <p className="mt-2 flex items-center gap-1 text-sm text-muted">
                      <Clock size={14} /> {recipe.minutes} min
                    </p>
                  </button>
                ))}
              </div>
            )}
          </section>

          {soon.length > 0 && (
            <section>
              <h2 className="mb-3 font-display text-2xl">Use soon</h2>
              <ul className="divide-y divide-line overflow-hidden rounded-3xl bg-surface">
                {soon.slice(0, 4).map((item) => (
                  <li key={item.id} className="flex items-center justify-between px-4 py-3">
                    <span>{item.name}</span>
                    <span className={cn("text-sm", daysUntil(item.expiresOn) <= 1 ? "text-primary" : "text-muted")}>
                      {expiryLabel(item.expiresOn)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      {last && (
        <section className="rounded-3xl bg-surface p-4">
          <p className="text-sm text-muted">{last.sample ? "Sample receipt" : last.store}</p>
          <p className="mt-1 font-display text-2xl">{last.lines.length} items filed</p>
          <p className="text-sm text-muted">{last.date}</p>
          {spend.length > 0 && (
            <ul className="mt-4 grid gap-2">
              {spend.slice(0, 4).map((row) => (
                <li key={row.aisle}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{row.aisle}</span>
                    <span className="text-muted">${row.total.toFixed(2)}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-line">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${row.share}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}

function CookScreen({ onRecipe }: { onRecipe: (id: string) => void }) {
  const pantry = useLarder((s) => s.pantry);
  const diet = useLarder((s) => s.diet);
  const cookNow = useLarder((s) => s.cookNow);
  const setDiet = useLarder((s) => s.setDiet);
  const setCookNow = useLarder((s) => s.setCookNow);
  const [query, setQuery] = useState("");
  const [maxMin, setMaxMin] = useState<number | null>(null);
  const stock = useMemo(() => toStock(pantry), [pantry]);

  const recipes = RECIPES.filter((recipe) => {
    if (diet !== "any" && !recipe.diets.includes(diet)) return false;
    if (maxMin && recipe.minutes > maxMin) return false;
    if (query) {
      const hay = `${recipe.title} ${recipe.ingredients.map((item) => FOOD_BY_KEY.get(item.key)?.name ?? "").join(" ")}`.toLowerCase();
      if (!hay.includes(query.toLowerCase())) return false;
    }
    const match = matchRecipe(recipe, stock);
    if (cookNow && !match.ready) return false;
    return true;
  }).sort((a, b) => {
    const ma = matchRecipe(a, stock);
    const mb = matchRecipe(b, stock);
    return mb.hit / mb.total - ma.hit / ma.total;
  });

  return (
    <div className="grid gap-4">
      <header>
        <h1 className="font-display text-4xl">Cook</h1>
        <p className="mt-1 text-muted">{cookNow ? "Only meals you can make now." : "Closest matches first."}</p>
      </header>
      <label className="flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-3">
        <Search size={16} className="text-muted" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search recipes or ingredients"
          className="w-full bg-transparent text-base outline-none placeholder:text-muted"
        />
      </label>
      <div className="grid grid-cols-2 rounded-full bg-line p-1">
        <button type="button" className={cn("tap rounded-full py-2 text-sm font-medium", !cookNow ? "bg-surface text-fg" : "text-muted")} onClick={() => setCookNow(false)}>
          All
        </button>
        <button type="button" className={cn("tap rounded-full py-2 text-sm font-medium", cookNow ? "bg-surface text-fg" : "text-muted")} onClick={() => setCookNow(true)}>
          Cook now
        </button>
      </div>
      <div className="flex gap-2 overflow-x-auto">
        {DIETS.map((item) => (
          <Chip key={item.id} active={diet === item.id} onClick={() => setDiet(item.id)}>
            {item.label}
          </Chip>
        ))}
        {[15, 30, 45].map((minutes) => (
          <Chip key={minutes} active={maxMin === minutes} onClick={() => setMaxMin(maxMin === minutes ? null : minutes)}>
            ≤ {minutes}m
          </Chip>
        ))}
      </div>
      {recipes.length === 0 ? (
        <p className="rounded-3xl bg-surface p-5 text-muted">No recipes in this filter. Turn off Cook now to see partial matches.</p>
      ) : (
        <ul className="grid gap-3">
          {recipes.map((recipe) => {
            const match = matchRecipe(recipe, stock);
            return (
              <li key={recipe.id}>
                <button type="button" className="tap w-full rounded-3xl bg-surface p-4 text-left" onClick={() => onRecipe(recipe.id)}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-2xl leading-tight">{recipe.title}</p>
                      <p className="mt-1 text-sm text-muted">{recipe.blurb}</p>
                    </div>
                    <span className={cn("shrink-0 rounded-full px-2 py-1 text-xs font-medium", match.ready ? "bg-primary/10 text-primary" : "bg-line text-muted")}>
                      {match.ready ? "Ready" : `${match.hit}/${match.total}`}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-muted">{recipe.minutes} min · serves {recipe.servings}</p>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function PantryScreen({ onItem, onAdd }: { onItem: (id: string) => void; onAdd: () => void }) {
  const pantry = useLarder((s) => s.pantry);
  const [place, setPlace] = useState<Location | "all">("all");
  const [query, setQuery] = useState("");
  const rows = pantry
    .filter((item) => place === "all" || item.location === place)
    .filter((item) => item.name.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="grid gap-4">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-4xl">Pantry</h1>
          <p className="text-muted">{pantry.length} items on hand</p>
        </div>
        <button type="button" className="tap grid size-11 place-items-center rounded-full bg-primary text-primary-fg" onClick={onAdd} aria-label="Add item">
          <Plus size={20} />
        </button>
      </header>
      <label className="flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-3">
        <Search size={16} className="text-muted" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find an item" className="w-full bg-transparent outline-none placeholder:text-muted" />
      </label>
      <div className="flex gap-2 overflow-x-auto">
        {LOCATIONS.map((item) => (
          <Chip key={item.id} active={place === item.id} onClick={() => setPlace(item.id)}>
            {item.label}
          </Chip>
        ))}
      </div>
      {rows.length === 0 ? (
        <p className="text-muted">Nothing in this spot.</p>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-3xl bg-surface">
          {rows.map((item) => (
            <li key={item.id}>
              <button type="button" className="tap flex w-full items-center justify-between gap-3 px-4 py-3 text-left" onClick={() => onItem(item.id)}>
                <span>
                  <span className="block">{item.name}</span>
                  <span className="text-sm text-muted">
                    {formatQty(item.qty)} {item.unit} · {item.location}
                  </span>
                </span>
                <span className={cn("text-sm", daysUntil(item.expiresOn) <= 2 ? "text-primary" : "text-muted")}>{expiryLabel(item.expiresOn)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ListScreen() {
  const list = useLarder((s) => s.list);
  const toggle = useLarder((s) => s.toggleList);
  const shelve = useLarder((s) => s.shelveChecked);
  const clear = useLarder((s) => s.clearChecked);
  const groups = new Map<string, typeof list>();
  for (const item of list) {
    const bucket = groups.get(item.aisle) ?? [];
    bucket.push(item);
    groups.set(item.aisle, bucket);
  }
  const aisles = [...groups.keys()].sort((a, b) => aisleRank(a) - aisleRank(b));
  const open = list.filter((item) => !item.checked).length;
  const checked = list.length - open;

  return (
    <div className="grid gap-4">
      <header>
        <h1 className="font-display text-4xl">List</h1>
        <p className="text-muted">{open === 0 ? "Nothing to buy." : `${open} still to buy`}</p>
      </header>
      {list.length === 0 ? (
        <p className="rounded-3xl bg-surface p-5 text-muted">Missing ingredients from a recipe land here, grouped by aisle.</p>
      ) : (
        aisles.map((aisle) => (
          <section key={aisle}>
            <h2 className="mb-2 text-sm font-medium tracking-wide text-muted">{aisle}</h2>
            <ul className="divide-y divide-line overflow-hidden rounded-3xl bg-surface">
              {groups.get(aisle)?.map((item) => (
                <li key={item.id}>
                  <button type="button" className="tap flex w-full items-center gap-3 px-4 py-3 text-left" onClick={() => toggle(item.id)}>
                    <span className={cn("grid size-6 place-items-center rounded-full border", item.checked ? "border-primary bg-primary text-primary-fg" : "border-line")}>
                      {item.checked && <Check size={14} />}
                    </span>
                    <span className={cn(item.checked && "text-muted line-through")}>
                      {item.name}
                      <span className="mt-0.5 block text-sm text-muted">
                        {formatQty(item.qty)} {item.unit}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
      {checked > 0 && (
        <div className="grid gap-2">
          <button type="button" className="tap rounded-full bg-primary py-3 font-medium text-primary-fg" onClick={shelve}>
            Shelve checked into the pantry
          </button>
          <button type="button" className="tap rounded-full py-3 text-sm text-muted" onClick={clear}>
            Remove checked
          </button>
        </div>
      )}
    </div>
  );
}

function PlanScreen({ onRecipe }: { onRecipe: (id: string) => void }) {
  const plan = useLarder((s) => s.plan);
  const pantry = useLarder((s) => s.pantry);
  const setPlan = useLarder((s) => s.setPlan);
  const shopPlan = useLarder((s) => s.shopPlan);
  const [picked, setPicked] = useState(todayISO());
  const days = Array.from({ length: 7 }, (_, index) => addDays(todayISO(), index));
  const stock = useMemo(() => toStock(pantry), [pantry]);
  const recipeId = plan[picked];
  const recipe = RECIPES.find((item) => item.id === recipeId);
  const suggestions = RECIPES.filter((item) => matchRecipe(item, stock).ready && !Object.values(plan).includes(item.id)).slice(0, 4);

  return (
    <div className="grid gap-4">
      <header>
        <h1 className="font-display text-4xl">Plan</h1>
        <p className="text-muted">One meal a day. The list gets only what you still need.</p>
      </header>
      <div className="grid grid-cols-7 gap-1">
        {days.map((iso) => {
          const date = parseISO(iso);
          const active = iso === picked;
          return (
            <button key={iso} type="button" className={cn("tap rounded-2xl py-2 text-center", active ? "bg-fg text-primary-fg" : "bg-surface text-fg")} onClick={() => setPicked(iso)}>
              <span className="block text-xs opacity-70">{date.toLocaleDateString("en-US", { weekday: "narrow" })}</span>
              <span className="font-display text-lg">{date.getDate()}</span>
            </button>
          );
        })}
      </div>
      {recipe ? (
        <button type="button" className="tap rounded-3xl bg-surface p-4 text-left" onClick={() => onRecipe(recipe.id)}>
          <p className="text-sm text-muted">Planned</p>
          <p className="font-display text-2xl">{recipe.title}</p>
          <p className="mt-1 text-sm text-muted">{recipe.minutes} min</p>
        </button>
      ) : (
        <p className="rounded-3xl border border-dashed border-line p-4 text-muted">Nothing planned this day.</p>
      )}
      <div className="flex gap-2">
        {recipe && (
          <button type="button" className="tap rounded-full border border-line px-4 py-2 text-sm" onClick={() => setPlan(picked, null)}>
            Clear day
          </button>
        )}
        {Object.keys(plan).length > 0 && (
          <button type="button" className="tap rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-fg" onClick={shopPlan}>
            Shop the gaps
          </button>
        )}
      </div>
      <section>
        <h2 className="mb-2 font-display text-2xl">You can make</h2>
        <ul className="grid gap-2">
          {(suggestions.length ? suggestions : RECIPES.slice(0, 4)).map((item) => (
            <li key={item.id}>
              <button type="button" className="tap flex w-full items-center justify-between rounded-2xl bg-surface px-4 py-3 text-left" onClick={() => setPlan(picked, item.id)}>
                <span>{item.title}</span>
                <span className="text-sm text-primary">Add</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function RecipeSheet({ id, onClose, onNote }: { id: string; onClose: () => void; onNote: (message: string) => void }) {
  const recipe = RECIPES.find((item) => item.id === id);
  const pantry = useLarder((s) => s.pantry);
  const cook = useLarder((s) => s.cook);
  const addMissing = useLarder((s) => s.addMissing);
  const [servings, setServings] = useState(recipe?.servings ?? 1);
  if (!recipe) return null;
  const scaled = scaleIngredients(recipe, servings);
  const stock = toStock(pantry);
  const rows = scaled.map((ingredient) => {
    const have = stock.find((item) => item.key === ingredient.key)?.qty ?? 0;
    const food = FOOD_BY_KEY.get(ingredient.key);
    return { ingredient, have, food, ok: have + 0.001 >= ingredient.qty };
  });
  const missing = rows.filter((row) => !row.ok).length;

  return (
    <div>
      <SheetHead title={recipe.title} onClose={onClose} />
      <p className="text-muted">{recipe.blurb}</p>
      <p className="mt-2 text-sm text-muted">{recipe.minutes} min</p>
      <div className="mt-4 flex items-center gap-3">
        <span className="text-sm text-muted">Servings</span>
        <Stepper value={servings} onChange={setServings} min={1} max={8} />
      </div>
      <ul className="mt-4 divide-y divide-line">
        {rows.map((row) => (
          <li key={row.ingredient.key} className="flex items-center justify-between py-2">
            <span className={row.ok ? "" : "text-muted"}>
              {formatQty(row.ingredient.qty)} {row.food?.unit} {row.food?.name}
            </span>
            <span className={cn("text-sm", row.ok ? "text-primary" : "text-muted")}>{row.ok ? "Have" : "Need"}</span>
          </li>
        ))}
      </ul>
      <ol className="mt-4 grid list-decimal gap-2 pl-5 text-sm leading-relaxed">
        {recipe.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <div className="sticky bottom-0 mt-5 grid gap-2 bg-surface pt-3">
        {missing > 0 && (
          <button
            type="button"
            className="tap rounded-full bg-fg py-3 font-medium text-primary-fg"
            onClick={() => {
              addMissing(recipe.id, servings);
              onNote(`${missing} gap${missing === 1 ? "" : "s"} added to the list.`);
            }}
          >
            Add missing to the list
          </button>
        )}
        <button
          type="button"
          className="tap rounded-full bg-primary py-3 font-medium text-primary-fg"
          onClick={() => {
            cook(recipe.id, servings);
            onNote("Pantry updated for what you cooked.");
          }}
        >
          I cooked this
        </button>
      </div>
    </div>
  );
}

function ItemSheet({ id, onClose }: { id: string; onClose: () => void }) {
  const item = useLarder((s) => s.pantry.find((row) => row.id === id));
  const setQty = useLarder((s) => s.setQty);
  const setLocation = useLarder((s) => s.setLocation);
  const useUp = useLarder((s) => s.useUp);
  const [ask, setAsk] = useState(false);
  if (!item) return null;
  return (
    <div>
      <SheetHead title={item.name} onClose={onClose} />
      <p className="text-sm text-muted">
        {item.aisle} · use {expiryLabel(item.expiresOn).toLowerCase()}
      </p>
      <div className="mt-4 flex items-center justify-between">
        <span>
          {formatQty(item.qty)} {item.unit}
        </span>
        <Stepper value={item.qty} min={0} max={99} step={item.qty >= 5 ? 1 : 0.5} onChange={(qty) => setQty(item.id, qty)} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {LOCATIONS.filter((place) => place.id !== "all").map((place) => (
          <Chip key={place.id} active={item.location === place.id} onClick={() => setLocation(item.id, place.id as Location)}>
            {place.label}
          </Chip>
        ))}
      </div>
      {!ask ? (
        <button type="button" className="tap mt-6 w-full rounded-full border border-line py-3" onClick={() => setAsk(true)}>
          Used up
        </button>
      ) : (
        <div className="mt-6 grid gap-2">
          <p className="text-sm text-muted">Put it on the shopping list?</p>
          <button type="button" className="tap rounded-full bg-primary py-3 font-medium text-primary-fg" onClick={() => { useUp(item.id, true); onClose(); }}>
            Yes, add to the list
          </button>
          <button type="button" className="tap rounded-full border border-line py-3" onClick={() => { useUp(item.id, false); onClose(); }}>
            No, just remove
          </button>
        </div>
      )}
    </div>
  );
}

function AddSheet({ onClose }: { onClose: () => void }) {
  const addManual = useLarder((s) => s.addManual);
  const [name, setName] = useState("");
  const [qty, setQty] = useState(1);
  const [location, setLocation] = useState<Location>("pantry");
  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (!name.trim()) return;
        addManual({ name: name.trim(), qty, location });
        onClose();
      }}
    >
      <SheetHead title="Add item" onClose={onClose} />
      <input
        autoFocus
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Milk, rice, lemons"
        className="rounded-2xl border border-line bg-bg px-4 py-3 outline-none"
      />
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted">Quantity</span>
        <Stepper value={qty} min={0.5} max={40} step={0.5} onChange={setQty} />
      </div>
      <div className="flex flex-wrap gap-2">
        {LOCATIONS.filter((place) => place.id !== "all").map((place) => (
          <Chip key={place.id} active={location === place.id} onClick={() => setLocation(place.id as Location)}>
            {place.label}
          </Chip>
        ))}
      </div>
      <button type="submit" className="tap rounded-full bg-primary py-3 font-medium text-primary-fg" disabled={!name.trim()}>
        Save
      </button>
    </form>
  );
}

function ReceiptSheet({ onClose, onDone }: { onClose: () => void; onDone: (count: number, sample: boolean) => void }) {
  const importLines = useLarder((s) => s.importLines);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fileText = (raw: string, sample: boolean) => {
    const lines = parseReceipt(raw);
    if (lines.length === 0) {
      setError("No food lines in that text. Include item names, one per line.");
      return;
    }
    const count = importLines(lines, { store: "Walmart", sample });
    onDone(count, sample);
  };

  return (
    <div>
      <SheetHead title="Walmart receipt" onClose={onClose} />
      <p className="text-sm leading-relaxed text-muted">
        Walmart does not give outside apps your purchase history. Paste the receipt email or the paper receipt and each food line is filed into the pantry. A live login needs a Knot or BlinkReceipt key, which this preview does not have.
      </p>
      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder={"GV WHOLE MILK GAL   3.64\nBANANAS   1.28"}
        rows={7}
        className="mt-4 w-full resize-none rounded-2xl border border-line bg-bg px-4 py-3 text-sm outline-none"
      />
      {error && <p className="mt-2 text-sm text-primary">{error}</p>}
      <div className="mt-4 grid gap-2">
        <button type="button" className="tap flex items-center justify-center gap-2 rounded-full bg-primary py-3 font-medium text-primary-fg" disabled={busy || text.trim().length < 3} onClick={() => fileText(text, false)}>
          <ClipboardPaste size={16} />
          File this receipt
        </button>
        <button
          type="button"
          className="tap flex items-center justify-center gap-2 rounded-full border border-line py-3"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
        >
          <Camera size={16} />
          {busy ? "Reading photo…" : "Photo of a receipt"}
        </button>
        <button type="button" className="tap rounded-full py-3 text-sm text-muted" onClick={() => fileText(SAMPLE_RECEIPT, true)}>
          Use a sample Walmart receipt
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (!file) return;
          setBusy(true);
          setError(null);
          try {
            const imageDataUrl = await shrinkImage(file);
            const result = await readReceiptImage({ data: { imageDataUrl } });
            if (!result.ok) {
              setError(result.error);
              return;
            }
            setText(result.text);
          } catch {
            setError("Couldn't read that photo. Paste the text instead.");
          } finally {
            setBusy(false);
          }
        }}
      />
    </div>
  );
}

function SheetHead({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="mb-3 flex items-start justify-between gap-3">
      <h2 className="font-display text-3xl leading-tight">{title}</h2>
      <button type="button" className="tap grid size-10 shrink-0 place-items-center rounded-full bg-line" onClick={onClose} aria-label="Close">
        <X size={18} />
      </button>
    </div>
  );
}

function SheetFrame({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  const { shown, on } = usePresence(open);
  if (!shown) return null;
  return (
    <div className="fixed inset-0 z-40">
      <button type="button" aria-label="Close" className={cn("fade-scrim absolute inset-0 bg-fg/40", on ? "opacity-100" : "opacity-0")} onClick={onClose} />
      <div className={cn("sheet-panel absolute inset-x-0 bottom-0 mx-auto max-h-[88vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-surface px-5 pb-8 pt-4", on ? "translate-y-0" : "translate-y-full")}>
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-line" />
        {children}
      </div>
    </div>
  );
}

function usePresence(open: boolean) {
  const [shown, setShown] = useState(open);
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (open) {
      setShown(true);
      const frame = requestAnimationFrame(() => setOn(true));
      return () => cancelAnimationFrame(frame);
    }
    setOn(false);
    const timer = window.setTimeout(() => setShown(false), 220);
    return () => window.clearTimeout(timer);
  }, [open]);
  return { shown, on };
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={cn("tap shrink-0 rounded-full px-3 py-2 text-sm", active ? "bg-fg text-primary-fg" : "bg-surface text-fg")}>
      {children}
    </button>
  );
}

function Stepper({
  value,
  onChange,
  min,
  max,
  step = 1,
}: {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-line p-1">
      <button type="button" className="tap grid size-9 place-items-center rounded-full bg-surface" onClick={() => onChange(Math.max(min, Math.round((value - step) * 100) / 100))} aria-label="Decrease">
        <Minus size={16} />
      </button>
      <span className="min-w-8 text-center text-sm">{formatQty(value)}</span>
      <button type="button" className="tap grid size-9 place-items-center rounded-full bg-surface" onClick={() => onChange(Math.min(max, Math.round((value + step) * 100) / 100))} aria-label="Increase">
        <Plus size={16} />
      </button>
    </span>
  );
}

function toStock(pantry: PantryItem[]) {
  return pantry.filter((item) => item.key).map((item) => ({ key: item.key as string, qty: item.qty }));
}

function expiryLabel(iso: string) {
  const days = daysUntil(iso);
  if (days < 0) return "Expired";
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `${days} days`;
}

function aisleRank(aisle: string) {
  const index = AISLE_ORDER.indexOf(aisle);
  return index === -1 ? 99 : index;
}

function parseISO(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

function spendByAisle(receipts: { lines: { aisle: string; price?: number }[] }[]) {
  const totals = new Map<string, number>();
  for (const receipt of receipts) {
    for (const line of receipt.lines) {
      if (!line.price) continue;
      totals.set(line.aisle, (totals.get(line.aisle) ?? 0) + line.price);
    }
  }
  const rows = [...totals.entries()].map(([aisle, total]) => ({ aisle, total }));
  const max = Math.max(...rows.map((row) => row.total), 1);
  return rows
    .map((row) => ({ ...row, share: Math.round((row.total / max) * 100) }))
    .sort((a, b) => b.total - a.total);
}

async function shrinkImage(file: File) {
  const url = URL.createObjectURL(file);
  try {
    const image = await loadImage(url);
    const scale = Math.min(1, 1200 / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("canvas");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.7);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("image"));
    image.src = url;
  });
}

