import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { EngineProvider, useStore } from '@/store';

SplashScreen.preventAutoHideAsync();

function Routing() {
  const activePeriod = useStore((s) => s.appState.activePeriod);
  const colorScheme = useColorScheme();

  const [fontsLoaded] = useFonts({
    Inter: require('@expo-google-fonts/inter/Inter-Regular.ttf'),
    'Inter-Bold': require('@expo-google-fonts/inter/Inter-Bold.ttf'),
    'Inter-SemiBold': require('@expo-google-fonts/inter/Inter-SemiBold.ttf'),
    'Inter-Medium': require('@expo-google-fonts/inter/Inter-Medium.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

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
