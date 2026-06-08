import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { format, parseISO } from "date-fns";
import { DiaryEntry } from "../utils/database";
import { colors, radius, spacing } from "../constants/theme";
import { ProgressBar } from "./ui/ProgressBar";

interface MealTimelineCardProps {
  entry: DiaryEntry;
  onDelete?: () => void;
  showAiBadge?: boolean;
}

const MEAL_LABELS: Record<DiaryEntry["meal_type"], string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
};

export function MealTimelineCard({ entry, onDelete, showAiBadge }: MealTimelineCardProps) {
  const time = format(parseISO(entry.created_at), "hh:mm a");
  const calPct = Math.min(entry.calories / 800, 1);

  return (
    <View style={styles.card}>
      <View style={styles.imageWrap}>
        {entry.image_uri ? (
          <Image source={{ uri: entry.image_uri }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderEmoji}>🍽️</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.topRow}>
          {showAiBadge ? (
            <View style={styles.aiBadge}>
              <Text style={styles.aiBadgeText}>AI Verified</Text>
            </View>
          ) : null}
          <Text style={styles.time}>{time}</Text>
        </View>
        <Text style={styles.mealType}>
          {MEAL_LABELS[entry.meal_type]} • {entry.serving_size || "1 serving"}
        </Text>
        <Text style={styles.foodName}>{entry.food_name}</Text>
        <View style={styles.macros}>
          <Text style={styles.macroText}>{entry.protein}g P</Text>
          <Text style={styles.macroText}>{entry.carbs}g C</Text>
          <Text style={styles.macroText}>{entry.fat}g F</Text>
        </View>
        <ProgressBar value={entry.calories} max={800} color={colors.primary} height={4} />
      </View>

      <View style={styles.calCol}>
        <Text style={styles.calories}>{entry.calories}</Text>
        <Text style={styles.calLabel}>kcal</Text>
        {onDelete ? (
          <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
            <Text style={styles.deleteText}>×</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  imageWrap: { width: 72, height: 72 },
  image: { width: 72, height: 72, borderRadius: radius.md },
  imagePlaceholder: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    backgroundColor: colors.cardElevated,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderEmoji: { fontSize: 28 },
  content: { flex: 1, gap: 4 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  aiBadge: {
    backgroundColor: colors.cardElevated,
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  aiBadgeText: { color: colors.primary, fontSize: 9, fontWeight: "700" },
  time: { color: colors.muted, fontSize: 11 },
  mealType: { color: colors.muted, fontSize: 11, fontWeight: "600" },
  foodName: { color: colors.text, fontSize: 16, fontWeight: "700" },
  macros: { flexDirection: "row", gap: spacing.sm },
  macroText: { color: colors.textSecondary, fontSize: 11 },
  calCol: { alignItems: "flex-end", justifyContent: "space-between" },
  calories: { color: colors.primary, fontSize: 22, fontWeight: "800" },
  calLabel: { color: colors.muted, fontSize: 10 },
  deleteBtn: { marginTop: spacing.sm, padding: 4 },
  deleteText: { color: colors.muted, fontSize: 20, fontWeight: "600" },
});
