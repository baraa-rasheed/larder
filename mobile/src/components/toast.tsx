import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/components/ui";
import { useUi } from "@/lib/ui";

export function Toast() {
  const note = useUi((s) => s.note);
  const clearNote = useUi((s) => s.clearNote);

  useEffect(() => {
    if (!note) return;
    const id = setTimeout(clearNote, 2400);
    return () => clearTimeout(id);
  }, [note, clearNote]);

  if (!note) return null;

  return (
    <View pointerEvents="none" style={styles.wrap}>
      <Text style={styles.text}>{note}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", top: 16, left: 0, right: 0, alignItems: "center", zIndex: 50 },
  text: {
    overflow: "hidden",
    backgroundColor: colors.fg,
    color: colors.primaryFg,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    maxWidth: 320,
    textAlign: "center",
  },
});
