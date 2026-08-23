import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { EngineProvider, useStore } from '@/store';

SplashScreen.preventAutoHideAsync();

function Routing() {
  const activePeriod = useStore((s) => s.appState.activePeriod);
  const colorScheme = useColorScheme();

  // expo-router file-based routing:
  //   (onboarding)/  → when no active period
  //   (tabs)/        → when active period exists
  //
  // We use a key on ThemeProvider to force re-render when the route group changes.
  // The actual routing is driven by the file system — expo-router handles the rest.
  // Here we just ensure the right theme and splash behavior.

  return (
    <ThemeProvider
      key={activePeriod ? 'tabs' : 'onboarding'}
      value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <EngineProvider>
      <Routing />
    </EngineProvider>
  );
}
