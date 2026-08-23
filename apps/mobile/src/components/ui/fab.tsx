import { forwardRef } from 'react';
import { Pressable, StyleSheet, type ViewStyle } from 'react-native';

import { color, spacing, zIndex } from '@/constants/tokens';

type FABProps = {
  children: React.ReactNode;
  size?: 'md' | 'lg';
  onPress?: () => void;
  style?: ViewStyle;
};

export const FAB = forwardRef<React.ComponentRef<typeof Pressable>, FABProps>(
  ({ children, size = 'lg', onPress, style }, ref) => {
    const dim = size === 'lg' ? 64 : 48;

    return (
      <Pressable
        ref={ref}
        onPress={onPress}
        style={({ pressed }: { pressed: boolean }) => [
          styles.base,
          {
            width: dim,
            height: dim,
            borderRadius: dim / 2,
          },
          pressed && { transform: [{ scale: 0.92 }] },
          style,
        ]}>
        {children}
      </Pressable>
    );
  },
);

FAB.displayName = 'FAB';

const styles = StyleSheet.create({
  base: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: color.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: zIndex.fab,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  } as ViewStyle,
});
