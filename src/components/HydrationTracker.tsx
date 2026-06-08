import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "./ui/Card";
import { colors, radius, spacing } from "../constants/theme";

interface HydrationTrackerProps {
  currentMl: number;
  goalMl: number;
  onAdd: (ml: number) => void;
}

const GLASS_ML = 250;
const SEGMENTS = 8;

export function HydrationTracker({ currentMl, goalMl, onAdd }: HydrationTrackerProps) {
  const liters = (currentMl / 1000).toFixed(1);
  const goalLiters = (goalMl / 1000).toFixed(1);
  const filledSegments = Math.min(Math.floor((currentMl / goalMl) * SEGMENTS), SEGMENTS);

  return (
    <Card>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="water" size={18} color={colors.secondary} />
          <Text style={styles.title}>Hydration</Text>
        </View>
        <Text style={styles.amount}>
          {liters} / {goalLiters} L
        </Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.addBtn} onPress={() => onAdd(GLASS_ML)}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
        <View style={styles.segments}>
          {Array.from({ length: SEGMENTS }).map((_, i) => (
            <View
              key={i}
              style={[styles.segment, i < filledSegments && styles.segmentFilled]}
            />
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.logBtn} onPress={() => onAdd(GLASS_ML)}>
        <Text style={styles.logBtnText}>Log Water ({GLASS_ML}ml)</Text>
      </TouchableOpacity>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  titleRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  title: { color: colors.text, fontSize: 16, fontWeight: "700" },
  amount: { color: colors.textSecondary, fontSize: 14, fontWeight: "600" },
  controls: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.md },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.cardElevated,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnText: { color: colors.primary, fontSize: 22, fontWeight: "600" },
  segments: { flex: 1, flexDirection: "row", gap: 4 },
  segment: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  segmentFilled: { backgroundColor: colors.secondary },
  logBtn: {
    backgroundColor: colors.cardElevated,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  logBtnText: { color: colors.textSecondary, fontSize: 12, fontWeight: "600" },
});
