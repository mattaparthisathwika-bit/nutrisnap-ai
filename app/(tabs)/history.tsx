import { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { subDays, format, parseISO } from "date-fns";
import { getWeeklyData, getUserGoals, getDailyTotals, getLoggedDates } from "../../src/utils/database";
import { todayISO } from "../../src/hooks/useDiary";
import { useBreakpoint } from "../../src/hooks/useBreakpoint";
import { AppShell } from "../../src/components/layout/AppShell";
import { WeeklyBarChart } from "../../src/components/WeeklyBarChart";
import { WeeklyCalendar } from "../../src/components/WeeklyCalendar";
import { TrendsInsightsPanel } from "../../src/components/panels/TrendsInsightsPanel";
import { getHydration } from "../../src/utils/database";
import { Card } from "../../src/components/ui/Card";
import { colors, spacing } from "../../src/constants/theme";

interface DayPoint {
  label: string;
  calories: number;
  date: string;
}

export default function HistoryScreen() {
  const { isDesktop } = useBreakpoint();
  const [chartData, setChartData] = useState<DayPoint[]>([]);
  const [goal, setGoal] = useState(2000);
  const [averages, setAverages] = useState({ protein: 0, carbs: 0, fat: 0, calories: 0 });
  const [streak, setStreak] = useState(0);
  const [loggedDates, setLoggedDates] = useState<string[]>([]);
  const [weeklyRaw, setWeeklyRaw] = useState<{ date: string; total_calories: number }[]>([]);
  const [hydrationMl, setHydrationMl] = useState(0);
  const [hydrationGoal, setHydrationGoal] = useState(3000);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const today = todayISO();
      const start = format(subDays(parseISO(today), 6), "yyyy-MM-dd");
      const [weekly, goals, dates, hydration] = await Promise.all([
        getWeeklyData(start),
        getUserGoals(),
        getLoggedDates(start),
        getHydration(today),
      ]);
      setHydrationMl(hydration);

      setGoal(goals.calories);
      setStreak(goals.streak);
      setHydrationGoal(goals.hydration_goal_ml);
      setLoggedDates(dates);
      setWeeklyRaw(weekly);

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
          label: format(parseISO(d), "EEE").charAt(0).toUpperCase(),
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

  const goalHitDates = useMemo(
    () => weeklyRaw.filter((w) => w.total_calories >= goal * 0.8).map((w) => w.date),
    [weeklyRaw, goal]
  );

  const rightPanel = (
    <>
      <TrendsInsightsPanel
        streak={streak}
        avgCalories={averages.calories}
        calorieGoal={goal}
        hydrationMl={hydrationMl}
        hydrationGoalMl={hydrationGoal}
        chartData={chartData}
      />
      <View style={styles.avgGrid}>
        <AvgCard label="Protein" value={averages.protein} color={colors.secondary} />
        <AvgCard label="Carbs" value={averages.carbs} color={colors.tertiary} />
        <AvgCard label="Fat" value={averages.fat} color={colors.fat} />
      </View>
    </>
  );

  return (
    <AppShell
      title="NutriSnap AI"
      subtitle="Weekly History"
      streak={streak}
      rightPanelTitle="Trends & Targets"
      rightPanel={rightPanel}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <WeeklyCalendar
          loggedDates={loggedDates}
          goalHitDates={goalHitDates}
          weeklyData={weeklyRaw}
        />

        <View style={styles.streakRow}>
          <Text style={styles.streakEmojiSmall}>🔥</Text>
          <View>
            <Text style={styles.streakCount}>{streak} day streak</Text>
            <Text style={styles.streakHint}>Keep logging daily!</Text>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <>
            <Card style={styles.chartCard}>
              <Text style={styles.chartTitle}>Weekly Trends</Text>
              <Text style={styles.goalHint}>Goal: {goal} cal/day</Text>
              <WeeklyBarChart data={chartData} goal={goal} />
              <View style={styles.avgIntake}>
                <Text style={styles.avgIntakeLabel}>Avg. Daily Intake</Text>
                <Text style={styles.avgIntakeValue}>{averages.calories} kcal</Text>
              </View>
            </Card>

            {!isDesktop ? (
              <>
                <Text style={styles.avgTitle}>Weekly averages</Text>
                <View style={styles.avgRow}>
                  <AvgCard label="Calories" value={averages.calories} color={colors.primary} suffix="cal" />
                  <AvgCard label="Protein" value={averages.protein} color={colors.secondary} />
                  <AvgCard label="Carbs" value={averages.carbs} color={colors.tertiary} />
                  <AvgCard label="Fat" value={averages.fat} color={colors.fat} />
                </View>
              </>
            ) : null}
          </>
        )}
      </ScrollView>
    </AppShell>
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
      <Text style={[styles.avgCardValue, { color }]}>{value}</Text>
      <Text style={styles.avgSuffix}>{suffix}</Text>
      <Text style={styles.avgCardLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.xxl },
  streakRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  streakEmojiSmall: { fontSize: 36 },
  streakCount: { color: colors.text, fontSize: 18, fontWeight: "800" },
  streakHint: { color: colors.muted, fontSize: 12 },
  chartCard: { marginBottom: spacing.lg },
  chartTitle: { color: colors.text, fontSize: 16, fontWeight: "700" },
  goalHint: { color: colors.muted, fontSize: 12, marginBottom: spacing.md },
  avgIntake: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  avgIntakeLabel: { color: colors.muted, fontSize: 12 },
  avgIntakeValue: { color: colors.primary, fontSize: 14, fontWeight: "700" },
  avgTitle: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  avgRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.xl },
  avgCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    alignItems: "center",
  },
  avgCardValue: { fontSize: 20, fontWeight: "800" },
  avgSuffix: { color: colors.muted, fontSize: 10 },
  avgCardLabel: { color: colors.muted, fontSize: 10, fontWeight: "600", marginTop: 4 },
  avgGrid: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.md },
  panelTitle: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  streakCard: { alignItems: "center", marginTop: spacing.md },
  streakEmoji: { fontSize: 36 },
  streakValue: { color: colors.primary, fontSize: 32, fontWeight: "800" },
  streakLabel: { color: colors.muted, fontSize: 12 },
});
