import { Stack } from "expo-router";

import { color } from "@/constants/tokens";
import { useThemeMode } from "@/hooks/use-theme";

export default function OnboardingLayout() {
  const mode = useThemeMode();

  return (
    <Stack
      initialRouteName="wallet"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: color[mode].background },
        animation: "fade",
      }}
    >
      <Stack.Screen name="wallet" />
      <Stack.Screen name="period" />
      <Stack.Screen name="category" />
    </Stack>
  );
}
