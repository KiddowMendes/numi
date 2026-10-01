import { Stack } from "expo-router";

import { color } from "@/constants/tokens";
import { useThemeMode } from "@/hooks/use-theme";

export default function OnboardingLayout() {
  const mode = useThemeMode();

  return (
    <Stack
      initialRouteName="welcome"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: color[mode].background },
        // A cross-fade rather than a slide: the PIN screen runs its own
        // horizontal slide internally, and stacking two horizontal motions on
        // one transition reads as a lurch.
        animation: "fade",
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="pin" />
      <Stack.Screen name="quick-setup" />
      <Stack.Screen name="all-set" />
    </Stack>
  );
}
