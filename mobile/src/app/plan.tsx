import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Card, Display, Muted, PrimaryButton, Screen, SecondaryButton, colors } from "@/components/ui";
import { RECIPES } from "@/lib/larder/data";
import { addDays, matchRecipe, todayISO } from "@/lib/larder/logic";
import { useLarder } from "@/lib/larder/store";
import { parseISO, toStock } from "@/lib/larder/view";
import { useUi } from "@/lib/ui";

export default function PlanScreen() {
  const plan = useLarder((s) => s.plan);
  const pantry = useLarder((s) => s.pantry);
  const setPlan = useLarder((s) => s.setPlan);
  const shopPlan = useLarder((s) => s.shopPlan);
  const open = useUi((s) => s.open);
  const toast = useUi((s) => s.toast);
  const [picked, setPicked] = useState(todayISO());
  const days = Array.from({ length: 7 }, (_, index) => addDays(todayISO(), index));
  const stock = toStock(pantry);
  const recipe = RECIPES.find((item) => item.id === plan[picked]);
  const suggestions = RECIPES.filter((item) => matchRecipe(item, stock).ready && !Object.values(plan).includes(item.id)).slice(0, 4);
  const choices = suggestions.length ? suggestions : RECIPES.slice(0, 4);

  return (
    <Screen>
      <Display>Plan</Display>
      <Muted>One meal a day. The list gets only what you still need.</Muted>
      <View style={styles.days}>
        {days.map((iso) => {
          const date = parseISO(iso);
          const active = iso === picked;
          return (
            <Pressable key={iso} onPress={() => setPicked(iso)} style={[styles.day, active && styles.dayOn]}>
              <Text style={[styles.dow, active && styles.dayOnText]}>{date.toLocaleDateString("en-US", { weekday: "narrow" })}</Text>
              <Text style={[styles.date, active && styles.dayOnText]}>{date.getDate()}</Text>
            </Pressable>
          );
        })}
      </View>
      {recipe ? (
        <Card onPress={() => open({ kind: "recipe", id: recipe.id })}>
          <Text style={styles.meta}>Planned</Text>
          <Text style={styles.title}>{recipe.title}</Text>
          <Text style={styles.meta}>{recipe.minutes} min</Text>
        </Card>
      ) : (
        <View style={styles.empty}>
          <Muted>Nothing planned this day.</Muted>
        </View>
      )}
      <View style={styles.actions}>
        {recipe ? <SecondaryButton label="Clear day" onPress={() => setPlan(picked, null)} /> : null}
        {Object.keys(plan).length > 0 ? (
          <PrimaryButton
            label="Shop the gaps"
            onPress={() => {
              shopPlan();
              toast("Gaps from the week are on the list.");
            }}
          />
        ) : null}
      </View>
      <Text style={styles.section}>You can make</Text>
      {choices.map((item) => (
        <Pressable key={item.id} onPress={() => setPlan(picked, item.id)} style={styles.choice}>
          <Text style={styles.choiceTitle}>{item.title}</Text>
          <Text style={styles.add}>Add</Text>
        </Pressable>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  days: { flexDirection: "row", gap: 4 },
  day: { flex: 1, backgroundColor: colors.surface, borderRadius: 16, paddingVertical: 8, alignItems: "center" },
  dayOn: { backgroundColor: colors.fg },
  dow: { color: colors.muted, fontSize: 11 },
  date: { fontFamily: "Georgia", fontSize: 18, color: colors.fg },
  dayOnText: { color: colors.primaryFg },
  meta: { color: colors.muted, fontSize: 13 },
  title: { fontFamily: "Georgia", fontSize: 26, color: colors.fg, marginVertical: 4 },
  empty: { borderWidth: 1, borderStyle: "dashed", borderColor: colors.line, borderRadius: 24, padding: 16 },
  actions: { gap: 8 },
  section: { fontFamily: "Georgia", fontSize: 26, color: colors.fg },
  choice: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  choiceTitle: { color: colors.fg, fontSize: 16, flex: 1 },
  add: { color: colors.primary, fontWeight: "600" },
});
