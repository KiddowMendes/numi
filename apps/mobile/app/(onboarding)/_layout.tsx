import { Stack } from "expo-router";

import { useStackScreenOptions } from "@/hooks/use-stack-screen-options";

export default function OnboardingLayout() {
  // Cross-fade rather than a slide, per `useStackScreenOptions`: the PIN
  // screen runs its own horizontal slide internally.
  const screenOptions = useStackScreenOptions("fade");

  return (
    <Stack initialRouteName="welcome" screenOptions={screenOptions}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="pin" />
      <Stack.Screen name="quick-setup" />
      <Stack.Screen name="all-set" />
    </Stack>
  );
}
