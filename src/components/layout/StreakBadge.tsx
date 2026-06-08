import { View, Text, StyleSheet } from "react-native";
import { colors, radius, spacing } from "../../constants/theme";

interface StreakBadgeProps {
  streak: number;
  compact?: boolean;
}

export function StreakBadge({ streak, compact }: StreakBadgeProps) {
  return (
    <View style={[styles.badge, compact && styles.compact]}>
      <Text style={styles.flame}>🔥</Text>
      <Text style={styles.text}>
        {streak} {compact ? "" : "Day "}Streak
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.cardElevated,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  compact: { paddingHorizontal: spacing.sm },
  flame: { fontSize: 14 },
  text: { color: colors.primary, fontSize: 12, fontWeight: "700" },
});
