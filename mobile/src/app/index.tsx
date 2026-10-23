import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, Display, GhostButton, Kicker, Muted, PrimaryButton, Screen, SecondaryButton, colors } from "@/components/ui";
import { FOOD_BY_KEY, RECIPES } from "@/lib/larder/data";
import { daysUntil, matchRecipe } from "@/lib/larder/logic";
import { useLarder } from "@/lib/larder/store";
import { expiryLabel, spendByAisle, toStock } from "@/lib/larder/view";
import { useUi } from "@/lib/ui";

export default function HomeScreen() {
  const onboarded = useLarder((s) => s.onboarded);
  if (!onboarded) return <Welcome />;
  return <Tonight />;
}

function Welcome() {
  const importSample = useLarder((s) => s.importSample);
  const finishOnboarding = useLarder((s) => s.finishOnboarding);
  const open = useUi((s) => s.open);
  const toast = useUi((s) => s.toast);

  return (
    <SafeAreaView style={styles.welcome} edges={["top", "bottom"]}>
      <View style={{ gap: 12 }}>
        <Kicker>LARDER</Kicker>
        <Display>What you have is the menu.</Display>
        <Muted>Paste a Walmart receipt. Larder files the food, shows what you can cook, and lists only the gaps.</Muted>
      </View>
      <View style={{ gap: 12 }}>
        <PrimaryButton
          label="Paste a receipt"
          onPress={() => {
            finishOnboarding();
            open({ kind: "receipt" });
          }}
        />
        <SecondaryButton
          label="Try a sample Walmart receipt"
          onPress={() => {
            const count = importSample();
            toast(`Filed ${count} items from a sample Walmart receipt.`);
          }}
        />
        <Text style={styles.fine}>The sample is not your account. Live Walmart login needs a merchant-link partner.</Text>
      </View>
    </SafeAreaView>
  );
}

function Tonight() {
  const pantry = useLarder((s) => s.pantry);
  const receipts = useLarder((s) => s.receipts);
  const open = useUi((s) => s.open);
  const stock = toStock(pantry);
  const ready = RECIPES.filter((recipe) => matchRecipe(recipe, stock).ready);
  const soon = [...pantry].filter((item) => daysUntil(item.expiresOn) <= 5).sort((a, b) => a.expiresOn.localeCompare(b.expiresOn));
  const last = receipts[0];
  const spend = spendByAisle(receipts);

  return (
    <Screen>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Kicker>LARDER</Kicker>
          <Display>Tonight</Display>
        </View>
        <PrimaryButton label="Receipt" onPress={() => open({ kind: "receipt" })} />
      </View>

      {pantry.length === 0 ? (
        <Card>
          <Text style={styles.cardTitle}>The pantry is empty</Text>
          <Muted>A receipt is the fastest way in. Paste the item lines from the trip.</Muted>
          <View style={{ height: 12 }} />
          <GhostButton label="Add a Walmart trip" onPress={() => open({ kind: "receipt" })} />
        </Card>
      ) : (
        <>
          <View style={styles.headerRow}>
            <Text style={styles.section}>Cook now</Text>
            <Text style={styles.link} onPress={() => router.navigate("/cook")}>
              All recipes
            </Text>
          </View>
          {ready.length === 0 ? (
            <Muted>Nothing is a full match yet. Open Cook to see how close you are.</Muted>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
              {ready.slice(0, 6).map((recipe) => (
                <Card key={recipe.id} onPress={() => open({ kind: "recipe", id: recipe.id })}>
                  <View style={{ width: 180, gap: 8 }}>
                    <Text style={styles.ready}>Ready</Text>
                    <Text style={styles.recipeTitle}>{recipe.title}</Text>
                    <Text style={styles.meta}>{recipe.minutes} min</Text>
                  </View>
                </Card>
              ))}
            </ScrollView>
          )}

          {soon.length > 0 ? (
            <View style={{ gap: 10 }}>
              <Text style={styles.section}>Use soon</Text>
              <View style={styles.list}>
                {soon.slice(0, 4).map((item, index) => (
                  <View key={item.id} style={[styles.row, index > 0 && styles.rowLine]}>
                    <Text style={styles.rowName}>{item.name}</Text>
                    <Text style={[styles.meta, daysUntil(item.expiresOn) <= 1 && { color: colors.primary }]}>
                      {expiryLabel(item.expiresOn)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
        </>
      )}

      {last ? (
        <Card>
          <Text style={styles.meta}>{last.sample ? "Sample receipt" : last.store}</Text>
          <Text style={styles.cardTitle}>{last.lines.length} items filed</Text>
          <Text style={styles.meta}>{last.date}</Text>
          {spend.slice(0, 4).map((row) => (
            <View key={row.aisle} style={{ marginTop: 12 }}>
              <View style={styles.headerRow}>
                <Text style={styles.rowName}>{row.aisle}</Text>
                <Text style={styles.meta}>${row.total.toFixed(2)}</Text>
              </View>
              <View style={styles.track}>
                <View style={[styles.fill, { width: `${row.share}%` }]} />
              </View>
            </View>
          ))}
        </Card>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  welcome: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 24,
    paddingVertical: 28,
    justifyContent: "space-between",
  },
  fine: { color: colors.muted, fontSize: 13, textAlign: "center", lineHeight: 18 },
  headerRow: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 12 },
  section: { fontFamily: "Georgia", fontSize: 28, color: colors.fg },
  link: { color: colors.primary, fontSize: 14, fontWeight: "600", paddingBottom: 6 },
  ready: { color: colors.primary, fontSize: 12, fontWeight: "700" },
  recipeTitle: { fontFamily: "Georgia", fontSize: 22, color: colors.fg, lineHeight: 26 },
  meta: { color: colors.muted, fontSize: 13 },
  cardTitle: { fontFamily: "Georgia", fontSize: 26, color: colors.fg, marginBottom: 6 },
  list: { backgroundColor: colors.surface, borderRadius: 24, overflow: "hidden" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  rowLine: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line },
  rowName: { color: colors.fg, fontSize: 16, flex: 1 },
  track: { height: 6, borderRadius: 99, backgroundColor: colors.line, overflow: "hidden", marginTop: 6 },
  fill: { height: 6, backgroundColor: colors.primary },
});
