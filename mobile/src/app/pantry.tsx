import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Chip, Display, Muted, Screen, SearchField, colors } from "@/components/ui";
import { type Location } from "@/lib/larder/data";
import { daysUntil, formatQty } from "@/lib/larder/logic";
import { useLarder } from "@/lib/larder/store";
import { expiryLabel } from "@/lib/larder/view";
import { useUi } from "@/lib/ui";

const LOCATIONS: { id: Location | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "fridge", label: "Fridge" },
  { id: "freezer", label: "Freezer" },
  { id: "pantry", label: "Pantry" },
  { id: "spices", label: "Spices" },
];

export default function PantryScreen() {
  const pantry = useLarder((s) => s.pantry);
  const open = useUi((s) => s.open);
  const [place, setPlace] = useState<Location | "all">("all");
  const [query, setQuery] = useState("");
  const rows = pantry
    .filter((item) => place === "all" || item.location === place)
    .filter((item) => item.name.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <Display>Pantry</Display>
          <Muted>{pantry.length} items on hand</Muted>
        </View>
        <Pressable accessibilityLabel="Add item" onPress={() => open({ kind: "add" })} style={styles.add}>
          <Text style={styles.addLabel}>+</Text>
        </Pressable>
      </View>
      <SearchField value={query} onChangeText={setQuery} placeholder="Find an item" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {LOCATIONS.map((item) => (
          <Chip key={item.id} active={place === item.id} label={item.label} onPress={() => setPlace(item.id)} />
        ))}
      </ScrollView>
      {rows.length === 0 ? (
        <Muted>Nothing in this spot.</Muted>
      ) : (
        <View style={styles.list}>
          {rows.map((item, index) => (
            <Pressable
              key={item.id}
              onPress={() => open({ kind: "item", id: item.id })}
              style={[styles.row, index > 0 && styles.line]}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.meta}>
                  {formatQty(item.qty)} {item.unit} · {item.location}
                </Text>
              </View>
              <Text style={[styles.meta, daysUntil(item.expiresOn) <= 2 && { color: colors.primary }]}>
                {expiryLabel(item.expiresOn)}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  add: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  addLabel: { color: colors.primaryFg, fontSize: 26, lineHeight: 28 },
  list: { backgroundColor: colors.surface, borderRadius: 24, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  line: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line },
  name: { color: colors.fg, fontSize: 16 },
  meta: { color: colors.muted, fontSize: 13, marginTop: 2 },
});
