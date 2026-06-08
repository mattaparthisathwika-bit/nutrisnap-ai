import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  ScrollView,
  Alert,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { analyzeFoodImage, isDemoModeOnly, type MacroResult, type FoodItem } from "../../src/utils/foodVision";
import { imageToBase64 } from "../../src/utils/imageToBase64";
import { addDiaryEntry, DiaryEntry } from "../../src/utils/database";
import { showAlert } from "../../src/utils/alert";
import { todayISO } from "../../src/hooks/useDiary";
import { useAppData } from "../../src/hooks/useAppData";
import { useBreakpoint } from "../../src/hooks/useBreakpoint";
import { AppShell } from "../../src/components/layout/AppShell";
import { AnalysisInsightsPanel } from "../../src/components/panels/AnalysisInsightsPanel";
import { MealTypePicker } from "../../src/components/MealTypePicker";
import { Button } from "../../src/components/ui/Button";
import { Card } from "../../src/components/ui/Card";
import { colors, radius, spacing } from "../../src/constants/theme";

const SCAN_STEPS = [
  "Analyzing plate composition...",
  "Identifying protein sources...",
  "Calculating macro density...",
];

export default function SnapScreen() {
  const { isDesktop, isMobile, isTablet } = useBreakpoint();
  const useInlineMealPicker = isDesktop || isTablet;
  const router = useRouter();
  const { streak, refresh: refreshApp } = useAppData();
  const [loading, setLoading] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [result, setResult] = useState<MacroResult | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showMealPicker, setShowMealPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processImage = async (uri: string, pickerBase64?: string | null) => {
    setImageUri(uri);
    setLoading(true);
    setError(null);
    setResult(null);
    setScanStep(0);

    const stepInterval = setInterval(() => {
      setScanStep((s) => (s < SCAN_STEPS.length - 1 ? s + 1 : s));
    }, 1200);

    try {
      const base64 = await imageToBase64(uri, pickerBase64);
      const analysis = await analyzeFoodImage(base64);
      setResult(analysis);
      setShowMealPicker(false);
      setShowResult(isMobile);
    } catch (e) {
      let message = e instanceof Error ? e.message : "Could not analyze this photo.";
      if (message === "Failed to fetch" || message === "fetch failed") {
        message =
          "Cannot reach the vision proxy. Run npm run proxy in a second terminal, then scan again.";
      }
      setError(message);
      Alert.alert("Analysis failed", message);
    } finally {
      clearInterval(stepInterval);
      setLoading(false);
    }
  };

  const pickImage = async (useCamera: boolean) => {
    if (useCamera) {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Camera access is required to snap meals.");
        return;
      }
      const res = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        base64: true,
      });
      if (!res.canceled && res.assets[0]) {
        await processImage(res.assets[0].uri, res.assets[0].base64);
      }
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Photo library access is required.");
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        base64: true,
      });
      if (!res.canceled && res.assets[0]) {
        await processImage(res.assets[0].uri, res.assets[0].base64);
      }
    }
  };

  const openMealPicker = () => {
    setShowMealPicker(true);
    if (!useInlineMealPicker) setShowResult(false);
  };

  const closeMealPicker = () => {
    setShowMealPicker(false);
    if (isMobile && result) setShowResult(true);
  };

  const saveToDiary = async (mealType: DiaryEntry["meal_type"]) => {
    if (!result || saving) return;
    const foodName = result.foodName;
    setSaving(true);
    try {
      await addDiaryEntry(
        {
          date: todayISO(),
          meal_type: mealType,
          food_name: foodName,
          calories: result.calories,
          protein: result.protein,
          carbs: result.carbs,
          fat: result.fat,
          fiber: result.fiber,
          serving_size: result.servingSize,
        },
        imageUri ?? undefined
      );
      setShowMealPicker(false);
      setShowResult(false);
      setResult(null);
      setImageUri(null);
      await refreshApp();
      showAlert("Logged!", `${foodName} saved to your diary.`);
      router.push("/(tabs)/diary");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Could not save to diary. Please try again.";
      showAlert("Error", message);
    } finally {
      setSaving(false);
    }
  };

  const viewport = (
    <View style={[styles.viewport, isDesktop && styles.viewportDesktop]}>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderEmoji}>🥗</Text>
          <Text style={styles.placeholderText}>Position your meal in the frame</Text>
        </View>
      )}

      <View style={[styles.corner, styles.cornerTL]} />
      <View style={[styles.corner, styles.cornerTR]} />
      <View style={[styles.corner, styles.cornerBL]} />
      <View style={[styles.corner, styles.cornerBR]} />

      {loading ? (
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>
            <Text style={styles.statusAccent}>AI STATUS: </Text>
            {SCAN_STEPS[scanStep]}
          </Text>
        </View>
      ) : null}

      {loading ? (
        <View style={styles.sideBadge}>
          <View style={styles.dot} />
          <Text style={styles.sideBadgeText}>IDENTIFYING PROTEIN...</Text>
        </View>
      ) : null}

      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlBtn} onPress={() => pickImage(false)}>
          <Ionicons name="images-outline" size={22} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.shutterBtn} onPress={() => pickImage(true)} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={colors.onPrimary} />
          ) : (
            <Ionicons name="camera" size={32} color={colors.onPrimary} />
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlBtn} onPress={() => { setImageUri(null); setResult(null); setShowResult(false); }}>
          <Ionicons name="refresh-outline" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      {!isDesktop ? (
        <TouchableOpacity style={styles.galleryBtn} onPress={() => pickImage(false)}>
          <Ionicons name="folder-open-outline" size={16} color={colors.text} />
          <Text style={styles.galleryBtnText}>CHOOSE FROM GALLERY</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );

  return (
    <AppShell
      title="NutriSnap AI"
      subtitle={isDesktop ? "Vision Interface" : `Current Streak: ${streak} Days`}
      streak={streak}
      rightPanelTitle="Vision Analysis"
      rightPanel={
        <AnalysisInsightsPanel
          result={result}
          loading={loading}
          showMealPicker={useInlineMealPicker && showMealPicker}
          onConfirm={result && !showMealPicker ? openMealPicker : undefined}
          onSelectMeal={saveToDiary}
          onCancelMealPicker={closeMealPicker}
          saving={saving}
        />
      }
      noPadding
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isDemoModeOnly() ? (
          <View style={styles.demoBanner}>
            <Ionicons name="information-circle-outline" size={18} color={colors.tertiary} />
            <Text style={styles.demoBannerText}>
              Demo mode — scans use sample data, not your photo. Add an API key in .env for real AI
              (Gemini, OpenAI, or HuggingFace).
            </Text>
          </View>
        ) : null}

        <View style={[styles.desktopViewportWrap, !isDesktop && styles.mobileViewportWrap]}>
          {viewport}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>

      <Modal visible={showResult && !!result && !showMealPicker} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.resultModal}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.resultImage} resizeMode="cover" />
              ) : null}

              <View style={styles.aiTag}>
                <Text style={styles.aiTagText}>AI IDENTIFIED</Text>
              </View>

              <View style={styles.resultHeader}>
                <Text style={styles.resultFoodName}>{result?.foodName}</Text>
                <View style={styles.matchBadge}>
                  <Text style={styles.matchText}>
                    ✓ {result?.confidence === "high" ? "98%" : "85%"} Match
                  </Text>
                </View>
              </View>

              <Card style={styles.energyCard}>
                <View>
                  <Text style={styles.energyLabel}>TOTAL ENERGY</Text>
                  <Text style={styles.energyValue}>
                    {result?.calories} <Text style={styles.energyUnit}>kcal</Text>
                  </Text>
                </View>
                <View style={styles.energyRing}>
                  <Text style={styles.energyPct}>72%</Text>
                </View>
              </Card>

              <View style={styles.macroGrid}>
                <MacroCard label="PROTEIN" value={result?.protein ?? 0} color={colors.secondary} />
                <MacroCard label="CARBS" value={result?.carbs ?? 0} color={colors.tertiary} />
                <MacroCard label="FAT" value={result?.fat ?? 0} color={colors.fat} />
              </View>

              {result?.items && result.items.length > 1 ? (
                <Card style={styles.breakdownCard}>
                  <Text style={styles.breakdownTitle}>📊 Instant AI Breakdown</Text>
                  {result.items.map((item: FoodItem, i: number) => (
                    <View key={i} style={styles.breakdownRow}>
                      <Text style={styles.breakdownName}>{item.name}</Text>
                      <Text style={styles.breakdownCal}>{item.calories} kcal</Text>
                    </View>
                  ))}
                </Card>
              ) : null}
            </ScrollView>

            <Button label="✓ Confirm & Log" onPress={openMealPicker} />
            <Button
              label="✎ Edit Entry"
              variant="secondary"
              onPress={() => setShowResult(false)}
              style={{ marginTop: spacing.sm }}
            />
          </View>
        </View>
      </Modal>

      {!useInlineMealPicker ? (
        <Modal visible={showMealPicker && !!result} animationType="fade" transparent>
          <View style={styles.mealModalOverlay}>
            <MealTypePicker
              foodName={result?.foodName}
              onSelect={saveToDiary}
              onCancel={closeMealPicker}
              saving={saving}
            />
          </View>
        </Modal>
      ) : null}
    </AppShell>
  );
}

function MacroCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.macroCard}>
      <Text style={styles.macroCardLabel}>{label}</Text>
      <Text style={[styles.macroCardValue, { color }]}>{value} g</Text>
      <View style={[styles.macroCardBar, { backgroundColor: color }]} />
    </View>
  );
}

const CORNER = 24;
const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: spacing.xl },
  desktopViewportWrap: { flex: 1, padding: spacing.lg },
  mobileViewportWrap: { padding: 0 },
  viewport: {
    margin: spacing.md,
    minHeight: 320,
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    position: "relative",
  },
  viewportDesktop: { margin: 0, minHeight: 480, flex: 1 },
  previewImage: { width: "100%", height: "100%" },
  placeholder: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.sm },
  placeholderEmoji: { fontSize: 64 },
  placeholderText: { color: colors.muted, fontSize: 14 },
  corner: {
    position: "absolute",
    width: CORNER,
    height: CORNER,
    borderColor: colors.primary,
    borderWidth: 3,
  },
  cornerTL: { top: 16, left: 16, borderRightWidth: 0, borderBottomWidth: 0 },
  cornerTR: { top: 16, right: 16, borderLeftWidth: 0, borderBottomWidth: 0 },
  cornerBL: { bottom: 80, left: 16, borderRightWidth: 0, borderTopWidth: 0 },
  cornerBR: { bottom: 80, right: 16, borderLeftWidth: 0, borderTopWidth: 0 },
  statusBadge: {
    position: "absolute",
    top: 16,
    alignSelf: "center",
    backgroundColor: "rgba(10,10,10,0.85)",
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    left: spacing.lg,
    right: spacing.lg,
  },
  statusText: { color: colors.text, fontSize: 12, textAlign: "center" },
  statusAccent: { color: colors.primary, fontWeight: "700" },
  sideBadge: {
    position: "absolute",
    left: 16,
    top: "40%",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(10,10,10,0.8)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.sm,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary },
  sideBadgeText: { color: colors.text, fontSize: 9, fontWeight: "700" },
  controls: {
    position: "absolute",
    bottom: 56,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg,
  },
  controlBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(20,20,20,0.9)",
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  shutterBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  galleryBtn: {
    position: "absolute",
    bottom: 12,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: "rgba(20,20,20,0.85)",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  galleryBtnText: { color: colors.text, fontSize: 11, fontWeight: "700", letterSpacing: 0.5 },
  analysisPanel: { gap: spacing.md },
  analysisLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  analysisCal: { color: colors.primary, fontSize: 36, fontWeight: "800" },
  analysisAccuracy: { color: colors.muted, fontSize: 12, marginBottom: spacing.md },
  analysisHint: { color: colors.textSecondary, fontSize: 14 },
  ingredientTitle: { color: colors.text, fontSize: 14, fontWeight: "700", marginBottom: spacing.sm },
  ingredientRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  ingredientName: { color: colors.text, fontSize: 13 },
  ingredientCal: { color: colors.primary, fontSize: 13, fontWeight: "600" },
  scanProgress: { marginTop: spacing.md, gap: spacing.sm },
  scanProgressText: { color: colors.primary, fontSize: 12 },
  demoBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.cardElevated,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.tertiary,
  },
  demoBannerText: { flex: 1, color: colors.textSecondary, fontSize: 13, lineHeight: 18 },
  error: { color: colors.danger, textAlign: "center", margin: spacing.md },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "flex-end",
  },
  mealModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  resultModal: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.lg,
    maxHeight: "92%",
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  resultImage: { width: "100%", height: 180, borderRadius: radius.lg, marginBottom: spacing.md },
  aiTag: {
    alignSelf: "flex-start",
    backgroundColor: colors.cardElevated,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.primary,
    marginBottom: spacing.sm,
  },
  aiTagText: { color: colors.primary, fontSize: 10, fontWeight: "700" },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  resultFoodName: { color: colors.text, fontSize: 22, fontWeight: "800", flex: 1 },
  matchBadge: {
    backgroundColor: colors.cardElevated,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  matchText: { color: colors.primary, fontSize: 11, fontWeight: "700" },
  energyCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  energyLabel: { color: colors.muted, fontSize: 10, fontWeight: "600", letterSpacing: 1 },
  energyValue: { color: colors.primary, fontSize: 32, fontWeight: "800" },
  energyUnit: { fontSize: 16, color: colors.textSecondary },
  energyRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 4,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  energyPct: { color: colors.primary, fontSize: 14, fontWeight: "800" },
  macroGrid: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.md },
  macroCard: {
    flex: 1,
    backgroundColor: colors.cardElevated,
    borderRadius: radius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  macroCardLabel: { color: colors.muted, fontSize: 9, fontWeight: "600", letterSpacing: 0.5 },
  macroCardValue: { fontSize: 18, fontWeight: "800", marginVertical: 4 },
  macroCardBar: { height: 3, borderRadius: 2 },
  breakdownCard: { marginBottom: spacing.md },
  breakdownTitle: { color: colors.text, fontSize: 15, fontWeight: "700", marginBottom: spacing.sm },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  breakdownName: { color: colors.textSecondary, fontSize: 13 },
  breakdownCal: { color: colors.text, fontSize: 13, fontWeight: "600" },
});
