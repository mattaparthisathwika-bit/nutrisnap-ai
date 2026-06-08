import { View, Text, StyleSheet } from "react-native";
import { colors, radius, spacing } from "../constants/theme";

interface DayPoint {
  label: string;
  calories: number;
  date: string;
}

interface WeeklyBarChartProps {
  data: DayPoint[];
  goal: number;
  height?: number;
}

export function WeeklyBarChart({ data, goal, height = 180 }: WeeklyBarChartProps) {
  const yMax = Math.max(...data.map((d) => d.calories), goal, 1);

  return (
    <View>
      <View style={[styles.chart, { height }]}>
        {data.map((d) => (
          <View key={d.date} style={styles.col}>
            <View style={styles.track}>
              <View
                style={[
                  styles.bar,
                  {
                    height: `${Math.max((d.calories / yMax) * 100, d.calories > 0 ? 4 : 0)}%`,
                  },
                ]}
              />
              <View style={[styles.goalLine, { bottom: `${(goal / yMax) * 100}%` }]} />
            </View>
            <Text style={styles.label}>{d.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chart: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 4,
  },
  col: { flex: 1, alignItems: "center" },
  track: {
    width: "100%",
    flex: 1,
    backgroundColor: colors.border,
    borderRadius: radius.sm,
    justifyContent: "flex-end",
    overflow: "hidden",
    position: "relative",
    minHeight: 120,
  },
  bar: {
    width: "100%",
    backgroundColor: colors.primary,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  goalLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.muted,
  },
  label: { color: colors.muted, fontSize: 10, fontWeight: "600", marginTop: 6 },
});
