import { View, Text, StyleSheet } from "react-native";
import { colors, radius } from "../../constants/theme";

interface ProgressBarProps {
  value: number;
  max: number;
  color: string;
  label?: string;
  showValues?: boolean;
  suffix?: string;
  height?: number;
}

export function ProgressBar({
  value,
  max,
  color,
  label,
  showValues,
  suffix = "",
  height = 6,
}: ProgressBarProps) {
  const pct = max > 0 ? Math.min(value / max, 1) : 0;

  return (
    <View style={styles.wrap}>
      {(label || showValues) && (
        <View style={styles.header}>
          {label ? <Text style={styles.label}>{label}</Text> : <View />}
          {showValues ? (
            <Text style={styles.values}>
              {value}
              {suffix} / {max}
              {suffix}
            </Text>
          ) : null}
        </View>
      )}
      <View style={[styles.track, { height }]}>
        <View style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  label: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  values: { color: colors.textSecondary, fontSize: 12, fontWeight: "600" },
  track: {
    backgroundColor: colors.border,
    borderRadius: radius.full,
    overflow: "hidden",
  },
  fill: { height: "100%", borderRadius: radius.full },
});
