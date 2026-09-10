import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { EngineProvider, useStore } from '@/store';

SplashScreen.preventAutoHideAsync();

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
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

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

export default function RootLayout() {
  return (
    <EngineProvider>
      <Routing />
    </EngineProvider>
  );
}
