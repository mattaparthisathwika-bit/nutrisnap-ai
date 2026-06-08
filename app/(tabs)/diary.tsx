import { useMemo, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { format, parseISO, subDays } from "date-fns";
import { useRouter } from "expo-router";
import { useDiary, todayISO } from "../../src/hooks/useDiary";
import { getWeeklyData, getLoggedDates } from "../../src/utils/database";
import { useBreakpoint } from "../../src/hooks/useBreakpoint";
import { AppShell } from "../../src/components/layout/AppShell";
import { MealTimelineCard } from "../../src/components/MealTimelineCard";
import { DailyStatsPanel } from "../../src/components/DailyStatsPanel";
import { TrendsInsightsPanel } from "../../src/components/panels/TrendsInsightsPanel";
import { WeeklyCalendar } from "../../src/components/WeeklyCalendar";
import { HydrationTracker } from "../../src/components/HydrationTracker";
import { CalorieDonut } from "../../src/components/CalorieDonut";
import { Card } from "../../src/components/ui/Card";
import { Button } from "../../src/components/ui/Button";
import { colors, spacing } from "../../src/constants/theme";

export default function DiaryScreen() {
  const { isDesktop } = useBreakpoint();
  const router = useRouter();
  const {
    date,
    shiftDate,
    entries,
    totals,
    goals,
    streak,
    hydrationMl,
    loading,
    deleteEntry,
    logWater,
  } = useDiary();

  const [weeklyData, setWeeklyData] = useState<{ date: string; total_calories: number }[]>([]);
  const [loggedDates, setLoggedDates] = useState<string[]>([]);

  useEffect(() => {
    const start = format(subDays(parseISO(todayISO()), 6), "yyyy-MM-dd");
    Promise.all([getWeeklyData(start), getLoggedDates(start)]).then(([w, d]) => {
      setWeeklyData(w);
      setLoggedDates(d);
    });
  }, [entries]);

  const isToday = date === todayISO();
  const goalHitDates = weeklyData
    .filter((w) => w.total_calories >= goals.calories * 0.8)
    .map((w) => w.date);

  const sortedEntries = useMemo(
    () => [...entries].sort((a, b) => b.created_at.localeCompare(a.created_at)),
    [entries]
  );

  const chartData = weeklyData.map((w) => ({
    label: format(parseISO(w.date), "EEE").charAt(0),
    calories: w.total_calories,
    date: w.date,
  }));

  const avgCalories =
    weeklyData.length > 0
      ? Math.round(weeklyData.reduce((s, w) => s + w.total_calories, 0) / weeklyData.length)
      : 0;

  const rightPanel = (
    <>
      <DailyStatsPanel totals={totals} goals={goals} hydrationMl={hydrationMl} />
      <TrendsInsightsPanel
        streak={streak}
        avgCalories={avgCalories}
        calorieGoal={goals.calories}
        hydrationMl={hydrationMl}
        hydrationGoalMl={goals.hydration_goal_ml}
        chartData={chartData}
        compact
      />
    </>
  );

  const content = (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.dateRow}>
        <TouchableOpacity onPress={() => shiftDate(-1)} style={styles.arrow}>
          <Text style={styles.arrowText}>‹</Text>
        </TouchableOpacity>
        <View style={styles.dateCenter}>
          <Text style={styles.dateText}>{format(parseISO(date), "EEE, MMM d")}</Text>
          {isToday ? (
            <View style={styles.todayBadge}>
              <Text style={styles.todayText}>TODAY</Text>
            </View>
          ) : null}
        </View>
        <TouchableOpacity onPress={() => shiftDate(1)} style={styles.arrow}>
          <Text style={styles.arrowText}>›</Text>
        </TouchableOpacity>
      </View>

      <WeeklyCalendar
        loggedDates={loggedDates}
        goalHitDates={goalHitDates}
        weeklyData={weeklyData}
      />

      {!isDesktop ? (
        <>
          <View style={styles.mobileDonut}>
            <CalorieDonut
              caloriesUsed={totals.calories}
              calorieGoal={goals.calories}
              protein={totals.protein}
              proteinGoal={goals.protein}
              carbs={totals.carbs}
              carbsGoal={goals.carbs}
              fat={totals.fat}
              fatGoal={goals.fat}
              size={140}
            />
          </View>
          <HydrationTracker
            currentMl={hydrationMl}
            goalMl={goals.hydration_goal_ml}
            onAdd={logWater}
          />
        </>
      ) : (
        <HydrationTracker
          currentMl={hydrationMl}
          goalMl={goals.hydration_goal_ml}
          onAdd={logWater}
        />
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionLabel}>
          {isToday ? "TODAY'S DIARY" : "DAILY TIMELINE"}
        </Text>
        {isDesktop ? (
          <Button
            label="+ Add Meal"
            onPress={() => router.push("/(tabs)/snap")}
            style={styles.addBtn}
          />
        ) : null}
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 32 }} />
      ) : sortedEntries.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🍽️</Text>
          <Text style={styles.emptyTitle}>No meals logged yet</Text>
          <Text style={styles.emptyHint}>Snap a photo to start tracking</Text>
          <Button
            label="Snap a Meal"
            onPress={() => router.push("/(tabs)/snap")}
            style={{ marginTop: spacing.lg }}
          />
        </View>
      ) : (
        sortedEntries.map((entry) => (
          <MealTimelineCard
            key={entry.id}
            entry={entry}
            showAiBadge
            onDelete={() => deleteEntry(entry.id)}
          />
        ))
      )}

      {!isDesktop && entries.length > 0 ? (
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>
            {totals.calories.toLocaleString()} / {goals.calories.toLocaleString()} KCAL
          </Text>
          <Text style={styles.summaryRemaining}>
            🏁 {Math.max(goals.calories - totals.calories, 0)} kcal remaining
          </Text>
        </Card>
      ) : null}
    </ScrollView>
  );

  return (
    <AppShell
      title="NutriSnap AI"
      subtitle="Food Diary"
      streak={streak}
      rightPanelTitle="Daily Insights"
      rightPanel={rightPanel}
      rightAction={
        isDesktop ? undefined : (
          <TouchableOpacity onPress={() => router.push("/(tabs)/snap")}>
            <Text style={styles.viewDiary}>+ Add</Text>
          </TouchableOpacity>
        )
      }
    >
      {content}
    </AppShell>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: spacing.xxl },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },
  arrow: { padding: spacing.sm },
  arrowText: { color: colors.primary, fontSize: 28, fontWeight: "300" },
  dateCenter: { alignItems: "center" },
  dateText: { color: colors.text, fontSize: 18, fontWeight: "700" },
  todayBadge: {
    backgroundColor: colors.cardElevated,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 4,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  todayText: { color: colors.primary, fontSize: 10, fontWeight: "700" },
  mobileDonut: { alignItems: "center", marginBottom: spacing.lg },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  sectionLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1,
  },
  addBtn: { paddingVertical: 8, paddingHorizontal: 16 },
  viewDiary: { color: colors.primary, fontSize: 14, fontWeight: "700" },
  empty: { alignItems: "center", marginTop: 48, paddingHorizontal: spacing.lg },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { color: colors.text, fontSize: 18, fontWeight: "700", marginTop: spacing.md },
  emptyHint: { color: colors.muted, fontSize: 14, textAlign: "center", marginTop: spacing.sm },
  summaryCard: { marginTop: spacing.lg },
  summaryTitle: { color: colors.text, fontSize: 20, fontWeight: "800" },
  summaryRemaining: { color: colors.primary, fontSize: 13, marginTop: spacing.sm },
});
