import { Stack } from "expo-router";

import { useStackScreenOptions } from "@/hooks/use-stack-screen-options";

export default function AuthLayout() {
  const screenOptions = useStackScreenOptions("fade");

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name="unlock" />
    </Stack>
  );
}
