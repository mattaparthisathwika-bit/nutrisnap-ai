import { View, Text, StyleSheet } from "react-native";
import { MacroResult } from "../../utils/demoVision";
import { DiaryEntry } from "../../utils/database.types";
import { Card } from "../ui/Card";
import { ProgressBar } from "../ui/ProgressBar";
import { Button } from "../ui/Button";
import { MealTypePicker } from "../MealTypePicker";
import { InsightSection } from "../layout/RightInsightsPanel";
import { colors, spacing } from "../../constants/theme";

interface AnalysisInsightsPanelProps {
  result: MacroResult | null;
  loading?: boolean;
  showMealPicker?: boolean;
  onConfirm?: () => void;
  onSelectMeal?: (meal: DiaryEntry["meal_type"]) => void;
  onCancelMealPicker?: () => void;
  saving?: boolean;
}

export function AnalysisInsightsPanel({
  result,
  loading,
  showMealPicker,
  onConfirm,
  onSelectMeal,
  onCancelMealPicker,
  saving,
}: AnalysisInsightsPanelProps) {
  if (loading) {
    return (
      <>
        <InsightSection label="Real-Time Analysis">
          <Card elevated>
            <Text style={styles.scanning}>Scanning environment...</Text>
            <ProgressBar value={72} max={100} color={colors.primary} height={4} />
            <Text style={styles.scanPct}>72% Complete</Text>
          </Card>
        </InsightSection>
        <InsightSection label="Status">
          <Card>
            <Text style={styles.statusLine}>● Identifying protein sources</Text>
            <Text style={styles.statusLine}>● Calculating macro density</Text>
            <Text style={styles.statusLine}>● Estimating portion sizes</Text>
          </Card>
        </InsightSection>
      </>
    );
  }

  if (!result) {
    return (
      <InsightSection label="Real-Time Analysis">
        <Card elevated>
          <Text style={styles.hint}>Snap a meal to see live macro breakdown and detected ingredients here.</Text>
        </Card>
      </InsightSection>
    );
  }

  if (showMealPicker && onSelectMeal && onCancelMealPicker) {
    return (
      <MealTypePicker
        foodName={result.foodName}
        onSelect={onSelectMeal}
        onCancel={onCancelMealPicker}
        compact
        saving={saving}
      />
    );
  }

  const accuracy =
    result.confidence === "high" ? "94%" : result.confidence === "medium" ? "78%" : "60%";

  return (
    <>
      <InsightSection label="Real-Time Analysis">
        <Card elevated>
          <Text style={styles.calories}>{result.calories} kcal</Text>
          <Text style={styles.accuracy}>Est. Accuracy {accuracy}</Text>
          <ProgressBar label="Protein" value={result.protein} max={60} color={colors.secondary} showValues suffix="g" />
          <ProgressBar label="Carbs" value={result.carbs} max={80} color={colors.tertiary} showValues suffix="g" />
          <ProgressBar label="Fat" value={result.fat} max={50} color={colors.fat} showValues suffix="g" />
        </Card>
      </InsightSection>

      {result.items && result.items.length > 0 ? (
        <InsightSection label="Detected Ingredients">
          <Card>
            {result.items.map((item, i) => (
              <View key={i} style={styles.ingredientRow}>
                <View style={styles.ingredientDot} />
                <View style={styles.ingredientInfo}>
                  <Text style={styles.ingredientName}>{item.name}</Text>
                  <Text style={styles.ingredientMeta}>
                    {item.protein}g P · {item.carbs}g C · {item.fat}g F
                  </Text>
                </View>
                <Text style={styles.ingredientCal}>{item.calories}</Text>
              </View>
            ))}
          </Card>
        </InsightSection>
      ) : null}

      <InsightSection label="Meal Summary">
        <Card>
          <Text style={styles.foodName}>{result.foodName}</Text>
          <Text style={styles.serving}>{result.servingSize}</Text>
          <View style={styles.confidenceRow}>
            <Text style={styles.confidenceLabel}>AI Confidence</Text>
            <Text style={styles.confidenceValue}>{result.confidence.toUpperCase()}</Text>
          </View>
        </Card>
      </InsightSection>

      {onConfirm ? (
        <Button label="Confirm & Save Meal" onPress={onConfirm} style={{ marginTop: spacing.sm }} />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  scanning: { color: colors.primary, fontSize: 13, fontWeight: "600", marginBottom: spacing.sm },
  scanPct: { color: colors.muted, fontSize: 11, marginTop: spacing.xs },
  statusLine: { color: colors.textSecondary, fontSize: 12, marginBottom: 6 },
  hint: { color: colors.textSecondary, fontSize: 13, lineHeight: 20 },
  calories: { color: colors.primary, fontSize: 32, fontWeight: "800" },
  accuracy: { color: colors.muted, fontSize: 12, marginBottom: spacing.md },
  ingredientRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  ingredientDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  ingredientInfo: { flex: 1 },
  ingredientName: { color: colors.text, fontSize: 13, fontWeight: "600" },
  ingredientMeta: { color: colors.muted, fontSize: 10, marginTop: 2 },
  ingredientCal: { color: colors.primary, fontSize: 13, fontWeight: "700" },
  foodName: { color: colors.text, fontSize: 16, fontWeight: "700" },
  serving: { color: colors.muted, fontSize: 12, marginTop: 4 },
  confidenceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  confidenceLabel: { color: colors.muted, fontSize: 11 },
  confidenceValue: { color: colors.primary, fontSize: 11, fontWeight: "700" },
});
