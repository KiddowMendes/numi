import "@/lib/polyfill";

import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { Component, type ReactNode, useCallback, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { Toast, buildToastConfig } from "@/components/app-toast";
import { EngineProvider, useStore } from "@/store";
import { color, spacing, typography } from "@/constants/tokens";
import { useThemeMode } from "@/hooks/use-theme";

SplashScreen.preventAutoHideAsync().catch(() => {});

/**
 * The splash is held only until Inter is measured, with a hard ceiling so a
 * font that never loads cannot strand the user on a blank screen. The previous
 * version had two independent five-second timers, which meant a five-second
 * wait even when the fonts were ready in 200ms.
 */
const SPLASH_CEILING_MS = 1500;

function AppToast() {
  const mode = useThemeMode();
  return <Toast config={buildToastConfig(color[mode])} topOffset={72} />;
}

function Routing() {
  const isOnboarded = useStore((s) => s.isOnboarded);
  const mode = useThemeMode();

  const [fontsLoaded, fontError] = useFonts({
    Inter: require("@expo-google-fonts/inter/400Regular"),
    "Inter-Medium": require("@expo-google-fonts/inter/500Medium"),
    "Inter-SemiBold": require("@expo-google-fonts/inter/600SemiBold"),
    "Inter-Bold": require("@expo-google-fonts/inter/700Bold"),
  });

  const ready = fontsLoaded || !!fontError;

  const hide = useCallback(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  useEffect(() => {
    if (!ready) return;
    hide();
    const ceiling = setTimeout(hide, SPLASH_CEILING_MS);
    return () => clearTimeout(ceiling);
  }, [ready, hide]);

  if (!ready) return null;

  const theme = color[mode];

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.background },
      }}
    >
      <Stack.Protected guard={!isOnboarded}>
        <Stack.Screen name="(onboarding)" />
      </Stack.Protected>
      <Stack.Protected guard={isOnboarded}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="review" />
      </Stack.Protected>
    </Stack>
  );
}

type ErrorBoundaryState = { hasError: boolean; message?: string };

class ErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message };
  }

  componentDidCatch() {
    SplashScreen.hideAsync().catch(() => {});
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <View style={styles.crash}>
        <Text style={styles.crashTitle}>Something went wrong</Text>
        <Text style={styles.crashBody} numberOfLines={4}>
          {this.state.message}
        </Text>
      </View>
    );
  }
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <EngineProvider>
          <Routing />
          <AppToast />
        </EngineProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  crash: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    backgroundColor: color.light.background,
  },
  crashTitle: {
    ...typography.title,
    color: color.light.textPrimary,
    marginBottom: spacing.sm,
  },
  crashBody: {
    ...typography.label,
    color: color.light.textSecondary,
    textAlign: "center",
  },
});
