import { View, Text, StyleSheet } from "react-native";
import { format, subDays, parseISO } from "date-fns";
import { todayISO } from "../hooks/useDiary";
import { colors, spacing } from "../constants/theme";

interface WeeklyCalendarProps {
  loggedDates: string[];
  goalHitDates?: string[];
  calorieGoal?: number;
  weeklyData?: { date: string; total_calories: number }[];
}

const DAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export function WeeklyCalendar({
  loggedDates,
  goalHitDates,
  weeklyData = [],
}: WeeklyCalendarProps) {
  const today = todayISO();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = format(subDays(parseISO(today), 6 - i), "yyyy-MM-dd");
    const logged = loggedDates.includes(d);
    const calories = weeklyData.find((w) => w.date === d)?.total_calories ?? 0;
    const goalHit = goalHitDates?.includes(d) ?? calories > 0;
    return { date: d, label: DAY_LABELS[i], logged, goalHit, isToday: d === today };
  });

  const hitCount = days.filter((d) => d.goalHit).length;
  const pct = Math.round((hitCount / 7) * 100);

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.sectionLabel}>Weekly Progress</Text>
        <Text style={styles.pct}>{pct}% Goal Hit</Text>
      </View>
      <View style={styles.row}>
        {days.map((d) => (
          <View key={d.date} style={styles.dayCol}>
            <View
              style={[
                styles.dot,
                d.logged && styles.dotLogged,
                d.isToday && styles.dotToday,
              ]}
            />
            <Text style={[styles.dayLabel, d.isToday && styles.dayLabelToday]}>
              {d.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.lg },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  sectionLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  pct: { color: colors.primary, fontSize: 13, fontWeight: "700" },
  row: { flexDirection: "row", justifyContent: "space-between" },
  dayCol: { alignItems: "center", gap: 6 },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: "transparent",
  },
  dotLogged: { backgroundColor: colors.primary, borderColor: colors.primary },
  dotToday: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  dayLabel: { color: colors.muted, fontSize: 10, fontWeight: "600" },
  dayLabelToday: { color: colors.primary },
});
