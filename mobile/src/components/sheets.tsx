import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Chip, PrimaryButton, SecondaryButton, Stepper, colors } from "@/components/ui";
import { FOOD_BY_KEY, RECIPES, type Location } from "@/lib/larder/data";
import { formatQty, parseReceipt, scaleIngredients } from "@/lib/larder/logic";
import { useLarder } from "@/lib/larder/store";
import { expiryLabel, toStock } from "@/lib/larder/view";
import { useUi } from "@/lib/ui";

const PLACES: { id: Location; label: string }[] = [
  { id: "fridge", label: "Fridge" },
  { id: "freezer", label: "Freezer" },
  { id: "pantry", label: "Pantry" },
  { id: "spices", label: "Spices" },
];

export function Sheets() {
  const sheet = useUi((s) => s.sheet);
  const close = useUi((s) => s.close);

  return (
    <Modal visible={sheet !== null} animationType="slide" transparent onRequestClose={close}>
      <Pressable style={styles.scrim} onPress={close} />
      <View style={styles.panel}>
        <View style={styles.handle} />
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 28, gap: 12 }}>
          {sheet?.kind === "receipt" ? <ReceiptBody /> : null}
          {sheet?.kind === "recipe" ? <RecipeBody id={sheet.id} /> : null}
          {sheet?.kind === "item" ? <ItemBody id={sheet.id} /> : null}
          {sheet?.kind === "add" ? <AddBody /> : null}
        </ScrollView>
      </View>
    </Modal>
  );
}

function Head({ title }: { title: string }) {
  const close = useUi((s) => s.close);
  return (
    <View style={styles.head}>
      <Text style={styles.title}>{title}</Text>
      <Pressable accessibilityLabel="Close" onPress={close} style={styles.close}>
        <Text style={styles.closeLabel}>Close</Text>
      </Pressable>
    </View>
  );
}

function ReceiptBody() {
  const importLines = useLarder((s) => s.importLines);
  const importSample = useLarder((s) => s.importSample);
  const toast = useUi((s) => s.toast);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fileText = (raw: string, sample: boolean) => {
    const lines = parseReceipt(raw);
    if (lines.length === 0) {
      setError("No food lines in that text. Include item names, one per line.");
      return;
    }
    const count = importLines(lines, { store: "Walmart", sample });
    toast(sample ? `Filed ${count} sample items.` : `Filed ${count} items into the pantry.`);
  };

  return (
    <View style={{ gap: 12 }}>
      <Head title="Walmart receipt" />
      <Text style={styles.copy}>
        Walmart has no public shopper API, so this app will not ask for your password. Paste the receipt text. A live account link needs Knot or BlinkReceipt.
      </Text>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder={"Great Value milk 3.48\nLarge eggs 2.98"}
        placeholderTextColor={colors.muted}
        multiline
        style={styles.input}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <PrimaryButton label="File into the pantry" onPress={() => fileText(text, false)} />
      <SecondaryButton
        label="Use the labeled sample instead"
        onPress={() => {
          const count = importSample();
          toast(`Filed ${count} sample items.`);
        }}
      />
    </View>
  );
}

function RecipeBody({ id }: { id: string }) {
  const recipe = RECIPES.find((item) => item.id === id);
  const pantry = useLarder((s) => s.pantry);
  const cook = useLarder((s) => s.cook);
  const addMissing = useLarder((s) => s.addMissing);
  const toast = useUi((s) => s.toast);
  const [servings, setServings] = useState(recipe?.servings ?? 1);
  if (!recipe) return <Head title="Recipe" />;
  const scaled = scaleIngredients(recipe, servings);
  const stock = toStock(pantry);
  const rows = scaled.map((ingredient) => {
    const have = stock.find((item) => item.key === ingredient.key)?.qty ?? 0;
    const food = FOOD_BY_KEY.get(ingredient.key);
    return { ingredient, food, ok: have + 0.001 >= ingredient.qty };
  });
  const missing = rows.filter((row) => !row.ok).length;

  return (
    <View style={{ gap: 12 }}>
      <Head title={recipe.title} />
      <Text style={styles.copy}>{recipe.blurb}</Text>
      <Text style={styles.meta}>{recipe.minutes} min</Text>
      <View style={styles.row}>
        <Text style={styles.meta}>Servings</Text>
        <Stepper value={servings} min={1} max={8} onChange={setServings} />
      </View>
      {rows.map((row) => (
        <View key={row.ingredient.key} style={styles.line}>
          <Text style={[styles.name, !row.ok && { color: colors.muted }]}>
            {formatQty(row.ingredient.qty)} {row.food?.unit} {row.food?.name}
          </Text>
          <Text style={[styles.meta, row.ok && { color: colors.primary }]}>{row.ok ? "Have" : "Need"}</Text>
        </View>
      ))}
      {recipe.steps.map((step, index) => (
        <Text key={step} style={styles.step}>
          {index + 1}. {step}
        </Text>
      ))}
      {missing > 0 ? (
        <SecondaryButton
          label="Add missing to the list"
          onPress={() => {
            addMissing(recipe.id, servings);
            toast(`${missing} gap${missing === 1 ? "" : "s"} added to the list.`);
          }}
        />
      ) : null}
      <PrimaryButton
        label="I cooked this"
        onPress={() => {
          cook(recipe.id, servings);
          toast("Pantry updated for what you cooked.");
        }}
      />
    </View>
  );
}

function ItemBody({ id }: { id: string }) {
  const item = useLarder((s) => s.pantry.find((row) => row.id === id));
  const setQty = useLarder((s) => s.setQty);
  const setLocation = useLarder((s) => s.setLocation);
  const useUp = useLarder((s) => s.useUp);
  const close = useUi((s) => s.close);
  const [ask, setAsk] = useState(false);
  if (!item) return <Head title="Item" />;

  return (
    <View style={{ gap: 12 }}>
      <Head title={item.name} />
      <Text style={styles.meta}>
        {item.aisle} · use {expiryLabel(item.expiresOn).toLowerCase()}
      </Text>
      <View style={styles.row}>
        <Text style={styles.name}>
          {formatQty(item.qty)} {item.unit}
        </Text>
        <Stepper value={item.qty} min={0} max={99} step={item.qty >= 5 ? 1 : 0.5} onChange={(qty) => setQty(item.id, qty)} />
      </View>
      <View style={styles.wrap}>
        {PLACES.map((place) => (
          <Chip
            key={place.id}
            active={item.location === place.id}
            label={place.label}
            onPress={() => setLocation(item.id, place.id)}
          />
        ))}
      </View>
      {!ask ? (
        <SecondaryButton label="Used up" onPress={() => setAsk(true)} />
      ) : (
        <View style={{ gap: 8 }}>
          <Text style={styles.meta}>Put it on the shopping list?</Text>
          <PrimaryButton
            label="Yes, add to the list"
            onPress={() => {
              useUp(item.id, true);
              close();
            }}
          />
          <SecondaryButton
            label="No, just remove"
            onPress={() => {
              useUp(item.id, false);
              close();
            }}
          />
        </View>
      )}
    </View>
  );
}

function AddBody() {
  const addManual = useLarder((s) => s.addManual);
  const close = useUi((s) => s.close);
  const [name, setName] = useState("");
  const [qty, setQty] = useState(1);
  const [location, setLocation] = useState<Location>("pantry");

  return (
    <View style={{ gap: 12 }}>
      <Head title="Add item" />
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Milk, rice, lemons"
        placeholderTextColor={colors.muted}
        style={styles.single}
      />
      <View style={styles.row}>
        <Text style={styles.meta}>Quantity</Text>
        <Stepper value={qty} min={0.5} max={40} step={0.5} onChange={setQty} />
      </View>
      <View style={styles.wrap}>
        {PLACES.map((place) => (
          <Chip key={place.id} active={location === place.id} label={place.label} onPress={() => setLocation(place.id)} />
        ))}
      </View>
      <PrimaryButton
        label="Save"
        onPress={() => {
          if (!name.trim()) return;
          addManual({ name: name.trim(), qty, location });
          close();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: "rgba(34,28,24,0.35)" },
  panel: {
    maxHeight: "86%",
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  handle: { alignSelf: "center", width: 40, height: 4, borderRadius: 2, backgroundColor: colors.line, marginBottom: 8 },
  head: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 },
  title: { flex: 1, fontFamily: "Georgia", fontSize: 28, color: colors.fg, lineHeight: 32 },
  close: { paddingVertical: 6 },
  closeLabel: { color: colors.muted, fontSize: 14, fontWeight: "600" },
  copy: { color: colors.muted, fontSize: 15, lineHeight: 21 },
  meta: { color: colors.muted, fontSize: 14 },
  error: { color: colors.primary, fontSize: 14 },
  input: {
    minHeight: 140,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.bg,
    padding: 14,
    color: colors.fg,
    fontSize: 15,
    textAlignVertical: "top",
  },
  single: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.bg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.fg,
    fontSize: 16,
  },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  line: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  name: { color: colors.fg, fontSize: 15, flex: 1 },
  step: { color: colors.fg, fontSize: 14, lineHeight: 20 },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
});
