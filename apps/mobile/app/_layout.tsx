import "@/lib/polyfill";

import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import {
  Component,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  SafeAreaProvider,
  initialWindowMetrics,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { Toast, buildToastConfig } from "@/components/app-toast";
import { color, spacing, typography } from "@/constants/tokens";
import { useThemeMode } from "@/hooks/use-theme";
import { hasPin } from "@/lib/pin";
import { EngineProvider, useStore } from "@/store";

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
  const insets = useSafeAreaInsets();
  return (
    <Toast
      config={buildToastConfig(color[mode])}
      topOffset={insets.top + spacing.xl}
    />
  );
}

function Routing() {
  const isOnboarded = useStore((s) => s.isOnboarded);
  const pinSet = useStore((s) => s.pinSet);
  const isUnlocked = useStore((s) => s.isUnlocked);
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

  // The keychain is the only state that outlives a cold launch, so it decides
  // whether there is a lock to pass. Read once, on mount.
  const [keychainPinSet, setKeychainPinSet] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    void hasPin()
      .then((present) => {
        if (!cancelled) setKeychainPinSet(present);
      })
      .catch((error: unknown) => {
        console.error("[Bootstrap] Keychain read failed:", error);
        // Fail open. A keychain we cannot read is not a reason to strand
        // someone on a splash screen, and the alternative — refusing entry
        // when no PIN is actually set — locks out every first launch.
        if (!cancelled) setKeychainPinSet(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready || keychainPinSet === null) return null;

  const theme = color[mode];

  // `pinSet` is the in-memory mirror the onboarding flow writes; `keychainPinSet`
  // is the durable one. Either means there is a lock.
  const locked = keychainPinSet || pinSet;

  // The lock is asked for on the strength of the hash alone. It must NOT also
  // require `isOnboarded`: after a cold launch the hash survives while
  // `isOnboarded` resets to false, so gating on both would quietly skip the PIN
  // on exactly the return visit it exists for.
  const showUnlock = locked && !isUnlocked;
  const showApp = isOnboarded && (!locked || isUnlocked);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.background },
      }}
    >
      <Stack.Protected guard={!showApp && !showUnlock}>
        <Stack.Screen name="(onboarding)" />
      </Stack.Protected>
      <Stack.Protected guard={showUnlock}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={showApp}>
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
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
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
