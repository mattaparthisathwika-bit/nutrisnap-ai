import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ProfileAvatar } from "../profile/ProfileAvatar";
import { useProfile } from "../../context/ProfileContext";
import { colors, radius, spacing } from "../../constants/theme";

const NAV_ITEMS = [
  { href: "/(tabs)/snap", label: "Snap", icon: "camera-outline" as const },
  { href: "/(tabs)/diary", label: "Diary", icon: "book-outline" as const },
  { href: "/(tabs)/history", label: "History", icon: "time-outline" as const },
  { href: "/(tabs)/profile", label: "Profile", icon: "person-outline" as const },
];

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { profile } = useProfile();

  return (
    <View style={styles.sidebar}>
      <View style={styles.brand}>
        <Text style={styles.brandName}>NutriSnap AI</Text>
        <Text style={styles.brandTier}>Smart Nutrition</Text>
      </View>

      <View style={styles.nav}>
        {NAV_ITEMS.map((item) => {
          const segment = item.label.toLowerCase();
          const active = pathname.includes(segment);
          return (
            <TouchableOpacity
              key={item.href}
              style={[styles.navItem, active && styles.navItemActive]}
              onPress={() => router.push(item.href)}
            >
              <Ionicons
                name={item.icon}
                size={20}
                color={active ? colors.primary : colors.muted}
              />
              <Text style={[styles.navLabel, active && styles.navLabelActive]}>
                {item.label}
              </Text>
              {active ? <View style={styles.activeBar} /> : null}
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={styles.userCard}
        onPress={() => router.push("/(tabs)/profile")}
      >
        <ProfileAvatar
          uri={profile.profile_image_uri}
          name={profile.name}
          size={44}
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName} numberOfLines={1}>{profile.name}</Text>
          <Text style={styles.userGoal}>
            Daily Goal: {profile.weight_kg ? `${profile.weight_kg}kg` : "Set profile"}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.muted} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 240,
    backgroundColor: colors.card,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    justifyContent: "space-between",
  },
  brand: { paddingHorizontal: spacing.sm, marginBottom: spacing.xl },
  brandName: { color: colors.primary, fontSize: 20, fontWeight: "800" },
  brandTier: { color: colors.muted, fontSize: 12, marginTop: 2 },
  nav: { flex: 1, gap: spacing.xs },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    position: "relative",
  },
  navItemActive: { backgroundColor: colors.cardElevated },
  navLabel: { color: colors.muted, fontSize: 15, fontWeight: "600" },
  navLabelActive: { color: colors.primary },
  activeBar: {
    position: "absolute",
    right: 0,
    top: 8,
    bottom: 8,
    width: 3,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardElevated,
  },
  userInfo: { flex: 1 },
  userName: { color: colors.text, fontSize: 13, fontWeight: "700" },
  userGoal: { color: colors.muted, fontSize: 10, marginTop: 2 },
});
