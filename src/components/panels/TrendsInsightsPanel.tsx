import { View, Text, StyleSheet } from "react-native";
import { Card } from "../ui/Card";
import { ProgressBar } from "../ui/ProgressBar";
import { WeeklyBarChart } from "../WeeklyBarChart";
import { InsightSection } from "../layout/RightInsightsPanel";
import { colors, spacing } from "../../constants/theme";

interface DayPoint {
  label: string;
  calories: number;
  date: string;
}

interface TrendsInsightsPanelProps {
  streak: number;
  avgCalories: number;
  calorieGoal: number;
  hydrationMl: number;
  hydrationGoalMl: number;
  chartData?: DayPoint[];
  compact?: boolean;
}

export function TrendsInsightsPanel({
  streak,
  avgCalories,
  calorieGoal,
  hydrationMl,
  hydrationGoalMl,
  chartData = [],
  compact,
}: TrendsInsightsPanelProps) {
  const goalPct = calorieGoal > 0 ? Math.round((avgCalories / calorieGoal) * 100) : 0;

  return (
    <>
      <InsightSection label="Streak">
        <Card elevated>
          <View style={styles.streakRow}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <View>
              <Text style={styles.streakValue}>{streak} Days</Text>
              <Text style={styles.streakHint}>Keep logging daily!</Text>
            </View>
          </View>
        </Card>
      </InsightSection>

      <InsightSection label="Water Target">
        <Card>
          <ProgressBar
            label="Hydration"
            value={hydrationMl}
            max={hydrationGoalMl}
            color={colors.secondary}
            showValues
            suffix="ml"
          />
          <Text style={styles.waterHint}>
            {(hydrationMl / 1000).toFixed(1)}L of {(hydrationGoalMl / 1000).toFixed(1)}L goal
          </Text>
        </Card>
      </InsightSection>

      <InsightSection label="Weekly Trends">
        <Card>
          <View style={styles.trendHeader}>
            <Text style={styles.trendLabel}>Avg. Daily Intake</Text>
            <Text style={styles.trendValue}>{avgCalories} kcal</Text>
          </View>
          <ProgressBar value={goalPct} max={100} color={colors.primary} height={4} />
          <Text style={styles.goalPct}>{goalPct}% of daily goal</Text>
          {!compact && chartData.length > 0 ? (
            <View style={{ marginTop: spacing.md }}>
              <WeeklyBarChart data={chartData} goal={calorieGoal} height={120} />
            </View>
          ) : null}
        </Card>
      </InsightSection>
    </>
  );
}

const styles = StyleSheet.create({
  streakRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  streakEmoji: { fontSize: 32 },
  streakValue: { color: colors.primary, fontSize: 22, fontWeight: "800" },
  streakHint: { color: colors.muted, fontSize: 11 },
  waterHint: { color: colors.textSecondary, fontSize: 11, marginTop: spacing.sm },
  trendHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.sm },
  trendLabel: { color: colors.muted, fontSize: 11 },
  trendValue: { color: colors.primary, fontSize: 14, fontWeight: "700" },
  goalPct: { color: colors.muted, fontSize: 10, marginTop: 4 },
});
