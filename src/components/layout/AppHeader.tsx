import { View, Text, StyleSheet } from "react-native";
import { StreakBadge } from "./StreakBadge";
import { ProfileAvatar } from "../profile/ProfileAvatar";
import { useProfile } from "../../context/ProfileContext";
import { colors, spacing } from "../../constants/theme";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  streak?: number;
  mobile?: boolean;
  rightAction?: React.ReactNode;
}

export function AppHeader({ title, subtitle, streak = 0, mobile, rightAction }: AppHeaderProps) {
  const { profile } = useProfile();

  return (
    <View style={[styles.header, mobile && styles.headerMobile]}>
      <View style={styles.left}>
        <View style={styles.titleRow}>
          <ProfileAvatar
            uri={profile.profile_image_uri}
            name={profile.name}
            size={mobile ? 36 : 40}
          />
          <View style={styles.titleBlock}>
            <Text style={[styles.title, mobile && styles.titleMobile]}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
        </View>
      </View>
      <View style={styles.right}>
        {streak > 0 ? <StreakBadge streak={streak} compact={mobile} /> : null}
        {rightAction}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerMobile: { paddingHorizontal: spacing.md },
  left: { flex: 1 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  titleBlock: { flex: 1 },
  right: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  title: { color: colors.primary, fontSize: 22, fontWeight: "800" },
  titleMobile: { fontSize: 18 },
  subtitle: { color: colors.textSecondary, fontSize: 12, marginTop: 1 },
});
