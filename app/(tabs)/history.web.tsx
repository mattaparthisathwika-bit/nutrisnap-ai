import { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { subDays, format, parseISO } from "date-fns";
import { getWeeklyData, getUserGoals, getDailyTotals } from "../../src/utils/database";
import { todayISO } from "../../src/hooks/useDiary";
import { colors, spacing, radius } from "../../src/constants/theme";

interface DayPoint {
  label: string;
  calories: number;
  date: string;
}

export default function HistoryScreen() {
  const [chartData, setChartData] = useState<DayPoint[]>([]);
  const [goal, setGoal] = useState(2000);
  const [averages, setAverages] = useState({ protein: 0, carbs: 0, fat: 0, calories: 0 });
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const today = todayISO();
      const start = format(subDays(parseISO(today), 6), "yyyy-MM-dd");
      const [weekly, goals] = await Promise.all([
        getWeeklyData(start),
        getUserGoals(),
      ]);

      setGoal(goals.calories);
      setStreak(goals.streak);

      const days: DayPoint[] = [];
      let totalProtein = 0;
      let totalCarbs = 0;
      let totalFat = 0;
      let totalCal = 0;
      let daysWithData = 0;

      for (let i = 6; i >= 0; i--) {
        const d = format(subDays(parseISO(today), i), "yyyy-MM-dd");
        const row = weekly.find((w) => w.date === d);
        const cal = row?.total_calories ?? 0;
        days.push({
          label: format(parseISO(d), "EEE"),
          calories: cal,
          date: d,
        });

        if (cal > 0) {
          const totals = await getDailyTotals(d);
          totalProtein += totals.protein;
          totalCarbs += totals.carbs;
          totalFat += totals.fat;
          totalCal += totals.calories;
          daysWithData += 1;
        }
      }

      setChartData(days);
      const divisor = daysWithData || 1;
      setAverages({
        protein: Math.round(totalProtein / divisor),
        carbs: Math.round(totalCarbs / divisor),
        fat: Math.round(totalFat / divisor),
        calories: Math.round(totalCal / divisor),
      });
    } finally {
      setLoading(false);
    }
  };

  const yMax = useMemo(() => {
    const peak = Math.max(...chartData.map((d) => d.calories), goal);
    return Math.ceil(peak * 1.15) || goal;
  }, [chartData, goal]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Weekly History</Text>

        <View style={styles.streakBadge}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <View>
            <Text style={styles.streakCount}>{streak} day streak</Text>
            <Text style={styles.streakHint}>Keep logging daily!</Text>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} />
        ) : (
          <>
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Calories — last 7 days</Text>
              <Text style={styles.goalHint}>Goal: {goal} cal/day</Text>
              <View style={styles.barsRow}>
                {chartData.map((d) => (
                  <View key={d.date} style={styles.barCol}>
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            height: `${Math.max((d.calories / yMax) * 100, d.calories > 0 ? 4 : 0)}%`,
                          },
                        ]}
                      />
                      <View
                        style={[
                          styles.goalTick,
                          { bottom: `${(goal / yMax) * 100}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.xLabel}>{d.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            <Text style={styles.avgTitle}>Weekly averages</Text>
            <View style={styles.avgRow}>
              <AvgCard label="Calories" value={averages.calories} color={colors.accent} suffix="cal" />
              <AvgCard label="Protein" value={averages.protein} color={colors.protein} />
              <AvgCard label="Carbs" value={averages.carbs} color={colors.carbs} />
              <AvgCard label="Fat" value={averages.fat} color={colors.fat} />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function AvgCard({
  label,
  value,
  color,
  suffix = "g",
}: {
  label: string;
  value: number;
  color: string;
  suffix?: string;
}) {
  return (
    <View style={styles.avgCard}>
      <Text style={[styles.avgValue, { color }]}>{value}</Text>
      <Text style={styles.avgSuffix}>{suffix}</Text>
      <Text style={styles.avgLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  streakEmoji: { fontSize: 36 },
  streakCount: { color: colors.text, fontSize: 18, fontWeight: "800" },
  streakHint: { color: colors.muted, fontSize: 12 },
  chartCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  chartTitle: { color: colors.text, fontSize: 16, fontWeight: "700" },
  goalHint: { color: colors.muted, fontSize: 12, marginBottom: spacing.md },
  barsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 180,
    gap: 4,
  },
  barCol: { flex: 1, alignItems: "center" },
  barTrack: {
    width: "100%",
    height: 150,
    backgroundColor: colors.border,
    borderRadius: 4,
    justifyContent: "flex-end",
    overflow: "hidden",
    position: "relative",
  },
  barFill: {
    width: "100%",
    backgroundColor: colors.accent,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  goalTick: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.muted,
  },
  xLabel: { color: colors.muted, fontSize: 10, fontWeight: "600", marginTop: 6 },
  avgTitle: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  avgRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.xl },
  avgCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    alignItems: "center",
  },
  avgValue: { fontSize: 20, fontWeight: "800" },
  avgSuffix: { color: colors.muted, fontSize: 10 },
  avgLabel: { color: colors.muted, fontSize: 10, fontWeight: "600", marginTop: 4 },
});
