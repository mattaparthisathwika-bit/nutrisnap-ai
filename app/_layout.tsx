import { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { initDatabase } from "../src/utils/database";
import { ProfileProvider } from "../src/context/ProfileContext";
import { colors } from "../src/constants/theme";

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initDatabase()
      .then(() => setReady(true))
      .catch((error) => {
        console.error("Database init failed:", error);
        setReady(true);
      });
  }, []);

  if (!ready) {
    return (
      <SafeAreaProvider>
        <GestureHandlerRootView style={styles.root}>
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
          <StatusBar style="light" />
        </GestureHandlerRootView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <ProfileProvider>
        <GestureHandlerRootView style={styles.root}>
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="index" />
          </Stack>
        </GestureHandlerRootView>
      </ProfileProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loading: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: "center",
    alignItems: "center",
  },
});
