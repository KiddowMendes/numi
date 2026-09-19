import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack initialRouteName="wallet" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="wallet" />
      <Stack.Screen name="period" />
      <Stack.Screen name="category" />
    </Stack>
  );
}
