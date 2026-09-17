import { useRef } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  type ViewStyle,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { radius, spacing } from '@/constants/tokens';
import { useTheme } from '@/hooks/use-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type Category = {
  id: string;
  name: string;
  color: string;
};

type CategoryChipProps = {
  categories: Category[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  style?: ViewStyle;
};

export function CategoryChip({ categories, selectedId, onSelect, style }: CategoryChipProps) {
  const theme = useTheme();
  const scheme = useColorScheme();
  const mode = scheme === 'unspecified' ? 'light' : scheme;
  const scrollRef = useRef<ScrollView>(null);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.container, style]}
    >
      {categories.map((cat) => {
        const isSelected = cat.id === selectedId;
        const chipBg = isSelected ? cat.color : 'transparent';
        const chipBorder = isSelected ? cat.color : theme.borderSubtle;
        const textColor = isSelected
          ? (mode === 'dark' ? '#01030e' : '#ffffff')
          : theme.textPrimary;

        return (
          <Pressable
            key={cat.id}
            onPress={() => onSelect(cat.id)}
            style={({ pressed }: { pressed: boolean }) => [
              styles.chip,
              { backgroundColor: chipBg, borderColor: chipBorder },
              pressed && styles.pressed,
            ]}
          >
            <ThemedView style={[styles.dot, { backgroundColor: cat.color }]} />
            <ThemedText type="label" style={{ color: textColor }}>
              {cat.name}
            </ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
});
