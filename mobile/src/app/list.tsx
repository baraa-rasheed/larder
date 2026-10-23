import { Pressable, StyleSheet, Text, View } from "react-native";
import { Card, Display, GhostButton, Muted, PrimaryButton, Screen, colors } from "@/components/ui";
import { formatQty } from "@/lib/larder/logic";
import { useLarder } from "@/lib/larder/store";
import { aisleRank } from "@/lib/larder/view";

export default function ListScreen() {
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
    <Screen>
      <Display>List</Display>
      <Muted>{open === 0 ? "Nothing to buy." : `${open} still to buy`}</Muted>
      {list.length === 0 ? (
        <Card>
          <Muted>Missing ingredients from a recipe land here, grouped by aisle.</Muted>
        </Card>
      ) : (
        aisles.map((aisle) => (
          <View key={aisle} style={{ gap: 8 }}>
            <Text style={styles.aisle}>{aisle}</Text>
            <View style={styles.list}>
              {groups.get(aisle)?.map((item, index) => (
                <Pressable key={item.id} onPress={() => toggle(item.id)} style={[styles.row, index > 0 && styles.line]}>
                  <View style={[styles.check, item.checked && styles.checkOn]}>
                    {item.checked ? <Text style={styles.checkMark}>✓</Text> : null}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.name, item.checked && styles.done]}>{item.name}</Text>
                    <Text style={styles.meta}>
                      {formatQty(item.qty)} {item.unit}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        ))
      )}
      {checked > 0 ? (
        <View style={{ gap: 8 }}>
          <PrimaryButton label="Shelve checked into the pantry" onPress={shelve} />
          <GhostButton label="Remove checked" onPress={clear} />
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  aisle: { color: colors.muted, fontSize: 13, fontWeight: "600", letterSpacing: 0.4 },
  list: { backgroundColor: colors.surface, borderRadius: 24, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  line: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
  },
  checkOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkMark: { color: colors.primaryFg, fontSize: 13, fontWeight: "700" },
  name: { color: colors.fg, fontSize: 16 },
  done: { color: colors.muted, textDecorationLine: "line-through" },
  meta: { color: colors.muted, fontSize: 13, marginTop: 2 },
});
