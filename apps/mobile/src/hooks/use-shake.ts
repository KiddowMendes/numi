import { useCallback } from "react";
import { Platform } from "react-native";
import * as Haptics from "expo-haptics";
import {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { useReducedMotion } from "@/hooks/use-reduced-motion";

const SHAKE_STEP = 50;
const SHAKE_DISTANCE = 10;

/** Pause before the shake, so the error text and the shake land together. */
export const PRE_SHAKE_DELAY_MS = 100;

function errorFeedback() {
  if (Platform.OS === "web") return;
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
}

/**
 * The wrong-PIN gesture: a horizontal jolt plus the error haptic, both
 * suppressed when the user has asked for reduced motion. Shared by `unlock`
 * and `pin`, which fail in the same way from two different flows.
 */
export function useShake() {
  const reduceMotion = useReducedMotion();
  const shakeX = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const triggerShake = useCallback(() => {
    errorFeedback();
    if (reduceMotion) return;
    // `shakeX.value = withSequence(...)` is Reanimated's documented API for
    // starting an animation from a JS event handler; the animation itself
    // runs on the UI thread. The immutability rule reads it as a render-scope
    // mutation, so it is suppressed here rather than worked around. Same
    // pattern as `bottom-sheet.tsx`.
    // eslint-disable-next-line react-hooks/immutability
    shakeX.value = withSequence(
      withTiming(-SHAKE_DISTANCE, { duration: SHAKE_STEP }),
      withTiming(SHAKE_DISTANCE, { duration: SHAKE_STEP }),
      withTiming(-SHAKE_DISTANCE, { duration: SHAKE_STEP }),
      withTiming(0, { duration: SHAKE_STEP }),
    );
  }, [reduceMotion, shakeX]);

  return { shakeStyle, triggerShake };
}
