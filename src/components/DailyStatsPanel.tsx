import { View, Text, StyleSheet } from "react-native";
import { CalorieDonut } from "./CalorieDonut";
import { ProgressBar } from "./ui/ProgressBar";
import { Card } from "./ui/Card";
import { colors, spacing } from "../constants/theme";
import { DailyTotals } from "../hooks/useDiary";
import { UserGoals } from "../utils/database.types";

interface DailyStatsPanelProps {
  totals: DailyTotals;
  goals: UserGoals;
  hydrationMl?: number;
}

export function DailyStatsPanel({ totals, goals, hydrationMl = 0 }: DailyStatsPanelProps) {
  const caloriesUsed = totals.calories;

  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>Daily Totals</Text>

      <View style={styles.donutWrap}>
        <CalorieDonut
          caloriesUsed={caloriesUsed}
          calorieGoal={goals.calories}
          protein={totals.protein}
          proteinGoal={goals.protein}
          carbs={totals.carbs}
          carbsGoal={goals.carbs}
          fat={totals.fat}
          fatGoal={goals.fat}
        />
      </View>

      <View style={styles.macros}>
        <MacroStat label="Protein" value={totals.protein} goal={goals.protein} color={colors.secondary} />
        <MacroStat label="Carbs" value={totals.carbs} goal={goals.carbs} color={colors.tertiary} />
        <MacroStat label="Fat" value={totals.fat} goal={goals.fat} color={colors.fat} />
      </View>

      <Card style={styles.nutrientCard}>
        <Text style={styles.nutrientTitle}>Nutrient Focus</Text>
        <ProgressBar
          label="Hydration"
          value={hydrationMl}
          max={goals.hydration_goal_ml}
          color={colors.secondary}
          showValues
          suffix="ml"
        />
        <ProgressBar
          label="Fiber Intake"
          value={totals.fiber}
          max={goals.fiber_goal}
          color={colors.primary}
          showValues
          suffix="g"
        />
        <ProgressBar
          label="Sugar Limit"
          value={Math.round(totals.carbs * 0.1)}
          max={goals.sugar_limit}
          color={colors.tertiary}
          showValues
          suffix="g"
        />
      </Card>

      <View style={styles.remaining}>
        <Text style={styles.remainingText}>
          🏁 {Math.max(goals.calories - caloriesUsed, 0)} kcal remaining
        </Text>
      </View>
    </View>
  );
}

function MacroStat({
  label,
  value,
  goal,
  color,
}: {
  label: string;
  value: number;
  goal: number;
  color: string;
}) {
  return (
    <View style={styles.macroStat}>
      <Text style={styles.macroLabel}>{label}</Text>
      <Text style={[styles.macroValue, { color }]}>
        {value}g / {goal}g
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { gap: spacing.md },
  panelTitle: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  donutWrap: { alignItems: "center", paddingVertical: spacing.sm },
  macros: { gap: spacing.sm },
  macroStat: { gap: 2 },
  macroLabel: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  macroValue: { fontSize: 14, fontWeight: "700" },
  nutrientCard: { gap: spacing.md },
  nutrientTitle: { color: colors.text, fontSize: 14, fontWeight: "700" },
  remaining: {
    backgroundColor: colors.cardElevated,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  remainingText: { color: colors.primary, fontSize: 13, fontWeight: "600" },
});
