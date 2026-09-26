import { StyleSheet, type ColorValue } from "react-native";
import { Tabs } from "expo-router";

import { AppIcon, type IconName } from "@/components/app-icon";
import {
  radius,
  shadow,
  spacing,
  typography,
  zIndex,
} from "@/constants/tokens";
import { useTheme } from "@/hooks/use-theme";

type TabDef = { name: string; title: string; icon: IconName };

const TABS: TabDef[] = [
  { name: "index", title: "Home", icon: "home" },
  { name: "plan", title: "Plan", icon: "plan" },
  { name: "history", title: "History", icon: "history" },
  { name: "settings", title: "Settings", icon: "settings" },
];

export default function TabsLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: [
          styles.bar,
          {
            backgroundColor: theme.surface,
            borderTopColor: theme.borderSubtle,
            shadowColor: shadow.lg.shadowColor,
          },
        ],
        tabBarLabelStyle: styles.label,
        tabBarItemStyle: styles.item,
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarAccessibilityLabel: tab.title,
            tabBarIcon: ({
              color: tint,
              focused,
            }: {
              color: ColorValue;
              focused: boolean;
            }) => (
              <AppIcon
                name={tab.icon}
                size={24}
                color={String(tint)}
                weight={focused ? "fill" : "regular"}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    borderTopWidth: StyleSheet.hairlineWidth * 2,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    elevation: 0,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    zIndex: zIndex.dock,
  },
  item: {
    paddingVertical: spacing.xs,
  },
  label: {
    ...typography.overline,
    fontSize: 10,
    marginTop: spacing["3xs"],
  },
});
