import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ScrollView } from "react-native";
import { Card, Chip, Display, Muted, Screen, SearchField, colors } from "@/components/ui";
import { FOOD_BY_KEY, RECIPES, type Diet } from "@/lib/larder/data";
import { matchRecipe } from "@/lib/larder/logic";
import { useLarder } from "@/lib/larder/store";
import { toStock } from "@/lib/larder/view";
import { useUi } from "@/lib/ui";

const DIETS: { id: Diet | "any"; label: string }[] = [
  { id: "any", label: "Any" },
  { id: "vegetarian", label: "Vegetarian" },
  { id: "vegan", label: "Vegan" },
  { id: "gluten-free", label: "Gluten-free" },
];

export default function CookScreen() {
  const pantry = useLarder((s) => s.pantry);
  const diet = useLarder((s) => s.diet);
  const cookNow = useLarder((s) => s.cookNow);
  const setDiet = useLarder((s) => s.setDiet);
  const setCookNow = useLarder((s) => s.setCookNow);
  const open = useUi((s) => s.open);
  const [query, setQuery] = useState("");
  const [maxMin, setMaxMin] = useState<number | null>(null);
  const stock = toStock(pantry);

  const recipes = RECIPES.filter((recipe) => {
    if (diet !== "any" && !recipe.diets.includes(diet)) return false;
    if (maxMin && recipe.minutes > maxMin) return false;
    if (query) {
      const hay = `${recipe.title} ${recipe.ingredients.map((item) => FOOD_BY_KEY.get(item.key)?.name ?? "").join(" ")}`.toLowerCase();
      if (!hay.includes(query.toLowerCase())) return false;
    }
    if (cookNow && !matchRecipe(recipe, stock).ready) return false;
    return true;
  }).sort((a, b) => {
    const ma = matchRecipe(a, stock);
    const mb = matchRecipe(b, stock);
    return mb.hit / mb.total - ma.hit / ma.total;
  });

  return (
    <Screen>
      <Display>Cook</Display>
      <Muted>{cookNow ? "Only meals you can make now." : "Closest matches first."}</Muted>
      <SearchField value={query} onChangeText={setQuery} placeholder="Search recipes or ingredients" />
      <View style={styles.toggle}>
        <Chip active={!cookNow} label="All" onPress={() => setCookNow(false)} />
        <Chip active={cookNow} label="Cook now" onPress={() => setCookNow(true)} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {DIETS.map((item) => (
          <Chip key={item.id} active={diet === item.id} label={item.label} onPress={() => setDiet(item.id)} />
        ))}
        {[15, 30, 45].map((minutes) => (
          <Chip
            key={minutes}
            active={maxMin === minutes}
            label={`≤ ${minutes}m`}
            onPress={() => setMaxMin(maxMin === minutes ? null : minutes)}
          />
        ))}
      </ScrollView>
      {recipes.length === 0 ? (
        <Card>
          <Muted>No recipes in this filter. Turn off Cook now to see partial matches.</Muted>
        </Card>
      ) : (
        recipes.map((recipe) => {
          const match = matchRecipe(recipe, stock);
          return (
            <Card key={recipe.id} onPress={() => open({ kind: "recipe", id: recipe.id })}>
              <View style={styles.header}>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={styles.title}>{recipe.title}</Text>
                  <Muted>{recipe.blurb}</Muted>
                </View>
                <View style={[styles.pill, match.ready && styles.pillOn]}>
                  <Text style={[styles.pillText, match.ready && styles.pillTextOn]}>{match.ready ? "Ready" : `${match.hit}/${match.total}`}</Text>
                </View>
              </View>
              <Text style={styles.meta}>
                {recipe.minutes} min · serves {recipe.servings}
              </Text>
            </Card>
          );
        })
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  toggle: { flexDirection: "row", gap: 8 },
  header: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  title: { fontFamily: "Georgia", fontSize: 24, color: colors.fg, lineHeight: 28 },
  meta: { marginTop: 10, color: colors.muted, fontSize: 13 },
  pill: { backgroundColor: colors.line, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
  pillOn: { backgroundColor: "#f6e4dc" },
  pillText: { color: colors.muted, fontSize: 12, fontWeight: "600" },
  pillTextOn: { color: colors.primary },
});
