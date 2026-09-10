import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { Component, type ReactNode, useEffect } from 'react';
import { Text, useColorScheme, View } from 'react-native';

import { EngineProvider, useStore } from '@/store';

SplashScreen.preventAutoHideAsync();

setTimeout(() => {
  SplashScreen.hideAsync().catch(() => {});
}, 5000);

function Routing() {
  const activePeriod = useStore((s) => s.appState.activePeriod);
  const colorScheme = useColorScheme();

  const [fontsLoaded] = useFonts({
    Inter: require('@expo-google-fonts/inter/400Regular'),
    'Inter-Medium': require('@expo-google-fonts/inter/500Medium'),
    'Inter-SemiBold': require('@expo-google-fonts/inter/600SemiBold'),
    'Inter-Bold': require('@expo-google-fonts/inter/700Bold'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
    const timeout = setTimeout(() => {
      SplashScreen.hideAsync();
    }, 5000);
    return () => clearTimeout(timeout);
  }, [fontsLoaded]);

  return (
    <ThemeProvider
      value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        key={activePeriod ? 'tabs' : 'onboarding'}
        screenOptions={{ headerShown: false }}
      >
        {activePeriod ? (
          <Stack.Screen name="(tabs)" />
        ) : (
          <Stack.Screen name="(onboarding)" />
        )}
        <Stack.Screen name="review" />
      </Stack>
    </ThemeProvider>
  );
}

type ErrorBoundaryState = { hasError: boolean; message?: string };

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message };
  }

  componentDidCatch() {
    SplashScreen.hideAsync().catch(() => {});
  }

  render() {
    if (this.state.hasError) {
      return (
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Text style={{ fontSize: 16, marginBottom: 8 }}>Something went wrong</Text>
          <Text>{this.state.message}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <EngineProvider>
        <Routing />
      </EngineProvider>
    </ErrorBoundary>
  );
}
