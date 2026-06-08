export const colors = {
  bg: "#0A0A0A",
  card: "#141414",
  cardElevated: "#1A1A1A",
  border: "#262626",
  text: "#FFFFFF",
  textSecondary: "#A3A3A3",
  muted: "#737373",
  primary: "#22C55E",
  secondary: "#0EA5E9",
  tertiary: "#F59E0B",
  danger: "#EF4444",
  accent: "#22C55E",
  protein: "#0EA5E9",
  carbs: "#F59E0B",
  fat: "#A3A3A3",
  onPrimary: "#0A0A0A",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

export const breakpoints = {
  desktop: 1024,
  tablet: 768,
};

export const typography = {
  headline: { fontSize: 28, fontWeight: "800" as const, color: colors.text },
  title: { fontSize: 22, fontWeight: "700" as const, color: colors.text },
  body: { fontSize: 15, fontWeight: "400" as const, color: colors.text },
  label: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: colors.muted,
    textTransform: "uppercase" as const,
    letterSpacing: 1,
  },
  caption: { fontSize: 13, fontWeight: "500" as const, color: colors.textSecondary },
};
