import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { colors, radius, spacing } from "../../constants/theme";

type Variant = "primary" | "secondary" | "outlined";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: string;
}

export function Button({
  label,
  onPress,
  variant = "primary",
  disabled,
  style,
  textStyle,
  icon,
}: ButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        variant === "primary" && styles.primary,
        variant === "secondary" && styles.secondary,
        variant === "outlined" && styles.outlined,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
    >
      {icon ? <Text style={[styles.icon, textStyle]}>{icon}</Text> : null}
      <Text
        style={[
          styles.label,
          variant === "primary" && styles.primaryLabel,
          variant === "secondary" && styles.secondaryLabel,
          variant === "outlined" && styles.outlinedLabel,
          textStyle,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    minHeight: 48,
  },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.cardElevated },
  outlined: {
    backgroundColor: colors.cardElevated,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.5 },
  label: { fontSize: 15, fontWeight: "700" },
  primaryLabel: { color: colors.onPrimary },
  secondaryLabel: { color: colors.text },
  outlinedLabel: { color: colors.primary },
  icon: { fontSize: 16 },
});
