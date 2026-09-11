import { type ReactNode, useCallback, useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  type ViewStyle,
} from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { color, radius, spacing, zIndex } from '@/constants/tokens';
import { useTheme } from '@/hooks/use-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  style?: ViewStyle;
};

export function BottomSheet({ visible, onClose, children, title, style }: BottomSheetProps) {
  const theme = useTheme();
  const scheme = useColorScheme();
  const mode = scheme === 'unspecified' ? 'light' : scheme;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const sheetAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const animateIn = useCallback(() => {
    Animated.parallel([
      Animated.timing(overlayAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.spring(sheetAnim, {
        toValue: 0,
        damping: 30,
        stiffness: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [overlayAnim, sheetAnim]);

  const animateOut = useCallback(
    (callback?: () => void) => {
      Animated.parallel([
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(sheetAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(callback);
    },
    [overlayAnim, sheetAnim],
  );

  useEffect(() => {
    if (visible) {
      animateIn();
    }
  }, [visible, animateIn]);

  const handleClose = useCallback(() => {
    animateOut(onClose);
  }, [animateOut, onClose]);

  const overlayBg = mode === 'dark' ? 'rgba(1,3,14,0.7)' : 'rgba(0,0,0,0.4)';
  const sheetBg = mode === 'dark' ? color.dark.surface : color.light.surface;
  const handleColor = mode === 'dark' ? color.dark.borderSubtle : color.light.borderSubtle;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <Animated.View
        style={[styles.overlay, { backgroundColor: overlayBg, opacity: overlayAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
      </Animated.View>

      <Animated.View
        style={[
          styles.sheet,
          { backgroundColor: sheetBg, transform: [{ translateY: sheetAnim }] },
          style,
        ]}>
        <ThemedView style={[styles.handle, { backgroundColor: handleColor }]} />

        {title && (
          <ThemedView style={styles.titleRow}>
            <ThemedText type="heading2" themeColor="textPrimary">
              {title}
            </ThemedText>
          </ThemedView>
        )}

        <ThemedView style={styles.content}>{children}</ThemedView>
      </Animated.View>
    </Modal>
  );
}

import { ThemedText } from '@/components/themed-text';

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: zIndex.overlay,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: zIndex.sheet,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    maxHeight: SCREEN_HEIGHT * 0.85,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  titleRow: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['3xl'],
  },
});
