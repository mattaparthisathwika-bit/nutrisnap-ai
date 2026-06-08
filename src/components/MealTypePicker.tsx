import { View, Text, StyleSheet, Pressable } from "react-native";
import { DiaryEntry } from "../utils/database.types";
import { Button } from "./ui/Button";
import { colors, radius, spacing } from "../constants/theme";

const MEAL_TYPES: DiaryEntry["meal_type"][] = ["breakfast", "lunch", "dinner", "snack"];

interface MealTypePickerProps {
  foodName?: string;
  onSelect: (meal: DiaryEntry["meal_type"]) => void;
  onCancel: () => void;
  compact?: boolean;
  saving?: boolean;
}

export function MealTypePicker({
  foodName,
  onSelect,
  onCancel,
  compact,
  saving,
}: MealTypePickerProps) {
  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      <Text style={styles.title}>Which meal?</Text>
      {foodName ? <Text style={styles.subtitle}>{foodName}</Text> : null}
      <View style={styles.options}>
        {MEAL_TYPES.map((meal) => {
          const label = meal.charAt(0).toUpperCase() + meal.slice(1);
          return (
            <Pressable
              key={meal}
              style={({ pressed }) => [
                styles.mealOption,
                pressed && !saving && styles.mealOptionPressed,
                saving && styles.mealOptionDisabled,
              ]}
              onPress={() => onSelect(meal)}
              disabled={saving}
              accessibilityRole="button"
              accessibilityLabel={`Log as ${label}`}
            >
              <Text style={styles.mealOptionText}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
      <Button label={saving ? "Saving..." : "Cancel"} variant="secondary" onPress={onCancel} disabled={saving} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
    zIndex: 20,
  },
  wrapCompact: {
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
  },
  subtitle: {
    color: colors.muted,
    fontSize: 13,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  options: {
    gap: spacing.sm,
    marginVertical: spacing.sm,
  },
  mealOption: {
    width: "100%",
    minHeight: 48,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
  },
  mealOptionPressed: {
    opacity: 0.85,
  },
  mealOptionDisabled: {
    opacity: 0.5,
  },
  mealOptionText: {
    color: colors.onPrimary,
    fontSize: 15,
    fontWeight: "700",
  },
});
