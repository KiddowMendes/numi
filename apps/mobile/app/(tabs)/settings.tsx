import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ScreenBackground } from "@/components/screen-background";
import { ThemedText } from "@/components/themed-text";
import { GroupList, GroupRow, PillToggle } from "@/components/ui";
import {
  screenPadding,
  spacing,
  themePreferences,
  type ThemePreferenceValue,
} from "@/constants/tokens";
import { useStore } from "@/store";

const THEME_OPTIONS = themePreferences.map((preference) => ({
  value: preference.value,
  label: preference.label,
  icon:
    preference.value === "light"
      ? ("sun" as const)
      : preference.value === "dark"
        ? ("moon" as const)
        : ("device" as const),
}));

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const preference = useStore((s) => s.themePreference);
  const setPreference = useStore((s) => s.setThemePreference);

  const active = themePreferences.find((option) => option.value === preference);

  return (
    <ScreenBackground style={styles.root}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: insets.top + spacing.lg,
            paddingBottom: insets.bottom + 120,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ThemedText type="heading1">Settings</ThemedText>
        </View>

        <PillToggle
          label="Appearance"
          options={THEME_OPTIONS}
          value={preference}
          onChange={(value: ThemePreferenceValue) => setPreference(value)}
        />
        {active ? (
          <ThemedText type="caption" tone="textMuted" style={styles.note}>
            {active.description}
          </ThemedText>
        ) : null}

        <GroupList label="About">
          <GroupRow
            label="NUMI"
            detail="Version 0.1.0"
            trailingIcon={undefined}
            isLast
          />
        </GroupList>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: screenPadding,
    gap: spacing.xl,
  },
  header: {
    gap: spacing.xs,
  },
  note: {
    marginTop: -spacing.md,
    marginLeft: spacing.xs,
  },
});
