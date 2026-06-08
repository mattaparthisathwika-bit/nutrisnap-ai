import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { colors } from "../constants/theme";

interface CalorieDonutProps {
  caloriesUsed: number;
  calorieGoal: number;
  protein: number;
  proteinGoal: number;
  carbs: number;
  carbsGoal: number;
  fat: number;
  fatGoal: number;
  size?: number;
}

export function CalorieDonut({
  caloriesUsed,
  calorieGoal,
  protein,
  proteinGoal,
  carbs,
  carbsGoal,
  fat,
  fatGoal,
  size = 160,
}: CalorieDonutProps) {
  const remaining = Math.max(calorieGoal - caloriesUsed, 0);
  const calPct = calorieGoal > 0 ? Math.min(caloriesUsed / calorieGoal, 1) : 0;
  const cx = size / 2;
  const stroke = 10;
  const rings = [
    { pct: calPct, color: colors.primary, r: size / 2 - stroke },
    { pct: proteinGoal > 0 ? Math.min(protein / proteinGoal, 1) : 0, color: colors.secondary, r: size / 2 - stroke - 14 },
    { pct: carbsGoal > 0 ? Math.min(carbs / carbsGoal, 1) : 0, color: colors.tertiary, r: size / 2 - stroke - 28 },
  ];

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {rings.map((ring, i) => {
          const circ = 2 * Math.PI * ring.r;
          return (
            <Circle
              key={i}
              cx={cx}
              cy={cx}
              r={ring.r}
              stroke={colors.border}
              strokeWidth={stroke}
              fill="none"
            />
          );
        })}
        {rings.map((ring, i) => {
          const circ = 2 * Math.PI * ring.r;
          return (
            <Circle
              key={`fill-${i}`}
              cx={cx}
              cy={cx}
              r={ring.r}
              stroke={ring.color}
              strokeWidth={stroke}
              fill="none"
              strokeDasharray={`${circ * ring.pct} ${circ}`}
              rotation="-90"
              origin={`${cx}, ${cx}`}
              strokeLinecap="round"
            />
          );
        })}
      </Svg>
      <View style={[styles.center, { width: size, height: size }]}>
        <Text style={styles.label}>REMAINING</Text>
        <Text style={styles.value}>{remaining.toLocaleString()}</Text>
        <Text style={styles.sub}>kcal of {calorieGoal.toLocaleString()}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center" },
  center: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: "600",
    letterSpacing: 1,
  },
  value: { color: colors.primary, fontSize: 28, fontWeight: "800" },
  sub: { color: colors.textSecondary, fontSize: 11, marginTop: 2 },
});
