import { useState } from "react";
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Text,
  Pressable,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { colors, spacing } from "../../constants/theme";
import { Sidebar } from "./Sidebar";
import { AppHeader } from "./AppHeader";
import { RightInsightsPanel } from "./RightInsightsPanel";

interface AppShellProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  streak?: number;
  rightPanel?: React.ReactNode;
  rightPanelTitle?: string;
  rightAction?: React.ReactNode;
  noPadding?: boolean;
}

export function AppShell({
  children,
  title,
  subtitle,
  streak,
  rightPanel,
  rightPanelTitle = "Insights",
  rightAction,
  noPadding,
}: AppShellProps) {
  const { isDesktop, isTablet, isMobile } = useBreakpoint();
  const [insightsOpen, setInsightsOpen] = useState(false);
  const showSidePanel = (isDesktop || isTablet) && rightPanel;

  const insightsToggle = rightPanel ? (
    <TouchableOpacity style={styles.insightsBtn} onPress={() => setInsightsOpen(true)}>
      <Ionicons name="analytics-outline" size={18} color={colors.primary} />
      {!isMobile ? <Text style={styles.insightsBtnText}>Insights</Text> : null}
    </TouchableOpacity>
  ) : null;

  const rightPanelContent = rightPanel ? (
    <RightInsightsPanel title={rightPanelTitle}>{rightPanel}</RightInsightsPanel>
  ) : null;

  if (isDesktop || isTablet) {
    return (
      <View style={styles.desktopRoot}>
        <Sidebar />
        <View style={styles.desktopMain}>
          <AppHeader
            title={title}
            subtitle={subtitle}
            streak={streak}
            rightAction={
              <>
                {insightsToggle}
                {rightAction}
              </>
            }
          />
          <View style={styles.desktopBody}>
            <View style={[styles.desktopContent, noPadding && styles.noPadding]}>
              {children}
            </View>
            {showSidePanel ? (
              <View style={[styles.rightPanel, isTablet && styles.rightPanelTablet]}>
                {rightPanelContent}
              </View>
            ) : null}
          </View>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.mobileRoot} edges={["top"]}>
      <AppHeader
        title={title}
        subtitle={subtitle}
        streak={streak}
        mobile
        rightAction={
          <>
            {insightsToggle}
            {rightAction}
          </>
        }
      />
      <View style={[styles.mobileContent, noPadding && styles.noPadding]}>{children}</View>

      <Modal visible={insightsOpen} animationType="slide" transparent>
        <View style={styles.drawerOverlay}>
          <Pressable style={styles.drawerBackdrop} onPress={() => setInsightsOpen(false)} />
          <View style={styles.drawer}>
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>{rightPanelTitle}</Text>
              <TouchableOpacity onPress={() => setInsightsOpen(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {rightPanel}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  desktopRoot: { flex: 1, flexDirection: "row", backgroundColor: colors.bg },
  desktopMain: { flex: 1 },
  desktopBody: { flex: 1, flexDirection: "row" },
  desktopContent: { flex: 1, padding: 24 },
  rightPanel: {
    width: 340,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
    padding: 20,
    backgroundColor: colors.card,
    zIndex: 10,
    elevation: 10,
  },
  rightPanelTablet: { width: 300 },
  mobileRoot: { flex: 1, backgroundColor: colors.bg },
  mobileContent: { flex: 1, paddingHorizontal: 16 },
  noPadding: { padding: 0, paddingHorizontal: 0 },
  insightsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.cardElevated,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  insightsBtnText: { color: colors.primary, fontSize: 12, fontWeight: "600" },
  drawerOverlay: { flex: 1, flexDirection: "row", justifyContent: "flex-end" },
  drawerBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)" },
  drawer: {
    width: "85%",
    maxWidth: 360,
    backgroundColor: colors.card,
    padding: spacing.lg,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  drawerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  drawerTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
});
