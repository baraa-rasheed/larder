import { Tabs, TabList, TabSlot, TabTrigger, type TabTriggerSlotProps } from "expo-router/ui";
import { Pressable, StyleSheet, Text, View, type PressableProps } from "react-native";
import { SymbolView } from "expo-symbols";
import type { SFSymbol } from "sf-symbols-typescript";
import { colors } from "@/components/ui";
import { useLarder } from "@/lib/larder/store";

const TABS: { name: string; href: "/" | "/cook" | "/pantry" | "/list" | "/plan"; label: string; symbol: SFSymbol }[] = [
  { name: "home", href: "/", label: "Home", symbol: "house.fill" },
  { name: "cook", href: "/cook", label: "Cook", symbol: "fork.knife" },
  { name: "pantry", href: "/pantry", label: "Pantry", symbol: "archivebox.fill" },
  { name: "list", href: "/list", label: "List", symbol: "cart.fill" },
  { name: "plan", href: "/plan", label: "Plan", symbol: "calendar" },
];

export default function AppTabs() {
  const onboarded = useLarder((s) => s.onboarded);
  const count = useLarder((s) => s.list.filter((row) => !row.checked).length);

  return (
    <View style={styles.canvas}>
      <View style={styles.phone}>
        <Tabs>
          <TabSlot style={{ flex: 1 }} />
          {onboarded ? (
            <TabList asChild>
              <View style={styles.bar}>
                {TABS.map((tab) => (
                  <TabTrigger key={tab.name} name={tab.name} href={tab.href} asChild>
                    <TabButton label={tab.label} symbol={tab.symbol} badge={tab.name === "list" ? count : 0} />
                  </TabTrigger>
                ))}
              </View>
            </TabList>
          ) : null}
        </Tabs>
      </View>
    </View>
  );
}

function TabButton({
  label,
  symbol,
  badge,
  isFocused,
  ...props
}: TabTriggerSlotProps & { label: string; symbol: SFSymbol; badge?: number }) {
  const color = isFocused ? colors.primary : colors.muted;
  return (
    <Pressable {...(props as PressableProps)} accessibilityRole="tab" style={styles.tab}>
      <View>
        <SymbolView name={symbol} size={22} tintColor={color} />
        {badge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ) : null}
      </View>
      <Text style={[styles.tabLabel, { color, fontWeight: isFocused ? "700" : "500" }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  canvas: { flex: 1, backgroundColor: colors.canvas, alignItems: "center" },
  phone: {
    flex: 1,
    width: "100%",
    maxWidth: 430,
    backgroundColor: colors.bg,
    overflow: "hidden",
  },
  bar: {
    flexDirection: "row",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
    backgroundColor: colors.bg,
    paddingTop: 8,
    paddingBottom: 10,
    paddingHorizontal: 4,
  },
  tab: { flex: 1, alignItems: "center", gap: 3, paddingVertical: 4 },
  tabLabel: { fontSize: 11 },
  badge: {
    position: "absolute",
    top: -4,
    right: -10,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: { color: colors.primaryFg, fontSize: 10, fontWeight: "700" },
});
