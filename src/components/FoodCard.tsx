import { View, Text, StyleSheet } from "react-native";
import { DiaryEntry } from "../utils/database";
import { colors, radius, spacing } from "../constants/theme";

const MEAL_LABELS: Record<DiaryEntry["meal_type"], string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
};

interface FoodCardProps {
  entry: DiaryEntry;
}

export function FoodCard({ entry }: FoodCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name} numberOfLines={1}>
          {entry.food_name}
        </Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{MEAL_LABELS[entry.meal_type]}</Text>
        </View>
      </View>
      <Text style={styles.calories}>{entry.calories} cal</Text>
      <View style={styles.macros}>
        <MacroPill label="P" value={entry.protein} color={colors.protein} />
        <MacroPill label="C" value={entry.carbs} color={colors.carbs} />
        <MacroPill label="F" value={entry.fat} color={colors.fat} />
        {entry.serving_size ? (
          <Text style={styles.serving} numberOfLines={1}>
            {entry.serving_size}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

function MacroPill({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <View style={styles.pill}>
      <Text style={[styles.pillLabel, { color }]}>{label}</Text>
      <Text style={styles.pillValue}>{value}g</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  name: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  badge: {
    backgroundColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "600",
  },
  calories: {
    color: colors.accent,
    fontSize: 22,
    fontWeight: "800",
    marginTop: 4,
  },
  macros: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.sm,
    gap: spacing.md,
    flexWrap: "wrap",
  },
  pill: { flexDirection: "row", alignItems: "center", gap: 4 },
  pillLabel: { fontSize: 12, fontWeight: "800" },
  pillValue: { color: colors.muted, fontSize: 12, fontWeight: "600" },
  serving: {
    color: colors.muted,
    fontSize: 11,
    flex: 1,
    textAlign: "right",
  },
});
