import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { getUserGoals, getUserProfile, updateUserGoals } from "../../src/utils/database";
import { useProfile } from "../../src/context/ProfileContext";
import { ActivityLevel } from "../../src/utils/database.types";
import { useBreakpoint } from "../../src/hooks/useBreakpoint";
import { AppShell } from "../../src/components/layout/AppShell";
import { ProfileAvatar } from "../../src/components/profile/ProfileAvatar";
import { Button } from "../../src/components/ui/Button";
import { Card } from "../../src/components/ui/Card";
import { ProgressBar } from "../../src/components/ui/ProgressBar";
import { InsightSection } from "../../src/components/layout/RightInsightsPanel";
import { showAlert } from "../../src/utils/alert";
import { parsePositiveInt, toInputNumber } from "../../src/utils/numbers";
import { colors, spacing, radius } from "../../src/constants/theme";

const ACTIVITY_LEVELS: { value: ActivityLevel; label: string }[] = [
  { value: "sedentary", label: "Sedentary" },
  { value: "light", label: "Light" },
  { value: "moderate", label: "Moderate" },
  { value: "active", label: "Active" },
  { value: "athlete", label: "Athlete" },
];

export default function ProfileScreen() {
  const { isDesktop } = useBreakpoint();
  const { profile, saveProfile } = useProfile();

  const [formReady, setFormReady] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [activity, setActivity] = useState<ActivityLevel>("moderate");
  const [note, setNote] = useState("");

  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [hydration, setHydration] = useState("");
  const [fiber, setFiber] = useState("");
  const [sugar, setSugar] = useState("");
  const [streak, setStreak] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadForm() {
      try {
        const [p, g] = await Promise.all([getUserProfile(), getUserGoals()]);
        if (!active) return;
        setName(p.name);
        setEmail(p.email);
        setAge(toInputNumber(p.age, 28));
        setHeight(toInputNumber(p.height_cm, 170));
        setWeight(toInputNumber(p.weight_kg, 70));
        setActivity(p.activity_level);
        setNote(p.daily_goal_note ?? "");
        setCalories(toInputNumber(g.calories, 2000));
        setProtein(toInputNumber(g.protein, 150));
        setCarbs(toInputNumber(g.carbs, 200));
        setFat(toInputNumber(g.fat, 65));
        setHydration(toInputNumber(g.hydration_goal_ml, 3000));
        setFiber(toInputNumber(g.fiber_goal, 35));
        setSugar(toInputNumber(g.sugar_limit, 25));
        setStreak(g.streak);
      } finally {
        if (active) setFormReady(true);
      }
    }
    loadForm();
    return () => {
      active = false;
    };
  }, []);

  const ageN = Number.parseInt(age, 10);
  const heightN = Number.parseInt(height, 10);
  const weightN = Number.parseInt(weight, 10);
  const bmi =
    heightN > 0 && weightN > 0
      ? (weightN / Math.pow(heightN / 100, 2)).toFixed(1)
      : "—";

  const saveAll = async () => {
    if (!name.trim()) {
      showAlert("Name required", "Please enter your name.");
      return;
    }

    let ageN: number;
    let heightN: number;
    let weightN: number;
    let goalValues: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      hydration_goal_ml: number;
      fiber_goal: number;
      sugar_limit: number;
    };

    try {
      ageN = parsePositiveInt(age, "Age");
      heightN = parsePositiveInt(height, "Height");
      weightN = parsePositiveInt(weight, "Weight");
      goalValues = {
        calories: parsePositiveInt(calories, "Calorie goal"),
        protein: parsePositiveInt(protein, "Protein target"),
        carbs: parsePositiveInt(carbs, "Carbs target"),
        fat: parsePositiveInt(fat, "Fat target"),
        hydration_goal_ml: parsePositiveInt(hydration, "Hydration goal"),
        fiber_goal: parsePositiveInt(fiber, "Fiber goal"),
        sugar_limit: parsePositiveInt(sugar, "Sugar limit"),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Please check your number fields.";
      showAlert("Invalid values", message);
      return;
    }

    setSaving(true);
    try {
      await updateUserGoals(goalValues);
      await saveProfile({
        name: name.trim(),
        email: email.trim(),
        age: ageN,
        height_cm: heightN,
        weight_kg: weightN,
        activity_level: activity,
        daily_goal_note: note.trim(),
      });
      showAlert("Saved", "Your profile and goals have been updated.");
    } catch (error) {
      console.error("Profile save failed:", error);
      const message =
        error instanceof Error ? error.message : "Could not save. Please try again.";
      showAlert("Error", message);
    } finally {
      setSaving(false);
    }
  };

  const rightPanel = (
    <>
      <InsightSection label="Your Stats">
        <Card elevated>
          <View style={styles.statGrid}>
            <StatBox label="BMI" value={bmi} />
            <StatBox label="Age" value={age || "—"} />
            <StatBox label="Height" value={height ? `${height}cm` : "—"} />
            <StatBox label="Weight" value={weight ? `${weight}kg` : "—"} />
          </View>
        </Card>
      </InsightSection>
      <InsightSection label="Streak">
        <Card>
          <View style={styles.streakRow}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={styles.streakValue}>{streak} day streak</Text>
          </View>
          <ProgressBar value={Math.min(streak, 30)} max={30} color={colors.primary} showValues suffix=" days" />
        </Card>
      </InsightSection>
      <InsightSection label="Daily Targets">
        <Card>
          <TargetRow label="Calories" value={`${calories} kcal`} color={colors.primary} />
          <TargetRow label="Protein" value={`${protein}g`} color={colors.secondary} />
          <TargetRow
            label="Water"
            value={
              hydration
                ? `${(Number.parseInt(hydration, 10) / 1000).toFixed(1)}L`
                : "—"
            }
            color={colors.secondary}
          />
          <TargetRow label="Fiber" value={`${fiber}g`} color={colors.primary} />
        </Card>
      </InsightSection>
      <InsightSection label="AI Tip">
        <Card>
          <Text style={styles.tipText}>
            Complete your profile for more accurate calorie recommendations based on your activity level.
          </Text>
        </Card>
      </InsightSection>
    </>
  );

  return (
    <AppShell
      title="NutriSnap AI"
      subtitle="Profile & Goals"
      streak={streak}
      rightPanelTitle="Profile Insights"
      rightPanel={rightPanel}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {!formReady ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 48 }} />
        ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.profileHeader}>
            <ProfileAvatar
              uri={profile.profile_image_uri}
              name={name}
              size={isDesktop ? 96 : 80}
              editable
              onImagePicked={(uri) => saveProfile({ profile_image_uri: uri })}
            />
            <View style={styles.profileMeta}>
              <Text style={styles.profileName}>{name || "Your Name"}</Text>
              <Text style={styles.profileEmail}>{email || "Add your email"}</Text>
              <Text style={styles.profileActivity}>
                {ACTIVITY_LEVELS.find((a) => a.value === activity)?.label ?? "Moderate"} activity
              </Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Personal Details</Text>
          <ProfileField label="Full Name" value={name} onChange={setName} placeholder="Marcus Chen" />
          <ProfileField label="Email" value={email} onChange={setEmail} placeholder="you@email.com" keyboard="email-address" />
          <View style={isDesktop ? styles.rowDesktop : undefined}>
            <ProfileField label="Age" value={age} onChange={setAge} keyboard="number-pad" suffix="yrs" />
            <ProfileField label="Height" value={height} onChange={setHeight} keyboard="number-pad" suffix="cm" />
            <ProfileField label="Weight" value={weight} onChange={setWeight} keyboard="number-pad" suffix="kg" />
          </View>

          <Text style={styles.sectionTitle}>Activity Level</Text>
          <View style={styles.activityRow}>
            {ACTIVITY_LEVELS.map((level) => (
              <TouchableOpacity
                key={level.value}
                style={[styles.activityChip, activity === level.value && styles.activityChipActive]}
                onPress={() => setActivity(level.value)}
              >
                <Text
                  style={[
                    styles.activityChipText,
                    activity === level.value && styles.activityChipTextActive,
                  ]}
                >
                  {level.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Daily Macro Goals</Text>
          <View style={isDesktop ? styles.rowDesktop : undefined}>
            <GoalField label="Calories" value={calories} onChange={setCalories} suffix="cal" accent={colors.primary} />
            <GoalField label="Protein" value={protein} onChange={setProtein} suffix="g" accent={colors.secondary} />
            <GoalField label="Carbs" value={carbs} onChange={setCarbs} suffix="g" accent={colors.tertiary} />
            <GoalField label="Fat" value={fat} onChange={setFat} suffix="g" accent={colors.fat} />
          </View>

          <Text style={styles.sectionTitle}>Nutrient Targets</Text>
          <View style={isDesktop ? styles.rowDesktop : undefined}>
            <GoalField label="Hydration" value={hydration} onChange={setHydration} suffix="ml" accent={colors.secondary} />
            <GoalField label="Fiber" value={fiber} onChange={setFiber} suffix="g" accent={colors.primary} />
            <GoalField label="Sugar Limit" value={sugar} onChange={setSugar} suffix="g" accent={colors.tertiary} />
          </View>

          <Text style={styles.sectionTitle}>Goal Note</Text>
          <TextInput
            style={styles.noteInput}
            value={note}
            onChangeText={setNote}
            placeholder="e.g. Lean bulk, marathon prep..."
            placeholderTextColor={colors.muted}
            multiline
          />

          <Button
            label={saving ? "Saving..." : "Save Profile & Goals"}
            onPress={saveAll}
            disabled={saving}
            style={{ marginTop: spacing.lg, marginBottom: spacing.xl }}
          />
        </ScrollView>
        )}
      </KeyboardAvoidingView>
    </AppShell>
  );
}

function ProfileField({
  label,
  value,
  onChange,
  placeholder,
  keyboard,
  suffix,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  keyboard?: "default" | "email-address" | "number-pad";
  suffix?: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.fieldRow}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          keyboardType={keyboard ?? "default"}
          editable={true}
        />
        {suffix ? <Text style={styles.fieldSuffix}>{suffix}</Text> : null}
      </View>
    </View>
  );
}

function GoalField({
  label,
  value,
  onChange,
  suffix,
  accent,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  suffix: string;
  accent: string;
}) {
  return (
    <View style={[styles.field, { flex: 1, minWidth: 140 }]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.fieldRow}>
        <TextInput
          style={[styles.input, { borderColor: accent }]}
          value={value}
          onChangeText={onChange}
          keyboardType={Platform.OS === "web" ? "numeric" : "number-pad"}
          placeholderTextColor={colors.muted}
          editable={true}
        />
        <Text style={[styles.fieldSuffix, { color: accent }]}>{suffix}</Text>
      </View>
    </View>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statBoxValue}>{value}</Text>
      <Text style={styles.statBoxLabel}>{label}</Text>
    </View>
  );
}

function TargetRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.targetRow}>
      <Text style={styles.targetLabel}>{label}</Text>
      <Text style={[styles.targetValue, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.xxl },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    marginBottom: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  profileMeta: { flex: 1 },
  profileName: { color: colors.text, fontSize: 22, fontWeight: "800" },
  profileEmail: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  profileActivity: { color: colors.primary, fontSize: 12, fontWeight: "600", marginTop: 4 },
  sectionTitle: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  rowDesktop: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  field: { marginBottom: spacing.md },
  fieldLabel: { color: colors.text, fontSize: 14, fontWeight: "600", marginBottom: 6 },
  fieldRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  input: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
    padding: spacing.md,
  },
  fieldSuffix: { color: colors.muted, fontSize: 14, fontWeight: "600", width: 36 },
  activityRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.lg },
  activityChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  activityChipActive: { borderColor: colors.primary, backgroundColor: colors.cardElevated },
  activityChipText: { color: colors.muted, fontSize: 12, fontWeight: "600" },
  activityChipTextActive: { color: colors.primary },
  noteInput: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontSize: 14,
    padding: spacing.md,
    minHeight: 80,
    textAlignVertical: "top",
    marginBottom: spacing.md,
  },
  statGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  statBox: {
    flex: 1,
    minWidth: "40%",
    backgroundColor: colors.cardElevated,
    borderRadius: radius.sm,
    padding: spacing.sm,
    alignItems: "center",
  },
  statBoxValue: { color: colors.primary, fontSize: 18, fontWeight: "800" },
  statBoxLabel: { color: colors.muted, fontSize: 10, marginTop: 2 },
  streakRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.sm },
  streakEmoji: { fontSize: 28 },
  streakValue: { color: colors.text, fontSize: 16, fontWeight: "700" },
  targetRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  targetLabel: { color: colors.muted, fontSize: 12 },
  targetValue: { fontSize: 13, fontWeight: "700" },
  tipText: { color: colors.textSecondary, fontSize: 13, lineHeight: 20 },
});
