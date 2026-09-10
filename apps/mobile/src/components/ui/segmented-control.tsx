import { Pressable, StyleSheet, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { color, radius, spacing } from '@/constants/tokens';
import { useTheme } from '@/hooks/use-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type SegmentedControlProps<T extends string> = {
  options: { label: string; value: T }[];
  selected: T;
  onChange: (value: T) => void;
  style?: ViewStyle;
};

export function SegmentedControl<T extends string>({
  options,
  selected,
  onChange,
  style,
}: SegmentedControlProps<T>) {
  const theme = useTheme();
  const scheme = useColorScheme();
  const mode = scheme === 'unspecified' ? 'light' : scheme;

  const trackBg = mode === 'dark' ? color.dark.surfaceRaised : color.light.surfaceRaised;
  const activeBg = mode === 'dark' ? color.dark.primary : color.light.primary;
  const activeText = mode === 'dark' ? color.dark.primaryFg : color.light.primaryFg;
  const inactiveText = mode === 'dark' ? color.dark.textSecondary : color.light.textSecondary;

  return (
    <ThemedView style={[styles.track, { backgroundColor: trackBg }, style]}>
      {options.map((opt) => {
        const isActive = opt.value === selected;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[
              styles.segment,
              isActive && { backgroundColor: activeBg },
            ]}>
            <ThemedText
              type="label"
              style={{ color: isActive ? activeText : inactiveText }}>
              {opt.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    borderRadius: radius.sm,
    padding: 2,
    gap: 2,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.sm - 1,
    minHeight: 36,
  },
});
