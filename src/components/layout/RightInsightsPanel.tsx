import { ScrollView, View, Text, StyleSheet } from "react-native";
import { colors, spacing } from "../../constants/theme";

interface RightInsightsPanelProps {
  title?: string;
  children: React.ReactNode;
}

export function RightInsightsPanel({ title = "Insights", children }: RightInsightsPanelProps) {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      nestedScrollEnabled
    >
      <Text style={styles.title}>{title}</Text>
      <View style={styles.sections}>{children}</View>
    </ScrollView>
  );
}

export function InsightSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingBottom: spacing.xxl },
  title: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: spacing.md,
  },
  sections: { gap: spacing.lg },
  section: { gap: spacing.sm },
  sectionLabel: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
});
