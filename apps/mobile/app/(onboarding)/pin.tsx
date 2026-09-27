import { useCallback, useState } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { AppIcon } from "@/components/app-icon";
import { ScreenBackground } from "@/components/screen-background";
import { ThemedText } from "@/components/themed-text";
import { PinDots, PinPad, ProgressDots, ScreenShell } from "@/components/ui";
import { duration, spacing } from "@/constants/tokens";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useTheme } from "@/hooks/use-theme";
import { PIN_LENGTH, isCompletePin, savePin } from "@/lib/pin";
import { useStore } from "@/store";

const SLIDE_DURATION = duration.base;
const SHAKE_STEP = 50;
const SHAKE_DISTANCE = 10;

/** Pause after the last digit so the final dot paints before it slides away. */
const PRE_SLIDE_DELAY_MS = 200;
/** Pause before the shake, so the error text and the shake land together. */
const PRE_SHAKE_DELAY_MS = 100;

type Phase = "create" | "confirm";

function errorFeedback() {
  if (Platform.OS === "web") return;
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
}

export default function PinScreen() {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();
  const markPinSet = useStore((s) => s.markPinSet);

  const [phase, setPhase] = useState<Phase>("create");
  const [firstPin, setFirstPin] = useState("");
  const [digits, setDigits] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Measured from the viewport rather than hardcoded: the row is twice the
  // container wide so both phases stay mounted side by side, and a stale
  // measurement after a rotation would leave the second column off-screen.
  const [containerWidth, setContainerWidth] = useState(0);

  const slideX = useSharedValue(0);
  const shakeX = useSharedValue(0);

  const slideStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideX.value }],
  }));

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  // Writing `slideX.value` / `shakeX.value` is Reanimated's documented API for
  // starting an animation from a JS event handler; the animation runs on the UI
  // thread. The immutability rule reads it as a render-scope mutation, so it is
  // suppressed here rather than worked around. Same pattern as
  // `bottom-sheet.tsx`.

  const goToConfirm = useCallback(() => {
    if (containerWidth === 0) return;
    setPhase("confirm");
    // eslint-disable-next-line react-hooks/immutability
    slideX.value = reduceMotion
      ? -containerWidth
      : withTiming(-containerWidth, {
          duration: SLIDE_DURATION,
          easing: Easing.out(Easing.cubic),
        });
  }, [containerWidth, reduceMotion, slideX]);

  const goToCreate = useCallback(() => {
    setPhase("create");
    setFirstPin("");
    setDigits("");
    setError("");
    // eslint-disable-next-line react-hooks/immutability
    slideX.value = reduceMotion
      ? 0
      : withTiming(0, {
          duration: SLIDE_DURATION,
          easing: Easing.out(Easing.cubic),
        });
  }, [reduceMotion, slideX]);

  const triggerShake = useCallback(() => {
    errorFeedback();
    if (reduceMotion) return;
    // eslint-disable-next-line react-hooks/immutability
    shakeX.value = withSequence(
      withTiming(-SHAKE_DISTANCE, { duration: SHAKE_STEP }),
      withTiming(SHAKE_DISTANCE, { duration: SHAKE_STEP }),
      withTiming(-SHAKE_DISTANCE, { duration: SHAKE_STEP }),
      withTiming(0, { duration: SHAKE_STEP }),
    );
  }, [reduceMotion, shakeX]);

  const handleDigitPress = useCallback(
    (digit: string) => {
      if (saving) return;
      if (digits.length >= PIN_LENGTH) return;

      setError("");
      const next = digits + digit;
      setDigits(next);

      if (!isCompletePin(next)) return;

      if (phase === "create") {
        setFirstPin(next);
        setDigits("");
        setTimeout(goToConfirm, PRE_SLIDE_DELAY_MS);
        return;
      }

      if (next === firstPin) {
        setSaving(true);
        savePin(next)
          .then(() => {
            // Only now is the PIN genuinely set. An optimistic flag here would
            // strand the user on `unlock` with no hash in the keychain.
            markPinSet();
            router.replace("/(onboarding)/quick-setup");
          })
          .catch((error: unknown) => {
            console.error("[Pin] Save failed:", error);
            setSaving(false);
            setError("Could not save PIN. Try again.");
            setDigits("");
          });
        return;
      }

      setTimeout(() => {
        triggerShake();
        // The first code is kept. The user re-enters only the confirmation —
        // asking for both again is a papercut for a typo.
        setDigits("");
      }, PRE_SHAKE_DELAY_MS);
    },
    [digits, firstPin, goToConfirm, markPinSet, phase, saving, triggerShake],
  );

  const handleBackspace = useCallback(() => {
    setDigits((current) => current.slice(0, -1));
  }, []);

  const handleBack = useCallback(() => {
    if (phase === "confirm") {
      goToCreate();
      return;
    }
    router.back();
  }, [goToCreate, phase]);

  return (
    <ScreenBackground>
      <ScreenShell paddingBottom={0} style={styles.shell}>
        <Pressable
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={8}
          style={styles.back}
        >
          <AppIcon name="back" size={24} color={theme.textPrimary} />
        </Pressable>

        <View style={styles.header}>
          <ProgressDots total={4} current={1} />
          <ThemedText type="caption" tone="textMuted">
            Step 2 of 4
          </ThemedText>
        </View>

        <View
          style={styles.viewport}
          onLayout={(event) =>
            setContainerWidth(event.nativeEvent.layout.width)
          }
        >
          {containerWidth > 0 ? (
            <Animated.View
              style={[styles.track, { width: containerWidth * 2 }, slideStyle]}
            >
              <View style={[styles.phase, { width: containerWidth }]}>
                <ThemedText type="heading2" style={styles.heading}>
                  Create a PIN
                </ThemedText>
                <PinDots digits={digits} style={styles.dots} />
                <PinPad
                  onDigitPress={handleDigitPress}
                  onBackspace={handleBackspace}
                  disabled={saving}
                  style={styles.pad}
                />
              </View>

              <View style={[styles.phase, { width: containerWidth }]}>
                <Animated.View style={shakeStyle}>
                  <ThemedText type="heading2" style={styles.heading}>
                    Confirm your PIN
                  </ThemedText>
                  <PinDots digits={digits} style={styles.dots} />
                  <PinPad
                    onDigitPress={handleDigitPress}
                    onBackspace={handleBackspace}
                    disabled={saving}
                    style={styles.pad}
                  />
                </Animated.View>

                {error ? (
                  <ThemedText
                    type="caption"
                    tone="stateAlert"
                    align="center"
                    style={styles.error}
                  >
                    {error}
                  </ThemedText>
                ) : null}
              </View>
            </Animated.View>
          ) : null}
        </View>
      </ScreenShell>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  shell: {
    flex: 1,
  },
  back: {
    width: 48,
    height: 48,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  header: {
    gap: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  viewport: {
    flex: 1,
    overflow: "hidden",
  },
  track: {
    flexDirection: "row",
  },
  phase: {
    alignItems: "center",
  },
  heading: {
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  dots: {
    marginBottom: spacing.xl,
  },
  pad: {
    alignSelf: "stretch",
  },
  error: {
    marginTop: spacing.lg,
  },
});
