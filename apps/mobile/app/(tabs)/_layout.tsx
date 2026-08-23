import { Tabs } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from 'react-native';

export default function TabsLayout() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.backgroundElement,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Budget',
          tabBarIcon: ({ color }) => (
            <ThemedText type="small" style={{ color }}>$</ThemedText>
          ),
        }}
      />
      <Tabs.Screen
        name="spending"
        options={{
          title: 'Spending',
          tabBarIcon: ({ color }) => (
            <ThemedText type="small" style={{ color }}>-</ThemedText>
          ),
        }}
      />
      <Tabs.Screen
        name="review"
        options={{
          title: 'Review',
          tabBarIcon: ({ color }) => (
            <ThemedText type="small" style={{ color }}>R</ThemedText>
          ),
        }}
      />
    </Tabs>
  );
}
