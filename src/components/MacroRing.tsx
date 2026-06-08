import { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
} from "react-native-reanimated";
import { colors } from "../constants/theme";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface MacroRingProps {
  value: number;
  max: number;
  color: string;
  label: string;
  size?: number;
}

export function MacroRing({ value, max, color, label, size = 72 }: MacroRingProps) {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = useSharedValue(0);

  useEffect(() => {
    const pct = max > 0 ? Math.min(value / max, 1) : 0;
    progress.value = withTiming(pct, { duration: 800 });
  }, [value, max, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  const displayValue = Math.round(value);
  const displayMax = Math.round(max);

  return (
    <View style={[styles.container, { width: size }]}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={[styles.center, { width: size, height: size }]}>
        <Text style={[styles.value, { fontSize: size * 0.18 }]}>
          {displayValue}
        </Text>
        <Text style={[styles.max, { fontSize: size * 0.11 }]}>
          /{displayMax}
        </Text>
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center" },
  center: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  value: { color: colors.text, fontWeight: "800" },
  max: { color: colors.muted, fontWeight: "600" },
  label: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "600",
    marginTop: 4,
    textTransform: "uppercase",
  },
});
