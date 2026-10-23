import { type ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { formatQty } from "@/lib/larder/logic";

export const colors = {
  bg: "#f3efe7",
  canvas: "#e7e1d6",
  surface: "#fffcf8",
  fg: "#221c18",
  muted: "#74685f",
  primary: "#c24e2a",
  primaryFg: "#fff8f4",
  line: "#e6ddd2",
};

export function Screen({ children }: { children: ReactNode }) {
  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function Kicker({ children }: { children: string }) {
  return <Text style={styles.kicker}>{children}</Text>;
}

export function Display({ children }: { children: string }) {
  return <Text style={styles.display}>{children}</Text>;
}

export function Muted({ children }: { children: ReactNode }) {
  return <Text style={styles.muted}>{children}</Text>;
}

export function PrimaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.primary, pressed && styles.pressed]}>
      <Text style={styles.primaryLabel}>{label}</Text>
    </Pressable>
  );
}

export function SecondaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}>
      <Text style={styles.secondaryLabel}>{label}</Text>
    </Pressable>
  );
}

export function GhostButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.ghost, pressed && styles.pressed]}>
      <Text style={styles.ghostLabel}>{label}</Text>
    </Pressable>
  );
}

export function Chip({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[styles.chip, active && styles.chipOn]}>
      <Text style={[styles.chipLabel, active && styles.chipLabelOn]}>{label}</Text>
    </Pressable>
  );
}

export function SearchField({
  value,
  onChangeText,
  placeholder,
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.muted}
      style={styles.search}
    />
  );
}

export function Card({ children, onPress }: { children: ReactNode; onPress?: () => void }) {
  if (!onPress) return <View style={styles.card}>{children}</View>;
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      {children}
    </Pressable>
  );
}

export function Stepper({
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
    <View style={styles.stepper}>
      <Pressable
        accessibilityLabel="Decrease"
        onPress={() => onChange(Math.max(min, Math.round((value - step) * 100) / 100))}
        style={styles.stepBtn}
      >
        <Text style={styles.stepGlyph}>−</Text>
      </Pressable>
      <Text style={styles.stepValue}>{formatQty(value)}</Text>
      <Pressable
        accessibilityLabel="Increase"
        onPress={() => onChange(Math.min(max, Math.round((value + step) * 100) / 100))}
        style={styles.stepBtn}
      >
        <Text style={styles.stepGlyph}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 28, gap: 16 },
  kicker: { color: colors.muted, fontSize: 13, letterSpacing: 2, fontWeight: "600" },
  display: { color: colors.fg, fontFamily: "Georgia", fontSize: 40, lineHeight: 44 },
  muted: { color: colors.muted, fontSize: 16, lineHeight: 22 },
  primary: { backgroundColor: colors.primary, borderRadius: 999, paddingVertical: 16, alignItems: "center" },
  primaryLabel: { color: colors.primaryFg, fontSize: 16, fontWeight: "600" },
  secondary: {
    backgroundColor: colors.surface,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.line,
  },
  secondaryLabel: { color: colors.fg, fontSize: 16, fontWeight: "600" },
  ghost: { borderRadius: 999, paddingVertical: 14, alignItems: "center", backgroundColor: colors.fg },
  ghostLabel: { color: colors.primaryFg, fontSize: 15, fontWeight: "600" },
  pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  chipOn: { backgroundColor: colors.fg, borderColor: colors.fg },
  chipLabel: { color: colors.fg, fontSize: 14, fontWeight: "500" },
  chipLabelOn: { color: colors.primaryFg },
  search: {
    backgroundColor: colors.surface,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.fg,
  },
  card: { backgroundColor: colors.surface, borderRadius: 24, padding: 16 },
  stepper: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: colors.line, borderRadius: 999, padding: 4 },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  stepGlyph: { fontSize: 18, color: colors.fg },
  stepValue: { minWidth: 28, textAlign: "center", color: colors.fg, fontSize: 15 },
});
