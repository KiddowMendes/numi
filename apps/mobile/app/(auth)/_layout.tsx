import { Stack } from "expo-router";

import { color } from "@/constants/tokens";
import { useThemeMode } from "@/hooks/use-theme";

export default function AuthLayout() {
  const mode = useThemeMode();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: color[mode].background },
        animation: "fade",
      }}
    >
      <Stack.Screen name="unlock" />
    </Stack>
  );
}
