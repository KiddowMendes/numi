import type { ReactNode } from "react";
import { useCallback, useEffect } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
  type ViewStyle,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { ThemedText } from "@/components/themed-text";
import { duration, radius, spacing, zIndex } from "@/constants/tokens";
import { useTheme } from "@/hooks/use-theme";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  children?: ReactNode;
  title?: string;
  style?: ViewStyle;
};

const HANDLE = { width: 36, height: 4 } as const;

/**
 * A sheet, not a spring. The previous version drove it with `Animated.spring`,
 * which the motion spec forbids outright: overshoot on a sheet holding money
 * reads as playful, and this is a tool. It also read `Dimensions.get` at module
 * scope, which never re-measured on rotate.
 */
export function BottomSheet({
  visible,
  onClose,
  children,
  title,
  style,
}: BottomSheetProps) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();
  const { height: windowHeight } = useWindowDimensions();

  const progress = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      progress.value = 0;
      progress.value = withTiming(1, {
        duration: reduceMotion ? 0 : duration.base,
        easing: Easing.out(Easing.cubic),
      });
    }
  }, [visible, progress, reduceMotion]);

  const dismiss = useCallback(() => {
    // `progress.value = withTiming(...)` is Reanimated's documented API for
    // starting an animation from a JS event handler; the animation itself runs
    // on the UI thread. The immutability rule reads it as a render-scope
    // mutation, so it is suppressed here rather than worked around.
    // eslint-disable-next-line react-hooks/immutability
    progress.value = withTiming(
      0,
      {
        duration: reduceMotion ? 0 : duration.fast,
        easing: Easing.in(Easing.cubic),
      },
      (finished) => {
        if (finished) onClose();
      },
    );
  }, [progress, onClose, reduceMotion]);

  const scrimStyle = useAnimatedStyle(() => ({ opacity: progress.value }));

  const sheetStyle = useAnimatedStyle(
    () => ({
      opacity: progress.value,
      transform: [{ translateY: (1 - progress.value) * windowHeight * 0.4 }],
    }),
    [windowHeight],
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={dismiss}
      statusBarTranslucent
    >
      <View style={styles.root}>
        <Animated.View
          style={[styles.scrim, { backgroundColor: theme.overlay }, scrimStyle]}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={dismiss}
            accessibilityLabel="Close"
            accessibilityRole="button"
          />
        </Animated.View>

        <Animated.View
          accessibilityViewIsModal
          accessibilityLabel={title}
          style={[
            styles.sheet,
            {
              backgroundColor: theme.surface,
              maxHeight: windowHeight * 0.7,
              borderColor: theme.borderSubtle,
            },
            sheetStyle,
            style,
          ]}
        >
          <View style={styles.grabArea}>
            <View style={[styles.handle, { backgroundColor: theme.border }]} />
          </View>

          {title ? (
            <View style={styles.titleRow}>
              <ThemedText type="heading2">{title}</ThemedText>
            </View>
          ) : null}

          <View style={styles.body}>{children}</View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "flex-end",
  },
  scrim: {
    ...StyleSheet.absoluteFill,
    zIndex: zIndex.overlay,
  },
  sheet: {
    borderTopLeftRadius: radius["2xl"],
    borderTopRightRadius: radius["2xl"],
    borderTopWidth: StyleSheet.hairlineWidth * 2,
    paddingBottom: spacing.xl,
    zIndex: zIndex.sheet,
  },
  grabArea: {
    alignItems: "center",
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  handle: {
    ...HANDLE,
    borderRadius: radius.full,
  },
  titleRow: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  body: {
    paddingHorizontal: spacing.xl,
  },
});
